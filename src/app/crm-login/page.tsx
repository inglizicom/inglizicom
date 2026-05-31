'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/** CRM access gate — single secret code, no email visible.
 *  The code is the Supabase password for the shared crm-admin account. */
function CrmAccessInner() {
  const router   = useRouter()
  const params   = useSearchParams()
  const next     = params.get('next') || '/sales'

  const [code, setCode]   = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy]   = useState(false)

  // Already signed in — send to CRM
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next)
    })
  }, [next, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setError(null)
    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email:    'crm-admin@inglizi.com',
      password: code.trim(),
    })
    setBusy(false)
    if (err) {
      setError('Incorrect access code. Try again.')
      setCode('')
    }
    // Session listener in auth-context will trigger the redirect
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
            <Shield size={16} className="text-yellow-400" />
            <h1 className="text-white font-bold text-[15px]">Enter your access code</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="••••••••••••••••"
              autoFocus
              required
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-center text-xl tracking-[0.3em] placeholder:tracking-normal placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
            />

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-950 border border-red-900 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-black font-black text-sm hover:bg-yellow-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? 'Verifying…' : 'Enter CRM →'}
            </button>
          </form>
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
