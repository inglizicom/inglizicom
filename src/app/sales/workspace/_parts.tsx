'use client'

/* Workspace — status labels, lead urgency/sort helpers and the list views (leads, students, payments) with their cards, split out of WorkspaceClient.tsx. */


import {
  Users, GraduationCap, CreditCard, CalendarClock, Archive, CheckCircle, XCircle, AlertTriangle, Clock,
  Loader2, Crown, MessageCircle, Phone, Printer, Trash2,
} from 'lucide-react'

import { normalizeStatus, type SubscriptionLead, type LeadStatus } from '@/lib/leads-db'
import { daysInactive, type Engagement } from '@/lib/student-portal'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import { type StaffRow } from '@/lib/staff-db'
import { whatsappLink } from '@/lib/leads-db'

import Avatar from '@/app/sales/_components/Avatar'
import { ensurePaymentReceipt, printReceipt, buildReceiptWhatsAppMessage } from '@/lib/crm-receipts'
import { type FilterState } from './FilterDrawer'


/* ─── Status labels ─────────────────────────────────────── */
export const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع',
  delayed: 'متأخر', cancelled: 'ملغي',
}
export const STATUS_PILL_COLOR: Record<string, string> = {
  new:        'bg-zinc-100 text-zinc-600 border-zinc-200',
  contacted:  'bg-blue-50 text-blue-700 border-blue-200',
  interested: 'bg-violet-50 text-violet-700 border-violet-200',
  follow_up:  'bg-orange-50 text-orange-700 border-orange-200',
  confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid:       'bg-yellow-50 text-yellow-700 border-yellow-300',
  delayed:    'bg-amber-50 text-amber-700 border-amber-200',
  cancelled:  'bg-gray-100 text-gray-400 border-gray-200',
}

/* Sort leads: VIP first, then by urgency */
export function urgencyScore(l: SubscriptionLead): number {
  const s = normalizeStatus(l.status)
  if (s === 'cancelled') return 99
  if (s === 'paid')      return 80
  const d = l.next_followup_at?.slice(0, 10)
  const t = new Date().toISOString().slice(0, 10)
  if (d && d < t)  return 0
  if (d && d === t) return 1
  if (d)           return 2
  return 3
}

/* Status quick-filter pills order */
export const STATUS_PILL_ORDER: Array<LeadStatus | 'vip' | 'all'> = [
  'all', 'vip', 'confirmed', 'delayed', 'follow_up',
  'interested', 'contacted', 'new', 'paid', 'cancelled',
]

/* Smart action filters — what the assistant must handle NOW */
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const isFinalLead = (l: SubscriptionLead) => ['paid', 'cancelled'].includes(normalizeStatus(l.status))
export const isOverdueLead = (l: SubscriptionLead) => { const d = l.next_followup_at?.slice(0, 10); return !isFinalLead(l) && !!d && d < todayISO() }
export const isTodayLead   = (l: SubscriptionLead) => { const d = l.next_followup_at?.slice(0, 10); return !isFinalLead(l) && d === todayISO() }
export const isFreshLead   = (l: SubscriptionLead) => normalizeStatus(l.status) === 'new' && !l.assigned_to_id

export type SmartPill = '' | 'overdue' | 'today' | 'fresh'
export type LeadSort = 'newest' | 'oldest' | 'followup' | 'amount'
export const LEAD_SORTS: { id: LeadSort; label: string }[] = [
  { id: 'newest',   label: 'الأحدث أولًا' },
  { id: 'followup', label: 'المتابعة الأقرب' },
  { id: 'amount',   label: 'الأعلى مبلغًا' },
  { id: 'oldest',   label: 'الأقدم أولًا' },
]

export const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}

export type WorkspaceTab = 'leads' | 'students' | 'payments' | 'followups' | 'archive'
export const TABS: { id: WorkspaceTab; labelAr: string; icon: React.ElementType }[] = [
  { id: 'leads',     labelAr: 'العملاء',   icon: Users         },
  { id: 'students',  labelAr: 'الطلاب',    icon: GraduationCap  },
  { id: 'payments',  labelAr: 'المدفوعات', icon: CreditCard     },
  { id: 'followups', labelAr: 'المتابعات',  icon: CalendarClock  },
  { id: 'archive',   labelAr: 'الأرشيف',   icon: Archive        },
]
export const EMPTY_FILTERS: FilterState = { status: '', source: '', course: '', assignee: '', search: '' }



/* ══════════════════════════════════════════════════════════
   LEAD LIST — table (desktop) + compact rows (mobile)
══════════════════════════════════════════════════════════ */
export function leadFmtDate(s?: string | null) {
  return s ? new Date(s).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
export function followupTone(l: SubscriptionLead): string {
  const s = normalizeStatus(l.status)
  if (s === 'paid' || s === 'cancelled') return 'text-zinc-400'
  const d = l.next_followup_at?.slice(0, 10)
  const t = new Date().toISOString().slice(0, 10)
  if (d && d < t)  return 'text-red-600 font-bold'
  if (d && d === t) return 'text-orange-600 font-bold'
  return 'text-zinc-400'
}

export function LeadList({
  leads, checkedIds, onToggle, onToggleAll, allChecked, onOpen, onConvert, convertingId, studentLeadIds, staffMap,
}: {
  leads:          SubscriptionLead[]
  checkedIds:     Set<string>
  onToggle:       (id: string) => void
  onToggleAll:    () => void
  allChecked:     boolean
  onOpen:         (lead: SubscriptionLead) => void
  onConvert:      (lead: SubscriptionLead) => void
  convertingId:   string | null
  studentLeadIds: Set<string>
  staffMap:       Map<string, StaffRow>
}) {
  /* Show the convert button once a lead is engaged enough (confirmed/paid/delayed). */
  function canConvert(l: SubscriptionLead) {
    return ['confirmed', 'paid', 'delayed'].includes(normalizeStatus(l.status))
  }
  return (
    <>
      {/* ── Desktop table ──────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-3 py-3 w-10">
                  <button onClick={onToggleAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center ${allChecked ? 'bg-yellow-400 border-yellow-400' : 'border-zinc-300'}`}>
                    {allChecked && <div className="w-1.5 h-1.5 rounded-sm bg-black" />}
                  </button>
                </th>
                <th className="px-3 py-3 font-bold">الاسم</th>
                <th className="px-3 py-3 font-bold">الهاتف</th>
                <th className="px-3 py-3 font-bold">المصدر</th>
                <th className="px-3 py-3 font-bold">الدورة</th>
                <th className="px-3 py-3 font-bold">الحالة</th>
                <th className="px-3 py-3 font-bold">المبلغ</th>
                <th className="px-3 py-3 font-bold">المسؤول</th>
                <th className="px-3 py-3 font-bold">المتابعة القادمة</th>
                <th className="px-3 py-3 font-bold">تاريخ الإضافة</th>
                <th className="px-3 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const st = normalizeStatus(lead.status)
                const checked = checkedIds.has(lead.id)
                const assignee = staffMap.get(lead.assigned_to_id ?? '')?.email?.split('@')[0]
                return (
                  <tr key={lead.id} onClick={() => onOpen(lead)}
                    className={`border-b border-zinc-50 last:border-none text-[13px] cursor-pointer transition-colors ${checked ? 'bg-yellow-50/50' : 'hover:bg-zinc-50'}`}>
                    <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); onToggle(lead.id) }}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-yellow-400 border-yellow-400' : 'border-zinc-300'}`}>
                        {checked && <span className="w-1.5 h-1.5 rounded-sm bg-black" />}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={lead.full_name} size={32} />
                        <div className="flex items-center gap-1 font-semibold text-zinc-800">
                          {lead.is_vip && <Crown size={11} className="text-rose-500" />}
                          {lead.full_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {lead.phone
                        ? <div className="flex items-center gap-1.5">
                            <span dir="ltr" className="text-zinc-600">{lead.phone}</span>
                            <a href={whatsappLink(lead.phone) ?? '#'} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="text-green-600 hover:text-green-700"><MessageCircle size={14} /></a>
                          </div>
                        : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-500">{lead.lead_source ?? lead.source ?? '—'}</td>
                    <td className="px-3 py-2.5">{lead.course ? <span className="text-zinc-600 font-semibold">{lead.course.toUpperCase()}</span> : <span className="text-zinc-300">—</span>}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL_COLOR[st] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>{STATUS_AR[st] ?? st}</span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-zinc-700">{(lead.amount_mad ?? 0) > 0 ? `${lead.amount_mad?.toLocaleString('en-US')}` : '—'}</td>
                    <td className="px-3 py-2.5 text-zinc-500">{assignee ?? <span className="text-zinc-300">—</span>}</td>
                    <td className={`px-3 py-2.5 ${followupTone(lead)}`}>{lead.next_followup_at ? leadFmtDate(lead.next_followup_at) : <span className="text-zinc-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{leadFmtDate(lead.created_at)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {studentLeadIds.has(lead.id) ? (
                        <button onClick={() => onConvert(lead)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">عرض الطالب</button>
                      ) : canConvert(lead) ? (
                        <button onClick={() => onConvert(lead)} disabled={convertingId === lead.id}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 flex items-center gap-1">
                          {convertingId === lead.id ? <Loader2 size={11} className="animate-spin" /> : <GraduationCap size={11} />} تحويل لطالب
                        </button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile compact list ────────────────────── */}
      <div className="lg:hidden bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-50 overflow-hidden">
        {leads.map(lead => {
          const st = normalizeStatus(lead.status)
          const checked = checkedIds.has(lead.id)
          const overdue = isOverdueLead(lead)
          const dueToday = isTodayLead(lead)
          return (
            <div key={lead.id} onClick={() => onOpen(lead)}
              className={`flex items-center gap-2.5 px-3 py-3 ${checked ? 'bg-yellow-50/50' : overdue ? 'bg-red-50/40 active:bg-red-50' : 'active:bg-zinc-50'}`}>
              <button onClick={e => { e.stopPropagation(); onToggle(lead.id) }}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-yellow-400 border-yellow-400' : 'border-zinc-300'}`}>
                {checked && <span className="w-1.5 h-1.5 rounded-sm bg-black" />}
              </button>
              <Avatar name={lead.full_name} size={38} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-semibold text-[14px] text-zinc-800 truncate">
                  {lead.is_vip && <Crown size={11} className="text-rose-500 flex-shrink-0" />}
                  {lead.full_name}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
                  {overdue && <span className="font-bold text-red-600">🔴 متابعة متأخرة</span>}
                  {dueToday && <span className="font-bold text-orange-600">🟠 متابعة اليوم</span>}
                  {(overdue || dueToday) && <span>·</span>}
                  {lead.course && <><span className="font-semibold text-zinc-500">{lead.course.toUpperCase()}</span><span>·</span></>}
                  <span>{leadFmtDate(lead.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {lead.phone && (
                  <a href={whatsappLink(lead.phone, `مرحبًا ${lead.full_name}،`) ?? '#'} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center active:bg-green-100">
                    <MessageCircle size={15} />
                  </a>
                )}
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_PILL_COLOR[st] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>{STATUS_AR[st] ?? st}</span>
                  {studentLeadIds.has(lead.id) ? (
                    <button onClick={e => { e.stopPropagation(); onConvert(lead) }} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">طالب ✓</button>
                  ) : canConvert(lead) ? (
                    <button onClick={e => { e.stopPropagation(); onConvert(lead) }} disabled={convertingId === lead.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black flex items-center gap-1">
                      {convertingId === lead.id ? <Loader2 size={10} className="animate-spin" /> : <GraduationCap size={10} />} لطالب
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   LEAD CARD — used in follow-ups view
══════════════════════════════════════════════════════════ */
export function LeadCardNew({
  lead, selected, onSelect, onClick, assigneeName,
}: {
  lead: SubscriptionLead
  selected?: boolean
  onSelect?: (id: string) => void
  onClick: (lead: SubscriptionLead) => void
  assigneeName?: string
}) {
  const status    = normalizeStatus(lead.status)
  const pillColor = STATUS_PILL_COLOR[status] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
  const phone     = lead.phone ?? ''
  const today     = new Date().toISOString().slice(0, 10)
  const fuDate    = lead.next_followup_at?.slice(0, 10)
  const isOverdue = fuDate && fuDate < today
  const isToday   = fuDate && fuDate === today

  const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : ''

  return (
    <div
      className={[
        'bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-zinc-300',
        selected ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-zinc-200',
      ].join(' ')}
      onClick={() => onClick(lead)}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Avatar name={lead.full_name} size={38} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {lead.is_vip && <Crown size={12} className="text-rose-500 flex-shrink-0" />}
              <span className="font-bold text-[15px] text-zinc-900 truncate">{lead.full_name}</span>
            </div>
            {/* Urgency indicator */}
            {(isOverdue || isToday) && (
              <div className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                <Clock size={10} />
                {isOverdue ? `متأخر — ${fmtDate(fuDate)}` : `اليوم — ${fmtDate(fuDate)}`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pillColor}`}>
              {STATUS_AR[status] ?? status}
            </span>
            {onSelect && (
              <button type="button" onClick={e => { e.stopPropagation(); onSelect(lead.id) }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'bg-yellow-400 border-yellow-400' : 'border-zinc-300 hover:border-yellow-400'}`}>
                {selected && <div className="w-2 h-2 rounded-full bg-black" />}
              </button>
            )}
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(lead.lead_source ?? lead.source) && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
              {lead.lead_source ?? lead.source}
            </span>
          )}
          {lead.course && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold">
              {lead.course.toUpperCase()}
            </span>
          )}
          {(lead.amount_mad ?? 0) > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
              {lead.amount_mad?.toLocaleString('ar-MA')} درهم
            </span>
          )}
          {assigneeName && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-400 border border-zinc-100">
              👤 {assigneeName}
            </span>
          )}
        </div>
      </div>

      {/* Footer: contact */}
      {phone && (
        <div className="px-4 pb-3 pt-2 border-t border-zinc-50 flex items-center gap-2">
          <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-700 flex-1 min-w-0">
            <Phone size={11} />
            <span dir="ltr" className="truncate">{phone}</span>
          </a>
          <a href={whatsappLink(phone) ?? '#'} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] font-bold text-white bg-green-500 hover:bg-green-600 px-2.5 py-1 rounded-full flex-shrink-0">
            <MessageCircle size={11} /> واتساب
          </a>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   STUDENT CARD — clean redesign
══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   STUDENT LIST — table (desktop) + rows (mobile)
══════════════════════════════════════════════════════════ */
export function StudentList({
  students, engagement, inactiveDays, onOpen, onArchive, onUnarchive, onRemove,
}: {
  students:    CrmStudent[]
  engagement?: Map<string, Engagement>
  inactiveDays?: number
  onOpen:      (s: CrmStudent) => void
  onArchive:   (s: CrmStudent) => void
  onUnarchive: (s: CrmStudent) => void
  onRemove:    (s: CrmStudent) => void
}) {
  /** Returns a follow-up label if the student is inactive. */
  function followLabel(s: CrmStudent): string | null {
    if (!s.is_active) return null
    const d = daysInactive(engagement?.get(s.id))
    if (d === null) return 'لم يدخل بعد'
    if (d >= (inactiveDays ?? 7)) return `غير نشط ${d}ي`
    return null
  }
  const payCls: Record<string, string> = {
    paid: 'bg-green-50 text-green-700 border-green-200',
    overdue: 'bg-red-50 text-red-600 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const dueSoon = (s: CrmStudent) => (s.billing_type === 'monthly' || s.student_type === 'private_student') && s.next_payment_date
    && (new Date(s.next_payment_date).getTime() - Date.now()) / 86400000 <= 7
  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="px-3 py-3">الاسم</th>
                <th className="px-3 py-3">الهاتف</th>
                <th className="px-3 py-3">الدورة</th>
                <th className="px-3 py-3">النوع</th>
                <th className="px-3 py-3">المدفوع</th>
                <th className="px-3 py-3">الدفع القادم</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} onClick={() => onOpen(s)} className={`border-b border-zinc-50 last:border-none text-[13px] cursor-pointer hover:bg-zinc-50 ${!s.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={s.full_name} size={32} /><span className="font-semibold text-zinc-800">{s.full_name}</span>{followLabel(s) && <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><AlertTriangle size={9} /> {followLabel(s)}</span>}</div></td>
                  <td className="px-3 py-2.5 text-zinc-500" dir="ltr">{s.phone_number ?? '—'}</td>
                  <td className="px-3 py-2.5 text-zinc-600 font-semibold">{s.course?.toUpperCase() ?? '—'}</td>
                  <td className="px-3 py-2.5 text-zinc-500">{(s.billing_type === 'monthly' || s.student_type === 'private_student') ? 'شهري' : 'دورة'}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700">{(s.total_paid_mad ?? 0).toLocaleString('en-US')} د.م</td>
                  <td className={`px-3 py-2.5 ${dueSoon(s) ? 'text-orange-600 font-bold' : 'text-zinc-400'}`}>{s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' }) : '—'}</td>
                  <td className="px-3 py-2.5"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${s.is_active ? (payCls[s.payment_status] ?? payCls.pending) : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>{!s.is_active ? 'مؤرشف' : s.payment_status === 'paid' ? 'مدفوع' : s.payment_status === 'overdue' ? 'متأخر' : 'معلق'}</span></td>
                  <td className="px-3 py-2.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    {s.is_active
                      ? <button onClick={() => onArchive(s)} className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 ml-1">أرشفة</button>
                      : <button onClick={() => onUnarchive(s)} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 ml-1">تفعيل</button>}
                    <button onClick={() => onRemove(s)} className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-50 overflow-hidden">
        {students.map(s => (
          <div key={s.id} onClick={() => onOpen(s)} className={`flex items-center gap-3 px-3 py-3 active:bg-zinc-50 ${!s.is_active ? 'opacity-60' : ''}`}>
            <Avatar name={s.full_name} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[14px] text-zinc-800 truncate">{s.full_name}</span>
                {followLabel(s) && <span className="text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 rounded-full flex-shrink-0">{followLabel(s)}</span>}
              </div>
              <div className="text-[11px] text-zinc-400">{s.course?.toUpperCase() ?? '—'} · {(s.total_paid_mad ?? 0).toLocaleString('en-US')} د.م</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              {s.is_active
                ? <button onClick={() => onArchive(s)} className="text-[11px] px-2 py-1 rounded-lg border border-zinc-200 text-zinc-500">أرشفة</button>
                : <button onClick={() => onUnarchive(s)} className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">تفعيل</button>}
              <button onClick={() => onRemove(s)} className="text-red-400 p-1"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function StudentCardNew({ student, onClick }: { student: CrmStudent; onClick: (s: CrmStudent) => void }) {
  const phone = student.phone_number ?? ''
  const isDueSoon = student.student_type === 'private_student' && student.next_payment_date &&
    (new Date(student.next_payment_date).getTime() - Date.now()) / 86400000 <= 14

  return (
    <div
      className="bg-white rounded-xl border border-zinc-200 cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all"
      onClick={() => onClick(student)}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Avatar name={student.full_name} size={38} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] text-zinc-900 truncate">{student.full_name}</span>
            </div>
            <div className="text-[12px] text-zinc-400 mt-0.5">
              {student.student_type === 'course_student' ? 'دورة جماعية' : 'دروس خاصة'}
            </div>
          </div>
          <span className={[
            'text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0',
            student.payment_status === 'paid'    ? 'bg-green-50 text-green-700 border-green-200'
            : student.payment_status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-amber-50 text-amber-700 border-amber-200',
          ].join(' ')}>
            {student.payment_status === 'paid' ? 'مدفوع' : student.payment_status === 'overdue' ? 'متأخر' : 'معلق'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {/* Added by a teacher from their space (059) */}
          {student.review_status === 'pending' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">بانتظار المراجعة</span>
          )}
          {student.review_status === 'rejected' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold">مرفوض</span>
          )}
          {student.origin_teacher_id && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">من أستاذ</span>
          )}
          {student.course && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold">
              {student.course.toUpperCase()}
            </span>
          )}
          {(student.total_paid_mad ?? 0) > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
              {student.total_paid_mad?.toLocaleString('ar-MA')} درهم
            </span>
          )}
          {student.monthly_fee_mad && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {student.monthly_fee_mad}/شهر
            </span>
          )}
        </div>

        {isDueSoon && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
            <Clock size={11} />
            الدفع القادم: {new Date(student.next_payment_date!).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {phone && (
        <div className="px-4 pb-3 pt-2 border-t border-zinc-50 flex items-center gap-2">
          <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-700 flex-1 min-w-0">
            <Phone size={11} />
            <span dir="ltr" className="truncate">{phone}</span>
          </a>
          <a href={whatsappLink(phone) ?? '#'} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] font-bold text-white bg-green-500 hover:bg-green-600 px-2.5 py-1 rounded-full flex-shrink-0">
            <MessageCircle size={11} /> واتساب
          </a>
        </div>
      )}
    </div>
  )
}

/* ── Payment row ─────────────────────────────────────────── */
export const PAY_METHOD_AR: Record<string, string> = { cash: 'نقدًا', bank_transfer: 'تحويل بنكي', card: 'بطاقة', other: 'أخرى' }

/* Shared: resolve a payment's person, then print or WhatsApp the receipt with the
   live name + token (overriding any stale stored snapshot). */
export function resolvePayment(p: CrmPayment, studentById: Map<string, CrmStudent>, leads: SubscriptionLead[]) {
  const student = p.student_id ? studentById.get(p.student_id) : undefined
  const lead    = p.lead_id ? leads.find(l => l.id === p.lead_id) : undefined
  const name    = student?.full_name ?? lead?.full_name ?? 'غير محدّد'
  const phone   = student?.phone_number ?? lead?.phone ?? undefined
  const course  = (student?.course ?? lead?.course ?? p.course_or_service ?? '').toUpperCase()
  return { student, lead, name, phone, course }
}
export async function emitReceipt(p: CrmPayment, ctx: { name: string; phone?: string; course: string; student?: CrmStudent }, send = false) {
  const r = await ensurePaymentReceipt({
    paymentId: p.id, leadId: p.lead_id, studentId: p.student_id,
    fullName: ctx.name, phoneNumber: ctx.phone, courseName: ctx.course || p.course_or_service,
    paymentType: p.payment_type, amountMad: Number(p.amount_mad),
    paymentDate: p.payment_date, notes: p.notes,
    verificationToken: ctx.student?.verification_token ?? null,
  })
  if (!r) return
  const fixed: any = { ...r, full_name: ctx.name, phone_number: ctx.phone ?? r.phone_number, course_name: ctx.course || r.course_name, verification_token: ctx.student?.verification_token ?? r.verification_token }
  if (send && ctx.phone) window.open(`https://wa.me/${ctx.phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(fixed)}`, '_blank')
  else printReceipt(fixed, { token: ctx.student?.verification_token, teacherName: ctx.student?.teacher_name })
}

export function PayRow({
  p, leads, studentById, staffMap, payBusy, onApprove, onDecline, onOpenStudent, onOpenLead,
}: {
  p: CrmPayment; leads: SubscriptionLead[]
  studentById: Map<string, CrmStudent>
  staffMap: Map<string, StaffRow>
  payBusy: string | null
  onApprove: (id: string) => void
  onDecline: (id: string) => void
  onOpenStudent: (id: string) => void
  onOpenLead: (lead: SubscriptionLead) => void
}) {
  const info    = PAY_STATUS_AR[p.payment_status]
  const student = p.student_id ? studentById.get(p.student_id) : undefined
  const lead    = p.lead_id ? leads.find(l => l.id === p.lead_id) : undefined
  const name    = student?.full_name ?? lead?.full_name ?? 'غير محدّد'
  const phone   = student?.phone_number ?? lead?.phone ?? undefined
  const course  = (student?.course ?? lead?.course ?? p.course_or_service ?? '').toUpperCase()
  const registeredBy = p.added_by_id    ? staffMap.get(p.added_by_id)?.email?.split('@')[0] : undefined
  const approvedBy   = p.approved_by_id ? staffMap.get(p.approved_by_id)?.email?.split('@')[0] : undefined

  function openPerson() {
    if (student) onOpenStudent(student.id)
    else if (lead) onOpenLead(lead)
  }

  const ctx = { name, phone, course, student }
  const downloadReceipt = () => emitReceipt(p, ctx, false)
  const sendReceipt     = () => emitReceipt(p, ctx, true)

  const typeAr = p.payment_type === 'course_one_time' ? 'دفعة واحدة' : 'اشتراك شهري'
  const dateStr = p.payment_date
    ? new Date(p.payment_date).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(p.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      {/* Top: clickable person + amount */}
      <button type="button" onClick={openPerson} className="w-full flex items-center gap-3 p-4 text-right hover:bg-zinc-50 transition-colors">
        <Avatar name={name} size={42} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] text-zinc-900 truncate">{name}</div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-zinc-400">
            {course && <span className="font-semibold text-zinc-500">{course}</span>}
            {course && <span>·</span>}
            <span>{typeAr}</span>
            <span>·</span>
            <span>{PAY_METHOD_AR[(p as any).payment_method] ?? 'نقدًا'}</span>
          </div>
        </div>
        <div className="text-left flex-shrink-0">
          <div className="text-[19px] font-black text-zinc-900 leading-none">{Number(p.amount_mad).toLocaleString('en-US')}<span className="text-[11px] font-semibold text-zinc-400 mr-1">د.م</span></div>
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span>
        </div>
      </button>

      {/* Meta line */}
      <div className="px-4 pb-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-400 border-t border-zinc-50 pt-2">
        <span>📅 {dateStr}</span>
        {registeredBy && <span>· سجّلها {registeredBy}</span>}
        {approvedBy && p.payment_status === 'paid' && <span>· وافق {approvedBy}</span>}
      </div>

      {/* Actions */}
      {p.payment_status === 'pending' && (
        <div className="flex gap-2 px-4 pb-4">
          <button type="button" onClick={() => onApprove(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1 text-[13px] font-bold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
            {payBusy === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} قبول الدفعة
          </button>
          <button type="button" onClick={() => onDecline(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1 text-[13px] px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
            <XCircle size={12} /> رفض
          </button>
        </div>
      )}
      {p.payment_status === 'paid' && (
        <div className="flex gap-2 px-4 pb-4">
          <button type="button" onClick={downloadReceipt}
            className="flex items-center gap-1 text-[13px] font-bold px-4 py-2 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800">
            <Printer size={12} /> تحميل الوصل
          </button>
          {phone && (
            <button type="button" onClick={sendReceipt}
              className="flex items-center gap-1 text-[13px] font-semibold px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
              <MessageCircle size={12} /> إرسال الوصل
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────── */
export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-zinc-400">
      <div className="text-4xl mb-3">📭</div>
      <div className="text-[14px]">{text}</div>
    </div>
  )
}
