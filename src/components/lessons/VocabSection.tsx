'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { VocabItem } from '@/data/private-lessons/types'

type VocabSectionType = {
  kind: 'vocab'
  title?: string
  items: VocabItem[]
}

const TINTS: Record<NonNullable<VocabItem['tint']>, { stripe: string; accent: string; soft: string; bullet: string }> = {
  amber:   { stripe: 'bg-amber-500',   accent: 'text-amber-600',   soft: 'bg-amber-50',   bullet: 'text-amber-500' },
  rose:    { stripe: 'bg-rose-500',    accent: 'text-rose-600',    soft: 'bg-rose-50',    bullet: 'text-rose-500' },
  sky:     { stripe: 'bg-sky-500',     accent: 'text-sky-600',     soft: 'bg-sky-50',     bullet: 'text-sky-500' },
  emerald: { stripe: 'bg-emerald-500', accent: 'text-emerald-600', soft: 'bg-emerald-50', bullet: 'text-emerald-500' },
  violet:  { stripe: 'bg-violet-500',  accent: 'text-violet-600',  soft: 'bg-violet-50',  bullet: 'text-violet-500' },
  orange:  { stripe: 'bg-orange-500',  accent: 'text-orange-600',  soft: 'bg-orange-50',  bullet: 'text-orange-500' },
  teal:    { stripe: 'bg-teal-500',    accent: 'text-teal-600',    soft: 'bg-teal-50',    bullet: 'text-teal-500' },
}

// Force the English headline onto a single line by scaling down based on
// character count. Combine with whitespace-nowrap.
export function singleLineSize(text: string): string {
  const len = text.length
  if (len <= 12) return 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
  if (len <= 18) return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
  if (len <= 24) return 'text-3xl sm:text-4xl md:text-5xl'
  if (len <= 30) return 'text-2xl sm:text-3xl md:text-4xl'
  return 'text-xl sm:text-2xl md:text-3xl'
}

export default function VocabSection({
  section,
  step,
}: {
  section: VocabSectionType
  step: number
}) {
  const focusedItem = step > 0 ? section.items[step - 1] : null

  if (!focusedItem) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-3xl">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-[0.3em] uppercase mb-6 font-display">
            Vocabulary
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tight">
            {section.items.length} new sentences
          </h2>
          <p className="text-2xl md:text-3xl text-slate-500 font-bold" dir="rtl">
            {section.title || 'المفردات'}
          </p>
          <div className="mt-12 inline-flex items-center gap-2 text-sm text-slate-500">
            <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">
              Space
            </kbd>
            <span dir="rtl">للبدء</span>
          </div>
        </div>
      </div>
    )
  }

  return <FlashCard item={focusedItem} index={step} total={section.items.length} />
}

function FlashCard({
  item,
  index,
  total,
}: {
  item: VocabItem
  index: number
  total: number
}) {
  const tint = TINTS[item.tint ?? 'amber']
  const hasExamples = !!item.examples?.length

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${index}-${item.en}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center px-3 sm:px-6 md:px-10"
      >
        <div className="w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
          {/* Top accent stripe */}
          <div className={`h-2 ${tint.stripe}`} />

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-0">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className={`relative aspect-square md:aspect-auto md:h-full min-h-[260px] ${tint.soft} flex items-center justify-center p-4 md:p-6`}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner">
                <VocabImage item={item} tint={tint} />
              </div>
            </motion.div>

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="px-6 sm:px-10 md:px-12 py-7 md:py-10 flex flex-col justify-center"
            >
              {/* Counter */}
              <div className={`font-display font-bold tracking-[0.35em] uppercase text-[11px] md:text-xs mb-4 md:mb-5 ${tint.accent}`}>
                {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>

              {/* Main sentence — single line, scales down for long text */}
              <h2
                className={`font-display font-black text-slate-900 leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${singleLineSize(item.en)}`}
              >
                {item.en}
              </h2>

              {/* Concrete example sentences */}
              {hasExamples && (
                <ul className="mt-5 md:mt-6 space-y-2 md:space-y-2.5">
                  {item.examples!.map((ex, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-base sm:text-lg md:text-xl text-slate-700 font-medium leading-snug"
                    >
                      <span className={`${tint.bullet} font-black text-xl md:text-2xl leading-tight flex-shrink-0`}>›</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Accent rule */}
              <div className={`h-1.5 w-16 rounded-full mt-5 md:mt-6 mb-4 md:mb-5 ${tint.stripe} opacity-70`} />

              {/* Arabic */}
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-600" dir="rtl">
                {item.ar}
              </div>

              {item.note && (
                <div className="mt-3 text-sm md:text-base text-slate-500 italic" dir="auto">
                  {item.note}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function VocabImage({
  item,
  tint,
}: {
  item: VocabItem
  tint: { stripe: string; accent: string; soft: string; bullet: string }
}) {
  // Try image → imageFallback → placeholder
  const sources = [item.image, item.imageFallback].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const currentSrc = sources[srcIdx]

  if (currentSrc) {
    return (
      <>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-500 animate-spin" />
            <div className="text-xs text-slate-400 font-medium">جارٍ تحميل الصورة…</div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentSrc}
          src={currentSrc}
          alt={item.en}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            // Try next source in chain; if exhausted, srcIdx points past end → placeholder shown
            setLoaded(false)
            setSrcIdx((i) => i + 1)
          }}
        />
      </>
    )
  }

  // Designed placeholder when all sources fail — stylized typographic card
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${tint.soft} p-6`}>
      <div className={`font-display font-black text-5xl md:text-6xl ${tint.accent} text-center leading-tight`}>
        {firstWord(item.en)}
      </div>
      <div className={`h-0.5 w-12 ${tint.stripe} rounded-full opacity-70`} />
      <div className="text-[10px] md:text-xs text-slate-400 font-medium text-center max-w-[220px]" dir="rtl">
        أضف صورة في
        <br />
        <code className="font-mono text-[10px]" dir="ltr">/public/lessons/unit01/</code>
      </div>
    </div>
  )
}

function firstWord(s: string): string {
  const tokens = s.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
  const skip = new Set(['I', 'i', 'a', 'an', 'the', 'my', 'your', 'we'])
  const verb = tokens.find((t) => !skip.has(t)) || tokens[0] || ''
  return verb
}
