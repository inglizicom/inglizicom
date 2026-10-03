'use client'

/* ExamsTab — CRM student profile: the "exams" tab, split out of page.tsx.
   Exams with dates and scores.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, Trash2 } from 'lucide-react'

import { type StudentExam } from '@/lib/student-portal'
import { fmtDate } from '../_parts'

import type { Dispatch, SetStateAction } from 'react'

export interface ExamsTabProps {
  exams: StudentExam[]
  exBusy: boolean
  exLevel: string
  exMax: string
  exNote: string
  exScore: string
  exTitle: string
  removeExam: (eid: string) => Promise<void>
  setExLevel: Dispatch<SetStateAction<string>>
  setExMax: Dispatch<SetStateAction<string>>
  setExNote: Dispatch<SetStateAction<string>>
  setExScore: Dispatch<SetStateAction<string>>
  setExTitle: Dispatch<SetStateAction<string>>
  submitExam: () => Promise<void>
}

export default function ExamsTab({ exams, exBusy, exLevel, exMax, exNote, exScore, exTitle, removeExam, setExLevel, setExMax, setExNote, setExScore, setExTitle, submitExam }: ExamsTabProps) {
  return (
    <>
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
              <div className="text-[13px] font-bold text-zinc-700">تسجيل نتيجة امتحان</div>
              <input value={exTitle} onChange={e => setExTitle(e.target.value)} placeholder="عنوان الامتحان * (مثال: اختبار A1 — الوحدة 3)" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
              <div className="grid grid-cols-3 gap-2">
                <input value={exLevel} onChange={e => setExLevel(e.target.value)} placeholder="المستوى" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                <input type="number" value={exScore} onChange={e => setExScore(e.target.value)} placeholder="النتيجة" dir="ltr" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
                <input type="number" value={exMax} onChange={e => setExMax(e.target.value)} placeholder="من" dir="ltr" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
              </div>
              <input value={exNote} onChange={e => setExNote(e.target.value)} placeholder="ملاحظة الأستاذ (اختياري)" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
              <button onClick={submitExam} disabled={exBusy || !exTitle.trim()} className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                {exBusy ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'حفظ النتيجة'}
              </button>
            </div>

            {exams.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد امتحانات مسجّلة</p>}
            {exams.map(e => {
              const pct = e.score != null && e.max_score ? Math.round((e.score / e.max_score) * 100) : null
              return (
                <div key={e.id} className="flex items-center gap-3 border border-zinc-100 rounded-xl p-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${e.passed === false ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}><span className="text-[14px] font-black">{pct != null ? `${pct}%` : '—'}</span></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-zinc-800">{e.title}</div>
                    <div className="text-[11px] text-zinc-400">{e.level ? `${e.level} · ` : ''}{fmtDate(e.exam_date)}{e.passed != null ? ` · ${e.passed ? 'ناجح' : 'يحتاج إعادة'}` : ''}</div>
                    {e.teacher_note && <div className="text-[11px] text-zinc-500 mt-0.5">📝 {e.teacher_note}</div>}
                  </div>
                  <button onClick={() => removeExam(e.id)} className="text-zinc-300 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              )
            })}
          </div>
    </>
  )
}
