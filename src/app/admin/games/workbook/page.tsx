'use client'

import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import {
  generateMatchingSet, generateScrambleSet, generateWordSearch, type Difficulty,
} from '@/lib/game-generators'
import { EVERYDAY_ENGLISH, type WorkbookUnit } from '@/data/workbook/everyday-english'
import {
  A4Page, Field, GamesHeader, INP, MatchBody, OrderBody, PrintAllButton, THEMES, ThemePicker, WordSearchBody,
  type PageMeta, type SheetTheme,
} from '../_shared'

/**
 * /admin/games/workbook — the book's exercise pages, generated per unit (or
 * all 19 at once) from data/workbook/everyday-english.ts: word search, words
 * in order, matching, and their answer keys gathered at the end like a real
 * workbook. Same seed → same puzzles, so a printed page can be reproduced;
 * "new mix" changes every puzzle.
 */

type Kind = 'search' | 'order' | 'match'
const KINDS: { id: Kind; label: string }[] = [
  { id: 'search', label: 'البحث عن الكلمات' },
  { id: 'order',  label: 'رتّب الكلمات' },
  { id: 'match',  label: 'صِل الكلمة بمعناها' },
]
const DIFFS: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'easy',   label: 'سهل',   hint: 'أفقي وعمودي فقط' },
  { id: 'medium', label: 'متوسط', hint: '+ قطري' },
  { id: 'hard',   label: 'صعب',   hint: 'كل الاتجاهات ومعكوسة' },
]

interface Built { unit: WorkbookUnit; search: ReturnType<typeof generateWordSearch>; order: ReturnType<typeof generateScrambleSet>; match: ReturnType<typeof generateMatchingSet> }

export default function WorkbookPage() {
  const [unitSel, setUnitSel] = useState<number | 'all'>(1)
  const [kinds, setKinds] = useState<Record<Kind, boolean>>({ search: true, order: true, match: true })
  const [keys, setKeys] = useState(true)
  const [diff, setDiff] = useState<Difficulty>('medium')
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [numbered, setNumbered] = useState(false)
  const [startNo, setStartNo] = useState(1)
  const [mix, setMix] = useState(0)

  const units = unitSel === 'all' ? EVERYDAY_ENGLISH : EVERYDAY_ENGLISH.filter(u => u.n === unitSel)

  const built: Built[] = useMemo(() => units.map(u => {
    const seed = u.n * 1009 + mix * 7919
    return {
      unit: u,
      search: generateWordSearch(u.words.map(w => w.en), { seed, difficulty: diff, size: 12 }),
      order: generateScrambleSet(u.phrases, seed),
      match: generateMatchingSet(u.words.slice(0, 10), seed),
    }
  }), [units, diff, mix])

  /* Exercise pages unit by unit, then every answer key at the end. */
  const pages: { kind: Kind; key: boolean; b: Built }[] = []
  for (const b of built) for (const k of KINDS) if (kinds[k.id]) pages.push({ kind: k.id, key: false, b })
  if (keys) for (const b of built) for (const k of KINDS) if (kinds[k.id]) pages.push({ kind: k.id, key: true, b })

  const meta = (b: Built, i: number): PageMeta => ({
    theme, unitNo: b.unit.n, unitEn: b.unit.titleEn, unitAr: b.unit.titleAr,
    pageNo: numbered ? startNo + i : null, filename: `unit-${b.unit.n}`,
  })

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="دفتر التمارين — الإنجليزية للمواقف اليومية" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="الوحدة">
            <select value={unitSel} onChange={e => setUnitSel(e.target.value === 'all' ? 'all' : Number(e.target.value))} className={INP}>
              {EVERYDAY_ENGLISH.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
              <option value="all">كل الوحدات (19)</option>
            </select>
          </Field>

          <Field label="التمارين">
            <div className="space-y-1.5">
              {KINDS.map(k => (
                <label key={k.id} className="flex items-center gap-2 text-[13px] font-bold text-zinc-700">
                  <input type="checkbox" checked={kinds[k.id]} onChange={e => setKinds(s => ({ ...s, [k.id]: e.target.checked }))} className="w-4 h-4 accent-zinc-900" />
                  {k.label}
                </label>
              ))}
              <label className="flex items-center gap-2 text-[13px] font-bold text-zinc-700 pt-1 border-t border-zinc-100">
                <input type="checkbox" checked={keys} onChange={e => setKeys(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                مفاتيح الحل (في آخر الدفتر)
              </label>
            </div>
          </Field>

          <Field label="صعوبة البحث عن الكلمات">
            <div className="grid grid-cols-3 gap-1">
              {DIFFS.map(d => (
                <button key={d.id} type="button" onClick={() => setDiff(d.id)} title={d.hint}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${diff === d.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11.5px] text-zinc-400">{DIFFS.find(d => d.id === diff)!.hint}</p>
          </Field>

          <ThemePicker value={theme} onChange={setTheme} />

          <Field label="ترقيم الصفحات">
            <label className="flex items-center gap-2 text-[13px] font-bold text-zinc-700">
              <input type="checkbox" checked={numbered} onChange={e => setNumbered(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
              أضف رقم الصفحة في التذييل
            </label>
            {numbered && (
              <div className="mt-2 flex items-center gap-2 text-[12.5px] font-bold text-zinc-600">
                يبدأ من <input type="number" min={1} value={startNo} onChange={e => setStartNo(Math.max(1, Number(e.target.value) || 1))} className={`${INP} w-24`} />
              </div>
            )}
          </Field>

          <div className="flex flex-col gap-2 pt-1">
            <PrintAllButton count={pages.length} />
            <button type="button" onClick={() => setMix(m => m + 1)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              <Shuffle size={15} /> خلط جديد لكل التمارين
            </button>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          {pages.length === 0 && <div className="text-center py-16 text-zinc-400 text-[13.5px]">اختر تمرينًا واحدًا على الأقل.</div>}
          {pages.map((p, i) => {
            const m = meta(p.b, i)
            if (p.kind === 'search') return (
              <A4Page key={`${p.b.unit.n}-s-${p.key}`} meta={m} section="search" sectionNo={1} answerKey={p.key} score={12}
                instructionAr="ابحث عن الكلمات الاثنتي عشرة في الشبكة، ثم ضع علامة ✓ أمام كل كلمة تجدها."
                instructionEn={diff === 'easy' ? 'Find the 12 words. They go → and ↓.' : diff === 'medium' ? 'Find the 12 words. They go →, ↓ and ↘.' : 'Find the 12 words — in every direction, even backwards.'}>
                <WordSearchBody result={p.b.search} words={p.b.unit.words} theme={theme} answerKey={p.key} />
              </A4Page>
            )
            if (p.kind === 'order') return (
              <A4Page key={`${p.b.unit.n}-o-${p.key}`} meta={m} section="order" sectionNo={2} answerKey={p.key} score={p.b.order.length}
                instructionAr="رتّب الكلمات لتكوّن عبارة صحيحة من الوحدة، واكتبها على السطر."
                instructionEn="Put the words in order and write the sentence.">
                <OrderBody items={p.b.order} theme={theme} answerKey={p.key} />
              </A4Page>
            )
            return (
              <A4Page key={`${p.b.unit.n}-m-${p.key}`} meta={m} section="match" sectionNo={3} answerKey={p.key} score={10}
                instructionAr="صِل كل كلمة إنجليزية بمعناها بالعربية بخط، ثم اكتب الحرف المناسب في الأسفل."
                instructionEn="Draw a line from each word to its meaning, then write the letter.">
                <MatchBody set={p.b.match} theme={theme} answerKey={p.key} />
              </A4Page>
            )
          })}
        </div>
      </div>
    </div>
  )
}
