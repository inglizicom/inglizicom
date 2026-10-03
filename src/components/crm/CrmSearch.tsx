'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Users, GraduationCap, X, CornerDownLeft } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/lib/crm-db'
import { LEAD_STATUS_AR, LEAD_STATUS_META, normalizeStatus } from '@/lib/leads-db'

/**
 * One box that finds anybody — leads and students by name, phone or note —
 * and opens their page. Lives in the header so it is one keystroke away on
 * every screen: Ctrl/⌘ K or "/" focuses it, arrows move, Enter opens.
 */
export default function CrmSearch({ base, autoFocus, onDone }: {
  base: string
  autoFocus?: boolean
  /** Called after a pick or Escape (the phone search row closes itself). */
  onDone?: () => void
}) {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor]   = useState(0)
  const boxRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setOpen(false); return }
      setLoading(true); setOpen(true)
      try { setResults(await globalSearch(query)); setCursor(0) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 260)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault(); inputRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey) }
  }, [])

  function pick(r: SearchResult) {
    router.push(r.type === 'student' ? `${base}/students/${r.id}` : `${base}/leads/${r.id}`)
    setQuery(''); setOpen(false); setResults([])
    inputRef.current?.blur()
    onDone?.()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    else if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); pick(results[cursor]) }
    else if (e.key === 'Escape') { setQuery(''); setOpen(false); inputRef.current?.blur(); onDone?.() }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="ابحث عن عميل أو طالب بالاسم أو الهاتف…"
        className="w-full h-10 pr-10 pl-16 rounded-xl bg-[#F1F5FB] ring-1 ring-[#E2E8F0] text-[13px] font-medium text-[#1E3A8A]
                   placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
      />
      {query ? (
        <button onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="مسح"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-slate-200 hover:text-[#334155]">
          <X size={13} />
        </button>
      ) : (
        <kbd className="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 items-center px-1.5 h-6 rounded-md bg-white ring-1 ring-[#E2E8F0] text-[10.5px] font-bold text-[#94A3B8]" dir="ltr">
          Ctrl K
        </kbd>
      )}

      {open && (
        <div className="absolute inset-x-0 top-full mt-2 z-50 rounded-2xl bg-white ring-1 ring-[#E2E8F0] shadow-[0_18px_44px_-16px_rgba(30,58,138,.35)] overflow-hidden">
          {loading && (
            <div className="py-6 flex justify-center text-[#94A3B8]"><Loader2 size={18} className="animate-spin" /></div>
          )}
          {!loading && results.length === 0 && (
            <div className="py-6 text-center text-[13px] text-[#94A3B8]">لا نتائج لـ «{query}»</div>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto py-1.5">
              {results.map((r, i) => {
                const lead = r.type === 'lead'
                const st   = r.status ? normalizeStatus(r.status) : undefined
                const meta = lead && st ? LEAD_STATUS_META[st] : undefined
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <button onMouseEnter={() => setCursor(i)} onClick={() => pick(r)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-right transition-colors ${i === cursor ? 'bg-blue-50' : ''}`}>
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${lead ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {lead ? <Users size={16} /> : <GraduationCap size={16} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13.5px] font-bold text-[#1E3A8A] truncate">{r.title}</span>
                        <span className="block text-[11.5px] text-[#64748B] truncate" dir="auto">{r.sub || '—'}</span>
                      </span>
                      {lead
                        ? meta && <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>{st ? LEAD_STATUS_AR[st] : ''}</span>
                        : <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">طالب</span>}
                      {i === cursor && <CornerDownLeft size={13} className="text-[#94A3B8] shrink-0 hidden md:block" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
