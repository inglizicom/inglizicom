'use client'

import { useEffect, useMemo, useState } from 'react'
import { VOCAB_BOOK, type VocabBookUnit } from '@/data/workbook/vocab-book-all'
import { Field, GamesHeader, INP, PrintAllButton, THEMES, ThemePicker, type SheetTheme } from '../games/_shared'
import { BackCoverPage, CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo, type CoverStat } from '../games/_cover'
import {
  AnswersBody, CommonBody, ContentsBody, FinalBody, IndexBody, MatterPage, PARTS, ReadingBody, TalkBody, UnitPage,
  VocabBody, WhyBody, type IndexLine, type Part,
} from './_pages'

/**
 * /admin/vocab-book — «مفردات وعبارات للمواقف اليومية», the companion
 * vocabulary book of the main textbook, as print-ready A4 pages.
 *
 * Order: cover · contents · why this book · 19 units × 4 pages · A–Z word
 * index · reading answers · final thought · back cover. Like the workbook,
 * every view is a slice of the full layout, so a page keeps the number it has
 * in the printed book; the covers carry none.
 */

const COVER_KEY = 'vocab-cover-v1'
const VOCAB_COVER: CoverInfo = {
  ...DEFAULT_COVER,
  titleAr1: 'مفردات وعبارات', titleAr2: 'للمواقف اليومية',
  titleEn1: 'Everyday', titleEn2: 'Vocabulary & Expressions',
}

type Entry =
  | { kind: 'contents' } | { kind: 'why' }
  | { kind: 'unit'; u: VocabBookUnit; part: Part }
  | { kind: 'index'; cols: IndexLine[][]; no: number }
  | { kind: 'answers' } | { kind: 'final' }

type View = 'book' | 'cover' | 'front' | 'end' | 'back' | number

/* A–Z index geometry (px), matching IndexBody: the body of a front-matter
   page holds ~925 px; an entry is 19 px, a letter heading 32 px. */
const INDEX_H = 925, INDEX_INTRO = 34, ENTRY_H = 19, LETTER_H = 32

/** "a pot of tea" is filed under P, like a printed dictionary. */
const sortKey = (en: string) => en.replace(/^(a|an|the)\s+/i, '')

function paginateIndex(entries: { en: string; ar: string; page: number | null }[]): IndexLine[][][] {
  const pages: IndexLine[][][] = []
  let cols: IndexLine[][] = [[]]
  let used = 0
  const cap = () => INDEX_H - (pages.length === 0 ? INDEX_INTRO : 0)
  const nextCol = () => {
    if (cols.length === 3) { pages.push(cols); cols = [[]] } else cols.push([])
    used = 0
  }
  let letter = ''
  for (const e of entries) {
    const l = sortKey(e.en)[0].toUpperCase()
    if (l !== letter) {
      letter = l
      if (used + LETTER_H + ENTRY_H > cap()) nextCol()   // never a heading alone at a column's foot
      cols[cols.length - 1].push({ letter: l }); used += LETTER_H
    }
    if (used + ENTRY_H > cap()) nextCol()
    cols[cols.length - 1].push(e); used += ENTRY_H
  }
  if (cols.some(c => c.length)) pages.push(cols)
  return pages
}

export default function VocabBookPage() {
  const [view, setView] = useState<View>('book')
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [numbered, setNumbered] = useState(true)
  const [startNo, setStartNo] = useState(1)
  const [cover, setCover] = useState<CoverInfo>(VOCAB_COVER)
  const [coverLoaded, setCoverLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COVER_KEY)
      if (saved) setCover({ ...VOCAB_COVER, ...JSON.parse(saved) })
    } catch { /* no storage: keep the defaults */ }
    setCoverLoaded(true)
  }, [])
  useEffect(() => {
    if (!coverLoaded) return
    try { localStorage.setItem(COVER_KEY, JSON.stringify(cover)) } catch { /* quota (large photo) or no storage */ }
  }, [cover, coverLoaded])

  /* The full layout. Unit pages come before the index, so their numbers are
     known when the index is built. */
  const { full, words } = useMemo(() => {
    const full: Entry[] = [{ kind: 'contents' }, { kind: 'why' }]
    for (const u of VOCAB_BOOK) for (const part of PARTS) full.push({ kind: 'unit', u, part })
    const at = (u: VocabBookUnit, part: Part) => full.findIndex(e => e.kind === 'unit' && e.u === u && e.part === part)

    const seen = new Set<string>()
    const entries: { en: string; ar: string; at: number }[] = []
    const add = (en: string, ar: string, idx: number) => {
      const k = en.toLowerCase()
      if (seen.has(k)) return
      seen.add(k); entries.push({ en, ar, at: idx })
    }
    for (const u of VOCAB_BOOK) {
      for (const e of u.vocab) add(e.en, e.ar, at(u, 'vocab'))
      for (const gp of u.groups) for (const w of gp.words) add(w.en, w.ar, at(u, 'common'))
    }
    entries.sort((a, b) => sortKey(a.en).localeCompare(sortKey(b.en), 'en', { sensitivity: 'base' }))
    return { full, words: entries }
  }, [])

  const pageNoOf = (i: number) => (numbered ? startNo + i : null)
  const indexPages = paginateIndex(words.map(w => ({ en: w.en, ar: w.ar, page: pageNoOf(w.at) })))
  const layout: Entry[] = [
    ...full,
    ...indexPages.map((cols, no) => ({ kind: 'index' as const, cols, no })),
    { kind: 'answers' }, { kind: 'final' },
  ]
  const firstOf = (pred: (e: Entry) => boolean) => layout.findIndex(pred)
  const lastOf = (pred: (e: Entry) => boolean) => layout.reduce((at, e, i) => (pred(e) ? i : at), -1)

  const contentsUnits = VOCAB_BOOK.map(u => ({
    n: u.n, icon: u.icon, titleEn: u.titleEn, titleAr: u.titleAr,
    first: pageNoOf(firstOf(e => e.kind === 'unit' && e.u === u)),
    last: pageNoOf(lastOf(e => e.kind === 'unit' && e.u === u)),
  }))
  const contentsEnd = [
    { en: 'Word index A–Z', ar: 'فهرس الكلمات', page: pageNoOf(firstOf(e => e.kind === 'index')) },
    { en: 'Reading answers', ar: 'أجوبة القراءة', page: pageNoOf(firstOf(e => e.kind === 'answers')) },
    { en: 'Final thought', ar: 'كلمة أخيرة', page: pageNoOf(firstOf(e => e.kind === 'final')) },
  ]

  const stats = {
    words: `${Math.floor(words.length / 10) * 10}+`,
    talks: String(VOCAB_BOOK.reduce((s, u) => s + u.talks.length, 0)),
    readings: String(VOCAB_BOOK.length),
  }
  const coverStats: CoverStat[] = [
    { n: String(VOCAB_BOOK.length), ar: 'وحدة', en: 'Units' },
    { n: stats.words, ar: 'كلمة وعبارة', en: 'Words & phrases' },
    { n: stats.talks, ar: 'محادثة', en: 'Conversations' },
    { n: stats.readings, ar: 'نص قراءة', en: 'Readings' },
  ]

  const shown = layout.map((e, i) => ({ e, i })).filter(({ e }) =>
    view === 'book' ? true
    : view === 'front' ? e.kind === 'contents' || e.kind === 'why'
    : view === 'end' ? e.kind === 'index' || e.kind === 'answers' || e.kind === 'final'
    : typeof view === 'number' ? e.kind === 'unit' && e.u.n === view
    : false)
  const withCover = view === 'book' || view === 'cover'
  const withBack = view === 'book' || view === 'back'

  function page(e: Entry, i: number) {
    const no = pageNoOf(i)
    switch (e.kind) {
      case 'contents': return (
        <MatterPage key="contents" theme={theme} titleEn="Contents" titleAr="الفهرس" pageNo={no} filename="vocab-00-contents" label="الفهرس">
          <ContentsBody theme={theme} units={contentsUnits} end={contentsEnd} />
        </MatterPage>)
      case 'why': return (
        <MatterPage key="why" theme={theme} titleEn="Why this book?" titleAr="لماذا هذا الكتاب؟" pageNo={no} filename="vocab-00-why" label="لماذا هذا الكتاب؟">
          <WhyBody theme={theme} stats={[
            { n: String(VOCAB_BOOK.length), ar: 'وحدة', en: 'Units' },
            { n: stats.words, ar: 'كلمة وعبارة', en: 'Words' },
            { n: stats.talks, ar: 'محادثة', en: 'Conversations' },
            { n: stats.readings, ar: 'نص قراءة', en: 'Readings' },
          ]} />
        </MatterPage>)
      case 'unit': {
        const { u, part } = e
        return (
          <UnitPage key={`${u.n}-${part}`} theme={theme} unit={u} part={part} pageNo={no}>
            {part === 'vocab' && <VocabBody theme={theme} items={u.vocab} />}
            {part === 'common' && <CommonBody theme={theme} groups={u.groups} />}
            {part === 'talk' && <TalkBody theme={theme} talks={u.talks} ask={u.ask} answer={u.answer} />}
            {part === 'reading' && <ReadingBody theme={theme} r={u.reading} />}
          </UnitPage>)
      }
      case 'index': return (
        <MatterPage key={`index-${e.no}`} theme={theme} titleEn="Word index" titleAr="فهرس الكلمات" pageNo={no}
          filename={`vocab-90-index-${e.no + 1}`} label={`فهرس الكلمات ${e.no + 1}/${indexPages.length}`}>
          <IndexBody theme={theme} columns={e.cols} first={e.no === 0} />
        </MatterPage>)
      case 'answers': return (
        <MatterPage key="answers" theme={theme} titleEn="Reading answers" titleAr="أجوبة القراءة" pageNo={no} filename="vocab-95-answers" label="أجوبة القراءة">
          <AnswersBody theme={theme} units={VOCAB_BOOK} />
        </MatterPage>)
      case 'final': return (
        <MatterPage key="final" theme={theme} titleEn="Final thought" titleAr="كلمة أخيرة" pageNo={no} filename="vocab-98-final" label="كلمة أخيرة">
          <FinalBody theme={theme} authorAr={cover.authorAr} authorEn={cover.authorEn} website={cover.website} phone={cover.phone1} />
        </MatterPage>)
    }
  }

  const printCount = shown.length + (withCover ? 1 : 0) + (withBack ? 1 : 0)

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="كتاب المفردات — مفردات وعبارات للمواقف اليومية" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`الكتاب ${layout.length} صفحة مرقّمة + الغلافان. كل صفحة تحمل رقمها في الكتاب الكامل.`}>
            <select value={String(view)} onChange={e => setView(['book', 'cover', 'front', 'end', 'back'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الكتاب كاملًا ({layout.length} صفحة + الغلافان)</option>
              <option value="cover">الغلاف</option>
              <option value="front">البداية (الفهرس، لماذا هذا الكتاب)</option>
              {VOCAB_BOOK.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
              <option value="end">النهاية (فهرس الكلمات، الأجوبة، كلمة أخيرة)</option>
              <option value="back">الغلاف الخلفي</option>
            </select>
          </Field>

          {(withCover || withBack) && <CoverFields value={cover} onChange={setCover} defaults={VOCAB_COVER} showBio={withBack} />}

          <ThemePicker value={theme} onChange={setTheme} />

          <Field label="ترقيم الصفحات">
            <label className="flex items-center gap-2 text-[13px] font-bold text-zinc-700">
              <input type="checkbox" checked={numbered} onChange={e => setNumbered(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
              أضف رقم الصفحة في التذييل
            </label>
            {numbered && (
              <div className="mt-2 flex items-center gap-2 text-[12.5px] font-bold text-zinc-600">
                يبدأ من <input type="number" min={1} value={startNo} onChange={e => setStartNo(Math.max(1, Number(e.target.value) || 1))} className={`${INP} w-24`} />
              </div>
            )}
          </Field>

          <PrintAllButton count={printCount} />
        </aside>

        <div className="space-y-8 min-w-0">
          {withCover && (
            <CoverPage info={cover} theme={theme} stats={coverStats} filename="vocab-00-cover"
              badge={{ ar: 'كتاب المفردات', en: 'VOCABULARY BOOK' }}
              bubbles={[{ text: 'What does it mean?' }, { text: 'ماذا تعني؟', ar: true }, { text: 'كيف أقولها؟', ar: true }, { text: 'How do you say…?' }]} />
          )}
          {shown.map(({ e, i }) => page(e, i))}
          {withBack && (
            <BackCoverPage info={cover} theme={theme} filename="vocab-99-back-cover"
              headline={{ ar: 'كلمات أكثر… ثقة أكبر.', en: 'More words. More confidence.' }}
              blurbAr={`هذا الكتاب رفيق كتاب «الإنجليزية للمواقف اليومية». في كل وحدة من وحداته تجد كلمات جديدة مع أمثلة مترجمة، وكلمات شائعة مرتّبة حسب المواضيع، ومحادثات بطرق مختلفة للسؤال والإجابة، ونصّ قراءة قصيرًا مع أسئلة — لتتكلّم الإنجليزية في حياتك اليومية بثقة.`}
              bullets={[
                { ar: `أكثر من ${stats.words.replace('+', '')} كلمة وعبارة مع ترجمتها`, en: `${stats.words} words and expressions, translated` },
                { ar: 'أمثلة من الحياة اليومية مع ترجمتها', en: 'Real-life examples with translations' },
                { ar: `${stats.talks} محادثة وطرق مختلفة للسؤال والإجابة`, en: `${stats.talks} conversations, with other ways to ask and answer` },
                { ar: `${stats.readings} نص قراءة مع أسئلة وأجوبتها`, en: `${stats.readings} readings with questions and answers` },
                { ar: 'فهرس أبجدي لكل الكلمات', en: 'An A–Z index of every word' },
              ]}
              series={[
                { ar: 'الكتاب الأساسي', en: 'Textbook' },
                { ar: 'دفتر التمارين', en: 'Workbook' },
                { ar: 'كتاب المفردات', en: 'Vocabulary book', current: true },
              ]} />
          )}
        </div>
      </div>
    </div>
  )
}
