'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

// ─── Nav definition (RTL order, rendered right→left) ─────────────────────────
const NAV_LINKS = [
  { href: '/',        label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/blog',    label: 'المدونة' },
  { href: '/listen',  label: 'الاستماع' },
  { href: '/practice',label: 'تدرب الآن', cta: true },
  { href: '/map',     label: '🗺️ الخريطة' },
]

export default function Header() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const isHome = pathname === '/'

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(6,10,22,0.97)'
          : isHome ? 'transparent' : 'rgba(6,10,22,0.97)',
        backdropFilter: scrolled || !isHome ? 'blur(18px)' : 'none',
        borderBottom: scrolled || !isHome ? '1px solid rgba(255,255,255,0.06)' : 'none',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: 64 }}>

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="الرئيسية">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
          >
            E
          </div>
          <span className="font-black text-lg text-white tracking-tight">
            Inglizi<span style={{ color: '#60a5fa' }}>.com</span>
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1" dir="rtl">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            if (link.cta) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-black text-white transition-all duration-200 active:scale-95"
                  style={{ background: active ? '#1d4ed8' : '#2563eb', boxShadow: '0 2px 12px rgba(37,99,235,0.4)' }}
                >
                  {link.label}
                </Link>
              )
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: active ? '#60a5fa' : 'rgba(255,255,255,0.75)',
                  background: active ? 'rgba(96,165,250,0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop right: CTA ────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center">
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}
          >
            ابدأ الآن 🚀
          </Link>
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────────────── */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 520 : 0, opacity: open ? 1 : 0 }}
      >
        <div
          className="mx-4 mb-4 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}
        >
          <nav className="p-3 flex flex-col gap-1" dir="rtl">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              if (link.cta) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center px-4 py-3.5 rounded-xl text-base font-black text-white"
                    style={{ background: '#2563eb' }}
                  >
                    🎯 {link.label}
                  </Link>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3.5 rounded-xl text-base font-semibold transition-colors"
                  style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.75)', background: active ? 'rgba(96,165,250,0.08)' : 'transparent' }}
                >
                  {link.label}
                </Link>
              )
            })}

            <div className="pt-2 pb-1 px-1">
              <Link
                href="/onboarding"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-base font-black text-white"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
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
