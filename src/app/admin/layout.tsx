import Link from 'next/link'
import { Shield, LayoutDashboard, FileEdit } from 'lucide-react'

const navItems = [
  { href: '/admin',         label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content Studio',  icon: FileEdit },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="ltr">

      {/* ── Admin header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-black text-gray-900 text-base tracking-tight">Admin Panel</span>
          <span className="hidden sm:block text-gray-300 text-xs font-medium ml-1">· إنجليزي.كوم</span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Back to site */}
        <Link
          href="/"
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300"
        >
          ← Back to site
        </Link>
      </header>

      {/* ── Page content ── */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
