import 'server-only'
import webpush from 'web-push'
import type { PushPayload } from '@/lib/push'

/* Server-only web-push sender. Inert until the VAPID env is set. */

let configured = false
export function pushConfigured(): boolean {
  if (configured) return true
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@inglizi.com', pub, priv)
  configured = true
  return true
}

export type SubRow = { id: string; endpoint: string; p256dh: string; auth: string }

/** Send one payload to one subscription.
 *  Returns 'ok' | 'gone' (dead endpoint → delete) | 'error'. */
export async function sendOne(sub: SubRow, payload: PushPayload): Promise<'ok' | 'gone' | 'error'> {
  if (!pushConfigured()) return 'error'
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }, // keep for a day if the device is offline
    )
    return 'ok'
  } catch (e: unknown) {
    const code = (e as { statusCode?: number })?.statusCode
    if (code === 404 || code === 410) return 'gone'   // unsubscribed / expired
    return 'error'
  }
}
