'use client'

import { useEffect } from 'react'
import { recordTouch } from '@/lib/first-touch'

/** Records where the visitor came from on page load (see lib/first-touch.ts). */
export default function TouchTracker() {
  useEffect(() => { recordTouch() }, [])
  return null
}
