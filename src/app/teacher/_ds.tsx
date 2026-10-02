'use client'

import { motion, useInView, useMotionValue, useSpring, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

/**
 * The teaching space design system.
 *
 * These are the primitives the section pages still lean on, brought into the
 * editorial language that _paper.tsx sets. The names and signatures did not
 * change, so no page had to be rewritten to follow — but what they render did:
 *   1. A surface is a white card on the ivory ground: a warm hairline and one
 *      soft, low shadow — the same card as the dashboard kit (_kit.tsx).
 *   2. A heading is a small-caps label, not a coloured tile with a title
 *      beside it. It names the band and gets out of the way.
 *   3. A stat is a figure said at size, not a card. The number is the point;
 *      the box around it never was.
 *   4. Ink is brown-black. #1E3A8A on warm off-white is the contrast of print.
 *   5. Colour identifies and nothing else — an edge tab, a bar, a chip.
 */

export const T = {
  bg:    '#F4F7FC',
  card:  '#FFFFFF',
  line:  '#E2E8F0',
  text:  '#1E3A8A',
  muted: '#64748B',
  prim:  '#6D28D9',
  sec:   '#7C3AED',
  acc:   '#0369A1',
  ok:    '#047857',
  warn:  '#B45309',
  bad:   '#BE123C',
} as const

/** Icon-tile gradients. Deep enough that white glyphs hold on them. */
export const GRAD = {
  violet:  'from-[#7C3AED] to-[#6D28D9]',
  sky:     'from-[#0EA5E9] to-[#0369A1]',
  emerald: 'from-[#10B981] to-[#047857]',
  amber:   'from-[#F59E0B] to-[#B45309]',
  rose:    'from-[#F43F5E] to-[#BE123C]',
} as const
export type Grad = keyof typeof GRAD

/** Tinted washes for chips and soft accents. */
const TINT: Record<Grad, string> = {
  violet:  'bg-violet-50 text-violet-700 ring-violet-200',
  sky:     'bg-sky-50 text-sky-700 ring-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber:   'bg-amber-50 text-amber-700 ring-amber-200',
  rose:    'bg-rose-50 text-rose-700 ring-rose-200',
}

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

/** The sheet. `glow` tints the top edge in a domain colour — a tab on a file,
 *  not a bloom. */
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
        // The dashboard card: white on ivory, a warm hairline, a soft low shadow.
        'relative overflow-hidden rounded-[22px] bg-white ring-1 ring-[#D6DFEC]',
        'shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)]',
        hover ? 'transition-colors duration-200 hover:ring-[#CBD5E1]' : '',
        className,
      ].join(' ')}
    >
      {glow && (
        <span
          className={`pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b ${GRAD[glow]}`}
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
    <div className="flex items-baseline gap-3 mb-6">
      <Icon size={14} className="text-[#94A3B8] shrink-0 self-center" />
      <h2 className="text-[13px] font-bold tracking-[.14em] uppercase text-[#94A3B8] leading-none">{title}</h2>
      {note && <span className="text-[12px] text-[#CBD5E1] truncate">{note}</span>}
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
      <div className="h-full py-1">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={14} className="text-[#94A3B8]" />
          <span className="text-[11.5px] font-bold tracking-[.1em] uppercase text-[#94A3B8]">{label}</span>
          {delta !== undefined && (
            <span className={`text-[11px] font-bold tabular-nums ${
              delta >= 0 ? 'text-[#047857]' : 'text-[#B91C1C]'}`}>
              {delta >= 0 ? '+' : ''}{delta}%
            </span>
          )}
        </div>
        <Count value={value} decimals={decimals} prefix={prefix} suffix={suffix}
               className="block text-[34px] sm:text-[40px] font-extrabold tracking-tight text-[#1E3A8A] leading-none" />
        {foot && <div className="mt-3">{foot}</div>}
      </div>
    </Rise>
  )
}

/* ── Progress ──────────────────────────────────────────── */

export function Bar({ pct, grad = 'violet', height = 6 }: { pct: number; grad?: Grad; height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const seen = useSeen(ref)
  return (
    <div ref={ref} className="w-full rounded-full bg-[#EEF2F7] overflow-hidden" style={{ height }}>
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
    violet: ['#7C3AED', '#6D28D9'], sky: ['#0EA5E9', '#0369A1'],
    emerald: ['#10B981', '#047857'], amber: ['#F59E0B', '#B45309'], rose: ['#F43F5E', '#BE123C'],
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F7" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: seen ? c - (Math.max(0, Math.min(100, pct)) / 100) * c : c }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Count value={pct} suffix="%" className="text-[22px] font-bold text-[#1E3A8A] leading-none" />
        {label && <span className="text-[10px] font-medium text-[#64748B] mt-1">{label}</span>}
      </div>
    </div>
  )
}

/* ── Pill ──────────────────────────────────────────────── */

export function Chip({
  children, tone = 'muted',
}: { children: React.ReactNode; tone?: 'muted' | 'violet' | 'sky' | 'ok' | 'warn' | 'bad' }) {
  const tones: Record<string, string> = {
    muted:  'bg-white text-[#475569] ring-[#E2E8F0]',
    violet: TINT.violet,
    sky:    TINT.sky,
    ok:     TINT.emerald,
    warn:   TINT.amber,
    bad:    TINT.rose,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

/** Primary action — solid ink, lifts on press. Colour is reserved for
 *  identification, so the main move is simply the darkest thing on the page. */
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
      className={`${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                  bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[13px] font-bold hover:from-blue-500 hover:to-blue-700 transition-colors`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  )
}

/** Secondary action — a white sheet with a hairline, for anything that isn't
 *  the main move. */
export function Ghost({
  icon: Icon, children, onClick, full = false,
}: { icon?: LucideIcon; children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${full ? 'w-full' : ''} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                  bg-white ring-1 ring-[#E2E8F0] text-[#334155] text-[13px] font-bold
                  hover:ring-[#1E3A8A] hover:text-[#1E3A8A] transition-colors`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  )
}
