'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV = [
  { href: '/',         label: 'الرئيسية' },
  { href: '/courses',  label: 'الدورات' },
  { href: '/blog',     label: 'المدونة' },
  { href: '/listen',   label: 'الاستماع' },
  { href: '/practice', label: 'تدرب الآن' },
  { href: '/map',      label: '🗺️ الخريطة' },
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

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 bg-brand-700 transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_24px_rgba(0,0,0,0.22)] backdrop-blur-2xl' : 'shadow-[0_1px_12px_rgba(0,0,0,0.15)]'
      }`}
    >
      <div
        className={`max-w-[1100px] mx-auto px-6 flex items-center justify-between transition-[height] duration-300 ${
          scrolled ? 'h-[58px]' : 'h-[68px]'
        }`}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-white/[0.18] border-[1.5px] border-white/35 flex items-center justify-center text-[0.9rem] font-black text-white">
            إ
          </div>
          <span className="font-black text-[1.1rem] text-white tracking-tight">
            إنجليزي<span className="text-blue-300">.كوم</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5" dir="rtl">
          {NAV.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-[10px] text-[0.9rem] no-underline transition-colors duration-150 ${
                  active
                    ? 'font-bold text-white bg-white/[0.18]'
                    : 'font-medium text-white/80 hover:text-white hover:bg-white/[0.12]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTA ── */}
        <div className="hidden lg:flex">
          <Link
            href="/onboarding"
            className="px-6 py-2.5 rounded-xl text-[0.9rem] font-extrabold no-underline bg-white text-brand-700 shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-150"
          >
            ابدأ الآن
          </Link>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[10px] border-none cursor-pointer bg-white/15 text-white hover:bg-white/25 transition-colors duration-150"
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-4 mb-4 rounded-2xl overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
          <nav className="p-3 flex flex-col gap-1" dir="rtl">
            {NAV.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-[0.92rem] no-underline transition-colors duration-150 ${
                    active
                      ? 'font-bold text-brand-700 bg-brand-50'
                      : 'font-medium text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="px-1 pt-2 pb-1">
              <Link
                href="/onboarding"
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-[0.95rem] font-extrabold no-underline bg-brand-700 text-white shadow-[0_4px_16px_rgba(29,78,216,0.35)]"
              >
                ابدأ الآن 🚀
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
