'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, RotateCcw, MessageCircle, Phone,
  Crown, ChevronDown, Loader2, AlertTriangle,
  Clock, LayoutGrid, List, ChevronUp, ChevronsUpDown,
  SlidersHorizontal, X,
} from 'lucide-react'
import {
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  fetchAllLeads, updateLeadStatus, patchLead, whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES, getCourseMeta } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { logLeadEvent } from '@/lib/crm-db'
import { useStaff } from '@/lib/staff-context'
import LeadDetailDrawer from './LeadDetailDrawer'
import AddLeadModal from './AddLeadModal'
import StatusDropdown from './StatusDropdown'

/* ─── helpers ──────────────────────────────────────────────── */
const toDateStr = (d: Date) => d.toISOString().slice(0, 10)
const todayStr  = () => toDateStr(new Date())

type Urgency = 0 | 1 | 2 | 3 | 4 | 5   // 0 = most urgent
function urgencyOf(l: SubscriptionLead): Urgency {
  const s = normalizeStatus(l.status)
  if (s === 'cancelled' || s === 'rejected') return 5
  if (s === 'paid'      || s === 'converted') return 4
  const d = l.next_followup_at?.slice(0, 10)
  const t = todayStr()
  if (d && d < t)  return 0   // overdue
  if (d && d === t) return 1  // today
  if (d)           return 2   // upcoming
  return 3                     // no date
}

const isOverdue = (l: SubscriptionLead) => urgencyOf(l) === 0
const isToday   = (l: SubscriptionLead) => urgencyOf(l) === 1

const fmtDate = (s?: string | null) =>
  !s ? '' : new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

type SortField = 'urgency' | 'name' | 'status' | 'amount' | 'created'
type SortDir   = 'asc' | 'desc'

/* Status pill colors */
const STATUS_PILL: Record<string, string> = {
  new:        'bg-gray-100 text-gray-600',
  contacted:  'bg-blue-50 text-blue-700',
  interested: 'bg-violet-50 text-violet-700',
  follow_up:  'bg-amber-50 text-amber-800',
  confirmed:  'bg-emerald-50 text-emerald-800',
  paid:       'bg-green-100 text-green-800',
  delayed:    'bg-orange-50 text-orange-800',
  cancelled:  'bg-gray-100 text-gray-400',
  vip:        'bg-rose-50 text-rose-700',
  converted:  'bg-green-100 text-green-800',
  rejected:   'bg-gray-100 text-gray-400',
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function LeadsPage() {
  const staff = useStaff()
  const [leads,    setLeads]    = useState<SubscriptionLead[] | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [stFilter, setStFilter] = useState<LeadStatus | ''>('')
  const [srcFilter,setSrcFilter]= useState('')
  const [sortField,setSortField]= useState<SortField>('urgency')
  const [sortDir,  setSortDir]  = useState<SortDir>('asc')
  const [view,     setView]     = useState<'list' | 'board'>('list')
  const [selected, setSelected] = useState<SubscriptionLead | null>(null)
  const [addOpen,  setAddOpen]  = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const sp     = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    load()
    if (sp?.get('add') === '1') { setAddOpen(true); router.replace('/sales/leads') }
  }, [])

  async function load() {
    setLoading(true); setLeads(await fetchAllLeads()); setLoading(false)
  }

  /* source list */
  const sources = useMemo(() => {
    const s = new Set<string>()
    for (const l of leads ?? []) { const v = l.lead_source ?? l.source; if (v) s.add(v) }
    return [...s].sort()
  }, [leads])

  /* filter */
  const filtered = useMemo(() => {
    if (!leads) return []
    const q = query.trim().toLowerCase()
    return leads.filter(l => {
      if (stFilter && normalizeStatus(l.status) !== stFilter) return false
      if (srcFilter && (l.lead_source ?? l.source) !== srcFilter) return false
      if (q) {
        const h = `${l.full_name} ${l.phone ?? ''} ${l.city ?? ''} ${l.lead_source ?? l.source ?? ''} ${l.course ?? ''}`.toLowerCase()
        if (!h.includes(q)) return false
      }
      return true
    })
  }, [leads, query, stFilter, srcFilter])

  /* sort */
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let v = 0
    if (sortField === 'urgency') v = urgencyOf(a) - urgencyOf(b)
    else if (sortField === 'name')   v = a.full_name.localeCompare(b.full_name)
    else if (sortField === 'status') v = normalizeStatus(a.status).localeCompare(normalizeStatus(b.status))
    else if (sortField === 'amount') v = (a.amount_mad ?? 0) - (b.amount_mad ?? 0)
    else if (sortField === 'created') v = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortDir === 'asc' ? v : -v
  }), [filtered, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  /* counts */
  const counts = useMemo(() => ({
    total:   filtered.length,
    overdue: filtered.filter(isOverdue).length,
    today:   filtered.filter(isToday).length,
  }), [filtered])

  /* kanban */
  const kanbanCols = useMemo(() => {
    const c: Record<LeadStatus, SubscriptionLead[]> = {
      new:[], contacted:[], interested:[], follow_up:[], confirmed:[],
      paid:[], delayed:[], cancelled:[], vip:[], converted:[], rejected:[],
    }
    for (const l of filtered) {
      const s = normalizeStatus(l.status)
      if (l.is_vip && !['paid','cancelled','converted','rejected'].includes(s)) c.vip.push(l)
      else c[s].push(l)
    }
    return c
  }, [filtered])

  async function move(id: string, next: LeadStatus) {
    const t = leads?.find(l => l.id === id); if (!t) return
    const prev = normalizeStatus(t.status)
    setLeads(p => p?.map(l => l.id === id ? { ...l, status: next } : l) ?? null)
    try {
      if (next === 'vip') await patchLead(id, { is_vip: true } as any)
      else { await updateLeadStatus(id, next, staff.id); if (t.is_vip) await patchLead(id, { is_vip: false } as any) }
      await logLeadEvent({ leadId: id, eventType: 'status_changed',
        title: `${LEAD_STATUS_META[prev]?.label} → ${LEAD_STATUS_META[next]?.label}` })
      await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: id,
        before: { status: prev }, after: { status: next } })
    } catch { load() }
  }

  const hasFilter = !!(query || stFilter || srcFilter)

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ══ TOP BAR ══════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">

        {/* Row 1: Title + button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Leads</h1>
            {!loading && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold tabular-nums">
                  {counts.total}
                </span>
                {counts.overdue > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
                    <AlertTriangle size={10} /> {counts.overdue} overdue
                  </span>
                )}
                {counts.today > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold">
                    <Clock size={10} /> {counts.today} today
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={load}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors">
              <Plus size={15} /> New lead
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search name, phone, source…"
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400" />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status */}
          <select value={stFilter} onChange={e => setStFilter(e.target.value as any)}
            className="text-sm py-2 pl-3 pr-7 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-gray-400 appearance-none cursor-pointer">
            <option value="">All statuses</option>
            {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s =>
              <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
            )}
          </select>

          {/* Source */}
          {sources.length > 0 && (
            <select value={srcFilter} onChange={e => setSrcFilter(e.target.value)}
              className="text-sm py-2 pl-3 pr-7 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-gray-400 appearance-none cursor-pointer">
              <option value="">All sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {hasFilter && (
            <button onClick={() => { setQuery(''); setStFilter(''); setSrcFilter('') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium underline">
              <X size={12} /> Clear
            </button>
          )}

          {/* View toggle */}
          <div className="ml-auto flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <List size={13} /> List
            </button>
            <button onClick={() => setView('board')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-l border-gray-200 transition-colors ${
                view === 'board' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <LayoutGrid size={13} /> Board
            </button>
          </div>
        </div>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : view === 'list' ? (
          <ListView
            leads={sorted}
            hasFilter={hasFilter}
            sortField={sortField} sortDir={sortDir}
            onSort={toggleSort}
            onSelect={setSelected}
            onMove={move}
            onClear={() => { setQuery(''); setStFilter(''); setSrcFilter('') }}
            onAdd={() => setAddOpen(true)}
          />
        ) : (
          <BoardView
            cols={kanbanCols}
            onSelect={setSelected}
            onDrop={move}
            dragging={dragging}
            setDragging={setDragging}
          />
        )}
      </div>

      {selected && (
        <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onChange={async () => load()} />
      )}
      {addOpen && (
        <AddLeadModal onClose={() => setAddOpen(false)} onCreated={() => load()} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   LIST VIEW
══════════════════════════════════════════════ */
function ListView({
  leads, hasFilter, sortField, sortDir, onSort, onSelect, onMove, onClear, onAdd,
}: {
  leads: SubscriptionLead[]
  hasFilter: boolean
  sortField: SortField; sortDir: SortDir
  onSort: (f: SortField) => void
  onSelect: (l: SubscriptionLead) => void
  onMove:   (id: string, s: LeadStatus) => void
  onClear:  () => void
  onAdd:    () => void
}) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Search size={20} className="text-gray-400" />
        </div>
        <p className="font-semibold text-gray-700 text-sm">
          {hasFilter ? 'No leads match your filters' : 'No leads yet'}
        </p>
        <p className="text-gray-400 text-xs">
          {hasFilter
            ? <button onClick={onClear} className="text-blue-600 underline">Clear filters</button>
            : <button onClick={onAdd} className="text-blue-600 underline">Add your first lead →</button>
          }
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[900px]">
        {/* Head */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <Th onClick={() => onSort('status')} active={sortField === 'status'} dir={sortDir} className="w-36">Status</Th>
            <Th onClick={() => onSort('name')}   active={sortField === 'name'}   dir={sortDir}>Contact</Th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">Phone</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap hidden lg:table-cell">Source</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap hidden lg:table-cell">Course</th>
            <Th onClick={() => onSort('urgency')} active={sortField === 'urgency'} dir={sortDir} className="hidden xl:table-cell">Follow-up</Th>
            <Th onClick={() => onSort('amount')}  active={sortField === 'amount'}  dir={sortDir} className="hidden xl:table-cell">Amount</Th>
            <Th onClick={() => onSort('created')} active={sortField === 'created'} dir={sortDir} className="hidden xl:table-cell">Added</Th>
            <th className="w-20" />
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {leads.map(l => <LeadRow key={l.id} lead={l} onSelect={() => onSelect(l)} onMove={onMove} />)}
        </tbody>
      </table>
    </div>
  )
}

/* Column header with sort */
function Th({ children, onClick, active, dir, className = '' }: {
  children: React.ReactNode; onClick: () => void; active: boolean; dir: SortDir; className?: string
}) {
  return (
    <th onClick={onClick}
      className={`text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-800 whitespace-nowrap select-none ${className}`}>
      <span className="flex items-center gap-1">
        {children}
        {active
          ? (dir === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)
          : <ChevronsUpDown size={12} className="opacity-30"/>}
      </span>
    </th>
  )
}

/* ══════════════════════════════════════════════
   LEAD ROW
══════════════════════════════════════════════ */
function LeadRow({ lead: l, onSelect, onMove }: {
  lead: SubscriptionLead; onSelect: () => void; onMove: (id: string, s: LeadStatus) => void
}) {
  const status  = normalizeStatus(l.status)
  const overdue = isOverdue(l)
  const today   = isToday(l)
  const wa      = whatsappLink(l.phone, `مرحبا ${l.full_name}`)
  const src     = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const course  = getCourseMeta(l.course)

  /* Left border urgency stripe */
  const stripe = overdue ? 'border-l-2 border-l-red-400' : today ? 'border-l-2 border-l-orange-400' : 'border-l-2 border-l-transparent'

  const daysAgo = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86_400_000)

  return (
    <tr className={`group hover:bg-gray-50 cursor-pointer transition-colors ${stripe}`} onClick={onSelect}>
      {/* Status — portal dropdown (no overflow clipping) */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <StatusDropdown status={status} onMove={s => onMove(l.id, s)} />
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(l.full_name)}`}>
            {l.full_name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              {l.is_vip && <Crown size={11} className="text-yellow-500 flex-shrink-0" />}
              <span className="text-sm font-semibold text-gray-900 truncate">{l.full_name}</span>
            </div>
            {l.city && <span className="text-xs text-gray-400">{l.city}</span>}
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        {l.phone ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-700 font-mono">{l.phone}</span>
            {wa && (
              <a href={wa} target="_blank" rel="noopener"
                className="w-6 h-6 flex items-center justify-center rounded text-green-600 hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100">
                <MessageCircle size={13} />
              </a>
            )}
          </div>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>

      {/* Source */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {src ? (
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span>{src.emoji}</span>{src.label}
          </span>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>

      {/* Course */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {l.course ? (
          <span className="text-xs text-gray-600 font-medium">{course.short}</span>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>

      {/* Follow-up */}
      <td className="px-4 py-3 hidden xl:table-cell">
        {l.next_followup_at ? (
          <span className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
            overdue ? 'text-red-600' : today ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {overdue && <AlertTriangle size={11}/>}
            {today   && <Clock size={11}/>}
            {fmtDate(l.next_followup_at)}
          </span>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>

      {/* Amount */}
      <td className="px-4 py-3 hidden xl:table-cell">
        {l.amount_mad ? (
          <span className="text-sm font-semibold text-gray-700 tabular-nums">
            {l.amount_mad.toLocaleString()} MAD
          </span>
        ) : <span className="text-gray-300 text-sm">—</span>}
      </td>

      {/* Added */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <span className="text-xs text-gray-400 tabular-nums">
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {l.phone && (
            <a href={`tel:${l.phone}`}
              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Phone size={13} />
            </a>
          )}
          <button onClick={onSelect}
            className="px-2.5 py-1 rounded text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors whitespace-nowrap">
            Open →
          </button>
        </div>
      </td>
    </tr>
  )
}

/* Status dot for kanban */
const DOT: Record<string, string> = {
  new:'bg-gray-300', contacted:'bg-blue-400', interested:'bg-violet-400',
  follow_up:'bg-amber-400', confirmed:'bg-emerald-500', paid:'bg-green-600',
  delayed:'bg-orange-400', cancelled:'bg-gray-200', vip:'bg-rose-500',
  converted:'bg-green-600', rejected:'bg-gray-200',
}

/* Avatar color */
const AV = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-orange-500','bg-rose-500','bg-indigo-500','bg-teal-500','bg-amber-600']
function avatarColor(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AV[h % AV.length]
}

/* ══════════════════════════════════════════════
   BOARD VIEW
══════════════════════════════════════════════ */
function BoardView({ cols, onSelect, onDrop, dragging, setDragging }: {
  cols: Record<LeadStatus, SubscriptionLead[]>
  onSelect:    (l: SubscriptionLead) => void
  onDrop:      (id: string, s: LeadStatus) => void
  dragging:    string | null
  setDragging: (id: string | null) => void
}) {
  const visible: LeadStatus[] = ['new','contacted','interested','follow_up','confirmed','paid','delayed','cancelled']
  return (
    <div className="flex gap-3 px-6 py-5 overflow-x-auto min-h-full">
      {visible.map(s => (
        <BoardCol key={s} status={s} leads={cols[s]}
          onSelect={onSelect} onDrop={onDrop}
          dragging={dragging} setDragging={setDragging} />
      ))}
    </div>
  )
}

function BoardCol({ status, leads, onSelect, onDrop, dragging, setDragging }: {
  status: LeadStatus; leads: SubscriptionLead[]
  onSelect: (l: SubscriptionLead) => void; onDrop: (id: string, s: LeadStatus) => void
  dragging: string | null; setDragging: (id: string | null) => void
}) {
  const [over, setOver] = useState(false)
  const meta = LEAD_STATUS_META[status]
  const totalMad = leads.reduce((s, l) => s + (l.amount_mad ?? 0), 0)
  return (
    <div className={`w-60 flex-shrink-0 flex flex-col rounded-xl border transition-all ${
      over ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'
    }`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id, status) }}>

      {/* Column head */}
      <div className="px-3 py-3 bg-white rounded-t-xl border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${DOT[status]}`} />
          <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
          <span className="ml-auto text-xs text-gray-400 tabular-nums font-medium">{leads.length}</span>
        </div>
        {totalMad > 0 && <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{totalMad.toLocaleString()} MAD</p>}
      </div>

      {/* Cards */}
      <div className="p-2 flex flex-col gap-1.5 flex-1 min-h-[80px]">
        {leads.length === 0 && <p className="text-[11px] text-gray-400 text-center py-4">Drop here</p>}
        {leads.map(l => (
          <BoardCard key={l.id} lead={l} onClick={() => onSelect(l)}
            onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)}
            isDragging={dragging === l.id} />
        ))}
      </div>
    </div>
  )
}

function BoardCard({ lead: l, onClick, onDragStart, onDragEnd, isDragging }: {
  lead: SubscriptionLead; onClick: () => void
  onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const wa  = whatsappLink(l.phone, `مرحبا ${l.full_name}`)
  const src = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const overdue = isOverdue(l); const today = isToday(l)
  return (
    <div draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd} onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-400 hover:shadow-sm transition-all select-none ${isDragging ? 'opacity-40 scale-95' : ''}`}>

      <div className="flex items-start gap-1 mb-2">
        {l.is_vip && <Crown size={10} className="text-yellow-500 mt-0.5 flex-shrink-0" />}
        <span className="text-sm font-semibold text-gray-900 leading-snug">{l.full_name}</span>
      </div>

      {src && <p className="text-[11px] text-gray-400 mb-1">{src.emoji} {src.label}</p>}
      {l.amount_mad && <p className="text-xs font-bold text-gray-700 tabular-nums mb-1.5">{l.amount_mad.toLocaleString()} MAD</p>}

      {l.next_followup_at && (
        <p className={`text-[11px] flex items-center gap-1 mb-2 ${overdue ? 'text-red-500 font-semibold' : today ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
          {overdue && <AlertTriangle size={9}/>} {today && <Clock size={9}/>}
          {fmtDate(l.next_followup_at)}
        </p>
      )}

      <div className="flex gap-1.5 pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
        {wa && <a href={wa} target="_blank" rel="noopener" className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 hover:underline"><MessageCircle size={10}/>WA</a>}
        {l.phone && <a href={`tel:${l.phone}`} className="text-[11px] text-blue-500 font-semibold flex items-center gap-0.5 hover:underline ml-auto"><Phone size={10}/></a>}
      </div>
    </div>
  )
}
