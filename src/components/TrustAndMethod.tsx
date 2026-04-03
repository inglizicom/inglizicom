'use client'

import FadeIn from './FadeIn'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, BookOpen, Mic, RotateCcw, Users, X, Check } from 'lucide-react'

/* ─────────────────────────────────────────────────────────
   TRUST + METHOD SECTION
   Two-part section optimized for credibility and conversion:

   PART 1 — Trust / Authority
   "Why 2000+ students trust us"
   Partners explained in terms of student benefit,
   not just logo display.

   PART 2 — Mechanism
   "Why our students speak faster than traditional learners"
   3-step system with before/after comparison.
───────────────────────────────────────────────────────── */

/* ── Part 1: Trust pillars ── */
const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    color: 'bg-blue-500',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    title: 'شهادات معتمدة دولياً',
    body: 'نتعاون مع Oxford Spires وOxford Academy — مؤسسات تعليمية بريطانية معترف بها دولياً. شهادتك ليست مجرد ورقة، بل وثيقة لها قيمة في سوق العمل.',
    proof: '✓ مُعترف به في أوروبا والخليج',
  },
  {
    icon: Users,
    color: 'bg-emerald-500',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    title: 'منهج مُختبر على 2000+ طالب',
    body: 'لم نبنِ هذا المنهج في الفراغ. طوّرناه عبر سنوات من التدريس الفعلي مع طلاب عرب من مستويات مختلفة — وعدّلناه كل مرة لم تنجح فيها.',
    proof: '✓ معدل نجاح 87% موثق',
  },
  {
    icon: BookOpen,
    color: 'bg-purple-500',
    light: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    title: 'شركاء تعليميون في فرنسا والمغرب',
    body: 'بالتعاون مع Les Génies وFondation des Classes Préparatoires — برامجنا موثوقة من مؤسسات تعليمية تشرف على آلاف الطلاب سنوياً.',
    proof: '✓ موثوق من مؤسسات تعليمية رائدة',
  },
]

/* ── Part 2: Method comparison ── */
const TRADITIONAL = [
  'حفظ قواعد نحوية لا تُستخدم',
  'ترجمة في رأسك قبل الكلام',
  'خوف دائم من الأخطاء',
  'سنوات بدون نتيجة حقيقية',
]

const OUR_METHOD = [
  'تتكلم من الدقيقة الأولى',
  'تفكر بالإنجليزية مباشرة',
  'الخطأ جزء من التعلم',
  'نتائج ملموسة في 60 يوماً',
]

/* ── 3-step system ── */
const STEPS = [
  {
    number: '01',
    icon: Mic,
    color: 'bg-brand-600',
    light: 'bg-brand-50',
    border: 'border-brand-200',
    accent: 'text-brand-600',
    title: 'التحدث أولاً',
    tagline: 'قبل القواعد، قبل الحفظ، قبل كل شيء',
    body: 'معظم الطرق التقليدية تجعلك تنتظر سنوات حتى "تصبح مستعداً للكلام". نحن نعكس هذا تماماً — تتحدث من الدرس الأول، والأخطاء تصحَّح في الوقت الحقيقي.',
    why: 'لأن الدماغ يتعلم اللغة بالاستخدام، لا بالحفظ.',
  },
  {
    number: '02',
    icon: RotateCcw,
    color: 'bg-emerald-600',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-600',
    title: 'التكرار الذكي',
    tagline: 'تكرار ما تحتاجه — لا ما تكرهه',
    body: 'لا تكرار ممل لقوائم كلمات. كل كلمة وتعبير تتعلمه يُكرَّر في سياقات حقيقية مختلفة حتى يصبح جزءاً من تفكيرك، لا مجرد ذاكرة قصيرة المدى.',
    why: 'لأن الدراسات تثبت أن التكرار السياقي أفضل 4× من التكرار الحرفي.',
  },
  {
    number: '03',
    icon: Users,
    color: 'bg-orange-500',
    light: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'text-orange-600',
    title: 'المواقف الحقيقية',
    tagline: 'تتعلم الإنجليزية التي تحتاجها أنت',
    body: 'نصمم كل درس بناءً على حياتك الفعلية: مقابلات العمل، محادثات العملاء، السفر، الدراسة. لا إنجليزية كتب مدرسية — إنجليزية الحياة الحقيقية.',
    why: 'لأن ما تتعلمه في سياق حقيقي تتذكره مدى الحياة.',
  },
]

export default function TrustAndMethod() {
  return (
    <>
      {/* ══════════════════════════════════════════
          PART 1 — TRUST / AUTHORITY
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-blue-100 text-blue-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
                لماذا نُوثق؟
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                لا تصدّقنا —{' '}
                <span className="text-brand-600">تحقق بنفسك</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                ثقتنا ليست كلاماً. مبنية على شراكات حقيقية، منهج مُختبر، ونتائج موثقة من 2000+ طالب.
              </p>
            </div>
          </FadeIn>

          {/* Trust pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {TRUST_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <FadeIn key={pillar.title} delay={i * 100}>
                  <div className={`bg-white rounded-3xl border ${pillar.border} p-7 h-full flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                    <div className={`${pillar.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg flex-shrink-0`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-3">{pillar.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">{pillar.body}</p>
                    <div className={`${pillar.light} ${pillar.border} border rounded-xl px-4 py-2 self-start`}>
                      <span className={`text-xs font-black ${pillar.text}`}>{pillar.proof}</span>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          {/* Partner strip — explained, not just logos */}
          <FadeIn>
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8">
              <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                شركاؤنا المعتمدون — ماذا يعني هذا لك؟
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Oxford Spires',                       abbr: 'OS',  color: '#1e3a8a', bg: '#dbeafe', emoji: '🎓', benefit: 'شهادة بريطانية معترف بها' },
                  { name: 'Oxford Academy',                      abbr: 'OA',  color: '#1e40af', bg: '#eff6ff', emoji: '📚', benefit: 'إطار تدريس أكاديمي دولي' },
                  { name: 'Les Génies',                          abbr: 'LG',  color: '#7c3aed', bg: '#f5f3ff', emoji: '🌟', benefit: 'اعتراف مؤسسي في فرنسا' },
                  { name: 'Classes Préparatoires',               abbr: 'CP',  color: '#0369a1', bg: '#e0f2fe', emoji: '🏛️', benefit: 'ثقة المؤسسات التعليمية الكبرى' },
                ].map(p => (
                  <div key={p.name} className="flex flex-col items-center text-center p-4 rounded-2xl" style={{ background: p.bg }}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mb-3"
                      style={{ background: p.bg, color: p.color }}
                    >
                      {p.emoji}
                    </div>
                    <p className="font-black text-sm text-gray-900 mb-1">{p.name}</p>
                    <p className="text-xs font-semibold" style={{ color: p.color }}>{p.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          PART 2 — MECHANISM / WHY IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <FadeIn>
            <div className="text-center mb-6">
              <span className="inline-block bg-emerald-100 text-emerald-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
                السر الحقيقي
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                لماذا طلابنا يتكلمون{' '}
                <span className="text-emerald-600">أسرع</span>
                {' '}من المتعلمين التقليديين؟
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                ليس لأنهم أذكى — بل لأنهم لا يتعلمون بنفس الطريقة الخاطئة التي جعلت الآخرين يفشلون لسنوات.
              </p>
            </div>
          </FadeIn>

          {/* Before/After comparison table */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-4 mb-16 max-w-3xl mx-auto">
              {/* Traditional */}
              <div className="bg-red-50 border border-red-200 rounded-3xl p-7">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={16} className="text-red-500" />
                  </div>
                  <p className="font-black text-red-600">الطريقة التقليدية</p>
                </div>
                <ul className="space-y-3">
                  {TRADITIONAL.map(item => (
                    <li key={item} className="flex items-center gap-3 text-red-700 text-sm">
                      <X size={14} className="text-red-400 flex-shrink-0" />
                      <span className="line-through opacity-70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Our method */}
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-7 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                  طريقة إنجليزي
                </div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={16} className="text-emerald-600" />
                  </div>
                  <p className="font-black text-emerald-700">طريقتنا المختلفة</p>
                </div>
                <ul className="space-y-3">
                  {OUR_METHOD.map(item => (
                    <li key={item} className="flex items-center gap-3 text-emerald-800 text-sm font-semibold">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          {/* 3-step system */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <FadeIn key={step.number} delay={i * 120}>
                  <div className={`${step.light} border ${step.border} rounded-3xl p-8 h-full flex flex-col`}>
                    {/* Step number + icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`${step.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon size={26} className="text-white" />
                      </div>
                      <span className={`text-6xl font-black ${step.accent} opacity-15 leading-none`}>
                        {step.number}
                      </span>
                    </div>

                    <p className={`text-xs font-black ${step.accent} uppercase tracking-widest mb-2`}>
                      الخطوة {step.number}
                    </p>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-4 italic">"{step.tagline}"</p>
                    <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">{step.body}</p>

                    {/* Why it matters */}
                    <div className="bg-white/80 rounded-2xl px-4 py-3 border border-white">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">لماذا يهمك هذا؟</p>
                      <p className={`text-xs font-bold ${step.accent}`}>{step.why}</p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <FadeIn>
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-6">
                أريد أن أجرب هذه الطريقة بنفسي
              </p>
              <Link
                href="/level-test"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-brand-500/30 transition-all duration-300 text-lg"
              >
                ابدأ مجاناً — اعرف مستواك الآن
                <ArrowLeft size={20} />
              </Link>
              <p className="text-gray-400 text-sm mt-3">5 دقائق فقط · بدون بطاقة ائتمان</p>
            </div>
          </FadeIn>

        </div>
      </section>
    </>
  )
}
