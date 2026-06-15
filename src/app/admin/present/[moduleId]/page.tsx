'use client'

/**
 * /admin/present/[moduleId] — premium full-screen teaching deck for recording.
 * Header rectangles [Unit № · title · section] · big targeted photo · three boxes
 * (English / Arabic / changeable words) · brand-contact footer. Built live from the
 * unit's DB content. Navigate ← → / Space / side-click.
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, Globe, Instagram, Youtube, GraduationCap, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchLessons, type LmsLesson } from '@/lib/lms'

type VocabPair = { en: string; ar: string }
type Slide =
  | { kind: 'title'; title: string }
  | { kind: 'word'; en: string; ar: string; others: string[] }
  | { kind: 'convo'; lines: { who: string; text: string }[] }
  | { kind: 'expr'; pattern: string; example: string; others: string[] }
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
function sample<T>(arr: T[], n: number, exclude?: T): T[] {
  const pool = arr.filter(x => x !== exclude)
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  return pool.slice(0, n)
}
function renderPattern(p: string) {
  return p.split(/(\[[^\]]+\])/).map((part, i) =>
    part.startsWith('[')
      ? <span key={i} className="inline-block mx-1.5 px-3 py-0.5 rounded-lg bg-amber-500 text-white align-middle">{part}</span>
      : <span key={i}>{part}</span>)
}

/* ── photo: concept→query map for accurate targeting (Unsplash, safe) ──────── */
const STOP = new Set(['i','you','we','they','he','she','it','a','an','the','to','do','does','is','are','am','my','your','his','her','our','their','some','please','can','could','would','want','need','have','has','this','that','these','those','of','for','in','on','at','with','and','or','me','one','here','there','how','much','many','what','where','when','who','give','get','put','go','come','will','too','not','no','yes','okay','dont','don'])
// keyword (matched in the phrase) → a precise, modest Unsplash search query
const QMAP: Record<string, string> = {
  wake:'alarm clock morning',bed:'made bed bedroom',shower:'shower bathroom',teeth:'brushing teeth',face:'washing face',
  hair:'combing hair',dress:'folded clothes',breakfast:'breakfast table',coffee:'cup of coffee',tea:'cup of tea',
  dishes:'washing dishes',sweep:'sweeping floor broom',floor:'sweeping floor',carpet:'vacuum cleaner',work:'office desk work',
  school:'school building',tv:'watching television',mirror:'bathroom mirror',towel:'folded towels',soap:'bar of soap',
  razor:'shaving razor',shave:'man shaving',toothpaste:'toothpaste',floss:'dental floss',deodorant:'deodorant',
  hairdryer:'hair dryer',fridge:'open refrigerator',water:'glass of water',boil:'boiling pot water',eggs:'fried eggs pan',
  knife:'kitchen knife',pan:'frying pan',rice:'rice and chicken',sandwich:'sandwich',blender:'kitchen blender',
  stove:'kitchen stove',dishwasher:'dishwasher',vegetables:'cutting vegetables',cafe:'cozy cafe',menu:'restaurant menu',
  cappuccino:'cappuccino',croissant:'croissant',window:'cafe window seat',cake:'slice of cake',bill:'restaurant bill',
  cash:'paying cash money',waiter:'waiter restaurant',table:'restaurant table',chicken:'chicken dish',onions:'onions',
  fish:'fish dish',card:'credit card payment',apples:'apples',oranges:'oranges',bananas:'bananas',grapes:'grapes',
  watermelon:'watermelon',milk:'bottle of milk',cheese:'cheese',butter:'butter',yogurt:'yogurt',bread:'bakery bread',
  beef:'beef meat',pasta:'pasta',sugar:'sugar',flour:'flour baking',potatoes:'potatoes',tomatoes:'fresh tomatoes',
  carrots:'carrots',lettuce:'lettuce',peppers:'bell peppers',cookies:'cookies',groceries:'grocery shopping',
  basket:'shopping basket',dairy:'dairy products',sale:'sale discount tag',bakery:'bakery shop',baguette:'baguette bread',
  donut:'donut',muffin:'muffin',clothes:'clothing store',shoes:'pair of shoes',jacket:'winter jacket',shirt:'folded shirt',
  jeans:'blue jeans',fitting:'clothing store fitting room',discount:'sale tag',laundry:'laundry basket',iron:'ironing clothes',
  blanket:'folded blanket',stain:'stain on shirt',fold:'folded laundry',clinic:'doctor clinic',doctor:'doctor and patient',
  chest:'doctor chest checkup',fever:'fever thermometer',throat:'sore throat',stomach:'stomach ache',dizzy:'dizzy person',
  pharmacy:'pharmacy',pen:'ballpoint pen',book:'open book',library:'library books',teacher:'teacher classroom',
  class:'classroom students',market:'vegetable market',garlic:'garlic',cumin:'spices',olives:'olives',ginger:'ginger root',
  pot:'cooking pot',spoon:'metal spoon',glass:'drinking glass',kettle:'tea kettle',trash:'trash bin',broom:'broom',
  hanger:'clothes hanger',home:'living room home',balcony:'home balcony',flight:'airplane sky',round:'airplane travel',
  passport:'passport',economy:'airplane cabin seats',seat:'airplane window seat',boarding:'boarding pass',airport:'airport terminal',
  ticket:'airplane ticket',hotel:'hotel room',single:'hotel bedroom',wifi:'wifi sign',key:'hotel key card',
  reception:'hotel reception desk',elevator:'elevator',bus:'city bus',taxi:'yellow taxi',train:'train',station:'train station',
  traffic:'city traffic cars',change:'coins money',bank:'bank building',money:'cash money',atm:'atm machine',
  withdraw:'atm money',deposit:'bank deposit',transfer:'money transfer',receipt:'paper receipt',balance:'bank statement',
  account:'bank counter',id:'id card',sandwich2:'',
}
function photoQuery(en: string): string {
  const low = en.toLowerCase()
  const ws = low.replace(/[^a-z\s]/g, ' ').split(/\s+/)
  for (const w of ws) if (QMAP[w]) return QMAP[w]
  for (const k of Object.keys(QMAP)) if (QMAP[k] && low.includes(k)) return QMAP[k]
  const content = ws.filter(w => w && !STOP.has(w))
  return (content.slice(-2).join(' ') || 'daily life').trim()
}
const EMOJI: Record<string, string> = {
  wake:'⏰',bed:'🛏️',shower:'🚿',teeth:'🪥',face:'🧼',hair:'💇',dress:'👕',breakfast:'🍳',coffee:'☕',tea:'🍵',
  dishes:'🍽️',floor:'🧹',work:'💼',school:'🏫',tv:'📺',mirror:'🪞',towel:'🧻',soap:'🧼',razor:'🪒',
  fridge:'🧊',water:'💧',eggs:'🥚',knife:'🔪',pan:'🍳',rice:'🍚',chicken:'🍗',sandwich:'🥪',table:'🍽️',
  cafe:'☕',menu:'📋',cake:'🍰',croissant:'🥐',bill:'🧾',window:'🪟',fish:'🐟',card:'💳',apples:'🍎',milk:'🥛',
  cheese:'🧀',bread:'🍞',onions:'🧅',tomatoes:'🍅',basket:'🧺',bakery:'🥖',donut:'🍩',clothes:'👕',shoes:'👟',
  jacket:'🧥',jeans:'👖',laundry:'🧺',stain:'🧴',doctor:'🩺',fever:'🤒',throat:'🤧',stomach:'🤢',pharmacy:'💊',
  pen:'🖊️',book:'📖',library:'📚',teacher:'🧑‍🏫',market:'🛒',garlic:'🧄',olives:'🫒',pot:'🍲',spoon:'🥄',
  kettle:'🫖',trash:'🗑️',home:'🏠',flight:'✈️',ticket:'🎫',passport:'🛂',airport:'🛫',seat:'💺',hotel:'🏨',
  key:'🔑',bus:'🚌',taxi:'🚕',train:'🚆',bank:'🏦',money:'💵',atm:'🏧',receipt:'🧾',
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
    <div className="relative w-full aspect-[4/3] max-h-[60vh] rounded-[28px] overflow-hidden bg-white flex items-center justify-center
                    shadow-[0_24px_60px_-20px_rgba(120,90,40,0.35)] ring-1 ring-black/5">
      {url === undefined && <Loader2 className="animate-spin text-stone-300" size={46} />}
      {url === null && (
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50 text-[14vw]">{emojiFor(en)}</motion.div>
      )}
      {typeof url === 'string' && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img key={url} src={url} alt={en} onLoad={() => setLoaded(true)} onError={() => setUrl(null)}
          initial={{ scale: 1.05, opacity: 0 }} animate={loaded ? { scale: 1, opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 7, ease: 'easeOut' }} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  )
}

/* ── labelled card ─────────────────────────────────────────── */
function Box({ label, labelAr, rtl, children, accent }: { label: string; labelAr?: string; rtl?: boolean; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl px-[2.2vw] py-[2.2vh] shadow-[0_10px_30px_-16px_rgba(80,60,20,0.25)] ring-1
                    ${accent ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 ring-amber-200' : 'bg-white ring-stone-200/70'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className={`text-[0.85vw] font-bold uppercase tracking-[0.18em] ${accent ? 'text-amber-600' : 'text-stone-400'}`}>{label}</span>
        {labelAr && <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className={`text-[1vw] font-bold ${accent ? 'text-amber-600' : 'text-stone-400'}`}>· {labelAr}</span>}
      </div>
      <div dir={rtl ? 'rtl' : 'ltr'} style={rtl ? { fontFamily: "'Tajawal', sans-serif" } : undefined}>{children}</div>
    </div>
  )
}

function Footer() {
  const Item = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <span className="flex items-center gap-1.5">{icon}{children}</span>
  )
  return (
    <div className="relative z-10 flex items-center justify-center gap-[2vw] px-[3vw] py-[1.6vh] text-[0.92vw] font-semibold text-stone-500
                    border-t border-stone-200/70 bg-white/50 backdrop-blur-sm">
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-600" /> واتساب 0707902091</span>
      <span className="text-stone-300">·</span>
      <Item icon={<Globe size={13} className="text-amber-600" />}>inglizi.com</Item>
      <span className="text-stone-300">·</span>
      <Item icon={<Instagram size={13} className="text-rose-500" />}>@elqasraouihamza</Item>
      <span className="text-stone-300">·</span>
      <Item icon={<Youtube size={13} className="text-red-600" />}>@hamzaelqasraoui</Item>
      <span className="text-stone-300">·</span>
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={13} className="text-stone-600" /> الأستاذ حمزة</span>
    </div>
  )
}

const slideV = {
  enter: { opacity: 0, y: 22 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const, staggerChildren: 0.07, delayChildren: 0.08 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22 } },
}
const item = { enter: { opacity: 0, y: 14 }, center: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

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
    const allEn = vocab.map(v => v.en)
    const out: Slide[] = [{ kind: 'title', title: unitName }]
    vocab.forEach(p => out.push({ kind: 'word', en: p.en, ar: p.ar, others: sample(allEn, 3, p.en) }))
    if (convo.length) out.push({ kind: 'convo', lines: convo })
    expr.forEach(e => out.push({ kind: 'expr', pattern: e.pattern, example: e.example, others: sample(allEn, 3) }))
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

  const s = slides[idx]
  const section = s ? SECTION[s.kind] : null

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden bg-[#faf7f2] text-stone-800">
      <div className="pointer-events-none absolute -top-[20vw] -right-[15vw] w-[45vw] h-[45vw] rounded-full bg-amber-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[20vw] -left-[15vw] w-[42vw] h-[42vw] rounded-full bg-rose-200/20 blur-3xl" />

      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={34} /></div>
      ) : (
        <>
          {/* header: matching rectangles */}
          <div className="relative z-10 flex items-center gap-2.5 px-[3.5vw] pt-[3vh] text-[1.02vw]">
            {unitNo && <span className="px-4 py-2 rounded-2xl bg-stone-900 text-white font-black shadow-sm">{unitNo}</span>}
            <span className="px-4 py-2 rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 font-bold text-stone-800">{unitName}</span>
            {section && <span className="px-4 py-2 rounded-2xl bg-amber-500 text-white font-bold shadow-sm">{section.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{section.ar}</span></span>}
            <span className="ml-auto text-stone-400 font-bold tracking-wide">{String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          </div>

          <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[11%] z-20 cursor-w-resize" aria-label="Previous" />
          <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[11%] z-20 cursor-e-resize" aria-label="Next" />

          <div className="flex-1 flex items-center justify-center px-[5vw] py-[2vh] relative z-10 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div key={idx} variants={slideV} initial="enter" animate="center" exit="exit" className="w-full flex items-center justify-center">

                {s.kind === 'title' && (
                  <div className="text-center">
                    <motion.div variants={item} className="inline-block mb-7 px-6 py-2.5 rounded-full bg-stone-900 text-amber-300 font-bold tracking-[0.22em] text-[1vw]">
                      REALLIFE ENGLISH · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>الإنجليزية للمواقف اليومية</span>
                    </motion.div>
                    <motion.h1 variants={item} className="font-black leading-[1.05] text-[5.2vw] text-stone-900 tracking-tight">{s.title}</motion.h1>
                    {unitNo && <motion.div variants={item} className="mt-5 inline-block px-5 py-1.5 rounded-full bg-amber-500 text-white font-bold text-[1.4vw]">{unitNo}</motion.div>}
                  </div>
                )}

                {s.kind === 'word' && (
                  <div className="grid grid-cols-[1.05fr_1fr] gap-[3.5vw] items-center w-full max-w-[88vw]">
                    <motion.div variants={item}><Photo en={s.en} /></motion.div>
                    <motion.div variants={item} className="space-y-[2.2vh]">
                      <Box label="English"><div className="font-black text-[2.7vw] leading-[1.1] text-stone-900">{s.en}</div></Box>
                      <Box label="Arabic" labelAr="العربية" rtl><div className="font-bold text-[2.3vw] text-stone-700">{s.ar}</div></Box>
                      <Box label="Change the word" labelAr="غيّر الكلمة" accent>
                        <div className="flex flex-wrap gap-2.5">
                          {s.others.map((o, i) => <span key={i} className="px-3.5 py-1.5 rounded-xl bg-white ring-1 ring-amber-200 text-[1.35vw] font-semibold text-stone-700 shadow-sm">{o}</span>)}
                        </div>
                      </Box>
                    </motion.div>
                  </div>
                )}

                {s.kind === 'expr' && (
                  <div className="grid grid-cols-[1.05fr_1fr] gap-[3.5vw] items-center w-full max-w-[88vw]">
                    <motion.div variants={item}><Photo en={s.example || s.pattern} /></motion.div>
                    <motion.div variants={item} className="space-y-[2.2vh]">
                      <Box label="Pattern" labelAr="جملة قابلة للتغيير"><div className="font-black text-[2.4vw] leading-snug text-stone-900">{renderPattern(s.pattern)}</div></Box>
                      {s.example && <Box label="Example" labelAr="مثال"><div className="text-[2vw] text-stone-600 italic">{s.example}</div></Box>}
                      <Box label="Change the word" labelAr="غيّر الكلمة" accent>
                        <div className="flex flex-wrap gap-2.5">
                          {s.others.map((o, i) => <span key={i} className="px-3.5 py-1.5 rounded-xl bg-white ring-1 ring-amber-200 text-[1.25vw] font-semibold text-stone-700 shadow-sm">{o}</span>)}
                        </div>
                      </Box>
                    </motion.div>
                  </div>
                )}

                {s.kind === 'convo' && (
                  <div className="w-full max-w-[68vw] space-y-[1.4vh]">
                    {s.lines.map((l, i) => {
                      const leftSide = i % 2 === 0
                      return (
                        <motion.div key={i} variants={item} className={`flex items-end gap-3 ${leftSide ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                          <span className={`shrink-0 w-[2.6vw] h-[2.6vw] rounded-full flex items-center justify-center text-[1vw] font-black text-white shadow-sm
                            ${leftSide ? 'bg-stone-400' : 'bg-amber-500'}`}>{l.who.charAt(0)}</span>
                          <div className={`max-w-[60%] rounded-3xl px-[1.6vw] py-[1.2vh] text-[1.5vw] leading-snug shadow-[0_8px_24px_-16px_rgba(0,0,0,0.4)]
                            ${leftSide ? 'bg-white text-stone-800 rounded-bl-md' : 'bg-amber-500 text-white rounded-br-md'}`}>
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
                    <motion.div variants={item} className="font-black text-[3.2vw] text-stone-900">Great job!</motion.div>
                    <motion.div variants={item} dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="text-stone-500 text-[1.7vw] mt-2 font-bold">أحسنت — نهاية الدرس</motion.div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between px-[4vw] pb-[1.2vh] relative z-10">
            <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronLeft size={26} /></button>
            <div className="flex gap-1.5 items-center">
              {slides.map((_, i) => (<span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-amber-500' : 'w-1.5 bg-stone-300'}`} />))}
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronRight size={26} /></button>
          </div>

          <Footer />
        </>
      )}
    </div>
  )
}
