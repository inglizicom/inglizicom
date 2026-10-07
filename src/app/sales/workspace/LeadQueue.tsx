'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Archive, BarChart3, CalendarClock, CalendarDays, Check, CheckCircle2, ChevronDown, Clock,
  CreditCard, Crown, Filter, List, Loader2, MessageCircle, Phone, PhoneMissed, Search, Sparkles, ThumbsUp,
  Users, X, XCircle, Zap, type LucideIcon,
} from 'lucide-react'

import {
  fetchFollowupReport, recordLeadOutcome, whatsappLink, type FollowupReport, type SubscriptionLead,
} from '@/lib/leads-db'
import {
  FOLLOWUP_CHOICES, LOST_REASONS_AR, OUTCOMES, bucketOf, buildQueue, countOutcomes, countViews, dayOf, leadWant,
  matchesOutcome, outcomePatch, waMessage, type Bucket, type OutcomeFilter, type OutcomeId, type QueueView,
} from '@/lib/lead-queue'
import { addDays, businessToday, daysInclusive, formatDay } from '@/lib/enrollment-metrics'
import { getPlan } from '@/data/plans'
import { getSourceMeta } from '@/lib/crm-types'
import { type StaffRow } from '@/lib/staff-db'
import Avatar from '@/app/sales/_components/Avatar'

/**
 * The leads page as a follow-up queue. Staff open it and work top to bottom:
 * the list is already ordered (overdue → due today → new → no next step), each
 * card has the pre-written WhatsApp message and the call button, and after
 * contacting someone one tap records what happened — status, contact time,
 * next follow-up day and an optional note — and the card leaves the queue.
 *
 * The full table with filters and bulk actions is still one tab away ("كل
 * العملاء", rendered by WorkspaceClient), for searching and clean-up.
 */

export type LeadsView = QueueView | 'all'

const VIEWS: { id: LeadsView; label: string; Icon: LucideIcon }[] = [
  { id: 'now',       label: 'للتواصل الآن',     Icon: Zap },
  { id: 'scheduled', label: 'مجدولة',            Icon: CalendarClock },
  { id: 'stale',     label: 'قديمة بلا تواصل',  Icon: Archive },
  { id: 'closed',    label: 'مغلقة',             Icon: CheckCircle2 },
  { id: 'all',       label: 'كل العملاء',        Icon: List },
]

const CHIPS: { id: OutcomeFilter; label: string; Icon: LucideIcon; cls: string }[] = [
  { id: 'all',         label: 'الكل',            Icon: Filter,      cls: 'border-zinc-200 text-zinc-700' },
  { id: 'uncontacted', label: 'لم يُتصل بهم',     Icon: Sparkles,    cls: 'border-blue-200 text-blue-700' },
  { id: 'no_answer',   label: 'اتصلنا ولم يرد',   Icon: PhoneMissed, cls: 'border-zinc-300 text-zinc-700' },
  { id: 'interested',  label: 'مهتم',            Icon: ThumbsUp,    cls: 'border-violet-200 text-violet-700' },
  { id: 'will_pay',    label: 'وافق وسيدفع',      Icon: Check,       cls: 'border-emerald-200 text-emerald-700' },
  { id: 'no_step',     label: 'بلا موعد متابعة',  Icon: CalendarClock, cls: 'border-amber-200 text-amber-800' },
]

/* ── Results period ─────────────────────────────────────────────────── */

export type PeriodPreset = 'today' | '7' | '30' | 'month' | 'all' | 'custom'
export interface Period { preset: PeriodPreset; from: string | null; to: string | null }

export function periodFor(preset: Exclude<PeriodPreset, 'custom'>, today = businessToday()): Period {
  switch (preset) {
    case 'today': return { preset, from: today, to: today }
    case '7':     return { preset, from: addDays(today, -6), to: today }
    case '30':    return { preset, from: addDays(today, -29), to: today }
    case 'month': return { preset, from: `${today.slice(0, 7)}-01`, to: today }
    case 'all':   return { preset, from: null, to: null }
  }
}
const PRESETS: { id: Exclude<PeriodPreset, 'custom'>; label: string }[] = [
  { id: 'today', label: 'اليوم' }, { id: '7', label: '7 أيام' }, { id: '30', label: '30 يومًا' },
  { id: 'month', label: 'هذا الشهر' }, { id: 'all', label: 'منذ البداية' },
]

const OUTCOME_TILES: { key: keyof FollowupReport['outcomes']; label: string; Icon: LucideIcon; cls: string }[] = [
  { key: 'no_answer',  label: 'لم يرد',      Icon: PhoneMissed, cls: 'text-zinc-700 bg-zinc-50 border-zinc-200' },
  { key: 'interested', label: 'مهتم',        Icon: ThumbsUp,    cls: 'text-violet-700 bg-violet-50 border-violet-200' },
  { key: 'will_pay',   label: 'وافق وسيدفع',  Icon: Check,       cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'paid',       label: 'دفع',         Icon: CreditCard,  cls: 'text-yellow-800 bg-yellow-50 border-yellow-300' },
  { key: 'lost',       label: 'غير مهتم',    Icon: XCircle,     cls: 'text-red-700 bg-red-50 border-red-200' },
]

/** What the follow-up work gave over a period: leads in, leads reached,
 *  attempts, and each reached lead's latest outcome (staff_followup_report, 065). */
function FollowupStats({ period, onPeriod }: { period: Period; onPeriod: (p: Period) => void }) {
  const [open, setOpen] = useState(true)
  // On a phone the panel would push the queue below the fold: start folded.
  useEffect(() => { if (window.innerWidth < 768) setOpen(false) }, [])
  const [r, setR] = useState<FollowupReport | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setR(null); setErr(null)
    fetchFollowupReport(period.from, period.to)
      .then(x => { if (alive) setR(x) })
      .catch(e => { if (alive) setErr(e.message) })
    return () => { alive = false }
  }, [period.from, period.to])

  const reached = r ? r.contacted_leads : 0
  const pct = (n: number) => (reached ? `${Math.round((n / reached) * 100)}%` : '—')

  return (
    <section className="bg-white border-b border-zinc-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
          className="inline-flex items-center gap-2 text-[14px] font-extrabold text-zinc-900">
          <BarChart3 size={17} className="text-yellow-500" /> نتائج المتابعة
          <ChevronDown size={15} className={`text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="الفترة">
          {PRESETS.map(p => (
            <button key={p.id} type="button" aria-pressed={period.preset === p.id} onClick={() => onPeriod(periodFor(p.id))}
              className={`px-2.5 py-1 rounded-full text-[12px] font-bold border ${period.preset === p.id ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}>
              {p.label}
            </button>
          ))}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-bold ${period.preset === 'custom' ? 'border-zinc-900' : 'border-zinc-200'}`}>
            <CalendarDays size={13} className="text-zinc-400" />
            <input type="date" aria-label="من تاريخ" value={period.from ?? ''} dir="ltr"
              onChange={e => onPeriod({ preset: 'custom', from: e.target.value || null, to: period.to ?? businessToday() })}
              className="bg-transparent text-[12px] font-bold text-zinc-700 w-[118px] focus:outline-none" />
            <span className="text-zinc-300">←</span>
            <input type="date" aria-label="إلى تاريخ" value={period.to ?? ''} dir="ltr"
              onChange={e => onPeriod({ preset: 'custom', from: period.from, to: e.target.value || null })}
              className="bg-transparent text-[12px] font-bold text-zinc-700 w-[118px] focus:outline-none" />
          </span>
        </div>
      </div>

      {open && (
        err ? <p className="mt-3 text-[12.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{err}</p>
        : !r ? <div className="mt-3 h-[76px] rounded-xl bg-zinc-50 animate-pulse" />
        : (
          <div className="mt-3 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { l: 'عملاء جدد', v: r.new_leads, sub: r.new_waiting ? `${r.new_waiting} لم يُتصل بهم بعد` : 'كلهم تم التواصل معهم', warn: r.new_waiting > 0 },
                { l: 'تم التواصل معهم', v: r.contacted_leads, sub: 'عميلًا مختلفًا' },
                { l: 'محاولات تواصل', v: r.attempts, sub: reached ? `${(r.attempts / reached).toFixed(1)} لكل عميل` : '—' },
                { l: 'تحويل إلى دفع', v: pct(r.outcomes.paid), sub: `${r.outcomes.paid} دفعوا` },
              ].map(k => (
                <div key={k.l} className="rounded-xl border border-zinc-200 px-3 py-2.5">
                  <div className="text-[11.5px] font-bold text-zinc-500">{k.l}</div>
                  <div className="text-[22px] font-black text-zinc-900 tabular-nums leading-tight">{k.v}</div>
                  <div className={`text-[11px] font-semibold ${k.warn ? 'text-red-600' : 'text-zinc-400'}`}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {OUTCOME_TILES.map(t => (
                <div key={t.key} className={`rounded-xl border px-2 py-2 text-center ${t.cls}`}>
                  <t.Icon size={15} className="mx-auto" />
                  <div className="text-[18px] font-black tabular-nums leading-tight">{r.outcomes[t.key]}</div>
                  <div className="text-[10.5px] font-bold leading-tight">{t.label}</div>
                  <div className="text-[10px] font-semibold opacity-60">{pct(r.outcomes[t.key])}</div>
                </div>
              ))}
            </div>
            {r.by_staff.length > 0 && (
              <p className="text-[11.5px] text-zinc-500">
                {r.by_staff.map(s => `${s.name}: ${s.attempts} محاولة مع ${s.leads} عميل`).join(' · ')}
              </p>
            )}
          </div>
        )
      )}
    </section>
  )
}

const planTitle = (id: string) => getPlan(id)?.title_ar

const LAST_OUTCOME: Record<string, { label: string; cls: string }> = {
  no_answer:  { label: 'لم يرد',      cls: 'bg-zinc-100 text-zinc-700' },
  interested: { label: 'مهتم',        cls: 'bg-violet-50 text-violet-700' },
  will_pay:   { label: 'وافق وسيدفع',  cls: 'bg-emerald-50 text-emerald-700' },
  paid:       { label: 'دفع',         cls: 'bg-yellow-50 text-yellow-800' },
  lost:       { label: 'غير مهتم',    cls: 'bg-red-50 text-red-700' },
}

function ago(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - +new Date(iso)) / 60_000))
  if (m < 60) return `منذ ${m || 1} د`
  const h = Math.round(m / 60)
  if (h < 24) return `منذ ${h} س`
  const d = Math.round(h / 24)
  return d === 1 ? 'منذ يوم' : d === 2 ? 'منذ يومين' : `منذ ${d} أيام`
}

function badge(l: SubscriptionLead, b: Bucket, today: string): { text: string; cls: string; Icon: LucideIcon } {
  switch (b) {
    case 'overdue': {
      const late = daysInclusive(dayOf(l.next_followup_at!), today) - 1
      return { text: late === 1 ? 'متأخر يومًا' : `متأخر ${late} أيام`, cls: 'bg-red-50 text-red-700 border-red-200', Icon: AlertTriangle }
    }
    case 'today':     return { text: 'متابعة اليوم', cls: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Clock }
    case 'fresh':     return { text: `جديد · ${ago(l.created_at)}`, cls: 'bg-blue-50 text-blue-700 border-blue-200', Icon: Sparkles }
    case 'no_step':   return { text: 'بلا موعد متابعة', cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: CalendarClock }
    case 'scheduled': return { text: formatDay(dayOf(l.next_followup_at!)), cls: 'bg-zinc-50 text-zinc-600 border-zinc-200', Icon: CalendarClock }
    case 'stale':     return { text: `لم يُتواصل معه · ${ago(l.created_at)}`, cls: 'bg-zinc-50 text-zinc-500 border-zinc-200', Icon: Clock }
    case 'closed':    return l.status === 'cancelled' || l.status === 'rejected'
      ? { text: 'غير مهتم', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', Icon: XCircle }
      : { text: 'دفع', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 }
  }
}

export default function LeadQueue({
  leads, view, onView, staffId, isFounder, staffMap, onOpen, onLeadChanged, allView, period, onPeriod,
}: {
  leads:         SubscriptionLead[]
  view:          LeadsView
  onView:        (v: LeadsView) => void
  /** The results period — also narrows the "all leads" table (WorkspaceClient). */
  period:        Period
  onPeriod:      (p: Period) => void
  staffId:       string
  isFounder:     boolean
  staffMap:      Map<string, StaffRow>
  onOpen:        (l: SubscriptionLead) => void
  /** Apply a saved outcome locally, so the card moves without a reload. */
  onLeadChanged: (id: string, patch: Partial<SubscriptionLead>) => void
  /** The full table (search, filters, bulk) — rendered for the "all" view. */
  allView:       React.ReactNode
}) {
  const today = businessToday()
  const [q, setQ] = useState('')
  /* An assistant's queue = their leads + unassigned ones; the founder sees all. */
  const [mine, setMine] = useState(!isFounder)
  const [chip, setChip] = useState<OutcomeFilter>('all')
  const [outcomeFor, setOutcomeFor] = useState<SubscriptionLead | null>(null)

  const scoped = useMemo(() => {
    const s = q.trim().toLowerCase()
    return leads.filter(l =>
      (!mine || !l.assigned_to_id || l.assigned_to_id === staffId) &&
      (!s || `${l.full_name} ${l.phone ?? ''} ${l.city ?? ''}`.toLowerCase().includes(s)))
  }, [leads, q, mine, staffId])

  const counts = useMemo(() => countViews(scoped, today), [scoped, today])
  const viewList = useMemo(() => (view === 'all' ? [] : buildQueue(scoped, view, today)), [scoped, view, today])
  const chipCounts = useMemo(() => countOutcomes(viewList, today), [viewList, today])
  const list = useMemo(() => viewList.filter(l => matchesOutcome(l, chip, today)), [viewList, chip, today])

  /* Scheduled leads read best grouped by their follow-up day. */
  const groups = useMemo(() => {
    if (view !== 'scheduled') return null
    const m = new Map<string, SubscriptionLead[]>()
    for (const l of list) {
      const d = dayOf(l.next_followup_at!)
      m.set(d, [...(m.get(d) ?? []), l])
    }
    return [...m.entries()]
  }, [view, list])

  const card = (l: SubscriptionLead) => (
    <QueueCard key={l.id} lead={l} today={today}
      owner={l.assigned_to_id && l.assigned_to_id !== staffId ? staffMap.get(l.assigned_to_id)?.email?.split('@')[0] : undefined}
      onOpen={() => onOpen(l)} onContacted={() => setOutcomeFor(l)} />
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Results of the follow-up work over a period ─── */}
      <FollowupStats period={period} onPeriod={onPeriod} />

      {/* ── Views + progress ─────────────────────────────── */}
      <div className="bg-white border-b border-zinc-200 px-4 pt-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="inline-flex items-center gap-1.5 font-extrabold text-zinc-900">
              <CheckCircle2 size={16} className="text-emerald-600" /> تواصلت اليوم مع {counts.doneToday}
            </span>
            <span className="text-zinc-300">·</span>
            <span className={`font-bold ${counts.now ? 'text-red-600' : 'text-emerald-700'}`}>
              {counts.now ? `${counts.now} ينتظرون` : 'لا أحد ينتظر 🎉'}
            </span>
          </div>
          <button type="button" onClick={() => setMine(v => !v)}
            className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border ${mine ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}>
            <Users size={13} /> {mine ? 'عملائي + غير المسندين' : 'كل الفريق'}
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto -mx-4 px-4 mt-2" role="tablist">
          {VIEWS.map(v => {
            const n = v.id === 'all' ? null : counts[v.id]
            const on = view === v.id
            return (
              <button key={v.id} role="tab" aria-selected={on} onClick={() => { onView(v.id); setChip('all') }}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-bold border-b-2 whitespace-nowrap ${on ? 'border-yellow-400 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}>
                <v.Icon size={15} /> {v.label}
                {n !== null && <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${on && v.id === 'now' && n ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{n}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {view === 'all' ? allView : (
        <div className="px-4 py-4 flex-1">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="relative">
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400 pointer-events-none" />
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..."
                className="w-full pr-9 pl-3 py-2.5 text-[14px] bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>

            {/* Outcome chips — narrow the list to one kind of lead */}
            <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-0.5" role="group" aria-label="تصفية حسب النتيجة">
              {CHIPS.map(c => {
                const n = chipCounts[c.id]
                const on = chip === c.id
                if (c.id !== 'all' && n === 0 && !on) return null
                return (
                  <button key={c.id} type="button" aria-pressed={on} onClick={() => setChip(on ? 'all' : c.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors ${on ? 'bg-zinc-900 border-zinc-900 text-white' : `bg-white ${c.cls} hover:border-zinc-300`}`}>
                    <c.Icon size={13} /> {c.label}
                    <span className={`text-[11px] tabular-nums ${on ? 'text-zinc-300' : 'opacity-70'}`}>{n}</span>
                  </button>
                )
              })}
            </div>

            {view === 'stale' && list.length > 0 && (
              <p className="text-[12.5px] text-zinc-500 bg-white border border-zinc-200 rounded-xl px-4 py-3 leading-relaxed">
                طلبوا معلومات منذ أكثر من أسبوعين ولم يتواصل معهم أحد. أرسل لكل واحد رسالة أخيرة ثم سجّل النتيجة — أو «غير مهتم» لإغلاقه.
              </p>
            )}

            {list.length === 0 && (
              <div className="text-center py-16 text-[14px] text-zinc-400">
                {chip !== 'all' ? 'لا يوجد عملاء بهذه النتيجة هنا.'
                  : view === 'now' ? '🎉 لا أحد ينتظر — كل العملاء لديهم خطوة تالية.' : 'لا يوجد عملاء هنا.'}
              </div>
            )}

            {groups
              ? groups.map(([d, ls]) => (
                  <section key={d} className="space-y-3">
                    <h3 className="flex items-center gap-2 pt-2 text-[13px] font-extrabold text-zinc-700">
                      <CalendarDays size={15} className="text-zinc-400" />
                      {d === addDays(today, 1) ? 'غدًا' : formatDay(d)}
                      <span className="text-[11px] font-bold text-zinc-400">{ls.length}</span>
                    </h3>
                    {ls.map(card)}
                  </section>
                ))
              : list.map(card)}
          </div>
        </div>
      )}

      {outcomeFor && (
        <OutcomeSheet lead={outcomeFor} today={today} staffId={staffId}
          onClose={() => setOutcomeFor(null)}
          onSaved={patch => { onLeadChanged(outcomeFor.id, patch); setOutcomeFor(null) }} />
      )}
    </div>
  )
}

function QueueCard({ lead, today, owner, onOpen, onContacted }: {
  lead: SubscriptionLead; today: string; owner?: string; onOpen: () => void; onContacted: () => void
}) {
  const b = bucketOf(lead, today)
  const { text, cls, Icon } = badge(lead, b, today)
  const want = leadWant(lead, planTitle)
  const source = getSourceMeta(lead.lead_source ?? lead.source)
  const lastNote = lead.admin_note?.split('\n')[0]?.trim()
  const wa = whatsappLink(lead.phone, waMessage(lead, want))
  const closed = b === 'closed'

  return (
    <article className="bg-white rounded-2xl border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onOpen} className="shrink-0" aria-label={`فتح ${lead.full_name}`}>
          <Avatar name={lead.full_name} size={42} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={onOpen} className="min-w-0 text-right">
              <span className="flex items-center gap-1 font-extrabold text-[15.5px] text-zinc-900 truncate">
                {lead.is_vip && <Crown size={13} className="text-rose-500 shrink-0" />}{lead.full_name}
              </span>
            </button>
            <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
              <Icon size={11} /> {text}
            </span>
          </div>
          <div className="mt-0.5 text-[12.5px] text-zinc-500 flex flex-wrap items-center gap-x-1.5">
            <span className="font-bold text-zinc-700">{want}</span>
            <span className="text-zinc-300">·</span><span>{source.emoji} {source.label}</span>
            {lead.city && <><span className="text-zinc-300">·</span><span>{lead.city}</span></>}
            {owner && <><span className="text-zinc-300">·</span><span>👤 {owner}</span></>}
          </div>
          {(lead.last_outcome || (lead.contact_attempts ?? 0) > 0) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold">
              {lead.last_outcome && LAST_OUTCOME[lead.last_outcome] && (
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 ${LAST_OUTCOME[lead.last_outcome].cls}`}>
                  آخر نتيجة: {LAST_OUTCOME[lead.last_outcome].label}
                </span>
              )}
              {(lead.contact_attempts ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 text-zinc-600 px-1.5 py-0.5">
                  <Phone size={11} /> {lead.contact_attempts} {lead.contact_attempts === 1 ? 'محاولة' : 'محاولات'}
                </span>
              )}
              {lead.last_contact_at && <span className="text-zinc-400 font-semibold">آخر تواصل {ago(lead.last_contact_at)}</span>}
            </div>
          )}
          {lastNote && <p className="mt-1.5 text-[12.5px] text-zinc-600 bg-zinc-50 rounded-lg px-2.5 py-1.5 line-clamp-2">📝 {lastNote}</p>}
        </div>
      </div>

      {!closed && (
        <div className="mt-3 flex items-center gap-2">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" onClick={onContacted}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[13.5px] py-2.5">
              <MessageCircle size={16} /> واتساب
            </a>
          ) : (
            <span className="flex-1 text-center text-[12px] text-zinc-400 py-2.5">لا يوجد رقم</span>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`} onClick={onContacted} aria-label="اتصال"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-[13.5px] px-4 py-2.5 hover:bg-zinc-50">
              <Phone size={15} /> <span className="hidden sm:inline">اتصال</span>
            </a>
          )}
          <button type="button" onClick={onContacted}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[13.5px] px-4 py-2.5">
            <Check size={15} /> سجّل النتيجة
          </button>
        </div>
      )}
    </article>
  )
}

const OUTCOME_ICON: Record<OutcomeId, LucideIcon> = {
  no_answer: PhoneMissed, interested: ThumbsUp, will_pay: Check, paid: CreditCard, lost: XCircle,
}
const OUTCOME_TONE: Record<OutcomeId, string> = {
  no_answer: 'border-zinc-200', interested: 'border-violet-200', will_pay: 'border-emerald-200',
  paid: 'border-yellow-300', lost: 'border-zinc-200',
}

function OutcomeSheet({ lead, today, staffId, onClose, onSaved }: {
  lead: SubscriptionLead; today: string; staffId: string
  onClose: () => void; onSaved: (patch: Partial<SubscriptionLead>) => void
}) {
  const router = useRouter()
  const [picked, setPicked] = useState<OutcomeId | null>(null)
  const [days, setDays] = useState<number | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const o = OUTCOMES.find(x => x.id === picked)
  const first = lead.full_name.trim().split(/\s+/)[0]

  function pick(id: OutcomeId) {
    setPicked(id); setError(null)
    setDays(OUTCOMES.find(x => x.id === id)!.days)
  }

  async function save() {
    if (!o) return
    if (o.id === 'lost' && !reason) { setError('اختر السبب'); return }
    setBusy(true); setError(null)
    try {
      const patch = outcomePatch(lead, {
        outcome: o.id, today, nowIso: new Date().toISOString(), staffId,
        days, note, lostReason: reason,
      })
      const studentId = await recordLeadOutcome(lead.id, patch, {
        title: `${o.label}${patch.next_followup_at ? ` — متابعة ${formatDay(dayOf(patch.next_followup_at))}` : ''}`,
        body: note.trim() || undefined,
      })
      onSaved(patch as Partial<SubscriptionLead>)
      if (studentId) router.push(`/sales/students/${studentId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر الحفظ')
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onClose} />
      <div role="dialog" aria-modal="true" aria-label={`نتيجة التواصل مع ${lead.full_name}`}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-extrabold text-zinc-900">ماذا حدث مع {first}؟</h3>
          <button onClick={onClose} disabled={busy} aria-label="إغلاق" className="p-1 text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {OUTCOMES.map(x => {
            const I = OUTCOME_ICON[x.id]
            const on = picked === x.id
            return (
              <button key={x.id} type="button" onClick={() => pick(x.id)}
                className={`text-right rounded-2xl border-2 p-3 transition-colors ${x.id === 'lost' ? 'col-span-2' : ''} ${on ? 'border-zinc-900 bg-zinc-900 text-white' : `${OUTCOME_TONE[x.id]} bg-white hover:bg-zinc-50`}`}>
                <span className="flex items-center gap-1.5 text-[14px] font-extrabold"><I size={16} /> {x.label}</span>
                <span className={`block text-[11.5px] mt-0.5 ${on ? 'text-zinc-300' : 'text-zinc-500'}`}>{x.hint}</span>
              </button>
            )
          })}
        </div>

        {o && o.days !== null && (
          <div className="mt-4">
            <div className="text-[12px] font-bold text-zinc-500 mb-1.5">المتابعة القادمة</div>
            <div className="flex flex-wrap gap-1.5">
              {FOLLOWUP_CHOICES.map(c => (
                <button key={c.days} type="button" onClick={() => setDays(c.days)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border ${days === c.days ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {o?.id === 'lost' && (
          <div className="mt-4">
            <div className="text-[12px] font-bold text-zinc-500 mb-1.5">السبب</div>
            <div className="flex flex-wrap gap-1.5">
              {LOST_REASONS_AR.map(r => (
                <button key={r.id} type="button" onClick={() => setReason(r.id)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border ${reason === r.id ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {o && (
          <>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="ملاحظة قصيرة (اختياري) — مثلًا: يفضّل المساء"
              className="mt-4 w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            {error && <p className="mt-2 text-[12.5px] font-bold text-red-600">{error}</p>}
            <button type="button" onClick={save} disabled={busy}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-[14.5px] py-3 disabled:opacity-60">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {o.id === 'paid' ? 'حفظ وفتح ملف الطالب' : 'حفظ'}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
