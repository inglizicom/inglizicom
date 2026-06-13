'use client'

/**
 * Human-style illustrated avatar (DiceBear "personas" — clean, professional,
 * not childish), deterministic per name, on a soft gradient backdrop that
 * matches the Command Center palette.
 */
const STYLE = 'notionists'

function hue(name: string): number {
  let h = 0
  for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  const seed = encodeURIComponent(name || '?')
  const url = `https://api.dicebear.com/9.x/${STYLE}/svg?seed=${seed}`
  const h = hue(name || '?')
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${h} 65% 90%), hsl(${(h + 40) % 360} 65% 82%))` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
