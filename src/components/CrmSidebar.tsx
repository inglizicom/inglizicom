'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Home, Users, GraduationCap, CreditCard, Archive,
  BarChart3, Settings, LogOut, Plus, X, Menu,
  CalendarClock, LifeBuoy,
} from 'lucide-react'
import GlobalSearch from '@/app/sales/GlobalSearch'
import NotificationBell from '@/app/sales/NotificationBell'
import { useCrmBasePath, useIsAdminDomain } from '@/lib/use-crm-path'

/* ── Nav items ────────────────────────────────────────────── */
interface WorkspaceItem {
  segment: string
  labelAr: string
  icon: LucideIcon
  mobileShow?: boolean  // show in bottom nav
}
interface FounderItem {
  adminSegment: string
  labelAr: string
  icon: LucideIcon
}

const WORKSPACE: WorkspaceItem[] = [
  { segment: 'workspace', labelAr: 'مساحة العمل', icon: Home,          mobileShow: true },
  { segment: 'today',     labelAr: 'اليوم',        icon: CalendarClock, mobileShow: true },
  { segment: 'leads',     labelAr: 'عملاء محتملون', icon: Users,        mobileShow: true },
  { segment: 'students',  labelAr: 'الطلاب',       icon: GraduationCap, mobileShow: true },
  { segment: 'payments',  labelAr: 'المدفوعات',    icon: CreditCard,    mobileShow: false },
  { segment: 'support',   labelAr: 'الدعم',        icon: LifeBuoy,      mobileShow: false },
]

const FOUNDER: FounderItem[] = [
  { adminSegment: 'analytics', labelAr: 'التحليلات', icon: BarChart3 },
  { adminSegment: 'settings',  labelAr: 'الإعدادات', icon: Settings  },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function CrmSidebar({ userEmail, userRole, onSignOut }: Props) {
  const rawPath       = usePathname() ?? '/'
  const base          = useCrmBasePath()
  const isAdminDomain = useIsAdminDomain()
  const [open, setOpen] = useState(false)
  const isFounder     = userRole === 'founder'

  function workspaceHref(segment: string) {
    return segment === '' ? (base || '/') : `${base}/${segment}`
  }
  function adminHref(adminSegment: string) {
    return isAdminDomain ? `/${adminSegment}` : `/admin/${adminSegment}`
  }
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

  const addLeadHref  = `${workspaceHref('workspace')}?add=1`
  const mobileItems  = WORKSPACE.filter(i => i.mobileShow)

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className={[
        'hidden lg:flex flex-col',
        'sticky top-0 h-screen w-60 bg-black text-white',
        'border-r border-zinc-900 flex-shrink-0',
      ].join(' ')}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900 flex-shrink-0">
          <Link href={workspaceHref('workspace')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base">I</div>
            <div className="leading-tight">
              <div className="font-black text-[15px] tracking-tight">Inglizi CRM</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
                {isFounder ? 'المؤسس' : 'المساعد'}
              </div>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-0 pt-3 pb-1 flex-shrink-0">
          <GlobalSearch base={base} />
        </div>

        {/* Add lead CTA */}
        <div className="px-3 pb-2 flex-shrink-0">
          <Link
            href={addLeadHref}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-yellow-400 text-black font-bold text-[13px] shadow-sm hover:bg-yellow-300 transition-colors"
          >
            <Plus size={14} /> إضافة عميل
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {WORKSPACE.map(item => {
            const active = isWorkspaceActive(item.segment)
            return (
              <Link
                key={item.segment}
                href={workspaceHref(item.segment)}
                className={[
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold transition-colors',
                  active
                    ? 'bg-yellow-400 text-black'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                ].join(' ')}
              >
                <item.icon size={16} className={active ? 'text-black' : 'text-zinc-500'} />
                {item.labelAr}
              </Link>
            )
          })}

          {isFounder && (
            <div className="pt-4">
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                المؤسس
              </div>
              {FOUNDER.map(item => {
                const active = isAdminActive(item.adminSegment)
                return (
                  <Link
                    key={item.adminSegment}
                    href={adminHref(item.adminSegment)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold transition-colors',
                      active
                        ? 'bg-yellow-400 text-black'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon size={16} className={active ? 'text-black' : 'text-zinc-500'} />
                    {item.labelAr}
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
                {isFounder ? 'مؤسس' : 'مساعد'}
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <Link
              href="https://inglizi.com"
              className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-md text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
            >
              ← الموقع
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[11px] font-semibold py-1.5 px-3 rounded-md text-zinc-400 border border-zinc-800 hover:text-red-400 hover:border-red-900 transition-colors"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile: slide-out drawer for extra items ────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={[
        'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-black text-white flex flex-col',
        'transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base">I</div>
            <span className="font-black text-[15px]">Inglizi CRM</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {WORKSPACE.map(item => {
            const active = isWorkspaceActive(item.segment)
            return (
              <Link
                key={item.segment}
                href={workspaceHref(item.segment)}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-3 px-3 py-3 rounded-md text-[15px] font-semibold transition-colors',
                  active ? 'bg-yellow-400 text-black' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white',
                ].join(' ')}
              >
                <item.icon size={18} className={active ? 'text-black' : 'text-zinc-500'} />
                {item.labelAr}
              </Link>
            )
          })}

          {isFounder && (
            <div className="pt-4">
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">المؤسس</div>
              {FOUNDER.map(item => {
                const active = isAdminActive(item.adminSegment)
                return (
                  <Link
                    key={item.adminSegment}
                    href={adminHref(item.adminSegment)}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center gap-3 px-3 py-3 rounded-md text-[15px] font-semibold transition-colors',
                      active ? 'bg-yellow-400 text-black' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon size={18} className={active ? 'text-black' : 'text-zinc-500'} />
                    {item.labelAr}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-900">
          <div className="text-[12px] text-zinc-500 mb-3 px-1">{userEmail}</div>
          <div className="flex gap-2">
            <Link
              href="https://inglizi.com"
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-[12px] font-semibold py-2 rounded-md text-zinc-400 border border-zinc-800 hover:text-white"
            >
              ← الموقع
            </Link>
            {onSignOut && (
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="text-[12px] font-semibold py-2 px-4 rounded-md text-zinc-400 border border-zinc-800 hover:text-red-400 hover:border-red-900"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom navigation ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-zinc-800 flex items-center justify-around h-16 px-2 pb-safe">
        {mobileItems.map(item => {
          const active = isWorkspaceActive(item.segment)
          return (
            <Link
              key={item.segment}
              href={workspaceHref(item.segment)}
              className={[
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[52px]',
                active ? 'text-yellow-400' : 'text-zinc-500',
              ].join(' ')}
            >
              <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold leading-tight">{item.labelAr}</span>
            </Link>
          )
        })}
        {/* More button → opens full drawer */}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[52px] text-zinc-500"
        >
          <Menu size={22} strokeWidth={2} />
          <span className="text-[10px] font-semibold leading-tight">المزيد</span>
        </button>
      </nav>

      {/* ── Mobile FAB: quick add lead ───────────────────── */}
      <Link
        href={addLeadHref}
        className="lg:hidden fixed bottom-20 left-4 z-30 w-14 h-14 bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-xl hover:bg-yellow-300 transition-colors"
        aria-label="إضافة عميل محتمل"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </>
  )
}
