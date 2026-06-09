'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import CrmSidebar from '@/components/CrmSidebar'
import CrmTopHeader from '@/components/CrmTopHeader'
import { useStaff } from '@/lib/staff-context'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'
import { supabase } from '@/lib/supabase'
import { fetchLeadCountsByStatus, fetchOverdueFollowUps, fetchTodaysFollowUps } from '@/lib/crm-stats'

export default function SalesShell({ children }: { children: React.ReactNode }) {
  const staff         = useStaff()
  const router        = useRouter()
  const base          = useCrmBasePath()
  const isAdminDomain = useIsAdminDomain()
  const [badges, setBadges] = useState<{ leads?: number; followups?: number }>({})

  useEffect(() => {
    (async () => {
      const [counts, overdue, today] = await Promise.all([
        fetchLeadCountsByStatus(),
        fetchOverdueFollowUps(staff.role === 'founder' ? undefined : staff.id),
        fetchTodaysFollowUps(staff.role === 'founder' ? undefined : staff.id),
      ])
      setBadges({
        leads:     counts.new ?? 0,
        followups: overdue.length + today.length,
      })
    })()
  }, [staff.id, staff.role])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const roleLabel = staff.role === 'founder' ? 'المؤسس' : 'مسؤول العملاء'

  return (
    <div className="min-h-screen flex bg-[#f6f6f5]" dir="rtl">
      <Suspense fallback={<div className="hidden lg:block w-64 bg-[#14161c] flex-shrink-0" />}>
        <CrmSidebar
          userEmail={staff.email}
          userRole={staff.role}
          onSignOut={handleSignOut}
          base={base}
          isAdminDomain={isAdminDomain}
          badges={badges}
        />
      </Suspense>

      <div className="flex-1 min-w-0 flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-zinc-200/80" />}>
          <HeaderForRoute userEmail={staff.email} roleLabel={roleLabel} notifCount={badges.followups} />
        </Suspense>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

/* Derives the page title + breadcrumb from the current route. */
function HeaderForRoute({ userEmail, roleLabel, notifCount }: {
  userEmail?: string | null
  roleLabel:  string
  notifCount?: number
}) {
  const pathname = usePathname() ?? ''
  const tab      = useSearchParams().get('tab')

  let title = 'لوحة التحكم'
  let crumb: string[] = []

  if (pathname.includes('/dashboard')) {
    const name = userEmail?.split('@')[0] ?? ''
    title = `مرحباً ${name} 👋`
    crumb = [new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })]
  } else if (pathname.includes('/workspace')) {
    title =
      tab === 'students'  ? 'الطلاب'
      : tab === 'payments'  ? 'المدفوعات'
      : tab === 'followups' ? 'المتابعات'
      : tab === 'archive'   ? 'الأرشيف'
      : 'العملاء المحتملون'
    crumb = ['لوحة التحكم', title]
  } else if (pathname.includes('/support')) {
    title = 'الدعم'
    crumb = ['لوحة التحكم', 'الدعم']
  }

  return <CrmTopHeader title={title} breadcrumb={crumb} userEmail={userEmail} roleLabel={roleLabel} notifCount={notifCount} />
}
