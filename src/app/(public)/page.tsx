'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ══════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════ */
const G   = '#22c55e'
const GL  = '#16a34a'
const B   = '#2563eb'
const P   = '#8b5cf6'
const O   = '#f97316'
const DARK  = '#0f172a'
const MUTED = '#64748b'
const F   = "'Cairo', sans-serif"

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */

const FEATURES = [
  { icon:'🎙️', title:'تحدث من اليوم الأول',  desc:'محادثات حقيقية بدون خوف من البداية',       color:'#dcfce7', border:G },
  { icon:'🧠', title:'بدون قواعد مملة',       desc:'افهم الإنجليزية من السياق لا من الحفظ',    color:'#eff6ff', border:B },
  { icon:'📱', title:'تعلم في أي مكان',       desc:'من هاتفك أو حاسوبك في أي وقت تريد',       color:'#fdf4ff', border:P },
  { icon:'⚡', title:'تقدم سريع وملحوظ',      desc:'نتائج واضحة في أسابيع بمنهج مُصمَّم ذكياً',color:'#fff7ed', border:O },
]

const COURSES = [
  { level:'A0', title:'المبتدئ المطلق',   desc:'أول خطوة — تتعلم التحيات والكلام الأساسي',  dur:'3 أسابيع', price:'99 درهم',  open:true,  featured:true  },
  { level:'A1', title:'الأساسيات',        desc:'أول جمل وتعبيرات حقيقية من الحياة اليومية', dur:'4 أسابيع', price:'149 درهم', open:true,  featured:false },
  { level:'A2', title:'المحادثة اليومية', desc:'تحدث في المواقف اليومية بثقة وسهولة',       dur:'5 أسابيع', price:'149 درهم', open:true,  featured:false },
  { level:'B1', title:'المتوسط',          desc:'عبّر عن أفكارك ومشاعرك بالإنجليزية',        dur:'6 أسابيع', price:'199 درهم', open:true,  featured:false },
  { level:'B2', title:'فوق المتوسط',      desc:'نقاش وفهم عميق لأي موضوع أو سياق',          dur:'7 أسابيع', price:'249 درهم', open:false, featured:false },
  { level:'C1', title:'الاحتراف',         desc:'طلاقة كاملة في كل المجالات والسياقات',       dur:'8 أسابيع', price:'299 درهم', open:false, featured:false },
]

const TESTIMONIALS = [
  { name:'سارة م.',   flag:'🇲🇦', text:'بعد 3 أشهر فقط بدأت أتكلم بثقة كاملة!',        stars:5 },
  { name:'يوسف ك.',   flag:'🇲🇦', text:'أفضل منهج جربته — بدون ملل وبدون حفظ.',         stars:5 },
  { name:'فاطمة ب.',  flag:'🇲🇦', text:'تحسن نطقي بشكل كبير خلال أسابيع قليلة.',       stars:5 },
]

const MAP_NODES = [
  { city:'وادي زم',       level:'A0', state:'done'    as const, emoji:'✅' },
  { city:'خريبكة',        level:'A1', state:'done'    as const, emoji:'✅' },
  { city:'الدار البيضاء', level:'B1', state:'current' as const, emoji:'📍' },
  { city:'مراكش',         level:'C1', state:'locked'  as const, emoji:'🔒' },
]

/* ══════════════════════════════════════════════
   HOOK
══════════════════════════════════════════════ */
function useVisible(th = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect() } },
      { threshold: th }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [th])
  return { ref, vis }
}

/* ══════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════ */
function GBtn({ href, children, big }: { href:string; children:React.ReactNode; big?:boolean }) {
  const [h, sH] = useState(false)
  return (
    <Link href={href} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
      background: h ? GL : G,
      color:'#fff', padding: big?'17px 56px':'13px 34px',
      borderRadius:16, fontSize: big?'1.05rem':'0.95rem',
      fontWeight:800, textDecoration:'none', fontFamily:F,
      boxShadow: h?`0 12px 36px rgba(34,197,94,.55)`:`0 6px 24px rgba(34,197,94,.38)`,
      transform: h?'scale(1.05)':'none',
      transition:'all .2s ease',
    }}
    onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
    >{children}</Link>
  )
}


/* ══════════════════════════════════════════════
   SECTION TAG
══════════════════════════════════════════════ */
function Tag({ children, color='#dcfce7', text='#16a34a' }: { children:React.ReactNode; color?:string; text?:string }) {
  return (
    <span style={{
      display:'inline-block', background:color, color:text,
      fontSize:'0.78rem', fontWeight:700,
      padding:'5px 16px', borderRadius:99, fontFamily:F,
      marginBottom:16, letterSpacing:'0.03em',
    }}>{children}</span>
  )
}

/* ══════════════════════════════════════════════
   1. HERO (split: text left + image slider right)
══════════════════════════════════════════════ */
const HERO_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=720&h=860&fit=crop&q=80',
    label: 'تحدث من أول يوم',
    accent: G,
  },
  {
    src: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=720&h=860&fit=crop&q=80',
    label: 'محادثة حقيقية',
    accent: B,
  },
  {
    src: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=720&h=860&fit=crop&q=80',
    label: 'تعلم في أي مكان',
    accent: P,
  },
]

/* ──────────────────────────────────────────────
   HERO — split: text left + image slider right
────────────────────────────────────────────── */
function Hero() {
  const [idx, setIdx]   = useState(0)
  const [fade, setFade] = useState(false)
  const [on, setOn]     = useState(false)

  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t) }, [])

  const go = (next: number) => {
    if (fade) return
    setFade(true)
    setTimeout(() => { setIdx(next); setFade(false) }, 380)
  }

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % HERO_IMAGES.length), 3500)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, fade])

  const fd = (d: number): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(22px)',
    transition: `opacity .7s ${d}s ease, transform .7s ${d}s ease`,
  })

  const img = HERO_IMAGES[idx]

  return (
    <section style={{
      background: 'linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)',
      paddingTop: 68, minHeight: '92vh',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* soft bg glows */}
      <div style={{ position:'absolute', top:-100, left:-80, width:440, height:440, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,.1),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-80, right:-60, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,.08),transparent 70%)', pointerEvents:'none' }}/>

      <div style={{
        maxWidth: 1120, margin: '0 auto', width: '100%',
        padding: '60px 28px',
        display: 'flex', alignItems: 'center',
        gap: 56, flexWrap: 'wrap',
      }}>

        {/* ── TEXT (right in RTL = right side visually) ── */}
        <div style={{ flex: '1 1 360px', textAlign: 'right' }} dir="rtl">

          <div style={{ ...fd(0), marginBottom: 18 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#dcfce7', color: GL,
              fontSize: '0.78rem', fontWeight: 700,
              padding: '5px 16px', borderRadius: 99, fontFamily: F,
            }}>
              🎉 الأكثر استخداماً في المغرب
            </span>
          </div>

          <h1 style={{
            ...fd(0.1),
            fontSize: 'clamp(2.1rem, 5.5vw, 3.6rem)',
            fontWeight: 900, lineHeight: 1.12,
            color: DARK, fontFamily: F, marginBottom: 20,
          }}>
            تعلم الإنجليزية<br/>
            <span style={{
              background: `linear-gradient(90deg,${GL},${G},#4ade80)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>بالمحادثة</span>
          </h1>

          <p style={{
            ...fd(0.18),
            fontSize: '1.08rem', color: MUTED,
            lineHeight: 1.88, marginBottom: 38, fontFamily: F, fontWeight: 400,
          }}>
            بدون قواعد مملة — فقط ممارسة يومية<br/>
            من الصفر حتى الطلاقة الكاملة 🚀
          </p>

          <div style={{ ...fd(0.26), display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link href="/courses" style={{
              display: 'inline-flex', alignItems: 'center',
              background: G, color: '#fff',
              padding: '14px 40px', borderRadius: 14,
              fontSize: '1rem', fontWeight: 900,
              textDecoration: 'none', fontFamily: F,
              boxShadow: '0 6px 28px rgba(34,197,94,.4)',
              transition: 'transform .18s, box-shadow .18s',
            }}
            onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='scale(1.05)';t.style.boxShadow='0 10px 36px rgba(34,197,94,.55)'}}
            onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='none';t.style.boxShadow='0 6px 28px rgba(34,197,94,.4)'}}
            >ابدأ الآن</Link>

            <Link href="/courses/a0" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#fff', color: GL,
              border: '2px solid #22c55e',
              padding: '12px 28px', borderRadius: 14,
              fontSize: '0.95rem', fontWeight: 700,
              textDecoration: 'none', fontFamily: F,
              transition: 'background .18s, transform .18s',
            }}
            onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.background='#f0fdf4';t.style.transform='scale(1.04)'}}
            onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.background='#fff';t.style.transform='none'}}
            >جرب درس مجاني</Link>
          </div>

          {/* social proof */}
          <div style={{ ...fd(0.34), display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['👩‍🎓','🧑‍💻','👩‍🏫','🧑‍💼','🧕'].map((e,i) => (
                <div key={i} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `hsl(${i*55+120},65%,62%)`,
                  border: '2.5px solid #fff',
                  marginLeft: i ? -10 : 0, zIndex: 5-i,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>{e}</div>
              ))}
            </div>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 18 }}>
              <div style={{ fontWeight: 900, fontSize: '0.92rem', color: DARK, fontFamily: F }}>+1,000 طالب</div>
              <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: F }}>⭐⭐⭐⭐⭐ تقييم 4.9</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.92rem', color: DARK, fontFamily: F }}>97%</div>
              <div style={{ fontSize: '0.72rem', color: MUTED, fontFamily: F }}>نسبة الرضا</div>
            </div>
          </div>
        </div>

        {/* ── IMAGE SLIDER ── */}
        <div style={{
          flex: '1 1 300px', position: 'relative',
          minHeight: 440,
          opacity: on ? 1 : 0, transition: 'opacity .9s .2s ease',
        }}>
          {/* image card */}
          <div style={{
            width: '100%', height: 440,
            borderRadius: 28, overflow: 'hidden', position: 'relative',
            boxShadow: '0 28px 72px rgba(0,0,0,.16)',
            border: '1.5px solid #e2e8f0',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.label}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                display: 'block',
                opacity: fade ? 0 : 1,
                transform: fade ? 'scale(1.05)' : 'scale(1)',
                transition: 'opacity .38s ease, transform .38s ease',
              }}
            />
            {/* gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg,transparent 55%,rgba(0,0,0,.55) 100%)',
              pointerEvents: 'none',
            }}/>
            {/* label pill */}
            <div style={{
              position: 'absolute', bottom: 22, right: 22,
              background: img.accent, color: '#fff',
              fontSize: '0.78rem', fontWeight: 800,
              padding: '6px 16px', borderRadius: 99,
              fontFamily: F,
              opacity: fade ? 0 : 1,
              transform: fade ? 'translateY(8px)' : 'none',
              transition: 'opacity .35s .06s, transform .35s .06s',
            }}>
              {img.label}
            </div>

            {/* arrows */}
            {[0, 1].map(si => (
              <button key={si} onClick={() => go(si === 0 ? (idx - 1 + HERO_IMAGES.length) % HERO_IMAGES.length : (idx + 1) % HERO_IMAGES.length)} style={{
                position: 'absolute', top: '50%',
                [si === 0 ? 'right' : 'left']: 14,
                transform: 'translateY(-50%)',
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,.22)',
                border: '1px solid rgba(255,255,255,.4)',
                color: '#fff', cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                transition: 'background .15s',
              }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.4)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.22)'}}
              >{si === 0 ? '›' : '‹'}</button>
            ))}
          </div>

          {/* dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {HERO_IMAGES.map((im, i) => (
              <button key={i} onClick={() => go(i)} style={{
                width: i === idx ? 28 : 9, height: 9,
                borderRadius: 5, border: 'none', cursor: 'pointer', padding: 0,
                background: i === idx ? im.accent : '#cbd5e1',
                transition: 'width .32s ease, background .28s',
              }}/>
            ))}
          </div>

          {/* floating badges */}
          <div className="float-2" style={{
            position: 'absolute', top: 24, right: -16,
            background: '#fff', borderRadius: 16, padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,.12)',
            display: 'flex', alignItems: 'center', gap: 9, fontFamily: F,
            border: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: '1.4rem' }}>💬</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.76rem', color: DARK }}>محادثة حقيقية</div>
              <div style={{ fontSize: '0.66rem', color: MUTED }}>من أول درس</div>
            </div>
          </div>

          <div className="float-3" style={{
            position: 'absolute', top: 120, left: -16,
            background: '#fff', borderRadius: 16, padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,.12)',
            display: 'flex', alignItems: 'center', gap: 9, fontFamily: F,
            border: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: '1.4rem' }}>🔊</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.76rem', color: DARK }}>نطق صحيح</div>
              <div style={{ fontSize: '0.66rem', color: MUTED }}>صوت + تكرار</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   2. STATS STRIP
══════════════════════════════════════════════ */
const STATS_V2 = [
  {
    icon: '👥',
    val: '+1,200',
    lbl: 'طالب نشط',
    sub: 'من المغرب والعالم العربي',
    gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    glow: 'rgba(37,99,235,.3)',
  },
  {
    icon: '⭐',
    val: '4.9 / 5',
    lbl: 'تقييم المتعلمين',
    sub: 'بناءً على آراء الطلاب',
    gradient: 'linear-gradient(135deg,#ca8a04,#facc15)',
    glow: 'rgba(202,138,4,.3)',
  },
  {
    icon: '🚀',
    val: '97%',
    lbl: 'نسبة التقدم',
    sub: 'من الطلاب يُكملون دوراتهم',
    gradient: 'linear-gradient(135deg,#16a34a,#22c55e)',
    glow: 'rgba(22,163,74,.3)',
  },
  {
    icon: '🎓',
    val: 'A0 → C1',
    lbl: 'جميع المستويات',
    sub: 'منهج كامل ومتكامل',
    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    glow: 'rgba(124,58,237,.3)',
  },
]

function StatCard({ s, i, vis }: { s: typeof STATS_V2[number]; i: number; vis: boolean }) {
  const [h, sH] = useState(false)
  return (
    <div
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: '32px 24px 28px',
        border: `1.5px solid ${h ? 'transparent' : '#f1f5f9'}`,
        boxShadow: h
          ? `0 20px 48px ${s.glow}, 0 0 0 1.5px rgba(0,0,0,.06)`
          : '0 2px 16px rgba(0,0,0,.05)',
        opacity: vis ? 1 : 0,
        transform: vis ? (h ? 'translateY(-6px)' : 'none') : 'translateY(28px)',
        transition: `opacity .6s ${i * .12}s ease, transform .28s ease, box-shadow .28s ease, border-color .28s ease`,
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: s.gradient, borderRadius: '24px 24px 0 0',
        opacity: h ? 1 : 0.5,
        transition: 'opacity .28s',
      }}/>

      {/* icon circle */}
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: s.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', marginBottom: 18,
        boxShadow: `0 6px 20px ${s.glow}`,
        transform: h ? 'scale(1.1) rotate(-4deg)' : 'none',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {s.icon}
      </div>

      {/* value */}
      <div style={{
        fontWeight: 900,
        fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
        color: DARK, fontFamily: F,
        lineHeight: 1, marginBottom: 8,
      }}>
        {s.val}
      </div>

      {/* label */}
      <div style={{
        fontWeight: 700, fontSize: '0.95rem',
        color: DARK, fontFamily: F, marginBottom: 6,
      }}>
        {s.lbl}
      </div>

      {/* sub */}
      <div style={{
        fontSize: '0.78rem', color: MUTED,
        fontFamily: F, fontWeight: 400, lineHeight: 1.5,
      }}>
        {s.sub}
      </div>

      {/* bg glow on hover */}
      <div style={{
        position: 'absolute', bottom: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: s.gradient, opacity: h ? 0.08 : 0,
        transition: 'opacity .3s', pointerEvents: 'none',
        filter: 'blur(20px)',
      }}/>
    </div>
  )
}

function StatsStrip() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* heading */}
        <div ref={ref} style={{
          textAlign: 'center', marginBottom: 48,
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(16px)',
          transition: 'opacity .5s, transform .5s',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1.5px solid #e2e8f0',
            borderRadius: 99, padding: '6px 20px', marginBottom: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,.05)',
          }}>
            <span style={{ fontSize: '1rem' }}>📊</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: MUTED, fontFamily: F }}>أرقام حقيقية من طلابنا</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
            fontWeight: 900, color: DARK, fontFamily: F,
            marginBottom: 10,
          }}>
            منصة تعليمية بنتائج حقيقية
          </h2>
          <p style={{ color: MUTED, fontFamily: F, fontWeight: 400 }}>
            انضم لآلاف الطلاب الذين غيّروا مستواهم معنا
          </p>
        </div>

        {/* cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 20,
        }}>
          {STATS_V2.map((s, i) => <StatCard key={i} s={s} i={i} vis={vis} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   3. FEATURES
══════════════════════════════════════════════ */
function FeatureCard({ f, i, vis }: { f:typeof FEATURES[number]; i:number; vis:boolean }) {
  const [h, sH] = useState(false)
  return (
    <div
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        background:'#fff',
        border:`2px solid ${h?f.border:'#f1f5f9'}`,
        borderRadius:24, padding:'36px 28px',
        textAlign:'center',
        opacity: vis?1:0,
        transform: vis?(h?'translateY(-8px) scale(1.02)':'none'):'translateY(26px)',
        boxShadow: h?`0 20px 48px rgba(0,0,0,.10)`:'0 2px 16px rgba(0,0,0,.04)',
        transition:`opacity .55s ${i*.1}s, transform .25s ease, border-color .2s, box-shadow .25s`,
        cursor:'default',
      }}
    >
      <div style={{
        width:68, height:68, borderRadius:20,
        background:f.color, margin:'0 auto 18px',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'2rem',
        boxShadow:`0 4px 16px rgba(0,0,0,.07)`,
      }}>{f.icon}</div>
      <p style={{ fontWeight:800, fontSize:'1.02rem', color:DARK, marginBottom:10, fontFamily:F }}>{f.title}</p>
      <p style={{ color:MUTED, fontSize:'0.875rem', fontWeight:400, lineHeight:1.7, fontFamily:F }}>{f.desc}</p>
    </div>
  )
}

function FeaturesSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#f8fafc', padding:'80px 24px' }}>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>
        <div ref={ref} style={{
          textAlign:'center', marginBottom:52,
          opacity:vis?1:0, transform:vis?'none':'translateY(18px)',
          transition:'opacity .5s, transform .5s',
        }}>
          <Tag>✨ لماذا نحن مختلفون</Tag>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)', fontWeight:900, color:DARK, fontFamily:F, marginTop:4 }}>
            طريقة تعلم تختلف عن كل شيء جربته
          </h2>
          <p style={{ color:MUTED, fontFamily:F, marginTop:10 }}>نهج عملي مبني على المحادثة والتطبيق اليومي</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:20 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} vis={vis} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   4. COURSES
══════════════════════════════════════════════ */
function CourseCard({ c, i }: { c: typeof COURSES[number]; i: number }) {
  const { ref, vis } = useVisible(0.08)
  const [h, sH] = useState(false)

  const isFeatured = c.featured
  const canHover   = h && c.open

  return (
    <div
      ref={ref}
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
      style={{
        background: '#fff',
        border: `${isFeatured ? '2.5px' : '1.5px'} solid ${canHover || isFeatured ? G : '#f1f5f9'}`,
        borderRadius: 24,
        padding: isFeatured ? '40px 40px' : '28px 26px',
        opacity: vis ? (c.open ? 1 : 0.5) : 0,
        transform: vis
          ? (canHover ? 'translateY(-8px) scale(1.015)' : 'none')
          : 'translateY(28px)',
        boxShadow: isFeatured
          ? (canHover
            ? '0 28px 64px rgba(34,197,94,.25)'
            : '0 12px 48px rgba(34,197,94,.18)')
          : (canHover
            ? '0 16px 40px rgba(0,0,0,.10)'
            : '0 2px 12px rgba(0,0,0,.04)'),
        transition: `opacity .55s ${i * .07}s ease, transform .25s ease, box-shadow .25s ease, border-color .2s ease`,
        display: 'flex',
        flexDirection: isFeatured ? 'row' : 'column',
        alignItems: isFeatured ? 'center' : undefined,
        gap: isFeatured ? 48 : undefined,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: isFeatured ? 5 : 3,
        background: c.open
          ? `linear-gradient(90deg, ${GL}, ${G})`
          : '#e2e8f0',
        borderRadius: '24px 24px 0 0',
      }}/>

      {/* featured badge */}
      {isFeatured && (
        <div style={{
          position: 'absolute', top: 16, right: 20,
          background: 'linear-gradient(135deg,#ff6b35,#f59e0b)',
          color: '#fff', fontSize: '0.72rem', fontWeight: 800,
          padding: '4px 14px', borderRadius: 99, fontFamily: F,
          boxShadow: '0 3px 10px rgba(255,107,53,.4)',
        }}>
          🔥 الأكثر طلباً
        </div>
      )}

      {isFeatured ? (
        <>
          {/* featured LEFT col: info */}
          <div style={{ flex: 1, minWidth: 0, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                background: '#dcfce7', color: GL,
                fontWeight: 900, fontSize: '0.9rem',
                padding: '5px 14px', borderRadius: 10, fontFamily: F,
              }}>
                {c.level}
              </span>
            </div>
            <p style={{ fontWeight: 900, fontSize: '1.35rem', color: DARK, marginBottom: 10, fontFamily: F }}>
              {c.title}
            </p>
            <p style={{ color: MUTED, fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, marginBottom: 20, fontFamily: F }}>
              {c.desc}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#f0fdf4', color: GL, fontSize: '0.78rem', padding: '5px 14px', borderRadius: 8, fontFamily: F, fontWeight: 600 }}>
                ⏱ {c.dur}
              </span>
              <span style={{ background: '#f8fafc', color: MUTED, fontSize: '0.78rem', padding: '5px 14px', borderRadius: 8, fontFamily: F, fontWeight: 600 }}>
                بدون قواعد مملة
              </span>
              <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', padding: '5px 14px', borderRadius: 8, fontFamily: F, fontWeight: 600 }}>
                🎯 للمبتدئين تماماً
              </span>
            </div>
          </div>

          {/* featured RIGHT col: price + CTA */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 16, flexShrink: 0,
            background: '#f0fdf4', borderRadius: 20,
            padding: '32px 36px',
          }}>
            <p style={{ color: MUTED, fontSize: '0.82rem', fontFamily: F, fontWeight: 500, margin: 0 }}>السعر</p>
            <span style={{ fontWeight: 900, fontSize: '1.7rem', color: DARK, fontFamily: F }}>
              {c.price}
            </span>
            <Link
              href={`/courses/${c.level.toLowerCase()}`}
              style={{
                background: `linear-gradient(135deg,${GL},${G})`,
                color: '#fff',
                padding: '13px 36px',
                borderRadius: 14,
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none', fontFamily: F,
                boxShadow: '0 4px 20px rgba(34,197,94,.4)',
                transition: 'transform .15s, box-shadow .15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = 'scale(1.06)'; t.style.boxShadow = '0 8px 28px rgba(34,197,94,.55)' }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = 'none'; t.style.boxShadow = '0 4px 20px rgba(34,197,94,.4)' }}
            >
              ابدأ الآن 🚀
            </Link>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: F, margin: 0 }}>✓ ضمان استرداد 7 أيام</p>
          </div>
        </>
      ) : (
        <>
          {/* normal card content */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 12 }}>
            <span style={{
              background: c.open ? '#dcfce7' : '#f1f5f9',
              color: c.open ? GL : '#94a3b8',
              fontWeight: 900, fontSize: '0.9rem',
              padding: '5px 14px', borderRadius: 10, fontFamily: F,
            }}>
              {c.level}
            </span>
            {!c.open && (
              <span style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 8, fontFamily: F }}>
                قريباً
              </span>
            )}
          </div>

          <p style={{ fontWeight: 900, fontSize: '1.05rem', color: DARK, marginBottom: 8, fontFamily: F }}>
            {c.title}
          </p>

          <p style={{ color: MUTED, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.7, marginBottom: 18, fontFamily: F }}>
            {c.desc}
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
            <span style={{ background: '#f0fdf4', color: GL, fontSize: '0.75rem', padding: '4px 12px', borderRadius: 8, fontFamily: F, fontWeight: 600 }}>
              ⏱ {c.dur}
            </span>
            <span style={{ background: '#f8fafc', color: MUTED, fontSize: '0.75rem', padding: '4px 12px', borderRadius: 8, fontFamily: F, fontWeight: 600 }}>
              بدون قواعد مملة
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: DARK, fontFamily: F }}>
              {c.price}
            </span>
            {c.open ? (
              <Link
                href={`/courses/${c.level.toLowerCase()}`}
                style={{
                  background: `linear-gradient(135deg,${GL},${G})`,
                  color: '#fff',
                  padding: '9px 22px',
                  borderRadius: 12,
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  textDecoration: 'none', fontFamily: F,
                  boxShadow: '0 4px 16px rgba(34,197,94,.38)',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = 'scale(1.06)'; t.style.boxShadow = '0 8px 24px rgba(34,197,94,.5)' }}
                onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = 'none'; t.style.boxShadow = '0 4px 16px rgba(34,197,94,.38)' }}
              >
                ابدأ الآن
              </Link>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: F }}>قريباً</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CoursesSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background: '#f8fafc', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* heading */}
        <div ref={ref} style={{
          textAlign: 'center', marginBottom: 56,
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(18px)',
          transition: 'opacity .5s, transform .5s',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#dcfce7', borderRadius: 99,
            padding: '5px 18px', marginBottom: 16,
          }}>
            <span style={{ fontSize: '0.9rem' }}>📚</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: GL, fontFamily: F }}>الدورات</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
            fontWeight: 900, color: DARK, fontFamily: F, marginBottom: 12,
          }}>
            اختر مستواك وابدأ رحلتك
          </h2>
          <p style={{ color: MUTED, fontFamily: F, fontWeight: 400 }}>
            6 مستويات من الصفر إلى الاحتراف الكامل — كل دورة بدون قواعد مملة
          </p>
        </div>

        {/* featured card — full width */}
        <div style={{ marginBottom: 24 }}>
          <CourseCard c={COURSES[0]} i={0} />
        </div>

        {/* remaining 5 cards — 3 col grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
        className="courses-grid"
        >
          {COURSES.slice(1).map((c, i) => <CourseCard key={c.level} c={c} i={i + 1} />)}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   5. LEARN ANYWHERE
══════════════════════════════════════════════ */
function LearnAnywhereSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', padding:'80px 24px', overflow:'hidden', position:'relative' }}>
      {/* bg glow */}
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,.15),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,.12),transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1040, margin:'0 auto' }} ref={ref}>
        <div style={{
          display:'flex', alignItems:'center',
          gap:64, flexWrap:'wrap',
        }}>
          {/* phones visual */}
          <div style={{
            flex:'1 1 280px', display:'flex', justifyContent:'center',
            gap:20, alignItems:'flex-end',
            opacity:vis?1:0, transform:vis?'none':'translateX(-30px)',
            transition:'opacity .65s ease, transform .65s ease',
          }}>
            {[
              { emoji:'🎙️', label:'درس صوتي',  bg:'linear-gradient(135deg,#dcfce7,#bbf7d0)', h:220 },
              { emoji:'💬', label:'محادثة',    bg:'linear-gradient(135deg,#dbeafe,#bfdbfe)', h:260 },
              { emoji:'🏆', label:'إنجازاتك',  bg:'linear-gradient(135deg,#fdf4ff,#f3e8ff)', h:200 },
            ].map((p,i) => (
              <div key={i} className={i===1?'float-1':'float-2'} style={{
                width:90, height:p.h, borderRadius:24,
                background:p.bg, display:'flex',
                flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:10,
                boxShadow:'0 16px 40px rgba(0,0,0,.25)',
                border:'1px solid rgba(255,255,255,.2)',
              }}>
                <span style={{ fontSize:'2rem' }}>{p.emoji}</span>
                <span style={{ fontSize:'0.65rem', fontWeight:700, color:DARK, fontFamily:F }}>{p.label}</span>
              </div>
            ))}
          </div>

          {/* text */}
          <div style={{
            flex:'1 1 300px', textAlign:'right',
            opacity:vis?1:0, transform:vis?'none':'translateX(30px)',
            transition:'opacity .65s .15s ease, transform .65s .15s ease',
          }} dir="rtl">
            <Tag>📱 تعلم مرن</Tag>
            <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.3rem)', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:18, fontFamily:F }}>
              تعلم في أي وقت<br/>
              <span style={{ color:G }}>وفي أي مكان</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,.72)', lineHeight:1.9, marginBottom:36, fontFamily:F, fontWeight:400 }}>
              من هاتفك أو حاسوبك — دروسك دائماً معك.<br/>
              5 دقائق كافية لتتقدم كل يوم.
            </p>
            <GBtn href="/courses">اكتشف الدورات</GBtn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   6. TESTIMONIALS
══════════════════════════════════════════════ */
function TestimonialsSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#f8fafc', padding:'80px 24px' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>
        <div ref={ref} style={{
          textAlign:'center', marginBottom:52,
          opacity:vis?1:0, transform:vis?'none':'translateY(18px)',
          transition:'opacity .5s, transform .5s',
        }}>
          <Tag color="#fef9c3" text="#92400e">💬 قالوا عنا</Tag>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)', fontWeight:900, color:DARK, fontFamily:F, marginTop:4 }}>
            طلابنا يتكلمون بثقة الآن
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:22 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background:'#fff', borderRadius:24,
              padding:'32px 28px',
              border:'1.5px solid #e2e8f0',
              boxShadow:'0 4px 20px rgba(0,0,0,.05)',
              opacity:vis?1:0,
              transform:vis?'none':'translateY(24px)',
              transition:`opacity .55s ${i*.1}s, transform .55s ${i*.1}s`,
            }}>
              <div style={{ fontSize:'1rem', color:'#f59e0b', marginBottom:14, letterSpacing:2 }}>
                {'⭐'.repeat(t.stars)}
              </div>
              <p style={{ color:DARK, fontWeight:500, lineHeight:1.75, marginBottom:20, fontFamily:F, fontSize:'0.95rem' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:12, direction:'rtl' }}>
                <div style={{
                  width:42, height:42, borderRadius:'50%',
                  background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.3rem',
                }}>{t.flag}</div>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:DARK, fontFamily:F }}>{t.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   7. MAP
══════════════════════════════════════════════ */
function MapSection() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#fff', padding:'80px 24px' }}>
      <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center' }}>
        <div ref={ref} style={{
          opacity:vis?1:0, transform:vis?'none':'translateY(18px)',
          transition:'opacity .5s, transform .5s', marginBottom:60,
        }}>
          <Tag color="#dcfce7">🗺️ رحلة التعلم</Tag>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)', fontWeight:900, color:DARK, fontFamily:F, marginTop:4, marginBottom:12 }}>
            رحلتك من الصفر للاحتراف
          </h2>
          <p style={{ color:MUTED, fontFamily:F }}>تبدأ من وادي زم وتصل إلى مراكش — خطوة خطوة</p>
        </div>

        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'center', flexWrap:'wrap', rowGap:16,
        }}>
          {MAP_NODES.map((n, i) => {
            const done    = n.state === 'done'
            const current = n.state === 'current'
            const locked  = n.state === 'locked'
            const bg      = done?G : current?B : '#e2e8f0'
            const fg      = locked?'#94a3b8':'#fff'
            return (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{
                  display:'flex', flexDirection:'column',
                  alignItems:'center', gap:12,
                  opacity:vis?1:0, transform:vis?'none':'scale(.65)',
                  transition:`opacity .55s ${.15+i*.13}s, transform .55s ${.15+i*.13}s`,
                }}>
                  {/* node */}
                  <div
                    className={current?'node-pulse':''}
                    style={{
                      width:76, height:76, borderRadius:'50%',
                      background:bg, color:fg,
                      display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center',
                      fontWeight:900, fontFamily:F,
                      border:`3px solid ${locked?'#e2e8f0':bg}`,
                      filter:locked?'grayscale(1) opacity(.5)':'none',
                      boxShadow: done?`0 6px 20px ${G}55` : current?`0 6px 20px ${B}55`:'none',
                    }}
                  >
                    <span style={{ fontSize:'1.4rem' }}>{n.emoji}</span>
                    <span style={{ fontSize:'0.68rem', fontWeight:700, marginTop:2 }}>{n.level}</span>
                  </div>
                  <span style={{
                    fontSize:'0.78rem', color:locked?'#94a3b8':MUTED,
                    fontFamily:F, fontWeight:600, whiteSpace:'nowrap',
                  }}>{n.city}</span>
                </div>

                {i < MAP_NODES.length - 1 && (
                  <div style={{
                    width:56, height:3, marginBottom:32, borderRadius:2,
                    background: i<1?`linear-gradient(90deg,${G},${G})`:
                                i===1?`linear-gradient(90deg,${G},${B})`:'#e2e8f0',
                    opacity:vis?1:0,
                    transition:`opacity .5s ${.3+i*.13}s`,
                  }}/>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop:56 }}>
          <GBtn href="/map">ابدأ الرحلة 🗺️</GBtn>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   8. FINAL CTA
══════════════════════════════════════════════ */
function FinalCTA() {
  const { ref, vis } = useVisible()
  return (
    <section style={{
      background:'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #16a34a 80%, #22c55e 100%)',
      padding:'100px 24px', textAlign:'center',
      overflow:'hidden', position:'relative',
    }}>
      {/* decorative circles */}
      {[
        { top:-100, left:-80,  size:400, op:.06 },
        { top:40,   right:-80, size:300, op:.07 },
        { bottom:-80, left:'40%', size:350, op:.05 },
      ].map((c,i) => (
        <div key={i} style={{
          position:'absolute', width:c.size, height:c.size,
          borderRadius:'50%', background:`rgba(255,255,255,${c.op})`,
          top:c.top, left:c.left, right:(c as {right?:number}).right,
          bottom:(c as {bottom?:number}).bottom,
          pointerEvents:'none',
        }}/>
      ))}

      <div ref={ref} style={{
        maxWidth:620, margin:'0 auto', position:'relative', zIndex:1,
        opacity:vis?1:0, transform:vis?'none':'translateY(24px)',
        transition:'opacity .65s, transform .65s',
      }}>
        <div style={{ fontSize:'3.5rem', marginBottom:20, animation:'bounce-light 2.2s ease-in-out infinite' }}>🚀</div>
        <h2 style={{
          fontSize:'clamp(1.9rem,5vw,3.1rem)',
          fontWeight:900, color:'#fff',
          lineHeight:1.12, marginBottom:18, fontFamily:F,
        }}>
          ابدأ الآن وابدأ<br/>رحلتك للطلاقة
        </h2>
        <p style={{
          color:'rgba(255,255,255,.8)', fontSize:'1.05rem',
          marginBottom:44, fontWeight:400, fontFamily:F, lineHeight:1.85,
        }}>
          انضم لأكثر من 1,200 طالب يتعلمون الآن —<br/>
          لا يوجد وقت أفضل من هذه اللحظة ✨
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/courses" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            background:'#fff', color:GL,
            padding:'17px 56px', borderRadius:18,
            fontSize:'1.05rem', fontWeight:900,
            textDecoration:'none', fontFamily:F,
            boxShadow:'0 8px 36px rgba(0,0,0,.22)',
            transition:'transform .18s, box-shadow .18s',
          }}
          onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='scale(1.06)';t.style.boxShadow='0 14px 44px rgba(0,0,0,.3)'}}
          onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.transform='none';t.style.boxShadow='0 8px 36px rgba(0,0,0,.22)'}}
          >
            ابدأ الآن مجاناً
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main dir="rtl" style={{ fontFamily:F, background:'#fff', color:DARK }}>
      <Hero />
      <StatsStrip />
      <FeaturesSection />
      <CoursesSection />
      <LearnAnywhereSection />
      <TestimonialsSection />
      <MapSection />
      <FinalCTA />
    </main>
  )
}
