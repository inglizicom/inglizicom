'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, CreditCard,
  BarChart3, Settings, LogOut, X, Menu, Headphones, ShieldCheck, Route,
} from 'lucide-react'

interface NavDef {
  id:        string
  labelAr:   string
  icon:      LucideIcon
  path:      string          // pathname part (without base)
  tab?:      string          // optional ?tab= value
  badgeKey?: 'leads' | 'followups'
  founder?:  boolean
}

const NAV: NavDef[] = [
  { id: 'dashboard', labelAr: 'لوحة التحكم',        icon: LayoutDashboard, path: '/dashboard' },
  { id: 'leads',     labelAr: 'العملاء المحتملون',   icon: Users,           path: '/workspace', badgeKey: 'leads' },
  { id: 'students',  labelAr: 'الطلاب',             icon: GraduationCap,   path: '/workspace', tab: 'students' },
  { id: 'followups', labelAr: 'المتابعات',           icon: CalendarCheck,   path: '/workspace', tab: 'followups', badgeKey: 'followups' },
  { id: 'payments',  labelAr: 'المدفوعات',          icon: CreditCard,      path: '/workspace', tab: 'payments' },
  { id: 'verify',    labelAr: 'التحقق من طالب',      icon: ShieldCheck,     path: '/verify' },
  { id: 'templates', labelAr: 'مسارات التعلّم',       icon: Route,           path: '/templates' },
  { id: 'revenue',   labelAr: 'الإيرادات والتقارير', icon: BarChart3,       path: '/analytics', founder: true },
  { id: 'settings',  labelAr: 'الإعدادات',          icon: Settings,        path: '/settings',  founder: true },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
  base:       string                      // '' on admin domain, '/sales' on main
  isAdminDomain: boolean
  badges?:    { leads?: number; followups?: number }
}

export default function CrmSidebar({ userEmail, userRole, onSignOut, base, isAdminDomain, badges }: Props) {
  const pathname = usePathname() ?? '/'
  const sp       = useSearchParams()
  const tab      = sp.get('tab')
  const [open, setOpen] = useState(false)
  const isFounder = userRole === 'founder'

  /* Build href for a nav item */
  function hrefFor(item: NavDef): string {
    // Founder admin pages live under /admin on the main site, root on admin domain
    if (item.founder) return isAdminDomain ? item.path : `/admin${item.path}`
    const p = `${base}${item.path}`
    return item.tab ? `${p}?tab=${item.tab}` : p
  }

  /* Active detection */
  function isActive(item: NavDef): boolean {
    const onPath = pathname.includes(item.path)
    if (!onPath) return false
    if (item.path === '/workspace') {
      // distinguish workspace tabs
      if (item.tab) return tab === item.tab
      return !tab || tab === 'leads'  // leads = default
    }
    return true
  }

  const visibleNav = NAV.filter(n => !n.founder || isFounder)

  /* ── Nav list (shared desktop + mobile) ─────────────────── */
  const navList = (
    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
      {visibleNav.map(item => {
        const active = isActive(item)
        const badge  = item.badgeKey ? badges?.[item.badgeKey] : undefined
        return (
          <Link
            key={item.id}
            href={hrefFor(item)}
            onClick={() => setOpen(false)}
            className={[
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-colors',
              active ? 'bg-white/[0.06] text-yellow-400' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
            ].join(' ')}
          >
            {active && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-yellow-400" />}
            <item.icon size={18} className={active ? 'text-yellow-400' : 'text-zinc-500'} strokeWidth={2.1} />
            <span className="flex-1">{item.labelAr}</span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  /* ── Brand + support + user (shared) ────────────────────── */
  const brand = (
    <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0">
      <BrandMark />
      <span className="font-black text-[17px] tracking-wide text-white">INGLIZI</span>
    </div>
  )

  const footer = (
    <div className="px-3 pb-4 space-y-3 flex-shrink-0">
      {/* Support card */}
      <div className="bg-white/[0.04] rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
          <Headphones size={16} className="text-zinc-300" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[12px] font-bold text-white">تحتاج مساعدة؟</div>
          <div className="text-[11px] text-zinc-500">تواصل مع الدعم</div>
        </div>
      </div>

      {/* User + logout */}
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-yellow-400 font-black text-xs flex-shrink-0">
          {(userEmail?.[0] ?? '?').toUpperCase()}
        </div>
        <div className="flex-1 leading-tight min-w-0">
          <div className="text-[12px] font-semibold text-white truncate">{userEmail ?? '—'}</div>
          <div className="text-[10px] text-zinc-500">{isFounder ? 'المؤسس' : 'مساعد'}</div>
        </div>
        {onSignOut && (
          <button onClick={onSignOut} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/[0.04]" aria-label="تسجيل الخروج">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 right-3 z-40 w-10 h-10 rounded-xl bg-[#14161c] text-white flex items-center justify-center shadow-lg"
        aria-label="القائمة"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar — RIGHT side */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-64 bg-[#14161c] flex-shrink-0">
        {brand}
        {navList}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}
      <aside className={[
        'lg:hidden fixed inset-y-0 right-0 z-50 w-72 bg-[#14161c] flex flex-col',
        'transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}>
        <div className="flex items-center justify-between pl-3">
          {brand}
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-2">
            <X size={20} />
          </button>
        </div>
        {navList}
        {footer}
      </aside>
    </>
  )
}

/* ── Colorful hexagon dot mark (INGLIZI logo) ──────────────── */
function BrandMark() {
  return (
    <div className="w-8 h-8 flex-shrink-0 grid grid-cols-3 gap-[2px] place-items-center">
      {[
        '#f59e0b', '#3b82f6', '#10b981',
        '#3b82f6', '#f43f5e', '#f59e0b',
        '#10b981', '#f59e0b', '#3b82f6',
      ].map((c, i) => (
        <span key={i} className="w-[6px] h-[6px] rounded-full" style={{ background: c }} />
      ))}
    </div>
  )
}
