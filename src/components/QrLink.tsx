import QRCode from 'qrcode'
import { Headphones } from 'lucide-react'

/**
 * A QR code drawn as one SVG path (sharp at any print size, no image to
 * load), with a small "Listen" under it: the printed books' and cards' link
 * to their audio on www.inglizi.com/audio.
 */
export function QrLink({ url, size, color = '#111111', label = 'Listen', labelColor = '#5B6474' }: {
  url: string; size: number; color?: string; label?: string | null; labelColor?: string
}) {
  const { size: n, data } = QRCode.create(url, { errorCorrectionLevel: 'M' }).modules
  let d = ''
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (data[y * n + x]) d += `M${x} ${y}h1v1h-1z`
  return (
    <span className="inline-flex flex-col items-center leading-none shrink-0">
      <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} shapeRendering="crispEdges" style={{ background: '#fff', display: 'block' }} aria-label={url}>
        <path d={d} fill={color} />
      </svg>
      {label && (
        <span className="mt-[2px] flex items-center gap-[2px] font-semibold" style={{ fontSize: Math.max(7, size / 7), color: labelColor }}>
          <Headphones size={Math.max(8, size / 6)} />{label}
        </span>
      )}
    </span>
  )
}

/** The play pages' addresses (www, so a phone goes straight there). */
export const PLAY = {
  book: (n: number) => `https://www.inglizi.com/audio/book/${n}`,
  workbook: (n: number) => `https://www.inglizi.com/audio/workbook/${n}`,
  card: (code: string) => `https://www.inglizi.com/audio/${code}`,
}
