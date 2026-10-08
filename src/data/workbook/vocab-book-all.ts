import { EVERYDAY_ENGLISH } from './everyday-english.ts'
import { UNITS_1_5 } from './vocab-book-units-1.ts'
import { UNITS_6_10 } from './vocab-book-units-2.ts'
import { UNITS_11_15 } from './vocab-book-units-3.ts'
import { UNITS_16_19 } from './vocab-book-units-4.ts'
import type { VocabUnit } from './vocab-book.ts'

/** The vocabulary book's units, with the main book's unit titles. */
export type VocabBookUnit = VocabUnit & { titleEn: string; titleAr: string }

const ALL: VocabUnit[] = [...UNITS_1_5, ...UNITS_6_10, ...UNITS_11_15, ...UNITS_16_19]

export const VOCAB_BOOK: VocabBookUnit[] = ALL.map(u => {
  const main = EVERYDAY_ENGLISH.find(m => m.n === u.n)!
  return { ...u, titleEn: main.titleEn, titleAr: main.titleAr }
})
