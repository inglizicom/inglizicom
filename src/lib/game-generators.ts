/**
 * Pure puzzle-generation algorithms behind /admin/games — word search,
 * phrases in order (scramble) and matching. No Supabase, no DOM: they take a
 * word or sentence list and return a laid-out puzzle, so the pages only render
 * and print. Paper-workbook exercises only (no bingo: that's a classroom game,
 * not something a student does alone on a printed page).
 *
 * Target words stay in English (that's what the course teaches); Arabic is
 * only the surrounding title/clue text, so none of this needs Arabic letter
 * shaping — plain grid placement is enough.
 */

/* ───────────────────────── Word search ──────────────────────────────── */

/** easy: → ↓ only · medium: + ↘ · hard: all 8 directions, backwards too.
 *  A1–A2 learners struggle with backwards words; the workbook uses medium. */
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface WordSearchOptions {
  size?: number          // grid side length; auto-grows if words don't fit
  difficulty?: Difficulty
  maxAttempts?: number   // per-word placement tries before growing the grid
  seed?: number          // deterministic output for tests/previews
}
export interface PlacedWord {
  word: string
  row: number
  col: number
  dRow: number
  dCol: number
}
export interface WordSearchResult {
  grid: string[][]
  size: number
  placed: PlacedWord[]
  /** Words that still didn't fit after growing the grid (should be empty in practice). */
  unplaced: string[]
}

const DIRECTIONS: Record<Difficulty, [number, number][]> = {
  easy:   [[0, 1], [1, 0]],
  medium: [[0, 1], [1, 0], [1, 1]],
  hard:   [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]],
}

/** Small deterministic PRNG (mulberry32) so a seed gives a reproducible puzzle. */
function rng(seed: number): () => number {
  let a = seed >>> 0 || 1
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const cleanWord = (w: string) => w.trim().toUpperCase().replace(/[^A-Z]/g, '')

/** Places every word in a square grid, filling gaps with random letters.
 *  Grows the grid and retries if words don't fit the requested size. */
export function generateWordSearch(words: string[], opts: WordSearchOptions = {}): WordSearchResult {
  const clean = [...new Set(words.map(cleanWord).filter(Boolean))].sort((a, b) => b.length - a.length)
  const next = rng(opts.seed ?? 1)
  const dirs = DIRECTIONS[opts.difficulty ?? 'hard']
  const maxAttempts = opts.maxAttempts ?? 300
  let size = Math.max(opts.size ?? 0, clean[0]?.length ?? 0, 6)

  for (let growth = 0; growth < 8; growth++) {
    const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null))
    const placed: PlacedWord[] = []
    const unplaced: string[] = []

    for (const word of clean) {
      let ok = false
      for (let attempt = 0; attempt < maxAttempts && !ok; attempt++) {
        const [dRow, dCol] = dirs[Math.floor(next() * dirs.length)]
        const row = Math.floor(next() * size)
        const col = Math.floor(next() * size)
        const endRow = row + dRow * (word.length - 1)
        const endCol = col + dCol * (word.length - 1)
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue
        let fits = true
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row + dRow * i][col + dCol * i]
          if (cell !== null && cell !== word[i]) { fits = false; break }
        }
        if (!fits) continue
        for (let i = 0; i < word.length; i++) grid[row + dRow * i][col + dCol * i] = word[i]
        placed.push({ word, row, col, dRow, dCol })
        ok = true
      }
      if (!ok) unplaced.push(word)
    }

    if (unplaced.length === 0 || size >= 30) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const filled = grid.map(r => r.map(c => c ?? letters[Math.floor(next() * letters.length)]))
      return { grid: filled, size, placed, unplaced }
    }
    size += 1   // grid was too tight — grow and start this size over
  }
  return { grid: [], size, placed: [], unplaced: clean }
}

/** "row:col" of every letter that belongs to a placed word — the answer key. */
export function solutionCells(placed: PlacedWord[]): Set<string> {
  const s = new Set<string>()
  for (const p of placed) for (let i = 0; i < p.word.length; i++) s.add(`${p.row + p.dRow * i}:${p.col + p.dCol * i}`)
  return s
}

/* ───────────────────────── Phrases in order ──────────────────────────── */

export interface ScrambleItem {
  original: string
  /** The words as they appear on the chips: no punctuation, and the first
   *  word not capitalised (a capital letter or "?" would give the answer away). */
  words: string[]
  scrambled: string[]
  /** The sentence's closing mark (". ? !"), printed at the end of the answer line. */
  end: string
}

const keepCap = (w: string) => /^I($|')/.test(w) || (w.length > 1 && w === w.toUpperCase())

/** Shuffles a sentence's words (Fisher–Yates), guaranteed to differ from the
 *  original order whenever more than one distinct arrangement exists. */
export function scrambleSentence(sentence: string, seed = 1): ScrambleItem {
  const original = sentence.trim()
  const end = /[.?!]$/.test(original) ? original.slice(-1) : ''
  const words = original
    .split(/\s+/).filter(Boolean)
    .map(t => t.replace(/^[^\w']+|[^\w']+$/g, ''))
    .filter(Boolean)
    .map((t, i) => (i === 0 && !keepCap(t) ? t[0].toLowerCase() + t.slice(1) : t))
  const next = rng(seed)
  let scrambled = words
  for (let tries = 0; tries < 20; tries++) {
    const arr = [...words]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    scrambled = arr
    if (arr.join(' ') !== words.join(' ')) break
  }
  return { original, words, scrambled, end }
}

export function generateScrambleSet(sentences: string[], seed = 1): ScrambleItem[] {
  return sentences.map((s, i) => scrambleSentence(s, seed + i * 97))
}

/* ───────────────────────── Fill in the blanks ────────────────────────── */

export interface GapItem { before: string; answer: string; after: string; original: string }

/** Words never worth blanking: the student can't guess them from meaning. */
const STOP = new Set(('a an the is are am was be been do does did can could would will should shall may i you he she it we they ' +
  'my your his her its our their me him us them this that these those there here what where when how which who ' +
  'and or but to of in on at for with from by about some any much many just very too also not no yes please'
).split(' '))

/** One gap per sentence, plus the shuffled word bank. The gap is a word from
 *  the unit's vocabulary when the sentence has one, otherwise a meaningful
 *  word (never "the", "is"…); no answer is used twice, so the bank is exact. */
export function makeGapFill(sentences: string[], unitWords: string[], seed = 1): { items: GapItem[]; bank: string[] } {
  const next = rng(seed)
  const vocab = new Set(unitWords.map(x => x.toLowerCase()))
  const used = new Set<string>()
  const items = sentences.map(s => {
    const tokens = s.trim().split(/\s+/)
    const parts = tokens.map(t => /^([^A-Za-z']*)([A-Za-z][A-Za-z'-]*)([^A-Za-z']*)$/.exec(t))
    const cands = parts.map((m, i) => ({ m, i })).filter(({ m }) => {
      if (!m) return false
      const k = m[2].toLowerCase()
      return !STOP.has(k) && !k.includes("'") && k.length >= 3 && !used.has(k)
    })
    const fromVocab = cands.filter(({ m }) => vocab.has(m![2].toLowerCase()))
    // Only little words ("How much is it?"): fall back to the longest one.
    const fallback = parts.map((m, i) => ({ m, i }))
      .filter(({ m }) => m && !m[2].includes("'") && m[2].length >= 3 && !used.has(m[2].toLowerCase()))
      .sort((a, b) => b.m![2].length - a.m![2].length).slice(0, 1)
    const pool = fromVocab.length ? fromVocab : cands.length ? cands : fallback
    const pick = pool.length ? pool[Math.floor(next() * pool.length)] : null
    if (!pick) return { before: s, answer: '', after: '', original: s }
    const m = pick.m!
    used.add(m[2].toLowerCase())
    return {
      before: tokens.slice(0, pick.i).join(' ') + (pick.i ? ' ' : '') + m[1],
      answer: m[2],
      after: m[3] + (pick.i < tokens.length - 1 ? ' ' + tokens.slice(pick.i + 1).join(' ') : ''),
      original: s,
    }
  })
  const bank = items.map(x => x.answer).filter(Boolean)
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[bank[i], bank[j]] = [bank[j], bank[i]]
  }
  return { items, bank }
}

/* ───────────────────────── Missing letters ───────────────────────────── */

export interface MissingWord { word: string; letters: { ch: string; hidden: boolean }[] }

/** Hides about 40% of a word's letters (never the first), at least one. */
export function missingLetters(word: string, seed = 1): MissingWord {
  const next = rng(seed)
  const w = word.toLowerCase()
  const idx = [...w].map((_, i) => i).filter(i => i > 0)
  const hide = Math.max(1, Math.min(idx.length, Math.round(w.length * 0.4)))
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  const hidden = new Set(idx.slice(0, hide))
  return { word: w, letters: [...w].map((ch, i) => ({ ch, hidden: hidden.has(i) })) }
}

/* ───────────────────────── Matching ──────────────────────────────────── */

export interface WordPair { en: string; ar: string }

export interface MatchingSet {
  left: { id: number; text: string }[]                     // English, in the given order
  right: { id: number; text: string; matchId: number }[]   // Arabic, shuffled
}

/** Two columns for a draw-a-line exercise: English in order, Arabic shuffled,
 *  each tagged with the id it matches. Never leaves every pair facing its
 *  partner (that would make the exercise trivial) when there are 3+ pairs. */
export function generateMatchingSet(pairs: WordPair[], seed = 1): MatchingSet {
  const next = rng(seed)
  const left = pairs.map((p, i) => ({ id: i, text: p.en }))
  let right = pairs.map((p, i) => ({ id: i, text: p.ar, matchId: i }))
  for (let tries = 0; tries < 20; tries++) {
    const arr = [...right]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    right = arr
    const facing = arr.filter((r, i) => r.matchId === i).length
    if (pairs.length < 3 || facing <= Math.floor(pairs.length / 4)) break
  }
  return { left, right }
}
