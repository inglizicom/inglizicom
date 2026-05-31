'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { StaffContext, type StaffProfile } from '@/lib/staff-context'

type State = 'checking' | 'allowed' | 'denied' | 'unauthenticated'

/** Shared auth gate.
 *
 * Modes:
 *   - 'staff'  — allow founder OR assistant (used by /sales/*)
 *   - 'founder' — allow founder only (used by /admin/*)
 *
 * If a non-founder hits a 'founder'-only area, they are redirected to /sales
 * instead of seeing an access-denied screen, which is friendlier for daily
 * use. Founders denied for any reason still get the diagnostic screen.
 *
 * Exposes the resolved profile via StaffContext for nested pages. */
export default function StaffGuard({
  children, mode = 'staff', loginNext,
}: {
  children:    React.ReactNode
  mode?:       'staff' | 'founder'
  loginNext?:  string
}) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [state, setState] = useState<State>('checking')
  const [staff, setStaff] = useState<StaffProfile | null>(null)
  const [diag, setDiag]   = useState<{ userId?: string; email?: string; role?: string; isAdmin?: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) { setState('unauthenticated'); return }
    let cancelled = false
    supabase
      .from('profiles')
      .select('id, email, is_admin, role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        const role: StaffProfile['role'] = (data?.role as any) ?? 'student'
        const isAdmin = !!data?.is_admin
        // is_admin=true users without an explicit role count as founders.
        const effectiveRole: StaffProfile['role'] =
          role === 'student' && isAdmin ? 'founder' : role
        const isFounder   = effectiveRole === 'founder'
        const isStaff     = isFounder || effectiveRole === 'assistant'

        setDiag({ userId: user.id, email: user.email ?? undefined, role: effectiveRole, isAdmin, error: error?.message })

        if (mode === 'founder' && !isFounder) {
          // Assistant trying to hit /admin/* — kick them to the sales workspace.
          if (isStaff) {
            router.replace('/sales')
            return
          }
          setState('denied'); return
        }
        if (mode === 'staff' && !isStaff) {
          setState('denied'); return
        }

        setStaff({
          id:      user.id,
          email:   user.email ?? null,
          role:    effectiveRole,
          isAdmin,
        })
        setState('allowed')
      })
    return () => { cancelled = true }
  }, [user, loading, mode, router])

  useEffect(() => {
    if (state === 'unauthenticated') {
      // On admin.inglizi.com, redirect to the dedicated CRM login page
      // (avoids the infinite-loop issue where /sales/login is inside the
      //  StaffGuard-protected /sales/ route group).
      const host = typeof window !== 'undefined' ? window.location.hostname : ''
      const isAdminDomain = host === 'admin.inglizi.com' || host.startsWith('admin.localhost')
      const loginPath = isAdminDomain
        ? '/crm-login?next=' + encodeURIComponent(loginNext ?? '/sales')
        : '/login?next=' + encodeURIComponent(loginNext ?? '/sales')
      router.replace(loginPath)
    }
  }, [state, router, loginNext])

  if (state === 'checking' || state === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-semibold">Checking access…</span>
        </div>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldAlert size={26} className="text-red-500" />
            </div>
            <h1 className="text-gray-900 font-black text-lg mb-1">Access denied</h1>
            <p className="text-gray-500 text-sm mb-5">
              {mode === 'founder'
                ? 'This area is for the founder only.'
                : 'This area is for Inglizi staff only.'}
            </p>
          </div>

          {diag && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-xs font-mono text-gray-700 space-y-1">
              <div className="font-bold text-gray-900 mb-2 text-sm">Debug info</div>
              <div><span className="text-gray-400">User ID:</span> {diag.userId}</div>
              <div><span className="text-gray-400">Email:</span> {diag.email || '—'}</div>
              <div><span className="text-gray-400">Role:</span> {diag.role}</div>
              <div><span className="text-gray-400">is_admin:</span> {String(diag.isAdmin)}</div>
              {diag.error && <div className="text-red-600">Error: {diag.error}</div>}
              <div className="pt-2 mt-2 border-t border-gray-200 text-[11px] text-gray-500 font-sans">
                Run in the SQL editor:<br />
                <code className="text-[11px] text-gray-700">update profiles set role = &apos;assistant&apos; where id = &apos;{diag.userId}&apos;;</code>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => router.replace('/')}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Back to site
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StaffContext.Provider value={staff}>
      {children}
    </StaffContext.Provider>
  )
}
