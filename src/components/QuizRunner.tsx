'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, PenLine } from 'lucide-react'
import { fetchLessonQuiz, submitQuiz, type LessonQuiz } from '@/lib/lms'

interface Props { token: string; lessonId: string; title?: string; onClose: () => void; onPassed?: () => void }

export default function QuizRunner({ token, lessonId, title, onClose, onPassed }: Props) {
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz]       = useState<LessonQuiz | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]     = useState(0)

  useEffect(() => {
    let alive = true
    fetchLessonQuiz(token, lessonId).then(d => {
      if (!alive) return
      setQuiz(d?.quiz ?? null)
      setAnswers(new Array(d?.quiz?.questions.length ?? 0).fill(-1))
      setLoading(false)
    })
    return () => { alive = false }
  }, [token, lessonId])

  const qs = quiz?.questions ?? []
  const allAnswered = answers.length > 0 && answers.every(a => a >= 0)

  async function submit() {
    let s = 0
    qs.forEach((q, i) => { if (answers[i] === q.answer) s++ })
    setScore(s); setSubmitted(true)
    const passed = qs.length > 0 && s / qs.length >= 0.6
    await submitQuiz(token, lessonId, s, qs.length, answers)
    if (passed) onPassed?.()
  }
  function retry() { setSubmitted(false); setScore(0); setAnswers(new Array(qs.length).fill(-1)) }

  const passed = qs.length > 0 && score / qs.length >= 0.6

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col vp-pop" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0"><Trophy size={16} className="text-violet-600" /></span>
            <div className="min-w-0"><div className="font-black text-[14px] text-zinc-900 truncate">اختبر فهمك</div>{title && <div className="text-[11px] text-zinc-400 truncate">{title}</div>}</div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
          ) : !quiz || qs.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-[13px]">لا يوجد اختبار لهذا الدرس بعد.</div>
          ) : submitted ? (
            <>
              {/* result */}
              <div className={`rounded-2xl p-5 text-center ${passed ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="text-4xl mb-1">{passed ? '🎉' : '💪'}</div>
                <div className={`font-black text-[20px] ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>{score} / {qs.length}</div>
                <div className="text-[12px] text-zinc-500 mt-0.5">{passed ? 'أحسنت! لقد اجتزت الاختبار' : 'حاول مرة أخرى لتتقن الدرس'}</div>
              </div>
              {/* review */}
              {qs.map((q, i) => {
                const ok = answers[i] === q.answer
                return (
                  <div key={i} className="rounded-xl border border-zinc-100 p-3">
                    <div className="flex items-start gap-2">
                      {ok ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[13px] text-zinc-800" dir="ltr">{i + 1}. {q.q}</div>
                        <div className="text-[12px] mt-1 space-y-0.5" dir="ltr">
                          {q.choices.map((c, j) => (
                            <div key={j} className={`px-2 py-1 rounded ${j === q.answer ? 'bg-emerald-50 text-emerald-700 font-bold' : j === answers[i] ? 'bg-rose-50 text-rose-600' : 'text-zinc-500'}`}>{c}</div>
                          ))}
                        </div>
                        {q.explain && <div className="text-[11px] text-zinc-500 mt-1 bg-zinc-50 rounded px-2 py-1">💡 {q.explain}</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {quiz.exercise?.prompt && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <div className="flex items-center gap-1.5 font-bold text-[13px] text-amber-700 mb-1"><PenLine size={14} /> تمرين تطبيقي</div>
                  <div className="text-[12px] text-zinc-700">{quiz.exercise.prompt}</div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={retry} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] flex items-center justify-center gap-1.5"><RotateCcw size={14} /> إعادة</button>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-[13px] flex items-center justify-center gap-1.5">متابعة <ArrowLeft size={14} /></button>
              </div>
            </>
          ) : (
            <>
              {qs.map((q, i) => (
                <div key={i} className="rounded-xl border border-zinc-100 p-3">
                  <div className="font-bold text-[13px] text-zinc-800 mb-2" dir="ltr">{i + 1}. {q.q}</div>
                  <div className="space-y-1.5">
                    {q.choices.map((c, j) => (
                      <button key={j} onClick={() => setAnswers(a => a.map((v, k) => k === i ? j : v))}
                        className={`w-full text-right px-3 py-2 rounded-lg border text-[13px] transition-colors ${answers[i] === j ? 'border-violet-400 bg-violet-50 text-violet-800 font-bold' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`} dir="ltr">{c}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!loading && quiz && qs.length > 0 && !submitted && (
          <div className="px-5 py-3 border-t border-zinc-100">
            <button onClick={submit} disabled={!allAnswered} className="w-full py-3 rounded-xl bg-violet-600 text-white font-black text-[14px] disabled:opacity-40">
              {allAnswered ? 'إرسال الإجابات' : `أجب عن كل الأسئلة (${answers.filter(a => a >= 0).length}/${qs.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
