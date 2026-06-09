'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Users, GraduationCap, CalendarCheck, CreditCard } from 'lucide-react'

interface Item { label: string; icon: LucideIcon; path: string; tab?: string; badgeKey?: 'followups' }

const ITEMS: Item[] = [
  { label: 'الرئيسية',  icon: LayoutDashboard, path: '/dashboard' },
  { label: 'العملاء',   icon: Users,           path: '/workspace' },
  { label: 'الطلاب',    icon: GraduationCap,   path: '/workspace', tab: 'students' },
  { label: 'المتابعات', icon: CalendarCheck,   path: '/workspace', tab: 'followups', badgeKey: 'followups' },
  { label: 'المدفوعات', icon: CreditCard,      path: '/workspace', tab: 'payments' },
]

export default function MobileBottomNav({ base, badges }: { base: string; badges?: { followups?: number } }) {
  const pathname = usePathname() ?? ''
  const tab      = useSearchParams().get('tab')

  function active(it: Item) {
    if (!pathname.includes(it.path)) return false
    if (it.path === '/workspace') {
      if (it.tab) return tab === it.tab
      return !tab || tab === 'leads'
    }
    return true
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-zinc-200 flex items-stretch h-16 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(it => {
        const on = active(it)
        const href = `${base}${it.path}${it.tab ? `?tab=${it.tab}` : ''}`
        const badge = it.badgeKey ? badges?.[it.badgeKey] : undefined
        return (
          <Link key={it.label} href={href}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 ${on ? 'text-zinc-900' : 'text-zinc-400'}`}>
            <div className="relative">
              <it.icon size={21} strokeWidth={on ? 2.4 : 2} className={on ? 'text-yellow-500' : ''} />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1.5 -left-2 bg-rose-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">{badge}</span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{it.label}</span>
            {on && <span className="absolute top-0 inset-x-4 h-0.5 bg-yellow-400 rounded-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
