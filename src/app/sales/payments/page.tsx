import { redirect } from 'next/navigation'

export default function PaymentsPage() {
  redirect('/sales/workspace?tab=payments')
}
