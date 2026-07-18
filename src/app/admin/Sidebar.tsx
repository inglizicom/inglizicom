'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Shield, BarChart3, Activity, Video, FileText, BookOpen,
  Database, Lock, Settings, Menu, X, LogOut, ArrowUpRight, Gauge,
} from 'lucide-react'

/**
 * Founder command-center sidebar.
 *
 * /admin/* is for content management, system tools, audit + analytics.
 * The day-to-day sales workspace lives at /sales/* — the top of this
 * sidebar always shows a clear "Back to Sales workspace →" link so the
 * founder can switch contexts in one click.
 */
interface NavItem { href: string; label: string; icon: LucideIcon }
interface NavGroup { title: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    title: 'Insights',
    items: [
      { href: '/admin/command',   label: 'Command Center', icon: Gauge },
      { href: '/admin/analytics', label: 'Analytics',     icon: BarChart3 },
      { href: '/admin/activity',  label: 'Activity Log',  icon: Activity },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/courses',   label: 'Courses',       icon: Video },
      { href: '/admin/articles',  label: 'Articles',      icon: FileText },
      { href: '/admin/lessons',   label: 'Lessons',       icon: BookOpen },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings',  label: 'Settings',      icon: Settings },
      { href: '/admin/access',    label: 'Access',        icon: Lock },
      { href: '/admin/bootstrap', label: 'Bootstrap',     icon: Database },
    ],
  },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function Sidebar({ userEmail, userRole, onSignOut }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
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
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-black text-white',
          'flex flex-col border-r border-zinc-900',
          'transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base shadow-sm">
              <Shield size={14} />
            </div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">Admin</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em]">Inglizi · command center</div>
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

        {/* Switch-to-sales shortcut — always at the top */}
        <div className="px-3 pt-3">
          <Link
            href="/sales"
            className="group flex items-center gap-2 px-3 py-2.5 rounded-md bg-yellow-400 text-black font-bold text-[13px] shadow-sm hover:bg-yellow-300 transition-colors"
          >
            <span className="flex-1">← Sales workspace</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map(group => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                {group.title}
              </div>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          'group flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] font-semibold transition-colors',
                          active
                            ? 'bg-yellow-400 text-black shadow-sm'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                        ].join(' ')}
                      >
                        <item.icon
                          size={16}
                          className={active ? 'text-black' : 'text-zinc-500 group-hover:text-white'}
                        />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
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
