"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from "framer-motion"
import Link from "next/link"

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

const FEATURES = [
  { icon: "🎯", title: "نتائج حقيقية", desc: "97% من طلابنا لاحظوا تحسن واضح خلال أول شهر", gradient: "from-green-400 to-emerald-500", bg: "from-green-50 to-emerald-50", border: "hover:border-green-300" },
  { icon: "🔊", title: "صوت ونطق", desc: "تمارين استماع ونطق تفاعلية مع تصحيح فوري", gradient: "from-blue-400 to-blue-600", bg: "from-blue-50 to-sky-50", border: "hover:border-blue-300" },
  { icon: "🚀", title: "تقدم سريع", desc: "نظام XP والمكافآت يخليك متحمس كل يوم", gradient: "from-purple-400 to-purple-600", bg: "from-purple-50 to-violet-50", border: "hover:border-purple-300" },
  { icon: "💬", title: "تعلم بالمحادثة", desc: "تعلم من مواقف حقيقية مش من كتب مملة", gradient: "from-orange-400 to-orange-500", bg: "from-orange-50 to-amber-50", border: "hover:border-orange-300" },
]

const COURSES = [
  { level: "A0", title: "المبتدئ المطلق", desc: "أول خطوة — تتعلم التحيات والكلام الأساسي", dur: "3 أسابيع", price: "99 درهم", open: true, featured: true, progress: 0 },
  { level: "A1", title: "الأساسيات", desc: "أول جمل وتعبيرات حقيقية من الحياة اليومية", dur: "4 أسابيع", price: "149 درهم", open: true, featured: false, progress: 0 },
  { level: "A2", title: "المحادثة اليومية", desc: "تحدث في المواقف اليومية بثقة وسهولة", dur: "5 أسابيع", price: "149 درهم", open: true, featured: false, progress: 0 },
  { level: "B1", title: "المتوسط", desc: "عبّر عن أفكارك ومشاعرك بالإنجليزية", dur: "6 أسابيع", price: "199 درهم", open: true, featured: false, progress: 0 },
  { level: "B2", title: "فوق المتوسط", desc: "نقاش وفهم عميق لأي موضوع أو سياق", dur: "7 أسابيع", price: "249 درهم", open: false, featured: false, progress: 0 },
  { level: "C1", title: "الاحتراف", desc: "طلاقة كاملة في كل المجالات والسياقات", dur: "8 أسابيع", price: "299 درهم", open: false, featured: false, progress: 0 },
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

const TESTIMONIALS = [
  { name: "سارة م.", text: "من أحسن قرار خذيته — بديت نتكلم إنجليزية في أسبوعين!", avatar: "👩‍🎓", level: "A2", color: "from-pink-400 to-rose-500" },
  { name: "يوسف ب.", text: "الطريقة ممتعة بزاف وماكتحسش بالملل أبدا. شكرا حمزة!", avatar: "👨‍💻", level: "B1", color: "from-blue-400 to-indigo-500" },
  { name: "نادية ك.", text: "ولادي كيتعلمو معايا — الموقع سهل ومفهوم للجميع", avatar: "👩‍🏫", level: "A1", color: "from-green-400 to-emerald-500" },
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
      className="relative min-h-[94vh] flex items-center overflow-hidden"
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

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6 py-20 relative z-10 w-full">
        {/* TEXT SIDE */}
        <div className="order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-green-100/80 backdrop-blur-sm text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-6 border border-green-200/50"
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

              <h1 className="text-4xl md:text-[3.4rem] font-extrabold leading-[1.2] mb-5">
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
                <span className="text-gray-900">{slide.sub.split("—")[0]}</span>
              </h1>

              <p className="text-gray-500 text-lg mb-9 leading-relaxed max-w-lg">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  href="/onboarding"
                  className="relative bg-gradient-to-l from-green-500 to-emerald-600 text-white font-bold px-9 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 overflow-hidden group"
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
                  className="border-2 border-gray-200 hover:border-green-300 bg-white/80 backdrop-blur-sm text-gray-700 font-bold px-9 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 inline-flex items-center gap-2 hover:shadow-lg"
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
                className="flex items-center gap-4 mt-10 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-100 w-fit"
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
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    {[...Array(5)].map((_, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.05 }}>
                        ★
                      </motion.span>
                    ))}
                    <span className="text-gray-700 mr-1">4.9</span>
                  </div>
                  <p className="text-gray-500 text-xs">من 1200+ طالب سعيد</p>
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
                  className="w-full h-[340px] md:h-[440px] object-cover"
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
                className="absolute -top-5 -left-5 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 text-sm font-bold flex items-center gap-2"
              >
                <span className="text-xl">💬</span>
                <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent">Hello!</span>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }}
                className="absolute -bottom-5 -right-5 bg-gradient-to-l from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2"
              >
                <span className="text-xl">🔥</span>
                <span>7 أيام streak</span>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 6, -6], scale: [1, 1.05, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
                className="absolute top-1/3 -right-8 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-yellow-200 text-sm font-extrabold flex items-center gap-1.5"
              >
                <span className="text-yellow-500">⭐</span>
                <span className="text-gray-800">+15 XP</span>
              </motion.div>

              <motion.div
                animate={{ y: [5, -10, 5], x: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: 2 }}
                className="absolute top-8 right-8 bg-purple-500 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-bold"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
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
      <h3 className="text-3xl md:text-4xl font-black text-gray-900 tabular-nums">
        {suffix === "%" ? `${count}%` : suffix === "+" ? `${count}+` : suffix}
      </h3>
      <p className="text-gray-500 text-sm mt-1 font-medium">{label}</p>
    </motion.div>
  )
}

function StatsStrip() {
  return (
    <section className="relative -mt-10 z-20 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100/80 grid grid-cols-2 md:grid-cols-4 gap-8 p-10"
      >
        <StatItem num={1200} suffix="+" label="طالب نشط" icon="👥" gradient="from-green-400 to-emerald-500" />
        <StatItem num={97} suffix="%" label="راضين تماماً" icon="⭐" gradient="from-yellow-400 to-amber-500" />
        <StatItem num={6} suffix="6 مستويات" label="A0 إلى C1" icon="📈" gradient="from-blue-400 to-blue-600" />
        <StatItem num={24} suffix="24h" label="تقدم ملموس" icon="⚡" gradient="from-purple-400 to-purple-600" />
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   3. FEATURES
═══════════════════════════════════════════════════ */

function FeaturesSection() {
  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-green-50/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-green-100/80 backdrop-blur text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-green-200/50"
          >
            ✨ لماذا نحن مختلفون
          </motion.span>
          <h2 className="text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            طريقة تعلم تختلف عن
            <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent"> كل شيء جربته</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-lg">نهج عملي مبني على المحادثة والتطبيق اليومي</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -12, scale: 1.03 }}
              className={`bg-gradient-to-br ${f.bg} rounded-3xl p-8 text-center cursor-default border-2 border-transparent ${f.border} transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/30 transition-colors duration-500" />
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`w-18 h-18 w-[72px] h-[72px] bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg relative z-10`}
              >
                {f.icon}
              </motion.div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-3 relative z-10">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed relative z-10">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   4. COURSES
═══════════════════════════════════════════════════ */

function CourseCard({ c, featured }: { c: typeof COURSES[number]; featured?: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={c.open ? { y: -8, scale: 1.02 } : undefined}
      className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 group ${
        featured
          ? "border-2 border-green-400 shadow-xl shadow-green-100/60 md:flex md:items-center md:gap-10 p-8 md:p-10"
          : `border-2 ${c.open ? "border-gray-100 hover:border-green-300 shadow-md hover:shadow-2xl hover:shadow-green-100/30" : "border-gray-100 shadow-sm opacity-50"} p-6`
      }`}
    >
      {/* shimmer effect on hover */}
      {c.open && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-green-50/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}

      {/* accent top bar */}
      {!featured && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${c.open ? "bg-gradient-to-l from-green-400 to-emerald-500" : "bg-gray-200"}`}>
          {c.open && <div className="absolute inset-0 bg-gradient-to-l from-green-300 to-emerald-400 animate-pulse opacity-50" />}
        </div>
      )}

      {/* featured badge */}
      {featured && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-4 bg-gradient-to-l from-orange-500 to-amber-400 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg shadow-orange-300/40 z-10"
        >
          🔥 الأكثر طلباً
        </motion.div>
      )}

      {/* info side */}
      <div className={featured ? "flex-1 min-w-0 relative z-10" : "relative z-10"}>
        <div className="flex items-center gap-3 mb-4">
          <motion.span
            whileHover={{ scale: 1.15 }}
            className={`text-sm font-extrabold px-4 py-1.5 rounded-xl ${c.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
          >
            {c.level}
          </motion.span>
          {!c.open && (
            <span className="text-xs font-bold bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span className="text-[10px]">🔒</span> قريباً
            </span>
          )}
        </div>

        <h3 className={`font-black text-gray-900 mb-3 ${featured ? "text-xl md:text-2xl" : "text-lg"}`}>
          {c.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          {c.desc}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-green-50 text-green-600 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-green-100">
            ⏱ {c.dur}
          </span>
          <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-gray-100">
            بدون قواعد مملة
          </span>
          {featured && (
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-blue-100">
              🎯 للمبتدئين تماماً
            </span>
          )}
        </div>
      </div>

      {/* price + CTA side */}
      <div className={featured
        ? "flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-7 flex flex-col items-center gap-4 mt-6 md:mt-0 border border-green-100 relative z-10"
        : "flex items-center justify-between mt-auto pt-3 relative z-10"
      }>
        {featured && (
          <p className="text-gray-400 text-sm font-medium">السعر</p>
        )}
        <span className={`font-black text-gray-900 ${featured ? "text-4xl" : "text-lg"}`}>
          {c.price}
        </span>
        {c.open ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`/courses/${c.level.toLowerCase()}`}
              className={`bg-gradient-to-l from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 text-center block ${
                featured ? "px-10 py-4 text-base w-full" : "px-6 py-2.5 text-sm"
              }`}
            >
              ابدأ الآن {featured && "🚀"}
            </Link>
          </motion.div>
        ) : (
          <span className="text-gray-400 text-sm">قريباً</span>
        )}
        {featured && (
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <span className="text-green-500">✓</span> ضمان استرداد 7 أيام
          </p>
        )}
      </div>
    </motion.div>
  )
}

function CoursesSection() {
  return (
    <section className="py-28 px-6 bg-gradient-to-b from-gray-50/80 to-white relative overflow-hidden">
      <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-green-100/30 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-green-100/80 text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-green-200/50">
            📚 الدورات
          </span>
          <h2 className="text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            اختر مستواك وابدأ
            <span className="bg-gradient-to-l from-green-500 to-emerald-600 bg-clip-text text-transparent"> رحلتك</span>
          </h2>
          <p className="text-gray-500 mt-4 text-lg">6 مستويات من الصفر إلى الاحتراف — كل دورة بدون قواعد مملة</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="space-y-7"
        >
          <CourseCard c={COURSES[0]} featured />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.slice(1).map((c) => (
              <CourseCard key={c.level} c={c} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   5. LEARNING METHOD
═══════════════════════════════════════════════════ */

function MethodSection() {
  const steps = [
    { num: "1", title: "اختر مستواك", desc: "نحدد مستواك الحالي ونبدأ من المكان المناسب", icon: "🎯", color: "from-green-400 to-emerald-500" },
    { num: "2", title: "تعلم بالمحادثة", desc: "دروس قصيرة مبنية على مواقف حقيقية يومية", icon: "💬", color: "from-blue-400 to-blue-600" },
    { num: "3", title: "مارس يومياً", desc: "تمارين تفاعلية + استماع + نطق كل يوم", icon: "🔄", color: "from-purple-400 to-purple-600" },
    { num: "4", title: "تقدم وأربح", desc: "اجمع XP واصعد المستويات وتابع تقدمك على الخريطة", icon: "🏆", color: "from-yellow-400 to-orange-500" },
  ]

  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-50/40 to-purple-50/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-blue-200/50">
            🧠 كيف تتعلم معنا
          </span>
          <h2 className="text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            4 خطوات بسيطة
            <span className="bg-gradient-to-l from-blue-500 to-blue-700 bg-clip-text text-transparent"> للطلاقة</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((s, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} className="text-center relative group">
              <motion.div
                whileHover={{ rotate: [3, -3, 3, 0], scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-xl relative`}
              >
                {s.icon}
                {/* number badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center text-sm font-black shadow-lg border-2 border-gray-100">
                  {s.num}
                </div>
              </motion.div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

              {/* connector arrow (hidden on last + mobile) */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-10 -left-4 text-gray-300 text-xl">
                  ←
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   6. MAP PREVIEW
═══════════════════════════════════════════════════ */

function MapSection() {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden relative">
      <Particles count={25} />
      <div className="absolute top-10 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold mb-5 border border-white/20">
            🗺️ خريطة التعلم
          </span>
          <h2 className="text-3xl md:text-[2.8rem] font-black leading-tight">
            رحلة من الصفر إلى
            <span className="text-yellow-300"> الاحتراف</span>
          </h2>
          <p className="text-blue-200 mt-4 text-lg">تتبع تقدمك عبر مستويات واضحة — كل محطة إنجاز جديد</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="flex flex-wrap justify-center items-center gap-3 md:gap-4"
        >
          {MAP_NODES.map((n, i) => (
            <motion.div key={i} custom={i} variants={fadeScale} className="flex items-center gap-3 md:gap-4">
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className={`w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-black text-lg shadow-xl transition-all duration-300 ${
                    n.status === "done"
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/40"
                      : n.status === "current"
                      ? "bg-white text-blue-700 shadow-white/40 node-pulse ring-4 ring-white/20"
                      : "bg-white/10 text-white/30 border-2 border-white/10 backdrop-blur-sm"
                  }`}
                >
                  {n.status === "done" ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: i * 0.1 }}
                    >
                      ✓
                    </motion.span>
                  ) : n.label}
                </div>
                <span className={`text-xs font-bold ${n.status === "locked" ? "text-white/30" : "text-white"}`}>
                  {n.city}
                </span>
              </motion.div>

              {i < MAP_NODES.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`w-8 md:w-14 h-1.5 rounded-full origin-right ${
                    n.status === "done" ? "bg-gradient-to-l from-green-300 to-green-500" : "bg-white/10"
                  }`}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
          className="text-center mt-14"
        >
          <MagneticButton
            href="/map"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-9 py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300"
          >
            🗺️ اكتشف الخريطة
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   7. TOOLS
═══════════════════════════════════════════════════ */

function ToolsSection() {
  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-purple-50/40 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-purple-200/50">
            🛠️ أدوات التعلم
          </span>
          <h2 className="text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            كل ما تحتاجه في
            <span className="bg-gradient-to-l from-purple-500 to-purple-700 bg-clip-text text-transparent"> مكان واحد</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-7"
        >
          {TOOLS.map((t, i) => (
            <motion.div key={i} custom={i} variants={fadeUp}>
              <Link
                href={t.href}
                className={`block bg-gray-50 hover:bg-white rounded-3xl p-9 text-center border-2 border-transparent hover:border-gray-200 hover:shadow-2xl ${t.glow} transition-all duration-400 group relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                </div>

                <motion.div
                  whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.6 }}
                  className={`bg-gradient-to-br ${t.gradient} w-[80px] h-[80px] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl relative z-10`}
                >
                  {t.icon}
                </motion.div>
                <h3 className="font-black text-xl text-gray-900 mb-3 relative z-10">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 relative z-10">{t.desc}</p>
                <span className="text-green-600 font-bold text-sm group-hover:underline relative z-10 inline-flex items-center gap-1">
                  جرب الآن
                  <motion.span
                    animate={{ x: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ←
                  </motion.span>
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
   8. TESTIMONIALS
═══════════════════════════════════════════════════ */

function TestimonialsSection() {
  return (
    <section className="py-28 px-6 bg-gradient-to-b from-green-50/60 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-green-100/30 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-100/80 text-yellow-700 px-5 py-2 rounded-full text-sm font-bold mb-5 border border-yellow-200/50">
            💬 آراء الطلاب
          </span>
          <h2 className="text-3xl md:text-[2.8rem] font-black text-gray-900 leading-tight">
            شنو قالوا
            <span className="bg-gradient-to-l from-yellow-500 to-orange-500 bg-clip-text text-transparent"> طلابنا</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-7"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group"
            >
              {/* decorative quote mark */}
              <div className="absolute top-4 left-4 text-6xl text-gray-100 font-serif leading-none pointer-events-none select-none">&ldquo;</div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 bg-gradient-to-br ${t.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {t.avatar}
                  </motion.div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{t.name}</p>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                      مستوى {t.level}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-[0.94rem]">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-1 mt-5">
                  {[...Array(5)].map((_, j) => (
                    <motion.span
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + j * 0.08, type: "spring" }}
                      className="text-yellow-400 text-lg"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   9. FINAL CTA
═══════════════════════════════════════════════════ */

function FinalCTA() {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white text-center relative overflow-hidden">
      <Particles count={30} />

      {/* animated bg rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-[400px] h-[400px] rounded-full border-2 border-white/20 absolute -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="w-[600px] h-[600px] rounded-full border border-white/10 absolute -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
        className="max-w-2xl mx-auto relative z-10"
      >
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
          className="text-7xl mb-8"
        >
          🚀
        </motion.div>
        <h2 className="text-3xl md:text-[3.2rem] font-black mb-5 leading-tight">
          جاهز تبدأ رحلتك؟
        </h2>
        <p className="text-green-100 text-lg mb-12 leading-relaxed">
          انضم لأكثر من 1200 طالب يتعلمون الإنجليزية بطريقة ممتعة وفعالة
        </p>

        <div className="flex flex-wrap justify-center gap-5">
          <MagneticButton
            href="/onboarding"
            className="bg-white text-green-700 font-black px-12 py-5 rounded-2xl shadow-2xl shadow-green-900/30 hover:shadow-green-900/40 transition-all duration-300 text-lg inline-flex items-center gap-2"
          >
            ابدأ مجاناً الآن
          </MagneticButton>
          <MagneticButton
            href="https://wa.me/212707902091"
            className="bg-white/15 backdrop-blur-sm text-white font-bold px-10 py-5 rounded-2xl border-2 border-white/30 hover:bg-white/25 transition-all duration-300 inline-flex items-center gap-2"
          >
            💬 تواصل معنا
          </MagneticButton>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-green-200/80 text-sm mt-10 flex items-center justify-center gap-3"
        >
          <span>✓ بدون التزام</span>
          <span className="w-1 h-1 bg-green-200/40 rounded-full" />
          <span>✓ ضمان استرداد 7 أيام</span>
          <span className="w-1 h-1 bg-green-200/40 rounded-full" />
          <span>✓ دعم مباشر</span>
        </motion.p>
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
      <FeaturesSection />
      <CoursesSection />
      <MethodSection />
      <MapSection />
      <ToolsSection />
      <TestimonialsSection />
      <FinalCTA />
    </div>
  )
}
