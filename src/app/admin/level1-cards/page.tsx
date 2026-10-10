'use client'

import { useState } from 'react'
import { CARDS, CARD_LESSONS, cardSheets, lessonOf, mirrorRows, photoOf } from '@/data/level1-cards'
import { BareSheet, Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { BoxBack, BoxLid, CardBack, CardFront, CardGrid, EmptyCard, useCardFonts } from './_cards'

/**
 * /admin/level1-cards — the Level 1 play cards «العب وتكلّم الإنجليزية»: the
 * box lid, the box's back (how to play the six games), then one sheet of
 * nine cards per lesson of the textbook, each sheet of fronts followed by its
 * backs (rows mirrored), so a double-sided print flipped on the long edge
 * puts every answer behind its card. Cut on the crop marks; print the lid on
 * card stock.
 */

type View = 'all' | 'box' | 'cards' | number

const pick = (...ids: string[]) => ids.map(id => CARDS.find(c => c.id === id)!)

export default function Level1CardsPage() {
  useCardFonts()
  const [view, setView] = useState<View>('all')
  const sheets = cardSheets(CARDS).filter(s => typeof view !== 'number' || s[0].lesson === view)
  const withBox = view === 'all' || view === 'box'
  const withCards = view !== 'box'
  const count = (withBox ? 2 : 0) + (withCards ? sheets.length * 2 : 0)
  // The fan on the lid: one card of each kind of task, TimerPlay in the middle.
  const fan = pick('03-1', '01-5', '18-3', '13-8', '03-6')
  const photos = CARDS.filter(c => c.game === 'call').map(c => ({ slug: photoOf(c)!, icon: c.icon, ar: c.ar, lesson: c.lesson }))

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="بطاقات اللعب — المستوى الأول" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${CARDS.length} بطاقة: تسع بطاقات لكل درس من الدروس ${CARD_LESSONS.length}، ورقة لكل درس.`}>
            <select value={String(view)} onChange={e => setView(['all', 'box', 'cards'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="all">الكل</option>
              <option value="box">العلبة (الغطاء والخلف)</option>
              <option value="cards">كل البطاقات</option>
              {CARD_LESSONS.map(l => <option key={l.n} value={l.n}>الدرس {l.n} — {l.titleAr}</option>)}
            </select>
          </Field>
          <Field label="الطباعة" hint="اطبع على الوجهين، مع القلب على الحافة الطويلة: كل ورقة وجوه تليها ورقة الأجوبة. قصّ على العلامات، ويُفضّل ورق مقوّى 300 غ.">
            <PrintAllButton count={count} />
          </Field>
          <Field label="الصور (اختيارية)" hint="صور بطاقات WhatDoWeCall: ارفعها بصيغة webp في public/level1-cards/photos بهذه الأسماء. إلى أن تصل تظهر الرموز التعبيرية.">
            <ul className="text-[12px] font-bold text-zinc-600 space-y-0.5 max-h-[260px] overflow-auto" dir="ltr">
              {photos.map(p => <li key={p.slug}>{p.icon} {p.slug}.webp <span className="text-zinc-400" dir="rtl">— {p.ar} (L{p.lesson})</span></li>)}
            </ul>
          </Field>
        </aside>

        <div className="space-y-8 min-w-0">
          {withBox && <>
            <BareSheet theme={THEMES[2]} label="غطاء العلبة" filename="level1-cards-box-lid"><BoxLid fan={fan} cards={CARDS.length} /></BareSheet>
            <BareSheet theme={THEMES[2]} label="خلف العلبة: طريقة اللعب" filename="level1-cards-box-back"><BoxBack sample={pick('13-8')[0]} /></BareSheet>
          </>}
          {withCards && sheets.flatMap(sheet => {
            const l = lessonOf(sheet[0].lesson)!
            const name = `الدرس ${l.n} — ${l.titleAr}`
            return [
              <BareSheet key={`f${l.n}`} theme={THEMES[2]} label={`${name} · الوجوه`} filename={`level1-cards-lesson-${String(l.n).padStart(2, '0')}-fronts`}>
                <CardGrid note={`${name} · الوجوه — اطبع ورقة الأجوبة على الخلف (قلب على الحافة الطويلة)`}>
                  {Array.from({ length: 9 }, (_, k) => (sheet[k] ? <CardFront key={k} card={sheet[k]} /> : <EmptyCard key={k} />))}
                </CardGrid>
              </BareSheet>,
              <BareSheet key={`b${l.n}`} theme={THEMES[2]} label={`${name} · الأجوبة (الخلف)`} filename={`level1-cards-lesson-${String(l.n).padStart(2, '0')}-backs`}>
                <CardGrid note={`${name} · الأجوبة — الصفوف معكوسة لتقع كل إجابة خلف بطاقتها`}>
                  {mirrorRows(sheet).map((c, k) => (c ? <CardBack key={k} card={c} /> : <EmptyCard key={k} />))}
                </CardGrid>
              </BareSheet>,
            ]
          })}
        </div>
      </div>
    </div>
  )
}
