'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Pause, Play, Rabbit, Turtle } from 'lucide-react'

/**
 * The audio of the Level 1 play pages: one player for the page, a speed
 * switch (slow for learning, normal), a play button per line and a "play
 * all" for a conversation. Only one line sounds at a time.
 */

export interface PlayClip { en: string; ar?: string; speaker?: string; label?: string; slow: string; normal: string }
type Speed = 'slow' | 'normal'

interface Ctx { speed: Speed; setSpeed: (s: Speed) => void; playing: string | null; play: (key: string, clips: PlayClip[], from?: number) => void; stop: () => void }
const PlayerCtx = createContext<Ctx | null>(null)
const usePlayer = () => useContext(PlayerCtx)!

export function Player({ children }: { children: ReactNode }) {
  const [speed, setSpeedState] = useState<Speed>('slow')
  const [playing, setPlaying] = useState<string | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const run = useRef(0)

  useEffect(() => {
    try { const s = localStorage.getItem('level1-play-speed'); if (s === 'slow' || s === 'normal') setSpeedState(s) } catch { /* no storage */ }
  }, [])
  const setSpeed = (s: Speed) => { setSpeedState(s); try { localStorage.setItem('level1-play-speed', s) } catch { /* no storage */ } }

  const stop = useCallback(() => { run.current++; audio.current?.pause(); setPlaying(null) }, [])
  /** Plays clips[from…] one after the other under `key` (a line is a list of one). */
  const play = useCallback((key: string, clips: PlayClip[], from = 0) => {
    const id = ++run.current
    audio.current?.pause()
    const next = (i: number) => {
      if (id !== run.current) return
      if (i >= clips.length) { setPlaying(null); return }
      setPlaying(clips.length > 1 ? `${key}#${i}` : key)
      const a = new Audio(clips[i][speed])
      audio.current = a
      a.onended = () => setTimeout(() => next(i + 1), 350)
      a.onerror = () => next(i + 1)
      a.play().catch(() => setPlaying(null))
    }
    next(from)
  }, [speed])

  return <PlayerCtx.Provider value={{ speed, setSpeed, playing, play, stop }}>{children}</PlayerCtx.Provider>
}

export function SpeedSwitch() {
  const { speed, setSpeed } = usePlayer()
  return (
    <div className="inline-flex rounded-full bg-white/10 p-1" dir="ltr">
      {([['slow', Turtle, 'Slow', 'ببطء'], ['normal', Rabbit, 'Normal', 'عادي']] as const).map(([s, Icon, en, ar]) => (
        <button key={s} type="button" onClick={() => setSpeed(s)} aria-pressed={speed === s}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition ${speed === s ? 'bg-[#B8862F] text-white' : 'text-white/80'}`}>
          <Icon size={15} /> {en} <span className="font-arabic text-[12px] opacity-80">{ar}</span>
        </button>
      ))}
    </div>
  )
}

/** One line: a round play button, the English, and its Arabic or speaker underneath. */
export function PlayLine({ k, clip, list, index = 0 }: { k: string; clip: PlayClip; list?: PlayClip[]; index?: number }) {
  const { playing, play, stop } = usePlayer()
  const key = list ? `${k}#${index}` : k
  const on = playing === key
  return (
    <button type="button" onClick={() => (on ? stop() : list ? play(k, list, index) : play(k, [clip]))}
      className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${on ? 'bg-[#FBF5E9] ring-1 ring-[#B8862F]' : 'hover:bg-[#EEF2F9]'}`} dir="ltr">
      <span className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${on ? 'bg-[#B8862F]' : 'bg-[#14306B]'}`}>
        {on ? <Pause size={14} color="#fff" /> : <Play size={14} color="#fff" className="ml-[2px]" />}
      </span>
      <span className="min-w-0">
        {(clip.label || clip.speaker) && <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#B8862F]">{clip.label ?? clip.speaker}</span>}
        <span className="block text-[15px] font-semibold leading-snug text-[#14306B]">{clip.en}</span>
        {clip.ar && <span className="block font-arabic text-[13px] text-[#5B6474]" dir="rtl">{clip.ar}</span>}
      </span>
    </button>
  )
}

/** "Play all": a whole conversation or reading, line after line. */
export function PlayAll({ k, clips }: { k: string; clips: PlayClip[] }) {
  const { playing, play, stop } = usePlayer()
  const on = playing?.startsWith(`${k}#`) ?? false
  return (
    <button type="button" onClick={() => (on ? stop() : play(k, clips))}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#14306B] px-3 py-1 text-[12.5px] font-semibold text-[#14306B]">
      {on ? <Pause size={13} /> : <Play size={13} />} {on ? 'Stop' : 'Play all'} <span className="font-arabic opacity-70">{on ? 'إيقاف' : 'استمع للكل'}</span>
    </button>
  )
}
