'use client'

import { useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, Printer } from 'lucide-react'

/**
 * Shared chrome for the three /admin/games pages: a brand-colour picker (any
 * course can use its own colours, not just Inglizi navy/gold), a print
 * button, and a PNG download via html-to-image, loaded lazily so the ~40KB
 * lib never ships to a page that doesn't print anything.
 *
 * The exported sheet is a plain, fixed-size div (#game-sheet) styled only
 * with inline styles driven by `colors` — @media print hides everything
 * else and prints just that div full-page, and html-to-image rasterises the
 * same node for the PNG download, so both outputs always match on screen.
 */

export interface GameColors { bg: string; ink: string; accent: string }
export const DEFAULT_COLORS: GameColors = { bg: '#0B1B4D', ink: '#FFFFFF', accent: '#C8973F' }
const SWATCHES: { label: string; colors: GameColors }[] = [
  { label: 'كُحلي وذهبي (إنجليزي.كوم)', colors: DEFAULT_COLORS },
  { label: 'أبيض وأسود (طباعة اقتصادية)', colors: { bg: '#FFFFFF', ink: '#111111', accent: '#111111' } },
  { label: 'كريمي وبنّي', colors: { bg: '#FBF3E7', ink: '#2A1D12', accent: '#B5651D' } },
]

export function GamesHeader({ title, back }: { title: string; back?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 print:hidden">
      <Link href={back ?? '/admin/games'} className="text-zinc-400 hover:text-zinc-700"><ChevronRight size={18} /></Link>
      <h1 className="text-[18px] font-extrabold text-zinc-900">{title}</h1>
    </div>
  )
}

export function ColorPicker({ value, onChange }: { value: GameColors; onChange: (c: GameColors) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">ألوان الصفحة</label>
      <div className="flex gap-2 flex-wrap">
        {SWATCHES.map(s => (
          <button key={s.label} type="button" onClick={() => onChange(s.colors)}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[12px] font-bold ${value.bg === s.colors.bg ? 'border-zinc-900 ring-2 ring-zinc-200' : 'border-zinc-200'}`}>
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full border border-white" style={{ background: s.colors.bg }} />
              <span className="w-4 h-4 rounded-full border border-white" style={{ background: s.colors.accent }} />
            </span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
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

/** Wraps the printable sheet: handles the print / PNG-download actions and
 *  the fixed-size exportable surface. `filename` excludes the extension.
 *
 *  A page can hold several sheets at once (several bingo cards, or a puzzle
 *  plus its answer key) — each gets its own id (React's useId) so its own
 *  download button grabs the right node, not just the first sheet on the
 *  page. Printing shows every sheet on the page via a shared class, since
 *  printing "all the bingo cards at once" is the whole point there. */
export function PrintSheet({ filename, colors, children }: { filename: string; colors: GameColors; children: ReactNode }) {
  const id = `sheet-${useId().replace(/:/g, '')}`
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function downloadPng() {
    setBusy(true); setErr(null)
    try {
      // html2canvas ships inside html2pdf.js (already used by the teacher
      // monthly report for Arabic-safe rendering) — no extra dependency.
      const html2canvas = (await import('html2canvas')).default
      const node = document.getElementById(id)
      if (!node) throw new Error('sheet not found')
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: colors.bg })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png'); a.download = `${filename}.png`; a.click()
    } catch {
      setErr('تعذّر إنشاء الصورة — جرّب «طباعة» ثم «حفظ كـ PDF» بدلًا من ذلك.')
    } finally { setBusy(false) }
  }

  return (
    <div className="print-sheet-wrap">
      <div className="flex items-center gap-2 mb-4 print:hidden">
        <button type="button" onClick={downloadPng} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white font-bold text-[13px] px-4 py-2.5 disabled:opacity-50">
          <Download size={15} /> {busy ? '...' : 'تنزيل كصورة PNG'}
        </button>
        <button type="button" onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13px] px-4 py-2.5 hover:bg-zinc-50">
          <Printer size={15} /> طباعة / حفظ PDF
        </button>
        {err && <span className="text-[12px] font-semibold text-red-600">{err}</span>}
      </div>
      <div className="overflow-auto rounded-2xl ring-1 ring-zinc-200 print:ring-0 print:rounded-none print:overflow-visible">
        <div id={id} className="print-sheet mx-auto" style={{ background: colors.bg, color: colors.ink, width: 816, minHeight: 1056, padding: 48 }}>
          {children}
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { width: 100%; min-height: 100vh; margin: 0; break-after: page; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
    </div>
  )
}

export function SheetTitle({ title, unit, colors }: { title: string; unit?: string; colors: GameColors }) {
  return (
    <header className="mb-6 text-center" dir="rtl">
      {unit && <div className="text-[13px] font-extrabold tracking-wide mb-1" style={{ color: colors.accent }}>{unit}</div>}
      <h2 className="text-[26px] font-black">{title}</h2>
      <div className="mx-auto mt-3 h-[3px] w-20 rounded-full" style={{ background: colors.accent }} />
    </header>
  )
}
