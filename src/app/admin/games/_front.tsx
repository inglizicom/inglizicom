'use client'

import { BookOpen, CheckCircle2, Repeat, Sparkles, Target } from 'lucide-react'
import { SECTION, type SectionKind, type SheetTheme } from './_shared'

/**
 * The workbook's front matter, before the units: welcome, how to use (the
 * seven exercises with a tiny example each), contents, and a progress
 * tracker. Same voice as the book's own Welcome / The Use pages. The cover
 * is made separately.
 */

const hi = (t: SheetTheme) => (t.id === 'mono' ? '#111' : t.accent)

/** English with Arabic inside on one line: each Arabic run isolated, so
 *  "كم السعر؟ → How much is it?" doesn't come out as "?How much is it". */
function Mixed({ text }: { text: string }) {
  const parts = text.split(/([؀-ۿ][؀-ۿ\s؟،]*)/).filter(Boolean)
  return <>{parts.map((p, i) => (/[؀-ۿ]/.test(p) ? <bdi key={i} dir="rtl">{p.trim()}</bdi> : <span key={i}>{p}</span>))}</>
}

export function WelcomeBody({ theme: t }: { theme: SheetTheme }) {
  const steps = [
    { Icon: BookOpen,     ar: 'ادرس الوحدة في الكتاب أولًا: المفردات، العبارات، المحادثة ثم القراءة.' },
    { Icon: Target,       ar: 'حلّ تمارين الوحدة هنا بالترتيب: من الكلمات، إلى الجمل، ثم الكتابة عن نفسك.' },
    { Icon: CheckCircle2, ar: 'صحّح بنفسك من مفاتيح الحل في آخر الدفتر، وسجّل نتيجتك في صفحة «تقدّمي».' },
    { Icon: Repeat,       ar: 'أعد التمارين الصعبة بعد أيام قليلة — التكرار هو سرّ التعلّم.' },
  ]
  return (
    <div dir="rtl">
      <div className="text-center pt-2">
        <div className="text-[54px] font-black italic leading-none" style={{ color: t.dark, fontFamily: 'Georgia, serif' }} dir="ltr">Welcome!</div>
        <h2 className="mt-3 text-[26px] font-black">مرحبًا بك في دفتر التمارين</h2>
      </div>

      <div className="mt-6 rounded-xl px-6 py-4 text-[17px] font-extrabold leading-relaxed text-center" style={{ background: t.accent, color: t.onAccent }}>
        هذا الدفتر رفيق كتاب «الإنجليزية للمواقف اليومية». لكل وحدة في الكتاب صفحات تمارين هنا،
        تساعدك على تثبيت الكلمات والعبارات حتى تستعملها بثقة في حياتك اليومية.
      </div>

      <h3 className="mt-7 text-[18px] font-black">كيف تتقدّم؟</h3>
      <div className="mt-3 space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white" style={{ background: t.dark }}><s.Icon size={19} /></span>
            <span className="text-[15.5px] font-bold">{s.ar}</span>
          </div>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3">
        {['حاول قبل أن تنظر إلى الحل.', 'قل كل جملة بصوت عالٍ وأنت تكتبها.', 'اكتب بخط واضح، واترك مسافة بين الكلمات.'].map(tip => (
          <div key={tip} className="rounded-xl px-3 py-3 text-[13.5px] font-bold leading-snug flex gap-2" style={{ background: t.soft }}>
            <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: hi(t) }} /> {tip}
          </div>
        ))}
      </div>

      <div className="mt-7 text-center">
        <span className="inline-block rounded-lg px-5 py-2 text-[15px] font-black text-white" style={{ background: t.dark }} dir="ltr">YOUR GOAL — هدفك</span>
        <p className="mt-2 text-[15px] font-bold text-zinc-600" dir="ltr">Don&apos;t just know the words. Use them.</p>
        <p className="text-[15px] font-bold text-zinc-600">لا تكتفِ بمعرفة الكلمات… استعملها.</p>
      </div>

      <div className="mt-8 rounded-xl px-6 py-4" style={{ border: `2px dashed ${t.dark}` }}>
        <div className="text-[13px] font-black mb-3" style={{ color: t.dark }} dir="ltr">THIS WORKBOOK BELONGS TO · هذا الدفتر ملك</div>
        <div className="grid grid-cols-3 gap-6 text-[13px] font-bold text-zinc-500" dir="ltr">
          {['Name · الاسم', 'Level · المستوى', 'Start date · تاريخ البداية'].map(l => (
            <div key={l}><div className="border-b border-zinc-400" style={{ height: 30 }} /><div className="mt-1">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}

const EXAMPLE: Record<SectionKind, { ar: string; ex: string }> = {
  match:     { ar: 'تصل كل كلمة إنجليزية بمعناها بالعربية.',                       ex: 'coffee  ●———●  قهوة' },
  letters:   { ar: 'تكمل الحروف الناقصة في الكلمة، والمعنى بالعربية يساعدك.',       ex: 'c o _ f _ e   (قهوة)' },
  search:    { ar: 'تبحث عن كلمات الوحدة المخفية داخل شبكة من الحروف.',            ex: 'S H O W E R  →' },
  gaps:      { ar: 'تكمل الجملة بالكلمة المناسبة من بنك الكلمات.',                  ex: 'Can I pay by ____?   (card)' },
  order:     { ar: 'ترتّب الكلمات المبعثرة لتكوّن عبارة صحيحة.',                    ex: 'pay · I · can  →  Can I pay?' },
  translate: { ar: 'تترجم عبارات الوحدة من العربية إلى الإنجليزية.',               ex: 'كم السعر؟  →  How much is it?' },
  write:     { ar: 'تكتب عن حياتك أنت باستعمال كلمات الوحدة وعباراتها.',            ex: 'I usually wake up at …' },
}

export function HowToBody({ theme: t, kinds }: { theme: SheetTheme; kinds: SectionKind[] }) {
  return (
    <div dir="rtl">
      <p className="text-[15.5px] font-bold leading-relaxed text-zinc-700">
        في كل وحدة ستجد هذه التمارين بالترتيب نفسه: تبدأ بالكلمات، ثم الجمل، ثم تكتب عن نفسك.
        الرقم في أعلى كل صفحة يدلّك على نوع التمرين.
      </p>
      <div className="mt-5 space-y-3">
        {kinds.map((k, i) => {
          const s = SECTION[k]
          return (
            <div key={k} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: i % 2 ? '#fff' : t.soft, border: `1.5px solid ${i % 2 ? '#E5E5E5' : 'transparent'}` }}>
              <span className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-[19px] font-black text-white" style={{ background: t.dark }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[16px] font-black">
                  <s.Icon size={17} style={{ color: hi(t) }} /> {s.ar}
                  <span className="text-[11.5px] font-black text-zinc-400" dir="ltr">{s.en}</span>
                </div>
                <div className="text-[13.5px] font-bold text-zinc-600">{EXAMPLE[k].ar}</div>
              </div>
              <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[13px] font-extrabold" style={{ border: `1.5px dashed ${t.dark}` }} dir="ltr">
                <Mixed text={EXAMPLE[k].ex} />
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-6 rounded-xl px-5 py-3 text-center text-[15px] font-extrabold" style={{ background: t.accent, color: t.onAccent }}>
        REMEMBER — تذكّر: لا تحتاج إلى حفظ كل شيء. استعمله، كرّره، واجعله جزءًا من لغتك.
      </div>
    </div>
  )
}

export interface ContentsRow {
  n: number; titleEn: string; titleAr: string
  /** First and last exercise page of the unit, and the page of its answer key. */
  page: number | null; last: number | null; key: number | null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The whole workbook's contents — always all units, with the page range of
 *  each unit's exercises and where its answers are. */
export function ContentsBody({ theme: t, rows, keysPage }: { theme: SheetTheme; rows: ContentsRow[]; keysPage: number | null | undefined }) {
  const numbered = rows.some(r => r.page != null)
  const hasKeys = rows.some(r => r.key != null)
  return (
    <div dir="ltr">
      {numbered && (
        <div className="flex items-center gap-3 pb-1.5 mb-2 border-b-2 text-[11px] font-black" style={{ borderColor: t.dark, color: t.dark }}>
          <span className="flex-1">UNIT · الوحدة</span>
          <span className="w-[96px] text-center whitespace-nowrap">PAGES · الصفحات</span>
          {hasKeys && <span className="w-[64px] text-center whitespace-nowrap">KEY · الحل</span>}
        </div>
      )}
      <div className={rows.length > 12 ? 'space-y-[8px]' : 'space-y-3'}>
        {rows.map(r => (
          <div key={r.n} className="flex items-center gap-3">
            <span className="w-[74px] shrink-0 rounded-md px-2 py-0.5 text-center text-[12.5px] font-black text-white" style={{ background: t.dark }}>UNIT {pad(r.n)}</span>
            <span className="text-[14.5px] font-extrabold whitespace-nowrap">{r.titleEn} <span className="text-zinc-400 mx-1">|</span> <bdi dir="rtl">{r.titleAr}</bdi></span>
            <span className="flex-1 border-b-2 border-dotted border-zinc-300 translate-y-1" />
            {r.page != null && (
              <span className="w-[96px] text-center text-[14.5px] font-black tabular-nums" style={{ color: t.dark }}>
                {pad(r.page)}{r.last != null && r.last !== r.page ? `–${pad(r.last)}` : ''}
              </span>
            )}
            {hasKeys && r.key != null && (
              <span className="w-[64px] text-center rounded-md py-0.5 text-[13px] font-black tabular-nums" style={{ background: t.accent, color: t.onAccent }}>{pad(r.key)}</span>
            )}
          </div>
        ))}
      </div>
      {keysPage !== undefined && (
        <div className="flex items-center gap-3 pt-3 mt-3 border-t-2" style={{ borderColor: t.dark }}>
          <span className="w-[74px] shrink-0 rounded-md px-2 py-0.5 text-center text-[12.5px] font-black" style={{ background: t.accent, color: t.onAccent }}>KEYS</span>
          <span className="text-[14.5px] font-black">Answer keys <span className="text-zinc-400 mx-1">|</span> <bdi dir="rtl">مفاتيح الحل</bdi></span>
          <span className="flex-1 border-b-2 border-dotted border-zinc-300 translate-y-1" />
          {keysPage != null && <span className="w-[96px] text-center text-[14.5px] font-black tabular-nums" style={{ color: t.dark }}>{pad(keysPage)}</span>}
          {hasKeys && <span className="w-[64px]" />}
        </div>
      )}
    </div>
  )
}

export function ProgressBody({ theme: t, units, kinds }: { theme: SheetTheme; units: { n: number; titleAr: string }[]; kinds: SectionKind[] }) {
  const rowH = units.length > 12 ? 36 : 44
  return (
    <div>
      <p className="text-[14.5px] font-bold text-zinc-700 text-right" dir="rtl">
        ضع علامة ✓ عند كل تمرين تنهيه، واكتب مجموع نقاطك. لوّن الخانة إذا أعدت التمرين وتحسّنت.
      </p>
      <table className="mt-4 w-full border-collapse text-[13px]" dir="ltr">
        <thead>
          <tr style={{ background: t.dark, color: '#fff' }}>
            <th className="px-2 py-2 text-left font-black">UNIT</th>
            {kinds.map((k, i) => {
              const s = SECTION[k]
              return <th key={k} className="px-1 py-2 font-black w-[52px]" title={s.ar}><span className="inline-flex flex-col items-center gap-0.5"><s.Icon size={15} style={{ color: hi(t) }} />{i + 1}</span></th>
            })}
            <th className="px-2 py-2 font-black w-[70px]">SCORE</th>
            <th className="px-2 py-2 font-black w-[90px]">DATE</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, r) => (
            <tr key={u.n} style={{ height: rowH, background: r % 2 ? '#fff' : t.soft }}>
              <td className="px-2 border-b border-zinc-200">
                <span className="flex items-center gap-2">
                  <span className="font-black tabular-nums">{String(u.n).padStart(2, '0')}</span>
                  <bdi dir="rtl" className="font-bold text-zinc-500 text-[12.5px] leading-tight">{u.titleAr}</bdi>
                </span>
              </td>
              {kinds.map(k => (
                <td key={k} className="text-center border-b border-zinc-200">
                  <span className="inline-block w-5 h-5 rounded border-2 align-middle" style={{ borderColor: t.dark }} />
                </td>
              ))}
              <td className="border-b border-zinc-200 text-center text-zinc-300 font-black">/</td>
              <td className="border-b border-zinc-200" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
