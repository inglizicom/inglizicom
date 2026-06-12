import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* Uploads the student's final-exam speaking recording (server-side, service role)
   to the student-files bucket and returns the stored path. */
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })

  let form: FormData
  try { form = await req.formData() } catch { return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 }) }
  const token = String(form.get('token') || '').trim().toUpperCase()
  const file = form.get('audio') as File | null
  if (!token || !file) return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 400 })

  const db = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: st } = await db.from('crm_students').select('id').eq('verification_token', token).is('deleted_at', null).maybeSingle()
  if (!st) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 403 })

  const ext = (file.type.includes('mp4') ? 'mp4' : file.type.includes('mpeg') ? 'mp3' : 'webm')
  const path = `final-speaking/${st.id}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  const { error } = await db.storage.from('student-files').upload(path, buf, { contentType: file.type || 'audio/webm', upsert: false })
  if (error) { console.error('[final-speaking] upload', error.message); return NextResponse.json({ ok: false, error: 'upload' }, { status: 502 }) }
  return NextResponse.json({ ok: true, path })
}
