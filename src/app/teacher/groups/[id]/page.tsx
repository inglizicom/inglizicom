'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, CalendarPlus, ChevronLeft, Loader2, Lock, MessageCircle, Users, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTeacher } from '@/lib/teacher-context'
import {
  createSession, fetchClassRoster, fetchMyClasses, fetchSessions,
  type ClassRosterRow, type ClassSession, type MyClass,
} from '@/lib/teachers'
import { businessToday, casablancaWallTimeToIso } from '@/lib/enrollment-metrics'
import { Card, DemoBanner, Pill, SectionTitle, STATUS_AR, fmtDateTime } from '../../_ui'
import { DEMO_CLASSES, DEMO_CLASS_ROSTER, DEMO_SESSIONS, isTeacherDemo } from '../../_demo'

const SEAT_AR: Record<ClassRosterRow['status'], string> = { active: 'مسجّل', waitlisted: 'قائمة انتظار', completed: 'أكمل', cancelled: 'غادر' }

/** One of my classes: who is in it (masked phones), and its sessions. The
 *  roster comes from teacher_class_roster(), which refuses any class that is
 *  not mine — changing the id in the URL shows nothing. */
export default function TeacherGroupPage() {
  const { id } = useParams<{ id: string }>()
  const teacher = useTeacher()
  const [klass, setKlass] = useState<MyClass | null>(null)
  const [roster, setRoster] = useState<ClassRosterRow[]>([])
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [demo, setDemo] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (isTeacherDemo()) {
      setDemo(true)
      setKlass(DEMO_CLASSES.find(c => c.id === id) ?? DEMO_CLASSES[0])
      setRoster(DEMO_CLASS_ROSTER); setSessions(DEMO_SESSIONS.filter(s => s.class_id === id))
      setLoading(false); return
    }
    try {
      const [classes, r, all] = await Promise.all([fetchMyClasses(), fetchClassRoster(id), fetchSessions(teacher.id)])
      setKlass(classes.find(c => c.id === id) ?? null)
      setRoster(r); setSessions(all.filter(s => s.class_id === id))
    } catch {
      setDenied(true)
    } finally { setLoading(false) }
  }, [id, teacher.id])
  useEffect(() => { load() }, [load])

  const current = useMemo(() => roster.filter(r => r.status === 'active'), [roster])
  const others  = useMemo(() => roster.filter(r => r.status !== 'active'), [roster])
  const now = Date.now()
  const upcoming = sessions.filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
  const past = sessions.filter(s => !upcoming.includes(s)).sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))

  async function message(r: ClassRosterRow) {
    if (demo) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const text = `مرحباً ${r.full_name.split(' ')[0]}،`
    window.open(`/api/teacher/wa/${r.student_id}?t=${encodeURIComponent(session.access_token)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  if (loading) return <div className="py-32 flex justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>

  if (denied || !klass) {
    return (
      <Card className="p-10 text-center">
        <Lock size={22} className="mx-auto mb-2 text-slate-400" />
        <div className="font-black text-slate-700 mb-1">هذا القسم ليس ضمن أقسامك</div>
        <Link href="/teacher/groups" className="text-[13px] font-bold text-amber-700">العودة إلى أقسامي</Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}
      <Link href="/teacher/groups" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800">
        <ArrowRight size={15} /> أقسامي
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-[14rem]">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Pill tone={klass.mode === 'private' ? 'scheduled' : 'muted'}>{klass.mode === 'private' ? 'فردي' : 'جماعي'}</Pill>
              {klass.level && <Pill tone="muted">{klass.level}</Pill>}
              {!klass.is_owner && <Pill tone="muted">حصص تعويضية — ترى من حضر حصصك فقط</Pill>}
            </div>
            <h1 className="text-inherit text-[23px] font-black tracking-tight">{klass.title}</h1>
            <p className="text-slate-500 text-[13.5px] font-semibold mt-1">
              {klass.course_title ?? 'بدون دورة مرتبطة'}{klass.schedule_note && <> · {klass.schedule_note}</>}
            </p>
          </div>
          {klass.is_owner && klass.status === 'active' && (
            <button onClick={() => !demo && setAdding(true)} disabled={demo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition disabled:opacity-50">
              <CalendarPlus size={15} /> برمج حصة لهذا القسم
            </button>
          )}
        </div>
      </Card>

      {/* Roster */}
      <div>
        <SectionTitle>الطلاب المسجّلون ({current.length}{klass.capacity ? ` / ${klass.capacity}` : ''})</SectionTitle>
        <Card className="divide-y divide-slate-100">
          {current.length === 0 ? (
            <div className="p-6 text-center text-[13.5px] font-semibold text-slate-400">
              <Users size={18} className="mx-auto mb-1" />لا طلاب مسجّلون — تسجّلهم الإدارة من لوحة التحكم.
            </div>
          ) : current.map(r => <RosterRow key={r.enrollment_id} r={r} onMessage={() => message(r)} />)}
        </Card>
        {others.length > 0 && (
          <details className="mt-3">
            <summary className="text-[12.5px] font-bold text-slate-500 cursor-pointer">قائمة الانتظار والسابقون ({others.length})</summary>
            <Card className="divide-y divide-slate-100 mt-2">
              {others.map(r => <RosterRow key={r.enrollment_id} r={r} />)}
            </Card>
          </details>
        )}
      </div>

      {/* Sessions */}
      <div>
        <SectionTitle action={past.length > 0 && (
          <button onClick={() => setShowPast(v => !v)} className="text-[12.5px] font-bold text-slate-500">
            {showPast ? 'إخفاء السابقة' : `السابقة (${past.length})`}
          </button>
        )}>الحصص</SectionTitle>
        <Card className="divide-y divide-slate-100">
          {[...upcoming, ...(showPast ? past : [])].length === 0 ? (
            <div className="p-6 text-center text-[13.5px] font-semibold text-slate-400">لا حصص قادمة.</div>
          ) : [...upcoming, ...(showPast ? past : [])].map(s => (
            <Link key={s.id} href={`/teacher/classes/${s.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] truncate">{s.title}</div>
                <div className="text-[12px] text-slate-400 font-semibold">{fmtDateTime(s.starts_at)} · {s.duration_min} د</div>
              </div>
              <Pill tone={s.status === 'done' ? 'done' : s.status === 'cancelled' ? 'cancelled' : s.status === 'live' ? 'live' : 'scheduled'}>{STATUS_AR[s.status]}</Pill>
              <ChevronLeft size={16} className="text-slate-300" />
            </Link>
          ))}
        </Card>
      </div>

      {adding && (
        <ClassSessionModal klass={klass} teacherId={teacher.id} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load() }} />
      )}
    </div>
  )
}

function RosterRow({ r, onMessage }: { r: ClassRosterRow; onMessage?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3">
      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[13px] shrink-0">
        {r.full_name.trim().charAt(0)}
      </div>
      <div className="flex-1 min-w-[9rem]">
        <div className="font-bold text-[14px] truncate">{r.full_name}</div>
        <div className="text-[11.5px] text-slate-400 font-semibold" dir="ltr" style={{ textAlign: 'right' }}>{r.phone_masked ?? '—'}</div>
      </div>
      {r.status !== 'active' && <Pill tone={r.status === 'waitlisted' ? 'scheduled' : 'muted'}>{SEAT_AR[r.status]}</Pill>}
      <span className="text-[12px] font-bold text-slate-500 tabular-nums" title="حاضر / مسجَّل">
        {r.attendance.marked ? `${r.attendance.present}/${r.attendance.marked} حضور` : '—'}
      </span>
      {onMessage && (
        <button onClick={onMessage} aria-label={`مراسلة ${r.full_name}`}
          className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
          <MessageCircle size={15} />
        </button>
      )}
    </div>
  )
}

/** A session for this class. The database refuses a class that is not mine and
 *  copies the class's mode and course onto the session. */
function ClassSessionModal({ klass, teacherId, onClose, onSaved }: {
  klass: MyClass; teacherId: string; onClose: () => void; onSaved: () => void
}) {
  const [title, setTitle] = useState(klass.title)
  const [date, setDate] = useState(businessToday())
  const [time, setTime] = useState('18:00')
  const [duration, setDuration] = useState(60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim()) { setError('اكتب عنوان الحصة.'); return }
    setBusy(true); setError(null)
    const created = await createSession({
      teacher_id: teacherId, class_id: klass.id, title: title.trim(), mode: klass.mode, level: klass.level,
      starts_at: casablancaWallTimeToIso(date, time), duration_min: duration,
      meeting_url: klass.meeting_url, status: 'scheduled',
    })
    setBusy(false)
    if (!created) { setError('تعذّر حفظ الحصة.'); return }
    onSaved()
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-[14px] font-semibold focus:outline-none focus:border-slate-900'
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-inherit font-black text-[16px]">حصة جديدة — {klass.title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-slate-400 hover:text-slate-600"><X size={19} /></button>
        </div>
        <div className="p-5 space-y-4">
          <label className="block"><span className="block text-[12px] font-black text-slate-500 mb-1.5">العنوان</span>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="block text-[12px] font-black text-slate-500 mb-1.5">التاريخ</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} dir="ltr" /></label>
            <label className="block"><span className="block text-[12px] font-black text-slate-500 mb-1.5">الوقت (توقيت المغرب)</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} dir="ltr" /></label>
          </div>
          <label className="block"><span className="block text-[12px] font-black text-slate-500 mb-1.5">المدة (دقيقة)</span>
            <input type="number" min={15} max={600} step={15} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 60)} className={inputCls} dir="ltr" /></label>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}
          <button onClick={save} disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />} حفظ الحصة
          </button>
        </div>
      </div>
    </div>
  )
}
