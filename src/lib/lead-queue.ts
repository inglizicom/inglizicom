/**
 * The follow-up queue: which lead to contact next, and what one tap on an
 * outcome writes. Pure functions (no Supabase) so the rules are unit-tested.
 *
 * Every open lead must have a next step. A lead is in exactly one bucket:
 *   overdue    follow-up day already passed
 *   today      follow-up day is today
 *   fresh      came in ≤ FRESH_DAYS ago and nobody has contacted them yet
 *   no_step    talked to, but no follow-up day set (falls through the cracks)
 *   scheduled  follow-up day in the future
 *   stale      never contacted and older than FRESH_DAYS
 *   closed     paid or cancelled
 * "Now" = overdue + today + fresh + no_step, in that order.
 *
 * Days are Morocco business days (Africa/Casablanca), never the browser's UTC
 * date; a follow-up is stored as 09:00 Morocco time on its day.
 */
import { addDays, businessToday, casablancaWallTimeToIso } from './enrollment-metrics.ts'

export const FRESH_DAYS = 14

/** Structural subset of SubscriptionLead the queue reads. */
export interface QueueLead {
  id: string
  full_name: string
  status: string | null
  created_at: string
  next_followup_at: string | null
  last_contact_at: string | null
  admin_note?: string | null
  plan_id?: string | null
  course?: string | null
  level?: string | null
  test_score?: number | null
  recommended_plan?: string | null
}

export type Bucket = 'overdue' | 'today' | 'fresh' | 'no_step' | 'scheduled' | 'stale' | 'closed'
export type QueueView = 'now' | 'scheduled' | 'stale' | 'closed'

export const VIEW_BUCKETS: Record<QueueView, Bucket[]> = {
  now:       ['overdue', 'today', 'fresh', 'no_step'],
  scheduled: ['scheduled'],
  stale:     ['stale'],
  closed:    ['closed'],
}

const norm = (s: string | null) => (s === 'converted' ? 'paid' : s === 'rejected' ? 'cancelled' : s ?? 'new')
export const dayOf = (iso: string) => businessToday(new Date(iso))

export function bucketOf(l: QueueLead, today: string): Bucket {
  const s = norm(l.status)
  if (s === 'paid' || s === 'cancelled') return 'closed'
  if (l.next_followup_at) {
    const d = dayOf(l.next_followup_at)
    return d < today ? 'overdue' : d === today ? 'today' : 'scheduled'
  }
  if (s === 'new' && !l.last_contact_at) {
    return dayOf(l.created_at) >= addDays(today, -FRESH_DAYS) ? 'fresh' : 'stale'
  }
  return 'no_step'
}

const RANK: Record<Bucket, number> = { overdue: 0, today: 1, fresh: 2, no_step: 3, scheduled: 4, stale: 5, closed: 6 }
const t = (s: string | null | undefined) => (s ? +new Date(s) : 0)

/** Order inside the queue: most urgent first; within a bucket, the oldest
 *  promise first — except fresh leads, newest first (they cool fastest). */
export function compareQueue(a: QueueLead, b: QueueLead, today: string): number {
  const ba = bucketOf(a, today), bb = bucketOf(b, today)
  if (ba !== bb) return RANK[ba] - RANK[bb]
  switch (ba) {
    case 'overdue': case 'today': case 'scheduled': return t(a.next_followup_at) - t(b.next_followup_at)
    case 'fresh': case 'stale': case 'closed':      return t(b.created_at) - t(a.created_at)
    case 'no_step':                                 return t(a.last_contact_at) - t(b.last_contact_at)
  }
}

export function buildQueue<T extends QueueLead>(leads: T[], view: QueueView, today: string): T[] {
  const want = new Set(VIEW_BUCKETS[view])
  return leads.filter(l => want.has(bucketOf(l, today))).sort((a, b) => compareQueue(a, b, today))
}

export function countViews(leads: QueueLead[], today: string): Record<QueueView, number> & { doneToday: number } {
  const c = { now: 0, scheduled: 0, stale: 0, closed: 0, doneToday: 0 }
  for (const l of leads) {
    const b = bucketOf(l, today)
    for (const v of Object.keys(VIEW_BUCKETS) as QueueView[]) if (VIEW_BUCKETS[v].includes(b)) c[v]++
    if (l.last_contact_at && dayOf(l.last_contact_at) === today) c.doneToday++
  }
  return c
}

/* ── Outcomes: one tap after a call or a message ─────────────────────── */

export type OutcomeId = 'no_answer' | 'interested' | 'will_pay' | 'paid' | 'lost'
export interface Outcome {
  id: OutcomeId
  label: string
  hint: string
  status: 'contacted' | 'interested' | 'confirmed' | 'paid' | 'cancelled'
  /** Default next follow-up, in days from today; null = no follow-up (closed). */
  days: number | null
}
export const OUTCOMES: Outcome[] = [
  { id: 'no_answer',  label: 'لم يرد',          hint: 'نعيد المحاولة غدًا',           status: 'contacted',  days: 1 },
  { id: 'interested', label: 'مهتم، يحتاج وقتًا', hint: 'نتابع بعد يومين',             status: 'interested', days: 2 },
  { id: 'will_pay',   label: 'وافق وسيدفع',      hint: 'نذكّره بالدفع غدًا',           status: 'confirmed',  days: 1 },
  { id: 'paid',       label: 'دفع',              hint: 'يتحوّل إلى طالب',              status: 'paid',       days: null },
  { id: 'lost',       label: 'غير مهتم',         hint: 'يُغلق مع ذكر السبب',           status: 'cancelled',  days: null },
]
export const FOLLOWUP_CHOICES = [
  { days: 1, label: 'غدًا' }, { days: 2, label: 'بعد يومين' }, { days: 3, label: 'بعد 3 أيام' }, { days: 7, label: 'بعد أسبوع' },
]
export const LOST_REASONS_AR = [
  { id: 'too_expensive', label: 'السعر' },
  { id: 'no_time',       label: 'ليس الآن' },
  { id: 'no_reply',      label: 'لا يرد أبدًا' },
  { id: 'not_serious',   label: 'غير جاد' },
  { id: 'other_school',  label: 'اختار مدرسة أخرى' },
  { id: 'other',         label: 'سبب آخر' },
]

export interface OutcomeInput {
  outcome: OutcomeId
  today: string
  nowIso: string
  staffId: string
  /** Overrides the outcome's default follow-up delay. */
  days?: number | null
  note?: string
  lostReason?: string | null
}

/** The lead patch for an outcome. Also claims an unassigned lead for whoever
 *  logged the contact, and appends the note (dated) to the lead's notes. */
export function outcomePatch(lead: QueueLead & { assigned_to_id?: string | null }, input: OutcomeInput) {
  const o = OUTCOMES.find(x => x.id === input.outcome)!
  const days = o.days === null ? null : input.days ?? o.days
  const note = input.note?.trim()
  const patch: {
    status: Outcome['status']; last_contact_at: string; next_followup_at: string | null
    assigned_to_id?: string; admin_note?: string; lost_reason?: string | null
  } = {
    status: o.status,
    last_contact_at: input.nowIso,
    next_followup_at: days === null ? null : casablancaWallTimeToIso(addDays(input.today, days), '09:00'),
  }
  if (!lead.assigned_to_id) patch.assigned_to_id = input.staffId
  if (note) patch.admin_note = [`${input.today}: ${note}`, lead.admin_note?.trim()].filter(Boolean).join('\n')
  if (o.id === 'lost') patch.lost_reason = input.lostReason ?? 'other'
  return patch
}

/* ── What they asked for, and the first message ──────────────────────── */

const COURSE_AR: Record<string, string> = {
  a0a1: 'مستوى A0 → A1', a1a2: 'مستوى A1 → A2', a2b1: 'مستوى A2 → B1', private: 'الدروس الخاصة',
}

/** Short Arabic label of what the lead wants. `planTitle` resolves a plan id. */
export function leadWant(l: QueueLead, planTitle: (id: string) => string | undefined): string {
  const p = l.plan_id && l.plan_id !== 'website' ? planTitle(l.plan_id) : undefined
  return p ?? (l.course && COURSE_AR[l.course]) ?? (l.recommended_plan && planTitle(l.recommended_plan)) ?? 'تعلّم الإنجليزية'
}

/** The pre-written WhatsApp message: a first hello for a new lead, a
 *  check-in for one already contacted. Staff can edit it in WhatsApp. */
export function waMessage(l: QueueLead, want: string): string {
  const first = l.full_name.trim().split(/\s+/)[0] || ''
  const fresh = norm(l.status) === 'new' && !l.last_contact_at
  if (fresh && l.level) {
    return `السلام عليكم ${first} 👋 معك فريق إنجليزي.كوم. وصلتنا نتيجة اختبار المستوى ديالك (${l.level}) وعندنا مسار مناسب لك بالضبط: ${want}. متى يناسبك نشرح لك التفاصيل؟`
  }
  if (fresh) {
    return `السلام عليكم ${first} 👋 معك فريق إنجليزي.كوم. وصلنا طلبك بخصوص ${want}. متى يناسبك نشرح لك التفاصيل؟`
  }
  return `السلام عليكم ${first}، كيف حالك؟ نتابع معك بخصوص ${want}. هل عندك أي سؤال نقدر نساعدك فيه؟`
}
