'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Font shorthand ───────────────────────────────────────────────────────────
const FONT_AR = "'Cairo', sans-serif"

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  blue:       '#2563eb',
  blueSoft:   '#eff6ff',
  blueBorder: '#bfdbfe',
  blueText:   '#1d4ed8',
  green:      '#22c55e',
  greenSoft:  '#f0fdf4',
  greenBorder:'#bbf7d0',
  greenText:  '#16a34a',
  bg:         '#ffffff',
  bgSoft:     '#f8fafc',
  border:     '#e2e8f0',
  text:       '#1e293b',
  muted:      '#64748b',
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
const WA = 'https://wa.me/212707902091?text=' +
  encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')

function WAIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className = '', style = {}, dir,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
  dir?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      dir={dir}
      style={{
        ...style,
        opacity:    vis ? 1 : 0,
        transform:  vis ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'green' }) {
  const color  = variant === 'green' ? C.green      : C.blue
  const soft   = variant === 'green' ? C.greenSoft  : C.blueSoft
  const border = variant === 'green' ? C.greenBorder: C.blueBorder
  return (
    <span
      className="inline-block text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 tracking-wide"
      style={{ color, background: soft, border: `1px solid ${border}`, fontFamily: FONT_AR }}
    >
      {children}
    </span>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl sm:text-3xl font-semibold leading-snug mb-3"
      style={{ color: C.text, fontFamily: FONT_AR }}
    >
      {children}
    </h2>
  )
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: C.muted, fontFamily: FONT_AR, fontWeight: 400 }}>
      {children}
    </p>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-full" style={{ height: 1, background: C.border }} />
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════════════════

const HERO_STATS = [
  { value: '+١٠٠٠', label: 'طالب مسجّل' },
  { value: '١٥+',   label: 'مدينة في الرحلة' },
  { value: '٥٠٠+',  label: 'تمرين تفاعلي' },
]

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: C.bgSoft, paddingTop: 80 }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${C.border} 1px, transparent 1px),
            linear-gradient(90deg, ${C.border} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.35,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-28">

          {/* ── Text ── */}
          <div dir="rtl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-7"
              style={{ background: C.greenSoft, color: C.greenText, border: `1px solid ${C.greenBorder}` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
              مفتوح الآن — ابدأ مجاناً
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-5"
              style={{ color: C.text, fontFamily: FONT_AR, letterSpacing: '-0.01em' }}
            >
              تعلم الإنجليزية
              <br />
              <span style={{ color: C.blue }}>خطوة بخطوة</span>
            </h1>

            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: C.muted, fontFamily: FONT_AR, fontWeight: 400 }}
            >
              من الصفر حتى الاحتراف — بطريقة عملية تعتمد على المحادثة الحقيقية، بدون قواعد نحو معقدة.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/onboarding"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: C.blue, boxShadow: '0 4px 16px rgba(37,99,235,0.28)', fontFamily: FONT_AR }}
              >
                ابدأ الآن
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </Link>
              <Link
                href="#path"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ color: C.blue, background: '#fff', border: `1.5px solid #bfdbfe`, fontFamily: FONT_AR }}
              >
                استكشف المنهج
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 flex-wrap">
              {HERO_STATS.map((s, i) => (
                <div key={i} dir="rtl">
                  <p className="text-xl font-bold" style={{ color: C.text, fontFamily: FONT_AR }}>{s.value}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Visual panel ── */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-lg"
              style={{ background: '#fff', border: `1px solid ${C.border}` }}
            >
              {/* Student card header */}
              <div className="px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base"
                    style={{ background: C.blue }}
                  >
                    أ
                  </div>
                  <div dir="rtl">
                    <p className="font-semibold text-sm" style={{ color: C.text, fontFamily: FONT_AR }}>أحمد — طالب</p>
                    <p className="text-xs" style={{ color: C.muted }}>يتعلم منذ ٣ أسابيع</p>
                  </div>
                  <div className="mr-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: C.greenSoft, color: C.greenText }}>
                    🔥 ١٤ يوم
                  </div>
                </div>
                {/* XP bar */}
                <div dir="rtl">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                    <span>المستوى A1</span>
                    <span>٦٤٠ / ١٠٠٠ XP</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '64%', background: C.blue }}
                    />
                  </div>
                </div>
              </div>

              {/* Current lesson */}
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="text-xs font-semibold mb-3" style={{ color: C.muted, fontFamily: FONT_AR }}>الدرس الحالي</p>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: C.blueSoft, border: `1px solid #bfdbfe` }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: '#fff' }}>💬</div>
                  <div dir="rtl" className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: C.text }}>Small Talk</p>
                    <p className="text-xs" style={{ color: C.muted }}>المحادثة الخفيفة — مدينة القنيطرة</p>
                  </div>
                  <Link href="/map" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: C.blue }}>▶</Link>
                </div>
              </div>

              {/* Recent activity */}
              <div className="px-6 py-4">
                <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>آخر نشاط</p>
                <div className="flex flex-col gap-2" dir="rtl">
                  {[
                    { icon:'✅', text:'أكمل وحدة الاتجاهات', time:'اليوم', color: C.greenText },
                    { icon:'⚡', text:'ربح ٥٠ نقطة XP',      time:'أمس',   color: C.blue },
                    { icon:'🔓', text:'فتح مدينة سلا',        time:'٣ أيام', color: C.blue },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-base">{a.icon}</span>
                      <span className="flex-1 text-xs" style={{ color: C.text }}>{a.text}</span>
                      <span className="text-xs" style={{ color: C.muted }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="h-12 w-full" style={{ background: 'linear-gradient(to bottom, transparent, #fff)' }} />
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. COURSES
// ═══════════════════════════════════════════════════════════════════════════════

const COURSES_DATA = [
  { cefr:'A0', label:'البداية',        emoji:'🌱', color:C.greenText,  colorSoft:C.greenSoft,  colorBorder:C.greenBorder, desc:'أول خطواتك — التحيات والتعارف والعبارات الأساسية', units:11, status:'open' },
  { cefr:'A1', label:'المبتدئ',        emoji:'📖', color:C.blue,       colorSoft:C.blueSoft,   colorBorder:C.blueBorder,  desc:'الأسئلة والأرقام والوقت والروتين اليومي',              units:24, status:'open' },
  { cefr:'A2', label:'الأساسي',        emoji:'💬', color:C.blue,       colorSoft:C.blueSoft,   colorBorder:C.blueBorder,  desc:'المحادثة اليومية والسفر والعمل والصحة',                units:18, status:'open' },
  { cefr:'B1', label:'المتوسط',        emoji:'🚀', color:C.blue,       colorSoft:C.blueSoft,   colorBorder:C.blueBorder,  desc:'التعبير عن الرأي والحكايات والمواقف المعقدة',          units:20, status:'open' },
  { cefr:'B2', label:'فوق المتوسط',   emoji:'⭐', color:'#94a3b8',    colorSoft:C.bgSoft,     colorBorder:C.border,      desc:'طلاقة حقيقية ومفردات واسعة وأسلوب طبيعي',             units:0,  status:'soon' },
  { cefr:'C1', label:'المتقدم',        emoji:'🏆', color:'#94a3b8',    colorSoft:C.bgSoft,     colorBorder:C.border,      desc:'الاحتراف الكامل — كالناطقين الأصليين تماماً',          units:0,  status:'soon' },
  { cefr:'BZ', label:'Business Eng.', emoji:'💼', color:'#94a3b8',    colorSoft:C.bgSoft,     colorBorder:C.border,      desc:'الإنجليزية في بيئة الأعمال والمقابلات والكتابة الرسمية', units:0, status:'soon' },
]

function CoursesSection() {
  return (
    <section id="courses" className="py-20" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <Reveal className="text-center mb-14" dir="rtl">
          <SectionLabel>📚 الدورات</SectionLabel>
          <SectionHeading>مسارات تعليمية منظمة</SectionHeading>
          <SectionSub>اختر مستواك وانطلق — كل مستوى يبني على ما قبله بشكل طبيعي</SectionSub>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSES_DATA.map((c, i) => (
            <Reveal key={c.cefr} delay={i * 60}>
              <div
                className="group relative flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  opacity: c.status === 'soon' ? 0.65 : 1,
                }}
              >
                {c.status === 'soon' && (
                  <span
                    className="absolute top-4 left-4 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}
                  >
                    قريباً
                  </span>
                )}

                {/* Icon + badge */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: c.colorSoft, border: `1px solid ${c.colorBorder}` }}
                  >
                    {c.emoji}
                  </div>
                  <div dir="rtl" className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: c.colorSoft, color: c.color, border: `1px solid ${c.colorBorder}` }}
                      >
                        {c.cefr !== 'BZ' ? c.cefr : 'BZ'}
                      </span>
                    </div>
                    <p className="font-semibold text-base" style={{ color: C.text, fontFamily: FONT_AR }}>{c.label}</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: C.muted, fontFamily: FONT_AR }} dir="rtl">
                  {c.desc}
                </p>

                <div className="flex items-center justify-between mt-auto pt-1" dir="rtl">
                  {c.units > 0 && (
                    <span className="text-xs" style={{ color: C.muted }}>{c.units} وحدة تعليمية</span>
                  )}
                  {c.status === 'open' ? (
                    <Link
                      href="/onboarding"
                      className="flex items-center gap-1.5 text-sm font-medium transition-colors px-3.5 py-2 rounded-lg"
                      style={{ color: c.color, background: c.colorSoft, border: `1px solid ${c.colorBorder}` }}
                    >
                      ابدأ التعلم
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="text-xs" style={{ color: '#94a3b8' }}>قريباً...</span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. LEARNING PATH
// ═══════════════════════════════════════════════════════════════════════════════

const PATH_STEPS = [
  {
    n: '١', icon: '🗺️', title: 'تبدأ من واد زم',
    desc: 'رحلتك تنطلق من مدينة واد زم — الوحدة الأولى في مستوى A0',
    color: C.greenText, colorSoft: C.greenSoft,
  },
  {
    n: '٢', icon: '📚', title: 'تتعلم المفردات',
    desc: '١٠ كلمات جديدة مع صوت لكل كلمة — اضغط واسمع النطق الصحيح',
    color: C.blue, colorSoft: C.blueSoft,
  },
  {
    n: '٣', icon: '✏️', title: 'جمل بسيطة وطبيعية',
    desc: 'تدريب على الجمل كما يستخدمها الناس في الحياة اليومية',
    color: C.greenText, colorSoft: C.greenSoft,
  },
  {
    n: '٤', icon: '💬', title: 'حوار تفاعلي',
    desc: 'محادثة كاملة بين شخصين — اضغط على كل جملة لتسمعها',
    color: C.blue, colorSoft: C.blueSoft,
  },
  {
    n: '٥', icon: '🎯', title: 'اختبارات متنوعة',
    desc: 'أكثر من ١٠ تمارين — اختيار متعدد، ترجمة، ترتيب الجمل',
    color: C.greenText, colorSoft: C.greenSoft,
  },
  {
    n: '٦', icon: '⚡', title: 'تقدم وإنجاز',
    desc: 'اكسب XP وافتح المدينة التالية — رحلة لا تتوقف',
    color: C.blue, colorSoft: C.blueSoft,
  },
]

function LearningPathSection() {
  return (
    <section id="path" className="py-20" style={{ background: C.bgSoft }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <Reveal className="text-center mb-14" dir="rtl">
          <SectionLabel variant="green">🗺️ مسار التعلم</SectionLabel>
          <SectionHeading>من الصفر إلى المحادثة — في ٦ خطوات</SectionHeading>
          <SectionSub>داخل كل وحدة تعليمية تجد هذا المسار المنظم الذي يأخذك خطوة بخطوة</SectionSub>
        </Reveal>

        {/* Desktop timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting line */}
          <div
            className="absolute top-8 right-[calc(8.33%-8px)] left-[calc(8.33%-8px)]"
            style={{ height: 2, background: C.border, zIndex: 0 }}
          />

          <div className="grid grid-cols-6 gap-4 relative z-10">
            {PATH_STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 80} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: '#fff', border: `2px solid ${step.color}30` }}
                >
                  {step.icon}
                </div>
                <div dir="rtl">
                  <p className="text-xs font-bold mb-1" style={{ color: step.color }}>{step.n}</p>
                  <p className="text-sm font-semibold mb-1" style={{ color: C.text, fontFamily: FONT_AR }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="lg:hidden flex flex-col gap-4">
          {PATH_STEPS.map((step, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: '#fff', border: `1px solid ${C.border}` }}
              >
                {/* Left: number + line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: step.colorSoft, border: `1px solid ${step.color}30` }}
                  >
                    {step.icon}
                  </div>
                  {i < PATH_STEPS.length - 1 && (
                    <div className="w-0.5 h-full mt-2" style={{ background: C.border, minHeight: 24 }} />
                  )}
                </div>
                <div dir="rtl" className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: step.colorSoft, color: step.color }}>{step.n}</span>
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{step.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400} className="text-center mt-10">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ color: C.blue, background: C.blueSoft, border: `1px solid #bfdbfe` }}
          >
            شاهد الخريطة الكاملة 🗺️
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. METHOD — HOW WE TEACH
// ═══════════════════════════════════════════════════════════════════════════════

const METHOD_ITEMS = [
  {
    icon: '🗣️',
    title: 'بدون قواعد نحو معقدة',
    desc: 'نركز على ما تقوله، لا على كيفية كتابته — طريقة الطفل الطبيعية لتعلم اللغة.',
    color: C.blue,
  },
  {
    icon: '🔊',
    title: 'الاستماع والنطق أولاً',
    desc: 'كل كلمة وكل جملة مصحوبة بصوت — اسمع الإنجليزية الصحيحة قبل أن تتكلم.',
    color: C.greenText,
  },
  {
    icon: '🔄',
    title: 'تكرار ذكي ومنظم',
    desc: 'كل يوم تراجع ما تعلمته بأسلوب مختلف — التكرار يثبّت اللغة في الذاكرة.',
    color: C.blue,
  },
  {
    icon: '📱',
    title: 'الاستخدام اليومي',
    desc: 'جلسة قصيرة كل يوم أفضل من ساعات في الأسبوع — ١٥ دقيقة يومياً تكفي.',
    color: C.greenText,
  },
]

function MethodSection() {
  return (
    <section className="py-20" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Text side */}
          <Reveal dir="rtl">
            <SectionLabel>🎓 كيف تتعلم معنا</SectionLabel>
            <SectionHeading>منهج مبني على كيف يتعلم الدماغ البشري</SectionHeading>
            <p className="text-base leading-relaxed mb-8" style={{ color: C.muted, fontFamily: FONT_AR }}>
              تعتمد طريقتنا على نتائج البحث العلمي في تعلم اللغات — الاستماع والتكرار والاستخدام الفعلي، لا الحفظ والقواعد.
            </p>

            <div className="flex flex-col gap-4">
              {METHOD_ITEMS.map((m, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: m.color + '12', border: `1px solid ${m.color}22` }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: C.text, fontFamily: FONT_AR }}>{m.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Visual panel */}
          <Reveal delay={150}>
            <div
              className="rounded-3xl overflow-hidden shadow-sm"
              style={{ border: `1px solid ${C.border}` }}
            >
              {/* Lesson phases mockup */}
              <div className="px-6 py-5" style={{ borderBottom: `1px solid ${C.border}`, background: C.bgSoft }}>
                <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>داخل درس واحد</p>
                <p className="text-sm font-bold" style={{ color: C.text }}>Greetings — واد زم</p>
              </div>

              <div className="bg-white">
                {[
                  { phase:'المفردات',         icon:'📚', done:true,  active:false, desc:'١٠ كلمات مع صوت' },
                  { phase:'الجمل البسيطة',    icon:'✏️', done:true,  active:false, desc:'١٠ جمل وترجمتها' },
                  { phase:'الجمل الطبيعية',   icon:'🗣️', done:false, active:true,  desc:'كيف يتكلم الناس' },
                  { phase:'الحوار',            icon:'💬', done:false, active:false, desc:'محادثة كاملة' },
                  { phase:'الاختبار',          icon:'🎯', done:false, active:false, desc:'١٣ تمريناً' },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4"
                    style={{
                      borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                      background: p.active ? C.blueSoft : '#fff',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{
                        background: p.done ? '#f0fdf4' : p.active ? '#eff6ff' : C.bgSoft,
                        border: `1px solid ${p.done ? '#bbf7d0' : p.active ? '#bfdbfe' : C.border}`,
                      }}
                    >
                      {p.done ? '✅' : p.icon}
                    </div>
                    <div dir="rtl" className="flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: p.active ? C.blueText : p.done ? '#6b7280' : C.text }}
                      >
                        {p.phase}
                      </p>
                      <p className="text-xs" style={{ color: C.muted }}>{p.desc}</p>
                    </div>
                    {p.active && (
                      <div
                        className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: C.blue, color: '#fff' }}
                      >
                        الآن
                      </div>
                    )}
                    {p.done && (
                      <div className="shrink-0 text-xs" style={{ color: '#86efac' }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. STUDENT EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════════

const EXP_FEATURES = [
  {
    icon: '⚡',
    title: 'نظام نقاط XP',
    desc: 'كل إجابة صحيحة = +١٠ نقطة. كل درس مكتمل = +٥٠. الارتقاء في المستويات من A0 إلى C1.',
    color: C.blue,
    colorSoft: C.blueSoft,
  },
  {
    icon: '🔥',
    title: 'السلسلة اليومية',
    desc: 'تعلّم كل يوم واحفظ سلسلتك. يوم واحد ينقطع يعيد العداد إلى الصفر — تحدٍّ حقيقي.',
    color: C.greenText,
    colorSoft: C.greenSoft,
  },
  {
    icon: '🗺️',
    title: 'خريطة الرحلة',
    desc: 'كل مدينة مغربية تمثل مستوى. أكمل المدينة وافتح التالية — مسار واضح لا يتشتت.',
    color: C.greenText,
    colorSoft: C.greenSoft,
  },
  {
    icon: '📊',
    title: 'تقدم مرئي',
    desc: 'شريط تقدم في كل مستوى، عدد الوحدات المكتملة، والمدن المفتوحة — كلها أمامك دائماً.',
    color: C.blue,
    colorSoft: C.blueSoft,
  },
]

function ExperienceSection() {
  return (
    <section className="py-20" style={{ background: C.bgSoft }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <Reveal className="text-center mb-14" dir="rtl">
          <SectionLabel variant="blue">🎮 تجربة الطالب</SectionLabel>
          <SectionHeading>نظام يجعلك تعود كل يوم</SectionHeading>
          <SectionSub>ليس مجرد دروس — بل تجربة تعليمية مصممة لتبقى ملتزماً حتى تصل</SectionSub>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {EXP_FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 70}>
              <div
                className="flex flex-col gap-3 p-5 rounded-2xl h-full transition-all duration-200 hover:-translate-y-1"
                style={{ background: '#fff', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: f.colorSoft, border: `1px solid ${f.color}25` }}
                >
                  {f.icon}
                </div>
                <div dir="rtl">
                  <p className="font-semibold text-sm mb-1.5" style={{ color: C.text, fontFamily: FONT_AR }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Map preview strip */}
        <Reveal delay={200}>
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ border: `1px solid ${C.border}`, background: '#fff' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}`, background: C.bgSoft }}>
              <div className="flex items-center justify-between" dir="rtl">
                <p className="text-sm font-semibold" style={{ color: C.text }}>خريطة الرحلة — المغرب 🇲🇦</p>
                <Link href="/map" className="text-xs font-medium" style={{ color: C.blue }}>شاهد الكاملة ←</Link>
              </div>
            </div>

            <div className="px-6 py-5 overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                {[
                  { name:'واد زم',    emoji:'🌱', cefr:'A0', done:true,    color:C.greenText },
                  { name:'خريبكة',    emoji:'❓', cefr:'A1', done:true,    color:C.blue },
                  { name:'بني ملال',  emoji:'⏰', cefr:'A1', done:false,   color:C.blue, current:true },
                  { name:'سطات',      emoji:'🍔', cefr:'A1', done:false,   color:C.blue },
                  { name:'الجديدة',   emoji:'🗺️', cefr:'A1', locked:true,  color:'#94a3b8' },
                  { name:'...',       emoji:'',   cefr:'',   locked:true,  color:'#94a3b8', more:true },
                ].map((city, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1.5 text-center" style={{ minWidth: 72 }}>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl relative"
                        style={{
                          background: city.done ? city.color + '18' : city.locked ? '#f1f5f9' : city.color + '12',
                          border: `2px solid ${city.done ? city.color : city.locked ? '#e2e8f0' : city.color + '60'}`,
                          boxShadow: city.current ? `0 0 0 4px ${city.color}22` : 'none',
                          opacity: city.locked ? 0.5 : 1,
                        }}
                      >
                        {city.more ? '…' : city.locked ? '🔒' : city.done ? '⭐' : city.emoji}
                      </div>
                      <p className="text-xs font-medium" style={{ color: city.locked ? '#94a3b8' : C.text }}>{city.name}</p>
                      {city.cefr && <span className="text-xs px-1.5 py-0.5 rounded-sm font-bold" style={{ background: city.color + '15', color: city.color, fontSize: 10 }}>{city.cefr}</span>}
                    </div>

                    {i < 5 && (
                      <div className="w-6 h-0.5 shrink-0" style={{ background: i < 2 ? C.green : C.border }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TRUST
// ═══════════════════════════════════════════════════════════════════════════════

const TESTIMONIALS = [
  {
    name: 'أحمد رضا',   flag: '🇲🇦', role: 'مهندس',  q: 'بعد شهر من الاستخدام اليومي صرت أفهم المحادثات الإنجليزية بشكل طبيعي. النظام مختلف عن أي طريقة جربتها قبل.',   stars: 5,
  },
  {
    name: 'سارة بنالي',  flag: '🇲🇦', role: 'طالبة',   q: 'أعجبني أن كل كلمة فيها صوت — ساعدني كثيراً على تحسين النطق. والرحلة عبر المدن فكرة ممتازة للتحفيز.',          stars: 5,
  },
  {
    name: 'محمد القاسم', flag: '🇩🇿', role: 'تاجر',    q: 'وصلت للمستوى A2 في أقل من شهرين. أنصح به كل شخص يريد تعلم الإنجليزية بطريقة علمية وليست مجرد حفظ.',         stars: 5,
  },
  {
    name: 'نور الهدى',   flag: '🇲🇦', role: 'موظفة',   q: 'النظام يجعلك تتقدم بشكل تلقائي — ما تشعرش بالملل. وسلسلة الأيام المتتالية دفعتني للمواظبة يومياً.',           stars: 5,
  },
]

const TRUST_STATS = [
  { value: '+١٠٠٠', label: 'طالب نشط', icon: '👩‍🎓' },
  { value: '٩٧٪',   label: 'معدل الرضا', icon: '⭐' },
  { value: '٤.٩',   label: 'تقييم عام', icon: '🏅' },
  { value: '١٥+',   label: 'مدينة في الرحلة', icon: '🗺️' },
]

function TrustSection() {
  return (
    <section className="py-20" style={{ background: '#fff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <Reveal className="text-center mb-14" dir="rtl">
          <SectionLabel variant="green">💬 آراء الطلاب</SectionLabel>
          <SectionHeading>نتائج حقيقية من طلاب حقيقيين</SectionHeading>
        </Reveal>

        {/* Stats strip */}
        <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {TRUST_STATS.map((s, i) => (
            <div
              key={i}
              className="text-center py-6 px-4 rounded-2xl"
              style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}
            >
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-2xl font-bold mb-1" style={{ color: C.text, fontFamily: FONT_AR }}>{s.value}</p>
              <p className="text-sm" style={{ color: C.muted }}>{s.label}</p>
            </div>
          ))}
        </Reveal>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="flex flex-col gap-4 p-6 rounded-2xl h-full"
                style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, j) => (
                    <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                  ))}
                </div>

                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: C.text, fontFamily: FONT_AR }}
                  dir="rtl"
                >
                  &ldquo;{t.q}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-sm shrink-0"
                    style={{ background: i % 2 === 0 ? C.blue : C.greenText }}
                  >
                    {t.name[0]}
                  </div>
                  <div dir="rtl">
                    <p className="text-sm font-semibold" style={{ color: C.text }}>{t.flag} {t.name}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. FINAL CTA
// ═══════════════════════════════════════════════════════════════════════════════

function FinalCTA() {
  return (
    <section className="py-24" style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Reveal dir="rtl">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{ background: '#eff6ff', color: C.blueText, border: '1px solid #bfdbfe' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
            مفتوح الآن — ابدأ مجاناً
          </div>

          <h2
            className="text-3xl sm:text-4xl font-bold mb-5 leading-tight"
            style={{ color: C.text, fontFamily: FONT_AR }}
          >
            ابدأ رحلتك اليوم
          </h2>

          <p
            className="text-base leading-relaxed mb-10 max-w-md mx-auto"
            style={{ color: C.muted, fontFamily: FONT_AR }}
          >
            انضم لأكثر من ١٠٠٠ طالب يتعلمون الإنجليزية بطريقة مختلفة — منظمة، عملية، وممتعة.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: C.blue, boxShadow: '0 4px 20px rgba(37,99,235,0.3)', fontFamily: FONT_AR }}
            >
              ابدأ الآن — مجاناً
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: C.greenText, boxShadow: '0 4px 16px rgba(22,163,74,0.2)', fontFamily: FONT_AR }}
            >
              <WAIcon size={16} />
              تواصل عبر واتساب
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-xs" style={{ color: C.muted }}>
            {['✓ لا يلزم بطاقة بنكية', '✓ ابدأ مجاناً', '✓ يعمل على الموبايل', '✓ دعم كامل بالعربية'].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  return (
    <main className="overflow-x-hidden" dir="rtl" style={{ background: '#fff' }}>
      <HeroSection />
      <Divider />
      <CoursesSection />
      <Divider />
      <LearningPathSection />
      <Divider />
      <MethodSection />
      <Divider />
      <ExperienceSection />
      <Divider />
      <TrustSection />
      <FinalCTA />
    </main>
  )
}
