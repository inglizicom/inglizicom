'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, RotateCcw, Trophy } from 'lucide-react'
import type { QuizQuestion } from '@/data/private-lessons/types'

type QuizSectionType = {
  kind: 'quiz'
  title?: string
  questions: QuizQuestion[]
}

type Status = 'idle' | 'answered'

export default function QuizSection({ section }: { section: QuizSectionType; step: number }) {
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const total = section.questions.length
  const question = section.questions[qIdx]
  const isLast = qIdx === total - 1

  function pick(opt: string) {
    if (status !== 'idle') return
    setPicked(opt)
    setStatus('answered')
    if (opt === question.correct) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) {
      setDone(true)
    } else {
      setQIdx((i) => i + 1)
      setPicked(null)
      setStatus('idle')
    }
  }

  function restart() {
    setQIdx(0)
    setPicked(null)
    setStatus('idle')
    setScore(0)
    setDone(false)
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-2xl">
          <div className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-3 font-display">
            Quiz complete
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-black text-slate-900 mb-4">
            {score} / {total}
          </h2>
          <button onClick={restart} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg transition">
            <RotateCcw className="w-5 h-5" />
            أعد الاختبار
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-6 max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-violet-100 text-violet-800 text-sm font-bold tracking-wider uppercase mb-3 font-display">
          <Trophy className="w-4 h-4" />
          Quiz
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900" dir="rtl">
          {section.title || 'اختبار قصير'}
        </h2>
        <div className="mt-3 text-sm text-slate-500 font-mono">
          {qIdx + 1} / {total} · النقاط: <span className="font-bold text-emerald-600">{score}</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 p-8 md:p-12">
          {question.promptAr && (
            <div className="text-sm text-slate-500 mb-2 text-center" dir="rtl">{question.promptAr}</div>
          )}
          <div className="font-display text-2xl md:text-4xl font-bold text-slate-900 text-center mb-8 leading-snug" dir={question.promptDir || 'ltr'}>
            {question.prompt}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((opt, i) => {
              const isPicked = picked === opt
              const isCorrect = opt === question.correct
              const showCorrect = status === 'answered' && isCorrect
              const showWrong = status === 'answered' && isPicked && !isCorrect
              return (
                <motion.button key={i} onClick={() => pick(opt)} disabled={status === 'answered'} whileHover={status === 'idle' ? { scale: 1.02 } : {}} whileTap={status === 'idle' ? { scale: 0.98 } : {}} className={`p-4 md:p-5 rounded-xl border-2 text-lg md:text-xl font-bold text-left transition-all ${
                  showCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-lg' :
                  showWrong ? 'border-rose-500 bg-rose-50 text-rose-900' :
                  status === 'answered' ? 'border-slate-200 bg-slate-50 text-slate-500' :
                  'border-slate-300 bg-white hover:border-amber-500 hover:bg-amber-50 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-1">{opt}</span>
                    {showCorrect && <Check className="w-6 h-6 text-emerald-600 flex-shrink-0" />}
                    {showWrong && <X className="w-6 h-6 text-rose-600 flex-shrink-0" />}
                  </div>
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence>
            {status === 'answered' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-between gap-4">
                <div className="flex-1">
                  {picked === question.correct ? (
                    <div className="text-emerald-700 font-bold flex items-center gap-2"><Check className="w-5 h-5" /> صحيح!</div>
                  ) : (
                    <div className="text-rose-700 font-bold flex items-center gap-2"><X className="w-5 h-5" /> الجواب الصحيح: {question.correct}</div>
                  )}
                  {question.hint && <div className="text-sm text-slate-500 mt-1" dir="rtl">{question.hint}</div>}
                </div>
                <button onClick={next} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg transition flex-shrink-0">
                  {isLast ? 'النتيجة' : 'التالي'} →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
