'use client'

import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { generateScrambleSet } from '@/lib/game-generators'
import { EVERYDAY_ENGLISH } from '@/data/workbook/everyday-english'
import {
  A4Page, Field, GamesHeader, HeadFields, OrderBody, PrintAllButton, TEXTAREA, THEMES, ThemePicker, headMeta,
  type SheetHead, type SheetTheme,
} from '../_shared'

/**
 * /admin/games/scramble — "words in order" for any course: one complete
 * sentence per line (or a book unit's expressions), each shown as shuffled
 * word chips with a line to write on, plus its answer key page.
 */
const u1 = EVERYDAY_ENGLISH[0]

export default function ScramblePage() {
  const [head, setHead] = useState<SheetHead>({ unitNo: '1', titleEn: u1.titleEn, titleAr: u1.titleAr })
  const [raw, setRaw] = useState(u1.phrases.join('\n'))
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [seed, setSeed] = useState(1)

  const sentences = useMemo(() => raw.split(/\r?\n/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 2).slice(0, 10), [raw])
  const items = useMemo(() => generateScrambleSet(sentences, seed), [sentences, seed])

  function loadUnit(n: number) {
    const u = EVERYDAY_ENGLISH.find(x => x.n === n)!
    setHead({ unitNo: String(n), titleEn: u.titleEn, titleAr: u.titleAr }); setRaw(u.phrases.join('\n'))
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="رتّب الكلمات" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden">
          <HeadFields head={head} onHead={setHead} onLoadUnit={loadUnit} units={EVERYDAY_ENGLISH} />
          <Field label="الجمل (جملة كاملة في كل سطر)" hint={`${sentences.length} جملة · حتى 10 في الصفحة، والأفضل 8`}>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10} dir="ltr" className={TEXTAREA} />
          </Field>
          <ThemePicker value={theme} onChange={setTheme} />
          <div className="flex flex-col gap-2">
            <PrintAllButton count={2} />
            <button type="button" onClick={() => setSeed(s => s + 1)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              <Shuffle size={15} /> بعثرة جديدة
            </button>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          {items.length === 0 ? <div className="text-center py-16 text-zinc-400 text-[13.5px]">أدخل جملة واحدة على الأقل.</div> : (
            <>
              <A4Page meta={headMeta(head, theme, `words-in-order-${head.unitNo || 'custom'}`)} section="order" sectionNo={2} score={items.length}
                instructionAr="رتّب الكلمات لتكوّن عبارة صحيحة، واكتبها على السطر." instructionEn="Put the words in order and write the sentence.">
                <OrderBody items={items} theme={theme} />
              </A4Page>
              <A4Page meta={headMeta(head, theme, `words-in-order-${head.unitNo || 'custom'}`)} section="order" sectionNo={2} answerKey
                instructionAr="العبارات الصحيحة." instructionEn="The correct sentences.">
                <OrderBody items={items} theme={theme} answerKey />
              </A4Page>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
