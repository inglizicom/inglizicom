'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const WA = 'https://wa.me/212707902091?text=' + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')
const F = "'Cairo', sans-serif"
const GREEN = '#58CC02'
const GREEN_DARK = '#46a302'
const GREEN_SOFT = '#e9fcd4'

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '', dir }: {
  children: React.ReactNode; delay?: number; className?: string; dir?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } }, { threshold: 0.07 })
    o.observe(el); return () => o.disconnect()
  }, [])
  return (
    <div ref={ref} dir={dir} className={className}
      style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(28px)', transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════

function FloatingBadge({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-2.5 flex items-center gap-2 font-bold text-sm select-none ${className}`}
      style={{ fontFamily: F, ...style }}>
      {children}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pb-24"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #fff 55%, #eff6ff 100%)' }}>

      {/* background circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #58CC0220 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563eb18 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-5 py-2 text-sm font-semibold text-green-700 shadow-sm mb-8"
            style={{ fontFamily: F }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: GREEN }} />
            ١٠٠٠+ طالب يتعلمون الآن
          </div>

          {/* H1 */}
          <h1 className="font-extrabold text-slate-900 leading-tight mb-5"
            style={{ fontFamily: F, fontSize: 'clamp(2.2rem,5.5vw,3.8rem)' }}>
            تعلم الإنجليزية<br />
            <span style={{ color: GREEN }}>بطريقة ممتعة 🎉</span>
          </h1>

          <p className="text-slate-500 mb-10 max-w-lg"
            style={{ fontFamily: F, fontSize: 17, fontWeight: 400, lineHeight: 1.9 }}>
            تعلم بالمحادثة، بالصوت، وبطريقة سهلة — بدون قواعد معقدة ولا ملل
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link href="/onboarding"
              className="group inline-flex items-center gap-2 px-9 py-4 text-white rounded-2xl font-bold text-base shadow-lg active:scale-95 transition-all duration-200 hover:shadow-xl"
              style={{ fontFamily: F, background: GREEN, boxShadow: `0 8px 28px ${GREEN}45` }}>
              ابدأ الآن
              <span className="group-hover:translate-x-[-4px] transition-transform">🚀</span>
            </Link>
            <Link href="#how"
              className="inline-flex items-center gap-2 px-9 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-semibold text-base hover:border-green-300 hover:bg-green-50 active:scale-95 transition-all duration-200"
              style={{ fontFamily: F }}>
              كيف يعمل؟
            </Link>
          </div>

          {/* Floating badges */}
          <div className="relative w-full max-w-xs sm:max-w-sm mx-auto h-64">
            {/* Central phone mockup */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                style={{ background: 'linear-gradient(160deg,#58CC02 0%,#46a302 100%)' }}>
                <div className="p-4 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-xs font-semibold" style={{ fontFamily: F }}>واد زم — A0</span>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-lg" style={{ fontFamily: F }}>🔥 7</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 mb-4">
                    <div className="h-full rounded-full bg-white" style={{ width: '65%' }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[{ e: 'Hello', a: 'مرحبا', ok: true }, { e: 'Thank you', a: 'شكراً', ok: true }, { e: 'Goodbye', a: 'وداعاً', ok: false }].map((w, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${w.ok ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'}`}>
                        <span>{w.ok ? '✅' : '🔒'}</span>
                        <span style={{ fontFamily: F }}>{w.e}</span>
                        <span className="mr-auto text-white/70" style={{ fontFamily: F }}>{w.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating: XP */}
            <FloatingBadge className="float-1 -top-2 -right-2 sm:right-4 text-yellow-600">
              <span className="text-xl">⭐</span> +10 XP
            </FloatingBadge>

            {/* Floating: sound */}
            <FloatingBadge className="float-2 top-16 -left-4 sm:left-0 text-blue-600">
              <span className="text-xl">🔊</span>
              <span style={{ fontFamily: F, fontSize: 12 }}>استمع</span>
            </FloatingBadge>

            {/* Floating: chat */}
            <FloatingBadge className="float-3 -bottom-4 -right-2 sm:right-4 text-green-700">
              <span className="text-xl">💬</span>
              <span style={{ fontFamily: F, fontSize: 12 }}>محادثة</span>
            </FloatingBadge>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              { icon: '🎓', val: '+١٠٠٠', label: 'طالب' },
              { icon: '🌍', val: '٥+',    label: 'دول' },
              { icon: '⭐', val: '٤.٩',   label: 'تقييم' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-extrabold text-slate-800 text-xl" style={{ fontFamily: F }}>{s.val}</span>
                <span className="text-xs text-slate-500" style={{ fontFamily: F }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING PATH (DUOLINGO-STYLE VERTICAL)
// ═══════════════════════════════════════════════════════════════════════════════

const PATH = [
  { name: 'واد زم',        cefr: 'A0', emoji: '🌱', state: 'done'    },
  { name: 'خريبكة',         cefr: 'A1', emoji: '📖', state: 'current' },
  { name: 'الدار البيضاء', cefr: 'A1', emoji: '💬', state: 'locked'  },
  { name: 'مراكش',          cefr: 'A2', emoji: '🚀', state: 'locked'  },
  { name: 'الرباط',          cefr: 'B1', emoji: '🏙️', state: 'locked'  },
  { name: 'فاس',             cefr: 'B2', emoji: '🏆', state: 'locked'  },
]

function PathSection() {
  return (
    <section id="path" className="py-24" style={{ background: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <span className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-5" style={{ fontFamily: F }}>
            🗺️ خريطة الرحلة
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: F }}>رحلتك من الصفر إلى الاحتراف</h2>
          <p className="text-slate-500" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>كل مدينة مستوى جديد — أكمل الوحدات لتفتح المدينة التالية</p>
        </Reveal>

        {/* Vertical path */}
        <div className="flex flex-col items-center gap-0">
          {PATH.map((n, i) => {
            const done    = n.state === 'done'
            const current = n.state === 'current'
            const locked  = n.state === 'locked'
            return (
              <Reveal key={i} delay={i * 80} className="flex flex-col items-center w-full">
                {/* Node row */}
                <div className="flex items-center gap-5 w-full max-w-xs" dir="rtl">
                  {/* Circle */}
                  <div
                    className={`relative flex items-center justify-center rounded-full border-4 text-2xl flex-shrink-0 transition-all duration-300 ${current ? 'node-pulse' : ''}`}
                    style={{
                      width: current ? 76 : 64,
                      height: current ? 76 : 64,
                      background: done ? GREEN : current ? GREEN : locked ? '#e2e8f0' : '#e2e8f0',
                      borderColor: done ? GREEN_DARK : current ? GREEN_DARK : '#cbd5e1',
                      boxShadow: done || current ? `0 4px 20px ${GREEN}50` : 'none',
                      color: locked ? '#94a3b8' : '#fff',
                    }}
                  >
                    {locked ? '🔒' : done ? '✅' : n.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-base ${locked ? 'text-slate-400' : 'text-slate-800'}`} style={{ fontFamily: F }}>{n.name}</p>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg ${done || current ? 'text-green-700 bg-green-100' : 'text-slate-400 bg-slate-100'}`}
                        style={{ fontFamily: F }}>
                        {n.cefr}
                      </span>
                      {current && (
                        <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-lg" style={{ background: GREEN, fontFamily: F }}>الآن</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {i < PATH.length - 1 && (
                  <div className="w-1 rounded-full my-1" style={{ height: 32, background: i < 1 ? GREEN : '#e2e8f0' }} />
                )}
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={300} className="text-center mt-10">
          <Link href="/map"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-lg active:scale-95 transition-all duration-200 hover:shadow-xl"
            style={{ fontFamily: F, background: GREEN, boxShadow: `0 8px 24px ${GREEN}40`, textDecoration: 'none' }}>
            ابدأ الرحلة 🚀
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════════

const COURSES = [
  { cefr: 'A0', ar: 'البداية',   emoji: '🟢', desc: 'أول خطوة — التحيات والتعارف',           available: true  },
  { cefr: 'A1', ar: 'المبتدئ',   emoji: '🌱', desc: 'الأرقام والوقت والروتين اليومي',         available: true  },
  { cefr: 'A2', ar: 'المتوسط',   emoji: '🚀', desc: 'المحادثة والسفر والأماكن',               available: true  },
  { cefr: 'B1', ar: 'المحادثة',  emoji: '💬', desc: 'التعبير عن الرأي والمواقف المعقدة',      available: true  },
  { cefr: 'B2', ar: 'الطلاقة',   emoji: '🔥', desc: 'طلاقة حقيقية وأسلوب طبيعي',             available: false },
  { cefr: 'C1', ar: 'الاحتراف',  emoji: '🏆', desc: 'كالناطقين تماماً — قريباً',              available: false },
]

function CourseCard({ c }: { c: typeof COURSES[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative flex flex-col h-full rounded-3xl border-2 p-6 transition-all duration-200"
      style={{
        background: '#fff',
        borderColor: hov && c.available ? GREEN : '#e2e8f0',
        boxShadow: hov && c.available ? `0 12px 36px ${GREEN}22` : '0 2px 8px rgba(0,0,0,.04)',
        transform: hov && c.available ? 'translateY(-6px) scale(1.01)' : 'none',
        opacity: c.available ? 1 : .55,
      }}
    >
      {!c.available && (
        <span className="absolute top-4 left-4 bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: F }}>قريباً</span>
      )}
      <div className="text-4xl mb-3">{c.emoji}</div>
      <span className="inline-block text-xs font-extrabold px-2.5 py-1 rounded-xl mb-2"
        style={{ background: GREEN_SOFT, color: GREEN_DARK, fontFamily: F }}>{c.cefr}</span>
      <h3 className="font-extrabold text-slate-800 text-lg mb-2" style={{ fontFamily: F }}>{c.ar}</h3>
      <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5" dir="rtl" style={{ fontFamily: F, fontWeight: 400 }}>{c.desc}</p>
      {c.available && (
        <Link href="/onboarding"
          className="flex items-center justify-center py-3 rounded-2xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
          style={{ background: hov ? GREEN_DARK : GREEN, fontFamily: F, textDecoration: 'none', boxShadow: hov ? `0 4px 16px ${GREEN}50` : 'none' }}>
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
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-5" style={{ fontFamily: F }}>📚 الدورات</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: F }}>اختر مستواك وانطلق</h2>
          <p className="text-slate-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>ستة مستويات — كل مستوى يبني على ما سبقه بطريقة طبيعية وممتعة</p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((c, i) => (
            <Reveal key={c.cefr} delay={i * 60}>
              <CourseCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { icon: '🔊', title: 'استمع للكلمات',   desc: '١٠ كلمات جديدة — اضغط واسمع النطق الصحيح مباشرة',       bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  { icon: '🧠', title: 'افهم الجمل',      desc: 'جمل حقيقية مع ترجمة — كما يستخدمها الناطقون يومياً',    bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  { icon: '💬', title: 'مارس الحوار',     desc: 'محادثة كاملة بين شخصين — استمع وردد وتدرب',              bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  { icon: '🎯', title: 'اختبر نفسك',      desc: 'أكثر من ١٠ تمارين — اختيار متعدد وترجمة وترتيب',        bg: '#fdf4ff', border: '#e9d5ff', text: '#9333ea' },
]

function HowItWorksSection() {
  return (
    <section id="how" className="py-24" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <span className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-5" style={{ fontFamily: F }}>⚡ كيف يعمل</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: F }}>داخل كل درس — ٤ خطوات بسيطة</h2>
          <p className="text-slate-500 max-w-md mx-auto" style={{ fontFamily: F, fontSize: 15, fontWeight: 400 }}>منهج واضح من الكلمة الأولى إلى المحادثة الكاملة</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="rounded-3xl p-6 text-center border-2 h-full flex flex-col hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="text-5xl mb-4">{s.icon}</div>
                <span className="inline-block text-xs font-extrabold mb-2 px-3 py-1 rounded-xl"
                  style={{ background: '#fff', color: s.text, fontFamily: F, border: `1.5px solid ${s.border}` }}>
                  الخطوة {['١','٢','٣','٤'][i]}
                </span>
                <h3 className="font-extrabold text-slate-800 text-base mb-2" style={{ fontFamily: F }}>{s.title}</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: F, color: '#64748b', fontWeight: 400 }}>{s.desc}</p>
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
    <section className="py-28 relative overflow-hidden" style={{ background: GREEN }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(-30%,30%)' }} />
      </div>
      <Reveal className="max-w-2xl mx-auto px-4 text-center relative z-10" dir="rtl">
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: F, fontSize: 'clamp(2rem,5vw,3rem)' }}>
          ابدأ رحلتك الآن
        </h2>
        <p className="text-white/80 text-base leading-relaxed mb-10 max-w-sm mx-auto" style={{ fontFamily: F, fontWeight: 400 }}>
          انضم لأكثر من ١٠٠٠ طالب — مجاناً، بدون تسجيل، بدون بطاقة بنكية
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200"
            style={{ fontFamily: F, color: GREEN_DARK, textDecoration: 'none' }}>
            ابدأ الآن 🎉
          </Link>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-base rounded-2xl border-2 border-white/40 text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
            style={{ fontFamily: F, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            واتساب
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {['✓ مجاناً', '✓ بدون بطاقة', '✓ موبايل', '✓ عربي كامل'].map((t, i) => (
            <span key={i} className="text-sm text-white/60" style={{ fontFamily: F }}>{t}</span>
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
      <PathSection />
      <CoursesSection />
      <HowItWorksSection />
      <FinalCTA />
    </main>
  )
}
