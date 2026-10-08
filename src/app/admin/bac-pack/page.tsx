'use client'

import { useEffect, useMemo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { buildBacPack, SECTION_NAMES } from '@/data/bac/bac-pack'
import { BAC_MOCKS } from '@/data/bac/bac-mocks'
import type { BacSection } from '@/data/bac/bac-helpers'
import { Field, GamesHeader, INP, PrintAllButton, THEMES } from '../games/_shared'
import { CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import { DEFAULT_INFO, LessonPage, ThanksPage, type BookInfo } from '../level1-book/_blocks'

/**
 * /admin/bac-pack — «الإنجليزية للباكالوريا»: the Bac English exam pack for
 * every stream, as print-ready A4 pages. Cover · thank-you · contents ·
 * reading, vocabulary, grammar, functions and writing pages · five mock exams
 * in the national format · answer keys. The pages reuse the Level 1 book's
 * renderer; contents and keys are built from the data (src/data/bac), so page
 * and exercise numbers always agree.
 *
 * Like the Level 1 book, a copy can carry its buyer's name.
 */

const INFO_KEY = 'bac-pack-info-v1'
const COVER_KEY = 'bac-pack-cover-v1'

const BAC_INFO: BookInfo = { ...DEFAULT_INFO, title: 'الإنجليزية للباكالوريا', level: '2 Bac · All streams' }
const BAC_COVER: CoverInfo = {
  ...DEFAULT_COVER,
  titleAr1: 'الإنجليزية', titleAr2: 'للباكالوريا - كل الشعب',
  titleEn1: 'Bac English', titleEn2: 'The Complete Exam Pack',
  level: '2 Bac', phone1: '+212 707 902 091',
}

type View = 'book' | 'front' | BacSection

/** A small saved state: read once from localStorage, written on change. */
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
const SECTIONS: BacSection[] = ['start', 'reading', 'vocab', 'grammar', 'functions', 'writing', 'exam', 'key']

export default function BacPackPage() {
  const [view, setView] = useState<View>('book')
  const [info, setInfo] = useSaved<BookInfo>(INFO_KEY, BAC_INFO)
  const [cover, setCover] = useSaved<CoverInfo>(COVER_KEY, BAC_COVER)
  const pack = useMemo(buildBacPack, [])

  const showFront = view === 'book' || view === 'front'
  const shown = pack.pages.filter(p => view === 'book' || (view === 'front' ? p.section === 'contents' : p.section === view))
  const count = (showFront ? 2 : 0) + shown.length
  const prefix = `bac${info.buyer.trim() ? `-${slug(info.buyer)}` : ''}`

  const stats: CoverStat[] = [
    { n: String(BAC_MOCKS.length), ar: 'امتحانات تجريبية', en: 'Mock exams' },
    { n: String(pack.exercises), ar: 'تمرين', en: 'Exercises' },
    { n: String(pack.pages.length), ar: 'صفحة', en: 'Pages' },
    { icon: <KeyRound size={28} strokeWidth={2.6} />, ar: 'مفاتيح الحل', en: 'Answer keys' },
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
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="حقيبة الباك — الإنجليزية للباكالوريا (كل الشعب)" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`${pack.pages.length} صفحة مرقّمة + الغلاف وصفحة الشكر. ${pack.exercises} تمرينًا، وأجوبتها كلها في مفاتيح الحل.`}>
            <select value={view} onChange={e => setView(e.target.value as View)} className={INP}>
              <option value="book">الكتاب كاملًا ({pack.pages.length + 2} صفحة)</option>
              <option value="front">البداية (الغلاف، الشكر، الفهرس)</option>
              {SECTIONS.map(s => <option key={s} value={s}>{SECTION_NAMES[s][1]} ({pack.pages.filter(p => p.section === s).length})</option>)}
            </select>
          </Field>

          {showFront && <CoverFields value={cover} onChange={setCover} defaults={BAC_COVER} />}

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

          <Field label="الطباعة" hint="الألوان: لون لكل قسم. أبيض وأسود: للطباعة الاقتصادية.">
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
              <button type="button" onClick={() => setInfo(s => ({ ...BAC_INFO, buyer: s.buyer, buyerFemale: s.buyerFemale, stamp: s.stamp, mono: s.mono, code: s.code, showCode: s.showCode }))}
                className="w-full text-[12px] font-bold text-zinc-400 hover:text-zinc-700">استرجاع البيانات الأصلية</button>
            </div>
          </Field>

          <PrintAllButton count={count} />
        </aside>

        <div className="space-y-8 min-w-0">
          {showFront && <>
            <CoverPage info={cover} theme={THEMES[0]} stats={stats} filename={`${prefix}-00-cover`}
              badge={{ ar: 'حقيبة الباك', en: 'BAC EXAM PACK' }}
              bubbles={[{ text: 'Justify your answer.' }, { text: 'كيف أكتب الموضوع؟', ar: true }, { text: 'ما هي الوظيفة؟', ar: true }, { text: 'I wish I had revised!' }]} />
            <ThanksPage info={info} filename={`${prefix}-00-thanks`} />
          </>}
          {shown.map(p => {
            const no = pack.pageNo(p)
            return <LessonPage key={no} info={info} lesson={p} pageNo={no} talkNo={new Map()} exNo={pack.exNo} filename={`${prefix}-${String(no).padStart(2, '0')}-${slug(p.tag ?? p.section)}`} />
          })}
        </div>
      </div>
    </div>
  )
}
