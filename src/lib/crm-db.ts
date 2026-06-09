/**
 * CRM database helpers — students, payments, lead timeline.
 * Keeps the components thin; all Supabase calls live here.
 */
import { supabase } from './supabase'
import type {
  CrmStudent, CrmPayment, LeadEvent, PaymentType, PaymentStatus,
} from './crm-types'

// Re-export so pages can import from a single place.
export type { CrmStudent, CrmPayment, LeadEvent } from './crm-types'

/* ─── Students ─────────────────────────────────────────────── */

export async function fetchStudents(opts: {
  type?:   'course_student' | 'private_student'
  active?: boolean
  search?: string
} = {}): Promise<CrmStudent[]> {
  let q = supabase
    .from('crm_students')
    .select('*')
    .order('created_at', { ascending: false })
  if (opts.type)   q = q.eq('student_type', opts.type)
  if (opts.active !== undefined) q = q.eq('is_active', opts.active)
  if (opts.search) {
    const s = `%${opts.search.trim()}%`
    q = q.or(`full_name.ilike.${s},phone_number.ilike.${s},notes.ilike.${s}`)
  }
  const { data, error } = await q
  if (error) { console.error('fetchStudents', error.message); return [] }
  return (data ?? []) as CrmStudent[]
}

export async function fetchStudentById(id: string): Promise<CrmStudent | null> {
  const { data } = await supabase.from('crm_students').select('*').eq('id', id).maybeSingle()
  return data as CrmStudent | null
}

/** Look up a student by their verification token (anti-scam check). */
export async function fetchStudentByToken(token: string): Promise<CrmStudent | null> {
  const clean = token.trim().toUpperCase()
  if (!clean) return null
  const { data } = await supabase
    .from('crm_students')
    .select('*')
    .eq('verification_token', clean)
    .maybeSingle()
  return (data ?? null) as CrmStudent | null
}

export async function fetchStudentByLeadId(leadId: string): Promise<CrmStudent | null> {
  const { data } = await supabase.from('crm_students').select('*').eq('lead_id', leadId).maybeSingle()
  return data as CrmStudent | null
}

export async function patchStudent(id: string, patch: Partial<CrmStudent>): Promise<void> {
  const { error } = await supabase.from('crm_students').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Convert a paid lead to a student using the SECURITY DEFINER RPC. */
export async function convertLeadToStudent(leadId: string): Promise<string> {
  const { data, error } = await supabase.rpc('convert_lead_to_student', { p_lead_id: leadId })
  if (error) throw new Error(error.message)
  return data as string
}

export async function fetchStudentStats(): Promise<{
  total: number; course: number; private: number; overdue: number; revenue: number
}> {
  const { data } = await supabase.from('crm_students').select('student_type, payment_status, total_paid_mad')
  let course = 0, priv = 0, overdue = 0, revenue = 0
  for (const r of data ?? []) {
    if (r.student_type === 'course_student') course++; else priv++
    if (r.payment_status === 'overdue') overdue++
    revenue += Number(r.total_paid_mad ?? 0)
  }
  return { total: (data ?? []).length, course, private: priv, overdue, revenue }
}

export async function fetchPrivateStudentsWithUpcomingPayments(daysAhead = 14): Promise<CrmStudent[]> {
  const until = new Date(); until.setDate(until.getDate() + daysAhead)
  const { data } = await supabase
    .from('crm_students')
    .select('*')
    .eq('student_type', 'private_student')
    .eq('is_active', true)
    .lte('next_payment_date', until.toISOString().slice(0, 10))
    .order('next_payment_date', { ascending: true })
  return (data ?? []) as CrmStudent[]
}

/* ─── CRM Payments ─────────────────────────────────────────── */

export async function fetchCrmPayments(opts: {
  status?: PaymentStatus
  leadId?: string
  studentId?: string
  limit?: number
} = {}): Promise<CrmPayment[]> {
  let q = supabase.from('crm_payments').select('*').order('created_at', { ascending: false })
  if (opts.status)    q = q.eq('payment_status', opts.status)
  if (opts.leadId)    q = q.eq('lead_id', opts.leadId)
  if (opts.studentId) q = q.eq('student_id', opts.studentId)
  if (opts.limit)     q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) { console.error('fetchCrmPayments', error.message); return [] }
  return (data ?? []) as CrmPayment[]
}

export async function createCrmPayment(input: {
  leadId?:           string
  studentId?:        string
  type:              PaymentType
  courseOrService?:  string
  amountMad:         number
  paymentDate?:      string
  nextPaymentDate?:  string
  notes?:            string
}): Promise<string> {
  const { data, error } = await supabase
    .from('crm_payments')
    .insert({
      lead_id:            input.leadId    ?? null,
      student_id:         input.studentId ?? null,
      payment_type:       input.type,
      course_or_service:  input.courseOrService ?? null,
      amount_mad:         input.amountMad,
      payment_status:     'pending',
      payment_date:       input.paymentDate       ?? null,
      next_payment_date:  input.nextPaymentDate    ?? null,
      notes:              input.notes              ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

export async function approveCrmPayment(id: string, approverId: string): Promise<void> {
  const { error } = await supabase
    .from('crm_payments')
    .update({ payment_status: 'paid', approved_by_id: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function declineCrmPayment(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_payments')
    .update({ payment_status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

/** Revenue totals for the KPI cards. */
export async function fetchRevenueTotals(): Promise<{
  today: number; week: number; month: number; year: number; allTime: number
}> {
  const now   = new Date()
  const todayS = now.toISOString().slice(0, 10)
  const weekS  = (() => { const d = new Date(now); d.setDate(d.getDate() - 7);  return d.toISOString().slice(0, 10) })()
  const monthS = (() => { const d = new Date(now); d.setDate(1);                return d.toISOString().slice(0, 10) })()
  const yearS  = `${now.getFullYear()}-01-01`

  const { data } = await supabase
    .from('crm_payments')
    .select('amount_mad, payment_date')
    .eq('payment_status', 'paid')
    .not('payment_date', 'is', null)

  let today = 0, week = 0, month = 0, year = 0, allTime = 0
  for (const r of data ?? []) {
    const amt = Number(r.amount_mad ?? 0)
    const d = (r.payment_date as string).slice(0, 10)
    allTime += amt
    if (d >= yearS)  year  += amt
    if (d >= monthS) month += amt
    if (d >= weekS)  week  += amt
    if (d === todayS) today += amt
  }
  return { today, week, month, year, allTime }
}

/** Revenue per month (last N months) — for the line chart. */
export async function fetchRevenueByMonth(months = 12): Promise<{ month: string; mad: number }[]> {
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - months + 1); cutoff.setDate(1)
  const { data } = await supabase
    .from('crm_payments')
    .select('amount_mad, payment_date')
    .eq('payment_status', 'paid')
    .gte('payment_date', cutoff.toISOString().slice(0, 10))
  const map = new Map<string, number>()
  // Seed all months with 0
  for (let i = 0; i < months; i++) {
    const d = new Date(cutoff); d.setMonth(d.getMonth() + i)
    map.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0)
  }
  for (const r of data ?? []) {
    const k = (r.payment_date as string).slice(0, 7)
    map.set(k, (map.get(k) ?? 0) + Number(r.amount_mad ?? 0))
  }
  return [...map.entries()].map(([month, mad]) => ({ month, mad }))
}

/* ─── Lead Timeline ─────────────────────────────────────────── */

export async function fetchLeadTimeline(leadId: string): Promise<LeadEvent[]> {
  const { data, error } = await supabase
    .from('crm_lead_events')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchLeadTimeline', error.message); return [] }
  return (data ?? []) as LeadEvent[]
}

export async function logLeadEvent(input: {
  leadId:    string
  eventType: string
  title:     string
  body?:     string
  before?:   unknown
  after?:    unknown
}): Promise<void> {
  const { error } = await supabase.rpc('log_lead_event', {
    p_lead_id:    input.leadId,
    p_event_type: input.eventType,
    p_title:      input.title,
    p_body:       input.body    ?? null,
    p_before:     input.before  ?? null,
    p_after:      input.after   ?? null,
  })
  if (error) console.error('logLeadEvent', error.message)
}

/* ─── Global search ─────────────────────────────────────────── */

export interface SearchResult {
  type:    'lead' | 'student'
  id:      string
  title:   string
  sub:     string
  status?: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const q = `%${query.trim()}%`
  const [leads, students] = await Promise.all([
    supabase
      .from('subscription_leads')
      .select('id, full_name, phone, status, source')
      .or(`full_name.ilike.${q},phone.ilike.${q},admin_note.ilike.${q},notes.ilike.${q}`)
      .limit(8),
    supabase
      .from('crm_students')
      .select('id, full_name, phone_number, course, student_type')
      .or(`full_name.ilike.${q},phone_number.ilike.${q},notes.ilike.${q}`)
      .limit(5),
  ])
  const results: SearchResult[] = [
    ...(leads.data ?? []).map(l => ({
      type:   'lead'    as const,
      id:     l.id,
      title:  l.full_name,
      sub:    [l.phone, l.source].filter(Boolean).join(' · '),
      status: l.status,
    })),
    ...(students.data ?? []).map(s => ({
      type:  'student' as const,
      id:    s.id,
      title: s.full_name,
      sub:   [s.phone_number, s.course, s.student_type === 'private_student' ? 'Private' : 'Course'].filter(Boolean).join(' · '),
    })),
  ]
  return results
}

/* ─── Assistant codes ──────────────────────────────────────── */

export interface AssistantCode {
  id:         string
  code:       string
  label:      string | null
  uses_left:  number | null
  used_count: number
  expires_at: string | null
  is_active:  boolean
  created_at: string
}

export async function fetchAssistantCodes(): Promise<AssistantCode[]> {
  const { data } = await supabase.from('assistant_codes').select('*').order('created_at', { ascending: false })
  return (data ?? []) as AssistantCode[]
}

export async function createAssistantCode(input: {
  label?:    string
  usesLeft?: number
  expiresAt?: string
}): Promise<string> {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase()
  const { data, error } = await supabase
    .from('assistant_codes')
    .insert({ code, label: input.label ?? null, uses_left: input.usesLeft ?? null, expires_at: input.expiresAt ?? null })
    .select('code')
    .single()
  if (error) throw new Error(error.message)
  return (data as { code: string }).code
}

export async function verifyAssistantCode(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('assistant_codes')
    .select('id, uses_left, used_count, expires_at, is_active')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .maybeSingle()
  if (!data) return false
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false
  if (data.uses_left !== null && data.used_count >= data.uses_left) return false
  // Increment use count
  await supabase.from('assistant_codes').update({ used_count: data.used_count + 1 }).eq('id', data.id)
  return true
}
