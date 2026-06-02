import { supabase } from './supabase'
import { normalizeStatus, type LeadStatus } from './leads-db'

/** All the headline numbers shown at the top of the main CRM dashboard. */
export interface DashboardKpis {
  newLeadsToday:       number
  newLeadsThisMonth:   number
  confirmedStudents:   number   // status = confirmed
  paidStudents:        number   // status = paid (or legacy 'converted')
  pendingPayments:     number
  delayedStudents:     number   // status = delayed
  renewalDueSoon:      number   // plan_expires_at within 30 days
  monthlyRevenueMad:   number   // sum of approved payments this month
  conversionRatePct:   number   // paid / total leads in the last 90 days
}

/** Fetch all dashboard KPIs in a single round-trip-ish batch.
 *
 *  IMPORTANT: every lead-count on the main dashboard is scoped to prospects
 *  who actually picked a pricing plan — i.e. amount_mad > 0. People who
 *  filled out a contact form without selecting a plan are tracked separately
 *  in the /admin/leads pipeline but don't pollute the founder's headline
 *  numbers. This is what the founder asked for on 2026-05-29. */
export async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const now        = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const ninetyAgo  = new Date(now); ninetyAgo.setDate(ninetyAgo.getDate() - 90)
  const in30days   = new Date(now); in30days.setDate(in30days.getDate() + 30)

  const [
    newToday, newMonth,
    confirmed, paid, paidLegacy,
    pendingPayments, delayed,
    renewals, leads90d,
    revenue,
  ] = await Promise.all([
    countPlanLeadsSince(todayStart),
    countPlanLeadsSince(monthStart),
    countPlanLeadsWithStatus('confirmed'),
    countPlanLeadsWithStatus('paid'),
    countPlanLeadsWithStatus('converted'),
    countPaymentsWithStatus('pending'),
    countPlanLeadsWithStatus('delayed'),
    countRenewalsBefore(in30days),
    countPlanLeadsSince(ninetyAgo),
    sumApprovedPaymentsBetween(monthStart, now),
  ])

  const paidStudents = paid + paidLegacy
  const conversionRatePct = leads90d > 0
    ? Math.round((paidStudents / leads90d) * 100)
    : 0

  return {
    newLeadsToday:     newToday,
    newLeadsThisMonth: newMonth,
    confirmedStudents: confirmed,
    paidStudents,
    pendingPayments,
    delayedStudents:   delayed,
    renewalDueSoon:    renewals,
    monthlyRevenueMad: revenue,
    conversionRatePct,
  }
}

async function countPlanLeadsSince(when: Date): Promise<number> {
  const { count } = await supabase
    .from('subscription_leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', when.toISOString())
    .gt('amount_mad', 0)
  return count ?? 0
}

async function countPlanLeadsWithStatus(status: string): Promise<number> {
  const { count } = await supabase
    .from('subscription_leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', status)
    .gt('amount_mad', 0)
  return count ?? 0
}

async function countPaymentsWithStatus(status: string): Promise<number> {
  const { count } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', status)
  return count ?? 0
}

async function countRenewalsBefore(when: Date): Promise<number> {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .lte('plan_expires_at', when.toISOString())
    .gte('plan_expires_at', new Date().toISOString())
    .neq('plan', 'free')
  return count ?? 0
}

async function sumApprovedPaymentsBetween(from: Date, to: Date): Promise<number> {
  const { data } = await supabase
    .from('payments')
    .select('amount_mad')
    .eq('status', 'approved')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
  let total = 0
  for (const row of data ?? []) total += Number(row.amount_mad ?? 0)
  return total
}

/** Renewal sub-buckets: 0-7 days, 8-15, 16-30, expired. */
export interface RenewalBucket {
  due7:     number
  due15:    number
  due30:    number
  expired:  number
}
export async function fetchRenewalBuckets(): Promise<RenewalBucket> {
  const now    = new Date()
  const in7    = new Date(now); in7.setDate(in7.getDate() + 7)
  const in15   = new Date(now); in15.setDate(in15.getDate() + 15)
  const in30   = new Date(now); in30.setDate(in30.getDate() + 30)

  const between = async (from: Date, to: Date) => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('plan_expires_at', from.toISOString())
      .lte('plan_expires_at', to.toISOString())
      .neq('plan', 'free')
    return count ?? 0
  }
  const expired = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lt('plan_expires_at', now.toISOString())
      .neq('plan', 'free')
    return count ?? 0
  }

  const [due7, due15, due30, exp] = await Promise.all([
    between(now, in7),
    between(in7, in15),
    between(in15, in30),
    expired(),
  ])
  return { due7, due15, due30, expired: exp }
}

/** Lead counts per status — drives the Kanban column headers. */
export async function fetchLeadCountsByStatus(): Promise<Record<LeadStatus, number>> {
  const { data, error } = await supabase
    .from('subscription_leads')
    .select('status')
  const counts: Record<LeadStatus, number> = {
    new: 0, contacted: 0, interested: 0, follow_up: 0,
    confirmed: 0, paid: 0, delayed: 0, cancelled: 0, vip: 0,
    converted: 0, rejected: 0,
  }
  if (error || !data) return counts
  for (const row of data) {
    const s = normalizeStatus(row.status)
    counts[s] = (counts[s] ?? 0) + 1
  }
  return counts
}

/** Leads grouped by source — used by the analytics chart. */
export async function fetchLeadsBySource(daysBack = 90): Promise<{ source: string; count: number }[]> {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - daysBack)
  const { data } = await supabase
    .from('subscription_leads')
    .select('source')
    .gte('created_at', cutoff.toISOString())
  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const s = row.source ?? 'direct'
    counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

/** Lead-pipeline stats shown above the Kanban board on /admin/leads.
 *  All counts include the legacy 'converted'/'rejected' aliases via
 *  normalizeStatus so the numbers always tie out with the rest of the UI. */
export interface LeadPipelineStats {
  total:           number          // every lead ever
  newToday:        number          // captured since midnight
  hot:             number          // confirmed + delayed + vip (likely to close)
  overdue:         number          // follow_up date in the past
  pipelineValueMad: number         // sum(amount_mad) across active (non-paid, non-cancelled)
  closedValueMad:  number          // sum(amount_mad) across paid
  perStatus:       Record<string, number>
  perSource:       { source: string; count: number }[]
  conversionPct:   number          // paid / total
}

/** One round-trip pull of every numbers needed for the Leads top strip. */
export async function fetchLeadPipelineStats(): Promise<LeadPipelineStats> {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('subscription_leads')
    .select('status, created_at, amount_mad, source, next_followup_at, is_vip')
  if (error || !data) {
    return {
      total: 0, newToday: 0, hot: 0, overdue: 0,
      pipelineValueMad: 0, closedValueMad: 0,
      perStatus: {}, perSource: [], conversionPct: 0,
    }
  }
  const perStatus: Record<string, number> = {}
  const sourceMap = new Map<string, number>()
  let newToday   = 0
  let hot        = 0
  let overdue    = 0
  let pipeline   = 0
  let closed     = 0
  let paid       = 0
  const now = Date.now()

  for (const row of data) {
    const status = row.status === 'converted' ? 'paid'
                : row.status === 'rejected'  ? 'cancelled'
                : (row.status as string)
    perStatus[status] = (perStatus[status] ?? 0) + 1
    if (new Date(row.created_at as string).getTime() >= todayStart.getTime()) newToday++
    if (row.is_vip || status === 'confirmed' || status === 'delayed') hot++
    if (row.next_followup_at && new Date(row.next_followup_at as string).getTime() < now &&
        status !== 'paid' && status !== 'cancelled') overdue++
    const amount = Number(row.amount_mad ?? 0)
    if (status === 'paid') { paid++; closed += amount }
    else if (status !== 'cancelled') pipeline += amount
    const src = row.source ?? 'direct'
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
  }

  const perSource = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return {
    total:            data.length,
    newToday,
    hot,
    overdue,
    pipelineValueMad: pipeline,
    closedValueMad:   closed,
    perStatus,
    perSource,
    conversionPct:    data.length > 0 ? Math.round((paid / data.length) * 100) : 0,
  }
}

/* ─────────────────────────────────────────────────────────────
 * Today inbox — the "what should I do right now" surface.
 * Designed for the Today page; queries are cheap enough to run
 * together on every page load.
 * ───────────────────────────────────────────────────────────── */

export interface OverdueLead {
  id:               string
  full_name:        string
  phone:            string | null
  status:           string
  next_followup_at: string
  is_vip:           boolean
}
export async function fetchOverdueFollowUps(staffId?: string | null): Promise<OverdueLead[]> {
  const now = new Date()
  let q = supabase
    .from('subscription_leads')
    .select('id, full_name, phone, status, next_followup_at, is_vip, assigned_to_id')
    .lte('next_followup_at', now.toISOString())
    .not('next_followup_at', 'is', null)
    .in('status', ['new', 'contacted', 'interested', 'follow_up', 'confirmed', 'delayed'])
    .order('next_followup_at', { ascending: true })
    .limit(50)
  if (staffId) q = q.eq('assigned_to_id', staffId)
  const { data } = await q
  return (data ?? []) as OverdueLead[]
}

export async function fetchTodaysFollowUps(staffId?: string | null): Promise<OverdueLead[]> {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(start); end.setDate(end.getDate() + 1)
  let q = supabase
    .from('subscription_leads')
    .select('id, full_name, phone, status, next_followup_at, is_vip, assigned_to_id')
    .gte('next_followup_at', start.toISOString())
    .lt('next_followup_at', end.toISOString())
    .order('next_followup_at', { ascending: true })
    .limit(50)
  if (staffId) q = q.eq('assigned_to_id', staffId)
  const { data } = await q
  return (data ?? []) as OverdueLead[]
}

export interface PendingPaymentRow {
  id:         string
  user_id:    string
  amount:     number
  currency:   string | null
  created_at: string
}
export async function fetchPendingPaymentsForToday(): Promise<PendingPaymentRow[]> {
  const { data } = await supabase
    .from('payments')
    .select('id, user_id, amount, currency, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(20)
  return (data ?? []) as PendingPaymentRow[]
}

/** Renewal candidates — every paid profile with an expiry date, grouped
 *  into the same 7/15/30/expired buckets as the dashboard KPIs. */
export interface RenewalRow {
  id:              string
  email:           string | null
  full_name:       string | null
  plan:            string
  plan_expires_at: string | null
  plan_note:       string | null
  daysUntilExpiry: number
  bucket:          'expired' | 'due7' | 'due15' | 'due30'
}
export async function fetchRenewalCandidates(): Promise<RenewalRow[]> {
  const now    = new Date()
  const in30   = new Date(now); in30.setDate(in30.getDate() + 30)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, plan_expires_at, plan_note')
    .neq('plan', 'free')
    .not('plan_expires_at', 'is', null)
    .lte('plan_expires_at', in30.toISOString())
    .order('plan_expires_at', { ascending: true })
  if (error) {
    console.error('fetchRenewalCandidates', error.message)
    return []
  }
  return (data ?? []).map(row => {
    const expiry = new Date(row.plan_expires_at as string)
    const ms     = expiry.getTime() - now.getTime()
    const days   = Math.ceil(ms / 86_400_000)
    let bucket: RenewalRow['bucket']
    if (days < 0)       bucket = 'expired'
    else if (days <= 7)  bucket = 'due7'
    else if (days <= 15) bucket = 'due15'
    else                 bucket = 'due30'
    return {
      id:              row.id,
      email:           row.email,
      full_name:       row.full_name,
      plan:            row.plan,
      plan_expires_at: row.plan_expires_at,
      plan_note:       row.plan_note,
      daysUntilExpiry: days,
      bucket,
    } as RenewalRow
  })
}

/** Assistant-performance summary — leads closed by each staff member. */
export interface AssistantStat {
  actor_email: string
  total:       number
  paid:        number
  conversion:  number
}
export async function fetchAssistantStats(daysBack = 90): Promise<AssistantStat[]> {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - daysBack)
  const { data } = await supabase
    .from('crm_activity_log')
    .select('actor_email, action, after_value')
    .eq('entity_type', 'lead')
    .gte('created_at', cutoff.toISOString())
  const counts = new Map<string, { total: number; paid: number }>()
  for (const row of data ?? []) {
    const email = row.actor_email ?? 'system'
    if (!counts.has(email)) counts.set(email, { total: 0, paid: 0 })
    const c = counts.get(email)!
    c.total++
    const status = (row.after_value as any)?.status
    if (status === 'paid' || status === 'converted') c.paid++
  }
  return [...counts.entries()].map(([email, c]) => ({
    actor_email: email,
    total:       c.total,
    paid:        c.paid,
    conversion:  c.total > 0 ? Math.round((c.paid / c.total) * 100) : 0,
  })).sort((a, b) => b.paid - a.paid)
}

/** Approved revenue per month for the last 12 months. */
export async function fetchRevenuePerMonth(monthsBack = 12): Promise<{ month: string; mad: number }[]> {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - monthsBack + 1)
  cutoff.setDate(1); cutoff.setHours(0, 0, 0, 0)
  const { data } = await supabase
    .from('payments')
    .select('amount_mad, created_at')
    .eq('status', 'approved')
    .gte('created_at', cutoff.toISOString())

  const buckets = new Map<string, number>()
  // Seed all months in range with 0 so the chart has a continuous x-axis.
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(cutoff); d.setMonth(d.getMonth() + i)
    buckets.set(monthKey(d), 0)
  }
  for (const row of data ?? []) {
    const k = monthKey(new Date(row.created_at as string))
    buckets.set(k, (buckets.get(k) ?? 0) + Number(row.amount_mad ?? 0))
  }
  return [...buckets.entries()].map(([month, mad]) => ({ month, mad }))
}
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Per-assistant live pipeline stats — used on the founder Today page.
 *  Single query; aggregation is done client-side. */
export interface TeamMemberStat {
  assignedToId: string
  total:        number   // all active (non-cancelled, non-paid) assigned leads
  overdue:      number   // next_followup_at in the past
  todayCount:   number   // next_followup_at is today
  paid:         number   // status = paid
  unassigned?:  true     // sentinel for the "unassigned" bucket
}

export async function fetchTeamOverview(): Promise<TeamMemberStat[]> {
  const now   = new Date()
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  const end   = new Date(start); end.setDate(end.getDate() + 1)

  const { data } = await supabase
    .from('subscription_leads')
    .select('id, status, assigned_to_id, next_followup_at')
    .eq('is_archived', false)
    .not('plan_id', 'in', '("test_completed","inquiry")')

  const map = new Map<string, TeamMemberStat>()
  const get = (id: string): TeamMemberStat => {
    if (!map.has(id)) map.set(id, { assignedToId: id, total: 0, overdue: 0, todayCount: 0, paid: 0 })
    return map.get(id)!
  }

  for (const row of data ?? []) {
    const key = row.assigned_to_id ?? '__unassigned__'
    const s   = get(key)
    if (key === '__unassigned__') (s as any).unassigned = true

    const status = row.status === 'converted' ? 'paid' : row.status === 'rejected' ? 'cancelled' : row.status
    if (status === 'paid') { s.paid++; continue }
    if (status === 'cancelled') continue
    s.total++

    if (row.next_followup_at) {
      const d = new Date(row.next_followup_at as string)
      if (d < now) s.overdue++
      else if (d >= start && d < end) s.todayCount++
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total)
}
