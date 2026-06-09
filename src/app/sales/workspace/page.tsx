'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, RefreshCw, Plus,
  Users, GraduationCap, CreditCard, CalendarClock,
  Archive, CheckCircle, XCircle,
  AlertTriangle, Clock, Loader2,
} from 'lucide-react'

import {
  fetchAllLeads, fetchArchivedLeads, normalizeStatus,
  bulkPatchLeads, bulkArchiveLeads, bulkSoftDeleteLeads,
  type SubscriptionLead, type LeadStatus,
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

/* ── Arabic labels ─────────────────────────────────────── */
const PAY_STATUS_AR: Record<string, { text: string; cls: string }> = {
  pending:  { text: 'معلق',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid:     { text: 'مدفوع',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  declined: { text: 'مرفوض', cls: 'bg-red-50 text-red-700 border border-red-200' },
}

/* ── Tab definition ────────────────────────────────────── */
type WorkspaceTab = 'leads' | 'students' | 'payments' | 'followups' | 'archive'

const TABS: { id: WorkspaceTab; labelAr: string; icon: React.ElementType }[] = [
  { id: 'leads',     labelAr: 'العملاء',    icon: Users         },
  { id: 'students',  labelAr: 'الطلاب',     icon: GraduationCap  },
  { id: 'payments',  labelAr: 'المدفوعات',  icon: CreditCard     },
  { id: 'followups', labelAr: 'المتابعات',   icon: CalendarClock  },
  { id: 'archive',   labelAr: 'الأرشيف',    icon: Archive        },
]

const EMPTY_FILTERS: FilterState = { status: '', source: '', course: '', assignee: '', search: '' }

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function WorkspacePage() {
  const staff     = useStaff()
  const isFounder = staff.role === 'founder'
  const sp        = useSearchParams()
  const router    = useRouter()

  /* Derive active tab from URL ?tab= param */
  const urlTab = sp?.get('tab') as WorkspaceTab | null
  const [tab, setTab] = useState<WorkspaceTab>(
    urlTab && TABS.some(t => t.id === urlTab) ? urlTab : 'leads'
  )

  /* Sync tab when URL changes (sidebar links set ?tab=) */
  useEffect(() => {
    const t = sp?.get('tab') as WorkspaceTab | null
    if (t && TABS.some(x => x.id === t)) setTab(t)
    else if (!t) setTab('leads')
  }, [sp])

  /* ── Data ──────────────────────────────────────── */
  const [leads,    setLeads]    = useState<SubscriptionLead[]>([])
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [payments, setPayments] = useState<CrmPayment[]>([])
  const [overdue,  setOverdue]  = useState<OverdueLead[]>([])
  const [todayFU,  setTodayFU]  = useState<OverdueLead[]>([])
  const [archived, setArchived] = useState<SubscriptionLead[]>([])
  const [staffList,setStaffList]= useState<StaffRow[]>([])
  const [loading,  setLoading]  = useState(true)

  /* ── UI state ──────────────────────────────────── */
  const [filters,    setFilters]    = useState<FilterState>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [drawerLead, setDrawerLead] = useState<SubscriptionLead | null>(null)
  const [addOpen,    setAddOpen]    = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [bulkBusy,   setBulkBusy]   = useState(false)
  const [payBusy,    setPayBusy]    = useState<string | null>(null)

  const staffMap = useMemo(
    () => new Map(staffList.map(s => [s.id, s])),
    [staffList]
  )

  /* ── Initial load ──────────────────────────────── */
  useEffect(() => {
    if (sp?.get('add') === '1') {
      setAddOpen(true)
      router.replace('/sales/workspace')
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
    setOverdue(od); setTodayFU(td); setArchived(ar)
    setStaffList(sf)
    setLoading(false)
  }

  function refresh() { setCheckedIds(new Set()); loadAll() }

  /* ── Filtered data ─────────────────────────────── */
  const filteredLeads = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return leads.filter(l => {
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
    })
  }, [leads, filters])

  const filteredStudents = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return students.filter(s => {
      if (!q) return true
      const hay = `${s.full_name} ${s.phone_number ?? ''} ${s.course ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [students, filters])

  const filteredArchived = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return archived.filter(l => {
      if (!q) return true
      return `${l.full_name} ${l.phone ?? ''}`.toLowerCase().includes(q)
    })
  }, [archived, filters])

  const pendingPayCount  = payments.filter(p => p.payment_status === 'pending').length
  const followupCount    = overdue.length + todayFU.length
  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'search' && v).length

  /* ── Bulk actions ──────────────────────────────── */
  const allLeadIds = useMemo(() => filteredLeads.map(l => l.id), [filteredLeads])

  function toggleCheck(id: string) {
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  async function bulkStatus(status: LeadStatus) {
    if (!checkedIds.size) return
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { status })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkAssign(id: string | null) {
    if (!checkedIds.size) return
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { assigned_to_id: id })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkArchive() {
    if (!checkedIds.size) return
    setBulkBusy(true)
    await bulkArchiveLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkDelete() {
    if (!checkedIds.size || !isFounder) return
    if (!confirm(`حذف ${checkedIds.size} عميل؟`)) return
    setBulkBusy(true)
    await bulkSoftDeleteLeads([...checkedIds], staff.id)
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkMarkContacted() {
    if (!checkedIds.size) return
    setBulkBusy(true)
    await bulkPatchLeads([...checkedIds], { status: 'contacted' })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }

  /* ── Payment actions ───────────────────────────── */
  async function approvePayment(id: string) {
    setPayBusy(id); await approveCrmPayment(id, staff.id); setPayBusy(null); refresh()
  }
  async function declinePayment(id: string) {
    setPayBusy(id); await declineCrmPayment(id); setPayBusy(null); refresh()
  }

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0" dir="rtl">

      {/* ── Sticky header ─────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-100 shadow-sm">

        {/* Search + actions row */}
        <div className="flex items-center gap-2 px-4 lg:px-6 py-3">
          {/* Search — icon on right (RTL start) */}
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400 pointer-events-none"
            />
            <input
              type="search"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="w-full pr-9 pl-3 py-2.5 text-[14px] bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white text-right"
              dir="rtl"
            />
          </div>

          {/* Filter button */}
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
            {activeFilterCount > 0 ? `(${activeFilterCount})` : 'فلاتر'}
          </button>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors flex-shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tabs — scrollable, right-to-left */}
        <div className="flex border-t border-zinc-100 overflow-x-auto" style={{ direction: 'rtl' }}>
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
                onClick={() => {
                  setTab(t.id)
                  setCheckedIds(new Set())
                  router.replace(`/sales/workspace${t.id !== 'leads' ? `?tab=${t.id}` : ''}`, { scroll: false })
                }}
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

      {/* ── Content ───────────────────────────────── */}
      <main className="flex-1 px-4 lg:px-6 py-4">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-zinc-300" />
          </div>
        )}

        {/* ══ LEADS ══ */}
        {!loading && tab === 'leads' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[13px] text-zinc-400">
                <span>{filteredLeads.length} عميل</span>
                {filteredLeads.length > 0 && (
                  <button
                    onClick={() => checkedIds.size === allLeadIds.length
                      ? setCheckedIds(new Set())
                      : setCheckedIds(new Set(allLeadIds))
                    }
                    className="text-zinc-400 hover:text-zinc-700 font-semibold text-[12px]"
                  >
                    {checkedIds.size === allLeadIds.length ? 'إلغاء الكل' : 'تحديد الكل'}
                  </button>
                )}
              </div>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300"
              >
                <Plus size={14} /> إضافة عميل
              </button>
            </div>

            {filteredLeads.length === 0 && <EmptyState text="لا يوجد عملاء بهذه المعايير" />}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredLeads.map(lead => (
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
          </div>
        )}

        {/* ══ STUDENTS ══ */}
        {!loading && tab === 'students' && (
          <div className="space-y-3">
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

        {/* ══ PAYMENTS ══ */}
        {!loading && tab === 'payments' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'paid', 'declined'] as const).map(s => {
                const cnt  = payments.filter(p => p.payment_status === s).length
                const info = PAY_STATUS_AR[s]
                return (
                  <div key={s} className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${info.cls}`}>
                    {info.text} ({cnt})
                  </div>
                )
              })}
            </div>

            {payments.length === 0 && <EmptyState text="لا توجد مدفوعات" />}

            <div className="space-y-3">
              {payments.map(p => {
                const isBusy = payBusy === p.id
                const info   = PAY_STATUS_AR[p.payment_status]
                const lead   = leads.find(l => l.id === p.lead_id)
                return (
                  <div key={p.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-[15px] text-zinc-900">
                          {lead?.full_name ?? 'طالب'}
                        </div>
                        <div className="text-[13px] text-zinc-500 mt-0.5">
                          {Number(p.amount_mad).toLocaleString('ar-MA')} درهم
                          {p.payment_date && ` · ${new Date(p.payment_date).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        </div>
                        {p.notes && <div className="text-[12px] text-zinc-400 mt-1">{p.notes}</div>}
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${info.cls}`}>
                        {info.text}
                      </span>
                    </div>

                    {p.payment_status === 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-50">
                        <button
                          onClick={() => approvePayment(p.id)}
                          disabled={!!payBusy}
                          className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                        >
                          {isBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                          قبول
                        </button>
                        <button
                          onClick={() => declinePayment(p.id)}
                          disabled={!!payBusy}
                          className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <XCircle size={13} /> رفض
                        </button>
                        {lead && (
                          <button
                            onClick={() => setDrawerLead(lead)}
                            className="flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                          >
                            عرض الملف
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ FOLLOW-UPS ══ */}
        {!loading && tab === 'followups' && (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-red-500" />
                  <span className="text-[13px] font-bold text-red-600">متأخر ({overdue.length})</span>
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
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={15} className="text-orange-500" />
                  <span className="text-[13px] font-bold text-orange-600">اليوم ({todayFU.length})</span>
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

        {/* ══ ARCHIVE ══ */}
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

      {/* ── Bulk actions ─────────────────────────── */}
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

      {/* ── Drawers & modals ─────────────────────── */}
      <UnifiedDetailDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onUpdated={refresh}
        isFounder={isFounder}
      />

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        staff={staffList}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {addOpen && (
        <AddLeadModal
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); refresh() }}
        />
      )}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
      <div className="text-4xl mb-3">📭</div>
      <div className="text-[14px] font-medium">{text}</div>
    </div>
  )
}
