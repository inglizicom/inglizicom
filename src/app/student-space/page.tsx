'use client'

import { useState } from 'react'
import {
  GraduationCap, Loader2, KeyRound, BookOpen, FileText, Download,
  ListChecks, CheckCircle2, Circle, ExternalLink, Sparkles, LogOut, TrendingUp,
} from 'lucide-react'
import { fetchStudentSpace, fileUrl, type StudentSpace } from '@/lib/student-portal'

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const fmtSize = (b?: number | null) =>
  !b ? '' : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

export default function StudentSpacePage() {
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [space, setSpace]     = useState<StudentSpace | null>(null)
  const [error, setError]     = useState('')

  async function enter(e?: React.FormEvent) {
    e?.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    const res = await fetchStudentSpace(code)
    if (!res.found) { setError('رمز الدخول غير صحيح. تأكد من الرمز أو تواصل مع الإدارة.'); setSpace(null) }
    else setSpace(res)
    setLoading(false)
  }

  function logout() { setSpace(null); setCode(''); setError('') }

  /* ── Login screen ───────────────────────────────────── */
  if (!space?.found) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#14161c] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-2xl mb-3">I</div>
            <h1 className="text-white font-black text-[20px]">فضاء الطالب</h1>
            <p className="text-zinc-400 text-[13px] mt-1">منصة Inglizi.com لتعلّم الإنجليزية</p>
          </div>

          <form onSubmit={enter} className="bg-white rounded-2xl p-5 shadow-2xl">
            <label className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-700 mb-2">
              <KeyRound size={15} className="text-zinc-400" /> رمز الدخول
            </label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="ING-XXXXXXXX"
              dir="ltr"
              className="w-full px-4 py-3 text-[16px] font-bold tracking-widest text-center uppercase bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {error && <p className="text-[12px] text-red-600 mt-2 font-medium">{error}</p>}
            <button type="submit" disabled={loading || !code.trim()}
              className="mt-4 w-full py-3 rounded-xl bg-black text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} دخول
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3 leading-relaxed">
              ستجد رمز الدخول على وصل الدفع الخاص بك أو من إدارة Inglizi.com.
            </p>
          </form>
        </div>
      </div>
    )
  }

  /* ── Student space ──────────────────────────────────── */
  const s = space.student!
  const assignments = space.assignments ?? []
  const files       = space.files ?? []
  const stats       = space.stats ?? { done: 0, total: 0 }

  const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']
  const curLevel  = (s.current_level || s.course || 'A0').toUpperCase().replace(/[^A-C0-9]/g, '').slice(0, 2) || 'A0'
  const curIdx    = Math.max(0, LEVELS.findIndex(l => curLevel.startsWith(l)))
  const nextLevel = s.next_level || LEVELS[Math.min(curIdx + 1, LEVELS.length - 1)]
  const progress  = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const daysActive = Math.max(1, Math.round((Date.now() - new Date(s.subscription_start || s.enrollment_date).getTime()) / 86400000))

  return (
    <div dir="rtl" className="min-h-screen bg-[#f6f6f5]">
      {/* Header */}
      <header className="bg-[#14161c] text-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl">
            {s.full_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[17px] truncate">{s.full_name}</div>
            <div className="text-zinc-400 text-[12px]">
              {s.student_type === 'private_student' ? 'دروس خاصة' : 'دورة جماعية'}
              {s.course && ` · ${s.course.toUpperCase()}`}
            </div>
          </div>
          <button onClick={logout} className="text-zinc-400 hover:text-white p-2" title="خروج"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {/* Progress + level ladder */}
        <section className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900 mb-4"><TrendingUp size={16} className="text-emerald-500" /> مستواي وتقدّمي</h2>

          {/* Level ladder */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {LEVELS.map((lv, i) => (
              <div key={lv} className="flex items-center gap-1 flex-shrink-0">
                <div className={[
                  'w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black',
                  i < curIdx ? 'bg-emerald-100 text-emerald-700'
                  : i === curIdx ? 'bg-yellow-400 text-black ring-2 ring-yellow-200'
                  : 'bg-zinc-100 text-zinc-400',
                ].join(' ')}>{lv}</div>
                {i < LEVELS.length - 1 && <div className={`w-4 h-0.5 ${i < curIdx ? 'bg-emerald-300' : 'bg-zinc-200'}`} />}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-zinc-500">إكمال التمارين</span>
              <span className="font-bold text-zinc-800">{stats.done}/{stats.total} · {progress}%</span>
            </div>
            <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Info label="المستوى الحالي" value={curLevel} />
            <Info label="المستوى القادم" value={nextLevel} />
            <Info label="الأستاذ" value={s.teacher_name ?? 'الأستاذ حمزة'} />
            <Info label="أيام منذ البدء" value={`${daysActive} يوم`} />
            <Info label="تاريخ البدء" value={fmtDate(s.subscription_start ?? s.enrollment_date)} />
            <Info label={s.billing_type === 'monthly' ? 'نوع الاشتراك' : 'تاريخ الانتهاء'} value={s.billing_type === 'monthly' ? 'اشتراك شهري' : fmtDate(s.course_end_date)} />
          </div>
        </section>

        {/* Assignments */}
        <section className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900 mb-3"><ListChecks size={16} className="text-blue-500" /> التمارين المطلوبة</h2>
          {assignments.length === 0 ? (
            <p className="text-[13px] text-zinc-400 py-3 text-center">لا توجد تمارين مطلوبة حاليًا 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {assignments.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100">
                  {a.is_done ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <Circle size={18} className="text-zinc-300 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-zinc-800">{a.title}</div>
                    {a.description && <div className="text-[12px] text-zinc-500 mt-0.5">{a.description}</div>}
                    {a.link_url && (
                      <a href={a.link_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 mt-1.5">
                        ابدأ التمرين <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Files */}
        <section className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <h2 className="flex items-center gap-2 font-bold text-[15px] text-zinc-900 mb-3"><FileText size={16} className="text-rose-500" /> الملفات والمستندات</h2>
          {files.length === 0 ? (
            <p className="text-[13px] text-zinc-400 py-3 text-center">لا توجد ملفات بعد</p>
          ) : (
            <div className="space-y-2">
              {files.map(f => (
                <a key={f.id} href={fileUrl(f.file_path)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-rose-500" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-zinc-800 truncate">{f.file_name}</div>
                    <div className="text-[11px] text-zinc-400">{fmtSize(f.size_bytes)} · {fmtDate(f.created_at)}</div>
                  </div>
                  <Download size={17} className="text-zinc-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-[11px] text-zinc-400 pb-6">Inglizi.com · فضاء الطالب</p>
      </main>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 rounded-xl p-3">
      <div className="text-[11px] text-zinc-400 mb-0.5">{label}</div>
      <div className="text-[14px] font-bold text-zinc-800">{value}</div>
    </div>
  )
}
