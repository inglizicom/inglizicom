'use client'

/**
 * /admin/present — launch index for the recording decks.
 * Lists every unit of the situational course with a one-click link to its
 * full-screen teaching deck (/admin/present/[moduleId]) for video recording.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, Presentation } from 'lucide-react'
import { fetchModules, type LmsModule } from '@/lib/lms'

const COURSE_ID = '53f91433-429b-473e-87e6-20739206a3e3' // RealLife English — الإنجليزية للمواقف اليومية

export default function PresentIndexPage() {
  const [units, setUnits] = useState<LmsModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModules(COURSE_ID).then(m => { setUnits(m); setLoading(false) })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Presentation className="text-yellow-500" size={26} />
        <h1 className="text-xl font-black">Recording decks — RealLife English</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-6">
        Open a unit deck full-screen, then screen-record yourself explaining it. Navigate with ← → or Space.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="animate-spin" size={18} /> Loading units…</div>
      ) : (
        <div className="grid gap-2">
          {units.map(u => (
            <Link
              key={u.id}
              href={`/admin/present/${u.id}`}
              className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-yellow-400 hover:bg-yellow-50/40 transition"
            >
              <span className="font-semibold text-[14px] text-zinc-800">{u.title}</span>
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-yellow-600 opacity-70 group-hover:opacity-100">
                <Play size={14} /> Launch deck
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
