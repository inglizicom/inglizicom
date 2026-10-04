'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, BellRing, CalendarX2, CheckCheck, ChevronLeft, CircleDollarSign, ClipboardX, FileText, Loader2,
  MessageSquareText, Smartphone, UserPlus, UserX, Wallet, X, type LucideIcon,
} from 'lucide-react'
import {
  accountPushState, countUnread, enableAccountPush, fetchMyNotifications, markRead, timeAgo,
  type AppNotification,
} from '@/lib/notifications'

/**
 * The bell for staff and teachers (062): unread count, the latest
 * notifications, mark-all-read, and "turn on phone notifications" for this
 * device. Polls every minute and when the tab comes back into view.
 * `mapUrl` turns a stored path into this surface's path (the CRM on the admin
 * domain drops the /sales prefix).
 */

const KIND_ICON: Record<string, LucideIcon> = {
  message: MessageSquareText, payment: CircleDollarSign, payment_pending: CircleDollarSign,
  payment_unlinked: CircleDollarSign, payout: Wallet, student_assigned: UserPlus, student_review: UserPlus,
  absence: UserX, session_cancelled: CalendarX2, report_missing: ClipboardX, month_report: FileText, month_note: FileText,
}

export default function NotificationBell({ userId, allHref, mapUrl = u => u }: {
  userId: string
  allHref: string
  mapUrl?: (url: string) => string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[] | null>(null)
  const [unread, setUnread] = useState(0)
  const [push, setPush] = useState<ReturnType<typeof accountPushState>>('unsupported')
  const [pushBusy, setPushBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    setUnread(await countUnread(userId))
  }, [userId])

  useEffect(() => {
    refresh()
    setPush(accountPushState())
    const t = setInterval(refresh, 60_000)
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [refresh])

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) setItems(await fetchMyNotifications(userId, 30))
  }

  async function openItem(n: AppNotification) {
    if (!n.read_at) {
      markRead([n.id])
      setItems(xs => xs?.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? null)
      setUnread(u => Math.max(0, u - 1))
    }
    if (n.url) { setOpen(false); router.push(mapUrl(n.url)) }
  }

  async function readAll() {
    await markRead()
    setItems(xs => xs?.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })) ?? null)
    setUnread(0)
  }

  async function turnOnPush() {
    setPushBusy(true)
    try { await enableAccountPush() } finally { setPush(accountPushState()); setPushBusy(false) }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} aria-label={`الإشعارات${unread ? ` (${unread} جديد)` : ''}`}
        className="relative w-9 h-9 rounded-xl text-[#475569] hover:text-[#1E3A8A] hover:bg-slate-100 flex items-center justify-center transition-colors">
        {unread > 0 ? <BellRing size={18} /> : <Bell size={18} />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9.5px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div dir="rtl" role="dialog" aria-label="الإشعارات"
          className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:left-0 sm:top-auto sm:mt-2 sm:w-[380px] bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
            <div className="font-extrabold text-[14px] text-[#1E3A8A]">الإشعارات</div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={readAll} className="flex items-center gap-1 text-[11.5px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg px-2 py-1">
                  <CheckCheck size={13} /> تحديد الكل كمقروء
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="text-slate-400 hover:text-slate-700 p-1"><X size={16} /></button>
            </div>
          </div>

          <div className="max-h-[min(60vh,440px)] overflow-y-auto">
            {items === null ? (
              <div className="py-10 flex justify-center text-slate-300"><Loader2 className="animate-spin" size={18} /></div>
            ) : items.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-[13px]">لا إشعارات بعد</p>
            ) : items.map(n => {
              const Icon = KIND_ICON[n.kind] ?? Bell
              return (
                <button key={n.id} onClick={() => openItem(n)}
                  className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${n.read_at ? '' : 'bg-blue-50/40'}`}>
                  <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${n.read_at ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-[13px] truncate ${n.read_at ? 'font-semibold text-slate-700' : 'font-extrabold text-[#0F172A]'}`}>{n.title}</span>
                      {!n.read_at && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                    </span>
                    {n.body && <span className="block text-[12px] text-slate-500 leading-relaxed line-clamp-2 break-words">{n.body}</span>}
                    <span className="block text-[10.5px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {push === 'default' && (
            <button onClick={turnOnPush} disabled={pushBusy}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border-t border-amber-100 disabled:opacity-60">
              {pushBusy ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />} فعّل الإشعارات على هذا الجهاز
            </button>
          )}
          <Link href={allHref} onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 py-2.5 text-[12px] font-bold text-blue-700 hover:bg-slate-50 border-t border-slate-100">
            كل الإشعارات والرسائل <ChevronLeft size={13} />
          </Link>
        </div>
      )}
    </div>
  )
}
