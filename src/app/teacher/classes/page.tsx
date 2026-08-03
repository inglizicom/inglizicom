'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CalendarPlus, ChevronLeft, Loader2, Video, X } from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  createSession, fetchSessions,
  type ClassSession, type SessionStatus,
} from '@/lib/teachers'
import { Card, DemoBanner, Empty, PageHero, Pill, SectionTitle, fmtDate, fmtTime, STATUS_AR } from '../_ui'
import { DEMO_SESSIONS, isTeacherDemo } from '../_demo'

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']

/** The schedule. Group cohorts and 1-on-1 privates live in the same list —
 *  what differs is the mode chip and who shows up on the attendance sheet. */
export default function TeacherClassesPage() {
  const teacher = useTeacher()
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'upcoming' | 'past'>('upcoming')
  const [adding,   setAdding]   = useState(false)

  const [demo, setDemo] = useState(false)

  const load = useCallback(async () => {
    if (isTeacherDemo()) { setDemo(true); setSessions(DEMO_SESSIONS); setLoading(false); return }
    setLoading(true)
    const rows = await fetchSessions(teacher.id)
    setSessions(rows)
    setLoading(false)
  }, [teacher.id])

  useEffect(() => { load() }, [load])

  const now      = Date.now()
  const upcoming = sessions.filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
  const past     = sessions.filter(s => new Date(s.starts_at).getTime() <  now - 3600_000 || s.status === 'cancelled')
                           .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
  const shown    = tab === 'upcoming' ? upcoming : past

  // Group by day so the list reads like a week, not a spreadsheet.
  const byDay = shown.reduce<Record<string, ClassSession[]>>((acc, s) => {
    const key = new Date(s.starts_at).toDateString()
    ;(acc[key] ||= []).push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {demo && <DemoBanner />}

      <PageHero
        icon={CalendarDays} tone="blue" title="حصصي"
        subtitle="الجدول الكامل — القادم والمنتهي"
        stats={[
          { label: 'قادمة',        value: upcoming.length },
          { label: 'منتهية',       value: past.filter(s => s.status === 'done').length },
          { label: 'ساعات مُنجزة', value: Math.round(past.filter(s => s.status === 'done').reduce((a, s) => a + s.duration_min, 0) / 6) / 10 },
          { label: 'ملغاة',        value: past.filter(s => s.status === 'cancelled').length },
        ]}
        action={
          <button
            onClick={() => !demo && setAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-stone-900 text-[13px] font-black hover:bg-stone-100 transition shadow disabled:opacity-50"
            disabled={demo}
          >
            <CalendarPlus size={16} /> برمج حصة
          </button>
        }
      />

      <div className="flex gap-1.5">
        {([['upcoming', 'القادمة'], ['past', 'السابقة']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition ${
              tab === key ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
      ) : shown.length === 0 ? (
        <Card>
          <Empty
            icon={CalendarPlus}
            title={tab === 'upcoming' ? 'لا حصص قادمة' : 'لا حصص سابقة'}
            hint={tab === 'upcoming' ? 'برمج حصصك حتى تُحتسب ساعاتك ويظهر الحضور والتقارير.' : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {Object.entries(byDay).map(([day, rows]) => (
            <div key={day}>
              <SectionTitle>{fmtDate(rows[0].starts_at)}</SectionTitle>
              <Card className="divide-y divide-stone-100">
                {rows.map(s => (
                  <Link key={s.id} href={`/teacher/classes/${s.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition">
                    <div className="w-14 shrink-0">
                      <div className="text-[15px] font-black tabular-nums">{fmtTime(s.starts_at)}</div>
                      <div className="text-[11px] text-stone-400 font-bold">{s.duration_min} د</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-[15px] truncate">{s.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Pill tone={s.status === 'done' ? 'done' : s.status === 'cancelled' ? 'cancelled' : s.status === 'live' ? 'live' : 'scheduled'}>
                          {STATUS_AR[s.status]}
                        </Pill>
                        <Pill tone="muted">{STATUS_AR[s.mode]}</Pill>
                        {s.level && <Pill tone="muted">{s.level}</Pill>}
                      </div>
                    </div>
                    {s.meeting_url && s.status === 'scheduled' && (
                      <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold text-emerald-600">
                        <Video size={14} /> رابط جاهز
                      </span>
                    )}
                    <ChevronLeft size={18} className="text-stone-300 shrink-0" />
                  </Link>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <NewSessionModal
          teacherId={teacher.id}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); load() }}
        />
      )}
    </div>
  )
}

/* ── Create ──────────────────────────────────────────── */

function NewSessionModal({
  teacherId, onClose, onSaved,
}: { teacherId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle]       = useState('')
  const [mode, setMode]         = useState<'group' | 'private'>('group')
  const [level, setLevel]       = useState('')
  const [date, setDate]         = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime]         = useState('18:00')
  const [duration, setDuration] = useState(60)
  const [meetingUrl, setUrl]    = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function save() {
    if (!title.trim()) { setError('اكتب عنوان الحصة.'); return }
    const startsAt = new Date(`${date}T${time}`)
    if (isNaN(startsAt.getTime())) { setError('التاريخ أو الوقت غير صحيح.'); return }

    setBusy(true); setError(null)
    const created = await createSession({
      teacher_id:   teacherId,
      title:        title.trim(),
      mode,
      level:        level || null,
      starts_at:    startsAt.toISOString(),
      duration_min: duration,
      meeting_url:  meetingUrl.trim() || null,
      status:       'scheduled' as SessionStatus,
    })
    setBusy(false)
    if (!created) { setError('تعذّر حفظ الحصة. حاول مرة أخرى.'); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white">
          <h2 className="font-black text-[16px]">حصة جديدة</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-stone-400 hover:text-stone-600"><X size={19} /></button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block">
            <span className="block text-[12px] font-black text-stone-500 mb-1.5">عنوان الحصة</span>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="مثلاً: الوحدة 3 — الماضي البسيط" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[12px] font-black text-stone-500 mb-1.5">النوع</span>
              <select value={mode} onChange={e => setMode(e.target.value as 'group' | 'private')} className={inputCls}>
                <option value="group">جماعية</option>
                <option value="private">فردية</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-[12px] font-black text-stone-500 mb-1.5">المستوى</span>
              <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[12px] font-black text-stone-500 mb-1.5">التاريخ</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-[12px] font-black text-stone-500 mb-1.5">الوقت</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="block text-[12px] font-black text-stone-500 mb-1.5">المدة (دقيقة)</span>
            <input type="number" min={15} step={15} value={duration}
                   onChange={e => setDuration(parseInt(e.target.value) || 60)} className={inputCls} />
          </label>

          <label className="block">
            <span className="block text-[12px] font-black text-stone-500 mb-1.5">رابط الحصة</span>
            <input value={meetingUrl} onChange={e => setUrl(e.target.value)} dir="ltr"
                   className={`${inputCls} text-left`} placeholder="Google Meet · Zoom · WhatsApp" />
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>
          )}

          <button
            onClick={save} disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-black hover:bg-stone-800 transition disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} حفظ الحصة
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition'
