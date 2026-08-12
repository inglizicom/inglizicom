'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Video, Loader2, ArrowLeft, FlaskConical, Circle,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchAttendanceTotals, fetchMyStudents, fetchReportsOwed, fetchSessions,
  fetchTeacherOverview,
  type ClassSession, type MyStudent, type TeacherOverview,
} from '@/lib/teachers'
import { Band, Figure, Lede, Notice, TextLink } from './_paper'
import { DEMO_ATTENDANCE, DEMO_OVERVIEW, DEMO_REPORTS_OWED, DEMO_SESSIONS, DEMO_STUDENTS, isTeacherDemo } from './_demo'
import { fmtTime, fromNow, STATUS_AR } from './_ui'

/**
 * اليوم — what today needs from me.
 *
 * The old dashboard opened on eight stat tiles, which is a way of saying "here
 * is everything" and therefore "here is nothing". A teacher arriving at
 * 17:50 with a class at 18:00 does not need a grid of totals; they need the
 * next hour, and one honest line about what they owe.
 *
 * So the page opens on a sentence. The schedule is a timeline, not cards. The
 * totals still exist — they are just further down, where context belongs.
 */

const DAY_AR = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })

export default function TeacherDashboard() {
  const teacher = useTeacher()
  const [ov, setOv]             = useState<TeacherOverview | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [owed, setOwed]         = useState<ClassSession[]>([])
  const [att, setAtt]           = useState({ present: 0, late: 0, absent: 0, excused: 0 })
  const [students, setStudents] = useState<MyStudent[]>([])
  const [loading, setLoading]   = useState(true)
  const [demo, setDemo]         = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      setDemo(true); setOv(DEMO_OVERVIEW); setSessions(DEMO_SESSIONS)
      setOwed(DEMO_REPORTS_OWED); setAtt(DEMO_ATTENDANCE); setStudents(DEMO_STUDENTS)
      setLoading(false); return
    }
    ;(async () => {
      const [o, s, r, a, st] = await Promise.all([
        fetchTeacherOverview(), fetchSessions(teacher.id), fetchReportsOwed(teacher.id),
        fetchAttendanceTotals(teacher.id), fetchMyStudents(),
      ])
      if (!alive) return
      setOv(o); setSessions(s); setOwed(r); setAtt(a); setStudents(st); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const now = Date.now()

  const upcoming = useMemo(
    () => sessions
      .filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
      .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [sessions, now])

  const todays = useMemo(() => {
    const d = new Date().toDateString()
    return upcoming.filter(s => new Date(s.starts_at).toDateString() === d)
  }, [upcoming])

  const later = useMemo(() => upcoming.filter(s => !todays.includes(s)).slice(0, 6), [upcoming, todays])

  const attTotal  = att.present + att.late + att.absent
  const completed = sessions.filter(s => s.status === 'done').length
  const next      = upcoming[0]
  const firstName = (teacher.profile?.display_name || teacher.fullName || '').split(' ')[0]

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#C4BEB2]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري التحميل…</span>
      </div>
    )
  }

  return (
    <div>
      {demo && (
        <div className="flex items-center gap-2.5 rounded-xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5 mb-8">
          <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
          <span className="text-[12.5px] font-semibold text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
          <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-fuchsia-900">إيقاف</a>
        </div>
      )}

      {/* ══ The opening sentence ══════════════════════════ */}
      <div className="pb-9">
        <div className="text-[12.5px] font-bold tracking-[.12em] uppercase text-[#A8A29E] mb-4">
          {DAY_AR(new Date().toISOString())}
        </div>

        {next ? (
          <Lede>
            {firstName ? `${firstName}، ` : ''}حصتك القادمة{' '}
            <span className="text-[#B45309]">{fromNow(next.starts_at)}</span>
            {' — '}{next.title}.
          </Lede>
        ) : (
          <Lede>
            {firstName ? `${firstName}، ` : ''}لا حصص قادمة.{' '}
            <span className="text-[#A8A29E]">برمج واحدة ليبدأ الجدول.</span>
          </Lede>
        )}

        {next && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[13.5px] font-semibold text-[#8A8377]">
            <span className="tabular-nums text-[#1C1917]">{fmtTime(next.starts_at)}</span>
            <span>{next.duration_min} دقيقة</span>
            <span>{STATUS_AR[next.mode] ?? next.mode}</span>
            {next.level && <span>{next.level}</span>}
            {next.meeting_url && (
              <a href={next.meeting_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 text-[#1C1917] border-b-2 border-[#D6CFC0] pb-0.5
                            hover:border-[#1C1917] transition-colors">
                <Video size={14} /> ادخل للحصة
              </a>
            )}
          </div>
        )}

        {owed.length > 0 && (
          <div className="mt-7 max-w-[34rem]">
            <Notice icon={AlertTriangle} tone="alert"
                    action={<Link href="/teacher/reports"><TextLink>اكتبها</TextLink></Link>}>
              {owed.length} {owed.length === 1 ? 'حصة بدون تقرير' : 'حصص بدون تقارير'}
            </Notice>
          </div>
        )}
      </div>

      {/* ══ Today ═════════════════════════════════════════ */}
      <Band title="اليوم" note={todays.length > 0 ? `${todays.length} حصة` : undefined}>
        {todays.length === 0 ? (
          <p className="text-[15px] text-[#A8A29E]">لا حصص اليوم.</p>
        ) : (
          <ol className="max-w-[46rem]">
            {todays.map((s, i) => (
              <li key={s.id}>
                <Link href={`/teacher/classes/${s.id}`}
                      className="group flex items-baseline gap-5 py-4 border-b border-[#EFEBE2] hover:bg-white/60 transition-colors">
                  <span className={`w-[62px] shrink-0 text-[15px] font-extrabold tabular-nums
                                    ${i === 0 ? 'text-[#1C1917]' : 'text-[#57534E]'}`}>
                    {fmtTime(s.starts_at)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[16px] font-bold truncate">{s.title}</span>
                    <span className="block text-[12.5px] text-[#8A8377] font-semibold mt-1">
                      {s.duration_min} دقيقة · {STATUS_AR[s.status]}
                      {s.level ? ` · ${s.level}` : ''}
                    </span>
                  </span>
                  {s.status === 'live' && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#047857] shrink-0">
                      <Circle size={7} className="fill-current animate-pulse" /> جارية
                    </span>
                  )}
                  <ArrowLeft size={16} className="text-[#D6CFC0] group-hover:text-[#1C1917] transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Band>

      {/* ══ The numbers, where context belongs ════════════ */}
      <Band title="هذا الشهر">
        <div className="flex flex-wrap gap-y-7 gap-x-4">
          <Figure value={ov?.classes_month ?? 0} label="حصة" />
          <Figure value={ov?.hours_month ?? 0} unit="س" label="ساعة تدريس" />
          <Figure value={ov?.students_total ?? 0} label="طالباً" />
          <Figure
            value={ov?.attendance_rate != null ? `${ov.attendance_rate}` : '—'}
            unit={ov?.attendance_rate != null ? '%' : undefined}
            label="نسبة الحضور"
          />
          <Figure value={owed.length} tone={owed.length > 0 ? 'alert' : 'ink'} label="تقرير معلّق" />
        </div>

        {attTotal > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-[13px] font-semibold text-[#8A8377]">
            <span><span className="text-[#047857] tabular-nums">{att.present}</span> حاضر</span>
            <span><span className="text-[#0369A1] tabular-nums">{att.late}</span> متأخر</span>
            <span><span className="text-[#B91C1C] tabular-nums">{att.absent}</span> غائب</span>
            <span className="text-[#C4BEB2]">من {attTotal} تسجيلاً · {completed} حصة منتهية</span>
          </div>
        )}
      </Band>

      {/* ══ What's next ═══════════════════════════════════ */}
      {later.length > 0 && (
        <Band title="قادم" action={<Link href="/teacher/classes"><TextLink>كل الجدول</TextLink></Link>}>
          <ol className="max-w-[46rem]">
            {later.map(s => (
              <li key={s.id}>
                <Link href={`/teacher/classes/${s.id}`}
                      className="group flex items-baseline gap-5 py-3.5 border-b border-[#EFEBE2] hover:bg-white/60 transition-colors">
                  <span className="w-[92px] shrink-0 text-[12.5px] font-bold text-[#8A8377]">
                    {new Date(s.starts_at).toLocaleDateString('ar-MA', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="w-[52px] shrink-0 text-[13.5px] font-bold tabular-nums text-[#57534E]">
                    {fmtTime(s.starts_at)}
                  </span>
                  <span className="flex-1 min-w-0 text-[14.5px] font-semibold truncate">{s.title}</span>
                  <ArrowLeft size={15} className="text-[#D6CFC0] group-hover:text-[#1C1917] transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
        </Band>
      )}

      {/* ══ Students ══════════════════════════════════════ */}
      {students.length > 0 && (
        <Band title="طلابي" note={`${students.filter(s => s.is_active).length} نشط`}
              action={<Link href="/teacher/students"><TextLink>الكل</TextLink></Link>}>
          <div className="flex flex-wrap gap-2.5">
            {students.slice(0, 12).map(st => (
              <Link key={st.id} href="/teacher/students"
                    className="inline-flex items-center gap-2.5 pr-1.5 pl-4 py-1.5 rounded-full bg-white
                               ring-1 ring-[#E4DFD5] hover:ring-[#1C1917] transition-colors">
                {st.avatar_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={st.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <span className="w-7 h-7 rounded-full bg-[#F0EDE5] text-[#78716C] flex items-center justify-center text-[11px] font-bold">
                      {st.full_name.trim().charAt(0)}
                    </span>}
                <span className="text-[13px] font-semibold">{st.full_name}</span>
              </Link>
            ))}
            {students.length > 12 && (
              <span className="inline-flex items-center px-4 py-1.5 text-[13px] font-semibold text-[#A8A29E]">
                +{students.length - 12}
              </span>
            )}
          </div>
        </Band>
      )}
    </div>
  )
}
