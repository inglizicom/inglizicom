import { redirect } from 'next/navigation'

/** Renewals absorbed into Students → Expiring tab. */
export default function RenewalsPage() {
  redirect('/sales/students?tab=expiring')
}
