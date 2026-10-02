'use client'

import { useEffect, useState } from 'react'

/** Sticky section tabs for the public teacher page. The underline follows the
 *  section in view; a click scrolls to it. Sections are plain anchors, so the
 *  page still works with JavaScript off. */
export default function ProfileTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  useEffect(() => {
    const els = tabs.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
    if (!els.length || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      entries => {
        const seen = entries.filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (seen[0]) setActive(seen[0].target.id)
      },
      { rootMargin: '-120px 0px -55% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [tabs])

  return (
    <nav className="sticky top-16 z-20 -mx-4 bg-[#EEF3FA]/90 px-4 backdrop-blur-xl sm:mx-0 sm:px-0">
      <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0] no-scrollbar">
        {tabs.map(t => {
          const on = active === t.id
          return (
            <a key={t.id} href={`#${t.id}`} onClick={() => setActive(t.id)}
               className={`relative shrink-0 px-4 py-3.5 text-[13.5px] font-bold transition-colors
                           ${on ? 'text-blue-700' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}>
              {t.label}
              {on && <span className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-blue-600" />}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
