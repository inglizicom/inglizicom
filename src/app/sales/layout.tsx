import StaffGuard from '@/components/StaffGuard'
import SalesShell from './SalesShell'

/** /sales/* — the workspace.
 *  Allows founders AND assistants. Anyone else gets redirected to /login. */
export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffGuard mode="staff" loginNext="/sales">
      <SalesShell>{children}</SalesShell>
    </StaffGuard>
  )
}
