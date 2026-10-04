import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'
import { flushPushQueue } from '@/lib/notify-dispatch'

/* Deliver queued notification pushes (062). Idempotent: it only sends what has
 * not been pushed yet. Callers:
 *   - the database, right after a notification is written (pg_net), with the
 *     x-dispatch-secret kept in notify_settings
 *   - the daily cron (Authorization: Bearer CRON_SECRET)
 *   - a signed-in user's screen after they send something (their access token),
 *     or a student's portal (their portal token) — a fallback when pg_net is off. */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })

  const given = req.headers.get('x-dispatch-secret') ?? ''
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  let body: { token?: string } = {}
  try { body = await req.json() } catch { /* empty body is fine */ }

  let ok = false
  if (given) {
    const { data } = await db.from('notify_settings').select('secret').eq('id', 1).maybeSingle()
    ok = !!data?.secret && same(given, data.secret)
  }
  if (!ok && bearer && process.env.CRON_SECRET && same(bearer, process.env.CRON_SECRET)) ok = true
  if (!ok && bearer) ok = !!(await db.auth.getUser(bearer)).data?.user
  if (!ok && body.token) {
    const { data } = await db.from('crm_students').select('id').eq('verification_token', body.token.trim().toUpperCase()).is('deleted_at', null).maybeSingle()
    ok = !!data
  }
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    return NextResponse.json({ ok: true, ...(await flushPushQueue(db)) })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
