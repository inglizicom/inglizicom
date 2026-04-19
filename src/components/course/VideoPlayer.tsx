'use client'

import { useEffect, useRef, useState } from 'react'

interface PlyrInstance {
  destroy: () => void
  on: (event: string, cb: () => void) => void
}

declare global {
  interface Window {
    Plyr?: new (
      el: Element | string,
      opts?: Record<string, unknown>,
    ) => PlyrInstance
  }
}

const CSS_ID = 'plyr-cdn-css'
const JS_ID  = 'plyr-cdn-js'
const CSS_URL = 'https://cdn.plyr.io/3.7.8/plyr.css'
const JS_URL  = 'https://cdn.plyr.io/3.7.8/plyr.js'

function loadCss(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve()
    if (document.getElementById(CSS_ID)) return resolve()
    const link = document.createElement('link')
    link.id = CSS_ID
    link.rel = 'stylesheet'
    link.href = CSS_URL
    link.onload = () => resolve()
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
}

function loadJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'))
    if (window.Plyr) return resolve()
    const existing = document.getElementById(JS_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('plyr load error')))
      return
    }
    const script = document.createElement('script')
    script.id = JS_ID
    script.src = JS_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('plyr load error'))
    document.head.appendChild(script)
  })
}

interface Props {
  youtubeId: string
}

export default function VideoPlayer({ youtubeId }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setReady(false)
    let cancelled = false
    let instance: PlyrInstance | null = null

    Promise.all([loadCss(), loadJs()])
      .then(() => {
        if (cancelled || !ref.current || !window.Plyr) return
        instance = new window.Plyr(ref.current, {
          youtube: {
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
          },
        })
        instance.on('ready', () => {
          if (!cancelled) setReady(true)
        })
      })
      .catch((err: Error) => {
        console.error('[VideoPlayer] plyr load failed', err)
        setFailed(true)
      })

    return () => {
      cancelled = true
      instance?.destroy()
    }
  }, [youtubeId])

  if (failed) {
    return (
      <div
        className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl"
        dir="ltr"
      >
        <iframe
          key={youtubeId}
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
          title="lesson"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl"
      dir="ltr"
    >
      <div
        key={youtubeId}
        ref={ref}
        data-plyr-provider="youtube"
        data-plyr-embed-id={youtubeId}
      />
      {!ready && (
        <div className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
