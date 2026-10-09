import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EVERYDAY_UNITS, OPENERS, buildEverydayBook, split, sortKey, wordList, EXPRESSIONS_PER_PAGE, LINES_PER_PAGE } from '../../src/data/everyday-book/index.ts'

const AR = /[؀-ۿ]/

test('the book keeps its 19 units, in order', () => {
  assert.deepEqual(EVERYDAY_UNITS.map(u => u.n), Array.from({ length: 19 }, (_, i) => i + 1))
})

test('every unit has its four parts, complete and translated', () => {
  for (const u of EVERYDAY_UNITS) {
    const at = `unit ${u.n}`
    assert.ok(u.vocab.length >= 15, `${at}: ${u.vocab.length} words`)
    for (const [icon, en, ar] of u.vocab) {
      assert.ok(icon && !/[A-Za-z]/.test(icon), `${at}: picture for "${en}"`)
      assert.ok(en && !AR.test(en), `${at}: "${en}"`)
      assert.ok(AR.test(ar), `${at}: Arabic for "${en}"`)
    }
    assert.ok(u.expressions.length >= 10, `${at}: ${u.expressions.length} expressions`)
    for (const [q, a, qAr, aAr] of u.expressions) {
      assert.ok(q && a && AR.test(qAr) && AR.test(aAr), `${at}: ${q} / ${a}`)
    }
    assert.ok(u.talk.length >= 20, `${at}: conversation of ${u.talk.length} lines`)
    for (const line of u.talk) assert.match(line, /^[A-Z][A-Z ]{1,18}: \S/, `${at}: "${line}" names its speaker`)
    assert.ok(u.reading.title && u.reading.body.length >= 4, `${at}: reading`)
    assert.equal(u.yours.length, 3, `${at}: three «Make it yours» tasks`)
    // The Arabic half is printed right to left: English words inside it would scramble the line.
    for (const t of u.yours) assert.ok(!/[A-Za-z]/.test(t.split(' - ')[1] ?? 'x'), `${at}: "${t}"`)
  }
})

test("the first version's wrong labels are gone", () => {
  const all = EVERYDAY_UNITS.flatMap(u => u.vocab.map(([, en, ar]) => `${en}=${ar}`))
  for (const bad of ['tonight=أسود', 'cash=فحص طبي', 'next to=آلة التذاكر', 'bread=سلطة', 'card=تنظيف', 'Get ouf of bed']) {
    assert.ok(!all.some(x => x.startsWith(bad) || x.includes(bad)), bad)
  }
  // the kitchen unit no longer carries the café's lines, the hotel has a real conversation
  assert.ok(!EVERYDAY_UNITS[2].expressions.some(([q]) => q.includes('menu')))
  assert.ok(EVERYDAY_UNITS[16].talk.length >= 20)
})

test('pages: long parts are split evenly, every page is numbered once', () => {
  assert.deepEqual(split(Array.from({ length: 15 }), 12).map(p => p.length), [8, 7])
  assert.deepEqual(split(Array.from({ length: 27 }), 26).map(p => p.length), [14, 13])
  assert.deepEqual(split(Array.from({ length: 10 }), 12).map(p => p.length), [10])
  const { pages, pageNo, stats } = buildEverydayBook()
  assert.equal(pages[0].kind, 'welcome')
  pages.forEach((p, i) => assert.equal(pageNo(p), i + 1))
  for (const u of EVERYDAY_UNITS) {
    const own = pages.filter(p => p.unit === u.n)
    assert.deepEqual(own.slice(0, 2).map(p => p.kind), ['opener', 'vocab'])
    assert.equal(own.at(-1).kind, 'reading')
    assert.equal(own.filter(p => p.kind === 'expressions').length, Math.ceil(u.expressions.length / EXPRESSIONS_PER_PAGE))
    assert.equal(own.filter(p => p.kind === 'talk').length, Math.ceil(u.talk.length / LINES_PER_PAGE))
  }
  // the contents page points at each unit's opener, the progress page and the word list
  const contents = pages.find(p => p.kind === 'contents')
  const grid = contents.blocks.find(b => b.t === 'grid')
  const rows = grid.rows.slice(1)
  for (const row of rows.filter(r => r.cells[0])) {
    const n = Number(row.cells[0])
    assert.equal(pages[Number(row.cells[3]) - 1].unit, n)
    assert.equal(pages[Number(row.cells[3]) - 1].kind, 'opener')
  }
  assert.deepEqual(rows.filter(r => !r.cells[0]).map(r => pages[Number(r.cells[3]) - 1].kind), ['progress', 'wordlist'])
  assert.equal(pages.at(-1).kind, 'wordlist')
  assert.ok(stats.words > 250 && stats.expressions > 250, JSON.stringify(stats))
  assert.equal(stats.words, wordList().length)   // the cover's «N+ words» is what the word list shows
})

test('every unit opens with three goals and a tip, in both languages', () => {
  for (const u of EVERYDAY_UNITS) {
    const o = OPENERS[u.n]
    assert.ok(o, `unit ${u.n} has an opener`)
    assert.equal(o.canDo.length, 3, `unit ${u.n}`)
    for (const [en, ar] of o.canDo) assert.ok(en && !AR.test(en) && AR.test(ar), `unit ${u.n}: ${en}`)
    assert.ok(o.tip.en && !AR.test(o.tip.en) && AR.test(o.tip.ar), `unit ${u.n}: tip`)
    // An Arabic line ending on an English word prints its full stop on the wrong side.
    assert.match(o.tip.ar, /[؀-ۿ][^A-Za-z؀-ۿ]*$/, `unit ${u.n}: the tip's Arabic ends in Arabic`)
  }
})

test('the word list holds every word once, A to Z, with the units it is taught in', () => {
  const list = wordList()
  const all = EVERYDAY_UNITS.flatMap(u => u.vocab.map(([, en]) => en.toLowerCase()))
  assert.equal(list.length, new Set(all).size)
  const keys = list.map(w => sortKey(w.en))
  assert.deepEqual(keys, [...keys].sort((a, b) => a.localeCompare(b)))
  for (const w of list) {
    for (const n of w.units) assert.ok(EVERYDAY_UNITS[n - 1].vocab.some(([, en]) => en.toLowerCase() === w.en.toLowerCase()), `${w.en} in unit ${n}`)
  }
  const { pages } = buildEverydayBook()
  assert.equal(pages.filter(p => p.kind === 'wordlist').flatMap(p => p.words).length, list.length)
})
