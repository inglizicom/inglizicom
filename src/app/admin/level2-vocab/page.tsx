'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { buildLevel2VocabBook, L2_V_KIND_TONE, L2_V_TONES, type L2VPage, type L2VTone } from '@/data/level2-vocab/book'
import { LEVEL2_VOCAB } from '@/data/level2-vocab'
import { Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import { ViizaCover } from '../level2-book/_cover'
import { PLAY } from '@/components/QrLink'
import { DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from '../level1-book/_blocks'
import { Imprint } from '../everyday-book/_matter'

/**
 * /admin/level2-vocab — the extended vocabulary book of Level 2, printed with
 * the course book's renderer in the Level 2 book's adult face (Bricolage Grotesque, Arabic
 * in Baloo Bhaijaan 2, navy ink and cover), laid out like the Level 1 book:
 * six pages a unit (picture words, word groups, word power, practice, let's
 * talk, read), each kind of page with its colour. The content lives in
 * src/data/level2-vocab.
 */

const INFO_KEY = 'level2-vocab-info-v2'
const COVER_KEY = 'level2-vocab-cover-v1'
const EN_FONT = "'Bricolage Grotesque', 'Baloo Bhaijaan 2', sans-serif"
const BOOK_INFO: BookInfo = { ...DEFAULT_INFO, title: 'كتاب المفردات — فيزا إنگليش', level: 'VIIZA · A2 → B1', ink: '#0E1240', fontEn: EN_FONT }
const BOOK_COVER: CoverInfo = {
  ...DEFAULT_COVER, palette: 'navy', phone1: '+212 707 902 091', level: 'A2 → B1',
  titleAr1: 'كلمات أكثر', titleAr2: 'المستوى الثاني', titleEn1: 'More Words', titleEn2: 'Level 2 Vocabulary',
}

/** The Level 2 book's faces; the reading's key words in the reading colour. */
const PAGE_VARS = {
  '--book-en': "'Bricolage Grotesque'", '--book-head': "'Bricolage Grotesque', 'Baloo Bhaijaan 2'", '--book-ar': "'Baloo Bhaijaan 2'",
  '--book-display': "'Baloo Bhaijaan 2'", '--book-display-weight': '800',
  '--hl': L2_V_TONES.read.m,
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

export default function Level2VocabPage() {
  const [view, setView] = useState<View>('book')
  const [saved, setInfo] = useSaved<BookInfo>(INFO_KEY, BOOK_INFO)
  const info: BookInfo = { ...saved, fontEn: EN_FONT }
  const [cover, setCover] = useSaved<CoverInfo>(COVER_KEY, BOOK_COVER)
  const book = useMemo(buildLevel2VocabBook, [])

  const withFront = view === 'book' || view === 'front'
  const shown = book.pages.filter((p: L2VPage) =>
    view === 'book' ? true : view === 'front' ? p.kind === 'welcome' || p.kind === 'contents' : view === 'end' ? p.kind === 'key' : p.unit === view)
  const count = (withFront ? 2 : 0) + shown.length + (view === 'book' ? 1 : 0)
  const prefix = `level2-vocab${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`
  const set = <K extends keyof BookInfo>(k: K) => (v: BookInfo[K]) => setInfo(s => ({ ...s, [k]: v }))

  const coverStats: CoverStat[] = [
    { n: String(book.stats.units), ar: 'وحدة', en: 'Units' },
    { n: `${Math.floor(book.stats.words / 100) * 100}+`, ar: 'كلمة وعبارة', en: 'Words & phrases' },
    { n: String(LEVEL2_VOCAB.length * 2), ar: 'محادثة', en: 'Conversations' },
    { n: String(book.stats.exercises), ar: 'تمرينًا', en: 'Exercises' },
  ]

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto" style={PAGE_VARS}>
      <GamesHeader title="كتاب المفردات — المستوى الثاني (A2 → B1)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${book.pages.length} صفحة مرقّمة: ست صفحات لكل وحدة.`}>
            <select value={String(view)} onChange={e => setView(['book', 'front', 'end'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              <option value="front">البداية (الغلاف، الترحيب، الفهرس)</option>
              {LEVEL2_VOCAB.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
              <option value="end">الأجوبة</option>
            </select>
          </Field>
          <Field label="الطباعة" hint="الألوان: لون ثابت لكل نوع من الصفحات. أبيض وأسود: للطباعة الاقتصادية.">
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
            <ViizaCover book="vocab" side="front" filename={`${prefix}-000-cover`} />
            <ThanksPage info={info} filename={`${prefix}-000-thanks`} note={<Imprint info={info} />} />
          </>}
          {shown.map(p => {
            const no = book.pageNo(p)
            return (
              <LessonPage key={no} info={info} lesson={p} pageNo={no} talkNo={new Map()} exNo={book.exNo} spread
                colour={L2_V_TONES[L2_V_KIND_TONE[p.kind]]} toneOf={b => ('tone' in b && b.tone ? L2_V_TONES[b.tone as L2VTone] : undefined)}
                qr={p.unit ? PLAY.l2vocab(p.unit) : PLAY.library}
                filename={`${prefix}-${String(no).padStart(3, '0')}-${p.unit ? `unit-${pad(p.unit)}-${p.kind}` : p.kind}`} />
            )
          })}
          {view === 'book' && <ViizaCover book="vocab" side="back" filename={`${prefix}-999-back-cover`} />}
        </div>
      </div>
    </div>
  )
}
