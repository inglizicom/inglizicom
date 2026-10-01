'use client'

import { useEffect, useState } from 'react'
import { CalendarRange } from 'lucide-react'
import {
  PRESET_LABELS, businessToday, customRange, describeRange, presetRange,
  type DateRange, type RangePreset,
} from '@/lib/enrollment-metrics'

const PRESETS: RangePreset[] = ['today', 'week', 'month', 'year', 'all', 'custom']

/**
 * The one date-range control used across analytics screens: Today, This week,
 * This month, This year, All time, Custom. Days are Morocco calendar days.
 */
export default function RangeControls({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const [from, setFrom] = useState(value.from ?? '')
  const [to, setTo] = useState(value.to)
  useEffect(() => { setFrom(value.from ?? ''); setTo(value.to) }, [value.from, value.to])

  function pick(p: RangePreset) {
    if (p === 'custom') {
      const today = businessToday()
      onChange(customRange(value.from ?? presetRange('month', today).from!, value.to))
    } else {
      onChange(presetRange(p, businessToday()))
    }
  }

  function applyCustom(f: string, t: string) {
    if (f && t) onChange(customRange(f, t))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 w-fit max-w-full overflow-x-auto" role="tablist" aria-label="الفترة">
        {PRESETS.map(p => (
          <button key={p} role="tab" aria-selected={value.preset === p} onClick={() => pick(p)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors ${
              value.preset === p ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-zinc-800'}`}>
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <label className="flex items-center gap-1.5 text-zinc-500 font-bold">من
            <input type="date" value={from} max={to || undefined} dir="ltr"
              onChange={e => { setFrom(e.target.value); applyCustom(e.target.value, to) }}
              className="border border-zinc-200 rounded-lg px-2 py-1.5 bg-white" />
          </label>
          <label className="flex items-center gap-1.5 text-zinc-500 font-bold">إلى
            <input type="date" value={to} min={from || undefined} dir="ltr"
              onChange={e => { setTo(e.target.value); applyCustom(from, e.target.value) }}
              className="border border-zinc-200 rounded-lg px-2 py-1.5 bg-white" />
          </label>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[11.5px] text-zinc-400">
        <CalendarRange size={12} />
        <span>{describeRange(value)} · بتوقيت المغرب</span>
      </div>
    </div>
  )
}
