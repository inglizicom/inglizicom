'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Eye, EyeOff, Gauge, Mic, Pause, Play, RotateCcw, Shuffle, X } from 'lucide-react'
import type { Part, Stop } from '@/data/viiza-book/types'
import { ScreenView } from '@/app/admin/level2-book/_screens'
import { REGION } from '@/app/admin/level2-book/_kit'
import { Practice } from './Practice'
import { Games } from './Games'
import { Ar, AudioProvider, Btn, Card, closeness, EN, Head, Ico, Mark, pad2, Pill, Say, useAudio, useFonts, useListen, useProgress, V } from './kit'

/**
 * One stop of VIIZA interactive: the printed book's six sections, in the
 * same order and with the same content, each made to be used rather than
 * read: every sentence plays, the vocabulary turns into flashcards, the
 * replies hide for practice, the conversation plays through or leaves the
 * traveller's lines to you, and the exercises check themselves. A seventh
 * tab holds the stop's games. Finishing the practice stamps the passport.
 */

export type Section = 'opener' | 'words' | 'exchanges' | 'real' | 'talk' | 'practice' | 'games'

export const SECTIONS: [Section, string, string, string][] = [
  ['opener', 'Flag', 'Opener', 'البداية'],
  ['words', 'BookA', 'Vocabulary', 'المفردات'],
  ['exchanges', 'ArrowLeftRight', 'You hear · You say', 'تسمع وتردّ'],
  ['real', 'Eye', 'In real life', 'في الواقع'],
  ['talk', 'MessagesSquare', 'Conversation', 'المحادثة'],
  ['practice', 'PenLine', 'Practice', 'التمارين'],
  ['games', 'Gamepad2', 'Games', 'الألعاب'],
]

interface Near { n: number; titleEn: string }

export function StopApp(props: { stop: Stop; part: Part; prev: Near | null; next: Near | null; clips: Record<string, string>; sample: boolean }) {
  useFonts()
  return <AudioProvider clips={props.clips}><Player {...props} /></AudioProvider>
}

function Player({ stop: s, part, prev, next, sample }: { stop: Stop; part: Part; prev: Near | null; next: Near | null; sample: boolean }) {
  const [sec, setSec] = useState<Section>('opener')
  const { progress, markSeen, markDone, setBest } = useProgress()
  const { slow, setSlow, stop } = useAudio()
  const at = SECTIONS.findIndex(x => x[0] === sec)
  const seen = progress.seen[s.n] ?? []
  const tabs = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Section
      if (SECTIONS.some(x => x[0] === h)) setSec(h)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])
  useEffect(() => {
    markSeen(s.n, sec)
    stop()
    tabs.current?.querySelector(`[data-sec="${sec}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [sec, s.n, markSeen, stop])

  const go = useCallback((k: Section) => {
    setSec(k)
    // Keep Next's own history state: the address only names the section, so a reload or a shared link opens it.
    window.history.replaceState(window.history.state, '', `#${k}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const [icon, en, ar] = SECTIONS[at].slice(1) as [string, string, string]

  return (
    <div className="min-h-screen" style={{ background: V.paper, color: V.ink, fontFamily: EN }}>
      <header className="sticky top-0 z-30 shadow-[0_2px_16px_rgba(0,0,0,0.18)]" style={{ background: V.navy }}>
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-2.5 sm:px-5" dir="ltr">
          <Link href="/viiza" className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold text-white/85 hover:bg-white/10"><ChevronLeft size={16} /> Journey</Link>
          <span className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-extrabold" style={{ background: V.red, color: '#fff' }}>STOP {pad2(s.n)}</span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-white sm:text-[16px]">{s.titleEn}</span>
          <button onClick={() => setSlow(!slow)} title="Slow audio" className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-extrabold"
            style={slow ? { background: V.saff, color: V.navy } : { color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Gauge size={14} /> {slow ? 'Slow' : 'Normal'}
          </button>
        </div>
        <div ref={tabs} className="no-scrollbar mx-auto flex max-w-5xl gap-1.5 overflow-x-auto px-3 pb-2.5 sm:px-5" dir="ltr">
          {SECTIONS.map(([k, ic, label], i) => {
            const on = k === sec, was = seen.includes(k)
            return (
              <button key={k} data-sec={k} onClick={() => go(k)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-extrabold transition"
                style={on ? { background: V.saff, color: V.navy } : { background: 'rgba(255,255,255,0.08)', color: was ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                {was && !on ? <Check size={13} strokeWidth={3} color={V.saff} /> : <Ico name={ic} size={14} />}
                <span>{k === 'games' ? label : `${i + 1} · ${label}`}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Where am I: the section, big */}
      <div style={{ background: `linear-gradient(90deg, ${V.navy2}, ${V.navy3})` }}>
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6" dir="ltr">
          <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl" style={{ background: V.saff }}><Ico name={icon} size={22} color={V.navy} stroke={2.3} /></span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[10.5px] font-extrabold tracking-[0.2em]" style={{ color: V.saff }}>{sec === 'games' ? 'BONUS · PLAY THE STOP' : `SECTION ${at + 1} OF 6`}</div>
            <div className="text-[17px] font-extrabold uppercase leading-tight tracking-[0.02em] text-white sm:text-[26px]">{en}</div>
          </div>
          <Ar as="span" className="shrink-0 text-[20px] font-extrabold sm:text-[24px]" style={{ color: V.saff }}>{ar}</Ar>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-3 pb-28 pt-5 sm:px-6">
        {sample && <Ar className="mb-4 rounded-xl px-4 py-2.5 text-[13.5px] font-bold" style={{ background: V.saffS, color: V.saffD }}>هذه المحطة عيّنة مجانية. ادخل رمزك في الصفحة الرئيسية لتفتح المحطات الـ34 كلها.</Ar>}
        {sec === 'opener' && <Opener s={s} part={part} />}
        {sec === 'words' && <Vocabulary s={s} />}
        {sec === 'exchanges' && <Exchanges s={s} />}
        {sec === 'real' && <RealLife s={s} />}
        {sec === 'talk' && <Talk s={s} onScore={v => setBest(`${s.n}:tf`, v)} />}
        {sec === 'practice' && <Practice s={s} done={progress.done.includes(s.n)} onScore={(k, v) => setBest(`${s.n}:${k}`, v)} onFinish={() => markDone(s.n)} />}
        {sec === 'games' && <Games s={s} best={progress.best} onScore={(k, v) => setBest(`${s.n}:${k}`, v)} />}
      </main>

      {/* Next / previous */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur" style={{ borderColor: V.line }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6" dir="ltr">
          {at > 0
            ? <button onClick={() => go(SECTIONS[at - 1][0])} className="flex min-w-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold" style={{ color: V.navy }}><ArrowLeft size={16} /> <span className="truncate">{SECTIONS[at - 1][2]}</span></button>
            : prev ? <Link href={`/viiza/${prev.n}`} className="flex min-w-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold" style={{ color: V.grey }}><ArrowLeft size={16} /> <span className="truncate">Stop {pad2(prev.n)}</span></Link> : <span />}
          <span className="hidden items-center gap-1 sm:flex">{SECTIONS.map(([k], i) => <span key={k} className="h-[7px] rounded-full transition-all" style={{ width: i === at ? 22 : 7, background: i === at ? V.red : seen.includes(k) ? V.navy : V.line }} />)}</span>
          {at < SECTIONS.length - 1
            ? <button onClick={() => go(SECTIONS[at + 1][0])} className="flex min-w-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-extrabold text-white" style={{ background: V.navy }}><span className="truncate">{SECTIONS[at + 1][2]}</span> <ArrowRight size={16} /></button>
            : next ? <Link href={`/viiza/${next.n}`} className="flex min-w-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-extrabold" style={{ background: V.saff, color: V.navy }}><span className="truncate">Next stop · {pad2(next.n)}</span> <ArrowRight size={16} /></Link> : <Link href="/viiza" className="rounded-xl px-4 py-2 text-[13px] font-extrabold text-white" style={{ background: V.navy }}>Journey</Link>}
        </div>
      </nav>
    </div>
  )
}

/* ── 1. Opener ──────────────────────────────────────────────────────── */

function RegionTag({ region }: { region: keyof typeof REGION }) {
  const r = REGION[region], solid = region !== 'all'
  return (
    <span className="inline-flex w-[66px] shrink-0 flex-col items-center rounded-lg py-1 leading-none" style={{ background: solid ? V.navy : '#fff', color: solid ? '#fff' : V.navy, border: `1.5px solid ${V.navy}` }}>
      <span className="text-[10px] font-extrabold tracking-[0.06em]">{r.en}</span>
      <Ar as="span" className="mt-0.5 text-[10px] font-bold" style={{ color: solid ? V.saff : V.grey }}>{r.ar}</Ar>
    </span>
  )
}

function Opener({ s, part }: { s: Stop; part: Part }) {
  const [ticked, setTicked] = useState<number[]>([])
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl p-5 text-white sm:p-7" style={{ background: `linear-gradient(135deg, ${V.red}, ${V.redD})` }} dir="ltr">
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-15"><Ico name={s.icon} size={180} color="#fff" stroke={1.2} /></div>
        <div className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: V.saff }}>PART {part.n} · {part.titleEn.toUpperCase()}</div>
        <div className="mt-1 flex items-end gap-4">
          <span className="text-[64px] font-extrabold leading-[0.85] tracking-[-0.04em] sm:text-[84px]" style={{ color: V.saff }}>{pad2(s.n)}</span>
          <div className="min-w-0 pb-1">
            <div className="text-[24px] font-extrabold leading-tight sm:text-[32px]">{s.titleEn}</div>
            <Ar className="text-left text-[17px] font-extrabold sm:text-[20px]" style={{ color: V.saff }}>{s.titleAr}</Ar>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card style={{ background: V.cream }}>
          <Head icon="MapPin" en="The situation" ar="الموقف" />
          <Ar className="text-[15px] font-semibold leading-[1.9]">{s.intro}</Ar>
        </Card>
        <Card>
          <Head icon="Target" en="After this stop" ar="بعد هذه المحطة" color={V.navy} />
          <div className="space-y-2.5">
            {s.canDo.map(([en, ar], i) => {
              const on = ticked.includes(i)
              return (
                <div key={en} className="flex items-start gap-3" dir="ltr">
                  <button onClick={() => setTicked(t => (on ? t.filter(x => x !== i) : [...t, i]))} className="mt-0.5 flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-lg border-2 transition"
                    style={on ? { background: V.green, borderColor: V.green } : { borderColor: V.line }} aria-label="I can do this">{on && <Check size={15} color="#fff" strokeWidth={3} />}</button>
                  <div className="min-w-0">
                    <Say text={en} className="text-[15px] font-bold" />
                    <Ar className="text-left text-[13px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card>
        <Head icon="Info" en="Know before you go" ar="اعرف قبل أن تسافر" color={V.navy} />
        <div className="space-y-2.5">
          {s.know.map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3" dir="rtl" style={{ background: i % 2 ? '#fff' : V.navyS }}>
              <RegionTag region={t.region} />
              <Ar className="flex-1 text-[14px] font-semibold leading-[1.8]">{t.text}</Ar>
            </div>
          ))}
        </div>
      </Card>

      {s.apps && s.apps.length > 0 && (
        <Card>
          <Head icon="Smartphone" en="Useful apps" ar="تطبيقات ومواقع مفيدة" color={V.navy} />
          <div className="flex flex-wrap gap-2" dir="ltr">
            {s.apps.map(([name, ar]) => (
              <span key={name} className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5" style={{ background: V.cream, border: `1px solid ${V.line}` }}>
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full" style={{ background: V.navy }}><Ico name="Smartphone" size={13} color="#fff" /></span>
                <span className="text-[13.5px] font-extrabold">{name}</span>
                <Ar as="span" className="text-[12px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-start gap-3 rounded-2xl p-4 sm:p-5" style={{ background: V.saffS, border: `1.5px solid ${V.saff}` }} dir="rtl">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full" style={{ background: V.saff }}><Ico name="Lightbulb" size={18} color={V.navy} /></span>
        <div>
          <div className="flex items-center gap-2"><Ar as="span" className="text-[15px] font-extrabold" style={{ color: V.saffD }}>نصيحة مسافر</Ar><span className="text-[11px] font-extrabold tracking-[0.12em]" style={{ color: V.saffD }}>PRO TIP</span></div>
          <Ar className="mt-1 text-[14.5px] font-semibold leading-[1.85]">{s.pro}</Ar>
        </div>
      </div>
    </div>
  )
}

/* ── 2. Vocabulary ──────────────────────────────────────────────────── */

interface FlashCard { en: string; ar: string; ex?: string; icon?: string; kind: string }

function Vocabulary({ s }: { s: Stop }) {
  const [mode, setMode] = useState<'list' | 'cards'>('list')
  const m = s.more
  const deck: FlashCard[] = [
    ...s.words.map(([en, ar, icon], i) => ({ en, ar, icon, ex: m?.examples[i], kind: 'Key word' })),
    ...(m?.actions ?? []).map(([en, ar, ex]) => ({ en, ar, ex, kind: 'Action word' })),
    ...(m?.partners ?? []).map(([en, ar, ex]) => ({ en, ar, ex, kind: 'Words together' })),
  ]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <Pill on={mode === 'list'} onClick={() => setMode('list')}><Ico name="List" size={14} /> All words</Pill>
        <Pill on={mode === 'cards'} onClick={() => setMode('cards')}><Ico name="Layers" size={14} /> Flashcards · {deck.length}</Pill>
        <Ar as="span" className="ml-auto text-[12.5px] font-semibold" style={{ color: V.grey }}>اضغط أي كلمة أو جملة لتسمعها</Ar>
      </div>

      {mode === 'cards' ? <Flashcards deck={deck} /> : (
        <>
          <Card>
            <Head icon="BookA" en="Key words" ar="الكلمات الأساسية" />
            <div className="grid gap-2.5 md:grid-cols-2" dir="ltr">
              {s.words.map(([en, ar, icon], i) => (
                <div key={en} className="flex items-start gap-3 rounded-xl p-3" style={{ border: `1px solid ${V.line}` }}>
                  <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl" style={{ background: V.redS }}><Ico name={icon} size={21} color={V.red} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Say text={en} className="text-[16px] font-extrabold" />
                      <Ar as="span" className="shrink-0 text-[13.5px] font-bold" style={{ color: V.red }}>{ar}</Ar>
                    </div>
                    {m?.examples[i] && <Say text={m.examples[i]} className="mt-1 text-[13.5px] font-medium" style={{ color: '#2A3150' }} iconColor={V.grey}><Mark text={m.examples[i]} word={en} /></Say>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {m && (
            <Card>
              <Head icon="Zap" en="Action words" ar="أفعال تحتاجها" color={V.navy} />
              <div className="grid gap-2.5 md:grid-cols-2" dir="ltr">
                {m.actions.map(([en, ar, ex]) => (
                  <div key={en} className="rounded-xl p-3" style={{ background: V.navyS }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <Say text={en} className="text-[16px] font-extrabold" style={{ color: V.navy }} />
                      <Ar as="span" className="shrink-0 text-[13.5px] font-bold" style={{ color: V.grey }}>{ar}</Ar>
                    </div>
                    <Say text={ex} className="mt-1 text-[13.5px] font-medium" style={{ color: '#2A3150' }} iconColor={V.grey}><Mark text={ex} word={en} /></Say>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {m && (
            <Card>
              <Head icon="Link" en="Words that go together" ar="كلمات تأتي معًا" color={V.saffD} />
              <div className="grid gap-2.5 md:grid-cols-2" dir="ltr">
                {m.partners.map(([en, ar, ex]) => (
                  <div key={en} className="rounded-xl p-3" style={{ background: V.saffS, border: `1px solid ${V.saff}` }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <Say text={en} className="text-[16px] font-extrabold" />
                      <Ar as="span" className="shrink-0 text-[13.5px] font-bold" style={{ color: V.grey }}>{ar}</Ar>
                    </div>
                    <Say text={ex} className="mt-1 text-[13.5px] font-medium" style={{ color: '#2A3150' }} iconColor={V.grey}><Mark text={ex} word={en} /></Say>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function Flashcards({ deck: start }: { deck: FlashCard[] }) {
  const { play } = useAudio()
  const [deck, setDeck] = useState(start)
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [known, setKnown] = useState<string[]>([])
  const c = deck[i]
  const left = deck.filter(d => !known.includes(d.en)).length
  useEffect(() => { if (c) play(c.en) }, [i]) // eslint-disable-line react-hooks/exhaustive-deps
  const move = (d: number) => { setFlip(false); setI(x => (x + d + deck.length) % deck.length) }
  const mark = (ok: boolean) => { if (ok) setKnown(k => (k.includes(c.en) ? k : [...k, c.en])); move(1) }

  if (!c) return null
  return (
    <div className="mx-auto max-w-xl" dir="ltr">
      <div className="mb-3 flex items-center justify-between text-[13px] font-bold" style={{ color: V.grey }}>
        <span>{i + 1} / {deck.length} · {c.kind}</span>
        <span style={{ color: V.green }}>{known.length} known · {left} to go</span>
      </div>
      <button type="button" onClick={() => setFlip(f => !f)} className="relative block h-[300px] w-full [perspective:1200px]">
        <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flip ? 'rotateY(180deg)' : 'none' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-6 text-white shadow-xl [backface-visibility:hidden]" style={{ background: `linear-gradient(150deg, ${V.navy}, ${V.navy3})` }}>
            {c.icon && <Ico name={c.icon} size={46} color={V.saff} stroke={1.6} />}
            <div className="mt-4 text-center text-[32px] font-extrabold leading-tight">{c.en}</div>
            <div className="mt-6 text-[12px] font-bold text-white/50">Tap to see the meaning</div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-6 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: V.cream, border: `2px solid ${V.saff}` }}>
            <Ar className="text-center text-[30px] font-extrabold" style={{ color: V.red }}>{c.ar}</Ar>
            {c.ex && <div className="mt-4 text-center text-[16px] font-semibold leading-snug" style={{ color: V.navy }}><Mark text={c.ex} word={c.en} /></div>}
          </div>
        </div>
      </button>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Btn tone="ghost" onClick={() => move(-1)}><ChevronLeft size={18} /></Btn>
        <Btn tone="ghost" onClick={() => play(flip && c.ex ? c.ex : c.en)}><Ico name="Volume2" size={17} /> Listen</Btn>
        <Btn tone="red" onClick={() => mark(false)}><RotateCcw size={16} /> Again</Btn>
        <Btn tone="green" onClick={() => mark(true)}><Check size={17} /> I know it</Btn>
        <Btn tone="ghost" onClick={() => { setDeck(d => [...d].sort(() => Math.random() - 0.5)); setI(0); setFlip(false) }}><Shuffle size={16} /></Btn>
      </div>
    </div>
  )
}

/* ── 3. You hear · You say ──────────────────────────────────────────── */

function MicCheck({ model }: { model: string }) {
  const { ok, busy, listen } = useListen()
  const [said, setSaid] = useState<string | null>(null)
  if (!ok) return null
  const score = said ? closeness(said, model) : 0
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2" dir="ltr">
      <button type="button" onClick={async () => setSaid(await listen())} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
        style={busy ? { background: V.red, color: '#fff' } : { background: '#fff', color: V.red, border: `1.5px solid ${V.red}` }}>
        <Mic size={13} /> {busy ? 'Listening…' : 'Say it'}
      </button>
      {said !== null && !busy && (
        <span className="text-[12px] font-bold" style={{ color: score >= 0.7 ? V.green : V.saffD }}>
          {said ? `${score >= 0.7 ? 'Great!' : 'Almost.'} You said: “${said}”` : 'I did not hear you. Try again.'}
        </span>
      )}
    </div>
  )
}

function Bubble({ en, ar, side, hidden, onReveal, practice }: { en: string; ar: string; side: 'them' | 'you'; hidden?: boolean; onReveal?: () => void; practice?: boolean }) {
  const them = side === 'them'
  return (
    <div className={`rounded-2xl p-3 ${them ? 'rounded-tl-md' : 'rounded-tr-md'}`} dir="ltr"
      style={{ background: them ? V.navyS : V.redS, borderLeft: them ? `4px solid ${V.navy}` : undefined, borderRight: them ? undefined : `4px solid ${V.red}` }}>
      <div className="mb-1 text-[10px] font-extrabold tracking-[0.14em]" style={{ color: them ? V.navy : V.red }}>{them ? 'THEY SAY' : 'YOU SAY'}</div>
      {hidden ? (
        <button type="button" onClick={onReveal} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-[13px] font-bold" style={{ borderColor: V.red, color: V.red }}>
          <Eye size={15} /> Your turn: think, say it, then tap to check
        </button>
      ) : <Say text={en} className="text-[15px] font-bold" />}
      <Ar className="mt-0.5 text-left text-[13px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
      {practice && !hidden && side === 'you' && <MicCheck model={en} />}
    </div>
  )
}

function Exchanges({ s }: { s: Stop }) {
  const m = s.more
  const { play, stop } = useAudio()
  const [practice, setPractice] = useState(false)
  const [shown, setShown] = useState<string[]>([])
  const [running, setRunning] = useState<string | null>(null)
  const runId = useRef(0)
  if (!m) return null

  const playAll = async (key: string, pairs: [string, string][]) => {
    if (running === key) { runId.current++; stop(); setRunning(null); return }
    const id = ++runId.current
    setRunning(key)
    for (const [a, b] of pairs) {
      if (runId.current !== id) return
      await play(a)
      if (runId.current !== id) return
      await new Promise(r => setTimeout(r, 400))
      await play(b)
      await new Promise(r => setTimeout(r, 700))
    }
    if (runId.current === id) setRunning(null)
  }

  const block = (key: string, title: [string, string], icon: string, color: string, rows: { first: [string, string]; reply: [string, string] }[], theyFirst: boolean) => (
    <Card>
      <Head icon={icon} en={title[0]} ar={title[1]} color={color} />
      <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
        <Btn tone={running === key ? 'red' : 'navy'} onClick={() => playAll(key, rows.map(r => [r.first[0], r.reply[0]]))}>{running === key ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play all</>}</Btn>
      </div>
      <div className="space-y-3">
        {rows.map((r, i) => {
          const k = `${key}${i}`
          const youFirst = !theyFirst
          const hideFirst = practice && youFirst && !shown.includes(k)
          const hideReply = practice && theyFirst && !shown.includes(k)
          return (
            <div key={k} className="grid items-stretch gap-2 md:grid-cols-[1fr_28px_1fr]">
              <Bubble en={r.first[0]} ar={r.first[1]} side={theyFirst ? 'them' : 'you'} hidden={hideFirst} onReveal={() => setShown(x => [...x, k])} practice={practice} />
              <span className="hidden items-center justify-center md:flex"><ArrowRight size={18} color={V.grey} /></span>
              <Bubble en={r.reply[0]} ar={r.reply[1]} side={theyFirst ? 'you' : 'them'} hidden={hideReply} onReveal={() => setShown(x => [...x, k])} practice={practice} />
            </div>
          )
        })}
      </div>
    </Card>
  )

  const restSay = s.say.slice(m.answers.length), restHear = s.hear.slice(m.replies.length)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl p-3" dir="ltr" style={{ background: practice ? V.redS : '#fff', border: `1.5px solid ${practice ? V.red : V.line}` }}>
        <button onClick={() => { setPractice(p => !p); setShown([]) }} className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-extrabold"
          style={practice ? { background: V.red, color: '#fff' } : { background: V.navy, color: '#fff' }}>
          {practice ? <EyeOff size={16} /> : <Eye size={16} />} Practice mode: {practice ? 'ON' : 'OFF'}
        </button>
        <Ar as="span" className="text-[13px] font-semibold" style={{ color: V.grey }}>{practice ? 'جملتك مخفية: فكّر فيها وقلها بصوت عالٍ، ثم اكشفها لتتأكد.' : 'شغّل وضع التدريب لتخفي ما تقوله أنت وتتدرّب على الرد.'}</Ar>
      </div>
      {block('hear', ['You hear → you reply', 'تسمع، فتردّ'], 'Ear', V.navy, m.replies.map((r, i) => ({ first: s.hear[i], reply: r })), true)}
      {block('say', ['You say → they reply', 'تقول، فيردّون'], 'MessageSquare', V.red, m.answers.map((a, i) => ({ first: s.say[i], reply: a })), false)}
      {(restSay.length > 0 || restHear.length > 0) && (
        <Card>
          <Head icon="Plus" en="More to say, more to hear" ar="جمل أخرى تقولها وتسمعها" color={V.saffD} />
          <div className="grid gap-4 md:grid-cols-2" dir="ltr">
            {[{ rows: restSay, label: 'YOU SAY', color: V.red }, { rows: restHear, label: 'YOU HEAR', color: V.navy }].map(col => (
              <div key={col.label}>
                <div className="mb-1.5 text-[10.5px] font-extrabold tracking-[0.14em]" style={{ color: col.color }}>{col.label}</div>
                <div className="space-y-2">
                  {col.rows.map(([en, ar]) => (
                    <div key={en} className="border-b pb-2 last:border-0" style={{ borderColor: V.line }}>
                      <Say text={en} className="text-[14.5px] font-bold" />
                      <Ar className="text-left text-[12.5px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ── 4. In real life ────────────────────────────────────────────────── */

/** The printed screen, scaled to fit any width. */
function Fit({ width = 714, children }: { width?: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1), [h, setH] = useState<number | undefined>()
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current
    if (!o || !i) return
    const ro = new ResizeObserver(() => { const sc = Math.min(1, o.clientWidth / width); setScale(sc); setH(i.offsetHeight * sc) })
    ro.observe(o); ro.observe(i)
    return () => ro.disconnect()
  }, [width])
  return <div ref={outer} dir="ltr" style={{ height: h, maxWidth: width, margin: "0 auto" }}><div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div></div>
}

function RealLife({ s }: { s: Stop }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2" dir="ltr">
          <span className="text-[15px] font-extrabold" style={{ color: V.navy }}>{s.screen.caption[0]}</span>
          <Ar as="span" className="text-[13.5px] font-semibold" style={{ color: V.grey }}>{s.screen.caption[1]}</Ar>
        </div>
        <Fit><ScreenView s={s.screen} /></Fit>
      </Card>
      <Card>
        <Head icon="TriangleAlert" en="Watch out" ar="انتبه" color={V.navy} />
        <div className="space-y-2.5">
          {s.watch.map(([wrong, right, why]) => (
            <div key={wrong} className="grid gap-2 rounded-xl p-3 md:grid-cols-[1fr_1fr_1.1fr] md:items-center" style={{ background: V.navyS }} dir="ltr">
              <span className="flex items-start gap-1.5 text-[14px] font-semibold" style={{ color: '#8B93A7' }}><X size={16} color={V.red} strokeWidth={3} className="mt-0.5 shrink-0" /><span className="line-through">{wrong}</span></span>
              <span className="flex items-start gap-1.5"><Check size={16} color={V.green} strokeWidth={3} className="mt-1 shrink-0" /><Say text={right} className="text-[14.5px] font-extrabold" /></span>
              <Ar className="text-[13px] font-semibold leading-[1.7]" style={{ color: V.grey }}>{why}</Ar>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ── 5. Conversation ────────────────────────────────────────────────── */

const VOICES = [V.red, V.navy, V.saffD]

function Talk({ s, onScore }: { s: Stop; onScore: (v: number) => void }) {
  const { play, stop, playing } = useAudio()
  const cast = Object.keys(s.talk.cast)
  const me = cast[0]
  const [roleplay, setRoleplay] = useState(false)
  const [revealed, setRevealed] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const [cue, setCue] = useState<number | null>(null)
  const runId = useRef(0)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})

  const run = async () => {
    if (running) { runId.current++; stop(); setRunning(false); setCue(null); return }
    const id = ++runId.current
    setRunning(true)
    for (let i = 0; i < s.talk.lines.length; i++) {
      if (runId.current !== id) return
      const [who, en] = s.talk.lines[i]
      if (roleplay && who === me) {
        setCue(i)
        await new Promise(r => setTimeout(r, 1600 + en.length * 70))
        setCue(null)
      } else await play(en)
      await new Promise(r => setTimeout(r, 350))
    }
    if (runId.current === id) setRunning(false)
  }

  const check = s.more?.check ?? []
  const score = check.filter(([, t], i) => answers[i] === t).length
  useEffect(() => { if (check.length && Object.keys(answers).length === check.length) onScore(score) }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2" dir="ltr">
          <span className="flex items-center gap-1.5 text-[13.5px] font-bold" style={{ color: V.grey }}><Ico name="MapPin" size={15} color={V.red} /> {s.talk.place}</span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            {cast.map((who, i) => (
              <span key={who} className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold" style={{ background: [V.redS, V.navyS, V.saffS][i % 3], color: VOICES[i % 3] }}>{who} · <Ar as="span">{s.talk.cast[who]}</Ar></span>
            ))}
          </span>
        </div>
        <div className="flex flex-wrap gap-2" dir="ltr">
          <Btn tone={running ? 'red' : 'navy'} onClick={run}>{running ? <><Pause size={16} /> Stop</> : <><Play size={16} /> {roleplay ? `Act it out as ${me}` : 'Play the conversation'}</>}</Btn>
          <Btn tone={roleplay ? 'red' : 'ghost'} onClick={() => { setRoleplay(r => !r); setRevealed([]) }}><Ico name="Drama" size={16} /> Role-play: {roleplay ? 'ON' : 'OFF'}</Btn>
        </div>
        {roleplay && <Ar className="mt-2 text-[13px] font-semibold" style={{ color: V.red }}>{`أنت ${s.talk.cast[me]}: جملك مخفية. عندما يحين دورك قلها بصوت عالٍ، ثم اكشفها لتتأكد.`}</Ar>}
      </Card>

      <div className="space-y-2.5" dir="ltr">
        {s.talk.lines.map(([who, en, ar], i) => {
          const mine = who === me
          const color = VOICES[Math.max(0, cast.indexOf(who)) % 3]
          const hide = roleplay && mine && !revealed.includes(i)
          const live = playing === en || cue === i
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl p-3 transition sm:max-w-[75%] ${mine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{ background: mine ? V.redS : '#fff', boxShadow: live ? `0 0 0 3px ${V.saff}` : '0 2px 10px rgba(14,18,64,0.06)' }}>
                <div className="mb-1 text-[10.5px] font-extrabold tracking-[0.1em]" style={{ color }}>{who}</div>
                {hide ? (
                  <button onClick={() => setRevealed(r => [...r, i])} className="flex items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-[13px] font-bold" style={{ borderColor: V.red, color: V.red }}>
                    <Mic size={15} /> {cue === i ? 'Your turn — say it now!' : 'Your line · tap to reveal'}
                  </button>
                ) : <Say text={en} className="text-[15px] font-semibold" />}
                <Ar className="mt-0.5 text-left text-[12.5px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
              </div>
            </div>
          )
        })}
      </div>

      {check.length > 0 && (
        <Card>
          <Head icon="CircleCheck" en="Did you understand?" ar="هل فهمت؟ صحيح أم خطأ" color={V.navy} />
          <div className="space-y-2.5">
            {check.map(([t, truth], i) => {
              const a = answers[i]
              const answered = a !== undefined
              return (
                <div key={i} className="flex flex-wrap items-center gap-3 rounded-xl p-3" dir="ltr" style={{ background: answered ? (a === truth ? V.greenS : V.redS) : V.cream }}>
                  <span className="w-[20px] text-[14px] font-extrabold" style={{ color: V.red }}>{i + 1}</span>
                  <Say text={t} className="min-w-0 flex-1 text-[14.5px] font-semibold" />
                  <span className="flex gap-1.5">
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setAnswers(x => ({ ...x, [i]: v }))}
                        className="rounded-lg px-3 py-1.5 text-[12.5px] font-extrabold transition"
                        style={a === v ? { background: v === truth ? V.green : V.red, color: '#fff' } : { background: '#fff', color: V.navy, border: `1.5px solid ${V.line}` }}>
                        {v ? 'True' : 'False'}
                      </button>
                    ))}
                  </span>
                  {answered && <span className="w-full text-[12px] font-bold" style={{ color: a === truth ? V.green : V.red }}>{a === truth ? '✓ Correct' : `✗ It's ${truth ? 'true' : 'false'}. Listen again.`}</span>}
                </div>
              )
            })}
          </div>
          {Object.keys(answers).length === check.length && (
            <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3" dir="ltr" style={{ background: V.navy, color: '#fff' }}>
              <span className="text-[15px] font-extrabold">Score: {score} / {check.length}</span>
              <button onClick={() => setAnswers({})} className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: V.saff }}><RotateCcw size={14} /> Try again</button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
