import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* Save (or refresh) a browser's push subscription, linked to the student who is
 * logged into the portal (by their verification_token). Written with the
 * service-role key. Public endpoint — the token is the student's own. */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })

  let body: { subscription?: PushSubscriptionJSON; token?: string; resubscribe?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 }) }
  const sub = body.subscription
  const endpoint = sub?.endpoint
  const p256dh = sub?.keys?.p256dh
  const auth = sub?.keys?.auth
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ ok: false, error: 'invalid_subscription' }, { status: 400 })

  // Resolve the student from the portal token (if provided).
  let studentId: string | null = null
  if (body.token) {
    const { data } = await db.from('crm_students').select('id').eq('verification_token', body.token).maybeSingle()
    studentId = data?.id ?? null
  }

  const row: Record<string, unknown> = {
    endpoint, p256dh, auth,
    user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
    last_seen_at: new Date().toISOString(),
  }
  // On a first subscribe (token present) set the student; on rotation keep it.
  if (studentId) row.student_id = studentId

  const { error } = await db.from('push_subscriptions').upsert(row, { onConflict: 'endpoint' })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/* Remove a subscription (student turned notifications off). */
export async function DELETE(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })
  let body: { endpoint?: string }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  if (!body.endpoint) return NextResponse.json({ ok: false }, { status: 400 })
  await db.from('push_subscriptions').delete().eq('endpoint', body.endpoint)
  return NextResponse.json({ ok: true })
}
