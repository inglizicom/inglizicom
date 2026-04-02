import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, BookOpen, Clock, Users, Star, Zap, ArrowLeft, Mic, MessageCircle, Globe } from 'lucide-react'

const courses = [
  {
    id: 1,
    level: 'مبتدئ',
    levelColor: 'bg-green-100 text-green-700 border-green-200',
    badge: '🌱',
    title: 'من الصفر إلى المحادثة',
    subtitle: 'للمبتدئين الكاملين',
    desc: 'ابدأ رحلتك مع الإنجليزية من أول حرف. ستتعلم الأساسيات بطريقة ممتعة وعملية تجعلك تتكلم جملاً حقيقية من أول أسبوع.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=80',
    price: '297 درهم',
    originalPrice: '500 درهم',
    duration: '6 أسابيع',
    lessons: '24 درس',
    students: '850+',
    rating: 4.9,
    features: [
      'الحروف والأصوات الإنجليزية',
      'الكلمات اليومية الأكثر استخداماً',
      'جمل التحية والتعارف',
      'الأرقام، التواريخ، الألوان',
      'محادثات بسيطة من الحياة اليومية',
      'تمارين نطق يومية',
    ],
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600',
    popular: false,
  },
  {
    id: 2,
    level: 'متوسط',
    levelColor: 'bg-blue-100 text-blue-700 border-blue-200',
    badge: '🚀',
    title: 'التواصل اليومي بثقة',
    subtitle: 'للمتوسطين الراغبين في التحسين',
    desc: 'تعلم كيف تتحدث في المواقف الحقيقية: في العمل، مع الأصدقاء، في السفر، وفي التسوق. محادثات عملية 100%.',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80',
    price: '397 درهم',
    originalPrice: '700 درهم',
    duration: '8 أسابيع',
    lessons: '32 درس',
    students: '1200+',
    rating: 5.0,
    features: [
      'محادثات في بيئة العمل والمكتب',
      'التسوق والمطاعم والفنادق',
      'اللغة الإنجليزية للسفر',
      'التعبير عن الآراء والمشاعر',
      'التعامل مع المواقف الصعبة',
      'بناء مفردات قوية وعملية',
    ],
    icon: MessageCircle,
    color: 'from-brand-500 to-brand-700',
    popular: true,
  },
  {
    id: 3,
    level: 'متقدم',
    levelColor: 'bg-purple-100 text-purple-700 border-purple-200',
    badge: '⭐',
    title: 'النطق والطلاقة المتقدمة',
    subtitle: 'للمتقدمين الساعين للاحتراف',
    desc: 'انتقل إلى مستوى الاحتراف: نطق طبيعي كالناطقين الأصليين، تعبيرات متقدمة، ومحادثات في أصعب المواضيع.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80',
    price: '497 درهم',
    originalPrice: '900 درهم',
    duration: '10 أسابيع',
    lessons: '40 درس',
    students: '500+',
    rating: 4.8,
    features: [
      'النطق المتقدم والأصوات الدقيقة',
      'تعبيرات اصطلاحية (Idioms)',
      'لغة الأعمال والمقابلات',
      'مناقشة مواضيع معقدة بطلاقة',
      'الكتابة والقراءة المتقدمة',
      'جلسات محادثة حية مع المدرب',
    ],
    icon: Mic,
    color: 'from-purple-500 to-purple-700',
    popular: false,
  },
  {
    id: 4,
    level: 'خاص',
    levelColor: 'bg-orange-100 text-orange-700 border-orange-200',
    badge: '💼',
    title: 'الإعداد للمقابلات الوظيفية',
    subtitle: 'للباحثين عن فرص عمل دولية',
    desc: 'كيف تجتاز مقابلة عمل بالإنجليزية بثقة؟ تدرّب على أشهر الأسئلة وكيف تجيب عليها باحترافية.',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=700&q=80',
    price: '347 درهم',
    originalPrice: '600 درهم',
    duration: '4 أسابيع',
    lessons: '16 درس',
    students: '400+',
    rating: 4.9,
    features: [
      'أشهر أسئلة المقابلات وإجاباتها',
      'كيف تقدم نفسك باحترافية',
      'لغة الجسد والثقة بالنفس',
      'التفاوض على الراتب بالإنجليزية',
      'أسئلة تقنية وتخصصية',
      'محاكاة مقابلات حقيقية',
    ],
    icon: Globe,
    color: 'from-orange-400 to-orange-600',
    popular: false,
  },
]

export default function CoursesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-hero pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-blue-100 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
            دوراتنا التعليمية
          </span>
          <h1 className="text-5xl font-black text-white mb-5 leading-tight">
            اختر دورتك وابدأ رحلتك
          </h1>
          <p className="text-blue-100/80 text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            دورات مصممة لتحسين مستواك بشكل عملي وسريع — سواء كنت مبتدئاً من الصفر أو متقدماً تريد الاحتراف.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Users,    value: '+2000', label: 'طالب' },
              { icon: BookOpen, value: '4',     label: 'دورات متاحة' },
              { icon: Star,     value: '4.9',   label: 'متوسط التقييم' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 text-white">
                <Icon size={18} className="text-blue-300" />
                <strong>{value}</strong>
                <span className="text-blue-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses Grid ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => {
              const Icon = course.icon
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 card-hover relative ${
                    course.popular ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {course.popular && (
                    <div className="absolute top-4 left-4 z-10 bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      🔥 الأكثر شعبية
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={course.img}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />

                    {/* Level badge */}
                    <span className={`absolute top-4 right-4 ${course.levelColor} border text-xs font-bold px-3 py-1.5 rounded-full`}>
                      {course.badge} {course.level}
                    </span>

                    {/* Icon */}
                    <div className={`absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7">
                    <p className="text-gray-400 text-sm font-medium mb-1">{course.subtitle}</p>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">{course.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-5">{course.desc}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-brand-400" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={15} className="text-brand-400" />
                        {course.lessons}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={15} className="text-brand-400" />
                        {course.students} طالب
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star size={15} className="fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                      <p className="text-sm font-bold text-gray-700 mb-3">ماذا ستتعلم؟</p>
                      <ul className="grid grid-cols-1 gap-2">
                        {course.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-brand-700">{course.price}</span>
                        <span className="text-sm text-gray-400 line-through mr-2">{course.originalPrice}</span>
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full mr-1">وفّر 40%</span>
                      </div>
                      <a
                        href={`https://wa.me/212707902091?text=مرحباً%20حمزة،%20أريد%20التسجيل%20في%20دورة:%20${encodeURIComponent(course.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-brand-600/30 transition-all duration-300 flex items-center gap-2"
                      >
                        سجّل الآن
                        <ArrowLeft size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Guarantee Section ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-3xl p-10 text-center border border-brand-100">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">ضمان الرضا 100%</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
              إذا لم تلاحظ تحسناً في مستواك خلال أول أسبوعين، سنعيد لك أموالك كاملة بدون أي أسئلة.
              نحن واثقون من جودة برنامجنا.
            </p>
            <a
              href="https://wa.me/212707902091?text=مرحباً%20حمزة،%20أريد%20الاستفسار%20عن%20الدورات"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-brand-600/30 transition-all duration-300"
            >
              استشارة مجانية على واتساب
              <Zap size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
