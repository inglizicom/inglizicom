import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Needs the service-role key — must run server-side, never edge-cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Create a teaching account (email + password) for teachers.inglizi.com.
 *
 * Founder-only. Mirrors create-assistant, but lands on role = 'teacher' and
 * seeds the teacher_profiles row so the new teacher opens onto a real profile
 * instead of an empty screen.
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

  // 1) Authenticate the caller and confirm founder.
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) {
    return NextResponse.json({ error: 'Your session is invalid — sign in again.' }, { status: 401 })
  }

  const { data: callerProfile } = await admin
    .from('profiles').select('role, is_admin').eq('id', caller.user.id).maybeSingle()

  const isFounder = callerProfile?.role === 'founder' || callerProfile?.is_admin === true
  if (!isFounder) {
    return NextResponse.json({ error: 'Only founders can create teaching accounts.' }, { status: 403 })
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

  // 3) Provision the auth user, pre-confirmed so they can sign in right away.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Could not create the account.'
    const friendly = /already.*registered|exists/i.test(msg)
      ? 'An account with this email already exists. Change its role to teacher instead.'
      : msg
    return NextResponse.json({ error: friendly }, { status: 400 })
  }

  // 4) Role + profile row.
  const { error: roleErr } = await admin
    .from('profiles')
    .upsert({ id: created.user.id, email, full_name: fullName, role: 'teacher', is_admin: false },
            { onConflict: 'id' })
  if (roleErr) {
    return NextResponse.json(
      { error: 'Account created, but assigning the teacher role failed: ' + roleErr.message },
      { status: 500 },
    )
  }

  const { error: profErr } = await admin
    .from('teacher_profiles')
    .upsert({ id: created.user.id, display_name: fullName }, { onConflict: 'id' })
  if (profErr) console.error('create-teacher: teacher_profiles seed', profErr.message)

  return NextResponse.json({ ok: true, id: created.user.id, email })
}
