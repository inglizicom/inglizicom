'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * The fallback for `.ig-reveal` (globals.css) where CSS scroll-driven
 * animations are missing (Safari, the iOS in-app browsers): sections that are
 * already on screen are marked shown first, so nothing above the fold ever
 * blinks; the rest rise in as they scroll into view. Re-scans on navigation.
 */
export default function RevealOnScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    if (CSS.supports?.('animation-timeline: view()')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const els = Array.from(document.querySelectorAll<HTMLElement>('.ig-reveal:not(.is-in)'))
    const h = window.innerHeight
    els.forEach(el => { if (el.getBoundingClientRect().top < h * 0.95) el.classList.add('is-in') })
    document.documentElement.classList.add('ig-js')

    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    els.forEach(el => { if (!el.classList.contains('is-in')) io.observe(el) })
    return () => io.disconnect()
  }, [pathname])

  return null
}
