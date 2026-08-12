'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut, Menu, X, Search, Bell, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'

/**
 * The frame — a masthead, not a control panel.
 *
 * The rail is gone. A fixed sidebar of icon tiles is the house style of every
 * admin tool ever shipped, and it spent 76px of every screen restating where
 * you already were. In its place: a masthead that names the space, and one
 * line of section names underneath it, set in type rather than in chrome.
 *
 * That buys the full width for content, and it makes the sections read as a
 * table of contents instead of a toolbar — which is what they are.
 */

interface NavItem { segment: string; label: string }

const NAV: NavItem[] = [
  { segment: '',          label: 'اليوم' },
  { segment: 'classes',   label: 'الحصص' },
  { segment: 'students',  label: 'الطلاب' },
  { segment: 'reports',   label: 'التقارير' },
  { segment: 'materials', label: 'الملفات' },
  { segment: 'earnings',  label: 'الأرباح' },
  { segment: 'schedule',  label: 'التوفر' },
  { segment: 'reviews',   label: 'التقييمات' },
  { segment: 'profile',   label: 'صفحتي' },
]

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

  const name    = teacher.profile?.display_name || teacher.fullName || teacher.email || 'أستاذ'
  const initial = name.trim().charAt(0).toUpperCase()
  const current = NAV.find(n => isActive(n.segment))

  const Avatar = ({ size = 36 }: { size?: number }) =>
    teacher.profile?.avatar_url
      ? /* eslint-disable-next-line @next/next/no-img-element */
        <img src={teacher.profile.avatar_url} alt="" style={{ width: size, height: size }}
             className="rounded-full object-cover ring-1 ring-black/10" />
      : <span style={{ width: size, height: size }}
              className="rounded-full bg-[#1C1917] text-white flex items-center justify-center font-bold text-[14px]">
          {initial}
        </span>

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF9F6] font-paper text-[#1C1917] antialiased">

      {/* ══ Masthead ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-[#E4DFD5]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8">

          {/* row one — identity and the few global affordances */}
          <div className="h-[68px] flex items-center gap-4">
            <button onClick={() => setSheet(true)} aria-label="القائمة"
                    className="md:hidden -mr-1 w-9 h-9 flex items-center justify-center text-[#57534E]">
              <Menu size={20} />
            </button>

            <Link href="/teacher" className="flex items-baseline gap-2.5 shrink-0">
              <span className="text-[19px] font-extrabold tracking-tight leading-none">إنجليزي</span>
              <span className="hidden sm:inline text-[11px] font-semibold text-[#A8A29E] tracking-[.18em] uppercase">
                Teaching
              </span>
            </Link>

            <div className="flex-1" />

            <button aria-label="بحث"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#57534E] hover:bg-[#F0EDE5] transition-colors">
              <Search size={18} />
            </button>
            <button aria-label="التنبيهات"
                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#57534E] hover:bg-[#F0EDE5] transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 left-2 w-[7px] h-[7px] rounded-full bg-[#C2410C] ring-2 ring-[#FAF9F6]" />
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(v => !v)}
                      className="flex items-center gap-2 pr-1 pl-2 py-1 rounded-full hover:bg-[#F0EDE5] transition-colors">
                <Avatar />
                <ChevronDown size={14} className={`text-[#A8A29E] transition-transform ${menu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-2 w-60 rounded-2xl bg-white ring-1 ring-[#E4DFD5]
                               shadow-[0_18px_44px_-20px_rgba(28,25,23,.35)] overflow-hidden"
                  >
                    <div className="px-4 py-3.5 border-b border-[#F0EDE5]">
                      <div className="font-bold text-[13.5px] truncate">{name}</div>
                      <div className="text-[11.5px] text-[#A8A29E] truncate">{teacher.email}</div>
                    </div>
                    <Link href="/teacher/profile"
                          className="block px-4 py-2.5 text-[13px] font-semibold hover:bg-[#FAF9F6] transition-colors">
                      صفحتي
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

          {/* row two — the table of contents, set in type */}
          <nav className="hidden md:flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar">
            {NAV.map(item => {
              const active = isActive(item.segment)
              return (
                <Link key={item.segment || 'home'} href={href(item.segment)}
                      className={`relative px-3 py-3 text-[13.5px] font-semibold whitespace-nowrap transition-colors
                                  ${active ? 'text-[#1C1917]' : 'text-[#8A8377] hover:text-[#1C1917]'}`}>
                  {item.label}
                  {active && (
                    <motion.span layoutId="nav-underline"
                                 className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#1C1917]"
                                 transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* current section name on mobile, where the nav row is hidden */}
      {current && (
        <div className="md:hidden max-w-[1180px] mx-auto px-5 pt-5">
          <span className="text-[12px] font-bold text-[#A8A29E] tracking-[.12em] uppercase">{current.label}</span>
        </div>
      )}

      {/* ══ Sheet (below md) ═══════════════════════════════ */}
      <AnimatePresence>
        {sheet && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
              className="absolute inset-0 bg-[#1C1917]/35 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              className="absolute top-0 right-0 h-full w-[17rem] max-w-[84vw] bg-[#FAF9F6] flex flex-col"
            >
              <div className="flex items-center gap-3 p-5 border-b border-[#E4DFD5]">
                <Avatar size={42} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[14px] truncate">{name}</div>
                  <div className="text-[11px] text-[#A8A29E] truncate">{teacher.email}</div>
                </div>
                <button onClick={() => setSheet(false)} aria-label="إغلاق"
                        className="w-8 h-8 flex items-center justify-center text-[#78716C]">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-2">
                {NAV.map(item => {
                  const active = isActive(item.segment)
                  return (
                    <Link key={item.segment || 'home'} href={href(item.segment)}
                          className={`flex items-center px-5 py-3 text-[15px] font-semibold transition-colors
                                      ${active ? 'text-[#1C1917] bg-white' : 'text-[#78716C] hover:text-[#1C1917]'}`}>
                      {active && <span className="w-[3px] h-5 rounded-full bg-[#1C1917] -mr-5 ml-[17px]" />}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <button onClick={signOut}
                      className="flex items-center gap-2.5 px-5 py-4 border-t border-[#E4DFD5] text-[14px] font-semibold text-[#B91C1C]">
                <LogOut size={17} /> تسجيل الخروج
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-[1180px] mx-auto px-5 sm:px-8 py-8 sm:py-10 pb-28">{children}</main>
    </div>
  )
}
