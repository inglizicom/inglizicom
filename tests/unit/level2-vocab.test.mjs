import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LEVEL2_VOCAB } from '../../src/data/level2-vocab/index.ts'
import { buildLevel2VocabBook } from '../../src/data/level2-vocab/book.ts'
import { INDEX, L2_UNITS } from '../../src/data/level2-book/index.ts'

const AR = /[؀-ۿ]/

test('the Level 2 vocabulary book: every unit, in order, every part full', () => {
  assert.deepEqual(LEVEL2_VOCAB.map(u => u.n), INDEX.map(u => u.n))
  for (const u of LEVEL2_VOCAB) {
    const at = `unit ${u.n}`
    assert.equal(u.vocab.length, 10, `${at}: ten words`)
    for (const e of u.vocab) assert.ok(e.icon && e.en && AR.test(e.ar) && /^[A-Z].*[.!?]$/.test(e.ex) && !AR.test(e.ex) && AR.test(e.exAr), `${at}: ${e.en}`)
    assert.equal(u.groups.length, 3, at)
    for (const gp of u.groups) {
      assert.equal(gp.words.length, 10, `${at}: ${gp.en}`)
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
    assert.ok(words >= 90 && words <= 135, `${at}: the reading is ${words} words`)
    assert.equal(u.reading.tf.length, 3, at)
    assert.equal(u.reading.qs.length, 2, at)
    // word power: ten collocations, four families, five gaps that name their family
    const p = u.power
    assert.equal(p.together.length, 10, at)
    for (const w of p.together) assert.ok(w.en && !AR.test(w.en) && AR.test(w.ar), `${at}: «${w.en}»`)
    assert.equal(p.families.length, 4, at)
    for (const f of p.families) assert.equal(f.length, 3, `${at}: ${f}`)
    assert.equal(p.use.length, 5, at)
    for (const [q, a] of p.use) assert.ok(q.includes('___') && /\([a-z]+\)$/.test(q) && a, `${at}: ${q}`)
  }
})

test('no word twice in a unit, and none the course book already teaches in that unit', () => {
  for (const u of LEVEL2_VOCAB) {
    const course = new Set((L2_UNITS.find(x => x.n === u.n)?.vocab.groups.flatMap(g => g.words.map(w => w[0].toLowerCase())) ?? []))
    const seen = new Set()
    for (const en of [...u.vocab.map(e => e.en), ...u.groups.flatMap(g => g.words.map(w => w.en)), ...u.power.together.map(w => w.en)]) {
      const k = en.toLowerCase()
      assert.ok(!seen.has(k), `unit ${u.n}: «${en}» twice`)
      assert.ok(!course.has(k), `unit ${u.n}: «${en}» is already in the course book`)
      seen.add(k)
    }
  }
})

test('pages: six a unit, the key answers every exercise, every Arabic line ends in Arabic', () => {
  const { pages, pageNo, exNo } = buildLevel2VocabBook()
  pages.forEach((p, i) => assert.equal(pageNo(p), i + 1))
  for (const u of LEVEL2_VOCAB) assert.deepEqual(pages.filter(p => p.unit === u.n).map(p => p.kind), ['words', 'groups', 'power', 'practice', 'talk', 'read'], `unit ${u.n}`)
  const grid = pages.find(p => p.kind === 'contents').blocks.find(b => b.t === 'grid')
  for (const row of grid.rows.filter(r => /^\d\d$/.test(r.cells[0]))) {
    const p = pages[Number(row.cells[3]) - 1]
    assert.equal(p.unit, Number(row.cells[0]))
    assert.equal(p.kind, 'words')
  }
  const key = pages.filter(p => p.kind === 'key').flatMap(p => p.blocks.filter(b => b.t === 'key').flatMap(b => b.items))
  assert.equal(key.length, exNo.size)
  for (const [b, n] of exNo) {
    assert.ok(b.items.length >= 2, `Ex. ${n} ${b.title}`)
    assert.deepEqual(key.find(k => k.label.startsWith(`Ex. ${n} `)).answers, b.items.map(it => it.a))
  }

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
  pages.filter(p => p.kind !== 'contents').forEach(p => visit(p.blocks))
  assert.deepEqual(bad, [])
})

test('every Level 2 unit has its audio: course book and vocabulary book, all in English', async () => {
  const { l2BookSections, l2VocabSections } = await import('../../src/data/level2-audio/index.ts')
  for (const u of LEVEL2_VOCAB) {
    for (const s of [...l2BookSections(u.n), ...l2VocabSections(u.n)]) {
      assert.ok(s.clips.length, `unit ${u.n}: ${s.title}`)
      for (const c of s.clips) assert.ok(c.en && !AR.test(c.en) && c.voice, `unit ${u.n}: «${c.en}»`)
    }
  }
})
