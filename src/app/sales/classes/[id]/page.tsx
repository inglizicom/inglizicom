'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Archive, ArchiveRestore, ArrowRight, CalendarPlus, CheckCircle2, ClipboardList, Loader2, Pencil,
  UserPlus, Users, AlertTriangle, CalendarX,
  UserCheck,
} from 'lucide-react'
import { useCrmBasePath } from '@/lib/use-crm-path'
import {
  CLASS_STATUS_AR, MODE_AR, SEAT_STATUS_AR, cancelSession, enrollInClass, fetchAttendanceWithoutSeat,
  fetchOnlineClassDetail, fmtDay, scheduleClassSessions, setClassArchived, setSeatStatus,
  type AttendanceOnlyStudent, type ClassSessionRow, type EnrollResult, type OnlineClassDetail, type RosterSeat, type SeatStatus,
} from '@/lib/online-classes'
import { businessToday, casablancaWallTimeToIso, datesOnWeekdays } from '@/lib/enrollment-metrics'
import { Badge, ConfirmDialog, ErrorNote, Field, INP, Modal, StudentMultiPicker } from '@/components/crm/kit'
import ClassForm from '../ClassForm'
import { useStaff } from '@/lib/staff-context'
import { fetchAttendance, markAttendance, type AttendanceStatus } from '@/lib/teachers'

const SESSION_STATUS_AR: Record<string, string> = { scheduled: 'مبرمجة', live: 'جارية', done: 'منتهية', cancelled: 'ملغاة' }

type Pending =
  | { kind: 'seat'; seat: RosterSeat; to: SeatStatus }
  | { kind: 'archive' }
  | { kind: 'cancelSession'; id: string; title: string }
  | { kind: 'enrollFromAttendance'; students: AttendanceOnlyStudent[] }
  | { kind: 'attendance'; session: ClassSessionRow }

export default function OnlineClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const base = useCrmBasePath()
  const [data, setData] = useState<OnlineClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [seatFilter, setSeatFilter] = useState<'open' | 'ended' | 'all'>('open')
  const [orphans, setOrphans] = useState<AttendanceOnlyStudent[]>([])

  const load = useCallback(async () => {
    setError(null)
    try {
      const [d, o] = await Promise.all([fetchOnlineClassDetail(id), fetchAttendanceWithoutSeat(id)])
      setData(d); setOrphans(o)
    } catch (e: any) { setError(e?.message ?? 'تعذّر التحميل.') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { load() }, [load])

  const roster = data?.roster ?? []
  const shownSeats = useMemo(() => roster.filter(s =>
    seatFilter === 'all' ? true : seatFilter === 'open' ? (s.status === 'active' || s.status === 'waitlisted')
      : (s.status === 'completed' || s.status === 'cancelled')), [roster, seatFilter])
  const openIds = useMemo(() => new Set(roster.filter(s => s.status === 'active' || s.status === 'waitlisted').map(s => s.student_id)), [roster])

  if (loading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-zinc-300" size={26} /></div>
  if (!data) return (
    <div className="p-6 max-w-3xl mx-auto" dir="rtl">
      <ErrorNote>{error ?? 'لم نجد هذا القسم.'}</ErrorNote>
      <Link href={`${base}/classes`} className="inline-block mt-3 text-[13px] font-bold text-blue-600">← الأقسام المباشرة</Link>
    </div>
  )

  const c = data.class
  const active = roster.filter(s => s.status === 'active').length
  const waiting = roster.filter(s => s.status === 'waitlisted').length
  const cap = c.mode === 'private' ? 1 : c.capacity
  const now = Date.now()
  const upcoming = data.sessions.filter(s => new Date(s.starts_at).getTime() >= now - 3600_000 && s.status !== 'cancelled')
  const past = data.sessions.filter(s => !upcoming.includes(s)).reverse()
  const done = data.sessions.filter(s => s.status === 'done')
  const marks = done.reduce((a, s) => a + s.marks, 0)
  const present = done.reduce((a, s) => a + s.present, 0)
  const open = c.status === 'active' && !c.archived_at

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4" dir="rtl">
      <Link href={`${base}/classes`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 hover:text-zinc-800">
        <ArrowRight size={15} /> الأقسام المباشرة
      </Link>

      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[14rem]">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge tone={c.mode}>{MODE_AR[c.mode]}</Badge>
              <Badge tone={c.status}>{CLASS_STATUS_AR[c.status]}</Badge>
              {c.level && <Badge tone="cancelled">{c.level}</Badge>}
              {c.archived_at && <Badge tone="archived">مؤرشف منذ {fmtDay(c.archived_at)}</Badge>}
            </div>
            <h1 className="text-[21px] font-black text-zinc-900">{c.title}</h1>
            <div className="text-[13px] text-zinc-500 mt-1 space-x-reverse space-x-2">
              <span>الأستاذ: {c.teacher_name ?? <b className="text-red-600">غير مُسند</b>}</span>
              {c.course_title && <span>· الدورة: {c.course_title}</span>}
            </div>
            <div className="text-[12px] text-zinc-400 mt-1">
              {fmtDay(c.starts_on)} → {fmtDay(c.ends_on)}{c.schedule_note && <> · {c.schedule_note}</>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-[12.5px] font-bold text-zinc-700 hover:bg-zinc-50">
              <Pencil size={14} /> تعديل / تغيير الأستاذ
            </button>
            {c.archived_at ? (
              <button onClick={async () => { await setClassArchived(c.id, false); load() }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-[12.5px] font-bold text-zinc-700 hover:bg-zinc-50">
                <ArchiveRestore size={14} /> استرجاع من الأرشيف
              </button>
            ) : (
              <button onClick={() => setPending({ kind: 'archive' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-[12.5px] font-bold text-zinc-500 hover:bg-zinc-50">
                <Archive size={14} /> أرشفة
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <Kpi label="المقاعد المشغولة" value={cap ? `${active} / ${cap}` : String(active)} />
          <Kpi label="قائمة الانتظار" value={c.waitlist_enabled || waiting ? String(waiting) : '—'} />
          <Kpi label="حصص منجزة" value={String(done.length)} />
          <Kpi label="نسبة الحضور (كل الحصص)" value={marks ? `${Math.round((present / marks) * 100)}%` : '—'} />
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {/* Attended without a seat — explicit review */}
      {orphans.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-[13.5px] font-black text-amber-900">{orphans.length} طالب لديهم حضور في حصص هذا القسم دون تسجيل فيه</div>
              <p className="text-[12px] text-amber-800">الحضور لا يُعتبر تسجيلًا. راجع القائمة وسجّل من يخصّه القسم فعلًا.</p>
            </div>
            <button onClick={() => setPending({ kind: 'enrollFromAttendance', students: orphans })} disabled={!open}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[12px] font-bold disabled:opacity-40">مراجعة وتسجيل</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {orphans.map(o => <span key={o.student_id} className="text-[11.5px] font-bold bg-white border border-amber-200 rounded-full px-2.5 py-0.5 text-amber-900">{o.full_name} · {o.present}/{o.marks}</span>)}
          </div>
        </div>
      )}

      {/* Roster */}
      <section className="bg-white border border-zinc-200 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <Users size={16} className="text-zinc-400" />
          <h2 className="font-black text-[14.5px] text-zinc-900 flex-1">الطلاب المسجّلون</h2>
          <div className="flex gap-1">
            {([['open', 'الحاليون'], ['ended', 'السابقون'], ['all', 'الكل']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setSeatFilter(k)}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${seatFilter === k ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => setAdding(true)} disabled={!open}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-[12.5px] font-bold disabled:opacity-40"
            title={open ? '' : 'القسم مغلق للتسجيل'}>
            <UserPlus size={14} /> إضافة طلاب
          </button>
        </div>
        {shownSeats.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-zinc-400">لا طلاب في هذه القائمة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[46rem]">
              <thead>
                <tr className="text-[11px] text-zinc-400 border-b border-zinc-100">
                  <th className="text-right font-bold px-4 py-2">الطالب</th>
                  <th className="text-right font-bold px-2 py-2">الحالة</th>
                  <th className="text-right font-bold px-2 py-2">التسجيل</th>
                  <th className="text-right font-bold px-2 py-2">البداية → النهاية</th>
                  <th className="text-center font-bold px-2 py-2">الحضور</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {shownSeats.map(s => (
                  <tr key={s.enrollment_id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-2.5">
                      <Link href={`${base}/students/${s.student_id}`} className="font-bold text-zinc-900 hover:text-blue-700">{s.full_name}</Link>
                      {s.end_reason && <div className="text-[11px] text-zinc-400 truncate max-w-[16rem]">السبب: {s.end_reason}</div>}
                    </td>
                    <td className="px-2"><Badge tone={s.status}>{SEAT_STATUS_AR[s.status]}</Badge></td>
                    <td className="px-2 text-zinc-600">{fmtDay(s.enrolled_at)}</td>
                    <td className="px-2 text-zinc-500 text-[12px]">{fmtDay(s.start_date)} → {s.ended_at ? fmtDay(s.ended_at) : fmtDay(s.end_date)}</td>
                    <td className="px-2 text-center tabular-nums">{s.attendance.marked ? `${s.attendance.present}/${s.attendance.marked}` : '—'}</td>
                    <td className="px-4">
                      <div className="flex gap-1 justify-end">
                        {s.status === 'waitlisted' && (
                          <SeatBtn onClick={() => setPending({ kind: 'seat', seat: s, to: 'active' })} tone="green">ترقية لمقعد</SeatBtn>
                        )}
                        {s.status === 'active' && (
                          <SeatBtn onClick={() => setPending({ kind: 'seat', seat: s, to: 'completed' })} tone="blue">إكمال</SeatBtn>
                        )}
                        {(s.status === 'active' || s.status === 'waitlisted') && (
                          <SeatBtn onClick={() => setPending({ kind: 'seat', seat: s, to: 'cancelled' })} tone="red">إلغاء التسجيل</SeatBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Schedule */}
      <section className="bg-white border border-zinc-200 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <ClipboardList size={16} className="text-zinc-400" />
          <h2 className="font-black text-[14.5px] text-zinc-900 flex-1">جدول الحصص</h2>
          <button onClick={() => setScheduling(true)} disabled={!open || !c.teacher_id}
            title={!c.teacher_id ? 'أسنِد أستاذًا أولًا' : ''}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[12.5px] font-bold disabled:opacity-40">
            <CalendarPlus size={14} /> برمجة حصص
          </button>
        </div>
        {data.sessions.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-zinc-400">لا حصص بعد. برمج الحصص أو اربط حصصًا قائمة من صفحة الأقسام.</div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {[...upcoming, ...past].map(s => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <div className="w-32 shrink-0 text-[12.5px] font-bold text-zinc-700">{fmtDay(s.starts_at)}
                  <div className="text-[11px] font-normal text-zinc-400" dir="ltr">
                    {new Date(s.starts_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' })} · {s.duration_min}′
                  </div>
                </div>
                <div className="flex-1 min-w-[10rem]">
                  <div className="text-[13px] font-bold text-zinc-800">{s.title}</div>
                  <div className="text-[11px] text-zinc-400">{s.teacher_name ?? '—'}{s.cancel_reason && <> · سبب الإلغاء: {s.cancel_reason}</>}</div>
                </div>
                <Badge tone={s.status === 'done' ? 'completed' : s.status === 'cancelled' ? 'cancelled' : 'active'}>{SESSION_STATUS_AR[s.status]}</Badge>
                <span className="text-[12px] tabular-nums text-zinc-500 w-20 text-center">{s.marks ? `${s.present}/${s.marks} حضور` : '—'}</span>
                <span className="w-24 text-center">
                  {s.status === 'done'
                    ? (s.has_report ? <span className="text-[11.5px] font-bold text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 size={13} /> تقرير</span>
                                    : <span className="text-[11.5px] font-bold text-red-600">تقرير ناقص</span>)
                    : null}
                </span>
                {s.status !== 'cancelled' && new Date(s.starts_at).getTime() <= Date.now() + 15 * 60_000 && (
                  <button onClick={() => setPending({ kind: 'attendance', session: s })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 text-[11.5px] font-bold text-zinc-600 hover:border-blue-300 hover:text-blue-700">
                    <UserCheck size={13} /> الحضور
                  </button>
                )}
                {(s.status === 'scheduled' || s.status === 'live') && (
                  <button onClick={() => setPending({ kind: 'cancelSession', id: s.id, title: s.title })}
                    className="text-zinc-400 hover:text-red-600" aria-label="إلغاء الحصة"><CalendarX size={16} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <ClassForm initial={{ ...c, active_count: active } as any} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load() }} />
      )}

      {adding && (
        <AddStudentsModal classId={c.id} waitlistEnabled={c.waitlist_enabled} exclude={openIds}
          onClose={() => setAdding(false)} onDone={() => load()} />
      )}

      {scheduling && c.teacher_id && (
        <ScheduleModal classId={c.id} teacherId={c.teacher_id} defaultTitle={c.title} startsOn={c.starts_on} endsOn={c.ends_on}
          meetingUrl={c.meeting_url} onClose={() => setScheduling(false)} onDone={() => { setScheduling(false); load() }} />
      )}

      {pending?.kind === 'seat' && (
        <ConfirmDialog
          title={pending.to === 'cancelled' ? 'إلغاء التسجيل في القسم' : pending.to === 'completed' ? 'إكمال التسجيل' : 'ترقية من قائمة الانتظار'}
          danger={pending.to === 'cancelled'}
          body={pending.to === 'cancelled'
            ? <>سيُلغى تسجيل <b>{pending.seat.full_name}</b> في هذا القسم ويُحرَّر مقعده. لن يظهر في قائمة الأستاذ للحصص القادمة.</>
            : pending.to === 'completed'
              ? <>سيُعتبر <b>{pending.seat.full_name}</b> قد أكمل هذا القسم.</>
              : <>سيأخذ <b>{pending.seat.full_name}</b> مقعدًا نشطًا (إن وُجد مقعد فارغ).</>}
          keeps={pending.to === 'active' ? undefined : ['سجلّ التسجيل وتاريخه', 'كل الحضور والتقارير السابقة', 'المدفوعات ونشاط الطالب']}
          askReason={pending.to !== 'active'}
          confirmLabel={pending.to === 'cancelled' ? 'إلغاء التسجيل' : pending.to === 'completed' ? 'إكمال' : 'ترقية'}
          onConfirm={async (reason) => { await setSeatStatus(pending.seat.enrollment_id, pending.to, { reason: reason || null }); await load() }}
          onClose={() => setPending(null)}
        />
      )}
      {pending?.kind === 'archive' && (
        <ConfirmDialog title="أرشفة القسم" danger={false}
          body={<>سيختفي القسم من القوائم اليومية ولن يقبل تسجيلات جديدة. يمكن استرجاعه في أي وقت.</>}
          keeps={['الطلاب المسجّلون وتواريخهم', 'الحصص والحضور والتقارير', 'الأرقام في التحليلات']}
          confirmLabel="أرشفة"
          onConfirm={async () => { await setClassArchived(c.id, true); await load() }}
          onClose={() => setPending(null)} />
      )}
      {pending?.kind === 'cancelSession' && (
        <ConfirmDialog title="إلغاء الحصة"
          body={<>ستُلغى حصة «{pending.title}». تبقى في الجدول بحالة «ملغاة» وتُحسب ضمن الإلغاءات.</>}
          keeps={['أي حضور أو تقرير مسجّل']}
          askReason reasonLabel="سبب الإلغاء"
          confirmLabel="إلغاء الحصة"
          onConfirm={async (reason) => { await cancelSession(pending.id, reason || null); await load() }}
          onClose={() => setPending(null)} />
      )}
      {pending?.kind === 'attendance' && (
        <AttendanceModal session={pending.session} roster={roster}
          onClose={() => setPending(null)} onDone={() => { setPending(null); load() }} />
      )}
      {pending?.kind === 'enrollFromAttendance' && (
        <EnrollFromAttendance classId={c.id} students={pending.students}
          onClose={() => setPending(null)} onDone={() => { setPending(null); load() }} />
      )}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
      <div className="text-[11px] text-zinc-400">{label}</div>
      <div className="text-[18px] font-black text-zinc-900 tabular-nums" dir="ltr" style={{ textAlign: 'right' }}>{value}</div>
    </div>
  )
}

function SeatBtn({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: 'green' | 'blue' | 'red' }) {
  const t = tone === 'green' ? 'text-emerald-700 hover:bg-emerald-50' : tone === 'blue' ? 'text-sky-700 hover:bg-sky-50' : 'text-red-600 hover:bg-red-50'
  return <button onClick={onClick} className={`px-2 py-1 rounded-lg text-[11.5px] font-bold whitespace-nowrap ${t}`}>{children}</button>
}

const RESULT_AR: Record<string, string> = {
  active: 'سُجّل', waitlisted: 'قائمة انتظار', duplicate: 'مسجّل من قبل', not_found: 'غير موجود', error: 'خطأ',
}

/** Bulk enrollment: one result per student; a full class or a duplicate never aborts the rest. */
function AddStudentsModal({ classId, waitlistEnabled, exclude, onClose, onDone }: {
  classId: string; waitlistEnabled: boolean; exclude: Set<string>; onClose: () => void; onDone: () => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [names, setNames] = useState<Record<string, string>>({})
  const [enrolledOn, setEnrolledOn] = useState(businessToday())
  const [startDate, setStartDate] = useState('')
  const [waitlist, setWaitlist] = useState(false)
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<EnrollResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    setBusy(true); setError(null)
    try {
      const r = await enrollInClass(classId, [...picked], { enrolledOn, startDate: startDate || null, waitlist })
      setResults(r); setPicked(new Set()); onDone()
    } catch (e: any) { setError(e?.message ?? 'تعذّر التسجيل.') }
    finally { setBusy(false) }
  }

  return (
    <Modal title="تسجيل طلاب في القسم" onClose={onClose} wide>
      <div className="space-y-3">
        <StudentMultiPicker selected={picked} onChange={setPicked} exclude={exclude}
          onLoaded={list => setNames(Object.fromEntries(list.map(s => [s.id, s.full_name])))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Field label="تاريخ التسجيل" hint="يُستعمل في منحنى التسجيلات.">
            <input type="date" value={enrolledOn} max={businessToday()} onChange={e => setEnrolledOn(e.target.value)} dir="ltr" className={INP} />
          </Field>
          <Field label="تاريخ البدء (اختياري)">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} dir="ltr" className={INP} />
          </Field>
          {waitlistEnabled && (
            <label className="flex items-center gap-2 text-[12.5px] font-bold text-zinc-700 pb-2.5">
              <input type="checkbox" checked={waitlist} onChange={e => setWaitlist(e.target.checked)} className="accent-yellow-400" />
              إضافتهم لقائمة الانتظار
            </label>
          )}
        </div>
        <ErrorNote>{error}</ErrorNote>
        {results && (
          <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-[12.5px] max-h-40 overflow-y-auto">
            {results.map(r => (
              <div key={r.student_id} className="flex items-center justify-between px-3 py-1.5">
                <span className="text-zinc-700 font-bold truncate">{names[r.student_id] ?? r.student_id.slice(0, 8)}</span>
                <span className={r.result === 'active' ? 'text-emerald-700 font-bold' : r.result === 'waitlisted' ? 'text-amber-700 font-bold' : 'text-zinc-500'}>
                  {RESULT_AR[r.result]}{'message' in r && r.message ? ` — ${r.message}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={go} disabled={busy || picked.size === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-bold text-[13px] disabled:opacity-40">
            {busy && <Loader2 size={14} className="animate-spin" />} تسجيل {picked.size || ''} طالب
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-500">إغلاق</button>
        </div>
      </div>
    </Modal>
  )
}

const WEEKDAYS: [number, string][] = [[1, 'الإثنين'], [2, 'الثلاثاء'], [3, 'الأربعاء'], [4, 'الخميس'], [5, 'الجمعة'], [6, 'السبت'], [7, 'الأحد']]

/** Recurring schedule in Morocco time: chosen weekdays between two dates. */
function ScheduleModal({ classId, teacherId, defaultTitle, startsOn, endsOn, meetingUrl, onClose, onDone }: {
  classId: string; teacherId: string; defaultTitle: string; startsOn: string | null; endsOn: string | null
  meetingUrl: string | null; onClose: () => void; onDone: () => void
}) {
  const today = businessToday()
  const [title, setTitle] = useState(defaultTitle)
  const [from, setFrom] = useState(startsOn && startsOn > today ? startsOn : today)
  const [to, setTo] = useState(endsOn ?? from)
  const [days, setDays] = useState<number[]>([])
  const [time, setTime] = useState('18:00')
  const [duration, setDuration] = useState(60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dates = useMemo(() => days.length ? datesOnWeekdays(from, to, days, 120) : (from ? [from] : []), [from, to, days])

  async function go() {
    if (!title.trim()) { setError('اكتب عنوان الحصة.'); return }
    if (dates.length === 0) { setError('لا توجد تواريخ في هذه المدة.'); return }
    setBusy(true); setError(null)
    try {
      await scheduleClassSessions({
        classId, teacherId, title: title.trim(), durationMin: duration, meetingUrl,
        startsAt: dates.map(d => casablancaWallTimeToIso(d, time)),
      })
      onDone()
    } catch (e: any) { setError(e?.message ?? 'تعذّر الحفظ.'); setBusy(false) }
  }

  return (
    <Modal title="برمجة حصص للقسم" onClose={onClose}>
      <div className="space-y-3">
        <Field label="العنوان"><input value={title} onChange={e => setTitle(e.target.value)} className={INP} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="من"><input type="date" value={from} onChange={e => setFrom(e.target.value)} dir="ltr" className={INP} /></Field>
          <Field label="إلى"><input type="date" value={to} onChange={e => setTo(e.target.value)} dir="ltr" className={INP} disabled={days.length === 0} /></Field>
        </div>
        <div>
          <span className="block text-[11.5px] font-bold text-zinc-500 mb-1">أيام التكرار (بدون اختيار = حصة واحدة)</span>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map(([n, l]) => (
              <button key={n} type="button" onClick={() => setDays(d => d.includes(n) ? d.filter(x => x !== n) : [...d, n])}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold border ${days.includes(n) ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الساعة (بتوقيت المغرب)"><input type="time" value={time} onChange={e => setTime(e.target.value)} dir="ltr" className={INP} /></Field>
          <Field label="المدة (دقيقة)"><input type="number" min={15} max={600} step={15} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 60)} dir="ltr" className={INP} /></Field>
        </div>
        <div className="text-[12px] text-zinc-500">{dates.length} حصة{dates.length ? `: ${dates.slice(0, 4).join('، ')}${dates.length > 4 ? '…' : ''}` : ''}</div>
        <ErrorNote>{error}</ErrorNote>
        <button onClick={go} disabled={busy || dates.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-bold text-[13px] disabled:opacity-40">
          {busy && <Loader2 size={14} className="animate-spin" />} برمجة {dates.length} حصة
        </button>
      </div>
    </Modal>
  )
}

/** Review students who attended without a seat; enroll only the ones staff tick. */
function EnrollFromAttendance({ classId, students, onClose, onDone }: {
  classId: string; students: AttendanceOnlyStudent[]; onClose: () => void; onDone: () => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function go() {
    setBusy(true); setError(null)
    try {
      for (const s of students.filter(x => picked.has(x.student_id))) {
        // enrollment date = their first attended session (Morocco day), set explicitly by staff here
        const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date(s.first_at))
        await enrollInClass(classId, [s.student_id], { enrolledOn: day })
      }
      onDone()
    } catch (e: any) { setError(e?.message ?? 'تعذّر التسجيل.'); setBusy(false) }
  }
  return (
    <Modal title="حضروا دون تسجيل" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12.5px] text-zinc-600 leading-relaxed">
          اختر من يجب تسجيله في هذا القسم. يُسجَّل بتاريخ أول حصة حضرها. من لا تختاره يبقى غير مسجّل، وحضوره محفوظ.
        </p>
        <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
          {students.map(s => (
            <label key={s.student_id} className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-zinc-50">
              <input type="checkbox" className="accent-yellow-400" checked={picked.has(s.student_id)}
                onChange={() => setPicked(p => { const n = new Set(p); n.has(s.student_id) ? n.delete(s.student_id) : n.add(s.student_id); return n })} />
              <span className="flex-1 text-[13px] font-bold text-zinc-800">{s.full_name}</span>
              <span className="text-[11.5px] text-zinc-400">{s.present}/{s.marks} · منذ {fmtDay(s.first_at)}</span>
            </label>
          ))}
        </div>
        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-2">
          <button onClick={go} disabled={busy || picked.size === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-bold text-[13px] disabled:opacity-40">
            {busy && <Loader2 size={14} className="animate-spin" />} تسجيل {picked.size || ''} طالب
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-500">إلغاء</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Attendance for one session (staff) ──────────────────
   Assistants and founders mark it when the teacher has not (058). Lists the
   students seated in the class — active, plus anyone already marked — and
   saves everyone in one upsert, so re-opening and correcting is safe. */
const ATT_STATUS: { id: AttendanceStatus; label: string; cls: string }[] = [
  { id: 'present', label: 'حاضر',  cls: 'bg-emerald-600 text-white border-emerald-600' },
  { id: 'late',    label: 'متأخر', cls: 'bg-amber-500 text-white border-amber-500' },
  { id: 'absent',  label: 'غائب',  cls: 'bg-red-600 text-white border-red-600' },
  { id: 'excused', label: 'معذور', cls: 'bg-zinc-600 text-white border-zinc-600' },
]

function AttendanceModal({ session, roster, onClose, onDone }: {
  session: ClassSessionRow; roster: RosterSeat[]; onClose: () => void; onDone: () => void
}) {
  const me = useStaff()
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAttendance(session.id).then(rows => {
      setMarks(Object.fromEntries(rows.map(r => [r.student_id, r.status as AttendanceStatus])))
      setLoading(false)
    })
  }, [session.id])

  const people = useMemo(() => {
    const seen = new Set<string>()
    return roster.filter(s => (s.status === 'active' || marks[s.student_id]) && !seen.has(s.student_id) && seen.add(s.student_id))
  }, [roster, marks])

  async function save() {
    const rows = Object.entries(marks).map(([student_id, status]) => ({ student_id, status }))
    if (rows.length === 0) { setError('اختر حالة لطالب واحد على الأقل.'); return }
    setBusy(true); setError(null)
    const ok = await markAttendance(session.id, rows, me.id)
    setBusy(false)
    if (ok) onDone(); else setError('تعذّر حفظ الحضور.')
  }

  return (
    <Modal title={`الحضور — ${session.title}`} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="text-[12.5px] text-zinc-500">
          {fmtDay(session.starts_at)} · {new Date(session.starts_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' })}
          {session.teacher_name && <> · {session.teacher_name}</>}
        </div>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-zinc-300" /></div>
        ) : people.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-zinc-400">لا طلاب مسجّلون في هذا القسم.</div>
        ) : (
          <>
            <div className="flex justify-end">
              <button onClick={() => setMarks(Object.fromEntries(people.map(s => [s.student_id, 'present' as AttendanceStatus])))}
                className="text-[12px] font-bold text-blue-600 hover:text-blue-800">الكل حاضر</button>
            </div>
            <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
              {people.map(s => (
                <div key={s.student_id} className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
                  <span className="flex-1 min-w-[8rem] text-[13px] font-bold text-zinc-800 truncate">{s.full_name}</span>
                  <div className="flex gap-1">
                    {ATT_STATUS.map(a => (
                      <button key={a.id} onClick={() => setMarks(m => ({ ...m, [s.student_id]: a.id }))}
                        className={`px-2.5 py-1 rounded-lg border text-[11.5px] font-bold transition-colors ${marks[s.student_id] === a.id ? a.cls : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-2">
          <button onClick={save} disabled={busy || loading || people.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-black disabled:opacity-50">
            {busy && <Loader2 size={14} className="animate-spin" />} حفظ الحضور
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-[13px] font-bold text-zinc-500">إغلاق</button>
        </div>
      </div>
    </Modal>
  )
}