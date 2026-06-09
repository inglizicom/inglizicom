'use client'

/**
 * Tracks when the user last "saw" the leads — so the العملاء المحتملون badge and
 * the notification bell behave like unread counts that clear once viewed.
 */
const KEY = 'inglizi.leads_seen_at'
export const LEADS_SEEN_EVENT = 'inglizi:leads-seen'

/** Last-seen timestamp (ms). Lazily initialises to "now" on first ever read,
 *  so a fresh device starts at 0 unseen instead of counting all history. */
export function getLeadsSeenAt(): number {
  if (typeof window === 'undefined') return Date.now()
  const v = window.localStorage.getItem(KEY)
  if (!v) {
    const now = Date.now()
    try { window.localStorage.setItem(KEY, String(now)) } catch {}
    return now
  }
  return Number(v)
}

/** Mark all current leads as seen → clears the badge + bell everywhere. */
export function markLeadsSeen(): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(KEY, String(Date.now())) } catch {}
  window.dispatchEvent(new Event(LEADS_SEEN_EVENT))
}
