'use client'

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { icons, type LucideIcon, Volume2 } from 'lucide-react'

/**
 * The pieces every screen of VIIZA interactive shares: the printed book's
 * colours and faces (Bricolage Grotesque, Noto Kufi Arabic), the audio
 * (tap a sentence, hear it), speaking practice, and the reader's progress.
 *
 * Audio: each sentence the server knows has a recorded clip (the same
 * files as /audio/viiza, see viizaStopAudio). If the clip is not there yet,
 * or the sentence has none, the browser's own English voice reads it, so
 * every line can be heard from the first day.
 *
 * Progress lives in this browser (localStorage): the sections seen, the
 * best scores and the stops finished (the passport stamps).
 */

export const V = {
  navy: '#0E1240', navy2: '#161C58', navy3: '#232A72', ink: '#0E1240',
  red: '#A3262A', redD: '#7F1D21', redS: '#FBEEEC',
  saff: '#F2B300', saffD: '#8A6400', saffS: '#FFF5D6',
  cream: '#FBF6EC', paper: '#F5EFE3', line: '#E6E1D7', grey: '#5B6474',
  green: '#1E8E5A', greenS: '#E5F5EC', navyS: '#EEF0F8',
} as const

export const EN = "'Bricolage Grotesque', 'Noto Kufi Arabic', system-ui, sans-serif"
export const AR = "'Noto Kufi Arabic', 'Tajawal', system-ui, sans-serif"

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap'

export function useFonts() {
  useEffect(() => {
    if (document.getElementById('viiza-app-fonts')) return
    const l = document.createElement('link')
    l.id = 'viiza-app-fonts'; l.rel = 'stylesheet'; l.href = FONTS_HREF
    document.head.appendChild(l)
  }, [])
}

/** A lucide icon by name (the book's data names its pictures). */
export function Ico({ name, size = 18, color = 'currentColor', stroke = 2, className }: { name: string; size?: number; color?: string; stroke?: number; className?: string }) {
  const I = (icons as Record<string, LucideIcon>)[name] ?? icons.Circle
  return <I size={size} color={color} strokeWidth={stroke} aria-hidden className={className} />
}

/** Arabic that quotes English: each English run isolated so the order holds. */
export function Ar({ children, className = '', style, as = 'div' }: { children: string; className?: string; style?: CSSProperties; as?: 'div' | 'span' | 'p' }) {
  const parts = children.split(/([A-Za-z0-9][A-Za-z0-9\s/'’.,:+\-–&!?°%@]*[A-Za-z0-9!?°%]|[A-Za-z0-9])/).filter(Boolean)
  const Tag = as
  return (
    <Tag dir="rtl" className={className} style={{ fontFamily: AR, ...style }}>
      {parts.map((p, i) => (/[A-Za-z0-9]/.test(p) ? <bdi key={i} dir="ltr" style={{ fontFamily: /[A-Za-z]/.test(p) ? EN : undefined }}>{p}</bdi> : <Fragment key={i}>{p}</Fragment>))}
    </Tag>
  )
}

/* ── Audio ──────────────────────────────────────────────────────────── */

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

/** What a voice reads: blanks become a pause, a spelled word its letters. */
export const spoken = (t: string) => t.replace(/_{3,}/g, '…').replace(/\b(?:[A-Z]-)+[A-Z]\b/g, m => m.split('-').join(', '))

interface AudioApi {
  playing: string | null
  slow: boolean
  setSlow: (v: boolean) => void
  /** Play one sentence; resolves when it ends (or is stopped). */
  play: (text: string) => Promise<void>
  stop: () => void
}

const AudioCtx = createContext<AudioApi | null>(null)

export function AudioProvider({ clips, children }: { clips: Record<string, string>; children: ReactNode }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [slow, setSlowState] = useState(false)
  const el = useRef<HTMLAudioElement | null>(null)
  const done = useRef<(() => void) | null>(null)
  const missing = useRef(new Set<string>())

  useEffect(() => { try { setSlowState(localStorage.getItem('viiza.slow') === '1') } catch {} }, [])
  const setSlow = (v: boolean) => { setSlowState(v); try { localStorage.setItem('viiza.slow', v ? '1' : '0') } catch {} }

  const stop = useCallback(() => {
    el.current?.pause()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    done.current?.(); done.current = null
    setPlaying(null)
  }, [])

  const speak = useCallback((text: string, resolve: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(); return }
    const u = new SpeechSynthesisUtterance(spoken(text))
    const voices = window.speechSynthesis.getVoices()
    u.voice = voices.find(v => /en-GB/i.test(v.lang) && /female|Google UK English Female|Serena|Kate/i.test(v.name))
      ?? voices.find(v => /en-GB/i.test(v.lang)) ?? voices.find(v => /^en/i.test(v.lang)) ?? null
    u.lang = u.voice?.lang ?? 'en-GB'
    u.rate = slow ? 0.72 : 0.95
    u.onend = resolve; u.onerror = resolve
    window.speechSynthesis.speak(u)
  }, [slow])

  const play = useCallback((text: string) => new Promise<void>(resolve => {
    stop()
    setPlaying(text)
    const finish = () => { if (done.current === finish) { done.current = null; setPlaying(null) } ; resolve() }
    done.current = finish
    const base = clips[text]
    if (!base || !SUPA || missing.current.has(base)) { speak(text, finish); return }
    const a = el.current ?? (el.current = new Audio())
    a.src = `${SUPA}/storage/v1/object/public/audio/${base}-${slow ? 'slow' : 'normal'}.mp3`
    a.onended = finish
    a.onerror = () => { missing.current.add(base); if (done.current === finish) speak(text, finish) }
    a.play().catch(() => { if (done.current === finish) speak(text, finish) })
  }), [clips, slow, speak, stop])

  useEffect(() => () => stop(), [stop])
  const api = useMemo(() => ({ playing, slow, setSlow, play, stop }), [playing, slow, play, stop])
  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>
}

export function useAudio(): AudioApi {
  const a = useContext(AudioCtx)
  if (!a) throw new Error('useAudio outside AudioProvider')
  return a
}

/** A sentence you can tap to hear. */
export function Say({ text, children, className = '', style, icon = true, iconColor }: { text: string; children?: ReactNode; className?: string; style?: CSSProperties; icon?: boolean; iconColor?: string }) {
  const { play, playing } = useAudio()
  const on = playing === text
  return (
    <button type="button" dir="ltr" onClick={e => { e.stopPropagation(); play(text) }}
      className={`group inline-flex items-start gap-1.5 text-left transition ${on ? 'vz-playing' : ''} ${className}`}
      style={{ fontFamily: EN, ...style }}>
      {icon && <span className={`mt-[3px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition ${on ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}
        style={{ background: on ? V.saff : 'transparent', color: on ? V.navy : (iconColor ?? 'currentColor') }}><Volume2 size={13} strokeWidth={2.4} /></span>}
      <span className={on ? 'underline decoration-[3px] underline-offset-4' : ''} style={on ? { textDecorationColor: V.saff } : undefined}>{children ?? text}</span>
    </button>
  )
}

/* ── Speaking practice (the browser's speech recognition, where it exists) ── */

type Rec = { start: () => void; stop: () => void; abort: () => void; lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null }

export function useListen() {
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setOk(typeof window !== 'undefined' && !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)) }, [])
  const listen = useCallback(() => new Promise<string>(resolve => {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition
    if (!R) { resolve(''); return }
    const r = new R()
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
    let heard = ''
    r.onresult = e => { heard = e.results[0]?.[0]?.transcript ?? '' }
    r.onerror = () => {}
    r.onend = () => { setBusy(false); resolve(heard) }
    setBusy(true)
    try { r.start() } catch { setBusy(false); resolve('') }
    setTimeout(() => { try { r.stop() } catch {} }, 7000)
  }), [])
  return { ok, busy, listen }
}

const words = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean)
/** How close an answer is to a model (0–1): the model's words found in the answer. */
export function closeness(answer: string, model: string): number {
  const a = new Set(words(answer)), m = words(model)
  if (!m.length) return 0
  return m.filter(w => a.has(w)).length / m.length
}
/** The same answer, ignoring case, spaces and end punctuation. */
export const same = (a: string, b: string) => words(a).join(' ') === words(b).join(' ')

/* ── Progress ───────────────────────────────────────────────────────── */

export interface Progress { seen: Record<string, string[]>; done: number[]; best: Record<string, number> }
const KEY = 'viiza.progress.v1'
const EMPTY: Progress = { seen: {}, done: [], best: {} }

export function readProgress(): Progress {
  try { const p = JSON.parse(localStorage.getItem(KEY) ?? '') as Progress; return { ...EMPTY, ...p } } catch { return EMPTY }
}

export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY)
  useEffect(() => { setP(readProgress()) }, [])
  const save = useCallback((f: (p: Progress) => Progress) => {
    setP(prev => { const next = f(prev); try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {} ; return next })
  }, [])
  const markSeen = useCallback((n: number, section: string) => save(p => {
    const list = p.seen[n] ?? []
    return list.includes(section) ? p : { ...p, seen: { ...p.seen, [n]: [...list, section] } }
  }), [save])
  const markDone = useCallback((n: number) => save(p => (p.done.includes(n) ? p : { ...p, done: [...p.done, n] })), [save])
  const setBest = useCallback((key: string, score: number) => save(p => ((p.best[key] ?? -1) >= score ? p : { ...p, best: { ...p.best, [key]: score } })), [save])
  return { progress: p, markSeen, markDone, setBest }
}

/* ── Small UI ───────────────────────────────────────────────────────── */

export function Pill({ children, on, onClick, className = '' }: { children: ReactNode; on?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition active:scale-95 ${className}`}
      style={on ? { background: V.navy, color: '#fff' } : { background: '#fff', color: V.navy, border: `1px solid ${V.line}` }}>{children}</button>
  )
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`rounded-2xl bg-white p-4 shadow-[0_2px_14px_rgba(14,18,64,0.07)] sm:p-5 ${className}`} style={style}>{children}</div>
}

/** A section heading: English, a rule, Arabic. */
export function Head({ icon, en, ar, color = V.red }: { icon: string; en: string; ar: string; color?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5" dir="ltr">
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg" style={{ background: color }}><Ico name={icon} size={16} color="#fff" stroke={2.3} /></span>
      <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]" style={{ fontFamily: EN, color }}>{en}</span>
      <span className="h-[1.5px] flex-1" style={{ background: V.line }} />
      <Ar as="span" className="text-[15px] font-bold" style={{ color }}>{ar}</Ar>
    </div>
  )
}

export function Btn({ children, onClick, tone = 'navy', disabled, className = '' }: { children: ReactNode; onClick?: () => void; tone?: 'navy' | 'red' | 'saff' | 'ghost' | 'green'; disabled?: boolean; className?: string }) {
  const s: Record<string, CSSProperties> = {
    navy: { background: V.navy, color: '#fff' }, red: { background: V.red, color: '#fff' }, saff: { background: V.saff, color: V.navy },
    green: { background: V.green, color: '#fff' }, ghost: { background: 'transparent', color: V.navy, border: `1.5px solid ${V.line}` },
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-extrabold transition active:scale-[0.97] disabled:opacity-40 ${className}`}
      style={{ fontFamily: EN, ...s[tone] }}>{children}</button>
  )
}

/** Picks out a word in a sentence (any of its forms, with or without "a / the"). */
export function Mark({ text, word }: { text: string; word: string }) {
  const forms = word.replace(/\([^)]*\)/g, '').split(/\s*[/·]\s*/).map(w => w.trim()).filter(Boolean)
    .flatMap(w => [w, w.replace(/^(a|an|the) /i, '')]).sort((a, b) => b.length - a.length)
  const low = text.toLowerCase()
  const form = forms.find(w => low.includes(w.toLowerCase()))
  if (!form) return <>{text}</>
  const at = low.indexOf(form.toLowerCase())
  return <>{text.slice(0, at)}<b style={{ color: V.red }}>{text.slice(at, at + form.length)}</b>{text.slice(at + form.length)}</>
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

/* ── Full screen (to use the app, or record it, without the browser around it) ── */

/** The browser's full screen for the whole app; it stays on while the reader moves between sections, games and stops. */
export function useFullscreen() {
  const [on, setOn] = useState(false)
  const [can, setCan] = useState(false)
  useEffect(() => {
    setCan(!!document.documentElement.requestFullscreen)
    const f = () => setOn(!!document.fullscreenElement)
    f()
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])
  const toggle = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])
  return { on, can, toggle }
}

/**
 * In full screen on a large screen the app grows with it (CSS zoom), so it
 * fills a 1080p or larger display like a native app and records crisply,
 * instead of a narrow column in the middle.
 */
export function useStageZoom(on: boolean): number {
  const [z, setZ] = useState(1)
  useEffect(() => {
    const f = () => setZ(on ? Math.min(1.6, Math.max(1, window.innerWidth / 1200)) : 1)
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [on])
  return z
}
