'use client'

import type { LucideIcon } from 'lucide-react'
import { FlaskConical, Star } from 'lucide-react'
import { Counter, Reveal } from './_motion'

/* Shared surfaces for the teaching space. Warm paper, white cards, one amber
   accent — deliberately not the CRM's black chrome. */

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(28,25,23,.04),0_8px_24px_-18px_rgba(28,25,23,.4)] ${className}`}>
      {children}
    </div>
  )
}

/* ── Page hero ─────────────────────────────────────────── */

const TONE = {
  amber:   { chip: 'bg-amber-100 text-amber-700',     bar: 'from-amber-400 to-orange-500' },
  blue:    { chip: 'bg-blue-100 text-blue-700',       bar: 'from-blue-500 to-indigo-500' },
  violet:  { chip: 'bg-violet-100 text-violet-700',   bar: 'from-violet-500 to-fuchsia-500' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-500 to-teal-500' },
  rose:    { chip: 'bg-rose-100 text-rose-700',       bar: 'from-rose-500 to-pink-500' },
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
          <h1 className="text-[24px] sm:text-[27px] font-black tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-stone-400 text-[13px] font-bold mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-stone-200/80 px-4 py-3
                              shadow-[0_1px_2px_rgba(28,25,23,.04),0_10px_26px_-20px_rgba(28,25,23,.5)]
                              hover:shadow-[0_2px_4px_rgba(28,25,23,.06),0_14px_30px_-18px_rgba(28,25,23,.55)]
                              hover:-translate-y-0.5 transition duration-300">
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${t.bar}`} aria-hidden />
                <div className="text-[10.5px] font-bold text-stone-400 truncate">{s.label}</div>
                <Counter value={s.value} suffix={s.suffix} className="text-[23px] font-black leading-tight" />
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
    <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 px-4 py-2.5">
      <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
      <span className="text-[12.5px] font-bold text-fuchsia-900">
        معاينة ببيانات وهمية — لا شيء هنا حقيقي.
      </span>
      <a href="?demo=0" className="mr-auto text-[12px] font-black text-fuchsia-700 hover:text-fuchsia-900 underline underline-offset-2">
        إيقاف المعاينة
      </a>
    </div>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[17px] font-black tracking-tight">{children}</h2>
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
    neutral: 'bg-stone-100 text-stone-600',
    amber:   'bg-amber-100 text-amber-700',
    good:    'bg-emerald-100 text-emerald-700',
    alert:   'bg-red-100 text-red-600',
  }
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold text-stone-400 truncate">{label}</div>
        <div className="text-[22px] font-black leading-tight tabular-nums">{value}</div>
        {sub && <div className="text-[11px] text-stone-400 font-semibold truncate">{sub}</div>}
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
          className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
        />
      ))}
    </span>
  )
}

export function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
        <Icon size={24} />
      </div>
      <div className="font-black text-stone-700">{title}</div>
      {hint && <div className="text-[13px] text-stone-400 mt-1 max-w-sm mx-auto">{hint}</div>}
    </div>
  )
}

export function Pill({ tone, children }: { tone: 'scheduled' | 'live' | 'done' | 'cancelled' | 'muted'; children: React.ReactNode }) {
  const tones = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    done:      'bg-stone-100 text-stone-600 border-stone-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    muted:     'bg-stone-50 text-stone-500 border-stone-200',
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
