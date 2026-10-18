import { createHmac, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Who may open VIIZA interactive (/viiza). Server only: it holds the
 * service-role key, so import it from server components and API routes,
 * never from a client component.
 *
 * A student signs in once per device with the token they already have
 * (crm_students.verification_token). The login route checks the token, the
 * student's VIIZA date (crm_students.viiza_access_until, migration 066) and
 * their devices, then sets a signed, httpOnly cookie naming the student and
 * the device. Every page checks that cookie again against the database, so
 * staff taking access away, or freeing the student's devices, takes effect
 * on the next page the student opens.
 */

export const COOKIE = 'viiza_session'
/** Stops anyone may open, to taste the app before buying. Empty it to close the sample. */
export const FREE_STOPS: number[] = [1]
const DAYS = 180

const secret = () => process.env.VIIZA_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
}

export interface Session { sid: string; dev: string; exp: number }

const b64 = (s: string) => Buffer.from(s).toString('base64url')
const sign = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url')

export function makeSession(sid: string, dev: string): { value: string; maxAge: number } {
  const maxAge = DAYS * 24 * 3600
  const body = b64(JSON.stringify({ sid, dev, exp: Math.floor(Date.now() / 1000) + maxAge }))
  return { value: `${body}.${sign(body)}`, maxAge }
}

export function readSession(value: string | undefined): Session | null {
  if (!value || !secret()) return null
  const [body, sig] = value.split('.')
  if (!body || !sig) return null
  const want = Buffer.from(sign(body)), got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session
    return s.exp > Date.now() / 1000 && s.sid && s.dev ? s : null
  } catch { return null }
}

/** Today in Morocco, as YYYY-MM-DD (the business clock). */
export const moroccoToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date())

export interface Access { ok: true; name: string; until: string }

/** The signed-in student, if the session is valid, the student active, VIIZA still theirs and this device still registered. */
export async function currentAccess(cookie: string | undefined): Promise<Access | null> {
  // End-to-end tests only (playwright.config.ts sets the variable; production never does).
  if (process.env.VIIZA_E2E_ACCESS === '1' && process.env.NODE_ENV !== 'production' && cookie === 'e2e') return { ok: true, name: 'Test Student', until: '2099-12-31' }
  const s = readSession(cookie)
  if (!s) return null
  try {
    const db = admin()
    const { data: st } = await db.from('crm_students')
      .select('full_name, is_active, deleted_at, viiza_access_until').eq('id', s.sid).maybeSingle()
    if (!st || !st.is_active || st.deleted_at || !st.viiza_access_until || st.viiza_access_until < moroccoToday()) return null
    const { data: dev } = await db.from('student_devices').select('id').eq('student_id', s.sid).eq('device_id', s.dev).maybeSingle()
    if (!dev) return null
    return { ok: true, name: st.full_name, until: st.viiza_access_until }
  } catch { return null }
}

export type LoginResult = { ok: true; sid: string; name: string } | { ok: false; reason: 'invalid' | 'no_access' | 'expired' | 'device_limit' | 'error' }

/** Check a token for VIIZA and register the device (within the student's device limit). */
export async function login(token: string, deviceId: string, label: string | null, ua: string | null): Promise<LoginResult> {
  const t = token.trim().toUpperCase()
  if (!t || !deviceId || deviceId.length < 8) return { ok: false, reason: 'invalid' }
  try {
    const db = admin()
    const { data: st, error } = await db.from('crm_students')
      .select('id, full_name, is_active, deleted_at, viiza_access_until, device_limit').eq('verification_token', t).maybeSingle()
    if (error) return { ok: false, reason: 'error' }
    if (!st || !st.is_active || st.deleted_at) return { ok: false, reason: 'invalid' }
    if (!st.viiza_access_until) return { ok: false, reason: 'no_access' }
    if (st.viiza_access_until < moroccoToday()) return { ok: false, reason: 'expired' }
    const { data: devices } = await db.from('student_devices').select('device_id').eq('student_id', st.id)
    const known = (devices ?? []).some(d => d.device_id === deviceId)
    if (known) {
      await db.from('student_devices').update({ last_seen: new Date().toISOString() }).eq('student_id', st.id).eq('device_id', deviceId)
    } else {
      if ((devices ?? []).length >= Math.max(1, st.device_limit ?? 1)) return { ok: false, reason: 'device_limit' }
      await db.from('student_devices').insert({ student_id: st.id, device_id: deviceId, label, user_agent: ua })
    }
    return { ok: true, sid: st.id, name: st.full_name }
  } catch { return { ok: false, reason: 'error' } }
}
