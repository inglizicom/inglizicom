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
  level:           string
  lesson:          string
  created_at:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS: Level[]  = ['A1', 'A2', 'B1', 'B2']
const MAX_REPLAYS      = 3
const XP_CORRECT       = 10
const XP_WRONG         = 2
const STREAK_KEY       = 'inglizi_streak'
const STREAK_DATE_KEY  = 'inglizi_streak_date'

const LEVEL_META: Record<Level, { emoji: string; ar: string; color: string; active: string; inactive: string }> = {
  A1: { emoji: '🌱', ar: 'مبتدئ', color: '#10b981', active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25', inactive: 'bg-white/6 text-white/50 hover:bg-white/10 border border-white/8' },
  A2: { emoji: '⭐', ar: 'أساسي', color: '#f59e0b', active: 'bg-amber-500  text-white shadow-lg shadow-amber-500/25',   inactive: 'bg-white/6 text-white/50 hover:bg-white/10 border border-white/8' },
  B1: { emoji: '🚀', ar: 'متوسط', color: '#8b5cf6', active: 'bg-violet-500 text-white shadow-lg shadow-violet-500/25',  inactive: 'bg-white/6 text-white/50 hover:bg-white/10 border border-white/8' },
  B2: { emoji: '🔥', ar: 'متقدم', color: '#f43f5e', active: 'bg-rose-500   text-white shadow-lg shadow-rose-500/25',    inactive: 'bg-white/6 text-white/50 hover:bg-white/10 border border-white/8' },
}

const CHUNK_PALETTE = [
  { text: 'text-sky-300',     bg: 'bg-sky-500/15',     border: 'border-sky-500/30'     },
  { text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  { text: 'text-violet-300',  bg: 'bg-violet-500/15',  border: 'border-violet-500/30'  },
  { text: 'text-amber-300',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30'   },
]

const MOTIVATION: Record<number, string> = {
  100: 'رائع! حققت النتيجة الكاملة! 🏆',
  80:  'أداء ممتاز! استمر هكذا 🌟',
  60:  'جيد جداً! التدريب يصنع الفارق 💪',
  0:   'لا بأس، حاول مجدداً! 🎯',
}

function motivationMsg(pct: number): string {
  if (pct === 100)   return MOTIVATION[100]
  if (pct >= 80)     return MOTIVATION[80]
  if (pct >= 60)     return MOTIVATION[60]
  return MOTIVATION[0]
}

// ─── Streak helpers ───────────────────────────────────────────────────────────

function todayISO() { return new Date().toISOString().slice(0, 10) }

function loadStreak(): number {
  if (typeof window === 'undefined') return 0
  const streak = parseInt(localStorage.getItem(STREAK_KEY) ?? '0', 10)
  const last   = localStorage.getItem(STREAK_DATE_KEY) ?? ''
  const today  = todayISO()
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yISO   = yesterday.toISOString().slice(0, 10)
  if (last === today || last === yISO) return streak
  return 0  // streak broken
}

function markStreakToday(current: number): number {
  if (typeof window === 'undefined') return current
  const last  = localStorage.getItem(STREAK_DATE_KEY) ?? ''
  const today = todayISO()
  if (last === today) return current          // already counted today
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yISO = yesterday.toISOString().slice(0, 10)
  const next = last === yISO ? current + 1 : 1
  localStorage.setItem(STREAK_KEY,      String(next))
  localStorage.setItem(STREAK_DATE_KEY, today)
  return next
}

// ─── Audio helpers ────────────────────────────────────────────────────────────

function playChime(correct: boolean) {
  try {
    const ctx   = new AudioContext()
    const notes = correct ? [523, 659, 784] : [784, 620, 440]
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      const t = ctx.currentTime + i * 0.14
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.start(t); osc.stop(t + 0.32)
    })
  } catch { /* blocked */ }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function resolveVideoUrl(raw: string | null): string {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return supabase.storage.from('videos').getPublicUrl(raw).data.publicUrl
}

function chunkWords(text: string): string[] {
  const words = text.trim().split(/\s+/)
  if (words.length <= 3) return [text]
  const n    = words.length <= 6 ? 2 : words.length <= 10 ? 3 : 4
  const size = Math.ceil(words.length / n)
  const out: string[] = []
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(' '))
  return out
}

// ─── XP Float component ───────────────────────────────────────────────────────

function XpFloat({ xp, correct }: { xp: number; correct: boolean }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 900); return () => clearTimeout(t) }, [])
  if (!visible) return null
  return (
    <span className={`absolute -top-7 right-1 text-sm font-black animate-bounce pointer-events-none ${correct ? 'text-yellow-400' : 'text-white/40'}`}>
      +{xp} XP
    </span>
  )
}

// ─── Color Chunks ─────────────────────────────────────────────────────────────

function ColorChunks({ en, ar }: { en: string; ar: string | null }) {
  const enParts = chunkWords(en)
  const arParts = ar ? chunkWords(ar) : []
  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-wrap gap-2 justify-center">
        {enParts.map((p, i) => {
          const c = CHUNK_PALETTE[i % CHUNK_PALETTE.length]
          return <span key={i} className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>{p}</span>
        })}
      </div>
      {arParts.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {arParts.map((p, i) => {
            const c = CHUNK_PALETTE[i % CHUNK_PALETTE.length]
            return <span key={i} className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>{p}</span>
          })}
        </div>
      )}
    </div>
  )
}

// ─── Level Select ─────────────────────────────────────────────────────────────

function LevelSelect({
  counts, streak, totalXp, onSelect,
}: {
  counts: Record<Level, number>
  streak: number
  totalXp: number
  onSelect: (l: Level) => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(140deg,#0a0f1e 0%,#111827 60%,#0a0f1e 100%)' }}>

      {/* Stats strip */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
          <span className="text-lg">🔥</span>
          <span className="text-white font-black text-lg">{streak}</span>
          <span className="text-white/30 text-xs" dir="rtl">يوم متتالي</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
          <span className="text-lg">⚡</span>
          <span className="text-yellow-400 font-black text-lg">{totalXp}</span>
          <span className="text-white/30 text-xs">XP</span>
        </div>
      </div>

      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🎧</div>
        <h1 className="text-white text-3xl font-black mb-2">تدرب على الاستماع</h1>
        <p className="text-white/30 text-sm" dir="rtl">اختر مستواك — كل إجابة صحيحة = +10 XP</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {LEVELS.map(l => {
          const m = LEVEL_META[l]
          const count = counts[l]
          return (
            <button key={l} onClick={() => onSelect(l)}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/15 hover:scale-105 transition-all duration-200 active:scale-95">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{m.emoji}</span>
              <span className="text-white font-black text-2xl">{l}</span>
              <span className="text-white/40 text-xs" dir="rtl">{m.ar}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/30">{count} درس</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Session Summary ──────────────────────────────────────────────────────────

function SessionSummary({
  score, sessionXp, streak, level, onReplay, onChangeLevel,
}: {
  score: { correct: number; wrong: number }
  sessionXp: number
  streak: number
  level: Level
  onReplay: () => void
  onChangeLevel: () => void
}) {
  const total = score.correct + score.wrong
  const pct   = total > 0 ? Math.round((score.correct / total) * 100) : 0
  const m     = LEVEL_META[level]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 gap-6"
      style={{ background: 'linear-gradient(140deg,#0a0f1e 0%,#111827 60%,#0a0f1e 100%)' }}>

      {/* Trophy */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl"
          style={{ background: `${m.color}22`, border: `1px solid ${m.color}44` }}>
          {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚'}
        </div>
        {streak > 1 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 border-2 border-[#111827] flex items-center justify-center text-xs font-black text-white">
            {streak}
          </div>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-white text-3xl font-black mb-1">{pct}%</h2>
        <p className="text-white/40 text-sm" dir="rtl">{motivationMsg(pct)}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <span className="text-2xl font-black text-green-400">{score.correct}</span>
          <span className="text-xs text-green-400/60" dir="rtl">صحيح</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-2xl font-black text-red-400">{score.wrong}</span>
          <span className="text-xs text-red-400/60" dir="rtl">خطأ</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-2xl font-black text-yellow-400">+{sessionXp}</span>
          <span className="text-xs text-yellow-400/60">XP</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <span className="text-2xl font-black text-orange-400">🔥{streak}</span>
          <span className="text-xs text-orange-400/60" dir="rtl">يوم</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onChangeLevel}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white/60 bg-white/6 border border-white/8 hover:bg-white/12 transition-all active:scale-95">
          مستوى آخر
        </button>
        <button onClick={onReplay}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 transition-all active:scale-95">
          مجدداً 🔄
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ListenPage() {
  const [allItems,    setAllItems]    = useState<ContentItem[]>([])
  const [level,       setLevel]       = useState<Level | null>(null)
  const [index,       setIndex]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [replayCount, setReplayCount] = useState(0)
  const [unlocked,    setUnlocked]    = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selected,    setSelected]    = useState<number | null>(null)
  const [showModal,   setShowModal]   = useState(false)
  const [modalIn,     setModalIn]     = useState(false)
  const [score,       setScore]       = useState({ correct: 0, wrong: 0 })
  const [sessionXp,   setSessionXp]   = useState(0)
  const [totalXp,     setTotalXp]     = useState(0)
  const [streak,      setStreak]      = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [showXpFloat, setShowXpFloat] = useState(false)
  const [lastXp,      setLastXp]      = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)

  const videoRef  = useRef<HTMLVideoElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derived
  const items      = level ? allItems.filter(it => it.level === level) : []
  const current    = items[index] as ContentItem | undefined
  const isLast     = index === items.length - 1
  const counts     = Object.fromEntries(LEVELS.map(l => [l, allItems.filter(it => it.level === l).length])) as Record<Level, number>
  const publicUrl  = resolveVideoUrl(current?.video_url ?? null)

  // ── Load XP + streak from localStorage ───────────────────────────────────
  useEffect(() => {
    const xpStored = parseInt(localStorage.getItem('inglizi_total_xp') ?? '0', 10)
    setTotalXp(xpStored)
    setStreak(loadStreak())
  }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: true })

    if (error) { console.error('FETCH ERROR:', error); setLoading(false); return }
    console.log('DATA:', data)
    setAllItems((data ?? []) as ContentItem[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Reset on clip change ──────────────────────────────────────────────────
  useEffect(() => {
    setReplayCount(0)
    setUnlocked(false)
    setShowOptions(false)
    setSelected(null)
    setShowModal(false)
    setModalIn(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setUnlocked(true), 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [level, index]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset index + session score when level changes
  useEffect(() => {
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setSessionXp(0)
    setShowSummary(false)
  }, [level])

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleVideoEnded() {
    setReplayCount(c => c + 1)
    setUnlocked(true)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function addXp(amount: number, correct: boolean) {
    setLastXp(amount)
    setLastCorrect(correct)
    setShowXpFloat(false)
    requestAnimationFrame(() => setShowXpFloat(true))
    setTimeout(() => setShowXpFloat(false), 1000)

    setSessionXp(x => x + amount)
    const next = totalXp + amount
    setTotalXp(next)
    localStorage.setItem('inglizi_total_xp', String(next))
  }

  function openModal() {
    setShowModal(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setModalIn(true)))
  }

  function handleSelect(i: number) {
    if (selected !== null || !current) return
    const ok = i === current.correct_index
    playChime(ok)
    setSelected(i)
    setScore(s => ok ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    addXp(ok ? XP_CORRECT : XP_WRONG, ok)
    openModal()
  }

  function handleReplay() {
    if (!videoRef.current || replayCount >= MAX_REPLAYS) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setModalIn(false)
    setTimeout(() => { setShowModal(false); setShowOptions(false); setSelected(null) }, 200)
  }

  function handleNext() {
    setModalIn(false)
    setTimeout(() => {
      if (isLast) {
        // Mark streak for today and show summary
        const newStreak = markStreakToday(streak)
        setStreak(newStreak)
        setShowSummary(true)
      } else {
        setIndex(i => i + 1)
      }
    }, 200)
  }

  function restartLevel() {
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setSessionXp(0)
    setShowSummary(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ background: '#0a0f1e' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/25 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )

  if (!level) return <LevelSelect counts={counts} streak={streak} totalXp={totalXp} onSelect={setLevel} />

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 pt-20" style={{ background: '#0a0f1e' }}>
      <p className="text-5xl">📭</p>
      <p className="text-white/40 text-sm" dir="rtl">لا يوجد محتوى لمستوى {level}</p>
      <button onClick={() => setLevel(null)}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95">
        اختر مستوى آخر
      </button>
    </div>
  )

  if (showSummary) return (
    <SessionSummary
      score={score} sessionXp={sessionXp} streak={streak} level={level}
      onReplay={restartLevel} onChangeLevel={() => setLevel(null)}
    />
  )

  if (!current) return null
  const isCorrect = selected === current.correct_index
  const m = LEVEL_META[level]

  // ─────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col pt-20"
      style={{ background: 'linear-gradient(140deg,#0a0f1e 0%,#111827 60%,#0a0f1e 100%)' }}>

      {/* ── Top bar ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

          {/* Level tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setLevel(null)}
              className="px-3 py-1.5 rounded-xl bg-white/6 border border-white/8 text-white/40 text-xs font-bold hover:text-white/70 hover:bg-white/10 transition-all">
              ← المستويات
            </button>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${LEVEL_META[l][l === level ? 'active' : 'inactive']}`}>
                {LEVEL_META[l].emoji} {l}
              </button>
            ))}
          </div>

          {/* XP + streak + position */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-orange-400 text-xs font-bold">🔥 {streak}</span>
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">⚡ {totalXp}</span>
            <span className="text-green-400 text-xs font-bold">✅ {score.correct}</span>
            <span className="text-red-400   text-xs font-bold">❌ {score.wrong}</span>
            <span className="text-white/25  text-xs">{index + 1}/{items.length}</span>
          </div>
        </div>

        {/* Segment progress */}
        <div className="flex gap-1">
          {items.map((_, i) => (
            <div key={i}
              style={{ background: i < index ? m.color : i === index ? '#6366f1' : undefined }}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${i > index ? 'bg-white/10' : ''}`} />
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 px-4 pb-10 mt-2">
        <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">

          {/* ── LEFT: Video ── */}
          <div className="flex flex-col gap-3">

            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/8">
              {publicUrl ? (
                <video ref={videoRef} key={current.id} playsInline preload="auto" controls
                  onEnded={handleVideoEnded}
                  onError={() => console.error('VIDEO ERROR:', publicUrl)}
                  className="w-full block">
                  <source src={publicUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-2 bg-white/2">
                  <p className="text-3xl opacity-20">🎬</p>
                  <p className="text-white/15 text-xs">لا يوجد فيديو</p>
                </div>
              )}
            </div>

            {/* Replay bar */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {Array.from({ length: MAX_REPLAYS }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < replayCount ? 'bg-indigo-500' : 'bg-white/8'}`} />
                ))}
              </div>
              <span className="text-white/20 text-xs shrink-0">{replayCount}/{MAX_REPLAYS}</span>
            </div>

            {/* Show questions */}
            <button onClick={() => setShowOptions(true)}
              disabled={!unlocked || showOptions} dir="rtl"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/40">
              {showOptions ? '✅ الأسئلة ظاهرة' : unlocked ? '📋 أظهر الأسئلة' : '🎧 استمع أولاً...'}
            </button>
          </div>

          {/* ── RIGHT: Quiz ── */}
          <div dir="rtl" className="flex flex-col justify-center gap-4 min-h-[300px]">
            {!showOptions ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30 select-none">
                <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center text-3xl">🎧</div>
                <p className="text-white/40 text-sm text-center leading-relaxed">
                  شاهد الفيديو كاملاً<br />ثم اضغط &quot;أظهر الأسئلة&quot;
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-white/35 text-xs mb-1 font-medium">اختر الإجابة الصحيحة</p>
                  <h2 className="text-white font-bold text-base leading-snug">ما هي الجملة التي سمعتها؟</h2>
                </div>

                {/* XP float */}
                <div className="relative h-0">
                  {showXpFloat && <XpFloat xp={lastXp} correct={lastCorrect} />}
                </div>

                <div className="flex flex-col gap-2.5">
                  {current.options.map((opt, i) => {
                    let cls = 'w-full px-4 py-3.5 rounded-xl border font-medium text-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-default text-left '
                    if (selected === null)                 cls += 'border-white/10 bg-white/4 text-white/80 hover:bg-white/8 hover:border-white/20 hover:text-white'
                    else if (i === current.correct_index)  cls += 'border-green-500/60 bg-green-500/12 text-green-300 shadow-sm shadow-green-900/30'
                    else if (i === selected)               cls += 'border-red-500/60 bg-red-500/12 text-red-300'
                    else                                   cls += 'border-white/4 bg-transparent text-white/15 opacity-40'
                    return (
                      <button key={i} dir="ltr" onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
                        <span className="text-white/20 mr-2 font-mono">{String.fromCharCode(65 + i)}.</span>
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
        <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-200 ${modalIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center gap-5 text-center transition-all duration-200 ${modalIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'}`}>

            {/* Result */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isCorrect ? 'bg-green-500/15 border border-green-500/30' : 'bg-red-500/15 border border-red-500/30'}`}>
              {isCorrect ? '✅' : '❌'}
            </div>

            <div>
              <p className={`text-xl font-black mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'ممتاز! 🎉' : 'حاول مجدداً 💪'}
              </p>
              <p className="text-white/30 text-xs">
                {isCorrect
                  ? `+${XP_CORRECT} XP 🏅`
                  : `الصحيح: ${current.options[current.correct_index]} · +${XP_WRONG} XP`}
              </p>
            </div>

            <ColorChunks en={current.sentence} ar={current.arabic_sentence} />

            <div className="flex gap-3 w-full pt-1">
              <button onClick={handleReplay}
                disabled={replayCount >= MAX_REPLAYS}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white/60 bg-white/6 border border-white/8 hover:bg-white/12 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95">
                🔁 استمع ({MAX_REPLAYS - replayCount})
              </button>
              <button onClick={handleNext}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 transition-all active:scale-95">
                {isLast ? '🏁 النتائج' : 'التالي ←'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
