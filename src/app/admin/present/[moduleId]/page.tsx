'use client'

/**
 * /admin/present/[moduleId] — premium full-screen teaching deck for recording.
 * Brand colors match the dashboards (#2a1d12 / yellow-400 / #faf6ef). Header
 * rectangles fit one row · big action-photo · English + Arabic + interchangeable
 * "change the word" slot (shown only when it makes sense). Built live from the
 * unit's DB content. Navigate ← → / Space / side-click.
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, Globe, Instagram, Youtube, GraduationCap, Phone, Maximize2, Minimize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchLessons, type LmsLesson } from '@/lib/lms'

const DARK = '#2a1d12'
const CREAM = '#faf6ef'

type VocabPair = { en: string; ar: string }
type Variation = { label: string; ar: string; words: string[] }
type Slide =
  | { kind: 'title'; title: string }
  | { kind: 'word'; en: string; ar: string; vary: Variation | null }
  | { kind: 'convo'; lines: { who: string; text: string }[] }
  | { kind: 'expr'; pattern: string; example: string; vary: Variation | null }
  | { kind: 'end' }

const SECTION: Record<Slide['kind'], { en: string; ar: string } | null> = {
  title: null, end: null,
  word: { en: 'Vocabulary', ar: 'المفردات' },
  convo: { en: 'Conversation', ar: 'المحادثة' },
  expr: { en: 'Expressions', ar: 'التعابير' },
}

/* ── parsers ───────────────────────────────────────────────── */
function parseVocab(content?: string | null): VocabPair[] {
  if (!content) return []
  return content.split('\n').filter(l => l.trim().startsWith('|'))
    .map(l => l.split('|').map(s => s.trim()))
    .filter(p => p.length >= 4 && p[1] && p[1] !== 'English' && !/^-+$/.test(p[1]) && p[2])
    .map(p => ({ en: p[1], ar: p[2] }))
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

/* ── interchangeable words: words that COMPLETE/REPLACE a slot in the sentence.
   Returns null when there is no sensible variation (so the box is hidden). ──── */
const VARIATIONS: { test: RegExp; label: string; ar: string; words: string[] }[] = [
  { test: /wake up|get up|go to bed|sleep|breakfast|lunch|dinner|take a shower|get dressed|brush|wash my face|comb|go to work|go to school/i,
    label: 'Add a time / how often', ar: 'أضف وقتاً', words: ['early', 'late', 'at 7 o\'clock', 'every morning', 'every day'] },
  { test: /can i have|i want the|i'?ll have|i'?d like|do you have/i,
    label: 'Change the order', ar: 'غيّر الطلب', words: ['a coffee', 'a tea', 'some water', 'a sandwich', 'a cake'] },
  { test: /how much is/i,
    label: 'Change the item', ar: 'غيّر العنصر', words: ['the ticket', 'the room', 'this jacket', 'the coffee'] },
  { test: /kilo|grams/i,
    label: 'Change the amount', ar: 'غيّر الكمية', words: ['half a kilo', 'one kilo', 'two kilos', '250 grams'] },
  { test: /too (big|small|tight|expensive)/i,
    label: 'Change the word', ar: 'غيّر الكلمة', words: ['big', 'small', 'tight', 'long', 'short'] },
  { test: /in size|in black|in red|the color/i,
    label: 'Change the size / color', ar: 'غيّر المقاس/اللون', words: ['black', 'white', 'blue', 'size M', 'size L'] },
  { test: /single room|double room|night/i,
    label: 'Change it', ar: 'غيّر', words: ['a single room', 'a double room', 'two nights', 'three nights'] },
  { test: /round trip|one way|morning flight|evening flight|window seat/i,
    label: 'Change it', ar: 'غيّر', words: ['one way', 'a round trip', 'a morning flight', 'a window seat'] },
  { test: /train station|bus stop|downtown|taxi/i,
    label: 'Change the place', ar: 'غيّر المكان', words: ['the airport', 'downtown', 'the market', 'the hotel'] },
  { test: /withdraw|deposit|transfer/i,
    label: 'Change the amount', ar: 'غيّر المبلغ', words: ['100 dirhams', '500 dirhams', '1000 dirhams'] },
]
function variationsFor(en: string): Variation | null {
  for (const v of VARIATIONS) if (v.test.test(en)) return { label: v.label, ar: v.ar, words: v.words }
  return null
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

function Photo({ en }: { en: string }) {
  const [url, setUrl] = useState<string | null | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let alive = true; setUrl(undefined); setLoaded(false)
    fetch(`/api/img?q=${encodeURIComponent(photoQuery(en))}`)
      .then(r => r.json()).then(d => { if (alive) setUrl(d?.url ?? null) })
      .catch(() => { if (alive) setUrl(null) })
    return () => { alive = false }
  }, [en])
  return (
    <div className="relative w-full aspect-[4/3] max-h-[58vh] rounded-[28px] overflow-hidden bg-white flex items-center justify-center
                    shadow-[0_24px_60px_-22px_rgba(42,29,18,0.45)] ring-1 ring-black/5">
      {url === undefined && <Loader2 className="animate-spin text-stone-300" size={46} />}
      {url === null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 text-[14vw]">{emojiFor(en)}</motion.div>
      )}
      {typeof url === 'string' && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img key={url} src={url} alt={en} onLoad={() => setLoaded(true)} onError={() => setUrl(null)}
          initial={{ opacity: 0, scale: 1.03 }} animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  )
}

function Box({ label, labelAr, rtl, children, accent }: { label: string; labelAr?: string; rtl?: boolean; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl px-[2.2vw] py-[2vh] shadow-[0_10px_30px_-18px_rgba(42,29,18,0.3)] ring-1
                    ${accent ? 'bg-yellow-50 ring-yellow-200' : 'bg-white ring-stone-200/70'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#facc15' }} />
        <span className="text-[0.85vw] font-bold uppercase tracking-[0.18em]" style={{ color: accent ? '#a16207' : '#a8a29e' }}>{label}</span>
        {labelAr && <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", color: accent ? '#a16207' : '#a8a29e' }} className="text-[1vw] font-bold">· {labelAr}</span>}
      </div>
      <div dir={rtl ? 'rtl' : 'ltr'} style={rtl ? { fontFamily: "'Tajawal', sans-serif" } : undefined}>{children}</div>
    </div>
  )
}

function Footer() {
  const sep = <span className="text-stone-300">·</span>
  return (
    <div className="relative z-10 flex items-center justify-center gap-[1.6vw] px-[3vw] py-[1.5vh] text-[0.9vw] font-semibold text-stone-500
                    border-t border-stone-200/70 bg-white/50 backdrop-blur-sm">
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-600" /> واتساب 0764189311</span>
      {sep}<span className="flex items-center gap-1.5"><Globe size={13} style={{ color: '#a16207' }} /> inglizi.com</span>
      {sep}<span className="flex items-center gap-1.5"><Instagram size={13} className="text-rose-500" /> @elqasraouihamza</span>
      {sep}<span className="flex items-center gap-1.5"><Youtube size={13} className="text-red-600" /> @hamzaelqasraoui</span>
      {sep}<span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={13} style={{ color: DARK }} /> الأستاذ حمزة</span>
    </div>
  )
}

const slideV = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const, staggerChildren: 0.06, delayChildren: 0.06 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.2 } },
}
const item = { enter: { opacity: 0, y: 12 }, center: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function PresentPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const [title, setTitle] = useState('')
  const [reading, setReading] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LmsLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!moduleId) return
    ;(async () => {
      const { data: mod } = await supabase.from('lms_modules').select('title, reading_text').eq('id', moduleId).single()
      const ls = await fetchLessons(moduleId)
      setTitle(mod?.title ?? 'Unit'); setReading(mod?.reading_text ?? null); setLessons(ls); setLoading(false)
    })()
  }, [moduleId])

  const [unitNo, unitName] = useMemo(() => {
    const parts = title.split('—')
    return parts.length > 1 ? [parts[0].trim(), parts.slice(1).join('—').trim()] : ['', title]
  }, [title])

  const slides = useMemo<Slide[]>(() => {
    const vocab = parseVocab(lessons.find(l => l.lesson_order === 1)?.content)
    const expr = parseExpr(lessons.find(l => l.lesson_order === 2)?.content)
    const convo = parseConvo(reading)
    const out: Slide[] = [{ kind: 'title', title: unitName }]
    vocab.forEach(p => out.push({ kind: 'word', en: p.en, ar: p.ar, vary: variationsFor(p.en) }))
    if (convo.length) out.push({ kind: 'convo', lines: convo })
    expr.forEach(e => out.push({ kind: 'expr', pattern: e.pattern, example: e.example, vary: variationsFor(e.pattern + ' ' + e.example) }))
    out.push({ kind: 'end' })
    return out
  }, [lessons, reading, unitName])

  const last = slides.length - 1
  const go = (d: number) => setIdx(i => Math.min(last, Math.max(0, i + d)))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [last])

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

  const s = slides[idx]
  const section = s ? SECTION[s.kind] : null

  const ChangeBox = ({ vary }: { vary: Variation }) => (
    <Box label={vary.label} labelAr={vary.ar} accent>
      <div className="flex flex-wrap gap-2.5">
        {vary.words.map((o, i) => <span key={i} className="px-3.5 py-1.5 rounded-xl bg-white ring-1 ring-yellow-300 text-[1.3vw] font-semibold" style={{ color: DARK }}>{o}</span>)}
      </div>
    </Box>
  )

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: CREAM, color: DARK }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[20vw] -right-[15vw] w-[45vw] h-[45vw] rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[20vw] -left-[15vw] w-[42vw] h-[42vw] rounded-full bg-amber-200/20 blur-3xl" />

      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: '#eab308' }} size={34} /></div>
      ) : (
        <>
          {/* header — single row, fits */}
          <div className="relative z-10 flex items-center gap-2 px-[3vw] pt-[2.6vh] text-[0.95vw] flex-nowrap overflow-hidden">
            {unitNo && <span className="px-3.5 py-1.5 rounded-xl text-white font-black whitespace-nowrap shrink-0" style={{ background: DARK }}>{unitNo}</span>}
            <span className="px-3.5 py-1.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200/70 font-bold whitespace-nowrap shrink min-w-0 truncate" style={{ color: DARK }}>{unitName}</span>
            {section && <span className="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 text-[#2a1d12]" style={{ background: '#facc15' }}>{section.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{section.ar}</span></span>}
            <span className="ml-auto text-stone-400 font-bold whitespace-nowrap shrink-0">{String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            <button onClick={toggleFs} className="shrink-0 p-2 rounded-lg text-stone-500 hover:text-[#2a1d12] hover:bg-white/70 transition" title="Full screen (F)">
              {isFs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[11%] z-20 cursor-w-resize" aria-label="Previous" />
          <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[11%] z-20 cursor-e-resize" aria-label="Next" />

          <div className="flex-1 flex items-center justify-center px-[5vw] py-[2vh] relative z-10 min-h-0">
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
                    <motion.div variants={item}><Photo en={s.en} /></motion.div>
                    <motion.div variants={item} className="space-y-[2.2vh]">
                      <Box label="English"><div className="font-black text-[2.7vw] leading-[1.1]" style={{ color: DARK }}>{s.en}</div></Box>
                      <Box label="Arabic" labelAr="العربية" rtl><div className="font-bold text-[2.3vw]" style={{ color: '#5b4636' }}>{s.ar}</div></Box>
                      {s.vary && <ChangeBox vary={s.vary} />}
                    </motion.div>
                  </div>
                )}

                {s.kind === 'expr' && (
                  <div className="grid grid-cols-[1.05fr_1fr] gap-[3.5vw] items-center w-full max-w-[88vw]">
                    <motion.div variants={item}><Photo en={s.example || s.pattern} /></motion.div>
                    <motion.div variants={item} className="space-y-[2.2vh]">
                      <Box label="Pattern" labelAr="جملة قابلة للتغيير"><div className="font-black text-[2.4vw] leading-snug" style={{ color: DARK }}>{renderPattern(s.pattern)}</div></Box>
                      {s.example && <Box label="Example" labelAr="مثال"><div className="text-[2vw] italic" style={{ color: '#5b4636' }}>{s.example}</div></Box>}
                      {s.vary && <ChangeBox vary={s.vary} />}
                    </motion.div>
                  </div>
                )}

                {s.kind === 'convo' && (
                  <div className="w-full max-w-[68vw] space-y-[1.4vh]">
                    {s.lines.map((l, i) => {
                      const leftSide = i % 2 === 0
                      return (
                        <motion.div key={i} variants={item} className={`flex items-end gap-3 ${leftSide ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                          <span className="shrink-0 w-[2.6vw] h-[2.6vw] rounded-full flex items-center justify-center text-[1vw] font-black text-white shadow-sm"
                            style={{ background: leftSide ? '#a8a29e' : '#facc15', color: leftSide ? '#fff' : DARK }}>{l.who.charAt(0)}</span>
                          <div className="max-w-[60%] rounded-3xl px-[1.6vw] py-[1.2vh] text-[1.5vw] leading-snug shadow-[0_8px_24px_-16px_rgba(0,0,0,0.4)]"
                            style={leftSide ? { background: '#fff', color: DARK, borderBottomLeftRadius: 6 } : { background: '#facc15', color: DARK, borderBottomRightRadius: 6 }}>
                            {l.text}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

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
