/**
 * The answers of the printed exercises and of the conversation check, for
 * the answer key. On its own (with the shuffle) so the stop pages can be
 * drawn in the browser by VIIZA interactive without the book's index.
 */

import type { Exercise, Stop } from './types.ts'
import { mixed } from './shuffle.ts'

const LETTERS = 'abcdefghij'

/** The answers of one exercise, as short strings for the key. */
export function answersOf(ex: Exercise, seed: number): string[] {
  switch (ex.t) {
    case 'match': {
      const right = mixed(ex.items.map(i => i[1]), seed)
      return ex.items.map((item, k) => `${k + 1}${LETTERS[right.indexOf(item[1])]}`)
    }
    case 'gaps': return ex.items.map(([, a], k) => `${k + 1} ${a}`)
    case 'choose': return ex.items.map(([, opts, r], k) => `${k + 1}${LETTERS[r]} ${opts[r]}`)
    case 'say': return ex.items.map(([, a], k) => `${k + 1} ${a}`)
    case 'order': {
      const shown = mixed(ex.lines, seed)
      return [ex.lines.map(l => LETTERS[shown.indexOf(l)]).join(' – ')]
    }
  }
}

/** The conversation check's answers for the key: "1 T · 2 F …". */
export const checkAnswers = (s: Stop) => (s.more?.check ?? []).map(([, t], k) => `${k + 1} ${t ? 'T' : 'F'}`)
