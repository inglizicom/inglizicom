'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Wallet, UserPlus, GraduationCap, CalendarCheck, CreditCard, TrendingUp,
  Phone, MessageCircle, Clock, Plus, ListChecks, BadgeCheck, ChevronLeft,
} from 'lucide-react'

import KpiCard from '../_components/KpiCard'
import Avatar from '../_components/Avatar'
import OwnerCommandCenter from '@/components/OwnerCommandCenter'
import { ChartCard, DonutBreakdown } from '../_components/Charts'
import { useStaff } from '@/lib/staff-context'
import {
  fetchDashboardKpis, fetchOwnerMetrics, fetchLeadsBySource,
  fetchOverdueFollowUps, fetchTodaysFollowUps,
  type DashboardKpis, type OwnerMetrics, type OverdueLead,
} from '@/lib/crm-stats'
import { fetchAllLeads, whatsappLink, normalizeStatus, type SubscriptionLead } from '@/lib/leads-db'

const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع', delayed: 'متأخر', cancelled: 'ملغي',
}

export default function DashboardPage() {
  const staff     = useStaff()
  const isFounder = staff.role === 'founder'

  const [kpis,    setKpis]    = useState<DashboardKpis | null>(null)
  const [owner,   setOwner]   = useState<OwnerMetrics | null>(null)
  const [sources, setSources] = useState<{ source: string; count: number }[]>([])
  const [overdue, setOverdue] = useState<OverdueLead[]>([])
  const [today,   setToday]   = useState<OverdueLead[]>([])
  const [allLeads, setAllLeads] = useState<SubscriptionLead[]>([])
  const [period,   setPeriod]   = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [k, src, od, td, leads, om] = await Promise.all([
        fetchDashboardKpis(),
        fetchLeadsBySource(90),
        fetchOverdueFollowUps(isFounder ? undefined : staff.id),
        fetchTodaysFollowUps(isFounder ? undefined : staff.id),
        fetchAllLeads(),
        isFounder ? fetchOwnerMetrics() : Promise.resolve(null),
      ])
      setKpis(k); setSources(src); setOverdue(od); setToday(td)
      setAllLeads(leads); setOwner(om)
      setLoading(false)
    })()
  }, [staff.id, isFounder])

  /* Revenue delta from last two months */
  const revSeries = owner?.revenueByMonth ?? []
  const revDelta = (() => {
    if (revSeries.length < 2) return undefined
    const last = revSeries[revSeries.length - 1].mad
    const prev = revSeries[revSeries.length - 2].mad
    if (!prev) return undefined
    return Math.round(((last - prev) / prev) * 100)
  })()

  const followQueue = [...today, ...overdue].slice(0, 5)

  /* ── Leads by period ─────────────────────────────────── */
  function inPeriod(iso: string, p: typeof period): boolean {
    const d = new Date(iso); const now = new Date()
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0)
    if (p === 'today')     return d >= startToday
    if (p === 'yesterday') { const y = new Date(startToday); y.setDate(y.getDate() - 1); return d >= y && d < startToday }
    if (p === 'week')      { const w = new Date(startToday); w.setDate(w.getDate() - 7); return d >= w }
    if (p === 'month')     { const m = new Date(now.getFullYear(), now.getMonth(), 1); return d >= m }
    return true
  }
  const periodCounts = {
    today:     allLeads.filter(l => inPeriod(l.created_at, 'today')).length,
    yesterday: allLeads.filter(l => inPeriod(l.created_at, 'yesterday')).length,
    week:      allLeads.filter(l => inPeriod(l.created_at, 'week')).length,
    month:     allLeads.filter(l => inPeriod(l.created_at, 'month')).length,
    all:       allLeads.length,
  }
  const periodLeads = allLeads.filter(l => inPeriod(l.created_at, period))
  const PERIODS: { id: typeof period; label: string }[] = [
    { id: 'today', label: 'اليوم' }, { id: 'yesterday', label: 'أمس' },
    { id: 'week', label: 'هذا الأسبوع' }, { id: 'month', label: 'هذا الشهر' }, { id: 'all', label: 'الكل' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* ── Owner Command Center (founder only) ────────── */}
      {isFounder && <OwnerCommandCenter embedded />}

      {/* ── Quick actions ──────────────────────────────── */}
      <div className="flex flex-wrap gap-2.5">
        <Link href="/sales/leads/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-[13px] hover:bg-yellow-300 transition-colors shadow-sm">
          <Plus size={15} /> إضافة عميل جديد
        </Link>
        <Link href="/sales/workspace?tab=followups"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 font-semibold text-[13px] hover:border-zinc-300 transition-colors">
          <CalendarCheck size={15} className="text-orange-500" /> إضافة متابعة
        </Link>
        <Link href="/sales/workspace?tab=payments"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 font-semibold text-[13px] hover:border-zinc-300 transition-colors">
          <CreditCard size={15} className="text-emerald-500" /> تسجيل دفعة
        </Link>
        <Link href="/sales/workspace?tab=students"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 font-semibold text-[13px] hover:border-zinc-300 transition-colors">
          <GraduationCap size={15} className="text-blue-500" /> الطلاب
        </Link>
      </div>

      {/* ── KPI cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="إيرادات الشهر" value={kpis?.monthlyRevenueMad ?? 0} unit="د.م"
          icon={Wallet} tone="green" deltaPct={revDelta} deltaNote={revDelta !== undefined ? 'مقارنة بالشهر السابق' : undefined}
          spark={revSeries.length ? revSeries.map(r => r.mad) : undefined} />
        <KpiCard label="عملاء جدد هذا الشهر" value={periodCounts.month}
          icon={UserPlus} tone="purple" />
        <KpiCard label="الطلاب المدفوعون" value={kpis?.paidStudents ?? 0}
          icon={GraduationCap} tone="blue" />
        <KpiCard label="متابعات اليوم" value={today.length}
          icon={CalendarCheck} tone="orange" />
        <KpiCard label="مدفوعات معلقة" value={kpis?.pendingPayments ?? 0}
          icon={CreditCard} tone="yellow" />
        <KpiCard label="نسبة التحويل" value={kpis?.conversionRatePct ?? 0} unit="%"
          icon={TrendingUp} tone="green" />
      </div>

      {/* ── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operational follow-up lists (owner KPIs live in the section above) */}
        <ChartCard title="المتابعات المتأخرة">
          <FollowList items={overdue.slice(0, 5)} empty="لا متابعات متأخرة" />
        </ChartCard>
        <ChartCard title="العملاء المهتمون">
          <FollowList items={today.slice(0, 5)} empty="لا متابعات لليوم" />
        </ChartCard>

        {/* Upcoming follow-ups */}
        <ChartCard title="المتابعات القادمة"
          action={<Link href="/sales/workspace?tab=followups" className="text-[12px] text-blue-600 font-semibold flex items-center gap-0.5">عرض الكل <ChevronLeft size={13} /></Link>}>
          <FollowList items={followQueue} empty="🎉 لا متابعات معلقة" />
        </ChartCard>
      </div>

      {/* ── Bottom row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leads by period */}
        <ChartCard title="العملاء حسب الفترة" className="lg:col-span-2"
          action={<Link href="/sales/workspace" className="text-[12px] text-blue-600 font-semibold flex items-center gap-0.5">عرض الكل <ChevronLeft size={13} /></Link>}>
          {/* Period selector */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors',
                  period === p.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                ].join(' ')}>
                {p.label}
                <span className={`text-[10px] px-1.5 rounded-full ${period === p.id ? 'bg-yellow-400 text-black' : 'bg-white text-zinc-500'}`}>{periodCounts[p.id]}</span>
              </button>
            ))}
          </div>
          <div className="divide-y divide-zinc-50 max-h-[340px] overflow-y-auto">
            {periodLeads.length === 0 && <p className="text-[13px] text-zinc-400 py-6 text-center">لا يوجد عملاء في هذه الفترة</p>}
            {periodLeads.slice(0, 30).map(l => {
              const s = normalizeStatus(l.status)
              return (
                <div key={l.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={l.full_name} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.full_name}</div>
                    <div className="text-[11px] text-zinc-400" dir="ltr">{l.phone ?? '—'}</div>
                  </div>
                  {l.course && <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full hidden sm:inline">{l.course.toUpperCase()}</span>}
                  <span className="text-[11px] font-bold text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded-full">{STATUS_AR[s] ?? s}</span>
                </div>
              )
            })}
          </div>
        </ChartCard>

        {/* Lead sources donut */}
        <ChartCard title="مصادر العملاء">
          {sources.length > 0 ? (
            <DonutBreakdown data={sources.map(s => ({ label: s.source || 'غير محدد', value: s.count }))} unit="عميل" />
          ) : (
            <p className="text-[13px] text-zinc-400 py-6 text-center">لا توجد بيانات</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

/* ── Follow-up list ─────────────────────────────────────── */
function FollowList({ items, empty }: { items: OverdueLead[]; empty: string }) {
  if (items.length === 0) return <p className="text-[13px] text-zinc-400 py-6 text-center">{empty}</p>
  return (
    <div className="space-y-2">
      {items.map(l => (
        <div key={l.id} className="flex items-center gap-2.5">
          <Avatar name={l.full_name} size={32} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-zinc-800 truncate">{l.full_name}</div>
            <div className="text-[11px] text-zinc-400" dir="ltr">{l.phone ?? '—'}</div>
          </div>
          {l.phone && (
            <a href={whatsappLink(l.phone) ?? '#'} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100">
              <MessageCircle size={13} />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
