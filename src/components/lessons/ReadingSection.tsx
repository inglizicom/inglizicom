'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, CheckCircle2 } from 'lucide-react'
import type { ReadingWord, BlankSentence, Unit } from '@/data/private-lessons/types'

type ReadingSectionType = {
  kind: 'reading'
  title: string
  titleAr?: string
  text: string
  textAr?: string
  translations: Record<string, string>
  vocab: ReadingWord[]
  blanks: BlankSentence[]
}

const ARABIC_ORDINALS: Record<number, string> = {
  1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس', 6: 'السادس',
  7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر', 11: 'الحادي عشر', 12: 'الثاني عشر',
}

const PHASE_LABEL: Record<string, string> = {
  A0: 'مرحلة التأسيس',
  A1: 'المرحلة الأولى',
  A2: 'المرحلة الثانية',
  B1: 'المرحلة المتوسطة',
}

function readingNumber(unit: Unit): string {
  // Reading lessons start at id 201 (read01) → ordinal 1
  const ordinal = unit.id >= 200 ? unit.id - 200 : unit.id
  return ARABIC_ORDINALS[ordinal] ?? String(ordinal)
}

function phaseLabel(level: string): string {
  const key = (level || 'A0').split(/\s+/)[0].toUpperCase()
  return PHASE_LABEL[key] ?? key
}

/**
 * Pick reading font size + leading based on English word count, so short
 * passages render large and long passages still fit the page without scrolling.
 * Generous leading and paragraph gaps for comfortable reading.
 */
function sizeForWordCount(enWords: number) {
  if (enWords < 60) {
    return {
      en:    'text-4xl sm:text-5xl lg:text-[3rem] xl:text-[3.4rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-lg sm:text-xl lg:text-2xl',
      arLh:  'leading-[1.95]',
      gap:   'space-y-4 sm:space-y-5',
    }
  }
  if (enWords < 90) {
    return {
      en:    'text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[2.95rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-base sm:text-lg lg:text-xl',
      arLh:  'leading-[1.9]',
      gap:   'space-y-3.5 sm:space-y-4',
    }
  }
  if (enWords < 130) {
    // read01 (≈114 EN words) → this tier
    return {
      en:    'text-3xl sm:text-4xl lg:text-[2.3rem] xl:text-[2.6rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-base sm:text-lg lg:text-xl',
      arLh:  'leading-[1.9]',
      gap:   'space-y-3 sm:space-y-3.5',
    }
  }
  if (enWords < 180) {
    return {
      en:    'text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.3rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-base sm:text-lg',
      arLh:  'leading-[1.85]',
      gap:   'space-y-2.5 sm:space-y-3',
    }
  }
  if (enWords < 240) {
    return {
      en:    'text-xl sm:text-2xl lg:text-[1.75rem] xl:text-[2rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-sm sm:text-base lg:text-lg',
      arLh:  'leading-[1.85]',
      gap:   'space-y-2 sm:space-y-2.5',
    }
  }
  if (enWords < 320) {
    return {
      en:    'text-lg sm:text-xl lg:text-[1.5rem] xl:text-[1.75rem]',
      enLh:  'leading-[1.55]',
      ar:    'text-sm sm:text-base',
      arLh:  'leading-[1.8]',
      gap:   'space-y-1.5 sm:space-y-2',
    }
  }
  // Very long passages — keep readable, fit the page
  return {
    en:    'text-base sm:text-lg lg:text-[1.3rem] xl:text-[1.5rem]',
    enLh:  'leading-[1.5]',
    ar:    'text-xs sm:text-sm lg:text-base',
    arLh:  'leading-[1.75]',
    gap:   'space-y-1.5',
  }
}

export default function ReadingSection({
  section, step, unit,
}: {
  section: ReadingSectionType
  step: number
  unit: Unit
}) {
  if (step === 0) return <ReadingText section={section} unit={unit} />
  if (step === 1) return <VocabPage vocab={section.vocab} unit={unit} title={section.title} />
  return <BlanksPage blanks={section.blanks} unit={unit} title={section.title} />
}

/* ─── Teacher / branding footer ──────────────────────────────────────────── */

function TeacherFooter() {
  return (
    <div className="flex-shrink-0 px-2 sm:px-3 pt-1 sm:pt-1.5 pb-1 sm:pb-1.5">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-1.5 sm:py-2 bg-white border border-black/10 rounded">
        {/* Teacher */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="font-sans font-bold text-xs sm:text-sm text-black truncate" dir="rtl">
            الأستاذ حمزة القصراوي
          </span>
        </div>
        {/* Right: contacts */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <span className="font-ui font-bold text-black tracking-tight" dir="ltr">
            inglizi.com
          </span>
          <span className="hidden sm:inline text-black/30">·</span>
          <span className="font-ui font-bold text-black tabular-nums" dir="ltr">
            WhatsApp 0707902091
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Header (3-column: black + amber + black) ──────────────────────────── */

function HeaderBar({ unit, titleEn, titleAr }: { unit: Unit; titleEn: string; titleAr: string }) {
  return (
    <header className="flex-shrink-0 grid grid-cols-[auto_1fr_auto] gap-1 sm:gap-1.5 px-1 sm:px-1.5 pt-1 sm:pt-1.5">
      {/* Left: phase / level */}
      <div className="bg-black text-white rounded-md px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-center">
        <span className="font-sans font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
          {phaseLabel(unit.level)}
        </span>
      </div>

      {/* Center: amber title band */}
      <div className="bg-amber-400 rounded-md px-3 sm:px-5 py-1.5 sm:py-2 flex flex-col items-center justify-center leading-tight">
        <h1 className="font-ui font-extrabold text-lg sm:text-xl lg:text-2xl text-black tracking-tight leading-none" dir="ltr">
          {titleEn}
        </h1>
        <p className="font-sans font-bold text-sm sm:text-base lg:text-lg text-black leading-tight mt-0.5">
          {titleAr}
        </p>
      </div>

      {/* Right: lesson number */}
      <div className="bg-black text-white rounded-md px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-center">
        <span className="font-sans font-bold text-sm sm:text-base lg:text-lg whitespace-nowrap">
          الدرس {readingNumber(unit)}
        </span>
      </div>
    </header>
  )
}

/* ─── Page 1: Reading text ───────────────────────────────────────────────── */

function ReadingText({ section, unit }: { section: ReadingSectionType; unit: Unit }) {
  const ref = useRef<HTMLDivElement>(null)

  // Build a set of key word forms (lowercase) from the vocab array.
  // Multi-word vocab phrases are split into individual words too.
  const keyWords = useMemo(() => {
    const set = new Set<string>()
    for (const v of section.vocab) {
      const lc = v.word.toLowerCase()
      set.add(lc)
      lc.split(/\s+/).forEach((w) => {
        const clean = w.replace(/[^a-z']/g, '')
        if (clean) set.add(clean)
      })
    }
    return set
  }, [section.vocab])

  // Build a set of Arabic key word forms from vocab translations to highlight in
  // the bottom black panel.
  const keyArSet = useMemo(() => {
    const set = new Set<string>()
    for (const v of section.vocab) {
      const ar = (v.ar || '').trim()
      if (ar) {
        // store the first word of the Arabic translation as the highlight key
        ar.split(/\s+/).forEach((w) => {
          const clean = w.replace(/[،؛؟.,!?]/g, '')
          if (clean) set.add(clean)
        })
      }
    }
    return set
  }, [section.vocab])

  const paragraphs = useMemo(
    () => section.text.split('\n\n').map((p) => p.trim()).filter(Boolean),
    [section.text],
  )

  const arParagraphs = useMemo(
    () => (section.textAr ? section.textAr.split('\n\n').map((p) => p.trim()).filter(Boolean) : []),
    [section.textAr],
  )

  // English word count drives the size tier — this is the body text that
  // dominates the layout. The Arabic translation panel auto-sizes to fit.
  const enWordCount = useMemo(
    () => section.text.split(/\s+/).filter(Boolean).length,
    [section.text],
  )

  const sz = useMemo(() => sizeForWordCount(enWordCount), [enWordCount])

  return (
    <div ref={ref} className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fbfaf5]">

      <HeaderBar unit={unit} titleEn={section.title} titleAr={section.titleAr || unit.title.ar} />

      {/* English reading body — top aligned, no wasted space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 py-2 sm:py-3">
          <div className={sz.gap}>
            {paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={`font-ui ${sz.en} ${sz.enLh} font-medium text-black tracking-[-0.012em]`}
              >
                {tokenize(para).map((tok, j) => {
                  if (tok.type !== 'word') return <span key={j}>{tok.value}</span>
                  const lc = tok.value.toLowerCase().replace(/[^a-z']/g, '')
                  const isKey = keyWords.has(lc)
                  return isKey ? (
                    <strong key={j} className="font-extrabold text-black">{tok.value}</strong>
                  ) : (
                    <span key={j}>{tok.value}</span>
                  )
                })}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Arabic translation panel (black) — auto-sizes to content */}
      {arParagraphs.length > 0 && (
        <div className="flex-shrink-0 bg-black text-white px-5 sm:px-8 lg:px-12 xl:px-16 py-2.5 sm:py-3 mx-1 sm:mx-1.5 rounded-md">
          <div className="w-full">
            <p
              className={`font-sans ${sz.ar} ${sz.arLh} text-white`}
              dir="rtl"
            >
              {arParagraphs.map((para, i) => (
                <span key={i}>
                  {tokenizeAr(para).map((tok, j) => {
                    if (tok.type !== 'word') return <span key={j}>{tok.value}</span>
                    const clean = tok.value.replace(/[،؛؟.,!?]/g, '')
                    const isKey = keyArSet.has(clean)
                    return isKey ? (
                      <span key={j} className="text-amber-400 font-bold">{tok.value}</span>
                    ) : (
                      <span key={j}>{tok.value}</span>
                    )
                  })}
                  {i < arParagraphs.length - 1 && ' '}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      <TeacherFooter />
    </div>
  )
}

/* ─── Page 2: Vocabulary ─────────────────────────────────────────────────── */

function VocabPage({ vocab, unit, title }: { vocab: ReadingWord[]; unit: Unit; title: string }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fbfaf5]">

      <HeaderBar unit={unit} titleEn={title} titleAr={unit.title.ar} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-6 sm:py-8">
          <div className="text-center mb-5 sm:mb-6">
            <p className="font-ui text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-amber-600 mb-1.5">
              Key Vocabulary
            </p>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
              الكلمات المهمة
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
            {vocab.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className="bg-white rounded-lg border-2 border-black px-4 py-3 flex flex-col gap-1"
              >
                <span className="font-ui font-extrabold text-base sm:text-lg lg:text-xl text-black leading-tight">
                  {item.word}
                </span>
                <span className="font-sans font-bold text-base sm:text-lg text-amber-600 leading-tight" dir="rtl">
                  {item.ar}
                </span>
                {item.note && (
                  <span className="font-ui text-[11px] text-slate-500 italic">{item.note}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <TeacherFooter />
    </div>
  )
}

/* ─── Page 3: Blanks ─────────────────────────────────────────────────────── */

function BlanksPage({ blanks, unit, title }: { blanks: BlankSentence[]; unit: Unit; title: string }) {
  const [answers, setAnswers] = useState<(string | null)[]>(() => new Array(blanks.length).fill(null))
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
      const n = [...answers]; n[current] = null; setAnswers(n); return
    }
    const n = [...answers]; n[current] = opt; setAnswers(n)
    const ne = n.findIndex((a, idx) => idx > current && a === null)
    const ae = n.findIndex((a) => a === null)
    if (ne !== -1) setCurrent(ne)
    else if (ae !== -1) setCurrent(ae)
    else setCurrent(blanks.length)
  }

  function clearBlank(i: number) {
    if (checked) return
    const n = [...answers]; n[i] = null; setAnswers(n); setCurrent(i)
  }

  function reset() {
    setAnswers(new Array(blanks.length).fill(null)); setCurrent(0); setChecked(false)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#fbfaf5]">

      <HeaderBar unit={unit} titleEn={title} titleAr={unit.title.ar} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-5 sm:py-7">
          <div className="text-center mb-4 sm:mb-5">
            <p className="font-ui text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-amber-600 mb-1.5">
              Exercise · Fill in the Blanks
            </p>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
              أكمل الفراغات
            </h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {blanks.map((blank, i) => {
              const ans     = answers[i]
              const correct = checked && ans === blank.answer
              const wrong   = checked && ans !== blank.answer
              const active  = i === current && !checked
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !checked && setCurrent(i)}
                  className={[
                    'rounded-lg border-2 px-5 py-3 sm:py-3.5 transition-all duration-150 cursor-pointer select-none',
                    active  ? 'border-amber-500 bg-amber-50'  : '',
                    correct ? 'border-emerald-500 bg-emerald-50' : '',
                    wrong   ? 'border-rose-500 bg-rose-50'      : '',
                    !active && !correct && !wrong ? 'border-black bg-white' : '',
                  ].join(' ')}
                >
                  <p className="font-ui text-xl sm:text-2xl lg:text-[1.6rem] font-medium text-black leading-snug">
                    {blank.before}
                    <button
                      onClick={(e) => { e.stopPropagation(); clearBlank(i) }}
                      className={[
                        'inline-block mx-2 px-3 sm:px-4 py-0.5 rounded border-2 font-ui font-extrabold text-base sm:text-lg min-w-[90px] sm:min-w-[110px] text-center align-baseline transition-all',
                        ans
                          ? correct ? 'border-emerald-600 bg-emerald-500 text-white'
                          : wrong   ? 'border-rose-600 bg-rose-500 text-white'
                          :           'border-amber-600 bg-amber-400 text-black'
                          : 'border-dashed border-slate-400 text-transparent bg-transparent',
                      ].join(' ')}
                    >
                      {ans ?? '      '}
                    </button>
                    {blank.after}
                  </p>
                  {wrong && (
                    <p className="font-ui text-sm text-emerald-700 mt-1.5 font-bold">
                      ✓ {blank.answer}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-4 mx-1.5 sm:mx-2 mb-1.5 sm:mb-2 rounded-md sm:rounded-lg space-y-3">
        {!checked && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allOptions.map((opt) => {
              const used = answers[current] === opt
              return (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  className={[
                    'px-4 sm:px-5 py-2 sm:py-2.5 rounded border-2 font-ui font-extrabold text-base sm:text-lg transition-all',
                    used
                      ? 'border-amber-400 bg-amber-400 text-black'
                      : 'border-white bg-transparent text-white hover:bg-white hover:text-black',
                  ].join(' ')}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded border-2 border-white bg-transparent text-white font-ui font-bold text-sm hover:bg-white hover:text-black transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة
          </button>
          {allFilled && !checked && (
            <button
              onClick={() => setChecked(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-400 text-black rounded font-ui font-extrabold text-base hover:bg-amber-300 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              تحقق من الإجابات
            </button>
          )}
          {checked && (
            <div className={[
              'flex-1 text-center py-2.5 rounded font-ui font-extrabold text-base sm:text-lg border-2',
              score === blanks.length ? 'bg-emerald-500 border-emerald-400 text-white'
              : score >= blanks.length / 2 ? 'bg-amber-400 border-amber-300 text-black'
              : 'bg-rose-500 border-rose-400 text-white',
            ].join(' ')}>
              {score}/{blanks.length} صحيح{score === blanks.length ? ' 🎉' : ''}
            </div>
          )}
        </div>
      </div>

      <TeacherFooter />
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function tokenize(text: string): { type: 'word' | 'other'; value: string }[] {
  return text
    .split(/([a-zA-Z]+(?:'[a-z]+)?)/)
    .filter((v) => v !== '')
    .map((v) => ({ type: /^[a-zA-Z]/.test(v) ? 'word' : 'other', value: v }))
}

// Tokenize Arabic text by splitting on whitespace and Arabic punctuation,
// preserving the separators so we can render them back unchanged.
function tokenizeAr(text: string): { type: 'word' | 'other'; value: string }[] {
  return text
    .split(/(\s+|[،؛؟.,!?])/)
    .filter((v) => v !== '' && v !== undefined)
    .map((v) => ({ type: /\S/.test(v) && !/^[،؛؟.,!?\s]+$/.test(v) ? 'word' : 'other', value: v }))
}

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
