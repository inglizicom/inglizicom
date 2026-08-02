'use client'

import { usePathname } from 'next/navigation'
import TeacherGuard from '@/components/TeacherGuard'
import TeacherShell from './TeacherShell'

/** teacher.inglizi.com — the teaching space.
 *
 *  Everything is gated except /teacher/login, which has to stay reachable while
 *  signed out (the guard redirects here). */
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isLogin  = pathname.startsWith('/teacher/login')

  if (isLogin) return <>{children}</>

  return (
    <TeacherGuard>
      <TeacherShell>{children}</TeacherShell>
    </TeacherGuard>
  )
}
