'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import {
  generateMatchingSet, generateScrambleSet, generateWordSearch, makeGapFill, missingLetters, type Difficulty,
} from '@/lib/game-generators'
import { EVERYDAY_ENGLISH, type WorkbookUnit } from '@/data/workbook/everyday-english'
import {
  A4Page, Field, FrontPage, GamesHeader, GapsBody, INP, LettersBody, MatchBody, OrderBody, PrintAllButton, SECTION, THEMES,
  ThemePicker, TranslateBody, WordSearchBody, WriteBody, type PageMeta, type SectionKind, type SheetTheme,
} from './_shared'
import { ContentsBody, HowToBody, ProgressBody, WelcomeBody, type ContentsRow } from './_front'
import { CoverFields, CoverPage, DEFAULT_COVER, type CoverInfo } from './_cover'

const COVER_KEY = 'workbook-cover-v1'

/**
 * /admin/games — the workbook of «الإنجليزية للمواقف اليومية», generated per
 * unit (or all 19) from data/workbook/everyday-english.ts. Seven exercises in
 * learning order — words first (match, missing letters, word search), then
 * sentences (fill the gap, words in order, translate), then free writing —
 * and every answer key gathered at the end like a real workbook.
 * Same seed → same puzzles; "new mix" changes them all.
 */

const KINDS: SectionKind[] = ['match', 'letters', 'search', 'gaps', 'order', 'translate', 'write']
const NO_KEY: SectionKind[] = ['write']
const DIFFS: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'easy',   label: 'سهل',   hint: 'أفقي وعمودي فقط' },
  { id: 'medium', label: 'متوسط', hint: '+ قطري' },
  { id: 'hard',   label: 'صعب',   hint: 'كل الاتجاهات ومعكوسة' },
]

function build(u: WorkbookUnit, diff: Difficulty, mix: number) {
  const seed = u.n * 1009 + mix * 7919
  const en = u.phrases.map(p => p.en)
  return {
    unit: u,
    match: generateMatchingSet(u.words.slice(0, 10), seed),
    letters: u.words.slice(0, 12).map((w, i) => ({ m: missingLetters(w.en, seed + i), ar: w.ar })),
    search: generateWordSearch(u.words.map(w => w.en), { seed, difficulty: diff, size: 12 }),
    gaps: makeGapFill(en, u.words.map(w => w.en), seed),
    order: generateScrambleSet(en, seed),
  }
}
type Built = ReturnType<typeof build>
type Front = 'welcome' | 'howto' | 'contents' | 'progress'
const FRONT: Front[] = ['welcome', 'howto', 'contents', 'progress']
type Entry = { front: Front } | { kind: SectionKind; key: boolean; b: Built }

/** What's on screen: the whole workbook, the cover, only the front pages,
 *  or one unit (its exercises + its answer keys). Always a slice of the FULL
 *  layout, so every page keeps the number it has in the printed book and the
 *  contents page always lists all 19 units. The cover sits outside that
 *  layout: it carries no page number. */
type View = 'book' | 'cover' | 'front' | number

export default function WorkbookPage() {
  const [view, setView] = useState<View>(1)
  const [cover, setCover] = useState<CoverInfo>(DEFAULT_COVER)
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [kinds, setKinds] = useState<Record<SectionKind, boolean>>(
    { match: true, letters: true, search: true, gaps: true, order: true, translate: true, write: true })
  const [keys, setKeys] = useState(true)
  const [diff, setDiff] = useState<Difficulty>('medium')
  const [theme, setTheme] = useState<SheetTheme>(THEMES[0])
  const [numbered, setNumbered] = useState(true)
  const [startNo, setStartNo] = useState(1)
  const [mix, setMix] = useState(0)

  const built: Built[] = useMemo(() => EVERYDAY_ENGLISH.map(u => build(u, diff, mix)), [diff, mix])

  /* The cover's texts (and photo) are remembered in this browser. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COVER_KEY)
      if (saved) setCover({ ...DEFAULT_COVER, ...JSON.parse(saved) })
    } catch { /* no storage: keep the defaults */ }
    setCoverLoaded(true)
  }, [])
  useEffect(() => {
    if (!coverLoaded) return
    try { localStorage.setItem(COVER_KEY, JSON.stringify(cover)) } catch { /* quota (large photo) or no storage */ }
  }, [cover, coverLoaded])

  /* The full layout: front matter → each unit's exercises → every answer key. */
  const chosen = KINDS.filter(k => kinds[k])
  const full: Entry[] = []
  for (const f of FRONT) full.push({ front: f })
  for (const b of built) for (const k of chosen) full.push({ kind: k, key: false, b })
  if (keys) for (const b of built) for (const k of chosen) if (!NO_KEY.includes(k)) full.push({ kind: k, key: true, b })

  const pageNoOf = (i: number) => (numbered ? startNo + i : null)
  const lastIndex = (pred: (e: Entry) => boolean) => full.reduce((at, e, i) => (pred(e) ? i : at), -1)
  const contents: ContentsRow[] = built.map(b => {
    const first = full.findIndex(e => 'b' in e && e.b === b && !e.key)
    const last = lastIndex(e => 'b' in e && e.b === b && !e.key)
    const key = full.findIndex(e => 'b' in e && e.b === b && e.key)
    return {
      n: b.unit.n, titleEn: b.unit.titleEn, titleAr: b.unit.titleAr,
      page: pageNoOf(first), last: pageNoOf(last), key: key < 0 ? null : pageNoOf(key),
    }
  })
  const firstKey = full.findIndex(e => 'key' in e && e.key)
  const keysPage = firstKey < 0 ? undefined : pageNoOf(firstKey)

  /* The slice on screen, each page with its index in the full layout. */
  const shown = full.map((e, i) => ({ e, i })).filter(({ e }) =>
    view === 'book' ? true : view === 'front' ? 'front' in e : 'b' in e && e.b.unit.n === view)
  const withCover = view === 'book' || view === 'cover'

  const meta = (b: Built, i: number): PageMeta => ({
    theme, unitNo: b.unit.n, unitEn: b.unit.titleEn, unitAr: b.unit.titleAr,
    pageNo: pageNoOf(i), filename: `unit-${b.unit.n}-${String(i + 1).padStart(3, '0')}`,
  })
  const no = (k: SectionKind) => chosen.indexOf(k) + 1

  function page(p: Entry, i: number) {
    if ('front' in p) {
      const common = { key: `front-${p.front}`, theme, pageNo: pageNoOf(i), filename: `00-${p.front}` }
      switch (p.front) {
        case 'welcome':  return <FrontPage {...common} titleEn="Welcome" titleAr="مرحبًا" label="الترحيب"><WelcomeBody theme={theme} /></FrontPage>
        case 'howto':    return <FrontPage {...common} titleEn="How to use" titleAr="طريقة الاستعمال" label="طريقة الاستعمال"><HowToBody theme={theme} kinds={chosen} /></FrontPage>
        case 'contents': return <FrontPage {...common} titleEn="Contents" titleAr="المحتويات" label="الفهرس"><ContentsBody theme={theme} rows={contents} keysPage={keysPage} /></FrontPage>
        case 'progress': return <FrontPage {...common} titleEn="My progress" titleAr="تقدّمي" label="تتبّع التقدّم"><ProgressBody theme={theme} units={built.map(b => b.unit)} kinds={chosen} /></FrontPage>
      }
    }
    const { b, key } = p
    const common = { key: `${b.unit.n}-${p.kind}-${key}`, meta: meta(b, i), section: p.kind, sectionNo: no(p.kind), answerKey: key }
    switch (p.kind) {
      case 'match': return (
        <A4Page {...common} score={10}
          instructionAr="صِل كل كلمة إنجليزية بمعناها بالعربية بخط، ثم اكتب الحرف المناسب في الأسفل."
          instructionEn="Draw a line from each word to its meaning, then write the letter.">
          <MatchBody set={b.match} theme={theme} answerKey={key} />
        </A4Page>)
      case 'letters': return (
        <A4Page {...common} score={b.letters.length}
          instructionAr="أكمل الحروف الناقصة في كل كلمة. المعنى بالعربية فوقها يساعدك."
          instructionEn="Complete the words. The Arabic meaning helps you.">
          <LettersBody items={b.letters} theme={theme} answerKey={key} />
        </A4Page>)
      case 'search': return (
        <A4Page {...common} score={12}
          instructionAr="ابحث عن الكلمات الاثنتي عشرة في الشبكة، ثم ضع علامة ✓ أمام كل كلمة تجدها."
          instructionEn={diff === 'easy' ? 'Find the 12 words. They go → and ↓.' : diff === 'medium' ? 'Find the 12 words. They go →, ↓ and ↘.' : 'Find the 12 words — in every direction, even backwards.'}>
          <WordSearchBody result={b.search} words={b.unit.words} theme={theme} answerKey={key} />
        </A4Page>)
      case 'gaps': return (
        <A4Page {...common} score={b.gaps.items.length}
          instructionAr="أكمل كل جملة بكلمة من بنك الكلمات. استعمل كل كلمة مرة واحدة."
          instructionEn="Complete each sentence with a word from the box.">
          <GapsBody items={b.gaps.items} bank={b.gaps.bank} theme={theme} answerKey={key} />
        </A4Page>)
      case 'order': return (
        <A4Page {...common} score={b.order.length}
          instructionAr="رتّب الكلمات لتكوّن عبارة صحيحة من الوحدة، واكتبها على السطر."
          instructionEn="Put the words in order and write the sentence.">
          <OrderBody items={b.order} theme={theme} answerKey={key} />
        </A4Page>)
      case 'translate': return (
        <A4Page {...common} score={b.unit.phrases.length}
          instructionAr="ترجم كل جملة إلى الإنجليزية. كل الجمل من عبارات هذه الوحدة."
          instructionEn="Write each sentence in English.">
          <TranslateBody phrases={b.unit.phrases} theme={theme} answerKey={key} />
        </A4Page>)
      case 'write': return (
        <A4Page {...common}
          instructionAr="اكتب عن حياتك أنت — غيّر الأمثلة واجعلها خاصة بك."
          instructionEn="Write about you. Make it yours.">
          <WriteBody titleAr={b.unit.titleAr} words={b.unit.words.map(w => w.en)} phrases={b.unit.phrases.slice(0, 3).map(p => p.en)} theme={theme} />
        </A4Page>)
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="دفتر التمارين — الإنجليزية للمواقف اليومية" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="عرض" hint={`الدفتر الكامل ${full.length} صفحة + الغلاف — كل صفحة تحمل رقمها في الدفتر الكامل، والفهرس دائمًا كامل. الغلاف بدون رقم.`}>
            <select value={String(view)} onChange={e => setView(['book', 'cover', 'front'].includes(e.target.value) ? e.target.value as View : Number(e.target.value))} className={INP}>
              <option value="book">الدفتر كاملًا ({full.length} صفحة + الغلاف)</option>
              <option value="cover">الغلاف</option>
              <option value="front">صفحات البداية (ترحيب، طريقة الاستعمال، الفهرس، تقدّمي)</option>
              {EVERYDAY_ENGLISH.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
            </select>
          </Field>

          {withCover && <CoverFields value={cover} onChange={setCover} />}

          <Field label="التمارين (بترتيب التعلّم)">
            <div className="space-y-1.5">
              {KINDS.map(k => (
                <label key={k} className="flex items-center gap-2 text-[13px] font-bold text-zinc-700">
                  <input type="checkbox" checked={kinds[k]} onChange={e => setKinds(s => ({ ...s, [k]: e.target.checked }))} className="w-4 h-4 accent-zinc-900" />
                  <span className="w-5 text-zinc-400 tabular-nums">{no(k)}.</span> {SECTION[k].ar}
                </label>
              ))}
              <label className="flex items-center gap-2 text-[13px] font-bold text-zinc-700 pt-1.5 border-t border-zinc-100">
                <input type="checkbox" checked={keys} onChange={e => setKeys(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                مفاتيح الحل (في آخر الدفتر)
              </label>
            </div>
          </Field>

          <Field label="صعوبة البحث عن الكلمات">
            <div className="grid grid-cols-3 gap-1">
              {DIFFS.map(d => (
                <button key={d.id} type="button" onClick={() => setDiff(d.id)} title={d.hint}
                  className={`rounded-lg border py-1.5 text-[12.5px] font-bold ${diff === d.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11.5px] text-zinc-400">{DIFFS.find(d => d.id === diff)!.hint}</p>
          </Field>

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

          <div className="flex flex-col gap-2 pt-1">
            <PrintAllButton count={view === 'cover' ? 1 : shown.length + (withCover ? 1 : 0)} />
            <button type="button" onClick={() => setMix(m => m + 1)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] py-2.5 hover:bg-zinc-50">
              <Shuffle size={15} /> خلط جديد لكل التمارين
            </button>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          {withCover && <CoverPage info={cover} theme={theme} units={built.length} kinds={chosen.length} />}
          {view !== 'cover' && chosen.length === 0 && <div className="text-center py-16 text-zinc-400 text-[13.5px]">اختر تمرينًا واحدًا على الأقل.</div>}
          {view !== 'cover' && shown.map(({ e, i }) => page(e, i))}
        </div>
      </div>
    </div>
  )
}
