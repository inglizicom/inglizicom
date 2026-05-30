'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, KanbanSquare, GraduationCap, X } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/lib/crm-db'
import { LEAD_STATUS_META, normalizeStatus } from '@/lib/leads-db'

interface Props {
  /** Base path prefix. Empty string on admin.inglizi.com, "/sales" on main site. */
  base?: string
}

export default function GlobalSearch({ base = '/sales' }: Props) {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setOpen(false); return }
      setLoading(true); setOpen(true)
      try { setResults(await globalSearch(query)) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function pick(r: SearchResult) {
    const dest = r.type === 'student'
      ? `${base}/students`
      : `${base}/leads`
    router.push(dest || '/')
    setQuery(''); setOpen(false); setResults([])
  }

  function clear() { setQuery(''); setResults([]); setOpen(false) }

  return (
    <div className="relative px-3 mb-1">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search leads, students…"
          className="w-full pl-8 pr-7 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
        />
        {query && (
          <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-3 right-3 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        >
          {loading && (
            <div className="py-5 flex justify-center text-gray-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="py-5 text-center text-xs text-gray-400">No results for &quot;{query}&quot;</div>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {results.map(r => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    onClick={() => pick(r)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left"
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      r.type === 'student' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {r.type === 'student' ? <GraduationCap size={12} /> : <KanbanSquare size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">{r.title}</div>
                      <div className="text-[11px] text-gray-400 truncate">{r.sub}</div>
                    </div>
                    {r.status && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        LEAD_STATUS_META[normalizeStatus(r.status)]?.color ?? 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {LEAD_STATUS_META[normalizeStatus(r.status)]?.short ?? r.status}
                      </span>
                    )}
                    {r.type === 'student' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
                        Student
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
