import type { Block, Lesson } from '../level1-book.ts'
import type { L2Unit } from './types.ts'
import { MODULE_1, REVIEW_1 } from './module-1.ts'
import { INDEX, MODULES } from './plan.ts'

/**
 * Level 2 «تكلّم واكتب بدقّة» (A2 → B1) laid out as pages for the Level 1
 * book's renderer, printed from /admin/level2-book.
 *
 * Each unit runs: opener (goals, the four parts, the key sentence) ·
 * useful expressions, two pages (built on the unit's grammar; «Notice» shows
 * how, then «Tip» and «Your turn») · conversation (the grammar printed in the
 * grammar colour, key sentences starred, a plain initial for each speaker;
 * «Find it» sends the student back into it) · grammar, two pages (the rule,
 * the form, «In the conversation», common mistakes of Arabic speakers,
 * practice) · writing, two pages (what to include, useful language, a short
 * example, a longer model with the grammar marked, a template to complete,
 * a checklist). A review closes each module; the answer key closes the book.
 */

export { INDEX, MODULES } from './plan.ts'
export type { L2Unit } from './types.ts'

/** The units written so far, in order. */
export const L2_UNITS: L2Unit[] = [...MODULE_1]
/** Each module's review page, once its units are written. */
const REVIEWS: Record<number, Block[]> = { 1: REVIEW_1 }

export type L2Kind = 'welcome' | 'contents' | 'opener' | 'expressions' | 'talk' | 'grammar' | 'writing' | 'review' | 'key'
export type L2Page = Lesson & { kind: L2Kind; unit?: number; module?: number }

/** The colour key: one colour per kind of section through the book. */
export const L2_TONES = {
  grammar: { m: '#2563EB', s: '#EFF5FF' },
  expr: { m: '#16A34A', s: '#EEFBF2' },
  talk: { m: '#7C3AED', s: '#F4F0FF' },
  writing: { m: '#EA580C', s: '#FFF4EC' },
  practice: { m: '#0D9488', s: '#ECFBF8' },
  brand: { m: '#A16207', s: '#FDF6E3' },
} as const
export type L2Tone = keyof typeof L2_TONES
export const L2_KIND_TONE: Record<L2Kind, L2Tone> = {
  welcome: 'brand', contents: 'brand', opener: 'brand', key: 'brand',
  expressions: 'expr', talk: 'talk', grammar: 'grammar', writing: 'writing', review: 'practice',
}

const pad = (n: number) => String(n).padStart(2, '0')
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Phrases to mark (a unit's grammar in context), longest first. */
export function focusRegex(phrases: string[]): RegExp {
  const sorted = [...new Set(phrases)].sort((a, b) => b.length - a.length)
  return new RegExp(`(?<![A-Za-z'])(?:${sorted.map(p => esc(p).replace(/\s+/g, '\\s+')).join('|')})(?![A-Za-z])`, 'g')
}

/* A reply that would fit almost anything does not make a key sentence. */
const GENERIC = /^(yes|no|sure|of course|ok|okay|certainly|great|thank|thanks|perfect|that's|you're welcome|not yet|here|not really)\b/i
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
/** At most this many key sentences a conversation. */
export const KEY_LINES = 5
/** Conversation lines that use one of the unit's expressions word for word (the first use of each). */
export function keyLines(u: L2Unit): number[] {
  const used = new Set<number>(), out: number[] = []
  u.talk.forEach((l, i) => {
    if (out.length >= KEY_LINES) return
    const said = ` ${norm(l.replace(/^[^:]+:\s/, ''))} `
    const k = u.expressions.findIndex(([q, a], j) => !used.has(j) && [q, a].some(e => {
      const n = norm(e)
      return n.split(' ').length >= 3 && !GENERIC.test(e) && said.includes(` ${n} `)
    }))
    if (k >= 0) { used.add(k); out.push(i) }
  })
  return out
}

/** A conversation on one page: one column up to this many lines, two columns above it; past PAGE_LINES, two pages. */
export const ONE_COLUMN_LINES = 30
export const PAGE_LINES = 38

export function split<T>(list: T[], max: number): T[][] {
  const parts = Math.max(1, Math.ceil(list.length / max))
  const size = Math.ceil(list.length / parts)
  return Array.from({ length: parts }, (_, i) => list.slice(i * size, (i + 1) * size)).filter(p => p.length)
}

export function unitPages(u: L2Unit): L2Page[] {
  const page = (kind: L2Kind, titleEn: string, blocks: Block[]): L2Page =>
    ({ n: u.n, tag: `Unit ${pad(u.n)}`, titleAr: u.titleAr, titleEn: `${u.titleEn} · ${titleEn}`, kind, unit: u.n, module: u.module, blocks })
  const more = (i: number) => (i ? ' (continued)' : '')
  const w = u.writing
  const keys = keyLines(u)
  const talkMark = focusRegex(u.focus)
  const half = Math.ceil(u.expressions.length / 2)

  return [
    page('opener', 'Opener', [
      { t: 'banner', title: `${u.titleEn} - ${u.titleAr}`, icons: u.icons },
      { t: 'callout', text: u.goal },
      { t: 'bar', title: 'In this unit - في هذه الوحدة', icon: '🧩' },
      { t: 'cards', cols: 4, stack: true, items: [
        ['💬', 'Expressions', 'عبارات مفيدة'], ['🗣️', 'Conversation', 'المحادثة'],
        ['📘', u.grammarName, 'القواعد'], ['✍️', w.name, 'الكتابة'],
      ] },
      { t: 'bar', title: 'My goals - أهدافي', icon: '🎯' },
      { t: 'bullets', tick: true, size: 14.5, items: u.canDo.map(([en, ar]) => `I can ${en} - أستطيع أن ${ar}`) },
      { t: 'bar', title: 'Key sentence - جملة الوحدة', icon: '🔑' },
      { t: 'qa', rows: [u.expressions[0]] },
    ]),
    page('expressions', 'Useful expressions', [
      { t: 'bar', title: 'Useful expressions - عبارات مفيدة', icon: '💬', tone: 'expr' },
      { t: 'callout', text: 'اقرأ السؤال وجوابه بصوت مرتفع، ثم غطِّ الجواب وحاول أن تجيب وحدك.' },
      { t: 'phrases', rows: u.expressions.slice(0, half) },
      { t: 'bullets', box: true, section: true, tone: 'grammar', heading: 'Notice - لاحظ 👀', size: 13, items: u.notice },
    ]),
    page('expressions', 'Useful expressions', [
      { t: 'bar', title: 'Useful expressions (continued) - عبارات مفيدة', icon: '💬', tone: 'expr' },
      { t: 'phrases', rows: u.expressions.slice(half), start: half },
      { t: 'bullets', box: true, section: true, tone: 'practice', heading: 'Tip - نصيحة 💡', size: 13, items: u.tip },
      { t: 'bar', title: 'Your turn - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: u.yourTurn },
    ]),
    ...split(u.talk, PAGE_LINES).map((lines, i, all) => {
      const from = all.slice(0, i).reduce((s, p) => s + p.length, 0)
      return page('talk', 'Conversation', [
        { t: 'bar', title: `Conversation${more(i)} - المحادثة`, icon: '🗣️', tone: 'talk' },
        ...(i ? [] : [{ t: 'callout' as const, text: 'اقرأ المحادثة مع صديق، ثم تبادلا الأدوار. القواعد الجديدة بالأزرق، و⭐ أمام الجمل المهمة من العبارات المفيدة.' }]),
        { t: 'script', lines, badges: true, mark: talkMark,
          keys: keys.filter(k => k >= from && k < from + lines.length).map(k => k - from),
          ...(all.length === 1 && lines.length > ONE_COLUMN_LINES ? { cols: 2 as const } : {}) },
        ...(i === all.length - 1 ? [{ t: 'bullets' as const, box: true, section: true, tone: 'practice', heading: 'Find it - ابحث 🔍', size: 13, items: u.findIt }] : []),
      ])
    }),
    ...u.grammar.map((blocks, i) => page('grammar', `Grammar${i ? ' (continued)' : ''}`, blocks)),
    page('writing', 'Writing', [
      { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
      { t: 'sub', text: `${w.name} - ${w.nameAr}` },
      { t: 'callout', text: w.task },
      { t: 'row', widths: '1fr 1fr', stretch: true, blocks: [
        [{ t: 'bullets', box: true, heading: 'What to include - ماذا تكتب', size: 13, items: w.include }],
        [{ t: 'bullets', box: true, heading: 'Useful language - لغة مفيدة', size: 13, items: w.language }],
      ] },
      { t: 'text', label: w.short.label, body: w.short.body, size: 13.5 },
      { t: 'text', label: w.model.label, body: w.model.body, size: 13.5, plain: true, mark: focusRegex(w.focus) },
    ]),
    page('writing', 'Writing', [
      { t: 'bar', title: 'Your turn - دورك', icon: '📝', tone: 'writing' },
      { t: 'callout', text: 'أكمل النص بمعلوماتك أنت. بعد ذلك، أعد كتابته كاملًا على السطور دون النظر إلى النموذج.' },
      { t: 'gapText', label: `${w.name} - ${w.nameAr}`, body: w.template },
      { t: 'bullets', box: true, section: true, tone: 'practice', tick: true, heading: 'Before you finish - قبل أن تنهي ✅', size: 13, items: w.check },
      { t: 'lines', n: 3, grow: true },
    ]),
  ]
}

const front = (kind: L2Kind, tag: string, titleEn: string, titleAr: string, blocks: Block[]): L2Page =>
  ({ n: 0, tag, titleEn, titleAr, kind, blocks })

export const WELCOME: L2Page = front('welcome', 'Welcome', 'Welcome', 'مرحبًا بك', [
  { t: 'banner', title: 'Welcome to Level 2 - مرحبًا بك في المستوى الثاني', icons: ['👋', '📗'] },
  { t: 'callout', text: 'في هذا الكتاب تنتقل من مستوى A2 إلى B1: تتكلّم بثقة في مواقف الحياة والعمل، وتكتب رسائل وفقرات واضحة، وتتعلّم القواعد داخل الكلام وليس بعيدًا عنه.' },
  { t: 'bar', title: 'Inside every unit - داخل كل وحدة', icon: '🧩' },
  { t: 'boxes', cols: 2, items: [
    { title: '💬 Useful expressions', lines: ['جمل حقيقية للموقف، مبنية على قاعدة الوحدة.'] },
    { title: '🗣️ Conversation', lines: ['محادثة طبيعية تظهر فيها القاعدة بالأزرق.'] },
    { title: '📘 Grammar', lines: ['القاعدة في صفحتين: الشرح، التركيب، الأخطاء الشائعة، والتمارين.'] },
    { title: '✍️ Writing', lines: ['شرح، مثال قصير، نموذج أطول، ثم نص تكمله بمعلوماتك أنت.'] },
  ] },
  { t: 'bar', title: 'How to study a unit - كيف تدرس الوحدة', icon: '🧠' },
  { t: 'bullets', size: 13.5, items: [
    'Read the expressions out loud, then cover the answers. - اقرأ العبارات بصوت مرتفع ثم غطِّ الأجوبة.',
    'Read the conversation with a partner. Look at the blue words. - اقرأ المحادثة مع زميل وانتبه إلى الكلمات الزرقاء.',
    'Study the grammar page, then do the practice without looking. - ادرس القاعدة ثم حلّ التمارين دون النظر.',
    'Complete the writing template, then write it again on your own. - أكمل نموذج الكتابة ثم أعد كتابته وحدك.',
    'Check your answers in the answer key at the back. - صحّح أجوبتك في آخر الكتاب.',
  ] },
  { t: 'bar', title: 'The colours of the book - ألوان الكتاب', icon: '🎨' },
  { t: 'cards', cols: 5, stack: true, items: [
    ['💬', 'Expressions', 'أخضر'], ['🗣️', 'Conversation', 'بنفسجي'], ['📘', 'Grammar', 'أزرق'], ['✍️', 'Writing', 'برتقالي'], ['✏️', 'Practice', 'فيروزي'],
  ] },
])

/** Every page in book order, the contents and the answer key built from it. */
export function buildLevel2Book() {
  const units = L2_UNITS.map(u => ({ u, pages: unitPages(u) }))
  const reviews = new Map<number, L2Page>()
  for (const [m, blocks] of Object.entries(REVIEWS)) {
    const mod = Number(m)
    reviews.set(mod, { n: 0, tag: `Review ${mod}`, titleEn: `Review ${mod}`, titleAr: 'مراجعة', kind: 'review', module: mod, blocks })
  }
  const body: L2Page[] = units.flatMap(({ u, pages }) => {
    const last = !L2_UNITS.some(x => x.module === u.module && x.n > u.n)
    const r = reviews.get(u.module)
    return last && r && INDEX.filter(x => x.module === u.module).every(x => L2_UNITS.some(y => y.n === x.n)) ? [...pages, r] : pages
  })
  const firstBody = 3   // welcome 1, contents 2
  const at = (p: L2Page) => firstBody + body.indexOf(p)
  const startOf = new Map(units.map(({ u, pages }) => [u.n, at(pages[0])]))

  const exNo = new Map<Block, number>()
  for (const p of body) for (const b of p.blocks) if (b.t === 'exercise') exNo.set(b, exNo.size + 1)
  const keyItems = body.flatMap(p => p.blocks.flatMap(b => (b.t === 'exercise'
    ? [{ label: `Ex. ${exNo.get(b)} · p. ${at(p)}`, answers: b.items.map(it => it.a) }] : [])))
  const keyAt = firstBody + body.length
  const keyPages: L2Page[] = split(keyItems, 14).map((items, i) => front('key', 'Answer key', `Answer key${i ? ' (continued)' : ''}`, 'الأجوبة', [
    ...(i ? [] : [{ t: 'banner' as const, title: 'Answer key - الأجوبة', icons: ['🔑', '✅'] as [string, string] }]),
    { t: 'key', items },
  ]))

  const span = [0.7, 2.6, 2.4, 2.3, 0.7]
  const contents = front('contents', 'Contents', 'Contents', 'محتويات الكتاب', [
    { t: 'banner', title: 'Contents - محتويات الكتاب', icons: ['📚', '🗺️'] },
    { t: 'grid', rows: [
      { dark: true, span, cells: ['Unit', 'Topic', 'Grammar', 'Writing', 'Page'] },
      ...MODULES.flatMap(m => {
        const review = reviews.get(m.n)
        const reviewPage = review && body.includes(review) ? at(review) : null
        return [
          { plain: true, span: [10.7], size: 13, cells: [`Module ${m.n} · ${m.titleEn} - ${m.titleAr}`] },
          ...INDEX.filter(x => x.module === m.n).map(x => ({ span, size: 12.5, cells: [pad(x.n), x.titleEn, x.grammar, x.writing, startOf.has(x.n) ? String(startOf.get(x.n)) : '—'] })),
          { span, size: 12.5, cells: ['🔁', `Review ${m.n}`, `Units ${(m.n - 1) * 4 + 1}–${m.n * 4}`, '', reviewPage ? String(reviewPage) : '—'] },
        ]
      }),
      { plain: true, span: [10.7], size: 13, cells: [`🔑 Answer key · p. ${keyAt}`] },
    ] },
  ])

  const pages: L2Page[] = [WELCOME, contents, ...body, ...keyPages]
  return {
    pages,
    exNo,
    pageNo: (p: L2Page) => pages.indexOf(p) + 1,
    stats: { units: INDEX.length, written: L2_UNITS.length, exercises: exNo.size },
  }
}
