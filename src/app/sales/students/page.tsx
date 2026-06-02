'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  GraduationCap, Loader2, Search, RotateCcw, Calendar,
  Users, BookOpen, AlertTriangle, Plus, MessageCircle, Phone,
  BellRing, ArrowRight,
} from 'lucide-react'
import { fetchStudents, fetchStudentStats, type CrmStudent } from '@/lib/crm-db'
import { fetchRenewalCandidates, type RenewalRow } from '@/lib/crm-stats'
import { getCourseMeta } from '@/lib/crm-types'
import { whatsappLink } from '@/lib/leads-db'
import AddStudentDrawer from './AddStudentDrawer'
import StudentDetailDrawer from './StudentDetailDrawer'

type Tab = 'active' | 'expiring'

function StudentsInner() {
  const sp     = useSearchParams()
  const router = useRouter()
  const tab    = (sp?.get('tab') ?? 'active') as Tab

  /* active tab state */
  const [students, setStudents] = useState<CrmStudent[]>([])
  const [loadingS, setLoadingS] = useState(true)
  const [query,    setQuery]    = useState('')
  const [typeFilter, setType]   = useState<'all' | 'course_student' | 'private_student'>('all')
  const [selected, setSelected] = useState<CrmStudent | null>(null)
  const [addOpen,  setAddOpen]  = useState(false)
  const [stats,    setStats]    = useState({ total: 0, course: 0, private: 0, overdue: 0, revenue: 0 })

  /* expiring tab state */
  const [renewals, setRenewals] = useState<RenewalRow[]>([])
  const [loadingR, setLoadingR] = useState(true)

  async function loadStudents() {
    setLoadingS(true)
    const [rows, st] = await Promise.all([
      fetchStudents({ type: typeFilter === 'all' ? undefined : typeFilter, active: true, search: query || undefined }),
      fetchStudentStats(),
    ])
    setStudents(rows); setStats(st); setLoadingS(false)
  }

  async function loadRenewals() {
    setLoadingR(true)
    const rows = await fetchRenewalCandidates()
    setRenewals(rows); setLoadingR(false)
  }

  useEffect(() => { loadStudents() }, [typeFilter])
  useEffect(() => { if (tab === 'expiring') loadRenewals() }, [tab])

  function handleSearch(q: string) {
    setQuery(q)
    const id = setTimeout(loadStudents, 350)
    return () => clearTimeout(id)
  }

  const upcoming = students.filter(s =>
    s.student_type === 'private_student' && s.next_payment_date &&
    new Date(s.next_payment_date) <= new Date(Date.now() + 14 * 86_400_000)
  )
  const expired  = renewals.filter(r => r.bucket === 'expired')
  const expiring = renewals.filter(r => r.bucket !== 'expired')

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-gray-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-yellow-600" /> Students
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Enrolled students and renewal tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => tab === 'active' ? loadStudents() : loadRenewals()}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <RotateCcw size={15} />
          </button>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-yellow-400 text-sm font-bold hover:bg-gray-900 transition-colors shadow-sm">
            <Plus size={14} /> Add student
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {([
          ['active',   'Active', stats.total],
          ['expiring', 'Expiring', renewals.length],
        ] as const).map(([t, label, count]) => (
          <button key={t} onClick={() => router.replace(`/sales/students?tab=${t}`)}
            className={`px-4 py-2.5 text-[13px] font-bold border-b-2 transition-colors ${
              tab === t
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {label}
            {count > 0 && (
              <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded font-bold ${
                t === 'expiring' && count > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Active tab ─────────────────────────────────── */}
      {tab === 'active' && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatTile icon={Users}         label="Total"   value={stats.total}   color="bg-yellow-50 text-yellow-600" />
            <StatTile icon={BookOpen}      label="Course"  value={stats.course}  color="bg-blue-50 text-blue-600" />
            <StatTile icon={Calendar}      label="Private" value={stats.private} color="bg-purple-50 text-purple-600" />
            <StatTile icon={AlertTriangle} label="Overdue" value={stats.overdue} color="bg-rose-50 text-rose-600" />
          </section>

          {upcoming.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
              <AlertTriangle size={15} className="text-orange-600 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-orange-800">
                {upcoming.length} private student{upcoming.length > 1 ? 's have' : ' has'} a payment due in the next 14 days.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search name, phone, notes…" onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {([['all', 'All'], ['course_student', 'Course'], ['private_student', 'Private']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${typeFilter === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="ml-auto text-xs text-gray-400 font-semibold">{students.length} students</div>
          </div>

          {loadingS ? (
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
        </>
      )}

      {/* ── Expiring tab ───────────────────────────────── */}
      {tab === 'expiring' && (
        <>
          {loadingR ? (
            <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
          ) : renewals.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
              <BellRing size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-semibold">No expiring subscriptions.</p>
              <p className="text-xs text-gray-400 mt-1">Students within 30 days of expiry appear here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {expired.length > 0 && (
                <RenewalGroup title="Already expired" accent="rose" rows={expired} />
              )}
              {expiring.length > 0 && (
                <RenewalGroup title="Expiring soon" accent="amber" rows={expiring} />
              )}
            </div>
          )}
        </>
      )}

      {selected && (
        <StudentDetailDrawer student={selected} onClose={() => setSelected(null)} onChange={() => { loadStudents(); setSelected(null) }} />
      )}
      {addOpen && (
        <AddStudentDrawer onClose={() => setAddOpen(false)} onCreated={() => { loadStudents(); setAddOpen(false) }} />
      )}
    </div>
  )
}

/* ─── RenewalGroup ───────────────────────────────────────────── */
function RenewalGroup({ title, accent, rows }: { title: string; accent: 'rose' | 'amber'; rows: RenewalRow[] }) {
  const header = accent === 'rose'
    ? 'bg-rose-50 border-rose-200'
    : 'bg-amber-50 border-amber-200'
  const text = accent === 'rose' ? 'text-rose-700' : 'text-amber-700'
  return (
    <div>
      <div className={`flex items-center justify-between px-4 py-2 rounded-t-2xl border-x border-t ${header}`}>
        <span className={`text-[12px] font-bold uppercase tracking-wide ${text}`}>{title}</span>
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${text}`}>{rows.length}</span>
      </div>
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-2xl divide-y divide-gray-100 overflow-hidden">
        {rows.map(r => <RenewalRow key={r.id} row={r} accent={accent} />)}
      </div>
    </div>
  )
}

function RenewalRow({ row: r, accent }: { row: RenewalRow; accent: 'rose' | 'amber' }) {
  const wa = whatsappLink(null)
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        accent === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
      }`}>
        <BellRing size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-gray-900 truncate">{r.full_name ?? r.email ?? '—'}</div>
        <div className="text-[11px] text-gray-400 truncate">
          {r.plan} ·{' '}
          <span className={`font-bold ${accent === 'rose' ? 'text-rose-600' : 'text-amber-600'}`}>
            {r.bucket === 'expired'
              ? `Expired ${Math.abs(r.daysUntilExpiry)}d ago`
              : `Expires in ${r.daysUntilExpiry}d`}
          </span>
        </div>
      </div>
      <ArrowRight size={13} className="text-gray-300" />
    </div>
  )
}

/* ─── StudentRow (unchanged) ─────────────────────────────────── */
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
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
          isPrivate ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>{isPrivate ? 'Private' : 'Course'}</span>
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
          s.payment_status === 'paid'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          s.payment_status === 'overdue'? 'bg-red-50 text-red-700 border-red-200' :
          'bg-orange-50 text-orange-700 border-orange-200'
        }`}>{s.payment_status}</span>
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

/* ─── helpers ────────────────────────────────────────────────── */
function StatTile({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}><Icon size={14} /></div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-0.5">{label}</div>
      <div className="text-2xl font-black text-gray-900 tabular-nums">{value}</div>
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>}>
      <StudentsInner />
    </Suspense>
  )
}
