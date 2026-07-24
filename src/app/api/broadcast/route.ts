import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { waConfigured, sendTemplate } from '@/lib/whatsapp'
import {
  normalizePhone, isSendable, firstName, renderMessage,
  type BroadcastFilters, type Recipient,
} from '@/lib/broadcast'

/* WhatsApp broadcast — resolve a filtered audience (students + leads) and
 * either preview it, or send to everyone at once.
 *
 *   POST { mode: 'preview', filters }                          → { recipients, waConfigured }
 *   POST { mode: 'send', filters, message, template?, lang? }  → { total, sent, failed, failures }
 *
 * Send channel:
 *   • Cloud API (auto bulk) when WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set —
 *     business-initiated messages MUST use a pre-approved template; the
 *     composed message goes in as the template's {{1}} body parameter.
 *   • Otherwise the client falls back to a click-to-chat queue (wa.me links)
 *     and calls { mode: 'log' } afterwards so history is still recorded.
 *
 * Staff only (founder or assistant), verified from the caller's bearer token.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_RECIPIENTS = 2000        // hard safety cap per broadcast
const CONCURRENCY = 8              // parallel sends against the Graph API
const FAILURE_LOG_CAP = 50

async function requireStaff(req: NextRequest, admin: SupabaseClient):
  Promise<{ id: string; email: string | null } | NextResponse> {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const { data: caller, error } = await admin.auth.getUser(token)
  if (error || !caller?.user) return NextResponse.json({ error: 'Session invalid — sign in again.' }, { status: 401 })
  const { data: profile } = await admin.from('profiles').select('role, is_admin').eq('id', caller.user.id).maybeSingle()
  const isStaff = profile?.role === 'founder' || profile?.role === 'assistant' || profile?.is_admin === true
  if (!isStaff) return NextResponse.json({ error: 'Staff only.' }, { status: 403 })
  return { id: caller.user.id, email: caller.user.email ?? null }
}

/** Resolve the audience from crm_students and/or subscription_leads. */
async function resolveRecipients(db: SupabaseClient, f: BroadcastFilters): Promise<Recipient[]> {
  const out: Recipient[] = []

  if (f.audience === 'students' || f.audience === 'both') {
    let q = db.from('crm_students')
      .select('id, full_name, phone_number, current_level, subscription_start, enrollment_date, payment_status, student_type, is_active, country')
      .is('deleted_at', null)
    if (f.activeOnly !== false) q = q.eq('is_active', true)
    if (f.levels?.length) q = q.in('current_level', f.levels)
    if (f.paymentStatus?.length) q = q.in('payment_status', f.paymentStatus)
    if (f.studentType?.length) q = q.in('student_type', f.studentType)
    if (f.country) q = q.eq('country', f.country)
    const { data, error } = await q.limit(MAX_RECIPIENTS)
    if (error) throw new Error('students: ' + error.message)
    for (const s of data ?? []) {
      // subscription date filter: subscription_start, falling back to enrollment_date
      const d = (s.subscription_start || s.enrollment_date || '') as string
      if (f.from && (!d || d < f.from)) continue
      if (f.to && (!d || d > f.to)) continue
      if (!isSendable(s.phone_number)) continue
      out.push({
        id: s.id, kind: 'student', name: s.full_name || '',
        phone: normalizePhone(s.phone_number),
        level: (s.current_level as string | null) ?? null,
        date: d || null,
      })
    }
  }

  if (f.audience === 'leads' || f.audience === 'both') {
    let q = db.from('subscription_leads')
      .select('id, full_name, phone, level, status, created_at, is_vip, country')
      .is('deleted_at', null)
      .or('is_archived.is.null,is_archived.eq.false')
    if (f.levels?.length) q = q.in('level', f.levels)
    if (f.leadStatus?.length) q = q.in('status', f.leadStatus)
    if (f.vipOnly) q = q.eq('is_vip', true)
    if (f.country) q = q.eq('country', f.country)
    const { data, error } = await q.limit(MAX_RECIPIENTS)
    if (error) throw new Error('leads: ' + error.message)
    for (const l of data ?? []) {
      const d = ((l.created_at as string | null) || '').slice(0, 10)
      if (f.from && (!d || d < f.from)) continue
      if (f.to && (!d || d > f.to)) continue
      if (!isSendable(l.phone)) continue
      out.push({
        id: l.id, kind: 'lead', name: l.full_name || '',
        phone: normalizePhone(l.phone),
        level: (l.level as string | null) ?? null,
        date: d || null,
      })
    }
  }

  // search + dedupe by phone (a lead who became a student keeps one entry —
  // students win, so their level/name is the one used)
  const term = (f.search || '').trim().toLowerCase()
  const filtered = term
    ? out.filter(r => r.name.toLowerCase().includes(term) || r.phone.includes(term.replace(/\D/g, '')))
    : out
  const seen = new Map<string, Recipient>()
  for (const r of filtered) {
    const prev = seen.get(r.phone)
    if (!prev || (prev.kind === 'lead' && r.kind === 'student')) seen.set(r.phone, r)
  }
  return [...seen.values()].slice(0, MAX_RECIPIENTS)
}

/** Run jobs with a small concurrency pool. */
async function pool<T, R>(items: T[], n: number, job: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; results[idx] = await job(items[idx]) }
  }))
  return results
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing.' }, { status: 500 })
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

  const staff = await requireStaff(req, admin)
  if (staff instanceof NextResponse) return staff

  let body: {
    mode?: 'preview' | 'send' | 'log'
    filters?: BroadcastFilters
    message?: string
    template?: string
    lang?: string
    exclude?: string[]          // phones the user un-ticked in the preview
    // mode:'log' (click-to-chat) passes its own counters
    total?: number; sent?: number
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body.' }, { status: 400 }) }
  const filters = body.filters
  if (!filters?.audience) return NextResponse.json({ error: 'filters.audience required.' }, { status: 400 })

  // ── log: record a click-to-chat broadcast the client just walked through ──
  if (body.mode === 'log') {
    await admin.from('crm_broadcasts').insert({
      created_by: staff.id, created_by_email: staff.email,
      audience: filters.audience, filters, message: body.message ?? null,
      template: null, channel: 'click_to_chat',
      total: body.total ?? 0, sent: body.sent ?? 0, failed: 0, failures: [],
    })
    return NextResponse.json({ ok: true })
  }

  let recipients: Recipient[]
  try { recipients = await resolveRecipients(admin, filters) }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }) }
  if (body.exclude?.length) {
    const ex = new Set(body.exclude.map(normalizePhone))
    recipients = recipients.filter(r => !ex.has(r.phone))
  }

  // ── preview: the filtered audience, no send ──
  if (body.mode !== 'send') {
    return NextResponse.json({ recipients, waConfigured: waConfigured() })
  }

  // ── send: Cloud API bulk ──
  const message = (body.message || '').trim()
  if (!message) return NextResponse.json({ error: 'Message is empty.' }, { status: 400 })
  if (!recipients.length) return NextResponse.json({ error: 'No recipients match the filters.' }, { status: 400 })
  if (!waConfigured()) {
    return NextResponse.json({ error: 'Cloud API not configured — use the click-to-chat queue.' }, { status: 409 })
  }
  // Business-initiated bulk needs a pre-approved template; the whole composed
  // message rides in as its single {{1}} body parameter.
  const template = (body.template || process.env.WHATSAPP_TPL_BROADCAST || 'crm_broadcast').trim()
  const lang = (body.lang || process.env.WHATSAPP_TPL_BROADCAST_LANG || 'ar').trim()

  const failures: { name: string; phone: string }[] = []
  let sent = 0
  await pool(recipients, CONCURRENCY, async r => {
    const text = renderMessage(message, r) || message
    const ok = await sendTemplate(r.phone, template, lang, [text])
    if (ok) sent++
    else if (failures.length < FAILURE_LOG_CAP) failures.push({ name: r.name || firstName(r.name), phone: r.phone })
  })

  await admin.from('crm_broadcasts').insert({
    created_by: staff.id, created_by_email: staff.email,
    audience: filters.audience, filters, message, template, channel: 'cloud_api',
    total: recipients.length, sent, failed: recipients.length - sent, failures,
  })

  return NextResponse.json({ total: recipients.length, sent, failed: recipients.length - sent, failures })
}
