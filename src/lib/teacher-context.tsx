'use client'

import { createContext, useContext } from 'react'
import type { TeacherProfile } from './teachers'

/** The signed-in teacher, resolved once by TeacherGuard and shared with every
 *  page under /teacher/*. A founder previewing the space also lands here. */
export interface TeacherSession {
  id:        string
  email:     string | null
  fullName:  string | null
  profile:   TeacherProfile | null
  /** True when a founder is looking at the space rather than a real teacher. */
  isPreview: boolean
  refresh:   () => Promise<void>
}

export const TeacherContext = createContext<TeacherSession | null>(null)

export function useTeacher(): TeacherSession {
  const v = useContext(TeacherContext)
  if (!v) throw new Error('useTeacher() must be used inside a TeacherGuard provider')
  return v
}
