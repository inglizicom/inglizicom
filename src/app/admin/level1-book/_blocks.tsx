'use client'

import { Fragment, useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'
import {
  Atom, BookOpen, Calculator, Compass, FlaskConical, Globe, GraduationCap, Lightbulb, Microscope, Music, NotebookPen,
  Palette, Paperclip, Pencil, Phone, Ruler, Scissors, type LucideIcon,
} from 'lucide-react'
import { BareSheet, THEMES } from '../games/_shared'
import type { Block, FlagId, Lesson } from '@/data/level1-book'

/**
 * The look of «الإنجليزية من الصفر (الدارجة)»: black and white, bold
 * handwritten type (Mali for English, Baloo Bhaijaan 2 / Lalezar for
 * Arabic), black bars and labels, grey clip-art (emoji in grayscale), and a
 * header / footer on every lesson. Each lesson page is drawn from its blocks
 * (data/level1-book.ts); pages are full-bleed A4 sheets (BareSheet), so
 * print and PNG behave like the workbook's.
 */

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Mali:wght@500;600;700&family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Lalezar&display=swap'
export const EN = "'Mali', 'Baloo Bhaijaan 2', sans-serif"
export const AR = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif"
export const AR_DISPLAY = "'Lalezar', 'Baloo Bhaijaan 2', sans-serif"
const GREY: CSSProperties = { filter: 'grayscale(1) contrast(1.15)' }
const MONO = THEMES.find(t => t.id === 'mono') ?? THEMES[0]
const pad = (n: number) => String(n).padStart(2, '0')

export function useBookFonts() {
  useEffect(() => {
    if (document.getElementById('level1-fonts')) return
    const link = document.createElement('link')
    link.id = 'level1-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

export interface BookInfo {
  title: string; level: string; teacher: string; teacherAr: string; phone: string; website: string
  /** Who this copy is for — the thank-you page and, if `stamp`, every footer. */
  buyer: string; buyerFemale: boolean; stamp: boolean
}

export const DEFAULT_INFO: BookInfo = {
  title: 'الإنجليزية من الصفر (الدارجة)', level: 'Level 1 - (A0 - A1)', teacher: 'Hamza El Qasraoui', teacherAr: 'حمزة القصراوي',
  phone: '0707902091', website: 'www.inglizi.com', buyer: '', buyerFemale: false, stamp: true,
}

const intl = (phone: string) => (phone.startsWith('0') ? `+212${phone.slice(1)}` : phone)

/** English with Arabic runs isolated, so mixed lines keep their order. */
export function Mixed({ text }: { text: string }) {
  const parts = text.split(/([؀-ۿ][؀-ۿ\s،؟.()\-–/«»"]*)/).filter(Boolean)
  return <>{parts.map((p, i) => (/[؀-ۿ]/.test(p) ? <bdi key={i} dir="rtl" className="mx-[0.15em]" style={{ fontFamily: AR }}>{p.trim()}</bdi> : <Fragment key={i}>{p}</Fragment>))}</>
}
/** Text whose first letter is Arabic reads right to left, whatever it quotes in English. */
const isAr = (s: string) => /^[^A-Za-z؀-ۿ]*[؀-ۿ]/.test(s)

/* ── Page frame ──────────────────────────────────────────────────────── */

function Frame({ info, label, filename, children }: { info: BookInfo; label: string; filename: string; children: ReactNode }) {
  useBookFonts()
  return (
    <BareSheet theme={MONO} label={label} filename={filename}>
      {/* crm-raw: the CRM repaints black as navy (tailwind.config.js); this book is printed black. */}
      <div className="crm-raw absolute inset-0 bg-white text-black overflow-hidden" style={{ fontFamily: EN }}>{children}</div>
    </BareSheet>
  )
}

function LessonHeader({ info, n }: { info: BookInfo; n: number }) {
  return (
    <div className="absolute inset-x-[22px] top-[10px] flex items-start justify-between" dir="ltr">
      <div className="w-[158px] text-center">
        <div className="bg-black text-white rounded-[3px] text-[19px] font-bold leading-[30px]">Lesson {pad(n)}</div>
        <div className="text-[12px] font-bold underline tracking-[0.16em] mt-0.5 whitespace-nowrap">{info.teacher}</div>
      </div>
      <div className="mt-[3px] bg-black text-white rounded-[3px] px-5 h-[42px] flex items-center gap-2 text-[19px] font-bold" style={{ fontFamily: AR }} dir="rtl">
        <span>{info.title}</span><Lightbulb size={18} />
      </div>
      <div className="w-[172px] text-center">
        <div className="bg-black text-white rounded-[3px] text-[17px] font-bold leading-[30px] whitespace-nowrap">{info.level}</div>
        <div className="flex justify-between text-[11.5px] font-bold underline mt-0.5">
          <span>{info.phone}</span><span dir="rtl" style={{ fontFamily: AR }}>لطلب الكتاب</span>
        </div>
      </div>
    </div>
  )
}

function Footer({ info, page }: { info: BookInfo; page: string }) {
  return (
    <div className="lb-foot absolute inset-x-[22px] bottom-[10px] h-[21px] bg-black text-white flex items-center justify-between px-3 text-[11px] font-bold" dir="ltr">
      <span>{info.website}</span>
      <span>{page}{info.stamp && info.buyer.trim() ? <span className="opacity-70" style={{ fontFamily: AR }}> · {info.buyer.trim()}</span> : null}</span>
      <span>{info.phone}</span>
    </div>
  )
}

/**
 * Grows a lesson to fill its page, like the Canva originals: the content is
 * zoomed (up to MAX_ZOOM), then stepped back until it fits. A zoomed box
 * keeps its 100% width, so the content re-flows across the full page width.
 * Runs once the fonts are in.
 */
const MAX_ZOOM = 1.35, MIN_ZOOM = 0.85
function useFillPage(deps: unknown[]) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false
    const fit = () => {
      const body = bodyRef.current, inner = innerRef.current
      if (cancelled || !body || !inner) return
      const apply = (z: number) => { inner.style.zoom = String(z) }
      const height = () => inner.getBoundingClientRect().height
      apply(1)
      const avail = body.clientHeight, natural = height()
      if (natural >= avail * 0.92 && natural <= avail) return
      // Too short: grow. Too long: shrink a little (never below MIN_ZOOM).
      let z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, (avail * 0.98) / natural))
      apply(z)
      while (z > MIN_ZOOM && height() > avail) { z = Math.max(MIN_ZOOM, z - 0.02); apply(z) }
    }
    void document.fonts?.ready.then(fit)
    fit()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { bodyRef, innerRef }
}

export function LessonPage({ info, lesson, pageNo, talkNo, filename }: {
  info: BookInfo; lesson: Lesson; pageNo: number; talkNo: Map<Block, number>; filename: string
}) {
  const { bodyRef, innerRef } = useFillPage([lesson, info.title, info.level])
  return (
    <Frame info={info} label={`الدرس ${lesson.n} — ${lesson.titleAr} · صفحة ${pageNo}`} filename={filename}>
      <LessonHeader info={info} n={lesson.n} />
      <div ref={bodyRef} className="lb-body absolute inset-x-[22px] overflow-hidden" style={{ top: 80, bottom: 36 }} dir="ltr">
        <div ref={innerRef}><Blocks blocks={lesson.blocks} talkNo={talkNo} /></div>
      </div>
      <Footer info={info} page={`Page ${pad(pageNo)}`} />
    </Frame>
  )
}

/* ── Blocks ──────────────────────────────────────────────────────────── */

type Ctx = { talkNo: Map<Block, number> }

function Blocks({ blocks, talkNo }: { blocks: Block[] } & Ctx) {
  return <div className="flex flex-col gap-[7px]">{blocks.map((b, i) => <BlockView key={i} b={b} talkNo={talkNo} />)}</div>
}

const Dot = () => <span className="mt-[0.5em] w-[6px] h-[6px] rounded-full bg-black shrink-0" />

function Bullet({ children, tick }: { children: ReactNode; tick?: boolean }) {
  return (
    <div className="flex gap-1.5 leading-snug">
      {tick ? <span className="shrink-0">✅</span> : <Dot />}
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/** Column-major grid: the first column fills top to bottom, like the book. */
function Columns({ items, cols, render }: { items: string[]; cols: number; render: (s: string, i: number) => ReactNode }) {
  const rows = Math.ceil(items.length / cols)
  return (
    <div className="grid gap-x-4 gap-y-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, auto)`, gridAutoFlow: 'column' }}>
      {items.map((s, i) => <Fragment key={i}>{render(s, i)}</Fragment>)}
    </div>
  )
}

/** All-Arabic text runs right to left; mixed text keeps each run in order. */
const Txt = ({ s }: { s: string }) => (isAr(s) ? <span dir="rtl" style={{ fontFamily: AR }}>{s}</span> : <Mixed text={s} />)

const BarTitle = ({ title, icon }: { title: string; icon?: string }) => (
  <div className="bg-black text-white rounded-[3px] px-3 min-h-[30px] py-0.5 flex items-center gap-2 text-[17px] font-bold leading-tight">
    <span className="w-[7px] h-[7px] rounded-full bg-white shrink-0" />
    {icon && <span style={GREY}>{icon}</span>}
    <span><Mixed text={title} /></span>
  </div>
)

const Label = ({ children, size = 11.5, className = '' }: { children: ReactNode; size?: number; className?: string }) => (
  <div className={`bg-black text-white rounded-[2px] px-1.5 py-[2px] text-center font-bold leading-tight ${className}`} style={{ fontSize: size }}>{children}</div>
)
const WhiteBox = ({ children, size = 11.5, className = '' }: { children: ReactNode; size?: number; className?: string }) => (
  <div className={`border-[1.5px] border-black rounded-[2px] px-1.5 py-[1px] text-center font-bold leading-tight ${className}`} style={{ fontSize: size }}>{children}</div>
)

function BlockView({ b, talkNo }: { b: Block } & Ctx) {
  switch (b.t) {
    case 'note': return (
      <div className="flex justify-end text-[12.5px] font-bold"><Bullet>{b.text}</Bullet></div>
    )
    case 'gap': return <div style={{ height: b.h }} />
    case 'bar': return <BarTitle title={b.title} icon={b.icon} />
    case 'banner': return (
      <div className="flex items-center justify-center gap-4">
        {b.icons?.[0] ? <span className="text-[28px]" style={GREY}>{b.icons[0]}</span> : null}
        <div className="bg-black text-white rounded-[3px] px-8 h-[34px] flex items-center text-[19px] font-bold"><Mixed text={b.title} /></div>
        {b.icons?.[1] ? <span className="text-[28px]" style={GREY}>{b.icons[1]}</span> : null}
      </div>
    )
    case 'callout': return (
      <div className="bg-black text-white rounded-[3px] px-3 py-[3px] text-center text-[13px] font-bold leading-snug"><Txt s={b.text} /></div>
    )
    case 'bullets': {
      const body = (
        <div style={{ fontSize: b.size ?? 13 }} className="font-bold">
          {b.heading !== undefined && <div className="text-[16px] font-bold underline mb-1 min-h-[1.2em]">{b.heading}</div>}
          <Columns items={b.items} cols={b.cols ?? 1} render={s => isAr(s)
            ? <div dir="rtl" style={{ fontFamily: AR }}><Bullet tick={b.tick}>{s}</Bullet></div>
            : <Bullet tick={b.tick}><Mixed text={s} /></Bullet>} />
        </div>
      )
      return b.box ? <div className="border-[1.5px] border-black rounded-[3px] px-3 py-1.5">{body}</div> : body
    }
    case 'talk': {
      const n = talkNo.get(b)
      const title = b.full ?? `Practice - Conversation ${pad(n ?? 0)}:${b.title ? ` ${b.title}` : ''}`
      const list = (
        <div style={{ fontSize: b.size ?? 12.5 }} className="font-bold">
          <Columns items={b.lines} cols={b.cols ?? 1} render={s => <Bullet><Mixed text={s} /></Bullet>} />
        </div>
      )
      const side = b.aside
        ? <div className="w-[230px]"><Blocks blocks={b.aside} talkNo={talkNo} /></div>
        : b.art ? <span className="leading-none px-2" style={{ ...GREY, fontSize: b.cols === 2 ? 96 : 150 }}>{b.art}</span> : null
      return (
        <div className="flex flex-col gap-[6px]">
          <BarTitle title={title} icon={b.full ? undefined : '🗣️'} />
          {side ? <div className="grid items-center gap-3" style={{ gridTemplateColumns: '1fr auto' }}>{list}{side}</div> : list}
        </div>
      )
    }
    case 'alphabet': return (
      <div className="bg-black text-white rounded-[3px] h-[38px] flex items-center justify-between px-4 text-[20px] font-bold">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <span key={l}>{l}</span>)}
      </div>
    )
    case 'numbers': return <Numbers />
    case 'flags': return (
      <div className="border-[1.5px] border-black rounded-[3px] px-3 py-2 grid grid-cols-3 gap-x-4 gap-y-2.5">
        {b.items.map(f => (
          <div key={f.flag} className="flex items-center gap-3 text-[12.5px] font-bold leading-snug">
            <Flag id={f.flag} />
            <div><div>Country : {f.country}</div><div>Nationality : {f.nationality}</div></div>
          </div>
        ))}
      </div>
    )
    case 'formula': return (
      <div>
        <div className="flex items-center gap-1.5">
          {b.cols.map((col, i) => (
            <div key={i} className="flex flex-col items-stretch gap-[3px]">
              {b.over?.[i] ? <div className="text-[10px] font-bold text-center leading-none" style={{ fontFamily: AR }} dir="rtl">{b.over[i]}</div> : null}
              {col.map(c => <Label key={c} size={col.length > 1 ? 12 : 14} className="whitespace-nowrap py-[3px]">{c}</Label>)}
            </div>
          ))}
        </div>
        {b.note && <div className="text-[11px] font-bold mt-0.5" style={{ fontFamily: AR }} dir="rtl">{b.note}</div>}
      </div>
    )
    case 'row': return (
      <div className="grid gap-[10px] items-start" style={{ gridTemplateColumns: b.widths }}>
        {b.blocks.map((col, i) => <div key={i} className="min-w-0"><Blocks blocks={col} talkNo={talkNo} /></div>)}
      </div>
    )
    case 'cards': return (
      <div className="border-[1.5px] border-black rounded-[3px] px-2 py-2 grid gap-x-3 gap-y-2" style={{ gridTemplateColumns: `repeat(${b.cols ?? 4}, minmax(0, 1fr))` }}>
        {b.items.map(([icon, en, ar], i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="text-[34px] leading-none shrink-0 w-[42px] text-center" style={GREY}>{icon}</span>
            <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
              <Label size={en.length > 14 ? 10.5 : 11.5}>{en}</Label>
              <WhiteBox size={ar.length > 16 ? 10 : 11.5}><span dir="rtl" style={{ fontFamily: AR }}>{ar}</span></WhiteBox>
            </div>
          </div>
        ))}
      </div>
    )
    case 'pairs': return (
      <div className="grid gap-x-2 gap-y-[5px]" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
        {b.items.map(([en, ar], i) => {
          const arBox = ar ? <WhiteBox size={(b.size ?? 11.5) - 0.5}><span dir="rtl" style={{ fontFamily: AR }}>{ar}</span></WhiteBox> : null
          if (b.side) return (
            <div key={i} className="grid grid-cols-2 gap-1.5"><Label size={b.size}>{en}</Label>{arBox}</div>
          )
          if (b.arTop) return (
            <div key={i} className="flex flex-col gap-[2px]">
              <div className="text-center font-bold leading-none text-[10.5px] border-b border-black pb-[2px]" dir="rtl" style={{ fontFamily: AR }}>{ar}</div>
              <Label size={b.size}>{en}</Label>
            </div>
          )
          return <div key={i} className="flex flex-col gap-[2px]"><Label size={b.size}>{en}</Label>{arBox}</div>
        })}
      </div>
    )
    case 'qa': {
      const withAr = b.rows.some(r => r[2])
      return (
        <div className="grid gap-x-2 gap-y-[5px]" style={{ gridTemplateColumns: withAr ? '1fr 1fr 1fr 1fr' : '1fr 1fr' }}>
          {b.rows.map(([q, a, qAr, aAr], i) => (
            <Fragment key={i}>
              <WhiteBox size={11.5}>{q}</WhiteBox>
              <Label size={11.5}>{a}</Label>
              {withAr && <><Label size={11.5}><span dir="rtl" style={{ fontFamily: AR }}>{aAr}</span></Label><WhiteBox size={11.5}><span dir="rtl" style={{ fontFamily: AR }}>{qAr}</span></WhiteBox></>}
            </Fragment>
          ))}
        </div>
      )
    }
    case 'boxes': return (
      <div className="grid gap-x-3 gap-y-4 pt-2" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
        {b.items.map(x => (
          <div key={x.title} className="relative border-[1.5px] border-black rounded-[3px] px-2.5 pt-4 pb-1.5 text-[12.5px] font-bold">
            <span className="absolute -top-3 left-2 bg-black text-white rounded-[3px] px-3 py-[1px] text-[13px] font-bold">{x.title}</span>
            {x.lines.map(l => <Bullet key={l}>{l}</Bullet>)}
          </div>
        ))}
      </div>
    )
    case 'text': return (
      <div>
        <span className="inline-block bg-black text-white rounded-t-[3px] px-2 py-[1px] text-[12.5px] font-bold"><Mixed text={b.label} /></span>
        <div className="border-[1.5px] border-black rounded-[3px] rounded-tl-none px-3 py-1.5 font-bold leading-[1.55]" style={{ fontSize: b.size ?? 13 }}>{b.body}</div>
      </div>
    )
    case 'grid': {
      const rows = b.rows.map((r, i) => (
        <div key={i} className="grid gap-1" style={{ gridTemplateColumns: (r.span ?? r.cells.map(() => 1)).map(s => `${s}fr`).join(' ') }}>
          {r.cells.map((c, j) => {
            const content = <Txt s={c} />
            if (r.plain) return <div key={j} className="text-center font-bold leading-tight" style={{ fontSize: r.size ?? 12 }}>{content}</div>
            return r.dark
              ? <Label key={j} size={r.size ?? 12}>{content}</Label>
              : <WhiteBox key={j} size={r.size ?? 12}>{content}</WhiteBox>
          })}
        </div>
      ))
      const inner = (
        <div className="flex flex-col gap-1">
          {b.title && <div className="bg-black text-white text-center rounded-[2px] text-[12px] font-bold py-[2px]"><Mixed text={b.title} /></div>}
          {rows}
        </div>
      )
      return b.boxed ? <div className="border-[1.5px] border-black rounded-[3px] p-1.5">{inner}</div> : inner
    }
    case 'chips': return (
      <div className="flex justify-between gap-2">
        {b.items.map(([label, above]) => (
          <div key={label} className="flex-1 flex flex-col items-stretch gap-[2px]">
            <div className="text-center text-[10.5px] font-bold leading-none" dir="rtl" style={{ fontFamily: AR }}>{above}</div>
            <Label size={14}>{label}</Label>
          </div>
        ))}
      </div>
    )
    case 'art': return <div className="text-center leading-none" style={{ ...GREY, fontSize: b.size ?? 90 }}>{b.icon}</div>
    case 'sticky': return (
      <div className="mx-auto w-[150px] bg-[#FFF6B8] border-2 border-black rounded-[4px] px-3 py-3 text-center text-[19px] font-bold leading-snug -rotate-3 shadow-[3px_3px_0_#000]" dir="rtl" style={{ fontFamily: AR }}>
        📎 {b.text}
      </div>
    )
    case 'family': return <FamilyTree />
    case 'preps': return <Prepositions items={b.items} />
    case 'clocks': return (
      <div className="grid grid-cols-8 gap-2">
        {b.times.map(t => (
          <div key={t} className="flex flex-col items-center gap-1">
            <Clock time={t} />
            <Label size={11.5} className="w-full">It&apos;s {t}</Label>
          </div>
        ))}
      </div>
    )
    case 'pointing': return (
      <div className="grid grid-cols-4 gap-2">
        {b.items.map(p => (
          <div key={p.en} className="border-[1.5px] border-black rounded-[3px] overflow-hidden">
            <div className="bg-black text-white text-center text-[9.5px] font-bold py-[2px] leading-tight" dir="rtl" style={{ fontFamily: AR }}><Mixed text={p.caption} /></div>
            <div className="flex items-center h-[44px] px-2" style={GREY}>
              <span className="text-[24px]">👉</span>
              <span className="flex-1" style={{ maxWidth: p.far ? 80 : 6 }} />
              <span className="text-[22px] whitespace-nowrap">{p.many ? '🚗🚗🚗' : '🚗'}</span>
            </div>
            <div className="bg-black text-white text-center text-[10.5px] font-bold py-[2px]">{p.en} - <bdi dir="rtl" style={{ fontFamily: AR }}>{p.ar}</bdi></div>
          </div>
        ))}
      </div>
    )
  }
}

/* ── One-off pictures ────────────────────────────────────────────────── */

const NUM_COLS: string[][] = [
  ['11 - Eleven', '12 - Twelve', '13 - Thirteen', '14 - Fourteen', '15 - Fifteen', '16 - Sixteen', '17 - Seventeen'],
  ['18 - Eighteen', '19 - Nineteen', '20 - Twenty', '21 - Twenty-One', '22 - Twenty-Two', '30 - Thirty', '31 - Thirty-One'],
  ['40 - Forty', '50 - Fifty', '60 - Sixty', '70 - Seventy', '80 - Eighty', '90 - Ninety', '100 - One hundred'],
  ['101 - One hundred one', '200 - Two hundred', '304 - Three hundred four', '400 - Four hundred', '505 - Five hundred five', '900 - Nine hundred', '914 - Nine hundred fourteen'],
]

/** "-teen" in blue and "-ty" in red, the way the book colours them. */
function NumberWord({ s }: { s: string }) {
  const parts = s.split(/(teen\b|ty\b)/)
  return <>{parts.map((p, i) => p === 'teen' ? <span key={i} className="text-[#1D3FBF]">{p}</span> : p === 'ty' ? <span key={i} className="text-[#D62828]">{p}</span> : <Fragment key={i}>{p}</Fragment>)}</>
}

function Numbers() {
  const ten = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between px-1">
        {ten.map((w, i) => (
          <div key={w} className="flex flex-col items-center gap-0.5">
            <span className="w-[36px] h-[36px] rounded-full bg-black text-white flex items-center justify-center text-[17px] font-bold">{i + 1}</span>
            <span className="text-[11.5px] font-bold">{w}</span>
          </div>
        ))}
      </div>
      <div className="border-[1.5px] border-black rounded-[3px] px-3 py-1.5 grid grid-cols-4 gap-x-3 text-[11.5px] font-bold">
        {NUM_COLS.map((col, i) => <div key={i} className="flex flex-col gap-[2px]">{col.map(s => <Bullet key={s}><NumberWord s={s} /></Bullet>)}</div>)}
      </div>
    </div>
  )
}

function Clock({ time }: { time: string }) {
  const [h, m] = time.split(':').map(Number)
  const mAngle = (m / 60) * 360
  const hAngle = ((h % 12) / 12) * 360 + (m / 60) * 30
  const hand = (angle: number, len: number, w: number) => {
    const r = (angle - 90) * (Math.PI / 180)
    return <line x1="30" y1="30" x2={30 + len * Math.cos(r)} y2={30 + len * Math.sin(r)} stroke="#000" strokeWidth={w} strokeLinecap="round" />
  }
  return (
    <svg viewBox="0 0 60 60" width="64" height="64" aria-label={time}>
      <circle cx="30" cy="30" r="27" fill="#fff" stroke="#000" strokeWidth="2.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (i * 30 - 90) * (Math.PI / 180)
        return <line key={i} x1={30 + 23 * Math.cos(r)} y1={30 + 23 * Math.sin(r)} x2={30 + 26 * Math.cos(r)} y2={30 + 26 * Math.sin(r)} stroke="#000" strokeWidth={i % 3 ? 1 : 2} />
      })}
      {[12, 3, 6, 9].map((n, i) => {
        const r = (i * 90 - 90) * (Math.PI / 180)
        return <text key={n} x={30 + 17.5 * Math.cos(r)} y={30 + 17.5 * Math.sin(r) + 2.6} fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="Mali, sans-serif">{n}</text>
      })}
      {hand(hAngle, 11, 3)}
      {hand(mAngle, 18, 2)}
      <circle cx="30" cy="30" r="2" fill="#000" />
    </svg>
  )
}

function Prepositions({ items }: { items: [kind: string, en: string, ar: string][] }) {
  const box = (style: CSSProperties) => <span className="absolute bg-black rounded-[2px]" style={{ width: 34, height: 32, ...style }} />
  const mouse = (style: CSSProperties, z = 1) => <span className="absolute text-[26px] leading-none" style={{ ...GREY, zIndex: z, ...style }}>🐭</span>
  const scene = (kind: string) => {
    switch (kind) {
      case 'behind':  return <>{mouse({ left: 30, top: 6 }, 0)}{box({ left: 16, top: 22, zIndex: 1 })}</>
      case 'on':      return <>{box({ left: 22, top: 30 })}{mouse({ left: 26, top: 2 })}</>
      case 'between': return <>{box({ left: 0, top: 26, width: 26, height: 30 })}{mouse({ left: 28, top: 30 })}{box({ left: 58, top: 26, width: 26, height: 30 })}</>
      case 'under':   return <>{box({ left: 18, top: 0, width: 46, height: 28 })}{mouse({ left: 28, top: 30 })}</>
      case 'front':   return <>{box({ left: 30, top: 14, height: 30 })}{mouse({ left: 20, top: 30 }, 2)}</>
      default:        return <>{box({ left: 8, top: 24 })}{mouse({ left: 48, top: 28 })}</>
    }
  }
  return (
    <div className="grid grid-cols-6 gap-3">
      {items.map(([kind, en, ar]) => (
        <div key={en} className="flex flex-col items-stretch gap-[3px]">
          <div className="relative mx-auto" style={{ width: 86, height: 60 }}>{scene(kind)}</div>
          <Label size={12}>{en}</Label>
          <WhiteBox size={11.5}><span dir="rtl" style={{ fontFamily: AR }}>{ar}</span></WhiteBox>
        </div>
      ))}
    </div>
  )
}

/* Family tree (lesson 5): Abdurrahman ♥ Safiya → three couples → cousins
   and Ahmed & Khadija's three couples → their children. "(me)" is Adil. */
function Person({ face, role, name }: { face: string; role: string; name: string }) {
  return (
    <div className="flex flex-col items-center w-[64px]">
      <span className="text-[26px] leading-none" style={GREY}>{face}</span>
      <span className="mt-[2px] bg-black text-white rounded-[2px] px-1 text-[8.5px] font-bold leading-[13px] whitespace-nowrap">{role}</span>
      <span className="text-[9px] font-bold leading-tight">{name}</span>
    </div>
  )
}
const Couple = ({ a, b }: { a: [string, string, string]; b: [string, string, string] }) => (
  <div className="flex items-center"><Person face={a[0]} role={a[1]} name={a[2]} /><span className="text-[12px] -mx-1">❤</span><Person face={b[0]} role={b[1]} name={b[2]} /></div>
)
const Kids = ({ a, b }: { a: [string, string, string]; b: [string, string, string] }) => (
  <div className="flex items-center gap-1"><Person face={a[0]} role={a[1]} name={a[2]} /><Person face={b[0]} role={b[1]} name={b[2]} /></div>
)
const Note = ({ children, w = 96 }: { children: ReactNode; w?: number }) => (
  <div className="bg-[#FFF6B8] border border-black rounded-[3px] px-1.5 py-1 text-[8.5px] font-bold leading-tight text-center shadow-[2px_2px_0_#000]" style={{ width: w }}>{children}</div>
)

function FamilyTree() {
  const vocab: [string, string][] = [
    ['Grandfather', 'الجد'], ['Grandmother', 'الجدة'], ['Father', 'الأب'], ['Mother', 'الأم'], ['Brother', 'الأخ'], ['Sister', 'الأخت'], ['Husband', 'الزوج'],
    ['Wife', 'الزوجة'], ['Son', 'الابن'], ['Daughter', 'الابنة'], ['Grandson', 'الحفيد'], ['Granddaughter', 'الحفيدة'], ['Aunt', 'العمة / الخالة'], ['Uncle', 'العم / الخال'],
    ['Cousins', 'أبناء العم(ة) / الخال(ة)'], ['Sister-in-law', 'زوجة الأخ'], ['Brother-in-law', 'زوج الأخت'], ['Nephew', 'ابن الأخ / الأخت'], ['Niece', 'بنت الأخ / الأخت'],
  ]
  return (
    <div className="grid gap-[10px]" style={{ gridTemplateColumns: '190px 1fr' }}>
      <div className="bg-black text-white rounded-[3px] px-2 pb-2">
        <div className="text-center text-[17px] font-bold py-1 border-b border-white/40 mb-1">Vocabulary</div>
        {vocab.map(([en, ar]) => (
          <div key={en} className="flex items-center justify-between gap-1.5 py-[2.5px]">
            <span className="text-[12px] font-bold flex items-center gap-1"><span className="w-[5px] h-[5px] rounded-full bg-white" />{en}</span>
            <span className="bg-white text-black rounded-[2px] px-1 text-[10px] font-bold leading-[15px] whitespace-nowrap" dir="rtl" style={{ fontFamily: AR }}>{ar}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="bg-black text-white rounded-[3px] text-center text-[16px] font-bold py-[3px]">The Family Tree - <bdi dir="rtl" style={{ fontFamily: AR }}>شجرة العائلة</bdi></div>
        <div className="flex-1 border-[1.5px] border-black rounded-[3px] mt-1 px-2 py-2 flex flex-col items-center gap-1.5" dir="ltr">
          <div className="flex items-center gap-3">
            <Note>Grandfather + Grandmother = Grandparents</Note>
            <Couple a={['👴', 'Grandfather', 'Abdurrahman']} b={['👵', 'Grandmother', 'Safiya']} />
          </div>
          <div className="w-[78%] h-[10px] border-x-2 border-t-2 border-black" />
          <div className="w-full flex justify-between">
            <Couple a={['👩', 'Aunt', 'Salma']} b={['👨', 'Uncle', 'Samir']} />
            <Couple a={['👨‍🦱', 'Father', 'Ahmed']} b={['👩‍🦱', 'Mother', 'Khadija']} />
            <Couple a={['🧔', 'Uncle', 'Youssef']} b={['👩‍🦰', 'Aunt', 'Zaynab']} />
          </div>
          <div className="w-full flex justify-between items-start">
            <Kids a={['👧', 'Cousin', 'Hala']} b={['👦', 'Cousin', 'Achraf']} />
            <Note w={110}>Father + Mother = Parents<br />Husband + Wife = Spouses - أزواج</Note>
            <Kids a={['👧', 'Cousin', 'Abir']} b={['👦', 'Cousin', 'Iyad']} />
          </div>
          <div className="w-[78%] h-[10px] border-x-2 border-t-2 border-black" />
          <div className="w-full flex justify-between">
            <Couple a={['👩', 'Sister-in-law', 'Iness']} b={['👨', 'Brother', 'Zaid']} />
            <Couple a={['🧑', 'Husband (me)', 'Adil']} b={['👩', 'Wife (me)', 'Maysoun']} />
            <Couple a={['👩‍🦱', 'Sister', 'Ihssane']} b={['🧔', 'Brother-in-law', 'Omar']} />
          </div>
          <div className="w-full flex justify-between">
            <Kids a={['👦', 'Nephew', 'Yahya']} b={['👧', 'Niece', 'Maram']} />
            <Kids a={['👦', 'Son', 'Fares']} b={['👧', 'Daughter', 'Issrae']} />
            <Kids a={['👦', 'Nephew', 'Salim']} b={['👧', 'Niece', 'Hiba']} />
          </div>
          <div className="w-full flex justify-between gap-1.5 mt-auto" dir="rtl" style={{ fontFamily: AR }}>
            <Note w={118}>Son + Daughter = Children - أبناء</Note>
            <Note w={118}>Aunt؟ زوجة العم أو الخال تسمى أيضًا Aunt</Note>
            <Note w={118}>Uncle؟ زوج العمة أو الخالة يسمى أيضًا Uncle</Note>
            <Note w={118}>Nibling؟ تقال أحيانًا لابن أو بنت الأخ أو الأخت</Note>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Flags (drawn, since Windows shows flag emoji as letters) ──────── */

function Flag({ id }: { id: FlagId }) {
  const uid = useId().replace(/:/g, '')
  const w = 60, h = 40
  const v3 = (a: string, b: string, c: string) => <><rect width="20" height="40" fill={a} /><rect x="20" width="20" height="40" fill={b} /><rect x="40" width="20" height="40" fill={c} /></>
  const star = (cx: number, cy: number, r: number, fill: string) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * (Math.PI / 180), rr = i % 2 ? r * 0.4 : r
      return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`
    }).join(' ')
    return <polygon points={pts} fill={fill} />
  }
  let body: ReactNode
  switch (id) {
    case 'ma': body = <><rect width={w} height={h} fill="#C1272D" /><polygon points="30,10 35.88,28.09 20.49,16.91 39.51,16.91 24.12,28.09" fill="none" stroke="#006233" strokeWidth="1.8" strokeLinejoin="round" /></>; break
    case 'eg': body = <><rect width={w} height="13.4" fill="#CE1126" /><rect y="13.3" width={w} height="13.4" fill="#fff" /><rect y="26.6" width={w} height="13.4" fill="#000" /><circle cx="30" cy="20" r="3.4" fill="#C09300" /></>; break
    case 'fr': body = v3('#0055A4', '#fff', '#EF4135'); break
    case 'it': body = v3('#009246', '#fff', '#CE2B37'); break
    case 'es': body = <><rect width={w} height={h} fill="#AA151B" /><rect y="10" width={w} height="20" fill="#F1BF00" /></>; break
    case 'sa': body = <><rect width={w} height={h} fill="#006C35" /><rect x="16" y="13" width="28" height="7" rx="2" fill="#fff" opacity=".9" /><rect x="17" y="25" width="26" height="1.8" fill="#fff" /></>; break
    case 'dz': body = <><rect width="30" height={h} fill="#006233" /><rect x="30" width="30" height={h} fill="#fff" /><path d="M33.5 12.81 A8 8 0 1 0 33.5 27.19 A7.2 7.2 0 1 1 33.5 12.81 Z" fill="#D21034" />{star(35.4, 20, 3.2, '#D21034')}</>; break
    case 'tn': body = <><rect width={w} height={h} fill="#E70013" /><circle cx="30" cy="20" r="10" fill="#fff" /><path d="M32.6 13.6 A7 7 0 1 0 32.6 26.4 A5.6 5.6 0 1 1 32.6 13.6 Z" fill="#E70013" />{star(32.6, 20, 3, '#E70013')}</>; break
    case 'us': body = <>
      <rect width={w} height={h} fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * (40 / 6.5)} width={w} height={40 / 13} fill="#B22234" />)}
      <rect width="26" height="21.5" fill="#3C3B6E" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={4 + (i % 4) * 6} cy={4 + Math.floor(i / 4) * 6.5} r="1.1" fill="#fff" />)}
    </>; break
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="54" height="36" className="shrink-0 border border-zinc-300" aria-label={id}>
      <defs><clipPath id={`f${uid}`}><rect width={w} height={h} /></clipPath></defs>
      <g clipPath={`url(#f${uid})`}>{body}</g>
    </svg>
  )
}

/* ── Cover, thank-you page, contents ─────────────────────────────────── */

/** Topographic contour lines, like the cover's background. */
function Contours() {
  const centres = [[120, 160, 9], [690, 260, 8], [160, 880, 10], [650, 980, 7], [420, 600, 6]] as const
  const paths: string[] = []
  centres.forEach(([cx, cy, rings], c) => {
    for (let k = 1; k <= rings; k++) {
      const r = k * 34
      const pts = Array.from({ length: 64 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2
        const rr = r * (1 + 0.13 * Math.sin(3 * a + c + k * 0.4) + 0.06 * Math.sin(5 * a + c * 2))
        return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a) * 0.8).toFixed(1)}`
      })
      paths.push(`M${pts.join('L')}Z`)
    }
  })
  return (
    <svg className="absolute inset-0" width="794" height="1123" aria-hidden>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="#fff" strokeOpacity="0.09" strokeWidth="2" />)}
    </svg>
  )
}

function UnionJack() {
  return (
    <svg viewBox="15 0 30 30" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-label="UK">
      <rect x="0" y="0" width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

export function CoverPage({ info, filename }: { info: BookInfo; filename: string }) {
  return (
    <Frame info={info} label="الغلاف" filename={filename}>
      <div className="absolute inset-0" style={{ background: '#2B3990', fontFamily: AR }} dir="rtl">
        <Contours />
        <div className="absolute inset-x-0 top-[44px] flex flex-col items-center text-white">
          <div className="text-[64px] font-extrabold leading-none tracking-tight" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }} dir="ltr">Inglizi.com</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[13px] font-bold opacity-90">.كـــوم</span>
            <span className="bg-black text-white px-3 py-[1px] text-[16px] font-bold">أكاديمية إنجليزي الدولية</span>
          </div>
          <div className="mt-6 bg-white text-[#1E2A6E] rounded-full px-9 py-1.5 text-[26px] font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.25)]">المستوى الأول في 30 يومًا</div>
          <div className="mt-4 text-[34px] font-extrabold">إنجليزية بالممارسة - لا بالقواعد</div>
        </div>
        <div className="absolute rounded-full" style={{ width: 420, height: 420, left: 187, top: 300, background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute rounded-full" style={{ width: 340, height: 340, left: 227, top: 340, background: '#C9D3F2' }} />
        <div className="absolute rounded-full overflow-hidden border-[10px] border-white" style={{ width: 280, height: 280, left: 257, top: 370 }}><UnionJack /></div>
        <div className="absolute inset-x-0 top-[760px] text-center text-white text-[21px] font-bold leading-[1.8] px-20">
          لن أرسل لك الكتاب فقط وأتركك - سأبقى معك في متابعة خطوة بخطوة حتى تنهي المستوى الأول
        </div>
        <div className="absolute inset-x-0 top-[862px] flex justify-center gap-5">
          {['كتاب PDF', 'فيديوهات', 'متابعة يوميًا'].map(t => (
            <span key={t} className="bg-white text-[#1E2A6E] rounded-full px-8 py-2 text-[20px] font-extrabold">{t}</span>
          ))}
        </div>
        <div className="absolute rounded-[50%] bg-white" style={{ width: 1100, height: 400, left: -153, top: 965 }} />
        <div className="absolute inset-x-0 top-[1000px] text-center text-[#1E2A6E]">
          <div className="text-[21px] font-extrabold">الأستاذ : {info.teacherAr}</div>
          <div className="mt-1 flex items-center justify-center gap-2 text-[20px] font-extrabold">
            <span>واتساب : <bdi dir="ltr">{intl(info.phone)}</bdi></span>
            <span className="w-[30px] h-[30px] rounded-full bg-[#25D366] text-white flex items-center justify-center"><Phone size={16} strokeWidth={2.6} /></span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

const DOODLES: LucideIcon[] = [BookOpen, Pencil, Ruler, FlaskConical, Globe, Lightbulb, GraduationCap, Calculator, Microscope, Palette, Music, Atom, NotebookPen, Paperclip, Scissors, Compass]

/** The school doodles behind the thank-you and contents pages. */
function Doodles() {
  let seed = 7
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const items = Array.from({ length: 34 }, (_, i) => ({
    Icon: DOODLES[i % DOODLES.length], x: (i % 6) * 135 + rnd() * 60, y: Math.floor(i / 6) * 190 + rnd() * 90 + 20,
    size: 48 + rnd() * 34, rot: rnd() * 60 - 30,
  }))
  return (
    <div className="absolute inset-0" aria-hidden>
      {items.map((d, i) => <d.Icon key={i} className="absolute" size={d.size} strokeWidth={1.4} color="#E2E4EA" style={{ left: d.x, top: d.y, transform: `rotate(${d.rot}deg)` }} />)}
    </div>
  )
}

/** The black sign hanging from two strings ("شكراً", "الفهرس"). */
function HangingSign({ text }: { text: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 230, height: 120 }}>
      <svg className="absolute inset-0" width="230" height="40" aria-hidden><line x1="40" y1="0" x2="40" y2="40" stroke="#000" strokeWidth="1.5" strokeDasharray="2 3" /><line x1="190" y1="0" x2="190" y2="40" stroke="#000" strokeWidth="1.5" strokeDasharray="2 3" /></svg>
      <div className="absolute inset-x-0 top-[30px] bottom-0 bg-black text-white rounded-[4px] flex items-center justify-center -rotate-2">
        <div className="absolute inset-[6px] border-2 border-dashed border-white/50 rounded-[3px]" />
        <span className="text-[46px] leading-none pt-2" style={{ fontFamily: AR_DISPLAY }}>{text}</span>
      </div>
    </div>
  )
}

export function ThanksPage({ info, filename }: { info: BookInfo; filename: string }) {
  const f = info.buyerFemale
  const name = info.buyer.trim()
  const lines = [
    `أشكرك على ثقتك باقتناء هذا الكتاب، وجعلِه جزءًا من رحلتك في تعلّم اللغة الإنجليزية.`,
    `شراؤك لهذا الكتاب ليس مجرد خطوة، بل هو بداية طريق جديد نحو تطوير نفسك واكتساب مهارة ستفتح لك آفاقًا واسعة.`,
    `${f ? 'تذكّري' : 'تذكّر'} أن كل كلمة وكل تمرين هنا هو لبنة ${f ? 'تبنين' : 'تبني'} بها مستقبلك، وأن التعلّم يحتاج صبرًا ومثابرة.`,
    `${f ? 'استمرّي' : 'استمرّ'} في التقدّم، فحتى أصغر الخطوات تقرّبك من هدفك.`,
    'أتمنى لك رحلة تعليمية ممتعة وناجحة.',
    'مع خالص التقدير.',
  ]
  return (
    <Frame info={info} label="صفحة الشكر" filename={filename}>
      <Doodles />
      <div className="absolute inset-x-0 top-0"><HangingSign text="شكرًا" /></div>
      <div className="absolute inset-x-[70px] top-[170px] text-center text-[19px] font-bold leading-[1.9]" dir="rtl" style={{ fontFamily: AR }}>
        <p className="font-extrabold">شكرًا من القلب{name ? ` يا ${name}` : ''} ❤️</p>
        {lines.map(l => <p key={l}>{l}</p>)}
        <p className="mt-10 font-extrabold">- {info.teacherAr}</p>
      </div>
      {name && (
        <div className="absolute inset-x-0 bottom-[60px] flex justify-center" dir="rtl" style={{ fontFamily: AR }}>
          <span className="border-2 border-black rounded-[4px] px-5 py-1.5 text-[16px] font-bold bg-white">هذه النسخة خاصة بـ: {name}</span>
        </div>
      )}
    </Frame>
  )
}

export function ContentsPage({ info, lessons, filename }: { info: BookInfo; lessons: Lesson[]; filename: string }) {
  return (
    <Frame info={info} label="الفهرس" filename={filename}>
      <Doodles />
      <div className="absolute inset-x-0 top-0"><HangingSign text="الفهرس" /></div>
      <div className="absolute inset-x-[34px] top-[150px] grid grid-cols-4 gap-x-4 gap-y-5" dir="rtl">
        {lessons.map((l, i) => (
          <div key={l.n} className="flex flex-col items-center">
            <svg width="44" height="20" aria-hidden><circle cx="22" cy="4" r="3.5" fill="#000" /><line x1="22" y1="4" x2="6" y2="20" stroke="#000" strokeWidth="2" /><line x1="22" y1="4" x2="38" y2="20" stroke="#000" strokeWidth="2" /></svg>
            <span className="relative z-10 -mt-1 bg-white border-2 border-black rounded-full px-3 text-[15px] leading-[24px]" style={{ fontFamily: AR_DISPLAY }}>الدرس {l.n}</span>
            <div className="-mt-2 w-full min-h-[64px] bg-black text-white rounded-[7px] px-2 pt-3.5 pb-2 flex items-center justify-center text-center leading-[1.25]"
              style={{ fontFamily: AR_DISPLAY, fontSize: l.titleAr.length > 24 ? 15 : 18, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
              {l.titleAr}
            </div>
            <span className="mt-1 text-[11px] font-bold text-zinc-500" dir="ltr">Page {pad(i + 1)}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}
