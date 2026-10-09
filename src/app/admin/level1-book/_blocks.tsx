'use client'

import { Fragment, useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'
import {
  Atom, BookOpen, Calculator, Compass, FlaskConical, Globe, GraduationCap, Lightbulb, Microscope, Music, NotebookPen,
  Palette, Paperclip, Pencil, Phone, QrCode, Ruler, Scissors, type LucideIcon,
} from 'lucide-react'
import { BareSheet, THEMES } from '../games/_shared'
import type { Block, FamilyPeople, FlagId, Lesson } from '@/data/level1-book'

/**
 * The look of «الإنجليزية من الصفر (الدارجة)», a book meant to be sold.
 *
 * Open layouts rather than boxes: words, questions and readings run the full
 * width of the page, with colour and type doing the separating. Each section
 * of a lesson takes its own colour (the palette, in turn) and opens with a
 * heading in Baloo Bhaijaan 2 — a different face from the Mali body text —
 * so the sections read apart at a glance. Tips are pale-yellow notes, not
 * dark bars. Every page carries a slot for a QR / barcode (uploaded later,
 * one image for all pages). Emoji pictures are in colour, grey in the
 * black-and-white print. Pages are full-bleed A4 sheets (BareSheet), so print
 * and PNG behave like the workbook's.
 */

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Mali:wght@500;600;700&family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Lalezar&family=Poppins:wght@400;500;600;700;800&display=swap'
export const EN = "'Mali', 'Baloo Bhaijaan 2', sans-serif"
/* A book can set its own faces with CSS variables on a parent element
 * (--book-ar, --book-head, --book-display, --book-display-weight); without
 * them the Level 1 book's faces apply. */
export const AR = "var(--book-ar, 'Baloo Bhaijaan 2'), 'Tajawal', sans-serif"
/** Section headings and titles: a second face, so sections stand apart from the body. */
export const HEAD = "var(--book-head, 'Baloo Bhaijaan 2'), 'Mali', sans-serif"
export const AR_DISPLAY = "var(--book-display, 'Lalezar'), 'Baloo Bhaijaan 2', sans-serif"
/** Emoji pictures: full colour, or grey in the black-and-white print (--e). */
const EMOJI: CSSProperties = { filter: 'var(--e)' }
const GREY_TEXT = '#526079'

/**
 * Colours come from CSS variables: --m a colour (headings, names, rules),
 * --s its soft tint (tiles), --k the dark ink, --tip the note colour, --e the
 * emoji filter. The page sets the lesson's colour; each section re-sets --m
 * and --s to the next colour of PALETTE. `mono` prints everything black.
 */
export const PALETTE = [
  { m: '#2563EB', s: '#EFF5FF' }, // blue
  { m: '#E11D48', s: '#FFF1F3' }, // rose
  { m: '#0D9488', s: '#ECFBF8' }, // teal
  { m: '#7C3AED', s: '#F4F0FF' }, // violet
  { m: '#EA580C', s: '#FFF4EC' }, // orange
  { m: '#16A34A', s: '#EEFBF2' }, // green
]
const INK = '#1E2A5C', BRAND = '#2B3990'
function vars(mono: boolean, colour: { m: string; s: string }, ink = INK): CSSProperties {
  return (mono
    ? { '--m': '#000', '--s': '#F3F4F6', '--k': '#000', '--tip': '#F3F4F6', '--e': 'grayscale(1) contrast(1.15)' }
    : { '--m': colour.m, '--s': colour.s, '--k': ink, '--tip': '#FFF5CF', '--e': 'none' }) as CSSProperties
}
/** A clean sans for books for adults (the Level 1 book keeps the friendlier Mali). */
export const SANS = "'Poppins', 'Baloo Bhaijaan 2', sans-serif"
const colourVars = (mono: boolean, c: { m: string; s: string }): CSSProperties => (mono ? {} : { '--m': c.m, '--s': c.s } as CSSProperties)
export const lessonColour = (i: number) => PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length]
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
  /** Black-and-white print instead of colour. */
  mono: boolean
  /** The QR / barcode printed on every page (a data URL), and whether to show its slot. */
  code: string | null; showCode: boolean
  /** Optional brand: the dark ink (header bar, footer, names) and the English face. */
  ink?: string; fontEn?: string
}

export const DEFAULT_INFO: BookInfo = {
  title: 'الإنجليزية من الصفر (الدارجة)', level: 'Level 1 - (A0 - A1)', teacher: 'Hamza El Qasraoui', teacherAr: 'حمزة القصراوي',
  phone: '0707902091', website: 'www.inglizi.com', buyer: '', buyerFemale: false, stamp: true, mono: false,
  code: null, showCode: true,
}

const intl = (phone: string) => (phone.startsWith('0') ? `+212${phone.slice(1)}` : phone)

/* ── Text direction helpers ──────────────────────────────────────────── */

/** English with Arabic runs isolated, so mixed lines keep their order. */
export function Mixed({ text }: { text: string }) {
  const parts = text.split(/([؀-ۿ][؀-ۿ\s،؟.()\-–/«»"]*)/).filter(Boolean)
  return <>{parts.map((p, i) => (/[؀-ۿ]/.test(p) ? <bdi key={i} dir="rtl" className="mx-[0.15em]" style={{ fontFamily: AR }}>{p.trim()}</bdi> : <Fragment key={i}>{p}</Fragment>))}</>
}
/** Arabic text quoting English ("مرافق + There is / are"): each English run isolated. */
function RtlMixed({ text }: { text: string }) {
  const parts = text.split(/([A-Za-z][A-Za-z0-9\s/'’.,?!–\-+=()✓✗→]*[A-Za-z0-9?.)!✓✗]|[A-Za-z])/).filter(Boolean)
  return <>{parts.map((p, i) => (/[A-Za-z]/.test(p) ? <bdi key={i} dir="ltr">{p}</bdi> : <Fragment key={i}>{p}</Fragment>))}</>
}
/** Text whose first letter is Arabic reads right to left, whatever it quotes in English. */
const isAr = (s: string) => /^[^A-Za-z؀-ۿ]*[؀-ۿ]/.test(s)
const Txt = ({ s }: { s: string }) => (isAr(s) ? <span dir="rtl" style={{ fontFamily: AR }}><RtlMixed text={s} /></span> : <Mixed text={s} />)
/** "English sentence. - ترجمتها": split, so the Arabic sits on its own line under the English. */
const EN_AR = /^(.*?[A-Za-z0-9?.!'"”)])\s+-\s+([؀-ۿ].*)$/
function EnAr({ s, size }: { s: string; size: number }) {
  const m = s.match(EN_AR)
  if (!m) return <Mixed text={s} />
  return <><span>{m[1]}</span><Gloss s={m[2]} size={size - 1} /></>
}

/** A question whose "___" become writing blanks. */
function QuestionText({ text }: { text: string }) {
  const parts = text.split('___')
  return <>{parts.map((p, i) => <Fragment key={i}>{i > 0 && <span className="inline-block w-[74px] mx-1 border-b-[1.5px] border-[#64748B] translate-y-[2px]" />}<Mixed text={p} /></Fragment>)}</>
}

/** An Arabic gloss under an English word, aligned with it. */
export const Gloss = ({ s, size = 12.5, className = '' }: { s: string; size?: number; className?: string }) => (
  <div dir="rtl" className={`text-left font-bold leading-snug ${className}`} style={{ fontFamily: AR, fontSize: size, color: GREY_TEXT }}><RtlMixed text={s} /></div>
)

/* ── Page frame ──────────────────────────────────────────────────────── */

export function Frame({ info, label, filename, colour = { m: BRAND, s: '#EEF1FB' }, children }: {
  info: BookInfo; label: string; filename: string; colour?: { m: string; s: string }; children: ReactNode
}) {
  useBookFonts()
  return (
    <BareSheet theme={MONO} label={label} filename={filename}>
      {/* crm-raw: the CRM repaints black as navy (tailwind.config.js); the book sets its own colours. */}
      <div className="crm-raw absolute inset-0 bg-white text-[var(--k)] overflow-hidden" style={{ fontFamily: info.fontEn ?? EN, ...vars(info.mono, colour, info.ink) }}>{children}</div>
    </BareSheet>
  )
}

/** The QR / barcode: the uploaded image, or a dashed slot keeping its place. */
export function CodeSlot({ info, size }: { info: BookInfo; size: number }) {
  if (!info.showCode) return null
  if (info.code) return <img src={info.code} alt="code" className="shrink-0 bg-white rounded-md" style={{ width: size, height: size, objectFit: 'contain' }} />
  return (
    <div className="shrink-0 rounded-lg border-2 border-dashed border-[var(--m)] bg-white text-[var(--m)] flex flex-col items-center justify-center opacity-70" style={{ width: size, height: size }}>
      <QrCode size={size * 0.46} strokeWidth={1.6} />
      <span className="text-[8px] font-extrabold tracking-wider" style={{ fontFamily: HEAD }}>QR / CODE</span>
    </div>
  )
}

export function LessonHeader({ info, n, tag }: { info: BookInfo; n: number; tag?: string }) {
  return (
    <div className="absolute inset-x-[22px] top-[10px] h-[62px] flex items-center gap-3" dir="ltr">
      <div className="w-[146px] shrink-0 text-center">
        <div className="bg-[var(--m)] text-white rounded-lg font-extrabold leading-[34px] whitespace-nowrap" style={{ fontFamily: HEAD, fontSize: (tag ?? '').length > 10 ? 16 : 20 }}>{tag ?? `Lesson ${pad(n)}`}</div>
        <div className="text-[11.5px] font-bold tracking-[0.14em] mt-0.5 whitespace-nowrap">{info.teacher}</div>
      </div>
      <div className="flex-1 h-[46px] bg-[var(--k)] text-white rounded-lg flex items-center justify-center gap-2 text-[19px] font-extrabold" style={{ fontFamily: AR }} dir="rtl">
        <span>{info.title}</span><Lightbulb size={18} />
      </div>
      <div className="w-[158px] shrink-0 text-center">
        <div className="bg-[var(--m)] text-white rounded-lg text-[16px] font-extrabold leading-[34px] whitespace-nowrap" style={{ fontFamily: HEAD }}>{info.level}</div>
        <div className="flex justify-between text-[11px] font-bold mt-0.5">
          <span>{info.phone}</span><span dir="rtl" style={{ fontFamily: AR }}>لطلب الكتاب</span>
        </div>
      </div>
      <CodeSlot info={info} size={62} />
    </div>
  )
}

export function Footer({ info, page }: { info: BookInfo; page: string }) {
  return (
    <div className="lb-foot absolute inset-x-[22px] bottom-[10px] h-[22px] bg-[var(--k)] text-white rounded-md flex items-center justify-between px-3 text-[11px] font-bold" dir="ltr">
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

/** A lesson's sections: a new one starts at each heading, conversation or title. */
function sectionsOf(blocks: Block[]): Block[][] {
  const out: Block[][] = []
  for (const b of blocks) {
    if (!out.length || b.t === 'bar' || b.t === 'talk' || b.t === 'banner') out.push([])
    out[out.length - 1].push(b)
  }
  return out
}

export function LessonPage({ info, lesson, pageNo, talkNo, exNo = new Map(), filename, colour }: {
  info: BookInfo; lesson: Lesson; pageNo: number; talkNo: Map<Block, number>; exNo?: Map<Block, number>; filename: string
  /** One colour for the whole page (a unit's colour) instead of a new colour per section. */
  colour?: { m: string; s: string }
}) {
  const { bodyRef, innerRef } = useFillPage([lesson, info.title, info.level, info.showCode, info.fontEn])
  const sections = sectionsOf(lesson.blocks)
  // Headings are numbered within the lesson: ① Greetings, ② Goodbye…
  const barNo = new Map<Block, number>()
  sections.forEach(s => { if (s[0].t === 'bar') barNo.set(s[0], barNo.size + 1) })
  const base = pageNo - 1
  return (
    <Frame info={info} colour={colour ?? lessonColour(base)} label={`${lesson.tag ?? `الدرس ${lesson.n}`} — ${lesson.titleAr} · صفحة ${pageNo}`} filename={filename}>
      <LessonHeader info={info} n={lesson.n} tag={lesson.tag} />
      <div ref={bodyRef} className="lb-body absolute inset-x-[24px] overflow-hidden" style={{ top: 84, bottom: 38 }} dir="ltr">
        <div ref={innerRef} className="flex flex-col gap-[13px]">
          {sections.map((sec, k) => (
            <section key={k} className="flex flex-col gap-[7px]" style={colourVars(info.mono, colour ?? lessonColour(base + k))}>
              {sec.map((b, i) => <BlockView key={i} b={b} ctx={{ talkNo, barNo, exNo }} />)}
            </section>
          ))}
        </div>
      </div>
      <Footer info={info} page={`Page ${pad(pageNo)}`} />
    </Frame>
  )
}

/* ── Blocks ──────────────────────────────────────────────────────────── */

type Ctx = { talkNo: Map<Block, number>; barNo: Map<Block, number>; exNo: Map<Block, number> }

function Blocks({ blocks, ctx }: { blocks: Block[]; ctx: Ctx }) {
  return <div className="flex flex-col gap-[7px]">{blocks.map((b, i) => <BlockView key={i} b={b} ctx={ctx} />)}</div>
}

const Dot = () => <span className="mt-[0.5em] w-[6px] h-[6px] rounded-full bg-[var(--m)] shrink-0" />

function Bullet({ children, tick }: { children: ReactNode; tick?: boolean }) {
  return (
    <div className="flex gap-1.5 leading-snug">
      {tick ? <span className="shrink-0 text-[var(--m)] font-extrabold">✓</span> : <Dot />}
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/** Column-major grid: the first column fills top to bottom, like the book. */
function Columns({ items, cols, render }: { items: string[]; cols: number; render: (s: string, i: number) => ReactNode }) {
  const rows = Math.ceil(items.length / cols)
  return (
    <div className="grid gap-x-5 gap-y-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, auto)`, gridAutoFlow: 'column' }}>
      {items.map((s, i) => <Fragment key={i}>{render(s, i)}</Fragment>)}
    </div>
  )
}

/** A section heading: a coloured badge (number or picture), the title in the heading face, a rule. */
export function SectionHead({ title, badge }: { title: string; badge: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="shrink-0 h-[30px] min-w-[30px] px-1.5 rounded-full bg-[var(--m)] text-white flex items-center justify-center text-[15px] font-extrabold" style={{ fontFamily: HEAD }}>{badge}</span>
      <span className="text-[21px] font-extrabold leading-tight text-[var(--m)]" style={{ fontFamily: HEAD }}><Mixed text={title} /></span>
      <span className="flex-1 h-[3px] rounded-full bg-[var(--m)] opacity-25" />
    </div>
  )
}

const Chip = ({ children, size = 12.5, className = '' }: { children: ReactNode; size?: number; className?: string }) => (
  <div className={`bg-[var(--m)] text-white rounded-md px-2 py-[2px] text-center font-extrabold leading-tight ${className}`} style={{ fontSize: size }}>{children}</div>
)

function BlockView({ b, ctx }: { b: Block; ctx: Ctx }) {
  switch (b.t) {
    case 'note': return (
      <div className="flex justify-end text-[12.5px] font-bold"><Bullet>{b.text}</Bullet></div>
    )
    case 'gap': return <div style={{ height: b.h }} />
    case 'bar': return <SectionHead title={b.title} badge={b.icon ? <span style={EMOJI}>{b.icon}</span> : ctx.barNo.get(b) ?? '•'} />
    case 'banner': return (
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-[var(--s)] py-1.5">
        {b.icons?.[0] ? <span className="text-[30px] leading-none" style={EMOJI}>{b.icons[0]}</span> : null}
        <span className="text-[27px] font-extrabold leading-tight text-[var(--m)]" style={{ fontFamily: HEAD }}><Mixed text={b.title} /></span>
        {b.icons?.[1] ? <span className="text-[30px] leading-none" style={EMOJI}>{b.icons[1]}</span> : null}
      </div>
    )
    case 'callout': return (
      <div className="flex items-start gap-2 rounded-xl px-3 py-1.5 text-[12.5px] font-bold leading-snug bg-[var(--tip)]" dir={isAr(b.text) ? 'rtl' : 'ltr'}>
        <span className="shrink-0" style={EMOJI}>💡</span><span className="flex-1"><Txt s={b.text} /></span>
      </div>
    )
    case 'sub': return (
      <div className="flex items-center gap-2 text-[15px] font-extrabold text-[var(--m)]" style={{ fontFamily: HEAD }} dir={isAr(b.text) ? 'rtl' : 'ltr'}>
        {/* One span: bare mixed-script runs would each become a flex item and wrap apart. */}
        <span className="w-[4px] h-[17px] rounded-full bg-[var(--m)] shrink-0" /><span className="min-w-0"><Txt s={b.text} /></span>
      </div>
    )
    case 'bullets': {
      const body = (
        <div style={{ fontSize: b.size ?? 13 }} className="font-bold">
          {b.heading !== undefined && b.heading.trim() !== '' && <div className="text-[16px] font-extrabold text-[var(--m)] mb-1" style={{ fontFamily: HEAD }}><Mixed text={b.heading} /></div>}
          <Columns items={b.items} cols={b.cols ?? 1} render={s => isAr(s)
            ? <div dir="rtl" style={{ fontFamily: AR }}><Bullet tick={b.tick}><RtlMixed text={s} /></Bullet></div>
            : <Bullet tick={b.tick}><EnAr s={s} size={b.size ?? 13} /></Bullet>} />
        </div>
      )
      return b.box ? <div className="rounded-xl bg-[var(--s)] px-3.5 py-2">{body}</div> : body
    }
    case 'talk': {
      const n = ctx.talkNo.get(b)
      const title = b.full ?? `Conversation ${pad(n ?? 0)}${b.title ? ` · ${b.title}` : ''}`
      const list = (
        <div style={{ fontSize: b.size ?? 12.5 }} className="font-bold">
          <Columns items={b.lines} cols={b.cols ?? 1} render={s => {
            const m = s.match(/^([^:]{1,18}):\s(.*)$/)
            return <Bullet>{m ? <><span className="text-[var(--m)] font-extrabold">{m[1]}:</span> <Mixed text={m[2]} /></> : <Mixed text={s} />}</Bullet>
          }} />
        </div>
      )
      const side = b.aside
        ? <div className="w-[230px]"><Blocks blocks={b.aside} ctx={ctx} /></div>
        : b.art ? <span className="leading-none px-2" style={{ ...EMOJI, fontSize: b.cols === 2 ? 96 : 150 }}>{b.art}</span> : null
      return (
        <div className="flex flex-col gap-[6px]">
          <SectionHead title={title} badge={<span style={EMOJI}>💬</span>} />
          {side ? <div className="grid items-center gap-3" style={{ gridTemplateColumns: '1fr auto' }}>{list}{side}</div> : list}
        </div>
      )
    }
    case 'alphabet': return (
      <div className="rounded-xl bg-[var(--s)] px-4 py-1.5 flex items-center justify-between text-[21px] font-extrabold text-[var(--m)]" style={{ fontFamily: HEAD }}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <span key={l}>{l}</span>)}
      </div>
    )
    case 'numbers': return <Numbers />
    case 'flags': return (
      <div className="grid grid-cols-3 gap-x-5 gap-y-2.5">
        {b.items.map(f => (
          <div key={f.flag} className="flex items-center gap-2.5 leading-tight">
            <Flag id={f.flag} />
            <div>
              <div className="text-[13.5px] font-extrabold">{f.country}</div>
              <div className="text-[12.5px] font-extrabold text-[var(--m)]">{f.nationality}</div>
            </div>
          </div>
        ))}
      </div>
    )
    case 'formula': return (
      <div>
        <div className="flex items-end gap-1.5 flex-wrap">
          {b.cols.map((col, i) => (
            <div key={i} className="flex flex-col items-stretch gap-[3px]">
              {b.over?.[i] ? <div className="text-[10px] font-bold text-center leading-none" style={{ fontFamily: AR, color: GREY_TEXT }} dir="rtl">{b.over[i]}</div> : null}
              {col.map(c => <Chip key={c} size={col.length > 1 ? 12 : 14} className="whitespace-nowrap py-[3px]">{c}</Chip>)}
            </div>
          ))}
        </div>
        {b.note && <div className="text-[11.5px] font-bold mt-1" style={{ fontFamily: AR, color: GREY_TEXT }} dir={isAr(b.note) ? 'rtl' : 'ltr'}><Txt s={b.note} /></div>}
      </div>
    )
    case 'row': return (
      <div className="grid gap-[14px] items-start" style={{ gridTemplateColumns: b.widths }}>
        {b.blocks.map((col, i) => <div key={i} className="min-w-0"><Blocks blocks={col} ctx={ctx} /></div>)}
      </div>
    )
    case 'cards': return (
      <div className="grid gap-x-3 gap-y-2" style={{ gridTemplateColumns: `repeat(${b.cols ?? 4}, minmax(0, 1fr))` }}>
        {b.items.map(([icon, en, ar], i) => b.stack ? (
          <div key={i} className="flex flex-col items-center gap-0.5 min-w-0 rounded-xl bg-[var(--s)] px-1.5 py-2 text-center">
            <span className="text-[30px] leading-none" style={EMOJI}>{icon}</span>
            <div className="mt-0.5 text-[13.5px] font-extrabold leading-tight text-[var(--m)]">{en}</div>
            <div dir="rtl" className="text-[12.5px] font-bold leading-snug" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</div>
          </div>
        ) : (
          <div key={i} className="flex items-center gap-2 min-w-0 rounded-xl bg-[var(--s)] px-2 py-1.5">
            <span className="text-[30px] leading-none shrink-0 w-[36px] text-center" style={EMOJI}>{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-extrabold leading-tight text-[var(--m)]">{en}</div>
              <Gloss s={ar} size={12.5} />
            </div>
          </div>
        ))}
      </div>
    )
    case 'pairs': return (
      <div className="grid gap-x-5 gap-y-[3px]" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
        {b.items.map(([en, ar], i) => {
          const size = b.size ?? 12.5
          if (b.arTop) return (
            <div key={i} className="rounded-lg bg-[var(--s)] px-1.5 py-1 text-center">
              <div className="font-bold leading-tight text-[11px]" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</div>
              <div className="font-extrabold leading-tight text-[var(--m)]" style={{ fontSize: size }}>{en}</div>
            </div>
          )
          if (!ar) return <div key={i} style={{ fontSize: size }} className="font-bold"><Bullet>{en}</Bullet></div>
          if (b.side) return (
            <div key={i} className="flex items-baseline gap-2 border-b border-dotted border-[#CBD5E1] py-[2px]" style={{ fontSize: size }}>
              <span className="font-extrabold text-[var(--m)] whitespace-nowrap">{en}</span>
              <span className="flex-1" />
              <span className="font-bold text-right" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</span>
            </div>
          )
          return (
            <div key={i} style={{ fontSize: size }}>
              <div className="font-extrabold text-[var(--m)] leading-snug">{en}</div>
              <Gloss s={ar} size={size - 0.5} />
            </div>
          )
        })}
      </div>
    )
    case 'qa': return (
      <div className="flex flex-col">
        {b.rows.map(([q, a, qAr, aAr], i) => (
          <div key={i} className="grid items-center gap-3 py-[4px] border-b border-dashed border-[#CBD5E1] last:border-0" style={{ gridTemplateColumns: '1fr 16px 1fr' }}>
            <div>
              <div className="text-[13px] font-bold leading-snug"><Mixed text={q} /></div>
              {qAr && <Gloss s={qAr} size={12} />}
            </div>
            <span className="text-[var(--m)] font-extrabold text-center">➜</span>
            <div>
              <div className="text-[13px] font-extrabold leading-snug text-[var(--m)]"><Mixed text={a} /></div>
              {aAr && <Gloss s={aAr} size={12} />}
            </div>
          </div>
        ))}
      </div>
    )
    case 'boxes': return (
      <div className="grid gap-x-3 gap-y-2.5" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
        {b.items.map(x => (
          <div key={x.title} className="rounded-xl bg-[var(--s)] px-3 py-2 text-[12.5px] font-bold">
            <div className="text-[16px] font-extrabold text-[var(--m)] leading-tight mb-0.5" style={{ fontFamily: HEAD }}>{x.title}</div>
            {/* An Arabic line glosses the title: right to left, no bullet (its full stop would land on the wrong side). */}
            {x.lines.map(l => (isAr(l) ? <Gloss key={l} s={l} size={13} /> : <Bullet key={l}>{l}</Bullet>))}
          </div>
        ))}
      </div>
    )
    case 'text': return (
      <div>
        <div className="text-[14.5px] font-extrabold text-[var(--m)] mb-0.5" style={{ fontFamily: HEAD }}><Mixed text={b.label} /></div>
        {b.body.includes('\n') && b.plain ? (
          // Paragraphs in the single-text look; weight and leading on each <p> (the site's global `p` rule sets 400 / 1.75).
          <div className="rounded-r-xl bg-[var(--s)] border-l-[4px] border-[var(--m)] px-3.5 py-2 space-y-1.5" style={{ fontSize: b.size ?? 13 }}>
            {b.body.split('\n').map((para, i) => <p key={i} className="font-bold leading-[1.6]">{para}</p>)}
          </div>
        ) : b.body.includes('\n') ? (
          // Several paragraphs: numbered in the margin, so questions can point at "§2".
          <div className="rounded-r-xl bg-[var(--s)] border-l-[4px] border-[var(--m)] pl-2 pr-3.5 py-2 font-bold leading-[1.55] space-y-1" style={{ fontSize: b.size ?? 13 }}>
            {b.body.split('\n').map((para, i) => (
              <p key={i} className="flex gap-1.5">
                <span className="shrink-0 w-4 text-right text-[10.5px] font-extrabold text-[var(--m)] pt-[2px]">{i + 1}</span>
                <span>{para}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="rounded-r-xl bg-[var(--s)] border-l-[4px] border-[var(--m)] px-3.5 py-2 font-bold leading-[1.6]" style={{ fontSize: b.size ?? 13 }}>{b.body}</p>
        )}
      </div>
    )
    case 'grid': return (
      <div className="rounded-xl overflow-hidden border-[1.5px] border-[var(--m)]">
        {b.title && <div className="bg-[var(--m)] text-white text-center text-[13px] font-extrabold py-[3px]" style={{ fontFamily: HEAD }}><Txt s={b.title} /></div>}
        {b.rows.map((r, i) => (
          <div key={i} className={`grid ${r.dark ? 'bg-[var(--m)] text-white' : r.plain ? '' : 'bg-white'} ${i > 0 || b.title ? 'border-t border-[var(--s)]' : ''}`}
            style={{ gridTemplateColumns: (r.span ?? r.cells.map(() => 1)).map(s => `minmax(0, ${s}fr)`).join(' ') }}>
            {r.cells.map((c, j) => (
              <div key={j} className={`px-1.5 py-[3px] text-center font-extrabold leading-tight ${j > 0 ? (r.dark ? 'border-l border-white/25' : 'border-l border-[var(--s)]') : ''}`}
                style={{ fontSize: r.size ?? 12.5, color: r.dark ? undefined : r.plain ? GREY_TEXT : undefined }}>
                {EN_AR.test(c) && !r.dark ? <EnAr s={c} size={r.size ?? 12.5} /> : <Txt s={c} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
    case 'chips': return (
      <div className="flex justify-between gap-2">
        {b.items.map(([label, above]) => (
          <div key={label} className="flex-1 flex flex-col items-stretch gap-[3px]">
            <div className="text-center text-[11px] font-bold leading-none" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}>{above}</div>
            <Chip size={14} className="rounded-full">{label}</Chip>
          </div>
        ))}
      </div>
    )
    case 'art': return <div className="text-center leading-none" style={{ ...EMOJI, fontSize: b.size ?? 90 }}>{b.icon}</div>
    case 'sticky': return (
      <div className="mx-auto w-[160px] bg-[var(--tip)] rounded-xl px-3 py-3 text-center text-[19px] font-bold leading-snug -rotate-3 shadow-[3px_4px_0_rgba(30,42,92,0.18)]" dir="rtl" style={{ fontFamily: AR }}>
        <span style={EMOJI}>📌</span> {b.text}
      </div>
    )
    case 'exercise': return (
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="rounded-md bg-[var(--m)] text-white px-2 py-[1px] text-[12.5px] font-extrabold" style={{ fontFamily: HEAD }}>Exercise {ctx.exNo.get(b) ?? ''}</span>
          <span className="text-[14.5px] font-extrabold text-[var(--m)] leading-tight" style={{ fontFamily: HEAD }}><Mixed text={b.title} /></span>
        </div>
        {b.instr && <div className="text-[12px] font-bold" style={{ color: GREY_TEXT }} dir={isAr(b.instr) ? 'rtl' : 'ltr'}><Txt s={b.instr} /></div>}
        <div className="grid gap-x-6 gap-y-[5px]" style={{ gridTemplateColumns: `repeat(${b.cols ?? 1}, minmax(0, 1fr))` }}>
          {b.items.map((it, i) => (
            <div key={i} className="flex gap-1.5 font-bold leading-snug" style={{ fontSize: b.size ?? 13 }}>
              <span className="shrink-0 min-w-[18px] text-right text-[var(--m)] font-extrabold">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <QuestionText text={it.q} />
                {it.options && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] mt-0.5" style={{ color: GREY_TEXT }}>
                    {it.options.map((o, k) => <span key={k}><b className="text-[var(--m)]">{'abcd'[k]})</b> {o}</span>)}
                  </div>
                )}
                {b.lines && <div className="h-[19px] border-b border-dashed border-[#94A3B8]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    case 'tiles': return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${b.cols ?? 3}, minmax(0, 1fr))` }}>
        {b.items.map(([icon, en, ar], i) => b.photos?.[i] ? (
          // A photograph on a soft tinted card, as the Level 1 cards: the word in colour, its meaning in grey (all grey in black-and-white).
          <div key={i} className="rounded-2xl bg-[var(--s)] p-1.5 pb-2 flex flex-col">
            <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-white">
              <img src={b.photos[i]} alt={en} loading="eager" decoding="sync" className="absolute inset-0 w-full h-full object-cover" style={EMOJI} />
            </div>
            <div className="pt-1.5 px-1 text-center">
              <div className="text-[15px] font-extrabold leading-tight text-[var(--m)]">{en}</div>
              <div dir="rtl" className="mt-0.5 text-[13px] font-bold leading-tight" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</div>
            </div>
          </div>
        ) : (b.cols ?? 3) >= 5 ? (
          // A small word card (the extra words), in the soft style of the Level 1 cards.
          <div key={i} className="rounded-2xl bg-[var(--s)] px-1.5 py-2 flex flex-col items-center text-center">
            <span className="text-[30px] leading-none" style={EMOJI}>{icon}</span>
            <div className="mt-1 text-[12.5px] font-extrabold leading-tight text-[var(--m)]">{en}</div>
            <div dir="rtl" className="mt-0.5 text-[11.5px] font-bold leading-tight" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</div>
          </div>
        ) : (
          <div key={i} className="rounded-2xl bg-white border-[1.5px] border-[var(--s)] shadow-[0_3px_0_var(--s)] overflow-hidden flex flex-col items-center text-center pb-2">
            <div className="relative w-full flex items-center justify-center py-2.5 bg-[var(--s)]">
              <span className="absolute left-2 top-1.5 text-[10px] font-extrabold text-[var(--m)] opacity-70">{pad(i + 1)}</span>
              <span className="text-[38px] leading-none" style={EMOJI}>{icon}</span>
            </div>
            <div className="px-2 pt-1.5 text-[14px] font-extrabold leading-tight text-[var(--k)]">{en}</div>
            <div dir="rtl" className="px-2 mt-0.5 text-[12.5px] font-bold leading-tight text-[var(--m)]" style={{ fontFamily: AR }}>{ar}</div>
          </div>
        ))}
      </div>
    )
    case 'chat': return (
      <div className="grid gap-x-4 gap-y-2.5" style={{ gridTemplateColumns: `repeat(${b.cols ?? 2}, minmax(0, 1fr))` }}>
        {b.rows.map(([q, a, qAr, aAr], i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="self-start max-w-[94%] rounded-2xl rounded-bl-[4px] bg-[#F3F0EA] px-3 py-1.5">
              <div className="text-[12.5px] font-bold leading-snug"><Mixed text={q} /></div>
              {qAr && <Gloss s={qAr} size={11.5} />}
            </div>
            <div className="self-end max-w-[94%] rounded-2xl rounded-br-[4px] bg-[var(--m)] px-3 py-1.5 text-white">
              <div className="text-[12.5px] font-extrabold leading-snug"><Mixed text={a} /></div>
              {aAr && <div dir="rtl" className="text-[11.5px] font-bold leading-snug text-white/85" style={{ fontFamily: AR }}><RtlMixed text={aAr} /></div>}
            </div>
          </div>
        ))}
      </div>
    )
    case 'phrases': return (
      // One soft card per exchange, with room around it: what you say ➜ the reply, the Arabic under each.
      <div className="flex flex-col gap-2">
        {b.rows.map(([q, a, qAr, aAr], i) => (
          <div key={i} className="grid items-center gap-3 rounded-2xl bg-[var(--s)] px-3 py-2.5" style={{ gridTemplateColumns: '26px 1fr 20px 1fr' }}>
            <span className="w-[26px] h-[26px] rounded-full bg-white text-[var(--m)] flex items-center justify-center text-[12px] font-extrabold" style={{ fontFamily: HEAD }}>{i + 1 + (b.start ?? 0)}</span>
            <div>
              <div className="text-[14px] font-bold leading-snug"><Mixed text={q} /></div>
              {qAr && <Gloss s={qAr} size={12.5} />}
            </div>
            <span className="text-[var(--m)] text-[15px] font-extrabold text-center">➜</span>
            <div>
              <div className="text-[14px] font-extrabold leading-snug text-[var(--m)]"><Mixed text={a} /></div>
              {aAr && <Gloss s={aAr} size={12.5} />}
            </div>
          </div>
        ))}
      </div>
    )
    case 'script': {
      // Speakers in order of appearance: the first in the section colour, the second in ink, then two more.
      const cast: string[] = []
      const tone = ['var(--m)', 'var(--k)', '#B45309', '#0F766E']
      return (
        <div className="flex flex-col" style={{ fontSize: b.size ?? 13 }}>
          {b.lines.map((s, i) => {
            const m = s.match(/^([^:]{1,20}):\s(.*)$/)
            const who = m?.[1] ?? ''
            if (who && !cast.includes(who)) cast.push(who)
            return (
              <div key={i} className="grid items-baseline gap-2.5 rounded-md px-2 py-[3px]" style={{ gridTemplateColumns: '108px 1fr', background: i % 2 ? 'transparent' : 'var(--s)' }}>
                <span className="text-right font-extrabold uppercase tracking-wide whitespace-nowrap text-[0.78em]" style={{ color: tone[cast.indexOf(who) % tone.length] }}>{who}</span>
                <span className="font-semibold leading-snug"><Mixed text={m ? m[2] : s} /></span>
              </div>
            )
          })}
        </div>
      )
    }
    case 'answers': return (
      <div className="flex flex-col gap-2">
        {b.items.map((q, i) => (
          <div key={i} className="text-[13.5px] font-bold">
            <Bullet><span className="text-[var(--k)]"><Mixed text={q} /></span></Bullet>
            <div className="ml-3 h-[26px] border-b-[1.5px] border-dashed border-[#94A3B8]" />
          </div>
        ))}
      </div>
    )
    case 'lines': return (
      <div className="flex flex-col">
        {Array.from({ length: b.n }, (_, i) => <div key={i} className="h-[26px] border-b border-dashed border-[#94A3B8]" />)}
      </div>
    )
    case 'key': return (
      <div className="flex flex-col gap-[4px]">
        {b.items.map((k, i) => (
          <div key={i} className="flex gap-2 text-[11.5px] font-bold leading-snug">
            <span className="shrink-0 w-[96px] text-[var(--m)] font-extrabold whitespace-nowrap" style={{ fontFamily: HEAD }}>{k.label}</span>
            <span className="flex-1 min-w-0">
              {k.answers.map((a, j) => (
                <Fragment key={j}>{j > 0 && <span className="opacity-40"> · </span>}<b className="text-[var(--m)]">{j + 1}.</b> <Mixed text={a} /></Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    )
    case 'family': return <FamilyTree vocab={b.vocab} people={b.people} />
    case 'preps': return <Prepositions items={b.items} />
    case 'clocks': return (
      <div className="grid grid-cols-8 gap-2">
        {b.times.map(t => (
          <div key={t} className="flex flex-col items-center gap-0.5">
            <Clock time={t} />
            <span className="text-[12.5px] font-extrabold text-[var(--m)]">It&apos;s {t}</span>
          </div>
        ))}
      </div>
    )
    case 'pointing': return (
      <div className="grid grid-cols-4 gap-2.5">
        {b.items.map(p => (
          <div key={p.en} className="rounded-xl bg-[var(--s)] px-2 py-1.5">
            <div className="text-center text-[10.5px] font-bold leading-tight" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}><RtlMixed text={p.caption} /></div>
            <div className="flex items-center h-[40px] px-1" style={EMOJI}>
              <span className="text-[24px]">👉</span>
              <span className="flex-1" style={{ maxWidth: p.far ? 80 : 6 }} />
              <span className="text-[21px] whitespace-nowrap">{p.many ? '🚗🚗🚗' : '🚗'}</span>
            </div>
            <div className="text-center text-[12.5px] font-extrabold text-[var(--m)] leading-tight">{p.en}</div>
            <Gloss s={p.ar} size={11.5} className="!text-center" />
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
  return <>{parts.map((p, i) => p === 'teen' ? <span key={i} className="text-[#1D4ED8]">{p}</span> : p === 'ty' ? <span key={i} className="text-[#DC2626]">{p}</span> : <Fragment key={i}>{p}</Fragment>)}</>
}

function Numbers() {
  const ten = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between px-1">
        {ten.map((w, i) => (
          <div key={w} className="flex flex-col items-center gap-0.5">
            <span className="w-[36px] h-[36px] rounded-full bg-[var(--m)] text-white flex items-center justify-center text-[17px] font-extrabold" style={{ fontFamily: HEAD }}>{i + 1}</span>
            <span className="text-[11.5px] font-bold">{w}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-x-4 text-[12px] font-bold">
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
    return <line x1="30" y1="30" x2={30 + len * Math.cos(r)} y2={30 + len * Math.sin(r)} stroke="#1E2A5C" strokeWidth={w} strokeLinecap="round" />
  }
  return (
    <svg viewBox="0 0 60 60" width="62" height="62" aria-label={time}>
      <circle cx="30" cy="30" r="27" strokeWidth="3" style={{ fill: 'var(--s)', stroke: 'var(--m)' }} />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (i * 30 - 90) * (Math.PI / 180)
        return <line key={i} x1={30 + 23 * Math.cos(r)} y1={30 + 23 * Math.sin(r)} x2={30 + 26 * Math.cos(r)} y2={30 + 26 * Math.sin(r)} stroke="#1E2A5C" strokeWidth={i % 3 ? 1 : 2} />
      })}
      {[12, 3, 6, 9].map((n, i) => {
        const r = (i * 90 - 90) * (Math.PI / 180)
        return <text key={n} x={30 + 17.5 * Math.cos(r)} y={30 + 17.5 * Math.sin(r) + 2.6} fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="Mali, sans-serif" fill="#1E2A5C">{n}</text>
      })}
      {hand(hAngle, 11, 3)}
      {hand(mAngle, 18, 2)}
      <circle cx="30" cy="30" r="2" fill="#1E2A5C" />
    </svg>
  )
}

function Prepositions({ items }: { items: [kind: string, en: string, ar: string][] }) {
  const box = (style: CSSProperties) => <span className="absolute bg-[var(--m)] rounded-[4px]" style={{ width: 34, height: 32, ...style }} />
  const mouse = (style: CSSProperties, z = 1) => <span className="absolute text-[26px] leading-none" style={{ ...EMOJI, zIndex: z, ...style }}>🐭</span>
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
        <div key={en} className="flex flex-col items-center rounded-xl bg-[var(--s)] pt-1.5 pb-1">
          <div className="relative" style={{ width: 86, height: 60 }}>{scene(kind)}</div>
          <div className="text-[13.5px] font-extrabold text-[var(--m)] leading-tight">{en}</div>
          <div className="text-[12px] font-bold leading-tight" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Family tree (lesson 5) ──────────────────────────────────────────────
   Three generations, full width: grandparents → their three children with
   their spouses (the cousins under the uncles and aunts) → "my" parents'
   three children with their spouses → their children. The vocabulary sits
   underneath in three columns, then the notes. */

type P = [string, string, string]
function Person({ p: [face, role, name] }: { p: P }) {
  return (
    <div className="flex flex-col items-center w-[66px]">
      <span className="w-[36px] h-[36px] rounded-full bg-white border-2 border-[var(--m)] flex items-center justify-center text-[21px] leading-none" style={EMOJI}>{face}</span>
      <span className="mt-[2px] text-[11px] font-extrabold leading-tight">{name}</span>
      <span className="text-[9.5px] font-extrabold leading-tight text-[var(--m)] whitespace-nowrap">{role}</span>
    </div>
  )
}
const Couple = ({ a, b }: { a: P; b: P }) => (
  <div className="flex items-start justify-center"><Person p={a} /><span className="mt-[12px] text-[13px] text-[var(--m)]">❤</span><Person p={b} /></div>
)
const Pair2 = ({ a, b }: { a: P; b: P }) => (
  <div className="flex items-start justify-center gap-1"><Person p={a} /><Person p={b} /></div>
)
/** A small definition note beside the grandparents. */
const TreeNote = ({ text }: { text: string }) => (
  <div className="mx-auto max-w-[200px] rounded-lg bg-[var(--tip)] px-2 py-1 text-center text-[10.5px] font-bold leading-snug" dir={isAr(text) ? 'rtl' : 'ltr'}><Txt s={text} /></div>
)

/** The bracket from a parent down to their children (three columns). */
const Bracket = () => (
  <div className="w-full grid grid-cols-3"><div className="col-span-3 mx-[16.6%] h-[11px] border-x-2 border-t-2 border-[var(--m)] rounded-t-md" /></div>
)

/** The first edition's family (the Canva book's). */
const FAMILY_V1: FamilyPeople = {
  grandpa: ['👴', 'Grandfather', 'Abdurrahman'], grandma: ['👵', 'Grandmother', 'Safiya'],
  aunt1: ['👩', 'Aunt', 'Salma'], uncle1: ['👨', 'Uncle', 'Samir'],
  father: ['👨‍🦱', 'Father', 'Ahmed'], mother: ['👩‍🦱', 'Mother', 'Khadija'],
  uncle2: ['🧔', 'Uncle', 'Youssef'], aunt2: ['👩‍🦰', 'Aunt', 'Zaynab'],
  cousins1: [['👧', 'Cousin', 'Hala'], ['👦', 'Cousin', 'Achraf']], cousins2: [['👧', 'Cousin', 'Abir'], ['👦', 'Cousin', 'Iyad']],
  left: [['👩', 'Sister-in-law', 'Iness'], ['👨', 'Brother', 'Zaid']],
  me: [['🧑', 'Husband (me)', 'Adil'], ['👩', 'Wife (me)', 'Maysoun']],
  right: [['👩‍🦱', 'Sister', 'Ihssane'], ['🧔', 'Brother-in-law', 'Omar']],
  kidsLeft: [['👦', 'Nephew', 'Yahya'], ['👧', 'Niece', 'Maram']], kidsMe: [['👦', 'Son', 'Fares'], ['👧', 'Daughter', 'Issrae']], kidsRight: [['👦', 'Nephew', 'Salim'], ['👧', 'Niece', 'Hiba']],
  notes: [
    'Grandfather + Grandmother = Grandparents', 'Father + Mother = Parents · Husband + Wife = Spouses',
    'Son + Daughter = Children - أبناء', 'زوجة العم أو الخال تسمى أيضًا Aunt', 'زوج العمة أو الخالة يسمى أيضًا Uncle',
  ],
}
const FAMILY_VOCAB_V1: [string, string][] = [
  ['Grandfather', 'الجد'], ['Grandmother', 'الجدة'], ['Father', 'الأب'], ['Mother', 'الأم'], ['Brother', 'الأخ'], ['Sister', 'الأخت'], ['Husband', 'الزوج'],
  ['Wife', 'الزوجة'], ['Son', 'الابن'], ['Daughter', 'الابنة'], ['Grandson', 'الحفيد'], ['Granddaughter', 'الحفيدة'], ['Aunt', 'العمة / الخالة'], ['Uncle', 'العم / الخال'],
  ['Cousins', 'أبناء العم / الخال'], ['Sister-in-law', 'زوجة الأخ'], ['Brother-in-law', 'زوج الأخت'], ['Nephew', 'ابن الأخ / الأخت'], ['Niece', 'بنت الأخ / الأخت'],
]

function FamilyTree({ vocab = FAMILY_VOCAB_V1, people: p = FAMILY_V1 }: { vocab?: [string, string][]; people?: FamilyPeople }) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionHead title="The Family Tree - شجرة العائلة" badge={<span style={EMOJI}>🌳</span>} />
      <div className="rounded-2xl bg-[var(--s)] px-3 pt-2 pb-2.5 flex flex-col items-center gap-[3px]" dir="ltr">
        <div className="w-full grid grid-cols-3 items-center">
          <TreeNote text={p.notes[0]} />
          <Couple a={p.grandpa} b={p.grandma} />
          <TreeNote text={p.notes[1]} />
        </div>
        <Bracket />
        <div className="w-full grid grid-cols-3">
          <Couple a={p.aunt1} b={p.uncle1} />
          <Couple a={p.father} b={p.mother} />
          <Couple a={p.uncle2} b={p.aunt2} />
        </div>
        <div className="w-full grid grid-cols-3 items-start">
          <div className="flex flex-col items-center"><span className="w-[2px] h-[8px] bg-[var(--m)]" /><Pair2 a={p.cousins1[0]} b={p.cousins1[1]} /></div>
          <div className="flex flex-col items-center"><span className="w-[2px] h-[52px] bg-[var(--m)]" /></div>
          <div className="flex flex-col items-center"><span className="w-[2px] h-[8px] bg-[var(--m)]" /><Pair2 a={p.cousins2[0]} b={p.cousins2[1]} /></div>
        </div>
        <Bracket />
        <div className="w-full grid grid-cols-3">
          <Couple a={p.left[0]} b={p.left[1]} />
          <Couple a={p.me[0]} b={p.me[1]} />
          <Couple a={p.right[0]} b={p.right[1]} />
        </div>
        <div className="w-full grid grid-cols-3">
          {[p.kidsLeft, p.kidsMe, p.kidsRight].map((k, i) => (
            <div key={i} className="flex flex-col items-center"><span className="w-[2px] h-[8px] bg-[var(--m)]" /><Pair2 a={k[0]} b={k[1]} /></div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-4 gap-y-[1px]" style={{ gridAutoFlow: 'column', gridTemplateRows: `repeat(${Math.ceil(vocab.length / 4)}, auto)` }}>
        {vocab.map(([en, ar]) => (
          <div key={en} className="flex items-baseline gap-1.5 border-b border-dotted border-[#CBD5E1] py-[2px] text-[11.5px]">
            <span className="font-extrabold text-[var(--m)] whitespace-nowrap">{en}</span>
            <span className="flex-1" />
            <span className="font-bold text-right leading-tight" dir="rtl" style={{ fontFamily: AR, color: GREY_TEXT }}>{ar}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {p.notes.slice(2).map(n => (
          <div key={n} className="rounded-xl bg-[var(--tip)] px-2.5 py-1 text-[11px] font-bold leading-snug" dir={isAr(n) ? 'rtl' : 'ltr'}>
            <span style={EMOJI}>💡</span> <Txt s={n} />
          </div>
        ))}
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
    case 'gb': body = <g transform="scale(1 1.3333)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>; break
    case 'de': body = <><rect width={w} height="13.4" fill="#000" /><rect y="13.3" width={w} height="13.4" fill="#DD0000" /><rect y="26.6" width={w} height="13.4" fill="#FFCE00" /></>; break
    case 'tr': body = <><rect width={w} height={h} fill="#E30A17" /><circle cx="24" cy="20" r="10" fill="#fff" /><circle cx="26.5" cy="20" r="8" fill="#E30A17" />{star(37, 20, 4.2, '#fff')}</>; break
    case 'cn': body = <><rect width={w} height={h} fill="#DE2910" />{star(10, 10, 6, '#FFDE00')}{star(20, 4, 2, '#FFDE00')}{star(24, 8, 2, '#FFDE00')}{star(24, 14, 2, '#FFDE00')}{star(20, 18, 2, '#FFDE00')}</>; break
    case 'us': body = <>
      <rect width={w} height={h} fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * (40 / 6.5)} width={w} height={40 / 13} fill="#B22234" />)}
      <rect width="26" height="21.5" fill="#3C3B6E" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={4 + (i % 4) * 6} cy={4 + Math.floor(i / 4) * 6.5} r="1.1" fill="#fff" />)}
    </>; break
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="54" height="36" className="shrink-0 rounded-[4px] shadow-[0_0_0_1px_#E2E8F0]" aria-label={id}>
      <defs><clipPath id={`f${uid}`}><rect width={w} height={h} rx="3" /></clipPath></defs>
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
          <div className="text-[64px] font-extrabold leading-none tracking-tight" style={{ fontFamily: HEAD }} dir="ltr">Inglizi.com</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[13px] font-bold opacity-90">.كـــوم</span>
            <span className="bg-[#111] text-white px-3 py-[1px] text-[16px] font-bold">أكاديمية إنجليزي الدولية</span>
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
        <div className="absolute left-[40px] bottom-[26px]" dir="ltr"><CodeSlot info={info} size={78} /></div>
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
      {items.map((d, i) => <d.Icon key={i} className="absolute opacity-[0.14]" size={d.size} strokeWidth={1.4} style={{ left: d.x, top: d.y, transform: `rotate(${d.rot}deg)`, color: 'var(--m)' }} />)}
    </div>
  )
}

/** The sign hanging from two strings ("شكراً", "الفهرس"). */
function HangingSign({ text }: { text: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 230, height: 120 }}>
      <svg className="absolute inset-0" width="230" height="40" aria-hidden><line x1="40" y1="0" x2="40" y2="40" stroke="#1E2A5C" strokeWidth="1.5" strokeDasharray="2 3" /><line x1="190" y1="0" x2="190" y2="40" stroke="#1E2A5C" strokeWidth="1.5" strokeDasharray="2 3" /></svg>
      <div className="absolute inset-x-0 top-[30px] bottom-0 bg-[var(--m)] text-white rounded-xl flex items-center justify-center -rotate-2">
        <div className="absolute inset-[6px] border-2 border-dashed border-white/50 rounded-lg" />
        <span className="text-[46px] leading-none pt-2" style={{ fontFamily: AR_DISPLAY, fontWeight: 'var(--book-display-weight, 400)' }}>{text}</span>
      </div>
    </div>
  )
}

/** `note` (a book's copyright notice) takes the bottom of the page, in place of the buyer's line. */
export function ThanksPage({ info, filename, note }: { info: BookInfo; filename: string; note?: ReactNode }) {
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
      {note ? <div className="absolute left-[34px] right-[134px] bottom-[34px]">{note}</div> : name && (
        <div className="absolute inset-x-0 bottom-[60px] flex justify-center" dir="rtl" style={{ fontFamily: AR }}>
          <span className="rounded-xl bg-[var(--s)] px-5 py-1.5 text-[16px] font-bold">هذه النسخة خاصة بـ: {name}</span>
        </div>
      )}
      <div className="absolute right-[34px] bottom-[34px]"><CodeSlot info={info} size={78} /></div>
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
          <div key={l.n} className="flex flex-col items-center" style={info.mono ? undefined : { '--m': lessonColour(i).m } as CSSProperties}>
            <svg width="44" height="20" aria-hidden><circle cx="22" cy="4" r="3.5" fill="#1E2A5C" /><line x1="22" y1="4" x2="6" y2="20" stroke="#1E2A5C" strokeWidth="2" /><line x1="22" y1="4" x2="38" y2="20" stroke="#1E2A5C" strokeWidth="2" /></svg>
            <span className="relative z-10 -mt-1 bg-white border-2 border-[var(--m)] rounded-full px-3 text-[15px] leading-[24px]" style={{ fontFamily: AR_DISPLAY }}>الدرس {l.n}</span>
            <div className="-mt-2 w-full min-h-[64px] bg-[var(--m)] text-white rounded-xl px-2 pt-3.5 pb-2 flex items-center justify-center text-center leading-[1.25]"
              style={{ fontFamily: AR_DISPLAY, fontSize: l.titleAr.length > 24 ? 15 : 18, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
              <span><RtlMixed text={l.titleAr} /></span>
            </div>
            <span className="mt-1 text-[11px] font-bold" style={{ color: GREY_TEXT }} dir="ltr">Page {pad(i + 1)}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-[34px] bottom-[34px]"><CodeSlot info={info} size={78} /></div>
    </Frame>
  )
}
