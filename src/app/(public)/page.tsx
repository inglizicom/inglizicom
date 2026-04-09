'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const FONT = "'Cairo', sans-serif"
const GREEN  = '#22c55e'
const BLUE   = '#2563eb'
const DARK   = '#0f172a'
const MUTED  = '#64748b'
const SOFT   = '#f8fafc'

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const SLIDES = [
  { emoji: '👩‍💻', bg: '#f0fdf4', accent: GREEN,  title: 'تعلم الإنجليزية بالمحادثة', tag: 'تعلم في أي وقت' },
  { emoji: '🎙️', bg: '#eff6ff', accent: BLUE,   title: 'تحدث بثقة من اليوم الأول',  tag: 'تحدث من أول يوم' },
  { emoji: '📱', bg: '#fefce8', accent: '#f59e0b', title: 'دروس قصيرة وفعالة كل يوم', tag: 'دروس قصيرة وفعالة' },
]

const WHY = [
  { icon: '💬', title: 'تعلم بالمحادثة',  desc: 'كلام حقيقي من أول درس، بدون حفظ' },
  { icon: '🚀', title: 'تقدم سريع',        desc: 'منهج مُصمَّم لنتائج في أسابيع' },
  { icon: '🔊', title: 'صوت ونطق',         desc: 'تمارين صوتية مع كل درس' },
  { icon: '🎯', title: 'نتائج حقيقية',     desc: '+1200 طالب أتموا الدورات' },
]

const COURSES = [
  { level: 'A0', title: 'المبتدئ المطلق',  desc: 'لمن يبدأ من الصفر',            dur: '3 أسابيع', price: '99 درهم',  open: true  },
  { level: 'A1', title: 'الأساسيات',       desc: 'الجمل الأولى والتعارف',        dur: '4 أسابيع', price: '149 درهم', open: true  },
  { level: 'A2', title: 'المحادثة اليومية',desc: 'التعبير في المواقف اليومية',   dur: '5 أسابيع', price: '149 درهم', open: true  },
  { level: 'B1', title: 'المتوسط',         desc: 'التعبير عن الأفكار والمواقف',  dur: '6 أسابيع', price: '199 درهم', open: true  },
  { level: 'B2', title: 'فوق المتوسط',     desc: 'النقاش والفهم المعمّق',        dur: '7 أسابيع', price: '249 درهم', open: false },
  { level: 'C1', title: 'الاحتراف',        desc: 'الطلاقة الكاملة في كل المجالات',dur: '8 أسابيع', price: '299 درهم', open: false },
]

const MAP_NODES = [
  { city: 'وادي زم',      level: 'A0', state: 'done'    as const },
  { city: 'خريبكة',       level: 'A1', state: 'done'    as const },
  { city: 'الدار البيضاء',level: 'B1', state: 'current' as const },
  { city: 'مراكش',        level: 'C1', state: 'locked'  as const },
]

/* ─────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────── */
function useInView(ref: React.RefObject<Element | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

/* ─────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────── */
function PrimaryBtn({ href, children, big = false }: { href: string; children: React.ReactNode; big?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: GREEN, color: '#fff',
        padding: big ? '16px 48px' : '13px 32px',
        borderRadius: 14, fontSize: big ? '1.05rem' : '0.95rem',
        fontWeight: 700, textDecoration: 'none', fontFamily: FONT,
        boxShadow: '0 4px 20px rgba(34,197,94,.35)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px) scale(1.03)'
        el.style.boxShadow = '0 8px 28px rgba(34,197,94,.45)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'none'
        el.style.boxShadow = '0 4px 20px rgba(34,197,94,.35)'
      }}
    >
      {children}
    </Link>
  )
}

function OutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', color: '#16a34a',
        border: '2px solid #22c55e',
        padding: '11px 28px', borderRadius: 14,
        fontSize: '0.95rem', fontWeight: 700,
        textDecoration: 'none', fontFamily: FONT,
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#f0fdf4'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#fff'
        el.style.transform = 'none'
      }}
    >
      {children}
    </Link>
  )
}

function SectionTitle({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{
      fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
      fontWeight: 800, color: DARK, fontFamily: FONT,
      textAlign: center ? 'center' : 'right',
      lineHeight: 1.25, marginBottom: 12,
    }}>
      {children}
    </h2>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 1 — HERO
───────────────────────────────────────────────────────── */
function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const fadeStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(24px)',
    transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
  })

  return (
    <section style={{ background: '#fff', padding: '96px 24px 72px', overflow: 'hidden' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        gap: 56, flexWrap: 'wrap',
      }}>

        {/* ── Text side ── */}
        <div style={{ flex: '1 1 340px', textAlign: 'right' }} dir="rtl">
          <div style={{ ...fadeStyle(0), marginBottom: 20 }}>
            <span style={{
              display: 'inline-block',
              background: '#dcfce7', color: '#16a34a',
              fontSize: '0.8rem', fontWeight: 700,
              padding: '5px 14px', borderRadius: 99,
              fontFamily: FONT, letterSpacing: '0.03em',
            }}>
              🎉 أكثر من 1200 طالب بدأوا معنا
            </span>
          </div>

          <h1 style={{
            ...fadeStyle(0.1),
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900, lineHeight: 1.2,
            color: DARK, fontFamily: FONT, marginBottom: 18,
          }}>
            تعلم الإنجليزية<br />
            <span style={{ color: GREEN }}>بالمحادثة</span>
          </h1>

          <p style={{
            ...fadeStyle(0.2),
            fontSize: '1.1rem', color: MUTED,
            fontWeight: 400, lineHeight: 1.8,
            marginBottom: 36, fontFamily: FONT,
          }}>
            بدون قواعد مملة — فقط تطبيق عملي يومي<br />
            من الصفر حتى الطلاقة الكاملة
          </p>

          <div style={{ ...fadeStyle(0.3), display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <PrimaryBtn href="/courses">ابدأ الآن</PrimaryBtn>
            <OutlineBtn href="/map">شاهد كيف يعمل</OutlineBtn>
          </div>

          {/* trust row */}
          <div style={{
            ...fadeStyle(0.4),
            display: 'flex', alignItems: 'center', gap: 20,
            marginTop: 40, flexWrap: 'wrap',
          }}>
            {[
              { n: '1,200+', l: 'طالب' },
              { n: '97%',    l: 'رضا' },
              { n: 'A0→C1', l: 'المستويات' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: DARK, fontFamily: FONT }}>{s.n}</div>
                <div style={{ fontSize: '0.78rem', color: MUTED, fontFamily: FONT }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Visual side ── */}
        <div style={{
          flex: '1 1 300px',
          position: 'relative', minHeight: 360,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* main blob */}
          <div style={{
            width: 320, height: 320,
            background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
            borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8rem',
            animation: 'float-a 4s ease-in-out infinite',
          }}
          className="float-1"
          >
            👩‍💻
          </div>

          {/* floating badges */}
          <div className="float-2" style={{
            position: 'absolute', top: 24, right: 0,
            background: '#fff', borderRadius: 14,
            padding: '10px 16px', boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: FONT,
          }}>
            <span style={{ fontSize: '1.3rem' }}>💬</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: DARK }}>محادثة حقيقية</div>
              <div style={{ fontSize: '0.68rem', color: MUTED }}>من أول درس</div>
            </div>
          </div>

          <div className="float-3" style={{
            position: 'absolute', bottom: 40, left: 0,
            background: '#fff', borderRadius: 14,
            padding: '10px 16px', boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: FONT,
          }}>
            <span style={{ fontSize: '1.3rem' }}>🔊</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: DARK }}>نطق صحيح</div>
              <div style={{ fontSize: '0.68rem', color: MUTED }}>صوت + تكرار</div>
            </div>
          </div>

          <div className="float-1" style={{
            position: 'absolute', bottom: 10, right: 24,
            background: BLUE, borderRadius: 12,
            padding: '8px 14px',
            fontFamily: FONT,
            boxShadow: '0 4px 16px rgba(37,99,235,.35)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>📱 تعلم في أي مكان</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 2 — SLIDER
───────────────────────────────────────────────────────── */
function SliderSection() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  const go = (next: number) => {
    setFading(true)
    setTimeout(() => { setIdx(next); setFading(false) }, 320)
  }

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const s = SLIDES[idx]

  return (
    <section style={{ background: SOFT, padding: '72px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionTitle>لماذا يختارنا الطلاب؟</SectionTitle>
        <p style={{ textAlign: 'center', color: MUTED, marginBottom: 48, fontFamily: FONT }}>
          آلاف الطلاب يتعلمون كل يوم
        </p>

        <div
          style={{
            background: s.bg,
            borderRadius: 28,
            padding: '56px 40px',
            textAlign: 'center',
            transition: 'background 0.5s ease',
            boxShadow: '0 4px 32px rgba(0,0,0,0.05)',
            minHeight: 280,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 20,
          }}
        >
          <div style={{
            fontSize: '5rem', lineHeight: 1,
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(0.85)' : 'scale(1)',
            transition: 'opacity 0.32s, transform 0.32s',
          }}>
            {s.emoji}
          </div>
          <div style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(12px)' : 'none',
            transition: 'opacity 0.32s 0.04s, transform 0.32s 0.04s',
          }}>
            <div style={{
              display: 'inline-block',
              background: s.accent, color: '#fff',
              fontSize: '0.78rem', fontWeight: 700,
              padding: '4px 14px', borderRadius: 99,
              marginBottom: 16, fontFamily: FONT,
            }}>
              {s.tag}
            </div>
            <h3 style={{
              fontSize: 'clamp(1.3rem,3vw,1.9rem)',
              fontWeight: 800, color: DARK,
              fontFamily: FONT,
            }}>
              {s.title}
            </h3>
          </div>
        </div>

        {/* dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
          {SLIDES.map((sl, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === idx ? 28 : 10, height: 10,
                borderRadius: 5, border: 'none', cursor: 'pointer',
                background: i === idx ? sl.accent : '#cbd5e1',
                transition: 'width 0.3s, background 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 3 — WHY US
───────────────────────────────────────────────────────── */
function WhyCard({ item, delay }: { item: typeof WHY[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)
  const [hov, setHov] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hov ? GREEN : '#e2e8f0'}`,
        borderRadius: 22,
        padding: '36px 28px',
        textAlign: 'center',
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(30px)',
        transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease, border-color 0.2s, box-shadow 0.2s`,
        boxShadow: hov ? '0 16px 40px rgba(34,197,94,.15)' : '0 2px 12px rgba(0,0,0,0.04)',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: '2.8rem', marginBottom: 18 }}>{item.icon}</div>
      <p style={{ fontWeight: 800, fontSize: '1.05rem', color: DARK, marginBottom: 8, fontFamily: FONT }}>{item.title}</p>
      <p style={{ color: MUTED, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.65, fontFamily: FONT }}>{item.desc}</p>
    </div>
  )
}

function WhySection() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)

  return (
    <section style={{ background: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          ref={ref}
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            textAlign: 'center', marginBottom: 52,
          }}
        >
          <SectionTitle>لماذا تتعلم معنا؟</SectionTitle>
          <p style={{ color: MUTED, fontFamily: FONT }}>نهج مختلف — نتائج حقيقية</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 20 }}>
          {WHY.map((w, i) => <WhyCard key={i} item={w} delay={i * 0.1} />)}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 4 — COURSES
───────────────────────────────────────────────────────── */
function CourseCard({ c, delay }: { c: typeof COURSES[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)
  const [hov, setHov] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hov && c.open ? GREEN : '#e2e8f0'}`,
        borderRadius: 22,
        padding: '30px 26px',
        opacity: vis ? (c.open ? 1 : 0.55) : 0,
        transform: vis
          ? (hov && c.open ? 'translateY(-7px) scale(1.015)' : 'none')
          : 'translateY(28px)',
        boxShadow: hov && c.open
          ? '0 20px 48px rgba(34,197,94,.18)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: `opacity 0.55s ${delay}s, transform 0.28s ease, border-color 0.2s, box-shadow 0.28s`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{
          background: '#dcfce7', color: '#15803d',
          fontWeight: 900, fontSize: '0.88rem',
          padding: '5px 14px', borderRadius: 10,
          fontFamily: FONT,
        }}>
          {c.level}
        </span>
        {!c.open && (
          <span style={{
            background: '#f1f5f9', color: '#94a3b8',
            fontSize: '0.75rem', fontWeight: 600,
            padding: '4px 10px', borderRadius: 8,
            fontFamily: FONT,
          }}>
            قريباً
          </span>
        )}
      </div>

      <p style={{ fontWeight: 800, fontSize: '1.08rem', color: DARK, marginBottom: 6, fontFamily: FONT }}>{c.title}</p>
      <p style={{ color: MUTED, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6, marginBottom: 18, fontFamily: FONT }}>{c.desc}</p>

      {/* tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 7, fontFamily: FONT, fontWeight: 600 }}>
          ⏱ {c.dur}
        </span>
        <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 7, fontFamily: FONT, fontWeight: 600 }}>
          بدون قواعد مملة
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: DARK, fontFamily: FONT }}>{c.price}</span>
        {c.open ? (
          <Link
            href={`/courses/${c.level.toLowerCase()}`}
            style={{
              background: GREEN, color: '#fff',
              padding: '9px 22px', borderRadius: 10,
              fontSize: '0.88rem', fontWeight: 700,
              textDecoration: 'none', fontFamily: FONT,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}
          >
            ابدأ الآن
          </Link>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: FONT }}>قريباً</span>
        )}
      </div>
    </div>
  )
}

function CoursesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)

  return (
    <section style={{ background: SOFT, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div
          ref={ref}
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s, transform 0.5s',
            textAlign: 'center', marginBottom: 52,
          }}
        >
          <SectionTitle>الدورات</SectionTitle>
          <p style={{ color: MUTED, fontFamily: FONT }}>اختر مستواك وابدأ رحلتك اليوم</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
          {COURSES.map((c, i) => <CourseCard key={c.level} c={c} delay={i * 0.07} />)}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 5 — LEARN ANYWHERE
───────────────────────────────────────────────────────── */
function LearnAnywhereSection() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)

  return (
    <section style={{ background: '#fff', padding: '80px 24px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div
          ref={ref}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 64, flexWrap: 'wrap',
          }}
        >
          {/* Visual */}
          <div
            style={{
              flex: '1 1 280px',
              background: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
              borderRadius: 28, minHeight: 340,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '7rem',
              opacity: vis ? 1 : 0,
              transform: vis ? 'none' : 'translateX(-30px)',
              transition: 'opacity 0.65s ease, transform 0.65s ease',
            }}
          >
            📱
          </div>

          {/* Text */}
          <div
            dir="rtl"
            style={{
              flex: '1 1 280px',
              opacity: vis ? 1 : 0,
              transform: vis ? 'none' : 'translateX(30px)',
              transition: 'opacity 0.65s 0.15s ease, transform 0.65s 0.15s ease',
            }}
          >
            <span style={{
              background: '#dcfce7', color: '#16a34a',
              fontSize: '0.78rem', fontWeight: 700,
              padding: '4px 14px', borderRadius: 99,
              fontFamily: FONT,
            }}>
              تعلم مرن
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
              fontWeight: 900, color: DARK,
              lineHeight: 1.25, margin: '18px 0 16px',
              fontFamily: FONT,
            }}>
              تعلم في أي وقت<br />
              <span style={{ color: GREEN }}>وفي أي مكان</span>
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.85, marginBottom: 32, fontFamily: FONT, fontWeight: 400 }}>
              من هاتفك، حاسوبك، أو تابلتك — الدروس متاحة دائماً.<br />
              تابع تقدمك وتدرب في أي لحظة.
            </p>
            <PrimaryBtn href="/courses">اكتشف الدورات</PrimaryBtn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 6 — MAP
───────────────────────────────────────────────────────── */
function MapSection() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)

  const nodeColor = (s: string) =>
    s === 'done'    ? { bg: GREEN,  text: '#fff', border: GREEN  } :
    s === 'current' ? { bg: BLUE,   text: '#fff', border: BLUE   } :
    /* locked */      { bg: '#e2e8f0', text: '#94a3b8', border: '#e2e8f0' }

  return (
    <section style={{ background: SOFT, padding: '80px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div
          ref={ref}
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s, transform 0.5s',
          }}
        >
          <SectionTitle>رحلة التعلم</SectionTitle>
          <p style={{ color: MUTED, marginBottom: 56, fontFamily: FONT }}>
            تبدأ من وادي زم وتصل إلى الاحتراف — خطوة خطوة
          </p>
        </div>

        {/* path */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexWrap: 'wrap',
          rowGap: 16, gap: 0,
          marginBottom: 52,
        }}>
          {MAP_NODES.map((n, i) => {
            const c = nodeColor(n.state)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {/* node */}
                <div
                  style={{
                    opacity: vis ? 1 : 0,
                    transform: vis ? 'none' : 'scale(0.7)',
                    transition: `opacity 0.5s ${0.15 + i * 0.12}s, transform 0.5s ${0.15 + i * 0.12}s`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 10,
                  }}
                >
                  <div
                    className={n.state === 'current' ? 'node-pulse' : ''}
                    style={{
                      width: 68, height: 68,
                      borderRadius: '50%',
                      background: c.bg,
                      color: c.text,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.9rem',
                      fontFamily: FONT,
                      filter: n.state === 'locked' ? 'blur(0.5px)' : 'none',
                      border: `3px solid ${c.border}`,
                    }}
                  >
                    {n.state === 'done' ? '✓' : n.level}
                  </div>
                  <span style={{
                    fontSize: '0.78rem', color: n.state === 'locked' ? '#94a3b8' : MUTED,
                    fontFamily: FONT, fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {n.city}
                  </span>
                </div>
                {/* connector */}
                {i < MAP_NODES.length - 1 && (
                  <div style={{
                    width: 52, height: 3, marginBottom: 28,
                    background: i < 1
                      ? `linear-gradient(90deg,${GREEN},${GREEN})`
                      : i === 1
                        ? `linear-gradient(90deg,${GREEN},${BLUE})`
                        : '#e2e8f0',
                    opacity: vis ? 1 : 0,
                    transition: `opacity 0.5s ${0.3 + i * 0.12}s`,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        <PrimaryBtn href="/map">ابدأ الرحلة</PrimaryBtn>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION 7 — FINAL CTA
───────────────────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref as React.RefObject<Element>)

  return (
    <section style={{
      background: `linear-gradient(135deg, #166534 0%, #16a34a 50%, #22c55e 100%)`,
      padding: '96px 24px',
      textAlign: 'center',
    }}>
      <div
        ref={ref}
        style={{
          maxWidth: 620, margin: '0 auto',
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.6s, transform 0.6s',
        }}
      >
        <div style={{ fontSize: '3.2rem', marginBottom: 20 }}>🚀</div>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
          fontWeight: 900, color: '#fff',
          lineHeight: 1.2, marginBottom: 18,
          fontFamily: FONT,
        }}>
          ابدأ الآن وتكلم<br />الإنجليزية بثقة
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.82)',
          fontSize: '1.05rem', marginBottom: 40,
          fontWeight: 400, fontFamily: FONT,
        }}>
          انضم لآلاف المتعلمين — لا يوجد وقت أفضل من الآن
        </p>
        <Link
          href="/courses"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff', color: '#16a34a',
            padding: '17px 56px', borderRadius: 16,
            fontSize: '1.05rem', fontWeight: 900,
            textDecoration: 'none', fontFamily: FONT,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.05)'
            el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'none'
            el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'
          }}
        >
          ابدأ الآن
        </Link>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main dir="rtl" style={{ fontFamily: FONT, background: '#fff', color: DARK }}>
      <HeroSection />
      <SliderSection />
      <WhySection />
      <CoursesSection />
      <LearnAnywhereSection />
      <MapSection />
      <FinalCTA />
    </main>
  )
}
