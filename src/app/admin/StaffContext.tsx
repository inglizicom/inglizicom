'use client'

import { createContext, useContext } from 'react'

/** Shape of the currently-signed-in CRM staff member. */
export interface StaffProfile {
  id:       string
  email:    string | null
  role:     'founder' | 'assistant' | 'student'
  /** Legacy is_admin flag — true for every founder, but pre-existing rows may
   *  have is_admin=true without role set. We accept either. */
  isAdmin:  boolean
}

export const StaffContext = createContext<StaffProfile | null>(null)

/** Read the current staff profile in any client component nested under
 *  /admin/*. Throws if used outside the admin tree. */
export function useStaff(): StaffProfile {
  const v = useContext(StaffContext)
  if (!v) throw new Error('useStaff() must be used inside <AdminGuard>')
  return v
}

/** Lighter variant that returns null if not yet loaded — handy for views
 *  rendered server-side where the context may not be populated. */
export function useStaffOptional(): StaffProfile | null {
  return useContext(StaffContext)
}
