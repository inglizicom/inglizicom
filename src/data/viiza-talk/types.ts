import type { Pair, Region } from '../viiza-book/types.ts'

/**
 * VIIZA ENGLISH, Words & Conversations: the third book of the travel guide.
 * For every stop of the Student's Book, twelve new words (none of the
 * Student's Book's twelve) and four more conversations of the same
 * situation, each from another angle: another region, another person,
 * another twist (a problem, a phone call, a misunderstanding), so the
 * traveller has heard the situation five times before living it. Two A4
 * pages a stop: the words and conversations 1–2, then conversations 3–4 and
 * "Your turn".
 */

/** One conversation: its title, where and who, and its lines [speaker, English, Arabic]. */
export interface Conversation {
  title: Pair
  region: Region
  place: string
  /** Speaker → role in Arabic; the traveller first. */
  cast: Record<string, string>
  lines: [who: string, en: string, ar: string][]
}

export interface TalkStop {
  n: number
  /** Twelve new words: [English, Arabic]. */
  words: Pair[]
  /** Four conversations. */
  talks: Conversation[]
  /** "Your turn": a fifth situation to act out, [English, Arabic]. */
  yourTurn: Pair
}
