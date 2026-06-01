'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, RotateCcw, MessageCircle, Phone,
  Crown, ChevronDown, Loader2, AlertCircle,
  Clock, LayoutGrid, Rows3,
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

/* ─── tiny helpers ─────────────────────────────────────────── */
const todayStr  = () => new Date().toISOString().slice(0, 10)
const in7days   = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) }

type Group = 'overdue' | 'today' | 'upcoming' | 'none' | 'paid' | 'cancelled'

function getGroup(l: SubscriptionLead): Group {
  const s = normalizeStatus(l.status)
  if (s === 'paid' || s === 'converted')    return 'paid'
  if (s === 'cancelled' || s === 'rejected') return 'cancelled'
  const d = l.next_followup_at?.slice(0, 10)
  if (!d) return 'none'
  const t = todayStr()
  if (d < t)       return 'overdue'
  if (d === t)     return 'today'
  if (d <= in7days()) return 'upcoming'
  return 'none'
}

const fmtDate = (s?: string | null) => !s ? '' : new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const daysOld = (s: string) => { const d = Math.floor((Date.now() - new Date(s).getTime()) / 86_400_000); return d === 0 ? 'today' : `${d}d` }

/* Status indicator dot */
const DOT: Record<string, string> = {
  new: 'bg-gray-300', contacted: 'bg-blue-400', interested: 'bg-violet-400',
  follow_up: 'bg-amber-400', confirmed: 'bg-emerald-500', paid: 'bg-emerald-600',
  delayed: 'bg-orange-400', cancelled: 'bg-gray-200', vip: 'bg-rose-500',
  converted: 'bg-emerald-600', rejected: 'bg-gray-200',
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function LeadsPage() {
  const staff = useStaff()
  const [leads,    setLeads]    = useState<SubscriptionLead[] | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [stFilter, setStFilter] = useState<LeadStatus | ''>('')
  const [srcFilter,setSrcFilter]= useState('')
  const [view,     setView]     = useState<'list' | 'board'>('list')
  const [selected, setSelected] = useState<SubscriptionLead | null>(null)
  const [addOpen,  setAddOpen]  = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const sp = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    load()
    if (sp?.get('add') === '1') { setAddOpen(true); router.replace('/sales/leads') }
  }, [])

  async function load() {
    setLoading(true); setLeads(await fetchAllLeads()); setLoading(false)
  }

  const sources = useMemo(() => {
    const s = new Set<string>()
    for (const l of leads ?? []) { const v = l.lead_source ?? l.source; if (v) s.add(v) }
    return [...s].sort()
  }, [leads])

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

  const summary = useMemo(() => ({
    total:    filtered.length,
    overdue:  filtered.filter(l => getGroup(l) === 'overdue').length,
    today:    filtered.filter(l => getGroup(l) === 'today').length,
    hot:      filtered.filter(l => l.is_vip || ['confirmed','delayed'].includes(normalizeStatus(l.status))).length,
  }), [filtered])

  /* grouped list */
  const sections = useMemo(() => {
    const g: Record<Group, SubscriptionLead[]> = { overdue:[], today:[], upcoming:[], none:[], paid:[], cancelled:[] }
    for (const l of filtered) g[getGroup(l)].push(l)
    return [
      { key: 'overdue' as Group,  label: 'Overdue',        color: 'text-red-500',    dot: 'bg-red-400',    leads: g.overdue,    open: true  },
      { key: 'today' as Group,    label: 'Today',           color: 'text-orange-500', dot: 'bg-orange-400', leads: g.today,      open: true  },
      { key: 'upcoming' as Group, label: 'This week',       color: 'text-blue-500',   dot: 'bg-blue-400',   leads: g.upcoming,   open: true  },
      { key: 'none' as Group,     label: 'Active',          color: 'text-gray-500',   dot: 'bg-gray-400',   leads: g.none,       open: true  },
      { key: 'paid' as Group,     label: 'Paid',            color: 'text-emerald-600',dot: 'bg-emerald-500',leads: g.paid,       open: false },
      { key: 'cancelled' as Group,label: 'Cancelled',       color: 'text-gray-400',   dot: 'bg-gray-300',   leads: g.cancelled,  open: false },
    ].filter(s => s.leads.length > 0)
  }, [filtered])

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
      await logLeadEvent({ leadId: id, eventType: 'status_changed', title: `${LEAD_STATUS_META[prev]?.label} → ${LEAD_STATUS_META[next]?.label}` })
      await logActivity({ action: 'lead_status_changed', entityType: 'lead', entityId: id, before: { status: prev }, after: { status: next } })
    } catch { load() }
  }

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">Leads</h1>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span>{summary.total} leads</span>
                {summary.overdue > 0 && <span className="text-red-500 font-semibold">· {summary.overdue} overdue</span>}
                {summary.today   > 0 && <span className="text-orange-500 font-semibold">· {summary.today} today</span>}
                {summary.hot     > 0 && <span className="text-amber-600">· {summary.hot} hot</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors">
              <Plus size={14} /> New lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 w-56 focus:outline-none focus:border-gray-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-400" />
          </div>
          <select value={stFilter} onChange={e => setStFilter(e.target.value as any)}
            className="text-sm py-1.5 px-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer">
            <option value="">All statuses</option>
            {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s =>
              <option key={s} value={s}>{LEAD_STATUS_META[s].label}</option>
            )}
          </select>
          {sources.length > 0 && (
            <select value={srcFilter} onChange={e => setSrcFilter(e.target.value)}
              className="text-sm py-1.5 px-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer">
              <option value="">All sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {(query || stFilter || srcFilter) && (
            <button onClick={() => { setQuery(''); setStFilter(''); setSrcFilter('') }}
              className="text-xs text-gray-400 hover:text-gray-700 font-medium">Clear</button>
          )}
          <div className="ml-auto flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            {(['list','board'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {v === 'list' ? <Rows3 size={12}/> : <LayoutGrid size={12}/>}
                {v === 'list' ? 'List' : 'Board'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} hasFilter={!!(query || stFilter || srcFilter)}
            onClear={() => { setQuery(''); setStFilter(''); setSrcFilter('') }} />
        ) : view === 'list' ? (
          <div className="px-8 py-5 space-y-5">
            {sections.map(({ key, ...rest }) => (
              <Section key={key} {...rest} onSelect={setSelected} onMove={move} />
            ))}
          </div>
        ) : (
          <div className="px-8 py-5 overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-4">
              {LEAD_STATUSES.filter(s => !['converted','rejected'].includes(s)).map(s => (
                <Col key={s} status={s} leads={kanbanCols[s]} onSelect={setSelected}
                  onDrop={id => move(id, s)} dragging={dragging} setDragging={setDragging} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onChange={async () => load()} />}
      {addOpen   && <AddLeadModal onClose={() => setAddOpen(false)} onCreated={() => load()} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SECTION
══════════════════════════════════════════════════════════════ */
function Section({ label, color, dot, leads, open: defaultOpen, onSelect, onMove }: {
  label: string; color: string; dot: string; leads: SubscriptionLead[]
  open: boolean; onSelect: (l: SubscriptionLead) => void; onMove: (id: string, s: LeadStatus) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 mb-1 w-full text-left group">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${color}`}>{label}</span>
        <span className="text-[11px] text-gray-400 tabular-nums">{leads.length}</span>
        <span className={`ml-auto text-gray-300 group-hover:text-gray-400 transition-colors text-xs`}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
          {leads.map(l => <Row key={l.id} lead={l} onSelect={() => onSelect(l)} onMove={onMove} />)}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ROW
══════════════════════════════════════════════════════════════ */
function Row({ lead: l, onSelect, onMove }: {
  lead: SubscriptionLead; onSelect: () => void; onMove: (id: string, s: LeadStatus) => void
}) {
  const s       = normalizeStatus(l.status)
  const g       = getGroup(l)
  const wa      = whatsappLink(l.phone, `مرحبا ${l.full_name}`)
  const src     = LEAD_SOURCES.find(x => x.id === (l.lead_source ?? l.source))
  const course  = getCourseMeta(l.course)
  const [dd, setDd] = useState(false)
  const ddRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dd) return
    const h = (e: MouseEvent) => { if (!ddRef.current?.contains(e.target as Node)) setDd(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [dd])

  const stripe = g === 'overdue' ? 'border-l-red-400' : g === 'today' ? 'border-l-orange-400' : 'border-l-transparent'

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer border-l-2 transition-colors ${stripe}`}
    >
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {l.is_vip && <Crown size={11} className="text-yellow-500 flex-shrink-0" />}
          <span className="font-semibold text-gray-900 text-sm truncate">{l.full_name}</span>
          {src && <span className="text-gray-400 text-xs flex-shrink-0 hidden sm:inline">{src.emoji}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
          {l.phone && <span className="font-mono">{l.phone}</span>}
          {l.course && !l.phone && <span>{course.short}</span>}
          {l.city && <span>{l.city}</span>}
        </div>
      </div>

      {/* Amount */}
      {l.amount_mad ? (
        <span className="text-sm font-bold text-gray-700 tabular-nums flex-shrink-0 hidden md:block">
          {l.amount_mad.toLocaleString()} MAD
        </span>
      ) : <span className="hidden md:block w-16" />}

      {/* Status dropdown */}
      <div className="flex-shrink-0" onClick={e => e.stopPropagation()} ref={ddRef}>
        <button onClick={() => setDd(o => !o)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[s] ?? 'bg-gray-300'}`} />
          <span className="hidden sm:inline font-medium">{LEAD_STATUS_META[s]?.short}</span>
          <ChevronDown size={10} className="text-gray-300" />
        </button>
        {dd && (
          <div className="absolute z-40 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
              Move to
            </div>
            {LEAD_STATUSES.filter(x => !['vip','converted','rejected'].includes(x)).map(x => (
              <button key={x} onClick={() => { onMove(l.id, x); setDd(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left transition-colors ${x === s ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[x]}`} />
                {LEAD_STATUS_META[x].label}
                {x === s && <span className="ml-auto text-[10px] text-gray-400">now</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up */}
      <div className="flex-shrink-0 w-16 hidden lg:block">
        {l.next_followup_at && (
          <span className={`text-xs flex items-center gap-1 ${g === 'overdue' ? 'text-red-500 font-semibold' : g === 'today' ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
            {g === 'overdue' && <AlertCircle size={10}/>}
            {g === 'today' && <Clock size={10}/>}
            {fmtDate(l.next_followup_at)}
          </span>
        )}
      </div>

      {/* Age */}
      <span className="flex-shrink-0 text-[11px] text-gray-300 hidden xl:block w-10 text-right">
        {daysOld(l.created_at)}
      </span>

      {/* Actions — hover only */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}>
        {wa && (
          <a href={wa} target="_blank" rel="noopener"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
            <MessageCircle size={13}/>
          </a>
        )}
        {l.phone && (
          <a href={`tel:${l.phone}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <Phone size={13}/>
          </a>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   BOARD
══════════════════════════════════════════════════════════════ */
function Col({ status, leads, onSelect, onDrop, dragging, setDragging }: {
  status: LeadStatus; leads: SubscriptionLead[]
  onSelect: (l: SubscriptionLead) => void; onDrop: (id: string) => void
  dragging: string | null; setDragging: (id: string | null) => void
}) {
  const [over, setOver] = useState(false)
  const meta = LEAD_STATUS_META[status]
  const totalMad = leads.reduce((s, l) => s + (l.amount_mad ?? 0), 0)

  return (
    <div className={`w-60 flex-shrink-0 flex flex-col rounded-xl border ${over ? 'border-yellow-300 bg-yellow-50/20' : 'border-gray-100 bg-gray-50'} transition-colors`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id) }}>
      <div className="px-3 py-2.5 border-b border-gray-100 bg-white rounded-t-xl">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[status]}`} />
          <span className="font-semibold text-sm text-gray-800">{meta.label}</span>
          <span className="ml-auto text-xs text-gray-400 tabular-nums">{leads.length}</span>
        </div>
        {totalMad > 0 && <div className="text-[10px] text-gray-400 mt-0.5 tabular-nums">{totalMad.toLocaleString()} MAD</div>}
      </div>
      <div className="p-2 flex flex-col gap-1.5 flex-1 min-h-[100px]">
        {leads.length === 0 && <p className="text-xs text-gray-300 text-center py-6">Drop here</p>}
        {leads.map(l => (
          <ColCard key={l.id} lead={l} onClick={() => onSelect(l)}
            onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)}
            isDragging={dragging === l.id} />
        ))}
      </div>
    </div>
  )
}

function ColCard({ lead: l, onClick, onDragStart, onDragEnd, isDragging }: {
  lead: SubscriptionLead; onClick: () => void
  onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const wa  = whatsappLink(l.phone, `مرحبا ${l.full_name}`)
  const g   = getGroup(l)
  const src = LEAD_SOURCES.find(s => s.id === (l.lead_source ?? l.source))
  return (
    <div draggable onDragStart={e => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }} onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all select-none ${isDragging ? 'opacity-40 scale-95' : ''}`}>
      <div className="flex items-start gap-1 mb-1.5">
        {l.is_vip && <Crown size={10} className="text-yellow-500 mt-0.5 flex-shrink-0"/>}
        <span className="font-semibold text-[13px] text-gray-900 leading-snug">{l.full_name}</span>
      </div>
      {src && <div className="text-[11px] text-gray-400 mb-1.5">{src.emoji} {src.label}</div>}
      {l.amount_mad && <div className="text-[11px] font-bold text-gray-600 tabular-nums mb-1.5">{l.amount_mad.toLocaleString()} MAD</div>}
      {l.next_followup_at && (
        <div className={`text-[11px] flex items-center gap-1 mb-1.5 ${g === 'overdue' ? 'text-red-500' : g === 'today' ? 'text-orange-500' : 'text-gray-400'}`}>
          {g === 'overdue' && <AlertCircle size={9}/>}
          {g === 'today' && <Clock size={9}/>}
          {fmtDate(l.next_followup_at)}
        </div>
      )}
      <div className="flex gap-1.5 pt-1.5 border-t border-gray-50" onClick={e => e.stopPropagation()}>
        {wa && <a href={wa} target="_blank" rel="noopener" className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 hover:underline"><MessageCircle size={10}/>WA</a>}
        {l.phone && <a href={`tel:${l.phone}`} className="text-[11px] text-blue-500 font-semibold flex items-center gap-1 hover:underline ml-auto"><Phone size={10}/></a>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   EMPTY
══════════════════════════════════════════════════════════════ */
function EmptyState({ onAdd, hasFilter, onClear }: { onAdd: () => void; hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-8">
      <div className="text-4xl mb-4">🔍</div>
      {hasFilter ? (
        <>
          <p className="font-semibold text-gray-800 mb-1">No leads match</p>
          <p className="text-sm text-gray-400 mb-4">Try adjusting or clearing your filters.</p>
          <button onClick={onClear} className="text-sm font-semibold text-gray-500 underline hover:text-gray-800">Clear filters</button>
        </>
      ) : (
        <>
          <p className="font-semibold text-gray-800 mb-1">No leads yet</p>
          <p className="text-sm text-gray-400 mb-5">Start tracking prospects from TikTok, Instagram, and WhatsApp.</p>
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors">
            <Plus size={14}/> Add first lead
          </button>
        </>
      )}
    </div>
  )
}
