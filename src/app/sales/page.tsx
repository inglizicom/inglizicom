import { redirect } from 'next/navigation'

/** Redirect root /sales to the unified workspace hub. */
export default function SalesDashboardPage() {
  redirect('/sales/workspace')
}
