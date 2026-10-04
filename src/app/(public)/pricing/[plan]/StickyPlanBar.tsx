'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { COLOR_STYLES } from '@/components/pricing/colors'
import type { Plan } from '@/data/plans'

/**
 * Plan-specific bottom bar — replaces the generic StickyCTA on these pages
 * (see HIDE_ON_PATTERNS in components/StickyCTA.tsx) because naming the plan
 * and its price converts better than a generic "subscribe" button.
 *
 * Appears once the hero offer box has scrolled out of reach.
 */
export default function StickyPlanBar({ plan, onSubscribe }: { plan: Plan; onSubscribe: () => void }) {
  const c = COLOR_STYLES[plan.color]
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200"
          dir="rtl"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-slate-900 font-black text-sm truncate">{plan.title_ar}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-slate-900 font-black">{plan.amount_mad.toLocaleString('en-US')}</span>
                <span className="text-slate-500 text-xs font-bold">درهم</span>
                {plan.originalAmount && (
                  <span className="text-slate-400 text-xs line-through">{plan.originalAmount.toLocaleString('en-US')}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onSubscribe}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm ${c.ctaBg}`}
            >
              {plan.isClass ? 'احجز' : 'اشترك'} <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
