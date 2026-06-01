import { supabase } from './supabase'

/* CRM lead statuses — the full funnel from first contact through payment.
 * The legacy values 'converted' and 'rejected' map onto 'paid' and 'cancelled'
 * respectively, so old rows still display correctly. */
export type LeadStatus =
  | 'new'         // just came in
  | 'contacted'   // reached out at least once
  | 'interested'  // engaged, wants to know more
  | 'follow_up'   // scheduled follow-up
  | 'confirmed'   // verbally committed
  | 'paid'        // payment received (replaces 'converted')
  | 'delayed'     // promised but hasn't paid
  | 'cancelled'   // dropped (replaces 'rejected')
  | 'vip'         // priority lead
  // legacy DB values still accepted on read
  | 'converted'
  | 'rejected'

/** Canonical order of statuses for Kanban columns. */
export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'interested',
  'follow_up',
  'confirmed',
  'paid',
  'delayed',
  'cancelled',
  'vip',
]

/** Display labels + colors per status — kept here so UI is consistent. */
export const LEAD_STATUS_META: Record<LeadStatus, {
  label: string
  short: string
  color: string  // tailwind text/bg accent
  ring:  string
}> = {
  new:         { label: 'New Lead',   short: 'New',       color: 'bg-blue-50 text-blue-700 border-blue-200',         ring: 'ring-blue-200' },
  contacted:   { label: 'Contacted',  short: 'Contacted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200',   ring: 'ring-indigo-200' },
  interested:  { label: 'Interested', short: 'Interest',  color: 'bg-purple-50 text-purple-700 border-purple-200',   ring: 'ring-purple-200' },
  follow_up:   { label: 'Follow Up',  short: 'Follow Up', color: 'bg-orange-50 text-orange-700 border-orange-200',   ring: 'ring-orange-200' },
  confirmed:   { label: 'Confirmed',  short: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-200' },
  paid:        { label: 'Paid',       short: 'Paid',      color: 'bg-yellow-50 text-yellow-800 border-yellow-300',   ring: 'ring-yellow-300' },
  delayed:     { label: 'Delayed',    short: 'Delayed',   color: 'bg-amber-50 text-amber-800 border-amber-300',      ring: 'ring-amber-300' },
  cancelled:   { label: 'Cancelled',  short: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200',        ring: 'ring-gray-200' },
  vip:         { label: 'VIP',        short: 'VIP',       color: 'bg-rose-50 text-rose-700 border-rose-200',         ring: 'ring-rose-200' },
  // legacy aliases
  converted:   { label: 'Paid',       short: 'Paid',      color: 'bg-yellow-50 text-yellow-800 border-yellow-300',   ring: 'ring-yellow-300' },
  rejected:    { label: 'Cancelled',  short: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200',        ring: 'ring-gray-200' },
}

/** Normalize legacy DB values so the UI only deals with the new enum. */
export function normalizeStatus(s: LeadStatus | string | null): LeadStatus {
  if (s === 'converted') return 'paid'
  if (s === 'rejected')  return 'cancelled'
  return (s ?? 'new') as LeadStatus
}

export interface SubscriptionLead {
  id:                string
  plan_id:           string
  level:             string | null
  full_name:         string
  phone:             string | null
  city:              string | null
  amount_mad:        number | null
  status:            LeadStatus
  admin_note:        string | null
  notes:             string | null
  created_at:        string
  reviewed_by:       string | null
  reviewed_at:       string | null
  source:            string | null
  goal:              string | null
  plan_interest:     string | null
  course_interested: string | null
  test_score:        number | null
  recommended_plan:  string | null
  utm_source:        string | null
  utm_medium:        string | null
  utm_campaign:      string | null
  referrer:          string | null
  device:            string | null
  page_path:         string | null
  assigned_to_id:    string | null
  last_contact_at:   string | null
  next_followup_at:  string | null
  is_vip:            boolean
  // Migration 014 additions
  lead_source:       string | null
  course:            string | null
  lead_type:         string | null
  lost_reason:       string | null
  pending_payment:   boolean
}

/** WhatsApp link from a phone number — used in lead cards. */
export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (!cleaned) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${text}`
}

export interface CreateLeadInput {
  planId:          string
  fullName:        string
  level?:          string | null
  goal?:           string | null
  planInterest?:   string | null
  amountMad?:      number | null
  phone?:          string | null
  city?:           string | null
  source?:         string | null
  testScore?:      number | null
  recommendedPlan?: string | null
  utmSource?:      string | null
  utmMedium?:      string | null
  utmCampaign?:    string | null
  referrer?:       string | null
  device?:         string | null
  pagePath?:       string | null
}

/** Input for an assistant manually entering a lead from TikTok/Instagram/etc.
 *  Differs from CreateLeadInput in that the assistant can set status, notes,
 *  is_vip and course_interested at creation time. Returns the new lead id. */
export interface ManualLeadInput {
  fullName:          string
  phone?:            string
  city?:             string
  source:            string                // free text — common values: 'tiktok', 'instagram', 'whatsapp', 'facebook', 'referral', 'manual', 'walk-in'
  planId:            string                // plan slug, eg 'basic' / 'pro' / 'premium' / 'vip'
  amountMad:         number
  status:            LeadStatus
  notes?:            string
  isVip?:            boolean
  courseInterested?: string
  assignedToId?:     string | null
}

export async function createManualLead(input: ManualLeadInput): Promise<string> {
  const { data, error } = await supabase
    .from('subscription_leads')
    .insert({
      plan_id:           input.planId,
      full_name:         input.fullName,
      phone:             input.phone || null,
      city:              input.city  || null,
      amount_mad:        input.amountMad,
      source:            input.source,
      status:            input.status === 'vip' ? 'new' : input.status,  // 'vip' isn't a DB enum value; flag via is_vip below
      notes:             input.notes || null,
      is_vip:            !!input.isVip || input.status === 'vip',
      course_interested: input.courseInterested || null,
      assigned_to_id:    input.assignedToId || null,
      device:            'manual',
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

export async function createSubscriptionLead(input: CreateLeadInput): Promise<void> {
  const { error } = await supabase.from('subscription_leads').insert({
    plan_id:          input.planId,
    level:            input.level         ?? null,
    full_name:        input.fullName,
    phone:            input.phone         ?? null,
    city:             input.city          ?? null,
    amount_mad:       input.amountMad     ?? null,
    source:           input.source        ?? null,
    // lead_source mirrors source so the CRM can identify these as website submissions
    lead_source:      input.source        ?? 'website',
    goal:             input.goal          ?? null,
    plan_interest:    input.planInterest  ?? null,
    test_score:       input.testScore     ?? null,
    recommended_plan: input.recommendedPlan ?? null,
    utm_source:       input.utmSource     ?? null,
    utm_medium:       input.utmMedium     ?? null,
    utm_campaign:     input.utmCampaign   ?? null,
    referrer:         input.referrer      ?? null,
    device:           input.device        ?? null,
    page_path:        input.pagePath      ?? null,
    // All website form submissions are NOT archived
    is_archived:      false,
  })
  if (error) throw new Error(error.message)
}

/** Count leads created since the start of the current month — for scarcity UI. */
export async function countLeadsThisMonth(): Promise<number> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('subscription_leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString())

  if (error) return 0
  return count ?? 0
}

/** Most recent lead timestamp — drives the "someone just signed up" nudge. */
export async function fetchLatestLeadAt(): Promise<string | null> {
  const { data, error } = await supabase
    .from('subscription_leads')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data.created_at
}

export async function fetchAllLeads(
  opts: { status?: LeadStatus; source?: string; includeArchived?: boolean } = {},
): Promise<SubscriptionLead[]> {
  let q = supabase
    .from('subscription_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (!opts.includeArchived) q = q.eq('is_archived', false)
  if (opts.status) q = q.eq('status', opts.status)
  if (opts.source) q = q.eq('source', opts.source)
  const { data, error } = await q
  if (error) {
    console.error('fetchAllLeads', error.message)
    return []
  }
  return (data ?? []) as SubscriptionLead[]
}

/** Distinct source values — for the admin filter dropdown. */
export async function fetchLeadSources(): Promise<string[]> {
  const { data, error } = await supabase
    .from('subscription_leads')
    .select('source')
    .not('source', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return []
  const seen = new Set<string>()
  for (const row of data ?? []) if (row.source) seen.add(row.source)
  return [...seen].sort()
}

export async function updateLeadStatus(
  id:        string,
  status:    LeadStatus,
  adminId:   string,
  note?:     string,
): Promise<void> {
  const { error } = await supabase
    .from('subscription_leads')
    .update({
      status,
      admin_note:  note ?? null,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

/** Patch arbitrary CRM-editable fields on a lead.
 *  Use for: assigning an assistant, scheduling a follow-up, adding notes,
 *  marking VIP, recording last contact, setting the course interested in. */
export interface LeadPatch {
  status?:            LeadStatus
  assigned_to_id?:    string | null
  next_followup_at?:  string | null
  last_contact_at?:   string | null
  notes?:             string | null
  course_interested?: string | null
  is_vip?:            boolean
  phone?:             string | null
  full_name?:         string
}
export async function patchLead(id: string, patch: LeadPatch): Promise<void> {
  const { error } = await supabase
    .from('subscription_leads')
    .update(patch)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

/** Bulk-fetch leads grouped by status for the Kanban view. */
export async function fetchLeadsForKanban(): Promise<Record<LeadStatus, SubscriptionLead[]>> {
  const rows = await fetchAllLeads()
  const cols: Record<LeadStatus, SubscriptionLead[]> = {
    new: [], contacted: [], interested: [], follow_up: [],
    confirmed: [], paid: [], delayed: [], cancelled: [], vip: [],
    converted: [], rejected: [],
  }
  for (const row of rows) {
    const s = normalizeStatus(row.status)
    if (row.is_vip && s !== 'paid' && s !== 'cancelled') cols.vip.push(row)
    else cols[s].push(row)
  }
  // Discard legacy buckets (they collapse into paid/cancelled already)
  delete (cols as any).converted
  delete (cols as any).rejected
  return cols
}

/* ─────────────────────────────────────────────────────────────
   Attribution helpers — pull UTM/referrer/device from the
   current browser environment. Safe to call in client code.
───────────────────────────────────────────────────────────── */

export function getAttribution(): Pick<
  CreateLeadInput,
  'utmSource' | 'utmMedium' | 'utmCampaign' | 'referrer' | 'device' | 'pagePath'
> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource:   params.get('utm_source')   || null,
    utmMedium:   params.get('utm_medium')   || null,
    utmCampaign: params.get('utm_campaign') || null,
    referrer:    document.referrer || null,
    device:      /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    pagePath:    window.location.pathname,
  }
}
