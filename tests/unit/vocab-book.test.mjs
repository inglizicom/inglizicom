import { test } from 'node:test'
import assert from 'node:assert/strict'
import { VOCAB_BOOK } from '../../src/data/workbook/vocab-book-all.ts'
import { EVERYDAY_ENGLISH } from '../../src/data/workbook/everyday-english.ts'

/* The printed pages are laid out for these exact amounts (see
   app/admin/vocab-book/_pages.tsx); a unit with more would overflow. */

test('all 19 units, in order, with the main book’s titles', () => {
  assert.deepEqual(VOCAB_BOOK.map(u => u.n), EVERYDAY_ENGLISH.map(u => u.n))
  for (const u of VOCAB_BOOK) assert.ok(u.titleEn && u.titleAr)
})

test('every unit has the same shape', () => {
  for (const u of VOCAB_BOOK) {
    const at = `unit ${u.n}`
    assert.equal(u.vocab.length, 10, at)
    assert.equal(u.groups.length, 3, at)
    for (const gp of u.groups) assert.equal(gp.words.length, 10, `${at} · ${gp.en}`)
    assert.equal(u.talks.length, 2, at)
    for (const dl of u.talks) assert.equal(dl.lines.length, 6, `${at} · ${dl.titleEn}`)
    assert.equal(u.ask.length, 4, at)
    assert.equal(u.answer.length, 4, at)
    assert.equal(u.reading.gloss.length, 5, at)
    assert.equal(u.reading.tf.length, 3, at)
    assert.equal(u.reading.qs.length, 2, at)
  }
})

test('nothing is empty or half-parsed', () => {
  const texts = []
  for (const u of VOCAB_BOOK) {
    for (const e of u.vocab) texts.push(e.icon, e.en, e.ar, e.ex, e.exAr)
    for (const gp of u.groups) { texts.push(gp.icon, gp.en, gp.ar); for (const w of gp.words) texts.push(w.en, w.ar) }
    for (const dl of u.talks) { texts.push(dl.kindEn, dl.kindAr, dl.titleEn, dl.titleAr, ...dl.who); for (const l of dl.lines) texts.push(l.en, l.ar) }
    for (const p of [...u.ask, ...u.answer, ...u.reading.gloss]) texts.push(p.en, p.ar)
    texts.push(u.reading.title, u.reading.titleAr, u.reading.text)
  }
  for (const t of texts) {
    assert.ok(t && t.trim(), 'empty text')
    assert.ok(!/[|=]/.test(t), `separator left in: ${t}`)
  }
})

test('the Arabic side is Arabic and the English side is not', () => {
  const ar = /[؀-ۿ]/
  for (const u of VOCAB_BOOK) {
    for (const e of u.vocab) { assert.ok(ar.test(e.ar) && ar.test(e.exAr), e.en); assert.ok(!ar.test(e.en) && !ar.test(e.ex), e.en) }
    for (const gp of u.groups) for (const w of gp.words) { assert.ok(ar.test(w.ar), w.en); assert.ok(!ar.test(w.en), w.en) }
    for (const dl of u.talks) for (const l of dl.lines) { assert.ok(ar.test(l.ar), l.en); assert.ok(!ar.test(l.en), l.en) }
  }
})

test('the new words are new: none repeats its unit’s words in the main book', () => {
  for (const u of VOCAB_BOOK) {
    const main = new Set(EVERYDAY_ENGLISH.find(m => m.n === u.n).words.map(w => w.en.toLowerCase()))
    for (const e of u.vocab) assert.ok(!main.has(e.en.toLowerCase()), `unit ${u.n}: ${e.en}`)
  }
})

test('no word is listed twice in the same unit', () => {
  for (const u of VOCAB_BOOK) {
    const seen = new Set()
    for (const en of [...u.vocab.map(e => e.en), ...u.groups.flatMap(gp => gp.words.map(w => w.en))]) {
      const k = en.toLowerCase()
      assert.ok(!seen.has(k), `unit ${u.n}: ${en} twice`)
      seen.add(k)
    }
  }
})

test('each reading uses its key words', () => {
  for (const u of VOCAB_BOOK) {
    for (const g of u.reading.gloss) assert.match(u.reading.text, new RegExp(`\\b${g.en}\\b`, 'i'), `unit ${u.n}: ${g.en}`)
  }
})
