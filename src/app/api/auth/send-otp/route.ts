import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { sendOtp, waConfigured } from '@/lib/whatsapp'

/* Sends a 6-digit code to the student's registered WhatsApp to approve a new device. */
export const dynamic = 'force-dynamic'

function hashCode(code: string, sid: string) { return createHash('sha256').update(`${code}:${sid}`).digest('hex') }
function maskPhone(p: string) { const d = (p || '').replace(/\D/g, ''); return d.length < 4 ? '••' : `${'•'.repeat(Math.max(0, d.length - 3))}${d.slice(-3)}` }

export async function POST(req: Request) {
  let body: { token?: string }
  try { body = await req.json() } catch { return NextResponse.json({ sent: false, reason: 'bad_request' }, { status: 400 }) }
  const token = (body.token || '').trim().toUpperCase()
  if (!token) return NextResponse.json({ sent: false, reason: 'invalid' })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ sent: false, reason: 'server' }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: st } = await db.from('crm_students')
    .select('id, phone_number, is_active, deleted_at')
    .eq('verification_token', token).is('deleted_at', null).eq('is_active', true).maybeSingle()
  if (!st) return NextResponse.json({ sent: false, reason: 'invalid' })
  if (!st.phone_number) return NextResponse.json({ sent: false, reason: 'no_phone' })
  if (!waConfigured()) return NextResponse.json({ sent: false, reason: 'not_configured' })

  // rate limit: 1 code / 60s
  const { data: prev } = await db.from('student_otps').select('last_sent_at').eq('student_id', st.id).maybeSingle()
  if (prev?.last_sent_at && Date.now() - new Date(prev.last_sent_at).getTime() < 60_000) {
    return NextResponse.json({ sent: false, reason: 'rate' })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  await db.from('student_otps').upsert({
    student_id: st.id, code_hash: hashCode(code, st.id),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(), attempts: 0, last_sent_at: new Date().toISOString(),
  })

  const ok = await sendOtp(st.phone_number, code)
  if (!ok) return NextResponse.json({ sent: false, reason: 'send_failed' })
  return NextResponse.json({ sent: true, phone: maskPhone(st.phone_number) })
}
