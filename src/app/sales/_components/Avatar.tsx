'use client'

import BoringAvatar from 'boring-avatars'

/**
 * Premium identity avatar: brand-tinted Boring Avatars "marble" gradient with
 * the person's initials overlaid. Mature, designed — no cartoon faces.
 */
const PALETTE = ['#2a1d12', '#5a3d1f', '#a16207', '#d4a017', '#f3e6c8']

function initials(name: string) {
  const p = (name || '').trim().split(/\s+/)
  return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  return (
    <div className={`relative ${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <BoringAvatar size={size} name={name || '?'} variant="marble" colors={PALETTE} square />
      <span className="absolute inset-0 flex items-center justify-center font-black text-white pointer-events-none"
        style={{ fontSize: size * 0.4, textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>
        {initials(name)}
      </span>
    </div>
  )
}
