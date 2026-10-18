'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Check, ChevronLeft, Headphones, RotateCcw, X } from 'lucide-react'
import { Ar, AudioProvider, Btn, EN, Ico, Say, useAudio, useFonts, useProgress, V } from './kit'

/**
 * The part check: ten questions at the end of a part, made fresh from its
 * stops each time: four "what do you reply?", three "what does it mean?"
 * and three "listen and choose". Seven or more earns the part's seal in
 * the passport; the best score is kept. The same check serves PIIRMI
 * interactive's reviews (its book, base path and labels passed in).
 */

/** Which book the check belongs to, and how it names its parts and units. */
export interface CheckBook { product: 'viiza' | 'piirmi'; base: string; part: string; unit: string; reviewHash: string }
const VIIZA_BOOK: CheckBook = { product: 'viiza', base: '/viiza', part: 'Part', unit: 'Stop', reviewHash: 'exchanges' }

export interface CheckPool {
  replies: { cue: string; cueAr: string; reply: string; replyAr: string; stop: number }[]
  words: { en: string; ar: string; stop: number }[]
  lines: { en: string; ar: string; stop: number }[]
}

type Q =
  | { kind: 'reply'; cue: string; cueAr: string; options: string[]; answer: string }
  | { kind: 'meaning'; word: string; options: string[]; answer: string }
  | { kind: 'listen'; line: string; options: string[]; answer: string }

export const PASS = 7

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const pick = <T,>(a: T[], n: number) => shuffle(a).slice(0, n)
const others = (all: string[], right: string, n: number) => pick([...new Set(all.filter(x => x !== right))], n)

function makeQuestions(p: CheckPool): Q[] {
  const replies = p.replies.map(r => r.reply), meanings = p.words.map(w => w.ar), lines = p.lines.map(l => l.en)
  return shuffle<Q>([
    ...pick(p.replies, 4).map(r => ({ kind: 'reply' as const, cue: r.cue, cueAr: r.cueAr, answer: r.reply, options: shuffle([r.reply, ...others(replies, r.reply, 2)]) })),
    ...pick(p.words, 3).map(w => ({ kind: 'meaning' as const, word: w.en, answer: w.ar, options: shuffle([w.ar, ...others(meanings, w.ar, 2)]) })),
    ...pick(p.lines, 3).map(l => ({ kind: 'listen' as const, line: l.en, answer: l.en, options: shuffle([l.en, ...others(lines, l.en, 2)]) })),
  ])
}

export function PartCheck({ book = VIIZA_BOOK, ...props }: { part: { n: number; titleEn: string; titleAr: string; icon: string }; stops: { n: number; titleEn: string }[]; pool: CheckPool; clips: Record<string, string>; book?: CheckBook }) {
  useFonts()
  return <AudioProvider clips={props.clips}><Quiz {...props} book={book} /></AudioProvider>
}

function Quiz({ part, stops, pool, book }: { part: { n: number; titleEn: string; titleAr: string; icon: string }; stops: { n: number; titleEn: string }[]; pool: CheckPool; book: CheckBook }) {
  const { play } = useAudio()
  const { progress, setBest } = useProgress(book.product)
  const [round, setRound] = useState(0)
  // Made in the browser only (random), so the server's render and the browser's agree.
  const [qs, setQs] = useState<Q[]>([])
  useEffect(() => { setQs(makeQuestions(pool)) }, [pool, round])
  const [i, setI] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const q = qs[i]
  const end = qs.length > 0 && i >= qs.length
  const best = progress.best[`part:${part.n}`]

  useEffect(() => { if (q?.kind === 'listen') play(q.line); if (q?.kind === 'reply') play(q.cue) }, [i, qs]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (end) setBest(`part:${part.n}`, score) }, [end]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (o: string) => { if (chosen) return; setChosen(o); if (o === q.answer) setScore(x => x + 1) }
  const next = () => { setChosen(null); setI(x => x + 1) }
  const again = () => { setRound(r => r + 1); setI(0); setScore(0); setChosen(null) }

  return (
    <div className="min-h-screen" style={{ background: V.paper, color: V.ink, fontFamily: EN }}>
      <header style={{ background: V.navy }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3" dir="ltr">
          <Link href={book.base} className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold text-white/85 hover:bg-white/10"><ChevronLeft size={16} /> Journey</Link>
          <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-white">{book.part} {part.n} check · {part.titleEn}</span>
          {best !== undefined && <span className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold" style={{ background: V.saff, color: V.navy }}>Best {best}/10</span>}
        </div>
        {!end && <div className="h-1.5" style={{ background: V.navy3 }}><div className="h-full transition-all" style={{ width: `${(i / qs.length) * 100}%`, background: V.saff }} /></div>}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {!q && !end ? <div className="py-20 text-center text-[14px] font-bold" style={{ color: V.grey }}>…</div> : end ? (
          <div className="rounded-3xl p-6 text-center shadow-[0_6px_30px_rgba(14,18,64,0.12)] sm:p-10" style={{ background: '#fff' }} dir="ltr">
            {score >= PASS ? (
              <div className="mx-auto flex h-[130px] w-[130px] -rotate-6 flex-col items-center justify-center rounded-full" style={{ border: `5px double ${V.saffD}`, background: V.saffS, color: V.saffD, animation: 'vz-stamp .5s ease-out' }}>
                <Award size={36} />
                <span className="mt-1 text-[12px] font-extrabold tracking-[0.1em]">{book.part.toUpperCase()} {part.n}</span>
                <span className="text-[10px] font-extrabold tracking-[0.1em]">PASSED</span>
              </div>
            ) : <Ico name={part.icon} size={52} color={V.navy} />}
            <div className="mt-5 text-[30px] font-extrabold">{score} / {qs.length}</div>
            <div className="mt-1 text-[17px] font-bold" style={{ color: score >= PASS ? V.green : V.saffD }}>{score >= PASS ? `${book.part} passed! The seal is in your passport.` : `${PASS} or more to pass. Review the stops and try again.`}</div>
            <Ar className="mt-2 text-[14px] font-semibold" style={{ color: V.grey }}>{score >= PASS ? 'أحسنت! ختم الجزء في جوازك الآن.' : 'راجع المحطات ثم حاول مرة أخرى: الأسئلة تتغيّر في كل محاولة.'}</Ar>
            {score < PASS && (
              <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
                {stops.map(s => <Link key={s.n} href={`${book.base}/${s.n}#${book.reviewHash}`} className="rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: V.navyS, color: V.navy }}>{book.unit} {s.n} · {s.titleEn}</Link>)}
              </div>
            )}
            <div className="mt-6 flex justify-center gap-2">
              <Btn tone="ghost" onClick={again}><RotateCcw size={16} /> Try again</Btn>
              <Link href={book.base} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-extrabold text-white" style={{ background: V.navy }}>Journey</Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-5 shadow-[0_6px_30px_rgba(14,18,64,0.12)] sm:p-7" style={{ background: '#fff' }}>
            <div className="mb-4 flex items-center justify-between text-[12.5px] font-extrabold tracking-[0.1em]" dir="ltr" style={{ color: V.grey }}>
              <span>QUESTION {i + 1} OF {qs.length}</span><span style={{ color: V.green }}>{score} correct</span>
            </div>

            {q.kind === 'reply' && (
              <div dir="ltr">
                <div className="text-[13px] font-extrabold tracking-[0.1em]" style={{ color: V.red }}>THEY SAY · WHAT DO YOU REPLY?</div>
                <div className="mt-2 rounded-2xl p-4" style={{ background: V.navyS, borderLeft: `4px solid ${V.navy}` }}>
                  <Say text={q.cue} className="text-[19px] font-extrabold" />
                  <Ar className="mt-1 text-left text-[13.5px] font-semibold" style={{ color: V.grey }}>{q.cueAr}</Ar>
                </div>
              </div>
            )}
            {q.kind === 'meaning' && (
              <div className="text-center" dir="ltr">
                <div className="text-[13px] font-extrabold tracking-[0.1em]" style={{ color: V.red }}>WHAT DOES IT MEAN?</div>
                <Say text={q.word} className="mt-3 text-[32px] font-extrabold" />
              </div>
            )}
            {q.kind === 'listen' && (
              <div className="text-center" dir="ltr">
                <div className="text-[13px] font-extrabold tracking-[0.1em]" style={{ color: V.red }}>LISTEN AND CHOOSE</div>
                <button onClick={() => play(q.line)} className="mx-auto mt-3 flex h-[84px] w-[84px] items-center justify-center rounded-full shadow-lg transition active:scale-95" style={{ background: V.navy, color: V.saff }}><Headphones size={36} /></button>
                <div className="mt-2 text-[12px] font-bold" style={{ color: V.grey }}>Tap to listen again</div>
              </div>
            )}

            <div className="mt-5 grid gap-2.5">
              {q.options.map(o => {
                const isRight = o === q.answer, isMine = o === chosen
                const style = chosen ? (isRight ? { borderColor: V.green, background: V.greenS } : isMine ? { borderColor: V.red, background: V.redS } : { borderColor: V.line, opacity: 0.55 }) : { borderColor: V.line }
                return (
                  <button key={o} onClick={() => choose(o)} className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left transition active:scale-[0.99]" style={style} dir={q.kind === 'meaning' ? 'rtl' : 'ltr'}>
                    {q.kind === 'meaning' ? <Ar as="span" className="flex-1 text-[17px] font-bold">{o}</Ar> : <span className="flex-1 text-[16px] font-bold">{o}</span>}
                    {chosen && isRight && <Check size={20} color={V.green} strokeWidth={3} />}
                    {chosen && isMine && !isRight && <X size={20} color={V.red} strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
            {chosen && (
              <div className="mt-4 flex justify-end" dir="ltr">
                <Btn tone={chosen === q.answer ? 'green' : 'red'} onClick={next}>{i + 1 < qs.length ? 'Next question' : 'See my score'}</Btn>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
