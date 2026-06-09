'use client'

import { openSubscribe } from '@/lib/lead-source'

interface Props {
  source:     string
  planId?:    string
  className?: string
  ariaLabel?: string
  title?:     string
  children:   React.ReactNode
}

/**
 * Opens the global SubscribeModal (which captures the lead in the CRM and then
 * hands off to WhatsApp). Use anywhere a raw wa.me link used to be, so every
 * contact point records a lead first.
 */
export default function SubscribeButton({ source, planId, className, ariaLabel, title, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => openSubscribe({ source, planId })}
      className={className}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  )
}
