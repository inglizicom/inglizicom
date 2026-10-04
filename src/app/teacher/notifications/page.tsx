'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Inbox, Loader2, Search, Send, SendHorizonal } from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import { fetchMyClasses, fetchMyStudents, type MyClass, type MyStudent } from '@/lib/teachers'
import {
  fetchMessageLog, fetchMyNotifications, markRead, teacherSend, timeAgo,
  type AppNotification, type SentMessage,
} from '@/lib/notifications'
import { Card, DemoBanner, Empty, PageHero } from '../_ui'
import { isTeacherDemo } from '../_demo'

/**
 * الإشعارات (062) — the teacher's inbox (from the academy, their students, and
 * the platform's events), a notification to their own students (chosen ones,
 * or one of their classes), and what they sent. The academy sees every
 * message a teacher sends.
 */

type Tab = 'inbox' | 'send' | 'sent'

const DEMO_INBOX: AppNotification[] = [
  { id: 'd1', kind: 'student_assigned', title: '👤 طالب جديد مسنَد إليك', body: 'سلمى بنعلي', url: '/teacher/students', read_at: null, created_at: new Date(Date.now() - 20 * 60e3).toISOString(), message_id: null },
  { id: 'd2', kind: 'payment', title: '💰 دفعة جديدة لحصصك', body: 'ياسين العلوي · 450 د.م', url: '/teacher/earnings', read_at: null, created_at: new Date(Date.now() - 3 * 3600e3).toISOString(), message_id: null },
  { id: 'd3', kind: 'message', title: '✉️ رسالة من خديجة الفاسي', body: 'سأتأخر 10 دقائق عن حصة اليوم.', url: '/teacher/notifications', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 26 * 3600e3).toISOString(), message_id: null },
]

export default function TeacherNotificationsPage() {
  const teacher = useTeacher()
  const router = useRouter()
  const demo = isTeacherDemo()
  const [tab, setTab] = useState<Tab>('inbox')
  const [items, setItems] = useState<AppNotification[] | null>(null)

  useEffect(() => {
    if (demo) { setItems(DEMO_INBOX); return }
    fetchMyNotifications(teacher.id, 100).then(setItems)
  }, [demo, teacher.id])

  async function readAll() {
    if (!demo) await markRead()
    setItems(r => r?.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })) ?? null)
  }
  function open(n: AppNotification) {
    if (!n.read_at) {
      if (!demo) markRead([n.id])
      setItems(r => r?.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? null)
    }
    if (n.url && n.url !== '/teacher/notifications') router.push(n.url)
  }
  const unread = (items ?? []).filter(n => !n.read_at).length

  return (
    <div className="space-y-4">
      {demo && <DemoBanner />}
      <PageHero icon={Bell} tone="violet" title="الإشعارات"
        subtitle="ما يصلك من الأكاديمية ومن طلابك، وإشعار لطلابك متى احتجت — الأكاديمية تطّلع على الرسائل." />

      <div className="flex gap-1.5 overflow-x-auto" role="tablist">
        {([['inbox', `الوارد${unread ? ` · ${unread}` : ''}`, Inbox], ['send', 'إرسال لطلابي', Send], ['sent', 'المرسلة', SendHorizonal]] as const).map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-colors ${tab === id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'inbox' && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[14px] font-extrabold text-[#1E3A8A]">الوارد</span>
            {unread > 0 && <button onClick={readAll} className="flex items-center gap-1 text-[12px] font-bold text-blue-700"><CheckCheck size={14} /> تحديد الكل كمقروء</button>}
          </div>
          {items === null ? (
            <div className="py-16 flex justify-center text-slate-300"><Loader2 className="animate-spin" /></div>
          ) : items.length === 0 ? (
            <Empty icon={Bell} title="لا إشعارات بعد" hint="تصلك هنا الطلاب الجدد، الدفعات، الرسائل، وتذكير التقارير." />
          ) : items.map(n => (
            <button key={n.id} onClick={() => open(n)}
              className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${n.read_at ? '' : 'bg-blue-50/40'}`}>
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read_at ? 'bg-transparent' : 'bg-rose-500'}`} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-bold text-slate-900 break-words">{n.title}</span>
                {n.body && <span className="block text-[12.5px] text-slate-500 leading-relaxed whitespace-pre-wrap break-words">{n.body}</span>}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(n.created_at)}</span>
            </button>
          ))}
        </Card>
      )}
      {tab === 'send' && <SendToStudents demo={demo} onSent={() => setTab('sent')} />}
      {tab === 'sent' && <Sent demo={demo} />}
    </div>
  )
}

function SendToStudents({ demo, onSent }: { demo: boolean; onSent: () => void }) {
  const [students, setStudents] = useState<MyStudent[] | null>(null)
  const [classes, setClasses] = useState<MyClass[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [classId, setClassId] = useState('')
  const [q, setQ] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    if (demo) { setStudents([]); return }
    Promise.all([fetchMyStudents(), fetchMyClasses()]).then(([s, c]) => {
      setStudents(s); setClasses(c.filter(x => x.status === 'active'))
    })
  }, [demo])

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (students ?? []).filter(s => !n || s.full_name.toLowerCase().includes(n))
  }, [students, q])
  const toggle = (id: string) => setPicked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const nothing = picked.size === 0 && !classId

  async function send() {
    if (demo) { setError('معاينة فقط — لا يُرسل شيء.'); return }
    setBusy(true); setError(null); setDone(null)
    try {
      const r = await teacherSend({ title, body, students: Array.from(picked), classId: classId || null })
      setDone(`أُرسل إلى ${r.students} طالب.`)
      setTitle(''); setBody(''); setPicked(new Set()); setClassId('')
      setTimeout(onSent, 1200)
    } catch (e: any) { setError(e?.message ?? 'تعذّر الإرسال.') }
    finally { setBusy(false) }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-3">
        <div className="text-[14px] font-extrabold text-[#1E3A8A]">إلى من؟</div>
        {classes.length > 0 && (
          <label className="block">
            <span className="block text-[12px] font-bold text-slate-500 mb-1">كل طلاب أحد أقسامي</span>
            <select value={classId} onChange={e => setClassId(e.target.value)} aria-label="قسم"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[13.5px]">
              <option value="">—</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        )}
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن طالب…"
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-[13.5px]" />
        </div>
        <div className="text-[12px] font-bold text-slate-500">{picked.size} طالب محدَّد</div>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
          {students === null ? (
            <div className="py-10 flex justify-center text-slate-300"><Loader2 size={18} className="animate-spin" /></div>
          ) : shown.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-slate-400">لا طلاب</div>
          ) : shown.map(s => {
            const on = picked.has(s.id)
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-right hover:bg-slate-50">
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'}`}>
                  {on && <Check size={13} />}
                </span>
                <span className="flex-1 min-w-0 truncate text-[13px] font-bold text-slate-800">{s.full_name}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-4 space-y-3 h-fit">
        <div className="text-[14px] font-extrabold text-[#1E3A8A]">الإشعار</div>
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} aria-label="العنوان"
          placeholder="العنوان — مثال: واجب حصة الغد" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[13.5px]" />
        <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={1000} rows={5} aria-label="النص"
          placeholder="النص (اختياري)" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[13.5px]" />
        <p className="text-[11.5px] text-slate-400">يصل إلى طلابك داخل فضائهم وعلى هواتفهم، والأكاديمية تطّلع عليه.</p>
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
        {done && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] font-bold text-emerald-700">{done}</div>}
        <button onClick={send} disabled={busy || nothing || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-blue-600 to-blue-800 text-white text-[14px] font-bold disabled:opacity-40">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} إرسال
        </button>
      </Card>
    </div>
  )
}

function Sent({ demo }: { demo: boolean }) {
  const [rows, setRows] = useState<SentMessage[] | null>(null)
  useEffect(() => { if (demo) setRows([]); else fetchMessageLog(100).then(setRows) }, [demo])
  if (rows === null) return <div className="py-16 flex justify-center text-slate-300"><Loader2 className="animate-spin" /></div>
  if (rows.length === 0) return <Card><Empty icon={SendHorizonal} title="لم ترسل أي إشعار بعد" /></Card>
  return (
    <div className="space-y-3">
      {rows.map(m => (
        <Card key={m.id} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-slate-900 break-words min-w-0">{m.title}</span>
            <span className="text-[11.5px] text-slate-400 shrink-0">{timeAgo(m.created_at)}</span>
          </div>
          {m.body && <p className="mt-1 text-[13px] text-slate-600 whitespace-pre-wrap break-words">{m.body}</p>}
          <div className="mt-2 text-[11.5px] text-slate-500">
            إلى ({m.recipient_count}): {m.recipients.slice(0, 6).map(r => r.name ?? '—').join('، ')}{m.recipients.length > 6 ? ` و${m.recipients.length - 6} آخرين` : ''}
          </div>
        </Card>
      ))}
    </div>
  )
}
