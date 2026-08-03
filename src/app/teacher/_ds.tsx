'use client'

import { motion, useInView, useMotionValue, useSpring, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

/**
 * The teaching space design system — dark first.
 *
 * Three rules hold the whole surface together:
 *   1. Depth comes from light, not from borders. A card is a dark plane with a
 *      1px top highlight where light would catch it, and a wide soft shadow
 *      beneath. No grey outlines.
 *   2. Colour is structural. Each domain owns a hue (violet identity, sky
 *      schedule, emerald money, amber achievement) and never borrows another's.
 *   3. Motion is a response, not decoration. Things move because they arrived,
 *      or because you touched them.
 */

export const T = {
  bg:    '#0B1020',
  card:  '#151C32',
  line:  'rgba(255,255,255,.07)',
  text:  '#FFFFFF',
  muted: '#94A3B8',
  prim:  '#5B5FEF',
  sec:   '#8B5CF6',
  acc:   '#38BDF8',
  ok:    '#22C55E',
  warn:  '#F59E0B',
  bad:   '#EF4444',
} as const

export const GRAD = {
  violet:  'from-[#5B5FEF] to-[#8B5CF6]',
  sky:     'from-[#38BDF8] to-[#5B5FEF]',
  emerald: 'from-[#22C55E] to-[#38BDF8]',
  amber:   'from-[#F59E0B] to-[#EF4444]',
  rose:    'from-[#EF4444] to-[#8B5CF6]',
} as const
export type Grad = keyof typeof GRAD

/* ── Motion presets ────────────────────────────────────── */

export const rise: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/** Wraps a block so it rises into place the first time it is seen.
 *
 *  The three-second fallback is not decoration. `whileInView` never fires for
 *  content below the fold in a print, a full-page screenshot, or a background
 *  tab with throttled observers — and a block stuck at opacity 0 is an invisible
 *  page, not a missed animation. So it reveals itself regardless. */
export function Rise({
  children, i = 0, className = '',
}: { children: React.ReactNode; i?: number; className?: string }) {
  const [forced, setForced] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setForced(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <motion.div
      className={className}
      custom={i}
      variants={rise}
      initial="hidden"
      animate={forced ? 'visible' : undefined}
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  )
}

/** Seen-yet? — framer's useInView plus the same three-second fallback, so no
 *  animated value can be stranded at its initial state off-screen. */
export function useSeen(ref: React.RefObject<Element | null>) {
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const [forced, setForced] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setForced(true), 3000)
    return () => window.clearTimeout(t)
  }, [])
  return inView || forced
}

/* ── Surfaces ──────────────────────────────────────────── */

/** The base plane. `glow` paints a soft coloured bloom in one corner. */
export function Panel({
  children, className = '', glow, hover = false,
}: {
  children: React.ReactNode
  className?: string
  glow?: Grad
  hover?: boolean
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[22px] bg-[#151C32]',
        // the 1px inner highlight is what makes it read as a lit plane
        'ring-1 ring-white/[.06] shadow-[0_1px_0_0_rgba(255,255,255,.06)_inset,0_24px_48px_-24px_rgba(0,0,0,.8)]',
        hover ? 'transition-all duration-300 hover:ring-white/[.12] hover:-translate-y-1 hover:shadow-[0_1px_0_0_rgba(255,255,255,.1)_inset,0_32px_64px_-24px_rgba(0,0,0,.9)]' : '',
        className,
      ].join(' ')}
    >
      {glow && (
        <span
          className={`pointer-events-none absolute -top-24 -left-16 w-56 h-56 rounded-full bg-gradient-to-br ${GRAD[glow]} opacity-[.18] blur-[64px]`}
          aria-hidden
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

/** Section heading: an icon in its domain colour, a title, an optional action. */
export function Head({
  icon: Icon, title, note, action, grad = 'violet',
}: {
  icon: LucideIcon; title: string; note?: string; action?: React.ReactNode; grad?: Grad
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRAD[grad]} flex items-center justify-center shrink-0 shadow-lg`}>
        <Icon size={17} className="text-white" />
      </span>
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-tight text-white leading-tight">{title}</h2>
        {note && <p className="text-[11.5px] text-slate-400 font-medium truncate">{note}</p>}
      </div>
      {action && <div className="mr-auto shrink-0">{action}</div>}
    </div>
  )
}

/* ── Numbers that count ────────────────────────────────── */

export function Count({
  value, decimals = 0, prefix = '', suffix = '', className = '',
}: { value: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const seen = useSeen(ref)
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 90, damping: 22 })
  const [shown, setShown] = useState('0')

  useEffect(() => { if (seen) mv.set(value) }, [seen, value, mv])
  useEffect(() => spring.on('change', v => setShown(v.toFixed(decimals))), [spring, decimals])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{shown}{suffix}
    </span>
  )
}

/* ── Stat card ─────────────────────────────────────────── */

export function Stat({
  icon: Icon, label, value, decimals = 0, prefix, suffix, delta, grad, i = 0, foot,
}: {
  icon: LucideIcon; label: string; value: number
  decimals?: number; prefix?: string; suffix?: string
  delta?: number; grad: Grad; i?: number; foot?: React.ReactNode
}) {
  return (
    <Rise i={i}>
      <Panel hover glow={grad} className="p-5 h-full">
        <div className="flex items-start justify-between gap-3">
          <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRAD[grad]} flex items-center justify-center shadow-lg`}>
            <Icon size={18} className="text-white" />
          </span>
          {delta !== undefined && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              delta >= 0 ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'}`}>
              {delta >= 0 ? '+' : ''}{delta}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <Count value={value} decimals={decimals} prefix={prefix} suffix={suffix}
                 className="block text-[30px] font-bold tracking-tight text-white leading-none" />
          <div className="text-[12px] font-medium text-slate-400 mt-1.5">{label}</div>
        </div>
        {foot && <div className="mt-3.5 pt-3.5 border-t border-white/[.06]">{foot}</div>}
      </Panel>
    </Rise>
  )
}

/* ── Progress ──────────────────────────────────────────── */

export function Bar({ pct, grad = 'violet', height = 6 }: { pct: number; grad?: Grad; height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const seen = useSeen(ref)
  return (
    <div ref={ref} className="w-full rounded-full bg-white/[.06] overflow-hidden" style={{ height }}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-l ${GRAD[grad]}`}
        initial={{ width: 0 }}
        animate={{ width: seen ? `${Math.max(0, Math.min(100, pct))}%` : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/** A ring for a single share — used for completion and attendance. */
export function Dial({
  pct, size = 108, grad = 'violet', label,
}: { pct: number; size?: number; grad?: Grad; label?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const seen = useSeen(ref)
  const r = (size - 14) / 2
  const c = 2 * Math.PI * r
  const gid = `dial-${grad}`
  const stops: Record<Grad, [string, string]> = {
    violet: ['#5B5FEF', '#8B5CF6'], sky: ['#38BDF8', '#5B5FEF'],
    emerald: ['#22C55E', '#38BDF8'], amber: ['#F59E0B', '#EF4444'], rose: ['#EF4444', '#8B5CF6'],
  }
  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops[grad][0]} />
            <stop offset="100%" stopColor={stops[grad][1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: seen ? c - (Math.max(0, Math.min(100, pct)) / 100) * c : c }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Count value={pct} suffix="%" className="text-[22px] font-bold text-white leading-none" />
        {label && <span className="text-[10px] font-medium text-slate-400 mt-1">{label}</span>}
      </div>
    </div>
  )
}

/* ── Pill ──────────────────────────────────────────────── */

export function Chip({
  children, tone = 'muted',
}: { children: React.ReactNode; tone?: 'muted' | 'violet' | 'sky' | 'ok' | 'warn' | 'bad' }) {
  const tones = {
    muted:  'bg-white/[.06] text-slate-300 ring-white/[.08]',
    violet: 'bg-[#5B5FEF]/15 text-indigo-300 ring-[#5B5FEF]/25',
    sky:    'bg-[#38BDF8]/15 text-sky-300 ring-[#38BDF8]/25',
    ok:     'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
    warn:   'bg-amber-500/15 text-amber-300 ring-amber-500/25',
    bad:    'bg-rose-500/15 text-rose-300 ring-rose-500/25',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

/** Primary action — gradient fill, lifts and brightens on press. */
export function Action({
  icon: Icon, children, onClick, grad = 'violet', full = false,
}: {
  icon?: LucideIcon; children: React.ReactNode; onClick?: () => void; grad?: Grad; full?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gradient-to-l ${GRAD[grad]} text-white text-[13px] font-semibold
                  shadow-[0_8px_24px_-8px_rgba(91,95,239,.6)] hover:shadow-[0_12px_32px_-8px_rgba(91,95,239,.8)]
                  transition-shadow`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  )
}

/** Secondary action — glass, for anything that isn't the main move. */
export function Ghost({
  icon: Icon, children, onClick, full = false,
}: { icon?: LucideIcon; children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-white/[.05] ring-1 ring-white/[.08] backdrop-blur text-slate-200 text-[13px] font-semibold
                  hover:bg-white/[.09] hover:text-white transition-colors`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  )
}
