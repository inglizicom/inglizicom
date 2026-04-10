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

const ROYAL = '#1d4ed8'
const FONT  = "'Cairo', sans-serif"

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
      style={{
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 50,
        background: ROYAL,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.22)' : '0 1px 12px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.3s ease, height 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 24px',
          height: scrolled ? 58 : 68,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'height 0.3s ease',
        }}
      >

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 900, color: '#fff',
            fontFamily: FONT,
          }}>
            E
          </div>
          <span style={{
            fontWeight: 900, fontSize: '1.1rem',
            color: '#fff', fontFamily: FONT,
            letterSpacing: '-0.01em',
          }}>
            Inglizi<span style={{ color: '#93c5fd' }}>.com</span>
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────── */}
        <nav className="hidden lg:flex" style={{ gap: 2 }} dir="rtl">
          {NAV.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  textDecoration: 'none',
                  fontFamily: FONT,
                  color: active ? '#fff' : 'rgba(255,255,255,0.82)',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  if (!active) {
                    el.style.background = 'rgba(255,255,255,0.12)'
                    el.style.color = '#fff'
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  if (!active) {
                    el.style.background = 'transparent'
                    el.style.color = 'rgba(255,255,255,0.82)'
                  }
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTA ───────────────────────────────────── */}
        <div className="hidden lg:flex">
          <Link
            href="/onboarding"
            style={{
              padding: '9px 24px',
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 800,
              textDecoration: 'none',
              fontFamily: FONT,
              background: '#fff',
              color: ROYAL,
              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'scale(1.05)'
              el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'none'
              el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)'
            }}
          >
            ابدأ الآن
          </Link>
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────── */}
        <button
          className="lg:hidden"
          style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            transition: 'background 0.15s',
          }}
          onClick={() => setOpen(o => !o)}
          aria-label="القائمة"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <div
        className="lg:hidden"
        style={{
          overflow: 'hidden',
          maxHeight: open ? 520 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-height 0.32s ease, opacity 0.28s ease',
        }}
      >
        <div style={{ margin: '0 16px 16px', borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>
          <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }} dir="rtl">
            {NAV.map(link => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 12,
                    fontSize: '0.92rem',
                    fontWeight: active ? 700 : 500,
                    textDecoration: 'none',
                    fontFamily: FONT,
                    color: active ? ROYAL : '#374151',
                    background: active ? '#eff6ff' : 'transparent',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
            <div style={{ padding: '8px 4px 4px' }}>
              <Link
                href="/onboarding"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '14px',
                  borderRadius: 14, fontSize: '0.95rem',
                  fontWeight: 800, textDecoration: 'none',
                  fontFamily: FONT,
                  background: ROYAL, color: '#fff',
                  boxShadow: `0 4px 16px rgba(29,78,216,0.35)`,
                }}
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
