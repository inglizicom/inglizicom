import { test } from 'node:test'
import assert from 'node:assert/strict'
import { L2_UNITS, mixed } from '../../src/data/level2-book/index.ts'
import { WORK_UNITS, buildLevel2Workbook } from '../../src/data/level2-workbook/index.ts'

const AR = /[؀-ۿ]/

test('mixed: the same every time, nothing in its place, never simply backwards', () => {
  for (let n = 3; n <= 12; n++) {
    const list = Array.from({ length: n }, (_, i) => `line ${i + 1}`)
    const out = mixed(list)
    assert.deepEqual(mixed(list), out)
    assert.deepEqual([...out].sort(), [...list].sort())
    assert.ok(out.every((x, i) => x !== list[i]), `${n}: ${out}`)
    assert.notDeepEqual(out, [...list].reverse())
  }
})

test('six pages a unit, in the order of the study week; a test after each finished module', () => {
  const { pages } = buildLevel2Workbook()
  for (const w of WORK_UNITS) {
    assert.ok(L2_UNITS.some(u => u.n === w.n), `unit ${w.n} is in the textbook`)
    assert.deepEqual(pages.filter(p => p.unit === w.n).map(p => p.kind), ['vocab', 'expressions', 'grammar', 'grammar', 'writing', 'writing'], `unit ${w.n}`)
  }
  const test1 = pages.findIndex(p => p.kind === 'review' && p.module === 1)
  assert.ok(test1 > pages.findLastIndex(p => p.unit === 4))
})

test('exercises: every item has its answer; a word box holds every answer; matching letters point at the right answer', () => {
  const { exNo } = buildLevel2Workbook()
  for (const [b, n] of exNo) {
    const at = `Ex. ${n} ${b.title}`
    assert.ok(b.items.length >= 5, at)
    for (const it of b.items) assert.ok(it.q && it.a, `${at}: ${it.q}`)
    if (b.lettered) {
      assert.equal(new Set(b.bank).size, b.bank.length, `${at}: one answer per letter`)
      assert.deepEqual(b.items.map(it => it.a).sort(), 'abcdefghijkl'.slice(0, b.items.length).split('').sort(), at)
    } else if (b.bank) {
      assert.deepEqual([...b.bank].sort(), b.items.map(it => it.a).sort(), at)
      for (const it of b.items) assert.ok(it.q.includes('___'), `${at}: ${it.q}`)
    }
    for (const it of b.items.filter(it => it.options)) assert.equal(it.options['abc'.indexOf(it.a[0])], it.a.slice(3), it.q)
  }
})

test('the words and expressions pages come from the unit itself', () => {
  const { pages } = buildLevel2Workbook()
  for (const u of L2_UNITS.filter(x => WORK_UNITS.some(w => w.n === x.n))) {
    const words = u.vocab.groups.flatMap(g => g.words)
    const blocks = pages.filter(p => p.unit === u.n).flatMap(p => p.blocks)
    const [meanings, gaps] = blocks.filter(b => b.t === 'exercise' && b.bank).slice(0, 2)
    for (const it of meanings.items) assert.ok(words.some(w => `${w[0]} ___` === it.q), `unit ${u.n}: ${it.q}`)
    for (const it of gaps.items) {
      const w = words.find(x => x[0] === it.a)
      assert.equal(it.q.replace('___', w[0]).toLowerCase(), w[2].toLowerCase(), `unit ${u.n}: ${it.q}`)
    }
    const order = blocks.find(b => b.t === 'exercise' && b.title === 'Put the conversation in order')
    const talk = u.talk.map(l => l.replace(/^[^:]+:\s/, ''))
    const said = order.items.map(it => it.q.replace(/^___ [^:]+:\s/, ''))
    const first = talk.indexOf(said[order.items.findIndex(it => it.a === '1')])
    for (const it of order.items) assert.equal(talk.indexOf(said[order.items.indexOf(it)]), first + Number(it.a) - 1, `unit ${u.n}: ${it.q}`)
  }
})

test('every Arabic line ends in Arabic (or its full stop prints on the wrong side)', () => {
  const endsArabic = s => /[؀-ۿ][^A-Za-z؀-ۿ]*$/.test(s.trim())
  const arabicOf = s => {
    if (!AR.test(s)) return null
    if (AR.test(s.trim().charAt(0))) return s
    const m = s.match(/\s-\s([؀-ۿ].*)$/)
    return m ? m[1] : null
  }
  const bad = []
  const visit = v => {
    if (typeof v === 'string') { const ar = arabicOf(v); if (ar && !endsArabic(ar)) bad.push(v) }
    else if (Array.isArray(v)) v.forEach(visit)
    else if (v && typeof v === 'object' && !(v instanceof RegExp)) Object.values(v).forEach(visit)
  }
  const { pages } = buildLevel2Workbook()
  pages.filter(p => p.kind !== 'contents').forEach(p => visit(p.blocks))
  assert.deepEqual(bad, [])
})

test('contents point at each unit\'s first page; the key answers every exercise', () => {
  const { pages, pageNo, exNo } = buildLevel2Workbook()
  pages.forEach((p, i) => assert.equal(pageNo(p), i + 1))
  const grid = pages.find(p => p.kind === 'contents').blocks.find(b => b.t === 'grid')
  for (const row of grid.rows.filter(r => /^\d\d$/.test(r.cells[0]))) {
    const n = Number(row.cells[0])
    if (!WORK_UNITS.some(w => w.n === n)) { assert.equal(row.cells[3], '—'); continue }
    const p = pages[Number(row.cells[3]) - 1]
    assert.equal(p.unit, n)
    assert.equal(p.kind, 'vocab')
  }
  const key = pages.filter(p => p.kind === 'key').flatMap(p => p.blocks.filter(b => b.t === 'key').flatMap(b => b.items))
  assert.equal(key.length, exNo.size)
  for (const [b, n] of exNo) assert.deepEqual(key.find(k => k.label.startsWith(`Ex. ${n} `)).answers, b.items.map(it => it.a))
})
