'use client'

import { useId, useState } from 'react'
import { Counter, useInView } from './_motion'

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
  const { ref, seen } = useInView<HTMLDivElement>()
  const max = Math.max(1, ...data.map(d => d.value))
  const barW = 100 / Math.max(data.length, 1)

  return (
    <div className="relative" ref={ref}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img">
        {/* recessive grid — three lines is enough to read level */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1="0" x2="100" y1={height * f} y2={height * f}
                stroke={VIZ.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {data.map((d, i) => {
          const full = d.value === 0 ? 0 : Math.max(3, (d.value / max) * (height - 22))
          const h = seen ? full : 0
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
              style={{
                // each bar starts a beat after the one before it
                transition: `height .7s cubic-bezier(.22,1,.36,1) ${i * 55}ms, y .7s cubic-bezier(.22,1,.36,1) ${i * 55}ms, opacity .12s`,
              }}
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
  const { ref, seen } = useInView<HTMLDivElement>()
  if (data.length < 2) return <div className="h-[120px] flex items-center justify-center text-[12px] font-bold text-stone-300">لا بيانات كافية بعد</div>

  const max  = Math.max(1, ...data.map(d => d.value))
  const pad  = 10
  const stepX = 100 / (data.length - 1)
  const y = (v: number) => pad + (1 - v / max) * (height - pad * 2)
  const pts = data.map((d, i) => `${i * stepX},${y(d.value)}`).join(' ')

  return (
    <div className="relative" ref={ref}
         onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${pts} 100,${height}`} fill={`url(#${gid})`}
                 style={{ opacity: seen ? 1 : 0, transition: 'opacity .8s ease-out .25s' }} />
        {/* the line draws itself left to right on entry */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: seen ? 0 : 1,
                    transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)',
                  }} />
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
  const { ref, seen } = useInView<HTMLDivElement>()
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
    <div ref={ref}>
      {/* 2px gaps between segments come from the flex gap, not from strokes */}
      <div className="flex gap-[2px] h-3.5 rounded-full overflow-hidden">
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{
              width: seen ? `${(r.value / total) * 100}%` : '0%',
              background: r.color,
              transition: `width .8s cubic-bezier(.22,1,.36,1) ${i * 90}ms`,
            }}
            title={`${r.label}: ${r.value}`}
          />
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
  const { ref, seen } = useInView<HTMLDivElement>()
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={VIZ.grid} strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={seen ? c - (clamped / 100) * c : c}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Counter value={Math.round(clamped)} suffix="%" className="text-[19px] font-black leading-none" />
        {label && <span className="text-[9.5px] font-bold text-stone-400 mt-0.5">{label}</span>}
      </div>
    </div>
  )
}

/* ── Donut: a split of two or three parts ──────────────── */
// Categorical slots 1–3 of the reference palette — the only trio that clears the
// all-pairs CVD gate, which a pie needs (every slice is compared to every other).
export const SLICE = ['#2a78d6', '#eb6834', '#1baf7a'] as const

export function Donut({
  data, size = 128,
}: { data: { label: string; value: number }[]; size?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const { ref, seen } = useInView<HTMLDivElement>()
  const rows  = data.filter(d => d.value > 0).slice(0, 3)
  const total = rows.reduce((a, d) => a + d.value, 0)

  if (total === 0) {
    return <div className="py-10 text-center text-[12.5px] font-bold text-stone-300">لا بيانات بعد</div>
  }

  const r = (size - 22) / 2
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex items-center gap-5 flex-wrap" ref={ref}>
      <svg width={size} height={size} className="-rotate-90 shrink-0" role="img">
        {rows.map((d, i) => {
          const frac = d.value / total
          // 2px surface gap between slices, expressed as a dash gap
          const len  = Math.max(0, frac * c - 3)
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={SLICE[i]} strokeWidth="14" strokeLinecap="butt"
              strokeDasharray={seen ? `${len} ${c - len}` : `0 ${c}`}
              strokeDashoffset={-acc * c}
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ transition: `stroke-dasharray .8s cubic-bezier(.22,1,.36,1) ${i * 120}ms, opacity .12s` }}
            />
          )
          acc += frac
          return el
        })}
      </svg>

      {/* labels always visible — aqua sits under 3:1 on white, so the text carries it */}
      <div className="space-y-2 min-w-[7rem]">
        {rows.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: SLICE[i] }} />
            <span className="text-[12.5px] font-bold text-stone-600">{d.label}</span>
            <span className="text-[12.5px] font-black text-stone-900 tabular-nums mr-auto">
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Horizontal bars: ranked bands, one hue ────────────── */

export function HBars({
  data, color = VIZ.amber, unit = '',
}: { data: { label: string; value: number }[]; color?: string; unit?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>()
  const max = Math.max(1, ...data.map(d => d.value))
  if (data.length === 0) {
    return <div className="py-8 text-center text-[12.5px] font-bold text-stone-300">لا بيانات بعد</div>
  }
  return (
    <div className="space-y-2.5" ref={ref}>
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2.5">
          <span className="w-16 sm:w-20 text-[11.5px] font-bold text-stone-500 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 min-w-0 h-6 bg-stone-100 rounded-lg overflow-hidden">
            <div className="h-full rounded-lg"
                 style={{
                   width: seen ? `${Math.max(4, (d.value / max) * 100)}%` : '0%',
                   background: color,
                   transition: `width .8s cubic-bezier(.22,1,.36,1) ${i * 70}ms`,
                 }} />
          </div>
          {/* the value sits outside the bar — inside, a short bar clipped it */}
          <span className="w-9 text-[11.5px] font-black text-stone-700 tabular-nums shrink-0 text-left">
            {d.value}{unit}
          </span>
        </div>
      ))}
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
