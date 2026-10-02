'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, Presentation } from 'lucide-react'
import { fetchMyClasses, type MyClass } from '@/lib/teachers'
import { Card, DemoBanner, Empty, PageHero, Pill, fmtDateTime } from '../_ui'
import { DEMO_CLASSES, isTeacherDemo } from '../_demo'

const STATUS: Record<MyClass['status'], string> = { active: 'جارٍ', completed: 'مكتمل', cancelled: 'ملغى' }

/** أقسامي — the online classes I teach. Staffing (who is enrolled, who teaches)
 *  is decided in the CRM; here the teacher sees the roster and runs the class. */
export default function TeacherGroupsPage() {
  const [classes, setClasses] = useState<MyClass[]>([])
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    if (isTeacherDemo()) { setDemo(true); setClasses(DEMO_CLASSES); setLoading(false); return }
    fetchMyClasses().then(c => { setClasses(c); setLoading(false) })
  }, [])

  const current = classes.filter(c => c.status === 'active' && !c.archived)
  const past = classes.filter(c => !(c.status === 'active' && !c.archived))

  return (
    <div className="space-y-4">
      {demo && <DemoBanner />}
      <PageHero
        icon={Presentation} tone="violet" title="أقسامي"
        subtitle="الأقسام المسندة إليك من الإدارة — الطلاب المسجّلون، الحصص، والتقارير"
        stats={[
          { label: 'أقسام جارية',  value: current.length },
          { label: 'طلاب مسجّلون', value: current.reduce((a, c) => a + c.active_count, 0) },
          { label: 'تقارير ناقصة', value: classes.reduce((a, c) => a + c.reports_owed, 0) },
        ]}
      />

      {loading ? (
        <div className="py-24 flex justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
      ) : classes.length === 0 ? (
        <Card><Empty icon={Presentation} title="لا أقسام بعد" hint="تنشئ الإدارة الأقسام وتسندها إليك، وستظهر هنا مباشرة." /></Card>
      ) : (
        <div className="space-y-6">
          {[['الجارية', current], ['السابقة', past]].map(([label, list]) => (list as MyClass[]).length > 0 && (
            <div key={label as string}>
              <div className="text-[13px] font-bold text-[#64748B] mb-2">{label as string}</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {(list as MyClass[]).map(c => (
                  <Link key={c.id} href={`/teacher/groups/${c.id}`}>
                    <Card className="p-4 hover:ring-[#CBD5E1] transition h-full">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-[15.5px] truncate">{c.title}</div>
                          <div className="text-[12px] text-slate-500 font-semibold mt-0.5 truncate">
                            {c.course_title ?? 'بدون دورة مرتبطة'}{c.schedule_note && <> · {c.schedule_note}</>}
                          </div>
                        </div>
                        <ChevronLeft size={18} className="text-slate-300 shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Pill tone={c.mode === 'private' ? 'scheduled' : 'muted'}>{c.mode === 'private' ? 'فردي' : 'جماعي'}</Pill>
                        <Pill tone={c.status === 'active' ? 'live' : c.status === 'cancelled' ? 'cancelled' : 'done'}>{STATUS[c.status]}</Pill>
                        {c.level && <Pill tone="muted">{c.level}</Pill>}
                        {!c.is_owner && <Pill tone="muted">حصص تعويضية</Pill>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <Num label="مسجّلون" value={c.capacity ? `${c.active_count}/${c.capacity}` : String(c.active_count)} />
                        <Num label="حصص منجزة" value={String(c.sessions_done)} />
                        <Num label="تقارير ناقصة" value={String(c.reports_owed)} alert={c.reports_owed > 0} />
                      </div>
                      <div className="text-[11.5px] text-slate-400 font-semibold mt-3">
                        {c.next_session_at ? <>الحصة القادمة: {fmtDateTime(c.next_session_at)}</> : 'لا حصة قادمة'}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Num({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-xl bg-[#F4F7FC] py-2">
      <div className={`text-[16px] font-black tabular-nums ${alert ? 'text-rose-600' : ''}`} dir="ltr">{value}</div>
      <div className="text-[10.5px] text-slate-500 font-semibold">{label}</div>
    </div>
  )
}
