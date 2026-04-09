'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const WA = 'https://wa.me/212707902091?text=' + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')
const F  = "'Cairo', sans-serif"

function Reveal({ children, delay = 0, className = '', dir }: {
  children: React.ReactNode; delay?: number; className?: string; dir?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } },
      { threshold: 0.07 }
    )
    o.observe(el); return () => o.disconnect()
  }, [])
  return (
    <div ref={ref} dir={dir} className={className}
      style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(22px)', transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  const [xp, setXp] = useState(0)
  useEffect(() => { const t = setTimeout(() => setXp(64), 900); return () => clearTimeout(t) }, [])

  return (
    <section className="pt-20 pb-16 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Text */}
          <div dir="rtl" className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700 mb-6"
              style={{ fontFamily: F }}>
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              ١٠٠٠+ طالب يتعلمون الآن
            </div>

            <h1 className="font-bold text-gray-900 leading-tight mb-4"
              style={{ fontFamily: F, fontSize: 'clamp(2rem, 4.5vw, 3.1rem)', letterSpacing: '-0.01em' }}>
              تعلم الإنجليزية
              <br />
              <span className="text-green-600">بالمحادثة خطوة بخطوة</span>
            </h1>

            <p className="text-gray-500 mb-8 leading-relaxed max-w-lg"
              style={{ fontFamily: F, fontSize: 16, fontWeight: 400, lineHeight: 1.9 }}>
              دورات عملية تساعدك تتكلم من اليوم الأول — بدون قواعد معقدة وبدون ملل
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/onboarding"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/25"
                style={{ fontFamily: F }}>
                ابدأ الآن 🚀
              </Link>
              <Link href="#method"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold text-sm hover:border-green-300 hover:bg-green-50 transition-all"
                style={{ fontFamily: F }}>
                شاهد كيف يعمل
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {['+١٠٠٠ طالب', 'نتائج حقيقية', 'تعلم من الصفر'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-gray-500" style={{ fontFamily: F }}>
                  <span className="text-green-500 font-bold">✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-80">
              {/* Floating XP */}
              <div className="float-1 absolute -top-4 -right-4 z-10 flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-lg text-sm font-bold text-yellow-600"
                style={{ fontFamily: F }}>
                ⭐ +10 XP
              </div>
              {/* Floating chat */}
              <div className="float-2 absolute top-20 -left-8 z-10 bg-blue-500 text-white text-xs font-semibold px-3 py-2 shadow-lg whitespace-nowrap"
                style={{ fontFamily: F, borderRadius: '14px 14px 4px 14px' }}>
                Good morning! ☀️
              </div>
              {/* Floating audio */}
              <div className="float-3 absolute -bottom-4 -right-4 z-10 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-2xl px-3 py-2 shadow-md text-sm font-bold text-green-700"
                style={{ fontFamily: F }}>
                🔊 استمع
              </div>

              {/* Card mockup */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white relative z-0">
                <div className="bg-green-500 p-4">
                  <div className="flex items-center justify-between mb-3" dir="rtl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">👨‍🎓</div>
                      <div>
                        <p className="text-white text-sm font-semibold" style={{ fontFamily: F }}>درس اليوم</p>
                        <p className="text-white/70 text-xs" style={{ fontFamily: F }}>واد زم — A0</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: F }}>🔥 7</span>
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: F }}>⚡ 480</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${xp}%`, transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-3 font-medium" dir="rtl" style={{ fontFamily: F }}>المفردات الجديدة</p>
                  {[
                    { en: 'Hello',     ar: 'مرحبا',    s: 'done'   },
                    { en: 'Thank you', ar: 'شكراً',     s: 'done'   },
                    { en: 'Please',    ar: 'من فضلك',  s: 'active' },
                    { en: 'Sorry',     ar: 'آسف',      s: 'locked' },
                  ].map((w, i) => (
                    <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border mb-1.5 ${w.s === 'active' ? 'bg-blue-50 border-blue-200' : w.s === 'done' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white flex-shrink-0 ${w.s === 'done' ? 'bg-green-600' : w.s === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        {w.s === 'done' ? '✓' : w.s === 'active' ? '🔊' : '🔒'}
                      </div>
                      <div dir="rtl" className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${w.s === 'locked' ? 'text-gray-400' : 'text-gray-800'}`} style={{ fontFamily: F }}>{w.en}</p>
                        <p className="text-xs text-gray-400 truncate" style={{ fontFamily: F }}>{w.ar}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 bg-green-500 text-white text-sm font-semibold text-center py-2.5 rounded-xl cursor-pointer"
                    style={{ fontFamily: F }}>استمر ▶</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════════

const COURSES = [
  { cefr: 'A0', ar: 'البداية',  emoji: '🌱', desc: 'التحيات، التعارف، والعبارات الأولى لبداية صحيحة',          open: true  },
  { cefr: 'A1', ar: 'المبتدئ',  emoji: '📖', desc: 'الأرقام، الوقت، والروتين اليومي بشكل بسيط',               open: true  },
  { cefr: 'A2', ar: 'الأساسي',  emoji: '💬', desc: 'المحادثة اليومية، السفر، العمل والأماكن',                  open: true  },
  { cefr: 'B1', ar: 'المتوسط',  emoji: '🚀', desc: 'التعبير عن الرأي والمواقف الأكثر تعقيداً',                 open: true  },
  { cefr: 'B2', ar: 'الطلاقة',  emoji: '🔥', desc: 'طلاقة حقيقية وأسلوب طبيعي قريب من الناطقين',              open: false },
  { cefr: 'C1', ar: 'الاحتراف', emoji: '🏆', desc: 'مستوى متقدم كالناطقين الأصليين تماماً',                    open: false },
]

function CourseCard({ c, delay }: { c: typeof COURSES[0]; delay: number }) {
  const [hov, setHov] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="relative flex flex-col h-full bg-white rounded-2xl border p-5 transition-all duration-200"
        style={{
          borderColor: hov && c.open ? '#86efac' : '#e5e7eb',
          boxShadow: hov && c.open ? '0 8px 30px rgba(34,197,94,.12)' : '0 1px 4px rgba(0,0,0,.05)',
          transform: hov && c.open ? 'translateY(-4px)' : 'none',
          opacity: c.open ? 1 : .55,
        }}
      >
        {!c.open && (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-gray-100 text-gray-400 px-2.5 py-0.5 rounded-lg border border-gray-200"
            style={{ fontFamily: F }}>قريباً</span>
        )}
        <div className="flex items-center gap-3 mb-3" dir="rtl">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl flex-shrink-0">
            {c.emoji}
          </div>
          <div>
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-0.5 bg-green-50 text-green-700 border border-green-100"
              style={{ fontFamily: F }}>{c.cefr}</span>
            <p className="font-semibold text-gray-800 text-base" style={{ fontFamily: F }}>{c.ar}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4" dir="rtl"
          style={{ fontFamily: F, fontWeight: 400 }}>{c.desc}</p>
        {c.open && (
          <Link href="/onboarding"
            className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200"
            style={{
              textDecoration: 'none',
              background: hov ? '#22c55e' : '#f0fdf4',
              color: hov ? '#fff' : '#16a34a',
              borderColor: '#bbf7d0',
              fontFamily: F,
            }}>
            ابدأ
          </Link>
        )}
      </div>
    </Reveal>
  )
}

function CoursesSection() {
  return (
    <section id="courses" className="py-20" style={{ background: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12" dir="rtl">
          <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-green-50 text-green-700 border border-green-200"
            style={{ fontFamily: F }}>📚 المسارات</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: F }}>الدورات</h2>
          <p className="text-gray-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
            ستة مستويات من الصفر إلى الاحتراف — كل مستوى يبني على السابق
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSES.map((c, i) => <CourseCard key={c.cefr} c={c} delay={i * 55} />)}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// METHOD
// ═══════════════════════════════════════════════════════════════════════════════

function MethodSection() {
  const items = [
    { icon: '🔊', title: 'استمع', desc: 'كل كلمة وجملة مصحوبة بصوت حقيقي — اسمع النطق الصحيح من البداية', col: '#3b82f6' },
    { icon: '💬', title: 'تحدث', desc: 'محادثات حقيقية بين شخصين — تدرب على الكلام كما تفعل في حياتك اليومية', col: '#22c55e' },
    { icon: '🧠', title: 'افهم', desc: 'لا حفظ ولا قواعد معقدة — نركز على الفهم الطبيعي والاستخدام الصحيح للغة', col: '#3b82f6' },
  ]
  return (
    <section id="method" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12" dir="rtl">
          <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-blue-50 text-blue-700 border border-blue-100"
            style={{ fontFamily: F }}>🎓 المنهج</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: F }}>كيف تتعلم معنا؟</h2>
          <p className="text-gray-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
            طريقة مبنية على كيف يتعلم الدماغ البشري فعلاً — بدون ملل
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {items.map((m, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="bg-white rounded-2xl p-7 text-center border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-200 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 border"
                  style={{ background: m.col + '10', borderColor: m.col + '25' }}>
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-xl mb-3" style={{ fontFamily: F }}>{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1" style={{ fontFamily: F, fontWeight: 400 }}>{m.desc}</p>
                <div className="w-10 h-1 rounded-full mx-auto mt-5" style={{ background: m.col }} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST
// ═══════════════════════════════════════════════════════════════════════════════

function TrustSection() {
  const stats = [
    { val: '+١٠٠٠', label: 'طالب مسجّل',   icon: '👩‍🎓' },
    { val: '٩٧٪',   label: 'معدل الرضا',   icon: '⭐'   },
    { val: 'مجاناً', label: 'للبدء',        icon: '🎁'   },
    { val: 'A0→C1', label: 'مسار كامل',    icon: '🗺️'   },
  ]
  return (
    <section className="py-16" style={{ background: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl py-6 px-4 text-center border border-gray-100 shadow-sm">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-bold text-gray-900 text-xl mb-1" style={{ fontFamily: F }}>{s.val}</p>
                <p className="text-sm text-gray-500" style={{ fontFamily: F }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════════════════════

const MAP_NODES = [
  { name: 'واد زم',        cefr: 'A0', state: 'done'    },
  { name: 'خريبكة',         cefr: 'A1', state: 'current' },
  { name: 'الدار البيضاء', cefr: 'A2', state: 'locked'  },
  { name: 'مراكش',          cefr: 'B1', state: 'locked'  },
]

function MapSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <Reveal dir="rtl">
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-green-50 text-green-700 border border-green-200"
              style={{ fontFamily: F }}>🗺️ رحلة التعلم</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: F }}>رحلة التعلم</h2>
            <p className="text-gray-500 leading-relaxed mb-3" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
              تبدأ من <strong className="text-green-600">واد زم</strong> — أول خطوة — ثم تتقدم عبر مدن المغرب مستوى تلو الآخر حتى تصل إلى الطلاقة الكاملة.
            </p>
            <p className="text-gray-400 mb-8" style={{ fontFamily: F, fontSize: 14, fontWeight: 400 }}>
              كل مدينة = مستوى. أكمل وحداتها وافتح المدينة التالية.
            </p>
            <Link href="/map"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/20"
              style={{ fontFamily: F, textDecoration: 'none' }}>
              ابدأ الرحلة 🗺️
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
              <div className="flex items-center justify-start gap-0" style={{ direction: 'ltr' }}>
                {MAP_NODES.map((n, i) => {
                  const done    = n.state === 'done'
                  const current = n.state === 'current'
                  const locked  = n.state === 'locked'
                  return (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`flex items-center justify-center rounded-full border-4 text-base font-bold transition-all ${current ? 'node-pulse' : ''}`}
                          style={{
                            width: current ? 56 : 48, height: current ? 56 : 48,
                            background: done ? '#22c55e' : current ? '#22c55e' : '#e5e7eb',
                            borderColor: done ? '#16a34a' : current ? '#16a34a' : '#d1d5db',
                            color: locked ? '#9ca3af' : '#fff',
                            boxShadow: done || current ? '0 4px 16px rgba(34,197,94,.3)' : 'none',
                          }}>
                          {locked ? '🔒' : done ? '⭐' : '📍'}
                        </div>
                        <div className="text-center" style={{ minWidth: 68 }}>
                          <p className={`text-xs font-semibold whitespace-nowrap mb-1 ${locked ? 'text-gray-400' : 'text-gray-700'}`}
                            style={{ fontFamily: F }}>{n.name}</p>
                          <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded-md ${done || current ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                            style={{ fontFamily: F }}>{n.cefr}</span>
                        </div>
                      </div>
                      {i < MAP_NODES.length - 1 && (
                        <div className="flex-shrink-0 h-1 rounded-full mx-1" style={{ width: 28, marginBottom: 32, background: i === 0 ? '#22c55e' : '#e5e7eb' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
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
    <section className="py-24 bg-green-500 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,.07)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,.05)', transform: 'translate(-30%,30%)' }} />
      </div>
      <Reveal className="max-w-xl mx-auto px-4 text-center relative z-10" dir="rtl">
        <h2 className="font-bold text-white leading-tight mb-4"
          style={{ fontFamily: F, fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
          ابدأ الآن وابدأ رحلتك في تعلم الإنجليزية
        </h2>
        <p className="text-white/75 leading-relaxed mb-10"
          style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>
          مجاناً، بدون تسجيل، بدون بطاقة بنكية
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 px-9 py-4 bg-white font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-green-700"
            style={{ fontFamily: F, textDecoration: 'none' }}>
            ابدأ الآن 🎉
          </Link>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-base rounded-2xl border-2 border-white/40 text-white hover:bg-white/10 active:scale-95 transition-all"
            style={{ fontFamily: F, textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            واتساب
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {['✓ مجاناً', '✓ بدون تسجيل', '✓ موبايل', '✓ عربي كامل'].map((t, i) => (
            <span key={i} className="text-sm text-white/55" style={{ fontFamily: F }}>{t}</span>
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
  // suppress unused import warning — Image is available for future real photos
  void Image
  return (
    <main className="overflow-x-hidden bg-white" dir="rtl">
      <HeroSection />
      <CoursesSection />
      <MethodSection />
      <TrustSection />
      <MapSection />
      <FinalCTA />
    </main>
  )
}
