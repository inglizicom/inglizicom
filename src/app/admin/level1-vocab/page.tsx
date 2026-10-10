'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildLevel1VocabBook, V_KIND_TONE, V_TONES, type VPage, type VTone } from '@/data/level1-vocab/book'
import { LEVEL1_VOCAB } from '@/data/level1-vocab'
import { PLAY } from '@/components/QrLink'
import { Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import { DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from '../level1-book/_blocks'

/**
 * /admin/level1-vocab — the extended vocabulary book of Level 1, printed with
 * the course book's own renderer and faces (Mali, Baloo Bhaijaan 2), so the
 * Level 1 box looks like one set: five pages a lesson (picture words, word
 * groups, practice, let's talk, read), each kind of page with its colour,
 * every lesson page with the QR code of its audio (/audio/vocab/13). The
 * content lives in src/data/level1-vocab.
 */

const INFO_KEY = 'level1-vocab-info-v1'
const COVER_KEY = 'level1-vocab-cover-v1'
const BOOK_INFO: BookInfo = { ...DEFAULT_INFO, title: 'كتاب المفردات — المستوى الأول', level: 'Level 1 · A0 → A1' }
const BOOK_COVER: CoverInfo = {
  ...DEFAULT_COVER, phone1: '+212 707 902 091', level: 'A0 → A1',
  titleAr1: 'كلمات أكثر', titleAr2: 'المستوى الأول', titleEn1: 'More Words', titleEn2: 'Level 1 Vocabulary',
}

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

export default function Level1VocabPage() {
  const [view, setView] = useState<View>('book')
  const [info, setInfo] = useSaved<BookInfo>(INFO_KEY, BOOK_INFO)
  const [cover, setCover] = useSaved<CoverInfo>(COVER_KEY, BOOK_COVER)
  const book = useMemo(buildLevel1VocabBook, [])

  const withFront = view === 'book' || view === 'front'
  const shown = book.pages.filter((p: VPage) =>
    view === 'book' ? true : view === 'front' ? p.kind === 'welcome' || p.kind === 'contents' : view === 'end' ? p.kind === 'key' : p.unit === view)
  const count = (withFront ? 2 : 0) + shown.length
  const prefix = `level1-vocab${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`
  const set = <K extends keyof BookInfo>(k: K) => (v: BookInfo[K]) => setInfo(s => ({ ...s, [k]: v }))

  const coverStats: CoverStat[] = [
    { n: String(book.stats.lessons), ar: 'درسًا', en: 'Lessons' },
    { n: `${Math.floor(book.stats.words / 10) * 10}+`, ar: 'كلمة جديدة', en: 'New words' },
    { n: String(LEVEL1_VOCAB.length * 2), ar: 'محادثة', en: 'Conversations' },
    { n: String(book.stats.exercises), ar: 'تمرينًا', en: 'Exercises' },
  ]

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="كتاب المفردات — المستوى الأول (A0 → A1)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${book.pages.length} صفحة مرقّمة: خمس صفحات لكل درس، مع رمز الاستماع في كل صفحة درس.`}>
            <select value={String(view)} onChange={e => setView(['book', 'front', 'end'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا</option>
              <option value="front">البداية (الغلاف، الترحيب، الفهرس)</option>
              {LEVEL1_VOCAB.map(u => <option key={u.n} value={u.n}>الدرس {u.n} — {u.titleAr}</option>)}
              <option value="end">الأجوبة</option>
            </select>
          </Field>
          {withFront && <CoverFields value={cover} onChange={setCover} defaults={BOOK_COVER} showBio={false} />}
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
            <CoverPage info={cover} theme={THEMES[2]} stats={coverStats} filename={`${prefix}-000-cover`}
              badge={{ ar: 'كتاب المفردات', en: 'VOCABULARY BOOK' }}
              bubbles={[{ text: 'What is this?' }, { text: 'ماذا تعني؟', ar: true }, { text: 'كيف أقولها؟', ar: true }, { text: 'I know this word!' }]} />
            <ThanksPage info={info} filename={`${prefix}-000-thanks`} />
          </>}
          {shown.map(p => {
            const no = book.pageNo(p)
            return (
              <LessonPage key={no} info={info} lesson={p} pageNo={no} talkNo={new Map()} exNo={book.exNo} spread
                colour={V_TONES[V_KIND_TONE[p.kind]]} toneOf={b => ('tone' in b && b.tone ? V_TONES[b.tone as VTone] : undefined)}
                qr={p.unit ? PLAY.vocab(p.unit) : undefined}
                filename={`${prefix}-${String(no).padStart(3, '0')}-${p.unit ? `lesson-${pad(p.unit)}-${p.kind}` : p.kind}`} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
