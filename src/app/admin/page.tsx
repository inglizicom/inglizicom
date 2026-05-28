'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Users, UserCheck, CheckCircle2, Clock4,
  AlertTriangle, BellRing, TrendingUp, Wallet,
  ArrowUpRight, Loader2,
} from 'lucide-react'
import { fetchDashboardKpis, type DashboardKpis } from '@/lib/crm-stats'
import { fetchRecentActivity, describeActivity, type ActivityLog } from '@/lib/activity-log-db'
import { useStaff } from './StaffContext'

/**
 * Main CRM dashboard — first thing the founder/assistant sees.
 * Sections:
 *   1. Welcome row + quick actions
 *   2. KPI grid (the headline numbers)
 *   3. Two-column: activity feed · quick links
 */
export default function AdminDashboardPage() {
  const staff = useStaff()
  const [kpis, setKpis]         = useState<DashboardKpis | null>(null)
  const [activity, setActivity] = useState<ActivityLog[] | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchDashboardKpis(), fetchRecentActivity(20)])
      .then(([k, a]) => {
        if (cancelled) return
        setKpis(k); setActivity(a); setLoading(false)
      })
      .catch(err => { console.error('dashboard load', err); setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">
            {staff.role === 'founder' ? 'Founder Dashboard' : 'Assistant Workspace'}
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-gray-900">
            Welcome back{staff.email ? `, ${staff.email.split('@')[0]}` : ''}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Today&apos;s snapshot of every lead, payment and renewal across the business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            Open Leads <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Review Payments
          </Link>
        </div>
      </header>

      {/* KPI grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KpiCard icon={Users}         label="New leads · today"  value={kpis?.newLeadsToday}     hint="from /subscribe + WhatsApp" accent="blue"    loading={loading} />
        <KpiCard icon={TrendingUp}    label="New leads · month"  value={kpis?.newLeadsThisMonth} hint="month-to-date"             accent="indigo"  loading={loading} />
        <KpiCard icon={UserCheck}     label="Confirmed"          value={kpis?.confirmedStudents} hint="awaiting payment"          accent="emerald" loading={loading} />
        <KpiCard icon={CheckCircle2}  label="Paid students"      value={kpis?.paidStudents}      hint="all-time"                  accent="yellow"  loading={loading} />
        <KpiCard icon={Clock4}        label="Pending payments"   value={kpis?.pendingPayments}   hint="action required"           accent="orange"  loading={loading} />
        <KpiCard icon={AlertTriangle} label="Delayed"            value={kpis?.delayedStudents}   hint="promised, not paid"        accent="rose"    loading={loading} />
        <KpiCard icon={BellRing}      label="Renewals due"       value={kpis?.renewalDueSoon}    hint="next 30 days"              accent="amber"   loading={loading} />
        <KpiCard icon={Wallet}        label="Revenue · month"    value={kpis?.monthlyRevenueMad} hint="MAD, approved"             accent="yellow"  format="mad"     loading={loading} />
        <KpiCard icon={TrendingUp}    label="Conversion rate"    value={kpis?.conversionRatePct} hint="paid / leads · 90d"        accent="emerald" format="pct"     loading={loading} />
      </section>

      {/* Activity + quick links */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Recent activity</h2>
            <Link href="/admin/activity" className="text-xs font-semibold text-gray-500 hover:text-gray-900">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {loading && (
              <div className="px-5 py-10 flex items-center justify-center text-gray-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            )}
            {!loading && (!activity || activity.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No activity yet — actions will appear here as you work.
              </div>
            )}
            {!loading && (activity ?? []).slice(0, 12).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold uppercase">
                  {(a.actor_email?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-gray-800 leading-tight">{describeActivity(a)}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {timeAgo(a.created_at)} · {a.entity_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <QuickLinkCard
            title="Lead pipeline"
            description="Kanban board of every lead, sorted by status."
            href="/admin/leads"
            count={kpis?.newLeadsThisMonth ?? 0}
            label="this month"
          />
          <QuickLinkCard
            title="Pending payments"
            description="Approve / decline new submissions."
            href="/admin/payments"
            count={kpis?.pendingPayments ?? 0}
            label="awaiting"
            accent="orange"
          />
          <QuickLinkCard
            title="Renewals due"
            description="Subscriptions expiring soon — call them."
            href="/admin/renewals"
            count={kpis?.renewalDueSoon ?? 0}
            label="next 30d"
            accent="amber"
          />
        </div>
      </section>
    </div>
  )
}

/* ───────────────────── components ───────────────────── */

interface KpiCardProps {
  icon:     LucideIcon
  label:    string
  value?:   number
  hint?:    string
  accent?:  'blue' | 'indigo' | 'emerald' | 'yellow' | 'orange' | 'rose' | 'amber'
  format?:  'number' | 'mad' | 'pct'
  loading?: boolean
}

function KpiCard({ icon: Icon, label, value, hint, accent = 'yellow', format = 'number', loading }: KpiCardProps) {
  const colors: Record<NonNullable<KpiCardProps['accent']>, string> = {
    blue:    'bg-blue-50 text-blue-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    orange:  'bg-orange-50 text-orange-600',
    rose:    'bg-rose-50 text-rose-600',
    amber:   'bg-amber-50 text-amber-700',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[accent]}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1">{label}</div>
      <div className="text-2xl font-black text-gray-900 tracking-tight tabular-nums leading-none">
        {loading
          ? <span className="inline-block w-12 h-6 bg-gray-100 rounded animate-pulse" />
          : formatValue(value, format)}
      </div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

function formatValue(v: number | undefined, format: KpiCardProps['format']): string {
  if (v == null) return '—'
  if (format === 'mad') return new Intl.NumberFormat('en-US').format(v) + ' MAD'
  if (format === 'pct') return v + '%'
  return new Intl.NumberFormat('en-US').format(v)
}

function QuickLinkCard({
  title, description, href, count, label, accent = 'yellow',
}: {
  title:       string
  description: string
  href:        string
  count:       number
  label:       string
  accent?:     'yellow' | 'orange' | 'amber'
}) {
  const colors = {
    yellow: 'bg-yellow-400 text-black',
    orange: 'bg-orange-500 text-white',
    amber:  'bg-amber-500 text-white',
  } as const
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-bold text-gray-900 text-[15px] group-hover:underline">{title}</div>
        <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
      </div>
      <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">{description}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-black px-2.5 py-0.5 rounded-md tabular-nums ${colors[accent]}`}>
          {count}
        </span>
        <span className="text-[11px] uppercase font-bold tracking-[0.1em] text-gray-400">{label}</span>
      </div>
    </Link>
  )
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}
