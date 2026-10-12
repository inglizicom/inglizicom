'use client'

import { usePathname } from 'next/navigation'
import CrmFrame from '@/components/crm/CrmFrame'

const TITLES: [string, string][] = [
  ['/games',     'دفتر التمارين'],
  ['/vocab-book', 'PIIRMI · المفردات'],
  ['/level1-book', 'LA KAART · كتاب الطالب'],
  ['/bac-pack', 'حقيبة الباك'],
  ['/everyday-book', 'PIIRMI · كتاب الطالب'],
  ['/level2-book', 'VIIZA · كتاب الطالب'],
  ['/level2-workbook', 'VIIZA · التمارين'],
  ['/level1-cards', 'LA KAART · بطاقات اللعب'],
  ['/level1-vocab', 'LA KAART · المفردات'],
  ['/level2-vocab', 'VIIZA · المفردات'],
  ['/covers', 'الأغلفة'],
  ['/team',      'الفريق والرواتب'],
  ['/analytics', 'الإيرادات والتقارير'],
  ['/teachers',  'الأساتذة'],
  ['/settings',  'الإعدادات'],
  ['/command',   'مركز القيادة'],
  ['/activity',  'سجل النشاط'],
  ['/articles',  'المقالات'],
  ['/courses',   'مكتبة الدورات'],
  ['/lessons',   'الدروس'],
  ['/present',   'عروض الدروس'],
  ['/access',    'الصلاحيات'],
  ['/bootstrap', 'تهيئة النظام'],
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const title = TITLES.find(([seg]) => pathname.includes(seg))?.[1] ?? 'أدوات المؤسس'
  // The lesson presenter is a stage shown to students; it keeps its own colours.
  const raw = pathname.includes('/admin/present')

  return (
    <CrmFrame title={title} breadcrumb={['لوحة الإدارة', title]} raw={raw}>
      {children}
    </CrmFrame>
  )
}
