'use client'

import { useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, Grid3x3, Link2, ListOrdered, Printer, type LucideIcon } from 'lucide-react'
import { solutionCells, type MatchingSet, type ScrambleItem, type WordSearchResult } from '@/lib/game-generators'

/**
 * The printed workbook page, shared by the /admin/games tools.
 *
 * Every exercise is a real A4 page (794 × 1123 px = 210 × 297 mm at 96 dpi)
 * built like the book itself: the unit block and coloured title band on top,
 * a numbered section heading, the instruction in Arabic and English, a
 * name / date / score line, the exercise, and a branded footer. White ground
 * so it prints cheaply and students can write on it.
 *
 * "Print / PDF" prints every page on screen, one A4 sheet each (@page A4,
 * no margins); "PNG" rasterises one page with html2canvas (already shipped
 * by html2pdf.js) at ~300 dpi, to drop into the Canva workbook.
 */

export interface SheetTheme { id: string; label: string; dark: string; accent: string; soft: string; onAccent: string }
export const THEMES: SheetTheme[] = [
  { id: 'book',    label: 'ألوان الكتاب (بني وأصفر)',   dark: '#2B1B0F', accent: '#FFD54A', soft: '#FFF7DB', onAccent: '#2B1B0F' },
  { id: 'inglizi', label: 'إنجليزي.كوم (كحلي وذهبي)',  dark: '#0B1B4D', accent: '#C8973F', soft: '#F7F0E3', onAccent: '#FFFFFF' },
  { id: 'mono',    label: 'أبيض وأسود (طباعة اقتصادية)', dark: '#111111', accent: '#D9D9D9', soft: '#F4F4F4', onAccent: '#111111' },
]

export const PAGE_W = 794, PAGE_H = 1123

/* ── Admin-side chrome ──────────────────────────────────────────────── */

export function GamesHeader({ title, back }: { title: string; back?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 print:hidden">
      <Link href={back ?? '/admin/games'} className="text-zinc-400 hover:text-zinc-700"><ChevronRight size={18} /></Link>
      <h1 className="text-[18px] font-extrabold text-zinc-900">{title}</h1>
    </div>
  )
}

export function ThemePicker({ value, onChange }: { value: SheetTheme; onChange: (t: SheetTheme) => void }) {
  return (
    <Field label="ألوان الصفحة">
      <div className="flex flex-col gap-1.5">
        {THEMES.map(t => (
          <button key={t.id} type="button" onClick={() => onChange(t)} aria-pressed={value.id === t.id}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[12px] font-bold text-right ${value.id === t.id ? 'border-zinc-900 ring-2 ring-zinc-200' : 'border-zinc-200'}`}>
            <span className="flex -space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full border border-white" style={{ background: t.dark }} />
              <span className="w-4 h-4 rounded-full border border-white" style={{ background: t.accent }} />
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11.5px] text-zinc-400">{hint}</p>}
    </div>
  )
}
export const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'
export const TEXTAREA = `${INP} resize-none font-mono leading-relaxed`

/** Title fields + "load a unit from the book" for the single-exercise tools,
 *  which work for any course: type your own list or start from a book unit. */
export interface SheetHead { unitNo: string; titleEn: string; titleAr: string }
export function HeadFields({ head, onHead, onLoadUnit, units }: {
  head: SheetHead; onHead: (h: SheetHead) => void
  onLoadUnit: (n: number) => void
  units: { n: number; titleAr: string }[]
}) {
  return (
    <>
      <Field label="ابدأ من وحدة في الكتاب (اختياري)">
        <select defaultValue="" onChange={e => e.target.value && onLoadUnit(Number(e.target.value))} className={INP}>
          <option value="">— قائمة خاصة بي —</option>
          {units.map(u => <option key={u.n} value={u.n}>الوحدة {u.n} — {u.titleAr}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-[72px_1fr] gap-2">
        <Field label="رقم الوحدة"><input value={head.unitNo} onChange={e => onHead({ ...head, unitNo: e.target.value })} dir="ltr" className={INP} /></Field>
        <Field label="العنوان بالإنجليزية"><input value={head.titleEn} onChange={e => onHead({ ...head, titleEn: e.target.value })} dir="ltr" className={INP} /></Field>
      </div>
      <Field label="العنوان بالعربية"><input value={head.titleAr} onChange={e => onHead({ ...head, titleAr: e.target.value })} className={INP} /></Field>
    </>
  )
}
export const headMeta = (h: SheetHead, theme: SheetTheme, filename: string): PageMeta => ({
  theme, filename,
  unitNo: h.unitNo.trim() && !Number.isNaN(Number(h.unitNo)) ? Number(h.unitNo) : null,
  unitEn: h.titleEn, unitAr: h.titleAr,
})

export function PrintAllButton({ count }: { count: number }) {
  return (
    <button type="button" onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white font-bold text-[13px] px-4 py-2.5 hover:bg-zinc-800">
      <Printer size={15} /> طباعة / حفظ PDF ({count} {count === 1 ? 'صفحة' : 'صفحات'})
    </button>
  )
}

/* ── The A4 page ────────────────────────────────────────────────────── */

export interface PageMeta {
  theme: SheetTheme
  unitNo?: number | null
  unitEn?: string
  unitAr?: string
  pageNo?: number | null
  filename: string
}

const SECTION: Record<'search' | 'order' | 'match', { en: string; ar: string; Icon: LucideIcon }> = {
  search: { en: 'WORD SEARCH',     ar: 'البحث عن الكلمات', Icon: Grid3x3 },
  order:  { en: 'WORDS IN ORDER',  ar: 'رتّب الكلمات',     Icon: ListOrdered },
  match:  { en: 'MATCHING',        ar: 'صِل الكلمة بمعناها', Icon: Link2 },
}

/** One printable A4 page with the book's frame, plus its own PNG button. */
export function A4Page({ meta, section, sectionNo, answerKey, instructionAr, instructionEn, score, children }: {
  meta: PageMeta
  section: keyof typeof SECTION
  sectionNo: number
  answerKey?: boolean
  instructionAr: string
  instructionEn: string
  /** "/ 12" — shown in the name/date/score line (not on answer keys). */
  score?: number
  children: ReactNode
}) {
  const id = `sheet-${useId().replace(/:/g, '')}`
  const [busy, setBusy] = useState(false)
  const { theme: t } = meta
  const s = SECTION[section]

  async function png() {
    setBusy(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const node = document.getElementById(id)
      if (!node) return
      const canvas = await html2canvas(node, { scale: 3, useCORS: true, backgroundColor: '#FFFFFF', width: PAGE_W, height: PAGE_H })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png'); a.download = `${meta.filename}${answerKey ? '-answers' : ''}.png`; a.click()
    } finally { setBusy(false) }
  }

  return (
    <div className="print-sheet-wrap">
      <div className="flex items-center justify-between gap-2 mb-2 print:hidden">
        <span className="text-[12px] font-bold text-zinc-400">
          {s.ar}{answerKey ? ' — مفتاح الحل' : ''}{meta.pageNo ? ` · صفحة ${meta.pageNo}` : ''}
        </span>
        <button type="button" onClick={png} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 font-bold text-[12px] px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-50">
          <Download size={13} /> {busy ? '...' : 'PNG'}
        </button>
      </div>
      <div className="overflow-auto rounded-xl shadow-[0_2px_18px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200 print:shadow-none print:ring-0 print:rounded-none print:overflow-visible">
        <div id={id} className="print-sheet relative mx-auto bg-white text-[#1A1A1A] overflow-hidden"
          style={{ width: PAGE_W, height: PAGE_H, fontFamily: 'inherit' }}>
          {/* Header — the book's frame: unit block + title band */}
          <div className="flex items-stretch" style={{ height: 86 }} dir="ltr">
            {meta.unitNo != null && (
              <div className="flex items-center justify-center px-5" style={{ background: t.dark }}>
                <span className="rounded-md bg-white px-3 py-1 text-[22px] font-black" style={{ color: t.dark }}>UNIT {meta.unitNo}</span>
              </div>
            )}
            <div className="flex-1 flex items-center justify-between gap-3 px-6" style={{ background: t.accent, color: t.onAccent }}>
              <span className="text-[21px] font-black uppercase leading-tight">{meta.unitEn ?? ''}</span>
              <span className="text-[24px] font-black leading-tight" dir="rtl">{meta.unitAr ?? ''}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 text-[11px] font-extrabold" style={{ background: t.dark, color: '#fff' }} dir="ltr">
            <span>WORKBOOK · EXERCISES</span>
            <span dir="rtl">دفتر التمارين</span>
          </div>

          <div className="px-10 pt-6">
            {/* Section heading */}
            <div className="flex items-center gap-2" dir="ltr">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg text-[20px] font-black text-white" style={{ background: t.dark }}>{sectionNo}</span>
              <span className="flex items-center gap-2 rounded-lg px-4 h-10 text-[16px] font-black text-white" style={{ background: t.dark }}>
                <s.Icon size={18} style={{ color: t.accent === '#D9D9D9' ? '#fff' : t.accent }} />
                {s.en} <span className="opacity-50">|</span> <span dir="rtl">{s.ar}</span>
              </span>
              {answerKey && (
                <span className="mr-auto rounded-full px-3 py-1 text-[12px] font-black" style={{ background: t.accent, color: t.onAccent }}>ANSWER KEY · مفتاح الحل</span>
              )}
            </div>

            {/* Instruction */}
            <div className="mt-4 rounded-lg px-4 py-2.5 flex items-center justify-between gap-4" style={{ background: t.soft, borderInlineStart: `4px solid ${t.accent === '#D9D9D9' ? '#111' : t.accent}` }}>
              <span className="text-[12.5px] font-bold text-zinc-600" dir="ltr">{instructionEn}</span>
              <span className="text-[14px] font-extrabold text-right" dir="rtl">{instructionAr}</span>
            </div>

            {/* Name / date / score */}
            {!answerKey && (
              <div className="mt-4 flex items-end gap-6 text-[13px] font-bold text-zinc-600" dir="ltr">
                <span className="flex-1 flex items-end gap-2">Name<span className="flex-1 border-b border-dashed border-zinc-400" /></span>
                <span className="w-44 flex items-end gap-2">Date<span className="flex-1 border-b border-dashed border-zinc-400" /></span>
                {score != null && <span className="rounded-md border-2 px-3 py-0.5 font-black" style={{ borderColor: t.dark, color: t.dark }}>&nbsp;&nbsp;&nbsp;&nbsp; / {score}</span>}
              </div>
            )}

            <div className="mt-6">{children}</div>
          </div>

          {/* Footer */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6" style={{ height: 34, background: t.dark, color: '#fff' }} dir="ltr">
            <span className="text-[13px] font-black">Inglizi<span style={{ color: t.accent === '#D9D9D9' ? '#fff' : t.accent }}>.com</span></span>
            <span className="text-[12px] font-extrabold">{meta.unitNo != null ? `UNIT ${meta.unitNo}` : ''}{meta.pageNo ? ` | ${String(meta.pageNo).padStart(2, '0')}` : ''}</span>
            <span className="text-[11px] font-bold opacity-80" dir="rtl">أكاديمية إنجليزي الدولية</span>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet-wrap { break-after: page; }
          .print-sheet { width: 210mm !important; height: 297mm !important; margin: 0 !important; }
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

/* ── Exercise bodies ────────────────────────────────────────────────── */

export function WordSearchBody({ result, words, theme, answerKey }: {
  result: WordSearchResult; words: { en: string; ar?: string }[]; theme: SheetTheme; answerKey?: boolean
}) {
  // Grid + word bank must fit above the footer, with the name line on top.
  const cell = Math.min(40, Math.floor(500 / result.size))
  const sol = answerKey ? solutionCells(result.placed) : null
  return (
    <div dir="ltr">
      <div className="mx-auto w-fit rounded-xl p-2" style={{ border: `3px solid ${theme.dark}` }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${result.size}, ${cell}px)` }}>
          {result.grid.map((row, y) => row.map((ch, x) => {
            const hit = sol?.has(`${y}:${x}`)
            return (
              <div key={`${y}-${x}`} className="flex items-center justify-center font-black"
                style={{
                  width: cell, height: cell, fontSize: Math.round(cell * 0.48),
                  borderRight: x < result.size - 1 ? '1px solid #E7E7E7' : undefined,
                  borderBottom: y < result.size - 1 ? '1px solid #E7E7E7' : undefined,
                  background: hit ? theme.accent : undefined, color: hit ? theme.onAccent : sol ? '#BDBDBD' : '#1A1A1A',
                }}>{ch}</div>
            )
          }))}
        </div>
      </div>
      <div className="mt-6 rounded-xl px-5 py-3" style={{ background: theme.soft }}>
        <div className="text-[12px] font-black mb-2" style={{ color: theme.dark }}>WORD BANK · بنك الكلمات</div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
          {words.map(w => (
            <div key={w.en} className="flex items-center gap-2 text-[14px]">
              <span className="w-4 h-4 shrink-0 rounded border-2" style={{ borderColor: theme.dark, background: answerKey ? theme.dark : undefined }} />
              <span className="font-extrabold">{w.en}</span>
              {w.ar && <span className="text-[12.5px] text-zinc-500 font-bold mr-auto" dir="rtl">{w.ar}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrderBody({ items, theme, answerKey }: { items: ScrambleItem[]; theme: SheetTheme; answerKey?: boolean }) {
  return (
    <div className={answerKey ? 'space-y-4' : 'space-y-[18px]'} dir="ltr">
      {items.map((it, i) => (
        <div key={i} className="flex gap-3">
          <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-black text-white" style={{ background: theme.dark }}>{i + 1}</span>
          <div className="flex-1">
            {answerKey ? (
              <div className="text-[16px] font-bold pt-0.5">{it.original}</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {it.scrambled.map((w, j) => (
                    <span key={j} className="rounded-md px-2.5 py-0.5 text-[14.5px] font-extrabold" style={{ border: `2px solid ${theme.dark}`, background: theme.soft }}>{w}</span>
                  ))}
                </div>
                <div className="mt-2 flex items-end gap-1 text-[18px] font-black text-zinc-400">
                  <span className="flex-1 border-b-2 border-zinc-300" style={{ height: 22 }} />{it.end}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MatchBody({ set, theme, answerKey }: { set: MatchingSet; theme: SheetTheme; answerKey?: boolean }) {
  const letter = (i: number) => String.fromCharCode(65 + i)
  const letterOf = (leftId: number) => letter(set.right.findIndex(r => r.matchId === leftId))
  return (
    <div>
      <div className="grid grid-cols-[1fr_120px_1fr] items-start" dir="ltr">
        <div className="space-y-3">
          {set.left.map(l => (
            <div key={l.id} className="flex items-center gap-2.5 h-10">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[13px] font-black text-white" style={{ background: theme.dark }}>{l.id + 1}</span>
              <span className="flex-1 rounded-lg px-3 py-1.5 text-[16px] font-extrabold" style={{ background: theme.soft }}>{l.text}</span>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.dark }} />
            </div>
          ))}
        </div>
        <div />
        <div className="space-y-3">
          {set.right.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 h-10">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.dark }} />
              <span className="flex-1 rounded-lg px-3 py-1.5 text-[17px] font-extrabold text-right" style={{ border: `2px solid ${theme.dark}` }} dir="rtl">{r.text}</span>
              <span className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[13px] font-black" style={{ background: theme.accent, color: theme.onAccent }}>{letter(i)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-xl px-5 py-3" style={{ background: theme.soft }} dir="ltr">
        <div className="text-[12px] font-black mb-2" style={{ color: theme.dark }}>{answerKey ? 'ANSWERS · الأجوبة' : 'WRITE THE LETTER · اكتب الحرف'}</div>
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          {set.left.map(l => (
            <div key={l.id} className="flex items-center gap-2 text-[15px] font-black">
              <span>{l.id + 1}</span>
              <span className="w-10 h-8 rounded-md bg-white flex items-center justify-center" style={{ border: `2px solid ${theme.dark}` }}>{answerKey ? letterOf(l.id) : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
