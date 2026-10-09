'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { SECTION_NAMES } from '@/data/bac/bac-pack'
import type { BacSection } from '@/data/bac/bac-helpers'
import { BAC_UNITS, summarizeBac, type BacActivityRow, type BacSummary } from '@/lib/bac-practice'
import { SECTION_COLOUR } from './BacBlocks'

/**
 * A student's Bac pack results, for staff (CRM student page). Built from the
 * rows the portal reports (lib/bac-practice.ts → bacReports): scores are first
 * attempts, mock exam marks include the student's own writing score.
 */

const SECTIONS: BacSection[] = ['start', 'reading', 'vocab', 'grammar', 'functions', 'writing', 'exam']
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
export const pctTone = (p: number) => (p >= 80 ? 'text-emerald-600' : p >= 50 ? 'text-amber-600' : 'text-rose-600')

export default function BacResults({ rows }: { rows: BacActivityRow[] }) {
  const sum: BacSummary = summarizeBac(rows)
  return (
    <div className="space-y-5" dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Kpi label="دروس مكتملة" value={`${sum.done}/${BAC_UNITS.length}`} />
        <Kpi label="معدّل الأجوبة (أول محاولة)" value={sum.pct == null ? '—' : `${sum.pct}%`} tone={sum.pct == null ? '' : pctTone(sum.pct)} />
        <Kpi label="امتحانات تجريبية" value={`${sum.mocks.filter(m => m.mark != null).length}/5`} />
        <Kpi label="آخر نشاط" value={when(sum.last)} small />
      </div>

      <div>
        <div className="text-[13px] font-bold text-zinc-700 mb-2">الامتحانات التجريبية (من 20)</div>
        <div className="grid grid-cols-5 gap-2">
          {sum.mocks.map(m => (
            <div key={m.unit.id} className="rounded-xl border border-zinc-200 py-2 text-center">
              <div className="text-[11px] text-zinc-400 font-bold" dir="ltr">{m.unit.tag.replace('Mock exam', 'Mock')}</div>
              <div className={`text-[16px] font-black ${m.mark == null ? 'text-zinc-300' : pctTone((m.mark / 20) * 100)}`} dir="ltr">{m.mark == null ? '—' : m.mark}</div>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-400">الفهم واللغة مصحّحان تلقائيًا؛ نقطة الكتابة تقييم الطالب الذاتي.</p>
      </div>

      {SECTIONS.map(sec => {
        const units = sum.units.filter(u => u.unit.section === sec)
        return (
          <div key={sec}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: SECTION_COLOUR[sec].c }} />
              <span className="text-[13px] font-bold text-zinc-700">{SECTION_NAMES[sec][1]}</span>
              <span className="text-[11px] text-zinc-400">{units.filter(u => u.done).length}/{units.length}</span>
            </div>
            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-100">
              {units.map(u => {
                const p = u.max ? Math.round((u.points / u.max) * 100) : null
                return (
                  <div key={u.unit.id} className="flex items-center gap-2.5 px-3 py-2 text-[12.5px]">
                    {u.done ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <Circle size={16} className="text-zinc-300 shrink-0" />}
                    <span className="flex-1 min-w-0 truncate"><b>{u.unit.titleAr}</b> <span className="text-zinc-400" dir="ltr">· {u.unit.tag}</span></span>
                    {u.gradable > 0 && <span className="text-[11px] text-zinc-400 shrink-0">{u.checked}/{u.gradable} تمارين</span>}
                    {u.mark != null && <span className="font-black shrink-0" dir="ltr">{u.mark}/20</span>}
                    {u.mark == null && p != null && <span className={`font-black w-11 text-left shrink-0 ${pctTone(p)}`} dir="ltr">{p}%</span>}
                    <span className="text-[10.5px] text-zinc-400 w-28 text-left shrink-0 hidden sm:block">{u.at ? when(u.at) : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Kpi({ label, value, tone = '', small }: { label: string; value: string; tone?: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 px-3 py-2.5">
      <div className="text-[11px] text-zinc-400 font-bold">{label}</div>
      <div className={`${small ? 'text-[12.5px]' : 'text-[18px]'} font-black mt-0.5 ${tone}`} dir={small ? 'rtl' : 'ltr'} style={{ textAlign: 'right' }}>{value}</div>
    </div>
  )
}
