'use client'

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { GAMES, GAME_ORDER, KEMELNI, lessonOf, photoOf, type PlayCard } from '@/data/level1-cards'

/**
 * The Level 1 play cards, drawn at print size: a poker card (63 × 88 mm =
 * 238 × 333 px at 96 dpi). A card wears its game: the game's colour, name
 * and points on top and at the foot, the lesson's number in its corner. The
 * player's side holds the task; the asker's side (cream, in a zellige frame)
 * repeats it and gives the answer in English and Arabic, so someone with no
 * English can ask and check. Faces: Lilita One (game names, the cover's
 * tiles), Mali (English, as in the Level 1 book), Baloo Bhaijaan 2 and
 * Lalezar (Arabic).
 */

export const CARD_W = 238, CARD_H = 333

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Mali:wght@500;600;700&family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Lalezar&display=swap'
export const DISPLAY = "'Lilita One', 'Baloo Bhaijaan 2', sans-serif"
export const EN = "'Mali', 'Baloo Bhaijaan 2', sans-serif"
export const AR = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif"
export const AR_DISPLAY = "'Lalezar', 'Baloo Bhaijaan 2', sans-serif"
const NAVY = '#0D1F78'
const INK = '#1E293B', GREY = '#475569'

export function useCardFonts() {
  useEffect(() => {
    if (document.getElementById('level1-cards-fonts')) return
    const link = document.createElement('link')
    link.id = 'level1-cards-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = FONTS_HREF
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

/** The picture of a WhatDoWeCall card: the photo once uploaded, the emoji until then. */
function Picture({ card }: { card: PlayCard }) {
  const [failed, setFailed] = useState(false)
  const slug = photoOf(card)
  if (slug && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/level1-cards/photos/${slug}.webp`} alt="" onError={() => setFailed(true)} className="w-full h-full object-cover rounded-[10px]" />
    )
  }
  return <span className="text-[58px] leading-none">{card.icon}</span>
}

/** The game's band on top of both sides: its name in English and Arabic, the lesson in the corner. */
function Band({ card, side }: { card: PlayCard; side: 'front' | 'back' }) {
  const g = GAMES[card.game]
  const l = lessonOf(card.lesson)!
  return (
    <div className="absolute inset-x-0 top-0 h-[48px] flex items-center justify-between px-2.5 text-white" dir="ltr">
      <div className="leading-none">
        <div className="text-[17px]" style={{ fontFamily: DISPLAY, textShadow: '0 2px 0 rgba(0,0,0,0.18)' }}>{g.icon} {g.name}</div>
        <div className="text-[12px] font-bold mt-[3px]" dir="rtl" style={{ fontFamily: AR, textAlign: 'left' }}>{side === 'back' ? `📣 اسأل · ${g.ar}` : g.ar}</div>
      </div>
      <div className="flex flex-col items-center rounded-[10px] bg-white px-1.5 py-[2px] leading-none" style={{ color: g.m }}>
        <span className="text-[14px]" style={{ fontFamily: DISPLAY }}>L{pad(l.n)}</span>
        <span className="text-[12px]">{l.icon}</span>
      </div>
    </div>
  )
}

/** The game's points (and the time), at the foot of the player's side. */
function Foot({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  return (
    <div className="absolute inset-x-0 bottom-0 h-[30px] flex items-center justify-between px-2.5 text-white" dir="ltr">
      <span className="flex items-center gap-2 text-[11.5px]" style={{ fontFamily: DISPLAY }}>
        {g.points.map(([en, , stars]) => <span key={en}><span style={{ color: '#FFE07A' }}>{stars}</span> {en}</span>)}
      </span>
      {card.seconds
        ? <span className="rounded-full bg-white px-2 text-[12px]" style={{ fontFamily: DISPLAY, color: g.m }}>⏳ {card.seconds}s</span>
        : <span className="text-[10.5px]" style={{ fontFamily: DISPLAY }}>inglizi.com</span>}
    </div>
  )
}

const Prompt = ({ en, ar, m }: { en: string; ar: string; m: string }) => (
  <div className="mt-auto w-full rounded-lg py-1 leading-tight text-center" style={{ background: `color-mix(in srgb, ${m} 10%, white)` }}>
    <div className="text-[13px]" style={{ fontFamily: DISPLAY, color: m }}>{en}</div>
    <div className="text-[12.5px] font-bold" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{ar}</div>
  </div>
)

/** A word tile (Ratebni, and the lid's title). */
const WordTile = ({ w }: { w: string }) => (
  <span className="rounded-[7px] px-2 py-[2px] text-[15px] leading-tight" style={{ fontFamily: DISPLAY, background: '#FFF4D6', color: NAVY, boxShadow: '0 3px 0 #D9B45A' }}>{w}</span>
)

/** A speech bubble of Kemelni: the line said, or the "?" the player fills. */
function Bubble2({ text, ar, m, gap, right }: { text?: string; ar?: string; m: string; gap?: boolean; right?: boolean }) {
  return (
    <div className={`relative max-w-[88%] rounded-[14px] px-2.5 py-1.5 ${right ? 'self-end' : 'self-start'}`}
      style={gap ? { border: `2px dashed ${m}`, background: '#fff' } : { background: `color-mix(in srgb, ${m} 12%, white)` }}>
      {gap
        ? <span className="block text-center text-[28px] leading-none px-4" style={{ fontFamily: DISPLAY, color: m }}>?</span>
        : <>
          <div className="text-[14.5px] font-bold leading-snug" style={{ fontFamily: EN, color: INK }}>{text}</div>
          {ar && <div className="text-[12px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{ar}</div>}
        </>}
    </div>
  )
}

/* ── The player's side ─────────────────────────────────────────────── */

export function CardFront({ card, style }: { card: PlayCard; style?: CSSProperties }) {
  const g = GAMES[card.game]
  return (
    <div className="relative overflow-hidden shrink-0" dir="ltr" style={{ width: CARD_W, height: CARD_H, background: g.m, ...style }}>
      <Zellige color="#FFFFFF" opacity={0.22} size={26} />
      <Band card={card} side="front" />
      <div className="absolute left-[9px] right-[9px] top-[48px] bottom-[30px] rounded-[14px] bg-white flex flex-col items-center px-2.5 pt-2.5 pb-2 text-center"
        style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.18)' }}>
        <FrontBody card={card} />
      </div>
      <Foot card={card} />
    </div>
  )
}

function FrontBody({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  switch (card.game) {
    case 'call': return <>
      <div className="w-full h-[104px] shrink-0 flex items-center justify-center rounded-[10px]" style={{ background: g.s }}><Picture card={card} /></div>
      <div className="mt-2 text-[13px]" style={{ fontFamily: DISPLAY, color: g.m }}>What do we call</div>
      <div className="text-[25px] leading-tight" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: INK }}>{card.ar}</div>
      <div className="text-[13px]" style={{ fontFamily: DISPLAY, color: g.m }}>in English?</div>
      <Prompt en="+ a sentence from the book" ar="ثم جملة من الكتاب" m={g.m} />
    </>
    case 'timer': return <>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-[40px] leading-none">{card.icon}</span>
        <span className="w-[62px] h-[62px] rounded-full flex flex-col items-center justify-center text-white leading-none" style={{ background: g.m, boxShadow: `0 0 0 4px ${g.s}` }}>
          <span className="text-[24px]" style={{ fontFamily: DISPLAY }}>{card.seconds}</span>
          <span className="text-[10px]" style={{ fontFamily: DISPLAY }}>seconds</span>
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[19px] leading-tight" style={{ fontFamily: DISPLAY, color: INK }}>{card.en}</div>
        <div className="mt-1 text-[14px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{card.enAr}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} m={g.m} />
    </>
    case 'tarjemni': return <>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[25px] leading-snug" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: INK }}>{card.ar}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} m={g.m} />
    </>
    case 'ratebni': return <>
      <div className="flex-1 flex flex-wrap content-center justify-center gap-x-1.5 gap-y-2.5">
        {card.words!.map((w, i) => <WordTile key={i} w={w} />)}
      </div>
      <div className="w-full mb-2 border-b-2 border-dashed" style={{ borderColor: `${g.m}66` }} />
      <Prompt en={g.doEn} ar={g.doAr} m={g.m} />
    </>
    case 'sahehni': return <>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <span className="rounded-full w-9 h-9 flex items-center justify-center text-[20px] text-white" style={{ background: '#DC2626' }}>✗</span>
        <div className="text-[18px] font-bold leading-snug" style={{ fontFamily: EN, color: INK }}>{card.en}</div>
      </div>
      <Prompt en={g.doEn} ar={g.doAr} m={g.m} />
    </>
    case 'kemelni': {
      const k = KEMELNI[card.mode!]
      const said = <Bubble2 key="said" text={card.en} ar={card.enAr} m={g.m} />
      const gap = <Bubble2 key="gap" gap right m={g.m} />
      return <>
        <span className="rounded-full px-2 py-[1px] text-[11px] text-white" style={{ background: g.m, fontFamily: DISPLAY }}>{k.tagEn}</span>
        <div className="flex-1 w-full flex flex-col justify-center gap-2">
          {card.mode === 'question' ? [<Bubble2 key="gap" gap m={g.m} />, <Bubble2 key="said" text={card.en} ar={card.enAr} m={g.m} right />] : [said, gap]}
        </div>
        <Prompt en={k.en} ar={k.ar} m={g.m} />
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
    <div className="rounded-lg px-2 py-[3px] text-[11.5px] font-bold leading-snug text-center" style={{ background: '#FEF3C7', color: '#92400E' }}>
      <div dir="rtl" style={{ fontFamily: AR }}>{ar}</div>
      {en && <div dir="ltr" style={{ fontFamily: EN }}>{en}</div>}
    </div>
  )
}

/** What the asker reads out (the player's side, again). */
function Ask({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  const line = (en?: string, ar?: string) => <>
    {en && <div className="text-[12.5px] font-bold leading-snug" style={{ fontFamily: EN, color: INK }}>{en}</div>}
    {ar && <div className="text-[12px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{ar}</div>}
  </>
  return (
    <div className="rounded-lg px-2 py-1 text-center" style={{ background: g.s }}>
      {card.game === 'call' && line('What do we call this in English?', `${card.ar} ${card.icon}`)}
      {card.game === 'timer' && line(`${card.en} (${card.seconds}s)`, card.enAr)}
      {card.game === 'tarjemni' && line('Say it in English:', card.ar)}
      {card.game === 'ratebni' && line(card.words!.join(' / '), `رتّب الكلمات في ${card.seconds} ثانية`)}
      {card.game === 'sahehni' && line(card.en, 'جد الخطأ وصحّحه')}
      {card.game === 'kemelni' && line(card.en, `${KEMELNI[card.mode!].ar}`)}
    </div>
  )
}

const Divider = ({ en, ar, color }: { en: string; ar: string; color: string }) => (
  <div className="mt-1.5 flex items-center gap-1.5" dir="ltr">
    <span className="rounded-full px-2 py-[1px] text-[10.5px] text-white" style={{ background: color, fontFamily: DISPLAY }}>{en}</span>
    <span className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
    <span className="text-[11px] font-bold" dir="rtl" style={{ fontFamily: AR, color }}>{ar}</span>
  </div>
)

export function CardBack({ card }: { card: PlayCard }) {
  const g = GAMES[card.game]
  return (
    <div className="relative overflow-hidden shrink-0" dir="ltr" style={{ width: CARD_W, height: CARD_H, background: g.m }}>
      <Zellige color="#FFFFFF" opacity={0.3} size={22} />
      <Band card={card} side="back" />
      <div className="absolute left-[8px] right-[8px] top-[48px] bottom-[8px] rounded-[13px] flex flex-col px-2.5 pt-2 pb-1.5" style={{ background: '#FFFBF2' }}>
        <Ask card={card} />
        {card.game === 'timer' ? <>
          <Divider en="✓ ACCEPT" ar="نقبل" color="#16A34A" />
          {/* Flowing text, not chips: a list of sixteen must fit with the extras. */}
          <div className="mt-1 text-center text-[11px] font-bold leading-[1.45]" style={{ fontFamily: EN, color: INK }}>{card.accept!.join(' · ')}</div>
          {card.extra && (
            <div className="mt-1 rounded-md px-1.5 py-[2px] text-center text-[11px] font-bold leading-[1.4]" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <span dir="rtl" style={{ fontFamily: AR }}>📗 من كتاب المفردات: </span>
              <span style={{ fontFamily: EN }}>{card.extra.join(' · ')}</span>
            </div>
          )}
          <div className="flex-1" />
        </> : <>
          <Divider en="✓ ANSWER" ar="الجواب" color="#16A34A" />
          <div className="flex-1 flex flex-col justify-center text-center gap-0.5">
            <div className="text-[17px] leading-snug" style={{ fontFamily: DISPLAY, color: '#0F172A' }}>{card.answer}</div>
            <div className="text-[14px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{card.answerAr}</div>
          </div>
          {card.fix && (
            <div className="mb-1 flex items-center justify-center gap-1.5 text-[13px] font-bold" style={{ fontFamily: EN }}>
              <span className="line-through" style={{ color: '#DC2626' }}>{card.fix[0]}</span><span style={{ color: GREY }}>→</span><span style={{ color: '#16A34A' }}>{card.fix[1]}</span>
            </div>
          )}
          {card.sentence && (
            <div className="mb-1 rounded-lg px-2 py-[3px] text-center leading-snug" style={{ background: g.s }}>
              <div className="text-[10.5px]" style={{ fontFamily: DISPLAY, color: g.m }}>★+2 A sentence from the book</div>
              <div className="text-[12.5px] font-bold" style={{ fontFamily: EN, color: INK }}>{card.sentence}</div>
            </div>
          )}
        </>}
        {card.note && <Note text={card.note} />}
        <div className="mt-1 flex items-end justify-between" dir="ltr">
          <div className="leading-tight text-[11px]" style={{ fontFamily: DISPLAY, color: '#B45309' }}>
            {g.points.map(([en, ar, stars]) => <div key={en}>{stars} <span className="font-bold" style={{ fontFamily: AR }}>{ar}</span></div>)}
          </div>
          <span className="w-[34px] h-[34px] rounded-md border-[1.5px] border-dashed flex flex-col items-center justify-center text-[8px] font-bold leading-none text-[#64748B]" style={{ borderColor: '#94A3B8' }}>
            <span className="text-[12px]">🔊</span>QR
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── A print sheet of nine ─────────────────────────────────────────── */

/** Nine cards (3 × 3) on an A4 page, edge to edge, with crop marks outside the block. */
export function CardGrid({ children, note }: { children: ReactNode; note: string }) {
  const W = CARD_W * 3, H = CARD_H * 3, X = (794 - W) / 2, Y = (1123 - H) / 2
  const marks: ReactNode[] = []
  for (let i = 0; i <= 3; i++) {
    const x = X + i * CARD_W, y = Y + i * CARD_H
    marks.push(<span key={`t${i}`} className="absolute w-px h-[22px] bg-[#94A3B8]" style={{ left: x, top: Y - 28 }} />)
    marks.push(<span key={`b${i}`} className="absolute w-px h-[22px] bg-[#94A3B8]" style={{ left: x, top: Y + H + 6 }} />)
    marks.push(<span key={`l${i}`} className="absolute h-px w-[22px] bg-[#94A3B8]" style={{ top: y, left: X - 28 }} />)
    marks.push(<span key={`r${i}`} className="absolute h-px w-[22px] bg-[#94A3B8]" style={{ top: y, left: X + W + 6 }} />)
  }
  return (
    <div className="absolute inset-0 bg-white">
      {marks}
      <div className="absolute grid grid-cols-3" dir="ltr" style={{ left: X, top: Y, width: W, height: H }}>{children}</div>
      <div className="absolute inset-x-0 text-center text-[10.5px] font-bold text-[#94A3B8]" style={{ top: Y + H + 32, fontFamily: AR }} dir="rtl">{note}</div>
    </div>
  )
}

export const EmptyCard = () => <div style={{ width: CARD_W, height: CARD_H }} />

/* ── The box lid ───────────────────────────────────────────────────── */

const Tile = ({ ch, pts, rot }: { ch: string; pts: number; rot: number }) => (
  <span className="relative inline-flex items-center justify-center w-[60px] h-[64px] rounded-[10px] text-[42px]"
    style={{ fontFamily: DISPLAY, background: '#FFF4D6', color: NAVY, transform: `rotate(${rot}deg)`, boxShadow: '0 6px 0 #C99A2E, 0 10px 18px rgba(0,0,0,0.35)' }}>
    {ch}<span className="absolute bottom-[5px] right-[7px] text-[12px]">{pts}</span>
  </span>
)

const Bubble = ({ text, ar, style, tail = 'left' }: { text: string; ar?: boolean; style: CSSProperties; tail?: 'left' | 'right' }) => (
  <div className="absolute rounded-[18px] bg-white px-4 py-1.5 text-[22px] leading-tight whitespace-nowrap"
    style={{ fontFamily: ar ? AR_DISPLAY : DISPLAY, color: NAVY, boxShadow: '0 6px 0 rgba(0,0,0,0.18)', ...style }} dir={ar ? 'rtl' : 'ltr'}>
    {text}
    <span className="absolute -bottom-[10px] w-0 h-0" style={{ [tail]: 22, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '12px solid #fff' }} />
  </div>
)

/** The lid: a Moorish arch holding a fan of real cards, the title in letter tiles, speech bubbles, a game box's facts. */
export function BoxLid({ fan, cards }: { fan: PlayCard[]; cards: number }) {
  const rot = [-22, -11, 0, 11, 22]
  const stats: [string, string, string][] = [
    ['👨‍👩‍👧‍👦', '2–6 players', 'لاعبين'], ['⏱️', '15 min', 'دقيقة'], ['🎂', 'Age 8+', 'من 8 سنوات'], ['🃏', `${cards} cards`, 'بطاقة'], ['🎲', '6 games', 'ألعاب'], ['🔊', 'Audio QR', 'نطق صوتي'],
  ]
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 55%, #3B63F5 0%, #1D3CC7 42%, #0B1A66 100%)' }}>
      <Zellige color="#F5C04A" opacity={0.17} size={48} stroke={1.4} />
      <div className="absolute left-8 top-8 rounded-full bg-white px-4 py-1.5 text-[22px]" style={{ fontFamily: DISPLAY, color: NAVY, boxShadow: '0 5px 0 rgba(0,0,0,0.2)' }}>
        Inglizi<span style={{ color: '#E0A526' }}>.com</span>
      </div>
      <div className="absolute right-6 top-3 w-[118px] h-[118px] flex flex-col items-center justify-center text-center rotate-[8deg]"
        style={{ background: '#FFD23F', clipPath: 'polygon(50% 0%, 61% 11%, 75% 6%, 79% 21%, 94% 25%, 89% 39%, 100% 50%, 89% 61%, 94% 75%, 79% 79%, 75% 94%, 61% 89%, 50% 100%, 39% 89%, 25% 94%, 21% 79%, 6% 75%, 11% 61%, 0% 50%, 11% 39%, 6% 25%, 21% 21%, 25% 6%, 39% 11%)' }}>
        <span className="text-[25px] leading-none" style={{ fontFamily: DISPLAY, color: NAVY }}>LEVEL 1</span>
        <span className="text-[17px] leading-tight" style={{ fontFamily: DISPLAY, color: '#B4231F' }}>A0 → A1</span>
        <span className="text-[13px] font-bold leading-none" style={{ fontFamily: AR, color: NAVY }}>المستوى الأول</span>
      </div>

      <div className="absolute inset-x-0 top-[140px] flex flex-col items-center">
        <div className="flex items-center gap-2.5" dir="ltr">
          {[['P', 3], ['L', 1], ['A', 1], ['Y', 4]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[-5, 3, -2, 5][i]} />)}
          <span className="text-[44px] mx-1" style={{ fontFamily: DISPLAY, color: '#FFD23F' }}>&</span>
          {[['S', 1], ['P', 3], ['E', 1], ['A', 1], ['K', 5]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[4, -3, 2, -4, 3][i]} />)}
        </div>
        <div className="mt-4 text-[112px] leading-[0.95] tracking-wide" style={{ fontFamily: DISPLAY, color: '#FFD23F', textShadow: `0 7px 0 #0A1550, 0 14px 26px rgba(0,0,0,0.45)` }}>ENGLISH</div>
        <div className="mt-2 text-[46px] leading-tight text-white" dir="rtl" style={{ fontFamily: AR_DISPLAY, textShadow: '0 4px 0 rgba(10,21,80,0.6)' }}>العب وتكلّم الإنجليزية</div>
      </div>

      <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: 425, width: 540, height: 462 }} viewBox="0 0 540 462" aria-hidden>
        <path d="M30 462 L30 250 C30 120 120 30 270 30 C420 30 510 120 510 250 L510 462" fill="rgba(255,255,255,0.08)" stroke="#F5C04A" strokeWidth="7" />
        <path d="M52 462 L52 252 C52 136 136 52 270 52 C404 52 488 136 488 252 L488 462" fill="none" stroke="#F5C04A" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <div className="absolute left-1/2" style={{ top: 500, width: 0, height: 0 }}>
        {fan.slice(0, 5).map((c, i) => (
          <div key={c.id} className="absolute" style={{
            left: -CARD_W / 2, top: 0, transform: `rotate(${rot[i]}deg) scale(0.8)`, transformOrigin: '50% 135%',
            boxShadow: '0 12px 28px rgba(0,0,0,0.4)', borderRadius: 14, overflow: 'hidden', zIndex: 5 - Math.abs(i - 2),
          }}>
            <CardFront card={c} />
          </div>
        ))}
      </div>

      <Bubble text="Hello! 👋" style={{ left: 30, top: 500, transform: 'rotate(-8deg)' }} />
      <Bubble text="مرحبًا!" ar tail="right" style={{ left: 22, top: 760, transform: 'rotate(6deg)' }} />
      <Bubble text="Yummy! 😋" tail="right" style={{ right: 22, top: 500, transform: 'rotate(7deg)' }} />
      <Bubble text="How are you?" style={{ right: 12, top: 770, transform: 'rotate(-5deg)' }} />

      <div className="absolute left-1/2 -translate-x-1/2 top-[905px] flex items-center gap-3 rounded-[12px] px-6 py-2 whitespace-nowrap" style={{ background: '#E0A526', boxShadow: '0 6px 0 #9A6B10' }}>
        <span className="text-[24px]" style={{ fontFamily: DISPLAY, color: NAVY }}>FAMILY CARD GAME</span>
        <span className="text-[24px]" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>لعبة بطاقات عائلية</span>
      </div>

      <div className="absolute left-6 right-6 bottom-[46px] grid grid-cols-6 rounded-[18px] py-2.5" style={{ background: '#FFF4D6', boxShadow: '0 6px 0 rgba(0,0,0,0.25)' }} dir="ltr">
        {stats.map(([icon, en, ar], i) => (
          <div key={en} className="flex flex-col items-center leading-tight" style={{ borderLeft: i ? '1.5px dashed #D9C08A' : undefined }}>
            <span className="text-[24px]">{icon}</span>
            <span className="text-[15px]" style={{ fontFamily: DISPLAY, color: NAVY }}>{en}</span>
            <span className="text-[12.5px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#6B5A2E' }}>{ar}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[14px] text-center text-[13px] font-bold text-white/80" dir="rtl" style={{ fontFamily: AR }}>
        يرافق كتاب المستوى الأول ودفتر التمارين وكتاب المفردات · <bdi dir="ltr" style={{ fontFamily: EN }}>Goes with the Level 1 course book</bdi>
      </div>
    </div>
  )
}

/* ── The box's back: how to play ───────────────────────────────────── */

const BOX: [string, string, string][] = [
  ['📘', 'Course book', 'كتاب الدروس'], ['✏️', 'Workbook', 'دفتر التمارين'], ['🔤', 'Vocabulary book', 'كتاب المفردات'],
  ['🃏', 'Play cards', 'بطاقات اللعب'], ['⏳', 'Sand timer', 'ساعة رملية'], ['🔊', 'Audio lessons', 'دروس صوتية'],
]

/** A card at a smaller size, for the box's back. */
const Small = ({ children, scale = 0.9 }: { children: ReactNode; scale?: number }) => (
  <div className="rounded-[12px] overflow-hidden" style={{ width: CARD_W * scale, height: CARD_H * scale, boxShadow: '0 8px 20px rgba(13,31,120,0.25)' }}>
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
  </div>
)

export function BoxBack({ sample }: { sample: PlayCard }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: NAVY }}>
      <Zellige color="#F5C04A" opacity={0.2} size={40} />
      <div className="absolute inset-[22px] rounded-[22px] px-7 pt-5 pb-5 flex flex-col" style={{ background: '#FFFBF2' }}>
        <div className="flex items-baseline justify-between" dir="ltr">
          <span className="text-[38px] leading-none" style={{ fontFamily: DISPLAY, color: NAVY }}>How to play</span>
          <span className="text-[36px] leading-none" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>طريقة اللعب</span>
        </div>

        {/* one card, two sides */}
        <div className="mt-3 rounded-[18px] px-5 py-3 flex items-center justify-center gap-5" style={{ background: '#EEF2FF' }} dir="ltr">
          <div className="flex flex-col items-center gap-1">
            <Small><CardFront card={sample} /></Small>
            <span className="text-[14px]" style={{ fontFamily: DISPLAY, color: NAVY }}>👀 The player sees</span>
            <span className="text-[13px] font-bold -mt-1" dir="rtl" style={{ fontFamily: AR, color: GREY }}>اللاعب يرى هذا الوجه</span>
          </div>
          <div className="flex flex-col items-center text-center w-[150px]" dir="rtl">
            <span className="text-[40px] leading-none" style={{ color: '#E0A526' }}>⇄</span>
            <span className="mt-1.5 text-[13.5px] font-bold leading-snug" style={{ fontFamily: AR, color: NAVY }}>ارفع البطاقة أمام اللاعب واقرأ أنت الخلف. لا تعرف الإنجليزية؟ الجواب مكتوب بالعربية أيضًا.</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Small><CardBack card={sample} /></Small>
            <span className="text-[14px]" style={{ fontFamily: DISPLAY, color: NAVY }}>📣 The asker reads</span>
            <span className="text-[13px] font-bold -mt-1" dir="rtl" style={{ fontFamily: AR, color: GREY }}>السائل يقرأ هذا الوجه</span>
          </div>
        </div>

        {/* the six games */}
        <div className="mt-3 flex items-baseline justify-between" dir="ltr">
          <span className="text-[19px]" style={{ fontFamily: DISPLAY, color: NAVY }}>6 games, 9 cards for every lesson</span>
          <span className="text-[19px]" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>ست ألعاب، تسع بطاقات لكل درس</span>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-2" dir="ltr">
          {GAME_ORDER.map(k => {
            const g = GAMES[k]
            return (
              <div key={k} className="rounded-[14px] bg-white overflow-hidden" style={{ border: `2px solid ${g.m}` }}>
                <div className="flex items-center justify-between px-2.5 py-1 text-white" style={{ background: g.m }}>
                  <span className="text-[15px]" style={{ fontFamily: DISPLAY }}>{g.icon} {g.name}</span>
                  <span className="text-[13px] font-bold" style={{ fontFamily: AR }}>{g.ar}</span>
                </div>
                <div className="px-2.5 py-1.5" dir="rtl">
                  <div className="text-[12.5px] font-bold leading-snug" style={{ fontFamily: AR, color: INK }}>{g.rule}</div>
                  <div className="mt-1 flex flex-wrap gap-x-2 text-[12px] font-bold" style={{ fontFamily: AR, color: '#B45309' }}>
                    {g.points.map(([en, ar, stars]) => <span key={en}><bdi dir="ltr" style={{ fontFamily: DISPLAY }}>{stars}</bdi> {ar}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 rounded-[14px] px-4 py-2 text-[13px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, background: '#FFF4D6', color: '#6B4E12', border: '1.5px solid #EAD9A8' }}>
          🏁 <b>سباق العائلة:</b> كل لاعب بدوره يسحب بطاقة من الدروس التي درسها، وأول من يجمع 20 نجمة يفوز. 👨‍👧 <b>مع طفلك:</b> بطاقات درس واحد في اليوم. 🧠 <b>وحدك:</b> أجب ثم اقلب البطاقة.
        </div>

        {/* the box */}
        <div className="mt-3 grid grid-cols-6 gap-2" dir="ltr">
          {BOX.map(([icon, en, ar]) => (
            <div key={en} className="flex flex-col items-center text-center rounded-[12px] px-1 py-1.5" style={{ background: '#EEF2FF' }}>
              <span className="text-[24px] leading-none">{icon}</span>
              <span className="mt-0.5 text-[12px] leading-tight" style={{ fontFamily: DISPLAY, color: NAVY }}>{en}</span>
              <span className="text-[11.5px] font-bold leading-tight" dir="rtl" style={{ fontFamily: AR, color: GREY }}>{ar}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-[14px] px-4 py-2" style={{ background: NAVY }} dir="rtl">
          <span className="text-[14.5px] font-bold text-white" style={{ fontFamily: AR }}>🎯 رقم الدرس على كل بطاقة: العب فقط بالدروس التي درستها.</span>
          <span className="text-[16px]" dir="ltr" style={{ fontFamily: DISPLAY, color: '#FFD23F' }}>inglizi.com</span>
        </div>
      </div>
    </div>
  )
}
