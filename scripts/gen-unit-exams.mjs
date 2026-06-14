/**
 * AI-generate a comprehensive END-OF-UNIT test (>=10 questions) for every unit
 * that has none yet, from the unit's whole content (all lessons + reading).
 * Saved to lms_modules.exam_quiz; the team can edit in the CRM. Pass mark 60%.
 * Run: node --env-file=.env.local scripts/gen-unit-exams.mjs
 */
import { createClient } from '@supabase/supabase-js'

const OPENAI = process.env.OPENAI_API_KEY
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)

const SYSTEM = `You are a strict but fair English-as-a-foreign-language EXAMINER writing the END-OF-UNIT exam for ARABIC-SPEAKING beginners (CEFR A0–A1). This is a real, graded class exam — the student must demonstrate understanding to pass, not guess.

Respond ONLY with a valid JSON object, no markdown:
{ "questions": [ { "q": "نص السؤال بالعربية", "choices": ["English A","English B","English C","English D"], "answer": 0, "explain": "شرح قصير بالعربية" } ] }

Rules:
- Write 10 to 12 questions that COVER THE WHOLE UNIT (all lessons + the reading passage provided), not one narrow topic.
- The QUESTION text ("q") is in ARABIC; the CHOICES are in ENGLISH only (do not translate choices). "explain" in Arabic.
- 4 English choices each; "answer" is the 0-based index of the correct one. VARY the position of the correct answer across questions.
- Mix these question types so it truly tests comprehension:
  • meaning/vocabulary in context (not isolated word lists),
  • fill-in-the-blank grammar (articles, to be, plurals, prepositions, present simple, can/can't, WH-questions — whatever the unit taught),
  • choose the CORRECT full sentence / correct word order,
  • spelling (correct vs believable near-misses, e.g. "Forty" vs "Fourty"),
  • translation/usage (which English sentence correctly expresses the Arabic meaning).
- Distractors must be PLAUSIBLE and based on common Arabic-speaker mistakes — never obviously silly. No trick questions, no questions answerable without studying.
- Stay strictly within the unit's content/level. Do not invent unrelated material.`

const modsRes = await db.from('lms_modules')
  .select('id, title, module_order, reading_text, exam_quiz, course_id, lms_courses!inner(is_published)')
  .eq('lms_courses.is_published', true)
  .order('module_order')
const mods = modsRes.data ?? []
if (modsRes.error) { console.error(modsRes.error); process.exit(1) }

const todo = mods.filter(m => !(m.exam_quiz?.questions?.length))
console.log(`Units needing a test: ${todo.length}`)

let ok = 0, fail = 0
for (const m of todo) {
  try {
    const { data: lessons } = await db.from('lms_lessons').select('title, content').eq('module_id', m.id).order('lesson_order')
    const source = [
      `Unit: ${m.title}`,
      ...(lessons ?? []).map(l => `- Lesson: ${l.title}${l.content ? `\n${String(l.content).slice(0, 1200)}` : ''}`),
      m.reading_text ? `Reading passage:\n${String(m.reading_text).slice(0, 2500)}` : '',
    ].filter(Boolean).join('\n')

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.4, max_tokens: 2600,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${source}\n\nWrite the end-of-unit exam (10–12 questions) covering the whole unit.` }],
      }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(JSON.stringify(data).slice(0, 180))
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
      .map(q => ({
        q: String(q?.q ?? '').trim(),
        choices: Array.isArray(q?.choices) ? q.choices.map(c => String(c)).filter(Boolean).slice(0, 4) : [],
        answer: Number.isInteger(q?.answer) ? q.answer : 0,
        explain: q?.explain ? String(q.explain) : undefined,
      }))
      .filter(q => q.q && q.choices.length >= 3 && q.answer < q.choices.length)
    if (questions.length < 10) { console.log(`✗ ${m.title} — only ${questions.length} Qs`); fail++; continue }
    const { error: upErr } = await db.from('lms_modules').update({ exam_quiz: { questions } }).eq('id', m.id)
    if (upErr) { console.log(`✗ ${m.title} — ${upErr.message}`); fail++; continue }
    ok++; console.log(`✓ U${m.module_order} ${m.title} — ${questions.length} questions`)
  } catch (e) { fail++; console.log(`✗ ${m.title} — ${e.message}`) }
}
console.log(`\nDone. Generated ${ok}, failed ${fail}.`)
