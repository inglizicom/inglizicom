'use client'

import { Fragment, type ReactNode } from 'react'
import {
  BookOpen, CircleHelp, Languages, LayoutGrid, MessageSquareReply, MessagesSquare, PenLine, Sparkles, type LucideIcon,
} from 'lucide-react'
import { Sheet, hi, pageNoText, type SheetTheme } from '../games/_shared'
import type { Pair, VocabEntry, WordGroup, Dialogue, Reading } from '@/data/workbook/vocab-book'
import type { VocabBookUnit } from '@/data/workbook/vocab-book-all'

/**
 * The pages of «مفردات وعبارات للمواقف اليومية». Same A4 sheet, print and
 * PNG behaviour as the workbook (games/_shared Sheet); each unit is four
 * pages in a fixed order — words in context, common words, conversations,
 * reading — so a reader always knows where they are (the four dots in the
 * strip under the unit band).
 */

export type Part = 'vocab' | 'common' | 'talk' | 'reading'
export const PARTS: Part[] = ['vocab', 'common', 'talk', 'reading']

export const PART: Record<Part, { no: number; en: string; ar: string; Icon: LucideIcon; instrEn: string; instrAr: string; descAr: string }> = {
  vocab: {
    no: 1, en: 'WORDS IN CONTEXT', ar: 'مفردات في سياقها', Icon: Languages,
    instrEn: 'Read each word and its example aloud. Then cover the Arabic and test yourself.',
    instrAr: 'اقرأ كل كلمة ومثالها بصوت عالٍ، ثم غطِّ العربية واختبر نفسك.',
    descAr: 'كلمات جديدة، كل واحدة في جملة حقيقية مع ترجمتها.',
  },
  common: {
    no: 2, en: 'COMMON WORDS', ar: 'كلمات شائعة', Icon: LayoutGrid,
    instrEn: 'Tick the words you already know. Learn five new ones every day.',
    instrAr: 'ضع ✓ أمام الكلمات التي تعرفها، وتعلّم خمس كلمات جديدة كل يوم.',
    descAr: 'ثلاثون كلمة شائعة في مجموعات حسب الموضوع.',
  },
  talk: {
    no: 3, en: "LET'S TALK", ar: 'لنتحدّث', Icon: MessagesSquare,
    instrEn: 'Act out the conversations with a partner. Then swap in other questions and answers.',
    instrAr: 'مثّل المحادثتين مع زميل، ثم جرّب أسئلة وأجوبة أخرى من الإطارين.',
    descAr: 'محادثتان من نوعين مختلفين، وطرق أخرى للسؤال والإجابة.',
  },
  reading: {
    no: 4, en: 'READING', ar: 'القراءة', Icon: BookOpen,
    instrEn: 'Read the text twice. Then answer the questions.',
    instrAr: 'اقرأ النص مرتين، ثم أجب عن الأسئلة.',
    descAr: 'نصّ قصير من الحياة اليومية، مع أسئلة للفهم.',
  },
}

const pad = (n: number) => String(n).padStart(2, '0')
const line = (t: SheetTheme) => (t.id === 'mono' ? '#111' : t.accent)

const Strip = ({ t, active }: { t: SheetTheme; active?: number }) => (
  <div className="flex items-center justify-between px-6 py-1.5 text-[11px] font-extrabold" style={{ background: t.dark, color: '#fff' }} dir="ltr">
    <span>VOCABULARY &amp; EXPRESSIONS</span>
    {active != null && (
      <span className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map(i => <span key={i} className="w-2 h-2 rounded-full" style={{ background: i === active ? hi(t) : 'rgba(255,255,255,0.28)' }} />)}
      </span>
    )}
    <span dir="rtl">مفردات وعبارات</span>
  </div>
)

/* ── Unit page frame ─────────────────────────────────────────────────── */

export function UnitPage({ theme: t, unit, part, pageNo, children }: {
  theme: SheetTheme; unit: VocabBookUnit; part: Part; pageNo: number | null; children: ReactNode
}) {
  const s = PART[part]
  const header = (
    <>
      <div className="flex items-stretch" style={{ height: 86 }} dir="ltr">
        <div className="flex items-center justify-center px-5" style={{ background: t.dark }}>
          <span className="rounded-md bg-white px-3 py-1 text-[22px] font-black" style={{ color: t.dark }}>UNIT {unit.n}</span>
        </div>
        <div className="flex-1 flex items-center justify-between gap-3 px-6" style={{ background: t.accent, color: t.onAccent }}>
          <span className="flex items-center gap-3 text-[21px] font-black uppercase leading-tight">
            <span className="text-[30px] leading-none">{unit.icon}</span>{unit.titleEn}
          </span>
          <span className="text-[24px] font-black leading-tight" dir="rtl">{unit.titleAr}</span>
        </div>
      </div>
      <Strip t={t} active={s.no} />
    </>
  )
  return (
    <Sheet theme={t} header={header}
      label={`الوحدة ${unit.n} — ${s.ar}${pageNo ? ` · صفحة ${pageNo}` : ''}`}
      filename={`vocab-unit-${pad(unit.n)}-${s.no}-${part}`}
      footerMid={`UNIT ${unit.n}${pageNo ? ` | ${pageNoText(pageNo)}` : ''}`}>
      <div className="flex items-center gap-2" dir="ltr">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg text-[20px] font-black text-white" style={{ background: t.dark }}>{s.no}</span>
        <span className="flex items-center gap-2 rounded-lg px-4 h-10 text-[16px] font-black text-white" style={{ background: t.dark }}>
          <s.Icon size={18} style={{ color: hi(t) }} />
          {s.en} <span className="opacity-50">|</span> <span dir="rtl">{s.ar}</span>
        </span>
      </div>
      <div className="mt-3 rounded-lg px-4 py-2 flex items-center justify-between gap-4" style={{ background: t.soft, borderInlineStart: `4px solid ${line(t)}` }}>
        <span className="text-[12.5px] font-bold text-zinc-600" dir="ltr">{s.instrEn}</span>
        <span className="text-[14px] font-extrabold text-right" dir="rtl">{s.instrAr}</span>
      </div>
      <div className="mt-4">{children}</div>
    </Sheet>
  )
}

/* ── 1 · Words in context ────────────────────────────────────────────── */

export function VocabBody({ theme: t, items }: { theme: SheetTheme; items: VocabEntry[] }) {
  return (
    <div>
      <table className="w-full border-collapse" dir="ltr">
        <thead>
          <tr className="text-[11.5px] font-black" style={{ background: t.dark, color: '#fff' }}>
            <th className="w-[50px] py-1.5" />
            <th className="w-[170px] px-2 py-1.5 text-left">ENGLISH</th>
            <th className="w-[150px] px-2 py-1.5 text-right">الترجمة</th>
            <th className="px-2 py-1.5 text-left">EXAMPLE <span className="opacity-60">·</span> <span dir="rtl">مثال</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e, i) => (
            <tr key={e.en} style={{ background: i % 2 ? '#fff' : t.soft }}>
              <td className="text-center text-[24px] leading-none py-2">{e.icon}</td>
              <td className="px-2 text-[15.5px] font-black leading-tight">{e.en}</td>
              <td className="px-2 text-[14.5px] font-bold text-right leading-snug" dir="rtl">{e.ar}</td>
              <td className="px-2 py-1.5">
                <div className="text-[13.5px] font-semibold leading-snug">{e.ex}</div>
                <div className="text-[12.5px] font-semibold text-zinc-500 text-right leading-snug" dir="rtl">{e.exAr}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 rounded-xl px-4 py-3" style={{ border: `2px dashed ${t.dark}` }}>
        <div className="flex items-center justify-between text-[12.5px] font-black" style={{ color: t.dark }}>
          <span dir="ltr" className="flex items-center gap-1.5"><PenLine size={14} /> MY SENTENCES</span>
          <span>اكتب جملتين عن نفسك بكلمتين جديدتين</span>
        </div>
        {[0, 1].map(i => <div key={i} className="border-b border-zinc-400" style={{ height: 30 }} />)}
      </div>
    </div>
  )
}

/* ── 2 · Common words ────────────────────────────────────────────────── */

export function CommonBody({ theme: t, groups }: { theme: SheetTheme; groups: WordGroup[] }) {
  return (
    <div className="space-y-3">
      {groups.map(gp => (
        <div key={gp.en} className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${t.id === 'mono' ? '#999' : t.dark}22` }}>
          <div className="flex items-center justify-between px-4 py-1.5" style={{ background: t.soft }} dir="ltr">
            <span className="flex items-center gap-2 text-[15px] font-black"><span className="text-[20px]">{gp.icon}</span>{gp.en}</span>
            <span className="text-[15px] font-black" dir="rtl">{gp.ar}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 px-4 py-1" dir="ltr">
            {gp.words.map(w => (
              <div key={w.en} className="flex items-center gap-2 py-[3px] border-b border-dotted border-zinc-300">
                <span className="w-3.5 h-3.5 shrink-0 rounded-sm border-2" style={{ borderColor: t.dark }} />
                <span className="text-[14px] font-bold whitespace-nowrap">{w.en}</span>
                <span className="flex-1" />
                <span className="text-[13.5px] font-semibold text-zinc-600 text-right" dir="rtl">{w.ar}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-xl px-4 py-2.5" style={{ border: `2px dashed ${t.dark}` }}>
        <div className="flex items-center justify-between text-[12.5px] font-black" style={{ color: t.dark }}>
          <span dir="ltr">MY WORDS</span><span>كلماتي الجديدة</span>
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          {[0, 1, 2, 3].map(i => <div key={i} className="border-b border-zinc-400" style={{ height: 28 }} />)}
        </div>
      </div>
    </div>
  )
}

/* ── 3 · Let's talk ──────────────────────────────────────────────────── */

function DialogueCard({ t, dl }: { t: SheetTheme; dl: Dialogue }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${t.id === 'mono' ? '#999' : t.dark}33` }}>
      <div className="flex items-center justify-between gap-3 px-4 py-1.5" style={{ background: t.soft }} dir="ltr">
        <span className="flex items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase" style={{ background: t.accent, color: t.onAccent }}>
            {dl.kindEn} · <bdi dir="rtl">{dl.kindAr}</bdi>
          </span>
          <span className="text-[15px] font-black">{dl.titleEn}</span>
        </span>
        <span className="text-[14.5px] font-black" dir="rtl">{dl.titleAr}</span>
      </div>
      <div className="px-4 py-2 space-y-1.5" dir="ltr">
        {dl.lines.map((l, i) => (
          <div key={i} className="grid grid-cols-[88px_1fr_42%] items-start gap-2">
            <span className="rounded-md px-1 py-0.5 text-center text-[11px] font-black whitespace-nowrap"
              style={i % 2 ? { background: t.accent, color: t.onAccent } : { background: t.dark, color: '#fff' }}>{dl.who[i % 2]}</span>
            <span className="text-[14px] font-bold leading-snug">{l.en}</span>
            <span className="text-[13px] font-semibold text-zinc-500 text-right leading-snug" dir="rtl">{l.ar}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WaysBox({ t, Icon, en, ar, items }: { t: SheetTheme; Icon: LucideIcon; en: string; ar: string; items: Pair[] }) {
  return (
    <div className="rounded-xl px-4 py-2.5" style={{ background: t.soft }}>
      <div className="flex items-center justify-between text-[12.5px] font-black mb-1" style={{ color: t.dark }} dir="ltr">
        <span className="flex items-center gap-1.5"><Icon size={15} />{en}</span><span dir="rtl">{ar}</span>
      </div>
      {items.map(p => (
        <div key={p.en} className="py-1 border-b border-dotted border-zinc-300 last:border-0">
          <div className="text-[13.5px] font-bold leading-snug" dir="ltr">{p.en}</div>
          <div className="text-[12.5px] font-semibold text-zinc-500 text-right leading-snug" dir="rtl">{p.ar}</div>
        </div>
      ))}
    </div>
  )
}

export function TalkBody({ theme: t, talks, ask, answer }: { theme: SheetTheme; talks: Dialogue[]; ask: Pair[]; answer: Pair[] }) {
  return (
    <div className="space-y-3">
      {talks.map(dl => <DialogueCard key={dl.titleEn} t={t} dl={dl} />)}
      <div className="grid grid-cols-2 gap-3">
        <WaysBox t={t} Icon={CircleHelp} en="WAYS TO ASK" ar="طرق للسؤال" items={ask} />
        <WaysBox t={t} Icon={MessageSquareReply} en="WAYS TO ANSWER" ar="طرق للإجابة" items={answer} />
      </div>
    </div>
  )
}

/* ── 4 · Reading ─────────────────────────────────────────────────────── */

/** The text with its key words underlined in the accent colour. */
function Highlighted({ text, words, t }: { text: string; words: string[]; t: SheetTheme }) {
  const esc = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length)
  if (!esc.length) return <>{text}</>
  const re = new RegExp(`\\b(${esc.join('|')})\\b`, 'gi')
  const parts = text.split(re)
  return <>{parts.map((p, i) => (i % 2 ? <b key={i} className="font-extrabold" style={{ boxShadow: `inset 0 -0.45em 0 ${t.id === 'mono' ? '#ddd' : t.accent}88` }}>{p}</b> : <Fragment key={i}>{p}</Fragment>))}</>
}

export function ReadingBody({ theme: t, r }: { theme: SheetTheme; r: Reading }) {
  return (
    <div dir="ltr">
      <div className="flex items-center gap-4">
        <div className="w-[70px] h-[70px] shrink-0 rounded-2xl flex items-center justify-center text-[38px]" style={{ background: t.accent }}>{r.icon}</div>
        <div className="flex-1">
          <div className="text-[25px] font-black leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{r.title}</div>
          <div className="text-[15px] font-bold text-zinc-500" dir="rtl" style={{ textAlign: 'left' }}>{r.titleAr}</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl px-5 py-3 text-[15px] leading-[1.8] font-medium" style={{ background: t.soft }}>
        <Highlighted text={r.text} words={r.gloss.map(x => x.en)} t={t} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-black mr-1" style={{ color: t.dark }}>KEY WORDS · <bdi dir="rtl">كلمات مفتاحية</bdi></span>
        {r.gloss.map(x => (
          <span key={x.en} className="rounded-full px-2.5 py-0.5 text-[12.5px] font-bold" style={{ border: `1.5px solid ${t.dark}33` }}>
            {x.en} = <bdi dir="rtl">{x.ar}</bdi>
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[14px] font-black" style={{ color: t.dark }}>
        <span>A. True or false?</span><span dir="rtl">صحيح أم خطأ؟</span>
      </div>
      <div className="mt-1">
        {r.tf.map((x, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-dotted border-zinc-300">
            <span className="w-5 text-[14px] font-black tabular-nums">{i + 1}.</span>
            <span className="flex-1 text-[14.5px] font-semibold">{x.s}</span>
            {['T', 'F'].map(k => (
              <span key={k} className="w-7 h-7 rounded-md border-2 flex items-center justify-center text-[12px] font-black" style={{ borderColor: t.dark, color: t.dark }}>{k}</span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[14px] font-black" style={{ color: t.dark }}>
        <span>B. Answer the questions.</span><span dir="rtl">أجب عن الأسئلة.</span>
      </div>
      {r.qs.map((x, i) => (
        <div key={i} className="mt-1.5">
          <div className="text-[14.5px] font-semibold"><span className="font-black mr-2">{r.tf.length + i + 1}.</span>{x.q}</div>
          <div className="border-b border-zinc-400" style={{ height: 30 }} />
        </div>
      ))}

      <div className="mt-4 rounded-xl px-4 py-2.5" style={{ border: `2px dashed ${t.dark}` }}>
        <div className="flex items-center justify-between text-[13px] font-black" style={{ color: t.dark }}>
          <span className="flex items-center gap-1.5"><PenLine size={14} /> C. Your turn</span>
          <span dir="rtl">دورك: اكتب جملتين عنك أنت بكلمات من النص.</span>
        </div>
        {[0, 1].map(i => <div key={i} className="border-b border-zinc-400" style={{ height: 30 }} />)}
      </div>
    </div>
  )
}

/* ── Front and back matter ───────────────────────────────────────────── */

export function MatterPage({ theme: t, titleEn, titleAr, pageNo, filename, label, children }: {
  theme: SheetTheme; titleEn: string; titleAr: string; pageNo: number | null; filename: string; label: string; children: ReactNode
}) {
  const header = (
    <>
      <div className="flex items-center justify-between gap-3 px-8" style={{ height: 96, background: t.accent, color: t.onAccent }} dir="ltr">
        <span className="text-[28px] font-black uppercase tracking-wide">{titleEn}</span>
        <span className="text-[30px] font-black" dir="rtl">{titleAr}</span>
      </div>
      <Strip t={t} />
    </>
  )
  return (
    <Sheet theme={t} header={header} filename={filename}
      label={`${label}${pageNo ? ` · صفحة ${pageNo}` : ''}`}
      footerMid={pageNo ? pageNoText(pageNo) : ''}>
      {children}
    </Sheet>
  )
}

export interface ContentsUnitRow { n: number; icon: string; titleEn: string; titleAr: string; first: number | null; last: number | null }
export interface ContentsEndRow { en: string; ar: string; page: number | null }

export function ContentsBody({ theme: t, units, end }: { theme: SheetTheme; units: ContentsUnitRow[]; end: ContentsEndRow[] }) {
  const numbered = units.some(u => u.first != null)
  return (
    <div dir="ltr">
      <div className="flex items-center gap-2 mb-3 text-[11.5px] font-bold text-zinc-600">
        <span className="font-black" style={{ color: t.dark }}>EACH UNIT ·</span>
        {PARTS.map(p => {
          const s = PART[p]
          return (
            <span key={p} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5" style={{ background: t.soft }}>
              <span className="font-black">{s.no}</span><s.Icon size={12} style={{ color: t.dark }} /> <bdi dir="rtl">{s.ar}</bdi>
            </span>
          )
        })}
      </div>
      {numbered && (
        <div className="flex items-center gap-3 pb-1 mb-1.5 border-b-2 text-[11px] font-black" style={{ borderColor: t.dark, color: t.dark }}>
          <span className="flex-1">UNIT · الوحدة</span>
          <span className="w-[86px] text-center whitespace-nowrap">PAGES · الصفحات</span>
        </div>
      )}
      <div className="space-y-[7px]">
        {units.map(r => (
          <div key={r.n} className="flex items-center gap-3">
            <span className="w-[74px] shrink-0 rounded-md px-2 py-0.5 text-center text-[12.5px] font-black text-white" style={{ background: t.dark }}>UNIT {pad(r.n)}</span>
            <span className="text-[17px] leading-none w-6 text-center">{r.icon}</span>
            <span className="text-[14px] font-extrabold whitespace-nowrap">{r.titleEn} <span className="text-zinc-400 mx-1">|</span> <bdi dir="rtl">{r.titleAr}</bdi></span>
            <span className="flex-1 border-b-2 border-dotted border-zinc-300 translate-y-1" />
            {r.first != null && (
              <span className="w-[86px] text-center text-[14px] font-black tabular-nums" style={{ color: t.dark }}>
                {pad(r.first)}{r.last != null && r.last !== r.first ? `–${pad(r.last)}` : ''}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t-2 space-y-[7px]" style={{ borderColor: t.dark }}>
        {end.map(e => (
          <div key={e.en} className="flex items-center gap-3">
            <span className="w-[74px] shrink-0 rounded-md px-2 py-0.5 text-center text-[12px] font-black" style={{ background: t.accent, color: t.onAccent }}>
              <Sparkles size={12} className="inline -mt-0.5" />
            </span>
            <span className="w-6" />
            <span className="text-[14px] font-black">{e.en} <span className="text-zinc-400 mx-1">|</span> <bdi dir="rtl">{e.ar}</bdi></span>
            <span className="flex-1 border-b-2 border-dotted border-zinc-300 translate-y-1" />
            {e.page != null && <span className="w-[86px] text-center text-[14px] font-black tabular-nums" style={{ color: t.dark }}>{pad(e.page)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function WhyBody({ theme: t, stats }: { theme: SheetTheme; stats: { n: string; ar: string; en: string }[] }) {
  const steps = [
    'ادرس الوحدة في الكتاب الأساسي أولًا، ثم افتح الوحدة نفسها هنا.',
    'اقرأ الكلمات وأمثلتها بصوت عالٍ، ثم غطِّ العربية واختبر نفسك.',
    'مثّل المحادثات مع زميل، وبدّل الأسئلة والأجوبة من الإطارين.',
    'اقرأ النص وأجب عن الأسئلة، ثم صحّح من صفحة الأجوبة في آخر الكتاب.',
  ]
  return (
    <div dir="rtl">
      <div className="text-center">
        <div className="text-[46px] font-black italic leading-none" style={{ color: t.dark, fontFamily: 'Georgia, serif' }} dir="ltr">Why this book?</div>
        <h2 className="mt-2 text-[24px] font-black">لماذا هذا الكتاب؟</h2>
      </div>
      <div className="mt-4 rounded-xl px-6 py-3.5 text-[15.5px] font-bold leading-[1.9] text-center" style={{ background: t.accent, color: t.onAccent }}>
        يعلّمك كتاب «الإنجليزية للمواقف اليومية» أهمّ الكلمات والعبارات في كل موقف. لكن الحياة الحقيقية تحتاج إلى أكثر:
        كلمات أكثر، وطرق مختلفة لطرح السؤال نفسه والإجابة عنه، وتدريب على الفهم.
        هذا الكتاب يكمّل الكتاب الأساسي وحدةً بوحدة، ليصبح رصيدك أغنى وكلامك أكثر طبيعية.
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2.5" dir="ltr">
        {stats.map(s => (
          <div key={s.en} className="rounded-xl py-2.5 text-center" style={{ background: t.soft }}>
            <div className="text-[26px] font-black leading-none" style={{ color: t.dark }}>{s.n}</div>
            <div className="mt-1 text-[13px] font-black" dir="rtl">{s.ar}</div>
            <div className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider">{s.en}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-[17px] font-black">كل وحدة في أربع صفحات</h3>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {PARTS.map(p => {
          const s = PART[p]
          return (
            <div key={p} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ border: `1.5px solid ${t.dark}22` }}>
              <span className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white" style={{ background: t.dark }}><s.Icon size={19} /></span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-[14.5px] font-black">{s.no}. {s.ar} <span className="text-[10.5px] text-zinc-400" dir="ltr">{s.en}</span></span>
                <span className="block text-[12.5px] font-bold text-zinc-600 leading-snug">{s.descAr}</span>
              </span>
            </div>
          )
        })}
      </div>

      <h3 className="mt-5 text-[17px] font-black">طريقة الاستعمال</h3>
      <div className="mt-2 space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[14px] font-black" style={{ background: t.accent, color: t.onAccent }}>{i + 1}</span>
            <span className="text-[14.5px] font-bold">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl px-6 py-3" style={{ border: `2px dashed ${t.dark}` }}>
        <div className="text-[12.5px] font-black mb-2" style={{ color: t.dark }} dir="ltr">THIS BOOK BELONGS TO · هذا الكتاب ملك</div>
        <div className="grid grid-cols-3 gap-6 text-[12.5px] font-bold text-zinc-500" dir="ltr">
          {['Name · الاسم', 'Level · المستوى', 'Start date · تاريخ البداية'].map(l => (
            <div key={l}><div className="border-b border-zinc-400" style={{ height: 26 }} /><div className="mt-1">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** One A–Z index entry, or a letter heading. */
export type IndexLine = { letter: string } | { en: string; ar: string; page: number | null }

export function IndexBody({ theme: t, columns, first }: { theme: SheetTheme; columns: IndexLine[][]; first: boolean }) {
  return (
    <div>
      {first && (
        <p className="text-[13.5px] font-bold text-zinc-600 text-right mb-2" dir="rtl">
          كل كلمات الكتاب مرتّبة أبجديًا، مع ترجمتها ورقم الصفحة التي تجدها فيها.
        </p>
      )}
      <div className="grid grid-cols-3 gap-x-5" dir="ltr">
        {columns.map((col, c) => (
          <div key={c}>
            {col.map((l, i) => 'letter' in l ? (
              <div key={i} className="mt-1 mb-0.5 flex items-center gap-2" style={{ height: 26 }}>
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-[14px] font-black text-white" style={{ background: t.dark }}>{l.letter}</span>
                <span className="flex-1 h-[2px]" style={{ background: line(t) }} />
              </div>
            ) : (
              <div key={i} className={`flex items-center gap-1.5 leading-none ${l.en.length + l.ar.length > 30 ? 'text-[10px]' : 'text-[11.5px]'}`} style={{ height: 19 }}>
                <span className="font-bold whitespace-nowrap">{l.en}</span>
                <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-right text-zinc-500 font-semibold" dir="rtl">{l.ar}</span>
                {l.page != null && <span className="w-6 text-right font-black tabular-nums" style={{ color: t.dark }}>{l.page}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnswersBody({ theme: t, units }: { theme: SheetTheme; units: VocabBookUnit[] }) {
  return (
    <div dir="ltr">
      <p className="text-[13.5px] font-bold text-zinc-600 text-right mb-2" dir="rtl">أجوبة أسئلة القراءة في كل وحدة. حاول دائمًا أن تجيب قبل أن تنظر هنا!</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {units.map(u => (
          <div key={u.n} className="rounded-lg px-3 py-1" style={{ background: t.soft }}>
            <div className="flex items-center gap-2 text-[12px] font-black">
              <span className="rounded px-1.5 py-0.5 text-white" style={{ background: t.dark }}>UNIT {pad(u.n)}</span>
              <span className="truncate">{u.reading.title}</span>
            </div>
            <div className="mt-1 text-[11.5px] font-semibold leading-snug">
              <span className="font-black">A.</span>{' '}
              {u.reading.tf.map((x, i) => <span key={i} className="mr-2"><b>{i + 1}</b> {x.ok ? 'True' : 'False'}</span>)}
            </div>
            {u.reading.qs.map((x, i) => (
              <div key={i} className="text-[11.5px] font-semibold leading-snug">
                <b>{u.reading.tf.length + i + 1}.</b> {x.a}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinalBody({ theme: t, authorAr, authorEn, website, phone }: { theme: SheetTheme; authorAr: string; authorEn: string; website: string; phone: string }) {
  return (
    <div dir="rtl">
      <div className="text-center">
        <div className="text-[50px] font-black italic leading-none" style={{ color: t.dark, fontFamily: 'Georgia, serif' }} dir="ltr">Final thought</div>
        <h2 className="mt-2 text-[24px] font-black">كلمة أخيرة</h2>
      </div>
      <div className="mt-6 text-[16px] font-semibold leading-[2] text-zinc-800 space-y-3">
        <p>عزيزي القارئ،</p>
        <p>إذا وصلت إلى هذه الصفحة، فقد أنهيت تسع عشرة وحدة وتعلّمت مئات الكلمات والعبارات الجديدة. هذا إنجاز حقيقي، فافتخر به.</p>
        <p>تذكّر أن اللغة لا تعيش في الكتاب، بل في الاستعمال. استعمل كلمة جديدة كل يوم: في رسالة، في محادثة، أو حتى مع نفسك أمام المرآة. ولا تخف من الأخطاء، فكل خطأ خطوة نحو الطلاقة.</p>
        <p>أعد قراءة المحادثات، وارجع إلى الفهرس كلما احتجت إلى كلمة. وعندما تشعر أنك مستعد للخطوة التالية، نحن هنا معك.</p>
      </div>
      <div className="mt-6 rounded-xl px-6 py-4 text-center" style={{ background: t.accent, color: t.onAccent }}>
        <div className="text-[22px] font-black italic" style={{ fontFamily: 'Georgia, serif' }} dir="ltr">“Every word you learn opens a new door.”</div>
        <div className="mt-1 text-[16px] font-black">«كل كلمة تتعلّمها تفتح لك بابًا جديدًا.»</div>
      </div>
      <div className="mt-6 text-left" dir="ltr">
        <div className="text-[13px] font-bold text-zinc-500">With all my encouragement,</div>
        <div className="text-[20px] font-black" dir="rtl" style={{ textAlign: 'left' }}>{authorAr}</div>
        <div className="text-[13px] font-black tracking-[0.15em] uppercase" style={{ color: t.dark }}>{authorEn}</div>
      </div>
      <h3 className="mt-6 text-[17px] font-black">ماذا بعد؟</h3>
      <div className="mt-2 grid grid-cols-3 gap-2.5">
        {[
          { t: 'حصص مباشرة', d: 'تكلّم الإنجليزية مع الأستاذ في حصص فردية أو جماعية.' },
          { t: 'المستوى التالي', d: 'واصل مسارك نحو A2 ثم B1 خطوة بخطوة.' },
          { t: 'تواصل معنا', d: `${website} · ${phone}` },
        ].map(c => (
          <div key={c.t} className="rounded-xl px-3 py-2.5" style={{ background: t.soft }}>
            <div className="text-[14px] font-black" style={{ color: t.dark }}>{c.t}</div>
            <div className="text-[12.5px] font-bold text-zinc-600 leading-snug"><bdi>{c.d}</bdi></div>
          </div>
        ))}
      </div>
    </div>
  )
}
