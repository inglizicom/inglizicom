'use client'

import { useEffect, useRef, useState } from 'react'

interface FadeInProps {
  children: React.ReactNode
  delay?: number      // ms delay before animation starts
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}

/**
 * Lightweight scroll-reveal wrapper.
 * Uses IntersectionObserver — fires once when element enters the viewport.
 */
export default function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const initial: Record<string, string> = {
    up:    'opacity-0 translate-y-10',
    left:  'opacity-0 -translate-x-10',
    right: 'opacity-0 translate-x-10',
    none:  'opacity-0',
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-x-0 translate-y-0' : initial[direction]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
