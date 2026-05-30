'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

/**
 * CRM-specific login page — served at admin.inglizi.com/login.
 * Uses email/password only (no Google OAuth) so it works on any domain
 * without needing Supabase redirect URL configuration.
 * Black + yellow brand matching the CRM sidebar.
 */
function CrmLoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading, signInWithEmail } = useAuth()

  const next = params.get('next') || '/sales'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  // Already logged in → go to CRM
  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [user, loading, router, next])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error: err } = await signInWithEmail(email.trim(), password)
    setBusy(false)
    if (err) {
      // Friendlier messages for common errors
      if (err.includes('Invalid login')) {
        setError('Wrong email or password. Check and try again.')
      } else if (err.includes('Email not confirmed')) {
        setError('Please confirm your email address first.')
      } else {
        setError(err)
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[420px] flex-col items-start justify-between p-12 border-r border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg">
            I
          </div>
          <div>
            <div className="font-black text-white text-lg tracking-tight">Inglizi CRM</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">admin.inglizi.com</div>
          </div>
        </div>

        <div>
          <blockquote className="text-zinc-400 text-base leading-relaxed mb-8 max-w-xs">
            "Track every lead, every follow-up, every payment — from first contact to enrolled student."
          </blockquote>
          <div className="space-y-3">
            {['Lead pipeline & Kanban', 'Student management', 'Revenue tracking', 'Daily task workspace'].map(f => (
              <div key={f} className="flex items-center gap-2 text-zinc-500 text-sm">
                <ShieldCheck size={14} className="text-yellow-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="text-zinc-700 text-xs">© Inglizi.com · Internal use only</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg">
              I
            </div>
            <div className="font-black text-white text-lg">Inglizi CRM</div>
          </div>

          <h1 className="text-white font-black text-2xl tracking-tight mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in to your CRM workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-950 border border-red-900 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy || !email || !password}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-black font-black text-sm hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to CRM →'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://inglizi.com"
              className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
            >
              ← Back to inglizi.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CrmLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CrmLoginInner />
    </Suspense>
  )
}
