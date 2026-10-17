import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STOPS } from '../../src/data/viiza-book/index.ts'
import { MISSIONS, REVIEWS, WORK_STOPS, buildViizaWorkbook, gapLetters, reviewAnswers, workAnswers } from '../../src/data/viiza-workbook/index.ts'

/** VIIZA ENGLISH, Workbook (src/data/viiza-workbook): built from the Student's Book, two pages a stop. */

const AR = /[؀-ۿ]/

test('every stop has its six exercises, full and answerable', () => {
  assert.equal(WORK_STOPS.length, 34)
  for (const w of WORK_STOPS) {
    const at = `stop ${w.stop.n}`
    assert.ok(w.missing.length >= 6, `${at}: ${w.missing.length} missing-letter words`)
    for (const m of w.missing) assert.ok(m.letters.includes('_') && m.letters.length === m.word.length && AR.test(m.ar), `${at}: ${m.word}`)
    assert.equal(w.sayHear.length, 8, `${at}: say or hear`)
    assert.ok(w.sayHear.some(x => x.who === 'say') && w.sayHear.some(x => x.who === 'hear'), at)
    assert.ok(w.talk.length >= 6, `${at}: ${w.talk.length} conversation gaps`)
    for (const t of w.talk) assert.ok(w.stop.talk.lines.some(([, en]) => en === t.before + t.word + t.after), `${at}: the gap rebuilds the line`)
    assert.deepEqual([...w.bank].sort(), w.talk.map(t => t.word).sort(), `${at}: the box holds every answer`)
    assert.ok(w.ordered.length >= 2, `${at}: words in order`)
    for (const o of w.ordered) assert.equal([...o.words].sort().join(' '), o.sentence.split(' ').sort().join(' '), `${at}: same words`)
    assert.equal(w.translate.length, 4, `${at}: translate`)
    assert.ok(MISSIONS[w.stop.n] && AR.test(MISSIONS[w.stop.n].ar) && MISSIONS[w.stop.n].model, `${at}: mission`)
    assert.equal(workAnswers(w).length, 6, `${at}: six answer lines`)
  }
})

test('gapped words keep their first letter and hide every second one', () => {
  assert.equal(gapLetters('passport'), 'p_s_p_r_')
  assert.equal(gapLetters('date of birth'), 'd_t_ o_ b_r_h')
})

test('reviews: one right answer per question, no other choice where the same words are said', () => {
  assert.equal(REVIEWS.length, 6)
  for (const r of REVIEWS) {
    assert.equal(r.where.length, 8, `part ${r.part}`)
    for (const q of r.where) {
      assert.equal(new Set(q.options).size, 3, `part ${r.part}: three different choices for "${q.heard}"`)
      const saidIn = q.options.filter(o => {
        const s = STOPS.find(x => x.titleEn === o)
        return [...s.say, ...s.hear].some(([en]) => en === q.heard)
      })
      assert.deepEqual(saidIn, [q.options[q.right]], `part ${r.part}: "${q.heard}"`)
    }
    assert.ok(r.fix.length >= 4, `part ${r.part}: mistakes to fix`)
    assert.equal(reviewAnswers(r).length, 2)
  }
})

test('the book: how-to, two pages a stop, a review a part, every answer in the key', () => {
  const { pages } = buildViizaWorkbook()
  assert.equal(pages[0].kind, 'howto')
  for (const s of STOPS) assert.equal(pages.filter(p => 'stop' in p && p.stop === s.n).length, 2, `stop ${s.n}`)
  assert.equal(pages.filter(p => p.kind === 'review').length, 6)
  const keys = pages.filter(p => p.kind === 'key')
  assert.deepEqual(keys.flatMap(k => k.stops), STOPS.map(s => s.n))
  assert.deepEqual(keys.flatMap(k => k.parts), [1, 2, 3, 4, 5, 6])
})
