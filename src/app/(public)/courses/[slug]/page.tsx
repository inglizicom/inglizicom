import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, Star, Users, Clock, BookOpen, ArrowRight, ArrowLeft,
  X, MessageCircle, Play, Shield, Flame,
} from 'lucide-react'
import FadeIn from '@/components/FadeIn'
import SubscribeButton from '@/components/SubscribeButton'
import ApproxPrice from '@/components/ApproxPrice'
import CourseCardDark from '@/components/course/CourseCardDark'
import { COURSES } from '@/data/courses'
import { getPlanByCourseSlug, PAYMENT_WHATSAPP } from '@/data/plans'

/* Dark palette per level — full class strings so Tailwind's scanner keeps them. */
const COLOR_CONFIG = {
  emerald: {
    aura: 'from-emerald-500/25 via-teal-500/10',
    grad: 'from-emerald-700 to-teal-600',
    accent: 'text-emerald-600', pill: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-500/60', ring: 'ring-emerald-500/20',
    cta: 'bg-brand-700 hover:bg-brand-800 text-white',
    dot: 'bg-emerald-500 text-gray-900', bar: 'bg-emerald-500',
  },
  blue: {
    aura: 'from-blue-500/25 via-cyan-500/10',
    grad: 'from-blue-700 to-cyan-600',
    accent: 'text-blue-600', pill: 'bg-blue-50 text-blue-700',
    border: 'border-blue-500/60', ring: 'ring-blue-500/20',
    cta: 'bg-brand-700 hover:bg-brand-800 text-white',
    dot: 'bg-blue-500 text-white', bar: 'bg-blue-500',
  },
  violet: {
    aura: 'from-violet-500/25 via-fuchsia-500/10',
    grad: 'from-violet-700 to-fuchsia-600',
    accent: 'text-violet-600', pill: 'bg-violet-50 text-violet-700',
    border: 'border-violet-500/60', ring: 'ring-violet-500/20',
    cta: 'bg-brand-700 hover:bg-brand-800 text-white',
    dot: 'bg-violet-500 text-white', bar: 'bg-violet-500',
  },
  orange: {
    aura: 'from-orange-500/25 via-amber-500/10',
    grad: 'from-orange-700 to-amber-400',
    accent: 'text-orange-600', pill: 'bg-orange-50 text-orange-700',
    border: 'border-orange-500/60', ring: 'ring-orange-500/20',
    cta: 'bg-brand-700 hover:bg-brand-800 text-white',
    dot: 'bg-orange-500 text-gray-900', bar: 'bg-orange-500',
  },
}

const TIMELINE_STEPS = [
  { num: '01', title: 'سجّل في الكورس',       desc: 'تواصل مع الأستاذ عبر واتساب وأتمّ عملية التسجيل في دقائق' },
  { num: '02', title: 'شاهد الدروس المسجلة',  desc: 'ادرس بالسرعة التي تناسبك في أي وقت ومن أي مكان دون قيود' },
  { num: '03', title: 'سجّل صوتك وأرسله',      desc: 'بعد كل درس، سجّل الجمل والتمارين المطلوبة وأرسلها للأستاذ' },
  { num: '04', title: 'استلم تصحيحاً شخصياً',  desc: 'الأستاذ يسمع صوتك ويعطيك تغذية راجعة مفصلة وخطوات للتحسين' },
  { num: '05', title: 'طبّق وكرّر',            desc: 'طبّق الملاحظات وكرّر حتى يصبح النطق الصحيح طبيعياً وتلقائياً' },
  { num: '06', title: 'اجتز اختبار LIVE',      desc: 'محادثة حقيقية مباشرة مع الأستاذ عبر Google Meet تُثبت تقدمك' },
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
    alternates: { canonical: `https://inglizi.com/courses/${course.slug}` },
  }
}

export default function CourseDetailPage({ params }: PageProps) {
  const course = COURSES.find((c) => c.slug === params.slug)
  if (!course) notFound()

  const c = COLOR_CONFIG[course.colorKey]

  /* plans.ts is the single source of truth for money — courses.ts only fills in
     for a level that has no plan behind it yet. */
  const plan     = getPlanByCourseSlug(course.slug)
  const price    = plan?.amount_mad     ?? course.price
  const original = plan?.originalAmount ?? course.originalPrice
  const discountPct = original > price ? Math.round((1 - price / original) * 100) : null

  const otherCourses = COURSES.filter((co) => co.slug !== course.slug).slice(0, 2)

  const waInfo = `https://wa.me/${PAYMENT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(
    `مرحباً، لدي سؤال عن كورس ${course.title}`
  )}`

  const spotsTotal = 10
  const spotsFilled = spotsTotal - course.spotsLeft

  return (
    <main className="min-h-screen bg-white pt-[80px]" dir="rtl">

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden px-4 pt-8 pb-16">
        <div
          aria-hidden
          className={`pointer-events-none absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/3 w-[760px] h-[620px] rounded-full blur-3xl bg-gradient-to-b ${c.aura} to-transparent`}
        />

        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold mb-8 no-underline"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للكورسات
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* ── the pitch ── */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`text-xs font-black px-3 py-1.5 rounded-full ${c.pill} border border-slate-200`}>
                  {course.fromLevel} → {course.toLevel}
                </span>
                {course.badge && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    {course.badge}
                  </span>
                )}
                {course.spotsLeft <= 5 && (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-500/25">
                    <Flame className="w-3 h-3" /> {course.spotsLeft} مقاعد فقط
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 leading-[1.15]">
                {course.title}
              </h1>

              <p className={`text-xl font-black bg-gradient-to-l ${c.grad} bg-clip-text text-transparent mb-5 leading-relaxed`}>
                {course.hook}
              </p>

              <p className="text-slate-600 leading-relaxed mb-8">{course.description}</p>

              <div className="grid grid-cols-4 gap-2.5 mb-8">
                {[
                  { icon: Star,     val: `${course.rating}`,      sub: 'تقييم' },
                  { icon: Users,    val: course.studentsCount,    sub: 'طالب' },
                  { icon: Clock,    val: `${course.weeks}`,       sub: 'أسابيع' },
                  { icon: BookOpen, val: `${course.lessons}`,     sub: 'درس' },
                ].map((stat) => (
                  <div key={stat.sub} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                    <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${c.accent}`} />
                    <div className="text-slate-900 font-black">{stat.val}</div>
                    <div className="text-slate-500 text-[11px] font-bold">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <SubscribeButton
                  source={`course_detail_hero_${course.slug}`}
                  planId={plan?.id}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-black text-base px-8 py-4 rounded-2xl transition-colors ${c.cta}`}
                >
                  سجّل الآن <ArrowLeft className="w-5 h-5" />
                </SubscribeButton>
                <Link
                  href={`/courses/${course.slug}/watch`}
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-colors no-underline"
                >
                  <Play className="w-5 h-5" />
                  شاهد الدروس المجانية
                </Link>
              </div>
            </div>

            {/* ── cover + offer ── */}
            <div className="flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="relative rounded-3xl overflow-hidden aspect-video border border-slate-200">
                <Image
                  src={course.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-45"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <Link
                  href={`/courses/${course.slug}/watch`}
                  aria-label="شاهد الدروس المجانية"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <span className="w-16 h-16 bg-brand-700/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-white fill-white" />
                  </span>
                </Link>
              </div>

              <div className={`bg-slate-50 rounded-3xl p-6 border-2 ${c.border} ring-2 ${c.ring}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-black text-slate-900">{price.toLocaleString('en-US')}</span>
                      <span className="text-slate-600 font-bold">{course.currency}</span>
                      {original > price && (
                        <span className="text-slate-400 text-sm line-through">{original.toLocaleString('en-US')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <ApproxPrice mad={price} className={`${c.accent} text-xs font-bold`} />
                      {discountPct && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[11px] font-black px-2 py-0.5 rounded-md">
                          <Flame className="w-3 h-3" /> خصم {discountPct}%
                        </span>
                      )}
                    </div>
                  </div>
                  {course.isBestValue && (
                    <span className="shrink-0 text-[10px] font-black bg-amber-500/10 text-amber-700 border border-amber-500/25 px-2.5 py-1 rounded-full">
                      ⭐ الأفضل قيمة
                    </span>
                  )}
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>المقاعد المتبقية</span>
                    <span className="text-rose-600">{course.spotsLeft} مقاعد فقط</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(spotsFilled / spotsTotal) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {spotsFilled} من {spotsTotal} مقاعد محجوزة
                  </p>
                </div>

                <SubscribeButton
                  source={`course_detail_price_${course.slug}`}
                  planId={plan?.id}
                  className={`block w-full text-center py-3.5 px-6 rounded-2xl font-black transition-colors ${c.cta}`}
                >
                  احجز مقعدك الآن ←
                </SubscribeButton>

                {plan && (
                  <Link
                    href={`/pricing/${plan.id}`}
                    className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-xs font-black transition-colors no-underline"
                  >
                    التفاصيل الكاملة والرحلة <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                )}

                <p className="text-[11px] text-center text-slate-400 mt-3">
                  ضمان الأسبوع الأول · تفعيل خلال 24 ساعة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHAT YOU WILL LEARN ═══════ */}
      <section className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">— المحتوى —</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">ماذا ستتعلم في هذا الكورس؟</h2>
              <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">{course.promise}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.features.map((feat, i) => (
              <FadeIn key={feat} direction="up" delay={i * 70}>
                <div className="flex items-center gap-3.5 bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
                  <span className={`shrink-0 w-8 h-8 rounded-lg ${c.pill} flex items-center justify-center`}>
                    <CheckCircle className={`w-4 h-4 ${c.accent}`} />
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{feat}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED ═══════ */}
      <section className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">— يشمل —</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">ماذا يشمل الكورس؟</h2>
              <p className="text-slate-500">كل ما تحتاجه لتحقيق نتيجة حقيقية ودائمة</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.detailFeatures.map((feat, i) => (
              <FadeIn key={feat.title} direction="up" delay={i * 70}>
                <div className="h-full bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="text-3xl mb-4">{feat.icon}</div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">— الطريق —</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">كيف يعمل الكورس؟</h2>
              <p className="text-slate-500">6 خطوات واضحة تأخذك من البداية للنتيجة</p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className={`absolute right-[27px] top-8 bottom-8 w-px bg-gradient-to-b ${c.grad} opacity-30 hidden sm:block`} />

            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, i) => (
                <FadeIn key={step.num} direction="right" delay={i * 90}>
                  <div className="flex gap-5 items-start">
                    <div className={`relative z-10 shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black ${c.dot}`}>
                      {step.num}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
                      <h3 className="font-black text-slate-900 mb-1.5">{step.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BEFORE / AFTER ═══════ */}
      <section className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-10">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">— التحوّل —</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">التحول الذي ستعيشه</h2>
              <p className="text-slate-500">قبل وبعد إتمام هذا الكورس</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FadeIn direction="right">
              <div className="h-full bg-slate-50 rounded-3xl p-7 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
                    <X className="w-4 h-4 text-rose-600" />
                  </span>
                  <h3 className="font-black text-slate-900">قبل الكورس</h3>
                </div>
                <p className="text-slate-700 leading-relaxed bg-white rounded-2xl p-5 border border-slate-200">
                  &ldquo;{course.beforeState}&rdquo;
                </p>
                <div className="mt-4 space-y-2.5">
                  {['التردد قبل كل جملة', 'الترجمة المستمرة في الذهن', 'الخوف من الأخطاء'].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
                      <X className="w-3.5 h-3.5 text-rose-600/70 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className={`h-full bg-slate-50 rounded-3xl p-7 border-2 ${c.border}`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`w-9 h-9 ${c.pill} rounded-lg flex items-center justify-center shrink-0`}>
                    <CheckCircle className={`w-4 h-4 ${c.accent}`} />
                  </span>
                  <h3 className="font-black text-slate-900">بعد الكورس</h3>
                </div>
                <p className="text-slate-900 font-semibold leading-relaxed bg-white rounded-2xl p-5 border border-slate-200">
                  &ldquo;{course.afterState}&rdquo;
                </p>
                <div className="mt-4 space-y-2.5">
                  {['كلام سلس وطبيعي بدون توقف', 'التفكير مباشرة بالإنجليزية', 'ثقة حقيقية في كل موقف'].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${c.accent}`} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ GUARANTEE ═══════ */}
      <section className="py-16 px-4 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="bg-slate-50 border border-emerald-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-black text-xl mb-2">ضمان الأسبوع الأول</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  إن لم تقتنع خلال الأسبوع الأول نعيد لك المبلغ كاملاً بلا أسئلة.
                  ولديك وصول مدى الحياة إلى الدروس — يبقى المحتوى معك حتى بعد انتهاء المتابعة.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 px-4 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="relative overflow-hidden bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 sm:p-10 text-center">
              <div className="pointer-events-none absolute -top-24 right-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl bg-gradient-to-b from-emerald-500/20 to-transparent" />
              <div className="relative">
                <MessageCircle className="w-9 h-9 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                  لديك سؤال عن هذا الكورس؟
                </h2>
                <p className="text-slate-600 leading-relaxed mb-7 max-w-md mx-auto">
                  تواصل مع الأستاذ مباشرة — يجيبك شخصياً على كل أسئلتك، مجاناً تماماً.
                  حتى لو كان سؤالك بسيطاً.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <SubscribeButton
                    source={`course_detail_bottom_${course.slug}`}
                    planId={plan?.id}
                    className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black px-8 py-4 rounded-2xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> سجّل في الكورس الآن
                  </SubscribeButton>
                  <a
                    href={waInfo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-colors no-underline"
                  >
                    اسأل عن الكورس
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ OTHER LEVELS ═══════ */}
      {otherCourses.length > 0 && (
        <section className="py-20 px-4 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <FadeIn direction="up">
              <div className="text-center mb-10">
                <p className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-2">— المسار —</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">اكتشف المستويات الأخرى</h2>
                <p className="text-slate-500">خطط مسارك الكامل من الصفر حتى الاحتراف</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {otherCourses.map((c2, i) => (
                <FadeIn key={c2.id} direction="up" delay={i * 110} className="h-full">
                  <CourseCardDark course={c2} />
                </FadeIn>
              ))}
            </div>

            <FadeIn direction="up" delay={200}>
              <div className="text-center mt-10">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-black text-sm transition-colors no-underline"
                >
                  <ArrowRight className="w-4 h-4" />
                  عرض جميع الكورسات
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═══════ MOBILE STICKY ═══════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{price.toLocaleString('en-US')}</span>
              <span className="text-xs font-bold text-slate-500">{course.currency}</span>
            </div>
            <p className="text-[11px] text-rose-600 font-bold">{course.spotsLeft} مقاعد فقط</p>
          </div>
          <SubscribeButton
            source={`course_detail_sticky_${course.slug}`}
            planId={plan?.id}
            className={`flex-1 inline-flex items-center justify-center gap-2 font-black text-sm px-6 py-3.5 rounded-2xl transition-colors ${c.cta}`}
          >
            سجّل الآن ←
          </SubscribeButton>
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </main>
  )
}
