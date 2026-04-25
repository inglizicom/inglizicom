/**
 * Session-scoped source tag — a button writes its ID here when it opens
 * the subscribe modal, and the modal reads it to attribute the lead.
 * Survives a page navigation (sessionStorage) but not a new tab.
 */

const KEY = 'inglizi.lead_source'

export function setLeadSource(source: string): void {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(KEY, source) } catch {}
}

export function readLeadSource(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.sessionStorage.getItem(KEY) } catch { return null }
}

export function clearLeadSource(): void {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.removeItem(KEY) } catch {}
}

/* ───────────────────────────────────────────────
   Global bus — any button anywhere can open the
   SubscribeModal by calling openSubscribe(source).
─────────────────────────────────────────────── */

export interface OpenSubscribeDetail {
  source:          string
  planId?:         string
  recommendedPlan?: string
  testScore?:      number
  defaultLevel?:   string
  defaultGoal?:    string
}

export const SUBSCRIBE_EVENT = 'inglizi:open-subscribe'

export function openSubscribe(detail: OpenSubscribeDetail): void {
  if (typeof window === 'undefined') return
  setLeadSource(detail.source)
  window.dispatchEvent(new CustomEvent(SUBSCRIBE_EVENT, { detail }))
}
