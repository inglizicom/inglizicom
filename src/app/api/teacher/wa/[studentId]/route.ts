import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * "Message on WhatsApp" for teachers — without handing them the number.
 *
 * The teacher UI only ever sees a masked phone (teacher_my_students masks it in
 * SQL). To actually message someone, the browser hits this route with the
 * student id; we verify server-side that the caller is a teacher who teaches that
 * student (assignment or active class seat), then 302 straight to wa.me. The raw number is never rendered in the
 * teacher's UI and can't be scraped out of a list.
 *
 * GET /api/teacher/wa/<studentId>?text=...
 * Authorization: Bearer <supabase access token>
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } },
) {
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 500 })
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // The token can come from the header (fetch) or the query (window.open).
  const header = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  const token  = header || (req.nextUrl.searchParams.get('t') ?? '').trim()
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) {
    return NextResponse.json({ error: 'Your session expired — sign in again.' }, { status: 401 })
  }

  const { data: profile } = await admin
    .from('profiles').select('role, is_admin').eq('id', caller.user.id).maybeSingle()

  const isTeacher = profile?.role === 'teacher'
  const isStaff   = profile?.role === 'founder' || profile?.role === 'assistant' || profile?.is_admin === true
  if (!isTeacher && !isStaff) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 })
  }

  // A teacher may only message a student they currently teach — assigned to
  // them, or holding an active seat in one of their classes. The rule lives in
  // the database (teacher_can_reach_student, 047) so it matches the roster RLS.
  // Staff may message anyone.
  if (isTeacher) {
    const { data: allowed, error: checkErr } = await admin.rpc('teacher_can_reach_student', {
      p_teacher: caller.user.id, p_student: params.studentId,
    })
    if (checkErr || allowed !== true) {
      return NextResponse.json({ error: 'This student is not in your list.' }, { status: 403 })
    }
  }

  const { data: student } = await admin
    .from('crm_students').select('phone_number')
    .eq('id', params.studentId)
    .is('deleted_at', null)
    .maybeSingle()

  const cleaned = (student?.phone_number ?? '').replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (!cleaned) {
    return NextResponse.json({ error: 'This student has no phone number on file.' }, { status: 404 })
  }

  const text = req.nextUrl.searchParams.get('text')
  const wa   = `https://wa.me/${cleaned}${text ? `?text=${encodeURIComponent(text)}` : ''}`
  return NextResponse.redirect(wa, 302)
}
