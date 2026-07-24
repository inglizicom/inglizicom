'use client'

import { useEffect } from 'react'

/** PWA runtime glue, mounted once from the root layout:
 *  1. registers the service worker (production only — in dev a stale SW
 *     would fight hot reload);
 *  2. completes and removes the #pwa-splash overlay once the app has
 *     hydrated (the splash itself is server-rendered in layout.tsx and only
 *     displayed in standalone mode via CSS). */
export default function PwaRegister() {
  useEffect(() => {
    // ── splash: we are hydrated, so the app is ready → fill bar, fade, remove ──
    const splash = document.getElementById('pwa-splash')
    if (splash) {
      const t1 = setTimeout(() => splash.classList.add('done'), 250)   // bar → 100%
      const t2 = setTimeout(() => splash.classList.add('hide'), 700)   // fade out
      const t3 = setTimeout(() => splash.remove(), 1200)               // drop from DOM
      // safety: never trap the user behind the overlay
      const t4 = setTimeout(() => splash.remove(), 5000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => { /* non-fatal */ })
  }, [])

  return null
}
