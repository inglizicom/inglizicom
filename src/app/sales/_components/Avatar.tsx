'use client'

/**
 * Human-style illustrated avatar (DiceBear "personas" — professional, not
 * childish, no letters), deterministic by name, on a soft gradient backdrop.
 */
const STYLE = 'notionists'

function hue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const seed = encodeURIComponent(name || '?')
  const url  = `https://api.dicebear.com/9.x/${STYLE}/svg?seed=${seed}`
  const h    = hue(name || '?')
  return (
    <div
      className={`${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${h} 65% 90%), hsl(${(h + 40) % 360} 65% 82%))` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
