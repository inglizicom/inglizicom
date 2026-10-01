// Unit tests for src/lib/enrollment-metrics.ts — date ranges on the Morocco
// business clock, previous-period comparison, URL state and CSV export.
//
//   npm run test:unit

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  businessToday, presetRange, customRange, previousRange, bucketFor, parseQuery, toQueryString,
  deltaPct, toCsv, startOfWeek, minusOneMonth, daysInclusive, isDay, hasEntityFilters, COUNTING_RULES,
  casablancaWallTimeToIso, datesOnWeekdays,
} from '../../src/lib/enrollment-metrics.ts'

describe('scheduling in Morocco time', () => {
  it('turns a Morocco wall time into the right instant (UTC+1 most of the year)', () => {
    assert.equal(casablancaWallTimeToIso('2026-10-05', '18:00'), '2026-10-05T17:00:00.000Z')
    assert.equal(casablancaWallTimeToIso('2026-10-31', '23:30'), '2026-10-31T22:30:00.000Z')
  })
  it('lists the chosen weekdays in a date span', () => {
    // 2026-10-05 is a Monday; Mon(1) + Wed(3) for two weeks
    assert.deepEqual(datesOnWeekdays('2026-10-05', '2026-10-18', [1, 3]),
      ['2026-10-05', '2026-10-07', '2026-10-12', '2026-10-14'])
    assert.deepEqual(datesOnWeekdays('2026-10-18', '2026-10-05', [1]), [])
  })
})

describe('business clock (Africa/Casablanca)', () => {
  it('uses the Morocco date, not UTC, around midnight', () => {
    // 2026-10-31 23:30 UTC is already 1 November in Morocco (UTC+1)
    assert.equal(businessToday(new Date('2026-10-31T23:30:00Z')), '2026-11-01')
    assert.equal(businessToday(new Date('2026-10-31T22:59:00Z')), '2026-10-31')
  })

  it('validates calendar days', () => {
    assert.equal(isDay('2026-02-29'), false)
    assert.equal(isDay('2028-02-29'), true)
    assert.equal(isDay('2026-13-01'), false)
    assert.equal(isDay('2026-1-01'), false)
  })
})

describe('presets', () => {
  const today = '2026-10-15'                       // a Thursday
  it('today, week, month, year and all', () => {
    assert.deepEqual(presetRange('today', today), { preset: 'today', from: today, to: today })
    assert.deepEqual(presetRange('week', today),  { preset: 'week',  from: '2026-10-12', to: today })
    assert.deepEqual(presetRange('month', today), { preset: 'month', from: '2026-10-01', to: today })
    assert.deepEqual(presetRange('year', today),  { preset: 'year',  from: '2026-01-01', to: today })
    assert.deepEqual(presetRange('all', today),   { preset: 'all',   from: null, to: today })
  })

  it('weeks start on Monday, like Postgres date_trunc', () => {
    assert.equal(startOfWeek('2026-10-12'), '2026-10-12')   // Monday
    assert.equal(startOfWeek('2026-10-18'), '2026-10-12')   // Sunday
    assert.equal(startOfWeek('2026-01-01'), '2025-12-29')   // crosses the year
  })

  it('custom ranges are inclusive and order-proof', () => {
    assert.deepEqual(customRange('2026-09-30', '2026-09-01'), { preset: 'custom', from: '2026-09-01', to: '2026-09-30' })
    assert.equal(daysInclusive('2026-09-01', '2026-09-30'), 30)
    assert.throws(() => customRange('2026-09-01', 'nope'))
  })
})

describe('previous period', () => {
  it('today → yesterday', () => {
    assert.deepEqual(previousRange(presetRange('today', '2026-10-01')), { preset: 'custom', from: '2026-09-30', to: '2026-09-30' })
  })
  it('month to date → the same days last month, clipped', () => {
    assert.deepEqual(previousRange(presetRange('month', '2026-10-15')), { preset: 'custom', from: '2026-09-01', to: '2026-09-15' })
    assert.deepEqual(previousRange(presetRange('month', '2026-03-31')), { preset: 'custom', from: '2026-02-01', to: '2026-02-28' })
    assert.equal(minusOneMonth('2026-01-15'), '2025-12-15')
  })
  it('week and year to date', () => {
    assert.deepEqual(previousRange(presetRange('week', '2026-10-15')), { preset: 'custom', from: '2026-10-05', to: '2026-10-08' })
    assert.deepEqual(previousRange(presetRange('year', '2028-02-29')), { preset: 'custom', from: '2027-01-01', to: '2027-02-28' })
  })
  it('custom → equal length, immediately before, never overlapping', () => {
    const r = customRange('2026-09-10', '2026-09-19')
    const p = previousRange(r)
    assert.deepEqual(p, { preset: 'custom', from: '2026-08-31', to: '2026-09-09' })
    assert.equal(daysInclusive(p.from, p.to), daysInclusive(r.from, r.to))
    assert.ok(p.to < r.from)
  })
  it('all time has nothing to compare with', () => {
    assert.equal(previousRange(presetRange('all', '2026-10-15')), null)
  })
})

describe('trend buckets', () => {
  it('daily up to a month, weekly up to six months, then monthly', () => {
    assert.equal(bucketFor(customRange('2026-09-01', '2026-10-01')), 'day')     // 31 days
    assert.equal(bucketFor(customRange('2026-09-01', '2026-10-02')), 'week')
    assert.equal(bucketFor(presetRange('year', '2026-12-31')), 'month')
    assert.equal(bucketFor(presetRange('all', '2026-12-31')), 'month')
  })
})

describe('query parameters', () => {
  const today = '2026-10-15'
  const uuid = '3f1c2b9e-1111-4222-8333-944455556666'

  it('round-trips range and filters', () => {
    const q = { range: customRange('2026-09-01', '2026-09-30'),
                filters: { course_id: uuid, mode: 'private', status: 'active' } }
    const s = toQueryString(q)
    assert.equal(s, `range=custom&from=2026-09-01&to=2026-09-30&course=${uuid}&mode=private&status=active`)
    assert.deepEqual(parseQuery(new URLSearchParams(s), today), q)
  })

  it('defaults to this month and drops anything invalid', () => {
    const q = parseQuery(new URLSearchParams('range=decade&course=not-a-uuid&mode=vip&status=deleted&from=x'), today)
    assert.deepEqual(q, { range: presetRange('month', today), filters: {} })
    assert.equal(toQueryString(q), '')
    assert.equal(hasEntityFilters(q.filters), false)
  })

  it('a custom range without valid dates falls back', () => {
    assert.deepEqual(parseQuery({ range: 'custom', from: '2026-09-01' }, today).range, presetRange('month', today))
  })
})

describe('comparison', () => {
  it('percent change, and "new" when the previous period was empty', () => {
    assert.equal(deltaPct(12, 10), 20)
    assert.equal(deltaPct(5, 10), -50)
    assert.equal(deltaPct(0, 0), 0)
    assert.equal(deltaPct(3, 0), null)
    assert.equal(deltaPct(3, null), null)
  })
})

describe('CSV export', () => {
  it('escapes, keeps Arabic, and neutralises formulas', () => {
    const csv = toCsv([['طالب', 'دورة'], ['أمل, "ب"', '=HYPERLINK("x")'], [null, -12.5]])
    assert.ok(csv.startsWith('﻿'))
    assert.equal(csv.slice(1), 'طالب,دورة\r\n"أمل, ""ب""","\'=HYPERLINK(""x"")"\r\n,-12.5\r\n')
  })
})

describe('counting rules', () => {
  it('documents the rules the SQL implements', () => {
    const terms = COUNTING_RULES.map(r => r.term)
    for (const t of ['التوقيت', 'طلاب فريدون', 'ما ليس تسجيلًا', 'الإيرادات', 'المحذوفون']) assert.ok(terms.includes(t), t)
  })
})
