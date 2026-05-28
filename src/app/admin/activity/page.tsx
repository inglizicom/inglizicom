'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Loader2, Filter, RotateCcw, ChevronDown, ChevronRight,
  User as UserIcon, FileText, CreditCard, LifeBuoy, BellRing, KanbanSquare,
} from 'lucide-react'
import { fetchRecentActivity, describeActivity, type ActivityLog } from '@/lib/activity-log-db'
import { useStaff } from '../StaffContext'

/**
 * Full activity feed — every audit row across leads, payments, profiles,
 * and tickets. Founders see all; assistants see all rows too (but the
 * sidebar hides this link for assistants by default).
 *
 * Filters: actor email, entity type, time range. Click a row to expand and
 * inspect the JSON before/after payloads.
 */
export default function ActivityLogPage() {
  const staff = useStaff()
  const [rows, setRows]         = useState<ActivityLog[] | null>(null)
  const [loading, setLoading]   = useState(true)
  const [actor, setActor]       = useState('')
  const [entityType, setEntity] = useState('')
  const [since, setSince]       = useState<'today' | '7d' | '30d' | 'all'>('30d')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const data = await fetchRecentActivity(500)
    setRows(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const actors = useMemo(() => {
    const seen = new Set<string>()
    for (const r of rows ?? []) if (r.actor_email) seen.add(r.actor_email)
    return [...seen].sort()
  }, [rows])

  const entityTypes = useMemo(() => {
    const seen = new Set<string>()
    for (const r of rows ?? []) seen.add(r.entity_type)
    return [...seen].sort()
  }, [rows])

  const filtered = useMemo(() => {
    let cutoff = 0
    if (since === 'today')  cutoff = startOfToday().getTime()
    if (since === '7d')     cutoff = Date.now() - 7 * 86_400_000
    if (since === '30d')    cutoff = Date.now() - 30 * 86_400_000
    return (rows ?? []).filter(r => {
      if (actor && r.actor_email !== actor) return false
      if (entityType && r.entity_type !== entityType) return false
      if (cutoff && new Date(r.created_at).getTime() < cutoff) return false
      return true
    })
  }, [rows, actor, entityType, since])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Audit</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Activity size={20} className="text-gray-700" /> Activity Log
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {staff.role === 'founder'
              ? 'Every action by every staff member. Click a row to see the before/after payload.'
              : 'Your team\'s recent actions.'}
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
        >
          <RotateCcw size={14} /> Refresh
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['today', '7d', '30d', 'all'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSince(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold ${
                since === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'today' ? 'Today' : s === '7d' ? '7 days' : s === '30d' ? '30 days' : 'All'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={actor}
            onChange={e => setActor(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-900"
          >
            <option value="">All actors</option>
            {actors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={entityType}
            onChange={e => setEntity(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-900"
          >
            <option value="">All entities</option>
            {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="ml-auto text-xs text-gray-400 font-semibold">
          {loading ? '…' : `${filtered.length} entries`}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
          <p className="text-sm text-gray-400">No activity matches these filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {filtered.map(row => (
            <ActivityRow
              key={row.id}
              row={row}
              expanded={expanded.has(row.id)}
              onToggle={() => toggle(row.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityRow({ row, expanded, onToggle }: { row: ActivityLog; expanded: boolean; onToggle: () => void }) {
  const Icon = entityIcon(row.entity_type)
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] text-gray-900 leading-tight">
            {describeActivity(row)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold tabular-nums">{timeAgo(row.created_at)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-wide text-[10px]">
              {row.entity_type}
            </span>
            <span>·</span>
            <span className="font-mono text-gray-500">{row.action}</span>
            {row.entity_id && (
              <>
                <span>·</span>
                <span className="font-mono text-gray-400">{row.entity_id.slice(0, 8)}</span>
              </>
            )}
            {row.actor_role && (
              <>
                <span>·</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-700 bg-yellow-50 border border-yellow-100 rounded px-1.5">
                  {row.actor_role}
                </span>
              </>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronDown  size={14} className="text-gray-400 mt-2 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-400 mt-2 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 grid sm:grid-cols-3 gap-3 text-[11px] font-mono">
          <Payload label="Before"   data={row.before_value} />
          <Payload label="After"    data={row.after_value}  />
          <Payload label="Metadata" data={row.metadata}     />
        </div>
      )}
    </div>
  )
}

function Payload({ label, data }: { label: string; data: ActivityLog['before_value'] }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1">{label}</div>
      <pre className="bg-white border border-gray-200 rounded p-2 text-[11px] text-gray-700 overflow-x-auto max-h-48">
        {data ? JSON.stringify(data, null, 2) : '—'}
      </pre>
    </div>
  )
}

function entityIcon(type: string) {
  return {
    lead:    KanbanSquare,
    payment: CreditCard,
    profile: UserIcon,
    support: LifeBuoy,
    renewal: BellRing,
    ticket:  LifeBuoy,
  }[type] ?? FileText
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
