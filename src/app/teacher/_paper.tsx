'use client'

import type { LucideIcon } from 'lucide-react'

/**
 * The editorial layer.
 *
 * The old system was built from cards: every idea got a rounded plane, a ring
 * and a shadow, and the page became a tray of boxes. Boxes are how you say
 * "these things are separate"; they are a poor way to say anything else, and
 * when everything is boxed nothing is grouped.
 *
 * These primitives say it with type and rules instead. A band is a horizontal
 * run of the page with one idea in it. A figure is a number said at a size
 * that means it. A row is a label with words under it. Nothing floats.
 */

/** One idea, one horizontal run of the page, separated by a rule. */
export function Band({
  title, note, action, children, id,
}: {
  title?: string; note?: string; action?: React.ReactNode
  children: React.ReactNode; id?: string
}) {
  return (
    <section id={id} className="py-10 sm:py-12 border-t border-[#E2E8F0] first:border-t-0 first:pt-0">
      {(title || action) && (
        <div className="flex items-baseline gap-3 mb-7">
          {title && <h2 className="text-[13px] font-bold tracking-[.14em] uppercase text-[#94A3B8]">{title}</h2>}
          {note && <span className="text-[12px] text-[#CBD5E1]">{note}</span>}
          {action && <div className="mr-auto shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/** A number said as a statement, not stacked in a tile. */
export function Figure({
  value, unit, label, tone = 'ink',
}: {
  value: string | number; unit?: string; label: string
  tone?: 'ink' | 'alert'
}) {
  return (
    <div className="flex-1 min-w-[8rem]">
      <div className="flex items-baseline gap-1">
        <span className={`text-[36px] sm:text-[44px] font-extrabold tracking-tight leading-none tabular-nums
                          ${tone === 'alert' ? 'text-[#B91C1C]' : 'text-[#1E3A8A]'}`}>
          {value}
        </span>
        {unit && <span className="text-[15px] font-bold text-[#94A3B8]">{unit}</span>}
      </div>
      <div className="text-[12.5px] font-semibold text-[#64748B] mt-2">{label}</div>
    </div>
  )
}

/** A label above a set of words. The words are the content; nothing boxes them. */
export function TagRow({
  label, items, muted = false,
}: { label: string; items: string[]; muted?: boolean }) {
  if (!items || items.length === 0) return null
  return (
    <div className="py-4 border-b border-[#EEF2F7] last:border-b-0">
      <div className="text-[11.5px] font-bold tracking-[.1em] uppercase text-[#94A3B8] mb-2.5">{label}</div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-2">
        {items.map(t => (
          <span key={t}
                className={`text-[14.5px] font-semibold leading-none px-3 py-2 rounded-full
                            ${muted
                              ? 'text-[#64748B] bg-[#EEF2F7] line-through decoration-[#CBD5E1]'
                              : 'text-[#334155] bg-white ring-1 ring-[#E2E8F0]'}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The opening sentence of a page — the one thing worth saying at full size. */
export function Lede({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-inherit text-[30px] sm:text-[42px] font-extrabold tracking-tight leading-[1.15] max-w-[38rem]">
      {children}
    </h1>
  )
}

/** A quiet inline notice. Used where a card would have shouted. */
export function Notice({
  icon: Icon, tone = 'ink', children, action,
}: {
  icon?: LucideIcon; tone?: 'ink' | 'alert'; children: React.ReactNode; action?: React.ReactNode
}) {
  const alert = tone === 'alert'
  return (
    <div className={`flex items-center gap-3 py-3.5 px-4 rounded-xl
                     ${alert ? 'bg-[#FEF2F2] ring-1 ring-[#FECACA]' : 'bg-white ring-1 ring-[#E2E8F0]'}`}>
      {Icon && <Icon size={16} className={alert ? 'text-[#B91C1C] shrink-0' : 'text-[#64748B] shrink-0'} />}
      <div className={`text-[13.5px] font-semibold leading-snug ${alert ? 'text-[#991B1B]' : 'text-[#334155]'}`}>
        {children}
      </div>
      {action && <div className="mr-auto shrink-0">{action}</div>}
    </div>
  )
}

/** Text link that reads as a link without a button pretending to be one. */
export function TextLink({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12.5px] font-bold text-[#334155] border-b-2 border-[#CBD5E1] pb-0.5
                     hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">
      {children}
    </span>
  )
}
