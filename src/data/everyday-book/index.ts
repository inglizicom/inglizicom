import type { Block, Lesson } from '../level1-book.ts'
import type { EverydayUnit } from './types.ts'
import { UNITS_1_7 } from './units-1.ts'
import { UNITS_8_13 } from './units-2.ts'
import { UNITS_14_19 } from './units-3.ts'

/**
 * The textbook «الإنجليزية للمواقف اليومية» laid out as pages for the Level 1
 * book's renderer (app/admin/level1-book/_blocks.tsx), printed from
 * /admin/everyday-book.
 *
 * Each unit runs: opener (its goals, key phrase and tip; drawn by the admin
 * page) · vocabulary (a photograph per word, at most twelve a page) · useful
 * expressions (a question / answer table) · conversation (a script; past 38 lines it is split evenly over two
 * pages, the second closing with a role-play box) · reading + «Make it
 * yours». The welcome, how-to-use, contents and progress pages come first,
 * the A–Z word list last; the cover, the «why this book» page, the
 * thank-you page, the certificate, the closing call to action and the back
 * cover are drawn by the admin page itself.
 */

export type { EverydayUnit } from './types.ts'
export { OPENERS, type UnitOpener } from './openers.ts'
export const EVERYDAY_UNITS: EverydayUnit[] = [...UNITS_1_7, ...UNITS_8_13, ...UNITS_14_19]

export type EverydayKind = 'welcome' | 'howto' | 'contents' | 'progress' | 'opener' | 'vocab' | 'expressions' | 'talk' | 'reading' | 'wordlist'
/** One line of the word list: the word, its meaning, and every unit it is taught in. */
export type WordEntry = { en: string; ar: string; units: number[] }
export type EverydayPage = Lesson & { kind: EverydayKind; unit?: number; words?: WordEntry[] }

const pad = (n: number) => String(n).padStart(2, '0')

/** Cut a list into the fewest parts of at most `max`, as even as possible. */
export function split<T>(list: T[], max: number): T[][] {
  const parts = Math.max(1, Math.ceil(list.length / max))
  const size = Math.ceil(list.length / parts)
  return Array.from({ length: parts }, (_, i) => list.slice(i * size, (i + 1) * size)).filter(p => p.length)
}

/* Page capacities, measured on the rendered A4 page (one page reads at zoom ≥ 0.9). */
export const VOCAB_PER_PAGE = 12
export const EXPRESSIONS_PER_PAGE = 16
export const LINES_PER_PAGE = 38

/** A word's file name: "Wi-Fi password" → wi-fi-password, "for here / to go" → for-here-to-go. */
export const photoSlug = (en: string) => en.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** The word's photograph, from the author's course pictures (public/everyday-book/vocab). */
export const photoOf = (unit: number, en: string) => `/everyday-book/vocab/u${pad(unit)}/${photoSlug(en)}.webp`

/** The book's «Speak» step, closing a conversation that runs over two pages. */
const ROLE_PLAY: Block = { t: 'bullets', box: true, heading: 'Role-play - مثّل الدور 🎭', size: 13, items: [
  'Read the conversation with a partner. - اقرأ المحادثة مع شريك.',
  'Swap roles and read it again. - تبادلا الأدوار واقرآها مرة أخرى.',
  'Act it out without reading, and change some details: names, prices, times. - مثّلاها دون قراءة، وغيّرا بعض التفاصيل: الأسماء، الأسعار، الأوقات.',
] }

export function unitPages(u: EverydayUnit): EverydayPage[] {
  const page = (kind: EverydayKind, titleEn: string, blocks: Block[]): EverydayPage =>
    ({ n: u.n, tag: `Unit ${pad(u.n)}`, titleAr: u.titleAr, titleEn: `${u.titleEn} · ${titleEn}`, kind, unit: u.n, blocks })
  const more = (i: number) => (i ? ' (continued)' : '')

  return [
    page('opener', 'Opener', []),
    // Photographs need room: twelve words a page at most, split evenly (17 → 9 + 8).
    ...split(u.vocab, VOCAB_PER_PAGE).map((items, i, all) => {
      const start = all.slice(0, i).reduce((s, p) => s + p.length, 0)
      return page('vocab', 'Vocabulary', [
        ...(i ? [] : [{ t: 'banner' as const, title: `${u.titleEn} - ${u.titleAr}`, icons: u.icons }, { t: 'callout' as const, text: u.goal }]),
        { t: 'bar', title: `Vocabulary${more(i)} - المفردات`, icon: '📚' },
        { t: 'tiles', items, cols: 3, start, photos: items.map(([, en]) => photoOf(u.n, en)) },
      ])
    }),
    ...split(u.expressions, EXPRESSIONS_PER_PAGE).map((rows, i, all) => page('expressions', 'Useful expressions', [
      { t: 'bar', title: `Useful expressions${more(i)} - عبارات مفيدة`, icon: '💬' },
      ...(i ? [] : [{ t: 'callout' as const, text: 'اقرأ السؤال وجوابه بصوت مرتفع، ثم غطِّ عمود الأجوبة وحاول أن تجيب وحدك.' }]),
      { t: 'phrases', rows, start: all.slice(0, i).reduce((s, p) => s + p.length, 0) },
    ])),
    ...split(u.talk, LINES_PER_PAGE).map((lines, i, all) => page('talk', 'Conversation', [
      { t: 'bar', title: `Conversation${more(i)} - المحادثة`, icon: '🗣️' },
      ...(i ? [] : [{ t: 'callout' as const, text: 'اقرأ المحادثة مع صديق: كل واحد يأخذ دورًا، ثم تبادلا الأدوار.' }]),
      { t: 'script', lines },
      ...(all.length > 1 && i === all.length - 1 ? [ROLE_PLAY] : []),
    ])),
    page('reading', 'Reading', [
      { t: 'bar', title: 'Reading - القراءة', icon: '📖' },
      { t: 'text', label: u.reading.title, body: u.reading.body.join('\n'), size: 13.5 },
      { t: 'bar', title: 'Make it yours - اجعلها خاصة بك', icon: '✍️' },
      { t: 'bullets', items: u.yours, size: 13 },
      { t: 'lines', n: 5 },
    ]),
  ]
}

const front = (kind: EverydayKind, tag: string, titleEn: string, titleAr: string, blocks: Block[]): EverydayPage =>
  ({ n: 0, tag, titleEn, titleAr, kind, blocks })

export const WELCOME: EverydayPage = front('welcome', 'Welcome', 'Welcome', 'مرحبًا بك', [
  { t: 'banner', title: 'Welcome - مرحبًا بك', icons: ['👋', '📘'] },
  { t: 'callout', text: 'هذا الكتاب صُمّم ليساعدك على استعمال الإنجليزية في مواقف الحياة اليومية بثقة أكبر. لن تكتفي بحفظ الكلمات، بل ستتعلّم كيف تفهم، وكيف تردّ، وكيف تتكلّم الإنجليزية بشكل طبيعي في مواقف حقيقية.' },
  { t: 'bar', title: 'Your learning path - طريقك في التعلّم', icon: '🧭' },
  { t: 'boxes', cols: 1, items: [
    { title: '1 · LEARN - تعلّم', lines: ['تعلّم الكلمات والعبارات التي تحتاجها في حياتك اليومية.'] },
    { title: '2 · LISTEN - استمع', lines: ['انتبه إلى طريقة نطق الجمل وكيف تبدو الإنجليزية الطبيعية.'] },
    { title: '3 · PRACTICE - طبّق', lines: ['استعمل ما تعلّمته في محادثات ومواقف بسيطة.'] },
    { title: '4 · SPEAK - تكلّم', lines: ['تدرّب على الكلام واستعمل العبارات في محادثات حقيقية.'] },
    { title: '5 · MAKE IT YOURS - اجعلها خاصة بك', lines: ['غيّر الأمثلة وتحدّث عن حياتك وروتينك وخططك وتجاربك.'] },
  ] },
  { t: 'bar', title: 'A suggested plan - خطة مقترحة', icon: '🗓️' },
  { t: 'cards', cols: 4, stack: true, items: [
    ['📚', 'Day 1 · Vocabulary', 'اليوم 1: المفردات'],
    ['💬', 'Day 2 · Expressions', 'اليوم 2: العبارات'],
    ['🗣️', 'Day 3 · Conversation', 'اليوم 3: المحادثة'],
    ['📖', 'Day 4 · Reading', 'اليوم 4: القراءة'],
  ] },
  { t: 'callout', text: 'وحدة واحدة في الأسبوع، ربع ساعة في اليوم: بعد 19 أسبوعًا تتكلّم في 19 موقفًا من حياتك اليومية.' },
  { t: 'bar', title: 'Your goal - هدفك', icon: '🎯' },
  { t: 'bullets', size: 14, items: ["Don't just understand English. Know what to say and when to say it. - لا تكتفِ بفهم الإنجليزية، تعلّم ماذا تقول ومتى تقوله."] },
])

export const HOW_TO: EverydayPage = front('howto', 'How to use', 'How to use this book', 'كيف تستعمل الكتاب', [
  { t: 'banner', title: 'Inside every unit - داخل كل وحدة', icons: ['🗂️', '✨'] },
  { t: 'boxes', cols: 2, items: [
    { title: '📚 Vocabulary - المفردات', lines: ['أهم كلمات الموقف، كل كلمة مع صورتها وترجمتها.'] },
    { title: '💬 Useful expressions - عبارات مفيدة', lines: ['ماذا تقول في الموقف، وكيف تردّ بطريقة طبيعية.'] },
    { title: '🗣️ Conversation - المحادثة', lines: ['الكلمات والعبارات داخل محادثة حقيقية تقرؤها مع صديق.'] },
    { title: '📖 Reading - القراءة', lines: ['نصّ قصير يجمع كل ما تعلّمته في سياق طبيعي.'] },
  ] },
  { t: 'boxes', cols: 1, items: [
    { title: '✍️ Make it yours - اجعلها خاصة بك', lines: ['ثلاث مهام في آخر كل وحدة: تكلّم عن حياتك أنت، ثم اكتب جملك بنفسك.'] },
  ] },
  { t: 'bar', title: 'How to study a unit - كيف تدرس الوحدة', icon: '🧠' },
  { t: 'bullets', size: 13.5, items: [
    'Read each word out loud and look at its picture. - اقرأ كل كلمة بصوت مرتفع وانظر إلى صورتها.',
    'Cover the answers and try to reply alone. - غطِّ الأجوبة وحاول أن تردّ وحدك.',
    'Read the conversation with a friend, then swap roles. - اقرأ المحادثة مع صديق ثم تبادلا الأدوار.',
    'Speak without reading, and record yourself if you can. - تكلّم دون قراءة، وسجّل صوتك إن أمكن.',
    'Write your own sentences in the «Make it yours» lines. - اكتب جملك الخاصة في سطور «اجعلها خاصة بك».',
  ] },
  // A box, not a callout: "English - عربي" is printed as two lines, a callout would mix them on one.
  { t: 'bullets', box: true, size: 14, items: ["You don't need to memorize everything. Use it, repeat it, and make it yours. - لا تحتاج إلى حفظ كل شيء: استعمل ما تتعلّمه، كرّره، واجعله جزءًا من لغتك."] },
])

/* The word list's alphabetical key: "a missed call" files under M, "to go" under G. */
export const sortKey = (en: string) => en.toLowerCase().replace(/^(a|an|the|to)\s+/, '').replace(/[^a-z0-9 ]/g, '')

/** Every vocabulary word of the book, A to Z, a word taught twice listed once with both units. */
export function wordList(units: EverydayUnit[] = EVERYDAY_UNITS): WordEntry[] {
  const byWord = new Map<string, WordEntry>()
  for (const u of units) {
    for (const [, en, ar] of u.vocab) {
      const key = en.toLowerCase()
      const seen = byWord.get(key)
      if (!seen) byWord.set(key, { en, ar, units: [u.n] })
      else if (!seen.units.includes(u.n)) seen.units.push(u.n)
    }
  }
  return [...byWord.values()].sort((a, b) => sortKey(a.en).localeCompare(sortKey(b.en)) || a.en.localeCompare(b.en))
}
/** Word list lines per page (three columns; measured on the rendered page). */
export const WORDS_PER_PAGE = 126

const PROGRESS = front('progress', 'Progress', 'My progress', 'تقدّمي', [])

/** Every page in book order with its number (Welcome is page 1). */
export function buildEverydayBook() {
  const units = EVERYDAY_UNITS.map(u => ({ u, pages: unitPages(u) }))
  const firstUnitPage = 5   // welcome 1, how to use 2, contents 3, progress 4
  let next = firstUnitPage
  const startOf = new Map<number, number>()
  for (const { u, pages } of units) { startOf.set(u.n, next); next += pages.length }
  const words = split(wordList(), WORDS_PER_PAGE).map((list, i) =>
    ({ ...front('wordlist', 'Word list', `Word list A–Z${i ? ' (continued)' : ''}`, 'قائمة الكلمات', []), words: list }))
  const span = [1.1, 3.4, 3.4, 0.9]
  const contents = front('contents', 'Contents', 'Contents', 'محتويات الكتاب', [
    { t: 'banner', title: 'Contents - محتويات الكتاب', icons: ['📚', '🗺️'] },
    { t: 'grid', rows: [
      { dark: true, span, cells: ['Unit', 'Situation', 'الموقف', 'Page'] },
      { plain: true, span, size: 13.5, cells: ['', '✅  My progress', 'تقدّمي', String(firstUnitPage - 1)] },
      ...EVERYDAY_UNITS.map(u => ({ span, size: 13.5, cells: [pad(u.n), `${u.icons[0]}  ${u.titleEn}`, u.titleAr, String(startOf.get(u.n))] })),
      { plain: true, span, size: 13.5, cells: ['', '🔤  Word list A–Z', 'قائمة الكلمات', String(next)] },
    ] },
    { t: 'bar', title: 'In every unit - في كل وحدة', icon: '🧩' },
    { t: 'cards', cols: 5, stack: true, items: [
      ['📚', 'Vocabulary', 'المفردات'], ['💬', 'Expressions', 'عبارات مفيدة'], ['🗣️', 'Conversation', 'المحادثة'],
      ['📖', 'Reading', 'القراءة'], ['✍️', 'Make it yours', 'اجعلها خاصة بك'],
    ] },
  ])
  const pages: EverydayPage[] = [WELCOME, HOW_TO, contents, PROGRESS, ...units.flatMap(x => x.pages), ...words]
  return {
    pages,
    pageNo: (p: EverydayPage) => pages.indexOf(p) + 1,
    /** The unit's first page of each kind (for its opener's «in this unit»). */
    unitPage: (n: number, kind: EverydayKind) => pages.findIndex(p => p.unit === n && p.kind === kind) + 1,
    stats: {
      units: EVERYDAY_UNITS.length,
      // Different words, as the word list counts them: a word taught in two units is one word.
      words: wordList().length,
      expressions: EVERYDAY_UNITS.reduce((s, u) => s + u.expressions.length, 0),
      lines: EVERYDAY_UNITS.reduce((s, u) => s + u.talk.length, 0),
    },
  }
}
