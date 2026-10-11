import type { Block, Lesson } from '../level1-book.ts'
import { lessonPages, type VKind } from '../level1-vocab/book.ts'
import { packKey } from '../level2-book/index.ts'
import { LEVEL2_VOCAB, type L2VocabBookUnit } from './index.ts'

/**
 * The Level 2 extended vocabulary book laid out as pages for the course
 * book's renderer (app/admin/level1-book/_blocks.tsx), the same frame and
 * colour key as the Level 1 vocabulary book, one step up:
 *
 * Six pages a unit, always in this order, each with its colour:
 *   1 Picture words (red)   — ten picture tiles, then each word in a sentence
 *   2 Word groups (green)   — three themed groups of ten
 *   3 Word power (saffron)  — words that go together, word families, practice
 *   4 Practice (orange)     — match the meanings, complete the sentences,
 *                             sort words into their groups
 *   5 Let's talk (navy)     — two conversations with their Arabic, then
 *                             other ways to ask and answer
 *   6 Read (blue)           — a short text, its key words, true / false,
 *                             questions, your turn
 * Pages 1, 2, 4, 5 and 6 are the Level 1 book's own (lessonPages); a welcome
 * page and the contents open the book, the answer key closes it.
 */

export type L2VKind = VKind | 'power'
export type L2VPage = Lesson & { kind: L2VKind; unit?: number }

export const L2_V_TONES = {
  // the series palette of the VIIZA ENGLISH covers
  words: { m: '#A3262A', s: '#FCEFEE' },
  groups: { m: '#0E6B4E', s: '#EAF6F1' },
  power: { m: '#B7791F', s: '#FFF6DE' },
  practice: { m: '#C2541F', s: '#FFF1E8' },
  talk: { m: '#0E1240', s: '#EEF0F8' },
  read: { m: '#2B36C9', s: '#EEF0FD' },
  brand: { m: '#A3262A', s: '#FFF4E0' },
} as const
export type L2VTone = keyof typeof L2_V_TONES
export const L2_V_KIND_TONE: Record<L2VKind, L2VTone> = {
  welcome: 'brand', contents: 'brand', key: 'brand',
  words: 'words', groups: 'groups', power: 'power', practice: 'practice', talk: 'talk', read: 'read',
}

const pad = (n: number) => String(n).padStart(2, '0')

/** «Word power»: collocations, word families and a short practice. */
function powerPage(u: L2VocabBookUnit): L2VPage {
  const p = u.power
  return {
    n: u.n, tag: `Unit ${pad(u.n)}`, titleAr: u.titleAr, titleEn: `${u.titleEn} · Word power`, kind: 'power', unit: u.n, blocks: [
      { t: 'bar', title: 'Word power - قوّة الكلمات', icon: '⚡', tone: 'power' },
      { t: 'callout', text: 'في المستوى المتوسّط لا تكفي الكلمة وحدها: تعلّم الكلمات التي تأتي معها، وعائلة كل كلمة، فهكذا يتكلّم الناس فعلًا.' },
      { t: 'sub', text: '🔗 Words that go together - كلمات تأتي معًا' },
      { t: 'pairs', cols: 2, size: 13, items: p.together.map(w => [w.en, w.ar] as [string, string]) },
      { t: 'sub', text: '🌳 Word families - عائلات الكلمات' },
      { t: 'grid', rows: [
        { dark: true, span: [1, 1, 1], cells: ['Verb - الفعل', 'Noun - الاسم', 'Adjective - الصفة'] },
        ...p.families.map(f => ({ span: [1, 1, 1], size: 13.5, cells: [...f] })),
      ] },
      { t: 'exercise', title: 'Complete with the right word', instr: 'Use a word from the family in brackets. - استعمل كلمة من العائلة التي بين القوسين.', size: 13.5,
        items: p.use.map(([q, a]) => ({ q, a })) },
      { t: 'bar', title: 'Use them - استعملها', icon: '✍️', tone: 'power' },
      { t: 'answers', items: [`Write a sentence about you with "${p.together[0].en}".`, `Write a sentence about you with "${p.together[5].en}".`] },
    ],
  }
}

/** The Level 1 pages' advice, its audio at /audio/level2/vocab/{n}. */
const CALLOUTS: Partial<Record<L2VKind, string>> = {
  words: 'انظر إلى الصورة واقرأ الكلمة بصوت مرتفع، ثم غطِّ الإنجليزية وتذكّرها. امسح الرمز في أعلى الصفحة لتستمع إليها ببطء أو بالسرعة العادية.',
  groups: 'اقرأ كل مجموعة بصوت مرتفع، وتعلّم خمس كلمات جديدة كل يوم. استمع إليها بالرمز في أعلى الصفحة.',
}

/** The six pages of a unit. */
export function unitPages(u: L2VocabBookUnit): L2VPage[] {
  const [words, groups, practice, talk, read] = lessonPages(u).map((p): L2VPage => ({
    ...p, tag: `Unit ${pad(u.n)}`,
    blocks: p.blocks.map(b => (b.t === 'callout' && CALLOUTS[p.kind] ? { ...b, text: CALLOUTS[p.kind]! } : b)),
  }))
  return [words, groups, powerPage(u), practice, talk, read]
}

const front = (kind: L2VKind, tag: string, titleEn: string, titleAr: string, blocks: Block[]): L2VPage => ({ n: 0, tag, titleEn, titleAr, kind, blocks })

export const WELCOME: L2VPage = front('welcome', 'Welcome', 'Welcome', 'مرحبًا بك', [
  { t: 'banner', title: 'More words, more fluent - كلمات أكثر، طلاقة أكبر', icons: ['🔤', '📘'] },
  { t: 'callout', text: 'هذا الكتاب يرافق كتاب المستوى الثاني «تكلّم واكتب بدقّة» وحدةً بوحدة. في كل وحدة كلمات جديدة لم ترها في الكتاب الأساسي، من حياتنا في المغرب: من العمل والسفر والصحة إلى السوق والمطبخ والأخبار.' },
  { t: 'bar', title: 'Six pages for each unit - ست صفحات لكل وحدة', icon: '🧩' },
  { t: 'cards', cols: 3, stack: true, items: [
    ['🖼️', 'Picture words', 'كلمات بالصور'], ['🗂️', 'Word groups', 'مجموعات'], ['⚡', 'Word power', 'قوّة الكلمات'],
    ['✏️', 'Practice', 'تمارين'], ['🗣️', "Let's talk", 'لنتحدّث'], ['📖', 'Read', 'اقرأ'],
  ] },
  { t: 'bar', title: 'Why word power? - لماذا قوّة الكلمات؟', icon: '⚡' },
  { t: 'bullets', size: 13.5, items: [
    'At B1, you learn words in groups: make a decision, not do a decision. - في هذا المستوى نتعلّم الكلمات مع الكلمات التي ترافقها.',
    'One word gives you three: decide, decision, decisive. - كلمة واحدة تعطيك ثلاث كلمات من عائلتها.',
  ] },
  { t: 'bar', title: 'How to study a unit - كيف تدرس الوحدة', icon: '🧠' },
  { t: 'bullets', size: 13.5, items: [
    'Study the unit in the course book first. - ادرس الوحدة في الكتاب الأساسي أولًا.',
    'Say every new word out loud, in its sentence. - قل كل كلمة جديدة بصوت مرتفع داخل جملتها.',
    'Learn five new words a day, and review them on the next day. - تعلّم خمس كلمات كل يوم، وراجعها في اليوم التالي.',
    'Do the practice without looking back. - أنجز التمارين دون أن تنظر إلى الوراء.',
    'Read the conversations with a partner, then the text. - اقرأ المحادثات مع زميل، ثم النص.',
    'Check your answers at the back of the book. - صحّح أجوبتك في آخر الكتاب.',
  ] },
])

/** Every page in order, with the contents and the answer key built from it. */
export function buildLevel2VocabBook() {
  const units = LEVEL2_VOCAB.map(u => ({ u, pages: unitPages(u) }))
  const body = units.flatMap(x => x.pages)
  const firstBody = 3   // welcome 1, contents 2
  const at = (p: L2VPage) => firstBody + body.indexOf(p)

  const exNo = new Map<Block, number>()
  for (const p of body) for (const b of p.blocks) if (b.t === 'exercise') exNo.set(b, exNo.size + 1)
  const keyItems = body.flatMap(p => p.blocks.flatMap(b => (b.t === 'exercise' ? [{ label: `Ex. ${exNo.get(b)} · p. ${at(p)}`, answers: b.items.map(it => it.a) }] : [])))
  const keyAt = firstBody + body.length
  const keyPages: L2VPage[] = packKey(keyItems).map((items, i) => front('key', 'Answer key', `Answer key${i ? ' (continued)' : ''}`, 'الأجوبة', [
    ...(i ? [] : [{ t: 'banner' as const, title: 'Answer key - الأجوبة', icons: ['🔑', '✅'] as [string, string] }]),
    { t: 'key', items },
  ]))

  const span = [0.7, 3.2, 2.8, 0.9]
  const contents = front('contents', 'Contents', 'Contents', 'محتويات الكتاب', [
    { t: 'banner', title: 'Contents - محتويات الكتاب', icons: ['📚', '🔤'] },
    { t: 'grid', rows: [
      { dark: true, span, cells: ['Unit', 'Topic', 'الموضوع', 'Page'] },
      ...units.map(({ u, pages }) => ({ span, size: 12.5, cells: [pad(u.n), `${u.icon} ${u.titleEn}`, u.titleAr, String(at(pages[0]))] })),
      { plain: true, span: [7.6], size: 13, cells: [`🔑 Answer key · p. ${keyAt}`] },
    ] },
    { t: 'bar', title: 'Every unit, six pages - كل وحدة في ست صفحات', icon: '🎨' },
    { t: 'cards', cols: 6, stack: true, items: [
      ['🖼️', 'Picture words', 'أحمر'], ['🗂️', 'Word groups', 'أخضر'], ['⚡', 'Word power', 'زعفراني'],
      ['✏️', 'Practice', 'برتقالي'], ['🗣️', "Let's talk", 'كحلي'], ['📖', 'Read', 'أزرق'],
    ] },
  ])

  const pages: L2VPage[] = [WELCOME, contents, ...body, ...keyPages]
  return {
    pages, exNo,
    pageNo: (p: L2VPage) => pages.indexOf(p) + 1,
    stats: {
      units: units.length,
      words: LEVEL2_VOCAB.reduce((s, u) => s + u.vocab.length + u.groups.reduce((t, g) => t + g.words.length, 0) + u.power.together.length, 0),
      exercises: exNo.size,
    },
  }
}
