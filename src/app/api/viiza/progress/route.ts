import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { COOKIE, admin, currentAccess, readSession } from '@/lib/viiza-access'
import { mergeProgress } from '@/app/viiza/_app/progress-merge'

/**
 * VIIZA interactive: the signed-in student's progress in their account
 * (viiza_progress, migration 067). GET reads it; PUT merges what a device
 * sends with what is saved (united, best scores kept) and returns the
 * result. Only for a valid session with VIIZA access.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function student(): Promise<string | null> {
  const value = cookies().get(COOKIE)?.value
  const s = readSession(value)
  if (!s || !(await currentAccess(value))) return null
  return s.sid
}

export async function GET() {
  const sid = await student()
  if (!sid) return NextResponse.json({ ok: false }, { status: 401 })
  const { data, error } = await admin().from('viiza_progress').select('data').eq('student_id', sid).maybeSingle()
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: data?.data ?? null })
}

export async function PUT(req: Request) {
  const sid = await student()
  if (!sid) return NextResponse.json({ ok: false }, { status: 401 })
  let body: unknown = null
  try { body = await req.json() } catch {}
  if (JSON.stringify(body ?? {}).length > 100_000) return NextResponse.json({ ok: false }, { status: 413 })
  const db = admin()
  const { data: row, error } = await db.from('viiza_progress').select('data').eq('student_id', sid).maybeSingle()
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  const merged = mergeProgress(row?.data, body)
  const { error: e2 } = await db.from('viiza_progress').upsert({ student_id: sid, data: merged, updated_at: new Date().toISOString() })
  if (e2) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: merged })
}
