'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { StaffContext, type StaffProfile } from './StaffContext'

type State = 'checking' | 'allowed' | 'denied' | 'unauthenticated'

interface Diag {
  userId?:    string
  userEmail?: string
  rowFound:   boolean
  isAdmin?:   boolean
  role?:      string
  error?:     string
}

/**
 * Gate for /admin/*. Allows access when EITHER:
 *   - profiles.is_admin = true (legacy founder flag), OR
 *   - profiles.role IN ('founder', 'assistant') (new CRM role enum)
 *
 * Exposes the resolved profile via <StaffContext.Provider> so nested pages
 * can render different UI for founders vs assistants without re-querying.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [state, setState] = useState<State>('checking')
  const [diag, setDiag]   = useState<Diag | null>(null)
  const [staff, setStaff] = useState<StaffProfile | null>(null)

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
        const allowed = !!data && (data.is_admin === true || role === 'founder' || role === 'assistant')
        setDiag({
          userId:    user.id,
          userEmail: user.email ?? undefined,
          rowFound:  !!data,
          isAdmin:   data?.is_admin,
          role,
          error:     error?.message,
        })
        if (allowed) {
          setStaff({
            id:      user.id,
            email:   user.email ?? null,
            // is_admin=true users without a role are treated as founders
            role:    role === 'student' && data.is_admin ? 'founder' : role,
            isAdmin: !!data.is_admin,
          })
          setState('allowed')
        } else {
          setState('denied')
        }
      })
    return () => { cancelled = true }
  }, [user, loading])

  useEffect(() => {
    if (state === 'unauthenticated') router.replace('/login?next=/admin')
  }, [state, router])

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
            <p className="text-gray-500 text-sm mb-5">This area is for Inglizi staff only.</p>
          </div>

          {diag && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-xs font-mono text-gray-700 space-y-1">
              <div className="font-bold text-gray-900 mb-2 text-sm">Debug info</div>
              <div><span className="text-gray-400">User ID:</span> {diag.userId}</div>
              <div><span className="text-gray-400">Email:</span> {diag.userEmail || '—'}</div>
              <div><span className="text-gray-400">Profile row exists:</span> {diag.rowFound ? '✅ yes' : '❌ no'}</div>
              <div><span className="text-gray-400">is_admin:</span> {diag.rowFound ? String(diag.isAdmin) : '—'}</div>
              <div><span className="text-gray-400">role:</span> {diag.role ?? '—'}</div>
              {diag.error && <div className="text-red-600"><span className="text-gray-400">Error:</span> {diag.error}</div>}
              <div className="pt-2 mt-2 border-t border-gray-200 text-[11px] text-gray-500 font-sans">
                Run in the SQL editor:<br />
                <code className="text-[11px] text-gray-700">update profiles set role = &apos;founder&apos; where id = &apos;{diag.userId}&apos;;</code>
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
