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

/** Returns a ready-to-play WAV buffer, or null if Gemini gave no audio. */
async function googleTTS(text: string): Promise<Buffer | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: GEMINI_STYLE + text }] }],
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
