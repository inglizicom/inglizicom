'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut, Menu, X, ChevronDown, LayoutDashboard, Layers, CalendarDays, Users,
  ClipboardList, FolderOpen, Wallet, Clock, Star, UserRound, ExternalLink, MoreHorizontal, Trophy, FileText, Bell,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'
import NotificationBell from '@/components/notifications/NotificationBell'
import { Face } from './_kit'

/**
 * The frame — a sticky sidebar on desktop, a tab bar on the phone.
 *
 * Sections are grouped by what the teacher is doing (today's work, follow-up,
 * growth) so ten links read as three short lists. The public page is one click
 * from anywhere: it is the teacher's shop window, and sharing it is the one
 * action that brings in students.
 */

interface NavItem { segment: string; label: string; icon: LucideIcon }

const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'العمل اليومي', items: [
    { segment: '',          label: 'لوحة القيادة', icon: LayoutDashboard },
    { segment: 'classes',   label: 'الحصص',        icon: CalendarDays },
    { segment: 'groups',    label: 'الأقسام',      icon: Layers },
    { segment: 'students',  label: 'الطلاب',       icon: Users },
  ]},
  { title: 'المتابعة', items: [
    { segment: 'notifications', label: 'الإشعارات', icon: Bell },
    { segment: 'reports',   label: 'التقارير',     icon: ClipboardList },
    { segment: 'materials', label: 'الملفات',      icon: FolderOpen },
    { segment: 'schedule',  label: 'التوفر',       icon: Clock },
  ]},
  { title: 'النمو', items: [
    { segment: 'leaderboard', label: 'المنافسة',   icon: Trophy },
    { segment: 'earnings',  label: 'الأرباح',      icon: Wallet },
    { segment: 'monthly',   label: 'التقرير الشهري', icon: FileText },
    { segment: 'reviews',   label: 'التقييمات',    icon: Star },
    { segment: 'profile',   label: 'ملفي العام',   icon: UserRound },
  ]},
]

const NAV = GROUPS.flatMap(g => g.items)

/** The four destinations a teacher reaches for on the phone; the rest sit under "المزيد". */
const TABS = ['', 'classes', 'students', 'profile']

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const teacher  = useTeacher()
  const router   = useRouter()
  const pathname = usePathname() ?? '/teacher'
  const [sheet, setSheet] = useState(false)
  const [menu, setMenu]   = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { setSheet(false); setMenu(false) }, [pathname])

  // A dropdown that survives a click anywhere else is a dropdown you fight.
  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  const href = (s: string) => (s ? `/teacher/${s}` : '/teacher')
  const isActive = (s: string) =>
    s ? pathname.startsWith(`/teacher/${s}`) : pathname === '/teacher' || pathname === '/teacher/'

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/teacher/login')
  }

  const name      = teacher.profile?.display_name || teacher.fullName || teacher.email || 'أستاذ'
  const headline  = teacher.profile?.headline || 'أستاذ في إنجليزي.كوم'
  const current   = NAV.find(n => isActive(n.segment))
  const publicUrl = `/teacher-showcase/${teacher.id}`
  const active    = teacher.profile?.is_active !== false

  return (
    <div dir="rtl" className="min-h-screen overflow-x-clip bg-[#F1F5FB] font-paper text-[#1E3A8A] antialiased lg:flex">

      {/* ══ Sidebar (lg+) — white, grouped, one clear active state ══ */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col sticky top-0 h-screen bg-white border-l border-[#E2E8F0]">
        <Link href="/teacher" className="flex items-center gap-2.5 px-6 h-[72px] shrink-0 border-b border-[#EEF2F7]">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-[18px] shadow-md shadow-blue-700/30">إ</span>
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold tracking-tight text-[#1E3A8A]">إنجليزي<span className="text-amber-500">.</span>كوم</span>
            <span className="block text-[11.5px] font-semibold text-[#64748B]">فضاء الأستاذ</span>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {GROUPS.map((g, gi) => (
            <div key={g.title} className={gi ? 'mt-4 pt-4 border-t border-[#EEF2F7]' : ''}>
              <div className="px-3 mb-1.5 text-[11px] font-bold tracking-wide text-[#94A3B8]">{g.title}</div>
              {g.items.map(item => {
                const on = isActive(item.segment)
                const Icon = item.icon
                return (
                  <Link key={item.segment || 'home'} href={href(item.segment)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors
                                    ${on ? 'bg-blue-50 text-blue-700 font-bold' : 'text-[#475569] font-semibold hover:bg-slate-50 hover:text-[#1E3A8A]'}`}>
                    <Icon size={18} className={on ? 'text-blue-600' : 'text-[#64748B]'} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* the teacher, and the shop window */}
        <div className="p-3 border-t border-[#EEF2F7]">
          <div className="rounded-2xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3.5">
            <div className="flex items-center gap-2.5">
              <Face name={name} url={teacher.profile?.avatar_url} size={40} className="ring-2 ring-white shadow-sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[#1E3A8A] truncate">{name}</div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {active ? 'ملفك ظاهر للعموم' : 'ملف موقوف'}
                </div>
              </div>
            </div>
            <Link href={publicUrl} target="_blank"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-white ring-1 ring-blue-200 py-2 text-[12px] font-bold text-blue-700 hover:bg-blue-50 transition-colors">
              <ExternalLink size={13} /> عرض الملف العام
            </Link>
          </div>
          <button onClick={signOut}
                  className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ══ Content column ═════════════════════════════════ */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center gap-3">
            <button onClick={() => setSheet(true)} aria-label="القائمة"
                    className="lg:hidden -mr-1 w-9 h-9 rounded-full flex items-center justify-center text-[#475569] hover:bg-slate-100">
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="lg:hidden text-[15px] font-extrabold tracking-tight text-[#1E3A8A]">إنجليزي<span className="text-amber-500">.</span>كوم</div>
              <div className="hidden lg:flex items-center gap-2 text-[13px] font-semibold text-[#64748B]">
                <span>فضاء الأستاذ</span>
                <span className="text-[#CBD5E1]">/</span>
                <span className="font-bold text-[#1E3A8A]">{current?.label ?? 'لوحة القيادة'}</span>
              </div>
            </div>

            <div className="flex-1" />

            {!teacher.isPreview && <NotificationBell userId={teacher.id} allHref="/teacher/notifications" />}

            <Link href={publicUrl} target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white ring-1 ring-[#E2E8F0] text-[12.5px] font-bold text-[#334155] hover:ring-blue-300 hover:text-blue-700 transition">
              <ExternalLink size={14} /> الملف العام
            </Link>
            <span className="hidden sm:block w-px h-8 bg-[#E2E8F0]" />

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(v => !v)} aria-label="الحساب"
                      className="flex items-center gap-2.5 pr-1 pl-2 py-1 rounded-xl hover:bg-slate-50 transition-colors">
                <Face name={name} url={teacher.profile?.avatar_url} size={36} />
                <span className="hidden sm:block text-right leading-tight">
                  <span className="block text-[13px] font-bold text-[#1E3A8A] max-w-[140px] truncate">{name}</span>
                  <span className="block text-[11px] font-semibold text-[#64748B]">أستاذ</span>
                </span>
                <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${menu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-white ring-1 ring-[#E2E8F0]
                               shadow-[0_18px_44px_-20px_rgba(30,58,138,.35)] overflow-hidden"
                  >
                    <div className="px-4 py-3.5 border-b border-[#EEF2F7]">
                      <div className="font-bold text-[13.5px] truncate">{name}</div>
                      <div className="text-[11.5px] text-[#94A3B8] truncate">{teacher.email ?? headline}</div>
                    </div>
                    <Link href="/teacher/profile"
                          className="block px-4 py-2.5 text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors">
                      تعديل ملفي
                    </Link>
                    <Link href={publicUrl} target="_blank"
                          className="block px-4 py-2.5 text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors">
                      عرض الملف العام
                    </Link>
                    <button onClick={signOut}
                            className="w-full text-right px-4 py-2.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-red-50 transition-colors">
                      تسجيل الخروج
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-12">{children}</main>
      </div>

      {/* ══ Tab bar (below lg) ═════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0]
                      pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {TABS.map(seg => {
            const item = NAV.find(n => n.segment === seg)!
            const on = isActive(seg)
            const Icon = item.icon
            return (
              <Link key={seg || 'home'} href={href(seg)}
                    className={`flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition-colors
                                ${on ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}>
                <Icon size={20} className={on ? 'text-[#F59E0B]' : ''} />
                {seg === '' ? 'الرئيسية' : item.label}
              </Link>
            )
          })}
          <button onClick={() => setSheet(true)}
                  className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold text-[#94A3B8]">
            <MoreHorizontal size={20} /> المزيد
          </button>
        </div>
      </nav>

      {/* ══ Sheet (below lg) ═══════════════════════════════ */}
      <AnimatePresence>
        {sheet && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
              className="absolute inset-0 bg-[#1E3A8A]/35 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="absolute top-0 right-0 h-full w-[18rem] max-w-[86vw] bg-[#F8FAFC] flex flex-col"
            >
              <div className="flex items-center gap-3 p-5 border-b border-[#E2E8F0]">
                <Face name={name} url={teacher.profile?.avatar_url} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[14px] truncate">{name}</div>
                  <div className="text-[11px] text-[#94A3B8] truncate">{headline}</div>
                </div>
                <button onClick={() => setSheet(false)} aria-label="إغلاق"
                        className="w-8 h-8 flex items-center justify-center text-[#64748B]">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-2">
                {GROUPS.map(g => (
                  <div key={g.title} className="mt-3">
                    <div className="px-3 mb-1 text-[10.5px] font-bold tracking-[.14em] text-[#94A3B8]">{g.title}</div>
                    {g.items.map(item => {
                      const on = isActive(item.segment)
                      const Icon = item.icon
                      return (
                        <Link key={item.segment || 'home'} href={href(item.segment)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14.5px] font-semibold transition-colors
                                          ${on ? 'bg-white text-[#1E3A8A] ring-1 ring-[#E2E8F0]' : 'text-[#64748B]'}`}>
                          <Icon size={18} className={on ? 'text-[#F59E0B]' : ''} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-[#E2E8F0] space-y-1">
                <Link href={publicUrl} target="_blank"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 text-[13.5px] font-bold">
                  <ExternalLink size={15} /> عرض الملف العام
                </Link>
                <button onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-3 py-3 text-[14px] font-semibold text-[#B91C1C]">
                  <LogOut size={17} /> تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
