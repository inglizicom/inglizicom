'use client'

import { useId, useState } from 'react'

/**
 * Hand-rolled SVG charts for the teaching space — no chart library, so nothing
 * new ships to the browser.
 *
 * Colour decisions, and why:
 *   • Attendance is the only multi-series encoding here. present / late / absent
 *     use green–blue–red (#0ca30c #2a78d6 #d03b3b), which clears the CVD gate on
 *     a white surface (worst adjacent pair ΔE 23.8 protan). The obvious
 *     green–amber–red fails it badly: amber and red land ΔE 3.2 apart under
 *     deuteranopia, i.e. the same colour. Every segment is labelled anyway, so
 *     colour never carries the meaning alone.
 *   • Everything else is one series, so it wears the brand amber and needs no
 *     palette — only contrast against the card.
 * Single theme on purpose: the whole product is light-mode.
 */

export const VIZ = {
  amber:   '#d97706',
  amberSoft: '#fef3c7',
  present: '#0ca30c',
  late:    '#2a78d6',
  absent:  '#d03b3b',
  grid:    '#e7e5e4',
  ink:     '#1c1917',
  muted:   '#a8a29e',
} as const

/* ── Bar chart: counts over a short window ─────────────── */

export function BarChart({
  data, height = 150, color = VIZ.amber, unit = '',
}: {
  data: { label: string; value: number }[]
  height?: number
  color?: string
  unit?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map(d => d.value))
  const barW = 100 / Math.max(data.length, 1)

  return (
    <div className="relative">
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img">
        {/* recessive grid — three lines is enough to read level */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1="0" x2="100" y1={height * f} y2={height * f}
                stroke={VIZ.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {data.map((d, i) => {
          const h = d.value === 0 ? 0 : Math.max(3, (d.value / max) * (height - 22))
          const w = barW * 0.56
          const x = i * barW + (barW - w) / 2
          return (
            <rect
              key={i}
              x={x} y={height - 18 - h} width={w} height={h}
              rx="2"
              fill={color}
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: 'opacity .12s' }}
            />
          )
        })}
      </svg>

      {/* labels live in HTML so they never distort with preserveAspectRatio */}
      <div className="flex mt-1">
        {data.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-stone-400 truncate" style={{ width: `${barW}%` }}>
            {d.label}
          </div>
        ))}
      </div>

      {hover !== null && (
        <div className="absolute -top-1 right-0 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg pointer-events-none">
          {data[hover].label}: {data[hover].value}{unit}
        </div>
      )}
    </div>
  )
}

/* ── Area trend: one measure over time ─────────────────── */

export function AreaTrend({
  data, height = 120, color = VIZ.amber, unit = '',
}: {
  data: { label: string; value: number }[]
  height?: number
  color?: string
  unit?: string
}) {
  const gid = useId().replace(/:/g, '')
  const [hover, setHover] = useState<number | null>(null)
  if (data.length < 2) return <div className="h-[120px] flex items-center justify-center text-[12px] font-bold text-stone-300">لا بيانات كافية بعد</div>

  const max  = Math.max(1, ...data.map(d => d.value))
  const pad  = 10
  const stepX = 100 / (data.length - 1)
  const y = (v: number) => pad + (1 - v / max) * (height - pad * 2)
  const pts = data.map((d, i) => `${i * stepX},${y(d.value)}`).join(' ')

  return (
    <div className="relative"
         onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${pts} 100,${height}`} fill={`url(#${gid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* emphasised endpoint */}
        <circle cx={100} cy={y(data[data.length - 1].value)} r="4" fill={color}
                stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* invisible hit strips — bigger than the marks */}
        {data.map((_, i) => (
          <rect key={i} x={i * stepX - stepX / 2} y="0" width={stepX} height={height}
                fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <line x1={hover * stepX} x2={hover * stepX} y1="0" y2={height}
                stroke={VIZ.muted} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      <div className="flex mt-1 justify-between text-[10px] font-bold text-stone-400">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>

      {hover !== null && (
        <div className="absolute -top-1 right-0 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg pointer-events-none">
          {data[hover].label}: {data[hover].value}{unit}
        </div>
      )}
    </div>
  )
}

/* ── Attendance ratio: one 100% stacked bar, always labelled ── */

export function AttendanceBar({
  present, late, absent,
}: { present: number; late: number; absent: number }) {
  const total = present + late + absent
  const rows = [
    { key: 'present', label: 'حاضر',  value: present, color: VIZ.present },
    { key: 'late',    label: 'متأخر', value: late,    color: VIZ.late },
    { key: 'absent',  label: 'غائب',  value: absent,  color: VIZ.absent },
  ].filter(r => r.value > 0)

  if (total === 0) {
    return <div className="py-8 text-center text-[12.5px] font-bold text-stone-300">لم يُسجَّل حضور بعد</div>
  }

  return (
    <div>
      {/* 2px gaps between segments come from the flex gap, not from strokes */}
      <div className="flex gap-[2px] h-3.5 rounded-full overflow-hidden">
        {rows.map(r => (
          <div key={r.key} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} title={`${r.label}: ${r.value}`} />
        ))}
      </div>

      {/* legend + direct values — identity never rests on colour alone */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
        {rows.map(r => (
          <div key={r.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
            <span className="text-[12px] font-bold text-stone-600">{r.label}</span>
            <span className="text-[12px] font-black text-stone-900 tabular-nums">
              {Math.round((r.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Progress ring: a single share, shown once ─────────── */

export function Ring({
  pct, size = 92, color = VIZ.amber, label,
}: { pct: number; size?: number; color?: string; label?: string }) {
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={VIZ.grid} strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c}
          style={{ transition: 'stroke-dashoffset .6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-black tabular-nums leading-none">{Math.round(clamped)}%</span>
        {label && <span className="text-[9.5px] font-bold text-stone-400 mt-0.5">{label}</span>}
      </div>
    </div>
  )
}

/* ── Sparkline: trend inside a stat tile ───────────────── */

export function Spark({ data, color = VIZ.amber }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const max = Math.max(1, ...data)
  const step = 100 / (data.length - 1)
  const pts = data.map((v, i) => `${i * step},${18 - (v / max) * 15}`).join(' ')
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-5" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
