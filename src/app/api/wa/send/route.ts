import { NextResponse } from 'next/server'
import { sendByKind, waConfigured } from '@/lib/whatsapp'

/* Fire a WhatsApp message by semantic kind. Called by the CRM after events
   (e.g. a correction). No-op (sent:false) until the Cloud API env is set. */
export async function POST(req: Request) {
  let body: { phone?: string; kind?: string; params?: Record<string, string> }
  try { body = await req.json() } catch { return NextResponse.json({ sent: false, error: 'bad request' }, { status: 400 }) }
  const { phone, kind, params } = body
  if (!phone || !kind) return NextResponse.json({ sent: false, error: 'phone+kind required' }, { status: 400 })
  if (!waConfigured()) return NextResponse.json({ sent: false, reason: 'not_configured' })
  const ok = await sendByKind(phone, kind, params || {})
  return NextResponse.json({ sent: ok })
}
