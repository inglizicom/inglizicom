import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LEVEL1_VOCAB } from '../../src/data/level1-vocab/index.ts'
import { CARD_LESSONS } from '../../src/data/level1-cards/index.ts'
import { vocabSections } from '../../src/data/level1-audio/index.ts'

const AR = /[؀-ۿ]/

test('the Level 1 vocabulary book: every lesson, in order, the four parts full', () => {
  assert.deepEqual(LEVEL1_VOCAB.map(u => u.n), CARD_LESSONS.map(l => l.n))
  for (const u of LEVEL1_VOCAB) {
    const at = `lesson ${u.n}`
    assert.equal(u.vocab.length, 10, `${at}: ten words`)
    for (const e of u.vocab) assert.ok(e.icon && e.en && AR.test(e.ar) && e.ex && !AR.test(e.ex) && AR.test(e.exAr), `${at}: ${e.en}`)
    assert.equal(u.groups.length, 3, at)
    for (const gp of u.groups) {
      assert.ok(gp.words.length >= 10, `${at}: ${gp.en}`)
      for (const w of gp.words) assert.ok(w.en && !AR.test(w.en) && AR.test(w.ar), `${at}: ${gp.en} «${w.en}»`)
    }
    assert.equal(u.talks.length, 2, at)
    for (const t of u.talks) {
      assert.equal(t.lines.length, 6, `${at}: ${t.titleEn}`)
      for (const l of t.lines) assert.ok(l.en && !AR.test(l.en) && AR.test(l.ar), `${at}: «${l.en}»`)
    }
    assert.equal(u.ask.length, 4, at)
    assert.equal(u.answer.length, 4, at)
    const words = u.reading.text.split(/\s+/).length
    assert.ok(words >= 60 && words <= 110, `${at}: the reading is ${words} words`)
    assert.equal(u.reading.tf.length, 3, at)
    assert.equal(u.reading.qs.length, 2, at)
  }
})

test('no word twice in a lesson (the words and the groups)', () => {
  for (const u of LEVEL1_VOCAB) {
    const seen = new Set()
    for (const en of [...u.vocab.map(e => e.en), ...u.groups.flatMap(g => g.words.map(w => w.en))]) {
      const k = en.toLowerCase()
      assert.ok(!seen.has(k), `lesson ${u.n}: «${en}» twice`)
      seen.add(k)
    }
  }
})

test('every lesson of the vocabulary book has its audio: words, examples, groups, conversations, reading', () => {
  for (const u of LEVEL1_VOCAB) {
    const s = vocabSections(u.n)
    assert.equal(s.length, 2 + 3 + 2 + 2, `lesson ${u.n}`)
    for (const c of s.flatMap(x => x.clips)) assert.ok(c.en && !AR.test(c.en), `lesson ${u.n}: «${c.en}»`)
  }
})
