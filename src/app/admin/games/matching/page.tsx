'use client'

import { useMemo, useState } from 'react'
import { generateBingoCards, generateMatchingSet, type WordPair } from '@/lib/game-generators'
import {
  ColorPicker, DEFAULT_COLORS, Field, GamesHeader, INP, PrintSheet, SheetTitle, TEXTAREA, type GameColors,
} from '../_shared'

const SAMPLE = [
  'bread, خبز', 'milk, حليب', 'egg, بيضة', 'rice, أرز', 'chicken, دجاج', 'fruit, فواكه',
  'vegetables, خضروات', 'water, ماء', 'cart, عربة التسوق', 'basket, سلة', 'aisle, ممر', 'shelf, رف',
  'cashier, أمين الصندوق', 'receipt, وصل', 'checkout, الدفع', 'bag, كيس',
].join('\n')

/** "bread, خبز" per line → { en: 'bread', ar: 'خبز' }, silently skipping bad lines. */
function parsePairs(raw: string): WordPair[] {
  return raw.split(/\r?\n/).map(line => {
    const [en, ar] = line.split(',')
    return en && ar ? { en: en.trim(), ar: ar.trim() } : null
  }).filter((p): p is WordPair => !!p)
}

/**
 * /admin/games/matching — one word list, two printable games: a cut-and-
 * match sheet (English in order, Arabic shuffled) or several shuffled bingo
 * cards (English only, for calling out loud in class).
 */
export default function MatchingPage() {
  const [mode, setMode] = useState<'matching' | 'bingo'>('matching')
  const [title, setTitle] = useState('توصيل الكلمات')
  const [unit, setUnit] = useState('الوحدة 7 — السوبرماركت')
  const [raw, setRaw] = useState(SAMPLE)
  const [cardCount, setCardCount] = useState(2)
  const [gridSize, setGridSize] = useState(4)
  const [seed, setSeed] = useState(1)
  const [colors, setColors] = useState<GameColors>(DEFAULT_COLORS)

  const pairs = useMemo(() => parsePairs(raw), [raw])
  const words = useMemo(() => pairs.map(p => p.en), [pairs])
  const matching = useMemo(() => (mode === 'matching' && pairs.length ? generateMatchingSet(pairs, seed) : null), [mode, pairs, seed])
  const need = gridSize * gridSize
  const bingoError = mode === 'bingo' && words.length < need
    ? `يلزم ${need} كلمة على الأقل لبطاقة ${gridSize}×${gridSize} (المتوفر: ${words.length})` : null
  const cards = useMemo(() => (mode === 'bingo' && !bingoError ? generateBingoCards(words, cardCount, gridSize, seed) : null),
    [mode, words, cardCount, gridSize, seed, bingoError])

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
      <GamesHeader title="التوصيل والبينغو" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4 print:hidden">
          <div className="flex gap-1.5">
            {([['matching', 'توصيل'], ['bingo', 'بينغو']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setMode(id)}
                className={`flex-1 rounded-xl border py-2 text-[13px] font-bold ${mode === id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label="عنوان الصفحة"><input value={title} onChange={e => setTitle(e.target.value)} className={INP} /></Field>
          <Field label="اسم الوحدة (اختياري)"><input value={unit} onChange={e => setUnit(e.target.value)} className={INP} /></Field>
          <Field label="الكلمات (إنجليزي, عربي — في كل سطر)" hint={`${pairs.length} زوج`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10} className={TEXTAREA} />
          </Field>
          {mode === 'bingo' && (
            <>
              <Field label="حجم البطاقة">
                <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className={INP}>
                  {[3, 4, 5].map(n => <option key={n} value={n}>{n} × {n}</option>)}
                </select>
              </Field>
              <Field label="عدد البطاقات (لكل طالب بطاقة مختلفة)">
                <input type="number" min={1} max={10} value={cardCount} onChange={e => setCardCount(Math.max(1, Math.min(10, Number(e.target.value))))} className={INP} />
              </Field>
            </>
          )}
          <ColorPicker value={colors} onChange={setColors} />
          <button type="button" onClick={() => setSeed(s => s + 1)}
            className="w-full rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
            🔀 خلط جديد
          </button>
          {bingoError && <p className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{bingoError}</p>}
        </div>

        <div className="space-y-6">
          {mode === 'matching' && matching && (
            <PrintSheet filename={`matching-${unit || 'unit'}`} colors={colors}>
              <SheetTitle title={title} unit={unit} colors={colors} />
              <div className="grid grid-cols-2 gap-x-10 gap-y-3 max-w-[560px] mx-auto text-[16px] font-bold">
                <div>{matching.left.map(l => (
                  <div key={l.id} className="flex items-center gap-2 py-1.5" dir="ltr">
                    <span className="opacity-60">{l.id + 1}.</span>{l.text}
                  </div>
                ))}</div>
                <div dir="rtl">{matching.right.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <span className="opacity-60">{String.fromCharCode(65 + i)}.</span>{r.text}
                  </div>
                ))}</div>
              </div>
            </PrintSheet>
          )}

          {mode === 'bingo' && cards && cards.map((card, i) => (
            <PrintSheet key={i} filename={`bingo-${unit || 'unit'}-${i + 1}`} colors={colors}>
              <SheetTitle title={`${title} — بطاقة ${i + 1}`} unit={unit} colors={colors} />
              <div className="grid gap-2 max-w-[480px] mx-auto" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }} dir="ltr">
                {card.flat().map((w, j) => (
                  <div key={j} className="aspect-square flex items-center justify-center text-center text-[13px] font-bold rounded-xl px-1"
                    style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${colors.accent}55` }}>
                    {w.toUpperCase()}
                  </div>
                ))}
              </div>
            </PrintSheet>
          ))}

          {mode === 'matching' && !matching && <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل زوجًا واحدًا على الأقل (إنجليزي, عربي).</div>}
          {mode === 'bingo' && bingoError && (
            <div className="text-center py-16 text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl text-[13.5px] font-bold px-6">
              {bingoError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
