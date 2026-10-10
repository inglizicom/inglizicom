/**
 * Level 1 (A0 → A1) play cards «العب وتكلّم الإنجليزية», the card game of the
 * Level 1 box (textbook, workbook, extended vocabulary book, cards).
 *
 * A card has two sides. The player's side (front) shows what to answer: a
 * picture, an Arabic sentence, a silly question, a sentence with a mistake.
 * The asker's side (back) repeats the question and gives the answer in
 * English and Arabic, so a parent who has no English can hold the card up,
 * ask, and check. Every card belongs to a lesson of the textbook (its number
 * on both sides, so a family plays only the lessons studied) and takes its
 * scene from Moroccan life. The words of the picture cards are the lesson's
 * extended vocabulary: the book's words and the Moroccan ones the extended
 * vocabulary book adds, one list for both.
 *
 * This is the prototype: lessons 1 and 13 and two wild cards (18 cards, two
 * sheets of nine).
 */

export type CardKind = 'picture' | 'situation' | 'translate' | 'silly' | 'fix' | 'wild'

export interface CardLesson {
  n: number
  titleEn: string
  titleAr: string
  /** The lesson's Moroccan scene, printed on its cards. */
  sceneEn: string
  sceneAr: string
  icon: string
  /** The lesson's colour, and its light tint. */
  m: string
  s: string
}

/** A word of the lesson's extended vocabulary: the book's words and the Moroccan ones. */
export interface CardWord { en: string; ar: string; icon: string; /** Photo file name (public/level1-cards/photos/<slug>.webp). */ slug: string; moroccan?: boolean }

export interface PlayCard {
  id: string
  kind: CardKind
  /** The lesson (0 for a wild card). */
  lesson: number
  /** Player's side: the picture (an emoji until the photo is there). */
  icon?: string
  /** A photo for the picture (file name in public/level1-cards/photos, without the extension). */
  photo?: string
  /** Player's side: the question or the sentence, in English and / or Arabic. */
  en?: string
  ar?: string
  /** Asker's side: the answer, English and Arabic. */
  answerEn: string
  answerAr: string
  /** Asker's side: what to accept, or a bonus (Arabic, for the parent). */
  note?: string
  points: 1 | 2 | 3
}

export const KINDS: Record<CardKind, { en: string; ar: string; icon: string; doEn: string; doAr: string }> = {
  picture: { en: 'Picture', ar: 'صورة', icon: '🖼️', doEn: "What's this?", doAr: 'ما هذا؟' },
  situation: { en: 'What do you say?', ar: 'ماذا تقول؟', icon: '💬', doEn: 'What do you say?', doAr: 'ماذا تقول؟' },
  translate: { en: 'Say it in English', ar: 'قلها بالإنجليزية', icon: '🔁', doEn: 'Say it in English!', doAr: 'قلها بالإنجليزية!' },
  silly: { en: 'Silly question', ar: 'سؤال مضحك', icon: '🤪', doEn: 'Answer in English!', doAr: 'أجب بالإنجليزية!' },
  fix: { en: 'Fix it', ar: 'صحّح الخطأ', icon: '🔧', doEn: 'Find the mistake!', doAr: 'جد الخطأ وصحّحه!' },
  wild: { en: 'Wild card', ar: 'بطاقة مفاجأة', icon: '🃏', doEn: 'Surprise!', doAr: 'مفاجأة!' },
}

export const CARD_LESSONS: CardLesson[] = [
  { n: 1, titleEn: 'Greetings', titleAr: 'التحيات', sceneEn: 'At the café', sceneAr: 'في المقهى', icon: '☕', m: '#2448D8', s: '#E8EEFF' },
  { n: 13, titleEn: 'The food I like', titleAr: 'الطعام الذي أحبه', sceneEn: 'The Moroccan kitchen', sceneAr: 'المطبخ المغربي', icon: '🍲', m: '#D9541E', s: '#FFEFE6' },
]
/** Wild cards: the deck's own colours. */
export const WILD = { m: '#5B21B6', s: '#F1EBFF', gold: '#F5B82E' }

/** Lesson 13's extended vocabulary (the book's words, then the Moroccan ones). */
export const WORDS: Record<number, CardWord[]> = {
  13: [
    { en: 'bread', ar: 'خبز', icon: '🍞', slug: 'bread' },
    { en: 'cheese', ar: 'جبن', icon: '🧀', slug: 'cheese' },
    { en: 'fish', ar: 'سمك', icon: '🐟', slug: 'fish' },
    { en: 'salad', ar: 'سلطة', icon: '🥗', slug: 'salad' },
    { en: 'cake', ar: 'كعكة', icon: '🎂', slug: 'cake' },
    { en: 'olives', ar: 'زيتون', icon: '🫒', slug: 'olives', moroccan: true },
    { en: 'honey', ar: 'عسل', icon: '🍯', slug: 'honey', moroccan: true },
    { en: 'eggs', ar: 'بيض', icon: '🥚', slug: 'eggs', moroccan: true },
    { en: 'msemen', ar: 'مسمن', icon: '🥞', slug: 'msemen', moroccan: true },
    { en: 'harira', ar: 'حريرة', icon: '🥣', slug: 'harira', moroccan: true },
    { en: 'tagine', ar: 'طاجين', icon: '🍲', slug: 'tagine', moroccan: true },
    { en: 'couscous', ar: 'كسكس', icon: '🍛', slug: 'couscous', moroccan: true },
  ],
}

export const CARDS: PlayCard[] = [
  /* ── Lesson 1 · Greetings, at the café ─────────────────────────── */
  { id: '01-1', kind: 'situation', lesson: 1, icon: '🌅',
    en: '8 a.m. You meet your neighbour at the café.', ar: 'الثامنة صباحًا. تلتقي بجارك في المقهى.',
    answerEn: 'Good morning! How are you?', answerAr: 'صباح الخير! كيف حالك؟', note: 'نقبل أيضًا: Hello! / Hi!', points: 1 },
  { id: '01-2', kind: 'situation', lesson: 1, icon: '🌙',
    en: '11 p.m. You leave your friend\'s house.', ar: 'الحادية عشرة ليلًا. تغادر بيت صديقك.',
    answerEn: 'Good night! See you tomorrow.', answerAr: 'تصبح على خير! أراك غدًا.', note: 'نقبل أيضًا: Bye! / Goodbye!', points: 1 },
  { id: '01-3', kind: 'translate', lesson: 1, ar: 'ما اسمك؟',
    answerEn: "What's your name?", answerAr: 'ما اسمك؟', note: 'نقبل أيضًا: What is your name?', points: 1 },
  { id: '01-4', kind: 'translate', lesson: 1, ar: 'تشرّفت بمعرفتك.',
    answerEn: 'Nice to meet you.', answerAr: 'تشرّفت بمعرفتك.', points: 1 },
  { id: '01-5', kind: 'silly', lesson: 1, icon: '🐪',
    en: 'Hello, Mr Camel! How are you today?', ar: 'أنت الجمل! أجب عن سؤال النادل.',
    answerEn: "I'm fine, thank you. And you?", answerAr: 'أنا بخير، شكرًا. وأنت؟', note: 'نقطة إضافية إذا قالها بصوت الجمل!', points: 2 },
  { id: '01-6', kind: 'silly', lesson: 1, icon: '🔤',
    en: 'How do you spell "couscous"?', ar: 'كيف تتهجّى كلمة كسكس بالإنجليزية؟',
    answerEn: "It's spelled C-O-U-S-C-O-U-S.", answerAr: 'تُكتب هكذا، حرفًا حرفًا.', note: 'حرف واحد خاطئ يعني لا نقطة!', points: 2 },
  { id: '01-7', kind: 'fix', lesson: 1, en: 'My name are Yassine.',
    answerEn: 'My name is Yassine.', answerAr: 'اسمي ياسين.', points: 2 },
  { id: '01-8', kind: 'fix', lesson: 1, en: "I'm fine, thank you. And your?",
    answerEn: "I'm fine, thank you. And you?", answerAr: 'أنا بخير، شكرًا. وأنت؟', points: 2 },

  /* ── Lesson 13 · The food I like, the Moroccan kitchen ─────────── */
  { id: '13-1', kind: 'picture', lesson: 13, icon: '🫒', photo: 'olives',
    answerEn: "They're olives.", answerAr: 'إنه زيتون.', note: 'نقبل أيضًا: Olives!', points: 1 },
  { id: '13-2', kind: 'picture', lesson: 13, icon: '🍯', photo: 'honey',
    answerEn: "It's honey.", answerAr: 'إنه عسل.', note: 'نقطة إضافية: msemen with honey!', points: 1 },
  { id: '13-3', kind: 'picture', lesson: 13, icon: '🍞', photo: 'bread',
    answerEn: "It's bread.", answerAr: 'إنه خبز.', points: 1 },
  { id: '13-4', kind: 'translate', lesson: 13, ar: 'أحب الطاجين بالدجاج.',
    answerEn: 'I like chicken tagine.', answerAr: 'أحب الطاجين بالدجاج.', points: 1 },
  { id: '13-5', kind: 'translate', lesson: 13, ar: 'هل تحب السمك؟ لا.',
    answerEn: "Do you like fish? No, I don't.", answerAr: 'هل تحب السمك؟ لا.', points: 2 },
  { id: '13-6', kind: 'silly', lesson: 13, icon: '🍦',
    en: 'Do you like couscous with ice cream?', ar: 'هل تحب الكسكس مع المثلجات؟',
    answerEn: "Yes, I do! / No, I don't!", answerAr: 'نعم! / لا!', note: 'نقطة إضافية: I like couscous with…', points: 2 },
  { id: '13-7', kind: 'silly', lesson: 13, icon: '⏱️',
    en: 'What food do you like? Three foods in ten seconds!', ar: 'ما الطعام الذي تحبه؟ ثلاثة أطعمة في عشر ثوانٍ!',
    answerEn: 'I like bread, cheese and olives.', answerAr: 'أحب الخبز والجبن والزيتون.', note: 'أي ثلاثة أطعمة، والجملة تبدأ بـ: I like…', points: 2 },
  { id: '13-8', kind: 'fix', lesson: 13, en: 'Do you like fish? Yes, I like.',
    answerEn: 'Do you like fish? Yes, I do.', answerAr: 'هل تحب السمك؟ نعم.', points: 2 },

  /* ── Wild cards ──────────────────────────────────────────────── */
  { id: 'w-1', kind: 'wild', lesson: 0, icon: '🛍️',
    en: 'Souk seller!', ar: 'بائع السوق!',
    answerEn: 'Answer your next card like a souk seller: very loud!', answerAr: 'أجب عن بطاقتك التالية بصوت مرتفع، كبائع في السوق!', note: 'إذا نجحت: نقطتان بدل نقطة.', points: 2 },
  { id: 'w-2', kind: 'wild', lesson: 0, icon: '🐐',
    en: 'The goat is hungry!', ar: 'الماعز جائع!',
    answerEn: 'Steal one card from the player on your right.', answerAr: 'اسرق بطاقة من اللاعب الذي على يمينك.', points: 1 },
]

/** Nine cards a sheet (3 × 3, 63 × 88 mm each). */
export const PER_SHEET = 9
export function cardSheets<T>(cards: T[]): T[][] {
  return Array.from({ length: Math.ceil(cards.length / PER_SHEET) }, (_, i) => cards.slice(i * PER_SHEET, (i + 1) * PER_SHEET))
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
