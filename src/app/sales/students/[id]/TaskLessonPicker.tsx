'use client'

import { useEffect, useState } from 'react'
import { fetchLessonOptions, type LessonOption } from '@/lib/student-portal'
import type { LmsCourse } from '@/lib/lms'

/**
 * Optional "this task belongs to lesson X" for a staff-assigned task. The task's
 * course is then taken from the lesson in the database, so it cannot drift.
 */
export default function TaskLessonPicker({ courses, value, onChange }: {
  courses: LmsCourse[]
  value: string | null
  onChange: (lessonId: string | null) => void
}) {
  const [courseId, setCourseId] = useState('')
  const [lessons, setLessons] = useState<LessonOption[]>([])

  useEffect(() => {
    if (!courseId) { setLessons([]); return }
    let alive = true
    fetchLessonOptions(courseId).then(l => { if (alive) setLessons(l) })
    return () => { alive = false }
  }, [courseId])

  const SEL = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white'
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <select value={courseId} onChange={e => { setCourseId(e.target.value); onChange(null) }} className={SEL} aria-label="الدورة">
        <option value="">بدون ربط بدرس (اختياري)</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} disabled={!courseId} className={SEL} aria-label="الدرس">
        <option value="">{courseId ? 'اختر الدرس' : '—'}</option>
        {lessons.map(l => (
          <option key={l.lesson_id} value={l.lesson_id}>الوحدة {l.module_order} · {l.module_title} — {l.lesson_order}. {l.lesson_title}</option>
        ))}
      </select>
    </div>
  )
}
