'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import {
  Plus, Trash2, Save, Loader2, RefreshCw, ExternalLink, ArrowLeft,
  Play, Lock, AlertCircle, Check,
} from 'lucide-react'
import { COURSES } from '@/data/courses'
import {
  fetchCourseLessons,
  upsertCourseLesson,
  deleteCourseLesson,
  type CourseLessonRow,
} from '@/lib/course-lessons-db'

interface Draft extends Partial<CourseLessonRow> {
  // negative id = new, not yet persisted
  localKey: string
  course_slug: string
  section_title: string
  section_order: number
  lesson_title: string
  duration: string
  youtube_id: string
  is_free: boolean
  sort_order: number
  dirty?: boolean
}

function toDraft(r: CourseLessonRow): Draft {
  return {
    localKey: r.id,
    id: r.id,
    course_slug: r.course_slug,
    section_title: r.section_title,
    section_order: r.section_order,
    lesson_title: r.lesson_title,
    duration: r.duration,
    youtube_id: r.youtube_id,
    is_free: r.is_free,
    sort_order: r.sort_order,
  }
}

export default function CourseLessonsAdminPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const course = COURSES.find(c => c.slug === slug)
  if (!course) notFound()

  const [rows, setRows] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const fresh = await fetchCourseLessons(slug)
      setRows(fresh.map(toDraft))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [slug])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  function updateRow(key: string, patch: Partial<Draft>) {
    setRows(prev => prev.map(r => r.localKey === key ? { ...r, ...patch, dirty: true } : r))
  }

  function addRow() {
    const existingSections = Array.from(
      new Set(rows.map(r => `${r.section_order}|${r.section_title}`))
    )
    const lastSection = rows[rows.length - 1]
    const sectionOrder = lastSection ? lastSection.section_order : 0
    const sectionTitle = lastSection ? lastSection.section_title : 'الوحدة 1'
    const sortOrder = Math.max(0, ...rows.filter(r => r.section_order === sectionOrder).map(r => r.sort_order + 1))

    const draft: Draft = {
      localKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      course_slug: slug,
      section_title: sectionTitle,
      section_order: sectionOrder,
      lesson_title: '',
      duration: '',
      youtube_id: '',
      is_free: false,
      sort_order: sortOrder,
      dirty: true,
    }
    setRows(prev => [...prev, draft])
  }

  async function saveRow(row: Draft) {
    setBusy(row.localKey)
    try {
      const payload: Partial<CourseLessonRow> & { course_slug: string; lesson_title: string } = {
        course_slug: row.course_slug,
        section_title: row.section_title,
        section_order: row.section_order,
        lesson_title: row.lesson_title,
        duration: row.duration,
        youtube_id: row.youtube_id,
        is_free: row.is_free,
        sort_order: row.sort_order,
      }
      if (row.id) payload.id = row.id
      const saved = await upsertCourseLesson(payload)
      setRows(prev => prev.map(r => r.localKey === row.localKey ? { ...toDraft(saved) } : r))
      showToast('Saved ✓')
    } catch (e) {
      showToast('Error: ' + (e instanceof Error ? e.message : 'failed'))
    }
    setBusy(null)
  }

  async function removeRow(row: Draft) {
    if (row.id && !confirm(`Delete lesson "${row.lesson_title || 'Untitled'}"? This cannot be undone.`)) return
    setBusy(row.localKey)
    try {
      if (row.id) await deleteCourseLesson(row.id)
      setRows(prev => prev.filter(r => r.localKey !== row.localKey))
      showToast('Deleted')
    } catch (e) {
      showToast('Error: ' + (e instanceof Error ? e.message : 'failed'))
    }
    setBusy(null)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft size={12} /> Back to courses
          </Link>
          <h1 className="text-gray-900 font-black text-xl leading-none" dir="rtl">
            {course.title}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {course.fromLevel} → {course.toLevel} · slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{slug}</code>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href={`/courses/${slug}/watch`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ExternalLink size={12} /> Preview
          </Link>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} /> New lesson
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p><strong>Sections</strong> are grouped by the <code className="bg-white px-1 rounded">Section title</code> + <code className="bg-white px-1 rounded">Section order</code> pair. Use the same title + order to put lessons in the same section.</p>
          <p><strong>YouTube ID</strong> is the 11-char string from the video URL (e.g. <code className="bg-white px-1 rounded">dQw4w9WgXcQ</code>).</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Loading lessons…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-red-500">
          <AlertCircle size={24} />
          <p className="text-sm font-semibold">{error}</p>
          <button onClick={load} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <Play size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No lessons for this course yet.</p>
          <p className="text-xs mt-3">
            Click <strong>New lesson</strong> above, or import from static data via{' '}
            <Link href="/admin/bootstrap" className="text-indigo-500 hover:underline">/admin/bootstrap</Link>.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map(r => {
            const isBusy = busy === r.localKey
            const isNew = !r.id
            return (
              <div
                key={r.localKey}
                className={`bg-white rounded-2xl border shadow-sm p-4 ${
                  r.dirty ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'
                }`}
              >
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* Section title */}
                  <Field className="col-span-12 md:col-span-4" label="Section title">
                    <input
                      type="text"
                      value={r.section_title}
                      onChange={e => updateRow(r.localKey, { section_title: e.target.value })}
                      placeholder="الوحدة 1 — …"
                      dir="rtl"
                      className="input"
                    />
                  </Field>

                  {/* Section order */}
                  <Field className="col-span-4 md:col-span-1" label="Sec #">
                    <input
                      type="number"
                      value={r.section_order}
                      onChange={e => updateRow(r.localKey, { section_order: Number(e.target.value) })}
                      className="input text-center"
                    />
                  </Field>

                  {/* Sort order */}
                  <Field className="col-span-4 md:col-span-1" label="Sort">
                    <input
                      type="number"
                      value={r.sort_order}
                      onChange={e => updateRow(r.localKey, { sort_order: Number(e.target.value) })}
                      className="input text-center"
                    />
                  </Field>

                  {/* Duration */}
                  <Field className="col-span-4 md:col-span-2" label="Duration">
                    <input
                      type="text"
                      value={r.duration}
                      onChange={e => updateRow(r.localKey, { duration: e.target.value })}
                      placeholder="8:42"
                      className="input"
                    />
                  </Field>

                  {/* Is free */}
                  <Field className="col-span-12 md:col-span-4" label="Access">
                    <button
                      type="button"
                      onClick={() => updateRow(r.localKey, { is_free: !r.is_free })}
                      className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                        r.is_free
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {r.is_free ? <Play size={12} /> : <Lock size={12} />}
                      {r.is_free ? 'Free (plays for everyone)' : 'Locked (WhatsApp CTA)'}
                    </button>
                  </Field>

                  {/* Lesson title */}
                  <Field className="col-span-12 md:col-span-8" label="Lesson title">
                    <input
                      type="text"
                      value={r.lesson_title}
                      onChange={e => updateRow(r.localKey, { lesson_title: e.target.value })}
                      placeholder="عنوان الدرس"
                      dir="rtl"
                      className="input"
                    />
                  </Field>

                  {/* YouTube ID */}
                  <Field className="col-span-12 md:col-span-4" label="YouTube ID">
                    <input
                      type="text"
                      value={r.youtube_id}
                      onChange={e => updateRow(r.localKey, { youtube_id: e.target.value })}
                      placeholder="dQw4w9WgXcQ"
                      className="input font-mono text-xs"
                    />
                  </Field>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-gray-400 font-mono truncate">
                    {isNew ? (
                      <span className="text-amber-600 font-bold uppercase">New — unsaved</span>
                    ) : (
                      <>id: {r.id}</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeRow(r)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <button
                      onClick={() => saveRow(r)}
                      disabled={isBusy || (!r.dirty && !isNew)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-30"
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : r.dirty ? <Save size={12} /> : <Check size={12} />}
                      {isBusy ? 'Saving…' : r.dirty ? 'Save' : 'Saved'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.5rem;
          background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl z-50 ${
          toast.startsWith('Error') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast}
        </div>
      )}
    </main>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
