import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT } from '@/data/chatbot-knowledge'

export const runtime = 'edge'

type Message = { role: 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 12 // limit history sent to keep token cost predictable
const MAX_MESSAGE_LEN = 1000

export async function POST(req: NextRequest) {
  let body: { messages?: Message[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []
  if (incoming.length === 0) {
    return NextResponse.json({ error: 'No messages' }, { status: 400 })
  }

  const sanitized = incoming
    .slice(-MAX_MESSAGES)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LEN) }))

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server missing OPENAI_API_KEY' }, { status: 500 })
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 600,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized],
    }),
  })

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '')
    return NextResponse.json(
      { error: 'Upstream failed', detail: detail.slice(0, 200) },
      { status: 502 }
    )
  }

  const data = await upstream.json()
  const reply: string = data?.choices?.[0]?.message?.content?.trim?.() || ''
  if (!reply) {
    return NextResponse.json({ error: 'Empty reply' }, { status: 502 })
  }

  return NextResponse.json({ reply })
}
