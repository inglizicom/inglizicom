'use client'

import { useMemo, useState } from 'react'
import { PARTS, STOPS } from '@/data/viiza-book'
import { buildViizaWorkbook, type WorkPage } from '@/data/viiza-workbook'
import { Field, GamesHeader, INP, PrintAllButton } from '../games/_shared'
import { SeriesCover } from '../level2-book/_cover'
import { ViizaBackCover } from '../level2-book/_back'
import { WorkbookPage } from './_work'

/**
 * /admin/level2-workbook — VIIZA ENGLISH, Workbook: the practice of the
 * travel guide (src/data/viiza-workbook), two pages a stop and a review
 * closing each part, between the series' workbook front cover and its own
 * back cover. The grammar workbook this route printed before is still in
 * src/data/level2-workbook.
 */

type View = 'book' | 'end' | number

const pad = (n: number) => String(n).padStart(3, '0')

export default function ViizaWorkbookPage() {
  const [view, setView] = useState<View>('book')
  const book = useMemo(buildViizaWorkbook, [])

  const inView = (p: WorkPage) => {
    if (view === 'book') return true
    if (view === 'end') return p.kind === 'key'
    if ('stop' in p) return STOPS[p.stop - 1].part === view
    return p.kind === 'review' && p.part === view
  }
  const shown = book.pages.map((p, i) => ({ p, no: i + 1 })).filter(x => inView(x.p))
  const withCovers = view === 'book'

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="VIIZA ENGLISH — كتاب التمارين: دليل السفر" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${STOPS.length} محطة · ${book.pages.length + 2} صفحة مع الغلافين.`}>
            <select value={String(view)} onChange={e => setView(['book', 'end'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              {PARTS.map(p => <option key={p.n} value={p.n}>الجزء {p.n} — {p.titleAr}</option>)}
              <option value="end">الأجوبة</option>
            </select>
          </Field>
          <PrintAllButton count={shown.length + (withCovers ? 2 : 0)} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withCovers && <SeriesCover series="viiza" book="workbook" side="front" filename="viiza-wb-000-cover" />}
          {shown.map(({ p, no }) => (
            <WorkbookPage key={no} page={p} pageNo={no} book={book}
              filename={`viiza-wb-${pad(no)}-${'stop' in p ? `stop-${String(p.stop).padStart(2, '0')}-${p.kind}` : p.kind === 'review' ? `review-${p.part}` : p.kind}`} />
          ))}
          {withCovers && <ViizaBackCover book="workbook" filename="viiza-wb-999-back-cover" />}
        </div>
      </div>
    </div>
  )
}
