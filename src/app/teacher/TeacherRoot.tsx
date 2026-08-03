'use client'

import { usePathname } from 'next/navigation'
import TeacherGuard from '@/components/TeacherGuard'
import TeacherShell from './TeacherShell'

/** Everything under the teaching space is gated except /teacher/login, which
 *  has to stay reachable while signed out — the guard redirects there. */
export default function TeacherRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  if (pathname.startsWith('/teacher/login')) return <>{children}</>

  return (
    <TeacherGuard>
      <TeacherShell>{children}</TeacherShell>
    </TeacherGuard>
  )
}
