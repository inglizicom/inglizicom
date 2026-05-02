export type VocabItem = {
  /** Headline sentence — the thing the student should say. */
  en: string
  /** Arabic translation of the headline. */
  ar: string
  /** Optional concrete example sentences using the headline pattern.
   *  Goal: give the student real, speakable variations from day one. */
  examples?: string[]
  /** Primary image. Path under /public (e.g. "/lessons/unit01/wake-up.jpg")
   *  or absolute URL. */
  image?: string
  /** Optional fallback URL used when `image` 404s (e.g. you haven't added
   *  the local file yet). Lets you queue local files in over time. */
  imageFallback?: string
  /** Decorative tint used by the placeholder card when no image is provided. */
  tint?: 'amber' | 'rose' | 'sky' | 'emerald' | 'violet' | 'orange' | 'teal'
  note?: string
}

export type StaticPattern = {
  template: string
  templateAr: string
  examples: string[]
}

export type DialogLine = {
  speaker: string
  text: string
  stage?: string
}

export type VocabCategory = {
  name: string
  nameAr: string
  items: VocabItem[]
}

export type QuizQuestion = {
  prompt: string
  promptAr?: string
  promptDir?: 'ltr' | 'rtl'
  correct: string
  options: string[]
  hint?: string
}

export type ReadingWord = {
  word: string
  ar: string
  note?: string
}

export type BlankSentence = {
  before: string
  after: string
  answer: string
  options: string[]
}

export type Section =
  | { kind: 'cover'; subtitle?: string }
  | { kind: 'vocab'; title?: string; items: VocabItem[] }
  | { kind: 'vocabCategories'; title?: string; categories: VocabCategory[] }
  | { kind: 'staticSentences'; title?: string; patterns: StaticPattern[] }
  | { kind: 'conversation'; title: string; lines: DialogLine[]; note?: string }
  | { kind: 'quiz'; title?: string; questions: QuizQuestion[] }
  | { kind: 'review'; title?: string; items: VocabItem[] }
  | {
      kind: 'reading'
      title: string
      text: string
      translations: Record<string, string>
      vocab: ReadingWord[]
      blanks: BlankSentence[]
    }

export type Unit = {
  id: number
  slug: string
  emoji: string
  title: { en: string; ar: string }
  level: string
  sections: Section[]
}
