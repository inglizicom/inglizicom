'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut, Menu, X, ChevronDown, LayoutDashboard, Layers, CalendarDays, Users,
  ClipboardList, FolderOpen, Wallet, Clock, Star, UserRound, ExternalLink, MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'
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
    { segment: 'reports',   label: 'التقارير',     icon: ClipboardList },
    { segment: 'materials', label: 'الملفات',      icon: FolderOpen },
    { segment: 'schedule',  label: 'التوفر',       icon: Clock },
  ]},
  { title: 'النمو', items: [
    { segment: 'earnings',  label: 'الأرباح',      icon: Wallet },
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
    <div dir="rtl" className="min-h-screen bg-[#EAF0F8] font-paper text-[#1E3A8A] antialiased lg:flex">

      {/* ══ Sidebar (lg+) — navy, like the site's footer ═══ */}
      <aside className="hidden lg:flex w-[264px] shrink-0 flex-col sticky top-0 h-screen text-white
                        bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full
                                    bg-[radial-gradient(circle,rgba(251,191,36,.16),transparent_65%)]" />
        <Link href="/teacher" className="relative flex items-center gap-2.5 px-6 h-[72px] shrink-0">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-900 flex items-center justify-center font-black text-[17px] shadow-lg shadow-amber-500/30">إ</span>
          <span className="leading-tight">
            <span className="block text-[16px] font-extrabold tracking-tight">إنجليزي<span className="text-amber-400">.</span>كوم</span>
            <span className="block text-[10.5px] font-bold text-blue-100/75 tracking-[.16em] uppercase">Teacher Studio</span>
          </span>
        </Link>

        <nav className="relative flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          {GROUPS.map(g => (
            <div key={g.title} className="mt-4 first:mt-1">
              <div className="px-3 mb-1.5 text-[10.5px] font-bold tracking-[.14em] text-blue-100/75">{g.title}</div>
              {g.items.map(item => {
                const on = isActive(item.segment)
                const Icon = item.icon
                return (
                  <Link key={item.segment || 'home'} href={href(item.segment)}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors
                                    ${on ? 'text-white' : 'text-blue-50/85 hover:text-white hover:bg-white/5'}`}>
                    {on && (
                      <motion.span layoutId="side-active"
                                   className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10"
                                   transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                    )}
                    {on && <span className="absolute right-0 top-2 bottom-2 w-[3px] rounded-full bg-amber-400" />}
                    <Icon size={17} className={`relative ${on ? 'text-amber-400' : ''}`} />
                    <span className="relative">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* who is signed in, and the shop window */}
        <div className="relative p-3 border-t border-white/10">
          <div className="rounded-2xl bg-white/[.06] ring-1 ring-white/10 p-3.5">
            <div className="flex items-center gap-2.5">
              <Face name={name} url={teacher.profile?.avatar_url} size={36} className="ring-2 ring-white/10" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold truncate">{name}</div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-100/85">
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {active ? 'ملف ظاهر للعموم' : 'ملف موقوف'}
                </div>
              </div>
            </div>
            <Link href={publicUrl} target="_blank"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-500 text-blue-900 py-2 text-[12px] font-extrabold hover:brightness-105 transition">
              <ExternalLink size={13} /> عرض الملف العام
            </Link>
          </div>
          <button onClick={signOut}
                  className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold text-blue-100/80 hover:text-red-300 hover:bg-white/5 transition-colors">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ══ Content column ═════════════════════════════════ */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-[#EAF0F8]/85 backdrop-blur-xl border-b border-[#E2E8F0]/80">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center gap-3">
            <button onClick={() => setSheet(true)} aria-label="القائمة"
                    className="lg:hidden -mr-1 w-9 h-9 rounded-full flex items-center justify-center text-[#475569] hover:bg-white">
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="lg:hidden text-[15px] font-extrabold tracking-tight">إنجليزي<span className="text-[#F59E0B]">.</span>كوم</div>
              {isActive('') ? (
                <div className="hidden lg:block">
                  <div className="text-[17px] font-extrabold tracking-tight truncate">
                    {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، {name.split(' ')[0]} 👋
                  </div>
                  <div className="text-[12px] font-semibold text-[#64748B]">واصل العمل الرائع — هذا ما ينتظرك اليوم.</div>
                </div>
              ) : (
                <div className="hidden lg:block text-[17px] font-extrabold tracking-tight truncate">{current?.label ?? 'فضاء الأستاذ'}</div>
              )}
            </div>

            <div className="flex-1" />

            <Link href={publicUrl} target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white ring-1 ring-[#E2E8F0] text-[12.5px] font-bold text-[#334155] hover:ring-[#1E3A8A] transition">
              <ExternalLink size={14} /> الملف العام
            </Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(v => !v)} aria-label="الحساب"
                      className="flex items-center gap-2 pr-1 pl-2 py-1 rounded-full hover:bg-white transition-colors">
                <Face name={name} url={teacher.profile?.avatar_url} size={34} />
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
