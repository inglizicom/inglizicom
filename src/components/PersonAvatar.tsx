'use client'

import BoringAvatar from 'boring-avatars'

/**
 * Elegant abstract avatar (Boring Avatars "marble") — deterministic per name,
 * tinted in the brown/gold brand palette. No cartoon faces.
 */
const PALETTE = ['#2a1d12', '#3a2817', '#a16207', '#facc15', '#e7dcc8']

export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <BoringAvatar size={size} name={name || '?'} variant="marble" colors={PALETTE} square />
    </div>
  )
}
