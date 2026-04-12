'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Volume2, Send, ChevronRight, ChevronLeft,
  MessageCircle, Zap, Star, BookOpen, Eye, EyeOff,
  CheckCircle2, XCircle, Loader2, Trophy,
  Sparkles, Lock, ArrowRight, RefreshCw,
} from 'lucide-react'
import type { EvaluateResponse, ChatResponse } from '@/app/api/practice/route'
import {
  type Sentence, type Level,
  getSessionSentences,
} from '@/lib/sentences'
import {
  getProgress, saveProgress, updateStreak, applyXP,
  markSentencesUsed, levelProgress, nextLevelInfo,
  type UserProgress,
} from '@/lib/practice-store'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type Screen = 'select' | 'reading' | 'writing' | 'translation' | 'chat' | 'results'

interface StepResult {
  xpEarned: number
  correct: number
  total: number
}

interface SessionState {
  level: Level
  sentences: Sentence[]
  results: {
    reading: StepResult
    writing: StepResult
    translation: StepResult
    chat: StepResult
  }
}

interface ChatMsg {
  id: string
  role: 'user' | 'ai'
  content: string
  correction: string | null
  correctedVersion: string | null
  encouragement: string | null
  isCorrect: boolean
  points: number
}

interface XpFloat { id: string; points: number }

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const LEVEL_CONFIG: Record<Level, {
  emoji: string; label: string; desc: string
  gradient: string; border: string; xpRequired: number
}> = {
  A1: {
    emoji: '🌱', label: 'A1', desc: 'مبتدئ',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-400', xpRequired: 0,
  },
  A2: {
    emoji: '⚡', label: 'A2', desc: 'أساسي',
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-400', xpRequired: 250,
  },
  B1: {
    emoji: '🚀', label: 'B1', desc: 'متوسط',
    gradient: 'from-violet-500 to-purple-600',
    border: 'border-violet-400', xpRequired: 600,
  },
}

const FEEDBACK_MESSAGES = {
  perfect:  ['ممتاز جداً! أداء مثالي! 🎉', 'رائع! أنت محترف حقيقي! 🌟', 'مثالي تماماً! فخورين بيك! 👑', 'وااو! نتيجة خرافية! 🔥'],
  good:     ['جيد جداً! كمّل هاد الطريق! 💪', 'عمل ممتاز! قربت للمثالية! 🎯', 'أنت تتحسن بسرعة ملحوظة! 📈'],
  ok:       ['بداية جيدة، واصل وستتحسن! 🔥', 'التدريب يصنع المعجزات! 💡', 'كل جلسة تقربك أكثر — لا تتوقف! ⭐'],
  tryAgain: ['الأخطاء جزء من التعلم — حاول مرة أخرى! 🔄', 'كل محاولة تجعلك أفضل! 📚', 'لا تستسلم، التكرار هو المفتاح! 🎯'],
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ═══════════════════════════════════════════════════════════════════
// TTS HELPER
// ═══════════════════════════════════════════════════════════════════

// In-memory cache: text → blob URL (persists for session, avoids re-fetching)
const ttsCache = new Map<string, string>()

async function fetchTTS(text: string): Promise<string> {
  if (ttsCache.has(text)) return ttsCache.get(text)!
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('TTS API failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  ttsCache.set(text, url)
  return url
}

// Fallback: best available browser voice (neural/natural voices prioritised)
function speakBrowserFallback(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-US'
  utt.rate = 0.88
  utt.pitch = 1.0
  const voices = window.speechSynthesis.getVoices()
  const PREFERRED = [
    /Microsoft.*Natural/i,
    /Microsoft Aria/i,
    /Microsoft Jenny/i,
    /Google US English/i,
    /Google.*English/i,
    /Samantha/i,
    /Karen/i,
    /Moira/i,
  ]
  let chosen: SpeechSynthesisVoice | undefined
  for (const pat of PREFERRED) {
    chosen = voices.find(v => v.lang.startsWith('en') && pat.test(v.name))
    if (chosen) break
  }
  chosen ??= voices.find(v => v.lang.startsWith('en-US')) ?? voices.find(v => v.lang.startsWith('en'))
  if (chosen) utt.voice = chosen
  window.speechSynthesis.speak(utt)
}

// ─── LOCAL VALIDATION (zero API calls) ───────────────────────────────────────

function normalizeText(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
}

function wordSimilarity(a: string, b: string): number {
  const wa = normalizeText(a).split(' ').filter(Boolean)
  const wb = normalizeText(b).split(' ').filter(Boolean)
  if (!wa.length || !wb.length) return 0
  let matches = 0
  wa.forEach(word => { if (wb.includes(word)) matches++ })
  const union = wa.length + wb.length - matches
  return union === 0 ? 0 : Math.round((matches / union) * 100)
}

function validateLocally(userAnswer: string, reference: string): EvaluateResponse {
  const trimmed = userAnswer.trim()
  if (!trimmed) {
    return { score: 0, isGood: false, feedback: 'لم تكتب إجابة.', corrections: [], betterVersion: reference, xpAwarded: 0 }
  }
  const score = wordSimilarity(trimmed, reference)
  const isGood = score >= 70
  const xp = score >= 90 ? 10 : score >= 75 ? 8 : score >= 55 ? 5 : 2
  return {
    score,
    isGood,
    feedback: isGood
      ? (score >= 90 ? 'ممتاز! إجابة مثالية — برافو عليك! 🎉' : 'جيد جداً! معظم الجملة صحيح، كمّل هكا! 💪')
      : (score >= 40 ? 'قريب! فيه فرق بسيط — قارن مع الجملة الصحيحة 🔄' : 'مش مشكل — راجع الجملة الصحيحة وحاول مرة أخرى 📖'),
    corrections: isGood ? [] : ['إجابتك مختلفة عن الجملة الأصلية — قارنها مع الصيغة الصحيحة أسفله.'],
    betterVersion: reference,
    xpAwarded: xp,
  }
}

function playSound(type: 'success' | 'error') {
  if (typeof window === 'undefined') return
  try {
    type AC = typeof AudioContext
    const AudioCtx: AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: AC }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (type === 'success') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } else {
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    }
  } catch { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════

type SpeakState = 'idle' | 'loading' | 'playing'

function SpeakBtn({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const [state, setState] = useState<SpeakState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleClick = async () => {
    // Stop if already playing
    if (state === 'playing') {
      audioRef.current?.pause()
      setState('idle')
      return
    }
    if (state === 'loading') return

    setState('loading')
    try {
      const url = await fetchTTS(text)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setState('idle')
      audio.onerror = () => { setState('idle'); speakBrowserFallback(text) }
      setState('playing')
      await audio.play()
    } catch {
      setState('idle')
      speakBrowserFallback(text)
    }
  }

  const active = state !== 'idle'
  const loading = state === 'loading'

  if (size === 'sm') {
    return (
      <button onClick={handleClick} title="استمع"
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold transition-all
          ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <Volume2 size={11} className={state === 'playing' ? 'animate-pulse' : ''} />}
        {loading ? '...' : '🔊'}
      </button>
    )
  }
  return (
    <button onClick={handleClick} title="استمع"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200
        ${active
          ? 'bg-blue-100 text-blue-700 scale-95'
          : 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:scale-105'
        }`}>
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <Volume2 size={15} className={state === 'playing' ? 'animate-pulse' : ''} />}
      {loading ? 'جاري...' : 'استمع'}
    </button>
  )
}

function ProgressBar({ screen, totalXP }: { screen: Screen; totalXP: number }) {
  const steps: Screen[] = ['reading', 'writing', 'translation', 'chat']
  const idx = steps.indexOf(screen)
  if (idx === -1 && screen !== 'results') return null

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 flex-1">
          <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${
            i < idx || screen === 'results' ? 'bg-emerald-400' :
            i === idx ? 'bg-blue-400' : 'bg-white/15'
          }`} />
          {i < steps.length - 1 && (
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              i < idx || screen === 'results' ? 'bg-emerald-400' : 'bg-white/20'
            }`} />
          )}
        </div>
      ))}
      <span className="text-white/60 text-xs font-bold shrink-0 ml-1">
        ⚡{totalXP}
      </span>
    </div>
  )
}

function XpToast({ floats }: { floats: XpFloat[] }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center gap-1">
      {floats.map(f => (
        <div key={f.id} className="animate-xpFloat bg-amber-400 text-amber-900 font-black text-sm px-4 py-1.5 rounded-full shadow-lg">
          +{f.points} XP ⚡
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 0: LEVEL SELECT
// ═══════════════════════════════════════════════════════════════════

function LevelSelectScreen({
  progress, onStart,
}: {
  progress: UserProgress
  onStart: (level: Level) => void
}) {
  const [selected, setSelected] = useState<Level>('A1')
  const pct = levelProgress(progress.xp)
  const nextInfo = nextLevelInfo(progress.xp)

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24 max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-black text-white mb-2">تدرب على الإنجليزية</h1>
        <p className="text-blue-200/70 text-sm leading-relaxed max-w-xs mx-auto">اختر مستواك وابدأ جلسة تعلم كاملة — قراءة، كتابة، ترجمة ومحادثة مع AI</p>
      </div>

      {/* Stats */}
      <div className="w-full flex gap-3 mb-8">
        <div className="flex-1 bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-300">⚡ {progress.xp}</div>
          <div className="text-white/50 text-xs mt-0.5">نقاط XP</div>
        </div>
        <div className="flex-1 bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-orange-300">🔥 {progress.streak}</div>
          <div className="text-white/50 text-xs mt-0.5">أيام متتالية</div>
        </div>
        <div className="flex-1 bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-blue-300">📚 {progress.totalSessions}</div>
          <div className="text-white/50 text-xs mt-0.5">جلسة</div>
        </div>
      </div>

      {/* XP Progress */}
      {nextInfo && (
        <div className="w-full bg-white/10 border border-white/15 rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70 font-semibold">التقدم نحو {nextInfo.label}</span>
            <span className="text-amber-300 font-bold">{nextInfo.xpNeeded} XP متبقية</span>
          </div>
          <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Level Cards */}
      <div className="w-full space-y-3 mb-8">
        {(['A1', 'A2', 'B1'] as Level[]).map(lvl => {
          const cfg = LEVEL_CONFIG[lvl]
          const locked = progress.xp < cfg.xpRequired
          const isSelected = selected === lvl
          return (
            <button
              key={lvl}
              onClick={() => !locked && setSelected(lvl)}
              disabled={locked}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-right
                ${isSelected && !locked
                  ? `bg-gradient-to-r ${cfg.gradient} ${cfg.border} shadow-lg scale-[1.02]`
                  : locked
                  ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:scale-[1.01]'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl shadow-md shrink-0 ${locked ? 'grayscale' : ''}`}>
                {locked ? '🔒' : cfg.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-lg">{cfg.label}</span>
                  <span className="text-white/70 text-sm font-semibold">{cfg.desc}</span>
                  {locked && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{cfg.xpRequired} XP</span>}
                </div>
                <p className="text-white/50 text-xs mt-0.5">
                  {lvl === 'A1' && '6 جمل يومية بسيطة ومفيدة'}
                  {lvl === 'A2' && 'مواقف حياتية، ماضي ومستقبل'}
                  {lvl === 'B1' && 'آراء، فرضيات، مواضيع متقدمة'}
                </p>
              </div>
              {isSelected && !locked && (
                <CheckCircle2 size={22} className="text-white shrink-0" />
              )}
              {locked && <Lock size={18} className="text-white/30 shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Session Info */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <p className="text-white/80 font-bold text-sm mb-3">كل جلسة تشمل 4 مراحل:</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm">📖</div>
            <div>
              <p className="text-white/90 text-xs font-bold">القراءة والاستماع</p>
              <p className="text-white/40 text-[10px]">6 جمل مع نطق صوتي</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-sm">✍️</div>
            <div>
              <p className="text-white/90 text-xs font-bold">الكتابة من الذاكرة</p>
              <p className="text-white/40 text-[10px]">اختبر حفظك للجمل</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-sm">🌐</div>
            <div>
              <p className="text-white/90 text-xs font-bold">الترجمة الثنائية</p>
              <p className="text-white/40 text-[10px]">عربي ↔ إنجليزي</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-white/90 text-xs font-bold">محادثة AI Coach</p>
              <p className="text-white/40 text-[10px]">تمارين ذكية + سؤال</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-white/40 font-semibold">
          <span>⏱ ~10 دقائق</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>⚡ حتى 100 XP</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>🔥 يحسب في الـ streak</span>
        </div>
      </div>

      <button
        onClick={() => onStart(selected)}
        disabled={progress.xp < LEVEL_CONFIG[selected].xpRequired}
        className={`w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 shadow-xl active:scale-95
          bg-gradient-to-r ${LEVEL_CONFIG[selected].gradient} hover:opacity-90`}
      >
        ابدأ الجلسة 🚀
      </button>

      {/* Social proof */}
      <p className="text-white/30 text-xs text-center mt-4 flex items-center justify-center gap-2">
        <span>✅ مجاني 100%</span>
        <span className="w-1 h-1 bg-white/15 rounded-full" />
        <span>🎯 بدون تسجيل</span>
        <span className="w-1 h-1 bg-white/15 rounded-full" />
        <span>📱 يعمل على الهاتف</span>
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 1: READING
// ═══════════════════════════════════════════════════════════════════

function ReadingScreen({
  sentences, onComplete,
}: {
  sentences: Sentence[]
  onComplete: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [showArabic, setShowArabic] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [timeLeft, setTimeLeft] = useState(120)

  const sentence = sentences[idx]
  const allSeen  = seen.size >= sentences.length

  // Auto-play audio when sentence changes
  useEffect(() => {
    let active = true
    fetchTTS(sentence.english)
      .then(url => { if (active) new Audio(url).play().catch(() => speakBrowserFallback(sentence.english)) })
      .catch(() => { if (active) speakBrowserFallback(sentence.english) })
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Countdown timer (stops at 0)
  useEffect(() => {
    if (timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  const goTo = (next: number, d: 'next' | 'prev') => {
    setDir(d)
    setShowArabic(false)
    setIdx(next)
    setSeen(s => new Set(Array.from(s).concat(next)))
  }

  useEffect(() => {
    setSeen(new Set([0] as number[]))
  }, [])

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="text-white/70 text-sm font-semibold">
          <BookOpen size={14} className="inline ml-1" />
          اقرأ وتذكّر
        </div>
        <div className="flex gap-1.5">
          {sentences.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i, i > idx ? 'next' : 'prev')}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                i === idx ? 'bg-blue-400 scale-125' :
                seen.has(i) ? 'bg-emerald-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-white/50 text-sm">{idx + 1} / {sentences.length}</span>
      </div>

      {/* Timer */}
      <div className={`w-full text-center text-xs font-bold mb-4 tabular-nums ${
        timeLeft <= 30 ? 'text-red-400' : timeLeft <= 60 ? 'text-amber-400' : 'text-white/40'
      }`}>
        ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </div>

      {/* Card */}
      <div
        key={`${idx}-${dir}`}
        className="w-full bg-white rounded-3xl shadow-2xl p-8 mb-6 animate-cardIn"
      >
        {/* Level badge */}
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4
          bg-gradient-to-r ${LEVEL_CONFIG[sentence.level].gradient} text-white`}>
          {LEVEL_CONFIG[sentence.level].emoji} {sentence.level} · {sentence.topic}
        </div>

        {/* English sentence */}
        <p className="text-2xl sm:text-3xl font-black text-gray-800 leading-relaxed mb-6" dir="ltr">
          {sentence.english}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <SpeakBtn text={sentence.english} />
          {sentence.arabic && (
            <button
              onClick={() => setShowArabic(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm transition-all hover:scale-105"
            >
              {showArabic ? <EyeOff size={15} /> : <Eye size={15} />}
              {showArabic ? 'أخفِ العربية' : 'أظهر العربية'}
            </button>
          )}
        </div>

        {/* Arabic */}
        {showArabic && sentence.arabic && (
          <div className="mt-5 pt-5 border-t border-gray-100 animate-fadeUp">
            <p className="text-gray-600 text-lg leading-relaxed">{sentence.arabic}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="w-full flex gap-3 mb-6">
        <button
          onClick={() => idx > 0 && goTo(idx - 1, 'prev')}
          disabled={idx === 0}
          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white flex items-center justify-center transition-all"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => {
            if (idx < sentences.length - 1) goTo(idx + 1, 'next')
          }}
          disabled={idx === sentences.length - 1}
          className="flex-1 h-12 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-bold flex items-center justify-center gap-2 transition-all"
        >
          التالي <ChevronLeft size={18} />
        </button>
      </div>

      {/* Tip */}
      <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 text-center mb-6">
        <p className="text-amber-300/90 text-sm font-bold mb-0.5">💡 نصيحة مهمة</p>
        <p className="text-white/50 text-xs">ركّز على كل كلمة واستمع للنطق — ستحتاج كتابة هذه الجمل من الذاكرة في الخطوة التالية!</p>
      </div>

      {/* Start button — shown after seeing all */}
      {allSeen && (
        <div className="w-full space-y-2 animate-fadeUp">
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            جاهز للكتابة <ArrowRight size={20} />
          </button>
          <p className="text-white/30 text-xs text-center">✅ قرأت جميع الجمل — يلا نبدأو!</p>
        </div>
      )}
      {!allSeen && (
        <div className="w-full bg-white/5 rounded-2xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-semibold">
            <span>📖 اقرأ جميع الجمل لتستمر</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {sentences.map((_, i) => (
              <div key={i} className={`w-6 h-1.5 rounded-full transition-all ${seen.has(i) ? 'bg-emerald-400' : 'bg-white/15'}`} />
            ))}
          </div>
          <p className="text-white/30 text-xs mt-1.5">{seen.size} من {sentences.length}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 2: WRITING (recall from memory)
// ═══════════════════════════════════════════════════════════════════

function WritingScreen({
  sentences, level: _level, onComplete,
}: {
  sentences: Sentence[]
  level: Level
  onComplete: (result: StepResult) => void
}) {
  const [idx, setIdx]       = useState(0)
  const [input, setInput]   = useState('')
  const [result, setResult] = useState<EvaluateResponse | null>(null)
  const [loading] = useState(false)
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([])
  const [stepXP, setStepXP]   = useState(0)
  const [correct, setCorrect] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sentence = sentences[idx]
  const isLast   = idx === sentences.length - 1

  const addFloat = (pts: number) => {
    const id = Math.random().toString(36).slice(2)
    setXpFloats(prev => [...prev, { id, points: pts }])
    setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== id)), 1800)
  }

  const handleSubmit = () => {
    if (!input.trim()) return
    const data = validateLocally(input, sentence.english)
    setResult(data)
    addFloat(data.xpAwarded)
    setStepXP(x => x + data.xpAwarded)
    if (data.isGood) setCorrect(c => c + 1)
    playSound(data.isGood ? 'success' : 'error')
  }

  const handleNext = () => {
    if (isLast) {
      onComplete({ xpEarned: stepXP, correct, total: sentences.length })
    } else {
      setIdx(i => i + 1)
      setInput('')
      setResult(null)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto">
      <XpToast floats={xpFloats} />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-white/70 text-sm font-semibold flex items-center gap-1.5">
          ✍️ اكتب من الذاكرة
        </div>
        <span className="text-white/50 text-sm">{idx + 1} / {sentences.length}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {sentences.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
            i < idx ? 'w-6 bg-emerald-400' :
            i === idx ? 'w-8 bg-blue-400' : 'w-6 bg-white/15'
          }`} />
        ))}
      </div>

      {/* Prompt card — Arabic hint when available, English recall otherwise */}
      <div className="w-full bg-white rounded-3xl shadow-xl p-6 mb-5">
        {sentence.arabic ? (
          <>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star size={12} /> الجملة بالعربية
            </p>
            <p className="text-xl font-bold text-gray-800 leading-relaxed">{sentence.arabic}</p>
            <p className="text-gray-400 text-sm mt-3 flex items-center gap-1">
              <BookOpen size={12} />
              اكتب هذه الجملة بالإنجليزية من الذاكرة
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen size={12} /> اكتب الجملة من الذاكرة
            </p>
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
              <SpeakBtn text={sentence.english} size="sm" />
              <p className="text-gray-500 text-sm font-medium">استمع ثم اكتب الجملة بالإنجليزية من الذاكرة</p>
            </div>
          </>
        )}
      </div>

      {/* Answer input */}
      {!result && (
        <div className="w-full space-y-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Write the English sentence here..."
            rows={3}
            dir="ltr"
            autoFocus
            className="w-full bg-white/10 border-2 border-white/20 focus:border-blue-400 focus:outline-none rounded-2xl px-4 py-3 text-white text-base resize-none placeholder:text-white/30 transition-colors leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> تقييم...</> : <><Send size={16} /> تحقق من إجابتي</>}
          </button>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="w-full space-y-4 animate-fadeUp">
          {/* Score */}
          <div className={`rounded-2xl p-5 border-2 ${
            result.isGood
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.isGood
                  ? <CheckCircle2 size={20} className="text-emerald-500" />
                  : <XCircle size={20} className="text-red-400" />
                }
                <span className={`font-black text-lg ${result.isGood ? 'text-emerald-700' : 'text-red-600'}`}>
                  {result.score}%
                </span>
              </div>
              <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
                +{result.xpAwarded} XP
              </span>
            </div>
            <p className="text-gray-700 font-semibold mb-3">{result.feedback}</p>

            {/* Your answer */}
            <div className="bg-white rounded-xl px-4 py-3 mb-2" dir="ltr">
              <p className="text-xs text-gray-400 mb-1">إجابتك:</p>
              <p className="text-gray-700">{input}</p>
            </div>

            {/* Correct version */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2" dir="ltr">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">الجملة الصحيحة:</p>
                <p className="text-gray-800 font-semibold">{result.betterVersion}</p>
              </div>
              <SpeakBtn text={result.betterVersion} size="sm" />
            </div>

            {/* Corrections */}
            {(result?.corrections?.length ?? 0) > 0 && (
              <div className="mt-3 space-y-1.5">
                {result.corrections?.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-orange-50 rounded-xl px-3 py-2">
                    <span className="text-orange-400 mt-0.5">⚠</span>
                    <span dir="ltr">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLast ? '🌐 يلا للترجمة!' : <>التالي <ArrowRight size={18} /></>}
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 3: TRANSLATION
// ═══════════════════════════════════════════════════════════════════

function TranslationScreen({
  sentences, level: _level, onComplete,
}: {
  sentences: Sentence[]
  level: Level
  onComplete: (result: StepResult) => void
}) {
  // Build bidirectional tasks from the SAME stored sentences
  // Even index → Arabic to English | Odd index → English to Arabic
  const tasks = useMemo(() => sentences.map((s, i) => ({
    sentence: s,
    direction: (i % 2 === 0 ? 'ar→en' : 'en→ar') as 'ar→en' | 'en→ar',
  })), [sentences])

  const [idx, setIdx]       = useState(0)
  const [input, setInput]   = useState('')
  const [result, setResult] = useState<EvaluateResponse | null>(null)
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([])
  const [stepXP, setStepXP]   = useState(0)
  const [correct, setCorrect] = useState(0)

  const task   = tasks[idx]
  const isLast = idx === tasks.length - 1

  const addFloat = (pts: number) => {
    const id = Math.random().toString(36).slice(2)
    setXpFloats(prev => [...prev, { id, points: pts }])
    setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== id)), 1800)
  }

  const handleSubmit = () => {
    if (!input.trim()) return
    // Validate against the correct reference for this direction
    const reference = task.direction === 'ar→en' ? task.sentence.english : task.sentence.arabic
    const data = validateLocally(input, reference)
    setResult(data)
    addFloat(data.xpAwarded)
    setStepXP(x => x + data.xpAwarded)
    if (data.isGood) setCorrect(c => c + 1)
    playSound(data.isGood ? 'success' : 'error')
  }

  const handleNext = () => {
    if (isLast) {
      onComplete({ xpEarned: stepXP, correct, total: tasks.length })
    } else {
      setIdx(i => i + 1)
      setInput('')
      setResult(null)
    }
  }

  const dirLabel  = task.direction === 'ar→en' ? 'ترجم إلى الإنجليزية' : 'Translate to Arabic'
  const prompt    = task.direction === 'ar→en' ? task.sentence.arabic   : task.sentence.english
  const inputHint = task.direction === 'ar→en' ? 'Translate to English...' : 'اكتب بالعربية...'
  const inputDir  = task.direction === 'ar→en' ? 'ltr' : 'rtl'

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto">
      <XpToast floats={xpFloats} />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-white/70 text-sm font-semibold flex items-center gap-1.5">
          <Sparkles size={14} /> الترجمة
          <span className="text-xs bg-white/10 rounded-full px-2 py-0.5">
            {task.direction === 'ar→en' ? '🇬🇧' : '🇸🇦'}
          </span>
        </div>
        <span className="text-white/50 text-sm">{idx + 1} / {tasks.length}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {tasks.map((t, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
            i < idx ? (t.direction === 'ar→en' ? 'w-6 bg-violet-400' : 'w-6 bg-amber-400') :
            i === idx ? 'w-8 bg-blue-400' : 'w-6 bg-white/15'
          }`} />
        ))}
      </div>

      {/* Prompt card */}
      <div className="w-full bg-white rounded-3xl shadow-xl p-6 mb-5">
        <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={12} /> {dirLabel}
        </p>
        <p className="text-2xl font-bold text-gray-800 leading-relaxed mb-1"
          dir={task.direction === 'ar→en' ? 'rtl' : 'ltr'}>
          {prompt}
        </p>
        {task.direction === 'en→ar' && (
          <div className="mt-2"><SpeakBtn text={prompt} size="sm" /></div>
        )}
      </div>

      {/* Answer input */}
      {!result && (
        <div className="w-full space-y-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder={inputHint}
            rows={3}
            dir={inputDir}
            autoFocus
            className="w-full bg-white/10 border-2 border-white/20 focus:border-violet-400 focus:outline-none rounded-2xl px-4 py-3 text-white text-base resize-none placeholder:text-white/30 transition-colors leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> قيّم ترجمتي
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="w-full space-y-4 animate-fadeUp">
          <div className={`rounded-2xl p-5 border-2 ${result.isGood ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.isGood ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-400" />}
                <span className={`font-black text-lg ${result.isGood ? 'text-emerald-700' : 'text-red-600'}`}>{result.score}%</span>
              </div>
              <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">+{result.xpAwarded} XP</span>
            </div>
            <p className="text-gray-700 font-semibold mb-3">{result.feedback}</p>
            <div className="bg-white rounded-xl px-4 py-3 mb-2" dir={inputDir}>
              <p className="text-xs text-gray-400 mb-1">إجابتك:</p>
              <p className="text-gray-700">{input}</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2"
              dir={task.direction === 'ar→en' ? 'ltr' : 'rtl'}>
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">الإجابة الصحيحة:</p>
                <p className="text-gray-800 font-semibold">{result.betterVersion}</p>
              </div>
              {task.direction === 'ar→en' && <SpeakBtn text={result.betterVersion} size="sm" />}
            </div>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white font-black text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLast ? '🤖 يلا للمحادثة!' : <>التالي <ArrowRight size={18} /></>}
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 4: CHAT — structured task loop (same 5 sentences)
// ═══════════════════════════════════════════════════════════════════

// Each task in the scripted sequence
type ChatTaskType = 'dictation' | 'translation' | 'question'
interface ChatTask { type: ChatTaskType; sentence?: Sentence }

/** Build the fixed 5-task sequence from the stored sentences. */
function buildChatTasks(sentences: Sentence[]): ChatTask[] {
  const s = sentences
  return [
    { type: 'dictation',   sentence: s[0] },
    { type: 'dictation',   sentence: s[Math.min(1, s.length - 1)] },
    { type: 'translation', sentence: s[Math.min(2, s.length - 1)] },
    { type: 'translation', sentence: s[Math.min(3, s.length - 1)] },
    { type: 'question' },
  ]
}

function ChatScreen({
  sentences, level, onComplete,
}: {
  sentences: Sentence[]
  level: Level
  onComplete: (result: StepResult) => void
}) {
  // Tasks are built ONCE from the stored sentences — never regenerated
  const tasks = useMemo(() => buildChatTasks(sentences), [sentences])

  const [messages, setMessages]     = useState<ChatMsg[]>([])
  const [taskIdx, setTaskIdx]       = useState(-1) // -1 = showing intro
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [chatXP, setChatXP]         = useState(0)
  const [chatCorrect, setChatCorrect] = useState(0)
  const [xpFloats, setXpFloats]     = useState<XpFloat[]>([])
  const [chatError, setChatError]   = useState<string | null>(null)
  const apiHistoryRef = useRef<{ role: string; content: string }[]>([])
  const endRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const addFloat = (pts: number) => {
    const id = Math.random().toString(36).slice(2)
    setXpFloats(prev => [...prev, { id, points: pts }])
    setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== id)), 1800)
  }

  const pushMsg = useCallback((m: Omit<ChatMsg, 'id'>) => {
    setMessages(prev => [...prev, { ...m, id: Math.random().toString(36).slice(2) }])
  }, [])

  // Show the scripted AI prompt for a given task
  const showTaskPrompt = useCallback((idx: number) => {
    const task = tasks[idx]
    if (task.type === 'dictation') {
      const num = idx + 1
      pushMsg({
        role: 'ai', isCorrect: true, points: 0,
        correction: null, correctedVersion: null, encouragement: null,
        content: `✏️ إملاء ${num}/2 — اكتب هذه الجملة بالضبط:\n"${task.sentence!.english}"`,
      })
    } else if (task.type === 'translation') {
      const num = idx - 1
      pushMsg({
        role: 'ai', isCorrect: true, points: 0,
        correction: null, correctedVersion: null, encouragement: null,
        content: `🌐 ترجمة ${num}/2 — ترجم هذا إلى الإنجليزية:\n"${task.sentence!.arabic}"`,
      })
    } else {
      // question — single API call
      setLoading(true)
      fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat-practice',
          sentences: sentences.map(s => ({ english: s.english })),
          messages: [],
          level,
          replyCount: 0,
        }),
      })
        .then(r => r.json())
        .then((data: ChatResponse) => {
          pushMsg({
            role: 'ai', isCorrect: true, points: 0,
            correction: null, correctedVersion: null, encouragement: null,
            content: data.aiMessage,
          })
          apiHistoryRef.current = [{ role: 'assistant', content: data.aiMessage }]
          setLoading(false)
        })
        .catch(() => {
          pushMsg({
            role: 'ai', isCorrect: true, points: 0,
            correction: null, correctedVersion: null, encouragement: null,
            content: 'What sentence from today did you find most useful? Tell me why.',
          })
          setLoading(false)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, sentences, level, pushMsg])

  // Mount: show intro then immediately queue task 0
  useEffect(() => {
    pushMsg({
      role: 'ai', isCorrect: true, points: 0,
      correction: null, correctedVersion: null, encouragement: null,
      content: 'أهلاً! سنراجع نفس الجمل في 4 تمارين: ✏️ إملاء × 2 ← 🌐 ترجمة × 2 ← ❓ سؤال. هيا! 🚀',
    })
    const t = setTimeout(() => setTaskIdx(0), 600)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show task prompt when taskIdx advances
  useEffect(() => {
    if (taskIdx < 0) return
    const t = setTimeout(() => showTaskPrompt(taskIdx), 350)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdx])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || sessionDone || taskIdx < 0) return
    setInput('')
    setChatError(null)

    // User message
    pushMsg({
      role: 'user', content: text, isCorrect: true, points: 0,
      correction: null, correctedVersion: null, encouragement: null,
    })

    const task = tasks[taskIdx]

    // ── Dictation & Translation: validate locally, no API ─────────
    if (task.type === 'dictation' || task.type === 'translation') {
      const ev = validateLocally(text, task.sentence!.english)
      playSound(ev.isGood ? 'success' : 'error')
      addFloat(ev.xpAwarded)
      setChatXP(x => x + ev.xpAwarded)
      if (ev.isGood) setChatCorrect(c => c + 1)

      pushMsg({
        role: 'ai',
        content: ev.isGood
          ? `${ev.feedback} ⚡ +${ev.xpAwarded} XP`
          : ev.feedback,
        correction:       ev.isGood ? null : `Score: ${ev.score}%`,
        correctedVersion: ev.isGood ? null : ev.betterVersion,
        encouragement:    ev.isGood ? 'ممتاز!' : 'راجع الجملة 🔄',
        isCorrect: ev.isGood,
        points: ev.xpAwarded,
      })

      const next = taskIdx + 1
      if (next >= tasks.length) {
        setSessionDone(true)
      } else {
        setTaskIdx(next)
      }
      return
    }

    // ── Question: single API call ──────────────────────────────────
    setLoading(true)
    apiHistoryRef.current = [...apiHistoryRef.current, { role: 'user', content: text }]

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat-practice',
          sentences: sentences.map(s => ({ english: s.english })),
          messages: apiHistoryRef.current.slice(0, -1),
          level,
          userReply: text,
          replyCount: 1,
        }),
      })
      const data: ChatResponse = await res.json()
      apiHistoryRef.current = [...apiHistoryRef.current, { role: 'assistant', content: data.aiMessage }]
      addFloat(data.points)
      setChatXP(x => x + data.points)
      if (data.isCorrect) setChatCorrect(c => c + 1)
      pushMsg({
        role: 'ai',
        content: data.aiMessage,
        correction: data.correction,
        correctedVersion: data.correctedVersion,
        encouragement: data.encouragement,
        isCorrect: data.isCorrect,
        points: data.points,
      })
      setSessionDone(true)
    } catch {
      setInput(text)
      setChatError('حدث خطأ في الاتصال، حاول مرة أخرى')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // Progress label
  const taskLabel = taskIdx < 0 ? 'يبدأ الآن...'
    : sessionDone ? 'انتهت الجلسة'
    : tasks[taskIdx]?.type === 'dictation'   ? `إملاء ${taskIdx + 1}/2`
    : tasks[taskIdx]?.type === 'translation' ? `ترجمة ${taskIdx - 1}/2`
    : 'سؤال مفتوح'

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] max-w-lg mx-auto px-4 pt-6">
      <XpToast floats={xpFloats} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-md">
          🤖
        </div>
        <div>
          <p className="text-white font-bold text-sm">AI Coach</p>
          <p className="text-blue-200/60 text-xs flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${sessionDone ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {taskLabel}
          </p>
        </div>
        {/* Step progress pills */}
        <div className="mr-auto flex gap-1">
          {tasks.map((_t, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i < taskIdx || sessionDone ? 'bg-emerald-400' :
              i === taskIdx ? 'bg-blue-400 scale-125' : 'bg-white/20'
            }`} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col gap-1.5 animate-fadeUp ${msg.role === 'ai' ? 'items-end' : 'items-start'}`}>
            <span className={`text-xs font-bold px-2 ${msg.role === 'ai' ? 'text-blue-300' : 'text-white/50'}`}>
              {msg.role === 'ai' ? '🤖 AI Coach' : '👤 أنت'}
            </span>
            <div className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-lg
              ${msg.role === 'ai'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tl-lg'
                : 'bg-white text-gray-800 rounded-tr-lg'
              }`}>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" dir="ltr">{msg.content}</p>
              {msg.role === 'ai' && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <SpeakBtn text={msg.content} size="sm" />
                </div>
              )}
            </div>

            {/* Correction bubble */}
            {msg.role === 'ai' && msg.correction && (
              <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow border border-gray-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  {msg.isCorrect
                    ? <CheckCircle2 size={13} className="text-emerald-500" />
                    : <XCircle size={13} className="text-red-400" />}
                  <span className={`text-xs font-bold ${msg.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    {msg.isCorrect ? 'صحيح!' : 'تصحيح'}
                  </span>
                </div>
                <p className="text-gray-600 text-xs" dir="ltr">{msg.correction}</p>
                {msg.correctedVersion && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2" dir="ltr">
                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    <span className="text-emerald-700 text-sm font-semibold flex-1">{msg.correctedVersion}</span>
                    <SpeakBtn text={msg.correctedVersion} size="sm" />
                  </div>
                )}
              </div>
            )}

            {/* Encouragement + XP */}
            {msg.role === 'ai' && msg.encouragement && msg.points > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-300 text-sm font-bold">{msg.encouragement}</span>
                <span className="flex items-center gap-1 bg-white/10 border border-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                  <Zap size={10} className="text-amber-400" /> +{msg.points} XP
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-1.5">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl rounded-tl-lg px-5 py-4 shadow-lg">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-white rounded-full inline-block"
                    style={{ animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input or Done */}
      {!sessionDone ? (
        <div className="shrink-0 pt-3 border-t border-white/10">
          {chatError && (
            <div className="mb-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs text-center">
              {chatError}
            </div>
          )}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-3 flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={tasks[taskIdx]?.type === 'question' ? 'اكتب ردك بالإنجليزية...' : 'اكتب إجابتك...'}
              rows={2}
              dir="ltr"
              disabled={loading || taskIdx < 0}
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm resize-none placeholder:text-white/30 leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || taskIdx < 0}
              className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 shrink-0"
            >
              {loading ? <Loader2 size={18} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
            </button>
          </div>
          <p className="text-white/30 text-xs text-center mt-2">Enter للإرسال</p>
        </div>
      ) : (
        <div className="shrink-0 pt-4 border-t border-white/10">
          <button
            onClick={() => onComplete({ xpEarned: chatXP, correct: chatCorrect, total: tasks.length })}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            🏆 عرض النتائج
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 5: RESULTS
// ═══════════════════════════════════════════════════════════════════

function ResultsScreen({
  session, progress, onNewSession, onContinue,
}: {
  session: SessionState
  progress: UserProgress
  onNewSession: () => void
  onContinue: () => void
}) {
  const totalXP   = Object.values(session.results).reduce((a, r) => a + r.xpEarned, 0) + 50
  const totalCorr = Object.values(session.results).reduce((a, r) => a + r.correct, 0)
  const totalQ    = Object.values(session.results).reduce((a, r) => a + r.total, 0) || 1
  const accuracy  = Math.round((totalCorr / totalQ) * 100)
  const newXP     = progress.xp

  const msg = accuracy >= 90 ? randomFrom(FEEDBACK_MESSAGES.perfect)
    : accuracy >= 70 ? randomFrom(FEEDBACK_MESSAGES.good)
    : accuracy >= 50 ? randomFrom(FEEDBACK_MESSAGES.ok)
    : randomFrom(FEEDBACK_MESSAGES.tryAgain)

  const nextInfo = nextLevelInfo(newXP)
  const pct      = levelProgress(newXP)

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Celebration */}
      <div className="text-center mb-8 animate-fadeUp">
        <div className="text-7xl mb-3">{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎯' : '💪'}</div>
        <h2 className="text-3xl font-black text-white mb-2">{msg}</h2>
        <p className="text-blue-200/70">جلسة كاملة انتهت!</p>
      </div>

      {/* XP Card */}
      <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 mb-4 text-center shadow-xl animate-fadeUp"
        style={{ animationDelay: '100ms' }}>
        <p className="text-white/80 text-sm font-semibold mb-1">نقاط XP المكتسبة</p>
        <p className="text-5xl font-black text-white">+{totalXP}</p>
        <p className="text-white/70 text-sm mt-1">يشمل +50 مكافأة إتمام الجلسة</p>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-3 gap-3 mb-4" style={{ animationDelay: '200ms' }}>
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-300">{accuracy}%</div>
          <div className="text-white/50 text-xs mt-0.5">الدقة</div>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-orange-300">🔥 {progress.streak}</div>
          <div className="text-white/50 text-xs mt-0.5">أيام</div>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-blue-300">⚡ {newXP}</div>
          <div className="text-white/50 text-xs mt-0.5">إجمالي XP</div>
        </div>
      </div>

      {/* Step breakdown */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 space-y-3 animate-fadeUp"
        style={{ animationDelay: '300ms' }}>
        <p className="text-white/70 text-sm font-bold mb-2">تفاصيل الجلسة</p>
        {([
          { key: 'reading',     label: 'القراءة',   icon: '📖', color: 'text-blue-300' },
          { key: 'writing',     label: 'الكتابة',   icon: '✍️', color: 'text-emerald-300' },
          { key: 'translation', label: 'الترجمة',   icon: '🌐', color: 'text-violet-300' },
          { key: 'chat',        label: 'المحادثة',  icon: '💬', color: 'text-amber-300' },
        ] as const).map(({ key, label, icon, color }) => {
          const r = session.results[key]
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-white/60 text-sm">{icon} {label}</span>
              <div className="flex items-center gap-2">
                {r.total > 0 && (
                  <span className="text-white/40 text-xs">{r.correct}/{r.total}</span>
                )}
                <span className={`font-bold text-sm ${color}`}>+{r.xpEarned} XP</span>
              </div>
            </div>
          )
        })}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-white font-bold text-sm">مكافأة الإتمام</span>
          <span className="font-bold text-amber-300 text-sm">+50 XP</span>
        </div>
      </div>

      {/* Level progress */}
      {nextInfo ? (
        <div className="w-full bg-white/10 border border-white/15 rounded-2xl p-4 mb-6 animate-fadeUp"
          style={{ animationDelay: '400ms' }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70 font-semibold">التقدم نحو {nextInfo.label}</span>
            <span className="text-amber-300 font-bold">{nextInfo.xpNeeded} XP متبقية</span>
          </div>
          <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div className="w-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-400/40 rounded-2xl p-4 mb-6 text-center animate-fadeUp">
          <p className="text-violet-200 font-bold">🏆 وصلت إلى أعلى مستوى! أنت ممتاز!</p>
        </div>
      )}

      {/* WhatsApp upgrade CTA */}
      <div className="w-full bg-gradient-to-r from-[#25d366]/15 to-emerald-500/10 border border-[#25d366]/30 rounded-2xl p-5 mb-4 animate-fadeUp"
        style={{ animationDelay: '450ms' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#25d366] rounded-xl flex items-center justify-center text-lg shadow-md flex-shrink-0">💬</div>
          <div className="flex-1">
            <p className="text-white font-black text-sm mb-1">عجبتك التجربة؟ النتائج الحقيقية مع المتابعة!</p>
            <p className="text-white/50 text-xs leading-relaxed mb-3">انضم لدورة مع المعلم حمزة — متابعة شخصية + مجموعة واتساب + نتائج مضمونة</p>
            <a
              href="https://wa.me/212707902091?text=مرحبا، جربت التدريب المجاني وأريد الانضمام لدورة كاملة"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
            >
              <MessageCircle size={14} /> تواصل مع حمزة الآن
            </a>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        <button
          onClick={onNewSession}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} /> جلسة جديدة
        </button>
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
        >
          <Trophy size={18} className="text-amber-400" /> تغيير المستوى
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function PracticePage() {
  const [screen, setScreen]   = useState<Screen>('select')
  const [visible, setVisible] = useState(true)
  const [session, setSession] = useState<SessionState | null>(null)
  const [progress, setProgress] = useState<UserProgress>(() => getProgress())
  const [globalXPFloats, setGlobalXPFloats] = useState<XpFloat[]>([])
  const [levelUp, setLevelUp] = useState<Level | null>(null)
  const [noContent, setNoContent] = useState(false)

  // Animated transition helper
  const transitionTo = useCallback((next: Screen) => {
    setVisible(false)
    setTimeout(() => { setScreen(next); setVisible(true) }, 220)
  }, [])

  const addGlobalXP = useCallback((pts: number, newProg: UserProgress) => {
    const id = Math.random().toString(36).slice(2)
    setGlobalXPFloats(prev => [...prev, { id, points: pts }])
    setTimeout(() => setGlobalXPFloats(prev => prev.filter(f => f.id !== id)), 1800)
    // Check for level up
    const oldLevel = progress.unlockedLevel
    const newLevel = newProg.unlockedLevel
    if (newLevel !== oldLevel) {
      setTimeout(() => { setLevelUp(newLevel); setTimeout(() => setLevelUp(null), 3000) }, 300)
    }
  }, [progress.unlockedLevel])

  // ── Start session ──────────────────────────────────────────────

  const startSession = useCallback((level: Level) => {
    const usedIds = progress.usedSentenceIds?.[level] ?? []
    const sentences = getSessionSentences(level, usedIds, 6)

    if (sentences.length === 0) {
      setNoContent(true)
      return
    }
    setNoContent(false)

    const newSession: SessionState = {
      level,
      sentences,
      results: {
        reading:     { xpEarned: 0, correct: 0, total: 0 },
        writing:     { xpEarned: 0, correct: 0, total: 0 },
        translation: { xpEarned: 0, correct: 0, total: 0 },
        chat:        { xpEarned: 0, correct: 0, total: 0 },
      },
    }
    setSession(newSession)
    transitionTo('reading')
  }, [transitionTo])

  // ── Step completions ───────────────────────────────────────────

  const completeReading = useCallback(() => {
    if (!session) return
    setSession(s => s ? { ...s, results: { ...s.results, reading: { xpEarned: 0, correct: s.sentences.length, total: s.sentences.length } } } : s)
    transitionTo('writing')
  }, [session, transitionTo])

  const completeStep = useCallback((step: 'writing' | 'translation' | 'chat', result: StepResult) => {
    if (!session) return

    setSession(s => {
      if (!s) return s
      return { ...s, results: { ...s.results, [step]: result } }
    })

    if (step !== 'chat') {
      addGlobalXP(result.xpEarned, progress)
      const nextScreen: Screen = step === 'writing' ? 'translation' : 'chat'
      transitionTo(nextScreen)
    } else {
      // Final step — compute totals, update progress, show results
      setSession(s => {
        if (!s) return s
        const updated = { ...s, results: { ...s.results, chat: result } }

        // Sum XP across all steps + completion bonus
        const totalXP = Object.values(updated.results).reduce((a, r) => a + r.xpEarned, 0) + 50

        let newProg = applyXP(progress, totalXP)
        newProg     = updateStreak(newProg)
        newProg     = markSentencesUsed(newProg, s.level, s.sentences.map(s2 => s2.id))
        newProg     = { ...newProg, totalSessions: newProg.totalSessions + 1 }

        saveProgress(newProg)
        setProgress(newProg)
        addGlobalXP(totalXP, newProg)

        return updated
      })
      transitionTo('results')
    }
  }, [session, progress, transitionTo, addGlobalXP])

  const handleNewSession = useCallback(() => {
    if (!session) { transitionTo('select'); return }
    const usedIds = progress.usedSentenceIds?.[session.level] ?? []
    const sentences = getSessionSentences(session.level, usedIds, 6)
    if (sentences.length === 0) { transitionTo('select'); return }
    const newSess: SessionState = {
      level: session.level,
      sentences,
      results: {
        reading: { xpEarned: 0, correct: 0, total: 0 },
        writing: { xpEarned: 0, correct: 0, total: 0 },
        translation: { xpEarned: 0, correct: 0, total: 0 },
        chat: { xpEarned: 0, correct: 0, total: 0 },
      },
    }
    setSession(newSess)
    transitionTo('reading')
  }, [session, transitionTo])

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:scale(0.95) translateY(12px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes typingBounce {
          0%,100% { transform:translateY(0);   opacity:.4; }
          50%     { transform:translateY(-6px); opacity:1; }
        }
        @keyframes xpFloat {
          0%   { opacity:1; transform:translateY(0)    scale(1); }
          100% { opacity:0; transform:translateY(-60px) scale(1.3); }
        }
        @keyframes levelUpPop {
          0%   { opacity:0; transform:scale(0.5) translateY(20px); }
          60%  { transform:scale(1.1) translateY(-4px); }
          100% { opacity:1; transform:scale(1)  translateY(0); }
        }
        @keyframes screenFade {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-fadeUp   { animation: fadeUp   0.4s ease-out both; }
        .animate-cardIn   { animation: cardIn   0.4s ease-out both; }
        .animate-xpFloat  { animation: xpFloat  1.8s ease-out both; }
        .animate-levelUp  { animation: levelUpPop 0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .animate-screenFade { animation: screenFade 0.22s ease-out both; }
      `}</style>

      {/* Full-page wrapper */}
      <div
        className="min-h-screen pb-8"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 35%,#1e3a8a 70%,#1d4ed8 100%)' }}
        dir="rtl"
      >
        {/* Global XP floats */}
        <XpToast floats={globalXPFloats} />

        {/* Level-up modal */}
        {levelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl px-10 py-8 shadow-2xl text-center animate-levelUp">
              <div className="text-5xl mb-2">🎉</div>
              <p className="text-2xl font-black">مستوى جديد!</p>
              <p className="text-lg font-bold opacity-90">تم فتح مستوى {levelUp}</p>
            </div>
          </div>
        )}

        {/* Session header (steps bar) */}
        {screen !== 'select' && (
          <div className="sticky top-16 z-30">
            <ProgressBar screen={screen} totalXP={progress.xp} />
          </div>
        )}

        {/* Hero (select screen only) */}
        {screen === 'select' && (
          <div className="pt-24 pb-4 px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-4 text-sm text-blue-100 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-400" />
              AI-Powered · مجاني 100%
            </div>
          </div>
        )}
        {screen !== 'select' && <div className="pt-20" />}

        {/* Screens */}
        <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>

          {screen === 'select' && (
            <>
              {noContent && (
                <div className="max-w-lg mx-auto px-4 mb-4">
                  <div className="flex items-start gap-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl px-5 py-4">
                    <span className="text-2xl shrink-0">📭</span>
                    <div>
                      <p className="text-amber-300 font-black text-sm mb-1">لا يوجد محتوى منشور لهذا المستوى</p>
                      <p className="text-white/50 text-xs leading-relaxed">
                        أضف محتوى من{' '}
                        <a href="/admin/content" className="text-amber-400 underline font-bold">لوحة الإدارة</a>
                        {' '}ثم انشره حتى يظهر هنا.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <LevelSelectScreen progress={progress} onStart={startSession} />
            </>
          )}

          {screen === 'reading' && session && (
            <ReadingScreen sentences={session.sentences} onComplete={completeReading} />
          )}

          {screen === 'writing' && session && (
            <WritingScreen
              sentences={session.sentences}
              level={session.level}
              onComplete={r => completeStep('writing', r)}
            />
          )}

          {screen === 'translation' && session && (
            <TranslationScreen
              sentences={session.sentences}
              level={session.level}
              onComplete={r => completeStep('translation', r)}
            />
          )}

          {screen === 'chat' && session && (
            <ChatScreen
              sentences={session.sentences}
              level={session.level}
              onComplete={r => completeStep('chat', r)}
            />
          )}

          {screen === 'results' && session && (
            <ResultsScreen
              session={session}
              progress={progress}
              onNewSession={handleNewSession}
              onContinue={() => transitionTo('select')}
            />
          )}
        </div>
      </div>
    </>
  )
}
