'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { CTA_GOLD } from '@/components/site/kit'
import type { Plan } from '@/data/plans'

/**
 * Plan-specific bottom bar — replaces the generic StickyCTA on these pages
 * (see HIDE_ON_PATTERNS in components/StickyCTA.tsx) because naming the plan
 * and its price converts better than a generic "subscribe" button.
 *
 * Appears once the hero offer box has scrolled out of reach.
 */
export default function StickyPlanBar({ plan, onSubscribe }: { plan: Plan; onSubscribe: () => void }) {
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
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-10px_30px_-20px_rgba(15,23,42,0.4)]"
          dir="rtl"
        >
          <div className="max-w-5xl mx-auto px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] font-black text-slate-950 truncate">{plan.title_ar}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[17px] font-black text-brand-900">{plan.amount_mad.toLocaleString('en-US')}</span>
                <span className="text-[12px] font-bold text-slate-500">درهم</span>
                {plan.originalAmount && plan.originalAmount > plan.amount_mad && (
                  <span className="text-[12px] text-slate-400 line-through">{plan.originalAmount.toLocaleString('en-US')}</span>
                )}
              </div>
            </div>
            <button type="button" onClick={onSubscribe} className={`${CTA_GOLD} shrink-0 px-6 py-3 text-[15px]`}>
              {plan.isClass ? 'احجز' : 'اشترك'} <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
