'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-driven life for the teaching space — no animation library.
 *
 * Everything here honours prefers-reduced-motion by jumping straight to the
 * final state: a teacher who has asked their OS for less motion gets the
 * numbers, not the count-up.
 */

function prefersReduced(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** True once the element has been scrolled into view — and stays true. */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (prefersReduced() || typeof IntersectionObserver === 'undefined') { setSeen(true); return }

    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) { setSeen(true); io.disconnect() } },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])

  return { ref, seen }
}

/** Counts from zero to `value` once visible. Decimals are preserved. */
export function useCountUp(value: number, duration = 900) {
  const { ref, seen } = useInView<HTMLDivElement>()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!seen) return
    if (prefersReduced()) { setN(value); return }

    const decimals = (String(value).split('.')[1] ?? '').length
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic — fast then settling, which reads as "counting up"
      const eased = 1 - Math.pow(1 - t, 3)
      const current = value * eased
      setN(decimals ? Number(current.toFixed(decimals)) : Math.round(current))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, value, duration])

  return { ref, n }
}

/** A number that counts up when it scrolls into view. */
export function Counter({
  value, suffix = '', className = '',
}: { value: number; suffix?: string; className?: string }) {
  const { ref, n } = useCountUp(value)
  return (
    <div ref={ref} className={`tabular-nums ${className}`}>
      {n}{suffix}
    </div>
  )
}

/** Fades + lifts its children in, once, when they reach the viewport. */
export function Reveal({
  children, delay = 0, className = '',
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.08)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'none' : 'translateY(14px)',
        transition: `opacity .5s ease-out ${delay}ms, transform .5s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** A bar that grows to `pct` when seen. Used by every progress meter. */
export function GrowBar({
  pct, color, height = 8, className = '',
}: { pct: number; color: string; height?: number; className?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`w-full rounded-full bg-stone-100 overflow-hidden ${className}`} style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{
          width: seen ? `${Math.max(0, Math.min(100, pct))}%` : '0%',
          background: color,
          transition: 'width .9s cubic-bezier(.22,1,.36,1)',
        }}
      />
    </div>
  )
}
