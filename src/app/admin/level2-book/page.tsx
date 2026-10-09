'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { buildLevel2Book, INDEX, L2_KIND_TONE, L2_TONES, L2_UNITS, type L2Page, type L2Tone } from '@/data/level2-book'
import { Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import { DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from '../level1-book/_blocks'
import { Imprint } from '../everyday-book/_matter'

/**
 * /admin/level2-book — Level 2 «تكلّم واكتب بدقّة» (A2 → B1): conversational
 * English with accuracy and writing, in the house style of the textbook but
 * with an adult English face (Nunito; Arabic keeps Baloo Bhaijaan 2), a navy
 * cover, and a colour key of its own: expressions green, conversation
 * violet, grammar blue, writing orange, practice teal. The grammar of each
 * unit is printed in blue wherever it is used. The content lives in
 * src/data/level2-book; units are written module by module, and the
 * contents page lists all twenty from the start.
 */

const INFO_KEY = 'level2-book-info-v1'
const COVER_KEY = 'level2-book-cover-v1'

const EN_FONT = "'Nunito', 'Baloo Bhaijaan 2', sans-serif"
const BOOK_INFO: BookInfo = {
  ...DEFAULT_INFO, title: 'تكلّم واكتب بدقّة', level: 'Level 2 · A2 → B1', ink: '#0F1E3D', fontEn: EN_FONT,
}
const BOOK_COVER: CoverInfo = {
  ...DEFAULT_COVER, palette: 'navy', phone1: '+212 707 902 091', level: 'A2 → B1',
  titleAr1: 'تكلّم واكتب', titleAr2: 'بدقّة وثقة', titleEn1: 'Speak & Write', titleEn2: 'with Confidence',
}

/** Nunito for English (headings too), Baloo Bhaijaan 2 for Arabic; highlights in the colour key. */
const PAGE_VARS = {
  '--book-en': "'Nunito'", '--book-head': "'Nunito', 'Baloo Bhaijaan 2'", '--book-ar': "'Baloo Bhaijaan 2'",
  '--book-display': "'Baloo Bhaijaan 2'", '--book-display-weight': '800',
  '--hl': L2_TONES.grammar.m, '--key': L2_TONES.expr.m, '--key-s': L2_TONES.expr.s,
} as CSSProperties

type View = 'book' | 'front' | 'end' | number

function useSaved<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setValue({ ...initial, ...JSON.parse(saved) })
    } catch { /* no storage: defaults */ }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota or no storage */ }
  }, [key, value, loaded])
  return [value, setValue] as const
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi, '-').replace(/^-|-$/g, '')
const pad = (n: number) => String(n).padStart(2, '0')

export default function Level2BookPage() {
  const [view, setView] = useState<View>('book')
  const [saved, setInfo] = useSaved<BookInfo>(INFO_KEY, BOOK_INFO)
  const info: BookInfo = { ...saved, fontEn: EN_FONT }
  const [cover, setCover] = useSaved<CoverInfo>(COVER_KEY, BOOK_COVER)
  const book = useMemo(buildLevel2Book, [])

  const withFront = view === 'book' || view === 'front'
  const shown = book.pages.filter((p: L2Page) =>
    view === 'book' ? true : view === 'front' ? p.kind === 'welcome' || p.kind === 'contents' : view === 'end' ? p.kind === 'key' || p.kind === 'review' : p.unit === view)
  const count = (withFront ? 2 : 0) + shown.length
  const prefix = `level2${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`
  const set = <K extends keyof BookInfo>(k: K) => (v: BookInfo[K]) => setInfo(s => ({ ...s, [k]: v }))

  const coverStats: CoverStat[] = [
    { n: String(book.stats.units), ar: 'وحدة', en: 'Units' },
    { n: '20', ar: 'درسًا في القواعد', en: 'Grammar lessons' },
    { n: '20', ar: 'نموذجًا للكتابة', en: 'Writing models' },
    { n: '5', ar: 'مراجعات', en: 'Reviews' },
  ]

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto" style={PAGE_VARS}>
      <GamesHeader title="المستوى الثاني — تكلّم واكتب بدقّة (A2 → B1)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`مكتوب حتى الآن: ${book.stats.written} من ${book.stats.units} وحدة · ${book.pages.length} صفحة مرقّمة.`}>
            <select value={String(view)} onChange={e => setView(['book', 'front', 'end'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              <option value="front">البداية (الغلاف، الترحيب، الفهرس)</option>
              {L2_UNITS.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
              <option value="end">المراجعات والأجوبة</option>
            </select>
          </Field>
          {withFront && <CoverFields value={cover} onChange={setCover} defaults={BOOK_COVER} showBio={false} />}
          <Field label="الطباعة" hint="الألوان: لون ثابت لكل نوع من الأقسام. أبيض وأسود: للطباعة الاقتصادية.">
            <div className="grid grid-cols-2 gap-1.5">
              {([[false, 'بالألوان 🎨'], [true, 'أبيض وأسود']] as const).map(([v, label]) => (
                <button key={label} type="button" onClick={() => set('mono')(v)} aria-pressed={info.mono === v}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${info.mono === v ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>{label}</button>
              ))}
            </div>
          </Field>
          <Field label="نسخة لمشترٍ" hint="اسمه يظهر في صفحة الشكر وفي تذييل كل صفحة.">
            <input value={info.buyer} onChange={e => set('buyer')(e.target.value)} placeholder="مثلًا: سلمى" className={INP} />
          </Field>
          <PrintAllButton count={count} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withFront && <>
            <CoverPage info={cover} theme={THEMES[0]} stats={coverStats} filename={`${prefix}-000-cover`}
              badge={{ ar: 'المستوى الثاني', en: 'LEVEL 2' }}
              bubbles={[{ text: 'Have you ever been there?' }, { text: 'ما رأيك؟', ar: true }, { text: 'لو كنت مكانك…', ar: true }, { text: "I'd recommend it!" }]} />
            <ThanksPage info={info} filename={`${prefix}-000-thanks`} note={<Imprint info={info} />} />
          </>}
          {shown.map(p => {
            const no = book.pageNo(p)
            return (
              <LessonPage key={no} info={info} lesson={p} pageNo={no} talkNo={new Map()} exNo={book.exNo} spread
                colour={L2_TONES[L2_KIND_TONE[p.kind]]} toneOf={b => ('tone' in b && b.tone ? L2_TONES[b.tone as L2Tone] : undefined)}
                filename={`${prefix}-${String(no).padStart(3, '0')}-${p.unit ? `unit-${pad(p.unit)}-${p.kind}` : p.kind}`} />
            )
          })}
          {INDEX.length > L2_UNITS.length && (
            <p className="text-center text-[13px] font-bold text-zinc-400 print:hidden">الوحدات {L2_UNITS.length + 1}–{INDEX.length} قيد الكتابة.</p>
          )}
        </div>
      </div>
    </div>
  )
}
