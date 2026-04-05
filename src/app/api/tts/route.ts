import { NextResponse } from 'next/server'

// Cache headers: browsers can cache the audio response for 24h
const CACHE = 'public, max-age=86400, immutable'

export async function POST(req: Request) {
  let text = ''
  try {
    const body = await req.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })
  if (text.length > 500) text = text.slice(0, 500)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',   // HD model = more natural, still fast
        input: text,
        voice: 'nova',       // warm, natural female voice
        speed: 0.92,         // slightly slower = clearer for learners
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[/api/tts] OpenAI error:', err)
      return NextResponse.json({ error: 'TTS failed' }, { status: 502 })
    }

    const audio = await res.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': CACHE,
      },
    })
  } catch (err) {
    console.error('[/api/tts] error:', err)
    return NextResponse.json({ error: 'TTS error' }, { status: 500 })
  }
}
