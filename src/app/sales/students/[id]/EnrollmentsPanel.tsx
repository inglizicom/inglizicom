'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2, Plus, Presentation, UserCog } from 'lucide-react'
import { fetchCourseProgress, fetchCourses, type CourseProgress, type LmsCourse } from '@/lib/lms'
import {
  MODE_AR, SEAT_STATUS_AR, assignTeacher, endCourseEnrollment, enrollInClass, enrollInCourse,
  fetchOnlineClasses, fetchStudentEnrollments, fetchTeacherOptions, fmtDay, setCourseEnrollmentStatus, setSeatStatus,
  type OnlineClass, type StudentClassEnrollment, type StudentCourseEnrollment, type StudentEnrollments, type TeacherOption,
} from '@/lib/online-classes'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { Badge, ConfirmDialog, ErrorNote, INP } from '@/components/crm/kit'

const COURSE_STATUS_AR = { active: 'نشط', completed: 'مكتمل', cancelled: 'أُلغي' } as const

type Pending =
  | { kind: 'endCourse'; e: StudentCourseEnrollment }
  | { kind: 'seat'; e: StudentClassEnrollment; to: 'completed' | 'cancelled' }
  | { kind: 'unassign'; teacherId: string; name: string }

/**
 * The three relations a student can have, side by side and never merged:
 * course enrollments (content access), online-class seats (live classes), and
 * teacher assignment. Attendance and payments live in their own tabs.
 */
export default function EnrollmentsPanel({ studentId, studentName, onChanged }: {
  studentId: string; studentName: string; onChanged?: () => void
}) {
  const base = useCrmBasePath()
  const [data, setData] = useState<StudentEnrollments | null>(null)
  const [progress, setProgress] = useState<CourseProgress[]>([])
  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [classes, setClasses] = useState<OnlineClass[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [pickCourse, setPickCourse] = useState('')
  const [pickClass, setPickClass] = useState('')
  const [pickTeacher, setPickTeacher] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([fetchStudentEnrollments(studentId), fetchCourseProgress(studentId)])
      setData(d); setProgress(p)
    } catch (e: any) { setError(e?.message ?? 'تعذّر التحميل.') }
  }, [studentId])

  useEffect(() => {
    load()
    fetchCourses().then(setCourses)
    fetchOnlineClasses(false).then(setClasses).catch(() => setClasses([]))
    fetchTeacherOptions().then(setTeachers).catch(() => setTeachers([]))
  }, [load])

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key); setError(null)
    try { await fn(); await load(); onChanged?.() }
    catch (e: any) { setError(e?.message ?? 'تعذّر تنفيذ العملية.') }
    finally { setBusy(null) }
  }

  const currentCourses = (data?.courses ?? []).filter(c => c.current)
  const pastCourses = (data?.courses ?? []).filter(c => !c.current)
  const openSeats = (data?.classes ?? []).filter(c => c.status === 'active' || c.status === 'waitlisted')
  const endedSeats = (data?.classes ?? []).filter(c => c.status === 'completed' || c.status === 'cancelled')
  const activeTeachers = (data?.teachers ?? []).filter(t => t.is_active)
  const enrolledCourseIds = new Set(currentCourses.map(c => c.course_id))
  const seatedClassIds = new Set(openSeats.map(c => c.class_id))
  const assignedTeacherIds = new Set(activeTeachers.map(t => t.teacher_id))
  const progressBy = useMemo(() => new Map(progress.map(p => [p.course_id, p])), [progress])

  if (!data) {
    return <div className="md:col-span-2 py-8 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={20} /></div>
  }

  return (
    <div className="md:col-span-2 space-y-4">
      <ErrorNote>{error}</ErrorNote>

      {/* ── Course enrollments ───────────────────────────── */}
      <section className="border border-blue-200 bg-blue-50/40 rounded-xl p-4">
        <Header icon={BookOpen} color="text-blue-600" title="التسجيل في الدورات" sub="يفتح محتوى الدورة في فضاء الطالب" count={currentCourses.length} />
        {currentCourses.length === 0 && <p className="text-[13px] text-zinc-400 mb-3">غير مسجّل في أي دورة حاليًا.</p>}
        <div className="space-y-2 mb-3">
          {currentCourses.map(e => {
            const p = progressBy.get(e.course_id)
            return (
              <div key={e.id} className="bg-white rounded-xl border border-zinc-100 p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <div className="font-semibold text-[14px] text-zinc-800 flex-1 min-w-[10rem]">
                    {e.title}{e.level && <span className="mr-1.5 text-[11px] font-bold bg-zinc-100 text-zinc-600 px-1.5 rounded">{e.level}</span>}
                  </div>
                  <Badge tone={e.status}>{COURSE_STATUS_AR[e.status]}</Badge>
                </div>
                <div className="text-[11.5px] text-zinc-400 mb-2">
                  مسجّل منذ {fmtDay(e.enrolled_at)}{e.completed_at && <> · أكمل في {fmtDay(e.completed_at)}</>}
                </div>
                {p && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} /></div>
                    <span className="text-[12px] font-bold text-zinc-700 tabular-nums">{p.done}/{p.total} · {p.progress}%</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-[11.5px] font-bold">
                  {e.status === 'active'
                    ? <ActionLink busy={busy === e.id} onClick={() => run(e.id, () => setCourseEnrollmentStatus(studentId, e.course_id, 'completed'))}>تعليم كمكتمل</ActionLink>
                    : <ActionLink busy={busy === e.id} onClick={() => run(e.id, () => setCourseEnrollmentStatus(studentId, e.course_id, 'active'))}>إعادة تفعيل</ActionLink>}
                  <button onClick={() => setPending({ kind: 'endCourse', e })} className="text-zinc-400 hover:text-red-600">إلغاء التسجيل</button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <select value={pickCourse} onChange={e => setPickCourse(e.target.value)} className={`${INP} flex-1 border-blue-200`}>
            <option value="">اختر دورة لتسجيله بها</option>
            {courses.filter(c => !enrolledCourseIds.has(c.id)).map(c => <option key={c.id} value={c.id}>{c.title}{c.level ? ` (${c.level})` : ''}</option>)}
          </select>
          <button disabled={!pickCourse || busy === 'course'}
            onClick={() => run('course', async () => { await enrollInCourse(pickCourse, [studentId]); setPickCourse('') })}
            className="text-[13px] font-bold px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 flex items-center gap-1.5">
            {busy === 'course' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} تسجيل
          </button>
        </div>
      </section>

      {/* ── Online-class enrollments ─────────────────────── */}
      <section className="border border-violet-200 bg-violet-50/40 rounded-xl p-4">
        <Header icon={Presentation} color="text-violet-600" title="التسجيل في الأقسام المباشرة" sub="مقعد في قسم جماعي أو فردي مع أستاذ" count={openSeats.length} />
        {openSeats.length === 0 && <p className="text-[13px] text-zinc-400 mb-3">لا مقعد حالي في أي قسم.</p>}
        <div className="space-y-2 mb-3">
          {openSeats.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-zinc-100 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`${base}/classes/${e.class_id}`} className="font-semibold text-[14px] text-zinc-800 hover:text-violet-700 flex-1 min-w-[10rem]">{e.title}</Link>
                <Badge tone={e.mode}>{MODE_AR[e.mode]}</Badge>
                <Badge tone={e.status}>{SEAT_STATUS_AR[e.status]}</Badge>
              </div>
              <div className="text-[11.5px] text-zinc-400 mt-1">
                الأستاذ: {e.teacher_name ?? '—'} · مسجّل منذ {fmtDay(e.enrolled_at)}
                {e.start_date && <> · يبدأ {fmtDay(e.start_date)}</>}{e.end_date && <> · ينتهي {fmtDay(e.end_date)}</>}
              </div>
              <div className="flex gap-3 text-[11.5px] font-bold mt-2">
                {e.status === 'active' && <button onClick={() => setPending({ kind: 'seat', e, to: 'completed' })} className="text-sky-700 hover:text-sky-900">إكمال</button>}
                <button onClick={() => setPending({ kind: 'seat', e, to: 'cancelled' })} className="text-zinc-400 hover:text-red-600">إلغاء التسجيل</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={pickClass} onChange={e => setPickClass(e.target.value)} className={`${INP} flex-1 border-violet-200`}>
            <option value="">اختر قسمًا لتسجيله به</option>
            {classes.filter(c => c.status === 'active' && !seatedClassIds.has(c.id)).map(c => (
              <option key={c.id} value={c.id}>
                {c.title} — {MODE_AR[c.mode]} · {c.teacher_name ?? 'بدون أستاذ'} · {c.capacity ? `${c.active_count}/${c.capacity}` : c.active_count}
              </option>
            ))}
          </select>
          <button disabled={!pickClass || busy === 'class'}
            onClick={() => run('class', async () => {
              const [r] = await enrollInClass(pickClass, [studentId])
              if (r && r.result === 'error') throw new Error(r.message)
              if (r && r.result === 'duplicate') throw new Error('الطالب مسجّل بالفعل في هذا القسم.')
              setPickClass('')
            })}
            className="text-[13px] font-bold px-4 py-2 rounded-lg bg-violet-600 text-white disabled:opacity-50 flex items-center gap-1.5">
            {busy === 'class' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} تسجيل
          </button>
        </div>
      </section>

      {/* ── Teacher assignment ───────────────────────────── */}
      <section className="border border-zinc-200 bg-white rounded-xl p-4">
        <Header icon={UserCog} color="text-zinc-600" title="الأساتذة المسنَدون" sub="من يتابع الطالب — مستقل عن الأقسام" count={activeTeachers.length} />
        <div className="flex flex-wrap gap-2 mb-3">
          {activeTeachers.length === 0 && <span className="text-[13px] text-zinc-400">لا أستاذ مسنَد.</span>}
          {activeTeachers.map(t => (
            <span key={t.teacher_id} className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full pl-1.5 pr-3 py-1 text-[12.5px] font-bold text-zinc-700">
              {t.name}<span className="text-[10.5px] text-zinc-400 font-semibold">منذ {fmtDay(t.assigned_at)}</span>
              <button onClick={() => setPending({ kind: 'unassign', teacherId: t.teacher_id, name: t.name })}
                className="w-5 h-5 rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label={`إلغاء إسناد ${t.name}`}>×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={pickTeacher} onChange={e => setPickTeacher(e.target.value)} className={`${INP} flex-1`}>
            <option value="">اختر أستاذًا</option>
            {teachers.filter(t => t.is_active && !assignedTeacherIds.has(t.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button disabled={!pickTeacher || busy === 'teacher'}
            onClick={() => run('teacher', async () => { await assignTeacher(pickTeacher, [studentId], true); setPickTeacher('') })}
            className="text-[13px] font-bold px-4 py-2 rounded-lg bg-zinc-900 text-white disabled:opacity-50 flex items-center gap-1.5">
            {busy === 'teacher' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} إسناد
          </button>
        </div>
      </section>

      {/* ── History ──────────────────────────────────────── */}
      {(pastCourses.length > 0 || endedSeats.length > 0) && (
        <div>
          <button onClick={() => setShowHistory(v => !v)} className="text-[12.5px] font-bold text-zinc-500 hover:text-zinc-800">
            {showHistory ? 'إخفاء السجلّ السابق' : `السجلّ السابق (${pastCourses.length + endedSeats.length})`}
          </button>
          {showHistory && (
            <div className="mt-2 rounded-xl border border-zinc-200 divide-y divide-zinc-100 bg-white">
              {pastCourses.map(e => (
                <HistoryRow key={e.id} kind="دورة" title={e.title} status={COURSE_STATUS_AR[e.status]} tone={e.status}
                  span={`${fmtDay(e.enrolled_at)} → ${fmtDay(e.ended_at)}`} reason={e.end_reason} />
              ))}
              {endedSeats.map(e => (
                <HistoryRow key={e.id} kind={`قسم ${MODE_AR[e.mode]}`} title={e.title} status={SEAT_STATUS_AR[e.status]} tone={e.status}
                  span={`${fmtDay(e.enrolled_at)} → ${fmtDay(e.ended_at)}`} reason={e.end_reason} />
              ))}
            </div>
          )}
        </div>
      )}

      {pending?.kind === 'endCourse' && (
        <ConfirmDialog title="إلغاء التسجيل في الدورة"
          body={<>سيفقد <b>{studentName}</b> الوصول إلى «{pending.e.title}» في فضائه.</>}
          keeps={['تقدّمه في الدروس ونتائج الاختبارات (تعود إن أُعيد تسجيله)', 'سجلّ التسجيل وتاريخه في التحليلات', 'المدفوعات والنشاط']}
          askReason confirmLabel="إلغاء التسجيل"
          onConfirm={async reason => { await endCourseEnrollment(studentId, pending.e.course_id, reason || null); await load(); onChanged?.() }}
          onClose={() => setPending(null)} />
      )}
      {pending?.kind === 'seat' && (
        <ConfirmDialog title={pending.to === 'cancelled' ? 'إلغاء التسجيل في القسم' : 'إكمال التسجيل في القسم'}
          danger={pending.to === 'cancelled'}
          body={pending.to === 'cancelled'
            ? <>سيُحرَّر مقعد <b>{studentName}</b> في «{pending.e.title}» ولن يظهر في قائمة الأستاذ للحصص القادمة.</>
            : <>سيُعتبر <b>{studentName}</b> قد أكمل «{pending.e.title}».</>}
          keeps={['سجلّ الحضور والتقارير', 'المدفوعات والنشاط', 'سجلّ التسجيل وتاريخه']}
          askReason confirmLabel={pending.to === 'cancelled' ? 'إلغاء التسجيل' : 'إكمال'}
          onConfirm={async reason => { await setSeatStatus(pending.e.id, pending.to, { reason: reason || null }); await load(); onChanged?.() }}
          onClose={() => setPending(null)} />
      )}
      {pending?.kind === 'unassign' && (
        <ConfirmDialog title="إلغاء إسناد الأستاذ"
          body={<>لن يتابع <b>{pending.name}</b> الطالب <b>{studentName}</b> بعد الآن (إلا إن كان له مقعد في أحد أقسامه).</>}
          keeps={['مقاعده في الأقسام', 'الحضور والتقارير السابقة', 'المدفوعات والنشاط']}
          confirmLabel="إلغاء الإسناد"
          onConfirm={async () => { await assignTeacher(pending.teacherId, [studentId], false); await load(); onChanged?.() }}
          onClose={() => setPending(null)} />
      )}
    </div>
  )
}

function Header({ icon: Icon, color, title, sub, count }: { icon: any; color: string; title: string; sub: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={15} className={color} />
      <span className="text-[13px] font-black text-zinc-800">{title}</span>
      <span className="text-[11px] font-bold bg-white border border-zinc-200 rounded-full px-1.5 tabular-nums">{count}</span>
      <span className="text-[11px] text-zinc-400 hidden sm:inline">· {sub}</span>
    </div>
  )
}

function ActionLink({ children, onClick, busy }: { children: React.ReactNode; onClick: () => void; busy?: boolean }) {
  return (
    <button onClick={onClick} disabled={busy} className="text-blue-700 hover:text-blue-900 disabled:opacity-50 inline-flex items-center gap-1">
      {busy && <Loader2 size={11} className="animate-spin" />}{children}
    </button>
  )
}

function HistoryRow({ kind, title, status, tone, span, reason }: {
  kind: string; title: string; status: string; tone: string; span: string; reason: string | null
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 text-[12.5px]">
      <span className="text-[11px] font-bold text-zinc-400 w-20 shrink-0">{kind}</span>
      <span className="flex-1 min-w-[8rem] font-semibold text-zinc-700">{title}</span>
      <Badge tone={tone}>{status}</Badge>
      <span className="text-zinc-400 text-[11.5px]">{span}</span>
      {reason && <span className="w-full text-[11px] text-zinc-400">السبب: {reason}</span>}
    </div>
  )
}
