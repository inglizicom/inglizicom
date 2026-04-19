'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Send, Loader2, CheckCircle2, RotateCcw, User as UserIcon, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
  fetchThread,
  fetchMessages,
  sendAdminMessage,
  markReadForAdmin,
  setThreadStatus,
  type SupportThread,
  type SupportMessage,
} from '@/lib/support-db'

export default function AdminThreadPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()

  const [thread, setThread]     = useState<SupportThread | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [profile, setProfile]   = useState<{ email: string | null; full_name: string | null } | null>(null)
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      const [t, m] = await Promise.all([
        fetchThread(params.id),
        fetchMessages(params.id),
      ])
      setThread(t)
      setMessages(m)
      if (t) {
        const { data } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', t.user_id)
          .maybeSingle()
        setProfile(data ?? null)
        if (t.unread_for_admin) markReadForAdmin(params.id).catch(() => {})
      }
      setLoading(false)
    })()
  }, [params.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !body.trim()) return
    setErr(null)
    setSending(true)
    try {
      await sendAdminMessage(params.id, user.id, body.trim())
      const fresh = await fetchMessages(params.id)
      setMessages(fresh)
      setBody('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed')
    } finally {
      setSending(false)
    }
  }

  async function toggleStatus() {
    if (!thread) return
    const next = thread.status === 'open' ? 'closed' : 'open'
    try {
      await setThreadStatus(thread.id, next)
      setThread({ ...thread, status: next })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed')
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </main>
    )
  }

  if (!thread) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-700 font-bold">Thread not found</p>
        <Link href="/admin/support" className="inline-block mt-4 text-indigo-600 text-sm font-bold">
          Back to inbox
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-72px)]">

      <div className="mb-4">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-900 text-xs font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Inbox
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-gray-900 font-black text-xl leading-snug truncate">
              {thread.subject}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-semibold">
              <span className="inline-flex items-center gap-1">
                <UserIcon size={12} />
                {profile?.full_name || 'Unknown'}
              </span>
              {profile?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} />
                  {profile.email}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={toggleStatus}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0 ${
              thread.status === 'open'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {thread.status === 'open' ? (
              <><CheckCircle2 size={12} /> Close thread</>
            ) : (
              <><RotateCcw size={12} /> Reopen</>
            )}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-y-auto p-5 space-y-3 shadow-sm"
        dir="rtl"
      >
        {messages.map(m => {
          const mine = m.sender_role === 'admin'
          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  mine
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-[10px] font-black opacity-70 mb-1 uppercase tracking-wider">
                  {mine ? 'Admin (you)' : 'User'}
                </div>
                {m.body}
                <div className="text-[10px] opacity-60 mt-1.5 font-semibold">
                  {new Date(m.created_at).toLocaleString('en', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={onSend} className="mt-3 flex gap-2 items-end" dir="rtl">
        <textarea
          required
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={2}
          placeholder="اكتب ردك…"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              (e.target as HTMLTextAreaElement).form?.requestSubmit()
            }
          }}
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm font-semibold outline-none focus:border-indigo-500 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-12 h-12 rounded-2xl transition-colors shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
      {err && <p className="text-red-600 text-xs font-bold mt-2">{err}</p>}
    </main>
  )
}
