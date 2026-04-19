import { supabase } from './supabase'

export interface UserProfile {
  id:              string
  email:           string | null
  full_name:       string | null
  avatar_url:      string | null
  is_admin:        boolean
  plan:            'free' | 'paid'
  plan_expires_at: string | null
  plan_note:       string | null
  blocked:         boolean
  created_at:      string
  updated_at:      string
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchAllUsers', error.message)
    return []
  }
  return (data ?? []) as UserProfile[]
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<UserProfile,
    'is_admin' | 'plan' | 'plan_expires_at' | 'plan_note' | 'blocked'
  >>,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as UserProfile
}
