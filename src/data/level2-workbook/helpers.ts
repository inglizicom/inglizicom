import type { Block } from '../level1-book.ts'
import { mixed } from '../level2-book/index.ts'

/** Builders for the workbook's exercises (the textbook's `choose`, `complete` and `correct` are reused as they are). */

/** «Remember»: the rule in two or three lines, at the top of a grammar page (in the grammar bar's section). */
export const remember = (items: string[]): Block => ({ t: 'bullets', box: true, heading: 'Remember - تذكّر 📌', size: 13, items })

/** Join two sentences with the word in brackets: [the two sentences (word), the joined sentence]. */
export const join = (rows: [q: string, a: string][]): Block => ({
  t: 'exercise', title: 'Join the sentences', instr: 'Use the word in brackets. - اربط الجملتين بالكلمة التي بين القوسين.', size: 13.5, lines: true,
  items: rows.map(([q, a]) => ({ q, a })),
})

/** Gaps to fill from a box of words, printed mixed above the sentences. */
export const fromBank = (title: string, instr: string, rows: [q: string, a: string][], cols: 1 | 2 = 1): Block => ({
  t: 'exercise', title, instr, size: 13.5, cols, bank: mixed(rows.map(([, a]) => a)), items: rows.map(([q, a]) => ({ q, a })),
})

/** Match each item to one of the lettered answers (printed mixed); the key gives the letter. */
export function match(title: string, instr: string, rows: [q: string, a: string][], cols: 1 | 2 = 1): Block {
  const bank = mixed(rows.map(([, a]) => a))
  return { t: 'exercise', title, instr, size: 13.5, cols, lettered: true, bank, items: rows.map(([q, a]) => ({ q: `${q} ___`, a: 'abcdefghijkl'[bank.indexOf(a)] })) }
}
