import { supabase } from './supabase'

export type AnnType = 'popup' | 'banner'
export type AnnSeverity = 'info' | 'update' | 'maintenance'
export type AnnAudience = 'all' | 'course' | 'students'

export interface Announcement {
  id: string; title: string; body: string | null
  type: AnnType; severity: AnnSeverity; audience: AnnAudience
  course_id: string | null; is_active: boolean
  starts_at: string | null; ends_at: string | null; created_at: string
  target_count?: number
}
export interface StudentAnnouncement { id: string; title: string; body: string | null; type: AnnType; severity: AnnSeverity; created_at: string }
export interface StudentLite { id: string; full_name: string; verification_token: string | null; phone_number: string | null }

/* ── CRM ─────────────────────────────────────── */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data } = await supabase.from('announcements').select('*, announcement_targets(student_id)').order('created_at', { ascending: false })
  return ((data ?? []) as any[]).map(a => ({ ...a, target_count: a.announcement_targets?.length ?? 0 }))
}
export async function createAnnouncement(input: {
  title: string; body?: string; type: AnnType; severity: AnnSeverity; audience: AnnAudience
  courseId?: string | null; startsAt?: string | null; endsAt?: string | null; studentIds?: string[]; createdBy?: string
}): Promise<string | null> {
  const { data, error } = await supabase.from('announcements').insert({
    title: input.title, body: input.body || null, type: input.type, severity: input.severity,
    audience: input.audience, course_id: input.audience === 'course' ? (input.courseId || null) : null,
    starts_at: input.startsAt || null, ends_at: input.endsAt || null, created_by: input.createdBy || null,
  }).select('id').single()
  if (error) { console.error('createAnnouncement', error.message); return null }
  const id = (data as { id: string }).id
  if (input.audience === 'students' && input.studentIds?.length) {
    await supabase.from('announcement_targets').insert(input.studentIds.map(sid => ({ announcement_id: id, student_id: sid })))
  }
  return id
}
export async function deleteAnnouncement(id: string): Promise<void> { await supabase.from('announcements').delete().eq('id', id) }
export async function toggleAnnouncement(id: string, active: boolean): Promise<void> { await supabase.from('announcements').update({ is_active: active }).eq('id', id) }

/* Search students for targeting — by name, token, or phone. */
export async function searchStudents(q: string): Promise<StudentLite[]> {
  const term = q.trim(); if (term.length < 2) return []
  const { data } = await supabase.from('crm_students')
    .select('id, full_name, verification_token, phone_number')
    .is('deleted_at', null)
    .or(`full_name.ilike.%${term}%,verification_token.ilike.%${term}%,phone_number.ilike.%${term}%`)
    .limit(10)
  return (data ?? []) as StudentLite[]
}

/* ── Student portal ──────────────────────────── */
export async function fetchStudentAnnouncements(token: string): Promise<StudentAnnouncement[]> {
  const { data } = await supabase.rpc('student_announcements', { p_token: token.trim().toUpperCase() })
  return (data ?? []) as StudentAnnouncement[]
}
