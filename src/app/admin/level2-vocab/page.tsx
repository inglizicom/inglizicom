'use client'

import { useMemo, useState } from 'react'
import { PARTS, STOPS } from '@/data/viiza-book'
import { buildTalkBook, TALK_STOPS, type TalkPage } from '@/data/viiza-talk'
import { Field, GamesHeader, INP, PrintAllButton } from '../games/_shared'
import { ViizaBackCover } from '../level2-book/_back'
import { TalkBookPage } from './_talk'
import { TalkFrontCover } from './_cover'

/**
 * /admin/level2-vocab — VIIZA ENGLISH, Words & Conversations: the third book
 * of the travel guide (src/data/viiza-talk), twelve new words and four more
 * conversations for every stop, two pages a stop, between the series' cover
 * (its band renamed) and its own back cover. The vocabulary book this route
 * printed before is still in src/data/level2-vocab.
 */

type View = 'book' | number

const pad = (n: number) => String(n).padStart(3, '0')

export default function ViizaTalkPage() {
  const [view, setView] = useState<View>('book')
  const book = useMemo(buildTalkBook, [])

  const inView = (p: TalkPage) => view === 'book' || ('stop' in p && STOPS[p.stop - 1].part === view)
  const shown = book.pages.map((p, i) => ({ p, no: i + 1 })).filter(x => inView(x.p))
  const withCovers = view === 'book'

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="VIIZA ENGLISH — الكلمات والمحادثات" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${TALK_STOPS.length} محطة · ${TALK_STOPS.length * 4} محادثة · ${book.pages.length + 2} صفحة مع الغلافين.`}>
            <select value={String(view)} onChange={e => setView(e.target.value === 'book' ? 'book' : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              {PARTS.map(p => <option key={p.n} value={p.n}>الجزء {p.n} — {p.titleAr}</option>)}
            </select>
          </Field>
          <PrintAllButton count={shown.length + (withCovers ? 2 : 0)} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withCovers && <TalkFrontCover filename="viiza-talk-000-cover" />}
          {shown.map(({ p, no }) => (
            <TalkBookPage key={no} page={p} pageNo={no} book={book}
              filename={`viiza-talk-${pad(no)}-${'stop' in p ? `stop-${String(p.stop).padStart(2, '0')}-${p.kind}` : p.kind}`} />
          ))}
          {withCovers && <ViizaBackCover book="vocab" filename="viiza-talk-999-back-cover" />}
        </div>
      </div>
    </div>
  )
}
