import StaffGuard from '@/components/StaffGuard'
import AdminShell from './AdminShell'

/**
 * /admin/* — the founder command center.
 * Restricted to role='founder'. Assistants are auto-redirected to /sales by
 * the guard (no scary "Access denied" screen for daily users).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffGuard mode="founder" loginNext="/admin">
      <AdminShell>{children}</AdminShell>
    </StaffGuard>
  )
}
