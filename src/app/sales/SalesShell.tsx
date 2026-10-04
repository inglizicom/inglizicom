'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import CrmFrame from '@/components/crm/CrmFrame'
import { useStaff } from '@/lib/staff-context'
import { fetchOverdueFollowUps, fetchTodaysFollowUps } from '@/lib/crm-stats'
import { countPendingSubmissions } from '@/lib/lms'
import { countLeadsSince } from '@/lib/leads-db'
import { getLeadsSeenAt, LEADS_SEEN_EVENT } from '@/lib/leads-seen'

export default function SalesShell({ children }: { children: React.ReactNode }) {
  // The title reads ?tab=, and useSearchParams needs a Suspense boundary.
  return <Suspense fallback={null}><Shell>{children}</Shell></Suspense>
}

function Shell({ children }: { children: React.ReactNode }) {
  const staff = useStaff()
  const [badges, setBadges] = useState<{ leads?: number; followups?: number; submissions?: number }>({})

  useEffect(() => {
    let alive = true
    async function recompute() {
      const seenIso = new Date(getLeadsSeenAt()).toISOString()
      const [unseen, overdue, today, pendingSubs] = await Promise.all([
        countLeadsSince(seenIso),                   // unseen since last viewed (clears when read)
        fetchOverdueFollowUps(staff.role === 'founder' ? undefined : staff.id),
        fetchTodaysFollowUps(staff.role === 'founder' ? undefined : staff.id),
        countPendingSubmissions(),                  // conversations awaiting correction
      ])
      if (alive) setBadges({ leads: unseen, followups: overdue.length + today.length, submissions: pendingSubs })
    }
    recompute()
    const t = setInterval(recompute, 60_000)
    window.addEventListener(LEADS_SEEN_EVENT, recompute)
    return () => { alive = false; clearInterval(t); window.removeEventListener(LEADS_SEEN_EVENT, recompute) }
  }, [staff.id, staff.role])

  const { title, crumb } = useRouteTitle()

  return <CrmFrame title={title} breadcrumb={crumb} badges={badges}>{children}</CrmFrame>
}

/* Derives the page title + breadcrumb from the current route. */
function useRouteTitle(): { title: string; crumb: string[] } {
  const pathname = usePathname() ?? ''
  const tab      = useSearchParams().get('tab')
  const home     = 'لوحة التحكم'

  if (pathname.includes('/dashboard')) {
    return { title: home, crumb: [new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })] }
  }
  if (pathname.includes('/leads/new'))  return { title: 'إضافة عميل جديد', crumb: ['العملاء المحتملون', 'إضافة عميل جديد'] }
  if (/\/leads\/[^/]+$/.test(pathname)) return { title: 'ملف العميل', crumb: ['العملاء المحتملون', 'ملف العميل'] }
  if (/\/students\/[^/]+$/.test(pathname)) return { title: 'ملف الطالب', crumb: ['الطلاب', 'ملف الطالب'] }
  if (pathname.includes('/workspace')) {
    const title =
      tab === 'students'    ? 'الطلاب'
      : tab === 'payments'  ? 'المدفوعات'
      : tab === 'followups' ? 'المتابعات'
      : tab === 'archive'   ? 'الأرشيف'
      : 'العملاء المحتملون'
    return { title, crumb: [home, title] }
  }
  const SIMPLE: [string, string, string?][] = [
    ['/verify', 'التحقق من طالب'],
    ['/courses/audit', 'تدقيق التمارين', 'الدورات'],
    ['/courses', 'الدورات'],
    ['/templates', 'مسارات التعلّم'],
    ['/support', 'الدعم'],
    ['/submissions', 'تصحيح المحادثات'],
    ['/announcements', 'الإعلانات'],
    ['/gamification', 'المكافآت والتحديات'],
    ['/payments', 'المدفوعات'],
    ['/revenue', 'الإيرادات'],
    ['/renewals', 'التجديدات'],
    ['/broadcast', 'الرسائل الجماعية'],
    ['/notifications', 'الإشعارات'],
    ['/today', 'مهام اليوم'],
    ['/teachers/report', 'التقرير الشهري', 'الأساتذة'],
    ['/teachers', 'الأساتذة'],
  ]
  if (/\/classes\/[^/]+$/.test(pathname)) return { title: 'قسم مباشر', crumb: ['الأقسام المباشرة', 'تفاصيل القسم'] }
  if (pathname.includes('/classes')) return { title: 'الأقسام المباشرة', crumb: [home, 'الأقسام المباشرة'] }
  for (const [seg, title, parent] of SIMPLE) {
    if (pathname.includes(seg)) return { title, crumb: [parent ?? home, title] }
  }
  return { title: home, crumb: [] }
}
