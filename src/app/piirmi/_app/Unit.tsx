'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, Eye, EyeOff, Gauge, Maximize, Mic, Minimize, Pause, Play, Sparkles } from 'lucide-react'
import type { EverydayPage, EverydayUnit, UnitExtras, UnitOpener } from '@/data/everyday-book'
import { AVATARS, KIND_TONE, TONES, extraPhotoOf, photoOf, type Tone } from '@/data/everyday-book/tones'
import { DEFAULT_INFO, LessonPage, type BookInfo } from '@/app/admin/level1-book/_blocks'
import { UnitOpenerPage } from '@/app/admin/everyday-book/_pages'
import { BOOK_FONT_VARS, EN_FONT } from '@/app/admin/everyday-book/_fonts'
import { Ar, AudioProvider, Btn, Card, closeness, EN, Head, Ico, pad2, Pill, Say, useAudio, useFonts, useFullscreen, useListen, useProgress, useStageZoom, V } from '../../viiza/_app/kit'
import { Flashcards, MicCheck, type FlashCard } from '../../viiza/_app/Stop'
import { PagedBook, sentenceMap, type BookPage } from '../../viiza/_app/Book'
import { GamesPanel } from '../../viiza/_app/Games'
import { fromJson } from './serial'
import { P } from './theme'

/**
 * One unit of PIIRMI interactive: the printed unit's sections, in the same
 * order and with the same content, each made to be used: every word with
 * its photograph plays and turns into flashcards; the useful expressions
 * hide their answers for practice and check them with the microphone; the
 * conversation plays through or leaves a role to you; the reading plays
 * sentence by sentence and its questions check themselves; «Your turn» and
 * «Make it yours» are written (or spoken) on the screen. A seventh tab holds
 * the games, and finishing the practice sticks the unit's sticker in the
 * album. Book view shows the unit's printed pages.
 */

type Section = 'opener' | 'words' | 'expressions' | 'talk' | 'reading' | 'practice' | 'games'
const SECTIONS: [Section, string, string, string][] = [
  ['opener', 'Flag', 'Opener', 'البداية'],
  ['words', 'BookA', 'Vocabulary', 'المفردات'],
  ['expressions', 'MessageCircle', 'Useful expressions', 'عبارات مفيدة'],
  ['talk', 'MessagesSquare', 'Conversation', 'المحادثة'],
  ['reading', 'BookOpenText', 'Reading', 'القراءة'],
  ['practice', 'PenLine', 'Make it yours', 'اجعلها خاصة بك'],
  ['games', 'Gamepad2', 'Games', 'الألعاب'],
]
const KIND_LABEL: Record<string, string> = { opener: 'Opener', vocab: 'Vocabulary', expressions: 'Useful expressions', talk: 'Conversation', reading: 'Reading' }
const KIND_SECTION: Record<string, Section> = { opener: 'opener', vocab: 'words', expressions: 'expressions', talk: 'talk', reading: 'reading' }

const ARABIC = /[؀-ۿ]/
/** "English - العربية" → [English, Arabic]; a line in one language → that half alone. */
function halves(s: string): [string | null, string | null] {
  const i = s.lastIndexOf(' - ')
  if (i > 0 && ARABIC.test(s.slice(i)) && !ARABIC.test(s.slice(0, i))) return [s.slice(0, i).trim(), s.slice(i + 3).trim()]
  return ARABIC.test(s) ? [null, s] : [s, null]
}
const lineOf = (l: string) => { const m = l.match(/^([^:]+):\s*(.*)$/); return m ? { who: m[1].trim(), text: m[2].trim() } : { who: '', text: l } }
const sentences = (p: string) => p.split(/(?<=[.!?])\s+(?=[A-Z"“'])/).filter(Boolean)

interface Near { n: number; titleEn: string }

export function UnitApp(props: {
  unit: EverydayUnit; opener: UnitOpener; extras: UnitExtras; review: number; prev: Near | null; next: Near | null; sample: boolean
  pagesJson: string; pageNos: number[]; parts: { vocab: number; expressions: number; talk: number; reading: number }
}) {
  useFonts()
  return <AudioProvider clips={{}}><Player {...props} /></AudioProvider>
}

const BOOK_INFO: BookInfo = { ...DEFAULT_INFO, title: 'الإنجليزية للمواقف اليومية', level: 'PIIRMI · A1 → A2', ink: '#0E1240', fontEn: EN_FONT }
const PAGE_VARS = { ...BOOK_FONT_VARS, '--hl': TONES.vocab.m, '--key': TONES.expr.m, '--key-s': TONES.expr.s } as CSSProperties

function Player({ unit: u, opener, extras: x, review, prev, next, sample, pagesJson, pageNos, parts }: Parameters<typeof UnitApp>[0]) {
  const [sec, setSec] = useState<Section>('opener')
  const [book, setBook] = useState(false)
  const { progress, markSeen, markDone, setBest } = useProgress('piirmi')
  const { slow, setSlow, stop } = useAudio()
  const fs = useFullscreen()
  const zoom = useStageZoom(fs.on)
  const at = SECTIONS.findIndex(s => s[0] === sec)
  const seen = progress.seen[u.n] ?? []
  const tabs = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1)
      if (h === 'book') setBook(true)
      else if (SECTIONS.some(s => s[0] === h)) setSec(h as Section)
    }
    fromHash()
    if (!window.location.hash) { try { if (localStorage.getItem('piirmi.mode') === 'book') setBook(true) } catch {} }
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])
  useEffect(() => {
    markSeen(u.n, sec)
    stop()
    tabs.current?.querySelector(`[data-sec="${sec}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [sec, u.n, markSeen, stop])

  const go = useCallback((k: Section) => {
    setSec(k)
    window.history.replaceState(window.history.state, '', `#${k}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Book view: the unit's printed pages.
  const pages = useMemo(() => fromJson<EverydayPage[]>(pagesJson), [pagesJson])
  const bookPages: BookPage[] = useMemo(() => pages.map((p, i) => ({
    label: KIND_LABEL[p.kind] ?? p.kind,
    node: (
      <div style={PAGE_VARS}>
        {p.kind === 'opener'
          ? <UnitOpenerPage info={BOOK_INFO} unit={u} opener={opener} parts={parts} pageNo={pageNos[i]} filename={`piirmi-unit-${u.n}-opener`} />
          : <LessonPage info={BOOK_INFO} lesson={p} pageNo={pageNos[i]} talkNo={new Map()} spread filename={`piirmi-unit-${u.n}-${p.kind}-${i}`}
              colour={TONES[KIND_TONE[p.kind]]} toneOf={b => ('tone' in b && b.tone ? TONES[b.tone as Tone] : undefined)} />}
      </div>
    ),
  })), [pages, pageNos, u, opener, parts])
  const known = useMemo(() => sentenceMap([
    ...u.vocab.map(v => v[1]), ...u.expressions.flatMap(e => [e[0], e[1]]), ...u.talk.map(l => lineOf(l).text),
    ...u.reading.body.flatMap(sentences), ...x.questions, ...x.extra.map(e => e[1]),
  ]), [u, x])
  const openBook = () => { stop(); setBook(true); window.history.replaceState(window.history.state, '', '#book'); try { localStorage.setItem('piirmi.mode', 'book') } catch {} }
  const closeBook = (page: number) => {
    stop(); setBook(false)
    const k = KIND_SECTION[pages[page]?.kind] ?? 'opener'
    setSec(k)
    window.history.replaceState(window.history.state, '', `#${k}`)
    try { localStorage.setItem('piirmi.mode', 'app') } catch {}
  }
  const bookStart = Math.max(0, pages.findIndex(p => KIND_SECTION[p.kind] === sec))
  const [icon, en, ar] = SECTIONS[at].slice(1) as [string, string, string]

  return (
    <>
      {book && <PagedBook badge={`UNIT ${pad2(u.n)}`} pages={bookPages} known={known} start={bookStart} onExit={closeBook}
        prev={prev && { href: `/piirmi/${prev.n}#book`, label: `Unit ${pad2(prev.n)}` }} next={next && { href: `/piirmi/${next.n}#book`, label: `Unit ${pad2(next.n)}` }} />}
      <div className="min-h-screen" style={{ background: P.paper, color: V.ink, fontFamily: EN, zoom }}>
        <header className="sticky top-0 z-30 shadow-[0_2px_16px_rgba(0,0,0,0.18)]" style={{ background: P.green }}>
          <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 sm:px-5" dir="ltr">
            <Link href="/piirmi" className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold text-white/90 hover:bg-white/10"><ChevronLeft size={16} /> Units</Link>
            <span className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-extrabold" style={{ background: V.saff, color: V.navy }}>UNIT {pad2(u.n)}</span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-white sm:text-[16px]">{u.icons[0]} {u.titleEn}</span>
            <button onClick={() => setSlow(!slow)} title="Slow audio" className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-extrabold"
              style={slow ? { background: V.saff, color: V.navy } : { color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}>
              <Gauge size={14} /> <span className="hidden sm:inline">{slow ? 'Slow' : 'Normal'}</span>
            </button>
            <button onClick={openBook} title="Book view: the printed pages" className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold" style={{ background: '#fff', color: P.green }}>
              <BookOpen size={14} /> Book
            </button>
            {fs.can && (
              <button onClick={fs.toggle} title={fs.on ? 'Exit full screen' : 'Full screen'} className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-extrabold text-white" style={{ border: '1px solid rgba(255,255,255,0.35)' }}>
                {fs.on ? <Minimize size={15} /> : <Maximize size={15} />}<span className="hidden md:inline">{fs.on ? 'Exit' : 'Full screen'}</span>
              </button>
            )}
          </div>
          <div ref={tabs} className="no-scrollbar mx-auto flex max-w-5xl gap-1.5 overflow-x-auto px-3 pb-2.5 sm:px-5" dir="ltr">
            {SECTIONS.map(([k, ic, label], i) => {
              const on = k === sec, was = seen.includes(k)
              return (
                <button key={k} data-sec={k} onClick={() => go(k)} className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-extrabold transition"
                  style={on ? { background: V.saff, color: V.navy } : { background: 'rgba(255,255,255,0.12)', color: was ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                  {was && !on ? <Check size={13} strokeWidth={3} color={V.saff} /> : <Ico name={ic} size={14} />}
                  <span>{k === 'games' ? label : `${i + 1} · ${label}`}</span>
                </button>
              )
            })}
          </div>
        </header>

        <div style={{ background: `linear-gradient(90deg, ${P.greenD}, ${P.green})` }}>
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6" dir="ltr">
            <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl" style={{ background: V.saff }}><Ico name={icon} size={22} color={V.navy} stroke={2.3} /></span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[10.5px] font-extrabold tracking-[0.2em]" style={{ color: V.saff }}>{sec === 'games' ? 'BONUS · PLAY THE UNIT' : `SECTION ${at + 1} OF 6`}</div>
              <div className="text-[17px] font-extrabold uppercase leading-tight tracking-[0.02em] text-white sm:text-[26px]">{en}</div>
            </div>
            <Ar as="span" className="shrink-0 text-[20px] font-extrabold sm:text-[24px]" style={{ color: V.saff }}>{ar}</Ar>
          </div>
        </div>

        <main className="mx-auto max-w-5xl px-3 pb-28 pt-5 sm:px-6">
          {sample && !fs.on && <Ar className="mb-4 rounded-xl px-4 py-2.5 text-[13.5px] font-bold" style={{ background: V.saffS, color: V.saffD }}>هذه الوحدة عيّنة مجانية. ادخل رمزك في الصفحة الرئيسية لتفتح الوحدات الـ19 كلها.</Ar>}
          {sec === 'opener' && <Opener u={u} opener={opener} />}
          {sec === 'words' && <Words u={u} x={x} />}
          {sec === 'expressions' && <Expressions u={u} x={x} />}
          {sec === 'talk' && <Talk u={u} />}
          {sec === 'reading' && <Reading u={u} x={x} onScore={v => setBest(`${u.n}:reading`, v)} />}
          {sec === 'practice' && <Practice u={u} x={x} review={review} done={progress.done.includes(u.n)} onFinish={() => markDone(u.n)} />}
          {sec === 'games' && (
            <GamesPanel id={u.n} best={progress.best} onScore={(k, v) => setBest(`${u.n}:${k}`, v)} cueLabel="THEY ASK" replyLabel="YOU ANSWER"
              pairs={u.expressions.filter(([q]) => q.endsWith('?')).slice(0, 6).map(([q, a], i) => ({ id: i, cue: q, reply: a }))}
              words={u.vocab.map(([, en, ar]) => ({ shown: en, answer: en.split(' / ')[0], ar }))} />
          )}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur" style={{ borderColor: V.line, zoom }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6" dir="ltr">
            {at > 0
              ? <button onClick={() => go(SECTIONS[at - 1][0])} className="flex min-w-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold" style={{ color: P.green }}><ArrowLeft size={16} /> <span className="truncate">{SECTIONS[at - 1][2]}</span></button>
              : prev ? <Link href={`/piirmi/${prev.n}`} className="flex min-w-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold" style={{ color: V.grey }}><ArrowLeft size={16} /> <span className="truncate">Unit {pad2(prev.n)}</span></Link> : <span />}
            <span className="hidden items-center gap-1 sm:flex">{SECTIONS.map(([k], i) => <span key={k} className="h-[7px] rounded-full transition-all" style={{ width: i === at ? 22 : 7, background: i === at ? P.green : seen.includes(k) ? V.navy : V.line }} />)}</span>
            {at < SECTIONS.length - 1
              ? <button onClick={() => go(SECTIONS[at + 1][0])} className="flex min-w-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-extrabold text-white" style={{ background: P.green }}><span className="truncate">{SECTIONS[at + 1][2]}</span> <ArrowRight size={16} /></button>
              : next ? <Link href={`/piirmi/${next.n}`} className="flex min-w-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-extrabold" style={{ background: V.saff, color: V.navy }}><span className="truncate">Next unit · {pad2(next.n)}</span> <ArrowRight size={16} /></Link> : <Link href="/piirmi" className="rounded-xl px-4 py-2 text-[13px] font-extrabold text-white" style={{ background: P.green }}>Units</Link>}
          </div>
        </nav>
      </div>
    </>
  )
}

/** A bullet that may be English, Arabic, or "English - Arabic". */
function Line({ text, size = 14.5 }: { text: string; size?: number }) {
  const [en, ar] = halves(text)
  return (
    <div className="border-b pb-2 last:border-0" style={{ borderColor: V.line }} dir="ltr">
      {en && <Say text={en} className="font-bold" style={{ fontSize: size }} />}
      {ar && <Ar className={en ? 'text-left text-[13px] font-semibold' : 'text-[14px] font-semibold leading-[1.8]'} style={{ color: en ? V.grey : V.ink }}>{ar}</Ar>}
    </div>
  )
}

/* ── 1. Opener ──────────────────────────────────────────────────────── */

function Opener({ u, opener }: { u: EverydayUnit; opener: UnitOpener }) {
  const [ticked, setTicked] = useState<number[]>([])
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl p-5 text-white sm:p-7" style={{ background: `linear-gradient(135deg, ${P.green}, ${P.greenD})` }} dir="ltr">
        <div className="pointer-events-none absolute -right-4 -top-6 text-[150px] leading-none opacity-20">{u.icons[1]}</div>
        <div className="text-[11px] font-extrabold tracking-[0.2em]" style={{ color: V.saff }}>UNIT {pad2(u.n)} · EVERYDAY ENGLISH</div>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-[64px] leading-none sm:text-[80px]">{u.icons[0]}</span>
          <div className="min-w-0">
            <div className="text-[26px] font-extrabold leading-tight sm:text-[34px]">{u.titleEn}</div>
            <Ar className="text-left text-[18px] font-extrabold sm:text-[22px]" style={{ color: V.saff }}>{u.titleAr}</Ar>
          </div>
        </div>
        <Ar className="mt-3 text-[15px] font-bold text-white/90">{u.goal}</Ar>
      </div>
      <Card>
        <Head icon="Target" en="In this unit, I can" ar="في هذه الوحدة أستطيع" color={P.green} />
        <div className="space-y-2.5">
          {opener.canDo.map(([en, ar], i) => {
            const on = ticked.includes(i)
            return (
              <div key={en} className="flex items-start gap-3" dir="ltr">
                <button onClick={() => setTicked(t => (on ? t.filter(y => y !== i) : [...t, i]))} className="mt-0.5 flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-lg border-2 transition"
                  style={on ? { background: P.green, borderColor: P.green } : { borderColor: V.line }} aria-label="I can do this">{on && <Check size={15} color="#fff" strokeWidth={3} />}</button>
                <div className="min-w-0">
                  <Say text={`I can ${en}`} className="text-[15px] font-bold" />
                  <Ar className="text-left text-[13px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <div className="flex items-start gap-3 rounded-2xl p-4 sm:p-5" style={{ background: V.saffS, border: `1.5px solid ${V.saff}` }} dir="ltr">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full" style={{ background: V.saff }}><Ico name="Lightbulb" size={18} color={V.navy} /></span>
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold tracking-[0.12em]" style={{ color: V.saffD }}>LANGUAGE TIP · نصيحة</div>
          <Say text={opener.tip.en} className="mt-1 text-[15px] font-bold" />
          <Ar className="mt-1 text-[14px] font-semibold leading-[1.8]">{opener.tip.ar}</Ar>
        </div>
      </div>
    </div>
  )
}

/* ── 2. Vocabulary, with the book's photographs ─────────────────────── */

function Photo({ src, emoji, alt }: { src: string; emoji: string; alt: string }) {
  const [bad, setBad] = useState(false)
  return bad
    ? <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl text-[52px]" style={{ background: P.greenS }}>{emoji}</div>
    : <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className="aspect-[4/3] w-full rounded-xl object-cover" style={{ background: P.greenS }} />
}

function Words({ u, x }: { u: EverydayUnit; x: UnitExtras }) {
  const [mode, setMode] = useState<'list' | 'cards'>('list')
  const deck: FlashCard[] = [
    ...u.vocab.map(([, en, ar]) => ({ en, ar, img: photoOf(u.n, en), kind: 'Word' })),
    ...x.extra.map(([, en, ar]) => ({ en, ar, img: extraPhotoOf(u.n, en), kind: 'Extra word' })),
  ]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <Pill on={mode === 'list'} onClick={() => setMode('list')}><Ico name="LayoutGrid" size={14} /> All words</Pill>
        <Pill on={mode === 'cards'} onClick={() => setMode('cards')}><Ico name="Layers" size={14} /> Flashcards · {deck.length}</Pill>
        <Ar as="span" className="ml-auto text-[12.5px] font-semibold" style={{ color: V.grey }}>اضغط أي كلمة لتسمعها</Ar>
      </div>
      {mode === 'cards' ? <Flashcards deck={deck} /> : (
        <>
          <Card>
            <Head icon="BookA" en="Vocabulary" ar="المفردات" color={P.blue} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" dir="ltr">
              {u.vocab.map(([emoji, en, ar]) => (
                <div key={en} className="rounded-2xl p-2" style={{ border: `1px solid ${V.line}` }}>
                  <Photo src={photoOf(u.n, en)} emoji={emoji} alt={en} />
                  <div className="px-1 pt-2">
                    <Say text={en} className="text-[15px] font-extrabold" style={{ color: P.blue }} />
                    <Ar className="text-left text-[13px] font-bold" style={{ color: V.grey }}>{ar}</Ar>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <Head icon="Plus" en="Extra words" ar="كلمات إضافية" color={P.orange} />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6" dir="ltr">
              {x.extra.map(([emoji, en, ar]) => (
                <div key={en} className="text-center">
                  <Photo src={extraPhotoOf(u.n, en)} emoji={emoji} alt={en} />
                  <Say text={en} icon={false} className="mt-1.5 text-[13px] font-extrabold" />
                  <Ar className="text-[11.5px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

/* ── 3. Useful expressions: they ask, you answer ────────────────────── */

function Expressions({ u, x }: { u: EverydayUnit; x: UnitExtras }) {
  const { play, stop } = useAudio()
  const [practice, setPractice] = useState(false)
  const [shown, setShown] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const runId = useRef(0)

  const playAll = async () => {
    if (running) { runId.current++; stop(); setRunning(false); return }
    const id = ++runId.current
    setRunning(true)
    for (const [q, a] of u.expressions) {
      if (runId.current !== id) return
      await play(q); await new Promise(r => setTimeout(r, 400))
      if (runId.current !== id) return
      await play(a); await new Promise(r => setTimeout(r, 700))
    }
    if (runId.current === id) setRunning(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl p-3" dir="ltr" style={{ background: practice ? P.greenS : '#fff', border: `1.5px solid ${practice ? P.green : V.line}` }}>
        <button onClick={() => { setPractice(p => !p); setShown([]) }} className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-extrabold text-white" style={{ background: practice ? P.green : V.navy }}>
          {practice ? <EyeOff size={16} /> : <Eye size={16} />} Practice mode: {practice ? 'ON' : 'OFF'}
        </button>
        <Btn tone={running ? 'red' : 'ghost'} onClick={playAll}>{running ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play all</>}</Btn>
        <Ar as="span" className="text-[13px] font-semibold" style={{ color: V.grey }}>{practice ? 'الأجوبة مخفية: أجب بصوت عالٍ، ثم اكشف الجواب لتتأكد.' : 'اقرأ السؤال وجوابه بصوت مرتفع، ثم شغّل وضع التدريب وأجب وحدك.'}</Ar>
      </div>
      <div className="space-y-3">
        {u.expressions.map(([q, a, qAr, aAr], i) => {
          const hide = practice && !shown.includes(i)
          return (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_28px_1fr] md:items-stretch" dir="ltr">
              <div className="rounded-2xl rounded-tl-md p-3" style={{ background: V.navyS, borderLeft: `4px solid ${V.navy}` }}>
                <div className="mb-1 text-[10px] font-extrabold tracking-[0.14em]" style={{ color: V.navy }}>THEY ASK</div>
                <Say text={q} className="text-[15px] font-bold" />
                <Ar className="mt-0.5 text-left text-[13px] font-semibold" style={{ color: V.grey }}>{qAr}</Ar>
              </div>
              <span className="hidden items-center justify-center md:flex"><ArrowRight size={18} color={V.grey} /></span>
              <div className="rounded-2xl rounded-tr-md p-3" style={{ background: P.greenS, borderRight: `4px solid ${P.green}` }}>
                <div className="mb-1 text-[10px] font-extrabold tracking-[0.14em]" style={{ color: P.green }}>YOU ANSWER</div>
                {hide ? (
                  <button onClick={() => setShown(s => [...s, i])} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-[13px] font-bold" style={{ borderColor: P.green, color: P.green }}>
                    <Eye size={15} /> Your turn: say it, then tap to check
                  </button>
                ) : <Say text={a} className="text-[15px] font-bold" />}
                <Ar className="mt-0.5 text-left text-[13px] font-semibold" style={{ color: V.grey }}>{aAr}</Ar>
                {practice && !hide && <MicCheck model={a} />}
              </div>
            </div>
          )
        })}
      </div>
      <Card>
        <Head icon="Eye" en="Notice" ar="لاحظ" color={P.orange} />
        <div className="space-y-2">{x.notice.map(t => <Line key={t} text={t} />)}</div>
      </Card>
      <Card style={{ background: V.saffS }}>
        <Head icon="Lightbulb" en="Tip" ar="نصيحة" color={V.saffD} />
        <div className="space-y-2">{x.tip.map(t => <Line key={t} text={t} />)}</div>
      </Card>
    </div>
  )
}

/* ── 4. Conversation ────────────────────────────────────────────────── */

function Talk({ u }: { u: EverydayUnit }) {
  const { play, stop, playing } = useAudio()
  const lines = useMemo(() => u.talk.map(lineOf), [u])
  const cast = useMemo(() => [...new Set(lines.map(l => l.who))], [lines])
  const [me, setMe] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const [cue, setCue] = useState<number | null>(null)
  const runId = useRef(0)

  const run = async () => {
    if (running) { runId.current++; stop(); setRunning(false); setCue(null); return }
    const id = ++runId.current
    setRunning(true)
    for (let i = 0; i < lines.length; i++) {
      if (runId.current !== id) return
      const l = lines[i]
      if (me && l.who === me) { setCue(i); await new Promise(r => setTimeout(r, 1600 + l.text.length * 70)); setCue(null) }
      else await play(l.text)
      await new Promise(r => setTimeout(r, 300))
    }
    if (runId.current === id) setRunning(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2" dir="ltr">
          <Btn tone={running ? 'red' : 'navy'} onClick={run}>{running ? <><Pause size={16} /> Stop</> : <><Play size={16} /> {me ? `Act it out as ${me}` : 'Play the conversation'}</>}</Btn>
          <span className="text-[13px] font-bold" style={{ color: V.grey }}>Role-play: be</span>
          {cast.map(who => (
            <Pill key={who} on={me === who} onClick={() => { setMe(m => (m === who ? null : who)); setRevealed([]) }}>{AVATARS[who] ?? '🙂'} {who}</Pill>
          ))}
        </div>
        {me && <Ar className="mt-2 text-[13px] font-semibold" style={{ color: P.green }}>{`أنت ${me}: جملك مخفية. عندما يحين دورك قلها بصوت عالٍ، ثم اكشفها لتتأكد.`}</Ar>}
      </Card>
      <div className="space-y-2.5" dir="ltr">
        {lines.map((l, i) => {
          const right = l.who === cast[0]
          const hide = me === l.who && !revealed.includes(i)
          const live = playing === l.text || cue === i
          return (
            <div key={i} className={`flex items-end gap-2 ${right ? 'flex-row-reverse' : ''}`}>
              <span className="text-[26px] leading-none">{AVATARS[l.who] ?? '🙂'}</span>
              <div className={`max-w-[82%] rounded-2xl p-3 transition sm:max-w-[70%] ${right ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{ background: right ? P.greenS : '#fff', boxShadow: live ? `0 0 0 3px ${V.saff}` : '0 2px 10px rgba(14,18,64,0.06)' }}>
                <div className="mb-1 text-[10.5px] font-extrabold tracking-[0.1em]" style={{ color: right ? P.green : V.navy }}>{l.who}</div>
                {hide
                  ? <button onClick={() => setRevealed(r => [...r, i])} className="flex items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-[13px] font-bold" style={{ borderColor: P.green, color: P.green }}><Mic size={15} /> {cue === i ? 'Your turn — say it now!' : 'Your line · tap to reveal'}</button>
                  : <Say text={l.text} className="text-[15px] font-semibold" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── 5. Reading ─────────────────────────────────────────────────────── */

function Reading({ u, x, onScore }: { u: EverydayUnit; x: UnitExtras; onScore: (v: number) => void }) {
  const { play, playing, stop } = useAudio()
  const [vals, setVals] = useState<string[]>(x.questions.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [running, setRunning] = useState(false)
  const runId = useRef(0)
  const ok = (i: number) => closeness(vals[i], x.answers[i] ?? '') >= 0.5
  const all = u.reading.body.flatMap(sentences)

  const readAll = async () => {
    if (running) { runId.current++; stop(); setRunning(false); return }
    const id = ++runId.current
    setRunning(true)
    for (const s of all) { if (runId.current !== id) return; await play(s); await new Promise(r => setTimeout(r, 250)) }
    if (runId.current === id) setRunning(false)
  }

  return (
    <div className="space-y-4">
      <Card style={{ background: P.goldS }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2" dir="ltr">
          <span className="text-[20px] font-extrabold" style={{ color: P.gold }}>{u.reading.title}</span>
          <Btn tone={running ? 'red' : 'ghost'} onClick={readAll}>{running ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Read it to me</>}</Btn>
        </div>
        <div className="space-y-3" dir="ltr">
          {u.reading.body.map((p, i) => (
            <p key={i} className="text-[16.5px] leading-[1.85]">
              {sentences(p).map((s, k) => (
                <span key={k} onClick={() => play(s)} className="cursor-pointer rounded px-0.5 transition hover:bg-white" style={playing === s ? { background: V.saff } : undefined}>{s} </span>
              ))}
            </p>
          ))}
        </div>
        <Ar className="mt-2 text-[12.5px] font-semibold" style={{ color: V.grey }}>اضغط أي جملة لتسمعها.</Ar>
      </Card>
      <Card>
        <Head icon="Eye" en="Notice" ar="لاحظ" color={P.orange} />
        <div className="space-y-2">{x.readNotice.map(t => <Line key={t} text={t} />)}</div>
      </Card>
      <Card>
        <Head icon="CircleHelp" en="Questions" ar="أسئلة" color={P.green} />
        <div className="space-y-3">
          {x.questions.map((q, i) => (
            <div key={q} className="rounded-xl p-3" style={{ background: checked ? (ok(i) ? P.greenS : V.redS) : V.cream }} dir="ltr">
              <div className="flex gap-2"><span className="text-[14px] font-extrabold" style={{ color: P.green }}>{i + 1}</span><Say text={q} className="text-[15px] font-bold" /></div>
              <input value={vals[i]} onChange={e => !checked && setVals(v => v.map((y, k) => (k === i ? e.target.value : y)))} placeholder="Your answer…"
                className="mt-2 w-full rounded-lg border-2 bg-white px-3 py-2 text-[15px] font-semibold outline-none" style={{ borderColor: V.line, fontFamily: EN }} />
              {checked && x.answers[i] && <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] font-bold" style={{ color: ok(i) ? P.green : V.saffD }}>{ok(i) ? '✓ Good!' : 'Compare:'} <Say text={x.answers[i]} className="font-extrabold" style={{ color: V.navy }} /></div>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2" dir="ltr">
          {!checked
            ? <Btn tone="navy" onClick={() => { setChecked(true); onScore(x.questions.filter((_, i) => ok(i)).length) }} disabled={vals.every(v => !v.trim())}>Check my answers</Btn>
            : <Btn tone="ghost" onClick={() => { setChecked(false); setVals(x.questions.map(() => '')) }}>Try again</Btn>}
        </div>
      </Card>
    </div>
  )
}

/* ── 6. Make it yours ───────────────────────────────────────────────── */

/** A box to write (or say) the student's own answer, kept on this device. */
function Answer({ id, placeholder }: { id: string; placeholder: string }) {
  const { ok, busy, listen } = useListen()
  const key = `piirmi.answer.${id}`
  const [v, setV] = useState('')
  useEffect(() => { try { setV(localStorage.getItem(key) ?? '') } catch {} }, [key])
  const save = (t: string) => { setV(t); try { localStorage.setItem(key, t) } catch {} }
  return (
    <div className="mt-2 flex items-start gap-2" dir="ltr">
      <textarea value={v} onChange={e => save(e.target.value)} placeholder={placeholder} rows={2}
        className="min-w-0 flex-1 rounded-xl border-2 bg-white px-3 py-2 text-[15px] font-semibold outline-none focus:border-[#0E6B4E]" style={{ borderColor: V.line, fontFamily: EN }} />
      {ok && <button onClick={async () => { const t = await listen(); if (t) save(v ? `${v} ${t}` : t) }} title="Say it" className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl text-white" style={{ background: busy ? V.red : P.green }}><Mic size={18} /></button>}
    </div>
  )
}

function Practice({ u, x, review, done, onFinish }: { u: EverydayUnit; x: UnitExtras; review: number; done: boolean; onFinish: () => void }) {
  const [stuck, setStuck] = useState(false)
  return (
    <div className="space-y-4">
      <Card>
        <Head icon="MessageCircleQuestion" en="Your turn" ar="دورك" color={P.orange} />
        <Ar className="mb-2 text-[13px] font-semibold" style={{ color: V.grey }}>أجب عن حياتك أنت: اكتب جوابك، أو اضغط الميكروفون وقله.</Ar>
        <div className="space-y-3">
          {x.yourTurn.map((q, i) => (
            <div key={q} className="rounded-xl p-3" style={{ background: V.cream }}>
              <div className="flex gap-2" dir="ltr"><span className="text-[14px] font-extrabold" style={{ color: P.orange }}>{i + 1}</span><Say text={q} className="text-[15px] font-bold" /></div>
              <Answer id={`${u.n}.turn.${i}`} placeholder="My answer…" />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <Head icon="PenLine" en="Make it yours" ar="اجعلها خاصة بك" color={P.green} />
        <div className="space-y-3">
          {u.yours.map((t, i) => {
            const [en, ar] = halves(t)
            return (
              <div key={t} className="rounded-xl p-3" style={{ background: P.greenS }}>
                <div dir="ltr">{en && <span className="text-[15px] font-bold">{i + 1}. {en}</span>}</div>
                {ar && <Ar className="text-left text-[13px] font-semibold" style={{ color: V.grey }}>{ar}</Ar>}
                <Answer id={`${u.n}.yours.${i}`} placeholder="Write it here…" />
              </div>
            )
          })}
        </div>
      </Card>
      <div className="rounded-3xl p-5 text-center sm:p-7" style={{ background: P.green, color: '#fff' }}>
        {done || stuck ? (
          <div className="flex flex-col items-center">
            <div className="flex h-[110px] w-[110px] -rotate-6 flex-col items-center justify-center rounded-3xl text-[54px]" style={{ background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', animation: 'vz-stamp .5s ease-out' }}>{u.icons[0]}</div>
            <div className="mt-3 text-[20px] font-extrabold" dir="ltr">Sticker added! Unit {u.n} is in your album.</div>
            <Ar className="mt-1 text-[14px] font-bold text-white/80">{`أحسنت! جرّب ألعاب الوحدة${review ? `، وفي آخر الوحدات اختبر نفسك في المراجعة ${review}` : ''}.`}</Ar>
            {review > 0 && <Link href={`/piirmi/check/${review}`} className="mt-3 rounded-xl px-4 py-2 text-[13.5px] font-extrabold" style={{ background: V.saff, color: V.navy }}>Review {review} check</Link>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Sparkles size={34} color={V.saff} />
            <div className="mt-2 text-[20px] font-extrabold" dir="ltr">Finished this unit?</div>
            <Ar className="mt-1 text-[14px] font-bold text-white/80">أنهيت؟ ألصق ملصق الوحدة في ألبومك.</Ar>
            <button dir="ltr" onClick={() => { setStuck(true); onFinish() }} className="mt-4 rounded-2xl px-6 py-3 text-[16px] font-extrabold transition active:scale-95" style={{ background: V.saff, color: V.navy }}>Add my sticker</button>
          </div>
        )}
      </div>
    </div>
  )
}
