'use client'

import FadeIn from './FadeIn'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Briefcase, Star, Quote } from 'lucide-react'

/* ─────────────────────────────────────────────────────────
   SOCIAL PROOF SECTION
   Replaces the world map. Converts on outcomes, not vanity.
   Structure:
   1. Outcome-driven headline
   2. 3 result stats (what changed in students' lives)
   3. 3 transformation cards (before → after + quote + metric)
   4. CTA
───────────────────────────────────────────────────────── */

const OUTCOME_STATS = [
  {
    icon: TrendingUp,
    stat: '87%',
    label: 'من طلابنا يتحدثون بثقة',
    sub: 'خلال أول 60 يوماً فقط',
    color: 'bg-emerald-500',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  {
    icon: Briefcase,
    stat: '+500',
    label: 'طالب حصل على وظيفة أو ترقية',
    sub: 'بسبب تحسن إنجليزيته مباشرة',
    color: 'bg-blue-500',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  {
    icon: Star,
    stat: '4.9',
    label: 'متوسط تقييم الطلاب',
    sub: 'من أصل 5 — بناءً على 2000+ تقييم',
    color: 'bg-amber-500',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
]

const TRANSFORMATIONS = [
  {
    name: 'أحمد بنعلي',
    country: 'المغرب',
    flag: '🇲🇦',
    role: 'مهندس برمجيات',
    avatar: 'أ',
    avatarBg: '#3b82f6',
    before: 'لم أكن أستطيع إكمال جملة واحدة دون أن أتوقف',
    after: 'أترأس اجتماعات تقنية بالإنجليزية كل يوم',
    quote: 'ظننت أن مشكلتي في الذكاء. الحقيقة كانت في الطريقة. حمزة علّمني أن أتكلم قبل أن أفكر في القواعد — وهذا غيّر كل شيء.',
    metric: '7 أسابيع',
    metricLabel: 'من الصمت إلى المقابلات الوظيفية',
    metricColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'سارة الزهراني',
    country: 'السعودية',
    flag: '🇸🇦',
    role: 'مديرة تسويق',
    avatar: 'س',
    avatarBg: '#ec4899',
    before: 'أعرف الإنجليزية من الكتب لكنني أتجمد حين أتحدث',
    after: 'أقدّم عروضاً تجارية أمام عملاء أجانب',
    quote: 'الفرق الحقيقي هو أن حمزة يجعلك تتحدث من الدقيقة الأولى. لا حفظ، لا ملل، فقط محادثة حقيقية تبني ثقتك تلقائياً.',
    metric: '10 أسابيع',
    metricLabel: 'من الخوف إلى العروض التجارية',
    metricColor: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    name: 'يوسف الإدريسي',
    country: 'المغرب',
    flag: '🇲🇦',
    role: 'مستقل / Freelancer',
    avatar: 'ي',
    avatarBg: '#8b5cf6',
    before: 'كنت أرفض مشاريع دولية بسبب ضعف إنجليزيتي',
    after: 'أعمل مع عملاء أوروبيين ودخلي تضاعف 3 مرات',
    quote: 'أضعت سنتين مع طرق تقليدية لم تنفعني. شهران مع حمزة فعلا ما لم تفعله تلك السنتان. الفرق هو أنه يعلّمك تفكير الإنجليزية لا ترجمتها.',
    metric: '8 أسابيع',
    metricLabel: 'من الرفض إلى 3× دخل أعلى',
    metricColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
]

function WAIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

export default function SocialProofSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #1e3a8a 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* ── Header ── */}
        <FadeIn>
          <div className="text-center mb-16">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              2000+ طالب — نتائج حقيقية موثقة
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
              من{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-red-500">"لا أستطيع التكلم"</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-red-100 -z-0 rounded" />
              </span>
              {' '}إلى{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-600">"أجري مقابلات بالإنجليزية"</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-100 -z-0 rounded" />
              </span>
            </h2>

            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              هؤلاء لم يكونوا موهوبين. لم يعيشوا في الخارج. كانوا مثلك تماماً — حتى بدأوا بالطريقة الصحيحة.
            </p>
          </div>
        </FadeIn>

        {/* ── Outcome stats — NOT vanity numbers ── */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {OUTCOME_STATS.map(({ icon: Icon, stat, label, sub, color, light, border, text }) => (
              <div key={label} className={`${light} border ${border} rounded-2xl p-6 flex items-start gap-4`}>
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className={`text-3xl font-black ${text} leading-none mb-1`}>{stat}</p>
                  <p className="font-bold text-gray-900 text-sm leading-snug mb-0.5">{label}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── Transformation cards ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {TRANSFORMATIONS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 120}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">

                {/* Before → After header bar */}
                <div className="flex border-b border-gray-100">
                  <div className="flex-1 bg-red-50 px-4 py-3 text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">قبل</p>
                    <p className="text-xs font-semibold text-red-600 leading-snug line-through">{t.before}</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="flex-1 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">بعد</p>
                    <p className="text-xs font-bold text-emerald-700 leading-snug">{t.after}</p>
                  </div>
                </div>

                {/* Quote body */}
                <div className="p-6 flex-1 flex flex-col">
                  <Quote size={28} className="text-gray-200 mb-3 flex-shrink-0" />
                  <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">
                    {t.quote}
                  </p>

                  {/* Time metric */}
                  <div className={`inline-flex items-center gap-2 border rounded-xl px-4 py-2 mb-5 self-start ${t.metricColor}`}>
                    <span className="text-lg font-black">{t.metric}</span>
                    <span className="text-xs font-semibold">{t.metricLabel}</span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
                      style={{ background: t.avatarBg }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.role} · {t.flag} {t.country}</p>
                    </div>
                    {/* Stars */}
                    <div className="mr-auto flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ── CTA ── */}
        <FadeIn>
          <div className="bg-gradient-to-br from-brand-950 to-brand-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            <div className="relative z-10">
              <p className="text-blue-300 font-bold text-sm mb-3 uppercase tracking-widest">قصتك التالية</p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
                هل أنت مستعد لتكتب تحولك؟
              </h3>
              <p className="text-blue-200/80 text-lg mb-8 max-w-xl mx-auto">
                ابدأ بخطوة واحدة صغيرة: اعرف مستواك الحقيقي الآن — مجاناً وفي 5 دقائق فقط.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/level-test"
                  className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-orange-500/40 transition-all duration-300 flex items-center gap-2 text-lg"
                >
                  ابدأ اختبار المستوى المجاني
                  <ArrowLeft size={20} />
                </Link>
                <a
                  href="https://wa.me/212707902091?text=مرحبا،%20أريد%20معرفة%20كيف%20أبدأ"
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#25d366] hover:bg-[#20b858] active:scale-95 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 text-lg"
                >
                  <WAIcon />
                  تحدث مع حمزة مباشرة
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  )
}
