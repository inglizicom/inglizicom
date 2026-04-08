'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = 'A1' | 'A2' | 'B1' | 'B2'

interface ContentItem {
  id:              string
  sentence:        string
  arabic_sentence: string | null
  video_url:       string | null
  options:         string[]
  correct_index:   number
  level:           Level
  lesson:          string
  created_at:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2']

const LEVEL_STYLE: Record<Level, { active: string; inactive: string }> = {
  A1: { active: 'bg-emerald-500 text-white',  inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  A2: { active: 'bg-amber-500  text-white',   inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  B1: { active: 'bg-violet-500 text-white',   inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  B2: { active: 'bg-rose-500   text-white',   inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
}

// ─── Web Audio chime ──────────────────────────────────────────────────────────

function playChime(correct: boolean) {
  try {
    const ctx   = new AudioContext()
    const notes = correct ? [523, 659, 784] : [784, 620, 440]
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type            = 'sine'
      const t = ctx.currentTime + i * 0.14
      gain.gain.setValueAtTime(0.18, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch { /* AudioContext blocked — silent */ }
}

// ─── Helper: resolve public URL ───────────────────────────────────────────────

function resolveVideoUrl(raw: string): string {
  // Already a full https:// URL (stored by admin upload) — use directly
  if (raw.startsWith('http')) return raw
  // Filename/path only — build public URL from Supabase Storage
  const { data } = supabase.storage.from('videos').getPublicUrl(raw)
  return data.publicUrl
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ListenPage() {
  const [level,        setLevel]        = useState<Level>('A1')
  const [items,        setItems]        = useState<ContentItem[]>([])
  const [index,        setIndex]        = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [hasPlayed,    setHasPlayed]    = useState(false)   // true after first onEnded
  const [showOptions,  setShowOptions]  = useState(false)   // true after "أظهر الأسئلة"
  const [selected,     setSelected]     = useState<number | null>(null)
  const [showModal,    setShowModal]    = useState(false)
  const [score,        setScore]        = useState({ correct: 0, wrong: 0 })

  const videoRef  = useRef<HTMLVideoElement>(null)
  const current   = items[index] as ContentItem | undefined
  const isLast    = index === items.length - 1

  // Build public URL — log both raw and resolved values for debugging
  const rawUrl    = current?.video_url ?? null
  const publicUrl = rawUrl ? resolveVideoUrl(rawUrl) : ''
  if (rawUrl)    console.log('RAW video_url:', rawUrl)
  if (publicUrl) console.log('PUBLIC URL:', publicUrl)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLevel = useCallback(async (lv: Level) => {
    setLoading(true)
    setIndex(0)
    setHasPlayed(false)
    setShowOptions(false)
    setSelected(null)
    setShowModal(false)
    setScore({ correct: 0, wrong: 0 })

    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status', 'published')
      .eq('level',  lv)
      .order('created_at', { ascending: true })

    if (error) { console.error('FETCH ERROR:', error); setLoading(false); return }
    console.log('CONTENT:', data)
    setItems((data ?? []) as ContentItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLevel(level) }, [level, fetchLevel])

  // ── Reset state when moving to next question ──────────────────────────────
  function advanceTo(nextIndex: number) {
    setIndex(nextIndex)
    setHasPlayed(false)
    setShowOptions(false)
    setSelected(null)
    setShowModal(false)
    // Video remounts via key={current.id}, autoPlay handles playback
  }

  // ── Video ended ───────────────────────────────────────────────────────────
  function handleVideoEnded() {
    setHasPlayed(true)
  }

  // ── "Show questions" button ───────────────────────────────────────────────
  function handleShowOptions() {
    setShowOptions(true)
  }

  // ── Answer selected ───────────────────────────────────────────────────────
  function handleSelect(i: number) {
    if (selected !== null || !current) return
    const ok = i === current.correct_index
    playChime(ok)
    setSelected(i)
    setScore(s => ok ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    setShowModal(true)
  }

  // ── Next ──────────────────────────────────────────────────────────────────
  function handleNext() {
    if (isLast) {
      // Restart
      fetchLevel(level)
    } else {
      advanceTo(index + 1)
    }
  }

  // ── Replay from modal ─────────────────────────────────────────────────────
  function handleReplayFromModal() {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
      <p className="text-white/30 text-sm animate-pulse">جاري التحميل...</p>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // EMPTY
  // ─────────────────────────────────────────────────────────────────────────
  if (!loading && (items.length === 0 || !current)) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: '#0c1120' }}>
      <p className="text-white/30 text-sm">لا يوجد محتوى لمستوى {level}</p>
      <div className="flex gap-2">
        {LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${LEVEL_STYLE[l][l === level ? 'active' : 'inactive']}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )

  if (!current) return null

  const isCorrect = selected === current.correct_index

  // ─────────────────────────────────────────────────────────────────────────
  // QUIZ PAGE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}>

      {/* ── Header ── */}
      <header className="shrink-0 px-4 pt-5 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Level tabs */}
          <div className="flex gap-1.5">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${LEVEL_STYLE[l][l === level ? 'active' : 'inactive']}`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-xs font-medium">✅ {score.correct}</span>
            <span className="text-red-400   text-xs font-medium">❌ {score.wrong}</span>
            <span className="text-white/25  text-xs">{index + 1} / {items.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full bg-white/6 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${items.length > 0 ? (score.correct / items.length) * 100 : 0}%` }} />
          <div className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${items.length > 0 ? (score.wrong / items.length) * 100 : 0}%` }} />
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className="flex-1 flex items-center px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">

          {/* ── LEFT: Video ── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              {publicUrl ? (
                <video
                  ref={videoRef}
                  key={current.id}
                  src={publicUrl}
                  controls
                  autoPlay
                  playsInline
                  onEnded={handleVideoEnded}
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center">
                  <p className="text-white/20 text-sm">لا يوجد فيديو</p>
                </div>
              )}
            </div>

            {/* Show questions button */}
            <button
              onClick={handleShowOptions}
              disabled={!hasPlayed || showOptions}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500"
            >
              {showOptions ? '✅ الأسئلة ظاهرة' : hasPlayed ? 'أظهر الأسئلة' : '🎧 استمع أولاً...'}
            </button>
          </div>

          {/* ── RIGHT: Options ── */}
          <div className="flex flex-col justify-center gap-3">
            {!showOptions ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30 select-none">
                <p className="text-white/50 text-sm text-center" dir="rtl">
                  شاهد الفيديو ثم اضغط &quot;أظهر الأسئلة&quot;
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-white font-bold text-base mb-1" dir="rtl">
                  اختر الجملة الصحيحة:
                </h2>
                {current.options.map((opt, i) => {
                  const base = 'w-full p-4 rounded-xl border text-left font-medium text-sm transition-all duration-150 active:scale-[0.98] '
                  let cls    = base
                  if (selected === null) {
                    cls += 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                  } else if (i === current.correct_index) {
                    cls += 'border-green-500 bg-green-500/15 text-green-300'
                  } else if (i === selected) {
                    cls += 'border-red-500 bg-red-500/15 text-red-300'
                  } else {
                    cls += 'border-white/5 bg-white/3 text-white/20 opacity-40'
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
                      {opt}
                    </button>
                  )
                })}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Answer Modal ── */}
      {showModal && selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141b2d] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-7 flex flex-col items-center gap-5 text-center">

            {/* Result icon */}
            <div className={`text-6xl ${isCorrect ? '' : ''}`}>
              {isCorrect ? '✅' : '❌'}
            </div>

            {/* Feedback label */}
            <p className={`text-lg font-black ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
            </p>

            {/* English sentence */}
            <div className="bg-white/5 rounded-xl px-5 py-4 w-full">
              <p className="text-white font-bold text-base leading-relaxed">
                {current.sentence}
              </p>
              {current.arabic_sentence && (
                <p className="mt-2 text-white/60 text-base leading-relaxed" dir="rtl">
                  {current.arabic_sentence}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleReplayFromModal}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white/80 bg-white/8 hover:bg-white/15 transition-all active:scale-95"
              >
                🔁 استمع مجدداً
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-95"
              >
                {isLast ? '🔄 البداية' : 'التالي ←'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
