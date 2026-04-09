'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const F = "'Cairo', sans-serif"

const C = {
  blue:        '#2563eb',
  blueSoft:    '#eff6ff',
  blueBorder:  '#bfdbfe',
  blueText:    '#1d4ed8',
  green:       '#22c55e',
  greenSoft:   '#f0fdf4',
  greenBorder: '#bbf7d0',
  greenText:   '#16a34a',
  bg:          '#ffffff',
  bgSoft:      '#f8fafc',
  border:      '#e2e8f0',
  text:        '#1e293b',
  muted:       '#64748b',
}

const WA = 'https://wa.me/212707902091?text=' +
  encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')

// ─── Scroll-reveal wrapper ───────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className = '', dir, style = {},
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  dir?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} dir={dir}
      style={{ ...style, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(22px)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Section chip ────────────────────────────────────────────────────────────
function Chip({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'green' }) {
  const col   = variant === 'green' ? C.greenText   : C.blueText
  const soft  = variant === 'green' ? C.greenSoft   : C.blueSoft
  const bord  = variant === 'green' ? C.greenBorder : C.blueBorder
  return (
    <span style={{ display: 'inline-block', fontFamily: F, fontSize: 12, fontWeight: 600, color: col, background: soft, border: `1px solid ${bord}`, borderRadius: 999, padding: '6px 18px', marginBottom: 16 }}>
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════════

const SLIDES = [
  {
    tag:  '🎯 مفتوح الآن — ابدأ مجاناً',
    h1a: 'تعلم الإنجليزية',
    h1b: 'بالمحادثة خطوة بخطوة',
    sub:  'منهج عملي بدون قواعد معقدة — من الصفر إلى الاحتراف عبر رحلة تفاعلية',
    accent: C.blue,
  },
  {
    tag:  '🗺️ خريطة تفاعلية كاملة',
    h1a: 'رحلة ممتعة عبر',
    h1b: 'مدن المغرب الجميلة',
    sub:  'كل مدينة = مستوى جديد — تقدم حقيقي وإنجازات تحفّزك على الاستمرار يومياً',
    accent: C.greenText,
  },
  {
    tag:  '⚡ نقاط XP + سلسلة يومية',
    h1a: 'نظام مكافآت',
    h1b: 'يجعل التعلم ممتعاً',
    sub:  'اكسب نقاط XP، افتح مدناً جديدة، وحافظ على سلسلتك اليومية كل يوم',
    accent: C.blue,
  },
]

function AppMockup() {
  const [xp, setXp] = useState(0)
  useEffect(() => { const t = setTimeout(() => setXp(68), 700); return () => clearTimeout(t) }, [])

  return (
    <div style={{ position: 'relative', width: 300, margin: '0 auto' }}>

      {/* Floating: XP badge */}
      <div className="float-1" style={{ position: 'absolute', zIndex: 10, top: -20, right: -14, background: '#fff', borderRadius: 12, padding: '7px 13px', boxShadow: '0 4px 20px rgba(37,99,235,0.18)', border: `1.5px solid ${C.blueBorder}`, fontFamily: F, fontSize: 13, fontWeight: 700, color: C.blue, display: 'flex', alignItems: 'center', gap: 5 }}>
        ⚡ +50 XP
      </div>

      {/* Floating: chat bubble */}
      <div className="float-2" style={{ position: 'absolute', zIndex: 10, top: 88, left: -28, background: C.blue, borderRadius: '14px 14px 4px 14px', padding: '9px 13px', color: '#fff', fontFamily: F, fontSize: 12, fontWeight: 600, boxShadow: '0 4px 16px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}>
        Good morning! ☀️
      </div>

      {/* Floating: streak badge */}
      <div className="float-3" style={{ position: 'absolute', zIndex: 10, bottom: 48, right: -22, background: C.greenSoft, borderRadius: 12, padding: '7px 12px', fontFamily: F, fontSize: 13, fontWeight: 700, color: C.greenText, border: `1.5px solid ${C.greenBorder}`, boxShadow: '0 4px 14px rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', gap: 5 }}>
        🔥 14 يوم
      </div>

      {/* App card */}
      <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>

        {/* Header bar */}
        <div style={{ background: C.blue, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, direction: 'rtl' }}>
            <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>واد زم — A0</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '3px 9px', fontSize: 12, fontWeight: 700, fontFamily: F, color: '#fff' }}>🔥 14</span>
              <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '3px 9px', fontSize: 12, fontWeight: 700, fontFamily: F, color: '#fff' }}>⚡ 640</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, height: 7, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: C.green, borderRadius: 6, width: `${xp}%`, transition: 'width 1.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        </div>

        {/* Vocab list */}
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontFamily: F, fontSize: 11, color: C.muted, marginBottom: 10, direction: 'rtl' }}>المفردات الجديدة</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { en: 'Hello',        ar: 'مرحبا',        state: 'done'   },
              { en: 'Good morning', ar: 'صباح الخير',   state: 'done'   },
              { en: 'How are you?', ar: 'كيف حالك؟',   state: 'active' },
              { en: 'My name is…',  ar: 'اسمي…',        state: 'locked' },
            ].map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 10, background: w.state === 'active' ? C.blueSoft : w.state === 'done' ? C.greenSoft : C.bgSoft, border: `1px solid ${w.state === 'active' ? C.blueBorder : w.state === 'done' ? C.greenBorder : C.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', background: w.state === 'done' ? C.greenText : w.state === 'active' ? C.blue : '#cbd5e1', flexShrink: 0 }}>
                  {w.state === 'done' ? '✓' : w.state === 'active' ? '🔊' : '🔒'}
                </div>
                <div style={{ flex: 1 }} dir="rtl">
                  <p style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: w.state === 'locked' ? '#94a3b8' : C.text, margin: 0 }}>{w.en}</p>
                  <p style={{ fontFamily: F, fontSize: 11, color: C.muted, margin: 0 }}>{w.ar}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '11px', background: C.blue, borderRadius: 12, textAlign: 'center', color: '#fff', fontFamily: F, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            استمر ▶
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)

  function goTo(i: number) {
    if (i === slide) return
    setFading(true)
    setTimeout(() => { setSlide(i); setFading(false) }, 260)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setFading(false) }, 260)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const s = SLIDES[slide]

  return (
    <section style={{ background: `linear-gradient(150deg, ${C.blueSoft} 0%, #fff 55%, ${C.greenSoft} 100%)`, paddingTop: 80, minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Animated background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="hero-blob-1" style={{ position: 'absolute', top: '5%', right: '-2%', width: 520, height: 520, background: `${C.blue}09`, borderRadius: '50%', filter: 'blur(90px)' }} />
        <div className="hero-blob-2" style={{ position: 'absolute', bottom: '0%', left: '-2%', width: 420, height: 420, background: `${C.green}0b`, borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-16" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text column */}
          <div dir="rtl" style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)', transition: 'all 0.26s ease' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="dot-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, flexShrink: 0, display: 'inline-block' }} />
              {s.tag}
            </div>

            <h1 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', color: C.text, lineHeight: 1.22, marginBottom: 18 }}>
              {s.h1a}<br />
              <span style={{ color: s.accent }}>{s.h1b}</span>
            </h1>

            <p style={{ fontFamily: F, fontSize: 16, color: C.muted, lineHeight: 1.85, marginBottom: 32, maxWidth: 480, fontWeight: 400 }}>
              {s.sub}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/onboarding" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: C.blue, color: '#fff', borderRadius: 14, fontFamily: F, fontWeight: 600, fontSize: 15, boxShadow: '0 6px 20px rgba(37,99,235,0.28)' }}>
                ابدأ الآن مجاناً 🚀
              </Link>
              <Link href="#how" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: '#fff', color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 14, fontFamily: F, fontWeight: 600, fontSize: 15 }}>
                شاهد كيف يعمل
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['+١٠٠٠ طالب', 'نتائج حقيقية', 'تقدم سريع'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: F, fontSize: 13, color: C.muted }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Mockup column */}
          <div style={{ display: 'flex', justifyContent: 'center', opacity: fading ? 0.5 : 1, transition: 'opacity 0.26s ease' }}>
            <AppMockup />
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 44 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, background: i === slide ? C.blue : C.border, border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. COURSES
// ═══════════════════════════════════════════════════════════════════════════════

interface Course {
  cefr: string; ar: string; emoji: string; color: string; soft: string
  border: string; desc: string; soon?: boolean
}

const COURSES: Course[] = [
  { cefr:'A0', ar:'البداية',       emoji:'🌱', color:C.greenText, soft:C.greenSoft,  border:C.greenBorder, desc:'التحيات والتعارف والعبارات الأولى' },
  { cefr:'A1', ar:'المبتدئ',       emoji:'📖', color:C.blue,      soft:C.blueSoft,   border:C.blueBorder,  desc:'الأسئلة والأرقام والوقت والروتين اليومي' },
  { cefr:'A2', ar:'الأساسي',       emoji:'💬', color:C.blue,      soft:C.blueSoft,   border:C.blueBorder,  desc:'المحادثة اليومية والسفر والعمل والصحة' },
  { cefr:'B1', ar:'المتوسط',       emoji:'🚀', color:C.blue,      soft:C.blueSoft,   border:C.blueBorder,  desc:'التعبير عن الرأي والمواقف المعقدة' },
  { cefr:'B2', ar:'فوق المتوسط',  emoji:'⭐', color:'#94a3b8',   soft:C.bgSoft,     border:C.border,      desc:'طلاقة حقيقية وأسلوب طبيعي',                  soon:true },
  { cefr:'C1', ar:'المتقدم',       emoji:'🏆', color:'#94a3b8',   soft:C.bgSoft,     border:C.border,      desc:'الاحتراف الكامل كالناطقين الأصليين',           soon:true },
  { cefr:'BZ', ar:'Business Eng.', emoji:'💼', color:'#94a3b8',   soft:C.bgSoft,     border:C.border,      desc:'الإنجليزية في بيئة الأعمال والمقابلات',        soon:true },
]

function CourseCard({ c }: { c: Course }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: '#fff', borderRadius: 20, padding: '22px 20px', border: `1px solid ${hov && !c.soon ? c.border : C.border}`, boxShadow: hov && !c.soon ? '0 8px 32px rgba(37,99,235,0.11)' : '0 1px 4px rgba(0,0,0,0.04)', transform: hov && !c.soon ? 'translateY(-5px)' : 'none', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', opacity: c.soon ? 0.6 : 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {c.soon && (
        <span style={{ position: 'absolute', top: 14, left: 14, background: C.bgSoft, color: C.muted, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: F }}>
          قريباً
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, direction: 'rtl' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: c.soft, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {c.emoji}
        </div>
        <div>
          <span style={{ display: 'inline-block', background: c.soft, color: c.color, border: `1px solid ${c.border}`, borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 700, fontFamily: F, marginBottom: 3 }}>{c.cefr}</span>
          <p style={{ fontFamily: F, fontWeight: 600, fontSize: 15, color: C.text, margin: 0 }}>{c.ar}</p>
        </div>
      </div>
      <p style={{ fontFamily: F, fontSize: 13, color: C.muted, lineHeight: 1.7, direction: 'rtl', flex: 1, marginBottom: 16 }}>{c.desc}</p>
      {!c.soon && (
        <Link href="/onboarding" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: hov ? c.color : c.soft, color: hov ? '#fff' : c.color, border: `1px solid ${c.border}`, borderRadius: 12, fontFamily: F, fontWeight: 600, fontSize: 13, transition: 'all 0.25s ease' }}>
          ابدأ التعلم
        </Link>
      )}
    </div>
  )
}

function CoursesSection() {
  return (
    <section id="courses" style={{ background: '#fff', padding: '96px 0' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip>📚 المسارات التعليمية</Chip>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(1.7rem,3vw,2.4rem)', color: C.text, marginBottom: 12 }}>اختر مستواك وانطلق</h2>
          <p style={{ fontFamily: F, fontSize: 15, color: C.muted, maxWidth: 480, margin: '0 auto', fontWeight: 400 }}>من الصفر حتى الاحتراف — كل مستوى يبني على ما سبقه بطريقة طبيعية ومنظمة</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
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
// 3. ABOUT — لماذا Inglizi
// ═══════════════════════════════════════════════════════════════════════════════

const WHY = [
  { icon: '🗣️', title: 'تعلم بالمحادثة',     desc: 'بدون قواعد معقدة — الطريقة الطبيعية التي يتعلم بها الأطفال',             variant: 'blue'  as const },
  { icon: '🎮', title: 'نظام تفاعلي',         desc: 'XP ومكافآت وسلسلة يومية تجعلك تعود كل يوم تلقائياً بشوق حقيقي',         variant: 'green' as const },
  { icon: '🗺️', title: 'تقدم خطوة بخطوة',    desc: 'مسار واضح من A0 إلى C1 — تعرف دائماً أين أنت وإلى أين تتجه',           variant: 'blue'  as const },
]

function AboutSection() {
  return (
    <section style={{ background: C.bgSoft, padding: '96px 0' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip variant="green">✨ لماذا Inglizi؟</Chip>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(1.7rem,3vw,2.4rem)', color: C.text, marginBottom: 12 }}>مختلف عن كل ما جربته</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {WHY.map((w, i) => {
            const col  = w.variant === 'green' ? C.greenText   : C.blue
            const soft = w.variant === 'green' ? C.greenSoft   : C.blueSoft
            const brd  = w.variant === 'green' ? C.greenBorder : C.blueBorder
            return (
              <Reveal key={i} delay={i * 100}>
                <div style={{ background: '#fff', borderRadius: 22, padding: '36px 28px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                  <div style={{ width: 68, height: 68, borderRadius: 22, background: soft, border: `1px solid ${brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 18px' }}>
                    {w.icon}
                  </div>
                  <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 8 }}>{w.title}</h3>
                  <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.8, fontWeight: 400 }}>{w.desc}</p>
                  <div style={{ width: 36, height: 3, background: col, borderRadius: 2, margin: '18px auto 0' }} />
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MAP SYSTEM — Game path
// ═══════════════════════════════════════════════════════════════════════════════

interface MapCity { name: string; cefr: string; emoji: string; done?: boolean; current?: boolean; locked?: boolean }

const MAP_CITIES: MapCity[] = [
  { name: 'واد زم',         cefr: 'A0', emoji: '🌱', done:    true  },
  { name: 'خريبكة',          cefr: 'A1', emoji: '📖', done:    true  },
  { name: 'الدار البيضاء',  cefr: 'A1', emoji: '💬', current: true  },
  { name: 'مراكش',           cefr: 'A2', emoji: '🚀', locked:  true  },
  { name: 'الرباط',           cefr: 'A2', emoji: '⭐', locked:  true  },
  { name: 'فاس',              cefr: 'B1', emoji: '🏆', locked:  true  },
]

function MapSection() {
  return (
    <section id="map" style={{ background: '#fff', padding: '96px 0', overflow: 'hidden' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip>🗺️ خريطة الرحلة</Chip>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(1.7rem,3vw,2.4rem)', color: C.text, marginBottom: 12 }}>تعلم عبر خريطة تفاعلية</h2>
          <p style={{ fontFamily: F, fontSize: 15, color: C.muted, maxWidth: 460, margin: '0 auto', fontWeight: 400 }}>كل مدينة تمثل مستوى جديداً — أكمل الوحدات وافتح المدن التالية في رحلتك</p>
        </Reveal>

        {/* Game path */}
        <Reveal delay={100}>
          <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 'max-content', padding: '48px 32px', direction: 'ltr' }}>
              {MAP_CITIES.map((city, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>

                  {/* Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div
                      className={city.current ? 'node-pulse' : ''}
                      style={{ width: city.current ? 76 : 64, height: city.current ? 76 : 64, borderRadius: '50%', background: city.done ? C.greenText : city.current ? C.blue : '#e2e8f0', border: `3px solid ${city.done ? C.greenText : city.current ? C.blue : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: city.current ? 30 : 24, color: city.locked ? '#94a3b8' : '#fff', boxShadow: city.done ? '0 4px 16px rgba(22,163,74,0.3)' : 'none', transition: 'all 0.3s ease' }}
                    >
                      {city.locked ? '🔒' : city.done ? '⭐' : city.emoji}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <p style={{ fontFamily: F, fontSize: 12, fontWeight: city.current ? 700 : 500, color: city.locked ? '#94a3b8' : C.text, margin: '0 0 4px', whiteSpace: 'nowrap' }}>
                        {city.name}
                      </p>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F, background: city.done ? C.greenSoft : city.current ? C.blueSoft : C.bgSoft, color: city.done ? C.greenText : city.current ? C.blue : '#94a3b8', border: `1px solid ${city.done ? C.greenBorder : city.current ? C.blueBorder : C.border}` }}>
                        {city.cefr}
                      </span>
                    </div>
                  </div>

                  {/* Connector line */}
                  {i < MAP_CITIES.length - 1 && (
                    <div style={{ width: 52, height: 4, borderRadius: 2, marginBottom: 36, background: i < 1 ? C.greenText : i === 1 ? C.blue : C.border }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={250} className="text-center mt-2">
          <Link href="/map" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: C.blue, color: '#fff', borderRadius: 14, fontFamily: F, fontWeight: 600, fontSize: 15, boxShadow: '0 6px 20px rgba(37,99,235,0.25)' }}>
            ابدأ الرحلة 🗺️
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { n: '١', icon: '🔊', title: 'كلمات مع صوت',  desc: '١٠ مفردات جديدة — اضغط واسمع النطق الصحيح مباشرة',  variant: 'blue'  as const },
  { n: '٢', icon: '✏️', title: 'جمل تفاعلية',   desc: 'جمل حقيقية كما يستخدمها الناطقون في حياتهم اليومية', variant: 'green' as const },
  { n: '٣', icon: '💬', title: 'محادثة كاملة',  desc: 'حوار بين شخصين — استمع وتدرب على الرد الطبيعي',       variant: 'blue'  as const },
  { n: '٤', icon: '🎯', title: 'اختبار متنوع',  desc: 'أكثر من ١٠ تمارين — اختيار متعدد وترجمة وترتيب',      variant: 'green' as const },
]

function HowItWorksSection() {
  return (
    <section id="how" style={{ background: C.bgSoft, padding: '96px 0' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip variant="green">⚡ كيف يعمل</Chip>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(1.7rem,3vw,2.4rem)', color: C.text, marginBottom: 12 }}>داخل كل درس — ٤ خطوات فقط</h2>
          <p style={{ fontFamily: F, fontSize: 15, color: C.muted, fontWeight: 400 }}>منهج واضح يأخذك من الكلمة إلى المحادثة الكاملة في درس واحد</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {STEPS.map((s, i) => {
            const col  = s.variant === 'green' ? C.greenText   : C.blue
            const soft = s.variant === 'green' ? C.greenSoft   : C.blueSoft
            const brd  = s.variant === 'green' ? C.greenBorder : C.blueBorder
            return (
              <Reveal key={i} delay={i * 80}>
                <div style={{ background: '#fff', borderRadius: 20, padding: '28px 22px', border: `1px solid ${C.border}`, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', height: '100%' }}>
                  <div style={{ width: 58, height: 58, borderRadius: 18, background: soft, border: `1px solid ${brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                    {s.icon}
                  </div>
                  <p style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: col, marginBottom: 6, letterSpacing: '0.02em' }}>الخطوة {s.n}</p>
                  <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: F, fontSize: 13, color: C.muted, lineHeight: 1.75, fontWeight: 400 }}>{s.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TOOLS / FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

interface Tool { icon: string; title: string; desc: string; variant: 'blue' | 'green' }

const TOOLS: Tool[] = [
  { icon: '🎧', title: 'الاستماع',       desc: 'كل كلمة وجملة مصحوبة بصوت — اسمع الإنجليزية الصحيحة',            variant: 'blue'  },
  { icon: '📊', title: 'تتبع التقدم',    desc: 'شريط XP، مدن مفتوحة، وسلسلة يومية — تقدمك أمامك دائماً',           variant: 'green' },
  { icon: '🎯', title: 'اختبارات ذكية', desc: 'تمارين متنوعة تختبر ما تعلمته وتثبّته في الذاكرة طويلة المدى',      variant: 'blue'  },
]

function ToolCard({ t }: { t: Tool }) {
  const [hov, setHov] = useState(false)
  const col  = t.variant === 'green' ? C.greenText   : C.blue
  const soft = t.variant === 'green' ? C.greenSoft   : C.blueSoft
  const brd  = t.variant === 'green' ? C.greenBorder : C.blueBorder
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? soft : '#fff', borderRadius: 22, padding: '32px 26px', border: `1px solid ${hov ? brd : C.border}`, boxShadow: hov ? '0 8px 32px rgba(37,99,235,0.1)' : '0 2px 8px rgba(0,0,0,0.04)', transform: hov ? 'translateY(-5px)' : 'none', transition: 'all 0.25s ease', textAlign: 'center' }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 20, background: soft, border: `1px solid ${brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 18px' }}>
        {t.icon}
      </div>
      <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 10 }}>{t.title}</h3>
      <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.8, fontWeight: 400 }}>{t.desc}</p>
      <div style={{ width: 32, height: 3, borderRadius: 2, background: col, margin: '16px auto 0', opacity: hov ? 1 : 0, transition: 'opacity 0.25s' }} />
    </div>
  )
}

function ToolsSection() {
  return (
    <section style={{ background: '#fff', padding: '96px 0' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14" dir="rtl">
          <Chip>🛠️ المميزات</Chip>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(1.7rem,3vw,2.4rem)', color: C.text, marginBottom: 12 }}>كل ما تحتاجه في مكان واحد</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {TOOLS.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <ToolCard t={t} />
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
    <section style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueText} 100%)`, padding: '96px 0' }}>
      <Reveal className="max-w-2xl mx-auto px-4 text-center" dir="rtl">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: F, marginBottom: 24 }}>
          <span className="dot-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
          مفتوح الآن — بدون تسجيل
        </div>

        <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: 'clamp(2rem,4vw,2.8rem)', color: '#fff', marginBottom: 16, lineHeight: 1.25 }}>
          ابدأ رحلتك اليوم
        </h2>

        <p style={{ fontFamily: F, fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.85, marginBottom: 36, maxWidth: 400, margin: '0 auto 36px', fontWeight: 400 }}>
          انضم لأكثر من ١٠٠٠ طالب يتعلمون الإنجليزية بطريقة مختلفة — منظمة، عملية، وممتعة
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <Link href="/onboarding" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', background: '#fff', color: C.blue, borderRadius: 14, fontFamily: F, fontWeight: 700, fontSize: 16, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            ابدأ الآن مجاناً 🚀
          </Link>
          <a href={WA} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', background: C.greenText, color: '#fff', borderRadius: 14, fontFamily: F, fontWeight: 600, fontSize: 15, boxShadow: '0 6px 20px rgba(22,163,74,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            واتساب
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {['✓ بدون بطاقة بنكية', '✓ ابدأ مجاناً', '✓ يعمل على الموبايل', '✓ دعم بالعربية'].map((t, i) => (
            <span key={i} style={{ fontFamily: F, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{t}</span>
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
    <main style={{ background: '#fff', overflowX: 'hidden' }} dir="rtl">
      <HeroSection />
      <CoursesSection />
      <AboutSection />
      <MapSection />
      <HowItWorksSection />
      <ToolsSection />
      <FinalCTA />
    </main>
  )
}
