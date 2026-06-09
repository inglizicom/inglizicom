'use client'

import { Bell, MessageSquare, Calendar, ChevronLeft } from 'lucide-react'

interface Props {
  title:        string
  breadcrumb?:  string[]          // e.g. ['لوحة التحكم', 'التقارير']
  userEmail?:   string | null
  roleLabel?:   string
  notifCount?:  number
}

export default function CrmTopHeader({ title, breadcrumb, userEmail, roleLabel, notifCount }: Props) {
  const name = userEmail?.split('@')[0] ?? '—'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/80 h-16 flex items-center justify-between px-4 lg:px-6 pr-16 lg:pr-6">

      {/* Right (start): title + breadcrumb */}
      <div className="min-w-0">
        <h1 className="text-[18px] lg:text-[20px] font-black text-zinc-900 leading-tight truncate">{title}</h1>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 text-[12px] text-zinc-400 mt-0.5">
            {breadcrumb.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft size={12} className="text-zinc-300" />}
                <span className={i === breadcrumb.length - 1 ? 'text-zinc-600 font-medium' : ''}>{c}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Left (end): icons + profile */}
      <div className="flex items-center gap-1.5 lg:gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          <IconBtn count={notifCount}><Bell size={18} /></IconBtn>
          <IconBtn><MessageSquare size={18} /></IconBtn>
          <IconBtn><Calendar size={18} /></IconBtn>
        </div>

        <div className="w-px h-8 bg-zinc-200 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="text-left hidden sm:block leading-tight">
            <div className="text-[13px] font-bold text-zinc-900">{name}</div>
            {roleLabel && <div className="text-[11px] text-zinc-400">{roleLabel}</div>}
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-900 text-yellow-400 flex items-center justify-center font-black text-sm flex-shrink-0">
            {(name[0] ?? '?').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

function IconBtn({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <button className="relative w-9 h-9 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 flex items-center justify-center transition-colors">
      {children}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}
