'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, RotateCcw, MessageCircle, Phone,
  Crown, ChevronDown, ChevronRight, Loader2,
  AlertCircle, Clock, Calendar, LayoutGrid, Rows3,
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
import AddLeadDrawer from './AddLeadDrawer'

/* ─── helpers ─────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().slice(0, 10)
const in7days  = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) }

type UrgencyGroup = 'overdue' | 'today' | 'upcoming' | 'none' | 'paid' | 'cancelled'

function urgency(lead: SubscriptionLead): UrgencyGroup {
  const s = normalizeStatus(lead.status)
  if (s === 'paid' || s === 'converted')   return 'paid'
  if (s === 'cancelled' || s === 'rejected') return 'cancelled'
  const d = lead.next_followup_at?.slice(0, 10)
  if (!d) return 'none'
  const t = todayStr()
  if (d < t)     return 'overdue'
  if (d === t)   return 'today'
  if (d <= in7days()) return 'upcoming'
  return 'none'
}

const isOverdue = (l: SubscriptionLead) => urgency(l) === 'overdue'
const isToday   = (l: SubscriptionLead) => urgency(l) === 'today'

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function daysOld(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return d === 0 ? 'today' : d === 1 ? '1d ago' : `${d}d ago`
}

/* Status dot color */
const statusDot: Record<string, string> = {
  new:        'bg-gray-400',
  contacted:  'bg-blue-400',
  interested: 'bg-violet-400',
  follow_up:  'bg-orange-400',
  confirmed:  'bg-emerald-500',
  paid:       'bg-emerald-600',
  delayed:    'bg-amber-500',
  cancelled:  'bg-gray-300',
  vip:        'bg-rose-500',
  converted:  'bg-emerald-600',
  rejected:   'bg-gray-300',
}

/* ─── page ─────────────────────────────────────────────────── */
export default function LeadsPage() {
  const staff = useStaff()
  const [leads,    setLeads]   = useState<SubscriptionLead[] | null>(null)
  const [loading,  setLoading] = useState(true)
  const [query,    setQuery]   = useState('')
  const [status,   setStatus]  = useState<LeadStatus | ''>('')
  const [source,   setSource]  = useState('')
  const [view,     setView]    = useState<'list' | 'board'>('list')
  const [selected, setSelected] = useState<SubscriptionLead | null>(null)
  const [addOpen,  setAddOpen]  = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router       = useRouter()

  useEffect(() => {
    load()
    if (searchParams?.get('add') === '1') { setAddOpen(true); router.replace('/sales/leads') }
  }, [])

  async function load() {
    setLoading(true)
    setLeads(await fetchAllLeads())
    setLoading(false)
  }

  /* sources for dropdown */
  const sources = useMemo(() => {
    const s = new Set<string>()
    for (const l of leads ?? []) { const v = l.lead_source ?? l.source; if (v) s.add(v) }
    return [...s].sort()
  }, [leads])

  /* filtered */
  const filtered = useMemo(() => {
    if (!leads) return []
    const q = query.trim().toLowerCase()
    return leads.filter(l => {
      const s = normalizeStatus(l.status)
      if (status && s !== status) return false
      if (source && (l.lead_source ?? l.source) !== source) return false
      if (q) {
        const hay = `${l.full_name} ${l.phone ?? ''} ${l.city ?? ''} ${l.lead_source ?? l.source ?? ''} ${l.course ?? ''} ${l.notes ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [leads, query, status, source])

  /* summary counts */
  const counts = useMemo(() => ({
    total:     filtered.length,
    overdue:   filtered.filter(isOverdue).length,
    today:     filtered.filter(isToday).length,
    confirmed: filtered.filter(l => normalizeStatus(l.status) === 'confirmed').length,
    paid:      filtered.filter(l => ['paid','converted'].includes(normalizeStatus(l.status))).length,
  }), [filtered])

  /* groups for list view */
  const groups = useMemo(() => {
    const g: Record<UrgencyGroup, SubscriptionLead[]> = {
      overdue: [], today: [], upcoming: [], none: [], paid: [], cancelled: [],
    }
    for (const l of filtered) g[urgency(l)].push(l)
    type GroupDef = { key: UrgencyGroup; label: string; urgent?: boolean; dim?: boolean }
    const defs: GroupDef[] = [
      { key: 'overdue',  label: 'Overdue',         urgent: true },
      { key: 'today',    label: 'Follow-up today',  urgent: true },
      { key: 'upcoming', label: 'This week' },
      { key: 'none',     label: 'No date set' },
      { key: 'paid',     label: 'Paid',      dim: true },
      { key: 'cancelled',label: 'Cancelled', dim: true },
    ]
    return defs.filter(d => g[d.key].length > 0).map(d => ({ ...d, leads: g[d.key] }))
  }, [filtered])

  /* kanban cols */
  const kanbanCols = useMemo(() => {
    const c: Record<LeadStatus, SubscriptionLead[]> = {
      new:[], contacted:[], interested:[], follow_up:[],
      confirmed:[], paid:[], delayed:[], cancelled:[], vip:[],
      converted:[], rejected:[],
    }
    for (const l of filtered) {
      const s = normalizeStatus(l.status)
      if (l.is_vip && !['paid','cancelled','converted','rejected'].includes(s)) c.vip.push(l)
      else c[s].push(l)
    }
    return c
  }, [filtered])

  async function moveStatus(id: string, next: LeadStatus) {
    const t = leads?.find(l => l.id === id); if (!t) return
    const prev = normalizeStatus(t.status)
    setLeads(p => p?.map(l => l.id === id ? { ...l, status: next } : l) ?? null)
    try {
      if (next === 'vip') await patchLead(id, { is_vip: true } as any)
      else { await updateLeadStatus(id, next, staff.id); if (t.is_vip) await patchLead(id, { is_vip: false } as any) }
      await logLeadEvent({ leadId: id, eventType: 'status_changed', title: `${LEAD_STATUS_META[prev]?.label} → ${LEAD_STATUS_META[next]?.label}` })
      await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: id, before: { status: prev }, after: { status: next } })
    } catch { load() }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between gap-6 mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Leads</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">
                {counts.total} leads
                {counts.overdue > 0 && <span className="text-red-500 font-semibold"> · {counts.overdue} overdue</span>}
                {counts.today   > 0 && <span className="text-orange-500 font-semibold"> · {counts.today} today</span>}
                {counts.confirmed > 0 && <span className="text-emerald-600 font-semibold"> · {counts.confirmed} confirmed</span>}
                {counts.paid > 0 && <span className="text-gray-500"> · {counts.paid} paid</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Refresh"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <RotateCcw size={15} />
            </button>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors shadow-sm">
              <Plus size={15} /> New lead
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search name, phone, source…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition-colors placeholder:text-gray-400"
            />
          </div>

          {/* Status */}
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors cursor-pointer">
            <option value="">All statuses</option>
            {LEAD_STATUSES.filter(s=>!['vip','converted','rejected'].includes(s)).map(s =>
              <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
            )}
          </select>

          {/* Source */}
          {sources.length > 0 && (
            <select value={source} onChange={e => setSource(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors cursor-pointer">
              <option value="">All sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {(query || status || source) && (
            <button onClick={() => { setQuery(''); setStatus(''); setSource('') }}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline">
              Clear
            </button>
          )}

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-0.5 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Rows3 size={13}/> List
            </button>
            <button onClick={() => setView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid size={13}/> Board
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={22} className="animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} hasFilters={!!(query || status || source)} onClear={() => { setQuery(''); setStatus(''); setSource('') }} />
      ) : view === 'list' ? (
        /* ── List view ── */
        <div className="px-8 py-6 space-y-6">
          {groups.map(g => (
            <SectionGroup
              key={g.key}
              label={g.label}
              leads={g.leads}
              urgent={g.urgent}
              dim={g.dim}
              onSelect={setSelected}
              onStatusChange={moveStatus}
            />
          ))}
        </div>
      ) : (
        /* ── Board view ── */
        <div className="px-8 py-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {LEAD_STATUSES.filter(s => !['converted','rejected'].includes(s)).map(s => (
              <BoardCol
                key={s}
                status={s}
                leads={kanbanCols[s]}
                onSelect={setSelected}
                onDrop={id => moveStatus(id, s)}
                dragging={dragging}
                setDragging={setDragging}
              />
            ))}
          </div>
        </div>
      )}

      {selected && (
        <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onChange={async () => load()} />
      )}
      {addOpen && (
        <AddLeadDrawer onClose={() => setAddOpen(false)} onCreated={async () => load()} />
      )}
    </div>
  )
}

/* ─── Section group ─────────────────────────────────────────── */
function SectionGroup({ label, leads, urgent, dim, onSelect, onStatusChange }: {
  label: string; leads: SubscriptionLead[]; urgent?: boolean; dim?: boolean
  onSelect: (l: SubscriptionLead) => void
  onStatusChange: (id: string, s: LeadStatus) => void
}) {
  const [open, setOpen] = useState(!dim)
  return (
    <div>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-2 group w-full text-left"
      >
        <span className={`text-xs font-bold uppercase tracking-widest ${urgent ? 'text-red-500' : dim ? 'text-gray-300' : 'text-gray-500'}`}>
          {label}
        </span>
        <span className={`text-xs font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-gray-400'}`}>
          {leads.length}
        </span>
        <span className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">
          {open ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
        </span>
      </button>

      {/* Table */}
      {open && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {leads.map((lead, i) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isLast={i === leads.length - 1}
              onSelect={() => onSelect(lead)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Lead row ──────────────────────────────────────────────── */
function LeadRow({ lead: l, isLast, onSelect, onStatusChange }: {
  lead: SubscriptionLead; isLast: boolean
  onSelect: () => void
  onStatusChange: (id: string, s: LeadStatus) => void
}) {
  const status  = normalizeStatus(l.status)
  const urg     = urgency(l)
  const wa      = whatsappLink(l.phone, `مرحبا ${l.full_name}`)
  const source  = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const course  = getCourseMeta(l.course)
  const [statusOpen, setStatusOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statusOpen) return
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setStatusOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [statusOpen])

  /* urgency stripe color */
  const stripe = urg === 'overdue' ? 'border-l-red-400' : urg === 'today' ? 'border-l-orange-400' : 'border-l-transparent'

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-l-[3px] ${stripe} ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      {/* Name + tags */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {l.is_vip && <Crown size={11} className="text-rose-500 flex-shrink-0"/>}
          <span className="font-semibold text-gray-900 text-sm truncate">{l.full_name}</span>
          {source && <span className="text-gray-400 text-xs hidden sm:inline">{source.emoji}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {l.phone && (
            <span className="text-[11px] text-gray-400 font-mono">{l.phone}</span>
          )}
          {l.course && (
            <span className="text-[11px] text-gray-400">{course.short}</span>
          )}
          {l.city && (
            <span className="text-[11px] text-gray-400">{l.city}</span>
          )}
        </div>
      </div>

      {/* Amount */}
      {l.amount_mad ? (
        <div className="hidden md:block text-sm font-bold text-gray-700 tabular-nums flex-shrink-0">
          {l.amount_mad.toLocaleString()} MAD
        </div>
      ) : <div className="hidden md:block w-16"/>}

      {/* Status — inline changer */}
      <div className="flex-shrink-0" onClick={e => e.stopPropagation()} ref={ref}>
        <div className="relative">
          <button
            onClick={() => setStatusOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status] ?? 'bg-gray-300'}`}/>
            <span className="hidden sm:inline">{LEAD_STATUS_META[status]?.short ?? status}</span>
            <ChevronDown size={10} className="text-gray-300 group-hover:text-gray-500"/>
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                Change status
              </div>
              {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s => (
                <button key={s} onClick={() => { onStatusChange(l.id, s); setStatusOpen(false) }}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${s === status ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[s]}`}/>
                  {LEAD_STATUS_META[s].label}
                  {s === status && <span className="ml-auto text-[10px] text-gray-400">current</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up date */}
      <div className="flex-shrink-0 w-20 hidden lg:block">
        {l.next_followup_at ? (
          <div className={`flex items-center gap-1 text-xs font-medium ${urg === 'overdue' ? 'text-red-500' : urg === 'today' ? 'text-orange-500' : 'text-gray-400'}`}>
            {urg === 'overdue' && <AlertCircle size={11}/>}
            {urg === 'today'   && <Clock size={11}/>}
            {fmtDate(l.next_followup_at)}
          </div>
        ) : <span/>}
      </div>

      {/* Created */}
      <div className="flex-shrink-0 w-14 text-right hidden xl:block">
        <span className="text-xs text-gray-300">{daysOld(l.created_at)}</span>
      </div>

      {/* Actions — always visible */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
        {wa && (
          <a href={wa} target="_blank" rel="noopener"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="WhatsApp">
            <MessageCircle size={15}/>
          </a>
        )}
        {l.phone && (
          <a href={`tel:${l.phone}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Call">
            <Phone size={15}/>
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── Board (kanban) ─────────────────────────────────────────── */
function BoardCol({ status, leads, onSelect, onDrop, dragging, setDragging }: {
  status: LeadStatus; leads: SubscriptionLead[]
  onSelect: (l: SubscriptionLead) => void; onDrop: (id: string) => void
  dragging: string | null; setDragging: (id: string | null) => void
}) {
  const [over, setOver] = useState(false)
  const meta = LEAD_STATUS_META[status]
  const totalMad = leads.reduce((s, l) => s + (l.amount_mad ?? 0), 0)

  return (
    <div
      className={`w-64 flex-shrink-0 flex flex-col rounded-xl border transition-colors ${over ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200 bg-gray-50'}`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id) }}
    >
      {/* Col header */}
      <div className="px-3 py-3 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot[status]}`}/>
          <span className="font-semibold text-sm text-gray-800">{meta.label}</span>
          <span className="ml-auto text-xs text-gray-400 font-mono">{leads.length}</span>
        </div>
        {totalMad > 0 && (
          <div className="text-[11px] text-gray-400 font-bold mt-0.5 tabular-nums">
            {totalMad.toLocaleString()} MAD
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="p-2 flex flex-col gap-2 flex-1 min-h-[120px]">
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-300">
            Drop here
          </div>
        )}
        {leads.map(l => (
          <BoardCard key={l.id} lead={l} onClick={() => onSelect(l)}
            onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)}
            isDragging={dragging === l.id}
          />
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
  const urg = urgency(l)
  const src = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  const overdue = urg === 'overdue'
  const tod     = urg === 'today'

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-gray-300 transition-all select-none ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-start gap-1.5 mb-2">
        {l.is_vip && <Crown size={10} className="text-rose-500 mt-0.5 flex-shrink-0"/>}
        <span className="font-semibold text-sm text-gray-900 leading-snug">{l.full_name}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        {src && <span>{src.emoji}</span>}
        {l.course && <span>{getCourseMeta(l.course).short}</span>}
      </div>

      {l.amount_mad ? (
        <div className="text-xs font-bold text-gray-700 tabular-nums mb-2">
          {l.amount_mad.toLocaleString()} MAD
        </div>
      ) : null}

      {l.next_followup_at && (
        <div className={`flex items-center gap-1 text-[11px] font-medium mb-2 ${overdue ? 'text-red-500' : tod ? 'text-orange-500' : 'text-gray-400'}`}>
          {overdue && <AlertCircle size={10}/>}
          {tod && <Clock size={10}/>}
          {!overdue && !tod && <Calendar size={10}/>}
          {fmtDate(l.next_followup_at)}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 mt-1" onClick={e => e.stopPropagation()}>
        {wa && (
          <a href={wa} target="_blank" rel="noopener"
            className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold">
            <MessageCircle size={11}/> WA
          </a>
        )}
        {l.phone && (
          <a href={`tel:${l.phone}`}
            className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-semibold ml-auto">
            <Phone size={11}/>
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── Empty state ───────────────────────────────────────────── */
function EmptyState({ onAdd, hasFilters, onClear }: { onAdd: () => void; hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🧭</span>
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-bold text-gray-900 mb-1">No leads match</h3>
          <p className="text-sm text-gray-400 mb-5">Try adjusting your filters.</p>
          <button onClick={onClear} className="text-sm font-semibold text-gray-600 underline hover:text-gray-900">
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="font-bold text-gray-900 mb-1">No leads yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add your first lead from TikTok, Instagram, WhatsApp, or any other source.</p>
          <button onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors">
            <Plus size={15}/> Add first lead
          </button>
        </>
      )}
    </div>
  )
}
