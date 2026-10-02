'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, Copy, Share2 } from 'lucide-react'
import type { TeacherDeclared, TeacherProfile } from '@/lib/teachers'
import { Count } from './_ds'

/**
 * The dashboard kit — in the inglizi.com brand: the homepage blues (blue-600 → blue-900), the
 * amber→yellow gold, slate neutrals on a cool near-white ground.
 *
 * The teaching space is a product a teacher opens between classes, so it reads
 * like one: modular cards with a soft shadow, numbers first, and a clear next
 * action on every block. Gold is spent sparingly — on the call to action that
 * sells and on the rating, never as decoration.
 */

export const K = {
  bg:     '#F4F7FC',
  card:   '#FFFFFF',
  line:   '#E2E8F0',
  ink:    '#1E3A8A',
  muted:  '#64748B',
  faint:  '#94A3B8',
  gold:   '#F59E0B',
  goldInk:'#B45309',
  ok:     '#047857',
  bad:    '#B91C1C',
} as const

export const SHADOW = 'shadow-[0_1px_3px_rgba(30,58,138,.10),0_12px_32px_-10px_rgba(30,58,138,.26)]'
export const LIFT = 'transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(30,58,138,.12),0_22px_44px_-12px_rgba(30,58,138,.34)]'

/* ── Surfaces ──────────────────────────────────────────── */

export function Surface({
  children, className = '', as: Tag = 'div', id,
}: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'aside'; id?: string }) {
  return (
    <Tag id={id} className={`rounded-[24px] bg-white ring-1 ring-[#D6DFEC] ${SHADOW} ${LIFT} ${className}`}>
      {children}
    </Tag>
  )
}

/** Card heading: a tinted icon chip, a title, a one-line note, an action. */
export function CardHead({
  icon: Icon, title, note, action, tone = 'stone',
}: {
  icon: LucideIcon; title: string; note?: string; action?: React.ReactNode
  tone?: Tone
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TONE[tone]}`}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15.5px] font-bold leading-tight text-[#1E3A8A] truncate">{title}</h2>
        {note && <p className="text-[12px] font-medium text-[#94A3B8] mt-0.5 truncate">{note}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export type Tone = 'stone' | 'gold' | 'emerald' | 'sky' | 'violet' | 'rose'

export const TONE: Record<Tone, string> = {
  stone:   'bg-blue-100 text-blue-700',
  gold:    'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  sky:     'bg-sky-100 text-sky-700',
  violet:  'bg-indigo-100 text-indigo-700',
  rose:    'bg-rose-100 text-rose-700',
}

/** "See all" — the quiet link in a card's corner. */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
          className="text-[12px] font-bold text-[#64748B] hover:text-[#1E3A8A] px-2.5 py-1.5 rounded-full hover:bg-[#EEF2F7] transition-colors">
      {children}
    </Link>
  )
}

/* ── KPI ───────────────────────────────────────────────── */

/** A number with a label, a tone and an optional trend. `value` null shows a dash. */
export function Kpi({
  icon: Icon, label, value, decimals = 0, unit, sub, delta, tone = 'stone', href,
}: {
  icon: LucideIcon; label: string; value: number | null | undefined
  decimals?: number; unit?: string; sub?: string; delta?: number | null; tone?: Tone; href?: string
}) {
  const body = (
    <div className="h-full p-4 sm:p-5 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${TONE[tone]}`}>
          <Icon size={17} />
        </span>
        {delta != null && Number.isFinite(delta) && (
          <span className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full ${
            delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`} dir="ltr">
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        {value == null
          ? <span className="text-[28px] sm:text-[30px] font-extrabold leading-none text-[#CBD5E1]">—</span>
          : <Count value={value} decimals={decimals}
                   className="text-[28px] sm:text-[30px] font-extrabold tracking-tight leading-none text-[#1E3A8A]" />}
        {unit && value != null && <span className="text-[13px] font-bold text-[#94A3B8]">{unit}</span>}
      </div>
      <div className="mt-2 text-[12.5px] font-bold text-[#475569] leading-snug">{label}</div>
      {sub && <div className="mt-0.5 text-[11.5px] font-medium text-[#94A3B8] leading-snug">{sub}</div>}
    </div>
  )
  return href
    ? <Link href={href} className={`block rounded-[22px] bg-white ring-1 ring-[#D6DFEC] ${SHADOW} hover:ring-blue-300 hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(30,58,138,.12),0_22px_44px_-12px_rgba(30,58,138,.34)] transition`}>{body}</Link>
    : <div className={`rounded-[22px] bg-white ring-1 ring-[#D6DFEC] ${SHADOW}`}>{body}</div>
}

/* ── Buttons ───────────────────────────────────────────── */

type BtnKind = 'primary' | 'gold' | 'ghost' | 'glass'

const BTN: Record<BtnKind, string> = {
  // The site's two buttons: navy for the everyday move, the amber→yellow pill for the one that sells.
  primary: 'bg-gradient-to-l from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 shadow-[0_8px_20px_-12px_rgba(30,58,138,.7)]',
  gold:    'bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 ring-1 ring-amber-300 hover:shadow-amber-500/60 shadow-lg shadow-amber-500/30',
  ghost:   'bg-white text-[#334155] ring-1 ring-[#E2E8F0] hover:ring-brand-700 hover:text-brand-800',
  glass:   'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15 backdrop-blur',
}

export function Btn({
  href, onClick, icon: Icon, children, kind = 'primary', external = false, className = '', disabled,
}: {
  href?: string; onClick?: () => void; icon?: LucideIcon; children: React.ReactNode
  kind?: BtnKind; external?: boolean; className?: string; disabled?: boolean
}) {
  const cls = `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold
               whitespace-nowrap transition disabled:opacity-40 ${BTN[kind]} ${className}`
  const inner = <>{Icon && <Icon size={15} />}{children}</>
  if (href && external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  if (href) return <Link href={href} className={cls}>{inner}</Link>
  return <button type="button" onClick={onClick} disabled={disabled} className={cls}>{inner}</button>
}

/** Share the public page: the native share sheet where there is one, the
 *  clipboard everywhere else. Says what happened either way. */
export function ShareBtn({
  url, title, kind = 'ghost', label = 'مشاركة الملف', className = '',
}: { url: string; title: string; kind?: BtnKind; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  async function share() {
    if (!url) return
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch { /* the user closed the share sheet */ }
  }
  return (
    <Btn onClick={share} icon={done ? Check : Share2} kind={kind} className={className}>
      {done ? 'تم نسخ الرابط' : label}
    </Btn>
  )
}

export function CopyBtn({ text, label = 'نسخ الرابط' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <Btn kind="ghost" icon={done ? Check : Copy}
         onClick={async () => {
           try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) } catch {}
         }}>
      {done ? 'تم النسخ' : label}
    </Btn>
  )
}

/* ── People ────────────────────────────────────────────── */

export function Face({
  name, url, size = 36, className = '',
}: { name: string; url?: string | null; size?: number; className?: string }) {
  const initial = (name || '؟').trim().charAt(0)
  return url
    ? /* eslint-disable-next-line @next/next/no-img-element */
      <img src={url} alt="" style={{ width: size, height: size }}
           className={`rounded-full object-cover shrink-0 ${className}`} />
    : <span style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
            className={`rounded-full shrink-0 flex items-center justify-center font-bold
                        bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] text-[#1E40AF] ${className}`}>
        {initial}
      </span>
}

export function Chip({ children, tone = 'stone' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold ${TONE[tone]}`}>
      {children}
    </span>
  )
}

/** Week-over-week (or month-over-month) change, rounded. null when the base is empty. */
export function pctDelta(now: number, before: number): number | null {
  if (!before) return null
  return Math.round(((now - before) / before) * 100)
}

/** What a complete public page needs — shared by the dashboard and the profile
 *  page so both show the same score. */
export function profileChecklist(p: Partial<TeacherProfile & TeacherDeclared> | null | undefined) {
  const items = [
    { label: 'صورة شخصية واضحة',         done: !!p?.avatar_url },
    { label: 'عنوان مهني جذاب',           done: !!(p?.tagline || p?.headline) },
    { label: 'نبذة من 80 حرفاً أو أكثر',  done: (p?.bio ?? '').trim().length >= 80 },
    { label: 'المستويات التي تُدرّسها',   done: (p?.levels?.length ?? 0) > 0 },
    { label: 'ما تُدرّسه وتخصصاتك',       done: ((p?.teaches?.length ?? 0) + (p?.specialties?.length ?? 0)) > 0 },
    { label: 'شهادة واحدة على الأقل',     done: (p?.certificates?.length ?? 0) > 0 },
    { label: 'لغات التواصل',              done: (p?.languages?.length ?? 0) > 0 },
  ]
  const done = items.filter(i => i.done).length
  return { items, done, pct: Math.round((done / items.length) * 100) }
}

/** The public page URL for a teacher, on whichever host the space is served from. */
export function publicProfileUrl(teacherId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/teacher-showcase/${teacherId}`
}
