'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Plus, Loader2, Lock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  createThread,
  fetchMyThreads,
  type SupportThread,
} from '@/lib/support-db'

export default function SupportIndexPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [threads, setThreads]   = useState<SupportThread[]>([])
  const [loading, setLoading]   = useState(true)
  const [composing, setComposing] = useState(false)
  const [subject, setSubject]   = useState('')
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [err, setErr]           = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    fetchMyThreads().then(rows => {
      setThreads(rows)
      setLoading(false)
    })
  }, [user, authLoading])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setErr(null)
    setSending(true)
    try {
      const thread = await createThread(user.id, subject.trim(), body.trim())
      router.push(`/support/${thread.id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed')
      setSending(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 pt-[60px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 pt-[120px] pb-16 px-4" dir="rtl">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">سجّل الدخول للوصول للدعم</h1>
          <p className="text-gray-400 text-sm mb-6">
            الدردشة مع الأستاذ متاحة للمسجلين فقط — سجّل الدخول أو أنشئ حساب مجاني.
          </p>
          <Link
            href="/login?next=/support"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-black text-sm px-6 py-3 rounded-xl transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 pt-[80px] pb-16 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white font-black text-2xl leading-none">الدعم والمراسلة</h1>
            <p className="text-gray-400 text-sm mt-1">تواصل مباشرة مع الأستاذ</p>
          </div>
          {!composing && (
            <button
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> محادثة جديدة
            </button>
          )}
        </div>

        {composing && (
          <form
            onSubmit={onCreate}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 space-y-3"
          >
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">الموضوع</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={120}
                placeholder="مثال: سؤال عن كورس B1"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">الرسالة</label>
              <textarea
                required
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="اشرح سؤالك بتفصيل…"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-semibold outline-none focus:border-brand-500 resize-none"
              />
            </div>
            {err && <p className="text-red-400 text-xs font-bold">{err}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => { setComposing(false); setErr(null) }}
                className="text-xs font-bold text-gray-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                إرسال
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
          </div>
        ) : threads.length === 0 && !composing ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-bold">لا يوجد محادثات بعد</p>
            <p className="text-gray-500 text-xs mt-1">ابدأ محادثة جديدة لطرح سؤالك على الأستاذ</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map(t => (
              <Link
                key={t.id}
                href={`/support/${t.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h2 className="text-white font-bold text-base leading-snug flex-1 min-w-0">
                    {t.subject}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0">
                    {t.unread_for_user && (
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                    )}
                    {t.status === 'closed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500">
                        <CheckCircle2 className="w-3.5 h-3.5" /> مغلقة
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                        مفتوحة
                      </span>
                    )}
                  </div>
                </div>
                {t.last_message_preview && (
                  <p className="text-gray-400 text-sm line-clamp-1">{t.last_message_preview}</p>
                )}
                <p className="text-gray-600 text-xs mt-2 font-semibold">
                  {new Date(t.last_message_at).toLocaleString('ar', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
