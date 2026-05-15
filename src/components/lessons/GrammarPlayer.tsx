'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Maximize2, Minimize2, Check, X } from 'lucide-react'
import type {
  GrammarLesson,
  GrammarSection,
  GToken,
  NoteItem,
  DialogueLine,
} from '@/data/private-lessons/grammar/types'

/* ─────────────────────────────────────────────────────────────────────────── */
/* Token color system                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

const ROLE_STYLE: Record<string, string> = {
  subject:    'bg-blue-500/25 text-blue-200 border border-blue-400/50',
  verb:       'bg-amber-500/25 text-amber-200 border border-amber-400/50',
  complement: 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50',
  negation:   'bg-red-500/25 text-red-200 border border-red-400/50',
  question:   'bg-purple-500/25 text-purple-200 border border-purple-400/50',
  filler:     '',
}

function Token({ t, big }: { t: GToken; big?: boolean }) {
  const sz = big
    ? 'text-2xl md:text-3xl lg:text-4xl px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3'
    : 'text-base md:text-lg px-3 py-1'
  if (t.role === 'filler') {
    return (
      <span className={`${big ? 'text-2xl md:text-3xl lg:text-4xl px-1' : 'text-base md:text-lg px-0.5'} text-slate-300 font-bold font-display`}>
        {t.text}
      </span>
    )
  }
  return (
    <span className={`rounded-full font-bold font-display inline-block leading-none ${ROLE_STYLE[t.role]} ${sz}`}>
      {t.text}
    </span>
  )
}

function Sentence({ tokens, big }: { tokens: GToken[]; big?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3" dir="ltr">
      {tokens.map((t, i) => <Token key={i} t={t} big={big} />)}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Steps per section                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

function stepsFor(s: GrammarSection): number {
  switch (s.kind) {
    case 'patternTable': return s.rows.length
    case 'sentences':    return s.items.length
    case 'negation':     return s.items.length
    case 'questions':    return s.items.length
    case 'practice':     return s.exercises.length
    case 'quiz':         return s.questions.length
    case 'notes':        return 1
    case 'dialogue':     return 1
    default:             return 1
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Section renderers — desktop-first                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function CoverSlide({ s, descAr }: { s: Extract<GrammarSection, { kind: 'cover' }>; descAr: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 md:gap-8 py-4">
      <div className="text-8xl md:text-[9rem] lg:text-[11rem] leading-none select-none">{s.emoji}</div>
      <div className="space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-4 md:px-6 py-2 text-xs md:text-sm font-bold tracking-widest uppercase font-display" dir="ltr">
          {s.level} · {s.tagAr}
        </div>
        <h1 className="text-6xl md:text-7xl lg:text-9xl font-black text-white tracking-tight font-display leading-none" dir="ltr">
          {s.title}
        </h1>
        <p className="text-2xl md:text-3xl lg:text-4xl text-slate-300 font-bold">{s.titleAr}</p>
      </div>
      <p className="text-lg md:text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-sm md:max-w-lg">{descAr}</p>
      <p className="text-slate-600 text-sm md:text-base mt-1">اضغط ← أو السهم للبدء</p>
    </div>
  )
}

function HookSlide({ s }: { s: Extract<GrammarSection, { kind: 'hook' }> }) {
  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">{s.titleAr}</h2>
      <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">{s.bodyAr}</p>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="bg-slate-900/80 rounded-2xl md:rounded-3xl p-5 md:p-7 border-2 border-slate-700 space-y-3">
          <div className="text-xs md:text-sm font-bold text-slate-500 tracking-wider">العربية</div>
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-200 leading-snug">{s.arabicEx}</div>
          <div className="text-sm md:text-base text-slate-500">لا يوجد فعل 😎</div>
        </div>
        <div className="bg-slate-900/80 rounded-2xl md:rounded-3xl p-5 md:p-7 border-2 border-amber-500/50 space-y-3">
          <div className="text-xs md:text-sm font-bold text-amber-400 tracking-wider font-display" dir="ltr">English</div>
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-snug font-display" dir="ltr">{s.englishEx}</div>
          <div className="text-sm md:text-base text-amber-400">نحتاج فعل ⚡</div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl md:rounded-2xl p-4 md:p-6">
        <p className="text-lg md:text-xl lg:text-2xl text-amber-300 leading-relaxed">{s.noteAr}</p>
      </div>
    </div>
  )
}

function PatternTableSlide({ s, step }: { s: Extract<GrammarSection, { kind: 'patternTable' }>; step: number }) {
  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">
          {step + 1} / {s.rows.length}
        </span>
      </div>

      <div className="space-y-2 md:space-y-3">
        {s.rows.slice(0, step + 1).map((row, i) => {
          const isNew = i === step
          return (
            <motion.div
              key={i}
              initial={isNew ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-3 md:gap-5 rounded-2xl md:rounded-3xl border transition-all ${
                isNew
                  ? 'bg-slate-800 border-amber-500/50 p-4 md:p-5 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/60 border-white/5 p-3 md:p-4'
              }`}
            >
              <div
                className={`bg-blue-500/20 text-blue-200 border border-blue-400/40 rounded-full font-bold font-display text-center flex-shrink-0 transition-all ${
                  isNew ? 'text-lg md:text-xl lg:text-2xl px-4 md:px-5 py-2 md:py-2.5 min-w-[90px] md:min-w-[110px]' : 'text-sm md:text-base lg:text-lg px-3 md:px-4 py-1.5 min-w-[70px] md:min-w-[90px]'
                }`}
                dir="ltr"
              >
                {row.pronoun}
              </div>
              <div className={`text-slate-600 flex-shrink-0 ${isNew ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>→</div>
              <div
                className={`bg-amber-500/20 text-amber-200 border border-amber-400/40 rounded-full font-bold font-display text-center flex-shrink-0 transition-all ${
                  isNew ? 'text-lg md:text-xl lg:text-2xl px-4 md:px-5 py-2 md:py-2.5 min-w-[70px] md:min-w-[90px]' : 'text-sm md:text-base lg:text-lg px-3 md:px-4 py-1.5 min-w-[55px] md:min-w-[70px]'
                }`}
                dir="ltr"
              >
                {row.verb}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-display text-white font-semibold transition-all ${isNew ? 'text-base md:text-lg lg:text-xl' : 'text-sm md:text-base lg:text-lg opacity-70'}`} dir="ltr">
                  {row.exampleEn}
                </div>
                <div className={`text-slate-400 mt-0.5 transition-all ${isNew ? 'text-sm md:text-base lg:text-lg' : 'text-xs md:text-sm opacity-70'}`}>
                  {row.exampleAr}
                </div>
              </div>
              {row.emoji && <div className={`flex-shrink-0 ${isNew ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl opacity-60'}`}>{row.emoji}</div>}
            </motion.div>
          )
        })}
      </div>

      <div className="flex gap-2 md:gap-3 text-xs md:text-sm flex-wrap">
        <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full px-3 md:px-4 py-1.5 font-bold">👤 ضمير</span>
        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full px-3 md:px-4 py-1.5 font-bold">⚡ فعل</span>
      </div>
    </div>
  )
}

function SentencesSlide({ s, step }: { s: Extract<GrammarSection, { kind: 'sentences' }>; step: number }) {
  const item = s.items[step]
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">{step + 1} / {s.items.length}</span>
      </div>

      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-7 md:p-10 lg:p-12 border border-white/5 space-y-5 md:space-y-7">
        {item.emoji && <div className="text-6xl md:text-7xl lg:text-8xl">{item.emoji}</div>}
        <div className="space-y-4 md:space-y-5">
          <Sentence tokens={item.tokens} big />
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 leading-snug font-bold">{item.ar}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
        {(['subject', 'verb', 'complement'] as const).map(role => {
          const labels = { subject: '👤 ضمير', verb: '⚡ فعل', complement: '💬 ما يليه' }
          return <span key={role} className={`rounded-full px-3 md:px-4 py-1.5 font-bold ${ROLE_STYLE[role]}`}>{labels[role]}</span>
        })}
      </div>
    </div>
  )
}

function NegationSlide({ s, step }: { s: Extract<GrammarSection, { kind: 'negation' }>; step: number }) {
  const item = s.items[step]
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 md:space-y-7">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
          <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">{step + 1} / {s.items.length}</span>
        </div>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{s.bodyAr}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 py-2" dir="ltr">
        {[
          { cls: 'bg-blue-500/20 text-blue-200 border-blue-400/40', text: 'Subject' },
          { cls: '', text: '+' },
          { cls: 'bg-amber-500/20 text-amber-200 border-amber-400/40', text: 'am/is/are' },
          { cls: '', text: '+' },
          { cls: 'bg-red-500/20 text-red-200 border-red-400/40', text: 'not' },
          { cls: '', text: '+' },
          { cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', text: '...' },
        ].map((part, i) =>
          part.cls
            ? <span key={i} className={`rounded-full font-bold font-display text-base md:text-lg px-3 md:px-4 py-1.5 border ${part.cls}`}>{part.text}</span>
            : <span key={i} className="text-slate-600 font-bold text-lg">{part.text}</span>
        )}
      </div>

      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-7 md:p-10 border border-white/5 space-y-5">
        {item.emoji && <div className="text-5xl md:text-6xl">{item.emoji}</div>}
        <Sentence tokens={item.tokens} big />
        <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 font-bold">{item.ar}</p>
      </div>
    </div>
  )
}

function QuestionsSlide({ s, step }: { s: Extract<GrammarSection, { kind: 'questions' }>; step: number }) {
  const item = s.items[step]
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 md:space-y-7">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
          <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">{step + 1} / {s.items.length}</span>
        </div>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{s.bodyAr}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 py-2" dir="ltr">
        {[
          { cls: 'bg-purple-500/20 text-purple-200 border-purple-400/40', text: 'Am/Is/Are' },
          { cls: '', text: '+' },
          { cls: 'bg-blue-500/20 text-blue-200 border-blue-400/40', text: 'Subject' },
          { cls: '', text: '+' },
          { cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', text: '...' },
          { cls: '', text: '?' },
        ].map((part, i) =>
          part.cls
            ? <span key={i} className={`rounded-full font-bold font-display text-base md:text-lg px-3 md:px-4 py-1.5 border ${part.cls}`}>{part.text}</span>
            : <span key={i} className="text-slate-300 font-bold text-xl">{part.text}</span>
        )}
      </div>

      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-7 md:p-10 border border-white/5 space-y-5">
        <Sentence tokens={item.q} big />
        <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 font-bold">{item.ar}</p>
      </div>
    </div>
  )
}

function DialogueSlide({ s }: { s: Extract<GrammarSection, { kind: 'dialogue' }> }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        {s.noteAr && <p className="text-lg md:text-xl text-amber-400/80 mt-2 leading-relaxed">{s.noteAr}</p>}
      </div>

      <div className="space-y-3 md:space-y-4">
        {s.lines.map((line: DialogueLine, i: number) => {
          const isA = line.speaker === 'A'
          return (
            <div key={i} className={`flex gap-3 md:gap-4 items-end ${!isA ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black flex-shrink-0 text-base md:text-lg font-display ${
                isA ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              }`}>
                {line.speaker}
              </div>
              <div className={`max-w-[75%] md:max-w-[70%] rounded-2xl md:rounded-3xl px-5 md:px-7 py-4 md:py-5 space-y-1.5 ${
                isA ? 'bg-slate-800 border border-slate-700/60 rounded-bl-sm' : 'bg-blue-900/40 border border-blue-500/25 rounded-br-sm'
              }`}>
                <p className="text-white text-base md:text-lg lg:text-xl font-semibold leading-relaxed font-display" dir="ltr">{line.text}</p>
                {line.ar && <p className="text-slate-400 text-sm md:text-base leading-snug">{line.ar}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {s.noteAr && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl p-4 md:p-5">
          <p className="text-amber-300 text-sm md:text-base">👆 لاحظ استخدام القاعدة في الحوار أعلاه</p>
        </div>
      )}
    </div>
  )
}

function NotesSlide({ s }: { s: Extract<GrammarSection, { kind: 'notes' }> }) {
  const cfg = {
    mistake: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-300', label: '⚠️ خطأ شائع' },
    tip:     { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300', label: '💡 نصيحة' },
    rule:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-300', label: '📌 قاعدة' },
  }

  return (
    <div className="w-full space-y-4 md:space-y-5">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {s.items.map((item: NoteItem, i: number) => {
          const c = cfg[item.type]
          return (
            <div key={i} className={`rounded-2xl md:rounded-3xl p-5 md:p-6 border ${c.bg} ${c.border} space-y-3`}>
              <div className={`text-xs md:text-sm font-bold tracking-wide uppercase ${c.text}`}>{c.label}</div>
              <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed">{item.ar}</p>
              {item.wrong && (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="text-red-400 text-sm md:text-base font-mono font-bold" dir="ltr">❌ {item.wrong}</div>
                  <div className="text-emerald-400 text-sm md:text-base font-mono font-bold" dir="ltr">✅ {item.right}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PracticeSlide({
  s, step, hasAnswered, chosen, onAnswer,
}: {
  s: Extract<GrammarSection, { kind: 'practice' }>
  step: number; hasAnswered: boolean; chosen: number | undefined; onAnswer: (idx: number) => void
}) {
  const ex = s.exercises[step]
  const correctIdx = ex.choices.indexOf(ex.answer)

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 md:space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">{step + 1} / {s.exercises.length}</span>
      </div>

      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-7 md:p-10 border border-white/5 text-center space-y-3">
        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-display" dir="ltr">
          {ex.before}
          <span className="inline-block border-b-2 border-amber-500 min-w-[70px] md:min-w-[90px] mx-2 text-amber-300 font-black">
            {hasAnswered ? ex.answer : '   '}
          </span>
          {ex.after}
        </div>
        <p className="text-slate-400 text-base md:text-lg">{ex.ar}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {ex.choices.map((choice, i) => {
          let cls = 'bg-slate-800/80 border-2 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
          if (hasAnswered) {
            if (i === correctIdx) cls = 'bg-emerald-600/20 border-2 border-emerald-500 text-emerald-200'
            else if (i === chosen && i !== correctIdx) cls = 'bg-red-600/20 border-2 border-red-500 text-red-200'
            else cls = 'bg-slate-900/60 border-2 border-slate-800 text-slate-600'
          }
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={hasAnswered}
              className={`rounded-xl md:rounded-2xl p-4 md:p-5 font-bold font-display text-xl md:text-2xl lg:text-3xl transition-all flex items-center justify-center gap-2 ${cls}`}
              dir="ltr"
            >
              {choice}
              {hasAnswered && i === correctIdx && <Check size={20} className="text-emerald-400 flex-shrink-0" />}
              {hasAnswered && i === chosen && i !== correctIdx && <X size={20} className="text-red-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 md:p-5 rounded-xl md:rounded-2xl border text-base md:text-lg font-medium ${
              chosen === correctIdx ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
            {chosen === correctIdx ? '✓ ممتاز! إجابة صحيحة 🎉' : `✗ الإجابة الصحيحة هي: "${ex.answer}"`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuizSlide({
  s, step, hasAnswered, chosen, onAnswer,
}: {
  s: Extract<GrammarSection, { kind: 'quiz' }>
  step: number; hasAnswered: boolean; chosen: number | undefined; onAnswer: (idx: number) => void
}) {
  const q = s.questions[step]
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 md:space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        <span className="text-slate-500 text-base md:text-lg tabular-nums font-mono">{step + 1} / {s.questions.length}</span>
      </div>

      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/5 space-y-3">
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-snug">{q.promptAr}</p>
        {q.prompt && <p className="text-slate-400 text-base md:text-xl font-display" dir="ltr">{q.prompt}</p>}
      </div>

      <div className="space-y-3 md:space-y-4">
        {q.choices.map((choice, i) => {
          let cls = 'bg-slate-800/80 border-2 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
          if (hasAnswered) {
            if (i === q.correct) cls = 'bg-emerald-600/20 border-2 border-emerald-500 text-emerald-200'
            else if (i === chosen && i !== q.correct) cls = 'bg-red-600/20 border-2 border-red-500 text-red-200'
            else cls = 'bg-slate-900/60 border-2 border-slate-800 text-slate-600'
          }
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={hasAnswered}
              className={`w-full rounded-xl md:rounded-2xl border-2 p-4 md:p-5 lg:p-6 font-bold text-lg md:text-xl lg:text-2xl text-right transition-all flex items-center justify-between gap-3 font-display ${cls}`}
              dir="ltr"
            >
              <span>{choice}</span>
              <span className="text-slate-600 text-sm font-mono ml-2">{String.fromCharCode(65 + i)}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 md:p-6 rounded-xl md:rounded-2xl border text-base md:text-lg ${
              chosen === q.correct ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
            <div className="font-bold mb-1.5 text-lg md:text-xl">
              {chosen === q.correct ? '✓ إجابة صحيحة! 🌟' : '✗ إجابة خاطئة'}
            </div>
            <div className="leading-relaxed">{q.explanationAr}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummarySlide({ s }: { s: Extract<GrammarSection, { kind: 'summary' }> }) {
  return (
    <div className="w-full space-y-6 md:space-y-8">
      <div className="text-center space-y-3">
        <div className="text-6xl md:text-7xl">🎉</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{s.titleAr}</h2>
        <p className="text-slate-400 text-base md:text-lg">احتفظ بهذه القواعد في ذاكرتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {s.rules.map((rule, i) => (
          <div key={i} className="bg-slate-900/60 rounded-2xl md:rounded-3xl p-5 md:p-7 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-500 text-white font-black text-sm md:text-base flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <p className="font-bold text-white text-base md:text-lg leading-snug">{rule.ar}</p>
            </div>
            <div className="space-y-1.5 pl-11 md:pl-12">
              <div className="text-amber-300 font-mono text-sm md:text-base font-bold" dir="ltr">{rule.en}</div>
              <div className="text-emerald-300 text-sm md:text-base font-semibold font-display" dir="ltr">e.g. {rule.example}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-500 text-sm md:text-base">أحسنت! انتهى الدرس 🏆</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Render dispatcher                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

function renderSection(
  section: GrammarSection, step: number, hasAnswered: boolean,
  chosen: number | undefined, handleAnswer: (idx: number) => void, descAr: string,
): React.ReactNode {
  switch (section.kind) {
    case 'cover':        return <CoverSlide s={section} descAr={descAr} />
    case 'hook':         return <HookSlide s={section} />
    case 'patternTable': return <PatternTableSlide s={section} step={step} />
    case 'sentences':    return <SentencesSlide s={section} step={step} />
    case 'negation':     return <NegationSlide s={section} step={step} />
    case 'questions':    return <QuestionsSlide s={section} step={step} />
    case 'dialogue':     return <DialogueSlide s={section} />
    case 'notes':        return <NotesSlide s={section} />
    case 'practice':
      return <PracticeSlide s={section} step={step} hasAnswered={hasAnswered} chosen={chosen} onAnswer={handleAnswer} />
    case 'quiz':
      return <QuizSlide s={section} step={step} hasAnswered={hasAnswered} chosen={chosen} onAnswer={handleAnswer} />
    case 'summary':      return <SummarySlide s={section} />
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main player — desktop-first, fits viewport                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function GrammarPlayer({ lesson }: { lesson: GrammarLesson }) {
  const [sIdx, setSIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const section = lesson.sections[sIdx]
  const maxStep = stepsFor(section) - 1
  const totalSections = lesson.sections.length

  const totalSteps = useMemo(() => lesson.sections.reduce((sum, s) => sum + stepsFor(s), 0), [lesson])
  const completedSteps = useMemo(() => {
    let done = 0
    for (let i = 0; i < sIdx; i++) done += stepsFor(lesson.sections[i])
    done += step
    return done
  }, [sIdx, step, lesson])
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const goNext = useCallback(() => {
    if (step < maxStep) setStep(s => s + 1)
    else if (sIdx < totalSections - 1) { setSIdx(s => s + 1); setStep(0) }
  }, [step, maxStep, sIdx, totalSections])

  const goPrev = useCallback(() => {
    if (step > 0) setStep(s => s - 1)
    else if (sIdx > 0) { const prev = lesson.sections[sIdx - 1]; setSIdx(s => s - 1); setStep(stepsFor(prev) - 1) }
  }, [step, sIdx, lesson])

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, toggleFullscreen])

  const answerKey = `${sIdx}-${step}`
  const hasAnswered = answerKey in answers
  const chosen = answers[answerKey]

  const handleAnswer = useCallback((idx: number) => {
    if (!hasAnswered) setAnswers(prev => ({ ...prev, [answerKey]: idx }))
  }, [hasAnswered, answerKey])

  const isFirst = sIdx === 0 && step === 0
  const isLast = sIdx === totalSections - 1 && step === maxStep

  return (
    <div
      ref={containerRef}
      className="h-screen bg-slate-950 flex flex-col select-none overflow-hidden"
      dir="rtl"
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-800/60 flex-shrink-0">
        <div className="h-full bg-amber-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-8 lg:px-12 py-3 md:py-4 border-b border-white/5">
        <Link
          href="/private/lessons/grammar"
          className="text-slate-500 hover:text-slate-200 transition-colors text-sm md:text-base font-medium"
        >
          ← الدروس
        </Link>

        {/* Section dots — desktop center */}
        <div className="hidden md:flex items-center gap-2">
          {lesson.sections.map((_, i) => (
            <button
              key={i}
              onClick={() => { setSIdx(i); setStep(0) }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === sIdx ? 'w-8 bg-amber-500' : i < sIdx ? 'w-2 bg-slate-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-amber-500/15 text-amber-400 text-xs md:text-sm font-bold px-3 py-1.5 rounded-full border border-amber-500/30">
            {lesson.level}
          </span>
          <span className="text-slate-500 text-sm font-display hidden lg:block" dir="ltr">{lesson.title.en}</span>
          <button
            onClick={toggleFullscreen}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex items-center justify-center px-6 md:px-12 lg:px-20 xl:px-28 py-4 md:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${sIdx}-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-5xl"
          >
            {renderSection(section, step, hasAnswered, chosen, handleAnswer, lesson.description.ar)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 flex items-center justify-between px-5 md:px-8 lg:px-12 py-4 md:py-5 border-t border-white/5">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm md:text-base font-medium"
        >
          ← رجوع
        </button>

        <div className="flex items-center gap-4">
          {/* Mobile dots */}
          <div className="flex md:hidden items-center gap-1">
            {lesson.sections.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full ${i === sIdx ? 'w-5 bg-amber-500' : i < sIdx ? 'w-1.5 bg-slate-500' : 'w-1.5 bg-slate-800'}`} />
            ))}
          </div>
          {maxStep > 0 && (
            <span className="text-slate-600 text-sm md:text-base tabular-nums font-mono">{step + 1}/{maxStep + 1}</span>
          )}
        </div>

        {isLast ? (
          <Link
            href="/private/lessons/grammar"
            className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all text-sm md:text-base font-bold"
          >
            إنهاء ✓
          </Link>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-400 active:scale-95 transition-all text-sm md:text-base font-bold shadow-lg shadow-amber-500/20"
          >
            التالي →
          </button>
        )}
      </footer>
    </div>
  )
}
