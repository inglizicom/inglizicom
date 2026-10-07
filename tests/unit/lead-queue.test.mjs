import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  bucketOf, buildQueue, countViews, outcomePatch, leadWant, waMessage, matchesOutcome, countOutcomes,
} from '../../src/lib/lead-queue.ts'

/*
 * The follow-up queue (lib/lead-queue.ts): every open lead lands in exactly
 * one bucket, the most urgent come first, and one outcome tap writes the
 * status, the contact time and the next follow-up day (Morocco clock).
 */

const TODAY = '2026-06-15'   // summer: Morocco = UTC+1
const lead = (o = {}) => ({
  id: 'x', full_name: 'سارة العلوي', status: 'new', created_at: '2026-06-14T10:00:00Z',
  next_followup_at: null, last_contact_at: null, admin_note: null, ...o,
})

describe('lead queue buckets', () => {
  it('puts each lead in one bucket', () => {
    assert.equal(bucketOf(lead(), TODAY), 'fresh')
    assert.equal(bucketOf(lead({ created_at: '2026-05-01T10:00:00Z' }), TODAY), 'stale')
    assert.equal(bucketOf(lead({ next_followup_at: '2026-06-14T08:00:00Z' }), TODAY), 'overdue')
    assert.equal(bucketOf(lead({ next_followup_at: '2026-06-15T08:00:00Z' }), TODAY), 'today')
    assert.equal(bucketOf(lead({ next_followup_at: '2026-06-18T08:00:00Z' }), TODAY), 'scheduled')
    assert.equal(bucketOf(lead({ status: 'interested', last_contact_at: '2026-06-10T10:00:00Z' }), TODAY), 'no_step')
    assert.equal(bucketOf(lead({ status: 'converted', next_followup_at: '2026-06-01T08:00:00Z' }), TODAY), 'closed')
    assert.equal(bucketOf(lead({ status: 'cancelled' }), TODAY), 'closed')
  })

  it('uses the Morocco day for a follow-up near midnight', () => {
    // 23:30 UTC on the 14th is already the 15th in Morocco → due today, not overdue
    assert.equal(bucketOf(lead({ next_followup_at: '2026-06-14T23:30:00Z' }), TODAY), 'today')
  })

  it('orders "now": overdue, today, fresh (newest first), no next step', () => {
    const q = buildQueue([
      lead({ id: 'nostep', status: 'contacted', last_contact_at: '2026-06-12T10:00:00Z' }),
      lead({ id: 'fresh-old', created_at: '2026-06-10T10:00:00Z' }),
      lead({ id: 'fresh-new', created_at: '2026-06-15T09:00:00Z' }),
      lead({ id: 'today', next_followup_at: '2026-06-15T08:00:00Z' }),
      lead({ id: 'overdue', next_followup_at: '2026-06-12T08:00:00Z' }),
      lead({ id: 'later', next_followup_at: '2026-06-20T08:00:00Z' }),
      lead({ id: 'paid', status: 'paid' }),
    ], 'now', TODAY)
    assert.deepEqual(q.map(l => l.id), ['overdue', 'today', 'fresh-new', 'fresh-old', 'nostep'])
  })

  it('counts the views and what was done today', () => {
    const c = countViews([
      lead(), lead({ status: 'paid' }),
      lead({ status: 'contacted', last_contact_at: '2026-06-15T09:00:00Z', next_followup_at: '2026-06-16T08:00:00Z' }),
    ], TODAY)
    assert.deepEqual(c, { now: 1, scheduled: 1, stale: 0, closed: 1, doneToday: 1 })
  })
})

describe('outcome tap', () => {
  const base = { today: TODAY, nowIso: '2026-06-15T10:00:00.000Z', staffId: 'me' }

  it('no answer → contacted, retry tomorrow 09:00 Morocco, lead claimed, attempt counted', () => {
    assert.deepEqual(outcomePatch(lead(), { ...base, outcome: 'no_answer' }), {
      status: 'contacted', last_contact_at: base.nowIso,
      next_followup_at: '2026-06-16T08:00:00.000Z', assigned_to_id: 'me',
      last_outcome: 'no_answer', contact_attempts: 1,
    })
    assert.equal(outcomePatch(lead({ contact_attempts: 2 }), { ...base, outcome: 'no_answer' }).contact_attempts, 3)
  })

  it('keeps the owner, honours a chosen delay and prepends a dated note', () => {
    const p = outcomePatch(lead({ assigned_to_id: 'other', admin_note: 'قديمة' }),
      { ...base, outcome: 'interested', days: 7, note: ' يفضّل المساء ' })
    assert.equal(p.status, 'interested')
    assert.equal(p.assigned_to_id, undefined)
    assert.equal(p.next_followup_at, '2026-06-22T08:00:00.000Z')
    assert.equal(p.admin_note, '2026-06-15: يفضّل المساء\nقديمة')
  })

  it('closing outcomes clear the follow-up; lost keeps a reason', () => {
    assert.equal(outcomePatch(lead(), { ...base, outcome: 'paid' }).next_followup_at, null)
    const lost = outcomePatch(lead(), { ...base, outcome: 'lost', lostReason: 'too_expensive', days: 3 })
    assert.equal(lost.status, 'cancelled')
    assert.equal(lost.next_followup_at, null)
    assert.equal(lost.lost_reason, 'too_expensive')
  })
})

describe('outcome chips', () => {
  it('puts each lead under the right chip', () => {
    const list = [
      lead({ id: 'new' }),
      lead({ id: 'rang', status: 'contacted', last_outcome: 'no_answer', last_contact_at: '2026-06-14T10:00:00Z', next_followup_at: '2026-06-16T08:00:00Z' }),
      lead({ id: 'keen', status: 'interested', last_outcome: 'interested', last_contact_at: '2026-06-14T10:00:00Z' }),
      lead({ id: 'pay', status: 'confirmed', last_contact_at: '2026-06-14T10:00:00Z', next_followup_at: '2026-06-15T08:00:00Z' }),
      lead({ id: 'closed', status: 'cancelled', last_outcome: 'no_answer' }),
    ]
    const ids = f => list.filter(l => matchesOutcome(l, f, TODAY)).map(l => l.id)
    assert.deepEqual(ids('uncontacted'), ['new'])
    assert.deepEqual(ids('no_answer'), ['rang'], 'a closed lead is not "waiting for an answer"')
    assert.deepEqual(ids('interested'), ['keen'])
    assert.deepEqual(ids('will_pay'), ['pay'])
    assert.deepEqual(ids('no_step'), ['keen'], 'talked to, no follow-up day')
    assert.equal(countOutcomes(list, TODAY).all, 5)
  })
})

describe('first message', () => {
  const title = id => ({ basic: 'المستوى الأول' })[id]
  it('names what they asked for', () => {
    assert.equal(leadWant(lead({ plan_id: 'basic' }), title), 'المستوى الأول')
    assert.equal(leadWant(lead({ plan_id: 'website', course: 'a1a2' }), title), 'مستوى A1 → A2')
    assert.equal(leadWant(lead({ plan_id: 'website' }), title), 'تعلّم الإنجليزية')
  })
  it('greets a new lead, checks in with a contacted one', () => {
    assert.match(waMessage(lead(), 'المستوى الأول'), /^السلام عليكم سارة 👋.*وصلنا طلبك بخصوص المستوى الأول/)
    assert.match(waMessage(lead({ level: 'A1' }), 'x'), /اختبار المستوى ديالك \(A1\)/)
    assert.match(waMessage(lead({ status: 'contacted', last_contact_at: '2026-06-14T10:00:00Z' }), 'x'), /نتابع معك بخصوص x/)
  })
})
