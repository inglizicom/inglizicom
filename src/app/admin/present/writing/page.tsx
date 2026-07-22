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
  PencilLine, BookOpen, ClipboardList, HelpCircle, SearchCheck,
  Menu, X, ChevronDown, ListTree,
  Globe, Instagram, Youtube, GraduationCap, Phone,
} from 'lucide-react'
import { LESSONS, type Lesson, type Ex, type QA } from '@/data/writing-course'

const INK = '#2a1d12'
const GOLD = '#facc15'
const AMBER = '#b45309'
const EX_PER = 9
const QA_PER = 6

// Lessons in teaching order (the data may be authored out of order; `no` is the key).
const ORDERED = [...LESSONS].sort((a, b) => a.no - b.no)

// Three-level syllabus: Unit → Module → Lessons (referenced by `no` range).
type ModDef = { en: string; ar: string; from: number; to: number }
type UnitDef = { en: string; short: string; ar: string; modules: ModDef[] }
const SYLLABUS: UnitDef[] = [
  { en: 'Unit 1 · Writing Mechanics', short: 'Mechanics', ar: 'الوحدة ١ · أساسيات الكتابة', modules: [
    { en: 'Letters & Sounds', ar: 'الحروف والأصوات', from: 1, to: 2 },
    { en: 'Marks & Articles', ar: 'العلامات والأدوات', from: 3, to: 5 },
  ] },
  { en: 'Unit 2 · Words & Agreement', short: 'Words', ar: 'الوحدة ٢ · الكلمات والتطابق', modules: [
    { en: 'Nouns & People', ar: 'الأسماء والأشخاص', from: 6, to: 8 },
    { en: 'Verbs & Agreement', ar: 'الأفعال والتطابق', from: 9, to: 11 },
  ] },
  { en: 'Unit 3 · Building Sentences', short: 'Sentences', ar: 'الوحدة ٣ · بناء الجمل', modules: [
    { en: 'Complete Sentences', ar: 'الجمل الكاملة', from: 12, to: 13 },
    { en: 'Joining Ideas', ar: 'ربط الأفكار', from: 14, to: 16 },
    { en: 'Punctuation & Style', ar: 'الترقيم والأسلوب', from: 17, to: 20 },
  ] },
  { en: 'Unit 4 · Writing Paragraphs', short: 'Paragraphs', ar: 'الوحدة ٤ · كتابة الفقرات', modules: [
    { en: 'Paragraph Structure', ar: 'بنية الفقرة', from: 21, to: 22 },
    { en: 'Writing & Polishing', ar: 'الكتابة والصقل', from: 23, to: 25 },
  ] },
]
const unitOf = (no: number) => SYLLABUS.find(u => u.modules.some(m => no >= m.from && no <= m.to)) ?? SYLLABUS[0]
const moduleOf = (no: number) => {
  for (const u of SYLLABUS) { const m = u.modules.find(m => no >= m.from && no <= m.to); if (m) return m }
  return SYLLABUS[0].modules[0]
}
const lessonsIn = (m: ModDef) => ORDERED.filter(L => L.no >= m.from && L.no <= m.to)

type Phase = 'cover' | 'objectives' | 'rule' | 'explain' | 'examples' | 'exercises' | 'reading' | 'comprehension' | 'homework' | 'editing'
type Slide =
  | { t: 'intro' }
  | { t: 'end' }
  | { t: 'cover'; L: Lesson }
  | { t: 'objectives'; L: Lesson }
  | { t: 'rule'; L: Lesson }
  | { t: 'explain'; L: Lesson }
  | { t: 'examples'; L: Lesson; items: Ex[]; page: number; pages: number }
  | { t: 'exercises'; L: Lesson; items: QA[]; page: number; pages: number }
  | { t: 'reading'; L: Lesson }
  | { t: 'comprehension'; L: Lesson }
  | { t: 'homework'; L: Lesson }
  | { t: 'editing'; L: Lesson }

const PHASE: Record<Phase, { en: string; ar: string; Icon: typeof Target }> = {
  cover:         { en: 'Lesson',         ar: 'الدرس',        Icon: BookOpen },
  objectives:    { en: 'Objectives',     ar: 'الأهداف',      Icon: Target },
  rule:          { en: 'The Rule',       ar: 'القاعدة',      Icon: Lightbulb },
  explain:       { en: 'Explanation',    ar: 'الشرح',        Icon: Info },
  examples:      { en: 'Examples',       ar: 'أمثلة',         Icon: Layers },
  exercises:     { en: 'Exercise',       ar: 'تمرين',         Icon: PencilLine },
  reading:       { en: 'Reading',        ar: 'نص للقراءة',    Icon: BookOpen },
  comprehension: { en: 'Comprehension',  ar: 'أسئلة الفهم',   Icon: HelpCircle },
  homework:      { en: 'Homework',       ar: 'واجب منزلي',    Icon: ClipboardList },
  editing:       { en: 'Find the Mistakes', ar: 'صحّح الأخطاء', Icon: SearchCheck },
}

/* Build the flat slide list + a lesson→cover-index map for jump navigation. */
function buildSlides(): { slides: Slide[]; jump: Record<number, number> } {
  const slides: Slide[] = [{ t: 'intro' }]
  const jump: Record<number, number> = {}
  for (const L of ORDERED) {
    jump[L.no] = slides.length
    slides.push({ t: 'cover', L }, { t: 'objectives', L }, { t: 'rule', L }, { t: 'explain', L })
    const ep = Math.ceil(L.examples.length / EX_PER)
    for (let p = 0; p < ep; p++) slides.push({ t: 'examples', L, items: L.examples.slice(p * EX_PER, p * EX_PER + EX_PER), page: p + 1, pages: ep })
    const qp = Math.ceil(L.exercises.length / QA_PER)
    for (let p = 0; p < qp; p++) slides.push({ t: 'exercises', L, items: L.exercises.slice(p * QA_PER, p * QA_PER + QA_PER), page: p + 1, pages: qp })
    slides.push({ t: 'reading', L }, { t: 'comprehension', L }, { t: 'homework', L }, { t: 'editing', L })
  }
  slides.push({ t: 'end' })
  return { slides, jump }
}

/* Reveal *marked* parts of an English string. */
function Marked({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const parts = text.split('*')
  return (
    <span className={className} style={style}>
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
  if (s.t === 'exercises') return s.items.length
  if (s.t === 'comprehension') return s.L.reading.questions.length
  if (s.t === 'editing') return 1
  return 0
}

export default function WritingDeck() {
  const { slides, jump } = useMemo(buildSlides, [])
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  // Left index drawer (Unit → Module → Lesson). Open on landing; modules start expanded.
  const [drawerOpen, setDrawerOpen] = useState(true)
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
          <PenLine size={15} style={{ color: GOLD }} /> {L ? `Lesson ${L.no} / ${LESSONS.length}` : 'English from Zero'} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{L ? L.tagAr : 'الإنجليزية من الصفر'}</span>
        </span>
        {phase && (
          <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#2a1d12] flex items-center gap-1.5" style={{ background: GOLD }}>
            <phase.Icon size={14} /> {phase.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{phase.ar}</span>
            {s.t === 'examples' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
            {s.t === 'exercises' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}
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
                <div className="font-black leading-tight" style={{ color: AMBER, fontSize: '0.9vw' }}>{u.en}</div>
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
                              <span className="grid place-items-center rounded-md font-black shrink-0" style={{ width: 24, height: 24, background: active ? GOLD : '#e7e5e4', color: INK, fontSize: '0.72vw' }}>{L2.no}</span>
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
            <motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
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
      <div dir="ltr" className="grid grid-cols-4 gap-[1vw] w-full">
        {SYLLABUS.map((u, ui) => {
          const count = u.modules.reduce((n, m) => n + (m.to - m.from + 1), 0)
          return (
            <button key={ui} onClick={() => onJump(u.modules[0].from)}
              className="rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-yellow-400 hover:shadow-[0_14px_30px_-20px_rgba(42,29,18,0.5)] transition px-[1vw] py-[1.8vh] flex flex-col items-center gap-[0.3vh]">
              <span className="grid place-items-center rounded-xl font-black text-[#2a1d12]" style={{ width: '2.4vw', height: '2.4vw', background: GOLD, fontSize: '1.1vw' }}>{ui + 1}</span>
              <span className="font-black leading-tight mt-[0.5vh]" style={{ color: INK, fontSize: '1.05vw' }}>{u.en.split(' · ')[1]}</span>
              <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.85vw' }}>{u.ar.split(' · ')[1]}</span>
              <span className="mt-[0.4vh] text-stone-400 font-bold" style={{ fontSize: '0.76vw' }}>{u.modules.length} modules · {count} lessons</span>
            </button>
          )
        })}
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
    return (
      <div className="text-center max-w-[80vw]">
        <div className="font-black tracking-[0.12em] uppercase mb-[1.2vh]" style={{ color: AMBER, fontSize: '0.92vw' }}>
          {u.en} <span className="text-stone-300">›</span> {m.en}
        </div>
        <div className="inline-block mb-[1.8vh] px-5 py-2 rounded-full font-black tracking-[0.15em] text-[1.1vw]" style={{ background: GOLD, color: INK }}>
          LESSON {s.L.no} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الدرس {s.L.no}</span>
        </div>
        <h1 className="font-black leading-[1.06] tracking-tight" style={{ color: INK, fontSize: '3.8vw' }}>{s.L.title}</h1>
        <div dir="rtl" className="mt-[1.2vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2.2vw' }}>{s.L.titleAr}</div>
        <div className="mt-[2.4vh] text-stone-400 font-bold" style={{ fontSize: '1vw' }}>Lesson {s.L.no} of {ORDERED.length}</div>
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
        <Marked text={s.L.explain.intro} className="font-bold text-stone-700" style={{ fontSize: '1.4vw' }} />
        <div dir="rtl" className="mt-[0.6vh] font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>{s.L.explain.introAr}</div>
      </div>
      <div dir="ltr" className="grid grid-cols-2 gap-x-[2vw] gap-y-[1.2vh] w-full">
        {s.L.explain.points.map((p, i) => (
          <div key={i} className="flex items-center gap-[0.9vw] rounded-2xl bg-white ring-1 ring-stone-200 px-[1.4vw] py-[1.2vh]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GOLD }} />
            <Marked text={p.en} className="font-bold" style={{ color: INK, fontSize: '1.15vw' }} />
            <span dir="rtl" className="ml-auto font-bold text-stone-400 text-right" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>{p.ar}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (s.t === 'examples') {
    const n = s.items.length
    const cols = n <= 4 ? 2 : n <= 6 ? 3 : 3
    return (
      <div className="w-full max-w-[84vw] flex flex-col items-center gap-[2.4vh]">
        <Heading en="Examples" ar="أمثلة" />
        <div dir="ltr" className="grid w-full gap-[1.1vw]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {s.items.map((ex, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}
              className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_28px_-22px_rgba(42,29,18,0.5)] px-[1.4vw] py-[1.3vh] flex flex-col gap-[0.5vh]">
              <Marked text={ex.en} className="font-black leading-snug" style={{ color: INK, fontSize: '1.3vw' }} />
              <span dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>{ex.ar}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (s.t === 'exercises') return (
    <div className="w-full max-w-[74vw] flex flex-col items-center gap-[2.2vh]">
      <div className="flex items-center gap-[0.8vw]">
        <Heading en="Exercise" ar="تمرين" />
      </div>
      <div className="w-full flex flex-col gap-[1.2vh]">
        {s.items.map((qa, i) => (
          <div key={i} className="w-full rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.3vh]">
            <div className="flex items-center gap-[1vw]">
              <span className="grid place-items-center rounded-full font-black text-[#2a1d12] shrink-0" style={{ width: '2.3vw', height: '2.3vw', background: '#e7e5e4', fontSize: '1vw' }}>{i + 1}</span>
              <Marked text={qa.q} className="font-bold" style={{ color: INK, fontSize: '1.3vw' }} />
            </div>
            {i < step ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25 }}
                className="flex items-center gap-[0.8vw] mt-[1vh] ml-[3.3vw]">
                <Check size={17} className="text-emerald-500 shrink-0" strokeWidth={3} />
                <Marked text={qa.a} className="font-black" style={{ color: '#059669', fontSize: '1.3vw' }} />
              </motion.div>
            ) : (
              <div className="mt-[1vh] ml-[3.3vw] text-stone-300 font-bold italic" style={{ fontSize: '1vw' }}>… ?</div>
            )}
          </div>
        ))}
      </div>
      {step < s.items.length && (
        <div className="text-stone-400 font-bold" style={{ fontSize: '0.95vw' }}>
          Press <kbd className="px-2 py-0.5 rounded bg-stone-100 ring-1 ring-stone-300 font-mono">Space</kbd> to reveal the answer ·
          <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}> اضغط مسافة لإظهار الجواب</span>
        </div>
      )}
    </div>
  )

  if (s.t === 'reading') {
    const R = s.L.reading
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

  if (s.t === 'comprehension') {
    const qs = s.L.reading.questions
    return (
      <div className="w-full max-w-[74vw] flex flex-col items-center gap-[2vh]">
        <div className="flex items-center gap-[0.8vw]">
          <HelpCircle size={26} style={{ color: AMBER }} />
          <Heading en="Comprehension" ar="أسئلة الفهم" />
        </div>
        <div className="text-center font-bold text-stone-400" style={{ fontSize: '1vw' }}>
          Answer about the passage you just read
          <span dir="rtl" className="block" style={{ fontFamily: "'Tajawal', sans-serif" }}>أجب عن النص الذي قرأته للتو</span>
        </div>
        <div className="w-full flex flex-col gap-[1.2vh]">
          {qs.map((qa, i) => (
            <div key={i} className="w-full rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.3vh]">
              <div className="flex items-center gap-[1vw]">
                <span className="grid place-items-center rounded-full font-black text-[#2a1d12] shrink-0" style={{ width: '2.3vw', height: '2.3vw', background: '#e7e5e4', fontSize: '1vw' }}>{i + 1}</span>
                <Marked text={qa.q} className="font-bold" style={{ color: INK, fontSize: '1.25vw' }} />
              </div>
              {i < step ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex items-center gap-[0.8vw] mt-[1vh] ml-[3.3vw]">
                  <Check size={17} className="text-emerald-500 shrink-0" strokeWidth={3} />
                  <Marked text={qa.a} className="font-black" style={{ color: '#059669', fontSize: '1.25vw' }} />
                </motion.div>
              ) : <div className="mt-[1vh] ml-[3.3vw] text-stone-300 font-bold italic" style={{ fontSize: '1vw' }}>… ?</div>}
            </div>
          ))}
        </div>
        {step < qs.length && (
          <div className="text-stone-400 font-bold" style={{ fontSize: '0.95vw' }}>
            Press <kbd className="px-2 py-0.5 rounded bg-stone-100 ring-1 ring-stone-300 font-mono">Space</kbd> to reveal the answer ·
            <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}> اضغط مسافة لإظهار الجواب</span>
          </div>
        )}
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
    const E = s.L.editing
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

  // end
  return (
    <div className="text-center max-w-[80vw] flex flex-col items-center gap-[3vh]">
      <div>
        <div className="text-[4.5vw] mb-[1vh]">🎓</div>
        <h1 className="font-black leading-[1.04] tracking-tight" style={{ color: INK, fontSize: '4.4vw' }}>You finished the course!</h1>
        <div dir="rtl" className="mt-[1.2vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2.6vw' }}>أنهيتَ الدورة — من الصفر إلى الكتابة!</div>
      </div>
      <Footer />
    </div>
  )
}
