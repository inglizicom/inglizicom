import { supabase } from './supabase'
import { pushSupported, subscribeToPush } from './push'

/**
 * Notifications (062) for staff and teachers — the bell, the inbox, targeted
 * sending, the message log — plus the student's "message my teacher".
 * Rows are written by the database (events, send RPCs); screens only read,
 * mark read, and send. After a send, the screen nudges the push dispatcher
 * in case the database could not (no pg_net).
 */

export interface AppNotification {
  id: string; kind: string; title: string; body: string | null; url: string | null
  read_at: string | null; created_at: string; message_id: string | null
}

export interface SentMessage {
  id: string; created_at: string; sender_role: 'founder' | 'assistant' | 'teacher' | 'student'
  sender_name: string | null; title: string; body: string | null
  recipients: { kind: 'teacher' | 'student' | 'staff'; id: string | null; name: string | null }[]
  recipient_count: number
}

const arabic = (msg: string): string => {
  if (/at least one recipient/i.test(msg)) return 'اختر مستلمًا واحدًا على الأقل.'
  if (/Write a title/i.test(msg)) return 'اكتب عنوان الإشعار.'
  if (/Write your message/i.test(msg)) return 'اكتب رسالتك.'
  if (/Too many recipients/i.test(msg)) return 'عدد المستلمين كبير (500 كحد أقصى).'
  if (/Daily limit/i.test(msg)) return 'وصلت إلى الحد اليومي للرسائل — حاول غدًا.'
  if (/not one of yours/i.test(msg)) return 'أحد الطلاب المختارين ليس من طلابك.'
  if (/Not your class/i.test(msg)) return 'هذا القسم ليس من أقسامك.'
  if (/Not your teacher/i.test(msg)) return 'هذا الأستاذ ليس أستاذك.'
  return msg
}

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** Ask the site to deliver queued pushes now (best effort). */
export async function kickDispatch(studentToken?: string): Promise<void> {
  try {
    const token = studentToken ? null : await bearer()
    await fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(studentToken ? { token: studentToken } : {}),
      keepalive: true,
    })
  } catch { /* the cron delivers it later */ }
}

/* ── Reading ─────────────────────────────────────────────── */

export async function fetchMyNotifications(userId: string, limit = 40): Promise<AppNotification[]> {
  const { data, error } = await supabase.from('notifications')
    .select('id, kind, title, body, url, read_at, created_at, message_id')
    .eq('recipient', userId).order('created_at', { ascending: false }).limit(limit)
  if (error) return []
  return (data ?? []) as AppNotification[]
}

export async function countUnread(userId: string): Promise<number> {
  const { count, error } = await supabase.from('notifications')
    .select('id', { count: 'exact', head: true }).eq('recipient', userId).is('read_at', null)
  return error ? 0 : count ?? 0
}

/** Mark some (or, with no ids, all) of my notifications read. */
export async function markRead(ids?: string[]): Promise<void> {
  await supabase.rpc('notifications_mark_read', { p_ids: ids && ids.length ? ids : null })
}

/** Every message sent through the platform (staff), or my own sent ones (teacher) — RLS decides. */
export async function fetchMessageLog(limit = 100): Promise<SentMessage[]> {
  const { data, error } = await supabase.from('notification_messages')
    .select('id, created_at, sender_role, sender_name, title, body, recipients, recipient_count')
    .order('created_at', { ascending: false }).limit(limit)
  if (error) return []
  return (data ?? []) as SentMessage[]
}

/* ── Sending ─────────────────────────────────────────────── */

export async function staffSend(input: {
  title: string; body: string; teachers?: string[]; students?: string[]
  studentsOfTeacher?: string | null; classId?: string | null
}): Promise<{ message_id: string; teachers: number; students: number }> {
  const { data, error } = await supabase.rpc('staff_send_notification', {
    p_title: input.title, p_body: input.body,
    p_teachers: input.teachers ?? [], p_students: input.students ?? [],
    p_students_of_teacher: input.studentsOfTeacher ?? null, p_students_of_class: input.classId ?? null,
  })
  if (error) throw new Error(arabic(error.message))
  kickDispatch()
  return data
}

export async function teacherSend(input: { title: string; body: string; students?: string[]; classId?: string | null })
  : Promise<{ message_id: string; students: number }> {
  const { data, error } = await supabase.rpc('teacher_send_notification', {
    p_title: input.title, p_body: input.body, p_students: input.students ?? [], p_class: input.classId ?? null,
  })
  if (error) throw new Error(arabic(error.message))
  kickDispatch()
  return data
}

/** Staff: who can be picked — teachers and live classes. */
export async function fetchRecipientOptions(): Promise<{
  teachers: { id: string; name: string }[]; classes: { id: string; title: string; teacher_id: string | null }[]
}> {
  const [t, c] = await Promise.all([
    supabase.from('teacher_profiles').select('id, display_name'),
    supabase.from('online_classes').select('id, title, teacher_id').is('archived_at', null).order('title'),
  ])
  return {
    teachers: ((t.data ?? []) as any[]).map(x => ({ id: x.id, name: x.display_name || 'أستاذ' }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    classes: (c.data ?? []) as { id: string; title: string; teacher_id: string | null }[],
  }
}

/* ── Students (portal token) ─────────────────────────────── */

export async function studentMyTeachers(token: string): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase.rpc('student_my_teachers', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as { id: string; name: string }[]
}

/** To a teacher (id) or, with null, to the academy. */
export async function studentSend(token: string, body: string, teacherId: string | null): Promise<void> {
  const { error } = await supabase.rpc('student_send_notification', {
    p_token: token.trim().toUpperCase(), p_body: body, p_teacher: teacherId,
  })
  if (error) throw new Error(arabic(error.message))
  kickDispatch(token)
}

/* ── Phone push for a signed-in account ──────────────────── */

export function accountPushState(): 'unsupported' | 'granted' | 'denied' | 'default' {
  if (!pushSupported()) return 'unsupported'
  return Notification.permission as 'granted' | 'denied' | 'default'
}

/** Ask permission, subscribe this device and link it to the signed-in account. */
export async function enableAccountPush(): Promise<boolean> {
  const sub = await subscribeToPush()
  if (!sub) return false
  const token = await bearer()
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  })
  return res.ok
}

/* ── Display ─────────────────────────────────────────────── */

export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'الآن'
  if (mins < 60) return `قبل ${mins} د`
  const h = Math.floor(mins / 60)
  if (h < 24) return `قبل ${h} س`
  const d = Math.floor(h / 24)
  return d < 30 ? `قبل ${d} ي` : new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })
}

export const ROLE_AR: Record<SentMessage['sender_role'], string> = {
  founder: 'المؤسس', assistant: 'مسؤول العملاء', teacher: 'أستاذ', student: 'طالب',
}
