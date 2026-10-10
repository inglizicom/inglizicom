'use client'

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Award, BookOpen, Cake, Clock, Dices, Gift, GraduationCap, Handshake, Headphones, Hourglass, Languages, Layers, ListChecks, Megaphone,
  MessagesSquare, PenLine, RotateCcw, Search, Shuffle, SkipForward, Sparkles, SpellCheck, Star, Timer, Trophy, Users, Utensils, type LucideIcon,
} from 'lucide-react'
import { PLAY, QrLink } from '@/components/QrLink'
import { GAMES, GAME_ORDER, KEMELNI, photoOf, type BouchtaCard, type Game, type PlayCard } from '@/data/level1-cards'
import { cardCode } from '@/data/level1-audio'

/**
 * The Level 1 play cards, drawn at print size: a poker card (63 × 88 mm =
 * 238 × 333 px at 96 dpi). Two colours and no more: deep navy and Moroccan
 * gold on white, with a zellige texture merged into the white at low
 * opacity. The games are told apart by their name and a line icon, not by
 * colour; pictures stay grey until the photos arrive. Poppins sets the
 * English and IBM Plex Sans Arabic the Arabic: plain, adult faces.
 *
 * The player's side holds the task; the asker's side repeats it and gives
 * the answer in English and Arabic, so someone with no English can ask and
 * check.
 */

export const CARD_W = 238, CARD_H = 333

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap'
export const EN = "'Poppins', 'IBM Plex Sans Arabic', sans-serif"
export const AR = "'IBM Plex Sans Arabic', 'Tajawal', sans-serif"

/** The two colours, their tints, and the neutral greys. */
const NAVY = '#14306B', GOLD = '#B8862F'
const NAVY_S = '#EEF2F9', GOLD_S = '#FBF5E9', GOLD_INK = '#7A5A1C'
const INK = '#1F2937', GREY = '#5B6474', LINE = '#D6DCE8'

const H: CSSProperties = { fontFamily: EN, fontWeight: 700 }
const B: CSSProperties = { fontFamily: EN, fontWeight: 500 }
const BS: CSSProperties = { fontFamily: EN, fontWeight: 600 }
const A: CSSProperties = { fontFamily: AR, fontWeight: 500 }
const AS: CSSProperties = { fontFamily: AR, fontWeight: 600 }
const AH: CSSProperties = { fontFamily: AR, fontWeight: 700 }
/** Emoji pictures stay grey (one more colour would be too many) until the photos arrive. */
const GREYED: CSSProperties = { filter: 'grayscale(1) contrast(1.05)', opacity: 0.85 }

export const GAME_ICON: Record<Game, LucideIcon> = {
  call: Search, timer: Timer, tarjemni: Languages, ratebni: Shuffle, sahehni: SpellCheck, kemelni: MessagesSquare,
}
const ACTION_ICON: Record<string, LucideIcon> = { '⭐': Star, '🐐': Utensils, '⏭️': SkipForward, '🤝': Handshake, '📣': Megaphone, '🔁': RotateCcw, '🎁': Gift }

export function useCardFonts() {
  useEffect(() => {
    if (document.getElementById('level1-cards-fonts-v2')) return
    const link = document.createElement('link')
    link.id = 'level1-cards-fonts-v2'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
    document.head.appendChild(link)
  }, [])
}

/** A zellige lattice: an eight-pointed star (two squares) in each tile, linked corner to corner. */
export function Zellige({ color, opacity = 0.2, size = 28, stroke = 1.2 }: { color: string; opacity?: number; size?: number; stroke?: number }) {
  const id = `z${useId().replace(/:/g, '')}`
  const c = size / 2, r = size * 0.3
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth={stroke} opacity={opacity}>
            <rect x={c - r} y={c - r} width={2 * r} height={2 * r} />
            <rect x={c - r} y={c - r} width={2 * r} height={2 * r} transform={`rotate(45 ${c} ${c})`} />
            <circle cx={c} cy={c} r={r * 0.42} />
            <path d={`M0 0 L${c - r * 0.72} ${c - r * 0.72} M${size} 0 L${c + r * 0.72} ${c - r * 0.72} M0 ${size} L${c - r * 0.72} ${c + r * 0.72} M${size} ${size} L${c + r * 0.72} ${c + r * 0.72}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ── The card's shell: white, the texture, a navy frame, a header, a foot ── */

/** A card: white with the zellige merged in, framed in navy; `head` on top, `children` the body, `foot` at the bottom, `qr` (a card's code) in the bottom corner. */
function Shell({ head, children, foot, qr }: { head: ReactNode; children: ReactNode; foot?: ReactNode; qr?: string }) {
  return (
    <div className="relative overflow-hidden shrink-0 bg-white" dir="ltr" style={{ width: CARD_W, height: CARD_H }}>
      <Zellige color={NAVY} opacity={0.09} size={24} />
      <div className="absolute inset-[7px] rounded-[12px]" style={{ border: `1.5px solid ${NAVY}` }} />
      <div className="absolute left-[7px] right-[7px] top-[7px] h-[46px] px-2.5 flex items-center justify-between">{head}</div>
      <div className="absolute left-[18px] right-[18px] top-[52px] h-[2px] rounded-full" style={{ background: GOLD }} />
      <div className={`absolute left-[15px] right-[15px] top-[60px] ${qr ? 'bottom-[66px]' : 'bottom-[34px]'} flex flex-col items-center text-center`}>{children}</div>
      {foot && <div className="absolute left-[15px] right-[15px] bottom-[12px] h-[18px] flex items-center justify-between">{foot}</div>}
      {qr && <div className="absolute right-[13px] bottom-[11px]"><QR code={qr} /></div>}
    </div>
  )
}

/** The header: the game's icon, its name in English and Arabic, and the lesson (or a label) on the right. */
function Head({ Icon, name, ar, badge, back }: { Icon: LucideIcon; name: string; ar: string; badge: string; back?: boolean }) {
  return <>
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0" style={{ background: back ? GOLD : NAVY }}>
        <Icon size={15} color="#fff" strokeWidth={2.2} />
      </span>
      <div className="leading-none min-w-0">
        <div className="text-[14px] whitespace-nowrap" style={{ ...H, color: NAVY }}>{name}</div>
        <div className="text-[11px] mt-[3px]" dir="rtl" style={{ ...AS, color: GREY, textAlign: 'left' }}>{ar}</div>
      </div>
    </div>
    <span className="rounded-[6px] px-1.5 py-[2px] text-[11.5px] leading-none shrink-0" style={{ ...H, background: back ? GOLD : NAVY, color: '#fff' }}>{badge}</span>
  </>
}

const Points = ({ items }: { items: [string, string, string][] }) => (
  <span className="flex items-center gap-2 text-[10.5px]" style={{ ...H, color: GOLD }}>
    {items.map(([en, , stars]) => <span key={en}>{stars} <span style={{ ...BS, color: GREY }}>{en}</span></span>)}
  </span>
)
const Brand = () => <span className="text-[9.5px]" style={{ ...BS, color: GREY }}>inglizi.com</span>

const Prompt = ({ en, ar }: { en: string; ar: string }) => (
  <div className="mt-auto w-full rounded-[8px] py-1 leading-tight" style={{ background: NAVY_S }}>
    <div className="text-[11.5px]" style={{ ...H, color: NAVY }}>{en}</div>
    <div className="text-[11.5px]" dir="rtl" style={{ ...AS, color: GREY }}>{ar}</div>
  </div>
)

/** The picture of a WhatDoWeCall card: the photo once uploaded, the emoji (in grey) until then. */
function Picture({ card }: { card: PlayCard }) {
  const [failed, setFailed] = useState(false)
  const slug = photoOf(card)
  if (slug && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/level1-cards/photos/${slug}.webp`} alt="" onError={() => setFailed(true)} className="w-full h-full object-cover rounded-[9px]" />
    )
  }
  return <span className="text-[54px] leading-none" style={GREYED}>{card.icon}</span>
}

/* ── The player's side ─────────────────────────────────────────────── */

export function CardFront({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  return (
    <Shell head={<Head Icon={GAME_ICON[card.game]} name={g.name} ar={g.ar} badge={`L${pad(card.lesson)}`} />}
      foot={<>
        <Points items={g.points} />
        {card.seconds
          ? <span className="flex items-center gap-1 rounded-full px-1.5 text-[10.5px]" style={{ ...H, color: GOLD, border: `1.5px solid ${GOLD}` }}><Hourglass size={10} strokeWidth={2.6} />{card.seconds}s</span>
          : <Brand />}
      </>}>
      <FrontBody card={card} />
    </Shell>
  )
}

/** Kemelni's speech bubble: the line said, or the "?" the player fills. */
function Bubble({ text, ar, gap, right }: { text?: string; ar?: string; gap?: boolean; right?: boolean }) {
  return (
    <div className={`max-w-[90%] rounded-[12px] px-2.5 py-1.5 ${right ? 'self-end' : 'self-start'}`}
      style={gap ? { border: `1.8px dashed ${GOLD}`, background: '#fff' } : { background: NAVY_S }}>
      {gap
        ? <span className="block px-4 text-[24px] leading-none" style={{ ...H, color: GOLD }}>?</span>
        : <>
          <div className="text-[13px] leading-snug" style={{ ...BS, color: INK }}>{text}</div>
          {ar && <div className="text-[11px] leading-snug" dir="rtl" style={{ ...A, color: GREY }}>{ar}</div>}
        </>}
    </div>
  )
}

function FrontBody({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  switch (card.game) {
    case 'call': return <>
      <div className="w-full h-[98px] shrink-0 flex items-center justify-center rounded-[10px]" style={{ background: NAVY_S, border: `1px solid ${LINE}` }}><Picture card={card} /></div>
      <div className="mt-2 text-[11px]" style={{ ...BS, color: GREY }}>What do we call</div>
      <div className="text-[22px] leading-tight" dir="rtl" style={{ ...AH, color: NAVY }}>{card.ar}</div>
      <div className="text-[11px]" style={{ ...BS, color: GREY }}>in English?</div>
      <Prompt en="+ a sentence from the book" ar="ثم جملة من الكتاب" />
    </>
    case 'timer': return <>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-[34px] leading-none" style={GREYED}>{card.icon}</span>
        <span className="w-[56px] h-[56px] rounded-full flex flex-col items-center justify-center leading-none" style={{ background: NAVY, color: '#fff', boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${GOLD}` }}>
          <span className="text-[20px]" style={H}>{card.seconds}</span>
          <span className="text-[8.5px]" style={BS}>seconds</span>
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[16.5px] leading-tight" style={{ ...H, color: NAVY }}>{card.en}</div>
        <div className="mt-1 text-[13px] leading-snug" dir="rtl" style={{ ...AS, color: GREY }}>{card.enAr}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} />
    </>
    case 'tarjemni': return <>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[22px] leading-snug" dir="rtl" style={{ ...AH, color: NAVY }}>{card.ar}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} />
    </>
    case 'ratebni': return <>
      <div className="flex-1 flex flex-wrap content-center justify-center gap-x-1.5 gap-y-2">
        {card.words!.map((w, i) => (
          <span key={i} className="rounded-[6px] bg-white px-2 py-[2px] text-[13px] leading-tight" style={{ ...H, color: NAVY, border: `1.5px solid ${NAVY}`, boxShadow: `0 2px 0 ${GOLD}` }}>{w}</span>
        ))}
      </div>
      <div className="w-full mb-2 border-b-[1.5px] border-dashed" style={{ borderColor: GOLD }} />
      <Prompt en={g.doEn} ar={g.doAr} />
    </>
    case 'sahehni': return <>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[16px]" style={{ ...H, color: GOLD, border: `2px solid ${GOLD}` }}>✕</span>
        <div className="text-[16px] leading-snug" style={{ ...BS, color: INK }}>{card.en}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} />
    </>
    case 'kemelni': {
      const k = KEMELNI[card.mode!]
      return <>
        <span className="rounded-full px-2 py-[1px] text-[9.5px]" style={{ ...H, color: NAVY, border: `1.2px solid ${NAVY}` }}>{k.tagEn}</span>
        <div className="flex-1 w-full flex flex-col justify-center gap-2">
          {card.mode === 'question'
            ? <><Bubble gap /><Bubble text={card.en} ar={card.enAr} right /></>
            : <><Bubble text={card.en} ar={card.enAr} /><Bubble gap right /></>}
        </div>
        <Prompt en={k.en} ar={k.ar} />
      </>
    }
  }
}

/* ── The asker's side ──────────────────────────────────────────────── */

/** A note for the asker: the Arabic, then the English it quotes on a line of its own (mixed on one line, they wrap into each other). */
function Note({ text }: { text: string }) {
  const at = text.search(/[A-Za-z]/)
  const ar = at < 0 ? text : text.slice(0, at).trim(), en = at < 0 ? '' : text.slice(at).trim()
  return (
    <div className="w-full rounded-[8px] px-2 py-[3px] text-[11px] leading-snug" style={{ background: GOLD_S, color: GOLD_INK }}>
      <div dir="rtl" style={AS}>{ar}</div>
      {en && <div dir="ltr" style={BS}>{en}</div>}
    </div>
  )
}

/** What the asker reads out (the player's side, again). */
function Ask({ en, ar }: { en?: string; ar?: string }) {
  return (
    <div className="w-full rounded-[8px] px-2 py-1" style={{ background: NAVY_S }}>
      {en && <div className="text-[11.5px] leading-snug" style={{ ...BS, color: INK }}>{en}</div>}
      {ar && <div className="text-[11.5px] leading-snug" dir="rtl" style={{ ...A, color: GREY }}>{ar}</div>}
    </div>
  )
}

/** The label above the answer: a gold word and a hairline. */
const Label = ({ en, ar }: { en: string; ar: string }) => (
  <div className="mt-1.5 w-full flex items-center gap-1.5">
    <span className="text-[9.5px] tracking-[0.08em]" style={{ ...H, color: GOLD }}>{en}</span>
    <span className="flex-1 h-px" style={{ background: LINE }} />
    <span className="text-[10.5px]" dir="rtl" style={{ ...AS, color: GOLD }}>{ar}</span>
  </div>
)

/** The audio's QR code: the card's page on inglizi.com (its answer read slowly and at normal speed). */
export const QR = ({ code, size = 44 }: { code: string; size?: number }) => <QrLink url={PLAY.card(code)} size={size} color={NAVY} labelColor={GREY} />


function askOf(card: PlayCard): [string | undefined, string | undefined] {
  switch (card.game) {
    case 'call': return ['What do we call this in English?', card.ar]
    case 'timer': return [`${card.en} (${card.seconds}s)`, card.enAr]
    case 'tarjemni': return ['Say it in English:', card.ar]
    case 'ratebni': return [card.words!.join(' / '), `رتّب الكلمات في ${card.seconds} ثانية`]
    case 'sahehni': return [card.en, 'جد الخطأ وصحّحه']
    case 'kemelni': return [card.en, KEMELNI[card.mode!].ar]
  }
}

export function CardBack({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  const [en, ar] = askOf(card)
  return (
    <Shell head={<Head back Icon={GAME_ICON[card.game]} name={g.name} ar={`اسأل · ${g.ar}`} badge={`L${pad(card.lesson)}`} />}
      foot={<Points items={g.points} />} qr={cardCode(card.id)}>
      <Ask en={en} ar={ar} />
      {card.game === 'timer' ? <>
        <Label en="ACCEPT" ar="نقبل" />
        <div className="mt-1 text-[10.5px] leading-[1.45]" style={{ ...B, color: INK }}>{card.accept!.join(' · ')}</div>
        {card.extra && (
          <div className="mt-1 w-full rounded-[8px] px-1.5 py-[2px] text-[10.5px] leading-[1.4]" style={{ background: GOLD_S, color: GOLD_INK }}>
            <span dir="rtl" style={AS}>من كتاب المفردات: </span><span style={BS}>{card.extra.join(' · ')}</span>
          </div>
        )}
        <div className="flex-1" />
      </> : <>
        <Label en="ANSWER" ar="الجواب" />
        <div className="flex-1 flex flex-col justify-center gap-0.5">
          <div className="text-[15.5px] leading-snug" style={{ ...H, color: NAVY }}>{card.answer}</div>
          <div className="text-[13px] leading-snug" dir="rtl" style={{ ...AS, color: GREY }}>{card.answerAr}</div>
        </div>
        {card.fix && (
          <div className="mb-1 flex items-center justify-center gap-1.5 text-[12.5px]" style={BS}>
            <span className="line-through" style={{ color: GREY }}>{card.fix[0]}</span><span style={{ color: GOLD }}>→</span>
            <span style={{ ...H, color: NAVY, borderBottom: `2px solid ${GOLD}` }}>{card.fix[1]}</span>
          </div>
        )}
        {card.sentence && (
          <div className="mb-1 w-full rounded-[8px] px-2 py-[3px] leading-snug" style={{ background: GOLD_S }}>
            <div className="text-[9px] tracking-[0.06em]" style={{ ...H, color: GOLD }}>★+2 · A SENTENCE FROM THE BOOK</div>
            <div className="text-[11.5px]" style={{ ...BS, color: INK }}>{card.sentence}</div>
          </div>
        )}
      </>}
      {card.note && <Note text={card.note} />}
    </Shell>
  )
}

/* ── Bouchta's cards: the goat's silly questions and actions ───────── */

/** Bouchta himself: a goat in a gold ring (grey, like every picture). */
const Goat = ({ size = 70 }: { size?: number }) => (
  <span className="rounded-full bg-white flex items-center justify-center" style={{ width: size, height: size, border: `2px solid ${GOLD}`, boxShadow: `0 0 0 4px ${GOLD_S}` }}>
    <span style={{ fontSize: size * 0.6, lineHeight: 1, ...GREYED }}>🐐</span>
  </span>
)

export function BouchtaFront({ card }: { card: BouchtaCard }) {
  const silly = card.kind === 'silly'
  const Icon = ACTION_ICON[card.icon] ?? Sparkles
  return (
    <Shell head={<Head Icon={Sparkles} name="Bouchta" ar={silly ? 'بوشتى يسأل' : 'مفاجأة بوشتى'} badge={silly ? `L${pad(card.lesson!)}` : 'ACTION'} />}
      foot={<><span className="text-[10.5px]" style={{ ...H, color: GOLD }}>{silly ? `${card.points} Silly question` : 'Action card'}</span><Brand /></>}>
      {silly ? <>
        <div className="relative w-full rounded-[14px] px-2.5 py-2" style={{ background: NAVY_S }}>
          <div className="text-[14.5px] leading-snug" style={{ ...H, color: NAVY }}>{card.en}</div>
          <div className="mt-1 text-[11.5px] leading-snug" dir="rtl" style={{ ...AS, color: GREY }}>{card.ar}</div>
          <span className="absolute -bottom-[10px] left-[44%] w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `11px solid ${NAVY_S}` }} />
        </div>
        <div className="flex-1 flex items-center"><Goat /></div>
        <Prompt en="Answer in English!" ar="أجب بالإنجليزية!" />
      </> : <>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="w-[66px] h-[66px] rounded-full flex items-center justify-center" style={{ border: `2px solid ${GOLD}`, boxShadow: `0 0 0 4px ${GOLD_S}` }}>
            <Icon size={30} color={NAVY} strokeWidth={2} />
          </span>
          <div className="mt-2.5 text-[20px] leading-tight" style={{ ...H, color: NAVY }}>{card.en}</div>
          <div className="text-[16px] leading-tight" dir="rtl" style={{ ...AH, color: GOLD }}>{card.ar}</div>
        </div>
        <div className="w-full rounded-[8px] px-2 py-1 leading-snug" style={{ background: NAVY_S }}>
          <div className="text-[11.5px]" style={{ ...BS, color: INK }}>{card.answer}</div>
          <div className="text-[11.5px]" dir="rtl" style={{ ...A, color: GREY }}>{card.answerAr}</div>
        </div>
      </>}
    </Shell>
  )
}

export function BouchtaBack({ card }: { card: BouchtaCard }) {
  const silly = card.kind === 'silly'
  return (
    <Shell head={<Head back Icon={Sparkles} name="Bouchta" ar={silly ? 'اسأل · سؤال مضحك' : 'ماذا يحدث؟'} badge={silly ? `L${pad(card.lesson!)}` : 'ACTION'} />}
      foot={<span className="text-[10.5px]" style={{ ...H, color: GOLD }}>{silly ? `${card.points} Right answer` : "Bouchta's card"}</span>} qr={silly ? cardCode(card.id) : undefined}>
      <Ask en={card.en} ar={card.ar} />
      <Label en={silly ? 'ANSWER' : 'WHAT HAPPENS'} ar={silly ? 'الجواب' : 'ماذا يحدث'} />
      <div className="flex-1 flex flex-col justify-center gap-0.5">
        <div className="text-[15.5px] leading-snug" style={{ ...H, color: NAVY }}>{card.answer}</div>
        <div className="text-[13px] leading-snug" dir="rtl" style={{ ...AS, color: GREY }}>{card.answerAr}</div>
      </div>
      {card.note && <Note text={card.note} />}
    </Shell>
  )
}

/* ── Quick-rules cards, and the deck's plain back ──────────────────── */

/** The plain back of the cards that need no answer (the rules): navy, gold zellige, the game's name. */
export function DeckBack() {
  return (
    <div className="relative overflow-hidden shrink-0 flex flex-col items-center justify-center" dir="ltr" style={{ width: CARD_W, height: CARD_H, background: NAVY }}>
      <Zellige color={GOLD} opacity={0.35} size={28} />
      <div className="absolute inset-[9px] rounded-[12px]" style={{ border: `1.5px solid ${GOLD}` }} />
      <div className="relative flex gap-1">{'PLAY'.split('').map((c, i) => <span key={i} className="w-[28px] h-[30px] rounded-[5px] bg-white flex items-center justify-center text-[17px]" style={{ ...H, color: NAVY, boxShadow: `0 2px 0 ${GOLD}` }}>{c}</span>)}</div>
      <div className="relative mt-2.5 text-[27px] leading-none tracking-wide" style={{ ...H, fontWeight: 800, color: GOLD }}>ENGLISH</div>
      <div className="relative mt-1.5 text-[15px] text-white" dir="rtl" style={AH}>العب وتكلّم الإنجليزية</div>
      <div className="relative mt-3 text-[11px] text-white/80" style={BS}>inglizi.com · Level 1</div>
    </div>
  )
}

/** A rules card: numbered lines (Arabic) and an example or a picture at the foot. */
export function RuleCard({ Icon, en, ar, lines, foot }: { Icon: LucideIcon; en: string; ar: string; lines: string[]; foot?: ReactNode }) {
  return (
    <Shell head={<Head Icon={Icon} name={en} ar={ar} badge="RULES" />} foot={<><span /><Brand /></>}>
      <ol className="w-full space-y-1.5" dir="rtl">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-1.5 text-[11.5px] leading-snug text-right" style={{ ...AS, color: INK }}>
            <span className="shrink-0 w-[17px] h-[17px] rounded-full text-white text-[10px] flex items-center justify-center" style={{ ...H, background: NAVY }}>{i + 1}</span>
            <span>{l}</span>
          </li>
        ))}
      </ol>
      {foot && <div className="mt-auto w-full">{foot}</div>}
    </Shell>
  )
}

/** A game's example on its rules card: what the player sees → what they say. */
export function RuleExample({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  const shown = card.game === 'ratebni' ? card.words!.join(' / ') : card.ar ?? card.en ?? ''
  const ar = /[؀-ۿ]/.test(shown)
  return (
    <div className="rounded-[8px] px-2 py-1.5" style={{ background: NAVY_S }}>
      <div className="text-[9px] tracking-[0.08em]" style={{ ...H, color: GOLD }}>EXAMPLE · مثال</div>
      <div className="text-[12px] leading-snug" dir={ar ? 'rtl' : 'ltr'} style={{ ...(ar ? AS : BS), color: INK }}>{shown}</div>
      <div className="text-[12px] leading-snug" style={{ ...H, color: NAVY }}>→ {card.answer}</div>
      <div className="mt-0.5 flex justify-center"><Points items={g.points} /></div>
    </div>
  )
}

/** The round picture at the foot of a rules card: Bouchta, or an icon. */
export const RuleArt = ({ Icon }: { Icon?: LucideIcon }) => (
  <div className="flex justify-center">{Icon
    ? <span className="w-[64px] h-[64px] rounded-full flex items-center justify-center" style={{ border: `2px solid ${GOLD}`, boxShadow: `0 0 0 4px ${GOLD_S}` }}><Icon size={28} color={NAVY} /></span>
    : <Goat size={64} />}</div>
)

/* ── A print sheet of nine ─────────────────────────────────────────── */

/** Nine cards (3 × 3) on an A4 page, edge to edge, with crop marks outside the block. */
export function CardGrid({ children, note }: { children: ReactNode; note: string }) {
  const W = CARD_W * 3, HH = CARD_H * 3, X = (794 - W) / 2, Y = (1123 - HH) / 2
  const marks: ReactNode[] = []
  for (let i = 0; i <= 3; i++) {
    const x = X + i * CARD_W, y = Y + i * CARD_H
    marks.push(<span key={`t${i}`} className="absolute w-px h-[22px] bg-[#94A3B8]" style={{ left: x, top: Y - 28 }} />)
    marks.push(<span key={`b${i}`} className="absolute w-px h-[22px] bg-[#94A3B8]" style={{ left: x, top: Y + HH + 6 }} />)
    marks.push(<span key={`l${i}`} className="absolute h-px w-[22px] bg-[#94A3B8]" style={{ top: y, left: X - 28 }} />)
    marks.push(<span key={`r${i}`} className="absolute h-px w-[22px] bg-[#94A3B8]" style={{ top: y, left: X + W + 6 }} />)
  }
  return (
    <div className="absolute inset-0 bg-white">
      {marks}
      <div className="absolute grid grid-cols-3" dir="ltr" style={{ left: X, top: Y, width: W, height: HH }}>{children}</div>
      <div className="absolute inset-x-0 text-center text-[10.5px] text-[#94A3B8]" style={{ top: Y + HH + 32, ...AS }} dir="rtl">{note}</div>
    </div>
  )
}

export const EmptyCard = () => <div style={{ width: CARD_W, height: CARD_H }} />

/* ── The box lid ───────────────────────────────────────────────────── */

const Tile = ({ ch, pts, rot }: { ch: string; pts: number; rot: number }) => (
  <span className="relative inline-flex items-center justify-center w-[58px] h-[62px] rounded-[9px] bg-white text-[36px]"
    style={{ ...H, color: NAVY, transform: `rotate(${rot}deg)`, boxShadow: `0 5px 0 ${GOLD}, 0 10px 18px rgba(0,0,0,0.3)` }}>
    {ch}<span className="absolute bottom-[4px] right-[6px] text-[11px]" style={{ color: GOLD }}>{pts}</span>
  </span>
)

const Speech = ({ text, ar, style, tail = 'left' }: { text: string; ar?: boolean; style: CSSProperties; tail?: 'left' | 'right' }) => (
  <div className="absolute rounded-[16px] bg-white px-4 py-1.5 text-[19px] leading-tight whitespace-nowrap"
    style={{ ...(ar ? AH : H), color: NAVY, boxShadow: '0 5px 0 rgba(0,0,0,0.18)', ...style }} dir={ar ? 'rtl' : 'ltr'}>
    {text}
    <span className="absolute -bottom-[10px] w-0 h-0" style={{ [tail]: 22, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '12px solid #fff' }} />
  </div>
)

const STAR = 'polygon(50% 0%, 61% 11%, 75% 6%, 79% 21%, 94% 25%, 89% 39%, 100% 50%, 89% 61%, 94% 75%, 79% 79%, 75% 94%, 61% 89%, 50% 100%, 39% 89%, 25% 94%, 21% 79%, 6% 75%, 11% 61%, 0% 50%, 11% 39%, 6% 25%, 21% 21%, 25% 6%, 39% 11%)'

/** The lid: navy with the gold zellige, the title in letter tiles, a Moorish arch holding a fan of real cards, a game box's facts. */
export function BoxLid({ fan, cards }: { fan: PlayCard[]; cards: number }) {
  const rot = [-22, -11, 0, 11, 22]
  const stats: [LucideIcon, string, string][] = [
    [Users, '2–6 players', 'لاعبين'], [Clock, '15 min', 'دقيقة'], [Cake, 'Age 8+', 'من 8 سنوات'], [Layers, `${cards} cards`, 'بطاقة'], [Dices, '6 games', 'ألعاب'], [Headphones, 'Audio', 'نطق صوتي'],
  ]
  return (
    <div className="absolute inset-0 overflow-hidden" dir="ltr" style={{ background: `radial-gradient(circle at 50% 55%, #1F448F 0%, ${NAVY} 50%, #0A1A40 100%)` }}>
      <Zellige color={GOLD} opacity={0.22} size={48} stroke={1.4} />
      <div className="absolute left-8 top-8 rounded-full bg-white px-4 py-1.5 text-[19px]" style={{ ...H, color: NAVY }}>Inglizi<span style={{ color: GOLD }}>.com</span></div>
      <div className="absolute right-6 top-3 w-[116px] h-[116px] flex flex-col items-center justify-center text-center rotate-[8deg]" style={{ background: GOLD, clipPath: STAR }}>
        <span className="text-[20px] leading-none text-white" style={H}>LEVEL 1</span>
        <span className="text-[15px] leading-tight" style={{ ...H, color: NAVY }}>A0 → A1</span>
        <span className="text-[11.5px] leading-none text-white" style={AS}>المستوى الأول</span>
      </div>

      <div className="absolute inset-x-0 top-[140px] flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          {[['P', 3], ['L', 1], ['A', 1], ['Y', 4]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[-5, 3, -2, 5][i]} />)}
          <span className="text-[40px] mx-1" style={{ ...H, color: GOLD }}>&</span>
          {[['S', 1], ['P', 3], ['E', 1], ['A', 1], ['K', 5]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[4, -3, 2, -4, 3][i]} />)}
        </div>
        <div className="mt-5 text-[100px] leading-[0.95] tracking-[0.02em]" style={{ ...H, fontWeight: 800, color: GOLD, textShadow: '0 6px 0 #081430, 0 14px 26px rgba(0,0,0,0.45)' }}>ENGLISH</div>
        <div className="mt-3 text-[40px] leading-tight text-white" dir="rtl" style={AH}>العب وتكلّم الإنجليزية</div>
      </div>

      <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: 425, width: 540, height: 462 }} viewBox="0 0 540 462" aria-hidden>
        <path d="M30 462 L30 250 C30 120 120 30 270 30 C420 30 510 120 510 250 L510 462" fill="rgba(255,255,255,0.06)" stroke={GOLD} strokeWidth="6" />
        <path d="M52 462 L52 252 C52 136 136 52 270 52 C404 52 488 136 488 252 L488 462" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <div className="absolute left-1/2" style={{ top: 500, width: 0, height: 0 }}>
        {fan.slice(0, 5).map((c, i) => (
          <div key={c.id} className="absolute" style={{
            left: -CARD_W / 2, top: 0, transform: `rotate(${rot[i]}deg) scale(0.8)`, transformOrigin: '50% 135%',
            boxShadow: '0 12px 28px rgba(0,0,0,0.45)', borderRadius: 12, overflow: 'hidden', zIndex: 5 - Math.abs(i - 2),
          }}>
            <CardFront card={c} />
          </div>
        ))}
      </div>

      <Speech text="Hello!" style={{ left: 34, top: 505, transform: 'rotate(-8deg)' }} />
      <Speech text="مرحبًا!" ar tail="right" style={{ left: 28, top: 760, transform: 'rotate(6deg)' }} />
      <Speech text="Let's play!" tail="right" style={{ right: 26, top: 505, transform: 'rotate(7deg)' }} />
      <Speech text="How are you?" style={{ right: 14, top: 770, transform: 'rotate(-5deg)' }} />

      <div className="absolute left-1/2 -translate-x-1/2 top-[905px] flex items-center gap-3 rounded-[10px] px-6 py-2 whitespace-nowrap" style={{ background: GOLD, boxShadow: '0 5px 0 #7A5A1C' }}>
        <span className="text-[20px] text-white" style={H}>FAMILY CARD GAME</span>
        <span className="text-[20px]" dir="rtl" style={{ ...AH, color: NAVY }}>لعبة بطاقات عائلية</span>
      </div>

      <div className="absolute left-6 right-6 bottom-[46px] grid grid-cols-6 rounded-[16px] bg-white py-2.5" style={{ boxShadow: '0 6px 0 rgba(0,0,0,0.25)' }}>
        {stats.map(([Icon, en, ar], i) => (
          <div key={en} className="flex flex-col items-center leading-tight" style={{ borderLeft: i ? `1.2px dashed ${LINE}` : undefined }}>
            <Icon size={22} color={GOLD} strokeWidth={2} />
            <span className="mt-1 text-[13.5px]" style={{ ...H, color: NAVY }}>{en}</span>
            <span className="text-[11.5px]" dir="rtl" style={{ ...AS, color: GREY }}>{ar}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[14px] text-center text-[12px] text-white/80" style={BS}>
        Goes with the Level 1 course book · <span dir="rtl" style={AS}>يرافق كتاب المستوى الأول ودفتر التمارين وكتاب المفردات</span>
      </div>
    </div>
  )
}

/* ── The box's back: how to play ───────────────────────────────────── */

const BOX: [LucideIcon, string, string][] = [
  [BookOpen, 'Course book', 'كتاب الدروس'], [PenLine, 'Workbook', 'دفتر التمارين'], [Languages, 'Vocabulary book', 'كتاب المفردات'],
  [Layers, 'Play cards', 'بطاقات اللعب'], [Sparkles, "Bouchta's cards", 'بطاقات بوشتى'], [Hourglass, 'Sand timer', 'ساعة رملية'],
  [ListChecks, 'Score sheets', 'أوراق النقاط'], [Award, 'Passport', 'جواز الدروس'], [GraduationCap, 'Certificate', 'الشهادة'], [Headphones, 'Audio', 'دروس صوتية'],
]

/** A card at a smaller size, for the box's back. */
const Small = ({ children, scale = 0.9 }: { children: ReactNode; scale?: number }) => (
  <div className="rounded-[12px] overflow-hidden" style={{ width: CARD_W * scale, height: CARD_H * scale, boxShadow: '0 8px 20px rgba(20,48,107,0.22)' }}>
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
  </div>
)

export function BoxBack({ sample }: { sample: PlayCard }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white" dir="ltr">
      <Zellige color={NAVY} opacity={0.07} size={40} />
      <div className="absolute inset-[22px] rounded-[20px] px-7 pt-5 pb-5 flex flex-col" style={{ border: `2px solid ${NAVY}` }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[34px] leading-none" style={{ ...H, color: NAVY }}>How to play</span>
          <span className="text-[30px] leading-none" dir="rtl" style={{ ...AH, color: GOLD }}>طريقة اللعب</span>
        </div>
        <div className="mt-2 h-[2px] w-[80px] rounded-full" style={{ background: GOLD }} />

        {/* one card, two sides */}
        <div className="mt-3 rounded-[16px] px-5 py-3 flex items-center justify-center gap-5" style={{ background: NAVY_S }}>
          <div className="flex flex-col items-center gap-1">
            <Small><CardFront card={sample} /></Small>
            <span className="text-[13px]" style={{ ...H, color: NAVY }}>The player sees</span>
            <span className="text-[12px] -mt-1" dir="rtl" style={{ ...AS, color: GREY }}>اللاعب يرى هذا الوجه</span>
          </div>
          <div className="flex flex-col items-center text-center w-[150px]" dir="rtl">
            <span className="text-[34px] leading-none" style={{ ...H, color: GOLD }}>⇄</span>
            <span className="mt-1.5 text-[13px] leading-snug" style={{ ...AS, color: NAVY }}>ارفع البطاقة أمام اللاعب واقرأ أنت الخلف. لا تعرف الإنجليزية؟ الجواب مكتوب بالعربية أيضًا.</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Small><CardBack card={sample} /></Small>
            <span className="text-[13px]" style={{ ...H, color: NAVY }}>The asker reads</span>
            <span className="text-[12px] -mt-1" dir="rtl" style={{ ...AS, color: GREY }}>السائل يقرأ هذا الوجه</span>
          </div>
        </div>

        {/* the six games */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-[17px]" style={{ ...H, color: NAVY }}>6 games, 9 cards for every lesson</span>
          <span className="text-[16px]" dir="rtl" style={{ ...AH, color: GOLD }}>ست ألعاب، تسع بطاقات لكل درس</span>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {GAME_ORDER.map(k => {
            const g = GAMES[k]
            const Icon = GAME_ICON[k]
            return (
              <div key={k} className="rounded-[12px] bg-white overflow-hidden" style={{ border: `1.5px solid ${NAVY}` }}>
                <div className="flex items-center justify-between px-2.5 py-1 text-white" style={{ background: NAVY }}>
                  <span className="flex items-center gap-1.5 text-[13px]" style={H}><Icon size={13} color={GOLD} strokeWidth={2.4} />{g.name}</span>
                  <span className="text-[12px]" style={AS}>{g.ar}</span>
                </div>
                <div className="px-2.5 py-1.5" dir="rtl">
                  <div className="text-[11.5px] leading-snug" style={{ ...AS, color: INK }}>{g.rule}</div>
                  <div className="mt-1 flex flex-wrap gap-x-2 text-[11px]" style={{ ...AS, color: GOLD_INK }}>
                    {g.points.map(([en, ar, stars]) => <span key={en}><bdi dir="ltr" style={{ ...H, color: GOLD }}>{stars}</bdi> {ar}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 rounded-[12px] px-4 py-2 text-[12.5px] leading-snug" dir="rtl" style={{ ...AS, background: GOLD_S, color: GOLD_INK }}>
          <b style={AH}>بوشتى الماعز</b> مختبئ بين البطاقات: أسئلة مضحكة بثلاث نجوم، ومفاجآت تغيّر اللعبة (نجوم مضاعفة، سرقة، تجاوز…). <b style={AH}>سباق العائلة:</b> أول من يجمع 20 نجمة يفوز. <b style={AH}>مع طفلك:</b> درس واحد في اليوم، ولوّنا جواز الدروس معًا.
        </div>

        {/* the box */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {BOX.map(([Icon, en, ar]) => (
            <div key={en} className="flex flex-col items-center text-center rounded-[10px] bg-white px-1 py-1.5" style={{ border: `1px solid ${LINE}` }}>
              <Icon size={20} color={NAVY} strokeWidth={1.9} />
              <span className="mt-1 text-[11px] leading-tight" style={{ ...H, color: NAVY }}>{en}</span>
              <span className="text-[10.5px] leading-tight" dir="rtl" style={{ ...AS, color: GREY }}>{ar}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-[12px] px-4 py-2" style={{ background: NAVY }}>
          <span className="text-[13px] text-white" dir="rtl" style={AS}>رقم الدرس على كل بطاقة: العب فقط بالدروس التي درستها.</span>
          <span className="text-[14px]" style={{ ...H, color: GOLD }}>inglizi.com</span>
        </div>
      </div>
    </div>
  )
}

/* ── The sheets in the box: scores, the lesson passport, the certificate ── */

/** The band on top of a sheet: navy with the gold zellige, the title in English and Arabic. */
function SheetBand({ en, ar, sub }: { en: string; ar: string; sub: string }) {
  return (
    <div className="relative overflow-hidden px-7 pt-5 pb-4" dir="ltr" style={{ background: NAVY }}>
      <Zellige color={GOLD} opacity={0.28} size={34} />
      <div className="relative flex items-center justify-between">
        <div className="leading-none">
          <div className="text-[30px] text-white" style={H}>{en}</div>
          <div className="mt-2 text-[12.5px] text-white/75" dir="rtl" style={{ ...AS, textAlign: 'left' }}>{sub}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[28px] leading-none" dir="rtl" style={{ ...AH, color: GOLD }}>{ar}</span>
          <span className="rounded-full bg-white px-3 py-[2px] text-[12px]" style={{ ...H, color: NAVY }}>Inglizi<span style={{ color: GOLD }}>.com</span> · Level 1</span>
        </div>
      </div>
    </div>
  )
}

/** The six games' points, in a strip (score sheet). */
function PointsStrip() {
  return (
    <div className="grid grid-cols-6 gap-1.5" dir="ltr">
      {GAME_ORDER.map(k => {
        const g = GAMES[k]
        const Icon = GAME_ICON[k]
        return (
          <div key={k} className="rounded-[9px] overflow-hidden text-center" style={{ border: `1.2px solid ${NAVY}` }}>
            <div className="flex items-center justify-center gap-1 py-[2px] text-[10.5px] text-white" style={{ ...H, background: NAVY }}><Icon size={10} color={GOLD} strokeWidth={2.6} />{g.name}</div>
            <div className="py-[3px] text-[10.5px] leading-tight" dir="rtl" style={{ ...AS, color: INK }}>
              {g.points.map(([en, ar, stars]) => <div key={en}><bdi dir="ltr" style={{ ...H, color: GOLD }}>{stars}</bdi> {ar}</div>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Blank = ({ w }: { w: number }) => <span className="inline-block border-b-[1.2px] border-dashed translate-y-[2px]" style={{ width: w, borderColor: GREY }} />
const Tick = () => <span className="w-[12px] h-[12px] rounded-[3px]" style={{ border: `1.6px solid ${NAVY}` }} />

/** The score sheet: six players, fifteen rounds, the totals and the winner (print a pad of them). */
export function ScoreSheet() {
  const players = 6, rounds = 15
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <SheetBand en="Score sheet" ar="ورقة النقاط" sub="سباق العائلة: أول من يجمع 20 نجمة يفوز، أو الأكثر نجومًا بعد 15 جولة." />
      <div className="px-7 pt-3 pb-4 flex-1 flex flex-col" dir="ltr">
        <div className="flex items-end justify-between text-[12.5px]" style={{ ...BS, color: INK }}>
          <span>Date <Blank w={110} /></span>
          <span>Lessons L<Blank w={34} /> → L<Blank w={34} /></span>
          <span className="flex items-center gap-3">{['Family race', 'Parent & child', 'Teams'].map(t => <span key={t} className="flex items-center gap-1"><Tick />{t}</span>)}</span>
        </div>

        <table className="mt-3 w-full border-separate border-spacing-0 rounded-[12px] overflow-hidden" style={{ border: `1.6px solid ${NAVY}` }}>
          <thead>
            <tr>
              <th className="w-[70px] py-1.5 text-white text-[12px] leading-tight" style={{ ...H, background: NAVY }}>Round<div className="text-[10.5px]" style={AS}>الجولة</div></th>
              {Array.from({ length: players }, (_, p) => (
                <th key={p} className="px-1.5 pt-1 pb-1.5 align-bottom" style={{ background: NAVY_S, borderLeft: `1.2px solid ${NAVY}` }}>
                  <div className="text-[10.5px] text-left" style={{ ...H, color: NAVY }}>Player {p + 1} <span style={{ ...AS, color: GREY }}>· اللاعب</span></div>
                  <div className="mt-2.5 border-b-[1.2px] border-dashed" style={{ borderColor: GREY }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rounds }, (_, r) => (
              <tr key={r} style={{ background: r % 2 ? '#F8FAFC' : '#fff' }}>
                <td className="h-[45px] text-center text-[15px]" style={{ ...H, color: NAVY, borderTop: `1px solid ${LINE}` }}>{r + 1}</td>
                {Array.from({ length: players }, (_, p) => <td key={p} style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1.2px solid ${NAVY}` }} />)}
              </tr>
            ))}
            <tr style={{ background: GOLD_S }}>
              <td className="h-[42px] text-center text-[12.5px] leading-tight" style={{ ...H, color: NAVY, borderTop: `1.6px solid ${NAVY}` }}>Total ★<div className="text-[10.5px]" style={AS}>المجموع</div></td>
              {Array.from({ length: players }, (_, p) => <td key={p} style={{ borderTop: `1.6px solid ${NAVY}`, borderLeft: `1.2px solid ${NAVY}` }} />)}
            </tr>
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between rounded-[12px] px-4 py-2" style={{ background: NAVY }}>
          <span className="flex items-center gap-2 text-[19px] text-white" style={H}><Trophy size={20} color={GOLD} /> Winner <Blank w={240} /></span>
          <span className="text-[18px]" dir="rtl" style={{ ...AH, color: GOLD }}>الفائز</span>
        </div>
        <div className="mt-auto pt-3"><PointsStrip /></div>
      </div>
    </div>
  )
}

/**
 * The lesson passport: every lesson's nine cards as nine circles to colour
 * when answered right (the two WhatDoWeCall ones in gold), the stars, and a
 * stamp for the teacher or assistant. A lesson is passed with 7 of 9;
 * nineteen stamps earn the certificate.
 */
export function Passport({ lessons }: { lessons: { n: number; titleEn: string; titleAr: string; games: string[] }[] }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <SheetBand en="My lesson passport" ar="جواز الدروس" sub="لوّن دائرة لكل بطاقة أجبت عنها صحيحًا. سبع دوائر من تسع؟ يختم أستاذك الدرس." />
      <div className="px-6 pt-3 pb-4 flex-1 flex flex-col" dir="ltr">
        <div className="flex items-end justify-between text-[12.5px]" style={{ ...BS, color: INK }}>
          <span>Name <Blank w={230} /></span>
          <span>Teacher <Blank w={190} /></span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 flex-1">
          {lessons.map(l => (
            <div key={l.n} className="relative overflow-hidden rounded-[12px] px-2 pt-1.5 pb-1.5 flex flex-col" style={{ border: `1.2px solid ${LINE}` }}>
              <Zellige color={NAVY} opacity={0.05} size={22} />
              <div className="relative flex items-center gap-1.5">
                <span className="rounded-[6px] px-1.5 text-[12.5px] text-white" style={{ ...H, background: NAVY }}>L{pad(l.n)}</span>
                <span className="ml-auto w-[30px] h-[30px] rounded-full border-[1.6px] border-dashed flex items-center justify-center text-[7.5px] leading-none" style={{ ...H, borderColor: GOLD, color: GOLD }}>STAMP</span>
              </div>
              <div className="relative mt-0.5 text-[11.5px] leading-tight" style={{ ...H, color: NAVY }}>{l.titleEn}</div>
              <div className="relative text-[11px] leading-tight" dir="rtl" style={{ ...AS, color: GREY, textAlign: 'left' }}>{l.titleAr}</div>
              <div className="relative mt-auto pt-1 flex justify-between">
                {l.games.map((_, i) => <span key={i} className="w-[14px] h-[14px] rounded-full" style={{ border: `1.6px solid ${i < 2 ? GOLD : NAVY}` }} />)}
              </div>
              <div className="relative mt-1 flex items-center justify-between text-[10.5px]" style={{ ...BS, color: GREY }}>
                <span>★ <Blank w={24} /> / 9</span>
                <span>Date <Blank w={42} /></span>
              </div>
            </div>
          ))}
          <div className="rounded-[12px] px-2 py-1.5 flex flex-col items-center justify-center text-center" style={{ background: NAVY }}>
            <Trophy size={30} color={GOLD} />
            <span className="mt-1 text-[12.5px] leading-tight text-white" style={H}>19 stamps = your certificate!</span>
            <span className="text-[11.5px] leading-tight" dir="rtl" style={{ ...AS, color: GOLD }}>19 ختمًا = شهادتك!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Certificate() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: NAVY }}>
      <Zellige color={GOLD} opacity={0.3} size={44} stroke={1.4} />
      <div className="absolute inset-[26px] rounded-[22px] overflow-hidden flex flex-col items-center px-12 pt-10 pb-8 text-center bg-white" dir="ltr"
        style={{ boxShadow: `inset 0 0 0 5px ${GOLD}, inset 0 0 0 9px #fff, inset 0 0 0 10.5px ${GOLD}` }}>
        <Zellige color={NAVY} opacity={0.05} size={34} />
        <div className="relative flex gap-1.5">{'PLAY'.split('').map((c, i) => <span key={i} className="w-[40px] h-[44px] rounded-[7px] bg-white flex items-center justify-center text-[24px]" style={{ ...H, color: NAVY, border: `1.5px solid ${NAVY}`, boxShadow: `0 3px 0 ${GOLD}`, transform: `rotate(${[-4, 3, -2, 4][i]}deg)` }}>{c}</span>)}</div>
        <div className="relative mt-2 text-[16px] tracking-[0.12em]" style={{ ...H, color: GOLD }}>& SPEAK ENGLISH · LEVEL 1</div>
        <div className="relative mt-7 text-[58px] leading-none" style={{ ...H, fontWeight: 800, color: NAVY }}>Certificate</div>
        <div className="relative text-[24px] leading-tight tracking-[0.06em]" style={{ ...BS, color: NAVY }}>of achievement</div>
        <div className="relative mt-1 text-[32px]" dir="rtl" style={{ ...AH, color: GOLD }}>شهادة إنجاز</div>

        <div className="relative mt-8 text-[15px]" style={{ ...B, color: GREY }}>This certificate is proudly given to</div>
        <div className="relative text-[14px]" dir="rtl" style={{ ...A, color: GREY }}>تُمنح هذه الشهادة بكل فخر إلى</div>
        <div className="relative mt-7 w-[78%] border-b-[2px] border-dashed" style={{ borderColor: NAVY }} />

        <div className="relative mt-6 text-[15px] leading-relaxed" style={{ ...B, color: INK }}>
          for completing the 19 lessons of Level 1 (A0 → A1),<br />collecting all 19 stamps and <span className="inline-block w-[60px] border-b-[1.6px] border-dashed translate-y-[2px]" style={{ borderColor: NAVY }} /> stars.
        </div>
        <div className="relative mt-1 text-[14px] leading-relaxed" dir="rtl" style={{ ...A, color: GREY }}>لإتمامه الدروس التسعة عشر من المستوى الأول، وجمع كل الأختام.</div>

        <div className="relative mt-7 w-[110px] h-[110px] flex flex-col items-center justify-center rotate-[-6deg]" style={{ background: GOLD, clipPath: STAR }}>
          <Trophy size={32} color="#fff" />
          <span className="text-[13px] text-white" style={H}>A0 → A1</span>
        </div>

        <div className="relative mt-6 text-[12.5px] tracking-[0.06em]" style={{ ...H, color: GOLD }}>19 LESSONS · 19 STAMPS <span style={{ ...AS, letterSpacing: 0 }}>· تسعة عشر ختمًا</span></div>
        <div className="relative mt-2 grid grid-cols-10 gap-2">
          {Array.from({ length: 19 }, (_, i) => (
            <span key={i} className="w-[42px] h-[42px] rounded-full border-[1.6px] border-dashed flex items-center justify-center text-[11px]" style={{ ...H, borderColor: GOLD, color: NAVY }}>L{pad(i + 1)}</span>
          ))}
          <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background: NAVY }}><Trophy size={18} color={GOLD} /></span>
        </div>

        <div className="relative mt-auto w-full grid grid-cols-2 gap-12 text-[13px]" style={{ ...BS, color: GREY }}>
          <div><div className="border-b-[1.2px] border-dashed h-[30px]" style={{ borderColor: NAVY }} />Date · <span style={AS}>التاريخ</span></div>
          <div><div className="border-b-[1.2px] border-dashed h-[30px]" style={{ borderColor: NAVY }} />Teacher · <span style={AS}>توقيع الأستاذ</span></div>
        </div>
        <div className="relative mt-5 rounded-full px-4 py-1 text-[13px] text-white" style={{ ...H, background: NAVY }}>Inglizi<span style={{ color: GOLD }}>.com</span></div>
      </div>
    </div>
  )
}
