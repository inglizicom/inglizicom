'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid, CalendarDays, Users, ClipboardList, FolderOpen, UserRound,
  LogOut, Menu, X, Star, Search, Bell, Command, ChevronLeft,
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
                className="absolute inset-0 rounded-2xl bg-white/[.07] ring-1 ring-white/[.09]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors
                              ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
                                ${active ? `bg-gradient-to-br ${GRAD[item.grad]} shadow-lg` : 'bg-white/[.05]'}`}>
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
    <div dir="rtl" className="relative min-h-screen bg-[#0B1020] font-plex text-white antialiased">
      {/* Ambient field — the only thing in the app that isn't flat.
          Pinned to the viewport with explicit w/h rather than inset-0: under
          dir=rtl a fixed inset-0 layer resolves against the scrollable width,
          so it stretched past the left edge and fed its own overflow. */}
      <div className="pointer-events-none fixed top-0 left-0 w-screen h-screen -z-10" aria-hidden
           style={{
             backgroundImage:
               'radial-gradient(48rem 30rem at 88% -6%, rgba(91,95,239,.20), transparent 62%),' +
               'radial-gradient(40rem 26rem at 4% 8%, rgba(56,189,248,.12), transparent 60%),' +
               'radial-gradient(36rem 24rem at 55% 108%, rgba(139,92,246,.14), transparent 62%)',
           }} />

      {/* ── Rail (lg and up) ────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-screen z-40 flex-col
                        w-[76px] hover:w-[228px] transition-[width] duration-300 ease-out group
                        bg-[#0E1428]/80 backdrop-blur-2xl border-l border-white/[.06] px-3 py-4">
        <Link href="/teacher" className="flex items-center gap-3 px-2 mb-6 shrink-0">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B5FEF] to-[#8B5CF6] flex items-center justify-center font-black text-lg shadow-lg shrink-0">
            إ
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <span className="block text-[14px] font-bold leading-tight">فضاء الأساتذة</span>
            <span className="block text-[10px] text-slate-500 tracking-[.14em] uppercase">Inglizi</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1.5">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Links expanded /></div>
          <div className="group-hover:hidden absolute inset-x-3 top-[88px] space-y-1.5"><Links expanded={false} /></div>
        </nav>

        <button onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/[.08] transition-colors">
          <span className="w-9 h-9 rounded-xl bg-white/[.05] flex items-center justify-center shrink-0"><LogOut size={16} /></span>
          <span className="text-[13.5px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">خروج</span>
        </button>
      </aside>

      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 lg:pr-[76px]">
        <div className="bg-[#0B1020]/70 backdrop-blur-2xl border-b border-white/[.06]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
            <button onClick={() => setSheet(true)} aria-label="القائمة"
                    className="lg:hidden w-10 h-10 rounded-xl bg-white/[.06] ring-1 ring-white/[.08] flex items-center justify-center">
              <Menu size={18} />
            </button>

            <Link href="/teacher" className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B5FEF] to-[#8B5CF6] flex items-center justify-center font-black">
              إ
            </Link>

            {current && (
              <div className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold">
                <span className="text-slate-500">فضاء الأساتذة</span>
                <ChevronLeft size={13} className="text-slate-600" />
                <span className="text-white">{current.label}</span>
              </div>
            )}

            <div className="flex-1" />

            <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[.05] ring-1 ring-white/[.07]
                               text-slate-400 hover:text-white hover:bg-white/[.08] transition-colors text-[12.5px] font-medium">
              <Search size={14} /> بحث
              <span className="flex items-center gap-0.5 text-[10px] text-slate-500 bg-white/[.06] px-1.5 py-0.5 rounded">
                <Command size={9} /> K
              </span>
            </button>

            <button aria-label="التنبيهات"
                    className="relative w-10 h-10 rounded-xl bg-white/[.05] ring-1 ring-white/[.07] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell size={17} />
              <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8] ring-2 ring-[#0B1020]" />
            </button>

            {reviews > 0 && (
              <Link href="/teacher/profile#reviews"
                    className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-300 text-[12.5px] font-bold">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {Number(rating).toFixed(1)}
              </Link>
            )}

            <Link href="/teacher/profile" aria-label="ملفي">
              {teacher.profile?.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={teacher.profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10" />
                : <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#5B5FEF] flex items-center justify-center font-bold">{initial}</span>}
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
              className="absolute inset-0 bg-[#05070F]/70 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute top-0 right-0 h-full w-[19rem] max-w-[86vw] bg-[#0E1428] border-l border-white/[.07] flex flex-col"
            >
              <div className="relative p-5 border-b border-white/[.06]">
                <button onClick={() => setSheet(false)} aria-label="إغلاق"
                        className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/[.06] flex items-center justify-center text-slate-400">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  {teacher.profile?.avatar_url
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={teacher.profile.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10" />
                    : <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#5B5FEF] flex items-center justify-center text-xl font-bold">{initial}</span>}
                  <div className="min-w-0">
                    <div className="font-bold text-[14px] truncate">{name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{teacher.email}</div>
                  </div>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1.5"><Links expanded /></nav>
              <div className="p-3 border-t border-white/[.06]">
                <button onClick={signOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-rose-300 hover:bg-rose-500/[.08] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center"><LogOut size={16} /></span>
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
