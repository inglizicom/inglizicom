'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/** teacher.inglizi.com sign-in.
 *  Teachers get an email + password created by the founder — there is no
 *  self-signup, on purpose. */
export default function TeacherLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/teacher')
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) return

    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    })
    setBusy(false)

    if (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      setPassword('')
      return
    }
    router.replace('/teacher')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F4EF] font-sans flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-[24px] font-black tracking-tight text-stone-900">فضاء الأساتذة</h1>
          <p className="text-stone-500 text-[13.5px] font-semibold mt-1">
            سجّل الدخول بالحساب الذي أنشأته لك الإدارة.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-[0_1px_2px_rgba(28,25,23,.05)] space-y-4">
          <label className="block">
            <span className="block text-[12px] font-black text-stone-500 mb-1.5">البريد الإلكتروني</span>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                dir="ltr" autoComplete="email" required
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-stone-300 text-[14px] font-semibold text-left
                           focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
                placeholder="teacher@inglizi.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-[12px] font-black text-stone-500 mb-1.5">كلمة المرور</span>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                dir="ltr" autoComplete="current-password" required
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-stone-300 text-[14px] font-semibold text-left
                           focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-black hover:bg-stone-800 transition disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            دخول
          </button>
        </form>

        <p className="text-center text-[12px] text-stone-400 font-semibold mt-5">
          لا تملك حساباً؟ تواصل مع الإدارة — الحسابات تُنشأ يدوياً.
        </p>
      </div>
    </div>
  )
}
