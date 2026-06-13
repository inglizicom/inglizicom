'use client'

/**
 * Real professional headshot, deterministic per name (pravatar.cc — photos of
 * real business men & women). Same person → same photo every time.
 */
interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const url = `https://i.pravatar.cc/${Math.round(size * 2)}?u=${encodeURIComponent(name || '?')}`
  return (
    <div className={`${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
