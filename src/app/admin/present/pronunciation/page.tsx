'use client'

/**
 * /admin/present/pronunciation — «ليغو الإنجليزية», the connected-speech deck.
 *
 * A deliberately different room from the writing deck: that one is white paper and
 * ink, this one is a dark recording studio. Sound is the subject, so the design is
 * built around three things you cannot show on paper —
 *
 *   1. LINKING ARCS. Every sentence is written in the course notation
 *      (word~word, word=word, word^word, word+word, (t), *beat*) and rendered with
 *      the joins drawn UNDER the words, colour-coded by type. See <Linked/>.
 *   2. THREE GEARS. The same sentence at dictionary speed → natural → native, each
 *      with its own sound-spelling, spoken aloud on click (1 / 2 / 3 keys).
 *   3. THE BEAT. Stressed syllables carry a dot; everything else is visibly quieter.
 *
 * Audio is the browser's own speech engine — zero assets, works offline, and gives
 * the teacher a reference voice mid-recording. It is a STAND-IN for a human take:
 * any Gear can carry `src` later and the player will prefer the file.
 *
 * Kept from the writing deck on purpose (same fingers, same habits): ← → / Space /
 * side-click, F full-screen, zoom (Ctrl+wheel · pinch · + − 0), M index, N notepad,
 * the lesson-plan slide and the stage rail.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
  Menu, X, ChevronDown, ListTree, StickyNote, Volume2, Mic, Ear, Blocks, Waves, Route,
  Target, AlertTriangle, Wrench, Puzzle, Rabbit, Turtle, Gauge, Sparkles, Check,
  Headphones, ClipboardList, Play, MessageCircle, Repeat, SpellCheck, Turtle as TurtleIcon,
} from 'lucide-react'
import { UNITS, LESSONS, SPELLINGS, PRACTICE, HOMEWORK, type Lesson, type Homework, type Gear as GearLine, type Pair, type Brick, type Beat, type Decode, type Drill, type Spelling, type Practice } from '@/data/pronunciation-course'
import { NotePad, readNote, type DeckCard } from '@/components/present/NotePad'

/* ── palette ─────────────────────────────────────────────────────────────────
   Near-black studio, glass panels, one accent per unit. Text is never pure white:
   #f4f4f5 reads calmer on a projector and on camera. */
const BG = '#07070c'
const TEXT = '#f4f4f5'
const MUTED = 'rgba(244,244,245,0.55)'
const FAINT = 'rgba(244,244,245,0.28)'
const PANEL = 'rgba(255,255,255,0.045)'
const LINE = 'rgba(255,255,255,0.10)'

type Accent = { hex: string; soft: string; glow: string }
const ACCENTS: Accent[] = [
  { hex: '#34d399', soft: 'rgba(52,211,153,0.14)', glow: 'rgba(52,211,153,0.30)' },   // U1 sounds — mint
  { hex: '#fbbf24', soft: 'rgba(251,191,36,0.14)', glow: 'rgba(251,191,36,0.28)' },   // U2 beat — amber
  { hex: '#a78bfa', soft: 'rgba(167,139,250,0.14)', glow: 'rgba(167,139,250,0.30)' }, // U3 glue — violet
  { hex: '#22d3ee', soft: 'rgba(34,211,238,0.14)', glow: 'rgba(34,211,238,0.30)' },   // U4 linking — cyan
  { hex: '#fb7185', soft: 'rgba(251,113,133,0.14)', glow: 'rgba(251,113,133,0.28)' }, // U5 vanishing — rose
  { hex: '#60a5fa', soft: 'rgba(96,165,250,0.14)', glow: 'rgba(96,165,250,0.30)' },   // U6 chunks — sky
]

const ORDERED = [...LESSONS].sort((a, b) => a.no - b.no)
const POS = new Map<Lesson, number>()
ORDERED.forEach((L, i) => POS.set(L, i + 1))
const numOf = (L: Lesson) => POS.get(L) ?? Math.round(L.no)
const unitIdxOf = (no: number) => Math.max(0, UNITS.findIndex(u => no >= u.from && no <= u.to))
const lessonsOf = (ui: number) => ORDERED.filter(L => L.no >= UNITS[ui].from && L.no <= UNITS[ui].to)

/* ── the notation ────────────────────────────────────────────────────────────
   word~word catenation · word=word twins · word^word glide · word+word linking r
   (x) a sound that disappears · *x* the beat.  Everything the deck draws comes
   from these six marks, so a teacher can author a new sentence in plain text. */
const JOINS = { '~': 0, '=': 1, '^': 2, '+': 3 } as const
type JoinKind = keyof typeof JOINS
const JOIN_COLOR: Record<JoinKind, string> = { '~': '#22d3ee', '=': '#fbbf24', '^': '#a78bfa', '+': '#60a5fa' }
const JOIN_NAME: Record<JoinKind, { en: string; ar: string }> = {
  '~': { en: 'link', ar: 'ربط' },
  '=': { en: 'twin', ar: 'توأم' },
  '^': { en: 'glide', ar: 'انزلاق' },
  '+': { en: 'linking r', ar: 'راء وصل' },
}
/** Strip the notation — what the speech engine and the games need. */
const plain = (t: string) => t
  .replace(/\*/g, '')                  // *beat* marks live INSIDE a word — they vanish
  .replace(/[~=^+]/g, ' ')             // join marks live BETWEEN words — they become the space
  .replace(/\(([^)]*)\)/g, '$1')       // a ghosted sound is still written in the careful form
  .replace(/\s+/g, ' ').trim()

/* ── the voice ───────────────────────────────────────────────────────────────
   A pronunciation course cannot be taught by a robot: a robotic vowel teaches a
   robotic vowel, and a student copying a station announcement ends up worse than
   before. So every line is spoken by a real TTS model through /api/tts, which also
   carries a STYLE per gear — the fast take genuinely links its words instead of only
   hurrying. The device voice survives only as a last resort, and the footer says so
   when it is being used, because a fake native model is worse than an honest bad one.

   Text is cleaned before it is spoken: notation marks go, a trailing label like
   "(careful)" goes, ✓/✗ go — you never want the model reading the scaffolding. */
type Gear = 'slow' | 'natural' | 'fast'
const DEVICE_RATE: Record<Gear, number> = { slow: 0.6, natural: 0.95, fast: 1.2 }
/* gpt-4o-mini-tts follows the style instruction more than the speed number, so the
   final tempo ladder is guaranteed here, on playback, with the pitch preserved. */
const PLAY_RATE: Record<Gear, number> = { slow: 1, natural: 1, fast: 1.12 }
/* ── what the voice is actually given ────────────────────────────────────────
   The deck was showing «wuh-ruh-yuh-FRUHM» while the voice carefully said "Where
   are you from" — so the model on screen and the model in the ear disagreed, which
   is worse than no audio at all. A TTS engine reads what it is written, not what a
   native would do to it, so the reduction has to happen in the TEXT before it is
   sent. These are the attested written forms (gonna, didja, wherarya…) that engines
   pronounce the way people really speak.

   slow   = the full careful form, on purpose — that is the dictionary model
   medium = the lexical reductions every native uses even when speaking clearly
   fast   = adds the grammar words: ya · yer · im · er · em · ta · fer · an' · dropped t */
const cap = (src: string, out: string) => (src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out)
const MEDIUM: [RegExp, string][] = [
  [/\bgoing to\b/gi, 'gonna'], [/\bwant to\b/gi, 'wanna'], [/\bwants to\b/gi, 'wantsta'],
  [/\bgot to\b/gi, 'gotta'], [/\bhave to\b/gi, 'hafta'], [/\bhas to\b/gi, 'hasta'],
  [/\bkind of\b/gi, 'kinda'], [/\bsort of\b/gi, 'sorta'], [/\bout of\b/gi, 'outta'],
  [/\ba lot of\b/gi, 'a lotta'], [/\blots of\b/gi, 'lotsa'], [/\bcouple of\b/gi, 'coupla'],
  [/\bshould have\b/gi, 'shoulda'], [/\bcould have\b/gi, 'coulda'], [/\bwould have\b/gi, 'woulda'],
  [/\bmust have\b/gi, 'musta'], [/\bmight have\b/gi, 'mighta'],
  [/\bwhat do you\b/gi, 'whaddaya'], [/\bwhat are you\b/gi, 'whaddaya'], [/\bwhat did you\b/gi, 'whatja'],
  [/\bwhere are you\b/gi, 'wherarya'], [/\bhow are you\b/gi, 'howarya'],
  [/\bdid you\b/gi, 'didja'], [/\bwould you\b/gi, 'wouldja'], [/\bcould you\b/gi, 'couldja'],
  [/\bdon’t you\b|\bdon't you\b/gi, 'doncha'], [/\bmeet you\b/gi, 'meetcha'], [/\bgot you\b/gi, 'gotcha'],
]
const FAST: [RegExp, string][] = [
  [/\byou\b/gi, 'ya'], [/\byour\b/gi, 'yer'], [/\bhim\b/gi, 'im'], [/\bher\b/gi, 'er'],
  [/\bthem\b/gi, 'em'], [/\bbecause\b/gi, 'cuz'], [/\babout\b/gi, 'bout'],
  [/\band\b/gi, "an'"], [/\bto\b/gi, 'ta'], [/\bfor\b/gi, 'fer'], [/\bof\b/gi, "o'"],
]
const reduce = (text: string, gear: Gear) => {
  if (gear === 'slow') return text
  let t = text
  for (const [re, to] of MEDIUM) t = t.replace(re, m => cap(m, to))
  if (gear === 'fast') {
    for (const [re, to] of FAST) t = t.replace(re, m => cap(m, to))
    // t drops between consonants: las(t) night · nex(t) day · jus(t) go. Kept out of the
    // table above because that path runs every match through cap() and eats capture groups.
    t = t.replace(/\b(las|nex|jus|mus|firs|bes|mos)t (?=[bcdfghjklmnpqrstvwxyz])/gi, (_m, w) => `${w} `)
  }
  return t
}

const sayable = (t: string) => plain(t.replace(/\s*\([^)]*\)\s*$/, '')).replace(/[✓✗·—]/g, ' ').replace(/\s+/g, ' ').trim()
const ttsUrl = (text: string, gear: Gear) => `/api/tts?g=${gear}&t=${encodeURIComponent(text)}`

function useVoice() {
  const el = useRef<HTMLAudioElement | null>(null)
  const seq = useRef(0)
  const [busy, setBusy] = useState(false)
  const [engine, setEngine] = useState<'real' | 'device'>('real')

  const device = useCallback((text: string, gear: Gear, onEnd?: () => void) => {
    setEngine('device')
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = DEVICE_RATE[gear]
    const vs = window.speechSynthesis.getVoices()
    const v = vs.find(x => /en[-_]US/i.test(x.lang)) ?? vs.find(x => /^en/i.test(x.lang))
    if (v) u.voice = v
    u.onend = () => onEnd?.()
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    seq.current++
    try { window.speechSynthesis.cancel() } catch { /* no engine */ }
    const a = el.current
    if (a) { a.pause(); a.currentTime = 0 }
    setBusy(false)
  }, [])

  const say = useCallback((raw: string, gear: Gear = 'natural', onEnd?: () => void) => {
    const text = reduce(sayable(raw), gear)
    if (!text) return
    stop()
    const mine = ++seq.current
    const a = el.current ?? (el.current = new Audio())
    const fell = { over: false }
    const fallback = () => {
      if (fell.over || seq.current !== mine) return
      fell.over = true; setBusy(false); device(text, gear, onEnd)
    }
    a.onended = () => { if (seq.current === mine) { setBusy(false); onEnd?.() } }
    a.onerror = fallback
    a.playbackRate = PLAY_RATE[gear]
    // Safari/Chrome spell this differently; both keep the voice from turning into a chipmunk.
    ;(a as HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean }).preservesPitch = true
    ;(a as HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean }).webkitPreservesPitch = true
    a.src = ttsUrl(text, gear)
    setBusy(true)
    a.play().then(() => { if (seq.current === mine) setEngine('real') }).catch(fallback)
  }, [device, stop])

  /** Warm a line before the teacher clicks it — the first play should be instant. */
  const prime = useCallback((raw: string, gear: Gear = 'natural') => {
    const text = reduce(sayable(raw), gear)
    if (text) fetch(ttsUrl(text, gear)).catch(() => { /* the click will fall back */ })
  }, [])

  useEffect(() => () => { try { window.speechSynthesis.cancel() } catch { /* no engine */ } }, [])
  return { say, stop, prime, busy, engine }
}

/* ── <Linked/> — the signature renderer ──────────────────────────────────────
   Words sit in a flex row; a small arc is drawn BETWEEN two words wherever the
   notation joins them, so the eye sees the bridge the mouth has to make. */
function Word({ raw, size, accent }: { raw: string; size: number; accent: string }) {
  // *stress* → dotted + accented · (t) → the ghost of a deleted sound. The ghost is
  // capped at two letters on purpose: a bracketed aside in prose is not a dropped /t/.
  const parts = raw.split(/(\*[^*]+\*|\([a-zA-Z]{1,2}\))/g).filter(Boolean)
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {parts.map((p, i) => {
        if (p.startsWith('*') && p.endsWith('*')) {
          return (
            <span key={i} style={{ position: 'relative', color: accent, fontWeight: 900 }}>
              <span style={{
                position: 'absolute', top: '-0.62em', left: '50%', transform: 'translateX(-50%)',
                width: size * 0.14, height: size * 0.14, borderRadius: 99, background: accent,
                boxShadow: `0 0 ${size * 0.3}px ${accent}`,
              }} />
              {p.slice(1, -1)}
            </span>
          )
        }
        if (/^\([a-zA-Z]{1,2}\)$/.test(p)) {
          return <span key={i} style={{ opacity: 0.26, textDecoration: 'line-through', textDecorationThickness: 2 }}>{p.slice(1, -1)}</span>
        }
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

function Arc({ kind, size }: { kind: JoinKind; size: number }) {
  const w = Math.max(16, size * 0.62), h = Math.max(10, size * 0.34)
  return (
    <svg width={w} height={h} viewBox="0 0 24 14" style={{ display: 'inline-block', verticalAlign: 'bottom', marginBottom: -h * 0.32 }} aria-hidden>
      <path d="M2 2 C 7 14, 17 14, 22 2" fill="none" stroke={JOIN_COLOR[kind]} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  )
}

function Linked({ text, size, accent, className }: { text: string; size: number; accent: string; className?: string }) {
  const groups = text.split(' ').filter(Boolean)
  return (
    <div dir="ltr" className={`flex flex-wrap items-end justify-center ${className ?? ''}`}
      style={{ fontSize: size, lineHeight: 1.45, fontWeight: 800, color: TEXT, columnGap: size * 0.28, rowGap: size * 0.5 }}>
      {groups.map((g, gi) => {
        const bits = g.split(/([~=^+])/g).filter(Boolean)
        return (
          <span key={gi} className="inline-flex items-end">
            {bits.map((b, bi) =>
              b in JOINS
                ? <Arc key={bi} kind={b as JoinKind} size={size} />
                : <Word key={bi} raw={b} size={size} accent={accent} />)}
          </span>
        )
      })}
    </div>
  )
}

/** The sound-spelling line. CAPITAL runs are the beat, so they get the accent. */
function Say({ text, size, accent, dim }: { text: string; size: number; accent: string; dim?: boolean }) {
  const parts = text.split(/([A-Z]{2,})/g).filter(Boolean)
  return (
    <div dir="ltr" className="text-center font-black tracking-tight"
      style={{ fontSize: size, color: dim ? FAINT : MUTED, fontFamily: "'Outfit', sans-serif" }}>
      {parts.map((p, i) => /^[A-Z]{2,}$/.test(p)
        ? <span key={i} style={{ color: dim ? MUTED : accent }}>{p}</span>
        : <span key={i}>{p}</span>)}
    </div>
  )
}

/** Inline *emphasis* for the fields that are printed as prose, not as notation. */
function Mark({ text, accent }: { text: string; accent: string }) {
  return <>{text.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, i) =>
    p.startsWith('*') && p.endsWith('*')
      ? <span key={i} style={{ color: accent, fontWeight: 900 }}>{p.slice(1, -1)}</span>
      : <span key={i}>{p}</span>)}</>
}

function SpeakBtn({ onClick, label, accent, big }: { onClick: () => void; label?: string; accent: string; big?: boolean }) {
  // The take is fetched, so a click can cost a beat: pulse locally rather than let
  // the teacher wonder whether the button worked on camera.
  const [hit, setHit] = useState(false)
  useEffect(() => { if (!hit) return; const t = setTimeout(() => setHit(false), 1200); return () => clearTimeout(t) }, [hit])
  return (
    <button onClick={e => { e.stopPropagation(); setHit(true); onClick() }} title="استمع (S)"
      className="inline-flex items-center gap-2 rounded-full transition hover:brightness-125 shrink-0"
      style={{
        padding: big ? '0.9vh 1.1vw' : '0.6vh 0.8vw', background: hit ? accent : 'rgba(255,255,255,0.06)',
        boxShadow: `inset 0 0 0 1.5px ${accent}55`, color: hit ? '#07070c' : accent,
        fontWeight: 900, fontSize: big ? '0.95vw' : '0.8vw',
      }}>
      <Volume2 size={big ? 18 : 14} className={hit ? 'animate-pulse' : ''} />{label}
    </button>
  )
}

/* Three takes of the SAME line, everywhere audio appears — careful, connected at
   medium speed, connected at native speed. One button is a demo; three buttons are
   a lesson, because the ear only learns the fast form by hearing what it came from. */
const GEAR_UI: { key: Gear; en: string; ar: string; Icon: typeof Target }[] = [
  { key: 'slow', en: 'Word by word', ar: 'كلمة كلمة', Icon: TurtleIcon },
  { key: 'natural', en: 'Connected', ar: 'مترابطة', Icon: Gauge },
  { key: 'fast', en: 'Native speed', ar: 'سرعة الناطق', Icon: Rabbit },
]
function GearRow({ text, accent, say, compact }: {
  text: string; accent: string; compact?: boolean
  say: (t: string, g?: Gear, onEnd?: () => void) => void
}) {
  const [on, setOn] = useState<Gear | null>(null)
  useEffect(() => { if (!on) return; const t = setTimeout(() => setOn(null), 1600); return () => clearTimeout(t) }, [on])
  return (
    <div className="flex items-center gap-[0.5vw] flex-wrap justify-center">
      {GEAR_UI.map(g => (
        <button key={g.key} onClick={e => { e.stopPropagation(); setOn(g.key); say(text, g.key) }}
          className="flex items-center gap-[0.4vw] rounded-2xl font-black transition hover:brightness-125"
          style={{
            padding: compact ? '0.5vh 0.7vw' : '0.8vh 1.1vw',
            fontSize: compact ? '0.75vw' : '0.88vw',
            background: on === g.key ? accent : 'rgba(255,255,255,0.06)',
            color: on === g.key ? '#07070c' : MUTED,
            boxShadow: on === g.key ? `0 0 40px -10px ${accent}` : `inset 0 0 0 1.5px ${LINE}`,
          }}>
          <g.Icon size={compact ? 13 : 15} /> {g.en} <Ar inline style={{ opacity: 0.75 }}>· {g.ar}</Ar>
        </button>
      ))}
    </div>
  )
}

/* ── ear training ────────────────────────────────────────────────────────────
   The first task of the course was broken: for a «careful vs real» pair the two
   cards are the SAME word, so one voice said it twice and there was nothing to
   identify. The difference lives in the sound-spelling, so the careful side is now
   spoken syllable-by-syllable at teaching speed and the real side at native speed —
   two audibly different takes — and then the student is TESTED: one of them plays at
   random and they have to pick which. That is what an ear-training task is. */
const bare = (t: string) => t.replace(/\s*\([^)]*\)\s*$/, '').replace(/[✓✗]/g, '').trim()
const syllabify = (say: string) => say.toLowerCase().replace(/[·]/g, ' ').replace(/-/g, ', ')

function PairGame({ p, step, accent, say }: {
  p: Pair; step: number; accent: string
  say: (t: string, g?: Gear, onEnd?: () => void) => void
}) {
  const twin = bare(p.a).toLowerCase() === bare(p.b).toLowerCase()   // careful-vs-real, not a minimal pair
  const takes = [
    { text: twin ? syllabify(p.sayA) : bare(p.a), gear: (twin ? 'slow' : 'natural') as Gear },
    { text: bare(p.b), gear: (twin ? 'fast' : 'natural') as Gear },
  ]
  const [quiz, setQuiz] = useState<number | null>(null)
  const [answer, setAnswer] = useState<number | null>(null)
  useEffect(() => { setQuiz(null); setAnswer(null) }, [p])

  const playOne = (i: number) => say(takes[i].text, takes[i].gear)
  const compare = () => say(takes[0].text, takes[0].gear, () => setTimeout(() => say(takes[1].text, takes[1].gear), 420))
  const startQuiz = () => { const pick = Math.random() < 0.5 ? 0 : 1; setAnswer(null); setQuiz(pick); say(takes[pick].text, takes[pick].gear) }

  return (
    <div className="w-full flex flex-col items-center gap-[2.2vh]">
      <div className="w-full grid grid-cols-2 gap-[1.4vw]">
        {[p.a, p.b].map((w, i) => {
          const chosen = answer === i
          const right = quiz !== null && answer !== null && i === quiz
          const wrong = chosen && quiz !== null && i !== quiz
          return (
            <button key={i} onClick={() => (quiz !== null && answer === null ? setAnswer(i) : playOne(i))}
              className="rounded-3xl px-[1.4vw] py-[3vh] flex flex-col items-center gap-[1vh] transition hover:brightness-125"
              style={{
                background: right ? 'rgba(52,211,153,0.16)' : wrong ? 'rgba(251,113,133,0.16)' : PANEL,
                boxShadow: `inset 0 0 0 ${right || wrong ? 2 : 1.5}px ${right ? '#34d399' : wrong ? '#fb7185' : i ? accent + '55' : LINE}`,
              }}>
              <div dir="ltr" className="font-black" style={{ color: i && !twin ? accent : TEXT, fontSize: '2.8vw' }}>{w}</div>
              <Say text={i ? p.sayB : p.sayA} size={21} accent={accent} />
              {quiz === null && <SpeakBtn onClick={() => playOne(i)} accent={accent} label="استمع" />}
              {right && <span className="font-black" style={{ color: '#34d399', fontSize: '0.9vw' }}>✓ هذه هي</span>}
              {wrong && <span className="font-black" style={{ color: '#fb7185', fontSize: '0.9vw' }}>✗ ليست هذه</span>}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-[0.8vw]">
        <button onClick={compare}
          className="flex items-center gap-2 rounded-full font-black transition hover:brightness-125"
          style={{ padding: '0.8vh 1.2vw', background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1.5px ${LINE}`, color: MUTED, fontSize: '0.85vw' }}>
          <Repeat size={15} /> <Ar inline>قارن — استمع للاثنين</Ar>
        </button>
        <button onClick={startQuiz}
          className="flex items-center gap-2 rounded-full font-black transition hover:brightness-125"
          style={{ padding: '0.8vh 1.2vw', background: accent, color: '#07070c', fontSize: '0.85vw' }}>
          <Ear size={15} /> <Ar inline>{quiz === null ? 'اختبرني — أيّهما سمعت؟' : 'مرّة أخرى'}</Ar>
        </button>
        {quiz !== null && answer === null && (
          <Ar className="font-bold" style={{ color: FAINT, fontSize: '0.9vw' }}>اضغط البطاقة التي سمعتها</Ar>
        )}
      </div>

      {step >= 1 && <Ar className="font-black" style={{ color: MUTED, fontSize: '1.25vw' }}>{p.ar}</Ar>}
    </div>
  )
}

/* ═══════════════════ slides ═══════════════════ */
type Phase = 'cover' | 'plan' | 'goal' | 'how' | 'spellings' | 'practice' | 'pairs' | 'bricks' | 'beats' | 'gears' | 'decode' | 'drill' | 'play' | 'homework'
type Stage = { phase: Phase; at: number; count: number }
type Flow = { L: Lesson; stages: Stage[]; from: number }
type Slide =
  | { t: 'intro' }
  | { t: 'end' }
  | { t: 'unit'; ui: number }
  | { t: 'cover'; L: Lesson }
  | { t: 'plan'; L: Lesson; stages: Stage[] }
  | { t: 'goal'; L: Lesson }
  | { t: 'how'; L: Lesson }
  | { t: 'spellings'; L: Lesson; rows: Spelling[] }
  | { t: 'practice'; L: Lesson; item: Practice; page: number; pages: number }
  | { t: 'pairs'; L: Lesson; item: Pair; page: number; pages: number }
  | { t: 'bricks'; L: Lesson }
  | { t: 'beats'; L: Lesson; item: Beat; page: number; pages: number }
  | { t: 'gears'; L: Lesson; item: GearLine; page: number; pages: number }
  | { t: 'decode'; L: Lesson; item: Decode; page: number; pages: number }
  | { t: 'drill'; L: Lesson }
  | { t: 'play'; L: Lesson; sentence: string }
  | { t: 'homework'; L: Lesson; hw: Homework }

const PHASE: Record<Phase, { en: string; ar: string; Icon: typeof Target }> = {
  cover:    { en: 'Lesson',        ar: 'الدرس',        Icon: Play },
  plan:     { en: 'Plan',          ar: 'خطة الدرس',    Icon: Route },
  goal:     { en: 'The Promise',   ar: 'الوعد',        Icon: Target },
  how:      { en: 'How It Works',  ar: 'كيف يعمل',     Icon: Wrench },
  spellings:{ en: 'Which Letters',  ar: 'أيّ الحروف تعطي هذا الصوت', Icon: SpellCheck },
  practice: { en: 'Your Turn — Say It', ar: 'دورك — انطقها', Icon: Mic },
  pairs:    { en: 'Train the Ear', ar: 'درّب أذنك',    Icon: Ear },
  bricks:   { en: 'The Bricks',    ar: 'القطع',        Icon: Blocks },
  beats:    { en: 'The Beat',      ar: 'الإيقاع',      Icon: Waves },
  gears:    { en: 'Three Gears',   ar: 'السرعات الثلاث', Icon: Gauge },
  decode:   { en: 'What Did You Hear?', ar: 'ماذا سمعت؟', Icon: Headphones },
  drill:    { en: 'Repeat After Me', ar: 'ردّد بعدي',  Icon: Repeat },
  play:     { en: 'Snap the Bricks', ar: 'ركّب القطع', Icon: Puzzle },
  homework: { en: 'Homework',      ar: 'الواجب',       Icon: ClipboardList },
}

function buildSlides(): { slides: Slide[]; jump: Record<number, number>; unitJump: number[]; flow: Record<number, Flow> } {
  const slides: Slide[] = [{ t: 'intro' }]
  const jump: Record<number, number> = {}
  const unitJump: number[] = []
  const flow: Record<number, Flow> = {}
  let unit = -1
  for (const L of ORDERED) {
    const ui = unitIdxOf(L.no)
    if (ui !== unit) { unit = ui; unitJump[ui] = slides.length; slides.push({ t: 'unit', ui }) }
    jump[L.no] = slides.length
    const from = slides.length
    slides.push({ t: 'cover', L })
    const planAt = slides.length
    slides.push({ t: 'plan', L, stages: [] })
    slides.push({ t: 'goal', L }, { t: 'how', L })
    const rows = SPELLINGS[L.no]
    if (rows?.length) slides.push({ t: 'spellings', L, rows })
    L.pairs?.forEach((item, i) => slides.push({ t: 'pairs', L, item, page: i + 1, pages: L.pairs!.length }))
    if (L.bricks?.length) slides.push({ t: 'bricks', L })
    L.beats?.forEach((item, i) => slides.push({ t: 'beats', L, item, page: i + 1, pages: L.beats!.length }))
    L.gears?.forEach((item, i) => slides.push({ t: 'gears', L, item, page: i + 1, pages: L.gears!.length }))
    const prac = PRACTICE[L.no] ?? []
    prac.forEach((item, i) => slides.push({ t: 'practice', L, item, page: i + 1, pages: prac.length }))
    L.decode?.forEach((item, i) => slides.push({ t: 'decode', L, item, page: i + 1, pages: L.decode!.length }))
    if (L.drill?.length) slides.push({ t: 'drill', L })
    // every lesson ends on a build, made from its own first gear sentence
    const g = L.gears?.[0]
    if (g) slides.push({ t: 'play', L, sentence: g.en })
    slides.push({ t: 'homework', L, hw: HOMEWORK[L.no] ?? { words: [], pairs: [], chunks: [] } })

    const stages: Stage[] = []
    for (let i = planAt + 1; i < slides.length; i++) {
      const ph = slides[i].t as Phase
      const tail = stages[stages.length - 1]
      if (tail && tail.phase === ph) tail.count++
      else stages.push({ phase: ph, at: i, count: 1 })
    }
    ;(slides[planAt] as Extract<Slide, { t: 'plan' }>).stages = stages
    const f: Flow = { L, stages, from }
    for (let i = from; i < slides.length; i++) flow[i] = f
  }
  slides.push({ t: 'end' })
  return { slides, jump, unitJump, flow }
}

const stepsOf = (s?: Slide) => {
  if (!s) return 0
  if (s.t === 'how') return s.L.how.length
  if (s.t === 'bricks') return s.L.bricks?.length ?? 0
  if (s.t === 'drill') return s.L.drill?.length ?? 0
  if (s.t === 'gears') return 2          // slow → natural → fast
  if (s.t === 'pairs' || s.t === 'decode' || s.t === 'play' || s.t === 'beats' || s.t === 'practice') return 1
  if (s.t === 'spellings') return s.rows.length
  if (s.t === 'goal') return 1
  if (s.t === 'homework') return 3
  return 0
}

const accentOf = (s: Slide): Accent =>
  s.t === 'unit' ? ACCENTS[s.ui % ACCENTS.length]
    : 'L' in s ? ACCENTS[unitIdxOf(s.L.no) % ACCENTS.length]
      : ACCENTS[0]

/* ═══════════════════ small pieces ═══════════════════ */
/* Arabic text. `inline` renders a <span> — an Arabic phrase sitting inside an English
   line is a span, not a block, and a <div> there breaks DOM nesting on hydration. */
const Ar = ({ children, className, style, inline }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; inline?: boolean }) => {
  const props = { dir: 'rtl' as const, className, style: { fontFamily: "'Tajawal', sans-serif", ...style } }
  return inline ? <span {...props}>{children}</span> : <div {...props}>{children}</div>
}

/** Viewport width, SSR-safe — the linking arcs need real pixels, not vw strings. */
function useVW() {
  const [w, setW] = useState(1440)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    on(); window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

function Heading({ en, ar, Icon, accent }: { en: string; ar: string; Icon: typeof Target; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-[0.5vh]">
      <div className="flex items-center gap-[0.6vw]">
        <Icon size={18} style={{ color: accent }} />
        <span className="font-black tracking-[0.18em] uppercase" style={{ color: accent, fontSize: '0.85vw' }}>{en}</span>
      </div>
      <Ar className="font-black" style={{ color: TEXT, fontSize: '1.9vw' }}>{ar}</Ar>
    </div>
  )
}

function Panel({ children, accent, glow, className, style }: { children: React.ReactNode; accent?: string; glow?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className ?? ''}`}
      style={{
        background: PANEL,
        boxShadow: `inset 0 0 0 1.5px ${accent ? accent + '44' : LINE}${glow && accent ? `, 0 0 60px -20px ${accent}` : ''}`,
        ...style,
      }}>{children}</div>
  )
}

/** The three-gear player — the heart of the course. */
function GearBox({ g, step, accent, say }: { g: GearLine; step: number; accent: string; say: (t: string, g?: Gear) => void }) {
  const vw = useVW()
  const gears = [
    { key: 'slow', Icon: Turtle, label: 'Slow', ar: 'بطيء', rate: 0.55, text: g.slow },
    { key: 'natural', Icon: Gauge, label: 'Natural', ar: 'طبيعي', rate: 0.92, text: g.natural },
    { key: 'fast', Icon: Rabbit, label: 'Native', ar: 'سريع', rate: 1.22, text: g.fast },
  ]
  const [picked, setPicked] = useState(0)
  useEffect(() => { setPicked(Math.min(step, 2)) }, [step, g])
  const cur = gears[picked]
  return (
    <div className="w-full flex flex-col items-center gap-[2.2vh]">
      <Linked text={g.en} size={vw > 1500 ? 46 : 38} accent={accent} />
      <Ar className="font-bold text-center" style={{ color: MUTED, fontSize: '1.15vw' }}>{g.ar}</Ar>

      <div className="flex items-center gap-[0.5vw]">
        {gears.map((x, i) => {
          const on = i === picked
          const open = i <= step
          return (
            <button key={x.key} disabled={!open} onClick={() => { setPicked(i); say(g.en, x.key as Gear) }}
              className="flex items-center gap-[0.45vw] rounded-2xl transition disabled:opacity-25"
              style={{
                padding: '0.9vh 1.2vw',
                background: on ? accent : 'rgba(255,255,255,0.05)',
                color: on ? '#07070c' : MUTED,
                boxShadow: on ? `0 0 40px -8px ${accent}` : `inset 0 0 0 1.5px ${LINE}`,
                fontWeight: 900, fontSize: '0.9vw',
              }}>
              <x.Icon size={16} /> {x.label}
              <span style={{ fontFamily: "'Tajawal', sans-serif", opacity: 0.75 }}>· {x.ar}</span>
            </button>
          )
        })}
      </div>

      <Panel accent={accent} glow className="w-full px-[2vw] py-[2.4vh] flex flex-col items-center gap-[1.2vh]">
        <div className="flex items-center gap-[0.6vw]">
          <cur.Icon size={16} style={{ color: accent }} />
          <span className="font-black tracking-[0.2em] uppercase" style={{ color: accent, fontSize: '0.72vw' }}>{cur.label} · {Math.round(cur.rate * 100)}%</span>
        </div>
        <Say text={cur.text} size={picked === 0 ? 30 : picked === 1 ? 34 : 38} accent={accent} />
        <SpeakBtn onClick={() => say(g.en, cur.key as Gear)} accent={accent} label="استمع" big />
      </Panel>

      {g.why && step >= 2 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-[62vw] text-center font-bold" style={{ color: FAINT, fontSize: '0.95vw' }}>
          {g.why}
        </motion.div>
      )}
    </div>
  )
}

/** Click the words back into order — the LEGO game, one per lesson. */
function SnapGame({ sentence, revealed, accent, say }: { sentence: string; revealed: boolean; accent: string; say: (t: string, g?: Gear) => void }) {
  const words = useMemo(() => plain(sentence).split(' '), [sentence])
  const shuffled = useMemo(() => {
    // stable shuffle — the same puzzle every time this slide is opened
    const a = words.map((w, i) => ({ w, i }))
    let seed = words.join('').length * 7919
    for (let i = a.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) % 2147483648; const j = seed % (i + 1);[a[i], a[j]] = [a[j], a[i]] }
    return a
  }, [words])
  const [built, setBuilt] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  useEffect(() => { setBuilt([]); setWrong(null) }, [sentence])
  const done = built.length === words.length
  const tap = (i: number) => {
    if (built.includes(i)) return
    if (i === built.length) { const next = [...built, i]; setBuilt(next); if (next.length === words.length) say(sentence, 'natural') }
    else { setWrong(i); setTimeout(() => setWrong(null), 350) }
  }
  return (
    <div className="w-full flex flex-col items-center gap-[2.4vh]">
      <Panel accent={done || revealed ? accent : undefined} glow={done}
        className="w-full min-h-[16vh] px-[2vw] py-[2.4vh] flex flex-wrap items-center justify-center gap-[0.6vw]">
        {built.length === 0 && !revealed && (
          <Ar className="font-bold" style={{ color: FAINT, fontSize: '1.1vw' }}>اضغط الكلمات بالترتيب الصحيح</Ar>
        )}
        {(revealed ? words.map((_, i) => i) : built).map(i => (
          <motion.span key={i} initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl font-black"
            style={{ padding: '0.7vh 0.9vw', background: accent, color: '#07070c', fontSize: '1.5vw' }}>{words[i]}</motion.span>
        ))}
      </Panel>

      {!revealed && (
        <div className="flex flex-wrap items-center justify-center gap-[0.6vw] max-w-[76vw]">
          {shuffled.map(({ w, i }) => {
            const used = built.includes(i)
            return (
              <button key={i} onClick={() => tap(i)} disabled={used}
                className="rounded-xl font-black transition"
                style={{
                  padding: '0.7vh 0.9vw', fontSize: '1.35vw',
                  background: used ? 'rgba(255,255,255,0.03)' : wrong === i ? '#f43f5e' : 'rgba(255,255,255,0.07)',
                  color: used ? FAINT : TEXT,
                  boxShadow: `inset 0 0 0 1.5px ${used ? 'transparent' : LINE}`,
                  opacity: used ? 0.35 : 1,
                }}>{w}</button>
            )
          })}
        </div>
      )}

      {(done || revealed) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-[1.4vh]">
          <Linked text={sentence} size={34} accent={accent} />
          <GearRow text={sentence} accent={accent} say={say} />
        </motion.div>
      )}
    </div>
  )
}

/* ═══════════════════ the slide renderer ═══════════════════ */
function SlideView({ s, step, say, onJump, onJumpUnit }: {
  s: Slide; step: number; say: (t: string, g?: Gear, onEnd?: () => void) => void
  onJump: (no: number) => void; onJumpUnit: (ui: number) => void
}) {
  const AC = accentOf(s)

  if (s.t === 'intro') return (
    <div className="w-full max-w-[86vw] flex flex-col items-center gap-[2.6vh] text-center">
      <div className="flex items-center gap-[0.7vw]">
        <Waves size={20} style={{ color: ACCENTS[3].hex }} />
        <span className="font-black tracking-[0.3em] uppercase" style={{ color: ACCENTS[3].hex, fontSize: '0.9vw' }}>Connected Speech · A0 → A2</span>
      </div>
      <h1 className="font-black leading-[0.95] tracking-tight" style={{ color: TEXT, fontSize: '5.4vw' }}>
        LEGO <span style={{ color: ACCENTS[0].hex }}>English</span>
      </h1>
      <Ar className="font-black" style={{ color: TEXT, fontSize: '2.6vw' }}>ليغو الإنجليزية — تكلّم بانسياب</Ar>
      <Ar className="font-bold max-w-[54vw]" style={{ color: MUTED, fontSize: '1.25vw', lineHeight: 2 }}>
        لماذا لا تفهمهم وهم يتكلّمون؟ لأنهم لا ينطقون الكلمات مفردة — بل يلصقونها.
        في هذه الدورة تتعلّم كيف تلتصق الكلمات ببعضها كقطع الليغو: تسمعها، ثم تنطقها.
      </Ar>
      <div className="mt-[1vh] grid grid-cols-3 gap-[1vw] w-full max-w-[70vw]">
        {UNITS.map((u, i) => (
          <button key={i} onClick={() => onJumpUnit(i)}
            className="text-left rounded-2xl px-[1.2vw] py-[1.6vh] transition hover:brightness-125"
            style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${ACCENTS[i].hex}33` }}>
            <div className="flex items-center gap-[0.5vw]">
              <span className="grid place-items-center rounded-lg font-black shrink-0"
                style={{ width: '1.7vw', height: '1.7vw', background: ACCENTS[i].hex, color: '#07070c', fontSize: '0.8vw' }}>{i + 1}</span>
              <span className="font-black truncate" style={{ color: TEXT, fontSize: '0.95vw' }}>{u.short}</span>
              <span className="ml-auto font-black shrink-0" style={{ color: FAINT, fontSize: '0.75vw' }}>{lessonsOf(i).length}</span>
            </div>
            <Ar className="mt-[0.6vh] font-bold" style={{ color: MUTED, fontSize: '0.85vw' }}>{u.shortAr}</Ar>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-[1.4vw] font-bold" style={{ color: FAINT, fontSize: '0.85vw' }}>
        <span>{ORDERED.length} lessons</span><span>·</span><span>{UNITS.length} units</span><span>·</span>
        <span style={{ color: ACCENTS[0].hex }}>Space ← → للتنقّل · S للاستماع</span>
      </div>
    </div>
  )

  if (s.t === 'unit') {
    const u = UNITS[s.ui]
    const list = lessonsOf(s.ui)
    return (
      <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.4vh] text-center">
        <span className="grid place-items-center rounded-2xl font-black"
          style={{ width: '4.4vw', height: '4.4vw', background: AC.hex, color: '#07070c', fontSize: '2.2vw', boxShadow: `0 0 80px -10px ${AC.hex}` }}>
          {s.ui + 1}
        </span>
        <h2 className="font-black tracking-tight" style={{ color: TEXT, fontSize: '3.4vw' }}>{u.en.split(' · ')[1]}</h2>
        <Ar className="font-black" style={{ color: AC.hex, fontSize: '2.1vw' }}>{u.ar.split(' · ')[1]}</Ar>
        <Ar className="font-bold max-w-[54vw]" style={{ color: MUTED, fontSize: '1.2vw', lineHeight: 1.9 }}>{u.promiseAr}</Ar>
        <div className="flex flex-wrap items-center justify-center gap-[0.5vw] mt-[1vh]">
          {list.map(L => (
            <button key={L.no} onClick={() => onJump(L.no)}
              className="rounded-xl font-black transition hover:brightness-125"
              style={{ padding: '0.6vh 0.9vw', background: PANEL, color: MUTED, boxShadow: `inset 0 0 0 1.5px ${LINE}`, fontSize: '0.85vw' }}>
              {numOf(L)} · {L.tag}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'cover') {
    const ui = unitIdxOf(s.L.no)
    return (
      <div className="w-full flex flex-col items-center gap-[1.6vh] text-center">
        <span className="font-black tracking-[0.24em] uppercase" style={{ color: AC.hex, fontSize: '0.85vw' }}>
          {UNITS[ui].en} · Lesson {numOf(s.L)} of {ORDERED.length}
        </span>
        {s.L.ipa && (
          <div className="grid place-items-center rounded-full font-black my-[0.6vh]"
            style={{ width: '9vw', height: '9vw', color: AC.hex, fontSize: '2.6vw', background: AC.soft, boxShadow: `inset 0 0 0 2px ${AC.hex}55, 0 0 90px -18px ${AC.hex}` }}>
            {s.L.ipa}
          </div>
        )}
        <h1 className="font-black leading-[1.02] tracking-tight max-w-[74vw]" style={{ color: TEXT, fontSize: '3.6vw' }}><Mark text={s.L.title} accent={AC.hex} /></h1>
        <Ar className="font-black" style={{ color: MUTED, fontSize: '2.1vw' }}>{s.L.titleAr}</Ar>
      </div>
    )
  }

  if (s.t === 'plan') return (
    <div className="w-full max-w-[74vw] flex flex-col items-center gap-[2.2vh]">
      <Heading en="Lesson Plan" ar="خطة الدرس — ماذا سنفعل الآن" Icon={Route} accent={AC.hex} />
      <div className="w-full grid grid-cols-2 gap-x-[1.4vw] gap-y-[1vh]">
        {s.stages.map((st, i) => {
          const m = PHASE[st.phase]
          return (
            <div key={`${st.phase}-${st.at}`} className="flex items-center gap-[0.8vw] rounded-2xl px-[1vw] py-[1vh]"
              style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${LINE}` }}>
              <span className="grid place-items-center rounded-xl font-black shrink-0"
                style={{ width: '2vw', height: '2vw', background: AC.soft, color: AC.hex, fontSize: '0.85vw' }}>{i + 1}</span>
              <m.Icon size={16} style={{ color: AC.hex }} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-black truncate" style={{ color: TEXT, fontSize: '1vw' }}>{m.en}</span>
                <Ar className="block font-bold truncate" style={{ color: FAINT, fontSize: '0.85vw' }}>{m.ar}</Ar>
              </span>
              {st.count > 1 && <span className="shrink-0 rounded-full px-2 font-black" style={{ background: 'rgba(255,255,255,0.06)', color: MUTED, fontSize: '0.78vw' }}>×{st.count}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (s.t === 'goal') return (
    <div className="w-full max-w-[70vw] flex flex-col items-center gap-[2.6vh]">
      <Heading en="The Promise" ar="ماذا ستكسب من هذا الدرس" Icon={Target} accent={AC.hex} />
      <Panel accent={AC.hex} glow className="w-full px-[2.2vw] py-[3vh] flex flex-col items-center gap-[1.4vh]">
        <div dir="ltr" className="font-black text-center leading-[1.3]" style={{ color: TEXT, fontSize: '1.9vw' }}><Mark text={s.L.goal.en} accent={AC.hex} /></div>
        <Ar className="font-bold text-center" style={{ color: MUTED, fontSize: '1.35vw' }}>{s.L.goal.ar}</Ar>
      </Panel>
      {step >= 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <Panel className="w-full px-[2vw] py-[2.2vh] flex items-start gap-[1vw]" style={{ background: 'rgba(251,113,133,0.07)' }}>
            <AlertTriangle size={20} style={{ color: '#fb7185' }} className="shrink-0 mt-[0.4vh]" />
            <div className="flex-1">
              <div className="font-black" style={{ color: '#fb7185', fontSize: '0.8vw', letterSpacing: '0.18em' }}>THE ARABIC TRAP · الفخّ العربي</div>
              <div dir="ltr" className="mt-[0.6vh] font-bold" style={{ color: TEXT, fontSize: '1.1vw' }}><Mark text={s.L.trap.en} accent="#fb7185" /></div>
              <Ar className="mt-[0.6vh] font-bold" style={{ color: MUTED, fontSize: '1.05vw' }}>{s.L.trap.ar}</Ar>
            </div>
          </Panel>
        </motion.div>
      )}
    </div>
  )

  if (s.t === 'how') return (
    <div className="w-full max-w-[72vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="How It Works" ar="كيف يعمل" Icon={Wrench} accent={AC.hex} />
      <div className="w-full flex flex-col gap-[1.1vh]">
        {s.L.how.map((h, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl h-[7.4vh]" style={{ boxShadow: `inset 0 0 0 1.5px ${LINE}`, opacity: 0.35 }} />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.26 }}
            className="w-full flex items-center gap-[1.2vw] rounded-2xl px-[1.6vw] py-[1.6vh]"
            style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${AC.hex}33` }}>
            <span className="grid place-items-center rounded-full shrink-0 font-black"
              style={{ width: '2.2vw', height: '2.2vw', background: AC.hex, color: '#07070c', fontSize: '0.95vw' }}>{i + 1}</span>
            <div dir="ltr" className="font-black flex-1" style={{ color: TEXT, fontSize: '1.25vw' }}>
              <Linked text={h.en} size={22} accent={AC.hex} className="!justify-start" />
            </div>
            <Ar className="font-bold text-right shrink-0 max-w-[24vw]" style={{ color: MUTED, fontSize: '1.05vw' }}>{h.ar}</Ar>
          </motion.div>
        ))}
      </div>
    </div>
  )

  /* Which letters make this sound — and where the same letters betray you.
     Founder's question: «is ee always eeee? do other spellings make the same sound?» */
  if (s.t === 'spellings') return (
    <div className="w-full max-w-[78vw] flex flex-col items-center gap-[2.2vh]">
      <Heading en="Which Letters Make It" ar="أيّ الحروف تعطي هذا الصوت — وأين تخدعك" Icon={SpellCheck} accent={AC.hex} />
      <div className="w-full flex flex-col gap-[0.9vh]">
        {s.rows.map((r, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl h-[7vh]" style={{ boxShadow: `inset 0 0 0 1.5px ${LINE}`, opacity: 0.3 }} />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.24 }}
            className="w-full rounded-2xl px-[1.3vw] py-[1.2vh]"
            style={{ background: r.warn ? 'rgba(251,113,133,0.07)' : PANEL, boxShadow: `inset 0 0 0 1.5px ${r.warn ? 'rgba(251,113,133,0.35)' : AC.hex + '2e'}` }}>
            <div className="flex items-center gap-[1vw]">
              <span className="shrink-0 rounded-xl font-black text-center" style={{ minWidth: '7vw', padding: '0.5vh 0.7vw', background: AC.soft, color: AC.hex, fontSize: '1.15vw' }}>{r.pattern}</span>
              <span className="shrink-0 font-black" style={{ color: TEXT, fontSize: '1vw', minWidth: '9vw' }}>→ {r.sound}</span>
              <span className="flex-1 min-w-0"><Linked text={r.examples} size={22} accent={AC.hex} className="!justify-start" /></span>
              <Ar className="shrink-0 font-bold text-right max-w-[16vw]" style={{ color: MUTED, fontSize: '0.9vw' }}>{r.ar}</Ar>
            </div>
            {r.warn && (
              <div className="mt-[0.7vh] flex items-start gap-[0.6vw]">
                <AlertTriangle size={14} style={{ color: '#fb7185' }} className="shrink-0 mt-[0.3vh]" />
                <div className="flex-1">
                  <div dir="ltr" className="font-bold" style={{ color: '#fda4af', fontSize: '0.92vw' }}><Mark text={r.warn} accent="#fb7185" /></div>
                  {r.warnAr && <Ar className="font-bold" style={{ color: MUTED, fontSize: '0.88vw' }}>{r.warnAr}</Ar>}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )

  /* Say it yourself — then find out whether you were right, without a teacher. */
  if (s.t === 'practice') return (
    <div className="w-full max-w-[74vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="Your Turn — Say It" ar="دورك — انطقها بصوت عالٍ" Icon={Mic} accent={AC.hex} />
      <Linked text={s.item.en} size={42} accent={AC.hex} />
      <Ar className="font-bold" style={{ color: MUTED, fontSize: '1.15vw' }}>{s.item.ar}</Ar>
      <GearRow text={s.item.en} accent={AC.hex} say={say} />
      {step >= 1 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center gap-[1.2vh]">
          <Panel accent={AC.hex} glow className="w-full px-[1.8vw] py-[2vh] flex flex-col items-center gap-[0.8vh]">
            <span className="font-black tracking-[0.2em] uppercase" style={{ color: AC.hex, fontSize: '0.7vw' }}>The answer · المفتاح</span>
            <Say text={s.item.say} size={30} accent={AC.hex} />
          </Panel>
          <div className="w-full flex items-start gap-[0.8vw] rounded-2xl px-[1.4vw] py-[1.4vh]" style={{ background: 'rgba(52,211,153,0.08)', boxShadow: 'inset 0 0 0 1.5px rgba(52,211,153,0.3)' }}>
            <Check size={18} style={{ color: '#34d399' }} className="shrink-0 mt-[0.3vh]" />
            <div className="flex-1">
              <div dir="ltr" className="font-bold" style={{ color: TEXT, fontSize: '1.02vw' }}><Mark text={s.item.check} accent="#34d399" /></div>
              <Ar className="font-bold mt-[0.3vh]" style={{ color: MUTED, fontSize: '0.95vw' }}>{s.item.checkAr}</Ar>
            </div>
          </div>
        </motion.div>
      ) : (
        <Ar className="font-bold" style={{ color: FAINT, fontSize: '1.05vw' }}>انطقها أوّلًا… ثم اضغط المسافة لترى إن كنت مصيبًا</Ar>
      )}
    </div>
  )

  if (s.t === 'pairs') return (
    <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="Train the Ear" ar="درّب أذنك — أيّهما سمعت؟" Icon={Ear} accent={AC.hex} />
      <PairGame p={s.item} step={step} accent={AC.hex} say={say} />
    </div>
  )

  if (s.t === 'bricks') return (
    <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="The Bricks" ar="القطع — كل قطعة تُنطق ككلمة واحدة" Icon={Blocks} accent={AC.hex} />
      <div className="w-full grid grid-cols-2 gap-x-[1.4vw] gap-y-[1.2vh]">
        {(s.L.bricks ?? []).map((b: Brick, i) => i >= step ? (
          <div key={i} className="rounded-2xl h-[9vh]" style={{ boxShadow: `inset 0 0 0 1.5px ${LINE}`, opacity: 0.3 }} />
        ) : (
          <motion.button key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}
            onClick={() => say(b.en, 'natural')}
            className="rounded-2xl px-[1.2vw] py-[1.4vh] flex flex-col items-center gap-[0.5vh] transition hover:brightness-125"
            style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${AC.hex}33` }}>
            <Linked text={b.en} size={26} accent={AC.hex} />
            <Say text={b.say} size={19} accent={AC.hex} />
            <Ar className="font-bold" style={{ color: FAINT, fontSize: '0.85vw' }}>{b.ar}</Ar>
          </motion.button>
        ))}
      </div>
    </div>
  )

  if (s.t === 'beats') {
    const beats = (s.item.en.match(/\*/g)?.length ?? 0) / 2
    return (
      <div className="w-full max-w-[74vw] flex flex-col items-center gap-[3vh]">
        <Heading en="The Beat" ar="الإيقاع — صفّق على النقاط فقط" Icon={Waves} accent={AC.hex} />
        <Linked text={s.item.en} size={44} accent={AC.hex} />
        <div className="flex items-center gap-[1vw]">
          {Array.from({ length: beats }).map((_, i) => (
            <motion.span key={i} animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.28 }}
              className="rounded-full" style={{ width: '1.1vw', height: '1.1vw', background: AC.hex, boxShadow: `0 0 30px ${AC.glow}` }} />
          ))}
        </div>
        <GearRow text={s.item.en} accent={AC.hex} say={say} />
        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-[0.8vh]">
            <Ar className="font-bold" style={{ color: MUTED, fontSize: '1.2vw' }}>{s.item.ar}</Ar>
            {s.item.note && <span className="font-black" style={{ color: AC.hex, fontSize: '0.95vw' }}>{s.item.note}</span>}
          </motion.div>
        )}
      </div>
    )
  }

  if (s.t === 'gears') return (
    <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.2vh]">
      <Heading en="Three Gears" ar="السرعات الثلاث — الجملة نفسها" Icon={Gauge} accent={AC.hex} />
      <GearBox g={s.item} step={step} accent={AC.hex} say={say} />
    </div>
  )

  if (s.t === 'decode') return (
    <div className="w-full max-w-[72vw] flex flex-col items-center gap-[3vh]">
      <Heading en="What Did You Hear?" ar="ماذا سمعت؟" Icon={Headphones} accent={AC.hex} />
      <Panel accent={AC.hex} glow className="w-full px-[2vw] py-[3.4vh] flex flex-col items-center gap-[1.4vh]">
        <Say text={s.item.heard} size={44} accent={AC.hex} />
        <GearRow text={s.item.real} accent={AC.hex} say={say} />
      </Panel>
      {step >= 1 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-[1.2vh]">
          <div className="flex items-center gap-[0.6vw]">
            <Check size={18} style={{ color: AC.hex }} />
            <span className="font-black tracking-[0.2em] uppercase" style={{ color: AC.hex, fontSize: '0.75vw' }}>Really said · ما قيل فعلًا</span>
          </div>
          <div dir="ltr" className="font-black text-center" style={{ color: TEXT, fontSize: '2.4vw' }}>{s.item.real}</div>
          <Ar className="font-bold" style={{ color: MUTED, fontSize: '1.15vw' }}>{s.item.ar}</Ar>
          <GearRow text={s.item.real} accent={AC.hex} say={say} compact />
        </motion.div>
      ) : (
        <Ar className="font-bold" style={{ color: FAINT, fontSize: '1.05vw' }}>اكتب ما تسمعه… ثم اضغط المسافة</Ar>
      )}
    </div>
  )

  if (s.t === 'drill') return (
    <div className="w-full max-w-[70vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="Repeat After Me" ar="ردّد بعدي" Icon={Repeat} accent={AC.hex} />
      <div className="w-full flex flex-col gap-[1.1vh]">
        {(s.L.drill ?? []).map((d: Drill, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl h-[8vh]" style={{ boxShadow: `inset 0 0 0 1.5px ${LINE}`, opacity: 0.3 }} />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            className="w-full flex items-center gap-[1.2vw] rounded-2xl px-[1.4vw] py-[1.4vh]"
            style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${AC.hex}2e` }}>
            <SpeakBtn onClick={() => say(d.en, 'slow')} accent={AC.hex} />
            <div className="flex-1 flex flex-col items-start gap-[0.3vh]">
              <Linked text={d.en} size={26} accent={AC.hex} className="!justify-start" />
              <Say text={d.say} size={18} accent={AC.hex} dim />
            </div>
            <span className="font-black shrink-0" style={{ color: FAINT, fontSize: '0.85vw' }}>×10</span>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (s.t === 'play') return (
    <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="Snap the Bricks" ar="ركّب القطع — أعد بناء الجملة" Icon={Puzzle} accent={AC.hex} />
      <SnapGame sentence={s.sentence} revealed={step >= 1} accent={AC.hex} say={say} />
    </div>
  )

  /* Homework is a LADDER, and every rung is given. A beginner told to "find five
     words" either finds nothing or finds the wrong five and practises his mistake. */
  if (s.t === 'homework') {
    const levels = [
      { n: 1, en: 'One word at a time', ar: 'كلمة كلمة', items: s.hw.words, size: 30 },
      { n: 2, en: 'Two words joined', ar: 'كلمتان مرتبطتان', items: s.hw.pairs, size: 28 },
      { n: 3, en: 'Three or more — at speed', ar: 'ثلاث كلمات فأكثر — بسرعة', items: s.hw.chunks, size: 24 },
    ]
    return (
      <div className="w-full max-w-[80vw] flex flex-col items-center gap-[1.8vh]">
        <Heading en="Homework — record all three" ar="الواجب — سجّل المستويات الثلاثة بصوتك" Icon={ClipboardList} accent={AC.hex} />
        <div className="w-full flex flex-col gap-[1.1vh]">
          {levels.map((lv, i) => i >= step ? (
            <div key={lv.n} className="w-full rounded-2xl h-[10vh]" style={{ boxShadow: `inset 0 0 0 1.5px ${LINE}`, opacity: 0.3 }} />
          ) : (
            <motion.div key={lv.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26 }}
              className="w-full rounded-2xl px-[1.4vw] py-[1.3vh]"
              style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${AC.hex}2e` }}>
              <div className="flex items-center gap-[0.7vw] mb-[0.9vh]">
                <span className="grid place-items-center rounded-lg font-black shrink-0"
                  style={{ width: '1.9vw', height: '1.9vw', background: AC.hex, color: '#07070c', fontSize: '0.85vw' }}>{lv.n}</span>
                <span className="font-black" style={{ color: TEXT, fontSize: '1vw' }}>{lv.en}</span>
                <Ar className="font-bold" style={{ color: MUTED, fontSize: '0.9vw' }}>· {lv.ar}</Ar>
                <span className="ml-auto font-black" style={{ color: FAINT, fontSize: '0.75vw' }}>×{lv.items.length}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-[1.2vw] gap-y-[0.9vh]">
                {lv.items.map((it, k) => (
                  <button key={k} onClick={() => say(it, lv.n === 3 ? 'natural' : 'slow')}
                    className="rounded-xl px-[0.7vw] py-[0.5vh] transition hover:brightness-150"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Linked text={it} size={lv.size} accent={AC.hex} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recording with nobody listening is theatre — this is where it gets corrected. */}
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <Panel accent="#34d399" glow className="w-full px-[1.8vw] py-[1.8vh] flex items-center gap-[1.2vw]">
              <Mic size={26} style={{ color: '#34d399' }} className="shrink-0" />
              <div className="flex-1">
                <Ar className="font-black" style={{ color: TEXT, fontSize: '1.3vw' }}>
                  سجّل المستويات الثلاثة وأرسلها إلى فريق Hamza El Qasraoui لمراجعتها
                </Ar>
                <Ar className="font-bold mt-[0.4vh]" style={{ color: MUTED, fontSize: '1vw' }}>
                  سنستمع إلى تسجيلك ونصحّح أخطاءك واحدًا واحدًا — لا تصحيح، لا تقدّم.
                </Ar>
                <div dir="ltr" className="font-bold mt-[0.4vh]" style={{ color: FAINT, fontSize: '0.9vw' }}>
                  Send your three recordings to the Hamza El Qasraoui Team for review and correction.
                </div>
              </div>
              <a href="https://wa.me/212764189311" target="_blank" rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-full font-black transition hover:brightness-110"
                style={{ padding: '0.9vh 1.4vw', background: '#34d399', color: '#07070c', fontSize: '1vw' }}>
                <MessageCircle size={17} /> <Ar inline>أرسل تسجيلك</Ar>
              </a>
            </Panel>
          </motion.div>
        )}
      </div>
    )
  }

  // end — the funnel slide
  return (
    <div className="w-full max-w-[70vw] flex flex-col items-center gap-[2.4vh] text-center">
      <Sparkles size={26} style={{ color: ACCENTS[0].hex }} />
      <h2 className="font-black tracking-tight" style={{ color: TEXT, fontSize: '3.4vw' }}>You can hear it now.</h2>
      <Ar className="font-black" style={{ color: ACCENTS[0].hex, fontSize: '2.2vw' }}>صرت تسمعها — والآن دورك أن تتكلّم بها</Ar>
      <div className="grid grid-cols-3 gap-[1vw] w-full mt-[1vh]">
        {[['44', 'lessons · درسًا'], ['6', 'units · وحدات'], ['100+', 'chunks · قطعة جاهزة']].map(([n, t]) => (
          <Panel key={n} className="px-[1vw] py-[2vh] flex flex-col items-center gap-[0.4vh]">
            <span className="font-black" style={{ color: ACCENTS[3].hex, fontSize: '2.2vw' }}>{n}</span>
            <span className="font-bold" style={{ color: MUTED, fontSize: '0.85vw' }}>{t}</span>
          </Panel>
        ))}
      </div>
      <Panel accent={ACCENTS[0].hex} glow className="w-full px-[2vw] py-[2.6vh] flex flex-col items-center gap-[1.2vh]">
        <Ar className="font-black" style={{ color: TEXT, fontSize: '1.5vw' }}>النطق بلا تصحيح مسرحية — أرسل تسجيلك وسنصحّحه لك</Ar>
        <Ar className="font-bold" style={{ color: MUTED, fontSize: '1.05vw' }}>تصحيح صوتي أسبوعي + جلسات مباشرة + شهادة عند إتمام الدورة</Ar>
        <a href="https://wa.me/212764189311" target="_blank" rel="noopener noreferrer"
          className="mt-[0.6vh] inline-flex items-center gap-2 rounded-full font-black transition hover:brightness-110"
          style={{ padding: '1.1vh 1.8vw', background: ACCENTS[0].hex, color: '#07070c', fontSize: '1.1vw' }}>
          <MessageCircle size={18} /> احجز مكانك عبر واتساب
        </a>
      </Panel>
    </div>
  )
}

/* ═══════════════════ the deck ═══════════════════ */
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || (t instanceof HTMLElement && t.isContentEditable)

const NOTE_PREFIX = 'inglizi.pron_notes.'
const noteKeyOf = (s: Slide) => ('L' in s ? `lesson-${s.L.no}` : s.t === 'unit' ? `unit-${s.ui}` : s.t)

export default function PronunciationDeck() {
  const { slides, jump, unitJump, flow } = useMemo(buildSlides, [])
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [hasNote, setHasNote] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(UNITS.map((_, i) => i)))
  const last = slides.length - 1
  const s = slides[Math.min(idx, last)]
  const { say, stop, prime, engine } = useVoice()

  const idxRef = useRef(idx); idxRef.current = idx
  const stepRef = useRef(step); stepRef.current = step
  const notesRef = useRef(notesOpen); notesRef.current = notesOpen
  useEffect(() => { setStep(0); stop() }, [idx, stop])

  const go = useCallback((d: number) => {
    const max = stepsOf(slides[idxRef.current])
    if (d > 0) { if (stepRef.current < max) setStep(v => v + 1); else setIdx(i => Math.min(slides.length - 1, i + 1)) }
    else { if (stepRef.current > 0) setStep(v => v - 1); else setIdx(i => Math.max(0, i - 1)) }
  }, [slides])
  const jumpTo = (no: number) => { const t = jump[no]; if (t != null) { setStep(0); setIdx(t); setDrawerOpen(false) } }
  const jumpUnit = (ui: number) => { const t = unitJump[ui]; if (t != null) { setStep(0); setIdx(t); setDrawerOpen(false) } }

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('lesson')
    const no = raw ? parseFloat(raw) : NaN
    if (!isNaN(no) && jump[no] != null) setIdx(jump[no])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* The sentence the S key and the gear keys act on. */
  const audible = useMemo(() => {
    if (s.t === 'gears') return [s.item.en, s.item.en, s.item.en] as const
    if (s.t === 'decode') return [s.item.real, s.item.real, s.item.real] as const
    if (s.t === 'beats') return [s.item.en, s.item.en, s.item.en] as const
    if (s.t === 'play') return [s.sentence, s.sentence, s.sentence] as const
    if (s.t === 'pairs') return [s.item.a, s.item.a, s.item.b] as const
    return null
  }, [s])

  // Fetch the line for this slide before anyone asks for it.
  useEffect(() => { if (audible) prime(audible[1], 'natural') }, [audible, prime])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (notesRef.current || isTyping(e.target)) return
      const k = e.key.toLowerCase()
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      else if (k === 'm') setDrawerOpen(o => !o)
      else if (k === 'n') { e.preventDefault(); setNotesOpen(true) }
      else if (k === 'f') toggleFs()
      else if (k === 'escape') setDrawerOpen(false)
      else if (k === 's' && audible) { e.preventDefault(); say(audible[1], 'natural') }
      else if (['1', '2', '3'].includes(e.key) && audible) {
        e.preventDefault()
        const i = Number(e.key) - 1
        say(audible[i], (['slow', 'natural', 'fast'] as const)[i])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, say, audible])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && notesRef.current) { e.preventDefault(); setNotesOpen(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // full-screen
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.() }

  // zoom + pan (same fingers as the writing deck)
  const rootRef = useRef<HTMLDivElement>(null)
  const ZMIN = 0.8, ZMAX = 2
  const [zoom, setZoom] = useState(1)
  const zRef = useRef(zoom); zRef.current = zoom
  const setZ = useCallback((v: number) => setZoom(Math.min(ZMAX, Math.max(ZMIN, parseFloat(v.toFixed(2))))), [])
  const zoomBy = useCallback((d: number) => setZ(zRef.current + d), [setZ])
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  useEffect(() => { setPan({ x: 0, y: 0 }) }, [idx])
  useEffect(() => { if (zoom <= 1) setPan({ x: 0, y: 0 }) }, [zoom])
  const onPanDown = (e: React.PointerEvent) => { if (zRef.current <= 1) return; dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; setDragging(true) }
  const onPanMove = (e: React.PointerEvent) => { const d = dragRef.current; if (!d) return; setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) }) }
  const onPanUp = () => { dragRef.current = null; setDragging(false) }
  useEffect(() => {
    const el = rootRef.current; if (!el) return
    const onWheel = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 0.08 : -0.08) } }
    const onKey = (e: KeyboardEvent) => {
      if (notesRef.current || isTyping(e.target)) return
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(0.1) }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-0.1) }
      else if (e.key === '0') setZ(1)
    }
    let startDist = 0, startZoom = 1
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onTS = (e: TouchEvent) => { if (e.touches.length === 2) { startDist = dist(e.touches); startZoom = zRef.current } }
    const onTM = (e: TouchEvent) => { if (e.touches.length === 2 && startDist) { e.preventDefault(); setZ(startZoom * (dist(e.touches) / startDist)) } }
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    el.addEventListener('touchstart', onTS, { passive: false })
    el.addEventListener('touchmove', onTM, { passive: false })
    el.addEventListener('touchend', () => { startDist = 0 })
    return () => { el.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); el.removeEventListener('touchstart', onTS); el.removeEventListener('touchmove', onTM) }
  }, [zoomBy, setZ])

  const L = 'L' in s ? s.L : null
  const AC = accentOf(s)
  const lessonFlow = flow[Math.min(idx, last)] ?? null
  const stageI = lessonFlow ? lessonFlow.stages.reduce((at, st, i) => (st.at <= idx ? i : at), -1) : -1
  const activeUnit = s.t === 'unit' ? s.ui : L ? unitIdxOf(L.no) : -1

  const noteKey = NOTE_PREFIX + noteKeyOf(s)
  const noteLabel = L ? `درس ${numOf(L)}` : s.t === 'unit' ? `وحدة ${s.ui + 1}` : 'لوح'
  useEffect(() => { setHasNote(!!readNote(noteKey)) }, [noteKey])
  const noteCards: DeckCard[] = useMemo(() => {
    if (!L) return []
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const clean = (t: string) => esc(plain(t))
    return [
      { id: 'goal', label: 'الوعد', icon: Target, make: () => `<div style="font-size:36px">${clean(L.goal.en)}</div><div style="font-size:26px;color:#78716c;margin-top:10px" dir="rtl">${esc(L.goal.ar)}</div>` },
      { id: 'gear', label: 'جملة بالسرعات', icon: Gauge, make: () => {
        const g = L.gears?.[0]; if (!g) return ''
        return `<div style="font-size:40px">${clean(g.en)}</div>`
          + `<div style="font-size:26px;color:#0e7490;margin-top:12px">🐢 ${esc(g.slow)}</div>`
          + `<div style="font-size:26px;color:#b45309;margin-top:6px">⚙️ ${esc(g.natural)}</div>`
          + `<div style="font-size:26px;color:#be123c;margin-top:6px">🐇 ${esc(g.fast)}</div>`
      } },
      { id: 'bricks', label: 'القطع', icon: Blocks, make: () =>
        `<div style="font-size:28px">${(L.bricks ?? []).map(b => `${clean(b.en)} <span style="color:#78716c">— ${esc(b.say)}</span>`).join('<br>')}</div>` },
      { id: 'homework', label: 'الواجب', icon: ClipboardList, make: () => {
        const hw = HOMEWORK[L.no]
        if (!hw) return ''
        const row = (n: number, label: string, items: string[]) =>
          `<div style="font-size:26px;margin-top:8px"><b>${n}. ${label}</b> — ${items.map(clean).join(' · ')}</div>`
        return row(1, 'words', hw.words) + row(2, 'two joined', hw.pairs) + row(3, 'three or more', hw.chunks)
          + `<div style="font-size:22px;color:#b45309;margin-top:12px" dir="rtl">أرسل التسجيلات إلى فريق Hamza El Qasraoui للمراجعة</div>`
      } },
    ]
  }, [L])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden"
      style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: BG, color: TEXT }}>
      {/* studio glow */}
      <div className="pointer-events-none absolute -top-[26vw] -right-[14vw] w-[52vw] h-[52vw] rounded-full blur-3xl transition-colors duration-700"
        style={{ background: AC.glow, opacity: 0.35 }} />
      <div className="pointer-events-none absolute -bottom-[30vw] -left-[16vw] w-[54vw] h-[54vw] rounded-full blur-3xl transition-colors duration-700"
        style={{ background: AC.glow, opacity: 0.22 }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* header */}
      <div className="relative z-30 flex items-center justify-center gap-2 px-[2.4vw] pt-[2vh] shrink-0">
        <div dir="ltr" className="absolute left-[2.4vw] top-[2vh] flex items-center gap-1.5">
          <button onClick={() => setDrawerOpen(o => !o)} title="الفهرس (M)" aria-label="Index"
            className="p-1.5 rounded-lg transition hover:brightness-125" style={{ background: AC.hex, color: '#07070c' }}><Menu size={16} /></button>
          <Link href="/admin/present" title="كل الديكات"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition hover:brightness-125"
            style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${LINE}`, color: MUTED, fontSize: '0.82vw' }}><ArrowLeft size={14} /> الديكات</Link>
          <button onClick={() => { setIdx(0); setStep(0) }} title="من البداية" aria-label="Restart"
            className="p-1.5 rounded-lg transition hover:brightness-125" style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${LINE}`, color: MUTED }}><RotateCcw size={15} /></button>
          <button onClick={() => setNotesOpen(true)} title="لوح الشرح (N)"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-black transition hover:brightness-125"
            style={{ background: AC.soft, color: AC.hex, boxShadow: `inset 0 0 0 1.5px ${AC.hex}55`, fontSize: '0.82vw' }}>
            <StickyNote size={14} /> لوح الشرح
            {hasNote && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: AC.hex }} />}
          </button>
        </div>

        {activeUnit >= 0 && (
          <button onClick={() => jumpUnit(activeUnit)} title="بداية الوحدة"
            className="px-2.5 py-1.5 rounded-xl font-black transition hover:brightness-125"
            style={{ background: AC.soft, color: AC.hex, boxShadow: `inset 0 0 0 1.5px ${AC.hex}44`, fontSize: '0.85vw' }}>U{activeUnit + 1}</button>
        )}
        <span className="px-3 py-1.5 rounded-xl font-black flex items-center gap-2 whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.07)', boxShadow: `inset 0 0 0 1.5px ${LINE}`, fontSize: '0.85vw' }}>
          <Waves size={14} style={{ color: AC.hex }} />
          {L ? `Lesson ${numOf(L)} / ${ORDERED.length}` : 'LEGO English'} ·
          <Ar inline>{L ? L.tagAr : 'ليغو الإنجليزية'}</Ar>
        </span>
        {L?.ipa && <span className="px-2.5 py-1.5 rounded-xl font-black" style={{ background: AC.hex, color: '#07070c', fontSize: '0.85vw' }}>{L.ipa}</span>}

        <div className="absolute right-[2.4vw] top-[2vh] flex items-center gap-2">
          <span className="font-bold whitespace-nowrap" style={{ color: FAINT, fontSize: '0.8vw' }}>
            {String(idx + 1).padStart(2, '0')} / {slides.length}
          </span>
          <div className="flex items-center rounded-lg" style={{ background: PANEL, boxShadow: `inset 0 0 0 1.5px ${LINE}` }}>
            <button onClick={() => zoomBy(-0.1)} disabled={zoom <= ZMIN} className="p-1.5 disabled:opacity-25 transition hover:brightness-150" title="تصغير (−)" aria-label="Zoom out"><ZoomOut size={15} /></button>
            <span className="px-1 font-mono font-bold" style={{ fontSize: 11, color: MUTED }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => zoomBy(0.1)} disabled={zoom >= ZMAX} className="p-1.5 disabled:opacity-25 transition hover:brightness-150" title="تكبير (+)" aria-label="Zoom in"><ZoomIn size={15} /></button>
          </div>
          <button onClick={toggleFs} className="p-2 rounded-lg transition hover:brightness-150" style={{ color: MUTED }} title="ملء الشاشة (F)">
            {isFs ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      {/* the lesson's path — same idea as the writing deck, restyled for the studio */}
      {lessonFlow && !notesOpen && (
        <div className="relative z-20 shrink-0 mt-[1.1vh] px-[2.4vw] flex justify-center">
          <div dir="ltr" className="flex items-center gap-[0.3vw] max-w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {lessonFlow.stages.map((st, i) => {
              const m = PHASE[st.phase]
              const now = i === stageI, done = i < stageI
              return (
                <button key={`${st.phase}-${st.at}`} onClick={() => { setStep(0); setIdx(st.at) }}
                  title={`${m.en} · ${m.ar}`}
                  className="flex items-center gap-[0.3vw] rounded-full whitespace-nowrap shrink-0 transition hover:brightness-125"
                  style={{
                    padding: '0.45vh 0.6vw', fontSize: '0.66vw', fontWeight: 900,
                    background: now ? AC.hex : 'rgba(255,255,255,0.05)',
                    color: now ? '#07070c' : done ? FAINT : MUTED,
                    boxShadow: now ? `0 0 30px -6px ${AC.hex}` : `inset 0 0 0 1px ${LINE}`,
                    opacity: done ? 0.6 : 1,
                  }}>
                  <m.Icon size={12} />{m.en}
                  {st.count > 1 && (
                    <span className="rounded-full px-1" style={{ background: now ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)' }}>
                      {now ? `${Math.min(st.count, idx - st.at + 1)}/${st.count}` : st.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* index drawer */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} className="absolute inset-0 z-[60] bg-black/50" />}
      <aside className={`absolute left-0 top-0 h-full z-[70] w-[24vw] min-w-[300px] max-w-[380px] flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0b0b12', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>
        <div className="px-[1.2vw] py-[1.6vh] shrink-0 flex items-center justify-between" style={{ borderBottom: `1px solid ${LINE}` }}>
          <span className="flex items-center gap-2 font-black" style={{ fontSize: '0.92vw' }}>
            <ListTree size={16} style={{ color: ACCENTS[3].hex }} /> Index · <Ar inline>الفهرس</Ar>
          </span>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close" style={{ color: MUTED }}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-[0.7vw] py-[1.2vh]">
          {UNITS.map((u, ui) => {
            const open = expanded.has(ui)
            const items = lessonsOf(ui)
            return (
              <div key={ui} className="mb-[1vh]">
                <button onClick={() => jumpUnit(ui)} className="w-full text-left px-[0.6vw] py-[0.7vh] rounded-xl transition"
                  style={ui === activeUnit ? { background: ACCENTS[ui].soft, boxShadow: `inset 0 0 0 1.5px ${ACCENTS[ui].hex}55` } : undefined}>
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="grid place-items-center rounded-lg font-black shrink-0"
                      style={{ width: 22, height: 22, background: ACCENTS[ui].hex, color: '#07070c', fontSize: '0.7vw' }}>{ui + 1}</span>
                    <span className="font-black truncate" style={{ color: ui === activeUnit ? ACCENTS[ui].hex : TEXT, fontSize: '0.88vw' }}>{u.short}</span>
                    <span className="ml-auto font-black shrink-0" style={{ color: FAINT, fontSize: '0.7vw' }}>{items.length}</span>
                  </div>
                </button>
                <button onClick={() => setExpanded(p => { const n = new Set(p); if (n.has(ui)) n.delete(ui); else n.add(ui); return n })}
                  className="w-full flex items-center gap-[0.4vw] px-[0.6vw] py-[0.4vh] rounded-lg transition" style={{ color: FAINT }}>
                  <ChevronDown size={12} style={{ transform: open ? 'none' : 'rotate(-90deg)' }} />
                  <Ar className="font-bold" style={{ fontSize: '0.75vw' }}>{u.shortAr}</Ar>
                </button>
                {open && (
                  <div className="ml-[0.9vw] flex flex-col gap-[0.2vh] pl-[0.5vw]" style={{ borderLeft: `1.5px solid ${LINE}` }}>
                    {items.map(L2 => {
                      const active = L2.no === L?.no
                      return (
                        <button key={L2.no} onClick={() => jumpTo(L2.no)}
                          className="flex items-center gap-[0.5vw] px-[0.5vw] py-[0.45vh] rounded-lg text-left transition hover:brightness-150"
                          style={active ? { background: ACCENTS[ui].soft } : undefined}>
                          <span className="grid place-items-center rounded-md font-black shrink-0"
                            style={{ width: 22, height: 22, background: active ? ACCENTS[ui].hex : 'rgba(255,255,255,0.07)', color: active ? '#07070c' : MUTED, fontSize: '0.7vw' }}>
                            {numOf(L2)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold truncate" style={{ color: active ? TEXT : MUTED, fontSize: '0.8vw' }}>{L2.tag}</span>
                            <Ar className="block font-bold truncate" style={{ color: FAINT, fontSize: '0.7vw' }}>{L2.tagAr}</Ar>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* side-click nav */}
      {s.t !== 'intro' && !notesOpen && (<>
        <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[8%] z-20 cursor-w-resize" aria-label="Previous" />
        <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[8%] z-20 cursor-e-resize" aria-label="Next" />
      </>)}

      {notesOpen && (
        <NotePad storeKey={noteKey} label={noteLabel} cards={noteCards}
          onClose={() => setNotesOpen(false)} onDirty={setHasNote} />
      )}

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-[4vw] py-[1.4vh] relative z-10 min-h-0 overflow-hidden">
        <div className="w-full flex items-center justify-center"
          onPointerDown={onPanDown} onPointerMove={onPanMove} onPointerUp={onPanUp} onPointerCancel={onPanUp}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 150ms', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx} dir="ltr" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}
              className="w-full flex items-center justify-center">
              <SlideView s={s} step={step} say={say} onJump={jumpTo} onJumpUnit={jumpUnit} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* footer — a waveform instead of a bar, and the notation legend */}
      <div className="relative z-10 shrink-0 px-[3vw] pb-[1.6vh] flex items-center gap-[1.4vw]">
        <button onClick={() => go(-1)} disabled={idx === 0} className="disabled:opacity-0 transition" style={{ color: FAINT }}><ChevronLeft size={22} /></button>
        <div className="flex-1 flex items-end gap-[2px] h-[3.2vh]">
          {Array.from({ length: 84 }).map((_, i) => {
            const at = (i / 84) * slides.length
            const on = at <= idx
            const h = 26 + Math.abs(Math.sin(i * 1.7)) * 74
            return <span key={i} className="flex-1 rounded-full transition-colors"
              style={{ height: `${h}%`, background: on ? AC.hex : 'rgba(255,255,255,0.10)', opacity: on ? 0.9 : 1 }} />
          })}
        </div>
        <button onClick={() => go(1)} disabled={idx === last} className="disabled:opacity-0 transition" style={{ color: FAINT }}><ChevronRight size={22} /></button>
      </div>

      {/* the notation legend — always visible, it is the alphabet of this course */}
      {'L' in s && (
        <div className="relative z-10 shrink-0 pb-[1.4vh] flex items-center justify-center gap-[1.2vw] flex-wrap">
          {(Object.keys(JOINS) as JoinKind[]).map(k => (
            <span key={k} className="flex items-center gap-[0.35vw] font-black" style={{ fontSize: '0.66vw', color: FAINT }}>
              <svg width={18} height={10} viewBox="0 0 24 14"><path d="M2 2 C 7 14, 17 14, 22 2" fill="none" stroke={JOIN_COLOR[k]} strokeWidth={2.6} strokeLinecap="round" /></svg>
              {JOIN_NAME[k].en} · <Ar inline>{JOIN_NAME[k].ar}</Ar>
            </span>
          ))}
          <span className="flex items-center gap-[0.35vw] font-black" style={{ fontSize: '0.66vw', color: FAINT }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: AC.hex, display: 'inline-block' }} /> beat · <Ar inline>نبضة</Ar>
          </span>
          <span className="flex items-center gap-[0.35vw] font-black" style={{ fontSize: '0.66vw', color: FAINT }}>
            <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>t</span> dropped · <Ar inline>محذوف</Ar>
          </span>
          <span className="flex items-center gap-[0.35vw] font-black" style={{ fontSize: '0.66vw', color: engine === 'real' ? FAINT : '#fb7185' }}>
            <Volume2 size={11} /> S · 1 2 3 · <Ar inline>{engine === 'real' ? 'صوت حقيقي' : 'صوت الجهاز — تعذّر الصوت الحقيقي'}</Ar>
          </span>
        </div>
      )}
    </div>
  )
}
