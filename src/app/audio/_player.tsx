'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ListEnd, Pause, Play, Rabbit, Repeat1, RotateCcw, SkipBack, SkipForward, Turtle, Volume2, AudioLines } from 'lucide-react'

/**
 * The player of the /audio pages: one for the page, holding the page's lines
 * in order. It shows the line being played large, with its translation and
 * its place (book › lesson › section), a progress bar to drag (to hear a
 * word or a group of words again), back 2 seconds, previous / next, repeat
 * the line, and the speed: slow (the slow recording), normal, fast (the
 * normal one at 1.25×). A line plays alone, or the next follows when "auto"
 * is on (a section's "play all" turns it on until the section's end).
 */

/** A line: `src` is its file without the speed (`level1/abc`); `where` its place, for the player's header. */
export interface PlayClip { en: string; ar?: string; speaker?: string; label?: string; src: string; where?: string }
type Speed = 'slow' | 'normal' | 'fast'
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/audio/`
const fileOf = (c: PlayClip, s: Speed) => `${BASE}${c.src}-${s === 'slow' ? 'slow' : 'normal'}.mp3`

interface Ctx {
  clips: PlayClip[]; index: number; playing: boolean
  /** Play line i; with `until`, keep going line after line up to that index. */
  select: (i: number, until?: number) => void
}
const PlayerCtx = createContext<Ctx | null>(null)
const usePlayer = () => useContext(PlayerCtx)!

/* The card needs more than the rows: its own context. */
interface CardCtx {
  clip?: PlayClip; index: number; count: number; playing: boolean; speed: Speed; loop: boolean; auto: boolean; t: number; dur: number
  toggle: () => void; prev: () => void; next: () => void; back: () => void; seek: (s: number) => void
  setSpeed: (s: Speed) => void; setLoop: (v: boolean) => void; setAuto: (v: boolean) => void
}
const CardContext = createContext<CardCtx | null>(null)

export function Player({ clips, children }: { clips: PlayClip[]; children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedState] = useState<Speed>('slow')
  const [loop, setLoop] = useState(false)
  const [auto, setAuto] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const until = useRef<number | null>(null)
  const wantPlay = useRef(false)
  const keepRatio = useRef(0)

  useEffect(() => {
    try { const s = localStorage.getItem('level1-audio-speed'); if (s === 'slow' || s === 'normal' || s === 'fast') setSpeedState(s) } catch { /* no storage */ }
  }, [])

  const clip = clips[index]
  const file = clip ? fileOf(clip, speed) : ''
  const lastIndex = useRef(index)

  // A new line or another recording: load it, keeping the place when only the speed changed.
  useEffect(() => {
    const a = audio.current
    if (!a || !file) return
    keepRatio.current = lastIndex.current === index && a.duration ? a.currentTime / a.duration : 0
    lastIndex.current = index
    a.src = file
    a.load()
    setT(0)
  }, [file, index])

  useEffect(() => {
    const a = audio.current
    if (!a) return
    a.playbackRate = speed === 'fast' ? 1.25 : 1
    ;(a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
  }, [speed, file])

  // A smooth bar while playing.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => { if (audio.current) setT(audio.current.currentTime); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const start = () => { wantPlay.current = false; audio.current?.play().catch(() => setPlaying(false)) }
  const select = useCallback((i: number, to?: number) => {
    until.current = to ?? null
    if (to != null) setAuto(true)
    if (i === index && audio.current?.src) { audio.current.currentTime = 0; start() } else { wantPlay.current = true; setIndex(i) }
  }, [index])

  const onLoaded = () => {
    const a = audio.current!
    setDur(a.duration || 0)
    if (keepRatio.current) a.currentTime = keepRatio.current * a.duration
    a.playbackRate = speed === 'fast' ? 1.25 : 1
    if (wantPlay.current) start()
  }
  const onEnded = () => {
    const a = audio.current!
    if (loop) { a.currentTime = 0; start(); return }
    const stop = until.current ?? (auto ? clips.length - 1 : index)
    if (index < stop) { setTimeout(() => { wantPlay.current = true; setIndex(index + 1) }, 450) } else { setPlaying(false); until.current = null }
  }

  const card: CardCtx = {
    clip, index, count: clips.length, playing, speed, loop, auto, t, dur,
    toggle: () => { const a = audio.current; if (!a) return; if (a.paused) { if (a.ended) a.currentTime = 0; start() } else a.pause() },
    prev: () => select(Math.max(0, index - 1)),
    next: () => select(Math.min(clips.length - 1, index + 1)),
    back: () => { const a = audio.current; if (a) { a.currentTime = Math.max(0, a.currentTime - 2); setT(a.currentTime); if (a.paused) start() } },
    seek: s => { const a = audio.current; if (a) { a.currentTime = s; setT(s) } },
    setSpeed: s => { setSpeedState(s); try { localStorage.setItem('level1-audio-speed', s) } catch { /* no storage */ } },
    setLoop, setAuto: v => { setAuto(v); if (!v) until.current = null },
  }

  return (
    <PlayerCtx.Provider value={{ clips, index, playing, select }}>
      <CardContext.Provider value={card}>
        {children}
        <audio ref={audio} preload="metadata" onLoadedMetadata={onLoaded} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={onEnded} onTimeUpdate={e => { if (!playing) setT(e.currentTarget.currentTime) }} className="hidden" />
      </CardContext.Provider>
    </PlayerCtx.Provider>
  )
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** The big white player: the line, its translation, the bar, the buttons, the speed. */
export function PlayerCard() {
  const p = useContext(CardContext)!
  const c = p.clip
  const btn = 'w-11 h-11 rounded-full flex items-center justify-center text-[#14306B] hover:bg-[#EEF2F9] disabled:opacity-30'
  return (
    <section className="rounded-3xl bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgba(20,48,107,0.12)] ring-1 ring-[#D6DCE8]" dir="ltr">
      <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-[#5B6474]">
        <span className="truncate">{c?.where ?? ''}</span>
        <span className="shrink-0 rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[#14306B]">{p.count ? p.index + 1 : 0} / {p.count}</span>
      </div>

      <div className="mt-3 min-h-[118px] sm:min-h-[136px] flex flex-col justify-center text-center">
        {(c?.speaker || c?.label) && <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#B8862F]">{c.speaker ?? c.label}</div>}
        <div className="mt-1 text-[24px] sm:text-[32px] font-bold leading-tight text-[#14306B] break-words">{c?.en ?? 'Choose a line below'}</div>
        {c?.ar && <div className="font-arabic mt-2 text-[17px] sm:text-[20px] text-[#5B6474]" dir="rtl">{c.ar}</div>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="w-10 text-right text-[12px] tabular-nums text-[#5B6474]">{mmss(p.t)}</span>
        <input type="range" min={0} max={p.dur || 0} step={0.01} value={Math.min(p.t, p.dur || 0)} onChange={e => p.seek(Number(e.target.value))}
          aria-label="Progress" className="flex-1 h-2 cursor-pointer accent-[#B8862F]" />
        <span className="w-10 text-[12px] tabular-nums text-[#5B6474]">{mmss(p.dur)}</span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 sm:gap-3">
        <button type="button" onClick={p.back} className={btn} title="Back 2 seconds · رجوع ثانيتين" aria-label="Back 2 seconds"><RotateCcw size={20} /></button>
        <button type="button" onClick={p.prev} disabled={p.index === 0} className={btn} aria-label="Previous line"><SkipBack size={20} /></button>
        <button type="button" onClick={p.toggle} aria-label={p.playing ? 'Pause' : 'Play'}
          className="w-16 h-16 rounded-full bg-[#B8862F] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(184,134,47,0.4)]">
          {p.playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button type="button" onClick={p.next} disabled={p.index >= p.count - 1} className={btn} aria-label="Next line"><SkipForward size={20} /></button>
        <button type="button" onClick={() => p.setLoop(!p.loop)} aria-pressed={p.loop} title="Repeat this line · أعد السطر"
          className={`${btn} ${p.loop ? 'bg-[#FBF5E9] text-[#B8862F] ring-1 ring-[#B8862F]' : ''}`} aria-label="Repeat this line"><Repeat1 size={20} /></button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex rounded-full bg-[#EEF2F9] p-1">
          {([['slow', Turtle, 'Slow', 'بطيء'], ['normal', Volume2, 'Normal', 'عادي'], ['fast', Rabbit, 'Fast', 'سريع']] as const).map(([s, Icon, en, ar]) => (
            <button key={s} type="button" onClick={() => p.setSpeed(s)} aria-pressed={p.speed === s}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${p.speed === s ? 'bg-[#14306B] text-white' : 'text-[#14306B]'}`}>
              <Icon size={15} />{en}<span className="font-arabic hidden sm:inline text-[12px] opacity-75">{ar}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => p.setAuto(!p.auto)} aria-pressed={p.auto}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ${p.auto ? 'bg-[#FBF5E9] text-[#B8862F] ring-[#B8862F]' : 'text-[#5B6474] ring-[#D6DCE8]'}`}>
          <ListEnd size={15} />Auto next<span className="font-arabic text-[12px] opacity-75">التالي تلقائيًا</span>
        </button>
      </div>
    </section>
  )
}

/** A line of the list: tap to hear it in the player. */
export function Track({ i, compact }: { i: number; compact?: boolean }) {
  const { clips, index, playing, select } = usePlayer()
  const c = clips[i]
  const on = index === i
  return (
    <button type="button" onClick={() => select(i)}
      className={`w-full flex items-start gap-3 rounded-xl px-3 ${compact ? 'py-1.5' : 'py-2.5'} text-left transition ${on ? 'bg-[#FBF5E9] ring-1 ring-[#B8862F]' : 'hover:bg-[#EEF2F9]'}`} dir="ltr">
      <span className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${on && playing ? 'bg-[#B8862F]' : 'bg-[#14306B]'}`}>
        {on && playing ? <AudioLines size={13} color="#fff" /> : <Play size={12} color="#fff" className="ml-[2px]" />}
      </span>
      <span className="min-w-0">
        {(c.label || c.speaker) && <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-[#B8862F]">{c.label ?? c.speaker}</span>}
        <span className="block text-[14.5px] font-semibold leading-snug text-[#14306B]">{c.en}</span>
        {c.ar && <span className="font-arabic block text-[12.5px] text-[#5B6474]" dir="rtl">{c.ar}</span>}
      </span>
    </button>
  )
}

/** "Play all": lines `from`…`to` one after the other. */
export function PlayAll({ from, to }: { from: number; to: number }) {
  const { select } = usePlayer()
  return (
    <button type="button" onClick={() => select(from, to)}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#14306B] px-3 py-1 text-[12.5px] font-semibold text-white">
      <Play size={12} /> Play all <span className="font-arabic opacity-80">استمع للكل</span>
    </button>
  )
}
