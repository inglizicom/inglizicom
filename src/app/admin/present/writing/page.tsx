'use client'

/**
 * /admin/present/writing — "English from Zero" teaching deck for absolute
 * beginners. Every lesson follows the SAME template so the learner always knows
 * the stage they are in:
 *   Lesson cover → Plan → Objectives → Rule → Explanation → Examples → Exercises →
 *   Reading passage → Homework → Find the Mistakes → Play.
 *
 * The plan slide shows that path up front, and a rail under the header keeps it on
 * screen: current stage lit, finished ones dimmed, the rest outlined and clickable.
 * The deck also runs LIGHT by default — cards marked `extra` in the data are skipped,
 * so a lesson is teachable in one sitting; the مختصر/موسّع switch (or ?full=1) brings
 * the long version back.
 *
 * Content lives in src/data/writing-course.ts. No images — pure, clean,
 * high-contrast typography on white. Navigate: ← → / Space / side-click.
 * Full-screen: F (or the button). Zoom: Ctrl/⌘ + wheel · pinch · + − 0 · buttons.
 * On the intro slide, click any lesson to jump straight to it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Check,
  PenLine, Sparkles, Target, Lightbulb, Info, Layers, PencilLine, BookOpen, ClipboardList,
  SearchCheck, Blocks, SpellCheck, Table, FileText, ListChecks, Wand2, Menu, X, ChevronDown,
  ListTree, Globe, Instagram, Youtube, GraduationCap, Phone, StickyNote, List, Search, Move,
  Pencil, Square, Gamepad2, MessagesSquare, Route, Feather, Rows3,
} from 'lucide-react'
import { LESSONS, IRREGULAR_VERBS, REVIEWS, THREADS, type Lesson, type Ex, type Example, type QA, type Irregular, type ReviewGame, type Thread } from '@/data/writing-course'
import { NotePad, readNote, type DeckCard } from '@/components/present/NotePad'

const INK = '#2a1d12'
const GOLD = '#facc15'
const AMBER = '#b45309'
const IRR_PER = 30   // irregular verbs per reference slide

// Lessons in teaching order (data may be authored out of order; `no` is the sort key
// and can be fractional to slot lessons between others). Display numbers come from
// position, so inserting a lesson never means renumbering the rest.
const ORDERED = [...LESSONS].sort((a, b) => a.no - b.no)
const LESSON_POS = new Map<Lesson, number>()
ORDERED.forEach((L, i) => LESSON_POS.set(L, i + 1))
const numOf = (L: Lesson) => LESSON_POS.get(L) ?? Math.round(L.no)

// CEFR-aligned three-level syllabus: Unit (level band) → Module → Lessons (by `no` range).
// Units are kept to 4–12 lessons each: one unit = one sitting-sized chapter the learner
// can finish and feel finished. (The old Unit 2 carried 23 of the 50 lessons — a wall.)
type ModDef = { en: string; ar: string; from: number; to: number }
type UnitDef = { en: string; short: string; shortAr: string; ar: string; cefr: string; promise: string; promiseAr: string; modules: ModDef[] }
const SYLLABUS: UnitDef[] = [
  { en: 'Unit 1 · Writing Mechanics', short: 'Mechanics', shortAr: 'الأساسيات', ar: 'الوحدة ١ · أساسيات الكتابة', cefr: 'A1',
    promise: 'Write a correct English sentence — capitals, marks, articles.',
    promiseAr: 'تكتب جملة إنجليزية صحيحة: الحروف الكبيرة والعلامات والأدوات.',
    modules: [
      { en: 'Letters & Sounds', ar: 'الحروف والأصوات', from: 1, to: 2 },
      { en: 'Marks & Articles', ar: 'العلامات والأدوات', from: 3, to: 5 },
    ] },
  { en: 'Unit 2 · Words That Name & Describe', short: 'Words', shortAr: 'الكلمات', ar: 'الوحدة ٢ · كلمات تُسمّي وتصف', cefr: 'A1–A2',
    promise: 'Name things, own them, and describe them accurately.',
    promiseAr: 'تُسمّي الأشياء وتنسبها إلى أصحابها وتصفها بدقّة.',
    modules: [
      { en: 'Nouns & Being', ar: 'الأسماء والكينونة', from: 6, to: 7.9 },
      { en: 'Pronouns, Possessives & Adjectives', ar: 'الضمائر والملكية والصفات', from: 8, to: 9.9 },
    ] },
  { en: 'Unit 3 · The Verb Tenses', short: 'Tenses', shortAr: 'الأزمنة', ar: 'الوحدة ٣ · أزمنة الأفعال', cefr: 'A1–B1',
    promise: 'Place any action in time — past, present, future — and ask about it.',
    promiseAr: 'تضع أي فعل في زمنه — ماضٍ وحاضر ومستقبل — وتسأل عنه.',
    modules: [
      { en: 'Present & Past', ar: 'المضارع والماضي', from: 10, to: 10.55 },
      { en: 'Future, Perfect & Questions', ar: 'المستقبل والتام والأسئلة', from: 10.6, to: 10.85 },
    ] },
  { en: 'Unit 4 · Grammar That Sharpens', short: 'Precision', shortAr: 'الدقّة', ar: 'الوحدة ٤ · قواعد تصقل اللغة', cefr: 'A2–B1',
    promise: 'Agreement, modals, comparing, the passive — the polish of a real writer.',
    promiseAr: 'التطابق والأفعال الناقصة والمقارنة والمبني للمجهول — صقل الكاتب الحقيقي.',
    modules: [
      { en: 'Agreement & Prepositions', ar: 'التطابق وحروف الجر', from: 10.9, to: 11.2 },
      { en: 'Modals, Patterns & Voice', ar: 'الأفعال الناقصة والصيغ والمبني للمجهول', from: 11.3, to: 11.9 },
    ] },
  { en: 'Unit 5 · Building Sentences', short: 'Sentences', shortAr: 'الجمل', ar: 'الوحدة ٥ · بناء الجمل', cefr: 'A2–B1',
    promise: 'Join ideas into simple, compound and complex sentences that flow.',
    promiseAr: 'تربط الأفكار في جمل بسيطة ومركّبة ومعقّدة تسير بانسياب.',
    modules: [
      { en: 'Complete Sentences', ar: 'الجمل الكاملة', from: 12, to: 13 },
      { en: 'Joining Ideas', ar: 'ربط الأفكار', from: 14, to: 16.5 },
    ] },
  { en: 'Unit 6 · Punctuation & Style', short: 'Punctuation', shortAr: 'الترقيم', ar: 'الوحدة ٦ · الترقيم والأسلوب', cefr: 'A2–B1',
    promise: 'Punctuate cleanly and give your sentences rhythm — the polish readers feel.',
    promiseAr: 'ترقّم بدقّة وتمنح جملك إيقاعًا — الصقل الذي يشعر به القارئ.',
    modules: [
      { en: 'Commas & Parallels', ar: 'الفواصل والتوازي', from: 17, to: 18 },
      { en: 'Flow & Rhythm', ar: 'الانسياب والإيقاع', from: 19, to: 20 },
    ] },
  { en: 'Unit 7 · Writing Paragraphs', short: 'Paragraphs', shortAr: 'الفقرات', ar: 'الوحدة ٧ · كتابة الفقرات', cefr: 'B1',
    promise: 'Build a full paragraph — topic, support, expansion, conclusion.',
    promiseAr: 'تبني فقرة كاملة: جملة موضوعية ودعم وتوسيع وخاتمة.',
    modules: [
      { en: 'Paragraph Structure', ar: 'بنية الفقرة', from: 21, to: 22.6 },
      { en: 'Writing & Polishing', ar: 'الكتابة والصقل', from: 23, to: 25 },
    ] },
  { en: 'Unit 8 · Professional Writing', short: 'Professional', shortAr: 'الاحترافية', ar: 'الوحدة ٨ · الكتابة الاحترافية', cefr: 'B1',
    promise: 'Emails that get answered — friendly, formal, complaints, job applications.',
    promiseAr: 'إيميلات يُردّ عليها: ودّية ورسمية وشكاوى وتقديم لوظيفة.',
    modules: [
      { en: 'Emails that Connect', ar: 'إيميلات تصل', from: 26, to: 27.9 },
      { en: 'Writing that Wins', ar: 'كتابة تُقنع', from: 28, to: 29.9 },
    ] },
  { en: 'Unit 9 · Advanced Grammar', short: 'Advanced', shortAr: 'قواعد متقدّمة', ar: 'الوحدة ٩ · القواعد المتقدّمة', cefr: 'B2',
    promise: 'Judge the past, imagine the unreal, report what others said.',
    promiseAr: 'تحكم على الماضي، وتتخيّل غير الواقع، وتنقل كلام الآخرين.',
    modules: [
      { en: 'Modals, Conditionals & Regret', ar: 'الأفعال الناقصة والشرط والندم', from: 30, to: 32.9 },
      { en: 'Reporting, Voice & Clauses', ar: 'النقل والمبني للمجهول والجُمل', from: 33, to: 37.9 },
    ] },
  { en: 'Unit 10 · Essays & Argument', short: 'Essays', shortAr: 'المقالات', ar: 'الوحدة ١٠ · المقال والحجاج', cefr: 'B2',
    promise: 'Build a full essay — thesis, evidence, counter-argument, conclusion.',
    promiseAr: 'تبني مقالًا كاملًا: أطروحة ودليلًا وحجّة مضادّة وخاتمة.',
    modules: [
      { en: 'Essay Foundations', ar: 'أسس المقال', from: 38, to: 40.9 },
      { en: 'Building an Argument', ar: 'بناء الحجّة', from: 41, to: 44.9 },
    ] },
  { en: 'Unit 11 · Style, Stance & Precision', short: 'Style', shortAr: 'الأسلوب', ar: 'الوحدة ١١ · الأسلوب والموقف والدقّة', cefr: 'B2–C1',
    promise: 'Write with the control of an advanced writer — register, nuance, emphasis.',
    promiseAr: 'تكتب بتحكّم الكاتب المتقدّم: مستوى اللغة والنبرة والإبراز.',
    modules: [
      { en: 'Register & Stance', ar: 'مستوى اللغة والموقف', from: 45, to: 47.9 },
      { en: 'Emphasis & Economy', ar: 'الإبراز والاقتصاد', from: 48, to: 50.9 },
      { en: 'Precision & Sources', ar: 'الدقّة والمصادر', from: 51, to: 52.9 },
    ] },
]
const unitOf = (no: number) => SYLLABUS.find(u => u.modules.some(m => no >= m.from && no <= m.to)) ?? SYLLABUS[0]
const moduleOf = (no: number) => {
  for (const u of SYLLABUS) { const m = u.modules.find(m => no >= m.from && no <= m.to); if (m) return m }
  return SYLLABUS[0].modules[0]
}
const cefrOf = (L: Lesson) => L.cefr ?? unitOf(L.no).cefr
const lessonsIn = (m: ModDef) => ORDERED.filter(L => L.no >= m.from && L.no <= m.to)

/* ── Unit accents ─────────────────────────────────────────────────────────────
   1836 slides in exactly one colour is a long afternoon. INK stays the brand and
   GOLD stays the chrome (header, buttons, board), but the CONTENT accent shifts
   per unit — so a student feels they have walked into a new room, and the
   teacher gets a visual cue for where they are. Deep, muted tones with a light
   tint companion; only one is ever on screen at a time, so it reads as a theme
   rather than a rainbow. */
type Accent = { ink: string; tint: string; ring: string }
const UNIT_ACCENT: Accent[] = [
  { ink: '#b45309', tint: '#fef3c7', ring: '#fcd34d' },  // 1  Mechanics — amber
  { ink: '#0f766e', tint: '#ccfbf1', ring: '#5eead4' },  // 2  Words — teal
  { ink: '#4338ca', tint: '#e0e7ff', ring: '#a5b4fc' },  // 3  Tenses — indigo
  { ink: '#be123c', tint: '#ffe4e6', ring: '#fda4af' },  // 4  Precision — rose
  { ink: '#047857', tint: '#d1fae5', ring: '#6ee7b7' },  // 5  Sentences — emerald
  { ink: '#6d28d9', tint: '#ede9fe', ring: '#c4b5fd' },  // 6  Punctuation — violet
  { ink: '#c2410c', tint: '#ffedd5', ring: '#fdba74' },  // 7  Paragraphs — orange
  { ink: '#1d4ed8', tint: '#dbeafe', ring: '#93c5fd' },  // 8  Professional — blue
  { ink: '#a21caf', tint: '#fae8ff', ring: '#f0abfc' },  // 9  Advanced — fuchsia
  { ink: '#0e7490', tint: '#cffafe', ring: '#67e8f9' },  // 10 Essays — cyan
  { ink: '#7c2d12', tint: '#ffedd5', ring: '#fdba74' },  // 11 Style/C1 — bronze
]
const FALLBACK_ACCENT: Accent = { ink: AMBER, tint: '#fef3c7', ring: '#fcd34d' }

type Phase = 'cover' | 'roadmap' | 'objectives' | 'rule' | 'explain' | 'form' | 'spelling' | 'irregulars' | 'examples' | 'exercises' | 'reading' | 'homework' | 'editing' | 'model' | 'plan' | 'toolkit' | 'write' | 'checklist' | 'review' | 'thread' | 'play'
/* One step of the lesson's path: which phase, where it starts in the deck, how many
   slides it holds. Drives BOTH the plan slide and the rail that stays on screen — the
   learner should never wonder how much is left or what is coming next. */
type Stage = { phase: Phase; at: number; count: number }
type Flow = { L: Lesson; stages: Stage[]; from: number; to: number }
type Slide =
  | { t: 'intro' }
  | { t: 'end' }
  | { t: 'unit'; u: UnitDef; index: number; count: number; startsAt: number }
  | { t: 'roadmap'; L: Lesson; stages: Stage[] }
  | { t: 'play'; L: Lesson; game: ReviewGame; page: number; pages: number }
  | { t: 'thread'; u: UnitDef; index: number; thread: Thread }
  | { t: 'review'; u: UnitDef; index: number; game: ReviewGame; page: number; pages: number }
  | { t: 'cover'; L: Lesson }
  | { t: 'objectives'; L: Lesson }
  | { t: 'rule'; L: Lesson }
  | { t: 'explain'; L: Lesson }
  | { t: 'form'; L: Lesson }
  | { t: 'spelling'; L: Lesson }
  | { t: 'irregulars'; L: Lesson; items: Irregular[]; page: number; pages: number; mode: 'past' | 'pp' }
  | { t: 'examples'; L: Lesson; item: Example; page: number; pages: number }
  | { t: 'exercises'; L: Lesson; item: QA; page: number; pages: number }
  | { t: 'reading'; L: Lesson }
  | { t: 'homework'; L: Lesson }
  | { t: 'editing'; L: Lesson }
  | { t: 'model'; L: Lesson }
  | { t: 'plan'; L: Lesson }
  | { t: 'toolkit'; L: Lesson }
  | { t: 'write'; L: Lesson }
  | { t: 'checklist'; L: Lesson }

const PHASE: Record<Phase, { en: string; ar: string; Icon: typeof Target }> = {
  cover:         { en: 'Lesson',         ar: 'الدرس',        Icon: BookOpen },
  roadmap:       { en: 'Lesson Plan',    ar: 'خطة الدرس',    Icon: Route },
  objectives:    { en: 'Objectives',     ar: 'الأهداف',      Icon: Target },
  rule:          { en: 'The Rule',       ar: 'القاعدة',      Icon: Lightbulb },
  explain:       { en: 'Explanation',    ar: 'الشرح',        Icon: Info },
  form:          { en: 'How to Build It', ar: 'كيف نبنيها',   Icon: Blocks },
  spelling:      { en: 'Spelling Rules', ar: 'قواعد الإملاء', Icon: SpellCheck },
  irregulars:    { en: 'Irregular Verbs', ar: 'الأفعال الشاذة', Icon: Table },
  examples:      { en: 'Examples',       ar: 'أمثلة',         Icon: Layers },
  exercises:     { en: 'Exercise',       ar: 'تمرين',         Icon: PencilLine },
  reading:       { en: 'Reading',        ar: 'نص للقراءة',    Icon: BookOpen },
  homework:      { en: 'Homework',       ar: 'واجب منزلي',    Icon: ClipboardList },
  editing:       { en: 'Find the Mistakes', ar: 'صحّح الأخطاء', Icon: SearchCheck },
  model:         { en: 'Model Paragraph', ar: 'فقرة نموذجية', Icon: FileText },
  plan:          { en: 'Plan It',        ar: 'خطّط',          Icon: ListChecks },
  toolkit:       { en: 'Toolkit',        ar: 'أدوات الكتابة', Icon: Wand2 },
  write:         { en: 'Your Turn — Write!', ar: 'دورك — اكتب!', Icon: PenLine },
  checklist:     { en: 'Check Your Work', ar: 'راجع كتابتك',  Icon: ListChecks },
  review:        { en: 'Unit Review · Play', ar: 'مراجعة الوحدة · لعب', Icon: Gamepad2 },
  thread:        { en: 'Seen in the Wild', ar: 'القاعدة في رسائل حقيقية', Icon: MessagesSquare },
  play:          { en: 'Your Turn — Play', ar: 'دورك — العب', Icon: Gamepad2 },
}

/* Build the flat slide list + a lesson→cover-index map for jump navigation.
   A unit-opening slide is emitted whenever the deck crosses into a new unit: it gives
   the learner a sense of arrival and gives the recording a natural chapter break.

   `light` (the default) drops every card marked `extra` in the data, so a lesson runs
   at teaching weight instead of reference weight — the first lesson was 25 example
   slides, which is a wall, not a beginning. The عرض موسّع switch rebuilds the deck with
   everything. `flow` maps EVERY slide index back to its lesson's path so the rail can
   show where we are and what is still coming. */
function buildSlides(light: boolean): { slides: Slide[]; jump: Record<number, number>; unitJump: number[]; flow: Record<number, Flow> } {
  const slides: Slide[] = [{ t: 'intro' }]
  const jump: Record<number, number> = {}
  const unitJump: number[] = []
  const flow: Record<number, Flow> = {}
  const shown = <T extends { extra?: true }>(list: T[] | undefined) => (list ?? []).filter(it => !light || !it.extra)
  let currentUnit: UnitDef | null = null
  const flushReview = (u: UnitDef | null) => {
    if (!u) return
    const ui = SYLLABUS.indexOf(u)
    // See the grammar alive between two people first, then play with it.
    const thread = THREADS[ui + 1]
    if (thread) slides.push({ t: 'thread', u, index: ui + 1, thread })
    const games = REVIEWS[ui + 1] ?? []
    games.forEach((game, i) => slides.push({ t: 'review', u, index: ui + 1, game, page: i + 1, pages: games.length }))
  }
  for (const L of ORDERED) {
    const u = unitOf(L.no)
    if (u !== currentUnit) {
      flushReview(currentUnit)   // close the unit we are leaving with its games
      currentUnit = u
      const ui = SYLLABUS.indexOf(u)
      unitJump[ui] = slides.length
      slides.push({ t: 'unit', u, index: ui + 1, count: u.modules.reduce((n, m) => n + lessonsIn(m).length, 0), startsAt: numOf(L) })
    }
    jump[L.no] = slides.length
    const from = slides.length
    slides.push({ t: 'cover', L })
    // The plan comes straight after the cover: before anything is taught, the learner
    // sees the whole path of this lesson and how long it is.
    const planAt = slides.length
    slides.push({ t: 'roadmap', L, stages: [] })
    slides.push({ t: 'objectives', L })
    if (L.rule) slides.push({ t: 'rule', L })
    // Teach the language first (explanation → patterns → examples → drills → reading),
    // THEN hand over to the writing studio. A lesson may carry both: the studio is an
    // extra hands-on stage, never a replacement — anything authored here gets taught.
    if (L.explain) slides.push({ t: 'explain', L })
    if (L.form) slides.push({ t: 'form', L })
    if (L.spelling) slides.push({ t: 'spelling', L })
    if (L.irregulars) {
      const ip = Math.ceil(IRREGULAR_VERBS.length / IRR_PER)
      for (let p = 0; p < ip; p++) slides.push({ t: 'irregulars', L, items: IRREGULAR_VERBS.slice(p * IRR_PER, p * IRR_PER + IRR_PER), page: p + 1, pages: ip, mode: L.irregulars })
    }
    const ex = shown(L.examples)
    if (ex.length) {
      // One example per slide — big single card, easy to teach.
      ex.forEach((item, i) => slides.push({ t: 'examples', L, item, page: i + 1, pages: ex.length }))
    }
    const qa = shown(L.exercises)
    if (qa.length) {
      // One question per slide; the answer reveals on Space.
      qa.forEach((item, i) => slides.push({ t: 'exercises', L, item, page: i + 1, pages: qa.length }))
    }
    if (L.reading) slides.push({ t: 'reading', L })
    if (L.studio) {
      // Writing-studio flow (paragraph & email lessons) — model, plan, toolkit, write, check.
      const st = L.studio
      if (st.model) slides.push({ t: 'model', L })
      if (st.plan) slides.push({ t: 'plan', L })
      if (st.toolkit) slides.push({ t: 'toolkit', L })
      if (st.steps) slides.push({ t: 'write', L })
      if (st.checklist) slides.push({ t: 'checklist', L })
    }
    slides.push({ t: 'homework', L })
    if (L.editing) slides.push({ t: 'editing', L })
    // close every lesson on a practice SET, not a single question
    const plays = quickPlay(L, ex)
    plays.forEach((game, i) => slides.push({ t: 'play', L, game, page: i + 1, pages: plays.length }))

    // Collapse the lesson's slides into consecutive stages, then hand the same list to
    // the plan slide and to every slide of the lesson (for the rail).
    const stages: Stage[] = []
    for (let i = planAt + 1; i < slides.length; i++) {
      const phase = slides[i].t as Phase
      const tail = stages[stages.length - 1]
      if (tail && tail.phase === phase) tail.count++
      else stages.push({ phase, at: i, count: 1 })
    }
    ;(slides[planAt] as Extract<Slide, { t: 'roadmap' }>).stages = stages
    const f: Flow = { L, stages, from, to: slides.length - 1 }
    for (let i = from; i < slides.length; i++) flow[i] = f
  }
  flushReview(currentUnit)     // the last unit needs its games too
  slides.push({ t: 'end' })
  return { slides, jump, unitJump, flow }
}

/* ── One game after EVERY lesson ──────────────────────────────────────────────
   Games only closed a unit, so a student could sit through nine tense lessons
   before touching one. Each lesson now ends with a rebuild of a sentence taken
   from its OWN material — examples first, then the reading passage, then the
   corrected find-the-mistakes lines — so the practice is always the grammar just
   taught, and no new content had to be invented to get it.
   Three lessons carry no sentence short enough to rebuild; they are written out. */
const HAND_PICKED: Record<number, string[]> = {
  22.5: ['Every support needs a reason or an example.', 'A long paragraph is a short one expanded.', 'Small habits quietly rebuild a whole year.'],
  38: ['Every good essay makes one promise and keeps it.', 'The conclusion must not open a new argument.'],
  42: ['A solution must attack the cause you named.', 'The cure has to touch the cause.'],
  45: ['Formal writing respects a reader who is busy.', 'Register means imagining the reader first.'],
}

/* `examples` is the list the class ACTUALLY saw (light mode hides the extras) — the
   practice at the end of a lesson must never rebuild a sentence nobody was shown. */
function quickPlay(L: Lesson, examples: Example[]): ReviewGame[] {
  const clean = (t: string) => t.replace(/\*/g, '')
  const usable = (t: string) => {
    if (/[→✗✓·—:;"()]/.test(t)) return false
    if (!/[.?!]$/.test(t)) return false
    const w = t.slice(0, -1).trim().split(/\s+/).filter(Boolean)
    return w.length >= 5 && w.length <= 11
  }
  const games: ReviewGame[] = []

  // 1-3 rebuilds, each from a DIFFERENT sentence of this lesson
  const seen = new Set<string>()
  const pool = [
    ...examples.map(e => e.en),
    ...(L.reading?.passage ?? []),
    ...(L.editing?.correct ?? []),
  ].map(clean).filter(usable).filter(t => (seen.has(t) ? false : (seen.add(t), true)))
  const sentences = [...pool, ...(HAND_PICKED[L.no] ?? [])].slice(0, 3)
  for (const sentence of sentences) {
    const mark = sentence.slice(-1)
    const words = sentence.slice(0, -1).trim().split(/\s+/)
    const solution = [...words, mark]      // the end mark is its own tile on purpose
    games.push({
      kind: 'reorder', prompt: 'Rebuild the sentence', promptAr: 'أعد بناء الجملة',
      tiles: solution, solution, answer: sentence,
    })
  }

  // spot-the-correct, straight from the lesson's own find-the-mistakes pairs.
  // Highlights are STRIPPED from the options — the corrected line carries *marks*
  // and leaving them in would point at the answer — then shown in the reason.
  const pairs = (L.editing?.wrong ?? []).map((w, i) => [w, L.editing!.correct[i]] as const)
  for (const [wrong, right] of pairs.slice(0, 3)) {
    const a = clean(wrong).trim(), b = clean(right).trim()
    if (!a || !b || a === b || b.length > 130) continue
    const rightFirst = (a.length + b.length) % 2 === 0     // stable, not always second
    games.push({
      kind: 'pick',
      prompt: 'Which one is correct?', promptAr: 'أيّهما الصحيح؟',
      options: rightFirst ? [b, a] : [a, b],
      answer: rightFirst ? 0 : 1,
      why: `Corrected: ${right}`,
      whyAr: 'الفروق مظلّلة في الجملة الصحيحة.',
    })
  }

  return games.slice(0, 5)
}

/* ── Review games — actually playable ────────────────────────────────────────
   These used to reveal the answer on Space and nothing else, which gave students
   no way to try, be wrong, and fix it — the part that does the learning. Each is
   now interactive: place tiles, connect pairs, choose an option and be told you
   are wrong. Space still reveals, as the teacher's override. Each lives in its
   own component so its attempt state resets when the slide changes. */

function ReorderGame({ g, revealed, AC }: { g: Extract<ReviewGame, { kind: 'reorder' }>; revealed: boolean; AC: Accent }) {
  const [placed, setPlaced] = useState<number[]>([])          // indices into shuffled
  const shuffled = useMemo(() => {
    const seed = [...g.answer].reduce((a, c) => a + c.charCodeAt(0), 0)
    const a = g.tiles.map((t, i) => ({ t, i }))
    for (let i = a.length - 1; i > 0; i--) { const j = (seed * (i + 7)) % (i + 1); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }, [g])
  const full = placed.length === g.tiles.length
  const attempt = placed.map(i => shuffled[i].t)
  const correct = full && attempt.every((t, i) => t === g.solution[i])
  const long = g.tiles.some(t => t.length > 24)

  const Tile = ({ text, onClick, tone }: { text: string; onClick?: () => void; tone: 'pool' | 'ok' | 'bad' | 'set' }) => (
    <button onClick={e => { e.currentTarget.blur(); onClick?.() }} disabled={revealed}
      className={`rounded-2xl font-black transit ion-all ${onClick && !revealed ? 'hover:-translate-y-[3px] cursor-pointer' : 'cursor-default'}`}
      style={{
        fontSize: long ? '1.15vw' : '1.8vw', padding: long ? '0.9vh 1.2vw' : '1vh 1.5vw',
        maxWidth: long ? '62vw' : undefined, textAlign: long ? 'left' : 'center',
        background: tone === 'ok' ? '#ecfdf5' : tone === 'bad' ? '#fef2f2' : '#fff',
        color: tone === 'ok' ? '#065f46' : tone === 'bad' ? '#991b1b' : INK,
        boxShadow: `0 10px 24px -18px rgba(42,29,18,0.6), inset 0 0 0 2.5px ${tone === 'ok' ? '#6ee7b7' : tone === 'bad' ? '#fca5a5' : AC.ring}`,
      }}>{text}</button>
  )

  return (
    <>
      {/* the pool */}
      <div className="flex flex-wrap items-center justify-center gap-[0.8vw] min-h-[6vh]">
        {shuffled.map((x, i) => placed.includes(i) ? null : (
          <Tile key={i} text={x.t} tone="pool" onClick={() => setPlaced(p => [...p, i])} />
        ))}
        {!placed.length && <span className="font-bold text-stone-300" style={{ fontSize: '0.9vw' }}>اضغط الكلمات بالترتيب الصحيح</span>}
      </div>

      {/* the answer line */}
      <div className="w-full rounded-[26px] px-[2vw] py-[2vh] flex flex-wrap items-center justify-center gap-[0.8vw] min-h-[9vh]"
        style={{ background: full ? (correct ? '#ecfdf5' : '#fef2f2') : '#fafaf9', boxShadow: `inset 0 0 0 2px ${full ? (correct ? '#6ee7b7' : '#fca5a5') : '#e7e5e4'}` }}>
        {placed.length
          ? placed.map((idx, k) => (
              <Tile key={k} text={shuffled[idx].t} tone={full ? (correct ? 'ok' : 'bad') : 'set'}
                onClick={() => setPlaced(p => p.filter((_, j) => j !== k))} />
            ))
          : <span className="font-bold text-stone-300" style={{ fontSize: '1vw' }}>… ابنِ الجملة هنا</span>}
      </div>

      {full && !revealed && (
        <div className="flex items-center gap-[1vw]">
          {correct
            ? <span className="flex items-center gap-2 font-black" style={{ color: '#059669', fontSize: '1.5vw' }}><Check size={26} strokeWidth={3} /> صحيح!</span>
            : <>
                <span className="font-black" style={{ color: '#dc2626', fontSize: '1.3vw' }}>ليس بعد — جرّب مرّة أخرى</span>
                <button onClick={e => { e.currentTarget.blur(); setPlaced([]) }} className="px-[1.2vw] py-[0.7vh] rounded-xl font-black" style={{ background: GOLD, color: INK, fontSize: '1vw' }}>أعد المحاولة</button>
              </>}
        </div>
      )}
      {revealed && (
        <div className="w-full rounded-[28px] px-[3vw] py-[2.4vh] flex items-center justify-center gap-[1vw]" style={{ background: '#ecfdf5', boxShadow: 'inset 0 0 0 2.5px #6ee7b7' }}>
          <Check size={28} className="text-emerald-600 shrink-0" strokeWidth={3} />
          <Marked text={g.answer} className="font-black text-center leading-[1.3]" style={{ color: '#065f46', fontSize: long ? '1.4vw' : '2.2vw' }} />
        </div>
      )}
    </>
  )
}

function MatchGame({ g, revealed, AC }: { g: Extract<ReviewGame, { kind: 'match' }>; revealed: boolean; AC: Accent }) {
  const [pick, setPick] = useState<number | null>(null)     // selected LEFT index
  const [done, setDone] = useState<number[]>([])            // solved left indices
  const [wrong, setWrong] = useState<number | null>(null)   // right index flashing red
  const rights = useMemo(() => {
    const seed = [...g.prompt].reduce((a, c) => a + c.charCodeAt(0), 0)
    const a = g.pairs.map((p, i) => ({ t: p[1], i }))
    for (let i = a.length - 1; i > 0; i--) { const j = (seed * (i + 5)) % (i + 1); [a[i], a[j]] = [a[j], a[i]] }
    return a
  }, [g])
  const all = done.length === g.pairs.length

  const tryRight = (rightIdx: number) => {
    if (pick == null || revealed) return
    if (rightIdx === pick) { setDone(d => [...d, pick]); setPick(null) }
    else { setWrong(rightIdx); setTimeout(() => setWrong(null), 550); setPick(null) }
  }

  return (
    <>
      <div dir="ltr" className="w-full grid grid-cols-2 gap-x-[4vw] gap-y-[1vh]">
        <div className="flex flex-col gap-[1vh]">
          {g.pairs.map((p, i) => {
            const solved = done.includes(i) || revealed
            return (
              <button key={i} disabled={solved} onClick={e => { e.currentTarget.blur(); setPick(i) }}
                className={`rounded-2xl text-center font-black transition-all ${solved ? '' : 'hover:-translate-y-[2px]'}`}
                style={{
                  fontSize: '1.45vw', padding: '1vh 1vw',
                  background: solved ? '#ecfdf5' : '#fff', color: solved ? '#065f46' : INK,
                  boxShadow: `inset 0 0 0 ${pick === i ? 3 : 2.5}px ${solved ? '#6ee7b7' : pick === i ? AC.ink : AC.ring}`,
                }}>{p[0]}</button>
            )
          })}
        </div>
        <div className="flex flex-col gap-[1vh]">
          {rights.map((r, k) => {
            const solved = done.includes(r.i) || revealed
            return (
              <button key={k} disabled={solved} onClick={e => { e.currentTarget.blur(); tryRight(r.i) }}
                className={`rounded-2xl text-center font-black transition-all ${solved ? '' : 'hover:-translate-y-[2px]'}`}
                style={{
                  fontSize: '1.45vw', padding: '1vh 1vw',
                  background: solved ? '#ecfdf5' : wrong === r.i ? '#fef2f2' : '#f5f5f4',
                  color: solved ? '#065f46' : wrong === r.i ? '#991b1b' : '#78716c',
                  boxShadow: `inset 0 0 0 2px ${solved ? '#6ee7b7' : wrong === r.i ? '#fca5a5' : '#e7e5e4'}`,
                }}>{r.t}</button>
            )
          })}
        </div>
      </div>
      <div className="font-bold" style={{ fontSize: '1vw', color: all ? '#059669' : '#a8a29e' }}>
        {all ? '✓ كلّها صحيحة!' : pick != null ? 'الآن اختر ما يقابلها ←' : 'اضغط كلمة على اليمين ثم ما يقابلها'}
      </div>
    </>
  )
}

function PickGame({ g, revealed, AC }: { g: Extract<ReviewGame, { kind: 'pick' }>; revealed: boolean; AC: Accent }) {
  const [tried, setTried] = useState<number[]>([])
  const got = tried.includes(g.answer) || revealed
  return (
    <>
      <div className="w-full flex flex-col gap-[1.2vh]">
        {g.options.map((o, i) => {
          const isRight = i === g.answer && (got || tried.includes(i))
          const isWrong = tried.includes(i) && i !== g.answer
          const dim = got && i !== g.answer
          return (
            <button key={i} disabled={got} onClick={e => { e.currentTarget.blur(); setTried(t => t.includes(i) ? t : [...t, i]) }}
              className={`w-full flex items-center gap-[1.2vw] rounded-2xl px-[1.8vw] py-[1.4vh] transition-all ${got ? '' : 'hover:-translate-y-[2px]'}`}
              style={{
                background: isRight ? '#ecfdf5' : isWrong ? '#fef2f2' : '#fff',
                boxShadow: `inset 0 0 0 ${isRight || isWrong ? 2.5 : 2}px ${isRight ? '#6ee7b7' : isWrong ? '#fca5a5' : AC.ring}`,
                opacity: dim ? 0.4 : 1,
              }}>
              <span className="grid place-items-center rounded-full font-black shrink-0"
                style={{ width: '2.4vw', height: '2.4vw', fontSize: '1vw',
                  background: isRight ? '#059669' : isWrong ? '#dc2626' : AC.tint,
                  color: isRight || isWrong ? '#fff' : AC.ink }}>
                {isRight ? <Check size={18} strokeWidth={3} /> : isWrong ? <X size={18} strokeWidth={3} /> : String.fromCharCode(65 + i)}
              </span>
              <Marked text={o} className="font-black text-left" style={{ color: isRight ? '#065f46' : isWrong ? '#991b1b' : INK, fontSize: '1.6vw' }} />
            </button>
          )
        })}
      </div>
      {!got && tried.length > 0 && (
        <span className="font-black" style={{ color: '#dc2626', fontSize: '1.2vw' }}>ليس هذا — جرّب غيره</span>
      )}
      {got && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-2xl px-[2.2vw] py-[1.6vh] flex items-start gap-[1vw]"
          style={{ background: AC.tint, boxShadow: `inset 0 0 0 1.5px ${AC.ring}` }}>
          <Lightbulb size={20} style={{ color: AC.ink }} className="mt-[0.3vh] shrink-0" />
          <div className="min-w-0 flex-1">
            <Marked text={g.why} className="block font-bold" style={{ color: AC.ink, fontSize: '1.25vw' }} />
            <span dir="rtl" className="block font-bold text-stone-500 mt-[0.3vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.15vw' }}>{g.whyAr}</span>
          </div>
        </motion.div>
      )}
    </>
  )
}

/* Which accent is this slide wearing? */
function accentOf(s: Slide): Accent {
  const u = (s.t === 'unit' || s.t === 'review' || s.t === 'thread') ? s.u
    : ('L' in s ? unitOf(s.L.no) : null)
  const i = u ? SYLLABUS.indexOf(u) : -1
  return UNIT_ACCENT[i] ?? FALLBACK_ACCENT
}

/* Reveal *marked* parts of an English string. */
function Marked({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const parts = text.split('*')
  return (
    <span dir="ltr" className={className} style={style}>
      {parts.map((p, i) => i % 2 === 1
        ? <span key={i} className="font-black rounded-md" style={{ color: AMBER, background: '#fef3c7', padding: '0.02em 0.28em' }}>{p}</span>
        : <span key={i}>{p}</span>)}
    </span>
  )
}

/* Reusable bilingual heading. */
function Heading({ en, ar, align = 'center', size = '2.8vw' }: { en: string; ar: string; align?: 'center' | 'left'; size?: string }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h1 className="font-black tracking-tight leading-[1.08]" style={{ color: INK, fontSize: size }}>{en}</h1>
      <div dir="rtl" className="font-bold text-stone-500 mt-[0.4vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: `calc(${size} * 0.6)` }}>{ar}</div>
    </div>
  )
}

function Footer() {
  const sep = <span className="text-white/25">·</span>
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[1.6vw] gap-y-1 px-[3vw] py-[1.4vh] text-[0.9vw] font-semibold text-white rounded-2xl" style={{ background: INK }}>
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-400" /> واتساب 0764189311</span>
      {sep}<span className="flex items-center gap-1.5"><Globe size={13} style={{ color: GOLD }} /> inglizi.com</span>
      {sep}<span className="flex items-center gap-1.5"><Instagram size={13} className="text-rose-400" /> @elqasraouihamza</span>
      {sep}<span className="flex items-center gap-1.5"><Youtube size={13} className="text-red-500" /> @hamzaelqasraoui</span>
      {sep}<span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={13} style={{ color: GOLD }} /> الأستاذ حمزة</span>
    </div>
  )
}

/* Is the event coming from somewhere the user is typing? Includes contentEditable —
   without that, every key typed into the notepad would also drive the deck. */
const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement ||
  (t instanceof HTMLElement && t.isContentEditable)

/* One board per lesson (unit openers and the intro get their own too), namespaced to
   this deck. The board itself lives in @/components/present/NotePad — every deck shares
   one implementation, one storage format, one set of habits for the teacher. */
const NOTE_PREFIX = 'inglizi.writing_notes.'
const noteKeyOf = (s: Slide) =>
  'L' in s ? `lesson-${s.L.no}` : s.t === 'unit' ? `unit-${s.index}` : s.t

/* Slides that reveal their items one-by-one on Space. */
const stepsOf = (s?: Slide) => {
  if (!s) return 0
  if (s.t === 'objectives') return s.L.objectives.length
  if (s.t === 'homework') return s.L.homework.length
  if (s.t === 'exercises') return 1
  if (s.t === 'editing') return 1
  if (s.t === 'review') return 1
  if (s.t === 'thread') return 1
  if (s.t === 'play') return 1
  if (s.t === 'write') return s.L.studio?.steps?.length ?? 0
  if (s.t === 'checklist') return s.L.studio?.checklist?.length ?? 0
  return 0
}

export default function WritingDeck() {
  /* Light by default: a lesson teaches its core cards and skips the `extra` depth.
     The switch (or ?full=1) rebuilds the deck with every card — same lesson, longer. */
  const [light, setLight] = useState(true)
  const { slides, jump, unitJump, flow } = useMemo(() => buildSlides(light), [light])
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  // Left index drawer (Unit → Module → Lesson). Closed on landing so a recording
  // starts clean — open with the ☰ button or M. Modules start expanded.
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const set = new Set<string>()
    SYLLABUS.forEach((u, ui) => u.modules.forEach((_, mi) => set.add(`${ui}-${mi}`)))
    return set
  })
  const toggleModule = (key: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })
  const last = slides.length - 1
  const s = slides[Math.min(idx, last)]

  // Rebuilding the deck (the light/full switch) changes every index: land back on the
  // cover of the lesson we were teaching instead of somewhere random inside another one.
  const keepLesson = useRef<number | null>(null)
  useEffect(() => {
    const no = keepLesson.current
    keepLesson.current = null
    setStep(0)
    setIdx(no != null && jump[no] != null ? jump[no] : i => Math.min(i, slides.length - 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides])
  const toggleLight = () => {
    keepLesson.current = 'L' in s ? s.L.no : null
    setLight(v => {
      const next = !v
      try { localStorage.setItem('writing-deck-full', next ? '0' : '1') } catch { /* private mode */ }
      return next
    })
  }

  const idxRef = useRef(idx); idxRef.current = idx
  const stepRef = useRef(step); stepRef.current = step
  useEffect(() => { setStep(0) }, [idx])

  const go = useCallback((d: number) => {
    const max = stepsOf(slides[idxRef.current])
    if (d > 0) { if (stepRef.current < max) setStep(v => v + 1); else setIdx(i => Math.min(last, i + 1)) }
    else { if (stepRef.current > 0) setStep(v => v - 1); else setIdx(i => Math.max(0, i - 1)) }
  }, [slides, last])
  const jumpTo = (no: number) => { const t = jump[no]; if (t != null) { setStep(0); setIdx(t); setDrawerOpen(false) } }
  const jumpUnit = (ui: number) => { const t = unitJump[ui]; if (t != null) { setStep(0); setIdx(t); setDrawerOpen(false) } }

  /* Opening state, settled once. Recording deep-link: ?lesson=27 opens straight at that
     lesson's cover; ?full=1 (or the remembered switch) opens the long version. Full mode
     renumbers every slide, so the deep link is applied only after that rebuild. */
  const opened = useRef(false)
  useEffect(() => {
    if (opened.current) return
    const p = new URLSearchParams(window.location.search)
    let full = p.get('full') === '1'
    if (!full) { try { full = localStorage.getItem('writing-deck-full') === '1' } catch { /* private mode */ } }
    if (full && light) { setLight(false); return }   // rebuild first, then land
    opened.current = true
    const raw = p.get('lesson')
    const no = raw ? parseFloat(raw) : NaN
    if (!isNaN(no) && jump[no] != null) { setStep(0); setIdx(jump[no]) }
  }, [slides, jump, light])

  // ── Notepad (the whiteboard that opens over the slide) ──
  // While it is open EVERY deck shortcut must stand down: Space, arrows, M, F and
  // the zoom keys are all letters you type into notes. `notesRef` is read inside the
  // key handlers so they never need to re-subscribe.
  const [notesOpen, setNotesOpen] = useState(false)
  const notesRef = useRef(notesOpen); notesRef.current = notesOpen
  const [hasNote, setHasNote] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (notesRef.current || isTyping(e.target)) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // drawer keys: M toggles the index, Escape closes it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (notesRef.current || isTyping(e.target)) return
      if (e.key.toLowerCase() === 'm') setDrawerOpen(o => !o)
      else if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  // notepad keys: N opens it, Escape closes it (Escape wins over the drawer)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && notesRef.current) { e.preventDefault(); setNotesOpen(false); return }
      if (notesRef.current || isTyping(e.target)) return
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); setNotesOpen(true) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  // full-screen
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    const onKey = (e: KeyboardEvent) => { if (notesRef.current || isTyping(e.target)) return; if (e.key.toLowerCase() === 'f') toggleFs() }
    document.addEventListener('fullscreenchange', onFs)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('keydown', onKey) }
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.() }

  // zoom + pan
  const rootRef = useRef<HTMLDivElement>(null)
  const ZMIN = 0.8, ZMAX = 2
  const [zoom, setZoom] = useState(1)
  const zRef = useRef(zoom); zRef.current = zoom
  const setZ = useCallback((v: number) => setZoom(Math.min(ZMAX, Math.max(ZMIN, parseFloat(v.toFixed(2))))), [])
  const zoomBy = useCallback((d: number) => setZ(zRef.current + d), [setZ])
  const [zin, setZin] = useState('100')
  useEffect(() => { setZin(String(Math.round(zoom * 100))) }, [zoom])
  const applyZin = () => { const n = parseInt(zin.replace(/\D/g, ''), 10); if (!isNaN(n) && n > 0) setZ(n / 100) }
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  useEffect(() => { setPan({ x: 0, y: 0 }) }, [idx])
  useEffect(() => { if (zoom <= 1) setPan({ x: 0, y: 0 }) }, [zoom])
  const onPanDown = (e: React.PointerEvent) => { if (zRef.current <= 1) return; dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; setDragging(true); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId) }
  const onPanMove = (e: React.PointerEvent) => { const d = dragRef.current; if (!d) return; setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) }) }
  const onPanUp = () => { dragRef.current = null; setDragging(false) }
  useEffect(() => {
    const el = rootRef.current; if (!el) return
    const onWheel = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 0.08 : -0.08) } }
    const onKey = (e: KeyboardEvent) => {
      if (notesRef.current || isTyping(e.target)) return
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(0.1) }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-0.1) }
      else if (e.key === '0') setZ(1)
    }
    let startDist = 0, startZoom = 1
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onTS = (e: TouchEvent) => { if (e.touches.length === 2) { startDist = dist(e.touches); startZoom = zRef.current } }
    const onTM = (e: TouchEvent) => { if (e.touches.length === 2 && startDist) { e.preventDefault(); setZ(startZoom * (dist(e.touches) / startDist)) } }
    const onTE = () => { startDist = 0 }
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    el.addEventListener('touchstart', onTS, { passive: false })
    el.addEventListener('touchmove', onTM, { passive: false })
    el.addEventListener('touchend', onTE)
    return () => { el.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); el.removeEventListener('touchstart', onTS); el.removeEventListener('touchmove', onTM); el.removeEventListener('touchend', onTE) }
  }, [zoomBy, setZ])

  const L = 'L' in s ? s.L : null
  const currentNo = L?.no ?? 0
  // The path of the lesson we are standing in, and which stage of it is live.
  const lessonFlow = flow[Math.min(idx, last)] ?? null
  const stageI = lessonFlow ? lessonFlow.stages.reduce((at, st, i) => (st.at <= idx ? i : at), -1) : -1
  const phase = s.t === 'intro' || s.t === 'end' || s.t === 'unit' ? null : (PHASE[s.t as Phase])
  // One sheet per lesson (unit openers and the intro get their own too).
  const noteKey = NOTE_PREFIX + noteKeyOf(s)
  const noteLabel = L ? `درس ${numOf(L)}` : s.t === 'unit' ? `وحدة ${s.index}` : 'لوح'
  useEffect(() => { setHasNote(!!readNote(noteKey)) }, [noteKey])
  /* What «من الدرس» can stamp onto the board for THIS lesson. */
  const noteCards: DeckCard[] = useMemo(() => {
    if (!L) return []
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const hi = (t: string) => esc(t).replace(/\*(.+?)\*/g, '<span style="color:#b45309;font-weight:800">$1</span>')
    const pair = (en: string, ar: string, big = 44) =>
      `<div style="font-size:${big}px">${hi(en)}</div><div style="font-size:${Math.round(big * 0.68)}px;color:#78716c;margin-top:10px" dir="rtl">${esc(ar)}</div>`
    return [
      { id: 'rule', label: 'القاعدة', icon: Lightbulb, make: () => pair(L.rule.en, L.rule.ar, 38) },
      { id: 'example', label: 'مثال', icon: Layers, make: () => {
        const list = L.examples ?? []
        const ex = list[Math.floor(Math.random() * (list.length || 1))]
        return ex ? pair(ex.en, ex.ar) : ''
      } },
      { id: 'objectives', label: 'الأهداف', icon: Target, make: () => `<div style="font-size:30px">${L.objectives.map(o => `• ${hi(o.en)}`).join('<br>')}</div>` },
      { id: 'homework', label: 'الواجب', icon: ClipboardList, make: () => `<div style="font-size:30px">${L.homework.map((o, i) => `${i + 1}. ${hi(o.en)}`).join('<br>')}</div>` },
    ]
  }, [L])
  // Which unit the deck is standing in — drives the header chip and the drawer highlight.
  const activeUnit = s.t === 'unit' || s.t === 'review' || s.t === 'thread' ? s.u : L ? unitOf(L.no) : null
  const activeUnitIdx = activeUnit ? SYLLABUS.indexOf(activeUnit) : -1

  return (
    <div ref={rootRef} style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: '#ffffff', color: INK }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[22vw] -right-[16vw] w-[46vw] h-[46vw] rounded-full bg-yellow-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[22vw] -left-[16vw] w-[42vw] h-[42vw] rounded-full bg-amber-50/60 blur-3xl" />

      {/* header */}
      <div className="relative z-30 flex items-center justify-center gap-2 px-[3vw] pt-[2.4vh] flex-nowrap">
        <div dir="ltr" className="absolute left-[3vw] top-[2.4vh] flex items-center gap-1.5">
          <button onClick={() => setDrawerOpen(o => !o)} title="الفهرس (M)" className="p-1.5 rounded-lg text-[#2a1d12] hover:brightness-105 transition shrink-0" style={{ background: GOLD }} aria-label="Toggle index"><Menu size={16} /></button>
          <Link href="/admin/present" title="كل الديكات" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition text-[0.9vw] font-bold"><ArrowLeft size={15} /> الديكات</Link>
          <button onClick={() => { setIdx(0); setStep(0) }} title="من البداية" className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition shrink-0" aria-label="Restart"><RotateCcw size={15} /></button>
          {/* the whiteboard — opens over this slide, closes back onto it */}
          <button onClick={() => setNotesOpen(true)} title="لوح الشرح (N) — يفتح فوق الشريحة ويعود إليها"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:brightness-95 transition text-[0.9vw] font-black shrink-0"
            style={{ background: '#fef3c7', color: AMBER, boxShadow: `inset 0 0 0 2px ${GOLD}` }} aria-label="Open note board">
            <StickyNote size={15} /> لوح الشرح
            {hasNote && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ background: AMBER }} />}
          </button>
        </div>
        {activeUnitIdx >= 0 && (
          <button onClick={() => jumpUnit(activeUnitIdx)} title="بداية الوحدة"
            className="px-2.5 py-1.5 rounded-xl font-black whitespace-nowrap hover:brightness-95 transition" style={{ background: '#fef3c7', color: AMBER, boxShadow: 'inset 0 0 0 1.5px #fcd34d' }}>
            U{activeUnitIdx + 1}
          </button>
        )}
        <span className="px-3.5 py-1.5 rounded-xl text-white font-black whitespace-nowrap flex items-center gap-2" style={{ background: INK }}>
          <PenLine size={15} style={{ color: GOLD }} /> {L ? `Lesson ${numOf(L)} / ${ORDERED.length}` : 'English from Zero'} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{L ? L.tagAr : 'الإنجليزية من الصفر'}</span>
        </span>
        {(L || s.t === 'unit' || s.t === 'review' || s.t === 'thread') && <span className="px-2.5 py-1.5 rounded-xl font-black whitespace-nowrap" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc' }}>{L ? cefrOf(L) : (s.t === 'unit' || s.t === 'review' || s.t === 'thread') ? s.u.cefr : ''}</span>}
        {phase && (
          <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#2a1d12] flex items-center gap-1.5" style={{ background: GOLD }}>
            <phase.Icon size={14} /> {phase.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{phase.ar}</span>
            {s.t === 'examples' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'exercises' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'irregulars' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'review' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'play' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
          </span>
        )}
        <div className="absolute right-[3vw] top-[2.4vh] flex items-center gap-2">
          {/* teaching weight — light keeps the core cards, موسّع adds the extra depth */}
          <button onClick={toggleLight} title={light ? 'عرض مختصر — الأساسي فقط. اضغط للعرض الموسّع' : 'عرض موسّع — كل الأمثلة. اضغط للعرض المختصر'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-black whitespace-nowrap transition hover:brightness-95 text-[0.8vw] shrink-0"
            style={light
              ? { background: '#ecfdf5', color: '#047857', boxShadow: 'inset 0 0 0 1.5px #6ee7b7' }
              : { background: '#eef2ff', color: '#4338ca', boxShadow: 'inset 0 0 0 1.5px #a5b4fc' }}>
            {light ? <Feather size={14} /> : <Rows3 size={14} />}
            <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{light ? 'مختصر' : 'موسّع'}</span>
          </button>
          <span className="text-stone-400 font-bold whitespace-nowrap text-[0.9vw]">{String(idx + 1).padStart(2, '0')} / {slides.length}</span>
          <div className="flex items-center rounded-lg border border-stone-300 bg-white shrink-0">
            <button onClick={() => zoomBy(-0.1)} disabled={zoom <= ZMIN} className="p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-l-lg transition" title="تصغير (−)" aria-label="Zoom out"><ZoomOut size={16} /></button>
            <div className="flex items-center border-x border-stone-200 px-1">
              <input value={zin} onChange={e => setZin(e.target.value.replace(/[^\d]/g, ''))} onBlur={applyZin}
                onKeyDown={e => { if (e.key === 'Enter') { applyZin(); (e.target as HTMLInputElement).blur() } }}
                inputMode="numeric" aria-label="Zoom percent" className="w-9 py-1 text-[11px] font-mono font-bold text-center bg-transparent outline-none focus:bg-amber-50 rounded" />
              <span className="text-[11px] font-mono font-bold text-stone-400">%</span>
            </div>
            <button onClick={() => zoomBy(0.1)} disabled={zoom >= ZMAX} className="p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-r-lg transition" title="تكبير (+)" aria-label="Zoom in"><ZoomIn size={16} /></button>
          </div>
          <button onClick={toggleFs} className="shrink-0 p-2 rounded-lg text-stone-500 hover:text-[#2a1d12] hover:bg-white/70 transition" title="ملء الشاشة (F)">
            {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* ── the lesson's path, always on screen ──────────────────────────────
          The lesson used to run blind: you knew the slide you were on and nothing
          about what was left. This rail names every stage of THIS lesson, marks the
          one we are in, dims the ones we finished and outlines the ones still coming
          — and each chip is a jump. */}
      {lessonFlow && !notesOpen && (
        <div className="relative z-20 shrink-0 mt-[1.2vh] px-[3vw] flex justify-center">
          <div dir="ltr" className="flex items-center gap-[0.3vw] max-w-full overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}>
            {lessonFlow.stages.map((st, i) => {
              const meta = PHASE[st.phase]
              const done = i < stageI
              const now = i === stageI
              return (
                <button key={`${st.phase}-${st.at}`} onClick={() => { setStep(0); setIdx(st.at) }}
                  title={`${meta.en} · ${meta.ar}${st.count > 1 ? ` — ${st.count}` : ''}`}
                  className="flex items-center gap-[0.3vw] rounded-full whitespace-nowrap shrink-0 transition hover:brightness-95"
                  style={{
                    padding: '0.45vh 0.6vw',
                    fontSize: '0.66vw',
                    fontWeight: 900,
                    background: now ? GOLD : done ? '#f5f5f4' : '#ffffff',
                    color: now ? INK : done ? '#a8a29e' : '#78716c',
                    boxShadow: now ? 'none' : done ? 'inset 0 0 0 1px #e7e5e4' : 'inset 0 0 0 1px #e7e5e4',
                    opacity: done ? 0.75 : 1,
                  }}>
                  <meta.Icon size={12} />
                  <span>{meta.en}</span>
                  {st.count > 1 && (
                    <span className="rounded-full px-1" style={{ background: now ? 'rgba(42,29,18,0.12)' : '#f5f5f4', color: now ? INK : '#a8a29e' }}>
                      {now ? `${Math.min(st.count, idx - st.at + 1)}/${st.count}` : st.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── left index drawer: Unit → Module → Lesson (show/hide) ── */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} className="absolute inset-0 z-[60] bg-black/25" />}
      <aside className={`absolute left-0 top-0 h-full z-[70] w-[26vw] min-w-[300px] max-w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-[1.4vw] py-[1.6vh] shrink-0" style={{ background: INK }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-black text-white" style={{ fontSize: '0.95vw' }}><ListTree size={16} style={{ color: GOLD }} /> Course Index · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الفهرس</span></span>
            <button onClick={() => setDrawerOpen(false)} className="text-white/70 hover:text-white transition" aria-label="Close index"><X size={18} /></button>
          </div>
          <div className="mt-[0.8vh] flex items-center gap-[0.6vw] text-white/50 font-bold" style={{ fontSize: '0.72vw' }}>
            <span>{ORDERED.length} lessons</span><span className="text-white/20">·</span>
            <span>{SYLLABUS.length} units</span><span className="text-white/20">·</span>
            <span style={{ color: GOLD }}>A1 → B1</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[0.8vw] py-[1.2vh]">
          {SYLLABUS.map((u, ui) => {
            const uCount = u.modules.reduce((n, m) => n + lessonsIn(m).length, 0)
            const inUnit = ui === activeUnitIdx
            return (
              <div key={ui} className="mb-[1.4vh]">
                {/* unit header — click to open the unit's own slide */}
                <button onClick={() => jumpUnit(ui)}
                  className="w-full text-left px-[0.6vw] py-[0.7vh] rounded-xl transition mb-[0.5vh]"
                  style={inUnit ? { background: '#fffbeb', boxShadow: 'inset 0 0 0 1.5px #fcd34d' } : undefined}>
                  <div className="flex items-center gap-[0.5vw]">
                    <span className="grid place-items-center rounded-lg font-black shrink-0"
                      style={{ width: 22, height: 22, background: inUnit ? GOLD : INK, color: inUnit ? INK : GOLD, fontSize: '0.7vw' }}>{ui + 1}</span>
                    <span className="font-black leading-tight truncate" style={{ color: inUnit ? AMBER : INK, fontSize: '0.88vw' }}>{u.en.split(' · ')[1]}</span>
                    <span className="ml-auto rounded font-black px-1.5 py-0.5 shrink-0" style={{ background: '#ecfeff', color: '#0e7490', fontSize: '0.66vw' }}>{u.cefr}</span>
                  </div>
                  <div dir="rtl" className="mt-[0.2vh] flex items-center gap-[0.4vw]">
                    <span className="font-bold text-stone-400 leading-tight truncate" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.74vw' }}>{u.ar.split(' · ')[1]}</span>
                    <span className="ml-auto font-bold text-stone-300 shrink-0" style={{ fontSize: '0.66vw' }}>{uCount}</span>
                  </div>
                </button>
                {u.modules.map((m, mi) => {
                  const key = `${ui}-${mi}`
                  const open = expanded.has(key)
                  const items = lessonsIn(m)
                  return (
                    <div key={mi} className="mb-[0.4vh]">
                      <button onClick={() => toggleModule(key)} className="w-full flex items-center gap-[0.5vw] px-[0.6vw] py-[0.55vh] rounded-lg hover:bg-stone-100 transition text-left">
                        <ChevronDown size={13} className="shrink-0 transition-transform" style={{ color: '#a8a29e', transform: open ? 'none' : 'rotate(-90deg)' }} />
                        <span className="font-bold truncate" style={{ color: INK, fontSize: '0.8vw' }}>{m.en}</span>
                        <span className="ml-auto shrink-0 font-bold text-stone-300" style={{ fontSize: '0.66vw' }}>{items.length}</span>
                      </button>
                      {open && (
                        <div className="ml-[1.1vw] mt-[0.3vh] flex flex-col gap-[0.25vh] border-l-2 border-stone-100 pl-[0.5vw]">
                          {items.map(L2 => {
                            const active = L2.no === currentNo
                            return (
                              <button key={L2.no} onClick={() => jumpTo(L2.no)}
                                className={`flex items-center gap-[0.5vw] px-[0.5vw] py-[0.5vh] rounded-lg text-left transition ${active ? '' : 'hover:bg-stone-100'}`}
                                style={active ? { background: '#fef3c7', boxShadow: 'inset 0 0 0 1.5px #fcd34d' } : undefined}>
                                <span className="grid place-items-center rounded-md font-black shrink-0" style={{ width: 24, height: 24, background: active ? GOLD : '#e7e5e4', color: INK, fontSize: '0.72vw' }}>{numOf(L2)}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-bold truncate" style={{ color: INK, fontSize: '0.82vw' }}>{L2.tag}</span>
                                  <span dir="rtl" className="block font-bold text-stone-400 truncate" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.7vw' }}>{L2.tagAr}</span>
                                </span>
                                {L2.studio && <PenLine size={11} className="shrink-0" style={{ color: AMBER }} />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </aside>

      {/* side-click nav — disabled while the notepad is open so a stray click
          outside the sheet cannot move the slide underneath it */}
      {s.t !== 'intro' && !notesOpen && (<>
        <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[9%] z-20 cursor-w-resize" aria-label="Previous" />
        <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[9%] z-20 cursor-e-resize" aria-label="Next" />
      </>)}

      {/* notepad — over the slide, never instead of it */}
      {notesOpen && (
        <NotePad storeKey={noteKey} label={noteLabel} cards={noteCards}
          onClose={() => setNotesOpen(false)} onDirty={setHasNote} />
      )}

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-[5vw] py-[1.6vh] relative z-10 min-h-0 overflow-hidden">
        <div className="w-full flex items-center justify-center"
          onPointerDown={onPanDown} onPointerMove={onPanMove} onPointerUp={onPanUp} onPointerCancel={onPanUp}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 150ms', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx} dir="ltr" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center">
              <SlideView s={s} step={step} onJump={jumpTo} onJumpUnit={jumpUnit} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* footer progress bar */}
      <div className="flex items-center gap-[1.5vw] px-[4vw] pb-[2vh] relative z-10">
        <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition shrink-0"><ChevronLeft size={24} /></button>
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((idx + 1) / slides.length) * 100}%`, background: GOLD }} />
        </div>
        <button onClick={() => go(1)} disabled={idx === last} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition shrink-0"><ChevronRight size={24} /></button>
      </div>
    </div>
  )
}

/* ═══ per-phase renderers ═══ */
function SlideView({ s, step, onJump, onJumpUnit }: { s: Slide; step: number; onJump: (no: number) => void; onJumpUnit: (ui: number) => void }) {
  const AC = accentOf(s)   // this unit's colour — see UNIT_ACCENT
  if (s.t === 'intro') {
    const totalLessons = ORDERED.length
    // Read the span off the syllabus rather than hard-coding it — this said
    // "A1→B1" for a while after Units 9-11 pushed the course into B2 and C1.
    const bands = ['A1', 'A2', 'B1', 'B2', 'C1']
    const seen = SYLLABUS.flatMap(u => u.cefr.split('–'))
    const lo = bands.find(b => seen.includes(b)) ?? 'A1'
    const hi = [...bands].reverse().find(b => seen.includes(b)) ?? 'C1'
    return (
      <div className="w-full max-w-[88vw] flex flex-col items-center gap-[2.2vh] text-center">
        <div>
          <div className="inline-block mb-[0.7vh] px-5 py-1.5 rounded-full font-bold tracking-[0.2em] text-[0.86vw]" style={{ background: INK, color: GOLD }}>
            ZERO → PROFESSIONAL WRITING · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>من الصفر إلى الكتابة الاحترافية</span>
          </div>
          <h1 className="font-black leading-[1.02] tracking-tight" style={{ color: INK, fontSize: '4.2vw' }}>English from Zero</h1>
          <div dir="rtl" className="mt-[0.2vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2vw' }}>الإنجليزية من الصفر إلى الكتابة</div>
        </div>

        {/* the promise, in one line — what they can DO when the last slide ends */}
        <div dir="rtl" className="max-w-[62vw] font-bold text-stone-600 leading-[1.7]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.15vw' }}>
          تبدأ من الحرف الأول، وتنتهي وأنت تكتب <span className="font-black" style={{ color: AMBER }}>فقرة كاملة وإيميلًا احترافيًا ومقالًا مُحكمًا</span> بالإنجليزية — بثقة، وبقواعد تفهمها لا تحفظها.
        </div>

        {/* headline numbers — one plate so they read as a spec, not three stray stacks */}
        <div dir="ltr" className="flex items-stretch rounded-[22px] bg-white px-[1vw] py-[1.2vh]"
          style={{ boxShadow: '0 18px 44px -30px rgba(42,29,18,0.55), inset 0 0 0 1.5px #f0ece6' }}>
          {[[String(totalLessons), 'lessons', 'درسًا'], [String(SYLLABUS.length), 'units', 'وحدات'], [`${lo}→${hi}`, 'CEFR level', 'المستوى']].map(([v, en, ar], i) => (
            <div key={i} className="flex flex-col items-center px-[1.8vw]"
              style={i ? { borderInlineStart: '1.5px solid #f0ece6' } : undefined}>
              <span className="font-black leading-none" style={{ color: INK, fontSize: '2.1vw' }}>{v}</span>
              <span className="font-black text-stone-400 uppercase tracking-[0.12em] mt-[0.4vh]" style={{ fontSize: '0.66vw' }}>{en}</span>
              <span dir="rtl" className="font-bold text-stone-300" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.7vw' }}>{ar}</span>
            </div>
          ))}
        </div>

        {/* the journey — 7 units on one rail; click a unit to open it */}
        <div dir="ltr" className="w-full relative">
          {/* the rail sits exactly on the circle centres: button padding + half the circle,
              and stops at the first/last centre (one half-column in from each edge). */}
          <div className="absolute h-[3px] rounded-full"
            style={{ top: 'calc(1.6vh + 1.3vw)', left: `${50 / SYLLABUS.length}%`, right: `${50 / SYLLABUS.length}%`, background: 'linear-gradient(90deg,#fde68a,#facc15,#b45309)' }} />
          <div className="relative grid gap-[0.7vw] w-full" style={{ gridTemplateColumns: `repeat(${SYLLABUS.length}, minmax(0,1fr))` }}>
            {SYLLABUS.map((u, ui) => {
              const count = u.modules.reduce((n, m) => n + lessonsIn(m).length, 0)
              return (
                <button key={ui} onClick={() => onJumpUnit(ui)}
                  className="group flex flex-col items-center gap-[0.45vh] rounded-2xl px-[0.4vw] pt-[0.8vh] pb-[1vh] bg-white transition-all duration-200 hover:-translate-y-[3px]"
                  style={{ boxShadow: '0 10px 26px -22px rgba(42,29,18,0.7), inset 0 0 0 1.5px #f2eee8' }}>
                  <span className="grid place-items-center rounded-full font-black shrink-0 ring-4 ring-white transition-transform group-hover:scale-110"
                    style={{ width: '2.6vw', height: '2.6vw', background: INK, color: GOLD, fontSize: '1vw' }}>{ui + 1}</span>
                  <span className="font-black leading-tight group-hover:text-[#b45309] transition-colors" style={{ color: INK, fontSize: '0.88vw' }}>{u.short}</span>
                  <span dir="rtl" className="font-bold text-stone-400 leading-tight" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.76vw' }}>{u.shortAr}</span>
                  <span className="rounded-md px-1.5 py-0.5 font-black" style={{ background: '#ecfeff', color: '#0e7490', fontSize: '0.62vw' }}>{u.cefr}</span>
                  <span className="font-bold text-stone-300" style={{ fontSize: '0.64vw' }}>{count} lessons</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* what comes WITH the course — recorded straight into the intro */}
        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-[0.7vw]">
          {[
            ['📝', 'تصحيح سريع لواجباتك — كتابيًا أو صوتيًا'],
            ['🎥', 'لايف أسبوعي للأسئلة والأجوبة'],
            ['🎓', 'شهادة إتمام باسمك'],
          ].map(([emo, label], i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full px-[1.1vw] py-[0.6vh] font-black text-white" style={{ background: INK, fontSize: '0.94vw', fontFamily: "'Tajawal', sans-serif" }}>
              <span>{emo}</span> {label}
            </span>
          ))}
        </div>

        <div className="font-bold text-stone-400 flex flex-col items-center gap-[0.3vh]" style={{ fontSize: '0.86vw' }}>
          <span className="flex items-center gap-1.5">Click a unit above, or open the <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[#2a1d12] font-black" style={{ background: GOLD }}><Menu size={12} /> index</span> (M) for every lesson.</span>
          <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>اضغط أي وحدة، أو افتح الفهرس (M) · مسافة للتقدّم · F لملء الشاشة.</span>
        </div>
      </div>
    )
  }

  /* Unit opener — a sense of arrival, and a natural chapter break for recording. */
  if (s.t === 'unit') {
    const u = s.u
    return (
      <div className="w-full max-w-[74vw] flex flex-col items-center gap-[2.4vh] text-center">
        <div className="flex items-center gap-[0.8vw]">
          <span className="rounded-lg px-2.5 py-1 font-black" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc', fontSize: '0.9vw' }}>CEFR {u.cefr}</span>
          <span className="font-black tracking-[0.14em] uppercase" style={{ color: AC.ink, fontSize: '0.9vw' }}>{s.count} lessons · starts at lesson {s.startsAt}</span>
        </div>
        <div>
          <div className="inline-block mb-[1.2vh] px-6 py-2 rounded-full font-black tracking-[0.18em]" style={{ background: GOLD, color: INK, fontSize: '1.1vw' }}>
            UNIT {s.index} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الوحدة {s.index}</span>
          </div>
          <h1 className="font-black leading-[1.06] tracking-tight" style={{ color: INK, fontSize: '3.6vw' }}>{u.en.split(' · ')[1]}</h1>
          <div dir="rtl" className="mt-[0.8vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2.1vw' }}>{u.ar.split(' · ')[1]}</div>
        </div>
        {/* the unit's promise */}
        <div className="w-full rounded-[28px] px-[3vw] py-[2.2vh]" style={{ background: AC.tint, boxShadow: `inset 0 0 0 2px ${AC.ring}` }}>
          <div className="font-black text-stone-400 uppercase tracking-[0.14em] mb-[0.8vh]" style={{ fontSize: '0.72vw' }}>By the end of this unit · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>في نهاية هذه الوحدة</span></div>
          <div className="font-black leading-[1.35]" style={{ color: INK, fontSize: '1.5vw' }}>{u.promise}</div>
          <div dir="rtl" className="mt-[0.8vh] font-bold text-stone-600 leading-[1.6]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>{u.promiseAr}</div>
        </div>
        {/* what's inside */}
        <div dir="ltr" className="w-full grid gap-[1vw]" style={{ gridTemplateColumns: `repeat(${u.modules.length}, minmax(0,1fr))` }}>
          {u.modules.map((m, mi) => {
            const items = lessonsIn(m)
            return (
              <div key={mi} className="rounded-2xl bg-white ring-1 ring-stone-200 px-[1.2vw] py-[1.2vh] text-left">
                <div className="flex items-baseline gap-[0.5vw] mb-[0.7vh]">
                  <span className="font-black" style={{ color: AC.ink, fontSize: '0.98vw' }}>{m.en}</span>
                  <span className="ml-auto font-bold text-stone-300" style={{ fontSize: '0.72vw' }}>{items.length}</span>
                </div>
                <div dir="rtl" className="font-bold text-stone-400 mb-[0.8vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.82vw' }}>{m.ar}</div>
                <div className="flex flex-wrap gap-[0.35vw]">
                  {items.map(L2 => (
                    <button key={L2.no} onClick={() => onJump(L2.no)}
                      className="rounded-lg bg-stone-50 ring-1 ring-stone-200 transition px-[0.5vw] py-[0.35vh] font-bold hover:brightness-95"
                      style={{ color: INK, fontSize: '0.78vw' }}>
                      <span className="font-black" style={{ color: AC.ink }}>{numOf(L2)}</span> {L2.tag}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* The unit's grammar, alive between two people. Chat renders as bubbles, email
     as stacked lines; Space reveals what to point at. */
  if (s.t === 'thread') {
    const th = s.thread
    const revealed = step >= 1
    const chat = th.channel === 'chat'
    return (
      <div className="w-full max-w-[74vw] flex flex-col items-center gap-[1.8vh]">
        <div className="flex flex-col items-center gap-[0.5vh]">
          <span className="flex items-center gap-[0.6vw] rounded-full px-[1.4vw] py-[0.5vh] font-black" style={{ background: INK, color: GOLD, fontSize: '0.86vw' }}>
            <MessagesSquare size={15} /> {chat ? 'WhatsApp' : 'Email'} · {th.a} ↔ {th.b}
          </span>
          <Heading en={th.title} ar={th.titleAr} size="2.1vw" />
        </div>

        <div className="w-full rounded-[28px] px-[2vw] py-[2vh] flex flex-col gap-[0.9vh]"
          style={{ background: chat ? '#f0f2f5' : '#ffffff', boxShadow: chat ? 'none' : 'inset 0 0 0 1.5px #e7e5e4' }}>
          {th.messages.map((m, i) => {
            const mine = m.from === 'b'
            if (!chat) return (
              <div key={i} dir="ltr" className="w-full" style={{ paddingInlineStart: mine ? '2.4vw' : 0, borderInlineStart: mine ? `3px solid ${GOLD}` : 'none' }}>
                <Marked text={m.text} className="block font-bold whitespace-pre-line leading-[1.55]" style={{ color: mine ? AMBER : INK, fontSize: '1.15vw' }} />
              </div>
            )
            return (
              <div key={i} dir="ltr" className={`w-full flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[72%] rounded-2xl px-[1.2vw] py-[0.9vh]"
                  style={{ background: mine ? '#d9fdd3' : '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.12)' }}>
                  <Marked text={m.text} className="block font-bold whitespace-pre-line leading-[1.5]" style={{ color: INK, fontSize: '1.12vw' }} />
                  {m.time && <span className="block text-right font-bold text-stone-400" style={{ fontSize: '0.6vw' }}>{m.time}</span>}
                </div>
              </div>
            )
          })}
        </div>

        {revealed ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="w-full rounded-[22px] px-[2vw] py-[1.4vh]" style={{ background: AC.tint, boxShadow: `inset 0 0 0 1.5px ${AC.ring}` }}>
            <div className="font-black text-stone-400 uppercase tracking-[0.12em] mb-[0.6vh]" style={{ fontSize: '0.68vw' }}>
              What to notice · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>ما ينبغي ملاحظته</span>
            </div>
            <div dir="ltr" className="grid grid-cols-2 gap-x-[1.6vw] gap-y-[0.4vh]">
              {th.notice.map((n, i) => (
                <div key={i} className="flex items-start gap-[0.6vw]">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-[0.7vh]" style={{ background: AC.ink }} />
                  <Marked text={n} className="font-bold" style={{ color: INK, fontSize: '1vw' }} />
                </div>
              ))}
            </div>
            <div dir="rtl" className="mt-[0.8vh] pt-[0.8vh] border-t border-amber-200 font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{th.noticeAr}</div>
          </motion.div>
        ) : (
          <div className="text-stone-400 font-bold" style={{ fontSize: '0.95vw' }}>
            Press <kbd className="px-2 py-0.5 rounded bg-stone-100 ring-1 ring-stone-300 font-mono">Space</kbd> to see what to notice ·
            <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}> اضغط مسافة لإظهار الملاحظات</span>
          </div>
        )}
      </div>
    )
  }

  /* Unit review game — the challenge is on screen, the class answers out loud,
     Space reveals the solution. Tiles are shuffled deterministically from the
     prompt so the scramble is stable every time you present the same slide. */
  /* the practice set that closes a lesson — same mechanics as the unit games */
  if (s.t === 'play') {
    const revealed = step >= 1
    const g = s.game
    return (
      <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex flex-col items-center gap-[0.6vh]">
          <span className="flex items-center gap-[0.6vw] rounded-full px-[1.4vw] py-[0.6vh] font-black"
            style={{ background: AC.tint, color: AC.ink, boxShadow: `inset 0 0 0 1.5px ${AC.ring}` }}>
            <Gamepad2 size={16} /> Lesson {numOf(s.L)} · {s.L.tag} · <span className="opacity-60">{s.page}/{s.pages}</span>
          </span>
          <Heading en={g.prompt} ar={g.promptAr} size="2.3vw" />
        </div>
        {g.kind === 'reorder'
          ? <ReorderGame g={g} revealed={revealed} AC={AC} />
          : <PickGame g={g as Extract<ReviewGame, { kind: 'pick' }>} revealed={revealed} AC={AC} />}
        {!revealed && (
          <span className="font-bold text-stone-300" style={{ fontSize: '0.82vw' }}>
            حاول أولًا · <kbd className="px-1.5 py-0.5 rounded bg-stone-100 ring-1 ring-stone-200 font-mono">Space</kbd> يُظهر الحلّ
          </span>
        )}
      </div>
    )
  }

  if (s.t === 'review') {
    const g = s.game
    const revealed = step >= 1
    return (
      <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex flex-col items-center gap-[0.6vh]">
          <span className="flex items-center gap-[0.6vw] rounded-full px-[1.4vw] py-[0.6vh] font-black" style={{ background: INK, color: GOLD, fontSize: '0.9vw' }}>
            <Gamepad2 size={16} /> {s.u.en.split(' · ')[1]} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>مراجعة الوحدة</span>
          </span>
          <Heading en={g.prompt} ar={g.promptAr} size="2.3vw" />
        </div>

        {g.kind === 'reorder' ? <ReorderGame g={g} revealed={revealed} AC={AC} />
          : g.kind === 'match' ? <MatchGame g={g} revealed={revealed} AC={AC} />
          : <PickGame g={g} revealed={revealed} AC={AC} />}

        {!revealed && (
          <span className="font-bold text-stone-300" style={{ fontSize: '0.82vw' }}>
            حاول أولًا · <kbd className="px-1.5 py-0.5 rounded bg-stone-100 ring-1 ring-stone-200 font-mono">Space</kbd> يُظهر الحلّ
          </span>
        )}
      </div>
    )
  }

  if (s.t === 'cover') {
    const u = unitOf(s.L.no)
    const m = moduleOf(s.L.no)
    const n = numOf(s.L)
    return (
      <div className="text-center max-w-[80vw]">
        <div className="flex items-center justify-center gap-[0.8vw] mb-[1.4vh]">
          <span className="rounded-lg px-2.5 py-1 font-black" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc', fontSize: '0.9vw' }}>CEFR {cefrOf(s.L)}</span>
          <span className="font-black tracking-[0.1em] uppercase" style={{ color: AC.ink, fontSize: '0.9vw' }}>{u.en} <span className="text-stone-300">›</span> {m.en}</span>
        </div>
        <div className="inline-block mb-[1.6vh] px-5 py-2 rounded-full font-black tracking-[0.15em] text-[1.1vw]" style={{ background: GOLD, color: INK }}>
          LESSON {n} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الدرس {n}</span>
        </div>
        <h1 className="font-black leading-[1.06] tracking-tight" style={{ color: INK, fontSize: '3.8vw' }}>{s.L.title}</h1>
        <div dir="rtl" className="mt-[1.2vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2.2vw' }}>{s.L.titleAr}</div>
        <div className="mt-[2.2vh] text-stone-400 font-bold" style={{ fontSize: '1vw' }}>Lesson {n} of {ORDERED.length}</div>
      </div>
    )
  }

  /* The plan. Shown once, right after the cover: the whole lesson in one view, in
     order, with how many cards each stage holds — so nobody is walking blind. */
  if (s.t === 'roadmap') {
    const cards = s.stages.length
    return (
      <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex flex-col items-center gap-[0.6vh]">
          <div className="flex items-center gap-[0.7vw]">
            <Route size={20} style={{ color: AC.ink }} />
            <span className="font-black tracking-[0.14em] uppercase" style={{ color: AC.ink, fontSize: '1vw' }}>Lesson Plan</span>
          </div>
          <div dir="rtl" className="font-black" style={{ fontFamily: "'Tajawal', sans-serif", color: INK, fontSize: '2.4vw' }}>خطة الدرس — ماذا سنفعل الآن</div>
          <div className="font-bold text-stone-400" style={{ fontSize: '1vw' }}>{s.L.title}</div>
        </div>
        <div className="w-full grid grid-cols-2 gap-x-[1.6vw] gap-y-[1.1vh]">
          {s.stages.map((st, i) => {
            const meta = PHASE[st.phase]
            return (
              <div key={`${st.phase}-${st.at}`} className="flex items-center gap-[0.9vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-26px_rgba(42,29,18,0.6)] px-[1.1vw] py-[1vh]">
                <span className="grid place-items-center rounded-xl font-black shrink-0"
                  style={{ width: '2.2vw', height: '2.2vw', background: AC.tint, color: AC.ink, fontSize: '0.9vw' }}>{i + 1}</span>
                <meta.Icon size={17} style={{ color: AC.ink }} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-black truncate" style={{ color: INK, fontSize: '1.05vw' }}>{meta.en}</span>
                  <span dir="rtl" className="block font-bold text-stone-400 truncate" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.9vw' }}>{meta.ar}</span>
                </span>
                {st.count > 1 && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 font-black" style={{ background: '#f5f5f4', color: '#78716c', fontSize: '0.8vw' }}>×{st.count}</span>
                )}
              </div>
            )
          })}
        </div>
        <div dir="rtl" className="font-bold text-stone-400 text-center" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.95vw' }}>
          {cards} مراحل — والشريط في أعلى الشاشة يبيّن أين نحن وماذا بقي.
        </div>
      </div>
    )
  }

  if (s.t === 'objectives') return (
    <div className="w-full max-w-[66vw] flex flex-col items-center gap-[2.6vh]">
      <Heading en="What you will learn" ar="ماذا ستتعلّم في هذا الدرس" />
      <div className="w-full flex flex-col gap-[1.3vh]">
        {s.L.objectives.map((it, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl border-2 border-dashed border-stone-200 h-[7vh]" />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}
            className="w-full flex items-center gap-[1.4vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.5vh]">
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: '2.8vw', height: '2.8vw', background: GOLD }}><Check size={17} className="text-[#2a1d12]" strokeWidth={3} /></span>
            <Marked text={it.en} className="font-black" style={{ color: INK, fontSize: '1.45vw' }} />
            <span dir="rtl" className="ml-auto font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.35vw' }}>{it.ar}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (s.t === 'rule') return (
    <div className="w-full max-w-[74vw] flex flex-col items-center gap-[3vh]">
      <div className="flex items-center gap-[0.8vw]">
        <Lightbulb size={26} style={{ color: AC.ink }} />
        <Heading en="The Rule" ar="القاعدة" />
      </div>
      <div className="w-full rounded-[32px] px-[3vw] py-[3.2vh]"
        style={{ background: AC.tint, boxShadow: `inset 0 0 0 2px ${AC.ring}, 0 24px 60px -34px rgba(42,29,18,0.45)` }}>
        <Marked text={s.L.rule.en} className="block font-black leading-[1.35]" style={{ color: INK, fontSize: '2vw' }} />
        <div dir="rtl" className="mt-[1.8vh] pt-[1.8vh] font-bold text-stone-600 leading-[1.7]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.7vw', borderTop: `1.5px solid ${AC.ring}` }}>{s.L.rule.ar}</div>
      </div>
    </div>
  )

  if (s.t === 'explain') {
    const ex = s.L.explain!
    // Teaching points vary from a 20-char label to a full worked contrast. Stacking the
    // Arabic UNDER the English (instead of beside it) lets a long point wrap cleanly
    // instead of squeezing both languages into half a cell; the type also steps down
    // a little once a lesson carries six points, so the slide never overflows.
    const many = ex.points.length > 4
    const longest = Math.max(...ex.points.map(p => p.en.replace(/\*/g, '').length))
    const enSize = longest > 88 ? '1.02vw' : many ? '1.08vw' : '1.15vw'
    const arSize = longest > 88 ? '0.92vw' : many ? '0.98vw' : '1.05vw'
    return (
      <div className="w-full max-w-[78vw] flex flex-col items-center gap-[2.2vh]">
        <Heading en="Explanation" ar="الشرح" />
        <div className="text-center max-w-[64vw]">
          <Marked text={ex.intro} className="font-bold text-stone-700" style={{ fontSize: many ? '1.3vw' : '1.4vw' }} />
          <div dir="rtl" className="mt-[0.6vh] font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: many ? '1.2vw' : '1.3vw' }}>{ex.introAr}</div>
        </div>
        <div dir="ltr" className="grid grid-cols-2 gap-x-[1.6vw] gap-y-[1vh] w-full">
          {ex.points.map((p, i) => (
            <div key={i} className="flex items-start gap-[0.8vw] rounded-2xl bg-white ring-1 ring-stone-200 px-[1.3vw] py-[1.1vh]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-[0.7vh]" style={{ background: AC.ink }} />
              <span className="min-w-0 flex-1">
                <Marked text={p.en} className="block font-bold leading-[1.4]" style={{ color: INK, fontSize: enSize }} />
                <span dir="rtl" className="block font-bold text-stone-400 leading-[1.5] mt-[0.2vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: arSize }}>{p.ar}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'form') {
    const f = s.L.form!
    const cols: { label: string; ar: string; sign: string; color: string; lines: string[] }[] = [
      { label: 'Affirmative', ar: 'مُثبَت', sign: '+', color: '#059669', lines: f.affirmative },
      { label: 'Negative', ar: 'منفي', sign: '−', color: '#e11d48', lines: f.negative },
      { label: 'Question', ar: 'سؤال', sign: '?', color: '#2563eb', lines: f.question },
    ]
    return (
      <div className="w-full max-w-[88vw] flex flex-col items-center gap-[2vh]">
        <div className="flex items-center gap-[0.8vw]"><Blocks size={24} style={{ color: AMBER }} /><Heading en="How to Build It" ar="كيف نبنيها" /></div>
        <div dir="ltr" className="grid grid-cols-3 gap-[1.2vw] w-full">
          {cols.map((c, i) => (
            <div key={i} className="rounded-3xl bg-white ring-1 ring-stone-200 shadow-[0_16px_36px_-26px_rgba(42,29,18,0.5)] overflow-hidden">
              <div className="flex items-center gap-[0.6vw] px-[1.1vw] py-[1vh]" style={{ background: c.color }}>
                <span className="grid place-items-center rounded-md bg-white/25 text-white font-black" style={{ width: '1.7vw', height: '1.7vw', fontSize: '1vw' }}>{c.sign}</span>
                <span className="font-black text-white" style={{ fontSize: '1vw' }}>{c.label}</span>
                <span dir="rtl" className="ml-auto font-bold text-white/80" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.9vw' }}>{c.ar}</span>
              </div>
              <div className="p-[1vw] flex flex-col gap-[0.8vh]">
                {c.lines.map((ln, k) => (
                  <div key={k} className="rounded-xl bg-stone-50 ring-1 ring-stone-100 px-[0.9vw] py-[0.8vh]">
                    <Marked text={ln} className="font-bold" style={{ color: INK, fontSize: '1.02vw' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {f.note && (
          <div className="flex items-start gap-[0.9vw] rounded-2xl bg-[#2a1d12] px-[1.8vw] py-[1.2vh] w-full">
            <Sparkles size={16} style={{ color: GOLD }} className="mt-[0.3vh] shrink-0" />
            <div>
              <Marked text={f.note} className="font-bold text-white" style={{ fontSize: '1.02vw' }} />
              {f.noteAr && <span dir="rtl" className="block font-bold text-white/70" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.95vw' }}>{f.noteAr}</span>}
            </div>
          </div>
        )}
        {s.L.signals && (
          <div className="flex flex-wrap items-center justify-center gap-[0.6vw]">
            <span className="font-black text-stone-400 uppercase tracking-wide" style={{ fontSize: '0.78vw' }}>Signal words · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>كلمات دالّة</span></span>
            {s.L.signals.map((sg, k) => (
              <span key={k} className="rounded-full bg-amber-50 ring-1 ring-amber-200 px-[0.8vw] py-[0.35vh] font-bold" style={{ color: AMBER, fontSize: '0.85vw' }}>{sg.en} <span dir="rtl" className="text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>{sg.ar}</span></span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (s.t === 'spelling') {
    const rules = s.L.spelling!
    return (
      <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.4vh]">
        <div className="flex items-center gap-[0.8vw]"><SpellCheck size={24} style={{ color: AMBER }} /><Heading en="Spelling Rules" ar="قواعد الإملاء" /></div>
        <div className="w-full flex flex-col gap-[1.1vh]">
          {rules.map((r, i) => (
            <div key={i} className="w-full grid grid-cols-[auto_1fr] items-center gap-[1.4vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.3vh]">
              <span className="grid place-items-center rounded-full font-black text-[#2a1d12] shrink-0" style={{ width: 34, height: 34, background: GOLD, fontSize: '1vw' }}>{i + 1}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-[0.8vw] flex-wrap">
                  <Marked text={r.rule} className="font-black" style={{ color: INK, fontSize: '1.2vw' }} />
                  <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{r.ar}</span>
                </div>
                <div className="mt-[0.3vh] font-mono font-bold text-emerald-700" style={{ fontSize: '1.02vw' }}>{r.examples}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'examples') {
    // One example per page — big and centred, so it is easy to read, explain and notice.
    const short = s.item.en.replace(/\*/g, '').length <= 32
    return (
      <div className="w-full max-w-[82vw] flex flex-col items-center gap-[3vh]">
        <div className="flex items-center gap-[0.7vw]">
          <Layers size={20} style={{ color: AMBER }} />
          <span className="font-black text-stone-400 uppercase tracking-[0.14em]" style={{ fontSize: '0.92vw' }}>
            Example {s.page} / {s.pages} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>مثال {s.page} / {s.pages}</span>
          </span>
        </div>
        <div className="w-full rounded-[40px] bg-white ring-1 ring-stone-200 shadow-[0_34px_80px_-38px_rgba(42,29,18,0.55)] px-[5vw] py-[5.5vh] flex flex-col items-center gap-[2.6vh]">
          <Marked text={s.item.en} className="font-black text-center leading-[1.22]" style={{ color: INK, fontSize: short ? '3.7vw' : '2.9vw' }} />
          <div className="rounded-full" style={{ width: '34%', height: 3, background: '#f5f5f4' }} />
          <div dir="rtl" className="font-black text-stone-500 text-center leading-[1.4]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: short ? '2.4vw' : '2vw' }}>{s.item.ar}</div>
          {/* WHY this example is written this way — the line the teacher would
              otherwise have to invent on camera. */}
          {s.item.why && (
            <div className="w-full mt-[0.6vh] rounded-[22px] px-[2.4vw] py-[1.6vh] flex items-start gap-[1vw]"
              style={{ background: AC.tint, boxShadow: `inset 0 0 0 1.5px ${AC.ring}` }}>
              <Lightbulb size={20} style={{ color: AC.ink }} className="mt-[0.4vh] shrink-0" />
              <div className="min-w-0 flex-1">
                <Marked text={s.item.why} className="block font-bold text-right" style={{ color: AC.ink, fontSize: '1.25vw', textAlign: 'left' }} />
                {s.item.whyAr && <span dir="rtl" className="block font-bold text-stone-500 mt-[0.4vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.15vw' }}>{s.item.whyAr}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (s.t === 'exercises') {
    // One question per page; the answer reveals big and green on Space.
    const revealed = step >= 1
    return (
      <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.6vh]">
        <div className="flex items-center gap-[0.7vw]">
          <PencilLine size={20} style={{ color: AMBER }} />
          <span className="font-black text-stone-400 uppercase tracking-[0.14em]" style={{ fontSize: '0.92vw' }}>
            Exercise {s.page} / {s.pages} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>تمرين {s.page} / {s.pages}</span>
          </span>
        </div>
        <div className="w-full rounded-[40px] bg-white ring-1 ring-stone-200 shadow-[0_34px_80px_-38px_rgba(42,29,18,0.55)] px-[4.5vw] py-[6vh] flex flex-col items-center gap-[3vh]">
          <Marked text={s.item.q} className="font-black text-center leading-[1.3]" style={{ color: INK, fontSize: '2.7vw' }} />
          {revealed ? (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center gap-[2vh]">
              <div className="rounded-full" style={{ width: '30%', height: 3, background: '#f5f5f4' }} />
              <div className="flex items-center justify-center gap-[1vw]">
                <Check size={30} className="text-emerald-500 shrink-0" strokeWidth={3} />
                <Marked text={s.item.a} className="font-black text-center leading-[1.3]" style={{ color: '#059669', fontSize: '2.7vw' }} />
              </div>
            </motion.div>
          ) : (
            <div className="text-stone-400 font-bold" style={{ fontSize: '1vw' }}>
              Press <kbd className="px-2 py-0.5 rounded bg-stone-100 ring-1 ring-stone-300 font-mono">Space</kbd> to reveal the answer ·
              <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}> اضغط مسافة لإظهار الجواب</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (s.t === 'reading') {
    const R = s.L.reading!
    return (
      <div className="w-full max-w-[72vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex items-center gap-[0.8vw]">
          <BookOpen size={26} style={{ color: AMBER }} />
          <Heading en="Reading Passage" ar="نص للقراءة" />
        </div>
        <div className="w-full rounded-[32px] bg-white ring-1 ring-stone-200 shadow-[0_24px_56px_-32px_rgba(42,29,18,0.5)] px-[3.2vw] py-[3vh]">
          <div className="flex items-baseline gap-[1vw] mb-[1.6vh]">
            <h2 className="font-black" style={{ color: INK, fontSize: '1.9vw' }}>{R.title}</h2>
            <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.4vw' }}>{R.titleAr}</span>
          </div>
          {/* one flowing paragraph — a real reading passage */}
          <p dir="ltr" className="leading-[1.9]" style={{ color: INK, fontSize: '1.75vw', textAlign: 'justify' }}>
            {R.passage.map((ln, i) => (<span key={i}><Marked text={ln} className="font-bold" /> </span>))}
          </p>
          {R.tip && (
            <div className="mt-[2vh] flex items-start gap-[0.9vw] rounded-2xl px-[1.6vw] py-[1.3vh]"
              style={{ background: AC.tint, boxShadow: `inset 0 0 0 1.5px ${AC.ring}` }}>
              <Sparkles size={17} style={{ color: AC.ink }} className="mt-[0.3vh] shrink-0" />
              <div>
                <span className="font-bold" style={{ color: AC.ink, fontSize: '1.05vw' }}>{R.tip}</span>
                <span dir="rtl" className="block font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{R.tipAr}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (s.t === 'irregulars') {
    const isPast = s.mode === 'past'
    const hi = { color: AMBER, background: '#fef3c7', padding: '0 0.3em', borderRadius: '4px' }
    return (
      <div className="w-full max-w-[88vw] flex flex-col items-center gap-[1.6vh]">
        <div className="flex items-center gap-[0.8vw]">
          <Table size={24} style={{ color: AMBER }} />
          <Heading en="Irregular Verbs" ar="الأفعال الشاذّة" size="2.4vw" />
        </div>
        <div className="text-center font-bold text-stone-400" style={{ fontSize: '0.92vw' }}>
          {isPast ? 'base  →  past simple  ·  past participle' : 'base  →  past simple  ·  past participle (V3)'} — {isPast ? 'the past is highlighted' : 'the participle (V3) is highlighted'}
          <span dir="rtl" className="block" style={{ fontFamily: "'Tajawal', sans-serif" }}>{isPast ? 'المجرّد ← الماضي (المظلّل) ← التصريف الثالث' : 'المجرّد ← الماضي ← التصريف الثالث V3 (المظلّل)'}</span>
        </div>
        <div dir="ltr" className="grid grid-cols-3 gap-x-[1.2vw] gap-y-[0.7vh] w-full">
          {s.items.map((v, i) => (
            <div key={i} className="flex items-baseline gap-[0.5vw] rounded-lg bg-white ring-1 ring-stone-200 px-[0.9vw] py-[0.6vh]">
              <span className="font-black shrink-0" style={{ color: INK, fontSize: '1vw', minWidth: '5.5vw' }}>{v.base}</span>
              <span className="text-stone-300 font-black shrink-0">→</span>
              <span className="font-black" style={isPast ? hi : { color: '#78716c', fontSize: '0.95vw' }}>{v.past}</span>
              <span className="text-stone-300 shrink-0">·</span>
              <span className="font-black" style={!isPast ? hi : { color: '#78716c', fontSize: '0.95vw' }}>{v.pp}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'homework') return (
    <div className="w-full max-w-[66vw] flex flex-col items-center gap-[2.6vh]">
      <div className="flex items-center gap-[0.8vw]">
        <ClipboardList size={26} style={{ color: AMBER }} />
        <Heading en="Homework" ar="واجب منزلي" />
      </div>
      <div className="w-full flex flex-col gap-[1.3vh]">
        {s.L.homework.map((it, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl border-2 border-dashed border-stone-200 h-[6.5vh]" />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}
            className="w-full flex items-center gap-[1.4vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.4vh]">
            <span className="grid place-items-center rounded-lg shrink-0 ring-2 ring-stone-200" style={{ width: '2.4vw', height: '2.4vw' }}><span className="font-mono font-black text-stone-400" style={{ fontSize: '1vw' }}>{i + 1}</span></span>
            <Marked text={it.en} className="font-black" style={{ color: INK, fontSize: '1.35vw' }} />
            <span dir="rtl" className="ml-auto font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.25vw' }}>{it.ar}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (s.t === 'editing') {
    const E = s.L.editing!
    const revealed = step >= 1
    return (
      <div className="w-full max-w-[74vw] flex flex-col items-center gap-[1.8vh]">
        <div className="flex items-center gap-[0.8vw]">
          <SearchCheck size={26} style={{ color: AMBER }} />
          <Heading en="Homework · Find the Mistakes" ar="واجب · صحّح الأخطاء" size="2.4vw" />
        </div>
        <div className="text-center font-bold text-stone-500" style={{ fontSize: '1.05vw' }}>
          Read the passage, spot the mistakes, and correct them.
          <span dir="rtl" className="block font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>اقرأ الفقرة، اكتشف الأخطاء، وصحّحها.</span>
        </div>
        {/* passage that CONTAINS mistakes */}
        <div className="w-full rounded-[28px] bg-rose-50 ring-1 ring-rose-200 px-[2.6vw] py-[2vh]">
          <div className="flex items-center gap-[0.6vw] mb-[0.9vh]">
            <span className="text-[1.3vw]">✏️</span>
            <span className="font-black uppercase tracking-wide" style={{ color: '#e11d48', fontSize: '0.9vw' }}>With mistakes · فيها أخطاء</span>
          </div>
          <p dir="ltr" className="leading-[1.9] font-bold" style={{ color: '#7f1d1d', fontSize: '1.55vw' }}>
            {E.wrong.map((ln, i) => (<span key={i}>{ln} </span>))}
          </p>
        </div>
        {/* corrected version — revealed on Space */}
        {revealed ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="w-full rounded-[28px] bg-emerald-50 ring-2 ring-emerald-200 px-[2.6vw] py-[2vh]">
            <div className="flex items-center gap-[0.6vw] mb-[0.9vh]">
              <Check size={16} className="text-emerald-600" strokeWidth={3} />
              <span className="font-black uppercase tracking-wide" style={{ color: '#059669', fontSize: '0.9vw' }}>Corrected · بعد التصحيح</span>
            </div>
            <p dir="ltr" className="leading-[1.9] font-bold" style={{ color: '#065f46', fontSize: '1.55vw' }}>
              {E.correct.map((ln, i) => (<span key={i}><Marked text={ln} /> </span>))}
            </p>
          </motion.div>
        ) : (
          <div className="text-stone-400 font-bold" style={{ fontSize: '0.95vw' }}>
            Press <kbd className="px-2 py-0.5 rounded bg-stone-100 ring-1 ring-stone-300 font-mono">Space</kbd> to reveal the corrections ·
            <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}> اضغط مسافة لإظهار التصحيح</span>
          </div>
        )}
      </div>
    )
  }

  if (s.t === 'model') {
    const m = s.L.studio!.model!
    type Role = (typeof m.parts)[number]['role']
    const ROLE: Record<Role, { label: string; ar: string; bg: string; text: string }> = {
      topic:      { label: 'Topic sentence',      ar: 'الجملة الموضوعية', bg: '#dbeafe', text: '#1d4ed8' },
      support:    { label: 'Supporting detail',   ar: 'تفصيل داعم',       bg: '#dcfce7', text: '#047857' },
      conclusion: { label: 'Concluding sentence', ar: 'جملة الخاتمة',     bg: '#fef3c7', text: '#b45309' },
      subject:    { label: 'Subject line',        ar: 'سطر الموضوع',      bg: '#f3e8ff', text: '#7c3aed' },
      greeting:   { label: 'Greeting',            ar: 'التحية',           bg: '#dbeafe', text: '#1d4ed8' },
      body:       { label: 'Body',                ar: 'صلب الرسالة',      bg: '#dcfce7', text: '#047857' },
      closing:    { label: 'Closing',             ar: 'الخاتمة',          bg: '#fef3c7', text: '#b45309' },
    }
    const legend = [...new Set(m.parts.map(p => p.role))]
    const isEmail = m.layout === 'lines'
    return (
      <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2vh]">
        <div className="flex items-center gap-[0.8vw]"><FileText size={24} style={{ color: AMBER }} /><Heading en={isEmail ? 'A Model Email' : 'A Model Paragraph'} ar={isEmail ? 'إيميل نموذجي' : 'فقرة نموذجية'} /></div>
        <div className="flex flex-wrap items-center justify-center gap-[1.2vw]">
          {legend.map(r => (
            <span key={r} className="flex items-center gap-[0.4vw] font-bold" style={{ fontSize: '0.85vw' }}>
              <span className="w-3.5 h-3.5 rounded" style={{ background: ROLE[r].bg, boxShadow: `inset 0 0 0 1.5px ${ROLE[r].text}` }} />
              <span style={{ color: ROLE[r].text }}>{ROLE[r].label}</span>
              <span dir="rtl" className="text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>{ROLE[r].ar}</span>
            </span>
          ))}
        </div>
        <div className="w-full rounded-[28px] bg-white ring-1 ring-stone-200 shadow-[0_24px_56px_-32px_rgba(42,29,18,0.5)] px-[3vw] py-[3vh]" style={{ borderLeft: '6px solid #fca5a5' }}>
          <div className="flex items-baseline gap-[1vw] mb-[1.4vh]">
            <h2 className="font-black" style={{ color: INK, fontSize: '1.7vw' }}>{m.title}</h2>
            <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>{m.titleAr}</span>
          </div>
          {isEmail ? (
            <div dir="ltr" className="flex flex-col gap-[1vh]">
              {m.parts.map((p, i) => (
                <div key={i} className="rounded-xl px-[1.2vw] py-[1vh] font-bold whitespace-pre-line leading-[1.6]"
                  style={{ background: ROLE[p.role].bg, color: ROLE[p.role].text, boxShadow: `inset 0 0 0 1px ${ROLE[p.role].text}33`, fontSize: '1.3vw' }}>
                  {p.en}
                </div>
              ))}
            </div>
          ) : (
            <p dir="ltr" className="leading-[2.2]" style={{ fontSize: '1.55vw', color: INK, textAlign: 'justify' }}>
              {m.parts.map((p, i) => (
                <span key={i}><span className="font-bold rounded" style={{ background: ROLE[p.role].bg, color: ROLE[p.role].text, padding: '0.08em 0.3em', boxShadow: `inset 0 0 0 1px ${ROLE[p.role].text}33` }}>{p.en}</span>{' '}</span>
              ))}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (s.t === 'plan') {
    const rows = s.L.studio!.plan!
    return (
      <div className="w-full max-w-[72vw] flex flex-col items-center gap-[2vh]">
        <div className="flex items-center gap-[0.8vw]"><ListChecks size={24} style={{ color: AMBER }} /><Heading en="Plan Your Paragraph" ar="خطّط فقرتك" /></div>
        <div className="text-center font-bold text-stone-400" style={{ fontSize: '0.95vw' }}>
          Fill this outline before you write — it is your map.
          <span dir="rtl" className="block" style={{ fontFamily: "'Tajawal', sans-serif" }}>املأ هذا المخطّط قبل الكتابة — إنه خريطتك.</span>
        </div>
        <div className="w-full rounded-[28px] bg-white ring-1 ring-stone-200 shadow-[0_22px_50px_-32px_rgba(42,29,18,0.5)] px-[2.6vw] py-[2.4vh] flex flex-col gap-[1.6vh]">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-[1vw]">
              <span className="shrink-0 grid place-items-center rounded-lg font-black text-[#2a1d12]" style={{ width: 30, height: 30, background: GOLD, fontSize: '0.9vw' }}>{i + 1}</span>
              <div className="shrink-0" style={{ minWidth: '17vw' }}>
                <div className="font-black" style={{ color: INK, fontSize: '1.08vw' }}>{r.label}</div>
                <div dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.9vw' }}>{r.ar}</div>
              </div>
              <div className="flex-1 border-b-2 border-dashed border-stone-300 h-[2.6vh]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'toolkit') {
    const groups = s.L.studio!.toolkit!
    return (
      <div className="w-full max-w-[82vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex items-center gap-[0.8vw]"><Wand2 size={24} style={{ color: AMBER }} /><Heading en="Toolkit — Sentence Starters" ar="أدوات الكتابة — عبارات جاهزة" /></div>
        <div className="w-full grid gap-[1.4vw]" style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 3)}, minmax(0,1fr))` }}>
          {groups.map((g, i) => (
            <div key={i} className="rounded-3xl bg-amber-50 ring-1 ring-amber-200 px-[1.6vw] py-[1.6vh]">
              <div className="flex items-baseline gap-[0.6vw] mb-[1.2vh]">
                <span className="font-black" style={{ color: AMBER, fontSize: '1.05vw' }}>{g.group}</span>
                <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.9vw' }}>{g.ar}</span>
              </div>
              <div className="flex flex-wrap gap-[0.6vw]">
                {g.phrases.map((p, k) => (
                  <span key={k} className="rounded-xl bg-white ring-1 ring-stone-200 px-[0.9vw] py-[0.6vh] font-bold" style={{ color: INK, fontSize: '1vw' }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'write') {
    const sd = s.L.studio!
    const steps = sd.steps ?? []
    return (
      <div className="w-full max-w-[72vw] flex flex-col items-center gap-[2vh]">
        <div className="flex items-center gap-[0.8vw]"><PenLine size={24} style={{ color: AMBER }} /><Heading en="Your Turn — Write!" ar="دورك — اكتب!" /></div>
        {sd.prompt && (
          <div className="w-full rounded-3xl px-[2.4vw] py-[2vh] text-center" style={{ background: INK }}>
            <div className="font-black text-white" style={{ fontSize: '1.5vw' }}>{sd.prompt.en}</div>
            <div dir="rtl" className="font-bold mt-[0.6vh]" style={{ color: GOLD, fontFamily: "'Tajawal', sans-serif", fontSize: '1.25vw' }}>{sd.prompt.ar}</div>
          </div>
        )}
        <div className="w-full flex flex-col gap-[1vh]">
          {steps.map((it, i) => i >= step ? (
            <div key={i} className="w-full rounded-2xl border-2 border-dashed border-stone-200 h-[5.6vh]" />
          ) : (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}
              className="w-full flex items-center gap-[1.2vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.2vh]">
              <span className="grid place-items-center rounded-full font-black text-[#2a1d12] shrink-0" style={{ width: 32, height: 32, background: GOLD, fontSize: '0.95vw' }}>{i + 1}</span>
              <Marked text={it.en} className="font-black" style={{ color: INK, fontSize: '1.25vw' }} />
              <span dir="rtl" className="ml-auto font-bold text-stone-500 text-right" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>{it.ar}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'checklist') {
    const items = s.L.studio!.checklist ?? []
    return (
      <div className="w-full max-w-[68vw] flex flex-col items-center gap-[2.2vh]">
        <div className="flex items-center gap-[0.8vw]"><ListChecks size={24} style={{ color: AMBER }} /><Heading en="Check Your Paragraph" ar="راجع فقرتك" /></div>
        <div className="w-full flex flex-col gap-[1.1vh]">
          {items.map((it, i) => {
            const done = i < step
            return (
              <motion.div key={i} initial={false} animate={{ opacity: done ? 1 : 0.55 }}
                className="w-full flex items-center gap-[1.2vw] rounded-2xl px-[1.8vw] py-[1.2vh]"
                style={{ background: done ? '#ecfdf5' : '#ffffff', boxShadow: done ? 'inset 0 0 0 1.5px #6ee7b7' : 'inset 0 0 0 1px #e7e5e4' }}>
                <span className="grid place-items-center rounded-md shrink-0" style={{ width: 30, height: 30, background: done ? '#059669' : '#ffffff', boxShadow: done ? 'none' : 'inset 0 0 0 2px #d6d3d1' }}>
                  {done && <Check size={18} className="text-white" strokeWidth={3} />}
                </span>
                <Marked text={it.en} className="font-black" style={{ color: INK, fontSize: '1.28vw' }} />
                <span dir="rtl" className="ml-auto font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.12vw' }}>{it.ar}</span>
              </motion.div>
            )
          })}
        </div>
        {step >= items.length && items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black" style={{ color: '#059669', fontSize: '1.2vw' }}>
            ✓ Ready to submit! · <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>جاهزة للتسليم!</span>
          </motion.div>
        )}
      </div>
    )
  }

  // end — the funnel close: celebrate, then present the 1-on-1 coaching next step
  return (
    <div className="text-center max-w-[80vw] flex flex-col items-center gap-[2.2vh]">
      <div>
        <div className="text-[3.6vw] mb-[0.6vh]">🎓</div>
        <h1 className="font-black leading-[1.04] tracking-tight" style={{ color: INK, fontSize: '3.4vw' }}>You finished the course!</h1>
        <div dir="rtl" className="mt-[0.6vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2vw' }}>أنهيتَ الدورة — من الصفر إلى الكتابة الاحترافية!</div>
      </div>
      {/* what they can now do */}
      <div dir="rtl" className="flex flex-wrap items-center justify-center gap-[0.8vw]">
        {[['القواعد بلا ملل', '✅'], ['قراءة أقوى', '📖'], ['فقرات قصيرة وطويلة', '✍️'], ['إيميلات احترافية', '💼']].map(([label, emo], i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full bg-white ring-1 ring-stone-200 px-[1.2vw] py-[0.7vh] font-black" style={{ color: INK, fontSize: '1.05vw', fontFamily: "'Tajawal', sans-serif" }}>
            <span>{emo}</span> {label}
          </span>
        ))}
      </div>
      {/* the coaching offer — presented by the teacher over this slide */}
      <div dir="rtl" className="w-full max-w-[56vw] rounded-[28px] px-[2.6vw] py-[2.6vh] text-right"
        style={{ background: INK, boxShadow: '0 30px 70px -30px rgba(42,29,18,0.8), inset 0 0 0 2px #facc1555' }}>
        <div className="font-black" style={{ color: GOLD, fontSize: '1.1vw', fontFamily: "'Tajawal', sans-serif", letterSpacing: '0.05em' }}>المرحلة القادمة؟</div>
        <div className="font-black text-white mt-[0.6vh]" style={{ fontSize: '2vw', fontFamily: "'Tajawal', sans-serif" }}>تدريب فردي 1‑على‑1 مع الأستاذ حمزة</div>
        <div className="mt-[1.4vh] flex flex-col gap-[0.7vh]">
          {[
            'خطة شخصية على مستواك وهدفك أنت',
            'تصحيح مباشر لكل ما تكتبه — فقرات، إيميلات، ومشاريعك الحقيقية',
            'جلسات محادثة حية حتى تتكلّم كما صرت تكتب',
            'مقاعد محدودة كل شهر — الأولوية لطلاب هذه الدورة',
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-[0.7vw] font-bold text-white/85" style={{ fontSize: '1.15vw', fontFamily: "'Tajawal', sans-serif" }}>
              <Check size={16} className="mt-[0.4vh] shrink-0" style={{ color: GOLD }} strokeWidth={3} /> {b}
            </div>
          ))}
        </div>
        <div className="mt-[1.8vh] inline-flex items-center gap-[0.8vw] rounded-2xl px-[1.8vw] py-[1.2vh] font-black"
          style={{ background: `linear-gradient(135deg, #fde047, ${GOLD})`, color: INK, fontSize: '1.3vw', fontFamily: "'Tajawal', sans-serif", boxShadow: '0 14px 34px -12px rgba(250,204,21,0.6)' }}>
          <Phone size={18} /> احجز مكانك الآن — واتساب 0764189311
        </div>
      </div>
      <Footer />
    </div>
  )
}
