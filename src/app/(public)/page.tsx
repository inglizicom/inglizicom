'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/212707902091?text=' + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', dir }: {
  children: React.ReactNode; delay?: number; className?: string; dir?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } }, { threshold: 0.08 })
    o.observe(el); return () => o.disconnect()
  }, [])
  return (
    <div ref={ref} dir={dir} className={className}
      style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(24px)', transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Chip label ───────────────────────────────────────────────────────────────
function Chip({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span className={`inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4 ${green ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
      style={{ fontFamily: "'Cairo',sans-serif" }}>
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════

const SLIDES = [
  { tag: '🎯 ابدأ مجاناً بدون تسجيل', h1: 'تعلم الإنجليزية', h2: 'بالمحادثة خطوة بخطوة', sub: 'بدون قواعد معقدة — تعلم بطريقة طبيعية وعملية من الصفر' },
  { tag: '🗺️ خريطة تفاعلية ممتعة',    h1: 'رحلة عبر مدن',    h2: 'المغرب الجميلة',        sub: 'كل مدينة = مستوى جديد — تقدم حقيقي يحفّزك على الاستمرار' },
  { tag: '⚡ XP وسلسلة يومية',          h1: 'نظام مكافآت',     h2: 'يجعل التعلم ممتعاً',   sub: 'اكسب نقاط، افتح مدناً جديدة، وحافظ على سلسلتك كل يوم' },
]

function MockupCard() {
  const [xp, setXp] = useState(0)
  useEffect(() => { const t = setTimeout(() => setXp(68), 800); return () => clearTimeout(t) }, [])

  return (
    <div className="relative w-72 mx-auto">
      {/* Floating XP */}
      <div className="float-1 absolute -top-5 -right-4 z-10 flex items-center gap-1.5 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 shadow-lg" style={{ fontFamily: "'Cairo',sans-serif" }}>
        ⚡ +50 XP
      </div>
      {/* Floating chat */}
      <div className="float-2 absolute top-20 -left-8 z-10 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-2xl rounded-bl-sm shadow-lg whitespace-nowrap" style={{ fontFamily: "'Cairo',sans-serif" }}>
        Good morning! ☀️
      </div>
      {/* Floating streak */}
      <div className="float-3 absolute -bottom-4 -right-5 z-10 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm font-bold text-green-700 shadow-md" style={{ fontFamily: "'Cairo',sans-serif" }}>
        🔥 14 يوم
      </div>

      {/* App card */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-white relative z-0">
        {/* Header */}
        <div className="bg-blue-600 p-4">
          <div className="flex items-center justify-between mb-3" dir="rtl">
            <span className="text-white/90 text-sm font-semibold" style={{ fontFamily: "'Cairo',sans-serif" }}>واد زم — A0</span>
            <div className="flex gap-2">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: "'Cairo',sans-serif" }}>🔥 14</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: "'Cairo',sans-serif" }}>⚡ 640</span>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-1000" style={{ width: `${xp}%`, transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        </div>
        {/* Words */}
        <div className="p-4">
          <p className="text-xs text-slate-400 mb-3" dir="rtl" style={{ fontFamily: "'Cairo',sans-serif" }}>المفردات الجديدة</p>
          <div className="flex flex-col gap-2">
            {[
              { en: 'Hello',        ar: 'مرحبا',      s: 'done'   },
              { en: 'Good morning', ar: 'صباح الخير', s: 'done'   },
              { en: 'How are you?', ar: 'كيف حالك؟',  s: 'active' },
              { en: 'My name is…',  ar: 'اسمي…',       s: 'locked' },
            ].map((w, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${w.s === 'active' ? 'bg-blue-50 border-blue-200' : w.s === 'done' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white flex-shrink-0 ${w.s === 'done' ? 'bg-green-600' : w.s === 'active' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  {w.s === 'done' ? '✓' : w.s === 'active' ? '🔊' : '🔒'}
                </div>
                <div dir="rtl" className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${w.s === 'locked' ? 'text-slate-400' : 'text-slate-800'}`} style={{ fontFamily: "'Cairo',sans-serif" }}>{w.en}</p>
                  <p className="text-xs text-slate-400 truncate" style={{ fontFamily: "'Cairo',sans-serif" }}>{w.ar}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-blue-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl" style={{ fontFamily: "'Cairo',sans-serif", cursor: 'pointer' }}>
            استمر ▶
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(false)

  function go(i: number) {
    setFade(true); setTimeout(() => { setIdx(i); setFade(false) }, 240)
  }
  useEffect(() => {
    const t = setInterval(() => { setFade(true); setTimeout(() => { setIdx(s => (s + 1) % SLIDES.length); setFade(false) }, 240) }, 5000)
    return () => clearInterval(t)
  }, [])

  const s = SLIDES[idx]

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(150deg,#eff6ff 0%,#fff 50%,#f0fdf4 100%)', paddingTop: 80, minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      {/* blobs */}
      <div className="hero-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: '#2563eb08', filter: 'blur(80px)', top: '5%', right: '-2%' }} />
      <div className="hero-blob-2 absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: '#22c55e0a', filter: 'blur(70px)', bottom: '0', left: '-2%' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text */}
          <div dir="rtl" style={{ opacity: fade ? 0 : 1, transform: fade ? 'translateY(8px)' : 'none', transition: 'all .24s ease' }}>
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm mb-6" style={{ fontFamily: "'Cairo',sans-serif" }}>
              <span className="dot-pulse w-2 h-2 rounded-full bg-green-500 flex-shrink-0 inline-block" />
              {s.tag}
            </div>

            <h1 className="font-bold leading-tight mb-4 text-slate-900" style={{ fontFamily: "'Cairo',sans-serif", fontSize: 'clamp(2rem,4.5vw,3.2rem)', letterSpacing: '-0.01em' }}>
              {s.h1}<br />
              <span className="text-blue-600">{s.h2}</span>
            </h1>

            <p className="text-slate-500 mb-8 max-w-lg leading-relaxed" style={{ fontFamily: "'Cairo',sans-serif", fontSize: 16, fontWeight: 400, lineHeight: 1.85 }}>
              {s.sub}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/onboarding" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all" style={{ fontFamily: "'Cairo',sans-serif" }}>
                ابدأ الآن مجاناً 🚀
              </Link>
              <Link href="#how" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold text-sm hover:border-blue-200 hover:bg-blue-50 transition-all" style={{ fontFamily: "'Cairo',sans-serif" }}>
                شاهد كيف يعمل
              </Link>
            </div>

            <div className="flex flex-wrap gap-5">
              {['+١٠٠٠ طالب', 'نتائج حقيقية', 'تقدم سريع'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-slate-500" style={{ fontFamily: "'Cairo',sans-serif" }}>
                  <span className="text-green-500 font-bold">✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="flex justify-center" style={{ opacity: fade ? 0.5 : 1, transition: 'opacity .24s' }}>
            <MockupCard />
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)} className="h-2 rounded-full transition-all duration-300 border-none cursor-pointer" style={{ width: i === idx ? 28 : 8, background: i === idx ? '#2563eb' : '#e2e8f0' }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════════

interface CourseItem { cefr: string; ar: string; emoji: string; desc: string; blue?: boolean; soon?: boolean }

const COURSES: CourseItem[] = [
  { cefr: 'A0', ar: 'البداية',       emoji: '🌱', desc: 'التحيات والتعارف والعبارات الأولى' },
  { cefr: 'A1', ar: 'المبتدئ',       emoji: '📖', desc: 'الأسئلة والأرقام والوقت اليومي',       blue: true },
  { cefr: 'A2', ar: 'الأساسي',       emoji: '💬', desc: 'المحادثة اليومية والسفر والعمل',        blue: true },
  { cefr: 'B1', ar: 'المتوسط',       emoji: '🚀', desc: 'التعبير عن الرأي والمواقف المعقدة',   blue: true },
  { cefr: 'B2', ar: 'فوق المتوسط',  emoji: '⭐', desc: 'طلاقة حقيقية وأسلوب طبيعي',            soon: true },
  { cefr: 'C1', ar: 'المتقدم',       emoji: '🏆', desc: 'الاحتراف الكامل كالناطقين الأصليين',  soon: true },
  { cefr: 'BZ', ar: 'Business',      emoji: '💼', desc: 'الإنجليزية في الأعمال والمقابلات',     soon: true },
]

function CourseCard({ c }: { c: CourseItem }) {
  const [h, setH] = useState(false)
  const green = !c.blue && !c.soon
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="relative flex flex-col h-full rounded-2xl border p-5 transition-all duration-200 cursor-default"
      style={{ background: '#fff', borderColor: h && !c.soon ? (green ? '#bbf7d0' : '#bfdbfe') : '#e2e8f0', boxShadow: h && !c.soon ? (green ? '0 8px 28px rgba(22,163,74,.1)' : '0 8px 28px rgba(37,99,235,.1)') : '0 1px 4px rgba(0,0,0,.04)', transform: h && !c.soon ? 'translateY(-5px)' : 'none', opacity: c.soon ? .6 : 1 }}
    >
      {c.soon && <span className="absolute top-3 left-3 bg-slate-100 text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-lg border border-slate-200" style={{ fontFamily: "'Cairo',sans-serif" }}>قريباً</span>}

      <div className="flex items-center gap-3 mb-3" dir="rtl">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${green ? 'bg-green-50 border border-green-200' : c.soon ? 'bg-slate-50 border border-slate-200' : 'bg-blue-50 border border-blue-200'}`}>
          {c.emoji}
        </div>
        <div>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-0.5 ${green ? 'bg-green-50 text-green-700' : c.soon ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700'}`} style={{ fontFamily: "'Cairo',sans-serif" }}>{c.cefr}</span>
          <p className="font-semibold text-slate-800 text-base" style={{ fontFamily: "'Cairo',sans-serif" }}>{c.ar}</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4" dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>{c.desc}</p>

      {!c.soon && (
        <Link href="/onboarding"
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${h ? (green ? 'bg-green-600 text-white border-green-600' : 'bg-blue-600 text-white border-blue-600') : (green ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200')}`}
          style={{ fontFamily: "'Cairo',sans-serif", textDecoration: 'none' }}>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Cairo',sans-serif" }}>اختر مستواك وانطلق</h2>
          <p className="text-slate-500 max-w-md mx-auto text-base" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>من الصفر حتى الاحتراف — كل مستوى يبني على ما سبقه بشكل طبيعي</p>
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
  { name: 'واد زم',        cefr: 'A0', emoji: '🌱', done: true              },
  { name: 'خريبكة',         cefr: 'A1', emoji: '📖', done: true              },
  { name: 'الدار البيضاء', cefr: 'A1', emoji: '💬', current: true           },
  { name: 'مراكش',          cefr: 'A2', emoji: '🚀', locked: true            },
  { name: 'الرباط',          cefr: 'B1', emoji: '⭐', locked: true            },
]

function MapSection() {
  return (
    <section id="map" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip>🗺️ خريطة الرحلة</Chip>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Cairo',sans-serif" }}>تعلم عبر خريطة تفاعلية</h2>
          <p className="text-slate-500 max-w-md mx-auto text-base" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>كل مدينة = مستوى جديد — أكمل وحداتها وافتح المدينة التالية</p>
        </Reveal>

        <Reveal delay={100}>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-start lg:justify-center min-w-max px-6 py-12" style={{ direction: 'ltr' }}>
              {MAP_NODES.map((n, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`flex items-center justify-center rounded-full text-2xl border-4 transition-all ${n.current ? 'node-pulse' : ''}`}
                      style={{ width: n.current ? 80 : 68, height: n.current ? 80 : 68, fontSize: n.current ? 30 : 24, background: n.done ? '#16a34a' : n.current ? '#2563eb' : '#e2e8f0', borderColor: n.done ? '#15803d' : n.current ? '#1d4ed8' : '#cbd5e1', color: n.locked ? '#94a3b8' : '#fff', boxShadow: n.done ? '0 4px 16px rgba(22,163,74,.3)' : 'none' }}
                    >
                      {n.locked ? '🔒' : n.done ? '⭐' : n.emoji}
                    </div>
                    <div className="text-center" style={{ minWidth: 88 }}>
                      <p className={`text-xs font-semibold mb-1 ${n.locked ? 'text-slate-400' : 'text-slate-800'}`} style={{ fontFamily: "'Cairo',sans-serif", whiteSpace: 'nowrap' }}>{n.name}</p>
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${n.done ? 'bg-green-50 text-green-700' : n.current ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`} style={{ fontFamily: "'Cairo',sans-serif" }}>{n.cefr}</span>
                    </div>
                  </div>
                  {i < MAP_NODES.length - 1 && (
                    <div className="mx-2 h-1 rounded-full flex-shrink-0" style={{ width: 48, background: i < 1 ? '#16a34a' : i === 1 ? '#2563eb' : '#e2e8f0', marginBottom: 40 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={220} className="text-center mt-2">
          <Link href="/map" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all" style={{ fontFamily: "'Cairo',sans-serif", textDecoration: 'none' }}>
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
  { n: '١', icon: '🔊', title: 'كلمات مع صوت',  desc: '١٠ مفردات جديدة — اضغط واسمع النطق الصحيح',        green: false },
  { n: '٢', icon: '✏️', title: 'جمل تفاعلية',   desc: 'جمل حقيقية كما يستخدمها الناطقون يومياً',            green: true  },
  { n: '٣', icon: '💬', title: 'محادثة كاملة',  desc: 'حوار بين شخصين — استمع وتدرب على الرد الطبيعي',     green: false },
  { n: '٤', icon: '🎯', title: 'اختبار متنوع',  desc: 'أكثر من ١٠ تمارين — اختيار متعدد وترجمة وترتيب',    green: true  },
]

function HowItWorksSection() {
  return (
    <section id="how" className="py-24" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip green>⚡ كيف يعمل</Chip>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Cairo',sans-serif" }}>داخل كل درس — ٤ خطوات فقط</h2>
          <p className="text-slate-500 max-w-md mx-auto text-base" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>منهج واضح يأخذك من الكلمة الأولى إلى المحادثة الكاملة</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm h-full flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 ${s.green ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                  {s.icon}
                </div>
                <p className={`text-xs font-bold mb-2 ${s.green ? 'text-green-700' : 'text-blue-700'}`} style={{ fontFamily: "'Cairo',sans-serif" }}>الخطوة {s.n}</p>
                <h3 className="font-bold text-slate-800 text-base mb-2" style={{ fontFamily: "'Cairo',sans-serif" }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>{s.desc}</p>
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
    <section className="py-24" style={{ background: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)' }}>
      <Reveal className="max-w-2xl mx-auto px-4 text-center" dir="rtl">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white mb-6" style={{ fontFamily: "'Cairo',sans-serif" }}>
          <span className="dot-pulse w-2 h-2 rounded-full bg-green-400 flex-shrink-0 inline-block" />
          مفتوح الآن — بدون تسجيل
        </div>

        <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Cairo',sans-serif" }}>
          ابدأ رحلتك اليوم
        </h2>

        <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm mx-auto" style={{ fontFamily: "'Cairo',sans-serif", fontWeight: 400 }}>
          انضم لأكثر من ١٠٠٠ طالب — منهج منظم، عملي، وممتع
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-blue-700 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl active:scale-95 transition-all" style={{ fontFamily: "'Cairo',sans-serif", textDecoration: 'none' }}>
            ابدأ الآن مجاناً 🚀
          </Link>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-semibold text-base shadow-lg hover:bg-green-700 active:scale-95 transition-all" style={{ fontFamily: "'Cairo',sans-serif", textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            واتساب
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {['✓ بدون بطاقة بنكية', '✓ ابدأ مجاناً', '✓ موبايل', '✓ دعم بالعربية'].map((t, i) => (
            <span key={i} className="text-xs text-white/50" style={{ fontFamily: "'Cairo',sans-serif" }}>{t}</span>
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
