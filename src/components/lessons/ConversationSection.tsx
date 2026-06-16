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
  { dot: 'bg-sky-500',     bubble: 'bg-sky-50 border-sky-200',         name: 'text-sky-700',     ring: 'ring-sky-400' },
  { dot: 'bg-amber-500',   bubble: 'bg-amber-50 border-amber-200',     name: 'text-amber-700',   ring: 'ring-amber-400' },
  { dot: 'bg-emerald-500', bubble: 'bg-emerald-50 border-emerald-200', name: 'text-emerald-700', ring: 'ring-emerald-400' },
  { dot: 'bg-rose-500',    bubble: 'bg-rose-50 border-rose-200',       name: 'text-rose-700',    ring: 'ring-rose-400' },
  { dot: 'bg-violet-500',  bubble: 'bg-violet-50 border-violet-200',   name: 'text-violet-700',  ring: 'ring-violet-400' },
] as const

export default function ConversationSection({
  section,
  step,
}: {
  section: ConversationSectionType
  step: number
}) {
  // The whole dialogue is ALWAYS on screen so it reads as one page. `step` only
  // moves a gentle highlight (so the teacher can walk through line by line while
  // explaining) — it never hides the other lines.
  const focusedIdx   = step > 0 ? Math.min(step, section.lines.length) - 1 : -1
  const containerRef = useRef<HTMLDivElement>(null)
  const focusedRef   = useRef<HTMLDivElement>(null)

  const speakers = Array.from(new Set(section.lines.map((l) => l.speaker)))
  const styleFor = (speaker: string) =>
    SPEAKER_PALETTE[speakers.indexOf(speaker) % SPEAKER_PALETTE.length]

  useEffect(() => {
    const container = containerRef.current
    const focused   = focusedRef.current
    if (!container || !focused) return
    const target = focused.offsetTop - (container.clientHeight - focused.offsetHeight) / 2
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [step])

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 max-w-3xl mx-auto w-full py-3">

      {/* Header */}
      <div className="text-center mb-3 md:mb-4 flex-shrink-0">
        <div className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold tracking-[0.3em] uppercase mb-2 font-ui">
          Conversation
        </div>
        <h2 className="font-ui text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">
          {section.title}
        </h2>
        {section.note && (
          <div className="mt-2 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-1.5 text-sm text-yellow-900" dir="rtl">
            {section.note}
          </div>
        )}
      </div>

      {/* Script — full dialogue, scrolls only if it overflows; centred when short */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center gap-2.5 md:gap-3 py-2">
          {section.lines.map((line, i) => {
            const isFocused = i === focusedIdx
            const s         = styleFor(line.speaker)
            // alternate sides per speaker → readable chat rhythm
            const right     = speakers.indexOf(line.speaker) % 2 === 1

            return (
              <motion.div
                key={i}
                ref={isFocused ? focusedRef : null}
                initial={false}
                animate={{ scale: isFocused ? 1 : 0.997 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${right ? 'items-end text-right' : 'items-start text-left'}`}
              >
                {/* Speaker label */}
                <div className={`flex items-center gap-1.5 mb-1 px-1 ${right ? 'flex-row-reverse' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`font-ui font-extrabold uppercase tracking-wide text-[10px] md:text-[11px] ${s.name}`}>
                    {line.speaker}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={[
                    'max-w-[90%] rounded-2xl border px-4 py-2.5 md:px-5 md:py-3 transition-all',
                    s.bubble,
                    right ? 'rounded-tr-sm' : 'rounded-tl-sm',
                    isFocused ? `ring-2 ${s.ring} shadow-md` : 'shadow-sm',
                  ].join(' ')}
                >
                  <p className="text-lg md:text-2xl leading-snug font-semibold text-slate-800" dir="ltr">
                    {line.text}
                  </p>
                  {line.stage && (
                    <p className="text-xs md:text-sm text-slate-500 italic mt-1" dir="ltr">
                      ({line.stage})
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
