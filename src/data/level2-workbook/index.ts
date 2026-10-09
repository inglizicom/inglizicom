import type { Block } from '../level1-book.ts'
import { INDEX, L2_UNITS, MODULES, mixed, type L2Page, type L2Kind, type L2Unit } from '../level2-book/index.ts'
import { complete } from '../level2-book/helpers.ts'
import type { L2WorkUnit } from './types.ts'
import { fromBank, match } from './helpers.ts'
import { TEST_1, WORK_1 } from './module-1.ts'

/**
 * The Level 2 workbook «تكلّم واكتب بدقّة — دفتر التمارين», printed from
 * /admin/level2-workbook with the textbook's renderer and colour key.
 *
 * Six pages a unit, in the order of the textbook's study week (the planner):
 * words (day 1) · expressions and the conversation (days 2–3) · grammar, two
 * pages (day 4) · writing skills and the plan, then the text itself with a
 * box for the teacher's feedback (day 6). The words and expressions pages
 * are built from the unit (its vocabulary, its conversation, its
 * expressions), so they always match the book; grammar and writing are
 * written for the workbook (module-N.ts). A test closes each module and the
 * answer key closes the workbook. Units appear as their textbook unit and
 * their workbook unit are both written.
 */

export const WORK_UNITS: L2WorkUnit[] = [...WORK_1]
const TESTS: Record<number, [Block[], Block[]]> = { 1: TEST_1 }

const pad = (n: number) => String(n).padStart(2, '0')
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** The first item of each list, then the second of each…: words from every theme. */
const roundRobin = <T>(lists: T[][]): T[] => Array.from({ length: Math.max(0, ...lists.map(l => l.length)) }, (_, i) => lists.flatMap(l => (i < l.length ? [l[i]] : []))).flat()
/** n items spread evenly through a list. */
const spread = <T>(list: T[], n: number): T[] => (list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor((i * list.length) / n)]))
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean)

type Word = [en: string, ar: string, example: string]
const wordIn = (w: Word) => new RegExp(`(?<![A-Za-z'])${esc(w[0])}(?![A-Za-z])`, 'i')
/** A word whose example says it as it is (not "colleagues" for "colleague"), so it can be blanked. */
const blankable = (w: Word) => !w[0].includes('…') && wordIn(w).test(w[2])

/** Words: match each word to its meaning, complete examples from a box, then use three words about yourself. */
export function wordsBlocks(u: L2Unit): Block[] {
  const groups = u.vocab.groups.map(g => g.words)
  const toMatch = roundRobin(groups).slice(0, 8)
  const used = new Set(toMatch.map(w => w[0]))
  const toBlank = roundRobin(groups.map(ws => ws.filter(w => !used.has(w[0]) && blankable(w)))).slice(0, 6)
  for (const w of toBlank) used.add(w[0])
  const toUse = roundRobin(groups.map(ws => ws.filter(w => !used.has(w[0])))).slice(0, 3)
  return [
    match('Words and meanings', 'Write the letter of the meaning. - اكتب حرف المعنى المناسب.', toMatch.map(([en, ar]) => [en, ar]), 2),
    fromBank('Complete the sentences', 'Use the words in the box. - استعمل الكلمات التي في الإطار.',
      toBlank.map(w => [w[2].replace(wordIn(w), '___'), w[0]])),
    { t: 'bar', title: 'Use the words - استعمل الكلمات', icon: '🗝️', tone: 'practice' },
    { t: 'answers', items: toUse.map(([en]) => `Write a sentence about you with "${en}".`) },
  ]
}

interface Line { who: string; said: string }
const lineOf = (l: string): Line => {
  const m = l.match(/^([^:]+):\s(.*)$/)
  return m ? { who: m[1], said: m[2] } : { who: '', said: l }
}
const nameOf = (who: string) => who.charAt(0) + who.slice(1).toLowerCase()

/**
 * Expressions: questions of the conversation matched to their replies; six
 * lines of it to put back in order; what you say in English (the unit's
 * expressions from the Arabic).
 */
export function expressionsBlocks(u: L2Unit, w: L2WorkUnit): Block[] {
  const talk = u.talk.map(lineOf)
  const inOrder = new Set(Array.from({ length: 6 }, (_, i) => w.orderFrom + i))
  const pairs: [string, string][] = []
  talk.forEach((l, i) => {
    const next = talk[i + 1]
    if (!next || next.who === l.who || inOrder.has(i) || inOrder.has(i + 1) || !l.said.endsWith('?')) return
    const q = sentences(l.said).at(-1)!
    // The reply, without the question it may end with ("… What about you?").
    const reply = sentences(next.said)
    while (reply.length && reply.at(-1)!.endsWith('?')) reply.pop()
    // A question that could go with any reply ("What about you?") cannot be matched.
    if (q.split(' ').length < 3 || /^(and )?what about you\?$/i.test(q) || !reply.length) return
    pairs.push([q, reply.slice(0, 2).join(' ')])
  })
  const order = talk.slice(w.orderFrom, w.orderFrom + 6).map(l => `${nameOf(l.who)}: ${l.said}`)
  const say: [string, string][] = u.ladder
    ? spread(u.ladder.steps.flatMap(s => s.phrases), 6).map(([en, ar]) => [ar, en])
    : spread(u.expressions, 6).map(([q, a, qAr, aAr], i) => (i % 2 ? [aAr, a] : [qAr, q]))
  return [
    match('Questions and answers', 'They are from the conversation. Write the letter of the answer. - اكتب حرف الجواب المناسب من المحادثة.', spread(pairs, 5)),
    { t: 'exercise', title: 'Put the conversation in order', instr: 'Number the lines from 1 to 6. - رقّم الأسطر حسب ترتيبها في المحادثة.', size: 13.5,
      items: mixed(order).map(line => ({ q: `___ ${line}`, a: String(order.indexOf(line) + 1) })) },
    complete('What do you say in English?', 'Write the sentence in English. - اكتب الجملة بالإنجليزية.', say, 1, true),
  ]
}

const front = (kind: L2Kind, tag: string, titleEn: string, titleAr: string, blocks: Block[]): L2Page =>
  ({ n: 0, tag, titleEn, titleAr, kind, blocks })

/** A unit's six pages. */
export function workPages(u: L2Unit, w: L2WorkUnit): L2Page[] {
  const page = (kind: L2Kind, titleEn: string, blocks: Block[]): L2Page =>
    ({ n: u.n, tag: `Unit ${pad(u.n)}`, titleAr: u.titleAr, titleEn: `${u.titleEn} · ${titleEn}`, kind, unit: u.n, module: u.module, blocks })
  const g = `Grammar · ${u.grammarName} - القواعد`
  const wr = u.writing
  return [
    page('vocab', 'Words', [
      { t: 'banner', title: `${u.titleEn} - ${u.titleAr}`, icons: u.icons },
      { t: 'bar', title: 'Words - الكلمات', icon: '🔤', tone: 'vocab' },
      ...wordsBlocks(u),
    ]),
    page('expressions', 'Expressions', [
      { t: 'bar', title: 'Expressions and conversation - العبارات والمحادثة', icon: '💬', tone: 'expr' },
      ...expressionsBlocks(u, w),
    ]),
    page('grammar', 'Grammar', [{ t: 'bar', title: g, icon: '📘', tone: 'grammar' }, ...w.grammar[0]]),
    page('grammar', 'Grammar', [
      { t: 'bar', title: `Grammar (continued) - القواعد`, icon: '📘', tone: 'grammar' },
      ...w.grammar[1],
      { t: 'bar', title: 'About you - عنك', icon: '🙋', tone: 'practice' },
      { t: 'answers', items: w.aboutYou },
    ]),
    page('writing', 'Writing skills', [
      { t: 'bar', title: 'Writing skills - مهارات الكتابة', icon: '🧰', tone: 'writing' },
      ...w.writing,
      { t: 'bar', title: 'Plan your text - خطّط لنصّك', icon: '🗺️', tone: 'writing' },
      { t: 'answers', items: w.plan },
    ]),
    page('writing', 'Write', [
      { t: 'bar', title: `Write: ${wr.name} - اكتب`, icon: '✍️', tone: 'writing' },
      { t: 'callout', text: `${wr.task} استعمل خطّتك في الصفحة السابقة، ثم أرسل نصّك إلى أستاذك أو المساعد.` },
      { t: 'lines', n: 12, grow: true },
      { t: 'bullets', box: true, section: true, tone: 'practice', tick: true, heading: 'Before you send it - قبل أن ترسله ✅', size: 13, items: wr.check },
      { t: 'gapText', label: "Teacher's feedback - ملاحظات الأستاذ 🧑‍🏫", size: 13.5, body: 'Date: ___\nScore: ___ / 10\nWell done: ___\nTo improve: ___\nSignature: ___' },
    ]),
  ]
}

const WELCOME: L2Page = front('welcome', 'Workbook', 'How to use this workbook', 'كيف تستعمل الدفتر', [
  { t: 'banner', title: 'Your workbook - دفتر التمارين', icons: ['✏️', '📗'] },
  { t: 'callout', text: 'هذا الدفتر يرافق كتاب «تكلّم واكتب بدقّة». لكل وحدة في الكتاب ست صفحات هنا: تمارين جديدة على الكلمات والعبارات والقواعد، ثم نصّ تكتبه أنت ويصحّحه أستاذك.' },
  { t: 'bar', title: 'Six pages for each unit - ست صفحات لكل وحدة', icon: '🧩' },
  { t: 'cards', cols: 6, stack: true, items: [
    ['🔤', 'Words', 'الكلمات'], ['💬', 'Expressions', 'العبارات'], ['📘', 'Grammar', 'القواعد'], ['📘', 'Grammar', 'القواعد'], ['🧰', 'Writing skills', 'مهارات الكتابة'], ['✍️', 'Write', 'اكتب'],
  ] },
  { t: 'bar', title: 'When to do each page - متى تنجز كل صفحة', icon: '🗓️' },
  { t: 'grid', rows: [
    { dark: true, span: [1.2, 2.4, 2.4], cells: ['Day', 'In the book', 'In the workbook'] },
    { span: [1.2, 2.4, 2.4], size: 13, cells: ['Day 1', 'Video and words', 'Words'] },
    { span: [1.2, 2.4, 2.4], size: 13, cells: ['Days 2–3', 'Expressions, conversation', 'Expressions'] },
    { span: [1.2, 2.4, 2.4], size: 13, cells: ['Day 4', 'Grammar', 'Grammar, two pages'] },
    { span: [1.2, 2.4, 2.4], size: 13, cells: ['Day 5', 'Live class', 'Bring your questions'] },
    { span: [1.2, 2.4, 2.4], size: 13, cells: ['Day 6', 'Writing', 'Writing skills, then write'] },
  ] },
  { t: 'bar', title: 'How to correct your work - كيف تصحّح عملك', icon: '✅' },
  { t: 'bullets', size: 13.5, items: [
    'Do the exercises without looking at the book. - أنجز التمارين دون النظر إلى الكتاب.',
    'Check your answers in the answer key at the back, with a red pen. - صحّح أجوبتك بقلم أحمر في آخر الدفتر.',
    'Send your text to your teacher or assistant. They write their feedback in the box. - أرسل نصّك إلى أستاذك أو المساعد ليكتب ملاحظاته في الإطار.',
    'One week later, do your wrong answers again. - بعد أسبوع، أعد الأجوبة الخاطئة من جديد.',
  ] },
  { t: 'bar', title: 'The same colours as the book - ألوان الكتاب نفسها', icon: '🎨' },
  { t: 'cards', cols: 5, stack: true, items: [
    ['🔤', 'Words', 'وردي'], ['💬', 'Expressions', 'أخضر'], ['📘', 'Grammar', 'أزرق'], ['✍️', 'Writing', 'برتقالي'], ['✏️', 'Practice', 'فيروزي'],
  ] },
])

/**
 * The answer key's pages, filled by the room each exercise takes (its answers
 * run on, about 90 characters a printed line), not by a count: a key of
 * sentences needs more room than a key of letters.
 */
function packKey<T extends { answers: string[] }>(items: T[], first = 46, rest = 52): T[][] {
  const pages: T[][] = [[]]
  let room = first
  for (const it of items) {
    const lines = 1 + Math.ceil(it.answers.join(' · ').length / 90)
    if (lines > room && pages.at(-1)!.length) { pages.push([]); room = rest }
    pages.at(-1)!.push(it)
    room -= lines
  }
  return pages
}

/** Every page in order, with the contents and the answer key built from it. */
export function buildLevel2Workbook() {
  const units = L2_UNITS.flatMap(u => {
    const w = WORK_UNITS.find(x => x.n === u.n)
    return w ? [{ u, pages: workPages(u, w) }] : []
  })
  const tests = new Map<number, L2Page[]>()
  for (const [m, pages] of Object.entries(TESTS)) {
    const mod = Number(m)
    tests.set(mod, pages.map(blocks => front('review', `Test ${mod}`, `Module ${mod} test`, 'اختبار', blocks)).map(p => ({ ...p, module: mod })))
  }
  const body: L2Page[] = units.flatMap(({ u, pages }) => {
    const last = !units.some(x => x.u.module === u.module && x.u.n > u.n)
    const all = INDEX.filter(x => x.module === u.module).every(x => units.some(y => y.u.n === x.n))
    return last && all && tests.has(u.module) ? [...pages, ...tests.get(u.module)!] : pages
  })
  const firstBody = 3   // how to use 1, contents 2
  const at = (p: L2Page) => firstBody + body.indexOf(p)
  const startOf = new Map(units.map(({ u, pages }) => [u.n, at(pages[0])]))

  const exNo = new Map<Block, number>()
  for (const p of body) for (const b of p.blocks) if (b.t === 'exercise') exNo.set(b, exNo.size + 1)
  const keyItems = body.flatMap(p => p.blocks.flatMap(b => (b.t === 'exercise'
    ? [{ label: `Ex. ${exNo.get(b)} · p. ${at(p)}`, answers: b.items.map(it => it.a) }] : [])))
  const keyAt = firstBody + body.length
  const keyPages: L2Page[] = packKey(keyItems).map((items, i) => front('key', 'Answer key', `Answer key${i ? ' (continued)' : ''}`, 'الأجوبة', [
    ...(i ? [] : [{ t: 'banner' as const, title: 'Answer key - الأجوبة', icons: ['🔑', '✅'] as [string, string] }]),
    { t: 'key', items },
  ]))

  const span = [0.7, 2.8, 2.8, 0.7]
  const contents = front('contents', 'Contents', 'Contents', 'محتويات الدفتر', [
    { t: 'banner', title: 'Contents - محتويات الدفتر', icons: ['📚', '✏️'] },
    { t: 'grid', rows: [
      { dark: true, span, cells: ['Unit', 'Topic', 'Grammar', 'Page'] },
      ...MODULES.flatMap(m => {
        const test = tests.get(m.n)
        const testPage = test && body.includes(test[0]) ? at(test[0]) : null
        return [
          { plain: true, span: [7], size: 13, cells: [`Module ${m.n} · ${m.titleEn} - ${m.titleAr}`] },
          ...INDEX.filter(x => x.module === m.n).map(x => ({ span, size: 12.5, cells: [pad(x.n), x.titleEn, x.grammar, startOf.has(x.n) ? String(startOf.get(x.n)) : '—'] })),
          { span, size: 12.5, cells: ['🏁', `Module ${m.n} test`, `Units ${(m.n - 1) * 4 + 1}–${m.n * 4}`, testPage ? String(testPage) : '—'] },
        ]
      }),
      { plain: true, span: [7], size: 13, cells: [`🔑 Answer key · p. ${keyAt}`] },
    ] },
  ])

  const pages: L2Page[] = [WELCOME, contents, ...body, ...keyPages]
  return {
    pages,
    exNo,
    pageNo: (p: L2Page) => pages.indexOf(p) + 1,
    stats: { units: INDEX.length, written: units.length, exercises: exNo.size },
  }
}
