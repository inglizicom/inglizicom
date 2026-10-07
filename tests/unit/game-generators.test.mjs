import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateWordSearch, scrambleSentence, generateScrambleSet,
  generateMatchingSet, generateBingoCard, generateBingoCards,
} from '../../src/lib/game-generators.ts'

/*
 * The three /admin/games puzzle algorithms (lib/game-generators.ts). Pure
 * functions — no DOM, no network — so every rule is checked directly:
 * every word lands in the grid without corrupting another word, a scramble
 * never hands back the original order, and matching/bingo never duplicate
 * or lose an entry.
 */

function wordsOnGrid(grid, placed) {
  return placed.every(p => {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.row + p.dRow * i, c = p.col + p.dCol * i
      if (grid[r]?.[c] !== p.word[i]) return false
    }
    return true
  })
}

describe('word search', () => {
  it('places every word on the grid, readable from its recorded start/direction', () => {
    const words = ['APPLE', 'BREAD', 'MILK', 'EGG', 'RICE', 'WATER']
    const r = generateWordSearch(words, { seed: 7 })
    assert.deepEqual(r.unplaced, [])
    assert.equal(r.placed.length, words.length)
    assert.ok(wordsOnGrid(r.grid, r.placed))
    assert.ok(r.grid.every(row => row.length === r.size))
  })

  it('every cell is a single A-Z letter (no gaps left unfilled)', () => {
    const r = generateWordSearch(['CAT', 'DOG', 'FISH'], { seed: 3 })
    for (const row of r.grid) for (const cell of row) assert.match(cell, /^[A-Z]$/)
  })

  it('grows the grid rather than fail when given many/long words', () => {
    const words = ['PRESCRIPTION', 'BLOODPRESSURE', 'APPOINTMENT', 'MEDICATION', 'ALLERGY', 'CLINIC', 'NURSE', 'DOCTOR']
    const r = generateWordSearch(words, { size: 6, seed: 2 })
    assert.deepEqual(r.unplaced, [])
    assert.ok(r.size >= 13, 'grid must be at least as wide as the longest word')
  })

  it('cleans punctuation/case and drops duplicates', () => {
    const r = generateWordSearch(['cat', 'CAT', ' dog! ', 'Dog'], { seed: 1 })
    assert.equal(r.placed.length, 2)
  })

  it('is deterministic for a given seed (reproducible for a preview)', () => {
    const a = generateWordSearch(['APPLE', 'BREAD', 'MILK'], { seed: 42 })
    const b = generateWordSearch(['APPLE', 'BREAD', 'MILK'], { seed: 42 })
    assert.deepEqual(a.grid, b.grid)
  })
})

describe('sentence scramble', () => {
  it('shuffles the words but never returns the original order', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = scrambleSentence('I put on my shoes every morning', seed)
      assert.notDeepEqual(r.scrambled, r.words)
      assert.deepEqual([...r.scrambled].sort(), [...r.words].sort(), 'same words, just reordered')
    }
  })

  it('a one-word sentence has only one possible order', () => {
    const r = scrambleSentence('Hello', 5)
    assert.deepEqual(r.scrambled, ['Hello'])
  })

  it('builds one scrambled item per sentence, in order', () => {
    const set = generateScrambleSet(['She orders a coffee', 'He pays the bill'], 1)
    assert.equal(set.length, 2)
    assert.equal(set[0].original, 'She orders a coffee')
    assert.equal(set[1].original, 'He pays the bill')
  })
})

describe('matching set', () => {
  it('keeps English in order, shuffles Arabic, and every matchId still points to the right English word', () => {
    const pairs = [{ en: 'bread', ar: 'خبز' }, { en: 'milk', ar: 'حليب' }, { en: 'egg', ar: 'بيضة' }, { en: 'rice', ar: 'أرز' }]
    const m = generateMatchingSet(pairs, 9)
    assert.deepEqual(m.left.map(l => l.text), pairs.map(p => p.en))
    assert.deepEqual([...m.right].sort((a, b) => a.matchId - b.matchId).map(r => r.text), pairs.map(p => p.ar))
    for (const r of m.right) assert.equal(r.text, pairs[r.matchId].ar)
  })
})

describe('bingo', () => {
  it('builds a size×size card using only words from the pool, each once', () => {
    const words = Array.from({ length: 20 }, (_, i) => `W${i}`)
    const card = generateBingoCard(words, 4, 3)
    assert.equal(card.length, 4)
    assert.ok(card.every(row => row.length === 4))
    const flat = card.flat()
    assert.equal(new Set(flat).size, 16, 'no repeats on one card')
    assert.ok(flat.every(w => words.includes(w)))
  })

  it('refuses a card bigger than the word pool', () => {
    assert.throws(() => generateBingoCard(['a', 'b', 'c'], 4, 1))
  })

  it('several cards from the same pool are not all identical', () => {
    const words = Array.from({ length: 16 }, (_, i) => `W${i}`)
    const cards = generateBingoCards(words, 5, 4, 1)
    assert.equal(cards.length, 5)
    const flatStrings = cards.map(c => c.flat().join(','))
    assert.ok(new Set(flatStrings).size > 1, 'at least two cards should differ')
  })
})
