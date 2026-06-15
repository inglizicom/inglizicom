'use client'

/**
 * /admin/present/[moduleId] — full-screen teaching deck for recording video lessons.
 * Builds slides live from the unit's DB content (vocab table, conversation, expressions),
 * so it always matches the published course. Renders as a fixed overlay above the admin
 * chrome → clean for screen-recording. Navigate with ← → / Space, or click the side zones.
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchLessons, type LmsLesson } from '@/lib/lms'

type VocabPair = { en: string; ar: string }
type Slide =
  | { kind: 'title'; title: string }
  | { kind: 'vocab'; pairs: VocabPair[] }
  | { kind: 'convo'; lines: { who: string; text: string }[] }
  | { kind: 'expr'; items: { pattern: string; example: string }[] }
  | { kind: 'end' }

function parseVocab(content: string | null | undefined): VocabPair[] {
  if (!content) return []
  return content.split('\n')
    .filter(l => l.trim().startsWith('|'))
    .map(l => l.split('|').map(s => s.trim()))
    .filter(p => p.length >= 4 && p[1] && p[1] !== 'English' && !/^-+$/.test(p[1]) && p[2])
    .map(p => ({ en: p[1], ar: p[2] }))
}

function parseConvo(reading: string | null | undefined): { who: string; text: string }[] {
  if (!reading) return []
  return reading.split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('**'))
    .map(l => {
      const m = l.match(/^\*\*(.+?):\*\*\s*(.*)$/)
      return m ? { who: m[1], text: m[2].replace(/\*/g, '') } : null
    })
    .filter((x): x is { who: string; text: string } => !!x)
}

function parseExpr(content: string | null | undefined): { pattern: string; example: string }[] {
  if (!content) return []
  return content.split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => {
      const body = l.replace(/^-\s*/, '')
      const [pat, ex] = body.split(' — ')
      return { pattern: (pat || '').replace(/\*\*/g, ''), example: (ex || '').replace(/\*/g, '') }
    })
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

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
      setTitle(mod?.title ?? 'Unit')
      setReading(mod?.reading_text ?? null)
      setLessons(ls)
      setLoading(false)
    })()
  }, [moduleId])

  const slides = useMemo<Slide[]>(() => {
    const vocabLesson = lessons.find(l => l.lesson_order === 1)
    const exprLesson = lessons.find(l => l.lesson_order === 2)
    const out: Slide[] = [{ kind: 'title', title }]
    const pairs = parseVocab(vocabLesson?.content)
    chunk(pairs, 6).forEach(c => out.push({ kind: 'vocab', pairs: c }))
    const convo = parseConvo(reading)
    if (convo.length) out.push({ kind: 'convo', lines: convo })
    const expr = parseExpr(exprLesson?.content)
    if (expr.length) out.push({ kind: 'expr', items: expr })
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
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  const s = slides[idx]

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1208] text-white flex flex-col select-none">
      {loading || !s ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>
      ) : (
        <>
          {/* click zones */}
          <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-1/4 z-10 cursor-w-resize" aria-label="Previous" />
          <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-1/4 z-10 cursor-e-resize" aria-label="Next" />

          <div className="flex-1 flex items-center justify-center px-[8vw] py-[6vh]">
            {s.kind === 'title' && (
              <div className="text-center">
                <div className="text-yellow-400 font-black tracking-widest text-[2vw] mb-6">REALLIFE ENGLISH · الإنجليزية للمواقف اليومية</div>
                <h1 className="font-black leading-tight text-[5vw]">{s.title}</h1>
              </div>
            )}

            {s.kind === 'vocab' && (
              <div className="w-full grid grid-cols-2 gap-[2vw]">
                {s.pairs.map((p, i) => (
                  <div key={i} className="bg-white/[0.06] rounded-2xl px-[2.5vw] py-[2.2vh] flex items-center justify-between gap-6 border border-white/10">
                    <span className="font-bold text-[2.2vw]">{p.en}</span>
                    <span dir="rtl" className="text-yellow-300 text-[2vw]">{p.ar}</span>
                  </div>
                ))}
              </div>
            )}

            {s.kind === 'convo' && (
              <div className="w-full max-w-[80vw] space-y-[2vh]">
                {s.lines.map((l, i) => (
                  <div key={i} className="flex gap-4 text-[2.1vw] leading-snug">
                    <span className="text-yellow-400 font-bold whitespace-nowrap">{l.who}:</span>
                    <span>{l.text}</span>
                  </div>
                ))}
              </div>
            )}

            {s.kind === 'expr' && (
              <div className="w-full max-w-[80vw] space-y-[3vh]">
                {s.items.map((it, i) => (
                  <div key={i}>
                    <div className="font-black text-yellow-400 text-[2.4vw]">{it.pattern}</div>
                    {it.example && <div className="text-white/80 text-[2vw] mt-1">{it.example}</div>}
                  </div>
                ))}
              </div>
            )}

            {s.kind === 'end' && (
              <div className="text-center">
                <div className="text-[6vw] mb-4">🎉</div>
                <div className="font-black text-[3vw]">Great job!</div>
                <div className="text-white/60 text-[1.6vw] mt-2">أحسنت — نهاية الدرس</div>
              </div>
            )}
          </div>

          {/* footer: progress + controls */}
          <div className="flex items-center justify-between px-[4vw] py-[3vh]">
            <button onClick={() => go(-1)} disabled={idx === 0} className="opacity-70 hover:opacity-100 disabled:opacity-20"><ChevronLeft size={28} /></button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-yellow-400' : 'w-1.5 bg-white/25'}`} />
              ))}
            </div>
            <button onClick={() => go(1)} disabled={idx === last} className="opacity-70 hover:opacity-100 disabled:opacity-20"><ChevronRight size={28} /></button>
          </div>
        </>
      )}
    </div>
  )
}
