'use client'

import { useEffect, useState } from 'react'
import {
  X, MessageCircle, Phone, MapPin, Calendar, FileText, Save,
  Loader2, Crown, Tag, Target, Globe,
} from 'lucide-react'
import {
  patchLead, updateLeadStatus, whatsappLink,
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

/**
 * Slide-in drawer for viewing + editing one lead. Mirrors the right-edge
 * detail panel pattern from Hubspot / Pipedrive.
 */
export default function LeadDetailDrawer({
  lead, onClose, onChange,
}: {
  lead:     SubscriptionLead
  onClose:  () => void
  onChange: () => Promise<void>
}) {
  const staff = useStaff()
  const [status, setStatus]               = useState<LeadStatus>(normalizeStatus(lead.status))
  const [notes, setNotes]                 = useState(lead.notes ?? lead.admin_note ?? '')
  const [followup, setFollowup]           = useState(lead.next_followup_at ?? '')
  const [courseInterested, setCourse]     = useState(lead.course_interested ?? '')
  const [isVip, setIsVip]                 = useState(!!lead.is_vip)
  const [saving, setSaving]               = useState(false)
  const [savedAt, setSavedAt]             = useState<number | null>(null)

  // Reset state if drawer reopened with a new lead
  useEffect(() => {
    setStatus(normalizeStatus(lead.status))
    setNotes(lead.notes ?? lead.admin_note ?? '')
    setFollowup(lead.next_followup_at ?? '')
    setCourse(lead.course_interested ?? '')
    setIsVip(!!lead.is_vip)
  }, [lead.id])

  async function handleSave() {
    setSaving(true)
    try {
      const patch: any = {
        notes:             notes || null,
        next_followup_at:  followup || null,
        course_interested: courseInterested || null,
        is_vip:            isVip,
      }
      await patchLead(lead.id, patch)
      if (status !== normalizeStatus(lead.status)) {
        await updateLeadStatus(lead.id, status, staff.id, notes || undefined)
      }
      await logActivity({
        action:     'lead_note_added',
        entityType: 'lead',
        entityId:   lead.id,
        metadata:   { notes_length: notes.length },
      })
      setSavedAt(Date.now())
      await onChange()
    } catch (err: any) {
      alert('Could not save: ' + (err?.message ?? 'unknown error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleLogContact() {
    await patchLead(lead.id, { last_contact_at: new Date().toISOString() })
    await logActivity({ action: 'lead_contacted', entityType: 'lead', entityId: lead.id })
    await onChange()
  }

  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        <header className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 mb-1">Lead</div>
            <div className="flex items-center gap-1.5">
              {isVip && <Crown size={14} className="text-rose-500" />}
              <h2 className="font-black text-gray-900 text-lg truncate">{lead.full_name}</h2>
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              Captured {new Date(lead.created_at).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener"
                onClick={handleLogContact}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={handleLogContact}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800"
              >
                <Phone size={12} /> Call
              </a>
            )}
            <button
              onClick={handleLogContact}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-500"
            >
              <Calendar size={12} /> Log contact
            </button>
          </div>

          {/* Status picker */}
          <Field label="Status">
            <select
              value={status}
              onChange={e => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              {LEAD_STATUSES.map(s => (
                <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
              ))}
            </select>
          </Field>

          <Field label="Follow-up date" icon={<Calendar size={11} />}>
            <input
              type="datetime-local"
              value={followup ? toLocalInput(followup) : ''}
              onChange={e => setFollowup(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </Field>

          <Field label="Course interested in" icon={<Target size={11} />}>
            <input
              value={courseInterested}
              onChange={e => setCourse(e.target.value)}
              placeholder="e.g. Sentence Builder · Level 2"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVip}
              onChange={e => setIsVip(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
            />
            <span className="text-sm font-semibold text-gray-800">
              <Crown size={12} className="inline text-rose-500 mr-1" />
              VIP lead — float to the top of the Kanban
            </span>
          </label>

          <Field label="Notes" icon={<FileText size={11} />}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Conversation summary, objections, next step…"
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-y"
            />
          </Field>

          {/* Metadata */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-[12px]">
            <Meta label="Phone"   value={lead.phone} />
            <Meta label="City"    value={lead.city}  icon={<MapPin size={10} />} />
            <Meta label="Plan"    value={lead.plan_id} />
            <Meta label="Amount"  value={lead.amount_mad ? `${lead.amount_mad} MAD` : null} />
            <Meta label="Source"  value={lead.source} icon={<Globe size={10} />} />
            <Meta label="Device"  value={lead.device} />
            <Meta label="UTM"     value={lead.utm_source} />
            <Meta label="Goal"    value={lead.goal} />
            <Meta label="Level"   value={lead.level} />
            <Meta label="Score"   value={lead.test_score?.toString() ?? null} />
            <Meta label="Last contact" value={lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleString() : null} />
            <Meta label="Reviewed by"  value={lead.reviewed_by} />
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-[11px] text-gray-400 font-semibold">
            {savedAt ? '✓ Saved' : 'Unsaved changes'}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </footer>
      </aside>
    </>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1.5 flex items-center gap-1">
        {icon} {label}
      </div>
      {children}
    </div>
  )
}

function Meta({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-400 mb-0.5 flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-gray-800 truncate" title={value}>{value}</div>
    </div>
  )
}

/** Convert ISO to the format <input type="datetime-local"> expects. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60 * 1000)
  return local.toISOString().slice(0, 16)
}
