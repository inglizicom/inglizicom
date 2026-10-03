'use client'

/* ExtraTasksTab — CRM student profile: the "progress" tab, split out of page.tsx.
   Extra tasks assigned by staff, and their status.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, Trash2, ExternalLink } from 'lucide-react'

import { type StudentAssignment, type PathTemplate } from '@/lib/student-portal'
import { type LmsCourse } from '@/lib/lms'
import TaskLessonPicker from '../TaskLessonPicker'

import type { Dispatch, SetStateAction } from 'react'

export interface ExtraTasksTabProps {
  aBusy: boolean
  aCat: string
  aDesc: string
  aDue: string
  aLesson: string | null
  aLink: string
  allCourses: LmsCourse[]
  applyId: string
  applyPath: () => Promise<void>
  assignments: StudentAssignment[]
  aTitle: string
  removeAssignment: (aid: string) => Promise<void>
  setACat: Dispatch<SetStateAction<string>>
  setADesc: Dispatch<SetStateAction<string>>
  setADue: Dispatch<SetStateAction<string>>
  setALesson: Dispatch<SetStateAction<string | null>>
  setALink: Dispatch<SetStateAction<string>>
  setApplyId: Dispatch<SetStateAction<string>>
  setATitle: Dispatch<SetStateAction<string>>
  submitAssignment: () => Promise<void>
  templates: PathTemplate[]
}

export default function ExtraTasksTab({ aBusy, aCat, aDesc, aDue, aLesson, aLink, allCourses, applyId, applyPath, assignments, aTitle, removeAssignment, setACat, setADesc, setADue, setALesson, setALink, setApplyId, setATitle, submitAssignment, templates }: ExtraTasksTabProps) {
  return (
    <>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[12px] text-amber-800 leading-relaxed">
              ⚠️ هذه <b>مهام إضافية من الفريق</b> — منفصلة عن <b>تمارين المنهج</b> (اختبارات الدروس، اختبارات الوحدات، محادثة الوحدة) التي يراها الطالب تلقائيًا تحت كل درس بعد <b>تسجيله في دورة</b>. يمكن ربط المهمة بدرس معيّن لتظهر بجانبه.
            </div>

            {/* Apply a ready path template */}
            {templates.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                <span className="text-[12px] font-bold text-emerald-800 flex-shrink-0">🗺️ تطبيق مسار جاهز</span>
                <select value={applyId} onChange={e => setApplyId(e.target.value)} className="flex-1 border border-emerald-200 rounded-lg px-2 py-1.5 text-[13px] bg-white">
                  <option value="">اختر مسارًا</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.level ? ` (${t.level})` : ''}</option>)}
                </select>
                <button onClick={applyPath} disabled={!applyId} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50">تطبيق</button>
              </div>
            )}

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
              <div className="text-[13px] font-bold text-zinc-700">مهمة إضافية جديدة</div>
              <input value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="عنوان التمرين *"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
              <input value={aDesc} onChange={e => setADesc(e.target.value)} placeholder="وصف / تعليمات (اختياري)"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
              <input value={aLink} onChange={e => setALink(e.target.value)} placeholder="رابط التمرين/الدرس على Inglizi.com (اختياري)" dir="ltr"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" />
              <div className="grid grid-cols-2 gap-2">
                <select value={aCat} onChange={e => setACat(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
                  <option value="exercise">تمرين</option>
                  <option value="lesson">درس</option>
                  <option value="reading">قراءة</option>
                  <option value="speaking">محادثة</option>
                  <option value="quiz">اختبار</option>
                  <option value="vocabulary">مفردات</option>
                </select>
                <input type="date" value={aDue} onChange={e => setADue(e.target.value)} dir="ltr"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" title="تاريخ الاستحقاق" />
              </div>
              <TaskLessonPicker courses={allCourses} value={aLesson} onChange={setALesson} />
              <button onClick={submitAssignment} disabled={aBusy || !aTitle.trim()}
                className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] disabled:opacity-50">
                {aBusy ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تكليف الطالب'}
              </button>
            </div>

            {assignments.length === 0 && <p className="text-center py-4 text-zinc-400 text-[13px]">لا توجد مهام إضافية</p>}
            {assignments.map(a => (
              <div key={a.id} className="flex items-start justify-between gap-3 border border-zinc-100 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-zinc-800 flex flex-wrap items-center gap-1.5">
                    {a.title}
                    <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ${a.status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {a.status === 'done' ? 'منجزة' : a.status === 'in_progress' ? 'قيد الإنجاز' : 'معلّقة'}
                    </span>
                    {a.lesson_id && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">مرتبطة بدرس</span>}
                  </div>
                  {a.description && <div className="text-[12px] text-zinc-500 mt-0.5">{a.description}</div>}
                  {a.link_url && <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 inline-flex items-center gap-1 mt-1">الرابط <ExternalLink size={11} /></a>}
                </div>
                <button onClick={() => removeAssignment(a.id)} className="text-zinc-300 hover:text-red-500 flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
    </>
  )
}
