'use client'

import { Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CrmSidebar from '@/components/CrmSidebar'
import CrmTopHeader from '@/components/CrmTopHeader'
import CrmErrorBoundary from '@/components/CrmErrorBoundary'
import { useStaff } from '@/lib/staff-context'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'
import { supabase } from '@/lib/supabase'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const staff         = useStaff()
  const router        = useRouter()
  const base          = useCrmBasePath()
  const isAdminDomain = useIsAdminDomain()
  const pathname      = usePathname() ?? ''

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const title =
    pathname.includes('/analytics') ? 'الإيرادات والتقارير'
    : pathname.includes('/settings')  ? 'الإعدادات'
    : 'لوحة الإدارة'

  return (
    <div className="min-h-screen flex bg-[#f6f6f5]" dir="rtl">
      <Suspense fallback={<div className="hidden lg:block w-64 bg-[#14161c] flex-shrink-0" />}>
        <CrmSidebar
          userEmail={staff.email}
          userRole={staff.role}
          onSignOut={handleSignOut}
          base={base}
          isAdminDomain={isAdminDomain}
        />
      </Suspense>

      <div className="flex-1 min-w-0 flex flex-col">
        <CrmTopHeader title={title} breadcrumb={['لوحة التحكم', title]} userEmail={staff.email} roleLabel="المؤسس" base={base} onSignOut={handleSignOut} />
        <main className="flex-1 min-w-0"><CrmErrorBoundary>{children}</CrmErrorBoundary></main>
      </div>
    </div>
  )
}
