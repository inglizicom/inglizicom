import { test } from 'node:test'
import assert from 'node:assert/strict'
import { numberExercises, BAC_BODY } from '../../src/data/bac/bac-pack.ts'
import {
  BAC_UNITS, unitExercises, unitText, sentences, checkItem, modelResponse, matches, keywordScore, freePass, unitScore,
  freshState, checkExercise, exercisePoints, bacReports, summarizeBac,
} from '../../src/lib/bac-practice.ts'

const exNo = numberExercises(BAC_BODY)
const all = BAC_UNITS.flatMap(u => unitExercises(u, exNo).map(e => ({ u, e })))

test('every page becomes a unit; a mock exam\'s two pages make one', () => {
  assert.equal(BAC_UNITS.length, BAC_BODY.length - 5)
  assert.equal(BAC_UNITS.filter(u => u.mock).length, 5)
  assert.equal(new Set(BAC_UNITS.map(u => u.id)).size, BAC_UNITS.length)
})

test('the model answer of every item is marked right', () => {
  for (const { u, e } of all) {
    const text = unitText(u)
    e.items.forEach((it, i) => {
      assert.ok(checkItem(it, modelResponse(it, text), text), `${u.tag} · ${e.title} · ${i + 1}: ${it.q} → ${it.a}`)
    })
  }
})

test('items get the interaction their shape calls for', () => {
  const kinds = new Map()
  for (const { e } of all) for (const it of e.items) kinds.set(it.kind, (kinds.get(it.kind) ?? 0) + 1)
  for (const k of ['choice', 'tf', 'find', 'bank', 'gap', 'rewrite', 'free', 'open']) assert.ok(kinds.get(k) > 0, `no ${k} items`)
  for (const { u, e } of all) for (const it of e.items) {
    if (it.kind === 'choice') {
      assert.ok(it.options.length >= 2, `${u.tag}: ${it.q}`)
      assert.equal(it.options.filter(o => o === it.correct).length, 1, `${u.tag}: ${it.q} has its answer once among ${it.options}`)
    }
    if (it.kind === 'bank') assert.ok(e.bank.some(w => w.toLowerCase() === it.blanks[0].toLowerCase()), `${u.tag}: "${it.blanks[0]}" is in the bank`)
    if (it.kind === 'gap' || it.kind === 'bank') assert.equal(it.blanks.length, it.q.split('___').length - 1, `${u.tag}: ${it.q}`)
  }
})

test('reading items point at the text: proving sentences and words exist where the question says', () => {
  for (const { u, e } of all) {
    const text = unitText(u)
    for (const it of e.items) {
      if (it.kind === 'tf') assert.equal(sentences(text).filter(s => s.text.toLowerCase().includes(it.quote.toLowerCase().replace(/[“”]/g, '"'))).length >= 1, true, `${u.tag}: "${it.quote}"`)
      if (it.kind === 'find') {
        const words = text[it.para - 1].toLowerCase().match(/[a-z]+/g)
        assert.ok(words.includes(it.a.toLowerCase()), `${u.tag}: "${it.a}" in §${it.para}`)
      }
    }
  }
})

test('typed answers are checked tolerantly', () => {
  assert.ok(matches("Wouldn't have missed", 'would not have missed'))
  assert.ok(matches('he would not have created', "he wouldn't have created"))
  assert.ok(matches('She said she was tired', 'She said (that) she was tired.'))
  assert.ok(matches('She said that she was tired.', 'She said (that) she was tired.'))
  assert.ok(matches('is starting', 'is going to start / is starting'))
  assert.ok(matches('He wishes he was taller.', 'He wishes he [were / was] taller.'))
  assert.ok(!matches('He wishes he were', 'He wishes he [were / was] taller.'))
  assert.ok(matches('The phone that I bought yesterday is expensive', 'The phone (which / that) I bought yesterday is expensive.'))
  assert.ok(matches('Despite the rain, we went out.', 'Although it was raining, … / Despite the rain, …'))
  assert.ok(!matches('travel', 'travelled'))
  assert.ok(!matches('', 'anything'))
  // a rewrite may keep the rest of the sentence
  assert.ok(matches('This time tomorrow, I will be sitting in the exam room.', 'I will be sitting in the exam room.', true))
  assert.ok(!matches('I will sit in the exam room.', 'I will be sitting in the exam room.', true))
})

test('written answers are scored on the model\'s key words', () => {
  const a = 'They turn sea water into drinking water.'
  assert.ok(freePass('They change sea water to water we can drink', a))
  assert.ok(!freePass('I do not know', a))
  assert.ok(keywordScore('higher salaries and modern equipment', 'Any two: higher salaries, modern equipment, better career opportunities.') >= 0.3)
})

test('the first check grades; a later fix shows as fixed and earns no point', () => {
  const u = BAC_UNITS.find(x => x.id === 'grammar-01')
  const [ex] = unitExercises(u, exNo)
  let s = freshState(ex)
  s.responses = ex.items.map((it, i) => (i === 0 ? ['knew'] : modelResponse(it, [])))
  s = checkExercise(ex, s, [])
  assert.equal(s.marks[0], 'wrong')
  assert.ok(s.marks.slice(1).every(m => m === 'ok'))
  assert.equal(exercisePoints(ex, s), ex.items.length - 1)
  s.responses[0] = ['have known']
  s = checkExercise(ex, s, [])
  assert.equal(s.marks[0], 'fixed')
  assert.equal(exercisePoints(ex, s), ex.items.length - 1)
  assert.deepEqual(s.tries.slice(0, 2), [2, 1])
})

test('results reported to the CRM read back as the same scores, the latest row winning', () => {
  const g1 = BAC_UNITS.find(u => u.id === 'grammar-01')
  const [ex] = unitExercises(g1, exNo)
  let s = freshState(ex)
  s.responses = ex.items.map((it, i) => (i === 0 ? ['knew'] : modelResponse(it, [])))
  s = checkExercise(ex, s, [])
  const mock = BAC_UNITS.find(u => u.id === 'mock-exam-3')
  const mexs = unitExercises(mock, exNo)
  const mst = {
    ex: Object.fromEntries(mexs.map(e => [e.key, { responses: [], marks: e.items.map((_, i) => (i === 0 ? 'wrong' : 'ok')), tries: [], checked: true, revealed: false }])),
    writing: { topic: 0, text: 'x', checklist: [true, true, true, false, false] },
  }
  const progress = { 'grammar-01': { ex: { [ex.key]: s } }, 'mock-exam-3': mst, start: { ex: {}, read: true } }
  const reports = bacReports(progress)
  assert.ok(reports.some(r => r.event === 'bac_read' && r.id === 'start'))
  const g = reports.find(r => r.id === ex.key)
  assert.match(g.title, new RegExp(`^Grammar 01 · Exercise \\d+ · ${ex.items.length - 1}/${ex.items.length}$`))
  const m = reports.find(r => r.event === 'bac_mock')
  // 8 parts, one item wrong in each: 30 - 8 = 22 auto points, + 6 writing = 28 → 14/20
  assert.equal(m.title, 'Mock exam 3 · R 10/15 · L 12/15 · W 6/10 · 14/20')

  const rows = reports.map((r, i) => ({ event_type: r.event, entity_id: r.id, entity_title: r.title, created_at: `2026-10-0${i % 9 + 1}T10:00:00Z` }))
  // an older, worse result for the same exercise is ignored
  rows.push({ event_type: 'bac_exercise', entity_id: ex.key, entity_title: 'Grammar 01 · Exercise 1 · 0/8', created_at: '2026-09-01T10:00:00Z' })
  const sum = summarizeBac(rows)
  const gr = sum.units.find(u => u.unit.id === 'grammar-01')
  assert.deepEqual([gr.points, gr.max, gr.done], [ex.items.length - 1, ex.items.length, true])
  assert.equal(sum.mocks.find(x => x.unit.id === 'mock-exam-3').mark, 14)
  assert.ok(sum.units.find(u => u.unit.id === 'start').done)
  assert.equal(sum.done, 3)
})

test('a mock exam is scored out of 30 automatic points (writing is apart)', () => {
  for (const u of BAC_UNITS.filter(x => x.mock)) {
    const exs = unitExercises(u, exNo)
    const s = unitScore(exs, undefined)
    assert.equal(Math.round(s.max), 30, u.tag)
    // everything right first time → full marks
    const st = { ex: Object.fromEntries(exs.map(e => [e.key, { responses: [], marks: e.items.map(() => 'ok'), checked: true, revealed: false }])) }
    assert.equal(Math.round(unitScore(exs, st).points), 30)
    assert.ok(unitScore(exs, st).done)
  }
})
