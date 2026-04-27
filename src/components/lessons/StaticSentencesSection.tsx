'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { StaticPattern } from '@/data/private-lessons/types'

type StaticSentencesSectionType = {
  kind: 'staticSentences'
  title?: string
  patterns: StaticPattern[]
}

export default function StaticSentencesSection({
  section,
  step,
}: {
  section: StaticSentencesSectionType
  step: number
}) {
  // Step 0 = title only. Then patterns expand:
  //   For pattern P with E examples: steps occupy 1 (template) + E (examples) = 1+E
  const focus = locateStep(section.patterns, step)

  return (
    <div className="flex-1 flex flex-col px-6 max-w-6xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-block px-5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold tracking-wider uppercase mb-3">
          Sentence Patterns
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-brand-900" dir="rtl">
          {section.title || 'جمل ثابتة قابلة للتغيير'}
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {section.patterns.map((p, pi) => {
          const focused = focus?.patternIdx === pi
          const templateVisible = focus !== null && (focus.patternIdx > pi || (focus.patternIdx === pi && focus.subStep >= 0))
          const examplesVisible = focus && focus.patternIdx === pi ? focus.subStep : focus && focus.patternIdx > pi ? p.examples.length : -1

          return (
            <motion.div
              key={pi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: templateVisible ? 1 : 0.25, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border-2 p-5 transition-all ${
                focused ? 'border-amber-500 bg-amber-50 shadow-xl scale-[1.02]' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                  {pi + 1}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Pattern {pi + 1}
                </div>
              </div>
              <AnimatePresence mode="wait">
                {templateVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                  >
                    <div className="text-lg md:text-xl font-bold text-brand-900 leading-snug">
                      {p.template}
                    </div>
                    <div className="text-sm md:text-base text-slate-600 mt-1" dir="rtl">
                      {p.templateAr}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 space-y-2">
                {p.examples.map((ex, ei) => {
                  const visible = examplesVisible > ei
                  return (
                    <AnimatePresence key={ei}>
                      {visible && (
                        <motion.div
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-amber-600 mt-1.5 text-xs">▸</span>
                          <span className="text-base md:text-lg text-slate-800 font-medium">
                            {ex}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function locateStep(
  patterns: StaticPattern[],
  step: number
): { patternIdx: number; subStep: number } | null {
  // step 0 = title. Then for each pattern:
  // subStep 0 = show template, subStep 1..N = show examples 1..N
  if (step === 0) return null
  let cursor = 0
  for (let pi = 0; pi < patterns.length; pi++) {
    for (let s = 0; s <= patterns[pi].examples.length; s++) {
      cursor += 1
      if (cursor === step) return { patternIdx: pi, subStep: s }
    }
  }
  return null
}
