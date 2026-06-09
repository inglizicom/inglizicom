'use client'

/* Soft gradient backdrop — picked deterministically from the name */
const PALETTE = [
  'from-rose-300 to-rose-400',
  'from-orange-300 to-amber-400',
  'from-emerald-300 to-emerald-400',
  'from-blue-300 to-blue-400',
  'from-violet-300 to-violet-400',
  'from-cyan-300 to-cyan-400',
  'from-fuchsia-300 to-fuchsia-400',
  'from-teal-300 to-teal-400',
]

function hue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % PALETTE.length
  return h
}

interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

/**
 * Friendly illustrated-person avatar (DiceBear "avataaars"), deterministic by
 * name, on a soft gradient backdrop — adds life without using real photos.
 */
export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const seed = encodeURIComponent(name || '?')
  const url  = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&radius=50&backgroundType=solid&backgroundColor=transparent`
  const grad = PALETTE[hue(name || '?')]
  return (
    <div
      className={`${square ? 'rounded-2xl' : 'rounded-full'} bg-gradient-to-br ${grad} overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
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
