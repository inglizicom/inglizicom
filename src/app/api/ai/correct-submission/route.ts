import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* Unit conversation submissions are reviewed MANUALLY by the correction team.
   AI auto-correction was removed on purpose: it sometimes approved answers that
   had real mistakes ("good job" on wrong work), which hurt the course's
   reputation. This endpoint now only confirms the submission was received and
   keeps it PENDING — the team approves it from CRM → "تصحيح المحادثات", which
   unlocks the next unit and notifies the student. */

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 500 })

  let body: { token?: string; moduleId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const token = String(body.token ?? '').trim().toUpperCase()
  const moduleId = String(body.moduleId ?? '')
  if (!token || !moduleId) return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 })

  const db = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: stu } = await db.from('crm_students').select('id').eq('verification_token', token).is('deleted_at', null).maybeSingle()
  if (!stu) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 404 })

  const { data: sub } = await db.from('lms_submissions')
    .select('id, conversation_text, status')
    .eq('student_id', stu.id).eq('module_id', moduleId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!sub) return NextResponse.json({ ok: false, error: 'no submission' }, { status: 404 })

  // Already approved by the team earlier → keep it approved (idempotent).
  if (sub.status === 'reviewed') return NextResponse.json({ ok: true, correct: true, score: null, status: 'reviewed', already: true })

  const convo = (sub.conversation_text ?? '').trim()
  if (!convo) return NextResponse.json({ ok: true, correct: false, score: 0, status: 'pending', feedback: 'لم نتلقَّ نصًا للمحادثة. اكتب محادثتك ثم أرسلها.' })

  // No automatic grading: leave the submission pending for the correction team.
  return NextResponse.json({
    ok: true, correct: false, score: null, status: 'pending',
    feedback: 'تم استلام محادثتك ✅ — سيراجعها فريق التصحيح قريبًا وتصلك ملاحظة الأستاذ.',
  })
}
