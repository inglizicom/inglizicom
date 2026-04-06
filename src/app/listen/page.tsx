'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Play, Pause, RotateCcw, ChevronRight, Volume2,
  CheckCircle2, XCircle, Zap, Lock, Crown, Headphones,
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

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
  A1: { label: 'مبتدئ',   color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  A2: { label: 'أساسي',   color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/40' },
  B1: { label: 'متوسط',   color: 'text-violet-400',   bg: 'bg-violet-500/20 border-violet-500/40' },
}

// ─── Sound effects via Web Audio API ─────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressHeader({
  current, total, dailyCount, isPremium,
}: {
  current: number; total: number; dailyCount: number; isPremium: boolean
}) {
  const pct = Math.round((current / total) * 100)
  const remaining = FREE_DAILY_LIMIT - dailyCount

  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm font-semibold flex items-center gap-1.5">
          <Headphones size={14} className="text-blue-400" />
          تدريب الاستماع
        </span>
        <span className="text-white/50 text-sm">{current} / {total}</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Daily counter (free users) */}
      {!isPremium && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/30 text-xs">
            {remaining > 0
              ? `${remaining} محاولة متبقية اليوم`
              : 'وصلت للحد اليومي'}
          </span>
          <Link
            href="/courses"
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            <Crown size={11} /> ترقية للـ Premium
          </Link>
        </div>
      )}
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
      {difficulty} · {cfg.label}
    </span>
  )
}

function SpeedControl({ speed, onChange, locked }: {
  speed: Speed; onChange: (s: Speed) => void; locked?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <Volume2 size={13} className="text-white/40 shrink-0" />
      <span className="text-white/40 text-xs ml-1">السرعة:</span>
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => !locked && onChange(s)}
          disabled={locked}
          title={locked ? 'متاح للـ Premium' : ''}
          className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-all ${
            speed === s
              ? 'bg-blue-500 text-white'
              : locked
              ? 'text-white/20 cursor-not-allowed'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          {s}x
        </button>
      ))}
      {locked && <Lock size={11} className="text-amber-400 ml-1" />}
    </div>
  )
}

function MCQOptions({
  clip, selected, phase, onSelect,
}: {
  clip: Clip
  selected: number | null
  phase: 'answering' | 'feedback'
  onSelect: (i: number) => void
}) {
  return (
    <div className="w-full space-y-3 animate-fadeUp">
      <p className="text-white/60 text-sm text-center font-semibold mb-4">
        🎧 ماذا سمعت؟ اختر الإجابة الصحيحة
      </p>
      {clip.options.map((opt, i) => {
        const isCorrect = i === clip.correctIndex
        const isSelected = i === selected

        let stateClass = 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10 hover:border-white/30'
        if (phase === 'feedback') {
          if (isCorrect) stateClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
          else if (isSelected && !isCorrect) stateClass = 'bg-red-500/20 border-red-400 text-red-200'
          else stateClass = 'bg-white/5 border-white/10 text-white/30'
        } else if (isSelected) {
          stateClass = 'bg-blue-500/20 border-blue-400 text-blue-200'
        }

        return (
          <button
            key={i}
            onClick={() => phase === 'answering' && onSelect(i)}
            disabled={phase === 'feedback'}
            className={`w-full text-right px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 active:scale-98 ${stateClass}`}
            dir="ltr"
          >
            <span className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-left">{opt}</span>
              {phase === 'feedback' && isCorrect && (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              )}
              {phase === 'feedback' && isSelected && !isCorrect && (
                <XCircle size={18} className="text-red-400 shrink-0" />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FeedbackBanner({ isCorrect, correctSentence }: {
  isCorrect: boolean; correctSentence: string
}) {
  return (
    <div className={`w-full rounded-2xl px-5 py-4 border-2 animate-fadeUp ${
      isCorrect
        ? 'bg-emerald-500/15 border-emerald-500/40'
        : 'bg-red-500/15 border-red-500/40'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {isCorrect
          ? <CheckCircle2 size={18} className="text-emerald-400" />
          : <XCircle size={18} className="text-red-400" />}
        <span className={`font-black text-base ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
          {isCorrect ? 'ممتاز! إجابة صحيحة 🎉' : 'إجابة خاطئة ❌'}
        </span>
      </div>
      {!isCorrect && (
        <div className="mt-2 bg-white/10 rounded-xl px-4 py-2" dir="ltr">
          <p className="text-xs text-white/40 mb-1">الجملة الصحيحة:</p>
          <p className="text-white font-semibold text-sm">{correctSentence}</p>
        </div>
      )}
    </div>
  )
}

function DailyLimitWall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fadeUp">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-4xl mb-6">
        👑
      </div>
      <h2 className="text-2xl font-black text-white mb-3">انتهت محاولاتك اليومية</h2>
      <p className="text-white/50 mb-8 max-w-xs leading-relaxed">
        وصلت لـ{FREE_DAILY_LIMIT} فيديوهات مجانية اليوم. ارجع غداً أو ارقَّ للـ Premium للوصول غير المحدود.
      </p>
      <button
        onClick={onUpgrade}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:opacity-90 active:scale-95 transition-all mb-4"
      >
        <Crown size={20} /> ارقَّ للـ Premium
      </button>
      <p className="text-white/30 text-xs">وصول غير محدود · جميع المستويات · ميزات حصرية</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'playing' | 'answering' | 'feedback'

export default function ListenPage() {
  // ── Clip sequence (shuffled once per mount) ──────────────────────────────
  const allClips = useMemo(() => shuffleClips(CLIPS), [])
  const [clipIdx, setClipIdx]     = useState(0)
  const clip: Clip                 = allClips[clipIdx]

  // ── Learning flow state ──────────────────────────────────────────────────
  const [phase, setPhase]         = useState<Phase>('playing')
  const [selected, setSelected]   = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)

  // ── Player state ─────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed]         = useState<Speed>(1)
  const [autoplay, setAutoplay]   = useState(true)
  const [ytReady, setYtReady]     = useState(false)

  // ── Monetisation ─────────────────────────────────────────────────────────
  const [dailyCount, setDailyCount] = useState(0)
  const [isPremium]                  = useState(false) // connect to auth later
  const limitReached                 = !isPremium && dailyCount >= FREE_DAILY_LIMIT

  // ── Refs ─────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef    = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const endTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load YouTube IFrame API ───────────────────────────────────────────────
  useEffect(() => {
    setDailyCount(getDailyCount())

    if (window.YT?.Player) { setYtReady(true); return }

    const tag       = document.createElement('script')
    tag.src         = 'https://www.youtube.com/iframe_api'
    tag.async       = true
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => setYtReady(true)
  }, [])

  // ── Initialise / switch player when clip or ytReady changes ──────────────
  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player) return

    // Destroy existing player
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch { /* ignore */ }
      playerRef.current = null
    }

    // Reset container
    const div = document.createElement('div')
    div.id    = 'yt-player'
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(div)

    playerRef.current = new window.YT.Player('yt-player', {
      videoId: clip.videoId,
      width:   '100%',
      height:  '100%',
      playerVars: {
        start:          clip.start,
        end:            clip.end,
        autoplay:       autoplay ? 1 : 0,
        controls:       0,
        modestbranding: 1,
        rel:            0,
        fs:             0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        playsinline:    1,
      },
      events: {
        onReady: (e: { target: { setPlaybackRate: (s: number) => void; playVideo: () => void } }) => {
          e.target.setPlaybackRate(speed)
          if (autoplay) {
            e.target.playVideo()
            setIsPlaying(true)
            scheduleEnd()
          }
        },
        onStateChange: (e: { data: number }) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          if (e.data === 1) setIsPlaying(true)
          if (e.data === 2 || e.data === 0) setIsPlaying(false)
        },
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip.videoId, clip.start, clip.end, autoplay])

  useEffect(() => {
    if (!ytReady) return
    setPhase('playing')
    setSelected(null)
    setIsPlaying(false)
    initPlayer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, clipIdx])

  // ── Schedule auto-switch to answering phase after clip ends ──────────────
  const scheduleEnd = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    const duration = (clip.end - clip.start) / speed
    endTimerRef.current = setTimeout(() => {
      setIsPlaying(false)
      setPhase('answering')
    }, (duration + 0.5) * 1000)
  }, [clip.start, clip.end, speed])

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
  }, [])

  // ── Player controls ───────────────────────────────────────────────────────
  const replay = useCallback(() => {
    if (!playerRef.current) return
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    playerRef.current.seekTo(clip.start, true)
    playerRef.current.setPlaybackRate(speed)
    playerRef.current.playVideo()
    setIsPlaying(true)
    scheduleEnd()
  }, [clip.start, speed, scheduleEnd])

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
    } else {
      playerRef.current.seekTo(clip.start, true)
      playerRef.current.setPlaybackRate(speed)
      playerRef.current.playVideo()
      scheduleEnd()
    }
  }, [isPlaying, clip.start, speed, scheduleEnd])

  const changeSpeed = useCallback((s: Speed) => {
    setSpeed(s)
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(s)
    }
  }, [])

  // ── Answer selection ──────────────────────────────────────────────────────
  const handleSelect = useCallback((i: number) => {
    if (phase !== 'answering') return
    setSelected(i)
    const correct = i === clip.correctIndex
    setIsCorrect(correct)
    setPhase('feedback')
    playSound(correct ? 'correct' : 'wrong')

    // Increment daily counter
    const newCount = incrementDailyCount()
    setDailyCount(newCount)
  }, [phase, clip.correctIndex])

  // ── Next clip ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (clipIdx < allClips.length - 1) {
      setClipIdx(i => i + 1)
    } else {
      // Loop back to start with a new shuffle — in a real app, load more
      setClipIdx(0)
    }
  }, [clipIdx, allClips.length])

  // ── Reveal answer button (from playing phase) ─────────────────────────────
  const handleReady = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    if (playerRef.current) {
      try { playerRef.current.pauseVideo() } catch { /* ignore */ }
    }
    setIsPlaying(false)
    setPhase('answering')
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .animate-fadeUp { animation: fadeUp 0.35s ease-out both; }
        .pulse-ring      { animation: pulseRing 1.5s ease-out infinite; }
      `}</style>

      <div
        className="min-h-screen pb-16"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f172a 100%)' }}
        dir="rtl"
      >
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="pt-24 pb-6 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs text-blue-200 mb-4">
              <Headphones size={12} className="text-blue-400" /> تدريب على الاستماع
            </div>
            <h1 className="text-3xl font-black text-white mb-1">استمع وافهم 🎧</h1>
            <p className="text-white/50 text-sm">
              اسمع جملاً حقيقية من أفلام ومسلسلات — ثم اختر ما سمعته
            </p>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="max-w-lg mx-auto px-4">

          {/* Daily limit wall */}
          {limitReached ? (
            <DailyLimitWall onUpgrade={() => window.location.href = '/courses'} />
          ) : (
            <>
              <ProgressHeader
                current={clipIdx + 1}
                total={allClips.length}
                dailyCount={dailyCount}
                isPremium={isPremium}
              />

              {/* ── Video Card ─────────────────────────────────────────────── */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4 shadow-2xl">

                {/* Metadata bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                  <DifficultyBadge difficulty={clip.difficulty} />
                  <span className="text-white/30 text-xs">{clip.showTitle}</span>
                </div>

                {/* YouTube player */}
                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                  {/* Overlay to block YT controls & prevent click-through */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={togglePlay}
                  />

                  {/* Actual YT iframe container */}
                  <div
                    ref={containerRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  />

                  {/* Loading state */}
                  {!ytReady && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Big play/pause indicator overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {!isPlaying && ytReady && (
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 pulse-ring">
                        <Play size={28} className="text-white ml-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom controls bar */}
                <div className="px-5 py-4 space-y-4">
                  {/* Main control buttons */}
                  <div className="flex items-center gap-3">
                    {/* Play / Pause */}
                    <button
                      onClick={togglePlay}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        isPlaying
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isPlaying
                        ? <><Pause size={15} /> إيقاف</>
                        : <><Play  size={15} /> تشغيل</>}
                    </button>

                    {/* Replay */}
                    <button
                      onClick={replay}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all active:scale-95"
                    >
                      <RotateCcw size={15} /> إعادة
                    </button>

                    {/* Replay count badge */}
                    <span className="text-white/30 text-xs">استمع كم مرة تريد</span>
                  </div>

                  {/* Speed control */}
                  <SpeedControl
                    speed={speed}
                    onChange={changeSpeed}
                    locked={!isPremium && speed !== 1}  // free users can use all speeds but hint about premium
                  />

                  {/* Arabic hint */}
                  {clip.arabicHint && (
                    <div className="flex items-center gap-2 text-white/30 text-xs bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-blue-400">💡</span>
                      <span>المجال: {clip.arabicHint}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Phase: playing (before answering) ──────────────────────── */}
              {phase === 'playing' && (
                <div className="animate-fadeUp space-y-3">
                  <p className="text-center text-white/40 text-sm mb-4">
                    🎧 استمع جيداً للجملة — يمكنك الإعادة كم مرة تريد
                  </p>
                  <button
                    onClick={handleReady}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    اختر الإجابة <ChevronRight size={20} />
                  </button>

                  {/* Autoplay toggle */}
                  <button
                    onClick={() => setAutoplay(v => !v)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-sm font-semibold transition-all"
                  >
                    {autoplay ? '🔁 التشغيل التلقائي: مفعّل' : '▶️ التشغيل التلقائي: معطّل'}
                  </button>
                </div>
              )}

              {/* ── Phase: answering ────────────────────────────────────────── */}
              {phase === 'answering' && (
                <MCQOptions
                  clip={clip}
                  selected={selected}
                  phase="answering"
                  onSelect={handleSelect}
                />
              )}

              {/* ── Phase: feedback ─────────────────────────────────────────── */}
              {phase === 'feedback' && (
                <div className="space-y-4 animate-fadeUp">
                  <MCQOptions
                    clip={clip}
                    selected={selected}
                    phase="feedback"
                    onSelect={() => {}}
                  />

                  <FeedbackBanner
                    isCorrect={isCorrect}
                    correctSentence={clip.sentence}
                  />

                  {/* XP gained */}
                  <div className="flex items-center justify-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-amber-300 font-black text-sm">
                      +{isCorrect ? 10 : 3} XP
                    </span>
                    {!isCorrect && (
                      <button
                        onClick={replay}
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold border border-blue-400/40 rounded-lg px-3 py-1 hover:bg-blue-400/10 transition-all mr-2"
                      >
                        <RotateCcw size={11} /> استمع مجدداً
                      </button>
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {clipIdx < allClips.length - 1
                      ? <>الفيديو التالي <ChevronRight size={20} /></>
                      : '🏆 إعادة الجلسة'}
                  </button>
                </div>
              )}

              {/* ── Premium upsell strip (non-intrusive) ────────────────────── */}
              {!isPremium && phase !== 'feedback' && (
                <div className="mt-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
                      <Crown size={14} /> Premium
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">وصول غير محدود + جميع المستويات</p>
                  </div>
                  <Link
                    href="/courses"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap"
                  >
                    ارقَّ الآن
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
