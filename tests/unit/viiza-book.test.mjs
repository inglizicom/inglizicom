import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { DICTIONARY, MY_TRIP, PARTS, STOPS, SURVIVAL, answersOf, buildViizaBook, checkAnswers, mixed, seedOf } from '../../src/data/viiza-book/index.ts'
import { TALK_STOPS } from '../../src/data/viiza-talk/index.ts'

/**
 * VIIZA ENGLISH, the travel guide (src/data/viiza-book). Every stop prints on
 * six fixed A4 pages, so the counts and lengths below are what keeps a page
 * from spilling; the e2e test measures the pages themselves.
 */

const AR = /[؀-ۿ]/
const { icons } = createRequire(import.meta.url)('lucide-react')

test('34 stops, numbered in order, each in one of the six parts', () => {
  assert.deepEqual(STOPS.map(s => s.n), Array.from({ length: 34 }, (_, i) => i + 1))
  for (const s of STOPS) assert.ok(PARTS.some(p => p.n === s.part), `stop ${s.n}: part ${s.part}`)
  // the journey only moves forward
  for (let i = 1; i < STOPS.length; i++) assert.ok(STOPS[i].part >= STOPS[i - 1].part, `stop ${STOPS[i].n} goes back a part`)
})

test('every stop is complete, translated, and short enough for its pages', () => {
  for (const s of STOPS) {
    const at = `stop ${s.n}`
    assert.ok(AR.test(s.titleAr) && s.titleEn && !AR.test(s.titleEn), `${at}: titles`)
    assert.ok(AR.test(s.intro) && s.intro.length <= 260, `${at}: intro (${s.intro.length})`)
    assert.equal(s.canDo.length, 3, `${at}: three goals`)
    assert.ok(s.know.length >= 3 && s.know.length <= 5, `${at}: ${s.know.length} facts`)
    for (const k of s.know) assert.ok(AR.test(k.text) && k.text.length <= 230, `${at}: fact too long (${k.text.length}): ${k.text.slice(0, 40)}`)
    assert.equal(s.words.length, 12, `${at}: twelve key words`)
    for (const [en, ar] of s.words) assert.ok(en.length <= 30 && AR.test(ar), `${at}: word "${en}"`)
    assert.ok(s.say.length >= 8 && s.say.length <= 9, `${at}: ${s.say.length} things to say`)
    assert.ok(s.hear.length >= 8 && s.hear.length <= 9, `${at}: ${s.hear.length} things to hear`)
    for (const [en, ar] of [...s.say, ...s.hear]) {
      assert.ok(en.length <= 52, `${at}: phrase too long (${en.length}): ${en}`)
      assert.ok(AR.test(ar) && ar.length <= 50, `${at}: Arabic for "${en}" (${ar.length})`)
    }
    assert.ok(s.talk.lines.length >= 12 && s.talk.lines.length <= 14, `${at}: ${s.talk.lines.length} lines`)
    const cast = Object.keys(s.talk.cast)
    for (const [who, en, ar] of s.talk.lines) {
      assert.ok(cast.includes(who), `${at}: "${who}" is not in the cast`)
      assert.ok(en.length <= 90 && AR.test(ar), `${at}: line "${en}"`)
    }
    assert.equal(s.watch.length, 3, `${at}: three mistakes`)
    assert.ok(AR.test(s.pro) && s.pro.length <= 240, `${at}: pro tip (${s.pro.length})`)
    assert.equal(s.practice.length, 3, `${at}: three exercises`)
    assert.ok(s.roleplay.a.length === 3 && s.roleplay.b.length === 3, `${at}: role-play cues`)
    assert.equal(s.card.length, 5, `${at}: five survival lines`)
    for (const [en] of s.card) assert.ok(en.length <= 52, `${at}: card line too long: ${en}`)
  }
})

test('every stop has its vocabulary page, its exchanges and its check, short enough for the pages', () => {
  for (const s of STOPS) {
    const at = `stop ${s.n}`
    const m = s.more
    assert.ok(m, `${at}: no vocabulary page (more-*.ts)`)
    assert.equal(m.examples.length, s.words.length, `${at}: one example per key word`)
    for (const e of m.examples) assert.ok(e.length <= 64 && !AR.test(e), `${at}: example too long (${e.length}): ${e}`)
    assert.equal(m.actions.length, 8, `${at}: eight action words`)
    for (const [en, ar, ex] of m.actions) {
      assert.ok(en.length <= 20 && AR.test(ar) && ar.length <= 24, `${at}: action "${en}"`)
      assert.ok(ex.length <= 58 && !AR.test(ex), `${at}: action example too long (${ex.length}): ${ex}`)
    }
    assert.equal(m.partners.length, 8, `${at}: eight word partners`)
    for (const [en, ar, ex] of m.partners) {
      assert.ok(en.length <= 24 && AR.test(ar) && ar.length <= 26, `${at}: partner "${en}"`)
      assert.ok(ex && ex.length <= 58 && !AR.test(ex), `${at}: partner example (${ex?.length}): ${ex}`)
    }
    assert.equal(m.replies.length, 6, `${at}: six replies to what you hear`)
    assert.equal(m.answers.length, 6, `${at}: six answers to what you say`)
    for (const [en, ar] of [...m.replies, ...m.answers]) {
      assert.ok(en.length <= 56 && !AR.test(en), `${at}: exchange too long (${en.length}): ${en}`)
      assert.ok(AR.test(ar) && ar.length <= 56, `${at}: Arabic for "${en}" (${ar.length})`)
    }
    assert.equal(m.check.length, 4, `${at}: four true / false statements`)
    assert.equal(m.check.filter(c => c[1]).length, 2, `${at}: two true, two false`)
    for (const [t] of m.check) assert.ok(t.length <= 56, `${at}: statement too long (${t.length}): ${t}`)
    assert.deepEqual(checkAnswers(s).length, 4)
  }
})

test("the action words are new: not a key word of the stop, not a word of the conversations book", () => {
  const norm = w => w.toLowerCase().trim()
  for (const s of STOPS) {
    const actions = s.more.actions.map(a => norm(a[0]))
    assert.equal(new Set(actions).size, actions.length, `stop ${s.n}: an action word twice`)
    const taken = new Set([
      ...s.words.flatMap(w => w[0].split('/').map(norm)),
      ...(TALK_STOPS.find(t => t.n === s.n)?.words ?? []).map(w => norm(w[0])),
    ])
    const clash = actions.filter(a => taken.has(a))
    assert.deepEqual(clash, [], `stop ${s.n}: action words already taught`)
  }
})

test('every icon the book names exists in lucide-react', () => {
  const names = new Set(PARTS.map(p => p.icon))
  for (const s of STOPS) {
    names.add(s.icon)
    for (const [, , icon] of s.words) names.add(icon)
    if (s.screen.kind === 'signs') for (const [icon] of s.screen.items) names.add(icon)
  }
  for (const t of DICTIONARY) for (const [icon] of t.items) names.add(icon)
  for (const g of [...SURVIVAL, ...MY_TRIP]) names.add(g.icon)
  const missing = [...names].filter(n => !(n in icons))
  assert.deepEqual(missing, [])
})

test('the screens\' numbered markers and notes agree', () => {
  for (const s of STOPS) {
    const sc = s.screen
    if (!('notes' in sc)) continue
    const notes = sc.notes.map(n => n[0])
    assert.deepEqual(notes, Array.from({ length: notes.length }, (_, i) => i + 1), `stop ${s.n}: notes 1…n`)
    let marks = []
    if (sc.kind === 'app') marks = sc.items.flatMap(i => (i.n ? [i.n] : []))
    if (sc.kind === 'form') marks = sc.fields.flatMap(f => (f.n ? [f.n] : []))
    if (sc.kind === 'receipt') marks = sc.lines.flatMap(l => (l[2] ? [l[2]] : []))
    if (sc.kind === 'pass') marks = [1, 2, 3, 4, 5, 6, 7]
    if (sc.kind === 'board') marks = sc.rows.map((_, i) => i + 1)
    assert.deepEqual(marks, notes, `stop ${s.n}: every marker has a note`)
  }
})

test('exercises have answers, and the shuffles never leave an item in place', () => {
  for (const s of STOPS) s.practice.forEach((ex, i) => {
    const at = `stop ${s.n} exercise ${'ABC'[i]}`
    const answers = answersOf(ex, seedOf(s.n, i))
    assert.ok(answers.length > 0 && answers.every(a => a.trim()), at)
    if (ex.t === 'gaps') for (const [q] of ex.items) assert.equal(q.split('___').length, 2, `${at}: one blank in "${q}"`)
    if (ex.t === 'choose') for (const [, opts, r] of ex.items) assert.ok(r >= 0 && r < opts.length, at)
    if (ex.t === 'match') {
      const right = ex.items.map(x => x[1])
      const shown = mixed(right, seedOf(s.n, i))
      assert.ok(shown.every((r, k) => r !== right[k]), `${at}: an item stayed in place`)
    }
  })
})

test('the book: front matter, a divider and six pages per stop, reference pages, the key', () => {
  const { pages, stopPage } = buildViizaBook()
  assert.equal(pages.filter(p => p.kind === 'part').length, 6)
  for (const s of STOPS) assert.equal(pages.filter(p => 'stop' in p && p.stop === s.n).length, 6, `stop ${s.n}`)
  const keyed = pages.filter(p => p.kind === 'key').flatMap(p => p.stops)
  assert.deepEqual(keyed, STOPS.map(s => s.n))
  // every stop opens on its own page number, after the one before
  for (let i = 1; i < STOPS.length; i++) assert.ok(stopPage(STOPS[i].n) > stopPage(STOPS[i - 1].n))
})
