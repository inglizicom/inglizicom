'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPlan, type Plan } from '@/data/plans'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import { BTN_NAVY, CARD, Points, fmtMad } from './kit'

/**
 * The options of one way to learn — at most three cards, one recommended.
 *
 * An option is either a plan, or a "pick your level" card that switches
 * between several plans (the four single levels) so they take one card
 * instead of four. Each card has one button (subscribe: the form records the
 * lead, then hands over to WhatsApp) and a quiet link to the full page.
 * Everything commercial comes from src/data/plans.ts.
 */

export type Option =
  | { kind: 'plan'; planId: string; recommended?: boolean; label?: string }
  | { kind: 'pick'; planIds: string[]; title: string; sub: string; recommended?: boolean }

const months = (n: number) => `${n} ${n >= 3 && n <= 10 ? 'أشهر' : n === 1 ? 'شهر' : 'شهراً'}`

export default function OfferOptions({ options, source }: { options: Option[]; source: string }) {
  return (
    <div className={`grid gap-4 lg:gap-5 items-stretch ${options.length >= 3 ? 'lg:grid-cols-3' : options.length === 2 ? 'md:grid-cols-2 max-w-[860px] mx-auto' : 'max-w-[460px] mx-auto'}`}>
      {options.map((o, i) => <OptionCard key={i} option={o} source={source} />)}
    </div>
  )
}

function OptionCard({ option, source }: { option: Option; source: string }) {
  const plans = (option.kind === 'pick' ? option.planIds : [option.planId]).map(id => getPlan(id)).filter(Boolean) as Plan[]
  const [idx, setIdx] = useState(0)
  const plan = plans[Math.min(idx, plans.length - 1)]
  if (!plan) return null

  const recommended = !!option.recommended
  const title = option.kind === 'pick' ? option.title : option.label ?? plan.title_ar
  const sub = option.kind === 'pick' ? option.sub : plan.subtitle_ar
  const save = plan.originalAmount && plan.originalAmount > plan.amount_mad ? plan.originalAmount - plan.amount_mad : 0
  const span = plan.levelFrom && plan.levelTo ? `${plan.levelFrom} → ${plan.levelTo}` : null
  // Separate parts, each isolated (<bdi>): "A0 → A1" next to Arabic otherwise reorders.
  const meta: string[] = plan.isClass
    ? [`${plan.sessionsIncluded} × ${plan.sessionDuration}`, `${fmtMad(Math.round(plan.amount_mad / (plan.sessionsIncluded || 1)))} للحصة`]
    : [span, months(plan.duration_months), plan.followUpLabel_ar].filter((x): x is string => !!x)
  const points = plan.lifetimePerks.slice(0, 4)

  return (
    <article className={`ig-reveal relative flex flex-col p-6 sm:p-7 ${recommended
      ? 'rounded-3xl bg-white ring-2 ring-brand-600 shadow-[0_30px_60px_-24px_rgba(30,64,175,0.55)] transition-transform duration-300 hover:-translate-y-1'
      : CARD}`}>
      {recommended && (
        <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-l from-amber-300 to-amber-400 text-slate-950 text-[12px] font-extrabold px-3 py-1 shadow-[0_8px_18px_-6px_rgba(245,158,11,0.8)]">★ ننصح به</span>
      )}
      <h3 className="text-[21px] font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-[14.5px] font-semibold text-slate-500">{sub}</p>

      {option.kind === 'pick' && plans.length > 1 && (
        <div role="radiogroup" aria-label="اختر المستوى" className="mt-4 grid grid-cols-2 gap-1.5">
          {plans.map((p, i) => (
            <button key={p.id} type="button" role="radio" aria-checked={i === idx} onClick={() => setIdx(i)}
              className={`rounded-xl px-2 py-2 text-[13px] font-bold transition-colors ${i === idx ? 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_8px_16px_-8px_rgba(30,64,175,0.8)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <span dir="ltr">{p.levelFrom} → {p.levelTo}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[34px] font-black text-slate-950">{fmtMad(plan.amount_mad)}</span>
        {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
          <span className="text-[15px] font-semibold text-slate-400 line-through">{plan.originalAmount.toLocaleString('en-US')}</span>
        )}
        {save > 0 && <span className="rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-extrabold px-2 py-0.5">وفّر {save.toLocaleString('en-US')}</span>}
      </div>
      <ApproxPrice mad={plan.amount_mad} className="text-[13px] font-semibold text-slate-500" />
      <div className="mt-1 text-[13px] font-semibold text-slate-500">
        {meta.map((m, i) => <span key={m}>{i > 0 && ' · '}<bdi>{m}</bdi></span>)}
      </div>

      <div className="mt-5"><Points items={points} /></div>

      <div className="mt-auto pt-6">
        <button type="button" onClick={() => openSubscribe({ source: `${source}_${plan.id}`, planId: plan.id })}
          className={`w-full py-3.5 text-[15.5px] ${recommended
            ? BTN_NAVY
            : 'flex items-center justify-center gap-2 rounded-2xl font-extrabold bg-white ring-1 ring-slate-300 hover:ring-brand-400 hover:text-brand-800 text-slate-900 transition-all'}`}>
          اشترك في {option.kind === 'pick' ? plan.title_ar : title} <ArrowLeft size={17} />
        </button>
        <Link href={`/pricing/${plan.id}`} className="mt-2.5 block text-center text-[13.5px] font-bold text-slate-500 hover:text-brand-700 no-underline">
          كل تفاصيل {option.kind === 'pick' ? plan.title_ar : 'الباقة'}
        </Link>
      </div>
    </article>
  )
}
