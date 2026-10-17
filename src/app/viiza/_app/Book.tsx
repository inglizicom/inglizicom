'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, Gauge, LayoutGrid, Maximize, Minimize, MoveHorizontal } from 'lucide-react'
import type { Stop } from '@/data/viiza-book/types'
import type { StopKind } from '@/data/viiza-book'
import { StopPage } from '@/app/admin/level2-book/_stop'
import { Ar, EN, pad2, useAudio, V } from './kit'

/**
 * Book view: the stop's six printed pages exactly as in the book, one per
 * screen, scaled to fit it (or to its width, to read small print), turned
 * with the arrows, the keyboard or a swipe, and full screen where the
 * browser allows it. Every English sentence on the page can be tapped to
 * hear it: the tap is matched to the stop's sentences (and their recorded
 * clips); any other English text is read by the browser's voice.
 */

export const BOOK_KINDS: [StopKind, string][] = [
  ['opener', 'Opener'], ['words', 'Vocabulary'], ['exchanges', 'You hear · You say'],
  ['real', 'In real life'], ['talk', 'Conversation'], ['practice', 'Practice'],
]

const PAGE_W = 794, PAGE_H = 1123
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '')
const ARABIC = /[؀-ۿ]/

/** Every sentence of the stop that a tap on its page may mean, by its letters only (blanks drawn as lines lose their underscores). */
function sentencesOf(s: Stop, clips: Record<string, string>): Map<string, string> {
  const all = new Map<string, string>()
  const add = (t?: string) => { if (t) { const k = norm(t); if (k && !all.has(k)) all.set(k, t) } }
  Object.keys(clips).forEach(add)
  s.canDo.forEach(([en]) => add(en))
  s.watch.forEach(([, right]) => add(right))
  s.card.forEach(([en]) => add(en))
  s.more?.check.forEach(([t]) => add(t))
  ;[...s.roleplay.a, ...s.roleplay.b].forEach(([en]) => add(en))
  return all
}

export function BookView({ s, clips, start, firstPage, prev, next, onExit }: {
  s: Stop; clips: Record<string, string>; start: number; firstPage: number
  prev: { n: number } | null; next: { n: number } | null
  onExit: (page: number) => void
}) {
  const { play, stop, slow, setSlow } = useAudio()
  const [page, setPage] = useState(start)
  const [dir, setDir] = useState(1)
  const [fitWidth, setFitWidth] = useState(false)
  const [full, setFull] = useState(false)
  const [canFull, setCanFull] = useState(false)
  const [hint, setHint] = useState(true)
  const stage = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const known = useMemo(() => sentencesOf(s, clips), [s, clips])
  const lit = useRef<HTMLElement | null>(null)

  useEffect(() => { setCanFull(!!document.documentElement.requestFullscreen) }, [])
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  useEffect(() => { const t = setTimeout(() => setHint(false), 4500); return () => clearTimeout(t) }, [])

  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Whole page: the page fits the screen. Zoom: about twice the width of a phone (pan to read), the width of a desktop.
  const fitW = (box.w - 16) / PAGE_W
  const scale = box.w ? (fitWidth ? Math.min(1.6, Math.max(fitW, Math.min(1, fitW * 1.9))) : Math.min((box.w - 24) / PAGE_W, (box.h - 24) / PAGE_H)) : 0.5

  const turn = useCallback((d: number) => {
    const p = page + d
    if (p < 0 || p >= BOOK_KINDS.length) return
    stop(); setDir(d); setPage(p)
    stage.current?.scrollTo({ top: 0 })
  }, [page, stop])

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); if (e.key === 'Escape' && !document.fullscreenElement) onExit(page) }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [turn, onExit, page])

  // Swipe to turn (not while reading at full width, where the finger scrolls).
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current; touch.current = null
    if (!t || fitWidth) return
    const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1)
  }

  function light(el: HTMLElement | null) {
    if (lit.current) { lit.current.style.outline = ''; lit.current.style.background = '' }
    lit.current = el
    if (el) { el.style.outline = `3px solid ${V.saff}`; el.style.background = 'rgba(242,179,0,0.18)' }
  }

  function onPageClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    let el: HTMLElement | null = target
    for (let i = 0; el && i < 5; i++, el = el.parentElement) {
      const t = el.textContent?.trim() ?? ''
      if (!t || t.length > 220) break
      const hit = known.get(norm(t))
      if (hit) { light(el); play(hit).then(() => light(null)); return }
    }
    const t = target.textContent?.trim() ?? ''
    if (t && t.length <= 160 && !ARABIC.test(t) && /[A-Za-z]{2}/.test(t) && target.children.length === 0) {
      light(target); play(t).then(() => light(null))
    }
  }

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const kind = BOOK_KINDS[page][0]
  const btn = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold transition'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1B1F45', fontFamily: EN }}>
      {/* Bar */}
      <div className="flex shrink-0 items-center gap-2 px-2 py-2 sm:px-4" dir="ltr" style={{ background: V.navy }}>
        <button onClick={() => onExit(page)} className={`${btn} text-white hover:bg-white/10`} title="Back to the app view"><LayoutGrid size={15} /> <span className="hidden sm:inline">App view</span></button>
        <span className="rounded-lg px-2 py-1 text-[12px] font-extrabold text-white" style={{ background: V.red }}>STOP {pad2(s.n)}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-white/85">Page {page + 1} of 6 · <span className="text-white">{BOOK_KINDS[page][1]}</span></span>
        <button onClick={() => setSlow(!slow)} className={btn} style={slow ? { background: V.saff, color: V.navy } : { color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title="Slow audio"><Gauge size={14} /><span className="hidden sm:inline">{slow ? 'Slow' : 'Normal'}</span></button>
        <button onClick={() => setFitWidth(f => !f)} className={btn} style={fitWidth ? { background: V.saff, color: V.navy } : { color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title={fitWidth ? 'Fit the whole page' : 'Fit the width (bigger text)'}>
          {fitWidth ? <Expand size={14} /> : <MoveHorizontal size={14} />}<span className="hidden sm:inline">{fitWidth ? 'Whole page' : 'Zoom'}</span>
        </button>
        {canFull && <button onClick={toggleFull} className={`${btn} text-white hover:bg-white/10`} title="Full screen">{full ? <Minimize size={16} /> : <Maximize size={16} />}</button>}
      </div>

      {/* The page */}
      <div ref={stage} dir="ltr" className={`relative min-h-0 flex-1 ${fitWidth ? 'overflow-auto' : 'overflow-hidden'}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* The page centres with margin auto, so a zoomed page that overflows can still be scrolled to every edge. */}
        <div dir="ltr" className={`flex min-h-full min-w-full ${fitWidth ? 'p-2' : ''}`} style={{ width: 'max-content' }}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={page} custom={dir} dir="ltr"
              initial={{ opacity: 0, x: dir * 60, rotateY: dir * -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: dir * -60, rotateY: dir * 8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="vz-bookpage m-auto shrink-0 overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.45)]" style={{ width: PAGE_W * scale, height: PAGE_H * scale, perspective: 1200 }}
              onClick={onPageClick}>
              <div style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <StopPage stop={s} kind={kind} pageNo={firstPage + page} filename={`viiza-stop-${s.n}-${kind}`} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Turn */}
        {page > 0
          ? <button onClick={() => turn(-1)} aria-label="Previous page" className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg sm:flex" style={{ color: V.navy }}><ChevronLeft size={26} /></button>
          : prev && <Link href={`/viiza/${prev.n}#book`} aria-label="Previous stop" className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 shadow-lg sm:flex" style={{ color: V.navy }}><ChevronLeft size={26} /></Link>}
        {page < BOOK_KINDS.length - 1
          ? <button onClick={() => turn(1)} aria-label="Next page" className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg sm:flex" style={{ color: V.navy }}><ChevronRight size={26} /></button>
          : next && <Link href={`/viiza/${next.n}#book`} aria-label="Next stop" className="absolute right-2 top-1/2 hidden h-12 items-center justify-center gap-1 rounded-full px-4 text-[13px] font-extrabold shadow-lg sm:flex" style={{ background: V.saff, color: V.navy }}>Stop {pad2(next.n)} <ChevronRight size={20} /></Link>}

        <AnimatePresence>
          {hint && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <div className="rounded-2xl px-4 py-2.5 text-center shadow-xl" style={{ background: V.navy, color: '#fff' }}>
                <div className="text-[13px] font-extrabold" dir="ltr">Tap any English sentence to hear it</div>
                <Ar className="text-[12px] font-bold" style={{ color: V.saff }}>اضغط أي جملة إنجليزية لتسمعها · اسحب لتقلب الصفحة</Ar>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pages */}
      <div className="flex shrink-0 items-center justify-center gap-2 px-3 py-2.5" dir="ltr" style={{ background: V.navy }}>
        <button onClick={() => turn(-1)} disabled={page === 0} className="rounded-full p-1.5 text-white disabled:opacity-30 sm:hidden"><ChevronLeft size={22} /></button>
        {BOOK_KINDS.map(([k, label], i) => (
          <button key={k} onClick={() => { stop(); setDir(i > page ? 1 : -1); setPage(i) }} title={label}
            className="h-[10px] rounded-full transition-all" style={{ width: i === page ? 30 : 10, background: i === page ? V.saff : 'rgba(255,255,255,0.35)' }} />
        ))}
        <button onClick={() => turn(1)} disabled={page === BOOK_KINDS.length - 1} className="rounded-full p-1.5 text-white disabled:opacity-30 sm:hidden"><ChevronRight size={22} /></button>
      </div>
    </div>
  )
}
