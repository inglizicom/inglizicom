import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Users, Globe, Star, Trophy, Heart, Target, Zap, ArrowLeft } from 'lucide-react'

const milestones = [
  {
    year: '2019',
    title: 'بداية الرحلة',
    desc: 'بدأ حمزة رحلته في تعليم الإنجليزية عبر الإنترنت، وكان أول طلابه من دول المغرب العربي.',
    icon: '🌱',
  },
  {
    year: '2020',
    title: '500 طالب',
    desc: 'وصل عدد طلابه إلى 500 طالب من مختلف الدول العربية، وبدأ يطور منهجاً خاصاً به.',
    icon: '📈',
  },
  {
    year: '2022',
    title: 'إطلاق منصة إنجليزي.كوم',
    desc: 'أطلق منصته الخاصة إنجليزي.كوم وبدأ في تقديم برامج تدريبية منظمة ومتكاملة.',
    icon: '🚀',
  },
  {
    year: '2024',
    title: '+2000 طالب حول العالم',
    desc: 'تجاوز عدد طلابه حاجز الـ2000 طالب من أكثر من 15 دولة، مع نسبة رضا تتجاوز 98%.',
    icon: '🌍',
  },
]

const values = [
  {
    icon: Target,
    title: 'التركيز على النتائج',
    desc: 'كل درس مصمم لتحقيق هدف واضح وملموس. لا وقت يُضاع في نظريات لا تُفيد.',
    color: 'bg-blue-50 text-brand-600',
  },
  {
    icon: Heart,
    title: 'دعم كل طالب',
    desc: 'يؤمن حمزة أن كل طالب يستحق الاهتمام الشخصي والتشجيع المستمر.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Zap,
    title: 'التعلم السريع',
    desc: 'منهج مكثف يوفر الوقت ويسرّع التقدم دون المساس بالجودة.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Globe,
    title: 'التواصل الحقيقي',
    desc: 'الهدف النهائي هو التواصل الفعلي مع الناس، وليس حفظ قواعد النحو.',
    color: 'bg-green-50 text-green-600',
  },
]

const achievements = [
  { icon: Users,  value: '+2000', label: 'طالب ناجح' },
  { icon: Globe,  value: '+15',   label: 'دولة عربية' },
  { icon: Star,   value: '4.9',   label: 'متوسط التقييم' },
  { icon: Trophy, value: '98%',   label: 'نسبة الرضا' },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-hero pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="text-white order-1">
              <span className="inline-block bg-white/10 border border-white/20 text-blue-100 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                عن المعلم
              </span>
              <h1 className="text-5xl font-black mb-5 leading-tight">
                حمزة القصراوي
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-200 to-orange-300">
                  مدرب التواصل
                </span>
              </h1>
              <p className="text-blue-100/80 text-xl leading-relaxed mb-8">
                بدأ حمزة رحلته مثلك تماماً — كشخص عادي خائف من التحدث بالإنجليزية.
                اليوم يساعد آلاف الطلاب على تجاوز هذا الخوف وتحقيق أحلامهم.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                {achievements.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <Icon size={22} className="text-blue-300 mb-2" />
                    <p className="text-3xl font-black">{value}</p>
                    <p className="text-blue-200/70 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="order-2 relative flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/50 border-4 border-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                    alt="حمزة القصراوي"
                    width={500}
                    height={600}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/30 to-transparent" />
                </div>

                {/* Name card */}
                <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-blue-50">
                  <p className="font-black text-gray-900">حمزة القصراوي</p>
                  <p className="text-brand-600 text-sm font-semibold">مدرب التواصل بالإنجليزية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-brand-100 text-brand-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
              قصته
            </span>
            <h2 className="text-4xl font-black text-gray-900">من أين بدأ الأمر؟</h2>
          </div>

          <div className="prose-like space-y-6">
            {[
              {
                icon: '🌟',
                title: 'البداية',
                text: 'نشأ حمزة في المغرب، وكغيره من الطلاب العرب، تعلم الإنجليزية في المدرسة بطريقة تقليدية تركّز على القواعد والحفظ. النتيجة؟ سنوات من الدراسة دون القدرة على التحدث جملة واحدة بثقة.',
              },
              {
                icon: '💡',
                title: 'الاكتشاف',
                text: 'بعد سنوات من البحث والتجربة، اكتشف حمزة أن سر تعلم اللغة ليس في القواعد المعقدة — بل في التعرض للغة الحية والحديث المستمر. غيّر أسلوبه كلياً وبدأ يتحسن بشكل ملحوظ.',
              },
              {
                icon: '🎯',
                title: 'الرسالة',
                text: 'قرر حمزة أن يشارك ما تعلمه مع غيره. بدأ بتعليم أصدقائه وعائلته، ثم انتقل إلى الإنترنت حيث وصل إلى آلاف الطلاب من مختلف الدول العربية الذين كانوا يعانون من نفس المشكلة.',
              },
              {
                icon: '🏆',
                title: 'الإنجاز',
                text: 'اليوم، يفتخر حمزة بأن طلابه يتحدثون الإنجليزية في مقابلات العمل، يسافرون بثقة، ويتواصلون مع العالم. ليس لأنهم موهوبون — بل لأنهم تعلموا الطريقة الصحيحة.',
              },
            ].map((section) => (
              <div key={section.title} className="bg-gray-50 rounded-2xl p-7 flex gap-5">
                <span className="text-4xl flex-shrink-0">{section.icon}</span>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{section.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 bg-gradient-to-br from-brand-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">قيمه وفلسفته في التعليم</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              أسس يؤمن بها حمزة وتحكم كل درس يقدمه.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover text-center">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={26} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 text-orange-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
              رحلته
            </span>
            <h2 className="text-4xl font-black text-gray-900">المحطات الكبرى</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 to-brand-50 hidden sm:block" />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start">
                  {/* Icon */}
                  <div className="relative flex-shrink-0 w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm z-10">
                    {m.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-brand-600 text-white text-xs font-black px-3 py-1 rounded-full">{m.year}</span>
                      <h3 className="font-black text-gray-900 text-lg">{m.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why different ── */}
      <section className="py-16 bg-brand-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">ما الذي يجعل حمزة مختلفاً؟</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              'يفهم مشاكل العرب في تعلم الإنجليزية لأنه مر بنفس التجربة',
              'يركز على الكلام الحقيقي لا على القواعد المعقدة',
              'يبني الثقة بالنفس قبل أي شيء آخر',
              'نتائج مثبتة مع أكثر من 2000 طالب من دول مختلفة',
              'أسلوب ممتع ومحفّز يجعلك تتمنى كل درس',
              'متاح للدعم والأسئلة خارج أوقات الدروس',
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-5">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-100/90">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={30} className="text-brand-600" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            جاهز تبدأ رحلتك مع حمزة؟
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            انضم إلى آلاف الطلاب الذين غيّروا مستواهم وفتحوا أبواباً جديدة في حياتهم.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-brand-600/30 transition-all duration-300 flex items-center gap-2"
            >
              عرض الدورات
              <ArrowLeft size={18} />
            </Link>
            <a
              href="https://wa.me/212707902091?text=مرحباً%20حمزة،%20أريد%20التواصل%20معك"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300"
            >
              تواصل معه مباشرة
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
