'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Send, Loader2, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  fetchThread,
  fetchMessages,
  sendUserMessage,
  markReadForUser,
  type SupportThread,
  type SupportMessage,
} from '@/lib/support-db'

export default function SupportThreadPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [thread, setThread]     = useState<SupportThread | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authLoading || !user) return
    (async () => {
      const [t, m] = await Promise.all([
        fetchThread(params.id),
        fetchMessages(params.id),
      ])
      setThread(t)
      setMessages(m)
      setLoading(false)
      if (t?.unread_for_user) markReadForUser(params.id).catch(() => {})
    })()
  }, [params.id, user, authLoading])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !body.trim()) return
    setErr(null)
    setSending(true)
    try {
      await sendUserMessage(params.id, user.id, body.trim())
      const fresh = await fetchMessages(params.id)
      setMessages(fresh)
      setBody('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed')
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 pt-[60px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    )
  }

  if (!user) {
    router.replace(`/login?next=/support/${params.id}`)
    return null
  }

  if (!thread) {
    return (
      <main className="min-h-screen bg-gray-950 pt-[120px] pb-16 px-4" dir="rtl">
        <div className="max-w-md mx-auto text-center">
          <p className="text-white font-bold">المحادثة غير موجودة</p>
          <Link href="/support" className="inline-block mt-4 text-brand-400 text-sm font-bold">
            العودة للمحادثات
          </Link>
        </div>
      </main>
    )
  }

  const closed = thread.status === 'closed'

  return (
    <main className="min-h-screen bg-gray-950 pt-[80px] pb-6 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-96px)]">

        <div className="mb-4">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-3"
          >
            <ArrowRight className="w-4 h-4" /> كل المحادثات
          </Link>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-white font-black text-xl leading-snug flex-1 min-w-0">{thread.subject}</h1>
            {closed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> مغلقة
              </span>
            ) : (
              <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wide shrink-0">
                مفتوحة
              </span>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-y-auto p-5 space-y-3"
        >
          {messages.map(m => {
            const mine = m.sender_role === 'user'
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    mine
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <div className="text-[10px] font-black opacity-70 mb-1 uppercase tracking-wider">
                    {mine ? 'أنت' : 'الأستاذ'}
                  </div>
                  {m.body}
                  <div className="text-[10px] opacity-60 mt-1.5 font-semibold">
                    {new Date(m.created_at).toLocaleString('ar', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {closed ? (
          <div className="mt-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <Lock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400 font-semibold">
              المحادثة مغلقة. افتح محادثة جديدة إذا لديك سؤال آخر.
            </p>
          </div>
        ) : (
          <form onSubmit={onSend} className="mt-3 flex gap-2 items-end">
            <textarea
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={2}
              placeholder="اكتب رسالتك…"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  (e.target as HTMLTextAreaElement).form?.requestSubmit()
                }
              }}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold outline-none focus:border-brand-500 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white w-12 h-12 rounded-2xl transition-colors shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        )}
        {err && <p className="text-red-400 text-xs font-bold mt-2">{err}</p>}
      </div>
    </main>
  )
}
