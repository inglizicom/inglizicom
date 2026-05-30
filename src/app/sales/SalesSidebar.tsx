'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, CalendarCheck, KanbanSquare, CreditCard, BellRing,
  LifeBuoy, Users, Menu, X, LogOut, Shield, ArrowUpRight, Plus, Wallet,
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'

/**
 * Sales workspace sidebar — focused, assistant-friendly.
 *
 * Just the 7 things an assistant uses every day. No content / no system /
 * no audit log clutter. Founders get a small "Admin tools →" link at the
 * bottom that pops them over to /admin for content + analytics.
 */
interface NavItem {
  href:    string
  label:   string
  icon:    LucideIcon
  badge?:  string | number
}
const navItems: NavItem[] = [
  { href: '/sales',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales/today',    label: 'Today',     icon: CalendarCheck },
  { href: '/sales/leads',    label: 'Leads',     icon: KanbanSquare },
  { href: '/sales/students', label: 'Students',  icon: Users },
  { href: '/sales/payments', label: 'Payments',  icon: CreditCard },
  { href: '/sales/revenue',  label: 'Revenue',   icon: Wallet },
  { href: '/sales/renewals', label: 'Renewals',  icon: BellRing },
  { href: '/sales/support',  label: 'Support',   icon: LifeBuoy },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function SalesSidebar({ userEmail, userRole, onSignOut }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isFounder = userRole === 'founder'

  function isActive(href: string): boolean {
    if (href === '/sales') return pathname === '/sales'
    return pathname?.startsWith(href) ?? false
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-black text-white shadow-lg flex items-center justify-center"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-black text-white',
          'flex flex-col border-r border-zinc-900',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900">
          <Link href="/sales" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base shadow-sm">
              I
            </div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">Sales</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em]">Inglizi · workspace</div>
            </div>
          </Link>
          <button
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global search */}
        <div className="px-0 pt-3 pb-1">
          <GlobalSearch />
        </div>

        {/* Quick CTA */}
        <div className="px-3 pb-1">
          <Link
            href="/sales/leads?add=1"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-yellow-400 text-black font-bold text-[13px] shadow-sm hover:bg-yellow-300 transition-colors"
          >
            <Plus size={14} /> Add new lead
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map(item => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'group flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold transition-colors',
                      active
                        ? 'bg-yellow-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon
                      size={17}
                      className={active ? 'text-black' : 'text-zinc-500 group-hover:text-white'}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && (
                      <span className={[
                        'text-[10px] font-bold rounded px-1.5 py-0.5',
                        active ? 'bg-black text-yellow-400' : 'bg-zinc-800 text-zinc-400',
                      ].join(' ')}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Founder-only shortcut to the admin command center */}
          {isFounder && (
            <div className="mt-6 px-3">
              <Link
                href="/admin"
                className="group flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-semibold text-zinc-500 hover:text-yellow-400 hover:bg-zinc-900 transition-colors border border-zinc-900"
              >
                <Shield size={13} />
                <span className="flex-1">Admin tools</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </nav>

        {/* User card */}
        <div className="px-3 py-3 border-t border-zinc-900">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-400 font-black text-sm">
              {(userEmail?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-[12.5px] font-semibold text-white truncate" title={userEmail ?? undefined}>
                {userEmail ?? '—'}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                {userRole === 'founder' ? 'Founder' : userRole === 'assistant' ? 'Assistant' : 'Member'}
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <Link
              href="/"
              className="flex-1 text-center text-[11px] font-semibold py-2 rounded-md text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
            >
              ← Site
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[11px] font-semibold py-2 px-3 rounded-md text-zinc-400 border border-zinc-800 hover:text-red-400 hover:border-red-900 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
