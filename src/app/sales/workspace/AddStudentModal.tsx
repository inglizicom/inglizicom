'use client'

import { useState } from 'react'
import { X, Loader2, GraduationCap } from 'lucide-react'
import { createStudent } from '@/lib/crm-db'
import { LEAD_COURSES, LEAD_SOURCES, ENROLLMENT_TYPES, type EnrollmentType } from '@/lib/crm-types'
import { useStaff } from '@/lib/staff-context'

const INP = 'w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400'

export default function AddStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const staff = useStaff()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [course, setCourse]   = useState('a1a2')
  const [source, setSource]   = useState('instagram')
  const [billing, setBilling] = useState<'one_time' | 'monthly'>('one_time')
  const [total, setTotal]     = useState('')
  const [fee, setFee]         = useState('')
  const [notes, setNotes]     = useState('')
  // Phase 3 — enrollment type. Only 'paid' counts toward revenue.
  const [enrollType, setEnrollType] = useState<EnrollmentType>('paid')
  const [couponCode, setCouponCode] = useState('')
  const [rewardSrc, setRewardSrc]   = useState('')
  const [sponsorReason, setSponsorReason] = useState('')
  const [trialEnds, setTrialEnds]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('الاسم مطلوب'); return }
    setSaving(true); setError('')
    const id = await createStudent({
      fullName: name.trim(), phoneNumber: phone.trim() || undefined,
      course, source,
      studentType: billing === 'monthly' ? 'private_student' : 'course_student',
      billingType: billing,
      totalPaidMad: enrollType === 'paid' && total ? Number(total) : 0,
      monthlyFeeMad: billing === 'monthly' && fee ? Number(fee) : undefined,
      nextPaymentDate: billing === 'monthly' ? (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10) })() : undefined,
      notes: notes.trim() || undefined,
      addedById: staff.id,
      enrollmentType: enrollType,
      couponCode: couponCode.trim() || undefined,
      rewardSource: rewardSrc.trim() || undefined,
      sponsorReason: sponsorReason.trim() || undefined,
      trialExpiresAt: trialEnds || undefined,
    })
    setSaving(false)
    if (!id) { setError('تعذّر إضافة الطالب'); return }
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-[17px]"><GraduationCap size={18} className="text-zinc-400" /> إضافة طالب</div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={22} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-[12px] text-zinc-400">للطلاب الذين أتوا من خارج Inglizi.com (انستغرام، فيسبوك، إحالة...) أو تسجيل مباشر.</p>

          <Field label="الاسم الكامل *"><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد محمد" className={INP} /></Field>
          <Field label="الهاتف"><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 ..." dir="ltr" className={`${INP} text-right`} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الدورة">
              <select value={course} onChange={e => setCourse(e.target.value)} className={INP}>
                {LEAD_COURSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="المصدر">
              <select value={source} onChange={e => setSource(e.target.value)} className={INP}>
                {LEAD_SOURCES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="نوع التسجيل">
            <div className="grid grid-cols-3 gap-2">
              {ENROLLMENT_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setEnrollType(t.id)}
                  className={`py-2 rounded-lg border text-[12px] font-semibold ${enrollType === t.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            {enrollType !== 'paid' && <p className="text-[11px] text-zinc-400 mt-1.5">طالب نشِط لا يُحتسب ضمن الإيرادات.</p>}
          </Field>

          {/* coupon / reward extra fields */}
          {enrollType === 'coupon' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="كود الكوبون"><input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="WIN100" dir="ltr" className={`${INP} text-right`} /></Field>
              <Field label="مصدر المكافأة"><input value={rewardSrc} onChange={e => setRewardSrc(e.target.value)} placeholder="فائز التحدي الأسبوعي" className={INP} /></Field>
            </div>
          )}
          {enrollType === 'sponsored' && (
            <Field label="سبب المنحة / الراعي"><input value={sponsorReason} onChange={e => setSponsorReason(e.target.value)} placeholder="منحة دراسية" className={INP} /></Field>
          )}
          {enrollType === 'trial' && (
            <Field label="ينتهي التجريبي في"><input type="date" value={trialEnds} onChange={e => setTrialEnds(e.target.value)} dir="ltr" className={`${INP} text-right`} /></Field>
          )}

          <Field label="نوع الدفع">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setBilling('one_time')} className={`py-2.5 rounded-lg border text-[13px] font-semibold ${billing === 'one_time' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>دفعة واحدة (دورة)</button>
              <button type="button" onClick={() => setBilling('monthly')} className={`py-2.5 rounded-lg border text-[13px] font-semibold ${billing === 'monthly' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'}`}>اشتراك شهري</button>
            </div>
          </Field>

          {enrollType === 'paid' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="المبلغ المدفوع الآن (د.م)"><input type="number" value={total} onChange={e => setTotal(e.target.value)} dir="ltr" className={`${INP} text-right`} /></Field>
              {billing === 'monthly' && <Field label="الرسوم الشهرية (د.م)"><input type="number" value={fee} onChange={e => setFee(e.target.value)} dir="ltr" className={`${INP} text-right`} /></Field>}
            </div>
          )}

          <Field label="ملاحظات"><input value={notes} onChange={e => setNotes(e.target.value)} className={INP} /></Field>
          {error && <p className="text-[13px] text-red-600 font-medium">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold text-[13px]">إلغاء</button>
          <button type="submit" disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : 'إضافة الطالب'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">{label}</label>{children}</div>
}
