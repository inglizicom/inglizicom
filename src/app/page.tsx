import Image from 'next/image'
import Link from 'next/link'
import {
  Star, Users, Globe, Trophy, CheckCircle, ArrowLeft,
  Mic, BookOpen, MessageCircle, Zap, ChevronLeft,
  Instagram, Youtube, TrendingUp, Shield, Clock,
} from 'lucide-react'
import FadeIn from '@/components/FadeIn'

/* ─────────────────────────────────────────
   INLINE SVGs
───────────────────────────────────────── */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const avatars = [
  { initials: 'أح', bg: '#3b82f6' },
  { initials: 'سر', bg: '#ec4899' },
  { initials: 'مح', bg: '#10b981' },
  { initials: 'نو', bg: '#f97316' },
  { initials: 'عل', bg: '#8b5cf6' },
]

const countries = [
  '🇲🇦 المغرب', '🇸🇦 السعودية', '🇦🇪 الإمارات',
  '🇪🇬 مصر', '🇰🇼 الكويت', '🇩🇿 الجزائر',
  '🇯🇴 الأردن', '🇹🇳 تونس', '🇶🇦 قطر',
]

const stats = [
  { icon: Users,      value: '+2000', label: 'طالب ناجح'      },
  { icon: Globe,      value: '+15',   label: 'دولة مختلفة'    },
  { icon: Trophy,     value: '98%',   label: 'نسبة الرضا'     },
  { icon: Star,       value: '4.9',   label: 'تقييم الطلاب'   },
]

const features = [
  {
    icon: Mic,
    title: 'تحسين النطق',
    desc: 'تقنيات عملية لنطق الكلمات بشكل صحيح وطبيعي مثل الناطقين الأصليين.',
    color: 'bg-blue-50 text-brand-600',
    border: 'hover:border-brand-200',
  },
  {
    icon: MessageCircle,
    title: 'التواصل اليومي',
    desc: 'تعلم المحادثات الحقيقية التي تستخدمها في الحياة اليومية والعمل.',
    color: 'bg-orange-50 text-orange-500',
    border: 'hover:border-orange-200',
  },
  {
    icon: Zap,
    title: 'تقدم سريع',
    desc: 'منهج مكثف يركز على النتائج الفعلية في أقصر وقت بدون تعقيد.',
    color: 'bg-green-50 text-green-600',
    border: 'hover:border-green-200',
  },
  {
    icon: Shield,
    title: 'بدون خوف',
    desc: 'نبني ثقتك خطوة بخطوة. مناسب للخجولين والمبتدئين الكاملين.',
    color: 'bg-purple-50 text-purple-600',
    border: 'hover:border-purple-200',
  },
]

// Only 2 hero courses for the homepage preview
const homepageCourses = [
  {
    badge: '🌱',
    level: 'مبتدئ',
    levelStyle: 'bg-green-100 text-green-800',
    title: 'من الصفر إلى المحادثة',
    desc: 'لمن لا يعرف شيئاً. ستتكلم جملاً حقيقية من الأسبوع الأول بدون حفظ.',
    highlights: ['الحروف والأصوات', 'المفردات اليومية', 'جمل عملية فورية'],
    duration: '6 أسابيع',
    lessons: '24 درس',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=80',
    featured: false,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    badge: '🗣️',
    level: 'تحدث بثقة',
    levelStyle: 'bg-brand-100 text-brand-800',
    title: 'دورة النطق والتواصل',
    desc: 'دورتنا الأكثر طلباً. تحسّن نطقك وتكلم بدون تفكير في الأخطاء.',
    highlights: ['نطق احترافي', 'محادثات حية', 'تمارين يومية'],
    duration: '8 أسابيع',
    lessons: '32 درس',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80',
    featured: true,
    gradient: 'from-brand-600 to-brand-800',
  },
]

const testimonials = [
  {
    name: 'أحمد بنعلي',
    country: 'المغرب 🇲🇦',
    role: 'مهندس برمجيات',
    text: 'كنت خائفاً جداً من التحدث بالإنجليزية. بعد شهر مع حمزة أصبحت أجري مقابلات وظيفية بالإنجليزية بثقة تامة! أسلوبه بسيط ومحفّز بشكل رائع.',
    before: 'خائف من الكلام',
    after: 'مقابلات بالإنجليزية',
    stars: 5,
    avatar: 'أ',
    avatarBg: 'bg-blue-500',
  },
  {
    name: 'سارة الزهراني',
    country: 'السعودية 🇸🇦',
    role: 'طالبة جامعية',
    text: 'استفدت كثيراً من دروس النطق. كنت أجد صعوبة في الأصوات الإنجليزية، الآن كل من أتحدث معه يعجبه نطقي. لم أكن أصدق أن هذا ممكن.',
    before: 'صعوبة في النطق',
    after: 'نطق واضح ومميز',
    stars: 5,
    avatar: 'س',
    avatarBg: 'bg-pink-500',
  },
  {
    name: 'محمد الخالدي',
    country: 'الكويت 🇰🇼',
    role: 'رجل أعمال',
    text: 'المنهج رائع لأنه يركز على الكلام الحقيقي لا على القواعد الممللة. في 3 أشهر تحسن مستواي بشكل كبير وأصبحت أتواصل مع شركاء أجانب بثقة.',
    before: 'لا يستطيع التواصل',
    after: 'اجتماعات أعمال بالإنجليزية',
    stars: 5,
    avatar: 'م',
    avatarBg: 'bg-green-500',
  },
  {
    name: 'نورة العتيبي',
    country: 'الإمارات 🇦🇪',
    role: 'مدرسة',
    text: 'حمزة يفهم مشاكلنا نحن العرب في تعلم الإنجليزية. يقدم حلولاً عملية وواضحة. أنصح به بشدة لأي شخص يريد تحسين مستواه بجدية.',
    before: 'خجل من الكلام',
    after: 'تدرّس بالإنجليزية',
    stars: 5,
    avatar: 'ن',
    avatarBg: 'bg-orange-500',
  },
  {
    name: 'يوسف الإدريسي',
    country: 'المغرب 🇲🇦',
    role: 'مبرمج مستقل',
    text: 'بدأت الدورة وأنا لا أعرف كيف أقول جملة كاملة. بعد شهرين أصبحت أعمل مع عملاء أوروبيين وأجري اجتماعات بالإنجليزية يومياً. شكراً حمزة!',
    before: 'لا يستطيع تكوين جملة',
    after: 'يعمل مع عملاء دوليين',
    stars: 5,
    avatar: 'ي',
    avatarBg: 'bg-teal-500',
  },
]

const socialPlatforms = [
  {
    name: 'Instagram',
    handle: '@elqasraouihamza',
    url: 'https://www.instagram.com/elqasraouihamza/',
    icon: Instagram,
    desc: 'نصائح يومية، تمارين سريعة',
    followers: '+50K',
    bg: 'from-pink-500 via-red-500 to-orange-400',
    lightBg: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    name: 'TikTok',
    handle: '@elqasraouihamza',
    url: 'https://www.tiktok.com/@elqasraouihamza',
    iconCustom: TikTokIcon,
    desc: 'فيديوهات تعليمية قصيرة وممتعة',
    followers: '+100K',
    bg: 'from-gray-900 to-gray-700',
    lightBg: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  {
    name: 'YouTube',
    handle: '@hamzaelqasraoui',
    url: 'https://www.youtube.com/@hamzaelqasraoui',
    icon: Youtube,
    desc: 'دروس كاملة مجانية',
    followers: '+30K',
    bg: 'from-red-600 to-red-500',
    lightBg: 'bg-red-50',
    textColor: 'text-red-600',
  },
]

/* ─────────────────────────────────────────
   HELPER
───────────────────────────────────────── */
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════ */}
      <section className="relative bg-hero min-h-screen flex items-center overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-16 left-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* ── Text Side ── */}
            <div className="text-white order-1">

              {/* Live badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 rounded-full px-4 py-2 mb-7 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <span className="text-sm font-semibold text-blue-100">
                  +2000 طالب بدأوا رحلتهم — انضم إليهم اليوم
                </span>
              </div>

              {/* ── Main Headline ── */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mb-6">
                تكلم الإنجليزية بثقة
                <br />
                <span className="hero-gradient-text">حتى لو كنت مبتدئًا</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-xl text-blue-100/90 leading-relaxed mb-8 max-w-lg">
                أساعدك على تحسين{' '}
                <strong className="text-white highlight-underline">النطق والتواصل</strong>{' '}
                في وقت قصير — بدون قواعد معقدة، بدون حفظ، وبدون خوف.
              </p>

              {/* Checklist */}
              <ul className="space-y-3 mb-9">
                {[
                  'مناسب للمبتدئين الكاملين من أول درس',
                  'تتكلم جملاً حقيقية خلال أسبوع واحد فقط',
                  'أسلوب محفّز يبني الثقة بالنفس',
                  'نتائج ملموسة خلال أسابيع قليلة',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-blue-100">
                    <CheckCircle size={19} className="text-green-400 flex-shrink-0" />
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>

              {/* ── CTA Buttons ── */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/courses"
                  className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center gap-2 text-lg"
                >
                  ابدأ الآن
                  <ArrowLeft size={20} />
                </Link>
                <a
                  href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25d366] hover:bg-[#20b858] active:scale-95 text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2 text-lg"
                >
                  <WhatsAppIcon size={22} />
                  تواصل عبر واتساب
                </a>
              </div>

              {/* ── Micro social proof ── */}
              <div className="flex items-center gap-4">
                {/* Avatar stack */}
                <div className="avatar-stack flex flex-row-reverse">
                  {avatars.map((a) => (
                    <div
                      key={a.initials}
                      className="avatar-item"
                      style={{ background: a.bg }}
                    >
                      {a.initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-blue-100/80 text-sm font-medium">
                    <strong className="text-white">+2000 طالب</strong> من 15 دولة عربية
                  </p>
                </div>
              </div>
            </div>

            {/* ── Image Side ── */}
            <div className="order-2 relative flex justify-center">
              <div className="relative w-full max-w-[460px]">

                {/* Glow behind image */}
                <div className="absolute -inset-4 bg-brand-400/20 rounded-3xl blur-2xl" />

                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/60 border-4 border-white/15 z-10">
                  <Image
                    src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80"
                    alt="طالب يتحدث الإنجليزية بثقة"
                    width={560}
                    height={450}
                    className="w-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent" />

                  {/* Video preview badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/60 cursor-pointer hover:bg-white/30 transition-all hover:scale-110">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[0px] border-l-[18px] border-l-white mr-[-4px]" />
                    </div>
                  </div>
                </div>

                {/* Floating card – student count */}
                <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 border border-blue-50 z-20 animate-float">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-brand-700">+2000</p>
                    <p className="text-xs text-gray-500 font-semibold">طالب نجح معنا</p>
                  </div>
                </div>

                {/* Floating card – rating */}
                <div className="absolute -top-5 -left-4 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-amber-50 z-20">
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs font-semibold text-gray-600">تقييم الطلاب</p>
                  <p className="text-xl font-black text-brand-700">5.0 / 5.0</p>
                </div>

                {/* Floating card – recent join */}
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-white rounded-2xl shadow-xl px-4 py-3 border border-green-50 z-20 hidden xl:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">🇸🇦</div>
                    <div>
                      <p className="text-xs font-black text-gray-900">انضم للتو!</p>
                      <p className="text-xs text-gray-400">طالب من السعودية</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 90L1440 90L1440 30C1300 70 1100 5 900 25C700 45 500 70 300 50C150 35 60 55 0 30L0 90Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. STATS BAR
      ══════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <FadeIn key={label} delay={i * 80}>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100/70 card-hover">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Icon size={22} className="text-brand-600" />
                    </div>
                    <p className="text-3xl font-black text-brand-700">{value}</p>
                    <p className="text-sm text-gray-500 font-semibold mt-1">{label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. TRUST / SOCIAL PROOF SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-b from-white to-brand-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-block bg-green-100 text-green-800 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                🌍 شبكتنا من الطلاب
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-3">
                أكثر من 2000 طالب من مختلف الدول
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                نتائج حقيقية، طلاب حقيقيون، من كل أنحاء العالم العربي.
              </p>
            </div>
          </FadeIn>

          {/* Big social proof banner */}
          <FadeIn delay={100}>
            <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden">
              {/* BG decoration */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Left: Avatar cluster + count */}
                <div className="text-center md:text-right">
                  {/* Large avatar stack */}
                  <div className="flex justify-center md:justify-start mb-4 avatar-stack">
                    {avatars.map((a) => (
                      <div
                        key={a.initials}
                        className="avatar-item text-base"
                        style={{ background: a.bg, width: 52, height: 52, fontSize: 18 }}
                      >
                        {a.initials}
                      </div>
                    ))}
                    <div
                      className="avatar-item text-sm"
                      style={{ background: '#6b7280', width: 52, height: 52 }}
                    >
                      +
                    </div>
                  </div>

                  <p className="text-5xl font-black text-white mb-1">+2000</p>
                  <p className="text-blue-200 font-semibold text-lg">طالب نجح وحسّن مستواه</p>

                  {/* Rating row */}
                  <div className="flex items-center gap-2 justify-center md:justify-start mt-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-white font-black text-lg">4.9</span>
                    <span className="text-blue-200 text-sm">من 500+ تقييم</span>
                  </div>
                </div>

                {/* Right: Country pills */}
                <div>
                  <p className="text-blue-200 font-semibold mb-4 text-center md:text-right">
                    طلابنا من:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {countries.map((c) => (
                      <span key={c} className="country-pill">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Before/After strip */}
          <FadeIn delay={150}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '😰', before: 'خائف من الكلام', after: 'يتحدث بثقة', pct: '94%' },
                { icon: '🔇', before: 'لا يفهم عند الاستماع', after: 'يفهم الأفلام والبودكاست', pct: '87%' },
                { icon: '🤐', before: 'يخجل من الأخطاء', after: 'يتكلم بدون خوف', pct: '91%' },
              ].map((item) => (
                <div key={item.before} className="before-after-badge rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold line-through">{item.before}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">{item.after}</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-2 mb-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: item.pct }} />
                  </div>
                  <p className="text-green-700 text-xs font-bold">{item.pct} من طلابنا يلاحظون هذا</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. ABOUT TEACHER — Emotional Storytelling
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <FadeIn direction="right">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-200">
                  <Image
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&q=80"
                    alt="حمزة القصراوي - مدرب التواصل"
                    width={600}
                    height={520}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
                </div>

                {/* Experience badge */}
                <div className="absolute -bottom-5 right-6 bg-brand-600 text-white rounded-2xl px-6 py-4 shadow-xl">
                  <p className="text-3xl font-black">+5</p>
                  <p className="text-sm font-semibold opacity-90">سنوات خبرة</p>
                </div>

                {/* Quote callout */}
                <div className="absolute -top-5 left-4 bg-white rounded-2xl shadow-xl px-5 py-4 max-w-xs border border-blue-50">
                  <p className="text-gray-700 text-sm leading-snug font-medium">
                    <span className="text-3xl text-brand-300 font-serif">"</span>
                    الخوف من الكلام هو أكبر عائق — وأنا أساعدك على تجاوزه.
                    <span className="text-3xl text-brand-300 font-serif">"</span>
                  </p>
                  <p className="text-brand-600 font-bold text-xs mt-2">— حمزة القصراوي</p>
                </div>
              </div>
            </FadeIn>

            {/* Content */}
            <FadeIn direction="left" delay={100}>
              <div>
                <span className="inline-block bg-brand-100 text-brand-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
                  قصة حمزة
                </span>
                <h2 className="text-4xl font-black text-gray-900 mb-5 leading-tight">
                  كان مثلك تماماً —<br />
                  <span className="text-gradient">خائفاً من الإنجليزية</span>
                </h2>

                {/* Emotional storytelling */}
                <div className="space-y-4 mb-7">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    درس حمزة الإنجليزية لسنوات في المدرسة ولم يستطع قول جملة واحدة بثقة. القواعد المعقدة، الحفظ الممل، والخوف من الخطأ جعلته يكره اللغة.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    يوماً ما قرر أن يتعلم بطريقة مختلفة — التركيز على الكلام الحقيقي. خلال أشهر قليلة تحول من شخص خجول إلى مدرب يساعد الآلاف.
                  </p>
                  <p className="text-gray-700 font-semibold leading-relaxed">
                    💡 اليوم، رسالته الوحيدة هي مساعدتك أنت — المبتدئ، الخجول، والشخص الذي يعتقد أن الإنجليزية صعبة — على التحدث بثقة.
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'ساعد +2000 طالب من 15 دولة عربية',
                    'متخصص في الخجولين والمبتدئين',
                    'يركز على الكلام الحقيقي لا القواعد',
                    'نتائج مثبتة في أسابيع قليلة',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={15} className="text-green-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-7 rounded-xl shadow-lg hover:shadow-brand-600/30 transition-all duration-300"
                >
                  اقرأ قصته كاملة
                  <ChevronLeft size={18} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. WHY DIFFERENT
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-gradient-to-br from-brand-950 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-white/10 text-blue-200 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                لماذا إنجليزي.كوم؟
              </span>
              <h2 className="text-4xl font-black text-white mb-4">
                طريقة تعليم مختلفة تماماً
              </h2>
              <p className="text-blue-200/80 text-lg max-w-xl mx-auto">
                لسنا مدرسة تقليدية. نحن نركز على ما يهمك: التكلم والتواصل بثقة.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, color, border }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <div
                  className={`bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 card-hover ${border}`}
                >
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="text-white font-black text-lg mb-2">{title}</h3>
                  <p className="text-blue-200/70 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Comparison table */}
          <FadeIn delay={200}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-6">
                <p className="text-red-300 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">❌</span> التعليم التقليدي
                </p>
                <ul className="space-y-2">
                  {['حفظ قواعد معقدة', 'ممل وطويل', 'لا تتكلم رغم سنوات الدراسة', 'يزيد الخوف'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-red-200/70 text-sm">
                      <span className="text-red-400">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-6">
                <p className="text-green-300 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">✅</span> منهج حمزة
                </p>
                <ul className="space-y-2">
                  {['تكلم من أول درس', 'ممتع ومحفّز', 'تتحسن بشكل ملموس كل أسبوع', 'يزيد ثقتك بنفسك'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-green-200/80 text-sm">
                      <span className="text-green-400">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. COURSES PREVIEW (2 main courses)
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-brand-100 text-brand-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                الدورات
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                اختر دورتك وابدأ اليوم
              </h2>
              <p className="text-gray-500 text-lg max-w-lg mx-auto">
                دورات مصممة بعناية — من أول كلمة إنجليزية حتى المحادثة الطلقة.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homepageCourses.map((course, i) => (
              <FadeIn key={course.title} delay={i * 100}>
                <div
                  className={`bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 ${
                    course.featured ? 'course-card-featured shadow-brand-200' : 'card-hover'
                  }`}
                >
                  {course.featured && (
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white text-center py-2 text-sm font-black">
                      🔥 الأكثر شعبية
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image src={course.img} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                    <span className={`absolute top-4 right-4 ${course.levelStyle} text-xs font-black px-3 py-1.5 rounded-full`}>
                      {course.badge} {course.level}
                    </span>
                  </div>

                  <div className="p-7">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-5">{course.desc}</p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {course.highlights.map(h => (
                        <span key={h} className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-full border border-brand-100">
                          ✓ {h}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-brand-400" />
                        {course.lessons}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-400" />
                        {course.duration}
                      </span>
                    </div>

                    {/* Two CTAs */}
                    <div className="flex gap-3">
                      <a
                        href={`https://wa.me/212707902091?text=مرحبا،%20أريد%20التسجيل%20في%20دورة:%20${encodeURIComponent(course.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#25d366] hover:bg-[#20b858] text-white font-black py-3 px-4 rounded-xl text-center text-sm transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <WhatsAppIcon size={16} />
                        ابدأ الآن
                      </a>
                      <Link
                        href="/courses"
                        className="flex-1 border-2 border-gray-200 hover:border-brand-400 text-gray-600 hover:text-brand-700 font-bold py-3 px-4 rounded-xl text-center text-sm transition-all duration-300"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200}>
            <div className="text-center mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300"
              >
                عرض جميع الدورات الأربع
                <ChevronLeft size={18} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. TESTIMONIALS — With before/after
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block bg-amber-100 text-amber-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                قصص النجاح
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                هؤلاء كانوا في مكانك
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                مبتدئون مثلك. خائفون مثلك. اليوم يتكلمون بثقة تامة.
              </p>
            </div>
          </FadeIn>

          {/* Featured testimonial */}
          <FadeIn delay={50}>
            <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-3xl p-8 sm:p-10 mb-8 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-8xl text-white/10 font-serif select-none">"</div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-white/90 text-xl leading-relaxed mb-6">
                    "{testimonials[0].text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${testimonials[0].avatarBg} rounded-full flex items-center justify-center text-white font-black text-xl`}>
                      {testimonials[0].avatar}
                    </div>
                    <div>
                      <p className="text-white font-black">{testimonials[0].name}</p>
                      <p className="text-blue-200/70 text-sm">{testimonials[0].role} • {testimonials[0].country}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
                  <TrendingUp size={40} className="text-green-400 mx-auto mb-3" />
                  <p className="text-blue-100 text-sm mb-2">التحول الحقيقي</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="bg-red-500/20 text-red-200 text-xs font-bold px-3 py-1.5 rounded-full line-through">{testimonials[0].before}</span>
                    <ArrowLeft size={18} className="text-green-400 rotate-180" />
                    <span className="bg-green-500/20 text-green-200 text-xs font-bold px-3 py-1.5 rounded-full">{testimonials[0].after}</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Grid of remaining testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.slice(1).map((t, i) => (
              <FadeIn key={t.name} delay={i * 80}>
                <div className="testimonial-card rounded-2xl p-6 card-hover h-full flex flex-col">
                  <div className="text-4xl text-brand-200 font-serif leading-none mb-3">"</div>
                  <p className="text-gray-700 leading-relaxed mb-4 flex-1">{t.text}</p>

                  {/* Before/After pill */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full font-semibold line-through">{t.before}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-semibold">{t.after}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${t.avatarBg} rounded-full flex items-center justify-center text-white font-bold`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs">{t.role} • {t.country}</p>
                      </div>
                    </div>
                    <StarRating count={t.stars} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. SOCIAL MEDIA SECTION
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-block bg-purple-100 text-purple-700 font-bold text-sm px-4 py-1.5 rounded-full mb-4">
                وسائل التواصل
              </span>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                تابعنا وتعلم مجاناً كل يوم
              </h2>
              <p className="text-gray-500 text-lg max-w-lg mx-auto">
                محتوى يومي مجاني على منصاتنا — نصائح، تمارين، ودروس قصيرة.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialPlatforms.map((platform, i) => {
              const Icon = platform.icon
              const CustomIcon = platform.iconCustom
              return (
                <FadeIn key={platform.name} delay={i * 80}>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-card block bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-br ${platform.bg} p-8 flex items-center justify-center`}>
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        {Icon ? (
                          <Icon size={34} className="text-white" />
                        ) : CustomIcon ? (
                          <CustomIcon size={34} />
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-gray-900 text-xl">{platform.name}</h3>
                        <span className={`${platform.lightBg} ${platform.textColor} text-xs font-black px-3 py-1.5 rounded-full`}>
                          {platform.followers}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{platform.handle}</p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{platform.desc}</p>
                      <div className={`inline-flex items-center gap-1 ${platform.textColor} font-bold text-sm`}>
                        تابع الآن
                        <ArrowLeft size={14} />
                      </div>
                    </div>
                  </a>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9. LEVEL TEST CTA
      ══════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="bg-gradient-to-br from-brand-50 via-blue-50 to-white rounded-3xl p-10 sm:p-14 text-center border border-brand-100 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand-100 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-60" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">
                  🎯
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  ما هو مستواك الحقيقي؟
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                  10 أسئلة بسيطة، 5 دقائق فقط. ستعرف مستواك وتحصل على توصية بالدورة المناسبة لك.
                </p>
                <Link
                  href="/level-test"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-brand-600/30 transition-all duration-300 active:scale-95 text-lg"
                >
                  ابدأ الاختبار المجاني
                  <ArrowLeft size={20} />
                </Link>
                <p className="text-gray-400 text-sm mt-4">مجاني 100% • بدون تسجيل • نتيجة فورية</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10. FINAL CTA BANNER
      ══════════════════════════════════════════════ */}
      <section className="bg-hero py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeIn>
            <p className="text-blue-300 font-bold mb-3">⚡ لا تنتظر أكثر</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              ابدأ رحلتك اليوم
              <br />
              <span className="hero-gradient-text">وتكلم بثقة قريباً</span>
            </h2>
            <p className="text-blue-200/80 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              انضم إلى +2000 طالب غيّروا مستواهم. الطريق أسهل مما تتخيل.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 text-lg"
              >
                سجّل في الدورة الآن
              </Link>
              <a
                href="https://wa.me/212707902091?text=مرحبا،%20أريد%20تعلم%20الإنجليزية"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25d366] hover:bg-[#20b858] text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-green-500/40 transition-all duration-300 active:scale-95 flex items-center gap-2 text-lg"
              >
                <WhatsAppIcon size={22} />
                تواصل على واتساب
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
