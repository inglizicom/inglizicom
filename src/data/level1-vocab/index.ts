import type { VocabBookUnit } from '../workbook/vocab-book-all.ts'
import { CARD_LESSONS } from '../level1-cards/index.ts'
import { UNITS_1_5 } from './units-1.ts'
import { UNITS_6_10 } from './units-2.ts'
import { UNITS_11_15 } from './units-3.ts'
import { UNITS_16_19 } from './units-4.ts'

/**
 * The extended vocabulary book of Level 1 (A0 → A1), the companion of the
 * course book's second edition: four pages a lesson, in the format of the
 * Everyday English vocabulary book (data/workbook/vocab-book.ts), printed
 * from /admin/vocab-book (book switch "Level 1"). It widens each lesson with
 * words the course book doesn't teach, set in Moroccan life: ten words with
 * a translated example, three themed groups, two short conversations with
 * other ways to ask and answer, a short reading with true / false and
 * questions.
 */

export const LEVEL1_VOCAB: VocabBookUnit[] = [...UNITS_1_5, ...UNITS_6_10, ...UNITS_11_15, ...UNITS_16_19].map(u => {
  const l = CARD_LESSONS.find(x => x.n === u.n)!
  return { ...u, titleEn: l.titleEn, titleAr: l.titleAr }
})
