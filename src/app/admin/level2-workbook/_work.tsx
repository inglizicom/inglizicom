'use client'

import { Fragment } from 'react'
import { PARTS, STOPS } from '@/data/viiza-book'
import { REVIEWS, WORK_STOPS, reviewAnswers, workAnswers, type buildViizaWorkbook, type WorkPage, type WorkStop } from '@/data/viiza-workbook'
import { PLAY } from '@/components/QrLink'
import { Ar, Body, C, En, Footer, Ico, PAD, Qr, Sec, Sheet, StopHead } from '../level2-book/_kit'
import { PageHead } from '../level2-book/_matter'

/**
 * The workbook's pages, in the travel guide's look (its kit, colours and
 * running heads), so the two read as one set: the how-to and contents page,
 * two pages a stop, a review closing each part, the answer key.
 */

type Book = ReturnType<typeof buildViizaWorkbook>
const FOOT = 'WORKBOOK'
const LINE = '#8A93A6'

export function WorkbookPage({ page, pageNo, book, filename }: { page: WorkPage; pageNo: number; book: Book; filename: string }) {
  if (page.kind === 'words' || page.kind === 'use') {
    const w = WORK_STOPS.find(x => x.stop.n === page.stop)!
    const s = w.stop
    return (
      <Sheet label={`Stop ${PAD(s.n)} · ${page.kind} · p. ${pageNo}`} filename={filename}>
        <StopHead n={s.n} titleEn={s.titleEn} titleAr={s.titleAr} part={s.part} section={page.kind === 'words' ? 'Workbook · Words & phrases' : 'Workbook · Use it'} />
        <Body>{page.kind === 'words' ? <Words w={w} /> : <Use w={w} />}</Body>
        <Footer pageNo={pageNo} book={FOOT} />
      </Sheet>
    )
  }
  const head = page.kind === 'howto'
    ? { en: 'How this workbook works', ar: 'كيف تستعمل كتاب التمارين', icon: 'PenLine', tag: 'Before you start' }
    : page.kind === 'review'
      ? { en: `Part ${page.part} review · ${PARTS[page.part - 1].titleEn}`, ar: `مراجعة الجزء ${page.part}: ${PARTS[page.part - 1].titleAr}`, icon: 'RotateCcw', tag: 'Review' }
      : { en: 'Answer key', ar: 'الأجوبة', icon: 'CircleCheck', tag: 'Check yourself' }
  return (
    <Sheet label={`${page.kind} · p. ${pageNo}`} filename={filename}>
      <PageHead {...head} />
      <Body>
        {page.kind === 'howto' && <HowTo book={book} />}
        {page.kind === 'review' && <Review part={page.part} />}
        {page.kind === 'key' && <Key stops={page.stops} parts={page.parts} />}
      </Body>
      <Footer pageNo={pageNo} book={FOOT} />
    </Sheet>
  )
}

/* ── Pieces ─────────────────────────────────────────────────────────── */

function ExHead({ letter, en, ar, hint }: { letter: string; en: string; ar: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-2" dir="ltr">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-md text-[13px] font-extrabold text-white" style={{ background: C.red }}>{letter}</span>
        <span className="text-[14px] font-extrabold">{en}</span>
        <span className="h-[1px] flex-1" style={{ background: C.line }} />
        <Ar as="span" className="text-[14px] font-bold" style={{ color: C.red }}>{ar}</Ar>
      </div>
      {hint && <Ar className="mt-0.5 text-[12px] font-semibold" style={{ color: C.grey }}>{hint}</Ar>}
    </div>
  )
}

const Num = ({ n }: { n: number }) => <span className="inline-flex w-[18px] shrink-0 text-[12.5px] font-extrabold" style={{ color: C.red }}>{n}</span>
const WriteLine = ({ className = '' }: { className?: string }) => <span className={`block border-b-[1.5px] border-dotted ${className}`} style={{ borderColor: LINE }} />
const Box = () => <span className="inline-block h-[17px] w-[17px] shrink-0 rounded border-[1.5px]" style={{ borderColor: C.navy }} />

/* ── Page 1: words and phrases ──────────────────────────────────────── */

function Words({ w }: { w: WorkStop }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <ExHead letter="A" en="Missing letters" ar="الحروف الناقصة" hint="أكمل الكلمة الإنجليزية، ثم اكتبها كاملة." />
        <div className="grid grid-cols-4 gap-2" dir="ltr">
          {w.missing.map((m, i) => (
            <div key={m.word} className="rounded-lg px-2.5 pb-2 pt-1.5" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between"><Num n={i + 1} /><Ar className="text-[12.5px] font-bold" style={{ color: C.grey }}>{m.ar}</Ar></div>
              <div className="mt-1 whitespace-nowrap text-[15.5px] font-extrabold tracking-[0.08em]" style={{ color: C.navy }}>{m.letters}</div>
              <WriteLine className="mt-4" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <ExHead letter="B" en="I say or I hear?" ar="أقول أم أسمع؟" hint="من يقول هذه الجملة؟ أنت المسافر، أم الشخص الذي أمامك؟ ضع علامة." />
        <div className="space-y-1" dir="ltr">
          {w.sayHear.map((x, i) => (
            <div key={x.en} className="flex items-center gap-3 rounded-lg px-2.5 py-[5px]" style={{ background: i % 2 ? C.cream : '#fff' }}>
              <Num n={i + 1} />
              <span className="flex-1 text-[13.5px] font-semibold"><En>{x.en}</En></span>
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold" style={{ color: C.red }}><Box /> I say</span>
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold" style={{ color: C.navy }}><Box /> I hear</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ExHead letter="C" en="Complete the conversation" ar="أكمل المحادثة" hint={`من محادثة كتاب الطالب (${w.stop.talk.place}). استعمل كلمات الإطار.`} />
        <div className="mb-2 flex flex-wrap gap-1.5" dir="ltr">
          {w.bank.map(b => <span key={b} className="rounded-md px-2 py-[2px] text-[12px] font-extrabold" style={{ background: C.saffS, border: `1px solid ${C.saff}` }}>{b}</span>)}
        </div>
        <div className="space-y-[7px]" dir="ltr">
          {w.talk.map((t, i) => (
            <div key={i} className="grid grid-cols-[18px_88px_1fr] items-baseline gap-2">
              <Num n={i + 1} />
              <span className="truncate rounded-md px-1.5 py-[1px] text-center text-[10px] font-extrabold text-white" style={{ background: Object.keys(w.stop.talk.cast)[0] === t.who ? C.red : C.navy }}>{t.who}</span>
              <span className="text-[13.5px] font-semibold">{t.before}<span className="mx-1 inline-block w-[96px] border-b-[1.5px]" style={{ borderColor: LINE }} />{t.after}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Page 2: use it ─────────────────────────────────────────────────── */

function Use({ w }: { w: WorkStop }) {
  return (
    <div className="flex h-full flex-col gap-3.5">
      <div>
        <ExHead letter="D" en="Words in order" ar="رتّب الكلمات" hint="جمل من بطاقة النجاة ومن «تقول أنت»: رتّب الكلمات واكتب الجملة." />
        <div className="space-y-2.5" dir="ltr">
          {w.ordered.map((o, i) => (
            <div key={i} className="flex items-start gap-2">
              <Num n={i + 1} />
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">{o.words.map((x, k) => <span key={k} className="rounded-md px-2 py-[1px] text-[12.5px] font-bold" style={{ background: C.navyS }}>{x}</span>)}</div>
                <WriteLine className="mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ExHead letter="E" en="Translate" ar="ترجم إلى الإنجليزية" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5" dir="ltr">
          {w.translate.map(([, ar], i) => (
            <div key={i} className="flex items-start gap-2">
              <Num n={i + 1} />
              <div className="flex-1"><Ar className="text-[13.5px] font-bold">{ar}</Ar><WriteLine className="mt-4" /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ExHead letter="F" en="Your mission" ar="مهمتك لرحلتك أنت" />
        <div className="flex flex-1 flex-col rounded-xl px-4 pb-2 pt-2.5" style={{ border: `2px dashed ${C.red}` }}>
          <div className="flex items-start justify-between gap-4" dir="ltr">
            <div className="flex items-start gap-2"><Ico name="Target" size={17} color={C.red} /><span className="text-[14px] font-extrabold">{w.mission.en}</span></div>
            <Ar className="max-w-[46%] text-[13px] font-bold" style={{ color: C.grey }}>{w.mission.ar}</Ar>
          </div>
          <div className="mt-2 flex-1" style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 31px, ${LINE} 31px 32px)` }} />
        </div>
      </div>

      <div className="rounded-xl px-4 py-2.5" style={{ background: C.navyS }}>
        <div className="mb-1 flex items-center justify-between" dir="ltr">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.navy }}>Can you do it now?</span>
          <Ar className="text-[13px] font-bold" style={{ color: C.navy }}>هل تستطيع الآن؟</Ar>
        </div>
        {w.stop.canDo.map(([en, ar]) => (
          <div key={en} className="flex items-center gap-3 py-[3px]" dir="ltr">
            <div className="min-w-0 flex-1 leading-tight"><span className="text-[12.5px] font-bold">{en}</span> <Ar as="span" className="text-[11.5px] font-semibold" style={{ color: C.grey }}>{ar}</Ar></div>
            {[['Yes', 'نعم'], ['Almost', 'تقريبًا'], ['Not yet', 'ليس بعد']].map(([e, a]) => (
              <span key={e} className="flex items-center gap-1 text-[10.5px] font-extrabold"><Box />{e} <Ar as="span" className="text-[10px] font-semibold" style={{ color: C.grey }}>{a}</Ar></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Reviews ────────────────────────────────────────────────────────── */

const L = 'abc'

function Review({ part }: { part: number }) {
  const r = REVIEWS[part - 1]
  const stops = STOPS.filter(s => s.part === part)
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <ExHead letter="A" en="Where are you?" ar="أين أنت؟" hint="سمعت هذه الجملة. في أي محطة أنت؟ اختر." />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2" dir="ltr">
          {r.where.map((x, i) => (
            <div key={i} className="rounded-lg px-3 py-2" style={{ background: C.cream }}>
              <div className="flex gap-2 text-[13px] font-bold"><Num n={i + 1} /><span className="italic">“<En>{x.heard}</En>”</span></div>
              <div className="ml-[26px] mt-1 space-y-[2px]">
                {x.options.map((o, k) => <div key={o} className="flex items-center gap-2 text-[12px] font-semibold"><Box /><b style={{ color: C.navy }}>{L[k]}</b> {o}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <ExHead letter="B" en="Fix the mistake" ar="صحّح الخطأ" hint="هذه أخطاء يقع فيها المتكلمون بالعربية. اكتب الجملة الصحيحة." />
        <div className="space-y-2.5" dir="ltr">
          {r.fix.map(([wrong], i) => (
            <div key={i} className="grid grid-cols-[18px_1fr_1.1fr] items-end gap-3">
              <Num n={i + 1} />
              <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: '#7A8296' }}><Ico name="X" size={14} color={C.red} stroke={3} /><En>{wrong}</En></span>
              <WriteLine />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl px-4 py-3" style={{ background: C.redS }}>
        <div className="mb-1.5 flex items-center justify-between" dir="ltr">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.red }}>Part {part} check · tick what you can do</span>
          <Ar className="text-[13px] font-bold" style={{ color: C.red }}>ضع علامة على ما تستطيع فعله</Ar>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1" dir="ltr">
          {stops.flatMap(s => s.canDo.slice(0, 2).map(([en]) => ({ n: s.n, en }))).slice(0, 8).map(({ n, en }) => (
            <div key={en} className="flex items-center gap-2 text-[12px] font-semibold"><Box /><span className="text-[10.5px] font-extrabold" style={{ color: C.red }}>{PAD(n)}</span><En>{en}</En></div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── How to, and the key ────────────────────────────────────────────── */

const STEPS: [string, string, string, string][] = [
  ['A', 'Missing letters', 'الحروف الناقصة', 'كلمات المحطة الأساسية: أكمل الحروف ثم اكتب الكلمة كاملة.'],
  ['B', 'I say or I hear?', 'أقول أم أسمع؟', 'فرّق بين ما تقوله أنت وما سيقوله لك الناس: نصف السفر هو الفهم.'],
  ['C', 'Complete the conversation', 'أكمل المحادثة', 'محادثة كتاب الطالب نفسها، بكلمات ناقصة. استمع إليها بالرمز قبل أن تبدأ.'],
  ['D', 'Words in order', 'رتّب الكلمات', 'جمل بطاقة النجاة: رتّبها واكتبها حتى تحفظها.'],
  ['E', 'Translate', 'ترجم', 'من العربية إلى الإنجليزية: الجمل التي تحتاجها في الموقف.'],
  ['F', 'Your mission', 'مهمتك', 'الشيء الحقيقي الذي ستكتبه أو تقوله في رحلتك أنت: اكتبه الآن.'],
]

function HowTo({ book }: { book: Book }) {
  const at = (n: number) => book.pageOf(p => p.kind === 'words' && p.stop === n)
  return (
    <div className="flex h-full flex-col gap-3.5">
      <div className="flex items-start gap-4 rounded-xl px-4 py-3" style={{ background: C.cream }} dir="rtl">
        <Ar className="flex-1 text-[13.5px] font-semibold leading-[1.8]">لكل محطة في كتاب الطالب صفحتان هنا. اعمل على المحطة بعد أن تدرسها في كتاب الطالب، واستمع إلى صوتها بمسح الرمز، ثم صحّح بنفسك من مفتاح الأجوبة في آخر الكتاب. وفي نهاية كل جزء صفحة مراجعة.</Ar>
        <Qr url={PLAY.viiza(1)} size={58} />
      </div>
      <div>
        <Sec icon="ListChecks" en="Every stop, six exercises" ar="لكل محطة ستة تمارين" />
        <div className="mt-2 grid grid-cols-2 gap-2" dir="ltr">
          {STEPS.map(([l, en, ar, text]) => (
            <div key={l} className="flex items-start gap-2.5 rounded-xl px-3 py-2" style={{ border: `1px solid ${C.line}` }}>
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-md text-[13px] font-extrabold text-white" style={{ background: C.red }}>{l}</span>
              <div className="min-w-0">
                <div className="flex justify-between gap-2"><span className="text-[13px] font-extrabold">{en}</span><Ar className="text-[12.5px] font-bold" style={{ color: C.red }}>{ar}</Ar></div>
                <Ar className="text-[11.5px] font-semibold leading-snug" style={{ color: C.grey }}>{text}</Ar>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Sec icon="Route" en="Contents" ar="الفهرس" color={C.navy} />
        <div className="mt-2 grid flex-1 grid-cols-2 gap-x-6" dir="ltr">
          {[[1, 2, 3], [4, 5, 6]].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-2">
              {col.map(n => (
                <div key={n}>
                  <div className="flex items-center gap-2 rounded-md px-2 py-[2px] text-white" style={{ background: C.red }}>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.06em]">Part {n} · {PARTS[n - 1].titleEn}</span>
                    <Ar className="ml-auto text-[11.5px] font-bold" style={{ color: C.saff }}>{PARTS[n - 1].titleAr}</Ar>
                  </div>
                  {STOPS.filter(s => s.part === n).map(s => (
                    <div key={s.n} className="flex items-center gap-2 border-b px-1 py-[1px] text-[11.5px] font-bold" style={{ borderColor: C.line }}>
                      <span className="w-[18px] font-extrabold" style={{ color: C.red }}>{PAD(s.n)}</span>
                      <span className="flex-1 truncate">{s.titleEn}</span>
                      <span>{at(s.n)}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-1 py-[1px] text-[11.5px] font-extrabold" style={{ color: C.navy }}>
                    <Ico name="RotateCcw" size={11} color={C.navy} /><span className="flex-1">Review</span>
                    <span>{book.pageOf(p => p.kind === 'review' && p.part === n)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Key({ stops, parts }: { stops: number[]; parts: number[] }) {
  const blocks = [
    ...stops.map(n => ({ key: `s${n}`, order: n * 2, title: `STOP ${PAD(n)}`, name: STOPS[n - 1].titleEn, rows: workAnswers(WORK_STOPS[n - 1]) })),
    ...parts.map(p => ({ key: `p${p}`, order: (Math.max(...STOPS.filter(s => s.part === p).map(s => s.n)) * 2) + 1, title: `PART ${p} REVIEW`, name: PARTS[p - 1].titleEn, rows: reviewAnswers(REVIEWS[p - 1]) })),
  ].sort((a, b) => a.order - b.order)
  return (
    <div className="columns-2 gap-6" dir="ltr">
      {blocks.map(b => (
        <div key={b.key} className="mb-2.5 break-inside-avoid">
          <div className="flex items-baseline gap-2 border-b pb-0.5" style={{ borderColor: C.line }}>
            <span className="text-[12px] font-extrabold" style={{ color: b.key.startsWith('p') ? C.navy : C.red }}>{b.title}</span>
            <span className="truncate text-[11.5px] font-bold">{b.name}</span>
          </div>
          {b.rows.map(({ letter, answers }) => (
            <Fragment key={letter}>
              <div className="mt-0.5 flex gap-1.5 text-[10.5px] leading-snug">
                <span className="font-extrabold" style={{ color: C.navy }}>{letter}</span>
                <span className="font-semibold">{answers.join(' · ')}</span>
              </div>
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  )
}
