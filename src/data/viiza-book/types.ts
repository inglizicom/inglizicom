/**
 * VIIZA ENGLISH, Student's Book: a travel guide in English for Arabic
 * speakers going to the Gulf, the USA and Europe. It follows one journey in
 * the order a traveller lives it, from the visa form to the front door at
 * home, as "stops" grouped in six parts. Every stop prints on six A4 pages,
 * always in the same order, so a traveller finds what they need in seconds:
 *
 *   1. Opener: the situation, what you will be able to do, what to know
 *      before you go (by region), the apps, and an insider tip.
 *   2. Vocabulary: the twelve key words, action words and words that go
 *      together, every one with an example.
 *   3. Exchanges: what you hear and how to reply, what you say and what
 *      you may hear back.
 *   4. In real life: a screen, document or sign explained with numbered
 *      notes, and the mistakes Arabic speakers make.
 *   5. The conversation, line by line with its Arabic, and a true / false
 *      check.
 *   6. Practice, a role-play in pairs, then the survival card: the
 *      sentences to show or read out when the words won't come.
 *
 * Texts are short on purpose: the page sizes are fixed, and a test checks
 * the limits. English is A2 → B1, Arabic is simple Modern Standard Arabic.
 */

/** Where a fact applies. 'all' is everywhere; the others print as a badge. */
export type Region = 'all' | 'gulf' | 'usa' | 'uk' | 'europe'

/** [English, Arabic] */
export type Pair = [en: string, ar: string]

export interface Tip { region: Region; text: string }

/** A key word: [English, Arabic, lucide icon name]. */
export type Word = [en: string, ar: string, icon: string]

/** One line of the conversation: [speaker, English, Arabic]. */
export type Line = [who: string, en: string, ar: string]

/** A mistake: [what people say, what to say, why (Arabic)]. */
export type Mistake = [wrong: string, right: string, why: string]

/* ── Real-life screens, documents and signs ─────────────────────────── */

/** A numbered note under a screen: [number, English label, Arabic explanation]. */
export type Note = [n: number, en: string, ar: string]

/** One element of an app screen; `n` puts a numbered marker on it. */
export type ScreenItem =
  | { t: 'field'; label: string; value: string; n?: number }
  | { t: 'fields'; items: { label: string; value: string }[]; n?: number }
  | { t: 'chips'; items: string[]; on?: number; n?: number }
  | { t: 'card'; title: string; sub?: string; right?: string; tag?: string; n?: number }
  | { t: 'button'; label: string; n?: number; ghost?: boolean }
  | { t: 'text'; text: string; n?: number; small?: boolean }
  | { t: 'alert'; text: string; n?: number }

export type Screen =
  /** A phone app (or a kiosk / ATM / card machine with `frame`). */
  | { kind: 'app'; frame?: 'phone' | 'kiosk' | 'terminal'; app: string; title: string; items: ScreenItem[]; notes: Note[]; caption: Pair }
  /** A boarding pass, its parts numbered. */
  | { kind: 'pass'; caption: Pair; pass: { name: string; from: [string, string]; to: [string, string]; flight: string; date: string; gate: string; boarding: string; seat: string; group: string; seq: string }; notes: Note[] }
  /** An airport departures / arrivals board; the notes explain its rows in order. */
  | { kind: 'board'; caption: Pair; title: string; rows: [time: string, place: string, flight: string, gate: string, status: string][]; notes: Note[] }
  /** Signs: [icon, English, Arabic]. */
  | { kind: 'signs'; caption: Pair; items: [icon: string, en: string, ar: string][] }
  /** A paper form, its fields numbered by `n`. */
  | { kind: 'form'; caption: Pair; title: string; fields: { label: string; value: string; n?: number; wide?: boolean }[]; notes: Note[]; /** printed (a label, a key card) rather than filled in by hand */ printed?: boolean }
  /** A receipt or bill. */
  | { kind: 'receipt'; caption: Pair; title: string; lines: [item: string, price: string, n?: number][]; notes: Note[] }
  /** A table (UK / US words, sizes…): the first row is the head. */
  | { kind: 'table'; caption: Pair; rows: string[][] }

/* ── Practice ───────────────────────────────────────────────────────── */

export type Exercise =
  /** Match each left item with its right item (printed shuffled). */
  | { t: 'match'; title: Pair; items: [left: string, right: string][] }
  /** Complete with a word from the box: [sentence with ___, answer]. */
  | { t: 'gaps'; title: Pair; items: [sentence: string, answer: string][] }
  /** Choose the best answer: [question, options, index of the right one]. */
  | { t: 'choose'; title: Pair; items: [q: string, options: string[], right: number][] }
  /** What do you say? [situation in Arabic, a model answer]. */
  | { t: 'say'; title: Pair; items: [situation: string, answer: string][] }
  /** Put the conversation in order (lines given in the right order, printed mixed). */
  | { t: 'order'; title: Pair; lines: string[] }

/* ── A stop ─────────────────────────────────────────────────────────── */

export interface Stop {
  n: number
  part: number
  titleEn: string
  titleAr: string
  /** lucide icon name. */
  icon: string
  /** The situation, Arabic, two or three sentences. */
  intro: string
  /** Three goals: [I can…, أستطيع…]. */
  canDo: Pair[]
  /** What to know before you go: three or four facts, each for a region. */
  know: Tip[]
  /** Twelve key words. */
  words: Word[]
  /** Apps and sites that help at this stop: [name, what for (Arabic)]. */
  apps?: Pair[]
  /** What you say (8–10). */
  say: Pair[]
  /** What you hear (8–10). */
  hear: Pair[]
  screen: Screen
  talk: {
    /** Where it happens ("London Heathrow, Terminal 4"). */
    place: string
    /** Speaker → role in Arabic; the traveller first (their lines print in red). */
    cast: Record<string, string>
    lines: Line[]
  }
  /** Three mistakes Arabic speakers make. */
  watch: Mistake[]
  /** One insider tip (Arabic, may quote English). */
  pro: string
  practice: Exercise[]
  /** Speaking in pairs: what Student A (the traveller) and Student B (the other role) do, [English, Arabic] cues. */
  roleplay: { role: Pair; a: Pair[]; b: Pair[] }
  /** The survival card: the sentences to show or read out. */
  card: Pair[]
  /** The vocabulary page, the exchanges and the check (merged in from more-*.ts). */
  more?: StopMore
}

/**
 * What every stop adds to its Student's Book pages: the vocabulary page
 * (an example for each key word, action words, word partners), the
 * exchanges page (a reply to the first six things you hear, and what you
 * may hear back after the first six things you say), and a true / false
 * check under the conversation. Kept beside the stops, by stop number.
 */
export interface StopMore {
  /** One short example sentence for each of the twelve key words, in their order. */
  examples: string[]
  /** Eight action words and phrasal verbs: [English, Arabic, example]. */
  actions: [en: string, ar: string, example: string][]
  /** Eight words that go together: [English, Arabic, example]. */
  partners: [en: string, ar: string, example: string][]
  /** How you reply to the first six things you hear: [English, Arabic]. */
  replies: Pair[]
  /** What you may hear back after the first six things you say: [English, Arabic]. */
  answers: Pair[]
  /** Four statements about the conversation: [statement, true?]. */
  check: [statement: string, isTrue: boolean][]
}

export interface Part {
  n: number
  titleEn: string
  titleAr: string
  icon: string
  /** The divider page's introduction (Arabic). */
  intro: string
}
