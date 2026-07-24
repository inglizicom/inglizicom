import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { pushConfigured, sendOne, type SubRow } from '@/lib/push-server'
import type { PushPayload } from '@/lib/push'
import type { BroadcastFilters } from '@/lib/broadcast'

/* Send an app push notification to a filtered set of students.
 *   POST { mode:'count', filters }                 → { total, pushConfigured }
 *   POST { mode:'send',  filters, title, body, image?, url? } → { total, sent, failed }
 * Staff only (bearer token → profiles.role). Dead endpoints are pruned. */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CONCURRENCY = 12

async function requireStaff(req: NextRequest, admin: SupabaseClient) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const { data: caller, error } = await admin.auth.getUser(token)
  if (error || !caller?.user) return NextResponse.json({ error: 'Session invalid.' }, { status: 401 })
  const { data: p } = await admin.from('profiles').select('role, is_admin').eq('id', caller.user.id).maybeSingle()
  if (!(p?.role === 'founder' || p?.role === 'assistant' || p?.is_admin === true))
    return NextResponse.json({ error: 'Staff only.' }, { status: 403 })
  return caller.user
}

/** Student ids matching the audience filters (students only — leads have no app). */
async function targetStudentIds(db: SupabaseClient, f: BroadcastFilters): Promise<string[] | null> {
  if (f.audience === 'leads') return []   // leads can't receive app push
  let q = db.from('crm_students').select('id, subscription_start, enrollment_date').is('deleted_at', null)
  if (f.activeOnly !== false) q = q.eq('is_active', true)
  if (f.levels?.length) q = q.in('current_level', f.levels)
  if (f.paymentStatus?.length) q = q.in('payment_status', f.paymentStatus)
  if (f.studentType?.length) q = q.in('student_type', f.studentType)
  if (f.country) q = q.eq('country', f.country)
  const { data, error } = await q.limit(5000)
  if (error) throw new Error(error.message)
  return (data ?? []).filter(s => {
    const d = (s.subscription_start || s.enrollment_date || '') as string
    if (f.from && (!d || d < f.from)) return false
    if (f.to && (!d || d > f.to)) return false
    return true
  }).map(s => s.id as string)
}

async function pool<T, R>(items: T[], n: number, job: (t: T) => Promise<R>): Promise<R[]> {
  const res: R[] = new Array(items.length); let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; res[idx] = await job(items[idx]) }
  }))
  return res
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing.' }, { status: 500 })
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  const staff = await requireStaff(req, admin)
  if (staff instanceof NextResponse) return staff

  let body: { mode?: 'count' | 'send'; filters?: BroadcastFilters; title?: string; body?: string; image?: string; url?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body.' }, { status: 400 }) }
  const filters = body.filters
  if (!filters?.audience) return NextResponse.json({ error: 'filters.audience required.' }, { status: 400 })

  // Resolve subscriptions for the audience.
  let ids: string[] | null
  try { ids = await targetStudentIds(admin, filters) } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
  let subs: SubRow[] = []
  if (ids && ids.length) {
    const { data } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').in('student_id', ids)
    subs = (data ?? []) as SubRow[]
  }

  if (body.mode !== 'send') {
    return NextResponse.json({ total: subs.length, students: ids?.length ?? 0, pushConfigured: pushConfigured() })
  }

  const title = (body.title || '').trim()
  const text = (body.body || '').trim()
  if (!title && !text) return NextResponse.json({ error: 'Title or body required.' }, { status: 400 })
  if (!pushConfigured()) return NextResponse.json({ error: 'Push not configured (VAPID env missing).' }, { status: 409 })
  if (!subs.length) return NextResponse.json({ total: 0, sent: 0, failed: 0, note: 'No devices match — students must enable notifications in the app.' })

  const payload: PushPayload = {
    title: title || 'Inglizi',
    body: text,
    image: body.image?.trim() || undefined,
    url: body.url?.trim() || '/',
    tag: 'crm-broadcast',
  }

  let sent = 0; const dead: string[] = []
  await pool(subs, CONCURRENCY, async s => {
    const r = await sendOne(s, payload)
    if (r === 'ok') sent++
    else if (r === 'gone') dead.push(s.id)
  })
  if (dead.length) await admin.from('push_subscriptions').delete().in('id', dead)

  return NextResponse.json({ total: subs.length, sent, failed: subs.length - sent, pruned: dead.length })
}
