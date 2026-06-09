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
    /* dir="rtl" on the root → sidebar goes to the RIGHT, content fills the LEFT.
       This is the correct Arabic layout used by Odoo, HubSpot AR, etc. */
    <div className="min-h-screen flex bg-[#f8f8f7]" dir="rtl">
      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        {children}
      </main>
      <CrmSidebar userEmail={staff.email} userRole={staff.role} onSignOut={handleSignOut} />
    </div>
  )
}
