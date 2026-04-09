'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
const WA = 'https://wa.me/212707902091?text=' + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')

function WAIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// ─── Slide-in on scroll ───────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref  = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    emoji: '🗺️',
    badge: 'رحلة تعلم تفاعلية',
    title: 'تعلّم الإنجليزية',
    highlight: 'كما يتكلمها الناس',
    sub: 'نظام رحلة مدروس — كل يوم خطوة جديدة نحو الطلاقة',
    color: '#3b82f6',
    bg: 'linear-gradient(135deg,#060d1a 0%,#0a1830 60%,#0e2040 100%)',
    accent: 'rgba(59,130,246,0.15)',
    visual: (
      <div className="relative w-full max-w-[260px] mx-auto">
        {/* Map journey preview */}
        <div className="rounded-3xl overflow-hidden p-5" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white/40 text-xs mb-3 text-center">خريطة الرحلة</p>
          {[
            { c:'#10b981', t:'واد زم',          s:'مكتمل ✅' },
            { c:'#3b82f6', t:'خريبكة',            s:'جاري ▶' },
            { c:'rgba(255,255,255,0.15)', t:'بني ملال',   s:'🔒' },
          ].map((r,i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: r.c, opacity: i === 2 ? 0.4 : 1 }}>
                {i === 0 ? '⭐' : i === 1 ? '▶' : '🔒'}
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-bold" style={{ opacity: i === 2 ? 0.3 : 1 }}>{r.t}</p>
                <p className="text-xs" style={{ color: r.c, opacity: i === 2 ? 0.3 : 0.7 }}>{r.s}</p>
              </div>
            </div>
          ))}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width:'35%', background:'linear-gradient(90deg,#10b981,#3b82f6)' }} />
          </div>
          <p className="text-white/25 text-xs text-center mt-2">1 / 11 وحدة</p>
        </div>
      </div>
    ),
  },
  {
    emoji: '💬',
    badge: 'محادثة حقيقية',
    title: 'تحدث بثقة',
    highlight: 'من اليوم الأول',
    sub: 'تمارين حوار تفاعلية مبنية على مواقف من الحياة الحقيقية',
    color: '#10b981',
    bg: 'linear-gradient(135deg,#021208 0%,#031a0e 60%,#042614 100%)',
    accent: 'rgba(16,185,129,0.15)',
    visual: (
      <div className="relative w-full max-w-[260px] mx-auto">
        <div className="rounded-3xl overflow-hidden p-5" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white/40 text-xs mb-4 text-center">محادثة تفاعلية</p>
          <div className="space-y-3">
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-black text-white shrink-0">A</div>
              <div className="rounded-2xl rounded-tl-sm px-3 py-2" style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.25)' }}>
                <p className="text-white text-xs">Good morning! How are you?</p>
              </div>
            </div>
            <div className="flex gap-2 items-start flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black text-white shrink-0">أ</div>
              <div className="rounded-2xl rounded-tr-sm px-3 py-2" style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.25)' }}>
                <p className="text-white text-xs">I&apos;m great, thank you!</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-black text-white shrink-0">A</div>
              <div className="rounded-2xl rounded-tl-sm px-3 py-2" style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.25)' }}>
                <p className="text-white text-xs">Ready for today&apos;s lesson? 🚀</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    emoji: '⚡',
    badge: 'نظام XP وتقدم',
    title: 'مكافآت وتحفيز',
    highlight: 'يجعلك تعود كل يوم',
    sub: 'نقاط XP وسلسلة يومية وإنجازات — تعلّم يبدو كلعبة ممتعة',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg,#100800 0%,#1a0e00 60%,#261500 100%)',
    accent: 'rgba(245,158,11,0.15)',
    visual: (
      <div className="relative w-full max-w-[260px] mx-auto">
        <div className="rounded-3xl overflow-hidden p-5" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-amber-400 font-black text-2xl">480</p>
              <p className="text-white/30 text-xs">XP مكتسبة</p>
            </div>
            <div className="text-center">
              <p className="text-orange-400 font-black text-2xl">🔥 7</p>
              <p className="text-white/30 text-xs">أيام متتالية</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400 font-black text-2xl">A1</p>
              <p className="text-white/30 text-xs">مستواك الحالي</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-white/30 text-xs">A1</span>
              <span className="text-white/30 text-xs">80 XP للمستوى A2</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width:'80%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)', boxShadow:'0 0 8px rgba(245,158,11,0.6)' }} />
            </div>
          </div>
          <div className="flex gap-2">
            {['🎯','📚','💬','🏆','⭐'].map((e,i) => (
              <div key={i} className="flex-1 aspect-square rounded-xl flex items-center justify-center text-lg"
                style={{ background: i < 3 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i < 3 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)'}`, opacity: i >= 3 ? 0.35 : 1 }}>
                {e}
              </div>
            ))}
          </div>
          <p className="text-amber-400/50 text-xs text-center mt-2">3 إنجازات مكتملة</p>
        </div>
      </div>
    ),
  },
]

const PLANS = [
  { cefr:'A0', label:'المبتدئ المطلق', emoji:'🌱', color:'#10b981', desc:'أول كلماتك بالإنجليزية — من الصفر', units:'11 وحدة' },
  { cefr:'A1', label:'المبتدئ',         emoji:'🌿', color:'#3b82f6', desc:'جمل بسيطة وأسئلة يومية',             units:'24 وحدة' },
  { cefr:'A2', label:'الأساسي',         emoji:'⭐', color:'#06b6d4', desc:'محادثات اعتيادية ووصف نفسك',         units:'18 وحدة' },
  { cefr:'B1', label:'المتوسط',         emoji:'🚀', color:'#8b5cf6', desc:'آراء وقصص وحوارات معقدة',            units:'20 وحدة' },
  { cefr:'B2', label:'فوق المتوسط',    emoji:'💫', color:'#ec4899', desc:'طلاقة حقيقية ومفردات واسعة',          units:'قريباً' },
  { cefr:'C1', label:'المتقدم',         emoji:'🏆', color:'#f59e0b', desc:'احتراف كامل — كالناطقين الأصليين',   units:'قريباً' },
  { cefr:'BZ', label:'Business English',emoji:'💼', color:'#6366f1', desc:'الإنجليزية في بيئة الأعمال',          units:'قريباً' },
]

const HOW_STEPS = [
  { n:'01', icon:'📚', title:'تعلم المفردات', desc:'10 كلمات جديدة مع صوت لكل كلمة — اضغط واسمع', color:'#3b82f6' },
  { n:'02', icon:'✏️', title:'الجمل البسيطة', desc:'استيعاب الجمل وترجمتها بشكل طبيعي',             color:'#10b981' },
  { n:'03', icon:'🗣️', title:'الجمل الطبيعية', desc:'كيف يتكلم الناس الحقيقيون — بلا حفظ',          color:'#8b5cf6' },
  { n:'04', icon:'💬', title:'الحوار',          desc:'محادثة كاملة مبنية على سياق حقيقي',             color:'#f59e0b' },
  { n:'05', icon:'🎯', title:'الاختبار التفاعلي', desc:'أكثر من 10 تمارين متنوعة تثبّت ما تعلمته',  color:'#ec4899' },
]

const TESTIMONIALS = [
  { name:'أحمد رضا',     flag:'🇲🇦', role:'مهندس', xp:1240, streak:21, quote:'بدأت من الصفر وهلحين كنعرف نتكلم في الشغل. النظام هدا زوين بزاف!' },
  { name:'سارة بنالي',   flag:'🇲🇦', role:'طالبة',  xp:890,  streak:14, quote:'ما شفتش نظام تعليم هكذا. كل يوم كتعلم شي جديد وماشي ممل.' },
  { name:'محمد القاسم',  flag:'🇲🇦', role:'تاجر',   xp:2100, streak:45, quote:'45 يوم متتالية! الإنجليزية ولات عادية بالنسبة ليا.' },
  { name:'نور الهدى',    flag:'🇩🇿', role:'موظفة',  xp:560,  streak:9,  quote:'الصوت مع كل كلمة غير كل شي. هلحين كنفهم المسلسلات!' },
]

const FEATURES = [
  { icon:'🔊', title:'صوت لكل كلمة',       desc:'اسمع النطق الصحيح لكل مفردة وجملة بضغطة واحدة' },
  { icon:'🎮', title:'تعلم مثل لعبة',       desc:'نقاط XP، سلسلة يومية وإنجازات تجعلك تعود كل يوم' },
  { icon:'🗺️', title:'رحلة منظمة',          desc:'مسار واضح من A0 إلى C1 عبر مدن مغربية' },
  { icon:'💬', title:'محادثة من اليوم الأول', desc:'لا قواعد نحو مملة — إنجليزية تُستخدم في الحياة' },
  { icon:'📊', title:'تقدم مرئي',             desc:'شاهد تقدمك في كل يوم — XP، مستوى، وحدات مكتملة' },
  { icon:'🆓', title:'ابدأ مجاناً',           desc:'الوحدات الأساسية مفتوحة — جرّب قبل أي التزام' },
]

const AVATARS = [
  { l:'أ', c:'#3b82f6' }, { l:'س', c:'#ec4899' }, { l:'م', c:'#10b981' },
  { l:'ن', c:'#f97316' }, { l:'ي', c:'#8b5cf6' },
]

// ─── Hero Slider ──────────────────────────────────────────────────────────────
function HeroSection() {
  const [idx, setIdx] = useState(0)
  const slide = HERO_SLIDES[idx]

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5200)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: slide.bg, transition: 'background 0.8s ease' }}
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-8 w-72 h-72 rounded-full blur-3xl" style={{ background: slide.accent, transition: 'background 0.8s' }} />
        <div className="absolute bottom-24 left-8 w-56 h-56 rounded-full blur-3xl" style={{ background: slide.accent, opacity:0.6, transition: 'background 0.8s' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Text */}
          <div className="flex-1 text-center lg:text-right" dir="rtl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.8)' }}
            >
              <span>{slide.emoji}</span>
              <span>{slide.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
              {slide.title}
              <br />
              <span style={{ color: slide.color, transition:'color 0.5s' }}>{slide.highlight}</span>
            </h1>

            <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              {slide.sub}
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link
                href="/onboarding"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-95"
                style={{ background:`linear-gradient(135deg,${slide.color},${slide.color}bb)`, boxShadow:`0 8px 28px ${slide.color}50` }}
              >
                ابدأ الآن 🚀
              </Link>
              <Link
                href="/map"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.85)' }}
              >
                شاهد كيف يعمل ◀
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <div className="flex items-center">
                {AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-white font-black text-xs"
                    style={{ background:av.c, borderColor:'rgba(0,0,0,0.4)', marginLeft: i > 0 ? -10 : 0, zIndex:5-i }}
                  >
                    {av.l}
                  </div>
                ))}
              </div>
              <div dir="rtl">
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_,i) => <span key={i} className="text-amber-400 text-xs">★</span>)}
                </div>
                <p className="text-white/45 text-xs">+1000 طالب — نتائج حقيقية — تعلم في 24 ساعة</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 lg:w-72" style={{ transition:'opacity 0.4s' }}>
            {slide.visual}
          </div>
        </div>

        {/* Slider dots */}
        <div className="flex justify-center gap-2 mt-12">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 28 : 8, height: 8,
                background: i === idx ? slide.color : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" style={{ display:'block' }}>
          <path d="M0 56L1440 56L1440 24C1200 52 880 8 600 22C350 34 150 48 0 24Z" fill="rgba(7,11,20,1)" />
        </svg>
      </div>
    </section>
  )
}

// ─── Plans Section ────────────────────────────────────────────────────────────
function PlansSection() {
  return (
    <section id="plans" className="py-24" style={{ background:'#070b14' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-4" style={{ background:'rgba(59,130,246,0.12)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.25)' }}>
            📚 خطط التعلم
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">اختر مستواك — ابدأ رحلتك</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto" dir="rtl">من الصفر المطلق إلى الاحتراف الكامل — كل مستوى رحلة قائمة بذاتها</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.cefr} delay={i * 70}>
              <Link
                href={p.units === 'قريباً' ? '#' : '/onboarding'}
                className="group relative flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: p.units === 'قريباً' ? 'rgba(255,255,255,0.02)' : `${p.color}0d`,
                  border: `1.5px solid ${p.units === 'قريباً' ? 'rgba(255,255,255,0.07)' : p.color + '30'}`,
                  opacity: p.units === 'قريباً' ? 0.6 : 1,
                }}
              >
                {p.units === 'قريباً' && (
                  <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)' }}>
                    قريباً
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background:`${p.color}18`, border:`1.5px solid ${p.color}35` }}
                  >
                    {p.emoji}
                  </div>
                  <div dir="rtl">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs px-2 py-0.5 rounded-full" style={{ background:`${p.color}20`, color:p.color }}>{p.cefr !== 'BZ' ? p.cefr : 'BZ'}</span>
                    </div>
                    <p className="text-white font-black text-sm mt-0.5">{p.label}</p>
                  </div>
                </div>
                <p className="text-white/40 text-xs leading-relaxed" dir="rtl">{p.desc}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold" style={{ color: p.units === 'قريباً' ? 'rgba(255,255,255,0.2)' : p.color }}>
                    {p.units}
                  </span>
                  {p.units !== 'قريباً' && (
                    <span className="text-white/25 text-sm group-hover:text-white/60 transition-colors">←</span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveStep(i => (i + 1) % HOW_STEPS.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="py-24 relative overflow-hidden" style={{ background:'linear-gradient(160deg,#080d1c 0%,#0c1428 100%)' }}>
      {/* glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(139,92,246,0.07)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-4" style={{ background:'rgba(139,92,246,0.12)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.25)' }}>
            🎮 كيف يعمل النظام
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">داخل كل وحدة — 5 مراحل</h2>
          <p className="text-white/40 text-lg" dir="rtl">منهج مدروس يأخذك من الكلمة إلى المحادثة في جلسة واحدة</p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Steps list */}
          <div className="flex flex-col gap-3">
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <button
                  onClick={() => setActiveStep(i)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all duration-300"
                  style={{
                    background: activeStep === i ? `${step.color}12` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: activeStep === i ? `0 4px 20px ${step.color}18` : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300"
                    style={{
                      background: activeStep === i ? `${step.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${activeStep === i ? step.color + '45' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div dir="rtl" className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black" style={{ color: step.color, opacity:0.6 }}>{step.n}</span>
                      <p className="text-white font-black text-sm">{step.title}</p>
                    </div>
                    <p className="text-white/35 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                  {activeStep === i && (
                    <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background:step.color }} />
                  )}
                </button>
              </Reveal>
            ))}
          </div>

          {/* Phone mockup */}
          <Reveal delay={200}>
            <div className="flex justify-center">
              <div
                className="w-64 rounded-[2.5rem] overflow-hidden shadow-2xl"
                style={{ background:'#060d1a', border:'2px solid rgba(255,255,255,0.1)', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}
              >
                {/* Phone top bar */}
                <div className="flex items-center justify-center pt-4 pb-2">
                  <div className="w-24 h-5 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Screen content */}
                <div className="px-4 pb-6">
                  {/* Progress */}
                  <div className="flex gap-1 mb-4">
                    {HOW_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-500"
                        style={{ background: i <= activeStep ? HOW_STEPS[activeStep].color : 'rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>

                  {/* Active step card */}
                  <div
                    className="rounded-2xl p-4 text-center mb-4"
                    style={{ background: `${HOW_STEPS[activeStep].color}10`, border:`1px solid ${HOW_STEPS[activeStep].color}25` }}
                  >
                    <div className="text-5xl mb-2">{HOW_STEPS[activeStep].icon}</div>
                    <p className="text-white font-black text-base mb-1" dir="rtl">{HOW_STEPS[activeStep].title}</p>
                    <p className="text-white/35 text-xs" dir="rtl">{HOW_STEPS[activeStep].desc}</p>
                  </div>

                  {/* Fake options */}
                  <div className="flex flex-col gap-2">
                    {['Hello 👋', 'Good morning ☀️', 'Hi there! 🙌'].map((o, i) => (
                      <div
                        key={i}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold text-white/70 text-center"
                        style={{
                          background: i === 1 ? `${HOW_STEPS[activeStep].color}18` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${i === 1 ? HOW_STEPS[activeStep].color + '35' : 'rgba(255,255,255,0.08)'}`,
                          color: i === 1 ? '#fff' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── Social Proof ─────────────────────────────────────────────────────────────
function SocialProofSection() {
  return (
    <section className="py-24" style={{ background:'#060a12' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-4" style={{ background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)' }}>
            💬 قالوا عن إنجليزي.كوم
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">نتائج حقيقية من طلاب حقيقيين</h2>
        </Reveal>

        {/* Stats row */}
        <Reveal className="grid grid-cols-3 gap-4 mb-14">
          {[
            { val:'+1000', label:'طالب نشط' },
            { val:'97%',   label:'معدل الرضا' },
            { val:'4.9★',  label:'التقييم العام' },
          ].map((s, i) => (
            <div key={i} className="text-center py-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-black text-2xl sm:text-3xl">{s.val}</p>
              <p className="text-white/30 text-xs mt-1" dir="rtl">{s.label}</p>
            </div>
          ))}
        </Reveal>

        {/* Testimonials grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className="flex flex-col gap-4 p-5 rounded-2xl"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white shrink-0"
                    style={{ background:`hsl(${i * 90 + 120},60%,40%)` }}
                  >
                    {t.name[0]}
                  </div>
                  <div dir="rtl" className="flex-1">
                    <p className="text-white font-black text-sm">{t.flag} {t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-amber-400">⚡ {t.xp} XP</span>
                    <span className="text-xs text-orange-400">🔥 {t.streak} يوم</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed" dir="rtl">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,j) => <span key={j} className="text-amber-400 text-xs">★</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="py-24" style={{ background:'linear-gradient(160deg,#070c1c 0%,#0a1020 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-4" style={{ background:'rgba(249,115,22,0.12)', color:'#fb923c', border:'1px solid rgba(249,115,22,0.25)' }}>
            ⚡ لماذا إنجليزي.كوم؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">تعلم مختلف — نتائج مختلفة</h2>
          <p className="text-white/40 text-lg" dir="rtl">نظام مبني على أحدث طرق التعلم اللغوي — بدون قواعد مملة</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="group p-5 rounded-2xl transition-all duration-300"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-white font-black text-base mb-2" dir="rtl">{f.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed" dir="rtl">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#050913 0%,#0c1428 50%,#0e1830 100%)' }}>
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(59,130,246,0.12)' }} />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(139,92,246,0.1)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize:'28px 28px' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
            style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', color:'#fbbf24' }}
          >
            🏆 انضم لأكثر من 1000 طالب ناجح
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight" dir="rtl">
            ابدأ رحلتك<br />
            <span style={{ background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              الآن
            </span>
          </h2>

          <p className="text-white/45 text-lg mb-10 leading-relaxed" dir="rtl">
            لا تؤجل — كل يوم تنتظر هو يوم ضائع.<br />
            رحلتك تبدأ من واد زم وتنتهي عندما تصبح محترفاً حقيقياً.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
              style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow:'0 12px 40px rgba(59,130,246,0.45)' }}
            >
              🚀 ابدأ الآن — مجاناً
            </Link>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
              style={{ background:'#25d366', boxShadow:'0 12px 40px rgba(37,211,102,0.35)' }}
            >
              <WAIcon size={22} />
              واتساب
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-white/35 text-sm" dir="rtl">
            {['✅ ابدأ مجاناً', '🔒 بدون بطاقة', '📱 يعمل على الموبايل', '🇲🇦 مصمم للعرب'].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="overflow-x-hidden" dir="rtl">
      <HeroSection />
      <PlansSection />
      <HowItWorksSection />
      <SocialProofSection />
      <FeaturesSection />
      <FinalCTA />
    </main>
  )
}
