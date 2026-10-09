import type { Block, ExerciseItem } from '../level1-book.ts'

/** Small builders shared by the Level 2 units: exercises, headings, boxes. */

/** A choice of three; the key gives the letter and the answer. */
export const choose = (title: string, rows: [q: string, options: [string, string, string], right: 0 | 1 | 2][]): Block => ({
  t: 'exercise', title, instr: 'Circle the right answer. - ضع دائرة حول الجواب الصحيح.', size: 13.5,
  items: rows.map(([q, options, r]): ExerciseItem => ({ q, options, a: `${'abc'[r]}) ${options[r]}` })),
})
/** Gaps to complete. */
export const complete = (title: string, instr: string, rows: [q: string, a: string][], cols: 1 | 2 = 1, lines = false): Block => ({
  t: 'exercise', title, instr, size: 13.5, cols, lines, items: rows.map(([q, a]) => ({ q, a })),
})
/** Sentences to correct, each with a line to write the right one. */
export const correct = (rows: [wrong: string, right: string][]): Block =>
  complete('Correct the mistakes', 'Write the correct sentence. - اكتب الجملة الصحيحة.', rows, 1, true)
export const grammarBar = (title: string, icon = '📘'): Block => ({ t: 'bar', title, icon, tone: 'grammar' })
export const practiceBar: Block = { t: 'bar', title: 'Practice - تمارين', icon: '✏️', tone: 'practice' }
/** «In the conversation»: the rule found in the unit's conversation. */
export const inTalk = (items: string[]): Block => ({ t: 'bullets', box: true, section: true, tone: 'talk', heading: 'In the conversation - في المحادثة 🗣️', size: 13, items })
/** A titled box of examples. */
export const box = (heading: string, items: string[], size = 13): Block[] => [{ t: 'bullets', box: true, heading, size, items }]
/** Two boxes side by side, the same height. */
export const pair = (left: Block[], right: Block[]): Block => ({ t: 'row', widths: '1fr 1fr', stretch: true, blocks: [left, right] })
/** A two-column table, header row first. */
export const table = (title: string | undefined, head: string[] | null, rows: string[][], span?: number[]): Block => ({
  t: 'grid', ...(title ? { title } : {}), rows: [
    ...(head ? [{ dark: true, span, cells: head }] : []),
    ...rows.map(cells => ({ span, size: 13, cells })),
  ],
})
