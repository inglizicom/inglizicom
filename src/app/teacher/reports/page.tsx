'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronLeft, ClipboardList, Loader2 } from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchReports, fetchReportsOwed, fetchSessions,
  type ClassSession, type LessonReport,
} from '@/lib/teachers'
import { Card, DemoBanner, Empty, PageHero, SectionTitle, fmtDateTime } from '../_ui'
import { DEMO_REPORTS, DEMO_REPORTS_OWED, DEMO_SESSIONS, isTeacherDemo } from '../_demo'

/** Reports filed, and — more importantly — reports owed. A finished class with
 *  no write-up is the thing this page exists to make uncomfortable. */
export default function TeacherReportsPage() {
  const teacher = useTeacher()
  const [owed,     setOwed]     = useState<ClassSession[]>([])
  const [reports,  setReports]  = useState<LessonReport[]>([])
  const [sessions, setSessions] = useState<Record<string, ClassSession>>({})
  const [loading,  setLoading]  = useState(true)

  const [demo, setDemo] = useState(false)

  const load = useCallback(async () => {
    if (isTeacherDemo()) {
      setDemo(true); setOwed(DEMO_REPORTS_OWED); setReports(DEMO_REPORTS)
      setSessions(Object.fromEntries(DEMO_SESSIONS.map(s => [s.id, s])))
      setLoading(false); return
    }
    const [o, r, all] = await Promise.all([
      fetchReportsOwed(teacher.id), fetchReports(teacher.id), fetchSessions(teacher.id),
    ])
    setOwed(o); setReports(r)
    setSessions(Object.fromEntries(all.map(s => [s.id, s])))
    setLoading(false)
  }, [teacher.id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="py-32 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
  }

  return (
    <div className="space-y-5">
      {demo && <DemoBanner />}

      <PageHero
        icon={ClipboardList} tone="rose" title="تقارير الدروس"
        subtitle="سجل ما أُنجز في كل حصة — لك وللإدارة"
        stats={[
          { label: 'تقرير مرسل',   value: reports.length },
          { label: 'في الانتظار',  value: owed.length },
          { label: 'يحتاج متابعة', value: reports.reduce((a, r) => a + (r.student_notes ?? []).filter(n => n.needs_help).length, 0) },
          { label: 'مع واجب',      value: reports.filter(r => !!r.homework).length },
        ]}
      />

      {owed.length > 0 && (
        <div>
          <SectionTitle>
            <span className="text-red-700">بانتظار تقرير</span>
          </SectionTitle>
          <Card className="divide-y divide-red-100 border-red-200">
            {owed.map(s => (
              <Link key={s.id} href={`/teacher/classes/${s.id}`} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-red-50/60 transition">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[14.5px] truncate">{s.title}</div>
                  <div className="text-[11.5px] text-stone-400 font-semibold">{fmtDateTime(s.starts_at)}</div>
                </div>
                <span className="text-[12.5px] font-bold text-red-600 shrink-0">اكتب التقرير</span>
                <ChevronLeft size={17} className="text-red-300 shrink-0" />
              </Link>
            ))}
          </Card>
        </div>
      )}

      <div>
        <SectionTitle>التقارير المرسلة</SectionTitle>
        {reports.length === 0 ? (
          <Card>
            <Empty
              icon={ClipboardList}
              title="لا تقارير بعد"
              hint="بعد كل حصة، افتحها واكتب ما تم إنجازه — يبقى سجلاً للإدارة ولك."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map(r => {
              const s = sessions[r.session_id]
              const flagged = (r.student_notes ?? []).filter(n => n.needs_help).length
              return (
                <Link key={r.id} href={`/teacher/classes/${r.session_id}`}>
                  <Card className="p-5 hover:border-amber-300 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="font-black text-[15px] truncate">{s?.title ?? 'حصة'}</div>
                        <div className="text-[11.5px] text-stone-400 font-semibold">
                          {s ? fmtDateTime(s.starts_at) : new Date(r.submitted_at).toLocaleDateString('ar-MA')}
                        </div>
                      </div>
                      {flagged > 0 && (
                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                          {flagged} يحتاج متابعة
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] text-stone-600 leading-relaxed line-clamp-2">{r.covered}</p>
                    {r.homework && (
                      <p className="text-[12.5px] text-stone-400 font-semibold mt-2 truncate">
                        الواجب: {r.homework}
                      </p>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
