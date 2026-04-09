'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/212707902091?text=' + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')
const F = "'Cairo', sans-serif"

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className = '', dir, style,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  dir?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } },
      { threshold: 0.07 }
    )
    o.observe(el)
    return () => o.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      dir={dir}
      className={className}
      style={{
        ...style,
        opacity: v ? 1 : 0,
        transform: v ? 'translateY(0)' : 'translateY(26px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Section chip ─────────────────────────────────────────────────────────────
function Chip({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide ${green ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
      style={{ fontFamily: F }}
    >
      {children}
    </span>
  )
}

// ─── WAIcon ───────────────────────────────────────────────────────────────────
function WAIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════════

const SLIDES = [
  {
    tag: '🎯 ابدأ مجاناً — بدون تسجيل',
    h1: 'تعلم الإنجليزية',
    h2: 'بالمحادثة خطوة بخطوة',
    sub: 'بدون قواعد معقدة — تعلم بطريقة طبيعية وعملية تناسب حياتك اليومية',
  },
  {
    tag: '🗺️ خريطة تفاعلية عبر المغرب',
    h1: 'رحلة تعليمية',
    h2: 'عبر مدن المغرب الجميلة',
    sub: 'كل مدينة مستوى جديد — تقدم حقيقي يحفّزك على الاستمرار كل يوم',
  },
  {
    tag: '⚡ نقاط XP وسلسلة يومية',
    h1: 'نظام مكافآت ذكي',
    h2: 'يجعل التعلم ممتعاً حقاً',
    sub: 'اكسب XP، افتح مدناً جديدة، وحافظ على سلسلتك اليومية دون انقطاع',
  },
]

function AppMockup() {
  const [xp, setXp] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setXp(68), 900)
    return () => clearTimeout(t)
  }, [])

  const WORDS = [
    { en: 'Hello',        ar: 'مرحبا',      s: 'done'   },
    { en: 'Good morning', ar: 'صباح الخير', s: 'done'   },
    { en: 'How are you?', ar: 'كيف حالك؟',  s: 'active' },
    { en: 'My name is…',  ar: 'اسمي…',       s: 'locked' },
  ]

  return (
    <div className="relative" style={{ width: 288, margin: '0 auto' }}>
      {/* Badge XP */}
      <div
        className="float-1 absolute z-10 flex items-center gap-1.5 bg-white border border-blue-100 rounded-2xl px-3 py-2 shadow-lg text-sm font-bold text-blue-600"
        style={{ top: -20, right: -14, fontFamily: F }}
      >
        ⚡ +50 XP
      </div>

      {/* Badge chat */}
      <div
        className="float-2 absolute z-10 bg-blue-600 text-white text-xs font-semibold px-3 py-2 shadow-lg whitespace-nowrap"
        style={{ top: 80, left: -32, borderRadius: '16px 16px 4px 16px', fontFamily: F }}
      >
        Good morning! ☀️
      </div>

      {/* Badge streak */}
      <div
        className="float-3 absolute z-10 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-2xl px-3 py-2 shadow-md text-sm font-bold text-green-700"
        style={{ bottom: -18, right: -18, fontFamily: F }}
      >
        🔥 14 يوم
      </div>

      {/* Card */}
      <div className="rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-100 relative z-0">
        {/* Header */}
        <div className="bg-blue-600 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3" dir="rtl">
            <span className="text-white/90 text-sm font-semibold" style={{ fontFamily: F }}>واد زم — A0</span>
            <div className="flex gap-1.5">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: F }}>🔥 14</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: F }}>⚡ 640</span>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400"
              style={{ width: `${xp}%`, transition: 'width 1.5s cubic-bezier(.34,1.56,.64,1)' }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-white/60" style={{ fontFamily: F }}>
            <span>A0</span>
            <span>{xp}%</span>
          </div>
        </div>

        {/* Words */}
        <div className="p-4">
          <p className="text-xs text-slate-400 mb-3 font-medium" dir="rtl" style={{ fontFamily: F }}>المفردات الجديدة</p>
          <div className="flex flex-col gap-2">
            {WORDS.map((w, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                  w.s === 'active' ? 'bg-blue-50 border-blue-200' :
                  w.s === 'done'   ? 'bg-green-50 border-green-200' :
                                     'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white flex-shrink-0 ${
                    w.s === 'done'   ? 'bg-green-600' :
                    w.s === 'active' ? 'bg-blue-600'  : 'bg-slate-300'
                  }`}
                >
                  {w.s === 'done' ? '✓' : w.s === 'active' ? '🔊' : '🔒'}
                </div>
                <div dir="rtl" className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${w.s === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}
                    style={{ fontFamily: F }}
                  >
                    {w.en}
                  </p>
                  <p className="text-xs text-slate-400 truncate" style={{ fontFamily: F }}>{w.ar}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-3 bg-blue-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl cursor-pointer select-none"
            style={{ fontFamily: F }}
          >
            استمر ▶
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  function goTo(i: number) {
    if (i === idx) return
    setFading(true)
    setTimeout(() => { setIdx(i); setFading(false) }, 240)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => { setIdx(s => (s + 1) % SLIDES.length); setFading(false) }, 240)
    }, 5200)
    return () => clearInterval(t)
  }, [])

  const s = SLIDES[idx]

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(150deg,#eff6ff 0%,#fff 50%,#f0fdf4 100%)',
        paddingTop: 80,
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Blobs */}
      <div
        className="hero-blob-1 absolute rounded-full pointer-events-none"
        style={{ top: '4%', right: '-4%', width: 540, height: 540, background: '#2563eb07', filter: 'blur(90px)' }}
      />
      <div
        className="hero-blob-2 absolute rounded-full pointer-events-none"
        style={{ bottom: '-2%', left: '-3%', width: 440, height: 440, background: '#22c55e09', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Text ─────────────────────────────── */}
          <div
            dir="rtl"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? 'translateY(8px)' : 'none',
              transition: 'opacity .24s ease, transform .24s ease',
            }}
          >
            {/* Tag pill */}
            <div
              className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm mb-6"
              style={{ fontFamily: F }}
            >
              <span
                className="dot-pulse inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
              />
              {s.tag}
            </div>

            <h1
              className="font-bold text-slate-900 leading-tight mb-4"
              style={{ fontFamily: F, fontSize: 'clamp(2rem,4.8vw,3.3rem)', letterSpacing: '-0.01em' }}
            >
              {s.h1}
              <br />
              <span className="text-blue-600">{s.h2}</span>
            </h1>

            <p
              className="text-slate-500 mb-8 max-w-lg"
              style={{ fontFamily: F, fontSize: 16, fontWeight: 400, lineHeight: 1.9 }}
            >
              {s.sub}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all duration-200"
                style={{ fontFamily: F }}
              >
                ابدأ الآن مجاناً 🚀
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold text-sm hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                style={{ fontFamily: F }}
              >
                شاهد كيف يعمل
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {['+١٠٠٠ طالب', 'نتائج حقيقية', 'تقدم سريع'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-slate-500" style={{ fontFamily: F }}>
                  <span className="text-green-500 font-bold text-base">✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Mockup ───────────────────────────── */}
          <div
            className="flex justify-center"
            style={{ opacity: fading ? 0.4 : 1, transition: 'opacity .24s ease' }}
          >
            <AppMockup />
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center gap-2 mt-14">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-300 border-0 cursor-pointer p-0"
              style={{ width: i === idx ? 28 : 8, background: i === idx ? '#2563eb' : '#e2e8f0' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════════

interface CourseItem {
  cefr: string; ar: string; emoji: string; desc: string
  variant: 'green' | 'blue' | 'gray'
}

const COURSES: CourseItem[] = [
  { cefr: 'A0', ar: 'البداية',       emoji: '🌱', desc: 'التحيات والتعارف والعبارات الأولى',                  variant: 'green' },
  { cefr: 'A1', ar: 'المبتدئ',       emoji: '📖', desc: 'الأسئلة والأرقام والوقت والروتين اليومي',             variant: 'blue'  },
  { cefr: 'A2', ar: 'الأساسي',       emoji: '💬', desc: 'المحادثة اليومية والسفر والعمل والصحة',               variant: 'blue'  },
  { cefr: 'B1', ar: 'المتوسط',       emoji: '🚀', desc: 'التعبير عن الرأي والمواقف المعقدة',                   variant: 'blue'  },
  { cefr: 'B2', ar: 'فوق المتوسط',  emoji: '⭐', desc: 'طلاقة حقيقية وأسلوب طبيعي',                          variant: 'gray'  },
  { cefr: 'C1', ar: 'المتقدم',       emoji: '🏆', desc: 'الاحتراف الكامل كالناطقين الأصليين',                  variant: 'gray'  },
  { cefr: 'BZ', ar: 'Business',      emoji: '💼', desc: 'الإنجليزية في الأعمال والمقابلات والكتابة الرسمية',   variant: 'gray'  },
]

function CourseCard({ c }: { c: CourseItem }) {
  const [hov, setHov] = useState(false)
  const soon = c.variant === 'gray'

  const colors = {
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', badgeBg: '#f0fdf4' },
    blue:  { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', badgeBg: '#eff6ff' },
    gray:  { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', badgeBg: '#f1f5f9' },
  }
  const col = colors[c.variant]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative flex flex-col h-full rounded-2xl border p-5 transition-all duration-200"
      style={{
        background: '#fff',
        borderColor: hov && !soon ? col.border : '#e2e8f0',
        boxShadow: hov && !soon ? `0 8px 32px ${col.text}18` : '0 1px 4px rgba(0,0,0,.04)',
        transform: hov && !soon ? 'translateY(-4px)' : 'none',
        opacity: soon ? .62 : 1,
        cursor: soon ? 'default' : 'pointer',
      }}
    >
      {soon && (
        <span
          className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-400"
          style={{ fontFamily: F }}
        >
          قريباً
        </span>
      )}

      <div className="flex items-center gap-3 mb-3" dir="rtl">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
          style={{ background: col.bg, borderColor: col.border }}
        >
          {c.emoji}
        </div>
        <div>
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-0.5"
            style={{ background: col.badgeBg, color: col.text, fontFamily: F }}
          >
            {c.cefr}
          </span>
          <p className="font-semibold text-slate-800 text-base" style={{ fontFamily: F }}>{c.ar}</p>
        </div>
      </div>

      <p
        className="text-sm text-slate-500 leading-relaxed flex-1 mb-4"
        dir="rtl"
        style={{ fontFamily: F, fontWeight: 400 }}
      >
        {c.desc}
      </p>

      {!soon && (
        <Link
          href="/onboarding"
          className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200"
          style={{
            textDecoration: 'none',
            background: hov ? col.text : col.bg,
            color: hov ? '#fff' : col.text,
            borderColor: col.border,
            fontFamily: F,
          }}
        >
          ابدأ التعلم
        </Link>
      )}
    </div>
  )
}

function CoursesSection() {
  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip>📚 المسارات التعليمية</Chip>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: F }}>اختر مستواك وانطلق</h2>
          <p className="text-slate-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
            من الصفر حتى الاحتراف — كل مستوى يبني على ما سبقه بشكل طبيعي ومنظم
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {COURSES.map((c, i) => (
            <Reveal key={c.cefr} delay={i * 55}>
              <CourseCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════════════════════

const MAP_NODES = [
  { name: 'واد زم',        cefr: 'A0', emoji: '🌱', state: 'done'    },
  { name: 'خريبكة',         cefr: 'A1', emoji: '📖', state: 'done'    },
  { name: 'الدار البيضاء', cefr: 'A1', emoji: '💬', state: 'current' },
  { name: 'مراكش',          cefr: 'A2', emoji: '🚀', state: 'locked'  },
  { name: 'الرباط',          cefr: 'B1', emoji: '⭐', state: 'locked'  },
]

function MapSection() {
  return (
    <section id="map" className="py-24" style={{ background: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-16" dir="rtl">
          <Chip>🗺️ خريطة الرحلة</Chip>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: F }}>تعلم عبر خريطة تفاعلية</h2>
          <p className="text-slate-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
            كل مدينة مغربية = مستوى جديد — أكمل وحداتها وافتح المدينة التالية
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-x-auto pb-4">
            <div
              className="flex items-center justify-start lg:justify-center min-w-max px-8 py-14"
              style={{ direction: 'ltr' }}
            >
              {MAP_NODES.map((n, i) => {
                const done    = n.state === 'done'
                const current = n.state === 'current'
                const locked  = n.state === 'locked'
                return (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center gap-3">
                      {/* Node */}
                      <div
                        className={`flex items-center justify-center rounded-full border-4 transition-all duration-300 ${current ? 'node-pulse' : ''}`}
                        style={{
                          width:       current ? 82 : 68,
                          height:      current ? 82 : 68,
                          fontSize:    current ? 32 : 26,
                          background:  done ? '#16a34a' : current ? '#2563eb' : '#e2e8f0',
                          borderColor: done ? '#15803d' : current ? '#1d4ed8' : '#cbd5e1',
                          color:       locked ? '#94a3b8' : '#fff',
                          boxShadow:   done ? '0 4px 20px rgba(22,163,74,.3)' : 'none',
                        }}
                      >
                        {locked ? '🔒' : done ? '⭐' : n.emoji}
                      </div>
                      {/* Label */}
                      <div className="text-center" style={{ minWidth: 90 }}>
                        <p
                          className={`text-xs font-semibold mb-1.5 whitespace-nowrap ${locked ? 'text-slate-400' : 'text-slate-800'}`}
                          style={{ fontFamily: F }}
                        >
                          {n.name}
                        </p>
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${
                            done    ? 'bg-green-50 text-green-700' :
                            current ? 'bg-blue-50 text-blue-700'  : 'bg-slate-100 text-slate-400'
                          }`}
                          style={{ fontFamily: F }}
                        >
                          {n.cefr}
                        </span>
                      </div>
                    </div>

                    {/* Connector */}
                    {i < MAP_NODES.length - 1 && (
                      <div
                        className="flex-shrink-0 rounded-full mx-1.5"
                        style={{
                          width: 50, height: 4, marginBottom: 44,
                          background: i === 0 ? '#16a34a' : i === 1 ? '#2563eb' : '#e2e8f0',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={240} className="text-center mt-2">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all duration-200"
            style={{ fontFamily: F, textDecoration: 'none' }}
          >
            ابدأ الرحلة 🗺️
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { n: '١', icon: '🔊', title: 'كلمات مع صوت',  desc: '١٠ مفردات جديدة — اضغط واسمع النطق الصحيح مباشرة', green: false },
  { n: '٢', icon: '✏️', title: 'جمل تفاعلية',   desc: 'جمل حقيقية كما يستخدمها الناطقون في يومهم',         green: true  },
  { n: '٣', icon: '💬', title: 'محادثة كاملة',  desc: 'حوار بين شخصين — استمع وتدرب على الرد الطبيعي',    green: false },
  { n: '٤', icon: '🎯', title: 'اختبار متنوع',  desc: 'أكثر من ١٠ تمارين — اختيار متعدد وترجمة وترتيب',   green: true  },
]

function HowItWorksSection() {
  return (
    <section id="how" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip green>⚡ كيف يعمل</Chip>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: F }}>داخل كل درس — ٤ خطوات فقط</h2>
          <p className="text-slate-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
            منهج واضح يأخذك من الكلمة الأولى إلى المحادثة الكاملة في درس واحد
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm h-full flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border ${
                    s.green ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {s.icon}
                </div>
                <p
                  className={`text-xs font-bold mb-2 ${s.green ? 'text-green-700' : 'text-blue-700'}`}
                  style={{ fontFamily: F }}
                >
                  الخطوة {s.n}
                </p>
                <h3 className="font-bold text-slate-800 text-base mb-2" style={{ fontFamily: F }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1" style={{ fontFamily: F, fontWeight: 400 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════════════════════════════════

function FinalCTA() {
  return (
    <section
      className="py-28"
      style={{ background: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)' }}
    >
      <Reveal className="max-w-2xl mx-auto px-4 text-center" dir="rtl">
        <div
          className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white mb-6"
          style={{ fontFamily: F }}
        >
          <span className="dot-pulse inline-block w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          مفتوح الآن — بدون تسجيل
        </div>

        <h2
          className="text-4xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: F }}
        >
          ابدأ رحلتك اليوم
        </h2>

        <p
          className="text-white/70 text-base leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ fontFamily: F, fontWeight: 400 }}
        >
          انضم لأكثر من ١٠٠٠ طالب يتعلمون الإنجليزية بطريقة مختلفة — منظمة، عملية، وممتعة
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-9 py-4 bg-white text-blue-700 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200"
            style={{ fontFamily: F, textDecoration: 'none' }}
          >
            ابدأ الآن مجاناً 🚀
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-semibold text-base shadow-lg hover:bg-green-700 active:scale-95 transition-all duration-200"
            style={{ fontFamily: F, textDecoration: 'none' }}
          >
            <WAIcon />
            واتساب
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {['✓ بدون بطاقة بنكية', '✓ ابدأ مجاناً', '✓ يعمل على الموبايل', '✓ دعم بالعربية'].map((t, i) => (
            <span key={i} className="text-xs text-white/50" style={{ fontFamily: F }}>{t}</span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-white" dir="rtl">
      <HeroSection />
      <CoursesSection />
      <MapSection />
      <HowItWorksSection />
      <FinalCTA />
    </main>
  )
}
