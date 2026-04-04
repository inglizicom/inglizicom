import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle,
  Star,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  X,
  MessageCircle,
  Play,
} from 'lucide-react'
import FadeIn from '@/components/FadeIn'
import CourseCard from '@/components/CourseCard'
import { COURSES } from '@/data/courses'

// All color configs defined here so Tailwind JIT picks them up
const COLOR_CONFIG = {
  emerald: {
    heroBg: 'from-emerald-900 via-teal-900 to-gray-900',
    gradientText: 'from-emerald-300 to-teal-300',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    levelPill: 'bg-emerald-500 text-white',
    statBg: 'bg-emerald-500/10 border-emerald-500/20',
    statText: 'text-emerald-400',
    btn: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/40',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    timelineDot: 'bg-emerald-500',
    check: 'text-emerald-500',
    beforeAfterAfter: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    afterText: 'text-emerald-700',
    afterIcon: 'bg-emerald-100 text-emerald-600',
    priceBg: 'bg-emerald-50 border-emerald-100',
    discountBadge: 'bg-emerald-500 text-white',
    spotsBar: 'bg-emerald-500',
  },
  blue: {
    heroBg: 'from-blue-900 via-cyan-900 to-gray-900',
    gradientText: 'from-blue-300 to-cyan-300',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    levelPill: 'bg-blue-500 text-white',
    statBg: 'bg-blue-500/10 border-blue-500/20',
    statText: 'text-blue-400',
    btn: 'from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-blue-500/40',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    timelineDot: 'bg-blue-500',
    check: 'text-blue-500',
    beforeAfterAfter: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    afterText: 'text-blue-700',
    afterIcon: 'bg-blue-100 text-blue-600',
    priceBg: 'bg-blue-50 border-blue-100',
    discountBadge: 'bg-blue-500 text-white',
    spotsBar: 'bg-blue-500',
  },
  violet: {
    heroBg: 'from-violet-900 via-purple-900 to-gray-900',
    gradientText: 'from-violet-300 to-purple-300',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    levelPill: 'bg-violet-500 text-white',
    statBg: 'bg-violet-500/10 border-violet-500/20',
    statText: 'text-violet-400',
    btn: 'from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 shadow-violet-500/40',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-600',
    timelineDot: 'bg-violet-500',
    check: 'text-violet-500',
    beforeAfterAfter: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
    afterText: 'text-violet-700',
    afterIcon: 'bg-violet-100 text-violet-600',
    priceBg: 'bg-violet-50 border-violet-100',
    discountBadge: 'bg-violet-500 text-white',
    spotsBar: 'bg-violet-500',
  },
  orange: {
    heroBg: 'from-orange-900 via-red-900 to-gray-900',
    gradientText: 'from-orange-300 to-red-300',
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    levelPill: 'bg-orange-500 text-white',
    statBg: 'bg-orange-500/10 border-orange-500/20',
    statText: 'text-orange-400',
    btn: 'from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-orange-500/40',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    timelineDot: 'bg-orange-500',
    check: 'text-orange-500',
    beforeAfterAfter: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200',
    afterText: 'text-orange-700',
    afterIcon: 'bg-orange-100 text-orange-600',
    priceBg: 'bg-orange-50 border-orange-100',
    discountBadge: 'bg-orange-500 text-white',
    spotsBar: 'bg-orange-500',
  },
}


const TIMELINE_STEPS = [
  {
    num: '01',
    title: 'سجّل في الكورس',
    desc: 'تواصل مع الأستاذ عبر واتساب وأتمّ عملية التسجيل في دقائق',
  },
  {
    num: '02',
    title: 'شاهد الدروس المسجلة',
    desc: 'ادرس بالسرعة التي تناسبك في أي وقت ومن أي مكان دون قيود',
  },
  {
    num: '03',
    title: 'سجّل صوتك وأرسله',
    desc: 'بعد كل درس، سجّل الجمل والتمارين المطلوبة وأرسلها للأستاذ',
  },
  {
    num: '04',
    title: 'استلم تصحيحاً شخصياً',
    desc: 'الأستاذ يسمع صوتك ويعطيك تغذية راجعة مفصلة وخطوات للتحسين',
  },
  {
    num: '05',
    title: 'طبّق وكرّر',
    desc: 'طبّق الملاحظات وكرّر حتى يصبح النطق الصحيح طبيعياً وتلقائياً',
  },
  {
    num: '06',
    title: 'اجتز اختبار LIVE',
    desc: 'محادثة حقيقية مباشرة مع الأستاذ عبر Google Meet تُثبت تقدمك',
  },
]

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = COURSES.find((c) => c.slug === params.slug)
  if (!course) return { title: 'كورس غير موجود' }
  return {
    title: `${course.title} (${course.fromLevel}→${course.toLevel}) | إنجليزي`,
    description: `${course.hook} — ${course.description}`,
  }
}

export default function CourseDetailPage({ params }: PageProps) {
  const course = COURSES.find((c) => c.slug === params.slug)
  if (!course) notFound()

  const c = COLOR_CONFIG[course.colorKey]
  const discountPct = Math.round((1 - course.price / course.originalPrice) * 100)
  const otherCourses = COURSES.filter((co) => co.slug !== course.slug).slice(0, 2)

  const waEnroll = `https://wa.me/212707902091?text=${encodeURIComponent(
    `مرحباً، أريد التسجيل في كورس ${course.title} (${course.fromLevel}→${course.toLevel}) بسعر ${course.price} ${course.currency}`
  )}`
  const waInfo = `https://wa.me/212707902091?text=${encodeURIComponent(
    `مرحباً، لدي سؤال عن كورس ${course.title}`
  )}`

  const spotsTotal = 10
  const spotsFilled = spotsTotal - course.spotsLeft

  return (
    <main className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${c.heroBg} py-20 px-4`}>
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors duration-200 text-sm font-medium mb-8"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للكورسات
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-sm font-black px-4 py-1.5 rounded-full ${c.levelPill}`}>
                  {course.fromLevel} → {course.toLevel}
                </span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.badge}`}>
                  {course.badge}
                </span>
                {course.spotsLeft <= 5 && (
                  <span className="text-xs font-black px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse-slow">
                    🔥 {course.spotsLeft} مقاعد فقط
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
                {course.title}
              </h1>

              <p
                className={`text-xl font-bold bg-gradient-to-r ${c.gradientText} bg-clip-text text-transparent mb-5`}
              >
                {course.hook}
              </p>

              <p className="text-gray-300 leading-relaxed mb-8 text-base">{course.description}</p>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  { icon: <Star className="w-4 h-4" />, val: `${course.rating}`, sub: 'تقييم' },
                  { icon: <Users className="w-4 h-4" />, val: course.studentsCount, sub: 'طالب' },
                  { icon: <Clock className="w-4 h-4" />, val: `${course.weeks}`, sub: 'أسابيع' },
                  { icon: <BookOpen className="w-4 h-4" />, val: `${course.lessons}`, sub: 'درس' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-3 border text-center ${c.statBg} border-opacity-20`}
                  >
                    <div className={`flex justify-center mb-1 ${c.statText}`}>{stat.icon}</div>
                    <div className="text-white font-black text-lg">{stat.val}</div>
                    <div className="text-gray-400 text-xs">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waEnroll}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r ${c.btn} text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95`}
                >
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  سجّل الآن
                </a>
                <a
                  href={waInfo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5" />
                  اسأل عن الكورس
                </a>
              </div>
            </div>

            {/* Right: Image + Price Card */}
            <div className="flex flex-col gap-6">
              {/* Course image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-7 h-7 text-white fill-white" />
                  </div>
                </div>
              </div>

              {/* Price card */}
              <div className={`bg-white rounded-3xl p-6 border shadow-xl ${c.priceBg}`}>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-gray-900">{course.price}</span>
                      <span className="text-lg font-bold text-gray-500">{course.currency}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm text-gray-400 line-through">
                        {course.originalPrice} {course.currency}
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${c.discountBadge}`}
                      >
                        خصم {discountPct}%
                      </span>
                    </div>
                  </div>
                  {course.isBestValue && (
                    <span className="text-xs font-black bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                      ⭐ الأفضل قيمة
                    </span>
                  )}
                </div>

                {/* Spots bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>المقاعد المتبقية</span>
                    <span className="text-red-500">{course.spotsLeft} مقاعد فقط</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.spotsBar} transition-all duration-1000`}
                      style={{ width: `${(spotsFilled / spotsTotal) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {spotsFilled} من {spotsTotal} مقاعد محجوزة
                  </p>
                </div>

                <a
                  href={waEnroll}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3.5 px-6 rounded-2xl text-white font-black text-base bg-gradient-to-r ${c.btn} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95`}
                >
                  احجز مقعدك الآن ←
                </a>
                <p className="text-xs text-center text-gray-400 mt-3">
                  ✅ ضمان استرداد 14 يوم · بدون مخاطرة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU WILL LEARN ===== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                ماذا ستتعلم في هذا الكورس؟
              </h2>
              <p className="text-gray-500 text-lg">{course.promise}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.features.map((feat, i) => (
              <FadeIn key={i} direction="up" delay={i * 80}>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${c.iconBg}`}>
                    <CheckCircle className={`w-4 h-4 ${c.iconText}`} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{feat}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                ماذا يشمل الكورس؟
              </h2>
              <p className="text-gray-500 text-lg">
                كل ما تحتاجه لتحقيق نتيجة حقيقية ودائمة
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.detailFeatures.map((feat, i) => (
                <FadeIn key={i} direction="up" delay={i * 80}>
                  <div className="group bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-400 hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-2">{feat.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS TIMELINE ===== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                كيف يعمل الكورس؟
              </h2>
              <p className="text-gray-500 text-lg">6 خطوات واضحة تأخذك من البداية للنتيجة</p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute right-[27px] top-8 bottom-8 w-0.5 bg-gray-100 hidden sm:block" />

            <div className="space-y-6">
              {TIMELINE_STEPS.map((step, i) => (
                <FadeIn key={i} direction="right" delay={i * 100}>
                  <div className="flex gap-6 items-start">
                    <div
                      className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${c.timelineDot} z-10`}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <h3 className="font-black text-gray-900 text-base mb-1.5">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                التحول الذي ستعيشه
              </h2>
              <p className="text-gray-500 text-lg">قبل وبعد إتمام هذا الكورس</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Before */}
            <FadeIn direction="right">
              <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">قبل الكورس</h3>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    &ldquo;{course.beforeState}&rdquo;
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {['التردد قبل كل جملة', 'الترجمة المستمرة في الذهن', 'الخوف من الأخطاء'].map(
                    (t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-gray-500">
                        <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        {t}
                      </div>
                    )
                  )}
                </div>
              </div>
            </FadeIn>

            {/* After */}
            <FadeIn direction="left">
              <div className={`rounded-3xl p-8 border shadow-sm ${c.beforeAfterAfter}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${c.afterIcon}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">بعد الكورس</h3>
                </div>
                <div className="bg-white/70 rounded-2xl p-5 border border-white">
                  <p className={`leading-relaxed font-bold ${c.afterText}`}>
                    &ldquo;{course.afterState}&rdquo;
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {['كلام سلس وطبيعي بدون توقف', 'التفكير مباشرة بالإنجليزية', 'ثقة حقيقية في كل موقف'].map(
                    (t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${c.check}`} />
                        {t}
                      </div>
                    )
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== WHATSAPP CTA (centered, big) ===== */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <div className="text-5xl mb-6">💬</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              لديك سؤال عن هذا الكورس؟
            </h2>
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              تواصل مع الأستاذ مباشرة عبر واتساب وهو يجيبك
              <br className="hidden sm:block" />
              على كل أسئلتك في أقل من ساعة — مجاناً تماماً.
            </p>
            <p className="text-gray-500 text-sm mb-10">
              لا تتردد — حتى لو كان سؤالك بسيطاً، الأستاذ هنا ليساعدك
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={waEnroll}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                سجّل في الكورس الآن
              </a>
              <a
                href={waInfo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-base px-8 py-5 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                اسأل عن الكورس
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== URGENCY SECTION ===== */}
      <section className="py-12 px-4 bg-gradient-to-r from-red-600 to-rose-600">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  🔥 تبقّى {course.spotsLeft} مقاعد فقط!
                </h3>
                <p className="text-red-100 text-sm">
                  الأستاذ لا يقبل أكثر من {spotsTotal} طلاب في المجموعة للحفاظ على جودة المتابعة
                </p>
              </div>
              <a
                href={waEnroll}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-red-600 font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                احجز مقعدك الآن
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== OTHER COURSES ===== */}
      {otherCourses.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                  اكتشف المستويات الأخرى
                </h2>
                <p className="text-gray-500">خطط مسارك الكامل من الصفر حتى الاحتراف</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherCourses.map((c2, i) => (
                <FadeIn key={c2.id} direction="up" delay={i * 120}>
                  <CourseCard course={c2} />
                </FadeIn>
              ))}
            </div>

            <FadeIn direction="up" delay={200}>
              <div className="text-center mt-10">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors duration-200"
                >
                  <ArrowRight className="w-4 h-4" />
                  عرض جميع الكورسات
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ===== MOBILE STICKY CTA ===== */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{course.price}</span>
              <span className="text-sm font-bold text-gray-500">{course.currency}</span>
            </div>
            <p className="text-xs text-red-500 font-bold">{course.spotsLeft} مقاعد فقط!</p>
          </div>
          <a
            href={waEnroll}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r ${c.btn} text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all duration-300 active:scale-95`}
          >
            سجّل الآن ←
          </a>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky bar */}
      <div className="h-20 md:hidden" />
    </main>
  )
}
