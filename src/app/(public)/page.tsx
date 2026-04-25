"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from "framer-motion"
import Link from "next/link"
import { TESTIMONIALS } from "@/data/testimonials"
import { PLANS as CANONICAL_PLANS } from "@/data/plans"
import { openSubscribe } from "@/lib/lead-source"

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=720&h=480&fit=crop&q=80",
    title: "تعلم الإنجليزية مع حمزة",
    sub: "طريقة عملية بدون قواعد مملة — نتائج من أول أسبوع",
    accent: "#22c55e",
  },
  {
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=720&h=480&fit=crop&q=80",
    title: "تحدث من اليوم الأول",
    sub: "محادثات حقيقية يومية تبني ثقتك خطوة بخطوة",
    accent: "#3b82f6",
  },
  {
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=720&h=480&fit=crop&q=80",
    title: "دروس بسيطة — تقدّم سريع",
    sub: "من الصفر إلى الاحتراف بأسلوب ممتع وتفاعلي",
    accent: "#8b5cf6",
  },
]

/**
 * View-only presentation layer on top of the canonical PLANS
 * from /data/plans.ts. Pricing, level, follow-up duration and perks
 * are the source of truth; emoji/gradient/popular/rating are UI extras.
 */
const PLAN_VIEW: Record<
  string,
  {
    emoji:    string
    popular?: boolean
    badge?:   string | null
    desc:     string
    color:    "green" | "blue" | "purple" | "orange" | "gold" | "slate"
    gradient: string
    rating?:        number
    ratingCount?:   number
    recentBuyers?:  number | null
  }
> = {
  "basic": {
    emoji: "🌱",
    desc:  "ابدأ من الصفر المطلق وبنِ أول جُمَلك بثقة",
    color: "green",  gradient: "from-green-500 to-emerald-600",
    rating: 4.9, ratingCount: 184, recentBuyers: 7,
  },
  "pro": {
    emoji: "💬", popular: true, badge: "🔥 الأكثر طلباً",
    desc:  "حوّل الجملة إلى محادثة يومية + متابعة أسبوعية",
    color: "blue",   gradient: "from-blue-500 to-blue-600",
    rating: 4.9, ratingCount: 96, recentBuyers: 4,
  },
  "premium": {
    emoji: "🚀", badge: "⭐ الأفضل قيمة",
    desc:  "تحدث بطلاقة احترافية (B1-B2) + 3 لايفات شهرياً",
    color: "purple", gradient: "from-purple-500 to-purple-600",
    rating: 5.0, ratingCount: 48, recentBuyers: 2,
  },
  "vip": {
    emoji: "👑", badge: "⭐ الأكثر تحوّلاً",
    desc:  "برنامج التحوّل الكامل: كوتشينغ 1:1 + متابعة يومية",
    color: "gold",   gradient: "from-yellow-500 to-amber-600",
    rating: 5.0, ratingCount: 34, recentBuyers: null,
  },
}

const PLANS = CANONICAL_PLANS.map(p => {
  const v = PLAN_VIEW[p.id]
  const levelLabel =
    p.levelFrom && p.levelTo
      ? p.levelFrom === p.levelTo
        ? p.levelFrom
        : `${p.levelFrom} → ${p.levelTo}`
      : 'مخصّص'
  return {
    id:                  p.id,
    canonicalId:          p.id,
    slug:                 p.courseSlug,
    title:                p.title_ar,
    subtitle:             p.subtitle_ar,
    levelLabel,
    price:                p.amount_mad,
    originalPrice:        p.originalAmount,
    isHourly:             !!p.isHourly,
    followUpLabel:        p.followUpLabel_ar,
    followUpDuration:     p.followUpDuration_ar,
    durationMonths:       p.duration_months,
    currency:             "DH",
    lifetimePerks:        p.lifetimePerks,
    monthlyPerks:         p.monthlyPerks,
    includesPrevious:     p.includesPrevious_ar,
    idealFor:             p.idealFor_ar,
    emoji:                v?.emoji    ?? "⭐",
    popular:              v?.popular  ?? false,
    highlight:            !!p.highlight,
    isPremium:            !!p.isPremium,
    badge:                v?.badge    ?? p.badge_ar ?? null,
    desc:                 v?.desc     ?? p.subtitle_ar,
    color:                v?.color    ?? "blue",
    gradient:             v?.gradient ?? "from-blue-500 to-blue-600",
    rating:               v?.rating,
    ratingCount:          v?.ratingCount,
    recentBuyers:         v?.recentBuyers,
  }
})

const TOOLS = [
  { icon: "🎧", title: "الاستماع", desc: "بودكاست ومحادثات حقيقية بمستويات مختلفة", href: "/listen", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20" },
  { icon: "✍️", title: "تدرب الآن", desc: "تمارين تفاعلية يومية لتثبيت ما تعلمته", href: "/practice", gradient: "from-green-500 to-emerald-400", glow: "shadow-green-500/20" },
  { icon: "🗺️", title: "الخريطة", desc: "تابع رحلتك وشوف كم وصلت", href: "/map", gradient: "from-purple-500 to-pink-400", glow: "shadow-purple-500/20" },
]

const MAP_NODES = [
  { label: "A0", city: "البداية", status: "done" },
  { label: "A1", city: "الأساسيات", status: "done" },
  { label: "A2", city: "المحادثة", status: "current" },
  { label: "B1", city: "المتوسط", status: "locked" },
  { label: "B2", city: "المتقدم", status: "locked" },
  { label: "C1", city: "الاحتراف", status: "locked" },
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
   MAGNETIC BUTTON
═══════════════════════════════════════════════════ */

function MagneticButton({ children, href, className }: { children: React.ReactNode; href: string; className: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - rect.left - rect.width / 2) * 0.15)
        y.set((e.clientY - rect.top - rect.height / 2) * 0.15)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />

      {/* moving blobs with parallax */}
      <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-gradient-to-br from-green-200/40 to-emerald-200/20 rounded-full blur-3xl hero-blob-1" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-purple-200/10 rounded-full blur-3xl hero-blob-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-yellow-100/20 to-orange-100/10 rounded-full blur-3xl animate-pulse" />
      </motion.div>

      <Particles count={15} className="opacity-30" />

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
                className="inline-flex items-center gap-2.5 bg-green-100/80 backdrop-blur-sm text-green-700 px-5 py-2.5 rounded-full text-sm font-bold mb-7 border border-green-200/50"
              >
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full dot-pulse" />
                <span>+1200 طالب يتعلمون الآن</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-green-500"
                >
                  ●
                </motion.span>
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
                    className="inline-block bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent"
                  >
                    {WORDS_CYCLE[wordIdx]}
                  </motion.span>
                </AnimatePresence>
                <br />
                {slide.title}
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-10 leading-[1.9] max-w-xl">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => openSubscribe({ source: 'hero_start' })}
                  className="relative bg-gradient-to-l from-green-500 to-emerald-600 text-white font-extrabold text-base px-10 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2.5 overflow-hidden group"
                >
                  <span className="relative z-10">ابدأ الآن</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative z-10"
                  >
                    🚀
                  </motion.span>
                  <div className="absolute inset-0 bg-gradient-to-l from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <Link
                  href="/level-test"
                  className="border-2 border-gray-200 hover:border-green-300 bg-white/80 backdrop-blur-sm text-gray-700 font-extrabold text-base px-10 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-lg"
                >
                  🧭 اختبر مستواك مجاناً
                  <motion.span animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
                </Link>
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
                      <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.05 }}>
                        ★
                      </motion.span>
                    ))}
                    <span className="text-gray-700 mr-1 text-sm font-black">4.9</span>
                  </div>
                  <p className="text-gray-500 text-sm font-semibold">من 1200+ طالب سعيد</p>
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
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.05, rotateY: 15 }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-400/30 ring-1 ring-gray-200/50">
                <img
                  src={slide.img}
                  alt={slide.title}
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
                          className="h-full bg-gradient-to-l from-green-400 to-emerald-500 rounded-full"
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
                <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent">Hello!</span>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }}
                className="hidden sm:flex absolute -bottom-5 -right-5 bg-gradient-to-l from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-bold items-center gap-2"
              >
                <span className="text-xl">🔥</span>
                <span>7 أيام streak</span>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 6, -6], scale: [1, 1.05, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
                className="hidden sm:flex absolute top-1/3 -right-8 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-yellow-200 text-sm font-extrabold items-center gap-1.5"
              >
                <span className="text-yellow-500">⭐</span>
                <span className="text-gray-800">+15 XP</span>
              </motion.div>

              <motion.div
                animate={{ y: [5, -10, 5], x: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: 2 }}
                className="hidden sm:block absolute top-8 right-8 bg-purple-500 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-bold"
              >
                🎯 Level Up!
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex justify-center gap-3 mt-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="relative"
              >
                <motion.div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i === idx ? "w-10 bg-gradient-to-l from-green-400 to-emerald-500" : "w-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                  layoutId={undefined}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-400"
      >
        <span className="text-xs font-medium">اكتشف المزيد</span>
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
          />
        </div>
      </motion.div>
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
        <StatItem num={1200} suffix="+" label="طالب نشط" icon="👥" gradient="from-green-400 to-emerald-500" />
        <StatItem num={97} suffix="%" label="راضين تماماً" icon="⭐" gradient="from-yellow-400 to-amber-500" />
        <StatItem num={7} suffix="7 دورات" label="كل المستويات" icon="📈" gradient="from-blue-400 to-blue-600" />
        <StatItem num={24} suffix="24h" label="تقدم ملموس" icon="⚡" gradient="from-purple-400 to-purple-600" />
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   4. COURSES
═══════════════════════════════════════════════════ */

function PlanCard({ plan, i }: { plan: typeof PLANS[number]; i: number }) {
  const colorMap: Record<string, { bg: string; text: string; light: string; lightBorder: string; border: string; shadow: string; ring: string; tint: string }> = {
    green:  { bg: "from-green-500 to-emerald-600",   text: "text-green-700",  light: "bg-green-50",  lightBorder: "border-green-100",  border: "border-green-400",  shadow: "shadow-green-200/60",  ring: "ring-green-400/20",  tint: "bg-green-50/60"  },
    blue:   { bg: "from-blue-500 to-blue-600",       text: "text-blue-700",   light: "bg-blue-50",   lightBorder: "border-blue-100",   border: "border-blue-300",   shadow: "shadow-blue-200/40",   ring: "ring-blue-400/20",   tint: "bg-blue-50/60"   },
    purple: { bg: "from-purple-500 to-purple-600",   text: "text-purple-700", light: "bg-purple-50", lightBorder: "border-purple-100", border: "border-purple-300", shadow: "shadow-purple-200/40", ring: "ring-purple-400/20", tint: "bg-purple-50/60" },
    orange: { bg: "from-orange-500 to-amber-500",    text: "text-orange-700", light: "bg-orange-50", lightBorder: "border-orange-100", border: "border-orange-300", shadow: "shadow-orange-200/40", ring: "ring-orange-400/20", tint: "bg-orange-50/60" },
    gold:   { bg: "from-yellow-500 to-amber-600",    text: "text-amber-700",  light: "bg-amber-50",  lightBorder: "border-amber-100",  border: "border-amber-400",  shadow: "shadow-amber-200/50",  ring: "ring-amber-400/20",  tint: "bg-amber-50/60"  },
    slate:  { bg: "from-slate-600 to-slate-800",     text: "text-slate-700",  light: "bg-slate-50",  lightBorder: "border-slate-100",  border: "border-slate-400",  shadow: "shadow-slate-200/50",  ring: "ring-slate-400/20",  tint: "bg-slate-50/60"  },
  }
  const c = colorMap[plan.color] || colorMap.blue

  const savings =
    plan.originalPrice && plan.originalPrice > plan.price
      ? plan.originalPrice - plan.price
      : null

  const highlights = plan.lifetimePerks.slice(0, 5)
  const isZeroEnglish = plan.canonicalId === 'basic'

  return (
    <motion.div
      custom={i}
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-400 group ${
        plan.popular
          ? `bg-white border-2 ${c.border} shadow-2xl ${c.shadow} ring-4 ${c.ring}`
          : plan.badge
          ? `bg-white border-2 ${c.border} shadow-xl ${c.shadow}`
          : `bg-white border-2 border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-xl`
      }`}
    >
      {plan.badge && (
        <div className={`bg-gradient-to-l ${c.bg} px-6 py-2.5 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-xs font-extrabold inline-flex items-center gap-2 relative z-10"
          >
            {plan.badge}
          </motion.span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.5 }}
            className={`w-11 h-11 bg-gradient-to-br ${c.bg} rounded-2xl flex items-center justify-center text-xl shadow-lg flex-shrink-0`}
          >
            {plan.emoji}
          </motion.div>
          <div className="min-w-0">
            {isZeroEnglish ? (
              <div className="inline-flex items-center gap-1 bg-gradient-to-l from-yellow-400 to-amber-500 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full mb-0.5 border border-amber-300 shadow-sm shadow-amber-200">
                ⭐ أحسن اختيار لي 0 إنجليزية
              </div>
            ) : (
              <div className={`inline-flex items-center gap-1 ${c.light} ${c.text} text-[10px] font-black px-2 py-0.5 rounded-full mb-0.5 border ${c.lightBorder}`}>
                المستوى {plan.levelLabel}
              </div>
            )}
            <h3 className="font-black text-gray-900 text-lg leading-tight">{plan.title}</h3>
          </div>
        </div>

        <div className={`${c.light} rounded-2xl p-4 mb-4 text-center border ${c.lightBorder}`}>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{plan.price.toLocaleString()}</span>
            <span className={`${c.text} text-base font-extrabold`}>
              {plan.currency}{plan.isHourly ? ' / الساعة' : ''}
            </span>
            {plan.originalPrice && plan.originalPrice > plan.price && (
              <span className="text-gray-400 text-sm font-bold line-through">{plan.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {savings && (
            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
              🔥 وفّر {savings.toLocaleString()} درهم
            </div>
          )}
        </div>

        {plan.includesPrevious && (
          <div className={`mb-3 flex items-start gap-1.5 text-[12px] font-black ${c.text} leading-snug`}>
            <span className="text-sm leading-none">✦</span>
            <span>{plan.includesPrevious}</span>
          </div>
        )}

        <ul className="space-y-1.5 mb-4">
          {highlights.map((f, j) => (
            <li key={j} className="flex items-start gap-2 text-[13px] leading-snug">
              <span className={`mt-0.5 ${c.text} flex-shrink-0 font-black`}>✓</span>
              <span className="text-gray-700 font-semibold">{f}</span>
            </li>
          ))}
        </ul>

        <div className={`mb-4 ${c.light} border ${c.lightBorder} rounded-xl px-3 py-2`}>
          <div className={`text-[10px] font-black ${c.text} uppercase tracking-wider mb-0.5`}>
            📅 المتابعة
          </div>
          <div className="text-gray-800 text-[13px] font-bold leading-snug">
            {plan.followUpLabel}
          </div>
          <div className="text-gray-500 text-[11px] font-semibold mt-0.5">
            المدة · {plan.followUpDuration}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openSubscribe({
              source: `home_plan_${plan.id}_subscribe`,
              planId: plan.canonicalId,
            })}
            className={`flex items-center justify-center gap-1.5 w-full text-center py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
              plan.popular
                ? `bg-gradient-to-l ${c.bg} text-white shadow-xl ${c.shadow} hover:shadow-2xl`
                : plan.badge
                ? `bg-gradient-to-l ${c.bg} text-white shadow-lg ${c.shadow} hover:shadow-xl`
                : `bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200/50 hover:shadow-xl`
            }`}
          >
            💬 اشترك الآن — جاوبني فواتساب
          </button>
          <Link
            href={`/pricing#${plan.id}`}
            onClick={() => {
              try { window.sessionStorage.setItem('inglizi.lead_source', `home_plan_${plan.id}_readmore`) } catch {}
            }}
            className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-900 font-bold text-xs py-1 transition-colors"
          >
            اعرف المزيد على الباقة
            <span className="text-sm">←</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function CoursesSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 relative overflow-hidden">
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-blue-100/15 rounded-full blur-3xl" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            📚 الدورات والأسعار
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            اختار الباقة المناسبة{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                لمستواك
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/70 -skew-x-6 z-0" />
            </span>
          </h2>
          <p className="text-gray-600 mt-4 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            دروس مسجّلة + متابعة شخصية من حمزة + مجموعة واتساب — كلشي مع ضمان استرجاع
          </p>
        </motion.div>

        {/* trust badges */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="flex flex-wrap justify-center gap-3 md:gap-5 mb-14"
        >
          {[
            { icon: "📹", text: "دروس مسجلة" },
            { icon: "💬", text: "مجموعة واتساب" },
            { icon: "📊", text: "متابعة شخصية" },
            { icon: "✅", text: "نتائج مضمونة" },
            { icon: "♾️", text: "وصول مدى الحياة" },
          ].map((b, i) => (
            <motion.span
              key={i}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-2 text-sm text-gray-600 font-semibold bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-base">{b.icon}</span> {b.text}
            </motion.span>
          ))}
        </motion.div>

        {/* main pricing grid — 4 columns on desktop */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
        >
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} i={i} />
          ))}
        </motion.div>

        {/* bundle offer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
          className="mt-12 sm:mt-14 bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 rounded-3xl shadow-2xl shadow-blue-900/50 p-6 sm:p-8 md:p-10 relative overflow-hidden border-2 border-amber-400/30"
        >
          <Particles count={12} className="opacity-50" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl" />

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex-shrink-0 text-6xl drop-shadow-2xl"
            >
              🎁
            </motion.div>
            <div className="flex-1 text-center md:text-right text-white">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                💰 عرض الباقة الكاملة
              </span>
              <h3 className="font-black text-2xl sm:text-3xl mb-2 leading-tight">
                اشترك ف2 باقات ولا أكثر واربح{' '}
                <span className="bg-gradient-to-l from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  خصم خاص
                </span>
              </h3>
              <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed font-semibold">
                تواصل معنا فواتساب باش نعطيوك عرض مخصّص على حساب الباقات اللي بغيتي
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
              <Link
                href="https://wa.me/212707902091?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%D8%A9"
                target="_blank"
                className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 transition-all duration-300 text-base border-2 border-amber-300"
              >
                💬 تواصل الآن
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   HOW IT WORKS — 3 step visual timeline
═══════════════════════════════════════════════════ */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "🎯",
      title: "اختر مستواك",
      desc: "A0 مبتدئ كامل؟ ولا عندك الأساسيات؟ كنحدّدو ليك الباقة المناسبة — بلا تخمين.",
      pill: "دقيقتين فقط",
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
            🧠 النظام ديالنا
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white drop-shadow-xl">
            3 خطوات باش تهضر الإنجليزية{' '}
            <span className="bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              بثقة
            </span>
          </h2>
          <p className="mt-5 text-white/70 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            بلا تعقيد، بلا تخمين، وبلا ما تضيع وقتك فحاجات ما كتخدمش
          </p>
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
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   WHAT YOU GET — visual feature grid
═══════════════════════════════════════════════════ */

function WhatYouGet() {
  const items = [
    {
      icon: "📹",
      title: "دروس فيديو مركّزة",
      desc: "كل فيديو 5-8 دقايق — محتوى مكثّف، بلا حشو، كتشوفهم منين بغيتي، 100% بالدارجة المغربية.",
      theme: 'blue' as const,
    },
    {
      icon: "💬",
      title: "واتساب مع حمزة شخصياً",
      desc: "ترسل ليه رسائل صوتية فأي وقت، كيصحح ليك النطق ويجاوب على أسئلتك — ماشي بوت، بني آدم حقيقي.",
      theme: 'gold' as const,
    },
    {
      icon: "🎯",
      title: "متابعة أسبوعية بالاسم",
      desc: "كل أسبوع كنطلبو منك واجبات بسيطة. كنراجعو، كنصححو، وكنعطيوك تغذية راجعة مخصصة.",
      theme: 'blue' as const,
    },
    {
      icon: "🎁",
      title: "مكتبة PDF + تمارين",
      desc: "ملخصات دقيقة لكل درس + تمارين تطبيق + ڤيديوهات بونوس — حمّل وراجع منين بغيتي.",
      theme: 'gold' as const,
    },
    {
      icon: "🏆",
      title: "نتائج مضمونة بالضمانة",
      desc: "97% من الطلاب كيحسو بالفرق فالشهر الأول. إلا ما لقيتش نتيجة فالأسبوع الأول، كنرجعو ليك الفلوس.",
      theme: 'blue' as const,
    },
    {
      icon: "♾️",
      title: "وصول مدى الحياة",
      desc: "اشترك مرة واحدة — المحتوى كيبقى معاك للأبد. راجع بحال بغيتي، منين بغيتي، بلا تاريخ انتهاء.",
      theme: 'gold' as const,
    },
  ]

  const themes = {
    blue: {
      card: 'bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 border-blue-400/30 hover:border-amber-400/80',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/40',
      title: 'text-white',
      desc: 'text-blue-100/80',
    },
    gold: {
      card: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-white border-amber-200 hover:border-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/50',
      title: 'text-gray-900',
      desc: 'text-gray-700',
    },
  }

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-100/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            🎁 شنو كتاخد ملّي كتشترك
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-gray-900">
            ماشي كورس عادي —{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                نظام كامل
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/70 -skew-x-6 z-0" />
            </span>{' '}
            للنجاح
          </h2>
          <p className="mt-5 text-gray-600 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            كلشي اللي محتاج باش تهضر الإنجليزية بثقة — فبلاصة واحدة، ومتابعة شخصية من الأستاذ حمزة
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {items.map((item, i) => {
            const t = themes[item.theme]
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className={`${t.card} rounded-3xl p-7 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-default`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 ${t.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-xl mb-5 border border-white/20`}
                >
                  {item.icon}
                </motion.div>
                <h3 className={`font-black text-xl ${t.title} mb-2 leading-tight`}>{item.title}</h3>
                <p className={`text-sm font-semibold leading-relaxed ${t.desc}`}>{item.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   MAP PREVIEW — compact progress roadmap
═══════════════════════════════════════════════════ */

function MapSection() {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50 relative overflow-hidden" dir="rtl">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 rounded-3xl p-7 sm:p-12 text-white relative overflow-hidden border border-amber-400/20 shadow-2xl shadow-blue-900/50"
        >
          <Particles count={12} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                  🗺️ خريطة التعلّم
                </span>
                <h3 className="font-black text-2xl sm:text-3xl mb-2 leading-tight">
                  من <span className="text-amber-300">A0</span> حتى الاحتراف —{' '}
                  <span className="bg-gradient-to-l from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    خطّة واضحة
                  </span>
                </h3>
                <p className="text-blue-100/80 text-sm sm:text-base font-semibold">
                  كل مستوى كيبني على اللي قبلو. كنعرفو بالضبط فين كاين وفين غادي.
                </p>
              </div>
              <MagneticButton
                href="/map"
                className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 text-sm flex-shrink-0"
              >
                🗺️ شوف الخريطة كاملة
              </MagneticButton>
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {MAP_NODES.map((n, i) => (
                <div key={i} className="flex items-center gap-1 sm:gap-2 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xl transition-all duration-300 ${
                      n.status === "done" ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-blue-900 shadow-amber-500/50 ring-2 ring-amber-300/30"
                      : n.status === "current" ? "bg-white text-blue-900 shadow-white/40 ring-4 ring-amber-400/40"
                      : "bg-white/5 text-white/30 border border-white/10"
                    }`}>
                      {n.status === "done" ? "✓" : n.label}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold ${n.status === "locked" ? "text-white/30" : "text-white"}`}>{n.city}</span>
                  </motion.div>
                  {i < MAP_NODES.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full ${n.status === "done" ? "bg-gradient-to-l from-amber-400 to-amber-600" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   TESTIMONIALS — high-converting social proof
═══════════════════════════════════════════════════ */

function TestimonialsSection() {
  // Themes are hardcoded class strings so Tailwind always emits them.
  // Palette: royal blue + gold. No black / near-black.
  const THEMES = {
    blue: {
      card:      'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
      shadow:    'shadow-2xl shadow-blue-800/40',
      star:      'text-amber-300',
      quote:     'text-white/95',
      avatarBg:  'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 shadow-amber-500/40',
      glowA:     'bg-amber-400/25',
      glowB:     'bg-blue-300/15',
    },
    gold: {
      card:      'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500',
      shadow:    'shadow-2xl shadow-amber-500/40',
      star:      'text-blue-900',
      quote:     'text-blue-900',
      avatarBg:  'bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-blue-900/40',
      glowA:     'bg-white/30',
      glowB:     'bg-amber-200/40',
    },
    blueDark: {
      card:      'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-800',
      shadow:    'shadow-2xl shadow-blue-900/50',
      star:      'text-amber-400',
      quote:     'text-white/95',
      avatarBg:  'bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 shadow-amber-500/40',
      glowA:     'bg-amber-400/20',
      glowB:     'bg-blue-400/15',
    },
  } as const

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-b from-white via-amber-50/40 to-white relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-amber-100/50 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-blue-100/40 to-transparent blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            ⭐ شهادات حقيقية
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-gray-900">
            شوف شنو قالوا{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                طلاب حمزة
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/70 -skew-x-6 z-0" />
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-2xl drop-shadow-lg">★</span>)}
            </div>
            <span className="font-black text-gray-900 text-xl">4.9/5</span>
            <span className="text-gray-600 font-bold text-sm">· من +1200 طالب</span>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
          {TESTIMONIALS.map((t, i) => {
            const theme = THEMES[t.theme]
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="relative rounded-3xl overflow-hidden group"
              >
                <div className={`${theme.card} ${theme.shadow} p-7 sm:p-8 relative overflow-hidden border border-white/10`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${theme.glowA} rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl`} />
                  <div className={`absolute bottom-0 left-0 w-24 h-24 ${theme.glowB} rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl`} />

                  <div className={`absolute top-5 left-5 text-6xl font-black ${theme.quote} opacity-10 leading-none select-none`}>&ldquo;</div>

                  <div className="flex gap-1 mb-5 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <motion.span
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + j * 0.05, type: 'spring' }}
                        className={`${theme.star} text-xl drop-shadow`}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>

                  <p className={`${theme.quote} leading-[1.9] text-[0.95rem] sm:text-base font-bold relative z-10 mb-6 sm:min-h-[7.5rem]`}>
                    {t.text}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-5 border-t border-white/20 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
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
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="mt-12 sm:mt-14 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-3xl border-2 border-amber-400/30 shadow-2xl shadow-blue-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-amber-500/40">📊</div>
            <div>
              <p className="font-black text-white text-base">97% راضين تماماً</p>
              <p className="text-white/60 text-xs font-semibold">نسبة رضا موثّقة</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/40">⚡</div>
            <div>
              <p className="font-black text-white text-base">نتائج فأسبوع</p>
              <p className="text-white/60 text-xs font-semibold">تقدّم سريع وملموس</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-amber-500/40">🌍</div>
            <div>
              <p className="font-black text-white text-base">طلاب من 22 دولة</p>
              <p className="text-white/60 text-xs font-semibold">مجتمع حي على الواتساب</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   TOOLS — horizontal cards
═══════════════════════════════════════════════════ */

function ToolsSection() {
  return (
    <section className="py-16 sm:py-20 px-5 sm:px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-xs font-black mb-5 shadow-xl shadow-amber-400/40 uppercase tracking-wider">
            🛠️ بونوس — 100% مجاني
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            أدوات مجانية باش تبدا{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                من دابا
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/70 -skew-x-6 z-0" />
            </span>
          </h2>
          <p className="mt-4 text-gray-600 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            ما كتحتاجش تخلّص باش تجرّب — هاد الأدوات مفتوحة للجميع
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {TOOLS.map((t, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} whileHover={{ y: -8 }}>
              <Link
                href={t.href}
                className="block bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-amber-400 shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-300 group text-center h-full"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 w-[80px] h-[80px] rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-2xl shadow-blue-900/40 border border-amber-400/20"
                >
                  {t.icon}
                </motion.div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-5">{t.desc}</p>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 font-black text-xs px-4 py-2 rounded-full shadow-lg shadow-amber-400/30 group-hover:shadow-amber-400/60 transition-shadow">
                  جرّب الآن
                  <motion.span animate={{ x: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════════ */

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 text-white text-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.22),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(96,165,250,0.3),transparent_50%)]" />
      <Particles count={25} className="opacity-70" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 4, repeat: Infinity }} className="w-[500px] h-[500px] rounded-full border-2 border-amber-400/30 absolute -translate-x-1/2 -translate-y-1/2" />
        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="w-[700px] h-[700px] rounded-full border border-amber-400/20 absolute -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-3xl mx-auto relative z-10">
        <span className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 px-5 py-2 rounded-full text-xs font-black mb-6 shadow-2xl shadow-amber-500/40 uppercase tracking-wider">
          ✨ آخر فرصة
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-5 leading-[1.15] drop-shadow-lg">
          جاهز تبدّل حياتك{' '}
          <span className="bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            ف30 يوم؟
          </span>
        </h2>
        <p className="text-white/80 text-lg sm:text-xl mb-10 sm:mb-12 leading-relaxed font-semibold max-w-xl mx-auto">
          انضم لأكثر من <span className="text-amber-300 font-black">+1200 طالب</span> خرجو من الخوف وبداو يهضرو بثقة — بمتابعة شخصية من الأستاذ حمزة
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
   CONVERSION SECTIONS — pain, transformation, fork, mini FAQ
═══════════════════════════════════════════════════ */

function PainHook() {
  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-6 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.18),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(96,165,250,0.25),transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-amber-400/[0.1] to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        custom={0}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border-2 border-amber-400/40 text-amber-300 text-xs font-black px-4 py-2 rounded-full mb-8 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
          <span>⚠️</span>
          <span>9 من كل 10 مغاربة ما كيقدروش يهضرو بالإنجليزية</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.15] mb-7 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          واش باقي كتخاف تهضر بالإنجليزية{' '}
          <span className="bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            قدّام الناس؟
          </span>
        </h2>

        <p className="text-white/90 text-lg sm:text-2xl leading-[1.9] font-semibold max-w-2xl mx-auto">
          سنوات ديال الدراسة، كلمات كتعرفهم…{' '}
          <br className="hidden sm:block" />
          <span className="text-amber-200">ولكن ملّي يجي وقت الهضرة</span>،
          {' '}الكلام كيتقطع.
        </p>

        <div className="mt-10 inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-3 backdrop-blur-sm shadow-xl">
          <span className="text-amber-300 text-lg">👇</span>
          <span className="text-white/90 text-sm sm:text-base font-bold">
            شوف كيفاش بدّل حمزة حياة <span className="text-amber-300 font-black">+1200 طالب</span> ف30 يوم
          </span>
        </div>
      </motion.div>
    </section>
  )
}

function TransformationSection() {
  const items = [
    {
      icon: '🗣️',
      title: 'كتهضر من النهار الأول',
      desc: 'بجُمَل قصيرة وصحيحة. ما كتحفظش معاجم — كتستعمل الإنجليزية مباشرة فالمحادثة.',
      theme: 'blue' as const,
    },
    {
      icon: '💪',
      title: 'كتربح الثقة فنفسك',
      desc: 'كتوقف تقول "أنا ضعيف" وكتبدا تهضر بلا ترجمة فراسك — هاد الحاجة كتبدّل حياتك.',
      theme: 'gold' as const,
    },
    {
      icon: '🎯',
      title: 'خطة حسب مستواك بالضبط',
      desc: 'A0 ولا A1 ولا B1 — كل واحد عندو طريق. ماشي الكل فنفس الطاولة بحال فالمدرسة.',
      theme: 'blue' as const,
    },
    {
      icon: '🎓',
      title: 'تعلّم بهدف واضح',
      desc: 'سفر، خدمة، IELTS، مقابلات، ولا محادثة يومية — كل واحد ومشكلو، وحنا عندنا الحل.',
      theme: 'gold' as const,
    },
  ]

  const themes = {
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900',
      iconShadow: 'shadow-blue-500/40',
      cardBg: 'bg-white',
      border: 'border-blue-100',
      hoverBorder: 'hover:border-blue-300',
      titleColor: 'text-blue-900',
      accent: 'bg-blue-50',
    },
    gold: {
      iconBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600',
      iconShadow: 'shadow-amber-500/40',
      cardBg: 'bg-white',
      border: 'border-amber-100',
      hoverBorder: 'hover:border-amber-300',
      titleColor: 'text-amber-900',
      accent: 'bg-amber-50',
    },
  }

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 bg-gradient-to-b from-white via-blue-50/30 to-white" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-l from-amber-400 to-yellow-500 text-gray-900 text-xs font-black px-4 py-2 rounded-full mb-5 shadow-lg shadow-amber-300/50 uppercase tracking-wider">
            ✨ الحل
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-gray-900">
            بعد 30 يوم مع حمزة،{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                هادشي اللي غيتبدّل فيك
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-300/60 -skew-x-6 z-0" />
            </span>
          </h2>
          <p className="mt-5 text-gray-600 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
            ماشي وعد — نتائج قابلين للقياس. 97% من الطلاب كيحسو بالفرق من الأسبوع الأول.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-5 sm:gap-6"
        >
          {items.map((item, i) => {
            const t = themes[item.theme]
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`flex items-start gap-5 ${t.cardBg} border-2 ${t.border} ${t.hoverBorder} rounded-3xl p-6 sm:p-7 shadow-xl shadow-gray-200/60 hover:shadow-2xl transition-all duration-300`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${t.iconBg} flex items-center justify-center text-2xl shadow-xl ${t.iconShadow}`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-black ${t.titleColor} text-lg sm:text-xl leading-tight mb-2`}>{item.title}</h3>
                  <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed font-semibold">{item.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function LevelTestFork() {
  return (
    <section className="py-16 sm:py-20 px-5 sm:px-6 bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3"
        >
          واش كتعرف مستواك؟
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="text-center text-gray-500 text-base sm:text-lg font-semibold mb-10"
        >
          اختار الطريق اللي يناسبك — نبداو فنفس اللحظة.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-emerald-200 shadow-xl shadow-emerald-100 ring-4 ring-emerald-100/50"
          >
            <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
              الأكثر وضوحاً
            </div>
            <div className="text-5xl mb-4">🧭</div>
            <h3 className="font-black text-gray-900 text-xl sm:text-2xl mb-2 leading-tight">
              ما كنعرفش مستواي
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5 font-semibold">
              عندك 10 أسئلة. 3 دقائق. بعد الاختبار كنعطيك <span className="text-emerald-700 font-black">المستوى ديالك بالضبط</span> + <span className="text-emerald-700 font-black">الباقة المناسبة ليك</span>.
            </p>
            <Link
              href="/level-test"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01]"
            >
              ابدا الاختبار المجاني
              <span>←</span>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            whileHover={{ y: -6, scale: 1.01 }}
            className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-gray-200 shadow-md"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-black text-gray-900 text-xl sm:text-2xl mb-2 leading-tight">
              كنعرف واش باغي
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5 font-semibold">
              شوف الباقات مباشرة حسب مستواك: A0، A1، B1، ولا <span className="font-black">VIP</span> مع الأستاذ شخصياً.
            </p>
            <a
              href="#plans"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm rounded-2xl transition-all"
            >
              شوف الباقات
              <span>←</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function MiniFAQ() {
  const items = [
    {
      q: '😩 قريت الإنجليزية سنين فالمدرسة وما زال ما كنقدرش نهضر. فين المشكل؟',
      a: 'المدرسة كتعلّمك القواعد والكلمات، ولكن ما كتعلّمكش كيف تهضر. مع الأستاذ حمزة كتبدا تهضر من النهار الأول — جُمَل قصيرة، محادثات حقيقية، تصحيح فوري. فبعد 30 يوم غتحس ب نفسك كتهضر بلا ما تفكّر فالترجمة.',
    },
    {
      q: '😳 أنا خجول بزّاف ونخاف نغلط. واش غنقدر نهضر؟',
      a: 'هاد الخوف هو اللي كيوقفك. الأستاذ حمزة كيخدم معاك شخصياً فواتساب — تيرسل ليه رسائل صوتية فأي وقت، بلا قدّام الناس، بلا إحراج. كل غلطة هي تقدّم — كنصححو بلطف.',
    },
    {
      q: '📱 جرّبت Duolingo وأبليكاشنات أخرى وما نفعوني. علاش هادي غادي تكون مختلفة؟',
      a: 'الأبليكاشنات كيعلموك كلمات منفصلة. أنت محتاج تتعلّم تهضر مع بني آدم حقيقي كيصحح ليك، كيحاسبك، ويفهم السياق المغربي ديالك. حمزة كيدمج دروس مسجلة + متابعة شخصية + مجموعة واتساب — نظام كامل ماشي لعبة.',
    },
    {
      q: '⏰ واش 30 يوم بحال هادي كافيين باش نبدا نهضر؟',
      a: 'نعم — إذا تخدم 15-20 دقيقة فاليوم بالمنهج الصحيح. فالأسبوع الأول غتحفظ 50+ جملة يومية. فالأسبوع 2 غتبدا تستخدمهم. فاليوم 30 غتعرف تدير محادثة قصيرة. المفتاح هو الاستمرارية — وحنا كنتابعوك باش ما توقفش.',
    },
    {
      q: '💼 مشغول بالخدمة/الدراسة، ما عنديش وقت. واش كنقدر نستفد؟',
      a: 'الدروس كلها مسجلة وكتبقى معاك مدى الحياة — كتشوفهم منين بغيتي، فالطوبيس، قبل النعاس، فوقت الكافي. 15-20 دقيقة فاليوم كافيين. معظم الطلبة ديالنا مشغولين — وهادشي هو اللي كيخدم.',
    },
    {
      q: '🧓 كبرت شوية وعقلي ما بقاش كيحفظ بحال بكري. واش غادي نقدر نتعلّم؟',
      a: 'المنهج ديال الأستاذ حمزة ماشي على الحفظ — هو على التفعيل. كلّ مغربي عارف كلمات إنجليزية أكثر من اللي كيظن. الطريقة كتعلّمك كيفاش تستعملهم. عندنا طلبة فوق 50 عام بدّلو حياتهم ف3 شهور.',
    },
    {
      q: '👨‍🏫 واش الأستاذ حمزة هو اللي كيتابع معايا، ولاّ مساعد؟',
      a: 'حمزة شخصياً كيجاوب على الواتساب — ماشي بوت، ماشي مساعد. فباقات Pro / Premium / VIP كيكون عندك مجموعة واتساب مباشرة معاه + كوتشينغ شخصي فالـVIP. كتدير ريكوردينغ ديال صوتك، كيصححو بنفسو.',
    },
    {
      q: '💰 واش كاين ضمان إلا ما نجحش معايا؟',
      a: 'نعم. إذا ما اقتنعتيش فالأسبوع الأول، كنرجعو ليك الفلوس كاملين بلا أسئلة. وعندك وصول مدى الحياة للدروس — حتى ولا سكرتي الاشتراك، المحتوى كيبقى معاك.',
    },
    {
      q: '💳 كيفاش كنخلّص؟ واش كيتجدّد تلقائياً؟',
      a: 'تحويل بنكي مغربي CIH — كنفعلو الاشتراك فأقل من 24 ساعة. ما كيتجدّدش تلقائياً: أنت اللي كتتحكّم. كيسالى فوقتو — بلا مفاجآت، بلا خصم من كارت.',
    },
  ]
  return (
    <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black px-3 py-1.5 rounded-full mb-3">
            🎯 الحقيقة اللي كاع ما كيقولوهاش ليك
          </div>
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
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-600 text-sm leading-relaxed font-semibold">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE — new section order
═══════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800">
      <HeroSlider />
      <StatsStrip />
      <PainHook />
      <TransformationSection />
      <LevelTestFork />
      <div id="plans">
        <CoursesSection />
      </div>
      <TestimonialsSection />
      <HowItWorks />
      <WhatYouGet />
      <MapSection />
      <ToolsSection />
      <MiniFAQ />
      <FinalCTA />
    </div>
  )
}
