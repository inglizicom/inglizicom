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
  { level:'A0', title:'المبتدئ المطلق',   desc:'ابدأ من الصفر الحقيقي',              dur:'3 أسابيع', price:'99 درهم',  clr:'#dcfce7', bc:G, open:true  },
  { level:'A1', title:'الأساسيات',        desc:'أول جمل وتعبيرات حقيقية',            dur:'4 أسابيع', price:'149 درهم', clr:'#dbeafe', bc:B, open:true  },
  { level:'A2', title:'المحادثة اليومية', desc:'تحدث في المواقف اليومية بسهولة',     dur:'5 أسابيع', price:'149 درهم', clr:'#fdf4ff', bc:P, open:true  },
  { level:'B1', title:'المتوسط',          desc:'أفكار ومواقف ومشاعر بالإنجليزية',    dur:'6 أسابيع', price:'199 درهم', clr:'#fff7ed', bc:O, open:true  },
  { level:'B2', title:'فوق المتوسط',      desc:'نقاش وفهم عميق لأي موضوع',           dur:'7 أسابيع', price:'249 درهم', clr:'#fef9c3', bc:'#ca8a04', open:false },
  { level:'C1', title:'الاحتراف',         desc:'طلاقة كاملة في كل المجالات',          dur:'8 أسابيع', price:'299 درهم', clr:'#fce7f3', bc:'#db2777', open:false },
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
   1. HERO SLIDER
══════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=680&h=780&fit=crop&q=80',
    tag: '🎉 الأكثر استخداماً في المغرب',
    title: 'تعلم الإنجليزية',
    titleGreen: 'بالمحادثة',
    sub: 'بدون قواعد مملة — فقط كلام حقيقي كل يوم من الصفر حتى الطلاقة الكاملة',
    cta1: { label: 'ابدأ الآن مجاناً', href: '/courses' },
    cta2: { label: 'جرب درس مجاني', href: '/courses/a0' },
    accent: '#3b82f6',
  },
  {
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #16a34a 100%)',
    image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=680&h=780&fit=crop&q=80',
    tag: '🚀 تقدم سريع وملحوظ',
    title: 'تحدث الإنجليزية',
    titleGreen: 'بثقة كاملة',
    sub: 'ابدأ بالتحدث من الدرس الأول — منهج مُصمَّم للنتائج السريعة بدون إضاعة الوقت',
    cta1: { label: 'ابدأ رحلتك', href: '/courses' },
    cta2: { label: 'اكتشف المنهج', href: '/map' },
    accent: '#22c55e',
  },
  {
    bg: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 50%, #9333ea 100%)',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=680&h=780&fit=crop&q=80',
    tag: '🏆 +1000 طالب متخرج',
    title: 'من وادي زم',
    titleGreen: 'إلى الاحتراف',
    sub: 'انضم لأكثر من ألف طالب أنهوا دوراتهم وأصبحوا يتحدثون الإنجليزية بطلاقة',
    cta1: { label: 'انضم الآن', href: '/courses' },
    cta2: { label: 'شاهد القصص', href: '/blog' },
    accent: '#a855f7',
  },
]

function Hero() {
  const [idx, setIdx]       = useState(0)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const go = (next: number) => {
    if (fading) return
    setFading(true)
    setTimeout(() => { setIdx(next); setFading(false) }, 420)
  }

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % HERO_SLIDES.length), 5500)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, fading])

  const s = HERO_SLIDES[idx]

  const textStyle: React.CSSProperties = {
    opacity:   fading ? 0 : (mounted ? 1 : 0),
    transform: fading ? 'translateY(16px)' : (mounted ? 'none' : 'translateY(24px)'),
    transition: fading
      ? 'opacity .4s ease, transform .4s ease'
      : 'opacity .75s .05s ease, transform .75s .05s ease',
  }

  const imgStyle: React.CSSProperties = {
    opacity:   fading ? 0 : (mounted ? 1 : 0),
    transform: fading ? 'scale(.93) translateX(20px)' : (mounted ? 'scale(1) translateX(0)' : 'scale(.93) translateX(20px)'),
    transition: fading
      ? 'opacity .4s ease, transform .4s ease'
      : 'opacity .8s .1s ease, transform .8s .1s ease',
  }

  return (
    <section style={{
      background: s.bg,
      transition: 'background .6s ease',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      paddingTop: 68, /* header height */
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ── bg decorative circles ── */}
      <div style={{
        position:'absolute', top:-140, right:-100, width:520, height:520,
        borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:-80, left:-80, width:360, height:360,
        borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none',
      }}/>

      {/* ── main content ── */}
      <div style={{
        flex: 1, maxWidth: 1140, margin: '0 auto',
        padding: '60px 28px 48px',
        display: 'flex', alignItems: 'center',
        gap: 64, flexWrap: 'wrap',
        width: '100%',
      }}>

        {/* TEXT */}
        <div style={{ flex: '1 1 360px', textAlign: 'right' }} dir="rtl">
          {/* tag */}
          <div style={{ ...textStyle, marginBottom: 20 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,.18)',
              border: '1px solid rgba(255,255,255,.3)',
              color: '#fff',
              fontSize: '0.8rem', fontWeight: 700,
              padding: '6px 18px', borderRadius: 99, fontFamily: F,
              backdropFilter: 'blur(8px)',
            }}>
              {s.tag}
            </span>
          </div>

          {/* title */}
          <h1 style={{
            ...textStyle,
            fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
            fontWeight: 900, lineHeight: 1.1,
            color: '#fff', fontFamily: F,
            marginBottom: 20,
            transitionDelay: fading ? '0s' : '.08s',
          }}>
            {s.title}<br/>
            <span style={{
              background: `linear-gradient(90deg, #fff, ${s.accent === '#22c55e' ? '#4ade80' : s.accent === '#a855f7' ? '#d8b4fe' : '#93c5fd'})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {s.titleGreen}
            </span>
          </h1>

          {/* subtitle */}
          <p style={{
            ...textStyle,
            fontSize: '1.08rem', color: 'rgba(255,255,255,.8)',
            lineHeight: 1.85, marginBottom: 40,
            fontFamily: F, fontWeight: 400,
            maxWidth: 460,
            transitionDelay: fading ? '0s' : '.14s',
          }}>
            {s.sub}
          </p>

          {/* buttons */}
          <div style={{
            ...textStyle,
            display: 'flex', gap: 14, flexWrap: 'wrap',
            marginBottom: 48,
            transitionDelay: fading ? '0s' : '.2s',
          }}>
            <Link href={s.cta1.href} style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#fff', color: DARK,
              padding: '14px 36px', borderRadius: 14,
              fontSize: '0.98rem', fontWeight: 900,
              textDecoration: 'none', fontFamily: F,
              boxShadow: '0 6px 24px rgba(0,0,0,.25)',
              transition: 'transform .18s, box-shadow .18s',
            }}
            onMouseEnter={e => { const t=e.currentTarget as HTMLElement; t.style.transform='scale(1.05)'; t.style.boxShadow='0 10px 32px rgba(0,0,0,.35)' }}
            onMouseLeave={e => { const t=e.currentTarget as HTMLElement; t.style.transform='none'; t.style.boxShadow='0 6px 24px rgba(0,0,0,.25)' }}
            >
              {s.cta1.label}
            </Link>

            <Link href={s.cta2.href} style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,.15)',
              border: '1.5px solid rgba(255,255,255,.4)',
              color: '#fff',
              padding: '13px 28px', borderRadius: 14,
              fontSize: '0.95rem', fontWeight: 700,
              textDecoration: 'none', fontFamily: F,
              backdropFilter: 'blur(8px)',
              transition: 'background .18s, transform .18s',
            }}
            onMouseEnter={e => { const t=e.currentTarget as HTMLElement; t.style.background='rgba(255,255,255,.25)'; t.style.transform='scale(1.04)' }}
            onMouseLeave={e => { const t=e.currentTarget as HTMLElement; t.style.background='rgba(255,255,255,.15)'; t.style.transform='none' }}
            >
              {s.cta2.label}
            </Link>
          </div>

          {/* social proof */}
          <div style={{
            ...textStyle,
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            transitionDelay: fading ? '0s' : '.28s',
          }}>
            {/* avatars */}
            <div style={{ display: 'flex' }}>
              {['👩‍🎓','🧑‍💻','👩‍🏫','🧑‍💼','🧕'].map((e, i) => (
                <div key={i} style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `hsl(${i*55+200},65%,60%)`,
                  border: '2.5px solid rgba(255,255,255,.5)',
                  marginLeft: i ? -12 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', position: 'relative', zIndex: 5 - i,
                }}>{e}</div>
              ))}
            </div>

            <div style={{ borderRight: '1px solid rgba(255,255,255,.25)', paddingRight: 18 }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', fontFamily: F }}>+1,000 طالب</div>
              <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,.72)', fontFamily: F }}>⭐⭐⭐⭐⭐ تقييم 4.9</div>
            </div>

            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', fontFamily: F }}>97%</div>
              <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,.72)', fontFamily: F }}>نسبة الرضا</div>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div style={{
          flex: '1 1 300px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', minHeight: 380,
        }}>
          <div style={{
            ...imgStyle,
            width: 340, height: 400,
            borderRadius: 36,
            background: '#0f172a',
            boxShadow: '0 40px 100px rgba(0,0,0,.45)',
            border: '1.5px solid rgba(255,255,255,.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt="student"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                display: 'block',
              }}
            />
            {/* shimmer overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.35) 100%)',
              pointerEvents: 'none',
            }}/>
          </div>

          {/* floating badge — streak */}
          <div className="float-2" style={{
            position: 'absolute', top: 24, right: -8,
            background: '#fff', borderRadius: 18,
            padding: '12px 18px',
            boxShadow: '0 10px 36px rgba(0,0,0,.18)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: F,
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: DARK }}>سلسلة 12 يوم!</div>
              <div style={{ fontSize: '0.68rem', color: MUTED }}>استمر هكذا</div>
            </div>
          </div>

          {/* floating badge — achievement */}
          <div className="float-3" style={{
            position: 'absolute', bottom: 48, left: -8,
            background: '#fff', borderRadius: 18,
            padding: '12px 18px',
            boxShadow: '0 10px 36px rgba(0,0,0,.18)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: F,
          }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: DARK }}>إنجاز جديد!</div>
              <div style={{ fontSize: '0.68rem', color: MUTED }}>أكملت A1 ✅</div>
            </div>
          </div>

          {/* floating badge — students */}
          <div className="float-1" style={{
            position: 'absolute', bottom: 10, right: 12,
            background: s.accent,
            borderRadius: 14, padding: '9px 16px',
            boxShadow: `0 6px 22px rgba(0,0,0,.25)`,
            fontFamily: F,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>👥 +1,000 طالب معنا</div>
          </div>
        </div>
      </div>

      {/* ── DOTS + ARROWS ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 20,
        paddingBottom: 36,
      }}>
        {/* prev */}
        <button onClick={() => go((idx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,.18)',
          border: '1px solid rgba(255,255,255,.3)',
          color: '#fff', cursor: 'pointer',
          fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.32)'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.18)'}}
        >›</button>

        {/* dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{
              width: i === idx ? 32 : 10, height: 10,
              borderRadius: 5, border: 'none', cursor: 'pointer', padding: 0,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.4)',
              transition: 'width .35s ease, background .3s',
            }}/>
          ))}
        </div>

        {/* next */}
        <button onClick={() => go((idx + 1) % HERO_SLIDES.length)} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,.18)',
          border: '1px solid rgba(255,255,255,.3)',
          color: '#fff', cursor: 'pointer',
          fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.32)'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.18)'}}
        >‹</button>
      </div>

      {/* slide counter */}
      <div style={{
        position: 'absolute', bottom: 40, left: 32,
        color: 'rgba(255,255,255,.55)',
        fontSize: '0.75rem', fontFamily: F, fontWeight: 600,
      }}>
        {idx + 1} / {HERO_SLIDES.length}
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
function CourseCard({ c, i }: { c:typeof COURSES[number]; i:number }) {
  const { ref, vis } = useVisible(0.08)
  const [h, sH] = useState(false)
  return (
    <div ref={ref}
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        background:'#fff',
        border:`2px solid ${h&&c.open?c.bc:'#f1f5f9'}`,
        borderRadius:26, padding:'32px 28px',
        opacity: vis?(c.open?1:.5):0,
        transform: vis?(h&&c.open?'translateY(-9px) scale(1.015)':'none'):'translateY(28px)',
        boxShadow: h&&c.open?`0 24px 56px rgba(0,0,0,.11)`:'0 2px 16px rgba(0,0,0,.04)',
        transition:`opacity .55s ${i*.07}s, transform .25s ease, border-color .2s, box-shadow .25s`,
        display:'flex', flexDirection:'column',
      }}
    >
      {/* top accent bar */}
      <div style={{
        height:5,
        background:c.open?`linear-gradient(90deg,${c.bc},${c.clr}aa)`:'#e2e8f0',
        marginTop:-32, marginLeft:-28, marginRight:-28, marginBottom:28,
        borderRadius:'24px 24px 0 0',
      }}/>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <span style={{
          background:c.clr, color:c.bc,
          fontWeight:900, fontSize:'0.9rem',
          padding:'5px 14px', borderRadius:10, fontFamily:F,
        }}>{c.level}</span>
        {!c.open && <span style={{ background:'#f1f5f9', color:'#94a3b8', fontSize:'0.72rem', padding:'3px 10px', borderRadius:8, fontFamily:F, fontWeight:600 }}>قريباً</span>}
      </div>

      <p style={{ fontWeight:800, fontSize:'1.08rem', color:DARK, marginBottom:6, fontFamily:F }}>{c.title}</p>
      <p style={{ color:MUTED, fontSize:'0.875rem', fontWeight:400, lineHeight:1.65, marginBottom:18, fontFamily:F }}>{c.desc}</p>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
        <span style={{ background:'#f0fdf4', color:GL, fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, fontFamily:F, fontWeight:600 }}>⏱ {c.dur}</span>
        <span style={{ background:'#eff6ff', color:B, fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, fontFamily:F, fontWeight:600 }}>بدون قواعد مملة</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
        <span style={{ fontWeight:900, fontSize:'1.1rem', color:DARK, fontFamily:F }}>{c.price}</span>
        {c.open ? (
          <Link href={`/courses/${c.level.toLowerCase()}`} style={{
            background:`linear-gradient(135deg,${c.bc},${c.clr})`,
            color: c.bc==='#ca8a04'||c.bc===O?'#fff':'#fff',
            padding:'9px 22px', borderRadius:12,
            fontSize:'0.875rem', fontWeight:800,
            textDecoration:'none', fontFamily:F,
            transition:'transform .15s, box-shadow .15s',
            boxShadow:`0 4px 14px ${c.bc}55`,
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.07)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none'}}
          >ابدأ الآن</Link>
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
    <section style={{ background:'#fff', padding:'80px 24px' }}>
      <div style={{ maxWidth:1040, margin:'0 auto' }}>
        <div ref={ref} style={{
          textAlign:'center', marginBottom:52,
          opacity:vis?1:0, transform:vis?'none':'translateY(18px)',
          transition:'opacity .5s, transform .5s',
        }}>
          <Tag color="#eff6ff" text={B}>📚 الدورات</Tag>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.2rem)', fontWeight:900, color:DARK, fontFamily:F, marginTop:4 }}>
            اختر مستواك وابدأ رحلتك
          </h2>
          <p style={{ color:MUTED, fontFamily:F, marginTop:10 }}>6 مستويات من الصفر إلى الاحتراف الكامل</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:22 }}>
          {COURSES.map((c, i) => <CourseCard key={c.level} c={c} i={i} />)}
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
