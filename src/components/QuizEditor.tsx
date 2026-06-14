'use client'

import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import type { LessonQuiz, QuizQuestion } from '@/lib/lms'

const INP = 'w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'

/** Manual multiple-choice quiz editor (team authors questions). */
export default function QuizEditor({ value, onChange }: { value: LessonQuiz | null; onChange: (q: LessonQuiz | null) => void }) {
  const questions = value?.questions ?? []
  const update = (qs: QuizQuestion[]) => onChange(qs.length ? { questions: qs, exercise: value?.exercise ?? null } : null)
  const setQ = (i: number, patch: Partial<QuizQuestion>) => update(questions.map((q, k) => k === i ? { ...q, ...patch } : q))
  const addQ = () => update([...questions, { q: '', choices: ['', '', '', ''], answer: 0 }])

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <input value={q.q} onChange={e => setQ(i, { q: e.target.value })} placeholder="نص السؤال" className={INP} />
            <button type="button" onClick={() => update(questions.filter((_, k) => k !== i))} className="text-zinc-300 hover:text-rose-500 flex-shrink-0"><Trash2 size={15} /></button>
          </div>
          <div className="space-y-1.5 pr-7">
            {q.choices.map((c, j) => (
              <div key={j} className="flex items-center gap-2">
                <button type="button" onClick={() => setQ(i, { answer: j })} title="الإجابة الصحيحة"
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${q.answer === j ? 'bg-emerald-500 text-white' : 'bg-white border border-zinc-300 text-transparent'}`}>
                  <CheckCircle2 size={13} />
                </button>
                <input value={c} onChange={e => setQ(i, { choices: q.choices.map((cc, k) => k === j ? e.target.value : cc) })}
                  placeholder={`الخيار ${j + 1}`} dir="ltr" className={`${INP} text-left ${q.answer === j ? 'border-emerald-300 bg-emerald-50/40' : ''}`} />
              </div>
            ))}
          </div>
          <input value={q.explain ?? ''} onChange={e => setQ(i, { explain: e.target.value })} placeholder="شرح الإجابة (اختياري)" className={`${INP} mt-1.5`} />
        </div>
      ))}
      <button type="button" onClick={addQ} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-500 font-bold text-[12.5px] hover:border-zinc-400 hover:text-zinc-700">
        <Plus size={14} /> إضافة سؤال
      </button>
      <p className="text-[10.5px] text-zinc-400">اضغط الدائرة الخضراء بجانب الخيار الصحيح. يجتاز الطالب الاختبار عند ٦٠٪ فأكثر.</p>
    </div>
  )
}
