'use client'

import { useState, type ReactNode } from 'react'
import { Award, Dices, Sparkles } from 'lucide-react'
import { BOUCHTA, CARDS, CARD_LESSONS, GAMES, GAME_ORDER, cardSheets, lessonOf, mirrorRows, photoOf, type Game } from '@/data/level1-cards'
import { BareSheet, Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import {
  BouchtaBack, BouchtaFront, BoxBack, BoxLid, CardBack, CardFront, CardGrid, Certificate, DeckBack, EmptyCard, GAME_ICON, Passport, RuleArt, RuleCard, RuleExample, ScoreSheet, useCardFonts,
} from './_cards'

/**
 * /admin/level1-cards — the Level 1 play cards «العب وتكلّم الإنجليزية», all
 * that goes in the box: the lid and its back (how to play); the score sheet,
 * the lesson passport and the certificate; the quick-rules cards; one sheet
 * of nine cards per lesson of the textbook; Bouchta's cards (the goat's silly
 * questions and actions). Every sheet of card fronts is followed by its
 * backs (rows mirrored), so a double-sided print flipped on the long edge
 * puts every answer behind its card. Cut on the crop marks; print the lid
 * and the cards on card stock.
 */

type View = 'all' | 'box' | 'sheets' | 'rules' | 'bouchta' | 'cards' | number
const VIEWS = ['all', 'box', 'sheets', 'rules', 'bouchta', 'cards']

const pick = (...ids: string[]) => ids.map(id => CARDS.find(c => c.id === id)!)
const pad = (n: number) => String(n).padStart(2, '0')

/** Each game's rules card: its rule, one more line, and an example from the deck. */
const RULE_EXTRA: Record<Game, [line: string, example: string]> = {
  call: ['دون الجملة؟ نجمة واحدة فقط.', '03-1'],
  timer: ['السائل يعدّ الأجوبة الصحيحة بالقائمة التي على ظهر البطاقة.', '03-3'],
  tarjemni: ['جواب ناقص أو خاطئ؟ لا نجوم، وتعود البطاقة إلى الكومة.', '01-4'],
  ratebni: ['الجملة كلها في مكانها، وإلا فلا نجوم.', '02-5'],
  sahehni: ['يكفي أن يشير إلى الكلمة الخاطئة ليربح النجمة الأولى.', '02-6'],
  kemelni: ['كل جملة صحيحة تناسب المحادثة مقبولة، والخلف يقترح أمثلة.', '13-8'],
}

/** A sheet of nine fronts, then the same nine backs, rows mirrored. */
function Sheets<T>({ id, name, items, front, back }: { id: string; name: string; items: T[]; front: (x: T) => ReactNode; back: (x: T) => ReactNode }) {
  return <>
    <BareSheet theme={THEMES[2]} label={`${name} · الوجوه`} filename={`level1-cards-${id}-fronts`}>
      <CardGrid note={`${name} · الوجوه — اطبع الورقة التالية على الخلف (قلب على الحافة الطويلة)`}>
        {Array.from({ length: 9 }, (_, k) => <div key={k}>{items[k] !== undefined ? front(items[k]) : <EmptyCard />}</div>)}
      </CardGrid>
    </BareSheet>
    <BareSheet theme={THEMES[2]} label={`${name} · الخلف`} filename={`level1-cards-${id}-backs`}>
      <CardGrid note={`${name} · الخلف — الصفوف معكوسة لتقع كل إجابة خلف بطاقتها`}>
        {mirrorRows(items).map((x, k) => <div key={k}>{x !== null ? back(x) : <EmptyCard />}</div>)}
      </CardGrid>
    </BareSheet>
  </>
}

export default function Level1CardsPage() {
  useCardFonts()
  const [view, setView] = useState<View>('all')
  const lessonSheets = cardSheets(CARDS).filter(s => typeof view !== 'number' || s[0].lesson === view)
  const show = (part: Exclude<View, number | 'all'>) => view === 'all' || view === part
  const withCards = view === 'all' || view === 'cards' || typeof view === 'number'
  const count = (show('box') ? 2 : 0) + (show('sheets') ? 3 : 0) + (show('rules') ? 2 : 0) + (show('bouchta') ? 4 : 0) + (withCards ? lessonSheets.length * 2 : 0)
  const total = CARDS.length + BOUCHTA.length + 9
  const passport = CARD_LESSONS.map(l => ({ ...l, games: CARDS.filter(c => c.lesson === l.n).map(c => c.game) }))
  // The fan on the lid: one card of each kind of task, TimerPlay in the middle.
  const fan = pick('03-1', '01-5', '18-3', '13-8', '03-6')
  const photos = CARDS.filter(c => c.game === 'call').map(c => ({ slug: photoOf(c)!, icon: c.icon, ar: c.ar, lesson: c.lesson }))

  const rules: ReactNode[] = [
    <RuleCard key="turn" Icon={Dices} en="How to play" ar="كيف نلعب" lines={[
      'اختر بطاقات الدروس التي درستها، وأضف بطاقات بوشتى، واخلطها.',
      'السائل يرفع البطاقة: اللاعب يرى الوجه الملوّن، والسائل يقرأ الخلف.',
      'جواب صحيح؟ يأخذ اللاعب البطاقة ونجومها.',
      'بطاقة بوشتى؟ نفّذ ما تقوله فورًا.',
      'أول من يجمع 20 نجمة يفوز. سجّلوا النقاط في ورقة النقاط.',
    ]} />,
    ...GAME_ORDER.map(k => {
      const g = GAMES[k]
      return <RuleCard key={k} Icon={GAME_ICON[k]} en={g.name} ar={g.ar} lines={[g.rule, RULE_EXTRA[k][0]]}
        foot={<RuleExample card={pick(RULE_EXTRA[k][1])[0]} />} />
    }),
    <RuleCard key="bouchta" Icon={Sparkles} en="Bouchta's cards" ar="بطاقات بوشتى" lines={[
      'بطاقات بوشتى مخلوطة مع البطاقات الأخرى.',
      'سؤال مضحك: أجب بالإنجليزية لتربح ثلاث نجوم.',
      'بطاقة مفاجأة: نفّذها فورًا، أو احتفظ بها إن طلبت ذلك.',
      'رقم الدرس على أسئلة بوشتى: اترك أسئلة الدروس التي لم تدرسها.',
    ]} foot={<RuleArt />} />,
    <RuleCard key="passport" Icon={Award} en="Passport" ar="جواز الدروس والشهادة" lines={[
      'بعد كل درس، العب بطاقاته التسع.',
      'لوّن دائرة في جواز الدروس لكل جواب صحيح.',
      'سبع دوائر من تسع؟ يختم الأستاذ أو المساعد الدرس.',
      'تسعة عشر ختمًا؟ شهادة المستوى الأول لك!',
    ]} foot={<RuleArt Icon={Award} />} />,
  ]

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="بطاقات اللعب — المستوى الأول" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${total} بطاقة: ${CARDS.length} بطاقة للدروس (تسع لكل درس)، ${BOUCHTA.length} بطاقة لبوشتى، و9 بطاقات للقواعد.`}>
            <select value={String(view)} onChange={e => setView(VIEWS.includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="all">الكل</option>
              <option value="box">العلبة (الغطاء والخلف)</option>
              <option value="sheets">ورقة النقاط، جواز الدروس، الشهادة</option>
              <option value="rules">بطاقات القواعد</option>
              <option value="bouchta">بطاقات بوشتى</option>
              <option value="cards">بطاقات كل الدروس</option>
              {CARD_LESSONS.map(l => <option key={l.n} value={l.n}>الدرس {l.n} — {l.titleAr}</option>)}
            </select>
          </Field>
          <Field label="الطباعة" hint="اطبع على الوجهين، مع القلب على الحافة الطويلة: كل ورقة وجوه تليها ورقة الخلف. قصّ على العلامات، ويُفضّل ورق مقوّى 300 غ.">
            <PrintAllButton count={count} />
          </Field>
          <Field label="الصور" hint="صور بطاقات WhatDoWeCall: ارفعها بصيغة webp في public/level1-cards/photos بهذه الأسماء. إلى أن تصل تظهر الرموز التعبيرية.">
            <ul className="text-[12px] font-bold text-zinc-600 space-y-0.5 max-h-[260px] overflow-auto" dir="ltr">
              {photos.map(p => <li key={p.slug}>{p.icon} {p.slug}.webp <span className="text-zinc-400" dir="rtl">— {p.ar} (L{p.lesson})</span></li>)}
            </ul>
          </Field>
        </aside>

        <div className="space-y-8 min-w-0">
          {show('box') && <>
            <BareSheet theme={THEMES[2]} label="غطاء العلبة" filename="level1-cards-box-lid"><BoxLid fan={fan} cards={total} /></BareSheet>
            <BareSheet theme={THEMES[2]} label="خلف العلبة: طريقة اللعب" filename="level1-cards-box-back"><BoxBack sample={pick('13-8')[0]} /></BareSheet>
          </>}
          {show('sheets') && <>
            <BareSheet theme={THEMES[2]} label="ورقة النقاط (اطبع منها دفترًا)" filename="level1-cards-score-sheet"><ScoreSheet /></BareSheet>
            <BareSheet theme={THEMES[2]} label="جواز الدروس" filename="level1-cards-passport"><Passport lessons={passport} /></BareSheet>
            <BareSheet theme={THEMES[2]} label="الشهادة" filename="level1-cards-certificate"><Certificate /></BareSheet>
          </>}
          {show('rules') && <Sheets id="rules" name="بطاقات القواعد" items={rules} front={r => r} back={() => <DeckBack />} />}
          {withCards && lessonSheets.map(sheet => {
            const l = lessonOf(sheet[0].lesson)!
            return <Sheets key={l.n} id={`lesson-${pad(l.n)}`} name={`الدرس ${l.n} — ${l.titleAr}`} items={sheet}
              front={c => <CardFront card={c} />} back={c => <CardBack card={c} />} />
          })}
          {show('bouchta') && [BOUCHTA.slice(0, 9), BOUCHTA.slice(9)].map((part, i) => (
            <Sheets key={i} id={`bouchta-${i + 1}`} name={`بطاقات بوشتى ${i + 1}`} items={part}
              front={c => <BouchtaFront card={c} />} back={c => <BouchtaBack card={c} />} />
          ))}
        </div>
      </div>
    </div>
  )
}
