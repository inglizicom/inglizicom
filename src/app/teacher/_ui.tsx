'use client'

import type { LucideIcon } from 'lucide-react'
import { FlaskConical, Star } from 'lucide-react'
import { Counter, Reveal } from './_motion'

/* Shared surfaces for the teaching space. White sheets on a warm desk; colour is
   structural, never decorative. Shared by every page in the space. */

/** The surface everything sits on: a warm hairline ring rather than a grey
 *  border, and a two-part shadow — a tight contact shadow plus a wide soft one
 *  — so a card reads as paper lifted off the desk, not drawn onto it. */
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-[20px] ring-1 ring-[#E7E2D8]
                     shadow-[0_1px_2px_rgba(28,25,23,.04),0_12px_28px_-18px_rgba(28,25,23,.28)]
                     ${className}`}>
      {children}
    </div>
  )
}

/* ── Page hero ─────────────────────────────────────────── */

const TONE = {
  amber:   { chip: 'bg-gradient-to-br from-[#F59E0B] to-[#B45309] text-white', bar: 'from-[#F59E0B] to-[#B45309]' },
  blue:    { chip: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] text-white', bar: 'from-[#0EA5E9] to-[#0369A1]' },
  violet:  { chip: 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white', bar: 'from-[#7C3AED] to-[#6D28D9]' },
  emerald: { chip: 'bg-gradient-to-br from-[#10B981] to-[#047857] text-white', bar: 'from-[#10B981] to-[#047857]' },
  rose:    { chip: 'bg-gradient-to-br from-[#F43F5E] to-[#BE123C] text-white', bar: 'from-[#F43F5E] to-[#BE123C]' },
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
          <h1 className="text-[24px] sm:text-[27px] font-bold tracking-tight leading-none text-[#1C1917]">{title}</h1>
          {subtitle && <p className="text-[#78716C] text-[13px] font-medium mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="group relative overflow-hidden bg-white rounded-[18px]
                              ring-1 ring-[#E7E2D8] px-4 py-3
                              shadow-[0_1px_2px_rgba(28,25,23,.04),0_12px_28px_-18px_rgba(28,25,23,.28)]
                              hover:ring-[#D9D2C4] hover:-translate-y-1 transition-all duration-300">
                <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l ${t.bar}`} aria-hidden />
                {/* the colour breathes on hover instead of the card changing shape */}
                <span className={`absolute -top-10 -left-6 w-24 h-24 rounded-full bg-gradient-to-l ${t.bar}
                                  opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} aria-hidden />
                <div className="relative text-[10.5px] font-medium text-[#78716C] truncate">{s.label}</div>
                <Counter value={s.value} suffix={s.suffix} className="relative text-[23px] font-bold leading-tight text-[#1C1917]" />
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
    <div className="flex items-center gap-2.5 rounded-2xl bg-fuchsia-50 ring-1 ring-fuchsia-200 px-4 py-2.5">
      <FlaskConical size={15} className="text-fuchsia-600 shrink-0" />
      <span className="text-[12.5px] font-medium text-fuchsia-800">
        معاينة ببيانات وهمية — لا شيء هنا حقيقي.
      </span>
      <a href="?demo=0" className="mr-auto text-[12px] font-bold text-fuchsia-700 hover:text-fuchsia-900 underline underline-offset-2">
        إيقاف المعاينة
      </a>
    </div>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[16px] font-bold tracking-tight text-[#1C1917]">{children}</h2>
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
    neutral: 'bg-[#F6F4EF] text-[#57534E]',
    amber:   'bg-amber-50 text-amber-700',
    good:    'bg-emerald-50 text-emerald-700',
    alert:   'bg-rose-50 text-rose-700',
  }
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-medium text-[#78716C] truncate">{label}</div>
        <div className="text-[22px] font-bold leading-tight tabular-nums text-[#1C1917]">{value}</div>
        {sub && <div className="text-[11px] text-[#A8A29E] font-medium truncate">{sub}</div>}
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
          className={i <= Math.round(value) ? 'fill-amber-500 text-amber-500' : 'text-[#D6D3D1]'}
        />
      ))}
    </span>
  )
}

export function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F1EDE4] flex items-center justify-center text-[#A8A29E]">
        <Icon size={24} />
      </div>
      <div className="font-bold text-[#1C1917]">{title}</div>
      {hint && <div className="text-[13px] text-[#78716C] mt-1 max-w-sm mx-auto">{hint}</div>}
    </div>
  )
}

export function Pill({ tone, children }: { tone: 'scheduled' | 'live' | 'done' | 'cancelled' | 'muted'; children: React.ReactNode }) {
  const tones = {
    scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
    live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    done:      'bg-[#F6F4EF] text-[#78716C] border-[#E7E2D8]',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    muted:     'bg-[#F6F4EF] text-[#78716C] border-[#E7E2D8]',
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
