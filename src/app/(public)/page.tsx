'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ─── palette ─────────────────────────────────────────── */
const G = '#22c55e'
const B = '#3b82f6'
const FONT = "'Cairo', sans-serif"

/* ─── data ────────────────────────────────────────────── */
const SLIDES = [
  {
    bg: 'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)',
    emoji: '👩‍💻',
    title: 'تعلم الإنجليزية بسهولة',
    sub: 'دروس + محادثة + تطبيق عملي كل يوم',
  },
  {
    bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
    emoji: '🎧',
    title: 'استمع وتحدث من اليوم الأول',
    sub: 'بدون قواعد مملة — فقط محادثة حقيقية',
  },
  {
    bg: 'linear-gradient(135deg,#fefce8 0%,#fef9c3 100%)',
    emoji: '🚀',
    title: 'تقدم سريع وملحوظ',
    sub: 'من الصفر إلى الاحتراف بخطوات واضحة',
  },
]

const FEATURES = [
  { icon: '💬', title: 'تعلم بالمحادثة', desc: 'لا حفظ، فقط كلام حقيقي من أول درس' },
  { icon: '🧠', title: 'بدون قواعد معقدة', desc: 'افهم الإنجليزية من السياق مثل لغتك الأم' },
  { icon: '🚀', title: 'تقدم سريع', desc: 'منهج مُصمَّم لنتائج واضحة في أسابيع' },
  { icon: '🔊', title: 'صوت وتمارين', desc: 'تمارين صوتية وكتابية بعد كل درس' },
]

const COURSES = [
  { level: 'A0', title: 'المبتدئ المطلق', desc: 'لمن لا يعرف شيئاً', dur: '3 أسابيع', price: '99 درهم', open: true },
  { level: 'A1', title: 'الأساسيات', desc: 'الجمل الأولى والتعريف بالنفس', dur: '4 أسابيع', price: '149 درهم', open: true },
  { level: 'A2', title: 'المحادثة اليومية', desc: 'التعبير في المواقف اليومية', dur: '5 أسابيع', price: '149 درهم', open: true },
  { level: 'B1', title: 'المتوسط', desc: 'التعبير عن الأفكار والمواقف', dur: '6 أسابيع', price: '199 درهم', open: true },
  { level: 'B2', title: 'فوق المتوسط', desc: 'النقاش والفهم المعمّق', dur: '7 أسابيع', price: '249 درهم', open: false },
  { level: 'C1', title: 'الاحتراف', desc: 'الطلاقة الكاملة في كل المجالات', dur: '8 أسابيع', price: '299 درهم', open: false },
]

const MAP_NODES = [
  { city: 'وادي زم', level: 'A0', state: 'done' as const },
  { city: 'خريبكة', level: 'A1', state: 'done' as const },
  { city: 'الدار البيضاء', level: 'B1', state: 'current' as const },
  { city: 'مراكش', level: 'C1', state: 'locked' as const },
]

/* ─── helpers ─────────────────────────────────────────── */
function Btn({
  href, children, variant = 'green', full = false,
}: {
  href: string; children: React.ReactNode; variant?: 'green' | 'outline' | 'blue'; full?: boolean
}) {
  const base: React.CSSProperties = {
    display: full ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 32px',
    borderRadius: 12,
    fontSize: '0.95rem',
    fontWeight: 700,
    textDecoration: 'none',
    fontFamily: FONT,
    transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
    cursor: 'pointer',
    width: full ? '100%' : undefined,
  }
  const styles: Record<string, React.CSSProperties> = {
    green:   { ...base, background: G,    color: '#fff', boxShadow: '0 4px 18px rgba(34,197,94,.35)' },
    blue:    { ...base, background: B,    color: '#fff', boxShadow: '0 4px 18px rgba(59,130,246,.35)' },
    outline: { ...base, background: '#fff', color: '#16a34a', border: '2px solid #22c55e' },
  }
  return (
    <Link
      href={href}
      style={styles[variant]}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {children}
    </Link>
  )
}

/* ─── sections ────────────────────────────────────────── */

function HeroSlider() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % SLIDES.length)
        setFading(false)
      }, 350)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const s = SLIDES[idx]

  return (
    <section
      style={{
        background: s.bg,
        transition: 'background 0.6s ease',
        padding: '80px 24px 72px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* emoji image placeholder */}
        <div
          style={{
            fontSize: '7rem',
            lineHeight: 1,
            marginBottom: 28,
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          {s.emoji}
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.9rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: 16,
            color: '#0f172a',
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            fontFamily: FONT,
          }}
        >
          {s.title}
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#475569',
            marginBottom: 40,
            fontWeight: 400,
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.35s ease 0.05s',
            fontFamily: FONT,
          }}
        >
          {s.sub}
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/courses">ابدأ الآن</Btn>
          <Btn href="/map" variant="outline">شاهد كيف يعمل</Btn>
        </div>

        {/* dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === idx ? G : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
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

function FeaturesSection() {
  return (
    <section style={{ padding: '72px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: 48, color: '#0f172a', fontFamily: FONT }}>
          لماذا تتعلم معنا؟
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: '32px 24px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-6px)'
                el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>{f.icon}</div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: '#0f172a', fontFamily: FONT }}>{f.title}</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6, fontFamily: FONT }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CourseCard({ c }: { c: typeof COURSES[number] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hov && c.open ? G : '#e2e8f0'}`,
        borderRadius: 20,
        padding: '28px 24px',
        opacity: c.open ? 1 : 0.5,
        transform: hov && c.open ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hov && c.open ? '0 16px 40px rgba(34,197,94,.15)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', padding: '5px 12px', borderRadius: 8, fontFamily: FONT }}>
          {c.level}
        </span>
        {!c.open && <span style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 10px', borderRadius: 8, fontFamily: FONT }}>قريباً</span>}
      </div>
      <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: 6, fontFamily: FONT }}>{c.title}</p>
      <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 400, marginBottom: 16, lineHeight: 1.55, fontFamily: FONT }}>{c.desc}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 6, fontFamily: FONT }}>⏱ {c.dur}</span>
        <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 6, fontFamily: FONT }}>بدون قواعد مملة</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', fontFamily: FONT }}>{c.price}</span>
        {c.open ? (
          <Btn href={`/courses/${c.level.toLowerCase()}`} variant="green">ابدأ الآن</Btn>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontFamily: FONT }}>قريباً</span>
        )}
      </div>
    </div>
  )
}

function CoursesSection() {
  return (
    <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, color: '#0f172a', fontFamily: FONT }}>
          الدورات
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontFamily: FONT, fontWeight: 400 }}>
          اختر مستواك وابدأ رحلتك اليوم
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
          {COURSES.map(c => <CourseCard key={c.level} c={c} />)}
        </div>
      </div>
    </section>
  )
}

function LearnAnywhereSection() {
  return (
    <section style={{ padding: '72px 24px', background: '#fff', overflow: 'hidden' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap' }}>
        {/* Mockup visual */}
        <div
          style={{
            flex: '1 1 300px',
            background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
            borderRadius: 24,
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6rem',
          }}
        >
          📱
        </div>
        {/* Text */}
        <div style={{ flex: '1 1 280px', textAlign: 'right' }} dir="rtl">
          <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20, fontFamily: FONT }}>
            تعلم مرن
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, lineHeight: 1.3, margin: '18px 0 14px', color: '#0f172a', fontFamily: FONT }}>
            تعلم في أي وقت<br />وفي أي مكان
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 28, fontWeight: 400, fontFamily: FONT }}>
            من هاتفك، حاسوبك، أو تابلتك — الدروس متاحة دائماً. تابع تقدمك وتدرب في أي لحظة.
          </p>
          <Btn href="/courses">اكتشف الدورات</Btn>
        </div>
      </div>
    </section>
  )
}

function MapSection() {
  return (
    <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, color: '#0f172a', fontFamily: FONT }}>
          رحلة التعلم
        </h2>
        <p style={{ color: '#64748b', marginBottom: 52, fontFamily: FONT, fontWeight: 400 }}>
          تبدأ من وادي زم وتصل إلى الاحتراف — خطوة خطوة
        </p>

        {/* Path */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', rowGap: 16 }}>
          {MAP_NODES.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    fontFamily: FONT,
                    background:
                      n.state === 'done'    ? G :
                      n.state === 'current' ? B :
                      '#e2e8f0',
                    color:
                      n.state === 'locked' ? '#94a3b8' : '#fff',
                    boxShadow:
                      n.state === 'current' ? `0 0 0 6px rgba(59,130,246,.2), 0 0 0 12px rgba(59,130,246,.08)` : 'none',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  {n.state === 'done' ? '✓' : n.level}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: FONT, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {n.city}
                </span>
              </div>
              {/* Connector */}
              {i < MAP_NODES.length - 1 && (
                <div
                  style={{
                    width: 48,
                    height: 3,
                    background: i < 1 ? G : '#e2e8f0',
                    marginBottom: 22,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44 }}>
          <Btn href="/map">ابدأ الرحلة</Btn>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg,#16a34a 0%,#22c55e 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', marginBottom: 16, fontFamily: FONT }}>
          ابدأ الآن وطور لغتك 🚀
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: 36, fontWeight: 400, fontFamily: FONT }}>
          انضم لآلاف المتعلمين وابدأ رحلتك اليوم
        </p>
        <Link
          href="/courses"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#16a34a',
            padding: '15px 48px',
            borderRadius: 14,
            fontSize: '1rem',
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            fontFamily: FONT,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          ابدأ الآن
        </Link>
      </div>
    </section>
  )
}

/* ─── page ────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main dir="rtl" style={{ fontFamily: FONT, background: '#fff', color: '#1e293b' }}>
      <HeroSlider />
      <FeaturesSection />
      <CoursesSection />
      <LearnAnywhereSection />
      <MapSection />
      <FinalCTA />
    </main>
  )
}
