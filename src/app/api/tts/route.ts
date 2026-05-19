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

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  let text = ''
  try {
    const body = await req.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400, headers: cors })
  }

  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400, headers: cors })
  if (text.length > 500) text = text.slice(0, 500)

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
