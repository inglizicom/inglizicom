'use client'

import { BadgeCheck, CircleHelp, Sparkles } from 'lucide-react'
import { getPlan } from '@/data/plans'
import { leadOffer, type LeadOffer, type OfferLead, type OfferState } from '@/lib/lead-offer'

/**
 * The offer a lead is about, shown the same way on every leads screen:
 * green when the visitor chose it, amber when the level test suggested it,
 * grey and dashed when they chose nothing (so staff ask first).
 */

export function offerOf(lead: OfferLead): LeadOffer {
  return leadOffer(lead, id => {
    const p = getPlan(id)
    return p ? { title: p.title_ar, amount: p.amount_mad, from: p.levelFrom, to: p.levelTo } : undefined
  })
}

const TONE: Record<OfferState, { cls: string; Icon: typeof BadgeCheck; tag: string }> = {
  chosen:    { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: BadgeCheck, tag: 'اختار' },
  suggested: { cls: 'bg-amber-50 text-amber-800 border-amber-200',       Icon: Sparkles,   tag: 'مقترح' },
  none:      { cls: 'bg-zinc-50 text-zinc-500 border-zinc-300 border-dashed', Icon: CircleHelp, tag: '' },
}

/** Compact chip for list cards: icon + offer (+ price). */
export function LeadOfferChip({ lead }: { lead: OfferLead }) {
  const o = offerOf(lead)
  const t = TONE[o.state]
  return (
    <span title={o.hint ?? undefined}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-bold max-w-full ${t.cls}`}>
      <t.Icon size={12} className="shrink-0" />
      <span className="truncate">{o.title}</span>
      {o.detail && <span className="shrink-0 font-semibold opacity-75">· {o.detail.split(' · ')[0]}</span>}
    </span>
  )
}

/** The full block for a lead's details: offer, price and levels, and why. */
export function LeadOfferPanel({ lead }: { lead: OfferLead }) {
  const o = offerOf(lead)
  const t = TONE[o.state]
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${t.cls}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-80">
        <t.Icon size={13} /> العرض المطلوب{t.tag && ` · ${t.tag}`}
      </div>
      <div className="mt-0.5 text-[15px] font-extrabold">{o.title}</div>
      {o.detail && <div className="text-[12.5px] font-semibold opacity-80" dir="rtl">{o.detail}</div>}
      {o.hint && <div className="mt-1 text-[12px] font-semibold opacity-80">{o.hint}</div>}
      {o.state === 'none' && <div className="mt-1 text-[12px] font-semibold">اسأله أولًا: أي عرض يهمّه؟</div>}
    </div>
  )
}
