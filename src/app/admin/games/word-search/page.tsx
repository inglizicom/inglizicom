'use client'

import { useMemo, useState } from 'react'
import { generateWordSearch } from '@/lib/game-generators'
import {
  ColorPicker, DEFAULT_COLORS, Field, GamesHeader, INP, PrintSheet, SheetTitle, TEXTAREA, type GameColors,
} from '../_shared'

const SAMPLE = 'apple\nbread\nmilk\negg\nrice\nchicken\nwater\nfruit\nvegetables'

/**
 * /admin/games/word-search — paste a unit's English vocabulary, one word
 * per line, get a hidden-word grid sized to fit them all. Algorithm lives in
 * lib/game-generators.ts; this page is just the form + printable sheet.
 */
export default function WordSearchPage() {
  const [title, setTitle] = useState('البحث عن الكلمات')
  const [unit, setUnit] = useState('الوحدة 7 — السوبرماركت')
  const [raw, setRaw] = useState(SAMPLE)
  const [seed, setSeed] = useState(1)
  const [colors, setColors] = useState<GameColors>(DEFAULT_COLORS)

  const words = useMemo(() => raw.split(/\r?\n/).map(w => w.trim()).filter(Boolean), [raw])
  const result = useMemo(() => (words.length ? generateWordSearch(words, { seed }) : null), [words, seed])

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
      <GamesHeader title="البحث عن الكلمات" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4 print:hidden">
          <Field label="عنوان الصفحة"><input value={title} onChange={e => setTitle(e.target.value)} className={INP} /></Field>
          <Field label="اسم الوحدة (اختياري)"><input value={unit} onChange={e => setUnit(e.target.value)} className={INP} /></Field>
          <Field label="الكلمات (كلمة في كل سطر)" hint={`${words.length} كلمة`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={12} dir="ltr" className={TEXTAREA} />
          </Field>
          <ColorPicker value={colors} onChange={setColors} />
          <button type="button" onClick={() => setSeed(s => s + 1)}
            className="w-full rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
            🔀 ترتيب جديد لنفس الكلمات
          </button>
          {result && result.unplaced.length > 0 && (
            <p className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              لم تتسع الشبكة لـ: {result.unplaced.join('، ')} — قلّل عدد الكلمات أو اختصرها.
            </p>
          )}
        </div>

        <div>
          {!result ? (
            <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل كلمة واحدة على الأقل.</div>
          ) : (
            <PrintSheet filename={`word-search-${unit || 'unit'}`} colors={colors}>
              <SheetTitle title={title} unit={unit} colors={colors} />
              <div className="flex justify-center">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${result.size}, 1fr)` }} dir="ltr">
                  {result.grid.map((row, r) => row.map((ch, c) => (
                    <div key={`${r}-${c}`} className="w-8 h-8 flex items-center justify-center text-[15px] font-bold rounded"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>{ch}</div>
                  )))}
                </div>
              </div>
              <div className="mt-8" dir="ltr">
                <div className="text-center text-[13px] font-extrabold mb-2 opacity-80" style={{ color: colors.accent }}>FIND THESE WORDS</div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-[14px] font-bold">
                  {result.placed.map(p => <span key={p.word}>{p.word}</span>)}
                </div>
              </div>
            </PrintSheet>
          )}
        </div>
      </div>
    </div>
  )
}
