/**
 * Where a visitor came from — remembered for 30 days in their browser.
 *
 * Lead forms used to read the UTM tags and referrer of the page the form sat
 * on, so a visitor who landed from Instagram on the home page and filled the
 * form on /level-test arrived as "direct". Now the first page they open
 * records the touch (UTM tags, external referrer, landing page) and every
 * form attaches it. A later visit that again comes from somewhere
 * (new UTM tags or another site) replaces it — the last real source wins.
 * Client only; storage failures are ignored (private mode, blocked storage).
 */

export interface Touch {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  landing: string
  at: number
}

const KEY = 'inglizi.touch'
const TTL = 30 * 86_400_000

/** The referrer when it is another site (not one of ours). */
export function externalReferrer(): string | null {
  if (typeof document === 'undefined' || !document.referrer) return null
  try {
    const host = new URL(document.referrer).hostname
    if (!host || host === window.location.hostname || /(^|\.)inglizi\.com$/.test(host)) return null
    return document.referrer
  } catch { return null }
}

export function readTouch(): Touch | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const t = JSON.parse(raw) as Touch
    return Date.now() - (t.at ?? 0) > TTL ? null : t
  } catch { return null }
}

/** Call once per page load. */
export function recordTouch(): void {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  const utm = { utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign') }
  const ref = externalReferrer()
  const fromSomewhere = !!(utm.utm_source || ref)
  const current = readTouch()
  if (current && !fromSomewhere) return            // a plain visit keeps the source we know
  const touch: Touch = { ...utm, referrer: ref, landing: window.location.pathname, at: Date.now() }
  try { window.localStorage.setItem(KEY, JSON.stringify(touch)) } catch { /* storage blocked */ }
}
