'use client'

import { useEffect, useState } from 'react'
import {
  X, Phone, MessageCircle, Edit3, Save, Plus, CheckCircle,
  XCircle, Printer, Crown, Calendar, Clock, User,
  FileText, Archive, Trash2, RotateCcw, AlertTriangle, Loader2,
} from 'lucide-react'
import { type SubscriptionLead, normalizeStatus, updateLeadStatus, patchLead, whatsappLink, permanentDeleteLead } from '@/lib/leads-db'
import { type CrmStudent, type CrmPayment, type LeadEvent, EVENT_ICONS } from '@/lib/crm-types'
import { LEAD_STATUS_META } from '@/lib/leads-db'
import {
  fetchStudentByLeadId, fetchCrmPayments, approveCrmPayment,
  declineCrmPayment, fetchLeadTimeline, createCrmPayment, convertLeadToStudent,
} from '@/lib/crm-db'
import { fetchReceiptsForLead, printReceipt, buildReceiptWhatsAppMessage, type CrmReceipt } from '@/lib/crm-receipts'
import { logLeadEvent } from '@/lib/crm-db'
import { useStaff } from '@/lib/staff-context'
import { LEAD_STATUSES } from '@/lib/leads-db'

/* ── Arabic labels ─────────────────────────────────────── */
const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع',
  delayed: 'متأخر', cancelled: 'ملغي', vip: 'VIP',
}
const PAYMENT_TYPE_AR: Record<string, string> = {
  course_one_time: 'دورة (دفعة واحدة)',
  private_monthly:  'دروس خاصة (شهرية)',
}
const PAYMENT_STATUS_AR: Record<string, string> = {
  pending: 'معلق', paid: 'مدفوع', declined: 'مرفوض',
}

function fmtDate(s?: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })
}
function fmtTime(s?: string | null) {
  if (!s) return ''
  return new Date(s).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
}

/* ════════════════════════════════════════════════════════
   DRAWER
════════════════════════════════════════════════════════ */
interface Props {
  lead:      SubscriptionLead | null
  onClose:   () => void
  onUpdated: () => void
  isFounder: boolean
}

type Tab = 'info' | 'payments' | 'notes' | 'timeline'

export default function UnifiedDetailDrawer({ lead, onClose, onUpdated, isFounder }: Props) {
  const staff   = useStaff()
  const [tab,          setTab]          = useState<Tab>('info')
  const [student,      setStudent]      = useState<CrmStudent | null>(null)
  const [payments,     setPayments]     = useState<CrmPayment[]>([])
  const [receipts,     setReceipts]     = useState<CrmReceipt[]>([])
  const [timeline,     setTimeline]     = useState<LeadEvent[]>([])
  const [loadingData,  setLoadingData]  = useState(false)

  // Edit state
  const [editNote,     setEditNote]     = useState(false)
  const [noteText,     setNoteText]     = useState('')
  const [followupDate, setFollowupDate] = useState('')
  const [savingNote,   setSavingNote]   = useState(false)
  const [savingDate,   setSavingDate]   = useState(false)

  // New payment form
  const [showPayForm,  setShowPayForm]  = useState(false)
  const [payAmt,       setPayAmt]       = useState('')
  const [payType,      setPayType]      = useState<'course_one_time' | 'private_monthly'>('course_one_time')
  const [payMethod,    setPayMethod]    = useState<'cash' | 'bank_transfer' | 'card' | 'other'>('cash')
  const [payNotes,     setPayNotes]     = useState('')
  const [savingPay,    setSavingPay]    = useState(false)

  const [busy,         setBusy]         = useState(false)

  useEffect(() => {
    if (!lead) return
    setTab('info')
    setNoteText(lead.admin_note ?? '')
    setFollowupDate(lead.next_followup_at?.slice(0, 10) ?? '')
    loadData(lead.id)
  }, [lead?.id])

  async function loadData(leadId: string) {
    setLoadingData(true)
    const [s, p, r, t] = await Promise.all([
      fetchStudentByLeadId(leadId),
      fetchCrmPayments({ leadId }),
      fetchReceiptsForLead(leadId),
      fetchLeadTimeline(leadId),
    ])
    setStudent(s)
    setPayments(p)
    setReceipts(r)
    setTimeline(t)
    setLoadingData(false)
  }

  async function saveNote() {
    if (!lead) return
    setSavingNote(true)
    await patchLead(lead.id, { admin_note: noteText } as any)
    await logLeadEvent({ leadId: lead.id, eventType: 'note_added', title: 'تم إضافة ملاحظة', body: noteText })
    setSavingNote(false)
    setEditNote(false)
    onUpdated()
  }

  async function saveFollowup() {
    if (!lead) return
    setSavingDate(true)
    await patchLead(lead.id, { next_followup_at: followupDate || null } as any)
    await logLeadEvent({ leadId: lead.id, eventType: 'followup_set', title: 'تم تحديد موعد المتابعة', body: followupDate })
    setSavingDate(false)
    onUpdated()
  }

  async function changeStatus(s: string) {
    if (!lead) return
    setBusy(true)
    await updateLeadStatus(lead.id, s as any, staff.id)
    setBusy(false)
    onUpdated()
    // If status → paid, convert to student
    if (s === 'paid') await convertLeadToStudent(lead.id)
  }

  async function addPayment() {
    if (!lead || !payAmt) return
    setSavingPay(true)
    try {
      await createCrmPayment({
        leadId:         lead.id,
        studentId:      student?.id,
        type:           payType,
        courseOrService: lead.course ?? undefined,
        amountMad:      parseFloat(payAmt),
        notes:          payNotes || undefined,
      })
      setPayAmt(''); setPayNotes(''); setShowPayForm(false)
      await loadData(lead.id)
    } finally { setSavingPay(false) }
  }

  async function approve(payId: string) {
    setBusy(true)
    await approveCrmPayment(payId, staff.id)
    await loadData(lead!.id)
    onUpdated()
    setBusy(false)
  }
  async function decline(payId: string) {
    setBusy(true)
    await declineCrmPayment(payId)
    await loadData(lead!.id)
    setBusy(false)
  }

  async function archiveLead() {
    if (!lead || !confirm('هل تريد أرشفة هذا العميل؟')) return
    setBusy(true)
    await patchLead(lead.id, { is_archived: true } as any)
    setBusy(false)
    onClose(); onUpdated()
  }
  async function deleteLead() {
    if (!lead || !confirm('حذف هذا العميل نهائيًا؟ لن تتمكّن من استرجاعه.')) return
    setBusy(true)
    await permanentDeleteLead(lead.id)
    setBusy(false)
    onClose(); onUpdated()
  }
  async function restoreLeadAction() {
    if (!lead) return
    setBusy(true)
    await patchLead(lead.id, { is_archived: false } as any)
    setBusy(false)
    onClose(); onUpdated()
  }

  const isDeleted  = !!lead?.deleted_at
  const isArchived = !!lead?.is_archived

  if (!lead) return null

  const status = normalizeStatus(lead.status)
  const meta   = LEAD_STATUS_META[status]
  const phone  = lead.phone ?? ''

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-full sm:w-[480px] bg-white flex flex-col shadow-2xl" dir="rtl">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {lead.is_vip && <Crown size={16} className="text-rose-500" />}
            <span className="font-bold text-[17px] text-zinc-900 truncate max-w-[260px]">{lead.full_name}</span>
            {(isDeleted || isArchived) && (
              <span className="text-[11px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">
                {isDeleted ? 'محذوف' : 'مؤرشف'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X size={22} />
          </button>
        </div>

        {/* ── Quick actions: contact ─────────────────────── */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 flex-shrink-0 flex-wrap">
          {phone && (
            <>
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              >
                <Phone size={14} /> <span dir="ltr">{phone}</span>
              </a>
              <a
                href={whatsappLink(phone, `مرحبًا ${lead.full_name}،`) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                <MessageCircle size={14} /> واتساب
              </a>
            </>
          )}
          {/* Status quick-change */}
          <select
            value={status}
            disabled={busy}
            onChange={e => changeStatus(e.target.value)}
            className={`text-[12px] font-bold px-3 py-2 rounded-lg border cursor-pointer ${meta.color}`}
          >
            {LEAD_STATUSES.filter(s => !['converted','rejected'].includes(s)).map(s => (
              <option key={s} value={s}>{STATUS_AR[s] ?? s}</option>
            ))}
          </select>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="flex border-b border-zinc-100 flex-shrink-0 overflow-x-auto">
          {(['info', 'payments', 'notes', 'timeline'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = { info: 'المعلومات', payments: 'المدفوعات', notes: 'الملاحظات', timeline: 'السجل' }
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  'px-5 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors',
                  tab === t ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600',
                ].join(' ')}
              >
                {labels[t]}
                {t === 'payments' && payments.length > 0 && (
                  <span className="mr-1.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {payments.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loadingData && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-zinc-400" />
            </div>
          )}

          {/* ── INFO TAB ─── */}
          {!loadingData && tab === 'info' && (
            <div className="p-5 space-y-5">
              {/* Basic info */}
              <section className="space-y-3">
                <InfoRow label="الاسم" value={lead.full_name} />
                <InfoRow label="الهاتف" value={phone || '—'} dir="ltr" />
                <InfoRow label="الحالة" value={STATUS_AR[status] ?? status} />
                <InfoRow label="المصدر" value={lead.lead_source ?? lead.source ?? '—'} />
                <InfoRow label="الدورة" value={lead.course ?? '—'} />
                <InfoRow label="المبلغ المتوقع" value={lead.amount_mad ? `${lead.amount_mad.toLocaleString('ar-MA')} درهم` : '—'} />
                <InfoRow label="المدينة" value={lead.city ?? '—'} />
                {student && (
                  <InfoRow label="الطالب رقم" value={student.id.slice(0, 8)} />
                )}
              </section>

              {/* Follow-up date */}
              <section>
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">المتابعة القادمة</div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={followupDate}
                    onChange={e => setFollowupDate(e.target.value)}
                    className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white"
                    dir="ltr"
                  />
                  <button
                    onClick={saveFollowup}
                    disabled={savingDate}
                    className="px-4 py-2 bg-black text-white rounded-lg text-[12px] font-bold hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {savingDate ? <Loader2 size={13} className="animate-spin" /> : 'حفظ'}
                  </button>
                </div>
                {lead.next_followup_at && (
                  <p className="text-[12px] text-zinc-400 mt-1">المحددة: {fmtDate(lead.next_followup_at)}</p>
                )}
              </section>

              {/* Student info (if converted) */}
              {student && (
                <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span className="text-[13px] font-bold text-emerald-800">تحول إلى طالب</span>
                  </div>
                  <InfoRow label="نوع الطالب" value={student.student_type === 'course_student' ? 'دورة جماعية' : 'دروس خاصة'} />
                  <InfoRow label="إجمالي المدفوع" value={student.total_paid_mad ? `${student.total_paid_mad.toLocaleString('ar-MA')} درهم` : '—'} />
                  {student.monthly_fee_mad && (
                    <InfoRow label="الرسوم الشهرية" value={`${student.monthly_fee_mad.toLocaleString('ar-MA')} درهم/شهر`} />
                  )}
                  {student.next_payment_date && (
                    <InfoRow label="الدفع القادم" value={fmtDate(student.next_payment_date)} />
                  )}
                </section>
              )}

              {/* Archive / Delete actions */}
              {!isDeleted && !isArchived && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={archiveLead}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                  >
                    <Archive size={13} /> أرشفة
                  </button>
                  {isFounder && (
                    <button
                      onClick={deleteLead}
                      disabled={busy}
                      className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> حذف
                    </button>
                  )}
                </div>
              )}
              {(isDeleted || isArchived) && (
                <button
                  onClick={restoreLeadAction}
                  disabled={busy}
                  className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  <RotateCcw size={14} /> استرجاع
                </button>
              )}
            </div>
          )}

          {/* ── PAYMENTS TAB ─── */}
          {!loadingData && tab === 'payments' && (
            <div className="p-5 space-y-4">

              {/* Add payment button */}
              <button
                onClick={() => setShowPayForm(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 font-semibold text-[13px] transition-colors"
              >
                <Plus size={15} /> إضافة دفعة
              </button>

              {/* Add payment form */}
              {showPayForm && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div className="text-[13px] font-bold text-zinc-700 mb-2">دفعة جديدة</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">المبلغ (درهم)</label>
                      <input
                        type="number"
                        value={payAmt}
                        onChange={e => setPayAmt(e.target.value)}
                        placeholder="0"
                        className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500 font-semibold">طريقة الدفع</label>
                      <select
                        value={payMethod}
                        onChange={e => setPayMethod(e.target.value as any)}
                        className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white"
                      >
                        <option value="cash">نقدًا</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                        <option value="card">بطاقة</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-semibold">نوع الدفع</label>
                    <select
                      value={payType}
                      onChange={e => setPayType(e.target.value as any)}
                      className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white"
                    >
                      <option value="course_one_time">دورة (دفعة واحدة)</option>
                      <option value="private_monthly">دروس خاصة (شهرية)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-semibold">ملاحظات (اختياري)</label>
                    <input
                      value={payNotes}
                      onChange={e => setPayNotes(e.target.value)}
                      placeholder="..."
                      className="w-full mt-1 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={addPayment}
                      disabled={savingPay || !payAmt}
                      className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-[13px] hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {savingPay ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'تسجيل الدفعة'}
                    </button>
                    <button
                      onClick={() => setShowPayForm(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 text-[13px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Payment list */}
              {payments.length === 0 && !showPayForm && (
                <div className="text-center py-8 text-zinc-400 text-[14px]">لا توجد مدفوعات مسجلة</div>
              )}
              {payments.map(p => {
                const receipt = receipts.find(r => r.payment_id === p.id)
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[16px] text-zinc-900">
                        {p.amount_mad.toLocaleString('ar-MA')} درهم
                      </span>
                      <span className={[
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        p.payment_status === 'paid'     ? 'bg-green-100 text-green-700'  : '',
                        p.payment_status === 'pending'  ? 'bg-amber-100 text-amber-700'  : '',
                        p.payment_status === 'declined' ? 'bg-red-100 text-red-600'      : '',
                      ].join(' ')}>
                        {PAYMENT_STATUS_AR[p.payment_status]}
                      </span>
                    </div>
                    <div className="text-[12px] text-zinc-500 space-y-0.5">
                      <div>{PAYMENT_TYPE_AR[p.payment_type]}</div>
                      {p.payment_date && <div>التاريخ: {fmtDate(p.payment_date)}</div>}
                      {p.notes && <div className="text-zinc-400">{p.notes}</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {p.payment_status === 'pending' && (
                        <>
                          <button
                            onClick={() => approve(p.id)}
                            disabled={busy}
                            className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                          >
                            <CheckCircle size={12} /> قبول
                          </button>
                          <button
                            onClick={() => decline(p.id)}
                            disabled={busy}
                            className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                          >
                            <XCircle size={12} /> رفض
                          </button>
                        </>
                      )}
                      {receipt && (
                        <>
                          <button
                            onClick={() => printReceipt(receipt)}
                            className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          >
                            <Printer size={12} /> طباعة الوصل
                          </button>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone?.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(receipt)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <MessageCircle size={12} /> إرسال الوصل
                            </a>
                          )}
                          <span className="text-[11px] text-zinc-400">{receipt.receipt_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── NOTES TAB ─── */}
          {!loadingData && tab === 'notes' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-bold text-zinc-700">ملاحظات العميل</div>
                <button
                  onClick={() => setEditNote(v => !v)}
                  className="text-[12px] font-semibold text-zinc-400 hover:text-zinc-700 flex items-center gap-1"
                >
                  <Edit3 size={12} /> {editNote ? 'إلغاء' : 'تعديل'}
                </button>
              </div>
              {editNote ? (
                <>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={8}
                    placeholder="أضف ملاحظاتك هنا..."
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={saveNote}
                    disabled={savingNote}
                    className="mt-3 w-full py-2.5 bg-black text-white rounded-xl font-bold text-[13px] hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingNote ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ الملاحظات</>}
                  </button>
                </>
              ) : (
                <div className="bg-zinc-50 rounded-xl p-4 min-h-[120px] text-[14px] text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {noteText || <span className="text-zinc-300 italic">لا توجد ملاحظات بعد</span>}
                </div>
              )}
            </div>
          )}

          {/* ── TIMELINE TAB ─── */}
          {!loadingData && tab === 'timeline' && (
            <div className="p-5">
              {timeline.length === 0 && (
                <div className="text-center py-8 text-zinc-400 text-[14px]">لا يوجد سجل بعد</div>
              )}
              <div className="space-y-0">
                {timeline.map((ev, i) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[14px] flex-shrink-0">
                        {EVENT_ICONS[ev.event_type] ?? '🔵'}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-zinc-100 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-[13px] font-semibold text-zinc-800">{ev.title}</div>
                      {ev.body && <div className="text-[12px] text-zinc-500 mt-0.5">{ev.body}</div>}
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {ev.actor_email?.split('@')[0] ?? 'النظام'} · {fmtDate(ev.created_at)} {fmtTime(ev.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

/* ── Helpers ──────────────────────────────────────────────── */
function InfoRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-zinc-50 last:border-none">
      <span className="text-[12px] text-zinc-400 font-medium flex-shrink-0">{label}</span>
      <span className="text-[13px] text-zinc-800 font-semibold text-left" dir={dir}>{value}</span>
    </div>
  )
}
