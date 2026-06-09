'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Search, Loader2, CheckCircle2, XCircle, GraduationCap,
  Phone, CalendarDays, Wallet, ExternalLink,
} from 'lucide-react'
import { fetchStudentByToken, fetchCrmPayments } from '@/lib/crm-db'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import Avatar from '@/app/sales/_components/Avatar'

const MAD = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

export default function VerifyPage() {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [searched,setSearched]= useState(false)
  const [student, setStudent] = useState<CrmStudent | null>(null)
  const [payments,setPayments]= useState<CrmPayment[]>([])

  async function verify(e?: React.FormEvent) {
    e?.preventDefault()
    if (!token.trim()) return
    setLoading(true); setSearched(false)
    const s = await fetchStudentByToken(token)
    setStudent(s)
    setPayments(s ? await fetchCrmPayments({ studentId: s.id }) : [])
    setSearched(true); setLoading(false)
  }

  const paid = payments.filter(p => p.payment_status === 'paid')
  const totalPaid = paid.reduce((sum, p) => sum + Number(p.amount_mad), 0) || (student?.total_paid_mad ?? 0)

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">

      {/* Intro */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[17px] font-black text-zinc-900">التحقق من طالب</h2>
            <p className="text-[12px] text-zinc-400">أدخل رمز التحقق للتأكد من أن الشخص طالب مسجّل لدينا</p>
          </div>
        </div>

        <form onSubmit={verify} className="flex gap-2 mt-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400" />
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="مثال: ING-7K3F9A2C"
              className="w-full pr-9 pl-3 py-2.5 text-[14px] font-bold tracking-widest bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase"
              dir="ltr"
            />
          </div>
          <button type="submit" disabled={loading || !token.trim()}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-[13px] hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} تحقق
          </button>
        </form>
      </div>

      {/* Result */}
      {searched && !student && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle size={36} className="text-red-500 mx-auto mb-2" />
          <h3 className="text-[16px] font-black text-red-700">رمز غير صالح</h3>
          <p className="text-[13px] text-red-600 mt-1">لا يوجد طالب بهذا الرمز. قد يكون محتالاً — تعامل بحذر.</p>
        </div>
      )}

      {searched && student && (
        <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-50 px-5 py-3 flex items-center gap-2 border-b border-emerald-100">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-[14px] font-black text-emerald-700">✓ طالب مسجّل لدى Inglizi.com</span>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={student.full_name} size={52} square />
              <div>
                <div className="text-[17px] font-black text-zinc-900">{student.full_name}</div>
                <div className="text-[12px] text-zinc-400">
                  {student.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'}
                  {student.course && ` · ${student.course.toUpperCase()}`}
                </div>
              </div>
              <span className={`mr-auto text-[11px] font-bold px-2.5 py-1 rounded-full border ${student.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                {student.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Stat icon={CalendarDays} label="تاريخ التسجيل" value={fmtDate(student.enrollment_date)} />
              <Stat icon={Wallet} label="إجمالي المدفوع" value={`${MAD(totalPaid)} د.م`} />
              <Stat icon={GraduationCap} label="عدد المدفوعات" value={String(paid.length)} />
              <Stat icon={Phone} label="الهاتف" value={student.phone_number ?? '—'} ltr />
            </div>

            {/* History */}
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">سجل المدفوعات</div>
            <div className="space-y-2">
              {paid.length === 0 && <p className="text-[13px] text-zinc-400">لا مدفوعات مسجّلة</p>}
              {paid.map(p => (
                <div key={p.id} className="flex items-center justify-between text-[13px] border-b border-zinc-50 pb-2 last:border-none">
                  <span className="text-zinc-600">{fmtDate(p.payment_date)}</span>
                  <span className="font-bold text-emerald-700">{MAD(Number(p.amount_mad))} د.م</span>
                </div>
              ))}
            </div>

            <Link href={`/sales/students/${student.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700">
              فتح الملف الكامل <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, ltr }: { icon: any; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="bg-zinc-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1"><Icon size={13} /> {label}</div>
      <div className="text-[14px] font-bold text-zinc-800" dir={ltr ? 'ltr' : undefined}>{value}</div>
    </div>
  )
}
