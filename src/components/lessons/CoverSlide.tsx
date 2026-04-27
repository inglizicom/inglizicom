'use client'

import { motion } from 'framer-motion'
import type { Unit } from '@/data/private-lessons/types'

export default function CoverSlide({ unit }: { unit: Unit }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 h-1 w-24 bg-amber-400 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-amber-600 font-bold tracking-[0.4em] uppercase text-xs md:text-sm mb-4"
        >
          Unit {String(unit.id).padStart(2, '0')} · {unit.level}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight"
        >
          {unit.title.en}
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-slate-500"
          dir="rtl"
        >
          {unit.title.ar}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="mt-12 inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">
            Space
          </kbd>
          <span dir="rtl">للبدء</span>
        </motion.div>
      </div>
    </div>
  )
}
