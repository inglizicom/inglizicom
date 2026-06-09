'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, X, ChevronLeft } from 'lucide-react'
import { fetchRecentLeads, type SubscriptionLead } from '@/lib/leads-db'
import { getLeadsSeenAt, markLeadsSeen, LEADS_SEEN_EVENT } from '@/lib/leads-seen'
import Avatar from '@/app/sales/_components/Avatar'

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1)  return 'الآن'
  if (mins < 60) return `قبل ${mins} د`
  const h = Math.floor(mins / 60)
  if (h < 24)    return `قبل ${h} س`
  const d = Math.floor(h / 24)
  return `قبل ${d} ي`
}

export default function LeadsBell({ base }: { base: string }) {
  const [open, setOpen]   = useState(false)
  const [leads, setLeads] = useState<SubscriptionLead[]>([])
  const [seenAt, setSeenAt] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function load() { setLeads(await fetchRecentLeads(10)) }

  useEffect(() => {
    load()
    setSeenAt(getLeadsSeenAt())
    const t = setInterval(load, 60_000)   // refresh every minute
    const onSeen = () => setSeenAt(getLeadsSeenAt())
    window.addEventListener(LEADS_SEEN_EVENT, onSeen)
    return () => { clearInterval(t); window.removeEventListener(LEADS_SEEN_EVENT, onSeen) }
  }, [])

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  /* Opening the bell = checking notifications → mark read (clears badge).
     Snapshot the prior seen-time so dots still show which were new this view. */
  const snapshot = useRef(0)
  function toggle() {
    const next = !open
    if (next) { snapshot.current = getLeadsSeenAt(); markLeadsSeen() }
    setOpen(next)
  }

  const newCount = leads.filter(l => new Date(l.created_at).getTime() > seenAt).length

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle}
        className="relative w-9 h-9 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 flex items-center justify-center transition-colors"
        aria-label="إشعارات العملاء">
        <Bell size={18} />
        {newCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">{newCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-[88vw] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden" dir="rtl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="font-bold text-[14px] text-zinc-900">العملاء الجدد</div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700"><X size={16} /></button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {leads.length === 0 && <p className="text-center py-8 text-zinc-400 text-[13px]">لا يوجد عملاء بعد</p>}
            {leads.map(l => {
              const isNew = new Date(l.created_at).getTime() > snapshot.current
              return (
                <Link key={l.id} href={`${base}/workspace`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                  <Avatar name={l.full_name} size={34} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[13px] text-zinc-800 truncate">{l.full_name}</span>
                      {isNew && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />}
                    </div>
                    <div className="text-[11px] text-zinc-400" dir="ltr">{l.phone ?? '—'}</div>
                  </div>
                  <span className="text-[10px] text-zinc-400 flex-shrink-0">{timeAgo(l.created_at)}</span>
                </Link>
              )
            })}
          </div>

          <Link href={`${base}/workspace`} onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 py-2.5 text-[12px] font-bold text-blue-600 hover:bg-zinc-50 border-t border-zinc-100">
            عرض كل العملاء <ChevronLeft size={13} />
          </Link>
        </div>
      )}
    </div>
  )
}
