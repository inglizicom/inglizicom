'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import MonthReportView from '@/components/teacher-report/MonthReport'
import { supabase } from '@/lib/supabase'

/**
 * /sales/teachers/report?teacher=<id>&month=YYYY-MM — any teacher's monthly
 * report for staff, with the academy's written note for that month.
 */
export default function StaffTeacherReportPage() {
  return <Suspense fallback={null}><Report /></Suspense>
}

function Report() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname() ?? '/sales/teachers/report'
  const teacherId = sp.get('teacher') ?? ''
  const m = sp.get('month')
  const month = (m && /^\d{4}-\d{2}$/.test(m) ? m : new Date().toISOString().slice(0, 7)) + '-01'
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // The picker: every teacher by name (staff can read teacher_profiles).
    supabase.from('teacher_profiles').select('id, display_name').then(({ data }) => {
      setTeachers(((data ?? []) as any[]).map(t => ({ id: t.id, name: t.display_name || 'أستاذ' })).sort((a, b) => a.name.localeCompare(b.name, 'ar')))
    })
  }, [])

  const back = pathname.replace(/\/report$/, '')
  return (
    <div className="px-4 lg:px-8 py-5 max-w-[1100px] mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={back} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-500 hover:text-blue-700">
          <ArrowRight size={14} /> الأساتذة
        </Link>
        <div className="hidden sm:block flex-1" />
        <select value={teacherId} onChange={e => router.replace(`${pathname}?teacher=${e.target.value}&month=${month.slice(0, 7)}`)}
          aria-label="الأستاذ"
          className="w-full sm:w-auto max-w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] font-bold">
          {!teacherId && <option value="">اختر أستاذًا</option>}
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {teacherId ? (
        <MonthReportView key={teacherId} teacherId={teacherId} initialMonth={month} staff
          onMonth={next => router.replace(`${pathname}?teacher=${teacherId}&month=${next.slice(0, 7)}`, { scroll: false })} />
      ) : (
        <div className="rounded-2xl bg-white border border-zinc-200 p-10 text-center text-[13px] text-zinc-400">اختر أستاذًا لعرض تقريره الشهري.</div>
      )}
    </div>
  )
}
