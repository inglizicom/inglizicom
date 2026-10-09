import type { Block } from '../level1-book.ts'

/**
 * Level 2 «تكلّم واكتب بدقّة» (A2 → B1): conversational English with
 * accuracy and writing. Each unit teaches one grammar point in a short
 * lesson of its own, and uses it everywhere else: the unit's expressions are
 * built on it, its conversation is full of it (`focus`, printed in the
 * grammar colour), and the writing model and template need it.
 */
export interface L2Unit {
  n: number
  module: number
  titleEn: string
  titleAr: string
  icons: [string, string]
  /** What the student learns (Arabic, the opener's line). */
  goal: string
  /** The grammar point, short (opener, contents). */
  grammarName: string
  /** Three goals, [I can… (English), أستطيع أن… (Arabic)]. */
  canDo: [string, string][]
  /** [question, answer, question in Arabic, answer in Arabic] — built on the unit's grammar. */
  expressions: [string, string, string, string][]
  /** «Notice»: how the expressions use the grammar ("English - العربية" lines). */
  notice: string[]
  tip: string[]
  /** «Your turn»: three questions about the student's own life. */
  yourTurn: string[]
  /** The conversation, "NAME: line". */
  talk: string[]
  /** Phrases of the conversation that show the grammar (printed bold in the grammar colour). */
  focus: string[]
  /** Discovery tasks under the conversation ("English - العربية"). */
  findIt: string[]
  /** Vocabulary by theme: the unit's first section. */
  vocab: L2Vocab
  /** The grammar lesson: three pages of blocks (uses, form, spelling, mistakes, practice). */
  grammar: Block[][]
  writing: {
    name: string
    nameAr: string
    /** The task, in Arabic. */
    task: string
    include: string[]
    language: string[]
    short: { label: string; body: string }
    model: { label: string; body: string }
    /** Phrases of the model that show the grammar. */
    focus: string[]
    /** The model to complete, "___" for each blank, "\n" between lines. */
    template: string
    check: string[]
  }
}

/** A unit's vocabulary: themed groups of [word, meaning, example], word partners, an exercise. */
export interface L2Vocab {
  groups: { title: string; icon: string; words: [en: string, ar: string, example: string][] }[]
  /** Words that go together: [English, Arabic]. */
  partners: [string, string][]
  /** Sentences to complete with the unit's words: [sentence with ___, answer]. */
  practice: [string, string][]
}

/** One line of the book's index: every unit, built or still to come. */
export interface L2IndexUnit { n: number; module: number; titleEn: string; titleAr: string; grammar: string; writing: string }
export interface L2Module { n: number; titleEn: string; titleAr: string }
