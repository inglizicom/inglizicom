import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LEVEL1_LESSONS } from '../../src/data/level1-book.ts'
import { LEVEL1_V2_LESSONS } from '../../src/data/level1-book-v2.ts'

/** Every block, rows and talk asides included. */
function* blocks(list) {
  for (const b of list) {
    yield b
    if (b.t === 'row') for (const col of b.blocks) yield* blocks(col)
    if (b.t === 'talk' && b.aside) yield* blocks(b.aside)
  }
}

test('both editions follow the same 19-lesson path', () => {
  assert.equal(LEVEL1_LESSONS.length, 19)
  assert.equal(LEVEL1_V2_LESSONS.length, 19)
  assert.deepEqual(LEVEL1_V2_LESSONS.map(l => l.n), LEVEL1_LESSONS.map(l => l.n))
})

test('the second edition is new: no conversation line is copied from the first', () => {
  const old = new Set(LEVEL1_LESSONS.flatMap(l => [...blocks(l.blocks)]).filter(b => b.t === 'talk').flatMap(b => b.lines))
  for (const l of LEVEL1_V2_LESSONS) {
    for (const b of blocks(l.blocks)) if (b.t === 'talk') for (const line of b.lines) assert.ok(!old.has(line), `lesson ${l.n}: ${line}`)
  }
})

test('every conversation line names its speaker, and nothing is empty', () => {
  for (const l of LEVEL1_V2_LESSONS) {
    const talks = [...blocks(l.blocks)].filter(b => b.t === 'talk')
    // Like the first edition, lessons 5 (family tree) and 7 (reading) have none.
    if (l.n !== 5 && l.n !== 7) assert.ok(talks.length >= 1, `lesson ${l.n} has a conversation`)
    for (const b of talks) for (const line of b.lines) assert.match(line, /^[A-Z][\w .']{0,18}: \S/, `lesson ${l.n}: ${line}`)
    for (const b of blocks(l.blocks)) {
      if (b.t === 'cards') for (const [icon, en, ar] of b.items) assert.ok(icon && en && ar, `lesson ${l.n}: card ${en}`)
      if (b.t === 'pairs') for (const [en] of b.items) assert.ok(en, `lesson ${l.n}: pair`)
    }
  }
})

test('the corrections hold: no insulting words, no "I have 25 years"', () => {
  const text = JSON.stringify(LEVEL1_V2_LESSONS)
  for (const bad of ['Stupid', 'Ugly', '- Fat', 'I have 25 years old', 'Nibling']) {
    const shown = text.split(bad).length - 1
    // "ugly / stupid / fat" may appear only in the tip that says to avoid them.
    assert.ok(shown === 0, `"${bad}" appears ${shown}×`)
  }
})
