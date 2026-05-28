import AdminGuard from './AdminGuard'
import AdminShell from './AdminShell'

/**
 * /admin/* uses a left sidebar + page content layout (Hubspot/Pipedrive style).
 * AdminShell is a client component because the sidebar reads from <StaffContext>
 * and needs interactivity (mobile toggle, sign-out button).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  )
}
