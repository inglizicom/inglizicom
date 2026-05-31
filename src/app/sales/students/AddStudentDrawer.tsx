'use client'

import { useState } from 'react'
import {
  X, Save, Loader2, User as UserIcon, Phone, Tag,
  Crown, FileText, Globe, GraduationCap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LEAD_SOURCES, LEAD_COURSES, LEAD_TYPES, PLAN_PRESETS } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

/**
 * Add a student directly — for people who paid on Instagram, TikTok,
 * WhatsApp DM, or walked in without going through the leads funnel.
 */
export default function AddStudentDrawer({
  onClose, onCreated,
}: { onClose: () => void; onCreated: () => void }) {
  const staff = useStaff()

  const [fullName,  setFullName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [source,    setSource]    = useState('instagram')
  const [course,    setCourse]    = useState('a1a2')
  const [type,      setType]      = useState<'course_student' | 'private_student'>('course_student')
  const [plan,      setPlan]      = useState<string>(PLAN_PRESETS[1].id)
  const [amount,    setAmount]    = useState<number>(PLAN_PRESETS[1].amount)
  const [payDate,   setPayDate]   = useState(new Date().toISOString().slice(0, 10))
  const [nextPay,   setNextPay]   = useState('')
  const [notes,     setNotes]     = useState('')
  const [isVip,     setIsVip]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // Auto-fill amount when plan changes
  function selectPlan(id: string) {
    setPlan(id)
    const preset = PLAN_PRESETS.find(p => p.id === id)
    if (preset) setAmount(preset.amount)
    if (id === 'vip') setIsVip(true)
  }

  async function handleSave() {
    setError(null)
    if (!fullName.trim()) { setError('Full name is required'); return }
    if (amount <= 0)      { setError('Amount must be greater than 0'); return }

    setSaving(true)
    try {
      // 1. Create student record
      const { data: student, error: studErr } = await supabase
        .from('crm_students')
        .insert({
          full_name:         fullName.trim(),
          phone_number:      phone.trim() || null,
          course,
          student_type:      type,
          enrollment_date:   payDate || new Date().toISOString().slice(0, 10),
          payment_status:    'paid',
          total_paid_mad:    amount,
          monthly_fee_mad:   type === 'private_student' ? amount : null,
          next_payment_date: type === 'private_student' ? (nextPay || null) : null,
          notes:             notes.trim() || null,
          added_by_id:       staff.id,
        })
        .select('id')
        .single()
      if (studErr) throw new Error(studErr.message)

      const studentId = (student as { id: string }).id

      // 2. Create payment record
      await supabase.from('crm_payments').insert({
        student_id:        studentId,
        payment_type:      type === 'private_student' ? 'private_monthly' : 'course_one_time',
        course_or_service: LEAD_COURSES.find(c => c.id === course)?.label ?? course,
        amount_mad:        amount,
        payment_status:    'paid',
        payment_date:      payDate || new Date().toISOString().slice(0, 10),
        next_payment_date: type === 'private_student' ? (nextPay || null) : null,
        notes:             `Added directly — source: ${source}`,
        added_by_id:       staff.id,
        approved_by_id:    staff.id,
        approved_at:       new Date().toISOString(),
      })

      // 3. Activity log
      await logActivity({
        action:     'student_created_direct',
        entityType: 'profile',
        entityId:   studentId,
        after:      { source, course, amount_mad: amount, student_type: type },
        metadata:   { added_by: staff.email, direct_entry: true },
      })

      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">

        {/* Header */}
        <header className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <GraduationCap size={18} className="text-yellow-500" />
              <h2 className="font-black text-gray-900 text-lg">Add student directly</h2>
            </div>
            <p className="text-sm text-gray-400">For students who paid on Instagram, TikTok, WhatsApp or in person.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-1"><X size={20} /></button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Name + Phone */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Student info</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full name *</label>
              <div className="relative">
                <UserIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Yasmine El Amrani"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone number</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  inputMode="tel" />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Where did they come from?</div>
            <div className="grid grid-cols-4 gap-1.5">
              {LEAD_SOURCES.slice(0, 8).map(s => (
                <button key={s.id} type="button" onClick={() => setSource(s.id)}
                  className={[
                    'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] font-bold transition-colors',
                    source === s.id
                      ? 'bg-black text-yellow-400 border-black'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
                  ].join(' ')}>
                  <span className="text-base leading-none">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course + Type */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Course & type</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course</label>
              <div className="grid grid-cols-3 gap-1.5">
                {LEAD_COURSES.map(c => (
                  <button key={c.id} type="button" onClick={() => setCourse(c.id)}
                    className={[
                      'rounded-lg border py-2 px-2 text-center text-[12px] font-semibold transition-colors',
                      course === c.id
                        ? 'bg-yellow-50 text-yellow-900 border-yellow-300'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}>
                    {c.short}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'course_student',  label: 'One-time course',    sub: 'Pays once' },
                  { id: 'private_student', label: 'Private (monthly)',   sub: 'Recurring each month' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setType(t.id as any)}
                    className={[
                      'rounded-xl border p-3 text-left transition-colors',
                      type === t.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                    ].join(' ')}>
                    <div className="font-bold text-[13px]">{t.label}</div>
                    <div className={`text-[11px] mt-0.5 ${type === t.id ? 'text-gray-300' : 'text-gray-400'}`}>{t.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase font-bold tracking-widest text-gray-400">Payment details</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plan</label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {PLAN_PRESETS.map(p => (
                  <button key={p.id} type="button" onClick={() => selectPlan(p.id)}
                    className={[
                      'rounded-lg border py-2.5 px-2 text-center transition-colors',
                      plan === p.id
                        ? 'bg-yellow-50 text-yellow-900 border-yellow-300 ring-1 ring-yellow-200'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                    ].join(' ')}>
                    <div className="font-bold text-[12px]">{p.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">{p.amount} MAD</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600 w-16 flex-shrink-0">Amount</label>
                <input type="number" value={amount} min={0}
                  onChange={e => setAmount(parseInt(e.target.value, 10) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-yellow-700 tabular-nums focus:outline-none focus:border-gray-900" />
                <span className="text-sm font-bold text-gray-500">MAD</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment date</label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900" />
              </div>
              {type === 'private_student' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Next payment date</label>
                  <input type="date" value={nextPay} onChange={e => setNextPay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900" />
                </div>
              )}
            </div>
          </div>

          {/* Notes + VIP */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400" />
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Crown size={13} className="text-yellow-500" /> VIP student
              </span>
            </label>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Level, schedule preferences, how they found you…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-gray-900" />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-400">Added by <span className="font-semibold text-gray-600">{staff.email}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !fullName.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-40">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <GraduationCap size={14} />}
              Add student
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}
