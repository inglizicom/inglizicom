import Link from 'next/link'
import { Instagram, Youtube, Mail } from 'lucide-react'
import { Logo } from './Header'

/**
 * A short footer: who we are, the pages people look for, how to reach us.
 * On a phone it used to be two full screens of links (including five course
 * names that did not exist); now it fits in one.
 */

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

const LINKS = [
  { href: '/courses',    label: 'الدورة' },
  { href: '/classes',    label: 'الحصص الخاصة' },
  { href: '/business',   label: 'الإنجليزية المهنية' },
  { href: '/pricing',    label: 'الأسعار' },
  { href: '/level-test', label: 'اختبر مستواك' },
  { href: '/faq',        label: 'الأسئلة الشائعة' },
  { href: '/blog',       label: 'المدونة' },
  { href: '/about',      label: 'من نحن' },
  { href: '/contact',    label: 'تواصل معنا' },
]

const SOCIAL = [
  { href: 'https://www.instagram.com/elqasraouihamza/', label: 'Instagram', icon: <Instagram size={18} /> },
  { href: 'https://www.tiktok.com/@elqasraouihamza',    label: 'TikTok',    icon: <TikTokIcon /> },
  { href: 'https://www.youtube.com/@hamzaelqasraoui',   label: 'YouTube',   icon: <Youtube size={18} /> },
]

export default function Footer() {
  return (
    <footer dir="rtl" className="bg-brand-950 text-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pt-12 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="lg:w-[320px] shrink-0">
            <Link href="/" className="no-underline inline-block"><Logo onDark /></Link>
            <p className="text-blue-100/70 text-[14px] leading-relaxed mt-4">
              تعلّم الإنجليزية بالمحادثة والنطق، بشرح عربي ومتابعة شخصية من الأستاذ حمزة القصراوي.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="روابط الموقع" className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 content-start">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-[14px] text-blue-100/75 hover:text-white no-underline transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-2.5 text-[14px]">
            <a href="https://wa.me/212764189311" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-100/75 hover:text-white no-underline">
              <span className="font-bold text-white">واتساب</span> <span dir="ltr">+212 764 189 311</span>
            </a>
            <a href="mailto:hamza@inglizi.com" className="flex items-center gap-2 text-blue-100/75 hover:text-white no-underline">
              <Mail size={15} /> hamza@inglizi.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[13px] text-blue-100/55">
          <p>© {new Date().getFullYear()} إنجليزي.كوم — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white no-underline">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-white no-underline">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
