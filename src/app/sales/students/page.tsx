'use client'

import { useEffect, useState } from 'react'
import {
  GraduationCap, Loader2, Search, RotateCcw, Calendar,
  Users, BookOpen, AlertTriangle, CheckCircle2,
  MessageCircle, Phone, X, Save,
} from 'lucide-react'
import { fetchStudents, fetchStudentStats, patchStudent, type CrmStudent } from '@/lib/crm-db'
import { getCourseMeta } from '@/lib/crm-types'
import { whatsappLink } from '@/lib/leads-db'
import { useStaff } from '@/lib/staff-context'

export default function StudentsPage() {
  const [students, setStudents]   = useState<CrmStudent[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [typeFilter, setType]     = useState<'all' | 'course_student' | 'private_student'>('all')
  const [selected, setSelected]   = useState<CrmStudent | null>(null)
  const [stats, setStats]         = useState({ total: 0, course: 0, private: 0, overdue: 0, revenue: 0 })

  async function load() {
    setLoading(true)
    const [rows, st] = await Promise.all([
      fetchStudents({ type: typeFilter === 'all' ? undefined : typeFilter, active: true, search: query || undefined }),
      fetchStudentStats(),
    ])
    setStudents(rows); setStats(st); setLoading(false)
  }

  useEffect(() => { load() }, [typeFilter])

  function handleSearch(q: string) {
    setQuery(q)
    const id = setTimeout(load, 350)
    return () => clearTimeout(id)
  }

  const upcoming = students.filter(s =>
    s.student_type === 'private_student' && s.next_payment_date &&
    new Date(s.next_payment_date) <= new Date(Date.now() + 14 * 86_400_000)
  )

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.18em] text-gray-400 mb-1">Students</div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-yellow-600" /> Students
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Paid leads converted to enrolled students.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          <RotateCcw size={14} />
        </button>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Tile icon={Users}         label="Total"   value={stats.total}   color="bg-yellow-50 text-yellow-600" />
        <Tile icon={BookOpen}      label="Course"  value={stats.course}  color="bg-blue-50 text-blue-600" />
        <Tile icon={Calendar}      label="Private" value={stats.private} color="bg-purple-50 text-purple-600" />
        <Tile icon={AlertTriangle} label="Overdue" value={stats.overdue} color="bg-rose-50 text-rose-600" />
      </section>

      {/* Upcoming private payments alert */}
      {upcoming.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <AlertTriangle size={15} className="text-orange-600 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-orange-800">
            {upcoming.length} private student{upcoming.length > 1 ? 's have' : ' has'} a payment due in the next 14 days.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name, phone, notes…"
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {([['all', 'All'], ['course_student', 'Course'], ['private_student', 'Private']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setType(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold ${typeFilter === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-400 font-semibold">{students.length} students</div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
          <GraduationCap size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-semibold">No students yet.</p>
          <p className="text-xs text-gray-400 mt-1">When a lead is set to "Paid" and converted, they appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5">Student</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5 hidden lg:table-cell">Enrolled</th>
                <th className="text-left px-4 py-2.5 hidden xl:table-cell">Next payment</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => <StudentRow key={s.id} student={s} onSelect={() => setSelected(s)} />)}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <StudentDrawer student={selected} onClose={() => setSelected(null)} onChange={() => { load(); setSelected(null) }} />
      )}
    </div>
  )
}

/* ── StudentRow ── */
function StudentRow({ student: s, onSelect }: { student: CrmStudent; onSelect: () => void }) {
  const wa = s.phone_number ? whatsappLink(s.phone_number, `مرحبا ${s.full_name}`) : null
  const course = getCourseMeta(s.course)
  const isPrivate = s.student_type === 'private_student'
  const paymentSoon = isPrivate && s.next_payment_date &&
    new Date(s.next_payment_date) <= new Date(Date.now() + 14 * 86_400_000)

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onSelect}>
      <td className="px-4 py-2.5">
        <div className="font-semibold text-gray-900">{s.full_name}</div>
        {s.phone_number && <div className="text-[11px] text-gray-400">{s.phone_number}</div>}
      </td>
      <td className="px-4 py-2.5 text-gray-600 hidden md:table-cell">{course.short}</td>
      <td className="px-4 py-2.5">
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${isPrivate ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
          {isPrivate ? 'Private' : 'Course'}
        </span>
      </td>
      <td className="px-4 py-2.5 text-gray-400 text-[12px] tabular-nums hidden lg:table-cell">
        {new Date(s.enrollment_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-2.5 hidden xl:table-cell">
        {isPrivate && s.next_payment_date ? (
          <span className={`text-[12px] font-bold flex items-center gap-1 ${paymentSoon ? 'text-orange-600' : 'text-gray-500'}`}>
            {paymentSoon && <AlertTriangle size={11} />}
            {new Date(s.next_payment_date).toLocaleDateString()}
          </span>
        ) : <span className="text-gray-300 text-[11px]">—</span>}
      </td>
      <td className="px-4 py-2.5">
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
          s.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          s.payment_status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-orange-50 text-orange-700 border-orange-200'}`}>
          {s.payment_status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {wa && <a href={wa} target="_blank" rel="noopener"
            className="w-7 h-7 rounded flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100"><MessageCircle size={12} /></a>}
          {s.phone_number && <a href={`tel:${s.phone_number}`}
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200"><Phone size={12} /></a>}
        </div>
      </td>
    </tr>
  )
}

/* ── StudentDrawer ── */
function StudentDrawer({ student, onClose, onChange }: { student: CrmStudent; onClose: () => void; onChange: () => void }) {
  const [nextPayment, setNextPayment] = useState(student.next_payment_date ?? '')
  const [notes, setNotes]             = useState(student.notes ?? '')
  const [payStatus, setPayStatus]     = useState(student.payment_status)
  const [saving, setSaving]           = useState(false)

  async function save() {
    setSaving(true)
    try {
      await patchStudent(student.id, {
        next_payment_date: nextPayment || null as any,
        notes: notes || null,
        payment_status: payStatus as any,
      })
      onChange()
    } catch (err: any) { alert(err?.message) }
    finally { setSaving(false) }
  }

  const wa = student.phone_number ? whatsappLink(student.phone_number, `مرحبا ${student.full_name}`) : null
  const course = getCourseMeta(student.course)
  const isPrivate = student.student_type === 'private_student'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-white border-l border-gray-200 shadow-2xl flex flex-col">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-yellow-600" />
              <h2 className="font-black text-gray-900 text-lg">{student.full_name}</h2>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{isPrivate ? 'Private student' : 'Course student'} · {course.short}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {student.phone_number && <Info label="Phone" value={student.phone_number} />}
            <Info label="Enrolled" value={new Date(student.enrollment_date).toLocaleDateString()} />
            {student.monthly_fee_mad && <Info label="Monthly fee" value={`${student.monthly_fee_mad} MAD`} />}
            {(student.total_paid_mad ?? 0) > 0 && <Info label="Total paid" value={`${student.total_paid_mad} MAD`} />}
          </div>

          {/* Payment status */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1.5">Payment status</div>
            <div className="flex gap-2">
              {(['paid', 'pending', 'overdue'] as const).map(s => (
                <button key={s} onClick={() => setPayStatus(s)}
                  className={`flex-1 py-2 rounded-lg border text-[12px] font-bold capitalize ${payStatus === s ? 'bg-black text-yellow-400 border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Next payment — private students only */}
          {isPrivate && (
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1 flex items-center gap-1">
                <Calendar size={10} /> Next payment date
              </div>
              <input type="date" value={nextPayment} onChange={e => setNextPayment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-500 mb-1">Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
              placeholder="Level, schedule, goals, interests…"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm resize-y focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
          </div>

          {/* Quick links */}
          <div className="flex gap-2">
            {wa && <a href={wa} target="_blank" rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700">
              <MessageCircle size={12} /> WhatsApp</a>}
            {student.phone_number && <a href={`tel:${student.phone_number}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800">
              <Phone size={12} /> Call</a>}
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-[11px] text-gray-400">Student since {new Date(student.created_at).toLocaleDateString()}</div>
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </footer>
      </aside>
    </>
  )
}

/* ── helpers ── */
function Tile({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}><Icon size={14} /></div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-0.5">{label}</div>
      <div className="text-2xl font-black text-gray-900 tabular-nums">{value}</div>
    </div>
  )
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return <div><div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">{label}</div><div className="text-gray-800 font-semibold truncate">{value}</div></div>
}
