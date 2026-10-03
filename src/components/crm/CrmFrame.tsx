'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { staffPing } from '@/lib/founder'
import CrmSidebar, { type CrmBadges } from '@/components/CrmSidebar'
import CrmTopHeader from '@/components/CrmTopHeader'
import MobileBottomNav from '@/components/MobileBottomNav'
import CrmErrorBoundary from '@/components/CrmErrorBoundary'
import { useStaff } from '@/lib/staff-context'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'
import { supabase } from '@/lib/supabase'

/**
 * The frame every CRM screen sits in — /sales and /admin alike.
 *
 * `crm-theme` restates the zinc / gray / stone / yellow / black palettes the
 * screens were written in as the brand (see tailwind.config.js), so pages pick
 * up the navy-and-gold look without being rewritten. `raw` opts a page out —
 * the lesson presenter keeps its own stage colours.
 *
 * It also reports last-seen (staff_ping) so the founder sees who is working,
 * and the database opens a 'session_started' row after 30 minutes away.
 */
export default function CrmFrame({ title, breadcrumb, badges, raw, children }: {
  title: string
  breadcrumb: string[]
  badges?: CrmBadges
  raw?: boolean
  children: React.ReactNode
}) {
  const staff         = useStaff()
  const router        = useRouter()
  const base          = useCrmBasePath()
  const isAdminDomain = useIsAdminDomain()
  const [drawer, setDrawer] = useState(false)
  const pathname = usePathname() ?? ''

  // Last-seen for the founder's team page: on each new page, at most once a
  // minute, and every five minutes while the CRM stays open.
  const lastPing = useRef(0)
  useEffect(() => {
    const ping = () => { lastPing.current = Date.now(); staffPing(window.location.pathname) }
    if (Date.now() - lastPing.current > 60_000) ping()
    const t = setInterval(ping, 5 * 60_000)
    return () => clearInterval(t)
  }, [pathname])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const roleLabel = staff.role === 'founder' ? 'المؤسس' : 'مسؤول العملاء'

  return (
    <div dir="rtl" className="crm-theme min-h-screen overflow-x-clip bg-[#F1F5FB] text-[#1E3A8A] antialiased lg:flex">
      <Suspense fallback={<div className="hidden lg:block w-[264px] shrink-0 bg-white border-l border-[#E2E8F0]" />}>
        <CrmSidebar
          userEmail={staff.email}
          userRole={staff.role}
          onSignOut={signOut}
          base={base}
          isAdminDomain={isAdminDomain}
          badges={badges}
          open={drawer}
          onClose={() => setDrawer(false)}
        />
      </Suspense>

      <div className="flex-1 min-w-0 flex flex-col">
        <CrmTopHeader title={title} breadcrumb={breadcrumb} userEmail={staff.email} roleLabel={roleLabel}
                      base={base} onSignOut={signOut} onMenu={() => setDrawer(true)} />
        <main className={`flex-1 min-w-0 pb-24 lg:pb-0 ${raw ? 'crm-raw' : ''}`}>
          <CrmErrorBoundary>{children}</CrmErrorBoundary>
        </main>
      </div>

      <Suspense fallback={null}>
        <MobileBottomNav base={base} badges={badges} onMore={() => setDrawer(true)} />
      </Suspense>
    </div>
  )
}
