'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Star } from 'lucide-react'
import { getPlan, type Plan } from '@/data/plans'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import { BTN_NAVY, CARD, CTA_GOLD, NavyGround, fmtMad } from './kit'

/**
 * The options of one way to learn — at most three cards, one recommended.
 *
 * An option is either a plan, or a "pick your level" card that switches
 * between several plans (the four single levels) so they take one card
 * instead of four. Each card has one button (subscribe: the form records the
 * lead, then hands over to WhatsApp) and a quiet link to the full page.
 * Everything commercial comes from src/data/plans.ts.
 *
 * Navy, gold and white only. The recommended card is the navy one — white
 * type, the gold button — so it is the first thing the eye lands on; the
 * others are white cards with a solid navy button. Nothing dark sits on navy.
 */

export type Option =
  | { kind: 'plan'; planId: string; recommended?: boolean; label?: string }
  | { kind: 'pick'; planIds: string[]; title: string; sub: string; recommended?: boolean }

const months = (n: number) => `${n} ${n >= 3 && n <= 10 ? 'أشهر' : n === 1 ? 'شهر' : 'شهراً'}`

export default function OfferOptions({ options, source }: { options: Option[]; source: string }) {
  return (
    <div className={`grid gap-5 lg:gap-6 items-stretch ${options.length >= 3 ? 'lg:grid-cols-3' : options.length === 2 ? 'md:grid-cols-2 max-w-[880px] mx-auto' : 'max-w-[460px] mx-auto'}`}>
      {options.map((o, i) => <OptionCard key={i} option={o} source={source} />)}
    </div>
  )
}

function OptionCard({ option, source }: { option: Option; source: string }) {
  const plans = (option.kind === 'pick' ? option.planIds : [option.planId]).map(id => getPlan(id)).filter(Boolean) as Plan[]
  const [idx, setIdx] = useState(0)
  const plan = plans[Math.min(idx, plans.length - 1)]
  if (!plan) return null

  const dark = !!option.recommended
  const title = option.kind === 'pick' ? option.title : option.label ?? plan.title_ar
  const sub = option.kind === 'pick' ? option.sub : plan.subtitle_ar
  const save = plan.originalAmount && plan.originalAmount > plan.amount_mad ? plan.originalAmount - plan.amount_mad : 0
  const span = plan.levelFrom && plan.levelTo ? `${plan.levelFrom} → ${plan.levelTo}` : null
  // Separate parts, each isolated (<bdi>): "A0 → A1" next to Arabic otherwise reorders.
  const meta: string[] = plan.isClass
    ? [`${plan.sessionsIncluded} × ${plan.sessionDuration}`, `${fmtMad(Math.round(plan.amount_mad / (plan.sessionsIncluded || 1)))} للحصة`]
    : [span, months(plan.duration_months), plan.followUpLabel_ar].filter((x): x is string => !!x)
  const points = plan.lifetimePerks.slice(0, 4)
  const label = option.kind === 'pick' ? plan.title_ar : title

  const body = (
    <div className="relative flex flex-col h-full p-6 sm:p-7">
      {dark && (
        <span className="absolute -top-0 left-6 inline-flex items-center gap-1 rounded-b-xl bg-gradient-to-b from-amber-200 to-amber-400 px-3 py-1.5 text-[12px] font-extrabold text-[#0B1B4D] shadow-[0_8px_18px_-6px_rgba(245,158,11,0.8)]">
          <Star size={12} className="fill-[#0B1B4D]" /> ننصح به
        </span>
      )}

      <h3 className={`text-[22px] font-black ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
      <p className={`mt-1 text-[14.5px] font-semibold ${dark ? 'text-blue-100/85' : 'text-slate-600'}`}>{sub}</p>

      {option.kind === 'pick' && plans.length > 1 && (
        <div role="radiogroup" aria-label="اختر المستوى" className={`mt-4 grid grid-cols-2 gap-1.5 rounded-2xl p-1.5 ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
          {plans.map((p, i) => (
            <button key={p.id} type="button" role="radio" aria-checked={i === idx} onClick={() => setIdx(i)}
              className={`rounded-xl px-2 py-2.5 text-[13.5px] font-extrabold transition-all ${
                i === idx
                  ? dark ? 'bg-amber-300 text-[#0B1B4D] shadow-[0_8px_16px_-8px_rgba(245,158,11,0.9)]'
                         : 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_8px_16px_-8px_rgba(30,64,175,0.8)]'
                  : dark ? 'text-blue-50 hover:bg-white/10' : 'text-slate-700 hover:bg-white'}`}>
              <span dir="ltr">{p.levelFrom} → {p.levelTo}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
        <span className={`text-[40px] leading-none font-black tracking-tight ${dark ? 'text-white' : 'text-brand-900'}`}>{plan.amount_mad.toLocaleString('en-US')}</span>
        <span className={`text-[16px] font-extrabold ${dark ? 'text-blue-100' : 'text-brand-800'}`}>د.م</span>
        {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
          <span className={`text-[15px] font-semibold line-through ${dark ? 'text-blue-200/60' : 'text-slate-400'}`}>{plan.originalAmount.toLocaleString('en-US')}</span>
        )}
        {save > 0 && (
          <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-extrabold ${dark ? 'bg-amber-300/20 text-amber-200 ring-1 ring-amber-300/40' : 'bg-amber-100 text-amber-800'}`}>
            وفّر {save.toLocaleString('en-US')}
          </span>
        )}
      </div>
      <ApproxPrice mad={plan.amount_mad} className={`mt-1 text-[13px] font-semibold ${dark ? 'text-blue-100/80' : 'text-slate-500'}`} />
      <div className={`mt-2 text-[13px] font-semibold ${dark ? 'text-blue-100/80' : 'text-slate-600'}`}>
        {meta.map((m, i) => <span key={m}>{i > 0 && ' · '}<bdi>{m}</bdi></span>)}
      </div>

      <div className={`my-5 h-px ${dark ? 'bg-white/15' : 'bg-slate-100'}`} />

      <ul className="space-y-2.5">
        {points.map(p => (
          <li key={p} className={`flex items-start gap-2.5 text-[14.5px] font-semibold ${dark ? 'text-blue-50' : 'text-slate-800'}`}>
            <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${dark ? 'bg-amber-300 text-[#0B1B4D]' : 'bg-brand-100 text-brand-800'}`}>
              <Check size={12} strokeWidth={3.2} />
            </span>
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <button type="button" onClick={() => openSubscribe({ source: `${source}_${plan.id}`, planId: plan.id })}
          className={`w-full py-4 text-[16px] ${dark ? CTA_GOLD : BTN_NAVY}`}>
          اشترك في {label} <ArrowLeft size={18} />
        </button>
        <Link href={`/pricing/${plan.id}`}
          className={`mt-3 block text-center text-[13.5px] font-bold no-underline ${dark ? 'text-blue-100 hover:text-white' : 'text-brand-700 hover:text-brand-900'}`}>
          كل تفاصيل {option.kind === 'pick' ? plan.title_ar : 'الباقة'} ←
        </Link>
      </div>
    </div>
  )

  return dark ? (
    <article className="ig-reveal relative rounded-[28px] overflow-hidden ring-2 ring-amber-300/70 shadow-[0_34px_70px_-26px_rgba(11,27,77,0.85)] transition-transform duration-300 hover:-translate-y-1 lg:scale-[1.03]">
      <NavyGround className="h-full">{body}</NavyGround>
    </article>
  ) : (
    <article className={`ig-reveal relative ${CARD}`}>{body}</article>
  )
}
