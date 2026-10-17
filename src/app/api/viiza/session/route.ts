import { NextResponse } from 'next/server'
import { COOKIE, login, makeSession } from '@/lib/viiza-access'

/**
 * VIIZA interactive sign-in. POST { token, deviceId, label } checks the
 * student's token, their VIIZA date and their device limit
 * (lib/viiza-access.ts), then sets the signed session cookie. DELETE signs
 * out of this browser.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: { token?: string; deviceId?: string; label?: string } = {}
  try { body = await req.json() } catch {}
  const r = await login(String(body.token ?? ''), String(body.deviceId ?? ''), body.label ? String(body.label).slice(0, 80) : null, req.headers.get('user-agent')?.slice(0, 300) ?? null)
  if (!r.ok) return NextResponse.json(r, { status: r.reason === 'error' ? 500 : 403 })
  const { value, maxAge } = makeSession(r.sid, String(body.deviceId))
  const res = NextResponse.json({ ok: true, name: r.name })
  res.cookies.set(COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
