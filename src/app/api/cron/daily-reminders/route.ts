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
    .select('id, full_name, phone_number, is_active, deleted_at, lms_enrollments!inner(course_id)')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date(); today.setHours(0, 0, 0, 0)
  let created = 0, sent = 0
  const list = (students ?? []) as any[]

  for (const s of list) {
    // once per day: skip if a reminder already exists today
    const { count } = await db.from('student_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', s.id).eq('type', 'reminder').gte('created_at', today.toISOString())
    if ((count ?? 0) > 0) continue

    const name = (s.full_name || '').split(' ')[0]
    await db.from('student_notifications').insert({
      student_id: s.id, type: 'reminder',
      title: 'تذكير يومي 📚',
      body: `${name ? name + '، ' : ''}واصل التعلّم اليوم — افتح درسك القادم وحافظ على جدولك.`,
      tab: 'path', sent_whatsapp: waConfigured() && !!s.phone_number,
    })
    created++

    if (waConfigured() && s.phone_number) {
      const ok = await sendByKind(s.phone_number, 'reminder', { name, unit: '', days: '' })
      if (ok) sent++
    }
  }

  return NextResponse.json({ ok: true, students: list.length, created, sent, wa: waConfigured() })
}
