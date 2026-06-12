import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendByKind, waConfigured } from '@/lib/whatsapp'

/* Daily reminder job (Vercel Cron). For every active enrolled student who hasn't
   finished, drops an in-app notification (once/day) and sends a WhatsApp nudge.
   Protected by CRON_SECRET. */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>; allow ?key= too.
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') || ''
  const key = new URL(req.url).searchParams.get('key') || ''
  if (secret && auth !== `Bearer ${secret}` && key !== secret) {
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
  let created = 0, sent = 0, deadlines = 0
  const list = (students ?? []) as any[]

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
      await db.from('student_notifications').insert({
        student_id: s.id, type: 'deadline',
        title: '⏰ موعد الوحدة يقترب',
        body: `${name ? name + '، ' : ''}موعد إنهاء وحدة «${sch!.unit}» ${when}. أكملها قبل فوات الأجل لتبقى ضمن جدول الدورة.`,
        tab: 'path', sent_whatsapp: waConfigured() && !!s.phone_number,
      })
      created++; deadlines++
      if (waConfigured() && s.phone_number && await sendByKind(s.phone_number, 'deadline', { name, unit: sch!.unit, days: String(Math.max(0, sch!.days)) })) sent++
    } else {
      await db.from('student_notifications').insert({
        student_id: s.id, type: 'reminder',
        title: 'تذكير يومي 📚',
        body: `${name ? name + '، ' : ''}واصل التعلّم اليوم — افتح درسك القادم وحافظ على جدولك.`,
        tab: 'path', sent_whatsapp: waConfigured() && !!s.phone_number,
      })
      created++
      if (waConfigured() && s.phone_number && await sendByKind(s.phone_number, 'reminder', { name, unit: '', days: '' })) sent++
    }
  }

  return NextResponse.json({ ok: true, students: list.length, created, sent, deadlines, wa: waConfigured() })
}
