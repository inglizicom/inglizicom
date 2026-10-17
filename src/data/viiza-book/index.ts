import type { Exercise, Stop } from './types.ts'
import { PARTS } from './plan.ts'
import { PART_1 } from './part-1.ts'
import { PART_2 } from './part-2.ts'
import { PART_3 } from './part-3.ts'
import { PART_4 } from './part-4.ts'
import { PART_5A } from './part-5a.ts'
import { PART_5B } from './part-5b.ts'
import { PART_6 } from './part-6.ts'
import { MORE } from './more.ts'

/**
 * VIIZA ENGLISH, Student's Book (the travel guide) as a list of A4 pages for
 * /admin/level2-book. Front matter, then each part: its divider and its
 * stops (six pages each: opener, vocabulary, exchanges, in real life,
 * conversation, practice),
 * then the reference pages a traveller reaches for on the road and the
 * answer key. Page numbers count every page after the cover and the
 * thank-you page, so the contents page can print them.
 */

export * from './types.ts'
export { PARTS, CHECKED } from './plan.ts'
export * from './extras.ts'

export const STOPS: Stop[] = [...PART_1, ...PART_2, ...PART_3, ...PART_4, ...PART_5A, ...PART_5B, ...PART_6]
  .map(s => (MORE[s.n] ? { ...s, more: MORE[s.n] } : s))

export type FrontKind = 'welcome' | 'contents' | 'mytrip' | 'toolkit-1' | 'toolkit-2' | 'phrases-1' | 'phrases-2'
export type BackKind = 'dictionary-1' | 'dictionary-2' | 'emergency' | 'conversions' | 'apps' | 'stamps' | 'key'
export type StopKind = 'opener' | 'words' | 'exchanges' | 'real' | 'talk' | 'practice'

export type ViizaPage =
  | { kind: FrontKind | Exclude<BackKind, 'key'> }
  | { kind: 'part'; part: number }
  | { kind: StopKind; stop: number }
  | { kind: 'key'; stops: number[] }

export const STOP_KINDS: StopKind[] = ['opener', 'words', 'exchanges', 'real', 'talk', 'practice']

/** A small deterministic shuffle (the same print every time), never leaving an item in its place when it can. */
export function mixed<T>(items: T[], seed: number): T[] {
  const out = items.map((v, i) => ({ v, i }))
  let s = seed * 9301 + 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let tries = 0; tries < 20; tries++) {
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]] }
    if (out.length < 2 || out.every((x, k) => x.i !== k)) break
  }
  return out.map(x => x.v)
}

const LETTERS = 'abcdefghij'

/** The answers of one exercise, as short strings for the key. */
export function answersOf(ex: Exercise, seed: number): string[] {
  switch (ex.t) {
    case 'match': {
      const right = mixed(ex.items.map(i => i[1]), seed)
      return ex.items.map((item, k) => `${k + 1}${LETTERS[right.indexOf(item[1])]}`)
    }
    case 'gaps': return ex.items.map(([, a], k) => `${k + 1} ${a}`)
    case 'choose': return ex.items.map(([, opts, r], k) => `${k + 1}${LETTERS[r]} ${opts[r]}`)
    case 'say': return ex.items.map(([, a], k) => `${k + 1} ${a}`)
    case 'order': {
      const shown = mixed(ex.lines, seed)
      return [ex.lines.map(l => LETTERS[shown.indexOf(l)]).join(' – ')]
    }
  }
}

/** The seed of an exercise's shuffle: its stop and its place in the stop. */
export const seedOf = (stop: number, ex: number) => stop * 10 + ex + 1

/** The conversation check's answers for the key: "1 T · 2 F …". */
export const checkAnswers = (s: Stop) => (s.more?.check ?? []).map(([, t], k) => `${k + 1} ${t ? 'T' : 'F'}`)

/** How tall a stop's answers print in the key, in lines (to share stops between key pages). */
function keyLines(s: Stop) {
  return 2 + s.practice.reduce((sum, ex, i) => sum + Math.ceil(answersOf(ex, seedOf(s.n, i)).join(' · ').length / 58), 0)
}

export function buildViizaBook() {
  const pages: ViizaPage[] = [
    { kind: 'welcome' }, { kind: 'contents' }, { kind: 'mytrip' },
    { kind: 'toolkit-1' }, { kind: 'toolkit-2' }, { kind: 'phrases-1' }, { kind: 'phrases-2' },
  ]
  for (const p of PARTS) {
    const stops = STOPS.filter(s => s.part === p.n)
    if (!stops.length) continue
    pages.push({ kind: 'part', part: p.n })
    for (const s of stops) for (const kind of STOP_KINDS) pages.push({ kind, stop: s.n })
  }
  pages.push({ kind: 'dictionary-1' }, { kind: 'dictionary-2' }, { kind: 'emergency' }, { kind: 'conversions' }, { kind: 'apps' }, { kind: 'stamps' })
  // The key: stops in order, as many as fit a page.
  const MAX = 104
  let chunk: number[] = [], used = 0
  for (const s of STOPS) {
    const h = keyLines(s)
    if (chunk.length && used + h > MAX) { pages.push({ kind: 'key', stops: chunk }); chunk = []; used = 0 }
    chunk.push(s.n); used += h
  }
  if (chunk.length) pages.push({ kind: 'key', stops: chunk })

  // Page numbers start at 1 on the welcome page (the cover and thank-you page come before it).
  const pageOf = (pred: (p: ViizaPage) => boolean) => pages.findIndex(pred) + 1
  const stopPage = (n: number) => pageOf(p => p.kind === 'opener' && 'stop' in p && p.stop === n)
  const partPage = (n: number) => pageOf(p => p.kind === 'part' && p.part === n)
  return { pages, stopPage, partPage, pageOf }
}

export const stopOf = (n: number) => STOPS.find(s => s.n === n)
