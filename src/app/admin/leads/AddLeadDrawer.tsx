'use client'

import { useEffect, useState } from 'react'
import {
  X, Save, Loader2, User as UserIcon, Phone, MapPin, Tag,
  Crown, FileText, Globe, CheckCircle2,
} from 'lucide-react'
import {
  createManualLead, LEAD_STATUSES, LEAD_STATUS_META,
  type LeadStatus,
} from '@/lib/leads-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '../StaffContext'

/**
 * Manual lead entry — slide-in drawer used by assistants when a prospect
 * comes in over TikTok / Instagram / WhatsApp DM / a friend referral, i.e.
 * any path that doesn't go through the website's subscribe flow.
 *
 * The form mirrors the four columns the founder cares about:
 *   WHO  — name, phone, city
 *   FROM — source (with one-tap chips for the social channels we use)
 *   WHAT — plan + amount (plan auto-fills the amount; both editable)
 *   WHERE in the funnel — initial status (default 'contacted' because the
 *   assistant has already spoken to them), VIP toggle, note.
 */

/* Plan presets — wired to the pricing-anchor memory. Editing here keeps
 * the manual-entry amounts in lockstep with the public pricing page. */
const PLAN_PRESETS = [
  { id: 'basic',   label: 'Basic',   amount: 750  },
  { id: 'pro',     label: 'Pro',     amount: 1400 },
  { id: 'premium', label: 'Premium', amount: 3000 },
  { id: 'vip',     label: 'VIP',     amount: 5000 },
] as const

const SOURCE_PRESETS = [
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'whatsapp',  label: 'WhatsApp',  emoji: '💬', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'referral',  label: 'Referral',  emoji: '🤝', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'walk-in',   label: 'Walk-in',   emoji: '🚶', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'other',     label: 'Other',     emoji: '🌐', color: 'bg-gray-100 text-gray-700 border-gray-200' },
] as const

export default function AddLeadDrawer({
  onClose, onCreated,
}: {
  onClose:   () => void
  onCreated: () => void
}) {
  const staff = useStaff()
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [city, setCity]           = useState('')
  const [source, setSource]       = useState<string>('tiktok')
  const [customSource, setCustom] = useState('')
  const [planId, setPlanId]       = useState<string>(PLAN_PRESETS[1].id)        // default Pro
  const [amount, setAmount]       = useState<number>(PLAN_PRESETS[1].amount)
  const [status, setStatus]       = useState<LeadStatus>('contacted')
  const [notes, setNotes]         = useState('')
  const [isVip, setIsVip]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Auto-fill amount when plan changes
  useEffect(() => {
    const preset = PLAN_PRESETS.find(p => p.id === planId)
    if (preset) setAmount(preset.amount)
  }, [planId])

  // Mark VIP automatically when the VIP plan is chosen (still editable)
  useEffect(() => {
    if (planId === 'vip') setIsVip(true)
  }, [planId])

  async function handleSave() {
    setError(null)
    if (!fullName.trim()) { setError('Full name is required'); return }
    if (amount <= 0)     { setError('Amount must be greater than 0 — pick a plan'); return }
    const finalSource = source === 'other' && customSource.trim() ? customSource.trim() : source
    setSaving(true)
    try {
      const id = await createManualLead({
        fullName:    fullName.trim(),
        phone:       phone.trim() || undefined,
        city:        city.trim()  || undefined,
        source:      finalSource,
        planId,
        amountMad:   amount,
        status,
        notes:       notes.trim() || undefined,
        isVip,
        assignedToId: staff.id,                  // self-assign on create
      })
      await logActivity({
        action:     'lead_created',
        entityType: 'lead',
        entityId:   id,
        after:      { status, source: finalSource, plan_id: planId, amount_mad: amount, is_vip: isVip },
        metadata:   { entered_manually: true, by: staff.email },
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save the lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        {/* Header */}
        <header className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 mb-1">Manual entry</div>
            <h2 className="font-black text-gray-900 text-lg">Add a new lead</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              For prospects coming from TikTok, Instagram, DMs, calls, or walk-ins.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* WHO */}
          <Section label="Who is this" step={1}>
            <Field label="Full name" required icon={<UserIcon size={11} />}>
              <input
                autoFocus
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Yasmine El Amrani"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" icon={<Phone size={11} />}>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className={inputCls}
                  inputMode="tel"
                />
              </Field>
              <Field label="City" icon={<MapPin size={11} />}>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Casablanca"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* WHERE FROM */}
          <Section label="Where did they come from" step={2} icon={<Globe size={12} />}>
            <div className="grid grid-cols-4 gap-1.5">
              {SOURCE_PRESETS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={[
                    'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] font-bold transition-colors',
                    source === s.id ? s.color + ' ring-1 ring-offset-1 ring-gray-300' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className="text-base leading-none">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
            {source === 'other' && (
              <input
                value={customSource}
                onChange={e => setCustom(e.target.value)}
                placeholder="Type the source name…"
                className={`mt-2 ${inputCls}`}
              />
            )}
          </Section>

          {/* PLAN + AMOUNT */}
          <Section label="What plan did they choose" step={3} icon={<Tag size={12} />}>
            <div className="grid grid-cols-4 gap-1.5">
              {PLAN_PRESETS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={[
                    'rounded-lg border py-2.5 px-2 text-center transition-colors',
                    planId === p.id
                      ? 'bg-yellow-50 text-yellow-900 border-yellow-300 ring-1 ring-yellow-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div className="font-bold text-[12px]">{p.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">{p.amount} MAD</div>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">Amount</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value, 10) || 0)}
                min={0}
                className={`flex-1 ${inputCls} tabular-nums font-bold text-yellow-700`}
              />
              <span className="text-[12px] font-bold text-gray-500">MAD</span>
            </div>
          </Section>

          {/* STATUS */}
          <Section label="Where are they in the funnel" step={4} icon={<CheckCircle2 size={12} />}>
            <div className="grid grid-cols-3 gap-1.5">
              {(['contacted', 'interested', 'follow_up', 'confirmed', 'paid', 'delayed'] as LeadStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={[
                    'rounded-lg border py-2 text-[11.5px] font-bold transition-colors',
                    status === s
                      ? 'bg-black text-yellow-400 border-black'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {LEAD_STATUS_META[s].label}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={e => setIsVip(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
              />
              <span className="text-[13px] font-semibold text-gray-800 flex items-center gap-1">
                <Crown size={12} className="text-rose-500" />
                Mark as VIP — pin to the top of the Kanban
              </span>
            </label>
          </Section>

          {/* NOTES */}
          <Section label="Notes" step={5} icon={<FileText size={12} />}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="What did they say? Any objections, preferred contact time, language…"
              className={`${inputCls} resize-y`}
            />
          </Section>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-[11px] text-gray-400 font-semibold">
            Logged as <span className="text-gray-700">{staff.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save lead
            </button>
          </div>
        </footer>
      </aside>
    </>
  )
}

/* ───────────── inner bits ───────────── */

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

function Section({
  label, step, icon, children,
}: {
  label:   string
  step:    number
  icon?:   React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-black text-yellow-400 flex items-center justify-center text-[10px] font-black">
          {step}
        </span>
        <span className="text-[11px] uppercase font-bold tracking-[0.15em] text-gray-700 flex items-center gap-1">
          {icon} {label}
        </span>
      </div>
      <div className="space-y-2 pl-7">{children}</div>
    </section>
  )
}

function Field({
  label, required, icon, children,
}: {
  label:    string
  required?: boolean
  icon?:    React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-500 mb-1 flex items-center gap-1">
        {icon} {label}
        {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  )
}
