'use client'

import { Fragment, useEffect, type CSSProperties, type ReactNode } from 'react'
import { icons, type LucideIcon } from 'lucide-react'
import { BareSheet, THEMES } from '../games/_shared'
import { QrLink } from '@/components/QrLink'
import { PARTS, type Region } from '@/data/viiza-book'

/**
 * The look of VIIZA ENGLISH, the travel guide: the cover's red, saffron and
 * navy on white paper, Bricolage Grotesque for English and Noto Kufi Arabic
 * for Arabic (the cover's faces). One accent per job, never more: red for
 * the traveller's own voice and the book's frame, navy for what others say
 * and for ink, saffron for tips. Pictures are lucide line icons, so the
 * pages stay calm and print sharp.
 */

export const C = {
  red: '#A3262A', redD: '#7F1D21', redS: '#FBEEEC',
  saff: '#F2B300', saffD: '#8A6400', saffS: '#FFF5D6',
  navy: '#0E1240', navyS: '#EEF0F8',
  ink: '#0E1240', grey: '#5B6474', line: '#E6E1D7', cream: '#FBF6EC',
} as const

export const EN = "'Bricolage Grotesque', 'Noto Kufi Arabic', sans-serif"
export const AR = "'Noto Kufi Arabic', 'Tajawal', sans-serif"
export const HAND = "'Caveat', 'Bricolage Grotesque', cursive"
export const MONO_FACE = "'JetBrains Mono', ui-monospace, Consolas, monospace"

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@600;700&display=swap'

export function useViizaFonts() {
  useEffect(() => {
    if (document.getElementById('viiza-fonts')) return
    const link = document.createElement('link')
    link.id = 'viiza-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

/** A lucide icon by name (the book's data names its pictures). */
export function Ico({ name, size = 18, color = 'currentColor', stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  const I = (icons as Record<string, LucideIcon>)[name] ?? icons.Circle
  return <I size={size} color={color} strokeWidth={stroke} aria-hidden />
}
export const hasIcon = (name: string) => name in icons

/* ── Text ───────────────────────────────────────────────────────────── */

/** "______" in a sentence: a line to write on. */
function withBlanks(text: string, key = '') {
  return text.split(/(_{3,})/).map((p, i) => (/^_{3,}$/.test(p)
    ? <span key={key + i} className="inline-block align-baseline border-b-[1.5px]" style={{ width: Math.min(140, p.length * 13), borderColor: '#8A93A6', transform: 'translateY(2px)' }} />
    : <Fragment key={key + i}>{p}</Fragment>))
}

/** English, with blanks drawn. */
export function En({ children, className = '', style }: { children: string; className?: string; style?: CSSProperties }) {
  return <span dir="ltr" className={className} style={{ fontFamily: EN, ...style }}>{withBlanks(children)}</span>
}

/** Arabic that quotes English: each English run isolated, so the order holds. */
export function Ar({ children, className = '', style, as = 'div' }: { children: string; className?: string; style?: CSSProperties; as?: 'div' | 'span' }) {
  // An English run starts with a letter or a digit and may hold spaces, units and signs ("100 ml", "40°C", "100–240V", "B1/B2").
  const parts = children.split(/([A-Za-z0-9][A-Za-z0-9\s/'’.,:+\-–&!?°%@]*[A-Za-z0-9!?°%]|[A-Za-z0-9])/).filter(Boolean)
  const body = parts.map((p, i) => (/[A-Za-z0-9]/.test(p) ? <bdi key={i} dir="ltr" style={{ fontFamily: /[A-Za-z]/.test(p) ? EN : undefined }}>{p}</bdi> : <Fragment key={i}>{withBlanks(p, String(i))}</Fragment>))
  const Tag = as
  return <Tag dir="rtl" className={className} style={{ fontFamily: AR, ...style }}>{body}</Tag>
}

/* ── Badges ─────────────────────────────────────────────────────────── */

export const REGION: Record<Region, { en: string; ar: string }> = {
  all: { en: 'ALL TRIPS', ar: 'كل الوجهات' },
  gulf: { en: 'GULF', ar: 'الخليج' },
  usa: { en: 'USA', ar: 'أمريكا' },
  uk: { en: 'UK', ar: 'بريطانيا' },
  europe: { en: 'EUROPE', ar: 'أوروبا' },
}

export function RegionBadge({ region }: { region: Region }) {
  const r = REGION[region]
  const solid = region !== 'all'
  return (
    <span className="inline-flex w-[64px] shrink-0 flex-col items-center justify-center rounded-md py-[3px] leading-none"
      style={{ background: solid ? C.navy : '#fff', color: solid ? '#fff' : C.navy, border: `1.5px solid ${C.navy}` }}>
      <span className="text-[9.5px] font-extrabold tracking-[0.06em]" style={{ fontFamily: EN }}>{r.en}</span>
      <span className="mt-[2px] text-[9.5px] font-bold" style={{ fontFamily: AR, color: solid ? C.saff : C.grey }}>{r.ar}</span>
    </span>
  )
}

/** A section heading: icon tile, English label, rule, Arabic label. */
export function Sec({ icon, en, ar, color = C.red, className = '' }: { icon: string; en: string; ar: string; color?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} dir="ltr">
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-md" style={{ background: color }}><Ico name={icon} size={15} color="#fff" stroke={2.3} /></span>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]" style={{ fontFamily: EN, color }}>{en}</span>
      <span className="h-[1.5px] flex-1" style={{ background: C.line }} />
      <Ar as="span" className="text-[15px] font-bold" style={{ color }}>{ar}</Ar>
    </div>
  )
}

/* ── The sheet ──────────────────────────────────────────────────────── */

const MONO = THEMES.find(t => t.id === 'mono') ?? THEMES[0]

/** A full A4 sheet with the book's faces, PNG and print like every other book. */
export function Sheet({ label, filename, children, bg = '#fff' }: { label: string; filename: string; children: ReactNode; bg?: string }) {
  useViizaFonts()
  return (
    <BareSheet theme={MONO} label={label} filename={filename}>
      {/* crm-raw: the CRM repaints black as navy (tailwind.config.js); the book sets its own colours. */}
      <div className="crm-raw absolute inset-0 overflow-hidden" style={{ background: bg, color: C.ink, fontFamily: EN }}>{children}</div>
    </BareSheet>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The page footer: series, site, page number. */
export function Footer({ pageNo, dark, book = 'TRAVEL GUIDE' }: { pageNo: number; dark?: boolean; book?: string }) {
  const fg = dark ? '#fff' : C.ink
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[34px] items-center justify-between pl-10" dir="ltr" style={{ color: fg }}>
      <span className="text-[10.5px] font-extrabold tracking-[0.14em]"><span style={{ color: dark ? C.saff : C.red }}>VIIZA</span> ENGLISH · {book}</span>
      <span className="text-[11px] font-extrabold">Inglizi<span style={{ color: dark ? C.saff : C.red }}>.com</span></span>
      <span className="flex h-full w-[64px] items-center justify-center text-[14px] font-extrabold text-white" style={{ background: dark ? C.redD : C.red }}>{pad(pageNo)}</span>
    </div>
  )
}

/** The running head of a stop's inner pages. */
export function StopHead({ n, titleEn, titleAr, part, section }: { n: number; titleEn: string; titleAr: string; part: number; section: string }) {
  const p = PARTS.find(x => x.n === part)!
  return (
    <div className="flex h-[54px] items-stretch" dir="ltr" style={{ borderBottom: `2px solid ${C.red}` }}>
      <div className="flex w-[64px] flex-col items-center justify-center text-white" style={{ background: C.red }}>
        <span className="text-[8.5px] font-extrabold tracking-[0.18em] opacity-80">STOP</span>
        <span className="text-[22px] font-extrabold leading-none">{pad(n)}</span>
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 px-5">
        <div className="leading-tight">
          <div className="text-[17px] font-extrabold">{titleEn}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.grey }}>Part {p.n} · {p.titleEn} · {section}</div>
        </div>
        <Ar className="text-[17px] font-extrabold" style={{ color: C.red }}>{titleAr}</Ar>
      </div>
    </div>
  )
}

/** The body box of a page: fixed height, so an overflow shows (and the check script can measure it). */
export function Body({ children, top = 54, className = '' }: { children: ReactNode; top?: number; className?: string }) {
  return (
    <div className={`vz-body absolute inset-x-0 overflow-hidden px-10 ${className}`} style={{ top: top + 14, bottom: 34 + 10 }}>
      {children}
    </div>
  )
}

/** The route line: the six parts as stations, this one lit. */
export function Route({ part, light = true }: { part: number; light?: boolean }) {
  return (
    <div className="relative flex items-start justify-between" dir="ltr">
      <div className="absolute left-[18px] right-[18px] top-[17px] border-t-2 border-dashed" style={{ borderColor: light ? 'rgba(255,255,255,0.45)' : C.line }} />
      {PARTS.map(p => {
        const done = p.n < part, here = p.n === part
        return (
          <div key={p.n} className="relative z-10 flex w-[86px] flex-col items-center gap-1">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full"
              style={here ? { background: C.saff, boxShadow: '0 0 0 4px rgba(242,179,0,0.28)' } : done ? { background: '#fff' } : { background: light ? C.red : '#fff', border: `2px solid ${light ? 'rgba(255,255,255,0.55)' : C.line}` }}>
              <Ico name={p.icon} size={17} color={here ? C.navy : done ? C.red : light ? 'rgba(255,255,255,0.75)' : C.grey} stroke={2.2} />
            </span>
            <span className="text-center text-[9px] font-extrabold uppercase leading-tight tracking-[0.06em]" style={{ color: light ? (here ? C.saff : 'rgba(255,255,255,0.8)') : here ? C.red : C.grey }}>{p.titleEn}</span>
          </div>
        )
      })}
    </div>
  )
}

/** The QR to a stop's audio, on a white tile. */
export function Qr({ url, size = 64 }: { url: string; size?: number }) {
  return <span className="rounded-lg bg-white p-[5px]"><QrLink url={url} size={size} color={C.ink} labelColor={C.grey} /></span>
}

export const PAD = pad
