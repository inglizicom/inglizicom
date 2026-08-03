'use client'

import { useEffect, useState } from 'react'
import {
  Award, BadgeCheck, BookOpen, Camera, CalendarClock, Clock, Flame, GraduationCap,
  Image as ImageIcon, Languages, Loader2, MessageSquareQuote, Pencil, ShieldCheck,
  Sparkles, Star, Trophy, Users, Video, XCircle,
} from 'lucide-react'
import { useTeacher } from '@/lib/teacher-context'
import {
  fetchTeacherProfileFull, uploadTeacherAvatar, uploadTeacherCover,
  type TeacherProfileFull,
} from '@/lib/teachers'
import { Donut, HBars, Ring, VIZ } from '../_charts'
import { Card, Empty, Pill, SectionTitle, Stars, fmtTime, STATUS_AR } from '../_ui'
import ProfileEditor from './ProfileEditor'

/**
 * The tutor page. Two kinds of block, kept visually distinct on purpose:
 * declared blocks carry a pencil and are the teacher's own claims; computed
 * blocks carry no editing affordance at all, because they come from rows.
 */
export default function TeacherProfilePage() {
  const teacher = useTeacher()
  const [full, setFull]       = useState<TeacherProfileFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [busyCover, setBusyCover] = useState(false)
  const [busyAvatar, setBusyAvatar] = useState(false)

  async function load() {
    const f = await fetchTeacherProfileFull(teacher.id)
    setFull(f); setLoading(false)
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [teacher.id])

  if (loading) {
    return <div className="py-32 flex justify-center text-stone-400"><Loader2 size={20} className="animate-spin" /></div>
  }
  if (!full) {
    return <Card className="p-10 text-center font-black text-stone-600">تعذّر تحميل الملف الشخصي.</Card>
  }

  const p = full.profile
  const s = full.stats
  const name = p.display_name || full.identity.full_name || 'أستاذ'

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBusyCover(true); await uploadTeacherCover(teacher.id, f); await load(); await teacher.refresh(); setBusyCover(false)
  }
  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBusyAvatar(true); await uploadTeacherAvatar(teacher.id, f); await load(); await teacher.refresh(); setBusyAvatar(false)
  }

  return (
    <div className="space-y-5">

      {/* ═══ Identity ═══════════════════════════════════ */}
      <Card className="overflow-hidden">
        {/* Cover */}
        <div className="relative h-40 sm:h-52 bg-gradient-to-l from-indigo-900 via-violet-800 to-fuchsia-700 overflow-hidden">
          {p.cover_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <label className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur text-white text-[11.5px] font-bold cursor-pointer hover:bg-black/60 transition">
            {busyCover ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
            تغيير الغلاف
            <input type="file" accept="image/*" hidden onChange={onCover} />
          </label>

          {s.is_top_rated && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-stone-900 text-[12px] font-black shadow-lg">
              <Trophy size={13} /> أستاذ متميّز
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 pb-6 -mt-14 relative">
          <div className="flex flex-wrap items-end gap-5">
            <div className="relative">
              {p.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatar_url} alt="" className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
                : <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black">
                    {name.trim().charAt(0)}
                  </div>}
              <label className="absolute -bottom-1 -left-1 w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow cursor-pointer hover:bg-stone-700 transition">
                {busyAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <input type="file" accept="image/*" hidden onChange={onAvatar} />
              </label>
            </div>

            <div className="flex-1 min-w-[15rem] pb-1">
              <h1 className="font-display text-[30px] sm:text-[38px] font-black tracking-tight leading-none">{name}</h1>
              <p className="text-[15px] font-bold text-violet-700 mt-2">
                {p.tagline || 'أضف جملة تصف ما تُتقنه أكثر'}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <Stars value={s.rating_avg} size={15} />
                  <span className="text-[14px] font-black tabular-nums">
                    {s.rating_count ? Number(s.rating_avg).toFixed(1) : '—'}
                  </span>
                  <span className="text-[12.5px] text-stone-400 font-semibold">
                    {s.rating_count ? `(${s.rating_count} تقييم)` : 'لا تقييمات بعد'}
                  </span>
                </div>
                {p.english_level && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-black">
                    <Languages size={12} /> الإنجليزية {p.english_level}
                  </span>
                )}
                {p.years_experience != null && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-black">
                    <Clock size={12} /> {p.years_experience} سنوات خبرة
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="mb-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-[13px] font-black hover:bg-stone-800 transition"
            >
              <Pencil size={15} /> تعديل الملف
            </button>
          </div>
        </div>
      </Card>

      {/* ═══ Headline numbers ═══════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Users}        tone="violet" label="إجمالي الطلاب"  value={s.students_total} sub={`${s.students_active} نشط`} />
        <Stat icon={GraduationCap} tone="blue"  label="حصص أُنجزت"     value={s.classes_done}   sub={`${s.hours_total} ساعة`} />
        <Stat icon={BadgeCheck}   tone="emerald" label="امتحانات صُحّحت" value={s.exams_corrected} sub={`${s.exams_passed} ناجح`} />
        <Stat icon={Star}         tone="amber"  label="التقييم"        value={s.rating_count ? Number(s.rating_avg).toFixed(1) : '—'} sub={`${s.rating_count} تقييم`} />
      </div>

      {/* ═══ Bio + competences ══════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <SectionTitle>نبذة</SectionTitle>
          <p className="text-[14.5px] leading-[1.9] text-stone-600 whitespace-pre-wrap">
            {p.bio || 'لا نبذة بعد — اضغط «تعديل الملف».'}
          </p>

          {p.competences.length > 0 && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <h3 className="text-[13px] font-black text-stone-500 mb-2.5">المهارات والكفاءات</h3>
              <div className="flex flex-wrap gap-2">
                {p.competences.map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-800 text-[12.5px] font-bold border border-violet-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionTitle>ماذا يُدرّس</SectionTitle>
          <div className="space-y-4">
            {p.levels.length > 0 && (
              <div>
                <h3 className="text-[12px] font-black text-stone-400 mb-2">المستويات</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.levels.map(l => (
                    <span key={l} className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[12px] font-black">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {p.teaches.length > 0 && (
              <div>
                <h3 className="text-[12px] font-black text-emerald-700 mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> يُدرّس
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.teaches.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[12px] font-bold border border-emerald-200">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {p.not_teaches.length > 0 && (
              <div>
                <h3 className="text-[12px] font-black text-stone-400 mb-2 flex items-center gap-1.5">
                  <XCircle size={13} /> لا يُدرّس
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.not_teaches.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500 text-[12px] font-bold line-through">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {(p.age_min || p.age_max) && (
              <div className="pt-3 border-t border-stone-100">
                <h3 className="text-[12px] font-black text-stone-400 mb-1">الفئة العمرية</h3>
                <p className="text-[15px] font-black">
                  {p.age_min ?? '—'} – {p.age_max ?? '—'} سنة
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ═══ Who he actually teaches — computed ═════════ */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="p-5">
          <SectionTitle>طلابي حسب الجنس</SectionTitle>
          <Donut data={[
            { label: 'ذكور', value: full.gender_split.male },
            { label: 'إناث', value: full.gender_split.female },
            { label: 'غير محدد', value: full.gender_split.unknown },
          ]} />
        </Card>

        <Card className="p-5">
          <SectionTitle action={full.avg_age ? <span className="text-[11.5px] font-bold text-stone-400">المتوسط {full.avg_age} سنة</span> : undefined}>
            الأعمار
          </SectionTitle>
          {full.age_bands.length > 0
            ? <HBars data={full.age_bands.map(b => ({ label: b.band, value: b.count }))} color="#7c3aed" />
            : <p className="py-8 text-center text-[12.5px] font-bold text-stone-300">
                أضف سنة ميلاد الطلاب في الـCRM ليظهر هذا الرسم.
              </p>}
        </Card>

        <Card className="p-5">
          <SectionTitle>المستويات</SectionTitle>
          <HBars data={full.level_split.map(l => ({ label: l.level, value: l.count }))} color={VIZ.amber} />
        </Card>
      </div>

      {/* ═══ Weekly schedule ════════════════════════════ */}
      <Card className="p-5 sm:p-6">
        <SectionTitle action={<span className="text-[11.5px] font-bold text-stone-400">الأسبوعان القادمان</span>}>
          <span className="flex items-center gap-2"><CalendarClock size={17} className="text-blue-600" /> جدول الحصص</span>
        </SectionTitle>

        {full.upcoming.length === 0 ? (
          <Empty icon={CalendarClock} title="لا حصص مبرمجة" hint="الحصص التي تبرمجها تظهر هنا بتوقيتها وعنوانها." />
        ) : (
          <div className="space-y-2">
            {full.upcoming.map(u => (
              <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl border border-stone-200 hover:border-blue-300 transition">
                <div className="w-16 text-center shrink-0 py-1 rounded-lg bg-blue-50">
                  <div className="text-[10.5px] font-bold text-blue-500">
                    {new Date(u.starts_at).toLocaleDateString('ar-MA', { weekday: 'short' })}
                  </div>
                  <div className="text-[15px] font-black text-blue-900 tabular-nums leading-tight">{fmtTime(u.starts_at)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[14.5px] truncate">{u.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Pill tone="muted">{STATUS_AR[u.mode]}</Pill>
                    {u.level && <Pill tone="muted">{u.level}</Pill>}
                    <span className="text-[11.5px] font-bold text-stone-400">{u.duration_min} دقيقة</span>
                  </div>
                </div>
                {u.meeting_url && (
                  <a href={u.meeting_url} target="_blank" rel="noopener noreferrer"
                     className="p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition shrink-0" aria-label="دخول">
                    <Video size={15} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ═══ Top students ═══════════════════════════════ */}
      <Card className="p-5 sm:p-6">
        <SectionTitle action={<span className="text-[11.5px] font-bold text-stone-400">حسب النقاط والمواظبة والامتحانات</span>}>
          <span className="flex items-center gap-2"><Trophy size={17} className="text-amber-500" /> أبرز طلابي</span>
        </SectionTitle>

        {full.top_students.length === 0 ? (
          <Empty icon={Users} title="لا طلاب مسنَدين بعد" hint="تُسنِد الإدارة الطلاب إليك، وتظهر نتائجهم هنا تلقائياً." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[34rem]">
              <thead>
                <tr className="text-[11px] font-black text-stone-400 border-b border-stone-200">
                  <th className="text-right pb-2">#</th>
                  <th className="text-right pb-2">الطالب</th>
                  <th className="text-center pb-2">المستوى</th>
                  <th className="text-center pb-2">النقاط</th>
                  <th className="text-center pb-2">المواظبة</th>
                  <th className="text-center pb-2">امتحانات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {full.top_students.slice(0, 8).map((st, i) => (
                  <tr key={st.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5">
                      <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-[11px] font-black ${
                        i === 0 ? 'bg-amber-400 text-stone-900'
                        : i === 1 ? 'bg-stone-300 text-stone-800'
                        : i === 2 ? 'bg-orange-300 text-stone-900'
                        : 'bg-stone-100 text-stone-500'}`}>{i + 1}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        {st.avatar_url
                          ? /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={st.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          : <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-black text-[12px]">
                              {st.name.trim().charAt(0)}
                            </div>}
                        <span className="font-bold text-[13.5px] truncate">{st.name}</span>
                      </div>
                    </td>
                    <td className="text-center text-[12px] font-bold text-stone-500">{st.level ?? '—'}</td>
                    <td className="text-center font-black tabular-nums text-amber-700">{st.coins}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-1 font-black tabular-nums text-orange-600">
                        <Flame size={12} /> {st.streak}
                      </span>
                    </td>
                    <td className="text-center font-black tabular-nums text-emerald-700">{st.exams_passed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ═══ Qualifications ═════════════════════════════ */}
      {(p.certificates.length > 0 || p.experiences.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-3">
          {p.certificates.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionTitle><span className="flex items-center gap-2"><Award size={17} className="text-amber-600" /> الشهادات</span></SectionTitle>
              <div className="space-y-3">
                {p.certificates.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-[13.5px]">{c.title}</div>
                      <div className="text-[12px] text-stone-500 font-semibold">
                        {[c.issuer, c.year].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {p.experiences.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionTitle><span className="flex items-center gap-2"><BookOpen size={17} className="text-blue-600" /> الخبرات</span></SectionTitle>
              <div className="relative pr-4">
                <div className="absolute right-1 top-2 bottom-2 w-px bg-stone-200" aria-hidden />
                <div className="space-y-4">
                  {p.experiences.map((e, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -right-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" aria-hidden />
                      <div className="font-black text-[13.5px]">{e.role}</div>
                      <div className="text-[12px] text-stone-500 font-bold">
                        {[e.org, [e.from, e.to].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
                      </div>
                      {e.description && <p className="text-[12.5px] text-stone-500 mt-1 leading-relaxed">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ═══ What students like ═════════════════════════ */}
      {p.liked_qualities.length > 0 && (
        <Card className="p-5 sm:p-6">
          <SectionTitle><span className="flex items-center gap-2"><Sparkles size={17} className="text-fuchsia-600" /> ما يحبه الطلاب</span></SectionTitle>
          <div className="flex flex-wrap gap-2">
            {p.liked_qualities.map((q, i) => (
              <span key={q} className={`px-3.5 py-2 rounded-xl text-[13px] font-bold border ${
                ['bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
                 'bg-blue-50 text-blue-800 border-blue-200',
                 'bg-emerald-50 text-emerald-800 border-emerald-200',
                 'bg-amber-50 text-amber-800 border-amber-200'][i % 4]}`}>
                {q}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* ═══ Testimonials ═══════════════════════════════ */}
      <div id="reviews">
        <SectionTitle><span className="flex items-center gap-2"><MessageSquareQuote size={17} className="text-violet-600" /> آراء الطلاب</span></SectionTitle>
        <Card className="p-5 sm:p-6">
          {full.testimonials.length === 0 ? (
            <Empty icon={MessageSquareQuote} title="لا تقييمات بعد"
                   hint="يظهر هنا رأي كل طالب بعد أن يقيّمك من فضائه الخاص." />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-7 items-center pb-5 border-b border-stone-100">
                <div className="text-center">
                  <div className="text-[42px] font-black leading-none tabular-nums">{Number(s.rating_avg).toFixed(1)}</div>
                  <Stars value={s.rating_avg} size={15} />
                  <div className="text-[12px] text-stone-400 font-semibold mt-1">{s.rating_count} تقييم</div>
                </div>
                <div className="flex-1 min-w-[12rem] space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const n   = full.rating_breakdown[String(star)] ?? 0
                    const pct = s.rating_count ? Math.round((n / s.rating_count) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="text-[11.5px] font-bold text-stone-400 w-3 tabular-nums">{star}</span>
                        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11.5px] font-bold text-stone-400 w-8 tabular-nums text-left">{n}</span>
                      </div>
                    )
                  })}
                </div>
                {s.attendance_rate != null && (
                  <div className="text-center">
                    <Ring pct={s.attendance_rate} label="حضور" size={84} color="#7c3aed" />
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {full.testimonials.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-white border border-violet-100">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-black text-[12px]">
                          {(t.student_name ?? 'ط').trim().charAt(0)}
                        </div>
                        <span className="font-black text-[13px]">{t.student_name ?? 'طالب'}</span>
                      </div>
                      <Stars value={t.rating} size={12} />
                    </div>
                    {t.comment && <p className="text-[13.5px] text-stone-600 leading-relaxed">{t.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {editing && (
        <ProfileEditor
          teacherId={teacher.id}
          profile={p}
          onClose={() => setEditing(false)}
          onSaved={async () => { setEditing(false); await load(); await teacher.refresh() }}
        />
      )}
    </div>
  )
}

/* ── Stat tile ───────────────────────────────────────── */

function Stat({
  icon: Icon, label, value, sub, tone,
}: {
  icon: typeof Users; label: string; value: React.ReactNode; sub?: string
  tone: 'violet' | 'blue' | 'emerald' | 'amber'
}) {
  const tones = {
    violet:  'from-violet-500 to-fuchsia-500',
    blue:    'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber:   'from-amber-400 to-orange-500',
  }
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold text-stone-400 truncate">{label}</div>
        <div className="text-[24px] font-black leading-tight tabular-nums">{value}</div>
        {sub && <div className="text-[11px] text-stone-400 font-semibold truncate">{sub}</div>}
      </div>
    </Card>
  )
}
