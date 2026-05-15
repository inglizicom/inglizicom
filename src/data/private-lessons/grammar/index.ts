export { g01 } from './g01'
export { g02 } from './g02'
export { g03 } from './g03'
export { q01 } from './q01'
export { g04 } from './g04'
export { g05 } from './g05'
export { g06 } from './g06'
export { q02 } from './q02'
export { g07 } from './g07'
export { g08 } from './g08'
export { g09 } from './g09'
export { q03 } from './q03'
export { g10 } from './g10'
export { g11 } from './g11'
export { g12 } from './g12'
export { q04 } from './q04'
export { g13 } from './g13'
export { g14 } from './g14'
export { g15 } from './g15'
export { q05 } from './q05'
export { g16 } from './g16'
export { g17 } from './g17'
export { g18 } from './g18'
export { q06 } from './q06'
export { g19 } from './g19'
export { g20 } from './g20'
export { g21 } from './g21'
export { q07 } from './q07'
export { g22 } from './g22'
export { g23 } from './g23'
export { g24 } from './g24'
export { q08 } from './q08'
export { g25 } from './g25'
export { g26 } from './g26'
export { g27 } from './g27'
export { q09 } from './q09'
export { g28 } from './g28'
export { g29 } from './g29'
export { g30 } from './g30'
export { q10 } from './q10'
export type {
  GrammarLesson,
  GrammarSection,
  GToken,
  PatternRow,
  SentenceExample,
  BlankExercise,
  GQuizQuestion,
  NoteItem,
  DialogueLine,
} from './types'

import { g01 } from './g01'
import { g02 } from './g02'
import { g03 } from './g03'
import { q01 } from './q01'
import { g04 } from './g04'
import { g05 } from './g05'
import { g06 } from './g06'
import { q02 } from './q02'
import { g07 } from './g07'
import { g08 } from './g08'
import { g09 } from './g09'
import { q03 } from './q03'
import { g10 } from './g10'
import { g11 } from './g11'
import { g12 } from './g12'
import { q04 } from './q04'
import { g13 } from './g13'
import { g14 } from './g14'
import { g15 } from './g15'
import { q05 } from './q05'
import { g16 } from './g16'
import { g17 } from './g17'
import { g18 } from './g18'
import { q06 } from './q06'
import { g19 } from './g19'
import { g20 } from './g20'
import { g21 } from './g21'
import { q07 } from './q07'
import { g22 } from './g22'
import { g23 } from './g23'
import { g24 } from './g24'
import { q08 } from './q08'
import { g25 } from './g25'
import { g26 } from './g26'
import { g27 } from './g27'
import { q09 } from './q09'
import { g28 } from './g28'
import { g29 } from './g29'
import { g30 } from './g30'
import { q10 } from './q10'

export const grammarLessons = [
  g01, g02, g03, q01,
  g04, g05, g06, q02,
  g07, g08, g09, q03,
  g10, g11, g12, q04,
  g13, g14, g15, q05,
  g16, g17, g18, q06,
  g19, g20, g21, q07,
  g22, g23, g24, q08,
  g25, g26, g27, q09,
  g28, g29, g30, q10,
]

export function getGrammarLesson(slug: string) {
  return grammarLessons.find((l) => l.slug === slug)
}
