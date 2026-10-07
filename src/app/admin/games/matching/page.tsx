'use client'

import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { generateMatchingSet, type WordPair } from '@/lib/game-generators'
import { EVERYDAY_ENGLISH } from '@/data/workbook/everyday-english'
import {
  A4Page, Field, GamesHeader, HeadFields, MatchBody, PrintAllButton, TEXTAREA, THEMES, ThemePicker, headMeta,
  type SheetHead, type SheetTheme,
} from '../_shared'

/**
 * /admin/games/matching — "draw a line to the meaning" for any course:
 * English in order on the left, Arabic shuffled on the right, letter boxes
 * to fill in, and the answer key page. (No bingo: a printed workbook is done
 * alone, and bingo is a classroom game.)
 */
const u1 = EVERYDAY_ENGLISH[0]
const toText = (ws: { en: string; ar: string }[]) => ws.slice(0, 10).map(w => `${w.en} = ${w.ar}`).join('\n')

export default function MatchingPage() {
  const [head, setHead] = useState<SheetHead>({ unitNo: '1', titleEn: u1.titleEn, titleAr: u1.titleAr })
  const [raw, setRaw] = useState(toText(u1.words))
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [seed, setSeed] = useState(1)

  const pairs = useMemo(() => raw.split(/\r?\n/).map(l => {
    const [en, ar] = l.split('=')
    return en?.trim() && ar?.trim() ? { en: en.trim(), ar: ar.trim() } : null
  }).filter((p): p is WordPair => !!p).slice(0, 10), [raw])
  const set = useMemo(() => generateMatchingSet(pairs, seed), [pairs, seed])

  function loadUnit(n: number) {
    const u = EVERYDAY_ENGLISH.find(x => x.n === n)!
    setHead({ unitNo: String(n), titleEn: u.titleEn, titleAr: u.titleAr }); setRaw(toText(u.words))
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="صِل الكلمة بمعناها" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden">
          <HeadFields head={head} onHead={setHead} onLoadUnit={loadUnit} units={EVERYDAY_ENGLISH} />
          <Field label="الأزواج (إنجليزي = عربي، في كل سطر)" hint={`${pairs.length} زوج · حتى 10 في الصفحة`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10} className={TEXTAREA} />
          </Field>
          <ThemePicker value={theme} onChange={setTheme} />
          <div className="flex flex-col gap-2">
            <PrintAllButton count={2} />
            <button type="button" onClick={() => setSeed(s => s + 1)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              <Shuffle size={15} /> خلط جديد
            </button>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          {pairs.length < 2 ? <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل زوجين على الأقل (إنجليزي = عربي).</div> : (
            <>
              <A4Page meta={headMeta(head, theme, `matching-${head.unitNo || 'custom'}`)} section="match" sectionNo={3} score={pairs.length}
                instructionAr="صِل كل كلمة بمعناها بخط، ثم اكتب الحرف المناسب في الأسفل." instructionEn="Draw a line from each word to its meaning, then write the letter.">
                <MatchBody set={set} theme={theme} />
              </A4Page>
              <A4Page meta={headMeta(head, theme, `matching-${head.unitNo || 'custom'}`)} section="match" sectionNo={3} answerKey
                instructionAr="الأجوبة الصحيحة." instructionEn="The correct answers.">
                <MatchBody set={set} theme={theme} answerKey />
              </A4Page>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
