// Unit tests for src/lib/teacher-report-eval.ts — the monthly report's pay
// calculation and its automatic, strict evaluation.
//
//   npm run test:unit

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computePay, evaluate } from '../../src/lib/teacher-report-eval.ts'

/** A solid month: everything delivered, reported, attended, reviewed. */
function month(over = {}) {
  const base = {
    month: '2026-10-01', generated_at: '2026-10-31T20:00:00Z',
    teacher: { id: 't', name: 'Sara', email: null, pay_model: 'revenue_share', hourly_rate_mad: 100, revenue_share_pct: 60, rating_avg: 4.8, rating_count: 20 },
    students: { total: 10, brought: 6, academy_assigned: 4, group: 8, private: 2, new: 2, left: 0, pending_review: 0, list: [] },
    sessions: { scheduled: 20, done: 20, cancelled: 0, upcoming: 0, hours: 20, missing_reports: 0, cancel_reasons: [] },
    attendance: { marked: 100, present: 92, late: 3, absent: 5, excused: 0 },
    money: { revenue_brought: 10000, pending_brought: 0, paid_by_academy_students: 3000, payout: null },
    reviews: [{ rating: 5, comment: null, date: '' }, { rating: 5, comment: null, date: '' }, { rating: 4, comment: null, date: '' }],
    academy_note: null,
    previous: { sessions_done: 18, attendance: { marked: 90, came: 80 }, revenue_brought: 9000 },
  }
  const deep = (a, b) => { for (const k of Object.keys(b)) a[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? deep({ ...a[k] }, b[k]) : b[k]; return a }
  return deep(structuredClone(base), over)
}

describe('pay', () => {
  it('revenue share: the teacher keeps their % of what the students they brought paid', () => {
    const p = computePay(month())
    assert.equal(p.model, 'revenue_share')
    assert.equal(p.teacherShare, 6000)
    assert.equal(p.academyShare, 4000)
    assert.equal(p.net, 6000)
    assert.equal(p.status, 'estimate')
  })

  it('hourly: hours × rate, no academy share', () => {
    const p = computePay(month({ teacher: { pay_model: 'hourly' } }))
    assert.equal(p.model, 'hourly')
    assert.equal(p.net, 2000)
    assert.equal(p.academyShare, 0)
  })

  it('once the founder records the month in Payroll, that is the official figure', () => {
    const p = computePay(month({ money: { payout: { base_mad: 6000, bonus_mad: 500, deduction_mad: 200, amount_mad: 6300, status: 'paid', method: 'cash', paid_at: null, note: null } } }))
    assert.equal(p.official, true)
    assert.equal(p.status, 'paid')
    assert.equal(p.net, 6300)
    assert.equal(p.bonus, 500)
    assert.equal(p.deduction, 200)
  })

  it('a share with no % set pays 0 rather than inventing one', () => {
    assert.equal(computePay(month({ teacher: { revenue_share_pct: null } })).net, 0)
  })
})

describe('evaluation', () => {
  it('a solid month scores A and says why, with numbers', () => {
    const e = evaluate(month())
    assert.equal(e.grade, 'A')
    assert.ok(e.score >= 85, `score ${e.score}`)
    assert.ok(e.strengths.some(s => s.includes('95%')), 'quotes the attendance rate')
    assert.equal(e.weaknesses.length, 0)
    assert.equal(e.criteria.reduce((t, c) => t + c.max, 0), 100)
  })

  it('is strict: weak attendance, cancellations and missing reports pull it down to D, each named', () => {
    const e = evaluate(month({
      attendance: { marked: 100, present: 60, late: 5, absent: 35, excused: 0 },
      sessions: { done: 12, cancelled: 6, hours: 12, missing_reports: 6 },
      students: { new: 0, left: 2 },
      money: { revenue_brought: 5000 },
    }))
    assert.equal(e.grade, 'D')
    assert.ok(e.weaknesses.some(w => w.includes('65%')), 'attendance')
    assert.ok(e.weaknesses.some(w => w.includes('33%')), 'cancellations')
    assert.ok(e.weaknesses.some(w => w.includes('6 حصة')), 'missing reports')
    assert.ok(e.weaknesses.some(w => w.includes('2 طالب')), 'students who left')
    assert.ok(e.weaknesses.some(w => w.includes('انخفضت')), 'money down vs last month')
  })

  it('does not judge satisfaction on fewer than 3 reviews', () => {
    const e = evaluate(month({ reviews: [{ rating: 1, comment: null, date: '' }] }))
    const sat = e.criteria.find(c => c.key === 'satisfaction')
    assert.equal(sat.score, 8)
    assert.ok(!e.weaknesses.some(w => w.includes('تقييم')))
  })

  it('names the students who missed two sessions or more', () => {
    const e = evaluate(month({ students: { list: [
      { id: '1', name: 'Hiba', kind: 'group', brought: true, is_new: false, left: false, review_status: 'approved', present: 2, late: 0, absent: 3, excused: 0, paid: 0, pending: 0 },
      { id: '2', name: 'Omar', kind: 'group', brought: true, is_new: false, left: false, review_status: 'approved', present: 4, late: 0, absent: 1, excused: 0, paid: 0, pending: 0 },
    ] } }))
    assert.ok(e.actions.some(a => a.includes('Hiba (3 غياب)') && !a.includes('Omar')))
  })

  it('a month with nothing recorded is flagged, not praised', () => {
    const e = evaluate(month({
      sessions: { scheduled: 0, done: 0, cancelled: 0, hours: 0, missing_reports: 0 },
      attendance: { marked: 0, present: 0, late: 0, absent: 0, excused: 0 },
      students: { new: 0 }, money: { revenue_brought: 0 }, reviews: [],
    }))
    assert.equal(e.noActivity, true)
    assert.equal(e.grade, 'D')
  })

  it('same month, same verdict', () => {
    assert.deepEqual(evaluate(month()), evaluate(month()))
  })
})
