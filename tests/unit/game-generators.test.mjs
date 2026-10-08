import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateWordSearch, solutionCells, scrambleSentence, generateScrambleSet, generateMatchingSet,
  makeGapFill, missingLetters,
} from '../../src/lib/game-generators.ts'
import { EVERYDAY_ENGLISH } from '../../src/data/workbook/everyday-english.ts'
import { LEVEL1_DIALOGUES, LEVEL1_WORKBOOK } from '../../src/data/workbook/level1-workbook.ts'

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

describe('fill in the blanks', () => {
  it('blanks a unit word when the sentence has one, rebuilds the sentence exactly, bank = answers', () => {
    const s = ['Can you wash the vegetables?', 'It needs a little more salt.', "I'm making lunch."]
    const { items, bank } = makeGapFill(s, ['vegetables', 'salt'], 3)
    assert.equal(items[0].answer, 'vegetables')
    assert.equal(items[1].answer, 'salt')
    for (const it of items) assert.equal(`${it.before}${it.answer}${it.after}`, it.original)
    assert.deepEqual([...bank].sort(), items.map(i => i.answer).sort())
  })

  it('allowRepeat: a line whose words are all taken still gets a gap (conversations)', () => {
    const lines = ['My phone number is 0612.', 'His phone number is 0700.']
    const loose = makeGapFill(lines, ['phone', 'number'], 2, { allowRepeat: true })
    for (const it of loose.items) {
      assert.ok(it.answer, `no gap in "${it.original}"`)
      assert.equal(`${it.before}${it.answer}${it.after}`, it.original)
    }
  })

  it('never blanks a little word, a contraction, or the same word twice', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { items } = makeGapFill(['Can I pay by card?', 'Can I pay in cash?', "What's the first thing you do?"], [], seed)
      for (const it of items) {
        assert.ok(it.answer.length >= 3 && !it.answer.includes("'"))
        assert.ok(!['can', 'the', 'you', 'what'].includes(it.answer.toLowerCase()))
      }
      assert.equal(new Set(items.map(i => i.answer.toLowerCase())).size, items.length)
    }
  })
})

describe('missing letters', () => {
  it('hides ~40%, never the first letter, at least one', () => {
    for (const word of ['tea', 'breakfast', 'toothpaste', 'bag']) {
      const m = missingLetters(word, 5)
      assert.equal(m.letters.map(l => l.ch).join(''), word)
      assert.equal(m.letters[0].hidden, false)
      const n = m.letters.filter(l => l.hidden).length
      assert.ok(n >= 1 && n <= Math.ceil(word.length * 0.4))
    }
  })
})

describe('the Level 1 workbook: 19 lessons and their conversations generate cleanly', () => {
  it('each lesson has 12 single words, 8 sentences with Arabic, a full grid and a gap in every sentence', () => {
    assert.equal(LEVEL1_WORKBOOK.length, 19)
    for (const u of LEVEL1_WORKBOOK) {
      assert.equal(u.words.length, 12, `lesson ${u.n} words`)
      assert.equal(u.phrases.length, 8, `lesson ${u.n} phrases`)
      for (const x of u.words) assert.match(x.en, /^[A-Za-z]+$/, `lesson ${u.n}: "${x.en}" must be one word for the grid`)
      assert.equal(new Set(u.words.map(x => x.en.toLowerCase())).size, 12, `lesson ${u.n} has a duplicate word`)
      for (const p of u.phrases) {
        assert.match(p.ar, /[؀-ۿ]/, `lesson ${u.n}: "${p.en}" needs its Arabic`)
        assert.ok(scrambleSentence(p.en).words.length >= 3, `lesson ${u.n}: "${p.en}" too short`)
      }
      const r = generateWordSearch(u.words.map(x => x.en), { seed: u.n, difficulty: 'medium', size: 12 })
      assert.deepEqual(r.unplaced, [], `lesson ${u.n}`)
      assert.ok(r.size <= 14, `lesson ${u.n} grid ${r.size} too big for the page`)
      const g = makeGapFill(u.phrases.map(x => x.en), u.words.map(x => x.en), u.n)
      for (const it of g.items) assert.ok(it.answer, `lesson ${u.n}: no gap in "${it.original}"`)
    }
  })

  it('every original conversation fits a page, names its speakers, and gets a gap on every line', () => {
    for (const [n, lines] of Object.entries(LEVEL1_DIALOGUES)) {
      assert.ok(lines.length >= 6 && lines.length <= 12, `lesson ${n}: ${lines.length} lines`)
      const texts = lines.map(l => {
        const m = l.match(/^([^:]{1,20}):\s(.*)$/)
        assert.ok(m, `lesson ${n}: "${l}" has no speaker`)
        return m[2]
      })
      const words = LEVEL1_WORKBOOK.find(u => u.n === Number(n)).words.map(x => x.en)
      const g = makeGapFill(texts, words, Number(n), { allowRepeat: true })
      for (const it of g.items) assert.ok(it.answer, `lesson ${n}: no gap in "${it.original}"`)
    }
  })
})

describe('the book: all 19 units generate cleanly', () => {
  it('19 units, each with 12 single words, 8 phrases with Arabic, a full grid and a gap in every sentence', () => {
    assert.equal(EVERYDAY_ENGLISH.length, 19)
    for (const u of EVERYDAY_ENGLISH) {
      assert.equal(u.words.length, 12, `unit ${u.n} words`)
      assert.equal(u.phrases.length, 8, `unit ${u.n} phrases`)
      for (const x of u.words) assert.match(x.en, /^[a-z]+$/, `unit ${u.n}: "${x.en}" must be one word for the grid`)
      assert.equal(new Set(u.words.map(x => x.en)).size, 12, `unit ${u.n} has a duplicate word`)
      for (const p of u.phrases) {
        assert.match(p.ar, /[؀-ۿ]/, `unit ${u.n}: "${p.en}" needs its Arabic`)
        assert.ok(scrambleSentence(p.en).words.length >= 3, `unit ${u.n}: "${p.en}" too short`)
      }
      const r = generateWordSearch(u.words.map(x => x.en), { seed: u.n, difficulty: 'medium', size: 12 })
      assert.deepEqual(r.unplaced, [], `unit ${u.n}`)
      assert.ok(r.size <= 14, `unit ${u.n} grid ${r.size} too big for the page`)
      const g = makeGapFill(u.phrases.map(x => x.en), u.words.map(x => x.en), u.n)
      for (const it of g.items) assert.ok(it.answer, `unit ${u.n}: no gap in "${it.original}"`)
    }
  })
})
