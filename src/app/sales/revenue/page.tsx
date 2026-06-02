import { redirect } from 'next/navigation'

/** Revenue moved into Analytics (founder section). */
export default function RevenuePage() {
  redirect('/admin/analytics')
}
