import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { APP_CSS } from './_app/styles'

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


export default function ViizaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: APP_CSS }} />
      {children}
    </>
  )
}
