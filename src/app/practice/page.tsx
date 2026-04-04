'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles, Volume2, Send, RotateCcw, ChevronDown,
  MessageCircle, Zap, Star, BookOpen, Mic, ArrowLeft,
  CheckCircle2, XCircle, Loader2, Trophy, Flame,
} from 'lucide-react'
import type { TranslateResponse, ChatResponse } from '@/app/api/practice/route'

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = 'A1' | 'A2' | 'B1'
type Mode = 'translate' | 'chat'

interface TranslationEntry {
  id: string
  arabic: string
  english: string
  similarSentences: string[]
  explanation: string
  tips: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  correction: string | null
  correctedVersion: string | null
  encouragement: string | null
  isCorrect: boolean
  points: number
}

interface ApiHistory {
  role: 'user' | 'assistant'
  content: string
}

interface XpFloat {
  id: string
  points: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_META: Record<Level, { label: string; color: string; bg: string; border: string; desc: string; emoji: string }> = {
  A1: {
    label: 'A1', color: 'text-emerald-700', bg: 'bg-emerald-500',
    border: 'border-emerald-400', desc: 'مبتدئ', emoji: '🌱',
  },
  A2: {
    label: 'A2', color: 'text-amber-700', bg: 'bg-amber-500',
    border: 'border-amber-400', desc: 'أساسي', emoji: '⚡',
  },
  B1: {
    label: 'B1', color: 'text-violet-700', bg: 'bg-violet-500',
    border: 'border-violet-400', desc: 'متوسط', emoji: '🚀',
  },
}

const PLACEHOLDER_ARABIC = [
  'أريد تعلم اللغة الإنجليزية...',
  'ذهبت إلى المدرسة اليوم...',
  'أحب ممارسة رياضة كرة القدم...',
  'أنا طالب جامعي أدرس الهندسة...',
]

// ─── TTS helper ───────────────────────────────────────────────────────────────

function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-US'
  utt.rate = 0.9
  utt.pitch = 1
  const voices = window.speechSynthesis.getVoices()
  const engVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
    ?? voices.find(v => v.lang.startsWith('en'))
  if (engVoice) utt.voice = engVoice
  window.speechSynthesis.speak(utt)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelPill({
  level, selected, onClick,
}: {
  level: Level
  selected: boolean
  onClick: () => void
}) {
  const m = LEVEL_META[level]
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 border-2
        ${selected
          ? `${m.bg} text-white border-transparent shadow-lg scale-105`
          : `bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white hover:scale-105`
        }`}
    >
      <span>{m.emoji}</span>
      <span>{m.label}</span>
      <span className="text-xs opacity-80">{m.desc}</span>
      {selected && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-ping opacity-60" />
      )}
    </button>
  )
}

function SpeakButton({ text, small = false }: { text: string; small?: boolean }) {
  const [speaking, setSpeaking] = useState(false)
  const handle = () => {
    setSpeaking(true)
    speakEnglish(text)
    setTimeout(() => setSpeaking(false), 2500)
  }
  return (
    <button
      onClick={handle}
      title="استمع"
      className={`flex items-center gap-1.5 rounded-xl transition-all duration-200 font-semibold
        ${small
          ? 'text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600'
          : 'text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-blue-400/30'
        }
        ${speaking ? 'scale-95 opacity-80' : 'hover:scale-105'}`}
    >
      <Volume2 size={small ? 12 : 15} className={speaking ? 'animate-pulse' : ''} />
      {!small && 'استمع'}
    </button>
  )
}

function TranslationCard({ entry, index }: { entry: TranslationEntry; index: number }) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <div
      className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header bar */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-right">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-black text-blue-600">
            {index + 1}
          </div>
          <span className="font-bold text-gray-700 text-sm truncate max-w-[200px] sm:max-w-xs">{entry.arabic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-blue-600 font-semibold dir-ltr truncate max-w-[180px]" dir="ltr">
            {entry.english}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-100">
          {/* Translation */}
          <div className="pt-4">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen size={12} /> الترجمة الإنجليزية
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-2xl font-black text-gray-800 flex-1" dir="ltr">{entry.english}</p>
              <SpeakButton text={entry.english} />
            </div>
          </div>

          {/* Similar sentences */}
          {entry.similarSentences.length > 0 && (
            <div>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles size={12} /> جمل مشابهة
              </p>
              <div className="space-y-2">
                {entry.similarSentences.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 text-sm flex-1 font-medium" dir="ltr">{s}</span>
                    <SpeakButton text={s} small />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {entry.explanation && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star size={12} /> شرح بالعربية
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{entry.explanation}</p>
            </div>
          )}

          {/* Tips */}
          {entry.tips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tips.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                  dir="ltr"
                >
                  <Zap size={10} className="text-blue-400" /> {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAi = msg.role === 'ai'

  return (
    <div
      className={`flex flex-col gap-1.5 animate-fadeUp ${isAi ? 'items-end' : 'items-start'}`}
    >
      {/* Role label */}
      <span className={`text-xs font-bold px-2 ${isAi ? 'text-blue-300' : 'text-white/50'}`}>
        {isAi ? '🤖 AI Coach' : '👤 أنت'}
      </span>

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-4 shadow-lg
          ${isAi
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tl-lg'
            : 'bg-white text-gray-800 rounded-tr-lg'
          }`}
      >
        <p className="text-sm sm:text-base leading-relaxed" dir={isAi ? 'ltr' : 'ltr'}>
          {msg.content}
        </p>
        {isAi && (
          <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2">
            <SpeakButton text={msg.content} small />
          </div>
        )}
      </div>

      {/* Correction card */}
      {isAi && msg.correction && (
        <div className="max-w-[85%] sm:max-w-[75%] bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-md border border-gray-100 space-y-2">
          <div className="flex items-center gap-1.5">
            {msg.isCorrect ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : (
              <XCircle size={14} className="text-red-400" />
            )}
            <span className={`text-xs font-bold ${msg.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
              {msg.isCorrect ? 'صحيح تماماً' : 'تصحيح'}
            </span>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed" dir="ltr">{msg.correction}</p>
          {msg.correctedVersion && (
            <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2" dir="ltr">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span className="text-emerald-700 text-sm font-semibold">{msg.correctedVersion}</span>
              <SpeakButton text={msg.correctedVersion} small />
            </div>
          )}
        </div>
      )}

      {/* Encouragement + points */}
      {isAi && msg.encouragement && (
        <div className="flex items-center gap-2">
          <span className="text-amber-300 text-sm font-bold">{msg.encouragement}</span>
          <span className="flex items-center gap-1 bg-white/10 border border-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Zap size={10} className="text-amber-400" /> +{msg.points} XP
          </span>
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-1.5">
      <span className="text-xs font-bold text-blue-300 mb-1">🤖 AI Coach</span>
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl rounded-tl-lg px-5 py-4 shadow-lg">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-white rounded-full inline-block"
              style={{ animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [level, setLevel] = useState<Level>('A1')
  const [mode, setMode] = useState<Mode>('translate')

  // XP / gamification
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([])

  // Translation mode
  const [arabicInput, setArabicInput] = useState('')
  const [translationHistory, setTranslationHistory] = useState<TranslationEntry[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateError, setTranslateError] = useState('')
  const [placeholderIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDER_ARABIC.length))

  // Chat mode
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [apiHistory, setApiHistory] = useState<ApiHistory[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [chatStarted, setChatStarted] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const translateInputRef = useRef<HTMLTextAreaElement>(null)

  // Load streak from localStorage
  useEffect(() => {
    const saved = parseInt(localStorage.getItem('inglizi_streak') ?? '0', 10)
    setStreak(isNaN(saved) ? 0 : saved)
    // Preload voices
    if (typeof window !== 'undefined') window.speechSynthesis?.getVoices()
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatLoading])

  const addXp = useCallback((points: number) => {
    setXp(prev => prev + points)
    setStreak(prev => {
      const next = prev + 1
      localStorage.setItem('inglizi_streak', String(next))
      return next
    })
    const id = Math.random().toString(36).slice(2)
    setXpFloats(prev => [...prev, { id, points }])
    setTimeout(() => setXpFloats(prev => prev.filter(f => f.id !== id)), 1800)
  }, [])

  // ── Translation ──────────────────────────────────────────────────────────

  const handleTranslate = async () => {
    const text = arabicInput.trim()
    if (!text) { setTranslateError('اكتب نصاً بالعربية أولاً'); return }
    setTranslateError('')
    setIsTranslating(true)

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'translate', text, level }),
      })
      if (!res.ok) throw new Error('فشل الاتصال')
      const data: TranslateResponse = await res.json()

      const entry: TranslationEntry = {
        id: Math.random().toString(36).slice(2),
        arabic: text,
        english: data.translation,
        similarSentences: data.similarSentences,
        explanation: data.explanation,
        tips: data.tips,
      }

      setTranslationHistory(prev => [entry, ...prev])
      setArabicInput('')
      addXp(5)
    } catch {
      setTranslateError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsTranslating(false)
    }
  }

  // ── Chat ─────────────────────────────────────────────────────────────────

  const startChat = useCallback(async (lvl: Level) => {
    setChatMessages([])
    setApiHistory([])
    setChatStarted(true)
    setIsChatLoading(true)
    setChatError('')

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', messages: [], level: lvl }),
      })
      if (!res.ok) throw new Error('فشل الاتصال')
      const data: ChatResponse = await res.json()

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'ai',
        content: data.aiMessage,
        correction: null,
        correctedVersion: null,
        encouragement: null,
        isCorrect: true,
        points: 0,
      }

      setChatMessages([aiMsg])
      setApiHistory([{ role: 'assistant', content: data.aiMessage }])
    } catch {
      setChatError('تعذر البدء. حاول مرة أخرى.')
      setChatStarted(false)
    } finally {
      setIsChatLoading(false)
    }
  }, [])

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || isChatLoading) return
    setChatInput('')
    setChatError('')

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: text,
      correction: null,
      correctedVersion: null,
      encouragement: null,
      isCorrect: true,
      points: 0,
    }

    const newHistory: ApiHistory[] = [...apiHistory, { role: 'user', content: text }]
    setChatMessages(prev => [...prev, userMsg])
    setApiHistory(newHistory)
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          messages: newHistory.slice(0, -1), // history before this reply
          level,
          userReply: text,
        }),
      })
      if (!res.ok) throw new Error('فشل الاتصال')
      const data: ChatResponse = await res.json()

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'ai',
        content: data.aiMessage,
        correction: data.correction,
        correctedVersion: data.correctedVersion,
        encouragement: data.encouragement,
        isCorrect: data.isCorrect,
        points: data.points,
      }

      setChatMessages(prev => [...prev, aiMsg])
      setApiHistory(prev => [...prev, { role: 'assistant', content: data.aiMessage }])
      addXp(data.points)
    } catch {
      setChatError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsChatLoading(false)
      setTimeout(() => chatInputRef.current?.focus(), 50)
    }
  }

  // Switch to chat and auto-start
  const handleModeSwitch = (m: Mode) => {
    setMode(m)
    if (m === 'chat' && !chatStarted) {
      startChat(level)
    }
  }

  // Level change — reset chat if in chat mode
  const handleLevelChange = (lvl: Level) => {
    setLevel(lvl)
    if (mode === 'chat') {
      startChat(lvl)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes xpFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
        }
        .animate-fadeUp { animation: fadeUp 0.4s ease-out both; }
        .animate-xpFloat { animation: xpFloat 1.8s ease-out both; }
        .glow-pulse { animation: glowPulse 2s infinite; }
        .dir-ltr { direction: ltr; }
      `}</style>

      <div
        className="min-h-screen pb-24"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #1e3a8a 70%, #1d4ed8 100%)',
        }}
        dir="rtl"
      >
        {/* ── Floating XP badges ── */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center gap-1">
          {xpFloats.map(f => (
            <div
              key={f.id}
              className="animate-xpFloat bg-amber-400 text-amber-900 font-black text-sm px-4 py-1.5 rounded-full shadow-lg"
            >
              +{f.points} XP ⚡
            </div>
          ))}
        </div>

        {/* ── Hero ── */}
        <div className="pt-24 pb-10 px-4 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-10 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-6 text-sm text-blue-100 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-400" />
              مجاني 100% — Powered by AI
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              تدرب على
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                الإنجليزية
              </span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md mx-auto mb-8">
              اكتب • ترجم • استمع • تحادث — لا تتوقف أبداً
            </p>

            {/* Stats bar */}
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-3 gap-4">
              <div className="flex items-center gap-1.5 text-amber-300 font-black">
                <Zap size={16} />
                <span className="text-lg">{xp}</span>
                <span className="text-xs font-medium opacity-80">XP</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-1.5 text-orange-300 font-black">
                <Flame size={16} />
                <span className="text-lg">{streak}</span>
                <span className="text-xs font-medium opacity-80">streak</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-1.5 text-blue-200 font-black">
                <Trophy size={16} className="text-yellow-400" />
                <span className="text-sm">{LEVEL_META[level].emoji} {level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Level selector ── */}
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <p className="text-blue-200/70 text-xs text-center mb-3 font-medium uppercase tracking-wider">
            اختر مستواك
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {(['A1', 'A2', 'B1'] as Level[]).map(lvl => (
              <LevelPill
                key={lvl}
                level={lvl}
                selected={level === lvl}
                onClick={() => handleLevelChange(lvl)}
              />
            ))}
          </div>
        </div>

        {/* ── Mode tabs ── */}
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <div className="flex bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-1.5 gap-1.5">
            <button
              onClick={() => handleModeSwitch('translate')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300
                ${mode === 'translate'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <BookOpen size={16} />
              ترجمة وتعلم
            </button>
            <button
              onClick={() => handleModeSwitch('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300
                ${mode === 'chat'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              <MessageCircle size={16} />
              محادثة
            </button>
          </div>
        </div>

        {/* ══════════════ TRANSLATION MODE ══════════════ */}
        {mode === 'translate' && (
          <div className="max-w-2xl mx-auto px-4 space-y-4">
            {/* Input card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-2xl">
              <p className="text-blue-200 text-sm font-semibold mb-3 flex items-center gap-2">
                <Mic size={14} /> اكتب بالعربية وسيترجم الذكاء الاصطناعي
              </p>
              <textarea
                ref={translateInputRef}
                value={arabicInput}
                onChange={e => { setArabicInput(e.target.value); setTranslateError('') }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTranslate() }}
                placeholder={PLACEHOLDER_ARABIC[placeholderIndex]}
                rows={4}
                className="w-full bg-white/15 border border-white/20 focus:border-blue-400 focus:outline-none rounded-2xl px-4 py-3 text-white text-base resize-none placeholder:text-white/30 transition-colors leading-relaxed"
              />
              {translateError && (
                <p className="text-red-300 text-sm mt-2 flex items-center gap-1.5">
                  <XCircle size={14} /> {translateError}
                </p>
              )}
              <div className="flex items-center justify-between mt-4 gap-3">
                <span className="text-white/30 text-xs">
                  {arabicInput.length}/500
                </span>
                <div className="flex items-center gap-2">
                  {arabicInput && (
                    <button
                      onClick={() => { setArabicInput(''); setTranslateError('') }}
                      className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !arabicInput.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/30 active:scale-95 glow-pulse"
                  >
                    {isTranslating ? (
                      <><Loader2 size={16} className="animate-spin" /> جارٍ الترجمة...</>
                    ) : (
                      <><Sparkles size={16} /> ترجم وتعلم</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Hint */}
            {translationHistory.length === 0 && !isTranslating && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✍️</div>
                <p className="text-white/40 text-sm">اكتب أي جملة بالعربية وستحصل على:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {['الترجمة الإنجليزية', '3 جمل مشابهة', 'شرح القواعد', 'صوت النطق'].map(t => (
                    <span key={t} className="bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {translationHistory.length > 0 && (
              <div className="space-y-3">
                {translationHistory.map((entry, i) => (
                  <div key={entry.id} className="animate-fadeUp">
                    <TranslationCard entry={entry} index={i} />
                  </div>
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {isTranslating && (
              <div className="bg-white rounded-3xl shadow-xl p-6 animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                <div className="h-8 bg-gray-100 rounded-full w-full" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-100 rounded-full w-4/6" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ CHAT MODE ══════════════ */}
        {mode === 'chat' && (
          <div className="max-w-2xl mx-auto px-4 flex flex-col" style={{ height: 'calc(100vh - 380px)', minHeight: 420 }}>

            {/* Chat header */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <p className="text-white font-bold text-sm">AI Coach</p>
                  <p className="text-blue-200/60 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                    متاح دائماً • مستوى {LEVEL_META[level].emoji} {level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => startChat(level)}
                title="محادثة جديدة"
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1 scrollbar-thin">
              {/* Empty state */}
              {!chatStarted && !isChatLoading && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-white/50 text-sm">جارٍ بدء المحادثة...</p>
                </div>
              )}

              {chatMessages.map(msg => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}

              {isChatLoading && <TypingIndicator />}

              {chatError && (
                <div className="flex justify-center">
                  <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
                    <XCircle size={14} />
                    {chatError}
                    <button
                      onClick={() => { setChatError(''); startChat(level) }}
                      className="underline opacity-80 hover:opacity-100 mr-2"
                    >
                      أعد المحاولة
                    </button>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="mt-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-end gap-3">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleChatSend()
                    }
                  }}
                  placeholder="اكتب ردك بالإنجليزية..."
                  rows={2}
                  dir="ltr"
                  disabled={isChatLoading || !chatStarted}
                  className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm resize-none placeholder:text-white/30 leading-relaxed"
                />
                <button
                  onClick={handleChatSend}
                  disabled={isChatLoading || !chatInput.trim() || !chatStarted}
                  className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 shrink-0"
                >
                  {isChatLoading
                    ? <Loader2 size={18} className="text-white animate-spin" />
                    : <ArrowLeft size={18} className="text-white" />
                  }
                </button>
              </div>
              <p className="text-white/30 text-xs text-center mt-2">
                Enter للإرسال • Shift+Enter لسطر جديد
              </p>
            </div>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="max-w-2xl mx-auto px-4 mt-12 text-center">
          <p className="text-blue-200/50 text-sm mb-3">هل تريد تدريباً أعمق مع المعلم؟</p>
          <a
            href="https://wa.me/212707902091?text=مرحبا، أريد الانضمام لبرنامج تعلم الإنجليزية"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold px-6 py-3 rounded-2xl transition-all duration-200 shadow-lg active:scale-95"
          >
            <MessageCircle size={16} />
            تواصل مع المعلم حمزة
          </a>
        </div>
      </div>
    </>
  )
}
