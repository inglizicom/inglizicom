/**
 * One-off: AI-generate a quiz for every lesson that has no test yet, then save
 * it to lms_lessons.quiz (+ has_quiz=true). The team can edit afterwards in the
 * CRM course builder. Run:  node --env-file=.env.local scripts/gen-lesson-quizzes.mjs
 */
import { createClient } from '@supabase/supabase-js'

const OPENAI = process.env.OPENAI_API_KEY
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env (OPENAI_API_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'); process.exit(1) }
const db = createClient(URL, KEY)

const SYSTEM = `You are an expert English-as-a-foreign-language teacher creating practice material for ARABIC-SPEAKING beginners.
Respond ONLY with a valid JSON object. No markdown, no code fences, no extra text.
Required JSON shape:
{ "questions": [ { "q": "نص السؤال بالعربية", "choices": ["English A","English B","English C","English D"], "answer": 0, "explain": "شرح قصير بالعربية" } ] }
Rules:
- Make 6 to 8 questions.
- The QUESTION text ("q") MUST be in ARABIC. The CHOICES must stay in ENGLISH only.
- 3 or 4 English choices; "answer" = 0-based index of the correct one. Vary the correct index.
- Include at least ONE spelling question and ONE word-order question. Use believable distractors based on common Arabic-speaker mistakes.
- Test the ACTUAL lesson content/source. Keep English at A0/A1 level. "explain" in Arabic. Never invent unrelated content.`

async function genQuiz(title, source) {
  const userMsg = `Lesson title: "${title}"\n` +
    (source?.trim() ? `\nLesson source content:\n"""\n${source.trim().slice(0, 6000)}\n"""` : '\n(No source text — base the quiz on the lesson title/topic.)') +
    `\n\nCreate 7 questions.`
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini', temperature: 0.4, max_tokens: 1600,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userMsg }],
    }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error('OpenAI: ' + JSON.stringify(data).slice(0, 200))
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
  const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
    .map(q => ({
      q: String(q?.q ?? '').trim(),
      choices: Array.isArray(q?.choices) ? q.choices.map(c => String(c)).filter(Boolean).slice(0, 4) : [],
      answer: Number.isInteger(q?.answer) ? q.answer : 0,
      explain: q?.explain ? String(q.explain) : undefined,
    }))
    .filter(q => q.q && q.choices.length >= 2 && q.answer < q.choices.length)
  return questions.length ? { questions } : null
}

const { data: full, error } = await db.from('lms_lessons').select('id, title, content, has_quiz, quiz')
if (error) { console.error(error); process.exit(1) }
const todo = (full ?? []).filter(l => !l.has_quiz || !(l.quiz?.questions?.length))
console.log(`Lessons needing a test: ${todo.length}`)

let ok = 0, fail = 0
for (const l of todo) {
  try {
    const quiz = await genQuiz(l.title, l.content || '')
    if (!quiz) { console.log(`✗ ${l.title} — empty result`); fail++; continue }
    const { error: upErr } = await db.from('lms_lessons').update({ quiz, has_quiz: true }).eq('id', l.id)
    if (upErr) { console.log(`✗ ${l.title} — ${upErr.message}`); fail++; continue }
    ok++; console.log(`✓ ${l.title} — ${quiz.questions.length} questions`)
  } catch (e) { fail++; console.log(`✗ ${l.title} — ${e.message}`) }
}
console.log(`\nDone. Generated ${ok}, failed ${fail}.`)
