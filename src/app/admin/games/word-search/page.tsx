'use client'

import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { generateWordSearch, type Difficulty } from '@/lib/game-generators'
import { EVERYDAY_ENGLISH } from '@/data/workbook/everyday-english'
import {
  A4Page, Field, GamesHeader, HeadFields, PrintAllButton, TEXTAREA, THEMES, ThemePicker, WordSearchBody, headMeta,
  type SheetHead, type SheetTheme,
} from '../_shared'

/**
 * /admin/games/word-search — one word-search page for any course: paste
 * "word = meaning" lines (or load a unit of the book and edit), print it.
 * The algorithm is lib/game-generators.ts; the page frame is _shared.tsx.
 */
const u1 = EVERYDAY_ENGLISH[0]
const toText = (ws: { en: string; ar: string }[]) => ws.map(w => `${w.en} = ${w.ar}`).join('\n')

export default function WordSearchPage() {
  const [head, setHead] = useState<SheetHead>({ unitNo: '1', titleEn: u1.titleEn, titleAr: u1.titleAr })
  const [raw, setRaw] = useState(toText(u1.words))
  const [diff, setDiff] = useState<Difficulty>('medium')
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [seed, setSeed] = useState(1)

  const words = useMemo(() => raw.split(/\r?\n/).map(l => {
    const [en, ar] = l.split('=')
    return { en: (en ?? '').trim(), ar: (ar ?? '').trim() || undefined }
  }).filter(w => /^[A-Za-z][A-Za-z-]*$/.test(w.en)), [raw])
  const result = useMemo(() => (words.length ? generateWordSearch(words.map(w => w.en), { seed, difficulty: diff, size: 12 }) : null), [words, seed, diff])

  function loadUnit(n: number) {
    const u = EVERYDAY_ENGLISH.find(x => x.n === n)!
    setHead({ unitNo: String(n), titleEn: u.titleEn, titleAr: u.titleAr }); setRaw(toText(u.words))
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="البحث عن الكلمات" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden">
          <HeadFields head={head} onHead={setHead} onLoadUnit={loadUnit} units={EVERYDAY_ENGLISH} />
          <Field label="الكلمات (كلمة = معنى، في كل سطر)" hint={`${words.length} كلمة · كلمة واحدة بالإنجليزية في كل سطر، والأفضل 10 إلى 12`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={12} dir="ltr" className={TEXTAREA} />
          </Field>
          <Field label="الصعوبة">
            <select value={diff} onChange={e => setDiff(e.target.value as Difficulty)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] bg-white">
              <option value="easy">سهل — أفقي وعمودي</option>
              <option value="medium">متوسط — + قطري</option>
              <option value="hard">صعب — كل الاتجاهات</option>
            </select>
          </Field>
          <ThemePicker value={theme} onChange={setTheme} />
          <div className="flex flex-col gap-2">
            <PrintAllButton count={2} />
            <button type="button" onClick={() => setSeed(s => s + 1)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              <Shuffle size={15} /> شبكة جديدة لنفس الكلمات
            </button>
          </div>
          {result && result.unplaced.length > 0 && (
            <p className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">لم تتسع الشبكة لـ: {result.unplaced.join('، ')}</p>
          )}
        </aside>

        <div className="space-y-8 min-w-0">
          {!result ? <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل كلمة إنجليزية واحدة على الأقل.</div> : (
            <>
              <A4Page meta={headMeta(head, theme, `word-search-${head.unitNo || 'custom'}`)} section="search" sectionNo={1} score={result.placed.length}
                instructionAr={`ابحث عن الكلمات (${result.placed.length}) في الشبكة، ثم ضع علامة ✓ أمام كل كلمة تجدها.`}
                instructionEn={`Find the ${result.placed.length} words.`}>
                <WordSearchBody result={result} words={words} theme={theme} />
              </A4Page>
              <A4Page meta={headMeta(head, theme, `word-search-${head.unitNo || 'custom'}`)} section="search" sectionNo={1} answerKey
                instructionAr="الكلمات الملوّنة هي الأجوبة." instructionEn="The highlighted letters are the answers.">
                <WordSearchBody result={result} words={words} theme={theme} answerKey />
              </A4Page>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
