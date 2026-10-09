/**
 * «الإنجليزية للمواقف اليومية» (A1 → A2): the textbook's units, as data.
 *
 * The content is the book's own — its words, expressions, conversations and
 * readings — with the slips of the first version corrected: wrong Arabic
 * labels ("cash = فحص طبي", "tonight = أسود", "bread = سلطة"…), pages copied
 * from another unit (the café lines in the kitchen unit, the bus lines in the
 * directions unit…), mismatched question/answer pairs, and the hotel unit's
 * missing conversation, now written from its reading. Each unit adds a short
 * «Make it yours» task, the step the book's own method promises.
 */

export interface EverydayUnit {
  n: number
  titleEn: string
  titleAr: string
  /** What the student learns, as the unit's heading line says it. */
  goal: string
  icons: [string, string]
  /** [picture, English, Arabic] */
  vocab: [string, string, string][]
  /** [question, answer, question in Arabic, answer in Arabic] */
  expressions: [string, string, string, string][]
  /** "NAME: line" */
  talk: string[]
  reading: { title: string; body: string[] }
  /** "English task. - المهمة بالعربية" */
  yours: string[]
}

/** '⏰ Wake up = أستيقظ | 🔕 Turn off the alarm = أطفئ المنبّه' → [picture, English, Arabic][] */
export const words = (s: string): [string, string, string][] => s.split('|').map(x => {
  const [left, ar] = x.split('=')
  const t = left.trim()
  const space = t.search(/\s/)
  return [t.slice(0, space), t.slice(space + 1).trim(), (ar ?? '').trim()]
})

/** A conversation written one line per row. */
export const script = (s: string): string[] => s.split('\n').map(l => l.trim()).filter(Boolean)
