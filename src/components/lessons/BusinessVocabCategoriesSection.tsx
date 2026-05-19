'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { VocabCategory } from '@/data/private-lessons/types'

type Section = {
  kind: 'vocabCategories'
  title?: string
  categories: VocabCategory[]
}

const CAT_PALETTE = [
  { ring: 'ring-amber-400',   dot: 'bg-amber-500',   chip: 'bg-amber-50 text-amber-800 border-amber-200',   underline: 'from-amber-400 to-amber-600',   text: 'text-amber-700' },
  { ring: 'ring-sky-400',     dot: 'bg-sky-500',     chip: 'bg-sky-50 text-sky-800 border-sky-200',         underline: 'from-sky-400 to-sky-600',       text: 'text-sky-700' },
  { ring: 'ring-emerald-400', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200', underline: 'from-emerald-400 to-emerald-600', text: 'text-emerald-700' },
  { ring: 'ring-violet-400',  dot: 'bg-violet-500',  chip: 'bg-violet-50 text-violet-800 border-violet-200',   underline: 'from-violet-400 to-violet-600',   text: 'text-violet-700' },
  { ring: 'ring-rose-400',    dot: 'bg-rose-500',    chip: 'bg-rose-50 text-rose-800 border-rose-200',         underline: 'from-rose-400 to-rose-600',       text: 'text-rose-700' },
]

const palette = (i: number) => CAT_PALETTE[i % CAT_PALETTE.length]

function singleLineSize(text: string): string {
  const len = text.length
  if (len <= 22) return 'text-5xl sm:text-6xl md:text-7xl'
  if (len <= 32) return 'text-4xl sm:text-5xl md:text-6xl'
  if (len <= 48) return 'text-3xl sm:text-4xl md:text-5xl'
  if (len <= 70) return 'text-2xl sm:text-3xl md:text-4xl'
  return 'text-xl sm:text-2xl md:text-3xl'
}

export default function BusinessVocabCategoriesSection({
  section,
  step,
}: {
  section: Section
  step: number
}) {
  const flat = flattenStep(section.categories, step)

  return (
    <div
      className="flex-1 flex flex-col px-4 md:px-8 max-w-7xl mx-auto w-full py-6 relative"
      style={{
        backgroundImage:
          'radial-gradient(rgba(15,23,42,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* ── Section header ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white text-lg font-black shadow-md shadow-amber-200">💼</div>
          <div>
            <div className="text-[10px] font-black tracking-[0.3em] text-amber-700 uppercase">Business English · Vocabulary</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900" dir="rtl">{section.title || 'المفردات المهنية'}</h2>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-widest">
          <span>STEP {step}</span>
          <span>/</span>
          <span>{totalSteps(section.categories)}</span>
        </div>
      </motion.header>

      {/* ── Focused area ─────────────────────────────────────────── */}
      <div className="mb-6 min-h-[260px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Category divider card */}
          {flat?.type === 'catTitle' && (() => {
            const cat = section.categories[flat.catIdx]
            const p = palette(flat.catIdx)
            return (
              <motion.div
                key={`cat-${flat.catIdx}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-center w-full max-w-2xl"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${p.chip} text-[10px] font-black tracking-[0.2em] uppercase`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`}></span>
                  Section {flat.catIdx + 1} of {section.categories.length}
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">{cat.name}</h3>
                <p className="text-xl md:text-2xl font-bold text-slate-500 mt-1" dir="rtl">{cat.nameAr}</p>
                <div className={`mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r ${p.underline}`}></div>
              </motion.div>
            )
          })()}

          {/* Focused expression — premium "memo card" */}
          {flat?.type === 'item' && (() => {
            const cat = section.categories[flat.catIdx]
            const it = cat.items[flat.itemIdx]
            const p = palette(flat.catIdx)
            return (
              <motion.article
                key={`item-${flat.catIdx}-${flat.itemIdx}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-4xl relative"
              >
                {/* Background card — layered look */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-[0_30px_60px_-20px_rgba(15,23,42,0.20)] rotate-[-0.4deg]"></div>
                <div className="absolute inset-0 bg-white rounded-3xl shadow-[0_18px_40px_-12px_rgba(15,23,42,0.10)] rotate-[0.6deg]"></div>

                {/* Main card */}
                <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden">
                  {/* Top accent bar with category color */}
                  <div className={`h-1.5 bg-gradient-to-r ${p.underline}`}></div>

                  {/* Header strip */}
                  <div className="flex items-center justify-between px-6 md:px-8 pt-5">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${p.chip} text-[10px] font-black tracking-[0.2em] uppercase`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`}></span>
                      {cat.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest text-slate-400">PHRASE</span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {String(flat.itemIdx + 1).padStart(2, '0')} / {String(cat.items.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* English expression — center stage */}
                  <div className="px-6 md:px-12 pt-6 pb-2 text-center">
                    <div
                      className={`${singleLineSize(it.en)} font-black text-slate-900 leading-tight tracking-tight`}
                      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                    >
                      {it.en}
                    </div>
                    <div className={`mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r ${p.underline}`}></div>
                  </div>

                  {/* Arabic translation */}
                  <div className="px-6 md:px-12 py-4 text-center">
                    <div className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-1.5">
                      Translation · الترجمة
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-700 leading-relaxed" dir="rtl">
                      {it.ar}
                    </p>
                  </div>

                  {/* Examples — like notes on a notepad */}
                  {it.examples && it.examples.length > 0 && (
                    <div className={`mx-6 md:mx-10 mb-6 mt-3 p-4 md:p-5 rounded-xl border-l-4 bg-slate-50/70 ${p.text.replace('text', 'border-l')} border-l-current`}>
                      <div className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-2">
                        In context · أمثلة استخدام
                      </div>
                      <ul className="space-y-1.5">
                        {it.examples.map((ex, i) => (
                          <li key={i} className="flex items-start gap-2 text-base md:text-lg text-slate-700 font-medium italic">
                            <span className={`mt-2 inline-block w-1.5 h-1.5 rounded-full ${p.dot} flex-shrink-0`}></span>
                            <span>“{ex}”</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer note */}
                  {it.note && (
                    <div className="px-6 md:px-10 pb-5 -mt-1">
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 font-medium" dir="rtl">
                        📌 {it.note}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            )
          })()}

          {/* Idle / pre-step intro */}
          {!flat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-2xl"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                Business Vocabulary
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-3">
                {totalItems(section.categories)} professional expressions
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-bold" dir="rtl">
                {section.title || 'تعابير مهنية للعمل والاجتماعات'}
              </p>
              <div className="mt-10 inline-flex items-center gap-2 text-sm text-slate-500">
                <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">Space</kbd>
                <span dir="rtl">للبدء</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Overview ledger ─────────────────────────────────────── */}
      <div className="space-y-3">
        {section.categories.map((cat, ci) => {
          const p = palette(ci)
          const visible = visibleItemsInCategory(section.categories, step, ci)
          const isActive = flat?.catIdx === ci
          return (
            <motion.section
              key={ci}
              initial={{ opacity: 0 }}
              animate={{ opacity: visible > 0 || isActive ? 1 : 0.35 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden"
            >
              <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg ${p.chip} border flex items-center justify-center text-[10px] font-black tracking-wider`}>
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-black text-slate-900">{cat.name}</span>
                  <span className="text-xs text-slate-500 font-bold" dir="rtl">· {cat.nameAr}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {visible}/{cat.items.length}
                </span>
              </header>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
                {cat.items.map((it, ii) => {
                  const v = ii < visible
                  const focused = flat?.type === 'item' && flat.catIdx === ci && flat.itemIdx === ii
                  return (
                    <div
                      key={ii}
                      className={`p-2.5 text-xs transition-all ${
                        focused
                          ? `bg-white ring-2 ${p.ring} -m-px z-10 relative shadow-md`
                          : v
                          ? 'bg-white hover:bg-slate-50'
                          : 'bg-slate-50/40 text-slate-300'
                      }`}
                    >
                      <div className={`font-bold leading-snug ${v ? 'text-slate-900' : 'text-slate-300'}`}>
                        {v ? it.en : '·····'}
                      </div>
                      <div className={`text-[10px] mt-0.5 leading-snug ${v ? 'text-slate-500' : 'text-slate-300'}`} dir="rtl">
                        {v ? it.ar : '·····'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}

// ── Step utilities (mirrors VocabCategoriesSection's flattening) ──
function flattenStep(
  categories: VocabCategory[],
  step: number
): { type: 'catTitle'; catIdx: number } | { type: 'item'; catIdx: number; itemIdx: number } | null {
  if (step === 0) return null
  let cursor = 0
  for (let ci = 0; ci < categories.length; ci++) {
    cursor += 1
    if (cursor === step) return { type: 'catTitle', catIdx: ci }
    for (let ii = 0; ii < categories[ci].items.length; ii++) {
      cursor += 1
      if (cursor === step) return { type: 'item', catIdx: ci, itemIdx: ii }
    }
  }
  return null
}
function visibleItemsInCategory(categories: VocabCategory[], step: number, catIdx: number): number {
  let cursor = 0
  for (let ci = 0; ci < categories.length; ci++) {
    cursor += 1
    let visible = 0
    for (let ii = 0; ii < categories[ci].items.length; ii++) {
      cursor += 1
      if (cursor <= step) visible = ii + 1
    }
    if (ci === catIdx) return visible
  }
  return 0
}
function totalSteps(categories: VocabCategory[]): number {
  return categories.reduce((acc, c) => acc + 1 + c.items.length, 0)
}
function totalItems(categories: VocabCategory[]): number {
  return categories.reduce((acc, c) => acc + c.items.length, 0)
}
