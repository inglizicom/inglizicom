'use client'

/**
 * /admin/present/speaking — "Speak Your Work" teaching deck.
 *
 * A private course for one senior Earth Observation professional. The syllabus,
 * the ladder from everyday English to business English, the Arabic-L1 traps and
 * the sixty-minute clock are all documented in src/data/speaking/types.ts —
 * this file only renders them.
 *
 * Every lesson runs the same shape, defined once in STAGE_PLAN:
 *   Warm-up → Objective → Phrases → Pattern → Arabic trap → Sound →
 *   Her words → Drill → Conversation → Hot seat → Say it all → Exit → Homework
 *
 * Navigate: ← → / Space / side-click. Full screen: F. Jump to a lesson from the
 * cover. No entrance animation anywhere — two earlier attempts made the slide
 * body depend on JavaScript to be visible, and a teaching slide must never need
 * a script to be seen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, Mic, Target,
  MessagesSquare, BookOpen, Repeat, Flame, Home, Volume2, Route, Zap, ListChecks,
  AlertTriangle, Layers, ArrowUpRight, CheckCircle2,
} from 'lucide-react'
import {
  ORDERED, WEEKS, STAGE_PLAN, TRACK_META, warmUpFor, weekOf, dayOf,
  type Lesson, type Track,
} from '@/data/speaking'

/* Same visual language as "English from Zero" (/admin/present/writing):
   white paper, ink brown, real gold. One palette across the decks means the
   teacher never re-learns a UI. */
const INK   = '#2a1d12'
const GOLD  = '#d4a017'
const AMBER = '#92400e'
const PAPER = '#ffffff'
const CARD  = '#fdf6e3'
const CARD2 = '#fcefc7'
const LINE  = '#e7e5e4'
const TEXT  = '#2a1d12'
const MUTED = '#57534e'
const DIM   = '#a8a29e'
const ACCENT = '#b45309'
const RED   = '#b91c1c'
const GREEN = '#15803d'

/* Where a lesson sits on the ladder, at a glance. */
const TRACK_COLOR: Record<Track, string> = {
  life: '#0e7490', bridge: '#b45309', work: '#6d28d9', measure: '#15803d',
}

type Phase =
  | 'warmup' | 'goal' | 'target' | 'pattern' | 'trap' | 'sound'
  | 'vocab' | 'drill' | 'dialogue' | 'hotseat' | 'speech' | 'exit' | 'homework'

const PHASE_META: Record<Phase, { label: string; ar: string; icon: typeof Target }> = {
  warmup:   { label: 'Warm-up',      ar: 'إحماء',        icon: Repeat },
  goal:     { label: 'Objective',    ar: 'الهدف',        icon: Target },
  target:   { label: 'Phrases',      ar: 'العبارات',     icon: MessagesSquare },
  pattern:  { label: 'Pattern',      ar: 'القالب',       icon: Layers },
  trap:     { label: 'Arabic trap',  ar: 'فخ العربية',   icon: AlertTriangle },
  sound:    { label: 'Sound',        ar: 'النطق',        icon: Volume2 },
  vocab:    { label: 'Her words',    ar: 'كلماتها',      icon: BookOpen },
  drill:    { label: 'Drill',        ar: 'التمرين',      icon: Zap },
  dialogue: { label: 'Conversation', ar: 'الحوار',       icon: MessagesSquare },
  hotseat:  { label: 'Hot seat',     ar: 'الأسئلة',      icon: Flame },
  speech:   { label: 'Say it all',   ar: 'قوليها كاملة', icon: Mic },
  exit:     { label: 'Exit check',   ar: 'اختبار الخروج', icon: CheckCircle2 },
  homework: { label: 'Homework',     ar: 'الواجب',       icon: ListChecks },
}

const MINS = Object.fromEntries(STAGE_PLAN.map(s => [s.key, s.mins])) as Record<string, number>

/** The stages this lesson actually has, in teaching order. */
function stagesOf(l: Lesson): Phase[] {
  const has: Record<string, boolean> = {
    warmup: true, goal: true, target: true, pattern: true, trap: true, sound: true,
    drill: true, hotseat: true, exit: true, homework: true,
    vocab: !!l.vocab?.length, dialogue: !!l.dialogue, speech: !!l.speech,
  }
  return STAGE_PLAN.map(s => s.key as Phase).filter(k => has[k])
}

type Slide =
  | { k: 'cover' } | { k: 'ladder' } | { k: 'plan' }
  | { k: 'week'; week: number }
  | { k: 'lesson'; lesson: Lesson; phase: Phase }

/* Spotlight *asterisked* fragments. */
function Hi({ text, color = GOLD }: { text: string; color?: string }) {
  return <>{text.split('*').map((p, i) =>
    i % 2 === 1 ? <span key={i} style={{ color, fontWeight: 900 }}>{p}</span> : <span key={i}>{p}</span>
  )}</>
}

function Ar({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <p dir="rtl" className={className} style={{ fontFamily: "'Tajawal', sans-serif", ...style }}>{children}</p>
}

function buildSlides(): Slide[] {
  const out: Slide[] = [{ k: 'cover' }, { k: 'ladder' }, { k: 'plan' }]
  WEEKS.forEach(w => {
    out.push({ k: 'week', week: w.no })
    ORDERED.filter(l => l.week === w.no).forEach(lesson =>
      stagesOf(lesson).forEach(phase => out.push({ k: 'lesson', lesson, phase })))
  })
  return out
}

export default function SpeakingDeck() {
  const slides = useMemo(buildSlides, [])
  const [idx, setIdx] = useState(0)
  const [fs, setFs] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

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
      if (e.key === 'Home') setIdx(0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, toggleFs])

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const s = slides[idx]
  const lesson = s.k === 'lesson' ? s.lesson : null
  const colour = lesson ? TRACK_COLOR[lesson.track]
    : s.k === 'week' ? WEEKS[s.week - 1].colour : ACCENT

  const railStages = useMemo(() => (lesson ? stagesOf(lesson) : []), [lesson])

  const jumpTo = (no: number) => {
    const at = slides.findIndex(x => x.k === 'lesson' && x.lesson.no === no && x.phase === 'warmup')
    if (at >= 0) setIdx(at)
  }
  const jumpStage = (p: Phase) => {
    if (!lesson) return
    const at = slides.findIndex(x => x.k === 'lesson' && x.lesson.no === lesson.no && x.phase === p)
    if (at >= 0) setIdx(at)
  }

  return (
    <div dir="ltr" ref={stageRef}
         style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: PAPER, color: INK }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[22vw] -right-[16vw] w-[46vw] h-[46vw] rounded-full bg-yellow-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[22vw] -left-[16vw] w-[42vw] h-[42vw] rounded-full bg-amber-50/60 blur-3xl" />

      {/* ── header ── */}
      <div className="relative z-30 flex items-center justify-between px-5 py-3 border-b bg-white/80 backdrop-blur" style={{ borderColor: LINE }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/present" className="flex items-center gap-1.5 text-[12px] font-bold text-stone-400 hover:text-stone-700 shrink-0">
            <ArrowLeft size={14} /> Decks
          </Link>
          <span className="text-stone-300">·</span>
          <span className="font-black text-[14px] truncate">Speak Your Work</span>
          {lesson && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: colour, color: '#fff' }}>
              {TRACK_META[lesson.track].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-stone-500">{idx + 1}/{slides.length}</span>
          <button onClick={() => setIdx(0)} className="text-stone-400 hover:text-stone-700" title="Cover"><Home size={16} /></button>
          <button onClick={toggleFs} className="text-stone-400 hover:text-stone-700" title="Full screen (F)">
            {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── stage rail with the minute budget ── */}
      {lesson && (
        <div className="relative z-30 flex items-center gap-1.5 px-5 py-2 overflow-x-auto border-b bg-white/80" style={{ borderColor: LINE }}>
          <span className="text-[10px] font-black tracking-widest uppercase shrink-0 mr-1" style={{ color: colour }}>
            W{weekOf(lesson.no)} · D{dayOf(lesson.no)} · {lesson.level}
          </span>
          {railStages.map(p => {
            const M = PHASE_META[p]
            const active = s.k === 'lesson' && s.phase === p
            const done = railStages.indexOf(p) < railStages.indexOf((s as { phase: Phase }).phase)
            return (
              <button key={p} onClick={() => jumpStage(p)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all border"
                      style={{
                        borderColor: active ? colour : LINE,
                        background: active ? colour : 'transparent',
                        color: active ? '#fff' : done ? MUTED : DIM,
                      }}>
                <M.icon size={11} /> {M.label}
                <span className="font-mono opacity-60">{MINS[p]}′</span>
              </button>
            )
          })}
          <span className="ml-auto shrink-0 text-[10px] font-mono font-bold pl-3" style={{ color: DIM }}>
            {railStages.reduce((t, p) => t + (MINS[p] ?? 0), 0)} min
          </span>
        </div>
      )}

      {/* ── stage ── */}
      <div className="flex-1 relative overflow-hidden z-20">
        <button className="absolute left-0 top-0 bottom-0 w-[10%] z-20 cursor-w-resize" onClick={() => go(-1)} aria-label="previous" />
        <button className="absolute right-0 top-0 bottom-0 w-[10%] z-20 cursor-e-resize" onClick={() => go(1)} aria-label="next" />
        <div key={idx} className="absolute inset-0 overflow-y-auto px-6 sm:px-12 py-8 flex flex-col">
          {s.k === 'cover'  && <Cover onJump={jumpTo} onFull={toggleFs} />}
          {s.k === 'ladder' && <LadderSlide />}
          {s.k === 'plan'   && <PlanSlide />}
          {s.k === 'week'   && <WeekSlide no={s.week} />}
          {s.k === 'lesson' && <LessonSlide lesson={s.lesson} phase={s.phase} colour={colour} />}
        </div>
      </div>

      {/* ── footer ── */}
      <div className="relative z-30 flex items-center justify-between px-5 py-2.5 border-t bg-white/80 backdrop-blur" style={{ borderColor: LINE }}>
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
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Mic size={14} /> Private 1:1 · 8 weeks · 48 daily lessons
      </div>
      <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] mb-2" style={{ color: TEXT }}>
        Speak Your Work
      </h1>
      <p className="text-xl text-stone-600 mb-1">English for Earth Observation — from the coffee break to the conference stage.</p>
      <Ar className="text-stone-500 mb-8 text-lg">الإنجليزية لرصد الأرض — من استراحة القهوة إلى منصة المؤتمر</Ar>

      <div className="grid sm:grid-cols-4 gap-2 mb-8">
        {WEEKS.map(w => (
          <div key={w.no} className="rounded-xl border p-3" style={{ borderColor: LINE, background: CARD }}>
            <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: w.colour }}>Week {w.no}</div>
            <p className="font-black text-[15px] leading-tight">{w.fn}</p>
            <Ar className="text-stone-400 text-[12px]">{w.fnAr}</Ar>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-6">
        {ORDERED.map(l => (
          <button key={l.no} onClick={() => onJump(l.no)}
                  title={`${l.title} — ${TRACK_META[l.track].label}`}
                  className="aspect-square rounded-lg text-[12px] font-black transition-all hover:scale-110 border"
                  style={{ borderColor: TRACK_COLOR[l.track], color: TRACK_COLOR[l.track], background: CARD }}>
            {l.no}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold mb-6">
        {(Object.keys(TRACK_META) as Track[]).map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: TRACK_COLOR[t] }} />
            {TRACK_META[t].label}
          </span>
        ))}
      </div>

      <button onClick={onFull} className="rounded-xl px-5 py-3 font-black text-[14px] text-white" style={{ background: INK }}>
        Full screen (F) →
      </button>
    </div>
  )
}

/** THE slide. It answers the only structural question that matters: how does a
 *  woman who cannot order a coffee in English end up chairing a session? */
function LadderSlide() {
  const rows = [
    { d: 'Days 1–2', t: 'life' as Track, what: 'The function with friends, in a taxi, at dinner. No work vocabulary at all.' },
    { d: 'Day 3', t: 'bridge' as Track, what: 'The SAME function, first professional use — and the slide names the day it came from.' },
    { d: 'Days 4–5', t: 'work' as Track, what: 'The function in a meeting, on a call, on a stage.' },
    { d: 'Day 6', t: 'measure' as Track, what: 'She performs it. It is scored. Fail means it reruns tomorrow.' },
  ]
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <ArrowUpRight size={14} /> The ladder
      </div>
      <h2 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: TEXT }}>
        Real life to business, eight times over
      </h2>
      <Ar className="text-stone-500 mb-6">من الحياة اليومية إلى العمل، ثماني مرات</Ar>

      <div className="rounded-xl border p-4 mb-6 text-[13.5px] leading-relaxed" style={{ borderColor: LINE, background: CARD }}>
        The old plan ran four weeks of everyday English and then simply started talking about
        satellites, as if the second thing followed from the first. It does not. A learner who can
        chat about the weather cannot chair a meeting, because nobody showed her that chairing a
        meeting <b>is</b> asking questions and interrupting — the two things she already learned in
        week two. <b>Here the bridge is built eight times, inside every week, and she can see it
        happening.</b>
      </div>

      <div className="space-y-2 mb-7">
        {rows.map(r => (
          <div key={r.d} className="rounded-xl border p-4 flex items-start gap-4"
               style={{ borderColor: TRACK_COLOR[r.t], background: r.t === 'bridge' ? '#fffbeb' : CARD }}>
            <div className="shrink-0 w-[86px]">
              <p className="font-black text-[14px]" style={{ color: TRACK_COLOR[r.t] }}>{r.d}</p>
              <p className="text-[11px] font-bold" style={{ color: DIM }}>{TRACK_META[r.t].label}</p>
            </div>
            <p className="text-[14.5px] leading-snug flex-1 min-w-0">{r.what}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-6">
        {WEEKS.map(w => (
          <div key={w.no} className="rounded-xl border p-3.5" style={{ borderColor: LINE, background: CARD }}>
            <div className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: w.colour }}>
              Week {w.no} · {w.fn}
            </div>
            <p className="text-[13px] leading-snug">
              <span style={{ color: TRACK_COLOR.life }} className="font-bold">{w.life}</span>
              <span className="mx-1.5 font-black" style={{ color: GOLD }}>→</span>
              <span style={{ color: TRACK_COLOR.work }} className="font-bold">{w.work}</span>
            </p>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-stone-600 border-t pt-4" style={{ borderColor: LINE }}>
        By week seven there are no life days left — not because everyday English stops mattering, but
        because by then the transfer <b>is</b> the skill. Day 43 is the coffee break, and it is
        explicitly built on day 1: the same thirty seconds of small talk, seven weeks later, with a
        consortium at the end of it.
      </p>
    </div>
  )
}

function PlanSlide() {
  const total = STAGE_PLAN.reduce((t, s) => t + s.mins, 0)
  const speaking = ['warmup', 'drill', 'dialogue', 'hotseat', 'speech', 'exit']
  const spoken = STAGE_PLAN.filter(s => speaking.includes(s.key)).reduce((t, s) => t + s.mins, 0)
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Route size={14} /> The shape of every lesson
      </div>
      <h2 className="text-3xl sm:text-4xl font-black mb-1" style={{ color: TEXT }}>
        Sixty minutes, and she talks in the first one
      </h2>
      <Ar className="text-stone-500 mb-6">ستون دقيقة، وتتكلّم هي في الدقيقة الأولى</Ar>

      <div className="rounded-xl border p-4 mb-5 text-[13.5px] leading-relaxed" style={{ borderColor: LINE, background: CARD }}>
        <b>Recall before teaching</b> — the first five minutes are yesterday and last week, not new
        material. <b>Input before output</b> — she hears the model before she is asked to produce.
        <b> Measurement before homework</b> — the exit check is the last thing, so it survives a
        lesson that runs late.
      </div>

      <div className="flex w-full h-3 rounded-full overflow-hidden mb-5" style={{ background: LINE }}>
        {STAGE_PLAN.map((s, i) => (
          <div key={s.key} title={`${s.label} — ${s.mins} min`}
               style={{ width: `${(s.mins / total) * 100}%`,
                        background: speaking.includes(s.key) ? GOLD : i % 2 ? '#e7d9b8' : '#f0e4c8' }} />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {STAGE_PLAN.map(s => {
          const sp = speaking.includes(s.key)
          return (
            <div key={s.key} className="rounded-xl border p-3.5 flex items-start gap-3"
                 style={{ borderColor: sp ? GOLD : LINE, background: sp ? '#fffbeb' : CARD }}>
              <span className="text-[13px] font-mono font-black shrink-0 w-9 text-right" style={{ color: sp ? AMBER : DIM }}>{s.mins}′</span>
              <div className="min-w-0">
                <p className="font-black text-[15px] leading-tight">
                  {s.label}
                  <span dir="rtl" className="text-stone-400 font-bold text-[13px] mr-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.ar}</span>
                </p>
                <p className="text-[12.5px] text-stone-600 leading-snug mt-0.5">{s.why}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[13px] text-stone-600 mt-5 border-t pt-4" style={{ borderColor: LINE }}>
        <b>{spoken} of the {total} minutes are her producing language.</b> If a lesson ends and that was
        not true, the lesson went wrong, however good the material was.
      </p>
    </div>
  )
}

function WeekSlide({ no }: { no: number }) {
  const w = WEEKS[no - 1]
  const days = ORDERED.filter(l => l.week === no)
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: w.colour }}>Week {no} of 8</div>
      <h2 className="text-4xl sm:text-5xl font-black mb-1" style={{ color: TEXT }}>{w.fn}</h2>
      <Ar className="text-stone-500 text-xl mb-6">{w.fnAr}</Ar>

      <div className="rounded-xl border-2 p-5 mb-6 flex flex-wrap items-center gap-3" style={{ borderColor: w.colour, background: CARD }}>
        <span className="font-black text-[16px]" style={{ color: TRACK_COLOR.life }}>{w.life}</span>
        <span className="font-black text-2xl" style={{ color: GOLD }}>→</span>
        <span className="font-black text-[16px]" style={{ color: TRACK_COLOR.work }}>{w.work}</span>
      </div>

      <div className="space-y-2">
        {days.map(l => (
          <div key={l.no} className="rounded-xl border p-3.5 flex items-start gap-3" style={{ borderColor: LINE, background: CARD }}>
            <span className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-black text-[15px] text-white"
                  style={{ background: TRACK_COLOR[l.track] }}>{l.no}</span>
            <div className="min-w-0 flex-1">
              <p className="font-black text-[15px] leading-tight">{l.title}</p>
              <p className="text-[13px] text-stone-600 leading-snug mt-0.5">“{l.canDo.en}”</p>
            </div>
            <span className="shrink-0 text-[10px] font-black px-2 py-1 rounded" style={{ background: CARD2, color: MUTED }}>{l.level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

function LessonSlide({ lesson, phase, colour }: { lesson: Lesson; phase: Phase; colour: string }) {
  const M = PHASE_META[phase]
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: colour }}>
        <M.icon size={14} /> Day {lesson.no} · {TRACK_META[lesson.track].label} · {M.label}
      </div>
      <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-1" style={{ color: TEXT }}>{lesson.title}</h2>
      <Ar className="text-stone-500 mb-6">{lesson.titleAr}</Ar>

      {/* ── WARM-UP ── */}
      {phase === 'warmup' && (() => {
        const w = warmUpFor(lesson.no)
        return (
          <div className="space-y-5">
            <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
              <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>
                Sixty seconds · she talks · correct nothing
              </div>
              <p className="text-2xl sm:text-3xl font-black leading-snug">{lesson.warm.open.en}</p>
              <Ar className="text-stone-500 mt-1.5 text-lg">{lesson.warm.open.ar}</Ar>
            </div>
            {w.back.length > 0 && (
              <div>
                <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                  From yesterday — she must use all of these
                </div>
                <div className="space-y-2">
                  {w.back.map(b => (
                    <div key={b.en} className="rounded-lg border px-4 py-2.5 flex items-baseline gap-3" style={{ borderColor: LINE, background: CARD }}>
                      <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: DIM }}>D{b.from}</span>
                      <div className="min-w-0">
                        <p className="text-[17px] font-black leading-snug">{b.en}</p>
                        <Ar className="text-stone-500 text-sm">{b.ar}</Ar>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {w.far && (
              <div className="rounded-xl border p-4" style={{ borderColor: GOLD, background: '#fffbeb' }}>
                <div className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: AMBER }}>
                  From a week ago — day {w.far.from}
                </div>
                <p className="text-[17px] font-black leading-snug">{w.far.en}</p>
                <Ar className="text-stone-500 text-sm">{w.far.ar}</Ar>
                <p className="text-[12px] text-stone-500 mt-2 border-t pt-2" style={{ borderColor: LINE }}>
                  A phrase starts to disappear about a week after it is taught. This one line is what stops that.
                </p>
              </div>
            )}
          </div>
        )
      })()}

      {/* ── OBJECTIVE ── */}
      {phase === 'goal' && (
        <div className="space-y-5">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>
              The one thing she can do at the end
            </div>
            <p className="text-xl sm:text-2xl font-black leading-snug">“{lesson.canDo.en}”</p>
            <Ar className="text-stone-500 mt-1.5 text-lg">{lesson.canDo.ar}</Ar>
          </div>

          {lesson.from && (
            <div className="rounded-xl border-2 p-4" style={{ borderColor: TRACK_COLOR.bridge, background: '#fffbeb' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: AMBER }}>
                <ArrowUpRight size={13} /> This comes up from day {lesson.from.day}
              </div>
              <p className="text-[15px] leading-snug">{lesson.from.what}</p>
              <Ar className="text-stone-500 text-[13px] mt-1.5">{lesson.from.whatAr}</Ar>
            </div>
          )}

          <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: GOLD, background: CARD }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: AMBER }}>
              Tell her now — this is the test at the end
            </div>
            <p className="text-[18px] font-black leading-snug">{lesson.exit.task}</p>
            <Ar className="text-stone-500 text-sm mt-1">{lesson.exit.taskAr}</Ar>
          </div>
        </div>
      )}

      {/* ── PHRASES ── */}
      {phase === 'target' && (
        <div className="space-y-2.5">
          {lesson.target.map(c => (
            <div key={c.en} className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <p className="text-[18px] sm:text-[22px] font-black leading-snug flex-1 min-w-0"><Hi text={c.en} color={colour} /></p>
                {c.use && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shrink-0"
                        style={{ background: CARD2, color: AMBER }}>{c.use}</span>
                )}
              </div>
              <Ar className="text-stone-500 mt-1">{c.ar}</Ar>
            </div>
          ))}
        </div>
      )}

      {/* ── PATTERN ── */}
      {phase === 'pattern' && (
        <div className="space-y-5">
          <div className="rounded-xl border-2 p-6" style={{ borderColor: colour, background: CARD2 }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-3" style={{ color: colour }}>
              One frame to fill — never a grammar rule
            </div>
            <p className="text-2xl sm:text-3xl font-black leading-snug font-mono">{lesson.pattern.frame}</p>
            <Ar className="text-stone-500 mt-2 text-lg">{lesson.pattern.ar}</Ar>
          </div>
          <div className="space-y-2">
            {lesson.pattern.examples.map(e => (
              <div key={e} className="rounded-lg border px-4 py-3" style={{ borderColor: LINE, background: CARD }}>
                <p className="text-[18px] font-black leading-snug">{e}</p>
              </div>
            ))}
          </div>
          <p className="text-[12.5px] text-stone-500 border-t pt-4" style={{ borderColor: LINE }}>
            If you find yourself explaining <i>why</i> the frame works, stop. She is A1 in production —
            the moment this becomes a grammar lecture, she stops talking and the hour is lost.
          </p>
        </div>
      )}

      {/* ── ARABIC TRAP ── */}
      {phase === 'trap' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 p-5" style={{ borderColor: RED, background: '#fef2f2' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: RED }}>
                <AlertTriangle size={13} /> What Arabic makes her say
              </div>
              <p className="text-[19px] sm:text-[22px] font-black leading-snug" style={{ color: RED }}>{lesson.trap.wrong}</p>
            </div>
            <div className="rounded-xl border-2 p-5" style={{ borderColor: GREEN, background: '#f0fdf4' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: GREEN }}>
                <CheckCircle2 size={13} /> What English needs
              </div>
              <p className="text-[19px] sm:text-[22px] font-black leading-snug" style={{ color: GREEN }}>{lesson.trap.right}</p>
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: LINE, background: CARD }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: MUTED }}>
              Why her ear refuses the English
            </div>
            <p className="text-[15px] leading-relaxed">{lesson.trap.why}</p>
            <Ar className="text-stone-600 text-[14px] leading-relaxed mt-3 border-t pt-3" style={{ borderColor: LINE }}>{lesson.trap.whyAr}</Ar>
          </div>

          {lesson.trap.french && (
            <div className="rounded-xl border p-4" style={{ borderColor: GOLD, background: '#fffbeb' }}>
              <div className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: AMBER }}>
                And her French
              </div>
              <p className="text-[14.5px] leading-snug">{lesson.trap.french}</p>
            </div>
          )}

          <p className="text-[12.5px] text-stone-500 border-t pt-4" style={{ borderColor: LINE }}>
            Telling her to “remember the article” does nothing. Showing her the Arabic structure that
            makes the English feel wrong turns a careless mistake into a predictable one — and a
            predictable mistake is one she can catch herself.
          </p>
        </div>
      )}

      {/* ── SOUND ── */}
      {phase === 'sound' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
            <p className="text-2xl sm:text-3xl font-black leading-snug">{lesson.sound.focus}</p>
            <Ar className="text-stone-500 mt-1 text-lg">{lesson.sound.focusAr}</Ar>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {lesson.sound.pairs.map(([a, b]) => (
              <div key={a + b} className="rounded-xl border p-4 flex items-center justify-between gap-3" style={{ borderColor: LINE, background: CARD }}>
                <span className="text-[19px] font-black leading-snug">{a}</span>
                <span className="text-stone-300 font-black">/</span>
                <span className="text-[15px] font-bold text-right" style={{ color: MUTED }}>{b}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-5" style={{ borderColor: LINE, background: CARD }}>
            <p className="text-[15px] leading-relaxed">{lesson.sound.tip}</p>
            <Ar className="text-stone-600 text-[14px] leading-relaxed mt-2 border-t pt-2" style={{ borderColor: LINE }}>{lesson.sound.tipAr}</Ar>
          </div>

          {lesson.sound.gift && (
            <div className="rounded-xl border-2 p-4" style={{ borderColor: GREEN, background: '#f0fdf4' }}>
              <div className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: GREEN }}>
                She already owns this one
              </div>
              <p className="text-[15px] leading-snug font-bold">{lesson.sound.gift}</p>
            </div>
          )}
        </div>
      )}

      {/* ── HER WORDS ── */}
      {phase === 'vocab' && lesson.vocab && (
        <div className="space-y-2.5">
          {lesson.vocab.map(v => (
            <div key={v.en} className="rounded-xl border p-4 flex items-baseline justify-between gap-4 flex-wrap" style={{ borderColor: LINE, background: CARD }}>
              <div className="min-w-0">
                <p className="text-[20px] font-black leading-snug">{v.en}</p>
                <Ar className="text-stone-500">{v.ar}</Ar>
              </div>
              {v.say && <span className="font-mono text-[13px] font-bold shrink-0" style={{ color: AMBER }}>{v.say}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── DRILL ── */}
      {phase === 'drill' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
            <p className="text-xl sm:text-2xl font-black leading-snug">{lesson.drill.instruction}</p>
            <Ar className="text-stone-500 mt-1.5">{lesson.drill.instructionAr}</Ar>
          </div>
          <div className="space-y-2">
            {lesson.drill.prompts.map((p, i) => (
              <div key={p} className="rounded-lg border px-4 py-3 flex items-baseline gap-3" style={{ borderColor: LINE, background: CARD }}>
                <span className="text-[12px] font-mono font-black shrink-0" style={{ color: DIM }}>{i + 1}</span>
                <p className="text-[17px] font-bold leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONVERSATION ── */}
      {phase === 'dialogue' && lesson.dialogue && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD2 }}>
            <p className="text-xl font-black">{lesson.dialogue.title}</p>
            <Ar className="text-stone-500 text-sm">{lesson.dialogue.titleAr}</Ar>
            <p className="text-[13px] text-stone-600 mt-2 border-t pt-2" style={{ borderColor: LINE }}>{lesson.dialogue.setting}</p>
            <Ar className="text-stone-500 text-[13px]">{lesson.dialogue.settingAr}</Ar>
          </div>
          <div className="space-y-2">
            {lesson.dialogue.turns.map((t, i) => (
              <div key={i} className={`rounded-xl border p-3.5 ${t.who === 'B' ? 'ml-6' : 'mr-6'}`}
                   style={{ borderColor: t.who === 'B' ? colour : LINE, background: t.who === 'B' ? CARD2 : CARD }}>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                        style={{ background: t.who === 'B' ? colour : DIM }}>{t.who}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-bold leading-snug"><Hi text={t.en} color={AMBER} /></p>
                    {t.ar && <Ar className="text-stone-500 text-[14px] mt-0.5">{t.ar}</Ar>}
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
              <div className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: AMBER }}>
                Listen for this on the second run
              </div>
              <p className="text-[15px] leading-snug font-bold">{lesson.dialogue.watch.en}</p>
              <Ar className="text-stone-500 text-[13.5px] mt-1">{lesson.dialogue.watch.ar}</Ar>
            </div>
          )}
        </div>
      )}

      {/* ── HOT SEAT ── */}
      {phase === 'hotseat' && (
        <div className="space-y-3">
          <p className="text-[13px] text-stone-600 mb-1">No notes. No warning. Fire them in any order and do not wait.</p>
          {lesson.hotSeat.map((q, i) => (
            <div key={q} className="rounded-xl border-2 p-4 flex items-baseline gap-3" style={{ borderColor: LINE, background: CARD }}>
              <span className="text-[13px] font-mono font-black shrink-0" style={{ color: colour }}>{i + 1}</span>
              <p className="text-[20px] sm:text-[24px] font-black leading-snug">{q}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── SAY IT ALL ── */}
      {phase === 'speech' && lesson.speech && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD2 }}>
            <p className="text-xl font-black">{lesson.speech.title}</p>
            <Ar className="text-stone-500 text-sm">{lesson.speech.titleAr}</Ar>
          </div>
          <div className="space-y-2">
            {lesson.speech.lines.map((l, i) => (
              <div key={l} className="rounded-xl border p-4 flex items-baseline gap-3" style={{ borderColor: LINE, background: CARD }}>
                <span className="text-[12px] font-mono font-black shrink-0" style={{ color: DIM }}>{i + 1}</span>
                <p className="text-[19px] sm:text-[22px] font-black leading-snug">{l}</p>
              </div>
            ))}
          </div>
          {lesson.speech.note && (
            <div className="rounded-xl border p-4" style={{ borderColor: GOLD, background: '#fffbeb' }}>
              <p className="text-[14.5px] leading-snug font-bold">{lesson.speech.note}</p>
              {lesson.speech.noteAr && <Ar className="text-stone-500 text-[13px] mt-1">{lesson.speech.noteAr}</Ar>}
            </div>
          )}
        </div>
      )}

      {/* ── EXIT CHECK ── */}
      {phase === 'exit' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-5" style={{ borderColor: colour, background: CARD2 }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>She does this now</div>
            <p className="text-2xl sm:text-3xl font-black leading-snug">{lesson.exit.task}</p>
            <Ar className="text-stone-500 mt-1.5 text-lg">{lesson.exit.taskAr}</Ar>
          </div>
          <div className="rounded-xl border-2 p-5" style={{ borderColor: GOLD, background: '#fffbeb' }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: AMBER }}>
              What you are actually judging
            </div>
            <p className="text-[19px] font-black leading-snug">{lesson.exit.pass}</p>
            <Ar className="text-stone-500 mt-1">{lesson.exit.passAr}</Ar>
          </div>
          <div className="rounded-xl border p-4 text-[13px] leading-relaxed" style={{ borderColor: LINE, background: CARD }}>
            <b>If she cannot do it, the lesson is not finished.</b> Do not move on and hope. Put it at
            the top of tomorrow&apos;s warm-up and run it again before the new material. In an everyday
            course, one unlearned day quietly poisons the next six.
            <Ar className="text-stone-500 mt-2">إن لم تستطع، فالدرس لم ينتهِ. أعِده في إحماء الغد قبل المادة الجديدة.</Ar>
          </div>
        </div>
      )}

      {/* ── HOMEWORK ── */}
      {phase === 'homework' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-6" style={{ borderColor: colour, background: CARD2 }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>Before tomorrow</div>
            <p className="text-2xl sm:text-3xl font-black leading-snug">{lesson.homework.en}</p>
            <Ar className="text-stone-500 mt-2 text-lg">{lesson.homework.ar}</Ar>
          </div>
          <p className="text-[13px] text-stone-600 border-t pt-4" style={{ borderColor: LINE }}>
            This is not extra work — it becomes the first five minutes of tomorrow. If she does not do
            it, tomorrow&apos;s warm-up has nothing to recall and the spacing breaks.
          </p>
        </div>
      )}
    </div>
  )
}
