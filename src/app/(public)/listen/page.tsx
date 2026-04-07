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
  const progress = items.length > 0 ? ((currentIndex) / items.length) * 100 : 0

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: true })

      if (error) { console.error('FETCH ERROR:', error); setLoading(false); return }
      console.log('CONTENT:', data)
      setItems(data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

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

  function optionClass(i: number): string {
    const base = 'w-full p-4 rounded-xl border text-left font-medium text-sm transition-all duration-150 active:scale-[0.98] '
    if (!submitted) {
      return base + (selected === i
        ? 'border-blue-500 bg-blue-500/20 text-white'
        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20')
    }
    if (i === current.correct_index) return base + 'border-green-500 bg-green-500/15 text-green-300'
    if (i === selected)              return base + 'border-red-500 bg-red-500/15 text-red-300'
    return base + 'border-white/5 bg-white/3 text-white/25'
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/30 text-sm animate-pulse">جاري التحميل...</p>
      </div>
    )
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/30 text-sm">لا يوجد محتوى منشور</p>
      </div>
    )
  }

  // ── Finished ───────────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: '#0c1120' }}>
        <div className="text-6xl">🎉</div>
        <h2 className="text-white text-2xl font-bold">أنهيت جميع الدروس!</h2>
        <p className="text-white/30 text-sm">{items.length} سؤال مكتمل</p>
        <button
          onClick={handleRestart}
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
        >
          ابدأ من جديد
        </button>
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}
    >
      {/* ── Top bar ── */}
      <div className="shrink-0 px-4 pt-6 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/30 text-xs font-medium shrink-0">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/8 text-white/40">{current.level}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/8 text-white/40">{current.lesson}</span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="flex-1 flex items-center px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">

          {/* ── LEFT: Video ── */}
          <div className="flex flex-col">
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              {current.video_url ? (
                <video
                  key={current.video_url}
                  controls
                  src={current.video_url}
                  className="w-full h-[240px] md:h-[360px] object-contain"
                  preload="auto"
                  playsInline
                />
              ) : (
                <div className="w-full h-[240px] md:h-[360px] flex items-center justify-center">
                  <p className="text-white/20 text-sm">لا يوجد فيديو</p>
                </div>
              )}
            </div>

            {current.arabic_sentence && (
              <p className="mt-3 text-white/40 text-sm text-center" dir="rtl">
                {current.arabic_sentence}
              </p>
            )}
          </div>

          {/* ── RIGHT: Quiz ── */}
          <div className="flex flex-col justify-between gap-4">

            <div>
              <h2 className="text-white text-lg font-bold mb-5" dir="rtl">
                اختر الجملة الصحيحة
              </h2>

              <div className="space-y-3">
                {current.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={submitted}
                    className={optionClass(i)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Feedback */}
              {submitted && (
                <div className={`p-3.5 rounded-xl text-center text-sm font-bold border ${
                  selected === current.correct_index
                    ? 'bg-green-500/12 text-green-300 border-green-500/25'
                    : 'bg-red-500/12 text-red-300 border-red-500/25'
                }`}>
                  {selected === current.correct_index
                    ? '✅ إجابة صحيحة!'
                    : `❌ الصحيح: ${current.options[current.correct_index]}`}
                </div>
              )}

              {/* Action button */}
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  تأكيد الإجابة
                </button>
              ) : (
                <button
                  onClick={isLast ? handleRestart : handleNext}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-[0.98]"
                >
                  {isLast ? '🔄 ابدأ من جديد' : 'التالي ←'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
