'use client'

/**
 * /admin/present/writing — "English from Zero" teaching deck for absolute
 * beginners. Every lesson follows the SAME template so the learner always knows
 * the stage they are in:
 *   Lesson cover → Objectives → Rule → Explanation → Examples → Exercises →
 *   Reading passage → Homework.
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
  ChevronLeft, ChevronRight, ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Check, PenLine, Sparkles, Target, Lightbulb, Info, Layers,
  PencilLine, BookOpen, ClipboardList, SearchCheck, Blocks, SpellCheck, Table,
  FileText, ListChecks, Wand2,
  Menu, X, ChevronDown, ListTree,
  Globe, Instagram, Youtube, GraduationCap, Phone,
  StickyNote, List, ListOrdered, Eraser, Trash2,
  Image as ImageIcon, Upload, Search, Type, Move, SendToBack,
  MousePointer2, Pencil, ArrowUpRight, Square, Circle, Highlighter, LayoutGrid, MoreHorizontal,
  Undo2, Redo2, Copy as CopyIcon, HelpCircle,
} from 'lucide-react'
import { LESSONS, IRREGULAR_VERBS, type Lesson, type Ex, type QA, type Irregular } from '@/data/writing-course'

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
  { en: 'Unit 6 · Punctuation & Style', short: 'Style', shortAr: 'الأسلوب', ar: 'الوحدة ٦ · الترقيم والأسلوب', cefr: 'A2–B1',
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
]
const unitOf = (no: number) => SYLLABUS.find(u => u.modules.some(m => no >= m.from && no <= m.to)) ?? SYLLABUS[0]
const moduleOf = (no: number) => {
  for (const u of SYLLABUS) { const m = u.modules.find(m => no >= m.from && no <= m.to); if (m) return m }
  return SYLLABUS[0].modules[0]
}
const cefrOf = (L: Lesson) => L.cefr ?? unitOf(L.no).cefr
const lessonsIn = (m: ModDef) => ORDERED.filter(L => L.no >= m.from && L.no <= m.to)

type Phase = 'cover' | 'objectives' | 'rule' | 'explain' | 'form' | 'spelling' | 'irregulars' | 'examples' | 'exercises' | 'reading' | 'homework' | 'editing' | 'model' | 'plan' | 'toolkit' | 'write' | 'checklist'
type Slide =
  | { t: 'intro' }
  | { t: 'end' }
  | { t: 'unit'; u: UnitDef; index: number; count: number; startsAt: number }
  | { t: 'cover'; L: Lesson }
  | { t: 'objectives'; L: Lesson }
  | { t: 'rule'; L: Lesson }
  | { t: 'explain'; L: Lesson }
  | { t: 'form'; L: Lesson }
  | { t: 'spelling'; L: Lesson }
  | { t: 'irregulars'; L: Lesson; items: Irregular[]; page: number; pages: number; mode: 'past' | 'pp' }
  | { t: 'examples'; L: Lesson; item: Ex; page: number; pages: number }
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
}

/* Build the flat slide list + a lesson→cover-index map for jump navigation.
   A unit-opening slide is emitted whenever the deck crosses into a new unit: it gives
   the learner a sense of arrival and gives the recording a natural chapter break. */
function buildSlides(): { slides: Slide[]; jump: Record<number, number>; unitJump: number[] } {
  const slides: Slide[] = [{ t: 'intro' }]
  const jump: Record<number, number> = {}
  const unitJump: number[] = []
  let currentUnit: UnitDef | null = null
  for (const L of ORDERED) {
    const u = unitOf(L.no)
    if (u !== currentUnit) {
      currentUnit = u
      const ui = SYLLABUS.indexOf(u)
      unitJump[ui] = slides.length
      slides.push({ t: 'unit', u, index: ui + 1, count: u.modules.reduce((n, m) => n + lessonsIn(m).length, 0), startsAt: numOf(L) })
    }
    jump[L.no] = slides.length
    slides.push({ t: 'cover', L }, { t: 'objectives', L })
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
    if (L.examples?.length) {
      // One example per slide — big single card, easy to teach.
      const ex = L.examples
      ex.forEach((item, i) => slides.push({ t: 'examples', L, item, page: i + 1, pages: ex.length }))
    }
    if (L.exercises?.length) {
      // One question per slide; the answer reveals on Space.
      const qa = L.exercises
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
  }
  slides.push({ t: 'end' })
  return { slides, jump, unitJump }
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

/* ── Note board ───────────────────────────────────────────────────────────────
   The teaching board that opens OVER the current slide (N, or the لوح الشرح
   button) and closes back onto the very same slide (Esc / ✕).

   Deliberately small. An English teacher writes a sentence, recolours a word,
   circles or points at something, and sometimes shows a picture — so that is all
   this does. One toolbar row that never wraps; anything rarer lives behind ⋯.

   Nothing flows like a document: every text box, picture, stroke and shape is an
   object you place, drag, scale and stack. One board per lesson, in localStorage. */
const NOTE_PREFIX = 'inglizi.writing_notes.'
const noteKeyOf = (s: Slide) =>
  'L' in s ? `lesson-${s.L.no}` : s.t === 'unit' ? `unit-${s.index}` : s.t
const readNote = (k: string) => { try { return localStorage.getItem(NOTE_PREFIX + k) || '' } catch { return '' } }

type Pt = [number, number]
type ShapeKind = 'arrow' | 'rect' | 'ellipse'
type NoteItem = {
  id: string
  kind: 'text' | 'image' | 'draw' | 'shape'
  x: number; y: number
  w: number; h?: number
  z: number
  html?: string
  dir?: 'rtl' | 'ltr'
  bg?: string; bd?: string        // card fill + border, for an emphasis box
  src?: string
  pts?: Pt[]                      // stroke points, normalised 0..1 inside w×h
  hl?: boolean                    // highlighter rather than pen
  shape?: ShapeKind
  a?: Pt; b?: Pt                  // normalised endpoints, for arrow direction
  color?: string; sw?: number
}
type Pattern = 'plain' | 'grid' | 'lines'
type Tool = 'select' | 'text' | 'pen' | 'mark' | 'arrow' | 'rect' | 'ellipse' | 'eraser'
type Page = { pattern: Pattern; paper: string; mark: boolean }

const uid = () => Math.random().toString(36).slice(2, 9)

const PAPER = [
  { v: '#ffffff', label: 'أبيض' },
  { v: '#fdfaf3', label: 'كريمي' },
  { v: '#f4f6f8', label: 'رمادي' },
  { v: '#fffbeb', label: 'عسلي' },
  { v: '#0f2a22', label: 'سبّورة' },
  { v: '#1c1917', label: 'أسود' },
]
const isDarkPaper = (p: string) => ['#0f2a22', '#1c1917'].includes(p)

/* v4 = {page, items}. v3/v2 = {items}. Anything else is a v1 HTML note — keep it
   as one text box rather than dropping work already done. */
function loadBoard(key: string): { items: NoteItem[]; page: Page } {
  const dflt: Page = { pattern: 'plain', paper: '#ffffff', mark: true }
  const raw = readNote(key)
  if (!raw) return { items: [], page: dflt }
  if (raw.trim().startsWith('{')) {
    try {
      const p = JSON.parse(raw)
      if (Array.isArray(p?.items)) {
        return { items: p.items as NoteItem[], page: { ...dflt, ...(p.page ?? {}), ...(p.bg ? { pattern: p.bg } : {}) } }
      }
    } catch { /* fall through and treat it as v1 HTML */ }
  }
  return { items: [{ id: uid(), kind: 'text', x: 70, y: 60, w: 900, html: raw, dir: 'rtl', z: 1 }], page: dflt }
}

/* Shrink a pasted/dropped/uploaded picture before it goes on the board.
   localStorage holds roughly 5 MB for the WHOLE deck and a raw phone screenshot is
   ~3 MB of base64 on its own, so we downscale and JPEG-compress. Pictures from the
   search panel keep their remote URL instead (a few dozen bytes). */
function shrinkToDataUrl(file: Blob, maxPx = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('read-failed'))
    fr.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode-failed'))
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return reject(new Error('no-canvas'))
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/jpeg', quality))
      }
      img.src = String(fr.result)
    }
    fr.readAsDataURL(file)
  })
}

type SearchHit = { thumb: string; full: string; credit: string; link: string }

const INK_COLORS = ['#2a1d12', '#dc2626', '#059669', '#2563eb', '#b45309', '#ffffff']
const CARD_STYLES: { bg: string; bd: string; label: string }[] = [
  { bg: 'transparent', bd: 'transparent', label: 'بلا إطار' },
  { bg: '#fef3c7', bd: '#fcd34d', label: 'أصفر' },
  { bg: '#dcfce7', bd: '#86efac', label: 'أخضر' },
  { bg: '#dbeafe', bd: '#93c5fd', label: 'أزرق' },
  { bg: '#fee2e2', bd: '#fca5a5', label: 'أحمر' },
]
// Sized for video: a student watching on a phone has to read this comfortably.
const TEXT_SIZES: { label: string; px: string }[] = [
  { label: 'S', px: '28px' }, { label: 'M', px: '40px' }, { label: 'L', px: '56px' },
]
const STROKE_WIDTHS = [3, 6, 12]

const TOOLS: { id: Tool; icon: typeof Target; title: string }[] = [
  { id: 'select', icon: MousePointer2, title: 'تحديد وتحريك (V)' },
  { id: 'text', icon: Type, title: 'اكتب جملة (T) — أو انقر نقرتين على اللوح' },
  { id: 'pen', icon: Pencil, title: 'قلم (P)' },
  { id: 'mark', icon: Highlighter, title: 'قلم تظليل (H)' },
  { id: 'arrow', icon: ArrowUpRight, title: 'سهم (A)' },
  { id: 'ellipse', icon: Circle, title: 'دائرة — ظلّل كلمة (O)' },
  { id: 'rect', icon: Square, title: 'مستطيل (R)' },
  { id: 'eraser', icon: Eraser, title: 'ممحاة (E)' },
]

function NotePad({ noteKey, label, lesson, onClose, onDirty }: {
  noteKey: string; label: string; lesson: Lesson | null
  onClose: () => void; onDirty: (has: boolean) => void
}) {
  const boardRef = useRef<HTMLDivElement>(null)
  const textEls = useRef<Record<string, HTMLDivElement | null>>({})
  const [items, setItems] = useState<NoteItem[]>([])
  const itemsRef = useRef(items); itemsRef.current = items
  const [page, setPage] = useState<Page>({ pattern: 'plain', paper: '#ffffff', mark: true })
  const [rev, setRev] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const selRef = useRef(sel); selRef.current = sel
  const [tool, setTool] = useState<Tool>('select')
  const toolRef = useRef(tool); toolRef.current = tool
  const [color, setColor] = useState(INK_COLORS[1])
  const [sw, setSw] = useState(6)
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'full'>('idle')
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [menu, setMenu] = useState<null | 'page' | 'more' | 'lesson' | 'help'>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const lastPoint = useRef({ x: 90, y: 90 })
  const focusNext = useRef<string | null>(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [provider, setProvider] = useState('')
  const [term, setTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const dark = isDarkPaper(page.paper)
  const topZ = () => itemsRef.current.reduce((m, i) => Math.max(m, i.z), 0)

  /* ── persistence ──────────────────────────────────────────────────────────
     Text lives in the DOM while you type — writing it into React state on every
     keystroke re-renders the box and throws the caret to the start — so a snapshot
     reads the boxes back out at save time. */
  const snapshot = useCallback((): NoteItem[] => itemsRef.current.map(it =>
    it.kind === 'text' ? { ...it, html: textEls.current[it.id]?.innerHTML ?? it.html ?? '' } : it), [])
  const isBlank = (it: NoteItem) => it.kind === 'text' && (it.html || '').replace(/<br>|&nbsp;|\s/g, '') === ''

  const persist = useCallback(() => {
    const list = snapshot().filter(it => !isBlank(it))
    try {
      if (list.length) { localStorage.setItem(NOTE_PREFIX + noteKey, JSON.stringify({ v: 4, page, items: list })); onDirty(true) }
      else { localStorage.removeItem(NOTE_PREFIX + noteKey); onDirty(false) }
      setSaved('saved')
    } catch {
      // Almost always the 5 MB localStorage quota, blown by pasted pictures. What is
      // on screen is intact — say so plainly instead of pretending it saved.
      setSaved('full')
    }
  }, [noteKey, onDirty, snapshot, page])

  const touch = useCallback(() => {
    setSaved('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(persist, 400)
  }, [persist])

  /* ── undo / redo ──────────────────────────────────────────────────────────
     Covers the SHAPE of the board. Typing inside a box keeps the browser's own
     undo, which is what your fingers expect mid-sentence. */
  const past = useRef<NoteItem[][]>([])
  const future = useRef<NoteItem[][]>([])
  const mark = useCallback(() => {
    past.current.push(snapshot())
    if (past.current.length > 60) past.current.shift()
    future.current = []
  }, [snapshot])
  const mutate = useCallback((fn: (list: NoteItem[]) => NoteItem[]) => {
    mark(); setItems(fn(snapshot())); touch()
  }, [mark, snapshot, touch])
  const undo = useCallback(() => {
    if (!past.current.length) return
    future.current.push(snapshot())
    setItems(past.current.pop()!); setRev(r => r + 1); setSel(null); touch()
  }, [snapshot, touch])
  const redo = useCallback(() => {
    if (!future.current.length) return
    past.current.push(snapshot())
    setItems(future.current.pop()!); setRev(r => r + 1); setSel(null); touch()
  }, [snapshot, touch])

  useEffect(() => {
    textEls.current = {}
    const b = loadBoard(noteKey)
    setItems(b.items); setPage(b.page); setSel(null); setRev(r => r + 1)
    past.current = []; future.current = []
    try { document.execCommand('styleWithCSS', false, 'true') } catch { /* older engines */ }
  }, [noteKey])
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); persist() }, [persist])
  useEffect(() => {
    const id = focusNext.current; if (!id) return
    const el = textEls.current[id]
    if (el) { focusNext.current = null; el.focus() }
  })

  const pointIn = (e: { clientX: number; clientY: number }) => {
    const el = boardRef.current
    if (!el) return { x: 90, y: 90 }
    const r = el.getBoundingClientRect()
    return { x: Math.max(0, e.clientX - r.left + el.scrollLeft), y: Math.max(0, e.clientY - r.top + el.scrollTop) }
  }
  const boardBottom = items.reduce((m, i) => Math.max(m, i.y + (i.h ?? 160)), 0)

  /* ── creating things ──────────────────────────────────────────────────── */
  const addText = (x: number, y: number, opts?: Partial<NoteItem>) => {
    const id = uid()
    // English lesson board → English sentences. LTR is the right default; ⋯ flips it.
    mutate(list => [...list, { id, kind: 'text', x, y, w: 620, html: '', dir: 'ltr', z: topZ() + 1, ...opts }])
    setSel(id); focusNext.current = id; setTool('select')
  }

  const addImage = (src: string, at?: { x: number; y: number }) => {
    const pt = at ?? lastPoint.current
    const probe = new Image()
    const place = (w: number, h: number) =>
      mutate(list => [...list, { id: uid(), kind: 'image', x: pt.x, y: pt.y, w, h, src, z: topZ() + 1 }])
    probe.onload = () => {
      const w = Math.min(460, probe.naturalWidth || 460)
      place(w, Math.round(w * ((probe.naturalHeight || 300) / (probe.naturalWidth || 460))))
    }
    probe.onerror = () => place(420, 280)
    probe.src = src
  }

  const insertFiles = async (files: (File | Blob)[], at?: { x: number; y: number }) => {
    const pics = files.filter(f => f.type.startsWith('image/'))
    if (!pics.length) return
    setBusy(true)
    let i = 0
    for (const f of pics) {
      try { const pt = at ?? lastPoint.current; addImage(await shrinkToDataUrl(f), { x: pt.x + i * 28, y: pt.y + i * 28 }); i++ }
      catch { /* skip a picture we cannot decode */ }
    }
    setBusy(false)
  }

  const remove = (id: string) => { mutate(list => list.filter(i => i.id !== id)); delete textEls.current[id]; setSel(null); setMenu(null) }
  const duplicate = (id: string) => {
    const src = snapshot().find(i => i.id === id); if (!src) return
    const copy = { ...src, id: uid(), x: src.x + 28, y: src.y + 28, z: topZ() + 1 }
    mutate(list => [...list, copy]); setSel(copy.id); setRev(r => r + 1); setMenu(null)
  }
  const bringFront = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, z: topZ() + 1 } : i))
  const sendBack = (id: string) => {
    const min = itemsRef.current.reduce((m, i) => Math.min(m, i.z), 0)
    mutate(list => list.map(i => i.id === id ? { ...i, z: min - 1 } : i)); setMenu(null)
  }
  const patch = (id: string, p: Partial<NoteItem>) => mutate(list => list.map(i => i.id === id ? { ...i, ...p } : i))

  /* Drop a piece of the lesson onto the board — no retyping on camera. */
  const fromLesson = (what: 'rule' | 'objectives' | 'example' | 'homework') => {
    if (!lesson) return
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const hi = (s: string) => esc(s).replace(/\*(.+?)\*/g, '<span style="color:#b45309;font-weight:800">$1</span>')
    let html = ''
    if (what === 'rule') html = `<div style="font-size:38px">${hi(lesson.rule.en)}</div><div style="font-size:28px;color:#78716c;margin-top:10px" dir="rtl">${esc(lesson.rule.ar)}</div>`
    if (what === 'objectives') html = `<div style="font-size:30px">` + lesson.objectives.map(o => `• ${hi(o.en)}`).join('<br>') + `</div>`
    if (what === 'homework') html = `<div style="font-size:30px">` + lesson.homework.map((o, i) => `${i + 1}. ${hi(o.en)}`).join('<br>') + `</div>`
    if (what === 'example') {
      const ex = lesson.examples?.[Math.floor(Math.random() * (lesson.examples?.length || 1))]
      if (!ex) return
      html = `<div style="font-size:44px">${hi(ex.en)}</div><div style="font-size:30px;color:#78716c;margin-top:10px" dir="rtl">${esc(ex.ar)}</div>`
    }
    const id = uid()
    mutate(list => [...list, {
      id, kind: 'text', x: 110, y: (boardRef.current?.scrollTop ?? 0) + 110, w: 820, html,
      dir: 'ltr', bg: '#fef3c7', bd: '#fcd34d', z: topZ() + 1,
    }])
    setSel(id); setRev(r => r + 1); setMenu(null)
  }

  /* ── dragging & scaling ───────────────────────────────────────────────── */
  const dragRef = useRef<{ id: string; mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number; ratio: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const startDrag = (e: React.PointerEvent, it: NoteItem, mode: 'move' | 'resize') => {
    e.preventDefault(); e.stopPropagation()
    setSel(it.id); bringFront(it.id); mark()
    dragRef.current = { id: it.id, mode, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, ow: it.w, ratio: it.kind !== 'text' && it.h ? it.h / it.w : 0 }
    setDragging(true)
  }
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current; if (!d) return
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy
      const maxX = (boardRef.current?.clientWidth ?? 1200) - 60
      setItems(list => list.map(it => {
        if (it.id !== d.id) return it
        if (d.mode === 'move') return { ...it, x: Math.min(maxX, Math.max(0, d.ox + dx)), y: Math.max(0, d.oy + dy) }
        const w = Math.max(40, d.ow + dx)
        return d.ratio ? { ...it, w, h: Math.round(w * d.ratio) } : { ...it, w }
      }))
    }
    const up = () => { if (!dragRef.current) return; dragRef.current = null; setDragging(false); touch() }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [touch])

  /* ── drawing ──────────────────────────────────────────────────────────── */
  const [draft, setDraft] = useState<{ tool: Tool; pts: Pt[] } | null>(null)
  const draftRef = useRef(draft); draftRef.current = draft

  const eraseAt = (x: number, y: number) => {
    const hit = itemsRef.current.filter(i => (i.kind === 'draw' || i.kind === 'shape')
      && x >= i.x - 6 && x <= i.x + i.w + 6 && y >= i.y - 6 && y <= i.y + (i.h ?? 0) + 6)
    if (!hit.length) return
    const ids = new Set(hit.map(i => i.id))
    mutate(list => list.filter(i => !ids.has(i.id)))
  }

  const onBoardPointerDown = (e: React.PointerEvent) => {
    const t = toolRef.current
    const onCanvas = e.target === e.currentTarget || !!(e.target as HTMLElement).dataset.canvas
    setMenu(null)
    if (t === 'select') { if (onCanvas) { setSel(null); lastPoint.current = pointIn(e) } return }
    const p = pointIn(e); lastPoint.current = p
    if (t === 'text') { addText(p.x, p.y); return }
    if (t === 'eraser') { setDraft({ tool: 'eraser', pts: [[p.x, p.y]] }); eraseAt(p.x, p.y); return }
    e.preventDefault()
    setDraft({ tool: t, pts: [[p.x, p.y], [p.x, p.y]] })
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = draftRef.current; if (!d) return
      const el = boardRef.current; if (!el) return
      const r = el.getBoundingClientRect()
      const p: Pt = [Math.max(0, e.clientX - r.left + el.scrollLeft), Math.max(0, e.clientY - r.top + el.scrollTop)]
      if (d.tool === 'eraser') { eraseAt(p[0], p[1]); setDraft({ ...d, pts: [p] }); return }
      if (d.tool === 'pen' || d.tool === 'mark') setDraft({ ...d, pts: [...d.pts, p] })
      else setDraft({ ...d, pts: [d.pts[0], p] })
    }
    const up = () => {
      const d = draftRef.current; if (!d) return
      setDraft(null)
      if (d.tool === 'eraser') return
      const freehand = d.tool === 'pen' || d.tool === 'mark'
      const weight = d.tool === 'mark' ? sw * 3.5 : sw
      const xs = d.pts.map(p => p[0]), ys = d.pts.map(p => p[1])
      const pad = Math.max(6, weight)
      const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad
      const w = Math.max(12, Math.max(...xs) - Math.min(...xs) + pad * 2)
      const h = Math.max(12, Math.max(...ys) - Math.min(...ys) + pad * 2)
      const norm = (p: Pt): Pt => [(p[0] - minX) / w, (p[1] - minY) / h]
      const base = { id: uid(), x: minX, y: minY, w, h, z: topZ() + 1, color, sw }
      if (freehand) {
        if (d.pts.length < 2) return
        mutate(list => [...list, { ...base, kind: 'draw', pts: d.pts.map(norm), hl: d.tool === 'mark' }])
      } else {
        mutate(list => [...list, { ...base, kind: 'shape', shape: d.tool as ShapeKind, a: norm(d.pts[0]), b: norm(d.pts[1]) }])
        setTool('select')
      }
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, sw, mutate])

  /* ── keyboard ─────────────────────────────────────────────────────────────
     Capture phase, so Escape is consumed here before the deck's own handler
     closes the board. Escape steps out: caret → selection → tool → close. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null
      const typing = !!ae?.isContentEditable || ae instanceof HTMLInputElement
      const meta = e.ctrlKey || e.metaKey
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.stopPropagation(); e.shiftKey ? redo() : undo(); return }
      if (meta && e.key.toLowerCase() === 'd' && selRef.current) { e.preventDefault(); e.stopPropagation(); duplicate(selRef.current); return }
      if (e.key === 'Escape') {
        if (menu) { e.stopPropagation(); e.preventDefault(); setMenu(null); return }
        if (typing) { e.stopPropagation(); e.preventDefault(); ae!.blur(); return }
        if (selRef.current) { e.stopPropagation(); e.preventDefault(); setSel(null); return }
        if (toolRef.current !== 'select') { e.stopPropagation(); e.preventDefault(); setTool('select'); return }
        return
      }
      if (typing || meta) return
      const keyTool: Record<string, Tool> = { v: 'select', t: 'text', p: 'pen', h: 'mark', a: 'arrow', o: 'ellipse', r: 'rect', e: 'eraser' }
      const kt = keyTool[e.key.toLowerCase()]
      if (kt) { e.preventDefault(); e.stopPropagation(); setTool(kt); return }
      if (!selRef.current) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selRef.current); return }
      const n = e.shiftKey ? 20 : 2
      const d: Record<string, Pt> = { ArrowLeft: [-n, 0], ArrowRight: [n, 0], ArrowUp: [0, -n], ArrowDown: [0, n] }
      const mv = d[e.key]
      if (mv) {
        e.preventDefault(); e.stopPropagation()
        setItems(list => list.map(i => i.id === selRef.current ? { ...i, x: Math.max(0, i.x + mv[0]), y: Math.max(0, i.y + mv[1]) } : i))
        touch()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touch, undo, redo, menu])

  const onPaste = (e: React.ClipboardEvent) => {
    const pics = Array.from(e.clipboardData?.items ?? [])
      .filter(i => i.kind === 'file' && i.type.startsWith('image/'))
      .map(i => i.getAsFile()).filter(Boolean) as File[]
    if (pics.length) { e.preventDefault(); void insertFiles(pics); return }
    const text = e.clipboardData?.getData('text/plain')
    const ae = document.activeElement as HTMLElement | null
    if (text && ae?.isContentEditable) { e.preventDefault(); document.execCommand('insertText', false, text); touch() }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const at = pointIn(e); lastPoint.current = at
    const files = Array.from(e.dataTransfer?.files ?? [])
    if (files.length) { void insertFiles(files, at); return }
    const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain')
    if (url && /^https?:\/\//i.test(url)) addImage(url, at)
  }

  /* ── text formatting ──────────────────────────────────────────────────── */
  const hold = (e: React.MouseEvent) => e.preventDefault()
  const cmd = (c: string, v?: string) => {
    const ae = document.activeElement as HTMLElement | null
    if (!ae?.isContentEditable) { const el = sel ? textEls.current[sel] : null; el?.focus() }
    try { document.execCommand(c, false, v) } catch { /* noop */ }
    touch()
  }
  const setSize = (px: string) => {
    // execCommand('fontSize') only speaks 1-7, so tag the selection with size 7 and swap
    // that tag for the real pixel size. styleWithCSS must be OFF for this one call — with
    // it on the browser emits font-size:xx-large and every button looks identical.
    const ae = document.activeElement as HTMLElement | null
    const box = ae?.isContentEditable ? ae : (sel ? textEls.current[sel] : null)
    if (!box) return
    if (box !== ae) box.focus()
    try { document.execCommand('styleWithCSS', false, 'false') } catch { /* noop */ }
    try { document.execCommand('fontSize', false, '7') } catch { /* noop */ }
    try { document.execCommand('styleWithCSS', false, 'true') } catch { /* noop */ }
    box.querySelectorAll('font[size="7"]').forEach(f => {
      const span = document.createElement('span')
      span.style.fontSize = px
      span.innerHTML = (f as HTMLElement).innerHTML
      f.replaceWith(span)
    })
    touch()
  }

  const runSearch = async () => {
    const q = query.trim(); if (q.length < 2) return
    setSearching(true); setSearched(true)
    try {
      const r = await fetch(`/api/img/search?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      setHits(d?.results ?? []); setProvider(d?.provider ?? 'none'); setTerm(d?.term ?? '')
    } catch { setHits([]); setProvider('none'); setTerm('') }
    setSearching(false)
  }

  const selItem = items.find(i => i.id === sel) || null
  const drawTool = tool !== 'select' && tool !== 'text'

  const Btn = ({ onClick, title, children, active, wide }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean; wide?: boolean }) => (
    <button onMouseDown={hold} onClick={onClick} title={title}
      className={`${wide ? 'px-2.5' : 'px-1.5'} py-1 rounded-lg font-black transition text-[13px] shrink-0 ${active ? 'text-[#2a1d12]' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
      style={active ? { background: GOLD } : undefined}>{children}</button>
  )
  const Sep = () => <span className="w-px h-5 bg-white/15 mx-[3px] shrink-0" />

  /* Pen stroke or shape, drawn in the item's own pixel box so the stroke keeps its
     weight and arrowheads never skew when you scale it. */
  const Vector = ({ it }: { it: NoteItem }) => {
    const w = it.w, h = it.h ?? 1
    const c = it.color || INK
    const s = it.hl ? (it.sw || 6) * 3.5 : (it.sw || 6)
    const common = { fill: 'none', stroke: c, strokeWidth: s, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, opacity: it.hl ? 0.35 : 1 }
    let body: React.ReactNode = null
    if (it.kind === 'draw' && it.pts) {
      body = <polyline {...common} points={it.pts.map(p => `${p[0] * w},${p[1] * h}`).join(' ')} />
    } else if (it.shape === 'rect') {
      body = <rect {...common} x={s / 2} y={s / 2} width={Math.max(1, w - s)} height={Math.max(1, h - s)} rx={8} />
    } else if (it.shape === 'ellipse') {
      body = <ellipse {...common} cx={w / 2} cy={h / 2} rx={Math.max(1, w / 2 - s / 2)} ry={Math.max(1, h / 2 - s / 2)} />
    } else if (it.a && it.b) {
      const x1 = it.a[0] * w, y1 = it.a[1] * h, x2 = it.b[0] * w, y2 = it.b[1] * h
      const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.max(12, s * 3.2), spread = 0.42
      body = <>
        <line {...common} x1={x1} y1={y1} x2={x2} y2={y2} />
        <polygon fill={c} stroke="none" points={[[x2, y2],
          [x2 - len * Math.cos(ang - spread), y2 - len * Math.sin(ang - spread)],
          [x2 - len * Math.cos(ang + spread), y2 - len * Math.sin(ang + spread)]].map(p => p.join(',')).join(' ')} />
      </>
    }
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>{body}</svg>
  }

  const rule = dark ? 'rgba(255,255,255,0.10)' : '#eef2f7'
  const paperStyle: React.CSSProperties =
    page.pattern === 'grid' ? { background: page.paper, backgroundImage: `linear-gradient(${rule} 1px, transparent 1px), linear-gradient(90deg, ${rule} 1px, transparent 1px)`, backgroundSize: '36px 36px' }
    : page.pattern === 'lines' ? { background: page.paper, backgroundImage: `linear-gradient(${rule} 1px, transparent 1px)`, backgroundSize: '100% 44px' }
    : { background: page.paper }

  const Pop = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
    <div dir="rtl" onMouseDown={e => e.stopPropagation()}
      className={`absolute top-full mt-1 z-[220] rounded-xl bg-white shadow-2xl ring-1 ring-stone-200 p-2 ${align === 'right' ? 'right-0' : 'left-0'}`}>
      {children}
    </div>
  )

  return (
    <div className="absolute inset-0 z-[200] flex flex-col" style={{ background: 'rgba(28,20,12,0.55)' }}>
      <div className="m-[1.2vh] mx-[1.4vw] flex-1 min-h-0 flex flex-col rounded-[22px] overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] bg-white">

        {/* ── one toolbar row, never wraps ── */}
        <div className="shrink-0 flex items-center gap-[3px] flex-nowrap overflow-x-auto overflow-y-visible px-[0.8vw] py-[0.8vh] relative" style={{ background: INK }}>
          <span className="font-black text-white shrink-0 whitespace-nowrap ml-1" style={{ fontSize: 12.5 }}>{label}</span>
          <Sep />

          {TOOLS.map(t => <Btn key={t.id} title={t.title} active={tool === t.id} onClick={() => setTool(t.id)}><t.icon size={16} /></Btn>)}
          <Sep />

          {INK_COLORS.map(c => (
            <button key={c} onMouseDown={hold}
              onClick={() => {
                setColor(c)
                if (selItem && (selItem.kind === 'draw' || selItem.kind === 'shape')) patch(selItem.id, { color: c })
                else if (!drawTool) cmd('foreColor', c)
              }}
              title="اللون"
              className="w-[17px] h-[17px] rounded-full transition shrink-0"
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${GOLD}` : '0 0 0 1.5px rgba(255,255,255,0.3)' }} />
          ))}
          {STROKE_WIDTHS.map(v => (
            <button key={v} onMouseDown={hold}
              onClick={() => { setSw(v); if (selItem && (selItem.kind === 'draw' || selItem.kind === 'shape')) patch(selItem.id, { sw: v }) }}
              title="سماكة القلم"
              className="w-[19px] h-[19px] rounded-md grid place-items-center shrink-0 transition"
              style={{ background: sw === v ? GOLD : 'rgba(255,255,255,0.08)' }}>
              <span style={{ display: 'block', width: 12, height: Math.min(6, v), borderRadius: 9, background: sw === v ? INK : '#fff' }} />
            </button>
          ))}
          <Sep />

          {TEXT_SIZES.map(t => <Btn key={t.px} title={`حجم النص ${t.label}`} onClick={() => setSize(t.px)}>{t.label}</Btn>)}
          <Btn title="عريض" onClick={() => cmd('bold')}><b>B</b></Btn>
          <Btn title="تحته خط" onClick={() => cmd('underline')}><u>U</u></Btn>
          <Sep />

          <Btn wide title="ابحث عن صورة" active={searchOpen} onClick={() => { setSearchOpen(o => !o); setMenu(null) }}>
            <span className="flex items-center gap-1"><ImageIcon size={15} /> صور</span>
          </Btn>
          <Btn title="صورة من جهازك" onClick={() => fileInput.current?.click()}><Upload size={15} /></Btn>
          {lesson && <Btn title="أدرج من الدرس" active={menu === 'lesson'} onClick={() => setMenu(m => m === 'lesson' ? null : 'lesson')}><BookOpen size={15} /></Btn>}
          <Sep />

          <Btn title="تراجع (Ctrl+Z)" onClick={undo}><Undo2 size={15} /></Btn>
          <Btn title="إعادة (Ctrl+Shift+Z)" onClick={redo}><Redo2 size={15} /></Btn>
          <Btn title="شكل الصفحة ولونها" active={menu === 'page'} onClick={() => setMenu(m => m === 'page' ? null : 'page')}><LayoutGrid size={15} /></Btn>
          {selItem && <Btn title="خيارات العنصر المحدّد" active={menu === 'more'} onClick={() => setMenu(m => m === 'more' ? null : 'more')}><MoreHorizontal size={15} /></Btn>}
          {selItem && <Btn title="حذف (Del)" onClick={() => remove(selItem.id)}><Trash2 size={15} /></Btn>}

          <span className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
            <span className="font-bold whitespace-nowrap" style={{ fontSize: 10.5, color: saved === 'full' ? '#fca5a5' : 'rgba(255,255,255,0.3)' }}>
              {busy ? '…' : saved === 'full' ? 'المساحة ممتلئة' : saved === 'saving' ? '…' : saved === 'saved' ? '✓' : ''}
            </span>
            <Btn title="الاختصارات" active={menu === 'help'} onClick={() => setMenu(m => m === 'help' ? null : 'help')}><HelpCircle size={15} /></Btn>
            <button onMouseDown={hold} onClick={() => { if (confirm('امسح كل ما في هذا اللوح؟')) { mark(); setItems([]); textEls.current = {}; setSel(null); touch() } }}
              title="امسح اللوح" className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"><Trash2 size={14} /></button>
            <button onClick={onClose} title="إغلاق (Esc)" className="px-2.5 py-1 rounded-lg font-black text-[#2a1d12] hover:brightness-105 transition flex items-center gap-1 shrink-0" style={{ background: GOLD, fontSize: 12.5 }}>
              <X size={13} /> إغلاق
            </button>
          </span>

          {/* ── popovers ── */}
          {menu === 'page' && (
            <Pop align="right">
              <div className="flex gap-1 mb-2">
                {([['plain', 'سادة'], ['grid', 'مربّعات'], ['lines', 'أسطر']] as [Pattern, string][]).map(([v, t]) => (
                  <button key={v} onClick={() => { setPage(p => ({ ...p, pattern: v })); touch() }}
                    className="px-3 py-1.5 rounded-lg font-black transition"
                    style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, background: page.pattern === v ? GOLD : '#f5f5f4', color: INK }}>{t}</button>
                ))}
              </div>
              <div className="flex gap-1.5 mb-2">
                {PAPER.map(p => (
                  <button key={p.v} onClick={() => { setPage(s => ({ ...s, paper: p.v })); touch() }} title={p.label}
                    className="w-[26px] h-[26px] rounded-lg transition"
                    style={{ background: p.v, boxShadow: page.paper === p.v ? `0 0 0 2.5px ${GOLD}` : '0 0 0 1.5px #d6d3d1' }} />
                ))}
              </div>
              <button onClick={() => { setPage(p => ({ ...p, mark: !p.mark })); touch() }}
                className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold flex items-center gap-2"
                style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>
                <span className="w-4 h-4 rounded grid place-items-center shrink-0" style={{ background: page.mark ? GOLD : '#e7e5e4' }}>{page.mark && <Check size={11} strokeWidth={4} />}</span>
                توقيع inglizi.com على اللوح
              </button>
            </Pop>
          )}

          {menu === 'more' && selItem && (
            <Pop align="right">
              {selItem.kind === 'text' && (
                <>
                  <div className="flex gap-1.5 mb-2">
                    {CARD_STYLES.map(c => (
                      <button key={c.label} onClick={() => patch(selItem.id, { bg: c.bg, bd: c.bd })} title={c.label}
                        className="w-[26px] h-[26px] rounded-lg transition"
                        style={{ background: c.bg === 'transparent' ? '#fff' : c.bg, boxShadow: `inset 0 0 0 2px ${c.bd === 'transparent' ? '#d6d3d1' : c.bd}` }} />
                    ))}
                  </div>
                  <button onClick={() => patch(selItem.id, { dir: selItem.dir === 'rtl' ? 'ltr' : 'rtl' })}
                    className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>
                    اتجاه الكتابة: {selItem.dir === 'rtl' ? 'عربي ←' : 'إنجليزي →'}
                  </button>
                </>
              )}
              <button onClick={() => duplicate(selItem.id)} className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>تكرار (Ctrl+D)</button>
              <button onClick={() => sendBack(selItem.id)} className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-stone-100 font-bold" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12, color: INK }}>إلى الخلف</button>
            </Pop>
          )}

          {menu === 'lesson' && lesson && (
            <Pop align="right">
              {([['rule', 'القاعدة'], ['example', 'مثال'], ['objectives', 'الأهداف'], ['homework', 'الواجب']] as const).map(([k, t]) => (
                <button key={k} onClick={() => fromLesson(k)} className="w-full text-right px-3 py-1.5 rounded-lg hover:bg-amber-50 font-bold"
                  style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 12.5, color: INK, minWidth: 150 }}>{t}</button>
              ))}
            </Pop>
          )}

          {menu === 'help' && (
            <Pop align="right">
              {[['V T P H', 'تحديد · نص · قلم · تظليل'], ['A O R', 'سهم · دائرة · مستطيل'], ['E', 'ممحاة'],
                ['نقرة مزدوجة', 'اكتب في مكان النقر'], ['Ctrl+Z', 'تراجع'], ['Ctrl+D', 'تكرار'],
                ['Delete', 'حذف'], ['الأسهم', 'تحريك دقيق'], ['Ctrl+V', 'لصق صورة'], ['Esc', 'خروج ثم إغلاق']].map(([k, t]) => (
                <div key={k} className="flex items-center gap-3 py-[2px]" style={{ minWidth: 260 }}>
                  <span dir="ltr" className="font-mono font-bold rounded px-1.5 shrink-0" style={{ background: '#f5f5f4', color: INK, fontSize: 10.5 }}>{k}</span>
                  <span className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: 11.5 }}>{t}</span>
                </div>
              ))}
            </Pop>
          )}
        </div>

        {/* picture search */}
        {searchOpen && (
          <div className="shrink-0 border-b border-stone-200 bg-stone-50 px-[1vw] py-[1vh]">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-stone-400 shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void runSearch() } e.stopPropagation() }}
                placeholder="ابحث عن صورة… بالعربية أو بالإنجليزية" dir="auto"
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-stone-300 bg-white outline-none focus:border-yellow-400 font-bold"
                style={{ fontSize: 14, color: INK }} />
              <button onClick={() => void runSearch()} className="px-3 py-1.5 rounded-lg font-black text-[#2a1d12] shrink-0" style={{ background: GOLD, fontSize: 13 }}>بحث</button>
              <button onClick={() => setSearchOpen(false)} className="text-stone-400 hover:text-stone-700 shrink-0" aria-label="Close search"><X size={16} /></button>
            </div>
            <div className="mt-[0.8vh] max-h-[24vh] overflow-y-auto">
              {searching && <div className="py-3 text-center font-bold text-stone-400" style={{ fontSize: 13 }}>…جاري البحث</div>}
              {!searching && searched && !hits.length && (
                <div className="py-3 text-center font-bold text-stone-400" style={{ fontSize: 13 }}>لا نتائج. جرّب كلمة أخرى — أو انسخ صورة من Google والصقها هنا (Ctrl+V).</div>
              )}
              {!!hits.length && (<>
                <div className="grid grid-cols-8 gap-2">
                  {hits.map((h, i) => (
                    <button key={i} onMouseDown={hold} onClick={() => addImage(h.full)} title={`${h.credit} — اضغط لوضعها، أو اسحبها إلى المكان الذي تريد`}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-stone-200 hover:ring-2 hover:ring-yellow-400 transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.thumb} alt="" draggable
                        onDragStart={e => { e.dataTransfer.setData('text/uri-list', h.full); e.dataTransfer.setData('text/plain', h.full) }}
                        className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {provider && (
                  <div className="mt-[0.6vh] flex items-center gap-2 flex-wrap font-bold text-stone-400" style={{ fontSize: 10.5 }}>
                    <span>المصدر: {provider === 'unsplash' ? 'Unsplash — مرخّصة للاستعمال التجاري' : provider === 'google' ? 'Google Images — تحقّق من الحقوق' : provider}</span>
                    {term && <span dir="ltr" className="rounded px-1.5 py-0.5" style={{ background: '#fef3c7', color: AMBER }}>searched: {term}</span>}
                  </div>
                )}
              </>)}
            </div>
          </div>
        )}

        <input ref={fileInput} type="file" accept="image/*" multiple hidden
          onChange={e => { const f = Array.from(e.target.files ?? []); e.target.value = ''; void insertFiles(f) }} />

        {/* ── the board ── */}
        <div ref={boardRef} onPointerDown={onBoardPointerDown}
          onDoubleClick={e => { if (tool !== 'select') return; if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) { const p = pointIn(e); addText(p.x, p.y) } }}
          onPaste={onPaste} onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={e => { if (e.currentTarget === e.target) setDragOver(false) }}
          className="relative flex-1 min-h-0 overflow-auto"
          style={{ ...paperStyle, cursor: dragging ? 'grabbing' : drawTool ? 'crosshair' : tool === 'text' ? 'text' : 'default' }}>

          <div data-canvas="1" className="relative w-full" style={{ minHeight: Math.max(boardBottom + 320, 900) }}>
            {!items.length && !draft && (
              <div data-canvas="1" className="absolute inset-0 grid place-items-center pointer-events-none">
                <div dir="rtl" className="text-center font-bold leading-[1.9]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw', color: dark ? 'rgba(255,255,255,0.28)' : '#d6d3d1' }}>
                  انقر نقرتين في أي مكان لتكتب هناك
                </div>
              </div>
            )}

            {items.map(it => {
              const on = sel === it.id
              const chrome = on ? { outline: `2px solid ${GOLD}`, outlineOffset: 3 } : undefined
              return (
                <div key={`${it.id}:${rev}`} className="absolute"
                  style={{ left: it.x, top: it.y, width: it.w, zIndex: it.z, pointerEvents: drawTool ? 'none' : 'auto' }}>
                  {on && !drawTool && (
                    <div onPointerDown={e => startDrag(e, it, 'move')}
                      className="absolute -top-[24px] left-0 flex items-center gap-1 px-2 py-[2px] rounded-t-lg cursor-grab active:cursor-grabbing select-none"
                      style={{ background: GOLD, color: INK }}>
                      <Move size={11} /><span className="font-black" style={{ fontSize: 9.5 }}>اسحب</span>
                    </div>
                  )}

                  {it.kind === 'text' ? (
                    <div
                      ref={el => { textEls.current[it.id] = el; if (el && !el.dataset.init) { el.innerHTML = it.html || ''; el.dataset.init = '1' } }}
                      contentEditable suppressContentEditableWarning spellCheck={false}
                      dir={it.dir || 'ltr'}
                      onPointerDown={() => { setSel(it.id); bringFront(it.id); setMenu(null) }}
                      onInput={touch}
                      onBlur={() => {
                        // A box you opened but never typed into would linger as an invisible
                        // outline. Toolbar buttons preventDefault on mousedown and so never
                        // blur the box — clicking one cannot delete your work.
                        const el = textEls.current[it.id]
                        if (!el || el.innerHTML.replace(/<br>|&nbsp;|\s/g, '') === '') {
                          setItems(list => list.filter(i => i.id !== it.id))
                          delete textEls.current[it.id]
                          setSel(s => (s === it.id ? null : s))
                        }
                        persist()
                      }}
                      className="note-box outline-none"
                      style={{
                        ...chrome, minHeight: 48,
                        padding: it.bg && it.bg !== 'transparent' ? '16px 20px' : '6px 10px',
                        borderRadius: 12,
                        background: it.bg && it.bg !== 'transparent' ? it.bg : undefined,
                        boxShadow: it.bd && it.bd !== 'transparent' ? `inset 0 0 0 2px ${it.bd}` : undefined,
                        color: (it.bg && it.bg !== 'transparent') ? INK : (dark ? '#ffffff' : INK),
                        fontSize: 40, lineHeight: 1.5,
                        fontFamily: (it.dir || 'ltr') === 'rtl' ? "'Tajawal', 'Outfit', sans-serif" : "'Outfit', 'DM Sans', sans-serif",
                        textAlign: (it.dir || 'ltr') === 'rtl' ? 'right' : 'left',
                      }}
                    />
                  ) : it.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.src} alt="" draggable={false} onPointerDown={e => startDrag(e, it, 'move')}
                      style={{ ...chrome, width: '100%', height: it.h ?? 'auto', borderRadius: 12, display: 'block', cursor: 'grab' }} />
                  ) : (
                    <div onPointerDown={e => startDrag(e, it, 'move')} style={{ ...chrome, borderRadius: 8, cursor: 'grab' }}>
                      <Vector it={it} />
                    </div>
                  )}

                  {on && !drawTool && (
                    <div onPointerDown={e => startDrag(e, it, 'resize')} title="اسحب لتغيير الحجم"
                      className="absolute -bottom-[9px] -right-[9px] w-[18px] h-[18px] rounded-full cursor-nwse-resize"
                      style={{ background: GOLD, boxShadow: '0 0 0 2px #fff' }} />
                  )}
                </div>
              )
            })}

            {/* live preview while drawing */}
            {draft && draft.tool !== 'eraser' && (
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ overflow: 'visible' }}>
                {(draft.tool === 'pen' || draft.tool === 'mark')
                  ? <polyline fill="none" stroke={color} strokeWidth={draft.tool === 'mark' ? sw * 3.5 : sw} opacity={draft.tool === 'mark' ? 0.35 : 1}
                      strokeLinecap="round" strokeLinejoin="round" points={draft.pts.map(p => `${p[0]},${p[1]}`).join(' ')} />
                  : draft.tool === 'rect'
                    ? <rect fill="none" stroke={color} strokeWidth={sw} rx={8}
                        x={Math.min(draft.pts[0][0], draft.pts[1][0])} y={Math.min(draft.pts[0][1], draft.pts[1][1])}
                        width={Math.abs(draft.pts[1][0] - draft.pts[0][0])} height={Math.abs(draft.pts[1][1] - draft.pts[0][1])} />
                    : draft.tool === 'ellipse'
                      ? <ellipse fill="none" stroke={color} strokeWidth={sw}
                          cx={(draft.pts[0][0] + draft.pts[1][0]) / 2} cy={(draft.pts[0][1] + draft.pts[1][1]) / 2}
                          rx={Math.abs(draft.pts[1][0] - draft.pts[0][0]) / 2} ry={Math.abs(draft.pts[1][1] - draft.pts[0][1]) / 2} />
                      : <line stroke={color} strokeWidth={sw} strokeLinecap="round"
                          x1={draft.pts[0][0]} y1={draft.pts[0][1]} x2={draft.pts[1][0]} y2={draft.pts[1][1]} />}
              </svg>
            )}

            {/* quiet signature — a screenshot that spreads still carries the brand */}
            {page.mark && (
              <div className="absolute bottom-3 left-4 pointer-events-none select-none font-black"
                style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.20)' : 'rgba(42,29,18,0.16)' }}>
                inglizi.com
              </div>
            )}
          </div>

          {dragOver && (
            <div className="pointer-events-none fixed inset-0 grid place-items-center z-[210]">
              <span className="px-6 py-3 rounded-2xl font-black" style={{ background: GOLD, color: INK, fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>أفلت الصورة في المكان الذي تريد</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .note-box b, .note-box strong { font-weight: 800; }
        .note-box img { max-width: 100%; border-radius: 10px; }
      `}</style>
    </div>
  )
}

/* Slides that reveal their items one-by-one on Space. */
const stepsOf = (s?: Slide) => {
  if (!s) return 0
  if (s.t === 'objectives') return s.L.objectives.length
  if (s.t === 'homework') return s.L.homework.length
  if (s.t === 'exercises') return 1
  if (s.t === 'editing') return 1
  if (s.t === 'write') return s.L.studio?.steps?.length ?? 0
  if (s.t === 'checklist') return s.L.studio?.checklist?.length ?? 0
  return 0
}

export default function WritingDeck() {
  const { slides, jump, unitJump } = useMemo(buildSlides, [])
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
  const s = slides[idx]

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

  // Recording deep-link: /admin/present/writing?lesson=27 opens straight at that
  // lesson's cover — no clicking through slides before hitting Record.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('lesson')
    if (!raw) return
    const no = parseFloat(raw)
    if (!isNaN(no) && jump[no] != null) { setStep(0); setIdx(jump[no]) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const phase = s.t === 'intro' || s.t === 'end' || s.t === 'unit' ? null : (PHASE[s.t as Phase])
  // One sheet per lesson (unit openers and the intro get their own too).
  const noteKey = noteKeyOf(s)
  const noteLabel = L ? `درس ${numOf(L)}` : s.t === 'unit' ? `وحدة ${s.index}` : 'لوح'
  useEffect(() => { setHasNote(!!readNote(noteKey)) }, [noteKey])
  // Which unit the deck is standing in — drives the header chip and the drawer highlight.
  const activeUnit = s.t === 'unit' ? s.u : L ? unitOf(L.no) : null
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
        {(L || s.t === 'unit') && <span className="px-2.5 py-1.5 rounded-xl font-black whitespace-nowrap" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc' }}>{L ? cefrOf(L) : s.t === 'unit' ? s.u.cefr : ''}</span>}
        {phase && (
          <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#2a1d12] flex items-center gap-1.5" style={{ background: GOLD }}>
            <phase.Icon size={14} /> {phase.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{phase.ar}</span>
            {s.t === 'examples' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'exercises' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'irregulars' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
          </span>
        )}
        <div className="absolute right-[3vw] top-[2.4vh] flex items-center gap-2">
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
        <NotePad noteKey={noteKey} label={noteLabel} lesson={L}
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
  if (s.t === 'intro') {
    const totalLessons = ORDERED.length
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
          تبدأ من الحرف الأول، وتنتهي وأنت تكتب <span className="font-black" style={{ color: AMBER }}>فقرة كاملة وإيميلًا احترافيًا</span> بالإنجليزية — بثقة، وبقواعد تفهمها لا تحفظها.
        </div>

        {/* headline numbers */}
        <div dir="ltr" className="flex items-center gap-[2.4vw]">
          {[[String(totalLessons), 'lessons', 'درسًا'], [String(SYLLABUS.length), 'units', 'وحدات'], ['A1→B1', 'CEFR level', 'المستوى']].map(([v, en, ar], i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-black leading-none" style={{ color: INK, fontSize: '2.1vw' }}>{v}</span>
              <span className="font-black text-stone-400 uppercase tracking-[0.12em]" style={{ fontSize: '0.66vw' }}>{en}</span>
              <span dir="rtl" className="font-bold text-stone-300" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.7vw' }}>{ar}</span>
            </div>
          ))}
        </div>

        {/* the journey — 7 units on one rail; click a unit to open it */}
        <div dir="ltr" className="w-full relative">
          {/* the rail sits exactly on the circle centres: button padding + half the circle,
              and stops at the first/last centre (one half-column in from each edge). */}
          <div className="absolute h-[3px] rounded-full"
            style={{ top: 'calc(0.8vh + 1.3vw)', left: `${50 / SYLLABUS.length}%`, right: `${50 / SYLLABUS.length}%`, background: 'linear-gradient(90deg,#fde68a,#facc15,#b45309)' }} />
          <div className="relative grid gap-[0.7vw] w-full" style={{ gridTemplateColumns: `repeat(${SYLLABUS.length}, minmax(0,1fr))` }}>
            {SYLLABUS.map((u, ui) => {
              const count = u.modules.reduce((n, m) => n + lessonsIn(m).length, 0)
              return (
                <button key={ui} onClick={() => onJumpUnit(ui)}
                  className="group flex flex-col items-center gap-[0.5vh] rounded-2xl px-[0.5vw] py-[0.8vh] hover:bg-amber-50/70 transition">
                  <span className="grid place-items-center rounded-full font-black shrink-0 ring-4 ring-white transition-transform group-hover:scale-110"
                    style={{ width: '2.6vw', height: '2.6vw', background: INK, color: GOLD, fontSize: '1vw' }}>{ui + 1}</span>
                  <span className="font-black leading-tight" style={{ color: INK, fontSize: '0.88vw' }}>{u.short}</span>
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
          <span className="font-black tracking-[0.14em] uppercase" style={{ color: AMBER, fontSize: '0.9vw' }}>{s.count} lessons · starts at lesson {s.startsAt}</span>
        </div>
        <div>
          <div className="inline-block mb-[1.2vh] px-6 py-2 rounded-full font-black tracking-[0.18em]" style={{ background: GOLD, color: INK, fontSize: '1.1vw' }}>
            UNIT {s.index} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الوحدة {s.index}</span>
          </div>
          <h1 className="font-black leading-[1.06] tracking-tight" style={{ color: INK, fontSize: '3.6vw' }}>{u.en.split(' · ')[1]}</h1>
          <div dir="rtl" className="mt-[0.8vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2.1vw' }}>{u.ar.split(' · ')[1]}</div>
        </div>
        {/* the unit's promise */}
        <div className="w-full rounded-[28px] bg-amber-50 ring-2 ring-amber-200 px-[3vw] py-[2.2vh]">
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
                  <span className="font-black" style={{ color: AMBER, fontSize: '0.98vw' }}>{m.en}</span>
                  <span className="ml-auto font-bold text-stone-300" style={{ fontSize: '0.72vw' }}>{items.length}</span>
                </div>
                <div dir="rtl" className="font-bold text-stone-400 mb-[0.8vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.82vw' }}>{m.ar}</div>
                <div className="flex flex-wrap gap-[0.35vw]">
                  {items.map(L2 => (
                    <button key={L2.no} onClick={() => onJump(L2.no)}
                      className="rounded-lg bg-stone-50 ring-1 ring-stone-200 hover:ring-yellow-400 hover:bg-amber-50 transition px-[0.5vw] py-[0.35vh] font-bold"
                      style={{ color: INK, fontSize: '0.78vw' }}>
                      <span className="font-black" style={{ color: AMBER }}>{numOf(L2)}</span> {L2.tag}
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

  if (s.t === 'cover') {
    const u = unitOf(s.L.no)
    const m = moduleOf(s.L.no)
    const n = numOf(s.L)
    return (
      <div className="text-center max-w-[80vw]">
        <div className="flex items-center justify-center gap-[0.8vw] mb-[1.4vh]">
          <span className="rounded-lg px-2.5 py-1 font-black" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc', fontSize: '0.9vw' }}>CEFR {cefrOf(s.L)}</span>
          <span className="font-black tracking-[0.1em] uppercase" style={{ color: AMBER, fontSize: '0.9vw' }}>{u.en} <span className="text-stone-300">›</span> {m.en}</span>
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
        <Lightbulb size={26} style={{ color: AMBER }} />
        <Heading en="The Rule" ar="القاعدة" />
      </div>
      <div className="w-full rounded-[32px] bg-amber-50 ring-2 ring-amber-200 px-[3vw] py-[3.2vh] shadow-[0_24px_60px_-34px_rgba(180,120,20,0.6)]">
        <Marked text={s.L.rule.en} className="block font-black leading-[1.35]" style={{ color: INK, fontSize: '2vw' }} />
        <div dir="rtl" className="mt-[1.8vh] pt-[1.8vh] border-t border-amber-200 font-bold text-stone-600 leading-[1.7]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.7vw' }}>{s.L.rule.ar}</div>
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
              <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-[0.7vh]" style={{ background: GOLD }} />
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
        <div className="w-full rounded-[40px] bg-white ring-1 ring-stone-200 shadow-[0_34px_80px_-38px_rgba(42,29,18,0.55)] px-[5vw] py-[7vh] flex flex-col items-center gap-[3.2vh]">
          <Marked text={s.item.en} className="font-black text-center leading-[1.22]" style={{ color: INK, fontSize: short ? '4vw' : '3.1vw' }} />
          <div className="rounded-full" style={{ width: '34%', height: 3, background: '#f5f5f4' }} />
          <div dir="rtl" className="font-black text-stone-500 text-center leading-[1.4]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: short ? '2.6vw' : '2.1vw' }}>{s.item.ar}</div>
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
            <div className="mt-[2vh] flex items-start gap-[0.9vw] rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-[1.6vw] py-[1.3vh]">
              <Sparkles size={17} style={{ color: AMBER }} className="mt-[0.3vh] shrink-0" />
              <div>
                <span className="font-bold" style={{ color: AMBER, fontSize: '1.05vw' }}>{R.tip}</span>
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
