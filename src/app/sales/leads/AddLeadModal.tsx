'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createManualLead, LEAD_STATUSES, LEAD_STATUS_META, patchLead, type LeadStatus } from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, PLAN_PRESETS } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { logLeadEvent } from '@/lib/crm-db'
import { useStaff } from '@/lib/staff-context'

const ACTIVE_STATUSES = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'delayed'] as LeadStatus[]

interface Props { onClose: () => void; onCreated: () => void }

export default function AddLeadModal({ onClose, onCreated }: Props) {
  const staff = useStaff()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [city, setCity]         = useState('')
  const [source, setSource]     = useState('instagram')
  const [course, setCourse]     = useState('a1a2')
  const [planId, setPlanId]     = useState<string>(PLAN_PRESETS[1].id)
  const [amount, setAmount]     = useState<number>(PLAN_PRESETS[1].amount)
  const [status, setStatus]     = useState<LeadStatus>('contacted')
  const [notes, setNotes]       = useState('')
  const [isVip, setIsVip]       = useState(false)

  useEffect(() => {
    const p = PLAN_PRESETS.find(p => p.id === planId)
    if (p) setAmount(p.amount)
  }, [planId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) { setError('Full name is required'); return }
    setSaving(true)
    try {
      const id = await createManualLead({
        fullName: fullName.trim(), phone: phone.trim() || undefined, city: city.trim() || undefined,
        source, planId, amountMad: amount, status, notes: notes.trim() || undefined,
        isVip, assignedToId: staff.id,
      })
      await patchLead(id, { course, lead_type: 'course', lead_source: source } as any)
      await logLeadEvent({ leadId: id, eventType: 'created', title: `Created by ${staff.email}` })
      await logActivity({ action: 'lead_created', entityType: 'lead', entityId: id,
        after: { status, source, amount_mad: amount }, metadata: { by: staff.email } })
      onCreated(); onClose()
    } catch (err: any) { setError(err?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create new lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manual entry for social/WhatsApp/walk-in prospects</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-gray-100">

            {/* LEFT — Contact info */}
            <div className="p-6 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contact</p>

              <Field label="Full name" required>
                <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Yasmine El Amrani"
                  className={inp} />
              </Field>

              <Field label="Phone">
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6XX XXX XXX" inputMode="tel"
                  className={inp} />
              </Field>

              <Field label="City">
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Casablanca, Rabat…"
                  className={inp} />
              </Field>

              <Field label="Source">
                <div className="grid grid-cols-3 gap-1.5">
                  {LEAD_SOURCES.filter(s => s.id !== 'manual').slice(0, 6).map(s => (
                    <button key={s.id} type="button" onClick={() => setSource(s.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        source === s.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      <span>{s.emoji}</span>{s.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Notes">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="What they said, objections, timing…"
                  className={`${inp} resize-none`} />
              </Field>
            </div>

            {/* RIGHT — Lead details */}
            <div className="p-6 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Lead details</p>

              <Field label="Course">
                <div className="grid grid-cols-2 gap-1.5">
                  {LEAD_COURSES.map(c => (
                    <button key={c.id} type="button" onClick={() => setCourse(c.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                        course === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Plan">
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {PLAN_PRESETS.map(p => (
                    <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                        planId === p.id ? 'bg-yellow-50 text-yellow-900 border-yellow-400' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      <span className="block font-bold">{p.label}</span>
                      <span className="text-gray-500">{p.amount} MAD</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Custom amount</span>
                  <input type="number" value={amount} min={0}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 tabular-nums focus:outline-none focus:border-gray-400" />
                  <span className="text-xs font-bold text-gray-500">MAD</span>
                </div>
              </Field>

              <Field label="Initial status">
                <div className="grid grid-cols-3 gap-1.5">
                  {ACTIVE_STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        status === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {LEAD_STATUS_META[s].short}
                    </button>
                  ))}
                </div>
              </Field>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div onClick={() => setIsVip(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center ${isVip ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${isVip ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Mark as VIP</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-red-600 font-medium">{error}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving || !fullName.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-40">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Create lead →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white transition-colors'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
