'use client'

/**
 * Cartoon character avatar (DiceBear "avataaars" — illustrated people in
 * casual-professional clothing), deterministic per name.
 */
interface Props {
  name:    string
  size?:   number
  square?: boolean
  className?: string
}

export default function Avatar({ name, size = 36, square = false, className = '' }: Props) {
  const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || '?')}&radius=50&backgroundColor=f3e6c8,e7dcc8,ffd9a8,d6c4ad`
  return (
    <div className={`${square ? 'rounded-2xl' : 'rounded-full'} overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
