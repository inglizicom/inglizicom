import Link from 'next/link'
import { BookOpen, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react'

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

const quickLinks = [
  { href: '/',           label: 'الرئيسية' },
  { href: '/courses',    label: 'الدورات' },
  { href: '/level-test', label: 'اختبر مستواك' },
  { href: '/blog',       label: 'المدونة' },
  { href: '/about',      label: 'من نحن' },
  { href: '/contact',    label: 'تواصل معنا' },
  { href: '/privacy',    label: 'سياسة الخصوصية' },
  { href: '/terms',      label: 'شروط الاستخدام' },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">

      {/* ── Main Footer Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-300 rounded-xl flex items-center justify-center">
                <BookOpen size={22} className="text-white" />
              </div>
              <span className="text-xl font-black">
                إنجليزي<span className="text-brand-300">.كوم</span>
              </span>
            </Link>
            <p className="text-blue-200/80 text-sm leading-relaxed mb-6">
              منصة تعليمية متخصصة في تعليم اللغة الإنجليزية للمتحدثين بالعربية، مع التركيز على التواصل والنطق الصحيح.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/elqasraouihamza/"
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@elqasraouihamza"
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
              </a>
              <a
                href="https://www.youtube.com/@hamzaelqasraoui"
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-200/70 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 group-hover:bg-orange-400 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white">دوراتنا</h3>
            <ul className="space-y-3">
              {[
                'دورة المبتدئين من الصفر',
                'دورة التواصل اليومي',
                'دورة النطق والتحدث',
                'الإعداد للمقابلات',
                'اللغة الإنجليزية للسفر',
              ].map((course) => (
                <li key={course}>
                  <Link
                    href="/courses"
                    className="text-blue-200/70 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 group-hover:bg-orange-400 transition-colors"></span>
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white">تواصل معنا</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/212707902091"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors flex-shrink-0">
                    <Phone size={16} className="text-green-400 group-hover:text-white" />
                  </div>
                  <span className="text-sm" dir="ltr">+212 707 902 091</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hamza@inglizi.com"
                  className="flex items-center gap-3 text-blue-200/70 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 bg-brand-400/20 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors flex-shrink-0">
                    <Mail size={16} className="text-brand-300 group-hover:text-white" />
                  </div>
                  <span className="text-sm">hamza@inglizi.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-blue-200/70">
                  <div className="w-9 h-9 bg-orange-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-orange-300" />
                  </div>
                  <span className="text-sm">المملكة المغربية 🇲🇦</span>
                </div>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/212707902091"
              target="_blank" rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-green-500/40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              راسلنا على واتساب
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-200/60 text-sm">
            © {new Date().getFullYear()} إنجليزي.كوم — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-blue-200/60 text-sm hover:text-white transition-colors">من نحن</Link>
            <span className="text-white/20">|</span>
            <Link href="/privacy" className="text-blue-200/60 text-sm hover:text-white transition-colors">سياسة الخصوصية</Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="text-blue-200/60 text-sm hover:text-white transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
