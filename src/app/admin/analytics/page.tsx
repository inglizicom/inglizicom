'use client'

import { useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, Calendar, Zap, Target, GraduationCap,
  Award, Globe, UserCheck, RotateCcw, Loader2,
} from 'lucide-react'
import KpiCard from '@/app/sales/_components/KpiCard'
import { ChartCard, AreaTrend, DonutBreakdown, Funnel } from '@/app/sales/_components/Charts'
import { fetchOwnerMetrics, type OwnerMetrics, type RevenueBreakdown } from '@/lib/crm-stats'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))

const RANGES = ['اليوم', 'هذا الأسبوع', 'هذا الشهر', 'هذا العام', 'الكل'] as const

export default function AnalyticsPage() {
  const [m, setM]             = useState<OwnerMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange]     = useState<typeof RANGES[number]>('هذا الشهر')

  async function load() {
    setLoading(true)
    try { setM(await fetchOwnerMetrics()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const rangeRevenue = !m ? 0
    : range === 'اليوم'       ? m.revenueToday
    : range === 'هذا الأسبوع' ? m.revenueThisWeek
    : range === 'هذا الشهر'   ? m.revenueThisMonth
    : range === 'هذا العام'   ? m.revenueThisYear
    : m.revenueTotal

  const revDelta = (() => {
    if (!m || m.revenueByMonth.length < 2) return undefined
    const a = m.revenueByMonth[m.revenueByMonth.length - 1].mad
    const b = m.revenueByMonth[m.revenueByMonth.length - 2].mad
    return b ? Math.round(((a - b) / b) * 100) : undefined
  })()

  if (loading || !m) {
    return (
      <div className="py-32 flex items-center justify-center text-zinc-300">
        <Loader2 size={28} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Range filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={[
                'px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors',
                range === r ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-zinc-800',
              ].join(' ')}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 text-[13px] font-semibold hover:border-zinc-300">
          <RotateCcw size={14} /> تحديث
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label={`الإيرادات (${range})`} value={MAD(rangeRevenue)} unit="د.م" icon={Wallet} tone="green"
          deltaPct={revDelta} spark={m.revenueByMonth.map(r => r.mad)} />
        <KpiCard label="إجمالي الإيرادات" value={MAD(m.revenueTotal)} unit="د.م" icon={TrendingUp} tone="yellow" />
        <KpiCard label="إيرادات العام" value={MAD(m.revenueThisYear)} unit="د.م" icon={Calendar} tone="blue" />
        <KpiCard label="إيرادات اليوم" value={MAD(m.revenueToday)} unit="د.م" icon={Zap} tone="purple" />
        <KpiCard label="متوسط الإيراد / طالب" value={MAD(m.avgRevenuePerStudent)} unit="د.م" icon={GraduationCap} tone="orange" />
        <KpiCard label="متوسط الإيراد / عميل" value={MAD(m.avgRevenuePerLead)} unit="د.م" icon={Target} tone="zinc" />
      </div>

      {/* Revenue trend + source donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="الإيرادات الشهرية" className="lg:col-span-2">
          <AreaTrend data={m.revenueByMonth.map(r => ({ label: r.month, value: r.mad }))} valueLabel="د.م" height={260} />
        </ChartCard>
        <ChartCard title="الإيرادات حسب المصدر">
          {m.revenueBySource.length > 0
            ? <DonutBreakdown data={m.revenueBySource.map(s => ({ label: s.label, value: s.mad }))} unit="د.م" />
            : <Empty />}
        </ChartCard>
      </div>

      {/* Funnel + breakdown tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="نسبة التحويل">
          <Funnel steps={m.funnel.map(f => ({ label: f.label, count: f.count, pct: f.cumPct }))} />
        </ChartCard>
        <ChartCard title="الإيرادات حسب الدورة">
          <BreakdownTable rows={m.revenueByCourse} unit="د.م" />
        </ChartCard>
        <ChartCard title="أداء المسؤولين">
          <BreakdownTable rows={m.revenueByAssistant} unit="د.م" />
        </ChartCard>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TopCard icon={Award}     tone="bg-amber-50 text-amber-600"     label="أفضل دورة"  value={m.topCourse ?? '—'} />
        <TopCard icon={Globe}     tone="bg-blue-50 text-blue-600"       label="أفضل مصدر"  value={m.topSource ?? '—'} />
        <TopCard icon={UserCheck} tone="bg-emerald-50 text-emerald-600" label="أفضل مسؤول" value={m.topAssistant?.split('@')[0] ?? '—'} />
      </div>
    </div>
  )
}

function BreakdownTable({ rows, unit }: { rows: RevenueBreakdown[]; unit: string }) {
  if (rows.length === 0) return <Empty />
  const max = Math.max(...rows.map(r => r.mad), 1)
  return (
    <div className="space-y-2.5">
      {rows.slice(0, 6).map((r, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="font-semibold text-zinc-700 truncate">{r.label || '—'}</span>
            <span className="text-zinc-500 tabular-nums flex-shrink-0" dir="ltr">{MAD(r.mad)} {unit}</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(r.mad / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TopCard({ icon: Icon, tone, label, value }: { icon: any; tone: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tone}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-zinc-400">{label}</div>
        <div className="text-[15px] font-black text-zinc-900 truncate">{value}</div>
      </div>
    </div>
  )
}

function Empty() {
  return <p className="text-[13px] text-zinc-400 py-8 text-center">لا توجد بيانات بعد</p>
}
