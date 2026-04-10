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
const STATS = [
  { icon:'🔥', val:'1,200+', lbl:'طالب نشط',       color:'#fff7ed', ic:'#ea580c' },
  { icon:'⭐', val:'4.9',    lbl:'تقييم المتعلمين', color:'#fefce8', ic:'#ca8a04' },
  { icon:'🚀', val:'97%',    lbl:'نسبة التقدم',     color:'#eff6ff', ic:B         },
  { icon:'🏆', val:'A0→C1', lbl:'جميع المستويات',  color:'#fdf4ff', ic:P         },
]

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

function OBtn({ href, children }: { href:string; children:React.ReactNode }) {
  const [h, sH] = useState(false)
  return (
    <Link href={href} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background: h?'#f0fdf4':'#fff', color:GL,
      border:`2px solid ${h?GL:G}`, padding:'11px 28px',
      borderRadius:16, fontSize:'0.95rem', fontWeight:800,
      textDecoration:'none', fontFamily:F,
      transform: h?'scale(1.04)':'none',
      transition:'all .18s ease',
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
   1. HERO
══════════════════════════════════════════════ */
function Hero() {
  const [on, setOn] = useState(false)
  useEffect(() => { const t = setTimeout(()=>setOn(true), 80); return ()=>clearTimeout(t) }, [])
  const fd = (d:number):React.CSSProperties => ({
    opacity: on?1:0,
    transform: on?'none':'translateY(28px)',
    transition:`opacity .7s ${d}s ease, transform .7s ${d}s ease`,
  })

  return (
    <section style={{
      background:'linear-gradient(160deg, #f0fdf4 0%, #ffffff 55%, #eff6ff 100%)',
      padding:'100px 24px 80px', overflow:'hidden', position:'relative',
    }}>
      {/* bg decorations */}
      <div style={{
        position:'absolute', top:-120, left:-100, width:500, height:500,
        borderRadius:'50%', background:'radial-gradient(circle,rgba(34,197,94,.12),transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:-80, right:-60, width:380, height:380,
        borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,.10),transparent 70%)',
        pointerEvents:'none',
      }}/>

      <div style={{
        maxWidth:1120, margin:'0 auto',
        display:'flex', alignItems:'center',
        gap:60, flexWrap:'wrap', position:'relative',
      }}>

        {/* ── TEXT ── */}
        <div style={{ flex:'1 1 360px', textAlign:'right' }} dir="rtl">
          <div style={fd(0)}>
            <Tag>🎉 الأكثر استخداماً في المغرب</Tag>
          </div>

          <h1 style={{
            ...fd(0.1),
            fontSize:'clamp(2.1rem,5.5vw,3.6rem)',
            fontWeight:900, lineHeight:1.12,
            color:DARK, fontFamily:F, marginBottom:20,
          }}>
            تعلم الإنجليزية<br/>
            <span style={{
              background:`linear-gradient(90deg,${GL},${G},#4ade80)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>بالمحادثة</span>
          </h1>

          <p style={{
            ...fd(0.22),
            fontSize:'1.1rem', color:MUTED,
            lineHeight:1.9, marginBottom:40, fontFamily:F, fontWeight:400,
          }}>
            بدون قواعد مملة — فقط كلام حقيقي كل يوم<br/>
            من الصفر حتى الطلاقة الكاملة 🚀
          </p>

          <div style={{ ...fd(0.32), display:'flex', gap:14, flexWrap:'wrap', marginBottom:44 }}>
            <GBtn href="/courses">ابدأ الآن مجاناً</GBtn>
            <OBtn href="/courses/a0">جرب درس مجاني</OBtn>
          </div>

          {/* social proof */}
          <div style={{ ...fd(0.42), display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ display:'flex' }}>
              {['🧑‍🎓','👩‍💻','🧑‍💼','👩‍🏫','🧕'].map((e,i) => (
                <div key={i} style={{
                  width:38, height:38, borderRadius:'50%',
                  background:`hsl(${i*50+120},70%,65%)`,
                  border:'3px solid #fff',
                  marginLeft: i?-10:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.1rem', zIndex:5-i,
                }}>{e}</div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.9rem', color:DARK, fontFamily:F }}>+1,200 طالب</div>
              <div style={{ fontSize:'0.75rem', color:MUTED, fontFamily:F }}>{'⭐'.repeat(5)} 4.9 تقييم</div>
            </div>
            <div style={{ width:1, height:36, background:'#e2e8f0' }}/>
            <div style={{ fontFamily:F }}>
              <div style={{ fontWeight:800, fontSize:'0.9rem', color:DARK }}>97%</div>
              <div style={{ fontSize:'0.75rem', color:MUTED }}>نسبة الرضا</div>
            </div>
          </div>
        </div>

        {/* ── VISUAL ── */}
        <div style={{
          flex:'1 1 320px', position:'relative',
          minHeight:420, display:'flex',
          alignItems:'center', justifyContent:'center',
          opacity: on?1:0, transition:'opacity .9s .15s ease',
        }}>
          {/* main card mockup */}
          <div className="float-1" style={{
            width:300, height:380,
            background:'#fff',
            borderRadius:32,
            boxShadow:'0 32px 80px rgba(0,0,0,.14)',
            padding:28,
            display:'flex', flexDirection:'column', gap:16,
            border:'1.5px solid #e2e8f0',
          }}>
            {/* header */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:44, height:44, borderRadius:14,
                background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.4rem',
              }}>🎙️</div>
              <div>
                <div style={{ fontWeight:800, fontSize:'0.85rem', color:DARK, fontFamily:F }}>درس المحادثة</div>
                <div style={{ fontSize:'0.72rem', color:MUTED, fontFamily:F }}>الوحدة 4 — A1</div>
              </div>
              <div style={{ marginRight:'auto', background:'#f0fdf4', color:GL, fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:99, fontFamily:F }}>جديد</div>
            </div>

            {/* chat bubbles */}
            {[
              { msg:'How are you today?', dir:'ltr', bg:'#f8fafc', c:DARK   },
              { msg:'I am fine, thank you!', dir:'ltr', bg:`linear-gradient(135deg,${GL},${G})`, c:'#fff' },
              { msg:'Where are you from?', dir:'ltr', bg:'#f8fafc', c:DARK  },
            ].map((b,i) => (
              <div key={i} style={{
                alignSelf: i%2===0?'flex-start':'flex-end',
                background:b.bg, color:b.c,
                padding:'10px 16px', borderRadius:16,
                fontSize:'0.82rem', fontFamily:'Inter, sans-serif',
                maxWidth:'80%', boxShadow:'0 2px 8px rgba(0,0,0,.06)',
                fontWeight: i%2===0?400:700,
              }}>{b.msg}</div>
            ))}

            {/* XP bar */}
            <div style={{ marginTop:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontFamily:F }}>
                <span style={{ fontSize:'0.72rem', color:MUTED }}>XP اليوم</span>
                <span style={{ fontSize:'0.72rem', fontWeight:700, color:GL }}>64 / 100</span>
              </div>
              <div style={{ height:8, borderRadius:4, background:'#e2e8f0', overflow:'hidden' }}>
                <div style={{ height:'100%', width:'64%', background:`linear-gradient(90deg,${GL},${G})`, borderRadius:4, transition:'width 1.5s cubic-bezier(.34,1.56,.64,1)' }}/>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:14 }}>
                {['🔥','⭐','💎'].map((e,i)=>(
                  <div key={i} style={{ flex:1, background:'#f8fafc', borderRadius:12, padding:'8px 4px', textAlign:'center', fontSize:'1.1rem' }}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          {/* floating badges */}
          <div className="float-2" style={{
            position:'absolute', top:20, right:-12,
            background:'#fff', borderRadius:18,
            padding:'12px 18px', boxShadow:'0 8px 32px rgba(0,0,0,.12)',
            display:'flex', alignItems:'center', gap:10, fontFamily:F,
            border:'1px solid #e2e8f0',
          }}>
            <span style={{ fontSize:'1.6rem' }}>💬</span>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.78rem', color:DARK }}>محادثة حقيقية</div>
              <div style={{ fontSize:'0.68rem', color:MUTED }}>من أول درس</div>
            </div>
          </div>

          <div className="float-3" style={{
            position:'absolute', bottom:56, left:-20,
            background:'#fff', borderRadius:18,
            padding:'12px 18px', boxShadow:'0 8px 32px rgba(0,0,0,.12)',
            display:'flex', alignItems:'center', gap:10, fontFamily:F,
            border:'1px solid #e2e8f0',
          }}>
            <span style={{ fontSize:'1.6rem' }}>🏆</span>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.78rem', color:DARK }}>إنجاز جديد!</div>
              <div style={{ fontSize:'0.68rem', color:MUTED }}>أكملت 7 دروس</div>
            </div>
          </div>

          <div className="float-1" style={{
            position:'absolute', bottom:12, right:8,
            background:B, borderRadius:14, padding:'10px 16px',
            boxShadow:`0 6px 22px rgba(37,99,235,.4)`, fontFamily:F,
          }}>
            <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#fff' }}>📱 تعلم في أي مكان</div>
          </div>

          <div className="float-2" style={{
            position:'absolute', top:100, left:-12,
            background:'#fef9c3', borderRadius:12,
            padding:'8px 14px', fontFamily:F,
            boxShadow:'0 4px 16px rgba(0,0,0,.08)',
            border:'1px solid #fde68a',
          }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#92400e' }}>🔥 سلسلة 7 أيام!</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════
   2. STATS STRIP
══════════════════════════════════════════════ */
function StatsStrip() {
  const { ref, vis } = useVisible()
  return (
    <section style={{ background:'#fff', padding:'32px 24px 64px' }}>
      <div style={{ maxWidth:1020, margin:'0 auto' }}>
        <div ref={ref} style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
          gap:16,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background:s.color,
              borderRadius:22, padding:'28px 24px',
              textAlign:'center',
              opacity: vis?1:0,
              transform: vis?'none':'translateY(20px)',
              transition:`opacity .55s ${i*.1}s, transform .55s ${i*.1}s`,
              border:'1.5px solid rgba(0,0,0,.05)',
            }}>
              <div style={{ fontSize:'2.2rem', marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontWeight:900, fontSize:'1.5rem', color:DARK, fontFamily:F }}>{s.val}</div>
              <div style={{ fontSize:'0.8rem', color:MUTED, fontFamily:F, marginTop:4 }}>{s.lbl}</div>
            </div>
          ))}
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
