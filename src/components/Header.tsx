'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, BookOpen, Instagram, Youtube } from 'lucide-react'

// TikTok icon as inline SVG (not in lucide-react)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

const navLinks = [
  { href: '/',           label: 'الرئيسية' },
  { href: '/courses',    label: 'الدورات' },
  { href: '/practice',   label: '🎯 تدرب الآن' },
  { href: '/corrector',  label: 'المصحح' },
  { href: '/live',       label: '🔴 مباشر' },
  { href: '/level-test', label: 'اختبر مستواك' },
  { href: '/blog',       label: 'المدونة' },
  { href: '/about',      label: 'عن المعلم' },
  { href: '/contact',    label: 'تواصل معنا' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg shadow-blue-900/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-brand-500/40 transition-shadow">
            <BookOpen size={22} className="text-white" />
          </div>
          <span
            className={`text-xl font-black tracking-tight transition-colors ${
              scrolled ? 'text-brand-900' : 'text-white'
            }`}
          >
            إنجليزي<span className="text-brand-400">.كوم</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-600'
                    : scrolled
                    ? 'text-gray-700 hover:bg-brand-600/10 hover:text-brand-600'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Right side: Social + CTA ── */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Social Icons */}
          <a
            href="https://www.instagram.com/elqasraouihamza/"
            target="_blank" rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-500 hover:text-pink-500' : 'text-white/70 hover:text-white'}`}
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.tiktok.com/@elqasraouihamza"
            target="_blank" rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-500 hover:text-black' : 'text-white/70 hover:text-white'}`}
            aria-label="TikTok"
          >
            <TikTokIcon size={18} />
          </a>
          <a
            href="https://www.youtube.com/@hamzaelqasraoui"
            target="_blank" rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-500 hover:text-red-600' : 'text-white/70 hover:text-white'}`}
            aria-label="YouTube"
          >
            <Youtube size={18} />
          </a>

          {/* CTA */}
          <Link
            href="/courses"
            className="mr-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-lg hover:shadow-orange-500/40 transition-all duration-300 active:scale-95"
          >
            ابدأ الآن
          </Link>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="فتح القائمة"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white shadow-xl mx-4 mt-2 rounded-2xl p-4 border border-gray-100">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 px-4">
            <a href="https://www.instagram.com/elqasraouihamza/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@elqasraouihamza" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
              <TikTokIcon size={20} />
            </a>
            <a href="https://www.youtube.com/@hamzaelqasraoui" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
              <Youtube size={20} />
            </a>
            <Link
              href="/courses"
              onClick={() => setMenuOpen(false)}
              className="mr-auto bg-orange-500 text-white font-bold py-2 px-5 rounded-xl text-sm"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
