'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowLeft, ArrowDown, Shield, Mic, TrendingUp, Trophy,
  MessageCircle, ChevronDown, Compass, Users, Globe, Star,
} from 'lucide-react'
import CourseCardDark from '@/components/course/CourseCardDark'
import CountUp from '@/components/pricing/CountUp'
import { openSubscribe } from '@/lib/lead-source'
import { COURSES } from '@/data/courses'
import { PACK_PLANS, PAYMENT_WHATSAPP } from '@/data/plans'
import { STATS } from '@/data/testimonials'

/* ── The chooser: one question that puts a visitor on the right level ─────── */

const WHERE_AM_I: { key: string; label: string; hint: string; slug: string }[] = [
  { key: 'zero',  label: 'ما كنعرف والو',        hint: 'لا أعرف حتى الحروف',              slug: 'a0-a1' },
  { key: 'words', label: 'كنعرف شي كلمات',       hint: 'كلمات متفرقة، بلا جمل',            slug: 'a1-a2' },
  { key: 'slow',  label: 'كنهضر بشوية',          hint: 'أتكلم لكن ببطء ومع ترجمة في رأسي', slug: 'a2-b1' },
  { key: 'fluent',label: 'كنهضر مزيان',          hint: 'طليق، وأريد مستوى احترافياً',      slug: 'b1-b2' },
]

const WHY = [
  { icon: TrendingUp, title: 'منهج مُثبَت بالنتائج',  desc: `طريقة مبنية على تجربة أكثر من ${STATS.students} طالب من المغرب والخليج.` },
  { icon: Mic,        title: 'تصحيح صوتي حقيقي',      desc: 'الأستاذ يسمع صوتك شخصياً ويصحّح نطقك — شخص حقيقي، لا روبوت.' },
  { icon: Compass,    title: 'تقدّم واضح ومقاس',      desc: 'كل مستوى يُبنى على السابق بخطوات محدّدة، فلا تضيع في الطريق.' },
  { icon: Trophy,     title: 'اختبار LIVE نهائي',      desc: 'محادثة حية مع الأستاذ عبر Google Meet تُثبت تقدّمك — لا شهادة آلية.' },
]

const FAQS = [
  { q: 'من أين أبدأ إذا لم أعرف شيئاً عن الإنجليزية؟', a: 'ابدأ بالمستوى الأول A0 → A1. مصمَّم خصيصاً للمبتدئ الكامل — لا يفترض أي معرفة سابقة على الإطلاق.' },
  { q: 'كيف تتم المتابعة مع الأستاذ؟',                a: 'بعد كل درس تسجّل صوتك وترسله على واتساب. الأستاذ يستمع إليك شخصياً ويصحّح نطقك ويعطيك ملاحظات مفصّلة في نفس اليوم.' },
  { q: 'هل يمكنني الانتقال من مستوى لآخر؟',           a: 'نعم — كل مستوى يُبنى على السابق. بعد إتمام المستوى ونجاحك في اختبار المحادثة LIVE تنتقل للتالي بخصم للطلاب المستمرين.' },
  { q: 'كيف أعرف مستواي الحالي قبل التسجيل؟',         a: 'اختبار المستوى المجاني يحسمها في دقائق، أو راسل الأستاذ على واتساب وهو يحدّده معك مجاناً.' },
  { q: 'هل هناك ضمان استرداد؟',                       a: 'نعم. إذا طبّقت كل الخطوات ولم ترَ أي تحسّن خلال الأسبوع الأول، نعيد لك مبلغك كاملاً بدون أسئلة.' },
]

const WA_URL = `https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=` +
  encodeURIComponent('مرحباً، أريد معرفة المزيد عن الكورسات')

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function CoursesClient() {
  const [pick, setPick]       = useState<string | null>(null)   // WHERE_AM_I key
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const recommended = WHERE_AM_I.find(w => w.key === pick)?.slug ?? null
  const bestPack    = PACK_PLANS.find(p => p.highlight) ?? PACK_PLANS[0]

  const choose = (key: string) => {
    const next = pick === key ? null : key
    setPick(next)
    if (!next) return
    const slug = WHERE_AM_I.find(w => w.key === key)?.slug
    if (slug) {
      // let the highlight paint before we scroll to it
      requestAnimationFrame(() =>
        document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      )
    }
  }

  return (
    <main className="min-h-screen bg-[#050d1a] pt-[80px] pb-20 overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="relative">
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          className="pointer-events-none absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/3 w-[760px] h-[620px] rounded-full blur-3xl bg-gradient-to-b from-blue-500/20 via-violet-500/10 to-transparent"
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            من الصفر إلى الطلاقة — مستوى بعد مستوى
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.12] mb-5"
          >
            اختر مستواك
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 to-yellow-500">
              وابدأ رحلتك اليوم
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10"
          >
            كورسات متدرّجة بدروس مسجّلة تبقى معك،
            <br className="hidden sm:block" />
            ومتابعة شخصية وتصحيح صوتي حقيقي بعد كل درس.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-3 max-w-lg mx-auto"
          >
            {[
              { icon: Users, value: STATS.students, suffix: '+', label: 'طالب' },
              { icon: Globe, value: STATS.countries, suffix: '',  label: 'دولة' },
              { icon: Star,  value: STATS.reviews,  suffix: '+', label: 'تقييم' },
            ].map(s => (
              <div key={s.label} className="bg-[#0a1628] border border-[#1a2d4a] rounded-2xl p-4">
                <s.icon className="w-4 h-4 text-amber-400 mx-auto mb-2" />
                <div className="text-white font-black text-2xl tabular-nums">
                  <CountUp to={s.value} />{s.suffix}
                </div>
                <div className="text-gray-500 text-[11px] font-bold mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ THE CHOOSER ════════ */}
      <section className="max-w-4xl mx-auto px-4 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }}
          className="bg-[#0a1628] border-2 border-[#1a2d4a] rounded-3xl p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-white font-black text-xl sm:text-2xl mb-1.5">فين نتا دابا؟</h2>
            <p className="text-gray-500 text-sm">اختر الوصف الأقرب لك — ونوريك المستوى المناسب مباشرة.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {WHERE_AM_I.map(w => {
              const active = pick === w.key
              return (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => choose(w.key)}
                  aria-pressed={active}
                  className={`relative text-right p-4 rounded-2xl border-2 transition-colors ${
                    active
                      ? 'border-amber-400/70 bg-amber-500/10'
                      : 'border-[#1a2d4a] bg-[#050d1a] hover:border-[#1e3455]'
                  }`}
                >
                  <div className={`font-black text-sm mb-1 ${active ? 'text-amber-300' : 'text-white'}`}>
                    {w.label}
                  </div>
                  <div className="text-gray-500 text-[11px] leading-snug">{w.hint}</div>
                  {active && (
                    <motion.span
                      layoutId="chooser-dot"
                      className="absolute top-3 left-3 w-2 h-2 rounded-full bg-amber-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {recommended && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-[#1a2d4a] flex flex-wrap items-center justify-center gap-3 text-sm">
                  <span className="text-gray-400">مستواك المقترح مضاء بالأسفل</span>
                  <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <button
                    type="button"
                    onClick={() => setPick(null)}
                    className="text-gray-500 hover:text-white font-bold text-xs underline underline-offset-4 transition-colors"
                  >
                    عرض كل المستويات
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 text-center">
            <Link
              href="/level-test"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-black text-sm transition-colors"
            >
              🧭 لست متأكداً؟ اختبر مستواك مجاناً في 10 دقائق <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ════════ COURSES ════════ */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] font-black tracking-[0.4em] uppercase text-gray-600 mb-2">— المستويات —</p>
          <h2 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-3">
            كل مستوى — رحلة تحوّل كاملة
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            ليست دروساً متفرقة: منهج متصل، متابعة شخصية، واختبار حقيقي في النهاية.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {COURSES.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="h-full"
            >
              <CourseCardDark
                course={course}
                dimmed={recommended !== null && recommended !== course.slug}
              />
            </motion.div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          💳 السعر يشمل كل الدروس والمتابعة وتصحيح النطق واختبار المحادثة LIVE
        </p>
      </section>

      {/* ════════ PACK UPSELL ════════ */}
      {bestPack && (
        <section className="max-w-4xl mx-auto px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-[#0a1628] border-2 border-violet-500/50 ring-2 ring-violet-500/20 rounded-3xl p-7 sm:p-9"
          >
            <div className="pointer-events-none absolute -top-28 left-0 w-96 h-96 rounded-full blur-3xl bg-gradient-to-b from-violet-500/25 to-transparent" />
            <div className="relative flex flex-col sm:flex-row items-center gap-7">
              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-300 text-[11px] font-black px-2.5 py-1 rounded-full mb-3">
                  📦 {bestPack.badge_ar ?? 'باك'}
                </div>
                <h3 className="text-white font-black text-2xl mb-2">تأخذ أكثر من مستوى؟</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {bestPack.idealFor_ar} الباك يضمن لك رحلة متصلة بدون انقطاع بين المستويات —
                  وهناك بالضبط ينقطع أغلب الناس.
                </p>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-white font-black text-3xl">{bestPack.amount_mad.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm font-bold">درهم</span>
                  {bestPack.originalAmount && (
                    <span className="text-gray-600 text-sm line-through">{bestPack.originalAmount.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
                <Link
                  href={`/pricing/${bestPack.id}`}
                  className="text-center bg-violet-500 hover:bg-violet-400 text-white font-black text-sm px-8 py-3.5 rounded-2xl transition-colors no-underline"
                >
                  شوف تفاصيل الباك
                </Link>
                <Link
                  href="/pricing"
                  className="text-center border border-[#1e3455] hover:border-gray-500 text-gray-300 hover:text-white font-bold text-xs px-8 py-2.5 rounded-2xl transition-colors no-underline"
                >
                  كل الباقات والأسعار
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ════════ WHY ════════ */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] font-black tracking-[0.4em] uppercase text-gray-600 mb-2">— الفرق —</p>
          <h2 className="text-white font-black text-3xl leading-tight">
            لماذا <span className="text-amber-400">إنجليزي</span> وليس غيره؟
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {WHY.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group bg-[#0a1628] border border-[#1a2d4a] hover:border-[#1e3455] rounded-2xl p-6 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-black text-lg mb-1.5">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ GUARANTEE ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
          className="bg-[#0a1628] border border-emerald-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right"
        >
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-xl mb-2">ضمان الأسبوع الأول</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              طبّق كل الخطوات خلال الأسبوع الأول — إذا لم ترَ أي تحسّن، نعيد لك مبلغك كاملاً.
              بدون أسئلة وبدون شروط مجحفة.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-20">
        <motion.h2
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.4 }}
          className="text-white font-black text-2xl text-center mb-8"
        >
          أسئلة قبل التسجيل
        </motion.h2>

        <div className="space-y-2.5">
          {FAQS.map((f, i) => {
            const isOpen = openFaq === i
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.35, delay: i * 0.04 }}
                className={`bg-[#0a1628] border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-[#1e3455]' : 'border-[#1a2d4a]'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="text-white font-bold text-sm">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className={`w-5 h-5 shrink-0 ${isOpen ? 'text-amber-400' : 'text-gray-500'}`} />
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
                      <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-5">
          <Link href="/faq" className="text-amber-400 hover:text-amber-300 text-sm font-black transition-colors">
            كل الأسئلة الشائعة ←
          </Link>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="max-w-3xl mx-auto px-4 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-[#0a1628] border-2 border-[#1a2d4a] rounded-3xl p-8 sm:p-10 text-center"
        >
          <div className="pointer-events-none absolute -top-24 right-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl bg-gradient-to-b from-emerald-500/20 to-transparent" />
          <div className="relative">
            <MessageCircle className="w-9 h-9 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-black text-2xl sm:text-3xl mb-3">
              لديك سؤال؟ الأستاذ يجيبك شخصياً
            </h2>
            <p className="text-gray-400 leading-relaxed mb-7 max-w-md mx-auto">
              لست متأكداً من مستواك، أو تريد معرفة طريقة التدريس قبل ما تلتزم؟ راسلنا.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => openSubscribe({ source: 'courses_bottom_cta' })}
                className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black px-8 py-4 rounded-2xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> سجّل عبر واتساب
              </button>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#1e3455] hover:border-gray-500 text-white font-bold px-8 py-4 rounded-2xl transition-colors no-underline"
              >
                اسأل سؤالاً أولاً
              </a>
            </div>
            <p className="text-gray-600 text-xs mt-4">الرد خلال وقت قصير · مجاناً تماماً</p>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
