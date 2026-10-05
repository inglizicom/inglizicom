import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { blockedRegion, phoneCountry } from '../../src/lib/lead-region.ts'

/*
 * No leads from Algeria, Tunisia, Egypt, Libya or Mauritania — unless the
 * person lives elsewhere (lib/lead-region.ts).
 */

describe('lead region', () => {
  it('reads the country of an international number only', () => {
    assert.equal(phoneCountry('+213 555 12 34 56'), 'DZ')
    assert.equal(phoneCountry('00216 20 123 456'), 'TN')
    assert.equal(phoneCountry('+20 100 123 4567'), 'EG')
    assert.equal(phoneCountry('+218 91 234 5678'), 'LY')
    assert.equal(phoneCountry('+222 22 12 34 56'), 'MR')
    assert.equal(phoneCountry('+212 612 345 678'), 'MA')
    assert.equal(phoneCountry('212612345678'), 'MA')
    assert.equal(phoneCountry('213555123456'), 'DZ', 'written without + but clearly international')
    assert.equal(phoneCountry('0612345678'), null, 'local: Morocco and Algeria look the same')
    assert.equal(phoneCountry('+33 6 12 34 56 78'), 'OTHER')
    assert.equal(phoneCountry(''), null)
  })

  it('blocks visitors in the five countries, whatever their phone', () => {
    assert.equal(blockedRegion('DZ', '0612345678'), 'DZ')
    assert.equal(blockedRegion('eg', '+212612345678'), 'EG')
    assert.equal(blockedRegion('TN', null), 'TN')
  })

  it('blocks a phone from those countries when we cannot see the visitor elsewhere', () => {
    assert.equal(blockedRegion(null, '+213555123456'), 'DZ')
    assert.equal(blockedRegion('??', '+20 100 123 4567'), 'EG')
  })

  it('welcomes people from there who live abroad, and everyone else', () => {
    assert.equal(blockedRegion('FR', '+213555123456'), null, 'Algerian living in France')
    assert.equal(blockedRegion('AE', '+20 100 123 4567'), null, 'Egyptian in Dubai')
    assert.equal(blockedRegion('MA', '0612345678'), null)
    assert.equal(blockedRegion(null, '0612345678'), null)
    assert.equal(blockedRegion(null, null), null)
  })
})
