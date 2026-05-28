'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3, Loader2, RotateCcw, TrendingUp, Users,
  Wallet, Award, Globe,
} from 'lucide-react'
import {
  fetchRevenuePerMonth, fetchLeadsBySource, fetchLeadCountsByStatus,
  fetchAssistantStats, type AssistantStat,
} from '@/lib/crm-stats'
import { LEAD_STATUS_META, type LeadStatus } from '@/lib/leads-db'
import { useStaff } from '@/lib/staff-context'

/**
 * Founder-only analytics. Charts are hand-rolled inline SVG (no library)
 * so we stay bundle-size light — the existing app has no chart dep.
 */
export default function AnalyticsPage() {
  const staff = useStaff()
  const [loading, setLoading]       = useState(true)
  const [revenue, setRevenue]       = useState<{ month: string; mad: number }[]>([])
  const [sources, setSources]       = useState<{ source: string; count: number }[]>([])
  const [statusCounts, setStatuses] = useState<Record<LeadStatus, number> | null>(null)
  const [assistants, setAssistants] = useState<AssistantStat[]>([])

  async function load() {
    setLoading(true)
    const [rev, src, status, assist] = await Promise.all([
      fetchRevenuePerMonth(12),
      fetchLeadsBySource(90),
      fetchLeadCountsByStatus(),
      fetchAssistantStats(90),
    ])
    setRevenue(rev); setSources(src); setStatuses(status); setAssistants(assist)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const totalRevenue   = revenue.reduce((sum, r) => sum + r.mad, 0)
  const totalLeads     = sources.reduce((sum, s) => sum + s.count, 0)
  const bestSource     = sources[0]?.source
  const conversionPaid = (statusCounts?.paid ?? 0) + (statusCounts?.converted ?? 0)
  const conversionAll  = statusCounts
    ? Object.values(statusCounts).reduce((s, v) => s + v, 0)
    : 0
  const conversionPct  = conversionAll > 0 ? Math.round((conversionPaid / conversionAll) * 100) : 0

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Insights</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-700" /> Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Revenue, lead sources, conversion funnel, assistant performance — last 90 days.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
        >
          <RotateCcw size={14} /> Refresh
        </button>
      </header>

      {/* Headline numbers */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Headline icon={Wallet}     label="Revenue · 12 months" value={`${formatNumber(totalRevenue)} MAD`} accent="yellow" />
        <Headline icon={Users}      label="Leads · 90 days"     value={formatNumber(totalLeads)}            accent="blue" />
        <Headline icon={TrendingUp} label="Conversion · all"    value={`${conversionPct}%`}                accent="emerald" />
        <Headline icon={Globe}      label="Best source"         value={bestSource ?? '—'}                  accent="indigo" subtle />
      </section>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue per month */}
          <Panel title="Revenue per month" subtitle="Approved payments (MAD)">
            <RevenueChart data={revenue} />
          </Panel>

          {/* Leads by source + Status funnel */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Leads by source" subtitle="Last 90 days">
              <SourceBars data={sources} />
            </Panel>
            <Panel title="Lead funnel" subtitle="Counts per status">
              <StatusFunnel data={statusCounts} />
            </Panel>
          </div>

          {/* Assistant performance */}
          <Panel
            title="Assistant performance"
            subtitle="Lead actions in the last 90 days (status changes only)"
            icon={<Award size={14} className="text-yellow-600" />}
          >
            <AssistantTable rows={assistants} />
          </Panel>
        </div>
      )}
    </div>
  )
}

/* ───────────── small bits ───────────── */

function Headline({
  icon: Icon, label, value, accent, subtle,
}: {
  icon:   any
  label:  string
  value:  string
  accent: 'yellow' | 'blue' | 'emerald' | 'indigo'
  subtle?: boolean
}) {
  const colors = {
    yellow:  'bg-yellow-50 text-yellow-600',
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo:  'bg-indigo-50 text-indigo-600',
  } as const
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[accent]} flex items-center justify-center mb-2.5`}>
        <Icon size={15} />
      </div>
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1">{label}</div>
      <div className={`font-black tracking-tight text-gray-900 tabular-nums ${subtle ? 'text-base truncate' : 'text-2xl'}`}>
        {value}
      </div>
    </div>
  )
}

function Panel({
  title, subtitle, icon, children,
}: {
  title:    string
  subtitle?: string
  icon?:    React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <div>
          <h2 className="font-bold text-gray-900 text-[15px]">{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ───────────── revenue chart (SVG line + bars) ───────────── */

function RevenueChart({ data }: { data: { month: string; mad: number }[] }) {
  if (data.length === 0) return <Empty>No revenue yet — the chart shows up after the first approved payment.</Empty>
  const w   = 720
  const h   = 240
  const pad = { l: 50, r: 16, t: 18, b: 30 }
  const max = Math.max(1, ...data.map(d => d.mad))
  const stepX = (w - pad.l - pad.r) / Math.max(1, data.length - 1)
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b)

  const points = data.map((d, i) => [pad.l + i * stepX, yScale(d.mad)] as const)
  const path   = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ')
  const area   = `${path} L ${pad.l + (data.length - 1) * stepX},${h - pad.b} L ${pad.l},${h - pad.b} Z`

  // y-axis ticks (4 of them)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(p => p * max)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[500px] h-auto">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yScale(t)} x2={w - pad.r} y2={yScale(t)} stroke="#f3f4f6" strokeWidth={1} />
            <text x={pad.l - 6} y={yScale(t) + 3} textAnchor="end" fontSize={10} fill="#9ca3af">
              {formatNumber(Math.round(t))}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#revGrad)" opacity={0.35} />
        <path d={path} fill="none" stroke="#facc15" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={3.5} fill="#0a0a0a" stroke="#facc15" strokeWidth={2} />
            <text x={p[0]} y={h - pad.b + 16} textAnchor="middle" fontSize={9.5} fill="#6b7280" fontFamily="ui-monospace, monospace">
              {data[i].month.slice(5)}
            </text>
          </g>
        ))}
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ───────────── leads by source (horizontal bars) ───────────── */

function SourceBars({ data }: { data: { source: string; count: number }[] }) {
  if (data.length === 0) return <Empty>No leads in the last 90 days.</Empty>
  const max = Math.max(...data.map(d => d.count))
  return (
    <div className="space-y-2">
      {data.slice(0, 10).map(d => (
        <div key={d.source} className="flex items-center gap-3">
          <div className="w-28 truncate text-xs font-semibold text-gray-700">{d.source}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center px-2 text-[11px] font-bold text-gray-900 tabular-nums">
              {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────────── status funnel ───────────── */

function StatusFunnel({ data }: { data: Record<LeadStatus, number> | null }) {
  if (!data) return <Empty>Loading…</Empty>
  const order: LeadStatus[] = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'paid', 'delayed', 'cancelled']
  const rows = order.map(s => ({ s, count: data[s] ?? 0 }))
  const max  = Math.max(1, ...rows.map(r => r.count))
  return (
    <div className="space-y-2">
      {rows.map(({ s, count }) => (
        <div key={s} className="flex items-center gap-3">
          <div className="w-24 text-xs font-bold text-gray-700">{LEAD_STATUS_META[s].short}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
            <div
              className={`h-full ${barColor(s)}`}
              style={{ width: `${(count / max) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center px-2 text-[11px] font-bold text-gray-900 tabular-nums">
              {count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
function barColor(s: LeadStatus): string {
  return {
    new:        'bg-blue-400',
    contacted:  'bg-indigo-400',
    interested: 'bg-purple-400',
    follow_up:  'bg-orange-400',
    confirmed:  'bg-emerald-400',
    paid:       'bg-yellow-400',
    delayed:    'bg-amber-500',
    cancelled:  'bg-gray-300',
    vip:        'bg-rose-400',
    converted:  'bg-yellow-400',
    rejected:   'bg-gray-300',
  }[s] ?? 'bg-gray-300'
}

/* ───────────── assistant table ───────────── */

function AssistantTable({ rows }: { rows: AssistantStat[] }) {
  if (rows.length === 0) return <Empty>No assistant activity yet.</Empty>
  return (
    <table className="w-full text-sm">
      <thead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
        <tr>
          <th className="text-left pb-2.5">Assistant</th>
          <th className="text-right pb-2.5">Lead actions</th>
          <th className="text-right pb-2.5">Paid</th>
          <th className="text-right pb-2.5">Conv %</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map(r => (
          <tr key={r.actor_email} className="text-gray-700">
            <td className="py-2.5 font-semibold text-gray-900">{r.actor_email}</td>
            <td className="py-2.5 text-right tabular-nums">{r.total}</td>
            <td className="py-2.5 text-right tabular-nums font-bold text-yellow-700">{r.paid}</td>
            <td className="py-2.5 text-right tabular-nums">{r.conversion}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-sm text-gray-400">{children}</div>
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
