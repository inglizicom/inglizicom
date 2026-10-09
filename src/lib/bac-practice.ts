import type { Block } from '../data/level1-book.ts'
import type { BacSection } from '../data/bac/bac-helpers.ts'
import { BAC_BODY, exercisesOf, isOpen, numberExercises } from '../data/bac/bac-pack.ts'
import { BAC_MOCKS, mockParts, type MockExam } from '../data/bac/bac-mocks.ts'

/**
 * The Bac pack, made interactive for the student portal's «الباك» tab.
 *
 * The printed pack (src/data/bac) is the single source: each of its exercises
 * is turned into something the student does, chosen from the item's shape —
 *   options given                 → tap a choice
 *   "(since / for)" after a blank → tap a choice
 *   T or F + a quote              → choose T/F, then tap the proving sentence
 *   "word (§2) = ___"             → tap the word in paragraph 2
 *   "word (§2) → ___"             → choose what it refers to
 *   "What would you say?"         → choose the right reply
 *   "Identify the function"       → choose the function's name
 *   "Words: a · b · c"            → fill the blanks from a word bank
 *   other blanks                  → type into the blanks
 *   no blank                      → type the sentence (rewrite, transform)
 *   "Answer the questions"        → write an answer, scored on key words
 *   no answers at all             → an open task, kept as a draft
 * Typed answers are checked tolerantly: case, punctuation, contractions,
 * optional "(that)" parts and "a / b" alternatives all match.
 *
 * Progress lives on the device for now (localStorage, per student code).
 */

/* ── Units ─────────────────────────────────────────────────────────── */

export interface BacUnit {
  id: string
  section: BacSection
  tag: string
  titleEn: string
  titleAr: string
  blocks: Block[]
  mock?: MockExam
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** One unit per page; a mock exam's two pages make one unit. */
export const BAC_UNITS: BacUnit[] = BAC_BODY.reduce<BacUnit[]>((units, p) => {
  const last = units[units.length - 1]
  if (last && last.tag === p.tag) { last.blocks = [...last.blocks, ...p.blocks]; return units }
  const tag = p.tag ?? ''
  units.push({
    id: slug(tag), section: p.section, tag, titleEn: p.titleEn ?? '', titleAr: p.titleAr, blocks: [...p.blocks],
    mock: p.section === 'exam' ? BAC_MOCKS.find(m => `Mock exam ${m.n}` === tag) : undefined,
  })
  return units
}, [])

/** The unit's reading text, as numbered paragraphs (empty when it has none). */
export function unitText(u: BacUnit): string[] {
  const texts = u.blocks.flatMap(b => (b.t === 'text' ? [b.body] : []))
  const body = texts.find(t => t.includes('\n')) ?? ''
  return body ? body.split('\n') : []
}

/** Sentences of a text, each with its paragraph number (1-based). */
export function sentences(paragraphs: string[]): { para: number; text: string }[] {
  return paragraphs.flatMap((p, i) => p.split(/(?<=[.!?]["”]?)\s+(?=["“]?[A-Z])/).map(text => ({ para: i + 1, text })))
}

/* ── Exercises and items ───────────────────────────────────────────── */

export type ItemKind = 'choice' | 'tf' | 'find' | 'bank' | 'gap' | 'rewrite' | 'free' | 'open'

export interface PracticeItem {
  q: string
  a: string
  kind: ItemKind
  /** choice: the options and the right one. */
  options?: string[]
  correct?: string
  /** gap / bank: one expected answer per blank. */
  blanks?: string[]
  /** tf: the right letter and the words that prove it. */
  tf?: 'T' | 'F'
  quote?: string
  /** find: the paragraph to look in. */
  para?: number
}

export interface PracticeExercise {
  key: string
  block: Block
  title: string
  instr: string
  items: PracticeItem[]
  /** bank: the words to choose from. */
  bank?: string[]
  /** Points per correct item (1, or a mock exam part's points ÷ items). */
  weight: number
  open: boolean
}

type ExerciseBlock = Extract<Block, { t: 'exercise' }>

/** Small deterministic shuffle, so a question's options keep their order between visits. */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296 }
}
function shuffle<T>(list: T[], seed: string): T[] {
  const rnd = seeded(seed), out = [...list]
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]] }
  return out
}
/**
 * Up to `n` distinct distractors (not the answer): at most `nearMax` from
 * `near` (the same exercise), the rest from `pool` (the whole pack), so the
 * items of one exercise don't all share the same options.
 */
function distractors(answer: string, near: string[], pool: string[], n: number, seed: string, nearMax = n): string[] {
  const out: string[] = []
  const add = (s: string, cap: number) => { if (out.length < cap && norm(s) !== norm(answer) && !out.some(x => norm(x) === norm(s))) out.push(s) }
  shuffle(near, seed).forEach(s => add(s, Math.min(n, nearMax)))
  shuffle(pool, seed + '#').forEach(s => add(s, n))
  return out
}

/** "a / b" outside parentheses and brackets. */
function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0, cur = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(' || c === '[') depth++
    if (c === ')' || c === ']') depth--
    if (depth === 0 && s.startsWith(' / ', i)) { out.push(cur); cur = ''; i += 2; continue }
    cur += c
  }
  out.push(cur)
  return out.map(x => x.trim()).filter(Boolean)
}
const firstAlt = (a: string) => splitTop(a)[0] ?? a

const TF = /^([TF])\s*[–-]\s*["“](.+)["”]\s*$/
const FIND = /\(§(\d)\)\s*=\s*___\s*$/
const REF = /\(§(\d)\)\s*→\s*___\s*$/
const PICK = /\s*\(([^()]+ \/ [^()]+)\)\s*$/
const BANK = /^(?:Words|Complete with):\s*(.+)$/
const FUNCTION_Q = /→ function\?\s*$/

const ALL_EXERCISES = BAC_BODY.flatMap(p => exercisesOf(p.blocks))
const isSayEx = (e: ExerciseBlock) => /What would you say/i.test(`${e.title} ${e.instr ?? ''}`)
const isIdEx = (e: ExerciseBlock) => /Identify the function/i.test(e.title)
/** Every function name and every model reply in the pack: the pools distractors come from. */
const FUNCTION_NAMES = [...new Set(ALL_EXERCISES.flatMap(e => e.items.filter(it => FUNCTION_Q.test(it.q) || isIdEx(e)).map(it => it.a)))]
const REPLIES = ALL_EXERCISES.filter(isSayEx).flatMap(e => e.items.filter(it => !FUNCTION_Q.test(it.q)).map(it => firstAlt(it.a)))

const blankCount = (q: string) => q.split('___').length - 1

export function practiceItem(e: ExerciseBlock, i: number, seed: string): PracticeItem {
  const it = e.items[i]
  const { q, a } = it
  const base = { q, a }
  if (isOpen(e)) return { ...base, kind: 'open' }
  if (it.options) {
    const m = a.match(/^([a-d])\) (.+)$/)
    return { ...base, kind: 'choice', options: it.options, correct: m ? m[2] : a }
  }
  const tf = a.match(TF)
  if (tf) return { ...base, kind: 'tf', tf: tf[1] as 'T' | 'F', quote: tf[2] }
  const find = q.match(FIND)
  if (find) return { ...base, kind: 'find', para: Number(find[1]) }
  if (REF.test(q)) {
    const near = e.items.filter(x => REF.test(x.q)).map(x => x.a)
    const options = shuffle([a, ...distractors(a, near, [], 3, seed)], seed)
    return { ...base, kind: 'choice', options, correct: a }
  }
  if (FUNCTION_Q.test(q) || isIdEx(e)) {
    const options = shuffle([a, ...distractors(a, [], FUNCTION_NAMES, 3, seed)], seed)
    return { ...base, kind: 'choice', options, correct: a }
  }
  if (isSayEx(e)) {
    const right = firstAlt(a)
    const near = e.items.filter(x => !FUNCTION_Q.test(x.q)).map(x => firstAlt(x.a))
    const options = shuffle([right, ...distractors(right, near, REPLIES, 3, seed, 1)], seed)
    return { ...base, kind: 'choice', options, correct: right }
  }
  const pick = q.match(PICK)
  if (pick && blankCount(q) === 1) {
    const options = pick[1].split(' / ').map(s => s.trim())
    const correct = options.find(o => norm(o) === norm(a))
    if (correct) return { q: q.replace(PICK, ''), a, kind: 'choice', options, correct }
  }
  const n = blankCount(q)
  if (n > 0) {
    const blanks = n > 1 && a.includes('…') ? a.split('…').map(s => s.trim()) : [a]
    return { ...base, kind: BANK.test(e.instr ?? '') ? 'bank' : 'gap', blanks }
  }
  if (/Answer the questions/i.test(e.title)) return { ...base, kind: 'free' }
  return { ...base, kind: 'rewrite' }
}

/** The unit's exercises, numbered as in the printed book. */
export function unitExercises(u: BacUnit, exNo: Map<Block, number>): PracticeExercise[] {
  const blocks = exercisesOf(u.blocks)
  const parts = u.mock ? mockParts(u.mock) : null
  return blocks.map((e, k) => {
    const key = `${u.id}:${exNo.get(e) ?? k}`
    const bank = e.instr?.match(BANK)?.[1].split(/\s*[·,]\s*/).filter(Boolean)
    return {
      key, block: e, title: e.title, instr: e.instr ?? '',
      items: e.items.map((_, i) => practiceItem(e, i, `${key}:${i}`)),
      bank: bank && bank.length ? bank : undefined,
      weight: parts?.[k] ? parts[k].points / e.items.length : 1,
      open: isOpen(e),
    }
  })
}

/* ── Checking ──────────────────────────────────────────────────────── */

const CONTRACTIONS: [RegExp, string][] = [
  [/\bwon't\b/g, 'will not'], [/\bcan't\b/g, 'cannot'], [/\bshan't\b/g, 'shall not'], [/\bcan not\b/g, 'cannot'],
  [/n't\b/g, ' not'], [/'ll\b/g, ' will'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/\bi'm\b/g, 'i am'],
  [/\b(it|he|she|that|what|there|who|here)'s\b/g, '$1 is'], [/\blet's\b/g, 'let us'],
]

/** Lower case, straight quotes, contractions expanded, punctuation gone. */
export function norm(s: string): string {
  let t = s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”]/g, '"')
  for (const [re, to] of CONTRACTIONS) t = t.replace(re, to)
  return t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** "(that)" may be left out; "(which / that)" may be either. */
function expandParens(s: string): string[] {
  const m = s.match(/\(([^()]*)\)/)
  if (!m || m.index === undefined) return [s]
  const before = s.slice(0, m.index), after = s.slice(m.index + m[0].length)
  const inner = m[1].split(' / ').map(x => x.trim())
  return [before + after, ...inner.map(x => `${before}${x}${after}`)].flatMap(expandParens).slice(0, 32)
}
/** "he [were / was] taller" → one form per choice. */
function expandBrackets(s: string): string[] {
  const m = s.match(/\[([^\]]*)\]/)
  if (!m || m.index === undefined) return [s]
  const before = s.slice(0, m.index), after = s.slice(m.index + m[0].length)
  return m[1].split(' / ').map(x => `${before}${x.trim()}${after}`).flatMap(expandBrackets).slice(0, 32)
}

/** Every form of an answer that counts as right ("a / b", "[a / b]", "(optional)"). */
export function acceptedForms(a: string): string[] {
  return [...new Set(splitTop(a).flatMap(expandBrackets).flatMap(expandParens))]
}

/** One clean right answer: the first choice, optional words kept ("She said that she was tired."). */
export function modelForm(a: string): string {
  const one = expandBrackets(firstAlt(a))[0]
  return one.replace(/\(([^()]*)\)/g, (_, inner: string) => inner.split(' / ')[0].trim()).replace(/\s+/g, ' ')
}

/** An answer as shown to the student: brackets dropped ("He wishes he were / was taller."). */
export const shownAnswer = (a: string) => a.replace(/\[([^\]]+)\]/g, '$1')

/** Does a typed answer match? `contains`: the answer may sit inside a longer sentence. */
export function matches(input: string, a: string, contains = false): boolean {
  const n = norm(input)
  if (!n) return false
  return acceptedForms(a).some(form => {
    if (form.includes('…')) {
      const pre = norm(form.split('…')[0])
      return !!pre && n.startsWith(pre)
    }
    const f = norm(form)
    return !!f && (n === f || (contains && ` ${n} `.includes(` ${f} `)))
  })
}

const STOP = new Set(('the a an and or but of to in on at for with from by is are was were be been it its they them their this that these '
  + 'those he she his her we our you your i my me as so because which who what why how do does did not can could would should will '
  + 'have has had any two very more most also than then there').split(' '))

/** The content words of a model answer ("Any two:" lists included). */
export function keywords(a: string): string[] {
  return [...new Set(norm(firstAlt(a).replace(/^any two:\s*/i, '')).split(' ').filter(w => w.length > 2 && !STOP.has(w)))]
}
/** Share of the model's key words a written answer uses (word stems compared). */
export function keywordScore(input: string, a: string): number {
  const keys = keywords(a)
  if (!keys.length) return 0
  const stem = (w: string) => w.slice(0, 5)
  const got = new Set(norm(input).split(' ').map(stem))
  return keys.filter(k => got.has(stem(k))).length / keys.length
}
/** "Any two" answers list more than the student needs to give. */
export const freePass = (input: string, a: string) => keywordScore(input, a) >= (/^any two/i.test(a) ? 0.3 : 0.5)

/** A student's response to one item: choice → [option]; tf → [letter, sentence index]; blanks → one per blank; text → [text]. */
export type Response = string[]

/** Has the student answered every part of the item (both T/F and its sentence, every blank)? */
export function isAnswered(item: PracticeItem, r: Response): boolean {
  const has = (k: number) => !!r[k]?.trim()
  switch (item.kind) {
    case 'tf': return has(0) && has(1)
    case 'gap':
    case 'bank': return (item.blanks ?? []).every((_, k) => has(k))
    case 'open': return true
    default: return has(0)
  }
}

export function checkItem(item: PracticeItem, r: Response, text: string[]): boolean {
  switch (item.kind) {
    case 'choice': return !!r[0] && norm(r[0]) === norm(item.correct ?? '')
    case 'tf': {
      if (r[0] !== item.tf) return false
      const s = sentences(text)[Number(r[1])]
      return !!s && norm(s.text).includes(norm(item.quote ?? ''))
    }
    case 'find': return !!r[0] && norm(r[0]) === norm(item.a)
    case 'bank':
    case 'gap': return (item.blanks ?? []).every((b, i) => matches(r[i] ?? '', b))
    case 'rewrite': return matches(r[0] ?? '', item.a, true)
    case 'free': return freePass(r[0] ?? '', item.a)
    case 'open': return true
  }
}

/** The response a student who knows the answer would give (tests, "show answers"). */
export function modelResponse(item: PracticeItem, text: string[]): Response {
  switch (item.kind) {
    case 'choice': return [item.correct ?? '']
    case 'tf': return [item.tf ?? '', String(sentences(text).findIndex(s => norm(s.text).includes(norm(item.quote ?? ''))))]
    case 'find': return [item.a]
    case 'bank':
    case 'gap': return (item.blanks ?? []).map(modelForm)
    case 'open': return ['']
    default: return [modelForm(item.a)]
  }
}

/* ── Progress (on this device) ─────────────────────────────────────── */

/** How an item stands after checking: right first time, accepted by the student, fixed later, or wrong. */
export type Mark = 'ok' | 'self' | 'fixed' | 'wrong'

export interface ExerciseState {
  responses: Response[]
  marks: (Mark | null)[]
  /** Checks per item, so a typed answer's model is shown after two tries. */
  tries: number[]
  checked: boolean
  revealed: boolean
}

export const freshState = (ex: PracticeExercise): ExerciseState => ({
  responses: ex.items.map(() => []), marks: ex.items.map(() => null), tries: ex.items.map(() => 0), checked: false, revealed: false,
})

/** Check every item not yet right: the first check grades, later ones only fix. */
export function checkExercise(ex: PracticeExercise, s: ExerciseState, text: string[]): ExerciseState {
  const marks = s.marks.map((m, i): Mark | null => {
    if (m === 'ok' || m === 'self' || m === 'fixed') return m
    const right = checkItem(ex.items[i], s.responses[i] ?? [], text)
    return right ? (s.checked ? 'fixed' : 'ok') : 'wrong'
  })
  const tries = s.tries.map((t, i) => (s.marks[i] === 'ok' || s.marks[i] === 'self' || s.marks[i] === 'fixed' ? t : t + 1))
  return { ...s, marks, tries, checked: true }
}

export interface WritingState { topic: number; text: string; checklist: boolean[] }

export interface UnitState {
  ex: Record<string, ExerciseState>
  writing?: WritingState
  /** Mock exams: when the student started (ms), for the timer. */
  startedAt?: number
  /** A unit with nothing to grade is done once the student marks it read. */
  read?: boolean
  /** Last change (ISO). */
  at?: string
}

export type BacProgress = Record<string, UnitState>

const KEY = (owner: string) => `inglizi.bac-progress.v1:${owner}`

export function loadProgress(owner: string): BacProgress {
  try { return JSON.parse(localStorage.getItem(KEY(owner)) ?? '{}') as BacProgress } catch { return {} }
}
export function saveProgress(owner: string, p: BacProgress) {
  try { localStorage.setItem(KEY(owner), JSON.stringify(p)) } catch { /* storage full or blocked: progress stays in memory */ }
}

/** Points an exercise earned: right first time, or accepted by the student as an equivalent answer. */
export const exercisePoints = (ex: PracticeExercise, s?: ExerciseState) =>
  ex.open || !s?.checked ? 0 : s.marks.filter(m => m === 'ok' || m === 'self').length * ex.weight

export interface UnitScore { points: number; max: number; checked: number; gradable: number; done: boolean; pct: number }

export function unitScore(exercises: PracticeExercise[], st?: UnitState): UnitScore {
  const graded = exercises.filter(e => !e.open)
  const points = graded.reduce((s, e) => s + exercisePoints(e, st?.ex[e.key]), 0)
  const max = graded.reduce((s, e) => s + e.items.length * e.weight, 0)
  const checked = graded.filter(e => st?.ex[e.key]?.checked).length
  const done = graded.length > 0 ? checked === graded.length : !!st?.read
  return { points, max, checked, gradable: graded.length, done, pct: max ? Math.round((points / max) * 100) : done ? 100 : 0 }
}

/* ── Results for staff ─────────────────────────────────────────────
   The portal keeps progress on the device, and also reports each result to
   the CRM through the student activity log (student_log_activity, no new
   table): one row per checked exercise, finished mock exam or read lesson,
   re-sent only when its result changes. The CRM keeps the latest row per
   result. Titles are readable in the activity timeline and end with the
   score ("… · 6/8"), which is how the CRM reads it back. */

export const BAC_EX_NO = numberExercises(BAC_BODY)
export const BAC_UNIT_EXERCISES = new Map(BAC_UNITS.map(u => [u.id, unitExercises(u, BAC_EX_NO)]))

export type BacEvent = 'bac_exercise' | 'bac_mock' | 'bac_read'
export const BAC_EVENTS: BacEvent[] = ['bac_exercise', 'bac_mock', 'bac_read']
export interface BacReport { event: BacEvent; id: string; title: string }

const pts = (n: number) => String(Math.round(n * 4) / 4)

/** A mock exam's points by part (reading 15, language 15, writing 10) and its mark out of 20. */
export function mockBreakdown(exercises: PracticeExercise[], st?: UnitState) {
  const p = exercises.map(e => exercisePoints(e, st?.ex[e.key]))
  const reading = p.slice(0, 5).reduce((a, b) => a + b, 0)
  const language = p.slice(5).reduce((a, b) => a + b, 0)
  const writing = writingPoints(st?.writing)
  return { reading, language, writing, mark: (reading + language + writing) / 2 }
}

/** Everything the student has finished, as the rows the CRM should hold. */
export function bacReports(progress: BacProgress): BacReport[] {
  return BAC_UNITS.flatMap(u => {
    const exs = BAC_UNIT_EXERCISES.get(u.id) ?? []
    const st = progress[u.id]
    if (!st) return []
    const out: BacReport[] = exs.filter(e => !e.open && st.ex[e.key]?.checked).map(e => ({
      event: 'bac_exercise' as const, id: e.key,
      title: `${u.tag} · Exercise ${e.key.split(':')[1]} · ${pts(exercisePoints(e, st.ex[e.key]))}/${pts(e.items.length * e.weight)}`,
    }))
    const score = unitScore(exs, st)
    if (u.mock && score.done) {
      const b = mockBreakdown(exs, st)
      out.push({ event: 'bac_mock', id: u.id, title: `${u.tag} · R ${pts(b.reading)}/15 · L ${pts(b.language)}/15 · W ${b.writing}/10 · ${pts(b.mark)}/20` })
    }
    if (score.gradable === 0 && st.read) out.push({ event: 'bac_read', id: u.id, title: `${u.tag} · ${u.titleEn}` })
    return out
  })
}

export interface BacActivityRow { student_id?: string | null; event_type: string; entity_id: string | null; entity_title: string | null; created_at: string }

export interface BacUnitResult { unit: BacUnit; points: number; max: number; checked: number; gradable: number; done: boolean; mark: number | null; at: string | null }
export interface BacSummary { units: BacUnitResult[]; done: number; pct: number | null; mocks: { unit: BacUnit; mark: number | null }[]; last: string | null }

const SCORE = /(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\s*$/

/** One student's reported results (rows in any order): the latest row per result wins. */
export function summarizeBac(rows: BacActivityRow[]): BacSummary {
  const latest = new Map<string, BacActivityRow>()
  for (const r of [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    const k = `${r.event_type}|${r.entity_id}`
    if (r.entity_id && !latest.has(k)) latest.set(k, r)
  }
  const scoreOf = (r?: BacActivityRow) => { const m = r?.entity_title?.match(SCORE); return m ? { x: Number(m[1]), y: Number(m[2]) } : null }
  const units = BAC_UNITS.map((unit): BacUnitResult => {
    const exs = (BAC_UNIT_EXERCISES.get(unit.id) ?? []).filter(e => !e.open)
    let points = 0, max = 0, checked = 0, at: string | null = null
    for (const e of exs) {
      const r = latest.get(`bac_exercise|${e.key}`)
      const s = scoreOf(r)
      if (r && s) { points += s.x; max += s.y; checked++; if (!at || r.created_at > at) at = r.created_at }
    }
    const mockRow = latest.get(`bac_mock|${unit.id}`)
    const readRow = latest.get(`bac_read|${unit.id}`)
    for (const r of [mockRow, readRow]) if (r && (!at || r.created_at > at)) at = r.created_at
    const done = exs.length ? checked === exs.length : !!readRow
    return { unit, points, max, checked, gradable: exs.length, done, mark: unit.mock ? (scoreOf(mockRow)?.x ?? null) : null, at }
  })
  const graded = units.filter(u => u.max > 0)
  const totalMax = graded.reduce((a, u) => a + u.max, 0)
  return {
    units,
    done: units.filter(u => u.done).length,
    pct: totalMax ? Math.round((graded.reduce((a, u) => a + u.points, 0) / totalMax) * 100) : null,
    mocks: units.filter(u => u.unit.mock).map(u => ({ unit: u.unit, mark: u.mark })),
    last: units.reduce<string | null>((a, u) => (u.at && (!a || u.at > a) ? u.at : a), null),
  }
}

/** The writing checklist: five criteria, two points each (a mock exam's 10 writing points). */
export const WRITING_CHECKLIST = [
  'أجبت عن الموضوع المطلوب بالضبط',
  'نصّي منظّم: مقدّمة، فقرتان، خاتمة',
  'استعملت أدوات الربط (First of all, However…)',
  'راجعت الأزمنة والإملاء وعلامات الترقيم',
  'كتبت حوالي العدد المطلوب من الكلمات',
]
export const writingPoints = (w?: WritingState) => (w?.checklist ?? []).filter(Boolean).length * 2
export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
