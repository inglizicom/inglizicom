import type { Block, Lesson } from '../level1-book.ts'
import type { VocabBookUnit } from '../workbook/vocab-book-all.ts'
import { mixed } from '../level2-book/index.ts'
import { LEVEL1_VOCAB } from './index.ts'

/**
 * The Level 1 extended vocabulary book laid out as pages for the course
 * book's renderer (app/admin/level1-book/_blocks.tsx), so the box's books
 * share one look: the same frame, faces and header (with each lesson's QR
 * code to its audio).
 *
 * Five pages a lesson, always in this order, each with its colour:
 *   1 Picture words (rose)  — ten picture tiles, then each word in a sentence
 *   2 Word groups (teal)    — three themed groups of ten
 *   3 Practice (orange)     — match the meanings, complete the sentences,
 *                             sort words into their groups
 *   4 Let's talk (violet)   — two conversations with their Arabic, then
 *                             other ways to ask and answer
 *   5 Read (blue)           — a short text, its key words, true / false,
 *                             questions, your turn
 * A welcome page and the contents open the book; the answer key closes it.
 */

export type VKind = 'welcome' | 'contents' | 'words' | 'groups' | 'practice' | 'talk' | 'read' | 'key'
export type VPage = Lesson & { kind: VKind; unit?: number }

export const V_TONES = {
  words: { m: '#E11D48', s: '#FFF1F3' },
  groups: { m: '#0D9488', s: '#ECFBF8' },
  practice: { m: '#EA580C', s: '#FFF4EC' },
  talk: { m: '#7C3AED', s: '#F4F0FF' },
  read: { m: '#2563EB', s: '#EFF5FF' },
  brand: { m: '#A16207', s: '#FDF6E3' },
} as const
export type VTone = keyof typeof V_TONES
export const V_KIND_TONE: Record<VKind, VTone> = {
  welcome: 'brand', contents: 'brand', key: 'brand', words: 'words', groups: 'groups', practice: 'practice', talk: 'talk', read: 'read',
}

const pad = (n: number) => String(n).padStart(2, '0')
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const LETTERS = 'abcdefghijkl'

/** Match each item to a lettered answer (printed mixed); the key gives the letter. */
function match(title: string, instr: string, rows: [string, string][], cols: 1 | 2 = 2): Block {
  const bank = mixed(rows.map(([, a]) => a))
  return { t: 'exercise', title, instr, size: 13.5, cols, lettered: true, bank, items: rows.map(([q, a]) => ({ q: `${q} ___`, a: LETTERS[bank.indexOf(a)] })) }
}

/** The five pages of a lesson. */
export function lessonPages(u: VocabBookUnit): VPage[] {
  const page = (kind: VKind, titleEn: string, blocks: Block[]): VPage =>
    ({ n: u.n, tag: `Lesson ${pad(u.n)}`, titleAr: u.titleAr, titleEn: `${u.titleEn} · ${titleEn}`, kind, unit: u.n, blocks })

  // Practice: the words of the lesson, again.
  const inExample = (en: string, ex: string) => new RegExp(`(?<![A-Za-z'])${esc(en)}(?![A-Za-z])`, 'i')
  const blankable = u.vocab.filter(e => !/[/…]/.test(e.en) && inExample(e.en, e.ex).test(e.ex)).slice(0, 6)
  const sortWords = u.groups.flatMap((g, gi) => [1, 4, 7].map(k => [g.words[k].en, LETTERS[gi]] as [string, string]))
  const sortOrder = mixed(sortWords)
  const r = u.reading

  return [
    page('words', 'Picture words', [
      { t: 'banner', title: `${u.titleEn} - ${u.titleAr}`, icons: [u.icon, '🔤'] },
      { t: 'bar', title: 'Picture words - كلمات بالصور', icon: '🖼️', tone: 'words' },
      { t: 'callout', text: 'انظر إلى الصورة واقرأ الكلمة بصوت مرتفع، ثم غطِّ الإنجليزية وتذكّرها. امسح الرمز في أعلى الصفحة لتستمع إليها.' },
      { t: 'tiles', cols: 5, items: u.vocab.map(e => [e.icon, e.en, e.ar] as [string, string, string]) },
      { t: 'bar', title: 'In a sentence - في جملة', icon: '💬', tone: 'words' },
      { t: 'bullets', size: 13, items: u.vocab.map(e => `${e.ex} - ${e.exAr}`) },
    ]),
    page('groups', 'Word groups', [
      { t: 'bar', title: 'Word groups - مجموعات الكلمات', icon: '🗂️', tone: 'groups' },
      { t: 'callout', text: 'اقرأ كل مجموعة بصوت مرتفع، وتعلّم خمس كلمات جديدة كل يوم. استمع إليها بالرمز في أعلى الصفحة.' },
      ...u.groups.flatMap((g): Block[] => [
        { t: 'sub', text: `${g.icon} ${g.en} - ${g.ar}` },
        { t: 'pairs', cols: 2, size: 13, items: g.words.map(w => [w.en, w.ar] as [string, string]) },
      ]),
    ]),
    page('practice', 'Practice', [
      { t: 'bar', title: 'Practice - تمارين', icon: '✏️', tone: 'practice' },
      match('Words and meanings', 'Write the letter of the meaning. - اكتب حرف المعنى المناسب.', u.vocab.map(e => [e.en, e.ar])),
      { t: 'exercise', title: 'Complete the sentences', instr: 'Use the words in the box. - استعمل الكلمات التي في الإطار.', size: 13.5,
        bank: mixed(blankable.map(e => e.en)), items: blankable.map(e => ({ q: e.ex.replace(inExample(e.en, e.ex), '___'), a: e.en })) },
      { t: 'exercise', title: 'Which group?', instr: 'Write the letter of the group. - اكتب حرف المجموعة.', size: 13.5, cols: 2, lettered: true,
        bank: u.groups.map(g => `${g.en} - ${g.ar}`), items: sortOrder.map(([w, l]) => ({ q: `${w} ___`, a: l })) },
      { t: 'bar', title: 'My new words - كلماتي الجديدة', icon: '📝', tone: 'practice' },
      { t: 'lines', n: 3, grow: true },
    ]),
    page('talk', "Let's talk", [
      { t: 'bar', title: "Let's talk - لنتحدّث", icon: '🗣️', tone: 'talk' },
      ...u.talks.flatMap((t): Block[] => [
        { t: 'sub', text: `${t.titleEn} · ${t.who[0]} & ${t.who[1]} - ${t.titleAr}` },
        { t: 'chat', cols: 1, rows: [0, 2, 4].map(i => [t.lines[i].en, t.lines[i + 1].en, t.lines[i].ar, t.lines[i + 1].ar] as [string, string, string, string]) },
      ]),
      { t: 'bar', title: 'Ask and answer - اسأل وأجب', icon: '❓', tone: 'talk' },
      { t: 'phrases', rows: u.ask.map((q, i) => [q.en, u.answer[i].en, q.ar, u.answer[i].ar] as [string, string, string, string]) },
    ]),
    page('read', 'Read', [
      { t: 'bar', title: 'Read - اقرأ', icon: '📖', tone: 'read' },
      { t: 'text', label: `${r.title} - ${r.titleAr}`, body: r.text, size: 14, plain: true,
        mark: new RegExp(`(?<![A-Za-z])(?:${r.gloss.map(g => esc(g.en)).sort((a, b) => b.length - a.length).join('|')})(?![A-Za-z])`, 'g') },
      { t: 'sub', text: '🔑 Key words - كلمات مفتاحية' },
      { t: 'pairs', cols: 3, size: 12.5, items: r.gloss.map(g => [g.en, g.ar] as [string, string]) },
      { t: 'exercise', title: 'True or false?', instr: 'Circle the right answer. - ضع دائرة حول الجواب الصحيح.', size: 13.5,
        items: r.tf.map(x => ({ q: x.s, options: ['True', 'False'], a: x.ok ? 'a) True' : 'b) False' })) },
      { t: 'exercise', title: 'Answer the questions', instr: 'Write a short answer. - اكتب جوابًا قصيرًا.', size: 13.5, lines: true,
        items: r.qs.map(x => ({ q: x.q, a: x.a })) },
      { t: 'bar', title: 'Your turn - دورك', icon: '✍️', tone: 'read' },
      { t: 'answers', items: [`Write a sentence about you with "${u.vocab[0].en}".`, `Write a sentence about you with "${u.vocab[5].en}".`] },
    ]),
  ]
}

const front = (kind: VKind, tag: string, titleEn: string, titleAr: string, blocks: Block[]): VPage => ({ n: 0, tag, titleEn, titleAr, kind, blocks })

export const WELCOME: VPage = front('welcome', 'Welcome', 'Welcome', 'مرحبًا بك', [
  { t: 'banner', title: 'More words, every lesson - كلمات أكثر في كل درس', icons: ['🔤', '📗'] },
  { t: 'callout', text: 'هذا الكتاب يرافق كتاب المستوى الأول درسًا بدرس. في كل درس كلمات جديدة لم ترها في الكتاب الأساسي، من حياتنا اليومية في المغرب: من السوق والحمّام والمطبخ إلى القطار والمدينة القديمة.' },
  { t: 'bar', title: 'Five pages for each lesson - خمس صفحات لكل درس', icon: '🧩' },
  { t: 'cards', cols: 5, stack: true, items: [
    ['🖼️', 'Picture words', 'كلمات بالصور'], ['🗂️', 'Word groups', 'مجموعات'], ['✏️', 'Practice', 'تمارين'], ['🗣️', "Let's talk", 'لنتحدّث'], ['📖', 'Read', 'اقرأ'],
  ] },
  { t: 'bar', title: 'How to study a lesson - كيف تدرس الدرس', icon: '🧠' },
  { t: 'bullets', size: 13.5, items: [
    'Study the lesson in the course book first. - ادرس الدرس في الكتاب الأساسي أولًا.',
    'Look at the pictures and say the words out loud. - انظر إلى الصور وقل الكلمات بصوت مرتفع.',
    'Learn five new words every day, not more. - تعلّم خمس كلمات جديدة كل يوم، لا أكثر.',
    'Do the practice page without looking back. - أنجز صفحة التمارين دون أن تنظر إلى الوراء.',
    'Read the conversations with a partner, then read the text. - اقرأ المحادثات مع زميل، ثم اقرأ النص.',
    'Check your answers at the back of the book. - صحّح أجوبتك في آخر الكتاب.',
  ] },
  { t: 'bar', title: 'Listen - استمع', icon: '🎧' },
  { t: 'bullets', size: 13.5, items: [
    'Scan the code at the top of every page. - امسح الرمز في أعلى كل صفحة.',
    'Every word, sentence, conversation and text, slow or at normal speed. - كل كلمة وجملة ومحادثة ونص، ببطء أو بسرعة عادية.',
  ] },
])

/** Every page in order, with the contents and the answer key built from it. */
export function buildLevel1VocabBook() {
  const units = LEVEL1_VOCAB.map(u => ({ u, pages: lessonPages(u) }))
  const body = units.flatMap(x => x.pages)
  const firstBody = 3   // welcome 1, contents 2
  const at = (p: VPage) => firstBody + body.indexOf(p)

  const exNo = new Map<Block, number>()
  for (const p of body) for (const b of p.blocks) if (b.t === 'exercise') exNo.set(b, exNo.size + 1)
  const keyItems = body.flatMap(p => p.blocks.flatMap(b => (b.t === 'exercise' ? [{ label: `Ex. ${exNo.get(b)} · p. ${at(p)}`, answers: b.items.map(it => it.a) }] : [])))
  const keyAt = firstBody + body.length
  const PER_KEY = 32
  const keyPages: VPage[] = Array.from({ length: Math.ceil(keyItems.length / PER_KEY) }, (_, i) => front('key', 'Answer key', `Answer key${i ? ' (continued)' : ''}`, 'الأجوبة', [
    ...(i ? [] : [{ t: 'banner' as const, title: 'Answer key - الأجوبة', icons: ['🔑', '✅'] as [string, string] }]),
    { t: 'key', items: keyItems.slice(i * PER_KEY, (i + 1) * PER_KEY) },
  ]))

  const span = [0.7, 3.2, 2.8, 0.9]
  const contents = front('contents', 'Contents', 'Contents', 'محتويات الكتاب', [
    { t: 'banner', title: 'Contents - محتويات الكتاب', icons: ['📚', '🔤'] },
    { t: 'grid', rows: [
      { dark: true, span, cells: ['Lesson', 'Topic', 'الموضوع', 'Page'] },
      ...units.map(({ u, pages }) => ({ span, size: 13, cells: [pad(u.n), `${u.icon} ${u.titleEn}`, u.titleAr, String(at(pages[0]))] })),
      { plain: true, span: [7.6], size: 13, cells: [`🔑 Answer key · p. ${keyAt}`] },
    ] },
    { t: 'bar', title: 'Every lesson, five pages - كل درس في خمس صفحات', icon: '🎨' },
    { t: 'cards', cols: 5, stack: true, items: [
      ['🖼️', 'Picture words', 'وردي'], ['🗂️', 'Word groups', 'أخضر فيروزي'], ['✏️', 'Practice', 'برتقالي'], ['🗣️', "Let's talk", 'بنفسجي'], ['📖', 'Read', 'أزرق'],
    ] },
  ])

  const pages: VPage[] = [WELCOME, contents, ...body, ...keyPages]
  return {
    pages, exNo,
    pageNo: (p: VPage) => pages.indexOf(p) + 1,
    stats: { lessons: units.length, words: LEVEL1_VOCAB.reduce((s, u) => s + u.vocab.length + u.groups.reduce((t, g) => t + g.words.length, 0), 0), exercises: exNo.size },
  }
}
