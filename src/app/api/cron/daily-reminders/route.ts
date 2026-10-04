import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendByKind, waConfigured } from '@/lib/whatsapp'
import { pushConfigured, sendOne, type SubRow } from '@/lib/push-server'
import { flushPushQueue } from '@/lib/notify-dispatch'

/* Daily reminder job (Vercel Cron). For every active enrolled student who hasn't
   finished, drops an in-app notification (once/day) and sends a WhatsApp nudge.
   Protected by CRON_SECRET. */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') || ''
  if (!secret) {
    return NextResponse.json({ error: 'cron secret not configured' }, { status: 500 })
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Active, enrolled, not-deleted students.
  const { data: students, error } = await db
    .from('crm_students')
    .select('id, full_name, phone_number, verification_token, is_active, deleted_at, lms_enrollments!inner(course_id)')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const DAY = 86400000
  let created = 0, sent = 0, deadlines = 0, pushed = 0
  const list = (students ?? []) as any[]

  // Send an app-push to all of one student's devices (Duolingo-style); prune dead.
  async function pushStudent(db: SupabaseClient, studentId: string, title: string, body: string) {
    if (!pushConfigured()) return
    const { data } = await db.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('student_id', studentId)
    const subs = (data ?? []) as SubRow[]
    if (!subs.length) return
    const dead: string[] = []
    for (const s of subs) {
      const r = await sendOne(s, { title, body, url: '/', tag: 'daily' })
      if (r === 'ok') pushed++
      else if (r === 'gone') dead.push(s.id)
    }
    if (dead.length) await db.from('push_subscriptions').delete().in('id', dead)
  }

  // Days until the student's current unit deadline (null = no schedule / done).
  async function unitDaysLeft(token: string): Promise<{ days: number; unit: string } | null> {
    if (!token) return null
    const { data } = await db.rpc('student_progress_meta', { p_token: token })
    const m = Array.isArray(data) ? data[0] : data
    if (!m || !m.start_at) return null
    const units = Math.max(1, m.total_units)
    if (m.completed_units >= units) return null
    const start = new Date(m.start_at).getTime()
    const courseEnd = m.end_at ? new Date(m.end_at).getTime() : start + units * (m.days_per_unit || 7) * DAY
    const per = (courseEnd - start) / units
    const unitEnd = start + m.current_unit_order * per
    return { days: Math.ceil((unitEnd - Date.now()) / DAY), unit: m.current_unit_title || '' }
  }

  // These are pushed right here, so they are written as already pushed — the
  // queue (062) must not send them again. A database before 062 has no
  // pushed_at column: write without it.
  async function insertNotification(row: Record<string, unknown>) {
    const { error } = await db.from('student_notifications').insert({ ...row, pushed_at: new Date().toISOString() })
    if (error && /pushed_at/.test(error.message)) await db.from('student_notifications').insert(row)
  }

  for (const s of list) {
    // once per day: skip if any daily nudge (reminder or deadline) already exists today
    const { count } = await db.from('student_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', s.id).in('type', ['reminder', 'deadline']).gte('created_at', today.toISOString())
    if ((count ?? 0) > 0) continue

    const name = (s.full_name || '').split(' ')[0]
    const sch = await unitDaysLeft(s.verification_token)
    const soon = sch != null && sch.days <= 2   // current unit due within 2 days (or overdue)

    if (soon) {
      const when = sch!.days <= 0 ? 'اليوم' : sch!.days === 1 ? 'غدًا' : `خلال ${sch!.days} يوم`
      await insertNotification({
        student_id: s.id, type: 'deadline',
        title: '⏰ موعد الوحدة يقترب',
        body: `${name ? name + '، ' : ''}موعد إنهاء وحدة «${sch!.unit}» ${when}. أكملها قبل فوات الأجل لتبقى ضمن جدول الدورة.`,
        tab: 'path', sent_whatsapp: waConfigured() && !!s.phone_number,
      })
      created++; deadlines++
      if (waConfigured() && s.phone_number && await sendByKind(s.phone_number, 'deadline', { name, unit: sch!.unit, days: String(Math.max(0, sch!.days)) })) sent++
      await pushStudent(db, s.id, '⏰ موعد الوحدة يقترب', `${name ? name + '، ' : ''}أكمل وحدتك قبل فوات الأجل.`)
    } else {
      await insertNotification({
        student_id: s.id, type: 'reminder',
        title: 'تذكير يومي 📚',
        body: `${name ? name + '، ' : ''}واصل التعلّم اليوم — افتح درسك القادم وحافظ على جدولك.`,
        tab: 'path', sent_whatsapp: waConfigured() && !!s.phone_number,
      })
      created++
      if (waConfigured() && s.phone_number && await sendByKind(s.phone_number, 'reminder', { name, unit: '', days: '' })) sent++
      await pushStudent(db, s.id, 'تذكير يومي 📚', `${name ? name + '، ' : ''}واصل التعلّم اليوم — افتح درسك القادم.`)
    }
  }

  // 062: the daily events (missing lesson reports, last month's report ready),
  // then deliver whatever is still waiting in the push queue.
  let scheduled: unknown = null, queue: unknown = null
  try { scheduled = (await db.rpc('notify_scheduled')).data } catch { /* before 062 */ }
  try { queue = await flushPushQueue(db) } catch { /* before 062 */ }

  return NextResponse.json({ ok: true, students: list.length, created, sent, deadlines, pushed, wa: waConfigured(), push: pushConfigured(), scheduled, queue })
}
