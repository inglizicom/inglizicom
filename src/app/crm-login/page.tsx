'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Shield, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/** Shared founder account — the access-code box signs in as this account,
 *  using whatever code is typed as its password. */
const CRM_ADMIN_EMAIL = 'crm-admin@inglizi.com'

/** CRM access gate.
 *  - Founders use the quick access-code box (signs in as the shared crm-admin).
 *  - Assistants toggle to "Sign in with email" and use the email + password
 *    they were given. StaffGuard then routes them into /sales. */
function CrmAccessInner() {
  const router   = useRouter()
  const params   = useSearchParams()
  const next     = params.get('next') || '/sales'

  const [mode, setMode]         = useState<'code' | 'email'>('code')
  const [code, setCode]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  // Already signed in — send to CRM
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next)
    })
  }, [next, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const creds = mode === 'code'
      ? { email: CRM_ADMIN_EMAIL, password: code.trim() }
      : { email: email.trim().toLowerCase(), password }

    if (!creds.password || (mode === 'email' && !creds.email)) return

    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword(creds)
    setBusy(false)

    if (err) {
      setError(mode === 'code'
        ? 'Incorrect access code. Try again.'
        : 'Incorrect email or password. Try again.')
      if (mode === 'code') setCode('')
      else setPassword('')
      return
    }
    // Success — navigate into the CRM. StaffGuard handles role-based routing.
    router.replace(next)
  }

  function switchMode(to: 'code' | 'email') {
    setMode(to)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl">
            I
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tight">Inglizi CRM</div>
            <div className="text-zinc-600 text-[11px] uppercase tracking-[0.2em]">internal · staff only</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-6">
            {mode === 'code'
              ? <Shield size={16} className="text-yellow-400" />
              : <Mail size={16} className="text-yellow-400" />}
            <h1 className="text-white font-bold text-[15px]">
              {mode === 'code' ? 'Enter your access code' : 'Sign in with email'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'code' ? (
              <input
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="••••••••••••••••"
                autoFocus
                required
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-center text-xl tracking-[0.3em] placeholder:tracking-normal placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
              />
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@inglizi.com"
                  autoFocus
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                />
              </>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-950 border border-red-900 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-black font-black text-sm hover:bg-yellow-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? 'Verifying…' : 'Enter CRM →'}
            </button>
          </form>

          {/* Mode toggle */}
          <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
            {mode === 'code' ? (
              <button
                onClick={() => switchMode('email')}
                className="text-zinc-400 text-xs hover:text-yellow-400 transition-colors"
              >
                Assistant? <span className="font-semibold underline">Sign in with email</span>
              </button>
            ) : (
              <button
                onClick={() => switchMode('code')}
                className="text-zinc-400 text-xs hover:text-yellow-400 transition-colors"
              >
                Use access code instead
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          admin.inglizi.com · Inglizi internal tools
        </p>
      </div>
    </div>
  )
}

export default function CrmAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CrmAccessInner />
    </Suspense>
  )
}
