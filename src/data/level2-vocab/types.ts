import { pairs, type Pair, type VocabUnit } from '../workbook/vocab-book.ts'

/**
 * A Level 2 vocabulary-book unit: the Level 1 book's parts (ten picture
 * words, three groups, two conversations, ask and answer, a reading), plus
 * «Word power», the step B1 asks for: words that go together and word
 * families, with a short practice.
 */
export interface WordPower {
  /** Collocations: ten, each with its meaning. */
  together: Pair[]
  /** Word families: verb, noun, adjective ('—' where there is none). */
  families: [verb: string, noun: string, adjective: string][]
  /** Gaps to fill with a word from a family: the question names the family in brackets. */
  use: [q: string, a: string][]
}

export type L2VocabUnit = VocabUnit & { power: WordPower }

/** Word power from 'en=ar|…', the family rows and the gaps. */
export const power = (together: string, families: WordPower['families'], use: WordPower['use']): WordPower =>
  ({ together: pairs(together), families, use })
