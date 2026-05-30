'use client'

import { useEffect, useState } from 'react'
import {
  X, Save, Loader2, Phone, MapPin, Calendar, FileText,
  Globe, Tag, Crown, CheckCircle2, AlertTriangle,
  MessageCircle, Clock, GraduationCap,
} from 'lucide-react'
import {
  patchLead, updateLeadStatus, whatsappLink,
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, LEAD_TYPES, LOST_REASONS, EVENT_ICONS, type LeadEvent } from '@/lib/crm-types'
import { fetchLeadTimeline, logLeadEvent, fetchStudentByLeadId, convertLeadToStudent } from '@/lib/crm-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

type Tab = 'details' | 'timeline' | 'student'

export default function LeadDetailDrawer({
  lead, onClose, onChange,
}: { lead: SubscriptionLead; onClose: () => void; onChange: () => Promise<void> }) {
  const staff = useStaff()
  const [tab, setTab]               = useState<Tab>('details')
  const [status, setStatus]         = useState<LeadStatus>(normalizeStatus(lead.status))
  const [notes, setNotes]           = useState(lead.notes ?? lead.admin_note ?? '')
  const [followup, setFollowup]     = useState(lead.next_followup_at ?? '')
  const [isVip, setIsVip]           = useState(!!lead.is_vip)
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? '')
  const [leadSource, setLeadSource] = useState(lead.lead_source ?? lead.source ?? '')
  const [leadCourse, setLeadCourse] = useState(lead.course ?? '')
  const [leadType, setLeadType]     = useState(lead.lead_type ?? 'course')
  const [timeline, setTimeline]     = useState<LeadEvent[]>([])
  const [tlLoading, setTlLoad]      = useState(false)
  const [student, setStudent]       = useState<any>(null)
  const [converting, setConverting] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    setStatus(normalizeStatus(lead.status)); setNotes(lead.notes ?? lead.admin_note ?? '')
    setFollowup(lead.next_followup_at ?? ''); setIsVip(!!lead.is_vip)
    setLostReason(lead.lost_reason ?? ''); setLeadSource(lead.lead_source ?? lead.source ?? '')
    setLeadCourse(lead.course ?? ''); setLeadType(lead.lead_type ?? 'course'); setError(null)
    loadTimeline(); fetchStudentByLeadId(lead.id).then(setStudent)
  }, [lead.id])

  async function loadTimeline() {
    setTlLoad(true); setTimeline(await fetchLeadTimeline(lead.id)); setTlLoad(false)
  }

  async function handleSave() {
    setError(null); setSaving(true)
    try {
      const prev = normalizeStatus(lead.status)
      await patchLead(lead.id, {
        notes: notes || null, next_followup_at: followup || null,
        is_vip: isVip, lost_reason: lostReason || null,
        lead_source: leadSource || null, course: leadCourse || null, lead_type: leadType || null,
      } as any)
      if (status !== prev) {
        await updateLeadStatus(lead.id, status, staff.id, notes || undefined)
        await logLeadEvent({ leadId: lead.id, eventType: 'status_changed',
          title: `${LEAD_STATUS_META[prev]?.label ?? prev} → ${LEAD_STATUS_META[status]?.label ?? status}`,
          before: { status: prev }, after: { status } })
        await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: lead.id,
          before: { status: prev }, after: { status } })
        if (status === 'paid' && !student) {
          await convertLeadToStudent(lead.id)
          fetchStudentByLeadId(lead.id).then(setStudent)
        }
      }
      await onChange(); await loadTimeline()
    } catch (err: any) { setError(err?.message ?? 'Could not save') }
    finally { setSaving(false) }
  }

  async function handleLogContact() {
    await patchLead(lead.id, { last_contact_at: new Date().toISOString() } as any)
    await logLeadEvent({ leadId: lead.id, eventType: 'contacted', title: 'Contacted' })
    loadTimeline(); onChange()
  }

  async function handleConvert() {
    if (!confirm(`Convert ${lead.full_name} to a student?`)) return
    setConverting(true)
    try { await convertLeadToStudent(lead.id); fetchStudentByLeadId(lead.id).then(setStudent); loadTimeline(); onChange() }
    catch (err: any) { alert(err?.message) }
    finally { setConverting(false) }
  }

  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[500px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">

        {/* Header */}
        <header className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isVip && <Crown size={13} className="text-rose-500" />}
              <h2 className="font-black text-gray-900 text-lg truncate">{lead.full_name}</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${LEAD_STATUS_META[status]?.color}`}>
                {LEAD_STATUS_META[status]?.short ?? status}
              </span>
              {student && <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-50 border border-yellow-200 text-yellow-800"><GraduationCap size={10} /> Student</span>}
            </div>
            <div className="text-[11px] text-gray-400">Created {new Date(lead.created_at).toLocaleDateString()}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 ml-2"><X size={20} /></button>
        </header>

        {/* Quick actions */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
          {wa && <a href={wa} target="_blank" rel="noopener" onClick={handleLogContact}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700">
            <MessageCircle size={12} /> WhatsApp</a>}
          {lead.phone && <a href={`tel:${lead.phone}`} onClick={handleLogContact}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800">
            <Phone size={12} /> Call</a>}
          <button onClick={handleLogContact}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-500">
            <Clock size={12} /> Log contact</button>
          {status === 'paid' && !student && (
            <button onClick={handleConvert} disabled={converting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">
              {converting ? <Loader2 size={12} className="animate-spin" /> : <GraduationCap size={12} />} Make student</button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 gap-5">
          {(['details','timeline','student'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-2.5 text-[13px] font-bold border-b-2 transition-colors capitalize ${tab === t ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {tab === 'details' && (
            <div className="px-5 py-4 space-y-4">
              <Field label="Status">
                <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className={inp}>
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>)}
                </select>
              </Field>

              {status === 'cancelled' && (
                <Field label="Lost reason" icon={<AlertTriangle size={11} className="text-red-500" />}>
                  <select value={lostReason} onChange={e => setLostReason(e.target.value)} className={inp}>
                    <option value="">— select reason —</option>
                    {LOST_REASONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Source" icon={<Globe size={11} />}>
                  <select value={leadSource} onChange={e => setLeadSource(e.target.value)} className={inp}>
                    <option value="">—</option>
                    {LEAD_SOURCES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                  </select>
                </Field>
                <Field label="Course" icon={<Tag size={11} />}>
                  <select value={leadCourse} onChange={e => setLeadCourse(e.target.value)} className={inp}>
                    <option value="">—</option>
                    {LEAD_COURSES.map(c => <option key={c.id} value={c.id}>{c.short}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Type">
                <div className="flex gap-2">
                  {LEAD_TYPES.map(t => (
                    <button key={t.id} type="button" onClick={() => setLeadType(t.id)}
                      className={`flex-1 py-2 rounded-lg border text-[12px] font-bold transition-colors ${leadType === t.id ? 'bg-black text-yellow-400 border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {t.label}</button>
                  ))}
                </div>
              </Field>

              <Field label="Follow-up date" icon={<Calendar size={11} />}>
                <input type="datetime-local" value={followup ? toLocal(followup) : ''}
                  onChange={e => setFollowup(e.target.value ? new Date(e.target.value).toISOString() : '')} className={inp} />
              </Field>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-rose-500" />
                <span className="text-[13px] font-semibold text-gray-700 flex items-center gap-1"><Crown size={12} className="text-rose-500" /> VIP</span>
              </label>

              <Field label="Notes" icon={<FileText size={11} />}>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} placeholder="Conversation summary, objections, next step…" className={`${inp} resize-y`} />
              </Field>

              {/* Meta grid */}
              <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-[12px]">
                {lead.phone && <MRow label="Phone" value={lead.phone} icon={<Phone size={9} />} />}
                {lead.city  && <MRow label="City"  value={lead.city}  icon={<MapPin size={9} />} />}
                {lead.plan_id     && <MRow label="Plan"   value={lead.plan_id} />}
                {lead.amount_mad  && <MRow label="Amount" value={`${lead.amount_mad} MAD`} />}
                {lead.utm_source  && <MRow label="UTM"    value={lead.utm_source} />}
                {lead.device      && <MRow label="Device" value={lead.device} />}
                {lead.last_contact_at && <MRow label="Last contact" value={new Date(lead.last_contact_at).toLocaleString()} />}
              </div>

              {error && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold">{error}</div>}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="px-5 py-4">
              {tlLoading ? (
                <div className="py-10 flex justify-center"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
              ) : timeline.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No timeline events yet. Actions will appear here.</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />
                  <ul className="space-y-4">
                    {timeline.map(ev => (
                      <li key={ev.id} className="relative flex gap-3 pl-7">
                        <span className="absolute left-0 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-[11px]">
                          {EVENT_ICONS[ev.event_type] ?? '·'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-gray-900">{ev.title}</div>
                          {ev.body && <div className="text-[12px] text-gray-500 mt-0.5 whitespace-pre-wrap">{ev.body}</div>}
                          <div className="text-[11px] text-gray-400 mt-1">
                            {ev.actor_email && <span className="font-medium">{ev.actor_email} · </span>}
                            {new Date(ev.created_at).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === 'student' && (
            <div className="px-5 py-4 space-y-4">
              {student ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Student record
                  </div>
                  <div className="text-[12px] text-emerald-700 grid grid-cols-2 gap-1">
                    <div>Type: <b>{student.student_type === 'private_student' ? 'Private' : 'Course'}</b></div>
                    <div>Course: <b>{student.course ?? '—'}</b></div>
                    <div>Enrolled: <b>{new Date(student.enrollment_date).toLocaleDateString()}</b></div>
                    <div>Status: <b>{student.payment_status}</b></div>
                    {student.next_payment_date && <div className="col-span-2">Next payment: <b className="text-orange-700">{new Date(student.next_payment_date).toLocaleDateString()}</b></div>}
                    {student.total_paid_mad > 0 && <div className="col-span-2">Total paid: <b>{student.total_paid_mad} MAD</b></div>}
                  </div>
                </div>
              ) : status === 'paid' ? (
                <button onClick={handleConvert} disabled={converting}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {converting ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                  Convert to Student
                </button>
              ) : (
                <div className="py-8 text-center text-sm text-gray-400">
                  Set status to <b>Paid</b> to create a student record.
                </div>
              )}
              <div className="border-t pt-4 text-[12px] grid grid-cols-2 gap-2">
                {lead.plan_id    && <MRow label="Plan"   value={lead.plan_id} />}
                {lead.amount_mad && <MRow label="Amount" value={`${lead.amount_mad} MAD`} />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-[11px] text-gray-400">{staff.email}</div>
          {tab === 'details' && (
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          )}
        </footer>
      </aside>
    </>
  )
}

const inp = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div><div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1 flex items-center gap-1">{icon}{label}</div>{children}</div>
}
function MRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><div className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-400 mb-0.5 flex items-center gap-1">{icon}{label}</div><div className="text-gray-800 truncate">{value}</div></div>
}
function toLocal(iso: string): string {
  const d = new Date(iso); const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16)
}
