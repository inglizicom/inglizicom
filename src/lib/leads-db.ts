import { supabase } from './supabase'

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'rejected'

export interface SubscriptionLead {
  id:          string
  plan_id:     string
  level:       string | null
  full_name:   string
  phone:       string
  city:        string
  amount_mad:  number | null
  status:      LeadStatus
  admin_note:  string | null
  created_at:  string
  reviewed_by: string | null
  reviewed_at: string | null
}

export async function createSubscriptionLead(input: {
  planId:    string
  level:     string | null
  fullName:  string
  phone:     string
  city:      string
  amountMad: number | null
}): Promise<void> {
  const { error } = await supabase.from('subscription_leads').insert({
    plan_id:    input.planId,
    level:      input.level,
    full_name:  input.fullName,
    phone:      input.phone,
    city:       input.city,
    amount_mad: input.amountMad,
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
  status?: LeadStatus,
): Promise<SubscriptionLead[]> {
  let q = supabase
    .from('subscription_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) {
    console.error('fetchAllLeads', error.message)
    return []
  }
  return (data ?? []) as SubscriptionLead[]
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
