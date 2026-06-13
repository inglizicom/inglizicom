'use client'

import BoringAvatar from 'boring-avatars'

/**
 * Elegant abstract avatar (Boring Avatars "marble"), deterministic by name,
 * tinted in the brown/gold brand palette. Professional — no cartoon faces.
 */
const PALETTE = ['#2a1d12', '#3a2817', '#a16207', '#facc15', '#e7dcc8']

interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  return (
    <div className={`${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <BoringAvatar size={size} name={name || '?'} variant="marble" colors={PALETTE} square />
    </div>
  )
}
