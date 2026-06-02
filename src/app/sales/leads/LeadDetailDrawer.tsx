'use client'

import { useEffect, useState } from 'react'
import {
  X, Save, Loader2, MessageCircle, Phone, GraduationCap,
  Trash2, Crown, AlertCircle, Clock, Calendar, ChevronDown,
} from 'lucide-react'
import {
  patchLead, updateLeadStatus, whatsappLink,
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, LEAD_TYPES, LOST_REASONS, EVENT_ICONS } from '@/lib/crm-types'
import { fetchLeadTimeline, logLeadEvent, fetchStudentByLeadId, convertLeadToStudent } from '@/lib/crm-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'
import { supabase } from '@/lib/supabase'
import type { LeadEvent } from '@/lib/crm-types'

type Tab = 'overview' | 'edit' | 'timeline'

export default function LeadDetailDrawer({
  lead, onClose, onChange,
}: { lead: SubscriptionLead; onClose: () => void; onChange: () => Promise<void> }) {
  const staff = useStaff()
  const [tab, setTab]             = useState<Tab>('overview')
  const [timeline, setTimeline]   = useState<LeadEvent[]>([])
  const [student, setStudent]     = useState<any>(null)
  const [converting,     setConverting]     = useState(false)
  const [convertConfirm, setConvertConfirm] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // Edit state
  const [fullName, setFullName]   = useState(lead.full_name)
  const [phone, setPhone]         = useState(lead.phone ?? '')
  const [city, setCity]           = useState(lead.city ?? '')
  const [status, setStatus]       = useState<LeadStatus>(normalizeStatus(lead.status))
  const [source, setSource]       = useState(lead.lead_source ?? lead.source ?? '')
  const [course, setCourse]       = useState(lead.course ?? '')
  const [amount, setAmount]       = useState<number>(lead.amount_mad ?? 0)
  const [followup, setFollowup]   = useState(lead.next_followup_at ?? '')
  const [notes, setNotes]         = useState(lead.notes ?? lead.admin_note ?? '')
  const [isVip, setIsVip]         = useState(!!lead.is_vip)
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? '')

  useEffect(() => {
    fetchLeadTimeline(lead.id).then(setTimeline)
    fetchStudentByLeadId(lead.id).then(setStudent)
  }, [lead.id])

  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}`)
  const isArchived = !!(lead as any).is_archived
  const isCancelled = normalizeStatus(lead.status) === 'cancelled'

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const prevStatus = normalizeStatus(lead.status)
      await patchLead(lead.id, {
        full_name:         fullName.trim() || lead.full_name,
        phone:             phone.trim() || null,
        city:              city.trim() || null,
        notes:             notes.trim() || null,
        is_vip:            isVip,
        lost_reason:       isCancelled ? (lostReason || null) : null,
        lead_source:       source || null,
        course:            course || null,
        amount_mad:        amount || null,
        next_followup_at:  followup || null,
      } as any)

      if (status !== prevStatus) {
        await updateLeadStatus(lead.id, status, staff.id)
        await logLeadEvent({ leadId: lead.id, eventType: 'status_changed',
          title: `${LEAD_STATUS_META[prevStatus]?.label} → ${LEAD_STATUS_META[status]?.label}`,
          before: { status: prevStatus }, after: { status } })
        await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: lead.id,
          before: { status: prevStatus }, after: { status } })
        if (status === 'paid' && !student) {
          await convertLeadToStudent(lead.id)
          fetchStudentByLeadId(lead.id).then(setStudent)
        }
      } else {
        await logLeadEvent({ leadId: lead.id, eventType: 'note_added', title: 'Info updated' })
      }

      await onChange()
      fetchLeadTimeline(lead.id).then(setTimeline)
      setTab('overview')
    } catch (err: any) { setError(err?.message ?? 'Could not save') }
    finally { setSaving(false) }
  }

  async function handleContact() {
    await patchLead(lead.id, { last_contact_at: new Date().toISOString() } as any)
    await logLeadEvent({ leadId: lead.id, eventType: 'contacted', title: 'Contacted' })
    fetchLeadTimeline(lead.id).then(setTimeline)
    await onChange()
  }

  async function handleDelete() {
    if (!confirm(`Archive "${lead.full_name}"? This hides them from the pipeline but keeps the data.`)) return
    setDeleting(true)
    try {
      await supabase.from('subscription_leads').update({
        is_archived: true, archived_at: new Date().toISOString(), archived_by: staff.id,
      }).eq('id', lead.id)
      await logActivity({ action: 'lead_archived', entityType: 'lead', entityId: lead.id,
        metadata: { by: staff.email } })
      await onChange()
      onClose()
    } catch { setDeleting(false) }
  }

  async function handleConvert() {
    setConverting(true)
    try {
      await convertLeadToStudent(lead.id)
      setConvertConfirm(false)
      fetchStudentByLeadId(lead.id).then(setStudent)
      fetchLeadTimeline(lead.id).then(setTimeline)
      await onChange()
    } catch (err: any) { setError(err?.message ?? 'Conversion failed') }
    finally { setConverting(false) }
  }

  const statusMeta = LEAD_STATUS_META[normalizeStatus(lead.status)]
  const srcMeta    = LEAD_SOURCES.find(s => s.id === (lead.lead_source ?? lead.source))
  const courseMeta = LEAD_COURSES.find(c => c.id === lead.course)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white border-l border-gray-100 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isVip && <Crown size={13} className="text-yellow-500 flex-shrink-0" />}
              <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">{lead.full_name}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusMeta?.color ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {statusMeta?.label ?? lead.status}
              </span>
              {student && (
                <span className="flex items-center gap-1 text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-md">
                  <GraduationCap size={10} /> Student
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {lead.phone && <span className="font-mono mr-2">{lead.phone}</span>}
              {srcMeta && <span>{srcMeta.emoji} {srcMeta.label}</span>}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
          {wa && (
            <a href={wa} target="_blank" rel="noopener" onClick={handleContact}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">
              <MessageCircle size={12} /> WhatsApp
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`} onClick={handleContact}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors">
              <Phone size={12} /> Call
            </a>
          )}
          <button onClick={handleContact}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors">
            <Clock size={12} /> Log contact
          </button>
          {normalizeStatus(lead.status) === 'paid' && !student && !convertConfirm && (
            <button onClick={() => setConvertConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors ml-auto">
              <GraduationCap size={12} /> Convert to student
            </button>
          )}
          {convertConfirm && (
            <div className="ml-auto flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-emerald-800">Convert {lead.full_name}?</span>
              <button onClick={() => setConvertConfirm(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 px-1.5">Cancel</button>
              <button onClick={handleConvert} disabled={converting}
                className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50">
                {converting ? <Loader2 size={10} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['overview', 'edit', 'timeline'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors border-b-2 ${
                tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="p-5 space-y-4">
              <InfoGrid>
                <Info label="Status"   value={statusMeta?.label ?? lead.status} />
                <Info label="Source"   value={srcMeta ? `${srcMeta.emoji} ${srcMeta.label}` : (lead.source ?? '—')} />
                <Info label="Course"   value={courseMeta?.label ?? lead.course ?? '—'} />
                <Info label="Amount"   value={lead.amount_mad ? `${lead.amount_mad} MAD` : '—'} />
                <Info label="Phone"    value={lead.phone ?? '—'} />
                <Info label="City"     value={lead.city ?? '—'} />
                <Info label="Created"  value={new Date(lead.created_at).toLocaleDateString()} />
                <Info label="Last contact" value={lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString() : '—'} />
                {lead.next_followup_at && (
                  <Info label="Follow-up" value={new Date(lead.next_followup_at).toLocaleDateString()}
                    accent={new Date(lead.next_followup_at) < new Date() ? 'red' : undefined} />
                )}
                {lead.lost_reason && <Info label="Lost reason" value={LOST_REASONS.find(r => r.id === lead.lost_reason)?.label ?? lead.lost_reason} />}
                {lead.utm_source && <Info label="UTM source" value={lead.utm_source} />}
                {lead.device && <Info label="Device" value={lead.device} />}
              </InfoGrid>

              {(lead.notes || lead.admin_note) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    {lead.notes ?? lead.admin_note}
                  </p>
                </div>
              )}

              {student && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-2">
                    <GraduationCap size={15} /> Student record
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
                    <span>Type: <b>{student.student_type === 'private_student' ? 'Private' : 'Course'}</b></span>
                    <span>Status: <b>{student.payment_status}</b></span>
                    <span>Enrolled: <b>{new Date(student.enrollment_date).toLocaleDateString()}</b></span>
                    {student.next_payment_date && <span>Next payment: <b>{new Date(student.next_payment_date).toLocaleDateString()}</b></span>}
                    {student.total_paid_mad > 0 && <span className="col-span-2">Total paid: <b>{student.total_paid_mad} MAD</b></span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDIT */}
          {tab === 'edit' && (
            <div className="p-5 space-y-4">
              <EField label="Full name">
                <input value={fullName} onChange={e => setFullName(e.target.value)} className={inp} />
              </EField>
              <div className="grid grid-cols-2 gap-3">
                <EField label="Phone">
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+212…" className={inp} />
                </EField>
                <EField label="City">
                  <input value={city} onChange={e => setCity(e.target.value)} className={inp} />
                </EField>
              </div>
              <EField label="Status">
                <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className={inp}>
                  {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s =>
                    <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
                  )}
                </select>
              </EField>

              {isCancelled && (
                <EField label="Lost reason">
                  <select value={lostReason} onChange={e => setLostReason(e.target.value)} className={inp}>
                    <option value="">— select —</option>
                    {LOST_REASONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </EField>
              )}

              <div className="grid grid-cols-2 gap-3">
                <EField label="Source">
                  <select value={source} onChange={e => setSource(e.target.value)} className={inp}>
                    <option value="">—</option>
                    {LEAD_SOURCES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                  </select>
                </EField>
                <EField label="Course">
                  <select value={course} onChange={e => setCourse(e.target.value)} className={inp}>
                    <option value="">—</option>
                    {LEAD_COURSES.map(c => <option key={c.id} value={c.id}>{c.short}</option>)}
                  </select>
                </EField>
              </div>

              <EField label="Amount (MAD)">
                <input type="number" value={amount} min={0} onChange={e => setAmount(Number(e.target.value))}
                  className={`${inp} font-bold tabular-nums`} />
              </EField>

              <EField label="Follow-up date">
                <input type="datetime-local"
                  value={followup ? toLocal(followup) : ''}
                  onChange={e => setFollowup(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className={inp} />
              </EField>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <div onClick={() => setIsVip(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center ${isVip ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${isVip ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">VIP lead</span>
              </label>

              <EField label="Notes">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  placeholder="Conversation summary, objections, next step…"
                  className={`${inp} resize-y`} />
              </EField>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            </div>
          )}

          {/* TIMELINE */}
          {tab === 'timeline' && (
            <div className="p-5">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No events yet. Actions appear here.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[9px] top-0 bottom-0 w-px bg-gray-100" />
                  <ul className="space-y-4">
                    {timeline.map(ev => (
                      <li key={ev.id} className="flex gap-3 pl-6 relative">
                        <span className="absolute left-0 w-[19px] h-[19px] rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-[11px]">
                          {EVENT_ICONS[ev.event_type] ?? '·'}
                        </span>
                        <div className="flex-1 min-w-0 -mt-0.5">
                          <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                          {ev.body && <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">{ev.body}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">
                            {ev.actor_email && <span className="font-medium">{ev.actor_email} · </span>}
                            {new Date(ev.created_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/80">
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Archive lead
          </button>

          {tab === 'edit' && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save changes
            </button>
          )}
          {tab === 'overview' && (
            <button onClick={() => setTab('edit')}
              className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              Edit info →
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

/* helpers */
const inp = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white'

function toLocal(iso: string) {
  const d = new Date(iso); const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16)
}
function EField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>{children}</div>
}
function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}
function Info({ label, value, accent }: { label: string; value: string; accent?: 'red' }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 truncate ${accent === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
