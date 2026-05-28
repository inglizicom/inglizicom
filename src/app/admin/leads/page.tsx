'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search, Loader2, Filter, MessageCircle, Phone, Calendar,
  Plus, X, ExternalLink, RotateCcw, LayoutGrid, List, Crown,
} from 'lucide-react'
import {
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  fetchAllLeads, updateLeadStatus, patchLead, fetchLeadSources,
  whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '../StaffContext'
import LeadDetailDrawer from './LeadDetailDrawer'

/**
 * Lead Pipeline page — Kanban board with drag-and-drop between statuses.
 * Native HTML5 dnd (no library). Each column is a status; cards are leads.
 * Clicking a card opens a side drawer for editing (notes / follow-up / assign).
 */
export default function LeadsKanbanPage() {
  const staff = useStaff()
  const [allLeads, setAllLeads]   = useState<SubscriptionLead[] | null>(null)
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<'kanban' | 'list'>('kanban')
  const [query, setQuery]         = useState('')
  const [sourceFilter, setSource] = useState<string>('')
  const [sources, setSources]     = useState<string[]>([])
  const [selected, setSelected]   = useState<SubscriptionLead | null>(null)
  const [dragging, setDragging]   = useState<string | null>(null)

  // initial load
  useEffect(() => { loadAll() ; fetchLeadSources().then(setSources) }, [])

  async function loadAll() {
    setLoading(true)
    const rows = await fetchAllLeads()
    setAllLeads(rows)
    setLoading(false)
  }

  // Filtered + grouped
  const grouped = useMemo(() => {
    const empty: Record<LeadStatus, SubscriptionLead[]> = {
      new: [], contacted: [], interested: [], follow_up: [],
      confirmed: [], paid: [], delayed: [], cancelled: [], vip: [],
      converted: [], rejected: [],
    }
    if (!allLeads) return empty
    const q = query.trim().toLowerCase()
    for (const lead of allLeads) {
      if (sourceFilter && lead.source !== sourceFilter) continue
      if (q) {
        const hay = `${lead.full_name} ${lead.phone ?? ''} ${lead.city ?? ''} ${lead.goal ?? ''} ${lead.plan_id ?? ''}`.toLowerCase()
        if (!hay.includes(q)) continue
      }
      const status = normalizeStatus(lead.status)
      // VIP overrides the normal column when the flag is set, unless lead has reached terminal status
      if (lead.is_vip && status !== 'paid' && status !== 'cancelled') empty.vip.push(lead)
      else empty[status].push(lead)
    }
    return empty
  }, [allLeads, query, sourceFilter])

  // Move a lead by dropping it onto a column header / column body.
  async function moveLead(leadId: string, newStatus: LeadStatus) {
    const target = allLeads?.find(l => l.id === leadId)
    if (!target) return
    const prev = normalizeStatus(target.status)
    if (prev === newStatus && !target.is_vip) return
    // optimistic UI
    setAllLeads(prev => prev?.map(l => l.id === leadId
      ? { ...l, status: newStatus, is_vip: newStatus === 'vip' ? true : (newStatus === 'paid' || newStatus === 'cancelled' ? false : l.is_vip) }
      : l) ?? null)
    try {
      // 'vip' is a UI bucket, not a DB enum value. We toggle is_vip instead.
      if (newStatus === 'vip') {
        await patchLead(leadId, { is_vip: true })
      } else {
        await updateLeadStatus(leadId, newStatus, staff.id)
        if (target.is_vip) await patchLead(leadId, { is_vip: false })
      }
      await logActivity({
        action:      'lead_status_changed',
        entityType:  'lead',
        entityId:    leadId,
        before:      { status: prev, is_vip: target.is_vip },
        after:       { status: newStatus, is_vip: newStatus === 'vip' },
      })
    } catch (err) {
      console.error(err)
      // Roll back
      await loadAll()
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1800px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Pipeline</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Drag a card between columns to update its status. Click a card to add notes or schedule a follow-up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            title="Refresh"
          >
            <RotateCcw size={14} />
          </button>
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setView('kanban')}
              className={`px-2.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${
                view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <LayoutGrid size={13} /> Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-2.5 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${
                view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <List size={13} /> List
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name, phone, city, goal…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={sourceFilter}
            onChange={e => setSource(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-900"
          >
            <option value="">All sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="ml-auto text-xs text-gray-400 font-semibold">
          {loading ? '…' : `${allLeads?.length ?? 0} total`}
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {!loading && view === 'kanban' && (
        <div className="overflow-x-auto pb-4 -mx-6 lg:-mx-10 px-6 lg:px-10">
          <div className="flex gap-3 min-w-max">
            {LEAD_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                leads={grouped[status]}
                onCardClick={l => setSelected(l)}
                onDrop={leadId => moveLead(leadId, status)}
                dragging={dragging}
                setDragging={setDragging}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && view === 'list' && (
        <ListView
          leads={(allLeads ?? []).filter(l => {
            if (sourceFilter && l.source !== sourceFilter) return false
            if (query.trim()) {
              const hay = `${l.full_name} ${l.phone ?? ''} ${l.city ?? ''} ${l.goal ?? ''}`.toLowerCase()
              if (!hay.includes(query.trim().toLowerCase())) return false
            }
            return true
          })}
          onSelect={setSelected}
        />
      )}

      {selected && (
        <LeadDetailDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onChange={async () => { await loadAll() }}
        />
      )}
    </div>
  )
}

/* ───────────────────── Kanban column ───────────────────── */

function KanbanColumn({
  status, leads, onCardClick, onDrop, dragging, setDragging,
}: {
  status:       LeadStatus
  leads:        SubscriptionLead[]
  onCardClick:  (l: SubscriptionLead) => void
  onDrop:       (leadId: string) => void
  dragging:     string | null
  setDragging:  (id: string | null) => void
}) {
  const [over, setOver] = useState(false)
  const meta = LEAD_STATUS_META[status]

  return (
    <div
      className="w-[280px] flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex flex-col"
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault(); setOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDrop(id)
      }}
    >
      <div className={`px-3 py-2.5 border-b border-gray-200 flex items-center gap-2 sticky top-0 bg-gray-50 rounded-t-xl ${
        over ? 'ring-2 ring-yellow-400 ring-inset' : ''
      }`}>
        <span className={`inline-block w-2 h-2 rounded-full ${dot(status)}`} />
        <span className="font-bold text-[12.5px] text-gray-900 tracking-tight">{meta.label}</span>
        <span className="ml-auto text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5 tabular-nums">
          {leads.length}
        </span>
      </div>
      <div className={`p-2 space-y-2 min-h-[200px] flex-1 ${over ? 'bg-yellow-50/40' : ''}`}>
        {leads.length === 0 && (
          <div className="text-center text-[11px] text-gray-400 py-6">drop a lead here</div>
        )}
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onClick={() => onCardClick(lead)}
            onDragStart={() => setDragging(lead.id)}
            onDragEnd={() => setDragging(null)}
            dragging={dragging === lead.id}
          />
        ))}
      </div>
    </div>
  )
}

function dot(status: LeadStatus): string {
  return {
    new:        'bg-blue-500',
    contacted:  'bg-indigo-500',
    interested: 'bg-purple-500',
    follow_up:  'bg-orange-500',
    confirmed:  'bg-emerald-500',
    paid:       'bg-yellow-500',
    delayed:    'bg-amber-600',
    cancelled:  'bg-gray-400',
    vip:        'bg-rose-500',
    converted:  'bg-yellow-500',
    rejected:   'bg-gray-400',
  }[status] ?? 'bg-gray-300'
}

/* ───────────────────── Lead card ───────────────────── */

function LeadCard({
  lead, onClick, onDragStart, onDragEnd, dragging,
}: {
  lead:        SubscriptionLead
  onClick:     () => void
  onDragStart: () => void
  onDragEnd:   () => void
  dragging:    boolean
}) {
  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={[
        'bg-white border border-gray-200 rounded-lg p-2.5 text-[12.5px] cursor-grab active:cursor-grabbing',
        'hover:border-gray-400 hover:shadow-sm transition-all',
        dragging ? 'opacity-40 scale-95' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <div className="font-bold text-gray-900 leading-tight flex-1 truncate">{lead.full_name}</div>
        {lead.is_vip && <Crown size={11} className="text-rose-500 mt-0.5 flex-shrink-0" />}
      </div>
      <div className="text-[11px] text-gray-500 leading-tight mb-2">
        {lead.plan_id ?? '—'}{lead.amount_mad ? ` · ${lead.amount_mad} MAD` : ''}
      </div>
      <div className="flex items-center gap-1.5">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold hover:bg-green-100"
            title="WhatsApp"
          >
            <MessageCircle size={9} /> WA
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200"
            title="Call"
          >
            <Phone size={9} />
          </a>
        )}
        {lead.source && (
          <span className="text-[10px] text-gray-400 truncate ml-auto" title={lead.source}>
            {lead.source}
          </span>
        )}
      </div>
      {lead.next_followup_at && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-orange-700 font-semibold">
          <Calendar size={9} />
          {new Date(lead.next_followup_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

/* ───────────────────── List view ───────────────────── */

function ListView({ leads, onSelect }: { leads: SubscriptionLead[]; onSelect: (l: SubscriptionLead) => void }) {
  if (leads.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-12">No leads match your filters.</div>
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="text-left px-4 py-2.5">Name</th>
            <th className="text-left px-4 py-2.5">Status</th>
            <th className="text-left px-4 py-2.5 hidden md:table-cell">Plan</th>
            <th className="text-left px-4 py-2.5 hidden lg:table-cell">Source</th>
            <th className="text-left px-4 py-2.5 hidden lg:table-cell">Created</th>
            <th className="text-left px-4 py-2.5">Phone</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map(l => {
            const s    = normalizeStatus(l.status)
            const meta = LEAD_STATUS_META[s]
            return (
              <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(l)}>
                <td className="px-4 py-2.5 font-semibold text-gray-900">
                  <div className="flex items-center gap-1.5">
                    {l.is_vip && <Crown size={11} className="text-rose-500" />}
                    {l.full_name}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${meta.color}`}>
                    {meta.short}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-600 hidden md:table-cell">{l.plan_id ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">{l.source ?? 'direct'}</td>
                <td className="px-4 py-2.5 text-gray-400 hidden lg:table-cell">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{l.phone ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <ExternalLink size={13} className="inline text-gray-400" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
