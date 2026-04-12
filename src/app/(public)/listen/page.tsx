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

const LEVEL_META: Record<Level, { emoji: string; ar: string; color: string; gradient: string }> = {
  A1: { emoji: '🌱', ar: 'مبتدئ',  color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  A2: { emoji: '⭐', ar: 'أساسي',  color: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
  B1: { emoji: '🚀', ar: 'متوسط',  color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600' },
  B2: { emoji: '🔥', ar: 'متقدم',  color: '#f43f5e', gradient: 'from-rose-500 to-rose-600' },
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

// ─── Floating Icons Config ───────────────────────────────────────────────────

const FLOATING_ICONS = [
  { icon: '🎧', size: 28, x: 5,  y: 15, delay: 0,   dur: 18 },
  { icon: '📖', size: 22, x: 88, y: 20, delay: 2,   dur: 22 },
  { icon: '🎵', size: 20, x: 15, y: 55, delay: 4,   dur: 20 },
  { icon: '✨', size: 18, x: 92, y: 60, delay: 1,   dur: 16 },
  { icon: '💬', size: 24, x: 8,  y: 80, delay: 3,   dur: 24 },
  { icon: '🌟', size: 20, x: 85, y: 85, delay: 5,   dur: 19 },
  { icon: '📝', size: 18, x: 50, y: 10, delay: 2.5, dur: 21 },
  { icon: '🔤', size: 22, x: 75, y: 45, delay: 1.5, dur: 17 },
  { icon: '🎯', size: 16, x: 25, y: 35, delay: 3.5, dur: 23 },
  { icon: '📚', size: 20, x: 65, y: 75, delay: 0.5, dur: 20 },
]

function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {FLOATING_ICONS.map((f, i) => (
        <div
          key={i}
          className="absolute opacity-[0.06] animate-float-icon"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            fontSize: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.dur}s`,
          }}
        >
          {f.icon}
        </div>
      ))}
      <style jsx>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%      { transform: translateY(-20px) rotate(5deg); }
          50%      { transform: translateY(-8px) rotate(-3deg); }
          75%      { transform: translateY(-25px) rotate(4deg); }
        }
        .animate-float-icon {
          animation-name: float-icon;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
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
  return 0
}

function markStreakToday(current: number): number {
  if (typeof window === 'undefined') return current
  const last  = localStorage.getItem(STREAK_DATE_KEY) ?? ''
  const today = todayISO()
  if (last === today) return current
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
    <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black animate-bounce pointer-events-none ${correct ? 'text-yellow-400' : 'text-white/40'}`}>
      +{xp} XP
    </span>
  )
}

// ─── Color Chunks ─────────────────────────────────────────────────────────────

function ColorChunks({ en, ar }: { en: string; ar: string | null }) {
  const enParts = chunkWords(en)
  const arParts = ar ? chunkWords(ar) : []
  return (
    <div className="space-y-2.5 w-full">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {enParts.map((p, i) => {
          const c = CHUNK_PALETTE[i % CHUNK_PALETTE.length]
          return <span key={i} className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>{p}</span>
        })}
      </div>
      {arParts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center" dir="rtl">
          {arParts.map((p, i) => {
            const c = CHUNK_PALETTE[i % CHUNK_PALETTE.length]
            return <span key={i} className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold ${c.text} ${c.bg} ${c.border}`}>{p}</span>
          })}
        </div>
      )}
    </div>
  )
}

// ─── Auto-translate cache ────────────────────────────────────────────────────

const translationCache: Record<string, string> = {}

async function translateToArabic(text: string): Promise<string> {
  if (translationCache[text]) return translationCache[text]
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`,
    )
    const json = await res.json()
    // Response is nested arrays: [[["translated","original",...],...],...]
    const parts = (json?.[0] ?? []) as Array<[string]>
    const translated = parts.map(p => p[0]).join('')
    if (translated) {
      translationCache[text] = translated
      return translated
    }
    return ''
  } catch {
    return ''
  }
}

// ─── Arabic Hint Strip (auto-translated) ─────────────────────────────────────

function ArabicHint({ englishSentence }: { englishSentence: string }) {
  const [ar, setAr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setAr(null)
    if (!englishSentence) return
    translateToArabic(englishSentence).then(t => {
      if (!cancelled && t) setAr(t)
    })
    return () => { cancelled = true }
  }, [englishSentence])

  if (!ar) return (
    <div className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3" dir="rtl">
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs">🇲🇦</span>
        <p className="text-white/20 text-sm animate-pulse">جاري الترجمة...</p>
      </div>
    </div>
  )

  return (
    <div className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3" dir="rtl">
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs">🇲🇦</span>
        <p className="text-white/50 text-sm font-medium leading-relaxed">{ar}</p>
      </div>
    </div>
  )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label, bg, text }: { icon: string; value: string | number; label: string; bg: string; text: string }) {
  return (
    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${bg}`}>
      <span className="text-base">{icon}</span>
      <span className={`${text} font-black text-sm`}>{value}</span>
      <span className={`${text} opacity-50 text-[10px] hidden sm:inline`}>{label}</span>
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
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 pt-24 pb-12"
      style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>

      <FloatingIcons />

      {/* Stats */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <StatPill icon="🔥" value={streak} label="يوم متتالي" bg="bg-orange-500/10 border-orange-500/20" text="text-orange-400" />
        <StatPill icon="⚡" value={totalXp} label="XP" bg="bg-yellow-500/10 border-yellow-500/20" text="text-yellow-400" />
      </div>

      {/* Hero */}
      <div className="relative z-10 mb-10 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
          <span className="text-4xl">🎧</span>
        </div>
        <h1 className="text-white text-2xl sm:text-3xl font-black mb-2">تدرب على الاستماع</h1>
        <p className="text-white/30 text-sm max-w-xs mx-auto" dir="rtl">اختر مستواك — كل إجابة صحيحة = +10 XP</p>
      </div>

      {/* Level Cards */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm sm:max-w-lg lg:max-w-2xl lg:grid-cols-4">
        {LEVELS.map(l => {
          const m = LEVEL_META[l]
          const count = counts[l]
          return (
            <button key={l} onClick={() => onSelect(l)}
              className="group relative flex flex-col items-center gap-2.5 p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 active:scale-95">
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}15, transparent 70%)` }} />
              <span className="relative text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">{m.emoji}</span>
              <span className="relative text-white font-black text-xl sm:text-2xl">{l}</span>
              <span className="relative text-white/40 text-xs" dir="rtl">{m.ar}</span>
              <span className="relative text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/25 border border-white/[0.06]">{count} درس</span>
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
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (circumference * pct) / 100

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 pt-24 pb-12 gap-6"
      style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>

      <FloatingIcons />

      {/* Circular Progress */}
      <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={m.color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black text-white">{pct}%</span>
          <span className="text-white/25 text-[10px]">{m.emoji} {level}</span>
        </div>
      </div>

      {/* Motivation */}
      <p className="relative z-10 text-white/50 text-sm sm:text-base text-center" dir="rtl">{motivationMsg(pct)}</p>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-green-500/[0.08] border border-green-500/[0.15]">
          <span className="text-2xl font-black text-green-400">{score.correct}</span>
          <span className="text-[10px] text-green-400/50" dir="rtl">صحيح</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-red-500/[0.08] border border-red-500/[0.15]">
          <span className="text-2xl font-black text-red-400">{score.wrong}</span>
          <span className="text-[10px] text-red-400/50" dir="rtl">خطأ</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-yellow-500/[0.08] border border-yellow-500/[0.15]">
          <span className="text-2xl font-black text-yellow-400">+{sessionXp}</span>
          <span className="text-[10px] text-yellow-400/50">XP</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-orange-500/[0.08] border border-orange-500/[0.15]">
          <span className="text-2xl font-black text-orange-400">{streak}</span>
          <span className="text-[10px] text-orange-400/50" dir="rtl">🔥 يوم</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex gap-3 w-full max-w-xs pt-2">
        <button onClick={onChangeLevel}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all active:scale-95">
          مستوى آخر
        </button>
        <button onClick={onReplay}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-900/30 transition-all active:scale-95">
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
  const [showXpFloat,   setShowXpFloat]   = useState(false)
  const [lastXp,        setLastXp]        = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [playNumber, setPlayNumber] = useState(1)       // which play we're on (1, 2, 3)
  const [isPaused,   setIsPaused]   = useState(false)    // 2s gap between plays
  const [autoPlayDone, setAutoPlayDone] = useState(false) // all 3 plays finished

  const videoRef   = useRef<HTMLVideoElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derived
  const items      = level ? allItems.filter(it => it.level === level) : []
  const current    = items[index] as ContentItem | undefined
  const isLast     = index === items.length - 1
  const counts     = Object.fromEntries(LEVELS.map(l => [l, allItems.filter(it => it.level === l).length])) as Record<Level, number>

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
    setPlayNumber(1)
    setIsPaused(false)
    setAutoPlayDone(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (pauseRef.current) clearTimeout(pauseRef.current)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pauseRef.current) clearTimeout(pauseRef.current)
    }
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
    setReplayCount(c => {
      const next = c + 1
      if (next < MAX_REPLAYS) {
        // More plays remaining → pause 2s then replay
        setIsPaused(true)
        pauseRef.current = setTimeout(() => {
          setIsPaused(false)
          setPlayNumber(next + 1)
          if (videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch(() => {})
          }
        }, 2000)
      } else {
        // All 3 plays done → unlock questions automatically
        setAutoPlayDone(true)
        setUnlocked(true)
        setShowOptions(true)
      }
      return next
    })
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
    if (!videoRef.current) return
    // Reset for a fresh 3-play cycle
    setReplayCount(0)
    setPlayNumber(1)
    setIsPaused(false)
    setAutoPlayDone(false)
    setUnlocked(false)
    setModalIn(false)
    setTimeout(() => {
      setShowModal(false)
      setShowOptions(false)
      setSelected(null)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
      }
    }, 200)
  }

  function handleNext() {
    setModalIn(false)
    setTransitioning(true)
    setTimeout(() => {
      if (isLast) {
        const newStreak = markStreakToday(streak)
        setStreak(newStreak)
        setShowSummary(true)
      } else {
        setIndex(i => i + 1)
      }
      setTimeout(() => setTransitioning(false), 50)
    }, 300)
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-white/20 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )

  if (!level) return <LevelSelect counts={counts} streak={streak} totalXp={totalXp} onSelect={setLevel} />

  if (items.length === 0) return (
    <div className="min-h-screen relative flex flex-col items-center justify-center gap-5 px-4 pt-24 pb-12" style={{ background: '#0a0f1e' }}>
      <FloatingIcons />
      <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <span className="text-4xl opacity-40">📭</span>
      </div>
      <p className="relative z-10 text-white/30 text-sm" dir="rtl">لا يوجد محتوى لمستوى {level}</p>
      <button onClick={() => setLevel(null)}
        className="relative z-10 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95">
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
  // QUIZ — responsive, mobile-first
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex flex-col"
      style={{ background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 50%,#0a0f1e 100%)' }}>

      <FloatingIcons />

      {/* ── Spacer for the fixed site header (70px) ── */}
      <div className="h-[70px] shrink-0" />

      {/* ── Sub-header bar ── */}
      <div className="sticky top-[70px] z-30 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          {/* Nav + Stats row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button onClick={() => setLevel(null)}
                className="shrink-0 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-sm flex items-center justify-center hover:bg-white/[0.08] transition-all active:scale-90">
                ←
              </button>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                    l === level
                      ? `bg-gradient-to-r ${LEVEL_META[l].gradient} text-white shadow-lg`
                      : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}>
                  {LEVEL_META[l].emoji} {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold shrink-0">
              <span className="text-orange-400 flex items-center gap-0.5">🔥 {streak}</span>
              <span className="text-yellow-400 flex items-center gap-0.5">⚡ {totalXp}</span>
              <span className="text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-md">{index + 1}/{items.length}</span>
            </div>
          </div>

          {/* Segment progress bar */}
          <div className="flex gap-[3px] h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
            {items.map((_, i) => (
              <div key={i}
                className="flex-1 rounded-full transition-all duration-500 ease-out"
                style={{
                  background: i < index ? m.color : i === index ? '#6366f1' : 'transparent',
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className={`relative z-10 flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 gap-5 lg:gap-6 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>

        {/* ── Video Player Section ── */}
        <div className="flex flex-col gap-4 lg:flex-[3] min-w-0">

          {/* Player Container */}
          <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/[0.06] shadow-2xl shadow-black/40">
            {current?.video_url ? (
              <>
                <video
                  ref={videoRef}
                  key={current.video_url}
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onError={() => console.error('VIDEO ERROR:', current.video_url)}
                  className="w-full aspect-video object-cover"
                >
                  <source src={resolveVideoUrl(current.video_url)} type="video/mp4" />
                </video>

                {/* Pause overlay between plays */}
                {isPaused && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-white/50 text-xs font-medium" dir="rtl">استعد للاستماع مرة أخرى...</p>
                  </div>
                )}

                {/* Listening status badge */}
                {!autoPlayDone && !isPaused && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 z-10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white/70 text-[11px] font-bold">{playNumber}/{MAX_REPLAYS}</span>
                  </div>
                )}

                {/* Done badge */}
                {autoPlayDone && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 z-10">
                    <span className="text-green-400 text-[11px] font-bold">✅ تم الاستماع</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.02] to-white/[0.01]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <span className="text-3xl opacity-20">🎬</span>
                </div>
                <p className="text-white/15 text-xs">لا يوجد فيديو</p>
              </div>
            )}
          </div>

          {/* Play progress bar */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: MAX_REPLAYS }).map((_, i) => (
                  <div key={i} className="h-2 flex-1 rounded-full transition-all duration-500 relative overflow-hidden" style={{
                    background: i < replayCount ? m.color : 'rgba(255,255,255,0.06)',
                  }}>
                    {i === replayCount && !autoPlayDone && !isPaused && (
                      <div className="absolute inset-0 rounded-full bg-indigo-500/60 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-white/25 text-xs shrink-0 font-bold tabular-nums">{replayCount}/{MAX_REPLAYS}</span>
            </div>

            <span className="text-white/20 text-[10px] shrink-0" dir="rtl">
              {autoPlayDone ? '✅ أجب الآن' : isPaused ? '⏸ استراحة...' : '🎧 جاري الاستماع...'}
            </span>
          </div>

          {/* ── Arabic hint (auto-translated, no English shown) ── */}
          <ArabicHint englishSentence={current.sentence} />
        </div>

        {/* ── Quiz Panel ── */}
        <div dir="rtl" className="flex flex-col lg:flex-[2] min-w-0">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 sm:p-5 lg:p-6 flex flex-col gap-4 flex-1">

            {!showOptions ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8 lg:py-12">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                  <span className="text-3xl">{isPaused ? '⏸' : '🎧'}</span>
                </div>
                <div className="text-center">
                  <p className="text-white/30 text-sm mb-1">
                    {isPaused ? 'استراحة قصيرة...' : `جاري الاستماع ${playNumber}/${MAX_REPLAYS}`}
                  </p>
                  <p className="text-white/15 text-[10px]">ستظهر الأسئلة تلقائياً بعد 3 مرات استماع</p>
                </div>
                {/* Mini listening animation */}
                <div className="flex items-end gap-1 h-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 rounded-full bg-indigo-500/40 ${isPaused ? 'h-1' : 'animate-pulse'}`}
                      style={{
                        height: isPaused ? 4 : undefined,
                        animationDelay: `${i * 0.15}s`,
                        minHeight: 4,
                        maxHeight: 24,
                      }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Question header */}
                <div className="relative">
                  <p className="text-white/40 text-xs sm:text-sm font-medium">ما هي الجملة التي سمعتها؟</p>
                  <div className="relative h-1 mt-1">
                    {showXpFloat && <XpFloat xp={lastXp} correct={lastCorrect} />}
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2.5">
                  {current.options.map((opt, i) => {
                    const isSelected = i === selected
                    const isAnswer   = i === current.correct_index
                    const answered   = selected !== null

                    let cls = 'w-full px-4 py-3.5 sm:py-4 rounded-xl border font-medium text-sm text-left transition-all duration-200 active:scale-[0.98] disabled:cursor-default '

                    if (!answered) {
                      cls += 'border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white'
                    } else if (isAnswer) {
                      cls += 'border-green-500/40 bg-green-500/10 text-green-300 shadow-sm shadow-green-500/10'
                    } else if (isSelected) {
                      cls += 'border-red-500/40 bg-red-500/10 text-red-300'
                    } else {
                      cls += 'border-white/[0.03] bg-transparent text-white/10'
                    }

                    return (
                      <button key={i} dir="ltr" onClick={() => handleSelect(i)} disabled={answered} className={cls}>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold mr-2.5 ${
                          !answered ? 'bg-white/[0.06] text-white/25' :
                          isAnswer ? 'bg-green-500/20 text-green-400' :
                          isSelected ? 'bg-red-500/20 text-red-400' :
                          'bg-white/[0.03] text-white/10'
                        }`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {/* Score bar */}
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400/60 text-xs font-bold">✅ {score.correct}</span>
                    <span className="text-red-400/60 text-xs font-bold">❌ {score.wrong}</span>
                  </div>
                  <span className="text-yellow-400/40 text-xs font-bold">⚡ +{sessionXp} XP</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Answer Modal ── */}
      {showModal && selected !== null && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 backdrop-blur-md transition-opacity duration-300"
            style={{ background: 'rgba(0,0,0,0.7)', opacity: modalIn ? 1 : 0 }}
            onClick={handleNext}
          />

          {/* Modal — bottom sheet on mobile, centered on desktop */}
          <div
            className={`fixed z-50 transition-all duration-300 inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:px-4 ${
              modalIn ? 'translate-y-0 sm:-translate-x-1/2 sm:-translate-y-1/2 opacity-100' : 'translate-y-full sm:-translate-x-1/2 sm:-translate-y-[44%] opacity-0'
            }`}
          >
            <div className={`bg-[#111827] border-t sm:border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl w-full p-5 sm:p-6 flex flex-col items-center gap-4 text-center ${
              isCorrect ? 'shadow-green-900/20' : 'shadow-red-900/20'
            }`}>

              {/* Drag handle (mobile) */}
              <div className="w-10 h-1 rounded-full bg-white/10 sm:hidden" />

              {/* Result icon */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                isCorrect
                  ? 'bg-green-500/15 border border-green-500/25'
                  : 'bg-red-500/15 border border-red-500/25'
              }`}>
                {isCorrect ? '✅' : '❌'}
              </div>

              {/* Message */}
              <div>
                <p className={`text-xl sm:text-2xl font-black mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'ممتاز! 🎉' : 'حاول مجدداً 💪'}
                </p>
                <p className="text-white/30 text-xs sm:text-sm">
                  {isCorrect ? `+${XP_CORRECT} XP 🏅` : `الصحيح: ${current.options[current.correct_index]} · +${XP_WRONG} XP`}
                </p>
              </div>

              {/* Color chunks */}
              <ColorChunks en={current.sentence} ar={current.arabic_sentence} />

              {/* Buttons */}
              <div className="flex gap-3 w-full pt-1">
                <button onClick={handleReplay}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white/50 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all active:scale-95">
                  🔁 أعد الاستماع
                </button>
                <button onClick={handleNext}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-900/30 transition-all active:scale-95">
                  {isLast ? '🏁 النتائج' : 'التالي ←'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
