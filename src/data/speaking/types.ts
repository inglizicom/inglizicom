/**
 * speaking/types.ts — the architecture of the "Speak Your Work" course.
 *
 * WHO IT IS FOR
 * One senior Earth Observation engineer. French-Moroccan, twenty-one years in
 * the field, founder of an EO company working across fifteen African countries.
 * A1 in PRODUCTION, far beyond the teacher in subject knowledge. She has to
 * speak English in meetings, at conferences, and in front of clients — in two
 * months.
 *
 * WHY THE PREVIOUS PLAN FAILED
 * It ran four weeks of everyday English and then simply started talking about
 * satellites, as if the second thing followed from the first. It does not. A
 * learner who can chat about the weather cannot chair a meeting, because
 * nobody ever showed her that chairing a meeting IS asking questions and
 * interrupting — the two things she already learned in week two. The bridge
 * was never built; it was assumed. And each lesson carried a vague aim
 * ("talk about your day") instead of one thing she could either do or not do
 * at the end of the hour.
 *
 * THE FIX — THE LADDER
 * Every week teaches ONE communicative function, and teaches it three times at
 * rising altitude:
 *
 *     Days 1–2   LIFE     the function with friends, in a taxi, at dinner
 *     Day  3     BRIDGE   the SAME function, first professional use — and the
 *                         slide says out loud which day it comes from
 *     Days 4–5   WORK     the function in a meeting, on a call, on a stage
 *     Day  6     MEASURE  she performs it, and it is scored
 *
 * So the movement from real life to business is not a phase of the course. It
 * happens eight times, inside every week, and she can see it happening. By
 * week six the "life" days are gone entirely, because by then the transfer is
 * the thing she has been practising all along.
 *
 * ONE OBJECTIVE PER LESSON
 * `canDo` is a single sentence in her voice, and `exit` tests exactly that
 * sentence and nothing else. If a lesson cannot be reduced to one can-do
 * statement, the lesson is badly designed and must be split.
 *
 * ESL FOR ARABIC SPEAKERS
 * Every lesson names ONE `trap` — a mistake that comes from Arabic, not from
 * carelessness — with the wrong sentence, the right sentence, and the Arabic
 * structure underneath it. An Arabic speaker says "I am engineer" because
 * «أنا مهندسة» has nothing before the job; telling her to "add an article" is
 * useless, and showing her why her ear refuses it is not. `sound` does the
 * same for pronunciation. Where her French helps or hurts, the slide says so:
 * her French hands her /p/ and /v/ free, and her Arabic hands her /θ/ and /ð/
 * free, which is the opposite of what most learners get.
 */

export type Ex = { en: string; ar: string }

export type Level = 'A1' | 'A2' | 'B1'

/** Where a lesson sits on the ladder. `bridge` days are the hinge of the whole
 *  course: they take a function she can already perform socially and move it,
 *  in the same hour, into her working life. */
export type Track = 'life' | 'bridge' | 'work' | 'measure'

/** The one thing she can do at the end. Written in her voice, in the first
 *  person, and small enough to test in two minutes. */
export type CanDo = Ex

/** A ready-to-say phrase. `use` says WHEN to reach for it — a phrase without a
 *  trigger is a phrase she will never retrieve under pressure. */
export type Chunk = { en: string; ar: string; use?: string }

/** ONE structure per lesson, given as a frame to fill, never as a rule to
 *  understand. She is A1 in production: the moment the lesson explains the
 *  present perfect it stops being a speaking lesson. */
export type Pattern = { frame: string; ar: string; examples: string[] }

/** The Arabic-L1 trap. `why` is the point — the Arabic structure that makes
 *  the English feel wrong to her ear. Naming it turns a "careless mistake"
 *  into a predictable one she can catch herself. */
export type Trap = {
  wrong: string
  right: string
  why: string
  whyAr: string
  /** Set when her French pushes the same error, or rescues her from it. */
  french?: string
}

/** Pronunciation, chosen for an Arabic speaker specifically. `pairs` are
 *  minimal pairs to drill; `gift` marks the sounds her Arabic or French gives
 *  her for nothing, which is worth saying out loud — a learner who knows what
 *  she already owns stops being afraid of the rest. */
export type Sound = {
  focus: string
  focusAr: string
  pairs: [string, string][]
  tip: string
  tipAr: string
  gift?: string
}

/** Her own field's words. `say` is a pronunciation respelling. */
export type Word = { en: string; ar: string; say?: string }

export type Drill = { instruction: string; instructionAr: string; prompts: string[] }

export type Dialogue = {
  title: string; titleAr: string
  setting: string; settingAr: string
  turns: { who: 'A' | 'B'; en: string; ar?: string; note?: string }[]
  watch?: { en: string; ar: string }
}

export type Speech = {
  title: string; titleAr: string
  lines: string[]
  note?: string; noteAr?: string
}

/** Measured, not felt. `pass` is written so that a different teacher, on a
 *  different day, would reach the same verdict. */
export type ExitCheck = { task: string; taskAr: string; pass: string; passAr: string }

export type Lesson = {
  no: number
  week: number
  track: Track
  level: Level
  title: string; titleAr: string
  /** The single objective. Everything else in the lesson serves this. */
  canDo: CanDo
  /** For `bridge` and `work` days: the LIFE day whose skill is being moved up.
   *  Shown on the slide, so she sees the transfer instead of being told about it. */
  from?: { day: number; what: string; whatAr: string }
  warm: { open: Ex }
  target: Chunk[]
  pattern: Pattern
  trap: Trap
  sound: Sound
  vocab?: Word[]
  drill: Drill
  dialogue?: Dialogue
  speech?: Speech
  hotSeat: string[]
  exit: ExitCheck
  homework: Ex
}

/** The eight weeks. One function each, and the same climb inside every one. */
export const WEEKS: {
  no: number; fn: string; fnAr: string
  life: string; work: string
  colour: string
}[] = [
  { no: 1, fn: 'Identity',            fnAr: 'من أنا',
    life: 'saying hello and who you are', work: 'introducing yourself and your company', colour: '#b45309' },
  { no: 2, fn: 'Questions & answers', fnAr: 'السؤال والجواب',
    life: 'keeping a conversation alive', work: 'asking and checking in a meeting', colour: '#b45309' },
  { no: 3, fn: 'Time',                fnAr: 'الزمن',
    life: 'your day, your past, your plans', work: 'project history and what happens next', colour: '#15803d' },
  { no: 4, fn: 'Explaining',          fnAr: 'الشرح',
    life: 'describing things and places', work: 'explaining your work and your method', colour: '#15803d' },
  { no: 5, fn: 'Numbers & evidence',  fnAr: 'الأرقام والأدلة',
    life: 'prices, dates, quantities', work: 'results, figures, maps and charts', colour: '#6d28d9' },
  { no: 6, fn: 'Opinions & friction', fnAr: 'الرأي والاختلاف',
    life: 'saying what you think, saying no', work: 'disagreeing and negotiating at work', colour: '#6d28d9' },
  { no: 7, fn: 'Presenting',          fnAr: 'العرض',
    life: 'telling a story people follow', work: 'the talk, the shape, the slides', colour: '#a16207' },
  { no: 8, fn: 'Leading',             fnAr: 'القيادة',
    life: '—', work: 'chairing, questions, networking, the pitch', colour: '#a16207' },
]

export const TRACK_META: Record<Track, { label: string; ar: string; hint: string }> = {
  life:    { label: 'Real life', ar: 'الحياة',    hint: 'Friends, taxis, dinner. No work vocabulary at all.' },
  bridge:  { label: 'Bridge',    ar: 'الجسر',     hint: 'The same skill as the life day — moved into her working life, in one hour.' },
  work:    { label: 'At work',   ar: 'في العمل',  hint: 'Meetings, calls, stages, clients.' },
  measure: { label: 'Measure',   ar: 'قياس',      hint: 'She performs. Nothing new is taught.' },
}

/** THE SIXTY-MINUTE CLOCK.
 *
 *  Recall before teaching, input before output, measurement before homework.
 *  Thirty-seven of the sixty minutes are her producing language — if that was
 *  not true, the lesson went wrong however good the material was. */
export const STAGE_PLAN: { key: string; label: string; ar: string; mins: number; why: string }[] = [
  { key: 'warmup',   label: 'Warm-up',      ar: 'إحماء',        mins: 5,  why: 'She speaks before anything is taught. Correct nothing here.' },
  { key: 'goal',     label: 'Objective',    ar: 'الهدف',        mins: 2,  why: 'One can-do sentence, and the exit test that proves it. Tell her both now.' },
  { key: 'target',   label: 'Phrases',      ar: 'العبارات',     mins: 8,  why: 'Six or seven, each with a trigger. Say them, do not explain them.' },
  { key: 'pattern',  label: 'Pattern',      ar: 'القالب',       mins: 4,  why: 'One frame to fill. Never a grammar rule.' },
  { key: 'trap',     label: 'Arabic trap',  ar: 'فخ العربية',   mins: 4,  why: 'The mistake her first language makes for her — named, so she can catch it.' },
  { key: 'sound',    label: 'Sound',        ar: 'النطق',        mins: 4,  why: 'Minimal pairs chosen for an Arabic speaker, not from a textbook.' },
  { key: 'vocab',    label: 'Her words',    ar: 'كلماتها',      mins: 3,  why: 'Vocabulary from her own field. Skipped on pure life days.' },
  { key: 'drill',    label: 'Drill',        ar: 'التمرين',      mins: 6,  why: 'Fast and teacher-led. Speed is the target, not beauty.' },
  { key: 'dialogue', label: 'Conversation', ar: 'الحوار',       mins: 10, why: 'Run it twice — once to read, once against the watch note.' },
  { key: 'hotseat',  label: 'Hot seat',     ar: 'الأسئلة',      mins: 8,  why: 'No notes, no warning. This is the part that transfers.' },
  { key: 'speech',   label: 'Say it all',   ar: 'قوليها كاملة', mins: 3,  why: 'Record it. It is tomorrow\'s evidence.' },
  { key: 'exit',     label: 'Exit check',   ar: 'اختبار الخروج', mins: 2, why: 'Pass, or it runs again at the top of tomorrow. Never skip it.' },
  { key: 'homework', label: 'Homework',     ar: 'الواجب',       mins: 1,  why: 'It becomes the first five minutes of the next lesson.' },
]

export const PER_WEEK = 6
export const weekOf = (no: number) => Math.ceil(no / PER_WEEK)
export const dayOf  = (no: number) => ((no - 1) % PER_WEEK) + 1
