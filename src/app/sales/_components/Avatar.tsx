'use client'

import { avatarUrl } from '@/lib/avatar'

/**
 * Cartoon character avatar (DiceBear "avataaars") — gender-matched, happy face,
 * deterministic per name.
 */
interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
  /** Real profile photo (crm_students.avatar_url) — overrides the cartoon when set. */
  src?:    string | null
}

export default function Avatar({ name, size = 36, square = false, className = '', src }: Props) {
  return (
    <div className={`${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src || avatarUrl(name)} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
