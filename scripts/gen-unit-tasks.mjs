/**
 * AI-generate a clear CONVERSATION TASK per unit (translate a few Arabic
 * sentences + write a short conversation) — based on the unit's lessons/vocab,
 * NOT the reading passage. Saved to lms_modules.conversation_prompt (Arabic text
 * the student sees). Run: node --env-file=.env.local scripts/gen-unit-tasks.mjs
 */
import { createClient } from '@supabase/supabase-js'
const OPENAI = process.env.OPENAI_API_KEY, URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)

const SYSTEM = `You design a short SPEAKING/WRITING task for an ARABIC-speaking BEGINNER (A0/A1) at the end of a unit. The task must be based ONLY on the unit's lessons/vocabulary provided — do NOT use any reading passage.
Respond ONLY JSON: { "sentences": ["جملة عربية 1","جملة عربية 2","جملة عربية 3"], "topic": "موضوع محادثة قصيرة بالعربية" }
Rules:
- 3 short, very simple Arabic sentences the student will TRANSLATE into English (everyday, within the unit's language).
- "topic": a tiny conversation topic in Arabic relevant to the unit (e.g. تعريف بالنفس، عائلتك، طعامك المفضل).
- Keep everything beginner-level and encouraging. No reading-comprehension questions.`

const fmt = (s, topic) => `📝 مهمّتك في هذه الوحدة:\n\n١) ترجم هذه الجمل إلى الإنجليزية:\n${s.map((x, i) => `   ${['أ','ب','ج','د'][i] || '-'}) ${x}`).join('\n')}\n\n٢) اكتب محادثة قصيرة (٣–٤ أسطر) بالإنجليزية عن: ${topic}\n\n✍️ اكتب كل ذلك في الصندوق بالأسفل ثم أرسله للتصحيح.`

const { data: mods } = await db.from('lms_modules')
  .select('id, title, module_order, conversation_prompt, lms_courses!inner(is_published)')
  .eq('lms_courses.is_published', true).order('module_order')

let ok = 0
for (const m of (mods ?? [])) {
  if (m.conversation_prompt) { continue }   // don't overwrite team-edited tasks
  try {
    const { data: lessons } = await db.from('lms_lessons').select('title').eq('module_id', m.id).order('lesson_order')
    const ctx = `Unit: ${m.title}\nLessons/vocabulary: ${(lessons ?? []).map(l => l.title).join(', ')}`
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.5, max_tokens: 500, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${ctx}\n\nCreate the task.` }] }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 150))
    const p = JSON.parse(d.choices?.[0]?.message?.content ?? '{}')
    const sentences = (Array.isArray(p.sentences) ? p.sentences : []).map(s => String(s).trim()).filter(Boolean).slice(0, 4)
    const topic = String(p.topic ?? '').trim()
    if (sentences.length < 2 || !topic) { console.log(`✗ U${m.module_order} weak result`); continue }
    const { error } = await db.from('lms_modules').update({ conversation_prompt: fmt(sentences, topic) }).eq('id', m.id)
    if (error) { console.log(`✗ U${m.module_order} ${error.message}`); continue }
    ok++; console.log(`✓ U${m.module_order} ${m.title}`)
  } catch (e) { console.log(`✗ U${m.module_order} ${e.message}`) }
}
console.log(`\nDone. Tasks generated for ${ok} units.`)
