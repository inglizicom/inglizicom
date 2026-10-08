'use client'

import { useEffect, useMemo, useState } from 'react'
import { LEVEL1_LESSONS, type Block, type Lesson } from '@/data/level1-book'
import { LEVEL1_V2_LESSONS } from '@/data/level1-book-v2'
import { Field, GamesHeader, INP, PrintAllButton } from '../games/_shared'
import { ContentsPage, CoverPage, DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from './_blocks'

/**
 * /admin/level1-book — «الإنجليزية من الصفر (الدارجة)», Level 1 (A0 → A1):
 * cover, thank-you page, contents, then one page per lesson. Two editions of
 * the same nineteen-lesson path: the first (the Canva book's content) and the
 * second (all new words, readings and conversations, with the slips fixed). Lesson pages are numbered from 1 (lesson n is page
 * n when nothing is reordered); conversations are numbered across the book.
 *
 * The book is sold one copy at a time, so a copy can carry its buyer's name:
 * on the thank-you page, and (optional) in every page's footer.
 */

const INFO_KEY = 'level1-book-info-v1'

type View = 'book' | 'front' | number

/** Every practice conversation gets the next number, in reading order. */
function numberTalks(lessons: Lesson[]): Map<Block, number> {
  const map = new Map<Block, number>()
  let n = 0
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.t === 'talk' && !b.full) map.set(b, ++n)
      if (b.t === 'row') b.blocks.forEach(walk)
    }
  }
  lessons.forEach(l => walk(l.blocks))
  return map
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi, '-').replace(/^-|-$/g, '')

export default function Level1BookPage() {
  const [view, setView] = useState<View>('book')
  const [info, setInfo] = useState<BookInfo>(DEFAULT_INFO)
  const [loaded, setLoaded] = useState(false)
  const [edition, setEdition] = useState<1 | 2>(2)
  const BOOK = edition === 2 ? LEVEL1_V2_LESSONS : LEVEL1_LESSONS
  const talkNo = useMemo(() => numberTalks(BOOK), [BOOK])

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
  const showFront = view === 'book' || view === 'front'
  const lessons = BOOK.map((l, i) => ({ l, page: i + 1 }))
    .filter(({ l }) => view === 'book' || view === l.n)
  const count = (showFront ? 3 : 0) + lessons.length

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
          <Field label="عرض" hint={`${BOOK.length} درسًا، صفحة لكل درس، + الغلاف وصفحة الشكر والفهرس.`}>
            <select value={String(view)} onChange={e => setView(e.target.value === 'book' || e.target.value === 'front' ? e.target.value : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا ({BOOK.length + 3} صفحة)</option>
              <option value="front">البداية (الغلاف، الشكر، الفهرس)</option>
              {BOOK.map(l => <option key={l.n} value={l.n}>الدرس {l.n} — {l.titleAr}</option>)}
            </select>
          </Field>

          <Field label="النسخة" hint="نفس مسار الدروس. النسخة الثانية: مفردات وقراءات ومحادثات جديدة، مع تصحيح أخطاء الأولى.">
            <div className="grid grid-cols-2 gap-1.5">
              {([2, 1] as const).map(e => (
                <button key={e} type="button" onClick={() => { setEdition(e); setView('book') }} aria-pressed={edition === e}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${edition === e ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {e === 2 ? 'النسخة الجديدة' : 'النسخة الأولى'}
                </button>
              ))}
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
              <button type="button" onClick={() => setInfo(s => ({ ...DEFAULT_INFO, buyer: s.buyer, buyerFemale: s.buyerFemale, stamp: s.stamp, mono: s.mono }))}
                className="w-full text-[12px] font-bold text-zinc-400 hover:text-zinc-700">استرجاع البيانات الأصلية</button>
            </div>
          </Field>

          <PrintAllButton count={count} />
        </aside>

        <div className="space-y-8 min-w-0">
          {showFront && <>
            <CoverPage info={info} filename={`${prefix}-00-cover`} />
            <ThanksPage info={info} filename={`${prefix}-00-thanks`} />
            <ContentsPage info={info} lessons={BOOK} filename={`${prefix}-00-contents`} />
          </>}
          {lessons.map(({ l, page }) => (
            <LessonPage key={l.n} info={info} lesson={l} pageNo={page} talkNo={talkNo} filename={`${prefix}-lesson-${String(l.n).padStart(2, '0')}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
