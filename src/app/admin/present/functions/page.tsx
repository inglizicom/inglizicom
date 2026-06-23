'use client'

/**
 * /admin/present/functions — a teaching deck for the A1/A2 Language Functions
 * (opinions · agreeing/disagreeing · suggestions · likes & preferences). Same
 * brand language as the unit decks. Content from src/data/functions.ts.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowLeft, Pencil } from 'lucide-react'
import { fetchFunctions, type LangFunction } from '@/lib/functions'

const DARK = '#2a1d12'
const CREAM = '#faf6ef'

export default function FunctionsDeck() {
  const [funcs, setFuncs] = useState<LangFunction[]>([])
  const [idx, setIdx] = useState(0)
  useEffect(() => { fetchFunctions().then(setFuncs) }, [])
  const fn = funcs[idx]
  const last = funcs.length - 1
  const go = useCallback((d: number) => setIdx(i => Math.min(last, Math.max(0, i + d))), [last])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!fn) return (
    <div style={{ background: CREAM, color: DARK }} className="fixed inset-0 z-[100] flex items-center justify-center font-black">…</div>
  )

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif", background: CREAM, color: DARK }} className="fixed inset-0 z-[100] flex flex-col select-none overflow-hidden">
      <div className="pointer-events-none absolute -top-[20vw] -right-[15vw] w-[45vw] h-[45vw] rounded-full bg-yellow-200/30 blur-3xl" />

      {/* header */}
      <div className="relative z-30 flex items-center justify-center gap-2 px-[3vw] pt-[2.6vh]">
        <Link href="/admin/present" className="absolute left-[3vw] top-[2.6vh] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition text-[0.9vw] font-bold"><ArrowLeft size={15} /> الديكات</Link>
        <Link href="/admin/present/functions/edit" className="absolute right-[3vw] top-[2.6vh] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-stone-100 transition text-[0.9vw] font-bold"><Pencil size={14} /> تعديل</Link>
        <span className="px-3.5 py-1.5 rounded-xl text-white font-black" style={{ background: DARK }}>Language Functions · <span style={{ fontFamily: "'Tajawal', sans-serif" }}>وظائف اللغة</span></span>
        <span className="px-3.5 py-1.5 rounded-xl font-black text-[#2a1d12]" style={{ background: '#facc15' }}>{idx + 1} / {funcs.length}</span>
      </div>

      {/* side-click nav */}
      <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-[10%] z-20 cursor-w-resize" aria-label="Previous" />
      <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-[10%] z-20 cursor-e-resize" aria-label="Next" />

      <div className="flex-1 flex items-center justify-center px-[6vw] py-[2vh] relative z-10 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={fn.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}
            className="w-full max-w-[90vw] flex flex-col items-center gap-[3vh]">
            {/* title */}
            <div className="text-center">
              <div className="text-[4vw] leading-none mb-1">{fn.emoji}</div>
              <h1 className="font-black tracking-tight" style={{ color: DARK, fontSize: '3.2vw' }}>{fn.title}</h1>
              <div dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.8vw' }}>{fn.ar}</div>
              <div dir="rtl" className="mt-1 font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>{fn.intro}</div>
            </div>

            {/* groups */}
            <div className="grid grid-cols-2 gap-[2vw] w-full">
              {fn.groups.map((g, gi) => (
                <div key={gi} className="rounded-3xl bg-white ring-1 ring-stone-200 shadow-[0_14px_36px_-24px_rgba(42,29,18,0.5)] p-[1.8vw]">
                  <div className="flex items-center gap-2 mb-[1.4vh]">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#facc15' }} />
                    <span className="font-black uppercase tracking-wide" style={{ color: '#a16207', fontSize: '1vw' }}>{g.label}</span>
                    <span dir="rtl" className="font-bold text-stone-400" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>· {g.ar}</span>
                  </div>
                  <div className="space-y-[1vh]">
                    {g.lines.map((l, li) => (
                      <div key={li} dir="ltr" className="flex items-center justify-between gap-[1vw] rounded-2xl bg-amber-50/60 ring-1 ring-amber-100 px-[1.2vw] py-[0.9vh]">
                        <span className="font-black" style={{ color: DARK, fontSize: '1.35vw' }}>{l.en}</span>
                        <span dir="rtl" className="font-bold text-stone-500" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.2vw' }}>{l.ar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* example mini-dialogues */}
            <div className="w-full flex flex-col gap-[1.2vh]">
              <div dir="rtl" className="font-black text-stone-500 text-center" style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '1.1vw' }}>أمثلة · Examples</div>
              {fn.examples.map((ex, ei) => (
                <div key={ei} dir="ltr" className="flex flex-wrap items-center justify-center gap-[1vw]">
                  <span className="rounded-2xl bg-white ring-1 ring-stone-200 px-[1.4vw] py-[1vh] font-bold" style={{ color: DARK, fontSize: '1.25vw' }}>{ex.q.en}</span>
                  <ChevronRight size={18} className="text-stone-300" />
                  <span className="rounded-2xl px-[1.4vw] py-[1vh] font-black text-[#2a1d12]" style={{ background: '#facc15', fontSize: '1.25vw' }}>{ex.a.en}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer nav */}
      <div className="flex items-center justify-between px-[4vw] pb-[2.5vh] relative z-10">
        <button onClick={() => go(-1)} disabled={idx === 0} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronLeft size={26} /></button>
        <div className="flex gap-1.5 items-center">
          {funcs.map((_, i) => (<span key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === idx ? 32 : 6, background: i === idx ? '#facc15' : '#d6d3d1' }} />))}
        </div>
        <button onClick={() => go(1)} disabled={idx === last} className="text-stone-300 hover:text-stone-700 disabled:opacity-0 transition"><ChevronRight size={26} /></button>
      </div>
    </div>
  )
}
