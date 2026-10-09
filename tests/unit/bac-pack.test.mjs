import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BAC_BODY, buildBacPack, exercisesOf, isOpen, plainAnswer } from '../../src/data/bac/bac-pack.ts'
import { BAC_MOCKS, mockParts, mockTotal } from '../../src/data/bac/bac-mocks.ts'

test('every exercise item has a question and an answer (open tasks have none at all), and a choice answer names one of its options', () => {
  for (const p of BAC_BODY) {
    for (const e of exercisesOf(p.blocks)) {
      assert.ok(e.items.length > 0, `${p.tag}: ${e.title} is empty`)
      const open = isOpen(e)
      for (const it of e.items) {
        assert.ok(it.q.trim() && (open || it.a.trim()), `${p.tag}: ${it.q}`)
        if (it.options) {
          const m = it.a.match(/^([a-d])\) (.+)$/)
          assert.ok(m, `${p.tag}: "${it.a}" should read "b) option"`)
          assert.equal(it.options['abcd'.indexOf(m[1])], m[2], `${p.tag}: ${it.q}`)
        }
      }
    }
  }
})

test('each mock exam is worth 40 points: reading 15, language 15, writing 10', () => {
  assert.equal(BAC_MOCKS.length, 5)
  for (const m of BAC_MOCKS) {
    const r = m.reading, l = m.language
    assert.equal(r.tf.points + r.answer.points + r.words.points + r.reference.points + r.title.points, 15, `exam ${m.n} reading`)
    assert.equal(l.vocab.points + l.grammar.points + l.functions.points, 15, `exam ${m.n} language`)
    assert.equal(m.writing.points, 10)
    assert.equal(mockTotal(m), 40)
    assert.equal(m.text.length, 5, `exam ${m.n}: questions refer to five paragraphs`)
    // One point per item, except the title question (1 point, 1 item).
    for (const part of mockParts(m)) assert.ok(part.items.length <= part.points || part.points === 1, `exam ${m.n}: ${part.title}`)
  }
})

test('mock exam questions only point at paragraphs that exist', () => {
  for (const m of BAC_MOCKS) {
    for (const part of mockParts(m)) {
      for (const [q] of part.items) {
        for (const [, n] of q.matchAll(/§(\d)/g)) assert.ok(Number(n) <= m.text.length, `exam ${m.n}: ${q}`)
      }
    }
  }
})

test('the pack numbers every exercise once and puts every answer in the keys', () => {
  const { pages, exNo, pageNo, exercises } = buildBacPack()
  const all = BAC_BODY.flatMap(p => exercisesOf(p.blocks))
  assert.equal(exercises, all.length)
  assert.deepEqual([...new Set(all.map(e => exNo.get(e)))], all.map((_, i) => i + 1))

  const keyLines = pages.filter(p => p.section === 'key').flatMap(p => p.blocks).flatMap(b => (b.t === 'key' ? b.items : []))
  const keyed = all.filter(e => !isOpen(e))
  assert.ok(keyed.length >= all.length - 2, 'only a few open tasks')
  assert.equal(keyLines.length, keyed.length)
  for (const [i, e] of keyed.entries()) {
    assert.deepEqual(keyLines[i].answers, e.items.map(it => plainAnswer(it.a)))
    assert.match(keyLines[i].label, new RegExp(`^Ex\\. ${exNo.get(e)} · p\\. \\d+$`))
  }

  // Contents first, numbered from 1, in order.
  assert.equal(pages[0].section, 'contents')
  pages.forEach((p, i) => assert.equal(pageNo(p), i + 1))
  assert.ok(pages.length >= 50, `${pages.length} pages`)
})
