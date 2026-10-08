import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leadOffer, planIdFromPath } from '../../src/lib/lead-offer.ts'

const PLANS = {
  basic: { title: 'المستوى الأول', amount: 750, from: 'A0', to: 'A1' },
  pro:   { title: 'المستوى الثاني', amount: 1400, from: 'A1', to: 'A2' },
}
const planOf = id => PLANS[id]

test('a plan the visitor picked is "chosen", with price and levels', () => {
  const o = leadOffer({ plan_id: 'pro', source: 'pricing_card_pro', level: 'A1-A2' }, planOf)
  assert.equal(o.state, 'chosen')
  assert.equal(o.title, 'المستوى الثاني')
  assert.equal(o.detail, '1,400 درهم · A1 → A2')
  assert.equal(o.planId, 'pro')
})

test('the level test plan is a suggestion, not a choice', () => {
  const o = leadOffer({ plan_id: 'basic', plan_interest: 'basic', source: 'level-test', level: 'A0' }, planOf)
  assert.equal(o.state, 'suggested')
  assert.match(o.hint, /اختبار المستوى/)
  assert.match(o.hint, /A0/)
})

test('a general button with no pick says so, never "learn English"', () => {
  const o = leadOffer({ plan_id: 'website', source: 'sticky_cta', page_path: '/' }, planOf)
  assert.equal(o.state, 'none')
  assert.equal(o.title, 'لم يختر عرضًا')
  assert.equal(o.planId, null)
})

test('with no pick, the offer page they were reading is the hint', () => {
  const o = leadOffer({ plan_id: 'website', source: 'footer_cta', page_path: '/pricing/basic' }, planOf)
  assert.equal(o.state, 'none')
  assert.match(o.hint, /المستوى الأول/)
})

test('plan_interest is used when plan_id is only "website"', () => {
  assert.equal(leadOffer({ plan_id: 'website', plan_interest: 'pro' }, planOf).planId, 'pro')
})

test('an unknown plan id falls through to "none"', () => {
  assert.equal(leadOffer({ plan_id: 'old-plan' }, planOf).state, 'none')
})

test('planIdFromPath only reads /pricing/<id>', () => {
  assert.equal(planIdFromPath('/pricing/basic'), 'basic')
  assert.equal(planIdFromPath('/pricing/pack-complet/'), 'pack-complet')
  assert.equal(planIdFromPath('/pricing'), null)
  assert.equal(planIdFromPath('/courses/a0a1'), null)
  assert.equal(planIdFromPath(null), null)
})
