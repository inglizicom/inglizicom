'use client'

/**
 * /admin/present/[moduleId] — full-screen teaching deck for recording video lessons.
 * One phrase per slide, each with a real photo (picture-based learning), soft palette,
 * and animated transitions (framer-motion). Built live from the unit's DB content so it
 * always matches the published course. Navigate with ← → / Space or the side click-zones.
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchLessons, type LmsLesson } from '@/lib/lms'

type VocabPair = { en: string; ar: string }
type Slide =
  | { kind: 'title'; title: string }
  | { kind: 'word'; en: string; ar: string }
  | { kind: 'convo'; lines: { who: string; text: string }[] }
  | { kind: 'expr'; pattern: string; example: string }
  | { kind: 'end' }

/* ── content parsers (markdown → data) ─────────────────────── */
function parseVocab(content?: string | null): VocabPair[] {
  if (!content) return []
  return content.split('\n')
    .filter(l => l.trim().startsWith('|'))
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

/* ── photo keyword + stable URL ────────────────────────────── */
const STOP = new Set(['i','you','we','they','he','she','it','a','an','the','to','do','does','is','are','am','my','your','his','her','our','their','some','please','can','could','would','want','need','have','has','this','that','these','those','of','for','in','on','at','with','and','or','me','one','here','there','how','much','many','what','where','when','who','give','get','take','make','put','go','come','will','too','not','no','yes','okay','it’s','dont','don'])
function photoQuery(en: string): string {
  const words = en.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w))
  return (words.slice(-2).join(',') || en.replace(/[^a-z\s]/gi, '').trim() || 'english').trim()
}
function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) % 9999 }
function photoUrl(en: string): string {
  return `https://loremflickr.com/720/520/${encodeURIComponent(photoQuery(en))}?lock=${hash(en)}`
}

function Photo({ en }: { en: string }) {
  const [state, setState] = useState<'load' | 'ok' | 'err'>('load')
  const src = useMemo(() => photoUrl(en), [en])
  return (
    <div className="relative w-[42vw] max-w-[560px] aspect-[7/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-300/60 ring-1 ring-black/5 bg-stone-100">
      {state !== 'ok' && (
        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
          {state === 'err' ? <ImageOff size={48} /> : <Loader2 className="animate-spin" size={40} />}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        key={src} src={src} alt={en}
        onLoad={() => setState('ok')} onError={() => setState('err')}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={state === 'ok' ? { scale: 1, opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 6, ease: 'easeOut' }}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

/* ── animation presets ─────────────────────────────────────── */
const slideV = {
  enter: { opacity: 0, y: 24, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' as const } },
}
const stagger = { center: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
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

  const slides = useMemo<Slide[]>(() => {
    const vocab = parseVocab(lessons.find(l => l.lesson_order === 1)?.content)
    const expr = parseExpr(lessons.find(l => l.lesson_order === 2)?.content)
    const convo = parseConvo(reading)
    const out: Slide[] = [{ kind: 'title', title }]
    vocab.forEach(p => out.push({ kind: 'word', en: p.en, ar: p.ar }))   // one phrase per slide
    if (convo.length) out.push({ kind: 'convo', lines: convo })
    expr.forEach(e => out.push({ kind: 'expr', pattern: e.pattern, example: e.example }))
    out.push({ kind: 'end' })
    return out
  }, [lessons, reading, title])

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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden
                    bg-gradient-to-br from-[#fdfcfa] via-[#f8f4ee] to-[#f1ece3] text-stone-800">
      {/* soft ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[40vw] h-[40vw] rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[38vw] h-[38vw] rounded-full bg-rose-200/25 blur-3xl" />

      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={34} /></div>
      ) : (
        <>
          <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-1/4 z-20 cursor-w-resize" aria-label="Previous" />
          <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-1/4 z-20 cursor-e-resize" aria-label="Next" />

          <div className="flex-1 flex items-center justify-center px-[6vw] py-[5vh] relative z-10">
            <AnimatePresence mode="wait">
              <motion.div key={idx} variants={slideV} initial="enter" animate="center" exit="exit" className="w-full flex items-center justify-center">

                {s.kind === 'title' && (
                  <motion.div variants={stagger} initial="enter" animate="center" className="text-center">
                    <motion.div variants={item} className="inline-block mb-6 px-5 py-2 rounded-full bg-amber-100 text-amber-700 font-bold tracking-widest text-[1.1vw]">
                      REALLIFE ENGLISH · الإنجليزية للمواقف اليومية
                    </motion.div>
                    <motion.h1 variants={item} className="font-black leading-tight text-[4.6vw] text-stone-800">{s.title}</motion.h1>
                  </motion.div>
                )}

                {s.kind === 'word' && (
                  <motion.div variants={stagger} initial="enter" animate="center" className="flex items-center gap-[5vw]">
                    <motion.div variants={item}><Photo en={s.en} /></motion.div>
                    <motion.div variants={item} className="max-w-[38vw]">
                      <div className="font-black text-[3.4vw] leading-tight text-stone-800">{s.en}</div>
                      <div className="mt-[2vh] h-[3px] w-[6vw] rounded-full bg-amber-400/70" />
                      <div dir="rtl" className="mt-[2vh] text-[2.8vw] text-amber-700/90 font-semibold">{s.ar}</div>
                    </motion.div>
                  </motion.div>
                )}

                {s.kind === 'convo' && (
                  <motion.div variants={stagger} initial="enter" animate="center" className="w-full max-w-[72vw] space-y-[1.6vh]">
                    {s.lines.map((l, i) => {
                      const left = i % 2 === 0
                      return (
                        <motion.div key={i} variants={item} className={`flex ${left ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[60%] rounded-3xl px-[2vw] py-[1.6vh] text-[1.7vw] shadow-sm
                            ${left ? 'bg-white text-stone-800 rounded-tl-lg' : 'bg-amber-500 text-white rounded-tr-lg'}`}>
                            <span className={`block text-[1vw] font-bold mb-1 ${left ? 'text-amber-600' : 'text-white/80'}`}>{l.who}</span>
                            {l.text}
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

                {s.kind === 'expr' && (
                  <motion.div variants={stagger} initial="enter" animate="center" className="text-center max-w-[70vw]">
                    <motion.div variants={item} className="inline-block mb-[3vh] px-4 py-1.5 rounded-full bg-stone-200/70 text-stone-500 font-bold text-[1vw] tracking-wide">USEFUL PATTERN</motion.div>
                    <motion.div variants={item} className="font-black text-[3.2vw] text-stone-800 leading-tight">{s.pattern}</motion.div>
                    {s.example && <motion.div variants={item} className="mt-[2.5vh] text-[2.2vw] text-amber-700/90 italic">{s.example}</motion.div>}
                  </motion.div>
                )}

                {s.kind === 'end' && (
                  <motion.div variants={stagger} initial="enter" animate="center" className="text-center">
                    <motion.div variants={item} className="text-[6vw] mb-2">🎉</motion.div>
                    <motion.div variants={item} className="font-black text-[3vw] text-stone-800">Great job!</motion.div>
                    <motion.div variants={item} className="text-stone-500 text-[1.6vw] mt-2">أحسنت — نهاية الدرس</motion.div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-[4vw] py-[3vh] relative z-10">
            <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition"><ChevronLeft size={28} /></button>
            <div className="flex gap-1.5 items-center">
              {slides.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-7 bg-amber-500' : 'w-1.5 bg-stone-300'}`} />
              ))}
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition"><ChevronRight size={28} /></button>
          </div>
        </>
      )}
    </div>
  )
}
