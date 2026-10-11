'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * A book to leaf through, like an online «look inside»: on a computer two
 * pages side by side (the cover alone, as a closed book) and the page turns
 * in 3D around the spine; on a phone one page at a time, swiped. The pages
 * are images (public/preview/<book>/NN.jpg, A4); `end` is the last leaf (the
 * call to order). Books read left to right, as English books do.
 */

type Leaf = { src: string } | { end: true }
const TURN = 0.65

export default function FlipBook({ pages, end, label }: { pages: string[]; end: ReactNode; label: string }) {
  const leaves: Leaf[] = useMemo(() => [...pages.map(src => ({ src })), { end: true as const }], [pages])
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)')
    const on = () => setWide(m.matches)
    on(); m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])

  // spreads: the cover alone on the right, then pairs (left, right)
  const spreads = useMemo(() => {
    const out: [number | null, number | null][] = [[null, 0]]
    for (let i = 1; i < leaves.length; i += 2) out.push([i, i + 1 < leaves.length ? i + 1 : null])
    return out
  }, [leaves.length])
  const [at, setAt] = useState(0)            // spread (wide) or leaf (narrow)
  const [turning, setTurning] = useState<null | 1 | -1>(null)
  useEffect(() => { setAt(0); setTurning(null) }, [pages, wide])

  const last = wide ? spreads.length - 1 : leaves.length - 1
  const go = useCallback((dir: 1 | -1) => {
    if (turning) return
    const to = at + dir
    if (to < 0 || to > last) return
    if (!wide) { setAt(to); return }
    setTurning(dir)
    window.setTimeout(() => { setAt(to); setTurning(null) }, TURN * 1000)
  }, [at, last, turning, wide])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [go])

  // swipe
  const x0 = useRef<number | null>(null)
  const onDown = (e: React.PointerEvent) => { x0.current = e.clientX }
  const onUp = (e: React.PointerEvent) => {
    if (x0.current === null) return
    const dx = e.clientX - x0.current
    x0.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  const face = (i: number | null) => {
    if (i === null) return <div className="h-full w-full" />
    const l = leaves[i]
    return 'src' in l
      ? <img src={l.src} alt={`${label} · page ${i + 1}`} className="h-full w-full object-cover select-none" draggable={false} loading={i < 4 ? 'eager' : 'lazy'} />
      : <div className="h-full w-full bg-[#FFF8EC]">{end}</div>
  }

  const shown = wide ? at * 2 : at
  const total = leaves.length

  return (
    <div className="flex flex-col items-center gap-4" dir="ltr">
      <div className="relative w-full" onPointerDown={onDown} onPointerUp={onUp} style={{ touchAction: 'pan-y' }}>
        {wide ? (
          <Spread spreads={spreads} at={at} turning={turning} face={face} go={go} />
        ) : (
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div key={at} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
              className="aspect-[794/1123] overflow-hidden rounded-lg bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.55)] ring-1 ring-slate-200">
              {face(at)}
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous page"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0B1B4D] ring-1 ring-slate-200 shadow disabled:opacity-40"><ChevronLeft size={20} /></button>
        <span className="min-w-[88px] text-center text-[14px] font-bold text-slate-600 tabular-nums">{Math.min(shown + 1, total)} / {total}</span>
        <button type="button" onClick={() => go(1)} disabled={at === last} aria-label="Next page"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1B4D] text-white shadow disabled:opacity-40"><ChevronRight size={20} /></button>
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
        {leaves.map((l, i) => (
          <button key={i} type="button" aria-label={`Page ${i + 1}`}
            onClick={() => { if (!turning) setAt(wide ? (i === 0 ? 0 : Math.floor((i + 1) / 2)) : i) }}
            className={`h-[68px] w-[48px] shrink-0 overflow-hidden rounded ring-2 transition ${(wide ? spreads[at].includes(i) : at === i) ? 'ring-amber-400' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
            {'src' in l ? <img src={l.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full w-full items-center justify-center bg-[#FFF8EC] text-[18px]">🛒</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Two pages and, while a page turns, the leaf rotating around the spine. */
function Spread({ spreads, at, turning, face, go }: {
  spreads: [number | null, number | null][]; at: number; turning: null | 1 | -1
  face: (i: number | null) => ReactNode; go: (d: 1 | -1) => void
}) {
  const cur = spreads[at]
  const next = turning ? spreads[at + turning] : null
  // underneath: what shows once the leaf has turned
  const left = turning === -1 ? next![0] : cur[0]
  const right = turning === 1 ? next![1] : cur[1]
  const closed = at === 0 && !turning
  const page = 'relative aspect-[794/1123] w-1/2 overflow-hidden bg-white'
  return (
    <div className="mx-auto w-full max-w-[1000px] [perspective:2200px]">
      <div className={`relative flex transition-transform duration-500 ${closed ? '-translate-x-1/4' : ''}`}>
        <div className={`${page} rounded-l-lg ${left === null ? 'invisible' : 'shadow-[-12px_20px_40px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-200'}`}>
          <button type="button" aria-label="Previous page" onClick={() => go(-1)} className="absolute inset-0 z-[1] cursor-w-resize" />
          {face(left)}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/15 to-transparent" />
        </div>
        <div className={`${page} rounded-r-lg ${right === null ? 'invisible' : 'shadow-[12px_20px_40px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-200'}`}>
          <button type="button" aria-label="Next page" onClick={() => go(1)} className="absolute inset-0 z-[1] cursor-e-resize" />
          {face(right)}
          {right !== null && right !== 0 && <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/15 to-transparent" />}
        </div>

        {turning && next && (
          <motion.div
            className="absolute top-0 z-10 aspect-[794/1123] w-1/2 [transform-style:preserve-3d]"
            style={{ left: turning === 1 ? '50%' : 0, transformOrigin: turning === 1 ? 'left center' : 'right center' }}
            initial={{ rotateY: 0 }} animate={{ rotateY: turning === 1 ? -180 : 180 }} transition={{ duration: TURN, ease: [0.45, 0.05, 0.3, 1] }}>
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-white shadow-xl [backface-visibility:hidden]">{face(turning === 1 ? cur[1] : cur[0])}</div>
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">{face(turning === 1 ? next[0] : next[1])}</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
