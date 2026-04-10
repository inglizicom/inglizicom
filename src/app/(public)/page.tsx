'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────
   TOKENS
────────────────────────────────────────────── */
const G     = '#22c55e'
const GL    = '#16a34a'
const B     = '#2563eb'
const DARK  = '#0f172a'
const MUTED = '#64748b'
const SOFT  = '#f0fdf4'
const F     = "'Cairo', sans-serif"

/* ──────────────────────────────────────────────
   DATA
────────────────────────────────────────────── */
const STATS = [
  { icon: '🔥', value: '1,200+', label: 'طالب نشط' },
  { icon: '⭐', value: '4.9',    label: 'تقييم المتعلمين' },
  { icon: '🚀', value: '97%',    label: 'نسبة التقدم' },
  { icon: '🏆', value: 'A0→C1', label: 'جميع المستويات' },
]

const SLIDES = [
  { emoji: '🗣️', color: '#dcfce7', accent: G,       title: 'تحدث من أول يوم',    sub: 'محادثات حقيقية بدون خوف' },
  { emoji: '📱', color: '#dbeafe', accent: B,       title: 'تعلم في أي مكان',     sub: 'من هاتفك في أي وقت' },
  { emoji: '⚡', color: '#fef9c3', accent: '#ca8a04', title: 'دروس قصيرة ممتعة', sub: '5 دقائق كافية كل يوم' },
]

const COURSES = [
  { level:'A0', title:'المبتدئ المطلق',  desc:'ابدأ من الصفر الحقيقي',          dur:'3 أسابيع', price:'99 درهم',  open:true  },
  { level:'A1', title:'الأساسيات',       desc:'أول جمل وتعبيرات',               dur:'4 أسابيع', price:'149 درهم', open:true  },
  { level:'A2', title:'المحادثة اليومية',desc:'تحدث في المواقف اليومية',        dur:'5 أسابيع', price:'149 درهم', open:true  },
  { level:'B1', title:'المتوسط',         desc:'أفكار ومواقف معقدة',             dur:'6 أسابيع', price:'199 درهم', open:true  },
  { level:'B2', title:'فوق المتوسط',     desc:'نقاش وفهم عميق',                 dur:'7 أسابيع', price:'249 درهم', open:false },
  { level:'C1', title:'الاحتراف',        desc:'طلاقة كاملة في كل المجالات',     dur:'8 أسابيع', price:'299 درهم', open:false },
]

const WHY = [
  { icon:'💬', title:'محادثة',   desc:'تعلم بالكلام لا بالحفظ' },
  { icon:'🔊', title:'صوت',      desc:'نطق صحيح من أول درس' },
  { icon:'🎯', title:'تطبيق',    desc:'تمارين بعد كل جلسة' },
  { icon:'🚀', title:'تقدم سريع',desc:'نتائج في أسابيع' },
]

const MAP_NODES = [
  { city:'وادي زم',      level:'A0', state:'done'    as const },
  { city:'خريبكة',       level:'A1', state:'done'    as const },
  { city:'الدار البيضاء',level:'B1', state:'current' as const },
  { city:'مراكش',        level:'C1', state:'locked'  as const },
]

/* ──────────────────────────────────────────────
   HOOK — scroll-reveal
────────────────────────────────────────────── */
function useVisible(threshold = 0.15) {
  const ref  = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect() } },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, vis }
}

/* ──────────────────────────────────────────────
   SMALL ATOMS
────────────────────────────────────────────── */
function GreenBtn({ href, children, big }: { href:string; children:React.ReactNode; big?:boolean }) {
  return (
    <Link href={href} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background: `linear-gradient(135deg,${GL},${G})`,
      color:'#fff', padding: big ? '16px 52px' : '13px 32px',
      borderRadius:16, fontSize: big ? '1.05rem' : '0.95rem',
      fontWeight:800, textDecoration:'none', fontFamily:F,
      boxShadow:`0 6px 24px rgba(34,197,94,.4)`,
      transition:'transform .18s, box-shadow .18s',
    }}
    onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='scale(1.05)';t.style.boxShadow=`0 10px 32px rgba(34,197,94,.55)`}}
    onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='none';t.style.boxShadow=`0 6px 24px rgba(34,197,94,.4)`}}
    >
      {children}
    </Link>
  )
}

function OutlineBtn({ href, children }: { href:string; children:React.ReactNode }) {
  return (
    <Link href={href} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background:'#fff', color:GL, border:`2px solid ${G}`,
      padding:'11px 28px', borderRadius:16,
      fontSize:'0.95rem', fontWeight:800,
      textDecoration:'none', fontFamily:F,
      transition:'background .15s, transform .15s',
    }}
    onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.background='#f0fdf4';t.style.transform='scale(1.04)'}}
    onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.background='#fff';t.style.transform='none'}}
    >
      {children}
    </Link>
  )
}

/* ──────────────────────────────────────────────
   1. HERO
────────────────────────────────────────────── */
function Hero() {
  const [on, setOn] = useState(false)
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t) }, [])
  const f = (d: number): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(22px)',
    transition: `opacity .65s ${d}s ease, transform .65s ${d}s ease`,
  })

  return (
    <section style={{
      background: 'linear-gradient(160deg,#f0fdf4 0%,#ffffff 60%)',
      padding: '96px 24px 72px', overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        gap: 56, flexWrap: 'wrap',
      }}>

        {/* ── left text ── */}
        <div style={{ flex:'1 1 340px', textAlign:'right' }} dir="rtl">
          <div style={{ ...f(0), marginBottom: 20 }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'#dcfce7', color:GL,
              fontSize:'0.8rem', fontWeight:700,
              padding:'5px 14px', borderRadius:99, fontFamily:F,
            }}>
              🎉 الأكثر استخداماً في المغرب
            </span>
          </div>

          <h1 style={{
            ...f(0.1),
            fontSize:'clamp(2rem,5.5vw,3.4rem)',
            fontWeight:900, lineHeight:1.15,
            color:DARK, fontFamily:F, marginBottom:18,
          }}>
            تعلم الإنجليزية<br/>
            <span style={{
              background:`linear-gradient(90deg,${GL},${G})`,
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>
              بالمحادثة
            </span>
          </h1>

          <p style={{
            ...f(0.2),
            fontSize:'1.1rem', color:MUTED,
            fontWeight:400, lineHeight:1.85,
            marginBottom:36, fontFamily:F,
          }}>
            تعلم يومياً بطريقة ممتعة بدون قواعد مملة —<br/>
            من الصفر حتى الطلاقة الكاملة
          </p>

          <div style={{ ...f(0.3), display:'flex', gap:14, flexWrap:'wrap' }}>
            <GreenBtn href="/courses">ابدأ الآن</GreenBtn>
            <OutlineBtn href="/courses/a0">جرب درس مجاني</OutlineBtn>
          </div>

          {/* trust row */}
          <div style={{
            ...f(0.42),
            display:'flex', gap:28, marginTop:44, flexWrap:'wrap',
          }}>
            {[{n:'1,200+',l:'طالب'},{n:'97%',l:'رضا'},{n:'A0→C1',l:'مستويات'}].map(s => (
              <div key={s.n}>
                <div style={{ fontWeight:900, fontSize:'1.25rem', color:DARK, fontFamily:F }}>{s.n}</div>
                <div style={{ fontSize:'0.78rem', color:MUTED, fontFamily:F }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── right visual ── */}
        <div style={{
          flex:'1 1 300px', position:'relative',
          minHeight:380, display:'flex',
          alignItems:'center', justifyContent:'center',
          opacity: on ? 1 : 0,
          transition:'opacity .8s .2s ease',
        }}>
          {/* main blob */}
          <div className="float-1" style={{
            width:310, height:310,
            background:'linear-gradient(135deg,#bbf7d0,#86efac)',
            borderRadius:'62% 38% 46% 54% / 52% 44% 56% 48%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'8rem', userSelect:'none',
            boxShadow:'0 24px 64px rgba(34,197,94,.25)',
          }}>
            👩‍💻
          </div>

          {/* badge 1 */}
          <div className="float-2" style={{
            position:'absolute', top:20, right:8,
            background:'#fff', borderRadius:16,
            padding:'10px 16px',
            boxShadow:'0 8px 28px rgba(0,0,0,.12)',
            display:'flex', alignItems:'center', gap:10,
            fontFamily:F,
          }}>
            <span style={{ fontSize:'1.5rem' }}>💬</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.78rem', color:DARK }}>محادثة حقيقية</div>
              <div style={{ fontSize:'0.68rem', color:MUTED }}>من أول درس</div>
            </div>
          </div>

          {/* badge 2 */}
          <div className="float-3" style={{
            position:'absolute', bottom:50, left:4,
            background:'#fff', borderRadius:16,
            padding:'10px 16px',
            boxShadow:'0 8px 28px rgba(0,0,0,.12)',
            display:'flex', alignItems:'center', gap:10,
            fontFamily:F,
          }}>
            <span style={{ fontSize:'1.5rem' }}>🔊</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.78rem', color:DARK }}>نطق صحيح</div>
              <div style={{ fontSize:'0.68rem', color:MUTED }}>صوت + تكرار</div>
            </div>
          </div>

          {/* badge 3 */}
          <div className="float-1" style={{
            position:'absolute', bottom:14, right:16,
            background:B, borderRadius:12,
            padding:'8px 14px',
            boxShadow:`0 6px 20px rgba(37,99,235,.4)`,
            fontFamily:F,
          }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#fff' }}>📱 تعلم في أي مكان</div>
          </div>

          {/* badge 4 */}
          <div className="float-2" style={{
            position:'absolute', top:80, left:0,
            background:'#fef9c3', borderRadius:12,
            padding:'8px 14px', fontFamily:F,
            boxShadow:'0 4px 16px rgba(0,0,0,.08)',
          }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#92400e' }}>⭐ 4.9 تقييم</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   2. MINI STATS
────────────────────────────────────────────── */
function MiniStats() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#fff', padding:'0 24px 0', marginTop:-2 }}>
      <div style={{
        maxWidth:1000, margin:'0 auto',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
        gap:16,
        background:SOFT,
        borderRadius:24, padding:'28px 32px',
        boxShadow:'0 4px 32px rgba(34,197,94,.10)',
      }}
      ref={ref}
      >
        {STATS.map((s, i) => (
          <div key={i} style={{
            textAlign:'center',
            opacity: vis ? 1 : 0,
            transform: vis ? 'none' : 'translateY(16px)',
            transition: `opacity .5s ${i*.1}s, transform .5s ${i*.1}s`,
          }}>
            <div style={{ fontSize:'1.8rem', marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontWeight:900, fontSize:'1.35rem', color:DARK, fontFamily:F }}>{s.value}</div>
            <div style={{ fontSize:'0.8rem', color:MUTED, fontFamily:F }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   3. SLIDER
────────────────────────────────────────────── */
function Slider() {
  const [idx, setIdx]       = useState(0)
  const [fading, setFading] = useState(false)
  const { ref, vis }        = useVisible()

  const go = (next: number) => {
    setFading(true)
    setTimeout(() => { setIdx(next); setFading(false) }, 300)
  }

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % SLIDES.length), 4200)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const s = SLIDES[idx]

  return (
    <section style={{ background:'#fff', padding:'80px 24px' }} ref={ref}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <h2 style={{
          textAlign:'center', fontSize:'clamp(1.5rem,3.5vw,2rem)',
          fontWeight:900, color:DARK, fontFamily:F,
          marginBottom:12,
          opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)',
          transition:'opacity .5s, transform .5s',
        }}>
          لماذا يختارنا المتعلمون؟
        </h2>
        <p style={{
          textAlign:'center', color:MUTED, marginBottom:44, fontFamily:F,
          opacity: vis ? 1 : 0, transition:'opacity .5s .1s',
        }}>
          آلاف الطلاب يتعلمون كل يوم بطريقتنا
        </p>

        {/* main card */}
        <div style={{
          background: s.color,
          borderRadius:28, padding:'64px 40px',
          textAlign:'center', minHeight:300,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:22,
          transition:'background .5s ease',
          boxShadow:'0 6px 40px rgba(0,0,0,.06)',
        }}>
          <div style={{
            fontSize:'5.5rem', lineHeight:1,
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(.85)' : 'scale(1)',
            transition:'opacity .3s, transform .3s',
          }}>
            {s.emoji}
          </div>
          <div style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(14px)' : 'none',
            transition:'opacity .3s .04s, transform .3s .04s',
          }}>
            <span style={{
              background: s.accent, color:'#fff',
              fontSize:'0.78rem', fontWeight:700,
              padding:'4px 16px', borderRadius:99,
              fontFamily:F, display:'inline-block', marginBottom:14,
            }}>
              {s.sub}
            </span>
            <h3 style={{ fontSize:'clamp(1.4rem,3.5vw,2rem)', fontWeight:900, color:DARK, fontFamily:F }}>
              {s.title}
            </h3>
          </div>
        </div>

        {/* dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:22 }}>
          {SLIDES.map((sl, i) => (
            <button key={i} onClick={() => go(i)} style={{
              width: i===idx ? 32 : 10, height:10,
              borderRadius:5, border:'none', cursor:'pointer', padding:0,
              background: i===idx ? sl.accent : '#cbd5e1',
              transition:'width .3s, background .3s',
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   4. COURSES
────────────────────────────────────────────── */
function CourseCard({ c, delay }: { c: typeof COURSES[number]; delay: number }) {
  const { ref, vis } = useVisible(0.1)
  const [hov, setHov] = useState(false)

  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:'#fff',
        border: `2px solid ${hov && c.open ? G : '#e2e8f0'}`,
        borderRadius:24, padding:'32px 28px',
        opacity: vis ? (c.open ? 1 : .52) : 0,
        transform: vis
          ? (hov && c.open ? 'translateY(-8px) scale(1.02)' : 'none')
          : 'translateY(28px)',
        boxShadow: hov && c.open
          ? `0 24px 56px rgba(34,197,94,.18)`
          : '0 2px 16px rgba(0,0,0,.05)',
        transition:`opacity .55s ${delay}s, transform .25s ease, border-color .2s, box-shadow .25s`,
        display:'flex', flexDirection:'column',
      }}
    >
      {/* top row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <span style={{
          background:'#dcfce7', color:GL,
          fontWeight:900, fontSize:'0.9rem',
          padding:'5px 14px', borderRadius:10, fontFamily:F,
        }}>
          {c.level}
        </span>
        {!c.open && (
          <span style={{
            background:'#f1f5f9', color:'#94a3b8',
            fontSize:'0.72rem', padding:'3px 10px',
            borderRadius:8, fontFamily:F, fontWeight:600,
          }}>
            قريباً
          </span>
        )}
      </div>

      <p style={{ fontWeight:800, fontSize:'1.05rem', color:DARK, marginBottom:6, fontFamily:F }}>{c.title}</p>
      <p style={{ color:MUTED, fontSize:'0.875rem', fontWeight:400, lineHeight:1.65, marginBottom:18, fontFamily:F }}>{c.desc}</p>

      {/* tags */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
        <span style={{ background:'#f0fdf4', color:GL, fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, fontFamily:F, fontWeight:600 }}>
          ⏱ {c.dur}
        </span>
        <span style={{ background:'#eff6ff', color:B, fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, fontFamily:F, fontWeight:600 }}>
          بدون قواعد مملة
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
        <span style={{ fontWeight:900, fontSize:'1.1rem', color:DARK, fontFamily:F }}>{c.price}</span>
        {c.open ? (
          <Link href={`/courses/${c.level.toLowerCase()}`}
            style={{
              background:`linear-gradient(135deg,${GL},${G})`,
              color:'#fff', padding:'9px 22px',
              borderRadius:12, fontSize:'0.875rem',
              fontWeight:800, textDecoration:'none', fontFamily:F,
              transition:'transform .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none' }}
          >
            ابدأ الآن
          </Link>
        ) : (
          <span style={{ color:'#94a3b8', fontSize:'0.85rem', fontFamily:F }}>قريباً</span>
        )}
      </div>
    </div>
  )
}

function CoursesSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#f8fafc', padding:'80px 24px' }}>
      <div style={{ maxWidth:1020, margin:'0 auto' }}>
        <div ref={ref} style={{
          textAlign:'center', marginBottom:52,
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(18px)',
          transition:'opacity .5s, transform .5s',
        }}>
          <h2 style={{ fontSize:'clamp(1.5rem,3.5vw,2rem)', fontWeight:900, color:DARK, fontFamily:F, marginBottom:10 }}>
            اختر مستواك
          </h2>
          <p style={{ color:MUTED, fontFamily:F }}>6 مستويات من الصفر إلى الاحتراف</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(288px,1fr))', gap:22 }}>
          {COURSES.map((c, i) => <CourseCard key={c.level} c={c} delay={i * .07} />)}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   5. WHY
────────────────────────────────────────────── */
function WhySection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#fff', padding:'80px 24px' }}>
      <div style={{ maxWidth:980, margin:'0 auto' }}>
        <div ref={ref} style={{
          textAlign:'center', marginBottom:52,
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(18px)',
          transition:'opacity .5s, transform .5s',
        }}>
          <h2 style={{ fontSize:'clamp(1.5rem,3.5vw,2rem)', fontWeight:900, color:DARK, fontFamily:F, marginBottom:10 }}>
            طريقتنا مختلفة
          </h2>
          <p style={{ color:MUTED, fontFamily:F }}>نهج عملي يُعطي نتائج حقيقية</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))', gap:20 }}>
          {WHY.map((w, i) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [hov, setHov] = useState(false)
            return (
              <div key={i}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  background: hov ? SOFT : '#fff',
                  border:`1.5px solid ${hov ? G : '#e2e8f0'}`,
                  borderRadius:22, padding:'36px 28px',
                  textAlign:'center',
                  opacity: vis ? 1 : 0,
                  transform: vis
                    ? (hov ? 'translateY(-6px)' : 'none')
                    : 'translateY(28px)',
                  boxShadow: hov ? `0 16px 40px rgba(34,197,94,.14)` : '0 2px 12px rgba(0,0,0,.04)',
                  transition: `opacity .55s ${i*.1}s, transform .25s ease, border-color .2s, box-shadow .25s, background .2s`,
                  cursor:'default',
                }}
              >
                <div style={{ fontSize:'2.8rem', marginBottom:18 }}>{w.icon}</div>
                <p style={{ fontWeight:800, fontSize:'1rem', color:DARK, marginBottom:8, fontFamily:F }}>{w.title}</p>
                <p style={{ color:MUTED, fontSize:'0.875rem', fontWeight:400, lineHeight:1.65, fontFamily:F }}>{w.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   6. MAP
────────────────────────────────────────────── */
function MapSection() {
  const { ref, vis } = useVisible()

  return (
    <section style={{ background:'#f0fdf4', padding:'80px 24px' }}>
      <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center' }}>
        <div ref={ref} style={{
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(18px)',
          transition:'opacity .5s, transform .5s',
          marginBottom:56,
        }}>
          <span style={{
            background:GL, color:'#fff',
            fontSize:'0.8rem', fontWeight:700,
            padding:'5px 16px', borderRadius:99, fontFamily:F,
            display:'inline-block', marginBottom:16,
          }}>
            🗺️ رحلة التعلم
          </span>
          <h2 style={{ fontSize:'clamp(1.5rem,3.5vw,2rem)', fontWeight:900, color:DARK, fontFamily:F, marginBottom:10 }}>
            رحلتك من الصفر للاحتراف
          </h2>
          <p style={{ color:MUTED, fontFamily:F }}>
            تبدأ من وادي زم وتصل إلى مراكش — خطوة خطوة
          </p>
        </div>

        {/* path */}
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'center', flexWrap:'wrap',
          rowGap:16,
        }}>
          {MAP_NODES.map((n, i) => {
            const done    = n.state === 'done'
            const current = n.state === 'current'
            const locked  = n.state === 'locked'
            const bg      = done ? G : current ? B : '#e2e8f0'
            const fg      = locked ? '#94a3b8' : '#fff'
            return (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{
                  display:'flex', flexDirection:'column',
                  alignItems:'center', gap:10,
                  opacity: vis ? 1 : 0,
                  transform: vis ? 'none' : 'scale(.7)',
                  transition:`opacity .5s ${.15+i*.13}s, transform .5s ${.15+i*.13}s`,
                }}>
                  <div
                    className={current ? 'node-pulse' : ''}
                    style={{
                      width:72, height:72, borderRadius:'50%',
                      background:bg, color:fg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:900, fontSize:'0.9rem', fontFamily:F,
                      border:`3px solid ${bg}`,
                      filter: locked ? 'grayscale(1) opacity(.55)' : 'none',
                      animation: current ? undefined : (done ? 'bounce-light 2.6s ease-in-out infinite' : 'none'),
                    }}
                  >
                    {done ? '✓' : n.level}
                  </div>
                  <span style={{
                    fontSize:'0.76rem', color: locked ? '#94a3b8' : MUTED,
                    fontFamily:F, fontWeight:600, whiteSpace:'nowrap',
                  }}>
                    {n.city}
                  </span>
                </div>
                {i < MAP_NODES.length - 1 && (
                  <div style={{
                    width:52, height:3, marginBottom:28,
                    background: i < 1 ? `linear-gradient(90deg,${G},${G})` :
                                i === 1 ? `linear-gradient(90deg,${G},${B})` : '#e2e8f0',
                    opacity: vis ? 1 : 0,
                    transition:`opacity .5s ${.3+i*.13}s`,
                    borderRadius:2,
                  }}/>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop:52 }}>
          <GreenBtn href="/map">ابدأ الرحلة</GreenBtn>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   7. FINAL CTA
────────────────────────────────────────────── */
function FinalCTA() {
  const { ref, vis } = useVisible()
  return (
    <section style={{
      background:`linear-gradient(135deg, #14532d 0%, #16a34a 55%, #22c55e 100%)`,
      padding:'100px 24px', textAlign:'center', overflow:'hidden', position:'relative',
    }}>
      {/* decorative circles */}
      <div style={{
        position:'absolute', top:-80, left:-80,
        width:320, height:320, borderRadius:'50%',
        background:'rgba(255,255,255,.05)', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:-60, right:-60,
        width:260, height:260, borderRadius:'50%',
        background:'rgba(255,255,255,.06)', pointerEvents:'none',
      }}/>

      <div ref={ref} style={{
        maxWidth:600, margin:'0 auto', position:'relative', zIndex:1,
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(24px)',
        transition:'opacity .6s, transform .6s',
      }}>
        <div style={{ fontSize:'3.5rem', marginBottom:22 }}>🚀</div>
        <h2 style={{
          fontSize:'clamp(1.8rem,5vw,3rem)',
          fontWeight:900, color:'#fff',
          lineHeight:1.15, marginBottom:18, fontFamily:F,
        }}>
          ابدأ الآن وابدأ رحلتك
        </h2>
        <p style={{
          color:'rgba(255,255,255,.82)', fontSize:'1.05rem',
          marginBottom:44, fontWeight:400, fontFamily:F, lineHeight:1.8,
        }}>
          انضم لأكثر من 1200 طالب يتعلمون الآن —<br/>
          لا يوجد وقت أفضل من هذه اللحظة
        </p>
        <Link href="/courses" style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          background:'#fff', color:GL,
          padding:'17px 60px', borderRadius:18,
          fontSize:'1.05rem', fontWeight:900,
          textDecoration:'none', fontFamily:F,
          boxShadow:'0 8px 36px rgba(0,0,0,.20)',
          transition:'transform .18s, box-shadow .18s',
        }}
        onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='scale(1.06)';t.style.boxShadow='0 14px 44px rgba(0,0,0,.28)'}}
        onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='none';t.style.boxShadow='0 8px 36px rgba(0,0,0,.20)'}}
        >
          ابدأ الآن مجاناً
        </Link>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   PAGE
────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main dir="rtl" style={{ fontFamily:F, background:'#fff', color:DARK }}>
      <Hero />
      <MiniStats />
      <Slider />
      <CoursesSection />
      <WhySection />
      <MapSection />
      <FinalCTA />
    </main>
  )
}
