'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { TeacherContext, type TeacherSession } from '@/lib/teacher-context'
import { ensureTeacherProfile, fetchTeacherProfile, type TeacherProfile } from '@/lib/teachers'

type State = 'checking' | 'allowed' | 'denied' | 'unauthenticated'

/** Gate for teachers.inglizi.com.
 *
 *  Allows role = 'teacher'. Founders are allowed through as a *preview* so the
 *  owner can see what a teacher sees — they get no teacher rows, because every
 *  RPC underneath filters on auth.uid(). Assistants are turned away: the teacher
 *  space is not a second CRM. */
export default function TeacherGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [state, setState]     = useState<State>('checking')
  const [session, setSession] = useState<TeacherSession | null>(null)
  const [role, setRole]       = useState<string>('')

  const load = useCallback(async (): Promise<TeacherProfile | null> => {
    if (!user) return null
    return fetchTeacherProfile(user.id)
  }, [user])

  useEffect(() => {
    if (loading) return
    if (!user) { setState('unauthenticated'); return }
    let cancelled = false

    ;(async () => {
      const { data } = await supabase
        .from('profiles').select('id, email, full_name, role, is_admin')
        .eq('id', user.id).maybeSingle()
      if (cancelled) return

      const resolved  = (data?.role as string) ?? 'student'
      const isFounder = resolved === 'founder' || (!!data?.is_admin && resolved === 'student')
      const isTeacher = resolved === 'teacher'
      setRole(resolved)

      if (!isTeacher && !isFounder) { setState('denied'); return }

      // A teacher opening the space for the first time gets a profile row created.
      const profile = isTeacher
        ? await ensureTeacherProfile(user.id, data?.full_name ?? null)
        : await fetchTeacherProfile(user.id)
      if (cancelled) return

      setSession({
        id:        user.id,
        email:     user.email ?? null,
        fullName:  data?.full_name ?? null,
        profile,
        isPreview: !isTeacher,
        refresh:   async () => {
          const fresh = await load()
          setSession(prev => (prev ? { ...prev, profile: fresh } : prev))
        },
      })
      setState('allowed')
    })()

    return () => { cancelled = true }
  }, [user, loading, load])

  useEffect(() => {
    if (state === 'unauthenticated') router.replace('/teacher/login')
  }, [state, router])

  if (state === 'checking' || state === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="flex items-center gap-3 text-stone-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-semibold">Opening your space…</span>
        </div>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <ShieldAlert size={26} className="text-red-500" />
          </div>
          <h1 className="text-stone-900 font-black text-lg mb-1">This space is for teachers</h1>
          <p className="text-stone-500 text-sm mb-6">
            Your account is signed in as <span className="font-semibold text-stone-700">{role}</span>.
            Ask the founder to give you a teaching account.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace('/teacher/login') }}
            className="w-full px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition"
          >
            Sign in with another account
          </button>
        </div>
      </div>
    )
  }

  return (
    <TeacherContext.Provider value={session}>
      {session?.isPreview && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-[13px] font-semibold px-4 py-2 flex items-center justify-center gap-2">
          <GraduationCap size={15} />
          Founder preview — you are seeing the teacher space, not a teacher&apos;s data.
        </div>
      )}
      {children}
    </TeacherContext.Provider>
  )
}
