/**
 * «مفردات وعبارات للمواقف اليومية» — the companion vocabulary book of
 * «الإنجليزية للمواقف اليومية» (A1 → A2), printed from /admin/vocab-book.
 *
 * The main book can only teach a dozen words a unit; this one widens each of
 * its 19 units over four pages, with words the main book doesn't have (the
 * unit's words in data/workbook/everyday-english.ts are left out):
 *   vocab    ten new words or chunks, each with an example and its Arabic
 *   groups   three themed lists of common words (about thirty)
 *   talks    two short conversations of different kinds, plus other ways
 *            to ask and to answer the same things
 *   reading  a short A1–A2 text, its key words, true/false and questions
 * Arabic is Modern Standard Arabic, like the main book's translations.
 *
 * The content itself lives in vocab-book-units-*.ts, written compactly with
 * the helpers below.
 */

export interface VocabEntry { icon: string; en: string; ar: string; ex: string; exAr: string }
export interface Pair { en: string; ar: string }
export interface WordGroup { icon: string; en: string; ar: string; words: Pair[] }
export interface Dialogue { kindEn: string; kindAr: string; titleEn: string; titleAr: string; who: [string, string]; lines: Pair[] }
export interface Reading {
  icon: string; title: string; titleAr: string; text: string
  gloss: Pair[]
  tf: { s: string; ok: boolean }[]
  qs: { q: string; a: string }[]
}
export interface VocabUnit {
  n: number; icon: string
  vocab: VocabEntry[]
  groups: WordGroup[]
  talks: Dialogue[]
  ask: Pair[]
  answer: Pair[]
  reading: Reading
}

/** 'icon | en | ar | example | example in Arabic' */
export const v = (...rows: string[]): VocabEntry[] => rows.map(r => {
  const [icon, en, ar, ex, exAr] = r.split('|').map(s => s.trim())
  return { icon, en, ar, ex, exAr }
})

/** 'en=ar|en=ar|…' */
export const pairs = (s: string): Pair[] => s.split('|').map(x => {
  const [en, ar] = x.split('=')
  return { en: en.trim(), ar: ar.trim() }
})

export const g = (icon: string, en: string, ar: string, words: string): WordGroup => ({ icon, en, ar, words: pairs(words) })

export const d = (kind: string, title: string, who: string, lines: [string, string][]): Dialogue => {
  const [kindEn, kindAr] = kind.split('|').map(s => s.trim())
  const [titleEn, titleAr] = title.split('|').map(s => s.trim())
  const [a, b] = who.split('|').map(s => s.trim())
  return { kindEn, kindAr, titleEn, titleAr, who: [a, b], lines: lines.map(([en, ar]) => ({ en, ar })) }
}

export const tr = (rows: [string, string][]): Pair[] => rows.map(([en, ar]) => ({ en, ar }))
