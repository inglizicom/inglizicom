'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, RefreshCw, Plus, AlertTriangle, Clock, Loader2, MessageCircle, Printer,
  Trash2, RotateCcw,
} from 'lucide-react'

import {
  fetchAllLeads, fetchArchivedLeads, normalizeStatus, bulkPatchLeads, bulkArchiveLeads,
  bulkDeleteLeads, type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import {
  fetchStudents, fetchCrmPayments, approveCrmPayment, declineCrmPayment, convertLeadToStudent,
  archiveStudent, unarchiveStudent, softDeleteStudent, restoreStudent, permanentDeleteStudent,
  fetchDeletedStudents,
} from '@/lib/crm-db'
import AddStudentModal from './AddStudentModal'
import { fetchEngagement, daysInactive, type Engagement } from '@/lib/student-portal'
import { updateLeadStatus } from '@/lib/leads-db'
import { type CrmStudent, type CrmPayment } from '@/lib/crm-types'
import { fetchOverdueFollowUps, fetchTodaysFollowUps, type OverdueLead } from '@/lib/crm-stats'
import { fetchStaff, type StaffRow } from '@/lib/staff-db'
import { useStaff } from '@/lib/staff-context'
import { markLeadsSeen } from '@/lib/leads-seen'

import Avatar from '@/app/sales/_components/Avatar'
import DuesBoard from '@/components/DuesBoard'
import CertReadyBoard from '@/components/CertReadyBoard'
import UnifiedDetailDrawer from './UnifiedDetailDrawer'
import StudentDrawer from './StudentDrawer'
import FilterDrawer, { type FilterState } from './FilterDrawer'
import BulkBar from './BulkBar'
import AddLeadModal from '@/app/sales/leads/AddLeadModal'
import {
  STATUS_AR, STATUS_PILL_COLOR, STATUS_PILL_ORDER, isOverdueLead, isTodayLead, isFreshLead, LEAD_SORTS,
  PAY_STATUS_AR, TABS, EMPTY_FILTERS, LeadList, LeadCardNew, StudentList, PAY_METHOD_AR,
  resolvePayment, PayRow, Empty, type SmartPill, type LeadSort, type WorkspaceTab, emitReceipt,
} from './_parts'

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
  const [smartPill,    setSmartPill]    = useState<SmartPill>('')      // needs-action shortcuts
  const [mineOnly,     setMineOnly]     = useState(false)              // only leads assigned to me
  const [leadSort,     setLeadSort]     = useState<LeadSort>('newest')
  /* Students: add modal + bin */
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [showBin,        setShowBin]        = useState(false)
  const [binStudents,    setBinStudents]    = useState<CrmStudent[]>([])
  const [engagement,     setEngagement]     = useState<Map<string, Engagement>>(new Map())
  const [onlyInactive,   setOnlyInactive]   = useState(false)
  const INACTIVE_DAYS = 7

  async function loadBin() { setBinStudents(await fetchDeletedStudents()) }
  async function onArchiveStudent(s: CrmStudent) {
    if (!confirm(`أرشفة الطالب "${s.full_name}"؟ (يبقى مسجّلًا لكن تُستبعد إيراداته)`)) return
    await archiveStudent(s.id); refresh()
  }
  async function onRemoveStudent(s: CrmStudent) {
    if (!confirm(`نقل "${s.full_name}" إلى سلة المحذوفات؟ يمكن استرجاعه بسجلّه كاملًا.`)) return
    await softDeleteStudent(s.id, staff.id); refresh()
  }
  async function onRestoreStudent(s: CrmStudent) {
    await restoreStudent(s.id); await loadBin(); refresh()
  }
  async function onPurgeStudent(s: CrmStudent) {
    if (!isFounder || !confirm(`حذف "${s.full_name}" نهائيًا؟ لا يمكن التراجع.`)) return
    await permanentDeleteStudent(s.id); await loadBin()
  }

  const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList])
  const studentLeadIds = useMemo(() => new Set(students.map(s => s.lead_id).filter(Boolean) as string[]), [students])
  const studentById    = useMemo(() => new Map(students.map(s => [s.id, s])), [students])
  const [payFilter, setPayFilter] = useState<'all' | 'paid' | 'pending' | 'declined'>('all')

  /* ── Load ─────────────────────────────────────────────── */
  useEffect(() => {
    if (sp.get('add') === '1') {
      setAddOpen(true)
      router.replace('/sales/workspace', { scroll: false })
    }
    loadAll()
  }, [])

  /* Viewing the leads tab = marking them read → clears the badge + bell. */
  useEffect(() => {
    if (tab === 'leads' && !loading) markLeadsSeen()
  }, [tab, loading, leads.length])

  async function loadAll() {
    setLoading(true)
    const [l, s, p, od, td, ar, sf, eng] = await Promise.all([
      fetchAllLeads(), fetchStudents(), fetchCrmPayments({ limit: 200 }),
      fetchOverdueFollowUps(isFounder ? undefined : staff.id),
      fetchTodaysFollowUps(isFounder ? undefined : staff.id),
      fetchArchivedLeads(), fetchStaff(), fetchEngagement(),
    ])
    setEngagement(eng)
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

  /* Apply quick pill + smart filters + sort on top of the base filters */
  const visibleLeads = useMemo(() => {
    let list = baseLeads
    if (mineOnly) list = list.filter(l => l.assigned_to_id === staff.id)
    if (statusPill === 'vip')  list = list.filter(l => l.is_vip)
    else if (statusPill !== 'all') list = list.filter(l => normalizeStatus(l.status) === statusPill)
    if (smartPill === 'overdue') list = list.filter(isOverdueLead)
    else if (smartPill === 'today') list = list.filter(isTodayLead)
    else if (smartPill === 'fresh') list = list.filter(isFreshLead)
    const arr = [...list]
    if (leadSort === 'newest')        arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    else if (leadSort === 'oldest')   arr.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    else if (leadSort === 'amount')   arr.sort((a, b) => (b.amount_mad ?? 0) - (a.amount_mad ?? 0))
    else if (leadSort === 'followup') arr.sort((a, b) =>
      (a.next_followup_at ? +new Date(a.next_followup_at) : Infinity) -
      (b.next_followup_at ? +new Date(b.next_followup_at) : Infinity))
    return arr
  }, [baseLeads, statusPill, smartPill, mineOnly, leadSort, staff.id])

  /* Needs-action counters for the leads KPI strip */
  const leadKpi = useMemo(() => ({
    total:   baseLeads.length,
    overdue: baseLeads.filter(isOverdueLead).length,
    today:   baseLeads.filter(isTodayLead).length,
    fresh:   baseLeads.filter(isFreshLead).length,
  }), [baseLeads])

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

  /* Inactive = active student with no portal activity in INACTIVE_DAYS (or never). */
  function studentInactive(s: CrmStudent) {
    if (!s.is_active) return false
    const d = daysInactive(engagement.get(s.id))
    return d === null || d >= INACTIVE_DAYS
  }
  const inactiveCount  = useMemo(() => students.filter(studentInactive).length, [students, engagement])
  const shownStudents  = useMemo(() => onlyInactive ? filteredStudents.filter(studentInactive) : filteredStudents, [filteredStudents, onlyInactive, engagement])

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
    if (!isFounder || !confirm(`حذف ${checkedIds.size} عميل نهائيًا؟ لا يمكن التراجع.`)) return
    setBulkBusy(true); await bulkDeleteLeads([...checkedIds])
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }
  async function bulkMarkContacted() {
    setBulkBusy(true); await bulkPatchLeads([...checkedIds], { status: 'contacted' })
    setCheckedIds(new Set()); refresh(); setBulkBusy(false)
  }

  /* Convert a paid lead → student (shows on the Students page). */
  const [convertingId, setConvertingId] = useState<string | null>(null)
  async function convertToStudent(lead: SubscriptionLead) {
    if (students.some(s => s.lead_id === lead.id)) {
      router.push(`/sales/students/${students.find(s => s.lead_id === lead.id)!.id}`)
      return
    }
    if (!confirm(`تحويل "${lead.full_name}" إلى طالب مدفوع؟`)) return
    setConvertingId(lead.id)
    try {
      if (normalizeStatus(lead.status) !== 'paid') await updateLeadStatus(lead.id, 'paid', staff.id)
      const studentId = await convertLeadToStudent(lead.id)
      await loadAll()
      if (studentId) router.push(`/sales/students/${studentId}`)
    } finally { setConvertingId(null) }
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

          {/* Needs-action strip — one tap shows what to handle NOW */}
          <div className="bg-white border-b border-zinc-100 px-4 pt-3 pb-1">
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: '' as SmartPill,        n: leadKpi.total,   label: 'إجمالي العملاء', on: 'bg-zinc-900 text-white border-zinc-900',   off: 'bg-white text-zinc-800 border-zinc-200', sub: 'text-zinc-400' },
                { id: 'overdue' as SmartPill, n: leadKpi.overdue, label: '🔴 متابعة متأخرة', on: 'bg-red-600 text-white border-red-600',     off: leadKpi.overdue > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-zinc-400 border-zinc-200', sub: 'opacity-70' },
                { id: 'today' as SmartPill,   n: leadKpi.today,   label: '🟠 متابعة اليوم',  on: 'bg-orange-500 text-white border-orange-500', off: leadKpi.today > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-zinc-400 border-zinc-200', sub: 'opacity-70' },
                { id: 'fresh' as SmartPill,   n: leadKpi.fresh,   label: '🆕 جديد بلا مسؤول', on: 'bg-blue-600 text-white border-blue-600',   off: leadKpi.fresh > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-zinc-400 border-zinc-200', sub: 'opacity-70' },
              ]).map(k => {
                const active = smartPill === k.id
                return (
                  <button key={k.id || 'all'} type="button"
                    onClick={() => setSmartPill(active && k.id !== '' ? '' : k.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${active ? k.on : `${k.off} hover:border-zinc-300`}`}>
                    <div className="text-[20px] font-black leading-none">{k.n}</div>
                    <div className={`text-[10.5px] font-bold mt-1 leading-tight ${active ? 'opacity-90' : k.sub}`}>{k.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

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
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-[13px] text-zinc-500 flex-wrap">
                <span className="font-semibold">{visibleLeads.length} عميل</span>
                <button type="button" onClick={() => setMineOnly(v => !v)}
                  className={`text-[12px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    mineOnly ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}>
                  👤 عملائي فقط
                </button>
                <select value={leadSort} onChange={e => setLeadSort(e.target.value as LeadSort)}
                  className="text-[12px] font-semibold bg-white border border-zinc-200 rounded-full px-2.5 py-1 text-zinc-600 focus:outline-none">
                  {LEAD_SORTS.map(s => <option key={s.id} value={s.id}>↕ {s.label}</option>)}
                </select>
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

            <LeadList
              leads={visibleLeads}
              checkedIds={checkedIds}
              onToggle={toggleCheck}
              onToggleAll={() => setCheckedIds(checkedIds.size === allLeadIds.length ? new Set() : new Set(allLeadIds))}
              allChecked={checkedIds.size > 0 && checkedIds.size === allLeadIds.length}
              onOpen={l => setDrawerLead(l)}
              onConvert={convertToStudent}
              convertingId={convertingId}
              studentLeadIds={studentLeadIds}
              staffMap={staffMap}
            />
          </div>
        </div>
      )}

      {/* ═══════════════ STUDENTS TAB ════════════════════ */}
      {!loading && tab === 'students' && (
        <div className="flex-1 px-4 py-4">
          {/* Certificate readiness — who is ready to be awarded */}
          <CertReadyBoard />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
            <div className="bg-white rounded-xl border border-zinc-100 p-3 text-center">
              <div className="text-[22px] font-black text-zinc-800">{students.length}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">إجمالي الطلاب</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
              <div className="text-[22px] font-black text-blue-700">{students.filter(s => s.student_type === 'course_student').length}</div>
              <div className="text-[11px] text-blue-500 mt-0.5">دورات</div>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-3 text-center">
              <div className="text-[22px] font-black text-purple-700">{students.filter(s => (s.billing_type === 'monthly') || s.student_type === 'private_student').length}</div>
              <div className="text-[11px] text-purple-500 mt-0.5">اشتراك شهري</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 text-center">
              <div className="text-[22px] font-black text-amber-700">{students.filter(s => !s.is_active).length}</div>
              <div className="text-[11px] text-amber-500 mt-0.5">مؤرشف</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2 sm:flex-nowrap">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setShowBin(b => { const n = !b; if (n) loadBin(); return n }) }}
                className={`flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-xl border ${showBin ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}>
                <Trash2 size={14} /> سلة المحذوفين
              </button>
              {inactiveCount > 0 && (
                <button onClick={() => setOnlyInactive(v => !v)}
                  className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-2 rounded-xl border ${onlyInactive ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}>
                  <AlertTriangle size={14} /> بحاجة متابعة ({inactiveCount})
                </button>
              )}
            </div>
            <button onClick={() => setAddStudentOpen(true)}
              className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300 flex-shrink-0">
              <Plus size={14} /> إضافة طالب
            </button>
          </div>

          {showBin ? (
            <div className="space-y-2">
              <div className="text-[13px] font-bold text-zinc-500 mb-1">سلة المحذوفين — يمكن الاسترجاع بالسجل الكامل</div>
              {binStudents.length === 0 && <Empty text="السلة فارغة" />}
              {binStudents.map(s => (
                <div key={s.id} className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3">
                  <Avatar name={s.full_name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-zinc-800 truncate">{s.full_name}</div>
                    <div className="text-[11px] text-zinc-400">حُذف في {s.deleted_at ? new Date(s.deleted_at).toLocaleDateString('ar-MA') : '—'}</div>
                  </div>
                  <button onClick={() => onRestoreStudent(s)} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-1"><RotateCcw size={12} /> استرجاع</button>
                  {isFounder && <button onClick={() => onPurgeStudent(s)} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">حذف نهائي</button>}
                </div>
              ))}
            </div>
          ) : (
            <>
              {shownStudents.length === 0 && <Empty text={onlyInactive ? 'لا طلاب بحاجة متابعة 🎉' : 'لا يوجد طلاب — أضف طالبًا يدويًا أو حوّل عميلًا'} />}
              <StudentList
                students={shownStudents}
                engagement={engagement}
                inactiveDays={INACTIVE_DAYS}
                onOpen={s => router.push(`/sales/students/${s.id}`)}
                onArchive={onArchiveStudent}
                onUnarchive={async s => { await unarchiveStudent(s.id); refresh() }}
                onRemove={onRemoveStudent}
              />
            </>
          )}
        </div>
      )}

      {/* ═══════════════ PAYMENTS TAB (transactions ledger) ══ */}
      {!loading && tab === 'payments' && (() => {
        const paidTotal = payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.amount_mad), 0)
        const counts = {
          all: payments.length,
          paid: payments.filter(p => p.payment_status === 'paid').length,
          pending: payments.filter(p => p.payment_status === 'pending').length,
          declined: payments.filter(p => p.payment_status === 'declined').length,
        }
        const list = payments
          .filter(p => payFilter === 'all' || p.payment_status === payFilter)
          .sort((a, b) => new Date(b.payment_date ?? b.created_at).getTime() - new Date(a.payment_date ?? a.created_at).getTime())
        const PF: { id: typeof payFilter; label: string }[] = [
          { id: 'all', label: 'الكل' }, { id: 'paid', label: 'مدفوع' },
          { id: 'pending', label: 'بانتظار الموافقة' }, { id: 'declined', label: 'مرفوض' },
        ]
        return (
          <div className="flex-1 px-4 py-4 space-y-4">
            {/* Financial overview + dues board (who has to pay, who hasn't) */}
            <DuesBoard onChanged={refresh} />

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-zinc-900 rounded-2xl p-4">
                <div className="text-[11px] text-zinc-400 mb-1">إجمالي الإيراد المقبوض</div>
                <div className="text-[24px] font-black text-yellow-400">{paidTotal.toLocaleString('en-US')}<span className="text-[12px] font-semibold text-zinc-500 mr-1">د.م</span></div>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-4">
                <div className="text-[11px] text-zinc-400 mb-1">بانتظار الموافقة</div>
                <div className="text-[24px] font-black text-amber-600">{counts.pending}</div>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <div className="text-[11px] text-zinc-400 mb-1">إجمالي العمليات</div>
                <div className="text-[24px] font-black text-zinc-900">{counts.all}</div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {PF.map(f => (
                <button key={f.id} onClick={() => setPayFilter(f.id)}
                  className={[
                    'px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-colors',
                    payFilter === f.id ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400',
                  ].join(' ')}>
                  {f.label} <span className="opacity-60">({counts[f.id]})</span>
                </button>
              ))}
            </div>

            {/* Ledger */}
            {list.length === 0 ? <Empty text="لا توجد عمليات في هذا الفلتر" /> : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase">
                        <th className="px-4 py-3">الطالب</th>
                        <th className="px-4 py-3">الدورة</th>
                        <th className="px-4 py-3">النوع</th>
                        <th className="px-4 py-3">الطريقة</th>
                        <th className="px-4 py-3">المبلغ</th>
                        <th className="px-4 py-3">التاريخ</th>
                        <th className="px-4 py-3">الحالة</th>
                        <th className="px-4 py-3">الوصل / الإجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(p => {
                        const { student, lead, name, phone, course } = resolvePayment(p, studentById, leads)
                        const info = PAY_STATUS_AR[p.payment_status]
                        const dateStr = new Date(p.payment_date ?? p.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'short', day: 'numeric' })
                        return (
                          <tr key={p.id} className="border-b border-zinc-50 last:border-none text-[13px] hover:bg-zinc-50">
                            <td className="px-4 py-3">
                              <button onClick={() => student ? router.push(`/sales/students/${student.id}`) : lead && setDrawerLead(lead)} className="flex items-center gap-2.5">
                                <Avatar name={name} size={32} /><span className="font-semibold text-zinc-800">{name}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-zinc-600 font-semibold">{course || '—'}</td>
                            <td className="px-4 py-3 text-zinc-500">
                              {p.installment_no
                                ? <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">قسط {p.installment_no}/{p.installment_count ?? 2}</span>
                                : p.payment_type === 'course_one_time' ? 'دفعة واحدة' : 'اشتراك شهري'}
                              {p.payment_status === 'pending' && p.due_date && (
                                <span className="block text-[10px] text-amber-600 font-bold mt-0.5">يُستحق {new Date(p.due_date).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-zinc-500">{PAY_METHOD_AR[(p as any).payment_method] ?? 'نقدًا'}</td>
                            <td className="px-4 py-3 font-black text-zinc-900">{Number(p.amount_mad).toLocaleString('en-US')} <span className="text-[10px] text-zinc-400">د.م</span></td>
                            <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{dateStr}</td>
                            <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>{info.text}</span></td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {p.payment_status === 'pending' ? (
                                <div className="flex gap-1.5">
                                  <button onClick={() => approvePayment(p.id)} disabled={!!payBusy} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">{payBusy === p.id ? '...' : 'قبول'}</button>
                                  <button onClick={() => declinePayment(p.id)} disabled={!!payBusy} className="text-[12px] px-3 py-1.5 rounded-lg border border-red-200 text-red-500">رفض</button>
                                </div>
                              ) : p.payment_status === 'paid' ? (
                                <div className="flex gap-1.5">
                                  <button onClick={() => emitReceipt(p, { name, phone, course, student })} className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-black text-yellow-400 hover:bg-zinc-800"><Printer size={11} /> الوصل</button>
                                  {phone && <button onClick={() => emitReceipt(p, { name, phone, course, student }, true)} className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-green-50 text-green-700"><MessageCircle size={11} /></button>}
                                </div>
                              ) : <span className="text-zinc-300">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-3">
                  {list.map(p => (
                    <PayRow key={p.id} p={p} leads={leads} studentById={studentById} staffMap={staffMap}
                      payBusy={payBusy} onApprove={approvePayment} onDecline={declinePayment}
                      onOpenStudent={id => router.push(`/sales/students/${id}`)} onOpenLead={setDrawerLead} />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })()}

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
      {addStudentOpen && <AddStudentModal onClose={() => setAddStudentOpen(false)} onCreated={() => { setAddStudentOpen(false); refresh() }} />}
    </div>
  )
}
