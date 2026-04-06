'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Play, Pause, RotateCcw, ChevronRight, Volume2,
  CheckCircle2, XCircle, Zap, Crown, Headphones, ArrowRight,
} from 'lucide-react'
import {
  CLIPS, FREE_DAILY_LIMIT,
  getDailyCount, incrementDailyCount, shuffleClips,
  type Clip, type Difficulty,
} from '@/lib/listen-clips'

// ─── YouTube IFrame API types ─────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPEEDS = [0.5, 0.75, 1, 1.25] as const
type Speed = typeof SPEEDS[number]

const SESSION_LENGTH = 10  // clips per session

const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string; sublabel: string; color: string; bg: string
  border: string; icon: string; gradient: string
}> = {
  A1: {
    label: 'A1', sublabel: 'مبتدئ',
    color: 'text-emerald-400', bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40', icon: '🌱',
    gradient: 'from-emerald-500 to-teal-500',
  },
  A2: {
    label: 'A2', sublabel: 'أساسي',
    color: 'text-amber-400', bg: 'bg-amber-500/15',
    border: 'border-amber-500/40', icon: '⭐',
    gradient: 'from-amber-500 to-orange-500',
  },
  B1: {
    label: 'B1', sublabel: 'متوسط',
    color: 'text-violet-400', bg: 'bg-violet-500/15',
    border: 'border-violet-500/40', icon: '🚀',
    gradient: 'from-violet-500 to-purple-600',
  },
  B2: {
    label: 'B2', sublabel: 'فوق المتوسط',
    color: 'text-rose-400', bg: 'bg-rose-500/15',
    border: 'border-rose-500/40', icon: '🔥',
    gradient: 'from-rose-500 to-pink-600',
  },
}

// ─── Alignment validator (ensure data integrity) ──────────────────────────────

function validateClipAlignment(clip: Clip): boolean {
  return clip.options[clip.correctIndex] === clip.sentence
}

// ─── ClipService: filter by level, validate alignment, shuffle ────────────────

function buildSession(level: Difficulty): Clip[] {
  const valid = CLIPS
    .filter(c => c.difficulty === level)
    .filter(validateClipAlignment)
  const shuffled = shuffleClips(valid)
  return shuffled.slice(0, SESSION_LENGTH)
}

// ─── Sound effects ────────────────────────────────────────────────────────────

function playSound(type: 'correct' | 'wrong') {
  if (typeof window === 'undefined') return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.setValueAtTime(185, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    }
  } catch { /* ignore */ }
}

// ─── Level Select Screen ──────────────────────────────────────────────────────

function LevelSelectScreen({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  const levels: Difficulty[] = ['A1', 'A2', 'B1', 'B2']

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 pb-16"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)' }}
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs text-blue-200 mb-5">
            <Headphones size={12} className="text-blue-400" /> تدريب على الاستماع
          </div>
          <h1 className="text-4xl font-black text-white mb-3">اختر مستواك</h1>
          <p className="text-white/50 text-base leading-relaxed">
            ستحصل على {SESSION_LENGTH} جمل مختارة من مستواك — استمع، افهم، واختر
          </p>
        </div>

        {/* Level cards */}
        <div className="grid grid-cols-2 gap-4">
          {levels.map((level) => {
            const cfg = DIFFICULTY_CONFIG[level]
            const count = CLIPS.filter(c => c.difficulty === level && validateClipAlignment(c)).length
            return (
              <button
                key={level}
                onClick={() => onSelect(level)}
                className={`group relative flex flex-col items-center text-center p-6 rounded-3xl border-2 ${cfg.bg} ${cfg.border} hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-xl`}
              >
                <span className="text-4xl mb-3">{cfg.icon}</span>
                <span className={`text-3xl font-black mb-1 ${cfg.color}`}>{cfg.label}</span>
                <span className="text-white/70 font-semibold text-sm mb-3">{cfg.sublabel}</span>
                <span className="text-white/30 text-xs">{count} جملة</span>

                <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${cfg.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  ابدأ <ArrowRight size={12} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/25 text-xs mt-8">
          يمكنك تغيير المستوى في أي وقت خلال الجلسة
        </p>
      </div>
    </div>
  )
}

// ─── Score Display ────────────────────────────────────────────────────────────

function ScoreDisplay({
  correct, total, level,
}: { correct: number; total: number; level: Difficulty }) {
  const cfg = DIFFICULTY_CONFIG[level]
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} px-4 py-3`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold ${cfg.color} flex items-center gap-1.5`}>
          {cfg.icon} {cfg.label} · {cfg.sublabel}
        </span>
        <span className="text-white/50 text-xs font-semibold">
          {correct} / {total} إجابة صحيحة
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  current, total, dailyCount, isPremium,
}: { current: number; total: number; dailyCount: number; isPremium: boolean }) {
  const remaining = FREE_DAILY_LIMIT - dailyCount
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/50 text-xs font-semibold flex items-center gap-1">
          <Headphones size={12} className="text-blue-400" /> جلسة الاستماع
        </span>
        <span className="text-white/40 text-xs">{current} / {total}</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.round((current / total) * 100)}%` }}
        />
      </div>
      {!isPremium && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-white/25 text-xs">
            {remaining > 0 ? `${remaining} محاولة متبقية اليوم` : 'وصلت للحد اليومي'}
          </span>
          <Link href="/courses" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition-colors">
            <Crown size={10} /> Premium
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Speed Control ────────────────────────────────────────────────────────────

function SpeedControl({ speed, onChange }: {
  speed: Speed; onChange: (s: Speed) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Volume2 size={12} className="text-white/30 shrink-0" />
      <span className="text-white/30 text-xs ml-0.5">السرعة:</span>
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
            speed === s
              ? 'bg-blue-500 text-white'
              : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  )
}

// ─── MCQ Options ─────────────────────────────────────────────────────────────

function MCQOptions({
  clip, selected, phase, onSelect,
}: {
  clip: Clip
  selected: number | null
  phase: 'answering' | 'feedback'
  onSelect: (i: number) => void
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-white/50 text-sm font-semibold mb-3 flex items-center gap-1.5">
        🎧 ماذا سمعت؟
      </p>
      {clip.options.map((opt, i) => {
        const isCorrect = i === clip.correctIndex
        const isSelected = i === selected

        let cls = 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10 hover:border-white/30 cursor-pointer'
        if (phase === 'feedback') {
          if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 cursor-default'
          else if (isSelected) cls = 'bg-red-500/20 border-red-400 text-red-200 cursor-default'
          else cls = 'bg-white/3 border-white/8 text-white/25 cursor-default'
        } else if (isSelected) {
          cls = 'bg-blue-500/20 border-blue-400 text-blue-200 cursor-pointer'
        }

        return (
          <button
            key={i}
            onClick={() => phase === 'answering' && onSelect(i)}
            disabled={phase === 'feedback'}
            className={`w-full text-right px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${cls}`}
            dir="ltr"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-left leading-snug">{opt}</span>
              {phase === 'feedback' && isCorrect && (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              )}
              {phase === 'feedback' && isSelected && !isCorrect && (
                <XCircle size={16} className="text-red-400 shrink-0" />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Feedback Banner ──────────────────────────────────────────────────────────

function FeedbackBanner({ isCorrect, correctSentence, xp }: {
  isCorrect: boolean; correctSentence: string; xp: number
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${
      isCorrect
        ? 'bg-emerald-500/15 border-emerald-500/40'
        : 'bg-red-500/15 border-red-500/40'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {isCorrect
            ? <CheckCircle2 size={15} className="text-emerald-400" />
            : <XCircle size={15} className="text-red-400" />}
          <span className={`font-black text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
            {isCorrect ? 'ممتاز! إجابة صحيحة 🎉' : 'إجابة خاطئة ❌'}
          </span>
        </div>
        <span className="text-amber-300 font-black text-xs flex items-center gap-0.5">
          <Zap size={11} /> +{xp} XP
        </span>
      </div>
      {!isCorrect && (
        <div className="bg-white/10 rounded-lg px-3 py-2 mt-2" dir="ltr">
          <p className="text-white/40 text-xs mb-0.5">الجملة الصحيحة:</p>
          <p className="text-white font-semibold text-sm leading-snug">{correctSentence}</p>
        </div>
      )}
    </div>
  )
}

// ─── Daily Limit Wall ─────────────────────────────────────────────────────────

function DailyLimitWall() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-4xl mb-6">
        👑
      </div>
      <h2 className="text-2xl font-black text-white mb-3">انتهت محاولاتك اليومية</h2>
      <p className="text-white/50 mb-8 max-w-xs leading-relaxed text-sm">
        وصلت لـ {FREE_DAILY_LIMIT} فيديوهات مجانية اليوم. ارجع غداً أو ارقَّ للـ Premium للوصول غير المحدود.
      </p>
      <Link
        href="/courses"
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:opacity-90 active:scale-95 transition-all mb-4"
      >
        <Crown size={20} /> ارقَّ للـ Premium
      </Link>
      <p className="text-white/30 text-xs">وصول غير محدود · جميع المستويات · ميزات حصرية</p>
    </div>
  )
}

// ─── Session Complete Screen ──────────────────────────────────────────────────

function SessionComplete({
  correct, total, level, onRestart, onChangeLevel,
}: {
  correct: number; total: number; level: Difficulty
  onRestart: () => void; onChangeLevel: () => void
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
  const cfg = DIFFICULTY_CONFIG[level]
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'

  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="text-2xl font-black text-white mb-2">انتهت الجلسة!</h2>
      <p className={`text-5xl font-black mb-1 ${cfg.color}`}>{correct}<span className="text-white/40 text-2xl">/{total}</span></p>
      <p className="text-white/50 text-sm mb-2">إجابات صحيحة</p>
      <p className="text-white/30 text-xs mb-8">{pct}% دقة · مستوى {cfg.label}</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRestart}
          className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${cfg.gradient} text-white font-black text-base shadow-lg active:scale-95 transition-all`}
        >
          إعادة نفس المستوى
        </button>
        <button
          onClick={onChangeLevel}
          className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-sm border border-white/15 active:scale-95 transition-all"
        >
          تغيير المستوى
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'playing' | 'answering' | 'feedback'

export default function ListenPage() {
  // ── Level selection ──────────────────────────────────────────────────────
  const [selectedLevel, setSelectedLevel] = useState<Difficulty | null>(null)

  // ── Session clips ────────────────────────────────────────────────────────
  const [session, setSession] = useState<Clip[]>([])
  const [clipIdx, setClipIdx] = useState(0)
  const clip: Clip | undefined = session[clipIdx]

  // ── Score ─────────────────────────────────────────────────────────────────
  const [score, setScore] = useState({ correct: 0, total: 0 })

  // ── Learning flow ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('playing')
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  // ── Player ────────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed]         = useState<Speed>(1)
  const [ytReady, setYtReady]     = useState(false)

  // ── Monetisation ─────────────────────────────────────────────────────────
  const [dailyCount, setDailyCount] = useState(0)
  const [isPremium]                  = useState(false)
  const limitReached                 = !isPremium && dailyCount >= FREE_DAILY_LIMIT

  // ── Refs ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef    = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const endTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Start session when level selected ────────────────────────────────────
  const startSession = useCallback((level: Difficulty) => {
    const clips = buildSession(level)
    setSession(clips)
    setClipIdx(0)
    setScore({ correct: 0, total: 0 })
    setPhase('playing')
    setSelected(null)
    setIsCorrect(false)
    setSessionDone(false)
    setSelectedLevel(level)
  }, [])

  // ── Load YouTube IFrame API ───────────────────────────────────────────────
  useEffect(() => {
    setDailyCount(getDailyCount())
    if (window.YT?.Player) { setYtReady(true); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
  }, [])

  // ── Schedule auto-switch to answering after clip ends ────────────────────
  const scheduleEnd = useCallback((clipEnd: number, clipStart: number, currentSpeed: Speed) => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    const duration = (clipEnd - clipStart) / currentSpeed
    endTimerRef.current = setTimeout(() => {
      setIsPlaying(false)
      setPhase('answering')
    }, (duration + 0.5) * 1000)
  }, [])

  // ── Initialise player ─────────────────────────────────────────────────────
  const initPlayer = useCallback((c: Clip) => {
    if (!containerRef.current || !window.YT?.Player) return
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch { /* ignore */ }
      playerRef.current = null
    }
    const div = document.createElement('div')
    div.id = 'yt-player'
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(div)

    playerRef.current = new window.YT.Player('yt-player', {
      videoId: c.videoId,
      width:   '100%',
      height:  '100%',
      playerVars: {
        start: c.start, end: c.end,
        autoplay: 1, controls: 0,
        modestbranding: 1, rel: 0, fs: 0,
        iv_load_policy: 3, cc_load_policy: 0, playsinline: 1,
      },
      events: {
        onReady: (e: { target: { setPlaybackRate: (s: number) => void; playVideo: () => void } }) => {
          e.target.setPlaybackRate(speed)
          e.target.playVideo()
          setIsPlaying(true)
          scheduleEnd(c.end, c.start, speed)
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === 1) setIsPlaying(true)
          if (e.data === 2 || e.data === 0) setIsPlaying(false)
        },
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])

  useEffect(() => {
    if (!ytReady || !clip) return
    setPhase('playing')
    setSelected(null)
    setIsPlaying(false)
    initPlayer(clip)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, clipIdx, session])

  // Cleanup timer
  useEffect(() => () => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
  }, [])

  // ── Player controls ───────────────────────────────────────────────────────
  const replay = useCallback(() => {
    if (!playerRef.current || !clip) return
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    playerRef.current.seekTo(clip.start, true)
    playerRef.current.setPlaybackRate(speed)
    playerRef.current.playVideo()
    setIsPlaying(true)
    scheduleEnd(clip.end, clip.start, speed)
  }, [clip, speed, scheduleEnd])

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !clip) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
    } else {
      playerRef.current.seekTo(clip.start, true)
      playerRef.current.setPlaybackRate(speed)
      playerRef.current.playVideo()
      scheduleEnd(clip.end, clip.start, speed)
    }
  }, [isPlaying, clip, speed, scheduleEnd])

  const changeSpeed = useCallback((s: Speed) => {
    setSpeed(s)
    if (playerRef.current) playerRef.current.setPlaybackRate(s)
  }, [])

  // ── Answer selection ──────────────────────────────────────────────────────
  const handleSelect = useCallback((i: number) => {
    if (phase !== 'answering' || !clip) return
    setSelected(i)
    const correct = i === clip.correctIndex
    setIsCorrect(correct)
    setPhase('feedback')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    playSound(correct ? 'correct' : 'wrong')
    const newCount = incrementDailyCount()
    setDailyCount(newCount)
  }, [phase, clip])

  // ── Next clip ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (clipIdx < session.length - 1) {
      setClipIdx(i => i + 1)
    } else {
      setSessionDone(true)
    }
  }, [clipIdx, session.length])

  // ── Ready button (playing → answering) ───────────────────────────────────
  const handleReady = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    if (playerRef.current) {
      try { playerRef.current.pauseVideo() } catch { /* ignore */ }
    }
    setIsPlaying(false)
    setPhase('answering')
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const xpForResult = isCorrect ? 10 : 3
  const cfg = selectedLevel ? DIFFICULTY_CONFIG[selectedLevel] : null

  // ─── Level select ─────────────────────────────────────────────────────────
  if (!selectedLevel) {
    return <LevelSelectScreen onSelect={startSession} />
  }

  // ─── Session done ─────────────────────────────────────────────────────────
  if (sessionDone) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)' }}
        dir="rtl"
      >
        <div className="w-full max-w-md px-4">
          <SessionComplete
            correct={score.correct}
            total={score.total}
            level={selectedLevel}
            onRestart={() => startSession(selectedLevel)}
            onChangeLevel={() => setSelectedLevel(null)}
          />
        </div>
      </div>
    )
  }

  // ─── Daily limit ──────────────────────────────────────────────────────────
  if (limitReached) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)' }}
        dir="rtl"
      >
        <div className="w-full max-w-md px-4">
          <DailyLimitWall />
        </div>
      </div>
    )
  }

  // ─── Practice screen ──────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70%     { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
        }
        .animate-fadeUp { animation: fadeUp 0.3s ease-out both; }
        .pulse-ring     { animation: pulseRing 1.5s ease-out infinite; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)' }}
        dir="rtl"
      >
        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="pt-20 pb-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <ProgressBar
                current={clipIdx + 1}
                total={session.length}
                dailyCount={dailyCount}
                isPremium={isPremium}
              />
            </div>
            <button
              onClick={() => setSelectedLevel(null)}
              className="text-white/30 hover:text-white/60 text-xs font-semibold border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 transition-all whitespace-nowrap"
            >
              تغيير المستوى
            </button>
          </div>
        </div>

        {/* ── Split layout ──────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:items-start">

            {/* ── LEFT: Video player (100% mobile, 60% desktop) ───────────── */}
            <div className="w-full lg:w-[60%] shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Metadata bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  {cfg && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                      {cfg.icon} {cfg.label} · {cfg.sublabel}
                    </span>
                  )}
                  {clip && (
                    <span className="text-white/25 text-xs">{clip.showTitle}</span>
                  )}
                </div>

                {/* YouTube player */}
                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={togglePlay}
                  />
                  <div
                    ref={containerRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  {!ytReady && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {!isPlaying && ytReady && (
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 pulse-ring">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="px-4 py-3.5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={togglePlay}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        isPlaying ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isPlaying ? <><Pause size={14} /> إيقاف</> : <><Play size={14} /> تشغيل</>}
                    </button>
                    <button
                      onClick={replay}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all active:scale-95"
                    >
                      <RotateCcw size={14} /> إعادة
                    </button>
                    <span className="text-white/25 text-xs">استمع كم مرة تريد</span>
                  </div>

                  <SpeedControl speed={speed} onChange={changeSpeed} />

                  {clip?.arabicHint && (
                    <div className="flex items-center gap-1.5 text-white/30 text-xs bg-white/5 rounded-lg px-3 py-1.5">
                      <span className="text-blue-400">💡</span>
                      <span>المجال: {clip.arabicHint}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ready button — visible on mobile only below video */}
              {phase === 'playing' && (
                <div className="lg:hidden mt-3 animate-fadeUp">
                  <button
                    onClick={handleReady}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    اختر الإجابة <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Quiz panel (100% mobile, 40% desktop) ────────────── */}
            <div className="w-full lg:flex-1 flex flex-col gap-4">

              {/* Score */}
              <ScoreDisplay correct={score.correct} total={score.total} level={selectedLevel} />

              {/* Playing phase — desktop ready button */}
              {phase === 'playing' && (
                <div className="hidden lg:block animate-fadeUp">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-white/40 text-sm mb-5 leading-relaxed">
                      🎧 استمع جيداً للجملة<br/>
                      <span className="text-white/25 text-xs">يمكنك الإعادة كم مرة تريد</span>
                    </p>
                    <button
                      onClick={handleReady}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      اختر الإجابة <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* MCQ */}
              {(phase === 'answering' || phase === 'feedback') && clip && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-fadeUp">
                  <MCQOptions
                    clip={clip}
                    selected={selected}
                    phase={phase === 'feedback' ? 'feedback' : 'answering'}
                    onSelect={handleSelect}
                  />
                </div>
              )}

              {/* Feedback */}
              {phase === 'feedback' && clip && (
                <div className="animate-fadeUp space-y-3">
                  <FeedbackBanner
                    isCorrect={isCorrect}
                    correctSentence={clip.sentence}
                    xp={xpForResult}
                  />

                  <div className="flex gap-2">
                    {!isCorrect && (
                      <button
                        onClick={replay}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm font-bold border border-white/15 active:scale-95 transition-all"
                      >
                        <RotateCcw size={13} /> استمع مجدداً
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className={`flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl text-white font-black text-sm shadow-lg active:scale-95 transition-all bg-gradient-to-r ${cfg?.gradient ?? 'from-blue-500 to-indigo-600'} ${isCorrect ? 'flex-1' : ''}`}
                    >
                      {clipIdx < session.length - 1
                        ? <>التالي <ChevronRight size={15} /></>
                        : '🏆 إنهاء الجلسة'}
                    </button>
                  </div>
                </div>
              )}

              {/* Premium strip */}
              {!isPremium && phase !== 'feedback' && (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-amber-300 font-bold text-xs flex items-center gap-1">
                      <Crown size={12} /> Premium
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">وصول غير محدود + جميع المستويات</p>
                  </div>
                  <Link
                    href="/courses"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                  >
                    ارقَّ الآن
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
