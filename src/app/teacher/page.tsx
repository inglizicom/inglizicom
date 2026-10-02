'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Video, Loader2, ArrowLeft, CalendarPlus, CalendarDays, Users, Star, Wallet,
  Clock, Activity, ExternalLink, MessageCircle, CheckCircle2, Circle, Sparkles, BarChart3,
  Quote, Trophy, ListChecks, GraduationCap, Layers, ClipboardList,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchMyClasses, fetchMyStudents, fetchReportsOwed, fetchSessions, fetchTeacherOverview, fetchTeacherProfileFull,
  type ClassSession, type MyClass, type MyStudent, type TeacherOverview, type TeacherProfileFull,
} from '@/lib/teachers'
import { businessToday, presetRange } from '@/lib/enrollment-metrics'
import { BarChart, Ring } from './_charts'
import { Rise } from './_ds'
import { DEMO_CLASSES, DEMO_OVERVIEW, DEMO_REPORTS_OWED, DEMO_SESSIONS, DEMO_STUDENTS, isTeacherDemo } from './_demo'
import { DEMO_PROFILE } from './profile/demoData'
import { DemoBanner, Stars, fmtTime, fromNow, STATUS_AR } from './_ui'
import {
  Btn, CardHead, Chip, Face, MoreLink, ShareBtn, Surface, CopyBtn, pctDelta, profileChecklist, publicProfileUrl,
} from './_kit'

/**
 * لوحة القيادة — the teacher's home.
 *
 * Read top to bottom it answers, in order: who am I and what is next (the dark
 * hero and its four numbers), what is in front of me (current group, next
 * class, this week), what does my week look like, how is it
 * trending, and who am I teaching. The side column is the teacher's shop
 * window — the public page, the rating that sells it, and what is still
 * missing from it — and stays in view while the work scrolls past.
 *
 * Every figure comes from the same calls the section pages use, so a number on
 * this page always matches the page it links to.
 */

const DAY = 864e5
const MONTH_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
                  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']

/** Monday 00:00 of the week holding `d` — the Moroccan working week. */
function weekStart(d: Date): Date {
  const t = new Date(d); t.setHours(0, 0, 0, 0)
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7))
  return t
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const hours   = (mins: number) => Math.round((mins / 60) * 10) / 10

const RELATION_AR: Record<string, string> = { assigned: 'مسنَد', class: 'في قسم', both: 'مسنَد · قسم' }

export default function TeacherDashboard() {
  const teacher = useTeacher()
  const [ov, setOv]             = useState<TeacherOverview | null>(null)
  const [full, setFull]         = useState<TeacherProfileFull | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [owed, setOwed]         = useState<ClassSession[]>([])
  const [students, setStudents] = useState<MyStudent[]>([])
  const [classes, setClasses]   = useState<MyClass[]>([])
  const [loading, setLoading]   = useState(true)
  const [demo, setDemo]         = useState(false)
  const [scale, setScale]       = useState<'week' | 'month'>('week')
  const [day, setDay]           = useState(() => new Date())

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      setDemo(true); setSessions(DEMO_SESSIONS); setOwed(DEMO_REPORTS_OWED)
      setStudents(DEMO_STUDENTS); setOv(DEMO_OVERVIEW); setFull(DEMO_PROFILE); setClasses(DEMO_CLASSES)
      setLoading(false); return
    }
    ;(async () => {
      const r = presetRange('month', businessToday())
      const [s, o, st, v, f, c] = await Promise.all([
        fetchSessions(teacher.id), fetchReportsOwed(teacher.id), fetchMyStudents(),
        fetchTeacherOverview(r.from, r.to), fetchTeacherProfileFull(teacher.id), fetchMyClasses(),
      ])
      if (!alive) return
      setSessions(s); setOwed(o); setStudents(st); setOv(v); setFull(f); setClasses(c); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  /* ── derived ─────────────────────────────────────────── */

  const now   = Date.now()
  // Anchors for the page's lifetime — a dashboard left open past midnight keeps its week.
  const today = useMemo(() => new Date(), [])
  const wk    = useMemo(() => weekStart(today), [today])

  const live = useMemo(() => sessions.filter(s => s.status !== 'cancelled'), [sessions])

  const upcoming = useMemo(
    () => live.filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'done')
              .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
    [live, now])

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wk.getTime() + i * DAY)
    return { date: d, items: live.filter(s => sameDay(new Date(s.starts_at), d))
                                 .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)) }
  }), [live, wk])

  const inRange = (from: Date, to: Date) =>
    live.filter(s => { const t = new Date(s.starts_at).getTime(); return t >= from.getTime() && t < to.getTime() })

  const thisWeek = inRange(wk, new Date(wk.getTime() + 7 * DAY)).length
  const lastWeek = inRange(new Date(wk.getTime() - 7 * DAY), wk).length

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const prevStart  = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const doneMins = (from: Date, to: Date) =>
    inRange(from, to).filter(s => s.status === 'done').reduce((a, s) => a + s.duration_min, 0)
  const monthMins = doneMins(monthStart, new Date(today.getFullYear(), today.getMonth() + 1, 1))
  const prevMins  = doneMins(prevStart, monthStart)

  const payModel  = teacher.profile?.pay_model ?? 'none'
  const rate      = teacher.profile?.hourly_rate_mad ?? null
  const canEarn   = !demo && payModel === 'hourly' && rate != null && rate > 0
  const earnings  = canEarn ? Math.round((monthMins / 60) * (rate as number)) : null

  const series = useMemo(() => {
    if (scale === 'week') {
      return Array.from({ length: 8 }, (_, i) => {
        const from = new Date(wk.getTime() - (7 - i) * 7 * DAY)
        const to   = new Date(from.getTime() + 7 * DAY)
        const done = live.filter(s => s.status === 'done' &&
          new Date(s.starts_at) >= from && new Date(s.starts_at) < to)
        return { label: `${from.getDate()}/${from.getMonth() + 1}`, value: done.length,
                 mins: done.reduce((a, s) => a + s.duration_min, 0) }
      })
    }
    return Array.from({ length: 6 }, (_, i) => {
      const from = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1)
      const to   = new Date(from.getFullYear(), from.getMonth() + 1, 1)
      const done = live.filter(s => s.status === 'done' &&
        new Date(s.starts_at) >= from && new Date(s.starts_at) < to)
      return { label: MONTH_AR[from.getMonth()], value: done.length,
               mins: done.reduce((a, s) => a + s.duration_min, 0) }
    })
  }, [scale, live, wk, today])

  const seriesNow  = series[series.length - 1]
  const seriesPrev = series[series.length - 2]

  const active    = students.filter(s => s.is_active)
  const roster    = ov?.roster
  const att       = ov?.period?.attendance
  const attRate   = att?.rate ?? full?.stats.attendance_rate ?? ov?.attendance_rate ?? null
  const ratingAvg = Number(full?.stats.rating_avg ?? ov?.rating_avg ?? 0)
  const ratingN   = Number(full?.stats.rating_count ?? ov?.rating_count ?? 0)
  const next      = upcoming[0]
  const selected  = week.find(w => sameDay(w.date, day)) ?? week[0]

  const prof      = full?.profile
  const name      = prof?.display_name || teacher.profile?.display_name || teacher.fullName || 'أستاذ'
  const firstName = name.split(' ')[0]
  const greeting  = today.getHours() < 12 ? 'صباح الخير' : 'مساء الخير'
  const publicUrl = demo ? '' : publicProfileUrl(teacher.id)
  const publicHref = demo ? '/teacher-showcase/demo' : `/teacher-showcase/${teacher.id}`
  const shareUrl   = publicUrl || (typeof window !== 'undefined' ? `${window.location.origin}${publicHref}` : '')

  const { items: checklist, pct: completion } = profileChecklist(prof ?? teacher.profile)

  const hiredAt     = prof?.hired_at ?? teacher.profile?.hired_at
  const memberSince = hiredAt ? new Date(hiredAt).toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' }) : null
  const weekHours   = hours(week.reduce((a, w) => a + w.items.reduce((b, s) => b + s.duration_min, 0), 0))
  const monthDone   = inRange(monthStart, new Date(today.getFullYear(), today.getMonth() + 1, 1))
                        .filter(s => s.status === 'done').length

  // The class to show first: my own active one with the soonest next session.
  const mainClass = classes
    .filter(c => c.is_owner && c.status === 'active' && !c.archived)
    .sort((a, b) => (a.next_session_at ? +new Date(a.next_session_at) : Infinity)
                  - (b.next_session_at ? +new Date(b.next_session_at) : Infinity))[0]

  const heroTiles = [
    { icon: Users, label: 'طلاب نشطون', href: '/teacher/students',
      value: String(roster?.unique_students ?? active.length), delta: null as number | null },
    { icon: CalendarDays, label: 'حصص الأسبوع', href: '/teacher/classes',
      value: String(thisWeek), delta: pctDelta(thisWeek, lastWeek) },
    canEarn
      ? { icon: Wallet, label: 'أرباح الشهر (د)', href: '/teacher/earnings',
          value: (earnings ?? 0).toLocaleString('en-US'), delta: pctDelta(monthMins, prevMins) }
      : { icon: Clock, label: 'ساعات الشهر', href: '/teacher/earnings',
          value: String(hours(monthMins)), delta: pctDelta(monthMins, prevMins) },
    { icon: Star, label: ratingN > 0 ? `${ratingN} تقييماً` : 'التقييم', href: '/teacher/reviews',
      value: ratingN > 0 ? ratingAvg.toFixed(1) : '—', delta: null },
  ]

  const teachChips = [...new Set([...(prof?.specialties ?? []), ...(prof?.teaches ?? [])])]
  const levels     = prof?.levels ?? teacher.profile?.levels ?? []
  const reviews    = (full?.testimonials ?? []).filter(t => t.comment?.trim()).slice(0, 2)

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#94A3B8]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري تجهيز لوحتك…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      {/* ══ Hero — who I am, my four numbers, the moves that matter ══ */}
      <Rise>
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white
                            shadow-[0_30px_60px_-30px_rgba(30,58,138,.6)]">
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full
                                      bg-[radial-gradient(circle,rgba(251,191,36,.22),transparent_65%)]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 right-1/3 w-[340px] h-[340px] rounded-full
                                      bg-[radial-gradient(circle,rgba(255,255,255,.10),transparent_65%)]" />

          <div className="relative grid xl:grid-cols-[1fr_auto] gap-6 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
              <Face name={name} url={prof?.avatar_url ?? teacher.profile?.avatar_url} size={96}
                    className="ring-4 ring-white/25 shadow-xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11.5px] font-bold text-emerald-200 ring-1 ring-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {teacher.profile?.is_active === false ? 'موقوف' : 'نشط'}
                  </span>
                  {full?.stats.is_top_rated && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 px-2.5 py-1 text-[11.5px] font-extrabold text-blue-900">
                      <Trophy size={12} /> من الأفضل تقييماً
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-tight text-white truncate">{name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-blue-100/90">
                  <span>{prof?.headline || teacher.profile?.headline || 'أستاذ في إنجليزي.كوم'}</span>
                  {levels.length > 0 && <><span className="w-1 h-1 rounded-full bg-blue-200/60" /><span dir="ltr">{levels.join(' · ')}</span></>}
                  {memberSince && <><span className="w-1 h-1 rounded-full bg-blue-200/60" /><span>عضو منذ {memberSince}</span></>}
                </div>
                {prof?.tagline && <p className="mt-2 text-[13px] text-blue-100/85">“{prof.tagline}”</p>}

                <div className="flex flex-wrap gap-2 mt-4">
                  <Btn href="/teacher/classes?new=1" icon={CalendarPlus} kind="gold">إضافة درس</Btn>
                  <Btn href="/teacher/classes" icon={CalendarDays} kind="glass">إدارة الحصص</Btn>
                  <Btn href="/teacher/students" icon={MessageCircle} kind="glass">تواصل مع الطلاب</Btn>
                  <ShareBtn url={shareUrl} title={name} kind="glass" />
                </div>
              </div>
            </div>

            {/* the four numbers, on glass */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xl:w-[460px] self-center">
              {heroTiles.map(t => (
                <Link key={t.label} href={t.href}
                      className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur p-3 text-center hover:bg-white/15 transition">
                  <span className="mx-auto w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center shadow-md">
                    <t.icon size={18} />
                  </span>
                  <div className="mt-2.5 text-[22px] font-extrabold tabular-nums leading-none text-white">{t.value}</div>
                  <div className="mt-1.5 text-[11px] font-bold text-blue-100/90 leading-tight">{t.label}</div>
                  {t.delta != null && (
                    <div className={`mt-1 text-[10.5px] font-bold ${t.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`} dir="ltr">
                      {t.delta >= 0 ? '+' : ''}{t.delta}%
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {owed.length > 0 && (
            <Link href="/teacher/reports"
                  className="relative flex items-center gap-2 border-t border-white/10 bg-white/5 px-5 sm:px-7 py-3 text-[12.5px] font-bold text-amber-200 hover:bg-white/10 transition-colors">
              <AlertTriangle size={15} className="text-amber-300" />
              {owed.length} {owed.length === 1 ? 'حصة منتهية بدون تقرير' : 'حصص منتهية بدون تقارير'} — اكتبها الآن
              <ArrowLeft size={14} className="mr-auto" />
            </Link>
          )}
        </section>
      </Rise>

      {/* ══ Current group · next class · this week ══ */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Rise>
          <Surface className="p-5 h-full flex flex-col">
            <CardHead icon={Layers} tone="sky" title="قسمي الحالي" action={<MoreLink href="/teacher/groups">الأقسام</MoreLink>} />
            {mainClass ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-700/30">
                    <Users size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold truncate">{mainClass.title}</div>
                    <div className="text-[12px] font-semibold text-[#64748B] truncate">
                      {[mainClass.course_title, STATUS_AR[mainClass.mode], mainClass.level].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12px] font-bold text-[#64748B]">
                  <span>المقاعد المشغولة</span>
                  <span className="text-[#1E3A8A] tabular-nums">{mainClass.active_count}{mainClass.capacity ? ` / ${mainClass.capacity}` : ''}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#EEF2F7] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-700 transition-all duration-700"
                       style={{ width: `${mainClass.capacity ? Math.min(100, (mainClass.active_count / mainClass.capacity) * 100) : 100}%` }} />
                </div>
                <div className="mt-2.5 text-[11.5px] font-semibold text-[#94A3B8]">
                  {mainClass.sessions_done} حصة منجزة
                  {mainClass.waitlisted_count > 0 && ` · ${mainClass.waitlisted_count} في الانتظار`}
                  {mainClass.reports_owed > 0 && ` · ${mainClass.reports_owed} تقرير معلّق`}
                </div>
                <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                  <Btn href={`/teacher/groups/${mainClass.id}`}>إدارة القسم</Btn>
                  <Btn href="/teacher/groups" kind="ghost">كل الأقسام</Btn>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <Layers size={24} className="text-[#CBD5E1] mb-2" />
                <p className="text-[13px] font-semibold text-[#64748B]">لا أقسام نشطة بعد</p>
                <p className="text-[11.5px] text-[#94A3B8] mt-1">تُسنَد الأقسام إليك من الإدارة.</p>
              </div>
            )}
          </Surface>
        </Rise>

        <Rise i={1}>
          <Surface className="p-5 h-full flex flex-col">
            <CardHead icon={Video} tone="violet" title="الحصة التالية"
                      action={next && <Chip tone="sky">{sameDay(new Date(next.starts_at), today) ? 'اليوم' : fromNow(next.starts_at)}</Chip>} />
            {next ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                    <Video size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold leading-snug line-clamp-2">{next.title}</div>
                    {next.status === 'live' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                        <Circle size={7} className="fill-current animate-pulse" /> جارية الآن
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2 text-[12.5px] font-bold tabular-nums">
                    <Clock size={14} className="text-blue-600" />
                    {fmtTime(next.starts_at)} – {fmtTime(new Date(new Date(next.starts_at).getTime() + next.duration_min * 60000).toISOString())}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2 text-[12.5px] font-bold">
                    <Users size={14} className="text-blue-600" /> {STATUS_AR[next.mode]}
                  </span>
                  {next.level && <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-2 text-[12.5px] font-bold text-blue-700">{next.level}</span>}
                </div>
                <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                  {next.meeting_url
                    ? <Btn href={next.meeting_url} external icon={Video} kind="gold">ادخل للحصة</Btn>
                    : <Btn href={`/teacher/classes/${next.id}`} kind="gold">فتح الحصة</Btn>}
                  <Btn href={`/teacher/classes/${next.id}`} kind="ghost">التفاصيل</Btn>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <CalendarPlus size={24} className="text-[#CBD5E1] mb-2" />
                <p className="text-[13px] font-semibold text-[#64748B]">لا حصص قادمة</p>
                <Btn href="/teacher/classes?new=1" icon={CalendarPlus} className="mt-3">إضافة درس</Btn>
              </div>
            )}
          </Surface>
        </Rise>

        <Rise i={2} className="md:col-span-2 xl:col-span-1">
          <Surface className="p-5 h-full">
            <CardHead icon={CalendarDays} tone="gold" title="هذا الأسبوع"
                      action={<MoreLink href="/teacher/classes">الجدول</MoreLink>} />
            <div className="grid grid-cols-7 gap-1">
              {week.map(w => {
                const on = sameDay(w.date, selected.date)
                return (
                  <button key={w.date.toISOString()}
                          onClick={() => { setDay(w.date); document.getElementById('week')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                          className={`rounded-xl py-2 flex flex-col items-center transition
                                      ${on ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-700/30'
                                           : 'text-[#64748B] hover:bg-[#F4F7FC]'}`}>
                    <span className={`text-[10px] font-bold ${on ? 'text-blue-100' : 'text-[#94A3B8]'}`}>
                      {w.date.toLocaleDateString('ar-MA', { weekday: 'short' })}
                    </span>
                    <span className="text-[15px] font-extrabold tabular-nums">{w.date.getDate()}</span>
                    <span className={`mt-0.5 w-1 h-1 rounded-full ${w.items.length ? (on ? 'bg-amber-300' : 'bg-blue-500') : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><CalendarDays size={15} /></span>
                <span className="text-[13px] font-bold">{thisWeek} حصص هذا الأسبوع</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><Clock size={15} /></span>
                <span className="text-[13px] font-bold">{weekHours} ساعة مبرمجة</span>
              </div>
              <Link href="/teacher/reports"
                    className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2.5 hover:ring-blue-200 transition">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${owed.length ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                  <ClipboardList size={15} />
                </span>
                <span className="text-[13px] font-bold">{owed.length ? `${owed.length} تقارير معلّقة` : 'كل التقارير مكتوبة'}</span>
              </Link>
            </div>
          </Surface>
        </Rise>
      </div>

      {/* ══ Work (main) + shop window (aside) ══ */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-8 space-y-6 min-w-0">

          {/* this week */}
          <Rise>
            <Surface id="week" className="p-5 sm:p-6 scroll-mt-24">
              <CardHead icon={CalendarDays} tone="sky" title="جدول هذا الأسبوع"
                        note={`${thisWeek} حصة · ${week.filter(w => w.items.length).length} أيام عمل`}
                        action={<MoreLink href="/teacher/classes">كل الحصص</MoreLink>} />

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {week.map(w => {
                  const on = sameDay(w.date, selected.date)
                  const isToday = sameDay(w.date, today)
                  return (
                    <button key={w.date.toISOString()} onClick={() => setDay(w.date)}
                            className={`relative rounded-2xl py-2.5 sm:py-3 flex flex-col items-center gap-0.5 transition
                                        ${on ? 'bg-[#1E3A8A] text-white shadow-[0_10px_20px_-12px_rgba(30,58,138,.7)]'
                                             : 'bg-[#F4F7FC] text-[#475569] hover:bg-[#EEF2F7]'}`}>
                      <span className={`text-[10.5px] sm:text-[11px] font-bold ${on ? 'text-white/85' : 'text-[#94A3B8]'}`}>
                        {w.date.toLocaleDateString('ar-MA', { weekday: 'short' })}
                      </span>
                      <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums leading-none">{w.date.getDate()}</span>
                      <span className="h-1.5 flex gap-0.5 mt-1">
                        {w.items.slice(0, 3).map(s => (
                          <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-[#FCD34D]' : 'bg-[#F59E0B]'}`} />
                        ))}
                      </span>
                      {isToday && !on && <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5">
                {selected.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E2E8F0] py-8 text-center">
                    <p className="text-[13.5px] font-semibold text-[#94A3B8]">
                      لا حصص {sameDay(selected.date, today) ? 'اليوم' : 'في هذا اليوم'}.
                    </p>
                    <Link href="/teacher/classes?new=1"
                          className="inline-flex items-center gap-1.5 mt-3 text-[12.5px] font-bold text-[#B45309] hover:text-[#1E3A8A]">
                      <CalendarPlus size={14} /> إضافة درس
                    </Link>
                  </div>
                ) : (
                  <ol className="space-y-2">
                    {selected.items.map(s => {
                      const past = new Date(s.starts_at).getTime() + s.duration_min * 60000 < now
                      return (
                        <li key={s.id}>
                          <Link href={`/teacher/classes/${s.id}`}
                                className="group flex items-center gap-3 sm:gap-4 rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0]
                                           px-3.5 py-3 hover:ring-[#CBD5E1] hover:bg-white transition">
                            <div className="w-[54px] shrink-0 text-center">
                              <div className="text-[15px] font-extrabold tabular-nums">{fmtTime(s.starts_at)}</div>
                              <div className="text-[10.5px] font-semibold text-[#94A3B8]">{s.duration_min} د</div>
                            </div>
                            <span className={`w-1 self-stretch rounded-full ${past ? 'bg-[#E2E8F0]' : 'bg-[#F59E0B]'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-[14px] font-bold truncate ${past ? 'text-[#64748B]' : ''}`}>{s.title}</div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <Chip tone={s.mode === 'private' ? 'violet' : 'sky'}>{STATUS_AR[s.mode]}</Chip>
                                {s.level && <Chip>{s.level}</Chip>}
                                <span className="text-[11px] font-semibold text-[#94A3B8]">{STATUS_AR[s.status]}</span>
                              </div>
                            </div>
                            {s.meeting_url && !past
                              ? <span className="hidden sm:inline-flex items-center gap-1 text-[12px] font-bold text-[#B45309]"><Video size={14} /> رابط</span>
                              : null}
                            <ArrowLeft size={15} className="text-[#CBD5E1] group-hover:text-[#1E3A8A] transition-colors shrink-0" />
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            </Surface>
          </Rise>

          {/* performance */}
          <Rise>
            <Surface className="p-5 sm:p-6">
              <CardHead icon={BarChart3} tone="gold" title="الأداء"
                        note={scale === 'week' ? 'الحصص المنجزة · آخر 8 أسابيع' : 'الحصص المنجزة · آخر 6 أشهر'}
                        action={
                          <div className="inline-flex gap-1 bg-[#EEF2F7] rounded-full p-1" role="tablist" aria-label="المقياس">
                            {([['week', 'أسبوعي'], ['month', 'شهري']] as const).map(([id, label]) => (
                              <button key={id} role="tab" aria-selected={scale === id} onClick={() => setScale(id)}
                                      className={`px-3 py-1 rounded-full text-[11.5px] font-bold transition-colors
                                                  ${scale === id ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        } />

              <div className="grid sm:grid-cols-[1fr_190px] gap-6 items-center">
                <div className="min-w-0">
                  <BarChart key={scale} data={series.map(s => ({ label: s.label, value: s.value }))}
                            height={170} color="#1D4ED8" unit=" حصة" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
                  <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                    <div className="text-[11px] font-bold text-[#94A3B8]">{scale === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[22px] font-extrabold tabular-nums leading-none">{seriesNow?.value ?? 0}</span>
                      <span className="text-[11px] font-bold text-[#94A3B8]">حصة</span>
                    </div>
                    {seriesPrev && pctDelta(seriesNow.value, seriesPrev.value) != null && (
                      <div className={`text-[11px] font-bold mt-1 ${seriesNow.value >= seriesPrev.value ? 'text-emerald-700' : 'text-rose-700'}`} dir="ltr">
                        {seriesNow.value >= seriesPrev.value ? '+' : ''}{pctDelta(seriesNow.value, seriesPrev.value)}%
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                    <div className="text-[11px] font-bold text-[#94A3B8]">ساعات</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[22px] font-extrabold tabular-nums leading-none">{hours(seriesNow?.mins ?? 0)}</span>
                      <span className="text-[11px] font-bold text-[#94A3B8]">س</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3 flex items-center gap-3">
                    {attRate != null
                      ? <Ring pct={Math.round(Number(attRate))} size={58} color="#047857" />
                      : <span className="text-[22px] font-extrabold text-[#CBD5E1]">—</span>}
                    <span className="text-[11px] font-bold text-[#94A3B8] leading-tight">حضور<br />الشهر</span>
                  </div>
                </div>
              </div>
            </Surface>
          </Rise>

          {/* students + upcoming */}
          <div className="grid md:grid-cols-2 gap-6">
            <Rise>
              <Surface className="p-5 sm:p-6 h-full">
                <CardHead icon={Users} tone="violet" title="طلابي الحاليون" note={`${active.length} طالباً نشطاً`}
                          action={<MoreLink href="/teacher/students">الكل</MoreLink>} />
                {active.length === 0 ? (
                  <p className="text-[13px] text-[#94A3B8] py-6 text-center">لم يُسنَد إليك طلاب بعد.</p>
                ) : (
                  <ul className="space-y-1">
                    {active.slice(0, 6).map(st => (
                      <li key={st.id}>
                        <Link href="/teacher/students"
                              className="flex items-center gap-3 rounded-xl px-2 py-2 -mx-2 hover:bg-[#F8FAFC] transition-colors">
                          <Face name={st.full_name} url={st.avatar_url} size={36} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13.5px] font-bold truncate">{st.full_name}</div>
                            <div className="text-[11.5px] font-semibold text-[#94A3B8] truncate">
                              {st.classes?.[0]?.title ?? st.course ?? '—'}
                            </div>
                          </div>
                          {st.relationship && <Chip>{RELATION_AR[st.relationship]}</Chip>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {active.length > 6 && (
                  <Link href="/teacher/students" className="block mt-3 text-center text-[12px] font-bold text-[#64748B] hover:text-[#1E3A8A]">
                    +{active.length - 6} طلاب آخرين
                  </Link>
                )}
              </Surface>
            </Rise>

            <Rise i={1}>
              <Surface className="p-5 sm:p-6 h-full">
                <CardHead icon={Clock} tone="emerald" title="الحصص القادمة" note={`${upcoming.length} مبرمجة`}
                          action={<MoreLink href="/teacher/classes">الجدول</MoreLink>} />
                {upcoming.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-[13px] text-[#94A3B8]">لا حصص قادمة.</p>
                    <Btn href="/teacher/classes?new=1" icon={CalendarPlus} className="mt-3">إضافة درس</Btn>
                  </div>
                ) : (
                  <ol className="space-y-2.5">
                    {upcoming.slice(0, 5).map(s => {
                      const d = new Date(s.starts_at)
                      return (
                        <li key={s.id}>
                          <Link href={`/teacher/classes/${s.id}`} className="group flex items-center gap-3">
                            <div className="w-12 shrink-0 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] py-1.5 text-center">
                              <div className="text-[10px] font-bold text-[#94A3B8]">{d.toLocaleDateString('ar-MA', { weekday: 'short' })}</div>
                              <div className="text-[15px] font-extrabold tabular-nums leading-tight">{d.getDate()}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13.5px] font-bold truncate group-hover:text-[#B45309] transition-colors">{s.title}</div>
                              <div className="text-[11.5px] font-semibold text-[#94A3B8]">
                                {fmtTime(s.starts_at)} · {s.duration_min} د · {fromNow(s.starts_at)}
                              </div>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </Surface>
            </Rise>
          </div>
        </div>

        {/* ══ Aside — the shop window, sticky on desktop ══ */}
        <aside className="lg:col-span-4 space-y-6 min-w-0 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-104px)]
                          lg:overflow-y-auto no-scrollbar lg:pb-2">

          {/* public profile preview */}
          <Rise>
            <Surface className="overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-blue-50 via-white to-amber-50/60">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[10.5px] font-bold text-blue-700 mb-3">
                  <Sparkles size={11} /> ملفك العام
                </span>
                <div className="flex items-center gap-3">
                  <Face name={name} url={prof?.avatar_url ?? teacher.profile?.avatar_url} size={64}
                        className="ring-4 ring-white shadow-md" />
                  {ratingN > 0 && (
                    <div className="pb-1 flex items-center gap-1.5">
                      <Stars value={ratingAvg} size={12} />
                      <span className="text-[12px] font-bold tabular-nums">{ratingAvg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-[16px] font-extrabold leading-tight">{name}</div>
                <p className="text-[12.5px] font-medium text-[#64748B] mt-1 line-clamp-2">
                  {prof?.tagline || prof?.headline || teacher.profile?.headline || 'أضف عنواناً مهنياً ليظهر هنا.'}
                </p>
                {levels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3" dir="ltr">
                    {levels.map(l => <span key={l} className="rounded-md bg-[#EEF2F7] px-2 py-0.5 text-[11px] font-bold text-[#475569]">{l}</span>)}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <Btn href={publicHref} icon={ExternalLink}>عرض الملف العام</Btn>
                  <ShareBtn url={shareUrl} title={name} />
                </div>
                {publicUrl && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-2">
                    <span className="flex-1 min-w-0 truncate text-[11.5px] font-semibold text-[#64748B]" dir="ltr">{publicUrl.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            </Surface>
          </Rise>

          {/* setup checklist */}
          {completion < 100 && (
            <Rise>
              <Surface className="p-5">
                <CardHead icon={ListChecks} tone="emerald" title="أكمل ملفك"
                          note="الملف الكامل يجذب طلاباً أكثر" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 rounded-full bg-[#EEF2F7] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition-all duration-700"
                         style={{ width: `${completion}%` }} />
                  </div>
                  <span className="text-[13px] font-extrabold tabular-nums">{completion}%</span>
                </div>
                <ul className="space-y-1.5">
                  {checklist.map(c => (
                    <li key={c.label}>
                      <Link href="/teacher/profile?edit=1"
                            className={`flex items-center gap-2.5 rounded-lg px-1 py-1 text-[12.5px] font-semibold transition-colors
                                        ${c.done ? 'text-[#94A3B8]' : 'text-[#334155] hover:text-[#B45309]'}`}>
                        {c.done
                          ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          : <Circle size={16} className="text-[#CBD5E1] shrink-0" />}
                        <span className={c.done ? 'line-through decoration-[#CBD5E1]' : ''}>{c.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Surface>
            </Rise>
          )}

          {/* rating + recent reviews */}
          <Rise>
            <Surface className="p-5">
              <CardHead icon={Star} tone="gold" title="التقييمات"
                        action={<MoreLink href="/teacher/reviews">الكل</MoreLink>} />
              {ratingN === 0 ? (
                <p className="text-[12.5px] text-[#94A3B8] leading-relaxed">
                  لا تقييمات بعد. يقيّمك الطلاب من فضائهم بعد الحصص — شارك ملفك ليرى الزوار تقييماتك فور وصولها.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-[40px] font-extrabold tracking-tight leading-none tabular-nums">{ratingAvg.toFixed(1)}</div>
                    <div>
                      <Stars value={ratingAvg} size={15} />
                      <div className="text-[11.5px] font-semibold text-[#94A3B8] mt-1">{ratingN} تقييماً منشوراً</div>
                    </div>
                  </div>
                  {full && (
                    <div className="space-y-1.5 mt-4">
                      {[5, 4, 3, 2, 1].map(n => {
                        const c = full.rating_breakdown?.[String(n)] ?? 0
                        const total = Object.values(full.rating_breakdown ?? {}).reduce((a, b) => a + b, 0) || 1
                        return (
                          <div key={n} className="flex items-center gap-2 text-[11px] font-bold text-[#64748B]">
                            <span className="w-3 tabular-nums">{n}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden">
                              <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${(c / total) * 100}%` }} />
                            </div>
                            <span className="w-6 text-left tabular-nums">{c}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {reviews.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {reviews.map(t => (
                        <figure key={t.id} className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
                          <Quote size={14} className="text-[#CBD5E1] mb-1.5" />
                          <blockquote className="text-[12.5px] leading-relaxed text-[#334155] line-clamp-3">{t.comment}</blockquote>
                          <figcaption className="flex items-center gap-2 mt-2">
                            <span className="text-[11.5px] font-bold">{t.student_name ?? 'طالب'}</span>
                            <Stars value={t.rating} size={10} />
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Surface>
          </Rise>

          {/* what I teach */}
          <Rise>
            <Surface className="p-5">
              <CardHead icon={GraduationCap} tone="violet" title="ما أُدرّسه"
                        action={<MoreLink href="/teacher/profile?edit=1">تعديل</MoreLink>} />
              {teachChips.length === 0 && (prof?.competences?.length ?? 0) === 0 ? (
                <p className="text-[12.5px] text-[#94A3B8] leading-relaxed">
                  حدّد تخصصاتك ليعرف الطلاب إن كنت الأستاذ المناسب لهم.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teachChips.map(t => (
                    <span key={t} className="rounded-full bg-white ring-1 ring-[#E2E8F0] px-3 py-1.5 text-[12.5px] font-bold text-[#334155]">{t}</span>
                  ))}
                  {(prof?.competences ?? []).slice(0, 4).map(t => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[12.5px] font-bold text-[#B45309]">
                      <Sparkles size={11} /> {t}
                    </span>
                  ))}
                </div>
              )}
              {publicUrl && <div className="mt-4"><CopyBtn text={publicUrl} label="نسخ رابط ملفي" /></div>}
            </Surface>
          </Rise>
        </aside>
      </div>

      {/* ══ Closing banner — a word of encouragement, and the one move that grows the roster ══ */}
      <Rise>
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 text-white px-6 py-6 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 w-64 h-64 rounded-full
                                      bg-[radial-gradient(circle,rgba(251,191,36,.25),transparent_65%)]" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <span className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900
                             flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy size={28} />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-[19px] sm:text-[21px] font-extrabold text-white">عمل رائع يا {firstName}!</h2>
              <p className="mt-1 text-[13px] text-blue-100">
                {monthDone} حصة منجزة هذا الشهر
                {attRate != null && ` بنسبة حضور ${Math.round(Number(attRate))}%`}. شارك ملفك ليصل إلى طلاب جدد.
              </p>
            </div>
            <ShareBtn url={shareUrl} title={name} kind="gold" label="شارك ملفك العام" />
          </div>
        </section>
      </Rise>
    </div>
  )
}
