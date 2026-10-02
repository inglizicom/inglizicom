'use client'

import type { LucideIcon } from 'lucide-react'
import { FlaskConical, Star } from 'lucide-react'
import { Counter, Reveal } from './_motion'

/* Shared surfaces for the teaching space. White sheets on a warm desk; colour is
   structural, never decorative. Shared by every page in the space. */

/** The surface everything sits on: a white card on the ivory ground with a
 *  warm hairline and a soft, low shadow — the same card as the dashboard kit. */
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-[22px] ring-1 ring-[#D6DFEC]
                     shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)] ${className}`}>
      {children}
    </div>
  )
}

/* ── Page hero ─────────────────────────────────────────── */

/* Each section says what kind of page it is, in one word, above the title. */
const TONE = {
  amber:   { kicker: 'إنجاز' },
  blue:    { kicker: 'الجدول' },
  violet:  { kicker: 'فضاء الأساتذة' },
  emerald: { kicker: 'الطلاب' },
  rose:    { kicker: 'الملفات' },
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
  return (
    <div className="pb-8 mb-2 border-b border-[#E2E8F0]">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[12rem]">
          <div className="flex items-center gap-2 mb-3">
            <Icon size={14} className="text-[#94A3B8]" />
            <span className="text-[12px] font-bold tracking-[.14em] uppercase text-[#94A3B8]">{TONE[tone].kicker}</span>
          </div>
          <h1 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight leading-[1.15] text-[#1E3A8A]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#64748B] text-[14.5px] font-medium mt-2.5 max-w-[38rem] leading-snug">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-y-6 gap-x-8 mt-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="min-w-[7rem]">
                <Counter value={s.value} suffix={s.suffix}
                         className="block text-[30px] sm:text-[34px] font-extrabold tracking-tight leading-none text-[#1E3A8A]" />
                <div className="text-[12px] font-semibold text-[#64748B] mt-2">{s.label}</div>
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
      <h2 className="text-[16px] font-bold tracking-tight text-[#1E3A8A]">{children}</h2>
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
    neutral: 'bg-[#F4F7FC] text-[#475569]',
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
        <div className="text-[11.5px] font-medium text-[#64748B] truncate">{label}</div>
        <div className="text-[22px] font-bold leading-tight tabular-nums text-[#1E3A8A]">{value}</div>
        {sub && <div className="text-[11px] text-[#94A3B8] font-medium truncate">{sub}</div>}
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
          className={i <= Math.round(value) ? 'fill-amber-500 text-amber-500' : 'text-[#CBD5E1]'}
        />
      ))}
    </span>
  )
}

export function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#EEF2F7] flex items-center justify-center text-[#94A3B8]">
        <Icon size={24} />
      </div>
      <div className="font-bold text-[#1E3A8A]">{title}</div>
      {hint && <div className="text-[13px] text-[#64748B] mt-1 max-w-sm mx-auto">{hint}</div>}
    </div>
  )
}

export function Pill({ tone, children }: { tone: 'scheduled' | 'live' | 'done' | 'cancelled' | 'muted'; children: React.ReactNode }) {
  const tones = {
    scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
    live:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    done:      'bg-[#F4F7FC] text-[#64748B] border-[#E2E8F0]',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    muted:     'bg-[#F4F7FC] text-[#64748B] border-[#E2E8F0]',
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
