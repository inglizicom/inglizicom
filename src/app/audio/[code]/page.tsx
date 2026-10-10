import { notFound } from 'next/navigation'
import { BOUCHTA, CARDS, CARD_LESSONS, GAMES, KEMELNI, type BouchtaCard, type PlayCard } from '@/data/level1-cards'
import { bouchtaClips, cardClips, cardCode, type CardClip } from '@/data/level1-audio'
import { Track, type PlayClip } from '../_player'
import { AudioShell, toPlay } from '../_shell'

/**
 * /audio/L13 — the play cards of a lesson: its nine cards and Bouchta's question.
 * /audio/L13-8 — the card whose QR code was scanned, first, then the lesson's other cards.
 * /audio/B-06 — one of Bouchta's silly questions, first.
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

/** A card on the page: its name, what it asks, and its lines (indexes into the player's list). */
interface Panel { code: string; name: string; nameAr: string; task?: [string, string]; first: number; count: number; gold?: boolean }

function CardPanel({ p, highlight }: { p: Panel; highlight?: boolean }) {
  const arOnly = p.task && /[؀-ۿ]/.test(p.task[0]) && !/[A-Za-z]/.test(p.task[0])
  return (
    <section className={`rounded-2xl bg-white p-3 ring-1 ${highlight ? 'ring-2 ring-[#B8862F]' : 'ring-[#D6DCE8]'}`}>
      <div className="flex items-center justify-between gap-2 px-1" dir="ltr">
        <span className="text-[14px] font-bold text-[#14306B]">{p.name} <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">{p.nameAr}</span></span>
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${p.gold ? 'bg-[#B8862F]' : 'bg-[#14306B]'}`}>{p.code}</span>
      </div>
      {p.task && (
        <div className="mt-1.5 rounded-xl bg-[#EEF2F9] px-3 py-2">
          <div className={`text-[14px] font-semibold text-[#1F2937] ${arOnly ? 'font-arabic text-right' : ''}`} dir={arOnly ? 'rtl' : 'ltr'}>{p.task[0]}</div>
          <div className="font-arabic text-[12.5px] text-[#5B6474]" dir="rtl">{p.task[1]}</div>
        </div>
      )}
      <div className="mt-1.5 flex flex-col gap-0.5">
        {Array.from({ length: p.count }, (_, j) => <Track key={j} i={p.first + j} />)}
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

  // The scanned card first, then the others: one list for the player.
  const order: (PlayCard | BouchtaCard)[] = [
    ...(scanned ? [scanned] : []), ...(bouchta ? [bouchta] : []),
    ...cards.filter(c => c !== scanned), ...goats.filter(b => b !== bouchta),
  ]
  const clips: PlayClip[] = []
  const panels: Panel[] = order.map(x => {
    const isCard = 'game' in x
    const code = cardCode(x.id)
    const lines: CardClip[] = isCard ? cardClips(x) : bouchtaClips(x)
    const first = clips.length
    const name = isCard ? GAMES[x.game].name : 'Bouchta'
    clips.push(...lines.map(c => toPlay(c, `Play cards › ${code} · ${name}`)))
    return isCard
      ? { code, name, nameAr: GAMES[x.game].ar, task: taskOf(x), first, count: lines.length }
      : { code, name, nameAr: 'بوشتى يسأل', first, count: lines.length, gold: true }
  })
  const top = scanned || bouchta ? 1 : 0

  return (
    <AudioShell crumbs={['Level 1', 'Play cards', `Lesson ${n}`]} title={`Lesson ${n}: ${lesson.titleEn}`} here={{ shelf: 'cards', lesson: n }} clips={clips}>
      {top > 0 && <>
        <h2 className="-mb-2 text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">Your card <span className="font-arabic normal-case tracking-normal">· بطاقتك</span></h2>
        <CardPanel p={panels[0]} highlight />
        <h2 className="-mb-2 mt-2 text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">All the cards of this lesson <span className="font-arabic normal-case tracking-normal">· كل بطاقات الدرس</span></h2>
      </>}
      <div className="grid gap-3 xl:grid-cols-2" dir="ltr">
        {panels.slice(top).map(p => <CardPanel key={p.code} p={p} />)}
      </div>
    </AudioShell>
  )
}
