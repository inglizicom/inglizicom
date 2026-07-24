'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, CalendarCheck, KanbanSquare, CreditCard, BellRing,
  LifeBuoy, Users, Menu, X, LogOut, Shield, ArrowUpRight, Plus, Wallet, Megaphone,
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import NotificationBell from './NotificationBell'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'

/**
 * Sales / CRM sidebar.
 *
 * When served at admin.inglizi.com (via middleware rewrite), all hrefs
 * use clean paths like /leads, /students, /payments — the /sales prefix
 * is dropped so the URL in the address bar stays clean.
 *
 * When served at inglizi.com/sales/*, hrefs keep the /sales prefix.
 */
interface NavItem {
  /** Path segment without any prefix, e.g. "" | "leads" | "students" */
  segment:  string
  label:    string
  icon:     LucideIcon
  badge?:   string | number
}

const navItems: NavItem[] = [
  { segment: '',         label: 'Dashboard', icon: LayoutDashboard },
  { segment: 'today',    label: 'Today',     icon: CalendarCheck },
  { segment: 'leads',    label: 'Leads',     icon: KanbanSquare },
  { segment: 'students', label: 'Students',  icon: Users },
  { segment: 'payments', label: 'Payments',  icon: CreditCard },
  { segment: 'revenue',  label: 'Revenue',   icon: Wallet },
  { segment: 'renewals', label: 'Renewals',  icon: BellRing },
  { segment: 'broadcast', label: 'Broadcast', icon: Megaphone },
  { segment: 'support',  label: 'Support',   icon: LifeBuoy },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function SalesSidebar({ userEmail, userRole, onSignOut }: Props) {
  const rawPathname  = usePathname() ?? '/'
  const base         = useCrmBasePath()           // '' | '/sales'
  const isAdmin      = useIsAdminDomain()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isFounder    = userRole === 'founder'

  /** Build the href for a given segment, using the correct base. */
  function href(segment: string): string {
    if (segment === '') return base || '/'
    return `${base}/${segment}`
  }

  /** Determine whether a segment is the current page.
   *  Works for both the main site (/sales/leads) and the admin domain
   *  where the rewritten internal path may be /sales/leads but the
   *  browser path is /leads. We normalise both to the segment. */
  function isActive(segment: string): boolean {
    // Normalise: strip /sales prefix so we compare plain segments
    const norm = rawPathname.replace(/^\/sales/, '') || '/'
    if (segment === '') return norm === '/' || norm === ''
    return norm.startsWith('/' + segment)
  }

  /** Admin-domain analytics / settings links map to different internal paths */
  const adminToolsHref = isAdmin ? '/analytics' : '/admin/analytics'

  return (
    <>
      {/* Mobile hamburger */}
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
          <Link href={href('')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base shadow-sm">
              I
            </div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">
                {isAdmin ? 'Admin CRM' : 'Sales'}
              </div>
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
          <GlobalSearch base={base} />
        </div>

        {/* Quick CTA */}
        <div className="px-3 pb-1">
          <Link
            href={`${href('leads')}?add=1`}
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
              const active = isActive(item.segment)
              return (
                <li key={item.segment}>
                  <Link
                    href={href(item.segment)}
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

          {/* Founder-only: Admin tools link */}
          {isFounder && (
            <div className="mt-6 px-3">
              <Link
                href={adminToolsHref}
                className="group flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-semibold text-zinc-500 hover:text-yellow-400 hover:bg-zinc-900 transition-colors border border-zinc-900"
              >
                <Shield size={13} />
                <span className="flex-1">Admin tools</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </nav>

        {/* Notification bell — full-width row so it's always visible */}
        <div className="px-3 pb-1 border-t border-zinc-900 pt-3">
          <NotificationBell basePath={base || '/sales'} />
        </div>

        {/* User card */}
        <div className="px-3 pb-3">
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
              href="https://inglizi.com"
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
