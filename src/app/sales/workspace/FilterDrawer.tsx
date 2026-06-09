'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads-db'
import { LEAD_SOURCES, LEAD_COURSES, type LeadSource, type LeadCourse } from '@/lib/crm-types'
import type { StaffRow } from '@/lib/staff-db'

const STATUS_AR: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  follow_up: 'متابعة', confirmed: 'مؤكد', paid: 'دفع',
  delayed: 'متأخر', cancelled: 'ملغي', vip: 'VIP',
}

export interface FilterState {
  status:   LeadStatus | ''
  source:   string
  course:   string
  assignee: string
  search:   string
}

interface Props {
  open:     boolean
  onClose:  () => void
  filters:  FilterState
  onChange: (f: FilterState) => void
  staff:    StaffRow[]
  onReset:  () => void
}

const CHIP = 'text-[12px] font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-colors'
const ACTIVE_CHIP = 'bg-yellow-400 text-black border-yellow-400'
const IDLE_CHIP   = 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'

export default function FilterDrawer({ open, onClose, filters, onChange, staff, onReset }: Props) {
  function set<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    onChange({ ...filters, [key]: val })
  }
  function toggle<K extends keyof FilterState>(key: K, val: string) {
    set(key, (filters[key] === val ? '' : val) as FilterState[K])
  }

  const activeCount = [filters.status, filters.source, filters.course, filters.assignee].filter(Boolean).length

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside className={[
        'fixed top-0 bottom-0 right-0 z-50 w-80 max-w-full bg-white shadow-2xl',
        'flex flex-col transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-[16px]">
            <SlidersHorizontal size={16} className="text-zinc-400" />
            الفلاتر
            {activeCount > 0 && (
              <span className="bg-yellow-400 text-black text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Status filter */}
          <section>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">الحالة</div>
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUSES.filter(s => !['converted', 'rejected'].includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => toggle('status', s)}
                  className={[CHIP, filters.status === s ? ACTIVE_CHIP : IDLE_CHIP].join(' ')}
                >
                  {STATUS_AR[s] ?? s}
                </button>
              ))}
            </div>
          </section>

          {/* Source filter */}
          <section>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">المصدر</div>
            <div className="flex flex-wrap gap-2">
              {LEAD_SOURCES.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggle('source', s.id)}
                  className={[CHIP, filters.source === s.id ? ACTIVE_CHIP : IDLE_CHIP].join(' ')}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Course filter */}
          <section>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">الدورة</div>
            <div className="flex flex-wrap gap-2">
              {LEAD_COURSES.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggle('course', c.id)}
                  className={[CHIP, filters.course === c.id ? ACTIVE_CHIP : IDLE_CHIP].join(' ')}
                >
                  {c.short}
                </button>
              ))}
            </div>
          </section>

          {/* Assignee filter */}
          {staff.length > 0 && (
            <section>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">المسؤول</div>
              <div className="flex flex-wrap gap-2">
                {staff.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggle('assignee', s.id)}
                    className={[CHIP, filters.assignee === s.id ? ACTIVE_CHIP : IDLE_CHIP].join(' ')}
                  >
                    {s.email?.split('@')[0] ?? s.id.slice(0, 6)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 flex gap-3">
          <button
            onClick={() => { onReset(); onClose() }}
            className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 font-semibold text-[13px] hover:bg-zinc-50"
          >
            إعادة تعيين
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-black text-white font-bold text-[13px] hover:bg-zinc-800"
          >
            تطبيق
          </button>
        </div>
      </aside>
    </>
  )
}
