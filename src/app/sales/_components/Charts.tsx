'use client'

import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

/* Shared palette — matches KPI tones */
export const CHART_COLORS = [
  '#f43f5e', // rose (instagram)
  '#10b981', // emerald (whatsapp)
  '#3b82f6', // blue (website)
  '#18181b', // black (tiktok)
  '#a855f7', // purple (facebook)
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#71717a', // zinc
]

/* ── Card wrapper ──────────────────────────────────────────── */
export function ChartCard({
  title, action, children, className = '',
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] text-zinc-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

/* ── Area trend (revenue over time) ────────────────────────── */
export function AreaTrend({
  data, color = '#f59e0b', height = 240, valueLabel = '',
}: {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  valueLabel?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="areaTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
        <XAxis
          dataKey="label" tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false} tickLine={false} reversed
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false}
          width={40} orientation="right"
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12, direction: 'rtl' }}
          formatter={(v: number) => [`${v.toLocaleString('en-US')} ${valueLabel}`, '']}
          labelStyle={{ color: '#71717a' }}
        />
        <Area
          type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          fill="url(#areaTrend)" dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── Donut breakdown (revenue by source) ───────────────────── */
export function DonutBreakdown({
  data, height = 220, unit = '',
}: {
  data: { label: string; value: number }[]
  height?: number
  unit?: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: height, height }} className="flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} dataKey="value" nameKey="label"
              cx="50%" cy="50%" innerRadius="62%" outerRadius="100%"
              paddingAngle={2} stroke="none"
            >
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12, direction: 'rtl' }}
              formatter={(v: number) => [`${v.toLocaleString('en-US')} ${unit}`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[18px] font-black text-zinc-900">{total.toLocaleString('en-US')}</span>
          <span className="text-[10px] text-zinc-400">{unit}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 min-w-0">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-zinc-600 flex-1 truncate">{d.label}</span>
              <span className="text-zinc-400" dir="ltr">{d.value.toLocaleString('en-US')}</span>
              <span className="font-bold text-zinc-700 w-9 text-left">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Bar status (leads by status) ──────────────────────────── */
export function BarStatus({
  data, height = 220,
}: {
  data: { label: string; value: number; color?: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} reversed />
        <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={28} orientation="right" />
        <Tooltip
          cursor={{ fill: '#fafafa' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12, direction: 'rtl' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((d, i) => <Cell key={i} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Funnel (conversion) ───────────────────────────────────── */
export function Funnel({
  steps,
}: {
  steps: { label: string; count: number; pct: number }[]
}) {
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e']
  const max = Math.max(...steps.map(s => s.count), 1)
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => {
        const widthPct = Math.max((s.count / max) * 100, 8)
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 relative h-9">
              <div
                className="absolute inset-y-0 right-0 rounded-lg flex items-center px-3 transition-all"
                style={{ width: `${widthPct}%`, background: colors[i % colors.length] }}
              >
                <span className="text-white text-[12px] font-bold truncate">{s.count.toLocaleString('en-US')}</span>
              </div>
            </div>
            <div className="w-28 flex items-center justify-between flex-shrink-0">
              <span className="text-[13px] text-zinc-600 truncate">{s.label}</span>
              <span className="text-[12px] font-bold text-zinc-400">{s.pct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
