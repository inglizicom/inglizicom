import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BOUCHTA, CARDS, CARD_LESSONS, GAMES, KEMELNI, type BouchtaCard, type PlayCard } from '@/data/level1-cards'
import { bookSections, bouchtaClips, cardClips, cardCode, clipUrl, type Clip } from '@/data/level1-audio'
import { Player, PlayAll, PlayLine, SpeedSwitch, type PlayClip } from '../_player'

/**
 * /play/L13 — a lesson of Level 1 to listen to: its nine cards, Bouchta's
 * question, then the book (words, phrases, conversations, reading).
 * /play/L13-8 — the card whose QR code was scanned, on top of its lesson.
 * /play/B-06 — one of Bouchta's silly questions, on top of its lesson.
 */

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const pad = (n: number) => String(n).padStart(2, '0')
const toPlay = (c: Clip & { label?: string }): PlayClip => ({
  en: c.en, ...(c.ar ? { ar: c.ar } : {}), ...(c.speaker ? { speaker: c.speaker } : {}), ...(c.label ? { label: c.label } : {}),
  slow: clipUrl(SUPA, c, 'slow'), normal: clipUrl(SUPA, c, 'normal'),
})

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
  return (
    <section id={k} className={`rounded-2xl border bg-white p-3 ${highlight ? 'border-[#B8862F] ring-2 ring-[#B8862F]/40' : 'border-[#D6DCE8]'}`}>
      <div className="flex items-center justify-between gap-2 px-1" dir="ltr">
        <span className="text-[14px] font-bold text-[#14306B]">{g.name} <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">{g.ar}</span></span>
        <span className="rounded-md bg-[#14306B] px-1.5 py-0.5 text-[11px] font-bold text-white">{k}</span>
      </div>
      <div className="mt-1.5 rounded-xl bg-[#EEF2F9] px-3 py-2" dir="ltr">
        <div className={`text-[14px] font-semibold text-[#1F2937] ${/[؀-ۿ]/.test(task) && !/[A-Za-z]/.test(task) ? 'font-arabic text-right' : ''}`} dir={/[؀-ۿ]/.test(task) && !/[A-Za-z]/.test(task) ? 'rtl' : 'ltr'}>{task}</div>
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
        <span className="text-[14px] font-bold text-[#14306B]">🐐 Bouchta <span className="font-arabic text-[12px] font-semibold text-[#5B6474]">بوشتى يسأل</span></span>
        <span className="rounded-md bg-[#B8862F] px-1.5 py-0.5 text-[11px] font-bold text-white">{k}</span>
      </div>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {bouchtaClips(b).map((c, i) => <PlayLine key={i} k={`${k}-${i}`} clip={toPlay(c)} />)}
      </div>
    </section>
  )
}

export default function PlayPage({ params }: { params: { code: string } }) {
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
  const book = bookSections(n)
  const prev = CARD_LESSONS.find(l => l.n === n - 1), next = CARD_LESSONS.find(l => l.n === n + 1)

  return (
    <Player>
      <header className="sticky top-0 z-10 bg-[#14306B] text-white shadow-md">
        <div className="mx-auto max-w-[680px] px-4 py-3 flex items-center justify-between gap-3" dir="ltr">
          <Link href="/play" className="leading-tight">
            <div className="text-[15px] font-bold">Inglizi<span className="text-[#D9AA52]">.com</span> · Level 1</div>
            <div className="text-[12px] text-white/75">Lesson {n} · {lesson.titleEn}</div>
          </Link>
          <SpeedSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-[680px] px-4 pb-16 pt-4 flex flex-col gap-4">
        {(scanned || bouchta) && <>
          <h1 className="text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">Your card <span className="font-arabic normal-case tracking-normal">· بطاقتك</span></h1>
          {scanned && <CardPanel card={scanned} highlight />}
          {bouchta && <BouchtaPanel b={bouchta} highlight />}
        </>}

        <div className="mt-2 flex items-baseline justify-between" dir="ltr">
          <h2 className="text-[20px] font-bold text-[#14306B]">Lesson {n}: {lesson.titleEn}</h2>
          <span className="font-arabic text-[15px] font-semibold text-[#B8862F]" dir="rtl">{lesson.titleAr}</span>
        </div>

        <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">The cards <span className="font-arabic normal-case tracking-normal">· البطاقات</span></h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.filter(c => c !== scanned).map(c => <CardPanel key={c.id} card={c} />)}
          {goats.filter(b => b !== bouchta).map(b => <BouchtaPanel key={b.id} b={b} />)}
        </div>

        <h3 className="mt-3 text-[13px] font-bold uppercase tracking-wide text-[#B8862F]" dir="ltr">From the book <span className="font-arabic normal-case tracking-normal">· من الكتاب</span></h3>
        {book.map((s, i) => {
          const clips = s.clips.map(c => toPlay(c))
          const k = `book-${i}`
          return (
            <section key={k} className="rounded-2xl border border-[#D6DCE8] bg-white p-3">
              <div className="flex items-center justify-between gap-2 px-1 pb-1" dir="ltr">
                <span className="text-[15px] font-bold text-[#14306B]">{s.title} <span className="font-arabic text-[12.5px] font-semibold text-[#5B6474]">{s.titleAr}</span></span>
                {(s.kind === 'talk' || s.kind === 'reading') && <PlayAll k={k} clips={clips} />}
              </div>
              <div className={s.kind === 'words' ? 'grid grid-cols-2 gap-0.5' : 'flex flex-col gap-0.5'}>
                {clips.map((c, j) => s.kind === 'talk' || s.kind === 'reading'
                  ? <PlayLine key={j} k={k} clip={c} list={clips} index={j} />
                  : <PlayLine key={j} k={`${k}-${j}`} clip={c} />)}
              </div>
            </section>
          )
        })}

        <nav className="mt-4 flex items-center justify-between text-[14px] font-semibold text-[#14306B]" dir="ltr">
          {prev ? <Link href={`/play/L${pad(prev.n)}`}>← Lesson {prev.n}</Link> : <span />}
          <Link href="/play" className="text-[#B8862F]">All lessons</Link>
          {next ? <Link href={`/play/L${pad(next.n)}`}>Lesson {next.n} →</Link> : <span />}
        </nav>
      </main>
    </Player>
  )
}
