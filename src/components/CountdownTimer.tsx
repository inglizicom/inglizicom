'use client'

import { useState, useEffect } from 'react'

function getTarget() {
  const now = new Date()
  // Next Sunday 23:59:59
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7
  const target = new Date(now)
  target.setDate(now.getDate() + daysUntilSunday)
  target.setHours(23, 59, 59, 0)
  return target
}

export default function CountdownTimer({ label = 'ينتهي العرض خلال' }: { label?: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const target = getTarget()
    const tick = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return }
      setTime({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
        🔥 {label}
      </p>
      <div className="flex items-center gap-1.5">
        {[
          { v: pad(time.d), l: 'يوم' },
          { v: pad(time.h), l: 'ساعة' },
          { v: pad(time.m), l: 'دقيقة' },
          { v: pad(time.s), l: 'ثانية' },
        ].map(({ v, l }, i) => (
          <div key={l} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-red-400 font-black text-lg mb-3">:</span>}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 text-white font-black text-xl rounded-xl flex items-center justify-center shadow-md shadow-red-500/30">
                {v}
              </div>
              <span className="text-[10px] text-red-500 font-bold mt-1">{l}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
