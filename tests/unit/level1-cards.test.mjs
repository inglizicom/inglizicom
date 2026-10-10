import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CARDS, CARD_LESSONS, KINDS, WORDS, cardSheets, mirrorRows } from '../../src/data/level1-cards/index.ts'

const AR = /[؀-ۿ]/

test('every card: its lesson, its kind, the answer in English and Arabic', () => {
  assert.equal(new Set(CARDS.map(c => c.id)).size, CARDS.length, 'ids are unique')
  for (const c of CARDS) {
    assert.ok(KINDS[c.kind], c.id)
    assert.ok(c.kind === 'wild' ? c.lesson === 0 : CARD_LESSONS.some(l => l.n === c.lesson), `${c.id}: lesson ${c.lesson}`)
    assert.ok(c.answerEn && !AR.test(c.answerEn), `${c.id}: English answer`)
    assert.ok(AR.test(c.answerAr), `${c.id}: Arabic answer`)
    if (c.en) assert.ok(!AR.test(c.en), `${c.id}: the English side has no Arabic`)
    if (c.ar) assert.ok(AR.test(c.ar), `${c.id}: the Arabic side is Arabic`)
    // the player's side has something to answer
    if (c.kind === 'picture') assert.ok(c.icon, c.id)
    if (c.kind === 'translate') assert.ok(c.ar, c.id)
    if (c.kind === 'silly' || c.kind === 'situation') assert.ok(c.en && c.ar, `${c.id}: asked in both languages`)
    if (c.kind === 'fix') assert.ok(c.en && c.en !== c.answerEn, `${c.id}: the mistake is not the answer`)
  }
})

test('a picture card shows a word of its lesson\'s extended vocabulary', () => {
  for (const c of CARDS.filter(x => x.photo)) {
    const w = WORDS[c.lesson]?.find(x => x.slug === c.photo)
    assert.ok(w, `${c.id}: ${c.photo}`)
    assert.ok(c.answerEn.toLowerCase().includes(w.en), `${c.id}: the answer says "${w.en}"`)
  }
})

test('double-sided print: each back lands behind its front (rows mirrored)', () => {
  for (const sheet of cardSheets(CARDS)) {
    assert.ok(sheet.length <= 9)
    const backs = mirrorRows(sheet)
    assert.equal(backs.length, 9)
    sheet.forEach((card, i) => {
      const r = Math.floor(i / 3), col = i % 3
      assert.equal(backs[r * 3 + (2 - col)], card)
    })
  }
})
