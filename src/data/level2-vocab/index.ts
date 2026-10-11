import { INDEX } from '../level2-book/plan.ts'
import type { L2VocabUnit } from './types.ts'
import { UNITS_1_5 } from './units-1.ts'
import { UNITS_6_10 } from './units-2.ts'
import { UNITS_11_15 } from './units-3.ts'
import { UNITS_16_20 } from './units-4.ts'

/**
 * The extended vocabulary book of Level 2 (A2 → B1), the companion of
 * «تكلّم واكتب بدقّة» unit by unit, printed from /admin/level2-vocab. It
 * widens each unit with words the course book doesn't teach (a test keeps
 * them apart), set in Moroccan life: ten picture words with a translated
 * example, three themed groups of ten, word power (collocations and word
 * families), two short conversations with other ways to ask and answer, and
 * a reading with true / false and questions.
 */

export type L2VocabBookUnit = L2VocabUnit & { titleEn: string; titleAr: string }

export const LEVEL2_VOCAB: L2VocabBookUnit[] = [...UNITS_1_5, ...UNITS_6_10, ...UNITS_11_15, ...UNITS_16_20].map(u => {
  const i = INDEX.find(x => x.n === u.n)!
  return { ...u, titleEn: i.titleEn, titleAr: i.titleAr }
})
