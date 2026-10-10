'use client'

import { useState } from 'react'
import { CARDS, WORDS, cardSheets, mirrorRows } from '@/data/level1-cards'
import { BareSheet, Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { BoxBack, BoxLid, CardBack, CardFront, CardGrid, EmptyCard, useCardFonts } from './_cards'

/**
 * /admin/level1-cards — the Level 1 play cards «العب وتكلّم الإنجليزية»,
 * prototype: the box lid, the box's back (how to play), then the cards,
 * nine to an A4 sheet, each sheet of fronts followed by its backs (rows
 * mirrored), so a double-sided print flipped on the long edge puts every
 * answer behind its card. Cut on the crop marks; print the lid on card stock.
 */

type View = 'all' | 'box' | 'cards'

export default function Level1CardsPage() {
  useCardFonts()
  const [view, setView] = useState<View>('all')
  const sheets = cardSheets(CARDS)
  const fan = ['13-2', '01-5', '13-6', '01-3', 'w-2'].map(id => CARDS.find(c => c.id === id)!)
  const sample = CARDS.find(c => c.id === '13-6')!
  const count = (view !== 'cards' ? 2 : 0) + (view !== 'box' ? sheets.length * 2 : 0)
  const photos = Object.values(WORDS).flat().filter(w => CARDS.some(c => c.photo === w.slug))

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="بطاقات اللعب — المستوى الأول (نموذج أولي)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${CARDS.length} بطاقة في ${sheets.length} أوراق · الدرسان 1 و13 وبطاقتا مفاجأة.`}>
            <select value={view} onChange={e => setView(e.target.value as View)} className={INP}>
              <option value="all">الكل</option>
              <option value="box">العلبة (الغطاء والخلف)</option>
              <option value="cards">البطاقات فقط</option>
            </select>
          </Field>
          <Field label="الطباعة" hint="اطبع على الوجهين، مع القلب على الحافة الطويلة: كل ورقة وجوه تليها ورقة الأجوبة. قصّ على العلامات، ويُفضّل ورق مقوّى 300 غ.">
            <PrintAllButton count={count} />
          </Field>
          <Field label="الصور المطلوبة" hint="ارفعها بصيغة webp في public/level1-cards/photos بهذه الأسماء، وإلى أن تصل تظهر الرموز التعبيرية.">
            <ul className="text-[12.5px] font-bold text-zinc-600 space-y-0.5" dir="ltr">
              {photos.map(w => <li key={w.slug}>{w.icon} {w.slug}.webp <span className="text-zinc-400" dir="rtl">— {w.ar}</span></li>)}
            </ul>
          </Field>
        </aside>

        <div className="space-y-8 min-w-0">
          {view !== 'cards' && <>
            <BareSheet theme={THEMES[2]} label="غطاء العلبة" filename="level1-cards-box-lid"><BoxLid fan={fan} /></BareSheet>
            <BareSheet theme={THEMES[2]} label="خلف العلبة: طريقة اللعب" filename="level1-cards-box-back"><BoxBack sample={sample} /></BareSheet>
          </>}
          {view !== 'box' && sheets.flatMap((sheet, i) => [
            <BareSheet key={`f${i}`} theme={THEMES[2]} label={`الورقة ${i + 1} — الوجوه`} filename={`level1-cards-sheet-${i + 1}-fronts`}>
              <CardGrid note={`الورقة ${i + 1} · الوجوه — اطبع ورقة الأجوبة على الخلف (قلب على الحافة الطويلة)`}>
                {Array.from({ length: 9 }, (_, k) => (sheet[k] ? <CardFront key={k} card={sheet[k]} /> : <EmptyCard key={k} />))}
              </CardGrid>
            </BareSheet>,
            <BareSheet key={`b${i}`} theme={THEMES[2]} label={`الورقة ${i + 1} — الأجوبة (الخلف)`} filename={`level1-cards-sheet-${i + 1}-backs`}>
              <CardGrid note={`الورقة ${i + 1} · الأجوبة — الصفوف معكوسة لتقع كل إجابة خلف بطاقتها`}>
                {mirrorRows(sheet).map((c, k) => (c ? <CardBack key={k} card={c} /> : <EmptyCard key={k} />))}
              </CardGrid>
            </BareSheet>,
          ])}
        </div>
      </div>
    </div>
  )
}
