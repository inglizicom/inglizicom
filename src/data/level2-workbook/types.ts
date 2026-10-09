import type { Block } from '../level1-book.ts'

/**
 * A unit of the Level 2 workbook: what cannot be built from the textbook's
 * unit. The words and the expressions pages are made from the unit itself
 * (its vocabulary, conversation and expressions); the grammar practice and
 * the writing skills are written for the workbook, new sentences on the
 * unit's grammar point and situation.
 */
export interface L2WorkUnit {
  n: number
  /** The first of the six conversation lines to put in order. */
  orderFrom: number
  /** Grammar practice, two pages of blocks (a short reminder, then exercises). */
  grammar: [Block[], Block[]]
  /** «About you»: questions to answer with the unit's grammar. */
  aboutYou: string[]
  /** Writing skills: joining ideas, then the skill this unit's text needs. */
  writing: Block[]
  /** Questions to plan the text before writing it. */
  plan: string[]
}
