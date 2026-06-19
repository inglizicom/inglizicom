'use client'

/**
 * /admin/present/[moduleId] — premium full-screen teaching deck for recording.
 * Brand colors match the dashboards (#2a1d12 / yellow-400 / #faf6ef). Header
 * rectangles fit one row · big action-photo · English + Arabic + interchangeable
 * "change the word" slot (shown only when it makes sense). Built live from the
 * unit's DB content. Navigate ← → / Space / side-click.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, Loader2, Globe, Instagram, Youtube, GraduationCap, Phone, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchLessons, fetchModules, type LmsLesson } from '@/lib/lms'
import { variationsFor, type Variation } from '@/lib/deck-vary'

const DARK = '#2a1d12'
const CREAM = '#faf6ef'
const BROWN = '#5b3a16'              // expression label text / border — strong brown
const EXPR_PER_PAGE = 6             // Expressions: up to 6 illustrated cards per page (3×2)

type VocabPair = { en: string; ar: string }
type Slide =
  | { kind: 'title'; title: string }
  | { kind: 'word'; en: string; ar: string; vary: Variation | null; slot: number }
  | { kind: 'category'; name: string; ar: string; items: VocabPair[] }
  | { kind: 'convo'; lines: { who: string; text: string }[]; speakers: string[]; part?: number; parts?: number }
  | { kind: 'expr'; pattern: string; example: string; vary: Variation | null; slot: number; actions: VocabPair[] }
  | { kind: 'static'; items: VocabPair[]; page: number; pages: number }
  | { kind: 'scramble'; sentences: string[] }
  | { kind: 'translate'; items: { ar: string; en: string }[] }
  | { kind: 'end' }

const SECTION: Record<Slide['kind'], { en: string; ar: string } | null> = {
  title: null, end: null,
  word: { en: 'Vocabulary', ar: 'المفردات' },
  category: { en: 'Vocabulary', ar: 'المفردات' },
  convo: { en: 'Conversation', ar: 'المحادثة' },
  expr: { en: 'Static Sentences', ar: 'جمل ثابتة' },     // a frame where only a few words change
  static: { en: 'Expressions', ar: 'التعابير' },          // full sentences that use the vocabulary
  scramble: { en: 'Word Scramble', ar: 'رتّب الكلمات' },
  translate: { en: 'Translate', ar: 'ترجم الجملة' },
}

/* ── parsers ───────────────────────────────────────────────── */
function parseVocab(content?: string | null): VocabPair[] {
  if (!content) return []
  return content.split('\n').filter(l => l.trim().startsWith('|'))
    .map(l => l.split('|').map(s => s.trim()))
    .filter(p => p.length >= 4 && p[1] && p[1] !== 'English' && !/^-+$/.test(p[1]) && p[2])
    .map(p => ({ en: p[1], ar: p[2] }))
}
const AR = /[؀-ۿ]/
/** Looser extractor: pulls EN→AR pairs out of any lesson text — both markdown
 *  table rows AND inline forms ("English — العربية", "English: العربية",
 *  "- **English** = العربية"). Used as a fallback so units whose vocabulary
 *  isn't a clean table still get a Vocabulary box. */
function vocabPair(chunk: string): VocabPair | null {
  const c = chunk.replace(/\*\*/g, '').replace(/^[-*•\d.)\s]+/, '').trim()
  if (!c || !AR.test(c) || !/[a-zA-Z]/.test(c)) return null
  // explicit separator: — – : =  (any spacing) OR a space-padded hyphen
  // (so "wake-up" stays intact but "wake up - الاستيقاظ" still splits)
  let m = c.match(/^([^؀-ۿ]+?)(?:\s*[—–:=]\s*|\s+-\s+)(.*[؀-ۿ].*)$/)
  // else a tight pair: latin words directly followed by arabic ("Apples تفاح")
  if (!m) m = c.match(/^([A-Za-z][A-Za-z'’\/\- ]*?)\s+([؀-ۿ][؀-ۿ\s\/،]*)$/)
  if (!m) return null
  const en = m[1].replace(/[|*_`"]/g, '').trim()
  const ar = m[2].trim()
  if (!en || !ar || AR.test(en) || en.split(/\s+/).length > 6 || en.length > 60) return null
  return { en, ar }
}
function parseVocabAny(content?: string | null): VocabPair[] {
  if (!content) return []
  const out: VocabPair[] = []
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue               // skip blanks + markdown headings
    if (line.startsWith('|')) {                               // markdown table row
      const c = line.split('|').map(s => s.trim())
      if (c.length >= 4 && c[1] && c[2] && c[1] !== 'English' && !/^-+$/.test(c[1]) && AR.test(c[2]) && !AR.test(c[1]))
        out.push({ en: c[1], ar: c[2] })
      continue
    }
    // a line may pack several pairs separated by · or • ("Apples تفاح · Oranges برتقال")
    for (const chunk of line.split(/[·•]/)) {
      const p = vocabPair(chunk)
      if (p) out.push(p)
    }
  }
  return out
}
/** The Vocabulary box content: the dedicated vocab lesson if it's a clean table,
 *  else everything we can salvage from the unit's other lessons (deduped). */
function buildVocab(lessons: LmsLesson[]): VocabPair[] {
  const primary = parseVocab(lessons.find(l => l.lesson_order === 1)?.content)
  if (primary.length) return primary
  const seen = new Set<string>(); const out: VocabPair[] = []
  for (const l of [...lessons].sort((a, b) => a.lesson_order - b.lesson_order))
    for (const p of parseVocabAny(l.content)) {
      const k = p.en.toLowerCase()
      if (!seen.has(k)) { seen.add(k); out.push(p) }
    }
  return out
}
/** Category units (e.g. groceries) list "**Fruits — فواكه**" headers followed by
 *  "Apples تفاح · Oranges برتقال …" lines. Parse them into groups so the deck can
 *  show each category EXPANDED with all its items, instead of flat word slides. */
function parseCategories(content?: string | null): { name: string; ar: string; items: VocabPair[] }[] {
  if (!content) return []
  const cats: { name: string; ar: string; items: VocabPair[] }[] = []
  let cur: { name: string; ar: string; items: VocabPair[] } | null = null
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const h = line.match(/^\*\*\s*(.+?)\s*[—–-]\s*(.+?)\s*\*\*$/)
    if (h && AR.test(h[2]) && !AR.test(h[1])) { cur = { name: h[1].trim(), ar: h[2].trim(), items: [] }; cats.push(cur); continue }
    if (line.startsWith('#') || line.startsWith('|')) continue
    if (cur) for (const chunk of line.split(/[·•]/)) { const p = vocabPair(chunk); if (p) cur.items.push(p) }
  }
  return cats.filter(c => c.items.length > 0)
}
function parseConvo(reading?: string | null): { who: string; text: string }[] {
  if (!reading) return []
  return reading.split('\n').map(l => l.trim()).filter(l => l.startsWith('**'))
    .map(l => { const m = l.match(/^\*\*(.+?):\*\*\s*(.*)$/); return m ? { who: m[1], text: m[2].replace(/\*/g, '') } : null })
    .filter((x): x is { who: string; text: string } => !!x)
}
function parseExpr(content?: string | null): { pattern: string; example: string }[] {
  if (!content) return []
  return content.split('\n').map(l => l.trim()).filter(l => l.startsWith('- '))
    .map(l => { const [pat, ex] = l.replace(/^-\s*/, '').split(' — '); return { pattern: (pat || '').replace(/\*\*/g, ''), example: (ex || '').replace(/\*/g, '') } })
}
function renderPattern(p: string) {
  return p.split(/(\[[^\]]+\])/).map((part, i) =>
    part.startsWith('[')
      ? <span key={i} className="inline-block mx-1.5 px-3 py-0.5 rounded-lg bg-yellow-400 text-[#2a1d12] align-middle">{part}</span>
      : <span key={i}>{part}</span>)
}

/** Color an example so the swappable words (the part that fills the pattern's
 *  [blanks]) show in white and the fixed frame stays yellow — so students see
 *  exactly which words change. */
function renderExample(example: string, pattern: string) {
  const frame = new Set(
    pattern.toLowerCase().replace(/\[[^\]]*\]/g, ' ').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean),
  )
  return example.split(/(\s+)/).map((tok, i) => {
    const w = tok.toLowerCase().replace(/[^a-z]/g, '')
    if (!w) return <span key={i}>{tok}</span>
    const fixed = frame.has(w)
    return <span key={i} style={{ color: fixed ? '#facc15' : '#ffffff', fontWeight: fixed ? 600 : 800 }}>{tok}</span>
  })
}

/* ── interactive Static Sentence helpers ──────────────────────────────────────
 * The pattern is a frame with a blank. Valid fills are ACTIONS the unit already
 * taught (verb phrases + their teacher-authored Arabic). The "wrong" options are a
 * tiny shared pool of TIME/manner words (with correct Arabic) — placing one bounces
 * back with an explanation, so the slide teaches what belongs in the blank. */
const TIME_DISTRACTORS: VocabPair[] = [
  { en: 'in the morning', ar: 'في الصباح' },
  { en: 'every day', ar: 'كل يوم' },
  { en: 'at night', ar: 'في الليل' },
  { en: 'quickly', ar: 'بسرعة' },
  { en: 'twice a day', ar: 'مرتين في اليوم' },
]
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5)
/** Strip a leading subject ("I ") and any "/ alternative" so a full sentence
 *  becomes a short verb phrase that drops cleanly into a pattern's blank. */
const verbPhrase = (s: string) => s.replace(/^\s*I\s+/i, '').replace(/\s*\/\s*.*$/, '').trim()

/** 1-based position of the vocabulary phrase an expression refers to, so the
 *  Expressions slide reuses that phrase's uploaded picture instead of a fresh
 *  Unsplash one. Returns 0 when nothing matches (falls back to the auto photo). */
function matchVocabSlot(text: string, vocab: VocabPair[]): number {
  const words = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w))
  const t = new Set(words(text))
  let best = 0, bestScore = 0
  vocab.forEach((v, i) => {
    const score = words(v.en).filter(w => t.has(w)).length
    if (score > bestScore) { bestScore = score; best = i + 1 }
  })
  return bestScore > 0 ? best : 0
}

/* ── photo: show the ACTION (a person doing it) or a clear object ─────────── */
const STOP = new Set(['i','you','we','they','he','she','it','a','an','the','to','do','does','is','are','am','my','your','his','her','our','their','some','please','can','could','would','want','need','have','has','this','that','these','those','of','for','in','on','at','with','and','or','me','one','here','there','how','much','many','what','where','when','who','give','get','put','go','come','will','too','not','no','yes','okay','dont','don'])
const QMAP: Record<string, string> = {
  wake:'person waking up in bed',bed:'person making the bed',shower:'person in bathroom shower',teeth:'person brushing teeth bathroom mirror',
  face:'person washing face',hair:'person combing hair',dress:'person getting dressed',breakfast:'person eating breakfast',coffee:'cup of coffee',
  tea:'cup of mint tea',dishes:'person washing dishes kitchen',sweep:'person sweeping floor',floor:'person sweeping the floor',work:'person walking to work',
  school:'students going to school',tv:'family watching television',mirror:'person looking in mirror',towel:'person holding towel',soap:'washing hands with soap',
  razor:'man shaving',shave:'man shaving face',toothpaste:'toothbrush toothpaste',floss:'dental floss',deodorant:'person using deodorant',
  hairdryer:'person drying hair',fridge:'person opening refrigerator',water:'pouring a glass of water',boil:'boiling water in pot',eggs:'frying eggs in a pan',
  knife:'chopping food with knife',pan:'cooking in a frying pan',rice:'plate of rice and chicken',sandwich:'making a sandwich',blender:'using a kitchen blender',
  stove:'cooking on the stove',dishwasher:'loading a dishwasher',vegetables:'chopping vegetables',cafe:'people sitting in a cafe',menu:'reading a restaurant menu',
  cappuccino:'cappuccino cup',croissant:'fresh croissant',window:'person sitting by a window cafe',cake:'slice of cake',bill:'paying the restaurant bill',
  cash:'paying with cash',waiter:'waiter serving food',table:'set restaurant table',chicken:'grilled chicken plate',onions:'fresh onions',fish:'cooked fish plate',
  card:'paying with a credit card',apples:'red apples',oranges:'oranges',bananas:'bananas',grapes:'grapes',watermelon:'watermelon',milk:'bottle of milk',
  cheese:'cheese',butter:'butter',yogurt:'yogurt',bread:'fresh bread bakery',beef:'raw beef meat',pasta:'pasta',sugar:'sugar',flour:'flour baking',
  potatoes:'potatoes',tomatoes:'fresh tomatoes',carrots:'carrots',lettuce:'lettuce',peppers:'bell peppers',cookies:'cookies',groceries:'person grocery shopping',
  basket:'shopping basket supermarket',dairy:'dairy aisle supermarket',sale:'sale tag store',bakery:'bakery shop',baguette:'baguette bread',donut:'donuts',
  muffin:'muffin',clothes:'clothes shop',shoes:'pair of shoes',jacket:'person wearing a jacket',shirt:'folded shirt',jeans:'blue jeans',
  fitting:'clothing store fitting room',discount:'sale discount tag',laundry:'person doing laundry',iron:'person ironing clothes',blanket:'folded blanket',
  stain:'stain on a shirt',fold:'folding laundry',clinic:'doctor with a patient',doctor:'doctor examining patient',chest:'doctor checking patient chest',
  fever:'sick person with thermometer',throat:'person sore throat',stomach:'person with stomach ache',dizzy:'tired dizzy person',pharmacy:'pharmacy',
  pen:'hand writing with pen',book:'open book',library:'library books',teacher:'teacher in a classroom',class:'students in a classroom',market:'vegetable market stall',
  garlic:'garlic',cumin:'spices market',olives:'olives',ginger:'ginger root',pot:'cooking pot',spoon:'metal spoons',glass:'drinking glasses',kettle:'tea kettle',
  trash:'trash bin',broom:'broom',hanger:'clothes hangers',home:'cozy living room',balcony:'home balcony',flight:'airplane flying in sky',round:'airplane travel',
  passport:'passport in hand',economy:'airplane cabin seats',seat:'airplane window seat',boarding:'boarding pass',airport:'airport terminal',ticket:'airplane ticket',
  hotel:'hotel room bed',single:'hotel bedroom',wifi:'wifi symbol',key:'hotel key card',reception:'hotel reception desk',elevator:'elevator',bus:'city bus',
  taxi:'taxi car street',train:'train at the station',station:'train station',traffic:'city traffic cars',change:'coins in hand',bank:'bank counter',
  money:'cash money',atm:'person using an atm',withdraw:'atm cash withdraw',deposit:'bank deposit money',transfer:'money transfer phone',receipt:'paper receipt',
  balance:'bank statement',account:'opening a bank account',id:'id card',
}
function photoQuery(en: string): string {
  const low = en.toLowerCase(); const ws = low.replace(/[^a-z\s]/g, ' ').split(/\s+/)
  for (const w of ws) if (QMAP[w]) return QMAP[w]
  for (const k of Object.keys(QMAP)) if (low.includes(k)) return QMAP[k]
  const content = ws.filter(w => w && !STOP.has(w))
  return (content.slice(-2).join(' ') || 'daily life') + ''
}
const EMOJI: Record<string, string> = {
  wake:'🌅',bed:'🛏️',shower:'🚿',teeth:'🪥',face:'🧼',hair:'💇',dress:'👕',breakfast:'🍳',coffee:'☕',tea:'🍵',dishes:'🍽️',floor:'🧹',
  work:'💼',school:'🏫',tv:'📺',mirror:'🪞',towel:'🧻',soap:'🧼',razor:'🪒',fridge:'🧊',water:'💧',eggs:'🥚',knife:'🔪',pan:'🍳',rice:'🍚',
  chicken:'🍗',sandwich:'🥪',cafe:'☕',menu:'📋',cake:'🍰',croissant:'🥐',bill:'🧾',fish:'🐟',card:'💳',apples:'🍎',milk:'🥛',cheese:'🧀',
  bread:'🍞',onions:'🧅',tomatoes:'🍅',basket:'🧺',bakery:'🥖',donut:'🍩',clothes:'👕',shoes:'👟',jacket:'🧥',jeans:'👖',laundry:'🧺',doctor:'🩺',
  fever:'🤒',throat:'🤧',stomach:'🤢',pharmacy:'💊',pen:'🖊️',book:'📖',library:'📚',teacher:'🧑‍🏫',market:'🛒',garlic:'🧄',olives:'🫒',pot:'🍲',
  spoon:'🥄',kettle:'🫖',trash:'🗑️',home:'🏠',flight:'✈️',ticket:'🎫',passport:'🛂',airport:'🛫',seat:'💺',hotel:'🏨',key:'🔑',bus:'🚌',taxi:'🚕',
  train:'🚆',bank:'🏦',money:'💵',atm:'🏧',receipt:'🧾',
}
function emojiFor(en: string): string {
  const low = en.toLowerCase(); const ws = low.replace(/[^a-z\s]/g, ' ').split(/\s+/)
  for (const w of ws) if (EMOJI[w]) return EMOJI[w]
  for (const k of Object.keys(EMOJI)) if (low.includes(k)) return EMOJI[k]
  return '🗣️'
}

/* AI-generated illustration for the visual vocabulary grid (keyless, URL-based,
   pollinations/flux). Stable seed per phrase → the same image every reload. */
function aiVocabUrl(en: string): string {
  // Force the illustration to depict the EXACT vocabulary word/phrase: lead with it
  // verbatim, then add the scene hint. The subject fills the frame so there are no
  // empty margins — only the object's own (white) background shows.
  const subject = photoQuery(en)
  const hint = subject && subject !== en.toLowerCase() ? `, ${subject}` : ''
  const prompt = `cute 3D pixar-style cartoon illustration that clearly and accurately shows "${en}"${hint}, one single central subject filling the whole frame, plain solid white background, soft studio lighting, friendly, highly detailed, no text, no letters, no words`
  const seed = en.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'vocab'
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&model=flux&seed=${seed}`
}
/** Vocabulary/expression picture. Priority — uses the TEACHER's uploaded folder
 *  picture first, then an AI illustration, then an Unsplash photo, then emoji.
 *  `unit`+`slot` point at public/deck-images/unit-<N>/<letter><slot>.(png|jpg). */
function AiImg({ en, unit, slot, contain, square, heightClass = 'h-[22vh]' }: { en: string; unit?: number; slot?: number; contain?: boolean; square?: boolean; heightClass?: string }) {
  const ai = useMemo(() => aiVocabUrl(en), [en])
  const [stage, setStage] = useState<'check' | 'own' | 'ai' | 'photo' | 'emoji'>('check')
  const [own, setOwn] = useState<string | null>(null)     // uploaded picture
  const [photo, setPhoto] = useState<string | null>(null) // Unsplash fallback
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setStage('check'); setOwn(null); setPhoto(null); setLoaded(false) }, [en, unit, slot])
  useEffect(() => {   // ask /api/img: uploaded picture wins; else keep its Unsplash url
    if (stage !== 'check') return
    let alive = true
    const pos = unit && slot ? `&unit=${unit}&i=${slot}` : ''
    fetch(`/api/img?en=${encodeURIComponent(en)}&q=${encodeURIComponent(photoQuery(en))}${pos}`)
      .then(r => r.json()).then(d => {
        if (!alive) return
        if (d?.own && d?.url) { setOwn(d.url); setStage('own') }       // teacher's upload → use it
        else { if (d?.url) setPhoto(d.url); setStage('ai') }
      }).catch(() => { if (alive) setStage('ai') })
    return () => { alive = false }
  }, [stage, en, unit, slot])
  useEffect(() => {   // don't wait forever on a slow AI render → fall to the photo/emoji
    if (stage !== 'ai') return
    const t = setTimeout(() => setLoaded(l => { if (!l) setStage(photo ? 'photo' : 'emoji'); return l }), 8000)
    return () => clearTimeout(t)
  }, [stage, photo])
  const src = stage === 'own' ? own : stage === 'ai' ? ai : stage === 'photo' ? photo : null
  return (
    <div className={`relative ${square ? `${heightClass} aspect-square mx-auto rounded-3xl` : `w-full ${heightClass} rounded-2xl`} overflow-hidden bg-white ring-1 ring-stone-200 flex items-center justify-center shadow-[0_18px_40px_-20px_rgba(42,29,18,0.55)]`}>
      {(stage === 'check' || (stage !== 'emoji' && !loaded)) && <Loader2 className="animate-spin text-stone-300" size={26} />}
      {stage === 'emoji'
        ? <span style={{ fontSize: '9vh' }}>{emojiFor(en)}</span>
        : src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={en} onLoad={() => setLoaded(true)}
            onError={() => { setLoaded(false); setStage(s => s === 'own' ? 'ai' : s === 'ai' ? (photo ? 'photo' : 'emoji') : 'emoji') }}
            className={`absolute inset-0 w-full h-full ${contain && !square ? 'object-contain' : 'object-cover'} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
        )}
    </div>
  )
}

function Photo({ en, unit, slot }: { en: string; unit?: number; slot?: number }) {
  // Priority for a clear, MATCHING picture: teacher's upload → an AI illustration
  // generated for this exact phrase (always on-topic) → an Unsplash photo (often
  // only loosely related) → emoji. The AI tier is what fixes "image doesn't match".
  const ai = useMemo(() => aiVocabUrl(en), [en])
  const [stage, setStage] = useState<'check' | 'own' | 'ai' | 'photo' | 'emoji'>('check')
  const [own, setOwn] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setStage('check'); setOwn(null); setPhoto(null); setLoaded(false) }, [en, unit, slot])
  useEffect(() => {
    if (stage !== 'check') return
    let alive = true
    const pos = unit && slot ? `&unit=${unit}&i=${slot}` : ''
    fetch(`/api/img?en=${encodeURIComponent(en)}&q=${encodeURIComponent(photoQuery(en))}${pos}`)
      .then(r => r.json()).then(d => {
        if (!alive) return
        if (d?.own && d?.url) { setOwn(d.url); setStage('own') }   // teacher's upload wins
        else { if (d?.url) setPhoto(d.url); setStage('ai') }       // else try AI, keep photo as backup
      }).catch(() => { if (alive) setStage('ai') })
    return () => { alive = false }
  }, [stage, en, unit, slot])
  useEffect(() => {                                                 // don't wait forever on a slow AI render
    if (stage !== 'ai') return
    const t = setTimeout(() => setLoaded(l => { if (!l) setStage(photo ? 'photo' : 'emoji'); return l }), 8000)
    return () => clearTimeout(t)
  }, [stage, photo])
  const src = stage === 'own' ? own : stage === 'ai' ? ai : stage === 'photo' ? photo : null
  return (
    <div className="relative w-full aspect-[4/3] max-h-[58vh] rounded-[28px] overflow-hidden bg-white flex items-center justify-center
                    shadow-[0_24px_60px_-22px_rgba(42,29,18,0.45)] ring-1 ring-black/5">
      {(stage === 'check' || (stage !== 'emoji' && !loaded)) && <Loader2 className="animate-spin text-stone-300" size={46} />}
      {stage === 'emoji' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 text-[14vw]">{emojiFor(en)}</motion.div>
      )}
      {stage !== 'emoji' && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img key={src} src={src} alt={en} onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setStage(s => s === 'own' ? 'ai' : s === 'ai' ? (photo ? 'photo' : 'emoji') : 'emoji') }}
          initial={{ opacity: 0, scale: 1.03 }} animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  )
}

function Box({ label, labelAr, rtl, children, accent, brown }: { label: string; labelAr?: string; rtl?: boolean; children: React.ReactNode; accent?: boolean; brown?: boolean }) {
  const labelColor = brown ? '#facc15' : accent ? '#a16207' : '#a8a29e'
  return (
    <div className={`rounded-3xl px-[2.2vw] py-[2vh] shadow-[0_10px_30px_-18px_rgba(42,29,18,0.3)] ring-1
                    ${brown ? 'ring-yellow-300/30' : accent ? 'bg-yellow-50 ring-yellow-200' : 'bg-white ring-stone-200/70'}`}
         style={brown ? { background: DARK } : undefined}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#facc15' }} />
        <span className="text-[0.85vw] font-bold uppercase tracking-[0.18em]" style={{ color: labelColor }}>{label}</span>
        {labelAr && <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: labelColor }} className="text-[1vw] font-bold">· {labelAr}</span>}
      </div>
      <div dir={rtl ? 'rtl' : 'ltr'} style={rtl ? { fontFamily: "'Tajawal', sans-serif" } : undefined}>{children}</div>
    </div>
  )
}

function Footer() {
  const sep = <span className="text-white/30">·</span>
  return (
    <div className="relative z-10 flex items-center justify-center gap-[1.6vw] px-[3vw] py-[1.5vh] text-[0.9vw] font-semibold text-white
                    border-t border-white/10" style={{ background: DARK }}>
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-400" /> واتساب 0764189311</span>
      {sep}<span className="flex items-center gap-1.5"><Globe size={13} style={{ color: '#facc15' }} /> inglizi.com</span>
      {sep}<span className="flex items-center gap-1.5"><Instagram size={13} className="text-rose-400" /> @elqasraouihamza</span>
      {sep}<span className="flex items-center gap-1.5"><Youtube size={13} className="text-red-500" /> @hamzaelqasraoui</span>
      {sep}<span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={13} style={{ color: '#facc15' }} /> الأستاذ حمزة</span>
    </div>
  )
}

const slideV = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const, staggerChildren: 0.06, delayChildren: 0.06 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.2 } },
}
const item = { enter: { opacity: 0, y: 12 }, center: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

/* ── end-of-unit practice builders ─────────────────────────── */
const stripEnd = (s: string) => s.replace(/[.!?]+$/, '').trim()
/** Short, clean sentences (3–8 words) from the conversation + vocab, deduped. */
function buildScramble(convo: { who: string; text: string }[], vocab: VocabPair[]): string[] {
  const seen = new Set<string>(); const out: string[] = []
  for (const raw of [...convo.map(l => l.text), ...vocab.map(v => v.en)]) {
    const s = stripEnd(raw.replace(/\s*\/\s*/g, ' '))   // drop "a / b" alternatives
    const w = s.split(/\s+/).filter(Boolean)
    if (w.length < 3 || w.length > 8) continue
    const k = s.toLowerCase()
    if (!seen.has(k)) { seen.add(k); out.push(s) }
  }
  return out.slice(0, 6)
}
/** Translation items: take the unit's en↔ar vocab pairs, keep the first option
 *  when a phrase lists alternatives ("tea / coffee"), and keep short, real pairs.
 *  The student is shown the Arabic and builds the English. */
function buildTranslations(vocab: VocabPair[]): { ar: string; en: string }[] {
  const seen = new Set<string>(); const out: { ar: string; en: string }[] = []
  for (const v of vocab) {
    const en = v.en.split('/')[0].trim()
    const ar = v.ar.split('/')[0].trim()
    if (!en || !ar || !/[a-zA-Z]/.test(en) || !AR.test(ar)) continue
    const w = en.split(/\s+/).filter(Boolean)
    if (w.length < 1 || w.length > 7) continue
    const k = en.toLowerCase()
    if (!seen.has(k)) { seen.add(k); out.push({ ar, en }) }
  }
  return out.slice(0, 8)
}

export default function PresentPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [reading, setReading] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LmsLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [units, setUnits] = useState<{ id: string; title: string }[]>([])   // sibling units, for prev/next

  useEffect(() => {
    if (!moduleId) return
    setLoading(true); setIdx(0)
    ;(async () => {
      const { data: mod } = await supabase.from('lms_modules').select('title, reading_text, course_id').eq('id', moduleId).single()
      const ls = await fetchLessons(moduleId)
      setTitle(mod?.title ?? 'Unit'); setReading(mod?.reading_text ?? null); setLessons(ls); setLoading(false)
      if (mod?.course_id) fetchModules(mod.course_id).then(ms => setUnits(ms.map(m => ({ id: m.id, title: m.title }))))
    })()
  }, [moduleId])
  const unitIdx = units.findIndex(u => u.id === moduleId)
  const prevUnit = unitIdx > 0 ? units[unitIdx - 1] : null
  const nextUnit = unitIdx >= 0 && unitIdx < units.length - 1 ? units[unitIdx + 1] : null
  const goUnit = (id: string) => router.push(`/admin/present/${id}`)

  const [unitNo, unitName] = useMemo(() => {
    const parts = title.split('—')
    return parts.length > 1 ? [parts[0].trim(), parts.slice(1).join('—').trim()] : ['', title]
  }, [title])
  // unit number drives the picture folder (unit-<N>) and letter (1→a, 2→b…)
  const unitNum = useMemo(() => parseInt(unitNo.replace(/\D/g, ''), 10) || 0, [unitNo])

  const slides = useMemo<Slide[]>(() => {
    const l1 = lessons.find(l => l.lesson_order === 1)?.content
    const cats = parseCategories(l1)
    const isCat = cats.length >= 1   // a curated single-word group → illustrated vocab poster
    const vocab = isCat ? cats.flatMap(c => c.items) : buildVocab(lessons)
    const expr = parseExpr(lessons.find(l => l.lesson_order === 2)?.content)
    const convo = parseConvo(reading)

    // The "change the word" box is curated only (variationsFor): it must match the
    // slide's phrase/expression or complete a single word's meaning — never random
    // fill. No rule → no box.
    // Order: VOCABULARY → EXPRESSIONS → CONVERSATION → practice.
    // Order: VOCABULARY → EXPRESSIONS (full sentences using the vocab — the
    // | en | ar | table) → STATIC SENTENCES (frames that change a few words —
    // the patterns) → CONVERSATION → games.
    // Expressions = the FULL-SENTENCE table in lesson 1 (parseVocab) — shown for
    // EVERY unit that has one, not only category units. This is the sentence table
    // (e.g. "I go to the bathroom"), NOT the single-word `vocab` (that's the
    // Vocabulary section). The uploaded folder pictures (unit-<N>/<letter><i>) are
    // numbered to line up with these sentences in order.
    const statics = parseVocab(l1)
    const out: Slide[] = [{ kind: 'title', title: unitName }]
    // Vocabulary = the single-word poster, shown ONLY for category units (which
    // carry a distinct word list separate from their sentence table). Units that
    // have just the sentence table skip a separate Vocabulary section — those
    // sentences appear once, below, as the illustrated Expressions grid (no
    // duplicate one-sentence-per-slide section).
    if (isCat) cats.forEach(c => out.push({ kind: 'category', name: c.name, ar: c.ar, items: c.items }))
    if (statics.length) {                                              // Expressions (phrases) — illustrated, paginated
      const pages = Math.ceil(statics.length / EXPR_PER_PAGE)
      for (let p = 0; p < pages; p++) out.push({ kind: 'static', items: statics.slice(p * EXPR_PER_PAGE, p * EXPR_PER_PAGE + EXPR_PER_PAGE), page: p + 1, pages })
    }
    expr.forEach(e => out.push({ kind: 'expr', pattern: e.pattern, example: e.example, vary: variationsFor(e.pattern + ' ' + e.example), slot: matchVocabSlot(e.example + ' ' + e.pattern, vocab), actions: statics }))
    if (convo.length) {
      const speakers = [...new Set(convo.map(l => l.who))]
      out.push({ kind: 'convo', lines: convo, speakers })
    }
    // ── end-of-unit games — use the full sentences when we have them ──
    const exVocab = statics.length ? statics : vocab
    const scrambleS = buildScramble(convo, exVocab)
    if (scrambleS.length >= 2) out.push({ kind: 'scramble', sentences: scrambleS })
    const trans = buildTranslations(exVocab)
    if (trans.length >= 2) out.push({ kind: 'translate', items: trans })
    out.push({ kind: 'end' })
    return out
  }, [lessons, reading, unitName])

  const last = slides.length - 1
  const [step, setStep] = useState(0)                  // reveal progress inside a slide (conversation lines)
  useEffect(() => { setStep(0) }, [idx])               // each new slide starts hidden
  const idxRef = useRef(idx); idxRef.current = idx
  const stepRef = useRef(step); stepRef.current = step
  const stepsOf = (sl?: Slide) =>
    !sl ? 0 : sl.kind === 'convo' ? sl.lines.length : (sl.kind === 'category' || sl.kind === 'static') ? sl.items.length : 0
  // Space / → / side-click first reveals the next hidden line, then advances slide.
  const go = useCallback((d: number) => {
    const max = stepsOf(slides[idxRef.current])
    if (d > 0) { if (stepRef.current < max) setStep(stepRef.current + 1); else setIdx(Math.min(last, idxRef.current + 1)) }
    else { if (stepRef.current > 0) setStep(stepRef.current - 1); else setIdx(Math.max(0, idxRef.current - 1)) }
  }, [slides, last])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // true full-screen (hides the whole browser chrome) via the Fullscreen API
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    const onKey = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'f') toggleFs() }
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('keydown', onKey) }
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  // ── Zoom: pinch (touch) · Ctrl/⌘ + wheel (trackpad/mouse) · buttons · +/-/0 ──
  const rootRef = useRef<HTMLDivElement>(null)
  const ZMIN = 0.8, ZMAX = 1.8
  const [zoom, setZoom] = useState(1)
  const zRef = useRef(zoom); zRef.current = zoom
  const setZ = useCallback((v: number) => setZoom(Math.min(ZMAX, Math.max(ZMIN, parseFloat(v.toFixed(2))))), [])
  const zoomBy = useCallback((d: number) => setZ(zRef.current + d), [setZ])
  // editable % field
  const [zin, setZin] = useState('100')
  useEffect(() => { setZin(String(Math.round(zoom * 100))) }, [zoom])
  const applyZin = () => { const n = parseInt(zin.replace(/\D/g, ''), 10); if (!isNaN(n) && n > 0) setZ(n / 100) }
  // drag-to-pan when zoomed in (so you can move to a specific word)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  useEffect(() => { setPan({ x: 0, y: 0 }) }, [idx])              // reset pan per slide
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

  const s = slides[idx]
  const section = s ? SECTION[s.kind] : null

  const ChangeBox = ({ vary }: { vary: Variation }) => (
    <div className="rounded-3xl px-[2.2vw] py-[2vh] shadow-[0_14px_34px_-14px_rgba(180,120,20,0.55)]" style={{ background: 'linear-gradient(135deg,#fcd34d,#f59e0b)' }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[0.85vw] font-black uppercase tracking-[0.18em]" style={{ color: DARK }}>{vary.label}</span>
        <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: DARK }} className="text-[1vw] font-bold">· {vary.ar}</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {vary.words.map((o, i) => <span key={i} className="px-3.5 py-1.5 rounded-xl bg-white text-[1.3vw] font-bold shadow-sm" style={{ color: DARK }}>{o}</span>)}
      </div>
    </div>
  )

  return (
    <div ref={rootRef} style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: CREAM, color: DARK }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[20vw] -right-[15vw] w-[45vw] h-[45vw] rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[20vw] -left-[15vw] w-[42vw] h-[42vw] rounded-full bg-amber-200/20 blur-3xl" />

      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: '#eab308' }} size={34} /></div>
      ) : (
        <>
          {/* header — single row, fits */}
          <div className="relative z-30 flex items-center justify-center gap-2 px-[3vw] pt-[2.6vh] text-[0.95vw] flex-nowrap overflow-hidden">
            {/* unit navigation — previous unit · restart this unit · next unit */}
            <div dir="ltr" className="absolute left-[3vw] top-[2.6vh] flex items-center gap-1.5">
              <button disabled={!prevUnit} onClick={() => prevUnit && goUnit(prevUnit.id)} title={prevUnit ? `الوحدة السابقة — ${prevUnit.title}` : 'لا توجد وحدة سابقة'} className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition shrink-0" aria-label="Previous unit"><ChevronsLeft size={16} /></button>
              <button onClick={() => setIdx(0)} title="من بداية الوحدة" className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition shrink-0" aria-label="Restart unit"><RotateCcw size={15} /></button>
              <button disabled={!nextUnit} onClick={() => nextUnit && goUnit(nextUnit.id)} title={nextUnit ? `الوحدة التالية — ${nextUnit.title}` : 'لا توجد وحدة تالية'} className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition shrink-0" aria-label="Next unit"><ChevronsRight size={16} /></button>
            </div>
            {unitNo && <span className="px-3.5 py-1.5 rounded-xl text-white font-black whitespace-nowrap shrink-0" style={{ background: DARK }}>{unitNo}</span>}
            <span className="px-3.5 py-1.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200/70 font-bold whitespace-nowrap shrink min-w-0 truncate" style={{ color: DARK }}>{unitName}</span>
            {section && <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 text-[#2a1d12]" style={{ background: '#facc15' }}>{section.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{section.ar}</span>{s.kind === 'convo' && s.parts && s.parts > 1 ? ` · ${s.part}/${s.parts}` : ''}{s.kind === 'static' && s.pages > 1 ? ` · ${s.page}/${s.pages}` : ''}</span>}
            <div className="absolute right-[3vw] top-[2.6vh] flex items-center gap-2">
              <span className="text-stone-400 font-bold whitespace-nowrap shrink-0">{String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
              {/* zoom controls — also: pinch · Ctrl+wheel · + − 0 */}
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
              <button onClick={toggleFs} className="shrink-0 p-2 rounded-lg text-stone-500 hover:text-[#2a1d12] hover:bg-white/70 transition" title="Full screen (F)">
                {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          {/* side-click navigation — disabled on interactive exercises so taps hit the tiles */}
          {s.kind !== 'scramble' && s.kind !== 'translate' && (<>
            <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[11%] z-20 cursor-w-resize" aria-label="Previous" />
            <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[11%] z-20 cursor-e-resize" aria-label="Next" />
          </>)}

          <div className="flex-1 flex items-center justify-center px-[5vw] py-[2vh] relative z-10 min-h-0 overflow-hidden">
            <div className="w-full flex items-center justify-center"
              onPointerDown={onPanDown} onPointerMove={onPanMove} onPointerUp={onPanUp} onPointerCancel={onPanUp}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 150ms', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}>
            <AnimatePresence mode="wait">
              <motion.div key={idx} variants={slideV} initial="enter" animate="center" exit="exit" className="w-full flex items-center justify-center">

                {s.kind === 'title' && (
                  <div className="text-center">
                    <motion.div variants={item} className="inline-block mb-7 px-6 py-2.5 rounded-full font-bold tracking-[0.2em] text-[1vw]" style={{ background: DARK, color: '#facc15' }}>
                      REALLIFE ENGLISH · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الإنجليزية للمواقف اليومية</span>
                    </motion.div>
                    <motion.h1 variants={item} className="font-black leading-[1.05] text-[5.2vw] tracking-tight" style={{ color: DARK }}>{s.title}</motion.h1>
                    {unitNo && <motion.div variants={item} className="mt-5 inline-block px-5 py-1.5 rounded-full text-[#2a1d12] font-bold text-[1.4vw]" style={{ background: '#facc15' }}>{unitNo}</motion.div>}
                  </div>
                )}

                {s.kind === 'word' && (
                  <div className="grid grid-cols-[1.05fr_1fr] gap-[3.5vw] items-center w-full max-w-[88vw]">
                    <motion.div variants={item}><Photo en={s.en} unit={unitNum} slot={s.slot} /></motion.div>
                    <motion.div variants={item} className="space-y-[2.2vh]">
                      <Box label="English"><div className="font-black text-[2.7vw] leading-[1.1]" style={{ color: DARK }}>{s.en}</div></Box>
                      <Box label="Arabic" labelAr="العربية" rtl><div className="font-bold text-[2.3vw]" style={{ color: '#5b4636' }}>{s.ar}</div></Box>
                      {s.vary && <ChangeBox vary={s.vary} />}
                    </motion.div>
                  </div>
                )}

                {s.kind === 'category' && (() => {
                  // Visual vocabulary poster: a picture per single word + its name (en) + Arabic.
                  const n = s.items.length
                  const cols = n <= 4 ? n : Math.ceil(n / 2)   // keep it to ~2 rows so images fit
                  const fs = n <= 6 ? 1.55 : 1.3
                  return (
                    <div className="w-full max-w-[90vw] flex flex-col items-center gap-[2.6vh]">
                      <div className="flex items-baseline gap-[1vw]">
                        <h2 className="font-black" style={{ color: '#0f766e', fontSize: '3vw' }}>{s.name}</h2>
                        <span dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '2vw' }}>{s.ar}</span>
                      </div>
                      <div dir="ltr" className="grid w-full gap-x-[1.8vw] gap-y-[2vh]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
                        {s.items.map((it, k) => k >= step ? (
                          <div key={k} className="w-full h-[22vh] rounded-2xl border-2 border-dashed border-stone-300/70 opacity-50" />
                        ) : (
                          <motion.div key={k} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.28 }} className="flex flex-col items-center text-center">
                            <AiImg en={it.en} />
                            <div className="font-black mt-[1vh] leading-tight" style={{ color: '#0f766e', fontSize: `${fs}vw` }}>{it.en}</div>
                            <div dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: `${fs * 0.8}vw` }}>{it.ar}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {s.kind === 'expr' && <PatternSlide pattern={s.pattern} example={s.example} actions={s.actions} />}

                {s.kind === 'static' && (() => {
                  // Expressions: each phrase with its own square picture; revealed on tap.
                  // Up to 6 per page (3×2) so the cards fill the slide; the square size
                  // adapts to the row count. Short/last pages with ≤4 items use 2
                  // columns and larger squares.
                  const n = s.items.length
                  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3
                  const rows = Math.ceil(n / cols)
                  const imgH = rows >= 3 ? 'h-[18vh]' : rows === 2 ? 'h-[25vh]' : 'h-[30vh]'
                  const fs = cols === 3 ? 0.95 : 1.25
                  const base = (s.page - 1) * EXPR_PER_PAGE   // global phrase index → uploaded picture slot
                  return (
                    <div className="w-full max-w-[80vw]">
                      <div dir="ltr" className="grid justify-items-center gap-x-[1.6vw] gap-y-[1.6vh]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
                        {s.items.map((it, k) => k >= step ? (
                          <div key={k} className={`${imgH} aspect-square rounded-3xl border-2 border-dashed border-stone-300/70 opacity-50`} />
                        ) : (
                          <motion.div key={k} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.28 }} className="flex flex-col items-center text-center">
                            {/* square card, image fills it (cover) — no white margins */}
                            <AiImg en={it.en} unit={unitNum} slot={base + k + 1} square heightClass={imgH} />
                            {/* English — solid yellow rectangle, brown font, strong shadow */}
                            <div className="inline-block mt-[1vh] rounded-xl font-black leading-snug"
                              style={{ background: '#facc15', color: BROWN, fontSize: `${fs}vw`, padding: '0.5vh 1.2vw', boxShadow: '0 10px 22px -10px rgba(91,58,22,0.6)' }}>{it.en}</div>
                            {/* Arabic — white rectangle, brown border + brown font, strong shadow */}
                            <div dir="rtl" className="inline-block mt-[0.6vh] rounded-xl font-black"
                              style={{ background: '#ffffff', color: BROWN, border: `2px solid ${BROWN}`, fontFamily: "'Tajawal', sans-serif", fontSize: `${fs * 0.95}vw`, padding: '0.45vh 1.2vw', boxShadow: '0 12px 26px -10px rgba(91,58,22,0.5)' }}>{it.ar}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {s.kind === 'convo' && (() => {
                  // PAIRED layout: each exchange (question + reply) on ONE row — first
                  // speaker left, reply right — with speaker avatars. Lines stay HIDDEN
                  // (dashed placeholders) and reveal one-by-one on Space / side-click,
                  // so it works on an interactive board.
                  const n = s.lines.length
                  const fs = n <= 6 ? 1.5 : n <= 10 ? 1.28 : n <= 16 ? 1.08 : n <= 24 ? 0.94 : 0.82
                  const SPK = ['#a8a29e', '#facc15', '#34d399', '#38bdf8', '#a78bfa']
                  return (
                    <div className="w-full max-w-[92vw]">
                      {step === 0 && <div className="text-center text-stone-400 font-bold mb-[1.4vh]" style={{ fontSize: '0.95vw' }} dir="rtl">اضغط المسافة أو جانب الشاشة لإظهار كل سطر ←</div>}
                      <div dir="ltr" className="grid grid-cols-2 gap-x-[1.6vw]" style={{ rowGap: `${n > 16 ? 1 : 1.4}vh` }}>
                        {s.lines.map((l, i) => {
                          const si = s.speakers.indexOf(l.who)
                          const col = SPK[si % SPK.length]
                          const dark = si === 1   // yellow bubble → dark text
                          if (i >= step) return (   // not yet revealed → faint placeholder (keeps layout)
                            <div key={i} className="w-full rounded-[18px] border-2 border-dashed border-stone-300/70 px-[1.4vw] flex items-center gap-[0.7vw] opacity-50" style={{ minHeight: `${fs * 2.6}vw` }}>
                              <span className="shrink-0 rounded-full bg-stone-200" style={{ width: `${fs * 1.7}vw`, height: `${fs * 1.7}vw` }} />
                              <span className="text-stone-300 font-black" style={{ fontSize: `${fs}vw` }}>· · ·</span>
                            </div>
                          )
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28 }}
                              className="w-full rounded-[18px] px-[1.4vw] py-[1vh] shadow-[0_10px_28px_-16px_rgba(0,0,0,0.45)] ring-1 ring-black/5 flex items-start gap-[0.8vw]"
                              style={{ background: dark ? '#facc15' : '#fff', color: DARK }}>
                              <span className="shrink-0 rounded-full flex items-center justify-center font-black ring-2 ring-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)]"
                                style={{ width: `${fs * 1.9}vw`, height: `${fs * 1.9}vw`, fontSize: `${fs * 0.9}vw`, background: col, color: dark ? DARK : '#fff' }}>{l.who.charAt(0).toUpperCase()}</span>
                              <div className="min-w-0">
                                <div className="font-black uppercase tracking-wide mb-0.5" style={{ fontSize: `${fs * 0.52}vw`, color: dark ? '#7a5c00' : col === '#a8a29e' ? '#78716c' : col }}>{l.who}</div>
                                <div className="leading-snug font-semibold" style={{ fontSize: `${fs}vw` }}>{l.text}</div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {s.kind === 'scramble' && <ScrambleSlide sentences={s.sentences} />}
                {s.kind === 'translate' && <TranslateSlide items={s.items} />}

                {s.kind === 'end' && (
                  <div className="text-center">
                    <motion.div variants={item} className="text-[6vw] mb-2">🎉</motion.div>
                    <motion.div variants={item} className="font-black text-[3.2vw]" style={{ color: DARK }}>Great job!</motion.div>
                    <motion.div variants={item} dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: '#a8a29e' }} className="text-[1.7vw] mt-2 font-bold">أحسنت — نهاية الدرس</motion.div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between px-[4vw] pb-[1vh] relative z-10">
            <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronLeft size={26} /></button>
            <div className="flex gap-1.5 items-center">
              {slides.map((_, i) => (<span key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === idx ? 32 : 6, background: i === idx ? '#facc15' : '#d6d3d1' }} />))}
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronRight size={26} /></button>
          </div>

          <Footer />
        </>
      )}
    </div>
  )
}

/* ── End-of-unit practice slides (interactive, teacher-driven) ─────────────── */

const DARK_C = DARK
/** Word Scramble: tap the shuffled word tiles into the right order; reveal/next. */
function ScrambleSlide({ sentences }: { sentences: string[] }) {
  const [i, setI] = useState(0)
  const [tiles, setTiles] = useState<{ w: string; id: number }[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [reveal, setReveal] = useState(false)
  useEffect(() => {
    const ws = (sentences[i] ?? '').split(/\s+/).filter(Boolean)
    setTiles(ws.map((w, k) => ({ w, id: k })).sort(() => Math.random() - 0.5))
    setOrder([]); setReveal(false)
  }, [i, sentences])
  const words = (sentences[i] ?? '').split(/\s+/).filter(Boolean)
  const built = order.map(id => tiles.find(t => t.id === id)?.w ?? '')
  const done = built.length === words.length && built.join(' ').toLowerCase() === words.join(' ').toLowerCase()
  const bank = tiles.filter(t => !order.includes(t.id))

  return (
    <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.5vh]">
      <div className="text-stone-400 font-bold" style={{ fontSize: '1vw' }} dir="rtl">رتّب الكلمات لتكوين جملة صحيحة · {i + 1}/{sentences.length}</div>

      {/* answer row (LTR — English reads left→right) */}
      <div dir="ltr" className="min-h-[7vh] w-full flex flex-wrap items-center justify-center gap-[0.8vw] rounded-2xl bg-white/70 ring-1 ring-stone-200 px-[2vw] py-[1.5vh]">
        {order.length === 0 && <span className="text-stone-300 font-bold" style={{ fontSize: '1.2vw' }}>···</span>}
        {order.map(id => (
          <button key={id} onClick={() => setOrder(o => o.filter(x => x !== id))}
            className="px-[1.2vw] py-[0.8vh] rounded-xl font-black shadow-sm" style={{ background: '#facc15', color: DARK_C, fontSize: '1.5vw' }}>
            {tiles.find(t => t.id === id)?.w}
          </button>
        ))}
      </div>

      {done && <div className="font-black text-emerald-600" style={{ fontSize: '1.6vw' }}>✓ Correct!</div>}
      {reveal && !done && <div className="font-bold text-stone-600" style={{ fontSize: '1.4vw' }}>{words.join(' ')}</div>}

      {/* word bank */}
      <div dir="ltr" className="w-full flex flex-wrap items-center justify-center gap-[0.8vw]">
        {bank.map(t => (
          <button key={t.id} onClick={() => setOrder(o => [...o, t.id])}
            className="px-[1.2vw] py-[0.8vh] rounded-xl bg-white ring-1 ring-stone-200 font-bold shadow-sm hover:bg-amber-50" style={{ color: DARK_C, fontSize: '1.5vw' }}>
            {t.w}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-[1vw]">
        <button onClick={() => { setOrder([]); setReveal(false) }} className="px-[1.4vw] py-[0.9vh] rounded-xl bg-stone-100 font-bold text-stone-600" style={{ fontSize: '1vw' }} dir="rtl">إعادة</button>
        <button onClick={() => setReveal(true)} className="px-[1.4vw] py-[0.9vh] rounded-xl bg-stone-100 font-bold text-stone-600" style={{ fontSize: '1vw' }} dir="rtl">الإجابة</button>
        <button onClick={() => setI(x => (x + 1) % sentences.length)} className="px-[1.6vw] py-[0.9vh] rounded-xl text-white font-black" style={{ background: DARK_C, fontSize: '1vw' }} dir="rtl">التالية →</button>
      </div>
    </div>
  )
}

/** Sentence Builder: tap words from a bank ORGANISED by role (subject · verb ·
 *  words · tools) to form as MANY sentences as you can. All English flows LTR. */
/** Translate: shown an Arabic sentence, tap the English word tiles (answer words
 *  shuffled with a few distractors) in the right order to translate it. */
function TranslateSlide({ items }: { items: { ar: string; en: string }[] }) {
  const [i, setI] = useState(0)
  const [tiles, setTiles] = useState<{ w: string; id: number }[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [reveal, setReveal] = useState(false)
  const item = items[i] ?? { ar: '', en: '' }
  const answer = item.en.split(/\s+/).filter(Boolean)
  useEffect(() => {
    const ans = (items[i]?.en ?? '').split(/\s+/).filter(Boolean)
    const ansLow = new Set(ans.map(w => w.toLowerCase()))
    const pool: string[] = []                              // distractor words from the OTHER sentences
    items.forEach((it, j) => { if (j !== i) for (const w of it.en.split(/\s+/)) { const lw = w.toLowerCase(); if (w && !ansLow.has(lw) && !pool.some(p => p.toLowerCase() === lw)) pool.push(w) } })
    const distract = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(3, Math.max(1, Math.ceil(ans.length / 2))))
    const all = [...ans, ...distract].sort(() => Math.random() - 0.5)
    setTiles(all.map((w, k) => ({ w, id: k })))
    setOrder([]); setReveal(false)
  }, [i, items])
  const built = order.map(id => tiles.find(t => t.id === id)?.w ?? '')
  const done = built.length === answer.length && built.join(' ').toLowerCase() === answer.join(' ').toLowerCase()
  const bank = tiles.filter(t => !order.includes(t.id))

  return (
    <div className="w-full max-w-[80vw] flex flex-col items-center gap-[2.2vh]">
      <div className="text-stone-400 font-bold" style={{ fontSize: '1vw' }} dir="rtl">ترجم الجملة إلى الإنجليزية · {i + 1}/{items.length}</div>

      {/* Arabic prompt */}
      <div dir="rtl" className="font-black text-center px-[2vw]" style={{ fontFamily: "'Tajawal', sans-serif", color: DARK_C, fontSize: '2.6vw' }}>{item.ar}</div>

      {/* answer area (LTR) */}
      <div dir="ltr" className="min-h-[6.5vh] w-full flex flex-wrap items-center justify-center gap-[0.8vw] rounded-2xl bg-white/70 ring-1 ring-stone-200 px-[2vw] py-[1.4vh]">
        {order.length === 0 && <span className="text-stone-300 font-bold" style={{ fontSize: '1.1vw' }}>Tap the words in order…</span>}
        {order.map(id => (
          <button key={id} onClick={() => setOrder(o => o.filter(x => x !== id))}
            className="px-[1.2vw] py-[0.8vh] rounded-xl font-black shadow-sm" style={{ background: '#facc15', color: DARK_C, fontSize: '1.5vw' }}>
            {tiles.find(t => t.id === id)?.w}
          </button>
        ))}
      </div>

      {done && <div className="font-black text-emerald-600" style={{ fontSize: '1.5vw' }}>✓ Correct!</div>}
      {reveal && !done && <div dir="ltr" className="font-bold text-stone-600" style={{ fontSize: '1.4vw' }}>{item.en}</div>}

      {/* word bank */}
      <div dir="ltr" className="w-full flex flex-wrap items-center justify-center gap-[0.8vw]">
        {bank.map(t => (
          <button key={t.id} onClick={() => setOrder(o => [...o, t.id])}
            className="px-[1.2vw] py-[0.8vh] rounded-xl bg-white ring-1 ring-stone-200 font-bold shadow-sm hover:bg-amber-50" style={{ color: DARK_C, fontSize: '1.5vw' }}>
            {t.w}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-[1vw]">
        <button onClick={() => { setOrder([]); setReveal(false) }} className="px-[1.4vw] py-[0.9vh] rounded-xl bg-stone-100 font-bold text-stone-600" style={{ fontSize: '1vw' }} dir="rtl">إعادة</button>
        <button onClick={() => setReveal(true)} className="px-[1.4vw] py-[0.9vh] rounded-xl bg-stone-100 font-bold text-stone-600" style={{ fontSize: '1vw' }} dir="rtl">الإجابة</button>
        <button onClick={() => setI(x => (x + 1) % items.length)} className="px-[1.6vw] py-[0.9vh] rounded-xl text-white font-black" style={{ background: DARK_C, fontSize: '1vw' }} dir="rtl">التالية →</button>
      </div>
    </div>
  )
}

type Chip = VocabPair & { ok: boolean }

/** Interactive Static Sentence — see the "interactive Static Sentence helpers"
 *  note above. A frame with one blank: tap an ACTION (verb phrase + Arabic) to fill
 *  it and reveal the meaning; tap a TIME word and it bounces back with a why, so the
 *  slide teaches what belongs in the blank. Falls back to a read-only rule + example
 *  when the example carries no recognisable unit action. */
function PatternSlide({ pattern, example, actions }: { pattern: string; example: string; actions: VocabPair[] }) {
  const opts = useMemo<VocabPair[]>(() => {
    const seen = new Set<string>(); const out: VocabPair[] = []
    for (const a of actions) {
      const en = verbPhrase(a.en); const k = en.toLowerCase()
      if (en && /[a-z]/i.test(en) && !seen.has(k)) { seen.add(k); out.push({ en, ar: a.ar }) }
    }
    return out
  }, [actions])
  // The action phrase that appears in the example (longest wins) anchors the blank.
  const answer = useMemo<VocabPair | null>(() => {
    const lo = example.toLowerCase(); let best: VocabPair | null = null
    for (const o of opts) if (lo.includes(o.en.toLowerCase()) && (!best || o.en.length > best.en.length)) best = o
    return best
  }, [opts, example])
  const [before, after] = useMemo(() => {
    if (!answer) return ['', '']
    const i = example.toLowerCase().indexOf(answer.en.toLowerCase())
    return [example.slice(0, i), example.slice(i + answer.en.length)]
  }, [example, answer])
  const bank = useMemo<Chip[]>(() => {
    if (!answer) return []
    const others = shuffle(opts.filter(o => o.en.toLowerCase() !== answer.en.toLowerCase())).slice(0, 3)
    const acts: Chip[] = [answer, ...others].map(p => ({ ...p, ok: true }))
    const times: Chip[] = shuffle(TIME_DISTRACTORS.filter(d =>
      !example.toLowerCase().includes(d.en.toLowerCase()) && !pattern.toLowerCase().includes(d.en.toLowerCase()))).slice(0, 2)
      .map(p => ({ ...p, ok: false }))
    return shuffle([...acts, ...times])
  }, [opts, answer, example, pattern])

  const [placed, setPlaced] = useState<Chip | null>(null)
  const [wrong, setWrong] = useState<Chip | null>(null)
  useEffect(() => { setPlaced(null); setWrong(null) }, [example])
  useEffect(() => { if (!wrong) return; const t = setTimeout(() => setWrong(null), 3200); return () => clearTimeout(t) }, [wrong])

  if (!answer) {
    return (
      <div className="w-full max-w-[70vw] flex flex-col items-center gap-[2.4vh] text-center">
        <div className="rounded-3xl px-[3vw] py-[3vh] w-full" style={{ background: DARK }}>
          <div className="font-black text-[2.4vw] leading-snug" style={{ color: '#facc15' }}>{renderPattern(pattern)}</div>
        </div>
        {example && <div className="text-[1.9vw] italic font-bold" style={{ color: '#5b4636' }}>{renderExample(example, pattern)}</div>}
      </div>
    )
  }

  const onPick = (c: Chip) => { if (c.ok) { setPlaced(c); setWrong(null) } else setWrong(c) }

  return (
    <div className="w-full max-w-[82vw] flex flex-col items-center gap-[2.6vh]">
      <div className="font-bold text-stone-500" style={{ fontSize: '1vw' }} dir="rtl">اختر فعلاً لملء الفراغ — تظهر الجملة كاملة مع الترجمة ←</div>

      {/* interactive sentence with the blank */}
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-x-[0.6vw] gap-y-[1.4vh] font-black text-center leading-tight"
        style={{ color: DARK, fontSize: '2.7vw' }}>
        {before && <span>{before}</span>}
        <motion.span layout className="inline-flex items-center justify-center rounded-2xl"
          style={{ minWidth: '7vw', padding: '0.2vh 1.4vw',
                   background: placed ? '#facc15' : 'transparent',
                   border: placed ? '3px solid #facc15' : '3px dashed #e0c266',
                   color: placed ? DARK : '#cbb274' }}>
          {placed ? placed.en : '______'}
        </motion.span>
        {after && <span>{after}</span>}
      </div>

      {/* meaning (correct) / explanation (wrong) */}
      <div className="min-h-[7vh] flex items-center justify-center">
        {placed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-[1vw] rounded-2xl px-[2vw] py-[1.2vh] bg-emerald-50 ring-1 ring-emerald-200">
            <span className="text-emerald-600 font-black" style={{ fontSize: '1.5vw' }}>✓</span>
            <span className="font-black" style={{ color: DARK, fontSize: '1.3vw' }}>{placed.en}</span>
            <span className="text-stone-400">=</span>
            <span dir="rtl" className="font-black" style={{ fontFamily: "'Tajawal', sans-serif", color: '#0f766e', fontSize: '1.6vw' }}>{placed.ar}</span>
          </motion.div>
        )}
        {wrong && (
          <motion.div key={wrong.en} initial={{ x: 0 }} animate={{ x: [10, -10, 7, -7, 0] }} transition={{ duration: 0.45 }}
            dir="rtl" className="rounded-2xl px-[2vw] py-[1.2vh] bg-rose-50 ring-1 ring-rose-200 text-center max-w-[60vw]"
            style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <span className="font-black text-rose-600" style={{ fontSize: '1.35vw' }}>⚠ انتبه! </span>
            <span className="font-bold text-rose-900" style={{ fontSize: '1.15vw' }}>«{wrong.ar}» ليست فعلاً — هذا الفراغ يحتاج إلى فعل (حركة)، وليس تعبيرَ وقت.</span>
          </motion.div>
        )}
      </div>

      {/* word bank: actions (valid) + time words (wrong) */}
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-[1vw] max-w-[80vw]">
        {bank.map((c, i) => {
          const isPlaced = !!placed && placed.en === c.en && c.ok
          return (
            <motion.button key={c.en + i} onClick={() => onPick(c)} whileTap={{ scale: 0.94 }}
              className="rounded-2xl px-[1.6vw] py-[1.1vh] bg-white ring-1 ring-stone-200 shadow-[0_10px_24px_-16px_rgba(42,29,18,0.5)] hover:bg-amber-50 transition flex flex-col items-center"
              style={{ opacity: isPlaced ? 0.4 : 1 }}>
              <span className="font-black" style={{ color: DARK, fontSize: '1.4vw' }}>{c.en}</span>
              <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1vw' }}>{c.ar}</span>
            </motion.button>
          )
        })}
      </div>

      {placed && (
        <button onClick={() => setPlaced(null)} dir="rtl" className="rounded-xl px-[1.6vw] py-[0.9vh] bg-stone-100 font-bold text-stone-600" style={{ fontSize: '1vw' }}>جرّب كلمة أخرى ↺</button>
      )}
    </div>
  )
}
