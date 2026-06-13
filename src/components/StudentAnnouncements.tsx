'use client'

import { useState, useEffect } from 'react'
import { Megaphone, X, AlertTriangle, Sparkles, Info } from 'lucide-react'
import type { StudentAnnouncement } from '@/lib/announcements'

const SEV: Record<string, { bar: string; chip: string; icon: any }> = {
  info:        { bar: 'bg-blue-600',  chip: 'bg-blue-50 text-blue-600',     icon: Info },
  update:      { bar: 'bg-violet-600', chip: 'bg-violet-50 text-violet-600', icon: Sparkles },
  maintenance: { bar: 'bg-amber-500',  chip: 'bg-amber-50 text-amber-600',   icon: AlertTriangle },
}
const DISMISS_KEY = 'inglizi.ann_dismissed'

export default function StudentAnnouncements({ anns, onShow }: { anns: StudentAnnouncement[]; onShow?: () => void }) {
  const [dismissed, setDismissed] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]') } catch { return [] } })
  function dismiss(id: string) { const next = [...dismissed, id]; setDismissed(next); try { localStorage.setItem(DISMISS_KEY, JSON.stringify(next)) } catch {} }

  const banners = anns.filter(a => a.type === 'banner')
  const popup = anns.find(a => a.type === 'popup' && !dismissed.includes(a.id))
  // chime once per new popup (per session)
  useEffect(() => {
    if (!popup || !onShow) return
    try { if (sessionStorage.getItem('inglizi.ann_chime.' + popup.id)) return; sessionStorage.setItem('inglizi.ann_chime.' + popup.id, '1') } catch {}
    onShow()
  }, [popup?.id])
  const barSev = banners.some(b => b.severity === 'maintenance') ? 'maintenance' : banners.some(b => b.severity === 'update') ? 'update' : 'info'
  const bar = SEV[barSev]
  const PopIcon = popup ? (SEV[popup.severity]?.icon ?? Info) : Info

  return (
    <>
      {/* moving banner ticker */}
      {banners.length > 0 && (
        <div className={`${bar.bar} text-white sticky top-[60px] z-[15] overflow-hidden`}>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Megaphone size={15} className="flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div dir="rtl" className="ann-marquee whitespace-nowrap text-[12.5px] font-semibold">
                {banners.map(b => (
                  <span key={b.id} className="mx-8">● {b.title}{b.body ? ` — ${b.body}` : ''}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* login popup */}
      {popup && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 vp-fade" dir="rtl" onClick={() => dismiss(popup.id)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden vp-pop" onClick={e => e.stopPropagation()}>
            <div className={`${SEV[popup.severity]?.bar ?? 'bg-blue-600'} px-5 py-4 text-white flex items-center gap-2`}>
              <PopIcon size={20} /><span className="font-black text-[15px]">{popup.title}</span>
              <button onClick={() => dismiss(popup.id)} className="mr-auto text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5">
              {popup.body && <p className="text-[13.5px] text-zinc-700 leading-relaxed whitespace-pre-wrap">{popup.body}</p>}
              <button onClick={() => dismiss(popup.id)} className="mt-4 w-full py-3 rounded-2xl bg-black text-white font-bold text-[14px]">فهمت</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
