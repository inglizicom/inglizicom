'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CITIES = [
  { name_ar: 'واد زم',         emoji: '🌱', cefr: 'A0' },
  { name_ar: 'خريبكة',          emoji: '❓', cefr: 'A1' },
  { name_ar: 'بني ملال',        emoji: '⏰', cefr: 'A1' },
  { name_ar: 'الدار البيضاء',   emoji: '🎨', cefr: 'A1' },
  { name_ar: 'الرباط',          emoji: '💼', cefr: 'A2' },
  { name_ar: 'سلا',             emoji: '✈️', cefr: 'A2' },
  { name_ar: 'فاس',             emoji: '🏆', cefr: 'B1' },
  { name_ar: 'أكادير',          emoji: '🏄', cefr: 'B2' },
]

const FEATURES = [
  { icon: '🔊', title_ar: 'صوت لكل كلمة',     desc_ar: 'استمع للنطق الصحيح لكل مفردة وجملة' },
  { icon: '🗺️', title_ar: 'رحلة عبر المغرب',  desc_ar: '١٥+ مدينة — كل مدينة = مستوى جديد' },
  { icon: '⚡', title_ar: 'نقاط XP ومكافآت',  desc_ar: 'اكسب XP بكل إجابة صحيحة وارتقِ في المستويات' },
  { icon: '🔥', title_ar: 'سلسلة يومية',       desc_ar: 'تابع تقدمك كل يوم وحافظ على سلسلتك' },
  { icon: '💬', title_ar: 'محادثات حقيقية',    desc_ar: 'بدون قواعد نحو — إنجليزية كما يتكلمها الناس' },
  { icon: '🎯', title_ar: 'تمارين تفاعلية',    desc_ar: 'اختبارات متنوعة تثبّت ما تعلمته' },
]

const LEVELS = [
  { cefr: 'A0', label: 'مبتدئ تماماً',  color: '#10b981', desc_ar: 'أول كلماتك بالإنجليزية' },
  { cefr: 'A1', label: 'مبتدئ',         color: '#3b82f6', desc_ar: 'جمل بسيطة يومية' },
  { cefr: 'A2', label: 'أساسي',          color: '#0ea5e9', desc_ar: 'محادثات اعتيادية' },
  { cefr: 'B1', label: 'متوسط',          color: '#8b5cf6', desc_ar: 'تعبير عن الرأي' },
  { cefr: 'B2', label: 'فوق المتوسط',   color: '#ec4899', desc_ar: 'طلاقة حقيقية' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)   // 0=hero, 1=features, 2=cities, 3=ready

  useEffect(() => {
    const already = localStorage.getItem('inglizi_onboarded')
    if (already) router.replace('/map')
  }, [router])

  function finish() {
    localStorage.setItem('inglizi_onboarded', '1')
    router.push('/map')
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse2   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 24px rgba(16,185,129,0.3)} 50%{box-shadow:0 0 48px rgba(16,185,129,0.7)} }
        @keyframes drift    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .fade-up    { animation: fadeUp  0.55s ease-out both; }
        .scale-in   { animation: scaleIn 0.4s ease-out both; }
        .pulse2     { animation: pulse2  2.4s ease-in-out infinite; }
        .glow-green { animation: glow    2.8s ease-in-out infinite; }
        .drift      { animation: drift   4s   ease-in-out infinite; }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(160deg,#050c1a 0%,#08111f 50%,#050c1a 100%)' }}
      >

        {/* ── Step 0: Hero ─────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-8">

            {/* Flag + glow */}
            <div className="relative drift">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'rgba(16,185,129,0.25)', transform: 'scale(1.4)' }} />
              <div
                className="relative w-28 h-28 rounded-3xl flex items-center justify-center text-6xl glow-green"
                style={{ background: 'linear-gradient(135deg,#0a2010,#0d3018)', border: '2px solid rgba(16,185,129,0.4)' }}
              >
                🇲🇦
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-white font-black text-4xl leading-tight mb-3" dir="rtl">
                رحلة تعلم<br />
                <span style={{ color: '#10b981' }}>الإنجليزية</span>
              </h1>
              <p className="text-white/45 text-base leading-relaxed max-w-xs mx-auto" dir="rtl">
                تعلم الإنجليزية كما يتحدثها الناس الحقيقيون — بدون قواعد نحو مملة
              </p>
            </div>

            {/* City preview strip */}
            <div className="fade-up w-full max-w-sm overflow-hidden" style={{ animationDelay: '0.25s' }}>
              <div className="flex gap-2 overflow-x-auto pb-2 px-1" style={{ scrollbarWidth: 'none' }}>
                {CITIES.map((c, i) => (
                  <div
                    key={i}
                    className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-white/50 text-xs font-medium whitespace-nowrap" dir="rtl">{c.name_ar}</span>
                    <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{c.cefr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="fade-up flex gap-3 w-full max-w-sm" style={{ animationDelay: '0.35s' }}>
              {[
                { v: '١٥+', l: 'مدينة' },
                { v: '٥٠+', l: 'وحدة' },
                { v: '٥٠٠+', l: 'تمرين' },
              ].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center py-3.5 rounded-2xl gap-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-white font-black text-xl">{s.v}</span>
                  <span className="text-white/30 text-xs" dir="rtl">{s.l}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="fade-up w-full max-w-sm py-5 rounded-2xl font-black text-xl text-white pulse2 shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 12px 40px rgba(16,185,129,0.45)', animationDelay: '0.45s' }}
            >
              ابدأ الرحلة 🚀
            </button>

            <button onClick={finish} className="text-white/20 text-sm underline">
              تخطّ المقدمة
            </button>
          </div>
        )}

        {/* ── Step 1: Features ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col px-5 py-10 max-w-lg mx-auto w-full">
            <div className="text-center mb-8 fade-up">
              <p className="text-5xl mb-3">✨</p>
              <h2 className="text-white font-black text-2xl mb-2" dir="rtl">كيف يعمل النظام؟</h2>
              <p className="text-white/35 text-sm" dir="rtl">نظام تعلم مصمم ليجعلك تتحدث الإنجليزية بسرعة</p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="scale-in flex flex-col gap-2 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animationDelay: `${i * 0.08}s` }}
                >
                  <span className="text-3xl">{f.icon}</span>
                  <p className="text-white font-black text-sm leading-tight" dir="rtl">{f.title_ar}</p>
                  <p className="text-white/35 text-xs leading-relaxed" dir="rtl">{f.desc_ar}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full py-5 rounded-2xl font-black text-lg text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}
            >
              التالي — الرحلة 🗺️
            </button>
          </div>
        )}

        {/* ── Step 2: Journey preview ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col px-5 py-10 max-w-lg mx-auto w-full">
            <div className="text-center mb-6 fade-up">
              <p className="text-5xl mb-3">🗺️</p>
              <h2 className="text-white font-black text-2xl mb-2" dir="rtl">رحلتك عبر المغرب</h2>
              <p className="text-white/35 text-sm" dir="rtl">كل مدينة = مستوى جديد — من مبتدئ إلى متحدث طليق</p>
            </div>

            {/* Level path */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-4">
              {LEVELS.map((lv, i) => (
                <div
                  key={i}
                  className="scale-in flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: `${lv.color}0f`, border: `1.5px solid ${lv.color}25`, animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: `${lv.color}20`, color: lv.color, border: `1.5px solid ${lv.color}40` }}
                  >
                    {lv.cefr}
                  </div>
                  <div dir="rtl">
                    <p className="text-white font-black text-base">{lv.label}</p>
                    <p className="text-white/35 text-xs">{lv.desc_ar}</p>
                  </div>
                  <div className="mr-auto flex items-center">
                    {i === 0 ? (
                      <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: '#10b98120', color: '#10b981' }}>ابدأ هنا</span>
                    ) : (
                      <span className="text-white/15 text-lg">🔒</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-6 w-full py-5 rounded-2xl font-black text-lg text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
            >
              التالي — ابدأ الآن! 🎯
            </button>
          </div>
        )}

        {/* ── Step 3: Ready ─────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-6">
            <div className="relative drift">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'rgba(245,158,11,0.3)', transform: 'scale(1.5)' }} />
              <div
                className="relative w-32 h-32 rounded-3xl flex items-center justify-center text-7xl scale-in"
                style={{ background: 'linear-gradient(135deg,#1a1200,#2d1f00)', border: '2px solid rgba(245,158,11,0.4)', boxShadow: '0 0 48px rgba(245,158,11,0.3)' }}
              >
                🏆
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="text-white font-black text-3xl mb-2" dir="rtl">أنت جاهز!</h2>
              <p className="text-white/45 text-base leading-relaxed max-w-xs mx-auto" dir="rtl">
                رحلتك تبدأ الآن من <span style={{ color: '#10b981', fontWeight: 800 }}>واد زم</span>
                <br />وستنتهي عندما تصبح محترفاً حقيقياً
              </p>
            </div>

            {/* Commitment badges */}
            <div className="fade-up flex gap-3 w-full max-w-xs" style={{ animationDelay: '0.25s' }}>
              {['⚡ اكسب XP', '🔥 سلسلة يومية', '🏅 شارات'].map((b, i) => (
                <div key={i} className="flex-1 py-3 rounded-xl text-center text-xs font-bold text-white/50"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }} dir="rtl">
                  {b}
                </div>
              ))}
            </div>

            <button
              onClick={finish}
              className="fade-up w-full max-w-sm py-5 rounded-2xl font-black text-xl text-white pulse2 shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 12px 40px rgba(245,158,11,0.45)', animationDelay: '0.35s' }}
            >
              ادخل الخريطة 🗺️
            </button>
          </div>
        )}

        {/* ── Progress dots ─────────────────────────────────────────────────── */}
        {step < 3 && (
          <div className="flex justify-center gap-2 py-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  background: i === step ? '#10b981' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
