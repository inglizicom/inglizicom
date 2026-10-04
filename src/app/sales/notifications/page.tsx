'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Bell, Check, CheckCheck, GraduationCap, Inbox, Loader2, MessageSquareText, Send, Users,
} from 'lucide-react'
import { useStaff } from '@/lib/staff-context'
import { useCrmBasePath } from '@/lib/use-crm-path'
import { ErrorNote, INP, StudentMultiPicker } from '@/components/crm/kit'
import {
  fetchMessageLog, fetchMyNotifications, fetchRecipientOptions, markRead, staffSend, timeAgo, ROLE_AR,
  type AppNotification, type SentMessage,
} from '@/lib/notifications'

/**
 * /sales/notifications (062) — staff:
 *   إرسال     a targeted notification: chosen teachers, chosen students, one
 *             teacher's students, or one class. Never "everyone".
 *   السجل     every message sent through the platform — staff's, teachers' to
 *             their students, students' to their teacher or the academy.
 *   إشعاراتي  my own notifications (the bell, in full).
 */

type Tab = 'send' | 'log' | 'inbox'
const TABS: [Tab, string, typeof Bell][] = [['send', 'إرسال إشعار', Send], ['log', 'سجل الرسائل', MessageSquareText], ['inbox', 'إشعاراتي', Inbox]]

export default function StaffNotificationsPage() {
  return <Suspense fallback={null}><Page /></Suspense>
}

function Page() {
  const sp = useSearchParams()
  const router = useRouter()
  const base = useCrmBasePath()
  const tab = (sp.get('tab') as Tab) || 'send'
  const go = (t: Tab) => router.replace(`${base}/notifications?tab=${t}`, { scroll: false })

  return (
    <div className="px-4 lg:px-8 py-5 max-w-[1000px] mx-auto space-y-4">
      <div className="flex gap-1.5 overflow-x-auto" role="tablist">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => go(id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-colors ${tab === id ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === 'send' && <Compose onSent={() => go('log')} />}
      {tab === 'log' && <Log />}
      {tab === 'inbox' && <MyInbox />}
    </div>
  )
}

/* ── Compose ─────────────────────────────────────────────── */

function Compose({ onSent }: { onSent: () => void }) {
  const [opts, setOpts] = useState<Awaited<ReturnType<typeof fetchRecipientOptions>> | null>(null)
  const [teachers, setTeachers] = useState<Set<string>>(new Set())
  const [students, setStudents] = useState<Set<string>>(new Set())
  const [ofTeacher, setOfTeacher] = useState('')
  const [ofClass, setOfClass] = useState('')
  const [pickStudents, setPickStudents] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => { fetchRecipientOptions().then(setOpts) }, [])

  const toggleTeacher = (id: string) => setTeachers(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const nothing = teachers.size === 0 && students.size === 0 && !ofTeacher && !ofClass

  async function send() {
    setBusy(true); setError(null); setDone(null)
    try {
      const r = await staffSend({
        title, body, teachers: Array.from(teachers), students: Array.from(students),
        studentsOfTeacher: ofTeacher || null, classId: ofClass || null,
      })
      setDone(`أُرسل إلى ${r.teachers} أستاذ و${r.students} طالب.`)
      setTitle(''); setBody(''); setTeachers(new Set()); setStudents(new Set()); setOfTeacher(''); setOfClass('')
      setTimeout(onSent, 1200)
    } catch (e: any) { setError(e?.message ?? 'تعذّر الإرسال.') }
    finally { setBusy(false) }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl bg-white border border-zinc-200 p-4 space-y-4">
        <h2 className="text-[15px] font-extrabold text-zinc-900">إلى من؟ <span className="text-[12px] font-semibold text-zinc-400">— اختر بدقة، لا إرسال للجميع</span></h2>

        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 mb-2"><GraduationCap size={14} /> أساتذة</div>
          <div className="flex flex-wrap gap-1.5">
            {!opts ? <Loader2 size={15} className="animate-spin text-zinc-300" /> : opts.teachers.length === 0
              ? <span className="text-[12px] text-zinc-400">لا أساتذة</span>
              : opts.teachers.map(t => {
                  const on = teachers.has(t.id)
                  return (
                    <button key={t.id} type="button" onClick={() => toggleTeacher(t.id)} aria-pressed={on}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors ${on ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'}`}>
                      {on && <Check size={12} />} {t.name}
                    </button>
                  )
                })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 mb-1"><Users size={14} /> كل طلاب أستاذ</span>
            <select value={ofTeacher} onChange={e => setOfTeacher(e.target.value)} className={INP} aria-label="كل طلاب أستاذ">
              <option value="">—</option>
              {opts?.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 mb-1"><Users size={14} /> كل طلاب قسم</span>
            <select value={ofClass} onChange={e => setOfClass(e.target.value)} className={INP} aria-label="كل طلاب قسم">
              <option value="">—</option>
              {opts?.classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        </div>

        <div>
          <button type="button" onClick={() => setPickStudents(v => !v)}
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-blue-700 hover:text-blue-900">
            <Users size={14} /> {pickStudents ? 'إخفاء قائمة الطلاب' : 'اختيار طلاب بالاسم'}{students.size ? ` · ${students.size} محدَّد` : ''}
          </button>
          {pickStudents && <div className="mt-2"><StudentMultiPicker selected={students} onChange={setStudents} /></div>}
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-zinc-200 p-4 space-y-3 h-fit">
        <h2 className="text-[15px] font-extrabold text-zinc-900">الإشعار</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} className={INP}
          placeholder="العنوان — مثال: تغيير موعد حصة الجمعة" aria-label="العنوان" />
        <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={1000} rows={5} className={INP}
          placeholder="النص (اختياري)" aria-label="النص" />
        <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3.5 py-2.5 text-[12.5px] text-zinc-600 leading-relaxed">
          {nothing ? 'لم تختر أي مستلم بعد.' : (
            <>
              سيصل إلى: {[
                teachers.size > 0 && `${teachers.size} أستاذ`,
                students.size > 0 && `${students.size} طالب`,
                ofTeacher && `طلاب ${opts?.teachers.find(t => t.id === ofTeacher)?.name ?? ''}`,
                ofClass && `طلاب قسم «${opts?.classes.find(c => c.id === ofClass)?.title ?? ''}»`,
              ].filter(Boolean).join(' · ')}
              <span className="block text-[11.5px] text-zinc-400 mt-0.5">في الجرس داخل المنصة، وعلى الهاتف لمن فعّل الإشعارات.</span>
            </>
          )}
        </div>
        <ErrorNote>{error}</ErrorNote>
        {done && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] font-bold text-emerald-700">{done}</div>}
        <button onClick={send} disabled={busy || nothing || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 text-white text-[14px] font-black disabled:opacity-40">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} إرسال
        </button>
      </section>
    </div>
  )
}

/* ── Log ─────────────────────────────────────────────────── */

const ROLE_TONE: Record<SentMessage['sender_role'], string> = {
  founder: 'bg-amber-50 text-amber-800 border-amber-200', assistant: 'bg-sky-50 text-sky-800 border-sky-200',
  teacher: 'bg-violet-50 text-violet-800 border-violet-200', student: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

function Log() {
  const [rows, setRows] = useState<SentMessage[] | null>(null)
  const [who, setWho] = useState<'all' | 'staff' | 'teacher' | 'student'>('all')
  useEffect(() => { fetchMessageLog(200).then(setRows) }, [])
  const shown = useMemo(() => (rows ?? []).filter(m =>
    who === 'all' ? true : who === 'staff' ? m.sender_role === 'founder' || m.sender_role === 'assistant' : m.sender_role === who), [rows, who])

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto">
        {([['all', 'الكل'], ['staff', 'من الإدارة'], ['teacher', 'من الأساتذة'], ['student', 'من الطلاب']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setWho(id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold border ${who === id ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}>
            {label}
          </button>
        ))}
      </div>
      {rows === null ? (
        <div className="py-16 flex justify-center text-zinc-300"><Loader2 className="animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl bg-white border border-zinc-200 py-12 text-center text-[13px] text-zinc-400">لا رسائل بعد</div>
      ) : shown.map(m => (
        <article key={m.id} className="rounded-2xl bg-white border border-zinc-200 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${ROLE_TONE[m.sender_role]}`}>{ROLE_AR[m.sender_role]}</span>
            <span className="text-[13px] font-extrabold text-zinc-900">{m.sender_name ?? '—'}</span>
            <span className="text-[11.5px] text-zinc-400 mr-auto">{timeAgo(m.created_at)}</span>
          </div>
          <div className="mt-2 text-[14px] font-bold text-zinc-900 break-words">{m.title}</div>
          {m.body && <p className="mt-1 text-[13px] text-zinc-600 leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>}
          <div className="mt-2 text-[11.5px] text-zinc-500">
            إلى ({m.recipient_count}): {m.recipients.slice(0, 6).map(r => r.name ?? '—').join('، ')}{m.recipients.length > 6 ? ` و${m.recipients.length - 6} آخرين` : ''}
          </div>
        </article>
      ))}
    </div>
  )
}

/* ── My notifications ────────────────────────────────────── */

function MyInbox() {
  const staff = useStaff()
  const base = useCrmBasePath()
  const router = useRouter()
  const [rows, setRows] = useState<AppNotification[] | null>(null)
  useEffect(() => { fetchMyNotifications(staff.id, 100).then(setRows) }, [staff.id])

  async function readAll() {
    await markRead()
    setRows(r => r?.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })) ?? null)
  }
  function open(n: AppNotification) {
    if (!n.read_at) { markRead([n.id]); setRows(r => r?.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? null) }
    if (n.url) router.push(n.url.startsWith('/sales') ? base + n.url.slice('/sales'.length) || '/' : n.url)
  }

  return (
    <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <span className="text-[14px] font-extrabold text-zinc-900">إشعاراتي</span>
        <button onClick={readAll} className="flex items-center gap-1 text-[12px] font-bold text-blue-700"><CheckCheck size={14} /> تحديد الكل كمقروء</button>
      </div>
      {rows === null ? (
        <div className="py-16 flex justify-center text-zinc-300"><Loader2 className="animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-zinc-400">لا إشعارات</div>
      ) : rows.map(n => (
        <button key={n.id} onClick={() => open(n)}
          className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 ${n.read_at ? '' : 'bg-blue-50/40'}`}>
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read_at ? 'bg-transparent' : 'bg-rose-500'}`} />
          <span className="flex-1 min-w-0">
            <span className="block text-[13.5px] font-bold text-zinc-900 break-words">{n.title}</span>
            {n.body && <span className="block text-[12.5px] text-zinc-500 leading-relaxed break-words">{n.body}</span>}
          </span>
          <span className="text-[11px] text-zinc-400 shrink-0">{timeAgo(n.created_at)}</span>
        </button>
      ))}
    </div>
  )
}
