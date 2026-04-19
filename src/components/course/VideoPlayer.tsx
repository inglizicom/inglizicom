'use client'

import { useEffect, useRef } from 'react'

interface PlyrInstance {
  destroy: () => void
  source: {
    type: 'video'
    sources: { src: string; provider: 'youtube' }[]
  }
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

function ensureCss() {
  if (typeof document === 'undefined') return
  if (document.getElementById(CSS_ID)) return
  const link = document.createElement('link')
  link.id = CSS_ID
  link.rel = 'stylesheet'
  link.href = CSS_URL
  document.head.appendChild(link)
}

function ensureJs(): Promise<void> {
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

  useEffect(() => {
    ensureCss()
    let cancelled = false
    let instance: PlyrInstance | null = null

    ensureJs()
      .then(() => {
        if (cancelled || !ref.current || !window.Plyr) return
        instance = new window.Plyr(ref.current, {
          ratio: '16:9',
          youtube: {
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
          },
        })
        instance.source = {
          type: 'video',
          sources: [{ src: youtubeId, provider: 'youtube' }],
        }
      })
      .catch(err => console.error('[VideoPlayer] plyr load failed', err))

    return () => {
      cancelled = true
      instance?.destroy()
    }
  }, [youtubeId])

  return (
    <div
      className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl"
      dir="ltr"
    >
      <div key={youtubeId} ref={ref} />
    </div>
  )
}
