'use client'

/**
 * Cartoon character avatar (multiavatar.com — full illustrated people),
 * deterministic per name. Same person → same character. Brand-tinted backdrop
 * shows while it loads.
 */
export default function PersonAvatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  const url = `https://api.multiavatar.com/${encodeURIComponent(name || '?')}.png`
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-[#e7dcc8] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} width={size} height={size} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    </div>
  )
}
