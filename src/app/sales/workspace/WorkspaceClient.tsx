'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, RefreshCw, Plus,
  Users, GraduationCap, CreditCard, CalendarClock, Archive,
  CheckCircle, XCircle, AlertTriangle, Clock, Loader2, Crown,
  MessageCircle, Phone, Printer,
} from 'lucide-react'

import {
  fetchAllLeads, fetchArchivedLeads, normalizeStatus,
  bulkPatchLeads, bulkArchiveLeads, bulkSoftDeleteLeads,
  type SubscriptionLead, type LeadStatus,
  LEAD_STATUS_META,
} from '@/lib/leads-db'
import { fetchStudents, fetchCrmPayments, approveCrmPayment, declineCrmPayment } from '@/lib/crm-db'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import { fetchOverdueFollowUps, fetchTodaysFollowUps, type OverdueLead } from '@/lib/crm-stats'
import { fetchStaff, type StaffRow } from '@/lib/staff-db'
import { useStaff } from '@/lib/staff-context'
import { whatsappLink } from '@/lib/leads-db'

import Avatar from '@/app/sales/_components/Avatar'
import { ensurePaymentReceipt, printReceipt, buildReceiptWhatsAppMessage } from '@/lib/crm-receipts'
import UnifiedDetailDrawer from './UnifiedDetailDrawer'
import StudentDrawer from './StudentDrawer'
import FilterDrawer, { type FilterState } from './FilterDrawer'
import BulkBar from './BulkBar'
import AddLeadModal from '@/app/sales/leads/AddLeadModal'

/* ─── Status labels ─────────────────────────────────────── */
const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع',
  delayed: 'متأخر', cancelled: 'ملغي',
}
const STATUS_PILL_COLOR: Record<string, string> = {
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
function urgencyScore(l: SubscriptionLead): number {
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
const STATUS_PILL_ORDER: Array<LeadStatus | 'vip' | 'all'> = [
  'all', 'vip', 'confirmed', 'delayed', 'follow_up',
  'interested', 'contacted', 'new', 'paid', 'cancelled',
]

const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}

type WorkspaceTab = 'leads' | 'students' | 'payments' | 'followups' | 'archive'
const TABS: { id: WorkspaceTab; labelAr: string; icon: React.ElementType }[] = [
  { id: 'leads',     labelAr: 'العملاء',   icon: Users         },
  { id: 'students',  labelAr: 'الطلاب',    icon: GraduationCap  },
  { id: 'payments',  labelAr: 'المدفوعات', icon: CreditCard     },
  { id: 'followups', labelAr: 'المتابعات',  icon: CalendarClock  },
  { id: 'archive',   labelAr: 'الأرشيف',   icon: Archive        },
]
const EMPTY_FILTERS: FilterState = { status: '', source: '', course: '', assignee: '', search: '' }

export default function WorkspaceClient() {
  /* ── useSearchParams drives tab — reactive to any navigation ── */
  const sp     = useSearchParams()
  const router = useRouter()
  const rawTab = sp.get('tab') as WorkspaceTab | null
  const tab: WorkspaceTab = rawTab && TABS.some(t => t.id === rawTab) ? rawTab : 'leads'

  function switchTab(t: WorkspaceTab) {
    router.replace(t === 'leads' ? '/sales/workspace' : `/sales/workspace?tab=${t}`, { scroll: false })
  }

  const staff     = useStaff()
  const isFounder = staff.role === 'founder'

  /* ── Data ────────────────────────────────────────────── */
  const [leads,    setLeads]    = useState<SubscriptionLead[]>([])
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [overdue,  setOverdue]  = useState<OverdueLead[]>([])
  const [todayFU,  setTodayFU]  = useState<OverdueLead[]>([])
  const [archived, setArchived] = useState<SubscriptionLead[]>([])
  const [staffList,setStaffList]= useState<StaffRow[]>([])
  const [loading,  setLoading]  = useState(true)

  /* ── UI ──────────────────────────────────────────────── */
  const [filters,      setFilters]      = useState<FilterState>(EMPTY_FILTERS)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [drawerLead,   setDrawerLead]   = useState<SubscriptionLead | null>(null)
  const [drawerStudent,setDrawerStudent]= useState<CrmStudent | null>(null)
  const [addOpen,      setAddOpen]      = useState(false)
  const [checkedIds,   setCheckedIds]   = useState<Set<string>>(new Set())
  const [bulkBusy,     setBulkBusy]     = useState(false)
  const [payBusy,      setPayBusy]      = useState<string | null>(null)
  /* Quick status pill filter (Leads tab only) */
  const [statusPill,   setStatusPill]   = useState<string>('all')

  const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList])

  /* ── Load ─────────────────────────────────────────────── */
  useEffect(() => {
    if (sp.get('add') === '1') {
      setAddOpen(true)
      router.replace('/sales/workspace', { scroll: false })
    }
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [l, s, p, od, td, ar, sf] = await Promise.all([
      fetchAllLeads(), fetchStudents(), fetchCrmPayments({ limit: 200 }),
      fetchOverdueFollowUps(isFounder ? undefined : staff.id),
      fetchTodaysFollowUps(isFounder ? undefined : staff.id),
      fetchArchivedLeads(), fetchStaff(),
    ])
    setLeads(l); setStudents(s); setPayments(p)
    setOverdue(od); setTodayFU(td); setArchived(ar); setStaffList(sf)
    setLoading(false)
  }
  function refresh() { setCheckedIds(new Set()); loadAll() }

  /* ── Derived data ────────────────────────────────────── */
  const q = filters.search.trim().toLowerCase()

  const baseLeads = useMemo(() => leads.filter(l => {
    if (filters.status   && normalizeStatus(l.status) !== filters.status) return false
    if (filters.source   && (l.lead_source ?? l.source) !== filters.source) return false
    if (filters.course   && l.course !== filters.course) return false
    if (filters.assignee && l.assigned_to_id !== filters.assignee) return false
    if (q) {
      const hay = `${l.full_name} ${l.phone ?? ''} ${l.course ?? ''} ${l.city ?? ''}`.toLowerCase()
      return hay.includes(q)
    }
    return true
  }), [leads, filters, q])

  /* Apply quick pill filter on top of base filters */
  const visibleLeads = useMemo(() => {
    let list = baseLeads
    if (statusPill === 'vip')  list = list.filter(l => l.is_vip)
    else if (statusPill !== 'all') list = list.filter(l => normalizeStatus(l.status) === statusPill)
    return [...list].sort((a, b) => {
      if (a.is_vip !== b.is_vip) return a.is_vip ? -1 : 1
      return urgencyScore(a) - urgencyScore(b)
    })
  }, [baseLeads, statusPill])

  /* Pill counts */
  const pillCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseLeads.length, vip: 0 }
    for (const l of baseLeads) {
      const s = normalizeStatus(l.status)
      counts[s] = (counts[s] ?? 0) + 1
      if (l.is_vip) counts.vip++
    }
    return counts
  }, [baseLeads])

  const filteredStudents = useMemo(() =>
    students.filter(s => !q || `${s.full_name} ${s.phone_number ?? ''}`.toLowerCase().includes(q)),
  [students, q])

  const filteredArchived = useMemo(() =>
    archived.filter(l => !q || `${l.full_name} ${l.phone ?? ''}`.toLowerCase().includes(q)),
  [archived, q])

  const pendingPayCount  = payments.filter(p => p.payment_status === 'pending').length
  const followupCount    = overdue.length + todayFU.length
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v).length

  /* ── Bulk ────────────────────────────────────────────── */
  const allLeadIds = useMemo(() => visibleLeads.map(l => l.id), [visibleLeads])
  function toggleCheck(id: string) {
    setCheckedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  async function bulkStatus(status: LeadStatus) {
    setBulkBusy(true); await bulkPatchLeads([...checkedIds], { status })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkAssign(id: string | null) {
    setBulkBusy(true); await bulkPatchLeads([...checkedIds], { assigned_to_id: id })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkArchive() {
    setBulkBusy(true); await bulkArchiveLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkDelete() {
    if (!isFounder || !confirm(`حذف ${checkedIds.size} عميل؟`)) return
    setBulkBusy(true); await bulkSoftDeleteLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkMarkContacted() {
    setBulkBusy(true); await bulkPatchLeads([...checkedIds], { status: 'contacted' })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function approvePayment(id: string) {
    setPayBusy(id); await approveCrmPayment(id, staff.id); setPayBusy(null); refresh()
  }
  async function declinePayment(id: string) {
    setPayBusy(id); await declineCrmPayment(id); setPayBusy(null); refresh()
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f5]" dir="rtl">

      {/* ── Sticky header ──────────────────────────────── */}
      <header className="sticky top-16 z-10 bg-white border-b border-zinc-200">

        {/* Search + actions */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400 pointer-events-none" />
            <input
              type="search"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="w-full pr-9 pl-3 py-2 text-[14px] bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-semibold transition-colors flex-shrink-0',
              activeFilterCount > 0 ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white text-zinc-600 border-zinc-200',
            ].join(' ')}
          >
            <SlidersHorizontal size={14} />
            {activeFilterCount > 0 ? `(${activeFilterCount})` : 'فلاتر'}
          </button>
          <button type="button" onClick={refresh} disabled={loading}
            className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 flex-shrink-0">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* ── Loading ────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center flex-1 py-20">
          <Loader2 size={32} className="animate-spin text-zinc-300" />
        </div>
      )}

      {/* ═══════════════ LEADS TAB ═══════════════════════ */}
      {!loading && tab === 'leads' && (
        <div className="flex-1 flex flex-col">

          {/* Quick status pills */}
          <div className="bg-white border-b border-zinc-100 px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {STATUS_PILL_ORDER.map(pid => {
                const count = pillCounts[pid] ?? 0
                if (pid !== 'all' && pid !== 'vip' && count === 0) return null
                const isActive = statusPill === pid
                const label =
                  pid === 'all' ? 'الكل'
                  : pid === 'vip' ? '⭐ VIP'
                  : STATUS_AR[pid] ?? pid
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => setStatusPill(pid)}
                    className={[
                      'px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-black text-white border-black'
                        : pid !== 'all' && pid !== 'vip'
                          ? `${STATUS_PILL_COLOR[pid] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'} hover:opacity-80`
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200',
                    ].join(' ')}
                  >
                    {label}
                    {count > 0 && <span className="mr-1 opacity-70">({count})</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="px-4 py-4 flex-1">
            {/* Action bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[13px] text-zinc-500">
                <span>{visibleLeads.length} عميل</span>
                {visibleLeads.length > 0 && (
                  <button type="button"
                    onClick={() => setCheckedIds(checkedIds.size === allLeadIds.length ? new Set() : new Set(allLeadIds))}
                    className="text-zinc-400 hover:text-zinc-700 text-[12px] underline underline-offset-2">
                    {checkedIds.size === allLeadIds.length ? 'إلغاء الكل' : 'تحديد الكل'}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => router.push('/sales/leads/new')}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-bold text-[13px] rounded-xl hover:bg-yellow-300 transition-colors">
                <Plus size={14} /> إضافة عميل
              </button>
            </div>

            {visibleLeads.length === 0 && <Empty text="لا يوجد عملاء بهذه المعايير" />}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {visibleLeads.map(lead => (
                <LeadCardNew
                  key={lead.id}
                  lead={lead}
                  selected={checkedIds.has(lead.id)}
                  onSelect={toggleCheck}
                  onClick={l => setDrawerLead(l)}
                  assigneeName={staffMap.get(lead.assigned_to_id ?? '')?.email?.split('@')[0]}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ STUDENTS TAB ════════════════════ */}
      {!loading && tab === 'students' && (
        <div className="flex-1 px-4 py-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-zinc-100 p-3 text-center">
              <div className="text-[24px] font-black text-zinc-800">{students.length}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">إجمالي الطلاب</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
              <div className="text-[24px] font-black text-blue-700">{students.filter(s => s.student_type === 'course_student').length}</div>
              <div className="text-[11px] text-blue-500 mt-0.5">دورات جماعية</div>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-3 text-center">
              <div className="text-[24px] font-black text-purple-700">{students.filter(s => s.student_type === 'private_student').length}</div>
              <div className="text-[11px] text-purple-500 mt-0.5">دروس خاصة</div>
            </div>
          </div>

          {filteredStudents.length === 0 && <Empty text="لا يوجد طلاب" />}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredStudents.map(student => (
              <StudentCardNew
                key={student.id}
                student={student}
                onClick={s => router.push(`/sales/students/${s.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ PAYMENTS TAB ════════════════════ */}
      {!loading && tab === 'payments' && (
        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <div className="text-[11px] text-zinc-400 mb-1">إجمالي المقبوض</div>
              <div className="text-[20px] font-black text-emerald-700">
                {payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.amount_mad), 0).toLocaleString('en-US')}
                <span className="text-[12px] font-semibold text-zinc-400 mr-1">د.م</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 p-4">
              <div className="text-[11px] text-zinc-400 mb-1">بانتظار الموافقة</div>
              <div className="text-[20px] font-black text-amber-600">{payments.filter(p => p.payment_status === 'pending').length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 p-4">
              <div className="text-[11px] text-zinc-400 mb-1">إجمالي العمليات</div>
              <div className="text-[20px] font-black text-zinc-900">{payments.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-4">
              <div className="text-[11px] text-zinc-400 mb-1">مرفوض</div>
              <div className="text-[20px] font-black text-red-500">{payments.filter(p => p.payment_status === 'declined').length}</div>
            </div>
          </div>

          {/* Pending first */}
          {payments.filter(p => p.payment_status === 'pending').length > 0 && (
            <section>
              <div className="text-[12px] font-bold text-amber-600 mb-2">⏳ في انتظار الموافقة</div>
              <div className="space-y-3">
                {payments.filter(p => p.payment_status === 'pending').map(p => (
                  <PayRow key={p.id} p={p} leads={leads} payBusy={payBusy} onApprove={approvePayment} onDecline={declinePayment} onOpen={setDrawerLead} />
                ))}
              </div>
            </section>
          )}
          {payments.filter(p => p.payment_status === 'paid').length > 0 && (
            <section>
              <div className="text-[12px] font-bold text-green-700 mb-2 mt-4">✓ تم الدفع</div>
              <div className="space-y-3">
                {payments.filter(p => p.payment_status === 'paid').map(p => (
                  <PayRow key={p.id} p={p} leads={leads} payBusy={payBusy} onApprove={approvePayment} onDecline={declinePayment} onOpen={setDrawerLead} />
                ))}
              </div>
            </section>
          )}
          {payments.length === 0 && <Empty text="لا توجد مدفوعات" />}
        </div>
      )}

      {/* ═══════════════ FOLLOW-UPS TAB ══════════════════ */}
      {!loading && tab === 'followups' && (
        <div className="flex-1 px-4 py-4 space-y-6">
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-500" />
                <span className="font-bold text-[13px] text-red-600">متأخر عن الموعد ({overdue.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {overdue.map(l => {
                  const lead = leads.find(x => x.id === l.id)
                  return lead ? <LeadCardNew key={l.id} lead={lead} onClick={x => setDrawerLead(x)} /> : null
                })}
              </div>
            </section>
          )}
          {todayFU.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-orange-500" />
                <span className="font-bold text-[13px] text-orange-600">متابعة اليوم ({todayFU.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {todayFU.map(l => {
                  const lead = leads.find(x => x.id === l.id)
                  return lead ? <LeadCardNew key={l.id} lead={lead} onClick={x => setDrawerLead(x)} /> : null
                })}
              </div>
            </section>
          )}
          {overdue.length === 0 && todayFU.length === 0 && <Empty text="🎉 لا توجد متابعات معلقة اليوم" />}
        </div>
      )}

      {/* ═══════════════ ARCHIVE TAB ═════════════════════ */}
      {!loading && tab === 'archive' && (
        <div className="flex-1 px-4 py-4">
          <div className="text-[13px] text-zinc-400 mb-4">{filteredArchived.length} في الأرشيف</div>
          {filteredArchived.length === 0 && <Empty text="الأرشيف فارغ" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredArchived.map(lead => (
              <div key={lead.id} className="relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lead.deleted_at ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>
                    {lead.deleted_at ? 'محذوف' : 'مؤرشف'}
                  </span>
                </div>
                <LeadCardNew lead={lead} onClick={l => setDrawerLead(l)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Overlays & drawers ─────────────────────────── */}
      {tab === 'leads' && (
        <BulkBar count={checkedIds.size} onClear={() => setCheckedIds(new Set())}
          onStatus={bulkStatus} onAssign={bulkAssign} onArchive={bulkArchive}
          onDelete={bulkDelete} onMarkContacted={bulkMarkContacted}
          staff={staffList} isFounder={isFounder} busy={bulkBusy} />
      )}

      <UnifiedDetailDrawer lead={drawerLead} onClose={() => setDrawerLead(null)} onUpdated={refresh} isFounder={isFounder} />
      <StudentDrawer student={drawerStudent} onClose={() => setDrawerStudent(null)} onUpdated={refresh} isFounder={isFounder} />
      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters} staff={staffList} onReset={() => setFilters(EMPTY_FILTERS)} />
      {addOpen && <AddLeadModal onClose={() => setAddOpen(false)} onCreated={() => { setAddOpen(false); refresh() }} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   LEAD CARD — clean redesign
══════════════════════════════════════════════════════════ */
function LeadCardNew({
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
function StudentCardNew({ student, onClick }: { student: CrmStudent; onClick: (s: CrmStudent) => void }) {
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
function PayRow({
  p, leads, payBusy, onApprove, onDecline, onOpen,
}: {
  p: CrmPayment; leads: SubscriptionLead[]
  payBusy: string | null
  onApprove: (id: string) => void
  onDecline: (id: string) => void
  onOpen: (lead: SubscriptionLead) => void
}) {
  const info = PAY_STATUS_AR[p.payment_status]
  const lead = leads.find(l => l.id === p.lead_id)
  const name = lead?.full_name ?? 'طالب'

  async function downloadReceipt() {
    const r = await ensurePaymentReceipt({
      paymentId: p.id, leadId: p.lead_id, studentId: p.student_id,
      fullName: name, phoneNumber: lead?.phone, courseName: lead?.course ?? p.course_or_service,
      paymentType: p.payment_type, amountMad: Number(p.amount_mad),
      paymentDate: p.payment_date, notes: p.notes,
    })
    if (r) printReceipt(r)
  }
  async function sendReceipt() {
    const r = await ensurePaymentReceipt({
      paymentId: p.id, leadId: p.lead_id, studentId: p.student_id,
      fullName: name, phoneNumber: lead?.phone, courseName: lead?.course ?? p.course_or_service,
      paymentType: p.payment_type, amountMad: Number(p.amount_mad),
      paymentDate: p.payment_date, notes: p.notes,
    })
    if (r && lead?.phone) window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}?text=${buildReceiptWhatsAppMessage(r)}`, '_blank')
  }

  const typeAr = p.payment_type === 'course_one_time' ? 'دورة (دفعة واحدة)' : 'دروس خاصة (شهرية)'
  const methodAr: Record<string, string> = { cash: 'نقدًا', bank_transfer: 'تحويل بنكي', card: 'بطاقة', other: 'أخرى' }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar name={name} size={38} />
          <div className="min-w-0">
            <div className="font-bold text-[15px] truncate">{name}</div>
            <div className="text-[18px] font-black text-zinc-900 leading-tight">
              {Number(p.amount_mad).toLocaleString('en-US')}<span className="text-[11px] font-semibold text-zinc-400 mr-1">د.م</span>
            </div>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${info.cls}`}>{info.text}</span>
      </div>

      {/* Detail chips */}
      <div className="flex flex-wrap gap-1.5 mb-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{typeAr}</span>
        {(p as any).payment_method && <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{methodAr[(p as any).payment_method] ?? (p as any).payment_method}</span>}
        {(lead?.course || p.course_or_service) && <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">{(lead?.course ?? p.course_or_service ?? '').toUpperCase()}</span>}
        {p.payment_date && <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{new Date(p.payment_date).toLocaleDateString('ar-MA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
      </div>
      {p.notes && <div className="text-[12px] text-zinc-400 mb-2">📝 {p.notes}</div>}

      {p.payment_status === 'pending' && (
        <div className="flex gap-2 pt-2 border-t border-zinc-50">
          <button type="button" onClick={() => onApprove(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
            {payBusy === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} قبول
          </button>
          <button type="button" onClick={() => onDecline(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1 text-[13px] px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
            <XCircle size={12} /> رفض
          </button>
          {lead && (
            <button type="button" onClick={() => onOpen(lead)}
              className="text-[13px] px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50">الملف</button>
          )}
        </div>
      )}

      {p.payment_status === 'paid' && (
        <div className="flex gap-2 pt-2 border-t border-zinc-50">
          <button type="button" onClick={downloadReceipt}
            className="flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800">
            <Printer size={12} /> تحميل الوصل
          </button>
          {lead?.phone && (
            <button type="button" onClick={sendReceipt}
              className="flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
              <MessageCircle size={12} /> إرسال الوصل
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────── */
function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-zinc-400">
      <div className="text-4xl mb-3">📭</div>
      <div className="text-[14px]">{text}</div>
    </div>
  )
}
