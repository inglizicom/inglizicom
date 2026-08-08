/**
 * speaking/index.ts — assembles the course and derives the warm-up.
 *
 * The lessons live in four files, one per pair of weeks, because a
 * three-thousand-line data file is unreadable and nobody edits it carefully.
 * Everything else about the course — the ladder, the objectives model, the
 * Arabic-L1 traps, the sixty-minute clock — is documented in ./types.
 */

import type { Lesson } from './types'
import { W1_2 } from './w1-2'
import { W3_4 } from './w3-4'
import { W5_6 } from './w5-6'
import { W7_8 } from './w7-8'

export * from './types'

export const LESSONS: Lesson[] = [...W1_2, ...W3_4, ...W5_6, ...W7_8]
export const ORDERED: Lesson[] = [...LESSONS].sort((a, b) => a.no - b.no)

/** Recall for the warm-up, derived from the course rather than stored, so it
 *  can never fall out of step with the lessons it points at. `back` is
 *  yesterday; `far` is one week ago, which is roughly where a phrase starts to
 *  disappear if nothing touches it again.
 *
 *  Measure days carry instructions rather than sayable phrases ("No new
 *  phrases today"), so they are filtered out — being asked to "use" one of
 *  those in a warm-up is meaningless. */
export function warmUpFor(no: number): {
  back: { en: string; ar: string; from: number }[]
  far?: { en: string; ar: string; from: number }
} {
  const pick = (n: number, count: number) => {
    const l = ORDERED.find(x => x.no === n)
    if (!l) return []
    return l.target
      .filter(c => c.en.length < 70 && !c.en.startsWith('No new'))
      .slice(0, count)
      .map(c => ({ en: c.en, ar: c.ar, from: n }))
  }
  return { back: pick(no - 1, 3), far: pick(no - 6, 1)[0] }
}

/** Every lesson that transfers a skill up the ladder, for the course-map slide. */
export const BRIDGES = ORDERED.filter(l => l.from).map(l => ({
  to: l.no, from: l.from!.day, title: l.title, what: l.from!.what,
}))
