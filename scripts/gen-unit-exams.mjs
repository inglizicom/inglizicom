/**
 * Regenerate END-OF-UNIT exams — strict A0/A1, on-topic, NO advanced grammar and
 * NO invented specifics. Review units (e.g. "محادثة شاملة") cover the previous
 * units. Overwrites existing exams. Run: node --env-file=.env.local scripts/gen-unit-exams.mjs
 */
import { createClient } from '@supabase/supabase-js'
const OPENAI = process.env.OPENAI_API_KEY, URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)

const SYSTEM = `You write the END-OF-UNIT exam for ABSOLUTE-BEGINNER Arabic speakers (CEFR A0, English Level 1). The student must feel it matches exactly what they studied — never harder.

Respond ONLY JSON: { "questions": [ { "q": "نص السؤال بالعربية", "choices": ["English A","English B","English C","English D"], "answer": 0, "explain": "شرح قصير بالعربية" } ] }

LEVEL — you may ONLY use:
- subject pronouns (I, you, he, she, it, we, they)
- the verb "to be" (am / is / are) and "have / has"
- a / an / the, this / that, plurals (-s)
- simple present of the most common verbs (like, live, work, speak, study, play, eat, drink)
- can / can't, basic question words (what, where, how old, how many, who)
- numbers, days, and the unit's everyday vocabulary.

STRICTLY FORBIDDEN (too advanced — never use): past tense, future (will/going to), present continuous, present perfect, comparatives/superlatives, passive voice, modals other than can, conditionals, idioms.

CONTENT RULES:
- 10 to 12 questions, all ON the unit's TOPIC below. Mix: vocabulary meaning, fill-in-the-blank with "to be"/simple present, choose the correct sentence/word order, spelling (correct vs near-miss), and simple translation (which English = the Arabic).
- Do NOT invent specific people, names, phone numbers, ages, or dialogue details. Every question must be answerable by ANY student who studied the topic — never about a specific text the student may not have.
- Distractors must be plausible beginner mistakes, not silly. One clear correct answer. Vary the correct index.`

const { data: mods } = await db.from('lms_modules')
  .select('id, title, module_order, lms_courses!inner(is_published)')
  .eq('lms_courses.is_published', true).order('module_order')
const all = mods ?? []

async function lessonTitles(mid) {
  const { data } = await db.from('lms_lessons').select('title').eq('module_id', mid).order('lesson_order')
  return (data ?? []).map(l => l.title)
}

let ok = 0, fail = 0
for (const m of all) {
  try {
    const titles = await lessonTitles(m.id)
    const isReview = /محادثة شاملة|مراجعة|شاملة|review/i.test(m.title) || titles.some(t => /محادثة شاملة|مراجعة|شاملة/i.test(t))
    let topic = `Unit "${m.title}". Lessons: ${titles.join(', ') || '—'}.`
    if (isReview || m.module_order <= 2) {
      // comprehensive review → cover the previous unit(s): self-introduction conversation
      const prior = all.filter(x => x.module_order < m.module_order)
      const priorTitles = []
      for (const p of prior) priorTitles.push(...await lessonTitles(p.id))
      topic += `\nThis is a COMPREHENSIVE REVIEW (a full conversation) of the PREVIOUS units: ${priorTitles.join(', ')}. `
        + `Cover basic self-introduction: greetings, name, where you are from, age, job, married/single, family, "nice to meet you" — all at A0.`
    }
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.3, max_tokens: 2600, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${topic}\n\nWrite the A0 end-of-unit exam (10–12 questions), strictly on this topic and level.` }] }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 160))
    const parsed = JSON.parse(d.choices?.[0]?.message?.content ?? '{}')
    const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
      .map(q => ({ q: String(q?.q ?? '').trim(), choices: Array.isArray(q?.choices) ? q.choices.map(c => String(c)).filter(Boolean).slice(0, 4) : [], answer: Number.isInteger(q?.answer) ? q.answer : 0, explain: q?.explain ? String(q.explain) : undefined }))
      .filter(q => q.q && q.choices.length >= 3 && q.answer < q.choices.length)
    if (questions.length < 10) { console.log(`✗ U${m.module_order} only ${questions.length}`); fail++; continue }
    const { error } = await db.from('lms_modules').update({ exam_quiz: { questions } }).eq('id', m.id)
    if (error) { console.log(`✗ U${m.module_order} ${error.message}`); fail++; continue }
    ok++; console.log(`✓ U${m.module_order} ${m.title}${isReview ? ' (review)' : ''} — ${questions.length} Qs`)
  } catch (e) { fail++; console.log(`✗ U${m.module_order} ${e.message}`) }
}
console.log(`\nDone. Regenerated ${ok}, failed ${fail}.`)
