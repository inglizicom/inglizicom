/**
 * The Level 1 play cards' types and the builders the lesson files use: one
 * line per card, so a lesson's nine cards read as a list.
 */

export type Game = 'call' | 'timer' | 'tarjemni' | 'ratebni' | 'sahehni' | 'kemelni'
/** Kemelni: give the answer to a question, guess the question of an answer, or say what could come next. */
export type KemelniMode = 'answer' | 'question' | 'next'

export interface PlayCard {
  id: string
  game: Game
  lesson: number
  /* ── the player's side ── */
  /** A picture (an emoji until the photo is uploaded). */
  icon?: string
  /** WhatDoWeCall: the word to name (Arabic, or numbers). Tarjemni: the Arabic to translate. */
  ar?: string
  /** TimerPlay: the task. Sahehni: the sentence with the mistake. Kemelni: the line said. Ratebni: nothing. */
  en?: string
  enAr?: string
  /** Ratebni: the words, mixed. */
  words?: string[]
  /** TimerPlay and Ratebni: the time, in seconds. */
  seconds?: number
  mode?: KemelniMode
  /* ── the asker's side ── */
  answer: string
  answerAr: string
  /** WhatDoWeCall: the book's sentence with the word (the bonus). */
  sentence?: string
  /** TimerPlay: the book's answers, then those the extended vocabulary book adds. */
  accept?: string[]
  extra?: string[]
  /** Sahehni: the mistake → its correction. */
  fix?: [wrong: string, right: string]
  /** For the asker (Arabic, may quote English after a colon): what else to accept. */
  note?: string
}

type Card = Omit<PlayCard, 'id'>

/** WhatDoWeCall: [picture, the Arabic word, the English, the book's sentence]. */
export const call = (lesson: number, icon: string, ar: string, answer: string, sentence: string): Card =>
  ({ game: 'call', lesson, icon, ar, answer, answerAr: ar, sentence })
/** TimerPlay: the task, the time, what counts (the book's, then the extended vocabulary book's). */
export const timer = (lesson: number, icon: string, seconds: number, en: string, enAr: string, accept: string[], extra?: string[]): Card =>
  ({ game: 'timer', lesson, icon, seconds, en, enAr, answer: en, answerAr: enAr, accept, ...(extra ? { extra } : {}) })
/** Tarjemni: the Arabic, its English. */
export const tarjemni = (lesson: number, ar: string, answer: string, note?: string): Card =>
  ({ game: 'tarjemni', lesson, ar, answer, answerAr: ar, ...(note ? { note } : {}) })
/** Ratebni: the words mixed, the sentence, its Arabic. */
export const ratebni = (lesson: number, words: string[], answer: string, answerAr: string, seconds = 30): Card =>
  ({ game: 'ratebni', lesson, words, seconds, answer, answerAr })
/** Sahehni: the wrong sentence, the right one, its Arabic, the words that change. */
export const sahehni = (lesson: number, en: string, answer: string, answerAr: string, fix: [string, string], note?: string): Card =>
  ({ game: 'sahehni', lesson, en, answer, answerAr, fix, ...(note ? { note } : {}) })
/** Kemelni: the mode, the line said (English, Arabic), the expected line (English, Arabic). */
export const kemelni = (lesson: number, mode: KemelniMode, en: string, enAr: string, answer: string, answerAr: string, note?: string): Card =>
  ({ game: 'kemelni', lesson, mode, en, enAr, answer, answerAr, ...(note ? { note } : {}) })

/** Ids by lesson and position: "07-4". */
export const withIds = (cards: Card[]): PlayCard[] => {
  const seen = new Map<number, number>()
  return cards.map(c => {
    const k = (seen.get(c.lesson) ?? 0) + 1
    seen.set(c.lesson, k)
    return { ...c, id: `${String(c.lesson).padStart(2, '0')}-${k}` }
  })
}
