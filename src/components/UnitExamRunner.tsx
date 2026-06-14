'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, XCircle, Trophy, RotateCcw, ArrowLeft } from 'lucide-react'
import { fetchUnitExam, submitUnitExam, type LessonQuiz } from '@/lib/lms'

interface Props { token: string; moduleId: string; title?: string; onClose: () => void; onPassed?: () => void }

/** End-of-unit TEST runner. Pass mark = 60%. Passing is required to advance. */
export default function UnitExamRunner({ token, moduleId, title, onClose, onPassed }: Props) {
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<LessonQuiz | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let alive = true
    fetchUnitExam(token, moduleId).then(d => {
      if (!alive) return
      setQuiz(d?.quiz ?? null)
      setAnswers(new Array(d?.quiz?.questions.length ?? 0).fill(-1))
      setLoading(false)
    })
    return () => { alive = false }
  }, [token, moduleId])

  const qs = quiz?.questions ?? []
  const allAnswered = answers.length > 0 && answers.every(a => a >= 0)
  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0
  const passed = qs.length > 0 && pct >= 60

  async function submit() {
    let s = 0
    qs.forEach((q, i) => { if (answers[i] === q.answer) s++ })
    setScore(s); setSubmitted(true)
    const ok = await submitUnitExam(token, moduleId, s, qs.length, answers)
    if (ok) onPassed?.()
  }
  function retry() { setSubmitted(false); setScore(0); setAnswers(new Array(qs.length).fill(-1)) }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col vp-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><Trophy size={16} className="text-amber-600" /></span>
            <div className="min-w-0"><div className="font-black text-[14px] text-zinc-900 truncate">اختبار الوحدة</div>{title && <div className="text-[11px] text-zinc-400 truncate">{title}</div>}</div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
          ) : !quiz || qs.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-[13px]">لا يوجد اختبار لهذه الوحدة بعد.</div>
          ) : submitted ? (
            <>
              <div className={`rounded-2xl p-5 text-center ${passed ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="text-4xl mb-1">{passed ? '🎉' : '💪'}</div>
                <div className={`font-black text-[20px] ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>{score} / {qs.length} · {pct}%</div>
                <div className="text-[12px] text-zinc-600 mt-1 leading-relaxed">{passed ? 'مبروك! اجتزت اختبار الوحدة — تابع لإرسال المحادثة للتصحيح.' : `للاجتياز تحتاج ٦٠٪ على الأقل. راجع أخطاءك بالأسفل وأعد المحاولة.`}</div>
              </div>
              {!passed && qs.map((q, i) => ({ q, i })).filter(x => answers[x.i] !== x.q.answer).map(({ q, i }) => (
                <div key={i} className="rounded-xl border border-rose-200 bg-rose-50/40 p-3">
                  <div className="flex items-start gap-2">
                    <XCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] text-zinc-800 leading-relaxed" dir="rtl">{i + 1}. {q.q}</div>
                      <div className="text-[12px] mt-1.5 space-y-0.5" dir="ltr" style={{ textAlign: 'left' }}>
                        {q.choices.map((c, j) => (
                          <div key={j} className={`px-2 py-1 rounded flex items-center gap-1 ${j === q.answer ? 'bg-emerald-100 text-emerald-800 font-bold' : j === answers[i] ? 'bg-rose-100 text-rose-700 line-through' : 'text-zinc-500'}`}>
                            {j === q.answer ? '✓' : j === answers[i] ? '✗' : ''} {c}
                          </div>
                        ))}
                      </div>
                      {q.explain && <div className="text-[11.5px] text-zinc-700 mt-1.5 bg-white rounded-lg px-2.5 py-1.5 leading-relaxed" dir="rtl">💡 {q.explain}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {passed ? (
                <button onClick={onClose} className="w-full py-3 rounded-xl bg-black text-white font-black text-[14px] flex items-center justify-center gap-1.5">متابعة <ArrowLeft size={14} /></button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={retry} className="flex-[2] py-3 rounded-xl bg-amber-600 text-white font-black text-[14px] flex items-center justify-center gap-1.5"><RotateCcw size={15} /> أعد المحاولة</button>
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-500 font-bold text-[13px]">إغلاق</button>
                </div>
              )}
            </>
          ) : (
            <>
              {qs.map((q, i) => (
                <div key={i} className="rounded-xl border border-zinc-100 p-3">
                  <div className="font-bold text-[13.5px] text-zinc-800 mb-2 leading-relaxed" dir="rtl">{i + 1}. {q.q}</div>
                  <div className="space-y-1.5">
                    {q.choices.map((c, j) => (
                      <button key={j} onClick={() => setAnswers(a => a.map((v, k) => k === i ? j : v))}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-[13px] transition-colors ${answers[i] === j ? 'border-amber-400 bg-amber-50 text-amber-800 font-bold' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`} dir="ltr">{c}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!loading && quiz && qs.length > 0 && !submitted && (
          <div className="px-5 py-3 border-t border-zinc-100">
            <button onClick={submit} disabled={!allAnswered} className="w-full py-3 rounded-xl bg-amber-600 text-white font-black text-[14px] disabled:opacity-40">
              {allAnswered ? 'إرسال الإجابات' : `أجب عن كل الأسئلة (${answers.filter(a => a >= 0).length}/${qs.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
