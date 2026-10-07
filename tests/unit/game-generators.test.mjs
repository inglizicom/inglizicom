import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateWordSearch, solutionCells, scrambleSentence, generateScrambleSet, generateMatchingSet,
} from '../../src/lib/game-generators.ts'
import { EVERYDAY_ENGLISH } from '../../src/data/workbook/everyday-english.ts'

/*
 * The /admin/games workbook algorithms (lib/game-generators.ts) and the book
 * data they run on. Pure functions — every rule checked directly: every word
 * lands in the grid without corrupting another, a scramble never hands back
 * the original order or a give-away capital/question mark, matching never
 * loses a pair — and all 19 units of the book generate cleanly.
 */

function wordsOnGrid(grid, placed) {
  return placed.every(p => {
    for (let i = 0; i < p.word.length; i++) {
      if (grid[p.row + p.dRow * i]?.[p.col + p.dCol * i] !== p.word[i]) return false
    }
    return true
  })
}

describe('word search', () => {
  it('places every word, readable from its recorded start and direction', () => {
    const words = ['APPLE', 'BREAD', 'MILK', 'EGG', 'RICE', 'WATER']
    const r = generateWordSearch(words, { seed: 7 })
    assert.deepEqual(r.unplaced, [])
    assert.equal(r.placed.length, words.length)
    assert.ok(wordsOnGrid(r.grid, r.placed))
    for (const row of r.grid) for (const cell of row) assert.match(cell, /^[A-Z]$/)
  })

  it('easy = only left-to-right and top-to-bottom; medium adds the ↘ diagonal; never backwards below hard', () => {
    const words = ['BATHROOM', 'BREAKFAST', 'SHOWER', 'COFFEE', 'PHONE', 'ALARM', 'TEETH', 'SHOES']
    for (let seed = 1; seed <= 10; seed++) {
      const easy = generateWordSearch(words, { seed, difficulty: 'easy' })
      assert.ok(easy.placed.every(p => (p.dRow === 0 && p.dCol === 1) || (p.dRow === 1 && p.dCol === 0)))
      const med = generateWordSearch(words, { seed, difficulty: 'medium' })
      assert.ok(med.placed.every(p => p.dRow >= 0 && p.dCol >= 0))
    }
  })

  it('grows the grid rather than fail', () => {
    const r = generateWordSearch(['PRESCRIPTION', 'TEMPERATURE', 'APPOINTMENT', 'RECEPTION', 'ALLERGY', 'CLINIC'], { size: 6, seed: 2 })
    assert.deepEqual(r.unplaced, [])
    assert.ok(r.size >= 12)
  })

  it('answer key marks exactly the letters of the placed words', () => {
    const r = generateWordSearch(['CAT', 'DOG'], { seed: 4, difficulty: 'easy' })
    const cells = solutionCells(r.placed)
    assert.ok(cells.size <= 6 && cells.size >= 5)          // 6 letters, maybe one shared
    for (const k of cells) { const [y, x] = k.split(':').map(Number); assert.match(r.grid[y][x], /[CATDOG]/) }
  })

  it('is deterministic for a given seed', () => {
    assert.deepEqual(generateWordSearch(['APPLE', 'MILK'], { seed: 42 }).grid, generateWordSearch(['APPLE', 'MILK'], { seed: 42 }).grid)
  })
})

describe('phrases in order', () => {
  it('shuffles the words but never returns the original order', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = scrambleSentence('I put on my shoes every morning.', seed)
      assert.notDeepEqual(r.scrambled, r.words)
      assert.deepEqual([...r.scrambled].sort(), [...r.words].sort())
    }
  })

  it('no give-aways: punctuation off the chips, first word in lower case — but keeps I and acronyms', () => {
    const q = scrambleSentence('Can I pay by card?', 1)
    assert.deepEqual(q.words, ['can', 'I', 'pay', 'by', 'card'])
    assert.equal(q.end, '?')
    assert.equal(q.original, 'Can I pay by card?')
    assert.deepEqual(scrambleSentence("I'm running late.", 1).words, ["I'm", 'running', 'late'])
    assert.deepEqual(scrambleSentence('Sorry, I missed your call.', 1).words, ['sorry', 'I', 'missed', 'your', 'call'])
    assert.deepEqual(scrambleSentence('ATM kept my card.', 1).words[0], 'ATM')
  })

  it('one item per sentence, in order', () => {
    const set = generateScrambleSet(['She orders a coffee.', 'He pays the bill.'], 1)
    assert.deepEqual(set.map(s => s.original), ['She orders a coffee.', 'He pays the bill.'])
  })
})

describe('matching', () => {
  it('keeps English in order, shuffles Arabic, every matchId points to its partner, few left facing each other', () => {
    const pairs = Array.from({ length: 10 }, (_, i) => ({ en: `w${i}`, ar: `ع${i}` }))
    for (let seed = 1; seed <= 20; seed++) {
      const m = generateMatchingSet(pairs, seed)
      assert.deepEqual(m.left.map(l => l.text), pairs.map(p => p.en))
      for (const r of m.right) assert.equal(r.text, pairs[r.matchId].ar)
      assert.ok(m.right.filter((r, i) => r.matchId === i).length <= 2)
    }
  })
})

describe('the book: all 19 units generate cleanly', () => {
  it('19 units, each with 12 single words, 8 phrases, and a full grid', () => {
    assert.equal(EVERYDAY_ENGLISH.length, 19)
    for (const u of EVERYDAY_ENGLISH) {
      assert.equal(u.words.length, 12, `unit ${u.n} words`)
      assert.equal(u.phrases.length, 8, `unit ${u.n} phrases`)
      for (const x of u.words) assert.match(x.en, /^[a-z]+$/, `unit ${u.n}: "${x.en}" must be one word for the grid`)
      assert.equal(new Set(u.words.map(x => x.en)).size, 12, `unit ${u.n} has a duplicate word`)
      const r = generateWordSearch(u.words.map(x => x.en), { seed: u.n, difficulty: 'medium', size: 12 })
      assert.deepEqual(r.unplaced, [], `unit ${u.n}`)
      assert.ok(r.size <= 14, `unit ${u.n} grid ${r.size} too big for the page`)
      for (const p of u.phrases) assert.ok(scrambleSentence(p).words.length >= 3, `unit ${u.n}: "${p}" too short`)
    }
  })
})
