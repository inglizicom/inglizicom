import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INDEX, MODULES, L2_UNITS, buildLevel2Book, focusRegex, keyLines } from '../../src/data/level2-book/index.ts'

const AR = /[؀-ۿ]/

test('the index: twenty units in five modules of four', () => {
  assert.deepEqual(INDEX.map(u => u.n), Array.from({ length: 20 }, (_, i) => i + 1))
  for (const m of MODULES) assert.equal(INDEX.filter(u => u.module === m.n).length, 4, `module ${m.n}`)
  for (const u of INDEX) assert.ok(u.titleEn && AR.test(u.titleAr) && u.grammar && u.writing, `unit ${u.n}`)
})

test('every written unit uses its grammar in context: expressions, conversation, writing', () => {
  for (const u of L2_UNITS) {
    const at = `unit ${u.n}`
    const idx = INDEX.find(x => x.n === u.n)
    assert.equal(idx.titleEn, u.titleEn, at)
    assert.equal(u.expressions.length, 12, at)
    for (const [q, a, qAr, aAr] of u.expressions) assert.ok(q && a && AR.test(qAr) && AR.test(aAr), `${at}: ${q}`)
    assert.ok(u.notice.length >= 3 && u.tip.length >= 2 && u.yourTurn.length === 3 && u.findIt.length === 3, at)
    assert.ok(u.talk.length >= 24 && u.talk.length <= 38, `${at}: ${u.talk.length} lines on one page`)
    for (const l of u.talk) assert.match(l, /^[A-Z][A-Z ]{1,18}: \S/, `${at}: "${l}"`)
    // every grammar phrase is really in the conversation, and many lines show it
    const talk = u.talk.join('\n')
    for (const f of u.focus) assert.ok(talk.includes(f), `${at}: focus "${f}" is in the conversation`)
    const marked = u.talk.filter(l => new RegExp(focusRegex(u.focus).source).test(l)).length
    assert.ok(marked >= u.talk.length / 3, `${at}: only ${marked} lines show the grammar`)
    assert.ok(keyLines(u).length >= 1, `${at}: a key sentence`)
    // the grammar lesson: two or three pages, with common mistakes and practice
    assert.ok(u.grammar.length >= 2 && u.grammar.length <= 3, at)
    const blocks = u.grammar.flat()
    assert.ok(blocks.some(b => b.t === 'mistakes'), `${at}: common mistakes`)
    assert.ok(blocks.filter(b => b.t === 'exercise').length >= 2, `${at}: practice`)
    // writing: the model uses the grammar, the template leaves room for the student
    const w = u.writing
    for (const f of w.focus) assert.ok(w.model.body.includes(f), `${at}: writing focus "${f}" is in the model`)
    assert.ok((w.template.match(/___/g) ?? []).length >= 8, `${at}: template blanks`)
    assert.ok(w.include.length >= 3 && w.language.length >= 3 && w.check.length >= 3, at)
    const words = w.model.body.split(/\s+/).length
    assert.ok(words >= 70 && words <= 140, `${at}: the model is ${words} words`)
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
  const { pages } = buildLevel2Book()
  pages.filter(p => p.kind !== 'contents').forEach(p => visit(p.blocks))
  assert.deepEqual(bad, [])
})

test('pages: contents point at the openers, the key answers every exercise', () => {
  const { pages, pageNo, exNo } = buildLevel2Book()
  pages.forEach((p, i) => assert.equal(pageNo(p), i + 1))
  const grid = pages.find(p => p.kind === 'contents').blocks.find(b => b.t === 'grid')
  for (const row of grid.rows.filter(r => /^\d\d$/.test(r.cells[0]))) {
    const n = Number(row.cells[0])
    if (!L2_UNITS.some(u => u.n === n)) { assert.equal(row.cells[4], '—'); continue }
    const p = pages[Number(row.cells[4]) - 1]
    assert.equal(p.unit, n)
    assert.equal(p.kind, 'opener')
  }
  const key = pages.filter(p => p.kind === 'key').flatMap(p => p.blocks.filter(b => b.t === 'key').flatMap(b => b.items))
  assert.equal(key.length, exNo.size)
  for (const [b, n] of exNo) {
    const row = key.find(k => k.label.startsWith(`Ex. ${n} `))
    assert.deepEqual(row.answers, b.items.map(it => it.a))
    for (const it of b.items.filter(it => it.options)) assert.equal(it.options['abc'.indexOf(it.a[0])], it.a.slice(3), it.q)
  }
  // a module's review comes after its last unit
  const review1 = pages.findIndex(p => p.kind === 'review' && p.module === 1)
  assert.ok(review1 > pages.findIndex(p => p.unit === 4 && p.kind === 'writing'))
})
