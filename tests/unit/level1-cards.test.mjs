import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BOUCHTA, CARDS, CARD_LESSONS, GAMES, cardSheets, mirrorRows, photoOf } from '../../src/data/level1-cards/index.ts'
import { LEVEL1_LESSONS } from '../../src/data/level1-book.ts'

const AR = /[؀-ۿ]/
/** Every lesson's pack, in this order: WhatDoWeCall ×2, TimerPlay, Tarjemni, Ratebni, Sahehni, Kemelni ×3 (answer, question, next). */
const PACK = ['call', 'call', 'timer', 'tarjemni', 'ratebni', 'sahehni', 'kemelni', 'kemelni', 'kemelni']

test('every lesson of the book has its pack of nine, the same games in the same order', () => {
  assert.deepEqual(CARD_LESSONS.map(l => l.n), LEVEL1_LESSONS.map(l => l.n))
  for (const l of CARD_LESSONS) {
    const pack = CARDS.filter(c => c.lesson === l.n)
    assert.deepEqual(pack.map(c => c.game), PACK, `lesson ${l.n}`)
    assert.deepEqual(pack.filter(c => c.game === 'kemelni').map(c => c.mode), ['answer', 'question', 'next'], `lesson ${l.n}: Kemelni`)
  }
  assert.equal(new Set(CARDS.map(c => c.id)).size, CARDS.length, 'ids are unique')
  assert.equal(new Set(CARDS.filter(c => c.game === 'call').map(photoOf)).size, CARDS.filter(c => c.game === 'call').length, 'one photo name per picture')
})

test('every card: the task its game needs, the answer in English and Arabic', () => {
  for (const c of CARDS) {
    const at = `${c.id} (${c.game})`
    assert.ok(GAMES[c.game], at)
    assert.ok(c.answer && !AR.test(c.answer), `${at}: English answer`)
    assert.ok(AR.test(c.answerAr), `${at}: Arabic answer`)
    if (c.en) assert.ok(!AR.test(c.en), `${at}: "${c.en}" has no Arabic`)
    if (c.enAr) assert.ok(AR.test(c.enAr), `${at}: the Arabic line is Arabic`)
    if (c.game === 'call') assert.ok(c.icon && c.ar && c.sentence && c.sentence.toLowerCase().includes(c.answer.toLowerCase().replace(/^(a|an|the|to) /, '').split(' ')[0]), `${at}: the sentence uses the word`)
    if (c.game === 'timer') assert.ok(c.seconds && c.en && c.enAr && c.accept.length >= 4, at)
    if (c.game === 'tarjemni') assert.ok(AR.test(c.ar), at)
    if (c.game === 'ratebni') {
      // the words are the sentence's, mixed
      const norm = s => s.replace(/[.,?!]/g, '').split(/\s+/).sort().join(' ')
      assert.equal(norm(c.words.join(' ')), norm(c.answer), at)
      assert.notEqual(c.words.join(' '), c.answer.replace(/[.?!]$/, ''), `${at}: not already in order`)
      assert.ok(c.seconds, at)
    }
    if (c.game === 'sahehni') {
      assert.ok(c.en !== c.answer && c.fix, at)
      assert.ok(c.en.includes(c.fix[0]) && c.answer.includes(c.fix[1]), `${at}: the fix is in both sentences`)
    }
    if (c.game === 'kemelni') assert.ok(c.mode && c.en && c.enAr, at)
  }
})

test('notes for the asker: Arabic first, any English after a colon (or the lines wrap into each other)', () => {
  for (const c of [...CARDS, ...BOUCHTA].filter(x => x.note)) {
    const at = c.note.search(/[A-Za-z]/)
    if (at < 0) continue
    assert.match(c.note.slice(0, at).trim(), /[؀-ۿ][^A-Za-z]*:$/, `${c.id}: "${c.note}"`)
    assert.ok(!AR.test(c.note.slice(at)), `${c.id}: the English part has no Arabic`)
  }
})

test('double-sided print: one sheet per lesson, each back behind its front', () => {
  const sheets = cardSheets(CARDS)
  assert.equal(sheets.length, CARD_LESSONS.length)
  for (const sheet of sheets) {
    assert.equal(sheet.length, 9)
    assert.equal(new Set(sheet.map(c => c.lesson)).size, 1)
    const backs = mirrorRows(sheet)
    sheet.forEach((card, i) => assert.equal(backs[Math.floor(i / 3) * 3 + (2 - (i % 3))], card))
  }
})

test("Bouchta's cards: nine silly questions on studied lessons, nine actions, two sheets", () => {
  assert.equal(BOUCHTA.length, 18)
  assert.equal(new Set(BOUCHTA.map(b => b.id)).size, 18)
  const silly = BOUCHTA.filter(b => b.kind === 'silly')
  assert.equal(silly.length, 9)
  for (const b of silly) assert.ok(CARD_LESSONS.some(l => l.n === b.lesson) && b.points, b.id)
  for (const b of BOUCHTA) {
    assert.ok(b.en && !AR.test(b.en) && AR.test(b.ar), `${b.id}: the title or question in both languages`)
    assert.ok(b.answer && !AR.test(b.answer) && AR.test(b.answerAr), `${b.id}: the answer in both languages`)
  }
})