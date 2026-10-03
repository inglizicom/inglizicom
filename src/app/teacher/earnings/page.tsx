'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Wallet, CalendarDays, Loader2, Info, TrendingUp, CalendarCheck, CalendarClock,
  BadgeDollarSign, ArrowDown, ChevronLeft, ChevronRight, ShieldCheck, Users, Lock,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchLeaderboard, fetchMyStudents, fetchRosterPayments, fetchSessions,
  type ClassSession, type MyStudent, type RosterPayment,
} from '@/lib/teachers'
import { BarChart, Donut } from '../_charts'
import MyPayouts from '@/components/MyPayouts'
import { Rise } from '../_ds'
import { DEMO_LEADERBOARD, DEMO_ROSTER_PAYMENTS, DEMO_SESSIONS, DEMO_STUDENTS, isTeacherDemo } from '../_demo'
import { DemoBanner, STATUS_AR } from '../_ui'
import { Btn, Face, HelpBanner, SectionHead, StatCard, StatusPill, Surface, SUPPORT_WA, type PillTone } from '../_kit'

/**
 * الأرباح — what the hours are worth, laid out like a billing page.
 *
 * A teacher cannot set their own rate — the guard trigger on teacher_profiles
 * pins pay_model and hourly_rate_mad to whatever the founder wrote. So this
 * page never pretends to be an editor. It reads the rate, multiplies it by
 * hours actually taught, and shows the working. Only `done` sessions count:
 * a scheduled class is a promise, not income.
 */

const MONTH_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
                  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
const PAY_LABEL: Record<string, string> = { hourly: 'بالساعة', per_class: 'لكل حصة', monthly: 'راتب شهري', none: 'غير محدد' }
const STATUS_TONE: Record<string, PillTone> = { done: 'ok', scheduled: 'info', live: 'warn', cancelled: 'bad' }
const PAGE = 8

type Tab = 'all' | 'done' | 'upcoming' | 'cancelled'
const TABS: [Tab, string][] = [['all', 'الكل'], ['done', 'منجزة'], ['upcoming', 'قادمة'], ['cancelled', 'ملغاة']]

const hours = (mins: number) => Math.round((mins / 60) * 10) / 10

export default function TeacherEarningsPage() {
  const teacher = useTeacher()
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading]   = useState(true)
  const [demo, setDemo]         = useState(false)
  const [tab, setTab]           = useState<Tab>('all')
  const [page, setPage]         = useState(0)
  const [students, setStudents] = useState<MyStudent[]>([])
  const [payments, setPayments] = useState<RosterPayment[]>([])
  const [rosterMonth, setRosterMonth] = useState<{ revenue: number; payers: number } | null>(null)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      setDemo(true); setSessions(DEMO_SESSIONS); setStudents(DEMO_STUDENTS); setPayments(DEMO_ROSTER_PAYMENTS)
      setRosterMonth(DEMO_LEADERBOARD.me && { revenue: DEMO_LEADERBOARD.me.roster_revenue, payers: DEMO_LEADERBOARD.me.roster_paying_students })
      setLoading(false); return
    }
    ;(async () => {
      const [s, st, pay, lb] = await Promise.all([fetchSessions(teacher.id), fetchMyStudents(), fetchRosterPayments(), fetchLeaderboard()])
      if (!alive) return
      setSessions(s); setStudents(st); setPayments(pay)
      setRosterMonth(lb?.me ? { revenue: Number(lb.me.roster_revenue), payers: lb.me.roster_paying_students } : null)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const payModel = teacher.profile?.pay_model ?? 'none'
  const rate     = teacher.profile?.hourly_rate_mad ?? null
  // Only hourly can be derived from the data we hold. Per-class and monthly
  // depend on terms that live outside this table, so we show hours and stop.
  const canEarn  = !demo && payModel === 'hourly' && rate != null && rate > 0
  const worth    = (mins: number) => (canEarn ? Math.round((mins / 60) * (rate as number)) : null)

  const now  = useMemo(() => new Date(), [])
  const year = now.getFullYear()
  const done = useMemo(() => sessions.filter(s => s.status === 'done'), [sessions])
  const inMonth = (s: ClassSession, y: number, m: number) => {
    const d = new Date(s.starts_at); return d.getFullYear() === y && d.getMonth() === m
  }

  const monthDone  = done.filter(s => inMonth(s, year, now.getMonth()))
  const monthMins  = monthDone.reduce((a, s) => a + s.duration_min, 0)
  const totalMins  = done.reduce((a, s) => a + s.duration_min, 0)
  const upcomingN  = sessions.filter(s => (s.status === 'scheduled' || s.status === 'live') && new Date(s.starts_at) >= now).length
  const cancelledN = sessions.filter(s => s.status === 'cancelled').length

  const yearly = MONTH_AR.map((label, m) => {
    const mins = done.filter(s => inMonth(s, year, m)).reduce((a, s) => a + s.duration_min, 0)
    return { label: label.slice(0, 3), value: canEarn ? (worth(mins) ?? 0) : hours(mins) }
  })
  const yearTotal = yearly.reduce((a, m) => a + m.value, 0)

  const rows = useMemo(() => {
    const list = tab === 'done' ? done
      : tab === 'cancelled' ? sessions.filter(s => s.status === 'cancelled')
      : tab === 'upcoming' ? sessions.filter(s => s.status === 'scheduled' || s.status === 'live')
      : sessions
    return [...list].sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
  }, [sessions, done, tab])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE)

  const recent = [...done].sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at)).slice(0, 5)

  if (loading) {
    return (
      <div className="py-40 flex items-center justify-center gap-3 text-[#94A3B8]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px] font-medium">جاري تحميل أرباحك…</span>
      </div>
    )
  }

  const money = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('en-US')} د`)

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}

      {/* ══ Title ══ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#1E3A8A]">الأرباح والساعات</h1>
          <p className="mt-1 text-[14px] text-[#64748B]">تابع ساعاتك المنجزة، حصصك القادمة، والمقابل المقدّر.</p>
        </div>
        <Btn href="/teacher/classes" icon={CalendarDays}>إدارة الحصص</Btn>
      </div>

      {/* ══ Five stat cards ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Rise i={0}><StatCard icon={BadgeDollarSign} tone="stone" label={canEarn ? 'مجموع الأرباح' : 'مجموع الساعات'}
          value={canEarn ? money(worth(totalMins)) : `${hours(totalMins)} س`} sub="منذ البداية"
          href="#sessions" link="سجل الحصص" /></Rise>
        <Rise i={1}><StatCard icon={Wallet} tone="emerald" label={canEarn ? 'أرباح هذا الشهر' : 'ساعات هذا الشهر'}
          value={canEarn ? money(worth(monthMins)) : `${hours(monthMins)} س`} sub={`${monthDone.length} حصة منجزة`}
          href="#sessions" link="حصص الشهر" /></Rise>
        <Rise i={2}><StatCard icon={CalendarClock} tone="gold" label="حصص قادمة" value={upcomingN}
          sub="مبرمجة من اليوم" href="/teacher/classes" link="الجدول" /></Rise>
        <Rise i={3}><StatCard icon={CalendarCheck} tone="violet" label="حصص منجزة" value={done.length}
          sub={`${cancelledN} ملغاة`} href="#sessions" link="كل الحصص" /></Rise>
        <Rise i={4} className="col-span-2 lg:col-span-1"><StatCard icon={TrendingUp} tone="rose" label="طريقة الأجر"
          value={<span className="text-[22px]">{PAY_LABEL[payModel]}</span>}
          sub={canEarn ? `${rate!.toLocaleString('en-US')} درهم / ساعة` : 'يحددها المكتب'} /></Rise>
      </div>

      {/* ══ What the office actually paid — recorded by the founder, month by month ══ */}
      <Rise>
        <Surface className="p-5 sm:p-6">
          <SectionHead title="دفعاتي" />
          <MyPayouts demo={demo} />
        </Surface>
      </Rise>

      {/* ══ Year overview + session status ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Rise className="lg:col-span-7">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="نظرة على السنة" action={
              <span className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] px-3 py-1.5 text-[12.5px] font-bold text-[#334155]">{year}</span>} />
            <div className="text-[28px] font-extrabold text-[#1E3A8A] tabular-nums">
              {canEarn ? money(yearTotal) : `${Math.round(yearTotal * 10) / 10} ساعة`}
            </div>
            <div className="text-[12.5px] font-semibold text-[#64748B] mb-4">
              {canEarn ? `أرباح مقدّرة في ${year}` : `ساعات منجزة في ${year}`}
            </div>
            <BarChart data={yearly} height={190} color="#2563EB" unit={canEarn ? ' د' : ' س'} />
          </Surface>
        </Rise>

        <Rise className="lg:col-span-5">
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="حالة الحصص" />
            <Donut size={150} data={[
              { label: 'منجزة', value: done.length },
              { label: 'قادمة', value: upcomingN },
              { label: 'ملغاة', value: cancelledN },
            ]} />
            {!canEarn && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50 ring-1 ring-blue-200 px-4 py-3">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-[#334155] leading-relaxed">
                  {payModel === 'none'
                    ? 'لم تُحدَّد طريقة الأجر بعد. ساعاتك محفوظة كاملة وستُحتسب فور تحديدها.'
                    : `أجرك «${PAY_LABEL[payModel]}» يُحتسب خارج هذه اللوحة — نعرض هنا ساعاتك وحصصك المؤكدة.`}
                </p>
              </div>
            )}
          </Surface>
        </Rise>
      </div>

      {/* ══ Sessions table ══ */}
      <Rise>
        <Surface id="sessions" className="p-5 sm:p-6 scroll-mt-24">
          <SectionHead title="سجل الحصص" />
          <div className="flex gap-1 border-b border-[#E2E8F0] mb-1 overflow-x-auto no-scrollbar">
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setPage(0) }}
                      className={`relative px-4 py-2.5 text-[13px] font-bold shrink-0 transition-colors
                                  ${tab === id ? 'text-blue-700' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}>
                {label}
                {tab === id && <span className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#94A3B8]">لا حصص في هذا القسم.</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-5 sm:-mx-6">
                <table className="w-full min-w-[680px] text-[13px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-right text-[12px] text-[#64748B]">
                      <th className="px-5 sm:px-6 py-3 font-bold">التاريخ</th>
                      <th className="px-3 py-3 font-bold">الحصة</th>
                      <th className="px-3 py-3 font-bold">النوع</th>
                      <th className="px-3 py-3 font-bold">المدة</th>
                      {canEarn && <th className="px-3 py-3 font-bold">المقابل</th>}
                      <th className="px-3 py-3 font-bold">الحالة</th>
                      <th className="px-5 sm:px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7]">
                    {shown.map(s => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 sm:px-6 py-3 text-[#475569] tabular-nums whitespace-nowrap">
                          {new Date(s.starts_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#1E3A8A] max-w-[260px] truncate">{s.title}</td>
                        <td className="px-3 py-3 text-[#475569]">{STATUS_AR[s.mode]}</td>
                        <td className="px-3 py-3 text-[#475569] tabular-nums">{s.duration_min} د</td>
                        {canEarn && <td className="px-3 py-3 font-bold text-[#1E3A8A] tabular-nums">
                          {s.status === 'done' ? money(worth(s.duration_min)) : '—'}
                        </td>}
                        <td className="px-3 py-3"><StatusPill tone={STATUS_TONE[s.status] ?? 'muted'}>{STATUS_AR[s.status]}</StatusPill></td>
                        <td className="px-5 sm:px-6 py-3 text-left">
                          <Link href={`/teacher/classes/${s.id}`} className="text-[12px] font-bold text-blue-700 hover:text-blue-900">عرض الحصة</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-[#64748B]">
                  عرض {page * PAGE + 1}–{Math.min(rows.length, (page + 1) * PAGE)} من {rows.length} حصة
                </span>
                {pages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label="السابق"
                            className="w-8 h-8 rounded-lg ring-1 ring-[#E2E8F0] flex items-center justify-center text-[#475569] disabled:opacity-40 hover:bg-[#F8FAFC]">
                      <ChevronRight size={15} />
                    </button>
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => i).map(i => (
                      <button key={i} onClick={() => setPage(i)}
                              className={`w-8 h-8 rounded-lg text-[12.5px] font-bold tabular-nums
                                          ${page === i ? 'bg-blue-600 text-white' : 'ring-1 ring-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} aria-label="التالي"
                            className="w-8 h-8 rounded-lg ring-1 ring-[#E2E8F0] flex items-center justify-center text-[#475569] disabled:opacity-40 hover:bg-[#F8FAFC]">
                      <ChevronLeft size={15} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </Surface>
      </Rise>

      {/* ══ What my students paid — transparency, my own roster only ══ */}
      {payments.length > 0 && (
        <Rise>
          <Surface className="p-5 sm:p-6">
            <SectionHead title="ما دفعه طلابي" action={
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#94A3B8]"><Lock size={12} /> طلابك فقط</span>} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
                <div className="text-[12px] font-bold text-emerald-800">مدفوعات طلابك هذا الشهر</div>
                <div className="mt-1 text-[24px] font-extrabold text-emerald-800 tabular-nums">{rosterMonth ? money(rosterMonth.revenue) : '—'}</div>
                <div className="text-[11.5px] text-emerald-700">{rosterMonth ? `${rosterMonth.payers} طالب دفع` : ''}</div>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-4">
                <div className="text-[12px] font-bold text-[#64748B]">مجموع ما دفعه طلابك</div>
                <div className="mt-1 text-[24px] font-extrabold text-[#1E3A8A] tabular-nums">{money(payments.reduce((a, p) => a + p.total_paid, 0))}</div>
                <div className="text-[11.5px] text-[#94A3B8]">منذ التسجيل</div>
              </div>
              <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4">
                <div className="text-[12px] font-bold text-amber-800">مستحقات لم تُدفع بعد</div>
                <div className="mt-1 text-[24px] font-extrabold text-amber-800 tabular-nums">{money(payments.reduce((a, p) => a + p.outstanding, 0))}</div>
                <div className="text-[11.5px] text-amber-700">{payments.filter(p => p.overdue).length} طالب متأخر</div>
              </div>
            </div>
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full min-w-[600px] text-[13px]">
                <thead>
                  <tr className="bg-[#F8FAFC] text-right text-[12px] text-[#64748B]">
                    <th className="px-5 sm:px-6 py-3 font-bold">الطالب</th>
                    <th className="px-3 py-3 font-bold">المدفوع</th>
                    <th className="px-3 py-3 font-bold">المتبقي</th>
                    <th className="px-3 py-3 font-bold">آخر دفعة</th>
                    <th className="px-5 sm:px-6 py-3 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {[...payments].sort((a, b) => b.total_paid - a.total_paid).map(p => {
                    const st = students.find(x => x.id === p.student_id)
                    return (
                      <tr key={p.student_id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 sm:px-6 py-3">
                          <Link href={`/teacher/students/${p.student_id}`} className="flex items-center gap-2.5 font-bold text-[#1E3A8A] hover:text-blue-700">
                            <Face name={st?.full_name ?? 'طالب'} url={st?.avatar_url} size={30} />
                            <span className="truncate max-w-[200px]">{st?.full_name ?? 'طالب'}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 font-extrabold text-[#1E3A8A] tabular-nums">{money(p.total_paid)}</td>
                        <td className="px-3 py-3 tabular-nums text-[#475569]">{p.outstanding ? money(p.outstanding) : '—'}</td>
                        <td className="px-3 py-3 tabular-nums text-[#475569]">{p.last_paid_at ? new Date(p.last_paid_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                        <td className="px-5 sm:px-6 py-3">
                          {p.overdue ? <StatusPill tone="bad">متأخر</StatusPill>
                            : p.outstanding > 0 ? <StatusPill tone="warn">مستحق</StatusPill>
                            : p.total_paid > 0 ? <StatusPill tone="ok">مُسدَّد</StatusPill>
                            : <StatusPill tone="muted">لا دفعات</StatusPill>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Surface>
        </Rise>
      )}

      {/* ══ Pay terms · recent · month summary ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Rise>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="شروط الأجر" />
            <div className="rounded-2xl ring-1 ring-[#E2E8F0] p-4 flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-700/30">
                <Wallet size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-[#1E3A8A]">{PAY_LABEL[payModel]}</div>
                <div className="text-[12px] text-[#64748B]">{canEarn ? `${rate!.toLocaleString('en-US')} درهم لكل ساعة منجزة` : 'تُحدَّد من الإدارة'}</div>
              </div>
              <StatusPill tone={payModel === 'none' ? 'warn' : 'ok'}>{payModel === 'none' ? 'بانتظار التحديد' : 'مفعّل'}</StatusPill>
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[#64748B]">
              الأجر يحدده المكتب ولا يمكن تعديله من هنا. لأي سؤال عن الدفعات تواصل مع الإدارة.
            </p>
          </Surface>
        </Rise>

        <Rise i={1}>
          <Surface className="p-5 sm:p-6 h-full">
            <SectionHead title="آخر الحصص المنجزة" href="#sessions" link="الكل" />
            {recent.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#94A3B8]">لا حصص منجزة بعد.</p>
            ) : (
              <ul className="divide-y divide-[#EEF2F7]">
                {recent.map(s => (
                  <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ArrowDown size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-[#1E3A8A] truncate">{s.title}</div>
                      <div className="text-[11.5px] text-[#94A3B8]">{new Date(s.starts_at).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <span className="text-[13px] font-extrabold text-emerald-700 tabular-nums" dir="ltr">
                      +{canEarn ? `${worth(s.duration_min)} MAD` : `${hours(s.duration_min)} h`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </Rise>

        <Rise i={2} className="md:col-span-2 xl:col-span-1">
          <Surface className="p-5 sm:p-6 h-full flex flex-col">
            <SectionHead title={`ملخص ${MONTH_AR[now.getMonth()]}`} />
            <dl className="space-y-3 text-[13px]">
              <div className="flex justify-between"><dt className="text-[#64748B]">حصص منجزة</dt><dd className="font-bold text-[#1E3A8A] tabular-nums">{monthDone.length}</dd></div>
              <div className="flex justify-between"><dt className="text-[#64748B]">ساعات منجزة</dt><dd className="font-bold text-[#1E3A8A] tabular-nums">{hours(monthMins)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#64748B]">الأجر بالساعة</dt><dd className="font-bold text-[#1E3A8A] tabular-nums">{canEarn ? money(rate) : '—'}</dd></div>
            </dl>
            <div className="my-4 h-px bg-[#E2E8F0]" />
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-bold text-[#334155]">{canEarn ? 'المقابل المقدّر' : 'مجموع الساعات'}</span>
              <span className="text-[24px] font-extrabold text-[#1E3A8A] tabular-nums">{canEarn ? money(worth(monthMins)) : `${hours(monthMins)} س`}</span>
            </div>
            <div className="mt-auto pt-5">
              <Btn href={SUPPORT_WA} external className="w-full">تواصل مع الإدارة</Btn>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-[#94A3B8]">
                <ShieldCheck size={13} /> تقدير مبني على الحصص المنجزة فقط
              </p>
            </div>
          </Surface>
        </Rise>
      </div>

      <HelpBanner title="سؤال عن أجرك؟" text="فريق إنجليزي.كوم يجيبك عن الدفعات، الساعات وطريقة الاحتساب." />
    </div>
  )
}
