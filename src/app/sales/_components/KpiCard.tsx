'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export type Tone = 'green' | 'yellow' | 'blue' | 'purple' | 'red' | 'orange' | 'zinc'

const TONE: Record<Tone, { iconBg: string; iconFg: string; spark: string }> = {
  green:  { iconBg: 'bg-emerald-50', iconFg: 'text-emerald-600', spark: '#10b981' },
  yellow: { iconBg: 'bg-amber-50',   iconFg: 'text-amber-600',   spark: '#f59e0b' },
  blue:   { iconBg: 'bg-blue-50',    iconFg: 'text-blue-600',    spark: '#3b82f6' },
  purple: { iconBg: 'bg-violet-50',  iconFg: 'text-violet-600',  spark: '#8b5cf6' },
  red:    { iconBg: 'bg-rose-50',    iconFg: 'text-rose-600',    spark: '#f43f5e' },
  orange: { iconBg: 'bg-orange-50',  iconFg: 'text-orange-600',  spark: '#f97316' },
  zinc:   { iconBg: 'bg-zinc-100',   iconFg: 'text-zinc-600',    spark: '#71717a' },
}

interface Props {
  label:     string
  value:     string | number
  unit?:     string
  icon:      LucideIcon
  tone?:     Tone
  /** % change vs previous period, e.g. 15 → "+15%". */
  deltaPct?: number
  deltaNote?: string
  /** Optional sparkline series — small numbers array. */
  spark?:    number[]
  onClick?:  () => void
}

export default function KpiCard({
  label, value, unit, icon: Icon, tone = 'zinc',
  deltaPct, deltaNote, spark, onClick,
}: Props) {
  const t = TONE[tone]
  const up = (deltaPct ?? 0) >= 0
  const sparkData = spark?.map((v, i) => ({ i, v })) ?? null

  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-2xl border border-zinc-200/80 p-4 lg:p-5 flex flex-col gap-3',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        onClick ? 'cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all' : '',
      ].join(' ')}
    >
      {/* Top: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-zinc-500 leading-tight">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={t.iconFg} strokeWidth={2.2} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <span className="text-[26px] lg:text-[28px] font-black text-zinc-900 leading-none tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('en-US') : value}
        </span>
        {unit && <span className="text-[13px] font-semibold text-zinc-400 mb-0.5">{unit}</span>}
      </div>

      {/* Bottom: delta + sparkline */}
      <div className="flex items-center justify-between gap-2 min-h-[28px]">
        {deltaPct !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className={[
              'inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md',
              up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
            ].join(' ')}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {up ? '+' : ''}{deltaPct}%
            </span>
            {deltaNote && <span className="text-[11px] text-zinc-400">{deltaNote}</span>}
          </div>
        ) : <span />}

        {sparkData && (
          <div className="w-20 h-7 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.spark} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={t.spark} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone" dataKey="v" stroke={t.spark} strokeWidth={2}
                  fill={`url(#spark-${tone})`} dot={false} isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
