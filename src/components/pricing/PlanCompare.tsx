'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus, ArrowLeft, Columns3, ChevronDown } from 'lucide-react'
import { COLOR_STYLES } from './PlanCards'
import type { Plan } from '@/data/plans'

/**
 * Side-by-side comparison of a set of plans.
 *
 * Every row is derived from real fields on the Plan objects — nothing is
 * hand-written here, so the table can never contradict the cards above it.
 */

interface Row {
  label: string
  /** Returns a string to print, or a boolean to render a ✓ / — */
  value: (p: Plan) => string | boolean
  highlight?: boolean
}

const ROWS: Row[] = [
  { label: 'السعر',            value: p => `${p.amount_mad.toLocaleString()} درهم`, highlight: true },
  { label: 'المستوى',          value: p => (p.levelFrom && p.levelTo ? `${p.levelFrom} → ${p.levelTo}` : '—') },
  { label: 'مدة البرنامج',      value: p => `${p.duration_months} ${p.duration_months === 1 ? 'شهر' : 'أشهر'}` },
  { label: 'نوع المتابعة',      value: p => p.followUpLabel_ar },
  { label: 'مدة المتابعة',      value: p => p.followUpDuration_ar },
  { label: 'عدد المزايا',       value: p => `${p.lifetimePerks.length} ميزة` },
  { label: 'تصحيح صوتي',        value: p => p.monthlyPerks.some(m => /صوت|تسجيل/.test(m)) },
  { label: 'لايف للمشتركين',    value: p => p.monthlyPerks.some(m => /لايف/.test(m)) },
  { label: 'كوتشينغ شخصي',      value: p => p.monthlyPerks.some(m => /كوتشينغ|1:1|شخصي/.test(m)) },
  { label: 'يشمل ما قبله',      value: p => Boolean(p.includesPrevious_ar) },
]

export default function PlanCompare({
  plans,
  title = 'قارن المستويات جنباً إلى جنب',
}: {
  plans: Plan[]
  title?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="mx-auto flex items-center gap-2 bg-[#0a1628] border border-[#1a2d4a] hover:border-[#1e3455] text-white font-black text-sm px-6 py-3 rounded-2xl transition-colors"
      >
        <Columns3 className="w-4 h-4 text-amber-400" />
        {open ? 'إخفاء المقارنة' : title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* the table scrolls inside itself — the page never scrolls sideways */}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#1a2d4a]">
              <table className="w-full min-w-[640px] text-right border-collapse">
                <thead>
                  <tr className="bg-[#0a1628]">
                    <th scope="col" className="p-4 text-gray-500 text-xs font-black sticky right-0 bg-[#0a1628] z-10">
                      المقارنة
                    </th>
                    {plans.map(p => {
                      const c = COLOR_STYLES[p.color]
                      return (
                        <th key={p.id} scope="col" className="p-4 min-w-[150px] align-top">
                          <div className={`text-[10px] font-black uppercase tracking-wider ${c.accent} mb-1`}>
                            {p.badge_ar ?? ' '}
                          </div>
                          <Link href={`/pricing/${p.id}`} className="text-white font-black text-sm hover:underline no-underline">
                            {p.title_ar}
                          </Link>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, i) => (
                    <tr key={row.label} className={i % 2 ? 'bg-[#0a1628]/50' : ''}>
                      <th
                        scope="row"
                        className={`p-4 text-xs font-bold sticky right-0 z-10 ${i % 2 ? 'bg-[#0d1a2e]' : 'bg-[#050d1a]'} ${row.highlight ? 'text-white' : 'text-gray-500'}`}
                      >
                        {row.label}
                      </th>
                      {plans.map(p => {
                        const v = row.value(p)
                        return (
                          <td key={p.id} className="p-4 text-center">
                            {typeof v === 'boolean'
                              ? (v
                                  ? <Check className="w-4 h-4 text-emerald-400 mx-auto" aria-label="نعم" />
                                  : <Minus className="w-4 h-4 text-gray-700 mx-auto" aria-label="لا" />)
                              : <span className={`text-xs leading-snug ${row.highlight ? 'text-white font-black text-sm' : 'text-gray-300'}`}>{v}</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 sticky right-0 bg-[#050d1a] z-10" />
                    {plans.map(p => {
                      const c = COLOR_STYLES[p.color]
                      return (
                        <td key={p.id} className="p-4 text-center">
                          <Link
                            href={`/pricing/${p.id}`}
                            className={`inline-flex items-center gap-1.5 ${c.pillBg} ${c.pillText} text-[11px] font-black px-3 py-2 rounded-lg no-underline hover:brightness-125 transition-all`}
                          >
                            التفاصيل <ArrowLeft className="w-3 h-3" />
                          </Link>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
