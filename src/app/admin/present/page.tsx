'use client'

/**
 * /admin/present — launch index for the recording decks.
 * Lists every unit of the situational course with a one-click link to its
 * full-screen teaching deck (/admin/present/[moduleId]) for video recording.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, Presentation, Download } from 'lucide-react'
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
      <p className="text-sm text-zinc-500 mb-3">
        Open a unit deck full-screen, then screen-record yourself explaining it. Navigate with ← → or Space.
      </p>
      <div className="mb-6 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-4 py-3 text-[13px] text-amber-900">
        <b>Use your own pictures?</b> Two ways — both override the auto photo. By unit folder & order: drop into <code className="bg-white px-1 rounded">public/deck-images/unit-1/</code> as <code className="bg-white px-1 rounded">a1.jpg</code>, <code className="bg-white px-1 rounded">a2.jpg</code>… (unit 1 = <code className="bg-white px-1 rounded">a</code>, unit 2 = <code className="bg-white px-1 rounded">b</code>, number = phrase order). Or by phrase name in <code className="bg-white px-1 rounded">public/deck-images/</code> (e.g. <code className="bg-white px-1 rounded">i-take-a-shower.jpg</code>).{' '}
        <a href="/api/deck-images-guide" className="font-bold underline">Download the filename guide</a>.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="animate-spin" size={18} /> Loading units…</div>
      ) : (
        <div className="grid gap-2">
          {units.map(u => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-yellow-400 transition"
            >
              <span className="font-semibold text-[14px] text-zinc-800">{u.title}</span>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/export/${u.id}`}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 hover:text-zinc-800"
                  title="Download an offline .html file (works without internet)"
                >
                  <Download size={14} /> Offline file
                </a>
                <Link
                  href={`/admin/present/${u.id}`}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-yellow-600 hover:text-yellow-700"
                >
                  <Play size={14} /> Launch deck
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
