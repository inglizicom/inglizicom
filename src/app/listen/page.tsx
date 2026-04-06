'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Play, Pause, RotateCcw, ChevronRight,
  CheckCircle2, XCircle, Crown, Headphones,
  Volume2, ChevronLeft,
} from 'lucide-react'
import {
  CLIPS, CORE_EXERCISES, FREE_DAILY_LIMIT,
  getDailyCount, incrementDailyCount, shuffleClips,
  type Clip, type Difficulty,
} from '@/lib/listen-clips'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

type Speed     = 0.5 | 0.75 | 1 | 1.25
type Phase     = 'playing' | 'answering' | 'feedback'
type Screen    = 'level-select' | 'practice' | 'session-end' | 'limit-wall'
type FlashType = 'correct' | 'wrong' | null

const SPEEDS: Speed[] = [0.5, 0.75, 1, 1.25]
const SESSION_SIZE    = 10
const STREAK_KEY      = 'inglizi_streak'

const LEVEL_META: Record<Difficulty, {
  emoji: string; ar: string; desc: string
  ring: string; bg: string; text: string; bar: string
}> = {
  A1: {
    emoji: '🌱', ar: 'مبتدئ',      desc: 'كلمات وجمل بسيطة جداً',
    ring: 'ring-emerald-500',       bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',       bar: 'bg-emerald-500',
  },
  A2: {
    emoji: '⭐', ar: 'أساسي',      desc: 'جمل يومية وتعابير شائعة',
    ring: 'ring-amber-500',         bg: 'bg-amber-500/10',
    text: 'text-amber-400',         bar: 'bg-amber-500',
  },
  B1: {
    emoji: '🚀', ar: 'متوسط',      desc: 'حوارات طبيعية وتعابير متنوعة',
    ring: 'ring-violet-500',        bg: 'bg-violet-500/10',
    text: 'text-violet-400',        bar: 'bg-violet-500',
  },
  B2: {
    emoji: '🔥', ar: 'فوق المتوسط', desc: 'خطاب سريع، مفردات أكاديمية',
    ring: 'ring-rose-500',          bg: 'bg-rose-500/10',
    text: 'text-rose-400',          bar: 'bg-rose-500',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface StreakData { count: number; lastDate: string }

function todayISO() { return new Date().toISOString().slice(0, 10) }

function loadStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return 0
    const d: StreakData = JSON.parse(raw)
    // Streak resets if more than 1 day has passed
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yISO = yesterday.toISOString().slice(0, 10)
    if (d.lastDate === todayISO() || d.lastDate === yISO) return d.count
    return 0
  } catch { return 0 }
}

function saveStreak(count: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count, lastDate: todayISO() }))
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function buildSession(level: Difficulty): Clip[] {
  const isValid = (c: Clip) => c.options[c.correctIndex] === c.sentence
  const core    = CORE_EXERCISES.filter(c => c.difficulty === level && isValid(c))
  const rest    = shuffleClips(CLIPS.filter(c => c.difficulty === level && isValid(c)))
  // Core exercises always come first; fill remainder from the shuffled pool
  const combined = [...core, ...rest.filter(c => !core.find(x => x.id === c.id))]
  return combined.slice(0, SESSION_SIZE)
}

function playTone(type: 'correct' | 'wrong') {
  if (typeof window === 'undefined') return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx  = new AC()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
      osc.start(); osc.stop(ctx.currentTime + 0.55)
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    }
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: LEVEL SELECT
// ─────────────────────────────────────────────────────────────────────────────

function LevelSelectScreen({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  const levels: Difficulty[] = ['A1', 'A2', 'B1', 'B2']

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-5 pb-10" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-xs text-blue-300 mb-5 font-medium">
          <Headphones size={13} className="text-blue-400" />
          تدريب الاستماع
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
          اختر مستواك
        </h1>
        <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
          {SESSION_SIZE} جمل مصغاة من مصادر حقيقية — اسمع، افهم، واختر
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {levels.map(level => {
          const m = LEVEL_META[level]
          const count = CLIPS.filter(c => c.difficulty === level).length
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`
                group flex flex-col items-center text-center
                p-6 rounded-2xl border border-white/10
                ${m.bg} hover:ring-2 ${m.ring} hover:ring-offset-0
                active:scale-[0.96] transition-all duration-200
              `}
            >
              <span className="text-3xl mb-2.5">{m.emoji}</span>
              <span className={`text-2xl font-black ${m.text} mb-0.5`}>{level}</span>
              <span className="text-white/60 text-xs font-semibold mb-2">{m.ar}</span>
              <span className="text-white/25 text-[11px]">{count} مقطع</span>
            </button>
          )
        })}
      </div>

      <p className="text-white/20 text-xs mt-8">يمكنك تغيير المستوى في أي وقت</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: SESSION END
// ─────────────────────────────────────────────────────────────────────────────

function SessionEndScreen({
  correct, total, level,
  onRestart, onChangeLevel,
}: {
  correct: number; total: number; level: Difficulty
  onRestart: () => void; onChangeLevel: () => void
}) {
  const m   = LEVEL_META[level]
  const pct = total ? Math.round((correct / total) * 100) : 0
  const trophy = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'
  const msg    = pct >= 90 ? 'ممتاز! أداء مثالي' : pct >= 70 ? 'جيد جداً! استمر' : pct >= 50 ? 'على الطريق الصحيح' : 'تحتاج مزيداً من التدريب'

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center" dir="rtl">
      <div className="text-6xl mb-5">{trophy}</div>
      <h2 className="text-2xl font-black text-white mb-1">{msg}</h2>
      <p className="text-white/40 text-sm mb-6">مستوى {level} · {m.ar}</p>

      {/* Big score */}
      <div className={`w-32 h-32 rounded-full border-4 ${m.ring.replace('ring-', 'border-')} flex flex-col items-center justify-center mb-8`}>
        <span className={`text-4xl font-black ${m.text}`}>{correct}</span>
        <span className="text-white/30 text-sm font-bold">/ {total}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between text-xs text-white/30 mb-1.5">
          <span>دقة الإجابات</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${m.bar} rounded-full transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRestart}
          className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg active:scale-[0.97] transition-all ${m.bar}`}
        >
          إعادة نفس المستوى
        </button>
        <button
          onClick={onChangeLevel}
          className="w-full py-3.5 rounded-2xl font-bold text-white/60 text-sm border border-white/12 hover:bg-white/5 active:scale-[0.97] transition-all"
        >
          تغيير المستوى
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: VideoPlayer
// ─────────────────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  clip: Clip
  speed: Speed
  onSpeedChange: (s: Speed) => void
  onEnded: () => void
  playerRef: React.MutableRefObject<unknown>
  containerRef: React.RefObject<HTMLDivElement>
  ytReady: boolean
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void
  onReplay: () => void
  onTogglePlay: () => void
  phase: Phase
}

function VideoPlayer({
  clip, speed, onSpeedChange,
  containerRef, ytReady, isPlaying,
  onReplay, onTogglePlay, phase,
}: VideoPlayerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Clip meta ── */}
      <div className="flex items-center justify-between px-1 mb-2 shrink-0">
        <span className="text-white/30 text-xs font-medium">{clip.showTitle}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_META[clip.difficulty].bg} ${LEVEL_META[clip.difficulty].text}`}>
          {LEVEL_META[clip.difficulty].emoji} {clip.difficulty}
        </span>
      </div>

      {/* ── Video frame ── */}
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Transparent overlay — captures clicks, blocks YT UI */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={onTogglePlay}
        />

        {/* YouTube iframe container */}
        <div
          ref={containerRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Loading spinner */}
        {!ytReady && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Big play button overlay */}
        {!isPlaying && ytReady && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl animate-pulse-slow">
              <Play size={22} className="text-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Phase indicator pill */}
        {phase === 'answering' && (
          <div className="absolute top-3 right-3 z-20 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
            🎧 اختر الإجابة
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="mt-3 flex items-center justify-between shrink-0">
        {/* Play / Replay */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold
              transition-all active:scale-[0.95]
              ${isPlaying
                ? 'bg-white/15 text-white hover:bg-white/20'
                : 'bg-blue-600 text-white hover:bg-blue-500'}
            `}
          >
            {isPlaying ? <><Pause size={14} />إيقاف</> : <><Play size={14} />تشغيل</>}
          </button>

          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/70 hover:text-white text-sm font-bold transition-all active:scale-[0.95] border border-white/10"
          >
            <RotateCcw size={13} />إعادة
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          <Volume2 size={12} className="text-white/25 ml-0.5" />
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`
                text-xs font-bold px-2 py-1 rounded-lg transition-all
                ${speed === s
                  ? 'bg-white/20 text-white'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/8'}
              `}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ── Arabic hint ── */}
      {clip.arabicHint && (
        <div className="mt-2.5 flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-2 shrink-0">
          <span className="text-blue-400 text-xs">💡</span>
          <span className="text-white/30 text-xs">{clip.arabicHint}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: QuizPanel
// ─────────────────────────────────────────────────────────────────────────────

interface QuizPanelProps {
  clip: Clip
  phase: Phase

  wrongAttempts: number[]    // indices of wrong guesses this round
  score: { correct: number; total: number }
  streak: number
  level: Difficulty
  clipIdx: number
  sessionSize: number
  flash: FlashType
  onSelect: (i: number) => void
  onReady: () => void
  onNext: () => void
  onReplay: () => void
  isPremium: boolean
  dailyLeft: number
}

function QuizPanel({
  clip, phase, wrongAttempts,
  score, streak, level, clipIdx, sessionSize, flash,
  onSelect, onReady, onNext, onReplay,
  isPremium, dailyLeft,
}: QuizPanelProps) {
  const m = LEVEL_META[level]
  const retries = wrongAttempts.length

  return (
    <div className="flex flex-col h-full gap-3" dir="rtl">

      {/* ── Flash overlay ── */}
      {flash && (
        <div
          className={`
            fixed inset-0 z-50 pointer-events-none transition-opacity duration-300
            ${flash === 'correct' ? 'bg-emerald-500/15' : 'bg-red-500/18'}
          `}
        />
      )}

      {/* ── Top row: Level + Score + Streak ── */}
      <div className="flex items-center justify-between shrink-0 gap-2">
        {/* Level badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 ${m.bg}`}>
          <span className="text-sm">{m.emoji}</span>
          <span className={`text-xs font-black ${m.text}`}>{level}</span>
          <span className="text-white/35 text-xs">· {m.ar}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-xl px-2.5 py-1.5">
          <span className="text-white/35 text-xs">النتيجة</span>
          <span className={`text-sm font-black ${m.text}`}>{score.correct}</span>
          <span className="text-white/25 text-xs">/{score.total}</span>
        </div>

        {/* Streak */}
        <div className={`
          flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all
          ${streak >= 3
            ? 'bg-orange-500/20 border-orange-500/40'
            : 'bg-white/5 border-white/10'}
        `}>
          <span className="text-sm">{streak >= 5 ? '🔥' : streak >= 3 ? '⚡' : '✨'}</span>
          <span className={`text-sm font-black ${streak >= 3 ? 'text-orange-300' : 'text-white/40'}`}>
            {streak}
          </span>
        </div>
      </div>

      {/* ── Progress bar (segmented) ── */}
      <div className="flex items-center gap-1 shrink-0">
        {Array.from({ length: sessionSize }).map((_, i) => (
          <div
            key={i}
            className={`
              h-1.5 flex-1 rounded-full transition-all duration-500
              ${i < clipIdx ? m.bar
                : i === clipIdx ? (flash === 'correct' ? 'bg-emerald-400' : flash === 'wrong' ? 'bg-red-400' : 'bg-white/50')
                : 'bg-white/10'}
            `}
          />
        ))}
      </div>

      {/* ── Phase: playing ── */}
      {phase === 'playing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-pulse-slow">🎧</div>
            <p className="text-white/55 text-sm font-semibold">استمع للمقطع جيداً</p>
            <p className="text-white/25 text-xs mt-1.5">يمكنك الإعادة أكثر من مرة</p>
          </div>
          <button
            onClick={onReady}
            className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-xl active:scale-[0.97] transition-all"
          >
            اختر الإجابة
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* ── Phase: answering ── */}
      {phase === 'answering' && (
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-white/50 text-sm font-semibold">ماذا سمعت؟</p>
            {retries > 0 && (
              <span className="text-xs text-red-400/70 font-bold flex items-center gap-1">
                <RotateCcw size={11} /> {retries} {retries === 1 ? 'محاولة' : 'محاولات'}
              </span>
            )}
          </div>
          {clip.options.map((opt, i) => {
            const wasWrong = wrongAttempts.includes(i)
            return (
              <button
                key={i}
                onClick={() => !wasWrong && onSelect(i)}
                disabled={wasWrong}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  border-2 text-sm font-semibold text-left
                  transition-all duration-150
                  ${wasWrong
                    ? 'bg-red-500/8 border-red-500/20 text-red-400/40 cursor-not-allowed opacity-50'
                    : 'bg-white/5 border-white/12 text-white/85 hover:bg-white/10 hover:border-white/25 active:scale-[0.98]'}
                `}
                dir="ltr"
              >
                <span className={`
                  w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black
                  ${wasWrong ? 'bg-red-500/20 text-red-400/50' : 'bg-white/10 text-white/50'}
                `}>
                  {wasWrong ? <XCircle size={14} /> : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            )
          })}
          {/* Hint after 2 wrong attempts */}
          {retries >= 2 && (
            <button
              onClick={onReplay}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-bold active:scale-[0.97] transition-all mt-1"
            >
              <RotateCcw size={12} /> استمع مجدداً — المحاولة {retries + 1}
            </button>
          )}
        </div>
      )}

      {/* ── Phase: feedback (correct only — wrong stays in answering) ── */}
      {phase === 'feedback' && (
        <div className="flex-1 flex flex-col justify-center gap-3">
          {/* Result banner */}
          <div className="rounded-2xl border-2 px-4 py-4 bg-emerald-500/12 border-emerald-500/35">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="font-black text-sm text-emerald-300">
                {retries === 0 ? 'ممتاز! من أول مرة 🎉' : `صحيح! بعد ${retries} ${retries === 1 ? 'محاولة' : 'محاولات'} 💪`}
              </span>
              {streak >= 3 && (
                <span className="mr-auto text-orange-300 text-xs font-black flex items-center gap-0.5">
                  🔥 {streak} متتالية
                </span>
              )}
            </div>
            <div className="bg-white/8 rounded-xl px-3 py-2.5" dir="ltr">
              <p className="text-white/35 text-[11px] mb-1">الجملة الصحيحة:</p>
              <p className="text-white font-semibold text-sm leading-snug">{clip.sentence}</p>
            </div>
          </div>

          {/* Options (all revealed) */}
          <div className="space-y-2">
            {clip.options.map((opt, i) => {
              const isCorrectOpt  = i === clip.correctIndex
              const wasWrongGuess = wrongAttempts.includes(i)
              return (
                <div
                  key={i}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold
                    ${isCorrectOpt
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : wasWrongGuess
                      ? 'bg-red-500/10 border-red-500/25 text-red-300/60'
                      : 'bg-white/3 border-white/8 text-white/20'}
                  `}
                  dir="ltr"
                >
                  <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs">
                    {isCorrectOpt
                      ? <CheckCircle2 size={15} className="text-emerald-400" />
                      : wasWrongGuess
                      ? <XCircle size={15} className="text-red-400/60" />
                      : <span className="text-white/20 text-xs font-black">{String.fromCharCode(65 + i)}</span>}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </div>
              )
            })}
          </div>

          {/* Next — only enabled after correct */}
          <button
            onClick={onNext}
            className={`
              w-full flex items-center justify-center gap-2 py-4 rounded-2xl
              text-white font-black text-base shadow-lg active:scale-[0.97] transition-all
              ${m.bar}
            `}
          >
            {clipIdx < sessionSize - 1
              ? <>التالي <ChevronLeft size={18} /></>
              : '🏁 إنهاء الجلسة'}
          </button>
        </div>
      )}

      {/* ── Daily counter / premium ── */}
      {!isPremium && (
        <div className="shrink-0 flex items-center justify-between border-t border-white/8 pt-2.5">
          <span className="text-white/20 text-xs">
            {dailyLeft > 0 ? `${dailyLeft} محاولة متبقية` : 'انتهت المحاولات'}
          </span>
          <Link href="/courses" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors">
            <Crown size={11} /> Premium
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: DAILY LIMIT
// ─────────────────────────────────────────────────────────────────────────────

function LimitWallScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center" dir="rtl">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-4xl mb-6">👑</div>
      <h2 className="text-2xl font-black text-white mb-3">انتهت محاولاتك اليومية</h2>
      <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
        وصلت لـ {FREE_DAILY_LIMIT} فيديوهات مجانية اليوم. ارجع غداً أو ارقَّ للـ Premium للوصول غير المحدود.
      </p>
      <Link
        href="/courses"
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-4 rounded-2xl text-base shadow-xl hover:opacity-90 active:scale-95 transition-all mb-3"
      >
        <Crown size={18} /> ارقَّ للـ Premium
      </Link>
      <p className="text-white/20 text-xs">وصول غير محدود · جميع المستويات</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ListenPage() {
  // ── Routing state ──────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('level-select')
  const [level,  setLevel]  = useState<Difficulty>('A1')

  // ── Session ────────────────────────────────────────────────────────────────
  const [session,  setSession]  = useState<Clip[]>([])
  const [clipIdx,  setClipIdx]  = useState(0)
  const clip = session[clipIdx] as Clip | undefined

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [phase,         setPhase]         = useState<Phase>('playing')

  const [wrongAttempts, setWrongAttempts] = useState<number[]>([])
  const [score,         setScore]         = useState({ correct: 0, total: 0 })
  const [streak,        setStreak]        = useState<number>(0)
  const [flash,         setFlash]         = useState<FlashType>(null)

  // ── Player state ───────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed,     setSpeed]     = useState<Speed>(1)
  const [ytReady,   setYtReady]   = useState(false)

  // ── Monetisation ───────────────────────────────────────────────────────────
  const [dailyCount, setDailyCount] = useState(0)
  const isPremium = false
  const dailyLeft = Math.max(0, FREE_DAILY_LIMIT - dailyCount)

  // ── Refs ───────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef    = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const endTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef     = useRef<Speed>(1)

  // keep speedRef in sync
  useEffect(() => { speedRef.current = speed }, [speed])

  // ── Load YouTube IFrame API ────────────────────────────────────────────────
  useEffect(() => {
    setDailyCount(getDailyCount())
    if (window.YT?.Player) { setYtReady(true); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
  }, [])

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback((d: Difficulty) => {
    const clips = buildSession(d)
    setLevel(d)
    setSession(clips)
    setClipIdx(0)
    setScore({ correct: 0, total: 0 })
    setPhase('playing')
    setWrongAttempts([])
    setStreak(loadStreak())
    setFlash(null)
    setScreen('practice')
  }, [])

  // ── Schedule auto-transition playing → answering ──────────────────────────
  const scheduleEnd = useCallback((c: Clip, currentSpeed: Speed) => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    const duration = (c.end - c.start) / currentSpeed
    endTimerRef.current = setTimeout(() => {
      setIsPlaying(false)
      setPhase('answering')
    }, (duration + 0.5) * 1000)
  }, [])

  // ── Init YouTube player ────────────────────────────────────────────────────
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
      width: '100%', height: '100%',
      playerVars: {
        start: c.start, end: c.end,
        autoplay: 1, controls: 0,
        modestbranding: 1, rel: 0, fs: 0,
        iv_load_policy: 3, cc_load_policy: 0, playsinline: 1,
      },
      events: {
        onReady(e: { target: { setPlaybackRate: (s: number) => void; playVideo: () => void } }) {
          e.target.setPlaybackRate(speedRef.current)
          e.target.playVideo()
          setIsPlaying(true)
          scheduleEnd(c, speedRef.current)
        },
        onStateChange(e: { data: number }) {
          setIsPlaying(e.data === 1)
        },
      },
    })
  }, [scheduleEnd])

  // Re-init player when clip changes
  useEffect(() => {
    if (!ytReady || !clip || screen !== 'practice') return
    setPhase('playing')
    setWrongAttempts([])
    setFlash(null)
    setIsPlaying(false)
    initPlayer(clip)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, clipIdx, session, screen])

  // Cleanup
  useEffect(() => () => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
  }, [])

  // ── Player controls ────────────────────────────────────────────────────────
  const replay = useCallback(() => {
    if (!playerRef.current || !clip) return
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    playerRef.current.seekTo(clip.start, true)
    playerRef.current.setPlaybackRate(speedRef.current)
    playerRef.current.playVideo()
    setIsPlaying(true)
    scheduleEnd(clip, speedRef.current)
  }, [clip, scheduleEnd])

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !clip) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
    } else {
      playerRef.current.seekTo(clip.start, true)
      playerRef.current.setPlaybackRate(speedRef.current)
      playerRef.current.playVideo()
      scheduleEnd(clip, speedRef.current)
    }
  }, [isPlaying, clip, scheduleEnd])

  const changeSpeed = useCallback((s: Speed) => {
    setSpeed(s)
    speedRef.current = s
    if (playerRef.current) playerRef.current.setPlaybackRate(s)
  }, [])

  // ── Quiz handlers ──────────────────────────────────────────────────────────
  const handleReady = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    try { playerRef.current?.pauseVideo() } catch { /* ignore */ }
    setIsPlaying(false)
    setPhase('answering')
  }, [])

  const handleSelect = useCallback((i: number) => {
    if (phase !== 'answering' || !clip) return

    const correct = i === clip.correctIndex

    // Flash the screen
    setFlash(correct ? 'correct' : 'wrong')
    setTimeout(() => setFlash(null), 400)

    playTone(correct ? 'correct' : 'wrong')

    if (correct) {
      // ── Correct: advance to feedback, update score + streak ──────────────
      const firstTry = wrongAttempts.length === 0
      setScore(s => ({ correct: s.correct + (firstTry ? 1 : 0), total: s.total + 1 }))
      setStreak(s => {
        const next = s + 1
        saveStreak(next)
        return next
      })
      setPhase('feedback')
      setDailyCount(incrementDailyCount())
    } else {
      // ── Wrong: stay in answering, mark this option as used ───────────────
      setWrongAttempts(prev => [...prev, i])
      setStreak(0)
      saveStreak(0)
      // Auto-replay clip so learner hears it again
      setTimeout(() => {
        if (playerRef.current && clip) {
          try {
            playerRef.current.seekTo(clip.start, true)
            playerRef.current.setPlaybackRate(speedRef.current)
            playerRef.current.playVideo()
            setIsPlaying(true)
            scheduleEnd(clip, speedRef.current)
          } catch { /* ignore */ }
        }
      }, 600)
    }
  }, [phase, clip, wrongAttempts, scheduleEnd])

  const handleNext = useCallback(() => {
    if (!isPremium && dailyCount >= FREE_DAILY_LIMIT) {
      setScreen('limit-wall'); return
    }
    if (clipIdx < session.length - 1) {
      setClipIdx(i => i + 1)
    } else {
      setScreen('session-end')
    }
  }, [clipIdx, session.length, isPremium, dailyCount])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>

      <div
        className="min-h-[100dvh] flex flex-col"
        style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}
      >
        {/* ── Screens that take full viewport ────────────────────────────── */}
        {screen === 'level-select' && <LevelSelectScreen onSelect={startSession} />}
        {screen === 'session-end'  && (
          <SessionEndScreen
            correct={score.correct} total={score.total} level={level}
            onRestart={() => startSession(level)}
            onChangeLevel={() => setScreen('level-select')}
          />
        )}
        {screen === 'limit-wall' && <LimitWallScreen />}

        {/* ── Practice screen ─────────────────────────────────────────────── */}
        {screen === 'practice' && clip && (
          <>
            {/* Top bar */}
            <div className="pt-[72px] pb-3 px-4 shrink-0">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <button
                  onClick={() => setScreen('level-select')}
                  className="flex items-center gap-1 text-white/25 hover:text-white/50 text-xs font-semibold transition-colors"
                >
                  <ChevronRight size={14} /> تغيير المستوى
                </button>
                <span className="text-white/20 text-xs">
                  {clipIdx + 1} / {session.length}
                </span>
              </div>
            </div>

            {/* ── Desktop: split layout | Mobile: stacked ── */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto w-full px-4 pb-6 lg:pb-8 overflow-hidden">

              {/* ── LEFT / TOP: Video (60% desktop, auto mobile) ── */}
              <div className="w-full lg:w-[60%] shrink-0 flex flex-col">
                <VideoPlayer
                  clip={clip}
                  speed={speed}
                  onSpeedChange={changeSpeed}
                  onEnded={() => setPhase('answering')}
                  playerRef={playerRef}
                  containerRef={containerRef as React.RefObject<HTMLDivElement>}
                  ytReady={ytReady}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  onReplay={replay}
                  onTogglePlay={togglePlay}
                  phase={phase}
                />
              </div>

              {/* ── RIGHT / BOTTOM: Quiz (40% desktop, flex-1 mobile) ── */}
              <div className="w-full lg:flex-1 flex flex-col min-h-0">
                <QuizPanel
                  clip={clip}
                  phase={phase}

                  wrongAttempts={wrongAttempts}
                  score={score}
                  streak={streak}
                  level={level}
                  clipIdx={clipIdx}
                  sessionSize={session.length}
                  flash={flash}
                  onSelect={handleSelect}
                  onReady={handleReady}
                  onNext={handleNext}
                  onReplay={replay}
                  isPremium={isPremium}
                  dailyLeft={dailyLeft}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
