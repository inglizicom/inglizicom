'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'أحمد بنعلي',
    country: 'المغرب 🇲🇦',
    role: 'مهندس برمجيات',
    avatar: 'أ',
    bg: '#3b82f6',
    stars: 5,
    before: 'خائف من الكلام',
    after: 'مقابلات وظيفية بالإنجليزية',
    text: 'كنت خائفاً جداً من التحدث بالإنجليزية. بعد شهر مع حمزة أصبحت أجري مقابلات وظيفية بالإنجليزية بثقة تامة! أسلوبه بسيط ومحفّز بشكل رائع.',
    wa: true,
    waMsg: 'أحمد: "حمزة غيّر حياتي والله! كنت ما نقدرش نتكلم جملة واحدة..."',
  },
  {
    name: 'سارة الزهراني',
    country: 'السعودية 🇸🇦',
    role: 'طالبة جامعية',
    avatar: 'س',
    bg: '#ec4899',
    stars: 5,
    before: 'صعوبة في النطق',
    after: 'نطق احترافي ومميز',
    text: 'استفدت كثيراً من دروس النطق. كنت أجد صعوبة في الأصوات الإنجليزية، الآن كل من أتحدث معه يعجبه نطقي. لم أكن أصدق أن هذا ممكن بهذه السرعة.',
    wa: true,
    waMsg: 'سارة: "والله ما توقعت هكذا تقدم في وقت قصير، شكراً يا حمزة 🌟"',
  },
  {
    name: 'محمد الخالدي',
    country: 'الكويت 🇰🇼',
    role: 'رجل أعمال',
    avatar: 'م',
    bg: '#10b981',
    stars: 5,
    before: 'لا يستطيع التواصل',
    after: 'اجتماعات أعمال دولية',
    text: 'المنهج رائع لأنه يركز على الكلام الحقيقي لا على القواعد الممللة. في 3 أشهر تحسن مستواي بشكل كبير وأصبحت أتواصل مع شركاء أجانب بثقة.',
    wa: false,
    waMsg: '',
  },
  {
    name: 'نورة العتيبي',
    country: 'الإمارات 🇦🇪',
    role: 'مدرسة',
    avatar: 'ن',
    bg: '#f97316',
    stars: 5,
    before: 'خجل وتردد',
    after: 'تدرّس بالإنجليزية',
    text: 'حمزة يفهم مشاكلنا نحن العرب في تعلم الإنجليزية. يقدم حلولاً عملية وواضحة. أنصح به بشدة لأي شخص يريد تحسين مستواه بجدية.',
    wa: true,
    waMsg: 'نورة: "جزاك الله خير يا أستاذ حمزة، أنت غيّرت مسيرتي المهنية ❤️"',
  },
  {
    name: 'يوسف الإدريسي',
    country: 'المغرب 🇲🇦',
    role: 'مستقل / Freelancer',
    avatar: 'ي',
    bg: '#8b5cf6',
    stars: 5,
    before: 'لا يستطيع تكوين جملة',
    after: 'يعمل مع عملاء دوليين',
    text: 'بدأت الدورة وأنا لا أعرف كيف أقول جملة كاملة. بعد شهرين أصبحت أعمل مع عملاء أوروبيين وأجري اجتماعات بالإنجليزية يومياً. شكراً حمزة!',
    wa: true,
    waMsg: 'يوسف: "حمزة! وقّعت اليوم عقد مع شركة فرنسية بسببك 🎉🎉"',
  },
  {
    name: 'منى الشريف',
    country: 'تونس 🇹🇳',
    role: 'طبيبة',
    avatar: 'م',
    bg: '#06b6d4',
    stars: 5,
    before: 'قراءة بدون كلام',
    after: 'مؤتمرات طبية دولية',
    text: 'كطبيبة كنت أقرأ الأبحاث الطبية لكن لا أستطيع التحدث. الآن أشارك في مؤتمرات دولية وأقدم أبحاثي بالإنجليزية. لم أصدق النتيجة.',
    wa: false,
    waMsg: '',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 500)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % testimonials.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + testimonials.length) % testimonials.length), [current, goTo])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  const t = testimonials[current]

  /* Show 3 visible on desktop */
  const visible = [
    testimonials[(current - 1 + testimonials.length) % testimonials.length],
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block bg-amber-100 text-amber-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            قصص النجاح
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            هؤلاء كانوا في مكانك تماماً
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            مبتدئون مثلك. خائفون مثلك. اليوم يتكلمون بثقة أمام العالم.
          </p>
        </div>

        {/* Desktop: 3-card view */}
        <div className="hidden md:grid grid-cols-3 gap-5 mb-8">
          {visible.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className={`bg-white rounded-3xl border p-6 transition-all duration-500 ${
                i === 1
                  ? 'border-brand-300 shadow-2xl shadow-brand-100 scale-105 z-10 relative'
                  : 'border-gray-100 shadow-sm opacity-80 scale-95'
              }`}
            >
              {/* WhatsApp bubble (if available) */}
              {t.wa && t.waMsg && (
                <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-3 mb-4 text-sm font-medium text-gray-800 leading-snug">
                  {t.waMsg}
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-gray-400">✓✓</span>
                  </div>
                </div>
              )}

              {/* Before → After */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded-full line-through">{t.before}</span>
                <span className="text-gray-400 text-xs">→</span>
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{t.after}</span>
              </div>

              <div className="text-4xl text-brand-200 font-serif leading-none mb-2">"</div>
              <p className="text-gray-700 leading-relaxed text-sm mb-5 line-clamp-3">{t.text}</p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: t.bg }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role} · {t.country}</p>
                  </div>
                </div>
                <StarRating count={t.stars} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="md:hidden mb-8">
          <div className="bg-white rounded-3xl border border-brand-200 shadow-xl p-6">
            {t.wa && t.waMsg && (
              <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-3 mb-4 text-sm font-medium text-gray-800">
                {t.waMsg}
                <div className="flex justify-end mt-1"><span className="text-[10px] text-gray-400">✓✓</span></div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded-full line-through">{t.before}</span>
              <span className="text-gray-400 text-xs">→</span>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{t.after}</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-5">{t.text}</p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg" style={{ background: t.bg }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-black text-gray-900">{t.name}</p>
                  <p className="text-gray-400 text-sm">{t.country}</p>
                </div>
              </div>
              <StarRating count={t.stars} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-11 h-11 bg-gray-100 hover:bg-brand-100 rounded-full flex items-center justify-center transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-7 h-3 bg-brand-600' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="w-11 h-11 bg-gray-100 hover:bg-brand-100 rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  )
}
