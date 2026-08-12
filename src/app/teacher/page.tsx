'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Video, Loader2, ArrowLeft, FlaskConical, Circle,
  CalendarPlus, ClipboardList, FolderOpen, Users,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchAttendanceTotals, fetchMyStudents, fetchReportsOwed, fetchSessions,
  fetchTeacherOverview,
  type ClassSession, type MyStudent, type TeacherOverview,
} from '@/lib/teachers'
import { AttendanceBar, Ring } from './_charts'
import { DEMO_ATTENDANCE, DEMO_OVERVIEW, DEMO_REPORTS_OWED, DEMO_SESSIONS, DEMO_STUDENTS, isTeacherDemo } from './_demo'
import { fmtTime, fromNow, STATUS_AR } from './_ui'

/**
 * اليوم — what today needs from me.
 *
 * Laid out across the full measure rather than down a reading column. An
 * article wants 46rem and a right edge; a dashboard scanned between classes
 * wants both sides of the screen working, so this is a two-column page: the
 * day on the right where the eye lands first in Arabic, the standing numbers
 * and the people on the left.
 *
 * It opens on a sentence because a teacher arriving at 17:50 with a class at
 * 18:00 needs the next hour, not a grid of totals.
 */

const DAY_AR = () =>
  new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })

/* ── local pieces ─────────────────────────────────────── */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl ring-1 ring-[#E4DFD5] ${className}`}>{children}</div>
}

function Label({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="text-[12px] font-bold tracking-[.14em] uppercase text-[#A8A29E]">{children}</h2>
      {action && <div className="mr-auto shrink-0">{action}</div>}
    </div>
  )
}

function Quick({ href, icon: Icon, label }: { href: string; icon: typeof Users; label: string }) {
  return (
    <Link href={href}
          className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-white ring-1 ring-[#E4DFD5]
                     hover:ring-[#1C1917] transition-colors">
      <Icon size={18} className="text-[#57534E]" />
      <span className="text-[12px] font-bold text-[#44403C]">{label}</span>
    </Link>
  )
}

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

  const later = useMemo(() => upcoming.filter(s => !todays.includes(s)).slice(0, 7), [upcoming, todays])

  const attTotal  = att.present + att.late + att.absent
  const completed = sessions.filter(s => s.status === 'done').length
  const next      = upcoming[0]
  const firstName = (teacher.profile?.display_name || teacher.fullName || '').split(' ')[0]
  const active    = students.filter(s => s.is_active)

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#C4BEB2]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري التحميل…</span>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {demo && (
        <div className="flex items-center gap-2.5 rounded-xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
          <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
          <span className="text-[12.5px] font-semibold text-fuchsia-800">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
          <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-fuchsia-900">إيقاف</a>
        </div>
      )}

      {/* ══ Opening: sentence on the right, the class itself on the left ══ */}
      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 items-stretch">
        <div className="flex flex-col justify-center">
          <div className="text-[12px] font-bold tracking-[.14em] uppercase text-[#A8A29E] mb-3">{DAY_AR()}</div>

          <h1 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight leading-[1.18]">
            {next ? (
              <>
                {firstName ? `${firstName}، ` : ''}حصتك القادمة{' '}
                <span className="text-[#B45309]">{fromNow(next.starts_at)}</span>
              </>
            ) : (
              <>{firstName ? `${firstName}، ` : ''}لا حصص قادمة</>
            )}
          </h1>

          {owed.length > 0 && (
            <Link href="/teacher/reports"
                  className="mt-5 inline-flex items-center gap-2.5 self-start rounded-full bg-[#FEF2F2] ring-1 ring-[#FECACA]
                             px-4 py-2.5 hover:ring-[#B91C1C] transition-colors">
              <AlertTriangle size={15} className="text-[#B91C1C]" />
              <span className="text-[13px] font-bold text-[#991B1B]">
                {owed.length} {owed.length === 1 ? 'حصة بدون تقرير' : 'حصص بدون تقارير'}
              </span>
              <ArrowLeft size={14} className="text-[#B91C1C]" />
            </Link>
          )}

          <div className="grid grid-cols-4 gap-2.5 mt-7">
            <Quick href="/teacher/classes"   icon={CalendarPlus}  label="الجدول" />
            <Quick href="/teacher/students"  icon={Users}         label="الطلاب" />
            <Quick href="/teacher/reports"   icon={ClipboardList} label="التقارير" />
            <Quick href="/teacher/materials" icon={FolderOpen}    label="الملفات" />
          </div>
        </div>

        {next ? (
          <Card className="p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] font-bold tracking-[.12em] uppercase text-[#A8A29E] mb-2">الحصة التالية</div>
                <div className="text-[19px] font-extrabold leading-snug">{next.title}</div>
              </div>
              {next.status === 'live' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#047857] shrink-0">
                  <Circle size={7} className="fill-current animate-pulse" /> جارية
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { k: 'الوقت',  v: fmtTime(next.starts_at) },
                { k: 'المدة',  v: `${next.duration_min} د` },
                { k: 'النوع',  v: STATUS_AR[next.mode] ?? next.mode },
              ].map(x => (
                <div key={x.k} className="rounded-xl bg-[#FAF9F6] px-3 py-3">
                  <div className="text-[11px] font-semibold text-[#A8A29E]">{x.k}</div>
                  <div className="text-[15px] font-extrabold mt-1 tabular-nums">{x.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 flex gap-2.5">
              {next.meeting_url && (
                <a href={next.meeting_url} target="_blank" rel="noopener noreferrer"
                   className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full
                              bg-[#1C1917] text-white text-[13px] font-bold hover:bg-[#292524] transition-colors">
                  <Video size={15} /> ادخل للحصة
                </a>
              )}
              <Link href={`/teacher/classes/${next.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full
                               bg-white ring-1 ring-[#E4DFD5] text-[13px] font-bold hover:ring-[#1C1917] transition-colors">
                تفاصيل الحصة
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <CalendarPlus size={26} className="text-[#C4BEB2] mb-3" />
            <div className="text-[15px] font-bold">لا حصص مبرمجة</div>
            <p className="text-[12.5px] text-[#8A8377] mt-1.5">أضف حصة ليبدأ العدّ.</p>
            <Link href="/teacher/classes"
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#1C1917] text-white text-[13px] font-bold">
              برمج حصة
            </Link>
          </Card>
        )}
      </div>

      {/* ══ Figures — a full-width strip ══════════════════ */}
      <Card className="px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-4 divide-x divide-x-reverse divide-[#EFEBE2]">
          {[
            { v: ov?.classes_month ?? 0,   u: '',  l: 'حصة هذا الشهر' },
            { v: ov?.hours_month ?? 0,     u: 'س', l: 'ساعة تدريس' },
            { v: ov?.students_total ?? 0,  u: '',  l: 'طالباً' },
            { v: ov?.attendance_rate ?? 0, u: '%', l: 'نسبة الحضور' },
            { v: owed.length,              u: '',  l: 'تقرير معلّق', alert: owed.length > 0 },
          ].map(f => (
            <div key={f.l} className="px-4 first:pr-0">
              <div className="flex items-baseline gap-1">
                <span className={`text-[30px] font-extrabold tracking-tight tabular-nums leading-none
                                  ${f.alert ? 'text-[#B91C1C]' : 'text-[#1C1917]'}`}>{f.v}</span>
                {f.u && <span className="text-[13px] font-bold text-[#A8A29E]">{f.u}</span>}
              </div>
              <div className="text-[12px] font-semibold text-[#8A8377] mt-1.5">{f.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ Two columns: the schedule, and everything else ══ */}
      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 items-start">

        <div className="space-y-6">
          <Card className="p-6">
            <Label action={<Link href="/teacher/classes"
                                 className="text-[12px] font-bold text-[#44403C] border-b-2 border-[#D6CFC0] pb-0.5
                                            hover:border-[#1C1917]">كل الجدول</Link>}>
              اليوم {todays.length > 0 && <span className="text-[#C4BEB2]">· {todays.length}</span>}
            </Label>

            {todays.length === 0 ? (
              <p className="text-[14px] text-[#A8A29E] py-2">لا حصص اليوم.</p>
            ) : (
              <ol>
                {todays.map((s, i) => (
                  <li key={s.id}>
                    <Link href={`/teacher/classes/${s.id}`}
                          className="group flex items-center gap-4 py-3.5 border-b border-[#EFEBE2] last:border-0
                                     hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg transition-colors">
                      <span className={`w-1 h-10 rounded-full shrink-0 ${i === 0 ? 'bg-[#B45309]' : 'bg-[#E4DFD5]'}`} />
                      <span className="w-[52px] shrink-0 text-[15px] font-extrabold tabular-nums">{fmtTime(s.starts_at)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] font-bold truncate">{s.title}</span>
                        <span className="block text-[12px] text-[#8A8377] font-semibold mt-0.5">
                          {s.duration_min} دقيقة · {STATUS_AR[s.status]}
                        </span>
                      </span>
                      <ArrowLeft size={15} className="text-[#D6CFC0] group-hover:text-[#1C1917] transition-colors shrink-0" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {later.length > 0 && (
            <Card className="p-6">
              <Label>قادم</Label>
              <ol>
                {later.map(s => (
                  <li key={s.id}>
                    <Link href={`/teacher/classes/${s.id}`}
                          className="group flex items-center gap-4 py-3 border-b border-[#EFEBE2] last:border-0
                                     hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg transition-colors">
                      <span className="w-[76px] shrink-0 text-[12px] font-bold text-[#8A8377]">
                        {new Date(s.starts_at).toLocaleDateString('ar-MA', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="w-[46px] shrink-0 text-[13px] font-extrabold tabular-nums text-[#57534E]">
                        {fmtTime(s.starts_at)}
                      </span>
                      <span className="flex-1 min-w-0 text-[14px] font-semibold truncate">{s.title}</span>
                      <ArrowLeft size={14} className="text-[#D6CFC0] group-hover:text-[#1C1917] transition-colors shrink-0" />
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {attTotal > 0 && (
            <Card className="p-6">
              <Label>الحضور</Label>
              <div className="flex items-center gap-6">
                <Ring pct={ov?.attendance_rate ?? 0} size={104} label="حضور" />
                <div className="flex-1 min-w-0">
                  <AttendanceBar present={att.present} late={att.late} absent={att.absent} />
                </div>
              </div>
              <p className="text-[12px] text-[#A8A29E] font-semibold mt-4">
                {attTotal} تسجيلاً · {completed} حصة منتهية
              </p>
            </Card>
          )}

          {active.length > 0 && (
            <Card className="p-6">
              <Label action={<Link href="/teacher/students"
                                   className="text-[12px] font-bold text-[#44403C] border-b-2 border-[#D6CFC0] pb-0.5
                                              hover:border-[#1C1917]">الكل</Link>}>
                طلابي <span className="text-[#C4BEB2]">· {active.length}</span>
              </Label>
              <div className="space-y-1">
                {active.slice(0, 7).map(st => (
                  <Link key={st.id} href="/teacher/students"
                        className="flex items-center gap-3 py-2 -mx-2 px-2 rounded-lg hover:bg-[#FAF9F6] transition-colors">
                    {st.avatar_url
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={st.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      : <span className="w-8 h-8 rounded-full bg-[#F0EDE5] text-[#78716C] flex items-center justify-center text-[11px] font-bold shrink-0">
                          {st.full_name.trim().charAt(0)}
                        </span>}
                    <span className="text-[13.5px] font-semibold truncate flex-1">{st.full_name}</span>
                    {st.course && <span className="text-[11px] font-bold text-[#A8A29E] shrink-0">{st.course}</span>}
                  </Link>
                ))}
              </div>
              {active.length > 7 && (
                <p className="text-[12px] font-bold text-[#A8A29E] mt-3">+{active.length - 7} آخرين</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
