'use client'

import { useRouter } from 'next/navigation'
import CrmSidebar from '@/components/CrmSidebar'
import { useStaff } from '@/lib/staff-context'
import { supabase } from '@/lib/supabase'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const staff  = useStaff()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex bg-white" dir="ltr">
      <CrmSidebar userEmail={staff.email} userRole={staff.role} onSignOut={handleSignOut} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
