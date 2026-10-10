'use client'

import { useEffect, useId, type CSSProperties, type ReactNode } from 'react'
import { BookOpen, Check, Headphones, Languages, Layers, MapPin, PenLine, type LucideIcon } from 'lucide-react'
import { PLAY, QrLink } from '@/components/QrLink'
import { Zellige } from '../level1-cards/_cards'

/**
 * The covers of the series «LA KAART ENGLISH → PIIRMI ENGLISH → VIIZA
 * ENGLISH»: three papers every Moroccan knows, each one opening a door. Level
 * 1 is la kaart, the ID card: who you are, your age, your phone, your
 * country, your family — the first lessons of the book.
 *
 * The cover is a document, inspired by one and never a copy: no emblem, no
 * official marks, no real layout. What makes it read as "a paper" is the
 * security printing — guilloche rosettes and woven wave bands, drawn here as
 * SVG curves — a hologram seal, a chip and a machine-readable strip that
 * spells English phrases. Navy and gold, as the play cards and the box.
 */

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap'
const EN = "'Poppins', 'IBM Plex Sans Arabic', sans-serif"
const AR = "'IBM Plex Sans Arabic', 'Tajawal', sans-serif"
const MONO = "'IBM Plex Mono', 'Courier New', monospace"

const NAVY = '#14306B', NAVY_D = '#081633', GOLD = '#B8862F', GOLD_L = '#E9C979', GOLD_INK = '#7A5A1C'
const IVORY = '#FBF7EE', GREY = '#5B6474', LINE = '#E3D8BF'

const H: CSSProperties = { fontFamily: EN, fontWeight: 700 }
const BS: CSSProperties = { fontFamily: EN, fontWeight: 600 }
const B: CSSProperties = { fontFamily: EN, fontWeight: 500 }
const AS: CSSProperties = { fontFamily: AR, fontWeight: 600 }
const AH: CSSProperties = { fontFamily: AR, fontWeight: 700 }
/** Gold foil: a gradient clipped to the letters (shadows go through `filter`, not text-shadow). */
const FOIL: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #FBEBB8 0%, #E8C36C 34%, #B8862F 60%, #EBCB7F 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent',
}

/** "English" as the street says it; گ is the g (the Moroccan ڭ is missing from the font). */
export const ENGLISH_AR = 'إنگليش'
export const SERIES = [
  { en: 'LA KAART', ar: 'لاكارط', level: 'A0 → A1', goalEn: 'Who you are', goalAr: 'شكون نتا' },
  { en: 'PIIRMI', ar: 'بيرمي', level: 'A1 → A2', goalEn: 'Get around', goalAr: 'تحرّك بلا خوف' },
  { en: 'VIIZA', ar: 'فيزا', level: 'A2 → B1', goalEn: 'Go further', goalAr: 'سافر وخدم' },
]

export function useCoverFonts() {
  useEffect(() => {
    if (document.getElementById('cover-fonts')) return
    const link = document.createElement('link')
    link.id = 'cover-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

/* ── Security printing ───────────────────────────────────────────────── */

const TAU = Math.PI * 2
const f = (n: number) => n.toFixed(1)

/** A guilloche rosette: `count` closed curves, a circle of radius R rippled by two waves (n and m lobes), each curve a phase on from the last. */
function rosette(cx: number, cy: number, R: number, a: number, n: number, b: number, m: number, count: number, squash = 1, steps = 360): string[] {
  return Array.from({ length: count }, (_, i) => {
    const ph = (i / count) * TAU
    let d = ''
    for (let k = 0; k <= steps; k++) {
      const t = (k / steps) * TAU
      const r = R + a * Math.sin(n * t + ph) + b * Math.sin(m * t - ph)
      d += `${k ? 'L' : 'M'}${f(cx + r * Math.cos(t))} ${f(cy + r * Math.sin(t) * squash)}`
    }
    return `${d}Z`
  })
}

/** A woven band: two families of sine lines, phases running opposite ways, so they braid. */
function band(w: number, y0: number, count: number, gap: number, amp: number, period: number, shift = 0.42): string[] {
  const out: string[] = []
  for (const dir of [1, -1]) {
    for (let i = 0; i < count; i++) {
      let d = ''
      for (let x = -6; x <= w + 6; x += 6) d += `${x > -6 ? 'L' : 'M'}${x} ${f(y0 + i * gap + amp * Math.sin((x / period) * TAU + dir * i * shift))}`
      out.push(d)
    }
  }
  return out
}

const FRONT_ROSETTE = [...rosette(397, 655, 318, 20, 24, 9, 7, 30), ...rosette(397, 655, 230, 14, 16, 7, 5, 22)]
const FRONT_BANDS = [...band(794, 618, 9, 9, 16, 210), ...band(794, 1072, 5, 6, 7, 120)]
const CARD_BAND = band(560, 120, 22, 11, 6, 110, 0.3)
const CARD_ROSETTE = rosette(470, 190, 82, 9, 14, 4, 5, 18)
const BACK_CARD_ROSETTE = rosette(280, 176, 140, 12, 18, 6, 5, 22, 0.62)
const BACK_BAND = band(794, 30, 26, 11, 14, 230, 0.36)
const BACK_ROSETTE = rosette(690, 150, 120, 11, 18, 5, 7, 22)

function Lines({ paths, color, opacity, width = 0.8, w, h }: { paths: string[]; color: string; opacity: number; width?: number; w: number; h: number }) {
  return (
    <svg className="absolute left-0 top-0 pointer-events-none" width={w} height={h} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={width} opacity={opacity}>{paths.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  )
}

/** Printed grain, so the flat colour reads as paper. */
function Grain({ opacity = 0.16 }: { opacity?: number }) {
  const id = `g${useId().replace(/:/g, '')}`
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'overlay', opacity }} aria-hidden>
      <filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

/** The page's border: two gold rules, the inner one finer. */
const GoldFrame = ({ opacity = 1 }: { opacity?: number }) => <>
  <div className="absolute inset-[18px] rounded-[26px] pointer-events-none" style={{ border: `1.5px solid ${GOLD}`, opacity: 0.75 * opacity }} />
  <div className="absolute inset-[25px] rounded-[21px] pointer-events-none" style={{ border: `0.8px solid ${GOLD}`, opacity: 0.45 * opacity }} />
</>

/* ── The card's pieces ───────────────────────────────────────────────── */

function Portrait({ w, h, faint }: { w: number; h: number; faint?: boolean }) {
  const id = `p${useId().replace(/:/g, '')}`
  return (
    <svg width={w} height={h} viewBox="0 0 120 150" style={faint ? { opacity: 0.32 } : undefined} aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E4EAF5" /><stop offset="1" stopColor="#BCC8E0" /></linearGradient></defs>
      <rect width="120" height="150" fill={`url(#${id})`} />
      <circle cx="60" cy="58" r="26" fill={NAVY} opacity="0.88" />
      <path d="M12 150 C14 108 36 92 60 92 C84 92 106 108 108 150Z" fill={NAVY} opacity="0.88" />
    </svg>
  )
}

function Chip() {
  const id = `c${useId().replace(/:/g, '')}`
  return (
    <svg width="50" height="38" viewBox="0 0 50 38" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6E2A4" /><stop offset="0.5" stopColor="#C9973F" /><stop offset="1" stopColor="#EED08A" /></linearGradient></defs>
      <rect x="0.5" y="0.5" width="49" height="37" rx="7" fill={`url(#${id})`} stroke="#8A6424" />
      <path d="M0 13H16M0 25H16M34 13H50M34 25H50M16 0V38M34 0V38" stroke="#8A6424" strokeWidth="0.9" fill="none" />
      <rect x="16" y="10" width="18" height="18" rx="3" fill="none" stroke="#8A6424" strokeWidth="0.9" />
    </svg>
  )
}

/** The hologram: a rainbow-foil disc, the series' name round its rim, a zellige star inside. */
function Seal({ size }: { size: number }) {
  const id = `s${useId().replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E2A4" /><stop offset="0.3" stopColor="#F3C2D8" /><stop offset="0.55" stopColor="#B5E3F2" /><stop offset="0.8" stopColor="#EBCF85" /><stop offset="1" stopColor="#C9973F" />
        </linearGradient>
        <path id={`${id}c`} d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}h)`} opacity="0.92" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#7A5A1C" strokeWidth="0.6" opacity="0.6" />
      <circle cx="50" cy="50" r="29" fill="none" stroke="#7A5A1C" strokeWidth="0.6" opacity="0.6" />
      <text fontSize="8.6" fontFamily={EN} fontWeight="700" fill="#5E4414" letterSpacing="1">
        <textPath href={`#${id}c`} textLength="228">INGLIZI · LA KAART · ENGLISH · </textPath>
      </text>
      <g fill="none" stroke="#5E4414" strokeWidth="1.3">
        <rect x="37" y="37" width="26" height="26" />
        <rect x="37" y="37" width="26" height="26" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="6" />
      </g>
    </svg>
  )
}

/** One line of the machine-readable strip: 30 characters, the gaps filled with '<'. */
const mrz = (s: string) => s.padEnd(30, '<').slice(0, 30)

function Field({ en, ar, children, span }: { en: string; ar: string; children: ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <div className="flex items-baseline gap-1.5 text-[9.5px] uppercase tracking-[0.14em]" style={{ ...BS, color: GREY }}>
        {en}<span dir="rtl" className="normal-case tracking-normal text-[10.5px]" style={AS}>{ar}</span>
      </div>
      <div className="text-[17px] leading-[1.25]" style={{ ...H, color: NAVY }}>{children}</div>
    </div>
  )
}

/** The card itself, 85.6 × 54 mm drawn at 560 × 353. */
function IdCard() {
  return (
    <div className="relative overflow-hidden rounded-[22px]" dir="ltr"
      style={{ width: 560, height: 353, background: 'linear-gradient(135deg, #FFFDF8 0%, #F7F0DF 55%, #EFE2C3 100%)', boxShadow: '0 34px 60px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)' }}>
      <Lines paths={CARD_BAND} color={NAVY} opacity={0.09} w={560} h={353} />
      <Lines paths={CARD_ROSETTE} color={GOLD} opacity={0.32} width={0.7} w={560} h={353} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, transparent 18%, rgba(243,194,216,0.22) 34%, rgba(181,227,242,0.24) 48%, rgba(235,207,133,0.26) 62%, transparent 78%)' }} />

      <div className="absolute inset-x-0 top-0 h-[56px] px-6 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${NAVY_D}, ${NAVY})` }}>
        <span className="text-[21px] tracking-[0.04em] text-white" style={{ ...H, fontWeight: 800 }}>LA KAART <span style={{ color: GOLD_L }}>ENGLISH</span></span>
        <span className="text-[19px]" dir="rtl" style={{ ...AH, color: GOLD_L }}>لاكارط {ENGLISH_AR}</span>
      </div>
      <div className="absolute inset-x-0 top-[56px] h-[3px]" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L}, ${GOLD})` }} />

      <div className="absolute left-6 top-[76px] rounded-[10px] overflow-hidden" style={{ boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${LINE}` }}><Portrait w={120} h={150} /></div>
      <div className="absolute left-[86px] top-[172px]"><Seal size={60} /></div>
      <div className="absolute left-6 top-[240px] flex items-center gap-2">
        <Chip />
        <span className="text-[10px] leading-tight" style={{ ...BS, color: GREY }}>No.<br /><span style={{ fontFamily: MONO, color: NAVY, fontSize: 12 }}>LK-A1-0001</span></span>
      </div>

      <div className="absolute left-[168px] right-6 top-[72px] grid grid-cols-2 gap-x-5 gap-y-[9px]">
        <Field en="Name" ar="الاسم" span><span className="inline-block w-[300px] border-b-[1.5px] border-dotted translate-y-[-4px]" style={{ borderColor: GREY }}>&nbsp;</span></Field>
        <Field en="Level" ar="المستوى">A0 → A1</Field>
        <Field en="Language" ar="اللغة">English</Field>
        <Field en="From" ar="من">Morocco</Field>
        <Field en="Valid" ar="الصلاحية">For life <span className="text-[13px]" dir="rtl" style={{ ...AS, color: GOLD_INK }}>مدى الحياة</span></Field>
        <Field en="Signature" ar="التوقيع">
          <svg width="130" height="26" viewBox="0 0 130 26" aria-hidden>
            <path d="M2 20 C10 2 16 26 24 12 S36 2 42 16 S54 26 62 8 S78 4 82 18 S96 22 104 10 L126 6" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Field>
        <Field en="Issued by" ar="صادرة عن">Inglizi.com</Field>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[62px] px-6 flex flex-col justify-center text-[15.5px] leading-[1.22] tracking-[0.3em]"
        style={{ fontFamily: MONO, fontWeight: 600, color: '#2A3346', background: 'rgba(255,255,255,0.55)', borderTop: `1px solid ${LINE}` }}>
        <span>{mrz('ID<ENGLISH<<LA<KAART')}</span>
        <span>{mrz('A0<A1<19<LESSONS<INGLIZI')}</span>
        <span>{mrz('HELLO<<MY<NAME<IS')}</span>
      </div>
    </div>
  )
}

/** The card's back, peeking out behind it: navy, gold zellige, a rosette. */
function IdCardBack() {
  return (
    <div className="relative overflow-hidden rounded-[22px]"
      style={{ width: 560, height: 353, background: `linear-gradient(140deg, #1C3F87, ${NAVY} 50%, ${NAVY_D})`, boxShadow: '0 24px 50px rgba(0,0,0,0.45)', border: `1px solid ${GOLD}66` }}>
      <Zellige color={GOLD} opacity={0.3} size={30} />
      <Lines paths={BACK_CARD_ROSETTE} color={GOLD_L} opacity={0.5} width={0.7} w={560} h={353} />
      <div className="absolute inset-x-0 top-[34px] h-[46px]" style={{ background: '#050B1C' }} />
      <div className="absolute inset-x-0 top-[84px] h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
    </div>
  )
}

/* ── The front cover ─────────────────────────────────────────────────── */

const FRONT_FEATURES: [LucideIcon, string, string][] = [
  [BookOpen, '19 lessons', '19 درسًا'],
  [Headphones, 'Audio for every line', 'صوت لكل جملة'],
  [MapPin, 'Moroccan everyday life', 'من حياتنا اليومية'],
]

export function LaKaartFront({ book = "STUDENT'S BOOK", bookAr = 'كتاب الطالب', author = 'Hamza El Qasraoui', authorAr = 'حمزة القصراوي' }: {
  book?: string; bookAr?: string; author?: string; authorAr?: string
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" dir="ltr" style={{ background: `radial-gradient(ellipse 80% 70% at 50% 58%, #24509F 0%, ${NAVY} 46%, ${NAVY_D} 100%)` }}>
      <Zellige color={GOLD} opacity={0.11} size={56} stroke={1.1} />
      <Lines paths={FRONT_ROSETTE} color={GOLD} opacity={0.32} width={0.7} w={794} h={1123} />
      <Lines paths={FRONT_BANDS} color={GOLD_L} opacity={0.3} width={0.8} w={794} h={1123} />
      <div className="absolute rounded-full" style={{ left: 147, top: 420, width: 500, height: 460, background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 68%)' }} />
      <Grain />
      <GoldFrame />

      {/* the publisher and the level */}
      <div className="absolute left-[50px] right-[50px] top-[46px] flex items-start justify-between">
        <span className="text-[24px] leading-none text-white" style={H}>Inglizi<span style={{ color: GOLD_L }}>.com</span></span>
        <div className="flex flex-col items-end">
          <span className="rounded-full px-4 py-[5px] text-[14px] leading-none tracking-[0.12em] text-white" style={{ ...H, border: `1.5px solid ${GOLD_L}` }}>LEVEL 1 · A0 → A1</span>
          <span className="mt-1.5 mr-2 text-[14px] leading-none" dir="rtl" style={{ ...AS, color: GOLD_L }}>المستوى الأول</span>
        </div>
      </div>

      {/* the title */}
      <div className="absolute inset-x-0 top-[112px] flex flex-col items-center">
        <div className="text-[126px] leading-[1] tracking-[-0.01em]" style={{ ...H, fontWeight: 900, ...FOIL, filter: 'drop-shadow(0 6px 0 #050B1C) drop-shadow(0 16px 22px rgba(0,0,0,0.45))' }}>LA KAART</div>
        <div className="mt-2 flex items-center gap-5">
          <span className="h-[2px] w-[90px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_L})` }} />
          <span className="text-[40px] leading-none tracking-[0.5em] pl-[0.5em] text-white" style={{ ...H, fontWeight: 600 }}>ENGLISH</span>
          <span className="h-[2px] w-[90px]" style={{ background: `linear-gradient(90deg, ${GOLD_L}, transparent)` }} />
        </div>
        <div className="mt-4 text-[54px] leading-[1.15] text-white" dir="rtl" style={{ ...AH, filter: 'drop-shadow(0 4px 0 #050B1C)' }}>لاكارط {ENGLISH_AR}</div>
      </div>

      {/* the card, its back behind it */}
      <div className="absolute" style={{ left: 196, top: 428, transform: 'rotate(8deg)' }}><IdCardBack /></div>
      <div className="absolute" style={{ left: 104, top: 486, transform: 'rotate(-5deg)' }}><IdCard /></div>

      {/* the promise */}
      <div className="absolute inset-x-0 top-[878px] flex flex-col items-center text-center">
        <div className="text-[33px] leading-tight text-white" dir="rtl" style={AH}>خرّج لاكارط ديالك… بالإنجليزية!</div>
        <div className="mt-1 text-[17px] tracking-[0.18em] uppercase" style={{ ...BS, color: GOLD_L }}>Your first ID in English</div>
      </div>

      {/* which book */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[972px] flex items-center gap-4 rounded-[12px] px-8 py-[9px] whitespace-nowrap"
        style={{ background: 'linear-gradient(180deg, #F3DA96, #C9973F 55%, #B8862F)', boxShadow: '0 5px 0 #6B4E1A, 0 14px 24px rgba(0,0,0,0.4)' }}>
        <span className="text-[21px] tracking-[0.16em]" style={{ ...H, fontWeight: 800, color: NAVY_D }}>{book}</span>
        <span className="w-[5px] h-[5px] rotate-45" style={{ background: NAVY_D }} />
        <span className="text-[22px]" dir="rtl" style={{ ...AH, color: NAVY_D }}>{bookAr}</span>
      </div>

      {/* what's inside, and who wrote it */}
      <div className="absolute left-[56px] right-[56px] top-[1036px] flex items-center justify-between">
        {FRONT_FEATURES.map(([Icon, en, ar]) => (
          <div key={en} className="flex items-center gap-2">
            <Icon size={20} color={GOLD_L} strokeWidth={1.8} />
            <span className="flex flex-col leading-[1.15]">
              <span className="text-[12.5px] text-white" style={BS}>{en}</span>
              <span className="text-[12px] text-white/70" dir="rtl" style={AS}>{ar}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-[1080px] text-center text-[12.5px] tracking-[0.1em] text-white/75" style={B}>
        by {author} · <span dir="rtl" className="tracking-normal" style={AS}>{authorAr}</span>
      </div>
    </div>
  )
}

/* ── The back cover ──────────────────────────────────────────────────── */

const CAN_DO: [string, string][] = [
  ['I can introduce myself.', 'أقدّم نفسي وأسلّم على الناس'],
  ['I can give my age and phone number.', 'أقول عمري ورقم هاتفي'],
  ['I can talk about my family and my home.', 'أتحدث عن عائلتي وبيتي'],
  ['I can tell the time and the days.', 'أقول الساعة وأيام الأسبوع'],
  ['I can order food and drinks.', 'أطلب الأكل والمشروبات'],
  ['I can ask the way in my town.', 'أسأل عن الطريق في مدينتي'],
]

const PACK: [LucideIcon, string, string][] = [
  [BookOpen, "Student's Book", 'كتاب الطالب'],
  [PenLine, 'Workbook', 'كتاب التمارين'],
  [Languages, 'Vocabulary Builder', 'كتاب المفردات'],
  [Layers, 'Play Cards', 'بطاقات اللعب'],
]

function Heading({ en, ar }: { en: string; ar: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[22px] leading-none" style={{ ...H, color: NAVY }}>{en}</span>
      <span className="text-[21px] leading-none" dir="rtl" style={{ ...AH, color: GOLD }}>{ar}</span>
    </div>
  )
}

const intl = (phone: string) => (phone.startsWith('0') ? `+212 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}` : phone)

export function LaKaartBack({ book = "Student's Book", phone = '0707902091', author = 'Hamza El Qasraoui', authorAr = 'حمزة القصراوي' }: {
  book?: string; phone?: string; author?: string; authorAr?: string
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" dir="ltr" style={{ background: IVORY }}>
      <Zellige color={NAVY} opacity={0.06} size={44} />
      <Grain opacity={0.1} />

      {/* the band: the title and what the book is */}
      <div className="absolute inset-x-0 top-0 h-[318px] overflow-hidden" style={{ background: `linear-gradient(160deg, #1E4590, ${NAVY} 45%, ${NAVY_D})` }}>
        <Zellige color={GOLD} opacity={0.1} size={56} stroke={1.1} />
        <Lines paths={BACK_BAND} color={GOLD_L} opacity={0.18} w={794} h={318} />
        <Lines paths={BACK_ROSETTE} color={GOLD_L} opacity={0.35} width={0.7} w={794} h={318} />
        <div className="absolute inset-x-0 bottom-0 h-[4px]" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_L}, ${GOLD})` }} />
        <div className="absolute left-[52px] right-[52px] top-[46px]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[54px] leading-[0.95]" style={{ ...H, fontWeight: 900, ...FOIL, filter: 'drop-shadow(0 3px 0 #050B1C)' }}>LA KAART</div>
              <div className="mt-1 text-[20px] tracking-[0.5em] text-white" style={{ ...H, fontWeight: 600 }}>ENGLISH</div>
            </div>
            <div className="text-right">
              <div className="text-[38px] leading-tight text-white" dir="rtl" style={AH}>لاكارط {ENGLISH_AR}</div>
              <div className="text-[14px] tracking-[0.1em]" style={{ ...BS, color: GOLD_L }}>{book} · Level 1 · A0 → A1</div>
            </div>
          </div>
          <p className="mt-5 text-[18px] leading-[1.7] text-white text-right" dir="rtl" style={AS}>
            أول وثيقة تحتاجها في الإنجليزية: تعرّف بنفسك، وتقول عمرك ورقم هاتفك، وتتحدث عن عائلتك وبيتك ويومك.
            تسعة عشر درسًا من حياتنا اليومية في المغرب، بشرح عربي واضح، وصوت لكل جملة تسمعه بمسح الرمز.
          </p>
          <p className="mt-2 text-[14.5px] leading-[1.6]" style={{ ...B, color: '#D9E1F2' }}>
            Your first document in English. 19 lessons from everyday Moroccan life, explained in Arabic, with audio for every line: scan and listen.
          </p>
        </div>
      </div>

      <div className="absolute left-[52px] right-[52px] top-[362px]">
        {/* the can-do stamps */}
        <Heading en="With this card, you can…" ar="بهاد الكارط، تقدر…" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CAN_DO.map(([en, ar]) => (
            <div key={en} className="flex items-center gap-3 rounded-[14px] bg-white px-3 py-2" style={{ border: `1px solid ${LINE}`, boxShadow: '0 2px 0 rgba(20,48,107,0.05)' }}>
              <span className="w-[28px] h-[28px] shrink-0 rounded-full flex items-center justify-center" style={{ background: NAVY, boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${GOLD}` }}>
                <Check size={16} color={GOLD_L} strokeWidth={3} />
              </span>
              <span className="flex flex-col leading-[1.3] min-w-0">
                <span className="text-[13px] whitespace-nowrap" style={{ ...BS, color: NAVY }}>{en}</span>
                <span className="text-[13px]" dir="rtl" style={{ ...AS, color: GREY }}>{ar}</span>
              </span>
            </div>
          ))}
        </div>

        {/* the series: three papers */}
        <div className="mt-7"><Heading en="One series, three papers" ar="سلسلة واحدة، ثلاث وثائق" /></div>
        <div className="relative mt-5 grid grid-cols-3 gap-8">
          <div className="absolute left-[16%] right-[16%] top-1/2 border-t-2 border-dashed" style={{ borderColor: GOLD }} />
          {SERIES.map((s, i) => {
            const on = i === 0
            return (
              <div key={s.en} className="relative">
              <div className="relative overflow-hidden rounded-[16px] px-4 pt-3 pb-2.5"
                style={on ? { background: `linear-gradient(140deg, #1E4590, ${NAVY_D})`, boxShadow: '0 10px 22px rgba(8,22,51,0.3)' } : { background: '#fff', border: `1.5px solid ${NAVY}` }}>
                {on && <Zellige color={GOLD} opacity={0.18} size={26} />}
                <div className="relative flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.14em]" style={{ ...H, color: on ? GOLD_L : GOLD }}>LEVEL {i + 1}</span>
                  <span className="text-[11px]" style={{ ...BS, color: on ? '#C9D3EA' : GREY }}>{s.level}</span>
                </div>
                <div className="relative mt-1 text-[25px] leading-none" style={{ ...H, fontWeight: 800, ...(on ? FOIL : { color: NAVY }) }}>{s.en}</div>
                <div className="relative text-[11.5px] tracking-[0.4em]" style={{ ...BS, color: on ? '#fff' : NAVY }}>ENGLISH</div>
                <div className="relative mt-1 text-[17px] leading-tight" dir="rtl" style={{ ...AH, color: on ? '#fff' : NAVY }}>{s.ar} {ENGLISH_AR}</div>
                <div className="relative mt-2 pt-1.5 flex items-center justify-between text-[12px]" style={{ borderTop: `1px solid ${on ? 'rgba(233,201,121,0.4)' : LINE}` }}>
                  <span style={{ ...BS, color: on ? GOLD_L : GOLD_INK }}>{s.goalEn}</span>
                  <span dir="rtl" style={{ ...AS, color: on ? '#fff' : GREY }}>{s.goalAr}</span>
                </div>
              </div>
              {on && <span className="absolute left-1/2 -translate-x-1/2 -top-[11px] whitespace-nowrap rounded-full px-3 py-[3px] text-[10px] leading-none tracking-[0.1em]" style={{ ...H, background: GOLD, color: NAVY_D, boxShadow: '0 0 0 2px #FBF7EE' }}>YOU ARE HERE · أنت هنا</span>}
              </div>
            )
          })}
        </div>

        {/* the pack */}
        <div className="mt-7"><Heading en="The La Kaart pack" ar="حزمة لاكارط" /></div>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {PACK.map(([Icon, en, ar]) => {
            const on = en.toLowerCase() === book.toLowerCase()
            return (
              <div key={en} className="flex flex-col items-center text-center rounded-[14px] px-2 py-2.5"
                style={on ? { background: NAVY, boxShadow: `0 0 0 2px ${GOLD}` } : { background: '#fff', border: `1px solid ${LINE}` }}>
                <Icon size={24} color={on ? GOLD_L : NAVY} strokeWidth={1.8} />
                <span className="mt-1 text-[13px] leading-tight" style={{ ...H, color: on ? '#fff' : NAVY }}>{en}</span>
                <span className="text-[12.5px] leading-tight" dir="rtl" style={{ ...AS, color: on ? GOLD_L : GREY }}>{ar}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* the foot: audio, publisher, barcode */}
      <div className="absolute left-[52px] right-[52px] bottom-[40px] flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-[10px] bg-white p-1.5" style={{ border: `1.5px solid ${NAVY}` }}><QrLink url={PLAY.library} size={74} color={NAVY} label={null} /></div>
          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-1.5 text-[14px]" style={{ ...H, color: NAVY }}><Headphones size={15} color={GOLD} strokeWidth={2.2} />Scan and listen</span>
            <span className="text-[13px]" dir="rtl" style={{ ...AS, color: GREY }}>امسح الرمز واستمع</span>
            <span className="mt-0.5 text-[11.5px]" style={{ ...B, color: GREY }}>inglizi.com/audio</span>
          </div>
        </div>
        <div className="flex flex-col items-center text-center leading-tight">
          <span className="text-[20px]" style={{ ...H, color: NAVY }}>Inglizi<span style={{ color: GOLD }}>.com</span></span>
          <span className="text-[12px]" style={{ ...B, color: GREY }}>{author} · <span dir="rtl" style={AS}>{authorAr}</span></span>
          <span className="text-[12px]" style={{ ...BS, color: NAVY }}>WhatsApp {intl(phone)}</span>
        </div>
        <div className="w-[150px] h-[86px] rounded-[8px] bg-white flex flex-col items-center justify-center" style={{ border: `1.5px dashed ${GREY}` }}>
          <span className="text-[11px] tracking-[0.2em]" style={{ ...BS, color: GREY }}>ISBN</span>
          <span className="text-[10.5px]" dir="rtl" style={{ ...AS, color: GREY }}>مكان الباركود</span>
        </div>
      </div>
      <GoldFrame opacity={0.8} />
    </div>
  )
}
