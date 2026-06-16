'use client'

import { useEffect, useState } from 'react'
import { X, Send, MessageCircle, CheckCircle2, Clock, Loader2, Star, ArrowLeft, ClipboardList } from 'lucide-react'
import { submitUnitText, aiCorrectSubmission, fetchUnitTask, CORRECTOR_WHATSAPP, type UnitSubmission } from '@/lib/lms'

interface Props {
  token: string; moduleId: string; moduleTitle: string
  existing: UnitSubmission[]
  onClose: () => void; onSubmitted: () => void
}

type Phase = 'form' | 'grading' | 'done'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function SubmissionPanel({ token, moduleId, moduleTitle, existing, onClose, onSubmitted }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<Phase>('form')
  const [count, setCount] = useState(5)
  const [result, setResult] = useState<{ correct: boolean; score: number | null; feedback?: string; status: string } | null>(null)
  const [task, setTask] = useState<string | null>(null)
  useEffect(() => { fetchUnitTask(token, moduleId).then(setTask) }, [token, moduleId])
  const last = existing[0]

  const waMsg = encodeURIComponent(`السلام عليكم، هذا تسجيل محادثة الوحدة: «${moduleTitle}».\nرمز الطالب: ${token}\n(سأرفق التسجيل الصوتي هنا)`)
  const waLink = `https://wa.me/${CORRECTOR_WHATSAPP}?text=${waMsg}`

  async function submit() {
    if (!text.trim()) return
    setBusy(true)
    const id = await submitUnitText(token, moduleId, text.trim())
    setBusy(false)
    if (!id) return
    setText(''); setPhase('grading'); setCount(5)
    const iv = setInterval(() => setCount(c => (c > 0 ? c - 1 : 0)), 1000)
    const [res] = await Promise.all([aiCorrectSubmission(token, moduleId), sleep(5000)])
    clearInterval(iv)
    setResult(res ? { correct: !!res.correct, score: res.score ?? null, feedback: res.feedback, status: res.status } : { correct: false, score: null, status: 'pending' })
    setPhase('done')
    onSubmitted()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={phase === 'grading' ? undefined : onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col vp-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Send size={15} className="text-indigo-600" /></span>
            <div className="min-w-0"><div className="font-black text-[14px] text-zinc-900 truncate">تسليم محادثة الوحدة</div><div className="text-[11px] text-zinc-400 truncate">{moduleTitle}</div></div>
          </div>
          {phase !== 'grading' && <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>}
        </div>

        {/* ── GRADING (AI countdown) ── */}
        {phase === 'grading' ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[30px] font-black text-indigo-600">{count}</div>
            </div>
            <div className="font-black text-[16px] text-zinc-900 flex items-center gap-1.5"><Send size={15} className="text-indigo-500" /> جارٍ إرسال محادثتك…</div>
            <div className="text-[12.5px] text-zinc-500 mt-1.5 leading-relaxed max-w-xs">نرسل محادثتك إلى فريق التصحيح. سيراجعها الأستاذ ويعتمدها، وتُفتح الوحدة التالية بعد المراجعة — وتصلك ملاحظته على لوحتك وواتساب.</div>
          </div>

        /* ── DONE (result) ── */
        ) : phase === 'done' && result ? (
          <div className="p-6 text-center flex flex-col items-center">
            {result.correct ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3"><CheckCircle2 size={34} className="text-emerald-600" /></div>
                <div className="font-black text-[18px] text-emerald-700">تم اعتماد إجابتك! 🎉</div>
                {result.score != null && <div className="inline-flex items-center gap-1 mt-1 text-[13px] font-black text-emerald-700"><Star size={14} /> {result.score}/100</div>}
                {result.feedback && <div className="text-[13px] text-zinc-700 leading-relaxed bg-emerald-50 rounded-xl p-3 mt-3 w-full">{result.feedback}</div>}
                <div className="text-[12.5px] text-zinc-500 mt-3">✅ الوحدة التالية مفتوحة الآن — تابع التعلّم!</div>
                <button onClick={onClose} className="w-full mt-4 py-3 rounded-2xl bg-emerald-600 text-white font-black text-[14px] flex items-center justify-center gap-1.5">متابعة <ArrowLeft size={16} /></button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-3"><Clock size={32} className="text-amber-600" /></div>
                <div className="font-black text-[17px] text-amber-700">تم إرسال محادثتك 📨</div>
                {result.feedback && <div className="text-[13px] text-zinc-700 leading-relaxed bg-amber-50 rounded-xl p-3 mt-3 w-full text-right">{result.feedback}</div>}
                <div className="text-[12.5px] text-zinc-500 mt-3 leading-relaxed">سيراجعها فريق التصحيح قريبًا، وتصلك ملاحظة الأستاذ على لوحتك وواتساب، وتُفتح الوحدة التالية بعد الاعتماد.</div>
                <div className="flex gap-2 w-full mt-4">
                  <button onClick={() => { setPhase('form'); setResult(null) }} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[13px]">تعديل وإعادة الإرسال</button>
                  <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-zinc-200 text-zinc-600 font-bold text-[13px]">إغلاق</button>
                </div>
              </>
            )}
          </div>

        /* ── FORM ── */
        ) : (
          <div className="overflow-y-auto p-5 space-y-4">
            {last && (
              <div className={`rounded-2xl p-4 ${last.status === 'reviewed' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {last.status === 'reviewed' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Clock size={16} className="text-amber-600" />}
                  <span className={`font-bold text-[13px] ${last.status === 'reviewed' ? 'text-emerald-700' : 'text-amber-700'}`}>{last.status === 'reviewed' ? 'تم التصحيح ✅' : 'قيد المراجعة…'}</span>
                  {last.status === 'reviewed' && last.score != null && <span className="mr-auto inline-flex items-center gap-1 text-[12px] font-black text-emerald-700"><Star size={13} /> {last.score}/100</span>}
                </div>
                {last.feedback && <div className="text-[13px] text-zinc-700 leading-relaxed bg-white rounded-xl p-3 mt-1 text-right">{last.feedback}</div>}
              </div>
            )}

            {task && (
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-black text-indigo-800 mb-1.5"><ClipboardList size={15} /> مهمّة الوحدة</div>
                <div className="text-[13px] text-zinc-800 leading-relaxed whitespace-pre-wrap">{task}</div>
              </div>
            )}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-[12px] font-bold text-emerald-800 mb-1.5">١. أرسل تسجيلك الصوتي (اختياري)</div>
              <p className="text-[11px] text-zinc-500 mb-2">سجّل المحادثة بصوتك وأرسلها لفريق التصحيح عبر واتساب.</p>
              <a href={waLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[13px]"><MessageCircle size={16} /> إرسال التسجيل عبر واتساب</a>
            </div>

            <div className="rounded-xl border border-zinc-200 p-3">
              <div className="text-[12px] font-bold text-zinc-700 mb-1.5">٢. اكتب نص المحادثة — يراجعها فريق التصحيح ✍️</div>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={6} dir="ltr" placeholder="Write your conversation here..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300" style={{ textAlign: 'left' }} />
              <button onClick={submit} disabled={busy || !text.trim()} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[13px] flex items-center justify-center gap-1.5 disabled:opacity-40">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} إرسال للتصحيح
              </button>
            </div>

            {existing.length > 1 && <div className="text-[11px] text-zinc-400">عدد محاولاتك السابقة: {existing.length}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
