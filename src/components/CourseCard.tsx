import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Star, Users, Clock, BookOpen } from 'lucide-react'
import type { Course } from '@/data/courses'

// All Tailwind classes defined here so the JIT scanner picks them up
const COLOR_MAP = {
  emerald: {
    gradientOverlay: 'from-emerald-600/70 to-teal-600/60',
    btn: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    check: 'text-emerald-500',
    ring: 'ring-2 ring-emerald-500 ring-offset-2',
    glow: 'hover:shadow-emerald-500/20',
    spotBg: 'bg-emerald-500',
    bestBanner: 'from-emerald-500 to-teal-600',
    discount: 'text-emerald-600 bg-emerald-50',
  },
  blue: {
    gradientOverlay: 'from-blue-600/70 to-cyan-600/60',
    btn: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/30',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    check: 'text-blue-500',
    ring: 'ring-2 ring-blue-500 ring-offset-2',
    glow: 'hover:shadow-blue-500/20',
    spotBg: 'bg-blue-500',
    bestBanner: 'from-blue-500 to-cyan-500',
    discount: 'text-blue-600 bg-blue-50',
  },
  violet: {
    gradientOverlay: 'from-violet-600/70 to-purple-600/60',
    btn: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-violet-500/30',
    badge: 'bg-violet-100 text-violet-700 border border-violet-200',
    check: 'text-violet-500',
    ring: 'ring-2 ring-violet-500 ring-offset-2',
    glow: 'hover:shadow-violet-500/20',
    spotBg: 'bg-violet-500',
    bestBanner: 'from-violet-500 to-purple-600',
    discount: 'text-violet-600 bg-violet-50',
  },
  orange: {
    gradientOverlay: 'from-orange-600/70 to-red-500/60',
    btn: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30',
    badge: 'bg-orange-100 text-orange-700 border border-orange-200',
    check: 'text-orange-500',
    ring: 'ring-2 ring-orange-500 ring-offset-2',
    glow: 'hover:shadow-orange-500/20',
    spotBg: 'bg-orange-500',
    bestBanner: 'from-orange-500 to-red-500',
    discount: 'text-orange-600 bg-orange-50',
  },
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const c = COLOR_MAP[course.colorKey]
  const discountPct = Math.round((1 - course.price / course.originalPrice) * 100)
  const waText = encodeURIComponent(
    `مرحباً، أريد الانضمام لكورس ${course.title} (${course.fromLevel}→${course.toLevel}) بسعر ${course.price} ${course.currency}`
  )
  const waUrl = `https://wa.me/212707902091?text=${waText}`

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl ${c.glow} transition-all duration-500 hover:-translate-y-2 border border-gray-100/80 ${course.isBestValue ? c.ring : ''}`}
    >
      {/* Best value banner */}
      {course.isBestValue && (
        <div
          className={`absolute top-0 inset-x-0 z-20 bg-gradient-to-r ${c.bestBanner} text-white text-center py-2 text-sm font-black tracking-wide`}
        >
          ⭐ الأفضل قيمة — الأكثر مبيعاً
        </div>
      )}

      {/* Image */}
      <div className={`relative overflow-hidden ${course.isBestValue ? 'h-52 mt-9' : 'h-56'}`}>
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${c.gradientOverlay}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Level badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
            {course.fromLevel} → {course.toLevel}
          </span>
        </div>

        {/* Course badge */}
        {course.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
              {course.badge}
            </span>
          </div>
        )}

        {/* Spots left */}
        {course.spotsLeft <= 5 && (
          <div className="absolute bottom-4 right-4 z-10">
            <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md animate-pulse-slow">
              🔥 {course.spotsLeft} مقاعد فقط!
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Rating + students */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-gray-500 font-bold mr-1">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>{course.studentsCount} طالب</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 mb-1">{course.title}</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {course.subtitle}
        </p>

        {/* Hook */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5">{course.hook}</p>

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {course.features.slice(0, 4).map((feat, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
              <CheckCircle className={`w-4 h-4 flex-shrink-0 ${c.check}`} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.weeks} أسابيع</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.lessons} درس مسجل</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{course.price}</span>
              <span className="text-base font-bold text-gray-500">{course.currency}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400 line-through">
                {course.originalPrice} {course.currency}
              </span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${c.discount}`}>
                وفر {discountPct}%
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full text-center py-3.5 px-6 rounded-2xl text-white font-black text-base ${c.btn} shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95`}
          >
            سجّل الآن عبر واتساب ←
          </a>
          <Link
            href={`/courses/${course.slug}`}
            className="w-full text-center py-2.5 px-6 rounded-2xl text-gray-500 font-bold text-sm hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 border border-gray-200"
          >
            تفاصيل الكورس
          </Link>
        </div>
      </div>
    </div>
  )
}
