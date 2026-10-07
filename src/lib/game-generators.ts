/**
 * Pure puzzle-generation algorithms behind /admin/games — word search,
 * sentence scramble, and matching/bingo. No Supabase, no DOM: these take a
 * word or sentence list and return a laid-out puzzle, so the three admin
 * pages only have to render and print the result. Kept framework-free so
 * they're cheap to unit-test and safe to reuse for any future course.
 *
 * Target words stay in English (that's what the course teaches); Arabic is
 * only the surrounding title/clue text, so none of this needs Arabic letter
 * shaping — plain grid placement is enough.
 */

/* ───────────────────────── Word search ──────────────────────────────── */

export interface WordSearchOptions {
  size?: number          // grid side length; auto-grows if words don't fit
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

const DIRECTIONS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [-1, 1],   // → ↓ ↘ ↗
  [0, -1], [-1, 0], [-1, -1], [1, -1], // ← ↑ ↖ ↙
]

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

const cleanWord = (w: string) => w.trim().toUpperCase().replace(/[^A-Z]/g, '')

/** Places every word in a square grid, filling gaps with random letters.
 *  Grows the grid and retries if words don't fit the requested size. */
export function generateWordSearch(words: string[], opts: WordSearchOptions = {}): WordSearchResult {
  const clean = [...new Set(words.map(cleanWord).filter(Boolean))].sort((a, b) => b.length - a.length)
  const next = rng(opts.seed ?? 1)
  const maxAttempts = opts.maxAttempts ?? 200
  let size = Math.max(opts.size ?? 0, clean[0]?.length ?? 0, 6)

  for (let growth = 0; growth < 6; growth++) {
    const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null))
    const placed: PlacedWord[] = []
    const unplaced: string[] = []

    for (const word of clean) {
      let ok = false
      for (let attempt = 0; attempt < maxAttempts && !ok; attempt++) {
        const [dRow, dCol] = DIRECTIONS[Math.floor(next() * DIRECTIONS.length)]
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
    size += 2   // grid was too tight — grow and start this size over
  }
  // Unreachable in practice (size caps at 30), kept for type safety.
  return { grid: [], size, placed: [], unplaced: clean }
}

/* ───────────────────────── Sentence scramble ─────────────────────────── */

export interface ScrambleItem {
  original: string
  words: string[]
  scrambled: string[]
}

/** Shuffles a sentence's words (Fisher–Yates), guaranteed to differ from the
 *  original order whenever more than one distinct arrangement exists. */
export function scrambleSentence(sentence: string, seed = 1): ScrambleItem {
  const words = sentence.trim().split(/\s+/).filter(Boolean)
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
  return { original: sentence.trim(), words, scrambled }
}

export function generateScrambleSet(sentences: string[], seed = 1): ScrambleItem[] {
  return sentences.map((s, i) => scrambleSentence(s, seed + i * 97))
}

/* ───────────────────────── Matching / bingo ──────────────────────────── */

export interface WordPair { en: string; ar: string }

export interface MatchingSet {
  left: { id: number; text: string }[]           // English, in the given order
  right: { id: number; text: string; matchId: number }[]   // Arabic, shuffled
}

/** Two columns for a cut-and-match or draw-a-line exercise: English in order,
 *  Arabic translations shuffled, each tagged with the id it matches. */
export function generateMatchingSet(pairs: WordPair[], seed = 1): MatchingSet {
  const next = rng(seed)
  const left = pairs.map((p, i) => ({ id: i, text: p.en }))
  const shuffled = pairs.map((p, i) => ({ id: i, text: p.ar, matchId: i }))
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return { left, right: shuffled }
}

/** One bingo card: a size×size grid of words drawn from the pool, shuffled.
 *  Needs at least size*size words; throws otherwise (caller should validate first). */
export function generateBingoCard(words: string[], size = 4, seed = 1): string[][] {
  const need = size * size
  if (words.length < need) throw new Error(`يلزم ${need} كلمة على الأقل لبطاقة ${size}×${size} (المتوفر: ${words.length})`)
  const next = rng(seed)
  const pool = [...words]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const picked = pool.slice(0, need)
  const grid: string[][] = []
  for (let r = 0; r < size; r++) grid.push(picked.slice(r * size, r * size + size))
  return grid
}

/** Several bingo cards from the same pool — each a different shuffle, so no
 *  two students in a class hold an identical card. */
export function generateBingoCards(words: string[], count: number, size = 4, seed = 1): string[][][] {
  return Array.from({ length: count }, (_, i) => generateBingoCard(words, size, seed + i * 53))
}
