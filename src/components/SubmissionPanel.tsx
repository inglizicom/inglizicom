'use client'

import { useState } from 'react'
import { X, Send, MessageCircle, CheckCircle2, Clock, Loader2, Star } from 'lucide-react'
import { submitUnitText, CORRECTOR_WHATSAPP, type UnitSubmission } from '@/lib/lms'

interface Props {
  token: string; moduleId: string; moduleTitle: string
  existing: UnitSubmission[]      // this unit's previous submissions (newest first)
  onClose: () => void; onSubmitted: () => void
}

export default function SubmissionPanel({ token, moduleId, moduleTitle, existing, onClose, onSubmitted }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const last = existing[0]

  const waMsg = encodeURIComponent(`السلام عليكم، هذا تسجيل محادثة الوحدة: «${moduleTitle}».\nرمز الطالب: ${token}\n(سأرفق التسجيل الصوتي هنا)`)
  const waLink = `https://wa.me/${CORRECTOR_WHATSAPP}?text=${waMsg}`

  async function submit() {
    if (!text.trim()) return
    setBusy(true)
    const id = await submitUnitText(token, moduleId, text.trim())
    setBusy(false)
    if (id) { setText(''); onSubmitted() }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col vp-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Send size={15} className="text-indigo-600" /></span>
            <div className="min-w-0"><div className="font-black text-[14px] text-zinc-900 truncate">تسليم محادثة الوحدة</div><div className="text-[11px] text-zinc-400 truncate">{moduleTitle}</div></div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* feedback on the most recent submission */}
          {last && (
            <div className={`rounded-2xl p-4 ${last.status === 'reviewed' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                {last.status === 'reviewed' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Clock size={16} className="text-amber-600" />}
                <span className={`font-bold text-[13px] ${last.status === 'reviewed' ? 'text-emerald-700' : 'text-amber-700'}`}>{last.status === 'reviewed' ? 'تم التصحيح ✅' : 'قيد المراجعة من فريق التصحيح…'}</span>
                {last.status === 'reviewed' && last.score != null && <span className="mr-auto inline-flex items-center gap-1 text-[12px] font-black text-emerald-700"><Star size={13} /> {last.score}/100</span>}
              </div>
              {last.status === 'reviewed' && last.feedback && <div className="text-[13px] text-zinc-700 leading-relaxed bg-white rounded-xl p-3 mt-1">{last.feedback}</div>}
              {last.status !== 'reviewed' && <div className="text-[12px] text-zinc-500">سيظهر تقييم الأستاذ هنا، وستصلك ملاحظة شخصية على واتساب.</div>}
            </div>
          )}

          {/* 1) voice note via WhatsApp */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="text-[12px] font-bold text-emerald-800 mb-1.5">١. أرسل تسجيلك الصوتي للمحادثة</div>
            <p className="text-[11px] text-zinc-500 mb-2">سجّل المحادثة بصوتك ثم أرسلها كملاحظة صوتية لفريق التصحيح عبر واتساب.</p>
            <a href={waLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[13px]"><MessageCircle size={16} /> إرسال التسجيل عبر واتساب</a>
          </div>

          {/* 2) conversation text in-site */}
          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="text-[12px] font-bold text-zinc-700 mb-1.5">٢. اكتب نص المحادثة هنا</div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={6} dir="ltr" placeholder="Write your conversation here..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300" style={{ textAlign: 'left' }} />
            <button onClick={submit} disabled={busy || !text.trim()} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} إرسال النص للتصحيح
            </button>
          </div>

          {/* history */}
          {existing.length > 1 && (
            <div className="text-[11px] text-zinc-400">عدد محاولاتك السابقة: {existing.length}</div>
          )}
        </div>
      </div>
    </div>
  )
}
