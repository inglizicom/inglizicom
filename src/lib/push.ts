/* Web-push helpers.
 * Client-safe pieces (VAPID public key, base64 conversion, browser subscribe)
 * live here; the server sender is in push-server.ts (keeps web-push out of the
 * client bundle). */

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

/** The JSON payload the service worker's push handler expects. */
export type PushPayload = {
  title: string
  body: string
  icon?: string
  image?: string   // large image / video thumbnail
  url?: string     // opened on tap
  tag?: string     // same tag replaces instead of stacking
}

/** Is web-push usable in this browser at all? */
export function pushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

/** VAPID public key must be a Uint8Array for pushManager.subscribe. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/** Ask permission + subscribe this browser to push. Returns the subscription
 *  (to POST to /api/push/subscribe) or null if declined/unsupported. */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return null
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return null
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  })
}
