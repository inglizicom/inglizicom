'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowRight, Check, ClipboardList, Loader2, Trash2, Video, XCircle,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  canDeleteSession, deleteSession, fetchReport, fetchSessionRoster, fetchSessions,
  markAttendance, saveReport, updateSession,
  type AttendanceStatus, type ClassSession, type LessonReport, type SessionRosterRow, type StudentNote,
} from '@/lib/teachers'
import { Card, DemoBanner, Pill, SectionTitle, fmtDateTime, STATUS_AR } from '../../_ui'
import { DEMO_SESSIONS, DEMO_SESSION_ROSTER, isTeacherDemo } from '../../_demo'

const ATT: { key: AttendanceStatus; label: string; on: string }[] = [
  { key: 'present', label: 'حاضر',  on: 'bg-emerald-600 text-white border-emerald-600' },
  { key: 'late',    label: 'متأخر', on: 'bg-amber-500 text-white border-amber-500' },
  { key: 'absent',  label: 'غائب',  on: 'bg-red-600 text-white border-red-600' },
  { key: 'excused', label: 'بعذر',  on: 'bg-slate-600 text-white border-slate-600' },
]

/** One class: mark who came, then write what happened. The two halves of the
 *  record a school actually needs. */
export default function ClassDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const teacher = useTeacher()

  const [session,  setSession]  = useState<ClassSession | null>(null)
  const [sheet,    setSheet]    = useState<SessionRosterRow[]>([])
  const [marks,    setMarks]    = useState<Record<string, AttendanceStatus>>({})
  const [report,   setReport]   = useState<LessonReport | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [savingAtt, setSavingAtt] = useState(false)
  const [savedAtt,  setSavedAtt]  = useState(false)
  const [attError,  setAttError]  = useState<string | null>(null)
  const [demo,     setDemo]     = useState(false)
  // Students who belong in this session. Earlier marks for anyone else stay visible, read-only.
  const students = sheet.filter(s => s.eligible).map(s => ({ id: s.student_id, full_name: s.full_name }))
  const legacyMarks = sheet.filter(s => !s.eligible && s.attendance)

  // Report form
  const [covered,   setCovered]   = useState('')
  const [homework,  setHomework]  = useState('')
  const [materials, setMaterials] = useState('')
  const [founderNote, setFounderNote] = useState('')
  const [notes,     setNotes]     = useState<Record<string, StudentNote>>({})
  const [savingRep, setSavingRep] = useState(false)
  const [savedRep,  setSavedRep]  = useState(false)

  const load = useCallback(async () => {
    if (isTeacherDemo()) {
      setDemo(true)
      setSession(DEMO_SESSIONS.find(x => x.id === id) ?? DEMO_SESSIONS[0])
      setSheet(DEMO_SESSION_ROSTER)
      setMarks(Object.fromEntries(DEMO_SESSION_ROSTER.filter(r => r.attendance).map(r => [r.student_id, r.attendance!])))
      setLoading(false); return
    }
    const [all, roster, rep] = await Promise.all([
      fetchSessions(teacher.id),
      fetchSessionRoster(id),
      fetchReport(id),
    ])
    const s = all.find(x => x.id === id) ?? null
    setSession(s)
    setSheet(roster)
    setMarks(Object.fromEntries(roster.filter(r => r.attendance).map(r => [r.student_id, r.attendance!])))
    setReport(rep)
    if (rep) {
      setCovered(rep.covered ?? '')
      setHomework(rep.homework ?? '')
      setMaterials(rep.materials_used ?? '')
      setFounderNote(rep.founder_note ?? '')
      setNotes(Object.fromEntries((rep.student_notes ?? []).map(n => [n.student_id, n])))
    }
    setLoading(false)
  }, [id, teacher.id])

  useEffect(() => { load() }, [load])

  async function setStatus(status: ClassSession['status'], cancel_reason?: string | null) {
    if (!session || demo) return
    const patch: Partial<ClassSession> = cancel_reason !== undefined ? { status, cancel_reason } : { status }
    await updateSession(session.id, patch)
    setSession({ ...session, ...patch })
  }

  async function cancelSessionWithReason() {
    const reason = window.prompt('سبب الإلغاء (يظهر للإدارة):', '')
    if (reason === null) return
    await setStatus('cancelled', reason.trim() || null)
  }

  async function saveAttendance() {
    if (demo) return
    // Only roster students can be marked — the database refuses anyone else.
    const eligible = new Set(students.map(s => s.id))
    const rows = Object.entries(marks).filter(([sid]) => eligible.has(sid)).map(([student_id, status]) => ({ student_id, status }))
    setSavingAtt(true); setAttError(null)
    const ok = await markAttendance(id, rows, teacher.id)
    setSavingAtt(false)
    if (ok) { setSavedAtt(true); setTimeout(() => setSavedAtt(false), 2200) }
    else setAttError('تعذّر حفظ الحضور. تحقّق أن الطلاب ما زالوا مسجّلين في القسم.')
  }

  async function submitReport() {
    if (!covered.trim() || !session || demo) return
    setSavingRep(true)
    const ok = await saveReport({
      session_id:     session.id,
      teacher_id:     teacher.id,
      covered:        covered.trim(),
      homework:       homework.trim() || null,
      materials_used: materials.trim() || null,
      founder_note:   founderNote.trim() || null,
      student_notes:  Object.values(notes),
    })
    setSavingRep(false)
    if (ok) {
      setSavedRep(true); setTimeout(() => setSavedRep(false), 2200)
      // A written-up class is a finished class.
      if (session.status !== 'done') await setStatus('done')
      load()
    }
  }

  // A session with attendance or a report is history: it can be cancelled, never deleted.
  const hasRecords = Object.keys(marks).length > 0 || !!report || sheet.some(s => s.attendance)
  async function removeSession() {
    if (!session || demo) return
    if (!window.confirm('حذف هذه الحصة المبرمجة؟ لا حضور ولا تقرير مرتبط بها.')) return
    const res = await deleteSession(session.id)
    if (!res.ok) { window.alert(res.error); return }
    router.replace('/teacher/classes')
  }

  function noteFor(sid: string): StudentNote {
    return notes[sid] ?? { student_id: sid, participation: 3, needs_help: false, note: '' }
  }
  function patchNote(sid: string, patch: Partial<StudentNote>) {
    setNotes(prev => ({ ...prev, [sid]: { ...noteFor(sid), ...patch } }))
  }

  if (loading) {
    return <div className="py-32 flex justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
  }

  if (!session) {
    return (
      <Card className="p-10 text-center">
        <div className="font-black text-slate-700 mb-1">لم نجد هذه الحصة</div>
        <Link href="/teacher/classes" className="text-[13px] font-bold text-amber-700">العودة إلى حصصي</Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {demo && <DemoBanner />}
      <div className="flex flex-wrap gap-4">
        <Link href="/teacher/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800">
          <ArrowRight size={15} /> حصصي
        </Link>
        {session.class_id && (
          <Link href={`/teacher/groups/${session.class_id}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-700 hover:text-amber-900">
            القسم ←
          </Link>
        )}
      </div>

      {/* ── Header ───────────────────────────────────── */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-[15rem]">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Pill tone={session.status === 'done' ? 'done' : session.status === 'cancelled' ? 'cancelled' : session.status === 'live' ? 'live' : 'scheduled'}>
                {STATUS_AR[session.status]}
              </Pill>
              <Pill tone="muted">{STATUS_AR[session.mode]}</Pill>
              {session.level && <Pill tone="muted">{session.level}</Pill>}
            </div>
            <h1 className="text-inherit text-[23px] font-black tracking-tight">{session.title}</h1>
            <p className="text-slate-500 text-[13.5px] font-semibold mt-1">
              {fmtDateTime(session.starts_at)} · {session.duration_min} دقيقة
            </p>
            {session.status === 'cancelled' && session.cancel_reason && (
              <p className="text-rose-700 text-[12.5px] font-semibold mt-1">سبب الإلغاء: {session.cancel_reason}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {session.meeting_url && (
              <a href={session.meeting_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition">
                <Video size={15} /> ادخل للحصة
              </a>
            )}
            {session.status !== 'done' && session.status !== 'cancelled' && (
              <button onClick={() => setStatus('done')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition">
                <Check size={15} /> إنهاء الحصة
              </button>
            )}
            {(session.status === 'scheduled' || session.status === 'live') && (
              <button onClick={cancelSessionWithReason}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition">
                <XCircle size={15} /> إلغاء الحصة
              </button>
            )}
            {canDeleteSession(session, hasRecords) && (
              <button onClick={removeSession} aria-label="حذف الحصة"
                      className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-400 hover:text-red-600 hover:border-red-200 transition">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Attendance ───────────────────────────────── */}
      <div>
        <SectionTitle action={
          <button onClick={saveAttendance} disabled={savingAtt || Object.keys(marks).length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[12.5px] font-bold hover:bg-slate-800 transition disabled:opacity-40">
            {savingAtt ? <Loader2 size={14} className="animate-spin" /> : savedAtt ? <Check size={14} /> : null}
            {savedAtt ? 'تم الحفظ' : 'حفظ الحضور'}
          </button>
        }>
          الحضور
        </SectionTitle>

        <p className="text-[12px] text-slate-400 font-semibold -mt-1 mb-2">
          {session.class_id ? 'طلاب القسم المسجّلون وقت هذه الحصة.' : 'حصة غير مرتبطة بقسم: طلابك المسنَدون.'}
        </p>
        {attError && <div className="mb-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{attError}</div>}
        <Card className="divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="p-6 text-center text-[13.5px] font-semibold text-slate-400">
              {session.class_id ? 'لا طلاب مسجّلون في هذا القسم — تسجّلهم الإدارة من لوحة التحكم.' : 'لا طلاب مسنَدين إليك بعد — تُسنِدهم الإدارة من لوحة التحكم.'}
            </div>
          ) : students.map(s => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[13px] shrink-0">
                {s.full_name.trim().charAt(0)}
              </div>
              <div className="flex-1 min-w-[8rem] font-bold text-[14px] truncate">{s.full_name}</div>
              <div className="flex gap-1.5">
                {ATT.map(a => {
                  const on = marks[s.id] === a.key
                  return (
                    <button
                      key={a.key}
                      onClick={() => setMarks(m => ({ ...m, [s.id]: a.key }))}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition ${
                        on ? a.on : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
                    >
                      {a.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </Card>
        {legacyMarks.length > 0 && (
          <div className="mt-2 text-[12px] text-slate-400 font-semibold">
            علامات سابقة لطلاب لم يعودوا في القائمة (محفوظة):{' '}
            {legacyMarks.map(m => `${m.full_name} — ${STATUS_AR[m.attendance!]}`).join('، ')}
          </div>
        )}
      </div>

      {/* ── Lesson report ────────────────────────────── */}
      <div>
        <SectionTitle>
          تقرير الدرس {report && <span className="text-[12px] font-bold text-emerald-600">· محفوظ</span>}
        </SectionTitle>

        <Card className="p-5 sm:p-6 space-y-4">
          <Field label="ما تم إنجازه" required>
            <textarea value={covered} onChange={e => setCovered(e.target.value)} rows={3} className={inputCls}
                      placeholder="الدروس، التمارين، النقاط التي وقف عندها الطلاب…" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="الواجب المنزلي">
              <textarea value={homework} onChange={e => setHomework(e.target.value)} rows={2} className={inputCls}
                        placeholder="ما طلبته منهم قبل الحصة القادمة" />
            </Field>
            <Field label="المواد المستعملة">
              <textarea value={materials} onChange={e => setMaterials(e.target.value)} rows={2} className={inputCls}
                        placeholder="ملف PDF، فيديو، صفحة من الكتاب…" />
            </Field>
          </div>

          {/* Per-student assessment */}
          {students.length > 0 && (
            <div>
              <span className="block text-[12px] font-black text-slate-500 mb-2">تقييم كل طالب</span>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                {students.map(s => {
                  const n = noteFor(s.id)
                  return (
                    <div key={s.id} className="px-4 py-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-[13.5px] flex-1 min-w-[7rem] truncate">{s.full_name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-400 ml-1">المشاركة</span>
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => patchNote(s.id, { participation: v })}
                              className={`w-7 h-7 rounded-lg text-[12px] font-black border transition ${
                                n.participation === v
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={n.needs_help}
                                 onChange={e => patchNote(s.id, { needs_help: e.target.checked })}
                                 className="w-4 h-4 rounded accent-red-600" />
                          يحتاج متابعة
                        </label>
                      </div>
                      <input
                        value={n.note ?? ''} onChange={e => patchNote(s.id, { note: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold
                                   focus:outline-none focus:border-slate-900 transition"
                        placeholder="ملاحظة قصيرة (اختياري)"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Field label="ملاحظة خاصة للإدارة">
            <textarea value={founderNote} onChange={e => setFounderNote(e.target.value)} rows={2} className={inputCls}
                      placeholder="لا يراها الطلاب — مشاكل، اقتراحات، أو طالب يحتاج تدخّلاً." />
          </Field>

          <button
            onClick={submitReport} disabled={savingRep || !covered.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition disabled:opacity-40"
          >
            {savingRep ? <Loader2 size={16} className="animate-spin" />
              : savedRep ? <Check size={16} /> : <ClipboardList size={16} />}
            {savedRep ? 'تم الحفظ' : report ? 'تحديث التقرير' : 'إرسال التقرير'}
          </button>
        </Card>
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-black text-slate-500 mb-1.5">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
