'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { buildEverydayBook, EVERYDAY_UNITS, KIND_TONE, OPENERS, TONES, type EverydayPage, type Tone } from '@/data/everyday-book'
import { Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { BackCoverPage, CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import { DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from '../level1-book/_blocks'
import { CertificatePage, Imprint, NextStepPage, ValuePage } from './_matter'
import { ProgressPage, UnitOpenerPage, WordListPage } from './_pages'
import { BOOK_FONT_VARS, EN_FONT } from './_fonts'

/**
 * /admin/everyday-book — «الإنجليزية للمواقف اليومية» (A1 → A2), the main
 * textbook, rebuilt in the house style of the Level 1 book and the Bac pack:
 * the same page frame, header and footer, QR slot and buyer copy, in the
 * brand's brown and gold, one colour per unit, and the Level 1 book's two
 * faces: Mali for English, Baloo Bhaijaan 2 for Arabic (see _fonts.ts).
 *
 * Order: cover · «why this book» · thank-you (with the copyright notice) ·
 * welcome · how to use · contents · progress tracker · 19 units (opener,
 * vocabulary, expressions, conversation, reading + «Make it yours») · word
 * list A–Z · certificate · «your next step» · back cover. The content lives
 * in src/data/everyday-book.
 */

const INFO_KEY = 'everyday-book-info-v1'
const COVER_KEY = 'everyday-book-cover-v2'   // v2: the cover in the book's brown and gold

const BOOK_INFO: BookInfo = {
  ...DEFAULT_INFO, title: 'الإنجليزية للمواقف اليومية', level: 'A1 → A2', ink: '#2A1D12', fontEn: EN_FONT,
}
const BOOK_COVER: CoverInfo = { ...DEFAULT_COVER, palette: 'brown', phone1: '+212 707 902 091' }

type View = 'book' | 'front' | 'reviews' | 'end' | number
/** The book's faces, and its highlights in the colour key: vocabulary words blue, key sentences on the expressions' green. */
const PAGE_VARS = { ...BOOK_FONT_VARS, '--hl': TONES.vocab.m, '--key': TONES.expr.m, '--key-s': TONES.expr.s } as CSSProperties
const FRONT: EverydayPage['kind'][] = ['welcome', 'howto', 'contents', 'progress']

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
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota (photo) or no storage */ }
  }, [key, value, loaded])
  return [value, setValue] as const
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi, '-').replace(/^-|-$/g, '')
const pad = (n: number) => String(n).padStart(2, '0')

export default function EverydayBookPage() {
  const [view, setView] = useState<View>('book')
  const [saved, setInfo] = useSaved<BookInfo>(INFO_KEY, BOOK_INFO)
  // The faces are the book's, not a saved setting (an older copy saved another English face).
  const info: BookInfo = { ...saved, fontEn: EN_FONT }
  const [cover, setCover] = useSaved<CoverInfo>(COVER_KEY, BOOK_COVER)
  const book = useMemo(buildEverydayBook, [])
  const { stats } = book

  const withFront = view === 'book' || view === 'front'
  const withEnd = view === 'book' || view === 'end'
  const shown = book.pages.filter((p: EverydayPage) =>
    view === 'book' ? true : view === 'front' ? FRONT.includes(p.kind) : view === 'end' ? p.kind === 'key' || p.kind === 'wordlist' : view === 'reviews' ? p.kind === 'review' : p.unit === view)
  const count = (withFront ? 3 : 0) + shown.length + (withEnd ? 3 : 0)
  const prefix = `everyday${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`

  const coverStats: CoverStat[] = [
    { n: String(stats.units), ar: 'موقفًا', en: 'Situations' },
    { n: `${Math.floor(stats.words / 10) * 10}+`, ar: 'كلمة', en: 'Words' },
    { n: `${Math.floor(stats.expressions / 10) * 10}+`, ar: 'عبارة', en: 'Expressions' },
    { n: String(stats.units), ar: 'محادثة', en: 'Conversations' },
  ]

  const set = <K extends keyof BookInfo>(k: K) => (v: BookInfo[K]) => setInfo(s => ({ ...s, [k]: v }))
  const text = (label: string, k: 'title' | 'level' | 'teacher' | 'teacherAr' | 'phone' | 'website' | 'buyer', ltr?: boolean, placeholder?: string) => (
    <label className="block">
      <span className="block text-[11.5px] font-bold text-zinc-400 mb-0.5">{label}</span>
      <input value={info[k]} onChange={e => set(k)(e.target.value)} dir={ltr ? 'ltr' : 'rtl'} placeholder={placeholder} className={INP} />
    </label>
  )
  const toggle = <T,>(value: T, options: [T, string][], onPick: (v: T) => void) => (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map(([v, label]) => (
        <button key={String(v)} type="button" onClick={() => onPick(v)} aria-pressed={value === v}
          className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${value === v ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto" style={PAGE_VARS}>
      <GamesHeader title="الكتاب الأساسي — الإنجليزية للمواقف اليومية (A1 → A2)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${book.pages.length} صفحة مرقّمة + الغلاف وصفحتا التسويق والشكر والشهادة والغلاف الخلفي.`}>
            <select value={String(view)} onChange={e => setView(['book', 'front', 'reviews', 'end'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا ({book.pages.length + 6} صفحة)</option>
              <option value="front">البداية (الغلاف، لماذا هذا الكتاب، الشكر، الترحيب، الفهرس، تقدّمي)</option>
              {EVERYDAY_UNITS.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
              <option value="reviews">المراجعات (4 صفحات)</option>
              <option value="end">النهاية (الأجوبة، قائمة الكلمات، الشهادة، خطوتك التالية، الغلاف الخلفي)</option>
            </select>
          </Field>

          {(withFront || withEnd) && <CoverFields value={cover} onChange={setCover} defaults={BOOK_COVER} showBio={withEnd} />}

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

          <Field label="الطباعة" hint="الألوان: لون ثابت لكل نوع من الأقسام في الكتاب كله. أبيض وأسود: للطباعة الاقتصادية.">
            {toggle(info.mono, [[false, 'بالألوان 🎨'], [true, 'أبيض وأسود']], set('mono'))}
          </Field>

          <Field label="نسخة لمشترٍ" hint="اسمه يظهر في صفحة الشكر، وفي تذييل كل صفحة إن شئت — ويُضاف إلى أسماء الملفات.">
            <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
              {text('اسم المشتري', 'buyer', false, 'مثلًا: سلمى')}
              {toggle(info.buyerFemale, [[false, 'مذكر'], [true, 'مؤنث']], set('buyerFemale'))}
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
              <button type="button" onClick={() => setInfo(s => ({ ...BOOK_INFO, buyer: s.buyer, buyerFemale: s.buyerFemale, stamp: s.stamp, mono: s.mono, code: s.code, showCode: s.showCode }))}
                className="w-full text-[12px] font-bold text-zinc-400 hover:text-zinc-700">استرجاع البيانات الأصلية</button>
            </div>
          </Field>

          <PrintAllButton count={count} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withFront && <>
            <CoverPage info={cover} theme={THEMES[0]} stats={coverStats} filename={`${prefix}-000-cover`}
              badge={{ ar: 'الكتاب الأساسي', en: 'TEXTBOOK' }}
              bubbles={[{ text: 'Can I pay by card?' }, { text: 'بكم هذا؟', ar: true }, { text: 'أين المحطة؟', ar: true }, { text: "I'd like a coffee, please." }]} />
            <ValuePage info={info} stats={stats} units={EVERYDAY_UNITS} filename={`${prefix}-000-why`} />
            <ThanksPage info={info} filename={`${prefix}-000-thanks`} note={<Imprint info={info} />} />
          </>}
          {shown.map(p => {
            const no = book.pageNo(p)
            const filename = `${prefix}-${String(no).padStart(3, '0')}-${p.unit ? `unit-${pad(p.unit)}-${p.kind}` : p.kind}`
            if (p.kind === 'opener' && p.unit) {
              const parts = { vocab: book.unitPage(p.unit, 'vocab'), expressions: book.unitPage(p.unit, 'expressions'), talk: book.unitPage(p.unit, 'talk'), reading: book.unitPage(p.unit, 'reading') }
              return <UnitOpenerPage key={no} info={info} unit={EVERYDAY_UNITS[p.unit - 1]} opener={OPENERS[p.unit]} parts={parts} pageNo={no} filename={filename} />
            }
            if (p.kind === 'progress') return <ProgressPage key={no} info={info} units={EVERYDAY_UNITS} pageNo={no} filename={filename} />
            if (p.kind === 'wordlist') return <WordListPage key={no} info={info} words={p.words ?? []} first={book.pages.find(q => q.kind === 'wordlist') === p} pageNo={no} filename={filename} />
            return (
              // The colour key: the page's kind on its frame, each section in the colour of its own kind; room shared out.
              <LessonPage key={no} info={info} lesson={p} pageNo={no} talkNo={new Map()} exNo={book.exNo} spread
                colour={TONES[KIND_TONE[p.kind]]} toneOf={b => ('tone' in b && b.tone ? TONES[b.tone as Tone] : undefined)} filename={filename} />
            )
          })}
          {withEnd && <>
            <CertificatePage info={info} stats={stats} filename={`${prefix}-997-certificate`} />
            <NextStepPage info={info} filename={`${prefix}-998-next`} />
            <BackCoverPage info={cover} theme={THEMES[0]} filename={`${prefix}-999-back-cover`}
              headline={{ ar: 'تكلّم الإنجليزية في حياتك اليومية.', en: 'Speak English in real life.' }}
              blurbAr={`كتاب عملي يعلّمك ماذا تقول وكيف تردّ في ${stats.units} موقفًا من الحياة اليومية: المقهى، المطبخ، السوق، الطبيب، الفندق، البنك، الهاتف وغيرها. في كل وحدة: مفردات مصوّرة، عبارات مفيدة مع ترجمتها، محادثة كاملة، نصّ قراءة، ومهام لتتكلّم عن حياتك أنت.`}
              bullets={[
                { ar: `${stats.units} موقفًا حقيقيًا من الحياة اليومية`, en: `${stats.units} real everyday situations` },
                { ar: `أكثر من ${Math.floor(stats.words / 10) * 10} كلمة مع صورها وترجمتها`, en: `${Math.floor(stats.words / 10) * 10}+ words with pictures and translations` },
                { ar: `أكثر من ${Math.floor(stats.expressions / 10) * 10} عبارة مفيدة مع ترجمتها`, en: `${Math.floor(stats.expressions / 10) * 10}+ useful expressions, translated` },
                { ar: `${stats.units} محادثة كاملة و${stats.units} نصّ قراءة`, en: `${stats.units} conversations and ${stats.units} readings` },
                { ar: 'أهداف ونصيحة لغوية في كل وحدة، وقائمة كلمات، وشهادة إتمام', en: 'Unit goals and tips, an A–Z word list, a certificate' },
              ]}
              series={[
                { ar: 'الكتاب الأساسي', en: 'Textbook', current: true },
                { ar: 'دفتر التمارين', en: 'Workbook' },
                { ar: 'كتاب المفردات', en: 'Vocabulary book' },
              ]} />
          </>}
        </div>
      </div>
    </div>
  )
}
