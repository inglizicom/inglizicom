import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, PenLine } from 'lucide-react'
import { BOUCHTA, CARDS, CARD_LESSONS, GAMES, KEMELNI, type BouchtaCard, type PlayCard } from '@/data/level1-cards'
import { bouchtaClips, cardClips, cardCode } from '@/data/level1-audio'
import { PlayLine } from '../_player'
import { PlayShell, toPlay } from '../_shell'

/**
 * /audio/L13 — the play cards of a lesson: its nine cards and Bouchta's question.
 * /audio/L13-8 — the card whose QR code was scanned, on top of its lesson's cards.
 * /audio/B-06 — one of Bouchta's silly questions, on top of its lesson's cards.
 */

const pad = (n: number) => String(n).padStart(2, '0')

export function generateStaticParams() {
  return [
    ...CARD_LESSONS.map(l => ({ code: `L${pad(l.n)}` })),
    ...CARDS.map(c => ({ code: cardCode(c.id) })),
    ...BOUCHTA.filter(b => b.kind === 'silly').map(b => ({ code: cardCode(b.id) })),
  ]
}
export const dynamicParams = false

/** What the player saw on the card, to read it again here. */
function taskOf(c: PlayCard): [string, string] {
  switch (c.game) {
    case 'call': return [`What do we call «${c.ar}» in English?`, 'ما اسمه بالإنجليزية؟']
    case 'timer': return [`${c.en} (${c.seconds}s)`, c.enAr!]
    case 'tarjemni': return [c.ar!, 'قلها بالإنجليزية!']
    case 'ratebni': return [c.words!.join(' / '), 'رتّب الكلمات']
    case 'sahehni': return [c.en!, 'جد الخطأ وصحّحه']
    case 'kemelni': return [c.en!, KEMELNI[c.mode!].ar]
  }
}

function CardPanel({ card, highlight }: { card: PlayCard; highlight?: boolean }) {
  const g = GAMES[card.game]
  const [task, taskAr] = taskOf(card)
  const k = cardCode(card.id)
  const arOnly = /[؀-ۿ]/.test(task) && !/[A-Za-z]/.test(task)
  return (
    <section id={k} className={`rounded-2xl border bg-white p-3 ${highlight ? 'border-[#B8862F] ring-2 ring-[#B8862F]/40' : 'border-[#D6DCE8]'}`}>
      <div className="flex items-center justify-between gap-2 px-1" dir="ltr">
        <span className="text-[14px] font-bold text-[#14306B]">{g.name} <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">{g.ar}</span></span>
        <span className="rounded-md bg-[#14306B] px-1.5 py-0.5 text-[11px] font-bold text-white">{k}</span>
      </div>
      <div className="mt-1.5 rounded-xl bg-[#EEF2F9] px-3 py-2">
        <div className={`text-[14px] font-semibold text-[#1F2937] ${arOnly ? 'font-arabic text-right' : ''}`} dir={arOnly ? 'rtl' : 'ltr'}>{task}</div>
        <div className="font-arabic text-[12.5px] text-[#5B6474]" dir="rtl">{taskAr}</div>
      </div>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {cardClips(card).map((c, i) => <PlayLine key={i} k={`${k}-${i}`} clip={toPlay(c)} />)}
      </div>
    </section>
  )
}

function BouchtaPanel({ b, highlight }: { b: BouchtaCard; highlight?: boolean }) {
  const k = cardCode(b.id)
  return (
    <section id={k} className={`rounded-2xl border bg-white p-3 ${highlight ? 'border-[#B8862F] ring-2 ring-[#B8862F]/40' : 'border-[#D6DCE8]'}`}>
      <div className="flex items-center justify-between px-1" dir="ltr">
        <span className="text-[14px] font-bold text-[#14306B]">Bouchta <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">بوشتى يسأل</span></span>
        <span className="rounded-md bg-[#B8862F] px-1.5 py-0.5 text-[11px] font-bold text-white">{k}</span>
      </div>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {bouchtaClips(b).map((c, i) => <PlayLine key={i} k={`${k}-${i}`} clip={toPlay(c)} />)}
      </div>
    </section>
  )
}

export default function CardsPage({ params }: { params: { code: string } }) {
  const m = params.code.toUpperCase().match(/^L(\d{1,2})(?:-(\d))?$|^B-(\d{2})$/)
  if (!m) notFound()
  const bouchta = m[3] ? BOUCHTA.find(b => b.id === `b-${m[3]}` && b.kind === 'silly') : undefined
  const n = bouchta ? bouchta.lesson! : Number(m[1])
  const lesson = CARD_LESSONS.find(l => l.n === n)
  if (!lesson) notFound()
  const cards = CARDS.filter(c => c.lesson === n)
  const scanned = m[2] ? cards.find(c => c.id === `${pad(n)}-${m[2]}`) : undefined
  if (m[2] && !scanned) notFound()
  const goats = BOUCHTA.filter(b => b.kind === 'silly' && b.lesson === n)

  return (
    <PlayShell title={`Lesson ${n}: ${lesson.titleEn}`} sub={`Play cards · بطاقات اللعب · ${lesson.titleAr}`} here={{ shelf: 'cards', lesson: n }}>
      {(scanned || bouchta) && <>
        <h2 className="-mb-2 text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">Your card <span className="font-arabic normal-case tracking-normal">· بطاقتك</span></h2>
        {scanned && <CardPanel card={scanned} highlight />}
        {bouchta && <BouchtaPanel b={bouchta} highlight />}
        <h2 className="-mb-2 mt-2 text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">All the cards of this lesson <span className="font-arabic normal-case tracking-normal">· كل بطاقات الدرس</span></h2>
      </>}
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.filter(c => c !== scanned).map(c => <CardPanel key={c.id} card={c} />)}
        {goats.filter(b => b !== bouchta).map(b => <BouchtaPanel key={b.id} b={b} />)}
      </div>
      <div className="grid grid-cols-2 gap-2" dir="ltr">
        {([[`/audio/book/${n}`, BookOpen, 'Course book', 'كتاب الدروس'], [`/audio/workbook/${n}`, PenLine, 'Workbook', 'دفتر التمارين']] as const).map(([href, Icon, en, ar]) => (
          <Link key={href} href={href} className="flex items-center gap-2 rounded-2xl border border-[#14306B] px-3 py-2.5 text-[#14306B]">
            <Icon size={18} /><span className="leading-tight"><span className="block text-[14px] font-bold">{en}</span><span className="font-arabic block text-[12px] text-[#5B6474]">{ar} · L{pad(n)}</span></span>
          </Link>
        ))}
      </div>
    </PlayShell>
  )
}
