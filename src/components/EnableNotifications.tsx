'use client'

/**
 * "فعّل الإشعارات" — asks the student to turn on app notifications (like
 * Duolingo). On Android/desktop it triggers the browser permission dialog and
 * saves the subscription linked to the student's token. On iOS, push only works
 * in the INSTALLED app, so before install we quietly stay hidden (the install
 * banner handles that first).
 *
 * `token` is the student's verification_token so the server can target them by
 * level / subscription date.
 */

import { useEffect, useState } from 'react'
import { Bell, X, Loader2, Check } from 'lucide-react'
import { pushSupported, subscribeToPush } from '@/lib/push'

const DISMISS_KEY = 'inglizi_push_dismissed'
const DISMISS_DAYS = 10

export default function EnableNotifications({ token }: { token?: string }) {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!pushSupported()) return
    if (Notification.permission === 'granted') return          // already on
    if (Notification.permission === 'denied') return           // blocked → don't nag
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (at && Date.now() - at < DISMISS_DAYS * 86400000) return
    // iOS: push works only in the installed app — skip until standalone
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true
    if (isIos && !standalone) return
    const t = setTimeout(() => setShow(true), 4000)            // let the portal settle first
    return () => clearTimeout(t)
  }, [])

  function dismiss() { localStorage.setItem(DISMISS_KEY, String(Date.now())); setShow(false) }

  async function enable() {
    setBusy(true)
    try {
      const sub = await subscribeToPush()
      if (!sub) { setBusy(false); dismiss(); return }
      await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), token }),
      })
      setDone(true)
      setTimeout(() => setShow(false), 1800)
    } catch { dismiss() }
    setBusy(false)
  }

  if (!show) return null

  return (
    <div dir="rtl" className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-[360px] z-[95]">
      <div className="rounded-2xl bg-white ring-1 ring-zinc-200 shadow-2xl shadow-black/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-yellow-400 text-zinc-900 flex items-center justify-center">
            {done ? <Check size={22} strokeWidth={3} /> : <Bell size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[14px] text-zinc-900">{done ? 'تم التفعيل! 🎉' : 'فعّل إشعارات التطبيق 🔔'}</div>
            <div className="text-[12px] text-zinc-500 leading-relaxed mt-0.5">
              {done ? 'ستصلك تذكيرات دروسك وأخبار جديدة.' : 'تذكيرات يومية، تصحيح واجباتك، ومواعيد اللايف — تصلك حتى وأنت خارج التطبيق.'}
            </div>
          </div>
          {!done && <button onClick={dismiss} aria-label="إغلاق" className="text-zinc-300 hover:text-zinc-600 transition shrink-0"><X size={16} /></button>}
        </div>
        {!done && (
          <button onClick={enable} disabled={busy}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-black text-[13px] py-2.5 hover:bg-zinc-800 transition disabled:opacity-50">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />} تفعيل الإشعارات
          </button>
        )}
      </div>
    </div>
  )
}
