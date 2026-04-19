'use client'

interface Props {
  youtubeId: string
}

export default function VideoPlayer({ youtubeId }: Props) {
  const src = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`

  return (
    <div
      className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl"
      dir="ltr"
    >
      <iframe
        key={youtubeId}
        src={src}
        title="YouTube video player"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
