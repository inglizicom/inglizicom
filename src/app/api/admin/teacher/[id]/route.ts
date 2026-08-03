import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const EMAIL_RE   = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Manage one teaching account. Founder-only.
 *
 *   GET    → what a delete would destroy (classes, reports, …)
 *   PATCH  → change email, reset password, rename
 *   DELETE → remove the auth user; everything cascades from profiles
 *
 * Email and password live in auth.users, which the anon client cannot touch at
 * all — hence a service-role route rather than a direct update from the CRM.
 */

function adminClient(key: string) {
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
type Admin = ReturnType<typeof adminClient>

/** Returns the admin client once the caller is confirmed to be a founder. */
async function requireFounder(req: NextRequest): Promise<{ admin: Admin } | { error: NextResponse }> {
  if (!serviceKey) {
    return { error: NextResponse.json({ error: 'Server not configured: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 }) }
  }
  const admin = adminClient(serviceKey)

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return { error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }) }

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) {
    return { error: NextResponse.json({ error: 'Your session is invalid — sign in again.' }, { status: 401 }) }
  }
  const { data: profile } = await admin
    .from('profiles').select('role, is_admin').eq('id', caller.user.id).maybeSingle()
  if (!(profile?.role === 'founder' || profile?.is_admin === true)) {
    return { error: NextResponse.json({ error: 'Only founders can manage teaching accounts.' }, { status: 403 }) }
  }
  return { admin }
}

/** Guard: this route manages teachers, never staff or students. */
async function assertTeacher(admin: Admin, id: string): Promise<NextResponse | null> {
  const { data } = await admin.from('profiles').select('role').eq('id', id).maybeSingle()
  if (!data) return NextResponse.json({ error: 'No such account.' }, { status: 404 })
  if (data.role !== 'teacher') {
    return NextResponse.json(
      { error: `That account is a ${data.role}, not a teacher. Manage it from Settings.` },
      { status: 400 },
    )
  }
  return null
}

/* ── What would a delete cost? ─────────────────────────── */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireFounder(req)
  if ('error' in gate) return gate.error
  const { admin } = gate

  const bad = await assertTeacher(admin, params.id)
  if (bad) return bad

  const count = async (table: string, col = 'teacher_id') => {
    const { count: n } = await admin.from(table).select('id', { count: 'exact', head: true }).eq(col, params.id)
    return n ?? 0
  }
  const [classes, reports, materials, students, reviews] = await Promise.all([
    count('class_sessions'), count('lesson_reports'), count('teacher_materials'),
    count('teacher_students'), count('teacher_reviews'),
  ])

  return NextResponse.json({ classes, reports, materials, students, reviews })
}

/* ── Change email / reset password / rename ────────────── */

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireFounder(req)
  if ('error' in gate) return gate.error
  const { admin } = gate

  const bad = await assertTeacher(admin, params.id)
  if (bad) return bad

  let body: { email?: string; password?: string; full_name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const email    = body.email?.trim().toLowerCase()
  const password = body.password
  const fullName = body.full_name?.trim()

  if (email !== undefined && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password !== undefined && password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const authPatch: Record<string, unknown> = {}
  if (email)    { authPatch.email = email; authPatch.email_confirm = true }
  if (password) authPatch.password = password
  if (fullName) authPatch.user_metadata = { full_name: fullName }

  if (Object.keys(authPatch).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(params.id, authPatch)
    if (error) {
      const friendly = /already.*(registered|exists)|duplicate/i.test(error.message)
        ? 'Another account already uses that email.'
        : error.message
      return NextResponse.json({ error: friendly }, { status: 400 })
    }
  }

  // Keep the mirrored columns in profiles in step with auth.users.
  const profilePatch: Record<string, unknown> = {}
  if (email)    profilePatch.email = email
  if (fullName) profilePatch.full_name = fullName
  if (Object.keys(profilePatch).length > 0) {
    const { error } = await admin.from('profiles').update(profilePatch).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (fullName) {
    await admin.from('teacher_profiles').update({ display_name: fullName }).eq('id', params.id)
  }

  return NextResponse.json({ ok: true })
}

/* ── Delete ────────────────────────────────────────────── */

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireFounder(req)
  if ('error' in gate) return gate.error
  const { admin } = gate

  const bad = await assertTeacher(admin, params.id)
  if (bad) return bad

  // profiles.id → auth.users(id) on delete cascade, and every teacher table
  // cascades from profiles — so removing the auth user takes the classes,
  // attendance, reports, materials and reviews with it. The UI states the
  // count before asking; this is the point of no return.
  const { error } = await admin.auth.admin.deleteUser(params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
