'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X } from 'lucide-react'
import { openSubscribe } from '@/lib/lead-source'

/**
 * Persistent floating "Subscribe on WhatsApp" CTA.
 * Visible on public pages once the visitor scrolls past the hero fold,
 * unless dismissed for this session. Click dispatches the global
 * SUBSCRIBE_EVENT handled by SubscribeHost.
 */

const DISMISS_KEY = 'inglizi.sticky_dismissed'

const HIDE_ON_PATHS = [
  '/level-test',
  '/login',
  '/signup',
  '/billing',
  '/admin',
]

export default function StickyCTA() {
  const pathname = usePathname() ?? '/'
  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1')
    const onScroll = () => setVisible(window.scrollY > 240)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const blocked = HIDE_ON_PATHS.some(p => pathname.startsWith(p))
  if (blocked || dismissed || !visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none sm:bottom-5 sm:right-5 sm:left-auto sm:inset-x-auto">
      <div className="max-w-md mx-auto sm:mx-0 px-3 pb-3 sm:p-0 pointer-events-auto">
        <div className="flex items-stretch gap-0 shadow-2xl shadow-emerald-900/30 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => openSubscribe({ source: 'sticky_cta' })}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20c05c] text-white font-black text-sm sm:text-[15px] py-3.5 px-5 transition-colors"
            dir="rtl"
          >
            <MessageCircle className="w-4 h-4" />
            اشترك الآن — جاوبني فواتساب
          </button>
          <button
            type="button"
            aria-label="dismiss"
            onClick={() => {
              try { window.sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
              setDismissed(true)
            }}
            className="bg-[#1fa855] hover:bg-[#1a944a] text-white px-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
