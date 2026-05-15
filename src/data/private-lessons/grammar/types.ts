export type TokenRole = 'subject' | 'verb' | 'complement' | 'negation' | 'question' | 'filler'

export type GToken = {
  text: string
  role: TokenRole
}

export type PatternRow = {
  pronoun: string
  pronounAr: string
  verb: string
  exampleEn: string
  exampleAr: string
  emoji?: string
}

export type SentenceExample = {
  tokens: GToken[]
  ar: string
  emoji?: string
}

export type BlankExercise = {
  before: string
  after?: string
  answer: string
  choices: string[]
  ar: string
}

export type GQuizQuestion = {
  promptAr: string
  prompt?: string
  choices: string[]
  correct: number
  explanationAr: string
}

export type NoteItem = {
  type: 'mistake' | 'tip' | 'rule'
  ar: string
  wrong?: string
  right?: string
}

export type DialogueLine = {
  speaker: 'A' | 'B'
  text: string
  ar?: string
}

export type GrammarSection =
  | {
      kind: 'cover'
      emoji: string
      title: string
      titleAr: string
      level: string
      tagAr: string
    }
  | {
      kind: 'hook'
      titleAr: string
      bodyAr: string
      arabicEx: string
      englishEx: string
      noteAr: string
    }
  | {
      kind: 'patternTable'
      titleAr: string
      rows: PatternRow[]
    }
  | {
      kind: 'sentences'
      titleAr: string
      items: SentenceExample[]
    }
  | {
      kind: 'negation'
      titleAr: string
      bodyAr: string
      items: SentenceExample[]
    }
  | {
      kind: 'questions'
      titleAr: string
      bodyAr: string
      items: { q: GToken[]; ar: string }[]
    }
  | {
      kind: 'notes'
      titleAr: string
      items: NoteItem[]
    }
  | {
      kind: 'dialogue'
      titleAr: string
      noteAr?: string
      lines: DialogueLine[]
    }
  | {
      kind: 'practice'
      titleAr: string
      exercises: BlankExercise[]
    }
  | {
      kind: 'quiz'
      titleAr: string
      questions: GQuizQuestion[]
    }
  | {
      kind: 'summary'
      titleAr: string
      rules: { ar: string; en: string; example: string }[]
    }

export type GrammarLesson = {
  id: number
  slug: string
  emoji: string
  title: { en: string; ar: string }
  description: { en: string; ar: string }
  level: 'A0' | 'A1' | 'A2'
  isReview?: boolean
  sections: GrammarSection[]
}
