'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, CheckCircle2 } from 'lucide-react'
import type { ReadingWord, BlankSentence } from '@/data/private-lessons/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReadingSectionType = {
  kind: 'reading'
  title: string
  text: string
  translations: Record<string, string>
  vocab: ReadingWord[]
  blanks: BlankSentence[]
}

// ─── Entry point — three pages driven by outer `step` ─────────────────────────

export default function ReadingSection({
  section,
  step,
}: {
  section: ReadingSectionType
  step: number
}) {
  // step 0 = reading text (interactive), step 1 = vocab cards, step 2 = fill blanks
  if (step === 0) return <ReadingText section={section} />
  if (step === 1) return <VocabPage vocab={section.vocab} />
  return <BlanksPage blanks={section.blanks} />
}

// ─── Page 1: Interactive reading text ─────────────────────────────────────────

type Tip = { word: string; ar: string }

function ReadingText({ section }: { section: ReadingSectionType }) {
  const active = true
  const [tip, setTip] = useState<Tip | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Dismiss tooltip when clicking outside a word
  useEffect(() => {
    const dismiss = (e: MouseEvent | TouchEvent) => {
      if (!(e.target as Element).closest('[data-rw]')) setTip(null)
    }
    document.addEventListener('mousedown', dismiss)
    document.addEventListener('touchstart', dismiss)
    return () => {
      document.removeEventListener('mousedown', dismiss)
      document.removeEventListener('touchstart', dismiss)
    }
  }, [])

  const lookup = useCallback(
    (raw: string): string | null => {
      const clean = raw.toLowerCase().replace(/[^a-z']/g, '')
      return section.translations[clean] ?? section.translations[raw.toLowerCase()] ?? null
    },
    [section.translations],
  )

  const tokens = useMemo(() => tokenize(section.text), [section.text])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col px-4 md:px-10 max-w-3xl mx-auto w-full"
    >
      {/* Header */}
      <div className="text-center mb-5 flex-shrink-0">
        <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-[0.3em] uppercase mb-2">
          Reading — A0
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-black text-slate-900">
          {section.title}
        </h2>
        <p className="text-xs text-slate-400 mt-1" dir="rtl">
          اضغط على أي كلمة لترجمتها — ثم اضغط <kbd className="font-mono bg-slate-100 px-1.5 rounded border border-slate-200 text-slate-500">Space</kbd> للمفردات
        </p>
      </div>

      {/* Text */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm px-6 md:px-10 py-7 md:py-10">
        <p className="text-xl md:text-2xl leading-[2.2] text-slate-800 font-medium select-none">
          {tokens.map((tok, i) =>
            tok.type === 'word' ? (
              <Word
                key={i}
                value={tok.value}
                active={active}
                hasTranslation={!!lookup(tok.value)}
                onClick={() => {
                  const ar = lookup(tok.value)
                  setTip(ar ? { word: tok.value, ar } : null)
                }}
              />
            ) : (
              <span key={i}>{tok.value}</span>
            ),
          )}
        </p>
      </div>

      {/* Translation tooltip — fixed bottom bar */}
      <AnimatePresence>
        {tip && (
          <motion.div
            key={tip.word}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 left-4 right-4 md:left-1/4 md:right-1/4 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-between gap-4 px-6 py-4"
          >
            <span className="font-display font-black text-lg text-amber-400 shrink-0">
              {tip.word}
            </span>
            <span className="text-2xl font-bold text-right leading-tight" dir="rtl">
              {tip.ar}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

function Word({
  value,
  active,
  hasTranslation,
  onClick,
}: {
  value: string
  active: boolean
  hasTranslation: boolean
  onClick: () => void
}) {
  return (
    <span
      data-rw="1"
      onClick={active ? onClick : undefined}
      className={[
        'rounded px-0.5 -mx-0.5 transition-colors duration-150',
        hasTranslation
          ? 'cursor-pointer hover:bg-amber-100 hover:text-amber-900 active:bg-amber-200'
          : 'cursor-default',
      ].join(' ')}
    >
      {value}
    </span>
  )
}

// ─── Page 2: Vocabulary cards ──────────────────────────────────────────────────

function VocabPage({ vocab }: { vocab: ReadingWord[] }) {
  return (
    <div className="flex-1 flex flex-col px-4 md:px-10 max-w-3xl mx-auto w-full">
      <div className="text-center mb-5 flex-shrink-0">
        <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-[0.3em] uppercase mb-2">
          Key Vocabulary
        </span>
        <h2 className="font-display text-2xl font-black text-slate-900">
          الكلمات المهمة
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
          {vocab.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-display font-black text-lg text-slate-900">{item.word}</div>
                {item.note && (
                  <div className="text-xs text-slate-400 mt-0.5">{item.note}</div>
                )}
              </div>
              <div className="text-xl font-bold text-amber-600 shrink-0" dir="rtl">
                {item.ar}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page 3: Fill-in-the-blanks ───────────────────────────────────────────────

function BlanksPage({ blanks }: { blanks: BlankSentence[] }) {
  const [answers, setAnswers] = useState<(string | null)[]>(() =>
    new Array(blanks.length).fill(null),
  )
  const [current, setCurrent] = useState(0)
  const [checked, setChecked] = useState(false)

  const allOptions = useMemo(() => {
    const set = new Set<string>()
    blanks.forEach((b) => b.options.forEach((o) => set.add(o)))
    return seededShuffle([...set])
  }, [blanks])

  const allFilled = answers.every((a) => a !== null)
  const score = answers.filter((a, i) => a === blanks[i].answer).length

  function pick(opt: string) {
    if (checked) return
    if (answers[current] === opt) {
      // deselect
      const next = [...answers]
      next[current] = null
      setAnswers(next)
      return
    }
    const next = [...answers]
    next[current] = opt
    setAnswers(next)
    // auto-advance to next empty blank
    const nextEmpty = next.findIndex((a, i) => i > current && a === null)
    const anyEmpty = next.findIndex((a) => a === null)
    if (nextEmpty !== -1) setCurrent(nextEmpty)
    else if (anyEmpty !== -1) setCurrent(anyEmpty)
    else setCurrent(blanks.length) // all filled
  }

  function clearBlank(i: number) {
    if (checked) return
    const next = [...answers]
    next[i] = null
    setAnswers(next)
    setCurrent(i)
  }

  function reset() {
    setAnswers(new Array(blanks.length).fill(null))
    setCurrent(0)
    setChecked(false)
  }

  return (
    <div className="flex-1 flex flex-col px-4 md:px-10 max-w-3xl mx-auto w-full gap-3">
      {/* Header */}
      <div className="text-center flex-shrink-0">
        <span className="inline-block px-4 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold tracking-[0.3em] uppercase mb-1">
          Fill in the Blanks
        </span>
        <p className="text-xs text-slate-400" dir="rtl">
          اختر الكلمة الصحيحة لكل جملة
        </p>
      </div>

      {/* Sentences */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5">
        {blanks.map((blank, i) => {
          const ans     = answers[i]
          const correct = checked && ans === blank.answer
          const wrong   = checked && ans !== blank.answer
          const active  = i === current && !checked

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={[
                'bg-white rounded-xl border-2 px-5 py-3 transition-colors',
                active  ? 'border-amber-400 shadow-md'   : '',
                correct ? 'border-emerald-400 bg-emerald-50' : '',
                wrong   ? 'border-rose-400   bg-rose-50'     : '',
                !active && !correct && !wrong ? 'border-slate-200' : '',
              ].join(' ')}
            >
              <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                {blank.before}
                <button
                  onClick={() => !checked && clearBlank(i)}
                  className={[
                    'inline-block mx-1.5 px-3 py-0.5 rounded-lg border-2 font-bold text-base min-w-[72px] text-center transition-colors',
                    ans
                      ? correct
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                        : wrong
                        ? 'border-rose-500 text-rose-700 bg-rose-50'
                        : 'border-amber-500 text-amber-800 bg-amber-50'
                      : 'border-dashed border-slate-300 text-slate-300',
                  ].join(' ')}
                >
                  {ans ?? '  ___  '}
                </button>
                {blank.after}
              </p>
              {wrong && (
                <p className="text-sm text-emerald-700 mt-1 font-semibold">
                  ✓ {blank.answer}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Word bank */}
      {!checked && (
        <div className="flex-shrink-0 flex flex-wrap gap-2 justify-center">
          {allOptions.map((opt) => {
            const used = answers[current] === opt
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className={[
                  'px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all',
                  used
                    ? 'border-amber-500 bg-amber-500 text-white scale-95'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50',
                ].join(' ')}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-3 pb-1">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm hover:bg-slate-100 transition"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة
        </button>

        {allFilled && !checked && (
          <button
            onClick={() => setChecked(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            <CheckCircle2 className="w-5 h-5" />
            تحقق من الإجابات
          </button>
        )}

        {checked && (
          <div
            className={[
              'flex-1 text-center py-2.5 rounded-xl font-bold text-lg',
              score === blanks.length
                ? 'bg-emerald-100 text-emerald-800'
                : score >= blanks.length / 2
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800',
            ].join(' ')}
          >
            {score}/{blanks.length} صحيح
            {score === blanks.length ? ' 🎉' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tokenize(text: string): { type: 'word' | 'other'; value: string }[] {
  return text
    .split(/([a-zA-Z]+(?:'[a-z]+)?)/)
    .filter((v) => v !== '')
    .map((v) => ({ type: /^[a-zA-Z]/.test(v) ? 'word' : 'other', value: v }))
}

// Deterministic shuffle so the word bank order doesn't jump on re-render
function seededShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
