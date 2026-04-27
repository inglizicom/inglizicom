'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { VocabItem } from '@/data/private-lessons/types'
import { singleLineSize } from './VocabSection'

type ReviewSectionType = {
  kind: 'review'
  title?: string
  items: VocabItem[]
}

const TINTS: Record<NonNullable<VocabItem['tint']>, { stripe: string; accent: string; soft: string }> = {
  amber:   { stripe: 'bg-amber-500',   accent: 'text-amber-600',   soft: 'bg-amber-50' },
  rose:    { stripe: 'bg-rose-500',    accent: 'text-rose-600',    soft: 'bg-rose-50' },
  sky:     { stripe: 'bg-sky-500',     accent: 'text-sky-600',     soft: 'bg-sky-50' },
  emerald: { stripe: 'bg-emerald-500', accent: 'text-emerald-600', soft: 'bg-emerald-50' },
  violet:  { stripe: 'bg-violet-500',  accent: 'text-violet-600',  soft: 'bg-violet-50' },
  orange:  { stripe: 'bg-orange-500',  accent: 'text-orange-600',  soft: 'bg-orange-50' },
  teal:    { stripe: 'bg-teal-500',    accent: 'text-teal-600',    soft: 'bg-teal-50' },
}

export default function ReviewSection({ section }: { section: ReviewSectionType; step: number }) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const total = section.items.length
  const item = section.items[idx]
  const tint = TINTS[item?.tint ?? 'amber']

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) setRevealed(true)
        else if (idx < total - 1) {
          setIdx(idx + 1)
          setRevealed(false)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [revealed, idx, total])

  function next() {
    if (!revealed) setRevealed(true)
    else if (idx < total - 1) {
      setIdx(idx + 1)
      setRevealed(false)
    } else {
      setIdx(0)
      setRevealed(false)
    }
  }

  function back() {
    if (revealed) setRevealed(false)
    else if (idx > 0) {
      setIdx(idx - 1)
      setRevealed(true)
    }
  }

  if (!item) return null

  return (
    <div className="flex-1 flex flex-col px-3 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Section header */}
      <div className="text-center mb-4 md:mb-6 flex-shrink-0">
        <div className="inline-block px-4 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold tracking-[0.3em] uppercase mb-2 font-display">
          Quick Review
        </div>
        <h2 className="font-display text-xl md:text-2xl font-black text-slate-900" dir="rtl">
          {section.title || 'مراجعة سريعة — خمّن الجملة'}
        </h2>
        <div className="mt-1 text-xs text-slate-500 font-mono">
          {idx + 1} / {total}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className={`h-2 ${tint.stripe}`} />
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-0">
            {/* Picture */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`pic-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative aspect-square md:aspect-auto md:h-full min-h-[260px] ${tint.soft} flex items-center justify-center p-4 md:p-6`}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner">
                  <ReviewImage item={item} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Reveal panel */}
            <div className="px-6 sm:px-10 md:px-12 py-8 md:py-12 flex flex-col justify-center min-h-[260px]">
              <AnimatePresence mode="wait">
                {!revealed ? (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="font-display font-bold tracking-[0.35em] uppercase text-[11px] md:text-xs text-slate-400 mb-5 md:mb-7">
                      Guess
                    </div>
                    <div className="font-display text-5xl md:text-7xl font-black text-slate-300 mb-4 leading-none whitespace-nowrap">
                      ? ? ? ? ?
                    </div>
                    <div className="text-base md:text-lg text-slate-500 mb-8" dir="rtl">
                      ما الجملة المناسبة لهذه الصورة؟
                    </div>
                    <button
                      onClick={next}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg transition"
                    >
                      <Eye className="w-5 h-5" />
                      <span>أظهر الجواب</span>
                      <kbd className="ml-1 px-1.5 py-0.5 bg-slate-700 rounded text-[10px] font-mono">Enter</kbd>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className={`font-display font-bold tracking-[0.35em] uppercase text-[11px] md:text-xs mb-5 md:mb-7 ${tint.accent}`}>
                      Answer
                    </div>
                    <h3
                      className={`font-display font-black text-slate-900 leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${singleLineSize(item.en)}`}
                    >
                      {item.en}
                    </h3>
                    <div className={`h-1.5 w-20 rounded-full mt-6 mb-6 ${tint.stripe} opacity-70`} />
                    <div className="text-2xl md:text-3xl font-bold text-slate-600 mb-6" dir="rtl">
                      {item.ar}
                    </div>
                    <button
                      onClick={next}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg transition"
                    >
                      {idx < total - 1 ? 'الصورة التالية' : 'إعادة من البداية'} →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Local back/hide */}
      <div className="text-center mt-3 flex-shrink-0">
        <button
          onClick={back}
          disabled={!revealed && idx === 0}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30 transition"
        >
          {revealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> أخفِ الجواب
            </>
          ) : (
            <>← السابق</>
          )}
        </button>
      </div>
    </div>
  )
}

function ReviewImage({ item }: { item: VocabItem }) {
  const sources = [item.image, item.imageFallback].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const currentSrc = sources[srcIdx]

  if (currentSrc) {
    return (
      <>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentSrc}
          src={currentSrc}
          alt="Guess what this is"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false)
            setSrcIdx((i) => i + 1)
          }}
        />
      </>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
      <div className="text-slate-300 font-display font-black text-[6rem] md:text-[8rem] leading-none">?</div>
    </div>
  )
}
