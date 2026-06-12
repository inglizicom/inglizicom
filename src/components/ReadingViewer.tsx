'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Volume2, PlayCircle, BookOpen, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { fetchUnitReading, type UnitReading } from '@/lib/lms'
import VideoPlayer from './VideoPlayer'

interface Props { token: string; moduleId: string; title?: string; onClose: () => void; onDone?: (score: number, total: number) => void }

export default function ReadingViewer({ token, moduleId, title, onClose, onDone }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData]   = useState<UnitReading | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let alive = true
    fetchUnitReading(token, moduleId).then(d => {
      if (!alive) return
      setData(d); setAnswers(new Array(d?.quiz?.questions.length ?? 0).fill(-1)); setLoading(false)
    })
    return () => { alive = false }
  }, [token, moduleId])

  const qs = data?.quiz?.questions ?? []
  const allAnswered = answers.length > 0 && answers.every(a => a >= 0)
  function submit() {
    let s = 0; qs.forEach((q, i) => { if (answers[i] === q.answer) s++ })
    setScore(s); setSubmitted(true); onDone?.(s, qs.length)
  }
  const passed = qs.length > 0 && score === qs.length   // 100% required

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[94vh] overflow-hidden flex flex-col vp-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0"><BookOpen size={16} className="text-sky-600" /></span>
            <div className="min-w-0"><div className="font-black text-[14px] text-zinc-900 truncate">القراءة والاستماع</div>{title && <div className="text-[11px] text-zinc-400 truncate">{title}</div>}</div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {loading ? <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={28} /></div>
          : !data || (!data.text && !data.audio && !data.video) ? <div className="py-12 text-center text-zinc-400 text-[13px]">لم تُضَف قراءة لهذه الوحدة بعد.</div>
          : <>
            {/* course-voice audio */}
            {data.audio && (
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-700 mb-2"><Volume2 size={15} /> استمع بصوت الأستاذ</div>
                <audio controls src={data.audio} className="w-full" />
              </div>
            )}
            {/* passage */}
            {data.text && (
              <div className="rounded-xl border border-zinc-100 p-4 bg-white">
                <div className="text-[11px] font-bold text-zinc-400 mb-2">النص</div>
                <p className="text-[15px] leading-loose text-zinc-800 whitespace-pre-wrap" dir="ltr" style={{ textAlign: 'left' }}>{data.text}</p>
              </div>
            )}
            {/* how-to-read video */}
            {data.video && (
              <button onClick={() => setShowVideo(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-[13px]"><PlayCircle size={16} /> شاهد فيديو: كيف تقرأ النص</button>
            )}

            {/* comprehension quiz */}
            {qs.length > 0 && !submitted && (
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                <div className="font-black text-[14px] text-zinc-900">أسئلة الفهم</div>
                {qs.map((q, i) => (
                  <div key={i} className="rounded-xl border border-zinc-100 p-3">
                    <div className="font-bold text-[13.5px] text-zinc-800 mb-2 leading-relaxed" dir="rtl">{i + 1}. {q.q}</div>
                    <div className="space-y-1.5">
                      {q.choices.map((c, j) => (
                        <button key={j} onClick={() => setAnswers(a => a.map((v, k) => k === i ? j : v))}
                          className={`w-full px-3 py-2 rounded-lg border text-[13px] ${answers[i] === j ? 'border-violet-400 bg-violet-50 text-violet-800 font-bold' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`} dir="ltr" style={{ textAlign: 'left' }}>{c}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={submit} disabled={!allAnswered} className="w-full py-3 rounded-xl bg-violet-600 text-white font-black text-[14px] disabled:opacity-40">
                  {allAnswered ? 'تحقق من إجاباتي' : `أجب عن كل الأسئلة (${answers.filter(a => a >= 0).length}/${qs.length})`}
                </button>
              </div>
            )}

            {/* results */}
            {submitted && (
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                <div className={`rounded-2xl p-4 text-center ${passed ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <div className="text-3xl mb-1">{passed ? '🎉' : '💪'}</div>
                  <div className={`font-black text-[18px] ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>{score} / {qs.length}</div>
                </div>
                {qs.map((q, i) => {
                  const ok = answers[i] === q.answer
                  return (
                    <div key={i} className="rounded-xl border border-zinc-100 p-3">
                      <div className="flex items-start gap-2">
                        {ok ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[13px] text-zinc-800 leading-relaxed" dir="rtl">{i + 1}. {q.q}</div>
                          <div className="text-[12px] mt-1 space-y-0.5" dir="ltr">
                            {q.choices.map((c, j) => <div key={j} className={`px-2 py-1 rounded ${j === q.answer ? 'bg-emerald-50 text-emerald-700 font-bold' : j === answers[i] ? 'bg-rose-50 text-rose-600' : 'text-zinc-500'}`}>{c}</div>)}
                          </div>
                          {q.explain && <div className="text-[11px] text-zinc-500 mt-1 bg-zinc-50 rounded px-2 py-1">💡 {q.explain}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="flex gap-2">
                  <button onClick={() => { setSubmitted(false); setAnswers(new Array(qs.length).fill(-1)) }} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] flex items-center justify-center gap-1.5"><RotateCcw size={14} /> إعادة</button>
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-[13px]">إنهاء</button>
                </div>
              </div>
            )}
          </>}
        </div>
      </div>

      {showVideo && data?.video && (
        <VideoPlayer url={data.video} title="كيف تقرأ النص" onClose={() => setShowVideo(false)} />
      )}
    </div>
  )
}
