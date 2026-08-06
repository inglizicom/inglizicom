'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, ArrowLeft, Star, Users, Clock, BookOpen, Flame, PlayCircle } from 'lucide-react'
import { openSubscribe } from '@/lib/lead-source'
import ApproxPrice from '@/components/ApproxPrice'
import { getPlanByCourseSlug } from '@/data/plans'
import type { Course } from '@/data/courses'

/* Full class strings — Tailwind's scanner needs literals. */
const C = {
  emerald: { accent: 'text-emerald-400', pillBg: 'bg-emerald-500/10', pillText: 'text-emerald-300', border: 'border-emerald-500/60', ring: 'ring-emerald-500/20', cta: 'bg-emerald-500 hover:bg-emerald-400 text-gray-900', aura: 'from-emerald-500/30' },
  blue:    { accent: 'text-blue-400',    pillBg: 'bg-blue-500/10',    pillText: 'text-blue-300',    border: 'border-blue-500/60',    ring: 'ring-blue-500/20',    cta: 'bg-blue-500 hover:bg-blue-400 text-white',      aura: 'from-blue-500/30' },
  violet:  { accent: 'text-violet-400',  pillBg: 'bg-violet-500/10',  pillText: 'text-violet-300',  border: 'border-violet-500/60',  ring: 'ring-violet-500/20',  cta: 'bg-violet-500 hover:bg-violet-400 text-white',  aura: 'from-violet-500/30' },
  orange:  { accent: 'text-orange-400',  pillBg: 'bg-orange-500/10',  pillText: 'text-orange-300',  border: 'border-orange-500/60',  ring: 'ring-orange-500/20',  cta: 'bg-orange-500 hover:bg-orange-400 text-gray-900', aura: 'from-orange-500/30' },
}

export default function CourseCardDark({
  course,
  dimmed = false,
}: {
  course: Course
  /** The level filter is active and this card isn't the match. */
  dimmed?: boolean
}) {
  const c = C[course.colorKey]

  /* plans.ts is the single source of truth for money. courses.ts only supplies
     the price when a level has no plan behind it yet (A2 → B1 today). */
  const plan     = getPlanByCourseSlug(course.slug)
  const price    = plan?.amount_mad     ?? course.price
  const original = plan?.originalAmount ?? course.originalPrice
  const discount = original > price ? Math.round((1 - price / original) * 100) : null

  const freeLessons = course.curriculum
    .flatMap(s => s.lessons)
    .filter(l => l.isFree).length

  return (
    <motion.article
      id={course.slug}
      animate={{ opacity: dimmed ? 0.38 : 1, scale: dimmed ? 0.985 : 1 }}
      transition={{ duration: 0.35 }}
      whileHover={dimmed ? undefined : { y: -6 }}
      className={`scroll-mt-28 group relative flex flex-col bg-[#0a1628] rounded-3xl overflow-hidden border-2 transition-colors ${
        course.isBestValue ? `${c.border} ring-2 ${c.ring}` : 'border-[#1a2d4a] hover:border-[#1e3455]'
      }`}
    >
      {course.isBestValue && (
        <div className={`absolute top-4 left-4 z-20 ${c.pillBg} ${c.pillText} backdrop-blur text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10`}>
          ⭐ الأفضل قيمة
        </div>
      )}

      {/* cover */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/70 to-transparent" />
        <div className={`absolute -bottom-16 right-1/2 translate-x-1/2 w-72 h-32 rounded-full blur-3xl bg-gradient-to-t ${c.aura} to-transparent opacity-60`} />

        <div className="absolute bottom-4 right-5 left-5 flex items-end justify-between gap-3">
          <div>
            <div className={`inline-flex items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-2.5 py-1 rounded-full mb-2 border border-white/10`}>
              {course.fromLevel} → {course.toLevel}
            </div>
            <h3 className="text-white font-black text-xl leading-tight">{course.title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 pb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-white text-xs font-black">{course.rating}</span>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-6 pt-5">
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{course.hook}</p>

        <ul className="space-y-2 mb-5">
          {course.features.slice(0, 4).map(f => (
            <li key={f} className="flex items-start gap-2 text-gray-300 text-[13px] leading-snug">
              <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${c.accent}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-gray-500 mb-5 pb-5 border-b border-[#1a2d4a]">
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{course.weeks} أسابيع</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{course.lessons} درساً</span>
          <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{course.studentsCount} طالب</span>
          {freeLessons > 0 && (
            <span className={`inline-flex items-center gap-1.5 ${c.accent}`}>
              <PlayCircle className="w-3.5 h-3.5" />{freeLessons} دروس مجانية
            </span>
          )}
        </div>

        {/* price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-white font-black text-3xl">{price.toLocaleString()}</span>
            <span className="text-gray-400 text-sm font-bold">{course.currency}</span>
            {original > price && (
              <span className="text-gray-600 text-sm line-through">{original.toLocaleString()}</span>
            )}
            {discount && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-black px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3" /> وفّر {discount}%
              </span>
            )}
          </div>
          <ApproxPrice mad={price} className={`${c.accent} text-xs font-bold`} />
        </div>

        {/* CTAs — push to the bottom so cards line up */}
        <div className="mt-auto flex flex-col gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => openSubscribe({ source: `course_card_${course.slug}`, planId: plan?.id })}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-colors ${c.cta}`}
          >
            سجّل في هذا المستوى <ArrowLeft className="w-4 h-4" />
          </motion.button>

          <div className="grid grid-cols-2 gap-2">
            {plan && (
              <Link
                href={`/pricing/${plan.id}`}
                className="text-center py-2.5 rounded-xl border border-[#1e3455] text-gray-300 hover:text-white hover:border-gray-500 font-bold text-xs transition-colors no-underline"
              >
                تفاصيل الباقة
              </Link>
            )}
            <Link
              href={`/courses/${course.slug}`}
              className={`${plan ? '' : 'col-span-2'} text-center py-2.5 rounded-xl border border-[#1e3455] text-gray-300 hover:text-white hover:border-gray-500 font-bold text-xs transition-colors no-underline`}
            >
              محتوى الدروس
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
