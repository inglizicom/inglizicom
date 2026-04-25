import { supabase } from './supabase'

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'rejected'

export interface SubscriptionLead {
  id:               string
  plan_id:          string
  level:            string | null
  full_name:        string
  phone:            string | null
  city:             string | null
  amount_mad:       number | null
  status:           LeadStatus
  admin_note:       string | null
  created_at:       string
  reviewed_by:      string | null
  reviewed_at:      string | null
  source:           string | null
  goal:             string | null
  plan_interest:    string | null
  test_score:       number | null
  recommended_plan: string | null
  utm_source:       string | null
  utm_medium:       string | null
  utm_campaign:     string | null
  referrer:         string | null
  device:           string | null
  page_path:        string | null
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

export async function createSubscriptionLead(input: CreateLeadInput): Promise<void> {
  const { error } = await supabase.from('subscription_leads').insert({
    plan_id:          input.planId,
    level:            input.level         ?? null,
    full_name:        input.fullName,
    phone:            input.phone         ?? null,
    city:             input.city          ?? null,
    amount_mad:       input.amountMad     ?? null,
    source:           input.source        ?? null,
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
  opts: { status?: LeadStatus; source?: string } = {},
): Promise<SubscriptionLead[]> {
  let q = supabase
    .from('subscription_leads')
    .select('*')
    .order('created_at', { ascending: false })
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
