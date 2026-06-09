'use client'

import { X, Archive, Trash2, UserPlus, Tag, Calendar, MessageSquare, XCircle } from 'lucide-react'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads-db'
import type { StaffRow } from '@/lib/staff-db'
import { useState } from 'react'

const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع',
  delayed: 'متأخر', cancelled: 'ملغي',
}

interface Props {
  count:       number
  onClear:     () => void
  onStatus:    (status: LeadStatus) => void
  onAssign:    (id: string | null) => void
  onArchive:   () => void
  onDelete:    () => void
  onMarkContacted: () => void
  staff:       StaffRow[]
  isFounder:   boolean
  busy:        boolean
}

export default function BulkBar({
  count, onClear, onStatus, onAssign, onArchive, onDelete,
  onMarkContacted, staff, isFounder, busy,
}: Props) {
  const [showStatus,  setShowStatus]  = useState(false)
  const [showAssign,  setShowAssign]  = useState(false)

  if (count === 0) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="bg-black text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 flex-wrap max-w-2xl w-full pointer-events-auto">

        {/* Count + clear */}
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 text-black font-black text-[13px] w-7 h-7 rounded-full flex items-center justify-center">
            {count}
          </span>
          <span className="text-[13px] font-semibold text-zinc-300">محدد</span>
          <button onClick={onClear} className="text-zinc-500 hover:text-white mr-1">
            <X size={14} />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-700 flex-shrink-0" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Mark contacted */}
          <button
            disabled={busy}
            onClick={onMarkContacted}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <MessageSquare size={13} /> تم التواصل
          </button>

          {/* Change status */}
          <div className="relative">
            <button
              disabled={busy}
              onClick={() => { setShowStatus(s => !s); setShowAssign(false) }}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <Tag size={13} /> تغيير الحالة
            </button>
            {showStatus && (
              <div className="absolute bottom-full mb-2 right-0 bg-white text-zinc-800 rounded-xl shadow-xl border border-zinc-100 py-1 min-w-[160px] z-10">
                {LEAD_STATUSES.filter(s => !['vip','converted','rejected'].includes(s)).map(s => (
                  <button
                    key={s}
                    onClick={() => { onStatus(s); setShowStatus(false) }}
                    className="w-full text-right px-4 py-2 text-[13px] hover:bg-zinc-50 font-medium"
                  >
                    {STATUS_AR[s] ?? s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assign */}
          {staff.length > 0 && (
            <div className="relative">
              <button
                disabled={busy}
                onClick={() => { setShowAssign(s => !s); setShowStatus(false) }}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <UserPlus size={13} /> إسناد
              </button>
              {showAssign && (
                <div className="absolute bottom-full mb-2 right-0 bg-white text-zinc-800 rounded-xl shadow-xl border border-zinc-100 py-1 min-w-[180px] z-10">
                  <button
                    onClick={() => { onAssign(null); setShowAssign(false) }}
                    className="w-full text-right px-4 py-2 text-[13px] hover:bg-zinc-50 text-zinc-500"
                  >
                    بلا مسؤول
                  </button>
                  {staff.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onAssign(s.id); setShowAssign(false) }}
                      className="w-full text-right px-4 py-2 text-[13px] hover:bg-zinc-50 font-medium"
                    >
                      {s.email?.split('@')[0] ?? s.id.slice(0, 6)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Archive */}
          <button
            disabled={busy}
            onClick={onArchive}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Archive size={13} /> أرشفة
          </button>

          {/* Delete — founder only */}
          {isFounder && (
            <button
              disabled={busy}
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-300 hover:text-red-200 transition-colors"
            >
              <Trash2 size={13} /> حذف
            </button>
          )}
        </div>

        {busy && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  )
}
