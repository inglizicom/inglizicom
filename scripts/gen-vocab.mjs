/**
 * AI-generate A0/A1 vocabulary for the mixed games (listen / match / spell).
 * Run: node --env-file=.env.local scripts/gen-vocab.mjs
 */
import { createClient } from '@supabase/supabase-js'
const OPENAI = process.env.OPENAI_API_KEY, URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)
const norm = s => String(s || '').toLowerCase().trim()
// strip lone surrogates (broken emojis from the model) that corrupt the JSON body
const clean = s => String(s || '').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '').replace(/(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '$1').trim()
const safeEmoji = e => { const c = clean(e); return /\p{Extended_Pictographic}/u.test(c) ? [...c][0] : '📘' }

async function gen(level, n) {
  const sys = `You build a beginner English vocabulary list for ARABIC speakers (CEFR ${level}). Confidence-building, the most useful everyday words.
Respond ONLY JSON: { "items": [ { "en": "word", "ar": "المعنى بالعربية", "emoji": "📘" } ] }
Rules:
- Single common words (or very short 2-word terms) a beginner needs: family, food, drinks, home, school, body, clothes, colors, numbers, days, jobs, places, common verbs, common adjectives.
- "en" lowercase unless a proper noun; correct spelling. "ar" = accurate Arabic. "emoji" = ONE emoji that fits the word (use 📘 if none fits).
- ${level === 'A0' ? 'Most basic words only.' : 'Slightly broader everyday words.'} No duplicates, no rude words.`
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.5, max_tokens: 2000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: `List ${n} ${level} words.` }] }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(JSON.stringify(data).slice(0, 160))
  return (JSON.parse(data.choices?.[0]?.message?.content ?? '{}').items ?? [])
    .map(x => ({ en: clean(x.en), ar: clean(x.ar), emoji: safeEmoji(x.emoji) }))
    .filter(x => x.en && x.ar && /^[a-zA-Z' -]+$/.test(x.en))
}

const { data: ex } = await db.from('vocab_words').select('en')
const seen = new Set((ex ?? []).map(r => norm(r.en)))
let added = 0
for (const level of ['A0', 'A1']) {
  const items = await gen(level, 40)
  const rows = items.filter(x => !seen.has(norm(x.en))).map(x => { seen.add(norm(x.en)); return { level, en: x.en, ar: x.ar, emoji: x.emoji, is_active: true } })
  let n = 0
  for (const row of rows) {
    const { error } = await db.from('vocab_words').insert(row)
    if (error) console.log(`  skip ${row.en}: ${error.message}`); else n++
  }
  added += n; console.log(`✓ ${level} +${n} words`)
}
console.log(`\nDone. Added ${added} words.`)
