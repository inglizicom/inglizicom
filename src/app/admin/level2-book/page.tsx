'use client'

import { useMemo, useState } from 'react'
import { buildViizaBook, PARTS, STOPS, stopOf, type ViizaPage } from '@/data/viiza-book'
import { Field, GamesHeader, INP, PrintAllButton } from '../games/_shared'
import { SeriesCover } from './_cover'
import { StopPage } from './_stop'
import { MatterPage } from './_matter'
import { ViizaBackCover } from './_back'

/**
 * /admin/level2-book — VIIZA ENGLISH, Student's Book: the travel guide
 * (src/data/viiza-book). One journey from the visa form to the front door at
 * home, in six parts and their stops, four pages each, between the series
 * covers. The grammar course that this route printed before still feeds the
 * VIIZA workbook and vocabulary pages (src/data/level2-book).
 */

type View = 'book' | 'front' | 'end' | `part-${number}` | number

const pad = (n: number) => String(n).padStart(3, '0')

export default function ViizaBookPage() {
  const [view, setView] = useState<View>('book')
  const book = useMemo(buildViizaBook, [])

  const inView = (p: ViizaPage) => {
    if (view === 'book') return true
    if (view === 'front') return ['welcome', 'contents', 'mytrip', 'toolkit-1', 'toolkit-2', 'phrases-1', 'phrases-2'].includes(p.kind)
    if (view === 'end') return ['dictionary-1', 'dictionary-2', 'emergency', 'conversions', 'apps', 'stamps', 'key'].includes(p.kind)
    if (typeof view === 'string') {
      const part = Number(view.slice(5))
      return (p.kind === 'part' && p.part === part) || ('stop' in p && stopOf(p.stop)?.part === part)
    }
    return 'stop' in p && p.stop === view
  }
  const shown = book.pages.map((p, i) => ({ p, no: i + 1 })).filter(x => inView(x.p))
  const withCovers = view === 'book'

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="VIIZA ENGLISH — كتاب الطالب: دليل السفر" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${STOPS.length} محطة · ${book.pages.length + 3} صفحة مع الغلافين وصفحة الشكر.`}>
            <select value={String(view)} onChange={e => {
              const v = e.target.value
              setView(['book', 'front', 'end'].includes(v) || v.startsWith('part-') ? v as View : Number(v))
            }} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              <option value="front">البداية (الترحيب، الفهرس، أدوات المسافر)</option>
              {PARTS.map(p => (
                <optgroup key={p.n} label={`الجزء ${p.n} — ${p.titleAr}`}>
                  <option value={`part-${p.n}`}>الجزء {p.n} كاملًا</option>
                  {STOPS.filter(s => s.part === p.n).map(s => <option key={s.n} value={s.n}>المحطة {s.n} — {s.titleAr}</option>)}
                </optgroup>
              ))}
              <option value="end">النهاية (القاموس المصوّر، الطوارئ، الأجوبة)</option>
            </select>
          </Field>
          <PrintAllButton count={shown.length + (withCovers ? 3 : 0)} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withCovers && <SeriesCover series="viiza" book="book" side="front" filename="viiza-000-cover" />}
          {withCovers && <MatterPage page={{ kind: 'title' }} pageNo={0} book={book} filename="viiza-000-title" />}
          {shown.map(({ p, no }) => {
            const file = `viiza-${pad(no)}-${'stop' in p ? `stop-${String(p.stop).padStart(2, '0')}-${p.kind}` : p.kind === 'part' ? `part-${p.part}` : p.kind}`
            if ('stop' in p) return <StopPage key={no} stop={stopOf(p.stop)!} kind={p.kind} pageNo={no} filename={file} />
            return <MatterPage key={no} page={p} pageNo={no} book={book} filename={file} />
          })}
          {withCovers && <ViizaBackCover filename="viiza-999-back-cover" />}
        </div>
      </div>
    </div>
  )
}
