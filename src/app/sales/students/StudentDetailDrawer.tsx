'use client'

import { useState } from 'react'
import {
  X, Save, Loader2, MessageCircle, Phone, Trash2,
  Plus, GraduationCap, Crown, CreditCard,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { whatsappLink } from '@/lib/leads-db'
import { patchStudent, type CrmStudent } from '@/lib/crm-db'
import { LEAD_COURSES, PLAN_PRESETS, getCourseMeta } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

type View = 'info' | 'payment'

export default function StudentDetailDrawer({
  student, onClose, onChange,
}: { student: CrmStudent; onClose: () => void; onChange: () => void }) {
  const staff = useStaff()
  const [view, setView]     = useState<View>('info')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Edit student info
  const [fullName, setFullName]   = useState(student.full_name)
  const [phone, setPhone]         = useState(student.phone_number ?? '')
  const [course, setCourse]       = useState(student.course ?? '')
  const [type, setType]           = useState(student.student_type)
  const [payStatus, setPayStatus] = useState(student.payment_status)
  const [monthlyFee, setMonthlyFee] = useState<number>(student.monthly_fee_mad ?? 0)
  const [nextPay, setNextPay]     = useState(student.next_payment_date ?? '')
  const [notes, setNotes]         = useState(student.notes ?? '')
  const [isActive, setIsActive]   = useState(student.is_active)

  // Add payment
  const [payAmount, setPayAmount]   = useState<number>(student.monthly_fee_mad ?? 0)
  const [payDate, setPayDate]       = useState(today())
  const [payNext, setPayNext]       = useState('')
  const [payPlan, setPayPlan]       = useState('')
  const [isUpgrade, setIsUpgrade]   = useState(false)
  const [payNotes, setPayNotes]     = useState('')
  const [addingPay, setAddingPay]   = useState(false)

  const wa = student.phone_number ? whatsappLink(student.phone_number, `مرحبا ${student.full_name}`) : null
  const courseMeta = getCourseMeta(student.course)

  async function saveInfo() {
    setSaving(true); setError('')
    try {
      await patchStudent(student.id, {
        full_name:         fullName.trim() || student.full_name,
        phone_number:      phone.trim() || null,
        course:            course || null,
        student_type:      type,
        payment_status:    payStatus as any,
        monthly_fee_mad:   type === 'private_student' ? (monthlyFee || null) : null,
        next_payment_date: type === 'private_student' ? (nextPay || null) : null,
        notes:             notes.trim() || null,
        is_active:         isActive,
      })
      await logActivity({ action: 'student_updated', entityType: 'profile', entityId: student.id,
        metadata: { by: staff.email } })
      onChange(); onClose()
    } catch (err: any) { setError(err?.message ?? 'Could not save') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${student.full_name} as a student? This marks them inactive but keeps the record.`)) return
    setSaving(true)
    try {
      await patchStudent(student.id, { is_active: false })
      await logActivity({ action: 'student_deactivated', entityType: 'profile', entityId: student.id,
        metadata: { by: staff.email } })
      onChange(); onClose()
    } catch { setSaving(false) }
  }

  async function addPayment() {
    if (!payAmount || payAmount <= 0) { setError('Enter a valid amount'); return }
    setAddingPay(true); setError('')
    try {
      // Insert payment record
      await supabase.from('crm_payments').insert({
        student_id:        student.id,
        payment_type:      type === 'private_student' ? 'private_monthly' : 'course_one_time',
        course_or_service: isUpgrade ? (PLAN_PRESETS.find(p => p.id === payPlan)?.label ?? payPlan) : courseMeta.label,
        amount_mad:        payAmount,
        payment_status:    'paid',
        payment_date:      payDate,
        next_payment_date: payNext || null,
        is_upgrade:        isUpgrade,
        prev_plan:         isUpgrade ? student.course : null,
        description:       payNotes.trim() || null,
        added_by_id:       staff.id,
        approved_by_id:    staff.id,
        approved_at:       new Date().toISOString(),
        notes:             payNotes.trim() || null,
      })

      // Update student totals
      const newTotal = (student.total_paid_mad ?? 0) + payAmount
      const updates: any = { total_paid_mad: newTotal, payment_status: 'paid' }
      if (isUpgrade && payPlan) updates.course = payPlan
      if (payNext) updates.next_payment_date = payNext
      await patchStudent(student.id, updates)

      // Log in crm_student_events
      await supabase.from('crm_student_events').insert({
        student_id:  student.id,
        actor_id:    staff.id,
        actor_email: staff.email,
        event_type:  isUpgrade ? 'plan_changed' : 'payment_added',
        title:       isUpgrade
          ? `Plan upgraded → ${PLAN_PRESETS.find(p => p.id === payPlan)?.label ?? payPlan} (+${payAmount} MAD)`
          : `Payment received: ${payAmount} MAD`,
        body:        payNotes || null,
        before_val:  { total_paid: student.total_paid_mad, course: student.course },
        after_val:   { total_paid: newTotal, course: isUpgrade ? payPlan : student.course },
      })

      await logActivity({ action: isUpgrade ? 'student_plan_changed' : 'payment_added',
        entityType: 'profile', entityId: student.id,
        after: { amount: payAmount, new_total: newTotal }, metadata: { by: staff.email } })

      onChange(); onClose()
    } catch (err: any) { setError(err?.message ?? 'Failed'); setAddingPay(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] bg-white border-l border-gray-100 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <GraduationCap size={16} className="text-yellow-500" />
              <h2 className="font-bold text-gray-900 text-lg truncate">{student.full_name}</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {student.student_type === 'private_student' ? 'Private student' : 'Course student'} · {courseMeta.short}
              {student.total_paid_mad ? ` · ${student.total_paid_mad} MAD` : ''}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
          {wa && (
            <a href={wa} target="_blank" rel="noopener"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">
              <MessageCircle size={12} /> WhatsApp
            </a>
          )}
          {student.phone_number && (
            <a href={`tel:${student.phone_number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors">
              <Phone size={12} /> Call
            </a>
          )}
          <button onClick={() => setView('payment')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors ml-auto">
            <Plus size={12} /> Add payment
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['info', 'payment'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors border-b-2 ${
                view === v ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {v === 'info' ? 'Edit info' : 'Add payment / upgrade plan'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {view === 'info' && (
            <>
              <EF label="Full name">
                <input value={fullName} onChange={e => setFullName(e.target.value)} className={inp} />
              </EF>
              <EF label="Phone">
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212…" className={inp} />
              </EF>
              <EF label="Course">
                <div className="grid grid-cols-3 gap-1.5">
                  {LEAD_COURSES.map(c => (
                    <button key={c.id} type="button" onClick={() => setCourse(c.id)}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        course === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {c.short}
                    </button>
                  ))}
                </div>
              </EF>
              <EF label="Type">
                <div className="grid grid-cols-2 gap-2">
                  {[['course_student','Course (one-time)'],['private_student','Private (monthly)']] .map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setType(v as any)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        type === v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </EF>
              <EF label="Payment status">
                <select value={payStatus} onChange={e => setPayStatus(e.target.value as any)} className={inp}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </EF>
              {type === 'private_student' && (
                <>
                  <EF label="Monthly fee (MAD)">
                    <input type="number" value={monthlyFee} onChange={e => setMonthlyFee(Number(e.target.value))} className={inp} />
                  </EF>
                  <EF label="Next payment date">
                    <input type="date" value={nextPay} onChange={e => setNextPay(e.target.value)} className={inp} />
                  </EF>
                </>
              )}
              <EF label="Notes">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Level, schedule, goals…" className={`${inp} resize-none`} />
              </EF>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div onClick={() => setIsActive(a => !a)}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${isActive ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Active student</span>
              </label>
            </>
          )}

          {view === 'payment' && (
            <>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
                Total paid so far: <b>{(student.total_paid_mad ?? 0).toLocaleString()} MAD</b>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <div onClick={() => setIsUpgrade(u => !u)}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center ${isUpgrade ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${isUpgrade ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">This is a plan upgrade</span>
              </label>

              {isUpgrade && (
                <EF label="New plan">
                  <div className="grid grid-cols-2 gap-1.5">
                    {PLAN_PRESETS.map(p => (
                      <button key={p.id} type="button" onClick={() => { setPayPlan(p.id); setPayAmount(p.amount) }}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                          payPlan === p.id ? 'bg-yellow-50 text-yellow-900 border-yellow-400' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}>
                        <span className="block font-bold">{p.label}</span>
                        <span className="text-gray-500">{p.amount} MAD</span>
                      </button>
                    ))}
                  </div>
                </EF>
              )}

              <EF label={isUpgrade ? 'Additional amount paid (MAD)' : 'Amount paid (MAD)'}>
                <input type="number" value={payAmount} min={0}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className={`${inp} font-bold text-gray-900 tabular-nums`} />
              </EF>

              <div className="grid grid-cols-2 gap-3">
                <EF label="Payment date">
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className={inp} />
                </EF>
                {student.student_type === 'private_student' && (
                  <EF label="Next payment date">
                    <input type="date" value={payNext} onChange={e => setPayNext(e.target.value)} className={inp} />
                  </EF>
                )}
              </div>

              <EF label="Notes (optional)">
                <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid via CashPlus" className={inp} />
              </EF>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500">
                New total after this payment: <b className="text-gray-900">
                  {((student.total_paid_mad ?? 0) + payAmount).toLocaleString()} MAD
                </b>
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/80">
          {view === 'info' ? (
            <button onClick={handleDelete} disabled={saving}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
              <Trash2 size={12} /> Remove student
            </button>
          ) : <div />}

          {view === 'info' && (
            <button onClick={saveInfo} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save changes
            </button>
          )}
          {view === 'payment' && (
            <button onClick={addPayment} disabled={addingPay || payAmount <= 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-yellow-400 text-sm font-bold hover:bg-black transition-colors disabled:opacity-50">
              {addingPay ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {isUpgrade ? 'Upgrade plan' : 'Record payment'}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

const inp = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white'
function today() { return new Date().toISOString().slice(0, 10) }
function EF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>{children}</div>
}
