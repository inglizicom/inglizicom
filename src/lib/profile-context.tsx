'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export interface Profile {
  id:              string
  email:           string | null
  full_name:       string | null
  avatar_url:      string | null
  is_admin:        boolean
  plan:            'free' | 'paid'
  plan_expires_at: string | null
  plan_note:       string | null
  blocked:         boolean
}

export interface PlanStatus {
  isPaid:          boolean
  isExpired:       boolean
  expiresInDays:   number | null
  expiresSoon:     boolean  // <= 7 days left and still active
}

type ProfileCtx = {
  profile:    Profile | null
  status:     PlanStatus
  loading:    boolean
  refresh:    () => Promise<void>
}

const defaultStatus: PlanStatus = {
  isPaid:        false,
  isExpired:     false,
  expiresInDays: null,
  expiresSoon:   false,
}

const Ctx = createContext<ProfileCtx>({
  profile: null,
  status:  defaultStatus,
  loading: true,
  refresh: async () => {},
})

function computeStatus(profile: Profile | null): PlanStatus {
  if (!profile) return defaultStatus
  const expiry = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / msPerDay) : null
  const active = profile.plan === 'paid' && expiry !== null && expiry > now

  return {
    isPaid:        active,
    isExpired:     profile.plan === 'paid' && expiry !== null && expiry <= now,
    expiresInDays: daysLeft,
    expiresSoon:   active && daysLeft !== null && daysLeft <= 7,
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_admin, plan, plan_expires_at, plan_note, blocked')
      .eq('id', user.id)
      .maybeSingle()
    setProfile((data as Profile | null) ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    setLoading(true)
    load()
  }, [authLoading, load])

  return (
    <Ctx.Provider value={{
      profile,
      status: computeStatus(profile),
      loading,
      refresh: load,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useProfile() {
  return useContext(Ctx)
}
