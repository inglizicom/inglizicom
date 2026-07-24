'use client'

/**
 * "ثبّت التطبيق" — floating install banner for the student portal.
 *
 * Android/Chrome: captures the browser's `beforeinstallprompt` and triggers the
 * real install dialog. iOS Safari has no prompt API, so we show the two-step
 * "Share → Add to Home Screen" instructions instead. Hidden when the app is
 * already installed (standalone) or after the student dismisses it (remembered
 * for 14 days).
 */

import { useEffect, useState } from 'react'
import { X, Share, PlusSquare, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'inglizi_pwa_dismissed'
const DISMISS_DAYS = 14

type BipEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export default function InstallAppBanner() {
  const [bip, setBip] = useState<BipEvent | null>(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [iosSteps, setIosSteps] = useState(false)

  useEffect(() => {
    // already running as an installed app → nothing to do
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return
    // dismissed recently → stay quiet
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (at && Date.now() - at < DISMISS_DAYS * 86400000) return

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIos(isIos)
    if (isIos) { setShow(true); return }

    const onBip = (e: Event) => { e.preventDefault(); setBip(e as BipEvent); setShow(true) }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  async function install() {
    if (!bip) return
    await bip.prompt()
    const { outcome } = await bip.userChoice
    if (outcome === 'accepted') setShow(false)
    else dismiss()
  }

  if (!show) return null

  return (
    <div dir="rtl" className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:w-[360px] z-[90]">
      <div className="rounded-2xl bg-zinc-900 text-white shadow-2xl shadow-black/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-yellow-400 text-zinc-900 flex items-center justify-center">
            <Smartphone size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[14px]">ثبّت تطبيق Inglizi 📲</div>
            <div className="text-[12px] text-white/60 leading-relaxed mt-0.5">
              افتح دروسك بضغطة واحدة من شاشتك الرئيسية — بدون متصفح.
            </div>
          </div>
          <button onClick={dismiss} aria-label="إغلاق" className="text-white/40 hover:text-white transition shrink-0"><X size={16} /></button>
        </div>

        {ios ? (
          iosSteps ? (
            <div className="mt-3 rounded-xl bg-white/10 p-3 text-[12px] leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2"><Share size={14} className="text-yellow-400 shrink-0" /> 1. اضغط زر «المشاركة» في شريط سفاري</div>
              <div className="flex items-center gap-2"><PlusSquare size={14} className="text-yellow-400 shrink-0" /> 2. اختر «إضافة إلى الشاشة الرئيسية»</div>
            </div>
          ) : (
            <button onClick={() => setIosSteps(true)} className="mt-3 w-full rounded-xl bg-yellow-400 text-zinc-900 font-black text-[13px] py-2.5 hover:bg-yellow-300 transition">
              كيف أثبّته؟
            </button>
          )
        ) : (
          <button onClick={install} className="mt-3 w-full rounded-xl bg-yellow-400 text-zinc-900 font-black text-[13px] py-2.5 hover:bg-yellow-300 transition">
            تثبيت التطبيق
          </button>
        )}
      </div>
    </div>
  )
}
