import { supabase } from './supabase'

export type StaffRole = 'founder' | 'assistant' | 'student'

export interface StaffRow {
  id:           string
  email:        string | null
  full_name:    string | null
  avatar_url:   string | null
  role:         StaffRole
  is_admin:     boolean
  created_at:   string
  /** Convenience — derived. */
  is_staff:     boolean
}

/** All staff (founders + assistants) — sorted with founders first. */
export async function fetchStaff(): Promise<StaffRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, is_admin, created_at')
    .in('role', ['founder', 'assistant'])
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) {
    console.error('fetchStaff', error.message)
    return []
  }
  return (data ?? []).map(row => ({
    ...row,
    role:     (row.role as StaffRole) ?? 'student',
    is_staff: row.role === 'founder' || row.role === 'assistant',
  } as StaffRow))
}

/** Search profiles by email to find someone to promote. Capped at 20. */
export async function searchProfiles(query: string): Promise<StaffRow[]> {
  if (!query.trim()) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, is_admin, created_at')
    .ilike('email', `%${query.trim()}%`)
    .limit(20)
  if (error) {
    console.error('searchProfiles', error.message)
    return []
  }
  return (data ?? []).map(row => ({
    ...row,
    role:     (row.role as StaffRole) ?? 'student',
    is_staff: row.role === 'founder' || row.role === 'assistant',
  } as StaffRow))
}

/** Set the role on a profile. Logging is done by the caller. */
export async function setProfileRole(id: string, role: StaffRole): Promise<void> {
  // is_admin is the legacy flag — we keep it in sync with founder for back-compat
  // (admin guard and existing pages still read is_admin).
  const patch: Record<string, unknown> = { role }
  if (role === 'founder')   patch.is_admin = true
  if (role === 'assistant') patch.is_admin = false
  if (role === 'student')   patch.is_admin = false
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Map role to a Tailwind badge style — used by Settings, Sidebar etc. */
export const ROLE_BADGE: Record<StaffRole, string> = {
  founder:   'bg-yellow-50 text-yellow-800 border-yellow-200',
  assistant: 'bg-blue-50 text-blue-700 border-blue-200',
  student:   'bg-gray-100 text-gray-600 border-gray-200',
}
