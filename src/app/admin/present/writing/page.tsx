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
type ModDef = { en: string; ar: string; from: number; to: number }
type UnitDef = { en: string; short: string; ar: string; cefr: string; modules: ModDef[] }
const SYLLABUS: UnitDef[] = [
  { en: 'Unit 1 · Writing Mechanics', short: 'Mechanics', ar: 'الوحدة ١ · أساسيات الكتابة', cefr: 'A1', modules: [
    { en: 'Letters & Sounds', ar: 'الحروف والأصوات', from: 1, to: 2 },
    { en: 'Marks & Articles', ar: 'العلامات والأدوات', from: 3, to: 5 },
  ] },
  { en: 'Unit 2 · Words, Tenses & Agreement', short: 'Words & Verbs', ar: 'الوحدة ٢ · الكلمات والأزمنة', cefr: 'A1–A2', modules: [
    { en: 'Nouns & People', ar: 'الأسماء والأشخاص', from: 6, to: 8 },
    { en: 'Pronouns & Adjectives', ar: 'الضمائر والصفات', from: 8.2, to: 9.9 },
    { en: 'Verb Tenses', ar: 'أزمنة الأفعال', from: 10, to: 10.85 },
    { en: 'Agreement, Modals & Comparing', ar: 'التطابق والأفعال الناقصة والمقارنة', from: 10.9, to: 11.9 },
  ] },
  { en: 'Unit 3 · Building Sentences', short: 'Sentences', ar: 'الوحدة ٣ · بناء الجمل', cefr: 'A2', modules: [
    { en: 'Complete Sentences', ar: 'الجمل الكاملة', from: 12, to: 13 },
    { en: 'Joining Ideas', ar: 'ربط الأفكار', from: 14, to: 16.5 },
    { en: 'Punctuation & Style', ar: 'الترقيم والأسلوب', from: 17, to: 20 },
  ] },
  { en: 'Unit 4 · Writing Paragraphs', short: 'Paragraphs', ar: 'الوحدة ٤ · كتابة الفقرات', cefr: 'B1', modules: [
    { en: 'Paragraph Structure', ar: 'بنية الفقرة', from: 21, to: 22.6 },
    { en: 'Writing & Polishing', ar: 'الكتابة والصقل', from: 23, to: 25 },
  ] },
  { en: 'Unit 5 · Professional Writing', short: 'Professional', ar: 'الوحدة ٥ · الكتابة الاحترافية', cefr: 'B1', modules: [
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

/* Build the flat slide list + a lesson→cover-index map for jump navigation. */
function buildSlides(): { slides: Slide[]; jump: Record<number, number> } {
  const slides: Slide[] = [{ t: 'intro' }]
  const jump: Record<number, number> = {}
  for (const L of ORDERED) {
    jump[L.no] = slides.length
    slides.push({ t: 'cover', L }, { t: 'objectives', L })
    if (L.rule) slides.push({ t: 'rule', L })
    if (L.studio) {
      // Writing-studio flow (paragraph lessons) — hands-on, replaces the grammar drills.
      const st = L.studio
      if (st.model) slides.push({ t: 'model', L })
      if (st.plan) slides.push({ t: 'plan', L })
      if (st.toolkit) slides.push({ t: 'toolkit', L })
      if (st.steps) slides.push({ t: 'write', L })
      if (st.checklist) slides.push({ t: 'checklist', L })
    } else {
      // Grammar flow.
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
    }
    slides.push({ t: 'homework', L })
    if (L.editing) slides.push({ t: 'editing', L })
  }
  slides.push({ t: 'end' })
  return { slides, jump }
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
  const { slides, jump } = useMemo(buildSlides, [])
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

  // Recording deep-link: /admin/present/writing?lesson=27 opens straight at that
  // lesson's cover — no clicking through slides before hitting Record.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('lesson')
    if (!raw) return
    const no = parseFloat(raw)
    if (!isNaN(no) && jump[no] != null) { setStep(0); setIdx(jump[no]) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // drawer keys: M toggles the index, Escape closes it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key.toLowerCase() === 'm') setDrawerOpen(o => !o)
      else if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  // full-screen
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    const onKey = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement) return; if (e.key.toLowerCase() === 'f') toggleFs() }
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
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
  const phase = s.t === 'intro' || s.t === 'end' ? null : (PHASE[s.t as Phase])

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
        </div>
        <span className="px-3.5 py-1.5 rounded-xl text-white font-black whitespace-nowrap flex items-center gap-2" style={{ background: INK }}>
          <PenLine size={15} style={{ color: GOLD }} /> {L ? `Lesson ${numOf(L)} / ${ORDERED.length}` : 'English from Zero'} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{L ? L.tagAr : 'الإنجليزية من الصفر'}</span>
        </span>
        {L && <span className="px-2.5 py-1.5 rounded-xl font-black whitespace-nowrap" style={{ background: '#ecfeff', color: '#0e7490', boxShadow: 'inset 0 0 0 1.5px #a5f3fc' }}>{cefrOf(L)}</span>}
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
        <div className="flex items-center justify-between px-[1.4vw] py-[1.6vh] shrink-0" style={{ background: INK }}>
          <span className="flex items-center gap-2 font-black text-white" style={{ fontSize: '0.95vw' }}><ListTree size={16} style={{ color: GOLD }} /> Course Index · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الفهرس</span></span>
          <button onClick={() => setDrawerOpen(false)} className="text-white/70 hover:text-white transition" aria-label="Close index"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-[0.8vw] py-[1.2vh]">
          {SYLLABUS.map((u, ui) => (
            <div key={ui} className="mb-[1.2vh]">
              <div className="px-[0.6vw] pb-[0.5vh] mb-[0.4vh] border-b border-stone-100">
                <div className="flex items-center gap-[0.5vw]">
                  <span className="rounded font-black px-1.5 py-0.5" style={{ background: '#ecfeff', color: '#0e7490', fontSize: '0.7vw' }}>{u.cefr}</span>
                  <span className="font-black leading-tight" style={{ color: AMBER, fontSize: '0.9vw' }}>{u.en}</span>
                </div>
                <div dir="rtl" className="font-bold text-stone-400 leading-tight" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.75vw' }}>{u.ar}</div>
              </div>
              {u.modules.map((m, mi) => {
                const key = `${ui}-${mi}`
                const open = expanded.has(key)
                return (
                  <div key={mi} className="mb-[0.4vh]">
                    <button onClick={() => toggleModule(key)} className="w-full flex items-center gap-[0.5vw] px-[0.6vw] py-[0.6vh] rounded-lg hover:bg-stone-100 transition text-left">
                      <ChevronDown size={14} className="shrink-0 transition-transform" style={{ color: '#a8a29e', transform: open ? 'none' : 'rotate(-90deg)' }} />
                      <span className="font-bold" style={{ color: INK, fontSize: '0.85vw' }}>{m.en}</span>
                      <span dir="rtl" className="ml-auto font-bold text-stone-400 truncate" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.75vw' }}>{m.ar}</span>
                    </button>
                    {open && (
                      <div className="ml-[1.1vw] mt-[0.3vh] flex flex-col gap-[0.25vh] border-l-2 border-stone-100 pl-[0.5vw]">
                        {lessonsIn(m).map(L2 => {
                          const active = L2.no === currentNo
                          return (
                            <button key={L2.no} onClick={() => jumpTo(L2.no)}
                              className={`flex items-center gap-[0.5vw] px-[0.5vw] py-[0.5vh] rounded-lg text-left transition ${active ? '' : 'hover:bg-stone-100'}`}
                              style={active ? { background: '#fef3c7', boxShadow: 'inset 0 0 0 1.5px #fcd34d' } : undefined}>
                              <span className="grid place-items-center rounded-md font-black shrink-0" style={{ width: 24, height: 24, background: active ? GOLD : '#e7e5e4', color: INK, fontSize: '0.72vw' }}>{numOf(L2)}</span>
                              <span className="min-w-0">
                                <span className="block font-bold truncate" style={{ color: INK, fontSize: '0.82vw' }}>{L2.tag}</span>
                                <span dir="rtl" className="block font-bold text-stone-400 truncate" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.7vw' }}>{L2.tagAr}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* side-click nav (not on intro so the outline stays clickable) */}
      {s.t !== 'intro' && (<>
        <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[9%] z-20 cursor-w-resize" aria-label="Previous" />
        <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[9%] z-20 cursor-e-resize" aria-label="Next" />
      </>)}

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-[5vw] py-[1.6vh] relative z-10 min-h-0 overflow-hidden">
        <div className="w-full flex items-center justify-center"
          onPointerDown={onPanDown} onPointerMove={onPanMove} onPointerUp={onPanUp} onPointerCancel={onPanUp}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 150ms', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx} dir="ltr" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center">
              <SlideView s={s} step={step} onJump={jumpTo} />
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
function SlideView({ s, step, onJump }: { s: Slide; step: number; onJump: (no: number) => void }) {
  if (s.t === 'intro') return (
    <div className="w-full max-w-[82vw] flex flex-col items-center gap-[2.6vh] text-center">
      <div>
        <div className="inline-block mb-[0.8vh] px-5 py-1.5 rounded-full font-bold tracking-[0.2em] text-[0.9vw]" style={{ background: INK, color: GOLD }}>
          ZERO → WRITING · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>من الصفر إلى الكتابة</span>
        </div>
        <h1 className="font-black leading-[1.02] tracking-tight" style={{ color: INK, fontSize: '4vw' }}>English from Zero</h1>
        <div dir="rtl" className="mt-[0.3vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2vw' }}>الإنجليزية من الصفر إلى الكتابة</div>
      </div>
      {/* unit overview — click a unit to jump into it; the full index lives in the drawer */}
      <div dir="ltr" className="grid gap-[1vw] w-full" style={{ gridTemplateColumns: `repeat(${SYLLABUS.length}, minmax(0,1fr))` }}>
        {SYLLABUS.map((u, ui) => {
          const count = u.modules.reduce((n, m) => n + lessonsIn(m).length, 0)
          return (
            <button key={ui} onClick={() => onJump(u.modules[0].from)}
              className="rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-yellow-400 hover:shadow-[0_14px_30px_-20px_rgba(42,29,18,0.5)] transition px-[1vw] py-[1.6vh] flex flex-col items-center gap-[0.25vh]">
              <span className="rounded-lg px-2.5 py-0.5 font-black mb-[0.3vh]" style={{ background: '#ecfeff', color: '#0e7490', fontSize: '0.85vw' }}>CEFR {u.cefr}</span>
              <span className="font-black leading-tight" style={{ color: INK, fontSize: '1.02vw' }}>{u.en.split(' · ')[1]}</span>
              <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.82vw' }}>{u.ar.split(' · ')[1]}</span>
              <span className="mt-[0.4vh] text-stone-400 font-bold" style={{ fontSize: '0.74vw' }}>{u.modules.length} modules · {count} lessons</span>
            </button>
          )
        })}
      </div>
      {/* what comes WITH the course — recorded straight into the intro */}
      <div dir="rtl" className="flex flex-wrap items-center justify-center gap-[0.8vw]">
        {[
          ['📝', 'تصحيح سريع لواجباتك — كتابيًا أو صوتيًا'],
          ['🎥', 'لايف أسبوعي للأسئلة والأجوبة'],
          ['🎓', 'شهادة إتمام باسمك'],
        ].map(([emo, label], i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full px-[1.2vw] py-[0.7vh] font-black text-white" style={{ background: INK, fontSize: '1vw', fontFamily: "'Tajawal', sans-serif" }}>
            <span>{emo}</span> {label}
          </span>
        ))}
      </div>
      <div className="font-bold text-stone-400 flex flex-col items-center gap-[0.4vh]" style={{ fontSize: '0.92vw' }}>
        <span className="flex items-center gap-1.5">Open the <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[#2a1d12] font-black" style={{ background: GOLD }}><Menu size={12} /> index</span> on the left (or press M) to browse every unit, module and lesson.</span>
        <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>افتح الفهرس على اليسار (أو اضغط M) لتصفّح الوحدات والوحدات الفرعية والدروس · مسافة للتقدّم · F لملء الشاشة.</span>
      </div>
    </div>
  )

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

  if (s.t === 'explain') return (
    <div className="w-full max-w-[76vw] flex flex-col items-center gap-[2.4vh]">
      <Heading en="Explanation" ar="الشرح" />
      <div className="text-center max-w-[62vw]">
        <Marked text={s.L.explain!.intro} className="font-bold text-stone-700" style={{ fontSize: '1.4vw' }} />
        <div dir="rtl" className="mt-[0.6vh] font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>{s.L.explain!.introAr}</div>
      </div>
      <div dir="ltr" className="grid grid-cols-2 gap-x-[2vw] gap-y-[1.2vh] w-full">
        {s.L.explain!.points.map((p, i) => (
          <div key={i} className="flex items-center gap-[0.9vw] rounded-2xl bg-white ring-1 ring-stone-200 px-[1.4vw] py-[1.2vh]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GOLD }} />
            <Marked text={p.en} className="font-bold" style={{ color: INK, fontSize: '1.15vw' }} />
            <span dir="rtl" className="ml-auto font-bold text-stone-400 text-right" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>{p.ar}</span>
          </div>
        ))}
      </div>
    </div>
  )

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
