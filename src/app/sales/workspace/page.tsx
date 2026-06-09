'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, RefreshCw, Plus,
  Users, GraduationCap, CreditCard, CalendarClock,
  Archive, CheckCircle, XCircle,
  AlertTriangle, Clock, Loader2, ChevronDown, ChevronRight,
} from 'lucide-react'

import {
  fetchAllLeads, fetchArchivedLeads, normalizeStatus,
  bulkPatchLeads, bulkArchiveLeads, bulkSoftDeleteLeads,
  type SubscriptionLead, type LeadStatus,
  LEAD_STATUS_META,
} from '@/lib/leads-db'
import {
  fetchStudents, fetchCrmPayments, approveCrmPayment, declineCrmPayment,
} from '@/lib/crm-db'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import { fetchOverdueFollowUps, fetchTodaysFollowUps, type OverdueLead } from '@/lib/crm-stats'
import { fetchStaff, type StaffRow } from '@/lib/staff-db'
import { useStaff } from '@/lib/staff-context'

import LeadCard from './LeadCard'
import StudentCard from './StudentCard'
import UnifiedDetailDrawer from './UnifiedDetailDrawer'
import FilterDrawer, { type FilterState } from './FilterDrawer'
import BulkBar from './BulkBar'
import AddLeadModal from '@/app/sales/leads/AddLeadModal'

/* ── Types / constants ─────────────────────────────────────── */
type WorkspaceTab = 'leads' | 'students' | 'payments' | 'followups' | 'archive'

const TABS: { id: WorkspaceTab; labelAr: string; icon: React.ElementType }[] = [
  { id: 'leads',     labelAr: 'العملاء',   icon: Users         },
  { id: 'students',  labelAr: 'الطلاب',    icon: GraduationCap  },
  { id: 'payments',  labelAr: 'المدفوعات', icon: CreditCard     },
  { id: 'followups', labelAr: 'المتابعات',  icon: CalendarClock  },
  { id: 'archive',   labelAr: 'الأرشيف',   icon: Archive        },
]

/* Status groups shown in the Leads tab — order matters */
const STATUS_GROUPS: {
  id:      string
  labelAr: string
  color:   string   // header left-border + badge bg
  filter:  (l: SubscriptionLead) => boolean
}[] = [
  {
    id: 'vip',
    labelAr: 'VIP ⭐',
    color: 'border-rose-400 bg-rose-50',
    filter: l => !!l.is_vip && !['paid','cancelled','converted','rejected'].includes(normalizeStatus(l.status)),
  },
  {
    id: 'confirmed',
    labelAr: 'مؤكد',
    color: 'border-emerald-400 bg-emerald-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'confirmed',
  },
  {
    id: 'delayed',
    labelAr: 'متأخر / وعد بالدفع',
    color: 'border-amber-400 bg-amber-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'delayed',
  },
  {
    id: 'follow_up',
    labelAr: 'متابعة',
    color: 'border-orange-400 bg-orange-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'follow_up',
  },
  {
    id: 'interested',
    labelAr: 'مهتم',
    color: 'border-purple-400 bg-purple-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'interested',
  },
  {
    id: 'contacted',
    labelAr: 'تم التواصل',
    color: 'border-blue-400 bg-blue-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'contacted',
  },
  {
    id: 'new',
    labelAr: 'جديد',
    color: 'border-zinc-300 bg-zinc-50',
    filter: l => !l.is_vip && normalizeStatus(l.status) === 'new',
  },
  {
    id: 'paid',
    labelAr: 'دفع ✓',
    color: 'border-yellow-400 bg-yellow-50',
    filter: l => !l.is_vip && (normalizeStatus(l.status) === 'paid' || normalizeStatus(l.status) === 'converted'),
  },
  {
    id: 'cancelled',
    labelAr: 'ملغي',
    color: 'border-gray-200 bg-gray-50',
    filter: l => !l.is_vip && (normalizeStatus(l.status) === 'cancelled' || normalizeStatus(l.status) === 'rejected'),
  },
]

const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50   text-red-700   border border-red-200'   },
}

const EMPTY_FILTERS: FilterState = { status: '', source: '', course: '', assignee: '', search: '' }

/* Read tab from URL without useSearchParams — avoids hydration mismatch. */
function getTabFromUrl(): WorkspaceTab {
  if (typeof window === 'undefined') return 'leads'
  const t = new URLSearchParams(window.location.search).get('tab') as WorkspaceTab | null
  return t && TABS.some(x => x.id === t) ? t : 'leads'
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function WorkspacePage() {
  const staff     = useStaff()
  const isFounder = staff.role === 'founder'
  const router    = useRouter()

  /* Tab: initialise from URL after mount, listen for popstate */
  const [tab, setTab] = useState<WorkspaceTab>('leads')
  useEffect(() => {
    setTab(getTabFromUrl())
    const onPop = () => setTab(getTabFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function switchTab(t: WorkspaceTab) {
    setTab(t)
    setCheckedIds(new Set())
    const url = t === 'leads' ? '/sales/workspace' : `/sales/workspace?tab=${t}`
    router.replace(url, { scroll: false })
  }

  /* ── Data ──────────────────────────────────────────────── */
  const [leads,    setLeads]    = useState<SubscriptionLead[]>([])
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [overdue,  setOverdue]  = useState<OverdueLead[]>([])
  const [todayFU,  setTodayFU]  = useState<OverdueLead[]>([])
  const [archived, setArchived] = useState<SubscriptionLead[]>([])
  const [staffList,setStaffList]= useState<StaffRow[]>([])
  const [loading,  setLoading]  = useState(true)

  /* ── UI ────────────────────────────────────────────────── */
  const [filters,    setFilters]    = useState<FilterState>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [drawerLead, setDrawerLead] = useState<SubscriptionLead | null>(null)
  const [addOpen,    setAddOpen]    = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [bulkBusy,   setBulkBusy]   = useState(false)
  const [payBusy,    setPayBusy]    = useState<string | null>(null)
  /* Which status groups are collapsed */
  const [collapsed,  setCollapsed]  = useState<Set<string>>(new Set(['paid', 'cancelled']))

  const staffMap = useMemo(
    () => new Map(staffList.map(s => [s.id, s])),
    [staffList]
  )

  /* ── Load ──────────────────────────────────────────────── */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('add') === '1') {
      setAddOpen(true)
      router.replace('/sales/workspace', { scroll: false })
    }
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [l, s, p, od, td, ar, sf] = await Promise.all([
      fetchAllLeads(),
      fetchStudents(),
      fetchCrmPayments({ limit: 100 }),
      fetchOverdueFollowUps(isFounder ? undefined : staff.id),
      fetchTodaysFollowUps(isFounder ? undefined : staff.id),
      fetchArchivedLeads(),
      fetchStaff(),
    ])
    setLeads(l); setStudents(s); setPayments(p)
    setOverdue(od); setTodayFU(td); setArchived(ar); setStaffList(sf)
    setLoading(false)
  }
  function refresh() { setCheckedIds(new Set()); loadAll() }

  /* ── Filtered data ─────────────────────────────────────── */
  const q = filters.search.trim().toLowerCase()

  const filteredLeads = useMemo(() => leads.filter(l => {
    const st = normalizeStatus(l.status)
    if (filters.status   && st !== filters.status) return false
    if (filters.source   && (l.lead_source ?? l.source) !== filters.source) return false
    if (filters.course   && l.course !== filters.course) return false
    if (filters.assignee && l.assigned_to_id !== filters.assignee) return false
    if (q) {
      const hay = `${l.full_name} ${l.phone ?? ''} ${l.course ?? ''} ${l.city ?? ''}`.toLowerCase()
      return hay.includes(q)
    }
    return true
  }), [leads, filters, q])

  const filteredStudents = useMemo(() => students.filter(s => {
    if (!q) return true
    return `${s.full_name} ${s.phone_number ?? ''} ${s.course ?? ''}`.toLowerCase().includes(q)
  }), [students, q])

  const filteredArchived = useMemo(() => archived.filter(l => {
    if (!q) return true
    return `${l.full_name} ${l.phone ?? ''}`.toLowerCase().includes(q)
  }), [archived, q])

  /* ── Status groups (Leads tab) ─────────────────────────── */
  const statusGroups = useMemo(() =>
    STATUS_GROUPS
      .map(g => ({ ...g, leads: filteredLeads.filter(g.filter) }))
      .filter(g => g.leads.length > 0),
  [filteredLeads])

  /* ── Counts ────────────────────────────────────────────── */
  const pendingPayCount  = payments.filter(p => p.payment_status === 'pending').length
  const followupCount    = overdue.length + todayFU.length
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v).length

  /* ── Bulk actions ──────────────────────────────────────── */
  const allLeadIds = useMemo(() => filteredLeads.map(l => l.id), [filteredLeads])
  function toggleCheck(id: string) {
    setCheckedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  async function bulkStatus(status: LeadStatus) {
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { status })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkAssign(id: string | null) {
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { assigned_to_id: id })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkArchive() {
    setBulkBusy(true)
    await bulkArchiveLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkDelete() {
    if (!isFounder || !confirm(`حذف ${checkedIds.size} عميل؟`)) return
    setBulkBusy(true)
    await bulkSoftDeleteLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkMarkContacted() {
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { status: 'contacted' })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }

  /* ── Payment actions ───────────────────────────────────── */
  async function approvePayment(id: string) {
    setPayBusy(id); await approveCrmPayment(id, staff.id); setPayBusy(null); refresh()
  }
  async function declinePayment(id: string) {
    setPayBusy(id); await declineCrmPayment(id); setPayBusy(null); refresh()
  }

  /* ── Toggle group collapse ─────────────────────────────── */
  function toggleGroup(id: string) {
    setCollapsed(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0" dir="rtl">

      {/* ── Sticky header ─────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-100 shadow-sm">

        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 lg:px-6 py-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400 pointer-events-none" />
            <input
              type="search"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="w-full pr-9 pl-3 py-2.5 text-[14px] bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-right"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className={[
              'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition-colors flex-shrink-0',
              activeFilterCount > 0
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400',
            ].join(' ')}
          >
            <SlidersHorizontal size={14} />
            {activeFilterCount > 0 ? `فلاتر (${activeFilterCount})` : 'فلاتر'}
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors flex-shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-zinc-100 overflow-x-auto">
          {TABS.map(t => {
            const isActive = tab === t.id
            const badge =
              t.id === 'payments'  ? pendingPayCount
              : t.id === 'followups' ? followupCount
              : t.id === 'archive'   ? archived.length
              : t.id === 'leads'     ? filteredLeads.length
              : t.id === 'students'  ? filteredStudents.length
              : 0
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={[
                  'flex items-center gap-1.5 px-4 lg:px-5 py-3 text-[13px] font-semibold whitespace-nowrap',
                  'border-b-2 transition-colors flex-shrink-0',
                  isActive
                    ? 'border-yellow-400 text-zinc-900 bg-yellow-50/40'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700',
                ].join(' ')}
              >
                <t.icon size={14} />
                {t.labelAr}
                {badge > 0 && (
                  <span className={[
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                    t.id === 'payments' && pendingPayCount > 0  ? 'bg-amber-400 text-black'
                    : t.id === 'followups' && followupCount > 0 ? 'bg-red-500 text-white'
                    : 'bg-zinc-100 text-zinc-600',
                  ].join(' ')}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="flex-1 px-4 lg:px-6 py-5">

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-zinc-300" />
          </div>
        )}

        {/* ══════════════════ LEADS TAB ══════════════════ */}
        {!loading && tab === 'leads' && (
          <div className="space-y-1">
            {/* Top action bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[13px] text-zinc-500">
                <span className="font-medium">{filteredLeads.length} عميل محتمل</span>
                {filteredLeads.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      checkedIds.size === allLeadIds.length
                        ? setCheckedIds(new Set())
                        : setCheckedIds(new Set(allLeadIds))
                    }
                    className="text-zinc-400 hover:text-zinc-700 font-semibold text-[12px] underline underline-offset-2"
                  >
                    {checkedIds.size === allLeadIds.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300 transition-colors"
              >
                <Plus size={14} /> إضافة عميل
              </button>
            </div>

            {filteredLeads.length === 0 && <EmptyState text="لا يوجد عملاء بهذه المعايير" />}

            {/* Status groups */}
            {statusGroups.map(group => {
              const isCollapsed = collapsed.has(group.id)
              const borderColor = group.color.split(' ')[0]
              const bgColor     = group.color.split(' ')[1]
              return (
                <div key={group.id} className="mb-5">
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-r-4 ${borderColor} ${bgColor} mb-3 hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed
                        ? <ChevronRight size={16} className="text-zinc-500" />
                        : <ChevronDown  size={16} className="text-zinc-500" />
                      }
                      <span className="font-bold text-[14px] text-zinc-800">{group.labelAr}</span>
                      <span className="bg-white/70 text-zinc-700 font-bold text-[12px] px-2 py-0.5 rounded-full">
                        {group.leads.length}
                      </span>
                    </div>
                    {/* Quick stats */}
                    <div className="text-[12px] text-zinc-500 font-medium hidden sm:block">
                      {group.leads.filter(l => l.next_followup_at && l.next_followup_at.slice(0,10) < new Date().toISOString().slice(0,10)).length > 0 && (
                        <span className="text-red-500 font-bold">
                          {group.leads.filter(l => l.next_followup_at && l.next_followup_at.slice(0,10) < new Date().toISOString().slice(0,10)).length} متأخر
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Cards grid */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {group.leads.map(lead => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          selected={checkedIds.has(lead.id)}
                          onSelect={toggleCheck}
                          onClick={l => setDrawerLead(l)}
                          staffName={staffMap.get(lead.assigned_to_id ?? '')?.email?.split('@')[0]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════ STUDENTS TAB ══════════════════ */}
        {!loading && tab === 'students' && (
          <div className="space-y-4">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              <StatCard label="إجمالي الطلاب" value={students.length} color="bg-zinc-50" />
              <StatCard label="دورات جماعية" value={students.filter(s => s.student_type === 'course_student').length} color="bg-blue-50" />
              <StatCard label="دروس خاصة" value={students.filter(s => s.student_type === 'private_student').length} color="bg-purple-50" />
            </div>

            <div className="text-[13px] text-zinc-400">{filteredStudents.length} طالب</div>
            {filteredStudents.length === 0 && <EmptyState text="لا يوجد طلاب" />}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={s => {
                    if (s.lead_id) {
                      const lead = leads.find(l => l.id === s.lead_id)
                      if (lead) setDrawerLead(lead)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════ PAYMENTS TAB ══════════════════ */}
        {!loading && tab === 'payments' && (
          <div className="space-y-4">
            {/* Summary pills */}
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'paid', 'declined'] as const).map(s => {
                const cnt  = payments.filter(p => p.payment_status === s).length
                const info = PAY_STATUS_AR[s]
                return (
                  <div key={s} className={`text-[13px] font-bold px-4 py-2 rounded-xl ${info.cls}`}>
                    {info.text} ({cnt})
                  </div>
                )
              })}
            </div>

            {payments.length === 0 && <EmptyState text="لا توجد مدفوعات" />}

            {/* Pending first */}
            {payments.filter(p => p.payment_status === 'pending').length > 0 && (
              <section>
                <h3 className="text-[12px] font-bold text-amber-700 mb-2 px-1">⏳ في انتظار الموافقة</h3>
                <div className="space-y-3">
                  {payments.filter(p => p.payment_status === 'pending').map(p => (
                    <PaymentRow key={p.id} p={p} leads={leads} payBusy={payBusy} onApprove={approvePayment} onDecline={declinePayment} onOpen={setDrawerLead} />
                  ))}
                </div>
              </section>
            )}

            {payments.filter(p => p.payment_status === 'paid').length > 0 && (
              <section>
                <h3 className="text-[12px] font-bold text-green-700 mb-2 px-1 mt-4">✓ تم الدفع</h3>
                <div className="space-y-3">
                  {payments.filter(p => p.payment_status === 'paid').map(p => (
                    <PaymentRow key={p.id} p={p} leads={leads} payBusy={payBusy} onApprove={approvePayment} onDecline={declinePayment} onOpen={setDrawerLead} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ══════════════════ FOLLOW-UPS TAB ══════════════════ */}
        {!loading && tab === 'followups' && (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <AlertTriangle size={15} className="text-red-500" />
                  <span className="text-[13px] font-bold text-red-600">متأخر عن الموعد ({overdue.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {overdue.map(l => {
                    const lead = leads.find(x => x.id === l.id)
                    return lead ? <LeadCard key={l.id} lead={lead} onClick={x => setDrawerLead(x)} /> : null
                  })}
                </div>
              </section>
            )}

            {todayFU.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Clock size={15} className="text-orange-500" />
                  <span className="text-[13px] font-bold text-orange-600">متابعة اليوم ({todayFU.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {todayFU.map(l => {
                    const lead = leads.find(x => x.id === l.id)
                    return lead ? <LeadCard key={l.id} lead={lead} onClick={x => setDrawerLead(x)} /> : null
                  })}
                </div>
              </section>
            )}

            {overdue.length === 0 && todayFU.length === 0 && (
              <EmptyState text="🎉 لا توجد متابعات معلقة اليوم" />
            )}
          </div>
        )}

        {/* ══════════════════ ARCHIVE TAB ══════════════════ */}
        {!loading && tab === 'archive' && (
          <div className="space-y-3">
            <div className="text-[13px] text-zinc-400">{filteredArchived.length} في الأرشيف</div>
            {filteredArchived.length === 0 && <EmptyState text="الأرشيف فارغ" />}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredArchived.map(lead => (
                <div key={lead.id} className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <span className={[
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      lead.deleted_at ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-500',
                    ].join(' ')}>
                      {lead.deleted_at ? 'محذوف' : 'مؤرشف'}
                    </span>
                  </div>
                  <LeadCard lead={lead} onClick={l => setDrawerLead(l)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Bulk bar ──────────────────────────────────────── */}
      {tab === 'leads' && (
        <BulkBar
          count={checkedIds.size}
          onClear={() => setCheckedIds(new Set())}
          onStatus={bulkStatus}
          onAssign={bulkAssign}
          onArchive={bulkArchive}
          onDelete={bulkDelete}
          onMarkContacted={bulkMarkContacted}
          staff={staffList}
          isFounder={isFounder}
          busy={bulkBusy}
        />
      )}

      {/* ── Detail drawer ─────────────────────────────────── */}
      <UnifiedDetailDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onUpdated={refresh}
        isFounder={isFounder}
      />

      {/* ── Filter drawer ─────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        staff={staffList}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {/* ── Add lead modal ────────────────────────────────── */}
      {addOpen && (
        <AddLeadModal
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); refresh() }}
        />
      )}
    </div>
  )
}

/* ── Reusable sub-components ─────────────────────────────── */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
      <div className="text-4xl mb-3">📭</div>
      <div className="text-[14px] font-medium">{text}</div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center border border-zinc-100`}>
      <div className="text-[22px] font-black text-zinc-800">{value}</div>
      <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}

function PaymentRow({
  p, leads, payBusy, onApprove, onDecline, onOpen,
}: {
  p:         CrmPayment
  leads:     SubscriptionLead[]
  payBusy:   string | null
  onApprove: (id: string) => void
  onDecline: (id: string) => void
  onOpen:    (lead: SubscriptionLead) => void
}) {
  const isBusy = payBusy === p.id
  const info   = PAY_STATUS_AR[p.payment_status]
  const lead   = leads.find(l => l.id === p.lead_id)
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="font-bold text-[15px] text-zinc-900">{lead?.full_name ?? 'طالب'}</div>
          <div className="text-[13px] text-zinc-500 mt-0.5">
            {Number(p.amount_mad).toLocaleString('ar-MA')} درهم
            {p.payment_date && ` · ${new Date(p.payment_date).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}`}
          </div>
          {p.notes && <div className="text-[12px] text-zinc-400 mt-1">{p.notes}</div>}
        </div>
        <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${info.cls}`}>{info.text}</span>
      </div>
      {p.payment_status === 'pending' && (
        <div className="flex gap-2 pt-2 border-t border-zinc-50">
          <button type="button" onClick={() => onApprove(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            قبول
          </button>
          <button type="button" onClick={() => onDecline(p.id)} disabled={!!payBusy}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
            <XCircle size={13} /> رفض
          </button>
          {lead && (
            <button type="button" onClick={() => onOpen(lead)}
              className="text-[13px] px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
              الملف
            </button>
          )}
        </div>
      )}
    </div>
  )
}
