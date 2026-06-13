/**
 * Owner Command Center data layer (founder-only).
 * Every fetcher calls a SECURITY DEFINER RPC that is gated by is_founder(auth.uid())
 * server-side — so even if a non-founder reached these, they get null/empty.
 * Revenue everywhere = single source of truth: paid crm_payments, amount > 0, not excluded.
 */
import { supabase } from './supabase'

export interface OwnerOverview {
  rev_today: number; rev_week: number; rev_month: number; rev_year: number; rev_total: number
  paying_students: number; arpu: number
  new_leads_today: number; new_students_today: number
  total_leads: number; total_students: number
  active_students: number; inactive_students: number; at_risk: number
  conversion_rate: number
  enroll: Record<string, number>
  rewards: { coins_distributed: number; coins_spent: number; claims_total: number; claims_pending: number }
  top_course: { title: string; students: number } | null
  worst_course: { title: string; students: number } | null
}

export interface TeamMember {
  id: string; name: string
  leads_handled: number; confirmed: number; students_added: number
  paid_students: number; revenue: number; followups_overdue: number
}

export interface StudentIntel {
  inactive_3: number; inactive_7: number; inactive_14: number; inactive_30: number
  at_risk_list: { id: string; name: string; token: string | null; days: number; risk: 'low' | 'medium' | 'high' }[]
  top_coins: { id: string; name: string; coins: number }[]
  top_streak: { id: string; name: string; streak: number }[]
  most_active: { id: string; name: string; days: number }[]
}

export interface CourseStat { id: string; title: string; students: number; lessons: number; active_14d: number }
export interface OwnerAlert { level: 'info' | 'warn' | 'danger'; text: string }
export interface RevenuePoint { month: string; mad: number }

export async function fetchOwnerOverview(): Promise<OwnerOverview | null> {
  const { data, error } = await supabase.rpc('owner_overview')
  if (error) { console.error('owner_overview', error.message); return null }
  return data as OwnerOverview | null
}
export async function fetchOwnerRevenueTrend(): Promise<RevenuePoint[]> {
  const { data, error } = await supabase.rpc('owner_revenue_trend')
  if (error) { console.error('owner_revenue_trend', error.message); return [] }
  return (data ?? []) as RevenuePoint[]
}
export async function fetchOwnerTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase.rpc('owner_team')
  if (error) { console.error('owner_team', error.message); return [] }
  return (data ?? []) as TeamMember[]
}
export async function fetchOwnerStudents(): Promise<StudentIntel | null> {
  const { data, error } = await supabase.rpc('owner_students')
  if (error) { console.error('owner_students', error.message); return null }
  return data as StudentIntel | null
}
export async function fetchOwnerCourses(): Promise<CourseStat[]> {
  const { data, error } = await supabase.rpc('owner_courses')
  if (error) { console.error('owner_courses', error.message); return [] }
  return (data ?? []) as CourseStat[]
}
export async function fetchOwnerAlerts(): Promise<OwnerAlert[]> {
  const { data, error } = await supabase.rpc('owner_alerts')
  if (error) { console.error('owner_alerts', error.message); return [] }
  return (data ?? []) as OwnerAlert[]
}
