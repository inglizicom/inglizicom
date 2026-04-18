'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const next = params.get('next') || '/map'
    // supabase-js auto-detects the code in the URL (detectSessionInUrl: true).
    // Wait for the session to land, then redirect.
    let tries = 0
    const iv = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      tries++
      if (data.session) {
        clearInterval(iv)
        router.replace(next)
      } else if (tries > 20) {
        clearInterval(iv)
        router.replace('/login')
      }
    }, 150)
    return () => clearInterval(iv)
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(160deg,#060d1a 0%,#0a1120 50%,#070e1c 100%)' }}>
      <p className="text-white/60 text-sm" dir="rtl">جاري تسجيل الدخول...</p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}
