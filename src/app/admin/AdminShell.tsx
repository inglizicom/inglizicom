'use client'

import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { useStaff } from './StaffContext'
import { supabase } from '@/lib/supabase'

/** Wraps every /admin/* page with the persistent left sidebar.
 *  Reads the staff profile from StaffContext (populated by AdminGuard). */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const staff  = useStaff()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex bg-white" dir="ltr">
      <Sidebar
        userEmail={staff.email}
        userRole={staff.role}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 min-w-0 lg:pl-0">
        {children}
      </main>
    </div>
  )
}
