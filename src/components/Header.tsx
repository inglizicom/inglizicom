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
  const isHome   = pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  /* On homepage the header starts transparent over the light hero.
     After scroll (or on other pages) it gets a white/frosted look. */
  const solid = scrolled || !isHome

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
      style={{
        background: solid ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: solid ? 'blur(16px)' : 'none',
        borderBottom: solid ? '1px solid #e5e7eb' : 'none',
        boxShadow: solid ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between"
        style={{ height: 64 }}
      >

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
          >
            E
          </div>
          <span
            className="font-extrabold text-lg tracking-tight transition-colors duration-300"
            style={{ color: solid ? '#111827' : '#fff', fontFamily: "'Inter', 'Cairo', sans-serif" }}
          >
            Inglizi<span style={{ color: '#2563eb' }}>.com</span>
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5" dir="rtl">
          {NAV.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            const textColor = solid
              ? (active ? '#2563eb' : '#374151')
              : (active ? '#93c5fd' : 'rgba(255,255,255,0.85)')
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: textColor,
                  background: active ? (solid ? '#eff6ff' : 'rgba(255,255,255,0.1)') : 'transparent',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTA ───────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/onboarding"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
            style={{
              background: '#2563eb',
              boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            ابدأ الآن
          </Link>
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────────────────── */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all"
          style={{
            color: solid ? '#374151' : '#fff',
            background: solid ? '#f3f4f6' : 'rgba(255,255,255,0.12)',
          }}
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 520 : 0, opacity: open ? 1 : 0 }}
      >
        <div
          className="mx-4 mb-4 rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        >
          <nav className="p-3 flex flex-col gap-1" dir="rtl">
            {NAV.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: active ? '#2563eb' : '#374151',
                    background: active ? '#eff6ff' : 'transparent',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="pt-2 pb-1 px-1">
              <Link
                href="/onboarding"
                className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#2563eb', fontFamily: "'Cairo', sans-serif" }}
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
