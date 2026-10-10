/**
 * Records the Level 1 audio (the book, second edition, and the play cards)
 * into the public Supabase bucket "audio", from the plan in
 * src/data/level1-audio: every clip twice, slow (for learning) and normal.
 *
 *   node --env-file=.env.local scripts/gen-level1-audio.mjs [--dry] [--limit=20]
 *
 * Writes to the production storage. Safe to run again: a file already in the
 * bucket is skipped, so a second run only records what is new or changed.
 * Voices: OpenAI gpt-4o-mini-tts, the delivery set by instructions.
 */
import { allClips, clipPath, sayOf, BUCKET, SPEEDS } from '../src/data/level1-audio/index.ts'

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]))
const OPENAI = process.env.OPENAI_API_KEY
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !SUPA || !SERVICE) { console.error('Missing OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const supa = (path, init = {}) => fetch(`${SUPA}/storage/v1${path}`, { ...init, headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, ...(init.headers ?? {}) } })

/** How each voice speaks, at each speed. */
function instructions(clip, speed) {
  const pace = speed === 'slow'
    ? 'Pace: slow and very clear, for a beginner who repeats after you. Leave a short, natural pause between words, but keep the sentence flowing; never robotic, never spell a word unless its letters are given one by one.'
    : 'Pace: natural and relaxed, a normal conversational speed.'
  const who = clip.voice === 'fable'
    ? 'You are Bouchta, a funny, playful goat in a family card game: cheerful and a little silly, but every word perfectly clear.'
    : clip.speaker
      ? `You are ${clip.speaker}, speaking in a friendly everyday conversation in Morocco. Sound natural and warm, like a real person, not a narrator.`
      : 'You are a warm, friendly English teacher reading to a beginner.'
  return `${who} Accent: clear General American English. ${pace} Read exactly the text, adding nothing. Letters given one by one (W, A, L, I, D) are spelled out letter by letter, clearly. Words like dirhams, tagine, couscous, msemen, harira and hammam are Moroccan: say them the Moroccan way.`
}

async function withRetry(what, fn) {
  for (let i = 0; ; i++) {
    try { return await fn() } catch (e) {
      if (i >= 4) throw new Error(`${what}: ${e.message}`)
      await new Promise(r => setTimeout(r, 1500 * 2 ** i))
    }
  }
}

async function tts(clip, speed) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI}`, 'Content-Type': 'application/json' },
    // The instructions alone barely slow the voice (+4% on a sentence); `speed` does (0.8 ≈ +45%).
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: clip.voice, input: sayOf(clip.en), instructions: instructions(clip, speed), response_format: 'mp3', ...(speed === 'slow' ? { speed: 0.8 } : {}) }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status} ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

async function upload(path, body) {
  const res = await supa(`/object/${BUCKET}/${path}`, {
    method: 'POST', body,
    headers: { 'Content-Type': 'audio/mpeg', 'x-upsert': 'true', 'cache-control': '31536000' },
  })
  if (!res.ok) throw new Error(`upload ${res.status} ${(await res.text()).slice(0, 200)}`)
}

async function ensureBucket() {
  const res = await supa('/bucket', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, allowed_mime_types: ['audio/mpeg'], file_size_limit: 5 * 1024 * 1024 }) })
  if (!res.ok) {
    const t = await res.text()
    if (!/already exists|Duplicate/i.test(t)) throw new Error(`bucket: ${res.status} ${t.slice(0, 200)}`)
  } else console.log(`created the public bucket "${BUCKET}"`)
}

async function existing() {
  const names = new Set()
  for (let offset = 0; ; offset += 1000) {
    const res = await supa(`/object/list/${BUCKET}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: 'level1', limit: 1000, offset }) })
    if (!res.ok) throw new Error(`list: ${res.status} ${(await res.text()).slice(0, 200)}`)
    const rows = await res.json()
    rows.forEach(r => names.add(`level1/${r.name}`))
    if (rows.length < 1000) return names
  }
}

const clips = allClips()
const jobs = clips.flatMap(c => SPEEDS.map(speed => ({ clip: c, speed, path: clipPath(c, speed) })))
const chars = jobs.reduce((s, j) => s + j.clip.en.length, 0)
console.log(`${clips.length} clips × ${SPEEDS.length} speeds = ${jobs.length} files, ${chars} characters`)
if (args.dry) process.exit(0)

await ensureBucket()
const have = await existing()
let todo = jobs.filter(j => !have.has(j.path))
if (args.limit) todo = todo.slice(0, Number(args.limit))
console.log(`${have.size} already recorded, ${todo.length} to record`)

let done = 0, failed = 0, spent = 0
const queue = [...todo]
async function worker() {
  for (let j = queue.shift(); j; j = queue.shift()) {
    try {
      const mp3 = await withRetry(j.path, () => tts(j.clip, j.speed))
      await withRetry(j.path, () => upload(j.path, mp3))
      done++; spent += j.clip.en.length
      if (done % 25 === 0) console.log(`  ${done}/${todo.length} recorded`)
    } catch (e) { failed++; console.error(`✗ ${j.path} «${j.clip.en.slice(0, 40)}»: ${e.message}`) }
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
console.log(`done: ${done} recorded, ${failed} failed, ${spent} characters`)
if (failed) process.exit(1)
