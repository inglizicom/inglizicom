'use client'

import { useGeoCurrency, approxFromMad } from '@/lib/geo-currency'

/** Renders "≈ 285 ر.س" for Gulf/international visitors, nothing for Morocco.
    Drop next to any MAD price. */
export default function ApproxPrice({ mad, className = '' }: { mad: number; className?: string }) {
  const cur = useGeoCurrency()
  if (!cur) return null
  return <span dir="rtl" className={className}>{approxFromMad(mad, cur)}</span>
}
