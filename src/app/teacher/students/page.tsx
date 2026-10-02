'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Loader2, MessageCircle, Search, Users, ShieldCheck, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  fetchMyStudents, fetchTeacherOverview,
  type MyStudent, type MyStudentClass, type TeacherRosterCounts,
} from '@/lib/teachers'
import { Card, DemoBanner, Empty, PageHero, Pill } from '../_ui'
import { DEMO_OVERVIEW, DEMO_STUDENTS, isTeacherDemo } from '../_demo'

type Rel = 'assigned' | 'class' | 'both'
const REL_AR: Record<Rel, string> = { assigned: 'مسنَد إليك', class: 'في أحد أقسامك', both: 'مسنَد + في أقسامك' }
const SEAT_AR: Record<MyStudentClass['status'], string> = {
  active: 'نشط', waitlisted: 'قائمة انتظار', completed: 'أنهى', cancelled: 'ملغى',
}
const COURSE_AR = { active: 'نشط', completed: 'مكتمل' } as const

/** Older API rows (before migration 051) carry `assigned` and active `classes` only. */
function relationOf(s: MyStudent): Rel {
  if (s.relationship) return s.relationship
  const seated = (s.classes ?? []).length > 0
  return s.assigned && seated ? 'both' : s.assigned ? 'assigned' : 'class'
}

/** The roster. Phone numbers arrive masked from the database — messaging goes
 *  through /api/teacher/wa, which resolves the real number server-side. Each
 *  student appears once; course enrollments and class seats are listed
 *  separately on the card, and the headline numbers come from the server. */
export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<MyStudent[]>([])
  const [counts, setCounts]     = useState<TeacherRosterCounts | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [q,        setQ]        = useState('')
  const [rel,      setRel]      = useState<'all' | Rel>('all')
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    let alive = true
    if (isTeacherDemo()) {
      setDemo(true); setStudents(DEMO_STUDENTS); setCounts(DEMO_OVERVIEW.roster ?? null); setLoading(false); return
    }
    Promise.all([fetchMyStudents(), fetchTeacherOverview()]).then(([s, ov]) => {
      if (!alive) return
      setStudents(s); setCounts(ov?.roster ?? null); setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return students.filter(s => {
      if (rel !== 'all' && relationOf(s) !== rel) return false
      if (!needle) return true
      return s.full_name.toLowerCase().includes(needle)
        || (s.course ?? '').toLowerCase().includes(needle)
        || (s.courses ?? []).some(c => c.title.toLowerCase().includes(needle))
        || (s.class_memberships ?? s.classes ?? []).some(c => c.title.toLowerCase().includes(needle))
    })
  }, [students, q, rel])

  const relCount = (r: Rel) => students.filter(s => relationOf(s) === r).length

  async function message(student: MyStudent) {
    if (demo) return
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
    <div className="space-y-4">
      {demo && <DemoBanner />}

      <PageHero
        icon={Users} tone="violet" title="طلابي"
        subtitle="المسنَدون إليك والمسجّلون في أقسامك — كل طالب مرة واحدة، أرقام الهاتف محجوبة"
        stats={counts ? [
          { label: 'طالب (فريد)',            value: counts.unique_students },
          { label: 'مسنَدون من الإدارة',      value: counts.assigned_students },
          { label: 'في دورة نشطة',           value: counts.course_students },
          { label: 'في أقسامي المباشرة',      value: counts.class_students },
          { label: 'مقاعد نشطة في أقسامي',    value: counts.class_seats },
        ] : [
          { label: 'إجمالي', value: students.length },
          { label: 'مسنَدون', value: students.filter(s => s.assigned).length },
          { label: 'في أقسامي', value: students.filter(s => (s.classes ?? []).length > 0).length },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="ابحث باسم الطالب أو الدورة أو القسم…"
            className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-[13.5px] font-semibold
                       focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto max-w-full" role="tablist" aria-label="سبب الظهور">
          {([['all', `الكل · ${students.length}`], ['assigned', `مسنَدون فقط · ${relCount('assigned')}`],
             ['class', `في أقسامي فقط · ${relCount('class')}`], ['both', `الاثنان · ${relCount('both')}`]] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={rel === id} onClick={() => setRel(id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-[12px] font-bold transition-colors
                                ${rel === id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>
              {label}
            </button>
          ))}
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
            title={q || rel !== 'all' ? 'لا نتائج' : 'لا طلاب بعد'}
            hint={q || rel !== 'all' ? 'غيّر البحث أو الفلتر.' : 'تُسنِد الإدارة الطلاب إليك أو تسجّلهم في أقسامك من لوحة التحكم، وسيظهرون هنا مباشرة.'}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => {
            const r = relationOf(s)
            const memberships: Pick<MyStudentClass, 'class_id' | 'title' | 'mode' | 'status'>[] =
              s.class_memberships ?? (s.classes ?? []).map(c => ({ ...c, status: 'active' as const }))
            return (
              <Card key={s.id} className="p-4 flex flex-col">
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
                  <Pill tone={r === 'class' ? 'scheduled' : 'live'}>{REL_AR[r]}</Pill>
                  {!s.is_active && <Pill tone="cancelled">غير نشط</Pill>}
                </div>

                <Section icon={BookOpen} title="الدورات">
                  {s.courses === undefined ? (
                    <span className="text-[12px] text-stone-400 font-semibold">{s.course ?? '—'}</span>
                  ) : s.courses.length === 0 ? (
                    <span className="text-[12px] text-stone-400 font-semibold">غير مسجّل في أي دورة</span>
                  ) : s.courses.map(c => (
                    <Row key={c.course_id} title={c.title} status={COURSE_AR[c.status]} faded={c.status !== 'active'} />
                  ))}
                </Section>

                <Section icon={Video} title="أقسامي المباشرة">
                  {memberships.length === 0 ? (
                    <span className="text-[12px] text-stone-400 font-semibold">ليس في أي من أقسامك</span>
                  ) : memberships.map(m => (
                    <Row key={m.class_id} title={m.title} mode={m.mode === 'private' ? 'فردي' : 'جماعي'}
                         status={SEAT_AR[m.status]} faded={m.status !== 'active'} />
                  ))}
                </Section>

                <div className="mt-auto pt-3.5">
                  <button
                    onClick={() => message(s)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] font-bold hover:bg-emerald-100 transition"
                  >
                    <MessageCircle size={15} /> مراسلة على واتساب
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-stone-400 mb-1.5">
        <Icon size={12} /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ title, mode, status, faded }: { title: string; mode?: string; status: string; faded?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[12.5px] ${faded ? 'text-stone-400' : 'text-stone-700'}`}>
      <span className="flex-1 min-w-0 truncate font-semibold">{title}</span>
      {mode && <span className="shrink-0 text-[11px] font-bold text-stone-500 bg-stone-100 rounded-md px-1.5 py-0.5">{mode}</span>}
      <span className={`shrink-0 text-[11px] font-bold rounded-md px-1.5 py-0.5 ${faded ? 'bg-stone-50' : 'bg-emerald-50 text-emerald-700'}`}>{status}</span>
    </div>
  )
}
