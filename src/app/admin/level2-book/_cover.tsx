'use client'

/* eslint-disable @next/next/no-img-element */
import { BareSheet, THEMES } from '../games/_shared'

/**
 * The series covers (LA KAART, PIIRMI, VIIZA ENGLISH, from the series design
 * canvas, rendered to print JPEGs in public/covers/<series>) as full-bleed A4
 * sheets: each book of the series opens on its front and closes on its back.
 * The covers are fixed designs, so the books have no cover settings.
 */

export type Series = 'lakaart' | 'piirmi' | 'viiza'
export type SeriesBook = 'book' | 'workbook' | 'vocab'

const MONO = THEMES.find(t => t.id === 'mono') ?? THEMES[0]

export function SeriesCover({ series, book, side, filename }: { series: Series; book: SeriesBook; side: 'front' | 'back'; filename: string }) {
  return (
    <BareSheet theme={MONO} label={side === 'front' ? 'الغلاف الأمامي' : 'الغلاف الخلفي'} filename={filename}>
      <img src={`/covers/${series}/${book}-${side}.jpg`} alt={`${series.toUpperCase()} ENGLISH ${book} ${side} cover`} className="absolute inset-0 h-full w-full object-cover" />
    </BareSheet>
  )
}
