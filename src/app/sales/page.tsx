import { redirect } from 'next/navigation'

/** Redirect root /sales to the dashboard home. */
export default function SalesDashboardPage() {
  redirect('/sales/dashboard')
}
