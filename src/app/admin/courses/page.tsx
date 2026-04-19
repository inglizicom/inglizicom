'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, ExternalLink, Play, Lock, Loader2, Globe } from 'lucide-react'
import { COURSES } from '@/data/courses'
import { fetchAllCourseLessons } from '@/lib/course-lessons-db'
import { fetchAllCourseMeta, type CourseMeta } from '@/lib/course-meta-db'

export default function CoursesAdminPage() {
  const [counts, setCounts] = useState<Record<string, { total: number; free: number }>>({})
  const [meta, setMeta]     = useState<Record<string, CourseMeta>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [rows, metas] = await Promise.all([
        fetchAllCourseLessons(),
        fetchAllCourseMeta(),
      ])
      const byCourse: Record<string, { total: number; free: number }> = {}
      for (const r of rows) {
        const c = byCourse[r.course_slug] ?? { total: 0, free: 0 }
        c.total += 1
        if (r.is_free) c.free += 1
        byCourse[r.course_slug] = c
      }
      setCounts(byCourse)
      setMeta(Object.fromEntries(metas.map(m => [m.slug, m])))
      setLoading(false)
    })()
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl leading-none">Courses</h1>
          <p className="text-gray-400 text-xs mt-1">Edit the video curriculum for each course</p>
        </div>
        <Link
          href="/admin/bootstrap"
          className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          Bootstrap from static data →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COURSES.map(c => {
          const count = counts[c.slug] ?? { total: 0, free: 0 }
          const m = meta[c.slug]
          const isExternal = m?.course_type === 'external'
          return (
            <div
              key={c.slug}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                      {c.fromLevel} → {c.toLevel}
                    </span>
                    {isExternal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wide">
                        <Globe size={9} /> External
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                        Native
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-gray-900 text-base leading-snug" dir="rtl">{c.title}</h2>
                  <p className="text-gray-400 text-xs mt-1" dir="rtl">{c.subtitle}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isExternal ? 'bg-rose-50' : 'bg-emerald-50'
                }`}>
                  {isExternal ? <Globe size={18} className="text-rose-600" /> : <Video size={18} className="text-emerald-600" />}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold pt-3 border-t border-gray-100">
                {loading ? (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Loader2 size={12} className="animate-spin" /> Loading…
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Play size={12} /> {count.total} lessons
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Play size={12} /> {count.free} free
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Lock size={12} /> {count.total - count.free} locked
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/admin/courses/${c.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Manage lessons
                </Link>
                <Link
                  href={`/courses/${c.slug}/watch`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <ExternalLink size={12} /> Preview
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
