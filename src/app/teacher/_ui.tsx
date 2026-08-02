'use client'

import type { LucideIcon } from 'lucide-react'
import { Star } from 'lucide-react'

/* Shared surfaces for the teaching space. Warm paper, white cards, one amber
   accent — deliberately not the CRM's black chrome. */

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_2px_rgba(28,25,23,.04)] ${className}`}>
      {children}
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
