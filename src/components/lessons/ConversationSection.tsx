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
  {
    dot:    'bg-sky-500',
    border: 'border-l-sky-500',
    row:    'bg-sky-50/70',
    name:   'text-sky-700',
    pill:   'bg-sky-100 text-sky-700',
  },
  {
    dot:    'bg-amber-500',
    border: 'border-l-amber-500',
    row:    'bg-amber-50/70',
    name:   'text-amber-700',
    pill:   'bg-amber-100 text-amber-700',
  },
  {
    dot:    'bg-emerald-500',
    border: 'border-l-emerald-500',
    row:    'bg-emerald-50/70',
    name:   'text-emerald-700',
    pill:   'bg-emerald-100 text-emerald-700',
  },
  {
    dot:    'bg-rose-500',
    border: 'border-l-rose-500',
    row:    'bg-rose-50/70',
    name:   'text-rose-700',
    pill:   'bg-rose-100 text-rose-700',
  },
  {
    dot:    'bg-violet-500',
    border: 'border-l-violet-500',
    row:    'bg-violet-50/70',
    name:   'text-violet-700',
    pill:   'bg-violet-100 text-violet-700',
  },
] as const

export default function ConversationSection({
  section,
  step,
}: {
  section: ConversationSectionType
  step: number
}) {
  const visibleCount = step
  const focusedIdx   = visibleCount - 1
  const containerRef = useRef<HTMLDivElement>(null)
  const focusedRef   = useRef<HTMLDivElement>(null)

  const speakers  = Array.from(new Set(section.lines.map((l) => l.speaker)))
  const styleFor  = (speaker: string) =>
    SPEAKER_PALETTE[speakers.indexOf(speaker) % SPEAKER_PALETTE.length]

  useEffect(() => {
    const container = containerRef.current
    const focused   = focusedRef.current
    if (!container || !focused) return

    // Scroll only the inner list — never bubble up to the page/outer container.
    const containerH = container.clientHeight
    const elemTop    = focused.offsetTop
    const elemH      = focused.offsetHeight
    const target     = elemTop - (containerH - elemH) / 2   // center in view

    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [step])

  return (
    <div className="flex-1 flex flex-col px-4 md:px-8 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="text-center mb-4 md:mb-5 flex-shrink-0">
        <div className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold tracking-[0.3em] uppercase mb-2 font-display">
          Conversation
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black text-slate-900">
          {section.title}
        </h2>
        {section.note && (
          <div
            className="mt-2 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-1.5 text-sm text-yellow-900"
            dir="rtl"
          >
            {section.note}
          </div>
        )}
      </div>

      {/* Script */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="divide-y divide-slate-100">
          {section.lines.map((line, i) => {
            const visible   = i < visibleCount
            const isFocused = i === focusedIdx
            const s         = styleFor(line.speaker)

            return (
              <motion.div
                key={i}
                ref={isFocused ? focusedRef : null}
                initial={false}
                animate={{ opacity: visible ? 1 : 0.15 }}
                transition={{ duration: 0.22 }}
                className={[
                  'grid grid-cols-[8rem_1fr] md:grid-cols-[10rem_1fr] items-start gap-3 md:gap-5',
                  'px-4 md:px-6 py-3 md:py-4',
                  'border-l-4 transition-colors duration-200',
                  isFocused ? `${s.row} ${s.border}` : 'border-l-transparent',
                ].join(' ')}
              >
                {/* Speaker column — fixed width, never overflows */}
                <div className="flex items-center gap-2 pt-0.5 overflow-hidden">
                  <div className={`w-2.5 h-2.5 shrink-0 rounded-full ${s.dot} ${visible ? '' : 'opacity-25'}`} />
                  <span
                    className={[
                      'font-display font-extrabold uppercase tracking-wide leading-none truncate',
                      'text-[11px] md:text-[13px]',
                      visible ? s.name : 'text-slate-300',
                    ].join(' ')}
                  >
                    {line.speaker}
                  </span>
                </div>

                {/* Line text */}
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <p
                    className={[
                      'text-lg md:text-2xl leading-snug flex-1',
                      isFocused ? 'font-bold text-slate-900' : 'font-medium',
                      visible ? 'text-slate-800' : 'text-slate-300',
                    ].join(' ')}
                  >
                    {visible ? line.text : '· · ·'}
                  </p>

                  {isFocused && (
                    <span className="shrink-0 text-[11px] font-mono text-slate-400 pt-1.5">
                      {i + 1}/{section.lines.length}
                    </span>
                  )}
                </div>

                {/* Stage direction */}
                {visible && line.stage && (
                  <div className="col-start-2 text-xs md:text-sm text-slate-500 italic -mt-1">
                    ({line.stage})
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
