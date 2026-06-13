'use client'

/**
 * Real professional headshot, deterministic per name (pravatar.cc — photos of
 * real business men & women in casual-professional attire). Same person → same
 * photo every time. Brand-tinted backdrop shows while the image loads.
 */
export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  const url = `https://i.pravatar.cc/${Math.round(size * 2)}?u=${encodeURIComponent(name || '?')}`
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
