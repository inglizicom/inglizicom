'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

const slides = [
  {
    id: 1,
    headline: 'تكلم الإنجليزية بثقة',
    headlineAccent: 'حتى لو كنت مبتدئاً',
    sub: 'أساعدك على تحسين النطق والتواصل في وقت قصير — بدون قواعد معقدة، بدون خوف.',
    img: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1400&q=85',
    badge: '🎯 أكثر من 2000 طالب',
    cta1: { label: 'ابدأ الآن', href: '/courses' },
    cta2: { label: 'تواصل عبر واتساب', href: 'https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية', wa: true },
    accent: 'from-brand-950 via-brand-900 to-brand-800',
  },
  {
    id: 2,
    headline: 'تعلم الإنجليزية',
    headlineAccent: 'وتكلم بثقة في وقت قصير',
    sub: 'برنامج عملي مع حمزة القصراوي — التركيز على التحدث من أول درس.',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=85',
    badge: '⭐ تقييم 5.0 من 500+ طالب',
    cta1: { label: 'اختبر مستواك', href: '/level-test' },
    cta2: { label: 'عرض الدورات', href: '/courses', wa: false },
    accent: 'from-indigo-950 via-indigo-900 to-brand-800',
  },
  {
    id: 3,
    headline: 'من الخوف',
    headlineAccent: 'إلى الطلاقة والثقة',
    sub: 'منهج مختلف تماماً — ليس تعليماً مدرسياً. تتحدث من اليوم الأول.',
    img: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1400&q=85',
    badge: '🌍 15+ دولة عربية',
    cta1: { label: 'سجّل الآن', href: '/courses' },
    cta2: { label: 'اقرأ قصص النجاح', href: '/about', wa: false },
    accent: 'from-slate-950 via-brand-950 to-brand-900',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 700)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

  /* Auto-advance every 6 s */
  useEffect(() => {
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Background images (fade transition) ── */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.img}
            alt={s.headline}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className={`absolute inset-0 bg-gradient-to-l ${s.accent} opacity-85`} />
        </div>
      ))}

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            key={`badge-${current}`}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/25 rounded-full px-4 py-2 mb-7 backdrop-blur-sm animate-fade-up"
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            <span className="text-sm font-semibold text-blue-100">{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1
            key={`h1-${current}`}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            {slide.headline}
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #fb923c 50%, #f87171 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {slide.headlineAccent}
            </span>
          </h1>

          {/* Sub */}
          <p
            key={`sub-${current}`}
            className="text-xl sm:text-2xl text-blue-100/85 leading-relaxed mb-10 max-w-xl animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            {slide.sub}
          </p>

          {/* CTAs */}
          <div
            key={`cta-${current}`}
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href={slide.cta1.href}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black py-4 px-9 rounded-2xl shadow-xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center gap-2 text-lg"
            >
              {slide.cta1.label}
              <ArrowLeft size={20} />
            </Link>
            {slide.cta2.wa ? (
              <a
                href={slide.cta2.href}
                target="_blank" rel="noopener noreferrer"
                className="bg-[#25d366] hover:bg-[#20b858] active:scale-95 text-white font-black py-4 px-9 rounded-2xl shadow-xl hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2 text-lg"
              >
                <WhatsAppIcon />
                {slide.cta2.label}
              </a>
            ) : (
              <Link
                href={slide.cta2.href}
                className="border-2 border-white/50 backdrop-blur-sm text-white font-black py-4 px-9 rounded-2xl hover:bg-white hover:text-brand-800 transition-all duration-300 flex items-center gap-2 text-lg"
              >
                {slide.cta2.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 transition-all duration-200 hover:scale-110"
        aria-label="السابق"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 transition-all duration-200 hover:scale-110"
        aria-label="التالي"
      >
        <ChevronRight size={24} />
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`الشريحة ${i + 1}`}
          />
        ))}
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 25C1300 65 1100 5 900 22C700 40 500 68 300 48C150 33 60 52 0 28L0 80Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
