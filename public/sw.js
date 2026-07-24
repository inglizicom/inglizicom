/* Inglizi PWA service worker.
 *
 * Conservative by design — the platform is live data (auth, lessons, coins),
 * so we NEVER cache API or Supabase traffic. What it gives us:
 *   • instant shell: hashed build assets + icons + fonts served cache-first
 *   • resilience: pages are network-first, falling back to the last good copy
 *     of that page, then to /offline (Arabic "you're offline" screen)
 * Bump VERSION to invalidate everything after a big change.
 */

const VERSION = 'v2'
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
