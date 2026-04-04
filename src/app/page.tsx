'use client'

import { useState } from 'react'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import CountdownTimer from '@/components/CountdownTimer'
import NewsTicker from '@/components/NewsTicker'
import AudioRadio from '@/components/AudioRadio'
import {
  Pencil, Target, BookOpen, CheckCircle2, ArrowLeft,
  TrendingUp, Zap, Star,
} from 'lucide-react'

/* ─── Icons ─────────────────────────────────────────────── */
function WAIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/* ─── Data ───────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Pencil,
    emoji: '✏️',
    title: 'Smart Corrector',
    titleAr: 'المصحح الذكي',
    desc: 'اكتب جملة بالإنجليزية وتحصل على تصحيح فوري مع شرح واضح لكل خطأ',
    href: '/corrector',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
    badge: '✅ مجاني 100%',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    illustration: '💬',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Level Test',
    titleAr: 'اختبار المستوى',
    desc: 'اكتشف مستواك الحقيقي من A1 إلى C2 في 5 دقائق فقط — دقيق وفوري',
    href: '/level-test',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
    badge: '⚡ سريع ودقيق',
    badgeBg: 'bg-blue-100 text-blue-700',
    lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    illustration: '📊',
  },
  {
    icon: BookOpen,
    emoji: '🎓',
    title: 'Live Classes',
    titleAr: 'حصص مباشرة',
    desc: 'تعلم مع حمزة مباشرة — معلم عربي يفهم تماماً ما يحتاجه الطالب العربي',
    href: '/courses',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/30',
    badge: '🔴 بث مباشر',
    badgeBg: 'bg-purple-100 text-purple-700',
    lightBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    border: 'border-purple-200',
    illustration: '🎙️',
  },
]

const HOW_STEPS = [
  {
    num: '01',
    icon: Pencil,
    emoji: '✍️',
    color: 'bg-emerald-500',
    ring: 'ring-emerald-300',
    title: 'اكتب أو تكلم',
    desc: 'جملة، فقرة، أو موقف حقيقي من حياتك',
  },
  {
    num: '02',
    icon: Zap,
    emoji: '⚡',
    color: 'bg-blue-500',
    ring: 'ring-blue-300',
    title: 'احصل على تصحيح',
    desc: 'تصحيح فوري مع شرح الخطأ بالعربية',
  },
  {
    num: '03',
    icon: TrendingUp,
    emoji: '📈',
    color: 'bg-purple-500',
    ring: 'ring-purple-300',
    title: 'تحسن كل يوم',
    desc: 'راقب تقدمك وأبهر من حولك بلغتك',
  },
]

const COURSES = [
  {
    name: 'الأساسي',
    level: 'Beginner',
    levelColor: 'bg-sky-100 text-sky-700',
    price: '750',
    period: 'شهر',
    gradient: 'from-sky-500 to-blue-600',
    textGrad: 'from-sky-400 to-blue-300',
    features: ['8 جلسات خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية PDF', 'دعم واتساب'],
    featured: false,
    cta: 'ابدأ الآن',
    waMsg: 'مرحبا، أريد الاشتراك في الباقة الأساسية',
  },
  {
    name: 'المتقدم',
    level: 'Intermediate',
    levelColor: 'bg-violet-100 text-violet-700',
    price: '1500',
    period: 'شهرين',
    gradient: 'from-violet-500 to-purple-600',
    textGrad: 'from-violet-300 to-purple-200',
    badge: '⭐ الأكثر مبيعاً',
    features: ['20 جلسة خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية كاملة', 'دعم واتساب يومي', 'تصحيح الكتابة والنطق', 'شهادة إتمام'],
    featured: true,
    cta: 'احجز مكانك',
    waMsg: 'مرحبا، أريد الاشتراك في الباقة المتقدمة',
  },
  {
    name: 'الاحترافي',
    level: 'Advanced',
    levelColor: 'bg-orange-100 text-orange-700',
    price: '3000',
    period: '4 أشهر',
    gradient: 'from-orange-500 to-rose-600',
    textGrad: 'from-orange-300 to-rose-200',
    features: ['40 جلسة خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية كاملة', 'دعم واتساب يومي', 'تصحيح كامل', 'شهادة إتمام', 'جلسات محادثة مجانية', 'تحضير للمقابلات'],
    featured: false,
    cta: 'تواصل معنا',
    waMsg: 'مرحبا، أريد الاشتراك في الباقة الاحترافية',
  },
]

const AVATARS = [
  { letter: 'أ', bg: '#3b82f6' },
  { letter: 'س', bg: '#ec4899' },
  { letter: 'م', bg: '#10b981' },
  { letter: 'ن', bg: '#f97316' },
  { letter: 'ي', bg: '#8b5cf6' },
]

/* ─── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          1. HERO — Duolingo-style, powerful
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-blue-950">

        {/* Floating orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float-2 pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-float-3 pointer-events-none" />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        {/* Spinning ring decoration */}
        <div className="absolute left-16 top-1/3 w-32 h-32 rounded-full border-2 border-dashed border-white/10 animate-spin-slow pointer-events-none hidden lg:block" />
        <div className="absolute right-1/4 bottom-24 w-20 h-20 rounded-full border border-violet-400/20 animate-spin-rev pointer-events-none hidden lg:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text side (right in RTL) */}
            <div>
              {/* Live badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm animate-fade-up">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-sm font-bold text-blue-100">🎯 +5000 تصحيح حتى الآن</span>
              </div>

              {/* Headline */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 animate-fade-up"
                style={{ animationDelay: '80ms' }}
              >
                Stop studying.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #34d399 0%, #60a5fa 50%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Start speaking.
                </span>
              </h1>

              {/* Arabic subtitle */}
              <p
                className="text-xl sm:text-2xl text-blue-200/90 leading-relaxed mb-8 max-w-xl animate-fade-up"
                style={{ animationDelay: '150ms' }}
              >
                صحح إنجليزيتك، اعرف مستواك، وتعلم بطريقة عملية تناسب الطالب العربي
              </p>

              {/* CTAs */}
              <div
                className="flex flex-wrap gap-4 mb-10 animate-fade-up"
                style={{ animationDelay: '220ms' }}
              >
                <Link
                  href="/corrector"
                  className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-500/40 hover:shadow-emerald-400/50 transition-all duration-300 flex items-center gap-2.5 text-lg active:scale-95"
                >
                  <span>🔥</span>
                  ابدأ التصحيح
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/level-test"
                  className="group bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 flex items-center gap-2.5 text-lg active:scale-95"
                >
                  <span>🎯</span>
                  اختبر مستواك
                </Link>
              </div>

              {/* Avatar social proof */}
              <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '290ms' }}>
                <div className="flex items-center">
                  {AVATARS.map((av, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-indigo-950 flex items-center justify-center text-white font-black text-sm"
                      style={{ background: av.bg, marginLeft: i > 0 ? '-10px' : '0', zIndex: AVATARS.length - i }}
                    >
                      {av.letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-blue-200 text-sm font-semibold">+300 طالب يتعلمون الآن</p>
                </div>
              </div>
            </div>

            {/* Visual side (left in RTL) — Corrector Mockup Card */}
            <div className="relative flex justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '180ms' }}>

              {/* Floating badge top */}
              <div className="absolute -top-4 right-4 z-20 bg-white rounded-2xl shadow-2xl px-4 py-2.5 flex items-center gap-2 animate-bounce-light">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="font-black text-gray-900 text-sm leading-tight">تصحيح جديد!</p>
                  <p className="text-gray-400 text-xs">منذ ثانيتين</p>
                </div>
              </div>

              {/* Floating badge bottom-left */}
              <div className="absolute -bottom-4 left-4 z-20 bg-white rounded-2xl shadow-2xl px-4 py-2.5 flex items-center gap-2 animate-float-3">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-black text-gray-900 text-sm leading-tight">مستوى B2</p>
                  <p className="text-emerald-600 text-xs font-bold">+15 نقطة</p>
                </div>
              </div>

              {/* Main mockup card */}
              <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-white/60 text-sm font-bold">✏️ Smart Corrector</span>
                </div>

                {/* Input message */}
                <div className="bg-white/5 border border-white/15 rounded-2xl p-4 mb-4">
                  <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wide">الجملة المُدخلة</p>
                  <p className="text-white text-lg font-semibold line-through decoration-red-400">
                    &ldquo;I goed to the school yesterday.&rdquo;
                  </p>
                </div>

                {/* Correction output */}
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-wide">الجملة الصحيحة</p>
                  </div>
                  <p className="text-white text-lg font-bold">
                    &ldquo;I <span className="text-emerald-300 underline underline-offset-2">went</span> to <span className="text-emerald-300 underline underline-offset-2">school</span> yesterday.&rdquo;
                  </p>
                </div>

                {/* Explanation */}
                <div className="bg-blue-500/15 border border-blue-400/25 rounded-2xl p-4 mb-5">
                  <p className="text-blue-300 text-xs font-bold mb-1.5">💡 الشرح:</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    <strong className="text-white">go</strong> فعل شاذ — ماضيه <strong className="text-emerald-300">went</strong> وليس goed.
                    وكلمة <strong className="text-emerald-300">school</strong> بدون the مع أماكن التعلم.
                  </p>
                </div>

                {/* Action button */}
                <Link
                  href="/corrector"
                  className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
                >
                  جرّب الآن مجاناً ✨
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 70L1440 70L1440 20C1200 60 900 5 600 22C350 37 150 55 0 22Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          1.5 NEWS TICKER — English tips + corrections
      ══════════════════════════════════════════════════ */}
      <NewsTicker />

      {/* ══════════════════════════════════════════════════
          2. TRUST / SOCIAL PROOF STATS
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { value: '+5000', label: 'تصحيح تم', icon: '✏️', grad: 'from-emerald-500 to-teal-500', light: 'from-emerald-50 to-teal-50', text: 'text-emerald-600' },
                { value: '+300',  label: 'طالب نشط',     icon: '🎓', grad: 'from-blue-500 to-indigo-500',  light: 'from-blue-50 to-indigo-50',  text: 'text-blue-600' },
                { value: '5.0',   label: 'تقييم الطلاب', icon: '⭐', grad: 'from-amber-400 to-orange-500', light: 'from-amber-50 to-orange-50', text: 'text-amber-600' },
                { value: '+15',   label: 'دولة عربية',   icon: '🌍', grad: 'from-purple-500 to-pink-500',  light: 'from-purple-50 to-pink-50',  text: 'text-purple-600' },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 80}>
                  <div className={`bg-gradient-to-br ${stat.light} rounded-3xl p-6 text-center border border-white shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.grad} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg text-2xl`}>
                      {stat.icon}
                    </div>
                    <p className={`text-3xl font-black ${stat.text} leading-none mb-1`}>{stat.value}</p>
                    <p className="text-gray-600 font-semibold text-sm">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Avatar trust row */}
          <FadeIn delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <div className="flex items-center">
                {AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-full border-3 border-white flex items-center justify-center text-white font-black text-base shadow"
                    style={{ background: av.bg, marginLeft: i > 0 ? '-10px' : '0', zIndex: AVATARS.length - i, border: '3px solid white' }}
                  >
                    {av.letter}
                  </div>
                ))}
              </div>
              <div className="text-center sm:text-right">
                <p className="font-black text-gray-900 text-lg">انضم إليهم اليوم</p>
                <p className="text-gray-500 text-sm">طلاب من 15+ دولة عربية يتحسنون كل يوم</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-gray-700 font-bold text-sm mr-2 self-center">5.0/5</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3. FEATURES — 3 Big Animated Cards
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-indigo-100 text-indigo-700 font-bold text-sm px-5 py-2 rounded-full mb-4">
                🚀 كل ما تحتاجه في مكان واحد
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
                ثلاث أدوات. نتيجة واحدة.
              </h2>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto">
                طلاقة حقيقية، ثقة حقيقية، تقدم يومي ملموس
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <FadeIn key={f.title} delay={i * 100}>
                  <Link
                    href={f.href}
                    className={`feature-card group block ${f.lightBg} border ${f.border} rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:${f.glow}`}
                  >
                    {/* Top: gradient icon + badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={28} className="text-white" />
                      </div>
                      <span className={`${f.badgeBg} text-xs font-bold px-3 py-1.5 rounded-full`}>{f.badge}</span>
                    </div>

                    {/* Big emoji illustration */}
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 block">
                      {f.illustration}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-gray-900 mb-1">{f.titleAr}</h3>
                    <p className="text-gray-400 font-bold text-sm mb-3">{f.title}</p>
                    <p className="text-gray-600 leading-relaxed">{f.desc}</p>

                    {/* CTA arrow */}
                    <div className={`mt-6 flex items-center gap-2 font-black text-sm bg-gradient-to-r ${f.gradient} bg-clip-text`}
                      style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      جرّب الآن
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-current" style={{ WebkitTextFillColor: 'initial', color: 'inherit' }} />
                    </div>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. HOW IT WORKS — Visual Steps
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block bg-white/10 border border-white/20 text-blue-200 font-bold text-sm px-5 py-2 rounded-full mb-4">
                ⚡ كيف يعمل Inglizi.com
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
                3 خطوات. تقدم حقيقي.
              </h2>
              <p className="text-blue-200/80 text-xl">
                لا تعقيد، لا ملل — فقط نتائج ملموسة
              </p>
            </div>
          </FadeIn>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:block absolute top-12 right-[33%] w-[33%] h-0.5 bg-gradient-to-l from-violet-400/40 to-blue-400/40" />
            <div className="hidden md:block absolute top-12 right-[0%] w-[33%] h-0.5 bg-gradient-to-l from-purple-400/40 to-violet-400/40" />

            {HOW_STEPS.map((step, i) => (
                <FadeIn key={step.num} delay={i * 120}>
                  <div className="glass rounded-3xl p-8 text-center group hover:scale-105 transition-transform duration-300">
                    {/* Step number */}
                    <div className="text-white/20 font-black text-6xl leading-none mb-4">{step.num}</div>

                    {/* Icon circle */}
                    <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-4xl ring-4 ${step.ring} ring-offset-2 ring-offset-transparent group-hover:scale-110 transition-transform duration-300`}>
                      {step.emoji}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                    <p className="text-blue-200/80 leading-relaxed">{step.desc}</p>
                  </div>
                </FadeIn>
            ))}
          </div>

          {/* CTA under steps */}
          <FadeIn delay={400}>
            <div className="text-center mt-14">
              <Link
                href="/corrector"
                className="inline-flex items-center gap-3 bg-white text-indigo-900 hover:bg-blue-50 font-black py-4 px-10 rounded-2xl shadow-2xl transition-all duration-300 text-lg hover:scale-105 active:scale-95"
              >
                <span>✏️</span>
                ابدأ التصحيح مجاناً
                <ArrowLeft size={20} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. COURSES PREVIEW
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-6">
              <span className="inline-block bg-orange-100 text-orange-600 font-bold text-sm px-5 py-2 rounded-full mb-4">
                🎓 باقات التعلم
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
                استثمر في لغتك
              </h2>
              <p className="text-gray-500 text-xl mb-6">
                باقات مرنة تناسب كل مستوى وكل ميزانية
              </p>
              <CountdownTimer label="ينتهي العرض المحدود خلال" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-10">
            {COURSES.map((course, i) => (
              <FadeIn key={course.name} delay={i * 100}>
                <div className={`relative rounded-3xl overflow-hidden h-full flex flex-col ${course.featured ? 'ring-4 ring-violet-400 shadow-2xl shadow-violet-500/20' : 'shadow-sm'}`}>

                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${course.gradient} p-7 relative overflow-hidden shimmer-card`}>
                    {course.badge && (
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-full">
                        {course.badge}
                      </div>
                    )}
                    <div
                      className="text-xs font-black px-3 py-1 rounded-full inline-block mb-4 bg-white/20 text-white"
                    >
                      {course.level}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1">{course.name}</h3>
                    <div className="flex items-end gap-1 mt-2">
                      <span
                        className="text-5xl font-black"
                        style={{
                          background: `linear-gradient(135deg, white, rgba(255,255,255,0.75))`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {course.price}
                      </span>
                      <span className="text-white/70 font-semibold mb-1.5"> درهم / {course.period}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="bg-white flex-1 p-6 border border-gray-100">
                    <ul className="space-y-3 mb-7">
                      {course.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                          <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`https://wa.me/212707902091?text=${encodeURIComponent(course.waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${course.gradient} text-white font-black py-3.5 rounded-2xl shadow-lg hover:opacity-90 transition-opacity active:scale-95`}
                    >
                      <WAIcon size={18} />
                      {course.cta}
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. TESTIMONIALS (existing carousel, re-skinned wrapper)
      ══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <TestimonialsCarousel />
      </div>

      {/* ══════════════════════════════════════════════════
          7. CORRECTOR CTA — Free Tool Push
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <FadeIn>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            {/* Big emoji */}
            <div className="text-7xl mb-6 animate-bounce-light">✏️</div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              جرّبه الآن.
              <br />
              <span className="text-white/80">إنه مجاني 100%</span>
            </h2>

            <p className="text-white/85 text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              اكتب أي جملة بالإنجليزية وتحصل على تصحيح فوري مع شرح كامل — بدون تسجيل، بدون بطاقة، مجاناً للأبد
            </p>

            <Link
              href="/corrector"
              className="animate-pulse-scale inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 font-black py-5 px-12 rounded-2xl shadow-2xl transition-all duration-300 text-xl active:scale-95"
            >
              <span>🚀</span>
              اذهب إلى المصحح
              <ArrowLeft size={22} />
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80 text-sm font-bold">
              <span>✓ بدون تسجيل</span>
              <span>✓ مجاني للأبد</span>
              <span>✓ شرح بالعربية</span>
              <span>✓ فوري ودقيق</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════
          8. LEARNING RADIO — real audio player
      ══════════════════════════════════════════════════ */}
      <AudioRadio />

      {/* ══════════════════════════════════════════════════
          9. BEFORE / AFTER — Transformation Section
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-block bg-red-100 text-red-600 font-bold text-sm px-5 py-2 rounded-full mb-4">
                🔄 التحول الحقيقي
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-2">أين كانوا؟ أين أصبحوا؟</h2>
              <p className="text-gray-500 text-lg">نتائج حقيقية من طلاب حقيقيين</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { before: 'يخشى التحدث أمام الآخرين',   after: 'يجري مقابلات عمل بالإنجليزية' },
              { before: 'يعرف قواعد لكنه لا يتكلم',    after: 'يتواصل بطلاقة مع العملاء' },
              { before: 'يتوقف عند كل كلمة',           after: 'يفكر ويجيب بشكل تلقائي' },
              { before: 'يشعر بالخجل من لهجته',        after: 'يتحدث بثقة ونطق واضح' },
            ].map(({ before, after }, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="flex-1 text-center">
                    <span className="inline-block bg-red-50 text-red-500 text-sm font-bold px-3 py-2 rounded-xl line-through">
                      {before}
                    </span>
                  </div>
                  <div className="text-2xl flex-shrink-0">→</div>
                  <div className="flex-1 text-center">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-2 rounded-xl">
                      {after}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="text-center mt-12">
              <p className="text-gray-500 mb-5 text-lg font-semibold">أنت التالي في هذه القائمة 👆</p>
              <Link
                href="/level-test"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 text-lg active:scale-95"
              >
                اختبر مستواك الآن مجاناً
                <ArrowLeft size={20} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          10. FINAL CTA — WhatsApp
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-950 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <FadeIn>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <div className="text-6xl mb-6 animate-float">🚀</div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              جاهز تتكلم
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #34d399 0%, #60a5fa 50%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                بالإنجليزية بثقة؟
              </span>
            </h2>

            <p className="text-blue-200/85 text-xl mb-10 leading-relaxed">
              أكثر من 300 طالب بدأوا من نفس مكانك. الخطوة الأولى هي التواصل مع حمزة — الرد خلال دقائق.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <a
                href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية%20وأريد%20معرفة%20المزيد%20عن%20البرنامج"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-pulse-scale inline-flex items-center gap-3 bg-[#25d366] hover:bg-[#20b858] text-white font-black py-5 px-10 rounded-2xl shadow-2xl shadow-green-500/40 transition-all duration-300 text-xl active:scale-95"
              >
                <WAIcon size={26} />
                تحدث مع حمزة عبر واتساب
              </a>
              <Link
                href="/level-test"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm text-white font-black py-5 px-10 rounded-2xl transition-all duration-300 text-xl active:scale-95"
              >
                🎯 اختبر مستواك مجاناً
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-blue-200/70 text-sm font-bold">
              <span>✓ تقييم مجاني للمستوى</span>
              <span>✓ بدون التزام مسبق</span>
              <span>✓ رد خلال دقائق</span>
              <span>✓ 15+ دولة عربية</span>
            </div>
          </div>
        </FadeIn>
      </section>

    </main>
  )
}
