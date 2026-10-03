'use client'

/* HomeTab — the student space's "home" tab, split out of page.tsx.
   The dashboard: entry buttons, hero, today's lesson, stats, coins, final exam, tasks, the learning path, files, activity, and the side column (schedule, next exam, streak, achievements, certificates, teachers).
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import {
  BookOpen, FileText, Download, CheckCircle2, Circle, ExternalLink, Route, Award, PlayCircle, Flame,
  Lock, PenLine, HelpCircle, ChevronLeft, Trophy, Medal, CalendarDays, Clock, BarChart3, Send, Coins,
} from 'lucide-react'
import {
  logActivity, type PortalLesson, type PortalModule, isExerciseDone, EXERCISE_KIND_AR,
  EXERCISE_STATUS_AR, type ExerciseItem, type BoardTask,
} from '@/lib/student-portal'
import { CERT_KIND_AR, type StudentCert } from '@/lib/certificates'
import {
  resourceUrl, type CourseResource, type ProgressMeta, type UnitSubmission, type StudentNotification,
} from '@/lib/lms'
import MyTeachersCard from '@/components/student/MyTeachersCard'
import { type Certificate } from '@/lib/lms'
import { type CoinSummary } from '@/lib/gamification'
import { type StudentDashboard } from '@/lib/student-dashboard'
import { EntryCards } from '@/components/student-dashboard/ui'

import {
  ytThumb, aiThumb, fmtShort, InitAva, ACTIVITY, pct, Ring, HeroStat, Card, LessonThumb, TaskCard,
  MiniBar, Empty, LessonRow, type Tab,
} from '../_shared'

import type { Dispatch, SetStateAction } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { PortalCourse } from '@/lib/student-portal'
import type { ExerciseKind } from '@/lib/student-portal'
import type { ExerciseStatus } from '@/lib/student-portal'
import type { StudentFile } from '@/lib/student-portal'
import type { StudentExam } from '@/lib/student-portal'
import type { StudentActivity } from '@/lib/student-portal'
import type { TrackKind } from '@/lib/student-dashboard'
import type { DashCourse } from '@/lib/student-dashboard'
import type { DashClass } from '@/lib/student-dashboard'

export interface HomeTabProps {
  achievements: { id: string; label: string; sub: string; icon: LucideIcon; on: boolean; color: string; }[]
  boardTasks: BoardTask[]
  cert: Certificate | null
  coins: CoinSummary | null
  course: PortalCourse
  coursePct: number
  currentModule: PortalModule
  curriculumItems: { key: string; where: string; kind: ExerciseKind; status: ExerciseStatus; detail: Record<string, any> | null; }[]
  dash: StudentDashboard | null | undefined
  demo: boolean
  examOk: (id: string) => boolean
  files: StudentFile[]
  firstName: string
  fmtDate: (ms: number) => string
  goTab: (t: Tab) => void
  isUnlocked: (l: PortalLesson) => boolean
  itemsByLesson: Map<string, ExerciseItem[]>
  meta: ProgressMeta | null
  modProg: (m: PortalModule) => { t: number; d: number; pct: number; }
  myCerts: StudentCert[]
  nextExam: StudentExam | undefined
  notifs: StudentNotification[]
  onCompleteLesson: (l: PortalLesson) => Promise<void>
  onOpenLesson: (l: PortalLesson, url?: string | null) => Promise<void>
  openFile: (f: { id: string; file_name: string; file_path: string; }) => void
  recent: StudentActivity[]
  resources: CourseResource[]
  reviewedModules: Set<string>
  s: { id: string; full_name: string; course: string | null; student_type: string; teacher_name: string | null; is_active: boolean; verification_token: string; current_level: string | null; next_level: string | null; learning_stage: string | null; admin_message: string | null; next_task: string | null; today_lesson_url: string | null; today_lesson_title: string | null; }
  sched: { courseEnd: number; unitEnd: number; allDone: boolean; daysLeftCourse: number; daysLeftUnit: number; unitOverdue: boolean; courseOverdue: boolean; currentUnit: string; completedUnits: number; totalUnits: number; } | null
  setExamUnit: Dispatch<SetStateAction<{ id: string; title: string; } | null>>
  setPractice: Dispatch<SetStateAction<"sentence" | "translation" | null>>
  setQuizLesson: Dispatch<SetStateAction<PortalLesson | null>>
  setShowExam: Dispatch<SetStateAction<boolean>>
  setSubmitUnit: Dispatch<SetStateAction<{ id: string; title: string; } | null>>
  setVocabOpen: Dispatch<SetStateAction<boolean>>
  stats: { lessons_total: number; lessons_done: number; ex_total: number; ex_done: number; exam_total: number; exam_done: number; files_total: number; files_opened: number; overall: number; streak: number; last_activity: string | null; }
  submissions: UnitSubmission[]
  today: { lesson: PortalLesson; m: PortalModule; mi: number; } | undefined
  token: string
  tracks: { course: boolean; group: boolean; private: boolean; kinds: TrackKind[]; label: string; activeCourses: DashCourse[]; activeSeats: DashClass[]; } | null
  week: { day: string; active: boolean; }[]
}

export default function HomeTab({ achievements, boardTasks, cert, coins, course, coursePct, currentModule, curriculumItems, dash, demo, examOk, files, firstName, fmtDate, goTab, isUnlocked, itemsByLesson, meta, modProg, myCerts, nextExam, notifs, onCompleteLesson, onOpenLesson, openFile, recent, resources, reviewedModules, s, sched, setExamUnit, setPractice, setQuizLesson, setShowExam, setSubmitUnit, setVocabOpen, stats, submissions, today, token, tracks, week }: HomeTabProps) {
  return (
    <>
    <div className="mb-5">
      <EntryCards onCourses={() => goTab('courses')} onProfile={() => goTab('profile')}
        coursesSub={tracks ? `${tracks.label} · ${coursePct}% من الدورة` : 'دروسك، حصصك وجدولك'}
        profileSub={dash?.attendance?.rate != null ? `الحضور ${dash.attendance.rate}% · الشهادات والمدفوعات` : 'الحضور، المدفوعات، الشهادات والأسرة'} />
    </div>
    <div className="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">
      {/* MAIN COLUMN */}
      <div className="lg:col-span-2 space-y-5">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[var(--ic-dark)] via-[var(--ic-dark-2)] to-[var(--ic-dark-3)] rounded-3xl p-5 text-white">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex items-center gap-4">
              <Ring pct={stats.overall} />
              <div className="flex-1">
                <div className="font-black text-[18px]">مرحباً {firstName}! 👋</div>
                <div className="text-[12px] text-zinc-400 mt-0.5">جاهز لمواصلة رحلتك التعليمية اليوم؟</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 text-[12px] font-bold">{course?.title ?? 'لم تُسجّل في دورة'} 🎓</span>
                  {resources[0] && (
                    <a href={resourceUrl(resources[0].file_path)} target="_blank" rel="noreferrer"
                      onClick={() => logActivity(token, 'downloaded_file', 'resource', resources[0].id, resources[0].title)}
                      className="inline-flex items-center gap-1.5 bg-[var(--ic-gold)] text-black rounded-lg px-2.5 py-1 text-[12px] font-black hover:bg-[var(--ic-gold)]">
                      <Download size={13} /> 📘 كتاب الدورة
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Today's lesson */}
            {course && today && (
              <div className="flex-1 bg-white/[0.06] rounded-2xl p-4">
                <div className="text-[11px] text-zinc-400 mb-2">درس اليوم</div>
                <div className="mb-2.5">
                  <LessonThumb title={today.lesson.title} topic={today.lesson.title} chip={today.m.title} seed={today.lesson.id} videoUrl={today.lesson.video_url} onClick={() => onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)} />
                </div>
                <div className="inline-block text-[10px] font-bold bg-violet-500/30 text-violet-200 px-2 py-0.5 rounded mb-1">{today.m.title}</div>
                <div className="font-black text-[16px]">{today.lesson.title}</div>
                {today.lesson.content && <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{today.lesson.content}</div>}
                <button onClick={() => onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[var(--ic-gold)] text-black font-black text-[13px] flex items-center justify-center gap-2 hover:bg-[var(--ic-gold)]"><PlayCircle size={16} /> ابدأ الدرس الآن</button>
                <button onClick={() => goTab('path')} className="w-full mt-2 py-2 rounded-xl bg-white/[0.06] text-white font-semibold text-[12px] hover:bg-white/10">عرض كل دروس الوحدة</button>
              </div>
            )}
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <HeroStat icon={BookOpen} value={`${stats.lessons_done}/${stats.lessons_total}`} label="دروس مكتملة" />
            <HeroStat icon={CheckCircle2} value={`${stats.ex_done}/${stats.ex_total}`} label="تمارين مكتملة" />
            <HeroStat icon={Award} value={`${stats.exam_done}/${stats.exam_total}`} label="امتحانات" />
            <HeroStat icon={Flame} value={`${stats.streak}`} label="أيام متتالية" />
          </div>
        </div>

        {/* Coins + level + quick access */}
        <div className="rounded-3xl bg-white border border-zinc-100 shadow-[0_2px_12px_rgba(58,40,23,0.06)] p-4">
          <button onClick={() => goTab('rewards')} className="w-full flex items-center gap-3 text-right">
            <div className="w-11 h-11 rounded-2xl bg-[var(--ic-gold)] text-black flex items-center justify-center flex-shrink-0"><Coins size={22} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-[16px] text-[var(--ic-dark-2)]">{coins?.balance ?? 0} <span className="text-[11px] text-zinc-400 font-bold">كوين · {coins?.level ?? 'Bronze'}</span></div>
              {coins?.next_level
                ? <div className="mt-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-l from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] rounded-full" style={{ width: `${coins.progress}%` }} /></div>
                : <div className="text-[11px] text-amber-600 font-bold">أعلى مستوى 👑</div>}
            </div>
            <span className="text-[11px] text-zinc-400 flex-shrink-0">{coins?.next_level ? `باقٍ ${coins.to_next}` : ''} <ChevronLeft size={14} className="inline" /></span>
          </button>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100">
            <button onClick={() => today && onOpenLesson(today.lesson, today.lesson.video_url || today.lesson.exercise_url || today.lesson.file_url)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🎬</span><span className="text-[11px] font-black text-[var(--ic-dark)]">ابدأ الدرس</span></button>
            <button onClick={() => setVocabOpen(true)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🎮</span><span className="text-[11px] font-black text-white">ألعاب المفردات</span></button>
            <button onClick={() => setPractice('sentence')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-[var(--ic-dark-2)] to-[var(--ic-dark-3)] shadow-sm active:scale-95 transition-transform"><span className="text-[22px] leading-none">🧩</span><span className="text-[11px] font-black text-[var(--ic-gold)]">بناء الجمل</span></button>
            <button onClick={() => setPractice('translation')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-amber-50 border-2 border-amber-200 active:scale-95 transition-transform"><span className="text-[22px] leading-none">🔤</span><span className="text-[11px] font-black text-[var(--ic-dark-2)]">ترجم الجمل</span></button>
          </div>
        </div>

        {/* Final exam + certificate — unlocks after the whole course is complete */}
        {(() => {
          const courseDone = !!meta && meta.total_units > 0 && meta.completed_units >= meta.total_units
          const unlocked = courseDone || !!cert
          return (
            <button onClick={() => setShowExam(true)}
              className={`w-full text-right rounded-3xl p-4 flex items-center gap-3 transition-colors ${unlocked ? 'bg-gradient-to-l from-[var(--ic-grad-from)] to-[var(--ic-grad-to)] text-black hover:from-[var(--ic-gold)] hover:to-amber-200' : 'bg-[#3a2a1a] text-amber-100/90 hover:bg-[#43301d]'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${unlocked ? 'bg-black/10' : 'bg-[var(--ic-gold-soft)]'}`}>{unlocked ? <Award size={26} /> : <Lock size={24} className="text-[var(--ic-gold)]" />}</div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-[15px]">{cert ? 'شهادتك جاهزة 🎓' : 'الامتحان النهائي — A0 / A1'}</div>
                <div className={`text-[12px] ${unlocked ? 'text-black/70' : 'text-amber-100/50'}`}>
                  {cert ? `اجتزت الامتحان بنتيجة ${cert.percent}% — اعرض شهادتك واطبعها`
                    : courseDone ? 'اجتَز الامتحان واحصل على شهادة إتمام المستوى الأول'
                    : `أكمل كل وحدات الدورة لفتح الامتحان (${meta?.completed_units ?? 0}/${meta?.total_units ?? '—'})`}
                </div>
              </div>
              <ChevronLeft size={20} className="flex-shrink-0" />
            </button>
          )
        })()}

        {/* Today's tasks */}
        {course && today && (
          <Card title="مهامك اليوم" sub="أكمل مهامك اليومية لتتقدم في مستواك" icon={CalendarDays} iconColor="text-amber-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {today.lesson.video_url && <TaskCard tone="violet" icon={PlayCircle} title="شاهد الفيديو" meta={today.lesson.title} cta="شاهد الآن" thumb={ytThumb(today.lesson.video_url) || aiThumb(today.lesson.title, today.lesson.id)} onClick={() => onOpenLesson(today.lesson, today.lesson.video_url)} />}
              {today.lesson.file_url && <TaskCard tone="emerald" icon={FileText} title="اقرأ الملف" meta="ملف الدرس" cta="اقرأ الآن" onClick={() => onOpenLesson(today.lesson, today.lesson.file_url)} />}
              {today.lesson.exercise_url && <TaskCard tone="amber" icon={PenLine} title="أكمل التمرين" meta="تمرين الدرس" cta="ابدأ التمرين" onClick={() => onOpenLesson(today.lesson, today.lesson.exercise_url)} />}
              {today.lesson.has_quiz && <TaskCard tone="blue" icon={HelpCircle} title="اختبر نفسك" meta="اختبار الدرس" cta="ابدأ الاختبار" onClick={() => setQuizLesson(today.lesson)} />}
              {!today.lesson.video_url && !today.lesson.file_url && !today.lesson.exercise_url && !today.lesson.has_quiz &&
                <TaskCard tone="blue" icon={PlayCircle} title="ابدأ الدرس" meta={today.lesson.title} cta="ابدأ" onClick={() => onCompleteLesson(today.lesson)} />}
            </div>
          </Card>
        )}

        {/* Exercises sent for correction — counts */}
        {course && (() => {
          const sent = submissions.length
          const reviewed = submissions.filter(x => x.status === 'reviewed').length
          const pending = submissions.filter(x => x.status === 'pending').length
          const hasUnread = notifs.some(n => n.type === 'correction' && !n.is_read)
          return (
            <Card title="التمارين والتصحيح" sub="محادثاتك المُرسَلة لفريق التصحيح" icon={Send} iconColor="text-indigo-500">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-50 rounded-xl p-3"><div className="text-[22px] font-black text-zinc-900">{sent}</div><div className="text-[11px] text-zinc-400">مُرسَلة</div></div>
                <div className="bg-emerald-50 rounded-xl p-3"><div className="text-[22px] font-black text-emerald-600">{reviewed}</div><div className="text-[11px] text-emerald-700/70">مُصحَّحة</div></div>
                <div className="bg-amber-50 rounded-xl p-3"><div className="text-[22px] font-black text-amber-600">{pending}</div><div className="text-[11px] text-amber-700/70">بانتظار</div></div>
              </div>
              {hasUnread && <button onClick={() => goTab('path')} className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[12.5px] flex items-center justify-center gap-1.5 animate-pulse">✅ وصلك تصحيح جديد — اضغط لقراءته</button>}
            </Card>
          )
        })()}

        {/* Learning path */}
        {course && (
          <Card title="مساري التعليمي" icon={Route} iconColor="text-emerald-500" action={<button onClick={() => goTab('path')} className="text-[12px] text-blue-600 font-semibold">عرض الخريطة الكاملة</button>}>
            {/* module stepper */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3">
              {course.modules.map((m, i) => { const p = modProg(m); const active = m.id === currentModule?.id; return (
                <div key={m.id} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`w-28 rounded-xl border p-2.5 text-center ${active ? 'border-[var(--ic-gold)] bg-[var(--ic-gold-soft)]' : p.pct === 100 ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
                    <div className="text-[10px] text-zinc-400">Module {i + 1}</div>
                    <div className="text-[11px] font-bold text-zinc-700 truncate">{m.title}</div>
                    <div className={`text-[13px] font-black mt-0.5 ${p.pct === 100 ? 'text-emerald-600' : active ? 'text-yellow-600' : 'text-zinc-400'}`}>{p.pct === 100 ? '✓ 100%' : `${p.pct}%`}</div>
                    <div className="text-[9px] text-zinc-400">{p.t} دروس</div>
                  </div>
                  {i < course.modules.length - 1 && <ChevronLeft size={14} className="text-zinc-300 flex-shrink-0" />}
                </div>
              )})}
            </div>

            {/* current module + lessons */}
            {currentModule && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded-2xl p-4">
                  <div className="text-[11px] text-zinc-400">{currentModule.title}</div>
                  <div className="font-black text-[16px] text-zinc-900 mb-2">📚 {currentModule.title}</div>
                  {(() => { const p = modProg(currentModule); return (<>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1"><span>التقدم في الوحدة</span><span className="font-bold">{p.pct}%</span></div>
                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-1"><div className="h-full bg-[var(--ic-gold)] rounded-full" style={{ width: `${p.pct}%` }} /></div>
                    <div className="text-[11px] text-zinc-400">{p.d}/{p.t} دروس مكتملة</div>
                  </>)})()}
                </div>
                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                  <div className="px-3 py-2 bg-zinc-50 text-[12px] font-bold text-zinc-600 border-b border-zinc-100">دروس الوحدة ({currentModule.lessons.length})</div>
                  <div className="divide-y divide-zinc-50 max-h-[260px] overflow-y-auto">
                    {currentModule.lessons.map(l => <LessonRow key={l.id} l={l} unlocked={isUnlocked(l)} onOpen={onOpenLesson} onComplete={onCompleteLesson} onQuiz={setQuizLesson} items={itemsByLesson.get(l.id)} />)}
                  </div>
                </div>
              </div>
            )}
            {currentModule && modProg(currentModule).pct >= 100 && !reviewedModules.has(currentModule.id) && (
              !examOk(currentModule.id) ? (
                <button onClick={() => setExamUnit({ id: currentModule.id, title: currentModule.title })}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-100 text-amber-800 font-black text-[13px] hover:bg-amber-200">
                  <Award size={15} /> اجتَز اختبار الوحدة (٦٠٪+) أولًا
                </button>
              ) : (
                <button onClick={() => setSubmitUnit({ id: currentModule.id, title: currentModule.title })}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--ic-dark)] text-[var(--ic-gold)] font-black text-[13px] hover:bg-[var(--ic-dark-2)]">
                  <Send size={15} /> {submissions.some(x => x.module_id === currentModule.id) ? 'مهمتك قيد التصحيح — تُفتح الوحدة التالية بعد الاعتماد' : 'أرسل مهمة الوحدة للتصحيح لفتح الوحدة التالية'}
                </button>
              )
            )}
          </Card>
        )}

        {/* Bottom 3 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Files */}
          <Card title="ملفاتك" icon={FileText} iconColor="text-rose-500" action={<button onClick={() => goTab('files')} className="text-[11px] text-blue-600 font-semibold">عرض الكل</button>} compact>
            {files.length === 0 ? <Empty mini text="لا ملفات بعد" /> : files.slice(0, 4).map(f => (
              <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-2.5 py-2 text-right">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={14} className="text-rose-500" /></div>
                <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-800 truncate">{f.file_name}</div><div className="text-[10px] text-zinc-400">{fmtShort(f.created_at)}</div></div>
                <Download size={14} className="text-zinc-300" />
              </button>
            ))}
          </Card>
          {/* Recent exercises */}
          <Card title="التمارين الأخيرة" icon={PenLine} iconColor="text-amber-500" action={<button onClick={() => goTab('tasks')} className="text-[11px] text-blue-600 font-semibold">الكل</button>} compact>
            {curriculumItems.length === 0 && boardTasks.length === 0 ? <Empty mini text="لا تمارين بعد" /> :
              [
                // next curriculum exercises that are not done yet, in path order
                ...curriculumItems.filter(i => !isExerciseDone(i.status) && i.status !== 'locked').slice(0, 3)
                  .map(i => ({ id: i.key, title: EXERCISE_KIND_AR[i.kind], where: i.where, status: i.status, extra: false })),
                ...boardTasks.filter(t => t.status !== 'done').slice(0, 2)
                  .map(t => ({ id: t.id, title: t.title, where: t.lesson_title ? `مهمة إضافية · ${t.lesson_title}` : 'مهمة إضافية من الفريق', status: 'not_started' as const, extra: true })),
              ].slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-2.5 py-2">
                  <Circle size={16} className="text-zinc-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-zinc-800 truncate">{e.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{e.where}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${e.extra ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
                    {e.extra ? 'إضافية' : EXERCISE_STATUS_AR[e.status]}
                  </span>
                </div>
              ))}
          </Card>
          {/* Activity */}
          <Card title="آخر نشاطك" icon={Clock} iconColor="text-blue-500" compact>
            {recent.length === 0 ? <Empty mini text="لا نشاط بعد" /> : recent.slice(0, 4).map((r, i) => { const a = ACTIVITY[r.event_type] ?? { ar: r.event_type, icon: Circle, tone: 'text-zinc-400' }; const Icon = a.icon; return (
              <div key={i} className="flex items-center gap-2.5 py-2">
                <Icon size={15} className={`${a.tone} flex-shrink-0`} />
                <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-zinc-700 truncate">{a.ar}{r.entity_title ? `: ${r.entity_title}` : ''}</div></div>
                <span className="text-[10px] text-zinc-400 flex-shrink-0">{fmtShort(r.created_at)}</span>
              </div>
            )})}
          </Card>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="space-y-5">
        {/* Quick overview */}
        <Card title="نظرة سريعة" icon={BarChart3} iconColor="text-emerald-500" action={<button onClick={() => goTab('progress')} className="text-[11px] text-blue-600 font-semibold">التقرير</button>}>
          <div className="space-y-2.5 mt-1">
            <MiniBar label="التقدم" pct={stats.overall} color="bg-[var(--ic-gold)]" />
            <MiniBar label="الدروس" pct={pct(stats.lessons_done, stats.lessons_total)} color="bg-violet-500" />
            <MiniBar label="التمارين" pct={pct(stats.ex_done, stats.ex_total)} color="bg-blue-500" />
            <MiniBar label="الامتحانات" pct={pct(stats.exam_done, stats.exam_total)} color="bg-rose-500" />
            <MiniBar label="الملفات" pct={pct(stats.files_opened, stats.files_total)} color="bg-orange-500" />
          </div>
        </Card>

        {/* Schedule / deadline */}
        {sched && (
          <Card title="الجدول الزمني" icon={Clock} iconColor="text-rose-500">
            {sched.allDone ? (
              <div className="text-center py-2"><div className="text-2xl mb-1">🎓</div><div className="text-[13px] font-bold text-emerald-600">أكملت كل الوحدات!</div></div>
            ) : (
              <div className="space-y-2.5">
                <div className={`rounded-xl p-3 ${sched.courseOverdue ? 'bg-rose-50' : 'bg-zinc-50'}`}>
                  <div className="text-[11px] text-zinc-400">المتبقّي لإنهاء الدورة</div>
                  <div className={`font-black text-[20px] ${sched.courseOverdue ? 'text-rose-600' : 'text-zinc-900'}`}>{sched.courseOverdue ? 'انتهت' : `${sched.daysLeftCourse} يوم`}</div>
                  <div className="text-[11px] text-zinc-400">آخر أجل: {fmtDate(sched.courseEnd)}</div>
                </div>
                <div className={`rounded-xl p-3 ${sched.unitOverdue ? 'bg-rose-50' : 'bg-amber-50'}`}>
                  <div className="text-[11px] text-zinc-400">الوحدة الحالية</div>
                  <div className="font-bold text-[13px] text-zinc-800 truncate">{sched.currentUnit || '—'}</div>
                  <div className={`text-[12px] font-bold mt-0.5 ${sched.unitOverdue ? 'text-rose-600' : 'text-amber-700'}`}>
                    {sched.unitOverdue ? `متأخّر · كان ${fmtDate(sched.unitEnd)}` : sched.daysLeftUnit > 0 ? `يتبقّى ${sched.daysLeftUnit} يوم (${fmtDate(sched.unitEnd)})` : `الموعد اليوم`}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500"><span className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><span className="block h-full bg-rose-400 rounded-full" style={{ width: `${Math.round(sched.completedUnits / sched.totalUnits * 100)}%` }} /></span>{sched.completedUnits}/{sched.totalUnits}</div>
                {sched.unitOverdue && <div className="text-[11px] text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1.5 leading-snug">⚠️ تم تسجيلك كـ «متأخّر». أكمل الوحدة لتعود ضمن الجدول.</div>}
              </div>
            )}
          </Card>
        )}

        {/* Next exam */}
        <Card title="الامتحان القادم" icon={CalendarDays} iconColor="text-blue-500">
          {nextExam ? (
            <div>
              <div className="font-bold text-[14px] text-zinc-800">{nextExam.title}</div>
              <div className="flex items-center gap-2 mt-1.5 text-[12px] text-zinc-500">
                {(s.current_level || nextExam.level) && <span className="font-bold bg-zinc-100 px-1.5 rounded">{s.current_level ?? nextExam.level} {s.next_level ? `→ ${s.next_level}` : ''}</span>}
              </div>
              {nextExam.exam_date && <div className="text-[12px] text-zinc-500 mt-1.5 flex items-center gap-1"><CalendarDays size={12} /> {new Date(nextExam.exam_date).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>}
              <button onClick={() => goTab('progress')} className="w-full mt-3 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold text-[12px] hover:bg-zinc-200">مراجعة الامتحانات السابقة</button>
            </div>
          ) : <Empty mini text="لا امتحان قادم محدّد" />}
        </Card>

        {/* Streak */}
        <Card title="سلسلة التعلم" icon={Flame} iconColor="text-orange-500">
          <div className="text-center">
            <div className="text-[12px] text-zinc-500">{stats.streak > 0 ? 'أنت رائع! حافظ على الزخم' : 'ابدأ سلسلتك اليوم'}</div>
            <div className="text-[40px] font-black text-orange-500 leading-none my-1">{stats.streak}</div>
            <div className="text-[12px] text-zinc-400 mb-3">أيام متتالية</div>
            <div className="flex items-center justify-between">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${d.active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-300'}`}>{d.active ? <CheckCircle2 size={14} /> : <Circle size={14} />}</div>
                  <span className="text-[9px] text-zinc-400">{d.day.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card title="إنجازاتك" icon={Trophy} iconColor="text-amber-500">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {achievements.map(a => { const Icon = a.icon; return (
              <div key={a.id} className={`rounded-xl p-2.5 text-center ${a.on ? 'bg-white border border-zinc-100' : 'opacity-40 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full ${a.color} flex items-center justify-center mx-auto mb-1.5`}><Icon size={18} /></div>
                <div className="text-[11px] font-bold text-zinc-800 leading-tight">{a.label}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{a.sub}</div>
              </div>
            )})}
          </div>
        </Card>

        {/* Certificates (auto-awarded: course completion, coins, streaks) */}
        {myCerts.length > 0 && (
          <Card title="شهاداتي" icon={Medal} iconColor="text-amber-600">
            <div className="space-y-1.5 mt-1">
              {myCerts.map(c => (
                <a key={c.serial} href={`/certificate/${c.serial}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 hover:bg-amber-50 transition-colors">
                  <span className="text-[18px] flex-shrink-0">{(CERT_KIND_AR[c.kind] ?? CERT_KIND_AR.custom).emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-zinc-800 leading-tight truncate">{c.title}</div>
                    <div className="text-[10px] text-zinc-400" dir="ltr">{c.serial} · {c.date}</div>
                  </div>
                  <ExternalLink size={13} className="text-amber-500 flex-shrink-0" />
                </a>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">اضغط على أي شهادة لعرضها وطباعتها — لكل شهادة رقم تحقق رسمي.</p>
          </Card>
        )}
      </div>

      {/* My teachers + rating — full width */}
      {!demo && <MyTeachersCard token={token} />}

      {/* Teacher message — full width */}
      {s.admin_message && (
        <div className="lg:col-span-3 bg-[var(--ic-gold-soft)] border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <InitAva name={s.teacher_name || 'مدرّس'} className="w-11 h-11 rounded-full text-[15px] flex-shrink-0" />
          <div className="flex-1"><div className="text-[12px] font-bold text-yellow-800">رسالة من مدرّسك 👩‍🏫</div><div className="text-[13px] text-yellow-900 leading-relaxed">{s.admin_message}</div></div>
        </div>
      )}
    </div>
    </>
  )
}
