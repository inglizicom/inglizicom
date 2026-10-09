import type { Block } from '../level1-book.ts'
import { page, type BacPage, type BacSection } from './bac-helpers.ts'
import { BAC_READING, BAC_START } from './bac-start-reading.ts'
import { BAC_VOCAB } from './bac-vocab.ts'
import { BAC_GRAMMAR } from './bac-grammar.ts'
import { BAC_FUNCTIONS } from './bac-functions.ts'
import { BAC_WRITING } from './bac-writing.ts'
import { BAC_EXAMS } from './bac-mocks.ts'

/**
 * The Bac English pack, assembled: contents · the teaching pages · five mock
 * exams · answer keys. The contents and the keys are built from the pages
 * themselves (page numbers, exercise numbers, answers), so adding an exercise
 * anywhere renumbers everything and its answers land in the keys.
 *
 * Page numbers count from the contents page (page 1); the cover and the
 * thank-you page carry none.
 */

export const SECTION_NAMES: Record<BacSection, [en: string, ar: string]> = {
  start: ['Start', 'البداية'],
  reading: ['Reading', 'القراءة'],
  vocab: ['Vocabulary', 'المفردات'],
  grammar: ['Grammar', 'القواعد'],
  functions: ['Communicative functions', 'الوظائف التواصلية'],
  writing: ['Writing', 'الكتابة'],
  exam: ['Mock exams', 'امتحانات تجريبية'],
  key: ['Answer key', 'مفاتيح الحل'],
  contents: ['Contents', 'الفهرس'],
}

/** The teaching pages and the exams, in book order. */
export const BAC_BODY: BacPage[] = [
  ...BAC_START, ...BAC_READING, ...BAC_VOCAB, ...BAC_GRAMMAR, ...BAC_FUNCTIONS, ...BAC_WRITING, ...BAC_EXAMS,
].map((p, i) => ({ ...p, n: i + 1 }))

type Exercise = Extract<Block, { t: 'exercise' }>

/** Every exercise on a page, in reading order (inside rows too). */
export function exercisesOf(blocks: Block[]): Exercise[] {
  return blocks.flatMap(b => (b.t === 'exercise' ? [b] : b.t === 'row' ? b.blocks.flatMap(exercisesOf) : []))
}

/** Exercises are numbered across the book: Exercise 1, 2, 3… */
export function numberExercises(pages: BacPage[]): Map<Block, number> {
  const map = new Map<Block, number>()
  for (const p of pages) for (const e of exercisesOf(p.blocks)) map.set(e, map.size + 1)
  return map
}

/* Answer-key geometry, in px at zoom 1: a page body holds ~1000 px (the page
   may shrink to 0.85 to fit, so 900 leaves room); a key line holds ~100
   characters at 17 px a line; a section heading takes ~40 px. */
const KEY_BUDGET = 900, KEY_LINE = 17, KEY_GAP = 4, KEY_CHARS = 100, KEY_HEAD = 46

/** Section heading of a page in the keys: the mock exams get one each. */
const keyGroup = (p: BacPage) => (p.section === 'exam' ? (p.tag ?? '') : SECTION_NAMES[p.section][0])

/** An answer as printed: "[were / was]" (either word, for the online checker) reads "were / was". */
export const plainAnswer = (a: string) => a.replace(/\[([^\]]+)\]/g, '$1')

/** An open task (an essay plan): no item has a set answer, so it has no key. */
export const isOpen = (e: Exercise) => e.items.every(it => !it.a.trim())

/**
 * The answer keys, as pages: one line per exercise (open tasks left out),
 * grouped under the section it comes from, cut into pages by estimated height.
 */
export function keyPages(body: BacPage[], exNo: Map<Block, number>, pageNoOf: (p: BacPage) => number): BacPage[] {
  type Line = { group: string; label: string; answers: string[] }
  const lines: Line[] = body.flatMap(p => exercisesOf(p.blocks).filter(e => !isOpen(e)).map(e => ({
    group: keyGroup(p), label: `Ex. ${exNo.get(e)} · p. ${pageNoOf(p)}`, answers: e.items.map(it => plainAnswer(it.a)),
  })))
  const height = (l: Line) => Math.ceil(l.answers.reduce((s, a) => s + a.length + 5, 0) / KEY_CHARS) * KEY_LINE + KEY_GAP

  const pages: Block[][] = []
  let blocks: Block[] = [], used = 0, group = ''
  const flush = () => { if (blocks.length) pages.push(blocks); blocks = []; used = 0; group = '' }
  for (const l of lines) {
    const head = l.group !== group ? KEY_HEAD : 0
    if (used + head + height(l) > KEY_BUDGET) flush()
    if (l.group !== group) {
      group = l.group
      blocks.push({ t: 'bar', title: group }, { t: 'key', items: [] })
      used += KEY_HEAD
    }
    const last = blocks[blocks.length - 1]
    if (last.t === 'key') last.items.push({ label: l.label, answers: l.answers })
    used += height(l)
  }
  flush()
  return pages.map((b, i) => page('key', 'Answer key', `Answer key ${i + 1}`, `مفاتيح الحل ${i + 1}/${pages.length}`, b))
}

/** The contents page: every page with its number, by section, in two columns. */
export function contentsPage(body: BacPage[], keys: BacPage[], pageNoOf: (p: BacPage) => number): BacPage {
  const grid = (section: BacSection): Block => {
    const pages = section === 'key' ? keys.slice(0, 1) : body.filter(p => p.section === section && !p.titleEn?.endsWith('(continued)'))
    return {
      t: 'grid', title: `${SECTION_NAMES[section][0]} - ${SECTION_NAMES[section][1]}`,
      rows: pages.map(p => ({
        span: [4, 8, 1.3], size: 11,
        cells: [p.tag ?? '', section === 'key' ? `All the answers (${keys.length} pages)` : p.titleEn ?? '', String(pageNoOf(p))],
      })),
    }
  }
  const col = (sections: BacSection[]) => sections.map(grid)
  return page('contents', 'Contents', 'Contents', 'الفهرس', [
    { t: 'banner', title: 'Contents - الفهرس', icons: ['📚', '🎓'] },
    { t: 'row', widths: '1fr 1fr', blocks: [
      col(['start', 'reading', 'vocab', 'grammar']),
      [...col(['functions', 'writing', 'exam', 'key']),
        { t: 'callout', text: 'كل تمرين مرقّم، وجوابه في مفاتيح الحل آخر الكتاب مع رقم صفحته.' }],
    ] },
  ])
}

/** The whole book in order, with page numbers: contents (1), body, keys. */
export function buildBacPack() {
  const exNo = numberExercises(BAC_BODY)
  // Contents is page 1, so body page i (0-based) is page i + 2.
  const bodyNo = new Map(BAC_BODY.map((p, i) => [p, i + 2]))
  const keys = keyPages(BAC_BODY, exNo, p => bodyNo.get(p) ?? 0)
  const keyNo = new Map(keys.map((p, i) => [p, BAC_BODY.length + 2 + i]))
  const no = (p: BacPage) => bodyNo.get(p) ?? keyNo.get(p) ?? 1
  const contents = contentsPage(BAC_BODY, keys, no)
  const pages = [contents, ...BAC_BODY, ...keys]
  return { pages, exNo, pageNo: (p: BacPage) => pages.indexOf(p) + 1, exercises: exNo.size }
}
