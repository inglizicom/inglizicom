import { NextResponse } from 'next/server'

/* Generates a multiple-choice quiz + a short practice exercise for a lesson.
   Source material is the lesson title + optional pasted source text (e.g. the
   relevant section of the A0/A1 PDF). Used by the CRM course builder. */

const SYSTEM = `You are an expert English-as-a-foreign-language teacher creating practice material for ARABIC-SPEAKING beginners.

Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text.

Required JSON shape:
{
  "questions": [
    {
      "q": "the question in simple English",
      "choices": ["choice A", "choice B", "choice C", "choice D"],
      "answer": 0,
      "explain": "شرح قصير بالعربية لماذا هذه الإجابة صحيحة"
    }
  ],
  "exercise": {
    "prompt": "تعليمات تمرين قصير بالعربية لتطبيق الدرس (كتابة أو محادثة)",
    "sample_answer": "a short model answer in English"
  }
}

Rules:
- Make EXACTLY 5 questions unless told otherwise.
- Each question has 3 or 4 choices; "answer" is the 0-based index of the correct choice.
- Questions test the actual lesson content/source provided. Keep English simple (A0/A1 level).
- "explain" and the exercise "prompt" MUST be in Arabic. Questions/choices in English.
- Never invent content unrelated to the lesson topic/source.`

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 })

  let body: { title?: string; level?: string; source?: string; count?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  const title = (body.title ?? '').trim()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  const count = Math.min(Math.max(body.count ?? 5, 3), 10)

  const userMsg =
    `Lesson title: "${title}"\n` +
    (body.level ? `CEFR level: ${body.level}\n` : '') +
    (body.source?.trim() ? `\nLesson source content:\n"""\n${body.source.trim().slice(0, 6000)}\n"""` : '\n(No source text provided — base the quiz on the lesson title/topic.)') +
    `\n\nCreate ${count} questions.`

  let raw = ''
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userMsg }],
      }),
    })
    const data = await r.json()
    if (!r.ok) { console.error('[generate-quiz] OpenAI error', data); return NextResponse.json({ error: 'ai failed' }, { status: 502 }) }
    raw = data.choices?.[0]?.message?.content ?? ''
  } catch (e) {
    console.error('[generate-quiz] network', e); return NextResponse.json({ error: 'network' }, { status: 502 })
  }

  let parsed: any
  try { parsed = JSON.parse(raw) } catch { return NextResponse.json({ error: 'parse' }, { status: 502 }) }

  // normalise — guarantee shape so the client never crashes
  const questions = Array.isArray(parsed.questions) ? parsed.questions
    .map((q: any) => ({
      q: String(q?.q ?? '').trim(),
      choices: Array.isArray(q?.choices) ? q.choices.map((c: any) => String(c)).filter(Boolean).slice(0, 4) : [],
      answer: Number.isInteger(q?.answer) ? q.answer : 0,
      explain: q?.explain ? String(q.explain) : '',
    }))
    .filter((q: any) => q.q && q.choices.length >= 2 && q.answer < q.choices.length)
    : []

  const ex = parsed.exercise && typeof parsed.exercise === 'object'
    ? { prompt: String(parsed.exercise.prompt ?? '').trim(), sample_answer: parsed.exercise.sample_answer ? String(parsed.exercise.sample_answer) : '' }
    : null

  if (questions.length === 0) return NextResponse.json({ error: 'empty' }, { status: 502 })
  return NextResponse.json({ questions, exercise: ex })
}
