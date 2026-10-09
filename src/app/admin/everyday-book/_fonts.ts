'use client'

import type { CSSProperties } from 'react'

/**
 * The textbook's faces are the Level 1 book's, so the books read as one
 * series: Mali for English, Baloo Bhaijaan 2 for Arabic and for headings
 * (both loaded by the Level 1 renderer's useBookFonts). The variables below,
 * set on the page's root, also bring the workbook's cover, which has faces
 * of its own, onto these two.
 */

export const EN_FONT = "'Mali', 'Baloo Bhaijaan 2', sans-serif"
export const AR_FONT = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif"

export const BOOK_FONT_VARS = {
  '--book-en': "'Mali'",
  '--book-head': "'Baloo Bhaijaan 2'",
  '--book-ar': "'Baloo Bhaijaan 2'",
  '--book-display': "'Baloo Bhaijaan 2'",
  '--book-display-weight': '800',
} as CSSProperties

/** Arabic display lines (titles on the selling pages): the Arabic face, heavy. */
export const DISPLAY: CSSProperties = { fontFamily: AR_FONT, fontWeight: 800 }
