'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Video, Loader2, ArrowLeft, CalendarPlus, CalendarDays, Users, Star, Wallet,
  Clock, ExternalLink, CheckCircle2, Sparkles, ListChecks, Layers, ClipboardList, FolderOpen,
  UserRound, CalendarClock, Hourglass, BookOpen,
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
  Btn, Face, HelpBanner, SectionHead, ShareBtn, StatCard, StatusPill, Surface, TONE, type Tone,
  pctDelta, profileChecklist, publicProfileUrl,
} from './_kit'

/**
 * لوحة القيادة — the teacher's home, laid out like a modern school portal.
 *
 * Top to bottom: a welcome line with today's date and the one action that
 * matters (add a lesson); four stat cards, each with a way in; my groups and
 * what needs my attention; what is coming, what just happened and how
 * attendance is going; the students I teach; then performance, the public
 * page and quick links. Every number comes from the same calls the section
 * pages use, so it always matches the page it links to.
 */

const DAY = 864e5

/** Monday 00:00 of the week holding `d` — the Moroccan working week. */
function weekStart(d: Date): Date {
  const t = new Date(d); t.setHours(0, 0, 0, 0)
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7))
  return t
}
const hours = (mins: number) => Math.round((mins / 60) * 10) / 10
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })

const RELATION: Record<string, { label: string; tone: 'info' | 'ok' | 'warn' }> = {
  assigned: { label: 'مسنَد', tone: 'info' },
  class:    { label: 'في قسم', tone: 'ok' },
  both:     { label: 'مسنَد · قسم', tone: 'warn' },
}

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

  const inRange = (from: Date, to: Date) =>
    live.filter(s => { const t = new Date(s.starts_at).getTime(); return t >= from.getTime() && t < to.getTime() })

  const thisWeek = inRange(wk, new Date(wk.getTime() + 7 * DAY)).length
  const lastWeek = inRange(new Date(wk.getTime() - 7 * DAY), wk).length

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonth  = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const prevStart  = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const doneIn = (from: Date, to: Date) => inRange(from, to).filter(s => s.status === 'done')
  const monthMins = doneIn(monthStart, nextMonth).reduce((a, s) => a + s.duration_min, 0)
  const prevMins  = doneIn(prevStart, monthStart).reduce((a, s) => a + s.duration_min, 0)

  const payModel = teacher.profile?.pay_model ?? 'none'
  const rate     = teacher.profile?.hourly_rate_mad ?? null
  const canEarn  = !demo && payModel === 'hourly' && rate != null && rate > 0
  const earnings = canEarn ? Math.round((monthMins / 60) * (rate as number)) : null

  const weekly = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const from = new Date(wk.getTime() - (7 - i) * 7 * DAY)
    const to   = new Date(from.getTime() + 7 * DAY)
    const n = live.filter(s => s.status === 'done' && new Date(s.starts_at) >= from && new Date(s.starts_at) < to).length
    return { label: `${from.getDate()}/${from.getMonth() + 1}`, value: n }
  }), [live, wk])

  const active    = students.filter(s => s.is_active)
  const roster    = ov?.roster
  const att       = ov?.period?.attendance
  const attRate   = att?.rate ?? full?.stats.attendance_rate ?? ov?.attendance_rate ?? null
  const ratingAvg = Number(full?.stats.rating_avg ?? ov?.rating_avg ?? 0)
  const ratingN   = Number(full?.stats.rating_count ?? ov?.rating_count ?? 0)
  const next      = upcoming[0]

  const prof       = full?.profile
  const name       = prof?.display_name || teacher.profile?.display_name || teacher.fullName || 'أستاذ'
  const firstName  = name.split(' ')[0]
  const publicHref = demo ? '/teacher-showcase/demo' : `/teacher-showcase/${teacher.id}`
  const shareUrl   = demo
    ? (typeof window !== 'undefined' ? `${window.location.origin}${publicHref}` : '')
    : publicProfileUrl(teacher.id)
  const check      = profileChecklist(prof ?? teacher.profile)
  const teachChips = [...new Set([...(prof?.specialties ?? []), ...(prof?.teaches ?? [])])].slice(0, 6)

  const myClasses = classes
    .filter(c => c.status === 'active' && !c.archived)
    .sort((a, b) => (a.next_session_at ? +new Date(a.next_session_at) : Infinity)
                  - (b.next_session_at ? +new Date(b.next_session_at) : Infinity))

  // What needs me — the reference's "announcements", made of my own data.
  const alerts: { icon: typeof Star; tone: Tone; title: string; when?: string; text: string; href: string; link: string }[] = []
  if (owed.length) alerts.push({ icon: AlertTriangle, tone: 'rose', title: `${owed.length} تقارير معلّقة`,
    when: shortDate(owed[0].starts_at), text: 'اكتب تقارير الحصص المنتهية ليطّلع عليها الطلاب والإدارة.', href: '/teacher/reports', link: 'اكتب الآن' })
  if (next) alerts.push({ icon: Video, tone: 'sky', title: 'حصتك القادمة', when: fromNow(next.starts_at),
    text: `${next.title} · ${fmtTime(next.starts_at)}`, href: `/teacher/classes/${next.id}`, link: 'التفاصيل' })
  if (check.pct < 100) alerts.push({ icon: ListChecks, tone: 'emerald', title: `ملفك مكتمل بنسبة ${check.pct}%`,
    text: 'الملف الكامل يجذب طلاباً أكثر — بقيت خطوات قليلة.', href: '/teacher/profile?edit=1', link: 'أكمل الملف' })
  const lastReview = (full?.testimonials ?? []).find(t => t.comment?.trim())
  if (lastReview) alerts.push({ icon: Star, tone: 'gold', title: 'تقييم جديد', when: shortDate(lastReview.created_at),
    text: `«${lastReview.comment}»`, href: '/teacher/reviews', link: 'كل التقييمات' })

  // Recent activity: what just happened, newest first.
  const activity = [
    ...live.filter(s => s.status === 'done' && new Date(s.starts_at).getTime() > now - 21 * DAY)
      .map(s => ({ icon: CheckCircle2, tone: 'emerald' as Tone, title: 'حصة منجزة', sub: s.title, at: s.starts_at })),
    ...(full?.testimonials ?? []).map(t => ({ icon: Star, tone: 'gold' as Tone, title: 'تقييم جديد',
      sub: `${t.student_name ?? 'طالب'} · ${t.rating} نجوم`, at: t.created_at })),
    ...owed.map(s => ({ icon: ClipboardList, tone: 'rose' as Tone, title: 'تقرير مطلوب', sub: s.title, at: s.starts_at })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 5)

  const attRows = att && att.marks > 0 ? [
    { label: 'حاضر',  n: att.present, bar: 'bg-emerald-500' },
    { label: 'متأخر', n: att.late,    bar: 'bg-blue-500' },
    { label: 'غائب',  n: att.absent,  bar: 'bg-rose-500' },
  ] : []

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

      {/* ══ Welcome ══ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#1E3A8A]">
            مرحباً بعودتك، {firstName}! 👋
          </h1>
          <p className="mt-1 text-[14px] text-[#64748B]">إليك نظرة على حصصك وطلابك هذا الأسبوع.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-[#D6DFEC] px-3.5 py-2.5 text-[13px] font-bold text-[#334155] shadow-sm">
            <CalendarDays size={16} className="text-blue-600" />
            {today.toLocaleDateString('ar-MA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <Btn href="/teacher/classes?new=1" icon={CalendarPlus} kind="gold">إضافة درس</Btn>
        </div>
      </div>

      {/* ══ Four stat cards ══ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Rise i={0}><StatCard icon={Users} tone="stone" label="طلاب نشطون"
          value={roster?.unique_students ?? active.length}
          sub={roster ? `${roster.class_seats} مقعد · ${roster.assigned_students} مسنَد` : 'طلابك الحاليون'}
          href="/teacher/students" link="عرض كل الطلاب" /></Rise>
        <Rise i={1}><StatCard icon={CalendarDays} tone="emerald" label="حصص هذا الأسبوع"
          value={thisWeek}
          sub={pctDelta(thisWeek, lastWeek) != null ? `${lastWeek} الأسبوع الماضي (${pctDelta(thisWeek, lastWeek)! >= 0 ? '+' : ''}${pctDelta(thisWeek, lastWeek)}%)` : `${lastWeek} الأسبوع الماضي`}
          href="/teacher/classes" link="عرض الجدول" /></Rise>
        <Rise i={2}>{canEarn
          ? <StatCard icon={Wallet} tone="violet" label="أرباح هذا الشهر" value={<>{(earnings ?? 0).toLocaleString('en-US')} <span className="text-[14px] text-[#94A3B8]">درهم</span></>}
              sub={`${hours(monthMins)} ساعة منجزة`} href="/teacher/earnings" link="عرض الأرباح" />
          : <StatCard icon={Clock} tone="violet" label="ساعات هذا الشهر" value={<>{hours(monthMins)} <span className="text-[14px] text-[#94A3B8]">ساعة</span></>}
              sub={prevMins ? `${hours(prevMins)} الشهر الماضي` : 'الأجر يحدده المكتب'} href="/teacher/earnings" link="عرض الأرباح" />}
        </Rise>
        <Rise i={3}><StatCard icon={Star} tone="gold" label="متوسط التقييم"
          value={ratingN > 0 ? <>{ratingAvg.toFixed(1)} <span className="text-[14px] text-[#94A3B8]">/ 5</span></> : '—'}
          sub={ratingN > 0 ? `من ${ratingN} تقييماً` : 'لا تقييمات بعد'}
          href="/teacher/reviews" link="عرض التقييمات" /></Rise>
      </div>

      {/* ══ My groups + what needs me ══ */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-8">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="نظرة على أقسامي" href="/teacher/groups" link="كل الأقسام" />
            {myClasses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] py-10 text-center">
                <Layers size={26} className="mx-auto text-[#CBD5E1] mb-2" />
                <p className="text-[13.5px] font-bold text-[#475569]">لا أقسام نشطة بعد</p>
                <p className="text-[12px] text-[#94A3B8] mt-1">تُسنَد الأقسام إليك من الإدارة، وتظهر هنا مع طلابها.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myClasses.slice(0, 2).map(c => {
                  const fill = c.capacity ? Math.min(100, Math.round((c.active_count / c.capacity) * 100)) : null
                  return (
                    <Link key={c.id} href={`/teacher/groups/${c.id}`}
                          className="block rounded-2xl ring-1 ring-[#E2E8F0] p-4 hover:ring-blue-300 hover:shadow-md transition">
                      <div className="flex items-start gap-3">
                        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md
                                          ${c.mode === 'private' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 !text-blue-900 shadow-amber-500/30' : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-700/30'}`}>
                          {c.mode === 'private' ? <UserRound size={22} /> : <Users size={22} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-extrabold text-[#1E3A8A] truncate">{c.title}</span>
                            <StatusPill tone="ok">نشط</StatusPill>
                          </div>
                          <div className="mt-0.5 text-[12px] font-semibold text-[#64748B] truncate">
                            {[c.course_title, STATUS_AR[c.mode], c.level].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-[12px] font-bold text-[#475569] shrink-0">المقاعد</span>
                        <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-600" style={{ width: `${fill ?? 100}%` }} />
                        </div>
                        <span className="text-[12px] font-extrabold text-[#1E3A8A] tabular-nums">
                          {c.active_count}{c.capacity ? `/${c.capacity}` : ''}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-[#E2E8F0] rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] py-2.5 text-center">
                        {[
                          { icon: CheckCircle2, label: 'حصص منجزة', v: c.sessions_done, cls: 'text-blue-600' },
                          { icon: Hourglass,    label: 'في الانتظار', v: c.waitlisted_count, cls: 'text-emerald-600' },
                          { icon: ClipboardList, label: 'تقارير', v: c.reports_owed, cls: c.reports_owed ? 'text-rose-600' : 'text-indigo-600' },
                        ].map(x => (
                          <div key={x.label} className="px-1">
                            <x.icon size={15} className={`mx-auto ${x.cls}`} />
                            <div className="mt-1 text-[10.5px] font-semibold text-[#64748B]">{x.label}</div>
                            <div className="text-[13px] font-extrabold text-[#1E3A8A] tabular-nums">{x.v}</div>
                          </div>
                        ))}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Surface>
        </Rise>

        <Rise className="lg:col-span-4">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="ما يحتاج انتباهك" />
            {alerts.length === 0 ? (
              <p className="py-8 text-center text-[13px] font-semibold text-[#64748B]">كل شيء على ما يرام ✨</p>
            ) : (
              <ul className="divide-y divide-[#EEF2F7]">
                {alerts.slice(0, 3).map(a => (
                  <li key={a.title} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TONE[a.tone]}`}><a.icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[13.5px] font-extrabold text-[#1E3A8A] truncate">{a.title}</span>
                        {a.when && <span className="text-[11px] font-semibold text-[#94A3B8] shrink-0">{a.when}</span>}
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-[#64748B] leading-relaxed line-clamp-2">{a.text}</p>
                      <Link href={a.href} className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-blue-700 hover:text-blue-900">
                        {a.link} <ArrowLeft size={13} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ Upcoming · activity · attendance ══ */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Rise>
          <Surface className="p-5 sm:p-6 h-full flex flex-col">
            <SectionHead title="الحصص القادمة" href="/teacher/classes" link="الجدول الكامل" />
            {upcoming.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                <CalendarPlus size={24} className="text-[#CBD5E1] mb-2" />
                <p className="text-[13px] font-semibold text-[#64748B]">لا حصص قادمة</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#EEF2F7]">
                {upcoming.slice(0, 4).map(s => (
                  <li key={s.id}>
                    <Link href={`/teacher/classes/${s.id}`} className="group flex items-center gap-3 py-3 first:pt-0">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.mode === 'private' ? TONE.gold : TONE.stone}`}>
                        <BookOpen size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-bold text-[#1E3A8A] truncate group-hover:text-blue-700">{s.title}</div>
                        <div className="text-[11.5px] font-semibold text-[#64748B]">{STATUS_AR[s.mode]}{s.level ? ` · ${s.level}` : ''}</div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="text-[12px] font-bold text-[#334155]">{fromNow(s.starts_at)}</div>
                        <div className="text-[11px] font-semibold text-[#94A3B8] tabular-nums">{fmtTime(s.starts_at)} · {s.duration_min} د</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/teacher/classes?new=1" className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue-700 hover:text-blue-900">
              <CalendarPlus size={14} /> إضافة درس جديد
            </Link>
          </Surface>
        </Rise>

        <Rise i={1}>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="آخر النشاطات" href="/teacher/reports" link="التقارير" />
            {activity.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا نشاط بعد.</p>
            ) : (
              <ol className="relative space-y-4 before:absolute before:right-[17px] before:top-2 before:bottom-2 before:w-px before:bg-[#E2E8F0]">
                {activity.map((a, i) => (
                  <li key={i} className="relative flex gap-3">
                    <span className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${TONE[a.tone]}`}>
                      <a.icon size={15} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="text-[13px] font-extrabold text-[#1E3A8A]">{a.title}</div>
                      <div className="text-[12px] text-[#64748B] truncate">{a.sub}</div>
                      <div className="text-[11px] font-semibold text-[#94A3B8]">{shortDate(a.at)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Surface>
        </Rise>

        <Rise i={2} className="md:col-span-2 xl:col-span-1">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="الحضور هذا الشهر" href="/teacher/students" link="التفاصيل" />
            {attRate == null ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">لم يُسجَّل حضور هذا الشهر بعد.</p>
            ) : (
              <>
                <div className="flex justify-center py-1">
                  <Ring pct={Math.round(Number(attRate))} size={150} color="#16A34A" label="متوسط الحضور" />
                </div>
                {attRows.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {attRows.map(r => {
                      const pct = Math.round((r.n / (att!.marks || 1)) * 100)
                      return (
                        <div key={r.label} className="flex items-center gap-3 text-[12.5px]">
                          <span className={`w-2.5 h-2.5 rounded-sm ${r.bar}`} />
                          <span className="w-12 font-bold text-[#334155]">{r.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                            <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-10 text-left font-extrabold text-[#1E3A8A] tabular-nums">{pct}%</span>
                        </div>
                      )
                    })}
                    <div className="pt-1 text-[11.5px] font-semibold text-[#94A3B8]">{att!.marks} علامة حضور هذا الشهر</div>
                  </div>
                )}
              </>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ My students ══ */}
      <Rise>
        <Surface className="p-5 sm:p-6">
          <SectionHead title="طلابي الحاليون" href="/teacher/students" link="كل الطلاب" />
          {active.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#94A3B8]">لم يُسنَد إليك طلاب بعد.</p>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead>
                  <tr className="bg-[#F8FAFC] text-right text-[12px] font-bold text-[#64748B]">
                    <th className="px-5 sm:px-6 py-3 font-bold">الطالب</th>
                    <th className="px-3 py-3 font-bold">الدورة</th>
                    <th className="px-3 py-3 font-bold">القسم</th>
                    <th className="px-3 py-3 font-bold">العلاقة</th>
                    <th className="px-3 py-3 font-bold">منذ</th>
                    <th className="px-5 sm:px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {active.slice(0, 6).map(st => {
                    const rel = st.relationship ? RELATION[st.relationship] : null
                    return (
                      <tr key={st.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 sm:px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <Face name={st.full_name} url={st.avatar_url} size={34} />
                            <span className="font-bold text-[#1E3A8A] truncate max-w-[180px]">{st.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[#475569]">{st.courses?.find(c => c.status === 'active')?.title ?? st.course ?? '—'}</td>
                        <td className="px-3 py-3 text-[#475569] truncate max-w-[180px]">{st.classes?.[0]?.title ?? '—'}</td>
                        <td className="px-3 py-3">{rel ? <StatusPill tone={rel.tone}>{rel.label}</StatusPill> : '—'}</td>
                        <td className="px-3 py-3 text-[#64748B] tabular-nums">{shortDate(st.assigned_at ?? st.enrollment_date)}</td>
                        <td className="px-5 sm:px-6 py-3 text-left">
                          <Link href={`/teacher/students/${st.id}`} className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-700 hover:text-blue-900">
                            الملف <ArrowLeft size={13} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Surface>
      </Rise>

      {/* ══ Performance · public page · quick links ══ */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-5">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="الأداء الأسبوعي" href="/teacher/earnings" link="الأرباح" />
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[26px] font-extrabold text-[#1E3A8A] tabular-nums">{weekly[weekly.length - 1].value}</span>
              <span className="text-[12.5px] font-semibold text-[#64748B]">حصة منجزة هذا الأسبوع · آخر 8 أسابيع</span>
            </div>
            <BarChart data={weekly} height={160} color="#2563EB" unit=" حصة" />
          </Surface>
        </Rise>

        <Rise className="lg:col-span-4">
          <Surface className="p-5 sm:p-6 h-full flex flex-col">
            <SectionHead title="ملفك العام" href="/teacher/profile" link="تعديل" />
            <div className="flex items-center gap-3">
              <Face name={name} url={prof?.avatar_url ?? teacher.profile?.avatar_url} size={56} className="ring-4 ring-blue-50" />
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold text-[#1E3A8A] truncate">{name}</div>
                {ratingN > 0
                  ? <div className="flex items-center gap-1.5"><Stars value={ratingAvg} size={12} /><span className="text-[12px] font-bold text-[#334155]">{ratingAvg.toFixed(1)}</span></div>
                  : <div className="text-[12px] text-[#64748B] truncate">{prof?.headline || 'أضف عنواناً مهنياً'}</div>}
              </div>
            </div>
            {teachChips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teachChips.map(t => <span key={t} className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11.5px] font-bold text-blue-700">{t}</span>)}
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[12px] font-bold text-[#475569] shrink-0">اكتمال الملف</span>
              <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-600" style={{ width: `${check.pct}%` }} />
              </div>
              <span className="text-[12px] font-extrabold text-[#1E3A8A] tabular-nums">{check.pct}%</span>
            </div>
            <div className="mt-auto pt-5 grid grid-cols-2 gap-2">
              <Btn href={publicHref} icon={ExternalLink}>عرض الملف العام</Btn>
              <ShareBtn url={shareUrl} title={name} kind="gold" />
            </div>
          </Surface>
        </Rise>

        <Rise className="lg:col-span-3">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="روابط سريعة" />
            <ul className="space-y-1">
              {[
                { href: '/teacher/classes?new=1', icon: CalendarPlus, label: 'إضافة درس' },
                { href: '/teacher/reports',       icon: ClipboardList, label: 'كتابة تقرير' },
                { href: '/teacher/materials',     icon: FolderOpen, label: 'رفع ملف للطلاب' },
                { href: '/teacher/schedule',      icon: CalendarClock, label: 'تحديث التوفر' },
                { href: '/teacher/students',      icon: Users, label: 'تواصل مع الطلاب' },
                { href: '/teacher/profile?edit=1', icon: Sparkles, label: 'تعديل ملفي' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#F8FAFC] transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><l.icon size={15} /></span>
                    <span className="text-[13px] font-semibold text-[#334155] group-hover:text-blue-700">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Surface>
        </Rise>
      </div>

      <HelpBanner />
    </div>
  )
}
