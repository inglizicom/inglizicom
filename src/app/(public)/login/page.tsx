'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/map'
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()

  const [mode, setMode]         = useState<'signin' | 'signup'>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [err, setErr]           = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, router, next])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    const { error } = mode === 'signin'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, fullName || undefined)
    setBusy(false)
    if (error) setErr(error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-[110px] pb-16"
      style={{ background:'linear-gradient(160deg,#060d1a 0%,#0a1120 50%,#070e1c 100%)' }}>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇲🇦</div>
          <h1 className="text-white font-black text-2xl mb-1" dir="rtl">
            {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </h1>
          <p className="text-white/40 text-sm" dir="rtl">
            {mode === 'signin' ? 'أكمل رحلتك في تعلم الإنجليزية' : 'ابدأ رحلتك مجاناً'}
          </p>
        </div>

        <div className="rounded-2xl p-5 sm:p-6"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background:'#fff', color:'#1a1a1a' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            <span dir="rtl">{mode === 'signin' ? 'المتابعة باستخدام Google' : 'التسجيل باستخدام Google'}</span>
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.08)' }} />
            <span className="text-white/30 text-xs" dir="rtl">أو</span>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3" dir="rtl">
            {mode === 'signup' && (
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              required
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none text-left"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
              minLength={6}
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none text-left"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}
            />

            {err && (
              <p className="text-red-400 text-xs text-center py-1" dir="rtl">{err}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background:'linear-gradient(90deg,#3b82f6,#2563eb)', color:'#fff' }}
            >
              {busy ? '...' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="text-center mt-5">
            <button
              onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setErr(null) }}
              className="text-white/50 text-xs hover:text-white/80 transition-colors"
              dir="rtl"
            >
              {mode === 'signin' ? 'ليس لديك حساب؟ سجّل الآن' : 'لديك حساب؟ تسجيل الدخول'}
            </button>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-6 w-full text-white/40 text-xs hover:text-white/60 transition-colors"
          dir="rtl"
        >
          ← العودة
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
