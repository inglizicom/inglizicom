'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import MonthReportView from '@/components/teacher-report/MonthReport'
import { DEMO_MONTH_REPORT } from '@/lib/teacher-report'
import { isTeacherDemo } from '../_demo'
import { DemoBanner } from '../_ui'

/**
 * التقرير الشهري — the teacher's own month: students, sessions, attendance,
 * money, net pay and a strict automatic evaluation, downloadable as a PDF.
 * ?month=YYYY-MM picks the month (default: this one).
 */
export default function TeacherReportPage() {
  return <Suspense fallback={null}><Report /></Suspense>
}

function Report() {
  const teacher = useTeacher()
  const router = useRouter()
  const sp = useSearchParams()
  const demo = isTeacherDemo()
  const m = sp.get('month')
  const month = (m && /^\d{4}-\d{2}$/.test(m) ? m : new Date().toISOString().slice(0, 7)) + '-01'

  return (
    <div className="space-y-4">
      {demo && <DemoBanner />}
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-700/30"><FileText size={20} /></span>
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-[#1E3A8A]">التقرير الشهري</h1>
          <p className="text-[13px] text-[#64748B]">كل ما حدث في الشهر، أجرك الصافي، وتقييم آلي صارم مبني على البيانات.</p>
        </div>
      </div>
      <MonthReportView teacherId={teacher.id} initialMonth={month} demo={demo ? DEMO_MONTH_REPORT : undefined}
        onMonth={next => router.replace(`/teacher/monthly?month=${next.slice(0, 7)}${demo ? '&demo=1' : ''}`, { scroll: false })} />
    </div>
  )
}
