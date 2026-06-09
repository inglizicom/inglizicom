'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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

/* ─── Workspace items — all link into /sales/workspace?tab= ─── */
interface NavItem {
  id:          string           // tab name or unique key
  labelAr:     string
  icon:        LucideIcon
  href:        (base: string) => string
  activeMatch: (path: string, tab: string | null) => boolean
  mobileShow:  boolean
}

const WORKSPACE_ITEMS: NavItem[] = [
  {
    id: 'leads',
    labelAr: 'العملاء المحتملون',
    icon: Users,
    href: (b) => `${b}/workspace`,
    activeMatch: (p, t) => p.endsWith('/workspace') && (!t || t === 'leads'),
    mobileShow: true,
  },
  {
    id: 'followups',
    labelAr: 'المتابعات',
    icon: CalendarClock,
    href: (b) => `${b}/workspace?tab=followups`,
    activeMatch: (_, t) => t === 'followups',
    mobileShow: true,
  },
  {
    id: 'students',
    labelAr: 'الطلاب',
    icon: GraduationCap,
    href: (b) => `${b}/workspace?tab=students`,
    activeMatch: (_, t) => t === 'students',
    mobileShow: true,
  },
  {
    id: 'payments',
    labelAr: 'المدفوعات',
    icon: CreditCard,
    href: (b) => `${b}/workspace?tab=payments`,
    activeMatch: (_, t) => t === 'payments',
    mobileShow: false,
  },
  {
    id: 'archive',
    labelAr: 'الأرشيف',
    icon: Archive,
    href: (b) => `${b}/workspace?tab=archive`,
    activeMatch: (_, t) => t === 'archive',
    mobileShow: false,
  },
  {
    id: 'support',
    labelAr: 'الدعم',
    icon: LifeBuoy,
    href: (b) => `${b}/support`,
    activeMatch: (p) => p.includes('/support'),
    mobileShow: false,
  },
]

const FOUNDER_ITEMS: { id: string; labelAr: string; icon: LucideIcon; adminSeg: string }[] = [
  { id: 'analytics', labelAr: 'التحليلات', icon: BarChart3, adminSeg: 'analytics' },
  { id: 'settings',  labelAr: 'الإعدادات', icon: Settings,  adminSeg: 'settings'  },
]

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | null
  onSignOut?: () => void
}

export default function CrmSidebar({ userEmail, userRole, onSignOut }: Props) {
  const rawPath       = usePathname() ?? '/'
  const searchParams  = useSearchParams()
  const currentTab    = searchParams?.get('tab') ?? null
  const base          = useCrmBasePath()          // '' on admin domain, '/sales' on main
  const isAdminDomain = useIsAdminDomain()
  const [open, setOpen] = useState(false)
  const isFounder     = userRole === 'founder'

  function adminHref(seg: string) {
    return isAdminDomain ? `/${seg}` : `/admin/${seg}`
  }
  function isAdminActive(seg: string) {
    return rawPath.includes(`/admin/${seg}`) || (isAdminDomain && rawPath.includes(`/${seg}`))
  }

  const addLeadHref = `${base}/workspace`
  const mobileItems = WORKSPACE_ITEMS.filter(i => i.mobileShow)

  /* ── Shared nav link renderer ─────────────────────────── */
  function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
    const active = item.activeMatch(rawPath, currentTab)
    return (
      <Link
        href={item.href(base)}
        onClick={onClick}
        className={[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors',
          active
            ? 'bg-yellow-400 text-black'
            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
        ].join(' ')}
      >
        <item.icon size={16} className={active ? 'text-black' : 'text-zinc-500'} />
        {item.labelAr}
      </Link>
    )
  }

  return (
    <>
      {/* ══ DESKTOP SIDEBAR (right side, sticky) ════════ */}
      {/* dir="ltr" keeps the sidebar internals left-aligned (icon → label) */}
      <aside
        className="hidden lg:flex flex-col sticky top-0 h-screen w-60 bg-black text-white border-l border-zinc-900 flex-shrink-0"
        dir="ltr"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-zinc-900 flex-shrink-0">
          <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base flex-shrink-0">
            I
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-black text-[15px] tracking-tight">Inglizi CRM</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {isFounder ? 'المؤسس' : 'المساعد'}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pt-3 pb-1 flex-shrink-0">
          <GlobalSearch base={base} />
        </div>

        {/* Add lead CTA */}
        <div className="px-3 pb-2 flex-shrink-0">
          <Link
            href={`${addLeadHref}?add=1`}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold text-[13px] hover:bg-yellow-300 transition-colors"
          >
            <Plus size={14} /> إضافة عميل
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {WORKSPACE_ITEMS.map(item => <NavLink key={item.id} item={item} />)}

          {isFounder && (
            <div className="pt-4">
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                المؤسس
              </div>
              {FOUNDER_ITEMS.map(item => {
                const active = isAdminActive(item.adminSeg)
                return (
                  <Link
                    key={item.id}
                    href={adminHref(item.adminSeg)}
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors',
                      active ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
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
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-400 font-black text-xs flex-shrink-0">
              {(userEmail?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{userEmail ?? '—'}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {isFounder ? 'مؤسس' : 'مساعد'}
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <Link
              href="https://inglizi.com"
              className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-lg text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 transition-colors"
            >
              ← الموقع
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[11px] font-semibold py-1.5 px-3 rounded-lg text-zinc-400 border border-zinc-800 hover:text-red-400 hover:border-red-900 transition-colors"
                aria-label="تسجيل الخروج"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ══ MOBILE: backdrop ════════════════════════════ */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══ MOBILE: slide-in drawer from RIGHT ══════════ */}
      <aside
        dir="ltr"
        className={[
          'lg:hidden fixed inset-y-0 right-0 z-50 w-72 bg-black text-white flex flex-col',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-yellow-400 text-black flex items-center justify-center font-black text-base">
              I
            </div>
            <span className="font-black text-[15px]">Inglizi CRM</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {WORKSPACE_ITEMS.map(item => <NavLink key={item.id} item={item} onClick={() => setOpen(false)} />)}

          {isFounder && (
            <div className="pt-4">
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">المؤسس</div>
              {FOUNDER_ITEMS.map(item => {
                const active = isAdminActive(item.adminSeg)
                return (
                  <Link
                    key={item.id}
                    href={adminHref(item.adminSeg)}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-semibold transition-colors',
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
              className="flex-1 text-center text-[12px] font-semibold py-2 rounded-lg text-zinc-400 border border-zinc-800 hover:text-white"
            >
              ← الموقع
            </Link>
            {onSignOut && (
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                className="text-[12px] py-2 px-4 rounded-lg text-zinc-400 border border-zinc-800 hover:text-red-400"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ══ MOBILE: bottom navigation bar ══════════════ */}
      <nav
        dir="rtl"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-zinc-800 flex items-center justify-around h-16"
      >
        {mobileItems.map(item => {
          const active = item.activeMatch(rawPath, currentTab)
          return (
            <Link
              key={item.id}
              href={item.href(base)}
              className={[
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg',
                active ? 'text-yellow-400' : 'text-zinc-500',
              ].join(' ')}
            >
              <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[9px] font-semibold leading-tight">{item.labelAr}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-zinc-500"
        >
          <Menu size={22} strokeWidth={2} />
          <span className="text-[9px] font-semibold leading-tight">المزيد</span>
        </button>
      </nav>

      {/* ══ MOBILE: FAB — add lead ══════════════════════ */}
      <Link
        href={`${addLeadHref}?add=1`}
        className="lg:hidden fixed bottom-20 left-4 z-30 w-14 h-14 bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-xl hover:bg-yellow-300 transition-colors"
        aria-label="إضافة عميل"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </>
  )
}
