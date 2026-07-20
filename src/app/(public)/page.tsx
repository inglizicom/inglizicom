"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useInView } from "framer-motion"
import Link from "next/link"
import { TESTIMONIALS, STATS } from "@/data/testimonials"
import { INDIVIDUAL_PLANS, PACK_PLANS, CLASS_PLANS, BUSINESS_PLANS } from "@/data/plans"
import { openSubscribe } from "@/lib/lead-source"
import ApproxPrice from "@/components/ApproxPrice"

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=720&h=480&fit=crop&q=80",
    title: "تحدث بثقة في 30 يومًا",
    sub: "أول أسبوع يغيّر ثقتك، ثم نصل بك إلى محادثة حقيقية خطوة بخطوة مع الأستاذ حمزة",
  },
  {
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=720&h=480&fit=crop&q=80",
    title: "محادثة عملية من اليوم الأول",
    sub: "تتعلم الجمل التي تحتاجها فعلاً في الحياة والعمل بدل حفظ الكلمات بدون فائدة",
  },
  {
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=720&h=480&fit=crop&q=80",
    title: "من الصفر إلى الطلاقة",
    sub: "أقصر طرق التعلم مع شرح عربي مبسط، متابعة شخصية، ونتائج محسوسة بسرعة",
  },
]

const WORDS_CYCLE = ["الإنجليزية", "المحادثة", "النطق", "الاستماع", "الطلاقة"]

/* ═══════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
}

const fadeScale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */

function useCountUp(end: number, duration = 2000, startWhen = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!startWhen) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, startWhen])
  return count
}

/* ═══════════════════════════════════════════════════
   PARTICLES BACKGROUND
═══════════════════════════════════════════════════ */

function Particles({ count = 20, className = "" }: { count?: number; className?: string }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
  )
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" as const }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   1. HERO SLIDER
═══════════════════════════════════════════════════ */

function HeroSlider() {
  const [idx, setIdx] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timer.current = setInterval(() => setIdx(p => (p + 1) % SLIDES.length), 4500)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  useEffect(() => {
    const wt = setInterval(() => setWordIdx(p => (p + 1) % WORDS_CYCLE.length), 2200)
    return () => clearInterval(wt)
  }, [])

  const slide = SLIDES[idx]
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const bgX = useTransform(mouseX, [-500, 500], [15, -15])
  const bgY = useTransform(mouseY, [-500, 500], [15, -15])

  return (
    <section
      className="relative min-h-screen pt-20 flex items-center overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left - rect.width / 2)
        mouseY.set(e.clientY - rect.top - rect.height / 2)
      }}
    >
      {/* animated gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50" />

      {/* moving blobs with parallax */}
      <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/40 to-sky-200/20 rounded-full blur-3xl hero-blob-1" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-purple-200/10 rounded-full blur-3xl hero-blob-2" />
      </motion.div>

      <Particles count={12} className="opacity-30" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center px-5 sm:px-6 py-10 md:py-20 relative z-10 w-full">
        {/* TEXT SIDE */}
        <div className="order-2 md:order-1 text-right" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 bg-blue-100/80 backdrop-blur-sm text-blue-800 px-5 py-2.5 rounded-full text-sm font-bold mb-7 border border-blue-200/60"
              >
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full dot-pulse" />
                <span>+{STATS.students} طالب يتعلمون الآن</span>
              </motion.div>

              <h1 className="text-3xl sm:text-[2.7rem] md:text-[3.5rem] font-black leading-[1.25] mb-6 text-gray-900">
                تعلم{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    className="inline-block bg-gradient-to-l from-amber-500 to-yellow-600 bg-clip-text text-transparent"
                  >
                    {WORDS_CYCLE[wordIdx]}
                  </motion.span>
                </AnimatePresence>
                <br />
                {slide.title}
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-6 leading-[1.9] max-w-xl">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {[
                  { label: '📹 دروس قصيرة' },
                  { label: '💬 متابعة شخصية' },
                  { label: '🎯 نتائج محسوسة' },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/level-test"
                  className="relative bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black text-base px-10 py-4 rounded-2xl shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2.5 border border-amber-300"
                >
                  🧭 اختبر مستواك مجاناً في 3 دقائق
                  <motion.span animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
                </Link>

                <a
                  href="#programs"
                  className="border-2 border-blue-200 hover:border-amber-300 bg-white/80 backdrop-blur-sm text-blue-900 font-extrabold text-base px-10 py-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-lg"
                >
                  اكتشف البرامج 🚀
                </a>
              </div>

              {/* social proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4 mt-10 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-gray-100 w-fit"
              >
                <div className="flex -space-x-3 space-x-reverse">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-400"].map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, type: "spring" }}
                      className={`w-10 h-10 rounded-full ${c} border-[3px] border-white flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    >
                      {["س", "م", "ي", "ن"][i]}
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-base">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    <span className="text-gray-700 mr-1 text-sm font-black">{STATS.rating}</span>
                  </div>
                  <p className="text-gray-500 text-sm font-semibold">{STATS.reviews} تقييم من طلاب في {STATS.countries} دولة</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* IMAGE SIDE */}
        <div className="order-1 md:order-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-400/30 ring-1 ring-gray-200/50">
                <img
                  src={slide.img}
                  alt={slide.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-[260px] sm:h-[340px] md:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-white/5 rounded-3xl" />

                {/* slide label */}
                <div className="absolute bottom-6 right-6 left-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg"
                  >
                    <p className="font-extrabold text-gray-900 text-sm">{slide.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-l from-amber-400 to-yellow-500 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4.5, ease: "linear" as const }}
                          key={idx}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{idx + 1}/{SLIDES.length}</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* floating badges */}
              <motion.div
                animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
                className="hidden sm:flex absolute -top-5 -left-5 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 text-sm font-bold items-center gap-2"
              >
                <span className="text-xl">💬</span>
                <span className="bg-gradient-to-l from-blue-600 to-blue-800 bg-clip-text text-transparent">Hello!</span>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }}
                className="hidden sm:flex absolute -bottom-5 -right-5 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 px-4 py-3 rounded-2xl shadow-xl text-sm font-black items-center gap-2"
              >
                <span className="text-xl">🔥</span>
                <span>7 أيام streak</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex justify-center gap-3 mt-8">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`الشريحة ${i + 1}`}>
                <motion.div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i === idx ? "w-10 bg-gradient-to-l from-amber-400 to-yellow-500" : "w-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   2. STATS
═══════════════════════════════════════════════════ */

function StatItem({ num, suffix, label, icon, gradient }: { num: number; suffix: string; label: string; icon: string; gradient: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const count = useCountUp(num, 2000, inView)

  return (
    <motion.div ref={ref} custom={0} variants={fadeScale} className="text-center group">
      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
        className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tabular-nums">
        {suffix === "%" ? `${count}%` : suffix === "+" ? `${count}+` : suffix}
      </h3>
      <p className="text-gray-600 text-sm mt-1 font-semibold">{label}</p>
    </motion.div>
  )
}

function StatsStrip() {
  return (
    <section className="relative -mt-10 z-20 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 p-6 sm:p-10"
      >
        <StatItem num={STATS.students} suffix="+" label="طالب نشط" icon="👥" gradient="from-green-400 to-emerald-500" />
        <StatItem num={97} suffix="%" label="راضين تماماً" icon="⭐" gradient="from-yellow-400 to-amber-500" />
        <StatItem num={STATS.countries} suffix="+" label="دولة حول العالم" icon="🌍" gradient="from-blue-400 to-blue-600" />
        <StatItem num={STATS.reviews} suffix="+" label="تقييم موثّق" icon="💬" gradient="from-purple-400 to-purple-600" />
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   3. PROGRAMS — data-driven overview linking to each page
═══════════════════════════════════════════════════ */

function ProgramsSection() {
  const minLevel = Math.min(...INDIVIDUAL_PLANS.map(p => p.amount_mad))
  const minPack = Math.min(...PACK_PLANS.map(p => p.amount_mad))
  const maxPackSaving = Math.max(...PACK_PLANS.map(p => (p.originalAmount ?? p.amount_mad) - p.amount_mad))
  const minPerSession = Math.min(...CLASS_PLANS.map(p => Math.round(p.amount_mad / (p.sessionsIncluded ?? 1))))
  const business = BUSINESS_PLANS[0]

  const programs = [
    {
      emoji: "🎯",
      tag: "Individual Levels",
      title: "المستويات الفردية",
      desc: "ابدأ بمستوى واحد حسب نقطة انطلاقك — من A0 إلى B2، كل مستوى مبني على السابق.",
      price: minLevel,
      priceLabel: "ابتداءً من",
      priceSuffix: "درهم",
      points: ["دروس مسجلة تبقى معك مدى الحياة", "متابعة على واتساب", "4 مستويات متدرجة"],
      href: "/pricing#levels",
      cta: "شوف المستويات",
      gradient: "from-blue-500 to-blue-700",
      border: "hover:border-blue-300",
      accent: "text-blue-700",
      chip: "bg-blue-50 text-blue-700",
    },
    {
      emoji: "📦",
      tag: "Packs",
      title: "الباكات الموفّرة",
      badge: "الأكثر قيمة",
      desc: "مستويان أو أكثر في رحلة متصلة بسعر أوفر — للي باغي تحوّل كامل بلا انقطاع.",
      price: minPack,
      priceLabel: "ابتداءً من",
      priceSuffix: "درهم",
      points: [`وفّر حتى ${maxPackSaving.toLocaleString()} درهم`, "رحلة متصلة من الصفر للطلاقة", "كوتشينغ ومتابعة شخصية"],
      href: "/pricing#packs",
      cta: "شوف الباكات",
      gradient: "from-violet-500 to-purple-700",
      border: "hover:border-violet-300",
      accent: "text-violet-700",
      chip: "bg-violet-50 text-violet-700",
    },
    {
      emoji: "👨‍🏫",
      tag: "1:1 Classes",
      title: "حصص خاصة 1:1",
      desc: "حصة مباشرة 1h30 وجهاً لوجه مع الأستاذ — برنامج مخصص لهدفك وتصحيح فوري.",
      price: minPerSession,
      priceLabel: "الحصة من",
      priceSuffix: "درهم",
      points: ["مباشرة بالفيديو مع الأستاذ", "مواعيد على جدولك", "متابعة واتساب بين الحصص"],
      href: "/classes",
      cta: "شوف الحصص",
      gradient: "from-amber-400 to-yellow-600",
      border: "hover:border-amber-300",
      accent: "text-amber-700",
      chip: "bg-amber-50 text-amber-700",
    },
    {
      emoji: "💼",
      tag: "Business English",
      title: "الإنجليزية المهنية",
      desc: "اجتماعات، عروض، ومكالمات بثقة — برنامج متخصص لبيئة العمل، بدون قواعد.",
      price: business?.amount_mad ?? 3500,
      priceLabel: "البرنامج الكامل",
      priceSuffix: "درهم",
      points: ["محاكاة اجتماعات حقيقية", "مفردات الأعمال والتفاوض", "تصحيح شخصي من الأستاذ"],
      href: "/business",
      cta: "اعرف المزيد",
      gradient: "from-cyan-500 to-sky-700",
      border: "hover:border-cyan-300",
      accent: "text-cyan-700",
      chip: "bg-cyan-50 text-cyan-700",
    },
  ]

  return (
    <section id="programs" className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-b from-white via-gray-50/60 to-white relative overflow-hidden scroll-mt-16" dir="rtl">
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <span className="inline-block text-[11px] font-black tracking-[0.4em] uppercase text-blue-600 mb-3">
            — Programs —
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-3">
            اختر البرنامج{' '}
            <span className="bg-gradient-to-l from-blue-600 to-blue-900 bg-clip-text text-transparent">المناسب لك</span>
          </h2>
          <p className="text-gray-500 text-base font-semibold max-w-xl mx-auto">
            أربعة طرق للوصول إلى الطلاقة — لكلٍّ صفحته الكاملة بالأسعار والتفاصيل
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch"
        >
          {programs.map((p, i) => (
            <motion.div key={p.title} custom={i} variants={fadeUp} whileHover={{ y: -6 }} className="h-full">
              <Link
                href={p.href}
                className={`relative flex flex-col h-full bg-white rounded-3xl border-2 border-gray-100 ${p.border} p-6 shadow-md hover:shadow-xl transition-all duration-300 no-underline`}
              >
                {p.badge && (
                  <span className="absolute -top-3 right-5 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {p.badge}
                  </span>
                )}

                <div className={`w-14 h-14 bg-gradient-to-br ${p.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-4`}>
                  {p.emoji}
                </div>

                <span className={`self-start text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 ${p.chip}`}>
                  {p.tag}
                </span>
                <h3 className="font-black text-xl text-gray-900 mb-2 leading-tight">{p.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed mb-4">{p.desc}</p>

                <div className="mb-4">
                  <span className="text-gray-400 text-[11px] font-bold block">{p.priceLabel}</span>
                  <span className="text-2xl font-black text-gray-900">{p.price.toLocaleString()}</span>
                  <span className={`text-sm font-bold mr-1 ${p.accent}`}>{p.priceSuffix}</span>
                  <ApproxPrice mad={p.price} className="block text-blue-700/70 text-[11px] font-bold mt-0.5" />
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {p.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2 text-[12px] text-gray-600 leading-snug font-semibold">
                      <span className={`${p.accent} font-black shrink-0`}>✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>

                <span className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm bg-gradient-to-l ${p.gradient} text-white shadow-md group-hover:opacity-90 transition-all`}>
                  {p.cta} ←
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Link href="/pricing"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-bold underline underline-offset-4 transition-colors"
          >
            شوف جميع الخطط والأسعار بالتفصيل ←
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   4. HOW IT WORKS — 3 step visual timeline
═══════════════════════════════════════════════════ */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "🎯",
      title: "اختر مستواك",
      desc: "اختبار مجاني في 3 دقائق يحدد مستواك بدقة والباقة المناسبة لك — بلا تخمين.",
      pill: "3 دقائق",
    },
    {
      num: "02",
      icon: "📹",
      title: "ابدا تتعلّم",
      desc: "دروس فيديو قصيرة + مجموعة واتساب حية + متابعة يومية من الأستاذ حمزة شخصياً.",
      pill: "15 دقيقة / يوم",
    },
    {
      num: "03",
      icon: "🏆",
      title: "شوف النتيجة",
      desc: "فالأسبوع الأول حس بالفرق. فاليوم 30 — هضر محادثة كاملة. بضمان.",
      pill: "30 يوم",
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_20%_90%,rgba(96,165,250,0.25),transparent_40%)]" />
      <Particles count={15} className="opacity-50" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-500/30 uppercase tracking-wider">
            🧠 نظامنا التعليمي
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white drop-shadow-xl">
            3 خطوات لتتحدث الإنجليزية{' '}
            <span className="bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              بثقة
            </span>
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} whileHover={{ y: -8 }} className="relative group">
              <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm rounded-3xl p-7 sm:p-8 border-2 border-white/10 group-hover:border-amber-400/50 shadow-2xl shadow-black/40 transition-all duration-300 h-full">
                <div className="absolute -top-5 right-6 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/40 uppercase tracking-wider">
                  {s.pill}
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-6xl sm:text-7xl font-black text-white/10 leading-none select-none">{s.num}</span>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl shadow-blue-900/50 border border-blue-400/30"
                  >
                    {s.icon}
                  </motion.div>
                </div>

                <h3 className="font-black text-2xl text-white mb-3">{s.title}</h3>
                <p className="text-white/70 text-[15px] font-semibold leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="text-center mt-12">
          <Link
            href="/level-test"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black px-9 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 transition-all duration-300"
          >
            🧭 ابدأ بالخطوة الأولى — اختبر مستواك
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   5. WHAT YOU GET — compact feature grid
═══════════════════════════════════════════════════ */

function WhatYouGet() {
  const items = [
    { icon: "📹", title: "دروس فيديو مركّزة", desc: "5-8 دقائق للفيديو، بشرح عربي واضح — بلا حشو." },
    { icon: "💬", title: "واتساب مع حمزة شخصياً", desc: "رسائل صوتية يصحّحها الأستاذ بنفسه — لا روبوت." },
    { icon: "🎯", title: "متابعة أسبوعية بالاسم", desc: "واجبات بسيطة تُراجَع وتُصحَّح بتغذية راجعة مخصصة." },
    { icon: "🎁", title: "مكتبة PDF + تمارين", desc: "ملخصات وتمارين تطبيقية تحمّلها وتراجعها متى شئت." },
    { icon: "🏆", title: "ضمان الأسبوع الأول", desc: "ما حسّيتش بالفرق فالأسبوع الأول؟ كنرجعو ليك الفلوس." },
    { icon: "♾️", title: "وصول مدى الحياة", desc: "المحتوى يبقى معك للأبد — بلا تاريخ انتهاء." },
  ]

  return (
    <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            🎁 شنو كتاخد ملّي كتشترك
          </span>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight text-gray-900">
            ليست دورة عادية —{' '}
            <span className="bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
              نظام كامل
            </span>{' '}
            للنجاح
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              className="flex items-start gap-4 bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-xl shadow-md">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-[15px] text-gray-900 mb-1 leading-tight">{item.title}</h3>
                <p className="text-[13px] font-semibold leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   6. TESTIMONIALS
═══════════════════════════════════════════════════ */

function TestimonialsSection() {
  // Themes are hardcoded class strings so Tailwind always emits them.
  const THEMES = {
    blue: {
      card:      'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
      shadow:    'shadow-2xl shadow-blue-800/40',
      star:      'text-amber-300',
      quote:     'text-white/95',
      avatarBg:  'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 shadow-amber-500/40',
    },
    gold: {
      card:      'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500',
      shadow:    'shadow-2xl shadow-amber-500/40',
      star:      'text-blue-900',
      quote:     'text-blue-900',
      avatarBg:  'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-blue-900/40',
    },
    blueDark: {
      card:      'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-800',
      shadow:    'shadow-2xl shadow-blue-900/50',
      star:      'text-amber-400',
      quote:     'text-white/95',
      avatarBg:  'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 shadow-amber-500/40',
    },
  } as const

  return (
    <section className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-b from-white via-amber-50/40 to-white relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-amber-100/50 to-transparent blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            ⭐ شهادات حقيقية
          </span>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight text-gray-900">
            شوف شنو قالوا{' '}
            <span className="bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
              طلاب حمزة
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-2xl drop-shadow-lg">★</span>)}
            </div>
            <span className="font-black text-gray-900 text-xl">{STATS.rating}/5</span>
            <span className="text-gray-600 font-bold text-sm">· {STATS.reviews} تقييم</span>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
          {TESTIMONIALS.slice(0, 3).map((t, i) => {
            const theme = THEMES[t.theme]
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="relative rounded-3xl overflow-hidden"
              >
                <div className={`${theme.card} ${theme.shadow} p-7 sm:p-8 relative overflow-hidden border border-white/10 h-full`}>
                  <div className={`absolute top-5 left-5 text-6xl font-black ${theme.quote} opacity-10 leading-none select-none`}>&ldquo;</div>

                  <div className="flex gap-1 mb-5 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className={`${theme.star} text-xl drop-shadow`}>★</span>
                    ))}
                  </div>

                  <p className={`${theme.quote} leading-[1.9] text-[0.95rem] sm:text-base font-bold relative z-10 mb-6`}>
                    {t.text}
                  </p>

                  <div className="flex items-center gap-3 pt-5 border-t border-white/20 relative z-10">
                    <div className={`w-11 h-11 ${theme.avatarBg} rounded-xl flex items-center justify-center text-lg shadow-xl flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className={`${theme.quote} font-black text-sm truncate`}>{t.name}</p>
                      <span className={`${theme.quote} opacity-80 text-[11px] font-bold flex items-center gap-1`}>
                        <span className={theme.star}>✓</span>
                        وصل مستوى {t.level}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   7. MOFRADATI — cross-promo band (games live there now)
═══════════════════════════════════════════════════ */

function MofradatiSection() {
  return (
    <section className="py-14 sm:py-16 px-5 sm:px-6 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.a
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          href="https://mofradati.com"
          target="_blank"
          rel="noopener"
          className="group flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-l from-blue-700 via-blue-800 to-blue-900 rounded-3xl p-8 sm:p-10 border border-amber-400/25 shadow-2xl shadow-blue-900/40 no-underline overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center sm:text-right">
            <span className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              🎮 تحب التعلّم باللعب؟
            </span>
            <h2 className="font-black text-2xl sm:text-3xl text-white mb-2 leading-tight">
              مفرداتي<span className="text-amber-300">.كوم</span> — ألعاب المفردات اليومية
            </h2>
            <p className="text-blue-100/80 text-sm sm:text-base font-semibold">
              منصّتنا المجانية للألعاب والمفردات — العب، راكم الكلمات، وارجع هنا للدراسة الجادّة
            </p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black px-7 py-4 rounded-2xl shadow-xl shadow-amber-500/30 group-hover:shadow-amber-500/50 group-hover:scale-105 transition-all duration-300 text-sm flex-shrink-0 whitespace-nowrap">
            العب الآن ←
          </span>
        </motion.a>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   8. MINI FAQ — top questions + link to /faq
═══════════════════════════════════════════════════ */

function MiniFAQ() {
  const items = [
    {
      q: '😩 درست الإنجليزية سنوات وما زلت لا أستطيع التحدث. أين المشكلة؟',
      a: 'المدرسة تعلّمك القواعد والكلمات، لكنها لا تعلّمك كيف تتحدث. مع الأستاذ حمزة تبدأ الحديث من اليوم الأول — جُمل قصيرة، محادثات حقيقية، وتصحيح فوري.',
    },
    {
      q: '😳 أنا خجول جداً وأخاف من الخطأ. هل سأستطيع التحدث؟',
      a: 'هذا الخوف هو ما يوقفك. الأستاذ حمزة يتابعك شخصياً على واتساب — رسائل صوتية بعيداً عن أعين الناس وبلا إحراج. كل خطأ خطوة تقدّم.',
    },
    {
      q: '⏰ هل 30 يوماً تكفي لأبدأ التحدث؟',
      a: 'نعم — إذا التزمت 15-20 دقيقة يومياً بالمنهج الصحيح. في اليوم 30 تدير محادثة قصيرة بنفسك. المفتاح هو الاستمرارية — ونحن نتابعك حتى لا تتوقف.',
    },
    {
      q: '💰 هل يوجد ضمان إن لم ينجح البرنامج معي؟',
      a: 'نعم. إن لم تقتنع خلال الأسبوع الأول نعيد لك المبلغ كاملاً بلا أسئلة. ولديك وصول مدى الحياة إلى الدروس.',
    },
  ]
  return (
    <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
            الأسئلة اللي كتسولوا دائماً
          </h2>
          <p className="text-gray-500 text-sm font-semibold">
            جاوبنا عليهم قبل ما تسول — بصراحة كاملة
          </p>
        </div>
        <div className="space-y-2">
          {items.map((f, i) => (
            <details
              key={i}
              className="group bg-gray-50 border border-gray-200 rounded-2xl open:border-gray-300 open:bg-white open:shadow-sm transition-shadow"
            >
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3 text-gray-900 font-black text-sm sm:text-base">
                <span>{f.q}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-600 text-sm leading-relaxed font-semibold">
                {f.a}
              </div>
            </details>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
          >
            كل الأسئلة الشائعة ←
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   9. FINAL CTA
═══════════════════════════════════════════════════ */

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 text-white text-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.22),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(96,165,250,0.3),transparent_50%)]" />
      <Particles count={20} className="opacity-70" />

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-5 leading-[1.15] drop-shadow-lg">
          جاهز تبدّل حياتك{' '}
          <span className="bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            ف30 يوم؟
          </span>
        </h2>
        <p className="text-white/80 text-lg sm:text-xl mb-10 leading-relaxed font-semibold max-w-xl mx-auto">
          انضم إلى أكثر من <span className="text-amber-300 font-black">+{STATS.students} طالب</span> تخلّصوا من الخوف وبدأوا يتحدثون بثقة — بمتابعة شخصية من الأستاذ حمزة
        </p>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => openSubscribe({ source: 'final_cta' })}
            className="bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black px-10 sm:px-14 py-5 rounded-2xl shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 hover:scale-105 transition-all duration-300 text-base sm:text-lg inline-flex items-center gap-2 border-2 border-amber-300"
          >
            💬 سجّل الآن — جاوبني فواتساب
          </button>
          <Link
            href="/level-test"
            className="bg-white/10 backdrop-blur-md text-white font-bold px-8 sm:px-10 py-5 rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-amber-400/50 transition-all duration-300 inline-flex items-center gap-2"
          >
            🧭 اختبر مستواك أولاً
          </Link>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-12 flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-white/80 text-sm font-bold">
          <span className="inline-flex items-center gap-1.5"><span className="text-amber-400">✅</span> ضمان استرجاع</span>
          <span className="w-1 h-1 bg-amber-400/60 rounded-full" />
          <span className="inline-flex items-center gap-1.5"><span className="text-amber-400">💬</span> دعم واتساب شخصي</span>
          <span className="w-1 h-1 bg-amber-400/60 rounded-full" />
          <span className="inline-flex items-center gap-1.5"><span className="text-amber-400">♾️</span> وصول مدى الحياة</span>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800">
      <HeroSlider />
      <StatsStrip />
      <ProgramsSection />
      <HowItWorks />
      <WhatYouGet />
      <TestimonialsSection />
      <MofradatiSection />
      <MiniFAQ />
      <FinalCTA />
    </div>
  )
}
