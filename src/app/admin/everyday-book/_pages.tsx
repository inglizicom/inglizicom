'use client'

import type { CSSProperties } from 'react'
import { sortKey, type EverydayUnit, type UnitOpener, type WordEntry } from '@/data/everyday-book'
import { AR, AR_DISPLAY, CodeSlot, Footer, Frame, Gloss, HEAD, LessonHeader, lessonColour, Mixed, SectionHead, type BookInfo } from '../level1-book/_blocks'

/**
 * The textbook's own numbered pages, drawn outside the block renderer because
 * each is one composed layout rather than a list of blocks: a unit's opener
 * (a full-colour title page with its goals, key phrase and tip, so every unit
 * starts like a chapter), the progress tracker after the contents, and the
 * A–Z word list at the back. They share the lessons' header, footer and QR
 * slot. Each body is an `.lb-body` whose first child grows with its content,
 * so the e2e check that every page fits covers them too.
 */

const EMOJI: CSSProperties = { filter: 'var(--e)' }
const pad = (n: number) => String(n).padStart(2, '0')
/** A unit's colour on a page drawn in another colour (none in black and white). */
const unitColour = (info: BookInfo, n: number) => (info.mono ? 'var(--m)' : lessonColour(n - 1).m)

export interface UnitParts { vocab: number; expressions: number; talk: number; reading: number }

export function UnitOpenerPage({ info, unit: u, opener, parts, pageNo, filename }: {
  info: BookInfo; unit: EverydayUnit; opener: UnitOpener; parts: UnitParts; pageNo: number; filename: string
}) {
  const [q, a, qAr, aAr] = u.expressions[0]
  const inside: [string, string, string, string, number][] = [
    ['📚', 'Vocabulary', 'المفردات', `${u.vocab.length} words`, parts.vocab],
    ['💬', 'Expressions', 'عبارات مفيدة', `${u.expressions.length} questions & answers`, parts.expressions],
    ['🗣️', 'Conversation', 'المحادثة', `${u.talk.length} lines`, parts.talk],
    ['📖', 'Reading', 'القراءة + اجعلها خاصة بك', u.reading.title, parts.reading],
  ]
  return (
    <Frame info={info} colour={lessonColour(u.n - 1)} label={`Unit ${pad(u.n)} — ${u.titleAr} · صفحة ${pageNo}`} filename={filename}>
      <div dir="ltr" className="lb-body absolute inset-x-0 top-0 overflow-hidden" style={{ bottom: 38 }}>
        <div className="flex flex-col">
          {/* ── Title ── */}
          <div className="relative bg-[var(--m)] text-white px-10 pt-6 pb-[72px] overflow-hidden text-center">
            <div className="absolute -left-20 -top-24 w-80 h-80 rounded-full bg-white/10" />
            <div className="absolute -right-10 bottom-[-90px] w-72 h-72 rounded-full border-[28px] border-white/10" />
            <span className="absolute right-6 bottom-[-46px] text-[230px] font-extrabold leading-none text-white/10 select-none" style={{ fontFamily: HEAD }}>{pad(u.n)}</span>
            <div className="relative flex items-start justify-between">
              <span className="rounded-full bg-white text-[var(--m)] px-4 text-[17px] font-extrabold leading-[34px] tracking-[0.12em]" style={{ fontFamily: HEAD }}>UNIT {pad(u.n)}</span>
              <CodeSlot info={info} size={64} />
            </div>
            <div className="relative -mt-4 flex justify-center gap-5">
              {u.icons.map((icon, i) => (
                <span key={i} className="w-[104px] h-[104px] rounded-full bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.18)] flex items-center justify-center text-[58px] leading-none" style={EMOJI}>{icon}</span>
              ))}
            </div>
            <p className="relative mt-4 text-[46px] font-extrabold leading-[1.05]" style={{ fontFamily: HEAD }}>{u.titleEn}</p>
            <p className="relative mt-1 text-[34px] leading-tight text-white/90" dir="rtl" style={{ fontFamily: AR_DISPLAY }}>{u.titleAr}</p>
            <p className="relative mx-auto mt-2 max-w-[560px] text-[15.5px] font-bold leading-snug text-white/85" dir="rtl" style={{ fontFamily: AR }}>{u.goal}</p>
          </div>

          {/* ── Key phrase, over the title's edge ── */}
          <div className="relative -mt-[52px] mx-10 rounded-3xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.14)] px-6 pt-3 pb-4">
            <p className="text-center text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--m)]" style={{ fontFamily: HEAD }}>
              Key phrase · <span style={{ fontFamily: AR }}>عبارة الوحدة</span>
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="self-start max-w-[78%] rounded-2xl rounded-bl-[4px] bg-[#F3F0EA] px-4 py-2">
                <p className="text-[16px] font-bold leading-snug"><Mixed text={q} /></p>
                <Gloss s={qAr} size={13} />
              </div>
              <div className="self-end max-w-[78%] rounded-2xl rounded-br-[4px] bg-[var(--m)] text-white px-4 py-2">
                <p className="text-[16px] font-extrabold leading-snug"><Mixed text={a} /></p>
                <p dir="rtl" className="text-[13px] font-bold leading-snug text-white/85" style={{ fontFamily: AR }}>{aAr}</p>
              </div>
            </div>
          </div>

          <div className="px-[30px] mt-5 flex flex-col gap-3">
            {/* ── What's inside, with page numbers ── */}
            <SectionHead title="In this unit - في هذه الوحدة" badge={<span style={EMOJI}>🧩</span>} />
            <div className="grid grid-cols-4 gap-2.5">
              {inside.map(([icon, en, ar, detail, page]) => (
                <div key={en} className="relative rounded-2xl bg-[var(--s)] px-2 pt-2.5 pb-2 text-center">
                  <span className="absolute right-2 top-2 rounded-full bg-[var(--k)] text-white px-2 text-[10.5px] font-extrabold leading-[18px]" style={{ fontFamily: HEAD }}>p. {page}</span>
                  <p className="text-[30px] leading-none" style={EMOJI}>{icon}</p>
                  <p className="mt-1.5 text-[14.5px] font-extrabold leading-tight text-[var(--m)]">{en}</p>
                  <p className="text-[12px] font-bold leading-tight" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>{ar}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-tight opacity-70">{detail}</p>
                </div>
              ))}
            </div>

            {/* ── Goals to tick ── */}
            <SectionHead title="My goals - أهدافي" badge={<span style={EMOJI}>🎯</span>} />
            <div className="flex flex-col gap-1.5">
              {opener.canDo.map(([en, ar], i) => (
                <div key={en} className="flex items-center gap-3 rounded-xl border-[1.5px] border-[var(--s)] px-3 py-1.5">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--m)] text-white flex items-center justify-center text-[13px] font-extrabold" style={{ fontFamily: HEAD }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-bold leading-snug">I can {en}</p>
                    <Gloss s={`أستطيع أن ${ar}`} size={12.5} />
                  </div>
                  <span className="w-7 h-7 shrink-0 rounded-md border-2 border-[var(--m)]" aria-label="tick box" />
                </div>
              ))}
              <p className="text-[11.5px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>في آخر الوحدة، ضع علامة ✓ أمام كل هدف أصبحت تستطيعه.</p>
            </div>

            {/* ── Tip ── */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-[var(--tip)] px-4 py-3">
              <span className="text-[34px] leading-none" style={EMOJI}>💡</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--m)]" style={{ fontFamily: HEAD }}>Language tip · <span style={{ fontFamily: AR }}>نصيحة لغوية</span></p>
                <p className="text-[15px] font-bold leading-snug"><Mixed text={opener.tip.en} /></p>
                <Gloss s={opener.tip.ar} size={13} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer info={info} page={`Page ${pad(pageNo)}`} />
    </Frame>
  )
}

const PARTS: [string, string][] = [['📚', 'Words'], ['💬', 'Expressions'], ['🗣️', 'Conversation'], ['📖', 'Reading'], ['✍️', 'Make it yours']]
/** Word-list spelling: the vocabulary pages write phrases as headings ("Brush my teeth"); a list wants them in lower case. */
const listed = (en: string) => (/^(I\b|[A-Z]\S*[A-Z])/.test(en) ? en : en.charAt(0).toLowerCase() + en.slice(1))

export function ProgressPage({ info, units, pageNo, filename }: { info: BookInfo; units: EverydayUnit[]; pageNo: number; filename: string }) {
  const cols = '44px minmax(0, 1fr) repeat(5, 62px) 84px'
  return (
    <Frame info={info} colour={lessonColour(5)} label={`تقدّمي · صفحة ${pageNo}`} filename={filename}>
      <LessonHeader info={info} n={0} tag="Progress" />
      <div dir="ltr" className="lb-body absolute inset-x-[24px] overflow-hidden" style={{ top: 84, bottom: 38 }}>
        <div className="flex flex-col gap-2.5">
          <div className="rounded-2xl bg-[var(--s)] py-2 text-center">
            <p className="text-[27px] font-extrabold leading-tight text-[var(--m)]" style={{ fontFamily: HEAD }}><span style={EMOJI}>✅</span> <Mixed text="My progress - تقدّمي" /></p>
            <p className="text-[13px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>ضع علامة ✓ في كل خانة عندما تنهي ذلك الجزء، واكتب تاريخ إنهاء الوحدة. شاهد تقدّمك يكبر!</p>
          </div>
          <div className="rounded-xl overflow-hidden border-[1.5px] border-[var(--m)]">
            <div className="grid items-center bg-[var(--m)] text-white text-center py-1" style={{ gridTemplateColumns: cols }}>
              <span className="text-[12px] font-extrabold">Unit</span>
              <span className="text-[12px] font-extrabold text-left pl-2">Situation · <span style={{ fontFamily: AR }}>الموقف</span></span>
              {PARTS.map(([icon, en]) => (
                <span key={en} className="flex flex-col items-center leading-none">
                  <span className="text-[17px]" style={EMOJI}>{icon}</span>
                  <span className="mt-0.5 text-[8.5px] font-extrabold leading-[1.1]">{en}</span>
                </span>
              ))}
              <span className="text-[12px] font-extrabold">Date · <span style={{ fontFamily: AR }}>التاريخ</span></span>
            </div>
            {units.map((u, i) => (
              <div key={u.n} className={`grid items-center py-[5px] ${i % 2 ? 'bg-white' : 'bg-[var(--s)]'}`} style={{ gridTemplateColumns: cols }}>
                <span className="mx-auto w-[26px] h-[26px] rounded-full text-white flex items-center justify-center text-[12px] font-extrabold" style={{ background: unitColour(info, u.n), fontFamily: HEAD }}>{pad(u.n)}</span>
                <div className="pl-2 min-w-0">
                  <p className="text-[12.5px] font-extrabold leading-[1.3] truncate"><span style={EMOJI}>{u.icons[0]}</span> {u.titleEn}</p>
                  <p className="text-[11px] font-bold leading-[1.35] text-left truncate" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>{u.titleAr}</p>
                </div>
                {PARTS.map(([, en]) => <span key={en} className="mx-auto w-[22px] h-[22px] rounded-md border-2 border-[#B8C2D3] bg-white" />)}
                <span className="mx-2 h-[20px] border-b-[1.5px] border-dashed border-[#94A3B8]" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--m)] px-4 py-2">
            <span className="text-[26px] leading-none" style={EMOJI}>🏆</span>
            <p className="text-[14px] font-extrabold" dir="rtl" style={{ fontFamily: AR }}>أنهيت الوحدات الـ{units.length}؟ املأ شهادتك في آخر الكتاب!</p>
          </div>
        </div>
      </div>
      <Footer info={info} page={`Page ${pad(pageNo)}`} />
    </Frame>
  )
}

export function WordListPage({ info, words, first, pageNo, filename }: { info: BookInfo; words: WordEntry[]; first: boolean; pageNo: number; filename: string }) {
  // A letter heading wherever the first letter changes, and at the top of each page.
  const rows: ({ letter: string } | WordEntry)[] = []
  let last = ''
  for (const w of words) {
    const letter = sortKey(w.en).charAt(0).toUpperCase()
    if (letter !== last) { rows.push({ letter }); last = letter }
    rows.push(w)
  }
  return (
    <Frame info={info} colour={lessonColour(3)} label={`قائمة الكلمات · صفحة ${pageNo}`} filename={filename}>
      <LessonHeader info={info} n={0} tag="Word list" />
      <div dir="ltr" className="lb-body absolute inset-x-[24px] overflow-hidden" style={{ top: 84, bottom: 38 }}>
        <div className="flex flex-col gap-2.5">
          {first && (
            <div className="rounded-2xl bg-[var(--s)] py-2 text-center">
              <p className="text-[27px] font-extrabold leading-tight text-[var(--m)]" style={{ fontFamily: HEAD }}><span style={EMOJI}>🔤</span> <Mixed text="Word list A–Z - قائمة الكلمات" /></p>
              <p className="text-[13px] font-bold" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>كل كلمات الكتاب مرتّبة أبجديًا، مع معناها ورقم الوحدة التي تجدها فيها.</p>
            </div>
          )}
          <div style={{ columnCount: 3, columnGap: 18, columnRule: '1px solid var(--s)' }}>
            {rows.map((r, i) => 'letter' in r ? (
              <div key={`l${i}`} className="flex items-center gap-2 pt-1.5 pb-0.5 break-inside-avoid" style={{ breakAfter: 'avoid' }}>
                <span className="w-[24px] h-[24px] rounded-lg bg-[var(--m)] text-white flex items-center justify-center text-[14px] font-extrabold" style={{ fontFamily: HEAD }}>{r.letter}</span>
                <span className="flex-1 h-[2px] rounded-full bg-[var(--m)] opacity-20" />
              </div>
            ) : (
              <div key={i} className="flex items-baseline gap-1.5 py-[2px] border-b border-dotted border-[#E2E8F0] break-inside-avoid">
                <span className="min-w-0 text-[11.5px] font-bold leading-tight">{listed(r.en)}</span>
                <span className="flex-1 min-w-[8px]" />
                <span className="text-[11px] font-bold leading-tight text-right" dir="rtl" style={{ fontFamily: AR, color: '#526079' }}>{r.ar}</span>
                <span className="shrink-0 flex gap-0.5 self-center">
                  {r.units.map(n => (
                    <span key={n} className="w-[17px] h-[17px] rounded-full text-white flex items-center justify-center text-[8.5px] font-extrabold" style={{ background: unitColour(info, n), fontFamily: HEAD }}>{n}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer info={info} page={`Page ${pad(pageNo)}`} />
    </Frame>
  )
}
