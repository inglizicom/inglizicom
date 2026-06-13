'use client'

import BoringAvatar from 'boring-avatars'

/**
 * Premium identity avatar: a brand-tinted Boring Avatars "marble" gradient with
 * the person's initials overlaid. Designed, mature, identity-bearing — no
 * cartoon faces, not a bare letter on a flat box.
 */
const PALETTE = ['#2a1d12', '#5a3d1f', '#a16207', '#d4a017', '#f3e6c8']

function initials(name: string) {
  const p = (name || '').trim().split(/\s+/)
  return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <BoringAvatar size={size} name={name || '?'} variant="marble" colors={PALETTE} square />
      <span className="absolute inset-0 flex items-center justify-center font-black text-white pointer-events-none"
        style={{ fontSize: size * 0.36, textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>
        {initials(name)}
      </span>
    </div>
  )
}
