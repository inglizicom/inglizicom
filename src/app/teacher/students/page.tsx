'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, MessageCircle, Search, Users, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchMyStudents, type MyStudent } from '@/lib/teachers'
import { Card, Empty, Pill } from '../_ui'

/** The roster. Phone numbers arrive masked from the database — messaging goes
 *  through /api/teacher/wa, which resolves the real number server-side. */
export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<MyStudent[]>([])
  const [loading,  setLoading]  = useState(true)
  const [q,        setQ]        = useState('')

  useEffect(() => {
    let alive = true
    fetchMyStudents().then(s => { if (alive) { setStudents(s); setLoading(false) } })
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return students
    return students.filter(s =>
      s.full_name.toLowerCase().includes(needle) ||
      (s.course ?? '').toLowerCase().includes(needle))
  }, [students, q])

  async function message(student: MyStudent) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const text = `مرحباً ${student.full_name.split(' ')[0]}،`
    window.open(
      `/api/teacher/wa/${student.id}?t=${encodeURIComponent(token)}&text=${encodeURIComponent(text)}`,
      '_blank', 'noopener',
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-black tracking-tight">طلابي</h1>
          <p className="text-stone-500 text-sm font-semibold mt-0.5">
            {students.length} طالب مسنَد إليك
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="ابحث باسم الطالب…"
            className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[13.5px] font-semibold
                       focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
          />
        </div>
      </div>

      {/* Why the number is hidden — say it once, plainly. */}
      <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-stone-500 bg-stone-100/70 border border-stone-200 rounded-xl px-4 py-2.5">
        <ShieldCheck size={15} className="text-stone-400 shrink-0" />
        أرقام الهاتف محجوبة لحماية الطلاب — زر واتساب يفتح المحادثة مباشرة دون إظهار الرقم.
      </div>

      {loading ? (
        <div className="py-24 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Empty
            icon={Users}
            title={q ? 'لا نتائج' : 'لا طلاب بعد'}
            hint={q ? 'جرّب اسماً آخر.' : 'تُسنِد الإدارة الطلاب إليك من لوحة التحكم، وسيظهرون هنا مباشرة.'}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-3">
                {s.avatar_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={s.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                  : <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center font-black text-lg">
                      {s.full_name.trim().charAt(0)}
                    </div>}
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[15px] truncate">{s.full_name}</div>
                  <div className="text-[12px] text-stone-400 font-semibold truncate" dir="ltr">
                    {s.phone_masked ?? '—'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {s.course && <Pill tone="muted">{s.course}</Pill>}
                <Pill tone={s.student_type === 'private_student' ? 'scheduled' : 'muted'}>
                  {s.student_type === 'private_student' ? 'فردي' : 'دورة'}
                </Pill>
                {!s.is_active && <Pill tone="cancelled">غير نشط</Pill>}
              </div>

              <button
                onClick={() => message(s)}
                className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition"
              >
                <MessageCircle size={15} /> مراسلة على واتساب
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
