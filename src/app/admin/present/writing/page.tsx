'use client'

/**
 * /admin/present/writing — a standalone teaching deck: "From Grammar to Writing"
 * (من القواعد إلى الكتابة). A zero-to-hero lesson that walks an extreme beginner
 * from verb tenses → conjunctions → the 4 sentence types → commas → parallel
 * structure & sentence variety, then puts it all together in one paragraph.
 *
 * Source material: Academic English — Writing (basics of grammar & punctuation).
 * Same brand language as the unit decks but on a clean WHITE background.
 * Navigate: ← → / Space / side-click. Full-screen: F (or the button). Zoom:
 * Ctrl/⌘ + wheel · pinch · + − 0 · the buttons. Content is authored inline below.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Loader2, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw, Check, PenLine, Globe, Instagram, Youtube,
  GraduationCap, Phone, Sparkles,
} from 'lucide-react'

const WHITE = '#ffffff'
const INK = '#2a1d12'          // brand dark-brown text
const GOLD = '#facc15'         // brand yellow accent
const AMBER = '#b45309'        // highlighted-token text (amber-700)

/* ── highlighted-sentence tokens ──────────────────────────────────────────────
 * A sentence is an array of tokens: a plain string, or { hi } for a word/mark we
 * want to spotlight (a comma, a conjunction, a clause) so the grammar POINT of
 * each example is impossible to miss. */
type Tok = string | { hi: string }
type Slide =
  | { kind: 'title'; kicker: string; kickerAr: string; en: string; ar: string; sub: string; subAr: string }
  | { kind: 'objectives'; secEn: string; secAr: string; en: string; ar: string; items: { en: string; ar: string }[]; foot?: string; footAr?: string }
  | { kind: 'concept'; secEn: string; secAr: string; en: string; ar: string; body: string; bodyAr: string; ex?: { en: Tok[]; ar: string }; img: Img }
  | { kind: 'tenses'; rows: { name: string; ar: string; use: string; useAr: string; ex: string }[]; img: Img }
  | { kind: 'cards'; secEn: string; secAr: string; en: string; ar: string; note?: string; noteAr?: string; items: { big: string; ar: string; ex: string; tint?: string }[]; img?: Img }
  | { kind: 'builder'; secEn: string; secAr: string; en: string; ar: string; a: string; b: string; result: Tok[]; resultAr: string; rule: string; ruleAr: string; img: Img }
  | { kind: 'compare'; en: string; ar: string; left: Col; right: Col }
  | { kind: 'commas'; en: string; ar: string; items: { use: string; ar: string; ex: Tok[] }[]; foot: string; footAr: string }
  | { kind: 'wrongright'; secEn: string; secAr: string; en: string; ar: string; wrong: string; right: Tok[]; why: string; whyAr: string; img: Img }
  | { kind: 'paragraph'; en: string; ar: string; lines: Tok[][]; legend: { label: string; ar: string }[]; img: Img }
  | { kind: 'end'; en: string; ar: string }

type Col = { title: string; ar: string; points: { en: string; ar: string }[]; ex: Tok[] }
type Img = { d: string; seed: string; emoji: string }

/* ── AI illustration for an example (keyless pollinations/flux, stable seed → same
 *    image every reload) with an emoji fallback if it stalls or fails. Keeps the
 *    deck self-contained (no DB, no /api). ────────────────────────────────────── */
function deckImgUrl(desc: string, seed: string): string {
  const prompt = `cute 3D pixar-style cartoon illustration, ${desc}, one clear friendly central subject filling the frame, plain solid white background, soft studio lighting, highly detailed, no text, no letters, no words`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=640&height=480&nologo=true&model=flux&seed=${encodeURIComponent(seed)}`
}
function DeckImg({ img, className = '', ratio = '4 / 3' }: { img: Img; className?: string; ratio?: string }) {
  const url = useMemo(() => deckImgUrl(img.d, img.seed), [img.d, img.seed])
  const [emoji, setEmoji] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setEmoji(false); setLoaded(false) }, [url])
  useEffect(() => {                                         // slow AI render → fall back
    if (emoji || loaded) return
    const t = setTimeout(() => setLoaded(l => { if (!l) setEmoji(true); return l }), 9000)
    return () => clearTimeout(t)
  }, [emoji, loaded])
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-white ring-1 ring-stone-200 flex items-center justify-center shadow-[0_26px_60px_-26px_rgba(42,29,18,0.4)] ${className}`} style={{ aspectRatio: ratio }}>
      {!emoji && !loaded && <Loader2 className="animate-spin text-stone-300" size={40} />}
      {emoji
        ? <span style={{ fontSize: '13vh' }}>{img.emoji}</span>
        : // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" onLoad={() => setLoaded(true)} onError={() => setEmoji(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </div>
  )
}

/* Render a token sentence, spotlighting { hi } marks. */
function Sentence({ toks, size, block }: { toks: Tok[]; size: string; block?: boolean }) {
  return (
    <span dir="ltr" className={block ? 'block leading-[1.35]' : ''} style={{ fontSize: size, color: INK }}>
      {toks.map((t, i) => typeof t === 'string'
        ? <span key={i} className="font-bold">{t}</span>
        : <span key={i} className="font-black rounded-md px-[0.35em] py-[0.05em]" style={{ color: AMBER, background: '#fef3c7' }}>{t.hi}</span>)}
    </span>
  )
}

/* Small heading block: big English + Arabic underneath. */
function Heading({ en, ar, align = 'center' }: { en: string; ar: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h1 className="font-black tracking-tight leading-[1.05]" style={{ color: INK, fontSize: '3vw' }}>{en}</h1>
      <div dir="rtl" className="font-bold text-stone-500 mt-[0.4vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.7vw' }}>{ar}</div>
    </div>
  )
}

/* Brand contact strip (matches the sibling recording decks). */
function Footer() {
  const sep = <span className="text-white/25">·</span>
  return (
    <div className="flex items-center justify-center gap-[1.6vw] px-[3vw] py-[1.4vh] text-[0.9vw] font-semibold text-white rounded-2xl" style={{ background: INK }}>
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-400" /> واتساب 0764189311</span>
      {sep}<span className="flex items-center gap-1.5"><Globe size={13} style={{ color: GOLD }} /> inglizi.com</span>
      {sep}<span className="flex items-center gap-1.5"><Instagram size={13} className="text-rose-400" /> @elqasraouihamza</span>
      {sep}<span className="flex items-center gap-1.5"><Youtube size={13} className="text-red-500" /> @hamzaelqasraoui</span>
      {sep}<span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={13} style={{ color: GOLD }} /> الأستاذ حمزة</span>
    </div>
  )
}

/* ═══ THE LESSON — authored slide by slide (extreme-beginner → confident writer) ═══ */
const SLIDES: Slide[] = [
  { kind: 'title', kicker: 'ACADEMIC WRITING', kickerAr: 'الكتابة الأكاديمية',
    en: 'From Grammar to Writing', ar: 'من القواعد إلى الكتابة',
    sub: 'Zero → Hero: build correct, clear, interesting sentences',
    subAr: 'من الصفر إلى الاحتراف: اِبنِ جُملًا صحيحة وواضحة وممتعة' },

  { kind: 'objectives', secEn: 'Roadmap', secAr: 'خريطة الدرس',
    en: 'What you will learn', ar: 'ماذا ستتعلّم في هذا الدرس',
    items: [
      { en: 'Review the English verb tenses', ar: 'مراجعة أزمنة الأفعال في الإنجليزية' },
      { en: 'Join your ideas with conjunctions', ar: 'ربط الأفكار بأدوات العطف' },
      { en: 'Build the 4 types of sentences', ar: 'بناء أنواع الجمل الأربعة' },
      { en: 'Use commas correctly', ar: 'استخدام الفاصلة بشكل صحيح' },
      { en: 'Add parallel structure & sentence variety', ar: 'التوازي والتنويع في الجمل' },
    ],
    foot: 'You can re-read and redo every part as many times as you need.',
    footAr: 'يمكنك إعادة كل جزء بقدر ما تحتاج — لا عجلة.' },

  { kind: 'concept', secEn: 'Why', secAr: 'لماذا',
    en: 'Good grammar = good writing', ar: 'قواعد سليمة = كتابة جيدة',
    body: 'Writing is just sentences put together. First we make each sentence correct, then we join sentences to make our writing clear and interesting.',
    bodyAr: 'الكتابة ما هي إلا جُمَل نضعها معًا. أولًا نجعل كل جملة صحيحة، ثم نربط الجمل لتصبح كتابتنا واضحة وممتعة.',
    ex: { en: ['A sentence needs a ', { hi: 'subject' }, ' + a ', { hi: 'verb' }, ' = one complete idea.'], ar: 'الجملة تحتاج فاعلًا + فعلًا = فكرة كاملة واحدة.' },
    img: { d: 'a happy young student writing in a notebook with a pencil, thinking of a bright idea lightbulb', seed: 'writing-idea', emoji: '✍️' } },

  { kind: 'tenses',
    rows: [
      { name: 'Present Simple', ar: 'المضارع البسيط', use: 'habits & facts', useAr: 'عادات وحقائق', ex: 'I write every day.' },
      { name: 'Present Continuous', ar: 'المضارع المستمر', use: 'happening now', useAr: 'يحدث الآن', ex: 'I am writing now.' },
      { name: 'Past Simple', ar: 'الماضي البسيط', use: 'finished past', useAr: 'ماضٍ منتهٍ', ex: 'I wrote a letter.' },
      { name: 'Present Perfect', ar: 'المضارع التام', use: 'past → now', useAr: 'من الماضي حتى الآن', ex: 'I have written three essays.' },
      { name: 'Past Continuous', ar: 'الماضي المستمر', use: 'was in progress', useAr: 'كان مستمرًّا', ex: 'I was writing when she called.' },
      { name: 'Future (will)', ar: 'المستقبل', use: 'later', useAr: 'لاحقًا', ex: 'I will write tomorrow.' },
    ],
    img: { d: 'a friendly cartoon clock and calendar together showing the passing of time, morning to night', seed: 'tenses-time', emoji: '🕒' } },

  { kind: 'cards', secEn: 'Conjunctions', secAr: 'أدوات العطف',
    en: 'Join two ideas: FANBOYS', ar: 'اِربط فكرتين: FANBOYS',
    note: 'Between two complete sentences, put a comma BEFORE the FANBOYS word.',
    noteAr: 'بين جملتين كاملتين، ضَعِ الفاصلة قبل أداة العطف.',
    items: [
      { big: 'For', ar: 'لأنّ', ex: 'I stayed, for it was late.', tint: '#fee2e2' },
      { big: 'And', ar: 'وَ', ex: 'I read and I write.', tint: '#fef9c3' },
      { big: 'Nor', ar: 'ولا', ex: 'Not this nor that.', tint: '#dcfce7' },
      { big: 'But', ar: 'لكن', ex: "It's sunny but cold.", tint: '#dbeafe' },
      { big: 'Or', ar: 'أو', ex: 'Tea or coffee?', tint: '#f3e8ff' },
      { big: 'Yet', ar: 'ومع ذلك', ex: 'Small yet strong.', tint: '#ffedd5' },
      { big: 'So', ar: 'لذلك', ex: 'I studied, so I passed.', tint: '#ccfbf1' },
    ],
    img: { d: 'two colorful puzzle pieces clicking together to become one, connection', seed: 'fanboys-join', emoji: '🧩' } },

  { kind: 'cards', secEn: 'Sentence types', secAr: 'أنواع الجمل',
    en: 'The 4 types of sentences', ar: 'أنواع الجمل الأربعة',
    note: 'Using different types makes your writing interesting to read.',
    noteAr: 'استخدام أنواع مختلفة يجعل كتابتك ممتعة للقارئ.',
    items: [
      { big: 'Simple', ar: 'بسيطة', ex: 'I study English.', tint: '#fef9c3' },
      { big: 'Compound', ar: 'مركّبة (عطفية)', ex: 'I study, and I practice.', tint: '#dbeafe' },
      { big: 'Complex', ar: 'معقّدة', ex: 'Because I study, I improve.', tint: '#dcfce7' },
      { big: 'Compound-Complex', ar: 'مركّبة معقّدة', ex: 'When I study, I learn, and I grow.', tint: '#f3e8ff' },
    ] },

  { kind: 'concept', secEn: 'Type 1', secAr: 'النوع الأول',
    en: '1) The simple sentence', ar: '١) الجملة البسيطة',
    body: 'One subject + one verb = one complete idea. This is your building block — everything starts here.',
    bodyAr: 'فاعل واحد + فعل واحد = فكرة كاملة واحدة. هذه هي لَبِنَة البناء — كل شيء يبدأ من هنا.',
    ex: { en: [{ hi: 'Sara' }, ' ', { hi: 'writes' }, ' stories.'], ar: 'سارة تكتب القصص.' },
    img: { d: 'a young girl happily writing a story at a desk, one clear character', seed: 'simple-sara', emoji: '📝' } },

  { kind: 'builder', secEn: 'Type 2', secAr: 'النوع الثاني',
    en: '2) The compound sentence', ar: '٢) الجملة المركّبة',
    a: 'I studied hard.', b: 'I passed the exam.',
    result: ['I studied hard', { hi: ',' }, ' ', { hi: 'so' }, ' I passed the exam.'],
    resultAr: 'ذاكرتُ بجدٍّ، لذلك نجحتُ في الامتحان.',
    rule: 'Two complete sentences → comma + FANBOYS in the middle.',
    ruleAr: 'جملتان كاملتان ← فاصلة + أداة عطف في المنتصف.',
    img: { d: 'a happy student celebrating a passed exam with an A+ paper, cheering', seed: 'compound-pass', emoji: '🎉' } },

  { kind: 'builder', secEn: 'Type 3', secAr: 'النوع الثالث',
    en: '3) The complex sentence', ar: '٣) الجملة المعقّدة',
    a: 'It rains.', b: 'I stay home.',
    result: [{ hi: 'When' }, ' it rains', { hi: ',' }, ' I stay home.'],
    resultAr: 'عندما تُمطر، أبقى في المنزل.',
    rule: 'An adverb clause (when, because, if, although…) that comes FIRST takes a comma after it.',
    ruleAr: 'الجملة الظرفية (when, because, if, although…) إذا جاءت أولًا تأخذ فاصلة بعدها.',
    img: { d: 'a cozy child looking out a window at the rain, warm and safe indoors', seed: 'complex-rain', emoji: '🌧️' } },

  { kind: 'compare',
    en: 'Compound vs Complex', ar: 'المركّبة مقابل المعقّدة',
    left: { title: 'Compound', ar: 'مركّبة',
      points: [
        { en: 'Two EQUAL complete ideas', ar: 'فكرتان كاملتان متساويتان' },
        { en: 'Joined by FANBOYS', ar: 'مرتبطتان بأداة عطف' },
        { en: 'Comma BEFORE the conjunction', ar: 'فاصلة قبل أداة العطف' },
      ],
      ex: ['I was tired', { hi: ',' }, ' ', { hi: 'but' }, ' I finished.'] },
    right: { title: 'Complex', ar: 'معقّدة',
      points: [
        { en: 'One MAIN + one DEPENDENT idea', ar: 'فكرة رئيسية + فكرة تابعة' },
        { en: 'Dependent starts with when/because/if…', ar: 'التابعة تبدأ بـ when/because/if' },
        { en: 'Comma only if it comes first', ar: 'فاصلة فقط إذا جاءت التابعة أولًا' },
      ],
      ex: [{ hi: 'Although' }, ' I was tired', { hi: ',' }, ' I finished.'] } },

  { kind: 'commas',
    en: 'Commas — the 5 main uses', ar: 'الفاصلة — الاستعمالات الخمسة الأساسية',
    items: [
      { use: 'In a series (3+)', ar: 'في سلسلة (٣ أو أكثر)', ex: ['I bought apples', { hi: ',' }, ' bread', { hi: ',' }, ' and milk.'] },
      { use: 'In a compound sentence', ar: 'في الجملة المركّبة', ex: ['It was late', { hi: ',' }, ' so we left.'] },
      { use: 'After a front adverb clause', ar: 'بعد جملة ظرفية في البداية', ex: [{ hi: 'When we arrived' }, { hi: ',' }, ' dinner was ready.'] },
      { use: 'Around extra information', ar: 'حول معلومة إضافية', ex: ['My teacher', { hi: ',' }, ' Mr. Ali', { hi: ',' }, ' is kind.'] },
      { use: 'After an intro word', ar: 'بعد كلمة افتتاحية', ex: [{ hi: 'First' }, { hi: ',' }, ' open your book.'] },
    ],
    foot: 'Master these and you know ~95% of how commas work.',
    footAr: 'أتقِن هذه وستعرف نحو ٩٥٪ من استعمالات الفاصلة.' },

  { kind: 'wrongright', secEn: 'Polish', secAr: 'تحسين',
    en: 'Parallel structure', ar: 'التوازي في الجملة',
    wrong: 'I like reading, to write, and I swim.',
    right: ['I like ', { hi: 'reading' }, ', ', { hi: 'writing' }, ', and ', { hi: 'swimming' }, '.'],
    why: 'Items in a list must have the SAME form (all -ing here).',
    whyAr: 'يجب أن تكون عناصر القائمة بنفس الصيغة (كلها -ing هنا).',
    img: { d: 'three friends doing activities together: reading, writing, and swimming, balanced and matching', seed: 'parallel-3', emoji: '🏊' } },

  { kind: 'wrongright', secEn: 'Polish', secAr: 'تحسين',
    en: 'Sentence variety', ar: 'التنويع في الجمل',
    wrong: 'I woke up. I ate. I left. I worked.',
    right: [{ hi: 'After I woke up' }, ', I ate breakfast', { hi: ',' }, ' and then I left for work.'],
    why: 'Mix short and long, simple and complex — variety keeps the reader interested.',
    whyAr: 'اِمزُج بين القصير والطويل، البسيط والمعقّد — التنويع يبقي القارئ مهتمًّا.',
    img: { d: 'a colorful mixed bag of different shapes and sizes, variety and balance', seed: 'variety-mix', emoji: '🎨' } },

  { kind: 'paragraph',
    en: 'Put it all together', ar: 'اجمع كل شيء معًا',
    lines: [
      ['My name is Omar', { hi: ',' }, ' ', { hi: 'and' }, ' I love English.'],
      [{ hi: 'Every morning' }, { hi: ',' }, ' I ', { hi: 'read' }, ', ', { hi: 'write' }, ', and ', { hi: 'speak' }, ' a little.'],
      [{ hi: 'When I make a mistake' }, { hi: ',' }, ' I fix it and try again.'],
      ['Learning takes time', { hi: ',' }, ' ', { hi: 'but' }, ' I improve every day.'],
    ],
    legend: [
      { label: 'comma + FANBOYS (compound)', ar: 'فاصلة + أداة عطف' },
      { label: 'front adverb clause (complex)', ar: 'جملة ظرفية في البداية' },
      { label: 'parallel list (same form)', ar: 'قائمة متوازية' },
    ],
    img: { d: 'a proud confident student holding a finished essay with a gold star, graduation cap', seed: 'hero-essay', emoji: '🏆' } },

  { kind: 'objectives', secEn: 'Recap', secAr: 'المراجعة',
    en: 'Zero → Hero: you did it!', ar: 'من الصفر إلى الاحتراف: لقد فعلتها!',
    items: [
      { en: 'You reviewed the verb tenses', ar: 'راجعتَ أزمنة الأفعال' },
      { en: 'You joined ideas with FANBOYS', ar: 'ربطتَ الأفكار بأدوات العطف' },
      { en: 'You built simple, compound & complex sentences', ar: 'بنيتَ الجمل البسيطة والمركّبة والمعقّدة' },
      { en: 'You punctuated with commas', ar: 'استخدمتَ الفاصلة بشكل صحيح' },
      { en: 'You added parallel structure & variety', ar: 'أضفتَ التوازي والتنويع' },
    ],
    foot: 'Now you can write correct, clear, interesting sentences.',
    footAr: 'الآن تستطيع كتابة جُمَل صحيحة وواضحة وممتعة.' },

  { kind: 'end', en: 'Now go write!', ar: 'الآن ابدأ الكتابة!' },
]

/* Which slides reveal their items one-by-one on Space (a teaching board effect). */
const stepsOf = (s?: Slide) => !s ? 0 : s.kind === 'objectives' ? s.items.length : s.kind === 'commas' ? s.items.length : 0

export default function WritingDeck() {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)               // reveal progress inside a list slide
  const slides = SLIDES
  const last = slides.length - 1
  const s = slides[idx]

  const idxRef = useRef(idx); idxRef.current = idx
  const stepRef = useRef(step); stepRef.current = step
  useEffect(() => { setStep(0) }, [idx])            // each new slide starts un-revealed

  // Space / → reveals the next hidden item, then advances the slide.
  const go = useCallback((d: number) => {
    const max = stepsOf(slides[idxRef.current])
    if (d > 0) { if (stepRef.current < max) setStep(v => v + 1); else setIdx(i => Math.min(last, i + 1)) }
    else { if (stepRef.current > 0) setStep(v => v - 1); else setIdx(i => Math.max(0, i - 1)) }
  }, [slides, last])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // ── true full-screen (hides browser chrome) — F key or the button ──
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key.toLowerCase() === 'f') toggleFs()
    }
    document.addEventListener('fullscreenchange', onFs)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('keydown', onKey) }
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.() }

  // ── zoom: pinch · Ctrl/⌘+wheel · buttons · + − 0 · drag-to-pan when zoomed ──
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

  const secEn = s && 'secEn' in s ? s.secEn : null
  const secAr = s && 'secAr' in s ? (s as { secAr: string }).secAr : ''

  return (
    <div ref={rootRef} style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: WHITE, color: INK }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      {/* barely-there brand warmth on the white */}
      <div className="pointer-events-none absolute -top-[22vw] -right-[16vw] w-[46vw] h-[46vw] rounded-full bg-yellow-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[22vw] -left-[16vw] w-[42vw] h-[42vw] rounded-full bg-amber-50/60 blur-3xl" />

      {/* header — one row */}
      <div className="relative z-30 flex items-center justify-center gap-2 px-[3vw] pt-[2.6vh] flex-nowrap">
        <div dir="ltr" className="absolute left-[3vw] top-[2.6vh] flex items-center gap-1.5">
          <Link href="/admin/present" title="كل الديكات" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition text-[0.9vw] font-bold"><ArrowLeft size={15} /> الديكات</Link>
          <button onClick={() => { setIdx(0); setStep(0) }} title="من البداية" className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition shrink-0" aria-label="Restart"><RotateCcw size={15} /></button>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl text-white font-black whitespace-nowrap flex items-center gap-2" style={{ background: INK }}>
          <PenLine size={15} style={{ color: GOLD }} /> From Grammar to Writing · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الكتابة</span>
        </span>
        {secEn && <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap text-[#2a1d12]" style={{ background: GOLD }}>{secEn} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{secAr}</span></span>}
        <div className="absolute right-[3vw] top-[2.6vh] flex items-center gap-2">
          <span className="text-stone-400 font-bold whitespace-nowrap">{String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <div className="flex items-center rounded-lg border border-stone-300 bg-white shrink-0">
            <button onClick={() => zoomBy(-0.1)} disabled={zoom <= ZMIN} className="p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-l-lg transition" title="تصغير (−)" aria-label="Zoom out"><ZoomOut size={16} /></button>
            <div className="flex items-center border-x border-stone-200 px-1">
              <input value={zin} onChange={e => setZin(e.target.value.replace(/[^\d]/g, ''))} onBlur={applyZin}
                onKeyDown={e => { if (e.key === 'Enter') { applyZin(); (e.target as HTMLInputElement).blur() } }}
                inputMode="numeric" aria-label="Zoom percent" title="اكتب نسبة التكبير ثم Enter"
                className="w-9 py-1 text-[11px] font-mono font-bold text-center bg-transparent outline-none focus:bg-amber-50 rounded" />
              <span className="text-[11px] font-mono font-bold text-stone-400">%</span>
            </div>
            <button onClick={() => zoomBy(0.1)} disabled={zoom >= ZMAX} className="p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-r-lg transition" title="تكبير (+)" aria-label="Zoom in"><ZoomIn size={16} /></button>
          </div>
          <button onClick={toggleFs} className="shrink-0 p-2 rounded-lg text-stone-500 hover:text-[#2a1d12] hover:bg-white/70 transition" title="ملء الشاشة (F)">
            {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* side-click nav */}
      <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[10%] z-20 cursor-w-resize" aria-label="Previous" />
      <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[10%] z-20 cursor-e-resize" aria-label="Next" />

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-[5vw] py-[2vh] relative z-10 min-h-0 overflow-hidden">
        <div className="w-full flex items-center justify-center"
          onPointerDown={onPanDown} onPointerMove={onPanMove} onPointerUp={onPanUp} onPointerCancel={onPanUp}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 150ms', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}
              className="w-full flex items-center justify-center">
              <SlideView s={s} step={step} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* footer progress */}
      <div className="flex items-center justify-between px-[4vw] pb-[2.5vh] relative z-10">
        <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronLeft size={26} /></button>
        <div className="flex gap-1.5 items-center">
          {slides.map((_, i) => (<span key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === idx ? 30 : 6, background: i === idx ? GOLD : '#e7e5e4' }} />))}
        </div>
        <button onClick={() => go(1)} disabled={idx === last} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronRight size={26} /></button>
      </div>
    </div>
  )
}

/* ═══ per-slide renderers ══════════════════════════════════════════════════════ */
function SlideView({ s, step }: { s: Slide; step: number }) {
  if (s.kind === 'title') return (
    <div className="text-center max-w-[86vw]">
      <div className="inline-block mb-[3vh] px-6 py-2.5 rounded-full font-bold tracking-[0.2em] text-[1vw]" style={{ background: INK, color: GOLD }}>
        {s.kicker} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.kickerAr}</span>
      </div>
      <h1 className="font-black leading-[1.03] tracking-tight" style={{ color: INK, fontSize: '5.4vw' }}>{s.en}</h1>
      <div dir="rtl" className="mt-[1.5vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '3vw' }}>{s.ar}</div>
      <div className="mt-[3vh] flex flex-col items-center gap-[1vh]">
        <span className="inline-block px-5 py-2 rounded-full text-[#2a1d12] font-bold text-[1.2vw]" style={{ background: GOLD }}>{s.sub}</span>
        <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.2vw' }}>{s.subAr}</span>
      </div>
    </div>
  )

  if (s.kind === 'objectives') return (
    <div className="w-full max-w-[70vw] flex flex-col items-center gap-[3.2vh]">
      <Heading en={s.en} ar={s.ar} />
      <div className="w-full flex flex-col gap-[1.5vh]">
        {s.items.map((it, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl border-2 border-dashed border-stone-200 h-[7vh]" />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
            className="w-full flex items-center gap-[1.5vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-22px_rgba(42,29,18,0.5)] px-[2vw] py-[1.6vh]">
            <span className="grid place-items-center rounded-full shrink-0" style={{ width: '3vw', height: '3vw', background: GOLD }}><Check size={18} className="text-[#2a1d12]" strokeWidth={3} /></span>
            <span className="font-black" style={{ color: INK, fontSize: '1.5vw' }}>{it.en}</span>
            <span dir="rtl" className="ml-auto font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.4vw' }}>{it.ar}</span>
          </motion.div>
        ))}
      </div>
      {s.foot && step >= s.items.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="font-bold" style={{ color: AMBER, fontSize: '1.2vw' }}>{s.foot}</div>
          <div dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>{s.footAr}</div>
        </motion.div>
      )}
    </div>
  )

  if (s.kind === 'concept') return (
    <div className="grid grid-cols-[1.1fr_0.9fr] gap-[3.5vw] items-center w-full max-w-[88vw]">
      <div className="flex flex-col gap-[2.4vh]">
        <Heading en={s.en} ar={s.ar} align="left" />
        <p className="font-semibold text-stone-600" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>{s.body}</p>
        <p dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.35vw', lineHeight: 1.7 }}>{s.bodyAr}</p>
        {s.ex && (
          <div className="rounded-3xl bg-amber-50 ring-1 ring-amber-200 px-[2vw] py-[2vh]">
            <Sentence toks={s.ex.en} size="1.7vw" block />
            <div dir="rtl" className="mt-[1vh] font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.3vw' }}>{s.ex.ar}</div>
          </div>
        )}
      </div>
      <DeckImg img={s.img} className="w-full" />
    </div>
  )

  if (s.kind === 'tenses') return (
    <div className="grid grid-cols-[1.55fr_1fr] gap-[3vw] items-center w-full max-w-[90vw]">
      <div className="flex flex-col gap-[2.4vh]">
        <Heading en="The verb tenses" ar="أزمنة الأفعال" align="left" />
        <div className="flex flex-col gap-[1.1vh]">
          {s.rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr] items-center gap-[1.2vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_10px_26px_-22px_rgba(42,29,18,0.5)] px-[1.6vw] py-[1.2vh]">
              <div>
                <div className="font-black leading-tight" style={{ color: INK, fontSize: '1.25vw' }}>{r.name}</div>
                <div className="flex items-center gap-[0.6vw]">
                  <span className="font-semibold" style={{ color: AMBER, fontSize: '0.95vw' }}>{r.use}</span>
                  <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.95vw' }}>· {r.useAr}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-[0.6vw]">
                <span className="font-bold text-stone-700" style={{ fontSize: '1.15vw' }}>{r.ex}</span>
                <span dir="rtl" className="font-bold text-stone-400 whitespace-nowrap" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{r.ar}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DeckImg img={s.img} className="w-full" />
    </div>
  )

  if (s.kind === 'cards') {
    const n = s.items.length
    const cols = n <= 4 ? (n === 4 ? 2 : n) : n <= 6 ? 3 : 4
    return (
      <div className="w-full max-w-[88vw] flex flex-col items-center gap-[3vh]">
        <Heading en={s.en} ar={s.ar} />
        <div dir="ltr" className="grid w-full gap-[1.4vw]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {s.items.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-3xl ring-1 ring-stone-200 shadow-[0_16px_36px_-26px_rgba(42,29,18,0.55)] px-[1.4vw] py-[1.8vh] flex flex-col items-center text-center"
              style={{ background: c.tint ?? '#ffffff' }}>
              <div className="font-black leading-none" style={{ color: INK, fontSize: n > 6 ? '1.8vw' : '2.2vw' }}>{c.big}</div>
              <div dir="rtl" className="font-bold text-stone-500 mt-[0.5vh]" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.15vw' }}>{c.ar}</div>
              <div className="mt-[1.2vh] rounded-xl bg-white/80 ring-1 ring-black/5 px-[0.9vw] py-[0.7vh] font-bold text-stone-700" style={{ fontSize: '0.95vw' }}>{c.ex}</div>
            </motion.div>
          ))}
        </div>
        {s.note && (
          <div className="flex items-center gap-[1vw] rounded-2xl bg-[#2a1d12] px-[2vw] py-[1.4vh]">
            <Sparkles size={18} style={{ color: GOLD }} className="shrink-0" />
            <span className="font-bold text-white" style={{ fontSize: '1.1vw' }}>{s.note}</span>
            <span dir="rtl" className="font-bold text-white/70" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>· {s.noteAr}</span>
          </div>
        )}
      </div>
    )
  }

  if (s.kind === 'builder') return (
    <div className="grid grid-cols-[1.15fr_0.85fr] gap-[3.5vw] items-center w-full max-w-[90vw]">
      <div className="flex flex-col gap-[2.4vh]">
        <Heading en={s.en} ar={s.ar} align="left" />
        {/* before: two simple sentences */}
        <div className="flex items-center gap-[1vw] flex-wrap">
          <span className="rounded-2xl bg-white ring-1 ring-stone-200 px-[1.4vw] py-[1.1vh] font-bold text-stone-700" style={{ fontSize: '1.3vw' }}>{s.a}</span>
          <span className="font-black text-stone-300" style={{ fontSize: '1.6vw' }}>+</span>
          <span className="rounded-2xl bg-white ring-1 ring-stone-200 px-[1.4vw] py-[1.1vh] font-bold text-stone-700" style={{ fontSize: '1.3vw' }}>{s.b}</span>
        </div>
        <div className="text-stone-300 font-black text-center" style={{ fontSize: '1.6vw' }}>↓</div>
        {/* after: the combined sentence, spotlighted */}
        <div className="rounded-3xl bg-amber-50 ring-2 ring-amber-200 px-[2vw] py-[2vh]">
          <Sentence toks={s.result} size="1.9vw" block />
          <div dir="rtl" className="mt-[1vh] font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.35vw' }}>{s.resultAr}</div>
        </div>
        {/* the rule */}
        <div className="flex items-start gap-[1vw] rounded-2xl bg-[#2a1d12] px-[1.8vw] py-[1.4vh]">
          <span className="mt-[0.3vh] grid place-items-center rounded-lg shrink-0" style={{ width: '2vw', height: '2vw', background: GOLD }}><Check size={16} className="text-[#2a1d12]" strokeWidth={3} /></span>
          <div>
            <div className="font-bold text-white" style={{ fontSize: '1.05vw' }}>{s.rule}</div>
            <div dir="rtl" className="font-bold text-white/70" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{s.ruleAr}</div>
          </div>
        </div>
      </div>
      <DeckImg img={s.img} className="w-full" />
    </div>
  )

  if (s.kind === 'compare') {
    const ColView = ({ c, accent }: { c: Col; accent: string }) => (
      <div className="flex-1 rounded-3xl bg-white ring-1 ring-stone-200 shadow-[0_18px_40px_-28px_rgba(42,29,18,0.5)] p-[2vw] flex flex-col gap-[1.6vh]">
        <div className="flex items-baseline gap-[0.8vw]">
          <h2 className="font-black" style={{ color: accent, fontSize: '2.1vw' }}>{c.title}</h2>
          <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.4vw' }}>{c.ar}</span>
        </div>
        <div className="flex flex-col gap-[1vh]">
          {c.points.map((p, i) => (
            <div key={i} className="flex items-center gap-[0.8vw]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              <span className="font-bold text-stone-700" style={{ fontSize: '1.05vw' }}>{p.en}</span>
              <span dir="rtl" className="ml-auto font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{p.ar}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-[1.4vw] py-[1.3vh]">
          <Sentence toks={c.ex} size="1.3vw" block />
        </div>
      </div>
    )
    return (
      <div className="w-full max-w-[86vw] flex flex-col items-center gap-[3vh]">
        <Heading en={s.en} ar={s.ar} />
        <div className="w-full flex items-stretch gap-[2vw]">
          <ColView c={s.left} accent="#2563eb" />
          <div className="grid place-items-center"><span className="font-black text-stone-300" style={{ fontSize: '1.8vw' }}>vs</span></div>
          <ColView c={s.right} accent="#059669" />
        </div>
      </div>
    )
  }

  if (s.kind === 'commas') return (
    <div className="w-full max-w-[80vw] flex flex-col items-center gap-[3vh]">
      <Heading en={s.en} ar={s.ar} />
      <div className="w-full flex flex-col gap-[1.4vh]">
        {s.items.map((it, i) => i >= step ? (
          <div key={i} className="w-full rounded-2xl border-2 border-dashed border-stone-200 h-[8vh]" />
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
            className="w-full grid grid-cols-[auto_1fr] items-center gap-[1.5vw] rounded-2xl bg-white ring-1 ring-stone-200 shadow-[0_12px_30px_-24px_rgba(42,29,18,0.5)] px-[1.8vw] py-[1.5vh]">
            <span className="grid place-items-center rounded-full font-black text-[#2a1d12] shrink-0" style={{ width: '2.6vw', height: '2.6vw', background: GOLD, fontSize: '1.2vw' }}>{i + 1}</span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-[0.8vw]">
                <span className="font-black" style={{ color: INK, fontSize: '1.2vw' }}>{it.use}</span>
                <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>{it.ar}</span>
              </div>
              <div className="mt-[0.5vh]"><Sentence toks={it.ex} size="1.35vw" /></div>
            </div>
          </motion.div>
        ))}
      </div>
      {step >= s.items.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-[1vw] rounded-2xl bg-[#2a1d12] px-[2vw] py-[1.3vh]">
          <Sparkles size={18} style={{ color: GOLD }} className="shrink-0" />
          <span className="font-bold text-white" style={{ fontSize: '1.1vw' }}>{s.foot}</span>
          <span dir="rtl" className="font-bold text-white/70" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.05vw' }}>· {s.footAr}</span>
        </motion.div>
      )}
    </div>
  )

  if (s.kind === 'wrongright') return (
    <div className="grid grid-cols-[1.15fr_0.85fr] gap-[3.5vw] items-center w-full max-w-[90vw]">
      <div className="flex flex-col gap-[2.4vh]">
        <Heading en={s.en} ar={s.ar} align="left" />
        <div className="rounded-3xl bg-rose-50 ring-1 ring-rose-200 px-[2vw] py-[1.8vh] flex items-center gap-[1vw]">
          <span className="text-[2vw]">❌</span>
          <span className="font-bold text-rose-900/80 line-through decoration-rose-300" style={{ fontSize: '1.5vw' }}>{s.wrong}</span>
        </div>
        <div className="rounded-3xl bg-emerald-50 ring-2 ring-emerald-200 px-[2vw] py-[1.8vh] flex items-center gap-[1vw]">
          <span className="text-[2vw]">✅</span>
          <Sentence toks={s.right} size="1.6vw" />
        </div>
        <div className="flex items-start gap-[1vw]">
          <Sparkles size={18} style={{ color: AMBER }} className="mt-[0.4vh] shrink-0" />
          <div>
            <div className="font-bold" style={{ color: AMBER, fontSize: '1.15vw' }}>{s.why}</div>
            <div dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>{s.whyAr}</div>
          </div>
        </div>
      </div>
      <DeckImg img={s.img} className="w-full" />
    </div>
  )

  if (s.kind === 'paragraph') return (
    <div className="grid grid-cols-[1.25fr_0.75fr] gap-[3.5vw] items-center w-full max-w-[92vw]">
      <div className="flex flex-col gap-[2.4vh]">
        <Heading en={s.en} ar={s.ar} align="left" />
        <div className="rounded-[28px] bg-white ring-1 ring-stone-200 shadow-[0_22px_50px_-30px_rgba(42,29,18,0.5)] px-[2.4vw] py-[2.4vh] flex flex-col gap-[1.2vh]">
          {s.lines.map((ln, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.15 }}>
              <Sentence toks={ln} size="1.6vw" block />
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-[1.6vw] gap-y-[0.8vh]">
          {s.legend.map((l, i) => (
            <div key={i} className="flex items-center gap-[0.5vw]">
              <span className="w-3 h-3 rounded-md" style={{ background: '#fef3c7', border: `1px solid ${AMBER}` }} />
              <span className="font-bold text-stone-600" style={{ fontSize: '0.9vw' }}>{l.label}</span>
              <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.9vw' }}>· {l.ar}</span>
            </div>
          ))}
        </div>
      </div>
      <DeckImg img={s.img} className="w-full" />
    </div>
  )

  // end
  return (
    <div className="text-center max-w-[80vw] flex flex-col items-center gap-[3.5vh]">
      <div>
        <div className="text-[5vw] mb-[1vh]">🚀</div>
        <h1 className="font-black leading-[1.03] tracking-tight" style={{ color: INK, fontSize: '5vw' }}>{s.en}</h1>
        <div dir="rtl" className="mt-[1.5vh] font-black text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '3vw' }}>{s.ar}</div>
      </div>
      <Footer />
    </div>
  )
}
