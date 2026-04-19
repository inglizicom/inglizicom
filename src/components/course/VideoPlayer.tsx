'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Plyr?: new (
      el: Element | string,
      opts?: Record<string, unknown>,
    ) => { destroy: () => void }
  }
}

interface Props {
  youtubeId: string
}

export default function VideoPlayer({ youtubeId }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Plyr) setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !ref.current || !window.Plyr) return
    const instance = new window.Plyr(ref.current, {
      ratio: '16:9',
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      },
    })
    return () => instance.destroy()
  }, [ready, youtubeId])

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <Script
        src="https://cdn.plyr.io/3.7.8/plyr.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div
        className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl"
        dir="ltr"
      >
        <div
          key={youtubeId}
          ref={ref}
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeId}
        />
      </div>
    </>
  )
}
