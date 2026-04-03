import HeroSlider from '@/components/HeroSlider'
import SocialProofSection from '@/components/SocialProofSection'
import TrustAndMethod from '@/components/TrustAndMethod'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import CountdownTimer from '@/components/CountdownTimer'
import FadeIn from '@/components/FadeIn'
import Link from 'next/link'
import { ArrowLeft, Play, CheckCircle2, Trophy, Users, Star, Globe } from 'lucide-react'

/* ─── WhatsApp icon ─── */
function WAIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

/* ─── Stats data ─── */
const STATS = [
  { icon: Users,   value: '+2000', label: 'طالب نشط',        color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600' },
  { icon: Globe,   value: '+15',   label: 'دولة عربية',       color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { icon: Star,    value: '5.0',   label: 'تقييم الطلاب',    color: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600' },
  { icon: Trophy,  value: '+500',  label: 'قصة نجاح',         color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600' },
]

/* ─── Before/After ─── */
const BEFORE_AFTER = [
  { before: 'يخشى التحدث أمام الآخرين',   after: 'يجري مقابلات عمل بالإنجليزية' },
  { before: 'يعرف قواعد لكنه لا يتكلم',    after: 'يتواصل بطلاقة مع العملاء' },
  { before: 'يتوقف عند كل كلمة',           after: 'يفكر ويجيب بشكل تلقائي' },
  { before: 'يشعر بالخجل من لهجته',        after: 'يتحدث بثقة ونطق واضح' },
]

/* ─── Course packages ─── */
const COURSES = [
  {
    name: 'الأساسي',
    price: '750',
    period: 'شهر',
    featured: false,
    badge: null,
    features: ['8 جلسات خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية PDF', 'دعم واتساب'],
    ctaLabel: 'ابدأ الآن',
  },
  {
    name: 'المتقدم',
    price: '1500',
    period: 'شهرين',
    featured: true,
    badge: '⭐ الأكثر مبيعاً',
    features: ['20 جلسة خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية كاملة', 'دعم واتساب يومي', 'تصحيح الكتابة والنطق', 'شهادة إتمام'],
    ctaLabel: 'احجز مكانك',
  },
  {
    name: 'الاحترافي',
    price: '3000',
    period: '4 أشهر',
    featured: false,
    badge: null,
    features: ['40 جلسة خاصة', 'تقييم مستوى مجاني', 'مواد تعليمية كاملة', 'دعم واتساب يومي', 'تصحيح الكتابة والنطق', 'شهادة إتمام', 'جلسات محادثة مجانية', 'تحضير للمقابلات الوظيفية'],
    ctaLabel: 'تواصل معنا',
  },
]

/* ─── Skill mini-courses ─── */
const SKILLS = [
  { emoji: '🎤', title: 'النطق الاحترافي',  desc: 'صوتيات وإيقاع',          price: '250 درهم', color: 'bg-blue-50 border-blue-200' },
  { emoji: '💼', title: 'إنجليزية الأعمال', desc: 'اجتماعات وعروض',          price: '350 درهم', color: 'bg-emerald-50 border-emerald-200' },
  { emoji: '✈️', title: 'إنجليزية السفر',   desc: 'مطارات وفنادق',           price: '200 درهم', color: 'bg-orange-50 border-orange-200' },
  { emoji: '🎓', title: 'IELTS التحضير',    desc: 'اختبارات واستراتيجيات',   price: '450 درهم', color: 'bg-purple-50 border-purple-200' },
]

/* ─── Social links ─── */
const SOCIALS = [
  { name: 'يوتيوب',   handle: 'Inglizi.com',   followers: '12K+', color: 'bg-red-500',     emoji: '▶️', href: '#' },
  { name: 'تيك توك',  handle: '@inglizi',       followers: '28K+', color: 'bg-black',       emoji: '🎵', href: '#' },
  { name: 'انستغرام', handle: '@inglizi.com',   followers: '9K+',  color: 'bg-pink-500',    emoji: '📸', href: '#' },
  { name: 'فيسبوك',   handle: 'Inglizi.com',   followers: '15K+', color: 'bg-blue-600',    emoji: '📘', href: '#' },
]

export default function HomePage() {
  return (
    <main>

      {/* ══════════════════════════════════════════
          1. HERO SLIDER
      ══════════════════════════════════════════ */}
      <HeroSlider />

      {/* ══════════════════════════════════════════
          2. SOCIAL PROOF STATS
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {STATS.map(({ icon: Icon, value, label, color, light, text }) => (
                <div key={label} className={`${light} rounded-3xl p-6 flex flex-col items-center text-center`}>
                  <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <p className={`text-3xl font-black ${text} leading-none mb-1`}>{value}</p>
                  <p className="text-gray-600 font-semibold text-sm">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. VIDEO SECTION
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div>
                <span className="inline-block bg-brand-100 text-brand-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
                  من هو حمزة؟
                </span>
                <h2 className="text-4xl font-black text-gray-900 leading-tight mb-5">
                  معلم يفهم مشاكلك<br />
                  <span className="text-brand-600">لأنه عاشها قبلك</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  حمزة القصراوي — مدرس إنجليزية مغربي بدأ من الصفر تماماً. يعرف بالضبط ما يشعر به الطالب العربي عندما يخاف من الكلام. لذلك منهجه مختلف تماماً.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'أكثر من 5 سنوات خبرة في تدريس العرب',
                    'أسلوب محادثة حقيقي بعيد عن القواعد الجافة',
                    'نتائج مضمونة أو يُعاد المال',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/212707902091?text=مرحبا،%20أريد%20معرفة%20المزيد%20عن%20البرنامج"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20b858] text-white font-black py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                >
                  <WAIcon />
                  تحدث مع حمزة مباشرة
                </a>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="relative rounded-3xl overflow-hidden bg-brand-900 aspect-video shadow-2xl group cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80"
                  alt="حمزة القصراوي"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Play size={32} className="text-brand-700 mr-[-4px]" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-xl">
                  🎬 شاهد كيف تعمل الطريقة
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. TRUST + METHOD (replaces Partners + Method Steps)
      ══════════════════════════════════════════ */}
      <TrustAndMethod />

      {/* ══════════════════════════════════════════
          5. SOCIAL PROOF (replaces World Map)
      ══════════════════════════════════════════ */}
      <SocialProofSection />

      {/* ══════════════════════════════════════════
          7. TESTIMONIALS CAROUSEL
      ══════════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ══════════════════════════════════════════
          8. BEFORE / AFTER
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-red-100 text-red-600 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                التحول الحقيقي
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                أين كانوا؟ أين أصبحوا؟
              </h2>
              <p className="text-gray-500 text-lg">
                هذه ليست قصصاً خيالية — هذا ما يحدث لكل طالب يلتزم بالبرنامج
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {BEFORE_AFTER.map(({ before, after }, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <span className="inline-block bg-red-50 text-red-500 text-sm font-bold px-3 py-1.5 rounded-xl line-through">
                      {before}
                    </span>
                  </div>
                  <div className="text-xl text-gray-400 flex-shrink-0">→</div>
                  <div className="flex-1 text-center">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-xl">
                      {after}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="text-center mt-12">
              <p className="text-gray-500 mb-5 text-lg">أنت التالي في هذه القائمة</p>
              <Link
                href="/level-test"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-brand-500/30 transition-all duration-300 text-lg"
              >
                اختبر مستواك الآن مجاناً
                <ArrowLeft size={20} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. PRICING SECTION
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-5">
              <span className="inline-block bg-orange-100 text-orange-600 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                الأسعار
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                استثمر في لغتك — استثمر في مستقبلك
              </h2>
              <p className="text-gray-500 text-lg mb-6">
                باقات مرنة تناسب كل مستوى وميزانية
              </p>
              <CountdownTimer label="ينتهي العرض المحدود خلال" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {COURSES.map((course, i) => (
              <FadeIn key={course.name} delay={i * 100}>
                <div className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col h-full shadow-sm ${
                  course.featured
                    ? 'border-brand-400 ring-2 ring-brand-400 shadow-xl'
                    : 'border-gray-200'
                }`}>
                  {course.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      {course.badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="font-black text-gray-900 text-xl mb-2">{course.name}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-gray-900">{course.price}</span>
                      <span className="text-gray-400 font-semibold mb-1"> درهم / {course.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {course.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-gray-700 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/212707902091?text=${encodeURIComponent(`مرحبا، أريد الاشتراك في الباقة ${course.name}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className={`${
                      course.featured
                        ? 'bg-brand-600 hover:bg-brand-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    } text-white font-black py-3.5 rounded-2xl text-center transition-all duration-200 flex items-center justify-center gap-2`}
                  >
                    <WAIcon />
                    {course.ctaLabel}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Skill mini-courses */}
          <FadeIn>
            <div className="mt-16">
              <h3 className="text-2xl font-black text-gray-900 text-center mb-8">
                دورات المهارات المتخصصة
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SKILLS.map(skill => (
                  <div key={skill.title} className={`${skill.color} rounded-2xl border p-5 flex flex-col items-center text-center`}>
                    <div className="text-4xl mb-3">{skill.emoji}</div>
                    <p className="font-black text-gray-900 mb-1">{skill.title}</p>
                    <p className="text-gray-500 text-xs mb-3">{skill.desc}</p>
                    <p className="font-black text-brand-600 text-sm">{skill.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. HAMZA STORY
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-brand-950 to-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div>
                <span className="inline-block bg-white/10 text-blue-200 font-bold text-sm px-4 py-1.5 rounded-full mb-6">
                  قصة حمزة
                </span>
                <h2 className="text-4xl font-black leading-tight mb-6">
                  كنت مثلك تماماً —<br />
                  <span className="text-amber-400">أخاف من الكلام بالإنجليزية</span>
                </h2>
                <div className="space-y-4 text-blue-100/80 text-lg leading-relaxed">
                  <p>
                    في البداية، كنت أعرف الإنجليزية من الكتب فقط. لكن حين أحاول الكلام، كان الخوف يمنعني من إخراج ولو جملة واحدة.
                  </p>
                  <p>
                    بعد سنوات من التجربة والخطأ، اكتشفت أن المشكلة ليست في الذكاء أو في القواعد — المشكلة في الطريقة. اليوم أساعد أكثر من 2000 طالب على تجاوز نفس الخوف.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  {['🇲🇦 مغربي الأصل', '📚 5+ سنوات خبرة', '🌍 طلاب من 15 دولة', '⭐ تقييم 5.0'].map(tag => (
                    <span key={tag} className="bg-white/10 border border-white/20 text-blue-100 text-sm font-semibold px-4 py-2 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'طالب تعلموا معه', value: '2000+', color: 'bg-blue-500/20 border-blue-400/30' },
                  { label: 'تقييم الطلاب',    value: '⭐ 5.0', color: 'bg-amber-500/20 border-amber-400/30' },
                  { label: 'دولة عربية',      value: '15+',   color: 'bg-emerald-500/20 border-emerald-400/30' },
                  { label: 'سنوات تدريس',     value: '5+',    color: 'bg-purple-500/20 border-purple-400/30' },
                ].map(item => (
                  <div key={item.label} className={`${item.color} border rounded-3xl p-6 text-center`}>
                    <p className="text-3xl font-black text-white mb-1">{item.value}</p>
                    <p className="text-blue-200 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. SOCIAL FOLLOW
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-block bg-pink-100 text-pink-600 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                تابعنا
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                محتوى مجاني يومياً
              </h2>
              <p className="text-gray-500 text-lg">
                تابع حمزة على منصاتك المفضلة وتعلم شيئاً جديداً كل يوم
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SOCIALS.map((social, i) => (
              <FadeIn key={social.name} delay={i * 80}>
                <a
                  href={social.href}
                  className="group block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 ${social.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {social.emoji}
                  </div>
                  <p className="font-black text-gray-900 text-lg mb-0.5">{social.name}</p>
                  <p className="text-gray-400 text-sm mb-3">{social.handle}</p>
                  <p className="font-black text-brand-600 text-xl">{social.followers}</p>
                  <p className="text-gray-400 text-xs">متابع</p>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          12. FINAL CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <FadeIn>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
              جاهز تبدأ رحلتك؟
            </h2>
            <p className="text-blue-100 text-xl mb-10 leading-relaxed">
              أكثر من 2000 طالب بدأوا من نفس مكانك. الخطوة الأولى هي معرفة مستواك الحقيقي — مجاناً وفي 5 دقائق.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/level-test"
                className="bg-white text-brand-700 hover:bg-blue-50 font-black py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 text-lg"
              >
                ابدأ اختبار المستوى المجاني
                <ArrowLeft size={20} />
              </Link>
              <a
                href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية"
                target="_blank" rel="noopener noreferrer"
                className="bg-[#25d366] hover:bg-[#20b858] text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-2 text-lg"
              >
                <WAIcon />
                تواصل عبر واتساب
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-blue-200 text-sm font-semibold">
              <span>✓ تقييم مجاني للمستوى</span>
              <span>✓ بدون التزام مسبق</span>
              <span>✓ رد خلال دقائق</span>
            </div>
          </div>
        </FadeIn>
      </section>

    </main>
  )
}
