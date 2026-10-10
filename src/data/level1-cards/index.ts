import { withIds, type Game, type KemelniMode, type PlayCard } from './build.ts'
import { LESSONS_1 } from './lessons-1.ts'
import { LESSONS_2 } from './lessons-2.ts'
import { LESSONS_3 } from './lessons-3.ts'

/**
 * Level 1 (A0 → A1) play cards «العب وتكلّم الإنجليزية», the review game of
 * the Level 1 box (textbook, workbook, extended vocabulary book, cards).
 *
 * Every lesson of the textbook has the same pack of nine cards, one sheet,
 * and every card is a game reviewing what the lesson teaches (its
 * vocabulary, expressions and conversation), from words to sentences to
 * conversation: WhatDoWeCall ×2 (name it, then say the book's sentence) ·
 * TimerPlay (name as many as you can before the time runs out) · Tarjemni
 * (translate) · Ratebni (put the words in order, against the clock) ·
 * Sahehni (spot the mistake, then correct it) · Kemelni ×3 (answer the
 * question · guess the question of an answer · say what could come next).
 * The points belong to the game, the same on every card.
 *
 * The player's side shows the task; the asker's side repeats it and gives
 * the answer in English and Arabic, so someone with no English can ask and
 * check. TimerPlay accepts the book's words and those the extended
 * vocabulary book adds (marked), one word list for both.
 */

export type { Game, KemelniMode, PlayCard } from './build.ts'
export { BOUCHTA, type BouchtaCard } from './bouchta.ts'

export interface GameInfo {
  name: string
  ar: string
  doEn: string
  doAr: string
  /** How to play it, for the box (Arabic). */
  rule: string
  /** The points: [English, Arabic, stars]. */
  points: [en: string, ar: string, stars: string][]
}

export const GAMES: Record<Game, GameInfo> = {
  call: { name: 'WhatDoWeCall', ar: 'كيف نسمّيه؟',
    doEn: 'What do we call it in English?', doAr: 'ما اسمه بالإنجليزية؟',
    rule: 'أره الصورة والكلمة: يقول اسمها بالإنجليزية، ثم جملة من الكتاب فيها الكلمة.',
    points: [['Word', 'الكلمة', '★1'], ['Sentence', 'الجملة', '★+2']] },
  timer: { name: 'TimerPlay', ar: 'ضد الساعة',
    doEn: 'Before the time runs out!', doAr: 'قبل أن ينتهي الوقت!',
    rule: 'اقلب الساعة الرملية: كل جواب صحيح قبل نهاية الوقت بنقطة.',
    points: [['Each one', 'لكل جواب', '★1']] },
  tarjemni: { name: 'Tarjemni', ar: 'ترجمني',
    doEn: 'Say it in English!', doAr: 'قلها بالإنجليزية!',
    rule: 'اقرأ له الجملة بالعربية: يقولها بالإنجليزية.',
    points: [['Right', 'صحيحة', '★2']] },
  ratebni: { name: 'Ratebni', ar: 'رتّبني',
    doEn: 'Put the words in order!', doAr: 'رتّب الكلمات!',
    rule: 'الكلمات مبعثرة: يرتّبها قبل نهاية الوقت، من ذاكرته أو بالقلم والورقة.',
    points: [['Memory', 'من الذاكرة', '★3'], ['Pen', 'بالقلم', '★2']] },
  sahehni: { name: 'Sahehni', ar: 'صحّحني',
    doEn: 'Find the mistake, then correct it!', doAr: 'جد الخطأ، ثم صحّحه!',
    rule: 'في الجملة خطأ واحد: يجده بنقطة، ويصحّحه بثلاث نقاط إضافية.',
    points: [['Spot', 'يجده', '★1'], ['Fix', 'يصحّحه', '★+3']] },
  kemelni: { name: 'Kemelni', ar: 'كمّلني',
    doEn: 'Complete the conversation!', doAr: 'كمّل المحادثة!',
    rule: 'سؤال؟ يجيب عنه. جواب؟ يجد سؤاله. جملة؟ يقول ما يأتي بعدها.',
    points: [['Right line', 'جملة صحيحة', '★2']] },
}
export const GAME_ORDER: Game[] = ['call', 'timer', 'tarjemni', 'ratebni', 'sahehni', 'kemelni']

/** Kemelni's three ways: what the player hears, and what they say. */
export const KEMELNI: Record<KemelniMode, { en: string; ar: string; tagEn: string; tagAr: string }> = {
  answer: { en: 'Answer the question!', ar: 'أجب عن السؤال!', tagEn: 'Question → answer', tagAr: 'سؤال ← جواب' },
  question: { en: "What's the question?", ar: 'ما هو السؤال؟', tagEn: 'Answer → question', tagAr: 'جواب ← سؤال' },
  next: { en: 'What comes next?', ar: 'ماذا يأتي بعد ذلك؟', tagEn: 'What comes next?', tagAr: 'الجملة التالية' },
}

export interface CardLesson { n: number; titleEn: string; titleAr: string }
export const CARD_LESSONS: CardLesson[] = [
  { n: 1, titleEn: 'Greetings', titleAr: 'التحيات' },
  { n: 2, titleEn: 'Numbers, age & phone', titleAr: 'الأرقام والعمر والهاتف' },
  { n: 3, titleEn: 'Countries & jobs', titleAr: 'الدول والمهن والحالة الاجتماعية' },
  { n: 4, titleEn: 'First day at the course', titleAr: 'محادثة شاملة' },
  { n: 5, titleEn: 'Family & people', titleAr: 'العائلة ووصف الأشخاص' },
  { n: 6, titleEn: 'Wh-questions', titleAr: 'أسئلة الاستفهام' },
  { n: 7, titleEn: 'Anas and Salma', titleAr: 'القراءة: أنس وسلمى' },
  { n: 8, titleEn: 'The classroom', titleAr: 'القسم' },
  { n: 9, titleEn: 'Pronouns & verbs', titleAr: 'الضمائر والأفعال' },
  { n: 10, titleEn: 'My house', titleAr: 'البيت والأثاث' },
  { n: 11, titleEn: 'My day & the time', titleAr: 'يومي والساعة' },
  { n: 12, titleEn: 'The week', titleAr: 'أيام الأسبوع' },
  { n: 13, titleEn: 'Food', titleAr: 'الطعام' },
  { n: 14, titleEn: 'Drinks', titleAr: 'المشروبات' },
  { n: 15, titleEn: 'Transport', titleAr: 'وسائل النقل' },
  { n: 16, titleEn: 'Places & directions', titleAr: 'الأماكن والاتجاهات' },
  { n: 17, titleEn: 'My neighbourhood', titleAr: 'حيّي: يوجد / توجد' },
  { n: 18, titleEn: 'Action verbs & can', titleAr: 'الأفعال والقدرة' },
  { n: 19, titleEn: 'Hobbies', titleAr: 'الهوايات' },
]

export const CARDS: PlayCard[] = withIds([...LESSONS_1, ...LESSONS_2, ...LESSONS_3])

/** A WhatDoWeCall card's photo: its English, as a file name ("A teacher" → teacher.webp). */
export const photoOf = (c: PlayCard) =>
  c.game === 'call' ? c.answer.toLowerCase().replace(/^(a|an|the|to) /, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : null

/** Nine cards a sheet (3 × 3, 63 × 88 mm each): one sheet, one lesson. */
export const PER_SHEET = 9
export function cardSheets(cards: PlayCard[]): PlayCard[][] {
  return CARD_LESSONS.map(l => cards.filter(c => c.lesson === l.n)).filter(s => s.length)
}
/**
 * The backs of a sheet in print order: each row reversed, so that printed on
 * the other side (flipped on the long edge) every back lands behind its front.
 * An empty place stays empty (null).
 */
export function mirrorRows<T>(sheet: T[], cols = 3): (T | null)[] {
  const out: (T | null)[] = []
  for (let r = 0; r < Math.ceil(PER_SHEET / cols); r++) {
    const row = Array.from({ length: cols }, (_, c) => sheet[r * cols + c] ?? null)
    out.push(...row.reverse())
  }
  return out
}
export const lessonOf = (n: number) => CARD_LESSONS.find(l => l.n === n)
