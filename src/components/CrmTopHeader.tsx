'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronDown, Menu, Search, X } from 'lucide-react'
import ProfileModal from './ProfileModal'
import LeadsBell from './LeadsBell'
import CrmSearch from './crm/CrmSearch'
import NotificationBell from './notifications/NotificationBell'

/**
 * The CRM header: where you are (title + breadcrumb), the search that finds
 * anyone, new-lead alerts, and you. On the phone the search folds into an icon
 * that opens a full-width row, and the menu button opens the nav drawer.
 */
interface Props {
  title:        string
  breadcrumb?:  string[]          // e.g. ['لوحة التحكم', 'التقارير']
  userEmail?:   string | null
  roleLabel?:   string
  notifCount?:  number
  base?:        string
  /** The signed-in staff member — for the notifications bell (062). */
  userId?:      string
  onSignOut?:   () => void
  onMenu?:      () => void
}

export default function CrmTopHeader({ title, breadcrumb, userEmail, roleLabel, base = '/sales', userId, onSignOut, onMenu }: Props) {
  const name = userEmail?.split('@')[0] ?? '—'
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0]">
      <div className="h-16 px-4 lg:px-8 flex items-center gap-3">
        {onMenu && (
          <button onClick={onMenu} aria-label="القائمة"
                  className="lg:hidden -mr-1 w-9 h-9 rounded-full flex items-center justify-center text-[#475569] hover:bg-slate-100 shrink-0">
            <Menu size={20} />
          </button>
        )}

        {/* Where you are */}
        <div className="min-w-0 lg:w-[260px] xl:w-[300px] shrink lg:shrink-0">
          <h1 className="text-[16px] lg:text-[18px] font-extrabold tracking-tight text-[#1E3A8A] leading-tight truncate">{title}</h1>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11.5px] font-semibold text-[#94A3B8] mt-0.5 min-w-0">
              {breadcrumb.map((c, i) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronLeft size={12} className="text-[#CBD5E1] shrink-0" />}
                  <span className={`truncate ${i === breadcrumb.length - 1 ? 'text-[#475569]' : ''}`}>{c}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Search (md+) */}
        <div className="hidden md:block flex-1 max-w-[520px] mx-auto">
          <CrmSearch base={base} />
        </div>
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button onClick={() => setSearchOpen(v => !v)} aria-label="بحث"
                  className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#475569] hover:bg-slate-100">
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          {userId && (
            <NotificationBell userId={userId} allHref={`${base}/notifications`}
              mapUrl={u => (u.startsWith('/sales') ? base + u.slice('/sales'.length) : u) || '/'} />
          )}
          <LeadsBell base={base} />
          <span className="hidden sm:block w-px h-8 bg-[#E2E8F0] mx-1" />
          <button onClick={() => setProfileOpen(true)} title="الملف الشخصي"
                  className="flex items-center gap-2.5 pr-1 pl-1 sm:pl-2 py-1 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-[14px] shrink-0 shadow-sm shadow-blue-700/30">
              {(name[0] ?? '?').toUpperCase()}
            </span>
            <span className="hidden sm:block text-right leading-tight">
              <span className="block text-[13px] font-bold text-[#1E3A8A] max-w-[140px] truncate">{name}</span>
              {roleLabel && <span className="block text-[11px] font-semibold text-[#64748B]">{roleLabel}</span>}
            </span>
            <ChevronDown size={14} className="hidden sm:block text-[#94A3B8]" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <CrmSearch base={base} autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        email={userEmail}
        roleLabel={roleLabel ?? ''}
        onSignOut={onSignOut}
      />
    </header>
  )
}
