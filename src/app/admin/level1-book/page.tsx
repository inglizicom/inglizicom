'use client'

import { useEffect, useMemo, useState } from 'react'
import { LEVEL1_LESSONS, type Block, type Lesson } from '@/data/level1-book'
import { LEVEL1_V2_LESSONS } from '@/data/level1-book-v2'
import { LEVEL1_REVIEWS, LEVEL1_STARTER, STARTER_REVIEW } from '@/data/level1-book-extra'
import { Field, GamesHeader, INP, PrintAllButton } from '../games/_shared'
import { ContentsPage, DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo, type ContentsEntry } from './_blocks'
import { SeriesCover } from '../level2-book/_cover'
import { PLAY } from '@/components/QrLink'

/**
 * /admin/level1-book — «الإنجليزية من الصفر (الدارجة)», Level 1 (A0 → A1):
 * cover, thank-you page, contents, then the lessons. Two editions of the same
 * nineteen-lesson path: the first (the Canva book's content) and the second
 * (all new words, readings and conversations, with the slips fixed).
 *
 * The second edition also opens with the Starter (S1–S8: reading, days,
 * months, seasons, colours, the senses, the body — data/level1-book-extra.ts),
 * lets a lesson run over several pages (a `pageBreak` block), adds a review
 * after every three lessons from Lesson 7 on, and ends with an answer key
 * built from every exercise. The Starter's pages are numbered i, ii, iii…, so the
 * main pages still start at 1 and Lessons 1–6 keep the pages they were
 * recorded on. Conversations and exercises are numbered across the book.
 *
 * The book is sold one copy at a time, so a copy can carry its buyer's name:
 * on the thank-you page, and (optional) in every page's footer.
 */

const INFO_KEY = 'level1-book-info-v1'

type View = 'book' | 'front' | string

/** One printed page. */
interface Page { key: string; lesson: Lesson; pageNo: number; label: string; filename: string; qr?: string; first: boolean; sign: string }

/** A lesson's printed pages: it splits at each `pageBreak` block. */
function partsOf(l: Lesson): Lesson[] {
  const parts: Block[][] = [[]]
  for (const b of l.blocks) {
    if (b.t === 'pageBreak') parts.push([])
    else parts[parts.length - 1].push(b)
  }
  return parts.filter(p => p.length).map(blocks => ({ ...l, blocks }))
}

/** Every block of a page, rows included, in reading order. */
function* walk(blocks: Block[]): Generator<Block> {
  for (const b of blocks) {
    yield b
    if (b.t === 'row') for (const col of b.blocks) yield* walk(col)
  }
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi, '-').replace(/^-|-$/g, '')
const two = (n: number) => String(n).padStart(2, '0')
/** Front-matter numbering for the Starter (i, ii, iii…): "S07" read as "507" in the footer font. */
const roman = (n: number) => [['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]].reduce((s, [r, v]) => {
  let out = s
  while (n >= (v as number)) { out += r; n -= v as number }
  return out
}, '')

export default function Level1BookPage() {
  const [view, setView] = useState<View>('book')
  const [info, setInfo] = useState<BookInfo>(DEFAULT_INFO)
  const [loaded, setLoaded] = useState(false)
  const [edition, setEdition] = useState<1 | 2>(2)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(INFO_KEY)
      if (saved) setInfo({ ...DEFAULT_INFO, ...JSON.parse(saved) })
    } catch { /* no storage: defaults */ }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(INFO_KEY, JSON.stringify(info)) } catch { /* no storage */ }
  }, [info, loaded])

  const prefix = `level1${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`

  // The whole book as printed pages, in order.
  const { pages, contents, talkNo, exNo } = useMemo(() => {
    const out: Page[] = []
    const sign = (l: Lesson) => l.tag ?? `الدرس ${l.n}`
    if (edition === 2) {
      ;[...LEVEL1_STARTER, STARTER_REVIEW].forEach(l => partsOf(l).forEach((p, k) => {
        const s = out.length + 1
        out.push({ key: `s-${l.n}-${k}`, lesson: p, pageNo: s, label: roman(s), filename: `${prefix}-starter-${two(s)}`, first: k === 0, sign: sign(l) })
      }))
    }
    const startMain = out.length
    const book = edition === 2 ? LEVEL1_V2_LESSONS : LEVEL1_LESSONS
    const addMain = (l: Lesson, qr: string | undefined, file: string) => partsOf(l).forEach((p, k) => {
      const n = out.length - startMain + 1
      out.push({ key: `${file}-${k}`, lesson: p, pageNo: n, label: two(n), filename: `${prefix}-${file}${k ? `-${k + 1}` : ''}`, qr, first: k === 0, sign: sign(l) })
    })
    for (const l of book) {
      addMain(l, edition === 2 ? PLAY.book(l.n) : undefined, `lesson-${two(l.n)}`)
      if (edition === 2) for (const r of LEVEL1_REVIEWS.filter(x => x.after === l.n)) addMain(r.lesson, undefined, `review-${r.lesson.n - 200}`)
    }

    // Conversations and exercises are numbered across the book, in reading order.
    const talkNo = new Map<Block, number>()
    const exNo = new Map<Block, number>()
    const keyItems: { label: string; answers: string[] }[] = []
    for (const p of out) for (const b of walk(p.lesson.blocks)) {
      if (b.t === 'talk' && !b.full) talkNo.set(b, talkNo.size + 1)
      if (b.t === 'exercise') {
        exNo.set(b, exNo.size + 1)
        keyItems.push({ label: `Ex. ${exNo.size} · p. ${p.label}`, answers: b.items.map(i => i.a) })
      }
    }
    const key: Page | null = keyItems.length ? {
      key: 'answer-key', pageNo: out.length - startMain + 1, label: two(out.length - startMain + 1), filename: `${prefix}-answer-key`, first: true, sign: 'Answer Key',
      lesson: { n: 300, tag: 'Answer Key', titleAr: 'الأجوبة', blocks: [{ t: 'banner', title: 'Answer Key - الأجوبة', icons: ['🔑', '✅'] }, { t: 'key', items: keyItems }] },
    } : null

    const contents: ContentsEntry[] = [...out, ...(key ? [key] : [])].filter(p => p.first).map(p => ({ sign: p.sign, title: p.lesson.titleAr, page: p.label }))
    return { pages: key ? [...out, key] : out, contents, talkNo, exNo }
  }, [edition, prefix])

  const showFront = view === 'book' || view === 'front'
  const shown = pages.filter(p => view === 'book' || view === p.key)
  const count = (showFront ? 3 : 0) + shown.length + (view === 'book' ? 1 : 0)

  const set = <K extends keyof BookInfo>(k: K) => (v: BookInfo[K]) => setInfo(s => ({ ...s, [k]: v }))
  const text = (label: string, k: 'title' | 'level' | 'teacher' | 'teacherAr' | 'phone' | 'website' | 'buyer', ltr?: boolean, placeholder?: string) => (
    <label className="block">
      <span className="block text-[11.5px] font-bold text-zinc-400 mb-0.5">{label}</span>
      <input value={info[k]} onChange={e => set(k)(e.target.value)} dir={ltr ? 'ltr' : 'rtl'} placeholder={placeholder} className={INP} />
    </label>
  )

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="كتاب المستوى الأول — الإنجليزية من الصفر (الدارجة)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${pages.length} صفحة + الغلاف وصفحة الشكر والفهرس.`}>
            <select value={view} onChange={e => setView(e.target.value)} className={INP}>
              <option value="book">الكتاب كاملًا ({pages.length + 3} صفحة)</option>
              <option value="front">البداية (الغلاف، الشكر، الفهرس)</option>
              {pages.map(p => <option key={p.key} value={p.key}>{p.label} — {p.sign} — {p.lesson.titleAr}</option>)}
            </select>
          </Field>

          <Field label="النسخة" hint="النسخة الجديدة: البداية (S1–S8)، دروس على أكثر من صفحة، مراجعة كل 3 دروس، وصفحة الأجوبة.">
            <div className="grid grid-cols-2 gap-1.5">
              {([2, 1] as const).map(e => (
                <button key={e} type="button" onClick={() => { setEdition(e); setView('book') }} aria-pressed={edition === e}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${edition === e ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {e === 2 ? 'النسخة الجديدة' : 'النسخة الأولى'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="الكود (QR / Barcode)" hint="صورة واحدة تظهر في كل الصفحات. إلى أن تضيفها يبقى مكانها محجوزًا.">
            <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
              <label className="flex items-center gap-2 text-[12.5px] font-bold text-zinc-700">
                <input type="checkbox" checked={info.showCode} onChange={e => set('showCode')(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                إظهار مكان الكود في كل صفحة
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 inline-flex items-center justify-center rounded-lg border border-dashed border-zinc-300 py-2 text-[12.5px] font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50">
                  {info.code ? 'تغيير صورة الكود' : 'رفع صورة الكود'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const r = new FileReader()
                    r.onload = () => set('code')(String(r.result))
                    r.readAsDataURL(file)
                    e.target.value = ''
                  }} />
                </label>
                {info.code && <button type="button" onClick={() => set('code')(null)} className="rounded-lg border border-zinc-200 px-2.5 py-2 text-[12px] font-bold text-zinc-500 hover:bg-zinc-50">إزالة</button>}
              </div>
            </div>
          </Field>

          <Field label="الطباعة" hint="الألوان: لون لكل درس ورموز ملوّنة. أبيض وأسود: للطباعة الاقتصادية.">
            <div className="grid grid-cols-2 gap-1.5">
              {[false, true].map(m => (
                <button key={String(m)} type="button" onClick={() => set('mono')(m)} aria-pressed={info.mono === m}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${info.mono === m ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {m ? 'أبيض وأسود' : 'بالألوان 🎨'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="نسخة لمشترٍ" hint="اسمه يظهر في صفحة الشكر، وفي تذييل كل صفحة إن شئت — ويُضاف إلى أسماء الملفات.">
            <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
              {text('اسم المشتري', 'buyer', false, 'مثلًا: أنور')}
              <div className="flex gap-1.5">
                {[false, true].map(f => (
                  <button key={String(f)} type="button" onClick={() => set('buyerFemale')(f)}
                    className={`flex-1 rounded-lg border py-1.5 text-[12.5px] font-bold ${info.buyerFemale === f ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                    {f ? 'مؤنث' : 'مذكر'}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[12.5px] font-bold text-zinc-700">
                <input type="checkbox" checked={info.stamp} onChange={e => set('stamp')(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                الاسم في تذييل كل صفحة
              </label>
            </div>
          </Field>

          <Field label="بيانات الكتاب" hint="تُحفظ في متصفحك.">
            <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
              {text('عنوان الكتاب', 'title')}
              {text('Level', 'level', true)}
              {text('Teacher (English)', 'teacher', true)}
              {text('اسم الأستاذ', 'teacherAr')}
              {text('الهاتف / واتساب', 'phone', true)}
              {text('الموقع', 'website', true)}
              <button type="button" onClick={() => setInfo(s => ({ ...DEFAULT_INFO, buyer: s.buyer, buyerFemale: s.buyerFemale, stamp: s.stamp, mono: s.mono, code: s.code, showCode: s.showCode }))}
                className="w-full text-[12px] font-bold text-zinc-400 hover:text-zinc-700">استرجاع البيانات الأصلية</button>
            </div>
          </Field>

          <PrintAllButton count={count} />
        </aside>

        <div className="space-y-8 min-w-0">
          {showFront && <>
            <SeriesCover series="lakaart" book="book" side="front" filename={`${prefix}-00-cover`} />
            <ThanksPage info={info} filename={`${prefix}-00-thanks`} />
            <ContentsPage info={info} entries={contents} filename={`${prefix}-00-contents`} />
          </>}
          {shown.map(p => (
            <LessonPage key={p.key} info={info} lesson={p.lesson} pageNo={p.pageNo} pageLabel={p.label} talkNo={talkNo} exNo={exNo}
              filename={p.filename} qr={p.qr} />
          ))}
          {view === 'book' && <SeriesCover series="lakaart" book="book" side="back" filename={`${prefix}-99-back-cover`} />}
        </div>
      </div>
    </div>
  )
}
