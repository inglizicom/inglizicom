'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts from 0 to `to` the first time it scrolls into view.
 * Respects prefers-reduced-motion — those visitors just get the final number.
 */
export default function CountUp({
  to,
  duration = 1100,
  className = '',
  format = (n: number) => n.toLocaleString('en-US'),
}: {
  to:        number
  duration?: number
  className?: string
  format?:   (n: number) => string
}) {
  const ref     = useRef<HTMLSpanElement>(null)
  const inView  = useInView(ref, { once: true, amount: 0.4 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setValue(to); return }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo — fast then settles, reads as "landing" on the price
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return <span ref={ref} className={className}>{format(value)}</span>
}
