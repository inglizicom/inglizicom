import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Needs the service-role key — must run server-side, never edge-cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Create a brand-new assistant account with a custom email + password.
 *
 * Founder-only. The assistant does NOT need to have signed up first — we
 * provision the auth user (email pre-confirmed so they can log in right away),
 * and the `handle_new_user` trigger creates the profile row, which we then flip
 * to role = 'assistant'.
 */
export async function POST(req: NextRequest) {
  if (!serviceKey) {
    return NextResponse.json(
      { error: 'Server not configured: SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your env and redeploy.' },
      { status: 500 },
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1) Authenticate the caller from their bearer token and confirm founder.
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) {
    return NextResponse.json({ error: 'Your session is invalid — sign in again.' }, { status: 401 })
  }

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role, is_admin')
    .eq('id', caller.user.id)
    .maybeSingle()

  const isFounder = callerProfile?.role === 'founder' || callerProfile?.is_admin === true
  if (!isFounder) {
    return NextResponse.json({ error: 'Only founders can create assistants.' }, { status: 403 })
  }

  // 2) Validate input.
  let body: { email?: string; password?: string; full_name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const email    = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const fullName = (body.full_name ?? '').trim() || null

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  // 3) Create the auth user — email_confirm so they can log in immediately.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Could not create the account.'
    // Friendlier message for the most common failure.
    const friendly = /already.*registered|exists/i.test(msg)
      ? 'An account with this email already exists. Use "Promote existing" instead.'
      : msg
    return NextResponse.json({ error: friendly }, { status: 400 })
  }

  // 4) Promote the auto-created profile to assistant (upsert in case the
  //    trigger row isn't visible yet).
  const { error: roleErr } = await admin
    .from('profiles')
    .upsert(
      { id: created.user.id, email, full_name: fullName, role: 'assistant', is_admin: false },
      { onConflict: 'id' },
    )
  if (roleErr) {
    return NextResponse.json(
      { error: 'Account created, but assigning the assistant role failed: ' + roleErr.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, id: created.user.id, email })
}
