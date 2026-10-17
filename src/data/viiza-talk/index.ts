import { STOPS } from '../viiza-book/index.ts'
import type { TalkStop } from './types.ts'
import { TALK_1 } from './part-1.ts'
import { TALK_2 } from './part-2.ts'
import { TALK_3 } from './part-3.ts'
import { TALK_4 } from './part-4.ts'
import { TALK_5A } from './part-5a.ts'
import { TALK_5B } from './part-5b.ts'
import { TALK_6 } from './part-6.ts'

/**
 * VIIZA ENGLISH, Words & Conversations (see types.ts): the how-to and
 * contents page, then two pages a stop.
 */

export * from './types.ts'

export const TALK_STOPS: TalkStop[] = [...TALK_1, ...TALK_2, ...TALK_3, ...TALK_4, ...TALK_5A, ...TALK_5B, ...TALK_6]

export type TalkPage = { kind: 'howto' } | { kind: 'a' | 'b'; stop: number }

export function buildTalkBook() {
  const pages: TalkPage[] = [{ kind: 'howto' }]
  for (const s of STOPS) if (TALK_STOPS.some(t => t.n === s.n)) pages.push({ kind: 'a', stop: s.n }, { kind: 'b', stop: s.n })
  return { pages, pageOf: (pred: (p: TalkPage) => boolean) => pages.findIndex(pred) + 1 }
}

export const talkOf = (n: number) => TALK_STOPS.find(t => t.n === n)
