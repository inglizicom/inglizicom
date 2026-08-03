import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Needs the service-role key — must run server-side, never edge-cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Create a teaching account (email + password) for teacher.inglizi.com.
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

  const admin = adminClient(serviceKey)

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
  let body: { email?: string; password?: string; full_name?: string; convert?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const email    = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const fullName = (body.full_name ?? '').trim() || null
  const convert  = body.convert === true   // second pass, after the founder confirmed

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  // 3) Provision the auth user, pre-confirmed so they can sign in right away.
  let userId: string | null = null
  let adopted = false

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })

  if (created?.user) {
    userId = created.user.id
  } else if (createErr && /already.*(registered|exists)|duplicate/i.test(createErr.message)) {
    // The email is taken. That is usually a half-finished attempt from before the
    // migrations ran — but it could equally be a real student's account, and
    // taking it over would reset their password and lock them out. So we never
    // do it silently: the caller has to come back with convert = true.
    const existing = await findUserByEmail(admin, email)
    if (!existing) {
      return NextResponse.json(
        { error: 'That email is taken but the account could not be found. Check it in Supabase → Authentication.' },
        { status: 400 },
      )
    }

    const { data: existingProfile } = await admin
      .from('profiles').select('role, full_name').eq('id', existing).maybeSingle()
    const existingRole = (existingProfile?.role as string) ?? 'student'

    if (!convert) {
      return NextResponse.json({
        error: `An account already exists for ${email} (role: ${existingRole}).`,
        needs_confirmation: true,
        existing_role: existingRole,
        existing_name: existingProfile?.full_name ?? null,
      }, { status: 409 })
    }
    if (existingRole === 'founder' || existingRole === 'assistant') {
      return NextResponse.json(
        { error: `That account is a ${existingRole}. Change its role in Settings instead of converting it here.` },
        { status: 400 },
      )
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(existing, {
      password, email_confirm: true,
      ...(fullName ? { user_metadata: { full_name: fullName } } : {}),
    })
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })
    userId  = existing
    adopted = true
  } else {
    return NextResponse.json({ error: createErr?.message ?? 'Could not create the account.' }, { status: 400 })
  }

  // 4) Role + profile row. If this fails on a brand-new account, roll the auth
  //    user back — a half-made login nobody can use is worse than a clean error.
  const { error: roleErr } = await admin
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName, role: 'teacher', is_admin: false },
            { onConflict: 'id' })
  if (roleErr) {
    if (!adopted) await admin.auth.admin.deleteUser(userId).catch(() => {})
    const missingEnum = /invalid input value for enum user_role/i.test(roleErr.message)
    return NextResponse.json(
      {
        error: missingEnum
          ? 'The database does not know the "teacher" role yet — run supabase/migrations/043_teacher_role.sql (on its own), then 044 and 045. No account was left behind.'
          : 'Could not assign the teacher role: ' + roleErr.message,
      },
      { status: 500 },
    )
  }

  const { error: profErr } = await admin
    .from('teacher_profiles')
    .upsert({ id: userId, display_name: fullName }, { onConflict: 'id' })
  if (profErr) console.error('create-teacher: teacher_profiles seed', profErr.message)

  return NextResponse.json({ ok: true, id: userId, email, adopted })
}

function adminClient(key: string) {
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
type Admin = ReturnType<typeof adminClient>

/** Supabase has no get-user-by-email admin call, so page through the list. */
async function findUserByEmail(admin: Admin, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data?.users?.length) return null
    const hit = data.users.find(u => (u.email ?? '').toLowerCase() === email)
    if (hit) return hit.id
    if (data.users.length < 200) return null
  }
  return null
}
