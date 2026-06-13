'use client'

/* Deterministic gradient-initials avatar — clean, professional, no cartoons. */

function hue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
function initials(name: string): string {
  const p = (name || '').trim().split(/\s+/)
  return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

/** Initials on a deterministic gradient — adds identity without cartoons or photos. */
export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const h = hue(name || '?')
  return (
    <div
      className={`${square ? 'rounded-2xl' : 'rounded-full'} flex items-center justify-center font-black text-white flex-shrink-0 shadow-sm ${className}`}
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${h} 60% 52%), hsl(${(h + 40) % 360} 58% 42%))`,
      }}
    >
      {initials(name)}
    </div>
  )
}
