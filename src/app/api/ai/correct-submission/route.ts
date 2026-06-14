import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* AI correction (first pass) for a unit conversation. Encouraging but fair, A0/A1.
   If it passes (>=60), the submission is marked reviewed so the next unit opens.
   If not, it stays pending with an AI hint and the team finalizes it. */

const SYSTEM = `You are a kind but fair English teacher grading a SHORT conversation/answer written by an ARABIC-speaking BEGINNER (CEFR A0/A1) at the end of a unit. Be encouraging — reward effort and basic correctness; small mistakes are fine.
Respond ONLY with JSON: { "score": <0-100 integer>, "correct": <true|false>, "feedback": "ملاحظة قصيرة مشجِّعة بالعربية مع تصحيح بسيط واحد" }
Mark correct=true (score >= 60) when the student wrote a RELEVANT, mostly understandable short conversation/answer in English using the unit's language — even with small errors.
Mark correct=false only if it is empty, off-topic, gibberish/copied, or not English.
"feedback" is 1-3 short Arabic sentences: praise + one concrete tip. Never harsh.`

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!apiKey || !url || !serviceKey) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 500 })

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
  if (sub.status === 'reviewed') return NextResponse.json({ ok: true, correct: true, score: null, status: 'reviewed', already: true })

  const convo = (sub.conversation_text ?? '').trim()
  if (!convo) return NextResponse.json({ ok: true, correct: false, score: 0, status: 'pending', feedback: 'لم نتلقَّ نصًا للمحادثة. اكتب محادثتك ثم أرسلها.' })

  const { data: mod } = await db.from('lms_modules').select('title, conversation_prompt').eq('id', moduleId).maybeSingle()
  const { data: lessons } = await db.from('lms_lessons').select('title').eq('module_id', moduleId).order('lesson_order')
  const context = `Unit: ${mod?.title ?? ''}\nLessons covered: ${(lessons ?? []).map((l: any) => l.title).join(', ')}`
    + (mod?.conversation_prompt ? `\nThe task the student was asked to do (translate the Arabic sentences + write a short conversation):\n${String(mod.conversation_prompt).slice(0, 1200)}` : '')

  let parsed = { score: 0, correct: false, feedback: '' }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 400, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${context}\n\nStudent's conversation:\n"""\n${convo.slice(0, 3000)}\n"""\n\nGrade it now.` }],
      }),
    })
    const d = await r.json()
    if (r.ok) { const p = JSON.parse(d.choices?.[0]?.message?.content ?? '{}'); parsed = { score: Math.max(0, Math.min(100, Math.round(Number(p.score) || 0))), correct: !!p.correct, feedback: String(p.feedback ?? '') } }
    else return NextResponse.json({ ok: false, error: 'ai failed', status: 'pending' }, { status: 200 })
  } catch { return NextResponse.json({ ok: false, error: 'network', status: 'pending' }, { status: 200 }) }

  const pass = parsed.correct || parsed.score >= 60
  const fb = '🤖 ' + (parsed.feedback || (pass ? 'أحسنت! إجابة جيدة.' : 'تحتاج بعض التحسين قبل الاعتماد.'))
  if (pass) {
    await db.from('lms_submissions').update({ status: 'reviewed', score: parsed.score, feedback: fb, reviewed_at: new Date().toISOString() }).eq('id', sub.id)
    // urgent, clickable notification → opens the course path (next unit now unlocked)
    await db.from('student_notifications').insert({
      student_id: stu.id, type: 'correction',
      title: 'تم تصحيح محادثتك ✅ — الوحدة التالية مفتوحة',
      body: `الوحدة: ${mod?.title ?? ''}${parsed.score != null ? ` — التقييم ${parsed.score}/100` : ''} · اضغط للمتابعة`,
      tab: 'path',
    })
    return NextResponse.json({ ok: true, correct: true, score: parsed.score, status: 'reviewed', feedback: fb })
  }
  await db.from('lms_submissions').update({ feedback: fb }).eq('id', sub.id)   // keep pending for the team
  return NextResponse.json({ ok: true, correct: false, score: parsed.score, status: 'pending', feedback: fb })
}
