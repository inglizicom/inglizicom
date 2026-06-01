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
  new:'bg-gray-300', contacted:'bg-blue-400', interested:'bg-violet-400',
  follow_up:'bg-amber-400', confirmed:'bg-emerald-500', paid:'bg-green-600',
  delayed:'bg-orange-400', cancelled:'bg-gray-200', converted:'bg-green-600', rejected:'bg-gray-200',
}

/**
 * Status pill button + dropdown rendered in a React portal (body level).
 * This avoids clipping by overflow:hidden / overflow-x:auto on table containers.
 */
export default function StatusDropdown({
  status, onMove,
}: {
  status:  LeadStatus
  onMove:  (s: LeadStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0 })
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /* Position menu below the button using fixed coords */
  function openMenu() {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({
      top:  r.bottom + window.scrollY + 4,
      left: r.left   + window.scrollX,
    })
    setOpen(true)
  }

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  /* Close on scroll (so it doesn't float away) */
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
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

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl w-44 py-1.5 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-1">
            Move to
          </p>
          {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s => (
            <button
              key={s}
              onClick={() => { onMove(s); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left ${
                s === status ? 'font-semibold text-gray-900' : 'text-gray-600'
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
