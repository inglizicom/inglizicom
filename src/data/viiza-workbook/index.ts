import { PARTS, STOPS, mixed, type Pair, type Stop } from '../viiza-book/index.ts'
import { MISSIONS } from './missions.ts'

/**
 * VIIZA ENGLISH, Workbook: the travel guide's practice, two pages a stop and
 * a review closing each part. The exercises are built from the Student's
 * Book itself (its key words, what you say and hear, its conversation and
 * its survival card), so the two books can never disagree; only the
 * missions, the real thing to write for one's own trip, are written here.
 *
 *   Page 1: A missing letters · B I say or I hear? · C the conversation, with gaps
 *   Page 2: D words in order · E translate · F the mission · the self-check
 */

export { MISSIONS } from './missions.ts'

export interface Gapped { letters: string; word: string; ar: string }
export interface SayHear { en: string; who: 'say' | 'hear' }
export interface TalkGap { who: string; before: string; after: string; word: string }
export interface Ordered { words: string[]; sentence: string }

export interface WorkStop {
  stop: Stop
  missing: Gapped[]
  sayHear: SayHear[]
  talk: TalkGap[]
  bank: string[]
  ordered: Ordered[]
  translate: Pair[]
  mission: { en: string; ar: string; model: string }
}

/** The word a key word is practised by: its first form ("surname / last name" → "surname"). */
const headWord = (en: string) => en.split(/\s*[/(·]\s*/)[0].trim()

/** Hide every second letter after the first: "passport" → "p_s_p_r_". */
export function gapLetters(word: string): string {
  let k = 0
  return [...word].map(ch => (/[a-z]/i.test(ch) ? (k++ % 2 === 1 ? '_' : ch) : ch)).join('')
}

/** The word a conversation line is practised by: its longest lower-case word of four letters or more. */
function keyWord(en: string): string | null {
  const words = en.match(/\b[a-z][a-z']{3,}\b/g) ?? []
  return words.reduce<string | null>((best, w) => (!best || w.length > best.length ? w : best), null)
}

export function workStop(s: Stop): WorkStop {
  const missing = s.words.map(([en, ar]) => ({ word: headWord(en), ar })).filter(w => w.word.length >= 4).slice(0, 8)
    .map(w => ({ ...w, letters: gapLetters(w.word) }))
  const sayHear = mixed<SayHear>([...s.say.slice(0, 4).map(([en]) => ({ en, who: 'say' as const })), ...s.hear.slice(0, 4).map(([en]) => ({ en, who: 'hear' as const }))], s.n * 7 + 1)
  const talk: TalkGap[] = []
  for (const [who, en] of s.talk.lines) {
    if (talk.length >= 8) break
    const w = keyWord(en)
    if (!w) continue
    const at = en.search(new RegExp(`\\b${w}\\b`))
    talk.push({ who, before: en.slice(0, at), after: en.slice(at + w.length), word: w })
  }
  // the survival card's whole sentences first, then what you say, three in all
  const ordered = [...s.card, ...s.say].filter(([en]) => !/_{3,}/.test(en)).slice(0, 3).map(([en], i) => {
    const words = en.split(' ')
    return { sentence: en, words: mixed(words, s.n * 13 + i) }
  })
  return {
    stop: s, missing, sayHear, talk, bank: mixed(talk.map(t => t.word), s.n * 11 + 3), ordered,
    translate: s.say.slice(4, 8), mission: MISSIONS[s.n],
  }
}

export const WORK_STOPS: WorkStop[] = STOPS.map(workStop)

/* ── The reviews ────────────────────────────────────────────────────── */

export interface Review {
  part: number
  /** "Where are you?": something heard, three stops to choose from. */
  where: { heard: string; options: string[]; right: number }[]
  /** Fix the mistake: [wrong, right]. */
  fix: [string, string][]
}

export function review(part: number): Review {
  const stops = STOPS.filter(s => s.part === part)
  const where: Review['where'] = []
  for (let k = 0; where.length < 8 && k < 9; k++) {
    for (const s of stops) {
      if (where.length >= 8) break
      const heard = s.hear[(k * 4 + s.n) % s.hear.length][0]
      if (where.some(w => w.heard === heard)) continue
      // two other stops: from this part when it has two more, else from the whole book
      // never a stop where the same sentence is said too, so only one answer is right
      const says = (o: Stop) => [...o.say, ...o.hear].some(([en]) => en === heard)
      const same = stops.filter(o => o.n !== s.n && !says(o))
      const pool = same.length >= 2 ? same : [...same, ...STOPS.filter(o => o.part !== part && !says(o))]
      const at = (k + s.n) % pool.length
      const others = [pool[at], pool[(at + 1) % pool.length]]
      const options = mixed([s.titleEn, ...others.map(o => o.titleEn)], s.n * 17 + k)
      where.push({ heard, options, right: options.indexOf(s.titleEn) })
    }
  }
  // the mistakes, round robin over the part's stops: each stop's first, then each one's second…
  const fix: [string, string][] = []
  for (let k = 0; k < 3 && fix.length < 6; k++) for (const s of stops) if (fix.length < 6 && s.watch[k]) fix.push([s.watch[k][0], s.watch[k][1]])
  return { part, where, fix }
}

export const REVIEWS: Review[] = PARTS.map(p => review(p.n))

/* ── Answers ────────────────────────────────────────────────────────── */

const L = 'abc'
export function workAnswers(w: WorkStop): { letter: string; answers: string[] }[] {
  return [
    { letter: 'A', answers: w.missing.map((m, i) => `${i + 1} ${m.word}`) },
    { letter: 'B', answers: w.sayHear.map((x, i) => `${i + 1} ${x.who === 'say' ? 'I say' : 'I hear'}`) },
    { letter: 'C', answers: w.talk.map((t, i) => `${i + 1} ${t.word}`) },
    { letter: 'D', answers: w.ordered.map((o, i) => `${i + 1} ${o.sentence}`) },
    { letter: 'E', answers: w.translate.map(([en], i) => `${i + 1} ${en}`) },
    { letter: 'F', answers: [`Model: ${w.mission.model}`] },
  ]
}
export function reviewAnswers(r: Review): { letter: string; answers: string[] }[] {
  return [
    { letter: 'A', answers: r.where.map((x, i) => `${i + 1}${L[x.right]} ${x.options[x.right]}`) },
    { letter: 'B', answers: r.fix.map(([, right], i) => `${i + 1} ${right}`) },
  ]
}

/* ── The book ───────────────────────────────────────────────────────── */

export type WorkPage =
  | { kind: 'howto' }
  | { kind: 'words' | 'use'; stop: number }
  | { kind: 'review'; part: number }
  | { kind: 'key'; stops: number[]; parts: number[] }

export function buildViizaWorkbook() {
  const pages: WorkPage[] = [{ kind: 'howto' }]
  for (const p of PARTS) {
    for (const s of STOPS.filter(x => x.part === p.n)) pages.push({ kind: 'words', stop: s.n }, { kind: 'use', stop: s.n })
    pages.push({ kind: 'review', part: p.n })
  }
  // The key: a part's stops then its review, as many as fit a page (two columns, about 52 lines each).
  const lines = (answers: { answers: string[] }[]) => 1 + answers.reduce((n, a) => n + Math.ceil(a.answers.join(' · ').length / 56), 0)
  let chunk: WorkPage & { kind: 'key' } = { kind: 'key', stops: [], parts: [] }, used = 0
  const push = (h: number, add: () => void) => {
    if (used + h > 128 && (chunk.stops.length || chunk.parts.length)) { pages.push(chunk); chunk = { kind: 'key', stops: [], parts: [] }; used = 0 }
    add(); used += h
  }
  for (const p of PARTS) {
    for (const w of WORK_STOPS.filter(x => x.stop.part === p.n)) push(lines(workAnswers(w)), () => chunk.stops.push(w.stop.n))
    push(lines(reviewAnswers(REVIEWS[p.n - 1])), () => chunk.parts.push(p.n))
  }
  if (chunk.stops.length || chunk.parts.length) pages.push(chunk)
  return { pages, pageOf: (pred: (p: WorkPage) => boolean) => pages.findIndex(pred) + 1 }
}
