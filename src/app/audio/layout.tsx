import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { IBM_Plex_Sans_Arabic, Poppins } from 'next/font/google'

/**
 * /audio — the audio of the Level 1 box, opened from the QR codes on the
 * cards (and shared with buyers): Poppins and IBM Plex Sans Arabic, the
 * cards' two faces, on the cards' two colours. For buyers only, so not
 * indexed.
 */

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-play-en' })
const plex = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-play-ar' })

export const metadata: Metadata = {
  title: 'Play & Speak English · Level 1 · Inglizi.com',
  description: 'Listen to every card and every lesson of the Level 1 box.',
  robots: { index: false, follow: false },
}

export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${poppins.variable} ${plex.variable} min-h-screen bg-white`} style={{ fontFamily: 'var(--font-play-en), var(--font-play-ar), sans-serif' }}>
      <style>{'.font-arabic{font-family:var(--font-play-ar),sans-serif}'}</style>
      {children}
    </div>
  )
}
