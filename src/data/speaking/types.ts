/**
 * speaking/types.ts — the architecture of the "Speak Your Work" course.
 *
 * WHO IT IS FOR
 * One senior Earth Observation engineer. French-Moroccan, twenty-one years in
 * the field, founder of an EO company working across fifteen African countries.
 * Her subject knowledge is far beyond the teacher's. Her English PRODUCTION is
 * near zero — she has almost never spoken it out loud.
 *
 * WHAT WAS WRONG BEFORE, TWICE
 *
 * First version: four weeks of everyday English, then it simply started talking
 * about satellites, as if the second thing followed from the first.
 *
 * Second version: the everyday weeks were built out of open social
 * conversation — meet a neighbour on the staircase and keep it alive for thirty
 * seconds. That is not a beginner task. It is one of the hardest things in a
 * language, because nothing in it is predictable: she has to invent content,
 * choose a register and improvise, all at once. And the lessons quietly used
 * grammar she had never been taught — tag questions on day 4, "would you mind
 * + -ing" on day 5. Every lesson climbed from simple to advanced inside itself,
 * so there was no level she could stand on.
 *
 * THIS VERSION — PLACES FIRST, THEN PEOPLE, THEN WORK
 *
 * A beginner starts where the language is PREDICTABLE. In a café there are
 * about nine things anyone ever says, and she can learn all nine. That is why
 * units 1 and 2 are places and errands: café, supermarket, pharmacy, market,
 * taxi, restaurant, bank, doctor, directions, hotel. Short exchanges, fixed
 * scripts, an outcome she can see. Only once she can survive a day out loud do
 * the lessons ask her to talk about herself, and only after that do they touch
 * her work.
 *
 *     Unit 1  Every day, outside      café, shop, pharmacy, market, taxi
 *     Unit 2  Places you must talk in restaurant, bank, doctor, street, hotel
 *     Unit 3  You and your people     your name, family, home, day, likes
 *     Unit 4  Yesterday and tomorrow  the past, plans, dates, the telephone
 *     Unit 5  Your work, in easy words   ← the bridge starts here, day 25
 *     Unit 6  Talking with colleagues
 *     Unit 7  Numbers and explaining
 *     Unit 8  Business English
 *
 * ONE GRAMMAR STEP PER LESSON, AND NEVER A JUMP
 *
 * `grammar.step` is the single new structure. `GRAMMAR_LADDER` lists what has
 * been taught by the end of each unit, and NOTHING in a lesson may use a
 * structure from a later unit. No past tense before unit 4. No present perfect
 * before unit 7. If a phrase is genuinely useful earlier, it is taught as a
 * fixed sound-shape she repeats — "I'd like", "how much is it" — never opened
 * up as grammar. Opening the grammar is how a speaking lesson turns into a
 * lecture and she stops talking.
 *
 * ESL FOR ARABIC SPEAKERS
 *
 * Every lesson names ONE `trap` — a mistake that comes from Arabic, with the
 * wrong sentence, the right sentence, and the Arabic structure underneath it.
 * "I am engineer" because «أنا مهندسة» has nothing before the job. Telling her
 * to add an article does nothing; showing her why her ear refuses it turns a
 * careless mistake into a predictable one she can catch herself. Where her
 * French is the real culprit, the slide says so.
 *
 * FIVE STEPS, NOT THIRTEEN
 *
 * Every lesson is five numbered steps: WORDS, SENTENCES, CONVERSATION, YOUR
 * TURN, HOMEWORK. Grammar, pronunciation and the Arabic trap live inside step
 * 2, where they belong, instead of each taking a slide of their own.
 */

export type Ex = { en: string; ar: string }

export type Level = 'A0' | 'A1' | 'A2' | 'B1'

/** STEP 1 — a word. `say` is a pronunciation respelling, because she has read
 *  far more English than she has ever said. */
export type Word = { en: string; ar: string; say?: string }

/** STEP 2 — a sentence she can say today, built only from words she has and
 *  grammar she has been taught. `use` says when to reach for it. */
export type Sentence = { en: string; ar: string; use?: string }

/** The ONE new structure, given as a frame to fill. Never a rule to analyse. */
export type Grammar = {
  step: string
  stepAr: string
  frame: string
  examples: string[]
  /** Set when the structure is taught as a fixed chunk rather than opened up. */
  chunk?: boolean
}

/** The Arabic-L1 trap. `why` is the point — the Arabic structure that makes the
 *  English feel wrong to her ear. */
export type Trap = {
  wrong: string
  right: string
  why: string
  whyAr: string
  /** Set when her French pushes the same error, or rescues her from it. */
  french?: string
}

/** Pronunciation, chosen for an Arabic speaker specifically. `gift` marks the
 *  sounds her Arabic or French already gives her for nothing. */
export type Sound = {
  focus: string
  focusAr: string
  pairs: [string, string][]
  tip: string
  tipAr: string
  gift?: string
}

/** STEP 3 — short and simple in the early units. A0 conversations are eight
 *  lines of four words, not fifteen lines of fifteen. */
export type Dialogue = {
  title: string; titleAr: string
  setting: string; settingAr: string
  turns: { who: 'A' | 'B'; en: string; ar: string; note?: string }[]
  watch?: Ex
}

/** STEP 4 — she does it. `roleplay` is what the teacher plays; `rounds` are the
 *  variations, each one a little harder than the last. */
export type Practice = {
  roleplay: string; roleplayAr: string
  rounds: string[]
}

/** Measured, not felt. `pass` is written so a different teacher would reach the
 *  same verdict. */
export type ExitCheck = { task: string; taskAr: string; pass: string; passAr: string }

export type Lesson = {
  no: number
  unit: number
  level: Level
  /** The place or situation. It is the title people remember: "The café". */
  where: string; whereAr: string
  title: string; titleAr: string
  canDo: Ex
  /** Sixty seconds of talking before anything is taught. Correct nothing. */
  warm: Ex
  words: Word[]
  sentences: Sentence[]
  grammar: Grammar
  trap: Trap
  sound?: Sound
  dialogue: Dialogue
  practice: Practice
  exit: ExitCheck
  homework: Ex
}

/** The eight units. `bridge` marks where her working life first appears. */
export const UNITS: {
  no: number; title: string; titleAr: string
  what: string; whatAr: string
  grammar: string
  level: Level
  colour: string
  bridge?: boolean
}[] = [
  { no: 1, title: 'Every day, outside', titleAr: 'كل يوم، في الخارج',
    what: 'Café · supermarket · pharmacy · market · taxi',
    whatAr: 'مقهى · سوق · صيدلية · سوق شعبي · سيارة أجرة',
    grammar: 'a / an · please · how much · numbers · I would like', level: 'A0', colour: '#0e7490' },
  { no: 2, title: 'Places you have to talk in', titleAr: 'أماكن عليك الكلام فيها',
    what: 'Restaurant · bank · doctor · directions · hotel',
    whatAr: 'مطعم · بنك · طبيب · اتجاهات · فندق',
    grammar: 'do / does questions · can and could · where is · there is', level: 'A1', colour: '#0e7490' },
  { no: 3, title: 'You and your people', titleAr: 'أنتِ ومن حولك',
    what: 'Your name · family · home · your day · what you like',
    whatAr: 'اسمك · عائلتك · بيتك · يومك · ما تحبين',
    grammar: 'to be · my and your · he works / she lives · usually', level: 'A1', colour: '#15803d' },
  { no: 4, title: 'Yesterday and tomorrow', titleAr: 'أمس وغداً',
    what: 'Last weekend · what happened · plans · dates · the phone',
    whatAr: 'العطلة الماضية · ما حدث · الخطط · التواريخ · الهاتف',
    grammar: 'past simple · going to · on / in / at', level: 'A1', colour: '#15803d' },
  { no: 5, title: 'Your work, in easy words', titleAr: 'عملك بكلمات سهلة',
    what: 'What you do · where you work · your working day · your projects',
    whatAr: 'ماذا تعملين · أين · يوم عملك · مشاريعك',
    grammar: 'present continuous · because and so', level: 'A2', colour: '#6d28d9', bridge: true },
  { no: 6, title: 'Talking with colleagues', titleAr: 'الحديث مع الزملاء',
    what: 'Meeting people at work · the phone · asking in a meeting · saying no',
    whatAr: 'لقاء الناس في العمل · الهاتف · السؤال في اجتماع · قول لا',
    grammar: 'would · could · should · polite requests', level: 'A2', colour: '#6d28d9' },
  { no: 7, title: 'Numbers and explaining', titleAr: 'الأرقام والشرح',
    what: 'Results · how long · step by step · maps and charts · questions',
    whatAr: 'النتائج · منذ متى · خطوة بخطوة · الخرائط · الأسئلة',
    grammar: 'present perfect · for and since · comparatives', level: 'B1', colour: '#a16207' },
  { no: 8, title: 'Business English', titleAr: 'إنجليزية الأعمال',
    what: 'Meetings · agreeing · presenting · hard questions · your pitch',
    whatAr: 'الاجتماعات · الاتفاق · العرض · الأسئلة الصعبة · عرضك',
    grammar: 'everything, plus if-sentences', level: 'B1', colour: '#a16207' },
]

/** What she is allowed to have been taught, by the end of each unit. A lesson
 *  that uses a structure from a later row is a bug, not a stretch. */
export const GRAMMAR_LADDER: { unit: number; taught: string[] }[] = [
  { unit: 1, taught: ['a / an', 'please and thank you', 'numbers and prices', 'how much is it', 'I would like (as a chunk)', 'yes / no / sorry'] },
  { unit: 2, taught: ['do you have …?', 'can I / could I', 'where is / where are', 'there is / there are', 'prepositions of place'] },
  { unit: 3, taught: ['I am / you are / she is', 'my, your, his, her', 'he works / she lives (-s)', 'always, usually, never', 'I like / I do not like'] },
  { unit: 4, taught: ['past simple (went, saw, was)', 'going to for plans', 'on Monday / in March / at six', 'last, next, ago'] },
  { unit: 5, taught: ['present continuous (I am working)', 'because and so', 'question words in full'] },
  { unit: 6, taught: ['would, could, should', 'would you mind', 'I think / I do not think'] },
  { unit: 7, taught: ['present perfect (I have worked)', 'for and since', 'comparatives and superlatives', 'first, then, after that'] },
  { unit: 8, taught: ['if-sentences', 'everything above, under pressure'] },
]

/** THE FIVE STEPS. One lesson, five slides, in this order, always. */
export const STEPS: { key: string; n: number; label: string; ar: string; mins: number; why: string }[] = [
  { key: 'words',    n: 1, label: 'Words',        ar: 'الكلمات',  mins: 10,
    why: 'Six to eight words. Say each one, do not explain it. Nothing else happens in this step.' },
  { key: 'sentences', n: 2, label: 'Sentences',   ar: 'الجمل',    mins: 15,
    why: 'The same words, now in whole sentences — plus today’s one grammar step and the Arabic trap.' },
  { key: 'talk',     n: 3, label: 'Conversation', ar: 'الحوار',   mins: 12,
    why: 'Read it twice. Once to understand, once with her playing B and the book closed.' },
  { key: 'yourturn', n: 4, label: 'Your turn',    ar: 'دورك',     mins: 20,
    why: 'She does it, with no notes. This is the part that transfers, and it is the biggest block for a reason.' },
  { key: 'homework', n: 5, label: 'Homework',     ar: 'الواجب',   mins: 3,
    why: 'One small thing. It becomes the first minutes of tomorrow.' },
]

export const PER_UNIT = 6
export const unitOf = (no: number) => Math.ceil(no / PER_UNIT)
export const dayInUnit = (no: number) => ((no - 1) % PER_UNIT) + 1
