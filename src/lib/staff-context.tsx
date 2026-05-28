'use client'

import { createContext, useContext } from 'react'

/** Shape of the currently-signed-in staff member.
 *  Used by both /sales/* (sales workspace) and /admin/* (founder command
 *  center). */
export interface StaffProfile {
  id:      string
  email:   string | null
  role:    'founder' | 'assistant' | 'student'
  /** Legacy is_admin flag — true for every founder, but pre-existing rows
   *  may have is_admin=true without role set. We accept either. */
  isAdmin: boolean
}

export const StaffContext = createContext<StaffProfile | null>(null)

export function useStaff(): StaffProfile {
  const v = useContext(StaffContext)
  if (!v) throw new Error('useStaff() must be used inside a StaffGuard provider')
  return v
}

export function useStaffOptional(): StaffProfile | null {
  return useContext(StaffContext)
}
