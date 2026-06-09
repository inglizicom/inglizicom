'use client'

import { UserRound } from 'lucide-react'

/* Soft gradient palette — picked deterministically from the name */
const PALETTE = [
  'from-rose-400 to-rose-500',
  'from-orange-400 to-amber-500',
  'from-emerald-400 to-emerald-500',
  'from-blue-400 to-blue-500',
  'from-violet-400 to-violet-500',
  'from-cyan-400 to-cyan-500',
  'from-fuchsia-400 to-fuchsia-500',
  'from-teal-400 to-teal-500',
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

/** Icon-style avatar — a person glyph on a soft per-name gradient. */
export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const grad = PALETTE[hue(name || '?')]
  return (
    <div
      className={`${square ? 'rounded-2xl' : 'rounded-full'} bg-gradient-to-br ${grad} flex items-center justify-center text-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <UserRound size={Math.round(size * 0.55)} strokeWidth={2.1} />
    </div>
  )
}
