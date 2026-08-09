/**
 * speaking/index.ts — assembles the course.
 *
 * Lessons live in four files, one per pair of units, because a three-thousand
 * line data file is unreadable and nobody edits it carefully. The architecture
 * — the places-first progression, the grammar ladder, the Arabic-L1 traps and
 * the five steps — is documented in ./types.
 */

import type { Lesson } from './types'
import { U1_2 } from './u1-2'
import { U3_4 } from './u3-4'
import { U5_6 } from './u5-6'
import { U7_8 } from './u7-8'

export * from './types'

export const LESSONS: Lesson[] = [...U1_2, ...U3_4, ...U5_6, ...U7_8]
export const ORDERED: Lesson[] = [...LESSONS].sort((a, b) => a.no - b.no)

/** The first minutes of every lesson: yesterday's sentences, and one from a
 *  week ago. Derived from the course rather than stored, so it can never fall
 *  out of step with the lessons it points at. Review days carry placeholders
 *  ("No new words today") which are filtered out — being asked to use one of
 *  those in a warm-up is meaningless. */
export function recallFor(no: number): {
  back: { en: string; ar: string; from: number }[]
  far?: { en: string; ar: string; from: number }
} {
  const pick = (n: number, count: number) => {
    const l = ORDERED.find(x => x.no === n)
    if (!l) return []
    return l.sentences
      .filter(s => s.en.length < 80 && !s.en.startsWith('No new'))
      .slice(0, count)
      .map(s => ({ en: s.en, ar: s.ar, from: n }))
  }
  return { back: pick(no - 1, 3), far: pick(no - 6, 1)[0] }
}

/** Everything she is allowed to have been taught before this lesson. Used by
 *  the deck to show, on any lesson, what the language is standing on. */
export function taughtBefore(unit: number): string[] {
  return ORDERED
    .filter(l => l.unit < unit)
    .map(l => l.grammar.step)
}
