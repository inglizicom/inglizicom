'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BellRing, Loader2, MessageCircle, Mail, AlertCircle, CalendarClock,
  Phone, CheckCircle2, RotateCcw, ChevronRight,
} from 'lucide-react'
import { fetchRenewalCandidates, type RenewalRow } from '@/lib/crm-stats'
import { logActivity } from '@/lib/activity-log-db'
import { updateUser } from '@/lib/users-db'
import { useStaff } from '@/lib/staff-context'

/**
 * Renewals page — shows every paying student whose subscription is expiring
 * in the next 30 days OR has already expired. Bucketed for fast triage.
 */
export default function RenewalsPage() {
  const staff = useStaff()
  const [rows, setRows]       = useState<RenewalRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<RenewalRow['bucket'] | 'all'>('all')

  async function load() {
    setLoading(true)
    const data = await fetchRenewalCandidates()
    setRows(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const buckets = useMemo(() => {
    const groups: Record<RenewalRow['bucket'], RenewalRow[]> = {
      expired: [], due7: [], due15: [], due30: [],
    }
    for (const r of rows ?? []) groups[r.bucket].push(r)
    return groups
  }, [rows])

  const visible = useMemo(() => {
    if (filter === 'all') return rows ?? []
    return buckets[filter] ?? []
  }, [filter, rows, buckets])

  async function extend(row: RenewalRow, days: number) {
    const newExpiry = new Date(row.plan_expires_at ?? Date.now())
    if (newExpiry.getTime() < Date.now()) newExpiry.setTime(Date.now())
    newExpiry.setDate(newExpiry.getDate() + days)
    try {
      await updateUser(row.id, { plan_expires_at: newExpiry.toISOString() })
      await logActivity({
        action:     'subscription_renewed',
        entityType: 'profile',
        entityId:   row.id,
        before:     { plan_expires_at: row.plan_expires_at },
        after:      { plan_expires_at: newExpiry.toISOString() },
        metadata:   { extendedDays: days },
      })
      await load()
    } catch (err: any) {
      alert('Could not extend: ' + (err?.message ?? 'unknown'))
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Retention</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <BellRing size={20} className="text-amber-500" /> Renewals
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Subscriptions expiring soon — reach out before they lapse.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
        >
          <RotateCcw size={14} /> Refresh
        </button>
      </header>

      {/* Bucket summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BucketCard
          label="Expired"       count={buckets.expired.length}
          accent="rose"   subtitle="needs immediate call"
          active={filter === 'expired'} onClick={() => setFilter(filter === 'expired' ? 'all' : 'expired')}
        />
        <BucketCard
          label="Due in 7 days" count={buckets.due7.length}
          accent="orange" subtitle="this week"
          active={filter === 'due7'} onClick={() => setFilter(filter === 'due7' ? 'all' : 'due7')}
        />
        <BucketCard
          label="Due in 15 days" count={buckets.due15.length}
          accent="amber"  subtitle="warm reminder"
          active={filter === 'due15'} onClick={() => setFilter(filter === 'due15' ? 'all' : 'due15')}
        />
        <BucketCard
          label="Due in 30 days" count={buckets.due30.length}
          accent="yellow" subtitle="heads-up"
          active={filter === 'due30'} onClick={() => setFilter(filter === 'due30' ? 'all' : 'due30')}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-gray-600 font-semibold">All clear in this bucket.</p>
          <p className="text-sm text-gray-400 mt-1">No one expiring in this window — nice work.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5">Student</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Plan</th>
                <th className="text-left px-4 py-2.5">Expires</th>
                <th className="text-left px-4 py-2.5 hidden lg:table-cell">Note</th>
                <th className="text-left px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(r => <RenewalRowItem key={r.id} row={r} onExtend={extend} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BucketCard({
  label, count, accent, subtitle, active, onClick,
}: {
  label:    string
  count:    number
  accent:   'rose' | 'orange' | 'amber' | 'yellow'
  subtitle: string
  active:   boolean
  onClick:  () => void
}) {
  const styles = {
    rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   pill: 'bg-rose-500'   },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', pill: 'bg-orange-500' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  pill: 'bg-amber-500'  },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', pill: 'bg-yellow-500' },
  }[accent]
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-2xl border p-4 text-left transition-all w-full',
        active ? `${styles.bg} ${styles.border} ring-2 ring-offset-1 ring-${accent}-300` : 'bg-white border-gray-200 hover:border-gray-300',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${styles.pill}`} />
        <div className={`text-[11px] font-bold uppercase tracking-[0.12em] ${active ? styles.text : 'text-gray-500'}`}>
          {label}
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight tabular-nums">{count}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>
    </button>
  )
}

function RenewalRowItem({ row, onExtend }: { row: RenewalRow; onExtend: (r: RenewalRow, days: number) => void }) {
  const display = row.full_name || row.email || row.id.slice(0, 8)
  const dueLabel =
    row.daysUntilExpiry < 0  ? `Expired ${Math.abs(row.daysUntilExpiry)} d ago`
    : row.daysUntilExpiry === 0 ? 'Expires today'
    : `In ${row.daysUntilExpiry} day${row.daysUntilExpiry === 1 ? '' : 's'}`
  const dueAccent = row.daysUntilExpiry < 0 ? 'text-rose-600' : row.daysUntilExpiry <= 7 ? 'text-orange-600' : 'text-amber-600'
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2.5">
        <div className="font-semibold text-gray-900 truncate">{display}</div>
        {row.email && row.email !== display && (
          <div className="text-[11px] text-gray-400 truncate">{row.email}</div>
        )}
      </td>
      <td className="px-4 py-2.5 hidden md:table-cell">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wide">
          {row.plan}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <div className={`flex items-center gap-1.5 font-bold ${dueAccent}`}>
          <CalendarClock size={12} />
          {dueLabel}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {row.plan_expires_at ? new Date(row.plan_expires_at).toLocaleDateString() : '—'}
        </div>
      </td>
      <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-gray-500 max-w-[220px] truncate" title={row.plan_note ?? undefined}>
        {row.plan_note ?? '—'}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-[11px] font-bold hover:bg-gray-200"
              title="Send email"
            >
              <Mail size={10} /> Email
            </a>
          )}
          <button
            onClick={() => onExtend(row, 30)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-400 text-black text-[11px] font-bold hover:bg-yellow-500"
            title="Extend by 30 days"
          >
            <ChevronRight size={10} /> +30d
          </button>
          <button
            onClick={() => onExtend(row, 90)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-300 text-black text-[11px] font-bold hover:bg-yellow-400"
            title="Extend by 90 days"
          >
            +90d
          </button>
          <Link
            href={`/sales/students?focus=${row.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-gray-600 text-[11px] font-bold hover:bg-gray-50"
          >
            Open
          </Link>
        </div>
      </td>
    </tr>
  )
}
