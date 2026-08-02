'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowRight, Check, ClipboardList, Loader2, Trash2, Video, XCircle,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  deleteSession, fetchAttendance, fetchMyStudents, fetchReport, fetchSessions,
  markAttendance, saveReport, updateSession,
  type AttendanceStatus, type ClassSession, type LessonReport, type MyStudent, type StudentNote,
} from '@/lib/teachers'
import { Card, Pill, SectionTitle, fmtDateTime, STATUS_AR } from '../../_ui'

const ATT: { key: AttendanceStatus; label: string; on: string }[] = [
  { key: 'present', label: 'حاضر',  on: 'bg-emerald-600 text-white border-emerald-600' },
  { key: 'late',    label: 'متأخر', on: 'bg-amber-500 text-white border-amber-500' },
  { key: 'absent',  label: 'غائب',  on: 'bg-red-600 text-white border-red-600' },
  { key: 'excused', label: 'بعذر',  on: 'bg-stone-600 text-white border-stone-600' },
]

/** One class: mark who came, then write what happened. The two halves of the
 *  record a school actually needs. */
export default function ClassDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const teacher = useTeacher()

  const [session,  setSession]  = useState<ClassSession | null>(null)
  const [students, setStudents] = useState<MyStudent[]>([])
  const [marks,    setMarks]    = useState<Record<string, AttendanceStatus>>({})
  const [report,   setReport]   = useState<LessonReport | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [savingAtt, setSavingAtt] = useState(false)
  const [savedAtt,  setSavedAtt]  = useState(false)

  // Report form
  const [covered,   setCovered]   = useState('')
  const [homework,  setHomework]  = useState('')
  const [materials, setMaterials] = useState('')
  const [founderNote, setFounderNote] = useState('')
  const [notes,     setNotes]     = useState<Record<string, StudentNote>>({})
  const [savingRep, setSavingRep] = useState(false)
  const [savedRep,  setSavedRep]  = useState(false)

  const load = useCallback(async () => {
    const [all, roster, att, rep] = await Promise.all([
      fetchSessions(teacher.id),
      fetchMyStudents(),
      fetchAttendance(id),
      fetchReport(id),
    ])
    const s = all.find(x => x.id === id) ?? null
    setSession(s)
    setStudents(roster)
    setMarks(Object.fromEntries(att.map(a => [a.student_id, a.status])))
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

  async function setStatus(status: ClassSession['status']) {
    if (!session) return
    await updateSession(session.id, { status })
    setSession({ ...session, status })
  }

  async function saveAttendance() {
    const rows = Object.entries(marks).map(([student_id, status]) => ({ student_id, status }))
    setSavingAtt(true)
    const ok = await markAttendance(id, rows, teacher.id)
    setSavingAtt(false)
    if (ok) { setSavedAtt(true); setTimeout(() => setSavedAtt(false), 2200) }
  }

  async function submitReport() {
    if (!covered.trim() || !session) return
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

  async function removeSession() {
    if (!session) return
    if (!window.confirm('حذف هذه الحصة نهائياً؟ سيُحذف معها الحضور والتقرير.')) return
    await deleteSession(session.id)
    router.replace('/teacher/classes')
  }

  function noteFor(sid: string): StudentNote {
    return notes[sid] ?? { student_id: sid, participation: 3, needs_help: false, note: '' }
  }
  function patchNote(sid: string, patch: Partial<StudentNote>) {
    setNotes(prev => ({ ...prev, [sid]: { ...noteFor(sid), ...patch } }))
  }

  if (loading) {
    return <div className="py-32 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
  }

  if (!session) {
    return (
      <Card className="p-10 text-center">
        <div className="font-black text-stone-700 mb-1">لم نجد هذه الحصة</div>
        <Link href="/teacher/classes" className="text-[13px] font-bold text-amber-700">العودة إلى حصصي</Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/teacher/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-800">
        <ArrowRight size={15} /> حصصي
      </Link>

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
            <h1 className="text-[23px] font-black tracking-tight">{session.title}</h1>
            <p className="text-stone-500 text-[13.5px] font-semibold mt-1">
              {fmtDateTime(session.starts_at)} · {session.duration_min} دقيقة
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {session.meeting_url && (
              <a href={session.meeting_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-[13px] font-bold hover:bg-stone-800 transition">
                <Video size={15} /> ادخل للحصة
              </a>
            )}
            {session.status !== 'done' && (
              <button onClick={() => setStatus('done')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition">
                <Check size={15} /> إنهاء الحصة
              </button>
            )}
            {session.status === 'scheduled' && (
              <button onClick={() => setStatus('cancelled')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-[13px] font-bold hover:bg-stone-50 transition">
                <XCircle size={15} /> إلغاء
              </button>
            )}
            <button onClick={removeSession} aria-label="حذف"
                    className="px-3 py-2.5 rounded-xl border border-stone-300 text-stone-400 hover:text-red-600 hover:border-red-200 transition">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Attendance ───────────────────────────────── */}
      <div>
        <SectionTitle action={
          <button onClick={saveAttendance} disabled={savingAtt || Object.keys(marks).length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-[12.5px] font-bold hover:bg-stone-800 transition disabled:opacity-40">
            {savingAtt ? <Loader2 size={14} className="animate-spin" /> : savedAtt ? <Check size={14} /> : null}
            {savedAtt ? 'تم الحفظ' : 'حفظ الحضور'}
          </button>
        }>
          الحضور
        </SectionTitle>

        <Card className="divide-y divide-stone-100">
          {students.length === 0 ? (
            <div className="p-6 text-center text-[13.5px] font-semibold text-stone-400">
              لا طلاب مسنَدين إليك بعد — تُسنِدهم الإدارة من لوحة التحكم.
            </div>
          ) : students.map(s => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-black text-[13px] shrink-0">
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
                        on ? a.on : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
                    >
                      {a.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </Card>
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
              <span className="block text-[12px] font-black text-stone-500 mb-2">تقييم كل طالب</span>
              <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
                {students.map(s => {
                  const n = noteFor(s.id)
                  return (
                    <div key={s.id} className="px-4 py-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-[13.5px] flex-1 min-w-[7rem] truncate">{s.full_name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-stone-400 ml-1">المشاركة</span>
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => patchNote(s.id, { participation: v })}
                              className={`w-7 h-7 rounded-lg text-[12px] font-black border transition ${
                                n.participation === v
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-stone-600 cursor-pointer">
                          <input type="checkbox" checked={n.needs_help}
                                 onChange={e => patchNote(s.id, { needs_help: e.target.checked })}
                                 className="w-4 h-4 rounded accent-red-600" />
                          يحتاج متابعة
                        </label>
                      </div>
                      <input
                        value={n.note ?? ''} onChange={e => patchNote(s.id, { note: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px] font-semibold
                                   focus:outline-none focus:border-stone-900 transition"
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-black hover:bg-stone-800 transition disabled:opacity-40"
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
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-black text-stone-500 mb-1.5">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
