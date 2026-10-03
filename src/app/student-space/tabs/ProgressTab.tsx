'use client'

/* ProgressTab — the student space's "progress" tab, split out of page.tsx.
   Weekly activity grid, streak and the overall progress bars.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { CheckCircle2, TrendingUp, Award, Flame } from 'lucide-react'

import { pct, Card, MiniBar, MiniStat, SectionTitle, Empty, ExamRow } from '../_shared'
import type { StudentExam } from '@/lib/student-portal'

export interface ProgressTabProps {
  exams: StudentExam[]
  stats: { lessons_total: number; lessons_done: number; ex_total: number; ex_done: number; exam_total: number; exam_done: number; files_total: number; files_opened: number; overall: number; streak: number; last_activity: string | null; }
}

export default function ProgressTab({ exams, stats }: ProgressTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card title="تقدّمي" icon={TrendingUp} iconColor="text-emerald-500">
        <div className="space-y-3 mt-1">
          <MiniBar label="دروس الدورة" pct={pct(stats.lessons_done, stats.lessons_total)} color="bg-emerald-500" big />
          <MiniBar label="التمارين" pct={pct(stats.ex_done, stats.ex_total)} color="bg-blue-500" big />
          <MiniBar label="الامتحانات" pct={pct(stats.exam_done, stats.exam_total)} color="bg-amber-500" big />
          <MiniBar label="الملفات" pct={pct(stats.files_opened, stats.files_total)} color="bg-rose-500" big />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <MiniStat icon={Flame} value={`${stats.streak}`} label="يوم متتالٍ" />
          <MiniStat icon={CheckCircle2} value={`${stats.lessons_done}`} label="درس منجز" />
          <MiniStat icon={Award} value={`${stats.overall}%`} label="إجمالي" />
        </div>
      </Card>
      <SectionTitle icon={Award} color="text-amber-500">الامتحانات والنتائج</SectionTitle>
      {exams.length === 0 && <Empty emoji="📝" text="لا توجد امتحانات بعد" />}
      {exams.map(e => <div key={e.id} className="bg-white rounded-2xl border border-zinc-100 p-4"><ExamRow e={e} /></div>)}
    </div>
  )
}
