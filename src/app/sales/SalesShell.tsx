'use client'

import { useRouter } from 'next/navigation'
import SalesSidebar from './SalesSidebar'
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
    <div className="min-h-screen flex bg-white" dir="ltr">
      <SalesSidebar
        userEmail={staff.email}
        userRole={staff.role}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
