'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Maximize, Volume2, VolumeX, Loader2, CheckCircle2 } from 'lucide-react'

/* Extract a YouTube video id from any URL form (watch, youtu.be, embed, shorts). */
function ytId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/)
  if (m) return m[1]
  const q = url.match(/[?&]v=([\w-]{11})/)
  return q ? q[1] : null
}

/* Load the YouTube IFrame API once. */
let apiPromise: Promise<void> | null = null
function loadYT(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const w = window as any
  if (w.YT && w.YT.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>(resolve => {
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return apiPromise
}

const fmt = (s: number) => { const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${String(sec).padStart(2, '0')}` }

interface Props { url: string; title?: string; onClose: () => void; onWatched?: () => void }

export default function VideoPlayer({ url, title, onClose, onWatched }: Props) {
  const id = ytId(url)
  const holderRef = useRef<HTMLDivElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const watched   = useRef(false)
  const [ready, setReady]     = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted]     = useState(false)
  const [cur, setCur]         = useState(0)
  const [dur, setDur]         = useState(0)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (!id) return
    let interval: any, cancelled = false
    function fireWatched() { if (!watched.current) { watched.current = true; setDone(true); onWatched?.() } }

    loadYT().then(() => {
      if (cancelled || !holderRef.current) return
      const YT = (window as any).YT
      playerRef.current = new YT.Player(holderRef.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId: id,
        width: '100%', height: '100%',
        playerVars: {
          controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, disablekb: 1,
          fs: 0, playsinline: 1, autoplay: 1, cc_load_policy: 0, showinfo: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (e: any) => {
            setReady(true); setDur(e.target.getDuration() || 0)
            try { e.target.setVolume(100); e.target.unMute() } catch {}   // loudest, unmuted
            try { e.target.playVideo() } catch {}
          },
          onStateChange: (e: any) => {
            const st = e.data
            // treat playing + buffering as "playing" so the cover doesn't flash mid-stream
            setPlaying(st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING)
            if (st === YT.PlayerState.PLAYING) { try { playerRef.current?.setVolume(100); playerRef.current?.unMute() } catch {} ; setMuted(false) }
            if (st === YT.PlayerState.ENDED) fireWatched()
          },
        },
      })
      interval = setInterval(() => {
        const p = playerRef.current
        if (p && p.getCurrentTime) {
          const c = p.getCurrentTime() || 0, d = p.getDuration() || 0
          setCur(c); if (d) setDur(d)
          if (d > 0 && c / d >= 0.92) fireWatched()
        }
      }, 500)
    })
    return () => { cancelled = true; clearInterval(interval); try { playerRef.current?.destroy() } catch {} }
  }, [id])

  // Unlock orientation when leaving fullscreen.
  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) { try { (screen.orientation as any)?.unlock?.() } catch {} } }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs as any)
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs as any) }
  }, [])

  function toggle() { const p = playerRef.current; if (!p) return; playing ? p.pauseVideo() : p.playVideo() }
  function seek(v: number) { playerRef.current?.seekTo(v, true); setCur(v) }
  function toggleMute() { const p = playerRef.current; if (!p) return; muted ? (p.unMute(), p.setVolume(100)) : p.mute(); setMuted(!muted) }
  function fullscreen() {
    const el: any = wrapRef.current; if (!el) return
    const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement
    if (isFs) { (document.exitFullscreen || (document as any).webkitExitFullscreen)?.call(document); return }
    ;(el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen)?.call(el)
    // auto-rotate to landscape on mobile
    setTimeout(() => { try { (screen.orientation as any)?.lock?.('landscape') } catch {} }, 120)
  }

  const progressPct = dur > 0 ? (cur / dur) * 100 : 0

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 sm:p-4" dir="rtl" onClick={onClose}>
      <div ref={wrapRef} className="relative w-full sm:max-w-3xl bg-black sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Top bar (covers any YT title flash) */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <span className="text-white font-bold text-[14px] truncate flex items-center gap-2">
            {done && <CheckCircle2 size={16} className="text-emerald-400" />}
            {title}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={22} /></button>
        </div>

        {/* Video frame */}
        <div className="relative aspect-video bg-black">
          {!id ? (
            <div className="absolute inset-0 flex items-center justify-center text-white text-[14px]">رابط الفيديو غير صالح</div>
          ) : (
            <>
              {/* iframe — wrapper has pointer-events:none so the (replacing) iframe INHERITS it.
                  NO YouTube chrome/logo/title/links are ever reachable. */}
              <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
                <div ref={holderRef} className="w-full h-full" />
              </div>
              {/* our click layer */}
              <button onClick={toggle} className="absolute inset-0 z-10" aria-label="تشغيل/إيقاف" />
              {/* opaque cover when not playing — fully hides YouTube's paused overlay / related videos / thumbnail */}
              {(!playing || !ready) && (
                <div className="absolute inset-0 z-20 bg-black flex items-center justify-center pointer-events-none">
                  {!ready
                    ? <Loader2 className="animate-spin text-yellow-400" size={32} />
                    : <div className="w-16 h-16 rounded-full bg-yellow-400/90 flex items-center justify-center shadow-lg"><Play size={28} className="text-black" style={{ marginInlineStart: 3 }} /></div>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Custom controls — looks like a hosted player */}
        {id && (
          <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-3 pt-6 bg-gradient-to-t from-black/85 to-transparent">
            <div className="relative h-1.5 bg-white/25 rounded-full mb-2 cursor-pointer"
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); const ratio = 1 - (e.clientX - r.left) / r.width; seek(ratio * dur) }}>
              <div className="absolute inset-y-0 right-0 bg-yellow-400 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button onClick={toggle}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
                <button onClick={toggleMute}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                <span className="text-[12px] tabular-nums" dir="ltr">{fmt(cur)} / {fmt(dur)}</span>
              </div>
              <button onClick={fullscreen}><Maximize size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
