import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mergeProgress, EMPTY_PROGRESS } from '../../src/app/viiza/_app/progress-merge.ts'

/**
 * VIIZA interactive: progress from two devices (or a device and the
 * account) is merged, never lost: seen and done are united, scores keep
 * the best.
 */

test('two devices: sections and stamps are united, the best score is kept', () => {
  const phone = { seen: { 1: ['opener', 'words'] }, done: [1], best: { '1:tf': 3, 'part:1': 6 } }
  const laptop = { seen: { 1: ['words', 'talk'], 2: ['opener'] }, done: [2], best: { '1:tf': 4, 'part:1': 5 } }
  const m = mergeProgress(phone, laptop)
  assert.deepEqual(m.seen['1'].sort(), ['opener', 'talk', 'words'])
  assert.deepEqual(m.seen['2'], ['opener'])
  assert.deepEqual(m.done, [1, 2])
  assert.deepEqual(m.best, { '1:tf': 4, 'part:1': 6 })
})

test('nothing, or junk, merges into an empty progress', () => {
  assert.deepEqual(mergeProgress(null, undefined), EMPTY_PROGRESS)
  assert.deepEqual(mergeProgress({ done: 'x', best: 5 }, { done: [3, 'y'] }), { seen: {}, done: [3], best: {} })
})
