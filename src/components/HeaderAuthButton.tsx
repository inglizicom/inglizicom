'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function HeaderAuthButton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (loading) {
    return (
      <div className={variant === 'desktop'
        ? 'w-10 h-10 flex items-center justify-center text-white/50'
        : 'w-full py-3 flex items-center justify-center text-gray-400'}>
        <Loader2 size={16} className="animate-spin" />
      </div>
    )
  }

  if (!user) {
    if (variant === 'mobile') {
      return (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-bold no-underline border border-brand-700 text-brand-700 bg-white"
        >
          <LogIn size={16} />
          تسجيل الدخول
        </Link>
      )
    }
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold no-underline border border-white/30 text-white hover:bg-white/10 transition-colors"
      >
        <LogIn size={14} />
        تسجيل الدخول
      </Link>
    )
  }

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || ''
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const initial = (name || 'U').trim().charAt(0).toUpperCase()

  if (variant === 'mobile') {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-bold border border-gray-200 text-gray-700 bg-white"
      >
        <LogOut size={16} />
        تسجيل الخروج
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pr-2 pl-1 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
        aria-label="القائمة"
      >
        {avatar ? (
          <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/30 text-white font-black text-sm flex items-center justify-center">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 left-0 min-w-[220px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden z-50"
          dir="rtl"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-gray-900 text-sm font-bold truncate">{name}</p>
            {user.email && name !== user.email && (
              <p className="text-gray-400 text-xs truncate" dir="ltr">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={14} />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  )
}
