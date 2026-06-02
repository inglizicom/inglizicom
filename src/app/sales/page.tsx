import { redirect } from 'next/navigation'

/** Dashboard route absorbed into Today — single home base for all roles. */
export default function SalesDashboardPage() {
  redirect('/sales/today')
}
