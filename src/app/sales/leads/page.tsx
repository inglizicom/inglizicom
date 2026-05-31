'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Loader2, MessageCircle, Phone, RotateCcw,
  LayoutGrid, List, Crown, Plus, MapPin, Globe,
  Calendar, AlertTriangle, Clock, ChevronDown,
  CheckCircle2, XCircle, Flame, Star, Filter,
  ArrowUpDown, ChevronRight, ChevronUp,
  GraduationCap, Tag,
} from 'lucide-react'
import {
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  fetchAllLeads, updateLeadStatus, patchLead,
  whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, getCourseMeta } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { logLeadEvent } from '@/lib/crm-db'
import { useStaff } from '@/lib/staff-context'
import LeadDetailDrawer from './LeadDetailDrawer'
import AddLeadDrawer from './AddLeadDrawer'

/* ─── types ─────────────────────────────── */
type QuickFilter = 'all' | 'hot' | 'overdue' | 'today' | 'vip' | 'mine'
type SortKey = 'created_at' | 'next_followup_at' | 'full_name' | 'amount_mad'
type Group = 'overdue' | 'today' | 'upcoming' | 'active' | 'paid' | 'cancelled'

interface GroupedLeads { label: string; emoji: string; accent: string; leads: SubscriptionLead[]; defaultOpen: boolean }

/* ─── helpers ───────────────────────────── */
const today = (): string => new Date().toISOString().slice(0, 10)
const tomorrow = (): string => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) }

function followupGroup(lead: SubscriptionLead): Group {
  const s = normalizeStatus(lead.status)
  if (s === 'paid' || s === 'converted') return 'paid'
  if (s === 'cancelled' || s === 'rejected') return 'cancelled'
  if (!lead.next_followup_at) return 'active'
  const d = lead.next_followup_at.slice(0, 10)
  const t = today()
  if (d < t)  return 'overdue'
  if (d === t) return 'today'
  if (d <= tomorrow()) return 'upcoming'
  return 'active'
}

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'today'
  if (d === 1) return '1d'
  return `${d}d`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function isOverdue(lead: SubscriptionLead): boolean {
  const s = normalizeStatus(lead.status)
  if (!lead.next_followup_at || s === 'paid' || s === 'cancelled') return false
  return lead.next_followup_at.slice(0, 10) < today()
}

function isToday(lead: SubscriptionLead): boolean {
  return !!lead.next_followup_at && lead.next_followup_at.slice(0, 10) === today()
}

const AVATAR_COLORS = [
  'bg-blue-500','bg-violet-500','bg-emerald-500','bg-orange-500',
  'bg-rose-500','bg-indigo-500','bg-teal-500','bg-amber-600',
]
function avatarColor(s: string): string {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/* ═══════════════════════════════════════════
   PAGE
═══════════════════════════════════════════ */
export default function LeadsPage() {
  const staff = useStaff()
  const [leads, setLeads]       = useState<SubscriptionLead[] | null>(null)
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'list' | 'kanban'>('list')
  const [query, setQuery]       = useState('')
  const [quick, setQuick]       = useState<QuickFilter>('all')
  const [statusFilter, setStatusF] = useState<LeadStatus | ''>('')
  const [sourceFilter, setSourceF] = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('created_at')
  const [selected, setSelected] = useState<SubscriptionLead | null>(null)
  const [addOpen, setAddOpen]   = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    load()
    if (searchParams?.get('add') === '1') { setAddOpen(true); router.replace('/sales/leads') }
  }, [])

  async function load() {
    setLoading(true)
    setLeads(await fetchAllLeads())
    setLoading(false)
  }

  /* computed counts for quick-filter chips */
  const counts = useMemo(() => {
    if (!leads) return { hot: 0, overdue: 0, today: 0, vip: 0, mine: 0 }
    return {
      hot:     leads.filter(l => { const s = normalizeStatus(l.status); return l.is_vip || ['confirmed','delayed'].includes(s) }).length,
      overdue: leads.filter(isOverdue).length,
      today:   leads.filter(isToday).length,
      vip:     leads.filter(l => l.is_vip).length,
      mine:    leads.filter(l => l.assigned_to_id === staff.id).length,
    }
  }, [leads, staff.id])

  /* filtered + sorted */
  const filtered = useMemo(() => {
    if (!leads) return []
    const q = query.trim().toLowerCase()
    const t = today()
    return leads.filter(l => {
      const s = normalizeStatus(l.status)
      if (statusFilter && s !== statusFilter) return false
      if (sourceFilter && (l.lead_source ?? l.source) !== sourceFilter) return false
      if (quick === 'hot')     { if (!(l.is_vip || ['confirmed','delayed'].includes(s))) return false }
      if (quick === 'overdue') { if (!isOverdue(l)) return false }
      if (quick === 'today')   { if (!isToday(l)) return false }
      if (quick === 'vip')     { if (!l.is_vip) return false }
      if (quick === 'mine')    { if (l.assigned_to_id !== staff.id) return false }
      if (q) {
        const hay = `${l.full_name} ${l.phone ?? ''} ${l.city ?? ''} ${l.lead_source ?? l.source ?? ''} ${l.course ?? ''} ${l.notes ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    }).sort((a, b) => {
      if (sortKey === 'next_followup_at') {
        if (!a.next_followup_at && !b.next_followup_at) return 0
        if (!a.next_followup_at) return 1
        if (!b.next_followup_at) return -1
        return a.next_followup_at.localeCompare(b.next_followup_at)
      }
      if (sortKey === 'full_name') return a.full_name.localeCompare(b.full_name)
      if (sortKey === 'amount_mad') return (b.amount_mad ?? 0) - (a.amount_mad ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [leads, query, quick, statusFilter, sourceFilter, sortKey, staff.id])

  /* grouped for list view */
  const grouped: GroupedLeads[] = useMemo(() => {
    const groups: Record<Group, SubscriptionLead[]> = {
      overdue: [], today: [], upcoming: [], active: [], paid: [], cancelled: [],
    }
    for (const l of filtered) groups[followupGroup(l)].push(l)
    const result: GroupedLeads[] = []
    if (groups.overdue.length)  result.push({ label: 'Overdue follow-up',  emoji: '⚠️', accent: 'text-red-600',    leads: groups.overdue,    defaultOpen: true })
    if (groups.today.length)    result.push({ label: 'Follow-up today',     emoji: '📅', accent: 'text-orange-600', leads: groups.today,      defaultOpen: true })
    if (groups.upcoming.length) result.push({ label: 'Upcoming (7 days)',   emoji: '🔔', accent: 'text-blue-600',   leads: groups.upcoming,   defaultOpen: true })
    if (groups.active.length)   result.push({ label: 'Active leads',        emoji: '💬', accent: 'text-gray-700',   leads: groups.active,     defaultOpen: true })
    if (groups.paid.length)     result.push({ label: 'Paid / Converted',    emoji: '✅', accent: 'text-emerald-600',leads: groups.paid,       defaultOpen: false })
    if (groups.cancelled.length)result.push({ label: 'Cancelled / Lost',    emoji: '❌', accent: 'text-gray-400',   leads: groups.cancelled,  defaultOpen: false })
    return result
  }, [filtered])

  /* kanban grouped */
  const kanbanCols = useMemo(() => {
    const cols: Record<LeadStatus, SubscriptionLead[]> = {
      new: [], contacted: [], interested: [], follow_up: [],
      confirmed: [], paid: [], delayed: [], cancelled: [], vip: [],
      converted: [], rejected: [],
    }
    for (const l of filtered) {
      const s = normalizeStatus(l.status)
      if (l.is_vip && !['paid','cancelled','converted','rejected'].includes(s)) cols.vip.push(l)
      else cols[s].push(l)
    }
    return cols
  }, [filtered])

  async function moveStatus(leadId: string, newStatus: LeadStatus) {
    const target = leads?.find(l => l.id === leadId)
    if (!target) return
    const prev = normalizeStatus(target.status)
    setLeads(prev => prev?.map(l => l.id === leadId
      ? { ...l, status: newStatus, is_vip: newStatus === 'vip' ? true : l.is_vip }
      : l) ?? null)
    try {
      if (newStatus === 'vip') await patchLead(leadId, { is_vip: true } as any)
      else { await updateLeadStatus(leadId, newStatus, staff.id); if (target.is_vip) await patchLead(leadId, { is_vip: false } as any) }
      await logLeadEvent({ leadId, eventType: 'status_changed', title: `${LEAD_STATUS_META[prev]?.label} → ${LEAD_STATUS_META[newStatus]?.label}`, before: { status: prev }, after: { status: newStatus } })
      await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: leadId, before: { status: prev }, after: { status: newStatus } })
    } catch { load() }
  }

  const sources = useMemo(() => {
    const seen = new Set<string>()
    for (const l of leads ?? []) { const s = l.lead_source ?? l.source; if (s) seen.add(s) }
    return [...seen].sort()
  }, [leads])

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ minHeight: 0 }}>

      {/* ── TOP BAR ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Lead Pipeline</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? '…' : `${filtered.length} leads · ${counts.overdue > 0 ? `${counts.overdue} overdue · ` : ''}${counts.today > 0 ? `${counts.today} due today · ` : ''}${counts.hot} hot`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Refresh">
              <RotateCcw size={15} />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition-colors shadow-sm"
            >
              <Plus size={14} /> New lead
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, phone, source…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1">
            <Chip active={quick==='all'}     onClick={()=>setQuick('all')}     label="All" />
            <Chip active={quick==='overdue'} onClick={()=>setQuick('overdue')} label={`⚠ Overdue ${counts.overdue||''}`}  color="red" />
            <Chip active={quick==='today'}   onClick={()=>setQuick('today')}   label={`📅 Today ${counts.today||''}`}     color="orange" />
            <Chip active={quick==='hot'}     onClick={()=>setQuick('hot')}     label={`🔥 Hot ${counts.hot||''}`}         color="yellow" />
            <Chip active={quick==='vip'}     onClick={()=>setQuick('vip')}     label={`👑 VIP ${counts.vip||''}`}         color="rose" />
            <Chip active={quick==='mine'}    onClick={()=>setQuick('mine')}    label={`👤 Mine ${counts.mine||''}`}       color="blue" />
          </div>

          {/* Dropdowns */}
          <select value={statusFilter} onChange={e => setStatusF(e.target.value as any)}
            className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none text-gray-700 font-semibold">
            <option value="">All statuses</option>
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>)}
          </select>

          <select value={sourceFilter} onChange={e => setSourceF(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none text-gray-700 font-semibold">
            <option value="">All sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* View toggle */}
          <div className="ml-auto flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${view==='list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <List size={13} /> List
            </button>
            <button onClick={() => setView('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${view==='kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid size={13} /> Board
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : view === 'list' ? (
          /* ── LIST VIEW ── */
          <div className="px-6 py-4 space-y-3">
            {grouped.map(group => (
              <LeadGroup
                key={group.label}
                group={group}
                onSelect={setSelected}
                onStatusChange={moveStatus}
              />
            ))}
          </div>
        ) : (
          /* ── BOARD VIEW ── */
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-4">
              {LEAD_STATUSES.map(status => (
                <KanbanCol
                  key={status}
                  status={status}
                  leads={kanbanCols[status]}
                  onSelect={setSelected}
                  onDrop={id => moveStatus(id, status)}
                  dragging={dragging}
                  setDragging={setDragging}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawers */}
      {selected && (
        <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onChange={async () => { await load() }} />
      )}
      {addOpen && (
        <AddLeadDrawer onClose={() => setAddOpen(false)} onCreated={async () => { await load() }} />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   CHIP
═══════════════════════════════════════════ */
function Chip({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  const inactiveClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  const activeMap: Record<string, string> = {
    red:    'bg-red-100 text-red-700 ring-1 ring-red-200',
    orange: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
    rose:   'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    blue:   'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    gray:   'bg-gray-900 text-white ring-1 ring-gray-700',
  }
  const activeClass = active ? (activeMap[color ?? 'gray']) : inactiveClass
  return (
    <button onClick={onClick} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeClass}`}>
      {label}
    </button>
  )
}

/* ═══════════════════════════════════════════
   LEAD GROUP (list view)
═══════════════════════════════════════════ */
function LeadGroup({ group, onSelect, onStatusChange }: {
  group: GroupedLeads
  onSelect: (l: SubscriptionLead) => void
  onStatusChange: (id: string, s: LeadStatus) => void
}) {
  const [open, setOpen] = useState(group.defaultOpen)
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-base">{group.emoji}</span>
        <span className={`font-bold text-[13px] ${group.accent}`}>{group.label}</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold tabular-nums">
          {group.leads.length}
        </span>
        <span className="ml-auto text-gray-400">{open ? <ChevronUp size={15}/> : <ChevronRight size={15}/>}</span>
      </button>

      {/* Leads table */}
      {open && (
        <div className="border-t border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="text-left px-4 py-2">Lead</th>
                <th className="text-left px-3 py-2 hidden sm:table-cell">Course</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Follow-up</th>
                <th className="text-left px-3 py-2 hidden lg:table-cell">Last contact</th>
                <th className="text-left px-3 py-2 hidden xl:table-cell">Created</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.leads.map(l => (
                <LeadRow key={l.id} lead={l} onSelect={() => onSelect(l)} onStatusChange={onStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   LEAD ROW
═══════════════════════════════════════════ */
function LeadRow({ lead: l, onSelect, onStatusChange }: {
  lead: SubscriptionLead
  onSelect: () => void
  onStatusChange: (id: string, s: LeadStatus) => void
}) {
  const [statusOpen, setStatusOpen] = useState(false)
  const status = normalizeStatus(l.status)
  const meta   = LEAD_STATUS_META[status]
  const wa     = whatsappLink(l.phone, `مرحبا ${l.full_name}، أنا من إنجليزي.كوم`)
  const source = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const course = getCourseMeta(l.course)
  const overdue = isOverdue(l)
  const dueTod  = isToday(l)
  const ref     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statusOpen) return
    function handle(e: MouseEvent) { if (!ref.current?.contains(e.target as Node)) setStatusOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [statusOpen])

  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={onSelect}>
      {/* Name + tags */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[11px] flex-shrink-0 ${avatarColor(l.full_name)}`}>
            {l.full_name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {l.is_vip && <Crown size={11} className="text-rose-500 flex-shrink-0" />}
              <span className="font-semibold text-gray-900 text-[13px] truncate">{l.full_name}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {source && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
                  <span>{source.emoji}</span>{source.label}
                </span>
              )}
              {l.city && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <MapPin size={8}/>{l.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Course */}
      <td className="px-3 py-2.5 hidden sm:table-cell">
        {l.course ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
            <Tag size={9}/>{course.short}
          </span>
        ) : <span className="text-gray-300 text-[12px]">—</span>}
      </td>

      {/* Status — inline changer */}
      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setStatusOpen(o => !o)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${meta.color}`}
          >
            {meta.short}
            <ChevronDown size={9}/>
          </button>
          {statusOpen && (
            <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-36 py-1 overflow-hidden">
              {LEAD_STATUSES.filter(s => s !== 'vip').map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(l.id, s); setStatusOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] font-semibold hover:bg-gray-50 ${s === status ? 'bg-gray-50' : ''}`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor(s)}`}/>
                  {LEAD_STATUS_META[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Follow-up */}
      <td className="px-3 py-2.5 hidden md:table-cell">
        {l.next_followup_at ? (
          <span className={`flex items-center gap-1 text-[12px] font-semibold ${overdue ? 'text-red-600' : dueTod ? 'text-orange-600' : 'text-gray-600'}`}>
            {overdue && <AlertTriangle size={11}/>}
            {dueTod && <Clock size={11}/>}
            {formatDate(l.next_followup_at)}
          </span>
        ) : <span className="text-gray-300 text-[12px]">—</span>}
      </td>

      {/* Last contact */}
      <td className="px-3 py-2.5 hidden lg:table-cell text-[12px] text-gray-500">
        {l.last_contact_at ? formatDate(l.last_contact_at) : <span className="text-gray-300">Never</span>}
      </td>

      {/* Created */}
      <td className="px-3 py-2.5 hidden xl:table-cell">
        <span className="text-[11px] text-gray-400 tabular-nums">{daysAgo(l.created_at)}</span>
        {l.amount_mad ? (
          <div className="text-[11px] font-bold text-yellow-700 tabular-nums">{l.amount_mad} MAD</div>
        ) : null}
      </td>

      {/* Quick actions */}
      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {wa && (
            <a href={wa} target="_blank" rel="noopener"
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              title="WhatsApp">
              <MessageCircle size={13}/>
            </a>
          )}
          {l.phone && (
            <a href={`tel:${l.phone}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title={l.phone}>
              <Phone size={13}/>
            </a>
          )}
          <button
            onClick={onSelect}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Open details">
            <ChevronRight size={13}/>
          </button>
        </div>
      </td>
    </tr>
  )
}

function dotColor(s: LeadStatus): string {
  return { new:'bg-blue-500', contacted:'bg-indigo-500', interested:'bg-purple-500', follow_up:'bg-orange-500',
    confirmed:'bg-emerald-500', paid:'bg-yellow-500', delayed:'bg-amber-600', cancelled:'bg-gray-400',
    vip:'bg-rose-500', converted:'bg-yellow-500', rejected:'bg-gray-400' }[s] ?? 'bg-gray-300'
}

/* ═══════════════════════════════════════════
   KANBAN COLUMN
═══════════════════════════════════════════ */
function KanbanCol({ status, leads, onSelect, onDrop, dragging, setDragging }: {
  status: LeadStatus; leads: SubscriptionLead[]; onSelect: (l: SubscriptionLead) => void
  onDrop: (id: string) => void; dragging: string | null; setDragging: (id: string | null) => void
}) {
  const [over, setOver] = useState(false)
  const meta = LEAD_STATUS_META[status]
  const total = leads.reduce((s, l) => s + (l.amount_mad ?? 0), 0)
  return (
    <div className={`w-[260px] flex-shrink-0 bg-white border ${over ? 'border-yellow-400 ring-1 ring-yellow-300' : 'border-gray-200'} rounded-xl flex flex-col shadow-sm transition-colors`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id) }}>
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(status)}`}/>
        <span className="font-bold text-[12.5px] text-gray-900">{meta.label}</span>
        <span className="ml-auto text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{leads.length}</span>
      </div>
      {total > 0 && <div className="px-3 py-1 text-[10px] font-bold text-yellow-700 uppercase tracking-wide border-b border-gray-100">{total.toLocaleString()} MAD</div>}
      <div className={`p-2 space-y-2 flex-1 min-h-[160px] ${over ? 'bg-yellow-50/30' : ''}`}>
        {leads.length === 0 && <div className="text-center text-[11px] text-gray-400 py-4">Drop here</div>}
        {leads.map(l => (
          <KanbanCard key={l.id} lead={l} onClick={() => onSelect(l)}
            onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)}
            isDragging={dragging === l.id} />
        ))}
      </div>
    </div>
  )
}

function KanbanCard({ lead: l, onClick, onDragStart, onDragEnd, isDragging }: {
  lead: SubscriptionLead; onClick: () => void
  onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const wa     = whatsappLink(l.phone, `مرحبا ${l.full_name}، أنا من إنجليزي.كوم`)
  const source = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const over   = isOverdue(l)
  const tod    = isToday(l)
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white border rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:border-gray-400 hover:shadow-sm transition-all ${l.is_vip ? 'border-rose-200 ring-1 ring-rose-100' : 'border-gray-200'} ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-start gap-1.5 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[10px] flex-shrink-0 ${avatarColor(l.full_name)}`}>
          {l.full_name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {l.is_vip && <Crown size={9} className="text-rose-500"/>}
            <span className="font-semibold text-[12px] text-gray-900 truncate">{l.full_name}</span>
          </div>
          {source && <span className="text-[10px] text-gray-400">{source.emoji} {source.label}</span>}
        </div>
      </div>
      {l.amount_mad ? <div className="text-[11px] font-black text-yellow-700 mb-1.5">{l.amount_mad.toLocaleString()} MAD</div> : null}
      {l.next_followup_at && (
        <div className={`flex items-center gap-1 text-[10px] font-bold mb-1.5 ${over ? 'text-red-600' : tod ? 'text-orange-600' : 'text-gray-500'}`}>
          {over && <AlertTriangle size={9}/>}
          {tod && <Clock size={9}/>}
          <Calendar size={9}/>{formatDate(l.next_followup_at)}
        </div>
      )}
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        {wa && <a href={wa} target="_blank" rel="noopener" className="w-6 h-6 rounded flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100"><MessageCircle size={10}/></a>}
        {l.phone && <a href={`tel:${l.phone}`} className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200"><Phone size={10}/></a>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════ */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Star size={24} className="text-gray-400" />
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1">No leads yet</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">Add your first lead from TikTok, Instagram, or any other source.</p>
      <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-colors">
        <Plus size={14}/> Add first lead
      </button>
    </div>
  )
}
