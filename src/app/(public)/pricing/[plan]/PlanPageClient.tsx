'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, ArrowLeft, ArrowRight, Flame, Shield, Clock, MessageCircle, Sparkles,
  Star, Users, CalendarDays, Repeat, Info, ChevronDown, Lock, Compass,
} from 'lucide-react'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import CountUp from '@/components/pricing/CountUp'
import StickyPlanBar from './StickyPlanBar'
import { COLOR_STYLES } from '@/components/pricing/PlanCards'
import { readPlacement, type Placement } from '@/lib/placement-handoff'
import { getPlan, PAYMENT_WHATSAPP } from '@/data/plans'
import { PLAN_NEIGHBOURS } from '@/data/plan-pages'
import { STATS } from '@/data/testimonials'
import type { Plan } from '@/data/plans'
import type { PlanPage } from '@/data/plan-pages'

/* Full class strings so Tailwind's scanner keeps them. */
const AURA: Record<Plan['color'], string> = {
  emerald: 'from-emerald-500/25 via-teal-500/10',
  blue:    'from-blue-500/25 via-cyan-500/10',
  violet:  'from-violet-500/25 via-fuchsia-500/10',
  orange:  'from-orange-500/25 via-amber-500/10',
  amber:   'from-amber-500/25 via-yellow-500/10',
  slate:   'from-slate-400/20 via-slate-500/10',
  rose:    'from-rose-500/25 via-pink-500/10',
  cyan:    'from-cyan-500/25 via-sky-500/10',
}

const GRAD_TEXT: Record<Plan['color'], string> = {
  emerald: 'from-emerald-300 to-teal-400',
  blue:    'from-blue-300 to-cyan-400',
  violet:  'from-violet-300 to-fuchsia-400',
  orange:  'from-orange-300 to-amber-400',
  amber:   'from-amber-200 to-yellow-400',
  slate:   'from-slate-200 to-slate-400',
  rose:    'from-rose-300 to-pink-400',
  cyan:    'from-cyan-300 to-sky-400',
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
}
const riseItem = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function PlanPageClient({ plan, page }: { plan: Plan; page: PlanPage }) {
  const c = COLOR_STYLES[plan.color]
  const [split, setSplit] = useState(false)          // one payment ⇄ two instalments
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  /* Read after mount — the value is per-session, so it must not reach the
     prerendered HTML. */
  const [placement, setPlacement] = useState<Placement | null>(null)
  useEffect(() => { setPlacement(readPlacement()) }, [])

  const placedHere = placement?.planId === plan.id
  const placedPlan = placement && !placedHere ? getPlan(placement.planId) : null

  const savings = plan.originalAmount && plan.originalAmount > plan.amount_mad
    ? plan.originalAmount - plan.amount_mad
    : null
  const perInstalment = Math.ceil(plan.amount_mad / 2 / 50) * 50   // rounded to a clean 50
  const shownAmount   = split ? perInstalment : plan.amount_mad

  const neighbours = (PLAN_NEIGHBOURS[plan.id] ?? [])
    .map(getPlan)
    .filter((p): p is Plan => Boolean(p))

  const subscribe = (where: string) =>
    openSubscribe({ source: `plan_page_${plan.id}_${where}`, planId: plan.id })

  const levelLabel = plan.levelFrom && plan.levelTo
    ? `${plan.levelFrom} → ${plan.levelTo}`
    : plan.isClass ? `${plan.sessionsIncluded} × ${plan.sessionDuration}` : 'برنامج مهني'

  return (
    <main className="min-h-screen bg-[#050d1a] pt-[80px] pb-28 overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="relative">
        {/* animated aura */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`pointer-events-none absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/3 w-[680px] h-[680px] rounded-full blur-3xl bg-gradient-to-b ${AURA[plan.color]} to-transparent`}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-8">
          {/* breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8"
            aria-label="مسار التنقل"
          >
            <Link href="/pricing" className="hover:text-gray-300 transition-colors">الأسعار</Link>
            <span>/</span>
            <span className="text-gray-300">{plan.title_ar}</span>
          </motion.nav>

          {/* Carried over from the level test — the visitor's result follows them here. */}
          <AnimatePresence>
            {placement && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-4 py-3 text-sm ${
                  placedHere
                    ? `${c.pillBg} border-white/10`
                    : 'bg-[#0a1628] border-[#1a2d4a]'
                }`}
              >
                <Compass className={`w-4 h-4 shrink-0 ${placedHere ? c.accent : 'text-gray-500'}`} />
                <span className="text-gray-400">
                  نتيجة اختبارك:{' '}
                  <span className="text-white font-black">{placement.level}</span>
                </span>
                {placedHere ? (
                  <span className={`font-black ${c.accent}`}>— وهذه هي الباقة المقترحة لك</span>
                ) : placedPlan ? (
                  <Link
                    href={`/pricing/${placedPlan.id}`}
                    className="inline-flex items-center gap-1.5 font-black text-amber-400 hover:text-amber-300 transition-colors no-underline"
                  >
                    — المقترحة لك: {placedPlan.title_ar} <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-start">

            {/* ── right column: the story ── */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={riseItem} className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`inline-flex items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-3 py-1.5 rounded-full`}>
                  <Sparkles className="w-3 h-3" /> {levelLabel}
                </span>
                {plan.badge_ar && (
                  <span className="inline-flex items-center bg-amber-500 text-gray-900 text-[11px] font-black px-3 py-1.5 rounded-full">
                    {plan.badge_ar}
                  </span>
                )}
              </motion.div>

              <motion.h1 variants={riseItem} className="text-white font-black text-4xl sm:text-5xl leading-[1.15] mb-4">
                {plan.title_ar}
              </motion.h1>

              <motion.p
                variants={riseItem}
                className={`text-transparent bg-clip-text bg-gradient-to-l ${GRAD_TEXT[plan.color]} font-black text-lg sm:text-xl leading-relaxed mb-5`}
              >
                {page.promise_ar}
              </motion.p>

              <motion.p variants={riseItem} className="text-gray-400 leading-relaxed mb-7">
                {plan.idealFor_ar ?? plan.subtitle_ar}
              </motion.p>

              <motion.div variants={riseItem} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-black">+{STATS.students}</span> طالب
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-black">{STATS.rating}</span>/5
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-amber-400" />
                  {plan.duration_months} {plan.duration_months === 1 ? 'شهر' : 'أشهر'}
                </span>
              </motion.div>
            </motion.div>

            {/* ── left column: the offer box ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`relative bg-[#0a1628]/90 backdrop-blur border-2 ${c.border} ring-2 ${c.ring} rounded-3xl p-6 lg:sticky lg:top-24`}
            >
              {/* payment mode toggle */}
              <div className="flex items-center gap-1 bg-[#050d1a] border border-[#1a2d4a] rounded-xl p-1 mb-5">
                {[
                  { key: false, label: 'دفعة واحدة' },
                  { key: true,  label: 'على دفعتين' },
                ].map(opt => (
                  <button
                    key={String(opt.key)}
                    type="button"
                    onClick={() => setSplit(opt.key)}
                    className="relative flex-1 py-2 text-xs font-black rounded-lg transition-colors"
                    aria-pressed={split === opt.key}
                  >
                    {split === opt.key && (
                      <motion.span
                        layoutId={`pay-toggle-${plan.id}`}
                        className="absolute inset-0 bg-white/10 rounded-lg"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative ${split === opt.key ? 'text-white' : 'text-gray-500'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={String(split)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-white font-black text-5xl tabular-nums"
                  >
                    <CountUp to={shownAmount} />
                  </motion.span>
                </AnimatePresence>
                <span className="text-gray-400 font-bold">درهم</span>
                {split && <span className="text-gray-500 text-sm font-bold">× 2 دفعة</span>}
              </div>

              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <ApproxPrice mad={shownAmount} className={`${c.accent} text-sm font-bold`} />
                {!split && plan.originalAmount && (
                  <span className="text-gray-600 text-sm line-through">
                    {plan.originalAmount.toLocaleString()} درهم
                  </span>
                )}
              </div>

              {!split && savings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-black px-3 py-1.5 rounded-lg"
                >
                  <Flame className="w-4 h-4" /> وفّر {savings.toLocaleString()} درهم
                </motion.div>
              )}

              {split && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 text-gray-400 text-xs leading-relaxed bg-white/5 rounded-lg p-3"
                >
                  <Info className="w-3.5 h-3.5 inline-block ml-1 text-gray-500" />
                  الدفعة الأولى تفتح لك البرنامج مباشرة، والثانية تُجدول معك على واتساب.
                  المجموع {plan.amount_mad.toLocaleString()} درهم — بدون أي زيادة.
                </motion.p>
              )}

              <div className={`mt-5 ${c.pillBg} border border-white/5 rounded-xl p-3.5`}>
                <div className="text-white text-sm font-black">{plan.followUpLabel_ar}</div>
                <div className="text-gray-400 text-xs mt-0.5">{plan.followUpDuration_ar}</div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => subscribe('hero')}
                className={`mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-colors ${c.ctaBg}`}
              >
                {plan.isClass ? 'احجز الحصص' : 'اشترك الآن'} <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <a
                href={`https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، عندي سؤال حول ${plan.title_ar}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#1e3455] text-gray-300 hover:text-white hover:border-emerald-500/40 font-bold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> اسأل قبل ما تشترك
              </a>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Shield, label: 'ضمان أسبوع' },
                  { icon: Clock,  label: 'تفعيل 24h' },
                  { icon: Lock,   label: 'بدون تجديد تلقائي' },
                ].map(t => (
                  <div key={t.label} className="bg-white/5 rounded-lg py-2.5 px-1">
                    <t.icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-gray-400 leading-tight">{t.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ BEFORE → AFTER ════════ */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <SectionTitle eyebrow="التحوّل" title="أين أنت الآن — وأين تصل" />

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-3 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
            className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6"
          >
            <div className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-3">اليوم</div>
            <p className="text-gray-400 leading-relaxed">{page.before_ar}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className={`w-11 h-11 rounded-full ${c.pillBg} border border-white/10 flex items-center justify-center rotate-90 md:rotate-0`}>
              <ArrowLeft className={`w-5 h-5 ${c.accent}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: 0.15 }}
            className={`bg-[#0a1628] border-2 ${c.border} rounded-2xl p-6`}
          >
            <div className={`text-[11px] font-black tracking-widest uppercase ${c.accent} mb-3`}>
              بعد {plan.duration_months} {plan.duration_months === 1 ? 'شهر' : 'أشهر'}
            </div>
            <p className="text-white leading-relaxed font-semibold">{page.after_ar}</p>
          </motion.div>
        </div>
      </section>

      {/* ════════ JOURNEY ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-24">
        <SectionTitle eyebrow="الطريق" title="كيف تمرّ الرحلة، خطوة بخطوة" />

        <div className="relative">
          {/* the line, drawn as you scroll in */}
          <motion.div
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ originY: 0 }}
            className={`absolute right-[19px] top-2 bottom-2 w-px bg-gradient-to-b ${GRAD_TEXT[plan.color]} opacity-40`}
          />

          <motion.ol variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="space-y-5">
            {page.journey.map((step, i) => (
              <motion.li key={i} variants={riseItem} className="relative pr-14">
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 320, damping: 20 }}
                  className={`absolute right-0 top-1 w-10 h-10 rounded-full ${c.pillBg} border-2 ${c.border} flex items-center justify-center text-sm font-black ${c.accent}`}
                >
                  {i + 1}
                </motion.span>
                <div className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-5 hover:border-[#1e3455] transition-colors">
                  <div className={`text-[11px] font-black ${c.accent} mb-1`}>{step.when}</div>
                  <h3 className="text-white font-black text-lg mb-1.5">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ════════ WHAT YOU GET ════════ */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <SectionTitle eyebrow="المحتوى" title="ما الذي تحصل عليه بالضبط" />

        <motion.ul
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {plan.lifetimePerks.map(perk => (
            <motion.li
              key={perk}
              variants={riseItem}
              className="group flex items-start gap-3 bg-[#0a1628] border border-[#1a2d4a] rounded-xl p-4 hover:border-[#1e3455] transition-colors"
            >
              <span className={`shrink-0 w-6 h-6 rounded-lg ${c.pillBg} flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform`}>
                <Check className={`w-3.5 h-3.5 ${c.accent}`} />
              </span>
              <span className="text-gray-200 text-sm leading-relaxed">{perk}</span>
            </motion.li>
          ))}
        </motion.ul>

        {plan.monthlyPerks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}
            className="mt-5 bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Repeat className={`w-4 h-4 ${c.accent}`} />
              <h3 className="text-white font-black">ومستمرّ معك طوال المدة</h3>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {plan.monthlyPerks.map(p => (
                <li key={p} className="flex items-start gap-2 text-gray-300 text-sm">
                  <Check className={`w-3.5 h-3.5 shrink-0 mt-1 ${c.accent}`} />{p}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {plan.includesPrevious_ar && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className={`mt-4 ${c.pillBg} border border-white/10 rounded-xl p-4 text-center text-sm font-black text-white`}
          >
            ✓ {plan.includesPrevious_ar}
          </motion.div>
        )}
      </section>

      {/* ════════ HONESTY BOX ════════ */}
      {page.notFor_ar && (
        <section className="max-w-3xl mx-auto px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
            className="bg-[#0a1628] border border-amber-500/25 rounded-2xl p-6 flex items-start gap-4"
          >
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-black text-sm mb-1.5">هذه الباقة ليست لك إذا…</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{page.notFor_ar}</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* ════════ COMPARE ════════ */}
      {neighbours.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-24">
          <SectionTitle eyebrow="المقارنة" title="تتردّد بينها وبين غيرها؟" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* current plan, pinned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45 }}
              className={`bg-[#0a1628] border-2 ${c.border} ring-2 ${c.ring} rounded-2xl p-5`}
            >
              <div className={`text-[10px] font-black uppercase tracking-widest ${c.accent} mb-2`}>أنت هنا</div>
              <h3 className="text-white font-black text-lg">{plan.title_ar}</h3>
              <div className="mt-2 text-white font-black text-2xl">
                {plan.amount_mad.toLocaleString()} <span className="text-sm text-gray-400 font-bold">درهم</span>
              </div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{plan.subtitle_ar}</p>
            </motion.div>

            {neighbours.map((n, i) => {
              const nc = COLOR_STYLES[n.color]
              const diff = n.amount_mad - plan.amount_mad
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 * (i + 1) }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/pricing/${n.id}`}
                    className="group block h-full bg-[#0a1628] border border-[#1a2d4a] hover:border-[#1e3455] rounded-2xl p-5 no-underline transition-colors"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      {diff > 0 ? `+${diff.toLocaleString()} درهم` : diff < 0 ? `${Math.abs(diff).toLocaleString()} درهم أقل` : 'نفس السعر'}
                    </div>
                    <h3 className="text-white font-black text-lg group-hover:text-white">{n.title_ar}</h3>
                    <div className="mt-2 text-white font-black text-2xl">
                      {n.amount_mad.toLocaleString()} <span className="text-sm text-gray-400 font-bold">درهم</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">{n.subtitle_ar}</p>
                    <span className={`mt-3 inline-flex items-center gap-1.5 text-xs font-black ${nc.accent}`}>
                      شوف التفاصيل <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mt-6">
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
              <ArrowRight className="w-4 h-4 inline-block ml-1" /> رجوع لكل الباقات
            </Link>
          </div>
        </section>
      )}

      {/* ════════ OBJECTIONS ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-24">
        <SectionTitle eyebrow="قبل ما تقرّر" title="الأسئلة التي تدور في بالك الآن" />

        <div className="space-y-2.5">
          {page.objections.map((o, i) => {
            const isOpen = openFaq === i
            return (
              <motion.div
                key={o.q}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`bg-[#0a1628] border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-[#1e3455]' : 'border-[#1a2d4a]'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="text-white font-bold text-sm sm:text-base">{o.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className={`w-5 h-5 shrink-0 ${isOpen ? c.accent : 'text-gray-500'}`} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{o.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
          className={`relative overflow-hidden bg-[#0a1628] border-2 ${c.border} rounded-3xl p-8 sm:p-10 text-center`}
        >
          <div className={`pointer-events-none absolute -top-24 right-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl bg-gradient-to-b ${AURA[plan.color]} to-transparent`} />
          <div className="relative">
            <h2 className="text-white font-black text-2xl sm:text-3xl mb-3">{plan.title_ar}</h2>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md mx-auto">{page.promise_ar}</p>
            <div className="flex items-baseline justify-center gap-2 mb-6">
              <span className="text-white font-black text-4xl">{plan.amount_mad.toLocaleString()}</span>
              <span className="text-gray-400 font-bold">درهم</span>
              {plan.originalAmount && (
                <span className="text-gray-600 line-through text-sm">{plan.originalAmount.toLocaleString()}</span>
              )}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => subscribe('footer')}
              className={`inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-base ${c.ctaBg}`}
            >
              {plan.isClass ? 'احجز الحصص' : 'اشترك الآن'} <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <p className="text-gray-500 text-xs mt-4">
              ضمان الأسبوع الأول · تفعيل خلال 24 ساعة · بدون تجديد تلقائي
            </p>
          </div>
        </motion.div>
      </section>

      <StickyPlanBar plan={plan} onSubscribe={() => subscribe('sticky')} />
    </main>
  )
}

/* ── Small shared title block ──────────────────────────────────────────────── */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.45 }}
      className="mb-8"
    >
      <p className="text-[11px] font-black tracking-[0.4em] uppercase text-gray-600 mb-2">— {eyebrow} —</p>
      <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight">{title}</h2>
    </motion.div>
  )
}
