'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Lock, Play, ArrowRight, ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react'
import type { Course } from '@/data/courses'
import VideoPlayer from '@/components/course/VideoPlayer'

interface Props {
  course: Course
}

interface FlatLesson {
  title: string
  duration: string
  youtubeId: string
  isFree: boolean
  sectionTitle: string
  sectionIdx: number
  lessonIdx: number
}

export default function WatchClient({ course }: Props) {
  const flat: FlatLesson[] = useMemo(
    () =>
      course.curriculum.flatMap((section, sectionIdx) =>
        section.lessons.map((lesson, lessonIdx) => ({
          ...lesson,
          sectionTitle: section.title,
          sectionIdx,
          lessonIdx,
        })),
      ),
    [course],
  )

  const firstFreeIdx = flat.findIndex(l => l.isFree)
  const [activeIdx, setActiveIdx] = useState(firstFreeIdx >= 0 ? firstFreeIdx : 0)
  const active = flat[activeIdx]

  const freeCount = flat.filter(l => l.isFree).length
  const waLocked =
    'https://wa.me/212707902091?text=' +
    encodeURIComponent(`مرحباً، أريد الاشتراك في كورس "${course.title}" للوصول لجميع الدروس`)

  const hasPrev = activeIdx > 0
  const hasNext = activeIdx < flat.length - 1

  return (
    <main className="min-h-screen bg-gray-950 pt-[60px]" dir="rtl">
      {/* ─── Top bar ─── */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لصفحة الكورس
          </Link>
          <div className="text-xs text-gray-500 hidden sm:block">
            <span className="font-bold text-emerald-400">{freeCount} دروس مجانية</span>
            <span className="mx-2 text-gray-700">·</span>
            <span>{flat.length} درس إجمالاً</span>
          </div>
        </div>
      </div>

      {/* ─── Grid ─── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-4 lg:p-6">
        {/* Main */}
        <section className="min-w-0">
          {active.isFree && active.youtubeId ? (
            <VideoPlayer youtubeId={active.youtubeId} />
          ) : (
            <LockedOverlay waUrl={waLocked} courseTitle={course.title} />
          )}

          {/* Lesson info */}
          <div className="mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
              {active.sectionTitle}
            </div>
            <h1 className="text-2xl font-black text-white leading-snug">{active.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-3">
              <span className="font-semibold">{active.duration}</span>
              {active.isFree ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4" /> درس مجاني
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                  <Lock className="w-4 h-4" /> للمشتركين فقط
                </span>
              )}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => hasPrev && setActiveIdx(activeIdx - 1)}
              disabled={!hasPrev}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ArrowRight className="w-4 h-4" />
              الدرس السابق
            </button>
            <button
              onClick={() => hasNext && setActiveIdx(activeIdx + 1)}
              disabled={!hasNext}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              الدرس التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Sidebar: curriculum */}
        <aside className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden self-start lg:sticky lg:top-[80px]">
          <div className="p-5 border-b border-gray-800">
            <div className="text-xs font-black text-gray-500 mb-1 uppercase tracking-widest">
              محتوى الكورس
            </div>
            <h2 className="text-white font-black text-lg leading-snug">{course.title}</h2>
            <div className="text-xs text-gray-400 mt-2 font-semibold">
              {course.curriculum.length} وحدات · {flat.length} درس ·{' '}
              <span className="text-emerald-400">{freeCount} مجاني</span>
            </div>
          </div>

          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            {course.curriculum.map((section, si) => (
              <div key={si}>
                <div className="px-5 py-3 bg-gray-900 text-xs font-black tracking-wider text-gray-400 border-t border-gray-800">
                  {section.title}
                </div>
                {section.lessons.map((lesson, li) => {
                  const idx = flat.findIndex(
                    l => l.sectionIdx === si && l.lessonIdx === li,
                  )
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={li}
                      onClick={() => setActiveIdx(idx)}
                      className={`w-full text-right px-5 py-3 border-t border-gray-800 flex items-center gap-3 transition-colors ${
                        isActive ? 'bg-brand-600/20' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? 'bg-brand-500'
                            : lesson.isFree
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-gray-800 border border-gray-700'
                        }`}
                      >
                        {lesson.isFree ? (
                          <Play
                            className={`w-3.5 h-3.5 fill-current ${
                              isActive ? 'text-white' : 'text-emerald-400'
                            }`}
                          />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <div
                          className={`text-sm leading-snug line-clamp-2 ${
                            isActive ? 'text-white font-bold' : 'text-gray-300'
                          }`}
                        >
                          {lesson.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 font-semibold">
                          {lesson.duration}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950">
            <a
              href={waLocked}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              احصل على الكورس كاملاً
            </a>
            <p className="text-xs text-gray-500 text-center mt-2.5 font-semibold">
              تواصل مع الأستاذ عبر واتساب
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

function LockedOverlay({
  waUrl,
  courseTitle,
}: {
  waUrl: string
  courseTitle: string
}) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center border border-gray-800">
      {/* Decorative blur dots */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-6 max-w-md">
        <div className="w-20 h-20 mx-auto mb-5 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
          <Lock className="w-9 h-9 text-amber-400" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3">هذا الدرس للمشتركين فقط</h3>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          اشترك في كورس &quot;{courseTitle}&quot; للوصول لجميع الدروس
          ومتابعة شخصية من الأستاذ
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          تواصل مع الأستاذ للاشتراك
        </a>
      </div>
    </div>
  )
}
