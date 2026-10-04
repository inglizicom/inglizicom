'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Menu, X } from 'lucide-react'
import HeaderAuthButton from './HeaderAuthButton'

/**
 * The public header — light, quiet, one gold button.
 *
 * The site is a funnel: a visitor (mostly from social media, on a phone) should
 * see what we sell and one obvious next step, the free level test. So the nav
 * names the three ways to learn (course, private classes, business) plus
 * prices, and nothing else competes with the gold button. The mark is a book,
 * not the letter «إ», which at 32px read as a «!» warning sign.
 */
const NAV = [
  { href: '/courses',  label: 'الدورة' },
  { href: '/classes',  label: 'الحصص الخاصة' },
  { href: '/business', label: 'الإنجليزية المهنية' },
  { href: '/pricing',  label: 'الأسعار' },
  { href: '/blog',     label: 'المدونة' },
]

export function Logo({ size = 'md', onDark = false }: { size?: 'md' | 'lg'; onDark?: boolean }) {
  const box = size === 'lg' ? 'w-10 h-10 rounded-xl' : 'w-9 h-9 rounded-xl'
  return (
    <span className="flex items-center gap-2">
      <span className={`${box} ${onDark ? 'bg-white text-brand-800' : 'bg-brand-700 text-white'} flex items-center justify-center shadow-sm shadow-brand-900/20`}>
        <BookOpen size={size === 'lg' ? 20 : 18} strokeWidth={2.4} />
      </span>
      <span className={`font-black whitespace-nowrap ${onDark ? 'text-white' : 'text-slate-900'} ${size === 'lg' ? 'text-xl' : 'text-[17px]'}`}>
        إنجليزي<span className="text-amber-500">.كوم</span>
      </span>
    </span>
  )
}

export default function Header() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname() ?? '/'

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className={`fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${
      scrolled ? 'border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)]' : 'border-transparent'
    }`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-3">
        <Link href="/" className="no-underline shrink-0" aria-label="إنجليزي.كوم — الرئيسية">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" dir="rtl">
          {NAV.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-2 rounded-lg text-[14.5px] whitespace-nowrap no-underline transition-colors ${
                isActive(link.href) ? 'font-bold text-brand-700 bg-brand-50' : 'font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 lg:hidden" />

        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <HeaderAuthButton variant="desktop" />
          <Link href="/level-test"
            className="px-5 py-2.5 rounded-xl text-[14px] font-extrabold no-underline bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-sm shadow-amber-500/30 transition-colors whitespace-nowrap">
            اختبر مستواك مجانًا
          </Link>
        </div>

        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة" aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Phone menu */}
      <div onClick={() => setOpen(false)} aria-hidden="true"
        className={`lg:hidden fixed inset-0 top-[60px] bg-slate-900/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <div className={`lg:hidden absolute top-full inset-x-0 transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="mx-3 mt-2 rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="p-2 flex flex-col" dir="rtl">
            {NAV.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-3.5 rounded-xl text-[15.5px] no-underline ${
                  isActive(link.href) ? 'font-bold text-brand-700 bg-brand-50' : 'font-semibold text-slate-700 active:bg-slate-100'
                }`}>
                {link.label}
              </Link>
            ))}
            <div className="p-2 pt-3 space-y-2 border-t border-slate-100 mt-1">
              <Link href="/level-test"
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-[15.5px] font-extrabold no-underline bg-amber-400 text-slate-900">
                اختبر مستواك مجانًا
              </Link>
              <HeaderAuthButton variant="mobile" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
