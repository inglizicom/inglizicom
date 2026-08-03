'use client'

import type { LucideIcon } from 'lucide-react'
import { FlaskConical, Star } from 'lucide-react'
import { Counter, Reveal } from './_motion'

/* Shared surfaces for the teaching space. Dark planes lit from above; colour is
   structural, never decorative. Shared by every page in the space. */

/** The surface everything sits on: a hairline ring rather than a border, and a
 *  two-part shadow — a tight contact shadow plus a wide soft one — so cards read
 *  as lifted off the mesh instead of drawn onto it. */
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#151C32] rounded-[22px] ring-1 ring-white/[.06]
                     shadow-[0_1px_0_0_rgba(255,255,255,.06)_inset,0_24px_48px_-24px_rgba(0,0,0,.8)]
                     ${className}`}>
      {children}
    </div>
  )
}

/* ── Page hero ─────────────────────────────────────────── */

const TONE = {
  amber:   { chip: 'bg-gradient-to-br from-[#F59E0B] to-[#EF4444] text-white', bar: 'from-[#F59E0B] to-[#EF4444]' },
  blue:    { chip: 'bg-gradient-to-br from-[#38BDF8] to-[#5B5FEF] text-white', bar: 'from-[#38BDF8] to-[#5B5FEF]' },
  violet:  { chip: 'bg-gradient-to-br from-[#5B5FEF] to-[#8B5CF6] text-white', bar: 'from-[#5B5FEF] to-[#8B5CF6]' },
  emerald: { chip: 'bg-gradient-to-br from-[#22C55E] to-[#38BDF8] text-white', bar: 'from-[#22C55E] to-[#38BDF8]' },
  rose:    { chip: 'bg-gradient-to-br from-[#EF4444] to-[#8B5CF6] text-white', bar: 'from-[#EF4444] to-[#8B5CF6]' },
}
export type Tone = keyof typeof TONE

/** A compact page header: title, a coloured icon, and the page's own numbers as
 *  small cards that count up on entry. Deliberately not a full-bleed hero —
 *  the detail below is what matters, and a banner on every screen delays it. */
export function PageHero({
  icon: Icon, title, subtitle, tone, stats, action,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  tone: Tone
  stats?: { label: string; value: number; suffix?: string }[]
  action?: React.ReactNode
}) {
  const t = TONE[tone]
  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${t.chip}`}>
          <Icon size={21} />
        </span>
        <div className="flex-1 min-w-[11rem]">
          <h1 className="text-[24px] sm:text-[27px] font-bold tracking-tight leading-none text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 text-[13px] font-medium mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="group relative overflow-hidden bg-[#151C32] rounded-[20px]
                              ring-1 ring-white/[.06] px-4 py-3
                              shadow-[0_1px_0_0_rgba(255,255,255,.06)_inset,0_20px_40px_-24px_rgba(0,0,0,.8)]
                              hover:ring-white/[.12] hover:-translate-y-1 transition-all duration-300">
                <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l ${t.bar}`} aria-hidden />
                {/* the colour breathes on hover instead of the card changing shape */}
                <span className={`absolute -top-10 -left-6 w-24 h-24 rounded-full bg-gradient-to-l ${t.bar}
                                  opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} aria-hidden />
                <div className="relative text-[10.5px] font-medium text-slate-400 truncate">{s.label}</div>
                <Counter value={s.value} suffix={s.suffix} className="relative text-[23px] font-bold leading-tight text-white" />
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

/** Shown on every page while `?demo=1` is active. */
export function DemoBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-500/[.08] ring-1 ring-fuchsia-500/20 px-4 py-2.5">
      <FlaskConical size={15} className="text-fuchsia-400 shrink-0" />
      <span className="text-[12.5px] font-medium text-fuchsia-200">
        معاينة ببيانات وهمية — لا شيء هنا حقيقي.
      </span>
      <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-300 hover:text-white underline underline-offset-2">
        إيقاف المعاينة
      </a>
    </div>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[16px] font-bold tracking-tight text-white">{children}</h2>
      {action}
    </div>
  )
}

export function StatTile({
  icon: Icon, label, value, sub, tone = 'neutral',
}: {
  icon: LucideIcon; label: string; value: React.ReactNode; sub?: string
  tone?: 'neutral' | 'amber' | 'good' | 'alert'
}) {
  const tones = {
    neutral: 'bg-white/[.06] text-slate-300',
    amber:   'bg-amber-500/15 text-amber-300',
    good:    'bg-emerald-500/15 text-emerald-300',
    alert:   'bg-rose-500/15 text-rose-300',
  }
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-medium text-slate-400 truncate">{label}</div>
        <div className="text-[22px] font-bold leading-tight tabular-nums text-white">{value}</div>
        {sub && <div className="text-[11px] text-slate-500 font-medium truncate">{sub}</div>}
      </div>
    </Card>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-white/15'}
        />
      ))}
    </span>
  )
}

export function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/[.05] flex items-center justify-center text-slate-500">
        <Icon size={24} />
      </div>
      <div className="font-bold text-slate-200">{title}</div>
      {hint && <div className="text-[13px] text-slate-500 mt-1 max-w-sm mx-auto">{hint}</div>}
    </div>
  )
}

export function Pill({ tone, children }: { tone: 'scheduled' | 'live' | 'done' | 'cancelled' | 'muted'; children: React.ReactNode }) {
  const tones = {
    scheduled: 'bg-[#38BDF8]/15 text-sky-300 border-[#38BDF8]/25',
    live:      'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    done:      'bg-white/[.06] text-slate-400 border-white/[.08]',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    muted:     'bg-white/[.05] text-slate-400 border-white/[.07]',
  }
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  )
}

/* ── Arabic date + time helpers ─────────────────────────── */

const AR = 'ar-MA'

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(AR, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(AR, { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`
}

/** "بعد ساعتين" / "الآن" / "قبل 3 أيام" — relative, in Arabic. */
export function fromNow(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const abs  = Math.abs(diff)
  const min  = Math.round(abs / 60000)
  const rtf  = new Intl.RelativeTimeFormat(AR, { numeric: 'auto' })
  const sign = diff < 0 ? -1 : 1
  if (min < 1)    return 'الآن'
  if (min < 60)   return rtf.format(sign * min, 'minute')
  if (min < 1440) return rtf.format(sign * Math.round(min / 60), 'hour')
  return rtf.format(sign * Math.round(min / 1440), 'day')
}

export const STATUS_AR: Record<string, string> = {
  scheduled: 'مبرمجة',
  live:      'جارية الآن',
  done:      'منتهية',
  cancelled: 'ملغاة',
  present:   'حاضر',
  late:      'متأخر',
  absent:    'غائب',
  excused:   'بعذر',
  group:     'جماعية',
  private:   'فردية',
}
