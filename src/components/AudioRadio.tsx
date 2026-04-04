'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Loader2, ChevronDown, ChevronUp, Volume2, AlertCircle } from 'lucide-react'
import FadeIn from './FadeIn'

/* ─── Episode data ──────────────────────────────────────── */
export interface Episode {
  id: number
  title: string
  titleAr: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  durationLabel: string   // shown before audio loads, e.g. "8:24"
  src: string             // path relative to /public, e.g. "/audio/ep1.mp3"
  gradient: string        // tailwind gradient classes
  icon: string            // emoji
  listens: string
  transcript?: string     // optional text transcript
}

const EPISODES: Episode[] = [
  {
    id: 1,
    title: 'Daily Conversation — Beginner',
    titleAr: 'محادثة يومية — مستوى مبتدئ',
    level: 'A2',
    durationLabel: '8:24',
    src: '/audio/episode-1.mp3',
    gradient: 'from-blue-600 to-indigo-600',
    icon: '🗣️',
    listens: '3.4k',
    transcript: `Good morning! How are you today?
— I'm fine, thank you. And you?
Good, thanks! What are your plans today?
— I have a meeting at 10, then lunch with a friend.
That sounds like a nice day!
— Yes, I hope so. Have a great day!
You too! Bye!`,
  },
  {
    id: 2,
    title: 'Job Interview English',
    titleAr: 'إنجليزية المقابلات الوظيفية',
    level: 'B1',
    durationLabel: '12:05',
    src: '/audio/episode-2.mp3',
    gradient: 'from-emerald-600 to-teal-600',
    icon: '💼',
    listens: '1.2k',
    transcript: `Tell me about yourself.
— I'm a software engineer with 3 years of experience in web development.
What are your strengths?
— I'm detail-oriented, I work well under pressure, and I enjoy solving complex problems.
Where do you see yourself in 5 years?
— I'd like to grow into a senior developer role and lead my own team.`,
  },
  {
    id: 3,
    title: 'Pronunciation Secrets',
    titleAr: 'أسرار النطق الاحترافي',
    level: 'B2',
    durationLabel: '15:40',
    src: '/audio/episode-3.mp3',
    gradient: 'from-purple-600 to-pink-600',
    icon: '🎤',
    listens: '2.1k',
    transcript: `The "TH" sound in English is one of the hardest for Arabic speakers.
Place your tongue between your teeth and blow air — "The", "This", "That".
Practice these words: think, three, through, throw.
Now the voiced TH: the, this, that, those, them.
Remember: most native speakers don't move their lips much. Keep it natural.`,
  },
]

/* ─── Level badge colors ──────────────────────────────────── */
const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-sky-100   text-sky-700',
  A2: 'bg-blue-100  text-blue-700',
  B1: 'bg-violet-100 text-violet-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-orange-100 text-orange-700',
  C2: 'bg-red-100   text-red-700',
}

/* ─── Helpers ─────────────────────────────────────────────── */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ─── Single Episode Card ─────────────────────────────────── */
interface CardProps {
  ep: Episode
  isActive: boolean       // this card is the currently selected one
  isPlaying: boolean      // currently playing
  onSelect: (id: number) => void
  onToggle: (id: number) => void
}

function EpisodeCard({ ep, isActive, isPlaying, onSelect, onToggle }: CardProps) {
  return (
    <div
      className={`radio-card rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? 'ring-4 ring-white/30 shadow-2xl scale-[1.02]'
          : 'hover:scale-[1.01] opacity-90 hover:opacity-100'
      }`}
      onClick={() => onSelect(ep.id)}
    >
      <div className={`bg-gradient-to-br ${ep.gradient} p-6 relative overflow-hidden`}>
        {/* Background emoji watermark */}
        <div className="absolute -bottom-3 -left-3 text-8xl opacity-10 pointer-events-none select-none">
          {ep.icon}
        </div>

        {/* Top row: badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`${LEVEL_COLORS[ep.level]} text-xs font-black px-3 py-1.5 rounded-full`}>
            {ep.level}
          </span>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            ⏱️ {ep.durationLabel}
          </span>
          <span className="bg-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
            👂 {ep.listens}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-black text-xl leading-snug mb-1">{ep.titleAr}</h3>
        <p className="text-white/60 text-sm font-medium mb-5">{ep.title}</p>

        {/* Play button row */}
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onToggle(ep.id) }}
            aria-label={isActive && isPlaying ? 'إيقاف' : 'تشغيل'}
            className="play-btn w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform flex-shrink-0"
          >
            {isActive && isPlaying
              ? <Pause size={18} className="text-gray-800" />
              : <Play  size={18} className="text-gray-800 mr-[-2px]" fill="currentColor" />
            }
          </button>
          <div>
            <p className="text-white/60 text-xs font-semibold">الحلقة {ep.id}</p>
            <p className="text-white font-bold text-sm">
              {isActive && isPlaying ? 'يتم التشغيل...' : 'اضغط للاستماع'}
            </p>
          </div>
          <div className="mr-auto">
            <Volume2 size={20} className={`transition-opacity ${isActive && isPlaying ? 'text-white animate-pulse' : 'text-white/40'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Expanded Player Panel ───────────────────────────────── */
interface PlayerProps {
  ep: Episode
  onToggle: () => void
}

function ExpandedPlayer({ ep, onToggle }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying,    setIsPlaying]    = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)
  const [hasError,     setHasError]     = useState(false)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [volume,       setVolume]       = useState(1)

  /* Recreate audio element each time episode changes */
  useEffect(() => {
    const audio = new Audio(ep.src)
    audio.preload = 'metadata'
    audioRef.current = audio

    const onMeta    = () => setDuration(audio.duration)
    const onTime    = () => setCurrentTime(audio.currentTime)
    const onStart   = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onError   = () => { setIsLoading(false); setHasError(true) }
    const onEnded   = () => { setIsPlaying(false); setCurrentTime(0); audio.currentTime = 0 }
    const onPlaying = () => { setIsLoading(false); setIsPlaying(true) }
    const onPause   = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate',     onTime)
    audio.addEventListener('loadstart',      onStart)
    audio.addEventListener('canplay',        onCanPlay)
    audio.addEventListener('error',          onError)
    audio.addEventListener('ended',          onEnded)
    audio.addEventListener('playing',        onPlaying)
    audio.addEventListener('pause',          onPause)

    // Auto-play when expanded
    audio.play().catch(() => setHasError(false)) // silence AbortError on fast unmount

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate',     onTime)
      audio.removeEventListener('loadstart',      onStart)
      audio.removeEventListener('canplay',        onCanPlay)
      audio.removeEventListener('error',          onError)
      audio.removeEventListener('ended',          onEnded)
      audio.removeEventListener('playing',        onPlaying)
      audio.removeEventListener('pause',          onPause)
      audio.src = ''
    }
  }, [ep.src])

  /* Volume sync */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      setIsLoading(true)
      audio.play().catch(() => { setIsLoading(false); setHasError(true) })
    }
  }, [isPlaying])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const t = parseFloat(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-gradient-to-br ${ep.gradient} rounded-3xl p-6 shadow-2xl`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className={`${LEVEL_COLORS[ep.level]} text-xs font-black px-3 py-1.5 rounded-full inline-block mb-2`}>
            {ep.level}
          </span>
          <h3 className="text-white font-black text-2xl leading-snug">{ep.titleAr}</h3>
          <p className="text-white/60 text-sm mt-0.5">{ep.title}</p>
        </div>
        <button
          onClick={onToggle}
          className="text-white/60 hover:text-white transition-colors mt-1 flex-shrink-0"
          aria-label="إغلاق"
        >
          ✕
        </button>
      </div>

      {/* Error state */}
      {hasError && (
        <div className="bg-black/30 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-300 flex-shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">الملف الصوتي غير متوفر حالياً</p>
            <p className="text-white/60 text-xs">أضف الملف إلى: <code className="bg-white/10 px-1 rounded">{ep.src}</code></p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <input
          type="range"
          className="audio-progress w-full"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={seek}
          disabled={hasError}
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.9) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
          }}
        />
        <div className="flex justify-between text-white/60 text-xs font-semibold mt-1" dir="ltr">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : ep.durationLabel}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4 mb-5">
        {/* Play / Pause */}
        <button
          onClick={toggle}
          disabled={hasError}
          aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
          className="play-btn w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading
            ? <Loader2 size={20} className="text-gray-700 animate-spin" />
            : isPlaying
              ? <Pause size={20} className="text-gray-800" />
              : <Play  size={20} className="text-gray-800 mr-[-2px]" fill="currentColor" />
          }
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1">
          <Volume2 size={16} className="text-white/60 flex-shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="audio-progress flex-1"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.8) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* Transcript toggle */}
      {ep.transcript && (
        <div>
          <button
            onClick={() => setShowTranscript(v => !v)}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold transition-colors mb-3"
          >
            {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showTranscript ? 'إخفاء النص' : 'عرض النص المكتوب'}
          </button>

          {showTranscript && (
            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-h-48 overflow-y-auto scrollbar-thin">
              {ep.transcript.split('\n').map((line, i) => (
                <p key={i} className="text-white/80 text-sm leading-relaxed font-mono mb-1" dir="ltr">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main AudioRadio Component ───────────────────────────── */
export default function AudioRadio() {
  const [activeId, setActiveId] = useState<number | null>(null)

  const activeEp = EPISODES.find(e => e.id === activeId) ?? null

  const handleSelect = (id: number) => {
    setActiveId(prev => (prev === id ? null : id))
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-300 font-bold text-sm px-5 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse inline-block" />
              راديو التعلم المجاني
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
              استمع وتعلم
            </h2>
            <p className="text-gray-400 text-xl">
              حلقات صوتية قصيرة ومفيدة — في أي وقت، من أي مكان
            </p>
          </div>
        </FadeIn>

        {/* Expanded player (shown when an episode is selected) */}
        {activeEp && (
          <FadeIn>
            <div className="mb-8">
              <ExpandedPlayer
                ep={activeEp}
                onToggle={() => setActiveId(null)}
              />
            </div>
          </FadeIn>
        )}

        {/* Episode cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {EPISODES.map((ep, i) => (
            <FadeIn key={ep.id} delay={i * 100}>
              <EpisodeCard
                ep={ep}
                isActive={activeId === ep.id}
                isPlaying={activeId === ep.id}
                onSelect={handleSelect}
                onToggle={handleSelect}
              />
            </FadeIn>
          ))}
        </div>

        {/* Add-files hint (shown when no active episode yet) */}
        {!activeId && (
          <FadeIn delay={300}>
            <p className="text-center text-gray-600 text-sm mt-8 font-mono">
              اضغط على أي حلقة للاستماع &nbsp;·&nbsp; ملفات الصوت: <span className="text-gray-500">/public/audio/episode-{'{1,2,3}'}.mp3</span>
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
