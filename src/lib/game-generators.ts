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
