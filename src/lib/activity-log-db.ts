import { supabase } from './supabase'

/** Activity log entry — the audit feed shown on the dashboard. */
export interface ActivityLog {
  id:           string
  actor_id:     string | null
  actor_email:  string | null
  actor_role:   string | null
  action:       string
  entity_type:  string
  entity_id:    string | null
  before_value: Record<string, unknown> | null
  after_value:  Record<string, unknown> | null
  metadata:     Record<string, unknown> | null
  created_at:   string
}

/** Record an action. Calls the SECURITY DEFINER RPC so the actor_id is set
 *  from the verified auth.uid() (we don't trust client-supplied ids). */
export async function logActivity(input: {
  action:      string
  entityType:  string
  entityId?:   string | null
  before?:     unknown
  after?:      unknown
  metadata?:   unknown
}): Promise<void> {
  const { error } = await supabase.rpc('log_crm_activity', {
    p_action:      input.action,
    p_entity_type: input.entityType,
    p_entity_id:   input.entityId ?? null,
    p_before:      input.before  ?? null,
    p_after:       input.after   ?? null,
    p_metadata:    input.metadata ?? null,
  })
  if (error) console.error('logActivity', error.message)  // best-effort: don't block the user flow on audit failures
}

export async function fetchRecentActivity(limit = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('crm_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('fetchRecentActivity', error.message)
    return []
  }
  return (data ?? []) as ActivityLog[]
}

/** Map an activity row to a human-readable summary for the UI. */
export function describeActivity(a: ActivityLog): string {
  const who = a.actor_email ?? 'system'
  switch (a.action) {
    case 'lead_created':         return `${who} captured a new lead`
    case 'lead_status_changed': {
      const before = (a.before_value as any)?.status
      const after  = (a.after_value as any)?.status
      return `${who} moved a lead from ${before ?? '?'} → ${after ?? '?'}`
    }
    case 'lead_assigned':        return `${who} assigned a lead`
    case 'lead_note_added':      return `${who} added a note to a lead`
    case 'lead_followup_set':    return `${who} scheduled a follow-up`
    case 'payment_approved':     return `${who} approved a payment`
    case 'payment_declined':     return `${who} declined a payment`
    case 'ticket_created':       return `${who} opened a support ticket`
    case 'ticket_status_changed':return `${who} updated a support ticket`
    case 'profile_role_changed': return `${who} changed a profile role`
    default:                     return `${who} · ${a.action}`
  }
}
