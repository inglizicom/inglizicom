import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plannerPages, plannerWeeks } from '../../src/data/study-planner.ts'
import { L2_PLANNER, buildLevel2Book } from '../../src/data/level2-book/index.ts'
import { EVERYDAY_PLANNER, buildEverydayBook } from '../../src/data/everyday-book/index.ts'

const AR = /[؀-ۿ]/

for (const [name, cfg, build] of [['Level 2', L2_PLANNER, buildLevel2Book], ['Everyday English', EVERYDAY_PLANNER, buildEverydayBook]]) {
  test(`${name}: one week a unit, six study days and a day off`, () => {
    assert.equal(cfg.week.length, 7)
    assert.equal(cfg.week.at(-1).minutes, 0, 'the last day is the day off')
    assert.equal(cfg.week.filter(d => d.minutes > 0).length, 6)
    for (const d of cfg.week) {
      for (const s of [d.what, d.how]) assert.match(s, /^[A-Z][^؀-ۿ]* - [؀-ۿ].*[؀-ۿ][^A-Za-z؀-ۿ]*$/, `"${s}"`)
    }
    assert.ok(cfg.week.some(d => d.supports.includes('audio')) && cfg.week.some(d => d.supports.includes('video')) && cfg.week.some(d => d.supports.includes('teacher')), 'every support is used')
    const unit = cfg.week.reduce((s, d) => s + d.minutes, 0)
    assert.ok(unit >= 4 * 60 && unit <= 6 * 60, `${unit} minutes a unit`)
  })

  test(`${name}: the calendar has every unit once, each review and rest week where it belongs`, () => {
    const weeks = plannerWeeks(cfg)
    assert.equal(weeks.filter(w => w.kind === 'unit').length, cfg.units.length)
    assert.equal(weeks.filter(w => w.kind === 'review').length, cfg.reviewsAfter.length)
    assert.equal(weeks.filter(w => w.kind === 'rest').length, cfg.restAfter.length)
    // a review comes right after the unit it closes
    for (const n of cfg.reviewsAfter) {
      const i = weeks.findIndex(w => w.label.startsWith(`Unit ${String(n).padStart(2, '0')} `))
      assert.equal(weeks[i + 1].kind, 'review', `review after unit ${n}`)
    }
    const pages = plannerPages(cfg)
    assert.equal(pages.length, 4)
    const rows = pages.flatMap(p => p.blocks.filter(b => b.t === 'grid' && b.rows[0].cells[0] === 'Week').flatMap(b => b.rows.slice(1)))
    assert.deepEqual(rows.map(r => Number(r.cells[0])), weeks.map((_, i) => i + 1), 'weeks numbered 1, 2, 3…')
    // the follow-up page: one box a review
    assert.equal(pages[3].blocks.filter(b => b.t === 'gapText').length, cfg.reviewsAfter.length)
  })

  test(`${name}: the planner sits after the contents, and the contents point at it`, () => {
    const { pages } = build()
    const first = pages.findIndex(p => p.kind === 'planner')
    assert.equal(pages[first - 1].kind, 'contents')
    assert.equal(pages.filter(p => p.kind === 'planner').length, 4)
    const grid = pages.find(p => p.kind === 'contents').blocks.find(b => b.t === 'grid')
    const row = grid.rows.find(r => r.cells.some(c => /study plan/i.test(c)))
    const page = Number(row.cells.at(-1).match(/\d+/)[0])
    assert.equal(pages[page - 1].kind, 'planner')
    assert.ok(AR.test(pages[first].titleAr))
  })
}
