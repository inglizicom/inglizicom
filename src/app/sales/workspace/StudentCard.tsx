'use client'

import { MessageCircle, Phone, AlertCircle, CheckCircle2, Circle, GraduationCap, RotateCcw } from 'lucide-react'
import { type CrmStudent } from '@/lib/crm-types'
import { whatsappLink } from '@/lib/leads-db'
import { getCourseMeta } from '@/lib/crm-types'

const STUDENT_TYPE_AR: Record<string, string> = {
  course_student:  'دورة',
  private_student: 'خاص',
}

const PAYMENT_STATUS_AR: Record<string, { text: string; color: string }> = {
  paid:    { text: 'مدفوع', color: 'bg-green-50 text-green-700 border-green-200' },
  pending: { text: 'معلق',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  overdue: { text: 'متأخر', color: 'bg-red-50 text-red-700 border-red-200' },
}

function fmtDate(s?: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isPaymentDueSoon(student: CrmStudent): boolean {
  if (student.student_type !== 'private_student' || !student.next_payment_date) return false
  const diff = (new Date(student.next_payment_date).getTime() - Date.now()) / 86400000
  return diff <= 14 && diff >= 0
}

interface Props {
  student:   CrmStudent
  selected?: boolean
  onSelect?: (id: string) => void
  onClick?:  (student: CrmStudent) => void
}

export default function StudentCard({ student, selected, onSelect, onClick }: Props) {
  const course     = getCourseMeta(student.course)
  const payStatus  = PAYMENT_STATUS_AR[student.payment_status] ?? PAYMENT_STATUS_AR.pending
  const dueSoon    = isPaymentDueSoon(student)
  const phone      = student.phone_number ?? ''

  return (
    <div
      className={[
        'group relative bg-white rounded-xl border transition-all cursor-pointer',
        'hover:shadow-md hover:border-zinc-300',
        selected      ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-zinc-200',
        !student.is_active ? 'opacity-60' : '',
      ].join(' ')}
      onClick={() => onClick?.(student)}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <button
          className="absolute top-3 right-3 z-10"
          onClick={e => { e.stopPropagation(); onSelect(student.id) }}
        >
          {selected
            ? <CheckCircle2 size={18} className="text-yellow-500 fill-yellow-400" />
            : <Circle size={18} className="text-zinc-300 group-hover:text-zinc-400" />
          }
        </button>
      )}

      <div className="p-4">
        {/* Name + type + status */}
        <div className="flex items-start gap-2 mb-2 pr-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <GraduationCap size={13} className="text-zinc-400 flex-shrink-0" />
              <span className="font-bold text-[15px] text-zinc-900 truncate">{student.full_name}</span>
            </div>
            <div className="text-[12px] text-zinc-400 mt-0.5">
              {STUDENT_TYPE_AR[student.student_type]} • التسجيل: {fmtDate(student.enrollment_date)}
            </div>
          </div>
          <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${payStatus.color}`}>
            {payStatus.text}
          </span>
        </div>

        {/* Course + amount badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {student.course && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {course.short}
            </span>
          )}
          {(student.total_paid_mad ?? 0) > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {student.total_paid_mad?.toLocaleString('ar-MA')} درهم
            </span>
          )}
          {student.student_type === 'private_student' && student.monthly_fee_mad && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {student.monthly_fee_mad?.toLocaleString('ar-MA')} / شهر
            </span>
          )}
          {!student.is_active && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
              غير نشط
            </span>
          )}
        </div>

        {/* Payment due warning */}
        {dueSoon && (
          <div className="flex items-center gap-1.5 text-[12px] text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5 mb-3">
            <AlertCircle size={13} />
            <span>الدفع القادم: {fmtDate(student.next_payment_date)}</span>
          </div>
        )}

        {/* Phone + WhatsApp */}
        <div className="flex items-center gap-2">
          {phone && (
            <>
              <a
                href={`tel:${phone}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-700"
              >
                <Phone size={12} />
                <span dir="ltr">{phone}</span>
              </a>
              <a
                href={whatsappLink(phone, `مرحبًا ${student.full_name}،`) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[12px] font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2 py-0.5 rounded-full"
              >
                <MessageCircle size={11} /> واتساب
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
