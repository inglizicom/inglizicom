'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Compass, Info, Lock, MessageCircle, Repeat, Shield, Sparkles,
  Star, Users,
} from 'lucide-react'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import CountUp from '@/components/pricing/CountUp'
import { CARD, CTA_GOLD, FaqList, ICON_TILE, NavyGround, SectionTitle } from '@/components/site/kit'
import StickyPlanBar from './StickyPlanBar'
import { readPlacement, type Placement } from '@/lib/placement-handoff'
import { getPlan, PAYMENT_WHATSAPP } from '@/data/plans'
import { PLAN_NEIGHBOURS } from '@/data/plan-pages'
import { STATS } from '@/data/testimonials'
import type { Plan } from '@/data/plans'
import type { PlanPage } from '@/data/plan-pages'

/**
 * One package's page (/pricing/[plan]): the promise, the price and the one
 * action above the fold on the navy ground; then before → after, the journey,
 * what is included, who it is not for, the neighbouring packages, the
 * questions, and the action again.
 *
 * Navy, gold and white only — every package looks like the same product;
 * nothing dark ever sits on navy (white and gold type there). The level-test
 * result follows the visitor here (placement handoff) and says whether this is
 * the package that was suggested.
 */

const months = (n: number) => `${n} ${n === 1 ? 'شهر' : n <= 10 ? 'أشهر' : 'شهراً'}`

export default function PlanPageClient({ plan, page }: { plan: Plan; page: PlanPage }) {
  const [split, setSplit] = useState(false)          // one payment ⇄ two instalments

  /* Read after mount — the value is per-session, so it must not reach the prerendered HTML. */
  const [placement, setPlacement] = useState<Placement | null>(null)
  useEffect(() => { setPlacement(readPlacement()) }, [])
  const placedHere = placement?.planId === plan.id
  const placedPlan = placement && !placedHere ? getPlan(placement.planId) : null

  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad ? plan.originalAmount - plan.amount_mad : null
  const perInstalment = Math.ceil(plan.amount_mad / 2 / 50) * 50   // rounded to a clean 50
  const shownAmount = split ? perInstalment : plan.amount_mad
  const neighbours = (PLAN_NEIGHBOURS[plan.id] ?? []).map(getPlan).filter((p): p is Plan => Boolean(p))
  const subscribe = (where: string) => openSubscribe({ source: `plan_page_${plan.id}_${where}`, planId: plan.id })
  const levelLabel = plan.levelFrom && plan.levelTo
    ? `${plan.levelFrom} → ${plan.levelTo}`
    : plan.isClass ? `${plan.sessionsIncluded} × ${plan.sessionDuration}` : 'برنامج مهني'
  const action = plan.isClass ? 'احجز الحصص' : 'اشترك الآن'

  return (
    <div dir="rtl" className="bg-white text-slate-950">

      {/* ════════ HERO: promise + offer ════════ */}
      <NavyGround className="pt-[88px] sm:pt-[112px] pb-16 sm:pb-24 px-5 sm:px-6">
        <div className="max-w-[1150px] mx-auto">
          <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-[13px] font-bold text-blue-200/80 mb-7">
            <Link href="/pricing" className="text-blue-100 hover:text-white no-underline">الأسعار</Link>
            <span>/</span>
            <span className="text-white">{plan.title_ar}</span>
          </nav>

          {placement && (
            <div className={`ig-pop mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-4 py-3 text-[14px] ring-1 ${placedHere ? 'bg-amber-300/15 ring-amber-300/40' : 'bg-white/10 ring-white/20'}`}>
              <Compass className="w-4 h-4 shrink-0 text-amber-300" />
              <span className="text-blue-50">نتيجة اختبارك: <span className="font-black text-white">{placement.level}</span></span>
              {placedHere ? (
                <span className="font-black text-amber-300">— وهذه هي الباقة المقترحة لك</span>
              ) : placedPlan ? (
                <Link href={`/pricing/${placedPlan.id}`} className="inline-flex items-center gap-1.5 font-black text-amber-300 hover:text-amber-200 no-underline">
                  — المقترحة لك: {placedPlan.title_ar} <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </div>
          )}

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
            {/* the story */}
            <div>
              <div className="ig-pop flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1.5 text-[12.5px] font-extrabold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> <bdi>{levelLabel}</bdi>
                </span>
                {plan.badge_ar && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-200 to-amber-400 px-3 py-1.5 text-[12.5px] font-extrabold text-[#0B1B4D]">
                    <Star className="w-3 h-3 fill-[#0B1B4D]" /> {plan.badge_ar}
                  </span>
                )}
              </div>
              <h1 className="ig-pop mt-5 text-[36px] sm:text-[52px] font-black leading-[1.12] tracking-tight text-white [animation-delay:80ms]">{plan.title_ar}</h1>
              <p className="ig-pop mt-4 text-[19px] sm:text-[22px] font-black leading-relaxed bg-gradient-to-l from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent [animation-delay:160ms]">
                {page.promise_ar}
              </p>
              <p className="ig-pop mt-4 text-[16px] sm:text-[17.5px] leading-relaxed text-blue-100/90 [animation-delay:220ms]">{plan.idealFor_ar ?? plan.subtitle_ar}</p>
              <div className="ig-pop mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-blue-100/90 [animation-delay:280ms]">
                <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-300" /><span className="font-black text-white">+{STATS.students.toLocaleString('en-US')}</span> طالب</span>
                <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /><span className="font-black text-white">{STATS.rating}</span>/5</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-amber-300" />{months(plan.duration_months)}</span>
              </div>
            </div>

            {/* the offer */}
            <div className="ig-pop relative rounded-[28px] bg-white p-6 sm:p-7 ring-1 ring-white/50 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)] lg:sticky lg:top-24 [animation-delay:200ms]">
              <div role="radiogroup" aria-label="طريقة الدفع" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                {[{ key: false, label: 'دفعة واحدة' }, { key: true, label: 'على دفعتين' }].map(opt => (
                  <button key={String(opt.key)} type="button" role="radio" aria-checked={split === opt.key} onClick={() => setSplit(opt.key)}
                    className={`rounded-lg py-2.5 text-[13.5px] font-extrabold transition-all ${split === opt.key ? 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_8px_16px_-8px_rgba(30,64,175,0.8)]' : 'text-slate-600 hover:text-brand-800'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-baseline gap-2 flex-wrap">
                <span key={String(split)} className="ig-pop text-[52px] leading-none font-black text-brand-900 tabular-nums"><CountUp to={shownAmount} /></span>
                <span className="text-[16px] font-extrabold text-brand-800">درهم</span>
                {split && <span className="text-[14px] font-bold text-slate-500">× دفعتين</span>}
              </div>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                {!split && plan.originalAmount && plan.originalAmount > plan.amount_mad && (
                  <span className="text-[14px] font-semibold text-slate-400 line-through">{plan.originalAmount.toLocaleString('en-US')} درهم</span>
                )}
                {!split && savings && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[13px] font-extrabold text-amber-800">وفّر {savings.toLocaleString('en-US')} درهم</span>
                )}
                <ApproxPrice mad={shownAmount} className="text-[13px] font-bold text-slate-500" />
              </div>
              {split && (
                <p className="mt-3 rounded-xl bg-brand-50 p-3 text-[13px] leading-relaxed text-brand-900">
                  <Info className="w-3.5 h-3.5 inline-block ml-1 text-brand-700" />
                  الدفعة الأولى تفتح لك البرنامج مباشرة، والثانية تُجدول معك على واتساب. المجموع {plan.amount_mad.toLocaleString('en-US')} درهم — بدون أي زيادة.
                </p>
              )}

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 ring-1 ring-brand-100 p-3.5">
                <span className={`w-10 h-10 ${ICON_TILE}`}><Repeat size={18} /></span>
                <div>
                  <div className="text-[14.5px] font-extrabold text-brand-900">{plan.followUpLabel_ar}</div>
                  <div className="text-[13px] font-semibold text-brand-700/80">{plan.followUpDuration_ar}</div>
                </div>
              </div>

              <button type="button" onClick={() => subscribe('hero')} className={`${CTA_GOLD} mt-5 w-full py-4 text-[17px]`}>
                {action} <ArrowLeft className="w-5 h-5" />
              </button>
              <a href={`https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، عندي سؤال حول ${plan.title_ar}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-brand-200 hover:ring-brand-400 py-3 text-[14.5px] font-extrabold text-brand-800 no-underline transition-all">
                <MessageCircle className="w-4 h-4" /> اسأل قبل ما تشترك
              </a>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[{ icon: Shield, label: 'ضمان أسبوع' }, { icon: Clock, label: 'تفعيل 24h' }, { icon: Lock, label: 'بدون تجديد تلقائي' }].map(t => (
                  <div key={t.label} className="rounded-xl bg-slate-50 ring-1 ring-slate-100 py-2.5 px-1">
                    <t.icon className="w-4 h-4 mx-auto mb-1 text-brand-700" />
                    <div className="text-[11px] font-bold leading-tight text-slate-700">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </NavyGround>

      {/* ════════ BEFORE → AFTER ════════ */}
      <section className="py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <SectionTitle kicker="التحوّل" title="أين أنت الآن — وأين تصل" />
          <div className="mt-10 grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
            <div className={`ig-reveal p-6 sm:p-7 ${CARD}`}>
              <div className="text-[12.5px] font-extrabold text-slate-500">اليوم</div>
              <p className="mt-2 text-[16px] leading-relaxed text-slate-700">{page.before_ar}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className={`w-12 h-12 rotate-90 md:rotate-0 ${ICON_TILE}`}><ArrowLeft size={20} /></span>
            </div>
            <div className="ig-reveal rounded-3xl overflow-hidden shadow-[0_26px_50px_-22px_rgba(11,27,77,0.7)]">
              <NavyGround className="h-full p-6 sm:p-7">
                <div className="text-[12.5px] font-extrabold text-amber-300">بعد {months(plan.duration_months)}</div>
                <p className="mt-2 text-[16.5px] leading-relaxed font-semibold text-white">{page.after_ar}</p>
              </NavyGround>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ JOURNEY ════════ */}
      <section className="bg-gradient-to-b from-brand-50 via-[#F3F7FF] to-white py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[760px] mx-auto">
          <SectionTitle kicker="الطريق" title="كيف تمرّ الرحلة، خطوة بخطوة" />
          <ol className="relative mt-10 space-y-4">
            <div aria-hidden className="absolute right-[23px] top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-brand-300 via-amber-300 to-brand-300" />
            {page.journey.map((step, i) => (
              <li key={i} className="ig-reveal relative flex gap-4">
                <span className="relative z-10 w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-[#0B1B4D] font-black text-[19px] flex items-center justify-center shadow-[0_10px_22px_-8px_rgba(245,158,11,0.8)]">{i + 1}</span>
                <div className={`flex-1 p-5 ${CARD}`}>
                  <div className="text-[12.5px] font-extrabold text-brand-700">{step.when}</div>
                  <h3 className="mt-1 text-[18px] font-black text-slate-950">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ════════ WHAT YOU GET ════════ */}
      <section className="py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <SectionTitle kicker="المحتوى" title="ما الذي تحصل عليه بالضبط" />
          <ul className="mt-10 grid sm:grid-cols-2 gap-3">
            {plan.lifetimePerks.map(perk => (
              <li key={perk} className={`ig-reveal flex items-start gap-3 p-4 ${CARD}`}>
                <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-white flex items-center justify-center shadow-[0_6px_12px_-6px_rgba(30,64,175,0.8)]"><Check size={15} strokeWidth={3} /></span>
                <span className="text-[15px] font-semibold leading-relaxed text-slate-800">{perk}</span>
              </li>
            ))}
          </ul>

          {plan.monthlyPerks.length > 0 && (
            <div className="ig-reveal mt-5 rounded-3xl overflow-hidden shadow-[0_26px_50px_-22px_rgba(11,27,77,0.7)]">
              <NavyGround className="p-6 sm:p-7">
                <h3 className="flex items-center gap-2 text-[17px] font-black text-white"><Repeat className="w-5 h-5 text-amber-300" /> ومستمرّ معك طوال المدة</h3>
                <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {plan.monthlyPerks.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-[15px] text-blue-50">
                      <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-amber-300 text-[#0B1B4D] flex items-center justify-center"><Check size={12} strokeWidth={3} /></span>{p}
                    </li>
                  ))}
                </ul>
              </NavyGround>
            </div>
          )}

          {plan.includesPrevious_ar && (
            <div className="ig-reveal mt-4 rounded-2xl bg-brand-50 ring-1 ring-brand-100 p-4 text-center text-[15px] font-extrabold text-brand-900">
              ✓ {plan.includesPrevious_ar}
            </div>
          )}

          {page.notFor_ar && (
            <div className={`ig-reveal mt-6 flex items-start gap-4 p-6 border-r-4 border-amber-400 ${CARD}`}>
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[15.5px] font-black text-slate-950">هذه الباقة ليست لك إذا…</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{page.notFor_ar}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════ COMPARE ════════ */}
      {neighbours.length > 0 && (
        <section className="bg-gradient-to-b from-brand-50 via-[#F3F7FF] to-white py-16 sm:py-24 px-5 sm:px-6">
          <div className="max-w-[1000px] mx-auto">
            <SectionTitle kicker="المقارنة" title="تتردّد بينها وبين غيرها؟" />
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              <div className="ig-reveal rounded-3xl overflow-hidden shadow-[0_26px_50px_-22px_rgba(11,27,77,0.7)] ring-2 ring-amber-300">
                <NavyGround className="h-full p-6">
                  <div className="text-[12px] font-extrabold text-amber-300">أنت هنا</div>
                  <h3 className="mt-2 text-[19px] font-black text-white">{plan.title_ar}</h3>
                  <div className="mt-2 text-[28px] font-black text-white">{plan.amount_mad.toLocaleString('en-US')} <span className="text-[14px] font-bold text-blue-100/80">درهم</span></div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-blue-100/85">{plan.subtitle_ar}</p>
                </NavyGround>
              </div>
              {neighbours.map(n => {
                const diff = n.amount_mad - plan.amount_mad
                return (
                  <Link key={n.id} href={`/pricing/${n.id}`} className={`ig-reveal group block p-6 no-underline ${CARD}`}>
                    <div className="text-[12px] font-extrabold text-slate-500">
                      {diff > 0 ? `+${diff.toLocaleString('en-US')} درهم` : diff < 0 ? `${Math.abs(diff).toLocaleString('en-US')} درهم أقل` : 'نفس السعر'}
                    </div>
                    <h3 className="mt-2 text-[19px] font-black text-slate-950">{n.title_ar}</h3>
                    <div className="mt-2 text-[28px] font-black text-brand-900">{n.amount_mad.toLocaleString('en-US')} <span className="text-[14px] font-bold text-slate-500">درهم</span></div>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{n.subtitle_ar}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-extrabold text-brand-700">
                      شوف التفاصيل <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-7 text-center">
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[14.5px] font-extrabold text-brand-700 no-underline hover:underline">
                <ArrowRight className="w-4 h-4" /> رجوع لكل الباقات
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════ QUESTIONS ════════ */}
      <section className="py-16 sm:py-24 px-5 sm:px-6">
        <SectionTitle kicker="قبل ما تقرّر" title="الأسئلة التي تدور في بالك الآن" />
        <div className="mt-10"><FaqList items={page.objections} /></div>
      </section>

      {/* ════════ FINAL ACTION ════════ */}
      <section className="px-5 sm:px-6 pb-24 sm:pb-28">
        <div className="ig-reveal max-w-[900px] mx-auto rounded-[32px] overflow-hidden shadow-[0_30px_60px_-24px_rgba(11,27,77,0.65)]">
          <NavyGround className="text-center px-6 py-12 sm:py-16">
            <h2 className="text-[28px] sm:text-[40px] font-black leading-tight text-white">{plan.title_ar}</h2>
            <p className="mt-3 text-[16px] sm:text-[18px] leading-relaxed text-blue-100/90 max-w-[34rem] mx-auto">{page.promise_ar}</p>
            <div className="mt-6 flex items-baseline justify-center gap-2">
              <span className="text-[44px] font-black text-white">{plan.amount_mad.toLocaleString('en-US')}</span>
              <span className="text-[16px] font-bold text-blue-100/85">درهم</span>
              {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
                <span className="text-[15px] text-blue-200/60 line-through">{plan.originalAmount.toLocaleString('en-US')}</span>
              )}
            </div>
            <button type="button" onClick={() => subscribe('footer')} className={`${CTA_GOLD} mt-7 px-10 py-4 text-[17px]`}>
              {action} <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="mt-4 text-[13px] font-semibold text-blue-200/80">ضمان الأسبوع الأول · تفعيل خلال 24 ساعة · بدون تجديد تلقائي</p>
          </NavyGround>
        </div>
      </section>

      <StickyPlanBar plan={plan} onSubscribe={() => subscribe('sticky')} />
    </div>
  )
}
