'use client'

import { useEffect, type CSSProperties } from 'react'

/**
 * The textbook's two faces, one per script, both geometric so they read as
 * one family: Montserrat for English, Readex Pro for Arabic. The variables
 * below, set on the page's root, switch the shared renderers (the Level 1
 * book's blocks and the workbook's cover) over to them; every heading,
 * title and line of the book then uses one of the two.
 */

export const EN_FONT = "'Montserrat', 'Readex Pro', sans-serif"
export const AR_FONT = "'Readex Pro', 'Tajawal', sans-serif"

export const BOOK_FONT_VARS = {
  '--book-en': "'Montserrat'",
  '--book-head': "'Montserrat'",
  '--book-ar': "'Readex Pro'",
  '--book-display': "'Readex Pro'",
  '--book-display-weight': '700',
} as CSSProperties

/** Arabic display lines (titles on the selling pages): the Arabic face, bold. */
export const DISPLAY: CSSProperties = { fontFamily: AR_FONT, fontWeight: 700 }

const HREF = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Readex+Pro:wght@400;500;600;700&display=swap'

export function useEverydayFonts() {
  useEffect(() => {
    if (document.getElementById('everyday-fonts')) return
    const link = document.createElement('link')
    link.id = 'everyday-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; link.href = HREF
    document.head.appendChild(link)
  }, [])
}
