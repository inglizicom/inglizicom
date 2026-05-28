'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Loader2, Filter, MessageCircle, Phone, Calendar,
  ExternalLink, RotateCcw, LayoutGrid, List, Crown,
  TrendingUp, Users as UsersIcon, AlertOctagon, Flame, Wallet,
  CheckCircle2, Plus, Sparkles, MapPin, Globe, Tag,
} from 'lucide-react'
import {
  LEAD_STATUSES, LEAD_STATUS_META, normalizeStatus,
  fetchAllLeads, updateLeadStatus, patchLead, fetchLeadSources,
  whatsappLink,
  type SubscriptionLead, type LeadStatus,
} from '@/lib/leads-db'
import { fetchLeadPipelineStats, type LeadPipelineStats } from '@/lib/crm-stats'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '../StaffContext'
import LeadDetailDrawer from './LeadDetailDrawer'
import AddLeadDrawer from './AddLeadDrawer'

/**
 * Lead Pipeline — e-commerce-style tracker for the founder's sales funnel.
 *
 * Sections (top → bottom):
 *   1. Header + Add Lead button
 *   2. KPI strip (Total / New today / Hot / Overdue / Pipeline value / Closed value)
 *   3. Visual funnel bar — stacked widths per status, click a segment to filter
 *   4. Quick-filter chips (All / Hot / VIP / New today / Overdue / Mine)
 *   5. Search + source dropdown + view toggle (Kanban / List)
 *   6. Kanban (HTML5 drag-and-drop) or List view with rich cards / rows
 */
type QuickFilter = 'all' | 'hot' | 'vip' | 'today' | 'overdue' | 'mine'

export default function LeadsPipelinePage() {
  const staff = useStaff()
  const [allLeads, setAllLeads]   = useState<SubscriptionLead[] | null>(null)
  const [stats, setStats]         = useState<LeadPipelineStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<'kanban' | 'list'>('kanban')
  const [query, setQuery]         = useState('')
  const [sourceFilter, setSource] = useState<string>('')
  const [statusFilter, setStatus] = useState<LeadStatus | ''>('')
  const [quick, setQuick]         = useState<QuickFilter>('all')
  const [sources, setSources]     = useState<string[]>([])
  const [selected, setSelected]   = useState<SubscriptionLead | null>(null)
  const [dragging, setDragging]   = useState<string | null>(null)
  const [addOpen, setAddOpen]     = useState(false)
  const searchParams              = useSearchParams()
  const router                    = useRouter()

  useEffect(() => { loadAll() ; fetchLeadSources().then(setSources) }, [])

  // Deep-link: /admin/leads?add=1 opens the AddLeadDrawer
  useEffect(() => {
    if (searchParams?.get('add') === '1') {
      setAddOpen(true)
      // Strip the param so refreshing doesn't re-open the drawer
      router.replace('/admin/leads')
    }
  }, [searchParams, router])

  async function loadAll() {
    setLoading(true)
    const [rows, s] = await Promise.all([fetchAllLeads(), fetchLeadPipelineStats()])
    setAllLeads(rows); setStats(s)
    setLoading(false)
  }

  // Combined filter — search + source + quick chip + status segment
  const filtered = useMemo(() => {
    if (!allLeads) return []
    const now = Date.now()
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const q = query.trim().toLowerCase()
    return allLeads.filter(lead => {
      if (sourceFilter && lead.source !== sourceFilter) return false
      if (statusFilter) {
        const s = normalizeStatus(lead.status)
        if (statusFilter === 'vip') { if (!lead.is_vip) return false }
        else if (s !== statusFilter) return false
      }
      if (quick === 'hot' && !(lead.is_vip || ['confirmed', 'delayed'].includes(normalizeStatus(lead.status)))) return false
      if (quick === 'vip' && !lead.is_vip) return false
      if (quick === 'today' && new Date(lead.created_at).getTime() < todayStart.getTime()) return false
      if (quick === 'overdue') {
        const s = normalizeStatus(lead.status)
        const overdue = lead.next_followup_at && new Date(lead.next_followup_at).getTime() < now && s !== 'paid' && s !== 'cancelled'
        if (!overdue) return false
      }
      if (quick === 'mine' && lead.assigned_to_id !== staff.id) return false
      if (q) {
        const hay = `${lead.full_name} ${lead.phone ?? ''} ${lead.city ?? ''} ${lead.goal ?? ''} ${lead.plan_id ?? ''} ${lead.source ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [allLeads, query, sourceFilter, statusFilter, quick, staff.id])

  const grouped = useMemo(() => {
    const empty: Record<LeadStatus, SubscriptionLead[]> = {
      new: [], contacted: [], interested: [], follow_up: [],
      confirmed: [], paid: [], delayed: [], cancelled: [], vip: [],
      converted: [], rejected: [],
    }
    for (const lead of filtered) {
      const status = normalizeStatus(lead.status)
      if (lead.is_vip && status !== 'paid' && status !== 'cancelled') empty.vip.push(lead)
      else empty[status].push(lead)
    }
    return empty
  }, [filtered])

  async function moveLead(leadId: string, newStatus: LeadStatus) {
    const target = allLeads?.find(l => l.id === leadId)
    if (!target) return
    const prev = normalizeStatus(target.status)
    if (prev === newStatus && !target.is_vip) return
    setAllLeads(prev => prev?.map(l => l.id === leadId
      ? { ...l, status: newStatus, is_vip: newStatus === 'vip' ? true : (newStatus === 'paid' || newStatus === 'cancelled' ? false : l.is_vip) }
      : l) ?? null)
    try {
      if (newStatus === 'vip') await patchLead(leadId, { is_vip: true })
      else {
        await updateLeadStatus(leadId, newStatus, staff.id)
        if (target.is_vip) await patchLead(leadId, { is_vip: false })
      }
      await logActivity({
        action:     'lead_status_changed',
        entityType: 'lead',
        entityId:   leadId,
        before:     { status: prev, is_vip: target.is_vip },
        after:      { status: newStatus, is_vip: newStatus === 'vip' },
      })
      // Refresh stats only (cheap)
      fetchLeadPipelineStats().then(setStats)
    } catch (err) {
      console.error(err)
      await loadAll()
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1800px] mx-auto">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Pipeline</div>
          <h1 className="text-[28px] font-black tracking-tight text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every prospect from first touch to paid. Drag cards to move them through the funnel.
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
          <Link
            href="/admin/analytics"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
          >
            <TrendingUp size={14} /> Analytics
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-zinc-800 shadow-sm"
          >
            <Plus size={14} /> New lead
          </button>
        </div>
      </header>

      {/* KPI STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatTile
          icon={UsersIcon}    label="Total leads"   value={stats?.total ?? 0}
          accent="gray"       sub="all-time"
        />
        <StatTile
          icon={Sparkles}     label="New today"     value={stats?.newToday ?? 0}
          accent="blue"       sub={statTrendLabel(stats?.newToday ?? 0)}
        />
        <StatTile
          icon={Flame}        label="Hot leads"     value={stats?.hot ?? 0}
          accent="rose"       sub="VIP · confirmed · delayed"
        />
        <StatTile
          icon={AlertOctagon} label="Overdue"       value={stats?.overdue ?? 0}
          accent="orange"     sub="follow-up past due"
        />
        <StatTile
          icon={Wallet}       label="Pipeline"      value={stats?.pipelineValueMad ?? 0}
          accent="yellow"     sub="MAD active"      format="mad"
        />
        <StatTile
          icon={CheckCircle2} label="Closed · paid" value={stats?.closedValueMad ?? 0}
          accent="emerald"    sub={`${stats?.conversionPct ?? 0}% conversion`} format="mad"
        />
      </section>

      {/* FUNNEL BAR */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-[14px] tracking-tight">Pipeline funnel</h2>
            <span className="text-[11px] text-gray-400">click a segment to filter</span>
          </div>
          {statusFilter && (
            <button
              onClick={() => setStatus('')}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-900"
            >
              clear filter ×
            </button>
          )}
        </div>
        <FunnelBar
          stats={stats?.perStatus ?? {}}
          active={statusFilter}
          onPick={s => setStatus(statusFilter === s ? '' : s)}
        />
      </section>

      {/* QUICK CHIPS */}
      <section className="flex flex-wrap items-center gap-2 mb-3">
        <Chip active={quick === 'all'}     onClick={() => setQuick('all')}     label="All"          count={stats?.total ?? 0} />
        <Chip active={quick === 'hot'}     onClick={() => setQuick('hot')}     label="🔥 Hot"        count={stats?.hot ?? 0}     accent="rose" />
        <Chip active={quick === 'vip'}     onClick={() => setQuick('vip')}     label="👑 VIP"        count={stats?.perStatus?.vip ?? 0} accent="rose" />
        <Chip active={quick === 'today'}   onClick={() => setQuick('today')}   label="✨ New today"  count={stats?.newToday ?? 0} accent="blue" />
        <Chip active={quick === 'overdue'} onClick={() => setQuick('overdue')} label="⏰ Overdue"    count={stats?.overdue ?? 0} accent="orange" />
        <Chip active={quick === 'mine'}    onClick={() => setQuick('mine')}    label="👤 Assigned to me" accent="indigo" />

        {stats && stats.perSource.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 ml-auto pl-3 border-l border-gray-200">
            <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-gray-400">Top sources</span>
            {stats.perSource.slice(0, 4).map(s => (
              <button
                key={s.source}
                onClick={() => setSource(sourceFilter === s.source ? '' : s.source)}
                className={[
                  'inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border',
                  sourceFilter === s.source
                    ? 'bg-black text-yellow-400 border-black'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
                ].join(' ')}
              >
                <Globe size={10} /> {s.source} · {s.count}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* SEARCH + SOURCE + VIEW TOGGLE */}
      <section className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name, phone, city, goal, source…"
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
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[11px] text-gray-400 font-semibold tabular-nums hidden sm:block">
            {loading ? '…' : `${filtered.length} shown`}
          </div>
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
      </section>

      {/* BODY */}
      {loading ? (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : view === 'kanban' ? (
        <div className="overflow-x-auto pb-4 -mx-6 lg:-mx-10 px-6 lg:px-10">
          <div className="flex gap-3 min-w-max">
            {LEAD_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                leads={grouped[status]}
                onCardClick={l => setSelected(l)}
                onDrop={id => moveLead(id, status)}
                dragging={dragging}
                setDragging={setDragging}
              />
            ))}
          </div>
        </div>
      ) : (
        <ListView leads={filtered} onSelect={setSelected} />
      )}

      {selected && (
        <LeadDetailDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onChange={async () => { await loadAll() }}
        />
      )}

      {addOpen && (
        <AddLeadDrawer
          onClose={() => setAddOpen(false)}
          onCreated={async () => { await loadAll() }}
        />
      )}
    </div>
  )
}

/* ───────────── KPI tile ───────────── */

function StatTile({
  icon: Icon, label, value, sub, accent, format,
}: {
  icon:    any
  label:   string
  value:   number
  sub:     string
  accent:  'gray' | 'blue' | 'rose' | 'orange' | 'yellow' | 'emerald' | 'indigo'
  format?: 'mad'
}) {
  const colors: Record<typeof accent, string> = {
    gray:    'bg-gray-100 text-gray-700',
    blue:    'bg-blue-50 text-blue-600',
    rose:    'bg-rose-50 text-rose-600',
    orange:  'bg-orange-50 text-orange-600',
    yellow:  'bg-yellow-50 text-yellow-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo:  'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-0.5">{label}</div>
      <div className="text-[22px] font-black text-gray-900 tracking-tight tabular-nums leading-none">
        {format === 'mad'
          ? `${new Intl.NumberFormat('en-US').format(value)} MAD`
          : new Intl.NumberFormat('en-US').format(value)}
      </div>
      <div className="text-[11px] text-gray-400 mt-1 truncate">{sub}</div>
    </div>
  )
}

function statTrendLabel(n: number): string {
  if (n === 0) return 'nothing yet today'
  if (n === 1) return 'one new prospect'
  return `${n} new prospects`
}

/* ───────────── Funnel bar ───────────── */

function FunnelBar({
  stats, active, onPick,
}: {
  stats:   Record<string, number>
  active:  LeadStatus | ''
  onPick:  (s: LeadStatus) => void
}) {
  const order: LeadStatus[] = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'paid', 'delayed', 'cancelled']
  const total = order.reduce((s, k) => s + (stats[k] ?? 0), 0)
  const max = Math.max(1, total)
  return (
    <div>
      <div className="flex w-full h-8 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (count === 0) return null
          const pct = (count / max) * 100
          const isActive = active === s
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              style={{ width: `${pct}%` }}
              className={[
                segColor(s),
                'h-full transition-all flex items-center justify-center group relative',
                isActive ? 'ring-2 ring-inset ring-black' : 'hover:brightness-110',
              ].join(' ')}
              title={`${LEAD_STATUS_META[s].label} · ${count}`}
            >
              <span className="text-[10px] font-black text-white tabular-nums px-1 truncate">
                {pct > 5 ? count : ''}
              </span>
            </button>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                active === s ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${segColor(s)}`} />
              {LEAD_STATUS_META[s].short} <span className="tabular-nums text-gray-400">· {count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function segColor(s: LeadStatus): string {
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
  }[s]
}

/* ───────────── chip ───────────── */

function Chip({
  active, onClick, label, count, accent,
}: {
  active:  boolean
  onClick: () => void
  label:   string
  count?:  number
  accent?: 'rose' | 'blue' | 'orange' | 'indigo'
}) {
  const inactive = 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
  const activeClass = accent === 'rose'    ? 'bg-rose-500 border-rose-500 text-white'
                    : accent === 'blue'    ? 'bg-blue-500 border-blue-500 text-white'
                    : accent === 'orange'  ? 'bg-orange-500 border-orange-500 text-white'
                    : accent === 'indigo'  ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-black border-black text-yellow-400'
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors ${
        active ? activeClass : inactive
      }`}
    >
      {label}
      {count != null && (
        <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded ${
          active ? 'bg-black/30 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ───────────── Kanban ───────────── */

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
  const totalValue = leads.reduce((sum, l) => sum + Number(l.amount_mad ?? 0), 0)

  return (
    <div
      className={`w-[300px] flex-shrink-0 bg-gray-50 border ${over ? 'border-yellow-400' : 'border-gray-200'} rounded-xl flex flex-col transition-colors`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault(); setOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDrop(id)
      }}
    >
      <div className="px-3 py-2.5 border-b border-gray-200 sticky top-0 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${segColor(status)}`} />
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">{meta.label}</span>
          <span className="ml-auto text-[11px] font-bold text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5 tabular-nums">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
            {new Intl.NumberFormat('en-US').format(totalValue)} MAD value
          </div>
        )}
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

/* ───────────── lead card (e-commerce product-card style) ───────────── */

function LeadCard({
  lead, onClick, onDragStart, onDragEnd, dragging,
}: {
  lead:        SubscriptionLead
  onClick:     () => void
  onDragStart: () => void
  onDragEnd:   () => void
  dragging:    boolean
}) {
  const wa     = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)
  const age    = daysSince(lead.created_at)
  const overdue= isOverdue(lead)
  const score  = leadScore(lead)
  const initial= (lead.full_name?.trim()[0] ?? '?').toUpperCase()
  const avatarBg = avatarBgFor(lead.full_name ?? lead.id)

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={[
        'bg-white border rounded-lg p-2.5 text-[12.5px] cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-all relative',
        lead.is_vip ? 'border-rose-300 ring-1 ring-rose-100' : 'border-gray-200 hover:border-gray-400',
        dragging ? 'opacity-40 scale-95' : '',
      ].join(' ')}
    >
      {lead.is_vip && (
        <div className="absolute -top-1.5 left-2 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
          <Crown size={8} /> VIP
        </div>
      )}

      {/* row 1: avatar + name + score */}
      <div className="flex items-start gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-[11px] ${avatarBg}`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 leading-tight truncate">{lead.full_name}</div>
          {lead.city && (
            <div className="flex items-center gap-0.5 text-[10px] text-gray-400 truncate mt-0.5">
              <MapPin size={9} /> {lead.city}
            </div>
          )}
        </div>
        <ScoreDots score={score} />
      </div>

      {/* row 2: plan + amount (like a price tag) */}
      {(lead.plan_id || lead.amount_mad) && (
        <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px]">
          <Tag size={9} className="text-gray-400 flex-shrink-0" />
          <span className="font-bold text-gray-900 truncate">{lead.plan_id ?? '—'}</span>
          {lead.amount_mad ? (
            <span className="ml-auto font-black text-yellow-700 tabular-nums">
              {new Intl.NumberFormat('en-US').format(lead.amount_mad)} MAD
            </span>
          ) : null}
        </div>
      )}

      {/* row 3: source + age + actions */}
      <div className="flex items-center gap-1">
        {lead.source && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold truncate max-w-[80px]" title={lead.source}>
            <Globe size={9} /> {lead.source}
          </span>
        )}
        <span className="text-[10px] text-gray-400 tabular-nums">
          {age === 0 ? 'today' : `${age}d`}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              onClick={e => e.stopPropagation()}
              className="w-6 h-6 rounded flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100"
              title="WhatsApp"
            >
              <MessageCircle size={10} />
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              onClick={e => e.stopPropagation()}
              className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Call"
            >
              <Phone size={10} />
            </a>
          )}
        </div>
      </div>

      {/* row 4: follow-up alert */}
      {lead.next_followup_at && (
        <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${
          overdue ? 'text-rose-600' : 'text-orange-700'
        }`}>
          <Calendar size={9} />
          {overdue ? 'Overdue · ' : 'Follow up · '}
          {new Date(lead.next_followup_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 flex-shrink-0 mt-0.5" title={`Lead score ${score}/5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-1 h-3 rounded-sm ${
            i <= score
              ? score >= 4 ? 'bg-yellow-500' : score >= 3 ? 'bg-blue-500' : 'bg-gray-400'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

/** A rough lead-quality score 1..5. Higher = warmer/more valuable. */
function leadScore(lead: SubscriptionLead): number {
  let s = 1
  if (lead.amount_mad && lead.amount_mad > 0) s++
  if (lead.is_vip)                            s += 2
  const status = normalizeStatus(lead.status)
  if (['confirmed', 'paid'].includes(status)) s++
  if (lead.next_followup_at)                  s++
  if (lead.last_contact_at)                   s++
  return Math.min(5, s)
}

function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / 86_400_000)
}

function isOverdue(lead: SubscriptionLead): boolean {
  if (!lead.next_followup_at) return false
  if (new Date(lead.next_followup_at).getTime() >= Date.now()) return false
  const s = normalizeStatus(lead.status)
  return s !== 'paid' && s !== 'cancelled'
}

/** Stable color picker for avatar bg based on name hash. */
function avatarBgFor(seed: string): string {
  const palette = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-600',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

/* ───────────── List view ───────────── */

function ListView({ leads, onSelect }: { leads: SubscriptionLead[]; onSelect: (l: SubscriptionLead) => void }) {
  if (leads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
        <Sparkles size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 font-semibold">No leads match these filters.</p>
        <p className="text-xs text-gray-400 mt-1">Try clearing the quick chips or search box.</p>
      </div>
    )
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2.5">Lead</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5 hidden md:table-cell">Plan</th>
              <th className="text-right px-4 py-2.5 hidden md:table-cell">Amount</th>
              <th className="text-left px-4 py-2.5 hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-2.5 hidden lg:table-cell">Created</th>
              <th className="text-left px-4 py-2.5 hidden xl:table-cell">Follow-up</th>
              <th className="text-center px-4 py-2.5">Score</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(l => {
              const s    = normalizeStatus(l.status)
              const meta = LEAD_STATUS_META[s]
              const age  = daysSince(l.created_at)
              const overdue = isOverdue(l)
              return (
                <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(l)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[11px] ${avatarBgFor(l.full_name ?? l.id)}`}>
                        {(l.full_name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 flex items-center gap-1 truncate">
                          {l.is_vip && <Crown size={10} className="text-rose-500" />}
                          {l.full_name}
                        </div>
                        {l.city && <div className="text-[11px] text-gray-400 truncate">{l.city}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${meta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${segColor(s)}`} />
                      {meta.short}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 hidden md:table-cell">{l.plan_id ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold text-yellow-700 hidden md:table-cell">
                    {l.amount_mad ? `${new Intl.NumberFormat('en-US').format(l.amount_mad)} MAD` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">
                    {l.source
                      ? <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold"><Globe size={9} /> {l.source}</span>
                      : 'direct'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 hidden lg:table-cell text-[12px] tabular-nums">
                    {age === 0 ? 'today' : `${age}d ago`}
                  </td>
                  <td className="px-4 py-2.5 hidden xl:table-cell">
                    {l.next_followup_at ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${overdue ? 'text-rose-600' : 'text-orange-700'}`}>
                        <Calendar size={10} /> {new Date(l.next_followup_at).toLocaleDateString()}
                      </span>
                    ) : <span className="text-gray-300 text-[11px]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="inline-flex"><ScoreDots score={leadScore(l)} /></div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <ExternalLink size={13} className="inline text-gray-400" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
