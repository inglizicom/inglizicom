'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ContentItem {
  id: string
  sentence: string
  arabic_sentence: string | null
  video_url: string | null
  options: string[]
  correct_index: number
  level: string
  lesson: string
  created_at: string
}

export default function ListenPage() {
  const [items,        setItems]        = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState<number | null>(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [loading,      setLoading]      = useState(true)

  const current = items[currentIndex]
  const isLast  = currentIndex === items.length - 1

  // ── Fetch all published items ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('FETCH ERROR:', error)
        setLoading(false)
        return
      }

      console.log('CONTENT:', data)
      setItems(data ?? [])
      setLoading(false)
    }

    fetchData()
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleSelect(i: number) {
    if (submitted) return
    setSelected(i)
  }

  function handleSubmit() {
    if (selected === null) return
    setSubmitted(true)
  }

  function handleNext() {
    setSelected(null)
    setSubmitted(false)
    setCurrentIndex(prev => prev + 1)
  }

  function handleRestart() {
    setSelected(null)
    setSubmitted(false)
    setCurrentIndex(0)
  }

  // ── Option style ───────────────────────────────────────────────────────────
  function optionStyle(i: number): string {
    const base = 'w-full p-4 rounded-xl border text-right text-white font-medium transition-all duration-150 '
    if (!submitted) {
      return base + (selected === i
        ? 'border-blue-500 bg-blue-500/20'
        : 'border-white/10 bg-white/5 hover:bg-white/10')
    }
    if (i === current.correct_index) return base + 'border-green-500 bg-green-500/20 text-green-300'
    if (i === selected)              return base + 'border-red-500 bg-red-500/20 text-red-300'
    return base + 'border-white/5 bg-white/5 opacity-40'
  }

  // ── Screens ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/40 text-sm animate-pulse">جاري التحميل...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/40 text-sm">لا يوجد محتوى منشور</p>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0c1120' }}>
        <div className="text-5xl">🎉</div>
        <h2 className="text-white text-2xl font-bold">أنهيت جميع الدروس!</h2>
        <p className="text-white/40 text-sm">{items.length} سؤال مكتمل</p>
        <button
          onClick={handleRestart}
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
        >
          ابدأ من جديد
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0c1120' }}>
      <div className="max-w-3xl mx-auto">

        {/* ── Progress bar ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / items.length) * 100}%` }}
            />
          </div>
          <span className="text-white/30 text-xs font-medium shrink-0">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* ── Level + Lesson badges ── */}
        <div className="flex gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/8 text-white/40 font-medium">
            {current.level}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/8 text-white/40 font-medium">
            {current.lesson}
          </span>
        </div>

        {/* ── Video ── */}
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
          {current.video_url ? (
            <video
              key={current.video_url}
              controls
              src={current.video_url}
              className="w-full"
              preload="auto"
              playsInline
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center">
              <p className="text-white/20 text-sm">لا يوجد فيديو</p>
            </div>
          )}
        </div>

        {/* ── Question ── */}
        <h2 className="text-white text-lg font-bold mb-4 text-right">
          اختر الجملة الصحيحة
        </h2>

        {/* ── Options ── */}
        <div className="space-y-3 mb-6" dir="ltr">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={optionStyle(i)}
              disabled={submitted}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* ── Feedback ── */}
        {submitted && (
          <div className={`p-4 rounded-xl mb-4 text-center font-bold text-sm ${
            selected === current.correct_index
              ? 'bg-green-500/15 text-green-300 border border-green-500/30'
              : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}>
            {selected === current.correct_index
              ? '✅ إجابة صحيحة!'
              : `❌ الإجابة الصحيحة: ${current.options[current.correct_index]}`}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-3">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              تأكيد الإجابة
            </button>
          ) : (
            <button
              onClick={isLast ? handleRestart : handleNext}
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 transition-all active:scale-[0.98]"
            >
              {isLast ? '🔄 ابدأ من جديد' : 'التالي ←'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
