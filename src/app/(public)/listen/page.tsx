'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  RotateCcw, ChevronRight,
  CheckCircle2, XCircle, Headphones,
  ChevronLeft, AlertCircle,
} from 'lucide-react'
import { type ContentItem, type ContentLevel } from '@/lib/content-store'
import { fetchPublishedContent } from '@/lib/supabase-content'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

type Phase     = 'playing' | 'answering' | 'feedback'
type Screen    = 'level-select' | 'practice' | 'session-end' | 'no-content'
type FlashType = 'correct' | 'wrong' | null

const STREAK_KEY       = 'inglizi_streak'

const LEVEL_META: Record<ContentLevel, {
  emoji: string; ar: string; desc: string
  ring: string; bg: string; text: string; bar: string
}> = {
  A1: {
    emoji: '🌱', ar: 'مبتدئ',       desc: 'كلمات وجمل بسيطة جداً',
    ring: 'ring-emerald-500', bg: 'bg-emerald-500/10',
    text: 'text-emerald-400', bar: 'bg-emerald-500',
  },
  A2: {
    emoji: '⭐', ar: 'أساسي',       desc: 'جمل يومية وتعابير شائعة',
    ring: 'ring-amber-500',   bg: 'bg-amber-500/10',
    text: 'text-amber-400',   bar: 'bg-amber-500',
  },
  B1: {
    emoji: '🚀', ar: 'متوسط',       desc: 'حوارات طبيعية وتعابير متنوعة',
    ring: 'ring-violet-500',  bg: 'bg-violet-500/10',
    text: 'text-violet-400',  bar: 'bg-violet-500',
  },
  B2: {
    emoji: '🔥', ar: 'فوق المتوسط', desc: 'خطاب سريع، مفردات أكاديمية',
    ring: 'ring-rose-500',    bg: 'bg-rose-500/10',
    text: 'text-rose-400',    bar: 'bg-rose-500',
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

function filterByLevel(items: ContentItem[], level: ContentLevel): ContentItem[] {
  return items.filter(c => c.level === level)
}

function playTone(type: 'correct' | 'wrong') {
  if (typeof window === 'undefined') return
  try {
    const src = type === 'correct' ? '/sounds/correct.wav' : '/sounds/wrong.wav'
    const audio = new Audio(src)
    audio.volume = 0.55
    audio.play().catch(() => {/* autoplay blocked — silent fail */})
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR CHUNKS SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

interface Chunk { en: string; ar?: string }

const CHUNK_COLORS = [
  { bg: 'bg-blue-500/20',   ring: 'bg-blue-500/40',   text: 'text-blue-300',   border: 'border-blue-500/35'   },
  { bg: 'bg-green-500/20',  ring: 'bg-green-500/40',  text: 'text-green-300',  border: 'border-green-500/35'  },
  { bg: 'bg-purple-500/20', ring: 'bg-purple-500/40', text: 'text-purple-300', border: 'border-purple-500/35' },
  { bg: 'bg-orange-500/20', ring: 'bg-orange-500/40', text: 'text-orange-300', border: 'border-orange-500/35' },
]

/**
 * Split any text into exactly N roughly equal word-groups.
 */
function splitIntoN(text: string, n: number): string[] {
  const words = text.trim().split(/\s+/)
  if (n <= 1 || words.length <= n) return [text.trim()]
  const result: string[] = []
  const base = Math.floor(words.length / n)
  let rem = words.length % n
  let start = 0
  for (let i = 0; i < n; i++) {
    const size = base + (rem-- > 0 ? 1 : 0)
    result.push(words.slice(start, start + size).join(' '))
    start += size
  }
  return result
}

/**
 * Build paired EN↔AR chunks for ColorChunks.
 * Arabic is split into the same number of parts as English.
 */
function buildChunks(enSentence: string, arSentence?: string): Chunk[] {
  const enParts = autoChunk(enSentence)
  if (!arSentence?.trim()) return enParts.map(en => ({ en }))
  const arParts = splitIntoN(arSentence.trim(), enParts.length)
  return enParts.map((en, i) => ({ en, ar: arParts[i] ?? '' }))
}

/**
 * Split an English sentence into 2-4 meaningful chunks.
 * Tries natural break points first; falls back to even halves.
 */
function autoChunk(sentence: string): string[] {
  // 1. Split at commas
  const byComma = sentence.split(/,\s+/)
  if (byComma.length >= 2 && byComma.length <= 4) return byComma

  // 2. Split at common phrase-boundary words
  const boundary = /\b(and|or|but|because|when|if|that|which|while|so|after|before|until|since|though|although|however|to|with)\b/i
  const m = sentence.match(boundary)
  if (m && m.index && m.index > 3 && m.index < sentence.length - 3) {
    const idx = m.index
    return [sentence.slice(0, idx).trim(), sentence.slice(idx).trim()]
  }

  // 3. Split into 2 roughly equal word groups
  const words = sentence.split(' ')
  if (words.length <= 2) return [sentence]
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

function ColorChunks({ chunks }: { chunks: Chunk[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (chunks.length === 0) return null

  const hasArabic = chunks.some(c => c.ar && c.ar.trim().length > 0)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <p className="text-white/25 text-[10px] font-semibold mb-3 text-center tracking-widest uppercase">
        Color Chunks · التفكيك اللوني
      </p>

      <div className="space-y-2">
        {chunks.map((c, i) => {
          const col    = CHUNK_COLORS[i % CHUNK_COLORS.length]
          const active = activeIdx === i
          const shared = `
            px-3 py-2 rounded-xl text-sm font-semibold border cursor-default
            transition-all duration-200 select-none chunk-fade-in
            ${active ? col.ring : col.bg} ${col.text} ${col.border}
          `
          return (
            <div
              key={i}
              className={`grid gap-2 ${hasArabic ? 'grid-cols-2' : 'grid-cols-1'}`}
              style={{ animationDelay: `${i * 80}ms` }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onPointerDown={() => setActiveIdx(prev => prev === i ? null : i)}
            >
              {/* EN */}
              <span className={shared} dir="ltr">{c.en}</span>

              {/* AR — same color, right-aligned */}
              {hasArabic && (
                <span className={shared} dir="rtl">
                  {c.ar ?? '—'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: LEVEL SELECT
// ─────────────────────────────────────────────────────────────────────────────

function LevelSelectScreen({ onSelect, allContent }: {
  onSelect: (d: ContentLevel) => void
  allContent: ContentItem[]
}) {
  const counts: Record<ContentLevel, number> = {
    A1: allContent.filter(c => c.level === 'A1').length,
    A2: allContent.filter(c => c.level === 'A2').length,
    B1: allContent.filter(c => c.level === 'B1').length,
    B2: allContent.filter(c => c.level === 'B2').length,
  }

  const levels: ContentLevel[] = ['A1', 'A2', 'B1', 'B2']
  const total = Object.values(counts).reduce((s, n) => s + n, 0)

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
          اسمع الجملة، افهمها، واختر الإجابة الصحيحة
        </p>
      </div>

      {total === 0 ? (
        /* ── No content at all ── */
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
          <p className="text-white/60 font-bold mb-1">لا يوجد محتوى منشور</p>
          <p className="text-white/30 text-sm mb-6 leading-relaxed">
            أضف محتوى من لوحة الإدارة وانشره حتى يظهر هنا.
          </p>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95"
          >
            الذهاب للوحة الإدارة
          </Link>
        </div>
      ) : (
        <>
          {/* Level cards grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {levels.map(level => {
              const m     = LEVEL_META[level]
              const count = counts[level]
              const empty = count === 0
              return (
                <button
                  key={level}
                  onClick={() => !empty && onSelect(level)}
                  disabled={empty}
                  className={`
                    group flex flex-col items-center text-center
                    p-6 rounded-2xl border border-white/10
                    ${m.bg} transition-all duration-200
                    ${empty
                      ? 'opacity-35 cursor-not-allowed'
                      : `hover:ring-2 ${m.ring} hover:ring-offset-0 active:scale-[0.96]`}
                  `}
                >
                  <span className="text-3xl mb-2.5">{m.emoji}</span>
                  <span className={`text-2xl font-black ${m.text} mb-0.5`}>{level}</span>
                  <span className="text-white/60 text-xs font-semibold mb-2">{m.ar}</span>
                  <span className="text-white/25 text-[11px]">
                    {empty ? 'لا يوجد محتوى' : `${count} تمرين`}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-white/20 text-xs mt-8">يمكنك تغيير المستوى في أي وقت</p>
        </>
      )}
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
  correct: number; total: number; level: ContentLevel
  onRestart: () => void; onChangeLevel: () => void
}) {
  const m     = LEVEL_META[level]
  const pct   = total ? Math.round((correct / total) * 100) : 0
  const trophy = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'
  const msg    = pct >= 90 ? 'ممتاز! أداء مثالي' : pct >= 70 ? 'جيد جداً! استمر' : pct >= 50 ? 'على الطريق الصحيح' : 'تحتاج مزيداً من التدريب'

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center" dir="rtl">
      <div className="text-6xl mb-5">{trophy}</div>
      <h2 className="text-2xl font-black text-white mb-1">{msg}</h2>
      <p className="text-white/40 text-sm mb-6">مستوى {level} · {m.ar}</p>

      <div className={`w-32 h-32 rounded-full border-4 ${m.ring.replace('ring-', 'border-')} flex flex-col items-center justify-center mb-8`}>
        <span className={`text-4xl font-black ${m.text}`}>{correct}</span>
        <span className="text-white/30 text-sm font-bold">/ {total}</span>
      </div>

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
  clip: ContentItem
  onEnded: () => void
  videoRef: React.RefObject<HTMLVideoElement>
  phase: Phase
}

function VideoPlayer({
  clip, onEnded, videoRef, phase,
}: VideoPlayerProps) {
  const m   = LEVEL_META[clip.level]
  const url = clip.videoUrl ?? ''

  console.log("VIDEO URL:", clip.videoUrl)

  return (
    <div className="flex flex-col h-full">

      {/* ── Clip meta ── */}
      <div className="flex items-center justify-between px-1 mb-2 shrink-0">
        <span className="text-white/30 text-xs font-medium capitalize">{clip.lesson}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>
          {m.emoji} {clip.level}
        </span>
      </div>

      {/* ── Media frame ── */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>

        {/* Phase pill */}
        {phase === 'answering' && (
          <div className="absolute top-3 right-3 z-20 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
            🎧 اختر الإجابة
          </div>
        )}

        {/* No media fallback */}
        {!url && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="text-5xl opacity-20">🎧</div>
            <p className="text-white/30 text-sm font-semibold">لا يوجد فيديو</p>
          </div>
        )}
        {url && (
          <video
            ref={videoRef}
            key={url}
            controls
            src={url}
            playsInline
            preload="auto"
            onEnded={onEnded}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>

      {/* Hint text */}
      {url && (
        <p className="mt-2 text-center text-white/20 text-xs shrink-0">
          اضغط ▶ لتشغيل الفيديو — يمكنك الإعادة أكثر من مرة
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: QuizPanel
// ─────────────────────────────────────────────────────────────────────────────

interface QuizPanelProps {
  clip: ContentItem
  phase: Phase
  isCorrect: boolean
  wrongAttempts: number[]
  score: { correct: number; total: number }
  streak: number
  level: ContentLevel
  clipIdx: number
  sessionSize: number
  flash: FlashType
  onSelect: (i: number) => void
  onReady: () => void
  onNext: () => void
  onReplay: () => void
}

function QuizPanel({
  clip, phase, isCorrect, wrongAttempts,
  score, streak, level, clipIdx, sessionSize, flash,
  onSelect, onReady, onNext, onReplay,
}: QuizPanelProps) {
  const m       = LEVEL_META[level]
  const retries = wrongAttempts.length

  return (
    <div className="flex flex-col h-full gap-3" dir="rtl">

      {/* ── Flash overlay ── */}
      {flash && (
        <div className={`
          fixed inset-0 z-50 pointer-events-none transition-opacity duration-300
          ${flash === 'correct' ? 'bg-emerald-500/15' : 'bg-red-500/18'}
        `} />
      )}

      {/* ── Top row: Level + Score + Streak ── */}
      <div className="flex items-center justify-between shrink-0 gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 ${m.bg}`}>
          <span className="text-sm">{m.emoji}</span>
          <span className={`text-xs font-black ${m.text}`}>{level}</span>
          <span className="text-white/35 text-xs">· {m.ar}</span>
        </div>

        <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-xl px-2.5 py-1.5">
          <span className="text-white/35 text-xs">النتيجة</span>
          <span className={`text-sm font-black ${m.text}`}>{score.correct}</span>
          <span className="text-white/25 text-xs">/{score.total}</span>
        </div>

        <div className={`
          flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all
          ${streak >= 3 ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/5 border-white/10'}
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
                : i === clipIdx
                  ? (flash === 'correct' ? 'bg-emerald-400' : flash === 'wrong' ? 'bg-red-400' : 'bg-white/50')
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

      {/* ── Phase: feedback ── */}
      {phase === 'feedback' && (
        <div className="flex-1 flex flex-col justify-center gap-3">

          {/* ── Result banner ── */}
          {isCorrect ? (
            <div className="rounded-2xl border-2 px-4 py-3 bg-emerald-500/12 border-emerald-500/35">
              <div className="flex items-center gap-2 mb-0.5">
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                <span className="font-black text-sm text-emerald-300">
                  ممتاز! إجابة صحيحة 🎉
                </span>
                {streak >= 3 && (
                  <span className="mr-auto text-orange-300 text-xs font-black flex items-center gap-0.5">
                    🔥 {streak} متتالية
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 px-4 py-3 bg-red-500/12 border-red-500/35">
              <div className="flex items-center gap-2 mb-0.5">
                <XCircle size={17} className="text-red-400 shrink-0" />
                <span className="font-black text-sm text-red-300">
                  إجابة خاطئة — الجملة الصحيحة أدناه
                </span>
              </div>
            </div>
          )}

          {/* ── Correct sentence ── */}
          <div className="bg-white/8 rounded-xl px-4 py-3 border border-white/10" dir="ltr">
            <p className="text-white/35 text-[11px] mb-1.5 font-semibold uppercase tracking-wide">الجملة الصحيحة</p>
            <p className="text-white font-semibold text-sm leading-snug">{clip.sentence}</p>
          </div>

          {/* ── Sentence card (EN + AR) ── */}
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            {/* English */}
            <div className="bg-white/6 px-4 py-3 border-b border-white/8" dir="ltr">
              <p className="text-white/35 text-[11px] mb-1 font-semibold uppercase tracking-wide">الجملة بالإنجليزية</p>
              <p className="text-white font-bold text-base leading-snug">{clip.sentence}</p>
            </div>
            {/* Arabic */}
            <div className="bg-white/3 px-4 py-3" dir="rtl">
              <p className="text-white/35 text-[11px] mb-1 font-semibold uppercase tracking-wide">الترجمة بالعربية</p>
              <p className={`font-bold text-base leading-snug ${clip.arabicSentence ? 'text-amber-300' : 'text-white/20 italic text-sm'}`}>
                {clip.arabicSentence || 'لا توجد ترجمة'}
              </p>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-white/8 my-0.5" />

          {/* ── Options review ── */}
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

          {/* Next button */}
          <button
            onClick={onNext}
            className={`
              w-full flex items-center justify-center gap-2 py-4 rounded-2xl
              font-black text-white text-base shadow-xl active:scale-[0.97] transition-all
              ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}
            `}
          >
            {clipIdx < sessionSize - 1 ? 'التالي' : '🏁 إنهاء الجلسة'}
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ListenPage() {
  // ── Routing state ──────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('level-select')
  const [level,  setLevel]  = useState<ContentLevel>('A1')

  // ── Session ────────────────────────────────────────────────────────────────
  const [session, setSession] = useState<ContentItem[]>([])
  const [clipIdx, setClipIdx] = useState(0)
  const clip = session[clipIdx] as ContentItem | undefined

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [phase,         setPhase]         = useState<Phase>('playing')
  const [isCorrect,     setIsCorrect]     = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState<number[]>([])
  const [score,         setScore]         = useState({ correct: 0, total: 0 })
  const [streak,        setStreak]        = useState(0)
  const [flash,         setFlash]         = useState<FlashType>(null)

  // ── All published content (from Supabase) ────────────────────────────────
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  useEffect(() => { fetchPublishedContent().then(setAllContent) }, [])

  // ── Refs ───────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback((d: ContentLevel) => {
    const clips = filterByLevel(allContent, d)
    if (clips.length === 0) { setScreen('no-content'); setLevel(d); return }
    setLevel(d)
    setSession(clips)
    setClipIdx(0)
    setScore({ correct: 0, total: 0 })
    setPhase('playing')
    setWrongAttempts([])
    setStreak(loadStreak())
    setFlash(null)
    setScreen('practice')
  }, [allContent])

  // ── Init video when clip changes ───────────────────────────────────────────
  useEffect(() => {
    if (!clip || screen !== 'practice') return
    setPhase('playing')
    setIsCorrect(false)
    setWrongAttempts([])
    setFlash(null)
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {/* autoplay blocked — user can tap play */})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipIdx, session, screen])

  // ── Player controls ────────────────────────────────────────────────────────
  const replay = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
  }, [])

  const handleVideoEnded = useCallback(() => {
    setPhase('answering')
  }, [])

  // ── Quiz handlers ──────────────────────────────────────────────────────────
  const handleReady = useCallback(() => {
    if (videoRef.current) videoRef.current.pause()
    setPhase('answering')
  }, [])

  const handleSelect = useCallback((i: number) => {
    if (phase !== 'answering' || !clip) return

    const correct = i === clip.correctIndex

    setFlash(correct ? 'correct' : 'wrong')
    setTimeout(() => setFlash(null), 400)
    playTone(correct ? 'correct' : 'wrong')

    setIsCorrect(correct)
    setWrongAttempts(correct ? [] : [i])

    if (correct) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
      setStreak(s => { const next = s + 1; saveStreak(next); return next })
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }))
      setStreak(0)
      saveStreak(0)
    }

    setPhase('feedback')
  }, [phase, clip])

  const handleNext = useCallback(() => {
    if (clipIdx < session.length - 1) {
      setClipIdx(i => i + 1)
    } else {
      setScreen('session-end')
    }
  }, [clipIdx, session.length])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }

        @keyframes chunk-in {
          from { opacity: 0; transform: translateY(8px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .chunk-fade-in {
          animation: chunk-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
        }

      `}</style>

      <div
        className="min-h-[100dvh] flex flex-col"
        style={{ background: 'linear-gradient(140deg,#0c1120 0%,#131830 50%,#0c1120 100%)' }}
      >
        {screen === 'level-select' && <LevelSelectScreen onSelect={startSession} allContent={allContent} />}

        {screen === 'session-end' && (
          <SessionEndScreen
            correct={score.correct} total={score.total} level={level}
            onRestart={() => startSession(level)}
            onChangeLevel={() => setScreen('level-select')}
          />
        )}

        {/* ── No content for chosen level ── */}
        {screen === 'no-content' && (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center" dir="rtl">
            <AlertCircle size={48} className="text-amber-400/60 mb-5" />
            <h2 className="text-xl font-black text-white mb-2">لا يوجد محتوى لمستوى {level}</h2>
            <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
              لم يتم نشر أي تمارين لهذا المستوى بعد. أضف محتوى من لوحة الإدارة.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link
                href="/admin/content"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all active:scale-95"
              >
                الذهاب للوحة الإدارة
              </Link>
              <button
                onClick={() => setScreen('level-select')}
                className="py-3 rounded-2xl font-bold text-white/50 text-sm border border-white/12 hover:bg-white/5 transition-all"
              >
                اختر مستوى آخر
              </button>
            </div>
          </div>
        )}

        {/* ── Practice screen ── */}
        {screen === 'practice' && clip && (
          <>
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

            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto w-full px-4 pb-6 lg:pb-8 overflow-hidden">

              {/* LEFT / TOP: Video (60% desktop) */}
              <div className="w-full lg:w-[60%] shrink-0 flex flex-col">
                <VideoPlayer
                  clip={clip}
                  onEnded={handleVideoEnded}
                  videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                  phase={phase}
                />
              </div>

              {/* RIGHT / BOTTOM: Quiz (40% desktop) */}
              <div className="w-full lg:flex-1 flex flex-col min-h-0">
                <QuizPanel
                  clip={clip}
                  phase={phase}
                  isCorrect={isCorrect}
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
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
