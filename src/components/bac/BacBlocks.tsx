'use client'

import { Fragment, type ReactNode } from 'react'
import type { Block } from '@/data/level1-book'
import type { BacSection } from '@/data/bac/bac-helpers'

/**
 * The Bac pack's lesson blocks, laid out for a phone: the printed A4 layout
 * (src/app/admin/level1-book/_blocks.tsx) is fixed-width, so the student
 * portal renders the same data its own way — tables scroll sideways, columns
 * stack, and every line takes the direction of its first letter.
 */

export const SECTION_COLOUR: Record<BacSection, { c: string; soft: string }> = {
  contents: { c: '#2563EB', soft: '#EFF6FF' },
  start: { c: '#2563EB', soft: '#EFF6FF' },
  reading: { c: '#0E7490', soft: '#ECFEFF' },
  vocab: { c: '#047857', soft: '#ECFDF5' },
  grammar: { c: '#6D28D9', soft: '#F5F3FF' },
  functions: { c: '#C2410C', soft: '#FFF7ED' },
  writing: { c: '#BE185D', soft: '#FDF2F8' },
  exam: { c: '#B91C1C', soft: '#FEF2F2' },
  key: { c: '#334155', soft: '#F1F5F9' },
}

/** "English sentence. - ترجمتها" */
const EN_AR = /^(.*?[A-Za-z0-9?.!'"”)…])\s+-\s+([؀-ۿ].*)$/

/** A line in its own direction; "English - عربي" puts the Arabic under the English. */
export function Line({ s, className = '' }: { s: string; className?: string }) {
  const m = s.match(EN_AR)
  if (m) return (
    <span className={`block ${className}`}>
      <span dir="ltr" className="block">{m[1]}</span>
      <span dir="rtl" className="block text-right text-[0.85em] font-semibold text-zinc-500">{m[2]}</span>
    </span>
  )
  return <span dir="auto" className={`block text-start ${className}`}>{s}</span>
}

export function LessonBlocks({ blocks, section, exercise }: {
  blocks: Block[]; section: BacSection; exercise: (b: Extract<Block, { t: 'exercise' }>) => ReactNode
}) {
  return <div className="flex flex-col gap-3">{blocks.map((b, i) => <Fragment key={i}>{view(b, section, exercise)}</Fragment>)}</div>
}

function view(b: Block, section: BacSection, exercise: (b: Extract<Block, { t: 'exercise' }>) => ReactNode): ReactNode {
  const { c, soft } = SECTION_COLOUR[section]
  switch (b.t) {
    case 'banner': return (
      <div className="rounded-2xl px-4 py-3 flex items-center justify-center gap-3 text-center" style={{ background: soft }}>
        {b.icons?.[0] && <span className="text-[26px] leading-none">{b.icons[0]}</span>}
        <Line s={b.title} className="text-[19px] font-black leading-tight !text-center" />
        {b.icons?.[1] && <span className="text-[26px] leading-none">{b.icons[1]}</span>}
      </div>
    )
    case 'bar': return (
      <div className="flex items-center gap-2 pt-1" style={{ color: c }}>
        <span className="w-1.5 self-stretch rounded-full" style={{ background: c }} />
        <Line s={b.title} className="text-[16px] font-black leading-tight" />
      </div>
    )
    case 'sub': return <Line s={b.text} className="text-[14px] font-extrabold" />
    case 'bullets': {
      const list = (
        <ul className={`grid gap-x-5 gap-y-1.5 ${b.cols && b.cols > 1 ? 'sm:grid-cols-2' : ''}`}>
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-snug" dir={/^[^A-Za-z؀-ۿ]*[؀-ۿ]/.test(it) ? 'rtl' : 'ltr'}>
              <span className="mt-[0.45em] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
              <Line s={it} className="flex-1 min-w-0" />
            </li>
          ))}
        </ul>
      )
      return b.box || b.heading ? (
        <div className="rounded-2xl px-3.5 py-3" style={{ background: soft }}>
          {b.heading && <Line s={b.heading} className="text-[14px] font-black mb-1.5" />}
          {list}
        </div>
      ) : list
    }
    case 'grid': {
      const cols = Math.max(...b.rows.map(r => r.cells.length))
      return (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: c }}>
          {b.title && <div className="px-3 py-1.5 text-white text-[13px] font-extrabold text-center" style={{ background: c }}><Line s={b.title} className="!text-center" /></div>}
          <div className="overflow-x-auto">
            <div className={cols > 2 ? 'min-w-[560px]' : ''} dir="ltr">
              {b.rows.map((r, i) => (
                <div key={i} className={`grid ${i ? 'border-t border-zinc-100' : ''}`}
                  style={{ gridTemplateColumns: (r.span ?? r.cells.map(() => 1)).map(s => `minmax(0, ${s}fr)`).join(' '), ...(r.dark ? { background: c, color: 'white' } : {}) }}>
                  {r.cells.map((cell, j) => (
                    <div key={j} dir="auto" className={`px-2 py-1.5 text-center text-[12.5px] leading-snug ${r.dark ? 'font-extrabold' : 'font-semibold'} ${j ? 'border-l border-zinc-100' : ''}`}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
    case 'row': return (
      <div className="grid gap-3 md:grid-cols-2">
        {b.blocks.map((col, i) => <LessonBlocks key={i} blocks={col} section={section} exercise={exercise} />)}
      </div>
    )
    case 'callout': return (
      <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-3.5 py-2.5 text-[13.5px] font-semibold leading-relaxed">
        <span>💡</span><Line s={b.text} className="flex-1" />
      </div>
    )
    case 'text': {
      const paras = b.body.split('\n')
      return (
        <div>
          <Line s={b.label} className="text-[14px] font-black mb-1" />
          <div dir="ltr" className="rounded-2xl px-3.5 py-3 text-[14.5px] leading-[1.7] space-y-2" style={{ background: soft, borderLeft: `4px solid ${c}` }}>
            {paras.map((p, i) => (
              <p key={i} className="flex gap-2">
                {paras.length > 1 && <span className="shrink-0 w-4 text-[11px] font-black pt-1" style={{ color: c }}>{i + 1}</span>}
                <span>{p}</span>
              </p>
            ))}
          </div>
        </div>
      )
    }
    case 'pairs': return (
      <div className="grid sm:grid-cols-2 gap-x-5">
        {b.items.map(([en, ar], i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 border-b border-dashed border-zinc-200 py-1.5">
            <span dir="ltr" className="text-[14px] font-bold" style={{ color: c }}>{en}</span>
            <span dir="rtl" className="text-[13.5px] font-semibold text-zinc-600 text-left">{ar}</span>
          </div>
        ))}
      </div>
    )
    case 'boxes': return (
      <div className="grid sm:grid-cols-2 gap-2.5">
        {b.items.map((box, i) => (
          <div key={i} className="rounded-2xl px-3.5 py-2.5" style={{ background: soft }}>
            <Line s={box.title} className="text-[14px] font-black mb-1" />
            {box.lines.map((l, k) => <Line key={k} s={l} className="text-[13px] leading-snug text-zinc-700" />)}
          </div>
        ))}
      </div>
    )
    case 'exercise': return exercise(b)
    default: return null
  }
}
