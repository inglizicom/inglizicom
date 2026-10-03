'use client'

/* OverviewTab — CRM student profile: the "overview" tab, split out of page.tsx.
   Enrollments (courses, live classes, teachers), the student-space controls and the summary.
   The page owns all state and data; this file only draws the tab from
   the values it is handed (props generated from what the JSX uses). */

import { Loader2, Activity, Save, BadgeCheck } from 'lucide-react'

import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import { fetchAssignments, type StudentAssignment } from '@/lib/student-portal'
import EnrollmentsPanel from '../EnrollmentsPanel'
import { MAD, fmtDate, PAY_STATUS_AR, Panel, Line } from '../_parts'

import type { Dispatch, SetStateAction } from 'react'

export interface OverviewTabProps {
  id: string
  paid: CrmPayment[]
  pcBusy: boolean
  pcLesT: string
  pcLesU: string
  pcLevel: string
  pcMsg: string
  pcNext: string
  pcStage: string
  pcTask: string
  pending: CrmPayment[]
  savePortalControl: () => Promise<void>
  setAssignments: Dispatch<SetStateAction<StudentAssignment[]>>
  setPcLesT: Dispatch<SetStateAction<string>>
  setPcLesU: Dispatch<SetStateAction<string>>
  setPcLevel: Dispatch<SetStateAction<string>>
  setPcMsg: Dispatch<SetStateAction<string>>
  setPcNext: Dispatch<SetStateAction<string>>
  setPcStage: Dispatch<SetStateAction<string>>
  setPcTask: Dispatch<SetStateAction<string>>
  student: CrmStudent
}

export default function OverviewTab({ id, paid, pcBusy, pcLesT, pcLesU, pcLevel, pcMsg, pcNext, pcStage, pcTask, pending, savePortalControl, setAssignments, setPcLesT, setPcLesU, setPcLevel, setPcMsg, setPcNext, setPcStage, setPcTask, student }: OverviewTabProps) {
  return (
    <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course enrollment · online-class seats · teacher assignment — kept separate */}
            <EnrollmentsPanel studentId={student.id} studentName={student.full_name}
              onChanged={async () => setAssignments(await fetchAssignments(id))} />

            {/* Portal control — what the student sees */}
            <div className="md:col-span-2 border border-yellow-200 bg-yellow-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><span className="text-[13px] font-black text-zinc-800">🎛️ التحكم في فضاء الطالب</span><span className="text-[11px] text-zinc-400">يظهر مباشرة على student.inglizi.com</span></div>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500">رسالة للطالب</label>
                  <input value={pcMsg} onChange={e => setPcMsg(e.target.value)} placeholder="مثال: أحسنت! ركّز هذا الأسبوع على المحادثة" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div><label className="text-[11px] font-semibold text-zinc-500">عنوان درس اليوم</label><input value={pcLesT} onChange={e => setPcLesT(e.target.value)} placeholder="درس اليوم" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" /></div>
                  <div><label className="text-[11px] font-semibold text-zinc-500">رابط درس اليوم</label><input value={pcLesU} onChange={e => setPcLesU(e.target.value)} placeholder="https://inglizi.com/..." dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                </div>
                <div><label className="text-[11px] font-semibold text-zinc-500">الخطوة القادمة</label><input value={pcTask} onChange={e => setPcTask(e.target.value)} placeholder="ما الذي على الطالب فعله بعد ذلك" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div><label className="text-[11px] font-semibold text-zinc-500">المرحلة</label><input value={pcStage} onChange={e => setPcStage(e.target.value)} placeholder="Foundation" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                  <div><label className="text-[11px] font-semibold text-zinc-500">المستوى الحالي</label><input value={pcLevel} onChange={e => setPcLevel(e.target.value)} placeholder="A1" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                  <div><label className="text-[11px] font-semibold text-zinc-500">المستوى القادم</label><input value={pcNext} onChange={e => setPcNext(e.target.value)} placeholder="A2" dir="ltr" className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white text-right" /></div>
                </div>
                <button onClick={savePortalControl} disabled={pcBusy} className="w-full py-2 bg-black text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">
                  {pcBusy ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ وتحديث فضاء الطالب</>}
                </button>
              </div>
            </div>

            {/* Learning progress (placeholder until activity tracking lands) */}
            <Panel title="تقدم التعلّم">
              <div className="flex items-center gap-4 py-1">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f1f1" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="0 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-zinc-300">—</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {['الدروس', 'الاستماع', 'الامتحانات', 'الخريطة'].map(x => (
                    <div key={x} className="flex items-center justify-between text-[12px]">
                      <span className="text-zinc-500">{x}</span>
                      <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-1.5 rounded-full">قريباً</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel title="آخر امتحان">
              <div className="flex flex-col items-center justify-center py-3 text-center text-zinc-400">
                <BadgeCheck size={22} className="mb-2 text-zinc-300" />
                <p className="text-[12px]">نتائج الامتحانات ستظهر هنا<br />بعد ربط حساب الطالب</p>
              </div>
            </Panel>
            <Panel title="الدورة الحالية">
              <Line label="المستوى" value={student.course?.toUpperCase() ?? '—'} />
              <Line label="النوع" value={student.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'} />
              <Line label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
              <Line label="الحالة" value={student.is_active ? 'نشط' : 'غير نشط'} />
            </Panel>
            <Panel title="الفواتير والمدفوعات الأخيرة">
              {paid.length === 0 && pending.length === 0
                ? <p className="text-[13px] text-zinc-400 py-3">لا توجد مدفوعات</p>
                : [...pending, ...paid].slice(0, 4).map(p => {
                    const info = PAY_STATUS_AR[p.payment_status]
                    return (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-none">
                        <div className="text-[13px]">
                          <div className="font-semibold text-zinc-800">{MAD(Number(p.amount_mad))} د.م</div>
                          <div className="text-[11px] text-zinc-400">{fmtDate(p.payment_date)}</div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
                      </div>
                    )
                  })}
            </Panel>
            <Panel title="ملاحظات">
              <p className="text-[13px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {student.notes || <span className="text-zinc-300 italic">لا توجد ملاحظات</span>}
              </p>
            </Panel>
            <Panel title="النشاط داخل المنصة">
              <div className="flex flex-col items-center justify-center py-4 text-center text-zinc-400">
                <Activity size={22} className="mb-2 text-zinc-300" />
                <p className="text-[12px]">تتبّع نشاط التعلّم سيظهر هنا<br />(دروس، امتحانات، وقت التعلّم)</p>
              </div>
            </Panel>
          </div>
    </>
  )
}
