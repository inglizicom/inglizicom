'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Maximize, Volume2, VolumeX, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'

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
  const hideTimer = useRef<any>(null)
  const [ready, setReady]     = useState(false)
  const [started, setStarted] = useState(false)   // has played at least once
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded]     = useState(false)
  const [muted, setMuted]     = useState(false)
  const [cur, setCur]         = useState(0)
  const [dur, setDur]         = useState(0)
  const [showCtl, setShowCtl] = useState(true)    // controls visible

  useEffect(() => {
    if (!id) return
    let interval: any, cancelled = false
    function fireWatched() { if (!watched.current) { watched.current = true; onWatched?.() } }

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
            const isPlay = st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING
            setPlaying(isPlay)
            if (st === YT.PlayerState.PLAYING) {
              setStarted(true); setEnded(false)
              try { playerRef.current?.setVolume(100); playerRef.current?.unMute() } catch {}
              setMuted(false)
            }
            if (st === YT.PlayerState.ENDED) { setEnded(true); fireWatched() }
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
    return () => { cancelled = true; clearInterval(interval); clearTimeout(hideTimer.current); try { playerRef.current?.destroy() } catch {} }
  }, [id])

  // Auto-hide controls while playing; keep them up while paused.
  useEffect(() => {
    clearTimeout(hideTimer.current)
    if (playing) hideTimer.current = setTimeout(() => setShowCtl(false), 3200)
    else setShowCtl(true)
    return () => clearTimeout(hideTimer.current)
  }, [playing])

  // Unlock orientation when leaving fullscreen.
  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) { try { (screen.orientation as any)?.unlock?.() } catch {} } }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs as any)
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs as any) }
  }, [])

  // Tapping the video reveals controls (does NOT pause). Re-arms the hide timer.
  function reveal() {
    setShowCtl(true)
    clearTimeout(hideTimer.current)
    if (playing) hideTimer.current = setTimeout(() => setShowCtl(false), 3200)
  }
  function toggle() { const p = playerRef.current; if (!p) return; playing ? p.pauseVideo() : p.playVideo() }
  function replay() { const p = playerRef.current; if (!p) return; p.seekTo(0, true); p.playVideo(); setEnded(false) }
  function seek(v: number) { playerRef.current?.seekTo(v, true); setCur(v) }
  function toggleMute() { const p = playerRef.current; if (!p) return; muted ? (p.unMute(), p.setVolume(100)) : p.mute(); setMuted(!muted) }
  function fullscreen() {
    const el: any = wrapRef.current; if (!el) return
    const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement
    if (isFs) { (document.exitFullscreen || (document as any).webkitExitFullscreen)?.call(document); return }
    ;(el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen)?.call(el)
    setTimeout(() => { try { (screen.orientation as any)?.lock?.('landscape') } catch {} }, 120)  // auto-rotate on mobile
  }

  const progressPct = dur > 0 ? (cur / dur) * 100 : 0
  const remain = Math.max(0, dur - cur)
  // black cover ONLY for: loading, before-first-play, and the end screen.
  // (Pausing mid-video keeps the frame visible so the student can read it.)
  const cover = !ready || (!started && !playing) || ended

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 sm:p-4 vp-fade" dir="rtl" onClick={onClose}>
      <div ref={wrapRef} className="relative w-full sm:max-w-3xl bg-black sm:rounded-2xl overflow-hidden vp-pop" onClick={e => e.stopPropagation()}>

        {/* Top bar — auto-hides with the controls */}
        <div className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showCtl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="text-white font-bold text-[14px] truncate flex items-center gap-2">
            {watched.current && <CheckCircle2 size={16} className="text-emerald-400" />}
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
              {/* iframe — wrapper has pointer-events:none so the (replacing) iframe INHERITS it. */}
              <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
                <div ref={holderRef} className="w-full h-full" />
              </div>

              {/* tap layer — reveals controls (never pauses) */}
              <button onClick={reveal} className="absolute inset-0 z-10" aria-label="إظهار أدوات التحكم" />

              {/* opaque cover only for loading / first-play / end screen */}
              {cover && (
                <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center gap-3">
                  {!ready
                    ? <Loader2 className="animate-spin text-yellow-400" size={32} />
                    : ended
                      ? <>
                          <CheckCircle2 size={40} className="text-emerald-400 vp-pop" />
                          <button onClick={replay} className="flex items-center gap-2 text-white/90 text-[13px] font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"><RotateCcw size={15} /> إعادة المشاهدة</button>
                        </>
                      : <button onClick={toggle} className="w-16 h-16 rounded-full bg-yellow-400/90 flex items-center justify-center shadow-lg vp-pulse"><Play size={28} className="text-black" style={{ marginInlineStart: 3 }} /></button>}
                </div>
              )}

              {/* center play button when PAUSED mid-video — frame stays visible behind it */}
              {started && !playing && !ended && ready && (
                <button onClick={toggle} className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-200 ${showCtl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <span className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"><Play size={28} className="text-white" style={{ marginInlineStart: 3 }} /></span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Custom controls — auto-hide while playing */}
        {id && (
          <div className={`absolute bottom-0 inset-x-0 z-30 px-4 pb-3 pt-6 bg-gradient-to-t from-black/85 to-transparent transition-opacity duration-300 ${showCtl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* seek bar — LTR so progress grows left→right like every video player */}
            <div className="relative h-1.5 bg-white/25 rounded-full mb-2 cursor-pointer" dir="ltr"
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); const ratio = (e.clientX - r.left) / r.width; seek(Math.min(1, Math.max(0, ratio)) * dur) }}>
              <div className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-[width] duration-200" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-white" dir="ltr">
              <div className="flex items-center gap-3">
                <button onClick={toggle}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
                <button onClick={toggleMute}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                <span className="text-[12px] tabular-nums">{fmt(cur)} / {fmt(dur)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] tabular-nums text-white/70">-{fmt(remain)}</span>
                <button onClick={fullscreen}><Maximize size={18} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
