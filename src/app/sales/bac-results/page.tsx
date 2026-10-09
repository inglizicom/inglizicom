'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck, Loader2, Search } from 'lucide-react'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { fetchBacActivity, fetchStudentNames } from '@/lib/student-portal'
import { BAC_UNITS, summarizeBac, type BacActivityRow, type BacSummary } from '@/lib/bac-practice'
import BacResults, { pctTone } from '@/components/bac/BacResults'

/**
 * /sales/bac-results (admin domain: /bac-results) — every student's results
 * in the portal's «الباك» tab, read from the activity log the portal reports
 * to. One row per student who has done anything; tap a row for the detail.
 */

type Row = { id: string; name: string; phone: string | null; course: string | null; rows: BacActivityRow[]; sum: BacSummary }

export default function BacResultsPage() {
  const base = useCrmBasePath()
  const [list, setList] = useState<Row[] | null>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const rows = await fetchBacActivity()
      const byStudent = new Map<string, BacActivityRow[]>()
      for (const r of rows) if (r.student_id) byStudent.set(r.student_id, [...(byStudent.get(r.student_id) ?? []), r])
      const names = new Map((await fetchStudentNames([...byStudent.keys()])).map(s => [s.id, s]))
      setList([...byStudent].map(([id, rs]) => {
        const s = names.get(id)
        return { id, name: s?.full_name ?? '—', phone: s?.phone_number ?? null, course: s?.course ?? null, rows: rs, sum: summarizeBac(rs) }
      }).sort((a, b) => (b.sum.last ?? '').localeCompare(a.sum.last ?? '')))
    })()
  }, [])

  const shown = useMemo(() => (list ?? []).filter(r => !q.trim() || `${r.name} ${r.phone ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())), [list, q])

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><ClipboardCheck size={20} className="text-red-700" /></div>
        <div>
          <h2 className="text-[17px] font-black text-zinc-900">نتائج حقيبة الباك</h2>
          <p className="text-[12px] text-zinc-400">ما أنجزه الطلاب في تبويب «الباك» بفضاء الطالب: التمارين (أول محاولة) والامتحانات التجريبية</p>
        </div>
      </div>

      {list === null ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-bold text-zinc-800">لا توجد نتائج بعد</p>
          <p className="text-[12.5px] text-zinc-500 mt-1 leading-relaxed max-w-md mx-auto">
            تظهر النتائج هنا بعد أن يُنجز الطلاب تمارين في تبويب «الباك». يظهر هذا التبويب للطلاب المسجّلين في دورة يحتوي اسمها أو مستواها على «Bac» أو «باك» أو «بكالوريا».
          </p>
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث باسم الطالب أو هاتفه"
              className="w-full rounded-xl border border-zinc-200 bg-white pr-9 pl-3 py-2 text-[13px] outline-none focus:border-zinc-400" />
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-x-auto">
            <table className="w-full min-w-[720px] text-[12.5px]">
              <thead>
                <tr className="text-zinc-400 text-[11px] border-b border-zinc-100">
                  <th className="text-right font-bold px-3 py-2.5">الطالب</th>
                  <th className="font-bold px-2">الدروس</th>
                  <th className="font-bold px-2">المعدّل</th>
                  {[1, 2, 3, 4, 5].map(n => <th key={n} className="font-bold px-1.5" dir="ltr">Mock {n}</th>)}
                  <th className="font-bold px-3 text-left">آخر نشاط</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(r => (
                  <Fragment key={r.id}>
                    <tr onClick={() => setOpen(o => (o === r.id ? null : r.id))} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer">
                      <td className="px-3 py-2.5">
                        <Link href={`${base}/students/${r.id}`} onClick={e => e.stopPropagation()} className="font-bold text-zinc-900 hover:text-blue-700">{r.name}</Link>
                        {r.course && <div className="text-[11px] text-zinc-400">{r.course}</div>}
                      </td>
                      <td className="text-center font-bold" dir="ltr">{r.sum.done}/{BAC_UNITS.length}</td>
                      <td className={`text-center font-black ${r.sum.pct == null ? 'text-zinc-300' : pctTone(r.sum.pct)}`} dir="ltr">{r.sum.pct == null ? '—' : `${r.sum.pct}%`}</td>
                      {r.sum.mocks.map(m => (
                        <td key={m.unit.id} className={`text-center font-black ${m.mark == null ? 'text-zinc-300' : pctTone((m.mark / 20) * 100)}`} dir="ltr">{m.mark ?? '—'}</td>
                      ))}
                      <td className="px-3 text-left text-[11px] text-zinc-400">{r.sum.last ? new Date(r.sum.last).toLocaleString('ar-MA', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                    </tr>
                    {open === r.id && (
                      <tr><td colSpan={9} className="bg-zinc-50/60 p-4"><BacResults rows={r.rows} /></td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-zinc-400">اضغط على صفّ لعرض التفاصيل، أو على اسم الطالب لفتح ملفه. نقطة الكتابة في الامتحانات التجريبية تقييم ذاتي.</p>
        </>
      )}
    </div>
  )
}
