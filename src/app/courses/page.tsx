import type { Metadata } from 'next'
import { MessageCircle, Shield, CheckCircle } from 'lucide-react'
import CourseCard from '@/components/CourseCard'
import FadeIn from '@/components/FadeIn'
import { COURSES } from '@/data/courses'

export const metadata: Metadata = {
  title: 'الكورسات | إنجليزي — تعلم الإنجليزية بطريقة ذكية',
  description:
    'كورسات إنجليزية متدرجة من A0 إلى B2 مع متابعة شخصية وتصحيح صوتي واختبار محادثة LIVE. اختر مستواك وابدأ رحلتك اليوم.',
}

const STATS = [
  { value: '2000+', label: 'طالب ناجح', emoji: '👨‍🎓' },
  { value: '15+', label: 'دولة حول العالم', emoji: '🌍' },
  { value: '5.0 ★', label: 'تقييم الطلاب', emoji: '⭐' },
  { value: '500+', label: 'قصة نجاح موثقة', emoji: '🏆' },
]

const LEVEL_PATH = [
  { from: 'A0', to: 'A1', label: 'صفر → جملة', color: 'bg-emerald-500' },
  { from: 'A1', to: 'A2', label: 'جملة → محادثة', color: 'bg-blue-500' },
  { from: 'A2', to: 'B1', label: 'محادثة → طلاقة', color: 'bg-violet-500' },
  { from: 'B1', to: 'B2', label: 'طلاقة → احتراف', color: 'bg-orange-500' },
]

const WHY_ITEMS = [
  {
    icon: '🎯',
    title: 'منهج مُثبَت بالنتائج',
    desc: 'طريقة تدريس مبنية على تجربة 2000+ طالب ناجح من المغرب ودول الخليج',
  },
  {
    icon: '🎤',
    title: 'تصحيح صوتي حقيقي',
    desc: 'الأستاذ يسمع صوتك شخصياً ويصحح نطقك — شخص حقيقي يهتم بك وليس روبوتاً',
  },
  {
    icon: '📈',
    title: 'تقدم واضح ومضمون',
    desc: 'منهج متدرج يضمن انتقالك من مستوى لآخر بخطوات واضحة لا تتركك تضيع',
  },
  {
    icon: '🏆',
    title: 'اختبار LIVE حقيقي',
    desc: 'لا شهادة روبوت — اختبار محادثة حي مع الأستاذ عبر Google Meet يُثبت تقدمك الحقيقي',
  },
]

const FAQS = [
  {
    q: 'من أين أبدأ إذا لم أعرف شيئاً عن الإنجليزية؟',
    a: 'ابدأ بكورس A0→A1 "من الصفر إلى أول جملة". هذا الكورس مصمم خصيصاً للمبتدئين الكاملين. لست محتاجاً لأي معرفة مسبقة على الإطلاق.',
  },
  {
    q: 'كيف تتم المتابعة مع الأستاذ؟',
    a: 'بعد كل درس تسجل صوتك وترسله عبر واتساب. الأستاذ يستمع إليك شخصياً ويصحح نطقك ويعطيك تغذية راجعة مفصلة في نفس اليوم.',
  },
  {
    q: 'هل يمكنني الانتقال من كورس لآخر؟',
    a: 'بالتأكيد. كل كورس يبني على السابق. بعد إتمام كل مستوى ونجاحك في اختبار المحادثة LIVE، تنتقل للمستوى التالي بخصم خاص للطلاب المستمرين.',
  },
  {
    q: 'كيف أعرف مستواي الحالي قبل التسجيل؟',
    a: 'يمكنك إجراء اختبار المستوى المجاني على موقعنا، أو التواصل مع الأستاذ مباشرة عبر واتساب وهو يساعدك في تحديد المستوى المناسب مجاناً.',
  },
  {
    q: 'هل هناك ضمان استعادة المبلغ؟',
    a: 'نعم. إذا طبقت كل الخطوات ولم ترَ أي تحسن خلال أول أسبوعين، نعيد لك مبلغك كاملاً بدون أسئلة. ثقتنا بالنتائج هي ضماننا الأول.',
  },
]

const WA_URL =
  'https://wa.me/212707902091?text=' +
  encodeURIComponent('مرحباً، أريد معرفة المزيد عن الكورسات')

export default function CoursesPage() {
  return (
    <main className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-hero py-24 px-4">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 text-sm font-bold mb-8 text-white/90">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            مقاعد محدودة — التسجيل مفتوح الآن
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            اختر مستواك
            <br />
            <span className="hero-gradient-text">وابدأ رحلتك اليوم</span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-14 leading-relaxed">
            كورسات إنجليزية متدرجة من الصفر حتى الاحتراف
            <br className="hidden sm:block" />
            مع متابعة شخصية وتصحيح صوتي حقيقي بعد كل درس
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-blue-200 font-semibold mt-1 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LEVEL PATH BAR ===== */}
      <section className="bg-white py-10 px-4 border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 font-black mb-5 uppercase tracking-widest">
            مسار تعلمك خطوة بخطوة
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3">
            {LEVEL_PATH.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-2xl text-sm font-black shadow-md text-white ${step.color}`}
                >
                  <span>
                    {step.from} → {step.to}
                  </span>
                  <span className="text-xs font-semibold opacity-85">{step.label}</span>
                </div>
                {i < LEVEL_PATH.length - 1 && (
                  <div className="hidden sm:flex items-center gap-1">
                    <div className="w-6 h-0.5 bg-gray-200" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COURSES GRID ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="inline-block bg-brand-50 text-brand-600 text-xs font-black px-4 py-2 rounded-full mb-4 uppercase tracking-wider border border-brand-100">
                الكورسات المتاحة
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                كل كورس — رحلة تحول حقيقية
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                ليست مجرد دروس — نظام متكامل يضمن تقدمك بخطوات واضحة وقابلة للقياس
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COURSES.map((course, index) => (
              <FadeIn key={course.id} direction="up" delay={index * 120}>
                <CourseCard course={course} />
              </FadeIn>
            ))}
          </div>

          <FadeIn direction="up" delay={300}>
            <p className="text-center text-sm text-gray-400 mt-10 font-medium">
              💳 السعر يشمل جميع الدروس والمتابعة وتصحيح النطق واختبار المحادثة LIVE
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== WHY INGLIZI ===== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                لماذا <span className="text-gradient">إنجليزي</span> وليس غيره؟
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                الفرق ليس في المحتوى فقط — الفرق في النهج الكامل
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_ITEMS.map((item, i) => (
              <FadeIn key={i} direction="up" delay={i * 100}>
                <div className="group bg-gray-50 hover:bg-white rounded-3xl p-7 border border-gray-100 hover:border-brand-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GUARANTEE ===== */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50 border-y border-green-100">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-right">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  ضمان الرضا الكامل — 14 يوم
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  إذا طبقت كل الخطوات خلال أول أسبوعين ولم ترَ أي تحسن، نعيد لك مبلغك
                  كاملاً بدون أسئلة. ثقتنا بالنتائج هي ضماننا الأول.
                </p>
                <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                  {['لا مخاطرة', 'استرداد كامل', 'بدون شروط مجحفة'].map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 text-sm font-bold text-green-700 bg-white rounded-full px-3 py-1 shadow-sm border border-green-200"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== WHATSAPP CTA ===== */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn direction="up">
            <div className="text-4xl mb-6">💬</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              لديك سؤال؟ تواصل معي مباشرة
            </h2>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              لست متأكداً من مستواك؟ تريد معرفة المزيد عن طريقة التدريس؟
              <br className="hidden sm:block" />
              الأستاذ يجيبك شخصياً عبر واتساب في أقل من ساعة.
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تحدث مع الأستاذ على واتساب
            </a>
            <p className="text-gray-500 text-sm mt-4">الرد خلال ساعة · مجاناً تماماً</p>
          </FadeIn>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">أسئلة شائعة</h2>
              <p className="text-gray-500">كل ما تريد معرفته قبل التسجيل</p>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeIn key={i} direction="up" delay={i * 80}>
                <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-bold text-gray-900 text-base list-none hover:text-brand-600 transition-colors duration-200">
                    {faq.q}
                    <span className="flex-shrink-0 w-7 h-7 bg-gray-100 group-open:bg-brand-100 rounded-full flex items-center justify-center text-gray-400 group-open:text-brand-600 font-black text-lg transition-all duration-200 leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 text-sm">
                    {faq.a}
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM STRIP CTA ===== */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <FadeIn direction="up">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              جاهز تبدأ؟ المقاعد محدودة.
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              سجّل الآن واحجز مقعدك قبل أن تمتلئ الأماكن
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-black text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                سجّل عبر واتساب
              </a>
              <a
                href="/level-test"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-white/25 transition-all duration-300"
              >
                اختبر مستواك مجاناً
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
