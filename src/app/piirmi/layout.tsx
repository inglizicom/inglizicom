import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { APP_CSS } from '../viiza/_app/styles'

/**
 * PIIRMI interactive (/piirmi): the everyday textbook (A1 → A2) as an app,
 * full screen on a phone or a desktop, outside the site's header and footer.
 * Paid and behind a sign-in, so it stays out of search engines.
 */

export const metadata: Metadata = {
  title: 'PIIRMI ENGLISH · Interactive book',
  description: 'The PIIRMI ENGLISH everyday book, interactive: tap any sentence to hear it, practise the answers, play the games.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#0E6B4E', width: 'device-width', initialScale: 1 }

export default function PiirmiLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: APP_CSS }} />
      {children}
    </>
  )
}
