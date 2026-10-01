'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertOctagon, AlertTriangle, ArrowRight, Info, Loader2, ShieldCheck } from 'lucide-react'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { fetchCurriculumAudit, type AuditIssue, type CurriculumAudit } from '@/lib/student-portal'

const KIND_AR: Record<string, string> = {
  lesson_missing_exercise:       'درس بلا تمرين',
  has_quiz_mismatch:             'علامة «اختبار» لا تطابق الأسئلة',
  quiz_not_gating:               'اختبار لا يمنع إكمال الدرس',
  quiz_bad_answer:               'إجابة صحيحة خارج الاختيارات',
  unit_without_lessons:          'وحدة بلا دروس',
  unit_without_exam:             'وحدة بلا اختبار نهائي',
  duplicate_lesson_order:        'ترتيب دروس مكرّر',
  task_outside_enrollment:       'مهمة مرتبطة بدورة غير مسجَّل بها',
  task_unknown_course_label:     'مهمة بدورة نصية غير معروفة',
  session_unknown_course:        'حصة تشير لدورة محذوفة',
  material_unknown_course:       'ملف يشير لدورة محذوفة',
  session_class_course_mismatch: 'حصة ودورة القسم مختلفتان',
  vocab_module_course_mismatch:  'كلمة مرتبطة بوحدة من دورة أخرى',
}

const SEV = {
  error:   { label: 'خطأ',    icon: AlertOctagon,  cls: 'bg-red-50 text-red-700 border-red-200' },
  warning: { label: 'تنبيه',  icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  info:    { label: 'معلومة', icon: Info,          cls: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
} as const

/**
 * Curriculum exercise audit: lessons with nothing to practise, orphan tasks and
 * references, course/unit mismatches, and gates that silently do not apply.
 * Read-only — fix the content in «الدورات».
 */
export default function CurriculumAuditPage() {
  const base = useCrmBasePath()
  const [audit, setAudit] = useState<CurriculumAudit | null>(null)
  const [loading, setLoading] = useState(true)
  const [sev, setSev] = useState<'' | 'error' | 'warning' | 'info'>('')
  const [kind, setKind] = useState('')

  useEffect(() => { fetchCurriculumAudit().then(a => { setAudit(a); setLoading(false) }) }, [])

  const issues = useMemo(() => (audit?.issues ?? []).filter(i => (!sev || i.severity === sev) && (!kind || i.kind === kind)), [audit, sev, kind])
  const kinds = useMemo(() => [...new Set((audit?.issues ?? []).map(i => i.kind))], [audit])

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4" dir="rtl">
      <Link href={`${base}/courses`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 hover:text-zinc-800">
        <ArrowRight size={15} /> الدورات
      </Link>
      <div>
        <h2 className="text-[17px] font-black text-zinc-900">تدقيق التمارين</h2>
        <p className="text-[12px] text-zinc-400">تمارين المنهج مرتبطة بالدرس والوحدة والدورة مباشرة. هذا التقرير يكشف ما ينقص أو لا يتطابق.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
      ) : !audit ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-bold text-red-700">تعذّر تحميل التقرير.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Count label="أخطاء" n={audit.summary.error} tone="text-red-600" onClick={() => setSev(s => s === 'error' ? '' : 'error')} active={sev === 'error'} />
            <Count label="تنبيهات" n={audit.summary.warning} tone="text-amber-600" onClick={() => setSev(s => s === 'warning' ? '' : 'warning')} active={sev === 'warning'} />
            <Count label="معلومات" n={audit.summary.info} tone="text-zinc-600" onClick={() => setSev(s => s === 'info' ? '' : 'info')} active={sev === 'info'} />
            <div className="bg-white border border-zinc-200 rounded-2xl p-3.5">
              <div className="text-[11.5px] text-zinc-400">دروس بها تمرين</div>
              <div className="text-[22px] font-black tabular-nums">{audit.summary.lessons_with_exercise}/{audit.summary.lessons}</div>
            </div>
          </div>

          <select value={kind} onChange={e => setKind(e.target.value)} className="border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white">
            <option value="">كل الأنواع</option>
            {kinds.map(k => <option key={k} value={k}>{KIND_AR[k] ?? k}</option>)}
          </select>

          {issues.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl py-12 text-center">
              <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-500" />
              <div className="text-[14px] font-bold text-zinc-700">لا مشاكل في هذا التصنيف</div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100">
              {issues.map((i, n) => <IssueRow key={n} i={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function IssueRow({ i }: { i: AuditIssue }) {
  const s = SEV[i.severity]
  const where = [
    i.course_title,
    i.module_title && `الوحدة ${i.module_order ?? ''} · ${i.module_title}`,
    i.lesson_title && `الدرس ${i.lesson_order ?? ''} · ${i.lesson_title}`,
  ].filter(Boolean).join(' › ')
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold shrink-0 ${s.cls}`}>
        <s.icon size={12} /> {s.label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-zinc-800">{KIND_AR[i.kind] ?? i.kind}</div>
        {where && <div className="text-[12px] text-zinc-500 truncate">{where}</div>}
        <div className="text-[11.5px] text-zinc-400" dir="auto">{i.detail}</div>
      </div>
    </div>
  )
}

function Count({ label, n, tone, onClick, active }: { label: string; n: number; tone: string; onClick: () => void; active: boolean }) {
  return (
    <button onClick={onClick} className={`text-right bg-white border rounded-2xl p-3.5 ${active ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'}`}>
      <div className="text-[11.5px] text-zinc-400">{label}</div>
      <div className={`text-[22px] font-black tabular-nums ${tone}`}>{n}</div>
    </button>
  )
}
