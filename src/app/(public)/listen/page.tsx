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
  level:           string
  lesson:          string
  created_at:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2']
const MAX_REPLAYS     = 3

const LEVEL_STYLE: Record<Level, { active: string; inactive: string }> = {
  A1: { active: 'bg-emerald-500 text-white', inactive: 'bg-white/8 text-white/50 hover:bg-white/12' },
  A2: { active: 'bg-amber-500 text-white',   inactive: 'bg-white/8 text-white/50 hover:bg-white/12' },
  B1: { active: 'bg-violet-500 text-white',  inactive: 'bg-white/8 text-white/50 hover:bg-white/12' },
  B2: { active: 'bg-rose-500 text-white',    inactive: 'bg-white/8 text-white/50 hover:bg-white/12' },
}

const CHUNK_COLORS = [
  { text: 'text-blue-300',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30'   },
  { text: 'text-green-300',  bg: 'bg-green-500/15',  border: 'border-green-500/30'  },
  { text: 'text-purple-300', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { text: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveVideoUrl(raw: string | null): string {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  const { data } = supabase.storage.from('videos').getPublicUrl(raw)
  return data.publicUrl
}

function playChime(correct: boolean) {
  try {
    const ctx   = new AudioContext()
    const notes = correct ? [523, 659, 784] : [784, 620, 440]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      const t = ctx.currentTime + i * 0.14
      gain.gain.setValueAtTime(0.18, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t); osc.stop(t + 0.3)
    })
  } catch { /* blocked */ }
}

/** Split a sentence into 2–4 chunks of roughly equal word groups */
function chunkSentence(text: string): string[] {
  const words = text.trim().split(/\s+/)
  if (words.length <= 3) return [text]
  const n     = words.length <= 6 ? 2 : words.length <= 10 ? 3 : 4
  const size  = Math.ceil(words.length / n)
  const out: string[] = []
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(' '))
  return out
}

// ─── Color Chunks component ───────────────────────────────────────────────────

function ColorChunks({ sentence, arabic }: { sentence: string; arabic: string | null }) {
  const enChunks = chunkSentence(sentence)
  const arChunks = arabic ? chunkSentence(arabic) : []

  return (
    <div className="w-full space-y-3">
      {/* English */}
      <div className="flex flex-wrap gap-2 justify-center">
        {enChunks.map((chunk, i) => {
          const c = CHUNK_COLORS[i % CHUNK_COLORS.length]
          return (
            <span key={i} className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>
              {chunk}
            </span>
          )
        })}
      </div>
      {/* Arabic */}
      {arChunks.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {arChunks.map((chunk, i) => {
            const c = CHUNK_COLORS[i % CHUNK_COLORS.length]
            return (
              <span key={i} className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>
                {chunk}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ListenPage() {
  const [level,       setLevel]       = useState<Level>('A1')
  const [allItems,    setAllItems]    = useState<ContentItem[]>([])   // full fetch, all levels
  const [index,       setIndex]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [replayCount, setReplayCount] = useState(0)   // how many times video has been played
  const [unlocked,    setUnlocked]    = useState(false) // true after first play-through
  const [showOptions, setShowOptions] = useState(false)
  const [selected,    setSelected]    = useState<number | null>(null)
  const [showModal,   setShowModal]   = useState(false)
  const [score,       setScore]       = useState({ correct: 0, wrong: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)

  // Filter current level's items client-side — no extra fetch on level change
  const items   = allItems.filter(it => it.level === level)
  const current = items[index] as ContentItem | undefined
  const isLast  = index === items.length - 1
  const publicUrl = resolveVideoUrl(current?.video_url ?? null)

  console.log('FETCHED ITEMS:', allItems.length, '| level items:', items.length)
  if (current) {
    console.log('RAW video_url:', current.video_url)
    console.log('PUBLIC URL:', publicUrl)
  }

  // ── Fetch ALL published items once ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: true })

    if (error) { console.error('FETCH ERROR:', error); setLoading(false); return }
    console.log('FETCHED ITEMS:', data)
    setAllItems((data ?? []) as ContentItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Reset quiz state when level or index changes ──────────────────────────
  useEffect(() => {
    setReplayCount(0)
    setUnlocked(false)
    setShowOptions(false)
    setSelected(null)
    setShowModal(false)
  }, [level, index])

  // Reset index when level changes
  useEffect(() => { setIndex(0) }, [level])

  // ── Video ended ───────────────────────────────────────────────────────────
  function handleVideoEnded() {
    setReplayCount(c => c + 1)
    setUnlocked(true)
  }

  // ── Manual unlock after 3s (fallback if video never ends / autoplay blocked) ─
  useEffect(() => {
    if (unlocked) return
    const t = setTimeout(() => setUnlocked(true), 4000)
    return () => clearTimeout(t)
  }, [current?.id, unlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show questions ────────────────────────────────────────────────────────
  function handleShowOptions() { setShowOptions(true) }

  // ── Answer ────────────────────────────────────────────────────────────────
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
      setIndex(0)
      setScore({ correct: 0, wrong: 0 })
    } else {
      setIndex(i => i + 1)
    }
  }

  // ── Replay ────────────────────────────────────────────────────────────────
  function handleReplay() {
    if (!videoRef.current || replayCount >= MAX_REPLAYS) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setShowModal(false)
    setShowOptions(false)
    setSelected(null)
  }

  // ── Progress bar segments ─────────────────────────────────────────────────
  function segClass(i: number): string {
    if (i < index)    return 'bg-green-500'
    if (i === index)  return 'bg-indigo-500'
    return 'bg-white/10'
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
      <p className="text-white/30 text-sm animate-pulse">جاري التحميل...</p>
    </div>
  )

  if (!loading && items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4" style={{ background: '#0c1120' }}>
      <p className="text-5xl">📭</p>
      <p className="text-white/40 text-sm" dir="rtl">لا يوجد محتوى منشور لمستوى {level}</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${LEVEL_STYLE[l][l === level ? 'active' : 'inactive']}`}
          >{l}</button>
        ))}
      </div>
    </div>
  )

  if (!current) return null

  const isCorrect = selected === current.correct_index

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}>

      {/* ── Header ── */}
      <header className="shrink-0 px-4 pt-5 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex gap-1.5">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${LEVEL_STYLE[l][l === level ? 'active' : 'inactive']}`}
              >{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-xs font-bold">✅ {score.correct}</span>
            <span className="text-red-400   text-xs font-bold">❌ {score.wrong}</span>
            <span className="text-white/25  text-xs">{index + 1} / {items.length}</span>
          </div>
        </div>

        {/* Segment progress bar */}
        <div className="flex gap-1">
          {items.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${segClass(i)}`} />
          ))}
        </div>
      </header>

      {/* ── Grid ── */}
      <div className="flex-1 flex items-center px-4 pb-8">
        <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">

          {/* ── LEFT: Video + controls ── */}
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
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onError={(e) => console.error('VIDEO ERROR:', e, publicUrl)}
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-white/3">
                  <p className="text-white/20 text-sm">لا يوجد فيديو</p>
                </div>
              )}
            </div>

            {/* Replay counter */}
            <div className="flex items-center gap-2 px-1">
              {Array.from({ length: MAX_REPLAYS }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < replayCount ? 'bg-indigo-500' : 'bg-white/10'}`} />
              ))}
              <span className="text-white/25 text-xs shrink-0">
                {replayCount}/{MAX_REPLAYS} مرة
              </span>
            </div>

            {/* Show questions button */}
            <button
              onClick={handleShowOptions}
              disabled={!unlocked || showOptions}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500"
              dir="rtl"
            >
              {showOptions ? '✅ الأسئلة ظاهرة' : unlocked ? '📋 أظهر الأسئلة' : '🎧 استمع أولاً...'}
            </button>
          </div>

          {/* ── RIGHT: Quiz ── */}
          <div dir="rtl" className="flex flex-col justify-center gap-3">
            {!showOptions ? (
              <p className="text-white/20 text-sm text-center opacity-60 select-none">
                شاهد الفيديو ثم اضغط &quot;أظهر الأسئلة&quot;
              </p>
            ) : (
              <>
                <h2 className="text-white font-bold text-base mb-1">اختر الجملة الصحيحة:</h2>
                <div className="flex flex-col gap-3">
                  {current.options.map((opt, i) => {
                    let cls = 'w-full p-4 rounded-xl border font-medium text-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-default text-left '
                    if (selected === null)             cls += 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/25'
                    else if (i === current.correct_index) cls += 'border-green-500 bg-green-500/15 text-green-300'
                    else if (i === selected)           cls += 'border-red-500 bg-red-500/15 text-red-300'
                    else                               cls += 'border-white/5 bg-transparent text-white/20 opacity-40'
                    return (
                      <button key={i} dir="ltr" onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Answer Modal ── */}
      {showModal && selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141b2d] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col items-center gap-5 text-center">

            <div className="text-5xl">{isCorrect ? '✅' : '❌'}</div>

            <p className={`text-lg font-black ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
            </p>

            {/* Color-coded chunks */}
            <ColorChunks sentence={current.sentence} arabic={current.arabic_sentence} />

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleReplay}
                disabled={replayCount >= MAX_REPLAYS}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white/70 bg-white/8 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                🔁 استمع مجدداً ({MAX_REPLAYS - replayCount} متبقي)
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
