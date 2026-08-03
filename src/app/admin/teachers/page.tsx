'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Check, Copy, Eye, EyeOff, GraduationCap, KeyRound, Loader2, Lock,
  Mail, Plus, Search, Settings2, Star, Trash2, User as UserIcon, Users, X, ExternalLink,
} from 'lucide-react'
import {
  assignStudent, createTeacher, deleteTeacherAccount, fetchAbsenceSummary,
  fetchAssignedIds, fetchDeleteImpact, fetchTeachersScoreboard, setTeacherActive,
  unassignStudent, updateTeacherAccount, TeacherEmailTakenError,
  type AbsenceRow, type DeleteImpact, type ScoreboardRow,
} from '@/lib/teachers'
import { fetchStudents } from '@/lib/crm-db'
import type { CrmStudent } from '@/lib/crm-types'
import { logActivity } from '@/lib/activity-log-db'
import { useStaff } from '@/lib/staff-context'

/**
 * الأساتذة — founder view of the teaching team.
 *
 * One row per teacher with the numbers that matter: how many students they
 * hold, classes and hours this month, attendance rate, rating, and reports
 * owed. Creating an account here provisions a login for teacher.inglizi.com.
 */
export default function AdminTeachersPage() {
  const me = useStaff()
  const [rows, setRows]       = useState<ScoreboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)
  const [assignFor, setAssignFor] = useState<ScoreboardRow | null>(null)
  const [manageFor, setManageFor] = useState<ScoreboardRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setRows(await fetchTeachersScoreboard())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totals = useMemo(() => ({
    teachers: rows.length,
    students: rows.reduce((a, r) => a + (r.students ?? 0), 0),
    hours:    rows.reduce((a, r) => a + Number(r.hours_month ?? 0), 0),
    owed:     rows.reduce((a, r) => a + (r.reports_owed ?? 0), 0),
  }), [rows])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5" dir="rtl">

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">الأساتذة</h1>
          <p className="text-gray-500 text-sm font-semibold mt-0.5">
            {totals.teachers} أستاذ · {totals.students} طالب مسنَد · {totals.hours} ساعة هذا الشهر
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://teacher.inglizi.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition"
          >
            <ExternalLink size={15} /> فضاء الأساتذة
          </a>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition"
          >
            <Plus size={16} /> أستاذ جديد
          </button>
        </div>
      </div>

      {totals.owed > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle size={17} className="text-red-500 shrink-0" />
          <span className="text-[13.5px] font-bold text-red-800">
            {totals.owed} حصة منتهية بدون تقرير عبر الفريق.
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex justify-center text-gray-400"><Loader2 size={20} className="animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
            <GraduationCap size={24} />
          </div>
          <div className="font-black text-gray-700">لا أساتذة بعد</div>
          <p className="text-[13px] text-gray-400 mt-1 max-w-sm mx-auto">
            أنشئ حساب أستاذ، ثم أسنِد إليه طلابه — سيفتح فضاءه على teacher.inglizi.com.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[52rem]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black text-gray-500">
                <th className="text-right px-5 py-3">الأستاذ</th>
                <th className="text-center px-3 py-3">الطلاب</th>
                <th className="text-center px-3 py-3">حصص الشهر</th>
                <th className="text-center px-3 py-3">الساعات</th>
                <th className="text-center px-3 py-3">الحضور</th>
                <th className="text-center px-3 py-3">التقييم</th>
                <th className="text-center px-3 py-3">تقارير ناقصة</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {t.avatar_url
                        ? /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={t.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                        : <div className="w-9 h-9 rounded-full bg-gray-900 text-yellow-400 flex items-center justify-center font-black text-[13px]">
                            {(t.display_name ?? t.email ?? '?').trim().charAt(0).toUpperCase()}
                          </div>}
                      <div className="min-w-0">
                        <div className="font-black text-[13.5px] text-gray-900 truncate">{t.display_name ?? '—'}</div>
                        <div className="text-[11px] text-gray-400 font-semibold truncate" dir="ltr">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 font-black tabular-nums">{t.students}</td>
                  <td className="text-center px-3 font-black tabular-nums">{t.classes_month}</td>
                  <td className="text-center px-3 font-black tabular-nums">{t.hours_month}</td>
                  <td className="text-center px-3 font-black tabular-nums">
                    {t.attendance_rate != null ? `${t.attendance_rate}%` : '—'}
                  </td>
                  <td className="text-center px-3">
                    {t.rating_count > 0 ? (
                      <span className="inline-flex items-center gap-1 font-black tabular-nums">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        {Number(t.rating_avg).toFixed(1)}
                        <span className="text-[11px] text-gray-400 font-bold">({t.rating_count})</span>
                      </span>
                    ) : <span className="text-gray-300 font-bold">—</span>}
                  </td>
                  <td className="text-center px-3">
                    {t.reports_owed > 0
                      ? <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11.5px] font-black">{t.reports_owed}</span>
                      : <span className="text-emerald-600 font-black">✓</span>}
                  </td>
                  <td className="px-3 text-left">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setAssignFor(t)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-[12px] font-bold hover:bg-gray-100 transition whitespace-nowrap"
                      >
                        الطلاب
                      </button>
                      <button
                        onClick={() => setManageFor(t)}
                        aria-label="إدارة الحساب"
                        className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                      >
                        <Settings2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AbsencePanel />

      {adding && (
        <NewTeacherModal
          onClose={() => setAdding(false)}
          onCreated={async (email) => {
            await logActivity({ action: 'teacher_created', entityType: 'teacher', metadata: { email } }).catch(() => {})
            setAdding(false); load()
          }}
        />
      )}

      {assignFor && (
        <AssignModal
          teacher={assignFor}
          actorId={me.id}
          onClose={() => { setAssignFor(null); load() }}
        />
      )}

      {manageFor && (
        <ManageTeacherModal
          teacher={manageFor}
          onClose={() => setManageFor(null)}
          onChanged={() => { setManageFor(null); load() }}
        />
      )}
    </div>
  )
}

/* ── Absences ────────────────────────────────────────── */

/** Marked absent by a teacher → surfaced here for follow-up. The trigger in
 *  045_absence_flag.sql also drops each absence into the CRM activity feed. */
function AbsencePanel() {
  const [rows, setRows]       = useState<AbsenceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays]       = useState(30)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchAbsenceSummary(days).then(r => { if (alive) { setRows(r); setLoading(false) } })
    return () => { alive = false }
  }, [days])

  if (!loading && rows.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-black tracking-tight text-gray-900">الغيابات</h2>
          <p className="text-gray-500 text-[13px] font-semibold">طلاب سجّل الأساتذة غيابهم — يستحقون متابعة.</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition ${
                days === d ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {d} يوم
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center text-gray-400"><Loader2 size={18} className="animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[38rem]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black text-gray-500">
                <th className="text-right px-5 py-3">الطالب</th>
                <th className="text-right px-3 py-3">الأستاذ</th>
                <th className="text-center px-3 py-3">غيابات</th>
                <th className="text-center px-3 py-3">الحضور</th>
                <th className="text-center px-3 py-3">آخر غياب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.student_id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3">
                    <div className="font-black text-[13.5px] text-gray-900">{r.full_name}</div>
                    <div className="text-[11px] text-gray-400 font-semibold">{r.course ?? '—'}</div>
                  </td>
                  <td className="px-3 text-[12.5px] font-semibold text-gray-600">{r.teacher ?? '—'}</td>
                  <td className="text-center px-3">
                    <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11.5px] font-black tabular-nums">
                      {r.absences}
                    </span>
                  </td>
                  <td className="text-center px-3 font-black tabular-nums">
                    {r.attendance_rate != null ? `${r.attendance_rate}%` : '—'}
                  </td>
                  <td className="text-center px-3 text-[12px] font-semibold text-gray-500">
                    {r.last_absence ? new Date(r.last_absence).toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Create a teaching account ───────────────────────── */

function NewTeacherModal({
  onClose, onCreated,
}: { onClose: () => void; onCreated: (email: string) => void }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState(() => suggestPassword())
  const [show, setShow]         = useState(true)
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [takenBy, setTakenBy]   = useState<{ role: string; name: string | null } | null>(null)

  async function submit(convert = false) {
    setBusy(true); setError(null); if (!convert) setTakenBy(null)
    try {
      await createTeacher(email, password, name, convert)
      onCreated(email.trim().toLowerCase())
    } catch (e: any) {
      if (e instanceof TeacherEmailTakenError) {
        setTakenBy({ role: e.existingRole, name: e.existingName })
      } else {
        setError(e?.message ?? 'تعذّر إنشاء الحساب.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="أستاذ جديد" onClose={onClose}>
      <div className="space-y-4">
        <FieldRow icon={UserIcon} label="الاسم الكامل">
          <input value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="مثلاً: سعاد بنعلي" />
        </FieldRow>
        <FieldRow icon={Mail} label="البريد الإلكتروني">
          <input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" className={`${inp} text-left`} placeholder="teacher@inglizi.com" />
        </FieldRow>
        <FieldRow icon={Lock} label="كلمة المرور">
          <div className="flex gap-2">
            <input
              type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              dir="ltr" className={`${inp} text-left font-mono`}
            />
            <button onClick={() => setShow(v => !v)} className="px-3 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50" aria-label="إظهار">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
              className="px-3 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50" aria-label="نسخ"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-[11.5px] text-gray-400 font-semibold mt-1.5">
            انسخها وأرسلها للأستاذ — لن تظهر مرة أخرى.
          </p>
        </FieldRow>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>
        )}

        {takenBy ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[13px] font-bold text-amber-900 leading-relaxed">
                يوجد حساب بهذا البريد
                {takenBy.name ? ` باسم «${takenBy.name}»` : ''} — صلاحيته الحالية: {takenBy.role}.
                <div className="font-semibold text-amber-800 mt-1">
                  التحويل إلى أستاذ سيغيّر كلمة مروره إلى الكلمة أعلاه. إن كان حساب طالب، لن يستطيع الدخول بكلمته القديمة.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => submit(true)} disabled={busy}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-[13px] font-black hover:bg-amber-700 transition disabled:opacity-50"
              >
                {busy && <Loader2 size={14} className="animate-spin" />} حوّله إلى أستاذ
              </button>
              <button onClick={() => setTakenBy(null)} className="px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-gray-700">
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => submit()} disabled={busy || !email.trim() || password.length < 8}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} إنشاء الحساب
          </button>
        )}
      </div>
    </Modal>
  )
}

/* ── Manage an existing account ──────────────────────── */

function ManageTeacherModal({
  teacher, onClose, onChanged,
}: { teacher: ScoreboardRow; onClose: () => void; onChanged: () => void }) {
  const [name, setName]       = useState(teacher.display_name ?? '')
  const [email, setEmail]     = useState(teacher.email ?? '')
  const [password, setPass]   = useState('')
  const [active, setActive]   = useState(teacher.is_active)
  const [busy, setBusy]       = useState(false)
  const [msg, setMsg]         = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  const [impact, setImpact]   = useState<DeleteImpact | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [danger, setDanger]   = useState(false)

  async function save() {
    setBusy(true); setError(null); setMsg(null)
    try {
      const patch: { email?: string; password?: string; full_name?: string } = {}
      if (email.trim().toLowerCase() !== (teacher.email ?? '').toLowerCase()) patch.email = email
      if (name.trim() !== (teacher.display_name ?? ''))                       patch.full_name = name
      if (password)                                                          patch.password = password

      if (Object.keys(patch).length > 0) await updateTeacherAccount(teacher.id, patch)
      if (active !== teacher.is_active)  await setTeacherActive(teacher.id, active)

      setMsg(password ? 'تم الحفظ — انسخ كلمة المرور الجديدة الآن.' : 'تم الحفظ.')
      if (!password) onChanged()
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر الحفظ.')
    } finally {
      setBusy(false)
    }
  }

  async function openDanger() {
    setDanger(true); setError(null)
    try { setImpact(await fetchDeleteImpact(teacher.id)) }
    catch (e: any) { setError(e?.message ?? 'تعذّر قراءة بيانات الحساب.') }
  }

  async function reallyDelete() {
    setBusy(true); setError(null)
    try { await deleteTeacherAccount(teacher.id); onChanged() }
    catch (e: any) { setError(e?.message ?? 'تعذّر الحذف.'); setBusy(false) }
  }

  const totalLoss = impact
    ? impact.classes + impact.reports + impact.materials + impact.reviews
    : 0

  return (
    <Modal title={`إدارة ${teacher.display_name ?? 'الأستاذ'}`} onClose={onClose}>
      <div className="space-y-4">

        <FieldRow icon={UserIcon} label="الاسم المعروض">
          <input value={name} onChange={e => setName(e.target.value)} className={inp} />
        </FieldRow>

        <FieldRow icon={Mail} label="البريد الإلكتروني">
          <input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" className={`${inp} text-left`} />
        </FieldRow>

        <FieldRow icon={KeyRound} label="كلمة مرور جديدة">
          <div className="flex gap-2">
            <input
              value={password} onChange={e => setPass(e.target.value)} dir="ltr"
              className={`${inp} text-left font-mono`} placeholder="اتركها فارغة لعدم التغيير"
            />
            <button
              onClick={() => { setPass(suggestPassword()); setCopied(false) }}
              className="px-3 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50 whitespace-nowrap text-[12px] font-bold"
            >
              توليد
            </button>
            {password && (
              <button
                onClick={() => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
                className="px-3 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50" aria-label="نسخ"
              >
                {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              </button>
            )}
          </div>
          <p className="text-[11.5px] text-gray-400 font-semibold mt-1.5">
            لا يمكن استرجاع كلمة المرور القديمة — يمكنك فقط تعيين واحدة جديدة.
          </p>
        </FieldRow>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}
                 className="w-4 h-4 rounded accent-gray-900" />
          <span className="text-[13px] font-bold text-gray-700">حساب نشط</span>
          <span className="text-[11.5px] text-gray-400 font-semibold">— إيقافه يمنعه من الظهور دون حذف أي شيء</span>
        </label>

        {msg   && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[13px] font-bold text-emerald-700">{msg}</div>}
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] font-bold text-red-700">{error}</div>}

        <div className="flex gap-2">
          <button
            onClick={save} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />} حفظ
          </button>
          {msg && (
            <button onClick={onChanged} className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-bold hover:bg-gray-50">
              تم
            </button>
          )}
        </div>

        {/* ── Danger zone ─────────────────────────────── */}
        <div className="pt-4 mt-1 border-t border-gray-200">
          {!danger ? (
            <button onClick={openDanger} className="flex items-center gap-2 text-[13px] font-bold text-red-600 hover:text-red-700">
              <Trash2 size={15} /> حذف الحساب نهائياً
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-[13px] font-bold text-red-900 leading-relaxed">
                  {impact === null ? 'جاري حساب ما سيُحذف…' : totalLoss === 0 ? (
                    <>لا بيانات مرتبطة بهذا الحساب — الحذف آمن.</>
                  ) : (
                    <>
                      الحذف سيمسح نهائياً:
                      <ul className="font-semibold mt-1.5 space-y-0.5">
                        {impact.classes   > 0 && <li>· {impact.classes} حصة وكل سجلات الحضور فيها</li>}
                        {impact.reports   > 0 && <li>· {impact.reports} تقرير درس</li>}
                        {impact.materials > 0 && <li>· {impact.materials} ملف</li>}
                        {impact.reviews   > 0 && <li>· {impact.reviews} تقييم من الطلاب</li>}
                        {impact.students  > 0 && <li>· إسناد {impact.students} طالب (الطلاب أنفسهم لن يُحذفوا)</li>}
                      </ul>
                      <div className="mt-2 font-black">لا يمكن التراجع. إن كنت تريد فقط منعه من الدخول، أوقف الحساب بدل حذفه.</div>
                    </>
                  )}
                </div>
              </div>

              {impact !== null && (
                <>
                  <div>
                    <label className="block text-[12px] font-black text-red-800 mb-1.5">
                      اكتب <span className="font-mono">حذف</span> للتأكيد
                    </label>
                    <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                           className="w-full px-3 py-2 rounded-lg border border-red-300 bg-white text-[14px] font-bold focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={reallyDelete} disabled={busy || confirmText.trim() !== 'حذف'}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-black hover:bg-red-700 transition disabled:opacity-40"
                    >
                      {busy && <Loader2 size={14} className="animate-spin" />} احذف نهائياً
                    </button>
                    <button onClick={() => { setDanger(false); setConfirmText('') }}
                            className="px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-gray-700">
                      إلغاء
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ── Assign students ─────────────────────────────────── */

function AssignModal({
  teacher, actorId, onClose,
}: { teacher: ScoreboardRow; actorId: string; onClose: () => void }) {
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [loading, setLoading]   = useState(true)
  const [q, setQ]               = useState('')
  const [savingId, setSaving]   = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [all, ids] = await Promise.all([
        fetchStudents({ active: true }), fetchAssignedIds(teacher.id),
      ])
      if (!alive) return
      setStudents(all); setAssigned(new Set(ids)); setLoading(false)
    })()
    return () => { alive = false }
  }, [teacher.id])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return students
    return students.filter(s => s.full_name.toLowerCase().includes(needle))
  }, [students, q])

  async function toggle(s: CrmStudent) {
    setSaving(s.id)
    const on = assigned.has(s.id)
    const ok = on
      ? await unassignStudent(teacher.id, s.id)
      : await assignStudent(teacher.id, s.id, actorId)
    if (ok) {
      setAssigned(prev => {
        const next = new Set(prev)
        on ? next.delete(s.id) : next.add(s.id)
        return next
      })
    }
    setSaving(null)
  }

  return (
    <Modal title={`طلاب ${teacher.display_name ?? ''}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} className={`${inp} pr-10`} placeholder="ابحث عن طالب…" />
        </div>

        <div className="flex items-center gap-2 text-[12.5px] font-bold text-gray-500">
          <Users size={14} /> {assigned.size} مسنَد
        </div>

        {loading ? (
          <div className="py-14 flex justify-center text-gray-400"><Loader2 size={18} className="animate-spin" /></div>
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filtered.map(s => {
              const on = assigned.has(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s)}
                  disabled={savingId === s.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-right disabled:opacity-50"
                >
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    on ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300'}`}>
                    {savingId === s.id ? <Loader2 size={11} className="animate-spin" /> : on ? <Check size={13} /> : null}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[13.5px] text-gray-900 truncate">{s.full_name}</span>
                    <span className="block text-[11px] text-gray-400 font-semibold truncate">
                      {s.course ?? '—'} · {s.student_type === 'private_student' ? 'فردي' : 'دورة'}
                    </span>
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-[13px] font-semibold text-gray-400">لا نتائج</div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ── Shared bits ─────────────────────────────────────── */

const inp =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-[14px] font-semibold ' +
  'focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition'

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-gray-200 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-black text-[16px] text-gray-900">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-gray-400 hover:text-gray-600"><X size={19} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function FieldRow({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-[12px] font-black text-gray-500 mb-1.5">
        <Icon size={13} /> {label}
      </span>
      {children}
    </div>
  )
}

/** A readable password the founder can dictate over the phone. */
function suggestPassword(): string {
  const words = ['inglizi', 'teach', 'class', 'lesson', 'speak', 'fluent']
  const w = words[Math.floor(Math.random() * words.length)]
  return `${w}-${Math.floor(1000 + Math.random() * 9000)}`
}
