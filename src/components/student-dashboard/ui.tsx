'use client'

import type { LucideIcon } from 'lucide-react'
import { BookOpen, CalendarCheck, ChevronLeft, GraduationCap, Sparkles, UserRound } from 'lucide-react'
import { TRACK_STYLE, type TrackKind } from '@/lib/student-dashboard'

/**
 * Shared pieces of the student dashboard.
 *
 * Palette: an ivory ground, white cards with a warm hairline, charcoal text and
 * the course theme's dark brown (--ic-dark) for the strong surfaces, with its
 * gold (--ic-gold) as the one accent. Inherits the student space's per-course
 * theme, so the dashboard and the lessons always look like one product.
 */

export const W = {
  ink: '#1F1A16', brown: '#3A2A1D', muted: '#7A6E62', faint: '#A89B8C',
  line: '#ECE4D8', soft: '#F7F2EA', card: '#FFFFFF',
} as const

export const SHADOW = 'shadow-[0_1px_3px_rgba(58,42,29,.08),0_14px_32px_-14px_rgba(58,42,29,.28)]'

export function Panel({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`rounded-[22px] bg-white ring-1 ring-[#ECE4D8] ${SHADOW} ${className}`}>{children}</section>
}

export function PanelHead({ icon: Icon, title, sub, action }: { icon: LucideIcon; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ic-gold-soft,#F6EBD3)] text-[var(--ic-dark,#3A2A1D)]">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15.5px] font-extrabold text-[#1F1A16]">{title}</h2>
        {sub && <p className="truncate text-[11.5px] font-medium text-[#A89B8C]">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export type KpiTone = 'gold' | 'brown' | 'green' | 'rose' | 'stone' | 'blue'
const KPI_TONE: Record<KpiTone, string> = {
  gold:  'bg-amber-100 text-amber-800',
  brown: 'bg-[#EFE4D6] text-[#5A3E28]',
  green: 'bg-emerald-100 text-emerald-700',
  rose:  'bg-rose-100 text-rose-700',
  stone: 'bg-stone-100 text-stone-700',
  blue:  'bg-sky-100 text-sky-700',
}

export function Kpi({ icon: Icon, label, value, sub, tone = 'gold' }: {
  icon: LucideIcon; label: string; value: React.ReactNode; sub?: string; tone?: KpiTone
}) {
  const empty = value == null || value === '—'
  return (
    <div className={`rounded-[18px] bg-white p-3.5 ring-1 ring-[#ECE4D8] ${SHADOW}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${KPI_TONE[tone]}`}><Icon size={15} /></span>
        <span className="text-[11.5px] font-bold leading-tight text-[#7A6E62]">{label}</span>
      </div>
      <div className={`mt-2.5 text-[22px] font-black leading-none tabular-nums ${empty ? 'text-[#D9CFC2]' : 'text-[#1F1A16]'}`}>{empty ? '—' : value}</div>
      {sub && <div className="mt-1 truncate text-[11px] font-medium text-[#A89B8C]">{sub}</div>}
    </div>
  )
}

export function Bar({ pct, cls = 'bg-[var(--ic-gold,#C9A24A)]', h = 'h-2' }: { pct: number; cls?: string; h?: string }) {
  return (
    <div className={`w-full ${h} overflow-hidden rounded-full bg-[#EFE8DD]`}>
      <div className={`h-full rounded-full ${cls} transition-all duration-700`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

export function Ring({ pct, size = 96, label, stroke = 'var(--ic-gold,#C9A24A)', dark = false }: {
  pct: number; size?: number; label?: string; stroke?: string; dark?: boolean
}) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-label={`${v}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,.14)' : '#EFE8DD'} strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-[20px] font-black leading-none tabular-nums ${dark ? 'text-white' : 'text-[#1F1A16]'}`}>{v}%</span>
        {label && <span className={`mt-0.5 text-[10px] font-bold ${dark ? 'text-white/70' : 'text-[#A89B8C]'}`}>{label}</span>}
      </div>
    </div>
  )
}

export function Face({ name, url, size = 40, className = '' }: { name: string; url?: string | null; size?: number; className?: string }) {
  return url
    ? /* eslint-disable-next-line @next/next/no-img-element */
      <img src={url} alt="" style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ${className}`} />
    : <span style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F3E7D3] to-[#E3CFAF] font-black text-[#5A3E28] ${className}`}>
        {(name || '؟').trim().charAt(0)}
      </span>
}

export type PillTone = 'ok' | 'warn' | 'bad' | 'muted' | 'gold'
const PILL: Record<PillTone, string> = {
  ok: 'bg-emerald-50 text-emerald-700 ring-emerald-200', warn: 'bg-amber-50 text-amber-800 ring-amber-200',
  bad: 'bg-rose-50 text-rose-700 ring-rose-200', muted: 'bg-stone-50 text-stone-600 ring-stone-200',
  gold: 'bg-[var(--ic-gold-soft,#F6EBD3)] text-[#5A3E28] ring-[#E7D6B5]',
}
export function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${PILL[tone]}`}>{children}</span>
}

export function Empty({ icon: Icon, text, hint }: { icon: LucideIcon; text: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E2D8C8] bg-[#FBF8F3] px-4 py-6 text-center">
      <Icon size={22} className="mx-auto mb-1.5 text-[#C9BBA6]" />
      <p className="text-[13px] font-bold text-[#7A6E62]">{text}</p>
      {hint && <p className="mt-0.5 text-[11.5px] text-[#A89B8C]">{hint}</p>}
    </div>
  )
}

export function TrackBadges({ kinds, size = 'md' }: { kinds: TrackKind[]; size?: 'sm' | 'md' }) {
  if (!kinds.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {kinds.map(k => (
        <span key={k} className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-bold ${TRACK_STYLE[k].cls}
                                   ${size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${TRACK_STYLE[k].dot}`} /> {TRACK_STYLE[k].label}
        </span>
      ))}
    </div>
  )
}

/* ── Identity header (both screens) ────────────────────── */

export interface QuickAction { label: string; icon: LucideIcon; onClick: () => void; primary?: boolean }

export function IdentityHeader({ name, avatarUrl, trackLabel, kinds, level, enrolledAt, statusLabel, actions }: {
  name: string; avatarUrl: string | null; trackLabel: string; kinds: TrackKind[]
  level: string | null; enrolledAt: string | null; statusLabel?: string; actions: QuickAction[]
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[var(--ic-dark,#3A2A1D)] via-[var(--ic-dark-2,#4A3524)] to-[var(--ic-dark-3,#2A1D12)] p-5 text-white shadow-[0_24px_50px_-24px_rgba(42,29,18,.7)] sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.32),transparent_65%)]" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <Face name={name} url={avatarUrl} size={64} className="ring-4 ring-[var(--ic-gold,#C9A24A)]/50" />
          <div className="min-w-0">
            <h1 className="truncate text-[21px] font-black leading-tight text-white sm:text-[24px]">{name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-amber-100/80">
              <span className="inline-flex items-center gap-1 font-bold text-[var(--ic-gold,#E9C77F)]"><Sparkles size={12} /> {trackLabel}</span>
              {level && <span className="inline-flex items-center gap-1"><GraduationCap size={13} /> المستوى <b dir="ltr" className="text-white">{level}</b></span>}
              {enrolledAt && <span className="inline-flex items-center gap-1"><CalendarCheck size={13} /> منذ {new Date(enrolledAt).toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}</span>}
              {statusLabel && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white">{statusLabel}</span>}
            </div>
            {kinds.length > 0 && <div className="mt-2 [&_span]:!bg-white/10 [&_span]:!text-white [&_span]:!ring-white/15"><TrackBadges kinds={kinds} size="sm" /></div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {actions.map(a => (
            <button key={a.label} type="button" onClick={a.onClick}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-black transition
                                ${a.primary ? 'bg-[var(--ic-gold,#C9A24A)] text-black shadow-lg shadow-black/20 hover:brightness-105'
                                            : 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15'}`}>
              <a.icon size={15} /> {a.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── The two main entry buttons (home) ─────────────────── */

export function EntryCards({ onCourses, onProfile, coursesSub, profileSub }: {
  onCourses: () => void; onProfile: () => void; coursesSub: string; profileSub: string
}) {
  const card = 'group relative flex min-h-[112px] items-center gap-3.5 overflow-hidden rounded-[22px] p-4 text-right transition hover:-translate-y-0.5 sm:p-5'
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button type="button" onClick={onCourses}
              className={`${card} bg-gradient-to-br from-[var(--ic-dark,#3A2A1D)] to-[var(--ic-dark-3,#2A1D12)] text-white shadow-[0_18px_36px_-18px_rgba(42,29,18,.75)]`}>
        <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.35),transparent_65%)]" />
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--ic-gold,#C9A24A)] text-black shadow-lg"><BookOpen size={26} /></span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-[18px] font-black">دوراتي</span>
          <span className="block truncate text-[12px] text-amber-100/75">{coursesSub}</span>
        </span>
        <ChevronLeft size={20} className="relative shrink-0 text-amber-100/70 transition group-hover:-translate-x-1" />
      </button>
      <button type="button" onClick={onProfile}
              className={`${card} bg-white text-[#1F1A16] ring-1 ring-[#ECE4D8] ${SHADOW}`}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--ic-gold-soft,#F6EBD3)] text-[var(--ic-dark,#3A2A1D)]"><UserRound size={26} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-black">ملفي</span>
          <span className="block truncate text-[12px] text-[#7A6E62]">{profileSub}</span>
        </span>
        <ChevronLeft size={20} className="shrink-0 text-[#C9BBA6] transition group-hover:-translate-x-1" />
      </button>
    </div>
  )
}

export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' })
export const fmtHour = (iso: string) => new Date(iso).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
export const mad = (n: number) => `${Number(n).toLocaleString('en-US')} درهم`
