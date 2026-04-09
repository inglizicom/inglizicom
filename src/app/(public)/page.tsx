'use client'

import Link from 'next/link'

const COURSES = [
  { level: 'A0', title: 'مستوى المبتدئ', desc: 'للذين لا يعرفون شيئاً عن الإنجليزية', href: '/courses/a0' },
  { level: 'A1', title: 'المستوى الأول', desc: 'الجمل الأساسية والتعريف بالنفس', href: '/courses/a1' },
  { level: 'A2', title: 'المستوى الثاني', desc: 'المحادثة اليومية البسيطة', href: '/courses/a2' },
  { level: 'B1', title: 'المستوى المتوسط', desc: 'التعبير عن الأفكار والمواقف', href: '/courses/b1' },
  { level: 'B2', title: 'فوق المتوسط', desc: 'النقاش والفهم المعمّق', href: '/courses/b2', soon: true },
  { level: 'C1', title: 'المستوى المتقدم', desc: 'الطلاقة والاحتراف الكامل', href: '/courses/c1', soon: true },
]

const STEPS = [
  { icon: '🎧', title: 'استمع', desc: 'استمع لمحادثات حقيقية من اليوم الأول' },
  { icon: '💬', title: 'تحدث', desc: 'تدرب على الكلام بدون خوف' },
  { icon: '📖', title: 'تعلم', desc: 'افهم القواعد من السياق لا من الحفظ' },
]

export default function HomePage() {
  return (
    <main dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: '#fff', color: '#1e293b' }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
          تعلم الإنجليزية خطوة بخطوة
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: 36, fontWeight: 400 }}>
          ابدأ من الصفر وتعلم بالمحادثة
        </p>
        <Link
          href="/courses"
          style={{
            display: 'inline-block',
            background: '#22c55e',
            color: '#fff',
            padding: '14px 40px',
            borderRadius: 12,
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ابدأ الآن
        </Link>

        <div
          style={{
            marginTop: 56,
            width: '100%',
            maxWidth: 520,
            height: 280,
            borderRadius: 20,
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '56px auto 0',
            fontSize: '5rem',
          }}
        >
          👩‍💻
        </div>
      </section>

      {/* ── Courses ────────────────────────────────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: 48 }}>
            الدورات
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {COURSES.map(c => (
              <div
                key={c.level}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '28px 24px',
                  opacity: c.soon ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#16a34a',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 8,
                    }}
                  >
                    {c.level}
                  </span>
                  {c.soon && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>قريباً</span>
                  )}
                </div>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{c.title}</p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20, fontWeight: 400 }}>{c.desc}</p>
                {!c.soon ? (
                  <Link
                    href={c.href}
                    style={{
                      display: 'inline-block',
                      border: '1.5px solid #22c55e',
                      color: '#16a34a',
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    ابدأ الدورة
                  </Link>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>قريباً</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: 48 }}>
            كيف تتعلم معنا
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{s.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{s.title}</p>
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 400 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 16 }}>رحلة التعلم</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: 36, fontWeight: 400 }}>
            تبدأ من وادي زم وتصل إلى الاحتراف
          </p>
          <Link
            href="/map"
            style={{
              display: 'inline-block',
              background: '#22c55e',
              color: '#fff',
              padding: '14px 40px',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ابدأ الرحلة
          </Link>
        </div>
      </section>

    </main>
  )
}
