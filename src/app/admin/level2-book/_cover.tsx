'use client'

/* eslint-disable @next/next/no-img-element */
import { BareSheet, THEMES } from '../games/_shared'

/**
 * The VIIZA ENGLISH covers (series design canvas, rendered to print JPEGs in
 * public/covers/viiza) as full-bleed A4 sheets: each Level 2 book opens on its
 * front and closes on its back. The books' frame colours match them:
 * Viiza red ground, saffron accent, navy ink (VIIZA in data/level2-book).
 */

export type ViizaBook = 'book' | 'workbook' | 'vocab'

const MONO = THEMES.find(t => t.id === 'mono') ?? THEMES[0]

export function ViizaCover({ book, side, filename }: { book: ViizaBook; side: 'front' | 'back'; filename: string }) {
  return (
    <BareSheet theme={MONO} label={side === 'front' ? 'الغلاف الأمامي' : 'الغلاف الخلفي'} filename={filename}>
      <img src={`/covers/viiza/${book}-${side}.jpg`} alt={`VIIZA ENGLISH ${book} ${side} cover`} className="absolute inset-0 h-full w-full object-cover" />
    </BareSheet>
  )
}
