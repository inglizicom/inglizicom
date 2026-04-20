'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import HeaderAuthButton from './HeaderAuthButton'

const NAV = [
  { href: '/',         label: 'الرئيسية' },
  { href: '/courses',  label: 'الدورات' },
  { href: '/pricing',  label: 'الأسعار' },
  { href: '/blog',     label: 'المدونة' },
  { href: '/listen',   label: 'الاستماع' },
  { href: '/practice', label: 'تدرب الآن' },
  { href: '/play',     label: 'العب' },
  { href: '/map',      label: 'الخريطة' },
  { href: '/exams',    label: 'الامتحانات' },
]

export default function Header() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 bg-brand-700 transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.22)] backdrop-blur-2xl' : 'shadow-[0_1px_12px_rgba(0,0,0,0.15)]'
      }`}
    >
      <div
        className={`max-w-[1200px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 transition-[height] duration-300 ${
          scrolled ? 'h-[52px]' : 'h-[60px]'
        }`}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-base font-black text-white">
            إ
          </div>
          <span className="font-black text-base sm:text-lg text-white whitespace-nowrap">
            إنجليزي<span className="text-blue-300">.كوم</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" dir="rtl">
          {NAV.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-lg text-[13px] whitespace-nowrap no-underline transition-colors duration-150 ${
                  active
                    ? 'font-bold text-white bg-white/20'
                    : 'font-semibold text-white/85 hover:text-white hover:bg-white/[0.12]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTA + Auth ── */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/onboarding"
            className="px-5 py-2 rounded-lg text-[14px] font-extrabold no-underline bg-white text-brand-700 shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-150 whitespace-nowrap"
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
        className={`lg:hidden fixed inset-0 top-[60px] bg-black/40 transition-opacity duration-300 ${
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
            {NAV.map(link => {
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
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-base font-extrabold no-underline bg-brand-700 text-white shadow-[0_4px_16px_rgba(29,78,216,0.35)]"
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
