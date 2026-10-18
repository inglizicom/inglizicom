import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { COOKIE, PRODUCTS, PROGRESS_TABLE, admin, currentAccess, readSession, type Product } from '@/lib/viiza-access'
import { mergeProgress } from '@/app/viiza/_app/progress-merge'

/**
 * The interactive books: the signed-in student's progress in their account
 * (?product=viiza → viiza_progress, 067; ?product=piirmi → piirmi_progress, 068). GET reads it; PUT merges what a device
 * sends with what is saved (united, best scores kept) and returns the
 * result. Only for a valid session with access to that book.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const productOf = (req: Request): Product => { const p = new URL(req.url).searchParams.get('product') as Product; return PRODUCTS.includes(p) ? p : 'viiza' }

async function student(product: Product): Promise<string | null> {
  const value = cookies().get(COOKIE)?.value
  const s = readSession(value)
  if (!s || !(await currentAccess(value, product))) return null
  return s.sid
}

export async function GET(req: Request) {
  const product = productOf(req)
  const sid = await student(product)
  // A guest (or a book not bought) simply has no account progress: not an error.
  if (!sid) return NextResponse.json({ ok: false })
  const { data, error } = await admin().from(PROGRESS_TABLE[product]).select('data').eq('student_id', sid).maybeSingle()
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: data?.data ?? null })
}

export async function PUT(req: Request) {
  const product = productOf(req)
  const sid = await student(product)
  if (!sid) return NextResponse.json({ ok: false }, { status: 401 })
  let body: unknown = null
  try { body = await req.json() } catch {}
  if (JSON.stringify(body ?? {}).length > 100_000) return NextResponse.json({ ok: false }, { status: 413 })
  const db = admin()
  const { data: row, error } = await db.from(PROGRESS_TABLE[product]).select('data').eq('student_id', sid).maybeSingle()
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  const merged = mergeProgress(row?.data, body)
  const { error: e2 } = await db.from(PROGRESS_TABLE[product]).upsert({ student_id: sid, data: merged, updated_at: new Date().toISOString() })
  if (e2) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, data: merged })
}
