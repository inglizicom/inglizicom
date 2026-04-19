'use client'

import { useEffect, useRef } from 'react'
import 'plyr/dist/plyr.css'

interface Props {
  youtubeId: string
}

export default function VideoPlayer({ youtubeId }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let instance: { destroy: () => void } | null = null

    import('plyr').then(({ default: Plyr }) => {
      if (cancelled || !ref.current) return
      instance = new Plyr(ref.current, {
        ratio: '16:9',
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
      }) as unknown as { destroy: () => void }
    })

    return () => {
      cancelled = true
      instance?.destroy()
    }
  }, [youtubeId])

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl" dir="ltr">
      <div
        key={youtubeId}
        ref={ref}
        data-plyr-provider="youtube"
        data-plyr-embed-id={youtubeId}
      />
    </div>
  )
}
