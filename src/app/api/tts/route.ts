import { NextResponse } from 'next/server'

const CACHE = 'public, max-age=86400, immutable'

// Allow Sahla subdomain + same-origin to call this endpoint.
const ALLOWED_ORIGINS = new Set([
  'https://sahla.inglizi.com',
  'https://inglizi.com',
  'https://www.inglizi.com',
  'http://localhost:3000',
  'http://localhost:8766',
])

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://sahla.inglizi.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

/* ── Google Gemini TTS ─────────────────────────────────────────────────────
 * The preview TTS model returns raw signed 16-bit PCM (mono, 24 kHz), which
 * browsers can't play directly — wrap it in a minimal WAV container. */
const GEMINI_VOICE = 'Kore'           // clear, friendly neural voice
const GEMINI_MODEL = 'gemini-2.5-flash-preview-tts'
// A natural-language style directive Gemini follows but does NOT read aloud —
// makes the delivery warm + slow + clear (a kind teacher for beginners),
// fixing the flat/robotic, slightly-fast default delivery.
const GEMINI_STYLE = 'Read the following aloud slowly and very clearly, in a natural standard American English accent (General American — NOT British), in a warm, friendly and encouraging tone, like a kind American English teacher speaking to beginner students. Leave a short pause after each sentence: '

function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bits = 16): Buffer {
  const blockAlign = (channels * bits) >> 3
  const byteRate = sampleRate * blockAlign
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20)
  h.writeUInt16LE(channels, 22); h.writeUInt32LE(sampleRate, 24)
  h.writeUInt32LE(byteRate, 28); h.writeUInt16LE(blockAlign, 32); h.writeUInt16LE(bits, 34)
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

/** Returns a ready-to-play WAV buffer, or null if Gemini gave no audio.
 *  `style` is the natural-language directive Gemini follows but never reads aloud —
 *  the pronunciation deck passes a different one per gear (see GEARS below). */
async function googleTTS(text: string, style: string = GEMINI_STYLE): Promise<Buffer | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: style + text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } },
      },
    }),
  })
  if (!res.ok) { console.error('[/api/tts] Gemini HTTP', res.status); return null }
  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts as Array<{ inlineData?: { data?: string; mimeType?: string } }> | undefined
  const audio = parts?.find(p => p.inlineData?.data)?.inlineData
  if (!audio?.data) return null
  // honour the sample rate the model reports (rate=NNNN in the mime type)
  const rate = parseInt(audio.mimeType?.match(/rate=(\d+)/)?.[1] ?? '24000', 10) || 24000
  return pcmToWav(Buffer.from(audio.data, 'base64'), rate)
}

/* ── GET: the pronunciation deck's three gears ─────────────────────────────
 * The browser's own speech engine reads like a station announcement — fine for a
 * button label, useless as a pronunciation MODEL, because a robotic vowel teaches a
 * robotic vowel. So the deck asks a real voice instead, and a gear is not merely a
 * speed: each one carries its own STYLE, which is what makes the fast take actually
 * link its words instead of only hurrying through them. gpt-4o-mini-tts follows the
 * style far more than the `speed` number, so the client also trims the tempo per gear
 * (preservesPitch) — that is what guarantees the three takes are audibly a ladder.
 *
 * GET, not POST, on purpose: the URL is the cache key, so the browser, any CDN and
 * the map below all reuse one take — a line replayed ten times is synthesised once. */
type Gear = 'clear' | 'slow' | 'natural' | 'fast'
const GEARS: Record<Gear, { speed: number; how: string; google: string }> = {
  // The plain, unreduced model — for a learner who wants to be understood, not to
  // acquire an accent. Every word is its full dictionary self.
  clear: {
    speed: 0.72,
    how: 'You are a patient English teacher demonstrating a word for a beginner. Speak very slowly and deliberately with exaggerated clarity, give every word its full dictionary pronunciation, and leave a small pause between words. Do NOT run words together.',
    google: 'Read this very slowly and clearly, in neutral English, giving every word its full separate pronunciation, with a small pause between words: ',
  },
  // The connected form, but slow enough to copy. This is the take that teaches: the
  // words are already joined and reduced, and the student can still hear every part.
  slow: {
    speed: 0.72,
    how: 'Speak slowly and gently, but keep the words LINKED and reduced exactly as written — this is relaxed American connected speech played back at half speed so a learner can copy it. Do not re-separate the words or restore the full forms; simply say the linked version slowly.',
    google: 'Read this slowly but keep the words linked and run together exactly as written, like relaxed American speech slowed down for a learner to copy: ',
  },
  natural: {
    speed: 1,
    how: 'Warm, clear General American English at a normal conversational pace — a friendly teacher speaking to a class. Natural, never robotic.',
    google: 'Read this clearly at a normal conversational pace, in warm General American English, like a friendly teacher: ',
  },
  fast: {
    speed: 1.15,
    how: 'Relaxed casual General American English at real native speed, with the words linked and run together the way people actually talk to a friend. Do NOT over-articulate — this is the connected-speech model students must learn to hear.',
    google: 'Read this quickly and casually, like talking to a friend, letting the words run together the way native American speakers really do: ',
  },
}
/* One process-lifetime cache: a recording session replays the same lines many times,
   and there is no reason to pay for — or wait on — the same sentence twice. */
const deckCache = new Map<string, { body: Buffer; type: string }>()
const DECK_CACHE_MAX = 400

export async function GET(req: Request) {
  const url = new URL(req.url)
  const text = (url.searchParams.get('t') || '').trim().slice(0, 400)
  const gear = (url.searchParams.get('g') || 'natural') as Gear
  const voice = (url.searchParams.get('v') || 'coral').replace(/[^a-z]/g, '')
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })
  if (!GEARS[gear]) return NextResponse.json({ error: 'bad gear' }, { status: 400 })

  const key = `${gear}|${voice}|${text}`
  const hit = deckCache.get(key)
  const send = (body: Buffer, type: string, cached: boolean) =>
    new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: { 'Content-Type': type, 'Cache-Control': CACHE, 'X-Tts-Cache': cached ? 'hit' : 'miss' },
    })
  if (hit) return send(hit.body, hit.type, true)

  const keep = (body: Buffer, type: string) => {
    if (deckCache.size >= DECK_CACHE_MAX) deckCache.delete(deckCache.keys().next().value as string)
    deckCache.set(key, { body, type })
    return send(body, type, false)
  }

  // 1) OpenAI — carries the per-gear style instruction AND a real speed control.
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts', input: text, voice,
          speed: GEARS[gear].speed, instructions: GEARS[gear].how, response_format: 'mp3',
        }),
      })
      if (res.ok) return keep(Buffer.from(await res.arrayBuffer()), 'audio/mpeg')
      console.error('[/api/tts GET] OpenAI HTTP', res.status)
    } catch (err) { console.error('[/api/tts GET] OpenAI error:', err) }
  }

  // 2) Google (Gemini) — same idea, style carried in the prompt.
  try {
    const wav = await googleTTS(text, GEARS[gear].google)
    if (wav) return keep(wav, 'audio/wav')
  } catch (err) { console.error('[/api/tts GET] Gemini error:', err) }

  // 3) Nothing available — the client falls back to the device voice rather than
  //    going silent in the middle of a lesson.
  return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 })
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  let text = '', provider = ''
  try {
    const body = await req.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
    provider = typeof body.provider === 'string' ? body.provider : ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400, headers: cors })
  }

  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400, headers: cors })
  if (text.length > 500) text = text.slice(0, 500)

  // Preferred: Google Gemini neural voice (when requested + key present).
  // Falls through to OpenAI below if Gemini is unavailable or returns no audio.
  if (provider === 'google') {
    try {
      const wav = await googleTTS(text)
      if (wav) return new NextResponse(new Uint8Array(wav), { status: 200, headers: { ...cors, 'Content-Type': 'audio/wav', 'Cache-Control': CACHE } })
    } catch (err) {
      console.error('[/api/tts] Gemini error:', err)
    }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS unavailable' }, { status: 503, headers: cors })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice: 'nova',
        speed: 0.92,
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[/api/tts] OpenAI error:', err)
      return NextResponse.json({ error: 'TTS failed' }, { status: 502, headers: cors })
    }

    const audio = await res.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': CACHE,
      },
    })
  } catch (err) {
    console.error('[/api/tts] error:', err)
    return NextResponse.json({ error: 'TTS error' }, { status: 500, headers: cors })
  }
}
