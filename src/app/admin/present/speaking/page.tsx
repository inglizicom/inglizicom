'use client'

/**
 * /admin/present/speaking — "Speak Your Work" teaching deck.
 *
 * A private course for one senior Earth Observation professional who has to
 * speak English in meetings, conferences and project presentations. It is a
 * SPEAKING deck, not a grammar deck: every lesson runs
 *   Goal → Phrases → Words → Model → Drill → Hot seat → Homework
 * and the teacher's job on every slide is to get her talking, not to explain.
 *
 * The rail under the header keeps that path on screen so neither of them loses
 * the thread mid-lesson. Phrases above A1 carry a simpler fallback the teacher
 * can drop to live (the ↓ line) — press S to show or hide them.
 *
 * Navigate: ← → / Space / side-click. Full screen: F. Jump to a lesson from
 * the cover. Content lives in src/data/speaking-course.ts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, Mic, Target,
  MessagesSquare, BookOpen, Repeat, Flame, Home, Volume2, Route, Zap, ListChecks,
} from 'lucide-react'
import { ORDERED, PHASES, PROTOCOL, FOCUS, weekOf, dayOf, type Lesson } from '@/data/speaking-course'

/* Same visual language as "English from Zero" (/admin/present/writing):
   white paper, ink brown, gold. A projected deck reads best on white, and
   using one palette across the decks means the teacher never re-learns a UI. */
const INK    = '#2a1d12'
const GOLD   = '#facc15'
const AMBER  = '#b45309'
const PAPER  = '#ffffff'
const CARD   = '#fffbeb'   // warm card
const CARD2  = '#fef3c7'   // raised card
const LINE   = '#e7e5e4'   // stone-200
const TEXT   = '#2a1d12'
const MUTED  = '#78716c'   // stone-500
const DIM    = '#a8a29e'   // stone-400
const ACCENT = '#b45309'

/* Phases carry a colour so she always knows which block of the two months she
   is in without reading anything. */
const PHASE_COLOR: Record<number, string> = { 1: '#b45309', 2: '#15803d', 3: '#6d28d9', 4: '#a16207' }

type Phase = 'goal' | 'chunks' | 'vocab' | 'model' | 'drill' | 'hotseat' | 'homework'
const PHASE_META: Record<Phase, { label: string; ar: string; icon: typeof Target }> = {
  goal:     { label: 'Goal',     ar: 'الهدف',     icon: Target },
  chunks:   { label: 'Phrases',  ar: 'العبارات',  icon: MessagesSquare },
  vocab:    { label: 'Words',    ar: 'الكلمات',   icon: BookOpen },
  model:    { label: 'Model',    ar: 'النموذج',   icon: Volume2 },
  drill:    { label: 'Drill',    ar: 'التمرين',   icon: Repeat },
  hotseat:  { label: 'Hot seat', ar: 'الأسئلة',   icon: Flame },
  homework: { label: 'Homework', ar: 'الواجب',    icon: ListChecks },
}

type Slide =
  | { k: 'cover' }
  | { k: 'focus' }
  | { k: 'protocol' }
  | { k: 'phase'; phase: number }
  | { k: 'lesson'; lesson: Lesson; phase: Phase }

/* Spotlight *asterisked* fragments. */
function Hi({ text, color = GOLD }: { text: string; color?: string }) {
  const parts = text.split('*')
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <span key={i} style={{ color, fontWeight: 900 }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  )
}

function buildSlides(): Slide[] {
  const out: Slide[] = [{ k: 'cover' }, { k: 'focus' }, { k: 'protocol' }]
  PHASES.forEach(ph => {
    out.push({ k: 'phase', phase: ph.no })
    ORDERED.filter(l => l.phase === ph.no).forEach(lesson => {
      const stages: Phase[] = ['goal', 'chunks']
      if (lesson.vocab?.length)   stages.push('vocab')
      if (lesson.model)           stages.push('model')
      if (lesson.drill)           stages.push('drill')
      if (lesson.hotSeat?.length) stages.push('hotseat')
      stages.push('homework')
      stages.forEach(phase => out.push({ k: 'lesson', lesson, phase }))
    })
  })
  return out
}

export default function SpeakingDeck() {
  const slides = useMemo(buildSlides, [])
  const [idx, setIdx] = useState(0)
  const [fs, setFs] = useState(false)
  const [showAlt, setShowAlt] = useState(true)
  const stageRef = useRef<HTMLDivElement>(null)

  const go = useCallback((d: number) => {
    setIdx(i => Math.min(slides.length - 1, Math.max(0, i + d)))
  }, [slides.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      if (e.key === 'f' || e.key === 'F') toggleFs()
      if (e.key === 's' || e.key === 'S') setShowAlt(v => !v)
      if (e.key === 'Home') setIdx(0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  const s = slides[idx]
  const lesson = s.k === 'lesson' ? s.lesson : null
  const colour = lesson ? PHASE_COLOR[lesson.phase] : (s.k === 'phase' ? PHASE_COLOR[s.phase] : ACCENT)

  /* The stage rail for the lesson we are inside. */
  const railStages: Phase[] = useMemo(() => {
    if (!lesson) return []
    const st: Phase[] = ['goal', 'chunks']
    if (lesson.vocab?.length)   st.push('vocab')
    if (lesson.model)           st.push('model')
    if (lesson.drill)           st.push('drill')
    if (lesson.hotSeat?.length) st.push('hotseat')
    st.push('homework')
    return st
  }, [lesson])

  const jumpTo = (lessonNo: number) => {
    const at = slides.findIndex(x => x.k === 'lesson' && x.lesson.no === lessonNo && x.phase === 'goal')
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
          <Link href="/admin/present" className="flex items-center gap-1.5 text-[12px] font-bold text-stone-500 hover:text-stone-800">
            <ArrowLeft size={14} /> Decks
          </Link>
          <span className="text-stone-500">|</span>
          <span className="flex items-center gap-2 font-black text-[14px] truncate">
            <Mic size={16} style={{ color: ACCENT }} /> Speak Your Work
            <span className="text-[11px] font-semibold text-stone-500 hidden sm:inline">· English for Earth Observation</span>
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAlt(v => !v)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-md border transition-colors"
            style={{ borderColor: showAlt ? ACCENT : '#334155', color: showAlt ? ACCENT : '#64748b' }}
            title="Show the simpler A1 fallback under each phrase (S)"
          >
            A1 fallback {showAlt ? 'on' : 'off'}
          </button>
          <span className="text-[11px] font-mono text-stone-500">{idx + 1}/{slides.length}</span>
          <button onClick={toggleFs} className="text-stone-500 hover:text-stone-800">
            {fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── stage rail ── */}
      {lesson && (
        <div className="relative z-30 flex items-center gap-1.5 px-5 py-2 overflow-x-auto border-b bg-white/80" style={{ borderColor: LINE }}>
          <span className="text-[10px] font-black tracking-widest uppercase shrink-0 mr-1" style={{ color: colour }}>
            W{weekOf(lesson.no)} · D{dayOf(lesson.no)}
          </span>
          {railStages.map(p => {
            const M = PHASE_META[p]
            const active = s.k === 'lesson' && s.phase === p
            const done = railStages.indexOf(p) < railStages.indexOf((s as { phase: Phase }).phase)
            return (
              <button
                key={p}
                onClick={() => jumpStage(p)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all border"
                style={{
                  borderColor: active ? colour : '#334155',
                  background: active ? colour : 'transparent',
                  color: active ? INK : done ? '#475569' : '#94a3b8',
                }}
              >
                <M.icon size={11} /> {M.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── stage ── */}
      <div className="flex-1 relative overflow-hidden z-20">
        {/* side click zones */}
        <button className="absolute left-0 top-0 bottom-0 w-[12%] z-20 cursor-w-resize" onClick={() => go(-1)} aria-label="previous" />
        <button className="absolute right-0 top-0 bottom-0 w-[12%] z-20 cursor-e-resize" onClick={() => go(1)} aria-label="next" />

        {/* Plain div, no entrance animation. Two earlier attempts made the
            slide body depend on JavaScript to be visible — AnimatePresence
            deadlocking, then a motion.div left stuck at opacity 0. A teaching
            slide must never need a script to be seen. */}
        <div
          key={idx}
          className="absolute inset-0 overflow-y-auto px-6 sm:px-12 py-8 flex flex-col"
        >
          {s.k === 'cover'    && <Cover onJump={jumpTo} onFull={toggleFs} />}
          {s.k === 'focus'    && <FocusSlide />}
          {s.k === 'protocol' && <ProtocolSlide />}
          {s.k === 'phase'    && <PhaseSlide no={s.phase} />}
          {s.k === 'lesson'   && <LessonSlide lesson={s.lesson} phase={s.phase} colour={colour} showAlt={showAlt} />}
        </div>
      </div>

      {/* ── footer ── */}
      <div className="relative z-30 flex items-center justify-between px-5 py-2.5 border-t bg-white/80" style={{ borderColor: LINE }}>
        <button onClick={() => go(-1)} className="flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-stone-800">
          <ChevronLeft size={15} /> Back
        </button>
        <span className="text-[10px] text-stone-500 hidden sm:block">← → move · F full screen · S fallback</span>
        <button onClick={() => go(1)} className="flex items-center gap-1 text-[12px] font-bold" style={{ color: ACCENT }}>
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SLIDES
   ══════════════════════════════════════════════════════════════════════════ */

function Cover({ onJump, onFull }: { onJump: (n: number) => void; onFull: () => void }) {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Mic size={14} /> Private course · 48 days · 6 a week
      </div>
      <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3" style={{ color: TEXT }}>Speak Your Work</h1>
      <p className="text-stone-500 text-lg mb-2">From the coffee break to the conference stage, in eight weeks.</p>
      <button
        onClick={onFull}
        className="mb-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[15px] transition-transform hover:-translate-y-0.5"
        style={{ background: ACCENT, color: INK }}
      >
        <Maximize2 size={17} /> Start full screen
      </button>
      <p className="text-stone-500 text-sm mb-8 max-w-2xl">
        Forty-eight daily lessons. Four weeks of ordinary life first — meeting people, the weekend,
        a taxi, a restaurant — because the fear is what stops her, not the vocabulary. Her job appears
        on day 25, the stage on day 39. Every sixth day is review: no new material, she just talks.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {PHASES.map(ph => (
          <div key={ph.no} className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PHASE_COLOR[ph.no] }} />
              <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: PHASE_COLOR[ph.no] }}>{ph.weeks}</span>
            </div>
            <div className="font-black mb-1">{ph.title}</div>
            <p className="text-stone-500 text-[13px] leading-relaxed mb-3">{ph.aim}</p>
            <div className="flex flex-wrap gap-1.5">
              {ORDERED.filter(l => l.phase === ph.no).map(l => (
                <button
                  key={l.no}
                  onClick={() => onJump(l.no)}
                  className="text-[11px] font-bold px-2 py-1 rounded-md border hover:brightness-125 transition"
                  style={{ borderColor: LINE, color: MUTED }}
                >
                  D{l.no} · {l.tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FocusSlide() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Zap size={14} /> Her question, answered
      </div>
      <h2 className="text-3xl font-black mb-2" style={{ color: TEXT }}>What to fix first</h2>
      <p className="text-stone-500 mb-7 text-sm">She asked what to focus on. This is the whole answer — and what to deliberately ignore.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5" style={{ borderColor: '#4a5f4a', background: CARD }}>
          <div className="text-[11px] font-black tracking-widest uppercase text-emerald-400 mb-3">Fix now</div>
          <ul className="space-y-3">
            {FOCUS.first.map(f => (
              <li key={f.en}>
                <div className="font-bold text-[15px] leading-snug">{f.en}</div>
                <div dir="rtl" className="text-stone-500 text-[13px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{f.ar}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: '#5f4340', background: CARD }}>
          <div className="text-[11px] font-black tracking-widest uppercase text-rose-400 mb-3">Ignore for now</div>
          <ul className="space-y-3">
            {FOCUS.later.map(f => (
              <li key={f.en}>
                <div className="font-bold text-[15px] leading-snug text-stone-600">{f.en}</div>
                <div dir="rtl" className="text-stone-500 text-[13px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{f.ar}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProtocolSlide() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
        <Route size={14} /> Between lessons
      </div>
      <h2 className="text-3xl font-black mb-1" style={{ color: TEXT }}>{PROTOCOL.title}</h2>
      <p dir="rtl" className="text-stone-500 mb-7" style={{ fontFamily: "'Tajawal', sans-serif" }}>{PROTOCOL.titleAr}</p>

      <div className="space-y-3">
        {PROTOCOL.items.map((it, i) => (
          <div key={it.what} className="rounded-xl border p-4 flex gap-4" style={{ borderColor: LINE, background: CARD }}>
            <div className="text-2xl font-black shrink-0 w-8" style={{ color: ACCENT }}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="font-black text-[16px]">{it.what}</div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: LINE, color: GOLD }}>{it.mins}</span>
              </div>
              <div dir="rtl" className="text-stone-500 text-[13px] mb-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{it.whatAr}</div>
              <p className="text-stone-500 text-[13.5px] leading-relaxed">{it.how}</p>
              <p dir="rtl" className="text-stone-500 text-[12.5px] leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>{it.howAr}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-stone-500 text-[12px] mt-5 text-center">
        Thirty minutes a day. Nothing on this list involves writing — writing first is what stops her speaking.
      </p>
    </div>
  )
}

function PhaseSlide({ no }: { no: number }) {
  const ph = PHASES.find(p => p.no === no)!
  const col = PHASE_COLOR[no]
  const lessons = ORDERED.filter(l => l.phase === no)
  return (
    <div className="max-w-3xl mx-auto w-full my-auto text-center">
      <div className="text-[11px] font-black tracking-[0.4em] uppercase mb-4" style={{ color: col }}>{ph.weeks}</div>
      <h2 className="text-5xl font-black mb-3" style={{ color: TEXT }}>{ph.title}</h2>
      <p dir="rtl" className="text-2xl font-bold text-stone-500 mb-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>{ph.titleAr}</p>
      <p className="text-stone-500 text-lg leading-relaxed mb-2 max-w-xl mx-auto">{ph.aim}</p>
      <p dir="rtl" className="text-stone-500 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>{ph.aimAr}</p>
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
        {lessons.map(l => (
          <span key={l.no} className="text-[12px] font-bold px-3 py-1.5 rounded-full border" style={{ borderColor: col, color: col }}>
            D{l.no} · {l.tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function LessonSlide({ lesson, phase, colour, showAlt }: {
  lesson: Lesson; phase: Phase; colour: string; showAlt: boolean
}) {
  const M = PHASE_META[phase]
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: colour }}>
        <M.icon size={14} /> Day {lesson.no} · Week {weekOf(lesson.no)} · {M.label}
      </div>
      <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-1" style={{ color: TEXT }}>{lesson.title}</h2>
      <p dir="rtl" className="text-stone-500 mb-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.titleAr}</p>

      {phase === 'goal' && (
        <div className="space-y-5">
          <div className="rounded-xl border p-5" style={{ borderColor: colour, background: CARD }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>By the end she can say</div>
            <p className="text-xl sm:text-2xl font-black leading-snug">“{lesson.canSay}”</p>
          </div>
          <div>
            <p className="text-stone-600 text-lg">{lesson.goal.en}</p>
            <p dir="rtl" className="text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.goal.ar}</p>
          </div>
          <p className="text-stone-500 text-[12px] border-t pt-4" style={{ borderColor: LINE }}>
            Teacher: she talks, you listen. Correct only what stops understanding.
          </p>
        </div>
      )}

      {phase === 'chunks' && (
        <div className="space-y-2.5">
          {lesson.chunks.map(c => (
            <div key={c.en} className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <p className="text-[17px] sm:text-xl font-bold leading-snug flex-1 min-w-0"><Hi text={c.en} color={colour} /></p>
                {c.use && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shrink-0"
                        style={{ background: LINE, color: GOLD }}>{c.use}</span>
                )}
              </div>
              <p dir="rtl" className="text-stone-500 text-[14px] mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{c.ar}</p>
              {showAlt && c.alt && (
                <p className="text-[13px] mt-2 pt-2 border-t flex items-start gap-2" style={{ borderColor: LINE, color: DIM }}>
                  <span className="font-black" style={{ color: DIM }}>↓ simpler</span>
                  <span>{c.alt}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'vocab' && lesson.vocab && (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {lesson.vocab.map(v => (
            <div key={v.en} className="rounded-xl border p-4" style={{ borderColor: LINE, background: CARD }}>
              <div className="font-black text-lg">{v.en}</div>
              <div dir="rtl" className="text-stone-500 text-[14px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{v.ar}</div>
              {v.say && (
                <div className="text-[12.5px] mt-2 flex items-start gap-1.5" style={{ color: GOLD }}>
                  <Volume2 size={13} className="mt-0.5 shrink-0" /> {v.say}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'model' && lesson.model && (
        <div>
          <div className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: colour }}>{lesson.model.title}</div>
          <div dir="rtl" className="text-stone-500 text-[13px] mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.model.titleAr}</div>
          <div className="rounded-xl border p-5 sm:p-6 space-y-3" style={{ borderColor: colour, background: CARD }}>
            {lesson.model.lines.map((l, i) => (
              <p key={i} className="text-lg sm:text-[22px] font-bold leading-snug flex gap-3">
                <span className="text-stone-500 font-mono text-sm shrink-0 pt-1.5">{i + 1}</span>
                <span><Hi text={l} color={colour} /></span>
              </p>
            ))}
          </div>
          {lesson.model.note && (
            <div className="mt-4 rounded-xl border p-4" style={{ borderColor: '#5c4a28', background: CARD2 }}>
              <p className="text-[14px] leading-relaxed" style={{ color: '#e0b45f' }}>{lesson.model.note}</p>
              <p dir="rtl" className="text-stone-500 text-[13px] mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.model.noteAr}</p>
            </div>
          )}
        </div>
      )}

      {phase === 'drill' && lesson.drill && (
        <div>
          <div className="rounded-xl border p-5 mb-4" style={{ borderColor: colour, background: CARD }}>
            <div className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: colour }}>The frame</div>
            <p className="text-xl sm:text-2xl font-black leading-snug">{lesson.drill.frame}</p>
            <p dir="rtl" className="text-stone-500 mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.drill.frameAr}</p>
          </div>
          <div className="text-[11px] font-black tracking-widest uppercase text-stone-500 mb-2">Swap these in</div>
          <div className="space-y-2">
            {lesson.drill.slots.map(sl => (
              <div key={sl} className="rounded-lg border px-4 py-3 text-[16px] font-bold" style={{ borderColor: LINE, background: CARD2 }}>
                {sl}
              </div>
            ))}
          </div>
          {lesson.drill.note && <p className="text-stone-500 text-[13px] mt-4">{lesson.drill.note}</p>}
        </div>
      )}

      {phase === 'hotseat' && lesson.hotSeat && (
        <div>
          <p className="text-stone-500 mb-5">
            Fire these at her one after another. No preparation, no writing. If she stops, wait — do not rescue her.
          </p>
          <div className="space-y-3">
            {lesson.hotSeat.map((q, i) => (
              <div key={q} className="rounded-xl border p-4 flex items-start gap-4" style={{ borderColor: LINE, background: CARD }}>
                <span className="text-2xl font-black shrink-0" style={{ color: colour }}>{i + 1}</span>
                <p className="text-lg sm:text-xl font-bold leading-snug">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'homework' && (
        <div className="rounded-xl border p-6" style={{ borderColor: colour, background: CARD }}>
          <div className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase mb-3" style={{ color: colour }}>
            <ListChecks size={14} /> Before the next lesson
          </div>
          <p className="text-xl sm:text-2xl font-black leading-snug mb-2">{lesson.homework.en}</p>
          <p dir="rtl" className="text-stone-500 text-lg" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lesson.homework.ar}</p>
          <p className="text-stone-500 text-[12px] mt-5 pt-4 border-t" style={{ borderColor: LINE }}>
            One take. Sent the same day. A perfect recording made on the fourth attempt teaches nothing.
          </p>
        </div>
      )}
    </div>
  )
}
