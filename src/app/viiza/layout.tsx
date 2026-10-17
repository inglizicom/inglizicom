import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

/**
 * VIIZA interactive (/viiza): the travel guide as an app, full screen on a
 * phone or a desktop, outside the site's header and footer. Paid and behind
 * a sign-in, so it stays out of search engines.
 */

export const metadata: Metadata = {
  title: 'VIIZA ENGLISH · Interactive travel guide',
  description: 'The VIIZA ENGLISH travel guide, interactive: tap any sentence to hear it, practise the replies, play the games.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#0E1240', width: 'device-width', initialScale: 1 }

const CSS = `
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { scrollbar-width: none }
@keyframes vz-stamp { 0% { transform: scale(2.2) rotate(-12deg); opacity: 0 } 70% { transform: scale(0.92) rotate(-12deg); opacity: 1 } 100% { transform: scale(1) rotate(-12deg) } }
@keyframes vz-shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.vz-shake { animation: vz-shake .35s ease-in-out }
`

export default function ViizaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
    </>
  )
}
