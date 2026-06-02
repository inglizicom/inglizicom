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
  fetchOwnerMetrics, fetchTeamOverview,
  type OverdueLead, type PendingPaymentRow, type RenewalRow,
  type OwnerMetrics, type TeamMemberStat,
} from '@/lib/crm-stats'
import { whatsappLink } from '@/lib/leads-db'
import { fetchStaff, type StaffRow } from '@/lib/staff-db'
import { useStaff } from '@/lib/staff-context'
import { Users, Award, Globe, BarChart3 } from 'lucide-react'

export default function TodayPage() {
  const me = useStaff()
  const isFounder = me.role === 'founder'

  const [overdue,       setOverdue]       = useState<OverdueLead[]>([])
  const [todayQ,        setTodayQ]        = useState<OverdueLead[]>([])
  const [pending,       setPending]       = useState<PendingPaymentRow[]>([])
  const [renewals,      setRenewals]      = useState<RenewalRow[]>([])
  const [ownerMetrics,  setOwnerMetrics]  = useState<OwnerMetrics | null>(null)
  const [teamStats,     setTeamStats]     = useState<TeamMemberStat[]>([])
  const [staffMap,      setStaffMap]      = useState<Map<string, StaffRow>>(new Map())
  const [loading,       setLoading]       = useState(true)

  async function load() {
    const assignedFilter = me.role === 'assistant' ? me.id : null
    const base = [
      fetchOverdueFollowUps(assignedFilter),
      fetchTodaysFollowUps(assignedFilter),
      fetchPendingPaymentsForToday(),
      fetchRenewalCandidates(),
    ] as const
    if (isFounder) {
      const [o, t, p, r, metrics, team, staffRows] = await Promise.all([
        ...base,
        fetchOwnerMetrics(),
        fetchTeamOverview(), fetchStaff(),
      ])
      setOverdue(o); setTodayQ(t); setPending(p)
      setRenewals((r as RenewalRow[]).filter(x => x.bucket === 'due7' || x.bucket === 'expired'))
      setOwnerMetrics(metrics as OwnerMetrics)
      setTeamStats(team as TeamMemberStat[])
      setStaffMap(new Map((staffRows as StaffRow[]).map(s => [s.id, s])))
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

          {/* ── Founder business metrics ──────────────── */}
          {isFounder && ownerMetrics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400">Business overview</span>
                  <div className="w-24 h-px bg-gray-100" />
                </div>
                <Link href="/analytics" className="text-[11px] font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1">
                  <BarChart3 size={11} /> Full analytics →
                </Link>
              </div>

              {/* Revenue — real money only */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <BizKpi label="Total revenue"    value={mad(ownerMetrics.revenueTotal)}     accent="yellow" />
                <BizKpi label="This month"       value={mad(ownerMetrics.revenueThisMonth)} accent="emerald" />
                <BizKpi label="Avg per student"  value={mad(ownerMetrics.avgRevenuePerStudent)} accent="blue" />
                <BizKpi label="Avg per lead"     value={mad(ownerMetrics.avgRevenuePerLead)}    accent="indigo" />
              </div>

              {/* Conversion funnel — the 3 rates */}
              <div className="bg-gray-900 rounded-2xl p-5">
                <h2 className="font-black text-white text-[13px] mb-4 uppercase tracking-[0.12em]">Conversion funnel</h2>
                <div className="grid grid-cols-3 gap-3">
                  {ownerMetrics.funnel.slice(1).map((step, i) => {
                    const labels  = ['Lead → Contacted', 'Contacted → Confirmed', 'Confirmed → Paid']
                    const bars    = ['bg-indigo-400', 'bg-emerald-400', 'bg-yellow-400']
                    const good    = [60, 40, 50]
                    const isGood  = step.pct >= good[i]
                    return (
                      <div key={step.label} className={`rounded-xl p-3.5 ${isGood ? 'bg-zinc-800' : 'bg-rose-900/60'}`}>
                        <div className={`text-[30px] font-black tabular-nums leading-none ${isGood ? 'text-white' : 'text-rose-300'}`}>
                          {step.pct}%
                        </div>
                        <div className="text-[11px] font-bold text-zinc-400 mt-1">{labels[i]}</div>
                        <div className="mt-2.5 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full ${bars[i]} rounded-full`} style={{ width: `${step.pct}%` }} />
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1.5">{step.count} leads</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top performers */}
              <div className="grid grid-cols-3 gap-3">
                <TopPerformer icon={Award} label="Top course"    value={ownerMetrics.topCourse}    />
                <TopPerformer icon={Globe} label="Top source"    value={ownerMetrics.topSource}    />
                <TopPerformer icon={Users} label="Top assistant" value={ownerMetrics.topAssistant} />
              </div>

              {/* Revenue breakdowns — compact */}
              <div className="grid sm:grid-cols-3 gap-3">
                <BreakdownCard title="Revenue by course"    rows={ownerMetrics.revenueByCourse}    />
                <BreakdownCard title="Revenue by source"    rows={ownerMetrics.revenueBySource}    />
                <BreakdownCard title="Revenue by assistant" rows={ownerMetrics.revenueByAssistant} />
              </div>

              {/* Team overview */}
              {teamStats.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <h2 className="font-bold text-gray-900 text-[15px]">Team</h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Member</th>
                        <th className="text-center px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Active</th>
                        <th className="text-center px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-400">Overdue</th>
                        <th className="text-center px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-500">Today</th>
                        <th className="text-center px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500">Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teamStats.map(row => {
                        const member = row.unassigned ? null : staffMap.get(row.assignedToId)
                        const name   = member
                          ? (member.full_name?.split(' ')[0] ?? member.email?.split('@')[0] ?? '?')
                          : 'Unassigned'
                        const initial = name[0]?.toUpperCase() ?? '?'
                        return (
                          <tr key={row.assignedToId} className="hover:bg-gray-50">
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${row.unassigned ? 'bg-gray-300' : 'bg-indigo-500'}`}>
                                  {initial}
                                </div>
                                <div>
                                  <div className="text-[13px] font-semibold text-gray-900">{name}</div>
                                  {member && <div className="text-[10px] text-gray-400">{member.role}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-[13px] font-bold text-gray-700 tabular-nums">{row.total}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-[13px] font-bold tabular-nums ${row.overdue > 0 ? 'text-rose-600' : 'text-gray-300'}`}>
                                {row.overdue > 0 ? row.overdue : '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-[13px] font-bold tabular-nums ${row.todayCount > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
                                {row.todayCount > 0 ? row.todayCount : '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-[13px] font-bold tabular-nums ${row.paid > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                                {row.paid > 0 ? row.paid : '—'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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

const mad = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n)) + ' MAD'

/* ─── BizKpi ─────────────────────────────────────────────────── */
function BizKpi({ label, value, accent }: {
  label: string; value: string; accent: 'yellow' | 'emerald' | 'blue' | 'indigo'
}) {
  const styles: Record<typeof accent, string> = {
    yellow:  'bg-yellow-400 text-black',
    emerald: 'bg-emerald-500 text-white',
    blue:    'bg-blue-600 text-white',
    indigo:  'bg-indigo-600 text-white',
  }
  const sub: Record<typeof accent, string> = {
    yellow:  'text-yellow-900',
    emerald: 'text-emerald-100',
    blue:    'text-blue-200',
    indigo:  'text-indigo-200',
  }
  return (
    <div className={`rounded-2xl p-4 ${styles[accent]}`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-1 ${sub[accent]}`}>{label}</div>
      <div className="font-black tabular-nums leading-tight text-[18px]">{value}</div>
    </div>
  )
}

/* ─── TopPerformer ───────────────────────────────────────────── */
function TopPerformer({ icon: Icon, label, value }: {
  icon: LucideIcon; label: string; value: string | null
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-black" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">{label}</div>
        <div className="font-black text-white text-[15px] truncate">{value ?? '—'}</div>
      </div>
    </div>
  )
}

/* ─── BreakdownCard ──────────────────────────────────────────── */
function BreakdownCard({ title, rows }: {
  title: string; rows: { label: string; mad: number; count: number }[]
}) {
  if (!rows.length) return null
  const max = Math.max(1, ...rows.map(r => r.mad))
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4">
      <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-400 mb-3">{title}</h3>
      <div className="space-y-3">
        {rows.slice(0, 5).map((r, i) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-bold text-gray-900 truncate max-w-[55%]">{r.label}</span>
              <span className="text-[12px] font-black text-gray-900 tabular-nums">
                {new Intl.NumberFormat('en-US').format(Math.round(r.mad))} <span className="text-gray-400 font-semibold text-[10px]">MAD</span>
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-gray-300'}`}
                style={{ width: `${(r.mad / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── KpiTile (queue section tiles) ─────────────────────────── */
function KpiTile({ icon: Icon, label, value, accent, format }: {
  icon: LucideIcon
  label: string; value?: number; accent: string; format?: 'mad'
}) {
  const colors: Record<string, string> = {
    blue:    'bg-blue-500 text-white',
    indigo:  'bg-indigo-500 text-white',
    rose:    'bg-rose-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    orange:  'bg-orange-500 text-white',
    yellow:  'bg-yellow-400 text-black',
  }
  const display = value == null ? '—'
    : format === 'mad' ? new Intl.NumberFormat('en-US').format(value) + ' MAD'
    : new Intl.NumberFormat('en-US').format(value)
  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-3.5">
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
