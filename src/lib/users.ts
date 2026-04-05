import { supabase } from './supabase'

export type User = {
  id: string
  email: string
  plan: 'free' | 'pro'
  xp: number
  streak: number
  created_at: string
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data as User
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as User
}

// Create a new user (called after signup)
export async function createUser(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert({ email })
    .select()
    .single()

  if (error) return null
  return data as User
}

// Add XP to a user and update streak
export async function addXP(id: string, amount: number): Promise<void> {
  const user = await getUserById(id)
  if (!user) return

  await supabase
    .from('users')
    .update({ xp: user.xp + amount })
    .eq('id', id)
}

// Increment a user's streak by 1
export async function incrementStreak(id: string): Promise<void> {
  const user = await getUserById(id)
  if (!user) return

  await supabase
    .from('users')
    .update({ streak: user.streak + 1 })
    .eq('id', id)
}

// Reset a user's streak to 0
export async function resetStreak(id: string): Promise<void> {
  await supabase
    .from('users')
    .update({ streak: 0 })
    .eq('id', id)
}

// Upgrade user to pro plan
export async function upgradeToPro(id: string): Promise<void> {
  await supabase
    .from('users')
    .update({ plan: 'pro' })
    .eq('id', id)
}
