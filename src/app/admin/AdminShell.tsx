'use client'

import { usePathname } from 'next/navigation'
import CrmFrame from '@/components/crm/CrmFrame'

const TITLES: [string, string][] = [
  ['/games',     'دفتر التمارين'],
  ['/vocab-book', 'كتاب المفردات'],
  ['/level1-book', 'كتاب المستوى الأول'],
  ['/bac-pack', 'حقيبة الباك'],
  ['/everyday-book', 'الكتاب الأساسي'],
  ['/level2-book', 'المستوى الثاني'],
  ['/level2-workbook', 'دفتر تمارين المستوى الثاني'],
  ['/level1-cards', 'بطاقات اللعب'],
  ['/level1-vocab', 'كتاب المفردات — المستوى الأول'],
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
