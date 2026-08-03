'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, CalendarDays, Clock, Star, AlertTriangle, Video, Wallet, Zap,
  ArrowLeft, Loader2, CalendarPlus, ClipboardList, FolderOpen, TrendingUp,
  UserPlus, Target, FlaskConical, Radio, ChevronLeft, Flame,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchAttendanceTotals, fetchMyStudents, fetchReportsOwed, fetchSessions,
  fetchTeacherOverview,
  type ClassSession, type MyStudent, type TeacherOverview,
} from '@/lib/teachers'
import {
  Action, Bar, Chip, Dial, GRAD, Ghost, Head, Panel, Rise, Stat, useSeen,
} from './_ds'
import { DEMO_ATTENDANCE, DEMO_OVERVIEW, DEMO_REPORTS_OWED, DEMO_SESSIONS, DEMO_STUDENTS, isTeacherDemo } from './_demo'
import { fmtTime, fromNow, STATUS_AR } from './_ui'

/**
 * The dashboard answers one question: what does today need from me?
 *
 * So it opens on the next class, not on a grid of totals. The numbers come
 * after, because they are context — and the two that carry an obligation
 * (reports owed, attendance) are the ones allowed to shout.
 */
export default function TeacherDashboard() {
  const teacher = useTeacher()
  const [ov, setOv]             = useState<TeacherOverview | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [owed, setOwed]         = useState<ClassSession[]>([])
  const [students, setStudents] = useState<MyStudent[]>([])
  const [att, setAtt]           = useState({ present: 0, late: 0, absent: 0, excused: 0 })
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
    () => sessions.filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
                  .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [sessions, now])

  const todays = useMemo(() => {
    const d = new Date().toDateString()
    return sessions.filter(s => new Date(s.starts_at).toDateString() === d && s.status !== 'cancelled')
  }, [sessions])

  const weekly = useMemo(() => {
    const out: { label: string; classes: number; hours: number }[] = []
    for (let w = 7; w >= 0; w--) {
      const end = new Date(); end.setDate(end.getDate() - w * 7); end.setHours(23, 59, 59)
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0)
      const inWeek = sessions.filter(s => {
        const t = new Date(s.starts_at).getTime()
        return s.status === 'done' && t >= start.getTime() && t <= end.getTime()
      })
      out.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        classes: inWeek.length,
        hours: Math.round(inWeek.reduce((a, s) => a + s.duration_min, 0) / 6) / 10,
      })
    }
    return out
  }, [sessions])

  /** Students added in the last 30 days. */
  const newStudents = useMemo(() => {
    const cut = Date.now() - 30 * 864e5
    return students.filter(s => new Date(s.assigned_at).getTime() >= cut).length
  }, [students])

  const attTotal  = att.present + att.late + att.absent
  const completed = sessions.filter(s => s.status === 'done').length
  const cancelled = sessions.filter(s => s.status === 'cancelled').length
  const completion = completed + cancelled > 0 ? Math.round((completed / (completed + cancelled)) * 100) : 100
  const next = upcoming[0]
  const firstName = (teacher.profile?.display_name || teacher.fullName || '').split(' ')[0]

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-medium">جاري التحميل…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {demo && (
        <Rise>
          <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-500/[.08] ring-1 ring-fuchsia-500/20 px-4 py-2.5">
            <FlaskConical size={15} className="text-fuchsia-400 shrink-0" />
            <span className="text-[12.5px] font-medium text-fuchsia-200">معاينة ببيانات وهمية — لا شيء هنا حقيقي.</span>
            <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-300 hover:text-white transition-colors">إيقاف</a>
          </div>
        </Rise>
      )}

      {/* ═══ Row 1 — the next class, and the day at a glance ═══ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-stretch [&>*]:min-w-0">

        <Rise>
          <Panel glow="violet" className="p-6 sm:p-7 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Chip tone="violet">
                  <Radio size={10} className="animate-pulse" />
                  {new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Chip>
                {todays.length > 0 && <Chip tone="sky">{todays.length} حصة اليوم</Chip>}
              </div>

              <h1 className="text-[30px] sm:text-[38px] font-bold tracking-tight leading-[1.1]">
                {firstName ? <>أهلاً <span className="bg-gradient-to-l from-[#8B5CF6] to-[#38BDF8] bg-clip-text text-transparent">{firstName}</span></> : 'أهلاً بك'}
              </h1>

              {next ? (
                <p className="text-slate-400 text-[14px] font-medium mt-2.5 leading-relaxed">
                  حصتك القادمة <span className="text-white font-semibold">{next.title}</span>
                  {' '}— <span className="text-[#38BDF8] font-semibold">{fromNow(next.starts_at)}</span>
                  <span className="text-slate-500"> · {fmtTime(next.starts_at)} · {next.duration_min} دقيقة</span>
                </p>
              ) : (
                <p className="text-slate-400 text-[14px] font-medium mt-2.5">
                  لا حصص مبرمجة. أضف حصة ليبدأ العدّ.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 mt-6">
              {next?.meeting_url && (
                <a href={next.meeting_url} target="_blank" rel="noopener noreferrer">
                  <Action icon={Video} grad="violet">ادخل للحصة</Action>
                </a>
              )}
              <Link href="/teacher/classes"><Ghost icon={CalendarPlus}>برمج حصة</Ghost></Link>
              <Link href="/teacher/reports"><Ghost icon={ClipboardList}>اكتب تقريراً</Ghost></Link>
            </div>
          </Panel>
        </Rise>

        <Rise i={1}>
          <Panel className="p-6 h-full flex flex-col items-center justify-center text-center" glow="emerald">
            <Dial pct={ov?.attendance_rate ?? 0} grad="emerald" label="حضور" size={124} />
            <div className="mt-4 w-full grid grid-cols-3 gap-2">
              {[
                { k: 'حاضر', v: att.present, c: 'text-emerald-300' },
                { k: 'متأخر', v: att.late,   c: 'text-sky-300' },
                { k: 'غائب', v: att.absent,  c: 'text-rose-300' },
              ].map(x => (
                <div key={x.k} className="rounded-xl bg-white/[.04] py-2">
                  <div className={`text-[15px] font-bold tabular-nums ${x.c}`}>{x.v}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{x.k}</div>
                </div>
              ))}
            </div>
            {attTotal === 0 && <p className="text-[11px] text-slate-500 mt-3">سجّل الحضور لتظهر النسبة.</p>}
          </Panel>
        </Rise>
      </div>

      {/* ═══ Reports owed — the only thing allowed to shout ═══ */}
      {owed.length > 0 && (
        <Rise>
          <Link href="/teacher/reports" className="block">
            <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="relative overflow-hidden rounded-[22px] bg-gradient-to-l from-rose-500/[.12] to-amber-500/[.08]
                                   ring-1 ring-rose-500/25 px-5 py-4 flex items-center gap-4">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#F59E0B] flex items-center justify-center shrink-0 shadow-lg">
                <AlertTriangle size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-white">
                  {owed.length} {owed.length === 1 ? 'حصة بدون تقرير' : 'حصص بدون تقارير'}
                </div>
                <div className="text-[12.5px] text-rose-200/70 font-medium">اكتب التقرير قبل أن تنسى التفاصيل.</div>
              </div>
              <ArrowLeft size={18} className="text-rose-300/60 shrink-0" />
            </motion.div>
          </Link>
        </Rise>
      )}

      {/* ═══ The eight figures ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
        <Stat i={0} icon={CalendarDays} grad="sky"     label="حصص اليوم"      value={todays.length}
              foot={<MiniFoot label="هذا الشهر" value={`${ov?.classes_month ?? 0} حصة`} />} />
        <Stat i={1} icon={Users}        grad="emerald" label="طلابي"          value={ov?.students_total ?? 0}
              foot={<MiniFoot label="جديد هذا الشهر" value={`${newStudents}`} icon={UserPlus} />} />
        <Stat i={2} icon={ClipboardList} grad="amber"  label="تقارير معلّقة"  value={owed.length}
              foot={<MiniFoot label="مكتوبة" value={`${sessions.filter(s => s.status === 'done').length - owed.length}`} />} />
        <Stat i={3} icon={Clock}        grad="violet"  label="ساعات التدريس"  value={ov?.hours_month ?? 0} decimals={1}
              foot={<MiniFoot label="هذا الشهر" value="ساعة" />} />

        <Stat i={4} icon={Video}        grad="sky"     label="حصص قادمة"      value={upcoming.length}
              foot={<MiniFoot label="خلال أسبوعين" value={`${upcoming.filter(u => +new Date(u.starts_at) < Date.now() + 14 * 864e5).length}`} />} />
        <Stat i={5} icon={Target}       grad="emerald" label="نسبة الإتمام"   value={completion} suffix="%"
              foot={<Bar pct={completion} grad="emerald" />} />
        <Stat i={6} icon={Star}         grad="amber"   label="تقييمي"
              value={ov?.rating_count ? Number(ov.rating_avg ?? 0) : 0} decimals={1}
              foot={<MiniFoot label="تقييم" value={`${ov?.rating_count ?? 0}`} />} />
        <Stat i={7} icon={Wallet}       grad="rose"    label="ساعات محتسبة"   value={ov?.hours_month ?? 0} decimals={1}
              foot={<span className="text-[10.5px] text-slate-500 font-medium">الأجر يُحتسب لاحقاً</span>} />
      </div>

      {/* ═══ Row 3 — rhythm + schedule ═══ */}
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4 items-start [&>*]:min-w-0">

        <Rise>
          <Panel className="p-5 sm:p-6">
            <Head icon={TrendingUp} grad="sky" title="إيقاعك" note="الحصص المنتهية خلال 8 أسابيع" />
            <WeeklyBars data={weekly} />
          </Panel>
        </Rise>

        <Rise i={1}>
          <Panel className="p-5 sm:p-6">
            <Head icon={CalendarDays} grad="violet" title="الحصص القادمة"
                  action={<Link href="/teacher/classes" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">الكل</Link>} />
            {upcoming.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarPlus size={26} className="mx-auto text-slate-600 mb-2.5" />
                <p className="text-[13px] font-semibold text-slate-400">لا حصص قادمة</p>
                <p className="text-[11.5px] text-slate-600 mt-1">برمج حصة ليبدأ الجدول.</p>
              </div>
            ) : (
              // y, not x: under dir=rtl a positive x offset pushes each row out
              // past the right edge, and any row still below the fold stays
              // there — which showed up as a 46px horizontal scroll on mobile.
              <div className="space-y-2">
                {upcoming.slice(0, 5).map((s, i) => (
                  <motion.div key={s.id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.4 }}>
                    <Link href={`/teacher/classes/${s.id}`}
                          className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white/[.03] ring-1 ring-white/[.05]
                                     hover:bg-white/[.06] hover:ring-white/[.1] transition-all">
                      <div className={`w-1 h-11 rounded-full shrink-0 ${i === 0 ? 'bg-gradient-to-b from-[#5B5FEF] to-[#38BDF8]' : 'bg-white/10'}`} />
                      <div className="w-12 text-center shrink-0">
                        <div className="text-[10px] font-medium text-slate-500">
                          {new Date(s.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                        </div>
                        <div className="text-[15px] font-bold tabular-nums leading-tight">{fmtTime(s.starts_at)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[13.5px] truncate">{s.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Chip tone={s.status === 'live' ? 'ok' : 'muted'}>{STATUS_AR[s.status]}</Chip>
                          {s.level && <Chip>{s.level}</Chip>}
                          <span className="text-[10.5px] text-slate-500 font-medium">{s.duration_min}د</span>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Panel>
        </Rise>
      </div>

      {/* ═══ Quick actions ═══ */}
      <Rise>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
          {[
            { href: '/teacher/students',  icon: Users,         t: 'طلابي',      s: 'التقدّم والحضور',   g: 'emerald' as const },
            { href: '/teacher/classes',   icon: CalendarDays,  t: 'الجدول',     s: 'برمج وتابع',        g: 'sky' as const },
            { href: '/teacher/reports',   icon: ClipboardList, t: 'التقارير',   s: 'ما تم إنجازه',      g: 'amber' as const },
            { href: '/teacher/materials', icon: FolderOpen,    t: 'الملفات',    s: 'PDF · صوت · فيديو', g: 'rose' as const },
          ].map((l, i) => (
            <motion.div key={l.href} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Link href={l.href}>
                <Panel className="p-5 group" hover>
                  <span className={`inline-flex w-11 h-11 rounded-2xl bg-gradient-to-br ${GRAD[l.g]} items-center justify-center shadow-lg mb-3.5`}>
                    <l.icon size={19} />
                  </span>
                  <div className="font-bold text-[14.5px]">{l.t}</div>
                  <div className="text-[11.5px] text-slate-500 font-medium mt-0.5">{l.s}</div>
                  <ArrowLeft size={15} className="mt-3 text-slate-600 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                </Panel>
              </Link>
            </motion.div>
          ))}
        </div>
      </Rise>
    </div>
  )
}

/* ── Local pieces ────────────────────────────────────── */

function MiniFoot({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500">
      {Icon && <Icon size={11} />}
      <span>{label}</span>
      <span className="text-slate-300 font-semibold mr-auto">{value}</span>
    </div>
  )
}

function WeeklyBars({ data }: { data: { label: string; classes: number; hours: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.classes))
  const [hover, setHover] = useState<number | null>(null)
  // Grow on mount rather than on scroll. The observer-gated version left the
  // bars at zero height in every capture and in any tab that throttles
  // observers — and a chart that renders its axis but not its data is worse
  // than one that simply appears.
  const [grown, setGrown] = useState(false)
  useEffect(() => { const t = window.setTimeout(() => setGrown(true), 60); return () => window.clearTimeout(t) }, [])
  const seen = grown
  return (
    <div>
      <div className="flex items-stretch gap-1.5 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group"
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-lg transition-[height] duration-700 ease-[cubic-bezier(.22,1,.36,1)]
                            ${d.classes ? 'bg-gradient-to-t from-[#5B5FEF] to-[#38BDF8]' : 'bg-white/[.06]'}`}
                style={{
                  height: seen ? `${Math.max(4, (d.classes / max) * 100)}%` : '0%',
                  transitionDelay: `${i * 55}ms`,
                  opacity: hover === null || hover === i ? 1 : 0.4,
                }}
              />
            </div>
            <span className="text-[9.5px] font-medium text-slate-600 tabular-nums">{d.label}</span>
          </div>
        ))}
      </div>
      {hover !== null && (
        <div className="mt-3 text-center text-[12px] font-semibold text-slate-300">
          {data[hover].label} — <span className="text-white">{data[hover].classes} حصة</span>
          <span className="text-slate-500"> · {data[hover].hours} ساعة</span>
        </div>
      )}
    </div>
  )
}
