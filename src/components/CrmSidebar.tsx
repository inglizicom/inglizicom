'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, CreditCard,
  BarChart3, Settings, LogOut, X, ShieldCheck, BookOpen, Inbox, Megaphone, Trophy,
  UserCog, Presentation, Plus, Shield, ExternalLink,
} from 'lucide-react'

/**
 * The CRM's navigation — a white, grouped sidebar on desktop and the same list
 * in a drawer on the phone (opened from the header or the tab bar's "المزيد").
 *
 * Fourteen links read as four short lists grouped by the job: selling, teaching,
 * talking to students, running the business. Same frame as the teacher space so
 * staff and teachers learn one product, not two.
 */

interface NavDef {
  id:        string
  labelAr:   string
  icon:      LucideIcon
  path:      string          // pathname part (without base)
  tab?:      string          // optional ?tab= value
  badgeKey?: 'leads' | 'followups' | 'submissions'
  founder?:  boolean
}

const GROUPS: { title: string; founder?: boolean; items: NavDef[] }[] = [
  { title: 'المبيعات', items: [
    { id: 'dashboard', labelAr: 'لوحة التحكم',        icon: LayoutDashboard, path: '/dashboard' },
    { id: 'leads',     labelAr: 'العملاء المحتملون',   icon: Users,           path: '/workspace', badgeKey: 'leads' },
    { id: 'followups', labelAr: 'المتابعات',           icon: CalendarCheck,   path: '/workspace', tab: 'followups', badgeKey: 'followups' },
    { id: 'students',  labelAr: 'الطلاب',             icon: GraduationCap,   path: '/workspace', tab: 'students' },
    { id: 'payments',  labelAr: 'المدفوعات',          icon: CreditCard,      path: '/workspace', tab: 'payments' },
  ]},
  { title: 'التعليم', items: [
    { id: 'courses',     labelAr: 'الدورات',            icon: BookOpen,     path: '/courses' },
    { id: 'classes',     labelAr: 'الأقسام المباشرة',    icon: Presentation, path: '/classes' },
    { id: 'submissions', labelAr: 'تصحيح المحادثات',    icon: Inbox,        path: '/submissions', badgeKey: 'submissions' },
    { id: 'verify',      labelAr: 'التحقق من طالب',     icon: ShieldCheck,  path: '/verify' },
  ]},
  { title: 'التواصل والتحفيز', items: [
    { id: 'announcements', labelAr: 'الإعلانات',          icon: Megaphone, path: '/announcements' },
    { id: 'gamification',  labelAr: 'المكافآت والتحديات', icon: Trophy,    path: '/gamification' },
  ]},
  { title: 'الإدارة', founder: true, items: [
    { id: 'teachers', labelAr: 'الأساتذة',            icon: UserCog,   path: '/teachers',  founder: true },
    { id: 'revenue',  labelAr: 'الإيرادات والتقارير', icon: BarChart3, path: '/analytics', founder: true },
    { id: 'admin',    labelAr: 'أدوات المؤسس',        icon: Shield,    path: '',           founder: true },
    { id: 'settings', labelAr: 'الإعدادات',          icon: Settings,  path: '/settings',  founder: true },
  ]},
]

export type CrmBadges = { leads?: number; followups?: number; submissions?: number }

interface Props {
  userEmail?: string | null
  userRole?:  'founder' | 'assistant' | 'student' | 'teacher' | null
  onSignOut?: () => void
  base:       string                      // '' on admin domain, '/sales' on main
  isAdminDomain: boolean
  badges?:    CrmBadges
  /** Phone drawer state — owned by the frame so the header and tab bar can open it. */
  open:       boolean
  onClose:    () => void
}

export default function CrmSidebar({ userEmail, userRole, onSignOut, base, isAdminDomain, badges, open, onClose }: Props) {
  const pathname  = usePathname() ?? '/'
  const tab       = useSearchParams().get('tab')
  const isFounder = userRole === 'founder'

  // Navigating closes the drawer.
  useEffect(() => { onClose() }, [pathname, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  function hrefFor(item: NavDef): string {
    // Founder pages live under /admin on the main site, at the root on the admin domain.
    if (item.id === 'admin') return '/admin'
    if (item.founder) return isAdminDomain ? item.path : `/admin${item.path}`
    const p = `${base}${item.path}`
    return item.tab ? `${p}?tab=${item.tab}` : p
  }

  function isActive(item: NavDef): boolean {
    if (item.id === 'admin') return pathname === '/admin'
    if (!pathname.includes(item.path)) return false
    // /admin/courses is the content library, not the CRM's course list.
    if (item.id === 'courses' && pathname.startsWith('/admin')) return false
    if (item.path === '/workspace') {
      if (item.tab) return tab === item.tab
      return !tab || tab === 'leads'
    }
    return true
  }

  const groups = GROUPS.filter(g => !g.founder || isFounder)
  const name = userEmail?.split('@')[0] ?? '—'

  const nav = (phone: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
      {groups.map((g, gi) => (
        <div key={g.title} className={gi ? 'mt-2 pt-2 border-t border-[#EEF2F7]' : ''}>
          <div className="px-3 mb-0.5 text-[11px] font-bold tracking-wide text-[#94A3B8]">{g.title}</div>
          {g.items.map(item => {
            const on    = isActive(item)
            const badge = item.badgeKey ? badges?.[item.badgeKey] : undefined
            const Icon  = item.icon
            return (
              <Link key={item.id} href={hrefFor(item)}
                    className={`flex items-center gap-3 px-3 ${phone ? 'py-3 text-[14.5px]' : 'py-2 text-[13.5px]'} rounded-xl transition-colors
                                ${on ? 'bg-blue-50 text-blue-700 font-bold' : 'text-[#475569] font-semibold hover:bg-slate-50 hover:text-[#1E3A8A]'}`}>
                <Icon size={18} className={on ? 'text-blue-600' : 'text-[#64748B]'} />
                <span className="flex-1 truncate">{item.labelAr}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm shadow-rose-500/40">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )

  const addLead = (
    <Link href={`${base}/workspace?add=1`}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-[#1E3A8A] text-[13px] font-bold ring-1 ring-amber-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow">
      <Plus size={16} strokeWidth={2.6} /> عميل جديد
    </Link>
  )

  const me = (
    <div className="p-3 border-t border-[#EEF2F7]">
      <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-2.5 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-[14px] shrink-0 ring-2 ring-white shadow-sm">
          {(name[0] ?? '?').toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13px] font-bold text-[#1E3A8A] truncate" title={userEmail ?? undefined}>{name}</div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isFounder ? 'المؤسس' : 'مسؤول العملاء'}
          </div>
        </div>
        <a href="https://inglizi.com" target="_blank" rel="noopener noreferrer" title="الموقع" aria-label="الموقع"
           className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white hover:text-blue-700 transition-colors">
          <ExternalLink size={15} />
        </a>
        {onSignOut && (
          <button onClick={onSignOut} title="تسجيل الخروج" aria-label="تسجيل الخروج"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-[#B91C1C] transition-colors">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  )

  const brand = (
    <Link href={`${base}/dashboard`} className="flex items-center gap-2.5">
      <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-[18px] shadow-md shadow-blue-700/30">إ</span>
      <span className="leading-tight">
        <span className="block text-[17px] font-extrabold tracking-tight text-[#1E3A8A]">إنجليزي<span className="text-amber-500">.</span>كوم</span>
        <span className="block text-[11.5px] font-semibold text-[#64748B]">{isFounder ? 'لوحة الإدارة' : 'فضاء الفريق'}</span>
      </span>
    </Link>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[264px] shrink-0 flex-col sticky top-0 h-screen bg-white border-l border-[#E2E8F0]">
        <div className="px-5 h-[72px] shrink-0 flex items-center border-b border-[#EEF2F7]">{brand}</div>
        <div className="px-4 pt-3">{addLead}</div>
        {nav(false)}
        {me}
      </aside>

      {/* Phone drawer */}
      <AnimatePresence>
        {open && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-[#1E3A8A]/35 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="absolute top-0 right-0 h-full w-[18.5rem] max-w-[86vw] bg-white flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 h-[68px] border-b border-[#EEF2F7] shrink-0">
                {brand}
                <button onClick={onClose} aria-label="إغلاق"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 pt-3">{addLead}</div>
              {nav(true)}
              {me}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
