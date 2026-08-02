'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid, CalendarDays, Users, ClipboardList, FolderOpen,
  UserRound, LogOut, Menu, X, Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'

/**
 * The teaching space wears a top bar, not the CRM's black sidebar — a teacher
 * is not an operator of the business, and the space shouldn't feel like one.
 * Warm paper, white cards, a single amber accent carried from the brand.
 */

interface NavItem { segment: string; label: string; icon: LucideIcon }

const NAV: NavItem[] = [
  { segment: '',          label: 'لوحتي',      icon: LayoutGrid },
  { segment: 'classes',   label: 'حصصي',       icon: CalendarDays },
  { segment: 'students',  label: 'طلابي',      icon: Users },
  { segment: 'reports',   label: 'تقارير الدروس', icon: ClipboardList },
  { segment: 'materials', label: 'الملفات',    icon: FolderOpen },
  { segment: 'profile',   label: 'ملفي',       icon: UserRound },
]

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const teacher  = useTeacher()
  const router   = useRouter()
  const pathname = usePathname() ?? '/teacher'
  const [open, setOpen]     = useState(false)
  const [menu, setMenu]     = useState(false)
  const menuRef             = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpen(false); setMenu(false) }, [pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function href(segment: string) { return segment ? `/teacher/${segment}` : '/teacher' }

  function isActive(segment: string) {
    if (!segment) return pathname === '/teacher' || pathname === '/teacher/'
    return pathname.startsWith(`/teacher/${segment}`)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/teacher/login')
  }

  const name    = teacher.profile?.display_name || teacher.fullName || teacher.email || 'أستاذ'
  const initial = name.trim().charAt(0).toUpperCase()
  const rating  = teacher.profile?.rating_avg ?? 0
  const reviews = teacher.profile?.rating_count ?? 0

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F4EF] font-sans text-stone-900">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          <Link href="/teacher" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-base">
              إ
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-black text-[15px] tracking-tight">فضاء الأساتذة</div>
              <div className="text-[10px] text-stone-400 tracking-[0.14em] uppercase">Inglizi · teachers</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {NAV.map(item => {
              const active = isActive(item.segment)
              return (
                <Link
                  key={item.segment || 'home'}
                  href={href(item.segment)}
                  className={[
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-bold transition',
                    active
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
                  ].join(' ')}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Rating pill — a teacher's standing, always visible */}
          {reviews > 0 && (
            <Link
              href="/teacher/profile#reviews"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-bold"
            >
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {Number(rating).toFixed(1)}
              <span className="text-amber-600/70 font-semibold">({reviews})</span>
            </Link>
          )}

          {/* Account */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(v => !v)}
              className="flex items-center gap-2 pr-1 pl-2 py-1 rounded-full hover:bg-stone-100 transition"
              aria-label="حسابي"
            >
              {teacher.profile?.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={teacher.profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-stone-200" />
                : <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-black">{initial}</div>}
              <span className="hidden sm:block text-[13px] font-bold text-stone-700 max-w-[9rem] truncate">{name}</span>
            </button>

            {menu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100">
                  <div className="text-[13px] font-black truncate">{name}</div>
                  <div className="text-[11px] text-stone-400 truncate">{teacher.email}</div>
                </div>
                <Link href="/teacher/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-stone-700 hover:bg-stone-50">
                  <UserRound size={15} /> ملفي الشخصي
                </Link>
                <button onClick={signOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50">
                  <LogOut size={15} /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>

          <button
            className="lg:hidden w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center"
            onClick={() => setOpen(true)}
            aria-label="القائمة"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <nav className="absolute top-0 right-0 h-full w-64 bg-white p-4 flex flex-col gap-1 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-black">فضاء الأساتذة</span>
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="text-stone-400"><X size={20} /></button>
            </div>
            {NAV.map(item => (
              <Link
                key={item.segment || 'home'}
                href={href(item.segment)}
                className={[
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition',
                  isActive(item.segment) ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100',
                ].join(' ')}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-20">{children}</main>
    </div>
  )
}
