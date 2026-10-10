'use client'

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { KINDS, WILD, lessonOf, type PlayCard } from '@/data/level1-cards'

/**
 * The Level 1 play cards, drawn at print size: a poker card (63 × 88 mm =
 * 238 × 333 px at 96 dpi). The player's side is the lesson's colour with a
 * zellige pattern and a white panel holding the task; the asker's side is
 * cream in a zellige frame, with the question again and the answer in
 * English and Arabic, so someone with no English can check it. Faces:
 * Lilita One (titles, the cover's tiles), Mali (English, as in the Level 1
 * book), Baloo Bhaijaan 2 and Lalezar (Arabic).
 */

export const CARD_W = 238, CARD_H = 333

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Mali:wght@500;600;700&family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Lalezar&display=swap'
export const DISPLAY = "'Lilita One', 'Baloo Bhaijaan 2', sans-serif"
export const EN = "'Mali', 'Baloo Bhaijaan 2', sans-serif"
export const AR = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif"
export const AR_DISPLAY = "'Lalezar', 'Baloo Bhaijaan 2', sans-serif"
const NAVY = '#0D1F78'

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

/** The picture: the photo once it is uploaded, the emoji until then. */
function Picture({ card, size }: { card: PlayCard; size: number }) {
  const [failed, setFailed] = useState(false)
  if (card.photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/level1-cards/photos/${card.photo}.webp`} alt="" onError={() => setFailed(true)}
        className="w-full h-full object-cover rounded-[10px]" />
    )
  }
  return <span style={{ fontSize: size, lineHeight: 1 }}>{card.icon}</span>
}

const Points = ({ n, color }: { n: number; color: string }) => (
  <span className="flex items-center gap-[1px]" style={{ color }}>
    {Array.from({ length: n }, (_, i) => <span key={i} className="text-[11px]">★</span>)}
  </span>
)

function colours(card: PlayCard) {
  const l = lessonOf(card.lesson)
  return card.kind === 'wild' || !l ? { m: WILD.m, s: WILD.s } : { m: l.m, s: l.s }
}

/* ── The player's side ─────────────────────────────────────────────── */

export function CardFront({ card, style }: { card: PlayCard; style?: CSSProperties }) {
  if (card.kind === 'wild') return <WildFront card={card} style={style} />
  const l = lessonOf(card.lesson)!
  const k = KINDS[card.kind]
  const { m, s } = colours(card)
  return (
    <div className="relative overflow-hidden shrink-0" dir="ltr" style={{ width: CARD_W, height: CARD_H, background: m, ...style }}>
      <Zellige color="#FFFFFF" opacity={0.24} size={26} />
      {/* The lesson and its scene */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 h-[34px] text-white" dir="ltr">
        <span className="rounded-full bg-white px-2 py-[1px] text-[13px]" style={{ fontFamily: DISPLAY, color: m }}>L{String(l.n).padStart(2, '0')}</span>
        <span className="text-[12.5px] font-bold" dir="rtl" style={{ fontFamily: AR }}>{l.sceneAr} {l.icon}</span>
      </div>
      {/* The task */}
      <div className="absolute left-[10px] right-[10px] top-[34px] bottom-[30px] rounded-[14px] bg-white flex flex-col items-center px-3 pt-6 pb-2 text-center"
        style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.18)' }}>
        <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-[2px] text-[11.5px] text-white" style={{ background: m, fontFamily: DISPLAY, boxShadow: '0 0 0 2px #fff' }}>
          {k.icon} {k.en}
        </span>
        <FrontBody card={card} m={m} s={s} />
      </div>
      {/* Points and the brand */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 h-[30px] text-white" dir="ltr">
        <Points n={card.points} color="#FFE07A" />
        <span className="text-[11px]" style={{ fontFamily: DISPLAY }}>inglizi.com</span>
      </div>
    </div>
  )
}

const Prompt = ({ en, ar, m }: { en: string; ar: string; m: string }) => (
  <div className="mt-auto w-full rounded-lg py-1 leading-tight" style={{ background: `color-mix(in srgb, ${m} 10%, white)` }}>
    <div className="text-[13px]" style={{ fontFamily: DISPLAY, color: m }}>{en}</div>
    <div className="text-[12.5px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#475569' }}>{ar}</div>
  </div>
)

function FrontBody({ card, m }: { card: PlayCard; m: string; s: string }) {
  const k = KINDS[card.kind]
  switch (card.kind) {
    case 'picture': return <>
      <div className="w-full flex-1 min-h-0 flex items-center justify-center rounded-[10px] mb-2" style={{ background: `color-mix(in srgb, ${m} 8%, white)` }}>
        <Picture card={card} size={104} />
      </div>
      <Prompt en={k.doEn} ar={k.doAr} m={m} />
    </>
    case 'situation': return <>
      <span className="text-[50px] leading-none mb-2">{card.icon}</span>
      <div className="text-[14.5px] font-bold leading-snug text-[#1E293B]" style={{ fontFamily: EN }}>{card.en}</div>
      <div className="mt-1 text-[14px] font-bold leading-snug text-[#475569]" dir="rtl" style={{ fontFamily: AR }}>{card.ar}</div>
      <Prompt en={k.doEn} ar={k.doAr} m={m} />
    </>
    case 'translate': return <>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[27px] leading-snug text-[#1E293B]" dir="rtl" style={{ fontFamily: AR_DISPLAY }}>{card.ar}</div>
      </div>
      <Prompt en={k.doEn} ar={k.doAr} m={m} />
    </>
    case 'silly': return <>
      <span className="text-[44px] leading-none mb-2">{card.icon}</span>
      <div className="text-[16.5px] leading-snug" style={{ fontFamily: DISPLAY, color: '#1E293B' }}>{card.en}</div>
      <div className="mt-1.5 text-[13.5px] font-bold leading-snug text-[#475569]" dir="rtl" style={{ fontFamily: AR }}>{card.ar}</div>
      <Prompt en={k.doEn} ar={k.doAr} m={m} />
    </>
    case 'fix': return <>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <span className="rounded-full w-9 h-9 flex items-center justify-center text-[20px] text-white" style={{ background: '#DC2626' }}>✗</span>
        <div className="text-[19px] font-bold leading-snug text-[#1E293B]" style={{ fontFamily: EN }}>{card.en}</div>
      </div>
      <Prompt en={k.doEn} ar={k.doAr} m={m} />
    </>
    default: return null
  }
}

function WildFront({ card, style }: { card: PlayCard; style?: CSSProperties }) {
  return (
    <div className="relative overflow-hidden shrink-0 flex flex-col items-center justify-center text-center px-4" dir="ltr"
      style={{ width: CARD_W, height: CARD_H, background: `radial-gradient(circle at 50% 40%, #7C3AED, ${WILD.m} 60%, #2E1065)`, ...style }}>
      <Zellige color={WILD.gold} opacity={0.3} size={30} />
      <div className="absolute inset-[8px] rounded-[14px] border-2 border-dashed" style={{ borderColor: `${WILD.gold}99` }} />
      <span className="relative rounded-full px-3 py-[2px] text-[12px]" style={{ background: WILD.gold, color: '#2E1065', fontFamily: DISPLAY }}>🃏 WILD CARD</span>
      <span className="relative text-[84px] leading-none my-3" style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.25))' }}>{card.icon}</span>
      <div className="relative text-[26px] leading-tight" style={{ fontFamily: DISPLAY, color: WILD.gold, textShadow: '0 3px 0 #2E1065' }}>{card.en}</div>
      <div className="relative text-[22px] text-white mt-1" dir="rtl" style={{ fontFamily: AR_DISPLAY }}>{card.ar}</div>
      <div className="relative mt-3 text-[11.5px] font-bold text-white/85" dir="rtl" style={{ fontFamily: AR }}>اقلب البطاقة لتعرف ما يحدث 👀</div>
    </div>
  )
}

/* ── The asker's side ──────────────────────────────────────────────── */

/** A note for the asker: the Arabic, then the English it quotes on a line of its own (mixed on one line, they wrap into each other). */
function Note({ text }: { text: string }) {
  const at = text.search(/[A-Za-z]/)
  const ar = at < 0 ? text : text.slice(0, at).trim(), en = at < 0 ? '' : text.slice(at).trim()
  return (
    <div className="rounded-lg px-2 py-1 text-[12px] font-bold leading-snug text-center" style={{ background: '#FEF3C7', color: '#92400E' }}>
      <div dir="rtl" style={{ fontFamily: AR }}>{ar}</div>
      {en && <div dir="ltr" style={{ fontFamily: EN }}>{en}</div>}
    </div>
  )
}

export function CardBack({ card }: { card: PlayCard }) {
  const { m } = colours(card)
  const k = KINDS[card.kind]
  const wild = card.kind === 'wild'
  const l = lessonOf(card.lesson)
  return (
    <div className="relative overflow-hidden shrink-0" dir="ltr" style={{ width: CARD_W, height: CARD_H, background: m }}>
      <Zellige color={wild ? WILD.gold : '#FFFFFF'} opacity={0.3} size={22} />
      <div className="absolute inset-[9px] rounded-[13px] flex flex-col px-3 pt-2 pb-2" style={{ background: '#FFFBF2' }}>
        <div className="flex items-center justify-between" dir="ltr">
          <span className="text-[12px]" style={{ fontFamily: DISPLAY, color: m }}>{wild ? '🃏 WILD' : `📣 ASK · L${String(l!.n).padStart(2, '0')}`}</span>
          <span className="text-[12px] font-bold" dir="rtl" style={{ fontFamily: AR, color: m }}>{wild ? 'ماذا يحدث؟' : 'اسأل'}</span>
        </div>
        {!wild && (
          <div className="mt-1 rounded-lg px-2 py-1.5 text-center" style={{ background: `color-mix(in srgb, ${m} 9%, white)` }}>
            <div className="text-[12px] font-bold text-[#334155] leading-snug" style={{ fontFamily: EN }}>
              {card.kind === 'picture' || card.kind === 'translate' ? `${k.doEn}` : card.en}
            </div>
            <div className="text-[12px] font-bold text-[#64748B] leading-snug" dir="rtl" style={{ fontFamily: AR }}>
              {card.kind === 'picture' ? `${k.doAr} ${card.icon}` : card.ar ?? k.doAr}
            </div>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5" dir="ltr">
          <span className="rounded-full px-2 py-[1px] text-[11px] text-white" style={{ background: wild ? m : '#16A34A', fontFamily: DISPLAY }}>{wild ? 'DO IT!' : '✓ ANSWER'}</span>
          <span className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
          <span className="text-[11.5px] font-bold" dir="rtl" style={{ fontFamily: AR, color: wild ? m : '#16A34A' }}>{wild ? 'افعلها!' : 'الجواب'}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center text-center gap-1">
          <div className="text-[17px] leading-snug" style={{ fontFamily: DISPLAY, color: '#0F172A' }}>{card.answerEn}</div>
          <div className="text-[15px] font-bold leading-snug text-[#475569]" dir="rtl" style={{ fontFamily: AR }}>{card.answerAr}</div>
        </div>
        {card.note && <Note text={card.note} />}
        <div className="mt-1.5 flex items-end justify-between" dir="ltr">
          <div className="leading-tight">
            <Points n={card.points} color="#D97706" />
            <div className="text-[10.5px] font-bold text-[#64748B]" dir="rtl" style={{ fontFamily: AR }}>{card.points === 1 ? 'نقطة واحدة' : card.points === 2 ? 'نقطتان' : 'ثلاث نقاط'}</div>
          </div>
          {!wild && (
            <span className="w-[38px] h-[38px] rounded-md border-[1.5px] border-dashed flex flex-col items-center justify-center text-[8px] font-bold leading-none text-[#64748B]" style={{ borderColor: '#94A3B8' }}>
              <span className="text-[13px]">🔊</span>QR
            </span>
          )}
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

const STATS: [string, string, string][] = [
  ['👨‍👩‍👧‍👦', '2–6 players', 'لاعبين'], ['⏱️', '15 min', 'دقيقة'], ['🎂', 'Age 8+', 'من 8 سنوات'], ['🃏', '130 cards', 'بطاقة'], ['🔊', 'Audio QR', 'نطق صوتي'],
]

/** The lid: a Moorish arch holding a fan of real cards, the title in letter tiles, speech bubbles, a game box's facts. */
export function BoxLid({ fan }: { fan: PlayCard[] }) {
  const rot = [-22, -11, 0, 11, 22]
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 55%, #3B63F5 0%, #1D3CC7 42%, #0B1A66 100%)' }}>
      <Zellige color="#F5C04A" opacity={0.17} size={48} stroke={1.4} />
      {/* top: brand and level seal */}
      <div className="absolute left-8 top-8 rounded-full bg-white px-4 py-1.5 text-[22px]" style={{ fontFamily: DISPLAY, color: NAVY, boxShadow: '0 5px 0 rgba(0,0,0,0.2)' }}>
        Inglizi<span style={{ color: '#E0A526' }}>.com</span>
      </div>
      <div className="absolute right-6 top-3 w-[118px] h-[118px] flex flex-col items-center justify-center text-center rotate-[8deg]"
        style={{ background: '#FFD23F', clipPath: 'polygon(50% 0%, 61% 11%, 75% 6%, 79% 21%, 94% 25%, 89% 39%, 100% 50%, 89% 61%, 94% 75%, 79% 79%, 75% 94%, 61% 89%, 50% 100%, 39% 89%, 25% 94%, 21% 79%, 6% 75%, 11% 61%, 0% 50%, 11% 39%, 6% 25%, 21% 21%, 25% 6%, 39% 11%)' }}>
        <span className="text-[25px] leading-none" style={{ fontFamily: DISPLAY, color: NAVY }}>LEVEL 1</span>
        <span className="text-[17px] leading-tight" style={{ fontFamily: DISPLAY, color: '#B4231F' }}>A0 → A1</span>
        <span className="text-[13px] font-bold leading-none" style={{ fontFamily: AR, color: NAVY }}>المستوى الأول</span>
      </div>

      {/* title */}
      <div className="absolute inset-x-0 top-[140px] flex flex-col items-center">
        <div className="flex items-center gap-2.5" dir="ltr">
          {[['P', 3], ['L', 1], ['A', 1], ['Y', 4]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[-5, 3, -2, 5][i]} />)}
          <span className="text-[44px] mx-1" style={{ fontFamily: DISPLAY, color: '#FFD23F' }}>&</span>
          {[['S', 1], ['P', 3], ['E', 1], ['A', 1], ['K', 5]].map(([c, p], i) => <Tile key={i} ch={c as string} pts={p as number} rot={[4, -3, 2, -4, 3][i]} />)}
        </div>
        <div className="mt-4 text-[112px] leading-[0.95] tracking-wide" style={{ fontFamily: DISPLAY, color: '#FFD23F', textShadow: `0 7px 0 #0A1550, 0 14px 26px rgba(0,0,0,0.45)` }}>ENGLISH</div>
        <div className="mt-2 text-[46px] leading-tight text-white" dir="rtl" style={{ fontFamily: AR_DISPLAY, textShadow: '0 4px 0 rgba(10,21,80,0.6)' }}>العب وتكلّم الإنجليزية</div>
      </div>

      {/* the arch and the fan of cards */}
      <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: 425, width: 540, height: 462 }} viewBox="0 0 540 462" aria-hidden>
        <path d="M30 462 L30 250 C30 120 120 30 270 30 C420 30 510 120 510 250 L510 462"
          fill="rgba(255,255,255,0.08)" stroke="#F5C04A" strokeWidth="7" />
        <path d="M52 462 L52 252 C52 136 136 52 270 52 C404 52 488 136 488 252 L488 462"
          fill="none" stroke="#F5C04A" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <div className="absolute left-1/2" style={{ top: 500, width: 0, height: 0 }}>
        {fan.slice(0, 5).map((c, i) => (
          <div key={c.id} className="absolute" style={{
            left: -CARD_W / 2, top: 0, transform: `rotate(${rot[i]}deg) scale(0.8)`, transformOrigin: '50% 135%',
            boxShadow: '0 12px 28px rgba(0,0,0,0.4)', borderRadius: 14, overflow: 'hidden', zIndex: i === 2 ? 5 : 5 - Math.abs(i - 2),
          }}>
            <CardFront card={c} />
          </div>
        ))}
      </div>

      {/* speech bubbles */}
      <Bubble text="Hello! 👋" style={{ left: 30, top: 500, transform: 'rotate(-8deg)' }} />
      <Bubble text="مرحبًا!" ar tail="right" style={{ left: 22, top: 760, transform: 'rotate(6deg)' }} />
      <Bubble text="Yummy! 😋" tail="right" style={{ right: 22, top: 500, transform: 'rotate(7deg)' }} />
      <Bubble text="How are you?" style={{ right: 12, top: 770, transform: 'rotate(-5deg)' }} />

      {/* ribbon */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[905px] flex items-center gap-3 rounded-[12px] px-6 py-2 whitespace-nowrap"
        style={{ background: '#E0A526', boxShadow: '0 6px 0 #9A6B10' }}>
        <span className="text-[24px]" style={{ fontFamily: DISPLAY, color: NAVY }}>FAMILY CARD GAME</span>
        <span className="text-[24px]" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>لعبة بطاقات عائلية</span>
      </div>

      {/* the facts of a game box */}
      <div className="absolute left-8 right-8 bottom-[46px] grid grid-cols-5 rounded-[18px] py-2.5" style={{ background: '#FFF4D6', boxShadow: '0 6px 0 rgba(0,0,0,0.25)' }} dir="ltr">
        {STATS.map(([icon, en, ar], i) => (
          <div key={en} className="flex flex-col items-center leading-tight" style={{ borderLeft: i ? '1.5px dashed #D9C08A' : undefined }}>
            <span className="text-[26px]">{icon}</span>
            <span className="text-[16px]" style={{ fontFamily: DISPLAY, color: NAVY }}>{en}</span>
            <span className="text-[13px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#6B5A2E' }}>{ar}</span>
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

const GAMES: { icon: string; en: string; ar: string; who: string; steps: string[] }[] = [
  { icon: '🏁', en: 'Family race', ar: 'سباق العائلة', who: '2–6', steps: [
    'كل لاعب بدوره: ارفع البطاقة، اللاعب يرى الوجه الملوّن وأنت تقرأ الخلف.',
    'جواب صحيح؟ يأخذ البطاقة ونقاطها ★.',
    'أول من يجمع 15 نقطة يفوز!',
  ] },
  { icon: '👨‍👧', en: 'Parent & child', ar: 'الأب أو الأم والطفل', who: '2', steps: [
    'اختر 10 بطاقات من الدروس التي درسها طفلك.',
    'اسأل بالعربية أو بالإنجليزية، وتحقّق من الجواب في الخلف.',
    'سجّل النتيجة، وأعد البطاقات الخاطئة غدًا.',
  ] },
  { icon: '🧠', en: 'Solo', ar: 'وحدك', who: '1', steps: [
    'انظر إلى الوجه الملوّن وأجب بصوت مرتفع.',
    'اقلب البطاقة وتحقّق، واستمع إلى النطق بالرمز.',
    'كومة «أعرفها» وكومة «مرة أخرى» حتى تنتهي.',
  ] },
]

const BOX: [string, string, string][] = [
  ['📘', 'Course book', 'كتاب الدروس'], ['✏️', 'Workbook', 'دفتر التمارين'], ['🔤', 'Vocabulary book', 'كتاب المفردات'],
  ['🃏', '130 play cards', 'بطاقة لعب'], ['🔊', 'Audio lessons', 'دروس صوتية'],
]

export function BoxBack({ sample }: { sample: PlayCard }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: NAVY }}>
      <Zellige color="#F5C04A" opacity={0.2} size={40} />
      <div className="absolute inset-[22px] rounded-[22px] px-8 pt-6 pb-5 flex flex-col" style={{ background: '#FFFBF2' }}>
        <div className="flex items-baseline justify-between" dir="ltr">
          <span className="text-[40px] leading-none" style={{ fontFamily: DISPLAY, color: NAVY }}>How to play</span>
          <span className="text-[38px] leading-none" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>طريقة اللعب</span>
        </div>

        {/* one card, two sides */}
        <div className="mt-4 rounded-[18px] px-5 py-4 flex items-center justify-center gap-6" style={{ background: '#EEF2FF' }} dir="ltr">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-[14px] overflow-hidden" style={{ boxShadow: '0 8px 20px rgba(13,31,120,0.25)' }}><CardFront card={sample} /></div>
            <span className="text-[15px]" style={{ fontFamily: DISPLAY, color: NAVY }}>👀 The player sees</span>
            <span className="text-[14px] font-bold -mt-1.5" dir="rtl" style={{ fontFamily: AR, color: '#475569' }}>اللاعب يرى هذا الوجه</span>
          </div>
          <div className="flex flex-col items-center text-center w-[120px]">
            <span className="text-[44px] leading-none" style={{ color: '#E0A526' }}>⇄</span>
            <span className="mt-2 text-[14px] font-bold leading-snug" dir="rtl" style={{ fontFamily: AR, color: NAVY }}>لا تعرف الإنجليزية؟ لا مشكلة! الجواب مكتوب بالعربية والإنجليزية.</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-[14px] overflow-hidden" style={{ boxShadow: '0 8px 20px rgba(13,31,120,0.25)' }}><CardBack card={sample} /></div>
            <span className="text-[15px]" style={{ fontFamily: DISPLAY, color: NAVY }}>📣 The asker reads</span>
            <span className="text-[14px] font-bold -mt-1.5" dir="rtl" style={{ fontFamily: AR, color: '#475569' }}>السائل يقرأ هذا الوجه</span>
          </div>
        </div>

        {/* three games */}
        <div className="mt-4 grid grid-cols-3 gap-3" dir="rtl">
          {GAMES.map(g => (
            <div key={g.en} className="rounded-[16px] bg-white px-3 py-2.5" style={{ border: '2px solid #E2E8F0' }}>
              <div className="flex items-center justify-between" dir="ltr">
                <span className="text-[17px]" style={{ fontFamily: DISPLAY, color: NAVY }}>{g.icon} {g.en}</span>
                <span className="rounded-full px-2 text-[11.5px]" style={{ fontFamily: DISPLAY, background: '#FFD23F', color: NAVY }}>👥 {g.who}</span>
              </div>
              <div className="text-[15px] font-extrabold" style={{ fontFamily: AR, color: '#B45309' }}>{g.ar}</div>
              <ol className="mt-1 space-y-0.5 text-[12.5px] font-bold leading-snug text-[#334155]" style={{ fontFamily: AR }}>
                {g.steps.map((s, i) => <li key={i} className="flex gap-1.5"><span className="shrink-0 w-[18px] h-[18px] rounded-full text-white text-[11px] flex items-center justify-center" style={{ background: NAVY }}>{i + 1}</span><span>{s}</span></li>)}
              </ol>
            </div>
          ))}
        </div>

        {/* card types */}
        <div className="mt-4 grid grid-cols-3 gap-2" dir="ltr">
          {(['picture', 'situation', 'translate', 'silly', 'fix', 'wild'] as const).map(k => (
            <div key={k} className="flex items-center gap-2 rounded-[12px] bg-white px-2.5 py-1.5" style={{ border: '1.5px solid #E2E8F0' }}>
              <span className="text-[22px]">{KINDS[k].icon}</span>
              <div className="leading-tight">
                <div className="text-[14px]" style={{ fontFamily: DISPLAY, color: NAVY }}>{KINDS[k].en}</div>
                <div className="text-[12.5px] font-bold text-[#64748B]" dir="rtl" style={{ fontFamily: AR }}>{KINDS[k].ar}</div>
              </div>
            </div>
          ))}
        </div>

        {/* the box */}
        <div className="mt-4 flex items-baseline justify-between" dir="ltr">
          <span className="text-[20px]" style={{ fontFamily: DISPLAY, color: NAVY }}>In the Level 1 box</span>
          <span className="text-[20px]" dir="rtl" style={{ fontFamily: AR_DISPLAY, color: NAVY }}>في علبة المستوى الأول</span>
        </div>
        <div className="mt-1.5 grid grid-cols-5 gap-2" dir="ltr">
          {BOX.map(([icon, en, ar]) => (
            <div key={en} className="flex flex-col items-center text-center rounded-[14px] px-1.5 py-2" style={{ background: '#FFF4D6', border: '1.5px solid #EAD9A8' }}>
              <span className="text-[28px] leading-none">{icon}</span>
              <span className="mt-1 text-[13px] leading-tight" style={{ fontFamily: DISPLAY, color: NAVY }}>{en}</span>
              <span className="text-[12px] font-bold leading-tight text-[#6B5A2E]" dir="rtl" style={{ fontFamily: AR }}>{ar}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-[14px] px-4 py-2" style={{ background: NAVY }} dir="rtl">
          <span className="text-[15px] font-bold text-white" style={{ fontFamily: AR }}>🎯 العب فقط بدروس الكتاب التي درستها: رقم الدرس على كل بطاقة.</span>
          <span className="text-[16px]" dir="ltr" style={{ fontFamily: DISPLAY, color: '#FFD23F' }}>inglizi.com</span>
        </div>
      </div>
    </div>
  )
}
