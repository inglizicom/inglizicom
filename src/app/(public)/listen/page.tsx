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
  video_name:      string | null
  options:         string[]
  correct_index:   number
  level:           Level
  lesson:          string
  created_at:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2']
const MAX_LISTENS     = 2

const LEVEL_META: Record<Level, { label: string; active: string; inactive: string }> = {
  A1: { label: 'A1 مبتدئ',       active: 'bg-emerald-500 text-white', inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  A2: { label: 'A2 أساسي',       active: 'bg-amber-500  text-white', inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  B1: { label: 'B1 متوسط',       active: 'bg-violet-500 text-white', inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
  B2: { label: 'B2 متقدم',       active: 'bg-rose-500   text-white', inactive: 'bg-white/5 text-white/50 hover:bg-white/10' },
}

const CHIP_COLORS = [
  'border-blue-500/40   bg-blue-500/15   text-blue-300',
  'border-green-500/40  bg-green-500/15  text-green-300',
  'border-purple-500/40 bg-purple-500/15 text-purple-300',
  'border-orange-500/40 bg-orange-500/15 text-orange-300',
  'border-pink-500/40   bg-pink-500/15   text-pink-300',
  'border-teal-500/40   bg-teal-500/15   text-teal-300',
  'border-yellow-500/40 bg-yellow-500/15 text-yellow-300',
  'border-cyan-500/40   bg-cyan-500/15   text-cyan-300',
]

// ─── Web Audio chime ──────────────────────────────────────────────────────────

function playChime(correct: boolean) {
  try {
    const ctx   = new AudioContext()
    const notes = correct ? [523, 659, 784] : [784, 659, 523]
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type            = 'sine'
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.13)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.25)
      osc.start(ctx.currentTime + i * 0.13)
      osc.stop(ctx.currentTime  + i * 0.13 + 0.28)
    })
  } catch { /* AudioContext blocked — silent fail */ }
}

// ─── Word chips ───────────────────────────────────────────────────────────────

function buildChips(en: string, ar: string | null): { en: string; ar: string }[] {
  const enWords = en.trim().split(/\s+/).slice(0, 8)
  const arWords = ar ? ar.trim().split(/\s+/) : []
  return enWords.map((word, i) => ({ en: word, ar: arWords[i] ?? '' }))
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ListenPage() {
  const [level,        setLevel]        = useState<Level>('A1')
  const [items,        setItems]        = useState<ContentItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState<number | null>(null)
  const [submitted,    setSubmitted]    = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [score,        setScore]        = useState({ correct: 0, wrong: 0 })
  const [showResults,  setShowResults]  = useState(false)
  const [listenCount,  setListenCount]  = useState(0)

  const videoRef     = useRef<HTMLVideoElement>(null)
  const listenRef    = useRef(0)   // shadow ref so onEnded closure sees fresh value

  const current  = items[currentIndex] as ContentItem | undefined
  const isLast   = currentIndex === items.length - 1
  const locked   = listenRef.current < 1   // questions locked until 1 full listen

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLevel = useCallback(async (lv: Level) => {
    setLoading(true)
    setCurrentIndex(0)
    setSelected(null)
    setSubmitted(false)
    setScore({ correct: 0, wrong: 0 })
    setShowResults(false)
    setListenCount(0)
    listenRef.current = 0

    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status',  'published')
      .eq('level',   lv)
      .order('created_at', { ascending: true })

    if (error) { console.error('FETCH ERROR:', error); setLoading(false); return }
    console.log('CONTENT:', data)
    setItems((data ?? []) as ContentItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLevel(level) }, [level, fetchLevel])

  // ── Reset listen counter when clip changes ────────────────────────────────
  useEffect(() => {
    setListenCount(0)
    listenRef.current = 0
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [currentIndex, items])

  // ── Video ended ───────────────────────────────────────────────────────────
  function handleVideoEnded() {
    listenRef.current += 1
    setListenCount(listenRef.current)
  }

  // ── Answer ────────────────────────────────────────────────────────────────
  function handleSelect(i: number) {
    if (submitted || locked) return
    setSelected(i)
  }

  function handleSubmit() {
    if (selected === null || !current) return
    const ok = selected === current.correct_index
    playChime(ok)
    setScore(s => ok
      ? { ...s, correct: s.correct + 1 }
      : { ...s, wrong:   s.wrong   + 1 })
    setSubmitted(true)
  }

  function handleNext() {
    if (isLast) { setShowResults(true); return }
    setSelected(null)
    setSubmitted(false)
    setCurrentIndex(i => i + 1)
  }

  function handleRestart() {
    fetchLevel(level)
  }

  // ── Option style ──────────────────────────────────────────────────────────
  function optionClass(i: number): string {
    const base = 'w-full p-4 rounded-xl border text-left font-medium text-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed '
    if (!submitted) {
      return base + (selected === i
        ? 'border-blue-500 bg-blue-500/20 text-white'
        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20')
    }
    if (!current) return base
    if (i === current.correct_index) return base + 'border-green-500 bg-green-500/15 text-green-300'
    if (i === selected)              return base + 'border-red-500   bg-red-500/15   text-red-300'
    return base + 'border-white/5 bg-white/3 text-white/25 opacity-40'
  }

  // ── Progress bar (correct/wrong) ──────────────────────────────────────────
  const answered  = score.correct + score.wrong
  const pctRight  = items.length > 0 ? (score.correct / items.length) * 100 : 0
  const pctWrong  = items.length > 0 ? (score.wrong   / items.length) * 100 : 0

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
      <p className="text-white/30 text-sm animate-pulse">جاري التحميل...</p>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS OVERLAY
  // ─────────────────────────────────────────────────────────────────────────
  if (showResults) {
    const pct = items.length > 0 ? Math.round((score.correct / items.length) * 100) : 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#0c1120' }}>
        <div className="text-6xl">{pct >= 70 ? '🏆' : '📚'}</div>
        <h2 className="text-white text-3xl font-black">{pct}%</h2>
        <p className="text-white/40 text-sm">{score.correct} صحيح من {items.length}</p>

        <div className="flex gap-4 mt-1">
          <span className="text-green-400 font-bold text-sm">✅ {score.correct}</span>
          <span className="text-red-400   font-bold text-sm">❌ {score.wrong}</span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRestart}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
          >
            حاول مجدداً
          </button>
          {LEVELS.filter(l => l !== level).slice(0, 1).map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className="bg-white/8 hover:bg-white/15 text-white/70 font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
            >
              مستوى {l}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMPTY
  // ─────────────────────────────────────────────────────────────────────────
  if (items.length === 0 || !current) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0c1120' }}>
      <p className="text-white/30 text-sm">لا يوجد محتوى لمستوى {level}</p>
      <div className="flex gap-2 mt-2">
        {LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${l === level ? LEVEL_META[l].active : LEVEL_META[l].inactive}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )

  const chips = buildChips(current.sentence, current.arabic_sentence)

  // ─────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}>

      {/* ── Header ── */}
      <header className="shrink-0 px-4 pt-5 pb-3 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Level selector */}
          <div className="flex gap-1.5">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${l === level ? LEVEL_META[l].active : LEVEL_META[l].inactive}`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Position */}
          <span className="text-white/25 text-xs font-medium">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Progress bar — green correct, red wrong, white remaining */}
        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${pctRight}%` }} />
          <div className="h-full bg-red-500   transition-all duration-500" style={{ width: `${pctWrong}%` }} />
        </div>
        {answered > 0 && (
          <div className="flex gap-3 mt-1.5">
            <span className="text-green-400 text-xs font-medium">✅ {score.correct}</span>
            <span className="text-red-400   text-xs font-medium">❌ {score.wrong}</span>
          </div>
        )}
      </header>

      {/* ── Main grid ── */}
      <div className="flex-1 flex items-stretch px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">

          {/* ── LEFT: Video + chips ── */}
          <div className="flex flex-col gap-3">

            {/* Video */}
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
              {current.video_url ? (
                <video
                  ref={videoRef}
                  key={current.id}
                  controls
                  src={current.video_url}
                  onEnded={handleVideoEnded}
                  preload="auto"
                  playsInline
                  className="w-full h-[220px] md:h-[340px] object-contain"
                />
              ) : (
                <div className="w-full h-[220px] md:h-[340px] flex items-center justify-center">
                  <p className="text-white/20 text-sm">لا يوجد فيديو</p>
                </div>
              )}
            </div>

            {/* Listen counter */}
            <div className="flex items-center gap-2 px-1">
              {Array.from({ length: MAX_LISTENS }).map((_, i) => (
                <div key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < listenCount ? 'bg-indigo-500' : 'bg-white/10'}`}
                />
              ))}
              <span className="text-white/25 text-xs shrink-0">
                {listenCount >= MAX_LISTENS ? 'انتهى الاستماع' : `${listenCount}/${MAX_LISTENS} استماع`}
              </span>
            </div>

            {/* Word chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {chips.map((chip, i) => (
                  <div key={i} className={`border rounded-xl px-3 py-1.5 text-center ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>
                    <p className="text-xs font-bold leading-tight">{chip.en}</p>
                    {chip.ar && <p className="text-xs opacity-70 leading-tight mt-0.5" dir="rtl">{chip.ar}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Quiz ── */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              {/* Lock hint */}
              {locked && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs text-center font-medium" dir="rtl">
                  🎧 استمع للفيديو أولاً ثم اختر الإجابة
                </div>
              )}

              <h2 className="text-white text-lg font-bold mb-4" dir="rtl">
                اختر الجملة الصحيحة
              </h2>

              <div className="space-y-3">
                {current.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={submitted || locked}
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
                    : 'bg-red-500/12   text-red-300   border-red-500/25'
                }`} dir="rtl">
                  {selected === current.correct_index
                    ? '✅ إجابة صحيحة!'
                    : `❌ الصحيح: ${current.options[current.correct_index]}`}
                </div>
              )}

              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null || locked}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {locked ? '🎧 استمع أولاً' : 'تأكيد الإجابة'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-[0.98]"
                >
                  {isLast ? '🏁 عرض النتائج' : 'التالي ←'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
