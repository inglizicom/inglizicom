"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from "framer-motion"
import Link from "next/link"
import { TESTIMONIALS } from "@/data/testimonials"

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

const PLANS = [
  {
    id: "a0a1", slug: "a0-a1", title: "A0 → A1", subtitle: "المستوى الأول", emoji: "🌱", popular: true,
    badge: "🔥 الأكثر طلباً",
    desc: "من الصفر المطلق إلى أول محادثة حقيقية",
    price: 750, currency: "DH",
    xp: 500,
    rating: 4.9, ratingCount: 184, seatsLeft: 3, recentBuyers: 7,
    features: [
      "📹 دروس مسجلة عالية الجودة",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية مستمرة",
      "✅ نتائج مضمونة",
      "📂 ملفات PDF تدريبية",
      "♾️ وصول مدى الحياة",
    ],
    color: "green", gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "a1a2", slug: "a1-a2", title: "A1 → A2", subtitle: "المحادثة اليومية", emoji: "💬", popular: false,
    badge: null,
    desc: "تحدث بثقة في المواقف اليومية البسيطة",
    price: 1200, currency: "DH",
    xp: 1200,
    rating: 4.8, ratingCount: 96, seatsLeft: 5, recentBuyers: 4,
    features: [
      "📹 دروس مسجلة متقدمة",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية مستمرة",
      "✅ نتائج مضمونة",
      "📂 ملفات PDF تدريبية",
      "♾️ وصول مدى الحياة",
    ],
    color: "blue", gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "a2b1", slug: "a2-b1", title: "A2 → B1", subtitle: "المتوسط", emoji: "🚀", popular: false,
    badge: null,
    desc: "عبّر عن أفكارك بطلاقة وافهم المحادثات المعقدة",
    price: 1700, currency: "DH",
    xp: 2500,
    rating: 4.9, ratingCount: 72, seatsLeft: null, recentBuyers: 3,
    features: [
      "📹 دروس مسجلة متقدمة",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية مستمرة",
      "✅ نتائج مضمونة",
      "📂 ملفات PDF تدريبية",
      "♾️ وصول مدى الحياة",
    ],
    color: "purple", gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "b1b2", slug: "b1-b2", title: "B1 → B2", subtitle: "المتقدم", emoji: "⚡", popular: false,
    badge: null,
    desc: "نقاشات عميقة وفهم شامل لأي سياق",
    price: 2500, currency: "DH",
    xp: 4000,
    rating: 5.0, ratingCount: 48, seatsLeft: 2, recentBuyers: null,
    features: [
      "📹 دروس مسجلة احترافية",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية مكثفة",
      "✅ نتائج مضمونة",
      "📂 ملفات PDF تدريبية",
      "♾️ وصول مدى الحياة",
    ],
    color: "orange", gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "business", slug: null, title: "Business English", subtitle: "إنجليزية الأعمال", emoji: "💼", popular: false,
    badge: "⭐ Premium",
    desc: "3 أشهر متابعة شخصية + حصص مباشرة + دروس مسجلة",
    price: 5000, currency: "DH",
    xp: 8000,
    rating: 5.0, ratingCount: 34, seatsLeft: 4, recentBuyers: null,
    features: [
      "📹 دروس مسجلة احترافية",
      "🎥 حصص LIVE مباشرة",
      "👤 3 أشهر متابعة شخصية",
      "💬 مجموعة واتساب VIP",
      "📂 ملفات PDF متقدمة",
      "🏆 شهادة إتمام معتمدة",
    ],
    color: "gold", gradient: "from-yellow-500 to-amber-600",
  },
  {
    id: "grammar", slug: null, title: "Grammar Course", subtitle: "القواعد حتى A2", emoji: "📖", popular: false,
    badge: null,
    desc: "أساسيات القواعد من الصفر إلى المستوى المتوسط",
    price: 1300, currency: "DH",
    xp: 1500,
    rating: 4.8, ratingCount: 58, seatsLeft: null, recentBuyers: 2,
    features: [
      "📹 دروس قواعد مسجلة",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية",
      "📂 ملفات PDF وتمارين",
      "✅ نتائج مضمونة",
      "♾️ وصول مدى الحياة",
    ],
    color: "teal", gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "advanced-grammar", slug: null, title: "Advanced Grammar", subtitle: "قواعد متقدمة", emoji: "🎓", popular: false,
    badge: null,
    desc: "إتقان كامل للقواعد المتقدمة والتراكيب المعقدة",
    price: 2000, currency: "DH",
    xp: 3000,
    rating: 4.9, ratingCount: 41, seatsLeft: null, recentBuyers: null,
    features: [
      "📹 دروس قواعد متقدمة",
      "💬 مجموعة واتساب خاصة",
      "📊 متابعة شخصية مكثفة",
      "📂 ملفات PDF متقدمة",
      "✅ نتائج مضمونة",
      "♾️ وصول مدى الحياة",
    ],
    color: "indigo", gradient: "from-indigo-500 to-violet-600",
  },
]

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
                <MagneticButton
                  href="/onboarding"
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
                </MagneticButton>

                <Link
                  href="/courses"
                  className="border-2 border-gray-200 hover:border-green-300 bg-white/80 backdrop-blur-sm text-gray-700 font-extrabold text-base px-10 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-lg"
                >
                  شاهد الدورات
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 rounded-3xl" />

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
  const colorMap: Record<string, { bg: string; text: string; light: string; border: string; shadow: string; ring: string }> = {
    green:  { bg: "from-green-500 to-emerald-600", text: "text-green-600", light: "bg-green-50", border: "border-green-400", shadow: "shadow-green-200/60", ring: "ring-green-400/20" },
    blue:   { bg: "from-blue-500 to-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-300", shadow: "shadow-blue-200/40", ring: "ring-blue-400/20" },
    purple: { bg: "from-purple-500 to-purple-600", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-300", shadow: "shadow-purple-200/40", ring: "ring-purple-400/20" },
    orange: { bg: "from-orange-500 to-amber-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-300", shadow: "shadow-orange-200/40", ring: "ring-orange-400/20" },
    gold:   { bg: "from-yellow-500 to-amber-600", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-400", shadow: "shadow-amber-200/50", ring: "ring-amber-400/20" },
    teal:   { bg: "from-teal-500 to-cyan-600", text: "text-teal-600", light: "bg-teal-50", border: "border-teal-300", shadow: "shadow-teal-200/40", ring: "ring-teal-400/20" },
    indigo: { bg: "from-indigo-500 to-violet-600", text: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-300", shadow: "shadow-indigo-200/40", ring: "ring-indigo-400/20" },
  }
  const c = colorMap[plan.color] || colorMap.blue

  const subscribeHref = '/billing'
  const waHref = `https://wa.me/212707902091?text=${encodeURIComponent(`مرحبا، أريد الاشتراك في ${plan.title}`)}`
  const isLowStock = plan.seatsLeft !== null && plan.seatsLeft !== undefined && plan.seatsLeft <= 5

  return (
    <motion.div
      custom={i}
      variants={fadeUp}
      whileHover={{ y: -8, scale: 1.015 }}
      className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-400 group ${
        plan.popular
          ? `bg-white border-2 ${c.border} shadow-2xl ${c.shadow} ring-4 ${c.ring}`
          : plan.badge
          ? `bg-white border-2 ${c.border} shadow-xl ${c.shadow}`
          : `bg-white border-2 border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-xl`
      }`}
    >
      {/* top ribbon */}
      {plan.badge && (
        <div className={`bg-gradient-to-l ${c.bg} px-6 py-3 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-sm font-extrabold inline-flex items-center gap-2 relative z-10"
          >
            {plan.badge}
          </motion.span>
        </div>
      )}

      {/* low-stock banner */}
      {isLowStock && !plan.badge && (
        <div className="bg-gradient-to-l from-red-500 to-orange-500 px-4 py-2 text-center">
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white text-xs font-black inline-flex items-center gap-1.5"
          >
            ⏰ باقي {plan.seatsLeft} مقاعد فقط
          </motion.span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 sm:p-6 md:p-7">
        {/* emoji + title */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.5 }}
            className={`w-12 h-12 bg-gradient-to-br ${c.bg} rounded-2xl flex items-center justify-center text-xl shadow-lg flex-shrink-0`}
          >
            {plan.emoji}
          </motion.div>
          <div className="min-w-0">
            <h3 className="font-black text-gray-900 text-lg leading-tight">{plan.title}</h3>
            <p className="text-gray-500 text-xs font-semibold">{plan.subtitle}</p>
          </div>
        </div>

        {/* social proof row */}
        {(plan.rating || plan.recentBuyers || (isLowStock && plan.badge)) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-4 text-xs">
            {plan.rating && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-lg font-black">
                <span className="text-yellow-500">★</span>
                {plan.rating}
                {plan.ratingCount && <span className="text-amber-600/70 font-semibold">({plan.ratingCount})</span>}
              </span>
            )}
            {plan.recentBuyers !== null && plan.recentBuyers !== undefined && plan.recentBuyers > 0 && (
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg font-black"
              >
                🔥 {plan.recentBuyers} اشترو اليوم
              </motion.span>
            )}
            {isLowStock && plan.badge && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-lg font-black">
                ⏰ باقي {plan.seatsLeft} مقاعد
              </span>
            )}
          </div>
        )}

        <p className="text-gray-600 text-sm leading-[1.7] mb-5">{plan.desc}</p>

        {/* price block */}
        <div className={`${c.light} rounded-2xl p-4 mb-5 text-center border border-gray-100/50`}>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{plan.price.toLocaleString()}</span>
            <span className={`${c.text} text-base font-extrabold`}>{plan.currency}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="text-gray-500 text-xs font-bold">+{plan.xp.toLocaleString()} XP مكافأة</span>
            <span className="text-yellow-400">✨</span>
          </div>
        </div>

        {/* features list */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {plan.features.slice(0, 5).map((f, j) => (
            <li key={j} className="flex items-center gap-2.5 text-sm">
              <span className="text-base flex-shrink-0">{f.slice(0, 2)}</span>
              <span className="text-gray-700 font-bold">{f.slice(2).trim()}</span>
            </li>
          ))}
        </ul>

        {/* dual CTAs */}
        <div className="flex flex-col gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={subscribeHref}
              className={`block w-full text-center py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-300 ${
                plan.popular
                  ? `bg-gradient-to-l ${c.bg} text-white shadow-xl ${c.shadow} hover:shadow-2xl`
                  : plan.badge
                  ? `bg-gradient-to-l ${c.bg} text-white shadow-lg ${c.shadow} hover:shadow-xl`
                  : `bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200/50 hover:shadow-xl`
              }`}
            >
              🔓 اشترك مباشرة
            </Link>
          </motion.div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            💬 أو تواصل مع الأستاذ
          </a>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-3 font-semibold">
          ✓ نتائج مضمونة · ✓ إلغاء في أي وقت
        </p>
      </div>
    </motion.div>
  )
}

function CoursesSection() {
  const mainPlans = PLANS.slice(0, 4)
  const extraPlans = PLANS.slice(4)

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
          <span className="inline-flex items-center gap-2 bg-green-100/80 text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-green-200/50">
            📚 الدورات والأسعار
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            اختر الخطة المناسبة
            <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent"> لمستواك</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            دورات مصممة بعناية تشمل دروس مسجلة + متابعة شخصية + مجموعة واتساب + نتائج مضمونة
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
          {mainPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} i={i} />
          ))}
        </motion.div>

        {/* specialty courses label */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mt-16 mb-8"
        >
          <span className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-700 px-5 py-2 rounded-full text-sm font-bold border border-amber-200/50">
            ⭐ دورات متخصصة
          </span>
        </motion.div>

        {/* specialty courses — 3 columns */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
        >
          {extraPlans.map((plan, i) => (
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
          className="mt-10 sm:mt-14 bg-gradient-to-l from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl shadow-2xl shadow-green-200/40 p-5 sm:p-8 md:p-10 relative overflow-hidden"
        >
          <Particles count={12} />
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex-shrink-0 text-6xl"
            >
              🎁
            </motion.div>
            <div className="flex-1 text-center md:text-right text-white">
              <h3 className="font-black text-2xl mb-2">باقة كاملة — وفر أكثر 💰</h3>
              <p className="text-green-100 text-sm leading-relaxed">
                اشترك في 2 مستويات أو أكثر واحصل على <span className="font-black text-yellow-300 text-base">خصم خاص</span> — تواصل معنا عبر واتساب للتفاصيل والعرض المخصص
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
              <Link
                href="https://wa.me/212707902091?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A8%D8%A7%D9%82%D8%A9%20%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%D8%A9"
                target="_blank"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-base"
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
    { num: "01", icon: "🎯", title: "اختر دورتك", desc: "اختر المستوى اللي يناسبك — من A0 حتى Business English", gradient: "from-green-500 to-emerald-600" },
    { num: "02", icon: "📹", title: "تعلم بالفيديو", desc: "شاهد الدروس المسجلة + تابع مع المجموعة على واتساب", gradient: "from-blue-500 to-blue-600" },
    { num: "03", icon: "🏆", title: "حقق النتائج", desc: "متابعة شخصية + تمارين يومية = نتائج مضمونة", gradient: "from-purple-500 to-violet-600" },
  ]

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-50/30 to-blue-50/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-blue-200/50">
            🧠 كيف يعمل
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            3 خطوات
            <span className="bg-gradient-to-l from-blue-500 to-blue-700 bg-clip-text text-transparent"> للنجاح</span>
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-0">
          {steps.map((s, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} className="relative">
              {/* connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-16 -left-[1px] w-full h-0.5 bg-gradient-to-l from-gray-200 to-transparent z-0" />
              )}

              <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-8 text-center mx-0 md:mx-2 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                {/* number */}
                <span className="absolute top-5 left-5 text-6xl font-black text-gray-100/80 leading-none select-none">{s.num}</span>

                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 bg-gradient-to-br ${s.gradient} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl relative z-10`}
                >
                  {s.icon}
                </motion.div>
                <h3 className="font-black text-xl text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">{s.desc}</p>
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
    { icon: "📹", title: "دروس مسجلة", desc: "فيديوهات عالية الجودة تشاهدها وقتما تشاء", bg: "from-blue-50 to-sky-50", border: "hover:border-blue-300" },
    { icon: "💬", title: "مجموعة واتساب", desc: "تواصل مباشر مع المعلم وزملائك في المجموعة", bg: "from-green-50 to-emerald-50", border: "hover:border-green-300" },
    { icon: "📊", title: "متابعة شخصية", desc: "نتابع تقدمك خطوة بخطوة ونصحح أخطاءك", bg: "from-purple-50 to-violet-50", border: "hover:border-purple-300" },
    { icon: "📂", title: "ملفات PDF", desc: "ملخصات وتمارين تحملها وتراجعها في أي وقت", bg: "from-orange-50 to-amber-50", border: "hover:border-orange-300" },
    { icon: "✅", title: "نتائج مضمونة", desc: "97% من طلابنا يحققون تقدم ملموس خلال أول شهر", bg: "from-emerald-50 to-teal-50", border: "hover:border-emerald-300" },
    { icon: "♾️", title: "وصول مدى الحياة", desc: "اشترك مرة واحدة واحتفظ بالمحتوى للأبد", bg: "from-pink-50 to-rose-50", border: "hover:border-pink-300" },
  ]

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50/60 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-green-50/40 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-2 bg-green-100/80 text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-green-200/50">
            🎁 شنو غادي تاخد
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            كل دورة تشمل
            <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent"> كل هاد المزايا</span>
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-gradient-to-br ${item.bg} rounded-3xl p-7 border-2 border-transparent ${item.border} transition-all duration-300 group cursor-default`}
            >
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0] }}
                className="text-4xl mb-4"
              >
                {item.icon}
              </motion.div>
              <h3 className="font-black text-lg text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
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
    <section className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden"
        >
          <Particles count={10} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h3 className="font-black text-xl sm:text-2xl mb-1">خريطة تقدمك الشخصية</h3>
                <p className="text-blue-200 text-sm font-medium">تابع رحلتك من A0 حتى الاحتراف — كل مستوى تنجزه يفتح التالي</p>
              </div>
              <MagneticButton href="/map" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex-shrink-0">
                🗺️ شوف الخريطة
              </MagneticButton>
            </div>

            {/* compact level progress */}
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {MAP_NODES.map((n, i) => (
                <div key={i} className="flex items-center gap-1 sm:gap-2 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-lg transition-all duration-300 ${
                      n.status === "done" ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/30"
                      : n.status === "current" ? "bg-white text-blue-700 shadow-white/30 ring-2 ring-white/30"
                      : "bg-white/10 text-white/40 border border-white/15"
                    }`}>
                      {n.status === "done" ? "✓" : n.label}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold ${n.status === "locked" ? "text-white/40" : "text-white/80"}`}>{n.city}</span>
                  </motion.div>
                  {i < MAP_NODES.length - 1 && (
                    <div className={`flex-1 h-0.5 sm:h-1 rounded-full ${n.status === "done" ? "bg-gradient-to-l from-green-300 to-green-500" : "bg-white/10"}`} />
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
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white via-orange-50/30 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-yellow-50/40 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* header with social proof stats */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 bg-yellow-100/80 text-yellow-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-yellow-200/50">
            ⭐ نتائج حقيقية من طلاب حقيقيين
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            شوف شنو قالوا
            <span className="bg-gradient-to-l from-yellow-500 to-orange-500 bg-clip-text text-transparent"> طلابنا</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
            </div>
            <span className="font-black text-gray-900 text-lg">4.9/5</span>
            <span className="text-gray-500 font-semibold text-sm">من +1200 طالب</span>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative rounded-3xl overflow-hidden group"
            >
              <div className={`bg-gradient-to-br ${t.color} p-6 sm:p-7 text-white relative`}>
                {/* decorative circles */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* stars */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(5)].map((_, j) => (
                    <motion.span key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + j * 0.05, type: "spring" }} className="text-yellow-300 text-lg">★</motion.span>
                  ))}
                </div>

                {/* quote */}
                <p className="text-white/95 leading-[1.9] text-[0.95rem] font-medium relative z-10 mb-2">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* author bar */}
              <div className="bg-white px-6 py-4 border-x-2 border-b-2 border-gray-100 rounded-b-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${t.color} rounded-xl flex items-center justify-center text-lg shadow-md`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      وصل مستوى {t.level}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-black border border-green-100">
                  نتيجة حقيقية
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* bottom trust bar */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="mt-8 sm:mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">📊</div>
            <div>
              <p className="font-black text-gray-900 text-sm">97% راضين تماما</p>
              <p className="text-gray-500 text-xs font-semibold">نسبة رضا مؤكدة</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">⚡</div>
            <div>
              <p className="font-black text-gray-900 text-sm">نتائج من أول أسبوع</p>
              <p className="text-gray-500 text-xs font-semibold">تقدم سريع وملموس</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-lg">🌍</div>
            <div>
              <p className="font-black text-gray-900 text-sm">طلاب من 15+ دولة</p>
              <p className="text-gray-500 text-xs font-semibold">مجتمع عالمي نشط</p>
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
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50/60 to-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-purple-200/50">
            🛠️ أدوات مجانية
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            أدوات تساعدك
            <span className="bg-gradient-to-l from-purple-500 to-purple-700 bg-clip-text text-transparent"> تتعلم أسرع</span>
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {TOOLS.map((t, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} whileHover={{ y: -8 }}>
              <Link href={t.href} className="block bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 shadow-md hover:shadow-xl transition-all duration-300 group text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className={`bg-gradient-to-br ${t.gradient} w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg`}
                >
                  {t.icon}
                </motion.div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4">{t.desc}</p>
                <span className="inline-flex items-center gap-1 text-purple-600 font-bold text-sm group-hover:underline">
                  جرب الآن <motion.span animate={{ x: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</motion.span>
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
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white text-center relative overflow-hidden">
      <Particles count={25} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="w-[400px] h-[400px] rounded-full border-2 border-white/20 absolute -translate-x-1/2 -translate-y-1/2" />
        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="w-[600px] h-[600px] rounded-full border border-white/10 absolute -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-2xl mx-auto relative z-10">
        <motion.div animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }} className="text-7xl mb-8">🚀</motion.div>
        <h2 className="text-2xl sm:text-3xl md:text-[3.2rem] font-black mb-5 leading-tight">جاهز تبدأ رحلتك؟</h2>
        <p className="text-white/90 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed font-semibold">انضم لأكثر من 1200 طالب يتعلمون الإنجليزية بطريقة ممتعة وفعالة</p>

        <div className="flex flex-wrap justify-center gap-5">
          <MagneticButton href="/onboarding" className="bg-white text-green-700 font-black px-12 py-5 rounded-2xl shadow-2xl shadow-green-900/30 hover:shadow-green-900/40 transition-all duration-300 text-lg inline-flex items-center gap-2">
            ابدأ الآن
          </MagneticButton>
          <MagneticButton href="https://wa.me/212707902091" className="bg-white/15 backdrop-blur-sm text-white font-bold px-10 py-5 rounded-2xl border-2 border-white/30 hover:bg-white/25 transition-all duration-300 inline-flex items-center gap-2">
            💬 تواصل معنا
          </MagneticButton>
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-white/70 text-sm font-semibold mt-10 flex items-center justify-center gap-3 flex-wrap">
          <span>✅ نتائج مضمونة</span>
          <span className="w-1 h-1 bg-green-200/40 rounded-full" />
          <span>💬 دعم واتساب مباشر</span>
          <span className="w-1 h-1 bg-green-200/40 rounded-full" />
          <span>♾️ وصول مدى الحياة</span>
        </motion.p>
      </motion.div>
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
      <CoursesSection />
      <HowItWorks />
      <WhatYouGet />
      <TestimonialsSection />
      <MapSection />
      <ToolsSection />
      <FinalCTA />
    </div>
  )
}
