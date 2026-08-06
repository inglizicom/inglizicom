/**
 * Carries the level-test result across a navigation.
 *
 * The test finishes inside a fullscreen overlay and recommends one plan. If the
 * visitor isn't ready to hand over a phone number yet, they used to land on a
 * generic pricing page and the result was lost. This keeps the placement around
 * (for the session only) so the package pages can acknowledge it.
 */

const KEY = 'inglizi.placement'

export interface Placement {
  /** CEFR level the test landed on, e.g. 'A2'. */
  level:    string
  /** Plan id recommended for that level. */
  planId:   string
  /** Epoch ms — so a stale result can be ignored. */
  at:       number
}

/** Results older than this stop being shown. */
const MAX_AGE_MS = 1000 * 60 * 60 * 6

export function savePlacement(level: string, planId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ level, planId, at: Date.now() }))
  } catch {}
}

export function readPlacement(): Placement | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Placement
    if (!p?.level || !p?.planId) return null
    if (Date.now() - p.at > MAX_AGE_MS) return null
    return p
  } catch {
    return null
  }
}
