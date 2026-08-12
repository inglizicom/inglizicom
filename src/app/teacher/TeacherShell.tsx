'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid, CalendarDays, Users, ClipboardList, FolderOpen, UserRound,
  LogOut, Menu, X, Star, Search, Bell, Command, ChevronLeft,
  Wallet, CalendarClock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'
import { GRAD } from './_ds'

/**
 * The frame.
 *
 * A rail on the right (the reading side in Arabic) that stays out of the way:
 * icons only until hovered, when it widens and the labels arrive. Below the lg
 * breakpoint it becomes a sheet over the content. The top bar is a thin strip
 * of glass carrying search, notifications and identity — the things you reach
 * for, not the things you navigate to.
 */

interface NavItem { segment: string; label: string; icon: LucideIcon; grad: keyof typeof GRAD }

const NAV: NavItem[] = [
  { segment: '',          label: 'لوحتي',        icon: LayoutGrid,    grad: 'violet' },
  { segment: 'classes',   label: 'حصصي',         icon: CalendarDays,  grad: 'sky' },
  { segment: 'students',  label: 'طلابي',        icon: Users,         grad: 'emerald' },
  { segment: 'reports',   label: 'التقارير',      icon: ClipboardList, grad: 'amber' },
  { segment: 'materials', label: 'الملفات',      icon: FolderOpen,    grad: 'rose' },
  // Money is emerald, time is sky, praise is amber — the domain colours hold.
  { segment: 'earnings',  label: 'أرباحي',       icon: Wallet,        grad: 'emerald' },
  { segment: 'schedule',  label: 'أوقات توفري',  icon: CalendarClock, grad: 'sky' },
  { segment: 'reviews',   label: 'التقييمات',    icon: Star,          grad: 'amber' },
  { segment: 'profile',   label: 'ملفي',         icon: UserRound,     grad: 'violet' },
]

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const teacher  = useTeacher()
  const router   = useRouter()
  const pathname = usePathname() ?? '/teacher'
  const [sheet, setSheet] = useState(false)

  useEffect(() => { setSheet(false) }, [pathname])
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSheet(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = sheet ? 'hidden' : ''
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [sheet])

  const href = (s: string) => (s ? `/teacher/${s}` : '/teacher')
  const isActive = (s: string) =>
    s ? pathname.startsWith(`/teacher/${s}`) : pathname === '/teacher' || pathname === '/teacher/'

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/teacher/login')
  }

  const name    = teacher.profile?.display_name || teacher.fullName || teacher.email || 'أستاذ'
  const initial = name.trim().charAt(0).toUpperCase()
  const rating  = teacher.profile?.rating_avg ?? 0
  const reviews = teacher.profile?.rating_count ?? 0
  const current = NAV.find(n => isActive(n.segment))

  const Links = ({ expanded }: { expanded: boolean }) => (
    <>
      {NAV.map(item => {
        const active = isActive(item.segment)
        return (
          <Link key={item.segment || 'home'} href={href(item.segment)} className="relative block">
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-2xl bg-[#F6F4EF] ring-1 ring-[#E7E2D8]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors
                              ${active ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'}`}>
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
                                ${active
                                  ? `bg-gradient-to-br ${GRAD[item.grad]} text-white shadow-[0_4px_10px_-4px_rgba(28,25,23,.4)]`
                                  : 'bg-[#F1EDE4] text-[#78716C]'}`}>
                <item.icon size={17} />
              </span>
              <span className={`text-[13.5px] font-semibold whitespace-nowrap transition-all duration-200
                                ${expanded ? 'opacity-100' : 'opacity-0 lg:w-0 lg:overflow-hidden'}`}>
                {item.label}
              </span>
            </span>
          </Link>
        )
      })}
    </>
  )

  return (
    <div dir="rtl" className="relative min-h-screen bg-[#F6F4EF] font-paper text-[#1C1917] antialiased">
      {/* The desk. Paper is warm rather than lit, so this is a barely-there
          tint at the top rather than the coloured blooms of the dark era.
          Pinned with explicit w/h rather than inset-0: under dir=rtl a fixed
          inset-0 layer resolves against the scrollable width, so it stretched
          past the left edge and fed its own overflow. */}
      <div className="pointer-events-none fixed top-0 left-0 w-screen h-screen -z-10" aria-hidden
           style={{
             backgroundImage:
               'radial-gradient(60rem 32rem at 85% -10%, rgba(180,83,9,.045), transparent 60%),' +
               'radial-gradient(52rem 30rem at 8% 4%, rgba(109,40,217,.035), transparent 58%)',
           }} />

      {/* ── Rail (lg and up) ────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-screen z-40 flex-col
                        w-[76px] hover:w-[228px] transition-[width] duration-300 ease-out group
                        bg-white/90 backdrop-blur-2xl border-l border-[#E7E2D8] px-3 py-4">
        <Link href="/teacher" className="flex items-center gap-3 px-2 mb-6 shrink-0">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-black text-lg shadow-[0_4px_12px_-4px_rgba(28,25,23,.45)] shrink-0">
            إ
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <span className="block text-[14px] font-bold leading-tight">فضاء الأساتذة</span>
            <span className="block text-[10px] text-[#A8A29E] tracking-[.14em] uppercase">Inglizi</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1.5">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Links expanded /></div>
          <div className="group-hover:hidden absolute inset-x-3 top-[88px] space-y-1.5"><Links expanded={false} /></div>
        </nav>

        <button onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#78716C] hover:text-rose-700 hover:bg-rose-50 transition-colors">
          <span className="w-9 h-9 rounded-xl bg-[#F1EDE4] flex items-center justify-center shrink-0"><LogOut size={16} /></span>
          <span className="text-[13.5px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">خروج</span>
        </button>
      </aside>

      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 lg:pr-[76px]">
        <div className="bg-[#F6F4EF]/85 backdrop-blur-2xl border-b border-[#E7E2D8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
            <button onClick={() => setSheet(true)} aria-label="القائمة"
                    className="lg:hidden w-10 h-10 rounded-xl bg-white ring-1 ring-[#E7E2D8] flex items-center justify-center text-[#44403C]">
              <Menu size={18} />
            </button>

            <Link href="/teacher" className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-black">
              إ
            </Link>

            {current && (
              <div className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold">
                <span className="text-[#A8A29E]">فضاء الأساتذة</span>
                <ChevronLeft size={13} className="text-[#D6D3D1]" />
                <span className="text-[#1C1917]">{current.label}</span>
              </div>
            )}

            <div className="flex-1" />

            <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white ring-1 ring-[#E7E2D8]
                               text-[#78716C] hover:text-[#1C1917] hover:ring-[#D9D2C4] transition-colors text-[12.5px] font-medium">
              <Search size={14} /> بحث
              <span className="flex items-center gap-0.5 text-[10px] text-[#A8A29E] bg-[#F6F4EF] px-1.5 py-0.5 rounded">
                <Command size={9} /> K
              </span>
            </button>

            <button aria-label="التنبيهات"
                    className="relative w-10 h-10 rounded-xl bg-white ring-1 ring-[#E7E2D8] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors">
              <Bell size={17} />
              <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#0369A1] ring-2 ring-white" />
            </button>

            {reviews > 0 && (
              <Link href="/teacher/reviews"
                    className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-[12.5px] font-bold">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                {Number(rating).toFixed(1)}
              </Link>
            )}

            <Link href="/teacher/profile" aria-label="ملفي">
              {teacher.profile?.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={teacher.profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#E7E2D8]" />
                : <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] text-white flex items-center justify-center font-bold">{initial}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sheet (below lg) ────────────────────────────── */}
      <AnimatePresence>
        {sheet && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
              className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute top-0 right-0 h-full w-[19rem] max-w-[86vw] bg-white border-l border-[#E7E2D8] flex flex-col"
            >
              <div className="relative p-5 border-b border-[#E7E2D8]">
                <button onClick={() => setSheet(false)} aria-label="إغلاق"
                        className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-[#F6F4EF] flex items-center justify-center text-[#78716C]">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  {teacher.profile?.avatar_url
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={teacher.profile.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#E7E2D8]" />
                    : <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0369A1] text-white flex items-center justify-center text-xl font-bold">{initial}</span>}
                  <div className="min-w-0">
                    <div className="font-bold text-[14px] truncate">{name}</div>
                    <div className="text-[11px] text-[#A8A29E] truncate">{teacher.email}</div>
                  </div>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1.5"><Links expanded /></nav>
              <div className="p-3 border-t border-[#E7E2D8]">
                <button onClick={signOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-rose-700 hover:bg-rose-50 transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center"><LogOut size={16} /></span>
                  <span className="text-[13.5px] font-semibold">تسجيل الخروج</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="lg:pr-[76px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-24">{children}</div>
      </main>
    </div>
  )
}
