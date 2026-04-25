'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import HeaderAuthButton from './HeaderAuthButton'

/** Top-level desktop links — kept short to avoid bar cramping. */
const PRIMARY_NAV = [
  { href: '/',        label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/pricing', label: 'الأسعار' },
]

/** Tools/content surfaced inside the "المزيد" dropdown. */
const FEATURE_NAV = [
  { href: '/blog',     label: 'المدونة',    icon: '📰', desc: 'مقالات ونصائح للتعلّم' },
  { href: '/listen',   label: 'الاستماع',   icon: '🎧', desc: 'بودكاست ومحادثات' },
  { href: '/practice', label: 'تدرب الآن', icon: '✍️', desc: 'تمارين تفاعلية يومية' },
  { href: '/play',     label: 'العب',      icon: '🎮', desc: 'تعلّم باللعب' },
  { href: '/map',      label: 'الخريطة',    icon: '🗺️', desc: 'تابع تقدّمك' },
  { href: '/exams',    label: 'الامتحانات', icon: '📝', desc: 'اختبارات قصيرة' },
]

/** Flat list — used by the mobile drawer where horizontal width isn't a constraint. */
const ALL_NAV = [...PRIMARY_NAV, ...FEATURE_NAV.map(({ href, label }) => ({ href, label }))]

export default function Header() {
  const [open,     setOpen]     = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const moreRef  = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false); setMoreOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* Close the desktop "more" panel when clicking outside or pressing Escape. */
  useEffect(() => {
    if (!moreOpen) return
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  const moreActive = FEATURE_NAV.some(l => pathname === l.href || pathname.startsWith(l.href + '/'))

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 bg-gradient-to-l from-brand-700 via-brand-700 to-brand-800 transition-shadow duration-300 border-b border-amber-400/30 ${
        scrolled ? 'shadow-[0_4px_28px_rgba(29,78,216,0.35)] backdrop-blur-2xl' : 'shadow-[0_2px_16px_rgba(29,78,216,0.22)]'
      }`}
    >
      <div
        className={`max-w-[1200px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 transition-[height] duration-300 ${
          scrolled ? 'h-[52px]' : 'h-[60px]'
        }`}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 border border-amber-300 flex items-center justify-center text-base font-black text-brand-800 shadow-md shadow-amber-500/40">
            إ
          </div>
          <span className="font-black text-base sm:text-lg text-white whitespace-nowrap">
            إنجليزي<span className="text-amber-300">.كوم</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" dir="rtl">
          {PRIMARY_NAV.map(link => {
            const active = link.href === '/'
              ? pathname === '/'
              : pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-[14px] whitespace-nowrap no-underline transition-colors duration-150 ${
                  active
                    ? 'font-bold text-brand-900 bg-amber-300 shadow-sm shadow-amber-500/40'
                    : 'font-semibold text-white/90 hover:text-white hover:bg-white/[0.12]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* "المزيد" dropdown — features panel */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={moreOpen}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[14px] whitespace-nowrap no-underline transition-colors duration-150 cursor-pointer border-0 ${
                moreActive || moreOpen
                  ? 'font-bold text-brand-900 bg-amber-300 shadow-sm shadow-amber-500/40'
                  : 'font-semibold text-white/90 hover:text-white hover:bg-white/[0.12]'
              }`}
            >
              المزيد
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] rounded-2xl bg-white shadow-[0_18px_48px_rgba(15,33,87,0.28)] border border-amber-200 overflow-hidden transition-all duration-200 origin-top ${
                moreOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                  : 'opacity-0 -translate-y-1 pointer-events-none scale-95'
              }`}
            >
              <div className="bg-gradient-to-l from-amber-400 to-yellow-500 px-4 py-2.5">
                <p className="font-black text-brand-900 text-[12px] uppercase tracking-wider">
                  ✨ كل أدواتنا فبلاصة وحدة
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1 p-2">
                {FEATURE_NAV.map(link => {
                  const active = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline transition-colors duration-150 ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-gray-700 hover:bg-amber-50 hover:text-brand-700'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{link.icon}</span>
                      <div className="min-w-0">
                        <div className="font-black text-[13px] leading-tight">{link.label}</div>
                        <div className="text-[11px] font-semibold text-gray-500 truncate">{link.desc}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* ── Desktop CTA + Auth ── */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/onboarding"
            className="px-5 py-2 rounded-lg text-[14px] font-extrabold no-underline bg-gradient-to-l from-amber-400 to-yellow-500 text-brand-900 border border-amber-300 shadow-[0_4px_16px_rgba(251,191,36,0.45)] hover:scale-105 hover:shadow-[0_6px_22px_rgba(251,191,36,0.65)] transition-all duration-150 whitespace-nowrap"
          >
            ابدأ الآن
          </Link>
          <HeaderAuthButton variant="desktop" />
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border-none cursor-pointer bg-white/15 text-white hover:bg-white/25 transition-colors duration-150"
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 top-[60px] bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* ── Mobile Drawer ── */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-in-out ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="mx-3 mt-2 mb-4 rounded-2xl overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="p-2.5 flex flex-col gap-0.5" dir="rtl">
            {ALL_NAV.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-[15px] no-underline transition-colors duration-150 ${
                    active
                      ? 'font-bold text-brand-700 bg-brand-50'
                      : 'font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="px-1 pt-2 pb-1 space-y-2">
              <Link
                href="/onboarding"
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-base font-extrabold no-underline bg-gradient-to-l from-amber-400 to-yellow-500 text-brand-900 shadow-[0_4px_16px_rgba(251,191,36,0.45)] border border-amber-300"
              >
                ابدأ الآن
              </Link>
              <HeaderAuthButton variant="mobile" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
