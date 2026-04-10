"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  { icon: "🎯", title: "نتائج حقيقية", desc: "97% من طلابنا لاحظوا تحسن واضح خلال أول شهر", color: "from-green-400 to-emerald-500", bg: "bg-green-50" },
  { icon: "🔊", title: "صوت ونطق", desc: "تمارين استماع ونطق تفاعلية مع تصحيح فوري", color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
  { icon: "🚀", title: "تقدم سريع", desc: "نظام XP والمكافآت يخليك متحمس كل يوم", color: "from-purple-400 to-purple-600", bg: "bg-purple-50" },
  { icon: "💬", title: "تعلم بالمحادثة", desc: "تعلم من مواقف حقيقية مش من كتب مملة", color: "from-orange-400 to-orange-500", bg: "bg-orange-50" },
]

const COURSES = [
  { level: "A0", title: "المبتدئ المطلق", desc: "أول خطوة — تتعلم التحيات والكلام الأساسي", dur: "3 أسابيع", price: "99 درهم", open: true, featured: true },
  { level: "A1", title: "الأساسيات", desc: "أول جمل وتعبيرات حقيقية من الحياة اليومية", dur: "4 أسابيع", price: "149 درهم", open: true, featured: false },
  { level: "A2", title: "المحادثة اليومية", desc: "تحدث في المواقف اليومية بثقة وسهولة", dur: "5 أسابيع", price: "149 درهم", open: true, featured: false },
  { level: "B1", title: "المتوسط", desc: "عبّر عن أفكارك ومشاعرك بالإنجليزية", dur: "6 أسابيع", price: "199 درهم", open: true, featured: false },
  { level: "B2", title: "فوق المتوسط", desc: "نقاش وفهم عميق لأي موضوع أو سياق", dur: "7 أسابيع", price: "249 درهم", open: false, featured: false },
  { level: "C1", title: "الاحتراف", desc: "طلاقة كاملة في كل المجالات والسياقات", dur: "8 أسابيع", price: "299 درهم", open: false, featured: false },
]

const TOOLS = [
  { icon: "🎧", title: "الاستماع", desc: "بودكاست ومحادثات حقيقية بمستويات مختلفة", href: "/listen", color: "from-blue-500 to-cyan-400" },
  { icon: "✍️", title: "تدرب الآن", desc: "تمارين تفاعلية يومية لتثبيت ما تعلمته", href: "/practice", color: "from-green-500 to-emerald-400" },
  { icon: "🗺️", title: "الخريطة", desc: "تابع رحلتك وشوف كم وصلت", href: "/map", color: "from-purple-500 to-pink-400" },
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
  { name: "سارة م.", text: "من أحسن قرار خذيته — بديت نتكلم إنجليزية في أسبوعين!", avatar: "👩‍🎓", level: "A2" },
  { name: "يوسف ب.", text: "الطريقة ممتعة بزاف وماكتحسش بالملل أبدا. شكرا حمزة!", avatar: "👨‍💻", level: "B1" },
  { name: "نادية ك.", text: "ولادي كيتعلمو معايا — الموقع سهل ومفهوم للجميع", avatar: "👩‍🏫", level: "A1" },
]

/* ═══════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ═══════════════════════════════════════════════════
   1. HERO SLIDER
═══════════════════════════════════════════════════ */

function HeroSlider() {
  const [idx, setIdx] = useState(0)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timer.current = setInterval(() => setIdx(p => (p + 1) % SLIDES.length), 4500)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  const slide = SLIDES[idx]

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-bl from-green-50 via-white to-blue-50">
      {/* background decorations */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl hero-blob-1" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl hero-blob-2" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6 py-20 relative z-10 w-full">
        {/* TEXT SIDE */}
        <div className="order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full dot-pulse" />
                +1200 طالب يتعلمون الآن
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
                {slide.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span style={{ color: slide.accent }}>
                  {slide.title.split(" ").slice(-1)}
                </span>
              </h1>

              <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-lg">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-green-500/30 hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
                >
                  ابدأ الآن 🚀
                </Link>
                <Link
                  href="/courses"
                  className="border-2 border-gray-200 hover:border-green-300 bg-white text-gray-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-all duration-200 inline-flex items-center gap-2"
                >
                  شاهد الدورات
                </Link>
              </div>

              {/* social proof */}
              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-3 space-x-reverse">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-400"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                      {["س", "م", "ي", "ن"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="text-green-600 font-bold">4.9 ★</span> من 1200+ طالب
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* IMAGE SIDE */}
        <div className="order-1 md:order-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-full h-[340px] md:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />
              </div>

              {/* floating badges */}
              <div className="absolute -top-4 -left-4 bg-white px-4 py-2.5 rounded-2xl shadow-xl float-1 text-sm font-bold flex items-center gap-2">
                💬 <span className="text-green-600">Hello!</span>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2.5 rounded-2xl shadow-xl float-2 text-sm font-bold flex items-center gap-2">
                🔥 7 أيام streak
              </div>
              <div className="absolute top-1/2 -right-6 bg-white px-3 py-2 rounded-xl shadow-lg float-3 text-xs font-bold">
                ⭐ +15 XP
              </div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex justify-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === idx ? "w-8 bg-green-500" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
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

function StatsStrip() {
  const stats = [
    { num: "1200+", label: "طالب نشط", icon: "👥", color: "text-green-600" },
    { num: "97%", label: "راضين تماماً", icon: "⭐", color: "text-yellow-500" },
    { num: "A0→C1", label: "6 مستويات", icon: "📈", color: "text-blue-600" },
    { num: "24h", label: "تقدم ملموس", icon: "⚡", color: "text-purple-600" },
  ]

  return (
    <section className="relative -mt-8 z-20 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 p-8"
      >
        {stats.map((s, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <h3 className={`text-2xl md:text-3xl font-extrabold ${s.color}`}>{s.num}</h3>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   3. FEATURES
═══════════════════════════════════════════════════ */

function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ✨ لماذا نحن مختلفون
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            طريقة تعلم تختلف عن كل شيء جربته
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">نهج عملي مبني على المحادثة والتطبيق اليومي</p>
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
              whileHover={{ y: -8, scale: 1.02 }}
              className={`${f.bg} rounded-3xl p-7 text-center cursor-default border-2 border-transparent hover:border-green-200 transition-colors duration-200`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
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
      whileHover={c.open ? { y: -6, scale: 1.02 } : undefined}
      className={`relative bg-white rounded-3xl overflow-hidden transition-shadow duration-300 ${
        featured
          ? "border-2 border-green-400 shadow-xl shadow-green-100/50 md:flex md:items-center md:gap-10 p-8 md:p-10"
          : `border ${c.open ? "border-gray-100 hover:border-green-200 shadow-md hover:shadow-xl" : "border-gray-100 shadow-sm opacity-60"} p-6`
      }`}
    >
      {/* accent top bar */}
      {!featured && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${c.open ? "bg-gradient-to-l from-green-400 to-emerald-500" : "bg-gray-200"}`} />
      )}

      {/* featured badge */}
      {featured && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg shadow-orange-200/60">
          🔥 الأكثر طلباً
        </div>
      )}

      {/* info side */}
      <div className={featured ? "flex-1 min-w-0" : ""}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm font-extrabold px-3 py-1 rounded-xl ${c.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {c.level}
          </span>
          {!c.open && (
            <span className="text-xs font-bold bg-gray-100 text-gray-400 px-2.5 py-1 rounded-lg">
              قريباً
            </span>
          )}
        </div>

        <h3 className={`font-extrabold text-gray-900 mb-2 ${featured ? "text-xl md:text-2xl" : "text-lg"}`}>
          {c.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          {c.desc}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg">
            ⏱ {c.dur}
          </span>
          <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-lg">
            بدون قواعد مملة
          </span>
          {featured && (
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg">
              🎯 للمبتدئين تماماً
            </span>
          )}
        </div>
      </div>

      {/* price + CTA side */}
      <div className={featured
        ? "flex-shrink-0 bg-green-50 rounded-2xl p-6 flex flex-col items-center gap-3 mt-6 md:mt-0"
        : "flex items-center justify-between mt-auto pt-2"
      }>
        {featured && (
          <p className="text-gray-400 text-sm font-medium">السعر</p>
        )}
        <span className={`font-extrabold text-gray-900 ${featured ? "text-3xl" : "text-lg"}`}>
          {c.price}
        </span>
        {c.open ? (
          <Link
            href={`/courses/${c.level.toLowerCase()}`}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 hover:scale-105 transition-all duration-200 text-center ${
              featured ? "px-10 py-3.5 text-base w-full" : "px-5 py-2.5 text-sm"
            }`}
          >
            ابدأ الآن {featured && "🚀"}
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">قريباً</span>
        )}
        {featured && (
          <p className="text-gray-400 text-xs">✓ ضمان استرداد 7 أيام</p>
        )}
      </div>
    </motion.div>
  )
}

function CoursesSection() {
  return (
    <section className="py-24 px-6 bg-gray-50/80">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            📚 الدورات
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            اختر مستواك وابدأ رحلتك
          </h2>
          <p className="text-gray-500 mt-3">6 مستويات من الصفر إلى الاحتراف — كل دورة بدون قواعد مملة</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="space-y-6"
        >
          {/* Featured A0 card */}
          <CourseCard c={COURSES[0]} featured />

          {/* Remaining cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.slice(1).map((c, i) => (
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
    { num: "1", title: "اختر مستواك", desc: "نحدد مستواك الحالي ونبدأ من المكان المناسب", icon: "🎯" },
    { num: "2", title: "تعلم بالمحادثة", desc: "دروس قصيرة مبنية على مواقف حقيقية يومية", icon: "💬" },
    { num: "3", title: "مارس يومياً", desc: "تمارين تفاعلية + استماع + نطق كل يوم", icon: "🔄" },
    { num: "4", title: "تقدم وأربح", desc: "اجمع XP واصعد المستويات وتابع تقدمك على الخريطة", icon: "🏆" },
  ]

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🧠 كيف تتعلم معنا
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            4 خطوات بسيطة للطلاقة
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
            <motion.div key={i} custom={i} variants={fadeUp} className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-xl shadow-green-200/40 rotate-3 hover:rotate-0 transition-transform duration-300">
                {s.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-md mx-auto" style={{ right: "calc(50% - 50px)" }}>
                {s.num}
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
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
    <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden relative">
      {/* decorations */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🗺️ خريطة التعلم
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            رحلة من الصفر إلى الاحتراف
          </h2>
          <p className="text-blue-200 mt-3">تتبع تقدمك عبر مستويات واضحة — كل محطة إنجاز جديد</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="flex flex-wrap justify-center items-center gap-4 md:gap-6"
        >
          {MAP_NODES.map((n, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-xl transition-transform duration-300 hover:scale-110 ${
                    n.status === "done"
                      ? "bg-green-500 text-white shadow-green-500/30"
                      : n.status === "current"
                      ? "bg-white text-blue-700 shadow-white/30 node-pulse"
                      : "bg-white/10 text-white/40 border border-white/20"
                  }`}
                >
                  {n.status === "done" ? "✓" : n.label}
                </div>
                <span className={`text-xs font-bold ${n.status === "locked" ? "text-white/40" : "text-white"}`}>
                  {n.city}
                </span>
              </div>

              {/* connector line */}
              {i < MAP_NODES.length - 1 && (
                <div className={`w-8 md:w-12 h-1 rounded-full ${
                  n.status === "done" ? "bg-green-400" : "bg-white/15"
                }`} />
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
          className="text-center mt-12"
        >
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all duration-200"
          >
            🗺️ اكتشف الخريطة
          </Link>
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🛠️ أدوات التعلم
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            كل ما تحتاجه في مكان واحد
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {TOOLS.map((t, i) => (
            <motion.div key={i} custom={i} variants={fadeUp}>
              <Link
                href={t.href}
                className="block bg-gray-50 hover:bg-white rounded-3xl p-8 text-center border-2 border-transparent hover:border-green-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-18 h-18 bg-gradient-to-br ${t.color} w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {t.icon}
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-2">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{t.desc}</p>
                <span className="text-green-600 font-bold text-sm group-hover:underline">
                  جرب الآن ←
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
    <section className="py-24 px-6 bg-green-50/60">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            💬 آراء الطلاب
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            شنو قالوا طلابنا
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-7 shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    مستوى {t.level}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
              <div className="flex gap-1 mt-4 text-yellow-400">
                {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
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
    <section className="py-24 px-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
        className="max-w-2xl mx-auto relative z-10"
      >
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
          جاهز تبدأ رحلتك؟
        </h2>
        <p className="text-green-100 text-lg mb-10 leading-relaxed">
          انضم لأكثر من 1200 طالب يتعلمون الإنجليزية بطريقة ممتعة وفعالة
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/onboarding"
            className="bg-white text-green-700 font-extrabold px-10 py-4 rounded-2xl shadow-xl shadow-green-900/20 hover:scale-105 transition-all duration-200 text-lg"
          >
            ابدأ مجاناً الآن
          </Link>
          <Link
            href="https://wa.me/212707902091"
            target="_blank"
            className="bg-green-700/40 backdrop-blur text-white font-bold px-8 py-4 rounded-2xl border border-white/20 hover:bg-green-700/60 transition-all duration-200 inline-flex items-center gap-2"
          >
            💬 تواصل معنا
          </Link>
        </div>

        <p className="text-green-200/70 text-sm mt-8">✓ بدون التزام — ✓ ضمان استرداد 7 أيام</p>
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
