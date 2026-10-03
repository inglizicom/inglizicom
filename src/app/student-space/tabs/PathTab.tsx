'use client'

/* PathTab — the student space's "path" tab, split out of page.tsx.
   The course path: units, their lessons, reading, conversation and the end-of-unit test, each unlocking in order.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { BookOpen, CheckCircle2, ExternalLink, Route, Award, Lock, Send } from 'lucide-react'
import { logActivity, type PortalLesson, type PortalModule, type ExerciseItem } from '@/lib/student-portal'
import { EXAMS_URL, type UnitSubmission, type StudentNotification } from '@/lib/lms'

import { SectionTitle, Empty, LessonRow } from '../_shared'

import type { Dispatch, SetStateAction } from 'react'
import type { PortalCourse } from '@/lib/student-portal'

export interface PathTabProps {
  course: PortalCourse
  examModules: Set<string>
  examOk: (id: string) => boolean
  examPassed: Set<string>
  fmtDate: (ms: number) => string
  isUnlocked: (l: PortalLesson) => boolean
  itemsByLesson: Map<string, ExerciseItem[]>
  markStep: (kind: "reading" | "exam", id: string) => void
  modProg: (m: PortalModule) => { t: number; d: number; pct: number; }
  notifs: StudentNotification[]
  onCompleteLesson: (l: PortalLesson) => Promise<void>
  onOpenLesson: (l: PortalLesson, url?: string | null) => Promise<void>
  readingUnits: Set<string>
  reviewedModules: Set<string>
  setExamUnit: Dispatch<SetStateAction<{ id: string; title: string; } | null>>
  setQuizLesson: Dispatch<SetStateAction<PortalLesson | null>>
  setReadingUnit: Dispatch<SetStateAction<{ id: string; title: string; } | null>>
  setSubmitUnit: Dispatch<SetStateAction<{ id: string; title: string; } | null>>
  stepDone: (kind: "reading" | "exam", id: string) => boolean
  submissions: UnitSubmission[]
  token: string
  unitDeadlineMs: (order: number) => number | null
}

export default function PathTab({ course, examModules, examOk, examPassed, fmtDate, isUnlocked, itemsByLesson, markStep, modProg, notifs, onCompleteLesson, onOpenLesson, readingUnits, reviewedModules, setExamUnit, setQuizLesson, setReadingUnit, setSubmitUnit, stepDone, submissions, token, unitDeadlineMs }: PathTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <SectionTitle icon={Route} color="text-amber-700">مسار الدورة</SectionTitle>
      {!course ? <Empty text="لم يتم تسجيلك في دورة بعد" />
        : course.modules.length === 0 ? <Empty text="سيظهر محتوى دورتك هنا قريبًا" />
        : course.modules.map((m, mi) => {
          const p = modProg(m)
          const dl = unitDeadlineMs(mi + 1)
          const daysTo = dl != null ? Math.ceil((dl - Date.now()) / 86400000) : null
          const overdue = dl != null && p.pct < 100 && Date.now() > dl
          const soon = !overdue && p.pct < 100 && daysTo != null && daysTo <= 2   // due within 2 days
          // previous unit must be finished AND its exercise reviewed by the team
          const prev = mi > 0 ? course.modules[mi - 1] : null
          const started = m.lessons.some(l => l.status === 'completed')   // grandfather already-started units
          const prevReady = !prev || (modProg(prev).pct >= 100 && examOk(prev.id) && reviewedModules.has(prev.id))
          const unitLocked = !!prev && !started && !prevReady
          const lockReason = !prev ? ''
            : modProg(prev).pct < 100 ? 'أكمل الوحدة السابقة بالكامل لفتحها'
            : !examOk(prev.id) ? 'اجتَز اختبار الوحدة السابقة أولًا'
            : 'بانتظار تصحيح الفريق لتمرين الوحدة السابقة'
          return (
          <div key={m.id} className={`rounded-2xl border overflow-hidden shadow-sm ${unitLocked ? 'bg-zinc-50/70 border-zinc-200' : overdue ? 'bg-white border-rose-300' : soon ? 'bg-white border-amber-300' : 'bg-white border-zinc-100'}`}>
            <div className={`px-4 py-3 border-b flex items-center gap-2 ${unitLocked ? 'bg-zinc-100 border-zinc-200' : overdue ? 'bg-rose-50 border-rose-100' : soon ? 'bg-amber-50 border-amber-100' : 'bg-[#f5ecdc] border-amber-100/70'}`}>
              <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0 ${unitLocked ? 'bg-zinc-300 text-zinc-600' : 'bg-[var(--ic-dark-2)] text-[var(--ic-gold)]'}`}>{unitLocked ? <Lock size={12} /> : mi + 1}</span>
              <div className="flex-1 min-w-0">
                <span className={`font-bold text-[14px] ${unitLocked ? 'text-zinc-500' : 'text-zinc-800'}`}>{m.title}</span>
                {unitLocked
                  ? <span className="block text-[10px] font-bold text-zinc-400">🔒 {lockReason}</span>
                  : dl != null && <span className={`block text-[10px] font-bold ${overdue ? 'text-rose-600' : soon ? 'text-amber-700' : 'text-zinc-400 font-normal'}`}>
                  {p.pct >= 100 ? '✓ مكتملة'
                    : overdue ? `⚠️ متأخّر · كان الموعد ${fmtDate(dl)}`
                    : soon ? `⏰ ينتهي ${daysTo! <= 0 ? 'اليوم' : daysTo === 1 ? 'غدًا' : `خلال ${daysTo} يوم`} — سارع بالإنجاز`
                    : `الموعد النهائي: ${fmtDate(dl)}`}
                </span>}
              </div>
              {soon && !unitLocked && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />}
              <span className="text-[11px] font-bold text-zinc-400">{p.d}/{p.t}</span>
            </div>
            {unitLocked ? (
              <div className="px-4 py-7 text-center text-[12px] text-zinc-400 flex flex-col items-center gap-2"><Lock size={22} className="text-zinc-300" /> هذه الوحدة مقفلة — {lockReason}.</div>
            ) : (
            <>
            <div className="divide-y divide-zinc-50">{m.lessons.map(l => <LessonRow key={l.id} l={l} unlocked={isUnlocked(l)} onOpen={onOpenLesson} onComplete={onCompleteLesson} onQuiz={setQuizLesson} items={itemsByLesson.get(l.id)} />)}</div>
            {/* Sequential steps — each lights up once the student reaches it */}
            {(() => {
              const lessonsDone = p.pct === 100
              const hasReading = readingUnits.has(m.id)
              const readingActive = lessonsDone
              const examActive = lessonsDone && (!hasReading || stepDone('reading', m.id))
              const hasExam = examModules.has(m.id)             // unit has a real team-written test
              const examPassedHere = examPassed.has(m.id)
              const examStepOk = hasExam ? examPassedHere : stepDone('exam', m.id)
              const subs = submissions.filter(x => x.module_id === m.id); const last = subs[0]
              const reviewed = last?.status === 'reviewed'
              const unreadCorr = reviewed && notifs.some(n => n.type === 'correction' && !n.is_read && (n.body || '').includes(m.title))
              const correctionActive = examActive && examStepOk
              const DIM = 'flex items-center justify-center gap-2 px-4 py-3 border-t border-zinc-100 bg-zinc-50 text-zinc-300 font-bold text-[12.5px] cursor-not-allowed'
              return (<>
                {hasReading && (readingActive
                  ? <button onClick={() => { markStep('reading', m.id); setReadingUnit({ id: m.id, title: m.title }); logActivity(token, 'opened_reading', 'module', m.id, m.title) }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 border-t border-sky-100 text-sky-800 font-bold text-[12.5px] hover:bg-sky-100"><BookOpen size={15} /> القراءة والاستماع — نص الوحدة</button>
                  : <div className={'w-full ' + DIM}><Lock size={14} /> القراءة والاستماع — أكمل دروس الوحدة أولًا</div>)}

                {/* End-of-unit TEST */}
                {hasExam ? (
                  !examActive
                    ? <div className={'w-full ' + DIM}><Lock size={14} /> اختبار الوحدة — {hasReading ? 'افتح القراءة أولًا' : 'أكمل دروس الوحدة أولًا'}</div>
                    : examPassedHere
                      ? <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border-t border-emerald-100 text-emerald-700 font-bold text-[12.5px]"><CheckCircle2 size={14} /> اجتزت اختبار الوحدة ✓</div>
                      : <button onClick={() => setExamUnit({ id: m.id, title: m.title })}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 border-t border-amber-200 text-amber-800 font-black text-[12.5px] hover:bg-amber-200"><Award size={15} /> اختبار الوحدة — يجب اجتيازه (٦٠٪+)</button>
                ) : (examActive
                  ? <a href={EXAMS_URL} target="_blank" rel="noreferrer" onClick={() => { markStep('exam', m.id); logActivity(token, 'opened_exam', 'module', m.id, m.title) }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--ic-gold-soft)] border-t border-[var(--ic-gold-soft)] text-yellow-800 font-bold text-[12.5px] hover:bg-[var(--ic-gold-soft)]"><Award size={15} /> امتحان نهاية الوحدة — اختبر معرفتك <ExternalLink size={13} /></a>
                  : <div className={'w-full ' + DIM}><Lock size={14} /> امتحان نهاية الوحدة — {hasReading ? 'افتح القراءة أولًا' : 'أكمل دروس الوحدة أولًا'}</div>)}

                {reviewed ? (
                  <button onClick={() => setSubmitUnit({ id: m.id, title: m.title })}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-t font-black text-[12.5px] ${unreadCorr ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}>
                    {unreadCorr ? <><span className="w-2 h-2 rounded-full bg-white" /> تصحيحك جاهز — اضغط لقراءته الآن</> : <><CheckCircle2 size={14} /> عرض تصحيح المحادثة {last?.score != null ? `· ${last.score}/100` : ''}</>}
                  </button>
                ) : correctionActive ? (
                  <button onClick={() => setSubmitUnit({ id: m.id, title: m.title })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 border-t border-indigo-100 text-indigo-800 font-bold text-[12.5px] hover:bg-indigo-100">
                    <Send size={14} /> {last ? 'محادثتك قيد المراجعة…' : 'سلّم محادثة الوحدة للتصحيح'}
                  </button>
                ) : (
                  <div className={'w-full ' + DIM}><Lock size={14} /> إرسال المحادثة للتصحيح — اجتَز امتحان الوحدة أولًا</div>
                )}
              </>)
            })()}
            </>
            )}
          </div>
        )})}
    </div>
  )
}
