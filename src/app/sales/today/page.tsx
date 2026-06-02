'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  AlertOctagon, CalendarCheck, CreditCard, BellRing,
  MessageCircle, Phone, Clock, Crown, CheckCircle2,
  ArrowRight, Loader2, TrendingUp, Sparkles, Flame,
  AlertCircle, Wallet, Sun, Moon,
} from 'lucide-react'
import {
  fetchOverdueFollowUps, fetchTodaysFollowUps,
  fetchPendingPaymentsForToday, fetchRenewalCandidates,
  fetchDashboardKpis, fetchLeadPipelineStats,
  type OverdueLead, type PendingPaymentRow, type RenewalRow,
  type DashboardKpis, type LeadPipelineStats,
} from '@/lib/crm-stats'
import { whatsappLink } from '@/lib/leads-db'
import { useStaff } from '@/lib/staff-context'

export default function TodayPage() {
  const me = useStaff()
  const isFounder = me.role === 'founder'

  const [overdue,  setOverdue]  = useState<OverdueLead[]>([])
  const [todayQ,   setTodayQ]   = useState<OverdueLead[]>([])
  const [pending,  setPending]  = useState<PendingPaymentRow[]>([])
  const [renewals, setRenewals] = useState<RenewalRow[]>([])
  const [kpis,     setKpis]     = useState<DashboardKpis | null>(null)
  const [pipe,     setPipe]     = useState<LeadPipelineStats | null>(null)
  const [loading,  setLoading]  = useState(true)

  async function load() {
    const assignedFilter = me.role === 'assistant' ? me.id : null
    const base = [
      fetchOverdueFollowUps(assignedFilter),
      fetchTodaysFollowUps(assignedFilter),
      fetchPendingPaymentsForToday(),
      fetchRenewalCandidates(),
    ] as const
    if (isFounder) {
      const [o, t, p, r, k, pi] = await Promise.all([
        ...base, fetchDashboardKpis(), fetchLeadPipelineStats(),
      ])
      setOverdue(o); setTodayQ(t); setPending(p)
      setRenewals((r as RenewalRow[]).filter(x => x.bucket === 'due7' || x.bucket === 'expired'))
      setKpis(k as DashboardKpis); setPipe(pi as LeadPipelineStats)
    } else {
      const [o, t, p, r] = await Promise.all(base)
      setOverdue(o); setTodayQ(t); setPending(p)
      setRenewals((r as RenewalRow[]).filter(x => x.bucket === 'due7' || x.bucket === 'expired'))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 60_000)
    return () => window.clearInterval(id)
  }, [me.id, me.role])  // eslint-disable-line react-hooks/exhaustive-deps

  const totalQueue = overdue.length + todayQ.length + pending.length + renewals.length
  const { icon: greetIcon, text: greetText } = greetByHour()

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          {greetIcon}
          <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400">
            {greetText} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <h1 className="text-[28px] font-black tracking-tight text-gray-900 leading-tight">
          {me.email?.split('@')[0]}&apos;s workspace
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading…' : totalQueue === 0
            ? 'Inbox zero — nothing needs your attention right now.'
            : <><b className="text-gray-900">{totalQueue}</b> {totalQueue === 1 ? 'item' : 'items'} waiting for you.</>}
        </p>
      </header>

      {loading ? (
        <div className="py-24 flex justify-center text-gray-300">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Action queue ───────────────────────────── */}
          {totalQueue === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
              <p className="font-bold text-gray-800">All clear</p>
              <p className="text-sm text-gray-400 mt-1">No overdue follow-ups, no pending payments, no renewals.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {overdue.length > 0 && (
                <QueueSection title="Overdue follow-ups" count={overdue.length} accent="rose"
                  icon={<AlertOctagon size={15} className="text-rose-500" />}
                  subtitle={`${overdue.length} lead${overdue.length > 1 ? 's' : ''} past due — call first`}>
                  {overdue.map(l => <LeadRow key={l.id} lead={l} variant="overdue" />)}
                </QueueSection>
              )}
              {todayQ.length > 0 && (
                <QueueSection title="Today's follow-ups" count={todayQ.length} accent="yellow"
                  icon={<CalendarCheck size={15} className="text-yellow-600" />}
                  subtitle="Scheduled for today">
                  {todayQ.map(l => <LeadRow key={l.id} lead={l} variant="today" />)}
                </QueueSection>
              )}
              {pending.length > 0 && (
                <QueueSection title="Pending payments" count={pending.length} accent="orange"
                  icon={<CreditCard size={15} className="text-orange-500" />}
                  subtitle="Awaiting review" seeAllHref="/sales/payments">
                  {pending.slice(0, 6).map(p => (
                    <Link key={p.id} href="/sales/payments"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                        <CreditCard size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900">{p.amount} {p.currency ?? 'MAD'}</div>
                        <div className="text-[11px] text-gray-400 truncate">Submitted {timeAgo(p.created_at)}</div>
                      </div>
                      <ArrowRight size={13} className="text-gray-300" />
                    </Link>
                  ))}
                </QueueSection>
              )}
              {renewals.length > 0 && (
                <QueueSection title="Renewals this week" count={renewals.length} accent="amber"
                  icon={<BellRing size={15} className="text-amber-500" />}
                  subtitle="Expiring or already expired" seeAllHref="/sales/students?tab=expiring">
                  {renewals.slice(0, 6).map(r => (
                    <Link key={r.id} href="/sales/students?tab=expiring"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                        <BellRing size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900 truncate">
                          {r.full_name ?? r.email ?? r.id.slice(0, 8)}
                        </div>
                        <div className={`text-[11px] font-bold ${r.bucket === 'expired' ? 'text-rose-600' : 'text-orange-600'}`}>
                          {r.bucket === 'expired'
                            ? `Expired ${Math.abs(r.daysUntilExpiry)}d ago`
                            : `Expires in ${r.daysUntilExpiry}d`}
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-gray-300" />
                    </Link>
                  ))}
                </QueueSection>
              )}
            </div>
          )}

          {/* ── Founder overview ──────────────────────── */}
          {isFounder && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400">Business overview</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
                <KpiTile icon={Sparkles}     label="New today"      value={kpis?.newLeadsToday}     accent="blue"    />
                <KpiTile icon={TrendingUp}   label="New this month" value={kpis?.newLeadsThisMonth} accent="indigo"  />
                <KpiTile icon={Flame}        label="Confirmed"      value={kpis?.confirmedStudents} accent="rose"    />
                <KpiTile icon={CheckCircle2} label="Paid"           value={kpis?.paidStudents}      accent="emerald" />
                <KpiTile icon={AlertCircle}  label="Delayed"        value={kpis?.delayedStudents}   accent="orange"  />
                <KpiTile icon={Wallet}       label="Revenue · month" value={kpis?.monthlyRevenueMad} accent="yellow" format="mad" />
              </div>
              {pipe && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 text-[15px]">Pipeline</h2>
                    <Link href="/sales/leads" className="text-xs font-semibold text-gray-400 hover:text-gray-900">
                      Open leads →
                    </Link>
                  </div>
                  <PipelineBar stats={pipe.perStatus} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── QueueSection ───────────────────────────────────────────── */
function QueueSection({ title, icon, count, accent, subtitle, seeAllHref, children }: {
  title: string; icon: React.ReactNode; count: number
  accent: 'rose' | 'yellow' | 'orange' | 'amber'
  subtitle: string; seeAllHref?: string; children: React.ReactNode
}) {
  const chip: Record<typeof accent, string> = {
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        {icon}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-[14px]">{title}</h2>
          <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border tabular-nums ${chip[accent]}`}>{count}</span>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
      {seeAllHref && (
        <Link href={seeAllHref}
          className="block px-4 py-2.5 text-center text-[12px] font-semibold text-gray-400 hover:text-gray-900 hover:bg-gray-50 border-t border-gray-100 transition-colors">
          See all →
        </Link>
      )}
    </div>
  )
}

/* ─── LeadRow ────────────────────────────────────────────────── */
function LeadRow({ lead, variant }: { lead: OverdueLead; variant: 'overdue' | 'today' }) {
  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)
  const due = new Date(lead.next_followup_at)
  const isOverdue = variant === 'overdue'
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${isOverdue ? 'bg-rose-500' : 'bg-yellow-400'}`}>
        {lead.is_vip ? <Crown size={13} /> : <Clock size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <Link href="/sales/leads" className="text-[13px] font-semibold text-gray-900 hover:underline truncate block">
          {lead.full_name}
        </Link>
        <div className={`text-[11px] font-semibold mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
          {isOverdue ? `Overdue · ${hoursAgo(due)}` : `Today · ${timeOfDay(due)}`}
          <span className="text-gray-400 font-normal"> · {lead.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {wa && (
          <a href={wa} target="_blank" rel="noopener"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="WhatsApp">
            <MessageCircle size={12} />
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Call">
            <Phone size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── KpiTile ────────────────────────────────────────────────── */
function KpiTile({ icon: Icon, label, value, accent, format }: {
  icon: LucideIcon
  label: string; value?: number; accent: string; format?: 'mad'
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600', emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600', yellow: 'bg-yellow-50 text-yellow-600',
  }
  const display = value == null ? '—'
    : format === 'mad' ? new Intl.NumberFormat('en-US').format(value) + ' MAD'
    : new Intl.NumberFormat('en-US').format(value)
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className={`w-7 h-7 rounded-md ${colors[accent]} flex items-center justify-center mb-2`}>
        <Icon size={13} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">{label}</div>
      <div className="text-[20px] font-black text-gray-900 tabular-nums leading-none">{display}</div>
    </div>
  )
}

/* ─── PipelineBar ────────────────────────────────────────────── */
function PipelineBar({ stats }: { stats: Record<string, number> }) {
  const order = ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'paid', 'delayed', 'cancelled'] as const
  const total = order.reduce((s, k) => s + (stats[k] ?? 0), 0) || 1
  const colors: Record<typeof order[number], string> = {
    new: 'bg-blue-500', contacted: 'bg-indigo-500', interested: 'bg-purple-500',
    follow_up: 'bg-orange-500', confirmed: 'bg-emerald-500', paid: 'bg-yellow-500',
    delayed: 'bg-amber-600', cancelled: 'bg-gray-300',
  }
  const labels: Record<typeof order[number], string> = {
    new: 'New', contacted: 'Contacted', interested: 'Interested', follow_up: 'Follow-up',
    confirmed: 'Confirmed', paid: 'Paid', delayed: 'Delayed', cancelled: 'Cancelled',
  }
  return (
    <div>
      <div className="flex w-full h-8 rounded-lg overflow-hidden bg-gray-100">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (!count) return null
          return (
            <div key={s} style={{ width: `${(count / total) * 100}%` }}
              className={`${colors[s]} flex items-center justify-center`} title={`${labels[s]}: ${count}`}>
              <span className="text-[10px] font-black text-white px-0.5">
                {(count / total) * 100 > 5 ? count : ''}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {order.map(s => {
          const count = stats[s] ?? 0
          if (!count) return null
          return (
            <div key={s} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-gray-600">
              <span className={`w-2 h-2 rounded-full ${colors[s]}`} />
              {labels[s]} <span className="text-gray-400 tabular-nums font-normal">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── helpers ────────────────────────────────────────────────── */
function greetByHour() {
  const h = new Date().getHours()
  if (h < 12) return { icon: <Sun size={14} className="text-yellow-500" />,   text: 'Good morning'   }
  if (h < 18) return { icon: <Sun size={14} className="text-orange-400" />,   text: 'Good afternoon' }
  return         { icon: <Moon size={14} className="text-indigo-400" />, text: 'Good evening'   }
}
function hoursAgo(d: Date): string {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
function timeOfDay(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}
