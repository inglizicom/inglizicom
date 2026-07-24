/* Inglizi PWA service worker.
 *
 * Conservative by design — the platform is live data (auth, lessons, coins),
 * so we NEVER cache API or Supabase traffic. What it gives us:
 *   • instant shell: hashed build assets + icons + fonts served cache-first
 *   • resilience: pages are network-first, falling back to the last good copy
 *     of that page, then to /offline (Arabic "you're offline" screen)
 * Bump VERSION to invalidate everything after a big change.
 */

const VERSION = 'v4'
const STATIC_CACHE = `inglizi-static-${VERSION}`
const PAGES_CACHE = `inglizi-pages-${VERSION}`
const PRECACHE = ['/offline', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

const isFontHost = h => h === 'fonts.googleapis.com' || h === 'fonts.gstatic.com'

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Never touch APIs, auth, or any non-font third party (Supabase, analytics…)
  if (url.origin !== location.origin) {
    if (!isFontHost(url.hostname)) return
    // fonts: cache-first (they're immutable)
    e.respondWith(
      caches.open(STATIC_CACHE).then(async c => {
        const hit = await c.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      })
    )
    return
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth')) return

  // Hashed build assets + icons: cache-first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.open(STATIC_CACHE).then(async c => {
        const hit = await c.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      })
    )
    return
  }

  // Page navigations: network-first → cached copy of the page → /offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(PAGES_CACHE).then(c => c.put(req, res.clone()))
          return res
        })
        .catch(async () => {
          const cached = await caches.match(req)
          return cached || caches.match('/offline')
        })
    )
  }
})

/* ── Web push (notifications outside the app) ──────────────────────────────
 * Payload (JSON) sent by /api/push/send:
 *   { title, body, icon?, image?, url?, tag? }
 * OS reality: notifications show text + one big image + open a link on tap.
 * "Video" arrives as a thumbnail image whose link opens the video. */
self.addEventListener('push', event => {
  let d = {}
  try { d = event.data ? event.data.json() : {} } catch { d = { body: event.data && event.data.text() } }
  const title = d.title || 'Inglizi'
  const options = {
    body: d.body || '',
    icon: d.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: d.image || undefined,          // large image (Android; ignored on some platforms)
    dir: 'rtl',
    lang: 'ar',
    tag: d.tag || undefined,              // same tag → replaces instead of stacking
    renotify: !!d.tag,
    data: { url: d.url || '/' },
    requireInteraction: false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // focus an open tab on the same origin if we have one, else open a new one
      for (const c of list) {
        if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus() }
      }
      return self.clients.openWindow(url)
    })
  )
})

// If the browser rotates the subscription, keep the server in sync.
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async () => {
    try {
      const sub = await self.registration.pushManager.getSubscription()
      if (sub) await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, resubscribe: true }),
      })
    } catch { /* best effort */ }
  })())
})
