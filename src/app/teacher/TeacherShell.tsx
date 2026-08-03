'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid, CalendarDays, Users, ClipboardList, FolderOpen,
  UserRound, LogOut, Menu, X, Star, ChevronLeft,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'

/**
 * Navigation lives in a drawer on the right — the reading side in Arabic — so
 * the content keeps the full width and the chrome disappears when it isn't
 * wanted. A slim bar holds only the trigger, the brand and the account.
 */

interface NavItem { segment: string; label: string; icon: LucideIcon; hint: string }

const NAV: NavItem[] = [
  { segment: '',          label: 'لوحتي',        icon: LayoutGrid,    hint: 'نظرة عامة على أسبوعك' },
  { segment: 'classes',   label: 'حصصي',         icon: CalendarDays,  hint: 'الجدول والحضور' },
  { segment: 'students',  label: 'طلابي',        icon: Users,         hint: 'من تُدرّسهم' },
  { segment: 'reports',   label: 'تقارير الدروس', icon: ClipboardList, hint: 'ما أُنجز في كل حصة' },
  { segment: 'materials', label: 'ملفاتي',       icon: FolderOpen,    hint: 'الدروس والمرفقات' },
  { segment: 'profile',   label: 'ملفي الشخصي',  icon: UserRound,     hint: 'صفحتك كما تُرى' },
]

export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const teacher  = useTeacher()
  const router   = useRouter()
  const pathname = usePathname() ?? '/teacher'
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  // Escape closes the drawer, and the body stops scrolling behind it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

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

  return (
    <div dir="rtl" className="relative min-h-screen bg-[#FAFAFB] font-plex text-stone-900">
      {/* A quiet mesh behind everything — depth without a pattern you can name. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(60rem 32rem at 82% -8%, rgba(139,92,246,.13), transparent 60%),' +
            'radial-gradient(48rem 28rem at 8% 4%, rgba(6,182,212,.10), transparent 58%),' +
            'radial-gradient(40rem 26rem at 50% 100%, rgba(244,114,182,.08), transparent 62%)',
        }}
      />

      {/* ── Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          <button
            onClick={() => setOpen(true)}
            aria-label="القائمة"
            className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition shadow-sm"
          >
            <Menu size={19} />
          </button>

          <Link href="/teacher" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              إ
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-black text-[15px] tracking-tight">فضاء الأساتذة</div>
              <div className="text-[10px] text-stone-400 tracking-[0.14em] uppercase">Inglizi · teachers</div>
            </div>
          </Link>

          {/* Where am I — the drawer is closed most of the time */}
          {current && (
            <div className="hidden md:flex items-center gap-1.5 text-stone-400 text-[13px] font-bold mr-2">
              <ChevronLeft size={14} />
              <span className="text-stone-700">{current.label}</span>
            </div>
          )}

          <div className="flex-1" />

          {reviews > 0 && (
            <Link href="/teacher/profile#reviews"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-amber-100 to-orange-100 border border-amber-200 text-amber-800 text-[13px] font-black">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {Number(rating).toFixed(1)}
              <span className="text-amber-600/70 font-semibold">({reviews})</span>
            </Link>
          )}

          <Link href="/teacher/profile" aria-label="ملفي" className="shrink-0">
            {teacher.profile?.avatar_url
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={teacher.profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow" />
              : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-black shadow">{initial}</div>}
          </Link>
        </div>
      </header>

      {/* ── Drawer ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0 }}
        />

        <aside
          className="absolute top-0 right-0 h-full w-[19rem] max-w-[86vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
          style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
        >
          {/* Identity card */}
          <div className="relative p-5 pb-6 bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-700 text-white overflow-hidden">
            <div className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-amber-400/25 blur-3xl" aria-hidden />
            <button
              onClick={() => setOpen(false)} aria-label="إغلاق"
              className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 transition"
            >
              <X size={16} />
            </button>

            <div className="relative flex items-center gap-3 mt-1">
              {teacher.profile?.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={teacher.profile.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/70" />
                : <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-2xl font-black">{initial}</div>}
              <div className="min-w-0">
                <div className="font-black text-[16px] truncate">{name}</div>
                <div className="text-[11.5px] text-white/70 truncate">{teacher.email}</div>
                {reviews > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-[12px] font-black text-amber-200">
                    <Star size={12} className="fill-amber-300 text-amber-300" />
                    {Number(rating).toFixed(1)} <span className="text-white/50 font-semibold">({reviews})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV.map(item => {
              const active = isActive(item.segment)
              return (
                <Link
                  key={item.segment || 'home'}
                  href={href(item.segment)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition group ${
                    active ? 'bg-stone-900 text-white shadow-lg' : 'hover:bg-stone-100'}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                    active ? 'bg-white/15' : 'bg-stone-100 text-stone-500 group-hover:bg-white'}`}>
                    <item.icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-black leading-tight">{item.label}</span>
                    <span className={`block text-[11px] font-semibold truncate ${active ? 'text-white/60' : 'text-stone-400'}`}>
                      {item.hint}
                    </span>
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-stone-100">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition"
            >
              <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><LogOut size={17} /></span>
              <span className="text-[14px] font-black">تسجيل الخروج</span>
            </button>
          </div>
        </aside>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">{children}</main>
    </div>
  )
}
