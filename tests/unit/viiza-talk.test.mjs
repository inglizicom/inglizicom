import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STOPS } from '../../src/data/viiza-book/index.ts'
import { TALK_STOPS, buildTalkBook } from '../../src/data/viiza-talk/index.ts'

/** VIIZA ENGLISH, Words & Conversations (src/data/viiza-talk): twelve new words and four conversations a stop. */

const AR = /[؀-ۿ]/

test('34 stops, in the Student\'s Book order', () => {
  assert.deepEqual(TALK_STOPS.map(t => t.n), STOPS.map(s => s.n))
})

test('every stop: twelve new words, none of the Student\'s Book\'s, translated', () => {
  for (const t of TALK_STOPS) {
    assert.equal(t.words.length, 12, `stop ${t.n}`)
    const book = new Set(STOPS[t.n - 1].words.map(([en]) => en.toLowerCase()))
    for (const [en, ar] of t.words) {
      assert.ok(en && !AR.test(en) && AR.test(ar), `stop ${t.n}: "${en}"`)
      assert.ok(!book.has(en.toLowerCase()), `stop ${t.n}: "${en}" is already a key word of the Student's Book`)
    }
    assert.equal(new Set(t.words.map(([en]) => en)).size, 12, `stop ${t.n}: a word twice`)
  }
})

test('every stop: four different conversations, short enough for their page', () => {
  for (const t of TALK_STOPS) {
    assert.equal(t.talks.length, 4, `stop ${t.n}`)
    assert.equal(new Set(t.talks.map(c => c.title[0])).size, 4, `stop ${t.n}: two conversations with one title`)
    for (const c of t.talks) {
      const at = `stop ${t.n} «${c.title[0]}»`
      assert.ok(AR.test(c.title[1]) && c.place, at)
      assert.ok(c.lines.length >= 8 && c.lines.length <= 10, `${at}: ${c.lines.length} lines`)
      const cast = Object.keys(c.cast)
      assert.ok(cast.length >= 2, `${at}: two speakers at least`)
      for (const [who, en, ar] of c.lines) {
        assert.ok(cast.includes(who), `${at}: "${who}" is not in the cast`)
        assert.ok(en.length <= 110 && AR.test(ar), `${at}: "${en}"`)
      }
    }
    assert.ok(AR.test(t.yourTurn[1]) && t.yourTurn[0], `stop ${t.n}: your turn`)
  }
})

test('every stop travels: its conversations are set in at least two regions', () => {
  for (const t of TALK_STOPS) assert.ok(new Set(t.talks.map(c => c.region)).size >= 2, `stop ${t.n}`)
})

test('the book: how-to, then two pages a stop', () => {
  const { pages } = buildTalkBook()
  assert.equal(pages[0].kind, 'howto')
  assert.equal(pages.length, 1 + 34 * 2)
})
