'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarCheck, KanbanSquare, CreditCard, BellRing,
  Sparkles, Flame, AlertOctagon, Wallet, CheckCircle2,
  TrendingUp, ArrowUpRight, Loader2, Filter, Plus,
} from 'lucide-react'
import { fetchDashboardKpis,       type DashboardKpis }       from '@/lib/crm-stats'
import { fetchLeadPipelineStats,   type LeadPipelineStats }   from '@/lib/crm-stats'
import { fetchOverdueFollowUps, fetchTodaysFollowUps,
         fetchPendingPaymentsForToday, fetchRenewalCandidates,
         type OverdueLead, type PendingPaymentRow, type RenewalRow,
} from '@/lib/crm-stats'
import { useStaff } from '@/lib/staff-context'

/**
 * /sales — the assistant's home base.
 *
 * Designed to be the FIRST thing she sees every morning and instantly
 * communicate "here's what's on fire, here's what's healthy, click to act".
 *
 * Top → bottom:
 *   1. Hero row: greeting + 4 action tiles (Today's queue / Pipeline / Pending
 *      payments / Renewals) showing the count and acting as link buttons
 *   2. Plan-only KPI strip — paid-plan prospects (the founder's rule)
 *   3. Two side-by-side cards:
 *      a. "Hot right now" pipeline summary with funnel colors
 *      b. "Quick actions" with three big buttons (new lead / open leads /
 *         review payments)
 *
 * The data layer is shared with /admin's existing dashboard helpers — we
 * just present them in a workspace-oriented way instead of a founder-overview
 * way.
 */
export default function SalesDashboardPage() {
  const me = useStaff()
  const [kpis, setKpis]       = useState<DashboardKpis | null>(null)
  const [pipe, setPipe]       = useState<LeadPipelineStats | null>(null)
  const [overdue, setOverdue] = useState<OverdueLead[]>([])
  const [today, setToday]     = useState<OverdueLead[]>([])
  const [pending, setPending] = useState<PendingPaymentRow[]>([])
  const [renewals, setRenewals] = useState<RenewalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Assistants are scoped to their own assigned leads in the Today/Overdue
    // counts. Founders see everything across the team.
    const assignedFilter = me.role === 'assistant' ? me.id : null
    Promise.all([
      fetchDashboardKpis(),
      fetchLeadPipelineStats(),
      fetchOverdueFollowUps(assignedFilter),
      fetchTodaysFollowUps(assignedFilter),
      fetchPendingPaymentsForToday(),
      fetchRenewalCandidates(),
    ]).then(([k, p, o, t, pmt, ren]) => {
      if (cancelled) return
      setKpis(k); setPipe(p); setOverdue(o); setToday(t)
      setPending(pmt)
      setRenewals(ren.filter(r => r.bucket === 'expired' || r.bucket === 'due7'))
      setLoading(false)
    }).catch(err => { console.error('sales dashboard load', err); setLoading(false) })
    return () => { cancelled = true }
  }, [me.id, me.role])

  const greeting = greetByHour()
  const todayQueue = overdue.length + today.length

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">
              {me.role === 'founder' ? 'Founder · sales view' : 'Assistant workspace'}
            </div>
            <h1 className="text-[28px] font-black tracking-tight text-gray-900">
              {greeting.text}, {me.email?.split('@')[0]}.
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading…' : todayQueue === 0
                ? 'Inbox zero — nothing in the queue right now.'
                : <>You have <b className="text-gray-900">{todayQueue}</b> {todayQueue === 1 ? 'lead' : 'leads'} waiting on you today.</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/sales/leads?add=1"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-yellow-400 text-sm font-bold hover:bg-zinc-800 shadow-sm"
            >
              <Plus size={14} /> New lead
            </Link>
          </div>
        </div>
      </header>

      {/* Action tiles — what to do right now */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActionTile
          href="/sales/today"
          icon={CalendarCheck}
          label="Your queue"
          value={todayQueue}
          sub={overdue.length > 0 ? `${overdue.length} overdue` : "today's follow-ups"}
          accent={overdue.length > 0 ? 'rose' : 'yellow'}
          loading={loading}
        />
        <ActionTile
          href="/sales/leads"
          icon={KanbanSquare}
          label="Open pipeline"
          value={(pipe?.total ?? 0) - (pipe?.perStatus?.paid ?? 0) - (pipe?.perStatus?.cancelled ?? 0)}
          sub={pipe ? `${formatMad(pipe.pipelineValueMad)} active` : '—'}
          accent="blue"
          loading={loading}
        />
        <ActionTile
          href="/sales/payments"
          icon={CreditCard}
          label="Pending payments"
          value={pending.length}
          sub={pending.length === 0 ? 'all clear' : 'awaiting review'}
          accent={pending.length > 0 ? 'orange' : 'emerald'}
          loading={loading}
        />
        <ActionTile
          href="/sales/renewals"
          icon={BellRing}
          label="Renewals this week"
          value={renewals.length}
          sub={renewals.length === 0 ? 'no one expiring' : 'reach out before they lapse'}
          accent={renewals.length > 0 ? 'amber' : 'emerald'}
          loading={loading}
        />
      </section>

      {/* Paid-plan KPI strip — the founder's "real prospects" view */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200">
        <Filter size={12} className="text-yellow-700 flex-shrink-0" />
        <span className="text-[12px] text-yellow-900 leading-snug">
          <b>Paid-plan prospects only</b>
          <span className="text-yellow-700"> · the numbers below exclude form-only contacts. See everything in </span>
          <Link href="/sales/leads" className="font-bold underline hover:text-yellow-900">Leads</Link>.
        </span>
      </div>
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard icon={Sparkles}     label="New today"        value={kpis?.newLeadsToday}     accent="blue"    loading={loading} />
        <KpiCard icon={TrendingUp}   label="New this month"   value={kpis?.newLeadsThisMonth} accent="indigo"  loading={loading} />
        <KpiCard icon={Flame}        label="Confirmed"        value={kpis?.confirmedStudents} accent="rose"    loading={loading} />
        <KpiCard icon={CheckCircle2} label="Paid students"    value={kpis?.paidStudents}      accent="yellow"  loading={loading} />
        <KpiCard icon={AlertOctagon} label="Delayed"          value={kpis?.delayedStudents}   accent="orange"  loading={loading} />
        <KpiCard icon={Wallet}       label="Revenue · month"  value={kpis?.monthlyRevenueMad} accent="emerald" format="mad" loading={loading} />
      </section>

      {/* Two-column: pipeline funnel + quick actions */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">Pipeline funnel</h2>
            <Link href="/sales/leads" className="text-xs font-semibold text-gray-500 hover:text-gray-900">
              Open Kanban →
            </Link>
          </div>
          {loading ? (
            <div className="py-10 flex items-center justify-center text-gray-400">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : (
            <FunnelRow stats={pipe?.perStatus ?? {}} />
          )}
        </div>

        <div className="space-y-3">
          <QuickAction
            href="/sales/leads?add=1"
            title="Add a new lead"
            description="TikTok, Instagram, walk-in — capture before you forget."
            cta="Open form"
            accent="yellow"
          />
          <QuickAction
            href="/sales/today"
            title="Work your queue"
            description="Overdue + scheduled follow-ups for today."
            cta="Open Today"
            accent="rose"
          />
          {me.role === 'founder' && (
            <QuickAction
              href="/admin/analytics"
              title="Analytics"
              description="Revenue, sources, conversion — last 90 days."
              cta="Open analytics"
              accent="blue"
            />
          )}
        </div>
      </section>
    </div>
  )
}

/* ───────────── components ───────────── */

interface ActionTileProps {
  href:    string
  icon:    LucideIcon
  label:   string
  value:   number
  sub:     string
  accent:  'rose' | 'yellow' | 'orange' | 'amber' | 'emerald' | 'blue'
  loading?: boolean
}

function ActionTile({ href, icon: Icon, label, value, sub, accent, loading }: ActionTileProps) {
  const ring: Record<typeof accent, string> = {
    rose:    'group-hover:border-rose-300',
    yellow:  'group-hover:border-yellow-300',
    orange:  'group-hover:border-orange-300',
    amber:   'group-hover:border-amber-300',
    emerald: 'group-hover:border-emerald-300',
    blue:    'group-hover:border-blue-300',
  }
  const chip: Record<typeof accent, string> = {
    rose:    'bg-rose-50 text-rose-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    orange:  'bg-orange-50 text-orange-600',
    amber:   'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue:    'bg-blue-50 text-blue-600',
  }
  return (
    <Link
      href={href}
      className={`group block bg-white border-2 border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all ${ring[accent]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${chip[accent]}`}>
          <Icon size={16} />
        </div>
        <ArrowUpRight size={15} className="text-gray-300 group-hover:text-gray-900" />
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">{label}</div>
      <div className="text-3xl font-black text-gray-900 tracking-tight tabular-nums leading-none">
        {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : value}
      </div>
      <div className="text-[11px] text-gray-400 mt-1 truncate">{sub}</div>
    </Link>
  )
}

interface KpiCardProps {
  icon:    LucideIcon
  label:   string
  value?:  number
  accent:  'blue' | 'indigo' | 'rose' | 'yellow' | 'orange' | 'emerald'
  format?: 'mad' | 'pct'
  loading?: boolean
}
function KpiCard({ icon: Icon, label, value, accent, format, loading }: KpiCardProps) {
  const colors: Record<typeof accent, string> = {
    blue:    'bg-blue-50 text-blue-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    rose:    'bg-rose-50 text-rose-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    orange:  'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className={`w-7 h-7 rounded-md ${colors[accent]} flex items-center justify-center mb-2`}>
        <Icon size={13} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">{label}</div>
      <div className="text-[20px] font-black text-gray-900 tracking-tight tabular-nums leading-none">
        {loading
          ? <span className="inline-block w-10 h-5 bg-gray-100 rounded animate-pulse" />
          : value == null ? '—'
          : format === 'mad' ? formatMad(value)
          : format === 'pct' ? value + '%'
          : new Intl.NumberFormat('en-US').format(value)}
      </div>
    </div>
  )
}

function FunnelRow({ stats }: { stats: Record<string, number> }) {
  const order = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'paid', 'delayed', 'cancelled'] as const
  const total = order.reduce((s, k) => s + (stats[k] ?? 0), 0) || 1
  const segColor: Record<typeof order[number], string> = {
    new:        'bg-blue-500',
    contacted:  'bg-indigo-500',
    interested: 'bg-purple-500',
    follow_up:  'bg-orange-500',
    confirmed:  'bg-emerald-500',
    paid:       'bg-yellow-500',
    delayed:    'bg-amber-600',
    cancelled:  'bg-gray-400',
  }
  const label: Record<typeof order[number], string> = {
    new: 'New', contacted: 'Contacted', interested: 'Interest', follow_up: 'Follow up',
    confirmed: 'Confirmed', paid: 'Paid', delayed: 'Delayed', cancelled: 'Cancelled',
  }
  return (
    <div>
      <div className="flex w-full h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (count === 0) return null
          const pct = (count / total) * 100
          return (
            <div
              key={s}
              style={{ width: `${pct}%` }}
              className={`${segColor[s]} flex items-center justify-center`}
              title={`${label[s]}: ${count}`}
            >
              <span className="text-[11px] font-black text-white tabular-nums px-1">
                {pct > 5 ? count : ''}
              </span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 mt-3">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (count === 0) return null
          return (
            <div key={s} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-gray-700">
              <span className={`w-2 h-2 rounded-full ${segColor[s]}`} />
              {label[s]}
              <span className="ml-auto text-gray-400 tabular-nums">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuickAction({
  href, title, description, cta, accent,
}: {
  href: string; title: string; description: string; cta: string
  accent: 'yellow' | 'rose' | 'blue'
}) {
  const bg: Record<typeof accent, string> = {
    yellow: 'bg-yellow-400 text-black hover:bg-yellow-300',
    rose:   'bg-rose-500 text-white hover:bg-rose-600',
    blue:   'bg-blue-500 text-white hover:bg-blue-600',
  }
  return (
    <Link href={href} className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition-all group">
      <div className="flex items-start justify-between mb-1.5">
        <div className="font-bold text-gray-900 text-[15px]">{title}</div>
        <ArrowUpRight size={15} className="text-gray-400 group-hover:text-gray-900" />
      </div>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{description}</p>
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-bold ${bg[accent]} shadow-sm`}>
        {cta} →
      </span>
    </Link>
  )
}

function greetByHour(): { text: string } {
  const h = new Date().getHours()
  if (h < 12)  return { text: 'Good morning' }
  if (h < 18)  return { text: 'Good afternoon' }
  return { text: 'Good evening' }
}

function formatMad(v: number): string {
  return new Intl.NumberFormat('en-US').format(v) + ' MAD'
}
