'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Send, X } from 'lucide-react'
import { studentMyTeachers, studentSend } from '@/lib/notifications'

/**
 * "راسل أستاذك" (062) — a student writes to one of their teachers, or to the
 * academy. Self-contained (button + sheet) so the student portal only drops it
 * into its bell panel. The academy sees every message in its log.
 */
export default function StudentMessageButton({ token }: { token: string }) {
  const [open, setOpen] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string; name: string }[] | null>(null)
  const [to, setTo] = useState<string>('academy')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open || teachers) return
    studentMyTeachers(token).then(t => { setTeachers(t); if (t.length) setTo(t[0].id) }).catch(() => setTeachers([]))
  }, [open, teachers, token])

  async function send() {
    setBusy(true); setError(null)
    try {
      await studentSend(token, body, to === 'academy' ? null : to)
      setSent(true); setBody('')
      setTimeout(() => { setOpen(false); setSent(false) }, 1600)
    } catch (e: any) { setError(e?.message ?? 'تعذّر الإرسال.') }
    finally { setBusy(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-bold text-blue-700 hover:bg-blue-50 border-t border-zinc-100">
        <Send size={14} /> راسل أستاذك أو الأكاديمية
      </button>
      {/* A portal: the portal header uses backdrop-blur, which would trap a fixed sheet inside it. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir="rtl" role="dialog" aria-modal="true" aria-label="رسالة">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 space-y-3 text-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-[16px]">رسالة</h2>
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="text-zinc-400 hover:text-zinc-700"><X size={19} /></button>
            </div>
            <label className="block">
              <span className="block text-[12px] font-bold text-zinc-500 mb-1">إلى</span>
              <select value={to} onChange={e => setTo(e.target.value)} aria-label="إلى"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13.5px] bg-white">
                {(teachers ?? []).map(t => <option key={t.id} value={t.id}>الأستاذ(ة) {t.name}</option>)}
                <option value="academy">الأكاديمية (الإدارة)</option>
              </select>
            </label>
            <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={1000} rows={4} aria-label="رسالتك"
              placeholder="اكتب رسالتك…" className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-[13.5px]" />
            <p className="text-[11px] text-zinc-400">الإدارة تطّلع على الرسائل بين الطلاب والأساتذة.</p>
            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
            {sent && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] font-bold text-emerald-700">أُرسلت رسالتك ✓</div>}
            <button onClick={send} disabled={busy || !body.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 text-white text-[14px] font-black disabled:opacity-40">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} إرسال
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
