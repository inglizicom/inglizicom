'use client'

import { useEffect, useState } from 'react'
import SubscribeModal from '@/components/SubscribeModal'
import { SUBSCRIBE_EVENT, type OpenSubscribeDetail } from '@/lib/lead-source'
import { PLANS } from '@/data/plans'

/**
 * Global listener for the SUBSCRIBE_EVENT. Mounted once in the public
 * layout — any button anywhere calls openSubscribe({ source, ... })
 * and this host renders the modal with the right plan context.
 */
export default function SubscribeHost() {
  const [state, setState] = useState<OpenSubscribeDetail | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<OpenSubscribeDetail>).detail
      setState(detail)
    }
    window.addEventListener(SUBSCRIBE_EVENT, handler)
    return () => window.removeEventListener(SUBSCRIBE_EVENT, handler)
  }, [])

  const plan = state?.planId ? PLANS.find(p => p.id === state.planId) : undefined

  return (
    <SubscribeModal
      open={state !== null}
      onClose={() => setState(null)}
      plan={plan}
      source={state?.source}
      recommendedPlan={state?.recommendedPlan}
      testScore={state?.testScore}
      defaultLevel={state?.defaultLevel}
      defaultGoal={state?.defaultGoal}
    />
  )
}
