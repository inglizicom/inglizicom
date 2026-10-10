import type { Block } from '../level1-book.ts'
import { LEVEL1_V2_LESSONS } from '../level1-book-v2.ts'
import { BOUCHTA, CARDS, type BouchtaCard, type PlayCard } from '../level1-cards/index.ts'
import { LEVEL1_DIALOGUES, LEVEL1_WORKBOOK } from '../workbook/level1-workbook.ts'
import { LEVEL1_VOCAB } from '../level1-vocab/index.ts'

/**
 * The audio of Level 1 (A0 → A1), second edition: the book's words,
 * phrases, conversations and readings, the workbook's words, sentences and
 * conversations, and the answers of the play cards.
 *
 * One plan serves both ends. scripts/gen-level1-audio.mjs walks it and
 * records every clip twice (slow, for learning, and normal) with OpenAI's
 * voices into the public Supabase bucket "audio"; the play pages
 * (/audio/L13, /audio/L13-8, the cards' QR codes) walk it again and link the
 * same files. A clip's file name is a hash of its voice and text, so a line
 * said twice is recorded once, and changing a line records only that line.
 *
 * Voices: a warm female teacher (coral) reads the words and phrases; in a
 * conversation each speaker keeps one voice (women coral or shimmer, men ash
 * or onyx, a class sage); Bouchta the goat is fable.
 */

export type Voice = 'coral' | 'shimmer' | 'ash' | 'onyx' | 'sage' | 'fable'
export type Speed = 'slow' | 'normal'
export const SPEEDS: Speed[] = ['slow', 'normal']

export interface Clip { en: string; ar?: string; voice: Voice; speaker?: string }
export interface AudioSection { kind: 'words' | 'phrases' | 'talk' | 'reading'; title: string; titleAr: string; clips: Clip[] }

/* ── file names ── */

/** FNV-1a, 32 bits, in base 36: short, stable, the same in Node and the browser. */
function hash(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(36)
}
/**
 * What the voice is given to say. A word spelled with dashes (`W-A-L-I-D`) is
 * read as the word itself, so the letters are given one by one (`W, A, L, I, D`).
 */
export const sayOf = (en: string) => en.replace(/\b(?:[A-Z]-)+[A-Z]\b/g, m => m.split('-').join(', '))
/** A clip's file without its speed: the play pages add `-slow.mp3` or `-normal.mp3`. */
export const clipBase = (c: Clip) => `level1/${hash(`${c.voice}|${sayOf(c.en)}`)}`
export const clipPath = (c: Clip, speed: Speed) => `${clipBase(c)}-${speed}.mp3`
export const BUCKET = 'audio'
export const clipUrl = (supabaseUrl: string, c: Clip, speed: Speed) => `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${clipPath(c, speed)}`

/* ── text that can be read aloud ── */

const AR = /[؀-ۿ]/
/** The English of a book line: drop emoji, the Arabic half ("English - العربية"), and what is only for the eye. */
export function speakable(s: string): string {
  return s
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .split(/\s+-\s+(?=[^A-Za-z]*[؀-ۿ])/)[0]
    .replace(/\s*\((far|near)\)/g, '')
    .replace(/[✓✗]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
const english = (s: string) => {
  const t = speakable(s)
  return t && !AR.test(t) && /[A-Za-z]{2}/.test(t) ? t : ''
}

/* ── numbers and the time, for lesson 2's numbers and lesson 11's clocks ── */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
export function numberWords(n: number): string {
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '')
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${numberWords(n % 100)}` : ''}`
}
function timeWords(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const hour = (x: number) => numberWords(((x + 11) % 12) + 1)
  if (m === 0) return `It's ${hour(h)} o'clock.`
  if (m === 15) return `It's quarter past ${hour(h)}.`
  if (m === 30) return `It's half past ${hour(h)}.`
  if (m === 45) return `It's quarter to ${hour(h + 1)}.`
  return m < 30 ? `It's ${numberWords(m)} past ${hour(h)}.` : `It's ${numberWords(60 - m)} to ${hour(h + 1)}.`
}

/* ── voices in a conversation ── */

const WOMEN = new Set(['Hind', 'Receptionist', 'Imane', 'Karima', 'Sofia', 'Teacher', 'Nour', 'Yasmine', 'Mum', 'Khadija', 'Asmae', 'Rim', 'Lamia', 'Emily', 'Leila', 'Nawal', 'Ines', 'Malak', 'Salma', 'Nadia', 'Julie', 'Sara', 'Fatima', 'Hana', 'Lina', 'Rania', 'Mona',
  'Mrs Fassi', 'Amal', 'Kawtar', 'Ghita', 'Aya', 'Zineb', 'Secretary', 'Librarian', 'Journalist', 'Grandma', 'Emma'])
/** Each speaker of a conversation keeps one voice, and two speakers never share one. */
function castVoices(lines: string[]): Map<string, Voice> {
  const cast = new Map<string, Voice>()
  for (const l of lines) {
    const who = l.split(':')[0].trim()
    if (cast.has(who)) continue
    const taken = new Set(cast.values())
    const pool: Voice[] = who === 'Students' ? ['sage'] : WOMEN.has(who) ? ['coral', 'shimmer'] : ['ash', 'onyx']
    cast.set(who, pool.find(v => !taken.has(v)) ?? pool[0])
  }
  return cast
}

/* ── the book ── */

/** A lesson of the book as sections of clips: words, phrases, each conversation, each reading. */
export function bookSections(n: number): AudioSection[] {
  const lesson = LEVEL1_V2_LESSONS.find(l => l.n === n)
  if (!lesson) return []
  const words: Clip[] = [], phrases: Clip[] = [], rest: AudioSection[] = []
  const seen = new Set<string>()
  const add = (list: Clip[], en: string, ar?: string) => {
    const t = english(en)
    if (t && !seen.has(t)) { seen.add(t); list.push({ en: t, ...(ar && AR.test(ar) ? { ar } : {}), voice: 'coral' }) }
  }
  const arOf = (s: string) => (s.includes(' - ') ? s.split(' - ').slice(1).join(' - ') : undefined)

  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      switch (b.t) {
        case 'cards': case 'tiles': b.items.forEach(([, en, ar]) => add(words, en, ar)); break
        case 'pairs': b.items.forEach(([en, ar]) => add(words, en, ar)); break
        case 'family': (b.vocab ?? []).forEach(([en, ar]) => add(words, en, ar)); break
        case 'flags': b.items.forEach(f => add(words, `${f.country}. ${f.nationality}.`)); break
        case 'preps': b.items.forEach(([, en, ar]) => add(words, en, ar)); break
        case 'chips': b.items.forEach(([label, ar]) => add(words, label.charAt(0) + label.slice(1).toLowerCase(), ar)); break
        case 'pointing': b.items.forEach(p => add(phrases, `${p.en}.`, p.ar)); break
        case 'clocks': b.times.forEach(t => add(phrases, timeWords(t))); break
        case 'alphabet':
          add(words, 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z.')
          add(words, 'The vowels: A, E, I, O, U.')
          break
        case 'numbers':
          for (let i = 1; i <= 20; i++) add(words, numberWords(i).replace(/^./, c => c.toUpperCase()) + '.')
          for (const i of [30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900]) add(words, numberWords(i).replace(/^./, c => c.toUpperCase()) + '.')
          break
        case 'grid':
          for (const r of b.rows) for (const c of r.cells) {
            const t = english(c)
            if (t) add(t.split(' ').length > 3 || /[.?!]$/.test(t) ? phrases : words, c, arOf(c))
          }
          break
        case 'bullets': b.items.forEach(i => add(phrases, i, arOf(i))); break
        case 'qa': case 'phrases': case 'chat': b.rows.forEach(([q, a, qAr, aAr]) => { add(phrases, q, qAr); add(phrases, a, aAr) }); break
        case 'boxes': b.items.forEach(x => x.lines.forEach(l => add(phrases, l))); break
        case 'talk': {
          const cast = castVoices(b.lines)
          rest.push({ kind: 'talk', title: b.title ?? b.full ?? 'Conversation', titleAr: 'المحادثة', clips: b.lines.map(l => {
            const [who, ...said] = l.split(':')
            return { en: speakable(said.join(':')), voice: cast.get(who.trim())!, speaker: who.trim() }
          }) })
          break
        }
        case 'text': rest.push({ kind: 'reading', title: speakable(b.label) || b.label, titleAr: 'القراءة', clips: b.body.split('\n').map(p => ({ en: p.trim(), voice: 'coral' as Voice })).filter(c => c.en) }); break
        case 'row': b.blocks.forEach(walk); break
        default: break
      }
    }
  }
  walk(lesson.blocks)
  return [
    ...(words.length ? [{ kind: 'words' as const, title: 'Words', titleAr: 'الكلمات', clips: words }] : []),
    ...(phrases.length ? [{ kind: 'phrases' as const, title: 'Phrases', titleAr: 'العبارات', clips: phrases }] : []),
    ...rest,
  ]
}

/* ── the workbook ── */

/** A lesson of the workbook: its twelve words, its eight sentences (the answers of «fill the gap», «words in order», «translate»), its conversation. */
export function workbookSections(n: number): AudioSection[] {
  const u = LEVEL1_WORKBOOK.find(x => x.n === n)
  if (!u) return []
  const lines = LEVEL1_DIALOGUES[n]
  const cast = lines ? castVoices(lines) : null
  return [
    { kind: 'words', title: 'Words', titleAr: 'الكلمات', clips: u.words.map(w => ({ en: w.en, ar: w.ar, voice: 'coral' as Voice })) },
    { kind: 'phrases', title: 'Sentences', titleAr: 'الجمل', clips: u.phrases.map(p => ({ en: p.en, ar: p.ar, voice: 'coral' as Voice })) },
    ...(lines && cast ? [{ kind: 'talk' as const, title: 'Complete the conversation', titleAr: 'أكمل المحادثة', clips: lines.map(l => {
      const [who, ...said] = l.split(':')
      return { en: speakable(said.join(':')), voice: cast.get(who.trim())!, speaker: who.trim() }
    }) }] : []),
  ]
}

/* ── the vocabulary book ── */

/** A lesson of the extended vocabulary book: its words, their examples, each themed group, both conversations, other ways to ask and answer, the reading. */
export function vocabSections(n: number): AudioSection[] {
  const u = LEVEL1_VOCAB.find(x => x.n === n)
  if (!u) return []
  const coral = (en: string, ar?: string): Clip => ({ en: speakable(en), ...(ar ? { ar } : {}), voice: 'coral' })
  const talk = (t: (typeof u.talks)[number]): AudioSection => {
    const lines = t.lines.map((l, i) => `${t.who[i % 2]}: ${l.en}`)
    const cast = castVoices(lines)
    return { kind: 'talk', title: t.titleEn, titleAr: t.titleAr, clips: t.lines.map((l, i) => ({ en: speakable(l.en), ar: l.ar, voice: cast.get(t.who[i % 2])!, speaker: t.who[i % 2] })) }
  }
  return [
    { kind: 'words', title: 'Words', titleAr: 'الكلمات', clips: u.vocab.map(e => coral(e.en, e.ar)) },
    { kind: 'phrases', title: 'Examples', titleAr: 'الأمثلة', clips: u.vocab.map(e => coral(e.ex, e.exAr)) },
    ...u.groups.map((gp): AudioSection => ({ kind: 'words', title: gp.en, titleAr: gp.ar, clips: gp.words.map(w => coral(w.en, w.ar)) })),
    ...u.talks.map(talk),
    { kind: 'phrases', title: 'Ask and answer', titleAr: 'اسأل وأجب', clips: u.ask.flatMap((q, i) => [coral(q.en, q.ar), ...(u.answer[i] ? [coral(u.answer[i].en, u.answer[i].ar)] : [])]) },
    { kind: 'reading', title: u.reading.title, titleAr: u.reading.titleAr, clips: [coral(u.reading.text)] },
  ]
}

/* ── the cards ── */

export interface CardClip extends Clip { label: string; labelAr: string }

/** What a card's QR code plays: the answer, and around it what makes sense of it (the book's sentence, both lines of a conversation). */
export function cardClips(c: PlayCard): CardClip[] {
  const line = (label: string, labelAr: string, en: string, voice: Voice = 'coral'): CardClip => ({ label, labelAr, en: speakable(en), voice })
  switch (c.game) {
    case 'call': return [line('Word', 'الكلمة', c.answer), line('Sentence', 'الجملة', c.sentence!)]
    case 'timer': return [line('Answers', 'الأجوبة', [...c.accept!, ...(c.extra ?? [])].join(', ') + '.')]
    case 'kemelni': return c.mode === 'question'
      ? [line('Question', 'السؤال', c.answer, 'ash'), line('Answer', 'الجواب', c.en!)]
      : [line(c.mode === 'next' ? 'Line' : 'Question', c.mode === 'next' ? 'الجملة' : 'السؤال', c.en!), line(c.mode === 'next' ? 'Next' : 'Answer', c.mode === 'next' ? 'الجملة التالية' : 'الجواب', c.answer, 'ash')]
    default: return [line('Answer', 'الجواب', c.answer)]
  }
}
export function bouchtaClips(b: BouchtaCard): CardClip[] {
  return b.kind === 'silly'
    ? [{ label: 'Bouchta asks', labelAr: 'بوشتى يسأل', en: speakable(b.en), voice: 'fable' }, { label: 'Answer', labelAr: 'الجواب', en: speakable(b.answer), voice: 'coral' }]
    : []
}

/* ── everything, once ── */

/** Every clip of the book and the cards, each once (by file). */
export function allClips(): Clip[] {
  const all = [
    ...LEVEL1_V2_LESSONS.flatMap(l => bookSections(l.n).flatMap(s => s.clips)),
    ...LEVEL1_WORKBOOK.flatMap(u => workbookSections(u.n).flatMap(s => s.clips)),
    ...LEVEL1_VOCAB.flatMap(u => vocabSections(u.n).flatMap(s => s.clips)),
    ...CARDS.flatMap(cardClips),
    ...BOUCHTA.flatMap(bouchtaClips),
  ]
  const byFile = new Map<string, Clip>()
  for (const c of all) if (c.en) byFile.set(clipPath(c, 'normal'), c)
  return [...byFile.values()]
}

/** A card's code on its QR: "L13-8"; Bouchta's silly questions "B-01". */
export const cardCode = (id: string) => (id.startsWith('b-') ? `B-${id.slice(2)}` : `L${id}`)
