'use client'

/**
 * geo-currency — visitor country detection + approximate GCC price display.
 *
 * Prices remain canonical in MAD; Gulf visitors additionally see an
 * approximate equivalent in their own currency so the numbers mean something.
 * Rates are deliberately static approximations (marked with ≈ in the UI) —
 * actual payment is always agreed on WhatsApp.
 */

import { useEffect, useState } from 'react'

export interface GeoCurrency {
  code:   string   // ISO 4217
  symbol: string   // Arabic display symbol
  /** Approximate value of 1 MAD in this currency. */
  perMad: number
  /** Decimal places to show (KWD/BHD/OMR are high-value units). */
  digits: number
}

const GCC: Record<string, GeoCurrency> = {
  SA: { code: 'SAR', symbol: 'ر.س', perMad: 0.38,  digits: 0 },
  AE: { code: 'AED', symbol: 'د.إ', perMad: 0.37,  digits: 0 },
  QA: { code: 'QAR', symbol: 'ر.ق', perMad: 0.37,  digits: 0 },
  KW: { code: 'KWD', symbol: 'د.ك', perMad: 0.031, digits: 1 },
  BH: { code: 'BHD', symbol: 'د.ب', perMad: 0.038, digits: 1 },
  OM: { code: 'OMR', symbol: 'ر.ع', perMad: 0.039, digits: 1 },
}

const USD: GeoCurrency = { code: 'USD', symbol: '$', perMad: 0.10, digits: 0 }

const CACHE_KEY = 'inglizi_geo_country'
let inflight: Promise<string | null> | null = null

/** Fetch (once per session) the visitor country; cached in sessionStorage. */
export function fetchVisitorCountry(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) return Promise.resolve(cached === '??' ? null : cached)
  if (!inflight) {
    inflight = fetch('/api/geo')
      .then(r => r.json())
      .then((d: { country: string | null }) => {
        sessionStorage.setItem(CACHE_KEY, d.country || '??')
        return d.country
      })
      .catch(() => null)
  }
  return inflight
}

/** Synchronous read of the cached country (for lead capture). */
export function getCachedCountry(): string | null {
  if (typeof window === 'undefined') return null
  const c = sessionStorage.getItem(CACHE_KEY)
  return c && c !== '??' ? c : null
}

/** Currency to show alongside MAD for this country — null for Morocco/unknown. */
export function currencyFor(country: string | null): GeoCurrency | null {
  if (!country || country === 'MA') return null
  return GCC[country] ?? USD
}

/** "≈ 285 ر.س" — approximate converted amount, formatted for display. */
export function approxFromMad(amountMad: number, cur: GeoCurrency): string {
  const v = amountMad * cur.perMad
  const rounded = cur.digits === 0 ? Math.round(v) : Number(v.toFixed(cur.digits))
  return `≈ ${rounded.toLocaleString()} ${cur.symbol}`
}

/** React hook: the visitor's secondary display currency (null = MAD only). */
export function useGeoCurrency(): GeoCurrency | null {
  const [cur, setCur] = useState<GeoCurrency | null>(() => currencyFor(getCachedCountry()))
  useEffect(() => {
    let alive = true
    fetchVisitorCountry().then(c => { if (alive) setCur(currencyFor(c)) })
    return () => { alive = false }
  }, [])
  return cur
}

/** ISO alpha-2 → flag emoji, for the CRM. Returns '' for unknown. */
export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return ''
  const base = 0x1f1e6
  const a = code.toUpperCase().charCodeAt(0) - 65
  const b = code.toUpperCase().charCodeAt(1) - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return ''
  return String.fromCodePoint(base + a, base + b)
}
