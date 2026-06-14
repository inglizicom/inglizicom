/**
 * AI-generate lots of A0/A1 beginner practice for the games (sentence builder +
 * translation). Confidence-building, everyday, not frustrating. Translations
 * get 4 choices so beginners PICK instead of typing.
 * Run: node --env-file=.env.local scripts/gen-practice.mjs
 */
import { createClient } from '@supabase/supabase-js'

const OPENAI = process.env.OPENAI_API_KEY
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)

const norm = s => String(s || '').toLowerCase().replace(/[.?!،,]/g, '').replace(/\s+/g, ' ').trim()

async function ai(system, user, maxTokens = 2200) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.6, max_tokens: maxTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(JSON.stringify(data).slice(0, 180))
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
}

const TOPICS = 'greetings, introducing yourself, family, food & drink, daily routine, school/class, numbers & age, time & days, places & directions, hobbies, jobs, the home'

async function genSentences(level, n) {
  const sys = `You write VERY SIMPLE English practice sentences for absolute-beginner ARABIC speakers (CEFR ${level}). Goal: the student feels confident and succeeds — never frustrated.
Respond ONLY JSON: { "items": [ { "arabic": "الجملة بالعربية", "english": "the English sentence" } ] }
Rules:
- ${level === 'A0' ? '2 to 5 words' : '3 to 6 words'} per English sentence. Everyday, natural, 100% correct.
- NO ending period in "english". Normal capitalization (first word capital).
- Use only common beginner words. Avoid contractions (write "I am", "do not").
- "arabic" is the accurate Arabic meaning (with normal punctuation).
- Cover varied topics: ${TOPICS}. No duplicates.`
  const out = await ai(sys, `Create ${n} ${level} sentences.`)
  return (out.items ?? []).map(x => ({ arabic: String(x.arabic || '').trim(), english: String(x.english || '').trim().replace(/[.]+$/, '') }))
    .filter(x => x.arabic && x.english && x.english.split(' ').length >= 2)
}

async function genTranslations(level, n) {
  const sys = `You write VERY SIMPLE multiple-choice translation practice for absolute-beginner ARABIC speakers (CEFR ${level}). The student must feel they understand.
Respond ONLY JSON: { "items": [ { "arabic": "الجملة بالعربية", "english": "correct English", "choices": ["correct English","distractor","distractor","distractor"] } ] }
Rules:
- English answer is ${level === 'A0' ? '2 to 5 words' : '3 to 6 words'}, everyday, correct, no ending period.
- "choices": exactly 4 English options that INCLUDE the exact correct "english". Distractors are plausible but clearly different for a beginner (e.g. wrong word, wrong pronoun) — NOT tricky or mean.
- Common beginner words only. Cover: ${TOPICS}. No duplicates.`
  const out = await ai(sys, `Create ${n} ${level} items.`)
  return (out.items ?? []).map(x => {
    const english = String(x.english || '').trim().replace(/[.]+$/, '')
    let choices = Array.isArray(x.choices) ? x.choices.map(c => String(c).trim().replace(/[.]+$/, '')) : []
    if (!choices.some(c => norm(c) === norm(english))) choices.unshift(english)
    choices = [...new Set(choices)].slice(0, 4)
    return { arabic: String(x.arabic || '').trim(), english, choices }
  }).filter(x => x.arabic && x.english && x.choices.length === 4)
}

// existing answers to avoid duplicates
const [{ data: es }, { data: et }] = await Promise.all([
  db.from('sentence_challenges').select('english'),
  db.from('translation_challenges').select('english'),
])
const seenS = new Set((es ?? []).map(r => norm(r.english)))
const seenT = new Set((et ?? []).map(r => norm(r.english)))

let added = 0
for (const level of ['A0', 'A1']) {
  const sents = await genSentences(level, 26)
  const rowsS = sents.filter(s => !seenS.has(norm(s.english))).map(s => { seenS.add(norm(s.english)); return { level, arabic: s.arabic, english: s.english, is_active: true } })
  if (rowsS.length) { const { error } = await db.from('sentence_challenges').insert(rowsS); if (error) console.log('S err', error.message); else { added += rowsS.length; console.log(`✓ ${level} sentences +${rowsS.length}`) } }

  const trans = await genTranslations(level, 20)
  const rowsT = trans.filter(t => !seenT.has(norm(t.english))).map(t => { seenT.add(norm(t.english)); return { level, arabic: t.arabic, english: t.english, choices: t.choices, is_active: true } })
  if (rowsT.length) { const { error } = await db.from('translation_challenges').insert(rowsT); if (error) console.log('T err', error.message); else { added += rowsT.length; console.log(`✓ ${level} translations +${rowsT.length}`) } }
}
console.log(`\nDone. Added ${added} practice items.`)
