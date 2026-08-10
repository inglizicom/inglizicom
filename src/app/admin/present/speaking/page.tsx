'use client'

/**
 * /admin/present/speaking — "Speak Your Work" teaching deck.
 *
 * FIVE STEPS PER LESSON, NOT THIRTEEN.
 *   1 WORDS · 2 SENTENCES · 3 CONVERSATION · 4 YOUR TURN · 5 HOMEWORK
 * Grammar, the Arabic trap and pronunciation live inside step 2, where they
 * belong, instead of each taking a slide of its own. One big number in the
 * corner tells both of them where they are.
 *
 * The syllabus, the places-first progression, the grammar ladder and the
 * Arabic-L1 traps are documented in src/data/speaking/types.ts — this file
 * only renders them.
 *
 * Navigate: ← → / Space / side-click. Full screen: F. Jump to a lesson from
 * the cover. No entrance animation anywhere: two earlier attempts made the
 * slide body depend on JavaScript to be visible, and a teaching slide must
 * never need a script to be seen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, Home,
  BookOpen, MessagesSquare, Users, Flame, ListChecks, Route, AlertTriangle,
  Volume2, Layers, CheckCircle2, MapPin,
} from 'lucide-react'
import {
  ORDERED, UNITS, STEPS, GRAMMAR_LADDER, recallFor, unitOf, dayInUnit,
  type Lesson,
} from '@/data/speaking'

/* Same visual language as "English from Zero" (/admin/present/writing). */
const INK   = '#2a1d12'
const GOLD  = '#d4a017'
const AMBER = '#92400e'
const PAPER = '#ffffff'
const CARD  = '#fdf6e3'
const CARD2 = '#fcefc7'
const LINE  = '#e7e5e4'
const MUTED = '#57534e'
const DIM   = '#a8a29e'
const ACCENT = '#b45309'
const RED   = '#b91c1c'
const GREEN = '#15803d'

type Step = 'words' | 'sentences' | 'talk' | 'yourturn' | 'homework'
const STEP_ICON: Record<Step, typeof BookOpen> = {
  words: BookOpen, sentences: Layers, talk: MessagesSquare, yourturn: Flame, homework: ListChecks,
}
const STEP_KEYS = STEPS.map(s => s.key as Step)

type Slide =
  | { k: 'cover' } | { k: 'ladder' } | { k: 'shape' }
  | { k: 'unit'; unit: number }
  | { k: 'lesson'; lesson: Lesson; step: Step }

function Hi({ text, color = GOLD }: { text: string; color?: string }) {
  return <>{text.split('*').map((p, i) =>
    i % 2 === 1 ? <span key={i} style={{ color, fontWeight: 700 }}>{p}</span> : <span key={i}>{p}</span>
  )}</>
}

function Ar({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <p dir="rtl" className={className}
       style={{ fontFamily: "'Tajawal', sans-serif", lineHeight: 1.85, letterSpacing: 0, ...style }}>
      {children}
    </p>
  )
}

/** TAP TO HEAR.
 *
 *  The whole course is about producing sound, and until now there was none in
 *  it. She had a phonetic respelling — "uh KOF-ee" — and nothing to check it
 *  against, which asks her to trust a spelling system she has never used to
 *  reproduce a sound she has never heard. And the teacher is Moroccan: a good
 *  teacher, but not the model for /p/ or /θ/ or the -teen/-ty stress pair that
 *  three of these lessons turn on.
 *
 *  Every English phrase in the deck is now clickable. It uses the browser's own
 *  voices, so nothing leaves the machine and it works in a classroom with no
 *  network. British English on purpose — the course says "the bill", "quarter
 *  to eleven", "chemist", "petrol station" throughout, and a US voice reading
 *  those is a different course.
 *
 *  Slow mode drops the rate to 0.62 for the minimal pairs, where the whole
 *  point is hearing a difference she cannot yet hear at speed. */
function useSpeech() {
  const [slow, setSlow] = useState(false)
  const [supported, setSupported] = useState(false)
  const voice = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)
    const pick = () => {
      const vs = window.speechSynthesis.getVoices()
      voice.current =
        vs.find(v => v.lang === 'en-GB' && /Daniel|Serena|Kate|Google UK/i.test(v.name)) ??
        vs.find(v => v.lang === 'en-GB') ??
        vs.find(v => v.lang.startsWith('en')) ?? null
    }
    pick()
    window.speechSynthesis.addEventListener('voiceschanged', pick)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick)
  }, [])

  /* Strips the *spotlight* markers, the [stage directions] and the phonetic
     respellings, none of which should be read aloud. */
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const clean = text
      .replace(/\*/g, '')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/[—–]/g, ', ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!clean) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = 'en-GB'
    if (voice.current) u.voice = voice.current
    u.rate = slow ? 0.62 : 0.92
    window.speechSynthesis.speak(u)
  }, [slow])

  return { speak, slow, setSlow, supported }
}

type Speak = (t: string) => void

function buildSlides(): Slide[] {
  const out: Slide[] = [{ k: 'cover' }, { k: 'ladder' }, { k: 'shape' }]
  UNITS.forEach(u => {
    out.push({ k: 'unit', unit: u.no })
    ORDERED.filter(l => l.unit === u.no).forEach(lesson =>
      STEP_KEYS.forEach(step => out.push({ k: 'lesson', lesson, step })))
  })
  return out
}

export default function SpeakingDeck() {
  const slides = useMemo(buildSlides, [])
  const [idx, setIdx] = useState(0)
  const [fs, setFs] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const { speak, slow, setSlow, supported } = useSpeech()

  const go = useCallback((d: number) => {
    setIdx(i => Math.min(slides.length - 1, Math.max(0, i + d)))
  }, [slides.length])

  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      if (e.key === 'f' || e.key === 'F') toggleFs()
      if (e.key === 's' || e.key === 'S') setSlow(v => !v)
      if (e.key === 'Home') setIdx(0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, toggleFs, setSlow])

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const s = slides[idx]
  const lesson = s.k === 'lesson' ? s.lesson : null
  const colour = lesson ? UNITS[lesson.unit - 1].colour
    : s.k === 'unit' ? UNITS[s.unit - 1].colour : ACCENT

  const jumpTo = (no: number) => {
    const at = slides.findIndex(x => x.k === 'lesson' && x.lesson.no === no && x.step === 'words')
    if (at >= 0) setIdx(at)
  }
  const jumpStep = (st: Step) => {
    if (!lesson) return
    const at = slides.findIndex(x => x.k === 'lesson' && x.lesson.no === lesson.no && x.step === st)
    if (at >= 0) setIdx(at)
  }

  return (
    <div dir="ltr" ref={stageRef}
         style={{
           fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif",
           background: PAPER, color: INK,
           WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility',
           letterSpacing: '-0.006em',
         }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[22vw] -right-[16vw] w-[46vw] h-[46vw] rounded-full bg-yellow-100/40 blur-3xl" />

      {/* ── header ── */}
      <div className="relative z-30 flex items-center justify-between px-5 py-3 border-b bg-white/85 backdrop-blur" style={{ borderColor: LINE }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/present" className="flex items-center gap-1.5 text-[12px] font-bold text-stone-400 hover:text-stone-700 shrink-0">
            <ArrowLeft size={14} /> Decks
          </Link>
          <span className="text-stone-300">·</span>
          {lesson ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-[12px] font-bold shrink-0" style={{ color: colour }}>
                DAY {lesson.no}
              </span>
              <span className="flex items-center gap-1 text-[13px] font-bold truncate">
                <MapPin size={13} style={{ color: colour }} /> {lesson.where}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: CARD2, color: AMBER }}>
                {lesson.level}
              </span>
            </span>
          ) : (
            <span className="font-bold text-[14px] truncate">Speak Your Work</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {supported && (
            <button onClick={() => setSlow(v => !v)} title="Slow speech (S)"
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full border transition-colors"
                    style={{ borderColor: slow ? AMBER : LINE, background: slow ? '#fffbeb' : 'transparent', color: slow ? AMBER : DIM }}>
              <Volume2 size={12} /> {slow ? 'Slow' : 'Normal'}
            </button>
          )}
          <span className="text-[11px] font-mono text-stone-500">{idx + 1}/{slides.length}</span>
          <button onClick={() => setIdx(0)} className="text-stone-400 hover:text-stone-700" title="Cover"><Home size={16} /></button>
          <button onClick={toggleFs} className="text-stone-400 hover:text-stone-700" title="Full screen (F)">
            {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── five steps ── */}
      {lesson && (
        <div className="relative z-30 flex items-stretch border-b bg-white/85" style={{ borderColor: LINE }}>
          {STEPS.map(st => {
            const active = s.k === 'lesson' && s.step === st.key
            const done = STEP_KEYS.indexOf(st.key as Step) < STEP_KEYS.indexOf((s as { step: Step }).step)
            const I = STEP_ICON[st.key as Step]
            return (
              <button key={st.key} onClick={() => jumpStep(st.key as Step)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border-r transition-all"
                      style={{
                        borderColor: LINE,
                        background: active ? colour : done ? CARD : 'transparent',
                        color: active ? '#fff' : done ? MUTED : DIM,
                      }}>
                <span className="text-[17px] font-bold leading-none">{st.n}</span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <I size={13} />
                  <span className="text-[12px] font-bold">{st.label}</span>
                  <span className="text-[10px] font-mono opacity-70">{st.mins}′</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── stage ── */}
      <div className="flex-1 relative overflow-hidden z-20">
        <button className="absolute left-0 top-0 bottom-0 w-[9%] z-20 cursor-w-resize" onClick={() => go(-1)} aria-label="previous" />
        <button className="absolute right-0 top-0 bottom-0 w-[9%] z-20 cursor-e-resize" onClick={() => go(1)} aria-label="next" />
        <div key={idx} className="absolute inset-0 overflow-y-auto px-6 sm:px-12 py-8 flex flex-col">
          {s.k === 'cover'  && <Cover onJump={jumpTo} onFull={toggleFs} />}
          {s.k === 'ladder' && <LadderSlide />}
          {s.k === 'shape'  && <ShapeSlide />}
          {s.k === 'unit'   && <UnitSlide no={s.unit} />}
          {s.k === 'lesson' && <LessonSlide lesson={s.lesson} step={s.step} colour={colour} speak={speak} />}
        </div>
      </div>

      {/* ── footer ── */}
      <div className="relative z-30 flex items-center justify-between px-5 py-2.5 border-t bg-white/85 backdrop-blur" style={{ borderColor: LINE }}>
        <button onClick={() => go(-1)} className="flex items-center gap-1 text-[12px] font-bold text-stone-400 hover:text-stone-700">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="h-1 flex-1 mx-5 rounded-full overflow-hidden" style={{ background: LINE }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((idx + 1) / slides.length) * 100}%`, background: colour }} />
        </div>
        <button onClick={() => go(1)} className="flex items-center gap-1 text-[12px] font-bold text-stone-400 hover:text-stone-700">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

function Cover({ onJump, onFull }: { onJump: (n: number) => void; onFull: () => void }) {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        Private 1:1 · 8 units · 48 daily lessons · A0 → B1
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] mb-2">Speak Your Work</h1>
      <p className="text-xl text-stone-600 mb-1">From the café to the conference — one small step at a time.</p>
      <Ar className="text-stone-500 mb-8 text-lg">من المقهى إلى المؤتمر — خطوة صغيرة في كل مرة</Ar>

      <div className="grid sm:grid-cols-4 gap-2 mb-8">
        {UNITS.map(u => (
          <div key={u.no} className="rounded-xl border p-3"
               style={{ borderColor: u.bridge ? GOLD : LINE, background: u.bridge ? '#fffbeb' : CARD }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: u.colour }}>Unit {u.no}</span>
              <span className="text-[10px] font-bold px-1.5 rounded" style={{ background: CARD2, color: AMBER }}>{u.level}</span>
            </div>
            <p className="font-bold text-[14px] leading-tight">{u.title}</p>
            <p className="text-[11.5px] text-stone-600 leading-snug mt-1">{u.what}</p>
            {u.bridge && <p className="text-[10px] font-bold mt-1.5" style={{ color: AMBER }}>← her work starts here</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 mb-6">
        {ORDERED.map(l => (
          <button key={l.no} onClick={() => onJump(l.no)} title={`${l.where} — ${l.title}`}
                  className="aspect-square rounded-lg text-[12px] font-bold transition-all hover:scale-110 border"
                  style={{ borderColor: UNITS[l.unit - 1].colour, color: UNITS[l.unit - 1].colour, background: CARD }}>
            {l.no}
          </button>
        ))}
      </div>

      <button onClick={onFull} className="rounded-xl px-5 py-3 font-bold text-[14px] text-white" style={{ background: INK }}>
        Full screen (F) →
      </button>
    </div>
  )
}

/** Why the course starts in a café and not in a meeting. */
function LadderSlide() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Route size={14} /> Why it starts in a café
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-1">Places first, then people, then work</h2>
      <Ar className="text-stone-500 mb-6">الأماكن أولاً، ثم الناس، ثم العمل</Ar>

      <div className="rounded-xl border-2 p-5 mb-5" style={{ borderColor: UNITS[0].colour, background: '#ecfeff' }}>
        <p className="text-[15px] leading-relaxed">
          A beginner starts where the language is <b>predictable</b>. In a café there are about nine
          things anyone ever says, and she can learn all nine. An open conversation with a stranger is
          the opposite — nothing in it is predictable, and she has to invent content, choose a register
          and improvise all at once. <b>That is one of the hardest things in a language, not one of the
          easiest.</b> So units 1 and 2 are errands: café, supermarket, pharmacy, market, taxi,
          restaurant, bank, doctor, the street, the hotel. Short exchanges, fixed scripts, an outcome
          she can see.
        </p>
        <Ar className="text-stone-600 text-[14px] mt-3">
          يبدأ المبتدئ حيث تكون اللغة متوقَّعة. في المقهى نحو تسع جمل يقولها الناس، وتستطيع تعلّمها كلها.
          الحديث المفتوح مع غريب هو العكس — لا شيء فيه متوقَّع.
        </Ar>
      </div>

      <div className="space-y-2 mb-6">
        {UNITS.map(u => (
          <div key={u.no} className="rounded-xl border p-3.5 flex items-start gap-3"
               style={{ borderColor: u.bridge ? GOLD : LINE, background: u.bridge ? '#fffbeb' : CARD }}>
            <span className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[14px] text-white"
                  style={{ background: u.colour }}>{u.no}</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[14.5px] leading-tight">
                {u.title}
                <span className="text-[11px] font-bold ml-2" style={{ color: DIM }}>days {(u.no - 1) * 6 + 1}–{u.no * 6}</span>
              </p>
              <p className="text-[12.5px] text-stone-600 leading-snug">{u.what}</p>
            </div>
            <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded" style={{ background: CARD2, color: AMBER }}>{u.level}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
          The grammar ladder — nothing may jump ahead of it
        </div>
        <div className="space-y-1.5">
          {GRAMMAR_LADDER.map(g => (
            <p key={g.unit} className="text-[12.5px] leading-snug">
              <span className="font-bold" style={{ color: UNITS[g.unit - 1].colour }}>Unit {g.unit}</span>
              <span className="text-stone-600"> — {g.taught.join(' · ')}</span>
            </p>
          ))}
        </div>
        <p className="text-[12px] text-stone-500 mt-3 border-t pt-3" style={{ borderColor: LINE }}>
          No past tense before unit 4. No present perfect before unit 7. If a phrase is genuinely useful
          earlier it is taught as a fixed sound-shape she repeats — never opened up as grammar.
        </p>
      </div>
    </div>
  )
}

function ShapeSlide() {
  const total = STEPS.reduce((t, s) => t + s.mins, 0)
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Layers size={14} /> Every lesson
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-1">Five steps, {total} minutes</h2>
      <Ar className="text-stone-500 mb-6">خمس خطوات، {total} دقيقة</Ar>

      <div className="space-y-2.5 mb-6">
        {STEPS.map(st => {
          const I = STEP_ICON[st.key as Step]
          return (
            <div key={st.key} className="rounded-xl border-2 p-4 flex items-start gap-4"
                 style={{ borderColor: st.key === 'yourturn' ? GOLD : LINE, background: st.key === 'yourturn' ? '#fffbeb' : CARD }}>
              <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[20px]"
                    style={{ background: CARD2, color: AMBER }}>{st.n}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[17px] leading-tight flex items-center gap-2">
                  <I size={15} style={{ color: AMBER }} /> {st.label}
                  <span dir="rtl" className="text-stone-400 font-bold text-[13px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{st.ar}</span>
                </p>
                <p className="text-[13px] text-stone-600 leading-snug mt-0.5">{st.why}</p>
              </div>
              <span className="shrink-0 font-mono font-bold text-[14px]" style={{ color: DIM }}>{st.mins}′</span>
            </div>
          )
        })}
      </div>

      <p className="text-[13px] text-stone-600 border-t pt-4" style={{ borderColor: LINE }}>
        <b>Step 4 is the biggest block on purpose.</b> Twenty of the {total} minutes are her speaking
        with no notes. Grammar, pronunciation and the Arabic trap all sit inside step 2 — they are how
        the sentences work, not separate subjects.
      </p>
    </div>
  )
}

function UnitSlide({ no }: { no: number }) {
  const u = UNITS[no - 1]
  const days = ORDERED.filter(l => l.unit === no)
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: u.colour }}>
        Unit {no} of 8 · {u.level} · days {(no - 1) * 6 + 1}–{no * 6}
      </div>
      <h2 className="text-4xl sm:text-5xl font-bold mb-1">{u.title}</h2>
      <Ar className="text-stone-500 text-xl mb-5">{u.titleAr}</Ar>

      {u.bridge && (
        <div className="rounded-xl border-2 p-4 mb-5" style={{ borderColor: GOLD, background: '#fffbeb' }}>
          <p className="font-bold text-[15px]" style={{ color: AMBER }}>
            This is the bridge. Day 25 is the first time in the whole course that her job is mentioned at all.
          </p>
          <Ar className="text-stone-600 text-[13.5px] mt-1">
            هذا هو الجسر. اليوم 25 أول مرة يُذكر فيها عملها في الدورة كلها.
          </Ar>
        </div>
      )}

      <div className="rounded-xl border p-4 mb-5" style={{ borderColor: LINE, background: CARD }}>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: MUTED }}>New grammar in this unit</div>
        <p className="text-[16px] font-bold">{u.grammar}</p>
      </div>

      <div className="space-y-2">
        {days.map(l => (
          <div key={l.no} className="rounded-xl border p-3.5 flex items-start gap-3" style={{ borderColor: LINE, background: CARD }}>
            <span className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-bold text-[15px] text-white"
                  style={{ background: u.colour }}>{l.no}</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[15px] leading-tight flex items-center gap-1.5">
                <MapPin size={13} style={{ color: u.colour }} /> {l.where}
                <span className="text-stone-400 font-bold">— {l.title}</span>
              </p>
              <p className="text-[12.5px] text-stone-600 leading-snug mt-0.5">“{l.canDo.en}”</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

function LessonSlide({ lesson, step, colour, speak }: { lesson: Lesson; step: Step; colour: string; speak: Speak }) {
  const meta = STEPS.find(s => s.key === step)!
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Big step number — where they are, at a glance, from the back of a room. */}
      <div className="flex items-start gap-4 mb-6">
        <span className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-[30px] text-white"
              style={{ background: colour }}>{meta.n}</span>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            {meta.label}
            <span dir="rtl" className="text-stone-400 text-xl ml-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>{meta.ar}</span>
          </h2>
          <p className="text-[13px] text-stone-500 leading-snug mt-0.5">{meta.why}</p>
        </div>
      </div>

      {/* ── 1 WORDS ── */}
      {step === 'words' && (
        <div className="space-y-5">
          <div className="rounded-xl border-2 p-4" style={{ borderColor: colour, background: CARD2 }}>
            <div className="text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: colour }}>
              First — sixty seconds, she talks, correct nothing
            </div>
            <p className="text-[19px] font-bold leading-snug">{lesson.warm.en}</p>
            <Ar className="text-stone-500 mt-1">{lesson.warm.ar}</Ar>
          </div>

          {(() => {
            const r = recallFor(lesson.no)
            if (!r.back.length && !r.far) return null
            return (
              <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                  Then — say these again before anything new
                </div>
                <div className="space-y-1.5">
                  {r.back.map(b => (
                    <p key={b.en} className="text-[15px] font-bold leading-snug">
                      <span className="font-mono text-[10px] mr-2" style={{ color: DIM }}>D{b.from}</span>{b.en}
                    </p>
                  ))}
                  {r.far && (
                    <p className="text-[15px] font-bold leading-snug pt-1.5 border-t mt-1.5" style={{ borderColor: LINE }}>
                      <span className="font-mono text-[10px] mr-2" style={{ color: AMBER }}>D{r.far.from}</span>{r.far.en}
                      <span className="text-[11px] font-bold ml-2" style={{ color: AMBER }}>(a week ago — this is the one that disappears)</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })()}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {lesson.words.map(w => (
              <div key={w.en} onClick={() => speak(w.en)} title="Click to hear it"
                   className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-stone-400" style={{ borderColor: LINE, background: CARD }}>
                <p className="text-[23px] font-bold leading-relaxed">{w.en}</p>
                <div className="flex items-baseline justify-between gap-3 mt-1">
                  <Ar className="text-stone-600 text-[15px]">{w.ar}</Ar>
                  {w.say && <span className="font-mono text-[12px] font-bold shrink-0" style={{ color: AMBER }}>{w.say}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[12.5px] text-stone-500 border-t pt-4" style={{ borderColor: LINE }}>
            Say each word three times and move on. No sentences yet, no explanations, no grammar. This
            step is only for getting the sounds into her mouth.
          </p>

          {/* The bank — the whole family around each core word, so she has room to speak. */}
          {lesson.bank && lesson.bank.length > 0 && (
            <div className="pt-2">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-[19px] font-bold">More ways to say it</h3>
                <span dir="rtl" className="text-stone-400 font-bold text-[14px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  طرق أخرى للقول
                </span>
              </div>
              <p className="text-[12.5px] text-stone-500 mb-3">
                Not tested, and not to be learned by heart. Read them together, let her point at the ones
                that are hers, and use those in step 4. The eight words above are the lesson; these are so
                she has something to choose from.
              </p>
              <div className="space-y-3">
                {lesson.bank.map(g => (
                  <div key={g.title} className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
                    <div className="flex items-baseline gap-2 mb-2.5">
                      <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: colour }}>{g.title}</span>
                      <span dir="rtl" className="text-stone-400 font-bold text-[12px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{g.titleAr}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map(it => (
                        <span key={it.en} onClick={() => speak(it.en)} title="Click to hear it"
                              className="inline-flex items-baseline gap-1.5 rounded-lg bg-white border px-2.5 py-1.5 cursor-pointer transition-colors hover:border-stone-400"
                              style={{ borderColor: LINE }}>
                          <span className="text-[15px] font-bold leading-none">{it.en}</span>
                          <span dir="rtl" className="text-[12.5px] text-stone-500 leading-none" style={{ fontFamily: "'Tajawal', sans-serif" }}>{it.ar}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2 SENTENCES (+ grammar, trap, sound) ── */}
      {step === 'sentences' && (
        <div className="space-y-5">
          <div className="space-y-2">
            {lesson.sentences.map(sn => (
              <div key={sn.en} onClick={() => speak(sn.en)} title="Click to hear it"
                   className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-stone-400" style={{ borderColor: LINE, background: CARD }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <p className="text-[21px] sm:text-[26px] font-bold leading-relaxed flex-1 min-w-0"><Hi text={sn.en} color={colour} /></p>
                  {sn.use && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0"
                          style={{ background: CARD2, color: AMBER }}>{sn.use}</span>
                  )}
                </div>
                <Ar className="text-stone-600 mt-1 text-[15px]">{sn.ar}</Ar>
              </div>
            ))}
          </div>

          {/* the one grammar step */}
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: colour }}>
              <Layers size={13} /> Today&apos;s one grammar step {lesson.grammar.chunk && '· say it, do not explain it'}
            </div>
            <p className="text-[18px] font-bold leading-snug mb-1">{lesson.grammar.step}</p>
            <Ar className="text-stone-500 text-[14px] mb-3">{lesson.grammar.stepAr}</Ar>
            <p className="font-mono text-[16px] sm:text-[19px] font-bold leading-relaxed">{lesson.grammar.frame}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {lesson.grammar.examples.map(e => (
                <span key={e} onClick={() => speak(e)} title="Click to hear it"
                      className="text-[14px] font-bold px-2.5 py-1.5 rounded-lg bg-white border cursor-pointer transition-colors hover:border-stone-400" style={{ borderColor: LINE }}>{e}</span>
              ))}
            </div>
          </div>

          {/* the Arabic trap */}
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: RED }}>
            <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-white" style={{ background: RED }}>
              <AlertTriangle size={13} /> What Arabic makes her say
            </div>
            <div className="grid sm:grid-cols-2">
              <div className="p-4 border-b sm:border-b-0 sm:border-r" style={{ borderColor: LINE, background: '#fef2f2' }}>
                <p className="text-[18px] font-bold leading-snug" style={{ color: RED }}>✗ {lesson.trap.wrong}</p>
              </div>
              <div className="p-4" style={{ background: '#f0fdf4' }}>
                <p onClick={() => speak(lesson.trap.right)} title="Click to hear it"
                   className="text-[18px] font-bold leading-snug cursor-pointer" style={{ color: GREEN }}>✓ {lesson.trap.right}</p>
              </div>
            </div>
            <div className="p-4 bg-white border-t" style={{ borderColor: LINE }}>
              <p className="text-[14px] leading-relaxed">{lesson.trap.why}</p>
              <Ar className="text-stone-600 text-[13.5px] leading-relaxed mt-2 pt-2 border-t" style={{ borderColor: LINE }}>{lesson.trap.whyAr}</Ar>
              {lesson.trap.french && (
                <p className="text-[13.5px] leading-snug mt-2.5 pt-2.5 border-t font-bold" style={{ borderColor: LINE, color: AMBER }}>
                  And her French: {lesson.trap.french}
                </p>
              )}
            </div>
          </div>

          {/* pronunciation */}
          {lesson.sound && (
            <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                <Volume2 size={13} /> {lesson.sound.focus}
                <span dir="rtl" className="font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.sound.focusAr}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                {lesson.sound.pairs.map(([a, b]) => (
                  <div key={a + b} onClick={() => speak(a)} title="Click to hear it — try Slow (S)"
                       className="rounded-lg border px-3 py-2 bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors hover:border-stone-400" style={{ borderColor: LINE }}>
                    <span className="text-[16px] font-bold">{a}</span>
                    <span className="text-[12px] font-bold text-right" style={{ color: MUTED }}>{b}</span>
                  </div>
                ))}
              </div>
              <p className="text-[13.5px] leading-snug">{lesson.sound.tip}</p>
              <Ar className="text-stone-500 text-[13px] mt-1">{lesson.sound.tipAr}</Ar>
              {lesson.sound.gift && (
                <p className="text-[13.5px] font-bold mt-2.5 pt-2.5 border-t" style={{ borderColor: LINE, color: GREEN }}>
                  She already owns this: {lesson.sound.gift}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 3 CONVERSATION ── */}
      {step === 'talk' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD2 }}>
            <p className="text-xl font-bold">{lesson.dialogue.title}</p>
            <Ar className="text-stone-500 text-sm">{lesson.dialogue.titleAr}</Ar>
            <p className="text-[13px] text-stone-600 mt-2 pt-2 border-t" style={{ borderColor: LINE }}>{lesson.dialogue.setting}</p>
            <Ar className="text-stone-500 text-[13px]">{lesson.dialogue.settingAr}</Ar>
          </div>
          <div className="space-y-2">
            {lesson.dialogue.turns.map((t, i) => (
              <div key={i} onClick={() => speak(t.en)} title="Click to hear it"
                   className={`rounded-xl border p-3.5 cursor-pointer transition-colors hover:border-stone-400 ${t.who === 'B' ? 'ml-6' : 'mr-6'}`}
                   style={{ borderColor: t.who === 'B' ? colour : LINE, background: t.who === 'B' ? CARD2 : CARD }}>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: t.who === 'B' ? colour : DIM }}>{t.who}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-medium leading-relaxed"><Hi text={t.en} color={AMBER} /></p>
                    <Ar className="text-stone-600 text-[14px] mt-0.5">{t.ar}</Ar>
                    {t.note && (
                      <p className="text-[12.5px] italic text-stone-500 mt-1.5 pt-1.5 border-t" style={{ borderColor: LINE }}>{t.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {lesson.dialogue.watch && (
            <div className="rounded-xl border-2 p-4" style={{ borderColor: GOLD, background: '#fffbeb' }}>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: AMBER }}>
                Second run — she plays B, book closed. Listen for this.
              </div>
              <p className="text-[15px] leading-snug font-bold">{lesson.dialogue.watch.en}</p>
              <Ar className="text-stone-500 text-[13.5px] mt-1">{lesson.dialogue.watch.ar}</Ar>
            </div>
          )}
        </div>
      )}

      {/* ── 4 YOUR TURN ── */}
      {step === 'yourturn' && (
        <div className="space-y-5">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: colour }}>
              <Users size={13} /> Role play — you are the other person
            </div>
            <p className="text-xl sm:text-2xl font-bold leading-snug">{lesson.practice.roleplay}</p>
            <Ar className="text-stone-500 mt-1.5">{lesson.practice.roleplayAr}</Ar>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {lesson.practice.rounds.map((r, i) => (
              <div key={r} className="rounded-lg border px-4 py-3 flex items-baseline gap-3" style={{ borderColor: LINE, background: CARD }}>
                <span className="text-[12px] font-mono font-bold shrink-0" style={{ color: DIM }}>{i + 1}</span>
                <p className="text-[16px] font-bold leading-snug">{r}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 p-5" style={{ borderColor: GOLD, background: '#fffbeb' }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: AMBER }}>
              <CheckCircle2 size={13} /> Exit check — she can do it, or the lesson runs again tomorrow
            </div>
            <p className="text-[19px] font-bold leading-snug">{lesson.exit.task}</p>
            <Ar className="text-stone-500 mt-1">{lesson.exit.taskAr}</Ar>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: LINE }}>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: MUTED }}>What you are judging</div>
              <p className="text-[16px] font-bold leading-snug">{lesson.exit.pass}</p>
              <Ar className="text-stone-600 text-[14px] mt-0.5">{lesson.exit.passAr}</Ar>
            </div>
          </div>
        </div>
      )}

      {/* ── 5 HOMEWORK ── */}
      {step === 'homework' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-6" style={{ borderColor: colour, background: CARD2 }}>
            <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: colour }}>Before tomorrow</div>
            <p className="text-2xl sm:text-3xl font-bold leading-snug">{lesson.homework.en}</p>
            <Ar className="text-stone-500 mt-2 text-lg">{lesson.homework.ar}</Ar>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
            <div className="text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: MUTED }}>Today she could</div>
            <p className="text-[17px] font-bold leading-snug">“{lesson.canDo.en}”</p>
            <Ar className="text-stone-500 mt-1">{lesson.canDo.ar}</Ar>
          </div>
          <p className="text-[13px] text-stone-600 border-t pt-4" style={{ borderColor: LINE }}>
            This is not extra work — it becomes the first minutes of tomorrow. If she does not do it,
            tomorrow&apos;s step 1 has nothing to recall and the spacing breaks.
          </p>
        </div>
      )}
    </div>
  )
}
