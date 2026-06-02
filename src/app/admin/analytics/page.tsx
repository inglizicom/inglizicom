'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3, Loader2, RotateCcw, TrendingUp, Users,
  Wallet, Award, Globe, ArrowRight, Target, Zap,
  CheckCircle2, DollarSign,
} from 'lucide-react'
import { fetchOwnerMetrics, type OwnerMetrics } from '@/lib/crm-stats'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n)) + ' MAD'
const NUM = (n: number) => new Intl.NumberFormat('en-US').format(n)
const PCT = (n: number) => n + '%'

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setMetrics(await fetchOwnerMetrics()) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Founder · analytics</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-700" /> Business metrics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real money received only — approved CRM payments. Pending and projected income are never included.
          </p>
        </div>
        <button onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          <RotateCcw size={14} /> Refresh
        </button>
      </header>

      {loading || !metrics ? (
        <div className="py-28 flex items-center justify-center text-gray-300">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Revenue overview */}
          <section>
            <SectionLabel>Revenue</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <KpiCard icon={Wallet}     label="Total revenue"  value={MAD(metrics.revenueTotal)}     accent="yellow" />
              <KpiCard icon={DollarSign} label="This year"      value={MAD(metrics.revenueThisYear)}  accent="yellow" />
              <KpiCard icon={TrendingUp} label="This month"     value={MAD(metrics.revenueThisMonth)} accent="emerald" />
              <KpiCard icon={Target}     label="This week"      value={MAD(metrics.revenueThisWeek)}  accent="blue" />
              <KpiCard icon={Zap}        label="Today"          value={MAD(metrics.revenueToday)}     accent="indigo" />
            </div>
          </section>

          {/* Unit economics */}
          <section>
            <SectionLabel>Unit economics</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard icon={Users}      label="Avg revenue per student" value={MAD(metrics.avgRevenuePerStudent)} accent="purple" />
              <KpiCard icon={TrendingUp} label="Avg revenue per lead"    value={MAD(metrics.avgRevenuePerLead)}    accent="rose" />
            </div>
          </section>

          {/* Revenue chart */}
          <Panel title="Revenue per month" subtitle="Approved CRM payments only — real cash received (MAD)">
            <RevenueChart data={metrics.revenueByMonth} />
          </Panel>

          {/* Funnel */}
          <Panel title="Conversion funnel"
            subtitle="Lead-to-contacted → contacted-to-confirmed → confirmed-to-paid"
            icon={<Target size={14} className="text-gray-500" />}>
            <FunnelViz steps={metrics.funnel} />
          </Panel>

          {/* Revenue breakdowns */}
          <div className="grid lg:grid-cols-3 gap-5">
            <Panel title="Revenue by course" subtitle="Top courses by cash collected">
              <BreakdownBars data={metrics.revenueByCourse} accent="yellow" />
            </Panel>
            <Panel title="Revenue by source" subtitle="Which channels bring in the most money">
              <BreakdownBars data={metrics.revenueBySource} accent="blue" />
            </Panel>
            <Panel title="Revenue by assistant" subtitle="Who closed the most revenue">
              <BreakdownBars data={metrics.revenueByAssistant} accent="emerald" />
            </Panel>
          </div>

          {/* Top performers */}
          <section>
            <SectionLabel>Top performers</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TopCard icon={Award} label="Top course"    value={metrics.topCourse}    sub="Highest revenue" />
              <TopCard icon={Globe} label="Top source"    value={metrics.topSource}    sub="Most revenue from this channel" />
              <TopCard icon={Users} label="Top assistant" value={metrics.topAssistant} sub="Most revenue closed" />
            </div>
          </section>

        </div>
      )}
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function Panel({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <div>
          <h2 className="font-bold text-gray-900 text-[15px]">{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-sm text-gray-400">{children}</div>
}

function KpiCard({ icon: Icon, label, value, accent }: {
  icon: LucideIcon
  label: string; value: string; accent: string
}) {
  const colors: Record<string, string> = {
    yellow:  'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue:    'bg-blue-50 text-blue-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    purple:  'bg-purple-50 text-purple-600',
    rose:    'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[accent]} flex items-center justify-center mb-2.5`}>
        <Icon size={15} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">{label}</div>
      <div className="font-black text-gray-900 tabular-nums text-[17px] leading-tight">{value}</div>
    </div>
  )
}

function TopCard({ icon: Icon, label, value, sub }: {
  icon: LucideIcon
  label: string; value: string | null; sub: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-yellow-600" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</div>
        <div className="font-black text-gray-900 text-[17px] truncate">{value ?? '—'}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function RevenueChart({ data }: { data: { month: string; mad: number }[] }) {
  if (data.every(d => d.mad === 0)) return <Empty>No paid CRM payments yet. Revenue appears here once the first payment is recorded as paid in the CRM.</Empty>
  const w = 720; const h = 200
  const pad = { l: 64, r: 16, t: 16, b: 30 }
  const max = Math.max(1, ...data.map(d => d.mad))
  const stepX = (w - pad.l - pad.r) / Math.max(1, data.length - 1)
  const yOf   = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b)
  const pts   = data.map((d, i) => [pad.l + i * stepX, yOf(d.mad)] as const)
  const path  = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
  const area  = `${path} L${(pad.l+(data.length-1)*stepX).toFixed(1)},${h-pad.b} L${pad.l},${h-pad.b}Z`
  const ticks = [0, 0.5, 1].map(p => Math.round(p * max))
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[480px] h-auto">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yOf(t)} x2={w-pad.r} y2={yOf(t)} stroke="#f3f4f6" strokeWidth={1} />
            <text x={pad.l-6} y={yOf(t)+4} textAnchor="end" fontSize={9} fill="#9ca3af" fontFamily="ui-monospace,monospace">
              {new Intl.NumberFormat('en-US',{notation:'compact'}).format(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#rg)" />
        <path d={path} fill="none" stroke="#facc15" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={3.5} fill={data[i].mad > 0 ? '#0a0a0a' : '#e5e7eb'} stroke="#facc15" strokeWidth={2} />
            <text x={p[0]} y={h-pad.b+16} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="ui-monospace,monospace">
              {data[i].month.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function FunnelViz({ steps }: { steps: { label: string; count: number; pct: number; cumPct: number }[] }) {
  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-yellow-500']
  const Icons  = [Users, TrendingUp, CheckCircle2, Wallet]
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const Icon = Icons[i]
        const isFirst = i === 0
        return (
          <div key={step.label}>
            {!isFirst && (
              <div className="flex items-center gap-4 mb-2">
                <div className="w-44 flex-shrink-0" />
                <div className="flex-1 flex justify-start pl-3">
                  <ArrowRight size={12} className="text-gray-300 rotate-90" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 w-44 flex-shrink-0">
                <div className={`w-7 h-7 rounded-lg ${colors[i]} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={12} className="text-white" />
                </div>
                <span className="text-[13px] font-bold text-gray-700">{step.label}</span>
              </div>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div className={`h-full ${colors[i]} transition-all`} style={{ width: `${step.cumPct}%` }} />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-[12px] font-black text-white tabular-nums">{NUM(step.count)}</span>
                </div>
              </div>
              <div className="text-right w-32 flex-shrink-0">
                {!isFirst ? (
                  <>
                    <div className="text-[13px] font-black text-gray-800 tabular-nums">
                      {PCT(step.pct)} <span className="text-[10px] font-normal text-gray-400">prev</span>
                    </div>
                    <div className="text-[10px] text-gray-400 tabular-nums">{PCT(step.cumPct)} of all leads</div>
                  </>
                ) : (
                  <div className="text-[10px] text-gray-400">baseline</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BreakdownBars({ data, accent }: {
  data: { label: string; mad: number; count: number }[]
  accent: 'yellow' | 'blue' | 'emerald'
}) {
  if (data.length === 0) return <Empty>No paid payments yet for this breakdown.</Empty>
  const max = Math.max(1, ...data.map(d => d.mad))
  const bg  = { yellow: 'bg-yellow-400', blue: 'bg-blue-400', emerald: 'bg-emerald-400' }[accent]
  return (
    <div className="space-y-3">
      {data.slice(0, 8).map(d => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-semibold text-gray-700 truncate max-w-[55%]">{d.label}</span>
            <span className="text-[11px] font-bold text-gray-900 tabular-nums ml-2">
              {MAD(d.mad)}
              <span className="text-gray-400 font-normal text-[10px] ml-1">· {d.count}</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${bg} rounded-full`} style={{ width: `${(d.mad/max)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
