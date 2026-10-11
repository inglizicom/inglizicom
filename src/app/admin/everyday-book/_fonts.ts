'use client'

import type { CSSProperties } from 'react'

/**
 * The textbook's faces: Bricolage Grotesque for English, the type of the
 * PIIRMI ENGLISH covers, and Baloo Bhaijaan 2 for Arabic and for headings
 * (both loaded by the Level 1 renderer's useBookFonts). The variables below,
 * set on the page's root, also bring the workbook's cover, which has faces
 * of its own, onto these two.
 */

export const EN_FONT = "'Bricolage Grotesque', 'Baloo Bhaijaan 2', sans-serif"
export const AR_FONT = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif"

export const BOOK_FONT_VARS = {
  '--book-en': "'Bricolage Grotesque'",
  '--book-head': "'Baloo Bhaijaan 2'",
  '--book-ar': "'Baloo Bhaijaan 2'",
  '--book-display': "'Baloo Bhaijaan 2'",
  '--book-display-weight': '800',
} as CSSProperties

/** Arabic display lines (titles on the selling pages): the Arabic face, heavy. */
export const DISPLAY: CSSProperties = { fontFamily: AR_FONT, fontWeight: 800 }
