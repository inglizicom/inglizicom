'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGameState } from '@/lib/useGameState'
import { XP_CORRECT_ANSWER, XP_LESSON_COMPLETE, XP_PERFECT_BONUS } from '@/lib/game'
import type { LessonData, Exercise } from '@/data/lessons-data'
import { fetchPublishedLessons } from '@/lib/lessons-db'
import { playClick, playCorrect, playWrong, playReward } from '@/lib/sounds'

// ─── Types ────────────────────────────────────────────────────────────────────

type Lesson = LessonData
type ExType = 'mc' | 'fill' | 'en_ar' | 'ar_en' | 'order'

type Phase = 'vocab' | 'sentences' | 'natural' | 'dialogue' | 'exercises' | 'complete'

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadXp(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('inglizi_total_xp') ?? '0', 10)
}
function loadCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('inglizi_completed_lessons') ?? '[]') } catch { return [] }
}
function markCompleted(id: string) {
  const c = loadCompleted()
  if (!c.includes(id)) localStorage.setItem('inglizi_completed_lessons', JSON.stringify([...c, id]))
}

// ─── SpeechSynthesis helper ───────────────────────────────────────────────────

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = 'en-US'
  utt.rate  = 0.88
  utt.pitch = 1.05
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
}

// ─── Audio Button ─────────────────────────────────────────────────────────────

function AudioBtn({
  text, size = 'md', color = '#10b981',
}: {
  text: string; size?: 'sm' | 'md' | 'lg'; color?: string
}) {
  const [playing, setPlaying] = useState(false)

  function play(e: React.MouseEvent) {
    e.stopPropagation()
    playClick()
    setPlaying(true)
    speak(text, () => setPlaying(false))
  }

  const dim = size === 'lg' ? 56 : size === 'sm' ? 32 : 44
  const fs  = size === 'lg' ? 24 : size === 'sm' ? 14 : 18

  return (
    <button
      onClick={play}
      className="flex items-center justify-center rounded-full transition-all active:scale-90 shrink-0"
      style={{
        width: dim, height: dim, fontSize: fs,
        background: playing ? `${color}28` : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${playing ? color + '60' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: playing ? `0 0 14px ${color}40` : 'none',
      }}
      title="استمع"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  )
}

// ─── Progress Header ──────────────────────────────────────────────────────────

function ProgressHeader({
  phase, phaseStep, phaseTotal, onBack, color,
}: {
  phase: Phase; phaseStep: number; phaseTotal: number; onBack: () => void; color: string
}) {
  const labels: Record<Phase, string> = {
    vocab: 'المفردات', sentences: 'الجمل', natural: 'جمل طبيعية', dialogue: 'الحوار', exercises: 'التمارين', complete: 'مكتمل',
  }
  const icons: Record<Phase, string> = {
    vocab: '📚', sentences: '✏️', natural: '🗣️', dialogue: '💬', exercises: '🎯', complete: '🏆',
  }
  const allPhases: Phase[] = ['vocab', 'sentences', 'natural', 'dialogue', 'exercises']
  const idx = allPhases.indexOf(phase)

  return (
    <div
      className="shrink-0 px-4 pt-16 pb-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)' }}
        >
          ← رجوع
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-lg">{icons[phase]}</span>
          <span className="text-white font-black text-sm" dir="rtl">{labels[phase]}</span>
        </div>

        <div
          className="px-2.5 py-2 rounded-xl text-xs font-black"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}
        >
          {phaseStep}/{phaseTotal}
        </div>
      </div>

      {/* Phase dots */}
      <div className="flex gap-1.5 mb-2">
        {allPhases.map((p, i) => (
          <div
            key={p}
            className="flex-1 h-1.5 rounded-full transition-all duration-500"
            style={{
              background: i < idx
                ? color
                : i === idx
                  ? `${color}80`
                  : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* Step dots within phase */}
      {phaseTotal > 1 && (
        <div className="flex gap-1">
          {Array.from({ length: phaseTotal }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i < phaseStep
                  ? color
                  : i === phaseStep - 1
                    ? `${color}90`
                    : 'rgba(255,255,255,0.06)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Vocab Phase ──────────────────────────────────────────────────────────────

function VocabPhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [visible, setVisible] = useState(true)
  const word = lesson.vocab[index]

  // Auto-play each new word
  useEffect(() => {
    const t = setTimeout(() => speak(word.word), 350)
    return () => clearTimeout(t)
  }, [index, word.word])

  function next() {
    setVisible(false)
    setTimeout(() => {
      if (index < lesson.vocab.length - 1) {
        setIndex(i => i + 1); setFlipped(false); setVisible(true)
      } else { onDone() }
    }, 200)
  }

  function prev() {
    if (index === 0) return
    setVisible(false)
    setTimeout(() => { setIndex(i => i - 1); setFlipped(false); setVisible(true) }, 200)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="vocab" phaseStep={index + 1} phaseTotal={lesson.vocab.length}
        onBack={prev} color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col items-center justify-between px-5 py-6 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Card */}
        <button
          onClick={() => setFlipped(f => !f)}
          className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-5 rounded-3xl border transition-all duration-300 active:scale-[0.97]"
          style={{
            background: flipped ? `${lesson.color}10` : 'rgba(255,255,255,0.03)',
            border: `2px solid ${flipped ? lesson.color + '45' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: flipped ? `0 0 40px ${lesson.color}18` : 'none',
          }}
        >
          {/* Audio button row */}
          <div className="flex items-center gap-3 -mb-2">
            <AudioBtn text={word.word} size="lg" color={lesson.color} />
          </div>

          <span className="text-7xl">{word.emoji}</span>

          <div className="text-center px-6">
            <p className="text-white text-4xl font-black leading-tight mb-1">{word.word}</p>
            <p className="text-white/30 text-base font-medium">[{word.pronunciation}]</p>
          </div>

          {/* Arabic reveal */}
          <div
            className="flex flex-col items-center gap-2 overflow-hidden transition-all duration-400 px-6"
            style={{ maxHeight: flipped ? 120 : 0, opacity: flipped ? 1 : 0 }}
          >
            <div className="h-px w-16 bg-white/10" />
            <p className="text-3xl font-black" style={{ color: lesson.color }} dir="rtl">
              {word.translation_ar}
            </p>
            <p className="text-white/30 text-sm italic text-center">{word.example}</p>
          </div>

          {!flipped && (
            <p className="text-white/20 text-sm pb-2">اضغط لترى الترجمة</p>
          )}
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2 py-4">
          {lesson.vocab.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === index ? 20 : 8,
                height:     8,
                background: i === index ? lesson.color : i < index ? `${lesson.color}60` : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {index < lesson.vocab.length - 1 ? 'الكلمة التالية →' : 'ابدأ الجمل 🚀'}
        </button>
      </div>
    </div>
  )
}

// ─── Sentences Phase ──────────────────────────────────────────────────────────

function SentencesPhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [visible,  setVisible]  = useState(true)
  const s = lesson.sentences[index]

  function next() {
    setVisible(false)
    setTimeout(() => {
      if (index < lesson.sentences.length - 1) {
        setIndex(i => i + 1); setRevealed(false); setVisible(true)
      } else { onDone() }
    }, 200)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="sentences" phaseStep={index + 1} phaseTotal={lesson.sentences.length}
        onBack={() => { if (index > 0) { setIndex(i => i - 1); setRevealed(false) } }}
        color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col items-center justify-between px-5 py-6 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-4">
          <div
            className="w-full rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* English + audio */}
            <div className="flex items-start gap-3 mb-4">
              <AudioBtn text={s.english} size="md" color={lesson.color} />
              <p className="text-white text-xl font-bold leading-relaxed">{s.english}</p>
            </div>

            {/* Arabic reveal */}
            {revealed ? (
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-bold leading-relaxed" style={{ color: lesson.color }} dir="rtl">
                  {s.arabic}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: `${lesson.color}18`, border: `1px solid ${lesson.color}40`, color: lesson.color }}
              >
                🔍 اضغط لرؤية الترجمة
              </button>
            )}
          </div>
        </div>

        <button
          onClick={next}
          disabled={!revealed}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg disabled:opacity-30"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {index < lesson.sentences.length - 1 ? 'الجملة التالية →' : 'الجمل الطبيعية 🗣️'}
        </button>
      </div>
    </div>
  )
}

// ─── Natural Sentences Phase ──────────────────────────────────────────────────

function NaturalPhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [visible,  setVisible]  = useState(true)
  const s = lesson.natural[index]

  function next() {
    setVisible(false)
    setTimeout(() => {
      if (index < lesson.natural.length - 1) {
        setIndex(i => i + 1); setRevealed(false); setVisible(true)
      } else { onDone() }
    }, 200)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="natural" phaseStep={index + 1} phaseTotal={lesson.natural.length}
        onBack={() => { if (index > 0) { setIndex(i => i - 1); setRevealed(false) } }}
        color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col items-center justify-between px-5 py-6 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-4">
          {/* Label */}
          <div className="self-start px-3 py-1 rounded-full text-xs font-black" style={{ background: `${lesson.color}15`, color: lesson.color, border: `1px solid ${lesson.color}30` }}>
            🗣️ كيف يتكلم الناس الحقيقيون
          </div>

          <div
            className="w-full rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* English + audio */}
            <div className="flex items-start gap-3 mb-4">
              <AudioBtn text={s.english} size="md" color={lesson.color} />
              <p className="text-white text-xl font-bold leading-relaxed">{s.english}</p>
            </div>

            {/* Arabic reveal */}
            {revealed ? (
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-bold leading-relaxed" style={{ color: lesson.color }} dir="rtl">
                  {s.arabic}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: `${lesson.color}18`, border: `1px solid ${lesson.color}40`, color: lesson.color }}
              >
                🔍 اضغط لرؤية الترجمة
              </button>
            )}
          </div>
        </div>

        <button
          onClick={next}
          disabled={!revealed}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg disabled:opacity-30"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {index < lesson.natural.length - 1 ? 'الجملة التالية →' : 'ابدأ الحوار 💬'}
        </button>
      </div>
    </div>
  )
}

// ─── Dialogue Phase ───────────────────────────────────────────────────────────

function DialoguePhase({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [shown,    setShown]    = useState(0)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (shown < lesson.dialogue.length) {
      const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 500 : 800)
      return () => clearTimeout(t)
    }
  }, [shown, lesson.dialogue.length])

  const allShown = shown >= lesson.dialogue.length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProgressHeader
        phase="dialogue"
        phaseStep={Math.min(shown, lesson.dialogue.length)} phaseTotal={lesson.dialogue.length}
        onBack={() => {}} color={lesson.color}
      />

      <div className="flex-1 flex flex-col justify-between px-4 py-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
          {lesson.dialogue.map((line, i) => {
            const isA       = line.speaker === 'A'
            const isVisible = i < shown
            const isRev     = revealed.has(i)

            return (
              <div
                key={i}
                className="transition-all duration-500"
                style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(16px)' }}
              >
                <div className={`flex gap-3 items-start ${isA ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                    style={{
                      background: isA ? `${lesson.color}20` : 'rgba(99,102,241,0.2)',
                      color:      isA ? lesson.color         : '#818cf8',
                      border:     `1px solid ${isA ? lesson.color + '30' : 'rgba(99,102,241,0.3)'}`,
                    }}
                  >
                    {line.name[0]}
                  </div>

                  {/* Bubble */}
                  <button
                    onClick={() => {
                      setRevealed(r => new Set([...r, i]))
                      speak(line.english)
                    }}
                    className={`max-w-[72%] rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] ${isA ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
                    style={{
                      background: isA ? `${lesson.color}12` : 'rgba(99,102,241,0.12)',
                      border:     `1px solid ${isA ? lesson.color + '25' : 'rgba(99,102,241,0.25)'}`,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <p className="text-white text-sm font-medium leading-relaxed flex-1">{line.english}</p>
                      <span className="text-base shrink-0 opacity-40">{isRev ? '🔊' : '🔈'}</span>
                    </div>
                    {isRev && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: isA ? lesson.color + 'aa' : '#818cf8aa' }} dir="rtl">
                        {line.arabic}
                      </p>
                    )}
                    {!isRev && isVisible && (
                      <p className="text-white/15 text-xs mt-1">اضغط للاستماع...</p>
                    )}
                  </button>
                </div>

                {/* Name */}
                {isVisible && (
                  <p
                    className="text-white/20 text-xs mt-1"
                    style={{ marginLeft: isA ? 52 : 0, marginRight: isA ? 0 : 52, textAlign: isA ? 'left' : 'right' }}
                  >
                    {line.name}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onDone}
          disabled={!allShown}
          className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-[0.97] shadow-lg disabled:opacity-30"
          style={{ background: lesson.color, boxShadow: `0 8px 24px ${lesson.color}40` }}
        >
          {allShown ? 'ابدأ التمارين 🎯' : 'جاري تحميل الحوار...'}
        </button>
      </div>
    </div>
  )
}

// ─── Order Exercise ───────────────────────────────────────────────────────────

function OrderExercise({
  exercise, color, onAnswer,
}: {
  exercise: Exercise; color: string; onAnswer: (correct: boolean) => void
}) {
  const words   = exercise.words   ?? []
  const answer  = exercise.answer  ?? []
  const [placed,  setPlaced]  = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const placedWords = placed.map(i => words[i])
  const remaining   = words.map((w: string, i: number) => ({ w, i })).filter(({ i }: { i: number }) => !placed.includes(i))

  function place(idx: number)    { if (!checked) setPlaced(p => [...p, idx]) }
  function removeAt(pos: number) { if (!checked) setPlaced(p => p.filter((_, i) => i !== pos)) }

  function check() {
    const ok = placedWords.join(' ') === answer.join(' ')
    setCorrect(ok)
    setChecked(true)
    onAnswer(ok)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {checked && !correct && (
        <div className="px-4 py-3 rounded-2xl text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-white/40 text-xs mb-1" dir="rtl">الجملة الصحيحة</p>
          <p className="text-green-300 font-bold">{answer.join(' ')}</p>
        </div>
      )}

      <div
        className="min-h-16 rounded-2xl p-3 flex flex-wrap gap-2 items-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1.5px dashed ${checked ? (correct ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        {placedWords.length === 0 && (
          <p className="text-white/20 text-sm w-full text-center" dir="rtl">اضغط على الكلمات أدناه...</p>
        )}
        {placedWords.map((w, pos) => (
          <button
            key={pos}
            onClick={() => removeAt(pos)}
            disabled={checked}
            className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: checked ? (correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : `${color}15`,
              border:     checked ? (correct ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)') : `1px solid ${color}40`,
              color:      checked ? (correct ? '#6ee7b7' : '#fca5a5') : '#fff',
            }}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {remaining.map(({ w, i }: { w: string; i: number }) => (
          <button
            key={i}
            onClick={() => place(i)}
            disabled={checked}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {w}
          </button>
        ))}
      </div>

      {!checked && placedWords.length === words.length && (
        <button
          onClick={check}
          className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all active:scale-[0.97]"
          style={{ background: color, boxShadow: `0 6px 20px ${color}40` }}
        >
          تحقق ✓
        </button>
      )}
    </div>
  )
}

// ─── Exercises Phase ──────────────────────────────────────────────────────────

function XpFlash({ amount, color }: { amount: number; color: string }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 900); return () => clearTimeout(t) }, [])
  if (!visible) return null
  return (
    <div
      className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-50 font-black text-lg px-4 py-2 rounded-2xl animate-xp-pop"
      style={{ background: `${color}22`, border: `1.5px solid ${color}60`, color, whiteSpace: 'nowrap' }}
    >
      +{amount} XP ⚡
    </div>
  )
}

function ExercisesPhase({
  lesson, onDone, onAnswered,
}: {
  lesson: Lesson
  onDone: (score: number) => void
  onAnswered: (correct: boolean, questionIndex: number) => void
}) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [orderOk,  setOrderOk]  = useState<boolean | null>(null)
  const [score,    setScore]    = useState(0)
  const [visible,  setVisible]  = useState(true)
  const [showXp,   setShowXp]   = useState(false)

  const ex         = lesson.exercises[index]
  const isAnswered = ex.type === 'order' ? orderOk !== null : selected !== null
  const isCorrect  = ex.type === 'order' ? orderOk === true  : selected === ex.correct
  const totalEx    = lesson.exercises.length

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    const correct = i === ex.correct
    if (correct) {
      playCorrect()
      setScore(s => s + 1); setShowXp(true); setTimeout(() => setShowXp(false), 950)
    } else {
      playWrong()
    }
    onAnswered(correct, index)
    if (ex.type !== 'order') {
      const optText = ex.options[i]
      if (optText && /^[A-Za-z]/.test(optText)) speak(optText)
    }
  }

  function handleOrderAnswer(ok: boolean) {
    setOrderOk(ok)
    if (ok) {
      playCorrect()
      setScore(s => s + 1); setShowXp(true); setTimeout(() => setShowXp(false), 950)
    } else {
      playWrong()
    }
    onAnswered(ok, index)
  }

  function handleNext() {
    setVisible(false)
    setTimeout(() => {
      if (index < totalEx - 1) {
        setIndex(i => i + 1); setSelected(null); setOrderOk(null); setVisible(true)
      } else {
        onDone(score)
      }
    }, 220)
  }

  const typeLabel: Record<ExType, string> = {
    mc: 'اختيار متعدد', fill: 'أكمل الجملة', en_ar: 'ترجم للعربية', ar_en: 'ترجم للإنجليزية', order: 'رتب الجملة',
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showXp && <XpFlash amount={XP_CORRECT_ANSWER} color={lesson.color} />}
      <ProgressHeader
        phase="exercises" phaseStep={index + 1} phaseTotal={totalEx}
        onBack={() => {}} color={lesson.color}
      />

      <div
        className="flex-1 flex flex-col px-4 pt-4 pb-2 transition-opacity duration-200 overflow-hidden"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Badge + tip */}
        <div className="mb-4 flex flex-col gap-1.5">
          <span
            className="self-start text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${lesson.color}15`, color: lesson.color, border: `1px solid ${lesson.color}30` }}
          >
            {typeLabel[ex.type]}
          </span>
          <p className="text-white/50 text-sm font-medium" dir="rtl">{ex.tip_ar}</p>
        </div>

        {/* Prompt */}
        {ex.type !== 'order' && (
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              {/^[A-Za-z]/.test(ex.prompt.replace(/^[^\w]*/, '')) && ex.type !== 'ar_en' && (
                <AudioBtn text={ex.prompt.replace(/^[^\w]*/, '')} size="sm" color={lesson.color} />
              )}
              <p
                className="font-black leading-relaxed flex-1 text-center"
                dir={ex.type === 'ar_en' ? 'rtl' : 'ltr'}
                style={{ fontSize: ex.prompt.length > 30 ? 18 : 22, color: '#fff' }}
              >
                {ex.prompt}
              </p>
            </div>
          </div>
        )}

        {/* Order exercise */}
        {ex.type === 'order' && (
          <div className="mb-4">
            <div className="px-4 py-3 rounded-2xl mb-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/30 text-xs mb-1" dir="rtl">كوّن هذه الجملة</p>
              <p className="text-indigo-300 text-sm font-bold">{ex.prompt}</p>
            </div>
            <OrderExercise exercise={ex} color={lesson.color} onAnswer={handleOrderAnswer} />
          </div>
        )}

        {/* Options */}
        {ex.type !== 'order' && (
          <div className="flex flex-col gap-2.5 flex-1">
            {ex.options.map((opt, i) => {
              const isSelected = selected === i
              const isRight    = i === ex.correct

              let bg      = 'rgba(255,255,255,0.04)'
              let border  = '1px solid rgba(255,255,255,0.10)'
              let color   = 'rgba(255,255,255,0.85)'

              if (selected !== null) {
                if (isRight)                     { bg = 'rgba(16,185,129,0.15)';  border = '1.5px solid rgba(16,185,129,0.5)'; color = '#6ee7b7' }
                else if (isSelected && !isRight) { bg = 'rgba(239,68,68,0.12)';   border = '1.5px solid rgba(239,68,68,0.4)';  color = '#fca5a5' }
                else                             { bg = 'rgba(255,255,255,0.02)';  border = '1px solid rgba(255,255,255,0.04)'; color = 'rgba(255,255,255,0.2)' }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  dir={ex.type === 'en_ar' ? 'rtl' : 'ltr'}
                  className="w-full py-4 px-5 rounded-2xl text-left font-semibold text-base transition-all duration-150 active:scale-[0.97]"
                  style={{ background: bg, border, color }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Feedback */}
        {isAnswered && (
          <div
            className="mt-3 rounded-2xl px-5 py-4 flex items-center justify-between shrink-0"
            style={{
              background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
              border:     isCorrect ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div dir="rtl">
              <p className={`font-black text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✅ ممتاز!' : '❌ حاول مجدداً!'}
              </p>
              {!isCorrect && ex.type !== 'order' && (
                <p className="text-white/40 text-xs mt-0.5">
                  الصحيح: <span className="text-green-400 font-bold">{ex.options[ex.correct]}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all active:scale-95 shadow-md"
              style={{ background: lesson.color, boxShadow: `0 4px 16px ${lesson.color}40` }}
            >
              {index < totalEx - 1 ? 'التالي →' : '🏁 النتائج'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Complete Screen ──────────────────────────────────────────────────────────

function CompleteScreen({
  lesson, score, islandId, streak, onIslandComplete, onReplay, onBack,
}: {
  lesson: Lesson
  score: number
  islandId: string
  streak: number
  onIslandComplete: (islandId: string, pct: number) => Promise<{ xpEarned: number; newProfile: { streak: number } | null }>
  onReplay: () => void
  onBack: () => void
}) {
  const total   = lesson.exercises.length
  const pct     = Math.round((score / total) * 100)
  const synced  = useRef(false)

  // Derived XP = per-question XP already awarded + lesson bonus
  const bonusXp   = XP_LESSON_COMPLETE + (pct === 100 ? XP_PERFECT_BONUS : 0)
  const totalXpEarned = score * XP_CORRECT_ANSWER + bonusXp

  const [newStreak, setNewStreak] = useState(streak)
  const [savedXp,   setSavedXp]   = useState(totalXpEarned)

  useEffect(() => {
    if (synced.current) return
    synced.current = true
    playReward()
    // Supabase sync: mark complete, add bonus XP, touch streak
    onIslandComplete(islandId, pct).then(({ xpEarned, newProfile }) => {
      setSavedXp(score * XP_CORRECT_ANSWER + xpEarned)
      if (newProfile) setNewStreak(newProfile.streak)
    })
    // localStorage fallback (keeps existing behaviour when offline)
    markCompleted(lesson.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const medal = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚'
  const msg   = pct === 100
    ? 'نتيجة مثالية! أنت رائع! 🎉'
    : pct >= 80 ? 'ممتاز جداً! استمر هكذا!'
    : pct >= 60 ? 'جيد! التدريب يصنع الفارق'
    :             'لا بأس، كرر الدرس!'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center overflow-y-auto py-8">
      {/* Medal */}
      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl shrink-0"
        style={{ background:`${lesson.color}18`, border:`2px solid ${lesson.color}40`, boxShadow:`0 0 48px ${lesson.color}30` }}
      >
        {medal}
      </div>

      <div dir="rtl">
        <h2 className="text-white text-4xl font-black mb-1">{pct}%</h2>
        <p className="text-white/45 text-base">{msg}</p>
      </div>

      {/* Reward cards */}
      <div className="flex gap-3 w-full max-w-xs">
        <div className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border"
          style={{ background:'rgba(245,158,11,0.08)', borderColor:'rgba(245,158,11,0.2)' }}>
          <span className="text-2xl">⚡</span>
          <span className="text-yellow-400 font-black text-xl">+{savedXp}</span>
          <span className="text-yellow-400/40 text-xs">XP مكتسبة</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border"
          style={{ background:'rgba(251,146,60,0.08)', borderColor:'rgba(251,146,60,0.2)' }}>
          <span className="text-2xl">🔥</span>
          <span className="text-orange-400 font-black text-xl">{newStreak}</span>
          <span className="text-orange-400/40 text-xs" dir="rtl">يوم متتالي</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border"
          style={{ background:'rgba(16,185,129,0.08)', borderColor:'rgba(16,185,129,0.2)' }}>
          <span className="text-2xl">✅</span>
          <span className="text-green-400 font-black text-xl">{score}/{total}</span>
          <span className="text-green-400/40 text-xs" dir="rtl">إجابة صحيحة</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-xs">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width:`${pct}%`, background:`linear-gradient(90deg,${lesson.color},${lesson.color}cc)`, boxShadow:`0 0 8px ${lesson.color}50` }} />
        </div>
      </div>

      {/* Vocab replay */}
      <div className="w-full max-w-xs" dir="rtl">
        <p className="text-white/25 text-xs mb-2">الكلمات التي تعلمتها — اضغط لتسمعها 🔊</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {lesson.vocab.map((v, i) => (
            <button key={i} onClick={() => speak(v.word)}
              className="text-sm px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95"
              style={{ background:`${lesson.color}12`, border:`1px solid ${lesson.color}30`, color:lesson.color }}>
              {v.emoji} {v.word}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-bold text-sm text-white/50 transition-all active:scale-95"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
          ← الدروس
        </button>
        <button onClick={onReplay}
          className="flex-1 py-4 rounded-2xl font-black text-base text-white transition-all active:scale-95 shadow-lg"
          style={{ background:lesson.color, boxShadow:`0 8px 24px ${lesson.color}40` }}>
          مجدداً 🔄
        </button>
      </div>
    </div>
  )
}

// ─── Lesson Player ────────────────────────────────────────────────────────────

function LessonPlayer({
  lesson, islandId, streak, onBack, onAnswered, onIslandComplete,
}: {
  lesson: Lesson
  islandId: string
  streak: number
  onBack: () => void
  onAnswered: (correct: boolean, questionIndex: number) => void
  onIslandComplete: (islandId: string, pct: number) => Promise<{ xpEarned: number; newProfile: { streak: number } | null }>
}) {
  const [phase, setPhase] = useState<Phase>('vocab')
  const [score, setScore] = useState(0)

  function reset() { setPhase('vocab'); setScore(0) }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
    >
      {phase === 'vocab'     && <VocabPhase     lesson={lesson} onDone={() => setPhase('sentences')} />}
      {phase === 'sentences' && <SentencesPhase lesson={lesson} onDone={() => setPhase('natural')} />}
      {phase === 'natural'   && <NaturalPhase   lesson={lesson} onDone={() => setPhase('dialogue')} />}
      {phase === 'dialogue'  && <DialoguePhase  lesson={lesson} onDone={() => setPhase('exercises')} />}
      {phase === 'exercises' && (
        <ExercisesPhase
          lesson={lesson}
          onAnswered={onAnswered}
          onDone={s => { setScore(s); setPhase('complete') }}
        />
      )}
      {phase === 'complete' && (
        <CompleteScreen
          lesson={lesson}
          score={score}
          islandId={islandId}
          streak={streak}
          onIslandComplete={onIslandComplete}
          onReplay={reset}
          onBack={onBack}
        />
      )}
    </div>
  )
}

// ─── Lesson List ──────────────────────────────────────────────────────────────

function LessonList({
  onSelect, totalXp, completedIds, lessons,
}: {
  onSelect: (l: Lesson) => void
  totalXp: number
  completedIds: string[]
  lessons: Lesson[]
}) {
  const completed = completedIds

  const byLevel = ['A0', 'A1', 'A2', 'B1'].map(lvl => ({
    lvl,
    lessons: lessons.filter((l: Lesson) => l.level === lvl),
  })).filter(g => g.lessons.length > 0)

  return (
    <div
      className="min-h-screen px-4 pt-20 pb-12"
      style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
    >
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-5xl mb-3">🗣️</p>
          <h1 className="text-white text-3xl font-black mb-2" dir="rtl">تعلم المحادثة</h1>
          <p className="text-white/30 text-sm" dir="rtl">
            مفردات · جمل · حوار · تمارين — مع صوت لكل كلمة 🔊
          </p>
          {totalXp > 0 && (
            <div
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <span className="text-yellow-400 font-black">⚡ {totalXp} XP</span>
            </div>
          )}
        </div>

        {/* Lessons grouped by level */}
        <div className="flex flex-col gap-8">
          {byLevel.map(({ lvl, lessons }) => (
            <div key={lvl}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/8" />
                <span
                  className="text-xs font-black px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                >
                  مستوى {lvl}
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <div className="flex flex-col gap-3">
                {lessons.map((lesson: Lesson) => {
                  const isDone = completed.includes(lesson.id)
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelect(lesson)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{
                        background: isDone ? `${lesson.color}08` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isDone ? lesson.color + '30' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isDone ? `0 0 18px ${lesson.color}15` : 'none',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                        style={{
                          background: `${lesson.color}15`,
                          border: `1px solid ${lesson.color}30`,
                          boxShadow: isDone ? `0 0 16px ${lesson.color}25` : 'none',
                        }}
                      >
                        {lesson.emoji}
                      </div>

                      <div className="flex-1" dir="rtl">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-black text-base">{lesson.title_ar}</p>
                          {isDone && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-white/30 text-xs">
                          {lesson.title} · {lesson.vocab.length} كلمات · {lesson.exercises.length} تمرين
                        </p>

                        {/* Vocab preview with audio hint */}
                        <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                          {lesson.vocab.slice(0, 3).map((v, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-lg font-medium flex items-center gap-1"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}
                            >
                              {v.word}
                            </span>
                          ))}
                          {lesson.vocab.length > 3 && (
                            <span className="text-xs text-white/20">+{lesson.vocab.length - 3}</span>
                          )}
                          <span className="text-xs text-white/15 mr-1">🔊</span>
                        </div>
                      </div>

                      <span className="text-white/20 text-lg shrink-0">←</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Phase guide */}
        <div
          className="mt-8 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/30 text-xs font-black mb-3 text-center" dir="rtl">كيف يعمل كل درس</p>
          <div className="flex justify-around">
            {[
              { icon: '📚', label: 'مفردات' },
              { icon: '✏️', label: 'جمل' },
              { icon: '💬', label: 'حوار' },
              { icon: '🎯', label: 'تمارين' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-white/25 text-xs" dir="rtl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inner component (needs Suspense for useSearchParams) ────────────────────

function LearnInner() {
  const searchParams = useSearchParams()
  const [active,    setActive]    = useState<Lesson | null>(null)
  const [islandId,  setIslandId]  = useState<string>('standalone')
  const [lessons,   setLessons]   = useState<Lesson[]>([])
  const [loading,   setLoading]   = useState(true)

  const game = useGameState()

  // Derive completed lesson IDs from Supabase progress (+ localStorage fallback)
  const completedIds: string[] = (() => {
    const fromSupabase = game.progress
      .filter(p => p.completed)
      .map(p => p.island_id)             // island_id matches lesson.id in standalone flow
    const fromLocal = loadCompleted()
    return Array.from(new Set([...fromSupabase, ...fromLocal]))
  })()

  const totalXp = game.profile?.xp ?? loadXp()
  const streak  = game.profile?.streak ?? 0

  useEffect(() => {
    fetchPublishedLessons().then(rows => {
      setLessons(rows as Lesson[])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading) return
    const lessonId = searchParams.get('id')
    setIslandId(lessonId ?? 'standalone')
    if (lessonId) {
      const lesson = lessons.find(l => l.id === lessonId)
      if (lesson) setActive(lesson)
    }
  }, [searchParams, loading, lessons])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
      >
        <p className="text-white/30 text-sm" dir="rtl">جاري تحميل الدروس...</p>
      </div>
    )
  }

  if (active) {
    return (
      <LessonPlayer
        lesson={active}
        islandId={islandId}
        streak={streak}
        onBack={() => setActive(null)}
        onAnswered={(correct, qIndex) => {
          if (correct) game.onCorrectAnswer(active.id, qIndex)
          else         game.onWrongAnswer(active.id, qIndex)
        }}
        onIslandComplete={game.onIslandComplete}
      />
    )
  }

  return (
    <LessonList
      onSelect={lesson => { setActive(lesson); setIslandId(lesson.id) }}
      totalXp={totalXp}
      completedIds={completedIds}
      lessons={lessons}
    />
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#060d1a 0%,#0a1120 60%,#060d1a 100%)' }}
      >
        <p className="text-white/30 text-sm" dir="rtl">جاري التحميل...</p>
      </div>
    }>
      <LearnInner />
    </Suspense>
  )
}
