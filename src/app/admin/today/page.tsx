'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarCheck, AlertOctagon, Loader2, MessageCircle, Phone,
  CheckCircle2, Clock, BellRing, CreditCard, ArrowRight, Crown,
  Sun, Star,
} from 'lucide-react'
import {
  fetchOverdueFollowUps, fetchTodaysFollowUps,
  fetchPendingPaymentsForToday, fetchRenewalCandidates,
  type OverdueLead, type PendingPaymentRow, type RenewalRow,
} from '@/lib/crm-stats'
import { whatsappLink } from '@/lib/leads-db'
import { useStaff } from '../StaffContext'

/**
 * Today — the assistant's daily home base.
 *
 * Four prioritized sections:
 *   1. Overdue follow-ups (red, must call NOW)
 *   2. Today's scheduled follow-ups (yellow)
 *   3. Pending payments awaiting review (orange)
 *   4. Renewals expiring this week (amber)
 *
 * Each row has 1-tap actions (WhatsApp, call, open). The whole page
 * refreshes on a 60s interval so a new lead pops in without a manual reload.
 */
export default function TodayPage() {
  const me = useStaff()
  const [overdue, setOverdue]       = useState<OverdueLead[]>([])
  const [todayFollowups, setToday]  = useState<OverdueLead[]>([])
  const [pending, setPending]       = useState<PendingPaymentRow[]>([])
  const [renewals, setRenewals]     = useState<RenewalRow[]>([])
  const [loading, setLoading]       = useState(true)

  async function load() {
    // Assistants see only their assigned leads by default; founders see everything.
    const assignedFilter = me.role === 'assistant' ? me.id : null
    const [o, t, p, r] = await Promise.all([
      fetchOverdueFollowUps(assignedFilter),
      fetchTodaysFollowUps(assignedFilter),
      fetchPendingPaymentsForToday(),
      fetchRenewalCandidates(),
    ])
    setOverdue(o); setToday(t); setPending(p)
    setRenewals(r.filter(row => row.bucket === 'due7' || row.bucket === 'expired'))
    setLoading(false)
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 60_000)  // refresh every minute
    return () => window.clearInterval(id)
  }, [me.id, me.role])

  const totalTodo = overdue.length + todayFollowups.length + pending.length + renewals.length
  const greeting  = greetByHour()

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-7">
        <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">
          {me.role === 'founder' ? 'Founder' : 'Assistant'} · today
        </div>
        <h1 className="text-[28px] font-black tracking-tight text-gray-900 flex items-center gap-2">
          {greeting.icon} {greeting.text}, {me.email?.split('@')[0]}.
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading…' : (
            totalTodo === 0
              ? <>✨ Inbox zero — nothing demands your attention right now.</>
              : <>You have <b className="text-gray-900">{totalTodo}</b> {totalTodo === 1 ? 'item' : 'items'} to handle today.</>
          )}
        </p>
      </header>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Overdue (highest priority) */}
          <Section
            title="Overdue follow-ups"
            subtitle={overdue.length === 0 ? 'None — well done' : 'Call these students first'}
            icon={<AlertOctagon size={16} className="text-rose-500" />}
            accent="rose"
            empty={overdue.length === 0}
            count={overdue.length}
          >
            {overdue.map(l => <LeadItem key={l.id} lead={l} variant="overdue" />)}
          </Section>

          {/* Today's follow-ups */}
          <Section
            title="Today's follow-ups"
            subtitle={todayFollowups.length === 0 ? 'No scheduled calls today' : 'Scheduled for today'}
            icon={<CalendarCheck size={16} className="text-yellow-600" />}
            accent="yellow"
            empty={todayFollowups.length === 0}
            count={todayFollowups.length}
          >
            {todayFollowups.map(l => <LeadItem key={l.id} lead={l} variant="today" />)}
          </Section>

          {/* Pending payments */}
          <Section
            title="Pending payments"
            subtitle={pending.length === 0 ? 'All clear — no submissions waiting' : 'Approve or decline'}
            icon={<CreditCard size={16} className="text-orange-500" />}
            accent="orange"
            empty={pending.length === 0}
            count={pending.length}
            href="/admin/payments"
          >
            {pending.slice(0, 8).map(p => (
              <Link
                key={p.id}
                href="/admin/payments"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                  <CreditCard size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900">
                    {p.amount} {p.currency ?? 'MAD'}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                    Submitted {timeAgo(p.created_at)} · user {p.user_id.slice(0, 8)}
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
            ))}
          </Section>

          {/* Renewals (this week + expired) */}
          <Section
            title="Renewals · this week"
            subtitle={renewals.length === 0 ? 'No one expiring this week' : 'Reach out before they lapse'}
            icon={<BellRing size={16} className="text-amber-500" />}
            accent="amber"
            empty={renewals.length === 0}
            count={renewals.length}
            href="/admin/renewals"
          >
            {renewals.slice(0, 8).map(r => (
              <Link
                key={r.id}
                href="/admin/renewals"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BellRing size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900 truncate">
                    {r.full_name ?? r.email ?? r.id.slice(0, 8)}
                  </div>
                  <div className={`text-[11px] font-bold mt-0.5 ${
                    r.bucket === 'expired' ? 'text-rose-600' : 'text-orange-600'
                  }`}>
                    {r.bucket === 'expired'
                      ? `Expired ${Math.abs(r.daysUntilExpiry)}d ago`
                      : `Expires in ${r.daysUntilExpiry}d`}
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </Link>
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

/* ───────────── section ───────────── */

function Section({
  title, subtitle, icon, accent, empty, count, href, children,
}: {
  title:    string
  subtitle: string
  icon:     React.ReactNode
  accent:   'rose' | 'yellow' | 'orange' | 'amber'
  empty:    boolean
  count:    number
  href?:    string
  children?: React.ReactNode
}) {
  const styles: Record<typeof accent, string> = {
    rose:   'bg-rose-50 text-rose-700 border-rose-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        {icon}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-[14px] tracking-tight">{title}</h2>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border tabular-nums ${styles[accent]}`}>
          {count}
        </span>
      </div>
      {empty ? (
        <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
          <CheckCircle2 size={20} className="text-emerald-400" />
          {subtitle}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">{children}</div>
          {href && (
            <Link
              href={href}
              className="block px-4 py-2.5 text-center text-[12px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-t border-gray-100"
            >
              See all →
            </Link>
          )}
        </>
      )}
    </div>
  )
}

/* ───────────── lead item ───────────── */

function LeadItem({ lead, variant }: { lead: OverdueLead; variant: 'overdue' | 'today' }) {
  const wa = whatsappLink(lead.phone, `مرحبا ${lead.full_name}، أنا من إنجليزي.كوم`)
  const due = new Date(lead.next_followup_at)
  const overdue = variant === 'overdue'
  const ago = overdue ? hoursAgo(due) : timeOfDay(due)
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
        overdue ? 'bg-rose-500' : 'bg-yellow-500'
      }`}>
        {lead.is_vip ? <Crown size={14} /> : <Clock size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/leads`}
          className="text-[13px] font-semibold text-gray-900 hover:underline truncate block"
        >
          {lead.full_name}
        </Link>
        <div className={`text-[11px] font-bold mt-0.5 ${
          overdue ? 'text-rose-600' : 'text-orange-600'
        }`}>
          {overdue ? `Overdue · ${ago}` : `Today · ${ago}`}
          <span className="text-gray-400 font-normal"> · {lead.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold hover:bg-green-200"
            title="WhatsApp"
          >
            <MessageCircle size={10} /> WA
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-bold hover:bg-gray-200"
            title="Call"
          >
            <Phone size={10} />
          </a>
        )}
      </div>
    </div>
  )
}

/* ───────────── helpers ───────────── */

function greetByHour(): { text: string; icon: React.ReactNode } {
  const h = new Date().getHours()
  if (h < 12)  return { text: 'Good morning',   icon: <Sun  size={22} className="text-yellow-500" /> }
  if (h < 18)  return { text: 'Good afternoon', icon: <Sun  size={22} className="text-orange-500" /> }
  return            { text: 'Good evening',     icon: <Star size={22} className="text-indigo-500" /> }
}

function hoursAgo(d: Date): string {
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function timeOfDay(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString()
}
