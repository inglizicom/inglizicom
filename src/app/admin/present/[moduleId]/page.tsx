'use client'

/**
 * /admin/present/[moduleId] — full-screen teaching deck for recording video lessons.
 * Template (per the sketch): header rectangles [Unit № · title · section], a BIG
 * picture, then three boxes — English expression, Arabic translation, and the
 * changeable words (variations from the same unit) so learners understand → apply
 * the variation in one place. Footer carries the brand/contact strip.
 * Built live from the unit's DB content. Navigate ← → / Space / side-click.
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
      ? <span key={i} className="inline-block mx-2 px-4 py-1 rounded-xl bg-amber-400 text-white align-middle">{part}</span>
      : <span key={i}>{part}</span>)
}

/* ── picture: modest Unsplash photo (content_filter=high) + emoji fallback ── */
const STOP = new Set(['i','you','we','they','he','she','it','a','an','the','to','do','does','is','are','am','my','your','his','her','our','their','some','please','can','could','would','want','need','have','has','this','that','these','those','of','for','in','on','at','with','and','or','me','one','here','there','how','much','many','what','where','when','who','give','get','put','go','come','will','too','not','no','yes','okay','dont','don'])
function photoQuery(en: string): string {
  const words = en.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w))
  return (words.slice(-2).join(' ') || 'english').trim()
}
const EMOJI: Record<string, string> = {
  wake:'⏰',bed:'🛏️',shower:'🚿',teeth:'🪥',face:'🧼',hair:'💇',dress:'👕',breakfast:'🍳',coffee:'☕',tea:'🍵',
  dishes:'🍽️',floor:'🧹',carpet:'🧹',work:'💼',school:'🏫',tv:'📺',mirror:'🪞',towel:'🧻',soap:'🧼',razor:'🪒',
  fridge:'🧊',water:'💧',eggs:'🥚',knife:'🔪',pan:'🍳',rice:'🍚',chicken:'🍗',sandwich:'🥪',blender:'🍹',table:'🍽️',
  cafe:'☕',menu:'📋',cake:'🍰',croissant:'🥐',bill:'🧾',waiter:'🧑‍🍳',window:'🪟',restaurant:'🍽️',fish:'🐟',card:'💳',
  apples:'🍎',oranges:'🍊',bananas:'🍌',grapes:'🍇',milk:'🥛',cheese:'🧀',butter:'🧈',bread:'🍞',onions:'🧅',tomatoes:'🍅',
  basket:'🧺',sale:'🏷️',bakery:'🥖',baguette:'🥖',donut:'🍩',clothes:'👕',shoes:'👟',jacket:'🧥','t-shirt':'👕',jeans:'👖',
  laundry:'🧺',iron:'🧺',stain:'🧴',clinic:'🩺',doctor:'🩺',fever:'🤒',pain:'🤕',dizzy:'😵',throat:'🤧',stomach:'🤢',
  pharmacy:'💊',pen:'🖊️',book:'📖',library:'📚',teacher:'🧑‍🏫',class:'🏫',market:'🛒',garlic:'🧄',cumin:'🌿',olives:'🫒',
  pot:'🍲',spoon:'🥄',glass:'🥛',kettle:'🫖','trash bin':'🗑️',home:'🏠',balcony:'🪟',flight:'✈️',ticket:'🎫',
  passport:'🛂',airport:'🛫',seat:'💺',hotel:'🏨',room:'🛏️',key:'🔑',bus:'🚌',taxi:'🚕',train:'🚆',station:'🚉',
  bank:'🏦',money:'💵',atm:'🏧',receipt:'🧾',balance:'⚖️',account:'🏦',
}
function emojiFor(en: string): string {
  const ws = en.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
  for (const w of ws) if (EMOJI[w]) return EMOJI[w]
  for (const k of Object.keys(EMOJI)) if (en.toLowerCase().includes(k)) return EMOJI[k]
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
    <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-300/60 ring-1 ring-black/5 bg-white flex items-center justify-center">
      {url === undefined && <Loader2 className="animate-spin text-stone-300" size={44} />}
      {url === null && (
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50 text-[15vw]">{emojiFor(en)}</motion.div>
      )}
      {typeof url === 'string' && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img key={url} src={url} alt={en} onLoad={() => setLoaded(true)} onError={() => setUrl(null)}
          initial={{ scale: 1.06, opacity: 0 }} animate={loaded ? { scale: 1, opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 6, ease: 'easeOut' }} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  )
}

/* ── reusable labelled box ─────────────────────────────────── */
function Box({ label, labelAr, rtl, children, accent }: { label: string; labelAr?: string; rtl?: boolean; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl px-[2vw] py-[2vh] shadow-sm ring-1 ${accent ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-black/5'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[0.95vw] font-black tracking-wide ${accent ? 'text-amber-600' : 'text-stone-400'}`}>{label}</span>
        {labelAr && <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className={`text-[0.95vw] font-bold ${accent ? 'text-amber-500' : 'text-stone-300'}`}>{labelAr}</span>}
      </div>
      <div dir={rtl ? 'rtl' : 'ltr'} style={rtl ? { fontFamily: "'Tajawal', sans-serif" } : undefined}>{children}</div>
    </div>
  )
}

function Footer() {
  return (
    <div className="relative z-10 flex items-center justify-center gap-[2.5vw] px-[3vw] py-[1.8vh] text-[0.95vw] font-semibold text-stone-500 border-t border-stone-200/70 bg-white/40 backdrop-blur-sm">
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><Phone size={14} className="text-green-600" /> واتساب 0707902091</span>
      <span className="flex items-center gap-1.5"><Globe size={14} className="text-amber-600" /> inglizi.com</span>
      <span className="flex items-center gap-1.5"><Instagram size={14} className="text-rose-500" /> @elqasraouihamza</span>
      <span className="flex items-center gap-1.5"><Youtube size={14} className="text-red-600" /> @hamzaelqasraoui</span>
      <span dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="flex items-center gap-1.5"><GraduationCap size={14} className="text-stone-600" /> الأستاذ حمزة</span>
    </div>
  )
}

/* ── animations ────────────────────────────────────────────── */
const slideV = {
  enter: { opacity: 0, y: 22 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const, staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.25 } },
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
         className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden
                    bg-gradient-to-br from-[#fdfcfa] via-[#f8f4ee] to-[#f1ece3] text-stone-800">
      <div className="pointer-events-none absolute -top-40 -right-40 w-[40vw] h-[40vw] rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[38vw] h-[38vw] rounded-full bg-rose-200/25 blur-3xl" />

      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={34} /></div>
      ) : (
        <>
          {/* header: matching rectangles */}
          <div className="relative z-10 flex items-center gap-2.5 px-[3vw] pt-[2.5vh] text-[1.05vw]">
            {unitNo && <span className="px-4 py-1.5 rounded-xl bg-stone-800 text-white font-black">{unitNo}</span>}
            <span className="px-4 py-1.5 rounded-xl bg-white shadow-sm ring-1 ring-black/5 font-bold text-stone-700">{unitName}</span>
            {section && <span className="px-4 py-1.5 rounded-xl bg-amber-100 text-amber-700 font-bold">{section.en} · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{section.ar}</span></span>}
            <span className="ml-auto text-stone-400 font-semibold">{idx + 1} / {slides.length}</span>
          </div>

          <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[12%] z-20 cursor-w-resize" aria-label="Previous" />
          <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[12%] z-20 cursor-e-resize" aria-label="Next" />

          <div className="flex-1 flex items-center justify-center px-[5vw] py-[2vh] relative z-10 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div key={idx} variants={slideV} initial="enter" animate="center" exit="exit" className="w-full flex items-center justify-center">

                {s.kind === 'title' && (
                  <div className="text-center">
                    <motion.div variants={item} className="inline-block mb-6 px-5 py-2 rounded-full bg-amber-100 text-amber-700 font-bold tracking-widest text-[1.1vw]">
                      REALLIFE ENGLISH · الإنجليزية للمواقف اليومية
                    </motion.div>
                    <motion.h1 variants={item} className="font-black leading-tight text-[5vw] text-stone-800">{s.title}</motion.h1>
                    {unitNo && <motion.div variants={item} className="mt-4 text-stone-400 font-bold text-[1.6vw]">{unitNo}</motion.div>}
                  </div>
                )}

                {s.kind === 'word' && (
                  <div className="grid grid-cols-2 gap-[3vw] items-center w-full max-w-[86vw]">
                    <motion.div variants={item}><Photo en={s.en} /></motion.div>
                    <motion.div variants={item} className="space-y-[2vh]">
                      <Box label="ENGLISH"><div className="font-black text-[2.6vw] leading-tight text-stone-800">{s.en}</div></Box>
                      <Box label="ARABIC" labelAr="العربية" rtl><div className="font-bold text-[2.2vw] text-amber-700/90">{s.ar}</div></Box>
                      <Box label="CHANGE THE WORD" labelAr="غيّر الكلمة" accent>
                        <div className="flex flex-wrap gap-2">
                          {s.others.map((o, i) => <span key={i} className="px-3 py-1 rounded-lg bg-white ring-1 ring-amber-200 text-[1.4vw] font-semibold text-stone-700">{o}</span>)}
                        </div>
                      </Box>
                    </motion.div>
                  </div>
                )}

                {s.kind === 'expr' && (
                  <div className="grid grid-cols-2 gap-[3vw] items-center w-full max-w-[86vw]">
                    <motion.div variants={item}><Photo en={s.example || s.pattern} /></motion.div>
                    <motion.div variants={item} className="space-y-[2vh]">
                      <Box label="PATTERN" labelAr="جملة قابلة للتغيير"><div className="font-black text-[2.3vw] leading-snug text-stone-800">{renderPattern(s.pattern)}</div></Box>
                      {s.example && <Box label="EXAMPLE" labelAr="مثال"><div className="text-[2vw] text-amber-700/90 italic">{s.example}</div></Box>}
                      <Box label="CHANGE THE WORD" labelAr="غيّر الكلمة" accent>
                        <div className="flex flex-wrap gap-2">
                          {s.others.map((o, i) => <span key={i} className="px-3 py-1 rounded-lg bg-white ring-1 ring-amber-200 text-[1.3vw] font-semibold text-stone-700">{o}</span>)}
                        </div>
                      </Box>
                    </motion.div>
                  </div>
                )}

                {s.kind === 'convo' && (
                  <div className="w-full max-w-[70vw] space-y-[1.3vh]">
                    {s.lines.map((l, i) => {
                      const leftSide = i % 2 === 0
                      return (
                        <motion.div key={i} variants={item} className={`flex ${leftSide ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[64%] rounded-3xl px-[1.6vw] py-[1.2vh] text-[1.5vw] shadow-sm
                            ${leftSide ? 'bg-white text-stone-800 rounded-tl-md' : 'bg-amber-500 text-white rounded-tr-md'}`}>
                            <span className={`block text-[0.9vw] font-bold mb-0.5 ${leftSide ? 'text-amber-600' : 'text-white/80'}`}>{l.who}</span>
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
                    <motion.div variants={item} className="font-black text-[3vw] text-stone-800">Great job!</motion.div>
                    <motion.div variants={item} dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="text-stone-500 text-[1.6vw] mt-2">أحسنت — نهاية الدرس</motion.div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* progress dots */}
          <div className="flex items-center justify-between px-[4vw] pb-[1.2vh] relative z-10">
            <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition"><ChevronLeft size={26} /></button>
            <div className="flex gap-1.5 items-center">
              {slides.map((_, i) => (<span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-7 bg-amber-500' : 'w-1.5 bg-stone-300'}`} />))}
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition"><ChevronRight size={26} /></button>
          </div>

          <Footer />
        </>
      )}
    </div>
  )
}
