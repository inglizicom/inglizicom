'use client'

import { avatarUrl } from '@/lib/avatar'

/**
 * Cartoon character avatar (DiceBear "avataaars") — gender-matched and always a
 * happy, friendly face. Deterministic per name.
 */
export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatarUrl(name)} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
