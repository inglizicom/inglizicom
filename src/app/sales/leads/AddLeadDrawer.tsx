'use client'

import { useEffect, useState } from 'react'
import { X, Save, Loader2, User as UserIcon, Phone, MapPin, Crown, FileText } from 'lucide-react'
import { createManualLead, LEAD_STATUSES, LEAD_STATUS_META, type LeadStatus } from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, LEAD_TYPES, PLAN_PRESETS } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { logLeadEvent } from '@/lib/crm-db'
import { useStaff } from '@/lib/staff-context'

export default function AddLeadDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const staff = useStaff()
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [city, setCity]           = useState('')
  const [source, setSource]       = useState('tiktok')
  const [leadCourse, setCourse]   = useState('a1a2')
  const [leadType, setLeadType]   = useState('course')
  const [planId, setPlanId]       = useState<string>(PLAN_PRESETS[1].id)
  const [amount, setAmount]       = useState<number>(PLAN_PRESETS[1].amount)
  const [status, setStatus]       = useState<LeadStatus>('contacted')
  const [notes, setNotes]         = useState('')
  const [isVip, setIsVip]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const preset = PLAN_PRESETS.find(p => p.id === planId)
    if (preset) setAmount(preset.amount)
  }, [planId])

  useEffect(() => { if (planId === 'vip') setIsVip(true) }, [planId])

  async function handleSave() {
    setError(null)
    if (!fullName.trim()) { setError('Full name is required'); return }
    if (amount <= 0)      { setError('Pick a plan — amount must be > 0'); return }
    setSaving(true)
    try {
      const id = await createManualLead({
        fullName: fullName.trim(), phone: phone.trim() || undefined, city: city.trim() || undefined,
        source, planId, amountMad: amount, status, notes: notes.trim() || undefined,
        isVip, assignedToId: staff.id,
      })
      await (createManualLead as any) // suppress unused
      // Patch extra fields (course, lead_type) via leads-db
      const { patchLead } = await import('@/lib/leads-db')
      await patchLead(id, { course: leadCourse, lead_type: leadType, lead_source: source } as any)
      await logLeadEvent({ leadId: id, eventType: 'created', title: `Lead created manually by ${staff.email}` })
      await logActivity({ action: 'lead_created', entityType: 'lead', entityId: id,
        after: { status, source, plan_id: planId, amount_mad: amount },
        metadata: { entered_manually: true, by: staff.email } })
      onCreated(); onClose()
    } catch (err: any) { setError(err?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        <header className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 mb-1">Manual entry</div>
            <h2 className="font-black text-gray-900 text-lg">Add a new lead</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">TikTok, Instagram, DMs, calls, walk-ins.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Who */}
          <Step n={1} label="Who is this">
            <F label="Full name" required icon={<UserIcon size={11} />}>
              <input autoFocus value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Yasmine El Amrani" className={inp} />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Phone" icon={<Phone size={11} />}>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212 6XX XXX XXX" className={inp} inputMode="tel" />
              </F>
              <F label="City" icon={<MapPin size={11} />}>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Casablanca" className={inp} />
              </F>
            </div>
          </Step>

          {/* Source */}
          <Step n={2} label="Where did they come from">
            <div className="grid grid-cols-4 gap-1.5">
              {LEAD_SOURCES.map(s => (
                <button key={s.id} type="button" onClick={() => setSource(s.id)}
                  className={['flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] font-bold transition-colors',
                    source === s.id ? s.color + ' ring-1 ring-offset-1 ring-gray-300' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'].join(' ')}>
                  <span className="text-base">{s.emoji}</span>{s.label}
                </button>
              ))}
            </div>
          </Step>

          {/* Course */}
          <Step n={3} label="Course interested in">
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {LEAD_COURSES.map(c => (
                <button key={c.id} type="button" onClick={() => setCourse(c.id)}
                  className={['rounded-lg border py-2 px-2 text-[11px] font-bold text-center transition-colors',
                    leadCourse === c.id ? 'bg-yellow-50 text-yellow-900 border-yellow-300 ring-1 ring-yellow-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'].join(' ')}>
                  {c.short}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {LEAD_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setLeadType(t.id)}
                  className={['flex-1 py-2 rounded-lg border text-[12px] font-bold',
                    leadType === t.id ? 'bg-black text-yellow-400 border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'].join(' ')}>
                  {t.label}
                </button>
              ))}
            </div>
          </Step>

          {/* Plan */}
          <Step n={4} label="Plan + amount">
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {PLAN_PRESETS.map(p => (
                <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
                  className={['rounded-lg border py-2.5 px-2 text-center transition-colors',
                    planId === p.id ? 'bg-yellow-50 text-yellow-900 border-yellow-300' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'].join(' ')}>
                  <div className="font-bold text-[12px]">{p.label}</div>
                  <div className="text-[10px] text-gray-500">{p.amount} MAD</div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">Amount</span>
              <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value, 10) || 0)} min={0}
                className={`flex-1 ${inp} tabular-nums font-bold text-yellow-700`} />
              <span className="text-[12px] font-bold text-gray-500">MAD</span>
            </div>
          </Step>

          {/* Status */}
          <Step n={5} label="Initial status">
            <div className="grid grid-cols-3 gap-1.5">
              {(['contacted','interested','follow_up','confirmed','paid','delayed'] as LeadStatus[]).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={['rounded-lg border py-2 text-[11.5px] font-bold transition-colors',
                    status === s ? 'bg-black text-yellow-400 border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'].join(' ')}>
                  {LEAD_STATUS_META[s].short}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400" />
              <span className="text-[13px] font-semibold text-gray-800 flex items-center gap-1">
                <Crown size={12} className="text-rose-500" /> Mark as VIP
              </span>
            </label>
          </Step>

          {/* Notes */}
          <Step n={6} label="Notes" icon={<FileText size={12} />}>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="What did they say? Objections, budget, timeline…"
              className={`${inp} resize-y`} />
          </Step>

          {error && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold">{error}</div>}
        </div>

        <footer className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-[11px] text-gray-400">Logged as <span className="text-gray-700">{staff.email}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !fullName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save lead
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

const inp = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

function Step({ n, label, icon, children }: { n: number; label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-black text-yellow-400 flex items-center justify-center text-[10px] font-black">{n}</span>
        <span className="text-[11px] uppercase font-bold tracking-[0.15em] text-gray-700 flex items-center gap-1">{icon}{label}</span>
      </div>
      <div className="space-y-2 pl-7">{children}</div>
    </section>
  )
}

function F({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500 mb-1 flex items-center gap-1">
        {icon}{label}{required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  )
}
