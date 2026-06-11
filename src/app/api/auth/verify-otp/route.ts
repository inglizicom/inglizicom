import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

/* Verifies the WhatsApp code and, on success, registers the new device
   (evicting the oldest if the student is at their device limit). */
export const dynamic = 'force-dynamic'

function hashCode(code: string, sid: string) { return createHash('sha256').update(`${code}:${sid}`).digest('hex') }
function deviceLabel(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'جهاز'
  const br = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'متصفح'
  return `${os} · ${br}`
}

export async function POST(req: Request) {
  let body: { token?: string; code?: string; device_id?: string; ua?: string }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 }) }
  const token = (body.token || '').trim().toUpperCase()
  const code = (body.code || '').trim()
  const deviceId = (body.device_id || '').trim()
  if (!token || !code || deviceId.length < 8) return NextResponse.json({ ok: false, reason: 'invalid' })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 })
  const db = createClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: st } = await db.from('crm_students')
    .select('id, device_limit, is_active, deleted_at')
    .eq('verification_token', token).is('deleted_at', null).eq('is_active', true).maybeSingle()
  if (!st) return NextResponse.json({ ok: false, reason: 'invalid' })

  const { data: otp } = await db.from('student_otps').select('*').eq('student_id', st.id).maybeSingle()
  if (!otp) return NextResponse.json({ ok: false, reason: 'no_code' })
  if (new Date(otp.expires_at).getTime() < Date.now()) return NextResponse.json({ ok: false, reason: 'expired' })
  if (otp.attempts >= 5) return NextResponse.json({ ok: false, reason: 'locked' })
  if (hashCode(code, st.id) !== otp.code_hash) {
    await db.from('student_otps').update({ attempts: otp.attempts + 1 }).eq('student_id', st.id)
    return NextResponse.json({ ok: false, reason: 'bad_code' })
  }

  // success — register this device, evicting the oldest if at the limit
  const limit = Math.max(1, st.device_limit ?? 1)
  const { data: existing } = await db.from('student_devices').select('id, device_id, last_seen').eq('student_id', st.id)
  const list = existing ?? []
  const already = list.find((d: any) => d.device_id === deviceId)
  if (!already) {
    if (list.length >= limit) {
      const oldest = [...list].sort((a: any, b: any) => new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime())[0]
      if (oldest) await db.from('student_devices').delete().eq('id', oldest.id)
    }
    await db.from('student_devices').insert({
      student_id: st.id, device_id: deviceId,
      label: deviceLabel(body.ua || ''), user_agent: (body.ua || '').slice(0, 300),
    })
  } else {
    await db.from('student_devices').update({ last_seen: new Date().toISOString() }).eq('id', already.id)
  }
  await db.from('student_otps').delete().eq('student_id', st.id)
  return NextResponse.json({ ok: true })
}
