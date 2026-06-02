'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarCheck, KanbanSquare, Users, CreditCard, LifeBuoy,
  BarChart3, Settings, Menu, X, LogOut, Plus,
} from 'lucide-react'
import GlobalSearch from '@/app/sales/GlobalSearch'
import NotificationBell from '@/app/sales/NotificationBell'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'

interface NavItem { segment: string; label: string; icon: LucideIcon }

/** Workspace nav — visible to all staff (founder + assistant). */
const WORKSPACE: NavItem[] = [
  { segment: 'today',    label: 'Today',    icon: CalendarCheck },
  { segment: 'leads',    label: 'Leads',    icon: KanbanSquare  },
  { segment: 'students', label: 'Students', icon: Users         },
  { segment: 'payments', label: 'Payments', icon: CreditCard    },
  { segment: 'support',  label: 'Support',  icon: LifeBuoy      },
]

/** Founder-only nav — these live under /admin/* internally. */
const FOUNDER: { adminSegment: string; label: string; icon: LucideIcon }[] = [
  { adminSegment: 'analytics', label: 'Analytics', icon: BarChart3 },
  { adminSegment: 'settings',  label: 'Settings',  icon: Settings  },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function CrmSidebar({ userEmail, userRole, onSignOut }: Props) {
  const rawPath      = usePathname() ?? '/'
  const base         = useCrmBasePath()     // '' on admin domain, '/sales' on main site
  const isAdminDomain = useIsAdminDomain()
  const [open, setOpen] = useState(false)
  const isFounder    = userRole === 'founder'

  /** Href for a workspace segment (today / leads / students / payments / support). */
  function workspaceHref(segment: string) {
    return segment === '' ? (base || '/') : `${base}/${segment}`
  }

  /** Href for a founder admin segment (analytics / settings).
   *  On admin.inglizi.com the middleware maps /analytics → /admin/analytics, etc. */
  function adminHref(adminSegment: string) {
    return isAdminDomain ? `/${adminSegment}` : `/admin/${adminSegment}`
  }

  /** Normalise a raw pathname to a plain segment for active detection.
   *  Strips /sales prefix and /admin prefix so we compare bare tokens. */
  function normalise(p: string) {
    return p.replace(/^\/sales/, '').replace(/^\/admin/, '') || '/'
  }
  const norm = normalise(rawPath)

  function isWorkspaceActive(segment: string) {
    if (segment === '') return norm === '/' || norm === ''
    return norm.startsWith('/' + segment)
  }

  function isAdminActive(adminSegment: string) {
    return norm.startsWith('/' + adminSegment)
  }

  const addLeadHref = `${workspaceHref('leads')}?add=1`

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-black text-white shadow-lg flex items-center justify-center"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={[
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-black text-white',
        'flex flex-col border-r border-zinc-900',
        'transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900 flex-shrink-0">
          <Link href={workspaceHref('today')} className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base">
              I
            </div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">Inglizi CRM</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
                {isFounder ? 'Founder' : 'Assistant'} workspace
              </div>
            </div>
          </Link>
          <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-0 pt-3 pb-1 flex-shrink-0">
          <GlobalSearch base={base} />
        </div>

        {/* Add lead CTA */}
        <div className="px-3 pb-2 flex-shrink-0">
          <Link
            href={addLeadHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-yellow-400 text-black font-bold text-[13px] shadow-sm hover:bg-yellow-300 transition-colors"
          >
            <Plus size={14} /> New lead
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">

          {/* Workspace — all staff */}
          {WORKSPACE.map(item => {
            const active = isWorkspaceActive(item.segment)
            return (
              <Link
                key={item.segment}
                href={workspaceHref(item.segment)}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold transition-colors',
                  active ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                ].join(' ')}
              >
                <item.icon size={16} className={active ? 'text-black' : 'text-zinc-500'} />
                {item.label}
              </Link>
            )
          })}

          {/* Founder-only section */}
          {isFounder && (
            <div className="pt-4">
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                Founder
              </div>
              {FOUNDER.map(item => {
                const active = isAdminActive(item.adminSegment)
                return (
                  <Link
                    key={item.adminSegment}
                    href={adminHref(item.adminSegment)}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold transition-colors',
                      active ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon size={16} className={active ? 'text-black' : 'text-zinc-500'} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Notifications */}
        <div className="px-3 pt-3 border-t border-zinc-900 flex-shrink-0">
          <NotificationBell basePath={base || '/sales'} />
        </div>

        {/* User card */}
        <div className="px-3 py-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-400 font-black text-xs flex-shrink-0">
              {(userEmail?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{userEmail ?? '—'}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                {userRole === 'founder' ? 'Founder' : 'Assistant'}
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <Link
              href="https://inglizi.com"
              className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-md text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
            >
              ← Site
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[11px] font-semibold py-1.5 px-3 rounded-md text-zinc-400 border border-zinc-800 hover:text-red-400 hover:border-red-900 transition-colors"
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
