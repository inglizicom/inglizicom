import type { Block, Lesson } from '../level1-book.ts'
import type { L2Ladder, L2Unit } from './types.ts'
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

export type L2Kind = 'welcome' | 'contents' | 'opener' | 'vocab' | 'expressions' | 'talk' | 'grammar' | 'speaking' | 'writing' | 'check' | 'review' | 'key'
export type L2Page = Lesson & { kind: L2Kind; unit?: number; module?: number }

/** The colour key: one colour per kind of section through the book. */
export const L2_TONES = {
  vocab: { m: '#E11D48', s: '#FFF1F3' },
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
  vocab: 'vocab', expressions: 'expr', talk: 'talk', grammar: 'grammar', speaking: 'talk', writing: 'writing', check: 'practice', review: 'practice',
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
/** Conversation lines that use one of the unit's expressions word for word, the first use of each (a ladder unit: one per step). */
export function keyLines(u: L2Unit): number[] {
  if (u.ladder) return ladderKeyLines(u)
  const used = new Set<number>(), out: number[] = []
  const candidates: [string, string][] = u.expressions.map(([q, a]) => [q, a])
  u.talk.forEach((l, i) => {
    if (out.length >= KEY_LINES) return
    const said = ` ${norm(l.replace(/^[^:]+:\s/, ''))} `
    const k = candidates.findIndex(([q, a], j) => !used.has(j) && [q, a].filter(Boolean).some(e => {
      const n = norm(e)
      return n.split(' ').length >= 3 && !GENERIC.test(e) && said.includes(` ${n} `)
    }))
    if (k >= 0) { used.add(k); out.push(i) }
  })
  return out
}

/**
 * A ladder unit's key sentences: one per step, the first line inside that
 * step that says one of its phrases word for word (so the stars run down the
 * whole conversation, step by step).
 */
function ladderKeyLines(u: L2Unit): number[] {
  const L = u.ladder!
  const starts = Object.entries(L.talkSteps).map(([line, step]) => [Number(line), step] as const).sort((a, b) => a[0] - b[0])
  return starts.flatMap(([from, step], k) => {
    const to = k + 1 < starts.length ? starts[k + 1][0] : u.talk.length
    const phrases = L.steps[step - 1].phrases.map(([en]) => norm(en)).filter(n => n.split(' ').length >= 3)
    for (let i = from; i < to; i++) {
      const said = ` ${norm(u.talk[i].replace(/^[^:]+:\s/, ''))} `
      if (phrases.some(p => said.includes(` ${p} `))) return [i]
    }
    return []
  })
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
  if (u.ladder) return ladderPages(u, page)
  const more = (i: number) => (i ? ' (continued)' : '')
  const w = u.writing
  const v = u.vocab
  const keys = keyLines(u)
  const talkMark = focusRegex(u.focus)
  const half = Math.ceil(u.expressions.length / 2)

  return [
    page('opener', 'Opener', [
      { t: 'banner', title: `${u.titleEn} - ${u.titleAr}`, icons: u.icons },
      { t: 'callout', text: u.goal },
      { t: 'bar', title: 'In this unit - في هذه الوحدة', icon: '🧩' },
      { t: 'cards', cols: 5, stack: true, items: [
        ['🔤', 'Vocabulary', 'المفردات'], ['💬', 'Expressions', 'عبارات مفيدة'], ['🗣️', 'Conversation', 'المحادثة'],
        ['📘', u.grammarName, 'القواعد'], ['✍️', w.name, 'الكتابة'],
      ] },
      { t: 'bar', title: 'My goals - أهدافي', icon: '🎯' },
      { t: 'bullets', tick: true, size: 14.5, items: u.canDo.map(([en, ar]) => `I can ${en} - أستطيع أن ${ar}`) },
      { t: 'bar', title: 'Key sentence - جملة الوحدة', icon: '🔑' },
      { t: 'qa', rows: [u.expressions[0]] },
    ]),
    // Vocabulary by theme: two groups, then the third with the word partners and an exercise.
    page('vocab', 'Vocabulary', [
      { t: 'bar', title: 'Vocabulary - المفردات', icon: '🔤', tone: 'vocab' },
      { t: 'callout', text: 'اقرأ كل كلمة ومثالها بصوت مرتفع، ثم غطِّ الكلمات الإنجليزية وحاول أن تتذكّرها من معناها.' },
      ...v.groups.slice(0, 2).flatMap((g): Block[] => [{ t: 'sub', text: `${g.icon} ${g.title}` }, { t: 'wordList', items: g.words }]),
    ]),
    page('vocab', 'Vocabulary', [
      { t: 'bar', title: 'Vocabulary (continued) - المفردات', icon: '🔤', tone: 'vocab' },
      ...v.groups.slice(2).flatMap((g): Block[] => [{ t: 'sub', text: `${g.icon} ${g.title}` }, { t: 'wordList', items: g.words }]),
      { t: 'bar', title: 'Word partners - كلمات تأتي معًا', icon: '🔗', tone: 'vocab' },
      { t: 'pairs', cols: 3, size: 14, items: v.partners },
      { t: 'bar', title: 'Practice - تمارين', icon: '✏️', tone: 'practice' },
      { t: 'exercise', title: 'Complete with words from this unit', instr: 'Write one word or phrase in each gap. - اكتب كلمة أو عبارة في كل فراغ.', size: 13.5, cols: 2, items: v.practice.map(([q, a]) => ({ q, a })) },
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
    ...writingPages(u, page),
  ]
}

type PageOf = (kind: L2Kind, titleEn: string, blocks: Block[]) => L2Page

/** Writing, two pages: the task, what to include, the language, a short example and a model; then the template to complete. */
function writingPages(u: L2Unit, page: PageOf): L2Page[] {
  const w = u.writing
  return [
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

/* A fixed mix of a short list (the same on every print): rotate by half, then reverse each half. */
function mixed<T>(list: T[]): T[] {
  const h = Math.ceil(list.length / 2)
  const out = [...list.slice(h).reverse(), ...list.slice(0, h).reverse()]
  return out.every((x, i) => x === list[i]) ? [...list].reverse() : out
}

/**
 * A ladder unit's pages: opener (the situation, the task, the steps, the
 * plan) · the words the task needs · the expressions, step by step, with a
 * practice · the model conversation, its steps marked · grammar · speaking
 * (practise, role cards, the real conversation) · writing · check.
 */
function ladderPages(u: L2Unit, page: PageOf): L2Page[] {
  const L = u.ladder!
  const v = u.vocab
  const keys = keyLines(u)
  const stepCard = (s: L2Ladder['steps'][number], i: number): Block =>
    ({ t: 'bullets', box: true, section: true, tone: 'expr', heading: `Step ${i + 1} · ${s.title} - ${s.titleAr} ${s.icon}`, size: 13.5, items: s.phrases.map(([en, ar]) => `${en} - ${ar}`) })
  const firstHalf = Math.ceil(L.steps.length / 2)
  const order = mixed(L.order)
  return [
    page('opener', 'Opener', [
      { t: 'banner', title: `${u.titleEn} - ${u.titleAr}`, icons: u.icons },
      { t: 'bullets', box: true, section: true, tone: 'talk', heading: 'The situation - الموقف 🎬', size: 14, items: [L.situation] },
      { t: 'bullets', box: true, section: true, tone: 'practice', heading: 'Your task - مهمتك 🎯', size: 14, items: [L.task] },
      { t: 'bar', title: 'The conversation, step by step - المحادثة خطوة بخطوة', icon: '🪜', tone: 'expr' },
      { t: 'cards', cols: L.steps.length, stack: true, items: L.steps.map((s, i): [string, string, string] => [s.icon, `${i + 1}. ${s.title}`, s.titleAr]) },
      { t: 'bar', title: 'By the end of the unit - في آخر الوحدة', icon: '✅' },
      { t: 'bullets', tick: true, size: 14, items: u.canDo.map(([en, ar]) => `I can ${en} - أستطيع أن ${ar}`) },
      { t: 'bar', title: 'Two sessions - حصتان', icon: '🗓️' },
      { t: 'grid', rows: [
        { span: [0.9, 3.4], size: 13.5, cells: ['Session A', 'Words → Expressions → Conversation'] },
        { span: [0.9, 3.4], size: 13.5, cells: ['Session B', 'Grammar → Practice → Speaking → Writing → Check'] },
      ] },
    ]),
    page('vocab', 'Words', [
      { t: 'bar', title: 'Words for the task - كلمات المهمة', icon: '🔤', tone: 'vocab' },
      { t: 'callout', text: 'هذه هي الكلمات التي تحتاجها في المحادثة. اقرأ كل كلمة ومثالها بصوت مرتفع، ثم غطِّ الإنجليزية وتذكّرها.' },
      ...v.groups.flatMap((g): Block[] => [{ t: 'sub', text: `${g.icon} ${g.title}` }, { t: 'wordList', items: g.words }]),
    ]),
    page('expressions', 'Expressions', [
      { t: 'bar', title: 'Expressions, step by step - العبارات خطوة بخطوة', icon: '💬', tone: 'expr' },
      { t: 'callout', text: 'المحادثة تمرّ بمراحل. في كل مرحلة، هذه هي الجمل التي تقولها. اقرأها بصوت مرتفع، ثم غطِّ الإنجليزية وقلها من العربية.' },
      ...L.steps.slice(0, firstHalf).map((s, i) => stepCard(s, i)),
    ]),
    page('expressions', 'Expressions', [
      { t: 'bar', title: 'Expressions, step by step (continued) - العبارات خطوة بخطوة', icon: '💬', tone: 'expr' },
      ...L.steps.slice(firstHalf).map((s, i) => stepCard(s, firstHalf + i)),
      { t: 'bar', title: 'Practice - تمارين', icon: '✏️', tone: 'practice' },
      { t: 'exercise', title: 'Words: complete the sentences', instr: 'Write one word in each gap. - اكتب كلمة واحدة في كل فراغ.', size: 13.5, cols: 2, items: v.practice.map(([q, a]) => ({ q, a })) },
      { t: 'exercise', title: 'Put the conversation in order', instr: 'Number the lines from 1 to 6. - رقّم الجمل حسب ترتيبها في المحادثة.', size: 13.5,
        items: order.map(line => ({ q: `___ ${line}`, a: String(L.order.indexOf(line) + 1) })) },
    ]),
    page('talk', 'Conversation', [
      { t: 'bar', title: 'Conversation - المحادثة', icon: '🗣️', tone: 'talk' },
      { t: 'callout', text: 'لاحظ المراحل الخمس في المحادثة. القواعد الجديدة بالأزرق، و⭐ أمام عبارات الوحدة.' },
      { t: 'script', lines: u.talk, badges: true, mark: focusRegex(u.focus), keys,
        labels: Object.fromEntries(Object.entries(L.talkSteps).map(([line, step]) => [line, `${step} · ${L.steps[step - 1].title}`])),
        ...(u.talk.length > ONE_COLUMN_LINES ? { cols: 2 as const } : {}) },
      { t: 'bullets', box: true, section: true, tone: 'practice', heading: 'Find it - ابحث 🔍', size: 13, items: u.findIt },
    ]),
    ...u.grammar.map((blocks, i) => page('grammar', `Grammar${i ? ' (continued)' : ''}`, blocks)),
    page('speaking', 'Speaking', [
      { t: 'bar', title: 'Speaking - تكلّم', icon: '🗣️', tone: 'talk' },
      { t: 'bullets', box: true, heading: '1 · Practise - تدرّب', size: 13.5, items: [
        'Read the conversation with a partner. Then swap roles. - اقرأ المحادثة مع زميل، ثم تبادلا الأدوار.',
        'Cover the conversation. Look only at the steps and say it again. - غطِّ المحادثة وأعدها بالنظر إلى المراحل فقط.',
      ] },
      { t: 'cards', cols: L.steps.length, stack: true, items: L.steps.map((s, i): [string, string, string] => [s.icon, `${i + 1}. ${s.title}`, s.titleAr]) },
      { t: 'bar', title: '2 · Role-play - مثّل الدور', icon: '🎭', tone: 'talk' },
      { t: 'boxes', cols: 2, items: [{ title: 'Student A 🅰️', lines: L.speaking.cards[0] }, { title: 'Student B 🅱️', lines: L.speaking.cards[1] }] },
      { t: 'bar', title: '3 · Your real conversation - محادثتك الحقيقية', icon: '💬', tone: 'talk' },
      { t: 'bullets', size: 14, items: [L.speaking.free] },
      { t: 'bullets', box: true, section: true, tone: 'practice', tick: true, heading: 'After speaking - بعد الكلام ✅', size: 13, items: L.speaking.check },
    ]),
    ...writingPages(u, page),
    page('check', 'Check', [
      { t: 'bar', title: 'Check - راجع نفسك', icon: '🏁', tone: 'practice' },
      { t: 'callout', text: 'ضع علامة في الخانة المناسبة لكل هدف، ثم أجب عن الأسئلة وصحّح أجوبتك في آخر الكتاب.' },
      { t: 'grid', rows: [
        { dark: true, span: [4, 0.8, 0.8, 0.8], cells: ['I can…', '😀 Yes', '🙂 Almost', '😐 Not yet'] },
        ...u.canDo.map(([en]) => ({ span: [4, 0.8, 0.8, 0.8], size: 13.5, cells: [`I can ${en}`, '☐', '☐', '☐'] })),
      ] },
      { t: 'exercise', title: 'Quick quiz', instr: 'Circle the right answer. - ضع دائرة حول الجواب الصحيح.', size: 13.5,
        items: L.quiz.map(([q, options, r]) => ({ q, options, a: `${'abc'[r]}) ${options[r]}` })) },
      { t: 'callout', text: 'هل وضعت 😐 أمام هدف ما؟ ارجع إلى المرحلة المناسبة في صفحة العبارات، ثم أعد المحادثة مع زميل.' },
      { t: 'bar', title: 'My notes - ملاحظاتي', icon: '📝', tone: 'practice' },
      { t: 'bullets', size: 13, items: ['New words and sentences I want to remember from this unit. - كلمات وجمل جديدة أريد أن أتذكّرها من هذه الوحدة.'] },
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
    { title: '🔤 Vocabulary', lines: ['كلمات الموقف في مجموعات، مع معناها ومثال يستعملها.'] },
    { title: '💬 Useful expressions', lines: ['جمل حقيقية للموقف، مبنية على قاعدة الوحدة.'] },
    { title: '🗣️ Conversation', lines: ['محادثة طبيعية تظهر فيها القاعدة بالأزرق.'] },
    { title: '📘 Grammar', lines: ['القاعدة في ثلاث صفحات: الاستعمالات، التركيب، الأخطاء الشائعة، والتمارين.'] },
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
    ['🔤', 'Vocabulary', 'وردي'], ['💬', 'Expressions', 'أخضر'], ['🗣️', 'Conversation', 'بنفسجي'], ['📘', 'Grammar', 'أزرق'], ['✍️', 'Writing', 'برتقالي'], ['✏️', 'Practice', 'فيروزي'],
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
