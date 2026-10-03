'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Users, GraduationCap, Presentation, UserCog, MoreHorizontal } from 'lucide-react'

/**
 * The phone tab bar: the places staff go all day — leads, students, live
 * classes and teachers (058) — and "المزيد" for the rest, follow-ups included
 * with their badge (it opens the same drawer as the header's menu button).
 */
interface Item { label: string; icon: LucideIcon; path: string; tab?: string; badgeKey?: 'leads' | 'followups' }

const ITEMS: Item[] = [
  { label: 'الرئيسية',  icon: LayoutDashboard, path: '/dashboard' },
  { label: 'العملاء',   icon: Users,           path: '/workspace', badgeKey: 'leads' },
  { label: 'الطلاب',    icon: GraduationCap,   path: '/workspace', tab: 'students' },
  { label: 'الأقسام',   icon: Presentation,    path: '/classes' },
  { label: 'الأساتذة',  icon: UserCog,         path: '/teachers' },
]

export default function MobileBottomNav({ base, badges, onMore }: {
  base: string
  badges?: { leads?: number; followups?: number }
  onMore: () => void
}) {
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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-6">
        {ITEMS.map(it => {
          const on    = active(it)
          const href  = `${base}${it.path}${it.tab ? `?tab=${it.tab}` : ''}`
          const badge = it.badgeKey ? badges?.[it.badgeKey] : undefined
          return (
            <Link key={it.label} href={href}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold whitespace-nowrap transition-colors ${on ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}>
              {on && <span className="absolute top-0 inset-x-5 h-[3px] rounded-b-full bg-amber-400" />}
              <span className="relative">
                <it.icon size={20} strokeWidth={on ? 2.4 : 2} className={on ? 'text-blue-600' : ''} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -left-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              {it.label}
            </Link>
          )
        })}
        <button onClick={onMore}
                className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-[#94A3B8]">
          <span className="relative">
            <MoreHorizontal size={20} />
            {!!badges?.followups && (
              <span className="absolute -top-1.5 -left-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white"
                    title="متابعات اليوم والمتأخرة">
                {badges.followups > 99 ? '99+' : badges.followups}
              </span>
            )}
          </span>
          المزيد
        </button>
      </div>
    </nav>
  )
}
