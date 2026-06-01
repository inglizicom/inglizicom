'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { LEAD_STATUSES, LEAD_STATUS_META } from '@/lib/leads-db'
import type { LeadStatus } from '@/lib/leads-db'

const PILL: Record<string, string> = {
  new:        'bg-gray-100 text-gray-600',
  contacted:  'bg-blue-50 text-blue-700',
  interested: 'bg-violet-50 text-violet-700',
  follow_up:  'bg-amber-50 text-amber-800',
  confirmed:  'bg-emerald-50 text-emerald-800',
  paid:       'bg-green-100 text-green-800',
  delayed:    'bg-orange-50 text-orange-800',
  cancelled:  'bg-gray-100 text-gray-400',
  converted:  'bg-green-100 text-green-800',
  rejected:   'bg-gray-100 text-gray-400',
}

const DOT: Record<string, string> = {
  new: 'bg-gray-300', contacted: 'bg-blue-400', interested: 'bg-violet-400',
  follow_up: 'bg-amber-400', confirmed: 'bg-emerald-500', paid: 'bg-green-600',
  delayed: 'bg-orange-400', cancelled: 'bg-gray-200', converted: 'bg-green-600', rejected: 'bg-gray-200',
}

const ACTIVE_STATUSES = LEAD_STATUSES.filter(s => !['vip', 'converted', 'rejected'].includes(s))

export default function StatusDropdown({
  status, onMove,
}: { status: LeadStatus; onMove: (s: LeadStatus) => void }) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function openMenu() {
    if (!btnRef.current) return
    const r   = btnRef.current.getBoundingClientRect()
    const VH  = window.innerHeight

    // position:fixed is viewport-relative — do NOT add scrollY/scrollX
    let top  = r.bottom + 4
    const left = r.left

    // If not enough room below, flip upward
    const menuH = Math.min(ACTIVE_STATUSES.length * 36 + 36, 320)
    if (top + menuH > VH - 8) {
      top = r.top - menuH - 4
    }

    setStyle({ position: 'fixed', top, left, zIndex: 99999 })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [open])

  const label = LEAD_STATUS_META[status]?.short ?? status
  const pill  = PILL[status] ?? 'bg-gray-100 text-gray-600'

  return (
    <>
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); open ? setOpen(false) : openMenu() }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap select-none hover:opacity-75 transition-opacity ${pill}`}
      >
        {label}
        <ChevronDown size={10} className="opacity-60 flex-shrink-0" />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={style}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl w-48 py-1"
          onClick={e => e.stopPropagation()}
        >
          <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
            Move to
          </p>
          {ACTIVE_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { onMove(s); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 text-left transition-colors ${
                s === status ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[s] ?? 'bg-gray-200'}`} />
              {LEAD_STATUS_META[s].label}
              {s === status && <span className="ml-auto text-[10px] text-gray-400">current</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
