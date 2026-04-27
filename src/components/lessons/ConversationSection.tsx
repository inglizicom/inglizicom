'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { DialogLine } from '@/data/private-lessons/types'

type ConversationSectionType = {
  kind: 'conversation'
  title: string
  lines: DialogLine[]
  note?: string
}

const SPEAKER_PALETTE = [
  { tag: 'bg-sky-500',     row: 'bg-sky-50/60',     border: 'border-l-sky-500',     name: 'text-sky-700' },
  { tag: 'bg-amber-500',   row: 'bg-amber-50/60',   border: 'border-l-amber-500',   name: 'text-amber-700' },
  { tag: 'bg-emerald-500', row: 'bg-emerald-50/60', border: 'border-l-emerald-500', name: 'text-emerald-700' },
  { tag: 'bg-rose-500',    row: 'bg-rose-50/60',    border: 'border-l-rose-500',    name: 'text-rose-700' },
] as const

export default function ConversationSection({
  section,
  step,
}: {
  section: ConversationSectionType
  step: number
}) {
  const visibleCount = step
  const focusedIdx = visibleCount - 1
  const containerRef = useRef<HTMLDivElement>(null)
  const focusedRef = useRef<HTMLDivElement>(null)

  const speakers = Array.from(new Set(section.lines.map((l) => l.speaker)))
  const styleFor = (speaker: string) =>
    SPEAKER_PALETTE[speakers.indexOf(speaker) % SPEAKER_PALETTE.length]

  // Auto-scroll the focused line into view
  useEffect(() => {
    focusedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [step])

  return (
    <div className="flex-1 flex flex-col px-4 md:px-8 max-w-5xl mx-auto w-full">
      {/* Section header — compact so the script gets max space */}
      <div className="text-center mb-4 md:mb-6 flex-shrink-0">
        <div className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold tracking-[0.3em] uppercase mb-2 font-display">
          Conversation
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black text-slate-900">{section.title}</h2>
        {section.note && (
          <div className="mt-2 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-1.5 text-sm text-yellow-900" dir="rtl">
            {section.note}
          </div>
        )}
      </div>

      {/* Script area */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {section.lines.map((line, i) => {
            const visible = i < visibleCount
            const isFocused = i === focusedIdx
            const style = styleFor(line.speaker)
            return (
              <motion.div
                key={i}
                ref={isFocused ? focusedRef : null}
                initial={false}
                animate={{ opacity: visible ? 1 : 0.18 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 md:gap-5 px-4 md:px-6 py-3 md:py-4 transition-colors ${
                  isFocused ? `${style.row} border-l-4 ${style.border}` : 'border-l-4 border-l-transparent'
                }`}
              >
                {/* Speaker tag */}
                <div className="flex-shrink-0 w-16 md:w-24 pt-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.tag} ${visible ? '' : 'opacity-30'}`} />
                    <div className={`font-display font-bold text-sm md:text-base uppercase tracking-wider ${visible ? style.name : 'text-slate-300'}`}>
                      {line.speaker}
                    </div>
                  </div>
                </div>
                {/* Line text */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-lg md:text-2xl leading-snug font-medium ${
                      visible ? 'text-slate-900' : 'text-slate-300'
                    } ${isFocused ? 'font-bold' : ''}`}
                  >
                    {visible ? line.text : '· · ·'}
                  </div>
                  {visible && line.stage && (
                    <div className="text-xs md:text-sm text-slate-500 italic mt-1">
                      ({line.stage})
                    </div>
                  )}
                </div>
                {/* Counter for focused */}
                {isFocused && (
                  <div className="flex-shrink-0 text-xs font-mono text-slate-400 pt-1.5">
                    {i + 1}/{section.lines.length}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
