'use client'

import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import { COURSES } from '@/data/courses'
import { CheckCircle2, ArrowLeft, Play, Mic, Brain, MessageSquare, Zap, Star, Shield } from 'lucide-react'

/* ─── WhatsApp ─────────────────────────────────────────── */
const WA_BASE = 'https://wa.me/212707902091?text='
const WA_GENERAL = WA_BASE + encodeURIComponent('مرحباً، أريد معرفة المزيد عن الدورات')
const WA_LIVE    = WA_BASE + encodeURIComponent('مرحباً، أريد حجز حصة مباشرة مع المدرب')
const WA_START   = WA_BASE + encodeURIComponent('مرحباً، أريد البدء في رحلة تعلم الإنجليزية')

function WAIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/* ─── Color maps for courses ────────────────────────────── */
const COLOR_MAP: Record<string, { gradient: string; ring: string; badge: string; tag: string }> = {
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700',
    tag: 'text-emerald-400',
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    tag: 'text-blue-400',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-400',
    badge: 'bg-violet-100 text-violet-700',
    tag: 'text-violet-400',
  },
  orange: {
    gradient: 'from-orange-500 to-rose-500',
    ring: 'ring-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    tag: 'text-orange-400',
  },
}

const AVATARS = [
  { letter: 'أ', bg: '#3b82f6' },
  { letter: 'س', bg: '#ec4899' },
  { letter: 'م', bg: '#10b981' },
  { letter: 'ن', bg: '#f97316' },
  { letter: 'ي', bg: '#8b5cf6' },
]

const PILLARS = [
  {
    icon: '🎧',
    title: 'الاستماع أولاً',
    desc: 'منهج مبني على فهم اللغة من خلال الاستماع المكثف قبل الكلام — طريقة الأطفال الطبيعية',
    color: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50',
  },
  {
    icon: '🤝',
    title: 'ذكاء اصطناعي + متابعة بشرية',
    desc: 'أدوات ذكية تصحح تلقائياً، والأستاذ يتابعك شخصياً بعد كل درس — الأفضل من العالمين',
    color: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
  },
  {
    icon: '🎤',
    title: 'تحدث بثقة حقيقية',
    desc: 'تمارين كلام حقيقية، تصحيح صوتي شخصي، واختبار محادثة LIVE مع الأستاذ في النهاية',
    color: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50',
  },
]

const TRANSFORMATIONS = [
  {
    before: 'كنت تفهم بصعوبة وتتوقف عند كل كلمة',
    after: 'أصبحت تتحدث بثقة وتفكر بالإنجليزية مباشرة',
  },
  {
    before: 'كنت تخشى الكلام أمام الآخرين',
    after: 'أصبحت تجري مقابلات عمل باحتراف',
  },
  {
    before: 'كنت تترجم كل جملة في رأسك',
    after: 'أصبحت تجيب بشكل تلقائي وعفوي',
  },
]

const TOOLS = [
  {
    icon: '🎧',
    title: 'مدرّب الاستماع',
    desc: 'استمع لمقاطع حقيقية وطور فهمك التلقائي للغة',
    href: '/listen',
    badge: 'مجاني',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '✏️',
    title: 'المصحح الذكي',
    desc: 'اكتب جملة واحصل على تصحيح فوري مع شرح بالعربية',
    href: '/corrector',
    badge: 'مجاني',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: '🎤',
    title: 'تمارين الكلام',
    desc: 'تمارين صوتية تفاعلية لتحسين نطقك وطلاقتك',
    href: '/practice',
    badge: 'مجاني',
    color: 'from-violet-500 to-purple-600',
  },
]

/* ─── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="overflow-x-hidden" dir="rtl">

      {/* ══════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950">

        {/* Floating orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-float-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        {/* Decorative rings */}
        <div className="absolute left-16 top-1/3 w-40 h-40 rounded-full border-2 border-dashed border-white/8 animate-spin-slow pointer-events-none hidden lg:block" />
        <div className="absolute right-1/4 bottom-24 w-24 h-24 rounded-full border border-blue-400/15 animate-spin-rev pointer-events-none hidden lg:block" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-32 w-full text-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 mb-10 backdrop-blur-sm animate-fade-up">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-sm font-bold text-blue-100">مقاعد محدودة — التسجيل مفتوح الآن</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            تعلّم الإنجليزية بثقة
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              مع دورات احترافية وحصص مباشرة
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl text-blue-200/90 leading-relaxed mb-10 max-w-3xl mx-auto animate-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            من الصفر حتى الاحتراف مع متابعة حقيقية وتمارين تفاعلية
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <Link
              href="/courses"
              className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-400/50 transition-all duration-300 flex items-center justify-center gap-3 text-lg active:scale-95"
            >
              🚀 ابدأ الآن
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg active:scale-95"
            >
              <Play size={18} className="fill-white" />
              شاهد كيف يعمل
            </a>
          </div>

          {/* Trust line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '290ms' }}>
            <div className="flex items-center gap-3">
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
              <div className="text-right">
                <div className="flex gap-0.5 justify-end mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-blue-200/90 text-sm font-bold">+1000 طالب | نتائج حقيقية</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3 text-blue-200/80 text-sm font-semibold">
              <Shield size={16} className="text-emerald-400" />
              ضمان استرداد 14 يوم
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
          2. COURSES SECTION — MAIN FOCUS
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-white" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <span className="inline-block bg-blue-50 text-blue-600 text-sm font-black px-5 py-2 rounded-full mb-5 border border-blue-100 uppercase tracking-wide">
                📚 الدورات المتاحة
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                كل دورة — رحلة تحول حقيقية
              </h2>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
                اختر مستواك وابدأ رحلتك اليوم مع متابعة شخصية وتصحيح صوتي حقيقي
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8">
            {COURSES.map((course, index) => {
              const colors = COLOR_MAP[course.colorKey]
              const waMsg = WA_BASE + encodeURIComponent(`مرحباً، أريد الاشتراك في دورة ${course.title}`)
              return (
                <FadeIn key={course.id} direction="up" delay={index * 100}>
                  <div className={`relative group rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full ${course.isBestValue ? `ring-2 ring-offset-2 ${colors.ring}` : 'border border-gray-100'}`}>

                    {/* Best value ribbon */}
                    {course.isBestValue && (
                      <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                        ⭐ الأفضل قيمة
                      </div>
                    )}

                    {/* Header gradient */}
                    <div className={`bg-gradient-to-br ${colors.gradient} p-7 relative overflow-hidden`}>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                      {/* Level badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                          {course.fromLevel} → {course.toLevel}
                        </span>
                        {course.spotsLeft <= 3 && (
                          <span className="bg-red-500/80 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            {course.spotsLeft} مقاعد فقط
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-white mb-1">{course.title}</h3>
                      <p className="text-white/75 text-sm mb-5">{course.subtitle}</p>

                      {/* Price */}
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{course.price}</span>
                        <div className="mb-1">
                          <span className="text-white/70 text-sm">{course.currency}</span>
                          <div className="text-white/50 text-xs line-through">{course.originalPrice} {course.currency}</div>
                        </div>
                        <span className="mb-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% خصم
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold mb-5 pb-4 border-b border-gray-100">
                        <span>📅 {course.weeks} أسبوع</span>
                        <span>🎬 {course.lessons} درس</span>
                        <span>👥 {course.studentsCount} طالب</span>
                      </div>

                      <ul className="space-y-3 mb-6 flex-1">
                        {[
                          'فيديوهات مسجلة عالية الجودة',
                          'متابعة بعد كل درس',
                          'تصحيح صوتي شخصي',
                          'اختبار محادثة LIVE',
                        ].map((feat) => (
                          <li key={feat} className="flex items-center gap-3 text-gray-700 text-sm">
                            <CheckCircle2 size={16} className={`flex-shrink-0 ${colors.tag}`} />
                            {feat}
                          </li>
                        ))}
                      </ul>

                      {/* Promise */}
                      <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold mb-1">الوعد بعد الدورة:</p>
                        <p className="text-gray-700 text-sm font-semibold leading-snug">{course.promise}</p>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex gap-3">
                        <a
                          href={waMsg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${colors.gradient} text-white font-black py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 active:scale-95 text-sm`}
                        >
                          <WAIcon size={16} />
                          احجز الآن
                        </a>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-bold text-sm transition-all duration-200"
                        >
                          تفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          <FadeIn direction="up" delay={400}>
            <p className="text-center text-sm text-gray-400 mt-10 font-medium">
              💳 السعر يشمل جميع الدروس والمتابعة وتصحيح النطق واختبار المحادثة LIVE
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3. LIVE CLASSES SECTION
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-indigo-950 via-violet-950 to-blue-950 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-10 right-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <FadeIn direction="right">
              <div>
                <span className="inline-block bg-white/10 border border-white/20 text-blue-200 text-sm font-bold px-5 py-2.5 rounded-full mb-7">
                  🔴 بث مباشر مع المدرب
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                  حصص مباشرة
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    مع المدرب
                  </span>
                </h2>

                <p className="text-blue-200/80 text-lg leading-relaxed mb-8">
                  تعلم الإنجليزية مع أستاذ عربي يفهم احتياجاتك تماماً — تصحيح فوري، تفاعل حقيقي، ونتائج ملموسة منذ الحصة الأولى.
                </p>

                <ul className="space-y-4 mb-10">
                  {[
                    { icon: MessageSquare, text: 'تفاعل مباشر في الوقت الحقيقي' },
                    { icon: Zap,           text: 'تصحيح فوري للأخطاء أثناء الكلام' },
                    { icon: Brain,         text: 'تمارين واقعية من الحياة اليومية' },
                    { icon: Mic,           text: 'تدريب على النطق الصحيح شخصياً' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.text} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-blue-300" />
                        </div>
                        <span className="text-white font-semibold">{item.text}</span>
                      </li>
                    )
                  })}
                </ul>

                <a
                  href={WA_LIVE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-4 px-9 rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
                >
                  <WAIcon size={20} />
                  احجز حصتك الآن
                </a>
              </div>
            </FadeIn>

            {/* Visual card */}
            <FadeIn direction="left" delay={150}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">

                {/* Live indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                    <span className="text-white font-black text-sm">LIVE الآن</span>
                  </div>
                  <span className="text-white/50 text-sm">Google Meet</span>
                </div>

                {/* Participants */}
                <div className="space-y-3 mb-6">
                  {[
                    { name: 'الأستاذ حمزة', role: 'المدرب', color: 'from-blue-500 to-indigo-600', mic: true },
                    { name: 'أحمد', role: 'طالب', color: 'from-emerald-500 to-teal-600', mic: true },
                    { name: 'سارة', role: 'طالبة', color: 'from-pink-500 to-rose-600', mic: false },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-4 bg-white/8 rounded-2xl p-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${p.color} rounded-full flex items-center justify-center text-white font-black text-lg`}>
                        {p.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{p.name}</p>
                        <p className="text-white/50 text-xs">{p.role}</p>
                      </div>
                      {p.mic ? (
                        <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                          <Mic size={14} className="text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                          <Mic size={14} className="text-white/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message bubble */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
                  <p className="text-blue-300 text-xs font-bold mb-1">💬 الأستاذ حمزة:</p>
                  <p className="text-white text-sm leading-relaxed">&ldquo;ممتاز! الآن دعنا نتمرن على وصف يومك بالإنجليزية...&rdquo;</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. WHY THIS SYSTEM
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-sm font-black px-5 py-2 rounded-full mb-5 border border-indigo-100 uppercase tracking-wide">
                ⚡ لماذا هذا النظام؟
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                3 ركائز تجعلنا مختلفين
              </h2>
              <p className="text-gray-500 text-xl max-w-xl mx-auto">
                الفرق ليس في المحتوى فقط — الفرق في النهج الكامل
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map((pillar, i) => (
              <FadeIn key={pillar.title} direction="up" delay={i * 120}>
                <div className={`group rounded-3xl p-8 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 ${pillar.light}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{pillar.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{pillar.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. TRANSFORMATION — Before / After
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <span className="inline-block bg-red-50 text-red-600 text-sm font-black px-5 py-2 rounded-full mb-5 border border-red-100 uppercase tracking-wide">
                🔄 التحول الحقيقي
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                أين كنت؟ أين ستصبح؟
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                نتائج حقيقية من طلاب حقيقيين — هذا ما يحدث عندما تلتزم بالمنهج
              </p>
            </div>
          </FadeIn>

          <div className="space-y-5">
            {TRANSFORMATIONS.map((t, i) => (
              <FadeIn key={i} direction="up" delay={i * 100}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl p-5">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl">❌</div>
                    <p className="text-gray-600 font-semibold">{t.before}</p>
                  </div>
                  {/* After */}
                  <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 text-xl">✅</div>
                    <p className="text-gray-800 font-bold">{t.after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <div className="bg-white">
        <TestimonialsCarousel />
      </div>

      {/* ══════════════════════════════════════════════════
          7. FINAL CTA — STRONG
      ══════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800">
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <FadeIn direction="up">
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            {/* Gold badge */}
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-sm px-5 py-2.5 rounded-full mb-8">
              🏆 انضم لأكثر من 1000 طالب ناجح
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              ابدأ رحلتك الآن
            </h2>

            <p className="text-blue-200/90 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              لا تؤجل أكثر. كل يوم تنتظر هو يوم ضائع.
              <br className="hidden sm:block" />
              المقاعد محدودة — سجّل اليوم.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-10">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-center gap-3 bg-white text-indigo-700 font-black py-5 px-12 rounded-2xl shadow-2xl hover:shadow-white/20 hover:bg-blue-50 transition-all duration-300 text-xl hover:scale-105 active:scale-95"
              >
                🚀 ابدأ الآن
                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <a
                href={WA_START}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25d366] hover:bg-[#20c05c] text-white font-black py-5 px-12 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 text-xl hover:scale-105 active:scale-95"
              >
                <WAIcon size={24} />
                تواصل معنا عبر واتساب
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm font-semibold">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> ضمان 14 يوم</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> متابعة شخصية</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> نتائج مضمونة</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> رد خلال ساعة</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════
          8. TOOLS SECTION — FREE (LAST)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <span className="inline-block bg-gray-200 text-gray-600 text-xs font-black px-5 py-2 rounded-full mb-5 uppercase tracking-wider">
                🤖 أدواتنا الذكية
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">
                أدواتنا الذكية
                <span className="text-gray-400 font-bold"> (لفترة محدودة مجاناً)</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                استخدم أدواتنا مجاناً لفترة محدودة، ثم انتقل للمستوى الاحترافي
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TOOLS.map((tool, i) => (
              <FadeIn key={tool.title} direction="up" delay={i * 100}>
                <Link
                  href={tool.href}
                  className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-gray-800">{tool.title}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
                  <div className="mt-4 text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors flex items-center gap-1">
                    جرّب الآن
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
