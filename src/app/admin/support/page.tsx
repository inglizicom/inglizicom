'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Loader2, CheckCircle2, User as UserIcon } from 'lucide-react'
import { fetchAllThreads, type SupportThreadWithProfile } from '@/lib/support-db'

type Filter = 'all' | 'open' | 'closed' | 'unread'

export default function AdminSupportPage() {
  const [threads, setThreads] = useState<SupportThreadWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<Filter>('all')

  useEffect(() => {
    fetchAllThreads().then(rows => {
      setThreads(rows)
      setLoading(false)
    })
  }, [])

  const filtered = threads.filter(t => {
    if (filter === 'open')    return t.status === 'open'
    if (filter === 'closed')  return t.status === 'closed'
    if (filter === 'unread')  return t.unread_for_admin
    return true
  })

  const unreadCount = threads.filter(t => t.unread_for_admin).length

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-black text-xl leading-none">Support inbox</h1>
          <p className="text-gray-400 text-xs mt-1">
            {unreadCount > 0 ? `${unreadCount} unread thread${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {([
          ['all',    'All'],
          ['unread', `Unread ${unreadCount > 0 ? `· ${unreadCount}` : ''}`],
          ['open',   'Open'],
          ['closed', 'Closed'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as Filter)}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${
              filter === key
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold">No threads</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Link
              key={t.id}
              href={`/admin/support/${t.id}`}
              className={`block bg-white rounded-2xl border p-5 hover:shadow-sm transition-all ${
                t.unread_for_admin ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {t.unread_for_admin && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                    <h2 className="text-gray-900 font-bold text-base leading-snug truncate">
                      {t.subject}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                    <UserIcon size={12} />
                    <span className="truncate">
                      {t.profile?.full_name || t.profile?.email || t.user_id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {t.status === 'closed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Closed
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                      Open
                    </span>
                  )}
                </div>
              </div>
              {t.last_message_preview && (
                <p className="text-gray-500 text-sm line-clamp-1 mt-1">{t.last_message_preview}</p>
              )}
              <p className="text-gray-400 text-xs mt-2 font-semibold">
                {new Date(t.last_message_at).toLocaleString('en', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
