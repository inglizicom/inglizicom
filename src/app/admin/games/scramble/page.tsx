'use client'

import { useMemo, useState } from 'react'
import { generateScrambleSet } from '@/lib/game-generators'
import {
  ColorPicker, DEFAULT_COLORS, Field, GamesHeader, INP, PrintSheet, SheetTitle, TEXTAREA, type GameColors,
} from '../_shared'

const SAMPLE = 'I put on my shoes every morning\nShe orders a coffee with milk\nCan I pay by card\nWhere is the nearest pharmacy\nHe takes the bus to work'

/**
 * /admin/games/scramble — one full sentence/chunk per line; each becomes a
 * row of shuffled word-boxes for the student to reorder, plus an answer key
 * they can reveal (or print separately — it's its own sheet below).
 */
export default function ScramblePage() {
  const [title, setTitle] = useState('رتّب الجملة')
  const [unit, setUnit] = useState('الوحدة 1 — الروتين الصباحي')
  const [raw, setRaw] = useState(SAMPLE)
  const [seed, setSeed] = useState(1)
  const [showKey, setShowKey] = useState(false)
  const [colors, setColors] = useState<GameColors>(DEFAULT_COLORS)

  const sentences = useMemo(() => raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean), [raw])
  const items = useMemo(() => (sentences.length ? generateScrambleSet(sentences, seed) : []), [sentences, seed])

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1200px] mx-auto">
      <GamesHeader title="ترتيب الجملة" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4 print:hidden">
          <Field label="عنوان الصفحة"><input value={title} onChange={e => setTitle(e.target.value)} className={INP} /></Field>
          <Field label="اسم الوحدة (اختياري)"><input value={unit} onChange={e => setUnit(e.target.value)} className={INP} /></Field>
          <Field label="الجمل (جملة كاملة في كل سطر)" hint={`${sentences.length} جملة`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10} dir="ltr" className={TEXTAREA} />
          </Field>
          <ColorPicker value={colors} onChange={setColors} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setSeed(s => s + 1)}
              className="flex-1 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              🔀 بعثرة جديدة
            </button>
            <button type="button" onClick={() => setShowKey(v => !v)}
              className={`flex-1 rounded-xl border text-[13px] font-bold py-2.5 ${showKey ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}>
              {showKey ? 'إخفاء مفتاح الحل' : 'عرض مفتاح الحل'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل جملة واحدة على الأقل.</div>
          ) : (
            <PrintSheet filename={`scramble-${unit || 'unit'}`} colors={colors}>
              <SheetTitle title={title} unit={unit} colors={colors} />
              <div className="space-y-6 max-w-[620px] mx-auto" dir="ltr">
                {items.map((it, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {it.scrambled.map((w, j) => (
                        <span key={j} className="px-3 py-1.5 rounded-lg text-[14px] font-bold"
                          style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${colors.accent}66` }}>
                          {w}
                        </span>
                      ))}
                    </div>
                    <div className="border-b pb-1" style={{ borderColor: `${colors.accent}55` }}>
                      <span className="text-[11px] font-bold opacity-50 mr-2">{i + 1}.</span>
                    </div>
                  </div>
                ))}
              </div>
            </PrintSheet>
          )}

          {showKey && items.length > 0 && (
            <PrintSheet filename={`scramble-answers-${unit || 'unit'}`} colors={colors}>
              <SheetTitle title={`${title} — مفتاح الحل`} unit={unit} colors={colors} />
              <div className="space-y-2.5 max-w-[620px] mx-auto text-[15px] font-bold" dir="ltr">
                {items.map((it, i) => <div key={i}><span className="opacity-50 mr-2">{i + 1}.</span>{it.original}</div>)}
              </div>
            </PrintSheet>
          )}
        </div>
      </div>
    </div>
  )
}
