'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type FeatureAccess = {
  slug:          string
  label_ar:      string
  category:      string
  requires_auth: boolean
  requires_paid: boolean
  sort_order:    number
}

type Ctx = {
  features: Record<string, FeatureAccess>
  loading:  boolean
  refresh:  () => Promise<void>
}

const Ctx = createContext<Ctx | null>(null)

export function FeatureAccessProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Record<string, FeatureAccess>>({})
  const [loading, setLoading]   = useState(true)

  async function load() {
    const { data } = await supabase
      .from('feature_access')
      .select('slug, label_ar, category, requires_auth, requires_paid, sort_order')
    const map: Record<string, FeatureAccess> = {}
    for (const row of (data ?? []) as FeatureAccess[]) map[row.slug] = row
    setFeatures(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <Ctx.Provider value={{ features, loading, refresh: load }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFeatureAccess() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFeatureAccess must be used inside <FeatureAccessProvider>')
  return ctx
}

/** Quick check: is this feature locked for the given user state? */
export function checkLock(
  feature: FeatureAccess | undefined,
  state: { isAuthenticated: boolean; isPaid?: boolean },
): 'free' | 'auth-required' | 'paid-required' {
  if (!feature) return 'free'
  if (feature.requires_paid && !state.isPaid) return 'paid-required'
  if (feature.requires_auth && !state.isAuthenticated) return 'auth-required'
  return 'free'
}
