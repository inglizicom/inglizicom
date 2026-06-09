'use client'

import { useRouter } from 'next/navigation'
import CrmSidebar from '@/components/CrmSidebar'
import { useStaff } from '@/lib/staff-context'
import { supabase } from '@/lib/supabase'

export default function SalesShell({ children }: { children: React.ReactNode }) {
  const staff  = useStaff()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    /* Outer shell: LTR so sidebar stays on left. Main content uses RTL per-page via dir="rtl". */
    <div className="min-h-screen flex bg-[#f8f8f7]" dir="ltr">
      <CrmSidebar userEmail={staff.email} userRole={staff.role} onSignOut={handleSignOut} />
      {/* Main content: full height, scrollable, RTL for Arabic interface */}
      <main className="flex-1 min-w-0 min-h-screen" dir="rtl">
        {children}
      </main>
    </div>
  )
}
